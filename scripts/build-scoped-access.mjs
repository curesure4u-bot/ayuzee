import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const metadata = JSON.parse(await readFile(resolve(root, 'local-staging/supabase/metadata/rbac-targets.json'), 'utf8'));
const registry = JSON.parse(await readFile(resolve(root, 'local-staging/supabase/metadata/patient-registry-columns.json'), 'utf8'));
const stripTransaction = sql => sql.replace(/^BEGIN;\s*$/gm, '').replace(/^COMMIT;\s*$/gm, '');
const fragments = await Promise.all(['phase1-account-role-boundary.sql', 'scoped-access-helpers.sql', 'scoped-public-reports.sql'].map(name => readFile(resolve(root, 'supabase/review-candidates', name), 'utf8')));
const admin = 'ayuzee_private.rbac_admin()';
const employee = 'ayuzee_private.rbac_employee(employee_id)';
const own = `user_id=(SELECT auth.uid()) OR ${admin}`;
const read = {
  profiles: 'ayuzee_private.rbac_patient(user_id)',
  hms_staff: 'ayuzee_private.rbac_employee(id)',
  hms_branches: `${admin} OR ayuzee_private.rbac_branch(id,'hr') OR ayuzee_private.rbac_branch(id,'finance') OR ayuzee_private.rbac_branch(id,'registration')`,
  hms_bills: `${admin} OR ayuzee_private.rbac_location(branch,'finance') OR ayuzee_private.rbac_doctor_visit(visit_id) OR ayuzee_private.rbac_own_patient(patient_id)`,
  hms_op_visits: `${admin} OR ayuzee_private.rbac_doctor_visit(id) OR ayuzee_private.rbac_own_patient(patient_id) OR ayuzee_private.rbac_location(branch,'clinical_admin')`,
  hms_op_patients: 'ayuzee_private.rbac_registry(id)',
  mis_daily_collection: `${admin} OR ayuzee_private.rbac_location(location,'finance')`,
  hrms_resignations: employee, hrms_employee_documents: employee, hrms_employee_qualifications: employee, hrms_employee_training: employee,
  hrms_trainings: `${admin} OR EXISTS(SELECT 1 FROM public.hms_branches b WHERE b.organisation_id=hrms_trainings.organisation_id AND ayuzee_private.rbac_branch(b.id,'hr')) OR EXISTS(SELECT 1 FROM public.hrms_employee_training e JOIN public.hms_staff s ON s.id=e.employee_id WHERE e.training_id=hrms_trainings.id AND s.user_id=(SELECT auth.uid()))`,
  user_coins: own, user_badges: own, user_streaks: own, competition_scores: own,
  ayuzee_hms_bridge: 'ayuzee_private.rbac_patient(ayuzee_id)',
};
const employeeWrite = `${admin} OR EXISTS(SELECT 1 FROM public.hms_staff s WHERE s.id=employee_id AND ayuzee_private.rbac_branch(s.branch_id,'hr'))`;
const write = {
  profiles: `user_id=(SELECT auth.uid()) OR ${admin}`,
  hms_staff: `${admin} OR ayuzee_private.rbac_branch(branch_id,'hr')`,
  hms_branches: `${admin} OR ayuzee_private.rbac_branch(id,'hr')`,
  hms_bills: `${admin} OR ayuzee_private.rbac_location(branch,'finance')`,
  hms_op_visits: `${admin} OR ayuzee_private.rbac_doctor_visit(id) OR ayuzee_private.rbac_location(branch,'registration')`,
  hms_op_patients: `${admin} OR ayuzee_private.rbac_location(branch,'registration')`,
  mis_daily_collection: `${admin} OR ayuzee_private.rbac_location(location,'finance')`,
  hrms_resignations: employeeWrite, hrms_employee_documents: employeeWrite, hrms_employee_qualifications: employeeWrite, hrms_employee_training: employeeWrite,
  hrms_trainings: `${admin} OR EXISTS(SELECT 1 FROM public.hms_branches b WHERE b.organisation_id=hrms_trainings.organisation_id AND ayuzee_private.rbac_branch(b.id,'hr'))`,
  user_coins: 'false', user_badges: 'false', user_streaks: 'false', competition_scores: `user_id=(SELECT auth.uid()) OR ${admin}`,
  ayuzee_hms_bridge: admin,
};
const literals = metadata.views.map(v => `('${v.name}','${v.fingerprint}')`).join(',\n');
const preflight = `DO $preflight$\nDECLARE expected record; actual text;\nBEGIN\nFOR expected IN SELECT * FROM (VALUES ${literals}) AS v(name,fingerprint) LOOP\n IF to_regclass('public.'||expected.name) IS NULL THEN RAISE EXCEPTION 'Missing view %',expected.name; END IF;\n SELECT md5(pg_get_viewdef(('public.'||expected.name)::regclass,true)) INTO actual;\n IF actual<>expected.fingerprint THEN RAISE EXCEPTION 'View % changed since inspection; review before applying',expected.name; END IF;\nEND LOOP;\nEND\n$preflight$;`;
const quote = s => `'${s.replaceAll("'","''")}'`;
const columnValues = [...metadata.columns,...registry].map(c=>`(${quote(c.table)},${quote(c.name)},${quote(c.type)})`).join(',\n');
const columnPreflight = `DO $contract$ DECLARE expected record; actual text; BEGIN
 FOR expected IN SELECT * FROM (VALUES ${columnValues}) AS c(table_name,column_name,type_name) LOOP
  SELECT format_type(a.atttypid,a.atttypmod) INTO actual FROM pg_attribute a
   WHERE a.attrelid=to_regclass('public.'||expected.table_name) AND a.attname=expected.column_name AND a.attnum>0 AND NOT a.attisdropped;
  IF actual IS DISTINCT FROM expected.type_name THEN RAISE EXCEPTION 'Column %.% changed since inspection',expected.table_name,expected.column_name; END IF;
 END LOOP;
END $contract$;`;
const policies = Object.entries(read).map(([table, expression]) => {
  const mutation = write[table].replace('s.id=employee_id',`s.id=${table}.employee_id`);
  return `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ayuzee_scope_read ON public.${table};
CREATE POLICY ayuzee_scope_read ON public.${table} AS RESTRICTIVE FOR SELECT TO anon,authenticated USING (ayuzee_private.rbac_actor() AND (${expression}));
DROP POLICY IF EXISTS ayuzee_scope_select ON public.${table};
CREATE POLICY ayuzee_scope_select ON public.${table} FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS ayuzee_scope_insert ON public.${table};
CREATE POLICY ayuzee_scope_insert ON public.${table} AS RESTRICTIVE FOR INSERT TO anon,authenticated WITH CHECK (ayuzee_private.rbac_actor() AND (${mutation}));
DROP POLICY IF EXISTS ayuzee_scope_update ON public.${table};
CREATE POLICY ayuzee_scope_update ON public.${table} AS RESTRICTIVE FOR UPDATE TO anon,authenticated USING (ayuzee_private.rbac_actor() AND (${mutation})) WITH CHECK (ayuzee_private.rbac_actor() AND (${mutation}));
DROP POLICY IF EXISTS ayuzee_scope_delete ON public.${table};
CREATE POLICY ayuzee_scope_delete ON public.${table} AS RESTRICTIVE FOR DELETE TO anon,authenticated USING (ayuzee_private.rbac_actor() AND (${mutation}));
DROP POLICY IF EXISTS ayuzee_scope_admin ON public.${table};
CREATE POLICY ayuzee_scope_admin ON public.${table} FOR ALL TO authenticated USING (${admin}) WITH CHECK (${admin});
GRANT SELECT ON public.${table} TO authenticated;`;
}).join('\n\n');
const guards = ['profiles','doctors','hms_staff','hms_branches','hms_op_visits','hms_op_patients'].map(table => `DROP TRIGGER IF EXISTS ayuzee_rbac_authority ON public.${table};
CREATE TRIGGER ayuzee_rbac_authority BEFORE INSERT OR UPDATE OR DELETE ON public.${table} FOR EACH ROW EXECUTE FUNCTION ayuzee_private.rbac_authority_guard();`).join('\n');
const views = metadata.views.map(v => `ALTER VIEW public.${v.name} SET (security_invoker=true);
REVOKE ALL ON public.${v.name} FROM PUBLIC,anon;
GRANT SELECT ON public.${v.name} TO authenticated,service_role;`).join('\n');
const sql = `-- Scoped view repair for Ayuzee. Generated by scripts/build-scoped-access.mjs.
-- Exact source: verified 4 November catalog fingerprints; no production rows exported.
-- All changes are transactional. Existing user/role/clinical records are preserved.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
${preflight}
${columnPreflight}
${stripTransaction(fragments[0].replace(/^-- REVIEW CANDIDATE ONLY[\s\S]*?BEGIN;\s*/,''))}
${fragments[1]}
DROP POLICY IF EXISTS ayuzee_active_account ON public.user_roles;
CREATE POLICY ayuzee_active_account ON public.user_roles AS RESTRICTIVE FOR SELECT TO authenticated USING (ayuzee_private.rbac_actor());
${policies}
DROP POLICY IF EXISTS ayuzee_doctor_reviewer ON public.doctors;
CREATE POLICY ayuzee_doctor_reviewer ON public.doctors FOR UPDATE TO authenticated
 USING (ayuzee_private.rbac_admin() OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=(SELECT auth.uid()) AND r.role::text='doctor_admin'))
 WITH CHECK (ayuzee_private.rbac_admin() OR EXISTS(SELECT 1 FROM public.user_roles r WHERE r.user_id=(SELECT auth.uid()) AND r.role::text='doctor_admin'));
${guards}
${fragments[2]}
${views}
GRANT SELECT ON public.gamification_leaderboard,public.competition_college_leaderboard TO anon;
-- Remove independently granted anonymous column privileges as well.
DO $columns$ DECLARE v record; cols text; BEGIN
 FOR v IN SELECT c.oid,c.relname FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND c.relname IN (${metadata.views.filter(v=>!['gamification_leaderboard','competition_college_leaderboard'].includes(v.name)).map(v=>`'${v.name}'`).join(',')}) LOOP
  SELECT string_agg(quote_ident(a.attname),', ' ORDER BY a.attnum) INTO cols FROM pg_attribute a WHERE a.attrelid=v.oid AND a.attnum>0 AND NOT a.attisdropped;
  EXECUTE format('REVOKE SELECT (%s) ON public.%I FROM PUBLIC,anon',cols,v.relname);
 END LOOP;
END $columns$;
CREATE INDEX IF NOT EXISTS ayuzee_rbac_staff_actor ON public.hms_staff(user_id,branch_id,organisation_id);
CREATE INDEX IF NOT EXISTS ayuzee_rbac_doctor_actor ON public.doctors(user_id,id);
CREATE INDEX IF NOT EXISTS ayuzee_rbac_visit_assignment ON public.hms_op_visits(doctor_id,patient_id,branch);
CREATE INDEX IF NOT EXISTS ayuzee_rbac_bridge_patient ON public.ayuzee_hms_bridge(ayuzee_id,hms_id,bridge_type);
NOTIFY pgrst,'reload schema';
COMMIT;
`;
await writeFile(resolve(root, 'supabase/review-candidates/phase0-2-scoped-access.sql'), sql);
console.log(`Generated scoped access repair for ${metadata.views.length} views and ${Object.keys(read).length} supporting data tables, plus protected role/staff authority.`);
