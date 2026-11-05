import{defineConfig}from'vitest/config';
export default defineConfig({test:{environment:'node',include:['tests/database/refunds.native.test.ts'],testTimeout:20000,hookTimeout:30000,fileParallelism:false}});
