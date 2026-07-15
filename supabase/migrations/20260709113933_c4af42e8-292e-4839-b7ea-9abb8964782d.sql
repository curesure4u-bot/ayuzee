
CREATE TYPE public.mutra_bindu_status AS ENUM
  ('submitted', 'ai_processed', 'vaidya_reviewed', 'completed');

CREATE TABLE public.mutra_bindu_observations (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ashtavidha_assessment_id  uuid NULL,
  sample_time               timestamptz NOT NULL DEFAULT now(),
  photo_url                 text NOT NULL,
  patient_notes             text,
  spread_pattern_ai         text,
  dosha_suggestion_ai       text,
  vaidya_reviewed           boolean NOT NULL DEFAULT false,
  vaidya_notes              text,
  status                    public.mutra_bindu_status NOT NULL DEFAULT 'submitted',
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_mutra_bindu_patient ON public.mutra_bindu_observations(patient_id, created_at DESC);
CREATE INDEX idx_mutra_bindu_status  ON public.mutra_bindu_observations(status);

GRANT SELECT, INSERT, UPDATE ON public.mutra_bindu_observations TO authenticated;
GRANT ALL ON public.mutra_bindu_observations TO service_role;

ALTER TABLE public.mutra_bindu_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own mutra observations"
  ON public.mutra_bindu_observations FOR SELECT TO authenticated
  USING (patient_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Patient can insert own mutra observations"
  ON public.mutra_bindu_observations FOR INSERT TO authenticated
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patient can update unreviewed mutra observations"
  ON public.mutra_bindu_observations FOR UPDATE TO authenticated
  USING (patient_id = auth.uid() AND vaidya_reviewed = false)
  WITH CHECK (patient_id = auth.uid());

CREATE TRIGGER trg_mutra_bindu_updated
  BEFORE UPDATE ON public.mutra_bindu_observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage policies for the private mutra-bindu-photos bucket
CREATE POLICY "Patient upload own mutra photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'mutra-bindu-photos'
              AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Patient read own mutra photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'mutra-bindu-photos'
         AND (storage.foldername(name))[1] = auth.uid()::text);
