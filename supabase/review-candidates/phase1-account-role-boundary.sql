-- REVIEW CANDIDATE ONLY. Not an automatically applied migration.
-- Reconcile the effective schema, RPCs and auth bootstrap in isolated staging
-- before selecting an applied migration version. Do not run against production.
-- Scope: S01 role assignment. Profiles/doctor permissions are separate repairs.
BEGIN;

-- Fail before changing permissions if the expected contract is absent.
DO $preflight$
BEGIN
  IF pg_catalog.to_regclass('public.user_roles') IS NULL
    OR pg_catalog.to_regprocedure('auth.uid()') IS NULL
    OR pg_catalog.to_regprocedure('auth.role()') IS NULL THEN
    RAISE EXCEPTION 'Account role contract missing; reconcile schema first';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'public.user_roles'::regclass
      AND attname = 'user_id' AND atttypid = 'uuid'::regtype AND NOT attisdropped
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'public.user_roles'::regclass
      AND attname = 'role' AND NOT attisdropped
  ) THEN
    RAISE EXCEPTION 'Account role columns differ; reconcile schema first';
  END IF;
END;
$preflight$;

CREATE SCHEMA IF NOT EXISTS ayuzee_private;
REVOKE ALL ON SCHEMA ayuzee_private FROM PUBLIC, anon, authenticated;

-- RLS/ACLs alone do not stop an old SECURITY DEFINER RPC writing as its owner.
-- Check the originating request too, without consulting editable user metadata.
CREATE OR REPLACE FUNCTION ayuzee_private.guard_account_role_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $guard$
DECLARE
  request_role text := auth.role();
  delegated_role text := pg_catalog.current_setting('role', true);
BEGIN
  -- The reviewed Auth signup trigger may assign only the baseline patient role.
  -- Professional/admin values in editable signup metadata never reach this path.
  IF TG_OP = 'INSERT' AND request_role IS NULL
    AND session_user = 'supabase_auth_admin'
    AND current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin')
    AND delegated_role NOT IN ('anon', 'authenticated')
    AND NEW.role::text = 'patient' THEN
    RETURN NEW;
  END IF;
  -- Auth account deletion can cascade to role rows; it may remove, never grant.
  IF TG_OP = 'DELETE' AND request_role IS NULL
    AND session_user = 'supabase_auth_admin'
    AND delegated_role NOT IN ('anon', 'authenticated') THEN
    RETURN OLD;
  END IF;
  IF request_role IN ('anon', 'authenticated')
    OR delegated_role IN ('anon', 'authenticated') THEN
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Account roles require trusted server administration';
  END IF;

  -- Only a real service database principal may use the service JWT claim.
  -- A string in a claim or a postgres-owned browser RPC is not sufficient.
  IF current_user = 'service_role'
    AND (request_role IS NULL OR request_role = 'service_role') THEN
    NULL;
  ELSIF request_role IS NULL
    AND current_user IN ('postgres', 'supabase_admin')
    AND session_user IN ('postgres', 'supabase_admin')
    AND (delegated_role IS NULL OR delegated_role IN ('none', 'postgres', 'supabase_admin')) THEN
    NULL; -- explicit database maintenance, never a browser request
  ELSE
    RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Account roles require trusted server administration';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  IF TG_OP = 'TRUNCATE' THEN RETURN NULL; END IF;
  RETURN NEW;
END;
$guard$;
REVOKE ALL ON FUNCTION ayuzee_private.guard_account_role_write() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS ayuzee_account_role_write ON public.user_roles;
CREATE TRIGGER ayuzee_account_role_write
BEFORE INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION ayuzee_private.guard_account_role_write();
DROP TRIGGER IF EXISTS ayuzee_account_role_truncate ON public.user_roles;
CREATE TRIGGER ayuzee_account_role_truncate
BEFORE TRUNCATE ON public.user_roles
FOR EACH STATEMENT EXECUTE FUNCTION ayuzee_private.guard_account_role_write();

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
-- Permissive policies combine with OR. Replace the entire effective set,
-- including policies with misleading names such as "Service role full access".
DO $policies$
DECLARE existing record;
BEGIN
  FOR existing IN
    SELECT policyname FROM pg_catalog.pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  LOOP
    EXECUTE pg_catalog.format('DROP POLICY %I ON public.user_roles', existing.policyname);
  END LOOP;
END;
$policies$;

REVOKE ALL ON TABLE public.user_roles FROM PUBLIC, anon, authenticated;
-- Table revocation does not remove independently granted column privileges.
DO $columns$
DECLARE existing record;
BEGIN
  FOR existing IN
    SELECT attname FROM pg_catalog.pg_attribute
    WHERE attrelid = 'public.user_roles'::regclass AND attnum > 0 AND NOT attisdropped
  LOOP
    EXECUTE pg_catalog.format(
      'REVOKE SELECT (%1$I), INSERT (%1$I), UPDATE (%1$I), REFERENCES (%1$I) ON public.user_roles FROM PUBLIC, anon, authenticated',
      existing.attname
    );
  END LOOP;
END;
$columns$;

GRANT SELECT ON TABLE public.user_roles TO authenticated;
CREATE POLICY ayuzee_account_roles_read_own ON public.user_roles
FOR SELECT TO authenticated USING (user_id = (SELECT auth.uid()));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_roles TO service_role;
CREATE POLICY ayuzee_account_roles_service ON public.user_roles
FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Existing assignments are deliberately preserved. Audit privileged accounts
-- separately; do not silently delete legitimate grants or promote signup roles.
COMMIT;
