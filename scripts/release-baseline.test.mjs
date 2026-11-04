import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, cpSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { collectBaseline, assessEnvironment } from './release-baseline.mjs';

const files = {
  'package.json': JSON.stringify({ type: 'module', scripts: { typecheck: 'tsc --noEmit' } }),
  'tsconfig.json': '{ "files": [], "references": [{ "path": "./tsconfig.app.json" }] }',
  'netlify.toml': '[build]\ncommand = "npm run build"\npublish = "dist"\n[functions]\ndirectory = "netlify/functions"',
  'supabase/config.toml': 'project_id = "aaaaaaaaaaaaaaaaaaaa"\n[functions.dev-api]\nverify_jwt = false',
  '.github/workflows/e2e.yml': 'on:\n  # push:\n  # pull_request:\n  workflow_dispatch:',
  '.env.example': 'VITE_SUPABASE_PUBLISHABLE_KEY=example-public-key\nVITE_TELEGRAM_BOT_TOKEN=private-canary-value',
  'netlify/functions/send.js': 'exports.handler = async () => process.env.SERVER_SECRET;',
  'supabase/functions/dev-api/index.ts': '',
  'supabase/migrations/20260715_first.sql': '',
  'supabase/migrations/20260715_second.sql': '',
};
const collect = (override = {}) => {
  const source = { ...files, ...override };
  return collectBaseline({ paths: Object.keys(source), readText: path => source[path] });
};
const manifest = () => ({
  production: {
    deployedBranch: 'main', deployedCommit: 'a'.repeat(40), netlifySiteId: 'production-site',
    supabaseProjectRef: 'a'.repeat(20), compute: 'recorded-compute', region: 'recorded-region',
    quotas: { realtimeConnections: 200, databaseConnections: 60, storageBytes: 1000, authEmailPerHour: 2 },
    functionInventoryVerified: true, providerConfigurationVerified: true,
    verifiedAt: '2026-10-14T16:44:00Z', evidenceReference: 'operator-console-review',
  },
  staging: {
    netlifySiteId: 'staging-site', supabaseProjectRef: 'b'.repeat(20), syntheticDataOnly: true,
    sandboxIntegrationsOnly: true, separateSecrets: true,
    verifiedAt: '2026-10-14T16:44:00Z', evidenceReference: 'staging-console-review',
  },
  hostingBudget: { currency: 'INR', monthlyCap: 0, purchaseAuthorized: false },
});

test('inventory exposes false-green checks, duplicate migrations and deployment hazards', () => {
  const result = collect();
  assert.deepEqual(result.issues.map(i => i.id).sort(), ['E01', 'E04', 'O02', 'O04', 'S16']);
  assert.equal(result.supabase.migrations.duplicateVersions[0].files.length, 2);
  assert.deepEqual(result.supabase.jwtOverrides, [{ function: 'dev-api', verifyJwt: false }]);
  assert.deepEqual(result.checks.executedApplicationChecks, []);
});

test('collection never reads actual environment files or emits variable values', () => {
  const paths = [...Object.keys(files), '.env', '.env.production'];
  const result = collectBaseline({ paths, readText: path => {
    assert.ok(path !== '.env' && path !== '.env.production');
    return files[path];
  } });
  const json = JSON.stringify(result);
  assert.ok(!json.includes('private-canary-value'));
  assert.ok(!json.includes('example-public-key'));
  assert.deepEqual(result.netlify.handlers[0].requiredVariableNames, ['SERVER_SECRET']);
});

test('explicit application checks, automatic CI and ESM handlers remove matching source warnings', () => {
  const result = collect({
    'package.json': JSON.stringify({ type: 'module', scripts: { typecheck: 'tsc -p tsconfig.app.json --noEmit' } }),
    '.github/workflows/e2e.yml': 'on:\n  pull_request:\n    branches: [main]',
    'netlify/functions/send.js': 'export const handler = async () => ({});',
  });
  for (const id of ['E01', 'O02', 'O04']) assert.ok(!result.issues.some(i => i.id === id));
  assert.deepEqual(result.checks.executedApplicationChecks, []);
});

