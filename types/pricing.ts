export type PriceItem = {
  sku: string;
  title: string;
  purity: number;
  weight_oz: number;
  sell_ex_vat: number;
  sell_incl_vat: number;
  buy_ex_vat: number;
  buy_incl_vat: number;
  vat_rate: number;
  rounding_rule: string;
  premium_used_per_oz_thb: number;
};

export type LatestPricingResponse = {
  effective_date: string;
  run_no: number;
  updated_at: string;
  is_demo: boolean;
  source: "v_latest_demo_snapshot";
  xagusd_close: number;
  usd_thb: number;
  prices: PriceItem[];
  ui: { mode_badge: string; timestamp_label: string; disclaimer: string };
};
