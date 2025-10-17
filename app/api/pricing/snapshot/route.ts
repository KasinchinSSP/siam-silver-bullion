// app/api/pricing/snapshot/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase-service";
import { buildPricesBySku, readEnv, type ProductRow } from "@/lib/pricing";

/**
 * Security: อนุญาตเฉพาะ
 * - Header `x-admin-token` ตรงกับ ADMIN_TOKEN หรือ
 * - มี Header `x-vercel-cron: 1` (ถูกเรียกจาก Vercel Cron)
 */
function isAuthorized(req: Request) {
  const admin = process.env.ADMIN_TOKEN;
  const h = req.headers;
  const isCron = h.get("x-vercel-cron") === "1";
  const token = h.get("x-admin-token");
  if (isCron) return true;
  if (admin && token && token === admin) return true;
  return false;
}

/**
 * Body JSON (ตัวเลือก):
 * {
 *   "effective_date": "2025-10-16",   // ถ้าไม่ส่ง จะใช้ T-1 (โซนเวลา Asia/Bangkok)
 *   "xagusd_close": 28.5,
 *   "usd_thb": 36.7
 * }
 */
export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = getSupabaseService();
    const env = readEnv();

    const now = new Date();
    const bangkokOffsetMs = 7 * 60 * 60 * 1000; // ICT
    const nowICT = new Date(now.getTime() + bangkokOffsetMs);
    const tMinus1ICT = new Date(nowICT.getTime() - 24 * 60 * 60 * 1000);
    const defaultEffective = tMinus1ICT.toISOString().slice(0, 10); // YYYY-MM-DD

    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const effective_date: string = body.effective_date ?? defaultEffective;
    const xagusd_close: number = Number(body.xagusd_close);
    const usd_thb: number = Number(body.usd_thb);

    if (!(xagusd_close > 0) || !(usd_thb > 0)) {
      return NextResponse.json(
        {
          error: "INVALID_INPUT",
          hint: "xagusd_close และ usd_thb ต้องเป็นเลข > 0",
        },
        { status: 400 }
      );
    }

    // 1) ดึงสินค้า active
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("sku,title,purity,weight_oz,weight_g,premium_per_oz_thb")
      .eq("status", "active");
    if (prodErr)
      return NextResponse.json(
        { error: "PRODUCTS_QUERY_FAILED", details: prodErr.message },
        { status: 500 }
      );

    // 2) สร้าง JSON ราคาต่อ SKU
    const pricesBySku = buildPricesBySku({
      products: (products ?? []) as ProductRow[],
      xagusdClose: xagusd_close,
      usdThb: usd_thb,
      env,
    });

    // 3) หา run_no ล่าสุดของ effective_date นี้ (เดโม่)
    const { data: runs } = await supabase
      .from("price_snapshots")
      .select("run_no")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    const nextRun = runs && runs.length > 0 ? Number(runs[0].run_no) + 1 : 1;

    // 4) บันทึก snapshot
    const insertPayload = {
      effective_date,
      xagusd_close,
      usd_thb,
      premium_per_oz_thb: env.premiumPerOz,
      spread_buy_sell: env.spread,
      vat_rate: env.vatRate,
      rounding_rule: env.roundingRule,
      prices_by_sku: pricesBySku as any,
      run_no: nextRun,
      is_demo: true,
      updated_by: "api:pricing/snapshot",
    };

    const { error: insErr } = await supabase
      .from("price_snapshots")
      .insert(insertPayload);
    if (insErr)
      return NextResponse.json(
        { error: "INSERT_FAILED", details: insErr.message },
        { status: 500 }
      );

    return NextResponse.json({
      ok: true,
      effective_date,
      run_no: nextRun,
      sku_count: Object.keys(pricesBySku).length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
