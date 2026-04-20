
-- Add is_published flag to therapies (admin-curated public catalog)
ALTER TABLE public.therapies ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;

-- Allow admins to manage therapies
DROP POLICY IF EXISTS "Admins manage therapies" ON public.therapies;
CREATE POLICY "Admins manage therapies" ON public.therapies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Replace public read policy: only published therapies visible publicly
DROP POLICY IF EXISTS "Therapies are viewable by everyone" ON public.therapies;
CREATE POLICY "Published therapies public" ON public.therapies
  FOR SELECT USING (is_published = true AND is_active = true);

CREATE POLICY "Admins view all therapies" ON public.therapies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Therapy plans: add patient_user_id for patient-side visibility + payment fields
ALTER TABLE public.therapy_plans
  ADD COLUMN IF NOT EXISTS patient_user_id UUID,
  ADD COLUMN IF NOT EXISTS estimated_price INTEGER,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS therapy_code TEXT;

-- Patient can view & confirm their own plans
CREATE POLICY "Patient views own therapy plans" ON public.therapy_plans
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Patient confirms own therapy plans" ON public.therapy_plans
  FOR UPDATE TO authenticated
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);
