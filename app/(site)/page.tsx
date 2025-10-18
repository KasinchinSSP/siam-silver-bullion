// app/(site)/page.tsx
import PricingHero from "@/components/PricingHero";

// --- MOCK DATA (เดโม่) ---
const MOCK = {
  header: {
    companyTh: "บริษัท สยาม ซิลเวอร์ บูลเลียน จำกัด",
    companyEn: "Siam Silver Bullion Co., Ltd.",
    effectiveDateText: "วันที่ 18 ตุลาคม 2568",
    timeText: "อัปเดตล่าสุด 02:32:08 น.",
    runNo: 20,
  },
  main: {
    buy: 57700,
    sell: 58100,
    total: 62167,
  },
  list: {
    title: "Bowins Design",
    items: [
      { label: "15 กรัม", priceInclVat: 1150 },
      { label: "50 กรัม", priceInclVat: 3480 },
      { label: "150 กรัม", priceInclVat: 9590 },
    ],
  },
  footnote: {
    effectiveDateText: "อิงข้อมูลของวันที่ 17 ตุลาคม 2568 (T‑1)",
  },
};

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <PricingHero {...MOCK} state="ready" />
    </main>
  );
}
