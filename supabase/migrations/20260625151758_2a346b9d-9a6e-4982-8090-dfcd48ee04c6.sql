
-- 1) Doctors HMS columns
ALTER TABLE public.doctors
  ADD COLUMN IF NOT EXISTS hms_access BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS hms_branch TEXT,
  ADD COLUMN IF NOT EXISTS hms_center_type TEXT,
  ADD COLUMN IF NOT EXISTS hms_access_granted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS hms_access_granted_by UUID REFERENCES auth.users(id);

-- 2) hms_branches
CREATE TABLE IF NOT EXISTS public.hms_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_name TEXT NOT NULL,
  branch_code TEXT UNIQUE NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  phone TEXT,
  branch_type TEXT CHECK (branch_type IN ('main_hospital','branch','franchisee','exclusive_center')),
  manager_name TEXT,
  bed_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  opened_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hms_branches TO authenticated;
GRANT ALL ON public.hms_branches TO service_role;

ALTER TABLE public.hms_branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view active branches"
  ON public.hms_branches FOR SELECT TO authenticated
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Admins manage branches"
  ON public.hms_branches FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

-- Seed branches
INSERT INTO public.hms_branches (branch_name, branch_code, branch_type, bed_count, city, state)
VALUES
  ('Main Hospital — Kadayanallur','ALSH-01','main_hospital',15,'Kadayanallur','Tamil Nadu'),
  ('Branch 2','ALSH-02','branch',0,NULL,'Tamil Nadu'),
  ('Branch 3','ALSH-03','branch',0,NULL,'Tamil Nadu'),
  ('Branch 4','ALSH-04','branch',0,NULL,'Tamil Nadu'),
  ('Branch 5','ALSH-05','branch',0,NULL,'Tamil Nadu'),
  ('Branch 6','ALSH-06','branch',0,NULL,'Tamil Nadu')
ON CONFLICT (branch_code) DO NOTHING;

-- 3) hms_access_requests
CREATE TABLE IF NOT EXISTS public.hms_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_user_id UUID NOT NULL,
  center_name TEXT NOT NULL,
  role TEXT,
  center_type TEXT,
  daily_patients INTEGER,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.hms_access_requests TO authenticated;
GRANT ALL ON public.hms_access_requests TO service_role;

ALTER TABLE public.hms_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own requests"
  ON public.hms_access_requests FOR SELECT TO authenticated
  USING (doctor_user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));

CREATE POLICY "Users create own requests"
  ON public.hms_access_requests FOR INSERT TO authenticated
  WITH CHECK (doctor_user_id = auth.uid());

CREATE POLICY "Admins update requests"
  ON public.hms_access_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR public.has_role(auth.uid(), 'super_admin'::public.app_role));
