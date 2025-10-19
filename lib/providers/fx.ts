// lib/providers/fx.ts
import { getSettings } from "@/config/env";
import { getUsdThbFromFrankfurter } from "./fx-frankfurter";
import { getUsdThbLatestFromBOT } from "./fx-bot";

type FxProviderName = "frankfurter" | "bot" | "mock";

async function runFx(p: FxProviderName) {
  if (p === "frankfurter") {
    const v = await getUsdThbFromFrankfurter();
    return { value: v, provider: "frankfurter" as const };
  }
  if (p === "bot") {
    const v = await getUsdThbLatestFromBOT();
    return { value: v, provider: "bot" as const };
  }
  // mock
  const { MOCK_USD_THB_LATEST } = getSettings();
  return { value: Number(MOCK_USD_THB_LATEST), provider: "mock" as const };
}

export async function getUsdThbLatest(): Promise<{
  value: number;
  provider: FxProviderName;
}> {
  const { FX_PROVIDER, FX_FALLBACKS } = getSettings();
  const chain = [
    FX_PROVIDER,
    ...FX_FALLBACKS.split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  ] as FxProviderName[];

  let lastErr: any;
  for (const p of chain) {
    try {
      const out = await runFx(p);
      if (out.value > 0) return out;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("No FX providers available");
}

// สำหรับ historical (T-1) ตอนนี้ fallback ไปใช้ latest หากต้องการจริงค่อยขยาย
export async function getUsdThbT1(_dateISO?: string) {
  return getUsdThbLatest();
}
