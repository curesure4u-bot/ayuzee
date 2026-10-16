import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

const userA = '00000000-0000-0000-0000-000000000001';
const userB = '00000000-0000-0000-0000-000000000002';
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const candidate = await read('../supabase/review-candidates/phase1-account-role-boundary.sql');
const fixture = await read('../tests/database/fixtures/account-role-baseline.sql');

test('account role boundary on a real, isolated PostgreSQL engine', { timeout: 60000 }, async t => {
  const db = new PGlite();
  async function asRequest(role, body, { claim = role, sub = userA } = {}) {
    // session_user must model PostgREST's authenticator, not the superuser used
    // to construct the fixture. SECURITY DEFINER changes current_user only.
    await db.exec(`SET SESSION AUTHORIZATION authenticator; SET ROLE ${role};`);
    try {
      await db.query("SELECT set_config('request.jwt.claim.role', $1, false), set_config('request.jwt.claim.sub', $2, false)", [claim ?? '', sub ?? '']);
      return await body();
    } finally {
      // Explicitly restore the fixture principal: PGlite's single-user session
      // retains the changed authorization as the RESET SESSION default.
      await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE;');
      await db.query("SELECT set_config('request.jwt.claim.role', '', false), set_config('request.jwt.claim.sub', '', false)");
    }
  }
  const deny = body => assert.rejects(body, error => error.code === '42501');
  const rows = async () => (await db.query('SELECT user_id, role FROM public.user_roles ORDER BY user_id, role')).rows;
  try {
    await db.exec(fixture);
    const baseline = await rows();
    await t.test('negative control: old policies let an ordinary user assign admin', async () => {
      await asRequest('authenticated', () => db.query('INSERT INTO public.user_roles (user_id, role) VALUES ($1, $2)', [userA, 'admin']));
      assert.equal((await rows()).length, 3);
      await db.query("DELETE FROM public.user_roles WHERE role = 'admin'");
    });
    await db.exec(candidate);

    await t.test('candidate is repeatable and preserves existing assignments', async () => {
      await db.exec(candidate);
      assert.deepEqual(await rows(), baseline);
      const policies = await db.query("SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles' ORDER BY policyname");
      assert.deepEqual(policies.rows.map(row => row.policyname), ['ayuzee_account_roles_read_own', 'ayuzee_account_roles_service']);
    });
    await t.test('authenticated requests read only their own role, including account switches', async () => {
      assert.deepEqual(await asRequest('authenticated', rows), [baseline[0]]);
      assert.deepEqual(await asRequest('authenticated', rows, { sub: userB }), [baseline[1]]);
      assert.deepEqual(await asRequest('authenticated', rows, { sub: null }), []);
    });
    await t.test('anonymous requests cannot enumerate roles', async () => {
      await deny(() => asRequest('anon', rows, { sub: null }));
    });
    await t.test('ordinary requests cannot insert, edit, delete, or truncate roles', async () => {
      const commands = [
        ["INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin')", [userA]],
        ["UPDATE public.user_roles SET role = 'admin' WHERE user_id = $1", [userA]],
        ['DELETE FROM public.user_roles WHERE user_id = $1', [userB]],
        ['TRUNCATE public.user_roles', []],
      ];
      for (const [sql, params] of commands) {
        await deny(() => asRequest('authenticated', () => db.query(sql, params)));
      }
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('legacy SECURITY DEFINER functions cannot bypass the write boundary', async () => {
      for (const [sql, params] of [
        ["SELECT public.legacy_grant_role($1, 'admin')", [userA]],
        ['SELECT public.legacy_replace_role($1)', [userA]],
        ['SELECT public.legacy_delete_role($1)', [userB]],
        ['SELECT public.legacy_truncate_roles()', []],
      ]) {
        await deny(() => asRequest('authenticated', () => db.query(sql, params)));
      }
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('missing or forged service claims cannot authorize a browser RPC', async () => {
      for (const claim of [null, 'service_role', 'unexpected']) {
        await deny(() => asRequest('authenticated', () => db.query("SELECT public.legacy_grant_role($1, 'admin')", [userA]), { claim }));
      }
      await deny(() => asRequest('anon', () => db.query("SELECT public.legacy_grant_role($1, 'admin')", [userA])));
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('a request without a delegated role or JWT cannot become database maintenance', async () => {
      await deny(() => asRequest('none', () => db.query("SELECT public.legacy_grant_role($1, 'admin')", [userA]), { claim: null }));
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('auth lifecycle RPCs cannot silently grant a requested professional role', async () => {
      await db.exec('SET SESSION AUTHORIZATION supabase_auth_admin;');
      try {
        await deny(() => db.query("SELECT public.legacy_grant_role($1, 'doctor')", [userA]));
      } finally {
        await db.exec('SET SESSION AUTHORIZATION postgres; RESET ROLE;');
      }
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('service database principal can administer roles, but a browser JWT cannot', async () => {
      await deny(() => asRequest('service_role', () => db.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin')", [userA]), { claim: 'authenticated' }));
      await asRequest('service_role', async () => {
        await db.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin')", [userA]);
        await db.query("UPDATE public.user_roles SET role = 'doctor' WHERE user_id = $1 AND role = 'admin'", [userA]);
        await db.query("DELETE FROM public.user_roles WHERE user_id = $1 AND role = 'doctor'", [userA]);
      });
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('direct trusted database maintenance remains possible without request claims', async () => {
      await db.query("INSERT INTO public.user_roles (user_id, role) VALUES ($1, 'admin')", [userA]);
      await db.query("DELETE FROM public.user_roles WHERE user_id = $1 AND role = 'admin'", [userA]);
      assert.deepEqual(await rows(), baseline);
    });
    await t.test('column privileges are revoked, including a stray PUBLIC grant', async () => {
      const result = await db.query("SELECT has_column_privilege('authenticated', 'public.user_roles', 'role', 'UPDATE') AS allowed");
      assert.equal(result.rows[0].allowed, false);
    });
    await t.test('role trigger is private, invoker-context, with a fixed search path', async () => {
      const result = await db.query("SELECT p.prosecdef, p.proconfig, has_function_privilege('authenticated', p.oid, 'EXECUTE') AS callable FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'ayuzee_private' AND p.proname = 'guard_account_role_write'");
      assert.equal(result.rows[0].prosecdef, false);
      assert.deepEqual(result.rows[0].proconfig, ['search_path=""']);
      assert.equal(result.rows[0].callable, false);
    });
    await t.test('a mismatched schema aborts before replacing existing permissions', async () => {
      await db.exec('ALTER TABLE public.user_roles RENAME COLUMN user_id TO unreviewed_user_id;');
      await assert.rejects(() => db.exec(candidate), error => error.code === 'P0001' && /reconcile schema first/.test(error.message));
      await db.exec('ROLLBACK;');
      const policies = await db.query("SELECT count(*)::int AS total FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_roles'");
      assert.equal(policies.rows[0].total, 2);
    });
  } finally {
    await db.close();
  }
});
