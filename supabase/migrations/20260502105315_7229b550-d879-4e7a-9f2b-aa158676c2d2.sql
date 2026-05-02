-- Add manufacturer role to app_role enum (if not present)
DO $$ BEGIN
  ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manufacturer';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Manufacturers table
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  registration_number TEXT,
  gst_number TEXT,
  manufacturing_license_no TEXT,
  manufacturing_license_expiry DATE,
  drug_license_no TEXT,
  gmp_certificate_url TEXT,
  who_gmp_certificate_url TEXT,
  fssai_license_no TEXT,
  fssai_certificate_url TEXT,
  registration_certificate_url TEXT,
  drug_license_url TEXT,
  gst_certificate_url TEXT,
  cancelled_cheque_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  contact_person_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  bank_account_holder TEXT,
  bank_account_number TEXT,
  bank_ifsc TEXT,
  bank_name TEXT,
  approval_status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejection_reasons TEXT[] DEFAULT '{}'::TEXT[],
  rejection_comment TEXT,
  admin_notes JSONB DEFAULT '[]'::JSONB,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manufacturers_status ON public.manufacturers(approval_status);
CREATE INDEX IF NOT EXISTS idx_manufacturers_state ON public.manufacturers(state);

ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view manufacturers"
  ON public.manufacturers FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));

CREATE POLICY "Admins can update manufacturers"
  ON public.manufacturers FOR UPDATE TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));

CREATE POLICY "Admins can insert manufacturers"
  ON public.manufacturers FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));

CREATE POLICY "Owner can view own manufacturer"
  ON public.manufacturers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER trg_manufacturers_updated_at
  BEFORE UPDATE ON public.manufacturers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verification logs
CREATE TABLE IF NOT EXISTS public.manufacturer_verification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer_id UUID NOT NULL REFERENCES public.manufacturers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  verified_by UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mfr_verif_logs_mfr ON public.manufacturer_verification_logs(manufacturer_id);

ALTER TABLE public.manufacturer_verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view verification logs"
  ON public.manufacturer_verification_logs FOR SELECT TO authenticated
  USING (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));

CREATE POLICY "Admins can insert verification logs"
  ON public.manufacturer_verification_logs FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_or_super(auth.uid()) OR public.has_role(auth.uid(), 'product_admin'::public.app_role));
