CREATE TABLE public.symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms_text text NOT NULL,
  symptom_tags text[] NOT NULL DEFAULT '{}',
  ayush_system text,
  age integer,
  gender text,
  ai_response text,
  recommended_specialist text,
  model text,
  tokens_used integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.symptom_checks TO authenticated;
GRANT ALL ON public.symptom_checks TO service_role;

ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_symptom_checks_patient ON public.symptom_checks(patient_id, created_at DESC);

CREATE POLICY "Patients view own symptom checks"
  ON public.symptom_checks FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients insert own symptom checks"
  ON public.symptom_checks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins view all symptom checks"
  ON public.symptom_checks FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Doctors view symptom checks of their patients"
  ON public.symptom_checks FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1
    FROM public.appointments a
    JOIN public.doctors d ON d.id = a.doctor_id
    WHERE a.user_id = symptom_checks.patient_id
      AND d.user_id = auth.uid()
  ));