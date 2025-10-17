export const revalidate = 30; // ให้หน้า Home รีเฟรชข้อมูลได้บ้าง

type LatestResp = {
  effective_date: string;
  run_no: number;
  updated_at: string;
  ui: { mode_badge: string; timestamp_label: string; disclaimer: string };
};

async function getLatest(): Promise<LatestResp | null> {
  try {
    const res = await fetch("/api/pricing/latest", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const latest = await getLatest();

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-2xl font-semibold">
        บริษัท สยาม ซิลเวอร์ บูลเลียน จำกัด
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Siam Silver Bullion Co., Ltd.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
        <span>🔧</span>
        <span>
          {latest?.ui.mode_badge ?? "โหมดสาธิต – แสดงราคาย้อนหลัง (T-1)"}
        </span>
      </div>

      <div className="mt-6 space-y-2 text-sm">
        {latest ? (
          <>
            <div>
              <span className="font-medium">{latest.ui.timestamp_label}:</span>{" "}
              {new Date(latest.updated_at).toLocaleString("th-TH")}
              {"  "}
              <span className="text-gray-500"> (ครั้งที่ {latest.run_no})</span>
            </div>
            <div className="text-gray-600">{latest.ui.disclaimer}</div>
          </>
        ) : (
          <div className="text-red-600">
            ยังดึงข้อมูลล่าสุดไม่ได้ — ลองรีเฟรชอีกครั้ง หรือเช็ก API
            /api/pricing/latest
          </div>
        )}
      </div>

      <div className="mt-8">
        <a
          href="/pricing-demo"
          className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          ดูข้อมูล JSON สด ๆ (pricing-demo)
        </a>
      </div>
    </main>
  );
}
