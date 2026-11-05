import{defineConfig}from'vitest/config';
export default defineConfig({test:{environment:'node',include:['tests/database/fulfilment.native.test.ts'],testTimeout:20000,hookTimeout:30000,fileParallelism:false}});
