// app/pricing-demo/page.tsx
export const dynamic = "force-dynamic"; // ให้ดึงสดทุกครั้ง (MVP)

async function fetchLatest() {
  try {
    const res = await fetch("/api/pricing/latest", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function PricingDemoPage() {
  const data = await fetchLatest();

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold">Pricing Demo (T-1 Snapshot)</h1>
      <p className="mt-2 text-sm text-gray-500">
        ดึงข้อมูลจาก <code>/api/pricing/latest</code> แบบสด (no-store)
      </p>

      {!data ? (
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          ไม่สามารถดึงข้อมูลได้ — ตรวจสอบ endpoint /api/pricing/latest
          และสแนปช็อตในฐานข้อมูล
        </div>
      ) : (
        <>
          <div className="mt-6 text-sm text-gray-700">
            <div>
              <span className="font-medium">Effective Date:</span>{" "}
              {data.effective_date}{" "}
              <span className="text-gray-500">(run #{data.run_no})</span>
            </div>
            <div>
              <span className="font-medium">Updated:</span>{" "}
              {new Date(data.updated_at).toLocaleString("th-TH")}
            </div>
          </div>

          <pre className="mt-6 overflow-auto rounded-lg border bg-black/90 p-4 text-xs text-green-300">
            {JSON.stringify(data, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
