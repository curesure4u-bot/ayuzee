-- Ashtavidha Pareeksha: Mala Pareeksha assessments
CREATE TABLE public.mala_pareeksha_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id uuid NOT NULL,
  doctor_user_id uuid,
  patient_name text,
  patient_age int,
  patient_gender text,
  patient_ref text,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  stool_type int NOT NULL,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  dosha text,
  agni text,
  ama text,
  risk_level text,
  diagnosis_note text,
  diet_advice text,
  lifestyle_advice text,
  medicines text,
  panchakarma text,
  followup_date date,
  red_flag_warning text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mala_pareeksha_assessments TO authenticated;
GRANT ALL ON public.mala_pareeksha_assessments TO service_role;

ALTER TABLE public.mala_pareeksha_assessments ENABLE ROW LEVEL SECURITY;

-- Patients can view their own assessments
CREATE POLICY "patient_view_own_mala"
ON public.mala_pareeksha_assessments FOR SELECT
TO authenticated
USING (patient_user_id = auth.uid());

-- Doctors can view assessments they created or that are assigned to them
CREATE POLICY "doctor_view_mala"
ON public.mala_pareeksha_assessments FOR SELECT
TO authenticated
USING (doctor_user_id = auth.uid());

-- Doctors (authenticated) can insert
CREATE POLICY "doctor_insert_mala"
ON public.mala_pareeksha_assessments FOR INSERT
TO authenticated
WITH CHECK (doctor_user_id = auth.uid() OR patient_user_id = auth.uid());

-- Doctors can update their own records
CREATE POLICY "doctor_update_mala"
ON public.mala_pareeksha_assessments FOR UPDATE
TO authenticated
USING (doctor_user_id = auth.uid())
WITH CHECK (doctor_user_id = auth.uid());

-- Delete only by creating doctor
CREATE POLICY "doctor_delete_mala"
ON public.mala_pareeksha_assessments FOR DELETE
TO authenticated
USING (doctor_user_id = auth.uid());

CREATE INDEX idx_mala_patient ON public.mala_pareeksha_assessments(patient_user_id, assessment_date DESC);
CREATE INDEX idx_mala_doctor ON public.mala_pareeksha_assessments(doctor_user_id, assessment_date DESC);

CREATE OR REPLACE FUNCTION public.mala_update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_mala_updated_at
BEFORE UPDATE ON public.mala_pareeksha_assessments
FOR EACH ROW EXECUTE FUNCTION public.mala_update_updated_at();