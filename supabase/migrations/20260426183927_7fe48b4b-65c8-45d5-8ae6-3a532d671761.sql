
-- Extend homeo_remedies with full Materia Medica fields
ALTER TABLE public.homeo_remedies
  ADD COLUMN IF NOT EXISTS common_name TEXT,
  ADD COLUMN IF NOT EXISTS kingdom TEXT,
  ADD COLUMN IF NOT EXISTS key_personality TEXT,
  ADD COLUMN IF NOT EXISTS mental_emotional_picture TEXT,
  ADD COLUMN IF NOT EXISTS general_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS food_cravings TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS food_aversions TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS sleep_pattern TEXT,
  ADD COLUMN IF NOT EXISTS dreams TEXT,
  ADD COLUMN IF NOT EXISTS sweat TEXT,
  ADD COLUMN IF NOT EXISTS digestive_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS respiratory_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS skin_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS female_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS male_symptoms TEXT,
  ADD COLUMN IF NOT EXISTS children_indications TEXT,
  ADD COLUMN IF NOT EXISTS keynote_symptoms TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS common_clinical_uses TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS complementary_remedies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS antidotes TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS compare_with TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS usual_potencies TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS safety_notes TEXT,
  ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
  ADD COLUMN IF NOT EXISTS detail_level TEXT NOT NULL DEFAULT 'placeholder';

-- Trigram index for fast remedy search
CREATE INDEX IF NOT EXISTS idx_homeo_remedies_name_trgm
  ON public.homeo_remedies USING gin (name public.gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_homeo_remedies_common_name_trgm
  ON public.homeo_remedies USING gin (common_name public.gin_trgm_ops);

-- Doctor private notes (per remedy, per doctor)
CREATE TABLE IF NOT EXISTS public.homeo_doctor_remedy_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  remedy_id UUID NOT NULL REFERENCES public.homeo_remedies(id) ON DELETE CASCADE,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_user_id, remedy_id)
);

ALTER TABLE public.homeo_doctor_remedy_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctors view own remedy notes"
  ON public.homeo_doctor_remedy_notes FOR SELECT
  USING (auth.uid() = doctor_user_id);

CREATE POLICY "Doctors insert own remedy notes"
  ON public.homeo_doctor_remedy_notes FOR INSERT
  WITH CHECK (auth.uid() = doctor_user_id);

CREATE POLICY "Doctors update own remedy notes"
  ON public.homeo_doctor_remedy_notes FOR UPDATE
  USING (auth.uid() = doctor_user_id);

CREATE POLICY "Doctors delete own remedy notes"
  ON public.homeo_doctor_remedy_notes FOR DELETE
  USING (auth.uid() = doctor_user_id);

CREATE TRIGGER trg_homeo_doctor_remedy_notes_updated_at
  BEFORE UPDATE ON public.homeo_doctor_remedy_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_homeo_doctor_remedy_notes_doctor
  ON public.homeo_doctor_remedy_notes(doctor_user_id);
