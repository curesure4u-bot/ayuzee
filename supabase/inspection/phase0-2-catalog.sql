-- Metadata only. Run with the authorized project operator; contains no DDL/DML,
-- user records, key values or function bodies. Keep results in private evidence.
-- Read-only mode also protects against accidental edits during inspection.
BEGIN TRANSACTION READ ONLY;

-- Effective relations and RLS, including auth lifecycle and storage controls.
SELECT n.nspname AS schema_name, c.relname AS relation_name, c.relkind,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
       pg_get_userbyid(c.relowner) AS owner, c.reloptions
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname IN ('public', 'private', 'auth', 'storage', 'supabase_migrations')
  AND c.relkind IN ('r', 'p', 'v', 'm')
ORDER BY 1, 2;

-- Inspect the complete policy set: permissive policies combine with OR.
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname IN ('public', 'private', 'storage')
ORDER BY 1, 2, 3;

SELECT table_schema, table_name, grantee, privilege_type, is_grantable
FROM information_schema.table_privileges
WHERE table_schema IN ('public', 'private', 'storage')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role', 'supabase_auth_admin')
ORDER BY 1, 2, 3, 4;

SELECT table_schema, table_name, column_name, grantee, privilege_type
FROM information_schema.column_privileges
WHERE table_schema IN ('public', 'private')
  AND grantee IN ('PUBLIC', 'anon', 'authenticated', 'service_role')
ORDER BY 1, 2, 3, 4, 5;

-- Function identity and callable roles, without returning implementation bodies.
SELECT n.nspname AS schema_name, p.proname AS function_name,
       pg_get_function_identity_arguments(p.oid) AS arguments,
       pg_get_userbyid(p.proowner) AS owner, p.prosecdef AS security_definer,
       p.proconfig AS function_settings,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname IN ('public', 'private') AND p.prokind = 'f'
ORDER BY 1, 2, 3;

-- Auth signup/deletion and privilege protection trigger inventory.
SELECT n.nspname AS schema_name, c.relname AS table_name, t.tgname AS trigger_name,
       t.tgenabled AS enabled, pn.nspname AS function_schema, p.proname AS function_name
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid JOIN pg_namespace pn ON pn.oid = p.pronamespace
WHERE NOT t.tgisinternal AND n.nspname IN ('public', 'auth', 'storage')
ORDER BY 1, 2, 3;

-- Verify profile/doctor/community contracts before adapting candidates.
SELECT table_schema, table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'user_roles', 'doctors', 'doctors_public', 'public_doctors',
    'feed_posts', 'feed_comments', 'feed_likes', 'notifications', 'feed_poll_votes')
ORDER BY table_name, ordinal_position;

SELECT n.nspname AS schema_name, c.relname AS table_name, con.conname,
       pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN
  ('profiles', 'user_roles', 'doctors', 'feed_posts', 'feed_comments', 'feed_likes', 'feed_poll_votes')
ORDER BY 1, 2, 3;

COMMIT;

-- Run separately only if the first result confirms this relation exists:
-- SELECT version, name FROM supabase_migrations.schema_migrations ORDER BY version;
