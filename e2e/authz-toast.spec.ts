import { expect, test, type Page } from '@playwright/test';

// One account per case. They share nothing except the schema, because a case that
// asserts "the only row in the trash" would break the moment a previous run left a row.
const REJECTION = '文档不存在或不属于你';
const STALE_RESTORE = { email: 'craft-authz-restore@example.com', password: 'test1234', name: '越权恢复测试' };
const STALE_BATCH = { email: 'craft-authz-batch@example.com', password: 'test1234', name: '越权批量测试' };
const STALE_TREE = { email: 'craft-authz-tree@example.com', password: 'test1234', name: '越权删除测试' };
const LEGIT = { email: 'craft-authz-legit@example.com', password: 'test1234', name: '合法恢复测试' };

type Account = typeof LEGIT;

async function signIn(page: Page, account: Account) {
  await page.goto('/login');
  await page.fill('input[type="email"]', account.email);
  await page.fill('input[type="password"]', account.password);
  await page.click('button[type="submit"]');
  const signedIn = await page
    .waitForURL(/\/documents/, { timeout: 20_000 })
    .then(() => true)
    .catch(() => false);
  if (signedIn) return;

  await page.goto('/register');
  await page.fill('#name', account.name);
  await page.fill('#email', account.email);
  await page.fill('#password', account.password);
  await page.fill('#confirmPassword', account.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/documents/, { timeout: 25_000 });
}

async function titledDoc(page: Page, title: string) {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  await page.getByPlaceholder('页面标题').fill(title);
  await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });
}

/** Sends a document from the sidebar tree to the trash. */
async function moveToTrash(page: Page, title: string) {
  await page.reload();
  const row = page.locator('aside').getByText(title, { exact: true }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.click({ button: 'right' });
  await page.getByRole('menu').getByRole('menuitem', { name: '移入回收站' }).click();
  await expect(page.locator('aside').getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });
}

/** Permanently deletes the one row this case put into the trash. */
async function purgeFromTrash(page: Page, title: string) {
  await page.goto('/trash');
  const row = page.locator('main').getByText(title, { exact: true }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '选择', exact: true }).click();
  await page.locator('main').getByRole('checkbox', { name: `选择 ${title}` }).click();
  await page.getByRole('button', { name: '永久删除所选' }).click();
  await page.getByRole('dialog').getByRole('button', { name: '删除' }).click();
  await expect(row).toHaveCount(0, { timeout: 20_000 });
}

test('a stale 恢复 row reports the rejection instead of pretending success', async ({ page, context }) => {
  await signIn(page, STALE_RESTORE);
  const title = `B123-越权恢复 ${Date.now()}`;
  await titledDoc(page, title);
  await moveToTrash(page, title);

  // Two tabs look at the same trash; one of them destroys the row the other still lists.
  const stale = await context.newPage();
  await stale.goto('/trash');
  await expect(stale.locator('main').getByText(title, { exact: true })).toBeVisible({ timeout: 20_000 });

  await purgeFromTrash(page, title);

  await stale.getByRole('button', { name: '恢复', exact: true }).click();
  await expect(stale.getByText(REJECTION)).toBeVisible({ timeout: 20_000 });
  await stale.close();
});

test('the batch 还原 path reports the same rejection through the same signal', async ({ page, context }) => {
  await signIn(page, STALE_BATCH);
  const title = `B123-越权批量 ${Date.now()}`;
  await titledDoc(page, title);
  await moveToTrash(page, title);

  const stale = await context.newPage();
  await stale.goto('/trash');
  await expect(stale.locator('main').getByText(title, { exact: true })).toBeVisible({ timeout: 20_000 });

  await purgeFromTrash(page, title);

  await stale.getByRole('button', { name: '选择', exact: true }).click();
  await stale.locator('main').getByRole('checkbox', { name: `选择 ${title}` }).click();
  await stale.getByRole('button', { name: '还原所选' }).click();
  await expect(stale.getByText(REJECTION)).toBeVisible({ timeout: 20_000 });
  await stale.close();
});

test('a stale tree row reports the rejection when it is sent to the trash', async ({ page, context }) => {
  await signIn(page, STALE_TREE);
  const title = `B123-越权删除 ${Date.now()}`;
  await titledDoc(page, title);

  const stale = await context.newPage();
  await stale.goto('/documents');
  const staleRow = stale.locator('aside').getByText(title, { exact: true }).first();
  await expect(staleRow).toBeVisible({ timeout: 20_000 });

  await moveToTrash(page, title);
  await purgeFromTrash(page, title);

  await staleRow.click({ button: 'right' });
  await stale.getByRole('menu').getByRole('menuitem', { name: '移入回收站' }).click();
  await expect(stale.getByText(REJECTION)).toBeVisible({ timeout: 20_000 });
  await stale.close();
});

test('the same action on a row that does exist clears the row and says nothing', async ({ page }) => {
  await signIn(page, LEGIT);
  const title = `B123-合法恢复 ${Date.now()}`;
  await titledDoc(page, title);
  await moveToTrash(page, title);

  await page.goto('/trash');
  const row = page.locator('main').getByText(title, { exact: true }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: '恢复', exact: true }).click();

  // The positive control: the identical click on a row that still exists takes it out
  // of the trash without an authorization message.
  await expect(row).toHaveCount(0, { timeout: 20_000 });
  await expect(page.getByText(REJECTION)).toHaveCount(0);
});
