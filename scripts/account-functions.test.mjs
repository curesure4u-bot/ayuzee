import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import ts from 'typescript';

const names = ['check-badges','job-fraud-detect','panchakarma-seed','panchakarma-check-conflicts','create-delhivery-shipment','delhivery-track','razorpay-refund'];
const read = path => readFile(new URL(path, import.meta.url), 'utf8');
const moduleUrl = source => 'data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText).toString('base64');
test('all audited unfinished privileged function entrypoints deny execution', async () => {
  const shared = moduleUrl(await read('../supabase/functions/_shared/preview.ts'));
  const priorDeno = globalThis.Deno, priorFetch = globalThis.fetch;
  let handler;
  globalThis.Deno = { serve: value => { handler = value; }, env: { get: () => { throw new Error('Unexpected credential access'); } } };
  globalThis.fetch = () => { throw new Error('Unexpected provider request'); };
  try {
    for (const name of names) {
      handler = null;
      const source = await read('../supabase/functions/' + name + '/index.ts');
      assert.deepEqual([...source.matchAll(/from\s+["']([^"']+)/g)].map(match => match[1]), ['../_shared/preview.ts']);
      await import(moduleUrl(source.replace('../_shared/preview.ts', shared) + '\n// ' + name));
      assert.equal(typeof handler, 'function', name);
      for (const method of ['GET','POST','DELETE']) {
        const response = handler(new Request('https://fixture.invalid/functions/v1/' + name, { method,
          ...(method === 'POST' ? { body: JSON.stringify({ user_id: 'another-account', role: 'admin', token: 'synthetic-sensitive-value' }) } : {}) }));
        assert.equal(response.status, 503, name);
        const text = await response.text();
        assert.equal(JSON.parse(text).success, false); assert.equal(JSON.parse(text).code, 'FEATURE_PREVIEW');
        assert.ok(!text.includes('synthetic-sensitive-value'));
      }
      assert.equal(handler(new Request('https://fixture.invalid', { method: 'OPTIONS' })).status, 204);
    }
  } finally { globalThis.Deno = priorDeno; globalThis.fetch = priorFetch; }
});
