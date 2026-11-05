// Local review only. Imports no hosted Supabase/Auth service.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({
  configFile: false, root: root + 'tests/browser/directory', publicDir: false, plugins: [react()],
  resolve: { alias: { '@': root + 'src' } },
  server: { host: '127.0.0.1', port: 4180, strictPort: true, fs: { allow: [root] } },
});
await server.listen();
console.log('Directory design review: http://127.0.0.1:4180/doctors (fictional profiles, no provider calls)');
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => { await server.close(); process.exit(0); });
