-- AFI Formulation types master
CREATE TABLE public.afi_formulation_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  description TEXT,
  sort_order INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.afi_formulation_types TO anon, authenticated;
GRANT ALL ON public.afi_formulation_types TO service_role;
ALTER TABLE public.afi_formulation_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read AFI types" ON public.afi_formulation_types
  FOR SELECT USING (true);
CREATE POLICY "Admins manage AFI types" ON public.afi_formulation_types
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

INSERT INTO public.afi_formulation_types (code, name, name_sanskrit, sort_order) VALUES
('ASAVA_ARISHTA', 'Asava & Arishta', 'Āsava & Ariṣṭa', 1),
('ARKA', 'Arka', 'Arka', 2),
('AVALEHA', 'Avaleha / Leha / Paka', 'Avaleha', 3),
('KVATHA_CHURNA', 'Kvatha Churna', 'Kvātha Cūrṇa', 4),
('GUGGULU', 'Guggulu', 'Guggulu', 5),
('GHRITA', 'Ghrita / Snehakalpa', 'Ghṛta', 6),
('CHURNA', 'Churna', 'Cūrṇa', 7),
('TAILA', 'Taila', 'Taila', 8),
('VATI_GUTIKA', 'Vati / Gutika', 'Vaṭī / Guṭikā', 9),
('VARTI_NETRA', 'Varti / Netrabindu / Anjana', 'Varti', 10),
('KUPIPAKVA', 'Kupipakva Rasayana', 'Kupīpakva', 11),
('PARPATI', 'Parpati', 'Parpaṭī', 12),
('PISHTI', 'Pishti', 'Piṣṭī', 13),
('BHASMA', 'Bhasma', 'Bhasma', 14),
('MANDURA', 'Mandura', 'Māṇḍūra', 15),
('RASAYOGA', 'Rasayoga', 'Rasayoga', 16),
('LAUHA', 'Lauha', 'Lauha', 17);

-- Main formulations table
CREATE TABLE public.afi_formulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  afi_number TEXT,
  afi_part INT,
  name TEXT NOT NULL,
  name_original TEXT,
  formulation_type_id UUID REFERENCES public.afi_formulation_types(id),
  classical_reference TEXT,
  classical_text TEXT,
  chapter_reference TEXT,
  verse_numbers TEXT,
  dose TEXT,
  dose_min TEXT,
  dose_max TEXT,
  dose_unit TEXT,
  indications TEXT[],
  indications_modern TEXT[],
  special_notes TEXT,
  method_of_preparation TEXT,
  characteristics TEXT,
  preservation TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  extraction_status TEXT NOT NULL DEFAULT 'pending',
  raw_text TEXT,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.afi_formulations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.afi_formulations TO authenticated;
GRANT ALL ON public.afi_formulations TO service_role;
ALTER TABLE public.afi_formulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published AFI" ON public.afi_formulations
  FOR SELECT USING (is_published = TRUE);
CREATE POLICY "Admins read all AFI" ON public.afi_formulations
  FOR SELECT TO authenticated USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage AFI" ON public.afi_formulations
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Ingredients
CREATE TABLE public.afi_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  formulation_id UUID NOT NULL REFERENCES public.afi_formulations(id) ON DELETE CASCADE,
  serial_number INT,
  name TEXT NOT NULL,
  name_sanskrit TEXT,
  common_name TEXT,
  part_used TEXT,
  part_used_full TEXT,
  quantity NUMERIC,
  unit TEXT,
  is_prakshepa BOOLEAN NOT NULL DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.afi_ingredients TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.afi_ingredients TO authenticated;
GRANT ALL ON public.afi_ingredients TO service_role;
ALTER TABLE public.afi_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read ingredients of published" ON public.afi_ingredients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.afi_formulations f
            WHERE f.id = formulation_id AND f.is_published = TRUE)
  );
CREATE POLICY "Admins read all ingredients" ON public.afi_ingredients
  FOR SELECT TO authenticated USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ingredients" ON public.afi_ingredients
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Disease → Formulation mapping
CREATE TABLE public.afi_disease_formulation_map (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  disease_name TEXT NOT NULL,
  disease_modern TEXT,
  formulation_id UUID REFERENCES public.afi_formulations(id) ON DELETE CASCADE,
  formulation_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.afi_disease_formulation_map TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.afi_disease_formulation_map TO authenticated;
GRANT ALL ON public.afi_disease_formulation_map TO service_role;
ALTER TABLE public.afi_disease_formulation_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read disease map" ON public.afi_disease_formulation_map
  FOR SELECT USING (true);
CREATE POLICY "Admins manage disease map" ON public.afi_disease_formulation_map
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Extraction log
CREATE TABLE public.afi_extraction_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  formulation_id UUID REFERENCES public.afi_formulations(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.afi_extraction_log TO authenticated;
GRANT ALL ON public.afi_extraction_log TO service_role;
ALTER TABLE public.afi_extraction_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read log" ON public.afi_extraction_log
  FOR SELECT TO authenticated USING (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins insert log" ON public.afi_extraction_log
  FOR INSERT TO authenticated WITH CHECK (public.is_admin_or_super(auth.uid()));

-- Indexes
CREATE INDEX idx_afi_formulations_name ON public.afi_formulations USING gin (to_tsvector('english', name));
CREATE INDEX idx_afi_formulations_type ON public.afi_formulations(formulation_type_id);
CREATE INDEX idx_afi_formulations_status ON public.afi_formulations(extraction_status);
CREATE INDEX idx_afi_formulations_published ON public.afi_formulations(is_published);
CREATE INDEX idx_afi_ingredients_form ON public.afi_ingredients(formulation_id);
CREATE INDEX idx_afi_ingredients_name ON public.afi_ingredients USING gin (to_tsvector('english', name));
CREATE INDEX idx_afi_disease_map_name ON public.afi_disease_formulation_map(disease_name);
CREATE INDEX idx_afi_disease_map_form ON public.afi_disease_formulation_map(formulation_id);

-- Updated_at triggers
CREATE TRIGGER trg_afi_types_updated BEFORE UPDATE ON public.afi_formulation_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_afi_formulations_updated BEFORE UPDATE ON public.afi_formulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();