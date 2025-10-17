// components/ProductPriceList.tsx
import React from "react";

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
      <ul className="mt-2 divide-y divide-blue-100">
        {items.map((it, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between gap-4 px-2 py-3"
          >
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
              {formatTHB(it.priceInclVat)}{" "}
              <span className="text-sm font-medium">บาท</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
