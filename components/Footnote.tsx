// components/Footnote.tsx
import React from "react";

export type FootnoteProps = {
  effectiveDateText: string;
  disclaimer?: string;
};

export default function Footnote({
  effectiveDateText,
  disclaimer = "ราคานี้เป็น T‑1 Snapshot เพื่อการสาธิต",
}: FootnoteProps) {
  return (
    <div className="rounded-xl border border-blue-100 bg-white/70 p-3 text-xs text-blue-900/80">
      <div className="font-medium">{effectiveDateText}</div>
      <div className="opacity-80">{disclaimer}</div>
    </div>
  );
}
