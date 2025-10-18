// lib/providers/metalprice.ts
const BASE =
  process.env.METALPRICE_BASE_URL || "https://api.metalpriceapi.com/v1";

export type MetalPriceResp = {
  success: boolean;
  base: string;
  rates?: Record<string, number>;
  error?: { code?: string | number; message?: string };
};

export async function getXagUsdT1(dateISO: string): Promise<number> {
  const key = process.env.METALPRICE_API_KEY;
  if (!key) throw new Error("Missing METALPRICE_API_KEY");

  const url = `${BASE}/${dateISO}?api_key=${key}&base=XAG&currencies=USD`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`MetalpriceAPI HTTP ${res.status}`);

  const data = (await res.json()) as MetalPriceResp;
  if (!data?.rates?.USD || !isFinite(Number(data.rates.USD))) {
    const msg = data?.error?.message || "Invalid rates.USD";
    throw new Error(`MetalpriceAPI invalid response: ${msg}`);
  }
  const xagusd = Number(data.rates.USD);
  if (!(xagusd > 0))
    throw new Error("MetalpriceAPI returned non-positive XAGUSD");
  return xagusd;
}

export async function getXagUsdLatest(): Promise<number> {
  const key = process.env.METALPRICE_API_KEY;
  const BASE =
    process.env.METALPRICE_BASE_URL || "https://api.metalpriceapi.com/v1";
  if (!key) throw new Error("Missing METALPRICE_API_KEY");

  const url = `${BASE}/latest?api_key=${key}&base=XAG&currencies=USD`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`MetalpriceAPI HTTP ${res.status}`);
  const data = (await res.json()) as { rates?: Record<string, number> };
  const v = Number(data?.rates?.USD ?? 0);
  if (!(v > 0)) throw new Error("MetalpriceAPI: invalid latest XAGUSD");
  return v;
}
