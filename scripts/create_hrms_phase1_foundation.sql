-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 1: Foundation Tables                                    ║
-- ║                                                                              ║
-- ║  Creates: Organisations, Departments, Designations, Shifts, Audit Log        ║
-- ║  Alters:  hms_staff (adds employee master fields), hms_branches (org FK)     ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS / IF NOT EXISTS columns.                    ║
-- ║  Does NOT drop or rename any existing tables/columns.                        ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ORGANISATIONS (Multi-org / Future SaaS support)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  type TEXT DEFAULT 'hospital' CHECK (type IN (
    'hospital', 'clinic', 'panchakarma_centre', 'pharmacy',
    'pharmaceutical', 'manufacturing', 'corporate', 'multi_speciality'
  )),
  logo_url TEXT,
  address TEXT,
  city TEXT,
  state TEXT DEFAULT 'Tamil Nadu',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  gstin TEXT,
  pan TEXT,
  registration_no TEXT,
  established_date DATE,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_organisations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org visible to authenticated" ON hrms_organisations;
CREATE POLICY "Org visible to authenticated"
  ON hrms_organisations FOR SELECT TO authenticated
  USING (is_active = true OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage orgs" ON hrms_organisations;
CREATE POLICY "Admins manage orgs"
  ON hrms_organisations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::public.app_role) OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- Seed default organisation
INSERT INTO hrms_organisations (name, code, type, city, state)
VALUES ('Ayuzee Healthcare', 'AYUZEE-01', 'hospital', 'Kadayanallur', 'Tamil Nadu')
ON CONFLICT (code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. DEPARTMENTS (Normalised — replaces TEXT field usage)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  head_employee_id UUID, -- FK added after hms_staff ALTER
  parent_department_id UUID REFERENCES hrms_departments(id) ON DELETE SET NULL,
  description TEXT,
  is_clinical BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

ALTER TABLE hrms_departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Departments visible to HMS staff" ON hrms_departments;
CREATE POLICY "Departments visible to HMS staff"
  ON hrms_departments FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage departments" ON hrms_departments;
CREATE POLICY "Admins manage departments"
  ON hrms_departments FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- Seed departments from existing hms_staff data
INSERT INTO hrms_departments (name, is_clinical, sort_order)
VALUES
  ('Ayurveda', true, 1),
  ('Panchakarma', true, 2),
  ('Front Office', false, 3),
  ('IPD', true, 4),
  ('Pharmacy', true, 5),
  ('Laboratory', true, 6),
  ('Administration', false, 7),
  ('Nursing', true, 8),
  ('Yoga & Naturopathy', true, 9),
  ('Siddha', true, 10),
  ('Homeopathy', true, 11),
  ('Unani', true, 12),
  ('Physiotherapy', true, 13),
  ('Housekeeping', false, 14),
  ('Marketing', false, 15),
  ('Accounts', false, 16),
  ('IT', false, 17),
  ('Human Resources', false, 18)
ON CONFLICT (organisation_id, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. DESIGNATIONS (Role/title master)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_designations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT,
  level INTEGER DEFAULT 1, -- 1=Entry, 2=Junior, 3=Mid, 4=Senior, 5=Lead, 6=Manager, 7=Director
  department_id UUID REFERENCES hrms_departments(id) ON DELETE SET NULL,
  min_salary DECIMAL(12,2) DEFAULT 0,
  max_salary DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, name)
);

ALTER TABLE hrms_designations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Designations visible to HMS staff" ON hrms_designations;
CREATE POLICY "Designations visible to HMS staff"
  ON hrms_designations FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage designations" ON hrms_designations;
CREATE POLICY "Admins manage designations"
  ON hrms_designations FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- Seed designations
INSERT INTO hrms_designations (name, level, description)
VALUES
  ('Senior Consultant', 7, 'Senior Ayurveda/AYUSH Consultant'),
  ('Consultant', 6, 'Consultant Doctor'),
  ('Junior Doctor', 4, 'Junior/Resident Doctor'),
  ('RMO', 4, 'Resident Medical Officer'),
  ('Senior Therapist', 5, 'Senior Panchakarma/Yoga Therapist'),
  ('Therapist', 3, 'Panchakarma/Yoga Therapist'),
  ('Junior Therapist', 2, 'Junior/Trainee Therapist'),
  ('Head Nurse', 5, 'Head Nurse / Nursing Supervisor'),
  ('Staff Nurse', 3, 'Staff Nurse'),
  ('Pharmacist', 4, 'Licensed Pharmacist'),
  ('Pharmacy Assistant', 2, 'Pharmacy Assistant'),
  ('Lab Technician', 3, 'Laboratory Technician'),
  ('Senior Receptionist', 4, 'Senior Front Office Executive'),
  ('Receptionist', 2, 'Front Office Executive'),
  ('Branch Manager', 6, 'Branch/Centre Manager'),
  ('Admin Manager', 5, 'Administrative Manager'),
  ('Admin Executive', 3, 'Administrative Executive'),
  ('Housekeeping Staff', 1, 'Housekeeping/Support Staff'),
  ('Marketing Executive', 3, 'Marketing & Outreach'),
  ('Accounts Executive', 3, 'Accounts/Finance Executive'),
  ('HR Executive', 3, 'Human Resources Executive'),
  ('IT Support', 3, 'IT & Technical Support'),
  ('Driver', 1, 'Driver/Transport'),
  ('Security', 1, 'Security Staff')
