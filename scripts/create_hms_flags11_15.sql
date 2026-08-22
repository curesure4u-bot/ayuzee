-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Flags 11-15: HRMS Attendance, WhatsApp, AI Scribe, Queue, Insurance
-- Run in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 11: HRMS Attendance & Payroll                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- hms_staff already exists from create_hms_hr_module.sql — add missing columns
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS employee_id TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS first_name TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS last_name TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS designation TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS joining_date DATE; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS basic_salary DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS hra DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS other_allowances DECIMAL(10,2) DEFAULT 0; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_staff ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Main Branch'; EXCEPTION WHEN others THEN NULL; END $$;

-- Backfill employee_id for existing rows
UPDATE public.hms_staff SET employee_id = 'EMP-' || LPAD(id::TEXT, 4, '0') WHERE employee_id IS NULL;
-- Backfill first_name from name
UPDATE public.hms_staff SET first_name = COALESCE(name, 'Staff') WHERE first_name IS NULL;

ALTER TABLE public.hms_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view employees" ON public.hms_staff;
CREATE POLICY "Staff can view employees" ON public.hms_staff FOR ALL TO authenticated USING (true);

-- Daily attendance
CREATE TABLE IF NOT EXISTS public.hms_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID,
  employee_id TEXT,
  employee_name TEXT DEFAULT '',
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  total_hours DECIMAL(4,2),
  status TEXT DEFAULT 'present',
  late_by_min INT DEFAULT 0,
  overtime_min INT DEFAULT 0,
  leave_type TEXT,
  marked_by TEXT DEFAULT 'system',
  notes TEXT,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns if table already existed
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS employee_id TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS employee_name TEXT DEFAULT ''; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS total_hours DECIMAL(4,2); EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS late_by_min INT DEFAULT 0; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS overtime_min INT DEFAULT 0; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS marked_by TEXT DEFAULT 'system'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_attendance ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Main Branch'; EXCEPTION WHEN others THEN NULL; END $$;

ALTER TABLE public.hms_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage attendance" ON public.hms_attendance;
CREATE POLICY "Staff can manage attendance" ON public.hms_attendance FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.hms_attendance(attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_staff ON public.hms_attendance(staff_id, attendance_date);

-- Payroll runs
CREATE TABLE IF NOT EXISTS public.hms_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID,
  employee_id TEXT,
  employee_name TEXT NOT NULL DEFAULT '',
  -- Period
  pay_month INT NOT NULL,
  pay_year INT NOT NULL,
  -- Days
  total_days INT DEFAULT 30,
  present_days INT DEFAULT 0,
  leave_days INT DEFAULT 0,
  absent_days INT DEFAULT 0,
  -- Earnings
  basic DECIMAL(10,2) DEFAULT 0,
  hra DECIMAL(10,2) DEFAULT 0,
  allowances DECIMAL(10,2) DEFAULT 0,
  overtime_pay DECIMAL(10,2) DEFAULT 0,
  incentive DECIMAL(10,2) DEFAULT 0,
  gross_salary DECIMAL(10,2) DEFAULT 0,
  -- Deductions
  pf_employee DECIMAL(10,2) DEFAULT 0,
  esi_employee DECIMAL(10,2) DEFAULT 0,
  tds DECIMAL(10,2) DEFAULT 0,
  advance_deduction DECIMAL(10,2) DEFAULT 0,
  other_deductions DECIMAL(10,2) DEFAULT 0,
  total_deductions DECIMAL(10,2) DEFAULT 0,
  -- Net
  net_salary DECIMAL(10,2) DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','processed','paid','hold')),
  paid_date DATE,
  payment_mode TEXT,
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(staff_id, pay_month, pay_year)
);

