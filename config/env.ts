// config/env.ts
import { z } from "zod";

const EnvSchema = z.object({
  // Providers
  FX_PROVIDER: z.enum(["frankfurter", "bot", "mock"]).default("frankfurter"),
  FX_FALLBACKS: z.string().default("mock"), // ตัวอย่าง: "bot,mock"
  METAL_PROVIDER: z.enum(["metalprice", "mock"]).default("metalprice"),
  METAL_FALLBACKS: z.string().default("mock"),

  // Keys / URLs
  METALPRICE_API_KEY: z.string().optional(),
  METALPRICE_BASE_URL: z.string().optional(),
  BOT_API_KEY: z.string().optional(),
  BOT_BASE_URL: z.string().optional(),

  // Pricing rules
  DEFAULT_PREMIUM_PER_OZ_THB: z.coerce.number().default(0),
  DEFAULT_SPREAD_BUY_SELL: z.coerce.number().default(0),
  DEFAULT_VAT_RATE: z.coerce.number().default(0.07),
  DEFAULT_ROUNDING_RULE: z
    .enum(["nearest_1", "nearest_10", "nearest_100", "none"])
    .default("nearest_10"),
  APPLY_VAT_ON_BUY: z.coerce.boolean().default(true),

  // Security
  ADMIN_TOKEN: z.string().optional(),

  // Mock / debug
  MOCK_USD_THB_LATEST: z.coerce.number().default(36.7),
});

let _cache: z.infer<typeof EnvSchema> | null = null;
export type AppSettings = z.infer<typeof EnvSchema>;

export function getSettings(): AppSettings {
  if (_cache) return _cache;
  _cache = EnvSchema.parse(process.env);
  return _cache;
}
