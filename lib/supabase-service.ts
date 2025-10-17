// lib/supabase-service.ts
import { createClient } from "@supabase/supabase-js";

export function getSupabaseService() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE; // ใช้เฉพาะฝั่ง server เท่านั้น
  if (!url || !key)
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE");
  return createClient(url, key, { auth: { persistSession: false } });
}
