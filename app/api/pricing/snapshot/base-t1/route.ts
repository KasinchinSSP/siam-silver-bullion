// app/api/pricing/snapshot/base-t1/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase-service";
import { buildPricesBySku, readEnv, type ProductRow } from "@/lib/pricing";
import { yesterdayICTISO } from "@/lib/time";
import { getXagUsdT1 } from "@/lib/providers/metalprice";
import { getUsdThbT1 } from "@/lib/providers/fx";

function isAuthorized(req: Request) {
  const admin = process.env.ADMIN_TOKEN;
  const h = req.headers;
  const isCron = h.get("x-vercel-cron") === "1";
  const token = h.get("x-admin-token");
  if (isCron) return true;
  if (admin && token && token === admin) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const supabase = getSupabaseService();
    const env = readEnv();

    // 1) เลือก effective_date = เมื่อวาน (ICT)
    const effective_date = yesterdayICTISO();

    // 2) ดึง XAGUSD (T-1) จาก MetalpriceAPI
    const xagusd_close = await getXagUsdT1(effective_date);

    // 3) ดึง USD/THB (T-1) — ชั่วคราวใช้ MOCK
    const fx = await getUsdThbT1(effective_date);
    const usd_thb = fx.value;

    // 4) โหลดสินค้า active
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("sku,title,purity,weight_oz,weight_g,premium_per_oz_thb")
      .eq("status", "active");
    if (prodErr) {
      return NextResponse.json(
        { error: "PRODUCTS_QUERY_FAILED", details: prodErr.message },
        { status: 500 }
      );
    }

    // 5) คำนวณราคาต่อ SKU
    const pricesBySku = buildPricesBySku({
      products: (products ?? []) as ProductRow[],
      xagusdClose: xagusd_close,
      usdThb: usd_thb,
      env,
    });

    // 6) หา run_no ล่าสุดของ effective_date นี้ (เดโม่)
    const { data: runs } = await supabase
      .from("price_snapshots")
      .select("run_no")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    const nextRun = runs && runs.length > 0 ? Number(runs[0].run_no) + 1 : 1;

    // 7) บันทึก snapshot
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
      updated_by:
        fx.provider === "mock" ? "cron:base-t1(mock-fx)" : "cron:base-t1",
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
      xagusd_close,
      usd_thb,
      providers: { metal: "MetalpriceAPI/historical", fx: fx.provider },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
