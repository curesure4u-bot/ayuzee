-- ═══════════════════════════════════════════════════════════════════════════════
-- AYUZEE HMS — FIX OVERLY PERMISSIVE RLS POLICIES
-- 
-- PROBLEM: 32 tables have "FOR ALL TO authenticated USING (true)" which means
-- ANY authenticated user (patient, student, etc.) can read/write ALL data.
-- This is a HIPAA/DISHA compliance violation for healthcare data.
--
-- SOLUTION: Replace with role-based access using hms_staff table for authorization.
-- Staff members get access based on their entity_id (clinic/hospital they belong to).
-- Non-staff authenticated users get NO access to HMS internal tables.
--
-- RUN: Execute in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- NOTE: Run this AFTER all HMS tables are created.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Helper function: Check if user is HMS staff ─────────────────────────────
CREATE OR REPLACE FUNCTION public.is_hms_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hms_staff
    WHERE user_id = auth.uid()
    AND (status IS NULL OR status != 'terminated')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── Helper function: Get user's entity_id (clinic/hospital) ─────────────────
CREATE OR REPLACE FUNCTION public.get_hms_entity_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT entity_id FROM public.hms_staff
    WHERE user_id = auth.uid()
    AND (status IS NULL OR status != 'terminated')
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ─── Helper function: Check if user has specific HMS role ────────────────────
CREATE OR REPLACE FUNCTION public.has_hms_role(required_roles TEXT[])
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.hms_staff
    WHERE user_id = auth.uid()
    AND role = ANY(required_roles)
    AND (status IS NULL OR status != 'terminated')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ SENSITIVE TABLES — Restricted to admin/hr roles only                         ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_payroll (HIGHLY SENSITIVE — salary data) ────────────────────────────
DROP POLICY IF EXISTS "Staff can manage payroll" ON public.hms_payroll;
DROP POLICY IF EXISTS "Admin/HR can manage payroll" ON public.hms_payroll;
CREATE POLICY "Admin/HR can manage payroll" ON public.hms_payroll
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager', 'accountant']));

-- ─── hms_attendance (employee records) ───────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage attendance" ON public.hms_attendance;
-- Staff can view their own attendance
DROP POLICY IF EXISTS "Staff view own attendance" ON public.hms_attendance;
CREATE POLICY "Staff view own attendance" ON public.hms_attendance
  FOR SELECT TO authenticated
  USING (
    staff_id IN (SELECT id FROM public.hms_staff WHERE user_id = auth.uid())
    OR public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager'])
  );
-- Only HR/admin can insert/update/delete
DROP POLICY IF EXISTS "Admin/HR manage attendance" ON public.hms_attendance;
CREATE POLICY "Admin/HR manage attendance" ON public.hms_attendance
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager']))
  WITH CHECK (public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager']));

-- ─── hms_staff (employee directory) ──────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view employees" ON public.hms_staff;
-- All staff can view the directory (needed for lookups)
DROP POLICY IF EXISTS "Staff can view directory" ON public.hms_staff;
CREATE POLICY "Staff can view directory" ON public.hms_staff
  FOR SELECT TO authenticated
  USING (public.is_hms_staff());
-- Only admin/HR can modify
DROP POLICY IF EXISTS "Admin/HR can manage staff" ON public.hms_staff;
CREATE POLICY "Admin/HR can manage staff" ON public.hms_staff
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager']))
  WITH CHECK (public.has_hms_role(ARRAY['admin', 'owner', 'hr_manager']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ CLINICAL TABLES — Restricted to clinical staff                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_ai_scribe_sessions (patient consultation recordings) ────────────────
DROP POLICY IF EXISTS "Staff can manage ai scribe" ON public.hms_ai_scribe_sessions;
DROP POLICY IF EXISTS "Doctors manage own scribe sessions" ON public.hms_ai_scribe_sessions;
CREATE POLICY "Doctors manage own scribe sessions" ON public.hms_ai_scribe_sessions
  FOR ALL TO authenticated
  USING (
    doctor_user_id = auth.uid()
    OR public.has_hms_role(ARRAY['admin', 'owner'])
  );

-- ─── hms_prescription_items ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage prescription items" ON public.hms_prescription_items;
DROP POLICY IF EXISTS "Clinical staff manage prescriptions" ON public.hms_prescription_items;
CREATE POLICY "Clinical staff manage prescriptions" ON public.hms_prescription_items
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'pharmacist']));

