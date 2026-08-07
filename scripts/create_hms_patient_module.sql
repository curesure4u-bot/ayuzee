-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Patient Module Tables
-- Covers: Timeline Events, Allergies & Alerts, Treatment Plans,
--         Compliance Scoring, Risk Assessments, Journey Stages
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 1: PATIENT TIMELINE EVENTS                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  event_time TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'visit', 'prescription', 'therapy', 'lab', 'imaging',
    'nadi', 'payment', 'admission', 'discharge', 'procedure',
    'follow_up', 'teleconsult', 'note', 'vital', 'referral'
  )),
  title TEXT NOT NULL,
  detail TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT,
  appointment_id UUID,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_timeline_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view patient timeline" ON patient_timeline_events;
CREATE POLICY "Staff can view patient timeline"
  ON patient_timeline_events FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can create timeline events" ON patient_timeline_events;
CREATE POLICY "Staff can create timeline events"
  ON patient_timeline_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can update timeline events" ON patient_timeline_events;
CREATE POLICY "Staff can update timeline events"
  ON patient_timeline_events FOR UPDATE
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_timeline_patient_date ON patient_timeline_events(patient_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_type ON patient_timeline_events(event_type, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_timeline_doctor ON patient_timeline_events(doctor_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 2: PATIENT ALLERGIES & ALERTS                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_allergies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allergy_type TEXT NOT NULL CHECK (allergy_type IN (
    'drug', 'food', 'environmental', 'herb_drug_interaction',
    'viruddha_ahara', 'contact', 'other'
  )),
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT NOT NULL DEFAULT 'moderate' CHECK (severity IN ('mild', 'moderate', 'severe', 'life_threatening')),
  interacting_with TEXT,
  notes TEXT,
  reported_date DATE,
  reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_allergies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view patient allergies" ON patient_allergies;
CREATE POLICY "Staff can view patient allergies"
  ON patient_allergies FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage patient allergies" ON patient_allergies;
CREATE POLICY "Staff can manage patient allergies"
  ON patient_allergies FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_allergies_patient ON patient_allergies(patient_id);
CREATE INDEX IF NOT EXISTS idx_allergies_type ON patient_allergies(allergy_type);
CREATE INDEX IF NOT EXISTS idx_allergies_severity ON patient_allergies(severity) WHERE severity IN ('severe', 'life_threatening');

-- Patient critical conditions / medical history flags
CREATE TABLE IF NOT EXISTS patient_critical_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  notes TEXT,
  reported_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_critical_conditions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view critical conditions" ON patient_critical_conditions;
CREATE POLICY "Staff can view critical conditions"
  ON patient_critical_conditions FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage critical conditions" ON patient_critical_conditions;
CREATE POLICY "Staff can manage critical conditions"
  ON patient_critical_conditions FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_critical_conditions_patient ON patient_critical_conditions(patient_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 3: PATIENT TREATMENT PLANS                                           ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  doctor_name TEXT,
  title TEXT NOT NULL,
  condition TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  total_days INTEGER NOT NULL DEFAULT 1,
  current_day INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled', 'paused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_treatment_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view treatment plans" ON patient_treatment_plans;
CREATE POLICY "Staff can view treatment plans"
  ON patient_treatment_plans FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage treatment plans" ON patient_treatment_plans;
CREATE POLICY "Staff can manage treatment plans"
  ON patient_treatment_plans FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient ON patient_treatment_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_status ON patient_treatment_plans(status) WHERE status = 'active';

-- Daily plan entries within a treatment plan
CREATE TABLE IF NOT EXISTS patient_treatment_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES patient_treatment_plans(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  phase TEXT NOT NULL,
  activity TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'skipped', 'modified')),
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_treatment_plan_days ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view plan days" ON patient_treatment_plan_days;
CREATE POLICY "Staff can view plan days"
  ON patient_treatment_plan_days FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage plan days" ON patient_treatment_plan_days;
CREATE POLICY "Staff can manage plan days"
  ON patient_treatment_plan_days FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_plan_days_plan ON patient_treatment_plan_days(plan_id, day_number);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 4: PATIENT COMPLIANCE SCORING                                        ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_compliance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  medication_adherence INTEGER DEFAULT 0,
  diet_compliance INTEGER DEFAULT 0,
  yoga_exercise INTEGER DEFAULT 0,
  followup_visits INTEGER DEFAULT 0,
  lifestyle_changes INTEGER DEFAULT 0,
  notes TEXT,
  checked_in_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, score_date)
);

ALTER TABLE patient_compliance_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view compliance scores" ON patient_compliance_scores;
CREATE POLICY "Staff can view compliance scores"
  ON patient_compliance_scores FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage compliance scores" ON patient_compliance_scores;
CREATE POLICY "Staff can manage compliance scores"
  ON patient_compliance_scores FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_compliance_patient_date ON patient_compliance_scores(patient_id, score_date DESC);

-- Patient compliance badges (gamification)
CREATE TABLE IF NOT EXISTS patient_compliance_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  earned BOOLEAN DEFAULT false,
  earned_at TIMESTAMPTZ,
  progress_current INTEGER DEFAULT 0,
  progress_target INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_compliance_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view compliance badges" ON patient_compliance_badges;
CREATE POLICY "Staff can view compliance badges"
  ON patient_compliance_badges FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage compliance badges" ON patient_compliance_badges;
CREATE POLICY "Staff can manage compliance badges"
  ON patient_compliance_badges FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_compliance_badges_patient ON patient_compliance_badges(patient_id);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 5: PATIENT RISK ASSESSMENTS                                          ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
  categories JSONB NOT NULL DEFAULT '[]',
  ai_recommendations JSONB DEFAULT '[]',
  assessed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, assessment_date)
);

