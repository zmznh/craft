import { expect, test, type Browser, type Page } from '@playwright/test';
import WebSocket from 'ws';
import 'dotenv/config';

const OWNER = { email: 'craft-test@example.com', password: 'test1234' };

/** Reads the checkpointed snapshot straight from Postgres through the internal API. */
async function databaseSnapshot(boardId: string): Promise<string> {
  const res = await fetch(`http://localhost:3000/api/internal/whiteboards/${boardId}/snapshot`, {
    headers: { 'x-crafty-internal': process.env.TLDRAW_INTERNAL_SECRET ?? '' },
  });
  if (!res.ok) throw new Error(`snapshot ${res.status}`);
  const { snapshot } = (await res.json()) as { snapshot: unknown };
  return JSON.stringify(snapshot ?? '');
}

async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', OWNER.email);
  await page.fill('input[type="password"]', OWNER.password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);
}

async function createBoard(page: Page): Promise<string> {
  await page.goto('/whiteboards');
  await page.getByRole('button', { name: '新建白板' }).click();
  await page.waitForURL(/\/whiteboards\/[0-9a-f-]+/);
  return page.url().split('/').pop() as string;
}

async function editorReady(page: Page) {
  try {
    await expect(page.locator('.tl-container')).toBeVisible({ timeout: 25_000 });
  } catch {
    // The Board renders a status screen instead of the canvas; surface its text.
    const status = await page.getByRole('main').innerText().catch(() => '');
    throw new Error(`board canvas missing: ${status.replace(/\s+/g, ' ').slice(0, 200)}`);
  }
  await page.waitForFunction(() => Boolean((window as any).__craftyAddNote), null, { timeout: 25_000 });
}

async function addShape(page: Page, x: number, y: number, marker: string) {
  await page.evaluate(([px, py, name]) => (window as any).__craftyAddNote(px, py, name), [x, y, marker]);
}

async function shapeMarkers(page: Page): Promise<string[]> {
  return page.evaluate(() =>
    (window as any)
      .__craftyBoard.getCurrentPageShapes()
      .map((shape: any) => (shape.meta as any)?.marker as string | undefined)
      .filter((marker: string | undefined): marker is string => Boolean(marker)),
  );
}

async function setPermission(page: Page, permission: 'off' | 'view' | 'edit') {
  await page.getByRole('button', { name: '分享白板' }).click();
  const option = page.locator(`[data-share-permission="${permission}"]`);
  // Permission options render disabled until the board's share state has been fetched.
  await expect(option).toBeEnabled({ timeout: 30_000 });
  await option.click();
}

async function openShareLink(page: Page): Promise<string> {
  await expect(page.getByRole('button', { name: '复制' })).toBeVisible({ timeout: 10_000 });
  return (await page.locator('code').first().innerText()).trim();
}

async function enableShare(page: Page, boardId: string, permission: 'view' | 'edit') {
  await page.goto(`/whiteboards/${boardId}`);
  // The permission buttons stay disabled until the board data arrives; under full-suite
  // load that window is long enough for a raw click to time out.
  await editorReady(page);
  await setPermission(page, permission);
  const url = await openShareLink(page);

  await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: '复制' }).click();
  await expect(page.getByRole('button', { name: '已复制' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(url);

  await page.keyboard.press('Escape');
  return url;
}

async function anonymousView(browser: Browser, shareUrl: string) {
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage();
  await page.goto(shareUrl);
  return { context, page };
}

test('two owners see each other’s shapes in real time', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage);
  const boardId = await createBoard(ownerPage);
  await editorReady(ownerPage);

  const secondCtx = await browser.newContext();
  const secondPage = await secondCtx.newPage();
  await login(secondPage);
  await secondPage.goto(`/whiteboards/${boardId}`);
  await editorReady(secondPage);

  await addShape(ownerPage, 120, 120, '实时图形');
  await expect.poll(async () => shapeMarkers(secondPage), { timeout: 20_000 }).toContain('实时图形');

  // Deleting on one side propagates as well.
  await ownerPage.evaluate(() => {
    const editor = (window as any).__craftyBoard;
    editor.deleteShapes(Array.from(editor.getCurrentPageShapeIds()));
  });
  await expect
    .poll(async () => shapeMarkers(secondPage), { timeout: 20_000 })
    .not.toContain('实时图形');

  await ownerCtx.close();
  await secondCtx.close();
});

test('a reload reconnects from the database checkpoint', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  const boardId = await createBoard(page);
  await editorReady(page);

  await addShape(page, 200, 200, '重启后仍在');
  // Prove the room actually reached Postgres, not just the in-memory cache: the
  // sync service checkpoints on a debounce and flushes when the room empties.
  await expect.poll(async () => databaseSnapshot(boardId), { timeout: 20_000 }).toContain('重启后仍在');
  await expect.poll(async () => shapeMarkers(page), { timeout: 10_000 }).toContain('重启后仍在');
  // Closing the last session flushes the room, so the reload rehydrates from Postgres.
  await page.reload();
  await editorReady(page);
  await expect.poll(async () => shapeMarkers(page), { timeout: 20_000 }).toContain('重启后仍在');

  await context.close();
});

