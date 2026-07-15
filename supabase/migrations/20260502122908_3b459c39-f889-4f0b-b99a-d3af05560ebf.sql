
-- ============================================================================
-- Extend manufacturers with extra company / license / address / approval fields
-- ============================================================================
ALTER TABLE public.manufacturers
  ADD COLUMN IF NOT EXISTS trade_name TEXT,
  ADD COLUMN IF NOT EXISTS company_type TEXT,
  ADD COLUMN IF NOT EXISTS pan_number TEXT,
  ADD COLUMN IF NOT EXISTS year_established INTEGER,
  ADD COLUMN IF NOT EXISTS license_issuing_authority TEXT,
  ADD COLUMN IF NOT EXISTS gmp_certificate_number TEXT,
  ADD COLUMN IF NOT EXISTS gmp_certificate_type TEXT,
  ADD COLUMN IF NOT EXISTS iso_certification TEXT,
  ADD COLUMN IF NOT EXISTS ayush_license_number TEXT,
  ADD COLUMN IF NOT EXISTS contact_person_designation TEXT,
  ADD COLUMN IF NOT EXISTS alternate_phone TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS registered_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS registered_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS registered_country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS manufacturing_address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_city TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_state TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_pincode TEXT,
  ADD COLUMN IF NOT EXISTS manufacturing_country TEXT DEFAULT 'India',
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS account_type TEXT,
  ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS requested_info TEXT,
  ADD COLUMN IF NOT EXISTS info_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '{}'::jsonb;

-- Validation constraints (add only if missing)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturers_company_type_chk') THEN
    ALTER TABLE public.manufacturers
      ADD CONSTRAINT manufacturers_company_type_chk
      CHECK (company_type IS NULL OR company_type IN ('private_limited','partnership','proprietorship','public_limited'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturers_gmp_cert_type_chk') THEN
    ALTER TABLE public.manufacturers
      ADD CONSTRAINT manufacturers_gmp_cert_type_chk
      CHECK (gmp_certificate_type IS NULL OR gmp_certificate_type IN ('who_gmp','ayush_gmp','other'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturers_account_type_chk') THEN
    ALTER TABLE public.manufacturers
      ADD CONSTRAINT manufacturers_account_type_chk
      CHECK (account_type IS NULL OR account_type IN ('current','savings'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturers_approval_status_chk') THEN
    ALTER TABLE public.manufacturers
      ADD CONSTRAINT manufacturers_approval_status_chk
      CHECK (approval_status IN ('pending','under_review','info_requested','approved','rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_manufacturers_is_active ON public.manufacturers(is_active) WHERE is_active = true;

-- ============================================================================
-- Extend manufacturer_verification_logs with issue_type + new statuses
-- ============================================================================
ALTER TABLE public.manufacturer_verification_logs
  ADD COLUMN IF NOT EXISTS issue_type TEXT;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'manufacturer_verification_logs_status_check') THEN
    ALTER TABLE public.manufacturer_verification_logs DROP CONSTRAINT manufacturer_verification_logs_status_check;
  END IF;
  ALTER TABLE public.manufacturer_verification_logs
    ADD CONSTRAINT manufacturer_verification_logs_status_check
    CHECK (status IN ('verified','issue_found','pending','clarification_needed'));
END $$;

CREATE INDEX IF NOT EXISTS idx_mfr_verif_logs_status ON public.manufacturer_verification_logs(status);

-- ============================================================================
-- SUPPLIERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  supplier_type TEXT CHECK (supplier_type IN ('distributor','logistics_partner','warehouse')),
  contact_person_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  whatsapp_number TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  bank_account_holder_name TEXT,
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  bank_name TEXT,
  bank_branch TEXT,
  serviceable_pincodes JSONB DEFAULT '[]'::jsonb,
  serviceable_states JSONB DEFAULT '[]'::jsonb,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending','approved','rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_approval_status ON public.suppliers(approval_status);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON public.suppliers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_suppliers_state ON public.suppliers(state);

DROP TRIGGER IF EXISTS trg_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER trg_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage suppliers" ON public.suppliers;
CREATE POLICY "Admins manage suppliers" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role))
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));

DROP POLICY IF EXISTS "Approved suppliers viewable by authenticated" ON public.suppliers;
CREATE POLICY "Approved suppliers viewable by authenticated" ON public.suppliers
  FOR SELECT TO authenticated
  USING (is_active = true AND approval_status = 'approved');

COMMENT ON TABLE public.suppliers IS 'Distributors and logistics partners for order fulfillment';
