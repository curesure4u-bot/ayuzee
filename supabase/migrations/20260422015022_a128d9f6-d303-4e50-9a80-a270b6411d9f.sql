CREATE TABLE public.patient_associated_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  relation TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  marital_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.patient_associated_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient manages own members"
ON public.patient_associated_members
FOR ALL
TO authenticated
USING (auth.uid() = patient_user_id)
WITH CHECK (auth.uid() = patient_user_id);

CREATE TRIGGER set_patient_members_updated_at
BEFORE UPDATE ON public.patient_associated_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_patient_members_user ON public.patient_associated_members(patient_user_id);