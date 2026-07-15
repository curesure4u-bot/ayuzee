CREATE TABLE IF NOT EXISTS public.patient_vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  bp_systolic INTEGER,
  bp_diastolic INTEGER,
  pulse INTEGER,
  blood_sugar_fasting NUMERIC,
  spo2 NUMERIC,
  temperature NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_vitals ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_patient_vitals_user_date
ON public.patient_vitals (user_id, recorded_date DESC);

CREATE POLICY "Patients can view their own vitals"
ON public.patient_vitals
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Patients can add their own vitals"
ON public.patient_vitals
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can update their own vitals"
ON public.patient_vitals
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Patients can delete their own vitals"
ON public.patient_vitals
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);