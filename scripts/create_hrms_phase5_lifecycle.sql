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