ALTER TABLE patient_risk_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view risk assessments" ON patient_risk_assessments;
CREATE POLICY "Staff can view risk assessments"
  ON patient_risk_assessments FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage risk assessments" ON patient_risk_assessments;
CREATE POLICY "Staff can manage risk assessments"
  ON patient_risk_assessments FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_risk_patient_date ON patient_risk_assessments(patient_id, assessment_date DESC);
CREATE INDEX IF NOT EXISTS idx_risk_level ON patient_risk_assessments(risk_level) WHERE risk_level IN ('high', 'critical');

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 6: PATIENT JOURNEY STAGES                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

CREATE TABLE IF NOT EXISTS patient_journey_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_number INTEGER NOT NULL,
  stage_name TEXT NOT NULL,
  ayush_name TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('completed', 'current', 'upcoming', 'skipped')),
  scheduled_date DATE,
  completed_date DATE,
  detail TEXT,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id UUID REFERENCES patient_treatment_plans(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE patient_journey_stages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view journey stages" ON patient_journey_stages;
CREATE POLICY "Staff can view journey stages"
  ON patient_journey_stages FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Staff can manage journey stages" ON patient_journey_stages;
CREATE POLICY "Staff can manage journey stages"
  ON patient_journey_stages FOR ALL
  USING (auth.uid() IS NOT NULL);

CREATE INDEX IF NOT EXISTS idx_journey_patient ON patient_journey_stages(patient_id, stage_number);
CREATE INDEX IF NOT EXISTS idx_journey_status ON patient_journey_stages(status);

-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SECTION 7: HELPER FUNCTIONS                                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- Function: Calculate patient overall compliance from latest scores
CREATE OR REPLACE FUNCTION get_patient_compliance_summary(p_patient_id UUID)
RETURNS TABLE (
  overall_score INTEGER,
  medication_adherence INTEGER,
  diet_compliance INTEGER,
  yoga_exercise INTEGER,
  followup_visits INTEGER,
  lifestyle_changes INTEGER,
  streak_days INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cs.overall_score,
    cs.medication_adherence,
    cs.diet_compliance,
    cs.yoga_exercise,
    cs.followup_visits,
    cs.lifestyle_changes,
    (SELECT COUNT(*)::INTEGER FROM patient_compliance_scores s
     WHERE s.patient_id = p_patient_id
       AND s.score_date >= CURRENT_DATE - 30
       AND s.overall_score >= 70) as streak_days
  FROM patient_compliance_scores cs
  WHERE cs.patient_id = p_patient_id
  ORDER BY cs.score_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get patient allergy count summary
CREATE OR REPLACE FUNCTION get_patient_allergy_summary(p_patient_id UUID)
RETURNS TABLE (
  total_allergies BIGINT,
  severe_count BIGINT,
  drug_count BIGINT,
  food_count BIGINT,
  interaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_allergies,
    COUNT(*) FILTER (WHERE severity IN ('severe', 'life_threatening'))::BIGINT,
    COUNT(*) FILTER (WHERE allergy_type = 'drug')::BIGINT,
    COUNT(*) FILTER (WHERE allergy_type = 'food')::BIGINT,
    COUNT(*) FILTER (WHERE allergy_type = 'herb_drug_interaction')::BIGINT
  FROM patient_allergies
  WHERE patient_id = p_patient_id AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
