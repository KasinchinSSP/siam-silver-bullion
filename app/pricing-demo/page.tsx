// app/pricing-demo/page.tsx
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

async function fetchLatest() {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    const proto = h.get("x-forwarded-proto") ?? "https";
    const url = `${proto}://${host}/api/pricing/latest`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      // โยนรายละเอียดไว้ดูบนหน้าจอ
      return { __error: `HTTP ${res.status} ${res.statusText}`, __url: url };
    }
    return res.json();
  } catch (e: any) {
    return { __error: e?.message ?? String(e) };
  }
}

export default async function PricingDemoPage() {
  const data = await fetchLatest();

  if (!data || (data as any).__error) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="text-xl font-semibold">Pricing Demo (T-1 Snapshot)</h1>
        <div className="mt-6 rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          ไม่สามารถดึงข้อมูลได้ — ตรวจสอบ endpoint /api/pricing/latest
          <pre className="mt-3 text-xs text-red-800">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-xl font-semibold">Pricing Demo (T-1 Snapshot)</h1>
      <p className="mt-2 text-sm text-gray-500">
        ดึงข้อมูลจาก <code>/api/pricing/latest</code> แบบสด (no-store)
      </p>

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
    </main>
  );
}
