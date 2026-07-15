
-- 1. Categories
CREATE TABLE public.astg_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  modern_equivalent TEXT,
  icon TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_categories TO anon, authenticated;
GRANT ALL ON public.astg_categories TO service_role;
ALTER TABLE public.astg_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG categories readable by all"
  ON public.astg_categories FOR SELECT
  USING (true);
CREATE POLICY "Admins manage ASTG categories"
  ON public.astg_categories FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 2. Diseases
CREATE TABLE public.astg_diseases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.astg_categories(id) ON DELETE SET NULL,
  chapter_number INT,
  name TEXT NOT NULL,
  name_modern TEXT,
  definition TEXT,
  nidana TEXT,
  lakshana JSONB DEFAULT '{}'::jsonb,
  diagnostic_criteria TEXT,
  pathya TEXT,
  apathya TEXT,
  prognosis TEXT,
  reference_text TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_diseases TO anon, authenticated;
GRANT ALL ON public.astg_diseases TO service_role;
ALTER TABLE public.astg_diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published ASTG diseases readable by all"
  ON public.astg_diseases FOR SELECT
  USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ASTG diseases"
  ON public.astg_diseases FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 3. Treatment levels
CREATE TABLE public.astg_treatment_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disease_id UUID NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  level_number INT NOT NULL,
  level_label TEXT,
  facility_type TEXT,
  description TEXT,
  panchakarma_details TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_treatment_levels TO anon, authenticated;
GRANT ALL ON public.astg_treatment_levels TO service_role;
ALTER TABLE public.astg_treatment_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG treatment levels readable by all"
  ON public.astg_treatment_levels FOR SELECT
  USING (true);
CREATE POLICY "Admins manage ASTG treatment levels"
  ON public.astg_treatment_levels FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 4. Medicines
CREATE TABLE public.astg_medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_level_id UUID REFERENCES public.astg_treatment_levels(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  dosha_type TEXT,
  medicine_name TEXT NOT NULL,
  formulation_type TEXT,
  dose TEXT,
  anupana TEXT,
  duration TEXT,
  notes TEXT,
  is_common BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_medicines TO anon, authenticated;
GRANT ALL ON public.astg_medicines TO service_role;
ALTER TABLE public.astg_medicines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ASTG medicines readable by all"
  ON public.astg_medicines FOR SELECT
  USING (true);
CREATE POLICY "Admins manage ASTG medicines"
  ON public.astg_medicines FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- 5. Doctor bookmarks
CREATE TABLE public.astg_doctor_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  disease_id UUID NOT NULL REFERENCES public.astg_diseases(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, disease_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.astg_doctor_bookmarks TO authenticated;
GRANT ALL ON public.astg_doctor_bookmarks TO service_role;
ALTER TABLE public.astg_doctor_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own ASTG bookmarks"
  ON public.astg_doctor_bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = doctor_id)
  WITH CHECK (auth.uid() = doctor_id);

-- Indexes
CREATE INDEX idx_astg_diseases_category ON public.astg_diseases(category_id);
CREATE INDEX idx_astg_diseases_search ON public.astg_diseases USING gin(to_tsvector('english', name || ' ' || COALESCE(name_modern, '')));
CREATE INDEX idx_astg_treatment_levels_disease ON public.astg_treatment_levels(disease_id);
CREATE INDEX idx_astg_medicines_level ON public.astg_medicines(treatment_level_id);
CREATE INDEX idx_astg_medicines_disease ON public.astg_medicines(disease_id);
CREATE INDEX idx_astg_medicines_name ON public.astg_medicines USING gin(to_tsvector('english', medicine_name));
CREATE INDEX idx_astg_bookmarks_doctor ON public.astg_doctor_bookmarks(doctor_id);

-- updated_at triggers
CREATE TRIGGER update_astg_categories_updated_at BEFORE UPDATE ON public.astg_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astg_diseases_updated_at BEFORE UPDATE ON public.astg_diseases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astg_treatment_levels_updated_at BEFORE UPDATE ON public.astg_treatment_levels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astg_medicines_updated_at BEFORE UPDATE ON public.astg_medicines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_astg_bookmarks_updated_at BEFORE UPDATE ON public.astg_doctor_bookmarks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
