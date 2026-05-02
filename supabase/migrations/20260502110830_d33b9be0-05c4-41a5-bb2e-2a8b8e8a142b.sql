-- Extend payout_requests
ALTER TABLE public.payout_requests
  ADD COLUMN IF NOT EXISTS account_holder_name TEXT,
  ADD COLUMN IF NOT EXISTS account_number_masked TEXT,
  ADD COLUMN IF NOT EXISTS ifsc_code TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_branch TEXT,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS utr_number TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_payout_id TEXT,
  ADD COLUMN IF NOT EXISTS tds_amount NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_amount NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS hold_reason TEXT,
  ADD COLUMN IF NOT EXISTS supporting_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejected_by UUID,
  ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS held_by UUID,
  ADD COLUMN IF NOT EXISTS held_at TIMESTAMPTZ;

-- Audit log
CREATE TABLE IF NOT EXISTS public.payout_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_request_id UUID NOT NULL REFERENCES public.payout_requests(id) ON DELETE CASCADE,
  actor_user_id UUID,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_audit_request ON public.payout_audit_log(payout_request_id, created_at DESC);

ALTER TABLE public.payout_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read payout audit"
ON public.payout_audit_log FOR SELECT
TO authenticated
USING (public.is_admin_or_super(auth.uid()));

CREATE POLICY "Admins insert payout audit"
ON public.payout_audit_log FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_super(auth.uid()));