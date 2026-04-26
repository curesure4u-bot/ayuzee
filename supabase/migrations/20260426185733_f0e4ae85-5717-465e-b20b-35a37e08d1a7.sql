-- Mind Case AI: narrative cases
CREATE TABLE public.homeo_mind_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.homeo_patients(id) ON DELETE SET NULL,
  patient_name TEXT,
  patient_age INTEGER,
  patient_gender TEXT,
  chief_complaint TEXT,
  duration TEXT,
  trigger_event TEXT,
  bothers_most TEXT,
  reaction TEXT,
  repeating_emotion TEXT,
  deepest_fear TEXT,
  what_hurts TEXT,
  what_suppressed TEXT,
  relationship_pattern TEXT,
  work_pattern TEXT,
  additional_notes TEXT,
  detected_themes TEXT[] DEFAULT '{}',
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  remedy_cluster TEXT[] DEFAULT '{}',
  suggested_remedy TEXT,
  differential_remedies TEXT[] DEFAULT '{}',
  key_reasons TEXT,
  doctor_final_remedy TEXT,
  doctor_decision_notes TEXT,
  potency TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homeo_mind_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own mind cases" ON public.homeo_mind_cases
  FOR SELECT USING (auth.uid() = doctor_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors create mind cases" ON public.homeo_mind_cases
  FOR INSERT WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own mind cases" ON public.homeo_mind_cases
  FOR UPDATE USING (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors delete own mind cases" ON public.homeo_mind_cases
  FOR DELETE USING (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_mind_cases_updated
  BEFORE UPDATE ON public.homeo_mind_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mind_cases_doctor ON public.homeo_mind_cases(doctor_user_id, created_at DESC);
CREATE INDEX idx_mind_cases_status ON public.homeo_mind_cases(status);

-- Follow-ups
CREATE TABLE public.homeo_mind_followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES public.homeo_mind_cases(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  trigger_response_score INTEGER,
  emotional_resilience_score INTEGER,
  sleep_score INTEGER,
  energy_score INTEGER,
  physical_complaint_score INTEGER,
  remedy_given TEXT,
  potency TEXT,
  observations TEXT,
  next_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.homeo_mind_followups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own followups" ON public.homeo_mind_followups
  FOR SELECT USING (auth.uid() = doctor_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Doctors create followups" ON public.homeo_mind_followups
  FOR INSERT WITH CHECK (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors update own followups" ON public.homeo_mind_followups
  FOR UPDATE USING (auth.uid() = doctor_user_id);
CREATE POLICY "Doctors delete own followups" ON public.homeo_mind_followups
  FOR DELETE USING (auth.uid() = doctor_user_id);

CREATE INDEX idx_mind_followups_case ON public.homeo_mind_followups(case_id, visit_date DESC);

-- Theme to remedy mapping (shared, admin-editable)
CREATE TABLE public.homeo_theme_remedy_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme TEXT NOT NULL,
  remedy_name TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 3,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(theme, remedy_name)
);

ALTER TABLE public.homeo_theme_remedy_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read theme map" ON public.homeo_theme_remedy_map
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage theme map" ON public.homeo_theme_remedy_map
  FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_theme_map_theme ON public.homeo_theme_remedy_map(theme);

-- Seed starter mappings
INSERT INTO public.homeo_theme_remedy_map (theme, remedy_name, weight, notes) VALUES
  ('humiliation', 'Staphysagria', 5, 'Suppressed indignation, ailments from humiliation'),
  ('humiliation', 'Ignatia', 3, 'Silent grief from being slighted'),
  ('humiliation', 'Aurum Metallicum', 3, 'Wounded honor, deep despair'),
  ('rejection', 'Natrum Muriaticum', 5, 'Closed grief, fear of being hurt again'),
  ('rejection', 'Pulsatilla', 4, 'Forsaken feeling, weeps easily'),
  ('rejection', 'Ignatia', 3, 'Acute grief from rejection'),
  ('grief', 'Ignatia', 5, 'Acute grief, sighing, contradictory mood'),
  ('grief', 'Natrum Muriaticum', 5, 'Chronic silent grief'),
  ('grief', 'Phosphoricum Acidum', 4, 'Grief leading to apathy and exhaustion'),
  ('grief', 'Aurum Metallicum', 3, 'Grief with despair, suicidal thoughts'),
  ('fear', 'Aconitum Napellus', 5, 'Sudden intense fear, fear of death'),
  ('fear', 'Arsenicum Album', 5, 'Fear with restlessness, fear of disease'),
  ('fear', 'Phosphorus', 4, 'Fear of dark, thunder, being alone'),
  ('fear', 'Stramonium', 4, 'Night terrors, fear of darkness'),
  ('betrayal', 'Lachesis', 5, 'Jealousy, suspicion, betrayal themes'),
  ('betrayal', 'Natrum Muriaticum', 4, 'Closes off after betrayal'),
  ('betrayal', 'Hyoscyamus', 3, 'Jealousy with paranoia'),
  ('anger', 'Nux Vomica', 5, 'Irritable, impatient, easily angered'),
  ('anger', 'Chamomilla', 5, 'Anger with intolerance to pain'),
  ('anger', 'Staphysagria', 4, 'Suppressed anger after offense'),
  ('anger', 'Lycopodium', 3, 'Anger from contradiction'),
  ('injustice', 'Causticum', 5, 'Strong sense of injustice, rebellious'),
  ('injustice', 'Staphysagria', 4, 'Indignation at unfair treatment'),
  ('performance anxiety', 'Argentum Nitricum', 5, 'Anticipatory anxiety, hurried'),
  ('performance anxiety', 'Gelsemium', 5, 'Stage fright, weakness, trembling'),
  ('performance anxiety', 'Lycopodium', 4, 'Lack of confidence, fear of failure'),
  ('dependence', 'Pulsatilla', 5, 'Needs consolation, clings to others'),
  ('dependence', 'Calcarea Carbonica', 4, 'Needs security, slow to act alone'),
  ('control', 'Arsenicum Album', 5, 'Need for order and control'),
  ('control', 'Nux Vomica', 4, 'Controlling, type-A driven'),
  ('control', 'Lycopodium', 3, 'Hides insecurity behind control'),
  ('abandonment', 'Pulsatilla', 5, 'Fear of being alone, forsaken'),
  ('abandonment', 'Natrum Muriaticum', 4, 'Withdraws after feeling abandoned'),
  ('abandonment', 'Phosphorus', 3, 'Needs company constantly'),
  ('oversensitivity', 'Phosphorus', 5, 'Sensitive to impressions, sympathetic'),
  ('oversensitivity', 'Ignatia', 4, 'Hypersensitive emotionally'),
  ('oversensitivity', 'Staphysagria', 4, 'Sensitive to rudeness'),
  ('oversensitivity', 'Nux Vomica', 3, 'Sensitive to noise, light, odors');