-- REVIEW CANDIDATE ONLY: S13. Reconcile schema/RPCs in isolated staging first.
BEGIN;
CREATE OR REPLACE FUNCTION public.doctors_guard_admin_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  request_role text := auth.role();
  delegated_role text := current_setting('role',true);
  editable text[] := ARRAY['full_name','phone','alternate_phone','avatar_url','bio',
    'city','clinic_name','date_of_birth','gender','email','languages','specialization',
    'experience_years','registration_number','consultation_fee','in_clinic_available',
    'video_available','updated_at'];
BEGIN
  IF (request_role IS NULL OR request_role='service_role')
    AND delegated_role NOT IN ('anon','authenticated')
    AND (current_user='service_role' OR
      (request_role IS NULL AND current_user IN ('postgres','supabase_admin')
        AND session_user IN ('postgres','supabase_admin')
        AND delegated_role IN ('none','postgres','supabase_admin'))) THEN
    RETURN NEW;
  END IF;
  IF TG_OP='INSERT' THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Request professional access through account onboarding';
  END IF;
  IF auth.uid() IS NULL OR OLD.user_id IS DISTINCT FROM auth.uid()
    OR (to_jsonb(NEW)-editable) IS DISTINCT FROM (to_jsonb(OLD)-editable) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Doctor identity and permissions require trusted administration';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.doctors_guard_admin_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS doctors_guard_admin_fields_trg ON public.doctors;
CREATE TRIGGER doctors_guard_admin_fields_trg BEFORE INSERT OR UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.doctors_guard_admin_fields();
COMMIT;
