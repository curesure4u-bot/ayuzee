DO $$ BEGIN
  CREATE TYPE public.netra_pariksha_status AS ENUM ('submitted','ai_processed','vaidya_reviewed','completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE public.netra_pariksha_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ashtavidha_assessment_id UUID NULL REFERENCES public.vaidya_ashtavidha_exams(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  patient_notes TEXT,
  ayurvedic_interpretation_ai JSONB,
  vaidya_reviewed BOOLEAN NOT NULL DEFAULT false,
  vaidya_notes TEXT,
  status public.netra_pariksha_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.netra_pariksha_observations TO authenticated;
GRANT ALL ON public.netra_pariksha_observations TO service_role;

ALTER TABLE public.netra_pariksha_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients read own netra observations"
ON public.netra_pariksha_observations FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own netra observations"
ON public.netra_pariksha_observations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins manage netra observations"
ON public.netra_pariksha_observations FOR ALL
TO authenticated
USING (public.is_admin_or_super(auth.uid()))
WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_netra_pariksha_updated_at
BEFORE UPDATE ON public.netra_pariksha_observations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_netra_pariksha_patient ON public.netra_pariksha_observations(patient_id, created_at DESC);
CREATE INDEX idx_netra_pariksha_status ON public.netra_pariksha_observations(status);

-- Storage policies for the private netra-pariksha-photos bucket
CREATE POLICY "Patients upload own netra photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'netra-pariksha-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Patients read own netra photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'netra-pariksha-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins read netra photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'netra-pariksha-photos'
  AND public.is_admin_or_super(auth.uid())
);
