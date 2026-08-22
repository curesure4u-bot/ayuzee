-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 4: Performance & Training Tables                        ║
-- ║                                                                              ║
-- ║  Creates: KPI Templates, KPI Assignments, Employee KPIs,                     ║
-- ║           Performance Reviews, Trainings, Employee Training                  ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses IF NOT EXISTS. Does NOT drop existing tables.             ║
-- ║  DEPENDS ON: Phase 1 (hms_staff, hrms_organisations, hrms_departments)       ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. KPI TEMPLATES (Role-specific KPI definitions)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_kpi_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'clinical', 'operational', 'financial', 'patient_care', 'compliance',
    'attendance', 'teamwork', 'learning', 'general'
  )),
  
  -- Who this KPI applies to
  applicable_roles TEXT[] DEFAULT '{}',
  applicable_departments TEXT[] DEFAULT '{}',
  applicable_designations TEXT[] DEFAULT '{}',
  
  -- Measurement
  metric_type TEXT NOT NULL DEFAULT 'number' CHECK (metric_type IN (
    'number', 'percentage', 'rating', 'boolean', 'currency'
  )),
  unit TEXT,                           -- e.g. "patients", "procedures", "%", "₹"
  target_value DECIMAL(10,2),          -- monthly target
  max_value DECIMAL(10,2),
  weightage DECIMAL(5,2) DEFAULT 10,   -- % weight in overall score (all KPIs sum to 100)
  
  -- Scoring
  scoring_method TEXT DEFAULT 'linear' CHECK (scoring_method IN ('linear', 'slab', 'binary', 'manual')),
  scoring_slabs JSONB DEFAULT '[]',    -- [{from, to, score}]
  
  -- Source (where data comes from)
  data_source TEXT DEFAULT 'manual' CHECK (data_source IN (
    'manual', 'hms_auto', 'attendance_auto', 'revenue_auto', 'custom'
  )),
  
  frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(organisation_id, code)
);

ALTER TABLE hrms_kpi_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff views KPI templates" ON hrms_kpi_templates;
CREATE POLICY "Staff views KPI templates"
  ON hrms_kpi_templates FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "Admin manages KPI templates" ON hrms_kpi_templates;
CREATE POLICY "Admin manages KPI templates"
  ON hrms_kpi_templates FOR ALL TO authenticated
  USING (public.is_hr_admin(auth.uid()))
  WITH CHECK (public.is_hr_admin(auth.uid()));

