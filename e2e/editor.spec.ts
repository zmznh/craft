import { expect, test, type Locator, type Page } from '@playwright/test';

const email = 'craft-test@example.com';
const password = 'test1234';

async function signIn(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/documents/);
}

async function blankDocument(page: Page): Promise<Locator> {
  await page.goto('/documents');
  await page.getByRole('button', { name: /新建/ }).first().click();
  await page.waitForURL(/\/documents\//);
  const editor = page.locator('[contenteditable="true"]').first();
  await expect(editor).toBeVisible();
  return editor;
}

/** Every case starts from an empty body so one document serves all of them. */
async function reset(page: Page, editor: Locator) {
  await editor.click();
  // Atom blocks survive a single select-all delete as an empty sibling, so retry until
  // the body is one paragraph again.
  for (let attempt = 0; attempt < 4; attempt += 1) {
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    if ((await editor.locator('> *').count()) === 1) return;
  }
  await expect(editor.locator('> *')).toHaveCount(1);
}

/**
 * The suggestion query ends at a space, so a name like `标题 1` is reached by typing its
 * first token and then picking the option whose *title* is that name. Matching the whole
 * option would be ambiguous — `卡片` also appears inside `网页链接`'s description.
 */
const typedQuery = (name: string) => `/${name.split(' ')[0]}`;

function slashOption(page: Page, name: string): Locator {
  const exact = new RegExp('^' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$');
  return page.locator('[role="option"] div.font-medium').filter({ hasText: exact }).first();
}

async function openSlash(page: Page, name: string) {
  await page.keyboard.type(typedQuery(name), { delay: 25 });
  const option = slashOption(page, name);
  await expect(option, `slash entry missing: ${name}`).toBeVisible({ timeout: 10_000 });
  return option;
}

const ALL_COMMANDS = [
  '文本', '标题 1', '标题 2', '标题 3', '标题 4',
  '无序列表', '有序列表', '待办事项', '折叠列表', '引用', '代码块', '表格', '分隔线',
  '信息提示', '警告提示', '错误提示', '成功提示', '备注',
  'AI 生成图像', '绘图', '图片', '文件附件', '图片网格', '网页链接',
  '卡片', '@提及', '目录', '分栏', '公式', '行内公式', '镜像块', '视频嵌入', '白板',
];

test('every slash command is reachable by name', async ({ page }) => {
  await signIn(page);
  const editor = await blankDocument(page);

  for (const name of ALL_COMMANDS) {
    await editor.click();
    await openSlash(page, name);
    // Nothing is inserted, so the only residue is the typed query itself.
    for (let i = 0; i < typedQuery(name).length; i += 1) {
      await page.keyboard.press('Backspace');
    }
    await expect(editor.locator('> *')).toHaveCount(1);
    await expect(editor.locator('> *').first()).toHaveText('');
  }
});

/** Commands that land a node straight in the document, with the DOM that proves it. */
const INSERTS: { name: string; marker: string }[] = [
  { name: '标题 1', marker: 'h1' },
  { name: '标题 2', marker: 'h2' },
  { name: '标题 3', marker: 'h3' },
  { name: '标题 4', marker: 'h4' },
  { name: '无序列表', marker: 'ul li' },
  { name: '有序列表', marker: 'ol li' },
  { name: '待办事项', marker: 'input[type="checkbox"]' },
  { name: '折叠列表', marker: '.toggle-summary' },
  { name: '引用', marker: 'blockquote' },
  { name: '代码块', marker: '.crafty-code-block' },
  { name: '表格', marker: 'table' },
  { name: '分隔线', marker: 'hr[data-type="divider"]' },
  { name: '信息提示', marker: '.callout-content' },
  { name: '卡片', marker: '.card-block-content' },
  { name: '分栏', marker: 'div[data-type="columns"]' },
  { name: '公式', marker: 'textarea' },
  { name: '绘图', marker: 'button:has-text("开始绘图")' },
  { name: '白板', marker: '[data-whiteboard-embed]' },
];

/** Chunked rather than one long pass: every block needs its own document, and 18 of them
 *  together overrun the per-test budget once `next dev` is warm rather than idle. */
const CHUNK = 6;

for (let start = 0; start < INSERTS.length; start += CHUNK) {
  const chunk = INSERTS.slice(start, start + CHUNK);
  const label = `${chunk[0].name} … ${chunk[chunk.length - 1].name}`;

  test(`slash commands insert their block (${label})`, async ({ page }) => {
    await signIn(page);

    for (const { name, marker } of chunk) {
      // One document per block: a leftover container (columns, table) cannot be cleared
      // down to a single paragraph reliably enough to keep the assertion honest.
      const editor = await blankDocument(page);
      await editor.click();
      await (await openSlash(page, name)).click();
      await expect(
        editor.locator(marker).first(),
        `block missing after /${name}: ${marker}`
      ).toBeVisible({ timeout: 15_000 });
    }
  });
}

test('markdown input rules convert while typing', async ({ page }) => {
  await signIn(page);
  const editor = await blankDocument(page);

  await reset(page, editor);
  await page.keyboard.type('# 一级标题', { delay: 20 });
  await expect(editor.locator('h1')).toHaveText('一级标题');

  await reset(page, editor);
  await page.keyboard.type('### 三级标题', { delay: 20 });
  await expect(editor.locator('h3')).toHaveText('三级标题');

  await reset(page, editor);
  await page.keyboard.type('- 无序项', { delay: 20 });
  await expect(editor.locator('ul li')).toHaveText('无序项');

  await reset(page, editor);
  await page.keyboard.type('2. 有序项', { delay: 20 });
  await expect(editor.locator('ol li')).toHaveText('有序项');

  await reset(page, editor);
  await page.keyboard.type('> 引用内容', { delay: 20 });
  await expect(editor.locator('blockquote')).toContainText('引用内容');

  await reset(page, editor);
  await page.keyboard.type('[] 待办一项', { delay: 20 });
  await expect(editor.locator('input[type="checkbox"]')).toHaveCount(1);
  await expect(editor.locator('input[type="checkbox"]')).not.toBeChecked();

  await reset(page, editor);
  await page.keyboard.type('[x] 已完成项', { delay: 20 });
  await expect(editor.locator('input[type="checkbox"]')).toBeChecked();

  await reset(page, editor);
  await page.keyboard.type('```ts', { delay: 20 });
  await page.keyboard.press('Enter');
  await page.keyboard.type('const a: number = 1;');
  await expect(editor.locator('.crafty-code-block pre')).toContainText('const a');

  await reset(page, editor);
  await page.keyboard.type('粗体 **重点** 收尾', { delay: 20 });
  await expect(editor.locator('strong')).toHaveText('重点');

  await reset(page, editor);
  await page.keyboard.type('划掉 ~~旧值~~', { delay: 20 });
  await expect(editor.locator('s')).toHaveText('旧值');

  await reset(page, editor);
  await page.keyboard.type('高亮 ==新值==', { delay: 20 });
  await expect(editor.locator('mark')).toHaveText('新值');

  await reset(page, editor);
  await page.keyboard.type('[示例站](https://example.com)', { delay: 20 });
  await expect(editor.locator('a[href="https://example.com"]')).toHaveText('示例站');

  await reset(page, editor);
  await page.keyboard.type('$x^2$', { delay: 20 });
  await expect(editor.locator('.crafty-math-inline')).toBeVisible();
});

/** The four typed sigils are Craft's; each must produce its own weight, not eat another. */
test('the four divider sigils produce four distinct rules', async ({ page }) => {
  await signIn(page);
  const editor = await blankDocument(page);
  await reset(page, editor);

  const sigils = ['..-', '.--', '---', '=-'];
  const styles = ['thin', 'medium', 'thick', 'dashed'];

  for (const sigil of sigils) {
    await page.keyboard.type(sigil, { delay: 30 });
    await page.keyboard.press('Enter');
  }

  const rules = editor.locator('hr[data-type="divider"]');
  await expect(rules).toHaveCount(4);
  for (const style of styles) {
    await expect(editor.locator(`hr[data-style="${style}"]`)).toHaveCount(1);
  }
});

test('the drag handle reorders top-level blocks', async ({ page }) => {
  await signIn(page);
  const editor = await blankDocument(page);
  await reset(page, editor);

  await page.keyboard.type('第一块');
  await page.keyboard.press('Enter');
  await page.keyboard.type('第二块');
  await page.keyboard.press('Enter');
  await page.keyboard.type('第三块');

  const first = editor.locator('p', { hasText: '第一块' });
  const last = editor.locator('p', { hasText: '第三块' });
  await expect(first).toHaveCount(1);

  // The handle only arms while the pointer is in the editor's left gutter.
  const firstBox = await first.boundingBox();
  if (!firstBox) throw new Error('block geometry missing');
  await page.mouse.move(firstBox.x + 10, firstBox.y + firstBox.height / 2);
  const handle = page.locator('[data-drag-handle]').first();
  await expect(handle).toBeVisible();

  const from = await handle.boundingBox();
  const to = await last.boundingBox();
  if (!from || !to) throw new Error('drag geometry missing');

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  // The handle arms the drag only after a few pixels of travel.
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2 + 12, { steps: 4 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height - 2, { steps: 12 });
  await page.mouse.up();

  await expect(editor.locator('p').first()).toHaveText('第二块');
  await expect(editor.locator('p').last()).toHaveText('第一块');

  await page.keyboard.press('Control+z');
  await expect(editor.locator('p').first()).toHaveText('第一块');
});

test('the four panel tabs each render their controls', async ({ page }) => {
  await signIn(page);
  await blankDocument(page);

  await page.getByRole('button', { name: '插入', exact: true }).click();
  await expect(page.getByText('标题 1').last()).toBeVisible();

  await page.getByRole('button', { name: '格式', exact: true }).click();
  await expect(page.getByText('字号', { exact: true })).toBeVisible();
  await expect(page.getByLabel('增大字号')).toBeVisible();

  await page.getByRole('button', { name: '样式', exact: true }).click();
  await expect(page.getByText('文档颜色')).toBeVisible();

  await page.getByRole('button', { name: '信息', exact: true }).click();
  await expect(page.getByRole('heading', { name: '协作者' })).toBeVisible();
});
