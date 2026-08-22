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
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 2: Workforce Tables                                     ║
-- ║                                                                              ║
-- ║  Creates: Attendance, Attendance Corrections, Holidays, Leave Types,         ║
-- ║           Leave Balances, Leave Requests, Duty Roster                        ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing tables.             ║
-- ║  DEPENDS ON: Phase 1 (hms_staff columns, hrms_shifts, hrms_organisations)    ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. HRMS ATTENDANCE (Unified daily attendance — single source of truth)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  shift_id UUID REFERENCES hrms_shifts(id) ON DELETE SET NULL,
  
  -- Punch data
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  check_in_method TEXT CHECK (check_in_method IN ('manual', 'qr', 'biometric', 'mobile', 'system')),
  check_out_method TEXT CHECK (check_out_method IN ('manual', 'qr', 'biometric', 'mobile', 'system')),
  check_in_location TEXT,       -- lat,lng or branch name
  check_out_location TEXT,
  
  -- Calculated status
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN (
    'present', 'absent', 'half_day', 'late', 'early_departure',
    'on_leave', 'weekly_off', 'holiday', 'on_duty', 'compensatory_off'
  )),
  
  -- Hours
  worked_hours DECIMAL(5,2) DEFAULT 0,
  overtime_hours DECIMAL(5,2) DEFAULT 0,
  late_minutes INTEGER DEFAULT 0,
  early_departure_minutes INTEGER DEFAULT 0,
  
  -- Metadata
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  remarks TEXT,
  marked_by UUID REFERENCES auth.users(id),
  is_regularised BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- One record per employee per day
  UNIQUE(employee_id, attendance_date)
);

ALTER TABLE hrms_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HMS staff can view attendance" ON hrms_attendance;
CREATE POLICY "HMS staff can view attendance"
  ON hrms_attendance FOR SELECT TO authenticated
  USING (
    public.is_hms_staff(auth.uid())
    OR employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "HMS staff can manage attendance" ON hrms_attendance;
CREATE POLICY "HMS staff can manage attendance"
  ON hrms_attendance FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON hrms_attendance(employee_id, attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON hrms_attendance(attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON hrms_attendance(status, attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_branch ON hrms_attendance(branch_id, attendance_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ATTENDANCE CORRECTIONS (Regularisation workflow)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_attendance_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  attendance_id UUID REFERENCES hrms_attendance(id) ON DELETE SET NULL,
  correction_date DATE NOT NULL,
  
  -- What needs correction
  correction_type TEXT NOT NULL CHECK (correction_type IN (
    'missing_checkin', 'missing_checkout', 'wrong_status', 'overtime_claim', 'on_duty'
  )),
  
  -- Requested values
  requested_check_in TIMESTAMPTZ,
  requested_check_out TIMESTAMPTZ,
  requested_status TEXT,
  reason TEXT NOT NULL,
  
  -- Approval workflow
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Metadata
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_attendance_corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees view own corrections" ON hrms_attendance_corrections;
CREATE POLICY "Employees view own corrections"
  ON hrms_attendance_corrections FOR SELECT TO authenticated
  USING (
    requested_by = auth.uid()
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "Employees create corrections" ON hrms_attendance_corrections;
CREATE POLICY "Employees create corrections"
  ON hrms_attendance_corrections FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS "HR manages corrections" ON hrms_attendance_corrections;
CREATE POLICY "HR manages corrections"
  ON hrms_attendance_corrections FOR UPDATE TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_corrections_employee ON hrms_attendance_corrections(employee_id, correction_date);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON hrms_attendance_corrections(status) WHERE status = 'pending';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. HOLIDAYS (Branch-specific holiday calendar)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL, -- NULL = all branches
  
  name TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'restricted', 'optional', 'company')),
  description TEXT,
  is_paid BOOLEAN DEFAULT true,
  year INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM date)::INTEGER) STORED,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, branch_id, date, name)
);

ALTER TABLE hrms_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view holidays" ON hrms_holidays;
CREATE POLICY "Anyone can view holidays"
  ON hrms_holidays FOR SELECT TO authenticated
  USING (is_active = true OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages holidays" ON hrms_holidays;
CREATE POLICY "HR manages holidays"
  ON hrms_holidays FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_holidays_date ON hrms_holidays(date);
CREATE INDEX IF NOT EXISTS idx_holidays_year ON hrms_holidays(year);
CREATE INDEX IF NOT EXISTS idx_holidays_branch ON hrms_holidays(branch_id, date);

-- Seed 2026 holidays (Tamil Nadu / India)
INSERT INTO hrms_holidays (name, date, type, description) VALUES
  ('Republic Day', '2026-01-26', 'public', 'National Holiday'),
  ('Pongal', '2026-01-14', 'public', 'Harvest Festival'),
  ('Thiruvalluvar Day', '2026-01-15', 'public', 'Tamil Nadu State Holiday'),
  ('Holi', '2026-03-17', 'optional', 'Festival of Colors'),
  ('Good Friday', '2026-04-03', 'public', 'Christian Holiday'),
  ('Tamil New Year', '2026-04-14', 'public', 'Tamil Nadu New Year'),
  ('Ambedkar Jayanti', '2026-04-14', 'public', 'National Holiday'),
  ('May Day', '2026-05-01', 'public', 'Labour Day'),
  ('Eid ul-Fitr', '2026-03-20', 'public', 'Islamic Holiday (date approximate)'),
  ('Independence Day', '2026-08-15', 'public', 'National Holiday'),
  ('Janmashtami', '2026-08-25', 'optional', 'Hindu Festival'),
  ('Vinayagar Chaturthi', '2026-09-07', 'public', 'Ganesh Chaturthi'),
  ('Milad-un-Nabi', '2026-09-18', 'public', 'Prophet Birthday (date approximate)'),
  ('Gandhi Jayanti', '2026-10-02', 'public', 'National Holiday'),
  ('Ayudha Pooja', '2026-10-12', 'public', 'Navaratri'),
  ('Vijaya Dasami', '2026-10-13', 'public', 'Dussehra'),
  ('Deepavali', '2026-11-01', 'public', 'Festival of Lights'),
  ('Eid ul-Adha', '2026-06-17', 'public', 'Islamic Holiday (date approximate)'),
  ('Christmas', '2026-12-25', 'public', 'Christian Holiday')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. LEAVE TYPES (Configurable per organisation)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Quota
  annual_quota INTEGER DEFAULT 12,
  max_consecutive_days INTEGER DEFAULT 3,
  min_days_advance_notice INTEGER DEFAULT 1,
  
  -- Rules
  is_paid BOOLEAN DEFAULT true,
  is_carry_forward BOOLEAN DEFAULT false,
  max_carry_forward INTEGER DEFAULT 0,
  is_encashable BOOLEAN DEFAULT false,
  requires_document BOOLEAN DEFAULT false,  -- e.g. medical certificate for sick leave > 2 days
  document_after_days INTEGER DEFAULT 2,
  
  -- Applicability
  applicable_gender TEXT CHECK (applicable_gender IN ('male', 'female', 'all', NULL)),
  applicable_after_months INTEGER DEFAULT 0, -- available after X months of joining
  
  -- Display
  color TEXT DEFAULT '#3B82F6',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_leave_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leave types visible to authenticated" ON hrms_leave_types;
CREATE POLICY "Leave types visible to authenticated"
  ON hrms_leave_types FOR SELECT TO authenticated
  USING (is_active = true OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages leave types" ON hrms_leave_types;
CREATE POLICY "HR manages leave types"
  ON hrms_leave_types FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed leave types
INSERT INTO hrms_leave_types (name, code, annual_quota, max_consecutive_days, is_paid, is_carry_forward, max_carry_forward, color, sort_order, description) VALUES
  ('Casual Leave', 'CL', 12, 3, true, false, 0, '#3B82F6', 1, 'For personal work, short notice allowed'),
  ('Sick Leave', 'SL', 12, 7, true, false, 0, '#EF4444', 2, 'Medical leave. Certificate required if > 2 consecutive days'),
  ('Earned Leave', 'EL', 15, 15, true, true, 10, '#8B5CF6', 3, 'Planned leave. Must apply 7 days in advance'),
  ('Maternity Leave', 'ML', 182, 182, true, false, 0, '#EC4899', 4, '26 weeks maternity leave as per law'),
  ('Paternity Leave', 'PL', 15, 15, true, false, 0, '#06B6D4', 5, 'Paternity leave for male employees'),
  ('Compensatory Off', 'CO', 0, 2, true, false, 0, '#10B981', 6, 'Against extra duty on holidays/weekly offs'),
  ('Loss of Pay', 'LOP', 365, 365, false, false, 0, '#6B7280', 7, 'Unpaid leave when other quotas exhausted'),
  ('On Duty', 'OD', 30, 5, true, false, 0, '#F59E0B', 8, 'Outstation duty / official work outside office')
ON CONFLICT (organisation_id, code) DO NOTHING;

-- Update leave types with gender/notice rules
UPDATE hrms_leave_types SET applicable_gender = 'female', applicable_after_months = 12, requires_document = true WHERE code = 'ML';
UPDATE hrms_leave_types SET applicable_gender = 'male', applicable_after_months = 6 WHERE code = 'PL';
UPDATE hrms_leave_types SET min_days_advance_notice = 7 WHERE code = 'EL';
UPDATE hrms_leave_types SET requires_document = true, document_after_days = 2 WHERE code = 'SL';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. LEAVE BALANCES (Per employee per year)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES hrms_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  
  opening_balance DECIMAL(5,1) DEFAULT 0,
  credited DECIMAL(5,1) DEFAULT 0,         -- Annual quota + carry forward
  used DECIMAL(5,1) DEFAULT 0,
  pending DECIMAL(5,1) DEFAULT 0,          -- Applied but not yet taken
  available DECIMAL(5,1) GENERATED ALWAYS AS (opening_balance + credited - used - pending) STORED,
  
  carried_forward_from DECIMAL(5,1) DEFAULT 0,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, leave_type_id, year)
);

ALTER TABLE hrms_leave_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees view own balances" ON hrms_leave_balances;
CREATE POLICY "Employees view own balances"
  ON hrms_leave_balances FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages balances" ON hrms_leave_balances;
CREATE POLICY "HR manages balances"
  ON hrms_leave_balances FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_leave_bal_employee_year ON hrms_leave_balances(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_leave_bal_type ON hrms_leave_balances(leave_type_id, year);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. LEAVE REQUESTS (Application + Approval workflow)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES hrms_leave_types(id) ON DELETE RESTRICT,
  
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  total_days DECIMAL(4,1) NOT NULL DEFAULT 1, -- supports half days (0.5)
  is_half_day BOOLEAN DEFAULT false,
  half_day_type TEXT CHECK (half_day_type IN ('first_half', 'second_half', NULL)),
  
  reason TEXT NOT NULL,
  document_url TEXT,   -- medical certificate etc.
  
  -- Workflow: Employee → Reporting Manager → HR
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'manager_approved', 'approved', 'rejected', 'cancelled', 'revoked'
  )),
  
  -- Level 1: Reporting Manager
  manager_action_by UUID REFERENCES auth.users(id),
  manager_action_at TIMESTAMPTZ,
  manager_remarks TEXT,
  
  -- Level 2: HR
  hr_action_by UUID REFERENCES auth.users(id),
  hr_action_at TIMESTAMPTZ,
  hr_remarks TEXT,
  
  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  
  -- Metadata
  applied_by UUID NOT NULL REFERENCES auth.users(id),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_leave_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employees view own leaves" ON hrms_leave_requests;
