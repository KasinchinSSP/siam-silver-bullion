// lib/providers/metal.ts
import { getSettings } from "@/config/env";
import { getXagUsdLatest as mpLatest, getXagUsdT1 as mpT1 } from "./metalprice";

type MetalProviderName = "metalprice" | "mock";

async function runLatest(p: MetalProviderName) {
  if (p === "metalprice") {
    const v = await mpLatest();
    return { value: v, provider: "metalprice" as const };
  }
  // mock
  return { value: 30, provider: "mock" as const }; // ค่าตัวอย่าง
}

async function runT1(p: MetalProviderName, dateISO: string) {
  if (p === "metalprice") {
    const v = await mpT1(dateISO);
    return { value: v, provider: "metalprice" as const };
  }
  // mock
  return { value: 30, provider: "mock" as const };
}

export const Metal = {
  async latest() {
    const { METAL_PROVIDER, METAL_FALLBACKS } = getSettings();
    const chain = [
      METAL_PROVIDER,
      ...METAL_FALLBACKS.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ] as MetalProviderName[];

    let lastErr: any;
    for (const p of chain) {
      try {
        const out = await runLatest(p);
        if (out.value > 0) return out;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error("No metal providers available (latest)");
  },

  async t1(dateISO: string) {
    const { METAL_PROVIDER, METAL_FALLBACKS } = getSettings();
    const chain = [
      METAL_PROVIDER,
      ...METAL_FALLBACKS.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ] as MetalProviderName[];

    let lastErr: any;
    for (const p of chain) {
      try {
        const out = await runT1(p, dateISO);
        if (out.value > 0) return out;
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr ?? new Error("No metal providers available (T-1)");
  },
};
