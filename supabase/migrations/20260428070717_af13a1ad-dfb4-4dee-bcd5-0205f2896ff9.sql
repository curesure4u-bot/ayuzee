-- Ashtavidha Pariksha (8-fold examination)
CREATE TABLE public.vaidya_ashtavidha_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  patient_name TEXT,
  patient_age INT,
  patient_gender TEXT,
  exam_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- 8 folds
  nadi JSONB DEFAULT '{}'::jsonb,        -- pulse: rate, rhythm, dosha (vata/pitta/kapha), notes
  mutra JSONB DEFAULT '{}'::jsonb,       -- urine: color, frequency, odor, notes
  mala JSONB DEFAULT '{}'::jsonb,        -- stool: consistency, frequency, color, notes
  jihva JSONB DEFAULT '{}'::jsonb,       -- tongue: coating, color, moisture, notes
  shabda JSONB DEFAULT '{}'::jsonb,      -- voice/sound: clarity, tone, notes
  sparsha JSONB DEFAULT '{}'::jsonb,     -- touch/skin: temperature, moisture, texture, notes
  drik JSONB DEFAULT '{}'::jsonb,        -- eyes: color, luster, notes
  akriti JSONB DEFAULT '{}'::jsonb,      -- body build: frame, weight, notes
  dosha_assessment TEXT,                 -- Vata / Pitta / Kapha / Vata-Pitta etc.
  clinical_impression TEXT,
  recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_ashtavidha_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own ashtavidha exams"
  ON public.vaidya_ashtavidha_exams FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Admins view all ashtavidha exams"
  ON public.vaidya_ashtavidha_exams FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_ashtavidha_updated
  BEFORE UPDATE ON public.vaidya_ashtavidha_exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ashtavidha_doctor ON public.vaidya_ashtavidha_exams(doctor_user_id, exam_date DESC);
CREATE INDEX idx_ashtavidha_patient ON public.vaidya_ashtavidha_exams(patient_user_id);

-- Panchakarma Plans (header)
CREATE TABLE public.vaidya_panchakarma_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  patient_name TEXT NOT NULL,
  patient_age INT,
  patient_gender TEXT,
  indication TEXT NOT NULL,           -- e.g. "Chronic Arthritis", "Obesity"
  prakriti TEXT,                      -- constitution
  vikriti TEXT,                       -- imbalance
  primary_procedure TEXT,             -- Vamana / Virechana / Basti / Nasya / Raktamokshana
  total_days INT NOT NULL DEFAULT 14,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'planned', -- planned | active | completed | cancelled
  ai_recommendation JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_panchakarma_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own panchakarma plans"
  ON public.vaidya_panchakarma_plans FOR ALL
  USING (auth.uid() = doctor_user_id)
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Admins view all panchakarma plans"
  ON public.vaidya_panchakarma_plans FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_plan_updated
  BEFORE UPDATE ON public.vaidya_panchakarma_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_plan_doctor ON public.vaidya_panchakarma_plans(doctor_user_id, start_date DESC);

-- Panchakarma day-wise schedule
CREATE TABLE public.vaidya_panchakarma_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.vaidya_panchakarma_plans(id) ON DELETE CASCADE,
  day_number INT NOT NULL,
  scheduled_date DATE,
  phase TEXT NOT NULL,        -- purvakarma | pradhanakarma | paschatkarma
  procedure TEXT NOT NULL,    -- Snehana / Swedana / Vamana / Virechana / Basti / Nasya etc.
  medicines TEXT,
  diet TEXT,
  duration_minutes INT,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vaidya_panchakarma_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors manage own panchakarma days"
  ON public.vaidya_panchakarma_days FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.vaidya_panchakarma_plans p
    WHERE p.id = plan_id AND p.doctor_user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.vaidya_panchakarma_plans p
    WHERE p.id = plan_id AND p.doctor_user_id = auth.uid()
  ));

CREATE POLICY "Admins view all panchakarma days"
  ON public.vaidya_panchakarma_days FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_pk_day_updated
  BEFORE UPDATE ON public.vaidya_panchakarma_days
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pk_day_plan ON public.vaidya_panchakarma_days(plan_id, day_number);