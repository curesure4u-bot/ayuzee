-- Phase 1 onboarding integrated with the applied scoped access/lifecycle rules.
-- Local candidate until its Auth/API acceptance has passed. No role backfill,
-- public profile publication, replacement of existing profile policies or grants.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
DO $contract$ BEGIN
 IF to_regprocedure('ayuzee_private.rbac_actor()') IS NULL
  OR to_regclass('public.account_onboarding') IS NOT NULL
  OR to_regprocedure('public.complete_account_onboarding(text,text)') IS NOT NULL
  OR to_regprocedure('public.get_account_onboarding()') IS NOT NULL THEN
  RAISE EXCEPTION 'Onboarding contract differs; reconcile before applying';
 END IF;
 IF (SELECT md5(prosrc) FROM pg_proc WHERE oid='ayuzee_private.rbac_authority_guard()'::regprocedure)
    IS DISTINCT FROM '81c8f04fcb9dee3a00bb29e194df446d'
  OR EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='auth.users'::regclass AND NOT tgisinternal)
  OR NOT (has_column_privilege('authenticated','public.profiles','user_id','INSERT')
    AND has_column_privilege('authenticated','public.profiles','full_name','INSERT')
    AND has_column_privilege('authenticated','public.profiles','full_name','UPDATE')) THEN
  RAISE EXCEPTION 'Account authority, Auth bootstrap or profile ACL changed; review before applying';
 END IF;
END $contract$;

CREATE TABLE public.account_onboarding (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 requested_role text NOT NULL CHECK(requested_role IN ('patient','doctor','student','therapist','provider','venue_owner')),
 completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.account_onboarding ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.account_onboarding FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.account_onboarding TO authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.account_onboarding TO service_role;
CREATE POLICY onboarding_own ON public.account_onboarding TO authenticated
 USING(ayuzee_private.rbac_actor() AND user_id=(SELECT auth.uid()))
 WITH CHECK(ayuzee_private.rbac_actor() AND user_id=(SELECT auth.uid()));
CREATE POLICY onboarding_service ON public.account_onboarding TO service_role USING(true) WITH CHECK(true);

CREATE FUNCTION public.complete_account_onboarding(p_full_name text,p_requested_role text)
RETURNS void LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
 IF NOT ayuzee_private.rbac_actor() THEN
  RAISE EXCEPTION USING ERRCODE='42501',MESSAGE='Sign in to complete your account';
 END IF;
 IF p_full_name IS NULL OR length(btrim(p_full_name)) NOT BETWEEN 2 AND 100 THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Name must contain 2 to 100 characters';
 END IF;
 IF p_requested_role IS NULL OR p_requested_role NOT IN ('patient','doctor','student','therapist','provider','venue_owner') THEN
  RAISE EXCEPTION USING ERRCODE='22023',MESSAGE='Unsupported account request';
 END IF;
 INSERT INTO public.profiles(user_id,full_name) VALUES(auth.uid(),btrim(p_full_name))
  ON CONFLICT(user_id) DO UPDATE SET full_name=excluded.full_name;
 INSERT INTO public.account_onboarding(user_id,requested_role) VALUES(auth.uid(),p_requested_role)
  ON CONFLICT(user_id) DO UPDATE SET requested_role=excluded.requested_role,completed_at=now();
END $$;
REVOKE ALL ON FUNCTION public.complete_account_onboarding(text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.complete_account_onboarding(text,text) TO authenticated;

CREATE FUNCTION public.get_account_onboarding()
RETURNS TABLE(full_name text,requested_role text,completed_at timestamptz)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path='' AS $$
 SELECT p.full_name,o.requested_role,o.completed_at FROM public.profiles p
 LEFT JOIN public.account_onboarding o ON o.user_id=p.user_id
 WHERE p.user_id=(SELECT auth.uid()) AND ayuzee_private.rbac_actor()
$$;
REVOKE ALL ON FUNCTION public.get_account_onboarding() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_account_onboarding() TO authenticated;

-- New identities receive only the patient baseline. User-editable role metadata
-- is never used. Existing identities and grants remain untouched.
CREATE FUNCTION ayuzee_private.provision_new_account()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO public.profiles(user_id,full_name,email)
  VALUES(NEW.id,left(COALESCE(NEW.raw_user_meta_data->>'full_name',''),100),NEW.email)
  ON CONFLICT(user_id) DO NOTHING;
 INSERT INTO public.user_roles(user_id,role) VALUES(NEW.id,'patient')
  ON CONFLICT(user_id,role) DO NOTHING;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION ayuzee_private.provision_new_account() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER ayuzee_provision_new_account AFTER INSERT ON auth.users
 FOR EACH ROW EXECUTE FUNCTION ayuzee_private.provision_new_account();
NOTIFY pgrst,'reload schema';
COMMIT;
