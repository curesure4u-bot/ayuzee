import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const candidate = await readFile(new URL('../supabase/review-candidates/phase0-view-containment.sql', import.meta.url), 'utf8');
const views = [...candidate.matchAll(/'((?:hrms_v_|mis_|unified_patient_|competition_college_|gamification_)[a-z_]+)'/g)].map(match => match[1]);
assert.equal(new Set(views).size, 21);

async function fixture() {
  const db = new PGlite();
  await db.exec(`
    CREATE ROLE anon NOLOGIN;
    CREATE ROLE authenticated NOLOGIN;
    CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id text PRIMARY KEY, email text);
    INSERT INTO auth.users VALUES ('a', 'a@example.invalid'), ('b', 'b@example.invalid');
    CREATE TABLE public.scope_fixture(id integer PRIMARY KEY, owner_id text, note text);
    INSERT INTO public.scope_fixture VALUES (1, 'a', 'synthetic A'), (2, 'b', 'synthetic B');
    ALTER TABLE public.scope_fixture ENABLE ROW LEVEL SECURITY;
    CREATE POLICY owned ON public.scope_fixture TO anon, authenticated USING (owner_id = current_setting('request.jwt.claim.sub', true));
    GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
    GRANT SELECT ON public.scope_fixture TO anon, authenticated, service_role;
    GRANT SELECT ON auth.users TO service_role;
  `);
  for (const name of views) {
    const select = name.startsWith('unified_patient_')
      ? 'SELECT f.*, u.email FROM public.scope_fixture f JOIN auth.users u ON u.id = f.owner_id'
      : 'SELECT * FROM public.scope_fixture';
    await db.exec(`CREATE VIEW public.${name} AS ${select}; GRANT SELECT ON public.${name} TO PUBLIC, anon, authenticated, service_role;`);
  }
  await db.exec('GRANT SELECT(email) ON public.unified_patient_view TO anon, authenticated;');
  return db;
}

test('view containment against a synthetic PostgreSQL database', async context => {
  const db = await fixture();
  try {
    await context.test('negative control: owner-rights view leaks Auth data despite the underlying denial', async () => {
      await db.exec('SET ROLE anon;');
      const leaked = await db.query('SELECT email FROM public.unified_patient_view');
      assert.equal(leaked.rows.length, 2);
      await assert.rejects(db.query('SELECT email FROM auth.users'), /permission denied/);
      await db.exec('RESET ROLE;');
    });
    await context.test('all 21 views are contained for browser and PUBLIC grants, including explicit column grants', async () => {
      await db.exec(candidate);
      for (const role of ['anon', 'authenticated']) {
        for (const name of views) {
          const result = await db.query(`SELECT has_table_privilege('${role}', 'public.${name}', 'SELECT') AS table_read, has_any_column_privilege('${role}', 'public.${name}', 'SELECT') AS column_read`);
          assert.equal(result.rows[0].table_read, false, `${role} table grant on ${name}`);
          assert.equal(result.rows[0].column_read, false, `${role} column grant on ${name}`);
        }
        await db.exec(`SET ROLE ${role};`);
        await assert.rejects(db.query('SELECT email FROM public.unified_patient_view'), /permission denied/);
        await db.exec('RESET ROLE;');
      }
    });
    await context.test('views use invoker security; explicit future grants cannot bypass underlying ownership', async () => {
      const flags = await db.query("SELECT count(*)::int AS count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='v' AND 'security_invoker=true'=ANY(c.reloptions)");
      assert.equal(flags.rows[0].count, 21);
      await db.exec("GRANT SELECT ON public.mis_daily_revenue TO authenticated; SET request.jwt.claim.sub = 'a'; SET ROLE authenticated;");
      const rows = await db.query('SELECT owner_id FROM public.mis_daily_revenue');
      assert.deepEqual(rows.rows, [{ owner_id: 'a' }]);
      await db.exec('RESET ROLE; REVOKE SELECT ON public.mis_daily_revenue FROM authenticated;');
    });
    await context.test('trusted service access and all synthetic rows survive; repeat application is safe', async () => {
      await db.exec(candidate);
      await db.exec('SET ROLE service_role;');
      assert.equal((await db.query('SELECT * FROM public.unified_patient_directory')).rows.length, 2);
      await db.exec('RESET ROLE;');
      assert.equal((await db.query('SELECT * FROM auth.users')).rows.length, 2);
      assert.equal((await db.query('SELECT * FROM public.scope_fixture')).rows.length, 2);
    });
  } finally { await db.close(); }
});

test('unexpected schema fails before changing any other view', async () => {
  const db = await fixture();
  try {
    await db.exec('DROP VIEW public.unified_patient_directory;');
    await assert.rejects(db.exec(candidate), /review schema first/);
    await db.exec('ROLLBACK;');
    const result = await db.query("SELECT has_table_privilege('anon', 'public.mis_daily_revenue', 'SELECT') AS readable");
    assert.equal(result.rows[0].readable, true);
  } finally { await db.close(); }
});
