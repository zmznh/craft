import { chromium, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

/** The account the visual matrix owns. No other spec signs in as it. */
export const VISUAL_USER = { email: 'craft-visual@example.com', password: 'visual-baseline-1' };

/** Entities the visual specs shoot; nothing else writes to them. */
export const FIXTURE = {
  doc: '视觉基线文档',
  docBody: '基线正文，用于像素回归。',
  collection: '视觉基线集合',
  board: '视觉基线白板',
};

/** Relative to the project root, which is also Playwright's working directory. */
export const STORAGE_STATE = path.resolve('e2e', '.visual-state.json');

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', VISUAL_USER.email);
  await page.fill('input[type="password"]', VISUAL_USER.password);
  await page.click('button[type="submit"]');
  return page.waitForURL(/\/documents/, { timeout: 15_000 }).then(() => true).catch(() => false);
}

async function register(page: Page) {
  await page.goto('/register');
  await page.fill('#name', '视觉基线');
  await page.fill('#email', VISUAL_USER.email);
  await page.fill('#password', VISUAL_USER.password);
  await page.fill('#confirmPassword', VISUAL_USER.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/documents|\/login/, { timeout: 20_000 });
}

/** The editor shows 已保存 once the autosave round-trip lands. */
async function expectSaved(page: Page) {
  await page.getByText('已保存').first().waitFor({ timeout: 20_000 });
  await page.waitForTimeout(500);
}

async function ensureDocument(page: Page) {
  await page.goto('/documents');
  const existing = page.locator(`a:has-text("${FIXTURE.doc}")`).first();
  if (await existing.count()) {
    // Seeded already. Never touch the body again: the editor fills in from Yjs
    // asynchronously, so "does it contain the text?" can read empty and re-type.
    await page.goto((await existing.getAttribute('href'))!);
    return;
  }

  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  await page.locator('input[placeholder="页面标题"]').fill(FIXTURE.doc);
  // The header debounces the title save by 500ms.
  await page.waitForTimeout(1_200);
  const body = page.locator('[contenteditable="true"]').first();
  await body.click();
  // `fill` writes the DOM directly and ProseMirror reconciles that as a bulk
  // mutation, which leaves thousands of empty paragraphs behind in the Yjs doc.
  await page.keyboard.type(FIXTURE.docBody, { delay: 12 });
  await expectSaved(page);
}

async function ensureCollection(page: Page) {
  await page.goto('/collections');
  const card = page.locator(`a:has-text("${FIXTURE.collection}")`).first();
  if (await card.count()) {
    await page.goto((await card.getAttribute('href'))!);
  } else {
    await page.getByRole('button', { name: /新建集合/ }).first().click();
    await page.fill('#name', FIXTURE.collection);
    await page.getByRole('button', { name: /^创建$/ }).click();
    await page.waitForURL(/\/collections\//);
  }

  // Desktop adds rows through the footer button; the aria-labelled one only exists
  // in the phone toolbar.
  const addRow = page.getByRole('main').getByRole('button', { name: '新建', exact: true });
  if (!(await page.getByRole('main').locator('tbody tr').count())) {
    await addRow.click();
    await page.waitForTimeout(1_500);
  }
}

async function ensureBoard(page: Page) {
  await page.goto('/whiteboards');
  if (await page.locator(`a:has-text("${FIXTURE.board}")`).count()) return;

  await page.getByRole('button', { name: /新建白板/ }).click();
  await page.waitForURL(/\/whiteboards\//);
  await page.locator('input[aria-label="白板名称"]').fill(FIXTURE.board);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1_500);
}

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: BASE_URL, viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(30_000);

  try {
    if (!(await signIn(page))) {
      await register(page);
      if (!(await signIn(page))) throw new Error('visual seed: could not sign in');
    }

    await ensureDocument(page);
    await ensureCollection(page);
    await ensureBoard(page);

    await mkdir(path.dirname(STORAGE_STATE), { recursive: true });
    await page.context().storageState({ path: STORAGE_STATE });
  } finally {
    await browser.close();
  }
}
