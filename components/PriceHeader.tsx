// components/PriceHeader.tsx
import React from "react";

export type PriceHeaderProps = {
  companyTh: string;
  companyEn: string;
  effectiveDateText: string; // เช่น 'วันที่ 18 ตุลาคม 2568'
  timeText: string; // เช่น 'เวลา 02:32:08 น.'
  runNo: number; // ครั้งที่ n ของวัน
};

export default function PriceHeader({
  companyTh,
  companyEn,
  effectiveDateText,
  timeText,
  runNo,
}: PriceHeaderProps) {
  return (
    <header className="w-full rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 p-6 text-white shadow-lg ring-1 ring-inset ring-white/10">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {companyTh}
          </h1>
          <p className="text-sm/5 opacity-80">{companyEn}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
          โหมดสาธิต – T‑1
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 text-sm/6 sm:grid-cols-3">
        <div className="col-span-2 flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-white/95 shadow-sm">
            <span>📅</span>
            <span>{effectiveDateText}</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-white/90 shadow-sm">
            <span>⏱</span>
            <span>{timeText}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1 rounded-md bg-white text-blue-900 px-2 py-1 text-xs font-semibold shadow-sm">
            <span>🏷</span>
            <span>ครั้งที่ {runNo}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
