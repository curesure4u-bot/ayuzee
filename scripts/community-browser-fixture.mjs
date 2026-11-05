// Local review only: no hosted Auth, provider calls or database connection.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const server = await createServer({ configFile: false, root: root + 'tests/browser/community', publicDir: root + 'public', plugins: [react()], resolve: { alias: { '@': root + 'src' } }, server: { host:'127.0.0.1',port:4183,strictPort:true,fs:{allow:[root]} } });
await server.listen();
console.log('Community review: http://127.0.0.1:4183/feed (fictional data; local changes only)');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
