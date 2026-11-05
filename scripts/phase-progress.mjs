import { readFile, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const ledger = JSON.parse(await readFile(resolve(root, 'docs/release/phase-progress.json'), 'utf8'));
const output = resolve(root, 'docs/release/phase-progress.md');
const ids = new Set();
for (const phase of ledger.phases) {
  for (const task of phase.tasks) {
    for (const check of task.checks) {
      const id = `${task.id}:${check.id}`;
      if (ids.has(id) || !['local', 'hosted'].includes(check.kind) || typeof check.done !== 'boolean') throw new Error(`Invalid progress criterion: ${id}`);
      ids.add(id);
      if (check.done && !check.evidence) throw new Error(`Completed criterion requires evidence: ${id}`);
      if (check.evidence) {
        const path = resolve(root, check.evidence);
        if (relative(root, path).startsWith('..') || !(await stat(path)).isFile()) throw new Error(`Invalid evidence: ${id}`);
      }
    }
  }
  if (phase.exitVerified && phase.tasks.some(task => task.checks.some(check => !check.done))) throw new Error(`Phase ${phase.id} cannot close with incomplete checks`);
}
const count = checks => `${checks.filter(check => check.done).length}/${checks.length}`;
const lines = [
  '# Ayuzee phase progress', '', 'Updated ' + ledger.updated + ' · branch `' + ledger.branch + '`.', '',
  ledger.countingRule, '',
  '**A phase remains open until its exit checks pass.** ' + ledger.hostedAccess, '',
  '| Phase | Local checklist complete | Hosted checklist complete | Exit accepted |',
  '| --- | --- | --- | --- |',
];
for (const phase of ledger.phases) {
  const checks = phase.tasks.flatMap(task => task.checks);
  lines.push(`| ${phase.id} — ${phase.name} | ${count(checks.filter(check => check.kind === 'local'))} | ${count(checks.filter(check => check.kind === 'hosted'))} | ${phase.exitVerified ? 'Yes' : 'No'} |`);
}
lines.push('', 'Local counts describe the explicit list below; they are not percentages of the whole codebase or forecasts of engineering time.', '',
  'Latest increment: [Phase 3 local closeout, 8/8](../domains/commerce-closeout.md), including [delivery](../domains/commerce-fulfilment.md) and [payment verification/recovery](../domains/commerce-payments.md), extending [checkout](../domains/commerce-checkout.md) and the [catalog](../domains/commerce-catalog.md), following the [community portal](../domains/community-portal.md) and [scoped live access repair](scoped-access-2026-11-04.md). Phase 3 source work was explicitly authorized while earlier hosted acceptance remains open. Source: [machine-readable ledger](phase-progress.json). Original plan: retain the Phase 0–8 sequence; do not replace it with a new roadmap. Local staging replaces hosted staging at Sai’s explicit request; this is a changed constraint, not evidence of hosted validation.', '');
for (const phase of ledger.phases) {
  lines.push(`## Phase ${phase.id} — ${phase.name}`, '');
  for (const task of phase.tasks) {
    lines.push(`### ${task.id} — ${task.name}`, '');
    for (const check of task.checks) lines.push(`- [${check.done ? 'x' : ' '}] **${check.kind}** · ${check.detail}${check.evidence ? ` [Evidence](../../${check.evidence})` : ''}`);
    lines.push('');
  }
}
lines.push('## Later phases', '');
for (const phase of ledger.laterPhases) lines.push(`- **Phase ${phase.id} — ${phase.name}:** ${phase.status}`);
lines.push('', 'Regenerate with `npm run progress`; CI checks consistency with `npm run progress:check`. Update criterion status only after its stated evidence is obtained. No commit, push, deployment or hosted database change is implied by this ledger.', '');
const rendered = lines.join('\n');
if (process.argv.includes('--check')) {
  if (await readFile(output, 'utf8') !== rendered) throw new Error('Progress report is stale. Run npm run progress and review it.');
  console.log('Progress ledger and rendered report are consistent.');
} else {
  await writeFile(output, rendered);
  console.log('Updated docs/release/phase-progress.md');
}
