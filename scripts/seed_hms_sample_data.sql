-- HMS MODULES - SAMPLE DATA (3 records each)
-- Run in Supabase SQL Editor
-- Seeds all MocDoc/Eka tables deployed earlier

-- Helper: get a valid user ID
DO $$
DECLARE _uid UUID;
BEGIN
  SELECT id INTO _uid FROM auth.users LIMIT 1;
  IF _uid IS NULL THEN RAISE EXCEPTION 'No users found'; END IF;
  CREATE TEMP TABLE IF NOT EXISTS _ctx (uid UUID);
  DELETE FROM _ctx;
  INSERT INTO _ctx VALUES (_uid);
END $$;

-- 1. TRIAGE RECORDS
INSERT INTO hms_triage_records (patient_id, blood_pressure_systolic, blood_pressure_diastolic, pulse_rate, temperature, weight, height, chief_complaint, triage_priority, status, captured_by)
SELECT uid, 120, 80, 72, 98.6, 65.5, 165.0, 'Chronic low back pain for 3 months', 'normal', 'captured', uid FROM _ctx
UNION ALL
SELECT uid, 140, 90, 88, 99.2, 78.0, 170.0, 'Knee joint swelling and morning stiffness', 'urgent', 'sent_to_doctor', uid FROM _ctx
UNION ALL
SELECT uid, 110, 70, 66, 98.4, 55.0, 158.0, 'Skin rash on both arms since 2 weeks', 'normal', 'completed', uid FROM _ctx;

-- 2. TRIAGE TEMPLATES
INSERT INTO hms_triage_templates (name, department, specialty, default_questions, is_active, created_by)
SELECT 'Panchakarma Pre-Assessment', 'Panchakarma', 'Kayachikitsa', '[{"q":"Bowel cleared today?"},{"q":"Fasting since?"},{"q":"Any allergies?"}]'::jsonb, true, uid FROM _ctx
UNION ALL
SELECT 'General OPD Vitals', 'OPD', 'General', '[{"q":"Chief complaint?"},{"q":"Duration?"},{"q":"Current medications?"}]'::jsonb, true, uid FROM _ctx
UNION ALL
SELECT 'Emergency Triage', 'Emergency', 'Emergency', '[{"q":"Conscious?"},{"q":"Breathing normal?"},{"q":"Pain scale 1-10?"}]'::jsonb, true, uid FROM _ctx;

-- 3. NO-SHOW RECORDS
INSERT INTO hms_noshow_records (appointment_id, patient_id, doctor_id, original_date, original_time_slot, auto_marked, resolution)
SELECT gen_random_uuid(), uid, uid, CURRENT_DATE - INTERVAL '3 days', '10:00 AM', true, 'rescheduled' FROM _ctx
UNION ALL
SELECT gen_random_uuid(), uid, uid, CURRENT_DATE - INTERVAL '7 days', '02:30 PM', false, 'unresolved' FROM _ctx
UNION ALL
SELECT gen_random_uuid(), uid, uid, CURRENT_DATE - INTERVAL '1 day', '11:00 AM', true, 'waived' FROM _ctx;

-- 4. PATIENT RELIABILITY SCORES
INSERT INTO patient_reliability_scores (patient_id, total_appointments, attended_count, noshow_count, reliability_score, risk_level)
SELECT uid, 12, 10, 2, 83.33, 'low' FROM _ctx
ON CONFLICT (patient_id) DO NOTHING;

-- 5. WARD STORES
INSERT INTO hms_ward_stores (ward_name, department, store_code, store_type, auto_reorder, is_active)
VALUES
('General Ward A', 'Kayachikitsa', 'WS-GEN-A', 'ward', true, true),
('Panchakarma Suite', 'Panchakarma', 'WS-PK-01', 'panchakarma', true, true),
('ICU Store', 'Critical Care', 'WS-ICU-01', 'icu', true, true);

-- 6. WARD STOCK ITEMS (linked to ward stores above)
INSERT INTO hms_ward_stock_items (ward_store_id, product_name, product_category, quantity_available, quantity_unit, min_stock_level, cost_per_unit)
SELECT id, 'Dhanwantharam Taila 500ml', 'Taila', 25, 'bottles', 5, 320.00 FROM hms_ward_stores WHERE store_code = 'WS-PK-01'
UNION ALL
SELECT id, 'Triphala Churna 100g', 'Churna', 50, 'packets', 10, 85.00 FROM hms_ward_stores WHERE store_code = 'WS-GEN-A'
UNION ALL
SELECT id, 'Disposable Gloves (Box)', 'Consumable', 15, 'boxes', 3, 250.00 FROM hms_ward_stores WHERE store_code = 'WS-ICU-01';

