-- Synthetic local fixture only. Reproduces the audited unsafe policy semantics.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE ROLE authenticator NOLOGIN NOINHERIT;
CREATE ROLE supabase_auth_admin NOLOGIN;
GRANT anon, authenticated, service_role TO authenticator;
CREATE SCHEMA auth;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.role', true), ''),
    NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role');
$$;
CREATE TYPE public.app_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.user_roles TO anon, authenticated, service_role;
GRANT UPDATE (role) ON public.user_roles TO PUBLIC;
CREATE POLICY "Service role full access roles" ON public.user_roles FOR ALL USING (true);
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated WITH CHECK (true);
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'patient'),
  ('00000000-0000-0000-0000-000000000002', 'doctor');

-- Simulates previously exposed definer RPCs: ordinary table RLS does not stop
-- these owner-context writes. These functions are NOT part of the candidate.
CREATE FUNCTION public.legacy_grant_role(target uuid, requested public.app_role)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  INSERT INTO public.user_roles (user_id, role) VALUES (target, requested);
$$;
CREATE FUNCTION public.legacy_replace_role(target uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  UPDATE public.user_roles SET role = 'admin' WHERE user_id = target;
$$;
CREATE FUNCTION public.legacy_delete_role(target uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  DELETE FROM public.user_roles WHERE user_id = target;
$$;
CREATE FUNCTION public.legacy_truncate_roles()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = '' AS $$
  TRUNCATE public.user_roles;
$$;
