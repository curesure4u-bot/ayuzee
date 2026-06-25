-- Extend afi_formulations with API Part II columns
ALTER TABLE public.afi_formulations
  ADD COLUMN IF NOT EXISTS api_volume TEXT,
  ADD COLUMN IF NOT EXISTS api_afi_crossref TEXT,
  ADD COLUMN IF NOT EXISTS description_colour TEXT,
  ADD COLUMN IF NOT EXISTS description_texture TEXT,
  ADD COLUMN IF NOT EXISTS description_odour TEXT,
  ADD COLUMN IF NOT EXISTS description_taste TEXT,
  ADD COLUMN IF NOT EXISTS anupana TEXT,
  ADD COLUMN IF NOT EXISTS storage_conditions TEXT,
  ADD COLUMN IF NOT EXISTS ph_min NUMERIC,
  ADD COLUMN IF NOT EXISTS ph_max NUMERIC,
  ADD COLUMN IF NOT EXISTS ph_solution_concentration TEXT,
  ADD COLUMN IF NOT EXISTS loss_on_drying_max NUMERIC,
  ADD COLUMN IF NOT EXISTS total_ash_max NUMERIC,
  ADD COLUMN IF NOT EXISTS acid_insoluble_ash_max NUMERIC,
  ADD COLUMN IF NOT EXISTS alcohol_extractive_min NUMERIC,
  ADD COLUMN IF NOT EXISTS water_extractive_min NUMERIC,
  ADD COLUMN IF NOT EXISTS has_physicochemical_standards BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_tlc_profile BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_microscopy_id BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'AFI';

-- Unique constraint on name for upsert (case-insensitive via lower)
CREATE UNIQUE INDEX IF NOT EXISTS afi_formulations_name_lower_uniq
  ON public.afi_formulations (lower(name));

-- Botanical names table for API ingredients
CREATE TABLE IF NOT EXISTS public.api_botanical_names (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formulation_id UUID NOT NULL REFERENCES public.afi_formulations(id) ON DELETE CASCADE,
  ingredient_serial INT,
  sanskrit_name TEXT,
  botanical_name TEXT,
  common_name TEXT,
  api_part_vol_ref TEXT,
  part_used TEXT,
  part_used_full TEXT,
  quantity_ratio TEXT,
  is_prakshepa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.api_botanical_names TO anon, authenticated;
GRANT ALL ON public.api_botanical_names TO service_role;

ALTER TABLE public.api_botanical_names ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read botanical names"
  ON public.api_botanical_names FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.afi_formulations f
                 WHERE f.id = formulation_id AND f.is_published = true));

CREATE POLICY "Admins manage botanical names"
  ON public.api_botanical_names FOR ALL
  TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_api_botanical_formulation
  ON public.api_botanical_names (formulation_id);

CREATE INDEX IF NOT EXISTS idx_api_botanical_search
  ON public.api_botanical_names
  USING gin (to_tsvector('english', COALESCE(sanskrit_name,'') || ' ' || COALESCE(botanical_name,'') || ' ' || COALESCE(common_name,'')));

CREATE INDEX IF NOT EXISTS idx_api_botanical_name_trgm
  ON public.api_botanical_names USING gin (botanical_name gin_trgm_ops);