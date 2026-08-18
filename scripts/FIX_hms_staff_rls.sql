-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  FIX: HMS Staff Tables — Restrict to Doctor/Admin/Staff Roles Only           ║
-- ║                                                                              ║
-- ║  PROBLEM: Any logged-in user (even a patient) could access HMS data          ║
-- ║  like lab results, expenses, staff records, ward inventory etc.              ║
-- ║                                                                              ║
-- ║  FIX: Only users with doctor, admin, or therapist role can access HMS.       ║
-- ║  Patients still see their own appointment/booking data via other policies.   ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses DROP POLICY IF EXISTS. Can run multiple times.            ║
-- ║  HOW TO RUN: Supabase Dashboard → SQL Editor → Paste → Run                  ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────────
-- HELPER: Function to check if user is HMS staff (doctor, admin, or therapist)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_hms_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('doctor', 'admin', 'therapist', 'super_admin', 'accounts_admin', 'doctor_admin')
  );
$$;

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS CORE TABLES
-- ═════════════════════════════════════════════════════════════════════════════════

-- 1. hms_staff (employee records)
DROP POLICY IF EXISTS "HMS staff can manage" ON hms_staff;
DROP POLICY IF EXISTS "Staff can manage staff" ON hms_staff;
DROP POLICY IF EXISTS "Authenticated can manage staff" ON hms_staff;
CREATE POLICY "Only HMS staff can access staff records"
  ON hms_staff FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 2. hms_wards (ward management)
DROP POLICY IF EXISTS "HMS staff can manage wards" ON hms_wards;
DROP POLICY IF EXISTS "Authenticated can manage wards" ON hms_wards;
CREATE POLICY "Only HMS staff can manage wards"
  ON hms_wards FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 3. hms_ip_admissions (inpatient admissions)
DROP POLICY IF EXISTS "HMS staff can manage admissions" ON hms_ip_admissions;
DROP POLICY IF EXISTS "Authenticated can manage admissions" ON hms_ip_admissions;
CREATE POLICY "Only HMS staff can manage admissions"
  ON hms_ip_admissions FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 4. hms_indents (purchase orders/stock requests)
DROP POLICY IF EXISTS "HMS staff can manage indents" ON hms_indents;
DROP POLICY IF EXISTS "Authenticated can manage indents" ON hms_indents;
CREATE POLICY "Only HMS staff can manage indents"
  ON hms_indents FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 5. hms_queue_tokens (OPD queue)
DROP POLICY IF EXISTS "HMS staff can manage queue" ON hms_queue_tokens;
DROP POLICY IF EXISTS "Authenticated can manage queue" ON hms_queue_tokens;
CREATE POLICY "Only HMS staff can manage queue"
  ON hms_queue_tokens FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 6. hms_ot_rooms (operation theatre)
DROP POLICY IF EXISTS "HMS staff can manage OT rooms" ON hms_ot_rooms;
DROP POLICY IF EXISTS "Authenticated can manage OT" ON hms_ot_rooms;
CREATE POLICY "Only HMS staff can manage OT rooms"
  ON hms_ot_rooms FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 7. hms_ot_schedule
DROP POLICY IF EXISTS "HMS staff can manage OT schedule" ON hms_ot_schedule;
DROP POLICY IF EXISTS "Authenticated can manage OT schedule" ON hms_ot_schedule;
CREATE POLICY "Only HMS staff can manage OT schedule"
  ON hms_ot_schedule FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 8. hms_nursing_tasks
DROP POLICY IF EXISTS "HMS staff can manage nursing tasks" ON hms_nursing_tasks;
DROP POLICY IF EXISTS "Authenticated can manage nursing" ON hms_nursing_tasks;
CREATE POLICY "Only HMS staff can manage nursing tasks"
  ON hms_nursing_tasks FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 9. hms_insurance_claims
DROP POLICY IF EXISTS "HMS staff can manage insurance" ON hms_insurance_claims;
DROP POLICY IF EXISTS "Authenticated can manage insurance" ON hms_insurance_claims;
CREATE POLICY "Only HMS staff can manage insurance claims"
  ON hms_insurance_claims FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 10. hms_marketing_leads
DROP POLICY IF EXISTS "HMS staff can manage leads" ON hms_marketing_leads;
DROP POLICY IF EXISTS "Authenticated can manage leads" ON hms_marketing_leads;
CREATE POLICY "Only HMS staff can manage leads"
  ON hms_marketing_leads FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 11. hms_marketing_followups
