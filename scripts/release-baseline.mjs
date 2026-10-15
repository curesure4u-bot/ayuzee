import { readFileSync, realpathSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Collects source evidence only. Never loads .env, connects to a provider,
// executes SQL, imports handlers, or creates test accounts.
export function collectBaseline({ paths, readText }) {
  const sorted = [...new Set(paths)].sort();
  const safeRead = path => sorted.includes(path) ? readText(path) : '';
  const pkg = JSON.parse(safeRead('package.json'));
  const netlify = safeRead('netlify.toml');
  const supabase = safeRead('supabase/config.toml');
  const rootConfig = safeRead('tsconfig.json');
  const workflow = safeRead('.github/workflows/e2e.yml');
  const sourceChecks = safeRead('.github/workflows/phase0-checks.yml').split('\n').filter(line => !/^\s*#/.test(line)).join('\n');
  const migrations = sorted.filter(p => /^supabase\/migrations\/[^/]+\.sql$/.test(p));
  const versions = new Map();
  for (const path of migrations) {
    const version = path.split('/').at(-1).split('_')[0];
    versions.set(version, [...(versions.get(version) ?? []), path]);
  }
  const functions = sorted.filter(p => /^supabase\/functions\/[^/]+\/index\.ts$/.test(p))
    .map(p => p.split('/')[2]);
  const jwtOverrides = [...supabase.matchAll(/\[functions\.([\w-]+)\]\s*verify_jwt\s*=\s*(true|false)/g)]
    .map(m => ({ function: m[1], verifyJwt: m[2] === 'true' }));
  const handlers = sorted.filter(p => /^netlify\/functions\/[^/]+\.(?:js|cjs|mjs)$/.test(p))
    .map(path => {
      const text = readText(path);
      return {
        path,
        commonJsInEsmPackage: pkg.type === 'module' && path.endsWith('.js') && /exports\.handler|\brequire\s*\(/.test(text),
        requiredVariableNames: [...new Set([...text.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)].map(m => m[1]))].sort(),
      };
    });
  const envExample = safeRead('.env.example');
  const publicExampleVariables = [...envExample.matchAll(/^\s*(VITE_[A-Z0-9_]+)\s*=/gm)].map(m => m[1]);
  const publicSecretNames = publicExampleVariables.filter(name => /TOKEN|SECRET|PRIVATE|SERVICE_ROLE|OPENAI_API_KEY|WHATSAPP_API_KEY/.test(name));
  const typecheck = pkg.scripts?.typecheck ?? null;
  const emptyRootTypecheck = /^tsc\s+--noEmit\s*$/.test(typecheck ?? '') && /"files"\s*:\s*\[\s*\]/.test(rootConfig);
  const activeWorkflow = workflow.split('\n').filter(line => !/^\s*#/.test(line)).join('\n');
  const issues = [];
  if (emptyRootTypecheck) issues.push({ id: 'E01', detail: 'Declared typecheck targets an empty root project; application checking is not established.' });
  const duplicateVersions = [...versions].filter(([, files]) => files.length > 1)
    .map(([version, files]) => ({ version, files }));
  if (duplicateVersions.length) issues.push({ id: 'E04', detail: 'Migration versions collide; do not replay the history until reconciled.' });
  if (handlers.some(h => h.commonJsInEsmPackage)) issues.push({ id: 'O02', detail: 'CommonJS handlers sit in an ESM package; hosted packaging remains unverified.' });
  if (!/^\s+(?:pull_request|push)\s*:/m.test(activeWorkflow)) issues.push({ id: 'O04', detail: 'The existing E2E workflow does not automatically gate changes.' });
  if (publicSecretNames.length) issues.push({ id: 'S16', detail: 'Browser-prefixed private-secret names occur in the environment example.' });
  return {
    reportVersion: 1,
    scope: 'source inventory; no live configuration or application correctness verified',
    netlify: {
      buildCommand: netlify.match(/^\s*command\s*=\s*"([^"]+)"/m)?.[1] ?? null,
      publishDirectory: netlify.match(/^\s*publish\s*=\s*"([^"]+)"/m)?.[1] ?? null,
      declaredFunctionsDirectory: netlify.match(/^\s*directory\s*=\s*"([^"]+)"/m)?.[1] ?? null,
      handlers,
      deployedBranch: 'unverified',
      deployedFunctions: 'unverified',
    },
    supabase: {
      sourceProjectRef: supabase.match(/^\s*project_id\s*=\s*"([^"]+)"/m)?.[1] ?? null,
      sourceFunctions: functions,
      jwtOverrides,
      migrations: { count: migrations.length, duplicateVersions },
      manualSqlScriptCount: sorted.filter(p => /^scripts\/.*\.sql$/.test(p)).length,
      liveProject: 'unverified',
      computeRegionQuotasAndDeployedFunctions: 'unverified',
    },
    checks: { declaredTypecheck: typecheck, emptyRootTypecheckDetected: emptyRootTypecheck, automatedSourceChecks: /^\s+(?:push|pull_request)\s*:/m.test(sourceChecks), executedApplicationChecks: [] },
    environmentExamples: { publicVariableNames: publicExampleVariables.sort(), privateSecretNamesWithPublicPrefix: publicSecretNames.sort() },
    issues,
    releaseReadiness: 'not established; completion of this inventory is not a release approval',
  };
}

