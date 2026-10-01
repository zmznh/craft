import { expect, test, type Locator, type Page } from '@playwright/test';

// One account writes every document here: the `[[` menu only offers documents the
// signed-in user owns, so a second account would prove nothing about the menu itself.
const WRITER = { email: 'craft-block-link@example.com', password: 'test1234', name: '链接发起者' };

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

async function newDoc(page: Page) {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  return page.locator('.ProseMirror').first();
}

/** The link search reads titles from the database, so the title has to be saved first. */
async function titledDoc(page: Page, title: string) {
  await newDoc(page);
  await page.getByPlaceholder('页面标题').fill(title);
  await expect(page.getByText('已保存', { exact: true })).toBeVisible({ timeout: 20_000 });
}

/**
 * A document title is also printed by every sidebar row that holds it, so rows are
 * addressed from the floating layer's own root — the section header's parent.
 */
function linkMenu(page: Page): Locator {
  return page.getByText('链接到文档', { exact: true }).locator('xpath=..');
}

function menuRows(page: Page) {
  return linkMenu(page).locator('> button');
}

/**
 * Records every wording the menu's empty-state row shows, from before the trigger is
 * typed. `toBeVisible()` alone cannot catch a claim that flashes and disappears, and
 * this defect is exactly a flash.
 */
async function recordEmptyStates(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __linkStates?: string[]; __linkObs?: MutationObserver };
    w.__linkStates = [];
    const known = ['搜索中…', '无匹配文档'];
    const scan = () => {
      for (const el of Array.from(document.querySelectorAll('div'))) {
        const text = (el.textContent ?? '').trim();
        if (known.includes(text) && w.__linkStates?.[w.__linkStates.length - 1] !== text) {
          w.__linkStates?.push(text);
        }
      }
    };
    w.__linkObs = new MutationObserver(scan);
    w.__linkObs.observe(document.body, { childList: true, subtree: true });
    scan();
  });
}

async function readEmptyStates(page: Page) {
  return page.evaluate(() => {
    const w = window as unknown as { __linkStates?: string[]; __linkObs?: MutationObserver };
    w.__linkObs?.disconnect();
    return w.__linkStates ?? [];
  });
}

test('the menu never claims 无匹配文档 while a matching document is still on its way', async ({ page }) => {
  await signIn(page);
  const target = `LK甲${Date.now()}`;
  await titledDoc(page, target);

  const editor = await newDoc(page);
  await recordEmptyStates(page);
  await editor.click();
  await page.keyboard.type(`[[${target}`);
  await expect(menuRows(page).filter({ hasText: target })).toBeVisible();

  const seen = await readEmptyStates(page);
  expect(seen).not.toContain('无匹配文档');
  expect(seen).toContain('搜索中…');
});

test('a query that really has no match still says so', async ({ page }) => {
  await signIn(page);
  await titledDoc(page, `LK乙${Date.now()}`);

  const editor = await newDoc(page);
  await editor.click();
  await page.keyboard.type('[[LK永不出现的名字');

  await expect(linkMenu(page).getByText('无匹配文档')).toBeVisible();
});

test('Enter picks the highlighted row instead of splitting the block', async ({ page }) => {
  await signIn(page);
  const target = `LK丙${Date.now()}`;
  await titledDoc(page, target);

  const editor = await newDoc(page);
  await editor.click();
  await page.keyboard.type(`[[${target}`);
  await expect(menuRows(page).filter({ hasText: target })).toBeVisible();
  await page.keyboard.press('Enter');

  await expect(editor.locator('> *').first()).toHaveText(target);
  // A split would leave the typed query behind in one block and add a second one.
  await expect(editor.locator('> *')).toHaveCount(1);
});

test('ArrowDown moves the highlight, and Enter picks the row that ended up highlighted', async ({ page }) => {
  await signIn(page);
  const stamp = Date.now();
  const first = `LKD${stamp}甲`;
  const second = `LKD${stamp}乙`;
  await titledDoc(page, first);
  await titledDoc(page, second);

  const editor = await newDoc(page);
  await editor.click();
  await page.keyboard.type(`[[LKD${stamp}`);
  await expect(menuRows(page)).toHaveCount(2);

  const highlightedBefore = await readHighlighted(page);
  await page.keyboard.press('ArrowDown');
  const highlightedAfter = await readHighlighted(page);
  expect(highlightedAfter).not.toBe(highlightedBefore);

  await page.keyboard.press('Enter');
  await expect(editor.locator('> *').first()).toHaveText(highlightedAfter);
  await expect(editor.locator('> *')).toHaveCount(1);
});

test('Escape closes the menu', async ({ page }) => {
  await signIn(page);
  await titledDoc(page, `LK戊${Date.now()}`);

  const editor = await newDoc(page);
  await editor.click();
  await page.keyboard.type('[[LK戊');
  await expect(linkMenu(page)).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page.getByText('链接到文档')).toHaveCount(0);
});

/** The highlighted row carries `bg-accent`; it is the only row the menu paints differently. */
async function readHighlighted(page: Page) {
  const titles = await menuRows(page).evaluateAll((rows) =>
    rows.map((row) => ({
      text: (row.textContent ?? '').trim(),
      selected: row.className.includes('bg-accent'),
    }))
  );
  const selected = titles.filter((entry) => entry.selected);
  expect(selected.length).toBe(1);
  return selected[0].text;
}