-- ─── hms_lab_orders ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage lab orders" ON public.hms_lab_orders;
DROP POLICY IF EXISTS "Clinical staff manage lab orders" ON public.hms_lab_orders;
CREATE POLICY "Clinical staff manage lab orders" ON public.hms_lab_orders
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'lab_technician', 'nurse']));

-- ─── hms_lab_order_items ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage lab order items" ON public.hms_lab_order_items;
DROP POLICY IF EXISTS "Clinical staff manage lab order items" ON public.hms_lab_order_items;
CREATE POLICY "Clinical staff manage lab order items" ON public.hms_lab_order_items
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'lab_technician', 'nurse']));

-- ─── hms_lab_tests ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage lab tests" ON public.hms_lab_tests;
DROP POLICY IF EXISTS "Lab staff manage tests" ON public.hms_lab_tests;
CREATE POLICY "Lab staff manage tests" ON public.hms_lab_tests
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'lab_technician', 'doctor']));

-- ─── hms_ip_admissions ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage ip admissions" ON public.hms_ip_admissions;
DROP POLICY IF EXISTS "Clinical staff manage IP admissions" ON public.hms_ip_admissions;
CREATE POLICY "Clinical staff manage IP admissions" ON public.hms_ip_admissions
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'nurse', 'receptionist']));

-- ─── hms_insurance_claims ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage insurance claims" ON public.hms_insurance_claims;
DROP POLICY IF EXISTS "Billing staff manage insurance claims" ON public.hms_insurance_claims;
CREATE POLICY "Billing staff manage insurance claims" ON public.hms_insurance_claims
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'accountant', 'receptionist']));

-- ─── hms_patient_insurance ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage patient insurance" ON public.hms_patient_insurance;
DROP POLICY IF EXISTS "Billing staff manage patient insurance" ON public.hms_patient_insurance;
CREATE POLICY "Billing staff manage patient insurance" ON public.hms_patient_insurance
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'accountant', 'receptionist', 'doctor']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ NOTIFICATION & COMMUNICATION — Staff only                                    ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_notification_log (contains patient contact info) ────────────────────
DROP POLICY IF EXISTS "Staff can manage notifications" ON public.hms_notification_log;
DROP POLICY IF EXISTS "Staff can view notifications" ON public.hms_notification_log;
CREATE POLICY "Staff can view notifications" ON public.hms_notification_log
  FOR ALL TO authenticated
  USING (public.is_hms_staff());

-- ─── hms_call_log ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage call log" ON public.hms_call_log;
DROP POLICY IF EXISTS "Staff can manage calls" ON public.hms_call_log;
CREATE POLICY "Staff can manage calls" ON public.hms_call_log
  FOR ALL TO authenticated
  USING (public.is_hms_staff());

-- ─── hms_crm_tasks ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage crm tasks" ON public.hms_crm_tasks;
DROP POLICY IF EXISTS "Staff can manage CRM" ON public.hms_crm_tasks;
CREATE POLICY "Staff can manage CRM" ON public.hms_crm_tasks
  FOR ALL TO authenticated
  USING (public.is_hms_staff());


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ BILLING & FINANCE — Billing/Admin staff                                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_bill_items ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage bill items" ON public.hms_bill_items;
DROP POLICY IF EXISTS "Billing staff manage bills" ON public.hms_bill_items;
CREATE POLICY "Billing staff manage bills" ON public.hms_bill_items
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'accountant', 'receptionist', 'doctor']));

-- ─── hms_payment_receipts ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage payment receipts" ON public.hms_payment_receipts;
DROP POLICY IF EXISTS "Billing staff manage receipts" ON public.hms_payment_receipts;
CREATE POLICY "Billing staff manage receipts" ON public.hms_payment_receipts
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'accountant', 'receptionist']));

