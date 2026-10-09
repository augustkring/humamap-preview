import { defineConfig, devices } from '@playwright/test'

// The suite checks a fresh production build, served as a production deploy, or as a preview with E2E_PREVIEW set.
const preview = Boolean(process.env.E2E_PREVIEW)
const port = preview ? 3101 : 3100
const baseURL = `http://localhost:${port}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  // A stuck run fails with its report instead of holding CI until the job times out.
  globalTimeout: 10 * 60_000,
  reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: 'on-first-retry' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Next itself, not a pnpm script, so the stop signal reaches the server and the run ends.
    command: `next build && next start --port ${port}`,
    url: baseURL,
    env: { SITE_ENV: preview ? '' : 'production', SITE_URL: baseURL },
    reuseExistingServer: false,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    timeout: 300_000,
  },
})
