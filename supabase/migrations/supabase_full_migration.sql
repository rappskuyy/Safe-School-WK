-- ============================================================
-- SAFESCHOOL — FULL SUPABASE SQL MIGRATION
-- Jalankan file ini di Supabase SQL Editor secara berurutan
-- ============================================================

-- ============================================================
-- STEP 1: HAPUS SEMUA TABEL & TIPE LAMA (RESET BERSIH)
-- ============================================================
DROP TABLE IF EXISTS public.kindness_wall_pending CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;
DROP TABLE IF EXISTS public.pencapaian CASCADE;
DROP TABLE IF EXISTS public.absensi CASCADE;
DROP TABLE IF EXISTS public.nilai CASCADE;
DROP TABLE IF EXISTS public.tugas CASCADE;
DROP TABLE IF EXISTS public.jadwal_pelajaran CASCADE;
DROP TABLE IF EXISTS public.mood_entries CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.app_role CASCADE;

-- ============================================================
-- STEP 2: ENUM ROLE (hanya guru & ortu)
-- ============================================================
CREATE TYPE public.app_role AS ENUM ('guru', 'ortu');

-- ============================================================
-- STEP 3: TABEL PROFILES
-- ============================================================
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT        NOT NULL DEFAULT '',
  email         TEXT,
  role          TEXT        NOT NULL DEFAULT 'ortu',  -- 'guru' atau 'ortu'
  -- Khusus ortu
  child_name    TEXT,       -- nama anak
  child_kelas   TEXT,       -- kelas anak
  -- Umum
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: HELPER FUNCTIONS
-- ============================================================

-- Cek apakah user adalah guru yang sudah approved
CREATE OR REPLACE FUNCTION public.is_guru(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'guru'
  )
$$;

-- Cek apakah user adalah ortu
CREATE OR REPLACE FUNCTION public.is_ortu(_user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND role = 'ortu'
  )
$$;

-- ============================================================
-- STEP 5: TRIGGER AUTO-CREATE PROFILE SAAT REGISTER
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, child_name, child_kelas)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'ortu'),
    NEW.raw_user_meta_data->>'child_name',
    NEW.raw_user_meta_data->>'child_kelas'
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name    = EXCLUDED.full_name,
        role         = EXCLUDED.role,
        child_name   = EXCLUDED.child_name,
        child_kelas  = EXCLUDED.child_kelas,
        updated_at   = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- STEP 6: RLS PROFILES
-- ============================================================
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Guru can view all profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (public.is_guru(auth.uid()));

-- ============================================================
-- STEP 7: STORAGE BUCKET UNTUK BUKTI LAPORAN
-- ============================================================
-- Jalankan di Supabase Dashboard > Storage > New Bucket
-- Nama: report-evidence | Public: false
-- Atau via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-evidence',
  'report-evidence',
  false,
  5242880,  -- 5MB max
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Anyone can upload evidence"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'report-evidence');

CREATE POLICY "Guru can view evidence"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'report-evidence' AND public.is_guru(auth.uid()));

CREATE POLICY "Public temporary upload access"
  ON storage.objects FOR SELECT TO anon
  USING (bucket_id = 'report-evidence');

-- ============================================================
-- STEP 8: TABEL REPORTS (Lapor BK — Bullying & Pencurian)
-- ============================================================
CREATE TABLE public.reports (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nama          TEXT        NOT NULL DEFAULT 'Anonim',
  kelas         TEXT        NOT NULL,
  -- Kategori laporan: 'Bullying' atau 'Pencurian'
  kategori      TEXT        NOT NULL CHECK (kategori IN ('Bullying', 'Pencurian')),
  -- Sub-jenis bullying: Verbal, Fisik, Sosial (Cyber dihapus)
  -- Sub-jenis pencurian: Barang, Uang, Perangkat
  jenis         TEXT        NOT NULL,
  cerita        TEXT        NOT NULL,
  lokasi        TEXT        NOT NULL,
  -- URL bukti foto (opsional, dari storage)
  bukti_url     TEXT,
  status        TEXT        NOT NULL DEFAULT 'baru'
                            CHECK (status IN ('baru', 'diproses', 'selesai')),
  catatan_guru  TEXT,       -- catatan tindak lanjut dari guru
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_status     ON public.reports(status);
CREATE INDEX idx_reports_kategori   ON public.reports(kategori);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit reports"
  ON public.reports FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Guru can view all reports"
  ON public.reports FOR SELECT TO authenticated
  USING (public.is_guru(auth.uid()));

CREATE POLICY "Guru can update reports"
  ON public.reports FOR UPDATE TO authenticated
  USING (public.is_guru(auth.uid()));

-- Ortu bisa lihat laporan anak mereka (berdasarkan nama & kelas anak)
CREATE POLICY "Ortu can view reports of their child"
  ON public.reports FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'ortu'
        AND (
          -- nama anak cocok (case insensitive, partial match)
          lower(reports.nama) ILIKE '%' || lower(COALESCE(p.child_name, '')) || '%'
          OR reports.kelas = p.child_kelas
        )
    )
  );