-- Seed KPI templates per role
INSERT INTO hrms_kpi_templates (name, code, description, category, applicable_roles, metric_type, unit, target_value, weightage, data_source, sort_order) VALUES
  -- Doctor KPIs
  ('Daily Consultations', 'DOC-CONS', 'Average daily patient consultations', 'clinical', '{doctor}', 'number', 'patients/day', 15, 20, 'hms_auto', 1),
  ('Documentation Completeness', 'DOC-DOCS', 'Case sheets and prescriptions completed on time', 'compliance', '{doctor}', 'percentage', '%', 95, 15, 'hms_auto', 2),
  ('Patient Follow-up Rate', 'DOC-FU', 'Follow-up appointments completed vs scheduled', 'patient_care', '{doctor}', 'percentage', '%', 80, 15, 'hms_auto', 3),
  ('Patient Feedback Score', 'DOC-FB', 'Average patient rating (1-5)', 'patient_care', '{doctor}', 'rating', '/5', 4.2, 15, 'hms_auto', 4),
  ('Revenue Target', 'DOC-REV', 'Monthly consultation + procedure revenue', 'financial', '{doctor}', 'currency', '₹', 200000, 20, 'hms_auto', 5),
  ('Attendance & Punctuality', 'DOC-ATT', 'On-time attendance percentage', 'attendance', '{doctor}', 'percentage', '%', 95, 15, 'attendance_auto', 6),

  -- Therapist KPIs
  ('Therapies Completed', 'TH-COMP', 'Total therapies/procedures completed per month', 'clinical', '{therapist}', 'number', 'procedures', 50, 25, 'hms_auto', 1),
  ('Therapy Punctuality', 'TH-PUNCT', 'Sessions started within 5 min of schedule', 'operational', '{therapist}', 'percentage', '%', 90, 15, 'hms_auto', 2),
  ('Patient Feedback (Therapy)', 'TH-FB', 'Therapy satisfaction score', 'patient_care', '{therapist}', 'rating', '/5', 4.0, 20, 'hms_auto', 3),
  ('Treatment Documentation', 'TH-DOC', 'Therapy notes completed same day', 'compliance', '{therapist}', 'percentage', '%', 100, 15, 'manual', 4),
  ('Attendance', 'TH-ATT', 'Monthly attendance percentage', 'attendance', '{therapist}', 'percentage', '%', 95, 15, 'attendance_auto', 5),
  ('Material Waste Control', 'TH-WASTE', 'Oil/material usage within standards', 'operational', '{therapist}', 'percentage', '%', 95, 10, 'manual', 6),

  -- Reception KPIs
  ('Patient Registration Speed', 'REC-SPEED', 'Average registration time (minutes)', 'operational', '{receptionist}', 'number', 'minutes', 5, 20, 'hms_auto', 1),
  ('Registration Accuracy', 'REC-ACC', 'Error-free registrations %', 'compliance', '{receptionist}', 'percentage', '%', 98, 20, 'manual', 2),
  ('Follow-up Call Completion', 'REC-CALL', 'Scheduled follow-up calls made', 'patient_care', '{receptionist}', 'percentage', '%', 90, 20, 'manual', 3),
  ('Waiting Time Management', 'REC-WAIT', 'Average patient wait < 15 min', 'operational', '{receptionist}', 'percentage', '%', 85, 20, 'hms_auto', 4),
  ('Collection Accuracy', 'REC-COLL', 'Billing and collection without discrepancy', 'financial', '{receptionist}', 'percentage', '%', 100, 20, 'manual', 5),

  -- Pharmacy KPIs
  ('Dispensing Accuracy', 'PH-ACC', 'Error-free dispensing rate', 'compliance', '{pharmacist}', 'percentage', '%', 99.5, 25, 'manual', 1),
  ('Expiry Monitoring', 'PH-EXP', 'Near-expiry items flagged on time', 'compliance', '{pharmacist}', 'percentage', '%', 100, 20, 'hms_auto', 2),
  ('Stock Compliance', 'PH-STOCK', 'Min stock levels maintained', 'operational', '{pharmacist}', 'percentage', '%', 95, 20, 'hms_auto', 3),
  ('Patient Service Time', 'PH-TIME', 'Average dispensing time (minutes)', 'operational', '{pharmacist}', 'number', 'minutes', 3, 15, 'manual', 4),
  ('Sales Target', 'PH-SALE', 'Monthly pharmacy sales target', 'financial', '{pharmacist}', 'currency', '₹', 100000, 20, 'hms_auto', 5),

  -- Manager KPIs
  ('Branch Revenue', 'MGR-REV', 'Monthly branch revenue vs target', 'financial', '{}', 'percentage', '%', 100, 25, 'hms_auto', 1),
  ('Staff Attendance Rate', 'MGR-ATT', 'Branch staff average attendance', 'operational', '{}', 'percentage', '%', 92, 15, 'attendance_auto', 2),
  ('Patient Satisfaction (NPS)', 'MGR-NPS', 'Branch Net Promoter Score', 'patient_care', '{}', 'rating', '/10', 8, 20, 'hms_auto', 3),
  ('Operational Compliance', 'MGR-COMP', 'Audit score / checklist completion', 'compliance', '{}', 'percentage', '%', 90, 20, 'manual', 4),
  ('Staff Retention', 'MGR-RET', 'Employee retention rate (quarterly)', 'teamwork', '{}', 'percentage', '%', 95, 20, 'manual', 5)
ON CONFLICT (organisation_id, code) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. EMPLOYEE KPIs (Monthly/periodic scores per employee)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  kpi_template_id UUID NOT NULL REFERENCES hrms_kpi_templates(id) ON DELETE CASCADE,
  
  -- Period
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  
  -- Score
  actual_value DECIMAL(10,2) DEFAULT 0,
  target_value DECIMAL(10,2) DEFAULT 0,
  achievement_pct DECIMAL(5,1) DEFAULT 0,
  weighted_score DECIMAL(5,2) DEFAULT 0,    -- (achievement_pct * weightage / 100)
  
  -- Rating (1-5 scale)
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  
  -- Source
  data_source TEXT DEFAULT 'manual',
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMPTZ,
  
  remarks TEXT,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, kpi_template_id, month, year)
);

ALTER TABLE hrms_employee_kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own KPIs" ON hrms_employee_kpis;
CREATE POLICY "Employee views own KPIs"
  ON hrms_employee_kpis FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages KPIs" ON hrms_employee_kpis;
