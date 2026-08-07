-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — HR Module Tables
-- Covers: Staff Management, Attendance
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hms_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL DEFAULT 'General',
  phone TEXT,
  email TEXT,
  salary DECIMAL(10,2) DEFAULT 0,
  join_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'probation', 'notice_period')),
  today_attendance TEXT DEFAULT 'present' CHECK (today_attendance IN ('present', 'absent', 'leave', 'half_day', 'holiday')),
  productivity_score INTEGER DEFAULT 80,
  location TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_staff ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view staff list" ON hms_staff;
CREATE POLICY "Staff can view staff list"
  ON hms_staff FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage staff" ON hms_staff;
CREATE POLICY "Staff can manage staff"
  ON hms_staff FOR ALL USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_staff_dept ON hms_staff(department);
CREATE INDEX IF NOT EXISTS idx_staff_active ON hms_staff(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_staff_attendance ON hms_staff(today_attendance);

-- Seed data
INSERT INTO hms_staff (name, role, department, phone, salary, join_date, today_attendance, productivity_score)
VALUES
  ('Dr. Arun Sharma', 'Senior Doctor', 'Ayurveda', '9876543210', 120000, '2023-04-01', 'present', 92),
  ('Dr. Meena Patel', 'Doctor', 'Panchakarma', '9876543211', 85000, '2024-01-15', 'present', 88),
  ('Rajesh K', 'Receptionist', 'Front Office', '9876543212', 25000, '2024-06-01', 'present', 78),
  ('Sunita M', 'Nurse', 'IPD', '9876543213', 35000, '2023-09-01', 'absent', 85),
  ('Vikram R', 'Pharmacist', 'Pharmacy', '9876543214', 40000, '2024-03-01', 'present', 90),
  ('Anita D', 'Lab Technician', 'Laboratory', '9876543215', 30000, '2024-08-01', 'present', 82),
  ('Suresh Therapist', 'Therapist (Senior)', 'Panchakarma', '9876543216', 35000, '2022-01-10', 'present', 95),
  ('Priya Therapist', 'Therapist', 'Panchakarma', '9876543218', 28000, '2023-07-01', 'present', 91),
  ('Mohan P', 'Therapist', 'Panchakarma', '9876543219', 28000, '2024-02-01', 'leave', 75),
  ('Kavita S', 'Admin Manager', 'Administration', '9876543217', 55000, '2022-06-15', 'present', 87)
ON CONFLICT DO NOTHING;
