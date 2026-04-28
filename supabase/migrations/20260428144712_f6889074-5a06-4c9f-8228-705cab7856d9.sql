-- Para-surgical therapy module schema

CREATE TABLE public.parasurgical_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_user_id UUID NOT NULL,
  therapist_user_id UUID,
  patient_user_id UUID,
  patient_name TEXT NOT NULL,
  age INT,
  gender TEXT,
  occupation TEXT,
  chief_complaint TEXT NOT NULL,
  pain_location TEXT,
  duration TEXT,
  pain_severity INT CHECK (pain_severity BETWEEN 0 AND 10),
  radiation TEXT,
  numbness BOOLEAN DEFAULT false,
  stiffness BOOLEAN DEFAULT false,
  swelling BOOLEAN DEFAULT false,
  rom_restriction TEXT,
  previous_treatment TEXT,
  imaging_available TEXT,
  diabetes BOOLEAN DEFAULT false,
  hypertension BOOLEAN DEFAULT false,
  bleeding_history BOOLEAN DEFAULT false,
  surgery_history TEXT,
  posture_issues TEXT,
  lifestyle_factors TEXT,
  doctor_notes TEXT,
  contraindications JSONB DEFAULT '[]'::jsonb,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  ai_analysis JSONB,
  selected_procedure TEXT,
  selected_points JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.parasurgical_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.parasurgical_cases(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  therapist_user_id UUID,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procedure TEXT NOT NULL,
  points_used JSONB DEFAULT '[]'::jsonb,
  technique TEXT,
  technique_details JSONB DEFAULT '{}'::jsonb,
  duration_minutes INT,
  pain_before INT CHECK (pain_before BETWEEN 0 AND 10),
  pain_after INT CHECK (pain_after BETWEEN 0 AND 10),
  immediate_response TEXT,
  complications TEXT,
  advice_given TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.parasurgical_outcomes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.parasurgical_cases(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL,
  followup_day INT,
  pain_score INT CHECK (pain_score BETWEEN 0 AND 10),
  mobility_score INT CHECK (mobility_score BETWEEN 0 AND 10),
  sleep_score INT CHECK (sleep_score BETWEEN 0 AND 10),
  walking_ability TEXT,
  rom_gain TEXT,
  needs_repeat BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.parasurgical_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  therapy TEXT NOT NULL,
  point_code TEXT,
  name TEXT NOT NULL,
  body_region TEXT NOT NULL,
  side TEXT NOT NULL DEFAULT 'front',
  x_pct NUMERIC,
  y_pct NUMERIC,
  anatomical_location TEXT,
  indications TEXT[],
  contraindications TEXT[],
  needling_depth TEXT,
  stimulation_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_psg_cases_doctor ON public.parasurgical_cases(doctor_user_id);
CREATE INDEX idx_psg_cases_therapist ON public.parasurgical_cases(therapist_user_id);
CREATE INDEX idx_psg_sessions_case ON public.parasurgical_sessions(case_id);
CREATE INDEX idx_psg_outcomes_case ON public.parasurgical_outcomes(case_id);
CREATE INDEX idx_psg_points_therapy ON public.parasurgical_points(therapy);

ALTER TABLE public.parasurgical_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parasurgical_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parasurgical_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parasurgical_points ENABLE ROW LEVEL SECURITY;

-- Cases: doctor owns; therapist can read/update assigned
CREATE POLICY "Doctor manages own cases" ON public.parasurgical_cases
  FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Therapist views assigned cases" ON public.parasurgical_cases
  FOR SELECT TO authenticated
  USING (auth.uid() = therapist_user_id);

CREATE POLICY "Therapist updates assigned cases" ON public.parasurgical_cases
  FOR UPDATE TO authenticated
  USING (auth.uid() = therapist_user_id)
  WITH CHECK (auth.uid() = therapist_user_id);

-- Sessions: doctor or therapist on the case
CREATE POLICY "Case team manages sessions" ON public.parasurgical_sessions
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.parasurgical_cases c
      WHERE c.id = case_id AND (c.doctor_user_id = auth.uid() OR c.therapist_user_id = auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.parasurgical_cases c
      WHERE c.id = case_id AND (c.doctor_user_id = auth.uid() OR c.therapist_user_id = auth.uid()))
  );

-- Outcomes: same as sessions
CREATE POLICY "Case team manages outcomes" ON public.parasurgical_outcomes
  FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.parasurgical_cases c
      WHERE c.id = case_id AND (c.doctor_user_id = auth.uid() OR c.therapist_user_id = auth.uid()))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.parasurgical_cases c
      WHERE c.id = case_id AND (c.doctor_user_id = auth.uid() OR c.therapist_user_id = auth.uid()))
  );

