import { expect, test } from '@playwright/test';

const email = 'craft-test@example.com';
const password = 'test1234';

test('login redirects to documents', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);
});

test('create document, edit, and persist content', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);

  // 新建文档
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);

  // 输入内容并等待自动保存
  const editor = page.locator('.ProseMirror .tiptap').first().or(page.locator('[contenteditable="true"]').first());
  const marker = `E2E 冒烟内容 ${Date.now()}`;
  await editor.click();
  await editor.fill(marker);
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 15_000 });

  // 刷新后内容仍在
  await page.reload();
  await expect(page.locator('.ProseMirror p', { hasText: marker })).toBeVisible();
});

test('settings persist preference selection', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);

  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: '设置' })).toBeVisible();
  await page.getByRole('button', { name: '外观', exact: true }).click();

  const themes = page.getByRole('button', { name: /^(系统|浅色|深色)$/ });
  await expect(themes).toHaveCount(3);
  // The panel loads preferences asynchronously; the pressed state only appears once they arrive.
  const pressedTheme = page.getByRole('button', { name: /^(系统|浅色|深色)$/, pressed: true });
  await expect(pressedTheme).toBeVisible();
  const original = (await pressedTheme.textContent())?.trim() ?? '';

  const next = original === '深色' ? '浅色' : '深色';
  await page.getByRole('button', { name: next, exact: true }).click();
  await expect(page.getByRole('button', { name: next, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  // The preference is stored server-side, so a reload must restore the same choice.
  await page.reload();
  await page.getByRole('button', { name: '外观', exact: true }).click();
  await expect(page.getByRole('button', { name: next, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );

  await page.getByRole('button', { name: original, exact: true }).click();
  await expect(page.getByRole('button', { name: original, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true'
  );
});

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);
}

async function newDocument(page: import('@playwright/test').Page) {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  return page.locator('[contenteditable="true"]').first();
}

test('[[^ link addresses a single block and jumps back to it', async ({ page }) => {
  await signIn(page);
  const marker = `锚点段落 ${Date.now()}`;

  const target = await newDocument(page);
  await target.click();
  await page.keyboard.type(marker, { delay: 8 });
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  const source = await newDocument(page);
  await source.click();
  await page.keyboard.type(`[[${marker}`, { delay: 40 });

  await expect(page.getByText('链接到块')).toBeVisible({ timeout: 20_000 });
  await page.locator(`button:has-text("${marker}")`).first().click();

  const chip = page.locator('[data-block-index]').first();
  await expect(chip).toBeVisible();
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  await chip.click();
  await page.waitForURL(/#i-\d+/);

  // The jump stamps a stable id through the open editor, so the address bar ends up
  // on the id rather than the positional hint.
  const anchored = page.locator('[data-block-id]').first();
  await expect(page.locator('.block-anchor-flash')).toBeVisible({ timeout: 4_000 });
  await expect(anchored).toHaveText(marker);
  await expect(page).toHaveURL(/#b-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);

  const blockId = (await anchored.getAttribute('data-block-id'))!;
  await page.reload();
  await expect(page.locator(`[data-block-id="${blockId}"]`)).toHaveText(marker);
});

test('imports a markdown file into a real document', async ({ page }) => {
  await signIn(page);
  const title = `导入测试 ${Date.now()}`;
  const source = `# ${title}\n\n- [x] 已完成项\n- 普通项\n\n> 引用与 **粗体**\n\n\`\`\`ts\nconst a = 1;\n\`\`\`\n`;

  await page.locator('input[type="file"]').first().setInputFiles({
    name: `${title}.md`,
    mimeType: 'text/markdown',
    buffer: Buffer.from(source, 'utf-8'),
  });

  await page.waitForURL(/\/documents\//);
  const editor = page.locator('[contenteditable="true"]').first();
  await expect(editor.locator('h1')).toHaveText(title);
  await expect(editor.getByRole('checkbox')).toHaveCount(2);
  await expect(editor.getByRole('checkbox').first()).toBeChecked();
  await expect(editor.locator('blockquote strong')).toHaveText('粗体');
  await expect(editor.locator('pre code')).toContainText('const a = 1;');
});

test('collection gains properties, a formula, and gallery and form views', async ({ page }) => {
  await signIn(page);
  const name = `实验集合 ${Date.now()}`;

  await page.goto('/collections');
  await page.getByRole('button', { name: '新建集合' }).click();
  await page.getByLabel('名称').fill(name);
  await page.getByRole('button', { name: '创建' }).click();
  await page.waitForURL(/\/collections\/[^/]+$/);

  const addProperty = async (label: string, type: string, expression?: string) => {
    await page.getByRole('button', { name: '属性' }).click();
    await page.getByLabel('属性名称').fill(label);
    await page.getByLabel('属性类型').selectOption(type);
    if (expression) await page.getByLabel('公式表达式').fill(expression);
    await page.getByRole('button', { name: '创建' }).click();
    await expect(page.getByRole('columnheader', { name: label, exact: true })).toBeVisible();
  };

  await addProperty('价格', 'number');
  await addProperty('数量', 'number');
  await addProperty('金额', 'formula', '{价格} * {数量}');

  await page.getByRole('button', { name: '新建', exact: true }).click();
  await expect(page.locator('tbody tr')).toHaveCount(1);

  const row = page.locator('tbody tr').first();
  const setCell = async (column: number, value: string) => {
    await row.locator('td').nth(column).click();
    await page.locator('tbody tr').first().locator('td').nth(column).locator('input').fill(value);
    await page.keyboard.press('Enter');
    await expect(row.locator('td').nth(column)).toContainText(value);
  };

  await setCell(0, '苹果');
  await setCell(1, '12');
  await setCell(2, '3');
  // The formula column reads its siblings from the same row.
  await expect(row.locator('td').nth(3)).toHaveText('36');

  await page.getByRole('button', { name: '视图' }).click();
  await page.getByRole('menuitem', { name: '画廊' }).click();
  await page.getByRole('tab', { name: '画廊' }).click();
  await expect(page.getByText('苹果').first()).toBeVisible();

  await page.getByRole('button', { name: '视图' }).click();
  await page.getByRole('menuitem', { name: '表单' }).click();
  await page.getByRole('tab', { name: '表单' }).click();
  const nameField = page.locator('form label').filter({ hasText: '名称' }).first();
  await nameField.locator('div.cursor-pointer').click();
  await nameField.locator('input').fill('橙子');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '添加条目' }).click();
  await expect(page.getByText('橙子').first()).toBeVisible();
});

test('recurring task rolls forward to the next occurrence', async ({ page }) => {
  await signIn(page);
  const title = `每日复盘 ${Date.now()}`;
  const today = new Date().toISOString().slice(0, 10);

  await page.goto('/tasks');
  await page.getByPlaceholder('添加任务，按回车确认…').fill(title);
  await page.keyboard.press('Enter');

  const card = page.locator('div.border-b', { has: page.getByText(title, { exact: true }) }).first();
  await expect(card.getByText(title, { exact: true })).toBeVisible();

  await card.getByLabel('设置提醒与重复').click();
  await card.getByLabel('截止日期').fill(today);
  await card.locator('select').selectOption('{"freq":"daily"}');
  await expect(card.locator('select')).toHaveValue('{"freq":"daily"}');
  await expect(card.locator('span', { hasText: '每天' })).toBeVisible();

  await card.getByRole('checkbox').click();

  // The completed instance stays as history and a fresh occurrence appears.
  const instances = page.locator('div.border-b', { has: page.getByText(title, { exact: true }) });
  await expect(instances).toHaveCount(2);
  await expect(page.locator('span.line-through', { hasText: title })).toHaveCount(1);
  await expect(instances.locator('span', { hasText: '每天' })).toHaveCount(2);
});

test('镜像 copies another document’s block in read-only form', async ({ page }) => {
  await signIn(page);
  const marker = `镜像源段落 ${Date.now()}`;

  const target = await newDocument(page);
  await target.click();
  await page.keyboard.type(marker, { delay: 8 });
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  const source = await newDocument(page);
  await source.click();
  await page.keyboard.type(`[[${marker}`, { delay: 40 });

  await expect(page.getByText('链接到块')).toBeVisible({ timeout: 20_000 });
  await page.getByRole('button', { name: `镜像「${marker}」`, exact: true }).click();

  const card = page.locator('[data-mirror-block]').first();
  await expect(card).toBeVisible();
  await expect(card.locator('.mirror-block-body')).toHaveText(marker);

  // Read-only: the mirrored text is not part of this document’s editable content.
  await expect(page.locator('[contenteditable="true"] > p', { hasText: marker })).toHaveCount(0);

  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });
  await page.reload();
  await expect(page.locator('[data-mirror-block] .mirror-block-body')).toHaveText(marker, {
    timeout: 20_000,
  });
});

test('publishing a document serves it at a custom /p address', async ({ page }) => {
  await signIn(page);
  const title = `公开文档 ${Date.now()}`;
  const marker = `公开页内容 ${Date.now()}`;
  const slug = `e2e-public-${Date.now()}`;

  const editor = await newDocument(page);
  await page.locator('input[placeholder="页面标题"]').fill(title);
  await editor.click();
  await page.keyboard.type(marker, { delay: 8 });
  // The public page reads Document.content, which the editor writes on a debounce;
  // save now so the published body is the one we just typed.
  await page.keyboard.press('Control+s');
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  await page.getByRole('button', { name: '分享' }).first().click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('switch', { name: '发布为公开页面' }).click();
  await expect(dialog.getByLabel('自定义地址')).toBeVisible();

  // App-owned paths must stay reachable, so a reserved address is refused outright.
  await dialog.getByLabel('自定义地址').fill('login');
  await dialog.getByRole('button', { name: '保存' }).click();
  await expect(dialog.getByText('该地址已被系统占用')).toBeVisible();

  await dialog.getByLabel('自定义地址').fill(slug);
  await dialog.getByRole('button', { name: '保存' }).click();
  await expect(dialog.getByText(`/p/${slug}`)).toBeVisible();

  await page.goto(`/p/${slug}`);
  await expect(page.getByText(marker)).toBeVisible();
  await expect(page).toHaveTitle(new RegExp(title));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`/p/${slug}$`));
});

