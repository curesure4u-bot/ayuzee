-- Add therapist role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'therapist';

-- Prakriti assessments
CREATE TABLE IF NOT EXISTS public.prakriti_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL,
  assessor_user_id UUID,
  mode TEXT NOT NULL DEFAULT 'self', -- 'self' | 'doctor' | 'therapist'
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  vata_score INTEGER NOT NULL DEFAULT 0,
  pitta_score INTEGER NOT NULL DEFAULT 0,
  kapha_score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  dominant_dosha TEXT, -- 'vata' | 'pitta' | 'kapha' | 'vata-pitta' | etc.
  status TEXT NOT NULL DEFAULT 'completed', -- 'in_progress' | 'completed'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prakriti_patient ON public.prakriti_assessments(patient_user_id);
CREATE INDEX IF NOT EXISTS idx_prakriti_assessor ON public.prakriti_assessments(assessor_user_id);

ALTER TABLE public.prakriti_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient views own prakriti" ON public.prakriti_assessments
  FOR SELECT TO authenticated USING (auth.uid() = patient_user_id);

CREATE POLICY "Patient inserts own prakriti" ON public.prakriti_assessments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = patient_user_id OR auth.uid() = assessor_user_id);

CREATE POLICY "Patient updates own prakriti" ON public.prakriti_assessments
  FOR UPDATE TO authenticated USING (auth.uid() = patient_user_id);

CREATE POLICY "Assessor views conducted prakriti" ON public.prakriti_assessments
  FOR SELECT TO authenticated USING (auth.uid() = assessor_user_id);

CREATE POLICY "Assessor updates conducted prakriti" ON public.prakriti_assessments
  FOR UPDATE TO authenticated USING (auth.uid() = assessor_user_id);

CREATE POLICY "Admins view all prakriti" ON public.prakriti_assessments
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_prakriti_updated
  BEFORE UPDATE ON public.prakriti_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();