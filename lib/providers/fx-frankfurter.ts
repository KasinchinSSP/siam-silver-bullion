export async function getUsdThbFromFrankfurter(): Promise<number> {
  const url = "https://api.frankfurter.app/latest?from=USD&to=THB";
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Frankfurter HTTP ${res.status}`);
  const data = (await res.json()) as { rates?: Record<string, number> };
  const v = Number(data?.rates?.THB ?? 0);
  if (!(v > 0)) throw new Error("Frankfurter: invalid USDTHB");
  return v;
}
