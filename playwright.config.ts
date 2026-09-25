import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Creates the account and entities the visual matrix shoots, then hands the
  // signed-in cookies to it through `STORAGE_STATE`.
  globalSetup: './e2e/global-setup.ts',
  // `next dev` compiles a route the first time it is visited, so a single test can
  // legitimately spend most of a minute waiting on the compiler rather than the app.
  timeout: 120_000,
  // All specs drive one `next dev` instance plus the two sync services; parallel
  // workers make on-demand route compilation overflow the 5s default assertions.
  workers: 1,
  expect: {
    // Against `next dev` a cold route compiles slower than Playwright's 5s default,
    // so a login that lands on /documents in 6s reads as a failure.
    timeout: 20_000,
    toHaveScreenshot: {
      // Font antialiasing and tldraw's canvas differ enough to need a tolerance.
      maxDiffPixelRatio: 0.02,
    },
  },
  outputDir: './test-results',
  use: {
    baseURL: 'http://localhost:3000',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    {
      name: 'tablet',
      use: { viewport: { width: 768, height: 1024 } },
      // Only the visual matrix needs the smaller shells; functional specs are
      // viewport-independent and would triple the runtime.
      testMatch: /(visual|responsive).spec.ts/,
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 12'] },
      testMatch: /(visual|responsive).spec.ts/,
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev:collab',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'npm run dev:tldraw-sync',
      url: 'http://localhost:3002/health',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
