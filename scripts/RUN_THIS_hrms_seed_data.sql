-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  AYUZEE HRMS — Seed Sample Data for Testing                                   ║
-- ║  Run AFTER all Phase 1-6 scripts are executed.                               ║
-- ║  SAFE TO RUN: Uses ON CONFLICT DO NOTHING where possible.                    ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. UPDATE EXISTING hms_staff WITH HRMS FIELDS (enrich the 10 seeded staff)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Link all existing staff to default org
UPDATE hms_staff SET organisation_id = (SELECT id FROM hrms_organisations LIMIT 1) WHERE organisation_id IS NULL;

-- Link to first branch
UPDATE hms_staff SET branch_id = (SELECT id FROM hms_branches WHERE branch_code = 'ALSH-01' LIMIT 1) WHERE branch_id IS NULL;

-- Enrich with personal details
UPDATE hms_staff SET
  employee_code = 'EMP-0001', gender = 'male', date_of_birth = '1985-03-15',
  blood_group = 'B+', marital_status = 'Married',
  address_line1 = '42, Gandhi Nagar', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Priya Sharma', emergency_contact_phone = '9876543220', emergency_contact_relation = 'Spouse',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday', notice_period_days = 60
WHERE name = 'Dr. Arun Sharma';

UPDATE hms_staff SET
  employee_code = 'EMP-0002', gender = 'female', date_of_birth = '1990-07-22',
  blood_group = 'O+', marital_status = 'Single',
  address_line1 = '15, Lake View Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Ravi Patel', emergency_contact_phone = '9876543221', emergency_contact_relation = 'Father',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Dr. Meena Patel';

UPDATE hms_staff SET
  employee_code = 'EMP-0003', gender = 'male', date_of_birth = '1995-11-08',
  address_line1 = '8, Station Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Lakshmi K', emergency_contact_phone = '9876543222', emergency_contact_relation = 'Mother',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Rajesh K';

UPDATE hms_staff SET
  employee_code = 'EMP-0004', gender = 'female', date_of_birth = '1992-05-30',
  blood_group = 'A+', marital_status = 'Married',
  address_line1 = '22, Nehru Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Kumar M', emergency_contact_phone = '9876543223', emergency_contact_relation = 'Husband',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Sunita M';

UPDATE hms_staff SET
  employee_code = 'EMP-0005', gender = 'male', date_of_birth = '1988-09-12',
  blood_group = 'AB+',
  address_line1 = '5, Market Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Geetha R', emergency_contact_phone = '9876543224', emergency_contact_relation = 'Wife',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Vikram R';

UPDATE hms_staff SET
  employee_code = 'EMP-0006', gender = 'female', date_of_birth = '1994-02-18',
  address_line1 = '12, Park Avenue', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'probation', employee_status = 'probation',
  probation_end_date = '2026-09-01', weekly_off = 'Sunday'
WHERE name = 'Anita D';

UPDATE hms_staff SET
  employee_code = 'EMP-0007', gender = 'male', date_of_birth = '1986-12-05',
  blood_group = 'O-', marital_status = 'Married',
  address_line1 = '7, Temple Street', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Meena S', emergency_contact_phone = '9876543225', emergency_contact_relation = 'Wife',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Suresh Therapist';

UPDATE hms_staff SET
  employee_code = 'EMP-0008', gender = 'female', date_of_birth = '1996-08-25',
  address_line1 = '3, Hospital Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Priya Therapist';

UPDATE hms_staff SET
  employee_code = 'EMP-0009', gender = 'male', date_of_birth = '1998-04-14',
  address_line1 = '19, Anna Nagar', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  employment_type = 'probation', employee_status = 'probation',
  probation_end_date = '2026-09-01', weekly_off = 'Sunday'
WHERE name = 'Mohan P';

UPDATE hms_staff SET
  employee_code = 'EMP-0010', gender = 'female', date_of_birth = '1987-06-20',
  blood_group = 'B-', marital_status = 'Married',
  address_line1 = '28, MG Road', city = 'Kadayanallur', state = 'Tamil Nadu', pincode = '627751',
  emergency_contact_name = 'Srinivas S', emergency_contact_phone = '9876543226', emergency_contact_relation = 'Husband',
  employment_type = 'permanent', employee_status = 'active', weekly_off = 'Sunday'
