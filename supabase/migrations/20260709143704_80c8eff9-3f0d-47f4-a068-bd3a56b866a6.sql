
-- 1) panchakarma_therapy_types: extend
ALTER TABLE public.panchakarma_therapy_types
  ADD COLUMN IF NOT EXISTS sanskrit_name text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS protocol_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contraindications jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS default_duration_minutes integer,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS approved_by_vaidya_id uuid REFERENCES public.doctors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Helper: is caller an approved Vaidya (doctor)?
CREATE OR REPLACE FUNCTION public.is_approved_vaidya(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.doctors
    WHERE user_id = _user_id AND is_approved = true
  )
$$;

-- Tighten RLS: readable only for active rows to any authenticated user; admins & vaidyas write
DROP POLICY IF EXISTS "Therapy types readable by all" ON public.panchakarma_therapy_types;
DROP POLICY IF EXISTS "Admins manage therapy types" ON public.panchakarma_therapy_types;

CREATE POLICY "Active therapy types readable by authenticated"
  ON public.panchakarma_therapy_types
  FOR SELECT
  TO authenticated
  USING (is_active = true OR public.is_admin_or_super(auth.uid()) OR public.is_approved_vaidya(auth.uid()));

CREATE POLICY "Admins and vaidyas insert therapy types"
  ON public.panchakarma_therapy_types
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.is_approved_vaidya(auth.uid()));

CREATE POLICY "Admins and vaidyas update therapy types"
  ON public.panchakarma_therapy_types
  FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.is_approved_vaidya(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.is_approved_vaidya(auth.uid()));

CREATE POLICY "Admins delete therapy types"
  ON public.panchakarma_therapy_types
  FOR DELETE
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- 2) panchakarma_therapist_credentials: extend
ALTER TABLE public.panchakarma_therapist_credentials
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.panchakarma_venues(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS training_records jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS health_check_status text,
  ADD COLUMN IF NOT EXISTS health_check_expiry date,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- The therapist_id references therapists(id), NOT doctors(id).
-- (Confirmed table name: public.therapists — kept as-is.)

CREATE INDEX IF NOT EXISTS idx_pk_creds_venue ON public.panchakarma_therapist_credentials(venue_id);

-- Rebuild RLS: therapist SELECT own only; venue owner + admin manage; no self-privileging
DROP POLICY IF EXISTS "Admins manage credentials" ON public.panchakarma_therapist_credentials;
DROP POLICY IF EXISTS "Credentials readable by authenticated" ON public.panchakarma_therapist_credentials;
DROP POLICY IF EXISTS "Therapist can view own credentials row" ON public.panchakarma_therapist_credentials;

-- Therapist can view only their own row
CREATE POLICY "Therapist views own credentials"
  ON public.panchakarma_therapist_credentials
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.therapists t
      WHERE t.id = panchakarma_therapist_credentials.therapist_id
        AND t.user_id = auth.uid()
    )
  );

-- Venue owners can view credentials tied to their venue
CREATE POLICY "Venue owner views venue credentials"
  ON public.panchakarma_therapist_credentials
  FOR SELECT
  TO authenticated
  USING (
    venue_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_therapist_credentials.venue_id
        AND v.owner_admin_id = auth.uid()
    )
  );

-- Admins full read
CREATE POLICY "Admins view all credentials"
  ON public.panchakarma_therapist_credentials
  FOR SELECT
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

-- Venue owner INSERT (must scope to their own venue AND not be inserting their own therapist row)
CREATE POLICY "Venue owner inserts credentials for own venue"
  ON public.panchakarma_therapist_credentials
  FOR INSERT
  TO authenticated
  WITH CHECK (
    venue_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.therapists t
      WHERE t.id = therapist_id AND t.user_id = auth.uid()
    )
  );

-- Venue owner UPDATE for their venue, cannot update own therapist row
CREATE POLICY "Venue owner updates credentials for own venue"
  ON public.panchakarma_therapist_credentials
  FOR UPDATE
  TO authenticated
  USING (
    venue_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = panchakarma_therapist_credentials.venue_id
        AND v.owner_admin_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.therapists t
      WHERE t.id = panchakarma_therapist_credentials.therapist_id
        AND t.user_id = auth.uid()
    )
  )
  WITH CHECK (
    venue_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.panchakarma_venues v
      WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.therapists t
      WHERE t.id = therapist_id AND t.user_id = auth.uid()
    )
  );

-- Admins full write
CREATE POLICY "Admins manage credentials"
  ON public.panchakarma_therapist_credentials
  FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
