
-- 1) Tambah peran 'ortu'
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ortu';

-- 2) Perluas profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS nis text,
  ADD COLUMN IF NOT EXISTS kelas text,
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'siswa',
  ADD COLUMN IF NOT EXISTS child_nis text,
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE INDEX IF NOT EXISTS idx_profiles_nis ON public.profiles(nis);
CREATE INDEX IF NOT EXISTS idx_profiles_child_nis ON public.profiles(child_nis);

-- Helper: cek apakah uid adalah orang tua dari siswa dengan nis tertentu
CREATE OR REPLACE FUNCTION public.is_parent_of(_user_id uuid, _nis text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'ortu' AND child_nis = _nis
  )
$$;

CREATE OR REPLACE FUNCTION public.nis_of(_user_id uuid)
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT nis FROM public.profiles WHERE id = _user_id $$;

-- Tambah trigger handle_new_user supaya isi role dari metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, nis, kelas, child_nis)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'siswa'),
    NEW.raw_user_meta_data->>'nis',
    NEW.raw_user_meta_data->>'kelas',
    NEW.raw_user_meta_data->>'child_nis'
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        nis = EXCLUDED.nis,
        kelas = EXCLUDED.kelas,
        child_nis = EXCLUDED.child_nis;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS profiles agar parent bisa lihat anak
DROP POLICY IF EXISTS "Parent view child profile" ON public.profiles;
CREATE POLICY "Parent view child profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_parent_of(auth.uid(), nis));

-- 3) Tabel jadwal pelajaran
CREATE TABLE IF NOT EXISTS public.jadwal_pelajaran (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas text NOT NULL,
  hari text NOT NULL,
  jam_mulai text NOT NULL,
  jam_selesai text NOT NULL,
  mapel text NOT NULL,
  guru text NOT NULL,
  ruang text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.jadwal_pelajaran ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read jadwal" ON public.jadwal_pelajaran
  FOR SELECT TO authenticated USING (true);

-- 4) Tabel tugas
CREATE TABLE IF NOT EXISTS public.tugas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kelas text NOT NULL,
  judul text NOT NULL,
  mapel text NOT NULL,
  deskripsi text,
  deadline timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tugas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read tugas" ON public.tugas
  FOR SELECT TO authenticated USING (true);

-- 5) Tabel nilai
CREATE TABLE IF NOT EXISTS public.nilai (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL,
  mapel text NOT NULL,
  nilai numeric NOT NULL,
  semester text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nilai_nis ON public.nilai(nis);
ALTER TABLE public.nilai ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Siswa view own nilai" ON public.nilai
  FOR SELECT TO authenticated
  USING (nis = public.nis_of(auth.uid()) OR public.is_parent_of(auth.uid(), nis));

-- 6) Tabel absensi
CREATE TABLE IF NOT EXISTS public.absensi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL,
  tanggal date NOT NULL,
  status text NOT NULL,
  keterangan text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_absensi_nis ON public.absensi(nis);
ALTER TABLE public.absensi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Siswa view own absensi" ON public.absensi
  FOR SELECT TO authenticated
  USING (nis = public.nis_of(auth.uid()) OR public.is_parent_of(auth.uid(), nis));

-- 7) Tabel pencapaian (gamifikasi)
CREATE TABLE IF NOT EXISTS public.pencapaian (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nis text NOT NULL,
  badge text NOT NULL,
  poin int NOT NULL DEFAULT 0,
  deskripsi text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_pencapaian_nis ON public.pencapaian(nis);
ALTER TABLE public.pencapaian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own pencapaian" ON public.pencapaian
  FOR SELECT TO authenticated
  USING (nis = public.nis_of(auth.uid()) OR public.is_parent_of(auth.uid(), nis));
-- Leaderboard publik (hanya nis & badge & poin) — tetap pakai policy authenticated read all
CREATE POLICY "Authenticated leaderboard read" ON public.pencapaian
  FOR SELECT TO authenticated USING (true);
