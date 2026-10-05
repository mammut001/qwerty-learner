import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e-study',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list']],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-study',
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['notifications'],
      },
    },
  ],
  webServer: [
    {
      command: 'node server/study-plan.mjs',
      url: 'http://127.0.0.1:8787/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: {
        ...process.env,
        HOST: '127.0.0.1',
        PORT: '8787',
        STUDY_ORIGIN: 'http://127.0.0.1:4173',
        STUDY_DB_PATH: '.tmp/study-e2e.sqlite',
      },
    },
    {
      command: 'npx vite --host 127.0.0.1 --port 4173',
      url: 'http://127.0.0.1:4173/study-plan',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
})
