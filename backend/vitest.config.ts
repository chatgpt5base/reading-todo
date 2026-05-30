import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const testDb = join(here, 'prisma', 'test.db');

const env = {
  DATABASE_URL: `file:${testDb}`,
  SESSION_SECRET: 'test-secret-test-secret-test-secret-1234',
  NODE_ENV: 'test',
};

// Make values available to globalSetup (runs in the main process).
Object.assign(process.env, env);

export default defineConfig({
  test: {
    environment: 'node',
    env,
    globalSetup: ['./tests/globalSetup.ts'],
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
  },
});
