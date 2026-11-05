-- SUPERSEDED: DO NOT APPLY. The scoped repair was applied instead; see
-- docs/release/scoped-access-2026-11-04.md. Retained as historical evidence.
-- Phase 0 containment for the 21 views reported by the hosted advisor on
-- 4 November 2026. This deliberately withholds unverified view APIs from
-- browser roles; scoped replacements are released with their owning workflow.
-- No rows, view definitions or underlying tables are deleted or rewritten.
BEGIN;
DO $contain_views$
DECLARE
  view_names text[] := ARRAY[
    'competition_college_leaderboard', 'gamification_leaderboard',
    'hrms_v_attrition_monthly', 'hrms_v_branch_workforce',
    'hrms_v_department_workforce', 'hrms_v_doctor_activity',
    'hrms_v_expiring_documents', 'hrms_v_expiring_registrations',
    'hrms_v_expiring_training_certs', 'hrms_v_probation_ending',
    'hrms_v_therapist_activity', 'hrms_v_workforce_summary',
    'mis_daily_revenue', 'mis_department_revenue', 'mis_doctor_revenue',
    'mis_opd_summary', 'mis_today_collection_by_dept',
    'mis_today_collection_by_user', 'mis_today_hourly_collection',
    'unified_patient_directory', 'unified_patient_view'
  ];
  view_name text;
  column_list text;
BEGIN
  -- Validate the complete contract before changing any grant.
  FOREACH view_name IN ARRAY view_names LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = view_name AND c.relkind = 'v'
    ) THEN
      RAISE EXCEPTION 'Expected ordinary view public.% is missing; review schema first', view_name;
    END IF;
  END LOOP;
  FOREACH view_name IN ARRAY view_names LOOP
    EXECUTE format('ALTER VIEW public.%I SET (security_invoker = true)', view_name);
    EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', view_name);
    -- Table-level REVOKE alone does not remove an explicit column SELECT grant.
    SELECT string_agg(format('%I', a.attname), ', ' ORDER BY a.attnum)
      INTO column_list
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = view_name
        AND a.attnum > 0 AND NOT a.attisdropped;
    IF column_list IS NOT NULL THEN
      EXECUTE format('REVOKE SELECT (%s), INSERT (%s), UPDATE (%s), REFERENCES (%s) ON TABLE public.%I FROM PUBLIC, anon, authenticated',
        column_list, column_list, column_list, column_list, view_name);
    END IF;
    -- Preserve the trusted service principal's read path. Its handlers still
    -- need independent caller/operation/organization/record authorization.
    EXECUTE format('GRANT SELECT ON TABLE public.%I TO service_role', view_name);
  END LOOP;
END
$contain_views$;
COMMIT;
