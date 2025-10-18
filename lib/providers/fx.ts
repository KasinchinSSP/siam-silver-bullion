// lib/providers/fx.ts
import { getUsdThbLatestFromBOT } from "./fx-bot";

/**
 * อ่าน FX ล่าสุดตาม provider
 * - FX_PROVIDER=bot  → ใช้ BOT
 * - FX_PROVIDER=mock → ใช้ค่า mock (สำหรับทดสอบ)
 */
export async function getUsdThbLatest(): Promise<{
  value: number;
  provider: "bot" | "mock";
}> {
  const provider = (process.env.FX_PROVIDER || "bot").toLowerCase();

  if (provider === "bot") {
    const v = await getUsdThbLatestFromBOT();
    return { value: v, provider: "bot" };
  }

  // mock fallback (ทดสอบเท่านั้น)
  const mock = Number(process.env.MOCK_USD_THB_LATEST ?? 36.7);
  return { value: mock, provider: "mock" };
}
