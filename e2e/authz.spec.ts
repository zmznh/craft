import { expect, test, type Page } from '@playwright/test';

const OWNER = { email: 'craft-test@example.com', password: 'test1234' };
const INTRUDER = { email: 'e2e-intruder@example.com', password: 'test1234' };

async function login(page: Page, account: { email: string; password: string }) {
  await page.goto('/login');
  await page.fill('input[type="email"]', account.email);
  await page.fill('input[type="password"]', account.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/(documents|settings|trash|favorites|recent|tasks|calendar|collections|whiteboards|templates|daily-notes)/);
}

async function ensureAccount(page: Page, account: { email: string; password: string }) {
  const res = await page.request.post('/api/auth/register', {
    data: { name: 'E2E Intruder', email: account.email, password: account.password },
  });
  // 201/200 = created, 409 = already exists. Anything else is a real failure.
  expect([200, 201, 409]).toContain(res.status());
}

test('a non-owner cannot open, collab-connect, or edit another user’s document', async ({
  browser,
}) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage, OWNER);

  await ownerPage.goto('/documents');
  await ownerPage.getByRole('button', { name: /新建/ }).first().click();
  await ownerPage.waitForURL(/\/documents\/[\w-]+/);
  const documentId = ownerPage.url().split('/').pop() as string;

  await ownerPage.locator('.ProseMirror .tiptap, [contenteditable="true"]').first().click();
  await ownerPage
    .locator('.ProseMirror .tiptap, [contenteditable="true"]')
    .first()
    .fill('私有内容 P0');
  await expect(ownerPage.getByText('已保存')).toBeVisible({ timeout: 15_000 });

  const intruderCtx = await browser.newContext();
  const intruderPage = await intruderCtx.newPage();
  await ensureAccount(intruderPage, INTRUDER);
  await login(intruderPage, INTRUDER);

  // Route guard: the editor never renders for a stranger.
  await intruderPage.goto(`/documents/${documentId}`);
  await intruderPage.waitForURL(/\/documents$/);
  await expect(intruderPage.locator('.ProseMirror')).toHaveCount(0);

  // Collaboration token: refused before any room is created.
  const tokenRes = await intruderPage.request.post('/api/collab/token', {
    data: { documentId },
  });
  expect(tokenRes.status()).toBe(404);
  const body = await tokenRes.json();
  expect(body.error).toBeTruthy();

  await ownerCtx.close();
  await intruderCtx.close();
});

test('a non-owner cannot open or join another user’s whiteboard', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage, OWNER);

  await ownerPage.goto('/whiteboards');
  await ownerPage.getByRole('button', { name: '新建白板' }).click();
  await ownerPage.waitForURL(/\/whiteboards\/[\w-]+/);
  const boardId = ownerPage.url().split('/').pop() as string;

  const intruderCtx = await browser.newContext();
  const intruderPage = await intruderCtx.newPage();
  await ensureAccount(intruderPage, INTRUDER);
  await login(intruderPage, INTRUDER);

  await intruderPage.goto(`/whiteboards/${boardId}`);
  await intruderPage.waitForURL(/\/whiteboards$/);
  await expect(intruderPage.locator('.tl-container')).toHaveCount(0);

  await ownerCtx.close();
  await intruderCtx.close();
});

test('the owner can grant read-only access from the info panel', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage, OWNER);

  await ownerPage.goto('/documents');
  await ownerPage.getByRole('button', { name: /新建/ }).first().click();
  await ownerPage.waitForURL(/\/documents\/[\w-]+/);
  const documentId = ownerPage.url().split('/').pop() as string;

  const marker = `协作者只读 ${Date.now()}`;
  await ownerPage.locator('[contenteditable="true"]').first().click();
  await ownerPage.keyboard.type(marker, { delay: 8 });
  await ownerPage.keyboard.press('Control+s');
  await expect(ownerPage.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  const intruderCtx = await browser.newContext();
  const intruderPage = await intruderCtx.newPage();
  await ensureAccount(intruderPage, INTRUDER);
  await login(intruderPage, INTRUDER);

  // Without a grant the document is not theirs at all.
  await intruderPage.goto(`/documents/${documentId}`);
  await intruderPage.waitForURL(/\/documents$/);

  await ownerPage.getByRole('button', { name: '信息' }).first().click();
  await ownerPage.getByLabel('协作者邮箱').fill(INTRUDER.email);
  await ownerPage.getByLabel('新增协作者权限').selectOption('viewer');
  await ownerPage.getByRole('button', { name: '添加', exact: true }).click();
  await expect(
    ownerPage.getByLabel(`移除协作者 ${INTRUDER.email}`)
  ).toBeVisible({ timeout: 20_000 });

  // Granted read access: the body renders and the editor refuses writes.
  await intruderPage.goto(`/documents/${documentId}`);
  const body = intruderPage.locator('.ProseMirror').first();
  await expect(body).toContainText(marker);
  await expect(body).toHaveAttribute('contenteditable', 'false');

  const tokenRes = await intruderPage.request.post('/api/collab/token', {
    data: { documentId },
  });
  expect(tokenRes.status()).toBe(200);
  const claims = await tokenRes.json();
  expect(claims.role).toBe('viewer');
  expect(claims.readOnly).toBe(true);

  // Revoking takes the page away again on the next load.
  await ownerPage.getByLabel(`移除协作者 ${INTRUDER.email}`).click();
  await expect(ownerPage.getByLabel(`移除协作者 ${INTRUDER.email}`)).toHaveCount(0);
  await intruderPage.goto(`/documents/${documentId}`);
  await intruderPage.waitForURL(/\/documents$/);

  await ownerCtx.close();
  await intruderCtx.close();
});
