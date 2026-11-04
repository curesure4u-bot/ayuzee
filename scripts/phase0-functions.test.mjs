import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const names = ['gemini-proxy', 'telegram-send', 'telegram-webhook', 'whatsapp-send', 'whatsapp-task-webhook'];

test('every deployed endpoint imports natively and denies execution without provider calls or sensitive logging', async () => {
  const originalFetch = globalThis.fetch;
  const originalLog = console.log;
  let providerCalls = 0;
  const logs = [];
  globalThis.fetch = async () => { providerCalls++; throw new Error('Provider access must remain disabled'); };
  console.log = (...args) => logs.push(args);
  try {
    for (const name of names) {
      const { handler } = await import(new URL(`../netlify/functions/${name}.js`, import.meta.url));
      for (const httpMethod of ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
        const response = await handler({ httpMethod, body: 'SYNTHETIC_PRIVATE_MESSAGE', headers: { authorization: 'Bearer synthetic' }, queryStringParameters: { 'hub.mode': 'subscribe', 'hub.verify_token': 'synthetic' } });
        assert.equal(response.statusCode, 503, `${name}: ${httpMethod}`);
        const body = JSON.parse(response.body);
        assert.equal(body.success, false);
        assert.equal(body.ok, false);
        assert.equal(body.preview, true);
        assert.equal(body.code, 'FEATURE_PREVIEW');
        assert.equal(response.headers['Cache-Control'], 'no-store');
        assert.ok(!response.body.includes('SYNTHETIC_PRIVATE_MESSAGE'));
      }
    }
    assert.equal(providerCalls, 0);
    assert.equal(logs.length, 0);
  } finally { globalThis.fetch = originalFetch; console.log = originalLog; }
});

test('deployed functions contain only reviewed entrypoints; retained implementations parse outside that directory', () => {
  const deployed = new URL('../netlify/functions/', import.meta.url);
  assert.deepEqual(readdirSync(deployed).filter(name => /\.[cm]?js$/.test(name)).sort(), names.map(name => name + '.js').sort());
  for (const name of names) {
    const path = fileURLToPath(new URL(`../netlify/disabled-implementations/${name}.cjs`, import.meta.url));
    assert.equal(spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' }).status, 0, name);
  }
});
