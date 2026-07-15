
CREATE TABLE public.formulary_prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id uuid NOT NULL,
  patient_user_id uuid,
  appointment_id uuid,
  patient_name text,
  patient_phone text,
  diagnosis text,
  pathya text,
  apathya text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'issued',
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.formulary_prescriptions TO authenticated;
GRANT ALL ON public.formulary_prescriptions TO service_role;

ALTER TABLE public.formulary_prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own formulary prescriptions"
  ON public.formulary_prescriptions FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Patients view their formulary prescriptions"
  ON public.formulary_prescriptions FOR SELECT
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Admins view all formulary prescriptions"
  ON public.formulary_prescriptions FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_formulary_prescriptions_doctor ON public.formulary_prescriptions(doctor_user_id, created_at DESC);
CREATE INDEX idx_formulary_prescriptions_patient ON public.formulary_prescriptions(patient_user_id, created_at DESC);
CREATE INDEX idx_formulary_prescriptions_items ON public.formulary_prescriptions USING gin (items);

CREATE TRIGGER update_formulary_prescriptions_updated_at
  BEFORE UPDATE ON public.formulary_prescriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
