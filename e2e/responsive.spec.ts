import { expect, test, type Page } from '@playwright/test';
import { FIXTURE, STORAGE_STATE } from './global-setup';

// Reuse the seeded visual account instead of the login form: the phone-form
// login path was flaking under the iPhone emulation, and the fixture account
// owns the entities these assertions read.
test.use({ storageState: STORAGE_STATE });

async function pageReady(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
}

/** 点击直到生效：React 水合完成前按钮没有 onClick（useIsMobile 的 SSR 快照也是 false）。 */
async function clickUntil(page: Page, trigger: Parameters<Page['locator']>[0], opens: Parameters<Page['locator']>[0], times = 5) {
  const target = page.locator(opens);
  for (let i = 0; i < times; i++) {
    await page.locator(trigger).click({ timeout: 10_000 }).catch(() => {});
    if (await target.isVisible({ timeout: 3_000 }).catch(() => false)) return true;
    await page.waitForTimeout(1_000);
  }
  return false;
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

/** Opens the seeded document the visual setup owns (no writes, no new docs). */
async function openFixtureDoc(page: Page) {
  await page.goto('/documents');
  await pageReady(page);
  const href = await page
    .locator(`a:has-text("${FIXTURE.doc}")`)
    .first()
    .getAttribute('href');
  if (!href) throw new Error(`fixture "${FIXTURE.doc}" missing on /documents`);
  await page.goto(href);
  await pageReady(page);
}

test('sidebar becomes drawer below 748px / inline above', async ({ page }, testInfo) => {
  const isMobile = testInfo.project.name === 'mobile';
  await page.goto('/documents');
  await pageReady(page);

  const toggle = page.getByRole('button', { name: '打开导航' });

  if (isMobile) {
    // 手机：汉堡按钮可见，点开抽屉（容忍水合竞态），Esc 关闭
    await expect(toggle).toBeVisible();
    const opened = await clickUntil(page, 'button[aria-label="打开导航"]', '[role="dialog"]');
    expect(opened, 'drawer never opened after retries').toBe(true);
    const drawer = page.getByRole('dialog');
    await expect(drawer.getByRole('link', { name: '首页' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(drawer).toBeHidden({ timeout: 5_000 });
  } else {
    // 平板（≥768）：无汉堡（CSS md:hidden），侧栏常驻
    await expect(toggle).toBeHidden();
    const sidebar = page.getByRole('complementary').first();
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('link', { name: '首页' })).toBeVisible();
  }
});

test('pages do not overflow horizontally', async ({ page }) => {
  for (const path of ['/documents', '/tasks', '/calendar', '/settings', '/trash']) {
    await page.goto(path);
    await page.waitForLoadState('domcontentloaded').catch(() => {});
    await assertNoHorizontalOverflow(page);
  }
});

test('editor right panel opens without collapsing content', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'desktop', '桌面并排布局由 core 回归覆盖');
  const viewport = page.viewportSize()!;

  await openFixtureDoc(page);

  if (testInfo.project.name === 'mobile') {
    // 手机：水合完成后编辑器顶栏才出现汉堡（isMobile 的客户端信号），
    // 「信息」被折叠进「更多面板」溢出菜单。
    await expect(page.getByRole('button', { name: '打开导航' })).toBeVisible({ timeout: 15_000 });
    await page.getByRole('button', { name: '更多面板' }).click();
    await page.getByRole('menuitem', { name: '信息' }).click();
  } else {
    // 平板：顶栏直出四个按钮，容忍水合竞态重试点
    const clicked = await clickUntil(page, 'button[aria-label="信息"]', '[role="tablist"][aria-label="编辑器工具"]');
    expect(clicked, 'info tab never opened after retries').toBe(true);
  }

  // 紧凑布局（平板/手机）下面是底部 Sheet，桌面 rail 是 complementary；
  // 两种形态共享同一个 tablist。
  const tablist = page.getByRole('tablist', { name: '编辑器工具' });
  await expect(tablist).toBeVisible();

  // 面板不能把正文挤没
  const editor = page.locator('[contenteditable="true"]').first();
  const editorBox = (await editor.boundingBox())!;
  expect(editorBox.width).toBeGreaterThan(50);

  await assertNoHorizontalOverflow(page);
  expect(viewport.width).toBeLessThan(1024);
});
