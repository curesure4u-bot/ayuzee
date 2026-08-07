-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — Seed Data for New Modules
-- Run AFTER create_hms_new_modules.sql
-- Provides demo data for: Radiology, Teleconsult, Online Booking, Feedback,
--                          Shift Roster, Maintenance
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. RADIOLOGY ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_radiology_orders (patient_name, uhid, investigation, modality, ordered_by, ordered_date, scheduled_time, priority, status, clinical_indication, report, reported_by) VALUES
('Ramesh Kumar', 'UH-4521', 'X-Ray Knee (AP/Lateral)', 'X-Ray', 'Dr. Sharma', CURRENT_DATE, '10:30 AM', 'routine', 'completed', 'Bilateral knee pain, suspected OA', 'Mild joint space narrowing with osteophytes bilateral knee. Features of Grade 2 OA.', 'Dr. Rao'),
('Lakshmi Devi', 'UH-3892', 'MRI Lumbar Spine', 'MRI', 'Dr. Nair', CURRENT_DATE, '11:00 AM', 'urgent', 'scheduled', 'Low back pain with radiculopathy', NULL, NULL),
('Sunil Menon', 'UH-5120', 'Ultrasound Abdomen', 'USG', 'Dr. Sharma', CURRENT_DATE - 1, '09:45 AM', 'routine', 'reported', 'Epigastric discomfort', 'Mild hepatomegaly. No focal lesion. Mildly dilated CBD.', 'Dr. Gupta'),
('Meera Nair', 'UH-2987', 'X-Ray Cervical Spine', 'X-Ray', 'Dr. Nair', CURRENT_DATE, '11:15 AM', 'routine', 'ordered', 'Neck pain and stiffness', NULL, NULL),
('Anil Krishnan', 'UH-6034', 'DEXA Scan', 'DEXA', 'Dr. Nair', CURRENT_DATE, '11:30 AM', 'routine', 'ordered', 'Post-menopausal bone health screening', NULL, NULL),
('Priya Mohan', 'UH-4456', 'CT Abdomen', 'CT', 'Dr. Sharma', CURRENT_DATE, '11:45 AM', 'emergency', 'in-progress', 'Acute abdomen, r/o obstruction', NULL, NULL),
('Vijay Nambiar', 'UH-7891', '2D Echocardiography', 'Echo', 'Dr. Patel', CURRENT_DATE - 1, '02:00 PM', 'urgent', 'completed', 'Dyspnea on exertion, murmur detected', NULL, NULL);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. TELECONSULT SESSIONS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_teleconsult_sessions (patient_name, phone, doctor_name, scheduled_at, duration, consult_type, status, payment_status, notes) VALUES
('Priya Menon (Dubai)', '+971-50-1234567', 'Dr. Arun Sharma', NOW() + interval '1 hour', NULL, 'International Follow-up', 'waiting', '₹800 (Paid)', ''),
('Rahul Kumar (Bangalore)', '+91-9876500020', 'Dr. Arun Sharma', NOW() + interval '2 hours', NULL, 'New Consultation', 'scheduled', '₹500 (Paid)', ''),
('Ananya S. (Chennai)', '+91-9876500021', 'Dr. Meena Patel', NOW() + interval '3 hours', NULL, 'Panchakarma Review', 'scheduled', '₹400 (Paid)', ''),
('Mohammed F. (Muscat)', '+968-9876-5432', 'Dr. Arun Sharma', NOW() - interval '2 hours', '18 min', 'Follow-up', 'completed', '₹800 (Paid)', 'Medicines continued. Advised local Panchakarma center.'),
('Lakshmi Nair (Mumbai)', '+91-9876500022', 'Dr. Priya Das', NOW() - interval '3 hours', '22 min', 'New Consultation', 'completed', '₹500 (Paid)', 'Homeopathy case taken. Arsenicum Album 30C prescribed.'),
('David Thomas (USA)', '+1-408-555-1234', 'Dr. Arun Sharma', NOW() - interval '5 hours', NULL, 'International New', 'no_show', '₹1200 (Paid)', 'Patient did not join. WhatsApp sent.');

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. ONLINE BOOKINGS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_online_bookings (patient_name, phone, doctor_name, department, date, time_slot, booking_type, payment_status, payment_amount, payment_method, status, source) VALUES
('Priya Menon', '+91-9876500010', 'Dr. Arun Sharma', 'Ayurveda', CURRENT_DATE, '10:00 AM', 'New Visit', 'Paid ₹500 (UPI)', 500, 'UPI', 'confirmed', 'website'),
('Rahul Kumar', '+91-9876500011', 'Dr. Meena Patel', 'Panchakarma', CURRENT_DATE, '11:30 AM', 'Follow-up', 'Paid ₹300 (UPI)', 300, 'UPI', 'confirmed', 'whatsapp'),
('Ananya S.', '+91-9876500012', 'Dr. Arun Sharma', 'Ayurveda', CURRENT_DATE, '02:00 PM', 'Teleconsult', 'Pending', NULL, NULL, 'pending_payment', 'website'),
('Mohammed F.', '+91-9876500013', 'Dr. Priya Das', 'Homeopathy', CURRENT_DATE + 1, '09:30 AM', 'New Visit', 'Paid ₹400 (Card)', 400, 'Card', 'confirmed', 'google'),
('Lakshmi Nair', '+91-9876500014', 'Dr. Arun Sharma', 'Ayurveda', CURRENT_DATE - 1, '04:00 PM', 'Follow-up', 'Paid ₹300 (UPI)', 300, 'UPI', 'completed', 'website');

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. PATIENT FEEDBACK
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_patient_feedback (patient_name, doctor_name, date, rating, nps_score, comment, sentiment, category, status, google_review, department) VALUES
('Priya Menon', 'Dr. Arun Sharma', CURRENT_DATE, 5, 10, 'Excellent treatment. My knee pain reduced significantly after Janu Basti. Very caring staff.', 'positive', 'Treatment', 'acknowledged', true, 'Panchakarma'),
('Rahul Kumar', 'Dr. Meena Patel', CURRENT_DATE, 4, 8, 'Good Panchakarma experience. Food could be better during Samsarjana.', 'positive', 'Panchakarma', 'new', false, 'Panchakarma'),
('Ananya S.', 'Dr. Arun Sharma', CURRENT_DATE - 1, 5, 9, 'Doctor explained everything in detail. AI Scribe made the consultation smooth.', 'positive', 'Consultation', 'acknowledged', true, 'Ayurveda'),
('Mohammed F.', 'Dr. Priya Das', CURRENT_DATE - 1, 3, 5, 'Long waiting time in OPD. Treatment was good but reception was slow.', 'neutral', 'Waiting Time', 'resolved', false, 'Homeopathy'),
('Suresh M.', 'Dr. Arun Sharma', CURRENT_DATE - 2, 2, 3, 'Medicine was not available in pharmacy. Had to buy from outside.', 'negative', 'Pharmacy', 'resolved', false, 'Ayurveda'),
('Kavitha R.', 'Dr. Meena Patel', CURRENT_DATE - 2, 5, 10, 'Best Ayurveda hospital! Shirodhara was life-changing for my insomnia.', 'positive', 'Panchakarma', 'acknowledged', true, 'Panchakarma'),
('Lakshmi Nair', 'Dr. Arun Sharma', CURRENT_DATE - 3, 4, 8, 'Good follow-up system. WhatsApp reminders are very helpful.', 'positive', 'Follow-up', 'new', false, 'Ayurveda');

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SHIFT ROSTER (Current week starting Monday)
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_shift_roster (staff_name, role, department, week_start, mon, tue, wed, thu, fri, sat, sun) VALUES
('Nurse Priya', 'Nurse', 'IPD', date_trunc('week', CURRENT_DATE)::date, 'M', 'M', 'M', 'A', 'A', 'A', 'O'),
('Nurse Anu', 'Nurse', 'IPD', date_trunc('week', CURRENT_DATE)::date, 'A', 'A', 'A', 'M', 'M', 'M', 'O'),
('Nurse Kavitha', 'Nurse', 'Panchakarma', date_trunc('week', CURRENT_DATE)::date, 'M', 'M', 'M', 'M', 'M', 'M', 'O'),
('Suresh Therapist', 'Therapist', 'Panchakarma', date_trunc('week', CURRENT_DATE)::date, 'G', 'G', 'G', 'G', 'G', 'G', 'O'),
('Priya Therapist', 'Therapist', 'Panchakarma', date_trunc('week', CURRENT_DATE)::date, 'G', 'G', 'G', 'G', 'G', 'O', 'O'),
('Rajesh K', 'Receptionist', 'Front Office', date_trunc('week', CURRENT_DATE)::date, 'G', 'G', 'G', 'G', 'G', 'G', 'O'),
('Vikram R', 'Pharmacist', 'Pharmacy', date_trunc('week', CURRENT_DATE)::date, 'M', 'M', 'M', 'A', 'A', 'M', 'O'),
('Anita D', 'Lab Tech', 'Laboratory', date_trunc('week', CURRENT_DATE)::date, 'M', 'M', 'M', 'M', 'M', 'M', 'O'),
('Night Nurse Sita', 'Nurse', 'IPD', date_trunc('week', CURRENT_DATE)::date, 'N', 'N', 'N', 'O', 'O', 'N', 'N');

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MAINTENANCE JOBS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_maintenance_jobs (job_no, title, department, location_detail, priority, reported_by, assigned_to, due_date, status, job_type) VALUES
('MNT-0234', 'AC not cooling - PK Room 2', 'Panchakarma', 'Block B, PK-2', 'high', 'Nurse Kavitha', 'Rajesh (Electrician)', CURRENT_DATE, 'in_progress', 'corrective'),
('MNT-0233', 'Shirodhara pot stand loose bolt', 'Panchakarma', 'Block B, PK-1', 'medium', 'Therapist Suresh', 'Mohan (Fitter)', CURRENT_DATE, 'open', 'corrective'),
('MNT-0232', 'Water heater not working - Room 201', 'IPD', '2nd Floor, Room 201', 'high', 'Front Office', 'Rajesh (Electrician)', CURRENT_DATE - 1, 'overdue', 'corrective'),
('MNT-0231', 'Monthly generator service', 'Admin', 'Generator Room', 'medium', 'System (Auto)', 'External Vendor', CURRENT_DATE + 13, 'open', 'periodic'),
('MNT-0230', 'Fire extinguisher refill (Block A)', 'Safety', 'All floors - Block A', 'medium', 'System (Auto)', 'Fire Safety Co.', CURRENT_DATE + 24, 'in_progress', 'periodic'),
('MNT-0229', 'Plumbing leak fixed - Kitchen', 'Kitchen', 'Ground Floor Kitchen', 'high', 'Kitchen Manager', 'Vijay (Plumber)', CURRENT_DATE - 2, 'completed', 'corrective');

