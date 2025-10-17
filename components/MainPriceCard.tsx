// components/MainPriceCard.tsx
import React from "react";

export type MainPriceCardProps = {
  buyInclVat: number; // บาท
  sellInclVat: number; // บาท
  totalInclVat?: number; // แสดงช่องราคากลางรวม VAT (ออปชัน)
};

function formatTHB(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export default function MainPriceCard({
  buyInclVat,
  sellInclVat,
  totalInclVat,
}: MainPriceCardProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-white text-blue-900 shadow-lg ring-1 ring-blue-100">
      <div className="grid grid-cols-2 divide-x divide-blue-50">
        {/* BUY */}
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white">
            รับซื้อ (BUY)
          </div>
          <div className="mt-3 text-4xl font-extrabold sm:text-5xl">
            {formatTHB(buyInclVat)}
          </div>
        </div>
        {/* SELL */}
        <div className="p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1 text-xs font-semibold text-white">
            ขายออก (SELL)
          </div>
          <div className="mt-3 text-4xl font-extrabold sm:text-5xl">
            {formatTHB(sellInclVat)}
          </div>
        </div>
      </div>

      {/* Total incl VAT */}
      {typeof totalInclVat === "number" && (
        <div className="pointer-events-none absolute bottom-3 right-4 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-900 shadow">
          ราคารวม VAT 7% : {formatTHB(totalInclVat)} บาท
        </div>
      )}
    </section>
  );
}
