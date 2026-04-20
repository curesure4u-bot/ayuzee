
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS bulk_brand text,
  ADD COLUMN IF NOT EXISTS bulk_classical_type text,
  ADD COLUMN IF NOT EXISTS bulk_patented_type text,
  ADD COLUMN IF NOT EXISTS is_bulk boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_bulk_brand ON public.products(bulk_brand);
CREATE INDEX IF NOT EXISTS idx_products_bulk_classical ON public.products(bulk_classical_type);
CREATE INDEX IF NOT EXISTS idx_products_bulk_patented ON public.products(bulk_patented_type);
CREATE INDEX IF NOT EXISTS idx_products_is_bulk ON public.products(is_bulk);

CREATE TABLE IF NOT EXISTS public.product_bulk_tiers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_qty integer NOT NULL,
  unit_price integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, min_qty)
);

CREATE INDEX IF NOT EXISTS idx_bulk_tiers_product ON public.product_bulk_tiers(product_id);

ALTER TABLE public.product_bulk_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bulk tiers public read"
  ON public.product_bulk_tiers
  FOR SELECT
  USING (true);

CREATE POLICY "Admins manage bulk tiers"
  ON public.product_bulk_tiers
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
