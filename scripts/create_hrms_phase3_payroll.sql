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