-- 7. PATIENT ADVANCES
INSERT INTO hms_patient_advances (patient_id, amount, payment_mode, receipt_number, purpose, status, amount_used)
SELECT uid, 25000.00, 'upi', 'ADV-2025-001', 'ipd_admission', 'partially_used', 8500.00 FROM _ctx
UNION ALL
SELECT uid, 5000.00, 'cash', 'ADV-2025-002', 'ipd_admission', 'active', 0 FROM _ctx
UNION ALL
SELECT uid, 15000.00, 'card', 'ADV-2025-003', 'ipd_admission', 'fully_used', 15000.00 FROM _ctx;

-- 8. PATIENT HEALTH FOLDERS
INSERT INTO patient_health_folders (patient_id, folder_name, folder_type, description, document_count)
SELECT uid, 'Lab Reports 2025', 'lab_reports', 'All lab test reports for this year', 5 FROM _ctx
UNION ALL
SELECT uid, 'Panchakarma Records', 'panchakarma', 'Treatment records from Panchakarma sessions', 3 FROM _ctx
UNION ALL
SELECT uid, 'Insurance Documents', 'insurance', 'Health insurance policies and claims', 2 FROM _ctx;

-- 9. EOD REPORT TEMPLATES
INSERT INTO hms_eod_report_templates (name, report_type, include_sections, is_active, created_by)
SELECT 'Daily Revenue Summary', 'revenue', ARRAY['revenue', 'patient_count', 'pending_bills'], true, uid FROM _ctx
UNION ALL
SELECT 'Patient Flow Report', 'patient_flow', ARRAY['new_patients', 'follow_ups', 'no_shows'], true, uid FROM _ctx
UNION ALL
SELECT 'Pharmacy Sales Report', 'pharmacy_sales', ARRAY['total_sales', 'top_medicines', 'stock_alerts'], true, uid FROM _ctx;

-- 10. SECURITY CONFIG
INSERT INTO hms_security_config (owner_id, ip_whitelist_enabled, auto_logout_minutes, phone_masking_enabled, max_login_attempts)
SELECT uid, false, 30, true, 5 FROM _ctx
ON CONFLICT DO NOTHING;

-- 11. NOTIFICATION LOG
INSERT INTO hms_notification_log (patient_id, patient_name, channel, notification_type, subject, content, status)
SELECT uid, 'Sample Patient', 'whatsapp', 'appointment_reminder', 'Appointment Tomorrow', 'Your appointment with Dr. Sharma is tomorrow at 10:00 AM', 'delivered' FROM _ctx
UNION ALL
SELECT uid, 'Sample Patient', 'sms', 'lab_report_ready', 'Lab Report Ready', 'Your blood test report is ready. Download from app.', 'sent' FROM _ctx
UNION ALL
SELECT uid, 'Sample Patient', 'email', 'prescription_sent', 'Prescription', 'Your prescription has been emailed. Please check.', 'delivered' FROM _ctx;

-- 12. PATIENT CARDS
INSERT INTO hms_patient_cards (patient_id, uhid, card_number, qr_code_data, patient_name, phone, blood_group, card_status)
SELECT uid, 'UHID-AYZ-00001', 'CARD-001', 'ayuzee://patient/00001', 'Demo Patient', '9876543210', 'B+', 'active' FROM _ctx
ON CONFLICT (uhid) DO NOTHING;

-- 13. GEO SEO PAGES
INSERT INTO hms_geo_seo_pages (clinic_name, city, state, slug, page_title, meta_description, status)
VALUES
('Ayuzee Wellness Clinic', 'Bangalore', 'Karnataka', 'ayurveda-clinic-bangalore', 'Best Ayurveda Clinic in Bangalore', 'Top-rated Ayurveda clinic in Bangalore offering Panchakarma and holistic treatments.', 'published'),
('Vedic Health Center', 'Mumbai', 'Maharashtra', 'ayurveda-clinic-mumbai', 'Ayurveda Doctor in Mumbai', 'Experienced BAMS doctors providing authentic Ayurvedic treatments in Mumbai.', 'published'),
('Kerala Ayur Hospital', 'Kochi', 'Kerala', 'ayurveda-hospital-kochi', 'Ayurveda Hospital in Kochi Kerala', 'Traditional Kerala Ayurveda hospital with Panchakarma and rejuvenation therapies.', 'published')
ON CONFLICT (slug) DO NOTHING;

-- 14. QR ATTENDANCE
INSERT INTO hms_qr_attendance (staff_id, staff_name, role, check_in_at, check_out_at, attendance_date, status)
SELECT uid, 'Dr. Demo', 'doctor', NOW() - INTERVAL '8 hours', NOW(), CURRENT_DATE, 'present' FROM _ctx;

-- 15. TREATMENT ESTIMATES
INSERT INTO hms_treatment_estimates (estimate_number, patient_id, patient_name, treatment_description, department, line_items, total_amount, status, created_by)
SELECT 'EST-2025-001', uid, 'Demo Patient', 'Panchakarma 14-day package', 'Panchakarma',
  '[{"item":"Abhyanga 14 sessions","amount":14000},{"item":"Shirodhara 7 sessions","amount":10500},{"item":"Medicines","amount":3500}]'::jsonb,
  28000.00, 'approved', uid FROM _ctx