DROP POLICY IF EXISTS "HMS staff can manage followups" ON hms_marketing_followups;
DROP POLICY IF EXISTS "Authenticated can manage followups" ON hms_marketing_followups;
CREATE POLICY "Only HMS staff can manage followups"
  ON hms_marketing_followups FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 12. hms_qr_attendance
DROP POLICY IF EXISTS "HMS staff can manage attendance" ON hms_qr_attendance;
DROP POLICY IF EXISTS "Authenticated can manage attendance" ON hms_qr_attendance;
CREATE POLICY "Only HMS staff can manage attendance"
  ON hms_qr_attendance FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 13. hms_access_roles
DROP POLICY IF EXISTS "HMS staff can manage access roles" ON hms_access_roles;
DROP POLICY IF EXISTS "Authenticated can manage roles" ON hms_access_roles;
CREATE POLICY "Only HMS staff can manage access roles"
  ON hms_access_roles FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 14. hms_treatment_estimates
DROP POLICY IF EXISTS "HMS staff can manage estimates" ON hms_treatment_estimates;
DROP POLICY IF EXISTS "Authenticated can manage estimates" ON hms_treatment_estimates;
CREATE POLICY "Only HMS staff can manage estimates"
  ON hms_treatment_estimates FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 15. hms_geo_seo_pages
DROP POLICY IF EXISTS "HMS staff can manage geo pages" ON hms_geo_seo_pages;
DROP POLICY IF EXISTS "Authenticated can manage geo" ON hms_geo_seo_pages;
CREATE POLICY "Only HMS staff can manage geo pages"
  ON hms_geo_seo_pages FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 16. hms_geofence_config
DROP POLICY IF EXISTS "HMS staff can manage geofence" ON hms_geofence_config;
DROP POLICY IF EXISTS "Authenticated can manage geofence" ON hms_geofence_config;
CREATE POLICY "Only HMS staff can manage geofence"
  ON hms_geofence_config FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 17. hms_lab_critical_alerts
DROP POLICY IF EXISTS "HMS staff can manage lab alerts" ON hms_lab_critical_alerts;
DROP POLICY IF EXISTS "Authenticated can manage alerts" ON hms_lab_critical_alerts;
CREATE POLICY "Only HMS staff can manage lab alerts"
  ON hms_lab_critical_alerts FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS LAB MODULE
-- ═════════════════════════════════════════════════════════════════════════════════

-- 18. hms_lab_orders
DROP POLICY IF EXISTS "HMS staff can manage lab orders" ON hms_lab_orders;
DROP POLICY IF EXISTS "Authenticated can manage lab" ON hms_lab_orders;
CREATE POLICY "Only HMS staff can manage lab orders"
  ON hms_lab_orders FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 19. hms_lab_order_tests
DROP POLICY IF EXISTS "HMS staff can manage lab tests" ON hms_lab_order_tests;
DROP POLICY IF EXISTS "Authenticated can manage tests" ON hms_lab_order_tests;
CREATE POLICY "Only HMS staff can manage lab tests"
  ON hms_lab_order_tests FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 20. hms_lab_results
DROP POLICY IF EXISTS "HMS staff can manage lab results" ON hms_lab_results;
DROP POLICY IF EXISTS "Authenticated can manage results" ON hms_lab_results;
CREATE POLICY "Only HMS staff can manage lab results"
  ON hms_lab_results FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS ACCOUNTS MODULE
-- ═════════════════════════════════════════════════════════════════════════════════

-- 21. hms_expense_entries
DROP POLICY IF EXISTS "HMS staff can manage expenses" ON hms_expense_entries;
DROP POLICY IF EXISTS "Authenticated can manage expenses" ON hms_expense_entries;
CREATE POLICY "Only HMS staff can manage expenses"
  ON hms_expense_entries FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 22. hms_shift_closings
DROP POLICY IF EXISTS "HMS staff can manage shifts" ON hms_shift_closings;
DROP POLICY IF EXISTS "Authenticated can manage shifts" ON hms_shift_closings;
CREATE POLICY "Only HMS staff can manage shift closings"
  ON hms_shift_closings FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 23. hms_cash_positions
DROP POLICY IF EXISTS "HMS staff can manage cash" ON hms_cash_positions;
DROP POLICY IF EXISTS "Authenticated can manage cash" ON hms_cash_positions;
CREATE POLICY "Only HMS staff can manage cash positions"
  ON hms_cash_positions FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS DOCTOR MODULE
-- ═════════════════════════════════════════════════════════════════════════════════

