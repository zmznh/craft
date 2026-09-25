import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  workers: 2,
  use: {
    baseURL: 'http://localhost:3010',
  },
  projects: [
    {
      // 桌面：功能回归 + 全路由截图（1440×900，对齐 design-spec 采集视口）
      name: 'desktop',
      use: { viewport: { width: 1440, height: 900 } },
      testIgnore: /responsive\.spec\.ts/,
    },
    {
      // 平板：截图 + 响应式行为
      name: 'tablet',
      use: { viewport: { width: 834, height: 1112 } },
      testMatch: /(visual|responsive)\.spec\.ts/,
    },
    {
      // 移动：截图 + 响应式行为
      name: 'mobile',
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
      testMatch: /(visual|responsive)\.spec\.ts/,
    },
  ],
  webServer: {
    // 使用独立端口，避免与本机已运行的其他实例（:3000）冲突
    command: 'npm run dev -- --port 3010',
    url: 'http://localhost:3010',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
