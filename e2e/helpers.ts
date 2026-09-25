import { expect, type Page } from '@playwright/test';

export const EMAIL = 'craft-test@example.com';
export const PASSWORD = 'test1234';

/** 登录：30s 容错 + 出错自动重试一次（dev 并行编译下 signIn 可能变慢） */
export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  try {
    await page.waitForURL(/\/documents/, { timeout: 30_000 });
  } catch {
    const errBox = page.getByText(/邮箱或密码错误|登录失败/);
    if (await errBox.isVisible().catch(() => false)) {
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/documents/, { timeout: 30_000 });
    } else {
      throw new Error(`login did not redirect, stuck at ${page.url()}`);
    }
  }
  await expect(page).toHaveURL(/\/documents/);
}
