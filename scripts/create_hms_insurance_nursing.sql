-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Insurance Claims + Nursing Module Tables
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: INSURANCE CLAIMS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  policy_no TEXT NOT NULL,
  insurer TEXT NOT NULL,
  claim_type TEXT DEFAULT 'cashless' CHECK (claim_type IN ('cashless', 'reimbursement')),
  claim_amount DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2) DEFAULT 0,
  submitted_date DATE,
  approved_date DATE,
  settled_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'submitted', 'under_review', 'approved', 'rejected', 'settled', 'appealed'
  )),
  rejection_reason TEXT,
  documents JSONB DEFAULT '[]',
  admission_id UUID,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_insurance_claims ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view insurance claims" ON hms_insurance_claims;
CREATE POLICY "Staff can view insurance claims"
  ON hms_insurance_claims FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage insurance claims" ON hms_insurance_claims;
CREATE POLICY "Staff can manage insurance claims"
  ON hms_insurance_claims FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_insurance_status ON hms_insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_patient ON hms_insurance_claims(patient_id);
CREATE INDEX IF NOT EXISTS idx_insurance_date ON hms_insurance_claims(submitted_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: NURSING TASKS / MAR (Medication Administration Record)            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_nursing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_id UUID REFERENCES hms_ip_admissions(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  ward TEXT,
  bed TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN (
    'medication', 'vitals', 'dressing', 'injection', 'feeding',
    'positioning', 'hygiene', 'observation', 'discharge_prep', 'other'
  )),
  description TEXT NOT NULL,
  scheduled_time TIMESTAMPTZ,
  completed_time TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'overdue')),
  assigned_nurse TEXT,
  nurse_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  vital_bp TEXT,
  vital_pulse TEXT,
  vital_temp TEXT,
  vital_spo2 TEXT,
  vital_rr TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_nursing_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view nursing tasks" ON hms_nursing_tasks;
CREATE POLICY "Staff can view nursing tasks"
  ON hms_nursing_tasks FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage nursing tasks" ON hms_nursing_tasks;
CREATE POLICY "Staff can manage nursing tasks"
  ON hms_nursing_tasks FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_nursing_admission ON hms_nursing_tasks(admission_id);
CREATE INDEX IF NOT EXISTS idx_nursing_status ON hms_nursing_tasks(status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_nursing_nurse ON hms_nursing_tasks(nurse_id, status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SEED DATA — Sample Insurance Claims                                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO hms_insurance_claims (patient_name, policy_no, insurer, claim_type, claim_amount, approved_amount, submitted_date, status)
VALUES
  ('Ramesh Kumar', 'HI-2025-78934', 'Star Health', 'cashless', 45000, 42000, '2026-07-05', 'approved'),
  ('Lakshmi Devi', 'NI-2026-12345', 'National Insurance', 'cashless', 28000, 0, '2026-07-12', 'under_review'),
  ('Sunil Menon', 'AY-2025-56789', 'Ayushman Bharat', 'cashless', 65000, 65000, '2026-06-28', 'settled'),
  ('Meera Nair', 'NHI-2026-44556', 'New India Assurance', 'reimbursement', 35000, 0, '2026-07-14', 'submitted'),
  ('Anand Sharma', 'IC-2025-99887', 'ICICI Lombard', 'cashless', 52000, 0, '2026-07-10', 'rejected')
ON CONFLICT DO NOTHING;
