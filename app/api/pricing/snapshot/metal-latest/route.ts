// app/api/pricing/snapshot/metal-latest/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase-service";
import { buildPricesBySku, readEnv, type ProductRow } from "@/lib/pricing";
import { todayICTISO } from "@/lib/time";
import { getXagUsdLatest } from "@/lib/providers/metalprice";
import { getUsdThbLatest } from "@/lib/providers/fx";

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

    // effective_date = วันนี้ (ICT) สำหรับโหมด latest
    const effective_date = todayICTISO();

    // 1) ดึง metal latest (XAGUSD)
    const xagusd = await getXagUsdLatest();

    // 2) ตรวจว่ามี FX (usd_thb) ของ "วันนี้" แล้วหรือยัง
    const { data: todayLatest, error: qErr } = await supabase
      .from("price_snapshots")
      .select("usd_thb, run_no")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    if (qErr) {
      return NextResponse.json(
        { error: "LATEST_FX_QUERY_FAILED", details: qErr.message },
        { status: 500 }
      );
    }

    let usd_thb: number;
    let providersFx: string;

    if (
      todayLatest &&
      todayLatest.length > 0 &&
      Number(todayLatest[0].usd_thb) > 0
    ) {
      // ใช้ค่า FX ที่มีอยู่แล้วใน snapshot ของวันนี้ (ไม่ดึงใหม่)
      usd_thb = Number(todayLatest[0].usd_thb);
      providersFx = "base:daily";
    } else {
      // ยังไม่มี FX ประจำวัน → ดึงครั้งแรกของวันจาก provider ที่ตั้งไว้ (frankfurter/mock)
      const fx = await getUsdThbLatest();
      usd_thb = fx.value;
      providersFx = fx.provider; // 'frankfurter' หรือ 'mock'
    }

    // 3) ดึงสินค้า active
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

    // 4) คำนวณราคาต่อ SKU
    const pricesBySku = buildPricesBySku({
      products: (products ?? []) as ProductRow[],
      xagusdClose: xagusd,
      usdThb: usd_thb,
      env,
    });

    // 5) หา run ล่าสุดของวันนี้ → คำนวณ run ถัดไป
    const { data: runs } = await supabase
      .from("price_snapshots")
      .select("run_no")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    const nextRun = runs && runs.length > 0 ? Number(runs[0].run_no) + 1 : 1;

    // 6) บันทึก snapshot
    const payload = {
      effective_date,
      xagusd_close: xagusd,
      usd_thb,
      premium_per_oz_thb: env.premiumPerOz,
      spread_buy_sell: env.spread,
      vat_rate: env.vatRate,
      rounding_rule: env.roundingRule,
      prices_by_sku: pricesBySku as any,
      run_no: nextRun,
      is_demo: true,
      updated_by: "cron:metal-latest",
    };

    const { error: insErr } = await supabase
      .from("price_snapshots")
      .insert(payload);
    if (insErr) {
      return NextResponse.json(
        { error: "INSERT_FAILED", details: insErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      effective_date,
      run_no: nextRun,
      xagusd_close: xagusd,
      usd_thb,
      providers: { metal: "metalprice/latest", fx: providersFx },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
