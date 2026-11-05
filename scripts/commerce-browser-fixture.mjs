// Fictional local catalog; no hosted Auth, hosted orders, provider calls or payment keys.
import {createServer} from 'vite';
import react from '@vitejs/plugin-react-swc';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const server=await createServer({configFile:false,root:root+'tests/browser/commerce',publicDir:root+'public',plugins:[react()],resolve:{alias:{'@':root+'src'}},server:{host:'127.0.0.1',port:4184,strictPort:true,fs:{allow:[root]}}});
await server.listen();console.log('Local catalog review: http://127.0.0.1:4184/shop (fictional products/reservations, no live orders or charges)');
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await server.close();process.exit(0);});
