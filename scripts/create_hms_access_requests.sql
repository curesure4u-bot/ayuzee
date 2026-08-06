-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Access Request & Approval System
-- When staff sign up at /hms/auth, a request is created here.
-- Super Admin / Branch Admin approves from /admin/hms-access
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.hms_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  -- What they're requesting
  requested_role TEXT DEFAULT 'branch_doctor',
  requested_branch TEXT DEFAULT 'Main Branch',
  center_name TEXT DEFAULT 'Main Branch',
  center_type TEXT,
  role TEXT DEFAULT 'branch_doctor',
  daily_patients INT,
  message TEXT,
  specialization TEXT,
  experience_years INT,
  qualification TEXT,
  reason TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- Approval details (filled by admin)
  approved_role TEXT,
  approved_branch TEXT,
  approved_modules TEXT[],
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Meta
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON public.hms_access_requests
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);
CREATE POLICY "Users can create requests" ON public.hms_access_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage requests" ON public.hms_access_requests
  FOR UPDATE TO authenticated USING (true);

GRANT SELECT, INSERT, UPDATE ON public.hms_access_requests TO authenticated;
GRANT ALL ON public.hms_access_requests TO service_role;

CREATE INDEX IF NOT EXISTS idx_hms_access_req_status ON public.hms_access_requests(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hms_access_req_user ON public.hms_access_requests(user_id);
