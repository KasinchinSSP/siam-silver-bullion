// components/ProductPriceList.tsx
import React from "react";
import { formatTHBInt } from "@/lib/format";

export type ProductItem = {
  label: string; // เช่น '15 กรัม'
  priceInclVat: number; // บาท
  note?: string; // เช่น 'ราคารวมภาษี VAT 7%'
};

export type ProductPriceListProps = {
  title?: string;
  items: ProductItem[];
};

function formatTHB(n: number) {
  return n.toLocaleString("th-TH", { maximumFractionDigits: 0 });
}

export default function ProductPriceList({
  title = "รายการสินค้า",
  items,
}: ProductPriceListProps) {
  return (
    <section className="rounded-2xl bg-white/80 p-4 shadow ring-1 ring-blue-100">
      <h3 className="px-2 text-lg font-bold text-blue-900/90">{title}</h3>
      <div className="mt-2">
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-1 sm:gap-0 sm:overflow-visible">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="min-w-[220px] snap-start rounded-xl border border-blue-100 bg-white px-3 py-3 shadow-sm sm:min-w-0 sm:border-0 sm:rounded-none sm:shadow-none sm:px-2 sm:py-3 sm:border-b"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-content-center rounded-lg bg-blue-50 text-blue-700 shadow-inner">
                    <span className="text-xs font-semibold">
                      {it.label.replace(/ .*/, "")}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-blue-900">
                      {it.label}
                    </div>
                    <div className="text-xs text-blue-700/70">
                      {it.note ?? "ราคารวมภาษี VAT 7%"}
                    </div>
                  </div>
                </div>
                <div className="text-right text-lg font-bold text-blue-900">
                  {formatTHBInt(it.priceInclVat)}{" "}
                  <span className="text-sm font-medium">บาท</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
