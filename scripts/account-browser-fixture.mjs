// Local-only UI fixture. Not a release entrypoint and never uses hosted Auth.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = fileURLToPath(new URL('../tests/browser/accounts/', import.meta.url));
const service = fixture + 'accountService.fixture.ts';
const server = await createServer({ configFile: false, root: fixture, publicDir: false, plugins: [react()],
  resolve: { alias: [{ find: /^\.\/accountService$/, replacement: service },
    { find: '@/features/accounts/accountService', replacement: service }, { find: '@', replacement: root + 'src' }] },
  server: { host: '127.0.0.1', port: 4179, strictPort: true, fs: { allow: [root] } } });
await server.listen();
console.log('Synthetic account UI fixture: http://127.0.0.1:4179/auth?mode=signup');
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
