
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS approved_by uuid,
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS requested_info text,
  ADD COLUMN IF NOT EXISTS manufacturer_name text,
  ADD COLUMN IF NOT EXISTS uploaded_by uuid,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS license_number text,
  ADD COLUMN IF NOT EXISTS license_url text,
  ADD COLUMN IF NOT EXISTS gmp_certificate_url text,
  ADD COLUMN IF NOT EXISTS iso_certificate_url text,
  ADD COLUMN IF NOT EXISTS fssai_certificate_url text,
  ADD COLUMN IF NOT EXISTS batch_number text,
  ADD COLUMN IF NOT EXISTS expiry_date date,
  ADD COLUMN IF NOT EXISTS ingredients text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS claims text,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}'::text[];

CREATE INDEX IF NOT EXISTS idx_products_approval_status ON public.products(approval_status);
CREATE INDEX IF NOT EXISTS idx_products_submitted_at ON public.products(submitted_at DESC);