UNION ALL
SELECT 'EST-2025-002', uid, 'Demo Patient', 'Kati Basti Course - 7 days', 'Panchakarma',
  '[{"item":"Kati Basti x7","amount":7000},{"item":"Oil charges","amount":2100}]'::jsonb,
  9100.00, 'sent_to_patient', uid FROM _ctx
UNION ALL
SELECT 'EST-2025-003', uid, 'Demo Patient', 'Lab Investigation Package', 'Lab',
  '[{"item":"CBC","amount":350},{"item":"LFT","amount":800},{"item":"Lipid Profile","amount":600}]'::jsonb,
  1750.00, 'draft', uid FROM _ctx;

-- 16. LAB CRITICAL ALERTS
INSERT INTO hms_lab_critical_alerts (patient_id, patient_name, test_name, parameter_name, value, unit, normal_min, normal_max, severity, status)
SELECT uid, 'Demo Patient', 'Complete Blood Count', 'Hemoglobin', 7.2, 'g/dL', 12.0, 16.0, 'critical', 'new' FROM _ctx
UNION ALL
SELECT uid, 'Demo Patient', 'Blood Sugar', 'Fasting Glucose', 285.0, 'mg/dL', 70.0, 110.0, 'critical', 'doctor_notified' FROM _ctx
UNION ALL
SELECT uid, 'Demo Patient', 'Lipid Profile', 'LDL Cholesterol', 195.0, 'mg/dL', 0.0, 130.0, 'abnormal_high', 'acknowledged' FROM _ctx;

-- 17. PARSED MEDICAL DOCUMENTS (Eka feature)
INSERT INTO parsed_medical_documents (patient_id, original_file_name, file_url, file_type, document_type, parse_status, extracted_data)
SELECT uid, 'blood_report_jan2025.pdf', '/uploads/demo/blood_report.pdf', 'pdf', 'lab_report', 'parsed',
  '{"test_name":"CBC","parameters":[{"name":"Hb","value":"13.2","unit":"g/dL"},{"name":"WBC","value":"7500","unit":"/cumm"}]}'::jsonb FROM _ctx
UNION ALL
SELECT uid, 'prescription_dr_sharma.jpg', '/uploads/demo/rx_sharma.jpg', 'image', 'prescription', 'parsed',
  '{"doctor":"Dr. Sharma","medicines":[{"name":"Triphala Churna","dose":"5g","frequency":"BD"}]}'::jsonb FROM _ctx
UNION ALL
SELECT uid, 'discharge_summary.pdf', '/uploads/demo/discharge.pdf', 'pdf', 'discharge_summary', 'processing',
  '{}'::jsonb FROM _ctx;

-- 18. BRIDGE REFERRAL NETWORK
INSERT INTO bridge_referral_network (patient_id, referring_doctor_id, referring_clinic_name, referred_to_clinic_name, referred_to_specialty, referral_reason, urgency, status)
SELECT uid, uid, 'Ayuzee Wellness Clinic', 'Kerala Ayur Hospital', 'Panchakarma', 'Needs intensive 21-day Panchakarma for chronic arthritis', 'routine', 'initiated' FROM _ctx
UNION ALL
SELECT uid, uid, 'Vedic Health Center', 'City Diagnostic Lab', 'Laboratory', 'MRI Lumbar Spine required', 'urgent', 'appointment_booked' FROM _ctx;

-- 19. BRIDGE PHARMACY FULFILLMENT
INSERT INTO bridge_pharmacy_fulfillment (patient_id, doctor_id, clinic_name, medicines, fulfillment_mode, status)
SELECT uid, uid, 'Ayuzee Wellness Clinic',
  '[{"name":"Yogaraja Guggulu","qty":"60 tabs"},{"name":"Rasnasaptak Kashaya","qty":"450ml"},{"name":"Dhanwantharam Taila","qty":"200ml"}]'::jsonb,
  'clinic_pharmacy', 'ready' FROM _ctx
UNION ALL
SELECT uid, uid, 'Vedic Health Center',
  '[{"name":"Triphala Churna","qty":"200g"},{"name":"Ashwagandha Capsules","qty":"60 caps"}]'::jsonb,
  'ayuzee_delivery', 'order_placed' FROM _ctx;

-- 20. BRIDGE INSURANCE PREAUTH
INSERT INTO bridge_insurance_preauth (patient_id, insurance_provider, policy_number, estimated_amount, procedures_planned, status)
SELECT uid, 'Star Health Insurance', 'SH-2024-98765', 45000.00, ARRAY['Panchakarma 14 days', 'Lab investigations'], 'approved' FROM _ctx
UNION ALL
SELECT uid, 'ICICI Lombard', 'IL-2025-12345', 15000.00, ARRAY['Kati Basti x7', 'Physiotherapy'], 'under_review' FROM _ctx;

-- CLEANUP temp table
DROP TABLE IF EXISTS _ctx;

-- DONE! HMS sample data seeded.
