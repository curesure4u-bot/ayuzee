
-- 1. ASSESSMENTS
CREATE TABLE public.swasthavritta_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vaidya_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','reviewed','signed_off')),
  height_cm NUMERIC,
  weight_kg NUMERIC,
  bmi NUMERIC,
  prakriti TEXT,
  agni TEXT,
  koshtha TEXT,
  sara TEXT,
  samhanan TEXT,
  sleep_time TIME,
  wake_time TIME,
  sleep_quality TEXT,
  day_sleep BOOLEAN DEFAULT false,
  exercise_type TEXT,
  exercise_minutes INT,
  yoga_practice BOOLEAN DEFAULT false,
  pranayama_practice BOOLEAN DEFAULT false,
  food_type TEXT,
  meal_timings JSONB DEFAULT '{}'::jsonb,
  food_faults JSONB DEFAULT '{}'::jsonb,
  water_intake_litres NUMERIC,
  fasting_practice BOOLEAN DEFAULT false,
  screen_time_hours NUMERIC,
  addictions TEXT,
  occupation_type TEXT,
  vega_suppression JSONB DEFAULT '{}'::jsonb,
  mental_stress BOOLEAN DEFAULT false,
  mental_stress_source TEXT,
  current_medications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.swasthavritta_assessments TO authenticated;
GRANT ALL ON public.swasthavritta_assessments TO service_role;
ALTER TABLE public.swasthavritta_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sw_assess_patient_all" ON public.swasthavritta_assessments
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "sw_assess_vaidya_all" ON public.swasthavritta_assessments
  FOR ALL TO authenticated
  USING (auth.uid() = vaidya_id)
  WITH CHECK (auth.uid() = vaidya_id);

CREATE POLICY "sw_assess_admin_all" ON public.swasthavritta_assessments
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_sw_assess_patient ON public.swasthavritta_assessments(patient_id);
CREATE INDEX idx_sw_assess_vaidya ON public.swasthavritta_assessments(vaidya_id);

CREATE TRIGGER trg_sw_assess_updated
  BEFORE UPDATE ON public.swasthavritta_assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. PLANS
CREATE TABLE public.swasthavritta_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.swasthavritta_assessments(id) ON DELETE CASCADE,
  ahara_advice TEXT,
  vihara_advice TEXT,
  nidra_advice TEXT,
  dinacharya_measures TEXT,
  mental_health_advice TEXT,
  ai_generated_draft JSONB,
  vaidya_edited BOOLEAN NOT NULL DEFAULT false,
  signed_off BOOLEAN NOT NULL DEFAULT false,
  signed_off_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  signed_off_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.swasthavritta_plans TO authenticated;
GRANT ALL ON public.swasthavritta_plans TO service_role;
ALTER TABLE public.swasthavritta_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sw_plans_patient_all" ON public.swasthavritta_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.swasthavritta_assessments a
                 WHERE a.id = assessment_id AND a.patient_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.swasthavritta_assessments a
                      WHERE a.id = assessment_id AND a.patient_id = auth.uid()));

CREATE POLICY "sw_plans_vaidya_all" ON public.swasthavritta_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.swasthavritta_assessments a
                 WHERE a.id = assessment_id AND a.vaidya_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.swasthavritta_assessments a
                      WHERE a.id = assessment_id AND a.vaidya_id = auth.uid()));

CREATE POLICY "sw_plans_admin_all" ON public.swasthavritta_plans
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_sw_plans_assessment ON public.swasthavritta_plans(assessment_id);

-- 3. DIET PLANS
CREATE TABLE public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.swasthavritta_plans(id) ON DELETE CASCADE,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('morning_drink','breakfast','lunch','evening_tea','dinner')),
  timing TIME,
  food_items TEXT,
  therapeutic_peya TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diet_plans TO authenticated;
GRANT ALL ON public.diet_plans TO service_role;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "diet_plans_patient_all" ON public.diet_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                 JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                 WHERE p.id = plan_id AND a.patient_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                      JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                      WHERE p.id = plan_id AND a.patient_id = auth.uid()));

CREATE POLICY "diet_plans_vaidya_all" ON public.diet_plans
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                 JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                 WHERE p.id = plan_id AND a.vaidya_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                      JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                      WHERE p.id = plan_id AND a.vaidya_id = auth.uid()));

CREATE POLICY "diet_plans_admin_all" ON public.diet_plans
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_diet_plans_plan ON public.diet_plans(plan_id);

-- 4. DAILY REGIMEN LOGS
CREATE TABLE public.daily_regimen_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.swasthavritta_plans(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT current_date,
  checklist JSONB DEFAULT '{}'::jsonb,
  meals_followed JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (patient_id, plan_id, log_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_regimen_logs TO authenticated;
GRANT ALL ON public.daily_regimen_logs TO service_role;
ALTER TABLE public.daily_regimen_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "regimen_logs_patient_all" ON public.daily_regimen_logs
  FOR ALL TO authenticated
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "regimen_logs_vaidya_all" ON public.daily_regimen_logs
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                 JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                 WHERE p.id = plan_id AND a.vaidya_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.swasthavritta_plans p
                      JOIN public.swasthavritta_assessments a ON a.id = p.assessment_id
                      WHERE p.id = plan_id AND a.vaidya_id = auth.uid()));

CREATE POLICY "regimen_logs_admin_all" ON public.daily_regimen_logs
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE INDEX idx_regimen_logs_patient ON public.daily_regimen_logs(patient_id);
CREATE INDEX idx_regimen_logs_plan ON public.daily_regimen_logs(plan_id);
