-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE ↔ AYUSH HMS BRIDGE — Connecting Aggregator to Clinic Management
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. BRIDGE MAPPING TABLE (links Ayuzee entities to HMS entities)              │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS ayuzee_hms_bridge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_type TEXT NOT NULL CHECK (bridge_type IN (
    'appointment', 'patient', 'doctor', 'prescription_order',
    'stock_product', 'lab_report', 'review_feedback', 'treatment_outcome'
  )),
  ayuzee_id UUID NOT NULL,
  hms_id UUID,
  hms_entity_type TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending' CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  sync_direction TEXT DEFAULT 'ayuzee_to_hms' CHECK (sync_direction IN ('ayuzee_to_hms', 'hms_to_ayuzee', 'bidirectional')),
  last_synced_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ayuzee_hms_bridge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view bridge records"
  ON ayuzee_hms_bridge FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage bridge"
  ON ayuzee_hms_bridge FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_bridge_type ON ayuzee_hms_bridge(bridge_type, sync_status);
CREATE INDEX IF NOT EXISTS idx_bridge_ayuzee_id ON ayuzee_hms_bridge(ayuzee_id);
CREATE INDEX IF NOT EXISTS idx_bridge_hms_id ON ayuzee_hms_bridge(hms_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. BRIDGE SYNC LOG (audit trail of all sync operations)                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS ayuzee_hms_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bridge_id UUID REFERENCES ayuzee_hms_bridge(id) ON DELETE SET NULL,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete', 'sync', 'conflict_resolve')),
  source_system TEXT NOT NULL CHECK (source_system IN ('ayuzee', 'hms')),
  target_system TEXT NOT NULL CHECK (target_system IN ('ayuzee', 'hms')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'skipped')),
  error_message TEXT,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ayuzee_hms_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view sync logs"
  ON ayuzee_hms_sync_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert sync logs"
  ON ayuzee_hms_sync_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_sync_log_bridge ON ayuzee_hms_sync_log(bridge_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_entity ON ayuzee_hms_sync_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_sync_log_time ON ayuzee_hms_sync_log(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3. BRIDGE CONFIG (per-clinic settings for what to sync)                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS ayuzee_hms_bridge_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  clinic_name TEXT,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_appointments BOOLEAN DEFAULT true,
  sync_prescriptions BOOLEAN DEFAULT true,
  sync_stock BOOLEAN DEFAULT true,
  sync_lab_reports BOOLEAN DEFAULT true,
  sync_patient_profiles BOOLEAN DEFAULT true,
  sync_reviews BOOLEAN DEFAULT true,
  sync_treatment_outcomes BOOLEAN DEFAULT true,
  auto_queue_online_bookings BOOLEAN DEFAULT true,
  auto_push_prescription_to_shop BOOLEAN DEFAULT true,
  auto_trigger_review_after_visit BOOLEAN DEFAULT true,
  stock_visibility_public BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ayuzee_hms_bridge_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view own bridge config"
  ON ayuzee_hms_bridge_config FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage bridge config"
  ON ayuzee_hms_bridge_config FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_bridge_config_owner ON ayuzee_hms_bridge_config(owner_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4. TRIGGER: Auto-sync Ayuzee appointment → HMS OPD queue                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION bridge_appointment_to_hms()
RETURNS TRIGGER AS $$
BEGIN
  -- When appointment is confirmed on Ayuzee, create bridge record
  IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
    INSERT INTO ayuzee_hms_bridge (bridge_type, ayuzee_id, sync_status, sync_direction, metadata)
    VALUES (
      'appointment',
      NEW.id,
      'pending',
      'ayuzee_to_hms',
      jsonb_build_object(
        'patient_user_id', NEW.user_id,
        'doctor_id', NEW.doctor_id,
        'appointment_date', NEW.appointment_date,
        'time_slot', NEW.time_slot,
        'mode', NEW.mode
      )
    )
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only create trigger if appointments table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
    DROP TRIGGER IF EXISTS on_appointment_confirmed_bridge ON appointments;
    CREATE TRIGGER on_appointment_confirmed_bridge
      AFTER INSERT OR UPDATE ON appointments
      FOR EACH ROW EXECUTE FUNCTION bridge_appointment_to_hms();
  END IF;
END $$;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5. TRIGGER: HMS prescription → Ayuzee order suggestion                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION bridge_prescription_to_ayuzee()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO ayuzee_hms_bridge (bridge_type, ayuzee_id, hms_id, sync_status, sync_direction, metadata)
  VALUES (
    'prescription_order',
    NEW.patient_id,
    NEW.id,
    'pending',
    'hms_to_ayuzee',
    jsonb_build_object(
      'patient_id', NEW.patient_id,
      'doctor_id', NEW.doctor_id,
      'medicines', NEW.medicines
    )
  )
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6. VIEW: Unified patient profile (Ayuzee + HMS combined)                    │
-- │    NOTE: This view depends on appointments, orders, medicine_adherence_logs  │
-- │    Run AFTER those tables exist. If they don't exist yet, skip this block.   │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- Safe version: only uses tables guaranteed to exist (auth.users, bridge)
-- If 'profiles' table doesn't exist, create a minimal version first:
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  date_of_birth TEXT,
  gender TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE VIEW unified_patient_view AS
SELECT
  u.id AS user_id,
  COALESCE(p.full_name, u.email) AS name,
  p.phone,
  p.date_of_birth,
  p.gender,
  p.city,
  EXISTS(SELECT 1 FROM ayuzee_hms_bridge b WHERE b.ayuzee_id = u.id AND b.bridge_type = 'patient') AS has_hms_record,
  (SELECT COUNT(*) FROM ayuzee_hms_bridge b WHERE b.ayuzee_id = u.id) AS bridge_records_count
FROM auth.users u
LEFT JOIN profiles p ON p.user_id = u.id;

-- ═══════════════════════════════════════════════════════════
-- Done! Ayuzee ↔ AYUSH HMS bridge infrastructure created.
-- Tables: ayuzee_hms_bridge, ayuzee_hms_sync_log, ayuzee_hms_bridge_config
-- Triggers: appointment confirmation auto-bridge
-- Views: unified_patient_view
-- ═══════════════════════════════════════════════════════════
