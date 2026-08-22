-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Phase 6: Intelligence & Notifications                          ║
-- ║  CORRECTED VERSION — Copy this entire file and run in Supabase SQL Editor     ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS hrms_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_employee_id UUID REFERENCES hms_staff(id) ON DELETE CASCADE,
  recipient_role TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
    'leave', 'attendance', 'payroll', 'document_expiry', 'registration_expiry',
    'training', 'probation', 'contract', 'birthday', 'anniversary',
    'announcement', 'request', 'approval', 'alert', 'general'
  )),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  action_url TEXT,
  action_label TEXT,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  is_dismissed BOOLEAN DEFAULT false,
  source_module TEXT,
  source_entity_id UUID,
  channels TEXT[] DEFAULT '{in_app}',
  email_sent BOOLEAN DEFAULT false,
  sms_sent BOOLEAN DEFAULT false,
  organisation_id UUID REFERENCES hrms_organisations(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hrms_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "User views own notifications" ON hrms_notifications;
CREATE POLICY "User views own notifications"
  ON hrms_notifications FOR SELECT TO authenticated
  USING (
    recipient_user_id = auth.uid()
    OR recipient_employee_id IN (SELECT id FROM hms_staff WHERE user_id = auth.uid())
    OR (recipient_role IS NOT NULL AND public.is_hms_staff(auth.uid()))
  );

DROP POLICY IF EXISTS "System creates notifications" ON hrms_notifications;
CREATE POLICY "System creates notifications"
  ON hrms_notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_hms_staff(auth.uid()));

