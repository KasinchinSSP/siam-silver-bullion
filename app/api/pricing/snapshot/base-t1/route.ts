// app/api/pricing/snapshot/base-t1/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getSupabaseService } from "@/lib/supabase-service";
import { buildPricesBySku, readEnv, type ProductRow } from "@/lib/pricing";
import { yesterdayICTISO } from "@/lib/time";
import { Metal } from "@/lib/providers/metal";
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

    const effective_date = yesterdayICTISO();

    // 1) Metal T-1 via dispatcher
    const metal = await Metal.t1(effective_date);

    // 2) USDTHB T-1 (ตอนนี้ใช้ latest เป็น fallback ตาม fx.ts)
    const fx = await getUsdThbT1(effective_date);

    // 3) Products
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

    // 4) Build
    const pricesBySku = buildPricesBySku({
      products: (products ?? []) as ProductRow[],
      xagusdClose: metal.value,
      usdThb: fx.value,
      env,
    });

    // 5) Next run
    const { data: runs } = await supabase
      .from("price_snapshots")
      .select("run_no")
      .eq("effective_date", effective_date)
      .eq("is_demo", true)
      .order("run_no", { ascending: false })
      .limit(1);

    const nextRun = runs && runs.length > 0 ? Number(runs[0].run_no) + 1 : 1;

    // 6) Insert
    const insertPayload = {
      effective_date,
      xagusd_close: metal.value,
      usd_thb: fx.value,
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
      xagusd_close: metal.value,
      usd_thb: fx.value,
      providers: { metal: metal.provider, fx: fx.provider },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
