import { createServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const fixture = fileURLToPath(new URL('../tests/browser/access/', import.meta.url));
const server = await createServer({ configFile: false, root: fixture, publicDir: false, plugins: [react()],
  resolve: { alias: [{ find: '@/features/accounts/accountService', replacement: fixture + 'accountService.fixture.ts' }, { find: '@', replacement: root + 'src' }] },
  server: { host: '127.0.0.1', port: 4181, strictPort: true, fs: { allow: [root] } } });
await server.listen();
console.log('Synthetic role-based workspace review: http://127.0.0.1:4181/workspace/patient');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