export function assessEnvironment(manifest, baseline) {
  const problems = [];
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) return ['Environment record must be an object.'];
  const prod = manifest.production ?? {};
  const staging = manifest.staging ?? {};
  const budget = manifest.hostingBudget ?? {};
  const requiredText = (object, key, label) => {
    if (typeof object[key] !== 'string' || !object[key].trim() || /^(unknown|unverified|todo|replace|pending|your-)/i.test(object[key])) problems.push(`${label}.${key} needs an actual value.`);
  };
  for (const key of ['deployedBranch', 'deployedCommit', 'netlifySiteId', 'supabaseProjectRef', 'compute', 'region', 'verifiedAt', 'evidenceReference']) requiredText(prod, key, 'production');
  for (const key of ['netlifySiteId', 'supabaseProjectRef', 'verifiedAt', 'evidenceReference']) requiredText(staging, key, 'staging');
  for (const [label, object] of [['production', prod], ['staging', staging]]) {
    if (typeof object.verifiedAt === 'string' && !Number.isFinite(Date.parse(object.verifiedAt))) problems.push(`${label}.verifiedAt must be an ISO date.`);
    if (typeof object.supabaseProjectRef === 'string' && !/^[a-z0-9]{20}$/.test(object.supabaseProjectRef)) problems.push(`${label}.supabaseProjectRef must be a hosted project reference.`);
  }
  if (typeof prod.deployedCommit === 'string' && !/^[a-f0-9]{40}$/.test(prod.deployedCommit)) problems.push('production.deployedCommit must be a full commit SHA.');
  if (!prod.quotas || !['realtimeConnections', 'databaseConnections', 'storageBytes', 'authEmailPerHour'].every(key => Number.isFinite(prod.quotas[key]) && prod.quotas[key] >= 0)) problems.push('production.quotas needs numeric limits copied from actual project settings.');
  for (const key of ['functionInventoryVerified', 'providerConfigurationVerified']) if (prod[key] !== true) problems.push(`production.${key} has not been attested.`);
  for (const key of ['syntheticDataOnly', 'sandboxIntegrationsOnly', 'separateSecrets']) if (staging[key] !== true) problems.push(`staging.${key} has not been attested.`);
  if (prod.supabaseProjectRef && prod.supabaseProjectRef === staging.supabaseProjectRef) problems.push('Staging and production cannot share a Supabase project.');
  if (staging.supabaseProjectRef && staging.supabaseProjectRef === baseline.supabase.sourceProjectRef) problems.push('Staging matches the source-linked Supabase project; establish its ownership before using it.');
  if (prod.netlifySiteId && prod.netlifySiteId === staging.netlifySiteId) problems.push('Use a separate staging Netlify site to avoid inherited production configuration.');
  if (!/^[A-Z]{3}$/.test(budget.currency ?? '') || !Number.isFinite(budget.monthlyCap) || budget.monthlyCap < 0) problems.push('hostingBudget needs a currency and a proposed numeric monthly cap.');
  if (budget.purchaseAuthorized !== false) problems.push('This baseline records a proposal only; purchaseAuthorized must remain false.');
  return problems;
}

function trackedPaths(root) {
  // Git's tracked list avoids inspecting local secrets, dependency trees or build output.
  const output = execFileSync('git', ['-C', root, 'ls-files', '-z'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  return output.split('\0').filter(Boolean);
}

export function runCli(args = process.argv.slice(2)) {
  let manifestPath;
  let requireEnvironment = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--manifest' && args[i + 1] && !args[i + 1].startsWith('--')) manifestPath = args[++i];
    else if (args[i] === '--require-environment') requireEnvironment = true;
    else throw new Error('Usage: node scripts/release-baseline.mjs [--manifest PATH] [--require-environment]');
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const paths = trackedPaths(root);
  const baseline = collectBaseline({ paths, readText: p => readFileSync(join(root, p), 'utf8') });
  baseline.source = {
    branch: execFileSync('git', ['-C', root, 'branch', '--show-current'], { encoding: 'utf8' }).trim(),
    head: execFileSync('git', ['-C', root, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
    workingTreeModified: Boolean(execFileSync('git', ['-C', root, 'status', '--porcelain'], { encoding: 'utf8' }).trim()),
  };
  let environmentProblems = ['No operator environment record supplied.'];
  if (manifestPath) environmentProblems = assessEnvironment(JSON.parse(readFileSync(resolve(manifestPath), 'utf8')), baseline);
  baseline.environmentRecord = {
    status: environmentProblems.length ? 'incomplete' : 'operator-attested; not independently verified',
    problems: environmentProblems,
  };
  process.stdout.write(JSON.stringify(baseline, null, 2) + '\n');
  // This optional gate checks the environment record, never feature readiness.
  return requireEnvironment && environmentProblems.length ? 1 : 0;
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.exitCode = runCli(); }
  catch { process.stderr.write('Baseline collection failed. Check the checkout, file availability and command arguments. No environment values were printed.\n'); process.exitCode = 1; }
}
