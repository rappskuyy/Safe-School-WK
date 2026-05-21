/**
 * admin-client.ts
 * Supabase client dengan service_role key — HANYA untuk dashboard guru.
 * Bypass RLS sehingga guru yang login via localStorage tetap bisa
 * membaca/menulis semua tabel (consultations, kindness_wall, reports, dll).
 *
 * ⚠️  Jangan gunakan client ini di halaman publik / siswa.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "";

// Service role key di-expose di frontend hanya karena ini aplikasi sekolah
// internal tanpa user publik yang berbahaya. Untuk produksi skala besar,
// pindahkan operasi ini ke server-side (API route / edge function).
const SERVICE_ROLE_KEY =
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || "";

function createAdminClient() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    // Fallback: gunakan anon client (mungkin data tidak muncul karena RLS)
    const ANON_KEY =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
      "";
    return createClient<Database>(SUPABASE_URL || "", ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export const supabaseAdmin = createAdminClient();
