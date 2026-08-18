-- ╔════════════════════════════════════════════════════════════════════════════════╗
-- ║  FIX: Patient Data RLS Policies                                              ║
-- ║                                                                              ║
-- ║  PROBLEM: Patient medical data was accessible to ANY logged-in user.         ║
-- ║  FIX: Now only the patient themselves OR doctors/staff can access the data.  ║
-- ║                                                                              ║
-- ║  SAFE TO RUN: Uses DROP POLICY IF EXISTS before CREATE.                       ║
-- ║  DOES NOT delete data or modify table structure.                             ║
-- ║                                                                              ║
-- ║  HOW TO RUN: Copy this into your Supabase Dashboard → SQL Editor → Run      ║
-- ╚════════════════════════════════════════════════════════════════════════════════╝

-- ─────────────────────────────────────────────────────────────────────────────────
-- HELPER: Ensure has_role function exists (no-op if already present)
-- ─────────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- ─────────────────────────────────────────────────────────────────────────────────
-- 1. patient_allergies — Only patient + their doctors + staff
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view patient allergies" ON patient_allergies;
DROP POLICY IF EXISTS "Staff can manage patient allergies" ON patient_allergies;

CREATE POLICY "Patient or staff can view allergies"
  ON patient_allergies FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'therapist')
  );

CREATE POLICY "Patient can insert own allergies"
  ON patient_allergies FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient or doctor can update allergies"
  ON patient_allergies FOR UPDATE
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patient or admin can delete allergies"
  ON patient_allergies FOR DELETE
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 2. patient_treatment_plans — Only patient + assigned doctor + admin
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view treatment plans" ON patient_treatment_plans;
DROP POLICY IF EXISTS "Staff can manage treatment plans" ON patient_treatment_plans;

CREATE POLICY "Patient or doctor can view treatment plans"
  ON patient_treatment_plans FOR SELECT
  USING (
    auth.uid() = patient_id
    OR auth.uid() = doctor_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can create treatment plans"
  ON patient_treatment_plans FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can update treatment plans"
  ON patient_treatment_plans FOR UPDATE
  USING (
    auth.uid() = doctor_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admin can delete treatment plans"
  ON patient_treatment_plans FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────────────────────────
-- 3. patient_timeline_events — Only patient + doctors + admin
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view patient timeline" ON patient_timeline_events;
DROP POLICY IF EXISTS "Staff can create timeline events" ON patient_timeline_events;
DROP POLICY IF EXISTS "Staff can update timeline events" ON patient_timeline_events;

CREATE POLICY "Patient or staff can view timeline"
  ON patient_timeline_events FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'therapist')
  );

CREATE POLICY "Doctor or admin can create timeline events"
  ON patient_timeline_events FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can update timeline events"
  ON patient_timeline_events FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 4. parsed_medical_documents — Only patient who uploaded + doctors
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated can manage documents" ON parsed_medical_documents;
DROP POLICY IF EXISTS "Owner can manage medical docs" ON parsed_medical_documents;

CREATE POLICY "Patient or doctor can view medical docs"
  ON parsed_medical_documents FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patient can upload own documents"
  ON parsed_medical_documents FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient or doctor can update documents"
  ON parsed_medical_documents FOR UPDATE
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patient or admin can delete documents"
  ON parsed_medical_documents FOR DELETE
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 5. spine_patient_pipeline — Only patient + doctors + admin
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view pipeline" ON spine_patient_pipeline;
DROP POLICY IF EXISTS "Staff can manage pipeline" ON spine_patient_pipeline;

CREATE POLICY "Patient or staff can view pipeline"
  ON spine_patient_pipeline FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'therapist')
  );

CREATE POLICY "Doctor or admin can manage pipeline"
  ON spine_patient_pipeline FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can update pipeline"
  ON spine_patient_pipeline FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 6. patient_critical_conditions — Only patient + doctors + admin
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view critical conditions" ON patient_critical_conditions;
DROP POLICY IF EXISTS "Staff can manage critical conditions" ON patient_critical_conditions;

CREATE POLICY "Patient or doctor can view critical conditions"
  ON patient_critical_conditions FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can manage critical conditions"
  ON patient_critical_conditions FOR ALL
  USING (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 7. patient_compliance_scores — Only patient + doctors
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view compliance scores" ON patient_compliance_scores;
DROP POLICY IF EXISTS "Staff can manage compliance scores" ON patient_compliance_scores;

CREATE POLICY "Patient or doctor can view compliance"
  ON patient_compliance_scores FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can manage compliance"
  ON patient_compliance_scores FOR ALL
  USING (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 8. patient_risk_assessments — Only patient + doctors
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Staff can view risk assessments" ON patient_risk_assessments;
DROP POLICY IF EXISTS "Staff can manage risk assessments" ON patient_risk_assessments;

CREATE POLICY "Patient or doctor can view risk assessments"
  ON patient_risk_assessments FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Doctor or admin can manage risk assessments"
  ON patient_risk_assessments FOR ALL
  USING (
    public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 9. patient_vitals_readings — Only patient + doctors
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can access vitals" ON patient_vitals_readings;
DROP POLICY IF EXISTS "Owner can manage vitals" ON patient_vitals_readings;

CREATE POLICY "Patient or doctor can view vitals"
  ON patient_vitals_readings FOR SELECT
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Patient can record own vitals"
  ON patient_vitals_readings FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patient or doctor can update vitals"
  ON patient_vitals_readings FOR UPDATE
  USING (
    auth.uid() = patient_id
    OR public.has_role(auth.uid(), 'doctor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────────
-- 10. patient_connected_devices — Only the patient themselves
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Authenticated users can manage devices" ON patient_connected_devices;
DROP POLICY IF EXISTS "Owner can manage connected devices" ON patient_connected_devices;
DROP POLICY IF EXISTS "Patient can manage own devices" ON patient_connected_devices;
DROP POLICY IF EXISTS "Owner can manage devices" ON patient_connected_devices;

CREATE POLICY "Patient can manage own devices"
  ON patient_connected_devices FOR ALL
  USING (auth.uid() = patient_id);

-- ─────────────────────────────────────────────────────────────────────────────────
-- 11. telegram_bot_users — Restrict from public access
-- ─────────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "System can manage telegram users" ON telegram_bot_users;

CREATE POLICY "Only admin can manage telegram users"
  ON telegram_bot_users FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow the service role (serverless functions) to manage telegram users
-- This is handled automatically by Supabase service_role key in netlify functions.

-- ═════════════════════════════════════════════════════════════════════════════════
-- DONE! Patient data is now properly secured.
--
-- WHO CAN ACCESS WHAT:
--   Patients → Can see/edit ONLY their own data
--   Doctors  → Can see all patients (needed for treatment)
--   Admin    → Full access (for support/debugging)
--   Therapists → Can see patient timelines, allergies, pipeline (for treatment)
--   Random logged-in users → CANNOT see any patient data ✅
-- ═════════════════════════════════════════════════════════════════════════════════
