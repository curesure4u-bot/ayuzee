
-- Enum for status
DO $$ BEGIN
  CREATE TYPE public.jihva_pariksha_status AS ENUM ('submitted', 'ai_processed', 'vaidya_reviewed', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Table
CREATE TABLE public.jihva_pariksha_observations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ashtavidha_assessment_id UUID NULL REFERENCES public.vaidya_ashtavidha_exams(id) ON DELETE SET NULL,
  photo_url TEXT NOT NULL,
  patient_notes TEXT NULL,
  ayurvedic_interpretation_ai JSONB NULL,
  vaidya_reviewed BOOLEAN NOT NULL DEFAULT false,
  vaidya_notes TEXT NULL,
  status public.jihva_pariksha_status NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jihva_pariksha_observations TO authenticated;
GRANT ALL ON public.jihva_pariksha_observations TO service_role;

ALTER TABLE public.jihva_pariksha_observations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own jihva observations"
  ON public.jihva_pariksha_observations
  FOR ALL
  TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins view all jihva observations"
  ON public.jihva_pariksha_observations
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all jihva observations"
  ON public.jihva_pariksha_observations
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger (reuse existing public.update_updated_at_column if present, else create)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_jihva_pariksha_observations_updated_at
  BEFORE UPDATE ON public.jihva_pariksha_observations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_jihva_pariksha_patient ON public.jihva_pariksha_observations (patient_id, created_at DESC);
CREATE INDEX idx_jihva_pariksha_status ON public.jihva_pariksha_observations (status);

-- Storage RLS policies for the private bucket (bucket itself is created via storage tool)
CREATE POLICY "Patients read own jihva photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'jihva-pariksha-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients upload own jihva photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'jihva-pariksha-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients update own jihva photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'jihva-pariksha-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients delete own jihva photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'jihva-pariksha-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all jihva photos"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'jihva-pariksha-photos' AND public.has_role(auth.uid(), 'admin'));
