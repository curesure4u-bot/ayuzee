
-- ============================================================================
-- Add missing approval / commission / regulatory fields to products
-- ============================================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_comments TEXT,
  ADD COLUMN IF NOT EXISTS info_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_visible_to_doctors BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS manufacturer_id UUID REFERENCES public.manufacturers(id),
  ADD COLUMN IF NOT EXISTS doctor_commission_percentage NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS doctor_commission_fixed NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS platform_fee_percentage NUMERIC(5,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hsn_code TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_date DATE,
  ADD COLUMN IF NOT EXISTS regulatory_documents JSONB DEFAULT '{}'::jsonb;

-- Tighten approval_status check to the requested set
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_approval_status_chk') THEN
    ALTER TABLE public.products DROP CONSTRAINT products_approval_status_chk;
  END IF;
  ALTER TABLE public.products
    ADD CONSTRAINT products_approval_status_chk
    CHECK (approval_status IS NULL OR approval_status IN ('pending','info_requested','approved','rejected'));
END $$;

CREATE INDEX IF NOT EXISTS idx_products_manufacturer ON public.products(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_products_visible_doctors ON public.products(is_visible_to_doctors) WHERE is_visible_to_doctors = true;

-- ============================================================================
-- PRODUCT INVENTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.product_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id),
  batch_number TEXT NOT NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  quantity_sold INTEGER NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0),
  manufacturing_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  cost_price NUMERIC(10,2),
  mrp NUMERIC(10,2) NOT NULL,
  selling_price NUMERIC(10,2) NOT NULL,
  warehouse_location TEXT,
  supplier_id UUID REFERENCES public.suppliers(id),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_product_inventory_product ON public.product_inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_manufacturer ON public.product_inventory(manufacturer_id);
CREATE INDEX IF NOT EXISTS idx_product_inventory_expiry ON public.product_inventory(expiry_date);
CREATE INDEX IF NOT EXISTS idx_product_inventory_quantity ON public.product_inventory(quantity_available);

DROP TRIGGER IF EXISTS trg_product_inventory_updated_at ON public.product_inventory;
CREATE TRIGGER trg_product_inventory_updated_at
  BEFORE UPDATE ON public.product_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage product inventory" ON public.product_inventory;
CREATE POLICY "Admins manage product inventory" ON public.product_inventory
  FOR ALL TO authenticated
  USING (
    public.is_admin_or_super(auth.uid())
    OR public.has_role(auth.uid(), 'product_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  )
  WITH CHECK (
    public.is_admin_or_super(auth.uid())
    OR public.has_role(auth.uid(), 'product_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'orders_admin'::public.app_role)
  );

DROP POLICY IF EXISTS "Active inventory viewable by authenticated" ON public.product_inventory;
CREATE POLICY "Active inventory viewable by authenticated" ON public.product_inventory
  FOR SELECT TO authenticated
  USING (is_active = true);

COMMENT ON TABLE public.product_inventory IS 'Batch-wise inventory tracking with expiry dates';
