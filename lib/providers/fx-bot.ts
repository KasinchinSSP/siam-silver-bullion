// lib/providers/fx-bot.ts
/**
 * ดึง USD/THB ล่าสุดจาก BOT
 * หมายเหตุ: ตั้งค่า ENV `BOT_API_KEY` และ (ตัวเลือก) `BOT_BASE_URL`
 * ค่าเริ่มต้นของ BASE เป็นตัวอย่างทั่วไป — หาก endpoint จริงแตกต่าง ให้ตั้งผ่าน ENV
 */
const DEFAULT_BASE =
  process.env.BOT_BASE_URL || "https://api.bot.or.th/exchangerates/latest";

export async function getUsdThbLatestFromBOT(): Promise<number> {
  const key = process.env.BOT_API_KEY;
  if (!key) throw new Error("Missing BOT_API_KEY");

  // ตัวอย่างเรียก: GET {BASE}?pair=USDTHB หรือ symbol=USDTHB (ขึ้นกับสเปกจริงของ BOT)
  // ปรับพารามิเตอร์ผ่าน ENV `BOT_BASE_URL` ให้ตรงเอกสารของคุณ
  const url = `${DEFAULT_BASE}?symbol=USDTHB`;
  const res = await fetch(url, {
    next: { revalidate: 0 },
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`BOT HTTP ${res.status}`);
  }

  const data = await res.json();
  // คาดหวังโครงสร้างที่มี field ราคาล่าสุดที่ key 'rate' หรือคล้ายกัน — โปรดแม็ปให้ตรงตามสเปกจริง
  const rate = Number(data?.rate ?? data?.value ?? data?.rates?.THB ?? 0);
  if (!(rate > 0)) {
    throw new Error("BOT: invalid USDTHB latest response");
  }
  return rate;
}
