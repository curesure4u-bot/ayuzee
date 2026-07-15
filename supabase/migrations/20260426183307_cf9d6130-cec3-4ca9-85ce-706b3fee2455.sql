-- 1. Enrich homeo_symptoms with structured rubric fields
ALTER TABLE public.homeo_symptoms
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS body_location TEXT,
  ADD COLUMN IF NOT EXISTS sensation TEXT,
  ADD COLUMN IF NOT EXISTS modalities_better TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS modalities_worse TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS symptom_keywords TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS concomitant_symptoms TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS search_text TEXT;

-- Maintain a denormalized search_text column for fuzzy + ilike search
CREATE OR REPLACE FUNCTION public.homeo_symptoms_refresh_search()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.search_text := lower(concat_ws(' ',
    NEW.chapter, NEW.subcategory, NEW.rubric, NEW.sub_rubric,
    NEW.body_location, NEW.sensation, NEW.notes,
    array_to_string(COALESCE(NEW.symptom_keywords, '{}'), ' '),
    array_to_string(COALESCE(NEW.modalities_better, '{}'), ' '),
    array_to_string(COALESCE(NEW.modalities_worse, '{}'), ' '),
    array_to_string(COALESCE(NEW.concomitant_symptoms, '{}'), ' ')
  ));
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_homeo_symptoms_search ON public.homeo_symptoms;
CREATE TRIGGER trg_homeo_symptoms_search
  BEFORE INSERT OR UPDATE ON public.homeo_symptoms
  FOR EACH ROW EXECUTE FUNCTION public.homeo_symptoms_refresh_search();

-- Backfill search_text for existing rows
UPDATE public.homeo_symptoms SET rubric = rubric;

CREATE INDEX IF NOT EXISTS idx_homeo_symptoms_search_trgm
  ON public.homeo_symptoms USING gin (search_text public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_homeo_symptoms_chapter ON public.homeo_symptoms(chapter);
CREATE INDEX IF NOT EXISTS idx_homeo_symptoms_subcategory ON public.homeo_symptoms(subcategory);

-- 2. Saved cases (doctor case basket persistence)
CREATE TABLE IF NOT EXISTS public.homeo_saved_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  patient_id UUID REFERENCES public.homeo_patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  notes TEXT,
  selected_rubric_ids UUID[] NOT NULL DEFAULT '{}',
  ranking_snapshot JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_homeo_saved_cases_doctor
  ON public.homeo_saved_cases(doctor_user_id, created_at DESC);

ALTER TABLE public.homeo_saved_cases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors view own saved cases" ON public.homeo_saved_cases;
CREATE POLICY "Doctors view own saved cases" ON public.homeo_saved_cases
  FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors insert own saved cases" ON public.homeo_saved_cases;
CREATE POLICY "Doctors insert own saved cases" ON public.homeo_saved_cases
  FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid());

DROP POLICY IF EXISTS "Doctors update own saved cases" ON public.homeo_saved_cases;
CREATE POLICY "Doctors update own saved cases" ON public.homeo_saved_cases
  FOR UPDATE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Doctors delete own saved cases" ON public.homeo_saved_cases;
CREATE POLICY "Doctors delete own saved cases" ON public.homeo_saved_cases
  FOR DELETE TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

DROP TRIGGER IF EXISTS trg_homeo_saved_cases_updated ON public.homeo_saved_cases;
CREATE TRIGGER trg_homeo_saved_cases_updated
  BEFORE UPDATE ON public.homeo_saved_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();