CREATE POLICY "Employees view own leaves"
  ON hrms_leave_requests FOR SELECT TO authenticated
  USING (
    applied_by = auth.uid()
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "Employees apply leave" ON hrms_leave_requests;
CREATE POLICY "Employees apply leave"
  ON hrms_leave_requests FOR INSERT TO authenticated
  WITH CHECK (applied_by = auth.uid());

DROP POLICY IF EXISTS "HR manages leave requests" ON hrms_leave_requests;
CREATE POLICY "HR manages leave requests"
  ON hrms_leave_requests FOR UPDATE TO authenticated
  USING (
    applied_by = auth.uid()  -- employee can cancel own
    OR public.is_hms_staff(auth.uid())
  )
  WITH CHECK (
    applied_by = auth.uid()
    OR public.is_hms_staff(auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_leave_req_employee ON hrms_leave_requests(employee_id, from_date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_req_status ON hrms_leave_requests(status) WHERE status IN ('pending', 'manager_approved');
CREATE INDEX IF NOT EXISTS idx_leave_req_dates ON hrms_leave_requests(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_leave_req_branch ON hrms_leave_requests(branch_id, from_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. DUTY ROSTER (Enhanced shift scheduling)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_duty_roster (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  roster_date DATE NOT NULL,
  shift_id UUID REFERENCES hrms_shifts(id) ON DELETE SET NULL,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'confirmed', 'swapped', 'cancelled', 'on_leave'
  )),
  
  -- Swap tracking
  swapped_with_employee_id UUID REFERENCES hms_staff(id) ON DELETE SET NULL,
  swap_reason TEXT,
  swap_approved_by UUID REFERENCES auth.users(id),
  
  -- Metadata
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  department TEXT,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, roster_date)
);

ALTER TABLE hrms_duty_roster ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff view roster" ON hrms_duty_roster;
CREATE POLICY "Staff view roster"
  ON hrms_duty_roster FOR SELECT TO authenticated
  USING (
    public.is_hms_staff(auth.uid())
    OR employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "HR manages roster" ON hrms_duty_roster;
CREATE POLICY "HR manages roster"
  ON hrms_duty_roster FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_roster_employee_date ON hrms_duty_roster(employee_id, roster_date);
CREATE INDEX IF NOT EXISTS idx_roster_date ON hrms_duty_roster(roster_date);
CREATE INDEX IF NOT EXISTS idx_roster_shift ON hrms_duty_roster(shift_id, roster_date);
CREATE INDEX IF NOT EXISTS idx_roster_branch ON hrms_duty_roster(branch_id, roster_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. HELPER FUNCTIONS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Calculate working days between two dates (excluding weekends & holidays)
CREATE OR REPLACE FUNCTION hrms_working_days(_from DATE, _to DATE, _weekly_off TEXT DEFAULT 'Sunday', _branch_id UUID DEFAULT NULL)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  _count INTEGER := 0;
  _d DATE := _from;
  _day_name TEXT;
BEGIN
  WHILE _d <= _to LOOP
    _day_name := TO_CHAR(_d, 'FMDay');
    -- Skip weekly off
    IF _day_name != _weekly_off THEN
      -- Skip holidays
      IF NOT EXISTS (
        SELECT 1 FROM hrms_holidays
        WHERE date = _d AND is_active = true
        AND (branch_id IS NULL OR branch_id = _branch_id)
      ) THEN
        _count := _count + 1;
      END IF;
    END IF;
    _d := _d + 1;
  END LOOP;
  RETURN _count;
END;
$$;

-- Check if a date is a holiday for a branch
CREATE OR REPLACE FUNCTION hrms_is_holiday(_date DATE, _branch_id UUID DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM hrms_holidays
    WHERE date = _date AND is_active = true
    AND (branch_id IS NULL OR branch_id = _branch_id)
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE ON hrms_attendance_corrections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_holidays TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_leave_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_leave_balances TO authenticated;
GRANT SELECT, INSERT, UPDATE ON hrms_leave_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_duty_roster TO authenticated;

GRANT ALL ON hrms_attendance TO service_role;
GRANT ALL ON hrms_attendance_corrections TO service_role;
GRANT ALL ON hrms_holidays TO service_role;
GRANT ALL ON hrms_leave_types TO service_role;
GRANT ALL ON hrms_leave_balances TO service_role;
GRANT ALL ON hrms_leave_requests TO service_role;
GRANT ALL ON hrms_duty_roster TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 2 Workforce Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 3: Payroll & Compensation Tables                        ║
-- ║                                                                              ║
-- ║  Creates: Salary Structures, Employee Salary, Payroll Runs, Payroll Items,   ║
-- ║           Payslips, Loans/Advances, Statutory Config, Incentive Rules,       ║
-- ║           Employee Incentives                                                ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing tables.             ║
-- ║  DEPENDS ON: Phase 1 (hms_staff, hrms_organisations, hms_branches)           ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. STATUTORY CONFIGURATION (PF/ESI/PT rates — configurable, NOT hardcoded)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_statutory_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  -- Provident Fund
  pf_enabled BOOLEAN DEFAULT true,
  pf_employee_rate DECIMAL(5,2) DEFAULT 12.00,    -- % of Basic
  pf_employer_rate DECIMAL(5,2) DEFAULT 12.00,
  pf_wage_ceiling DECIMAL(12,2) DEFAULT 15000,    -- PF applicable on basic up to this
  
  -- ESI
  esi_enabled BOOLEAN DEFAULT true,
  esi_employee_rate DECIMAL(5,2) DEFAULT 0.75,
  esi_employer_rate DECIMAL(5,2) DEFAULT 3.25,
  esi_wage_ceiling DECIMAL(12,2) DEFAULT 21000,   -- Applicable if gross <= this
  
  -- Professional Tax (state-specific)
  pt_enabled BOOLEAN DEFAULT true,
  pt_slab JSONB DEFAULT '[
    {"from": 0, "to": 21000, "amount": 0},
    {"from": 21001, "to": 30000, "amount": 135},
    {"from": 30001, "to": 45000, "amount": 315},
    {"from": 45001, "to": 60000, "amount": 690},
    {"from": 60001, "to": 75000, "amount": 1025},
    {"from": 75001, "to": 99999999, "amount": 1250}
  ]'::jsonb,
  
  -- TDS
  tds_enabled BOOLEAN DEFAULT true,
  
  -- LWF (Labour Welfare Fund)
  lwf_enabled BOOLEAN DEFAULT false,
  lwf_employee_amount DECIMAL(8,2) DEFAULT 0,
  lwf_employer_amount DECIMAL(8,2) DEFAULT 0,
  
  -- Payroll config
  payroll_lock_day INTEGER DEFAULT 25,          -- Attendance locked on this day
  salary_credit_day INTEGER DEFAULT 1,          -- Salary credited on this day
  financial_year_start INTEGER DEFAULT 4,       -- April
  
  effective_from DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_statutory_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HR can view statutory config" ON hrms_statutory_config;
CREATE POLICY "HR can view statutory config"
  ON hrms_statutory_config FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin manages statutory config" ON hrms_statutory_config;
CREATE POLICY "Admin manages statutory config"
  ON hrms_statutory_config FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed default config
INSERT INTO hrms_statutory_config (pf_enabled, esi_enabled, pt_enabled, tds_enabled)
VALUES (true, true, true, true)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SALARY STRUCTURES (CTC component templates)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_salary_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Component definition as flexible JSONB
  -- Each component: { name, code, type (earning/deduction), calc_type (fixed/percentage), base_on, percentage, fixed_amount, is_taxable, is_part_of_ctc }
  components JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Applicability
  applicable_designation_ids UUID[] DEFAULT '{}',
  min_ctc DECIMAL(12,2) DEFAULT 0,
  max_ctc DECIMAL(12,2) DEFAULT 99999999,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_salary_structures ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HR views salary structures" ON hrms_salary_structures;
CREATE POLICY "HR views salary structures"
  ON hrms_salary_structures FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin manages salary structures" ON hrms_salary_structures;
CREATE POLICY "Admin manages salary structures"
  ON hrms_salary_structures FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed default salary structure
INSERT INTO hrms_salary_structures (name, code, description, components) VALUES
(
  'Standard AYUSH Hospital',
  'STD-AYUSH',
  'Default salary structure for Ayurveda/AYUSH hospital staff',
  '[
    {"name": "Basic Salary", "code": "BASIC", "type": "earning", "calc_type": "percentage", "base_on": "ctc", "percentage": 40, "is_taxable": true, "is_part_of_ctc": true},
    {"name": "House Rent Allowance", "code": "HRA", "type": "earning", "calc_type": "percentage", "base_on": "basic", "percentage": 30, "is_taxable": true, "is_part_of_ctc": true},
    {"name": "Special Allowance", "code": "SA", "type": "earning", "calc_type": "percentage", "base_on": "ctc", "percentage": 15, "is_taxable": true, "is_part_of_ctc": true},
    {"name": "Medical Allowance", "code": "MA", "type": "earning", "calc_type": "fixed", "fixed_amount": 1250, "is_taxable": false, "is_part_of_ctc": true},
    {"name": "Conveyance Allowance", "code": "CA", "type": "earning", "calc_type": "fixed", "fixed_amount": 1600, "is_taxable": false, "is_part_of_ctc": true},
    {"name": "PF (Employee)", "code": "PF_EE", "type": "deduction", "calc_type": "percentage", "base_on": "basic", "percentage": 12, "is_statutory": true},
    {"name": "ESI (Employee)", "code": "ESI_EE", "type": "deduction", "calc_type": "percentage", "base_on": "gross", "percentage": 0.75, "is_statutory": true},
    {"name": "Professional Tax", "code": "PT", "type": "deduction", "calc_type": "slab", "is_statutory": true}
  ]'::jsonb
),
(
  'Doctor/Consultant',
  'DOC-CONS',
  'Higher HRA and no PF for consultant doctors',
  '[
    {"name": "Basic Salary", "code": "BASIC", "type": "earning", "calc_type": "percentage", "base_on": "ctc", "percentage": 45, "is_taxable": true, "is_part_of_ctc": true},
    {"name": "House Rent Allowance", "code": "HRA", "type": "earning", "calc_type": "percentage", "base_on": "basic", "percentage": 40, "is_taxable": true, "is_part_of_ctc": true},
    {"name": "Special Allowance", "code": "SA", "type": "earning", "calc_type": "balance", "is_taxable": true, "is_part_of_ctc": true},
    {"name": "Professional Tax", "code": "PT", "type": "deduction", "calc_type": "slab", "is_statutory": true},
    {"name": "TDS", "code": "TDS", "type": "deduction", "calc_type": "manual", "is_statutory": true}
  ]'::jsonb
)
ON CONFLICT (organisation_id, code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. EMPLOYEE SALARY (Per-employee salary assignment)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_salary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  salary_structure_id UUID REFERENCES hrms_salary_structures(id) ON DELETE SET NULL,
  
  -- CTC
  annual_ctc DECIMAL(12,2) NOT NULL,
  monthly_ctc DECIMAL(12,2) GENERATED ALWAYS AS (annual_ctc / 12) STORED,
  
  -- Component overrides (if different from structure defaults)
  component_overrides JSONB DEFAULT '{}',
  
  -- Computed breakdown (cached, recalculated on change)
  basic DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  other_earnings DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  
  -- Deductions
  pf_employee DECIMAL(10,2) DEFAULT 0,
  pf_employer DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  esi_employer DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  
  net_salary DECIMAL(10,2) DEFAULT 0,
  
  -- Bank details for salary credit
  bank_name TEXT,
  bank_account_no TEXT,
  bank_ifsc TEXT,
  payment_mode TEXT DEFAULT 'bank_transfer' CHECK (payment_mode IN ('bank_transfer', 'cheque', 'cash', 'upi')),
  
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to DATE,
  revision_number INTEGER DEFAULT 1,
  revision_reason TEXT,
  
  is_active BOOLEAN DEFAULT true,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, effective_from)
);

ALTER TABLE hrms_employee_salary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own salary" ON hrms_employee_salary;
CREATE POLICY "Employee views own salary"
  ON hrms_employee_salary FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hr_admin(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages salaries" ON hrms_employee_salary;
CREATE POLICY "HR manages salaries"
  ON hrms_employee_salary FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_salary_employee ON hrms_employee_salary(employee_id, is_active);
CREATE INDEX IF NOT EXISTS idx_emp_salary_effective ON hrms_employee_salary(effective_from DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. PAYROLL RUNS (Monthly payroll execution)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  
  -- Period
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  period_label TEXT, -- "August 2026"
  
  -- Status workflow: draft → processing → hr_review → approved → locked
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'processing', 'hr_review', 'approved', 'locked', 'cancelled'
  )),
  
  -- Summary
  total_employees INTEGER DEFAULT 0,
  total_gross DECIMAL(14,2) DEFAULT 0,
  total_deductions DECIMAL(14,2) DEFAULT 0,
  total_net DECIMAL(14,2) DEFAULT 0,
  total_employer_contribution DECIMAL(14,2) DEFAULT 0,
  
  -- Workflow
  processed_by UUID REFERENCES auth.users(id),
  processed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  locked_by UUID REFERENCES auth.users(id),
  locked_at TIMESTAMPTZ,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, branch_id, month, year)
);

