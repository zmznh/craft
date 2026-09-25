import { expect, test, type Page } from '@playwright/test';

const email = 'craft-test@example.com';
const password = 'test1234';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);
}

test('two sessions sync edits in real time', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await login(pageA);
  await login(pageB);

  // A creates a document
  await pageA.goto('/documents');
  await pageA.getByRole('button', { name: /新建/ }).first().click();
  await pageA.waitForURL(/\/documents\/[a-f0-9-]+/);
  const docUrl = pageA.url();

  // B opens the same document
  await pageB.goto(docUrl);
  await expect(pageB.locator('.ProseMirror').first()).toBeVisible({ timeout: 15_000 });
  await pageA.waitForTimeout(1500);

  // A types; B must see it
  const editorA = pageA.locator('.ProseMirror').first();
  await editorA.click();
  await pageA.keyboard.type('实时协作双端内容');
  await expect(pageB.locator('text=实时协作双端内容')).toBeVisible({ timeout: 15_000 });

  // A's caret is broadcast through awareness and painted in B's overlay
  await expect(pageB.locator('.crafty-remote-cursor')).toHaveCount(1, { timeout: 15_000 });
  await expect(pageB.locator('.crafty-remote-cursor__label')).toBeVisible();

  // A leaves the document; B's overlay must not keep a ghost caret
  await pageA.goto('/documents');
  await expect(pageB.locator('.crafty-remote-cursor')).toHaveCount(0, { timeout: 15_000 });

  await contextA.close();
  await contextB.close();
});

test('reopening a document does not duplicate its blocks', async ({ page }) => {
  // The seed-on-first-sync guard used to fire when the socket merely opened, so it
  // injected the stored JSON next to the copy arriving from the server and the
  // document doubled on every mount.
  await login(page);
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\/[a-f0-9-]+/);

  const editor = page.locator('.ProseMirror').first();
  await editor.click();
  await page.keyboard.type('重开不重复');
  await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });

  for (let reload = 0; reload < 2; reload += 1) {
    await page.reload();
    await expect(editor).toBeVisible({ timeout: 20_000 });
    await page.waitForTimeout(2_500);
    await expect(editor.locator('> *')).toHaveCount(1);
    await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });
  }
});

test('offline edits merge back after the connection drops', async ({ browser }) => {
  const contextA = await browser.newContext();
  const contextB = await browser.newContext();
  const pageA = await contextA.newPage();
  const pageB = await contextB.newPage();

  await login(pageA);
  await login(pageB);

  await pageA.goto('/documents');
  await pageA.getByRole('button', { name: /新建/ }).first().click();
  await pageA.waitForURL(/\/documents\/[a-f0-9-]+/);
  await pageB.goto(pageA.url());
  await expect(pageB.locator('.ProseMirror').first()).toBeVisible({ timeout: 15_000 });

  await pageA.locator('.ProseMirror').first().click();
  await pageA.keyboard.type('断线前内容');
  await expect(pageB.locator('text=断线前内容')).toBeVisible({ timeout: 15_000 });

  await contextA.setOffline(true);
  await pageA.keyboard.type('离线补写');
  await pageA.waitForTimeout(1000);
  await contextA.setOffline(false);

  // Yjs rebases the offline changes once the room is reachable again.
  await expect(pageB.locator('text=离线补写')).toBeVisible({ timeout: 30_000 });
  await expect(pageA.locator('text=断线前内容')).toBeVisible();

  await pageB.locator('.ProseMirror').first().click();
  await pageB.keyboard.type('恢复后对端写入');
  await expect(pageA.locator('text=恢复后对端写入')).toBeVisible({ timeout: 15_000 });

  await contextA.close();
  await contextB.close();
});
