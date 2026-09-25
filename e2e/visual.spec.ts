import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';
import { mkdirSync } from 'node:fs';

const SHOTS = 'test-results/shots';
mkdirSync(SHOTS, { recursive: true });

async function shoot(page: Page, project: string, name: string) {
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${SHOTS}/${project}-${name}.png`, fullPage: false });
}

const routes: [string, string][] = [
  ['documents', '/documents'],
  ['favorites', '/favorites'],
  ['recent', '/recent'],
  ['daily-notes', '/daily-notes'],
  ['tasks', '/tasks'],
  ['calendar', '/calendar'],
  ['templates', '/templates'],
  ['trash', '/trash'],
  ['collections', '/collections'],
  ['whiteboards', '/whiteboards'],
  ['settings', '/settings'],
];

test('visual: full-route screenshots', async ({ page }, testInfo) => {
  test.setTimeout(180_000);
  const project = testInfo.project.name;
  await login(page);

  for (const [name, path] of routes) {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded');
    // 页面主体可见即可截图（空状态也算正常渲染）
    await expect(page.locator('body')).toBeVisible({ timeout: 15_000 });
    await shoot(page, project, name);
  }

  // 命令面板（⌘K / Ctrl+K）
  await page.goto('/documents');
  await page.keyboard.press('Control+k');
  await expect(page.locator('input').first()).toBeFocused().catch(async () => {
    await expect(page.locator('[role=dialog], [cmdk-root]').first()).toBeVisible();
  });
  await shoot(page, project, 'command-palette');
  await page.keyboard.press('Escape');

  // 编辑器页：新建一篇文档后截图（各视口各留一篇 e2e 文档）
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  await expect(page.locator('body')).toContainText('已保存', { timeout: 15_000 }).catch(() => {});
  await shoot(page, project, 'editor');

  // 编辑器右侧面板（覆盖式/并排式行为不同视口有差异）
  await page.getByRole('button', { name: '信息', exact: true }).click();
  await expect(page.getByRole('complementary', { name: '编辑器工具面板' })).toBeVisible();
  await shoot(page, project, 'editor-info-panel');
});

test('visual: login page', async ({ page }, testInfo) => {
  const project = testInfo.project.name;
  await page.goto('/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
  await shoot(page, project, 'login');
});
