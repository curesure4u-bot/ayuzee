-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Doctor Module Tables
-- Covers: Consultation Templates (Quick Macros), CDSS Alert Rules,
--         Doctor Revenue Tracking, OPD Queue Metrics
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: CONSULTATION TEMPLATES (Quick Macros for doctors)                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS consultation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  system_of_medicine TEXT DEFAULT 'Ayurveda',
  chief_complaints TEXT,
  examination TEXT,
  prescription TEXT,
  diet TEXT,
  yoga TEXT,
  lifestyle TEXT,
  follow_up_days INTEGER,
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  is_shared BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consultation_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own and shared templates" ON consultation_templates;
CREATE POLICY "Doctors can view own and shared templates"
  ON consultation_templates FOR SELECT
  USING (auth.uid() = doctor_id OR is_shared = true);

DROP POLICY IF EXISTS "Doctors can create own templates" ON consultation_templates;
CREATE POLICY "Doctors can create own templates"
  ON consultation_templates FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can update own templates" ON consultation_templates;
CREATE POLICY "Doctors can update own templates"
  ON consultation_templates FOR UPDATE
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can delete own templates" ON consultation_templates;
CREATE POLICY "Doctors can delete own templates"
  ON consultation_templates FOR DELETE
  USING (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_consult_templates_doctor ON consultation_templates(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consult_templates_condition ON consultation_templates(condition);
CREATE INDEX IF NOT EXISTS idx_consult_templates_shared ON consultation_templates(is_shared) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_consult_templates_usage ON consultation_templates(usage_count DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: CDSS ALERT RULES (Clinical Decision Support)                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS cdss_alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN (
    'Drug-Drug', 'Herb-Drug', 'Allergy', 'Dose', 'Prakriti-based',
    'Contraindication', 'Pregnancy', 'Renal', 'Hepatic', 'Pediatric'
  )),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'info')),
  trigger_drug TEXT,
  trigger_condition TEXT,
  interacting_with TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  evidence_level TEXT DEFAULT 'established' CHECK (evidence_level IN (
    'established', 'probable', 'suspected', 'theoretical'
  )),
  reference_source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cdss_alert_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All authenticated can view active CDSS rules" ON cdss_alert_rules;
CREATE POLICY "All authenticated can view active CDSS rules"
  ON cdss_alert_rules FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

DROP POLICY IF EXISTS "Admins can manage CDSS rules" ON cdss_alert_rules;
CREATE POLICY "Admins can manage CDSS rules"
  ON cdss_alert_rules FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_cdss_rules_category ON cdss_alert_rules(category);
CREATE INDEX IF NOT EXISTS idx_cdss_rules_trigger_drug ON cdss_alert_rules(trigger_drug);
CREATE INDEX IF NOT EXISTS idx_cdss_rules_severity ON cdss_alert_rules(severity);

-- CDSS Alert Log (audit trail of triggered alerts per consultation)
CREATE TABLE IF NOT EXISTS cdss_alert_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES cdss_alert_rules(id) ON DELETE SET NULL,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  consultation_id UUID,
  action TEXT NOT NULL DEFAULT 'shown' CHECK (action IN (
    'shown', 'acknowledged', 'overridden', 'dismissed'
  )),
  override_reason TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cdss_alert_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own alert logs" ON cdss_alert_log;
CREATE POLICY "Doctors can view own alert logs"
  ON cdss_alert_log FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can log alerts" ON cdss_alert_log;
CREATE POLICY "Doctors can log alerts"
  ON cdss_alert_log FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE INDEX IF NOT EXISTS idx_cdss_log_doctor ON cdss_alert_log(doctor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cdss_log_rule ON cdss_alert_log(rule_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: DOCTOR REVENUE TRACKING                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS doctor_revenue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'consultation', 'lab_commission', 'pk_referral', 'pharmacy',
    'incentive', 'procedure', 'franchise', 'teleconsult', 'other'
  )),
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  appointment_id UUID,
  description TEXT,
  payment_status TEXT DEFAULT 'confirmed' CHECK (payment_status IN (
    'pending', 'confirmed', 'paid', 'cancelled'
  )),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_revenue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own revenue" ON doctor_revenue_entries;
