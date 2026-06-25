
-- Formulation types
CREATE TABLE public.formulation_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.formulation_types TO anon, authenticated;
GRANT ALL ON public.formulation_types TO service_role;
ALTER TABLE public.formulation_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read formulation_types" ON public.formulation_types FOR SELECT USING (true);
CREATE POLICY "Admins manage formulation_types" ON public.formulation_types FOR ALL
  USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_formulation_types_updated BEFORE UPDATE ON public.formulation_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Classical formulas
CREATE TABLE public.classical_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  formulation_type_id UUID REFERENCES public.formulation_types(id) ON DELETE SET NULL,
  classical_reference TEXT,
  ingredients JSONB DEFAULT '[]'::jsonb,
  indications TEXT[] DEFAULT '{}',
  dose TEXT,
  anupana TEXT,
  contra_indications TEXT,
  special_notes TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.classical_formulas TO anon, authenticated;
GRANT ALL ON public.classical_formulas TO service_role;
ALTER TABLE public.classical_formulas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published formulas" ON public.classical_formulas FOR SELECT
  USING (is_published = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage classical_formulas" ON public.classical_formulas FOR ALL
  USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_classical_formulas_updated BEFORE UPDATE ON public.classical_formulas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_classical_formulas_type ON public.classical_formulas(formulation_type_id);
CREATE INDEX idx_classical_formulas_name ON public.classical_formulas USING gin (lower(name) gin_trgm_ops);

-- Manufacturer products
CREATE TABLE public.manufacturer_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formula_id UUID REFERENCES public.classical_formulas(id) ON DELETE CASCADE,
  manufacturer_id UUID REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  brand_name TEXT,
  pack_sizes JSONB DEFAULT '[]'::jsonb,
  composition_notes TEXT,
  gmp_certified BOOLEAN DEFAULT false,
  fssai_number TEXT,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.manufacturer_products TO anon, authenticated;
GRANT ALL ON public.manufacturer_products TO service_role;
ALTER TABLE public.manufacturer_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read available products" ON public.manufacturer_products FOR SELECT
  USING (is_available = true OR public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage manufacturer_products" ON public.manufacturer_products FOR ALL
  USING (public.is_admin_or_super(auth.uid())) WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_manufacturer_products_updated BEFORE UPDATE ON public.manufacturer_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_manufacturer_products_formula ON public.manufacturer_products(formula_id);
CREATE INDEX idx_manufacturer_products_manufacturer ON public.manufacturer_products(manufacturer_id);

-- Formulary bookmarks
CREATE TABLE public.formulary_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL,
  formula_id UUID NOT NULL REFERENCES public.classical_formulas(id) ON DELETE CASCADE,
  personal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (doctor_id, formula_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.formulary_bookmarks TO authenticated;
GRANT ALL ON public.formulary_bookmarks TO service_role;
ALTER TABLE public.formulary_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Doctors manage own bookmarks" ON public.formulary_bookmarks FOR ALL
  USING (auth.uid() = doctor_id) WITH CHECK (auth.uid() = doctor_id);
CREATE POLICY "Admins view all bookmarks" ON public.formulary_bookmarks FOR SELECT
  USING (public.is_admin_or_super(auth.uid()));
CREATE TRIGGER trg_formulary_bookmarks_updated BEFORE UPDATE ON public.formulary_bookmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_formulary_bookmarks_doctor ON public.formulary_bookmarks(doctor_id);

-- Seed common formulation types
INSERT INTO public.formulation_types (name, name_sanskrit, sort_order) VALUES
  ('Kashayam','कषायम्',10),
  ('Churnam','चूर्णम्',20),
  ('Arishta','अरिष्ट',30),
  ('Asava','आसव',40),
  ('Tailam','तैलम्',50),
  ('Ghritam','घृतम्',60),
  ('Lehyam','लेह्यम्',70),
  ('Vati/Gutika','वटी/गुटिका',80),
  ('Bhasma','भस्म',90),
  ('Rasayana','रसायन',100);