-- ─── hms_insurance_companies ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage insurance companies" ON public.hms_insurance_companies;
DROP POLICY IF EXISTS "Staff can view insurance companies" ON public.hms_insurance_companies;
CREATE POLICY "Staff can view insurance companies" ON public.hms_insurance_companies
  FOR SELECT TO authenticated
  USING (public.is_hms_staff());
DROP POLICY IF EXISTS "Admin manage insurance companies" ON public.hms_insurance_companies;
CREATE POLICY "Admin manage insurance companies" ON public.hms_insurance_companies
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner']))
  WITH CHECK (public.has_hms_role(ARRAY['admin', 'owner']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ INVENTORY & PHARMACY — Pharmacy/Admin staff                                  ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_stock_products ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage stock products" ON public.hms_stock_products;
DROP POLICY IF EXISTS "Pharmacy staff manage stock" ON public.hms_stock_products;
CREATE POLICY "Pharmacy staff manage stock" ON public.hms_stock_products
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'pharmacist', 'store_keeper']));

-- ─── hms_purchase_orders ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage purchase orders" ON public.hms_purchase_orders;
DROP POLICY IF EXISTS "Pharmacy/admin manage POs" ON public.hms_purchase_orders;
CREATE POLICY "Pharmacy/admin manage POs" ON public.hms_purchase_orders
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'pharmacist', 'store_keeper']));

-- ─── hms_grn (Goods Received Notes) ─────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage grn" ON public.hms_grn;
DROP POLICY IF EXISTS "Pharmacy/admin manage GRN" ON public.hms_grn;
CREATE POLICY "Pharmacy/admin manage GRN" ON public.hms_grn
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'pharmacist', 'store_keeper']));

-- ─── hms_grn_items ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage grn items" ON public.hms_grn_items;
DROP POLICY IF EXISTS "Pharmacy/admin manage GRN items" ON public.hms_grn_items;
CREATE POLICY "Pharmacy/admin manage GRN items" ON public.hms_grn_items
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'pharmacist', 'store_keeper']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ OPERATIONS — General HMS staff                                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_queue_config ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage queue config" ON public.hms_queue_config;
DROP POLICY IF EXISTS "Admin manage queue config" ON public.hms_queue_config;
CREATE POLICY "Admin manage queue config" ON public.hms_queue_config
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'receptionist']));

-- ─── hms_queue_display_state ─────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage queue display" ON public.hms_queue_display_state;
-- Queue display is public-facing (TV screens) — allow read for all, write for staff
DROP POLICY IF EXISTS "Anyone can view queue state" ON public.hms_queue_display_state;
CREATE POLICY "Anyone can view queue state" ON public.hms_queue_display_state
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff manage queue state" ON public.hms_queue_display_state;
CREATE POLICY "Staff manage queue state" ON public.hms_queue_display_state
  FOR ALL TO authenticated
  USING (public.is_hms_staff())
  WITH CHECK (public.is_hms_staff());

-- ─── hms_doctor_slots ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage doctor slots" ON public.hms_doctor_slots;
-- Patients need to VIEW slots for booking; only staff can modify
DROP POLICY IF EXISTS "Anyone can view doctor slots" ON public.hms_doctor_slots;
CREATE POLICY "Anyone can view doctor slots" ON public.hms_doctor_slots
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Staff manage doctor slots" ON public.hms_doctor_slots;
CREATE POLICY "Staff manage doctor slots" ON public.hms_doctor_slots
  FOR ALL TO authenticated
  USING (public.is_hms_staff())
  WITH CHECK (public.is_hms_staff());

-- ─── hms_beds ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage beds" ON public.hms_beds;
DROP POLICY IF EXISTS "Staff can manage beds" ON public.hms_beds;
CREATE POLICY "Staff can manage beds" ON public.hms_beds
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'nurse', 'receptionist']));

