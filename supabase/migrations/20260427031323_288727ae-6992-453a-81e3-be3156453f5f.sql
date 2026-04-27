-- =========================================================
-- FOOD RECIPES LIBRARY (AYUSH Traditional Food as Medicine)
-- =========================================================
CREATE TABLE public.food_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  subtitle TEXT,
  system TEXT NOT NULL DEFAULT 'Ayurveda',
  category TEXT NOT NULL DEFAULT 'food',
  description TEXT,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  servings TEXT,
  method TEXT NOT NULL,
  health_benefits TEXT NOT NULL,
  contraindications TEXT,
  precautions TEXT,
  indications TEXT[] NOT NULL DEFAULT '{}',
  suitable_doshas TEXT[] NOT NULL DEFAULT '{}',
  diabetic_friendly BOOLEAN NOT NULL DEFAULT false,
  pregnancy_safe BOOLEAN NOT NULL DEFAULT true,
  lactation_friendly BOOLEAN NOT NULL DEFAULT false,
  children_friendly BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'Ministry of AYUSH, Government of India',
  is_published BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_food_recipes_system ON public.food_recipes(system);
CREATE INDEX idx_food_recipes_indications ON public.food_recipes USING GIN(indications);
CREATE INDEX idx_food_recipes_doshas ON public.food_recipes USING GIN(suitable_doshas);
CREATE INDEX idx_food_recipes_published ON public.food_recipes(is_published, display_order);

ALTER TABLE public.food_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published food recipes"
  ON public.food_recipes FOR SELECT
  USING (is_published = true OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins manage food recipes"
  ON public.food_recipes FOR ALL
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_food_recipes_updated
  BEFORE UPDATE ON public.food_recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- PRESCRIPTION ↔ FOOD RECIPE LINK
-- =========================================================
CREATE TABLE public.prescription_food_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES public.homeo_prescriptions(id) ON DELETE CASCADE,
  recipe_id UUID NOT NULL REFERENCES public.food_recipes(id) ON DELETE CASCADE,
  doctor_user_id UUID NOT NULL,
  patient_id UUID,
  dose TEXT,
  when_to_take TEXT,
  duration TEXT,
  doctor_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prescription_id, recipe_id)
);

CREATE INDEX idx_pfr_prescription ON public.prescription_food_recipes(prescription_id);
CREATE INDEX idx_pfr_patient ON public.prescription_food_recipes(patient_id);

ALTER TABLE public.prescription_food_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Doctor manages own prescription recipes"
  ON public.prescription_food_recipes FOR ALL
  USING (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()))
  WITH CHECK (auth.uid() = doctor_user_id OR public.is_admin_or_super(auth.uid()));

CREATE POLICY "Patient can view recipes attached to their prescription"
  ON public.prescription_food_recipes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.homeo_patients hp
      WHERE hp.id = prescription_food_recipes.patient_id
        AND lower(hp.email) = lower(coalesce((auth.jwt() ->> 'email'), ''))
    )
  );