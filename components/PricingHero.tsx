// components/PricingHero.tsx
import React from "react";
import PriceHeader from "./PriceHeader";
import MainPriceCard from "./MainPriceCard";
import ProductPriceList, { ProductItem } from "./ProductPriceList";
import Footnote from "./Footnote";

export type PricingHeroProps = {
  header: {
    companyTh: string;
    companyEn: string;
    effectiveDateText: string;
    timeText: string;
    runNo: number;
  };
  main: { buy: number; sell: number; total?: number };
  list: { title?: string; items: ProductItem[] };
  footnote: { effectiveDateText: string; disclaimer?: string };
};

export default function PricingHero({
  header,
  main,
  list,
  footnote,
}: PricingHeroProps) {
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* ซ้าย: Header + การ์ดราคาใหญ่ */}
      <div className="flex flex-col gap-4">
        <PriceHeader {...header} />
        <MainPriceCard
          buyInclVat={main.buy}
          sellInclVat={main.sell}
          totalInclVat={main.total}
        />
      </div>

      {/* ขวา: รายการสินค้า + ฟุตโน้ต */}
      <div className="flex flex-col gap-4">
        <ProductPriceList title={list.title} items={list.items} />
        <Footnote {...footnote} />
      </div>
    </section>
  );
}
