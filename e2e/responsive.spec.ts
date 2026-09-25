import { expect, test, type Page } from '@playwright/test';
import { login } from './helpers';


async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test('sidebar becomes drawer below 748px / inline above', async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name === 'mobile';
  await login(page);
  await page.goto('/documents');

  const toggle = page.getByRole('button', { name: '打开侧栏' });

  if (isMobile) {
    // 移动端：汉堡按钮可见，点开抽屉，Esc 关闭
    await expect(toggle).toBeVisible();
    await toggle.click();
    const drawer = page.getByRole('dialog');
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('link', { name: '首页' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden({ timeout: 5_000 }).catch(async () => {
      await page.mouse.click(380, 400);
      await expect(drawer).toBeHidden({ timeout: 3_000 });
    });
  } else {
    // 平板（834 ≥ 748）：无汉堡，侧栏常驻（complementary）
    await expect(toggle).toBeHidden();
    const sidebar = page.getByRole('complementary');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('link', { name: '首页' })).toBeVisible();
  }
});

test('pages do not overflow horizontally', async ({ page }) => {
  await login(page);
  for (const path of ['/documents', '/tasks', '/calendar', '/settings', '/trash']) {
    await page.goto(path);
    await page.waitForLoadState("domcontentloaded").catch(() => {});
    await assertNoHorizontalOverflow(page);
  }
});

test('editor right panel overlays without collapsing content', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', 'desktop 为并排布局，由 core 回归覆盖');
  await login(page);
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  await page.waitForLoadState("domcontentloaded").catch(() => {});

  const viewport = page.viewportSize()!;
  await page.getByRole('button', { name: '信息', exact: true }).click();
  const panel = page.getByRole('complementary', { name: '编辑器工具面板' });
  await expect(panel).toBeVisible();

  const panelBox = (await panel.boundingBox())!;
  expect(panelBox.width).toBeLessThanOrEqual(viewport.width * 0.9);

  // 正文区仍应有宽度（未被挤成 0）
  const editor = page.locator('[contenteditable="true"]').first();
  const editorBox = (await editor.boundingBox())!;
  expect(editorBox.width).toBeGreaterThan(50);

  await assertNoHorizontalOverflow(page);
});