ALTER TABLE hrms_payroll_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "HR views payroll runs" ON hrms_payroll_runs;
CREATE POLICY "HR views payroll runs"
  ON hrms_payroll_runs FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages payroll runs" ON hrms_payroll_runs;
CREATE POLICY "HR manages payroll runs"
  ON hrms_payroll_runs FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_payroll_runs_period ON hrms_payroll_runs(year DESC, month DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. PAYROLL ITEMS (Per-employee monthly breakdown)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_payroll_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID NOT NULL REFERENCES hrms_payroll_runs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  -- Attendance data (snapshot at payroll time)
  working_days INTEGER DEFAULT 0,
  present_days DECIMAL(5,1) DEFAULT 0,
  absent_days DECIMAL(5,1) DEFAULT 0,
  leave_days DECIMAL(5,1) DEFAULT 0,
  lop_days DECIMAL(5,1) DEFAULT 0,
  paid_days DECIMAL(5,1) DEFAULT 0,
  overtime_hours DECIMAL(5,1) DEFAULT 0,
  
  -- Earnings
  basic DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  special_allowance DECIMAL(10,2) DEFAULT 0,
  medical_allowance DECIMAL(10,2) DEFAULT 0,
  conveyance DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  incentive DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  arrears DECIMAL(10,2) DEFAULT 0,
  other_earnings DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  
  -- Deductions
  pf_employee DECIMAL(10,2) DEFAULT 0,
  pf_employer DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  esi_employer DECIMAL(10,2) DEFAULT 0,
  professional_tax DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  loan_deduction DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0,
  lop_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  
  -- Net
  net_salary DECIMAL(10,2) DEFAULT 0,
  
  -- Payment
  payment_mode TEXT DEFAULT 'bank_transfer',
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processed', 'paid', 'failed')),
  payment_date DATE,
  transaction_ref TEXT,
  
  -- Component details (full breakdown as JSONB for payslip)
  earnings_detail JSONB DEFAULT '[]',
  deductions_detail JSONB DEFAULT '[]',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(payroll_run_id, employee_id)
);

ALTER TABLE hrms_payroll_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own payroll" ON hrms_payroll_items;
CREATE POLICY "Employee views own payroll"
  ON hrms_payroll_items FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hr_admin(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages payroll items" ON hrms_payroll_items;
CREATE POLICY "HR manages payroll items"
  ON hrms_payroll_items FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_payroll_items_run ON hrms_payroll_items(payroll_run_id);
CREATE INDEX IF NOT EXISTS idx_payroll_items_employee ON hrms_payroll_items(employee_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. LOANS & ADVANCES
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_loans_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  type TEXT NOT NULL CHECK (type IN ('loan', 'salary_advance', 'travel_advance', 'other')),
  amount DECIMAL(12,2) NOT NULL,
  disbursed_date DATE,
  
  -- Repayment
  emi_amount DECIMAL(10,2) DEFAULT 0,
  total_installments INTEGER DEFAULT 1,
  installments_paid INTEGER DEFAULT 0,
  outstanding DECIMAL(12,2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'disbursed', 'repaying', 'closed', 'rejected'
  )),
  
  reason TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_loans_advances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own loans" ON hrms_loans_advances;
CREATE POLICY "Employee views own loans"
  ON hrms_loans_advances FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hr_admin(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages loans" ON hrms_loans_advances;
CREATE POLICY "HR manages loans"
  ON hrms_loans_advances FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

DROP POLICY IF EXISTS "Employee requests loan" ON hrms_loans_advances;
CREATE POLICY "Employee requests loan"
  ON hrms_loans_advances FOR INSERT TO authenticated
  WITH CHECK (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_loans_employee ON hrms_loans_advances(employee_id, status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. INCENTIVE RULES (Configurable incentive calculation)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_incentive_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  
  -- Who gets this incentive
  applicable_roles TEXT[] DEFAULT '{}',          -- e.g. {'doctor', 'therapist', 'pharmacist'}
  applicable_departments TEXT[] DEFAULT '{}',
  
  -- Calculation
  metric TEXT NOT NULL, -- 'revenue', 'procedures', 'patients', 'attendance', 'target_achievement', 'custom'
  calc_type TEXT NOT NULL CHECK (calc_type IN ('fixed', 'percentage', 'slab', 'formula')),
  
  -- For percentage type
  percentage DECIMAL(5,2) DEFAULT 0,
  base_metric TEXT, -- what percentage is applied on
  
  -- For fixed type
  fixed_amount DECIMAL(10,2) DEFAULT 0,
  
  -- For slab type
  slabs JSONB DEFAULT '[]', -- [{"from": 0, "to": 50000, "amount": 500}, {"from": 50001, "to": 100000, "amount": 1500}]
  
  -- Limits
  min_amount DECIMAL(10,2) DEFAULT 0,
  max_amount DECIMAL(10,2) DEFAULT 999999,
  
  -- Period
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'quarterly', 'annual')),
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_incentive_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff views incentive rules" ON hrms_incentive_rules;
CREATE POLICY "Staff views incentive rules"
  ON hrms_incentive_rules FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin manages incentive rules" ON hrms_incentive_rules;
CREATE POLICY "Admin manages incentive rules"
  ON hrms_incentive_rules FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed incentive rules
INSERT INTO hrms_incentive_rules (name, code, description, applicable_roles, metric, calc_type, percentage, base_metric, frequency) VALUES
  ('Doctor Consultation Incentive', 'DOC-CONS', 'Percentage of consultation revenue above target', '{doctor}', 'revenue', 'percentage', 10, 'revenue_above_target', 'monthly'),
  ('Therapist Procedure Incentive', 'THER-PROC', 'Per procedure completed above minimum', '{therapist}', 'procedures', 'slab', 0, NULL, 'monthly'),
  ('Perfect Attendance Bonus', 'ATTEND-PERF', 'Bonus for zero absences in a month', '{}', 'attendance', 'fixed', 0, NULL, 'monthly'),
  ('Pharmacy Sales Incentive', 'PHARM-SALE', 'Percentage of pharmacy sales above target', '{pharmacist}', 'revenue', 'percentage', 5, 'sales_above_target', 'monthly'),
  ('Branch Target Achievement', 'BRANCH-TGT', 'Branch manager bonus on target achievement', '{}', 'target_achievement', 'slab', 0, NULL, 'quarterly')
ON CONFLICT (organisation_id, code) DO NOTHING;

-- Update slab for therapist
UPDATE hrms_incentive_rules SET slabs = '[
  {"from": 0, "to": 30, "amount": 0},
  {"from": 31, "to": 50, "amount": 2000},
  {"from": 51, "to": 80, "amount": 4000},
  {"from": 81, "to": 999, "amount": 7000}
]'::jsonb, fixed_amount = 0 WHERE code = 'THER-PROC';

UPDATE hrms_incentive_rules SET fixed_amount = 1000 WHERE code = 'ATTEND-PERF';

UPDATE hrms_incentive_rules SET slabs = '[
  {"from": 80, "to": 90, "amount": 5000},
  {"from": 91, "to": 100, "amount": 10000},
  {"from": 101, "to": 999, "amount": 15000}
]'::jsonb WHERE code = 'BRANCH-TGT';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. EMPLOYEE INCENTIVES (Calculated incentive records)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_incentives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  incentive_rule_id UUID NOT NULL REFERENCES hrms_incentive_rules(id) ON DELETE CASCADE,
  
  -- Period
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  
  -- Calculation
  metric_value DECIMAL(12,2) DEFAULT 0,   -- actual metric achieved
  target_value DECIMAL(12,2) DEFAULT 0,   -- target for the period
  achievement_pct DECIMAL(5,1) DEFAULT 0,
  calculated_amount DECIMAL(10,2) DEFAULT 0,
  approved_amount DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'calculated' CHECK (status IN (
    'calculated', 'approved', 'paid', 'rejected', 'on_hold'
  )),
  
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  paid_in_payroll_id UUID REFERENCES hrms_payroll_runs(id),
  
  remarks TEXT,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, incentive_rule_id, month, year)
);

ALTER TABLE hrms_employee_incentives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own incentives" ON hrms_employee_incentives;
CREATE POLICY "Employee views own incentives"
  ON hrms_employee_incentives FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages incentives" ON hrms_employee_incentives;
