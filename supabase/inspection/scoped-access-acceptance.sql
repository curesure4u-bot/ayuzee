-- Read-only live acceptance. Identities remain inside the database; output is
-- assertions only. SET LOCAL role/claims disappear at the final ROLLBACK.
BEGIN READ ONLY;
SET LOCAL statement_timeout='30s';
DO $verify$
DECLARE v record; expected bigint; actual bigint; actor uuid; patient uuid; denied boolean;
BEGIN
 SELECT count(*) INTO expected FROM public.profiles;
 SELECT user_id INTO actor FROM public.user_roles WHERE role::text IN ('admin','super_admin') LIMIT 1;
 IF actor IS NULL THEN RAISE EXCEPTION 'Existing administrator assignment required'; END IF;
 SELECT p.user_id INTO patient FROM public.profiles p
 WHERE EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=p.user_id AND r.role::text='patient')
 AND NOT EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=p.user_id AND r.role::text<>'patient')
 AND NOT EXISTS(SELECT 1 FROM public.hms_staff s WHERE s.user_id=p.user_id)
 AND NOT EXISTS(SELECT 1 FROM public.doctors d WHERE d.user_id=p.user_id) LIMIT 1;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub','ffffffff-ffff-ffff-ffff-fffffffffff1','user_metadata',jsonb_build_object('role','super_admin'))::text,true);
 PERFORM set_config('role','authenticated',true);
 IF (SELECT count(*) FROM public.profiles)<>0 OR (SELECT count(*) FROM public.user_roles)<>0
  OR (SELECT count(*) FROM public.hms_staff)<>0 OR (SELECT count(*) FROM public.unified_patient_directory)<>0
  OR (SELECT count(*) FROM public.unified_patient_view)<>0 THEN
  RAISE EXCEPTION 'Unknown account or editable metadata acquired private access';
 END IF;
 IF patient IS NOT NULL THEN
  PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',patient)::text,true);
  IF (SELECT count(*) FROM public.profiles)<>1 OR EXISTS(SELECT 1 FROM public.profiles WHERE user_id<>patient) THEN
   RAISE EXCEPTION 'Patient profile isolation failed';
  END IF;
 END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',actor)::text,true);
 SELECT count(*) INTO actual FROM public.profiles;
 IF actual<>expected THEN RAISE EXCEPTION 'Existing administrator lost profile reads'; END IF;
 FOR v IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='v' LOOP
  EXECUTE format('SELECT count(*) FROM public.%I',v.relname) INTO actual;
 END LOOP;
 PERFORM set_config('request.jwt.claims','{"role":"anon"}',true);
 PERFORM set_config('role','anon',true);
 FOR v IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relkind='v' AND c.relname NOT IN ('gamification_leaderboard','competition_college_leaderboard') LOOP
  denied:=false;
  BEGIN EXECUTE format('SELECT count(*) FROM public.%I',v.relname) INTO actual;
  EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
  IF NOT denied THEN RAISE EXCEPTION 'Private view % is anonymously readable',v.relname; END IF;
 END LOOP;
 denied:=false;
 BEGIN PERFORM 1 FROM auth.users LIMIT 1;
 EXCEPTION WHEN insufficient_privilege THEN denied:=true; END;
 IF NOT denied THEN RAISE EXCEPTION 'Raw Auth table is anonymously readable'; END IF;
 PERFORM count(*) FROM public.gamification_leaderboard;
 PERFORM count(*) FROM public.competition_college_leaderboard;
 PERFORM set_config('role','none',true);
 PERFORM set_config('request.jwt.claims','{}',true);
END $verify$;
SELECT true AS unknown_account_denied,true AS editable_role_metadata_ignored,
 true AS existing_admin_reports_verified,true AS private_view_anonymous_access_denied,
 true AS raw_auth_access_denied,true AS public_projections_available;
ROLLBACK;
