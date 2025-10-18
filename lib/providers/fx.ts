import { getUsdThbFromFrankfurter } from "./fx-frankfurter";

export async function getUsdThbLatest(): Promise<{
  value: number;
  provider: "frankfurter" | "mock";
}> {
  const provider = (process.env.FX_PROVIDER || "frankfurter").toLowerCase();

  if (provider === "frankfurter") {
    const v = await getUsdThbFromFrankfurter();
    return { value: v, provider: "frankfurter" };
  }

  const mock = Number(process.env.MOCK_USD_THB_LATEST ?? 36.7);
  return { value: mock, provider: "mock" };
}

// สำหรับ route เก่า base-t1
export async function getUsdThbT1(_dateISO?: string) {
  return getUsdThbLatest();
}