CREATE POLICY "HR manages KPIs"
  ON hrms_employee_kpis FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_kpi_employee ON hrms_employee_kpis(employee_id, year, month);
CREATE INDEX IF NOT EXISTS idx_emp_kpi_template ON hrms_employee_kpis(kpi_template_id, year, month);
CREATE INDEX IF NOT EXISTS idx_emp_kpi_period ON hrms_employee_kpis(year DESC, month DESC);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. PERFORMANCE REVIEWS (Periodic appraisals)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  
  -- Review period
  review_type TEXT NOT NULL DEFAULT 'annual' CHECK (review_type IN (
    'probation', 'quarterly', 'half_yearly', 'annual', 'adhoc'
  )),
  period_from DATE NOT NULL,
  period_to DATE NOT NULL,
  
  -- Scores (aggregated from KPIs + manager assessment)
  kpi_score DECIMAL(5,2) DEFAULT 0,           -- average weighted KPI (0-100)
  manager_rating INTEGER CHECK (manager_rating BETWEEN 1 AND 5),
  self_rating INTEGER CHECK (self_rating BETWEEN 1 AND 5),
  final_rating INTEGER CHECK (final_rating BETWEEN 1 AND 5),
  
  -- Overall grade
  grade TEXT CHECK (grade IN ('A+', 'A', 'B+', 'B', 'C', 'D', NULL)),
  
  -- Narrative
  strengths TEXT,
  areas_of_improvement TEXT,
  goals_next_period TEXT,
  employee_comments TEXT,
  manager_comments TEXT,
  hr_comments TEXT,
  
  -- Recommendation
  recommendation TEXT CHECK (recommendation IN (
    'promotion', 'increment', 'confirmation', 'pip', 'training', 'no_change', 'termination', NULL
  )),
  increment_percentage DECIMAL(5,2),
  
  -- Workflow
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'self_review', 'manager_review', 'hr_review', 'completed', 'acknowledged'
  )),
  
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  acknowledged_by_employee BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_performance_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own reviews" ON hrms_performance_reviews;
CREATE POLICY "Employee views own reviews"
  ON hrms_performance_reviews FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages reviews" ON hrms_performance_reviews;
CREATE POLICY "HR manages reviews"
  ON hrms_performance_reviews FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_reviews_employee ON hrms_performance_reviews(employee_id, period_from DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON hrms_performance_reviews(status) WHERE status NOT IN ('completed', 'acknowledged');

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. TRAININGS (Training programs master)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  
  name TEXT NOT NULL,
  code TEXT,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'mandatory', 'clinical', 'safety', 'compliance', 'soft_skills',
    'technical', 'leadership', 'induction', 'general'
  )),
  description TEXT,
  
  -- Details
  trainer_name TEXT,
  trainer_type TEXT CHECK (trainer_type IN ('internal', 'external', 'online', NULL)),
  duration_hours DECIMAL(5,1) DEFAULT 1,
  max_participants INTEGER,
  
  -- Schedule
  scheduled_date DATE,
  scheduled_time TIME,
  venue TEXT,
  is_online BOOLEAN DEFAULT false,
  online_link TEXT,
  
  -- Applicability
  applicable_roles TEXT[] DEFAULT '{}',
  applicable_departments TEXT[] DEFAULT '{}',
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_months INTEGER,              -- retrain every X months
  
  -- Assessment
  has_assessment BOOLEAN DEFAULT false,
  passing_score DECIMAL(5,2) DEFAULT 70,
  
  -- Certificate
  has_certificate BOOLEAN DEFAULT false,
  certificate_validity_months INTEGER,
  
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('draft', 'scheduled', 'in_progress', 'completed', 'cancelled')),
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff views trainings" ON hrms_trainings;
CREATE POLICY "Staff views trainings"
  ON hrms_trainings FOR SELECT TO authenticated
  USING (public.is_hms_staff(auth.uid()) OR is_active = true);

DROP POLICY IF EXISTS "HR manages trainings" ON hrms_trainings;
CREATE POLICY "HR manages trainings"
  ON hrms_trainings FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

