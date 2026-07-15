-- =========================================================
-- YOGA THERAPY AI MODULE
-- =========================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.yoga_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.yoga_plan_type AS ENUM ('beginner', 'therapeutic', 'advanced', '7_day', '21_day', '48_day_rejuvenation', 'custom');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.yoga_plan_section AS ENUM ('warmup', 'main', 'pranayama', 'meditation', 'relaxation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.yoga_item_kind AS ENUM ('asana', 'pranayama', 'meditation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- ASANAS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_asanas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sanskrit_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  category TEXT,                 -- standing, seated, supine, prone, twist, inversion, balance, restorative
  difficulty_level public.yoga_difficulty NOT NULL DEFAULT 'beginner',
  duration_seconds INTEGER,
  repetitions INTEGER,
  benefits TEXT[] NOT NULL DEFAULT '{}',
  indications TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  step_by_step_instructions TEXT[] NOT NULL DEFAULT '{}',
  breathing_pattern TEXT,
  common_mistakes TEXT[] DEFAULT '{}',
  modifications TEXT[] DEFAULT '{}',
  props_needed TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  doctor_notes TEXT,
  search_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yoga_asanas_search ON public.yoga_asanas USING GIN (search_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_yoga_asanas_category ON public.yoga_asanas(category);
CREATE INDEX IF NOT EXISTS idx_yoga_asanas_difficulty ON public.yoga_asanas(difficulty_level);

CREATE OR REPLACE FUNCTION public.yoga_asanas_refresh_search()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ',
    NEW.sanskrit_name, NEW.english_name, NEW.category, NEW.breathing_pattern,
    array_to_string(COALESCE(NEW.benefits,'{}'),' '),
    array_to_string(COALESCE(NEW.indications,'{}'),' '),
    array_to_string(COALESCE(NEW.contraindications,'{}'),' ')
  ));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_yoga_asanas_search ON public.yoga_asanas;
CREATE TRIGGER trg_yoga_asanas_search BEFORE INSERT OR UPDATE ON public.yoga_asanas
FOR EACH ROW EXECUTE FUNCTION public.yoga_asanas_refresh_search();

DROP TRIGGER IF EXISTS trg_yoga_asanas_updated ON public.yoga_asanas;
CREATE TRIGGER trg_yoga_asanas_updated BEFORE UPDATE ON public.yoga_asanas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PRANAYAMAS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_pranayamas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  english_name TEXT,
  category TEXT,                 -- balancing, cooling, energising, calming, cleansing
  benefits TEXT[] NOT NULL DEFAULT '{}',
  contraindications TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INTEGER,
  steps TEXT[] NOT NULL DEFAULT '{}',
  ratio TEXT,                    -- e.g., "1:4:2"
  safety_notes TEXT,
  difficulty_level public.yoga_difficulty NOT NULL DEFAULT 'beginner',
  image_url TEXT,
  video_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_yoga_pranayamas_updated ON public.yoga_pranayamas;
CREATE TRIGGER trg_yoga_pranayamas_updated BEFORE UPDATE ON public.yoga_pranayamas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- MEDITATIONS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  meditation_type TEXT,          -- breath_awareness, body_scan, mantra, gratitude, yoga_nidra, mindfulness, loving_kindness, pain_relaxation, sleep, stress_release
  benefits TEXT[] NOT NULL DEFAULT '{}',
  duration_minutes INTEGER,
  script TEXT,
  audio_url TEXT,
  contraindications TEXT[] DEFAULT '{}',
  difficulty_level public.yoga_difficulty NOT NULL DEFAULT 'beginner',
  image_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_yoga_meditations_updated ON public.yoga_meditations;
CREATE TRIGGER trg_yoga_meditations_updated BEFORE UPDATE ON public.yoga_meditations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CONDITION PROTOCOLS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_condition_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  condition_name TEXT NOT NULL,
  category TEXT,                 -- musculoskeletal, metabolic, mental_health, womens_health, lifestyle, special
  description TEXT,
  recommended_warmup TEXT[] DEFAULT '{}',
  recommended_asanas TEXT[] DEFAULT '{}',     -- array of asana slugs
  recommended_pranayamas TEXT[] DEFAULT '{}', -- array of pranayama slugs
  recommended_meditations TEXT[] DEFAULT '{}',-- array of meditation slugs
  precautions TEXT[] DEFAULT '{}',
  expected_outcome TEXT,
  duration_weeks INTEGER,
  frequency_per_week INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trg_yoga_protocols_updated ON public.yoga_condition_protocols;