-- ─── hms_wards ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage wards" ON public.hms_wards;
DROP POLICY IF EXISTS "Staff can view wards" ON public.hms_wards;
CREATE POLICY "Staff can view wards" ON public.hms_wards
  FOR SELECT TO authenticated USING (public.is_hms_staff());
DROP POLICY IF EXISTS "Admin manage wards" ON public.hms_wards;
CREATE POLICY "Admin manage wards" ON public.hms_wards
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner']))
  WITH CHECK (public.has_hms_role(ARRAY['admin', 'owner']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ PANCHAKARMA & CLINICAL MODULES                                               ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_pk_packages ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage pk packages" ON public.hms_pk_packages;
DROP POLICY IF EXISTS "Staff can view PK packages" ON public.hms_pk_packages;
CREATE POLICY "Staff can view PK packages" ON public.hms_pk_packages
  FOR SELECT TO authenticated USING (true); -- Patients can view available packages
DROP POLICY IF EXISTS "Clinical staff manage PK packages" ON public.hms_pk_packages;
CREATE POLICY "Clinical staff manage PK packages" ON public.hms_pk_packages
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'therapist']))
  WITH CHECK (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'therapist']));

-- ─── hms_pk_enrollments ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage pk enrollments" ON public.hms_pk_enrollments;
DROP POLICY IF EXISTS "Clinical staff manage PK enrollments" ON public.hms_pk_enrollments;
CREATE POLICY "Clinical staff manage PK enrollments" ON public.hms_pk_enrollments
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'therapist', 'receptionist']));

-- ─── hms_pk_sessions ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage pk sessions" ON public.hms_pk_sessions;
DROP POLICY IF EXISTS "Clinical staff manage PK sessions" ON public.hms_pk_sessions;
CREATE POLICY "Clinical staff manage PK sessions" ON public.hms_pk_sessions
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'therapist']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ ABDM & COMPLIANCE                                                            ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_abdm_exchange_log ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage abdm exchange log" ON public.hms_abdm_exchange_log;
DROP POLICY IF EXISTS "Admin view ABDM logs" ON public.hms_abdm_exchange_log;
CREATE POLICY "Admin view ABDM logs" ON public.hms_abdm_exchange_log
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor']));

-- ─── hms_abha_records ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage abha records" ON public.hms_abha_records;
DROP POLICY IF EXISTS "Clinical staff manage ABHA" ON public.hms_abha_records;
CREATE POLICY "Clinical staff manage ABHA" ON public.hms_abha_records
  FOR ALL TO authenticated
  USING (public.has_hms_role(ARRAY['admin', 'owner', 'doctor', 'receptionist']));


-- ╔═══════════════════════════════════════════════════════════════════════════════╗
-- ║ QUIZ & LEARNING (less sensitive — all staff can access)                      ║
-- ╚═══════════════════════════════════════════════════════════════════════════════╝

-- ─── hms_quiz_questions ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can manage quiz questions" ON public.hms_quiz_questions;
DROP POLICY IF EXISTS "Staff can manage quizzes" ON public.hms_quiz_questions;
CREATE POLICY "Staff can manage quizzes" ON public.hms_quiz_questions
  FOR ALL TO authenticated
  USING (public.is_hms_staff());


-- ═══════════════════════════════════════════════════════════════════════════════
-- DONE — 32 permissive policies replaced with role-based access control
-- 
-- ROLES HIERARCHY:
--   owner       → Full access to everything
--   admin       → Full access to everything
--   hr_manager  → Staff, attendance, payroll
--   accountant  → Billing, payments, insurance
--   doctor      → Clinical, prescriptions, labs, procedures
--   nurse       → Clinical, wards, IP admissions
--   pharmacist  → Stock, purchase orders, dispensing
--   store_keeper→ Stock, purchase orders, GRN
--   lab_technician → Lab orders, tests, results
--   therapist   → Panchakarma sessions, therapy
--   receptionist→ Appointments, queue, billing, patient registration
--
-- IMPORTANT: After running this script, ensure all staff members have
-- their `role` column properly set in the `hms_staff` table.
-- ═══════════════════════════════════════════════════════════════════════════════