-- Points library is read-only for all authenticated users
CREATE POLICY "Authenticated can read points" ON public.parasurgical_points
  FOR SELECT TO authenticated USING (true);

-- Triggers for updated_at
CREATE TRIGGER psg_cases_updated_at BEFORE UPDATE ON public.parasurgical_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER psg_sessions_updated_at BEFORE UPDATE ON public.parasurgical_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed point library
INSERT INTO public.parasurgical_points (therapy, point_code, name, body_region, side, x_pct, y_pct, anatomical_location, indications, contraindications, needling_depth, stimulation_method, notes) VALUES
-- Marma
('marma', NULL, 'Talahridaya', 'palm', 'front', 50, 50, 'Centre of palm', ARRAY['Cardiac support','Anxiety','Hand pain'], ARRAY['Open wound on palm'], NULL, 'Gentle pressure clockwise', 'Vital marma'),
('marma', NULL, 'Kshipra', 'hand', 'front', 36, 48, 'Between thumb and index finger', ARRAY['Headache','Cough','Throat pain'], ARRAY['Pregnancy'], NULL, 'Pressure 30s', 'Avoid in pregnancy'),
('marma', NULL, 'Kati Marma', 'lower-back', 'back', 50, 60, 'Lumbar region', ARRAY['Low back pain','Sciatica'], ARRAY['Spinal injury'], NULL, 'Circular pressure', NULL),
('marma', NULL, 'Amsa', 'shoulder', 'back', 40, 22, 'Top of shoulder', ARRAY['Frozen shoulder','Neck pain'], ARRAY['Acute trauma'], NULL, 'Static hold 1 min', NULL),
('marma', NULL, 'Janu', 'knee', 'front', 50, 70, 'Knee joint', ARRAY['Knee pain','Osteoarthritis'], ARRAY['Acute swelling'], NULL, 'Gentle circular', NULL),
('marma', NULL, 'Gulpha', 'ankle', 'front', 50, 92, 'Ankle joint', ARRAY['Ankle pain','Plantar fasciitis'], ARRAY['Sprain acute'], NULL, 'Pressure 45s', NULL),
-- Varmam
('varmam', NULL, 'Thilartha Kalam', 'head', 'front', 50, 8, 'Forehead centre', ARRAY['Headache','Vertigo'], ARRAY['Head injury'], NULL, 'Gentle activation', NULL),
('varmam', NULL, 'Kondaikolli', 'neck', 'back', 50, 16, 'Occipital region', ARRAY['Migraine','Cervical pain'], ARRAY['Cervical spondylosis severe'], NULL, 'Pressure angle 45°', NULL),
('varmam', NULL, 'Pidari', 'neck', 'back', 50, 18, 'Nape of neck', ARRAY['Neck stiffness'], ARRAY['Recent trauma'], NULL, 'Pulsed pressure', NULL),
-- Acupuncture
('acupuncture', 'LI4', 'Hegu (LI4)', 'hand', 'front', 36, 48, 'Between 1st and 2nd metacarpal', ARRAY['Headache','Facial pain','Toothache'], ARRAY['Pregnancy'], '0.5-1 cun', 'Even', 'Master point face'),
('acupuncture', 'LI11', 'Quchi (LI11)', 'elbow', 'front', 40, 38, 'Lateral elbow crease', ARRAY['Hypertension','Elbow pain','Skin issues'], ARRAY[]::TEXT[], '0.8-1.2 cun', 'Even', NULL),
('acupuncture', 'ST36', 'Zusanli (ST36)', 'lower-leg', 'front', 45, 78, '3 cun below knee', ARRAY['Digestion','Energy','Knee pain'], ARRAY[]::TEXT[], '1-1.5 cun', 'Tonify', 'Sea of nourishment'),
('acupuncture', 'GB20', 'Fengchi (GB20)', 'neck', 'back', 42, 18, 'Below occiput', ARRAY['Headache','Vertigo','Neck pain'], ARRAY['Caution near vertebral artery'], '0.5-0.8 cun', 'Even', 'Angle toward opposite eye'),
('acupuncture', 'BL23', 'Shenshu (BL23)', 'lower-back', 'back', 45, 55, 'L2 level 1.5 cun lateral', ARRAY['Low back pain','Kidney support'], ARRAY[]::TEXT[], '0.8-1.2 cun', 'Tonify', NULL),
('acupuncture', 'BL40', 'Weizhong (BL40)', 'knee', 'back', 50, 65, 'Popliteal crease centre', ARRAY['Sciatica','Low back pain'], ARRAY['Varicose veins'], '0.5-1 cun', 'Even', 'Master point lumbar'),
('acupuncture', 'LV3', 'Taichong (LV3)', 'foot', 'front', 50, 95, 'Between 1st-2nd metatarsal', ARRAY['Stress','Headache','Menstrual'], ARRAY[]::TEXT[], '0.5-0.8 cun', 'Sedate', NULL),
('acupuncture', 'SP6', 'Sanyinjiao (SP6)', 'lower-leg', 'front', 55, 85, '3 cun above medial malleolus', ARRAY['Gynae','Digestion','Sleep'], ARRAY['Pregnancy'], '0.8-1 cun', 'Even', NULL),
-- Tung
('tung', '77.05', 'Ling Gu', 'hand', 'front', 38, 50, 'Between 1st-2nd metacarpal dorsum', ARRAY['Sciatica','Low back pain','Headache'], ARRAY['Pregnancy'], '1-1.5 cun', 'Contralateral', 'Master Tung point'),
('tung', '88.17', 'Tian Huang', 'thigh', 'front', 50, 50, 'Anteromedial thigh', ARRAY['Kidney issues','Low back pain'], ARRAY[]::TEXT[], '1-2 cun', 'Distal', NULL),
('tung', '22.11', 'Zhong Bai', 'hand', 'back', 55, 45, 'Dorsum of hand', ARRAY['Low back pain','Sciatica'], ARRAY[]::TEXT[], '0.5-1 cun', 'Contralateral', NULL),
-- Dry needling
('dry-needling', NULL, 'Upper Trapezius TrP', 'shoulder', 'back', 40, 18, 'Mid upper trapezius', ARRAY['Tension headache','Neck pain'], ARRAY['Pneumothorax risk - angle carefully'], '15-25mm', 'Pistoning', 'Pinch and needle tangentially'),
('dry-needling', NULL, 'Piriformis TrP', 'hip', 'back', 45, 45, 'Deep gluteal', ARRAY['Sciatica','Hip pain'], ARRAY[]::TEXT[], '40-60mm', 'Twitch elicit', NULL),
('dry-needling', NULL, 'QL TrP', 'lower-back', 'back', 42, 50, 'Quadratus lumborum', ARRAY['Low back pain'], ARRAY['Kidney area caution'], '30-50mm', 'Twitch elicit', NULL),
('dry-needling', NULL, 'Glute Medius TrP', 'hip', 'back', 38, 48, 'Lateral hip', ARRAY['Hip pain','IT band'], ARRAY[]::TEXT[], '30-50mm', 'Pistoning', NULL),
('dry-needling', NULL, 'Levator Scapulae TrP', 'neck', 'back', 42, 22, 'Superior medial scapula', ARRAY['Neck pain','Headache'], ARRAY[]::TEXT[], '15-25mm', 'Twitch elicit', NULL),
-- Agni karma
('agni-karma', NULL, 'Heel Spur point', 'foot', 'back', 50, 96, 'Calcaneal tubercle', ARRAY['Plantar fasciitis','Heel spur'], ARRAY['Diabetes uncontrolled','Infection'], NULL, 'Panchaloha shalaka 5-7 touches', NULL),
('agni-karma', NULL, 'Knee OA point', 'knee', 'front', 50, 70, 'Around patella', ARRAY['Knee OA'], ARRAY['Acute inflammation'], NULL, '7 bindu pattern', NULL),
('agni-karma', NULL, 'Lumbar trigger', 'lower-back', 'back', 50, 58, 'Paraspinal lumbar', ARRAY['Chronic low back pain'], ARRAY['Skin lesion'], NULL, 'Linear bindu', NULL),
-- Viddha karma
('viddha-karma', NULL, 'Janu Viddha', 'knee', 'front', 50, 70, 'Periarticular knee', ARRAY['Knee OA','Chronic knee pain'], ARRAY['Acute synovitis','Bleeding disorder'], '5-10mm', 'Multiple punctures', NULL),
('viddha-karma', NULL, 'Gridhrasi point', 'lower-back', 'back', 45, 60, 'Sciatic notch area', ARRAY['Sciatica'], ARRAY['Anticoagulants'], '10-20mm', 'Targeted puncture', NULL);