test('sidebar tree items expose a right-click menu', async ({ page }) => {
  await signIn(page);
  const title = `右键菜单 ${Date.now()}`;
  const renamed = `${title} 改名`;

  await newDocument(page);
  await page.locator('input[placeholder="页面标题"]').fill(title);
  // The header debounces the title write, and a reload would abort it in flight.
  await page.waitForTimeout(1_500);
  await page.keyboard.press('Control+s');
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  const sidebar = page.locator('aside');
  // The tree refetches on navigation, not on a title write, so reload to pick the row up.
  await page.reload();
  const row = sidebar.getByText(title, { exact: true }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });

  const openMenu = async (label: string) => {
    await sidebar.getByText(label, { exact: true }).first().click({ button: 'right' });
    await expect(page.getByRole('menu')).toBeVisible();
  };

  await openMenu(title);
  const menu = page.getByRole('menu');
  await expect(menu.getByRole('menuitem', { name: '新建子文档' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: '创建副本' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: '添加到收藏' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: '复制链接' })).toBeVisible();

  // The rename field auto-focuses, so drive it from the keyboard.
  await menu.getByRole('menuitem', { name: '重命名' }).click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(renamed);
  await page.keyboard.press('Enter');
  await expect(sidebar.getByText(renamed, { exact: true }).first()).toBeVisible({ timeout: 20_000 });

  const parentId = page.url();
  const parentSlug = parentId.split('/').pop();
  await openMenu(renamed);
  await page.getByRole('menu').getByRole('menuitem', { name: '新建子文档' }).click();
  // router.push settles after the click returns, so retry on the address instead of reading it once.
  await expect(page).toHaveURL(new RegExp(`/documents/(?!${parentSlug})[0-9a-f-]+`), {
    timeout: 20_000,
  });
  await expect(page.getByText('已保存')).toBeVisible({ timeout: 20_000 });

  // Deleting the document you are reading bounces back to the document list.
  await page.keyboard.press('Control+s');
  await page.getByRole('link', { name: '文档' }).first().click();
  await openMenu(renamed);
  await page.getByRole('menu').getByRole('menuitem', { name: '移入回收站' }).click();
  await expect(sidebar.getByText(renamed, { exact: true })).toHaveCount(0);
});

