import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/integrations/supabase/admin-client";

export type Teacher = {
  id: string;
  email: string;
  nama: string;
  rayon: string;
};

const KEY = "safeschool_teacher";

export async function loginTeacher(
  email: string,
  password: string,
): Promise<Teacher | null> {
  // 1. Ambil data guru by email via RPC (service_role, bypass RLS)
  const { data, error } = await supabaseAdmin.rpc("get_teacher_by_email", {
    p_email: email.trim().toLowerCase(),
  });

  if (error || !data || data.length === 0) return null;

  const row = data[0] as Teacher & { password_hash: string };

  // 2. Verifikasi password bcrypt di frontend
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) return null;

  const t: Teacher = { id: row.id, email: row.email, nama: row.nama, rayon: row.rayon };
  localStorage.setItem(KEY, JSON.stringify(t));
  return t;
}

export function getTeacher(): Teacher | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutTeacher() {
  localStorage.removeItem(KEY);
}
