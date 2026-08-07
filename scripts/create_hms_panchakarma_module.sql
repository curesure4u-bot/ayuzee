-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Panchakarma Module Tables
-- Covers: Therapy Package Templates, Therapy Sessions, Patient Package Enrollments
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: THERAPY PACKAGE TEMPLATES                                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS pk_therapy_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_days INTEGER NOT NULL DEFAULT 7,
  duration_label TEXT NOT NULL DEFAULT '7 days',
  therapies JSONB NOT NULL DEFAULT '[]',
  sessions_per_day INTEGER DEFAULT 2,
  total_sessions INTEGER NOT NULL DEFAULT 14,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  indications TEXT,
  contraindications TEXT,
  pre_care_instructions TEXT,
  post_care_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pk_therapy_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view therapy packages" ON pk_therapy_packages;
CREATE POLICY "Staff can view therapy packages"
  ON pk_therapy_packages FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage therapy packages" ON pk_therapy_packages;
CREATE POLICY "Staff can manage therapy packages"
  ON pk_therapy_packages FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_pk_packages_active ON pk_therapy_packages(is_active) WHERE is_active = true;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: PATIENT PACKAGE ENROLLMENTS (active treatment courses)            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS pk_patient_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  package_id UUID REFERENCES pk_therapy_packages(id) ON DELETE SET NULL,
  package_name TEXT NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT,
  total_sessions INTEGER NOT NULL DEFAULT 14,
  completed_sessions INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  amount_total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  location TEXT DEFAULT 'all',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pk_patient_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view patient packages" ON pk_patient_packages;
CREATE POLICY "Staff can view patient packages"
  ON pk_patient_packages FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage patient packages" ON pk_patient_packages;
CREATE POLICY "Staff can manage patient packages"
  ON pk_patient_packages FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_pk_patient_packages_patient ON pk_patient_packages(patient_id);
CREATE INDEX IF NOT EXISTS idx_pk_patient_packages_status ON pk_patient_packages(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pk_patient_packages_date ON pk_patient_packages(start_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: THERAPY SESSIONS (daily scheduled sessions)                       ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS pk_therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  patient_package_id UUID REFERENCES pk_patient_packages(id) ON DELETE SET NULL,
  therapy_name TEXT NOT NULL,
  therapist_name TEXT,
  therapist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room TEXT,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT,
  duration_minutes INTEGER DEFAULT 45,
  status TEXT DEFAULT 'scheduled' CHECK (status IN (
    'scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'
  )),
  -- Materials tracking
  oil_used TEXT,
  oil_quantity TEXT,
  materials JSONB DEFAULT '[]',
  -- Clinical notes
  vitals_bp TEXT,
  vitals_pulse TEXT,
  reaction_notes TEXT,
  therapist_notes TEXT,
  doctor_notes TEXT,
  -- Checklist
  checklist JSONB DEFAULT '[]',
  -- Meta
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  location TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pk_therapy_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view therapy sessions" ON pk_therapy_sessions;
CREATE POLICY "Staff can view therapy sessions"
  ON pk_therapy_sessions FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage therapy sessions" ON pk_therapy_sessions;
CREATE POLICY "Staff can manage therapy sessions"
  ON pk_therapy_sessions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_pk_sessions_date ON pk_therapy_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_patient ON pk_therapy_sessions(patient_id, session_date);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_status ON pk_therapy_sessions(status, session_date);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_therapist ON pk_therapy_sessions(therapist_id, session_date);
CREATE INDEX IF NOT EXISTS idx_pk_sessions_package ON pk_therapy_sessions(patient_package_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: SEED DATA — Default Packages                                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO pk_therapy_packages (name, duration_days, duration_label, therapies, sessions_per_day, total_sessions, price, description)
VALUES
  ('7-day Rejuvenation', 7, '7 days',
   '["Abhyanga", "Shirodhara", "Steam Bath"]'::jsonb,
   2, 14, 28000,
   'Basic rejuvenation with full body oil massage and Shirodhara for stress relief.'),

  ('14-day Full Panchakarma', 14, '14 days',
   '["Snehapana", "Abhyanga", "Swedana", "Vamana", "Virechana", "Vasti", "Nasya"]'::jsonb,
   3, 42, 85000,
   'Complete Panchakarma detoxification program with all 5 procedures. Includes pre & post care.'),

  ('21-day Spine Care', 21, '21 days',
   '["Kativasti", "Abhyanga", "Pizhichil", "Elakizhi", "Greevavasti"]'::jsonb,
   2, 42, 65000,
   'Comprehensive spine care for disc problems, spondylosis and back pain management.'),

  ('7-day Weight Management', 7, '7 days',
   '["Udwarthanam", "Steam Bath", "Virechana", "Lekhana Vasti"]'::jsonb,
   2, 14, 22000,
   'Ayurvedic weight management with dry powder massage and detox protocols.'),

  ('14-day Arthritis Care', 14, '14 days',
   '["Abhyanga", "Elakizhi", "Podikizhi", "Januvasti", "Pizhichil"]'::jsonb,
   2, 28, 55000,
   'Specialized program for joint pain, arthritis and musculoskeletal conditions.'),

  ('10-day Skin & Beauty', 10, '10 days',
   '["Abhyanga", "Lepanam", "Takradhara", "Virechana", "Mukhalepam"]'::jsonb,
   2, 20, 35000,
   'Ayurvedic beauty care for skin rejuvenation, psoriasis and dermatological conditions.')
ON CONFLICT DO NOTHING;
