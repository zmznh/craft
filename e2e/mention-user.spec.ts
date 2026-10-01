import { expect, test, type Browser, type Page } from '@playwright/test';

// Three accounts, all created by this spec: the writer, the person invited so there
// is someone to mention, and a stranger whose name must never surface as a candidate.
const OWNER = { email: 'craft-mention-owner@example.com', password: 'test1234', name: '发起者甲' };
const PEER = { email: 'craft-mention-peer@example.com', password: 'test1234', name: '协作者乙' };
const OUTSIDER = { email: 'craft-mention-outsider@example.com', password: 'test1234', name: '路人丙' };

type Account = typeof OWNER;

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

/** Registers an account if it does not exist yet, then drops the session. */
async function ensureAccount(browser: Browser, account: Account) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await signIn(page, account);
  await context.close();
}

async function newDoc(page: Page) {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  return page.locator('.ProseMirror').first();
}

/** Invites `account` through the 信息 panel, then closes the panel again. */
async function invite(page: Page, account: Account) {
  await page.getByRole('button', { name: '信息', exact: true }).click();
  const emailBox = page.locator('input[aria-label="协作者邮箱"]');
  await emailBox.fill(account.email);
  await page.getByRole('button', { name: '添加', exact: true }).click();
  await expect(page.getByText(account.name).first()).toBeVisible();
  await page.getByRole('button', { name: '关闭编辑器工具面板' }).click();
}

test('@ opens a menu of the people who hold this document', async ({ page, browser }) => {
  await ensureAccount(browser, PEER);
  await signIn(page, OWNER);
  const editor = await newDoc(page);
  await invite(page, PEER);

  await editor.click();
  await page.keyboard.type('@');

  await expect(page.getByText('提及人员')).toBeVisible();
  await expect(page.getByRole('button', { name: /协作者乙/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /发起者甲/ })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByText('提及人员')).toHaveCount(0);
});

test('Enter picks the highlighted candidate instead of splitting the block', async ({ page, browser }) => {
  await ensureAccount(browser, PEER);
  await signIn(page, OWNER);
  const editor = await newDoc(page);
  await invite(page, PEER);

  await editor.click();
  // The `@` and the query are consumed by the selection, so the block ends up
  // holding only the chip.
  await page.keyboard.type('@协');
  await expect(page.getByRole('button', { name: /协作者乙/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /发起者甲/ })).toHaveCount(0);
  await page.keyboard.press('Enter');

  await expect(editor.locator('> *').first()).toHaveText('协作者乙');
  // Enter has to be answered before ProseMirror's base keymap: a split would leave
  // the query in the first block and add a second one.
  await expect(editor.locator('> *')).toHaveCount(1);

  // A person chip has no page to open, so it must not be a control at all.
  await expect(editor.getByRole('button', { name: '协作者乙', exact: true })).toHaveCount(0);

  const urlBefore = page.url();
  await editor.getByText('协作者乙').click();
  await expect(page).toHaveURL(urlBefore);
});

test('clicking a row inserts the chip, and the chip is still there after a reload', async ({ page, browser }) => {
  await ensureAccount(browser, PEER);
  await signIn(page, OWNER);
  const editor = await newDoc(page);
  await invite(page, PEER);

  await editor.click();
  await page.keyboard.type('@协');
  await page.getByRole('button', { name: /协作者乙/ }).click();

  await expect(editor.locator('> *').first()).toHaveText('协作者乙');

  await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await expect(editor).toBeVisible();
  await expect(editor.getByText('协作者乙')).toHaveCount(1);
});

test('a stranger who was not invited is never offered', async ({ page, browser }) => {
  await ensureAccount(browser, PEER);
  await ensureAccount(browser, OUTSIDER);

  // The stranger has to hold *some* document, or the case below would still pass if
  // the candidate query stopped filtering by document — an uninvited account that
  // exists nowhere is not a test of the filter.
  const peerContext = await browser.newContext();
  const peerPage = await peerContext.newPage();
  await signIn(peerPage, PEER);
  await newDoc(peerPage);
  await invite(peerPage, OUTSIDER);
  await peerContext.close();

  await signIn(page, OWNER);
  const editor = await newDoc(page);
  await invite(page, PEER);

  await editor.click();
  await page.keyboard.type('@路');

  await expect(page.getByText('无匹配人员')).toBeVisible();
  await expect(page.getByRole('button', { name: /路人丙/ })).toHaveCount(0);
});
