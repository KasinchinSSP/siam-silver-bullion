// components/PricingHero.tsx
import React from "react";
import PriceHeader from "./PriceHeader";
import MainPriceCard from "./MainPriceCard";
import ProductPriceList, { ProductItem } from "./ProductPriceList";
import Footnote from "./Footnote";
import LoadingSkeleton from "./LoadingSkeleton";
import ErrorCard from "./ErrorCard";

export type PricingHeroProps = {
  header: {
    companyTh: string;
    companyEn: string;
    effectiveDateText: string;
    timeText: string;
    runNo: number;
  };
  main: {
    buy: number;
    sell: number;
    total?: number;
  };
  list: {
    title?: string;
    items: ProductItem[];
  };
  footnote: {
    effectiveDateText: string;
    disclaimer?: string;
  };
  /** สถานะการโหลดข้อมูล */
  state?: "ready" | "loading" | "error";
  /** ข้อความแสดงเมื่อเกิดข้อผิดพลาด (ถ้า state = 'error') */
  errorMessage?: string;
};

export default function PricingHero(props: PricingHeroProps) {
  const { header, main, list, footnote, state = "ready", errorMessage } = props;

  // สถานะระหว่างโหลด
  if (state === "loading") return <LoadingSkeleton />;

  // สถานะผิดพลาด
  if (state === "error") return <ErrorCard message={errorMessage} />;

  // เนื้อหาปกติ
  return (
    <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {/* ซ้าย: Header + การ์ดราคาใหญ่ */}
      <div className="flex flex-col gap-4">
        <PriceHeader
          companyTh={header.companyTh}
          companyEn={header.companyEn}
          effectiveDateText={header.effectiveDateText}
          timeText={header.timeText}
          runNo={header.runNo}
        />

        <MainPriceCard
          buyInclVat={main.buy}
          sellInclVat={main.sell}
          totalInclVat={typeof main.total === "number" ? main.total : undefined}
        />
      </div>

      {/* ขวา: รายการสินค้า + ฟุตโน้ต */}
      <div className="flex flex-col gap-4">
        <ProductPriceList title={list.title} items={list.items} />
        <Footnote
          effectiveDateText={footnote.effectiveDateText}
          disclaimer={footnote.disclaimer}
        />
      </div>
    </section>
  );
}
