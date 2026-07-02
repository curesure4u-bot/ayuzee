
-- 1. Doctors: block self-approval / verification / suspension / commission / hms_access changes by non-admins
CREATE OR REPLACE FUNCTION public.doctors_guard_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.is_approved := false;
    NEW.is_verified := false;
    NEW.verification_status := 'pending';
    NEW.is_suspended := COALESCE(NEW.is_suspended, false);
    IF NEW.is_suspended IS DISTINCT FROM false THEN NEW.is_suspended := false; END IF;
    NEW.commission_rate := NULL;
    NEW.hms_access := false;
    NEW.rejection_reason := NULL;
    NEW.public_profile := false;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_approved := OLD.is_approved;
    NEW.is_verified := OLD.is_verified;
    NEW.verification_status := OLD.verification_status;
    NEW.is_suspended := OLD.is_suspended;
    NEW.commission_rate := OLD.commission_rate;
    NEW.hms_access := OLD.hms_access;
    NEW.rejection_reason := OLD.rejection_reason;
    NEW.public_profile := OLD.public_profile;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS doctors_guard_admin_fields_trg ON public.doctors;
CREATE TRIGGER doctors_guard_admin_fields_trg
BEFORE INSERT OR UPDATE ON public.doctors
FOR EACH ROW EXECUTE FUNCTION public.doctors_guard_admin_fields();

-- 2. Service providers: block self is_approved / is_verified
CREATE OR REPLACE FUNCTION public.service_providers_guard_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.is_approved := false;
    NEW.is_verified := false;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_approved := OLD.is_approved;
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS service_providers_guard_admin_fields_trg ON public.service_providers;
CREATE TRIGGER service_providers_guard_admin_fields_trg
BEFORE INSERT OR UPDATE ON public.service_providers
FOR EACH ROW EXECUTE FUNCTION public.service_providers_guard_admin_fields();

-- 3. Therapists: block self is_verified / verification_status / is_banned / is_suspended
CREATE OR REPLACE FUNCTION public.therapists_guard_admin_fields()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.is_admin_or_super(auth.uid()) THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    NEW.is_verified := false;
    NEW.verification_status := 'pending';
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.is_verified := OLD.is_verified;
    NEW.verification_status := OLD.verification_status;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS therapists_guard_admin_fields_trg ON public.therapists;
CREATE TRIGGER therapists_guard_admin_fields_trg
BEFORE INSERT OR UPDATE ON public.therapists
FOR EACH ROW EXECUTE FUNCTION public.therapists_guard_admin_fields();

-- 4. hms_ward_beds: restrict SELECT/UPDATE to admins only (remove broad cross-branch doctor access)
DROP POLICY IF EXISTS beds_staff_select ON public.hms_ward_beds;
DROP POLICY IF EXISTS beds_staff_update ON public.hms_ward_beds;

-- 5. Revoke anon EXECUTE from all SECURITY DEFINER functions in public schema
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION public.%I(%s) FROM anon, PUBLIC', r.proname, r.args);
  END LOOP;
END $$;