WHERE name = 'Kavita S';

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. SAMPLE ATTENDANCE (Last 5 days)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_attendance (employee_id, attendance_date, status, check_in, check_out, check_in_method, worked_hours, late_minutes)
SELECT s.id, d.dt, 
  CASE 
    WHEN s.name = 'Sunita M' AND d.dt = CURRENT_DATE THEN 'absent'
    WHEN s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1 THEN 'on_leave'
    WHEN EXTRACT(DOW FROM d.dt) = 0 THEN 'weekly_off'
    WHEN random() < 0.05 THEN 'late'
    ELSE 'present'
  END,
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1) 
    THEN (d.dt + TIME '09:00')::timestamptz ELSE NULL END,
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1) 
    THEN (d.dt + TIME '17:30')::timestamptz ELSE NULL END,
  'manual',
  CASE WHEN EXTRACT(DOW FROM d.dt) != 0 AND NOT (s.name = 'Sunita M' AND d.dt = CURRENT_DATE) AND NOT (s.name = 'Mohan P' AND d.dt >= CURRENT_DATE - 1)
    THEN 8.5 ELSE 0 END,
  0
FROM hms_staff s
CROSS JOIN (
  SELECT CURRENT_DATE - i AS dt FROM generate_series(0, 4) AS i
) d
WHERE s.is_active = true
ON CONFLICT (employee_id, attendance_date) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. SAMPLE LEAVE BALANCES (2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_leave_balances (employee_id, leave_type_id, year, opening_balance, credited, used, pending)
SELECT 
  s.id,
  lt.id,
  2026,
  0,
  lt.annual_quota,
  CASE 
    WHEN lt.code = 'CL' THEN FLOOR(random() * 5)
    WHEN lt.code = 'SL' THEN FLOOR(random() * 3)
    WHEN lt.code = 'EL' THEN FLOOR(random() * 4)
    ELSE 0
  END,
  CASE WHEN lt.code = 'CL' AND random() < 0.3 THEN 1 ELSE 0 END
FROM hms_staff s
CROSS JOIN hrms_leave_types lt
WHERE s.is_active = true AND lt.is_active = true
  AND lt.code IN ('CL', 'SL', 'EL', 'CO', 'LOP')
ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. SAMPLE LEAVE REQUESTS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_leave_requests (employee_id, leave_type_id, from_date, to_date, total_days, is_half_day, reason, status, applied_by)
SELECT 
  s.id,
  (SELECT id FROM hrms_leave_types WHERE code = 'CL' LIMIT 1),
  '2026-08-25', '2026-08-26', 2, false,
  'Family function',
  'pending',
  COALESCE(s.user_id, (SELECT id FROM auth.users LIMIT 1))
FROM hms_staff s WHERE s.name = 'Mohan P' AND s.is_active = true
ON CONFLICT DO NOTHING;

INSERT INTO hrms_leave_requests (employee_id, leave_type_id, from_date, to_date, total_days, is_half_day, reason, status, applied_by)
SELECT 
  s.id,
  (SELECT id FROM hrms_leave_types WHERE code = 'EL' LIMIT 1),
  '2026-09-01', '2026-09-05', 5, false,
  'Annual vacation',
  'pending',
  COALESCE(s.user_id, (SELECT id FROM auth.users LIMIT 1))
FROM hms_staff s WHERE s.name = 'Rajesh K' AND s.is_active = true
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. SAMPLE DUTY ROSTER (Current week)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_duty_roster (employee_id, roster_date, shift_id, status, department)
SELECT 
  s.id,
  d.dt,
  CASE 
    WHEN EXTRACT(DOW FROM d.dt) = 0 THEN NULL  -- Sunday off
    WHEN s.department = 'IPD' THEN (SELECT id FROM hrms_shifts WHERE code = 'M' LIMIT 1)
    ELSE (SELECT id FROM hrms_shifts WHERE code = 'G' LIMIT 1)
  END,
  CASE WHEN EXTRACT(DOW FROM d.dt) = 0 THEN 'cancelled' ELSE 'scheduled' END,
  s.department
FROM hms_staff s
CROSS JOIN (
  SELECT (date_trunc('week', CURRENT_DATE) + (i || ' days')::interval)::date AS dt 
  FROM generate_series(0, 6) AS i
) d
WHERE s.is_active = true
ON CONFLICT (employee_id, roster_date) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. SAMPLE EMPLOYEE QUALIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'BAMS', 'Govt. Ayurveda College, Thiruvananthapuram', 'KUHS', 2008, 'TN/AYU/12345', 'TNBIM', '2027-03-31', true
FROM hms_staff s WHERE s.name = 'Dr. Arun Sharma'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'BAMS', 'Sri Jayendra Saraswathi Ayurveda College', 'NTRUHS', 2015, 'TN/AYU/23456', 'TNBIM', '2026-09-15', true
FROM hms_staff s WHERE s.name = 'Dr. Meena Patel'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, university, year_of_passing, is_primary)
SELECT s.id, 'DMLT', 'Govt. Medical College, Tirunelveli', 'Dr. MGR University', 2022, true
FROM hms_staff s WHERE s.name = 'Anita D'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, year_of_passing, is_primary)
SELECT s.id, 'Diploma in Panchakarma Therapy', 'AYUSH Training Centre, Chennai', 2020, true
FROM hms_staff s WHERE s.name = 'Suresh Therapist'
ON CONFLICT DO NOTHING;

