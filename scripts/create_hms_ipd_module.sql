-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — IPD Module Tables
-- Covers: Wards, Beds, Admissions
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: WARDS                                                             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ward_code TEXT UNIQUE,
  total_beds INTEGER NOT NULL DEFAULT 10,
  occupied_beds INTEGER DEFAULT 0,
  ward_type TEXT DEFAULT 'general' CHECK (ward_type IN (
    'general', 'private', 'semi_private', 'icu', 'nicu', 'maternity', 'pediatric', 'isolation', 'panchakarma'
  )),
  floor TEXT,
  location TEXT DEFAULT 'all',
  charge_per_day DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_wards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view wards" ON hms_wards;
CREATE POLICY "Staff can view wards"
  ON hms_wards FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage wards" ON hms_wards;
CREATE POLICY "Staff can manage wards"
  ON hms_wards FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_wards_active ON hms_wards(is_active) WHERE is_active = true;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: ADMISSIONS                                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS hms_ip_admissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  ward_id UUID REFERENCES hms_wards(id) ON DELETE SET NULL,
  ward_name TEXT,
  bed_number TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT,
  admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
  admission_time TEXT,
  expected_discharge DATE,
  actual_discharge_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN (
    'active', 'critical', 'stable', 'recovering', 'discharge_pending', 'discharged', 'transferred', 'absconded', 'expired'
  )),
  diagnosis TEXT,
  admission_type TEXT DEFAULT 'elective' CHECK (admission_type IN ('emergency', 'elective', 'transfer', 'referral')),
  total_charges DECIMAL(12,2) DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  insurance_id TEXT,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ip_admissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view admissions" ON hms_ip_admissions;
CREATE POLICY "Staff can view admissions"
  ON hms_ip_admissions FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage admissions" ON hms_ip_admissions;
CREATE POLICY "Staff can manage admissions"
  ON hms_ip_admissions FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_admissions_status ON hms_ip_admissions(status) WHERE status NOT IN ('discharged', 'expired');
CREATE INDEX IF NOT EXISTS idx_admissions_ward ON hms_ip_admissions(ward_id, status);
CREATE INDEX IF NOT EXISTS idx_admissions_patient ON hms_ip_admissions(patient_id);
CREATE INDEX IF NOT EXISTS idx_admissions_date ON hms_ip_admissions(admission_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: SEED DATA                                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO hms_wards (name, ward_code, total_beds, occupied_beds, ward_type, charge_per_day)
VALUES
  ('General Male', 'GM', 20, 12, 'general', 800),
  ('General Female', 'GF', 20, 15, 'general', 800),
  ('Private Rooms', 'PVT', 10, 7, 'private', 2500),
  ('ICU', 'ICU', 6, 4, 'icu', 5000),
  ('Pediatric', 'PED', 8, 3, 'pediatric', 1200),
  ('Maternity', 'MAT', 10, 6, 'maternity', 1500),
  ('Panchakarma Ward', 'PKW', 12, 8, 'panchakarma', 1800)
ON CONFLICT (ward_code) DO NOTHING;