CREATE POLICY "HR manages incentives"
  ON hrms_employee_incentives FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_incentives_employee ON hrms_employee_incentives(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_emp_incentives_period ON hrms_employee_incentives(year DESC, month DESC);
CREATE INDEX IF NOT EXISTS idx_emp_incentives_status ON hrms_employee_incentives(status) WHERE status IN ('calculated', 'approved');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_statutory_config TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_salary_structures TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_salary TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_payroll_runs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_payroll_items TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_loans_advances TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_incentive_rules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_incentives TO authenticated;

GRANT ALL ON hrms_statutory_config TO service_role;
GRANT ALL ON hrms_salary_structures TO service_role;
GRANT ALL ON hrms_employee_salary TO service_role;
GRANT ALL ON hrms_payroll_runs TO service_role;
GRANT ALL ON hrms_payroll_items TO service_role;
GRANT ALL ON hrms_loans_advances TO service_role;
GRANT ALL ON hrms_incentive_rules TO service_role;
GRANT ALL ON hrms_employee_incentives TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 3 Payroll & Compensation Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 4: Performance & Training Tables                        ║
-- ║                                                                              ║
-- ║  Creates: KPI Templates, KPI Assignments, Employee KPIs,                     ║
-- ║           Performance Reviews, Trainings, Employee Training                  ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing tables.             ║
-- ║  DEPENDS ON: Phase 1 (hms_staff, hrms_organisations, hrms_departments)       ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. KPI TEMPLATES (Role-specific KPI definitions)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_kpi_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'operational', 'financial', 'patient_care', 'compliance',
    'attendance', 'teamwork', 'learning', 'general'
  )),
  
  -- Who this KPI applies to
  applicable_roles TEXT[] DEFAULT '{}',
  applicable_departments TEXT[] DEFAULT '{}',
  applicable_designations TEXT[] DEFAULT '{}',
  
  -- Measurement
  metric_type TEXT NOT NULL DEFAULT 'number' CHECK (metric_type IN (
    'number', 'percentage', 'rating', 'boolean', 'currency'
  )),
  unit TEXT,                           -- e.g. "patients", "procedures", "%", "₹"
  target_value DECIMAL(10,2),          -- monthly target
  max_value DECIMAL(10,2),
  weightage DECIMAL(5,2) DEFAULT 10,   -- % weight in overall score (all KPIs sum to 100)
  
  -- Scoring
  scoring_method TEXT DEFAULT 'linear' CHECK (scoring_method IN ('linear', 'slab', 'binary', 'manual')),
  scoring_slabs JSONB DEFAULT '[]',    -- [{from, to, score}]
  
  -- Source (where data comes from)
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN (
    'manual', 'hms_auto', 'attendance_auto', 'revenue_auto', 'custom'
  )),
  
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_kpi_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff views KPI templates" ON hrms_kpi_templates;
CREATE POLICY "Staff views KPI templates"
  ON hrms_kpi_templates FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin manages KPI templates" ON hrms_kpi_templates;
CREATE POLICY "Admin manages KPI templates"
  ON hrms_kpi_templates FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed KPI templates per role
INSERT INTO hrms_kpi_templates (name, code, description, category, applicable_roles, metric_type, unit, target_value, weightage, data_source, sort_order) VALUES
  -- Doctor KPIs
  ('Daily Consultations', 'DOC-CONS', 'Average daily patient consultations', 'clinical', '{doctor}', 'number', 'patients/day', 15, 20, 'hms_auto', 1),
  ('Documentation Completeness', 'DOC-DOCS', 'Case sheets and prescriptions completed on time', 'compliance', '{doctor}', 'percentage', '%', 95, 15, 'hms_auto', 2),
  ('Patient Follow-up Rate', 'DOC-FU', 'Follow-up appointments completed vs scheduled', 'patient_care', '{doctor}', 'percentage', '%', 80, 15, 'hms_auto', 3),
  ('Patient Feedback Score', 'DOC-FB', 'Average patient rating (1-5)', 'patient_care', '{doctor}', 'rating', '/5', 4.2, 15, 'hms_auto', 4),
  ('Revenue Target', 'DOC-REV', 'Monthly consultation + procedure revenue', 'financial', '{doctor}', 'currency', '₹', 200000, 20, 'hms_auto', 5),
  ('Attendance & Punctuality', 'DOC-ATT', 'On-time attendance percentage', 'attendance', '{doctor}', 'percentage', '%', 95, 15, 'attendance_auto', 6),

  -- Therapist KPIs
  ('Therapies Completed', 'TH-COMP', 'Total therapies/procedures completed per month', 'clinical', '{therapist}', 'number', 'procedures', 50, 25, 'hms_auto', 1),
  ('Therapy Punctuality', 'TH-PUNCT', 'Sessions started within 5 min of schedule', 'operational', '{therapist}', 'percentage', '%', 90, 15, 'hms_auto', 2),
  ('Patient Feedback (Therapy)', 'TH-FB', 'Therapy satisfaction score', 'patient_care', '{therapist}', 'rating', '/5', 4.0, 20, 'hms_auto', 3),
  ('Treatment Documentation', 'TH-DOC', 'Therapy notes completed same day', 'compliance', '{therapist}', 'percentage', '%', 100, 15, 'manual', 4),
  ('Attendance', 'TH-ATT', 'Monthly attendance percentage', 'attendance', '{therapist}', 'percentage', '%', 95, 15, 'attendance_auto', 5),
  ('Material Waste Control', 'TH-WASTE', 'Oil/material usage within standards', 'operational', '{therapist}', 'percentage', '%', 95, 10, 'manual', 6),

  -- Reception KPIs
  ('Patient Registration Speed', 'REC-SPEED', 'Average registration time (minutes)', 'operational', '{receptionist}', 'number', 'minutes', 5, 20, 'hms_auto', 1),
  ('Registration Accuracy', 'REC-ACC', 'Error-free registrations %', 'compliance', '{receptionist}', 'percentage', '%', 98, 20, 'manual', 2),
  ('Follow-up Call Completion', 'REC-CALL', 'Scheduled follow-up calls made', 'patient_care', '{receptionist}', 'percentage', '%', 90, 20, 'manual', 3),
  ('Waiting Time Management', 'REC-WAIT', 'Average patient wait < 15 min', 'operational', '{receptionist}', 'percentage', '%', 85, 20, 'hms_auto', 4),
  ('Collection Accuracy', 'REC-COLL', 'Billing and collection without discrepancy', 'financial', '{receptionist}', 'percentage', '%', 100, 20, 'manual', 5),

  -- Pharmacy KPIs
  ('Dispensing Accuracy', 'PH-ACC', 'Error-free dispensing rate', 'compliance', '{pharmacist}', 'percentage', '%', 99.5, 25, 'manual', 1),
  ('Expiry Monitoring', 'PH-EXP', 'Near-expiry items flagged on time', 'compliance', '{pharmacist}', 'percentage', '%', 100, 20, 'hms_auto', 2),
  ('Stock Compliance', 'PH-STOCK', 'Min stock levels maintained', 'operational', '{pharmacist}', 'percentage', '%', 95, 20, 'hms_auto', 3),
  ('Patient Service Time', 'PH-TIME', 'Average dispensing time (minutes)', 'operational', '{pharmacist}', 'number', 'minutes', 3, 15, 'manual', 4),
  ('Sales Target', 'PH-SALE', 'Monthly pharmacy sales target', 'financial', '{pharmacist}', 'currency', '₹', 100000, 20, 'hms_auto', 5),

  -- Manager KPIs
  ('Branch Revenue', 'MGR-REV', 'Monthly branch revenue vs target', 'financial', '{}', 'percentage', '%', 100, 25, 'hms_auto', 1),
  ('Staff Attendance Rate', 'MGR-ATT', 'Branch staff average attendance', 'operational', '{}', 'percentage', '%', 92, 15, 'attendance_auto', 2),
  ('Patient Satisfaction (NPS)', 'MGR-NPS', 'Branch Net Promoter Score', 'patient_care', '{}', 'rating', '/10', 8, 20, 'hms_auto', 3),
  ('Operational Compliance', 'MGR-COMP', 'Audit score / checklist completion', 'compliance', '{}', 'percentage', '%', 90, 20, 'manual', 4),
  ('Staff Retention', 'MGR-RET', 'Employee retention rate (quarterly)', 'teamwork', '{}', 'percentage', '%', 95, 20, 'manual', 5)
ON CONFLICT (organisation_id, code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. EMPLOYEE KPIs (Monthly/periodic scores per employee)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  kpi_template_id UUID NOT NULL REFERENCES hrms_kpi_templates(id) ON DELETE CASCADE,
  
  -- Period
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  
  -- Score
  actual_value DECIMAL(10,2) DEFAULT 0,
  target_value DECIMAL(10,2) DEFAULT 0,
  achievement_pct DECIMAL(5,1) DEFAULT 0,
  weighted_score DECIMAL(5,2) DEFAULT 0,    -- (achievement_pct * weightage / 100)
  
  -- Rating (1-5 scale)
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  -- Source
  data_source TEXT DEFAULT 'manual',
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMPTZ,
  
  remarks TEXT,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, kpi_template_id, month, year)
);

ALTER TABLE hrms_employee_kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own KPIs" ON hrms_employee_kpis;
CREATE POLICY "Employee views own KPIs"
  ON hrms_employee_kpis FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages KPIs" ON hrms_employee_kpis;
CREATE POLICY "HR manages KPIs"
  ON hrms_employee_kpis FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_kpi_employee ON hrms_employee_kpis(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_emp_kpi_template ON hrms_employee_kpis(kpi_template_id, year, month);
CREATE INDEX IF NOT EXISTS idx_emp_kpi_period ON hrms_employee_kpis(year DESC, month DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. PERFORMANCE REVIEWS (Periodic appraisals)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  -- Review period
  review_type TEXT NOT NULL DEFAULT 'annual' CHECK (review_type IN (
    'probation', 'quarterly', 'half_yearly', 'annual', 'adhoc'
  )),
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  
  -- Scores (aggregated from KPIs + manager assessment)
  kpi_score DECIMAL(5,2) DEFAULT 0,           -- average weighted KPI (0-100)
  manager_rating INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  final_rating INTEGER CHECK (final_rating BETWEEN 1 AND 5),
  
  -- Overall grade
  grade TEXT CHECK (grade IN ('A+', 'A', 'B+', 'B', 'C', 'D', NULL)),
  
  -- Narrative
  strengths TEXT,
  areas_of_improvement TEXT,
  goals_next_period TEXT,
  employee_comments TEXT,
  manager_comments TEXT,
  hr_comments TEXT,
  
  -- Recommendation
  recommendation TEXT CHECK (recommendation IN (
    'promotion', 'increment', 'confirmation', 'pip', 'training', 'no_change', 'termination', NULL
  )),
  increment_percentage DECIMAL(5,2),
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'self_review', 'manager_review', 'hr_review', 'completed', 'acknowledged'
  )),
  
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  acknowledged_by_employee BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_performance_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own reviews" ON hrms_performance_reviews;
CREATE POLICY "Employee views own reviews"
  ON hrms_performance_reviews FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages reviews" ON hrms_performance_reviews;
CREATE POLICY "HR manages reviews"
  ON hrms_performance_reviews FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_reviews_employee ON hrms_performance_reviews(employee_id, period_from DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON hrms_performance_reviews(status) WHERE status NOT IN ('completed', 'acknowledged');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TRAININGS (Training programs master)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'mandatory', 'clinical', 'safety', 'compliance', 'soft_skills',
    'technical', 'leadership', 'induction', 'general'
  )),
  description TEXT,
  
  -- Details
  trainer_name TEXT,
  trainer_type TEXT CHECK (trainer_type IN ('internal', 'external', 'online', NULL)),
  duration_hours DECIMAL(5,1) DEFAULT 1,
  max_participants INTEGER,
  
  -- Schedule
  scheduled_date DATE,
  scheduled_time TIME,
  venue TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  
  -- Applicability
  applicable_roles TEXT[] DEFAULT '{}',
  applicable_departments TEXT[] DEFAULT '{}',
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_months INTEGER,              -- retrain every X months
  
  -- Assessment
  has_assessment BOOLEAN DEFAULT false,
  passing_score DECIMAL(5,2) DEFAULT 70,
  
  -- Certificate
  has_certificate BOOLEAN DEFAULT false,
  certificate_validity_months INTEGER,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff views trainings" ON hrms_trainings;
