
-- Enum role
CREATE TYPE public.app_role AS ENUM ('admin', 'guru', 'siswa');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer untuk cek role tanpa rekursi RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND approved = true
  )
$$;

CREATE OR REPLACE FUNCTION public.is_approved_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('guru','admin')
      AND approved = true
  )
$$;

-- Trigger auto-create profile + role guru pending
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);

  -- Default: pendaftar baru = guru pending (belum approved)
  INSERT INTO public.user_roles (user_id, role, approved)
  VALUES (NEW.id, 'guru', false);

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Reports (laporan bullying)
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  cerita TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'baru',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Consultations (konsultasi BK)
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  masalah TEXT NOT NULL,
  jadwal TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Mood entries (anonim)
CREATE TABLE public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mood TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- ===== RLS POLICIES =====

-- profiles: user lihat & update miliknya, staff approved bisa lihat semua
CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Staff view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.is_approved_staff(auth.uid()));

-- user_roles: user lihat role miliknya, admin manage semua
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admin view all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update roles" ON public.user_roles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- reports: SIAPAPUN (anon) bisa insert (lapor anonim), hanya staff approved yg bisa view/update
CREATE POLICY "Anyone can submit reports" ON public.reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff view reports" ON public.reports
  FOR SELECT TO authenticated USING (public.is_approved_staff(auth.uid()));
CREATE POLICY "Staff update reports" ON public.reports
  FOR UPDATE TO authenticated USING (public.is_approved_staff(auth.uid()));

-- consultations: sama
CREATE POLICY "Anyone can submit consultations" ON public.consultations
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff view consultations" ON public.consultations
  FOR SELECT TO authenticated USING (public.is_approved_staff(auth.uid()));
CREATE POLICY "Staff update consultations" ON public.consultations
  FOR UPDATE TO authenticated USING (public.is_approved_staff(auth.uid()));

-- mood: anon insert, staff view aggregate
CREATE POLICY "Anyone can submit mood" ON public.mood_entries
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff view mood" ON public.mood_entries
  FOR SELECT TO authenticated USING (public.is_approved_staff(auth.uid()));
