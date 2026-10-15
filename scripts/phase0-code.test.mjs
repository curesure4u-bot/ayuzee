import { test } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const read = path => readFileSync(new URL(path, root), 'utf8');
async function loadTs(path) {
  const output = ts.transpileModule(read(path), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import('data:text/javascript;base64,' + Buffer.from(output).toString('base64'));
}

test('changed application source parses without the dormant Razorpay syntax failure', () => {
  for (const path of ['src/lib/razorpay.ts', 'src/components/hms/BookAppointmentAction.ts', 'src/lib/previewPolicy.ts', 'src/components/common/FeaturePreview.tsx', 'src/App.tsx']) {
    const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true);
    assert.deepEqual(source.parseDiagnostics, [], path);
  }
});

test('application-project invocation exposes errors that an empty root project hides', () => {
  const pkg = JSON.parse(read('package.json'));
  assert.equal(pkg.scripts['typecheck:app'], 'tsc -p tsconfig.app.json --noEmit');
  assert.equal(pkg.scripts['typecheck:config'], 'tsc -p tsconfig.node.json --noEmit');
  const folder = mkdtempSync(join(tmpdir(), 'ayuzee-typecheck-'));
  try {
    writeFileSync(join(folder, 'tsconfig.json'), '{"files":[],"references":[{"path":"./tsconfig.app.json"}]}');
    writeFileSync(join(folder, 'tsconfig.app.json'), '{"compilerOptions":{"skipLibCheck":true,"types":[]},"files":["application.ts"]}');
    writeFileSync(join(folder, 'application.ts'), 'const value: number = "broken";');
    const compiler = join(dirname(fileURLToPath(import.meta.resolve('typescript'))), 'tsc.js');
    const empty = spawnSync(process.execPath, [compiler, '--noEmit'], { cwd: folder, encoding: 'utf8' });
    const app = spawnSync(process.execPath, [compiler, '-p', 'tsconfig.app.json', '--noEmit'], { cwd: folder, encoding: 'utf8' });
    assert.equal(empty.status, 0, empty.stdout + empty.stderr);
    assert.notEqual(app.status, 0);
    assert.match(app.stdout, /TS2322/);
  } finally { rmSync(folder, { recursive: true, force: true }); }
});

test('unreleased routes fail closed, including case and encoded-slash variants', async () => {
  const { previewForPath } = await loadTs('src/lib/previewPolicy.ts');
  for (const path of ['/hms', '/HMS/patients', '/hms%2fpatients', '/blog/..%2fhms', '/guides/../../wallet', '/shop/checkout', '/auth', '/wallet', '/doctor', '/consultation/123/room', '/new-unreviewed-module', '/%invalid']) assert.ok(previewForPath(path), path);
  for (const path of ['/', '/about-us/', '/privacy-policy', '/blog/readable-article', '/guides/doctor']) assert.equal(previewForPath(path), null, path);
  assert.ok(previewForPath('/blog-admin'));
  assert.ok(previewForPath('/guides-admin'));
});

test('booking services persist before notification and apply existing defaults', async () => {
  const { bookAppointmentWithNotification } = await loadTs('src/components/hms/BookAppointmentAction.ts');
  const calls = [];
  const result = await bookAppointmentWithNotification({ patient_name: 'Synthetic Patient', patient_phone: '0000000000', doctor_name: 'Synthetic Doctor', appointment_date: '2026-11-01', start_time: '10:00', sendWhatsapp: true }, {
    bookAppointment: async params => { calls.push(['save', params]); return { appointmentId: 'synthetic-id' }; },
    sendAppointmentConfirmation: async (...args) => { calls.push(['notify', args]); },
  });
  assert.deepEqual(calls.map(c => c[0]), ['save', 'notify']);
  assert.equal(calls[0][1].consultation_type, 'in_person');
  assert.equal(calls[0][1].booked_via, 'reception');
  assert.equal(calls[1][1].at(-1), 'synthetic-id');
  assert.deepEqual(result, { appointmentId: 'synthetic-id' });
});

test('failed booking never sends a confirmation', async () => {
  const { bookAppointmentWithNotification } = await loadTs('src/components/hms/BookAppointmentAction.ts');
  let notifications = 0;
  await assert.rejects(bookAppointmentWithNotification({ patient_name: 'Synthetic', patient_phone: '0000000000', doctor_name: 'Synthetic', appointment_date: '2026-11-01', start_time: '10:00', sendSms: true }, {
    bookAppointment: async () => { throw new Error('Synthetic persistence failure'); },
    sendAppointmentConfirmation: async () => { notifications++; },
  }), /persistence failure/);
  assert.equal(notifications, 0);
});

test('notification failure keeps the saved appointment and does not log patient details', async () => {
  const { bookAppointmentWithNotification } = await loadTs('src/components/hms/BookAppointmentAction.ts');
  const warn = console.warn;
  const messages = [];
  console.warn = (...args) => messages.push(args.join(' '));
  try {
    const result = await bookAppointmentWithNotification({ patient_name: 'Synthetic', patient_phone: '0000000000', doctor_name: 'Synthetic', appointment_date: '2026-11-01', start_time: '10:00', sendWhatsapp: true }, {
      bookAppointment: async () => ({ appointmentId: 'saved-id' }),
      sendAppointmentConfirmation: async () => { throw new Error('PRIVATE_SYNTHETIC_CANARY'); },
    });
    assert.equal(result.appointmentId, 'saved-id');
    assert.equal(messages.length, 1);
    assert.ok(!messages[0].includes('PRIVATE_SYNTHETIC_CANARY'));
  } finally { console.warn = warn; }
});
