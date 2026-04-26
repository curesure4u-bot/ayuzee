-- Enable trigram first
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Remedies (Materia Medica)
CREATE TABLE public.homeo_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  abbreviation TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  latin_name TEXT,
  family TEXT,
  source TEXT,
  short_description TEXT,
  keynotes TEXT[] DEFAULT '{}',
  mind_sphere TEXT,
  thermal TEXT,
  thirst TEXT,
  cravings TEXT[] DEFAULT '{}',
  aversions TEXT[] DEFAULT '{}',
  modalities_better TEXT[] DEFAULT '{}',
  modalities_worse TEXT[] DEFAULT '{}',
  affinities TEXT[] DEFAULT '{}',
  common_potencies TEXT[] DEFAULT '{30C,200C,1M}',
  full_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Symptoms / Rubrics
CREATE TABLE public.homeo_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter TEXT NOT NULL,
  rubric TEXT NOT NULL,
  sub_rubric TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homeo_symptoms_chapter ON public.homeo_symptoms(chapter);
CREATE INDEX idx_homeo_symptoms_rubric_trgm ON public.homeo_symptoms USING gin (rubric public.gin_trgm_ops);
CREATE INDEX idx_homeo_symptoms_subrubric_trgm ON public.homeo_symptoms USING gin (sub_rubric public.gin_trgm_ops);

-- Symptom ↔ Remedy
CREATE TABLE public.homeo_symptom_remedies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symptom_id UUID NOT NULL REFERENCES public.homeo_symptoms(id) ON DELETE CASCADE,
  remedy_id UUID NOT NULL REFERENCES public.homeo_remedies(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL DEFAULT 1 CHECK (grade BETWEEN 1 AND 4),
  UNIQUE (symptom_id, remedy_id)
);
CREATE INDEX idx_hsr_symptom ON public.homeo_symptom_remedies(symptom_id);
CREATE INDEX idx_hsr_remedy ON public.homeo_symptom_remedies(remedy_id);

-- Patients
CREATE TABLE public.homeo_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_code TEXT,
  full_name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  occupation TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  chief_complaint TEXT,
  chronicity TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homeo_patients_doctor ON public.homeo_patients(doctor_user_id);

-- Cases
CREATE TABLE public.homeo_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.homeo_patients(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  case_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mind TEXT,
  thermal_state TEXT,
  thirst TEXT,
  cravings TEXT,
  aversions TEXT,
  sleep TEXT,
  dreams TEXT,
  perspiration TEXT,
  stool TEXT,
  urine TEXT,
  female_complaints TEXT,
  modalities_better TEXT,
  modalities_worse TEXT,
  past_history TEXT,
  family_history TEXT,
  selected_symptom_ids UUID[] DEFAULT '{}',
  repertory_result JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homeo_cases_patient ON public.homeo_cases(patient_id);
CREATE INDEX idx_homeo_cases_doctor ON public.homeo_cases(doctor_user_id);

-- Prescriptions
CREATE TABLE public.homeo_prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeo_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.homeo_patients(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  remedy_id UUID REFERENCES public.homeo_remedies(id),
  remedy_name TEXT NOT NULL,
  potency TEXT NOT NULL,
  dosage TEXT NOT NULL,
  duration_days INTEGER,
  follow_up_date DATE,
  instructions TEXT,
  prescribed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homeo_rx_case ON public.homeo_prescriptions(case_id);
CREATE INDEX idx_homeo_rx_doctor ON public.homeo_prescriptions(doctor_user_id);

-- Follow ups
CREATE TABLE public.homeo_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeo_cases(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.homeo_patients(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  followup_date DATE NOT NULL DEFAULT CURRENT_DATE,
  outcome TEXT NOT NULL CHECK (outcome IN ('better','worse','unchanged','old_symptoms_returned','new_symptoms')),
  notes TEXT,
  next_action TEXT,
  next_followup_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_homeo_fu_case ON public.homeo_followups(case_id);
CREATE INDEX idx_homeo_fu_doctor ON public.homeo_followups(doctor_user_id);

-- updated_at triggers
CREATE TRIGGER trg_homeo_remedies_updated BEFORE UPDATE ON public.homeo_remedies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_homeo_patients_updated BEFORE UPDATE ON public.homeo_patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_homeo_cases_updated BEFORE UPDATE ON public.homeo_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.homeo_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_symptom_remedies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homeo_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors and admins read remedies" ON public.homeo_remedies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage remedies" ON public.homeo_remedies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctors and admins read symptoms" ON public.homeo_symptoms
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage symptoms" ON public.homeo_symptoms
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctors and admins read symptom_remedies" ON public.homeo_symptom_remedies
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'doctor') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins manage symptom_remedies" ON public.homeo_symptom_remedies
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctor owns patients, admin sees all" ON public.homeo_patients
  FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor inserts own patients" ON public.homeo_patients
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid() AND public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Doctor updates own patients" ON public.homeo_patients
  FOR UPDATE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor deletes own patients" ON public.homeo_patients
  FOR DELETE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctor owns cases, admin sees all" ON public.homeo_cases
  FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor inserts own cases" ON public.homeo_cases
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid() AND public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Doctor updates own cases" ON public.homeo_cases
  FOR UPDATE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor deletes own cases" ON public.homeo_cases
  FOR DELETE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctor owns prescriptions, admin sees all" ON public.homeo_prescriptions
  FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor inserts own prescriptions" ON public.homeo_prescriptions
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid() AND public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Doctor updates own prescriptions" ON public.homeo_prescriptions
  FOR UPDATE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor deletes own prescriptions" ON public.homeo_prescriptions
  FOR DELETE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

CREATE POLICY "Doctor owns followups, admin sees all" ON public.homeo_followups
  FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor inserts own followups" ON public.homeo_followups
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid() AND public.has_role(auth.uid(),'doctor'));
CREATE POLICY "Doctor updates own followups" ON public.homeo_followups
  FOR UPDATE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Doctor deletes own followups" ON public.homeo_followups
  FOR DELETE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Repertory ranking RPC
CREATE OR REPLACE FUNCTION public.homeo_repertorize(_symptom_ids UUID[])
RETURNS TABLE (
  remedy_id UUID,
  abbreviation TEXT,
  name TEXT,
  total_score INTEGER,
  rubrics_covered INTEGER,
  max_grade SMALLINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.abbreviation, r.name,
         SUM(sr.grade)::INTEGER AS total_score,
         COUNT(DISTINCT sr.symptom_id)::INTEGER AS rubrics_covered,
         MAX(sr.grade) AS max_grade
  FROM public.homeo_symptom_remedies sr
  JOIN public.homeo_remedies r ON r.id = sr.remedy_id
  WHERE sr.symptom_id = ANY(_symptom_ids)
  GROUP BY r.id, r.abbreviation, r.name
  ORDER BY rubrics_covered DESC, total_score DESC, r.name ASC
  LIMIT 50;
$$;