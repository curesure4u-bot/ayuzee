-- ═══════════════════════════════════════════════════════════════════════════════
-- Patient Experience Tables — Medicine Adherence + Follow-Up Reminders
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. PATIENT PRESCRIBED MEDICINES (active medicines list)                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_prescribed_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'BD',
  time_slots TEXT[] DEFAULT ARRAY['Morning', 'Evening'],
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  prescribed_by TEXT,
  prescribed_by_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  appointment_id UUID,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_prescribed_medicines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own medicines"
  ON patient_prescribed_medicines FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = prescribed_by_doctor_id);

CREATE POLICY "Doctors can prescribe medicines"
  ON patient_prescribed_medicines FOR INSERT
  WITH CHECK (auth.uid() = prescribed_by_doctor_id OR auth.uid() = patient_id);

CREATE POLICY "Patients and doctors can update"
  ON patient_prescribed_medicines FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = prescribed_by_doctor_id);

CREATE INDEX IF NOT EXISTS idx_prescribed_meds_patient ON patient_prescribed_medicines(patient_id, is_active);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. MEDICINE ADHERENCE LOGS (daily checklist entries)                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS medicine_adherence_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL,
  taken BOOLEAN DEFAULT true,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, medicine_id, log_date, time_slot)
);

ALTER TABLE medicine_adherence_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own adherence logs"
  ON medicine_adherence_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can log adherence"
  ON medicine_adherence_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON medicine_adherence_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON medicine_adherence_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_adherence_logs_user ON medicine_adherence_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_adherence_logs_medicine ON medicine_adherence_logs(medicine_id, log_date);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3. FOLLOW-UP REMINDERS (auto-scheduled after consultation)                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID,
  reminder_date DATE NOT NULL,
  reminder_days INTEGER NOT NULL DEFAULT 7,
  reason TEXT DEFAULT 'Follow-up consultation',
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'acknowledged', 'rescheduled', 'cancelled')),
  notification_channel TEXT DEFAULT 'app' CHECK (notification_channel IN ('app', 'whatsapp', 'sms', 'email')),
  sent_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE follow_up_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own reminders"
  ON follow_up_reminders FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "System can create reminders"
  ON follow_up_reminders FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can update reminders"
  ON follow_up_reminders FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_followup_reminders_patient ON follow_up_reminders(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_followup_reminders_date ON follow_up_reminders(reminder_date, status);

-- ═══════════════════════════════════════════════════════════
-- Done! Patient experience tables created.
-- ═══════════════════════════════════════════════════════════
