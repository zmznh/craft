import { expect, test } from '@playwright/test';

// Own account so this spec never touches the visual-matrix fixture or the
// shared craft-test account.
const email = 'craft-drop-band@example.com';
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
  await page.fill('#name', '落点测试');
  await page.fill('#email', email);
  await page.fill('#password', password);
  await page.fill('#confirmPassword', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/documents/, { timeout: 20_000 });
}

/** Official drop rule, measured at 1px: a block lands *after* the row under the
 *  pointer only when the pointer is strictly past that row's midline, so the
 *  exact midline still counts as *before*. */
test('the drop boundary sits on the block midline', async ({ page }) => {
  await signIn(page);

  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);

  const editor = page.locator('.ProseMirror');
  await editor.click();
  await editor.pressSequentially('落点甲');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('落点靶');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('落点丙');
  await page.keyboard.press('Enter');
  await editor.pressSequentially('落点丁');

  const readRows = () =>
    page.$$eval('.ProseMirror > *', (els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { text: (el.textContent ?? '').trim(), top: r.top, height: r.height };
      })
    );

  const dragTo = async (sourceIndex: number, dropY: number) => {
    const source = (await readRows())[sourceIndex];
    const box = await editor.boundingBox();
    expect(box).not.toBeNull();
    // The handle only arms while the pointer sits in the left gutter of a block.
    await page.mouse.move(box!.x + 20, source.top + source.height / 2);
    const handle = page.locator('[data-drag-handle]');
    await expect(handle).toBeVisible();
    const hb = await handle.boundingBox();
    expect(hb).not.toBeNull();
    await page.mouse.move(hb!.x + hb!.width / 2, hb!.y + hb!.height / 2);
    await page.mouse.down();
    await page.mouse.move(hb!.x + hb!.width / 2, dropY, { steps: 12 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    return (await readRows()).map((r) => r.text);
  };

  expect((await readRows()).map((r) => r.text)).toEqual([
    '落点甲',
    '落点靶',
    '',
    '落点丙',
    '落点丁',
  ]);

  // Pointer events land on integer clientY, so this pair straddles the midline
  // with 1px resolution — the same precision the official readings have.
  const target = (await readRows())[1];
  const midline = Math.floor(target.top + target.height / 2);

  expect(await dragTo(4, midline)).toEqual(['落点甲', '落点丁', '落点靶', '', '落点丙']);

  const row = (await readRows())[1];
  expect(await dragTo(4, Math.floor(row.top + row.height / 2) + 1)).toEqual([
    '落点甲',
    '落点丁',
    '落点丙',
    '落点靶',
    '',
  ]);

  // The gutter under a row belongs to that row: dropping there used to resolve to
  // no target at all, so the block simply refused to move.
  const beforeGutter = (await readRows())[2];
  const afterGutter = (await readRows())[3];
  expect(beforeGutter.top + beforeGutter.height).toBeLessThan(afterGutter.top);
  expect(await dragTo(0, afterGutter.top - 2)).toEqual([
    '落点丁',
    '落点丙',
    '落点甲',
    '落点靶',
    '',
  ]);

  // Above the first row there is no row to hit, yet the official editor still
  // inserts at the very front.
  const first = (await readRows())[0];
  expect(await dragTo(3, first.top - 20)).toEqual([
    '落点靶',
    '落点丁',
    '落点丙',
    '落点甲',
    '',
  ]);
});
