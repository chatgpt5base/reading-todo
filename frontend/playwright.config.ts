import { defineConfig } from '@playwright/test';

/**
 * Runs the US1 end-to-end flow against the dev servers. Start the backend
 * (npm run dev:backend) and frontend (npm run dev:frontend) before running,
 * or rely on the webServer config below.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:5173' },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
