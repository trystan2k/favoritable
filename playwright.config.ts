import { randomUUID } from 'node:crypto';

import { defineConfig, devices } from '@playwright/test';

const E2E_PORT = 4173;
const E2E_BASE_URL = `http://127.0.0.1:${E2E_PORT}`;
const E2E_TEST_SESSION_SECRET =
  process.env.E2E_TEST_SESSION_SECRET ?? `${randomUUID()}-${randomUUID()}`;

process.env.E2E_TEST_SESSION_SECRET = E2E_TEST_SESSION_SECRET;

export default defineConfig({
  testDir: './e2e/tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html', { outputFolder: 'playwright-report/html' }],
    ['json', { outputFile: 'playwright-report/results.json' }]
  ],
  outputDir: '.playwright/test-results',
  use: {
    baseURL: E2E_BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome']
      }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'pnpm preview:e2e',
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    stderr: 'pipe',
    stdout: 'ignore',
    timeout: 120000
  }
});
