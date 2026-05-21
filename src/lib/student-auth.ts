// =====================================================
// Auth Ortu lewat Supabase Auth
// =====================================================
// Skema baru hanya mengenal 2 role: 'guru' dan 'ortu'
// Siswa TIDAK punya akun — laporan bisa anonim tanpa login.
// =====================================================
import { supabase } from "@/integrations/supabase/client";

export type SignUpInput = {
  email: string;
  password: string;
  full_name: string;
  role: "ortu";        // hanya ortu yang bisa daftar mandiri
  child_name: string;  // nama anak
  child_kelas: string; // kelas anak (contoh: "XI RPL 1")
};

export async function signUpUser(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
      data: {
        full_name: input.full_name,
        role: input.role,
        child_name: input.child_name,
        child_kelas: input.child_kelas,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signInUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutUser() {
  await supabase.auth.signOut();
}
