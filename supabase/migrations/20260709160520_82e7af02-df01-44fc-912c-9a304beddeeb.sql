
-- 1. Clinical reports: scope doctor read access to actual doctor-patient relationship
DROP POLICY IF EXISTS "Doctors read clinical reports" ON storage.objects;
CREATE POLICY "Doctors read clinical reports"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'clinical-reports'
  AND (
    is_admin_or_super(auth.uid())
    OR EXISTS (
      SELECT 1
      FROM public.appointments a
      JOIN public.doctors d ON d.id = a.doctor_id
      WHERE d.user_id = auth.uid()
        AND (a.user_id)::text = (storage.foldername(objects.name))[1]
    )
  )
);

-- 2. Panchakarma consents: drop the broad "any doctor" policies. The existing
--    per-vaidya, per-patient, per-venue-owner and admin policies remain and are sufficient.
DROP POLICY IF EXISTS "Doctors and admins can read consent signatures" ON storage.objects;
DROP POLICY IF EXISTS "Doctors and admins can upload consent signatures" ON storage.objects;

-- 3. Revoke public/anon EXECUTE on SECURITY DEFINER helpers that should only
--    run inside triggers / policies, not via the public API.
REVOKE EXECUTE ON FUNCTION public.condition_leads_rate_limit() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_pk_therapist_credential() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.panchakarma_courses_validate_venue() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.panchakarma_sessions_validate_assignment() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.panchakarma_sessions_prevent_overlap() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_approved_vaidya(uuid) FROM PUBLIC, anon;