-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — 6 tables seeded with realistic AYUSH hospital data
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. AMBULANCE VEHICLES
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_ambulance_vehicles (vehicle_number, vehicle_type, driver_name, driver_phone, status, current_location) VALUES
('KL-01-AB-1234', 'Advanced Life Support', 'Rajan K', '9876500001', 'available', 'Hospital Parking'),
('KL-01-CD-5678', 'Basic Life Support', 'Suresh M', '9876500002', 'on_trip', 'En-route to Varkala'),
('KL-01-EF-9012', 'Patient Transport', 'Mohan R', '9876500003', 'available', 'Hospital Parking'),
('KL-01-GH-3456', 'Basic Life Support', 'Vijay S', '9876500004', 'maintenance', 'Service Center');

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. AMBULANCE TRIPS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_ambulance_trips (vehicle_number, patient_name, pickup_location, destination, urgency, status, dispatch_time) VALUES
('KL-01-CD-5678', 'Emergency Call #415', 'Varkala Junction', 'Ayuzee Main Hospital', 'emergency', 'dispatched', NOW() - interval '30 minutes'),
('KL-01-AB-1234', 'Ramesh Kumar', 'Ayuzee Hospital', 'SRL Diagnostics Lab', 'routine', 'completed', NOW() - interval '3 hours'),
('KL-01-EF-9012', 'Lakshmi Devi', 'Residence - Kowdiar', 'Ayuzee Hospital', 'scheduled', 'completed', NOW() - interval '4 hours');

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. DIET KITCHEN ORDERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_diet_orders (patient_name, ward, bed, diet_type, meal, meal_time, special_instructions, status) VALUES
('Ramesh Kumar', 'General', 'Bed 3', 'Samsarjana Krama (Day 2)', 'Breakfast', '07:30', 'Only Peya (rice gruel). No salt, no oil.', 'delivered'),
('Ramesh Kumar', 'General', 'Bed 3', 'Samsarjana Krama (Day 2)', 'Lunch', '12:30', 'Vilepi (thick gruel). Minimal salt.', 'preparing'),
('Meera Nair', 'PK Suite', 'Suite 2', 'Snehapana Diet', 'Lunch', 'After digestion', 'NO food until hunger returns. Warm water only.', 'pending'),
('Sunil Menon', 'General', 'Bed 5', 'Normal Pathya', 'Breakfast', '08:00', 'Warm food. Avoid curd. Include ginger.', 'delivered'),
('Sunil Menon', 'General', 'Bed 5', 'Normal Pathya', 'Lunch', '12:30', 'Rice + dal + warm vegetables. No cold items.', 'ready');

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. REFERRALS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_referrals (patient_name, referred_by, referrer_type, referred_to, department, status, commission, notes) VALUES
('Priya Menon', 'Dr. Ravi (Apollo Hospital)', 'External Doctor', 'Dr. Arun Sharma', 'Panchakarma', 'consulted', 500, 'Referred for Janu Basti - OA Knee'),
('Rahul Kumar', 'Patient: Ramesh Kumar', 'Patient Referral', 'Dr. Meena Patel', 'Panchakarma', 'converted', 300, 'Friend referral. Booked 14-day package.'),
('Lakshmi Nair', 'Partner: Kerala Tourism', 'Corporate/Partner', 'Dr. Meena Patel', 'Panchakarma', 'converted', 2000, 'Wellness tourism package'),
('Suresh T.', 'Dr. Mohan (PHC Attingal)', 'External Doctor', 'Dr. Arun Sharma', 'Ayurveda', 'pending', 500, 'Chronic back pain referral');

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. LOYALTY MEMBERS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_loyalty_members (patient_name, tier, points, total_spent, visits, join_date, next_reward) VALUES
('Ramesh Kumar', 'platinum', 4500, 185000, 28, '2024-06-01', 'Free Abhyanga session'),
('Lakshmi Devi', 'gold', 2200, 85000, 15, '2025-01-15', '10% off next package'),
('Priya Menon', 'gold', 1800, 72000, 12, '2025-03-20', 'Free consultation'),
('Sunil Menon', 'silver', 900, 35000, 8, '2025-08-01', '5% off medicines'),
('Kavitha R.', 'platinum', 5200, 220000, 35, '2023-11-01', 'Complimentary health checkup');

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. INSURANCE CLAIMS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_insurance_claims (patient_name, insurer, policy_no, claim_amount, approved_amount, submitted_date, status, notes) VALUES
('Ramesh Kumar', 'Star Health', 'SH-2024-87654', 85000, 72000, '2026-07-20', 'settled', 'Lumbar Disc Bulge - Panchakarma. TPA: Medi Assist'),
('Lakshmi Devi', 'ICICI Lombard', 'IL-2025-12345', 45000, 0, CURRENT_DATE - 2, 'under_review', 'Rheumatoid Arthritis - IP Treatment. TPA: Paramount'),
('Sunil Menon', 'New India Assurance', 'NI-2024-55678', 35000, 35000, '2026-07-28', 'approved', 'Acute Sciatica. TPA: Vidal Health'),
('Meera Nair', 'AYUSH Health Card (Govt)', 'AYUSH-KL-9876', 25000, 0, CURRENT_DATE - 1, 'submitted', 'Cervical Spondylosis - PK. TPA: Govt Direct');

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. BLOOD BANK STOCK
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_blood_stock (blood_group, component, units, expiry_date) VALUES
('A+', 'Whole Blood', 8, CURRENT_DATE + 13),
('A-', 'FFP', 4, CURRENT_DATE + 34),
('B+', 'Whole Blood', 12, CURRENT_DATE + 11),
('B-', 'Platelets', 1, CURRENT_DATE + 2),
('AB+', 'Whole Blood', 3, CURRENT_DATE + 15),
('AB-', 'Whole Blood', 0, NULL),
('O+', 'Whole Blood', 6, CURRENT_DATE + 8),
('O-', 'Packed RBC', 2, CURRENT_DATE + 5);

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. BLOOD BANK REQUESTS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_blood_requests (patient_name, blood_group, component, units, requested_by, urgency, status) VALUES
('Ramesh Kumar (IP-14)', 'B+', 'Whole Blood', 2, 'Dr. Sharma', 'routine', 'approved'),
('Emergency (ER-22)', 'O-', 'Packed RBC', 3, 'Dr. Nair', 'emergency', 'pending'),
('Lakshmi Devi (IP-18)', 'A+', 'FFP', 2, 'Dr. Patel', 'urgent', 'issued');

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. MARKETING CAMPAIGNS
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO hms_marketing_campaigns (name, channel, audience, sent_count, open_rate, conversion_rate, start_date, status, revenue) VALUES
('Monsoon PK Offer', 'WhatsApp', 'Previous PK patients', 450, 72, 12, CURRENT_DATE - 6, 'active', 180000),
('Spine Care Awareness', 'SMS + WhatsApp', 'Back pain patients', 320, 65, 8, CURRENT_DATE - 13, 'completed', 95000),
('Follow-up Reminder (30-day)', 'WhatsApp Auto', 'All OP 30 days ago', 180, 85, 22, CURRENT_DATE - 2, 'active', 42000),
('Google Ads - Panchakarma', 'Google Ads', 'Search intent', 0, 0, 4, CURRENT_DATE - 23, 'active', 65000),
('Diwali Wellness Package', 'Email + WhatsApp', 'All registered', 0, 0, 0, '2026-10-15', 'scheduled', 0);
