
CREATE TABLE public.vaidya_hijama_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  patient_name TEXT NOT NULL,
  age INT,
  gender TEXT,
  phone TEXT,
  chief_complaint TEXT,
  pain_location TEXT,
  pain_duration TEXT,
  pain_score INT,
  medical_history TEXT,
  medication_history TEXT,
  blood_thinner BOOLEAN DEFAULT false,
  diabetes_status TEXT,
  bp_status TEXT,
  pregnancy BOOLEAN DEFAULT false,
  anemia BOOLEAN DEFAULT false,
  bleeding_disorder BOOLEAN DEFAULT false,
  skin_infection BOOLEAN DEFAULT false,
  fever_acute BOOLEAN DEFAULT false,
  recent_surgery BOOLEAN DEFAULT false,
  keloid_tendency BOOLEAN DEFAULT false,
  immunocompromised BOOLEAN DEFAULT false,
  fainting_tendency BOOLEAN DEFAULT false,
  previous_hijama TEXT,
  condition_protocol TEXT,
  hijama_type TEXT,
  selected_points JSONB DEFAULT '[]'::jsonb,
  ai_plan JSONB,
  contraindications JSONB DEFAULT '[]'::jsonb,
  risk_level TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_signed_at TIMESTAMPTZ,
  doctor_approved BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_hijama_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own hijama assessments"
  ON public.vaidya_hijama_assessments FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER update_vaidya_hijama_assessments_updated_at
  BEFORE UPDATE ON public.vaidya_hijama_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vaidya_hijama_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.vaidya_hijama_assessments(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  therapist_name TEXT,
  doctor_approval BOOLEAN DEFAULT false,
  cupping_type TEXT,
  points_used JSONB DEFAULT '[]'::jsonb,
  number_of_cups INT,
  duration_minutes INT,
  skin_response TEXT,
  blood_quantity_ml INT,
  patient_response TEXT,
  complications TEXT,
  aftercare_advice TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_hijama_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own hijama sessions"
  ON public.vaidya_hijama_sessions FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER update_vaidya_hijama_sessions_updated_at
  BEFORE UPDATE ON public.vaidya_hijama_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vaidya_hijama_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.vaidya_hijama_assessments(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.vaidya_hijama_sessions(id) ON DELETE SET NULL,
  doctor_user_id UUID NOT NULL,
  followup_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_before INT,
  pain_after INT,
  sleep_improvement TEXT,
  energy_improvement TEXT,
  skin_healing TEXT,
  adverse_reaction TEXT,
  next_session_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_hijama_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own hijama followups"
  ON public.vaidya_hijama_followups FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE TRIGGER update_vaidya_hijama_followups_updated_at
  BEFORE UPDATE ON public.vaidya_hijama_followups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_hijama_assessments_doctor ON public.vaidya_hijama_assessments(doctor_user_id, created_at DESC);
CREATE INDEX idx_hijama_sessions_assessment ON public.vaidya_hijama_sessions(assessment_id, session_date DESC);
CREATE INDEX idx_hijama_followups_assessment ON public.vaidya_hijama_followups(assessment_id, followup_date DESC);