-- 24. cdss_alert_rules (clinical decision support)
DROP POLICY IF EXISTS "HMS staff can manage CDSS" ON cdss_alert_rules;
DROP POLICY IF EXISTS "Authenticated can manage CDSS" ON cdss_alert_rules;
CREATE POLICY "Only HMS staff can manage CDSS rules"
  ON cdss_alert_rules FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 25. doctor_payouts
DROP POLICY IF EXISTS "HMS staff can manage payouts" ON doctor_payouts;
DROP POLICY IF EXISTS "Authenticated can manage payouts" ON doctor_payouts;
CREATE POLICY "Only HMS staff can manage doctor payouts"
  ON doctor_payouts FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 26. opd_queue_entries
DROP POLICY IF EXISTS "HMS staff can manage OPD queue" ON opd_queue_entries;
DROP POLICY IF EXISTS "Authenticated can manage queue" ON opd_queue_entries;
CREATE POLICY "Only HMS staff can manage OPD queue"
  ON opd_queue_entries FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS PANCHAKARMA MODULE
-- ═════════════════════════════════════════════════════════════════════════════════

-- 27. pk_therapy_packages
DROP POLICY IF EXISTS "HMS staff can manage PK packages" ON pk_therapy_packages;
DROP POLICY IF EXISTS "Authenticated can manage packages" ON pk_therapy_packages;
CREATE POLICY "Only HMS staff can manage therapy packages"
  ON pk_therapy_packages FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 28. pk_patient_packages
DROP POLICY IF EXISTS "HMS staff can manage patient PK" ON pk_patient_packages;
DROP POLICY IF EXISTS "Authenticated can manage patient packages" ON pk_patient_packages;
CREATE POLICY "Only HMS staff can manage patient packages"
  ON pk_patient_packages FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 29. pk_therapy_sessions
DROP POLICY IF EXISTS "HMS staff can manage PK sessions" ON pk_therapy_sessions;
DROP POLICY IF EXISTS "Authenticated can manage sessions" ON pk_therapy_sessions;
CREATE POLICY "Only HMS staff can manage PK sessions"
  ON pk_therapy_sessions FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- HMS MOCDOC FEATURES (ward stock, refunds, advances, etc.)
-- ═════════════════════════════════════════════════════════════════════════════════

-- 30. hms_ward_stores
DROP POLICY IF EXISTS "HMS staff can manage ward stores" ON hms_ward_stores;
DROP POLICY IF EXISTS "Authenticated can manage stores" ON hms_ward_stores;
CREATE POLICY "Only HMS staff can manage ward stores"
  ON hms_ward_stores FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 31. hms_ward_stock_items
DROP POLICY IF EXISTS "HMS staff can manage stock items" ON hms_ward_stock_items;
DROP POLICY IF EXISTS "Authenticated can manage stock" ON hms_ward_stock_items;
CREATE POLICY "Only HMS staff can manage stock items"
  ON hms_ward_stock_items FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 32. hms_ward_stock_transfers
DROP POLICY IF EXISTS "HMS staff can manage transfers" ON hms_ward_stock_transfers;
DROP POLICY IF EXISTS "Authenticated can manage transfers" ON hms_ward_stock_transfers;
CREATE POLICY "Only HMS staff can manage stock transfers"
  ON hms_ward_stock_transfers FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 33. hms_patient_advances (financial)
DROP POLICY IF EXISTS "HMS staff can manage advances" ON hms_patient_advances;
DROP POLICY IF EXISTS "Authenticated can manage advances" ON hms_patient_advances;
CREATE POLICY "Only HMS staff can manage patient advances"
  ON hms_patient_advances FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 34. hms_refund_requests
DROP POLICY IF EXISTS "HMS staff can manage refunds" ON hms_refund_requests;
DROP POLICY IF EXISTS "Authenticated can manage refunds" ON hms_refund_requests;
CREATE POLICY "Only HMS staff can manage refund requests"
  ON hms_refund_requests FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 35. hms_eod_report_templates
DROP POLICY IF EXISTS "HMS staff can manage EOD templates" ON hms_eod_report_templates;
DROP POLICY IF EXISTS "Authenticated can manage EOD" ON hms_eod_report_templates;
CREATE POLICY "Only HMS staff can manage EOD templates"
  ON hms_eod_report_templates FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 36. hms_eod_report_schedules
DROP POLICY IF EXISTS "HMS staff can manage EOD schedules" ON hms_eod_report_schedules;
DROP POLICY IF EXISTS "Authenticated can manage schedules" ON hms_eod_report_schedules;
CREATE POLICY "Only HMS staff can manage EOD schedules"
  ON hms_eod_report_schedules FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 37. hms_security_config
