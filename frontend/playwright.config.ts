import { defineConfig } from '@playwright/test';

/**
 * Runs the end-to-end flow against the dev servers. By default Playwright starts
 * the frontend itself (real backend expected on :3000). Set E2E_BASE_URL to point
 * at an already-running server (e.g. the mock dev server) and skip the managed
 * webServer — useful for verifying the flow with the backend "pended".
 */
const externalBaseUrl = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: externalBaseUrl ?? 'http://localhost:5173' },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: true,
        timeout: 60_000,
      },
});
