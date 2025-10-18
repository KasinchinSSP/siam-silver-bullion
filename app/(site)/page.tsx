import PricingHero from "@/components/PricingHero";
import { headers } from "next/headers";

// fallback (ใช้เดิมกรณี API ล่ม)
const MOCK = {
  header: {
    companyTh: "บริษัท สยาม ซิลเวอร์ บูลเลียน จำกัด",
    companyEn: "Siam Silver Bullion Co., Ltd.",
    effectiveDateText: "—",
    timeText: "—",
    runNo: 0,
  },
  main: { buy: 0, sell: 0, total: 0 },
  list: {
    title: "SSB Products",
    items: [] as Array<{ label: string; priceInclVat: number }>,
  },
  footnote: { effectiveDateText: "—" },
};

export default async function HomePage() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const url = `${proto}://${host}/api/pricing/latest`;

  let data: any = null;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      next: { revalidate: 0 },
    });
    if (res.ok) data = await res.json();
  } catch (_) {}

  // ถ้า API พังให้ใช้ MOCK
  if (!data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <PricingHero {...MOCK} state="error" />
      </main>
    );
  }

  // แปลงโครงข้อมูลจาก API → props ของ PricingHero
  const effectiveDateText =
    data.ui?.effectiveDateTh ?? data.effective_date ?? "—";
  const timeText = data.ui?.timeTh ?? data.updated_at ?? "—";
  const runNo = Number(data.run_no ?? 0);

  // เลือก SKU หลัก (ถ้ามี 1kg ใช้อันนั้น มิฉะนั้นใช้ตัวแรก)
  const prices: any[] = Array.isArray(data.prices) ? data.prices : [];
  const pick = prices.find((p) => p.sku === "BAR-1KG-9999") ||
    prices[0] || { buy_incl_vat: 0, sell_incl_vat: 0 };

  const listItems = prices.slice(0, 8).map((p) => ({
    label: p.title || p.sku,
    priceInclVat: Number(p.sell_incl_vat ?? 0),
  }));

  const props = {
    header: {
      companyTh: "บริษัท สยาม ซิลเวอร์ บูลเลียน จำกัด",
      companyEn: "Siam Silver Bullion Co., Ltd.",
      effectiveDateText,
      timeText,
      runNo,
    },
    main: {
      buy: Math.round(Number(pick.buy_incl_vat ?? 0)),
      sell: Math.round(Number(pick.sell_incl_vat ?? 0)),
      total: Math.round(Number(pick.sell_incl_vat ?? 0)),
    },
    list: { title: "SSB Products", items: listItems },
    footnote: { effectiveDateText: data.ui?.t1NoteTh ?? "" },
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PricingHero {...props} state="ready" />
    </main>
  );
}
