-- REVIEW CANDIDATE ONLY. Apply after role-boundary candidate in isolated staging.
-- Does not publish existing private profiles or assign requested account roles.
BEGIN;
DO $$ BEGIN
  IF to_regclass('public.profiles') IS NULL OR to_regclass('auth.users') IS NULL THEN
    RAISE EXCEPTION 'Reconcile profiles and Auth schema before applying candidate';
  END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION ayuzee_private.guard_private_profile_write()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE
  request_role text := auth.role();
  delegated_role text := current_setting('role',true);
  editable text[] := ARRAY['full_name','phone','date_of_birth','gender','avatar_url','city','state','pincode','preferred_languages','updated_at'];
BEGIN
  IF request_role IS NULL AND session_user='supabase_auth_admin'
    AND current_user IN ('postgres','supabase_admin','supabase_auth_admin') AND TG_OP IN ('INSERT','DELETE')
    AND delegated_role NOT IN ('anon','authenticated') THEN
    IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
  END IF;
  IF (request_role IS NULL OR request_role='service_role') AND delegated_role NOT IN ('anon','authenticated')
    AND (current_user='service_role' OR (request_role IS NULL AND current_user IN ('postgres','supabase_admin')
      AND session_user IN ('postgres','supabase_admin') AND delegated_role IN ('none','postgres','supabase_admin'))) THEN
    IF TG_OP='DELETE' THEN RETURN OLD; END IF; RETURN NEW;
  END IF;
  IF TG_OP='DELETE' OR auth.uid() IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Private profile administration required';
  END IF;
  IF NEW.user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Only your own profile can be changed';
  END IF;
  IF TG_OP='UPDATE' AND (OLD.user_id IS DISTINCT FROM auth.uid()
    OR (to_jsonb(NEW)-editable) IS DISTINCT FROM (to_jsonb(OLD)-editable)) THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Private profile control fields cannot be self-edited';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION ayuzee_private.guard_private_profile_write() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER ayuzee_private_profile_write BEFORE INSERT OR UPDATE OR DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION ayuzee_private.guard_private_profile_write();
DO $$ DECLARE existing record; BEGIN
  FOR existing IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='profiles' LOOP
    EXECUTE format('DROP POLICY %I ON public.profiles', existing.policyname);
  END LOOP;
END $$;
REVOKE ALL ON public.profiles FROM PUBLIC, anon, authenticated;
DO $$ DECLARE col record; BEGIN
  FOR col IN SELECT attname FROM pg_attribute WHERE attrelid='public.profiles'::regclass AND attnum>0 AND NOT attisdropped LOOP
    EXECUTE format('REVOKE SELECT (%1$I), INSERT (%1$I), UPDATE (%1$I), REFERENCES (%1$I) ON public.profiles FROM PUBLIC, anon, authenticated', col.attname);
    IF col.attname = ANY(ARRAY['full_name','phone','date_of_birth','gender','avatar_url','city','state','pincode','preferred_languages']) THEN
      EXECUTE format('GRANT UPDATE (%I) ON public.profiles TO authenticated', col.attname);
    END IF;
  END LOOP;
END $$;
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT (user_id, full_name) ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO service_role;
CREATE POLICY account_profile_read_own ON public.profiles FOR SELECT TO authenticated USING (user_id=(SELECT auth.uid()));
CREATE POLICY account_profile_insert_own ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY account_profile_update_own ON public.profiles FOR UPDATE TO authenticated USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY account_profile_service ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- A separate publication surface has no contact, birth-date or private fields.
-- Nothing is backfilled. Publishing belongs to the reviewed community workflow.
CREATE TABLE public.account_public_cards (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 2 AND 100),
  avatar_url text,
  published boolean NOT NULL DEFAULT false
);
ALTER TABLE public.account_public_cards ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_public_cards FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.account_public_cards TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_public_cards TO service_role;
CREATE POLICY public_cards_published ON public.account_public_cards FOR SELECT TO anon, authenticated USING (published);
CREATE POLICY public_cards_service ON public.account_public_cards FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.account_onboarding (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_role text NOT NULL CHECK (requested_role IN ('patient','doctor','student','therapist','provider','venue_owner')),
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_onboarding ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_onboarding FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.account_onboarding TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.account_onboarding TO service_role;
CREATE POLICY onboarding_own ON public.account_onboarding FOR ALL TO authenticated
USING (user_id=(SELECT auth.uid())) WITH CHECK (user_id=(SELECT auth.uid()));
CREATE POLICY onboarding_service ON public.account_onboarding FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE FUNCTION public.complete_account_onboarding(p_full_name text, p_requested_role text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Sign in to complete your account'; END IF;
  IF length(btrim(p_full_name)) NOT BETWEEN 2 AND 100 OR p_full_name IS NULL THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Name must contain 2 to 100 characters';
  END IF;
  IF p_requested_role IS NULL OR p_requested_role NOT IN ('patient','doctor','student','therapist','provider','venue_owner') THEN
    RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Unsupported account request';
  END IF;
  INSERT INTO public.profiles(user_id, full_name) VALUES(auth.uid(), btrim(p_full_name))
  ON CONFLICT(user_id) DO UPDATE SET full_name=excluded.full_name;
  INSERT INTO public.account_onboarding(user_id, requested_role) VALUES(auth.uid(),p_requested_role)
  ON CONFLICT(user_id) DO UPDATE SET requested_role=excluded.requested_role, completed_at=now();
END $$;
REVOKE ALL ON FUNCTION public.complete_account_onboarding(text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_account_onboarding(text,text) TO authenticated;

CREATE FUNCTION public.get_account_onboarding()
RETURNS TABLE(full_name text, requested_role text, completed_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
  SELECT p.full_name, o.requested_role, o.completed_at FROM public.profiles p
  LEFT JOIN public.account_onboarding o ON o.user_id=p.user_id WHERE p.user_id=auth.uid();
$$;
REVOKE ALL ON FUNCTION public.get_account_onboarding() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_account_onboarding() TO authenticated;

-- Server-controlled baseline for newly created Auth users. Existing accounts
-- are preserved; audit/backfill them separately after staging reconciliation.
CREATE FUNCTION ayuzee_private.account_patient_role_on_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
  INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'patient')
  ON CONFLICT(user_id,role) DO NOTHING;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION ayuzee_private.account_patient_role_on_signup() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER account_patient_role_on_signup AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION ayuzee_private.account_patient_role_on_signup();
COMMIT;
