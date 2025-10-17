// lib/pricing.ts
export type EnvParams = {
  premiumPerOz: number;
  spread: number;
  vatRate: number;
  roundingRule: "nearest_1" | "nearest_10" | "nearest_100" | "none";
  applyVatOnBuy: boolean;
};

export function readEnv(): EnvParams {
  return {
    premiumPerOz: Number(process.env.DEFAULT_PREMIUM_PER_OZ_THB ?? 0),
    spread: Number(process.env.DEFAULT_SPREAD_BUY_SELL ?? 0),
    vatRate: Number(process.env.DEFAULT_VAT_RATE ?? 0),
    roundingRule: (process.env.DEFAULT_ROUNDING_RULE as any) ?? "nearest_10",
    applyVatOnBuy: String(process.env.APPLY_VAT_ON_BUY ?? "true") === "true",
  };
}

export function roundByRule(
  v: number,
  rule: EnvParams["roundingRule"]
): number {
  if (rule === "nearest_1") return Math.round(v);
  if (rule === "nearest_10") return Math.round(v / 10) * 10;
  if (rule === "nearest_100") return Math.round(v / 100) * 100;
  return v;
}

export type ProductRow = {
  sku: string;
  title: string;
  purity: number;
  weight_oz: number | null;
  weight_g: number | null;
  premium_per_oz_thb: number | null;
};

export function weightOzOf(p: ProductRow): number {
  if (p.weight_oz != null) return Number(p.weight_oz);
  if (p.weight_g != null) return Number(p.weight_g) / 31.1034768;
  return 0;
}

export function buildPricesBySku(args: {
  products: ProductRow[];
  xagusdClose: number;
  usdThb: number;
  env: EnvParams;
}) {
  const { products, xagusdClose, usdThb, env } = args;
  const baseTHBperOz = xagusdClose * usdThb;

  const obj: Record<string, any> = {};
  for (const p of products) {
    const weightOz = weightOzOf(p);
    const premiumUsed = p.premium_per_oz_thb ?? env.premiumPerOz;
    const costPerOz = baseTHBperOz + Number(premiumUsed);

    const sellEx = costPerOz * weightOz;
    const buyEx = sellEx * (1 - env.spread);

    const sellIncl = roundByRule(sellEx * (1 + env.vatRate), env.roundingRule);
    const buyInclRaw = env.applyVatOnBuy ? buyEx * (1 + env.vatRate) : buyEx;
    const buyIncl = roundByRule(buyInclRaw, env.roundingRule);

    obj[p.sku] = {
      weight_oz: Number(weightOz.toFixed(6)),
      purity: Number(p.purity),
      premium_used_per_oz_thb: Number(premiumUsed),
      sell_ex_vat: Number(sellEx.toFixed(2)),
      sell_incl_vat: Number(sellIncl.toFixed(2)),
      buy_ex_vat: Number(buyEx.toFixed(2)),
      buy_incl_vat: Number(buyIncl.toFixed(2)),
      vat_rate: Number(env.vatRate),
      rounding_rule: env.roundingRule,
    };
  }
  return obj;
}