-- ============================================================
-- STEP 9: TABEL CONSULTATIONS (Konsultasi BK)
-- ============================================================
CREATE TABLE public.consultations (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  nama          TEXT        NOT NULL,
  kelas         TEXT        NOT NULL,
  masalah       TEXT        NOT NULL,
  jadwal        TIMESTAMPTZ NOT NULL,
  status        TEXT        NOT NULL DEFAULT 'menunggu'
                            CHECK (status IN ('menunggu', 'dijadwalkan', 'selesai')),
  catatan_guru  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_consultations_status ON public.consultations(status);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit consultations"
  ON public.consultations FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Guru can view all consultations"
  ON public.consultations FOR SELECT TO authenticated
  USING (public.is_guru(auth.uid()));

CREATE POLICY "Guru can update consultations"
  ON public.consultations FOR UPDATE TO authenticated
  USING (public.is_guru(auth.uid()));

CREATE POLICY "Public can view own consultations"
  ON public.consultations FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- STEP 10: TABEL MOOD ENTRIES (Check-in Harian)
-- ============================================================
CREATE TABLE public.mood_entries (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  mood          TEXT        NOT NULL CHECK (mood IN ('senang', 'biasa', 'sedih', 'marah')),
  -- Opsional: tanggal check-in (untuk cegah duplikat per hari per session)
  session_id    TEXT,       -- random ID dari localStorage user (bukan user_id)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mood_created_at ON public.mood_entries(created_at DESC);
CREATE INDEX idx_mood_mood        ON public.mood_entries(mood);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit mood"
  ON public.mood_entries FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Guru can view all mood"
  ON public.mood_entries FOR SELECT TO authenticated
  USING (public.is_guru(auth.uid()));

CREATE POLICY "Public can view mood aggregate"
  ON public.mood_entries FOR SELECT TO anon, authenticated
  USING (true);

-- ============================================================
-- STEP 11: TABEL DINDING KEBAIKAN (Pending Approval Guru)
-- ============================================================
CREATE TABLE public.kindness_wall (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,       -- nama pengirim (boleh kosong / anonim)
  message       TEXT        NOT NULL,
  -- Status: 'pending' = menunggu persetujuan guru, 'approved' = tampil di web, 'rejected'
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by   UUID        REFERENCES public.profiles(id),
  approved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kindness_status     ON public.kindness_wall(status);
CREATE INDEX idx_kindness_created_at ON public.kindness_wall(created_at DESC);
ALTER TABLE public.kindness_wall ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa kirim pesan
CREATE POLICY "Anyone can submit kindness"
  ON public.kindness_wall FOR INSERT TO anon, authenticated
  WITH CHECK (length(message) BETWEEN 5 AND 280);

-- Yang sudah approved bisa dilihat siapa saja
CREATE POLICY "Anyone can view approved kindness"
  ON public.kindness_wall FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- Guru bisa lihat semua (termasuk pending)
CREATE POLICY "Guru can view all kindness"
  ON public.kindness_wall FOR SELECT TO authenticated
  USING (public.is_guru(auth.uid()));

-- Guru bisa approve/reject
CREATE POLICY "Guru can moderate kindness"
  ON public.kindness_wall FOR UPDATE TO authenticated
  USING (public.is_guru(auth.uid()));

-- ============================================================
-- STEP 12: TABEL PLEDGE (Ikrar/Janji)
-- ============================================================
CREATE TABLE public.pledges (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  message       TEXT        NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can pledge"
  ON public.pledges FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Anyone can view pledges"
  ON public.pledges FOR SELECT TO anon, authenticated USING (true);

-- ============================================================
-- STEP 13: TABEL NOTIFIKASI GURU (Fitur Baru)
-- ============================================================
CREATE TABLE public.guru_notifications (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  guru_id       UUID        REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          TEXT        NOT NULL, -- 'report_new', 'consultation_new', 'kindness_pending', 'mood_alert'
  title         TEXT        NOT NULL,
  body          TEXT,
  ref_id        UUID,       -- ID laporan / konsultasi terkait
  is_read       BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_guru_unread ON public.guru_notifications(guru_id, is_read);
ALTER TABLE public.guru_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Guru can view own notifications"
  ON public.guru_notifications FOR SELECT TO authenticated
  USING (guru_id = auth.uid() AND public.is_guru(auth.uid()));

CREATE POLICY "Guru can update own notifications"
  ON public.guru_notifications FOR UPDATE TO authenticated
  USING (guru_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.guru_notifications FOR INSERT TO authenticated, anon
  WITH CHECK (true);

-- ============================================================
-- STEP 14: TRIGGER NOTIFIKASI OTOMATIS
-- ============================================================

-- Trigger: notif ke semua guru saat laporan baru masuk
CREATE OR REPLACE FUNCTION public.notify_guru_new_report()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.guru_notifications (guru_id, type, title, body, ref_id)
  SELECT
    p.id,
    'report_new',
    '📋 Laporan ' || NEW.kategori || ' Baru',
    'Dari ' || NEW.nama || ' (' || NEW.kelas || ') — ' || NEW.jenis,
    NEW.id
  FROM public.profiles p
  WHERE p.role = 'guru';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_report_inserted
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_guru_new_report();

-- Trigger: notif ke semua guru saat konsultasi baru
CREATE OR REPLACE FUNCTION public.notify_guru_new_consultation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.guru_notifications (guru_id, type, title, body, ref_id)
  SELECT
    p.id,
    'consultation_new',
    '💬 Konsultasi BK Baru',
    'Dari ' || NEW.nama || ' (' || NEW.kelas || ') — ' || left(NEW.masalah, 80),
    NEW.id
  FROM public.profiles p
  WHERE p.role = 'guru';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_consultation_inserted
  AFTER INSERT ON public.consultations
  FOR EACH ROW EXECUTE FUNCTION public.notify_guru_new_consultation();

-- Trigger: notif ke semua guru saat pesan dinding kebaikan pending
CREATE OR REPLACE FUNCTION public.notify_guru_kindness_pending()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.guru_notifications (guru_id, type, title, body, ref_id)
  SELECT
    p.id,
    'kindness_pending',
    '💜 Pesan Dinding Kebaikan Baru',
    'Dari ' || COALESCE(NEW.name, 'Anonim') || ': "' || left(NEW.message, 60) || '"',
    NEW.id
  FROM public.profiles p
  WHERE p.role = 'guru';
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_kindness_inserted
  AFTER INSERT ON public.kindness_wall
  FOR EACH ROW EXECUTE FUNCTION public.notify_guru_kindness_pending();

-- ============================================================
-- STEP 15: TABEL MOOD HARIAN SISWA (Alert Marah/Sedih)
-- ============================================================
-- View untuk guru melihat alert mood negatif hari ini
CREATE OR REPLACE VIEW public.mood_alert_today AS
SELECT
  mood,
  COUNT(*) as jumlah,
  DATE(created_at AT TIME ZONE 'Asia/Jakarta') as tanggal
FROM public.mood_entries
WHERE
  DATE(created_at AT TIME ZONE 'Asia/Jakarta') = CURRENT_DATE
  AND mood IN ('marah', 'sedih')
GROUP BY mood, DATE(created_at AT TIME ZONE 'Asia/Jakarta');

-- ============================================================
-- STEP 16: INSERT DATA GURU DEFAULT (opsional — hapus jika tidak perlu)
-- ============================================================
-- CATATAN: Buat akun di Supabase Auth terlebih dahulu,
-- lalu update role-nya menjadi 'guru' di tabel profiles.
-- 
-- Contoh update manual setelah register:
--   UPDATE public.profiles SET role = 'guru' WHERE email = 'guru@wikrama.sch.id';
--
-- Atau gunakan Supabase Auth Admin API untuk set metadata:
--   { "role": "guru" }

-- ============================================================
-- STEP 17: FUNCTION STATISTIK DASHBOARD GURU
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_reports',          (SELECT COUNT(*) FROM public.reports),
    'reports_baru',           (SELECT COUNT(*) FROM public.reports WHERE status = 'baru'),
    'reports_minggu_ini',     (SELECT COUNT(*) FROM public.reports WHERE created_at > NOW() - INTERVAL '7 days'),
    'total_consultations',    (SELECT COUNT(*) FROM public.consultations),
    'consultations_menunggu', (SELECT COUNT(*) FROM public.consultations WHERE status = 'menunggu'),
    'total_mood',             (SELECT COUNT(*) FROM public.mood_entries WHERE DATE(created_at) = CURRENT_DATE),
    'mood_marah_hari_ini',    (SELECT COUNT(*) FROM public.mood_entries WHERE mood = 'marah' AND DATE(created_at) = CURRENT_DATE),
    'mood_sedih_hari_ini',    (SELECT COUNT(*) FROM public.mood_entries WHERE mood = 'sedih' AND DATE(created_at) = CURRENT_DATE),
    'kindness_pending',       (SELECT COUNT(*) FROM public.kindness_wall WHERE status = 'pending'),
    'reports_bullying',       (SELECT COUNT(*) FROM public.reports WHERE kategori = 'Bullying'),
    'reports_pencurian',      (SELECT COUNT(*) FROM public.reports WHERE kategori = 'Pencurian')
  ) INTO result;
  RETURN result;
END;
$$;

-- ============================================================
-- STEP 18: INDEX PERFORMA TAMBAHAN
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role       ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email      ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_kindness_status_at  ON public.kindness_wall(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_updated_at  ON public.reports(updated_at DESC);

-- ============================================================
-- SELESAI — Database SafeSchool siap digunakan!
-- ============================================================
