// app/api/pricing/snapshot/heartbeat/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase-service";
import { buildPricesBySku, readEnv, type ProductRow } from "@/lib/pricing";
import { todayICTISO } from "@/lib/time";
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
    const effective_date = todayICTISO();

    // 1) อ่าน snapshot ล่าสุดของวันนี้ เพื่อใช้ค่า metal (xagusd_close)
    const { data: lastSnap, error: qErr } = await supabase
      .from("price_snapshots")
      .select("xagusd_close, usd_thb")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (qErr)
      return NextResponse.json(
        { error: "LATEST_SNAPSHOT_QUERY_FAILED", details: qErr.message },
        { status: 500 }
      );

    if (!lastSnap?.xagusd_close)
      return NextResponse.json(
        {
          error: "NO_BASE_METAL_FOR_TODAY",
          hint: "ให้รัน /metal-latest อย่างน้อย 1 รอบก่อน",
        },
        { status: 400 }
      );

    const xagusd = Number(lastSnap.xagusd_close);

    // 2) ใช้ FX ล่าสุดจริง
    const fx = await getUsdThbLatest();
    const usd_thb = fx.value;

    // 3) Products
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("sku,title,purity,weight_oz,weight_g,premium_per_oz_thb")
      .eq("status", "active");
    if (prodErr)
      return NextResponse.json(
        { error: "PRODUCTS_QUERY_FAILED", details: prodErr.message },
        { status: 500 }
      );

    // 4) คำนวณราคา
    const pricesBySku = buildPricesBySku({
      products: (products ?? []) as ProductRow[],
      xagusdClose: xagusd,
      usdThb: usd_thb,
      env,
    });

    // 5) หา run ล่าสุดของวันนี้
    const { data: runs } = await supabase
      .from("price_snapshots")
      .select("run_no, updated_at")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    const lastRun = runs && runs.length > 0 ? Number(runs[0].run_no) : 0;
    const nextRun = lastRun + 1;

    // 6) Insert snapshot
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
      updated_by: "cron:heartbeat",
    };

    const { error: insErr } = await supabase
      .from("price_snapshots")
      .insert(payload);

    if (insErr)
      return NextResponse.json(
        { error: "INSERT_FAILED", details: insErr.message },
        { status: 500 }
      );

    return NextResponse.json({
      ok: true,
      effective_date,
      run_no: nextRun,
      xagusd_close: xagusd,
      usd_thb,
      providers: { metal: "base:today-latest", fx: fx.provider },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
