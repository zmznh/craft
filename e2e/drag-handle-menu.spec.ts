import { expect, test } from '@playwright/test';

// Own account so this spec never touches the visual-matrix fixture or the
// drop-band account.
const email = 'craft-block-menu@example.com';
const password = 'test1234';

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  const signedIn = await page
    .waitForURL(/\/documents/, { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (signedIn) return;

  await page.goto('/register');
  await page.fill('#name', '块菜单测试');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/documents/, { timeout: 20_000 });
}

/** A fresh document whose top-level blocks are exactly `lines`. */
async function newDoc(page: import('@playwright/test').Page, lines: string[]) {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);

  const editor = page.locator('.ProseMirror');
  await editor.click();
  for (const [index, line] of lines.entries()) {
    if (index > 0) await page.keyboard.press('Enter');
    if (line) await editor.pressSequentially(line);
  }
  return editor;
}

const readRows = (page: import('@playwright/test').Page) =>
  page.$$eval('.ProseMirror > *', (els) =>
    els.map((el) => ({ text: (el.textContent ?? '').trim(), top: el.getBoundingClientRect().top, height: el.getBoundingClientRect().height }))
  );

const texts = async (page: import('@playwright/test').Page) =>
  (await readRows(page)).map((row) => row.text);

/** The handle only arms while the pointer sits in the left gutter of a block. */
async function hoverGutterOf(page: import('@playwright/test').Page, editorBox: { x: number }, index: number) {
  const rows = await readRows(page);
  await page.mouse.move(editorBox.x + 20, rows[index].top + rows[index].height / 2);
  const handle = page.locator('[data-drag-handle]');
  await expect(handle).toBeVisible();
  return handle;
}

test('the handle exposes a + and a block menu, and withholds 删除 from the only block', async ({ page }) => {
  await signIn(page);
  const editor = await newDoc(page, ['']);
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();

  const handle = await hoverGutterOf(page, box!, 0);
  await expect(handle.getByRole('button', { name: '在下方插入区块' })).toBeVisible();
  await expect(handle.getByRole('button', { name: '区块操作' })).toBeVisible();

  await handle.getByRole('button', { name: '区块操作' }).click();
  const menu = page.getByRole('menu');
  await expect(menu.getByRole('menuitem', { name: '在上方插入区块' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: '在下方插入区块' })).toBeVisible();
  // deleteBlock refuses to empty a document, so the entry that can only fail is not offered.
  await expect(menu.getByRole('menuitem', { name: '删除' })).toHaveCount(0);

  // With a second block the entry appears, addressed to the block under the pointer.
  await page.keyboard.press('Escape');
  await page.locator('.ProseMirror > *:first-child').click();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.type('乙');
  expect(await texts(page)).toEqual(['', '乙']);

  const armed = await hoverGutterOf(page, box!, 0);
  await armed.getByRole('button', { name: '区块操作' }).click();
  await expect(page.getByRole('menuitem', { name: '删除' })).toBeVisible();
});

test('the + button adds an empty block below the addressed one and puts the caret in it', async ({ page }) => {
  await signIn(page);
  const editor = await newDoc(page, ['甲', '乙', '丙']);
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();

  const handle = await hoverGutterOf(page, box!, 1);
  await handle.getByRole('button', { name: '在下方插入区块' }).click();
  // Typing without clicking anywhere proves the caret landed inside the new block.
  await page.keyboard.type('新');

  expect(await texts(page)).toEqual(['甲', '乙', '新', '丙']);
});

test('the ⋮ menu inserts above the addressed block and deletes only that block', async ({ page }) => {
  await signIn(page);
  const editor = await newDoc(page, ['甲', '乙', '丙']);
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();

  let handle = await hoverGutterOf(page, box!, 1);
  await handle.getByRole('button', { name: '区块操作' }).click();
  await page.getByRole('menuitem', { name: '在上方插入区块' }).click();
  await page.keyboard.type('上');
  expect(await texts(page)).toEqual(['甲', '上', '乙', '丙']);

  handle = await hoverGutterOf(page, box!, 1);
  await handle.getByRole('button', { name: '区块操作' }).click();
  await page.getByRole('menuitem', { name: '删除' }).click();
  // Both neighbours survive as their own blocks: a delete that merged them would
  // still read as the right number of characters.
  expect(await texts(page)).toEqual(['甲', '乙', '丙']);
});

test('moving onto the menu keeps it open and still acts on the addressed block', async ({ page }) => {
  await signIn(page);
  const editor = await newDoc(page, ['甲', '乙']);
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();

  const handle = await hoverGutterOf(page, box!, 0);
  await handle.getByRole('button', { name: '区块操作' }).click();
  const item = page.getByRole('menuitem', { name: '在下方插入区块' });
  await expect(item).toBeVisible();

  // The menu lives in a portal outside the editor box, so the pointer has to leave
  // `dom` to reach it — hiding the handle there used to unmount the anchor.
  const itemBox = await item.boundingBox();
  expect(itemBox).not.toBeNull();
  await page.mouse.move(itemBox!.x + itemBox!.width / 2, itemBox!.y + itemBox!.height / 2);
  await expect(item).toBeVisible();

  await item.click();
  expect(await texts(page)).toEqual(['甲', '', '乙']);
});

test('sweeping the pointer back over the text keeps the open menu alive', async ({ page }) => {
  await signIn(page);
  const editor = await newDoc(page, ['甲', '乙']);
  const box = await editor.boundingBox();
  expect(box).not.toBeNull();

  // Start inside `dom` so the pointer genuinely leaves it on the way to the gutter;
  // a pointer that only ever sat in the gutter never produces the events at issue.
  await page.locator('.ProseMirror > *:first-child').click();
  const handle = await hoverGutterOf(page, box!, 0);
  await handle.getByRole('button', { name: '区块操作' }).click();
  const item = page.getByRole('menuitem', { name: '在下方插入区块' });
  await expect(item).toBeVisible();

  // A sweep across the page while the menu is open re-enters `dom` and immediately
  // leaves it again; either branch hiding the handle unmounts the open menu.
  const rows = await readRows(page);
  await page.mouse.move(box!.x + 300, rows[1].top + rows[1].height / 2, { steps: 8 });
  await page.mouse.move(box!.x + 20, rows[1].top + rows[1].height / 2, { steps: 8 });
  await expect(item).toBeVisible();

  await item.click();
  await page.keyboard.type('新');
  expect(await texts(page)).toEqual(['甲', '新', '乙']);
});
