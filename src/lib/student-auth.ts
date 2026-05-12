// =====================================================
// Auth siswa & ortu lewat Lovable Cloud (Supabase)
// =====================================================
import { supabase } from "@/integrations/supabase/client";

export type SignUpInput = {
  email: string;
  password: string;
  full_name: string;
  role: "siswa" | "ortu";
  nis?: string;       // untuk siswa = NIS sendiri
  kelas?: string;     // untuk siswa
  child_nis?: string; // untuk ortu = NIS anak
};

export async function signUpUser(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        full_name: input.full_name,
        role: input.role,
        nis: input.nis ?? null,
        kelas: input.kelas ?? null,
        child_nis: input.child_nis ?? null,
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