INSERT INTO hrms_employee_qualifications (employee_id, qualification, institution, year_of_passing, registration_number, registration_authority, registration_expiry, is_primary)
SELECT s.id, 'B.Pharm', 'PSG College of Pharmacy, Coimbatore', 2014, 'TN/PH/34567', 'TN Pharmacy Council', '2027-06-30', true
FROM hms_staff s WHERE s.name = 'Vikram R'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. SAMPLE KPI SCORES (August 2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_kpis (employee_id, kpi_template_id, month, year, actual_value, target_value, achievement_pct, weighted_score, rating)
SELECT s.id, kt.id, 8, 2026,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 18
    WHEN 'DOC-DOCS' THEN 92
    WHEN 'DOC-FB' THEN 4.5
    WHEN 'DOC-REV' THEN 320000
    WHEN 'DOC-FU' THEN 85
    WHEN 'DOC-ATT' THEN 100
    ELSE 0
  END,
  kt.target_value,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 120
    WHEN 'DOC-DOCS' THEN 97
    WHEN 'DOC-FB' THEN 107
    WHEN 'DOC-REV' THEN 160
    WHEN 'DOC-FU' THEN 106
    WHEN 'DOC-ATT' THEN 105
    ELSE 0
  END,
  CASE kt.code
    WHEN 'DOC-CONS' THEN 24
    WHEN 'DOC-DOCS' THEN 14.5
    WHEN 'DOC-FB' THEN 16
    WHEN 'DOC-REV' THEN 20
    WHEN 'DOC-FU' THEN 16
    WHEN 'DOC-ATT' THEN 15.8
    ELSE 0
  END,
  CASE WHEN kt.code IN ('DOC-CONS', 'DOC-FB', 'DOC-REV', 'DOC-ATT') THEN 5 ELSE 4 END
FROM hms_staff s
CROSS JOIN hrms_kpi_templates kt
WHERE s.name = 'Dr. Arun Sharma'
  AND kt.code IN ('DOC-CONS', 'DOC-DOCS', 'DOC-FB', 'DOC-REV', 'DOC-FU', 'DOC-ATT')
ON CONFLICT (employee_id, kpi_template_id, month, year) DO NOTHING;

-- Therapist KPIs
INSERT INTO hrms_employee_kpis (employee_id, kpi_template_id, month, year, actual_value, target_value, achievement_pct, weighted_score, rating)
SELECT s.id, kt.id, 8, 2026,
  CASE kt.code WHEN 'TH-COMP' THEN 62 WHEN 'TH-FB' THEN 4.3 WHEN 'TH-ATT' THEN 100 ELSE 90 END,
  kt.target_value,
  CASE kt.code WHEN 'TH-COMP' THEN 124 WHEN 'TH-FB' THEN 108 WHEN 'TH-ATT' THEN 105 ELSE 95 END,
  CASE kt.code WHEN 'TH-COMP' THEN 31 WHEN 'TH-FB' THEN 21.5 WHEN 'TH-ATT' THEN 15.8 ELSE 14 END,
  CASE kt.code WHEN 'TH-COMP' THEN 5 ELSE 4 END
FROM hms_staff s
CROSS JOIN hrms_kpi_templates kt
WHERE s.name = 'Suresh Therapist'
  AND kt.code IN ('TH-COMP', 'TH-FB', 'TH-ATT', 'TH-PUNCT')
ON CONFLICT (employee_id, kpi_template_id, month, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. SAMPLE ANNOUNCEMENTS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_announcements (title, content, category, priority, publish_date, is_published, is_pinned)
VALUES
  ('Independence Day Celebration', 'All staff are invited to the flag hoisting ceremony at 8:30 AM on August 15th at Main Hospital. Refreshments will be served.', 'event', 'high', '2026-08-13', true, true),
  ('New Leave Policy Update', 'Effective September 1st, earned leave carry-forward limit increased to 15 days. Refer updated policy document.', 'policy', 'normal', '2026-08-20', true, true),
  ('Fire Safety Drill — September 15', 'Mandatory fire safety drill for all staff. Attendance is compulsory. Certificate will be issued.', 'general', 'normal', '2026-08-21', true, false),
  ('Employee of the Month — August', 'Congratulations to Suresh Therapist for being selected as Employee of the Month! Outstanding patient feedback and procedure completion.', 'achievement', 'normal', '2026-08-20', true, false),
  ('Salary Credit Notice', 'August 2026 salary will be credited on September 1st. Payslips available on HRMS portal.', 'general', 'low', '2026-08-25', true, false)
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. SAMPLE EMPLOYEE INCENTIVES (August 2026)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 320000, 200000, 160, 12000, 12000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Dr. Arun Sharma' AND ir.code = 'DOC-CONS'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 62, 50, 124, 4000, 4000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Suresh Therapist' AND ir.code = 'THER-PROC'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status)
SELECT s.id, ir.id, 8, 2026, 160000, 100000, 160, 3000, 3000, 'approved'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Vikram R' AND ir.code = 'PHARM-SALE'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

INSERT INTO hrms_employee_incentives (employee_id, incentive_rule_id, month, year, metric_value, target_value, achievement_pct, calculated_amount, approved_amount, status, remarks)
SELECT s.id, ir.id, 8, 2026, 26, 26, 100, 1000, 1000, 'approved', 'Zero absences'
FROM hms_staff s, hrms_incentive_rules ir
WHERE s.name = 'Rajesh K' AND ir.code = 'ATTEND-PERF'
ON CONFLICT (employee_id, incentive_rule_id, month, year) DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. SAMPLE ONBOARDING (for newest employee)
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_onboarding_tasks (employee_id, task_name, category, is_completed, is_mandatory, sort_order)
SELECT s.id, t.task_name, t.category, t.done, true, t.ord
FROM hms_staff s
CROSS JOIN (VALUES
  ('Appointment Letter Issued', 'documents', true, 1),
  ('Employee ID Created', 'access', true, 2),
  ('Aadhaar & PAN Collected', 'documents', true, 3),
  ('Bank Account Details', 'documents', true, 4),
  ('Qualification Certificates', 'documents', true, 5),
  ('HR Orientation', 'orientation', true, 6),
  ('Department Orientation', 'orientation', true, 7),
  ('Policy Acknowledgement', 'compliance', false, 8),
  ('Login Credentials', 'access', true, 9),
  ('Uniform Issued', 'equipment', false, 10),
  ('ID Card Issued', 'equipment', false, 11),
  ('Safety Training', 'training', false, 12),
  ('Probation Goals Set', 'compliance', false, 13)
) AS t(task_name, category, done, ord)
WHERE s.name = 'Anita D'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. SAMPLE VACANCY & CANDIDATE
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_vacancies (title, department, positions, status, priority, posted_date, qualification_required, experience_min)
VALUES
  ('Panchakarma Therapist', 'Panchakarma', 2, 'open', 'high', '2026-08-01', 'Diploma/BSc in Yoga or Naturopathy', 1),
  ('Staff Nurse (IPD)', 'IPD', 1, 'open', 'urgent', '2026-08-10', 'B.Sc Nursing / GNM', 2),
  ('Receptionist', 'Front Office', 1, 'open', 'normal', '2026-08-15', 'Graduate', 0)
ON CONFLICT DO NOTHING;

INSERT INTO hrms_candidates (vacancy_id, name, email, phone, qualification, experience_years, status, source)
SELECT v.id, c.name, c.email, c.phone, c.qual, c.exp, c.status, c.source
FROM hrms_vacancies v
CROSS JOIN (VALUES
  ('Deepa R', 'deepa@email.com', '9876500001', 'Diploma Yoga', 3, 'interview', 'referral'),
  ('Karthik M', 'karthik@email.com', '9876500002', 'BSc Yoga', 2, 'shortlisted', 'portal'),
  ('Priya V', 'priya@email.com', '9876500003', 'BNYS', 1, 'applied', 'website')
) AS c(name, email, phone, qual, exp, status, source)
WHERE v.title = 'Panchakarma Therapist'
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. SAMPLE NOTIFICATIONS
-- ═══════════════════════════════════════════════════════════════════════════════

INSERT INTO hrms_notifications (title, message, category, priority, recipient_role, action_url, source_module)
VALUES
  ('Leave Request Pending', 'Mohan P has applied for 2 days CL (Aug 25-26). Awaiting approval.', 'leave', 'high', 'hr_admin', '/hms/hrms/leave', 'leave'),
  ('Attendance Alert', 'Sunita M absent for 3 consecutive days without leave application.', 'attendance', 'urgent', 'hr_admin', '/hms/hrms/attendance', 'attendance'),
  ('Registration Expiring', 'Dr. Meena Patel TNBIM registration expires Sep 15, 2026.', 'registration_expiry', 'high', 'hr_admin', '/hms/hrms/employees', 'documents'),
  ('Fire Safety Training', 'Mandatory training scheduled Sep 15. 5 staff not registered.', 'training', 'normal', 'hr_admin', '/hms/hrms/training', 'training'),
  ('Probation Ending', 'Mohan P probation ends Sep 1. Confirmation decision needed.', 'probation', 'high', 'hr_admin', '/hms/hrms/employees', 'employees'),
  ('Payroll Lock Date', 'August attendance lock date approaching (25th). Complete corrections.', 'payroll', 'normal', 'hr_admin', '/hms/hrms/payroll', 'payroll')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — Sample data seeded successfully!
-- ═══════════════════════════════════════════════════════════════════════════════