CREATE POLICY "Staff views trainings"
  ON hrms_trainings FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()) OR is_active = true);

DROP POLICY IF EXISTS "HR manages trainings" ON hrms_trainings;
CREATE POLICY "HR manages trainings"
  ON hrms_trainings FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- Seed training programs
INSERT INTO hrms_trainings (name, code, category, description, duration_hours, is_mandatory, applicable_roles, has_certificate, certificate_validity_months, is_recurring, recurrence_months) VALUES
  ('Fire Safety & Evacuation', 'TRN-FIRE', 'safety', 'Annual fire safety drill and evacuation procedure training', 2, true, '{}', true, 12, true, 12),
  ('Infection Control & BMW', 'TRN-IC', 'safety', 'Biomedical waste management and infection prevention', 3, true, '{}', true, 12, true, 12),
  ('Patient Safety Protocol', 'TRN-PS', 'compliance', 'Patient identification, fall prevention, medication safety', 2, true, '{doctor,nurse,therapist}', true, 12, true, 12),
  ('Panchakarma SOP Training', 'TRN-PK', 'clinical', 'Standard operating procedures for all Panchakarma therapies', 8, true, '{therapist}', true, 24, true, 24),
  ('NABH Documentation', 'TRN-NABH', 'compliance', 'NABH documentation standards and audit preparation', 4, false, '{}', false, NULL, true, 6),
  ('CPR & Basic Life Support', 'TRN-BLS', 'safety', 'CPR and BLS certification for clinical staff', 4, true, '{doctor,nurse,therapist}', true, 24, true, 24),
  ('Communication & Soft Skills', 'TRN-COMM', 'soft_skills', 'Patient communication, empathy, and telephone etiquette', 3, false, '{receptionist}', false, NULL, false, NULL),
  ('New Employee Induction', 'TRN-IND', 'induction', 'Hospital overview, policies, culture, and systems training', 4, true, '{}', false, NULL, false, NULL),
  ('Pharmacy Drug Safety', 'TRN-DRUG', 'clinical', 'Drug interactions, storage, dispensing protocols', 3, true, '{pharmacist}', true, 12, true, 12),
  ('Data Privacy & DPDP Act', 'TRN-PRIV', 'compliance', 'Patient data privacy, consent, and DPDP compliance', 2, true, '{}', false, NULL, true, 12),
  ('Emergency Response', 'TRN-EMER', 'safety', 'Emergency protocols, anaphylaxis, code blue procedures', 3, true, '{doctor,nurse}', true, 12, true, 12),
  ('AYUSH Clinical Protocols', 'TRN-AYUSH', 'clinical', 'Evidence-based AYUSH clinical protocols and documentation', 6, false, '{doctor}', true, 36, false, NULL)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. EMPLOYEE TRAINING (Assignment & completion tracking)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES hrms_trainings(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'in_progress', 'completed', 'failed', 'exempted', 'expired'
  )),
  
  -- Attendance
  attended BOOLEAN DEFAULT false,
  attendance_date DATE,
  
  -- Assessment
  assessment_score DECIMAL(5,2),
  passed BOOLEAN,
  
  -- Certificate
  certificate_issued BOOLEAN DEFAULT false,
  certificate_number TEXT,
  certificate_url TEXT,
  certificate_expiry DATE,
  
  -- Feedback
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,
  
  -- Meta
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, training_id, attendance_date)
);

ALTER TABLE hrms_employee_training ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own training" ON hrms_employee_training;
CREATE POLICY "Employee views own training"
  ON hrms_employee_training FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages employee training" ON hrms_employee_training;
CREATE POLICY "HR manages employee training"
  ON hrms_employee_training FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_training_employee ON hrms_employee_training(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_emp_training_training ON hrms_employee_training(training_id);
CREATE INDEX IF NOT EXISTS idx_emp_training_expiry ON hrms_employee_training(certificate_expiry) WHERE certificate_expiry IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_kpi_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_kpis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_performance_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_trainings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_training TO authenticated;

GRANT ALL ON hrms_kpi_templates TO service_role;
GRANT ALL ON hrms_employee_kpis TO service_role;
GRANT ALL ON hrms_performance_reviews TO service_role;
GRANT ALL ON hrms_trainings TO service_role;
GRANT ALL ON hrms_employee_training TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 4 Performance & Training Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 5: HR Lifecycle Tables                                   ║
-- ║                                                                              ║
-- ║  Creates: Vacancies, Candidates, Interviews, Onboarding Tasks,               ║
-- ║           Employee Requests, HR Letters, Employee Assets,                     ║
-- ║           Disciplinary Records, Resignations, Exit Clearance, Announcements   ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing tables.             ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. VACANCIES (Recruitment pipeline — job openings)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_vacancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  department_id UUID REFERENCES hrms_departments(id) ON DELETE SET NULL,
  
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  designation TEXT,
  positions INTEGER DEFAULT 1,
  filled INTEGER DEFAULT 0,
  
  -- Requirements
  qualification_required TEXT,
  experience_min INTEGER DEFAULT 0,
  experience_max INTEGER,
  salary_range_min DECIMAL(12,2),
  salary_range_max DECIMAL(12,2),
  skills TEXT[],
  description TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'on_hold', 'closed', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
  
  posted_date DATE DEFAULT CURRENT_DATE,
  closing_date DATE,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_vacancies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR manages vacancies" ON hrms_vacancies;
CREATE POLICY "HR manages vacancies" ON hrms_vacancies FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CANDIDATES (Applicant Tracking)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vacancy_id UUID REFERENCES hrms_vacancies(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  
  -- Qualifications
  qualification TEXT,
  experience_years DECIMAL(4,1) DEFAULT 0,
  current_employer TEXT,
  current_designation TEXT,
  current_salary DECIMAL(12,2),
  expected_salary DECIMAL(12,2),
  
  -- Application
  resume_url TEXT,
  cover_letter TEXT,
  source TEXT CHECK (source IN ('portal', 'referral', 'walk_in', 'agency', 'social_media', 'website', 'other')),
  referred_by TEXT,
  
  -- Pipeline status
  status TEXT NOT NULL DEFAULT 'applied' CHECK (status IN (
    'applied', 'screening', 'shortlisted', 'interview', 'selected',
    'offer', 'joined', 'rejected', 'withdrawn', 'on_hold'
  )),
  
  rejection_reason TEXT,
  offer_salary DECIMAL(12,2),
  offer_date DATE,
  joining_date DATE,
  converted_employee_id UUID REFERENCES hms_staff(id) ON DELETE SET NULL,
  
  notes TEXT,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_candidates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR manages candidates" ON hrms_candidates;
CREATE POLICY "HR manages candidates" ON hrms_candidates FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_candidates_vacancy ON hrms_candidates(vacancy_id, status);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON hrms_candidates(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. INTERVIEWS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES hrms_candidates(id) ON DELETE CASCADE,
  vacancy_id UUID REFERENCES hrms_vacancies(id) ON DELETE SET NULL,
  
  round INTEGER DEFAULT 1,
  interview_type TEXT DEFAULT 'in_person' CHECK (interview_type IN ('in_person', 'phone', 'video', 'practical', 'group')),
  scheduled_date DATE,
  scheduled_time TIME,
  duration_minutes INTEGER DEFAULT 30,
  
  interviewer_name TEXT,
  interviewer_id UUID REFERENCES auth.users(id),
  
  -- Assessment
  score INTEGER CHECK (score BETWEEN 1 AND 10),
  feedback TEXT,
  strengths TEXT,
  weaknesses TEXT,
  recommendation TEXT CHECK (recommendation IN ('strong_hire', 'hire', 'maybe', 'no_hire', NULL)),
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_interviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR manages interviews" ON hrms_interviews;
CREATE POLICY "HR manages interviews" ON hrms_interviews FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. ONBOARDING TASKS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  task_name TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'documents', 'orientation', 'training', 'access', 'equipment', 'compliance', 'general'
  )),
  description TEXT,
  
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  due_date DATE,
  
  sort_order INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT true,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_onboarding_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR manages onboarding" ON hrms_onboarding_tasks;
CREATE POLICY "HR manages onboarding" ON hrms_onboarding_tasks FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()) OR employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. EMPLOYEE REQUESTS (Self-service)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  request_type TEXT NOT NULL CHECK (request_type IN (
    'attendance_correction', 'shift_change', 'on_duty', 'salary_advance',
    'loan', 'document_request', 'experience_certificate', 'hr_query',
    'reimbursement', 'id_card', 'uniform', 'other'
  )),
  
  subject TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2),           -- for salary advance / reimbursement
  attachment_url TEXT,
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'under_review', 'approved', 'rejected', 'completed', 'cancelled'
  )),
  
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_remarks TEXT,
  completed_at TIMESTAMPTZ,
  
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_employee_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own requests" ON hrms_employee_requests;
CREATE POLICY "Employee views own requests" ON hrms_employee_requests FOR SELECT TO authenticated
  USING (requested_by = auth.uid() OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Employee creates requests" ON hrms_employee_requests;
CREATE POLICY "Employee creates requests" ON hrms_employee_requests FOR INSERT TO authenticated
  WITH CHECK (requested_by = auth.uid());

DROP POLICY IF EXISTS "HR manages requests" ON hrms_employee_requests;
CREATE POLICY "HR manages requests" ON hrms_employee_requests FOR UPDATE TO authenticated
  USING (requested_by = auth.uid() OR public.is_hms_staff(auth.uid()))
  WITH CHECK (requested_by = auth.uid() OR public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_requests_status ON hrms_employee_requests(status) WHERE status IN ('submitted', 'under_review');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. HR LETTERS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_hr_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  letter_type TEXT NOT NULL CHECK (letter_type IN (
    'offer', 'appointment', 'confirmation', 'increment', 'transfer',
    'warning', 'show_cause', 'experience', 'relieving', 'termination', 'other'
  )),
  
  subject TEXT NOT NULL,
  content TEXT NOT NULL,              -- HTML or markdown template with variables filled
  template_used TEXT,
  
  -- Issue
  issued_date DATE DEFAULT CURRENT_DATE,
  issued_by UUID REFERENCES auth.users(id),
  reference_number TEXT,
  
  -- Version control
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES hrms_hr_letters(id) ON DELETE SET NULL,
  
  -- Delivery
  delivered_to_employee BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  acknowledged_by_employee BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  document_url TEXT,                  -- PDF stored
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_hr_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own letters" ON hrms_hr_letters;
CREATE POLICY "Employee views own letters" ON hrms_hr_letters FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid()) OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages letters" ON hrms_hr_letters;
CREATE POLICY "HR manages letters" ON hrms_hr_letters FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid())) WITH CHECK (public.is_hr_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. EMPLOYEE ASSETS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'laptop', 'mobile', 'sim', 'keys', 'id_card', 'uniform',
    'medical_equipment', 'stethoscope', 'vehicle', 'other'
  )),
  asset_name TEXT NOT NULL,
  asset_code TEXT,                    -- serial/asset tag
  description TEXT,
  
  -- Tracking
  issued_date DATE,
  issued_by UUID REFERENCES auth.users(id),
  expected_return_date DATE,
  returned_date DATE,
  returned_to UUID REFERENCES auth.users(id),
  
  condition_at_issue TEXT DEFAULT 'new' CHECK (condition_at_issue IN ('new', 'good', 'fair', 'used')),
  condition_at_return TEXT CHECK (condition_at_return IN ('good', 'fair', 'damaged', 'lost', NULL)),
  
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'damaged', 'lost', 'written_off')),
  damage_notes TEXT,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_employee_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff views assets" ON hrms_employee_assets;
