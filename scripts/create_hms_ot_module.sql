-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Operation Theater Module Tables
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hms_ot_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'General Surgery',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'cleaning', 'maintenance')),
  current_case TEXT,
  utilization_today INTEGER DEFAULT 0,
  location TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ot_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view OT rooms" ON hms_ot_rooms;
CREATE POLICY "Staff can view OT rooms" ON hms_ot_rooms FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage OT rooms" ON hms_ot_rooms;
CREATE POLICY "Staff can manage OT rooms" ON hms_ot_rooms FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS hms_ot_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ot_room TEXT NOT NULL,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  procedure_name TEXT NOT NULL,
  surgeon_name TEXT,
  anesthetist TEXT,
  nursing_team TEXT,
  scheduled_time TEXT,
  duration TEXT,
  schedule_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'delayed')),
  procedure_type TEXT DEFAULT 'elective' CHECK (procedure_type IN ('elective', 'emergency')),
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ot_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Staff can view OT schedule" ON hms_ot_schedule;
CREATE POLICY "Staff can view OT schedule" ON hms_ot_schedule FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS "Staff can manage OT schedule" ON hms_ot_schedule;
CREATE POLICY "Staff can manage OT schedule" ON hms_ot_schedule FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_ot_schedule_date ON hms_ot_schedule(schedule_date DESC);
CREATE INDEX IF NOT EXISTS idx_ot_schedule_status ON hms_ot_schedule(status);

-- Seed
INSERT INTO hms_ot_rooms (name, room_type, status, current_case, utilization_today)
VALUES
  ('OT-1 (Major)', 'General Surgery', 'in_use', 'Ksharasutra - Fistula', 75),
  ('OT-2 (Minor)', 'Minor Procedures', 'available', '', 40),
  ('OT-3 (Panchakarma Surgical)', 'Ayurveda Para-Surgical', 'cleaning', '', 60),
  ('OT-4 (Emergency)', 'Emergency', 'available', '', 20)
ON CONFLICT DO NOTHING;