ALTER TABLE public.hms_payroll ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage payroll" ON public.hms_payroll;
CREATE POLICY "Staff can manage payroll" ON public.hms_payroll FOR ALL TO authenticated USING (true);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 12: WhatsApp Notification Log                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- hms_notification_log already exists from create_hms_mocdoc_features.sql — add missing columns
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS recipient_phone TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS recipient_name TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'transactional'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS body TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS template_name TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS reference_id UUID; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS reference_type TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS wa_message_id TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS error_message TEXT; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS branch TEXT DEFAULT 'Main Branch'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.hms_notification_log ADD COLUMN IF NOT EXISTS created_by UUID; EXCEPTION WHEN others THEN NULL; END $$;

-- Backfill recipient_phone from patient_phone
UPDATE public.hms_notification_log SET recipient_phone = patient_phone WHERE recipient_phone IS NULL AND patient_phone IS NOT NULL;

ALTER TABLE public.hms_notification_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage notifications" ON public.hms_notification_log;
CREATE POLICY "Staff can manage notifications" ON public.hms_notification_log FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_notif_log_phone ON public.hms_notification_log(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_notif_log_status ON public.hms_notification_log(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_trigger ON public.hms_notification_log(trigger_event);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 13: AI Scribe Sessions                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS public.hms_ai_scribe_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES public.hms_op_patients(id) ON DELETE SET NULL,
  doctor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Session
  session_start TIMESTAMPTZ DEFAULT now(),
  session_end TIMESTAMPTZ,
  duration_seconds INT,
  -- Input
  audio_url TEXT,
  transcript TEXT,
  language TEXT DEFAULT 'en',
  -- AI Output
  generated_subjective TEXT,
  generated_objective TEXT,
  generated_assessment TEXT,
  generated_plan TEXT,
  generated_prescription JSONB,
  -- Doctor Review
  doctor_accepted BOOLEAN DEFAULT false,
  doctor_edited BOOLEAN DEFAULT false,
  final_note_id UUID REFERENCES public.hms_clinical_notes(id) ON DELETE SET NULL,
  -- Quality
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  -- Meta
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording','processing','generated','accepted','rejected')),
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_ai_scribe_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage ai scribe" ON public.hms_ai_scribe_sessions;
CREATE POLICY "Staff can manage ai scribe" ON public.hms_ai_scribe_sessions FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_ai_scribe_doctor ON public.hms_ai_scribe_sessions(doctor_user_id);
CREATE INDEX IF NOT EXISTS idx_ai_scribe_visit ON public.hms_ai_scribe_sessions(visit_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 14: Queue Display & Token System (enhanced)                             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Queue display configuration per department/doctor
CREATE TABLE IF NOT EXISTS public.hms_queue_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL, -- "Dr. Mohamad Saleem - Ayurveda"
  doctor_name TEXT,
  department TEXT,
  prefix TEXT DEFAULT 'T', -- token prefix: T-001, AYU-001
  counter_number INT DEFAULT 1,
  -- Display settings
  show_patient_name BOOLEAN DEFAULT true,
  show_department BOOLEAN DEFAULT true,
  announce_audio BOOLEAN DEFAULT false,
  -- Status
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_queue_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage queue config" ON public.hms_queue_config;
CREATE POLICY "Staff can manage queue config" ON public.hms_queue_config FOR ALL TO authenticated USING (true);

-- Live token display state (current serving, next, waiting count)
CREATE TABLE IF NOT EXISTS public.hms_queue_display_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES public.hms_queue_config(id) ON DELETE CASCADE,
  -- Current state
  current_token INT DEFAULT 0,
  current_patient_name TEXT,
  next_token INT,
  total_waiting INT DEFAULT 0,
  total_served INT DEFAULT 0,
  avg_wait_min INT DEFAULT 10,
  -- Time
  last_called_at TIMESTAMPTZ,
  -- Meta
  display_date DATE DEFAULT CURRENT_DATE,
  branch TEXT DEFAULT 'Main Branch',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(config_id, display_date)
);

ALTER TABLE public.hms_queue_display_state ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage queue state" ON public.hms_queue_display_state;
CREATE POLICY "Staff can manage queue state" ON public.hms_queue_display_state FOR ALL TO authenticated USING (true);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ FLAG 15: Insurance / TPA Claims                                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Insurance companies master
CREATE TABLE IF NOT EXISTS public.hms_insurance_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  short_name TEXT,
  tpa_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  empanelment_number TEXT,
  is_active BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'Main Branch',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_insurance_companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage insurance companies" ON public.hms_insurance_companies;
CREATE POLICY "Staff can manage insurance companies" ON public.hms_insurance_companies FOR ALL TO authenticated USING (true);

-- Patient insurance details
CREATE TABLE IF NOT EXISTS public.hms_patient_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  insurance_company_id UUID REFERENCES public.hms_insurance_companies(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  card_number TEXT,
  member_id TEXT,
  valid_from DATE,
  valid_to DATE,
  sum_insured DECIMAL(12,2),
  relation TEXT DEFAULT 'self' CHECK (relation IN ('self','spouse','child','parent','other')),
  card_photo_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_patient_insurance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage patient insurance" ON public.hms_patient_insurance;
CREATE POLICY "Staff can manage patient insurance" ON public.hms_patient_insurance FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_patient_insurance_patient ON public.hms_patient_insurance(patient_id);

-- Insurance claims
CREATE TABLE IF NOT EXISTS public.hms_insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number TEXT NOT NULL UNIQUE,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  insurance_id UUID REFERENCES public.hms_patient_insurance(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  policy_number TEXT,
  -- Admission / Visit
  admission_id UUID REFERENCES public.hms_ip_admissions(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES public.hms_op_visits(id) ON DELETE SET NULL,
  -- Pre-auth
  preauth_number TEXT,
  preauth_amount DECIMAL(12,2),
  preauth_status TEXT DEFAULT 'not_required' CHECK (preauth_status IN ('not_required','pending','approved','rejected','enhanced')),
  preauth_date DATE,
  -- Claim
  claim_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  approved_amount DECIMAL(12,2),
  settled_amount DECIMAL(12,2),
  patient_copay DECIMAL(12,2) DEFAULT 0,
  deduction_amount DECIMAL(12,2) DEFAULT 0,
  deduction_reason TEXT,
  -- Diagnosis & Treatment
  primary_diagnosis TEXT,
  icd_code TEXT,
  treatment_summary TEXT,
  admission_date DATE,
  discharge_date DATE,
  -- Documents
  documents JSONB DEFAULT '[]', -- [{name, url, type}]
  -- Status workflow
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft','preauth_pending','preauth_approved','submitted','under_review','query_raised','approved','rejected','settled','closed')),
  -- Dates
  submitted_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ,
  -- Query
  query_text TEXT,
  query_response TEXT,
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_insurance_claims ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can manage claims" ON public.hms_insurance_claims;
CREATE POLICY "Staff can manage claims" ON public.hms_insurance_claims FOR ALL TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_claims_patient ON public.hms_insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.hms_insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_claims_company ON public.hms_insurance_claims(company_name);
CREATE INDEX IF NOT EXISTS idx_claims_number ON public.hms_insurance_claims(claim_number);

-- Auto-generate claim number
CREATE OR REPLACE FUNCTION generate_claim_number()
RETURNS TEXT AS $$
DECLARE next_num INT; prefix TEXT;
BEGIN
  prefix := 'CLM-' || TO_CHAR(CURRENT_DATE, 'YYMM') || '-';
  SELECT COALESCE(MAX(CAST(SUBSTRING(claim_number FROM LENGTH(prefix) + 1) AS INT)), 0) + 1
  INTO next_num FROM hms_insurance_claims WHERE claim_number LIKE prefix || '%';
  RETURN prefix || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ Enable Realtime                                                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_queue_display_state;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_attendance;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;

DO $$ BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.hms_notification_log;
EXCEPTION WHEN duplicate_object THEN NULL; WHEN others THEN NULL; END $$;
