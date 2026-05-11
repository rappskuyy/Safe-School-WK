// =====================================================
// LOGIN GURU MANUAL (HARDCODED) — SafeSchool
// -----------------------------------------------------
// Tidak ada pendaftaran. Akun guru ditulis langsung di
// file ini. Kalau mau tambah/ganti guru, edit array
// TEACHERS di bawah lalu simpan.
// =====================================================

export type Teacher = {
  username: string;
  password: string;
  nama: string;
  mapel: string;
};

// 👇 Daftar akun guru BK (ubah sesuai sekolahmu)
export const TEACHERS: Teacher[] = [
  { username: "bukartika",  password: "safe123", nama: "Bu Kartika, S.Pd", mapel: "Guru BK Kelas X" },
  { username: "pakraka",    password: "safe123", nama: "Pak Raka, M.Psi",  mapel: "Guru BK Kelas XI" },
  { username: "buanindya",  password: "safe123", nama: "Bu Anindya, S.Psi",mapel: "Guru BK Kelas XII" },
];

const KEY = "safeschool_teacher";

export function loginTeacher(username: string, password: string): Teacher | null {
  const t = TEACHERS.find(
    (x) => x.username.toLowerCase() === username.toLowerCase() && x.password === password,
  );
  if (!t) return null;
  localStorage.setItem(KEY, JSON.stringify({ username: t.username, nama: t.nama, mapel: t.mapel }));
  return t;
}

export function getTeacher(): Pick<Teacher, "username" | "nama" | "mapel"> | null {
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