CREATE TRIGGER trg_yoga_protocols_updated BEFORE UPDATE ON public.yoga_condition_protocols
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- ASSESSMENTS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  height_cm NUMERIC,
  weight_kg NUMERIC,
  bmi NUMERIC,
  chief_complaint TEXT,
  pain_score INTEGER,            -- 0-10
  mobility_limitation TEXT,
  energy_level INTEGER,          -- 0-10
  sleep_quality INTEGER,         -- 0-10
  stress_level INTEGER,          -- 0-10
  bp_history TEXT,
  diabetes_history TEXT,
  pregnancy_status TEXT,
  surgery_history TEXT,
  red_flags TEXT[] DEFAULT '{}', -- spine, knee, heart, etc.
  current_fitness_level public.yoga_difficulty,
  preferred_session_time TEXT,
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yoga_assessments_doctor ON public.yoga_assessments(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_yoga_assessments_patient ON public.yoga_assessments(patient_user_id);

DROP TRIGGER IF EXISTS trg_yoga_assessments_updated ON public.yoga_assessments;
CREATE TRIGGER trg_yoga_assessments_updated BEFORE UPDATE ON public.yoga_assessments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PLANS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  assessment_id UUID REFERENCES public.yoga_assessments(id) ON DELETE SET NULL,
  protocol_id UUID REFERENCES public.yoga_condition_protocols(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type public.yoga_plan_type NOT NULL DEFAULT 'therapeutic',
  condition_name TEXT,
  frequency_per_week INTEGER DEFAULT 5,
  duration_weeks INTEGER DEFAULT 4,
  precautions TEXT[] DEFAULT '{}',
  follow_up_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, paused, cancelled
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yoga_plans_doctor ON public.yoga_plans(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_yoga_plans_patient ON public.yoga_plans(patient_user_id);

DROP TRIGGER IF EXISTS trg_yoga_plans_updated ON public.yoga_plans;
CREATE TRIGGER trg_yoga_plans_updated BEFORE UPDATE ON public.yoga_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PLAN ITEMS (asanas/pranayamas/meditations linked to a plan)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.yoga_plans(id) ON DELETE CASCADE,
  section public.yoga_plan_section NOT NULL,
  item_kind public.yoga_item_kind NOT NULL,
  asana_id UUID REFERENCES public.yoga_asanas(id) ON DELETE SET NULL,
  pranayama_id UUID REFERENCES public.yoga_pranayamas(id) ON DELETE SET NULL,
  meditation_id UUID REFERENCES public.yoga_meditations(id) ON DELETE SET NULL,
  duration_seconds INTEGER,
  repetitions INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  doctor_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yoga_plan_items_plan ON public.yoga_plan_items(plan_id);

-- =========================================================
-- PROGRESS LOGS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.yoga_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.yoga_plans(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  patient_user_id UUID,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pain_score INTEGER,
  sleep_score INTEGER,
  stress_score INTEGER,
  flexibility_score INTEGER,
  weight_kg NUMERIC,
  energy_score INTEGER,
  practice_adherence_pct INTEGER,
  before_notes TEXT,
  after_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_yoga_progress_plan ON public.yoga_progress_logs(plan_id);
CREATE INDEX IF NOT EXISTS idx_yoga_progress_doctor ON public.yoga_progress_logs(doctor_user_id);

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
ALTER TABLE public.yoga_asanas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_pranayamas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_meditations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_condition_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_assessments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_plans               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_plan_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yoga_progress_logs       ENABLE ROW LEVEL SECURITY;

-- Public-readable libraries
CREATE POLICY "yoga_asanas_public_read" ON public.yoga_asanas
  FOR SELECT USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_asanas_admin_write" ON public.yoga_asanas
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "yoga_pranayamas_public_read" ON public.yoga_pranayamas
  FOR SELECT USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_pranayamas_admin_write" ON public.yoga_pranayamas
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "yoga_meditations_public_read" ON public.yoga_meditations
  FOR SELECT USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_meditations_admin_write" ON public.yoga_meditations
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE POLICY "yoga_protocols_public_read" ON public.yoga_condition_protocols
  FOR SELECT USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_protocols_admin_write" ON public.yoga_condition_protocols
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Assessments
CREATE POLICY "yoga_assess_doctor_all" ON public.yoga_assessments
  FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_assess_patient_read" ON public.yoga_assessments
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

-- Plans
CREATE POLICY "yoga_plans_doctor_all" ON public.yoga_plans
  FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_plans_patient_read" ON public.yoga_plans
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_user_id);

-- Plan items inherit access via plan
CREATE POLICY "yoga_plan_items_doctor_all" ON public.yoga_plan_items
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.yoga_plans p
      WHERE p.id = yoga_plan_items.plan_id
        AND (p.doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.yoga_plans p
      WHERE p.id = yoga_plan_items.plan_id
        AND (p.doctor_user_id = auth.uid() OR public.is_admin_or_super(auth.uid()))
    )
  );
CREATE POLICY "yoga_plan_items_patient_read" ON public.yoga_plan_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.yoga_plans p
      WHERE p.id = yoga_plan_items.plan_id AND p.patient_user_id = auth.uid()
    )
  );

-- Progress logs
CREATE POLICY "yoga_progress_doctor_all" ON public.yoga_progress_logs
  FOR ALL TO authenticated
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_progress_patient_rw" ON public.yoga_progress_logs
  FOR ALL TO authenticated
  USING (auth.uid() = patient_user_id)
  WITH CHECK (auth.uid() = patient_user_id);

-- =========================================================
-- STORAGE BUCKET
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('yoga-media', 'yoga-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "yoga_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'yoga-media');
CREATE POLICY "yoga_media_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'yoga-media' AND public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_media_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'yoga-media' AND public.is_admin_or_super(auth.uid()));
CREATE POLICY "yoga_media_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'yoga-media' AND public.is_admin_or_super(auth.uid()));