
-- 1. Extend appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS pre_form_submitted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS post_feedback_submitted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS zoom_start_url TEXT;

-- 2. pre_consultation_forms
CREATE TABLE public.pre_consultation_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_user_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  chief_complaint TEXT,
  symptoms TEXT[],
  duration TEXT,
  severity TEXT,
  current_medications TEXT,
  allergies TEXT,
  medical_history TEXT,
  lifestyle_notes TEXT,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  language_preference TEXT DEFAULT 'en',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);
CREATE INDEX idx_pre_forms_appt ON public.pre_consultation_forms(appointment_id);
CREATE INDEX idx_pre_forms_patient ON public.pre_consultation_forms(patient_user_id);
CREATE INDEX idx_pre_forms_doctor ON public.pre_consultation_forms(doctor_id);
ALTER TABLE public.pre_consultation_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own pre-form"
  ON public.pre_consultation_forms FOR ALL
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

CREATE POLICY "Doctors view pre-form for their appointments"
  ON public.pre_consultation_forms FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.id = appointment_id AND a.doctor_id = auth.uid()
  ));

CREATE TRIGGER trg_pre_forms_updated
  BEFORE UPDATE ON public.pre_consultation_forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. consultation_assessments
CREATE TABLE public.consultation_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  subjective TEXT,
  objective TEXT,
  vitals JSONB NOT NULL DEFAULT '{}'::jsonb,
  assessment TEXT,
  diagnosis TEXT,
  plan TEXT,
  prescription TEXT,
  advice TEXT,
  follow_up_date DATE,
  icd_codes TEXT[],
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);
CREATE INDEX idx_assess_appt ON public.consultation_assessments(appointment_id);
CREATE INDEX idx_assess_doctor ON public.consultation_assessments(doctor_user_id);
CREATE INDEX idx_assess_patient ON public.consultation_assessments(patient_user_id);
ALTER TABLE public.consultation_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own assessments"
  ON public.consultation_assessments FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Patients view own assessments"
  ON public.consultation_assessments FOR SELECT
  USING (auth.uid() = patient_user_id);

CREATE TRIGGER trg_assess_updated
  BEFORE UPDATE ON public.consultation_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. post_consultation_feedback
CREATE TABLE public.post_consultation_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_user_id UUID NOT NULL,
  doctor_id UUID NOT NULL,
  rating SMALLINT CHECK (rating BETWEEN 1 AND 5),
  doctor_rating SMALLINT CHECK (doctor_rating BETWEEN 1 AND 5),
  listening_rating SMALLINT CHECK (listening_rating BETWEEN 1 AND 5),
  clarity_rating SMALLINT CHECK (clarity_rating BETWEEN 1 AND 5),
  would_recommend BOOLEAN,
  outcome_status TEXT CHECK (outcome_status IN ('improved','same','worse','too_early')),
  comments TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id)
);
CREATE INDEX idx_feedback_appt ON public.post_consultation_feedback(appointment_id);
CREATE INDEX idx_feedback_doctor ON public.post_consultation_feedback(doctor_id);
CREATE INDEX idx_feedback_patient ON public.post_consultation_feedback(patient_user_id);
ALTER TABLE public.post_consultation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own feedback"
  ON public.post_consultation_feedback FOR ALL
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

CREATE POLICY "Doctors view feedback on their appointments"
  ON public.post_consultation_feedback FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE TRIGGER trg_feedback_updated
  BEFORE UPDATE ON public.post_consultation_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. consultation_guidance
CREATE TABLE public.consultation_guidance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  guidance_type TEXT NOT NULL CHECK (guidance_type IN ('diet','yoga','medicine_schedule','lifestyle','other')),
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  schedule JSONB NOT NULL DEFAULT '{}'::jsonb,
  start_date DATE,
  end_date DATE,
  sent_via TEXT[] DEFAULT ARRAY[]::TEXT[],
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_guidance_appt ON public.consultation_guidance(appointment_id);
CREATE INDEX idx_guidance_doctor ON public.consultation_guidance(doctor_user_id);
CREATE INDEX idx_guidance_patient ON public.consultation_guidance(patient_user_id);
CREATE INDEX idx_guidance_type ON public.consultation_guidance(guidance_type);
ALTER TABLE public.consultation_guidance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage guidance they created"
  ON public.consultation_guidance FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Patients view their guidance"
  ON public.consultation_guidance FOR SELECT
  USING (auth.uid() = patient_user_id);

CREATE POLICY "Patients acknowledge their guidance"
  ON public.consultation_guidance FOR UPDATE
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

CREATE TRIGGER trg_guidance_updated
  BEFORE UPDATE ON public.consultation_guidance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