DROP POLICY IF EXISTS "User manages own notifications" ON hrms_notifications;
CREATE POLICY "User manages own notifications"
  ON hrms_notifications FOR UPDATE TO authenticated
  USING (recipient_user_id = auth.uid() OR public.is_hms_staff(auth.uid()))
  WITH CHECK (recipient_user_id = auth.uid() OR public.is_hms_staff(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_notif_recipient ON hrms_notifications(recipient_user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_employee ON hrms_notifications(recipient_employee_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notif_category ON hrms_notifications(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_unread ON hrms_notifications(recipient_user_id, is_read) WHERE is_read = false;

-- 2. WORKFORCE ANALYTICS VIEW
CREATE OR REPLACE VIEW hrms_v_workforce_summary AS
SELECT
  COUNT(*) FILTER (WHERE is_active = true) AS total_active,
  COUNT(*) FILTER (WHERE employee_status = 'active') AS active_employees,
  COUNT(*) FILTER (WHERE employee_status = 'probation' OR employment_type = 'probation') AS on_probation,
  COUNT(*) FILTER (WHERE employee_status = 'notice_period') AS on_notice,
  COUNT(*) FILTER (WHERE employee_status = 'resigned' OR employee_status = 'relieved') AS exited_total,
  COUNT(*) FILTER (WHERE join_date >= CURRENT_DATE - INTERVAL '30 days') AS new_joiners_30d,
  COUNT(*) FILTER (WHERE join_date >= CURRENT_DATE - INTERVAL '90 days') AS new_joiners_90d,
  COUNT(*) FILTER (WHERE gender = 'male' AND is_active = true) AS male_count,
  COUNT(*) FILTER (WHERE gender = 'female' AND is_active = true) AS female_count,
  COUNT(*) FILTER (WHERE (gender IS NULL OR gender = 'other') AND is_active = true) AS other_gender_count,
  COUNT(*) FILTER (WHERE employment_type = 'permanent' AND is_active = true) AS permanent_count,
  COUNT(*) FILTER (WHERE employment_type = 'contract' AND is_active = true) AS contract_count,
  COUNT(*) FILTER (WHERE employment_type = 'consultant' AND is_active = true) AS consultant_count,
  COUNT(*) FILTER (WHERE employment_type IN ('intern', 'part_time', 'temporary') AND is_active = true) AS other_type_count,
  COALESCE(SUM(salary) FILTER (WHERE is_active = true), 0) AS total_monthly_payroll,
  COALESCE(AVG(salary) FILTER (WHERE is_active = true AND salary > 0), 0) AS avg_salary,
  COALESCE(AVG((CURRENT_DATE - join_date)::numeric) FILTER (WHERE is_active = true AND join_date IS NOT NULL), 0)::INTEGER AS avg_tenure_days
FROM hms_staff;

-- 3. DEPARTMENT WORKFORCE VIEW
CREATE OR REPLACE VIEW hrms_v_department_workforce AS
SELECT
  COALESCE(department, 'Unassigned') AS department,
  COUNT(*) AS total_employees,
  COUNT(*) FILTER (WHERE employee_status = 'active' OR employee_status IS NULL) AS active,
  COUNT(*) FILTER (WHERE today_attendance = 'present') AS present_today,
  COUNT(*) FILTER (WHERE today_attendance = 'absent') AS absent_today,
  COUNT(*) FILTER (WHERE today_attendance = 'leave') AS on_leave_today,
  COALESCE(SUM(salary), 0) AS department_payroll,
  COALESCE(AVG(salary) FILTER (WHERE salary > 0), 0) AS avg_salary,
  COUNT(*) FILTER (WHERE gender = 'male') AS male,
  COUNT(*) FILTER (WHERE gender = 'female') AS female
FROM hms_staff
WHERE is_active = true
GROUP BY department
ORDER BY total_employees DESC;

-- 4. BRANCH WORKFORCE VIEW
CREATE OR REPLACE VIEW hrms_v_branch_workforce AS
SELECT
  b.id AS branch_id,
  b.branch_name,
  b.branch_code,
  b.branch_type,
  COUNT(s.id) AS total_staff,
  COUNT(s.id) FILTER (WHERE s.today_attendance = 'present') AS present_today,
  COUNT(s.id) FILTER (WHERE s.today_attendance = 'absent') AS absent_today,
  COALESCE(SUM(s.salary), 0) AS branch_payroll
FROM hms_branches b
LEFT JOIN hms_staff s ON s.branch_id = b.id AND s.is_active = true
WHERE b.is_active = true
GROUP BY b.id, b.branch_name, b.branch_code, b.branch_type
ORDER BY total_staff DESC;

-- 5. ATTRITION VIEW
CREATE OR REPLACE VIEW hrms_v_attrition_monthly AS
SELECT
  EXTRACT(YEAR FROM resignation_date)::INTEGER AS year,
  EXTRACT(MONTH FROM resignation_date)::INTEGER AS month,
  TO_CHAR(resignation_date, 'Mon YYYY') AS period_label,
  COUNT(*) AS resignations,
  COUNT(*) FILTER (WHERE reason_category = 'better_opportunity') AS better_opportunity,
  COUNT(*) FILTER (WHERE reason_category = 'personal') AS personal,
  COUNT(*) FILTER (WHERE reason_category = 'relocation') AS relocation,
  COUNT(*) FILTER (WHERE reason_category = 'health') AS health,
  COUNT(*) FILTER (WHERE reason_category = 'dissatisfaction') AS dissatisfaction,
  COUNT(*) FILTER (WHERE reason_category NOT IN ('better_opportunity', 'personal', 'relocation', 'health', 'dissatisfaction') OR reason_category IS NULL) AS other
FROM hrms_resignations
WHERE status IN ('accepted', 'submitted', 'manager_review', 'hr_review')
GROUP BY EXTRACT(YEAR FROM resignation_date), EXTRACT(MONTH FROM resignation_date), TO_CHAR(resignation_date, 'Mon YYYY')
ORDER BY year DESC, month DESC
LIMIT 12;

-- 6. HMS INTEGRATION VIEWS
CREATE OR REPLACE VIEW hrms_v_doctor_activity AS
SELECT
  s.id AS employee_id, s.name, s.employee_code, s.department, s.role,
  s.productivity_score, s.today_attendance, COALESCE(s.salary, 0) AS salary,
  0 AS consultations_today, 0 AS consultations_month, 0 AS revenue_month,
  0 AS follow_up_rate, 0 AS avg_patient_rating
FROM hms_staff s
WHERE s.is_active = true AND s.role ILIKE '%doctor%'
ORDER BY s.name;

CREATE OR REPLACE VIEW hrms_v_therapist_activity AS
SELECT
  s.id AS employee_id, s.name, s.employee_code, s.department, s.role,
  s.productivity_score, s.today_attendance,
  0 AS procedures_today, 0 AS procedures_month, 0 AS avg_therapy_rating
FROM hms_staff s
WHERE s.is_active = true AND (s.role ILIKE '%therapist%' OR s.department = 'Panchakarma')
ORDER BY s.name;

-- 7. ALERT HELPER VIEWS
CREATE OR REPLACE VIEW hrms_v_expiring_documents AS
SELECT
  d.id AS document_id, d.employee_id, s.name AS employee_name, s.employee_code,
  d.document_type, d.document_name, d.expiry_date,
  (d.expiry_date - CURRENT_DATE) AS days_until_expiry
FROM hrms_employee_documents d
JOIN hms_staff s ON s.id = d.employee_id
WHERE d.expiry_date IS NOT NULL
  AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  AND d.expiry_date >= CURRENT_DATE
  AND s.is_active = true
ORDER BY d.expiry_date ASC;

CREATE OR REPLACE VIEW hrms_v_expiring_registrations AS
SELECT
  q.id AS qualification_id, q.employee_id, s.name AS employee_name, s.employee_code,
  q.qualification, q.registration_number, q.registration_authority, q.registration_expiry,
  (q.registration_expiry - CURRENT_DATE) AS days_until_expiry
FROM hrms_employee_qualifications q
JOIN hms_staff s ON s.id = q.employee_id
WHERE q.registration_expiry IS NOT NULL
  AND q.registration_expiry <= CURRENT_DATE + INTERVAL '60 days'
  AND q.registration_expiry >= CURRENT_DATE
  AND s.is_active = true
ORDER BY q.registration_expiry ASC;

CREATE OR REPLACE VIEW hrms_v_probation_ending AS
SELECT
  s.id AS employee_id, s.name, s.employee_code, s.department, s.role,
  s.join_date, s.probation_end_date,
  (s.probation_end_date - CURRENT_DATE) AS days_until_end
FROM hms_staff s
WHERE s.is_active = true
  AND s.probation_end_date IS NOT NULL
  AND s.probation_end_date <= CURRENT_DATE + INTERVAL '30 days'
  AND s.probation_end_date >= CURRENT_DATE
  AND (s.employee_status = 'probation' OR s.employment_type = 'probation')
ORDER BY s.probation_end_date ASC;

CREATE OR REPLACE VIEW hrms_v_expiring_training_certs AS
SELECT
  et.id AS training_record_id, et.employee_id, s.name AS employee_name, s.employee_code,
  t.name AS training_name, et.certificate_expiry,
  (et.certificate_expiry - CURRENT_DATE) AS days_until_expiry
FROM hrms_employee_training et
JOIN hms_staff s ON s.id = et.employee_id
JOIN hrms_trainings t ON t.id = et.training_id
WHERE et.certificate_expiry IS NOT NULL
  AND et.certificate_expiry <= CURRENT_DATE + INTERVAL '30 days'
  AND et.certificate_expiry >= CURRENT_DATE
  AND s.is_active = true
  AND et.status = 'completed'
ORDER BY et.certificate_expiry ASC;

-- 8. GRANTS
GRANT SELECT, INSERT, UPDATE ON hrms_notifications TO authenticated;
GRANT ALL ON hrms_notifications TO service_role;
GRANT SELECT ON hrms_v_workforce_summary TO authenticated;
GRANT SELECT ON hrms_v_department_workforce TO authenticated;
GRANT SELECT ON hrms_v_branch_workforce TO authenticated;
GRANT SELECT ON hrms_v_attrition_monthly TO authenticated;
GRANT SELECT ON hrms_v_doctor_activity TO authenticated;
GRANT SELECT ON hrms_v_therapist_activity TO authenticated;
GRANT SELECT ON hrms_v_expiring_documents TO authenticated;
GRANT SELECT ON hrms_v_expiring_registrations TO authenticated;
GRANT SELECT ON hrms_v_probation_ending TO authenticated;
GRANT SELECT ON hrms_v_expiring_training_certs TO authenticated;

-- DONE
