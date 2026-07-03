-- Run in Supabase SQL Editor to audit RLS on PHI-sensitive tables.
-- Fix any table listed with rls_enabled = false before production.

WITH phi_tables AS (
  SELECT unnest(ARRAY[
    'profiles',
    'appointments',
    'consultations',
    'vaidya_consultations',
    'vaidya_patients',
    'prescription_orders',
    'formulary_prescriptions',
    'homeo_prescriptions',
    'homeopathy_prescriptions',
    'atmri_sponsored_cases',
    'patient_vitals',
    'posture_assessments',
    'orders'
  ]) AS table_name
)
SELECT
  p.tablename AS table_name,
  c.relrowsecurity AS rls_enabled,
  COUNT(pol.policyname) AS policy_count
FROM phi_tables pt
JOIN pg_tables p ON p.tablename = pt.table_name AND p.schemaname = 'public'
JOIN pg_class c ON c.relname = p.tablename
LEFT JOIN pg_policies pol ON pol.tablename = p.tablename AND pol.schemaname = 'public'
GROUP BY p.tablename, c.relrowsecurity
ORDER BY rls_enabled ASC, policy_count ASC, table_name;

-- Private storage buckets (public must be false)
SELECT id, name, public
FROM storage.buckets
WHERE id IN (
  'prescriptions',
  'patient-files',
  'posture-images',
  'doctor-documents',
  'student-docs',
  'therapist-docs',
  'venue-docs'
)
ORDER BY public DESC, id;
