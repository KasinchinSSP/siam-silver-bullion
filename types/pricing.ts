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
  effective_date: string; // YYYY-MM-DD (T-1)
  run_no: number; // ครั้งที่ n ของวัน
  updated_at: string; // ISO string
  is_demo: boolean;
  source: "v_latest_demo_snapshot";
  xagusd_close: number;
  usd_thb: number;
  prices: PriceItem[]; // แปลงมาจาก prices_by_sku
  ui: {
    mode_badge: string;
    timestamp_label: string;
    disclaimer: string;
  };
};
