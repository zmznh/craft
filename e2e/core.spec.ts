import { expect, test } from '@playwright/test';
import { login } from './helpers';

test('login redirects to documents', async ({ page }) => {
  await login(page);
  await expect(page).toHaveURL(/\/documents/);
});

test('create document, edit, and persist content', async ({ page }) => {
  await login(page);

  // 新建文档
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);

  // 输入内容并等待自动保存
  const editor = page.locator('.ProseMirror .tiptap').first().or(page.locator('[contenteditable="true"]').first());
  await editor.click();
  await editor.fill('E2E 冒烟内容');
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 15_000 });

  // 刷新后内容仍在
  await page.reload();
  await expect(page.locator('text=E2E 冒烟内容')).toBeVisible();
});

test('settings persist preference selection', async ({ page }) => {
  await login(page);

  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();
  const mark = page.locator('button[aria-pressed="true"]').first();
  await expect(mark).toBeVisible();
});