ON CONFLICT (organisation_id, name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. SHIFTS (Shift definitions — replaces hardcoded shift IDs)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INTEGER DEFAULT 30,
  grace_minutes INTEGER DEFAULT 15,
  is_night_shift BOOLEAN DEFAULT false,
  is_split_shift BOOLEAN DEFAULT false,
  working_hours DECIMAL(4,2) GENERATED ALWAYS AS (
    CASE
      WHEN end_time > start_time THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 3600
      ELSE EXTRACT(EPOCH FROM (end_time + INTERVAL '24 hours' - start_time)) / 3600
    END
  ) STORED,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_shifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Shifts visible to HMS staff" ON hrms_shifts;
CREATE POLICY "Shifts visible to HMS staff"
  ON hrms_shifts FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admins manage shifts" ON hrms_shifts;
CREATE POLICY "Admins manage shifts"
  ON hrms_shifts FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- Seed shifts
INSERT INTO hrms_shifts (name, code, start_time, end_time, break_minutes, grace_minutes, is_night_shift, color)
VALUES
  ('Morning Shift', 'M', '06:00', '14:00', 30, 15, false, '#3B82F6'),
  ('General Shift', 'G', '09:00', '17:00', 60, 15, false, '#22C55E'),
  ('Afternoon Shift', 'A', '14:00', '22:00', 30, 15, false, '#F59E0B'),
  ('Night Shift', 'N', '22:00', '06:00', 30, 15, true, '#8B5CF6'),
  ('Split Shift (Morning)', 'S1', '07:00', '11:00', 0, 10, false, '#EC4899'),
  ('Split Shift (Evening)', 'S2', '16:00', '20:00', 0, 10, false, '#EC4899'),
  ('Half Day', 'H', '09:00', '13:00', 0, 15, false, '#6B7280')
ON CONFLICT (organisation_id, code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. ALTER hms_staff — Evolve into Employee Master
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE hms_staff
  ADD COLUMN IF NOT EXISTS employee_code TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', NULL)),
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_relation TEXT,
  ADD COLUMN IF NOT EXISTS address_line1 TEXT,
  ADD COLUMN IF NOT EXISTS address_line2 TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'Tamil Nadu',
  ADD COLUMN IF NOT EXISTS pincode TEXT,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS marital_status TEXT,
  ADD COLUMN IF NOT EXISTS aadhaar_masked TEXT, -- Last 4 digits only for display
  ADD COLUMN IF NOT EXISTS pan TEXT,
  ADD COLUMN IF NOT EXISTS bank_name TEXT,
  ADD COLUMN IF NOT EXISTS bank_account_no TEXT,
  ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES hrms_departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS designation_id UUID REFERENCES hrms_designations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reporting_manager_id UUID REFERENCES hms_staff(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS employment_type TEXT DEFAULT 'permanent' CHECK (employment_type IN (
    'permanent', 'contract', 'probation', 'intern', 'consultant', 'part_time', 'temporary'
  )),
  ADD COLUMN IF NOT EXISTS probation_end_date DATE,
  ADD COLUMN IF NOT EXISTS confirmation_date DATE,
  ADD COLUMN IF NOT EXISTS notice_period_days INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES hrms_shifts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS weekly_off TEXT DEFAULT 'Sunday',
  ADD COLUMN IF NOT EXISTS employee_status TEXT DEFAULT 'active' CHECK (employee_status IN (
    'active', 'probation', 'on_leave', 'suspended', 'notice_period',
    'resigned', 'relieved', 'terminated', 'absconding'
  )),
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS resignation_date DATE,
  ADD COLUMN IF NOT EXISTS last_working_date DATE,
  ADD COLUMN IF NOT EXISTS relieving_date DATE;

-- Create unique index on employee_code (partial — only non-null)
CREATE UNIQUE INDEX IF NOT EXISTS idx_hms_staff_employee_code
  ON hms_staff(employee_code) WHERE employee_code IS NOT NULL;

-- Create indexes for new foreign keys
CREATE INDEX IF NOT EXISTS idx_hms_staff_org ON hms_staff(organisation_id);
CREATE INDEX IF NOT EXISTS idx_hms_staff_branch ON hms_staff(branch_id);
CREATE INDEX IF NOT EXISTS idx_hms_staff_department_id ON hms_staff(department_id);
CREATE INDEX IF NOT EXISTS idx_hms_staff_designation ON hms_staff(designation_id);
CREATE INDEX IF NOT EXISTS idx_hms_staff_manager ON hms_staff(reporting_manager_id);
CREATE INDEX IF NOT EXISTS idx_hms_staff_status ON hms_staff(employee_status);

-- Auto-generate employee codes for existing staff without one
DO $$
DECLARE
  r RECORD;
  seq INTEGER := 1;
BEGIN
  FOR r IN SELECT id FROM hms_staff WHERE employee_code IS NULL ORDER BY created_at ASC
  LOOP
    UPDATE hms_staff SET employee_code = 'EMP-' || LPAD(seq::TEXT, 4, '0') WHERE id = r.id;
    seq := seq + 1;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. EMPLOYEE QUALIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_qualifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  qualification TEXT NOT NULL,
  institution TEXT,
  university TEXT,
  year_of_passing INTEGER,
  registration_number TEXT,
  registration_authority TEXT,
  registration_expiry DATE,
  certificate_url TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_employee_qualifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Qualifications visible to HMS staff" ON hrms_employee_qualifications;
CREATE POLICY "Qualifications visible to HMS staff"
  ON hrms_employee_qualifications FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HMS staff manage qualifications" ON hrms_employee_qualifications;
CREATE POLICY "HMS staff manage qualifications"
  ON hrms_employee_qualifications FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_qualifications_employee ON hrms_employee_qualifications(employee_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. EMPLOYEE DOCUMENTS (Secure storage references)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'aadhaar', 'pan', 'passport', 'bank_passbook', 'qualification_certificate',
    'registration_certificate', 'experience_certificate', 'appointment_order',
    'contract', 'signed_policy', 'id_card_photo', 'offer_letter',
    'relieving_letter', 'address_proof', 'photo', 'other'
  )),
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Supabase storage path
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_employee_documents ENABLE ROW LEVEL SECURITY;

-- Only HR/Admin can see documents (sensitive data)
DROP POLICY IF EXISTS "HR staff can view documents" ON hrms_employee_documents;
CREATE POLICY "HR staff can view documents"
  ON hrms_employee_documents FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
    -- Employee can see own documents
    OR employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "HR staff manage documents" ON hrms_employee_documents;
CREATE POLICY "HR staff manage documents"
  ON hrms_employee_documents FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

CREATE INDEX IF NOT EXISTS idx_documents_employee ON hrms_employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON hrms_employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON hrms_employee_documents(expiry_date) WHERE expiry_date IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. AUDIT LOG (HR action tracking)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL, -- 'employee_created', 'salary_changed', 'leave_approved', etc.
  entity_type TEXT NOT NULL, -- 'employee', 'attendance', 'leave', 'payroll', etc.
  entity_id UUID,
  employee_id UUID REFERENCES hms_staff(id) ON DELETE SET NULL,
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  old_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
DROP POLICY IF EXISTS "Admins view audit logs" ON hrms_audit_log;
CREATE POLICY "Admins view audit logs"
  ON hrms_audit_log FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin'::public.app_role)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  );

-- System can insert audit logs (any HMS staff can trigger actions)
DROP POLICY IF EXISTS "HMS staff create audit entries" ON hrms_audit_log;
CREATE POLICY "HMS staff create audit entries"
  ON hrms_audit_log FOR INSERT TO authenticated
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_audit_entity ON hrms_audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_employee ON hrms_audit_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON hrms_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_created ON hrms_audit_log(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. ADD organisation_id TO hms_branches (for multi-org support)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE hms_branches
  ADD COLUMN IF NOT EXISTS organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL;

-- Link existing branches to default org
UPDATE hms_branches
SET organisation_id = (SELECT id FROM hrms_organisations WHERE code = 'AYUZEE-01' LIMIT 1)
WHERE organisation_id IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. HRMS PERMISSIONS HELPER FUNCTION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check if user has HR admin access
CREATE OR REPLACE FUNCTION public.is_hr_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role IN ('super_admin', 'admin')
  );
$$;

-- Check if user is a branch manager (has access to their branch's HR data)
CREATE OR REPLACE FUNCTION public.is_branch_manager(_user_id uuid, _branch_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM hms_staff
    WHERE user_id = _user_id
    AND branch_id = _branch_id
    AND role ILIKE '%manager%'
    AND is_active = true
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. GRANT PERMISSIONS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_organisations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_departments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_designations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_shifts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_qualifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_documents TO authenticated;
GRANT SELECT, INSERT ON hrms_audit_log TO authenticated;

GRANT ALL ON hrms_organisations TO service_role;
GRANT ALL ON hrms_departments TO service_role;
GRANT ALL ON hrms_designations TO service_role;
GRANT ALL ON hrms_shifts TO service_role;
GRANT ALL ON hrms_employee_qualifications TO service_role;
GRANT ALL ON hrms_employee_documents TO service_role;
GRANT ALL ON hrms_audit_log TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 1 Foundation Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