CREATE POLICY "Staff views assets" ON hrms_employee_assets FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid()) OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages assets" ON hrms_employee_assets;
CREATE POLICY "HR manages assets" ON hrms_employee_assets FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_assets_employee ON hrms_employee_assets(employee_id, status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. DISCIPLINARY RECORDS (Restricted HR access only)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_disciplinary_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  incident_type TEXT NOT NULL CHECK (incident_type IN (
    'verbal_counselling', 'written_warning', 'show_cause', 'suspension',
    'misconduct', 'policy_violation', 'attendance_issue', 'performance_issue', 'other'
  )),
  
  incident_date DATE NOT NULL,
  reported_by TEXT,
  description TEXT NOT NULL,
  
  -- Employee response
  employee_response TEXT,
  response_date DATE,
  
  -- Action taken
  action_taken TEXT,
  action_date DATE,
  action_by UUID REFERENCES auth.users(id),
  
  -- Resolution
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_investigation', 'resolved', 'closed', 'escalated')),
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  
  -- Connected letter (warning/show-cause)
  letter_id UUID REFERENCES hrms_hr_letters(id) ON DELETE SET NULL,
  
  -- Strictly restricted access
  is_confidential BOOLEAN DEFAULT true,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_disciplinary_records ENABLE ROW LEVEL SECURITY;

-- ONLY HR Admin can access disciplinary records (not regular HMS staff)
DROP POLICY IF EXISTS "Only HR admin views disciplinary" ON hrms_disciplinary_records;
CREATE POLICY "Only HR admin views disciplinary" ON hrms_disciplinary_records FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid())) WITH CHECK (public.is_hr_admin(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. RESIGNATIONS & EXIT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_resignations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  resignation_date DATE NOT NULL,
  notice_period_days INTEGER DEFAULT 30,
  last_working_date DATE,
  reason TEXT,
  reason_category TEXT CHECK (reason_category IN (
    'personal', 'better_opportunity', 'relocation', 'health', 'higher_studies',
    'family', 'retirement', 'dissatisfaction', 'other'
  )),
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN (
    'submitted', 'manager_review', 'hr_review', 'accepted', 'withdrawn', 'rejected'
  )),
  
  accepted_by UUID REFERENCES auth.users(id),
  accepted_at TIMESTAMPTZ,
  
  -- Exit interview
  exit_interview_done BOOLEAN DEFAULT false,
  exit_interview_date DATE,
  exit_feedback TEXT,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_resignations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Employee views own resignation" ON hrms_resignations;
CREATE POLICY "Employee views own resignation" ON hrms_resignations FOR SELECT TO authenticated
  USING (employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid()) OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages resignations" ON hrms_resignations;
CREATE POLICY "HR manages resignations" ON hrms_resignations FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. EXIT CLEARANCE (Department-wise clearance)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_exit_clearance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  resignation_id UUID REFERENCES hrms_resignations(id) ON DELETE SET NULL,
  
  department TEXT NOT NULL,           -- HR, IT, Accounts, Pharmacy/Stores, Admin, Department
  clearance_item TEXT NOT NULL,       -- What needs to be cleared
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cleared', 'pending_return', 'issues')),
  remarks TEXT,
  
  cleared_by UUID REFERENCES auth.users(id),
  cleared_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_exit_clearance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "HR manages exit clearance" ON hrms_exit_clearance;
CREATE POLICY "HR manages exit clearance" ON hrms_exit_clearance FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. ANNOUNCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,   -- NULL = all branches
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN (
    'general', 'policy', 'event', 'holiday', 'urgent', 'achievement', 'birthday', 'anniversary'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Target audience
  target_departments TEXT[] DEFAULT '{}',    -- empty = all departments
  target_roles TEXT[] DEFAULT '{}',          -- empty = all roles
  
  -- Schedule
  publish_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_published BOOLEAN DEFAULT true,
  is_pinned BOOLEAN DEFAULT false,
  
  published_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_announcements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All staff view announcements" ON hrms_announcements;
CREATE POLICY "All staff view announcements" ON hrms_announcements FOR SELECT TO authenticated
  USING (is_published = true OR public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "HR manages announcements" ON hrms_announcements;
CREATE POLICY "HR manages announcements" ON hrms_announcements FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid())) WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_announcements_date ON hrms_announcements(publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON hrms_announcements(is_published, expiry_date);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_vacancies TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_candidates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_interviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_onboarding_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON hrms_employee_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_hr_letters TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_disciplinary_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_resignations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_exit_clearance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_announcements TO authenticated;

GRANT ALL ON hrms_vacancies TO service_role;
GRANT ALL ON hrms_candidates TO service_role;
GRANT ALL ON hrms_interviews TO service_role;
GRANT ALL ON hrms_onboarding_tasks TO service_role;
GRANT ALL ON hrms_employee_requests TO service_role;
GRANT ALL ON hrms_hr_letters TO service_role;
GRANT ALL ON hrms_employee_assets TO service_role;
GRANT ALL ON hrms_disciplinary_records TO service_role;
GRANT ALL ON hrms_resignations TO service_role;
GRANT ALL ON hrms_exit_clearance TO service_role;
GRANT ALL ON hrms_announcements TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 5 HR Lifecycle Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE — Unified Patient ID System                                           ║
-- ║                                                                              ║
-- ║  Ensures ONE patient = ONE identity across the entire platform.              ║
-- ║  Whether patient signs up via app OR walks into hospital, same record.       ║
-- ║                                                                              ║
-- ║  Architecture:                                                               ║
-- ║    auth.users (UUID) = universal identifier                                  ║
-- ║    profiles.ayuzee_patient_id = human-readable ID (AYZ-P-000001)             ║
-- ║    profiles.phone = matching key between Platform ↔ HMS                       ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing data.               ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ADD ayuzee_patient_id TO profiles TABLE
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ayuzee_patient_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS abha_id TEXT,                    -- ABDM Health ID (future)
  ADD COLUMN IF NOT EXISTS hms_patient_linked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS hms_op_number TEXT,              -- Hospital OP number
  ADD COLUMN IF NOT EXISTS hms_branch_id UUID REFERENCES hms_branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;

-- Create unique partial index on ayuzee_patient_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_patient_id
  ON profiles(ayuzee_patient_id) WHERE ayuzee_patient_id IS NOT NULL;

-- Index for phone-based patient lookup (critical for matching)
CREATE INDEX IF NOT EXISTS idx_profiles_phone
  ON profiles(phone) WHERE phone IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SEQUENCE FOR PATIENT ID GENERATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- Create a sequence for auto-incrementing patient numbers
CREATE SEQUENCE IF NOT EXISTS ayuzee_patient_id_seq START WITH 1;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. FUNCTION: Generate Ayuzee Patient ID
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_ayuzee_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('ayuzee_patient_id_seq');
  RETURN 'AYZ-P-' || LPAD(next_num::TEXT, 6, '0');
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. FUNCTION: Find or Create Patient Profile (Phone-based matching)
--    Used by HMS registration to avoid duplicates.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION find_or_link_patient(
  _phone TEXT,
  _name TEXT DEFAULT NULL,
  _email TEXT DEFAULT NULL,
  _gender TEXT DEFAULT NULL,
  _date_of_birth DATE DEFAULT NULL,
  _city TEXT DEFAULT NULL,
  _branch_id UUID DEFAULT NULL
)
RETURNS TABLE (
  profile_id UUID,
  user_id UUID,
  ayuzee_patient_id TEXT,
  is_existing BOOLEAN,
  full_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _profile RECORD;
  _new_patient_id TEXT;
BEGIN
  -- Step 1: Search by phone in existing profiles
  SELECT p.id, p.user_id, p.ayuzee_patient_id, p.full_name
  INTO _profile
  FROM profiles p
  WHERE p.phone = _phone
  LIMIT 1;

  -- Found existing profile → link to HMS and return
  IF _profile.id IS NOT NULL THEN
    -- Ensure ayuzee_patient_id exists
    IF _profile.ayuzee_patient_id IS NULL THEN
      _new_patient_id := generate_ayuzee_patient_id();
      UPDATE profiles SET
        ayuzee_patient_id = _new_patient_id,
        hms_patient_linked = true,
        hms_branch_id = COALESCE(_branch_id, hms_branch_id),
        updated_at = NOW()
      WHERE id = _profile.id;
    ELSE
      _new_patient_id := _profile.ayuzee_patient_id;
      UPDATE profiles SET
        hms_patient_linked = true,
        hms_branch_id = COALESCE(_branch_id, hms_branch_id),
        updated_at = NOW()
      WHERE id = _profile.id;
    END IF;

    RETURN QUERY SELECT
      _profile.id,
      _profile.user_id,
      _new_patient_id,
      true::BOOLEAN,
      _profile.full_name;
    RETURN;
  END IF;

  -- Step 2: Also check auth.users by phone (might have signed up with phone auth)
  -- (Supabase stores phone in auth.users.phone)
  SELECT p.id, p.user_id, p.ayuzee_patient_id, p.full_name
  INTO _profile
  FROM profiles p
  JOIN auth.users u ON u.id = p.user_id
  WHERE u.phone = _phone OR u.email = _email
  LIMIT 1;

  IF _profile.id IS NOT NULL THEN
    IF _profile.ayuzee_patient_id IS NULL THEN
      _new_patient_id := generate_ayuzee_patient_id();
    ELSE
      _new_patient_id := _profile.ayuzee_patient_id;
    END IF;

    UPDATE profiles SET
      ayuzee_patient_id = COALESCE(ayuzee_patient_id, _new_patient_id),
      phone = COALESCE(phone, _phone),
      hms_patient_linked = true,
      hms_branch_id = COALESCE(_branch_id, hms_branch_id),
      updated_at = NOW()
    WHERE id = _profile.id;

    RETURN QUERY SELECT
      _profile.id,
      _profile.user_id,
      _new_patient_id,
      true::BOOLEAN,
      _profile.full_name;
    RETURN;
  END IF;

  -- Step 3: No existing record found → Create new profile (HMS walk-in patient)
  -- Note: No auth.users record yet — patient hasn't signed up digitally
  -- We create a profile with a generated patient ID that can be linked later
  _new_patient_id := generate_ayuzee_patient_id();

  INSERT INTO profiles (
    user_id, full_name, phone, email, gender, date_of_birth, city,
    ayuzee_patient_id, hms_patient_linked, hms_branch_id, is_active
  ) VALUES (
    -- Use a placeholder UUID (will be linked when patient creates account)
    gen_random_uuid(),
    COALESCE(_name, 'Walk-in Patient'),
    _phone,
    _email,
    _gender,
    _date_of_birth,
    _city,
    _new_patient_id,
    true,
    _branch_id,
    true
  )
  RETURNING profiles.id, profiles.user_id, profiles.ayuzee_patient_id, profiles.full_name
  INTO _profile;

  RETURN QUERY SELECT
    _profile.id,
    _profile.user_id,
    _profile.ayuzee_patient_id,
    false::BOOLEAN,
    _profile.full_name;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. FUNCTION: Generate OP Number (per branch, per year)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION generate_op_number(_branch_code TEXT DEFAULT 'ALSH-01')
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  _year TEXT;
  _next_num INTEGER;
BEGIN
  _year := TO_CHAR(CURRENT_DATE, 'YYYY');

  -- Count existing patients for this branch this year + 1
  SELECT COALESCE(MAX(
    NULLIF(SPLIT_PART(hms_op_number, '/', 4), '')::INTEGER
  ), 0) + 1
  INTO _next_num
  FROM profiles
  WHERE hms_op_number LIKE _branch_code || '/OP/' || _year || '/%';

  RETURN _branch_code || '/OP/' || _year || '/' || LPAD(_next_num::TEXT, 4, '0');
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. TRIGGER: Auto-assign ayuzee_patient_id on new profile creation
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION auto_assign_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only assign if not already set and user has 'patient' role or no specific role
  IF NEW.ayuzee_patient_id IS NULL THEN
    NEW.ayuzee_patient_id := generate_ayuzee_patient_id();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_patient_id ON profiles;
CREATE TRIGGER trg_auto_patient_id
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_patient_id();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. BACKFILL: Assign patient IDs to existing profiles that don't have one
-- ═══════════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id FROM profiles
    WHERE ayuzee_patient_id IS NULL
    ORDER BY created_at ASC
  LOOP
    UPDATE profiles
    SET ayuzee_patient_id = generate_ayuzee_patient_id()
    WHERE id = r.id;
  END LOOP;
END $$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. VIEW: Unified Patient Directory (Platform + HMS combined)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW unified_patient_directory AS
SELECT
  p.id AS profile_id,
  p.user_id,
  p.ayuzee_patient_id,
  p.hms_op_number,
  p.full_name,
  p.phone,
  p.email,
  p.gender,
  p.date_of_birth,
  p.city,
  p.state,
  p.blood_group,
  p.hms_patient_linked,
  p.hms_branch_id,
  b.branch_name AS linked_branch,
  p.abha_id,
  p.is_active,
  p.created_at,
  -- Status indicators
  CASE
    WHEN p.hms_patient_linked AND p.user_id IN (SELECT id FROM auth.users) THEN 'platform_and_hms'
    WHEN p.hms_patient_linked THEN 'hms_only'
    WHEN p.user_id IN (SELECT id FROM auth.users) THEN 'platform_only'
    ELSE 'orphan'
  END AS sync_status
FROM profiles p
LEFT JOIN hms_branches b ON b.id = p.hms_branch_id
WHERE p.is_active = true
ORDER BY p.created_at DESC;

GRANT SELECT ON unified_patient_directory TO authenticated;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. FUNCTION: Search Patient (for HMS registration — avoids duplicates)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION search_patient(_query TEXT)
RETURNS TABLE (
  profile_id UUID,
  ayuzee_patient_id TEXT,
  hms_op_number TEXT,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  gender TEXT,
  date_of_birth DATE,
  city TEXT,
  hms_patient_linked BOOLEAN,
  sync_status TEXT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.ayuzee_patient_id,
    p.hms_op_number,
    p.full_name,
    p.phone,
    p.email,
    p.gender,
    p.date_of_birth,
    p.city,
    p.hms_patient_linked,
    CASE
      WHEN p.hms_patient_linked THEN 'linked'
      ELSE 'platform_only'
    END
  FROM profiles p
  WHERE p.is_active = true
    AND (
      p.phone ILIKE '%' || _query || '%'
      OR p.full_name ILIKE '%' || _query || '%'
      OR p.ayuzee_patient_id ILIKE '%' || _query || '%'
      OR p.hms_op_number ILIKE '%' || _query || '%'
      OR p.email ILIKE '%' || _query || '%'
    )
  ORDER BY
    CASE WHEN p.phone = _query THEN 0 ELSE 1 END,  -- Exact phone match first
    p.full_name
  LIMIT 20;
$$;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Unified Patient ID System Created Successfully
-- 
-- How it works:
-- 1. Every patient gets an AYZ-P-XXXXXX ID (auto-generated)
-- 2. When HMS registers a patient, call find_or_link_patient(phone)
--    → If phone exists in profiles → links existing record (no duplicate)
--    → If new → creates profile with patient ID
-- 3. When patient later signs up on Ayuzee app with same phone →
--    they see their hospital records because same profile is used
-- 4. OP number (branch-specific) generated separately via generate_op_number()
-- 5. All lookups go through search_patient() which searches across
--    phone, name, patient ID, OP number, and email
-- ═══════════════════════════════════════════════════════════════════════════════
-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Seed Sample Data for Testing                                   ║
-- ║  Run AFTER all Phase 1-6 scripts are executed.                               ║
-- ║  SAFE TO RUN: Uses ON CONFLICT DO NOTHING where possible.                    ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. UPDATE EXISTING hms_staff WITH HRMS FIELDS (enrich the 10 seeded staff)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Link all existing staff to default org
UPDATE hms_staff SET organisation_id = (SELECT id FROM hrms_organisations LIMIT 1) WHERE organisation_id IS NULL;

-- Link to first branch
UPDATE hms_staff SET branch_id = (SELECT id FROM hms_branches WHERE branch_code = 'ALSH-01' LIMIT 1) WHERE branch_id IS NULL;

-- Enrich with personal details
UPDATE hms_staff SET
  employee_code = 'EMP-0001', gender = 'male', date_of_birth = '1985-03-15',
  blood_group = 'B+', marital_status = 'Married',
  address_line1 = '42, Gandhi Nagar', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Priya Sharma', emergency_contact_phone = '9876543220', emergency_contact_relation = 'Spouse',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday', notice_period_days = 60
WHERE name = 'Dr. Arun Sharma';

UPDATE hms_staff SET
  employee_code = 'EMP-0002', gender = 'female', date_of_birth = '1990-07-22',
  blood_group = 'O+', marital_status = 'Single',
  address_line1 = '15, Lake View Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Ravi Patel', emergency_contact_phone = '9876543221', emergency_contact_relation = 'Father',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Dr. Meena Patel';

UPDATE hms_staff SET
  employee_code = 'EMP-0003', gender = 'male', date_of_birth = '1995-11-08',
  address_line1 = '8, Station Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Lakshmi K', emergency_contact_phone = '9876543222', emergency_contact_relation = 'Mother',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Rajesh K';

UPDATE hms_staff SET
  employee_code = 'EMP-0004', gender = 'female', date_of_birth = '1992-05-30',
  blood_group = 'A+', marital_status = 'Married',
  address_line1 = '22, Nehru Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Kumar M', emergency_contact_phone = '9876543223', emergency_contact_relation = 'Husband',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Sunita M';

UPDATE hms_staff SET
  employee_code = 'EMP-0005', gender = 'male', date_of_birth = '1988-09-12',
  blood_group = 'AB+',
  address_line1 = '5, Market Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Geetha R', emergency_contact_phone = '9876543224', emergency_contact_relation = 'Wife',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Vikram R';

UPDATE hms_staff SET
  employee_code = 'EMP-0006', gender = 'female', date_of_birth = '1994-02-18',
  address_line1 = '12, Park Avenue', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'probation', employee_status = 'probation',
  probation_end_date = '2026-09-01', weekly_off = 'Sunday'
WHERE name = 'Anita D';

UPDATE hms_staff SET
  employee_code = 'EMP-0007', gender = 'male', date_of_birth = '1986-12-05',
  blood_group = 'O-', marital_status = 'Married',
  address_line1 = '7, Temple Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Meena S', emergency_contact_phone = '9876543225', emergency_contact_relation = 'Wife',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Suresh Therapist';

UPDATE hms_staff SET
  employee_code = 'EMP-0008', gender = 'female', date_of_birth = '1996-08-25',
  address_line1 = '3, Hospital Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Priya Therapist';

UPDATE hms_staff SET
  employee_code = 'EMP-0009', gender = 'male', date_of_birth = '1998-04-14',
  address_line1 = '19, Anna Nagar', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'probation', employee_status = 'probation',
  probation_end_date = '2026-09-01', weekly_off = 'Sunday'
WHERE name = 'Mohan P';

UPDATE hms_staff SET
  employee_code = 'EMP-0010', gender = 'female', date_of_birth = '1987-06-20',
  blood_group = 'B-', marital_status = 'Married',
  address_line1 = '28, MG Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Srinivas S', emergency_contact_phone = '9876543226', emergency_contact_relation = 'Husband',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Kavita S';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SAMPLE ATTENDANCE (Last 5 days)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_attendance (employee_id, attendance_date, status, check_in, check_out, check_in_method, worked_hours, late_minutes)
SELECT s.id, d.dt, 
  CASE 
    WHEN s.name = 'Sunita M' AND d.dt = CURRENT_DATE THEN 'absent'
    WHEN s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1 THEN 'on_leave'
    WHEN EXTRACT(DOW FROM d.dt) = 0 THEN 'weekly_off'
    WHEN random() < 0.05 THEN 'late'
    ELSE 'present'
  END,
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1) 
    THEN (d.dt + TIME '09:00')::timestamptz ELSE NULL END,
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1) 
    THEN (d.dt + TIME '17:30')::timestamptz ELSE NULL END,
  'manual',
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1)
    THEN 8.5 ELSE 0 END,
  0
FROM hms_staff s
CROSS JOIN (
  SELECT CURRENT_DATE - i AS dt FROM generate_series(0, 4) AS i
) d
WHERE s.is_active = true
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. SAMPLE LEAVE BALANCES (2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_leave_balances (employee_id, leave_type_id, year, opening_balance, credited, used, pending)
SELECT 
  s.id,
  lt.id,
  2026,
  0,
  lt.annual_quota,
  CASE 
    WHEN lt.code = 'CL' THEN FLOOR(random() * 5)
    WHEN lt.code = 'SL' THEN FLOOR(random() * 3)
    WHEN lt.code = 'EL' THEN FLOOR(random() * 4)
    ELSE 0
  END,
  CASE WHEN lt.code = 'CL' AND random() < 0.3 THEN 1 ELSE 0 END
FROM hms_staff s
CROSS JOIN hrms_leave_types lt
WHERE s.is_active = true AND lt.is_active = true
  AND lt.code IN ('CL', 'SL', 'EL', 'CO', 'LOP')
ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. SAMPLE LEAVE REQUESTS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_leave_requests (employee_id, leave_type_id, from_date, to_date, total_days, is_half_day, reason, status, applied_by)
SELECT 
  s.id,
  (SELECT id FROM hrms_leave_types WHERE code = 'CL' LIMIT 1),
  '2026-08-25', '2026-08-26', 2, false,
  'Family function',
  'pending',
  COALESCE(s.user_id, (SELECT id FROM auth.users LIMIT 1))
FROM hms_staff s WHERE s.name = 'Mohan P' AND s.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO hrms_leave_requests (employee_id, leave_type_id, from_date, to_date, total_days, is_half_day, reason, status, applied_by)
SELECT 
  s.id,
  (SELECT id FROM hrms_leave_types WHERE code = 'EL' LIMIT 1),
  '2026-09-01', '2026-09-05', 5, false,
  'Annual vacation',
  'pending',
  COALESCE(s.user_id, (SELECT id FROM auth.users LIMIT 1))
FROM hms_staff s WHERE s.name = 'Rajesh K' AND s.is_active = true
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SAMPLE DUTY ROSTER (Current week)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_duty_roster (employee_id, roster_date, shift_id, status, department)
SELECT 
  s.id,
  d.dt,
  CASE 
    WHEN EXTRACT(DOW FROM d.dt) = 0 THEN NULL  -- Sunday off
    WHEN s.department = 'IPD' THEN (SELECT id FROM hrms_shifts WHERE code = 'M' LIMIT 1)
    ELSE (SELECT id FROM hrms_shifts WHERE code = 'G' LIMIT 1)
  END,
  CASE WHEN EXTRACT(DOW FROM d.dt) = 0 THEN 'cancelled' ELSE 'scheduled' END,
  s.department
FROM hms_staff s
CROSS JOIN (
  SELECT (date_trunc('week', CURRENT_DATE) + (i || ' days')::interval)::date AS dt 
  FROM generate_series(0, 6) AS i
) d
WHERE s.is_active = true
ON CONFLICT (employee_id, roster_date) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. SAMPLE EMPLOYEE QUALIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'BAMS', 'Govt. Ayurveda College, Thiruvananthapuram', 'KUHS', 2008, 'TN/AYU/12345', 'TNBIM', '2027-03-31', true
FROM hms_staff s WHERE s.name = 'Dr. Arun Sharma'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'BAMS', 'Sri Jayendra Saraswathi Ayurveda College', 'NTRUHS', 2015, 'TN/AYU/23456', 'TNBIM', '2026-09-15', true
FROM hms_staff s WHERE s.name = 'Dr. Meena Patel'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, is_primary)
SELECT s.id, 'DMLT', 'Govt. Medical College, Tirunelveli', 'Dr. MGR University', 2022, true
FROM hms_staff s WHERE s.name = 'Anita D'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, year_of_passing, is_primary)
SELECT s.id, 'Diploma in Panchakarma Therapy', 'AYUSH Training Centre, Chennai', 2020, true
FROM hms_staff s WHERE s.name = 'Suresh Therapist'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'B.Pharm', 'PSG College of Pharmacy, Coimbatore', 2014, 'TN/PH/34567', 'TN Pharmacy Council', '2027-06-30', true
FROM hms_staff s WHERE s.name = 'Vikram R'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. SAMPLE KPI SCORES (August 2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_kpis (employee_id, kpi_template_id, month, year, actual_value, target_value, achievement_pct, weighted_score, rating)
SELECT s.id, kt.id, 8, 2026,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 18
    WHEN 'DOC-DOCS' THEN 92
    WHEN 'DOC-FB' THEN 4.5
    WHEN 'DOC-REV' THEN 320000
    WHEN 'DOC-FU' THEN 85
    WHEN 'DOC-ATT' THEN 100
    ELSE 0
  END,
  kt.target_value,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 120
    WHEN 'DOC-DOCS' THEN 97
    WHEN 'DOC-FB' THEN 107
    WHEN 'DOC-REV' THEN 160
    WHEN 'DOC-FU' THEN 106
    WHEN 'DOC-ATT' THEN 105
    ELSE 0
  END,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 24
    WHEN 'DOC-DOCS' THEN 14.5
    WHEN 'DOC-FB' THEN 16
    WHEN 'DOC-REV' THEN 20
    WHEN 'DOC-FU' THEN 16
    WHEN 'DOC-ATT' THEN 15.8
    ELSE 0
  END,
  CASE WHEN kt.code IN ('DOC-CONS', 'DOC-FB', 'DOC-REV', 'DOC-ATT') THEN 5 ELSE 4 END
FROM hms_staff s
CROSS JOIN hrms_kpi_templates kt
WHERE s.name = 'Dr. Arun Sharma'
  AND kt.code IN ('DOC-CONS', 'DOC-DOCS', 'DOC-FB', 'DOC-REV', 'DOC-FU', 'DOC-ATT')
ON CONFLICT (employee_id, kpi_template_id, month, year) DO NOTHING;

-- Therapist KPIs
INSERT INTO hrms_employee_kpis (employee_id, kpi_template_id, month, year, actual_value, target_value, achievement_pct, weighted_score, rating)
SELECT s.id, kt.id, 8, 2026,
  CASE kt.code WHEN 'TH-COMP' THEN 62 WHEN 'TH-FB' THEN 4.3 WHEN 'TH-ATT' THEN 100 ELSE 90 END,
  kt.target_value,
  CASE kt.code WHEN 'TH-COMP' THEN 124 WHEN 'TH-FB' THEN 108 WHEN 'TH-ATT' THEN 105 ELSE 95 END,
  CASE kt.code WHEN 'TH-COMP' THEN 31 WHEN 'TH-FB' THEN 21.5 WHEN 'TH-ATT' THEN 15.8 ELSE 14 END,
  CASE kt.code WHEN 'TH-COMP' THEN 5 ELSE 4 END
FROM hms_staff s
CROSS JOIN hrms_kpi_templates kt
WHERE s.name = 'Suresh Therapist'
  AND kt.code IN ('TH-COMP', 'TH-FB', 'TH-ATT', 'TH-PUNCT')
ON CONFLICT (employee_id, kpi_template_id, month, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. SAMPLE ANNOUNCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_announcements (title, content, category, priority, publish_date, is_published, is_pinned)
VALUES
  ('Independence Day Celebration', 'All staff are invited to the flag hoisting ceremony at 8:30 AM on August 15th at Main Hospital. Refreshments will be served.', 'event', 'high', '2026-08-13', true, true),
  ('New Leave Policy Update', 'Effective September 1st, earned leave carry-forward limit increased to 15 days. Refer updated policy document.', 'policy', 'normal', '2026-08-20', true, true),
  ('Fire Safety Drill — September 15', 'Mandatory fire safety drill for all staff. Attendance is compulsory. Certificate will be issued.', 'general', 'normal', '2026-08-21', true, false),
  ('Employee of the Month — August', 'Congratulations to Suresh Therapist for being selected as Employee of the Month! Outstanding patient feedback and procedure completion.', 'achievement', 'normal', '2026-08-20', true, false),
  ('Salary Credit Notice', 'August 2026 salary will be credited on September 1st. Payslips available on HRMS portal.', 'general', 'low', '2026-08-25', true, false)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. SAMPLE EMPLOYEE INCENTIVES (August 2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 320000, 200000, 160, 12000, 12000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Dr. Arun Sharma' AND ir.code = 'DOC-CONS'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 62, 50, 124, 4000, 4000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Suresh Therapist' AND ir.code = 'THER-PROC'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 160000, 100000, 160, 3000, 3000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Vikram R' AND ir.code = 'PHARM-SALE'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status, remarks)
SELECT s.id, ir.id, 8, 2026, 26, 26, 100, 1000, 1000, 'approved', 'Zero absences'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Rajesh K' AND ir.code = 'ATTEND-PERF'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. SAMPLE ONBOARDING (for newest employee)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_onboarding_tasks (employee_id, task_name, category, is_completed, is_mandatory, sort_order)
SELECT s.id, t.task_name, t.category, t.done, true, t.ord
FROM hms_staff s
CROSS JOIN (VALUES
  ('Appointment Letter Issued', 'documents', true, 1),
  ('Employee ID Created', 'access', true, 2),
  ('Aadhaar & PAN Collected', 'documents', true, 3),
  ('Bank Account Details', 'documents', true, 4),
  ('Qualification Certificates', 'documents', true, 5),
  ('HR Orientation', 'orientation', true, 6),
  ('Department Orientation', 'orientation', true, 7),
  ('Policy Acknowledgement', 'compliance', false, 8),
  ('Login Credentials', 'access', true, 9),
  ('Uniform Issued', 'equipment', false, 10),
  ('ID Card Issued', 'equipment', false, 11),
  ('Safety Training', 'training', false, 12),
  ('Probation Goals Set', 'compliance', false, 13)
) AS t(task_name, category, done, ord)
WHERE s.name = 'Anita D'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. SAMPLE VACANCY & CANDIDATE
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_vacancies (title, department, positions, status, priority, posted_date, qualification_required, experience_min)
VALUES
  ('Panchakarma Therapist', 'Panchakarma', 2, 'open', 'high', '2026-08-01', 'Diploma/BSc in Yoga or Naturopathy', 1),
  ('Staff Nurse (IPD)', 'IPD', 1, 'open', 'urgent', '2026-08-10', 'B.Sc Nursing / GNM', 2),
  ('Receptionist', 'Front Office', 1, 'open', 'normal', '2026-08-15', 'Graduate', 0)
ON CONFLICT DO NOTHING;

INSERT INTO hrms_candidates (vacancy_id, name, email, phone, qualification, experience_years, status, source)
SELECT v.id, c.name, c.email, c.phone, c.qual, c.exp, c.status, c.source
FROM hrms_vacancies v
CROSS JOIN (VALUES
  ('Deepa R', 'deepa@email.com', '9876500001', 'Diploma Yoga', 3, 'interview', 'referral'),
  ('Karthik M', 'karthik@email.com', '9876500002', 'BSc Yoga', 2, 'shortlisted', 'portal'),
  ('Priya V', 'priya@email.com', '9876500003', 'BNYS', 1, 'applied', 'website')
) AS c(name, email, phone, qual, exp, status, source)
WHERE v.title = 'Panchakarma Therapist'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. SAMPLE NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_notifications (title, message, category, priority, recipient_role, action_url, source_module)
VALUES
  ('Leave Request Pending', 'Mohan P has applied for 2 days CL (Aug 25-26). Awaiting approval.', 'leave', 'high', 'hr_admin', '/hms/hrms/leave', 'leave'),
  ('Attendance Alert', 'Sunita M absent for 3 consecutive days without leave application.', 'attendance', 'urgent', 'hr_admin', '/hms/hrms/attendance', 'attendance'),
  ('Registration Expiring', 'Dr. Meena Patel TNBIM registration expires Sep 15, 2026.', 'registration_expiry', 'high', 'hr_admin', '/hms/hrms/employees', 'documents'),
  ('Fire Safety Training', 'Mandatory training scheduled Sep 15. 5 staff not registered.', 'training', 'normal', 'hr_admin', '/hms/hrms/training', 'training'),
  ('Probation Ending', 'Mohan P probation ends Sep 1. Confirmation decision needed.', 'probation', 'high', 'hr_admin', '/hms/hrms/employees', 'employees'),
  ('Payroll Lock Date', 'August attendance lock date approaching (25th). Complete corrections.', 'payroll', 'normal', 'hr_admin', '/hms/hrms/payroll', 'payroll')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Sample data seeded successfully!
-- ═══════════════════════════════════════════════════════════════════════════════
