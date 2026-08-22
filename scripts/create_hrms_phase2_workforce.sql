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