test('an embedded whiteboard previews its content and zooms into a dialog', async ({ page }) => {
  await signIn(page);

  await newDocument(page);
  const documentUrl = page.url();

  await page.locator('[contenteditable="true"]').first().click();
  await page.keyboard.type('/白板', { delay: 40 });
  await page.getByRole('option', { name: /白板/ }).first().click();

  const embed = page.locator('[data-whiteboard-embed]').first();
  await expect(embed).toBeVisible({ timeout: 20_000 });
  await expect(embed.getByText('只读预览')).toBeVisible();
  await expect(embed.locator(".tl-container").first()).toBeVisible({ timeout: 30_000 });

  // Draw on the board itself, then let the sync server checkpoint the snapshot.
  await embed.getByRole('button', { name: '打开白板' }).click();
  await page.waitForURL(/\/whiteboards\/[0-9a-f-]+/);
  await page.waitForFunction(() => Boolean((window as any).__craftyBoard), null, { timeout: 25_000 });
  await page.evaluate(() => (window as any).__craftyAddNote(120, 40, 'embed-marker'));
  await page.waitForTimeout(2_000);

  await page.goto(documentUrl);
  const preview = page.locator('[data-whiteboard-embed]').first();
  // The checkpointed snapshot really renders: the shape added on the board page is
  // visible inside the read-only canvas.
  await expect(preview.locator('[data-shape-id]').first()).toBeVisible({ timeout: 30_000 });

  await preview.getByRole('button', { name: '放大白板预览' }).click();
  await expect(page.getByRole('dialog').locator('[data-shape-id]').first()).toBeVisible({
    timeout: 30_000,
  });
});