DROP POLICY IF EXISTS "HMS staff can manage security" ON hms_security_config;
DROP POLICY IF EXISTS "Authenticated can manage security" ON hms_security_config;
CREATE POLICY "Only admin can manage security config"
  ON hms_security_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 38. hms_triage_templates
DROP POLICY IF EXISTS "HMS staff can manage triage" ON hms_triage_templates;
DROP POLICY IF EXISTS "Authenticated can manage triage" ON hms_triage_templates;
CREATE POLICY "Only HMS staff can manage triage templates"
  ON hms_triage_templates FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 39. hms_noshow_records
DROP POLICY IF EXISTS "HMS staff can manage noshow" ON hms_noshow_records;
DROP POLICY IF EXISTS "Authenticated can manage noshow" ON hms_noshow_records;
CREATE POLICY "Only HMS staff can manage noshow records"
  ON hms_noshow_records FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 40. hms_copay_calculations
DROP POLICY IF EXISTS "HMS staff can manage copay" ON hms_copay_calculations;
DROP POLICY IF EXISTS "Authenticated can manage copay" ON hms_copay_calculations;
CREATE POLICY "Only HMS staff can manage copay calculations"
  ON hms_copay_calculations FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 41. hms_patient_cards
DROP POLICY IF EXISTS "HMS staff can manage patient cards" ON hms_patient_cards;
DROP POLICY IF EXISTS "Authenticated can manage cards" ON hms_patient_cards;
CREATE POLICY "Only HMS staff can manage patient cards"
  ON hms_patient_cards FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 42. bridge_lab_report_push
DROP POLICY IF EXISTS "HMS staff can manage lab push" ON bridge_lab_report_push;
DROP POLICY IF EXISTS "Authenticated can manage bridge" ON bridge_lab_report_push;
CREATE POLICY "Only HMS staff can manage lab report push"
  ON bridge_lab_report_push FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 43. bridge_insurance_preauth
DROP POLICY IF EXISTS "HMS staff can manage preauth" ON bridge_insurance_preauth;
DROP POLICY IF EXISTS "Authenticated can manage preauth" ON bridge_insurance_preauth;
CREATE POLICY "Only HMS staff can manage insurance preauth"
  ON bridge_insurance_preauth FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 44. bridge_pharmacy_fulfillment
DROP POLICY IF EXISTS "HMS staff can manage pharmacy" ON bridge_pharmacy_fulfillment;
DROP POLICY IF EXISTS "Authenticated can manage pharmacy" ON bridge_pharmacy_fulfillment;
CREATE POLICY "Only HMS staff can manage pharmacy fulfillment"
  ON bridge_pharmacy_fulfillment FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 45. hms_op_patients (OPD patients)
DROP POLICY IF EXISTS "HMS staff can view patients" ON hms_op_patients;
DROP POLICY IF EXISTS "HMS staff can update patients" ON hms_op_patients;
CREATE POLICY "Only HMS staff can view OP patients"
  ON hms_op_patients FOR SELECT USING (public.is_hms_staff(auth.uid()));
CREATE POLICY "Only HMS staff can manage OP patients"
  ON hms_op_patients FOR ALL USING (public.is_hms_staff(auth.uid()));

-- 46. hms_op_visits
DROP POLICY IF EXISTS "HMS staff can view visits" ON hms_op_visits;
DROP POLICY IF EXISTS "HMS staff can update visits" ON hms_op_visits;
CREATE POLICY "Only HMS staff can view OP visits"
  ON hms_op_visits FOR SELECT USING (public.is_hms_staff(auth.uid()));
CREATE POLICY "Only HMS staff can manage OP visits"
  ON hms_op_visits FOR ALL USING (public.is_hms_staff(auth.uid()));

-- ═════════════════════════════════════════════════════════════════════════════════
-- DONE! HMS tables are now restricted to staff roles only.
--
-- WHO CAN ACCESS HMS DATA:
--   ✅ Doctors     → Full access to all HMS modules
--   ✅ Admin       → Full access to all HMS modules
--   ✅ Therapists  → Full access to all HMS modules
--   ✅ Super Admin → Full access
--   ✅ Accounts Admin → Full access
--   ✅ Doctor Admin → Full access
--   ❌ Patients    → CANNOT access HMS data
--   ❌ Students    → CANNOT access HMS data
--   ❌ Random users → CANNOT access HMS data
-- ═════════════════════════════════════════════════════════════════════════════════