CREATE POLICY "Doctors can view own revenue"
  ON doctor_revenue_entries FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "System can insert revenue entries" ON doctor_revenue_entries;
CREATE POLICY "System can insert revenue entries"
  ON doctor_revenue_entries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dr_revenue_doctor_date ON doctor_revenue_entries(doctor_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_dr_revenue_category ON doctor_revenue_entries(category, entry_date);
CREATE INDEX IF NOT EXISTS idx_dr_revenue_date ON doctor_revenue_entries(entry_date DESC);

-- Doctor Payout History
CREATE TABLE IF NOT EXISTS doctor_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payout_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  method TEXT DEFAULT 'bank_transfer' CHECK (method IN (
    'bank_transfer', 'upi', 'cheque', 'cash'
  )),
  status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  reference_number TEXT,
  breakdown JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE doctor_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own payouts" ON doctor_payouts;
CREATE POLICY "Doctors can view own payouts"
  ON doctor_payouts FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "System can manage payouts" ON doctor_payouts;
CREATE POLICY "System can manage payouts"
  ON doctor_payouts FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_dr_payouts_doctor ON doctor_payouts(doctor_id, payout_date DESC);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: OPD QUEUE METRICS                                                 ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS opd_queue_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  token_number TEXT NOT NULL,
  appointment_id UUID,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  consultation_start_time TIMESTAMPTZ,
  consultation_end_time TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN (
    'waiting', 'in_consultation', 'completed', 'no_show', 'cancelled', 'rescheduled'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('emergency', 'high', 'normal', 'low')),
  visit_type TEXT DEFAULT 'walk_in' CHECK (visit_type IN ('appointment', 'walk_in', 'follow_up', 'emergency')),
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE opd_queue_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Doctors can view own queue" ON opd_queue_entries;
CREATE POLICY "Doctors can view own queue"
  ON opd_queue_entries FOR SELECT
  USING (auth.uid() = doctor_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage queue" ON opd_queue_entries;
CREATE POLICY "Staff can manage queue"
  ON opd_queue_entries FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_opd_queue_doctor_date ON opd_queue_entries(doctor_id, queue_date DESC);
CREATE INDEX IF NOT EXISTS idx_opd_queue_status ON opd_queue_entries(status, queue_date);
CREATE INDEX IF NOT EXISTS idx_opd_queue_waiting ON opd_queue_entries(doctor_id, status) WHERE status = 'waiting';

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: HELPER FUNCTIONS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Function: Get doctor revenue summary for a period
CREATE OR REPLACE FUNCTION get_doctor_revenue_summary(
  p_doctor_id UUID,
  p_from DATE,
  p_to DATE
)
RETURNS TABLE (
  category TEXT,
  total_amount DECIMAL(12,2),
  entry_count BIGINT,
  percentage DECIMAL(5,2)
) AS $$
DECLARE
  v_grand_total DECIMAL(12,2);
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO v_grand_total
  FROM doctor_revenue_entries
  WHERE doctor_id = p_doctor_id
    AND entry_date BETWEEN p_from AND p_to
    AND payment_status != 'cancelled';

  RETURN QUERY
  SELECT
    dre.category,
    SUM(dre.amount)::DECIMAL(12,2) as total_amount,
    COUNT(*)::BIGINT as entry_count,
    CASE WHEN v_grand_total > 0
      THEN ROUND((SUM(dre.amount) * 100.0 / v_grand_total), 2)::DECIMAL(5,2)
      ELSE 0::DECIMAL(5,2)
    END as percentage
  FROM doctor_revenue_entries dre
  WHERE dre.doctor_id = p_doctor_id
    AND dre.entry_date BETWEEN p_from AND p_to
    AND dre.payment_status != 'cancelled'
  GROUP BY dre.category
  ORDER BY total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get queue stats for a doctor today
CREATE OR REPLACE FUNCTION get_doctor_queue_stats(p_doctor_id UUID)
RETURNS TABLE (
  queue_depth BIGINT,
  avg_wait_minutes DECIMAL(5,1),
  seen_today BIGINT,
  avg_consultation_minutes DECIMAL(5,1),
  longest_wait_minutes DECIMAL(5,1)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'waiting')::BIGINT as queue_depth,
    COALESCE(AVG(EXTRACT(EPOCH FROM (
      COALESCE(consultation_start_time, NOW()) - check_in_time
    )) / 60) FILTER (WHERE status = 'waiting'), 0)::DECIMAL(5,1) as avg_wait_minutes,
    COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as seen_today,
    COALESCE(AVG(EXTRACT(EPOCH FROM (
      consultation_end_time - consultation_start_time
    )) / 60) FILTER (WHERE status = 'completed' AND consultation_end_time IS NOT NULL), 0)::DECIMAL(5,1) as avg_consultation_minutes,
    COALESCE(MAX(EXTRACT(EPOCH FROM (NOW() - check_in_time)) / 60) FILTER (WHERE status = 'waiting'), 0)::DECIMAL(5,1) as longest_wait_minutes
  FROM opd_queue_entries
  WHERE doctor_id = p_doctor_id
    AND queue_date = CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 6: SEED DATA — Default CDSS Rules (AYUSH-specific)                   ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

INSERT INTO cdss_alert_rules (category, severity, trigger_drug, interacting_with, title, description, recommendation, evidence_level)
VALUES
('Herb-Drug', 'high', 'Guggulu', 'Warfarin',
 'Guggulu + Warfarin = Bleeding Risk',
 'Guggulu has antiplatelet properties that potentiate Warfarin''s anticoagulant effect. Concurrent use increases bleeding risk significantly.',
 'Consider dose reduction of Warfarin or substitute Guggulu with Triphala Guggulu (lower potency).',
 'established'),

('Allergy', 'high', 'Shankha Bhasma', 'Shellfish allergy',
 'Shellfish Allergy — Avoid Shankha Bhasma',
 'Shankha Bhasma (conch shell calcium) may trigger anaphylactic reaction in patients with documented shellfish allergy.',
 'Use Praval Pishti (coral calcium) or Godanti Bhasma as calcium alternatives.',
 'established'),

('Prakriti-based', 'info', NULL, 'Pitta Prakriti',
 'Pitta Prakriti — Reduce Ushna Virya Herbs',
 'Patient''s Prakriti assessment indicates Pitta dominance. Excess Ushna (hot potency) herbs may aggravate Pitta leading to hyperacidity, skin rashes.',
 'Prefer Sheeta Virya alternatives: Shatavari over Ashwagandha, Guduchi over Pippali. Add cooling adjuvants.',
 'probable'),

('Drug-Drug', 'medium', 'Chandraprabha Vati', 'Metformin',
 'Chandraprabha Vati + Metformin — Monitor Glucose',
 'Both agents have hypoglycemic action. Combined use may cause excessive blood sugar lowering.',
 'Monitor fasting glucose weekly. Consider reducing Metformin by 250mg during Ayurvedic course.',
 'probable'),

('Dose', 'medium', 'Rasasindura', NULL,
 'Rasasindura Dose Exceeds Standard',
 'Standard therapeutic dose of Rasasindura is 125mg BD. Higher doses require clinical justification. Contains processed mercury.',
 'Reduce to 125mg BD or provide clinical justification for higher dose. Monitor renal function.',
 'established'),

('Herb-Drug', 'medium', 'Ashwagandha', 'Levothyroxine',
 'Ashwagandha + Thyroid Medication — Monitor TSH',
 'Ashwagandha may increase thyroid hormone production. Combined with Levothyroxine may cause hyperthyroid symptoms.',
 'Monitor TSH every 2 weeks. Consider dose adjustment of Levothyroxine.',
 'probable'),

('Contraindication', 'high', 'Vamana', 'Pregnancy',
 'Vamana Contraindicated in Pregnancy',
 'Therapeutic emesis (Vamana) is absolutely contraindicated during pregnancy due to risk of uterine contractions and miscarriage.',
 'Defer Vamana until post-partum. Use mild Deepana-Pachana only.',
 'established'),

('Herb-Drug', 'high', 'Triphala', 'Digoxin',
 'Triphala + Digoxin — Electrolyte Risk',
 'Triphala''s laxative effect may cause hypokalemia, potentiating Digoxin toxicity (arrhythmias).',
 'Monitor serum potassium. Use non-laxative alternatives or reduce Triphala dose. Consider Avipattikar instead.',
 'established')

ON CONFLICT DO NOTHING;
