-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Patient Registry + OPD Check-in/Visit Management
-- Core operational tables for the Hospital Management System
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. Patient Registry (clinic-side patient records — NOT auth users)
CREATE TABLE IF NOT EXISTS public.hms_op_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT NOT NULL UNIQUE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Personal
  title TEXT DEFAULT 'Mr.',
  first_name TEXT NOT NULL,
  last_name TEXT,
  gender TEXT CHECK (gender IN ('Male','Female','Other')),
  date_of_birth DATE,
  age_years INT,
  age_months INT DEFAULT 0,
  blood_group TEXT,
  -- Contact
  mobile TEXT NOT NULL,
  mobile_verified BOOLEAN DEFAULT false,
  email TEXT,
  -- Address
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  -- Medical
  prakriti TEXT,
  allergies TEXT[],
  chronic_conditions TEXT[],
  current_medications TEXT[],
  -- Clinic
  branch TEXT DEFAULT 'Main Branch',
  registered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  source TEXT DEFAULT 'walk-in',
  referral_code TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  total_visits INT DEFAULT 0,
  last_visit_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_op_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HMS staff can view patients" ON public.hms_op_patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "HMS staff can insert patients" ON public.hms_op_patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "HMS staff can update patients" ON public.hms_op_patients FOR UPDATE TO authenticated USING (true);
GRANT SELECT, INSERT, UPDATE ON public.hms_op_patients TO authenticated;
GRANT ALL ON public.hms_op_patients TO service_role;

CREATE INDEX IF NOT EXISTS idx_hms_patients_pid ON public.hms_op_patients(patient_id);
CREATE INDEX IF NOT EXISTS idx_hms_patients_mobile ON public.hms_op_patients(mobile);
CREATE INDEX IF NOT EXISTS idx_hms_patients_name ON public.hms_op_patients(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_hms_patients_branch ON public.hms_op_patients(branch);

-- 2. OP Visits (Check-in records — one per visit)
CREATE TABLE IF NOT EXISTS public.hms_op_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  op_number SERIAL,
  patient_id UUID NOT NULL REFERENCES public.hms_op_patients(id) ON DELETE CASCADE,
  patient_display_id TEXT NOT NULL,
  -- Visit details
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIMESTAMPTZ DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  -- Doctor & Assignment
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name TEXT,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Token / Queue
  session_token INT DEFAULT 1,
  queue_position INT,
  -- Visit type
  mode_visit TEXT DEFAULT 'Direct' CHECK (mode_visit IN ('Direct','Referral','Follow-up','Emergency','Teleconsult','Camp')),
  purpose TEXT DEFAULT 'Consultation' CHECK (purpose IN ('Consultation','Procedure','Lab','Pharmacy','Follow-up','Emergency','Certificate','Vaccination')),
  referred_by TEXT,
  -- Billing
  consultation_fee DECIMAL(10,2) DEFAULT 0,
  bill_amount DECIMAL(10,2) DEFAULT 0,
  bill_status TEXT DEFAULT 'pending' CHECK (bill_status IN ('pending','paid','partial','waived','insurance')),
  payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash','card','upi','insurance','wallet','credit')),
  -- Status
  status TEXT DEFAULT 'checked_in' CHECK (status IN ('checked_in','in_consultation','completed','checked_out','no_show','cancelled')),
  -- Clinical (brief)
  chief_complaint TEXT,
  vitals_captured BOOLEAN DEFAULT false,
  prescription_given BOOLEAN DEFAULT false,
  -- Meta
  branch TEXT DEFAULT 'Main Branch',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hms_op_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "HMS staff can view visits" ON public.hms_op_visits FOR SELECT TO authenticated USING (true);
CREATE POLICY "HMS staff can insert visits" ON public.hms_op_visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "HMS staff can update visits" ON public.hms_op_visits FOR UPDATE TO authenticated USING (true);
GRANT SELECT, INSERT, UPDATE ON public.hms_op_visits TO authenticated;
GRANT ALL ON public.hms_op_visits TO service_role;

CREATE INDEX IF NOT EXISTS idx_hms_visits_patient ON public.hms_op_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_hms_visits_date ON public.hms_op_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_hms_visits_doctor ON public.hms_op_visits(doctor_id);
CREATE INDEX IF NOT EXISTS idx_hms_visits_status ON public.hms_op_visits(status, visit_date);
CREATE INDEX IF NOT EXISTS idx_hms_visits_branch ON public.hms_op_visits(branch, visit_date);

-- 3. Auto-generate next patient ID function
CREATE OR REPLACE FUNCTION generate_patient_id(prefix TEXT DEFAULT 'AL')
RETURNS TEXT AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM LENGTH(prefix) + 2) AS INT)), 0) + 1
  INTO next_num
  FROM hms_op_patients
  WHERE patient_id LIKE prefix || '-%';
  RETURN prefix || '-' || next_num;
END;
$$ LANGUAGE plpgsql;

-- 4. Auto-generate next token for today
CREATE OR REPLACE FUNCTION next_session_token(p_branch TEXT DEFAULT 'Main Branch', p_doctor_id UUID DEFAULT NULL)
RETURNS INT AS $$
DECLARE
  next_token INT;
BEGIN
  SELECT COALESCE(MAX(session_token), 0) + 1 INTO next_token
  FROM hms_op_visits
  WHERE visit_date = CURRENT_DATE
    AND branch = p_branch
    AND (p_doctor_id IS NULL OR doctor_id = p_doctor_id);
  RETURN next_token;
END;
$$ LANGUAGE plpgsql;
