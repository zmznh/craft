import { expect, test } from '@playwright/test';

const email = 'craft-test@example.com';
const password = 'test1234';

/** Selection mode must start with nothing picked, and the count must reach the
 *  confirm dialog — the official copy echoes the number, so a mis-aimed click
 *  is still visible before it destroys anything. */
test('trash selection deletes only the checked documents', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);

  const title = `回收站选择 ${Date.now()}`;
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);

  await page.locator('input[placeholder="页面标题"]').fill(title);
  // The header debounces the title write, and a reload would abort it in flight.
  await page.waitForTimeout(1_500);
  await page.keyboard.press('Control+s');
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  const sidebar = page.locator('aside');
  // The tree refetches on navigation, not on a title write.
  await page.reload();
  const row = sidebar.getByText(title, { exact: true }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });

  await row.click({ button: 'right' });
  await page.getByRole('menu').getByRole('menuitem', { name: '移入回收站' }).click();
  await expect(sidebar.getByText(title, { exact: true })).toHaveCount(0, { timeout: 20_000 });

  const main = page.locator('main');
  await page.goto('/trash');
  const trashRow = main.getByText(title, { exact: true }).first();
  await expect(trashRow).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: '选择', exact: true }).click();
  await expect(page.getByText('已选 0 项')).toBeVisible();
  await expect(page.getByRole('button', { name: '永久删除所选' })).toBeDisabled();
  await expect(page.getByRole('button', { name: '还原所选' })).toBeDisabled();

  await main.getByRole('checkbox', { name: `选择 ${title}` }).click();
  await expect(page.getByText('已选 1 项')).toBeVisible();

  await page.getByRole('button', { name: '永久删除所选' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(`删除 1 个项目 你确定吗？你无法撤销此操作。`)).toBeVisible();
  await dialog.getByRole('button', { name: '取消' }).click();
  await expect(trashRow).toBeVisible();

  await page.getByRole('button', { name: '永久删除所选' }).click();
  await dialog.getByRole('button', { name: '删除' }).click();
  await expect(trashRow).toHaveCount(0);
});
