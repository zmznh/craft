import { expect, test, type Page } from '@playwright/test';

// G05's UI half: the action layer was closed in batch 116, but nothing in a browser
// had ever checked what a visitor actually sees for an unpublished share.
const WRITER = { email: 'craft-share-publish@example.com', password: 'test1234', name: '分享发布测试' };
const INVALID = '链接无效或文档已删除';
const INVALID_PUBLIC = '页面不存在或未发布';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', WRITER.email);
  await page.fill('input[type="password"]', WRITER.password);
  await page.click('button[type="submit"]');
  const signedIn = await page
    .waitForURL(/\/documents/, { timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  if (signedIn) return;

  await page.goto('/register');
  await page.fill('#name', WRITER.name);
  await page.fill('#email', WRITER.email);
  await page.fill('#password', WRITER.password);
  await page.fill('#confirmPassword', WRITER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/documents/, { timeout: 25_000 });
}

/** Opens the share dialog and returns the token the displayed `/s/` link carries. */
async function shareToken(page: Page) {
  await page.locator('button[aria-label="分享"]').click();
  await expect(page.getByText('分享此文档')).toBeVisible();
  const link = await page.getByText(/\/s\/[A-Za-z0-9-]+/).first().textContent();
  const token = /\/s\/([A-Za-z0-9-]+)/.exec(link ?? '')?.[1];
  if (!token) throw new Error('分享弹层里没有可读的 /s/ 链接');
  return token;
}

test('an unpublished share reads as invalid on both link shapes, and publishing opens them together', async ({
  page,
  browser,
}) => {
  await signIn(page);
  const stamp = Date.now();
  const title = `SP${stamp}`;
  const sentinel = `正文哨兵${stamp}`;

  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  await page.getByPlaceholder('页面标题').fill(title);
  const editor = page.locator('.ProseMirror').first();
  await editor.click();
  await page.keyboard.type(sentinel);
  await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });

  const token = await shareToken(page);
  const visitor = await browser.newContext();
  const view = await visitor.newPage();

  // Signed out, holding a valid token, still gets nothing while the document is unpublished.
  await view.goto(`/s/${token}`);
  await expect(view.getByText(INVALID)).toBeVisible();
  await expect(view.getByText(sentinel)).toHaveCount(0);

  await view.goto(`/p/${token}`);
  await expect(view.getByText(INVALID_PUBLIC)).toBeVisible();

  await page.getByRole('switch', { name: '发布为公开页面' }).click();
  await expect(page.getByText('公开页面地址')).toBeVisible();

  // The switch paints from local state, so its own appearance is not evidence the
  // write landed. Poll a fresh server read until it does — a toggle that never
  // persists stays red here.
  await expect(async () => {
    await view.goto(`/s/${token}`);
    expect(await view.getByText(sentinel).count()).toBe(1);
  }).toPass({ timeout: 20_000 });

  await view.goto(`/p/${token}`);
  await expect(view.getByText(sentinel)).toBeVisible();

  // Turning it back off has to close both shapes again — the same gate, not one page.
  await page.getByRole('switch', { name: '发布为公开页面' }).click();
  await expect(async () => {
    await view.goto(`/s/${token}`);
    expect(await view.getByText(INVALID).count()).toBe(1);
  }).toPass({ timeout: 20_000 });
  await view.goto(`/p/${token}`);
  await expect(view.getByText(INVALID_PUBLIC)).toBeVisible();

  await visitor.close();
});