test('empty environment records are incomplete; valid declarations are only attestations', () => {
  assert.ok(assessEnvironment({}, collect()).length > 10);
  assert.deepEqual(assessEnvironment(manifest(), collect()), []);
});

test('staging cannot point to production or the unverified source-linked project', () => {
  const input = manifest();
  input.staging.supabaseProjectRef = input.production.supabaseProjectRef;
  input.staging.netlifySiteId = input.production.netlifySiteId;
  const errors = assessEnvironment(input, collect());
  assert.ok(errors.some(e => e.includes('cannot share')));
  assert.ok(errors.some(e => e.includes('source-linked')));
  assert.ok(errors.some(e => e.includes('separate staging Netlify')));
});

test('invalid limits, safety attestations and purchasing authorization fail the environment gate', () => {
  const input = manifest();
  input.production.quotas.realtimeConnections = '200';
  input.staging.separateSecrets = false;
  input.hostingBudget.monthlyCap = -1;
  input.hostingBudget.purchaseAuthorized = true;
  const errors = assessEnvironment(input, collect());
  assert.ok(errors.some(e => e.includes('numeric limits')));
  assert.ok(errors.some(e => e.includes('separateSecrets')));
  assert.ok(errors.some(e => e.includes('monthly cap')));
  assert.ok(errors.some(e => e.includes('proposal only')));
});

test('invalid evidence identity and timestamps are rejected without exposing their contents', () => {
  const input = manifest();
  input.production.verifiedAt = 'not-a-date';
  input.production.supabaseProjectRef = 'wrong-ref';
  input.production.deployedCommit = 'short-sha';
  assert.ok(assessEnvironment(input, collect()).length >= 3);
  assert.deepEqual(assessEnvironment(null, collect()), ['Environment record must be an object.']);
});

test('library import from stdin does not execute the CLI or assume stdin is a file', () => {
  const url = new URL('./release-baseline.mjs', import.meta.url).href;
  const result = spawnSync(process.execPath, ['--input-type=module', '-'], {
    input: `import { collectBaseline } from ${JSON.stringify(url)}; console.log(typeof collectBaseline);`,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), 'function');
});

test('CLI distinguishes successful inventory from missing environment evidence and redacts malformed input', () => {
  const root = mkdtempSync(join(tmpdir(), 'ayuzee-baseline-'));
  try {
    for (const [path, content] of Object.entries(files)) {
      mkdirSync(join(root, path, '..'), { recursive: true });
      writeFileSync(join(root, path), content);
    }
    mkdirSync(join(root, 'scripts'), { recursive: true });
    const script = join(root, 'scripts/release-baseline.mjs');
    cpSync(new URL('./release-baseline.mjs', import.meta.url), script);
    const git = args => execFileSync('git', ['-C', root, ...args], { stdio: 'ignore' });
    git(['init']); git(['add', '.']);
    git(['-c', 'user.email=baseline@example.invalid', '-c', 'user.name=Baseline fixture', 'commit', '-m', 'fixture']);
    const plain = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    assert.equal(plain.status, 0);
    assert.equal(JSON.parse(plain.stdout).environmentRecord.status, 'incomplete');
    const gate = spawnSync(process.execPath, [script, '--require-environment'], { encoding: 'utf8' });
    assert.equal(gate.status, 1);
    const record = join(root, 'environment.json');
    writeFileSync(record, JSON.stringify(manifest()));
    const attested = spawnSync(process.execPath, [script, '--manifest', record, '--require-environment'], { encoding: 'utf8' });
    assert.equal(attested.status, 0);
    assert.match(JSON.parse(attested.stdout).environmentRecord.status, /not independently verified/);
    writeFileSync(record, '{ SECRET_CANARY_123');
    const malformed = spawnSync(process.execPath, [script, '--manifest', record], { encoding: 'utf8' });
    assert.equal(malformed.status, 1);
    assert.ok(!malformed.stderr.includes('SECRET_CANARY_123'));
    assert.equal(spawnSync(process.execPath, [script, '--manifest'], { encoding: 'utf8' }).status, 1);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
