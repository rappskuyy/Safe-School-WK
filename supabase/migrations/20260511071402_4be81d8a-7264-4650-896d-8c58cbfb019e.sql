
DROP POLICY IF EXISTS "Staff view reports" ON public.reports;
DROP POLICY IF EXISTS "Staff update reports" ON public.reports;
CREATE POLICY "Public can view reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Public can update reports" ON public.reports FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Staff view consultations" ON public.consultations;
DROP POLICY IF EXISTS "Staff update consultations" ON public.consultations;
CREATE POLICY "Public can view consultations" ON public.consultations FOR SELECT USING (true);
CREATE POLICY "Public can update consultations" ON public.consultations FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Staff view mood" ON public.mood_entries;
CREATE POLICY "Public can view mood" ON public.mood_entries FOR SELECT USING (true);