test('a view link is read-only even for a tampered client', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage);
  const boardId = await createBoard(ownerPage);
  const shareUrl = await enableShare(ownerPage, boardId, 'view');
  await ownerPage.goto(`/whiteboards/${boardId}`);
  await editorReady(ownerPage);

  const visitor = await anonymousView(browser, shareUrl);
  await editorReady(visitor.page);
  await expect(visitor.page.getByText('只读查看')).toBeVisible();
  // A share visitor must never see the owner's management entry point.
  await expect(visitor.page.getByRole('button', { name: '分享白板' })).toHaveCount(0);

  // Simulate a client that flips its own read-only flag and pushes a shape anyway.
  await visitor.page.evaluate(() => {
    const editor = (window as any).__craftyBoard;
    editor.updateInstanceState({ isReadonly: false });
  });
  await addShape(visitor.page, 400, 400, '访客写入');
  await visitor.page.waitForTimeout(2500);

  expect(await shapeMarkers(ownerPage)).not.toContain('访客写入');
  // The checkpoint row is untouched as well: the write never reached the room.
  await visitor.page.waitForTimeout(2500);
  expect(await databaseSnapshot(boardId)).not.toContain('访客写入');

  // Reloading pulls the authoritative room state back: the write never landed.
  await visitor.page.reload();
  await editorReady(visitor.page);
  expect(await shapeMarkers(visitor.page)).not.toContain('访客写入');

  await visitor.context.close();
  await ownerCtx.close();
});

test('an edit link stays read-only until the visitor logs in', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage);
  const boardId = await createBoard(ownerPage);
  const shareUrl = await enableShare(ownerPage, boardId, 'edit');

  const visitor = await anonymousView(browser, shareUrl);
  await editorReady(visitor.page);
  await expect(visitor.page.getByRole('link', { name: '登录后可编辑' })).toBeVisible();
  await expect(visitor.page.getByText('只读查看')).toBeVisible();

  const memberCtx = await browser.newContext();
  const memberPage = await memberCtx.newPage();
  await login(memberPage);
  await memberPage.goto(shareUrl);
  await editorReady(memberPage);
  await expect(memberPage.getByText('可编辑')).toBeVisible();
  await addShape(memberPage, 300, 300, '登录后编辑');
  await expect.poll(async () => shapeMarkers(ownerPage), { timeout: 20_000 }).toContain('登录后编辑');

  await visitor.context.close();
  await memberCtx.close();
  await ownerCtx.close();
});

test('revoking a share drops live visitors and blocks new ones', async ({ browser }) => {
  const ownerCtx = await browser.newContext();
  const ownerPage = await ownerCtx.newPage();
  await login(ownerPage);
  const boardId = await createBoard(ownerPage);
  const shareUrl = await enableShare(ownerPage, boardId, 'view');
  await editorReady(ownerPage);

  const visitor = await anonymousView(browser, shareUrl);
  await editorReady(visitor.page);

  await ownerPage.goto(`/whiteboards/${boardId}`);
  await setPermission(ownerPage, 'off');
  await expect(ownerPage.locator('code')).toHaveCount(0);

  await expect(visitor.page.getByText(/链接已失效|断开连接/)).toBeVisible({ timeout: 25_000 });

  await visitor.page.goto(shareUrl);
  await expect(visitor.page.getByText('链接无效或已关闭分享')).toBeVisible();

  // The owner keeps working after revoking their own link.
  await ownerPage.reload();
  await editorReady(ownerPage);
  await addShape(ownerPage, 500, 500, '撤销后仍可编辑');
  await expect.poll(async () => shapeMarkers(ownerPage), { timeout: 20_000 }).toContain('撤销后仍可编辑');

  await visitor.context.close();
  await ownerCtx.close();
});

/** Resolves to the HTTP status the server used to refuse the upgrade, or 'opened'. */
function handshake(url: string): Promise<number | 'opened'> {
  return new Promise((resolve) => {
    const socket = new WebSocket(url);
    socket.on('open', () => {
      socket.close();
      resolve('opened');
    });
    socket.on('error', (error: Error) => {
      const status = /Unexpected server response: (\d{3})/.exec(error.message);
      resolve(status ? Number(status[1]) : 'opened');
    });
  });
}

test('a forged or misplaced claim cannot open a room', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await login(page);
  const boardId = await createBoard(page);
  const otherBoardId = await createBoard(page);
  await editorReady(page);

  const claim = await page.evaluate(async (id) => {
    const res = await fetch(`/api/whiteboards/${id}/collab-token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    return (await res.json()) as { token?: string };
  }, boardId);
  expect(claim.token).toBeTruthy();

  const syncUri = (room: string, token: string) =>
    `ws://localhost:3002/sync/${room}?token=${encodeURIComponent(token)}`;

  expect(await handshake(syncUri(boardId, 'forged-claim'))).toBe(401);
  // A genuine claim is still bound to the room it was issued for.
  expect(await handshake(syncUri(otherBoardId, claim.token as string))).toBe(401);
  expect(await handshake(syncUri(boardId, claim.token as string))).toBe('opened');

  await context.close();
});
