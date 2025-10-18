// lib/providers/fx.ts
/**
 * ชั่วคราว: ใช้ MOCK_USD_THB_T1 ระหว่างรอ BOT API
 * อนาคต: เพิ่ม getUsdThbT1FromBOT(dateISO) แล้วสลับมาใช้จริง
 */
export async function getUsdThbT1(
  dateISO: string
): Promise<{ value: number; provider: "mock" | "bot" }> {
  const mock = process.env.MOCK_USD_THB_T1;
  const val = Number(mock ?? 0);
  if (val > 0) return { value: val, provider: "mock" };
  // fallback ปลอดภัย: ค่าคงที่ 36.70 (อย่าลืมตั้ง ENV ทีหลัง)
  return { value: 36.7, provider: "mock" };
}
