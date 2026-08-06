-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — MocDoc-Inspired Feature Enhancements
-- Covers: Patient Merge, Triage, No-Show, Ward Store, E-Purse, Patient Portal,
--         EOD Reports, Security Controls, Enhanced Bridge Integrations
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: PATIENT DUPLICATE MERGE SYSTEM                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1A. Potential Duplicates Detection Queue                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_a_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_b_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  match_criteria JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'confirmed_duplicate', 'not_duplicate', 'merged', 'auto_linked'
  )),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_a_id, patient_b_id)
);

ALTER TABLE patient_duplicate_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view duplicate candidates"
  ON patient_duplicate_candidates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage duplicate candidates"
  ON patient_duplicate_candidates FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dup_candidates_status ON patient_duplicate_candidates(status);
CREATE INDEX IF NOT EXISTS idx_dup_candidates_score ON patient_duplicate_candidates(match_score DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1B. Patient Merge History (audit trail of merges)                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_merge_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merged_patient_id UUID NOT NULL,
  merged_patient_snapshot JSONB NOT NULL DEFAULT '{}',
  records_transferred JSONB DEFAULT '{}',
  merge_reason TEXT,
  performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  rollback_available BOOLEAN DEFAULT true,
  rolled_back_at TIMESTAMPTZ,
  rolled_back_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE patient_merge_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view merge history"
  ON patient_merge_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can create merge records"
  ON patient_merge_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_merge_history_primary ON patient_merge_history(primary_patient_id);
CREATE INDEX IF NOT EXISTS idx_merge_history_merged ON patient_merge_history(merged_patient_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1C. Auto-detect duplicates function                                          │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION detect_patient_duplicates()
RETURNS INTEGER AS $$
DECLARE
  found_count INTEGER := 0;
BEGIN
  -- Match by phone number
  INSERT INTO patient_duplicate_candidates (patient_a_id, patient_b_id, match_score, match_criteria, status)
  SELECT DISTINCT ON (LEAST(a.user_id, b.user_id), GREATEST(a.user_id, b.user_id))
    LEAST(a.user_id, b.user_id),
    GREATEST(a.user_id, b.user_id),
    80.00,
    jsonb_build_object('matched_on', 'phone', 'phone', a.phone),
    'pending'
  FROM profiles a
  JOIN profiles b ON a.phone = b.phone AND a.user_id != b.user_id
  WHERE a.phone IS NOT NULL AND a.phone != ''
  ON CONFLICT (patient_a_id, patient_b_id) DO NOTHING;

  GET DIAGNOSTICS found_count = ROW_COUNT;

  -- Match by name + DOB
  INSERT INTO patient_duplicate_candidates (patient_a_id, patient_b_id, match_score, match_criteria, status)
  SELECT DISTINCT ON (LEAST(a.user_id, b.user_id), GREATEST(a.user_id, b.user_id))
    LEAST(a.user_id, b.user_id),
    GREATEST(a.user_id, b.user_id),
    70.00,
    jsonb_build_object('matched_on', 'name_dob', 'name', a.full_name, 'dob', a.date_of_birth),
    'pending'
  FROM profiles a
  JOIN profiles b ON LOWER(a.full_name) = LOWER(b.full_name)
    AND a.date_of_birth = b.date_of_birth
    AND a.user_id != b.user_id
  WHERE a.full_name IS NOT NULL AND a.date_of_birth IS NOT NULL
  ON CONFLICT (patient_a_id, patient_b_id) DO UPDATE
    SET match_score = GREATEST(patient_duplicate_candidates.match_score, EXCLUDED.match_score);

  RETURN found_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: TRIAGE MANAGEMENT MODULE (NURSING STATION)                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2A. Triage Records (pre-consultation nursing capture)                        │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_triage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID,
  token_number INTEGER,
  opd_queue_id UUID,
  -- Vitals
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  pulse_rate INTEGER,
  temperature DECIMAL(4,1),
  temperature_unit TEXT DEFAULT 'F' CHECK (temperature_unit IN ('F', 'C')),
  respiratory_rate INTEGER,
  spo2 INTEGER,
  weight DECIMAL(5,2),
  height DECIMAL(5,2),
  bmi DECIMAL(5,2),
  blood_sugar_fasting DECIMAL(6,2),
  blood_sugar_pp DECIMAL(6,2),
  blood_sugar_random DECIMAL(6,2),
  -- Chief complaint & history
  chief_complaint TEXT,
  complaint_duration TEXT,
  pain_scale INTEGER CHECK (pain_scale >= 0 AND pain_scale <= 10),
  known_allergies TEXT[],
  current_medications TEXT[],
  medical_history TEXT[],
  -- Ayurveda-specific triage
  prakriti_type TEXT,
  nadi_pareeksha TEXT,
  jihva_observation TEXT,
  -- Status
  triage_priority TEXT DEFAULT 'normal' CHECK (triage_priority IN (
    'emergency', 'urgent', 'normal', 'low'
  )),
  status TEXT DEFAULT 'captured' CHECK (status IN (
    'captured', 'sent_to_doctor', 'consultation_started', 'completed'
  )),
  captured_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  captured_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_triage_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view triage records"
  ON hms_triage_records FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Nurses can create triage records"
  ON hms_triage_records FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can update triage records"
  ON hms_triage_records FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_triage_patient ON hms_triage_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_triage_appointment ON hms_triage_records(appointment_id);
CREATE INDEX IF NOT EXISTS idx_triage_status ON hms_triage_records(status, triage_priority);
CREATE INDEX IF NOT EXISTS idx_triage_date ON hms_triage_records(captured_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2B. Triage Templates (reusable templates for common conditions)              │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_triage_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  department TEXT,
  specialty TEXT,
  default_questions JSONB DEFAULT '[]',
  vital_fields_required TEXT[] DEFAULT ARRAY['blood_pressure_systolic', 'pulse_rate', 'temperature'],
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_triage_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view triage templates"
  ON hms_triage_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage triage templates"
  ON hms_triage_templates FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: NO-SHOW MANAGEMENT ENHANCEMENT                                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3A. No-Show Records & Tracking                                               │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_noshow_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_date DATE NOT NULL,
  original_time_slot TEXT,
  marked_at TIMESTAMPTZ DEFAULT NOW(),
  marked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  auto_marked BOOLEAN DEFAULT false,
  -- Resolution
  resolution TEXT DEFAULT 'unresolved' CHECK (resolution IN (
    'unresolved', 'rescheduled', 'cancelled', 'reverted', 'waived'
  )),
  rescheduled_to_date DATE,
  rescheduled_appointment_id UUID,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_channel TEXT,
  notification_sent_at TIMESTAMPTZ,
  -- Patient scoring
  reliability_impact DECIMAL(3,2) DEFAULT -0.10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_noshow_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view noshow records"
  ON hms_noshow_records FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage noshow records"
  ON hms_noshow_records FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_noshow_patient ON hms_noshow_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_noshow_doctor ON hms_noshow_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_noshow_date ON hms_noshow_records(original_date DESC);
CREATE INDEX IF NOT EXISTS idx_noshow_resolution ON hms_noshow_records(resolution);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3B. Patient Reliability Score                                                │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_reliability_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_appointments INTEGER DEFAULT 0,
  attended_count INTEGER DEFAULT 0,
  noshow_count INTEGER DEFAULT 0,
  cancelled_count INTEGER DEFAULT 0,
  late_arrival_count INTEGER DEFAULT 0,
  reliability_score DECIMAL(5,2) DEFAULT 100.00,
  last_noshow_date DATE,
  streak_attended INTEGER DEFAULT 0,
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_reliability_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view reliability scores"
  ON patient_reliability_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can manage reliability scores"
  ON patient_reliability_scores FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_reliability_score ON patient_reliability_scores(reliability_score);
CREATE INDEX IF NOT EXISTS idx_reliability_risk ON patient_reliability_scores(risk_level);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3C. Auto-mark no-show trigger function                                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE OR REPLACE FUNCTION auto_mark_noshow()
RETURNS INTEGER AS $$
DECLARE
  marked_count INTEGER := 0;
BEGIN
  -- Mark appointments as no-show if not checked in 60 mins after slot time
  INSERT INTO hms_noshow_records (appointment_id, patient_id, doctor_id, original_date, original_time_slot, auto_marked)
  SELECT a.id, a.user_id, a.doctor_id, a.appointment_date::date, a.time_slot, true
  FROM appointments a
  WHERE a.status = 'confirmed'
    AND a.appointment_date < NOW() - INTERVAL '60 minutes'
    AND NOT EXISTS (
      SELECT 1 FROM hms_noshow_records n WHERE n.appointment_id = a.id
    )
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS marked_count = ROW_COUNT;

  -- Update reliability scores
  UPDATE patient_reliability_scores prs
  SET noshow_count = noshow_count + 1,
      reliability_score = GREATEST(0, reliability_score - 10),
      streak_attended = 0,
      last_noshow_date = CURRENT_DATE,
      risk_level = CASE
        WHEN reliability_score - 10 < 50 THEN 'high'
        WHEN reliability_score - 10 < 75 THEN 'medium'
        ELSE 'low'
      END,
      updated_at = NOW()
  FROM hms_noshow_records nr
  WHERE nr.patient_id = prs.patient_id
    AND nr.auto_marked = true
    AND nr.created_at > NOW() - INTERVAL '5 minutes';

  RETURN marked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: WARD-WISE CONSUMABLE STORE MANAGEMENT                             ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4A. Ward Sub-Stores                                                          │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_ward_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID,
  ward_name TEXT NOT NULL,
  department TEXT,
  store_code TEXT UNIQUE,
  location TEXT,
  in_charge_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  parent_store_id UUID,
  store_type TEXT DEFAULT 'ward' CHECK (store_type IN (
    'ward', 'ot', 'icu', 'pharmacy', 'panchakarma', 'lab', 'emergency'
  )),
  auto_reorder BOOLEAN DEFAULT true,
  reorder_threshold_percent INTEGER DEFAULT 20,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ward_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view ward stores"
  ON hms_ward_stores FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage ward stores"
  ON hms_ward_stores FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4B. Ward Stock Items (per-ward inventory)                                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_ward_stock_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_store_id UUID NOT NULL REFERENCES hms_ward_stores(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  product_category TEXT,
  batch_number TEXT,
  expiry_date DATE,
  quantity_available DECIMAL(10,2) DEFAULT 0,
  quantity_unit TEXT DEFAULT 'units',
  min_stock_level DECIMAL(10,2) DEFAULT 5,
  max_stock_level DECIMAL(10,2) DEFAULT 100,
  cost_per_unit DECIMAL(10,2) DEFAULT 0,
  last_restocked_at TIMESTAMPTZ,
  last_consumed_at TIMESTAMPTZ,
  is_critical BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ward_stock_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view ward stock"
  ON hms_ward_stock_items FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage ward stock"
  ON hms_ward_stock_items FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ward_stock_store ON hms_ward_stock_items(ward_store_id);
CREATE INDEX IF NOT EXISTS idx_ward_stock_product ON hms_ward_stock_items(product_id);
CREATE INDEX IF NOT EXISTS idx_ward_stock_expiry ON hms_ward_stock_items(expiry_date);
CREATE INDEX IF NOT EXISTS idx_ward_stock_low ON hms_ward_stock_items(quantity_available)
  WHERE quantity_available <= min_stock_level;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4C. Ward Consumption Log (auto-debit from patient IPD)                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_ward_consumption_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_store_id UUID NOT NULL REFERENCES hms_ward_stores(id) ON DELETE CASCADE,
  ward_stock_item_id UUID NOT NULL REFERENCES hms_ward_stock_items(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_admission_id UUID,
  panchakarma_session_id UUID,
  quantity_consumed DECIMAL(10,2) NOT NULL,
  consumption_type TEXT DEFAULT 'patient_use' CHECK (consumption_type IN (
    'patient_use', 'therapy_use', 'wastage', 'expired', 'returned', 'transfer'
  )),
  billed_to_patient BOOLEAN DEFAULT false,
  bill_amount DECIMAL(10,2),
  consumed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ward_consumption_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view consumption log"
  ON hms_ward_consumption_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can log consumption"
  ON hms_ward_consumption_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_ward_consumption_store ON hms_ward_consumption_log(ward_store_id);
CREATE INDEX IF NOT EXISTS idx_ward_consumption_patient ON hms_ward_consumption_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_ward_consumption_date ON hms_ward_consumption_log(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 4D. Ward Stock Transfer (between stores)                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_ward_stock_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_store_id UUID NOT NULL REFERENCES hms_ward_stores(id) ON DELETE CASCADE,
  to_store_id UUID NOT NULL REFERENCES hms_ward_stores(id) ON DELETE CASCADE,
  product_id UUID,
  product_name TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  batch_number TEXT,
  transfer_reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_transit', 'received', 'rejected')),
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_ward_stock_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view stock transfers"
  ON hms_ward_stock_transfers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage stock transfers"
  ON hms_ward_stock_transfers FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_transfer_from ON hms_ward_stock_transfers(from_store_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_to ON hms_ward_stock_transfers(to_store_id, status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: PATIENT ADVANCE / E-PURSE (HMS-SIDE)                              ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5A. Patient Advance Deposits                                                 │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_patient_advances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_admission_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  payment_mode TEXT NOT NULL CHECK (payment_mode IN (
    'cash', 'card', 'upi', 'netbanking', 'cheque', 'ayuzee_wallet', 'insurance_deposit'
  )),
  transaction_reference TEXT,
  receipt_number TEXT UNIQUE,
  purpose TEXT DEFAULT 'ipd_admission',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'partially_used', 'fully_used', 'refunded')),
  amount_used DECIMAL(12,2) DEFAULT 0,
  amount_refunded DECIMAL(12,2) DEFAULT 0,
  balance DECIMAL(12,2) GENERATED ALWAYS AS (amount - amount_used - amount_refunded) STORED,
  collected_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_patient_advances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view patient advances"
  ON hms_patient_advances FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Cashier can manage advances"
  ON hms_patient_advances FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_patient_advances_patient ON hms_patient_advances(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_advances_status ON hms_patient_advances(status);
CREATE INDEX IF NOT EXISTS idx_patient_advances_admission ON hms_patient_advances(ip_admission_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5B. Advance Utilization Log                                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_advance_utilization_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advance_id UUID NOT NULL REFERENCES hms_patient_advances(id) ON DELETE CASCADE,
  bill_id UUID,
  amount_deducted DECIMAL(12,2) NOT NULL,
  deducted_for TEXT NOT NULL,
  deducted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_advance_utilization_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view utilization log"
  ON hms_advance_utilization_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can log utilization"
  ON hms_advance_utilization_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 5C. Refund Requests (with approval workflow)                                 │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  advance_id UUID REFERENCES hms_patient_advances(id) ON DELETE SET NULL,
  bill_id UUID,
  refund_amount DECIMAL(12,2) NOT NULL,
  refund_reason TEXT NOT NULL,
  refund_mode TEXT CHECK (refund_mode IN (
    'cash', 'bank_transfer', 'upi', 'ayuzee_wallet', 'cheque', 'original_mode'
  )),
  bank_details JSONB DEFAULT '{}',
  status TEXT DEFAULT 'requested' CHECK (status IN (
    'requested', 'approved', 'processing', 'completed', 'rejected'
  )),
  requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  transaction_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_refund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view refund requests"
  ON hms_refund_requests FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage refund requests"
  ON hms_refund_requests FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_refund_patient ON hms_refund_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_refund_status ON hms_refund_requests(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 6: PATIENT SELF-SERVICE PORTAL ENHANCEMENTS                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6A. Patient Health Folders (document upload & organize)                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_health_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder_name TEXT NOT NULL,
  folder_type TEXT DEFAULT 'general' CHECK (folder_type IN (
    'general', 'lab_reports', 'prescriptions', 'imaging', 'discharge_summaries',
    'insurance', 'certificates', 'ayurveda_records', 'panchakarma'
  )),
  description TEXT,
  is_shared_with_doctor BOOLEAN DEFAULT false,
  shared_doctor_ids UUID[] DEFAULT '{}',
  document_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_health_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own folders"
  ON patient_health_folders FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own folders"
  ON patient_health_folders FOR ALL
  USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_health_folders_patient ON patient_health_folders(patient_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6B. Health Folder Documents                                                  │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_health_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES patient_health_folders(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_bytes INTEGER,
  document_date DATE,
  source TEXT DEFAULT 'upload' CHECK (source IN (
    'upload', 'hms_lab', 'hms_prescription', 'hms_discharge', 'hms_imaging', 'ayuzee_order'
  )),
  source_hms_id UUID,
  source_clinic_name TEXT,
  tags TEXT[] DEFAULT '{}',
  ocr_text TEXT,
  ai_summary TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_health_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own documents"
  ON patient_health_documents FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own documents"
  ON patient_health_documents FOR ALL
  USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_health_docs_folder ON patient_health_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_health_docs_patient ON patient_health_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_docs_source ON patient_health_documents(source, source_hms_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 6C. Cross-Clinic Record Access Requests                                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS patient_record_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requesting_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requesting_clinic_id UUID,
  requesting_clinic_name TEXT,
  source_clinic_id UUID,
  source_clinic_name TEXT,
  record_types TEXT[] DEFAULT ARRAY['all'],
  date_range_from DATE,
  date_range_to DATE,
  purpose TEXT,
  consent_given BOOLEAN DEFAULT false,
  consent_given_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'patient_approved', 'clinic_approved', 'shared', 'rejected', 'expired'
  )),
  shared_records JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_record_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own access requests"
  ON patient_record_access_requests FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = requesting_doctor_id);

CREATE POLICY "Patients can manage access requests"
  ON patient_record_access_requests FOR ALL
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_record_access_patient ON patient_record_access_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_record_access_status ON patient_record_access_requests(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 7: EOD AUTO-REPORTS SYSTEM                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 7A. Report Templates                                                         │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_eod_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  name TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN (
    'daily_summary', 'revenue', 'patient_flow', 'stock_alert',
    'appointment_stats', 'no_show_report', 'billing_pending',
    'lab_turnaround', 'pharmacy_sales', 'custom'
  )),
  metrics JSONB DEFAULT '[]',
  include_sections TEXT[] DEFAULT ARRAY['revenue', 'patient_count', 'pending_bills'],
  custom_query TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_eod_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view report templates"
  ON hms_eod_report_templates FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage report templates"
  ON hms_eod_report_templates FOR ALL
  USING (auth.uid() IS NOT NULL);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 7B. Report Schedules & Delivery                                              │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_eod_report_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  template_id UUID NOT NULL REFERENCES hms_eod_report_templates(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_name TEXT,
  delivery_channel TEXT NOT NULL CHECK (delivery_channel IN (
    'email', 'whatsapp', 'sms', 'app_notification', 'all'
  )),
  delivery_email TEXT,
  delivery_phone TEXT,
  schedule_time TIME DEFAULT '20:00',
  schedule_days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri','Sat'],
  timezone TEXT DEFAULT 'Asia/Kolkata',
  include_ayuzee_stats BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  last_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_eod_report_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view schedules"
  ON hms_eod_report_schedules FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admin can manage schedules"
  ON hms_eod_report_schedules FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_eod_schedule_recipient ON hms_eod_report_schedules(recipient_id);
CREATE INDEX IF NOT EXISTS idx_eod_schedule_time ON hms_eod_report_schedules(schedule_time);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 7C. Generated Reports History                                                │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_eod_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES hms_eod_report_schedules(id) ON DELETE SET NULL,
  template_id UUID REFERENCES hms_eod_report_templates(id) ON DELETE SET NULL,
  clinic_id UUID,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  report_data JSONB NOT NULL DEFAULT '{}',
  delivery_status TEXT DEFAULT 'generated' CHECK (delivery_status IN (
    'generated', 'sending', 'delivered', 'failed'
  )),
  delivered_via TEXT,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  -- Summary metrics snapshot
  total_revenue DECIMAL(12,2),
  total_patients INTEGER,
  new_patients INTEGER,
  pending_bills INTEGER,
  no_shows INTEGER,
  ayuzee_bookings INTEGER,
  stock_alerts INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_eod_report_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view report history"
  ON hms_eod_report_history FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert reports"
  ON hms_eod_report_history FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_eod_history_date ON hms_eod_report_history(report_date DESC);
CREATE INDEX IF NOT EXISTS idx_eod_history_clinic ON hms_eod_report_history(clinic_id, report_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 8: SECURITY CONTROLS                                                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 8A. Session Security Configuration                                           │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_security_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- IP Whitelisting
  ip_whitelist_enabled BOOLEAN DEFAULT false,
  whitelisted_ips TEXT[] DEFAULT '{}',
  ip_whitelist_bypass_roles TEXT[] DEFAULT ARRAY['owner'],
  -- Session controls
  auto_logout_enabled BOOLEAN DEFAULT true,
  auto_logout_minutes INTEGER DEFAULT 30,
  max_concurrent_sessions INTEGER DEFAULT 3,
  force_logout_on_ip_change BOOLEAN DEFAULT false,
  -- Phone masking
  phone_masking_enabled BOOLEAN DEFAULT true,
  phone_visible_roles TEXT[] DEFAULT ARRAY['owner', 'doctor'],
  unmask_requires_reason BOOLEAN DEFAULT true,
  max_unmask_per_day INTEGER DEFAULT 10,
  unmask_alert_threshold INTEGER DEFAULT 5,
  -- Password policy
  password_min_length INTEGER DEFAULT 8,
  password_require_special BOOLEAN DEFAULT true,
  password_expiry_days INTEGER DEFAULT 90,
  two_factor_required BOOLEAN DEFAULT false,
  two_factor_roles TEXT[] DEFAULT ARRAY['owner', 'admin'],
  -- Login security
  max_login_attempts INTEGER DEFAULT 5,
  lockout_duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_security_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view security config"
  ON hms_security_config FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can manage security config"
  ON hms_security_config FOR ALL
  USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_security_config_owner ON hms_security_config(owner_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 8B. Phone Number Unmask Audit Log                                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_phone_unmask_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  clinic_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_phone_unmask_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can view unmask logs"
  ON hms_phone_unmask_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can log unmasks"
  ON hms_phone_unmask_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_unmask_user ON hms_phone_unmask_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_unmask_patient ON hms_phone_unmask_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_unmask_date ON hms_phone_unmask_log(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 8C. Login Attempt Tracking                                                   │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  clinic_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view login attempts"
  ON hms_login_attempts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can log attempts"
  ON hms_login_attempts FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON hms_login_attempts(email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON hms_login_attempts(ip_address, created_at DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 9: ENHANCED HMS BRIDGE — NEW INTEGRATION POINTS                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 9A. Lab Report Push to Aggregator                                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS bridge_lab_report_push (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hms_lab_order_id UUID,
  report_title TEXT NOT NULL,
  report_file_url TEXT,
  report_data JSONB DEFAULT '{}',
  doctor_notes TEXT,
  clinic_id UUID,
  clinic_name TEXT,
  push_status TEXT DEFAULT 'pending' CHECK (push_status IN (
    'pending', 'pushed_to_app', 'viewed_by_patient', 'downloaded', 'failed'
  )),
  pushed_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bridge_lab_report_push ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own lab pushes"
  ON bridge_lab_report_push FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "System can manage lab pushes"
  ON bridge_lab_report_push FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_lab_push_patient ON bridge_lab_report_push(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_push_status ON bridge_lab_report_push(push_status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 9B. Cross-Clinic Referral Network                                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS bridge_referral_network (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referring_doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referring_clinic_id UUID,
  referring_clinic_name TEXT,
  referred_to_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referred_to_clinic_id UUID,
  referred_to_clinic_name TEXT,
  referred_to_specialty TEXT,
  referral_reason TEXT NOT NULL,
  clinical_summary TEXT,
  case_notes_shared BOOLEAN DEFAULT false,
  shared_documents UUID[] DEFAULT '{}',
  urgency TEXT DEFAULT 'routine' CHECK (urgency IN ('emergency', 'urgent', 'routine', 'elective')),
  -- Appointment auto-creation
  auto_book_appointment BOOLEAN DEFAULT false,
  booked_appointment_id UUID,
  preferred_date DATE,
  -- Status tracking
  status TEXT DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'accepted', 'appointment_booked', 'consultation_done',
    'feedback_shared', 'rejected', 'expired'
  )),
  referred_doctor_notes TEXT,
  outcome_summary TEXT,
  -- Aggregator integration
  ayuzee_referral_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bridge_referral_network ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved parties can view referrals"
  ON bridge_referral_network FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = referring_doctor_id OR auth.uid() = referred_to_doctor_id);

CREATE POLICY "Doctors can create referrals"
  ON bridge_referral_network FOR INSERT
  WITH CHECK (auth.uid() = referring_doctor_id);

CREATE POLICY "Involved doctors can update"
  ON bridge_referral_network FOR UPDATE
  USING (auth.uid() = referring_doctor_id OR auth.uid() = referred_to_doctor_id);

CREATE INDEX IF NOT EXISTS idx_referral_patient ON bridge_referral_network(patient_id);
CREATE INDEX IF NOT EXISTS idx_referral_from_doctor ON bridge_referral_network(referring_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referral_to_doctor ON bridge_referral_network(referred_to_doctor_id);
CREATE INDEX IF NOT EXISTS idx_referral_status ON bridge_referral_network(status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 9C. Teleconsult → In-Clinic Conversion                                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS bridge_teleconsult_conversion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teleconsult_appointment_id UUID NOT NULL,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  clinic_id UUID,
  clinic_name TEXT,
  -- What was recommended during teleconsult
  recommended_action TEXT NOT NULL CHECK (recommended_action IN (
    'in_clinic_visit', 'panchakarma', 'lab_tests', 'imaging', 'procedure', 'admission'
  )),
  recommendation_notes TEXT,
  -- Auto-created follow-up
  follow_up_appointment_id UUID,
  follow_up_date DATE,
  follow_up_time_slot TEXT,
  -- Case data transfer
  teleconsult_notes TEXT,
  prescription_attached BOOLEAN DEFAULT false,
  attachments JSONB DEFAULT '[]',
  -- Status
  status TEXT DEFAULT 'recommended' CHECK (status IN (
    'recommended', 'patient_accepted', 'appointment_booked', 'visit_completed', 'declined'
  )),
  patient_accepted_at TIMESTAMPTZ,
  visit_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bridge_teleconsult_conversion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved parties can view conversions"
  ON bridge_teleconsult_conversion FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctors can create conversions"
  ON bridge_teleconsult_conversion FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Parties can update conversions"
  ON bridge_teleconsult_conversion FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_teleconvert_patient ON bridge_teleconsult_conversion(patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconvert_status ON bridge_teleconsult_conversion(status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 9D. Insurance Pre-Authorization Bridge                                       │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS bridge_insurance_preauth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID,
  clinic_id UUID,
  clinic_name TEXT,
  -- Insurance details
  insurance_provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  member_id TEXT,
  tpa_name TEXT,
  -- Pre-auth request
  estimated_amount DECIMAL(12,2),
  procedures_planned TEXT[],
  diagnosis_codes TEXT[],
  documents_submitted JSONB DEFAULT '[]',
  -- Status
  status TEXT DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'documents_pending', 'submitted_to_tpa', 'under_review',
    'approved', 'partially_approved', 'rejected', 'expired'
  )),
  approved_amount DECIMAL(12,2),
  approval_reference TEXT,
  rejection_reason TEXT,
  valid_from DATE,
  valid_until DATE,
  -- Triggered from Ayuzee booking
  triggered_from_ayuzee BOOLEAN DEFAULT false,
  ayuzee_booking_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bridge_insurance_preauth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Involved can view preauth"
  ON bridge_insurance_preauth FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage preauth"
  ON bridge_insurance_preauth FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_preauth_patient ON bridge_insurance_preauth(patient_id);
CREATE INDEX IF NOT EXISTS idx_preauth_status ON bridge_insurance_preauth(status);
CREATE INDEX IF NOT EXISTS idx_preauth_appointment ON bridge_insurance_preauth(appointment_id);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 9E. Pharmacy Fulfillment Choice (Clinic pickup vs Ayuzee delivery)           │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS bridge_pharmacy_fulfillment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prescription_id UUID,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID,
  clinic_name TEXT,
  -- Medicines from prescription
  medicines JSONB NOT NULL DEFAULT '[]',
  -- Patient's choice
  fulfillment_mode TEXT NOT NULL CHECK (fulfillment_mode IN (
    'clinic_pharmacy', 'ayuzee_delivery', 'nearest_partner', 'patient_undecided'
  )),
  -- Clinic pharmacy path
  pharmacy_bill_id UUID,
  pharmacy_ready_at TIMESTAMPTZ,
  pharmacy_collected_at TIMESTAMPTZ,
  -- Ayuzee delivery path
  ayuzee_order_id UUID,
  ayuzee_cart_created BOOLEAN DEFAULT false,
  delivery_address JSONB DEFAULT '{}',
  estimated_delivery TEXT,
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'choice_made', 'in_preparation', 'ready', 'dispensed',
    'order_placed', 'delivered', 'partially_available', 'cancelled'
  )),
  unavailable_medicines JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bridge_pharmacy_fulfillment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own fulfillment"
  ON bridge_pharmacy_fulfillment FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id OR auth.uid() IS NOT NULL);

CREATE POLICY "System can manage fulfillment"
  ON bridge_pharmacy_fulfillment FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_pharmacy_fulfill_patient ON bridge_pharmacy_fulfillment(patient_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_fulfill_mode ON bridge_pharmacy_fulfillment(fulfillment_mode);
CREATE INDEX IF NOT EXISTS idx_pharmacy_fulfill_status ON bridge_pharmacy_fulfillment(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ DONE! All MocDoc-inspired features created.                                  ║
-- ║ Tables: 22 new tables + 3 functions                                          ║
-- ║ Sections: Patient Merge, Triage, No-Show, Ward Store, E-Purse,              ║
-- ║           Patient Portal, EOD Reports, Security, Bridge Enhancements         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 10: MICRO-GAP FEATURES — Notification Log & Patient Cards            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 10A. Unified Notification Log (all channels in one place)                    │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT,
  patient_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'app', 'call')),
  notification_type TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  template_id TEXT,
  -- Delivery tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'delivered', 'read', 'failed', 'bounced'
  )),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_reason TEXT,
  -- Meta
  triggered_by TEXT DEFAULT 'system',
  triggered_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trigger_event TEXT,
  clinic_id UUID,
  external_message_id TEXT,
  cost DECIMAL(6,2) DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view notification log"
  ON hms_notification_log FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "System can insert notifications"
  ON hms_notification_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_notif_log_patient ON hms_notification_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_notif_log_channel ON hms_notification_log(channel, status);
CREATE INDEX IF NOT EXISTS idx_notif_log_type ON hms_notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notif_log_date ON hms_notification_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_log_status ON hms_notification_log(status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 10B. Patient Health Cards (visual card with QR for instant check-in)         │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_patient_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  uhid TEXT NOT NULL UNIQUE,
  card_number TEXT UNIQUE,
  qr_code_data TEXT NOT NULL,
  qr_code_url TEXT,
  -- Card details
  patient_name TEXT NOT NULL,
  phone TEXT,
  dob DATE,
  gender TEXT,
  blood_group TEXT,
  allergies TEXT[] DEFAULT '{}',
  emergency_contact TEXT,
  photo_url TEXT,
  prakriti_type TEXT,
  insurance_summary TEXT,
  -- Card lifecycle
  card_status TEXT DEFAULT 'active' CHECK (card_status IN (
    'active', 'expired', 'revoked', 'lost', 'replaced'
  )),
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '5 years',
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  issued_at_clinic UUID,
  last_scanned_at TIMESTAMPTZ,
  last_scanned_clinic TEXT,
  scan_count INTEGER DEFAULT 0,
  -- Delivery
  sent_via_whatsapp BOOLEAN DEFAULT false,
  sent_via_email BOOLEAN DEFAULT false,
  printed BOOLEAN DEFAULT false,
  digital_wallet_added BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_patient_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patient can view own card"
  ON hms_patient_cards FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() IS NOT NULL);

CREATE POLICY "Staff can manage cards"
  ON hms_patient_cards FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_patient_cards_patient ON hms_patient_cards(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_cards_uhid ON hms_patient_cards(uhid);
CREATE INDEX IF NOT EXISTS idx_patient_cards_qr ON hms_patient_cards(qr_code_data);
CREATE INDEX IF NOT EXISTS idx_patient_cards_status ON hms_patient_cards(card_status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 10C. Patient Card Scan Log (track every QR scan for check-in)                │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_patient_card_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID NOT NULL REFERENCES hms_patient_cards(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scanned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  scanned_at_clinic UUID,
  scanned_at_clinic_name TEXT,
  scan_purpose TEXT DEFAULT 'check_in' CHECK (scan_purpose IN (
    'check_in', 'verification', 'pharmacy_pickup', 'lab_report', 'billing'
  )),
  auto_token_generated BOOLEAN DEFAULT false,
  token_number INTEGER,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_patient_card_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view card scans"
  ON hms_patient_card_scans FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can log card scans"
  ON hms_patient_card_scans FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_card_scans_card ON hms_patient_card_scans(card_id);
CREATE INDEX IF NOT EXISTS idx_card_scans_patient ON hms_patient_card_scans(patient_id);
CREATE INDEX IF NOT EXISTS idx_card_scans_date ON hms_patient_card_scans(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 10D. Copayment Calculation Log (audit trail for insurance billing)           │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_copay_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bill_id UUID,
  appointment_id UUID,
  -- Insurance details at time of calculation
  insurance_provider TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  plan_name TEXT,
  coverage_type TEXT,
  copay_percent DECIMAL(5,2),
  pharmacy_copay_percent DECIMAL(5,2),
  -- Amounts
  total_bill_amount DECIMAL(12,2) NOT NULL,
  covered_amount DECIMAL(12,2) NOT NULL,
  non_covered_amount DECIMAL(12,2) DEFAULT 0,
  room_excess DECIMAL(12,2) DEFAULT 0,
  copay_amount DECIMAL(12,2) NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  patient_responsibility DECIMAL(12,2) NOT NULL,
  -- Breakdown
  line_items JSONB DEFAULT '[]',
  -- Status
  status TEXT DEFAULT 'calculated' CHECK (status IN (
    'calculated', 'billed', 'collected', 'claim_submitted', 'claim_settled'
  )),
  calculated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_copay_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view copay calculations"
  ON hms_copay_calculations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Staff can create copay calculations"
  ON hms_copay_calculations FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_copay_patient ON hms_copay_calculations(patient_id);
CREATE INDEX IF NOT EXISTS idx_copay_bill ON hms_copay_calculations(bill_id);
CREATE INDEX IF NOT EXISTS idx_copay_status ON hms_copay_calculations(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 10 COMPLETE: Notification Log, Patient Cards, Card Scans, Copay Log
-- ═══════════════════════════════════════════════════════════════════════════════


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 11: EFFECTIVENESS ENHANCEMENTS                                       ║
-- ║ QR Attendance, PAN Validation, Critical Lab, Estimate Approval, Geo SEO      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 11A. QR Code Staff Attendance with Geolocation                               │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_qr_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_name TEXT,
  role TEXT,
  clinic_id UUID,
  -- Check-in
  check_in_at TIMESTAMPTZ,
  check_in_lat DECIMAL(10,7),
  check_in_lng DECIMAL(10,7),
  check_in_location_valid BOOLEAN DEFAULT false,
  check_in_method TEXT DEFAULT 'qr_scan' CHECK (check_in_method IN ('qr_scan', 'mobile_app', 'manual', 'biometric')),
  -- Check-out
  check_out_at TIMESTAMPTZ,
  check_out_lat DECIMAL(10,7),
  check_out_lng DECIMAL(10,7),
  check_out_location_valid BOOLEAN DEFAULT false,
  -- Computed
  hours_worked INTERVAL,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'late', 'half_day', 'absent', 'on_leave', 'holiday')),
  late_by_minutes INTEGER DEFAULT 0,
  -- QR code used
  qr_code_id TEXT,
  device_info TEXT,
  ip_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_qr_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view own attendance" ON hms_qr_attendance FOR SELECT USING (auth.uid() = staff_id OR auth.uid() IS NOT NULL);
CREATE POLICY "System can manage attendance" ON hms_qr_attendance FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_qr_att_staff ON hms_qr_attendance(staff_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_qr_att_date ON hms_qr_attendance(attendance_date DESC);
CREATE INDEX IF NOT EXISTS idx_qr_att_clinic ON hms_qr_attendance(clinic_id, attendance_date);

-- Geofence configuration per clinic
CREATE TABLE IF NOT EXISTS hms_geofence_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  clinic_name TEXT NOT NULL,
  center_lat DECIMAL(10,7) NOT NULL,
  center_lng DECIMAL(10,7) NOT NULL,
  radius_meters INTEGER DEFAULT 100,
  shift_start_time TIME DEFAULT '09:00',
  late_threshold_minutes INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_geofence_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view geofence" ON hms_geofence_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin can manage geofence" ON hms_geofence_config FOR ALL USING (auth.uid() IS NOT NULL);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 11B. PAN Card Validation Log (Section 269ST Compliance)                      │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_pan_validation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT,
  cash_amount DECIMAL(12,2) NOT NULL,
  pan_number TEXT NOT NULL,
  pan_name TEXT NOT NULL,
  pan_valid BOOLEAN DEFAULT true,
  validated_at TIMESTAMPTZ DEFAULT NOW(),
  validated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id UUID,
  -- Compliance
  section_269st_applicable BOOLEAN DEFAULT true,
  penalty_risk DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_pan_validation_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view PAN log" ON hms_pan_validation_log FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can insert PAN log" ON hms_pan_validation_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_pan_bill ON hms_pan_validation_log(bill_id);
CREATE INDEX IF NOT EXISTS idx_pan_patient ON hms_pan_validation_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_pan_date ON hms_pan_validation_log(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 11C. Critical Lab Results Alerts                                              │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_lab_critical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT,
  test_name TEXT NOT NULL,
  parameter_name TEXT NOT NULL,
  value DECIMAL(12,4) NOT NULL,
  unit TEXT,
  normal_min DECIMAL(12,4),
  normal_max DECIMAL(12,4),
  critical_low DECIMAL(12,4),
  critical_high DECIMAL(12,4),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'abnormal_high', 'abnormal_low')),
  deviation_percent DECIMAL(6,2),
  -- Action tracking
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'doctor_notified', 'action_taken', 'resolved')),
  acknowledged_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  acknowledged_at TIMESTAMPTZ,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_notified_at TIMESTAMPTZ,
  notification_channel TEXT,
  action_notes TEXT,
  resolved_at TIMESTAMPTZ,
  -- Meta
  ward TEXT,
  bed_number TEXT,
  clinic_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_lab_critical_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view critical alerts" ON hms_lab_critical_alerts FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage critical alerts" ON hms_lab_critical_alerts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_lab_critical_status ON hms_lab_critical_alerts(status, severity);
CREATE INDEX IF NOT EXISTS idx_lab_critical_patient ON hms_lab_critical_alerts(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_critical_date ON hms_lab_critical_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lab_critical_doctor ON hms_lab_critical_alerts(doctor_id, status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 11D. Estimate Approval Workflow                                               │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_treatment_estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_number TEXT UNIQUE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  treatment_description TEXT NOT NULL,
  department TEXT,
  -- Line items
  line_items JSONB NOT NULL DEFAULT '[]',
  total_amount DECIMAL(12,2) NOT NULL,
  -- Workflow
  status TEXT DEFAULT 'draft' CHECK (status IN (
    'draft', 'pending_approval', 'approved', 'rejected', 'sent_to_patient', 'accepted_by_patient', 'expired'
  )),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- Approval
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  auto_approved BOOLEAN DEFAULT false,
  auto_approval_threshold DECIMAL(12,2) DEFAULT 50000,
  -- Patient communication
  sent_to_patient_at TIMESTAMPTZ,
  sent_via TEXT,
  patient_response TEXT CHECK (patient_response IN ('accepted', 'negotiating', 'declined', NULL)),
  patient_response_at TIMESTAMPTZ,
  patient_notes TEXT,
  -- Validity
  validity_days INTEGER DEFAULT 7,
  expires_at TIMESTAMPTZ,
  -- Linked bill
  converted_to_bill_id UUID,
  clinic_id UUID,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_treatment_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can view estimates" ON hms_treatment_estimates FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage estimates" ON hms_treatment_estimates FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON hms_treatment_estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_patient ON hms_treatment_estimates(patient_id);
CREATE INDEX IF NOT EXISTS idx_estimates_created_by ON hms_treatment_estimates(created_by);
CREATE INDEX IF NOT EXISTS idx_estimates_date ON hms_treatment_estimates(created_at DESC);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 11E. Geo-Rich SEO Pages (for partner clinics on Ayuzee aggregator)           │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS hms_geo_seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  clinic_name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT DEFAULT 'India',
  slug TEXT UNIQUE NOT NULL,
  -- SEO content
  page_title TEXT NOT NULL,
  meta_description TEXT,
  h1_heading TEXT,
  body_content TEXT,
  keywords TEXT[] DEFAULT '{}',
  -- Schema markup
  schema_markup_enabled BOOLEAN DEFAULT true,
  schema_json JSONB DEFAULT '{}',
  -- Maps
  google_maps_embed TEXT,
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  -- Performance
  google_indexed BOOLEAN DEFAULT false,
  impressions_30d INTEGER DEFAULT 0,
  clicks_30d INTEGER DEFAULT 0,
  avg_position DECIMAL(5,2),
  -- Config
  include_doctor_profiles BOOLEAN DEFAULT true,
  include_services BOOLEAN DEFAULT true,
  include_testimonials BOOLEAN DEFAULT true,
  include_booking_cta BOOLEAN DEFAULT true,
  ai_generated BOOLEAN DEFAULT false,
  generated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hms_geo_seo_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published pages" ON hms_geo_seo_pages FOR SELECT USING (status = 'published' OR auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage pages" ON hms_geo_seo_pages FOR ALL USING (auth.uid() IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON hms_geo_seo_pages(slug);
CREATE INDEX IF NOT EXISTS idx_seo_pages_city ON hms_geo_seo_pages(city, status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_clinic ON hms_geo_seo_pages(clinic_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_status ON hms_geo_seo_pages(status);

-- ═══════════════════════════════════════════════════════════════════════════════
-- SECTION 11 COMPLETE: QR Attendance, PAN Validation, Critical Lab Alerts,
--                      Estimate Approval, Geo SEO Pages
-- Total new tables: 6 (hms_qr_attendance, hms_geofence_config,
--                      hms_pan_validation_log, hms_lab_critical_alerts,
--                      hms_treatment_estimates, hms_geo_seo_pages)
-- ═══════════════════════════════════════════════════════════════════════════════
