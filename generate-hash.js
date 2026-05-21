const bcrypt = require("bcryptjs");

// ✏️ EDIT DAFTAR GURU DI SINI
const teachers = [
  { email: "gurubk@smkwikrama.sch.id", password: "guruBK", nama: "Bu Zuri", mapel: "Guru BK Kelas X" },
  // tambah guru lain di sini jika ada
];

(async () => {
  console.log("INSERT INTO public.teachers (email, password_hash, nama, mapel) VALUES");
  const rows = await Promise.all(
    teachers.map(async (t) => {
      const hash = await bcrypt.hash(t.password, 10);
      return `  ('${t.email}', '${hash}', '${t.nama}', '${t.mapel}')`;
    })
  );
  console.log(rows.join(",\n") + ";");
})();
