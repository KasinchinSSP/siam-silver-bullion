import { NextResponse } from "next/server";
import { getSupabaseAnon } from "@/lib/supabase-server";
import type { LatestPricingResponse, PriceItem } from "@/types/pricing";
import { UI_TEXT } from "@/config/constants";

// Helper: แปลง object → array ตามลำดับที่กำหนด (ถ้าต้องการ)
function normalizePrices(
  pricesBySku: any,
  products: Array<{
    sku: string;
    title: string;
    purity: number;
    weight_oz: number;
  }>
): PriceItem[] {
  // เอาลิสต์ SKU ที่มีใน snapshot
  const snapshotSkus = Object.keys(pricesBySku || {});

  // สร้างแผนที่ products by sku
  const prodMap = new Map<
    string,
    { title: string; purity: number; weight_oz: number }
  >();
  for (const p of products)
    prodMap.set(p.sku, {
      title: p.title,
      purity: p.purity,
      weight_oz: Number(p.weight_oz),
    });

  // จัดออเดอร์: เรียงตามน้ำหนัก (มาก → น้อย) เพื่อให้อ่านง่าย
  snapshotSkus.sort((a, b) => {
    const wa = prodMap.get(a)?.weight_oz ?? 0;
    const wb = prodMap.get(b)?.weight_oz ?? 0;
    return wb - wa;
  });

  const out: PriceItem[] = [];
  for (const sku of snapshotSkus) {
    const base = pricesBySku[sku];
    const meta = prodMap.get(sku) || {
      title: sku,
      purity: base?.purity ?? 0,
      weight_oz: base?.weight_oz ?? 0,
    };
    out.push({
      sku,
      title: meta.title,
      purity: Number(meta.purity ?? base?.purity ?? 0),
      weight_oz: Number(meta.weight_oz ?? base?.weight_oz ?? 0),
      sell_ex_vat: Number(base?.sell_ex_vat ?? 0),
      sell_incl_vat: Number(base?.sell_incl_vat ?? 0),
      buy_ex_vat: Number(base?.buy_ex_vat ?? 0),
      buy_incl_vat: Number(base?.buy_incl_vat ?? 0),
      vat_rate: Number(base?.vat_rate ?? 0),
      rounding_rule: String(base?.rounding_rule ?? ""),
      premium_used_per_oz_thb: Number(base?.premium_used_per_oz_thb ?? 0),
    });
  }
  return out;
}

export async function GET() {
  try {
    const supabase = getSupabaseAnon();

    // 1) ดึง snapshot ล่าสุดจาก view (อนุญาตโดย RLS สำหรับ anon)
    const { data: snap, error: snapErr } = await supabase
      .from("v_latest_demo_snapshot")
      .select("*")
      .single();

    if (snapErr || !snap) {
      return NextResponse.json(
        { error: "SNAPSHOT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 2) เตรียม list SKU ที่มีใน snapshot เพื่อ query ชื่อสินค้า
    const pricesBySku = (snap as any).prices_by_sku || {};
    const skus = Object.keys(pricesBySku);

    // ถ้าไม่มี SKU ใดเลย
    if (skus.length === 0) {
      const resp: LatestPricingResponse = {
        effective_date: String(snap.effective_date),
        run_no: Number(snap.run_no),
        updated_at: new Date(snap.updated_at).toISOString(),
        is_demo: Boolean(snap.is_demo),
        source: "v_latest_demo_snapshot",
        xagusd_close: Number(snap.xagusd_close),
        usd_thb: Number(snap.usd_thb),
        prices: [],
        ui: {
          mode_badge: UI_TEXT.MODE_BADGE_DEMO,
          timestamp_label: UI_TEXT.TIMESTAMP_LABEL,
          disclaimer: UI_TEXT.DISCLAIMER,
        },
      };
      return NextResponse.json(resp, {
        headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
      });
    }

    // 3) ดึงข้อมูล products เพื่อเอา title/purity/weight มาแนบ
    const { data: prods, error: prodErr } = await supabase
      .from("products")
      .select("sku,title,purity,weight_oz")
      .in("sku", skus)
      .eq("status", "active");

    if (prodErr) {
      return NextResponse.json(
        { error: "PRODUCTS_QUERY_FAILED", details: prodErr.message },
        { status: 500 }
      );
    }

    const prices = normalizePrices(pricesBySku, prods || []);

    // 4) จัดรูปข้อมูลตามสัญญา API
    const resp: LatestPricingResponse = {
      effective_date: String(snap.effective_date),
      run_no: Number(snap.run_no),
      updated_at: new Date(snap.updated_at).toISOString(),
      is_demo: Boolean(snap.is_demo),
      source: "v_latest_demo_snapshot",
      xagusd_close: Number(snap.xagusd_close),
      usd_thb: Number(snap.usd_thb),
      prices,
      ui: {
        mode_badge: UI_TEXT.MODE_BADGE_DEMO,
        timestamp_label: UI_TEXT.TIMESTAMP_LABEL,
        disclaimer: UI_TEXT.DISCLAIMER,
      },
    };

    // 5) ส่งผล (ตั้ง cache เบา ๆ สำหรับ Edge/CDN)
    return NextResponse.json(resp, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=120" },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "UNEXPECTED", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
