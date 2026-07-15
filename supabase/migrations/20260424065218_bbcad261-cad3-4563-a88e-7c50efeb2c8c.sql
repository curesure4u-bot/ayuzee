ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_type text DEFAULT 'retail'
    CHECK (product_type IN (
      'retail',
      'bulk',
      'classical',
      'patented',
      'panchakarma',
      'surgical',
      'treatment_kit'
    )),
  ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ayush_system text DEFAULT 'Ayurveda'
    CHECK (ayush_system IN ('Ayurveda','Homeopathy','Unani','Siddha','Yoga & Naturopathy','Multi-system')),
  ADD COLUMN IF NOT EXISTS treatment_use text,
  ADD COLUMN IF NOT EXISTS dosage_form text,
  ADD COLUMN IF NOT EXISTS is_prescription_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_surgical boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS surgical_category text,
  ADD COLUMN IF NOT EXISTS is_offers boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS offer_label text,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.health_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  system_category text,
  icon text,
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true
);

ALTER TABLE public.health_conditions
  ADD COLUMN IF NOT EXISTS system_category text,
  ADD COLUMN IF NOT EXISTS icon text,
  ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active health conditions are public" ON public.health_conditions;
CREATE POLICY "Active health conditions are public"
  ON public.health_conditions
  FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage health conditions" ON public.health_conditions;
CREATE POLICY "Admins can manage health conditions"
  ON public.health_conditions
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.surgical_products AS
  SELECT * FROM public.products WHERE is_surgical = true AND stock > 0;

CREATE OR REPLACE VIEW public.panchakarma_medicines AS
  SELECT * FROM public.products WHERE product_type = 'panchakarma' AND stock > 0;