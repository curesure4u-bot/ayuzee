
-- 1. Medicine ↔ supplier product link
CREATE TABLE IF NOT EXISTS public.astg_medicine_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_key TEXT NOT NULL UNIQUE,
  category_key TEXT NOT NULL,
  disease_key TEXT NOT NULL,
  level_number INT NOT NULL,
  medicine_name TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  supplier_sku TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.astg_medicine_links TO anon, authenticated;
GRANT ALL ON public.astg_medicine_links TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.astg_medicine_links TO authenticated;
ALTER TABLE public.astg_medicine_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ASTG medicine links"
  ON public.astg_medicine_links FOR SELECT
  USING (true);

CREATE POLICY "Admins manage ASTG medicine links insert"
  ON public.astg_medicine_links FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ASTG medicine links update"
  ON public.astg_medicine_links FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ASTG medicine links delete"
  ON public.astg_medicine_links FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_astg_medicine_links_updated
  BEFORE UPDATE ON public.astg_medicine_links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_astg_medicine_links_disease
  ON public.astg_medicine_links(category_key, disease_key);

-- 2. Patient handout translations
CREATE TABLE IF NOT EXISTS public.astg_handouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key TEXT NOT NULL,
  disease_key TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en','ta','ml','hi')),
  disease_name_translated TEXT,
  pathya_translated TEXT,
  apathya_translated TEXT,
  lifestyle_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_key, disease_key, language)
);
GRANT SELECT ON public.astg_handouts TO anon, authenticated;
GRANT ALL ON public.astg_handouts TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.astg_handouts TO authenticated;
ALTER TABLE public.astg_handouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read ASTG handouts"
  ON public.astg_handouts FOR SELECT
  USING (true);

CREATE POLICY "Admins manage ASTG handouts insert"
  ON public.astg_handouts FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ASTG handouts update"
  ON public.astg_handouts FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()))
  WITH CHECK (public.is_admin_or_super(auth.uid()));
CREATE POLICY "Admins manage ASTG handouts delete"
  ON public.astg_handouts FOR DELETE TO authenticated
  USING (public.is_admin_or_super(auth.uid()));

CREATE TRIGGER trg_astg_handouts_updated
  BEFORE UPDATE ON public.astg_handouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
