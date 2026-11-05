import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';

// These checks inspect configuration locally; they never authenticate or query data.
export function validatePublicEnvironment(env) {
  const problems = [];
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  let project;
  try {
    if (typeof url !== 'string' || url !== url.trim()) throw new Error();
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password ||
        parsed.search || parsed.hash || parsed.pathname !== '/') throw new Error();
    if (/your-project|example\.|localhost/.test(parsed.hostname)) throw new Error();
    project = parsed.hostname.match(/^([a-z0-9]+)\.supabase\.co$/)?.[1];
  } catch {
    problems.push('VITE_SUPABASE_URL must be the HTTPS project API origin.');
  }
  if (typeof key !== 'string' || !key.trim() || key !== key.trim() || /your[-_]|placeholder|changeme/i.test(key)) {
    problems.push('VITE_SUPABASE_PUBLISHABLE_KEY is required.');
  } else if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) {
    // Legacy anon keys remain supported. Decoding is a consistency check,
    // not signature verification or proof that the key is active.
    try {
      const parts = key.split('.');
      if (parts.length !== 3 || parts.some(part => !/^[A-Za-z0-9_-]+$/.test(part))) throw new Error();
      const claims = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      if (claims.role !== 'anon' || claims.iss !== 'supabase') throw new Error();
      if (project && claims.ref !== project) throw new Error();
      if (claims.exp !== undefined && (!Number.isFinite(claims.exp) || claims.exp * 1000 <= Date.now())) throw new Error();
    } catch {
      problems.push('VITE_SUPABASE_PUBLISHABLE_KEY must be a publishable key or matching legacy anon key.');
    }
  }
  if (env.VITE_SUPABASE_PROJECT_ID && project && env.VITE_SUPABASE_PROJECT_ID !== project) {
    problems.push('VITE_SUPABASE_PROJECT_ID does not match the project API URL.');
  }
  for (const [name, value] of Object.entries(env)) {
    if (!name.startsWith('VITE_')) continue;
    if (/SECRET|PRIVATE|SERVICE_ROLE|BOT_TOKEN|OPENAI_API_KEY|WHATSAPP_API_KEY|TELEGRAM.*TOKEN/.test(name) ||
        String(value).startsWith('sb_secret_')) {
      problems.push('A browser-prefixed variable contains a server-only credential; remove it from build configuration.');
    }
    try {
      const claims = JSON.parse(Buffer.from(String(value).split('.')[1] ?? '', 'base64url').toString());
      if (claims.role === 'service_role') problems.push('A browser-prefixed variable contains a privileged database key.');
    } catch { /* Most public values are not JWTs. */ }
  }
  return [...new Set(problems)];
}

export const checks = [
  'schema:check', 'test:hosting', 'test:phase0', 'check:functions', 'test:phase1', 'test',
  'lint:phase0', 'lint:phase1', 'lint:directory', 'lint:access', 'typecheck:preview', 'typecheck:accounts', 'typecheck:directory', 'typecheck:access', 'progress:check',
  'typecheck:config', 'typecheck:app', 'audit:deps',
];

export function runBuild(env, run) {
  const problems = validatePublicEnvironment(env);
  if (problems.length) throw new Error(problems.join('\n'));
  for (const script of [...checks, 'build']) {
    const result = run(script);
    if (result.error || result.signal || result.status !== 0) {
      throw new Error(`Release stopped at ${script}; no subsequent build step was run.`);
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('../', import.meta.url));
    const env = { ...loadEnv('production', root, ''), ...process.env };
    runBuild(env, script => spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', script], {
      cwd: root, env, stdio: 'inherit', timeout: 10 * 60 * 1000,
    }));
  } catch (error) {
    // Values, child environments and provider responses must never be logged here.
    console.error(error.message);
    process.exitCode = 1;
  }
}
