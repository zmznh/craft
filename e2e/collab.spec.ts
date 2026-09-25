import { expect, test, type Page } from '@playwright/test';

const email = 'craft-test@example.com';
const password = 'test1234';

async function login(page: import('@playwright/test').Page) {
  const { login: doLogin } = await import('./helpers');
  await doLogin(page);
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

  await contextA.close();
  await contextB.close();
});
