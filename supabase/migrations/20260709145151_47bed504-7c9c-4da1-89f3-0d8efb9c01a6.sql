
-- 1. Extend table
ALTER TABLE public.panchakarma_consents
  ADD COLUMN IF NOT EXISTS venue_id uuid REFERENCES public.panchakarma_venues(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS patient_signature_url text;

CREATE INDEX IF NOT EXISTS idx_panchakarma_consents_venue_id ON public.panchakarma_consents(venue_id);
CREATE INDEX IF NOT EXISTS idx_panchakarma_consents_patient_id ON public.panchakarma_consents(patient_id);
CREATE INDEX IF NOT EXISTS idx_panchakarma_consents_vaidya_id ON public.panchakarma_consents(vaidya_id);

-- 2. Rebuild RLS policies
ALTER TABLE public.panchakarma_consents ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE p record;
BEGIN
  FOR p IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='panchakarma_consents' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.panchakarma_consents', p.policyname);
  END LOOP;
END $$;

-- Patient can view own consents (patient_id stores auth user_id)
CREATE POLICY "Patient can view own consents"
ON public.panchakarma_consents FOR SELECT
TO authenticated
USING (patient_id = auth.uid());

-- Vaidya who created it can view
CREATE POLICY "Vaidya can view own consents"
ON public.panchakarma_consents FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = vaidya_id AND d.user_id = auth.uid())
);

-- Vaidya can insert (must be the creating vaidya)
CREATE POLICY "Vaidya can insert own consents"
ON public.panchakarma_consents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = vaidya_id AND d.user_id = auth.uid())
);

-- Vaidya can update own consents (e.g. attach signature after insert)
CREATE POLICY "Vaidya can update own consents"
ON public.panchakarma_consents FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = vaidya_id AND d.user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.doctors d WHERE d.id = vaidya_id AND d.user_id = auth.uid())
);

-- Venue owner can view (read-only) consents at their venue
CREATE POLICY "Venue owner can view venue consents"
ON public.panchakarma_consents FOR SELECT
TO authenticated
USING (
  venue_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.panchakarma_venues v
    WHERE v.id = venue_id AND v.owner_admin_id = auth.uid()
  )
);

-- Platform admins full access
CREATE POLICY "Admins full access to consents"
ON public.panchakarma_consents FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 3. Storage RLS on the private panchakarma-consents bucket
-- Path convention: <consent_id>.png (as used by the app)
DROP POLICY IF EXISTS "Vaidya can upload consent signatures" ON storage.objects;
DROP POLICY IF EXISTS "Vaidya can read own consent signatures" ON storage.objects;
DROP POLICY IF EXISTS "Patient can read own consent signature" ON storage.objects;
DROP POLICY IF EXISTS "Venue owner can read venue consent signatures" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage consent signatures" ON storage.objects;

CREATE POLICY "Vaidya can upload consent signatures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'panchakarma-consents'
  AND EXISTS (
    SELECT 1 FROM public.panchakarma_consents c
    JOIN public.doctors d ON d.id = c.vaidya_id
    WHERE d.user_id = auth.uid()
      AND (c.id::text || '.png') = storage.objects.name
  )
);

CREATE POLICY "Vaidya can read own consent signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'panchakarma-consents'
  AND EXISTS (
    SELECT 1 FROM public.panchakarma_consents c
    JOIN public.doctors d ON d.id = c.vaidya_id
    WHERE d.user_id = auth.uid()
      AND (c.id::text || '.png') = storage.objects.name
  )
);

CREATE POLICY "Patient can read own consent signature"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'panchakarma-consents'
  AND EXISTS (
    SELECT 1 FROM public.panchakarma_consents c
    WHERE c.patient_id = auth.uid()
      AND (c.id::text || '.png') = storage.objects.name
  )
);

CREATE POLICY "Venue owner can read venue consent signatures"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'panchakarma-consents'
  AND EXISTS (
    SELECT 1 FROM public.panchakarma_consents c
    JOIN public.panchakarma_venues v ON v.id = c.venue_id
    WHERE v.owner_admin_id = auth.uid()
      AND (c.id::text || '.png') = storage.objects.name
  )
);

CREATE POLICY "Admins can manage consent signatures"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'panchakarma-consents' AND public.is_admin_or_super(auth.uid()))
WITH CHECK (bucket_id = 'panchakarma-consents' AND public.is_admin_or_super(auth.uid()));
