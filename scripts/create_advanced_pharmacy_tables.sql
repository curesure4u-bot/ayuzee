-- ═══════════════════════════════════════════════════════════════════════════════
-- Advanced Pharmacy Modules — Subscriptions, Interactions, Recommendations
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 1. MEDICINE SUBSCRIPTION / AUTO-REFILL PLANS                                │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS medicine_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL DEFAULT 'Monthly Refill',
  medicines JSONB NOT NULL DEFAULT '[]',
  frequency_days INTEGER NOT NULL DEFAULT 30,
  next_delivery_date DATE NOT NULL,
  delivery_address JSONB,
  total_monthly_value INTEGER DEFAULT 0,
  discount_percentage DECIMAL(4,2) DEFAULT 5.00,
  payment_method TEXT DEFAULT 'manual' CHECK (payment_method IN ('manual', 'auto_upi', 'auto_card')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  auto_renew BOOLEAN DEFAULT true,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_delivered_at TIMESTAMPTZ,
  total_deliveries INTEGER DEFAULT 0,
  prescribed_by_doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE medicine_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own subscriptions"
  ON medicine_subscriptions FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = prescribed_by_doctor_id);

CREATE POLICY "Patients can create subscriptions"
  ON medicine_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update own subscriptions"
  ON medicine_subscriptions FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE INDEX IF NOT EXISTS idx_med_subs_patient ON medicine_subscriptions(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_med_subs_next ON medicine_subscriptions(next_delivery_date, status);

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 2. AYURVEDIC DRUG INTERACTIONS DATABASE                                     │
-- └─────────────────────────────────────────────────────────────────────────────┘

CREATE TABLE IF NOT EXISTS ayush_drug_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('contraindicated', 'caution', 'synergistic', 'neutral')),
  severity TEXT DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe')),
  description TEXT NOT NULL,
  recommendation TEXT,
  ayurvedic_reasoning TEXT,
  source TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(drug_a, drug_b)
);

ALTER TABLE ayush_drug_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view interactions"
  ON ayush_drug_interactions FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_drug_interactions_a ON ayush_drug_interactions(drug_a);
CREATE INDEX IF NOT EXISTS idx_drug_interactions_b ON ayush_drug_interactions(drug_b);

-- Seed common interactions
INSERT INTO ayush_drug_interactions (drug_a, drug_b, interaction_type, severity, description, recommendation, ayurvedic_reasoning) VALUES
('Guggulu', 'Warfarin', 'contraindicated', 'severe', 'Guggulu has antiplatelet properties that potentiate Warfarin anticoagulant effect, increasing bleeding risk.', 'Avoid combination. Use Triphala Guggulu at lower potency or substitute with Shallaki.', 'Guggulu has Ushna Virya and Tikshna Guna causing Rakta Dhatu vitiation when combined with blood thinners.'),
('Ashwagandha', 'Thyroid medication', 'caution', 'moderate', 'Ashwagandha may increase thyroid hormone levels, potentially requiring dose adjustment of synthetic thyroid medications.', 'Monitor thyroid levels every 4 weeks if co-administered. Reduce Ashwagandha dose to 250mg.', 'Ashwagandha stimulates Agni at Dhatu level which can enhance thyroid function (Dhatvagni).'),
('Triphala', 'Diabetes medication', 'caution', 'mild', 'Triphala may enhance blood sugar lowering effect. Hypoglycemia risk if combined without monitoring.', 'Monitor blood glucose. May allow gradual reduction of allopathic anti-diabetic dose.', 'Triphala acts on Medas Dhatu and enhances Jatharagni, naturally regulating blood sugar.'),
('Brahmi', 'Sedatives', 'caution', 'moderate', 'Brahmi has mild sedative properties that may enhance effect of CNS depressants.', 'Avoid taking at same time. Separate by 4+ hours. Reduce sedative dose if needed.', 'Brahmi is Medhya (brain tonic) with Sheeta Virya — combined sedation may cause excessive Tamas.'),
('Pippali', 'Pitta Prakriti drugs', 'caution', 'mild', 'Long-term Pippali (>2 weeks) aggravates Pitta in Pitta-dominant patients causing hyperacidity.', 'Use Vardhamana protocol (ascending-descending). Max 10 days for Pitta types.', 'Pippali has Katu Rasa and Ushna Virya — prolonged use vitiates Pitta Dosha.')
ON CONFLICT DO NOTHING;

-- ┌─────────────────────────────────────────────────────────────────────────────┐
-- │ 3. PRESCRIPTION-TO-CART MAPPINGS                                            │
-- └─────────────────────────────────────────────────────────────────────────────┘

-- This uses existing tables: consultation_assessments (prescription field)
-- + products table. No new table needed — just a service function.

-- ═══════════════════════════════════════════════════════════
-- Done! Advanced pharmacy tables created.
-- ═══════════════════════════════════════════════════════════