-- Seed training programs
INSERT INTO hrms_trainings (name, code, category, description, duration_hours, is_mandatory, applicable_roles, has_certificate, certificate_validity_months, is_recurring, recurrence_months) VALUES
  ('Fire Safety & Evacuation', 'TRN-FIRE', 'safety', 'Annual fire safety drill and evacuation procedure training', 2, true, '{}', true, 12, true, 12),
  ('Infection Control & BMW', 'TRN-IC', 'safety', 'Biomedical waste management and infection prevention', 3, true, '{}', true, 12, true, 12),
  ('Patient Safety Protocol', 'TRN-PS', 'compliance', 'Patient identification, fall prevention, medication safety', 2, true, '{doctor,nurse,therapist}', true, 12, true, 12),
  ('Panchakarma SOP Training', 'TRN-PK', 'clinical', 'Standard operating procedures for all Panchakarma therapies', 8, true, '{therapist}', true, 24, true, 24),
  ('NABH Documentation', 'TRN-NABH', 'compliance', 'NABH documentation standards and audit preparation', 4, false, '{}', false, NULL, true, 6),
  ('CPR & Basic Life Support', 'TRN-BLS', 'safety', 'CPR and BLS certification for clinical staff', 4, true, '{doctor,nurse,therapist}', true, 24, true, 24),
  ('Communication & Soft Skills', 'TRN-COMM', 'soft_skills', 'Patient communication, empathy, and telephone etiquette', 3, false, '{receptionist}', false, NULL, false, NULL),
  ('New Employee Induction', 'TRN-IND', 'induction', 'Hospital overview, policies, culture, and systems training', 4, true, '{}', false, NULL, false, NULL),
  ('Pharmacy Drug Safety', 'TRN-DRUG', 'clinical', 'Drug interactions, storage, dispensing protocols', 3, true, '{pharmacist}', true, 12, true, 12),
  ('Data Privacy & DPDP Act', 'TRN-PRIV', 'compliance', 'Patient data privacy, consent, and DPDP compliance', 2, true, '{}', false, NULL, true, 12),
  ('Emergency Response', 'TRN-EMER', 'safety', 'Emergency protocols, anaphylaxis, code blue procedures', 3, true, '{doctor,nurse}', true, 12, true, 12),
  ('AYUSH Clinical Protocols', 'TRN-AYUSH', 'clinical', 'Evidence-based AYUSH clinical protocols and documentation', 6, false, '{doctor}', true, 36, false, NULL)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. EMPLOYEE TRAINING (Assignment & completion tracking)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS hrms_employee_training (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES hms_staff(id) ON DELETE CASCADE,
  training_id UUID NOT NULL REFERENCES hrms_trainings(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN (
    'assigned', 'in_progress', 'completed', 'failed', 'exempted', 'expired'
  )),
  
  -- Attendance
  attended BOOLEAN DEFAULT false,
  attendance_date DATE,
  
  -- Assessment
  assessment_score DECIMAL(5,2),
  passed BOOLEAN,
  
  -- Certificate
  certificate_issued BOOLEAN DEFAULT false,
  certificate_number TEXT,
  certificate_url TEXT,
  certificate_expiry DATE,
  
  -- Feedback
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_comments TEXT,
  
  -- Meta
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(employee_id, training_id, attendance_date)
);

ALTER TABLE hrms_employee_training ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Employee views own training" ON hrms_employee_training;
CREATE POLICY "Employee views own training"
  ON hrms_employee_training FOR SELECT TO authenticated
  USING (
    employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR public.is_hms_staff(auth.uid())
  );

DROP POLICY IF EXISTS "HR manages employee training" ON hrms_employee_training;
CREATE POLICY "HR manages employee training"
  ON hrms_employee_training FOR ALL TO authenticated
  USING (public.is_hms_staff(auth.uid()))
  WITH CHECK (public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_emp_training_employee ON hrms_employee_training(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_emp_training_training ON hrms_employee_training(training_id);
CREATE INDEX IF NOT EXISTS idx_emp_training_expiry ON hrms_employee_training(certificate_expiry) WHERE certificate_expiry IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. GRANTS
-- ═══════════════════════════════════════════════════════════════════════════════

GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_kpi_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_kpis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_performance_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_trainings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON hrms_employee_training TO authenticated;

GRANT ALL ON hrms_kpi_templates TO service_role;
GRANT ALL ON hrms_employee_kpis TO service_role;
GRANT ALL ON hrms_performance_reviews TO service_role;
GRANT ALL ON hrms_trainings TO service_role;
GRANT ALL ON hrms_employee_training TO service_role;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Phase 4 Performance & Training Tables Created Successfully
-- ═══════════════════════════════════════════════════════════════════════════════
