import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checks, runBuild, validatePublicEnvironment } from './netlify-build.mjs';

const env = { VITE_SUPABASE_URL: 'https://syntheticproject.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_synthetic' };
const jwt = claims => ['header', Buffer.from(JSON.stringify(claims)).toString('base64url'), 'signature'].join('.');

test('missing config, placeholders, unsafe origins and privileged keys stop before commands run', () => {
  for (const invalid of [{}, { ...env, VITE_SUPABASE_URL: 'http://localhost' },
    { ...env, VITE_SUPABASE_URL: 'https://your-project-id.supabase.co' },
    { ...env, VITE_SUPABASE_URL: ' ' + env.VITE_SUPABASE_URL },
    { ...env, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_your_key' },
    { ...env, VITE_SUPABASE_URL: 'https://private:credential@syntheticproject.supabase.co' },
    { ...env, VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_secret_canary' },
    { ...env, VITE_OTHER: jwt({ role: 'service_role' }) },
    { ...env, VITE_TELEGRAM_BOT_TOKEN: 'credential-canary' }]) {
    let calls = 0;
    assert.throws(() => runBuild(invalid, () => { calls++; return { status: 0 }; }), error => {
      assert.doesNotMatch(error.message, /credential-canary|sb_secret_canary/);
      return true;
    });
    assert.equal(calls, 0);
  }
});

test('legacy anon keys require matching project, valid role and unexpired claims', () => {
  const legacy = { role: 'anon', iss: 'supabase', ref: 'syntheticproject', exp: 4102444800 };
  assert.deepEqual(validatePublicEnvironment({ ...env, VITE_SUPABASE_PUBLISHABLE_KEY: jwt(legacy) }), []);
  for (const claims of [{ ...legacy, ref: 'otherproject' }, { ...legacy, role: 'service_role' }, { ...legacy, exp: 1 }]) {
    assert.ok(validatePublicEnvironment({ ...env, VITE_SUPABASE_PUBLISHABLE_KEY: jwt(claims) }).length);
  }
  assert.ok(validatePublicEnvironment({ ...env, VITE_SUPABASE_PROJECT_ID: 'otherproject' }).length);
});

test('every failing, timed out or signalled check blocks compilation', () => {
  for (const failed of checks) {
    for (const failure of [{ status: 1 }, { status: null, signal: 'SIGTERM' }, { status: null, error: new Error('timeout') }]) {
      const calls = [];
      assert.throws(() => runBuild(env, script => { calls.push(script); return script === failed ? failure : { status: 0 }; }), /Release stopped/);
      assert.equal(calls.at(-1), failed);
      assert.ok(!calls.includes('build'));
    }
  }
});

test('compilation follows all checks and its own failure is propagated', () => {
  const calls = [];
  runBuild(env, script => { calls.push(script); return { status: 0 }; });
  assert.deepEqual(calls, [...checks, 'build']);
  assert.throws(() => runBuild(env, script => ({ status: script === 'build' ? 1 : 0 })), /stopped at build/);
});

test('Netlify uses the gated entrypoint', () => {
  const netlify = readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8');
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.match(netlify, /command = "npm run build:netlify"/);
  assert.equal(pkg.scripts['build:netlify'], 'node scripts/netlify-build.mjs');
});
