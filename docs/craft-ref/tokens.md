# craft.do 官方设计 Token（实测）

来源：2026-09-25 用用户已登录的 Edge 会话访问 `https://docs.craft.do/`（**不是** `app.craft.do`，
后者 DNS 不通是此前判定"无外网"的原因），抓取其主样式表
`https://docs.craft.do/static/css/index.css.CP00jDAy.css`（296,789 字节，544 个自定义属性），
并用 Browser Agent 的 `elementInfo` 量取实际几何。

对照基准是**登录后的产品界面**（`/s/<space>/all`、`/editor/d/...`），不是营销页。
`visual-diff-checklist.md` 里 2026-09-22 那批"暖纸白 `rgb(252,249,247)`"数值来自营销页，
本轮以本文件为准（见下方"推翻的旧结论"）。

本文件是**对照表**（官方值 / 本地值 / 处置）。更全的原始提取（13 个 CSS 资产、23 个
`data-theme` 块、逐资产字节数与字体清单）见同目录 `tokens-css-assets.md`。

## 一、颜色

### light（`[data-theme=light]`）

| 官方变量 | 官方值 | 换算 oklch | 本地 token（改前） | 本地 token（改后） |
|---|---|---|---|---|
| `--base` | `252 253 254` | `oklch(0.9936 0.0017 247.8)` | `--background: oklch(0.982 0.005 85)` 暖 | `oklch(0.9936 0.0017 247.8)` |
| `--base-overlay` | `rgb(252 252 252)` | `oklch(0.9911 0 0)` | `--card/--popover: oklch(1 0 0)` 纯白 | `oklch(0.9911 0 0)` |
| `--foreground` | `26 28 30` | `oklch(0.2252 0.0049 248)` | `oklch(0.16 0.008 85)` 暖黑 | `oklch(0.2252 0.0049 248)` |
| `--editor-text` | `rgb(31 34 37 / 90%)` | `oklch(0.2501 0.0072 248 / .9)` | 正文直接用 `--foreground` | 新增 `--editor-fg`，`.tiptap` 用它 |
| `--accent-blue` | `46 109 233` | `oklch(0.5668 0.199 262)` | `--craft-accent: oklch(0.55 0.238 296)` 偏紫 | `oklch(0.5668 0.199 262)` |
| `--accent-pink/green/purple/yellow/gray` | `214 23 155` / `0 194 166` / `94 2 210` / `228 192 17` / `82 92 102` | — | 无对应 | 用于 `--muted-foreground` 的取 `--accent-gray` |
| `--red/orange/green/blue`（语义色） | `255 56 60` / `255 141 40` / `52 199 89` / `0 136 255` | 红→`oklch(0.637 0.238 25.3)` | `--destructive: oklch(0.577 0.245 27.3)` | 按 `--red` 重算 |
| 编辑器高亮 9 色 `--editor-*` | blueDark `3 0 245`、blueLight `41 98 246`、cyan `83 183 224`、green `91 199 139`、orange `240 151 55`、red `219 48 53`、purple `180 37 246`、brown `126 80 25`、greyDark `104 116 133`、greyLight `159 164 169` | — | `--highlight-*` 7 色（自估 oklch） | 待按此表重算（下一批） |
| 渐变 5 组 `--editor-gradient-*` | blue/purple/pink/orange/gold 各 `linear-gradient(108.9deg, …)` | — | 无 | 待接入 Washi/封面 |

### dark（`[data-theme=dark]`）

| 官方变量 | 官方值 | 换算 oklch | 本地（改前） | 本地（改后） |
|---|---|---|---|---|
| `--base` | `30 30 30` | `oklch(0.235 0 0)` | `oklch(0.17 0.005 260)` 偏蓝 | `oklch(0.235 0 0)` |
| `--base-overlay` | `rgb(35 35 35)` | `oklch(0.2562 0 0)` | `oklch(0.22 0.005 260)` | `oklch(0.2562 0 0)` |
| `--foreground` | `249 249 249` | `oklch(0.9821 0 0)` | `oklch(0.93 0 0)` | `oklch(0.9821 0 0)` |
| `--editor-text` | `rgb(255 255 255 / 90%)` | `oklch(0.9821 0 0 / .9)` | 无 | `--editor-fg` |
| `--accent-blue` | `113 178 255` | `oklch(0.72 0.15 250)` | `oklch(0.65 0.22 296)` | `oklch(0.72 0.15 250)` |

**结论：官方暗色是中性和灰（无蓝紫偏色），本地此前带 260 色相。**

## 二、圆角 / 间距 / 尺寸

| 官方 | 值 | 本地（改前） | 本地（改后） |
|---|---|---|---|
| `--radius-sm` | 4px | `calc(var(--radius)*0.6)` = 7.2px | 4px |
| `--radius-md` | 8px | 9.6px | 8px |
| `--radius-lg` | 12px | 12px | 12px |
| `--radius-xl` | 16px | 16.8px | 16px |
| `--radius-full` | 9999px | 无 | 用 `rounded-full` |
| `--spacing-*` | 0.5/1/1.5/2/2.5/3/3.5/4/4.5/5/6/8/10/12/16（rem 步进） | Tailwind 默认 4px 步进 | 等价，无需改 |
| `--header-height` | 48px | `AppPageHeader` 用 `min-h-14`(56px) | 记为待改（该文件正被另一会话编辑） |
| 侧栏宽度 | **288px**（`elementInfo` 实量 `{x:0,y:48,w:288,h:631}`） | `--layout-sidebar-w: 260px` | 288px |
| 右栏宽度 | ≈360px（1910px 宽截图量得，±10） | `--panel-w: 300px` | 360px |
| `--browse-max-width` | 1630px | 无（各页 `max-w-4xl/5xl`） | 记为待改 |

## 三、字体与字号阶

官方 `--font-family: "Inter", var(--cjk-sans), "Pretendard", -apple-system, …`；
CJK 回退：sans `Hiragino Sans / Yu Gothic UI`，serif `Source Han Serif JP`；等宽 `SF Mono, ui-monospace, Roboto Mono`。

→ **本地选 Inter 不是"开源近似"，而是与官方同一字体**；中文回退与专有字体（Avenir Next Rounded /
Source Serif 的 Craft 定制位）仍属不搬运项。

官方字号阶（`size / line-height / letter-spacing`）：

| 官方 token | 值 | 本地对应 | Δ |
|---|---|---|---|
| `--heading-xxs-600` | 11 / 12 / .05px（allcaps 变体 +uppercase） | 分组标题用 `text-xs` 12px | −1px |
| `--heading-xs-500/600` | 12 / 12 / .01–.05px | `text-xs` 12px | 行高不同 |
| `--heading-md-500/600` | 14 / 16 / −.09px | `text-sm` 14px | 字距缺 −0.09px |
| `--body-md-400` | 13 / 15.6 / −.04px | `text-sm` 14px | **+1px 偏大** |
| `--ui-md-400/500/600` | 13 / 16 / −.04px | `text-sm` 14px | **+1px 偏大** |
| `--ui-lg-*` | 14 / 16 / −.09px | `text-base` 16px | +2px 偏大 |
| `--ui-xl-*` | 15 / 18 / −.13px | — | — |
| `--ui-xxl-*` | 16 / 19.2 / −.18px | 编辑器正文 16px | 行高 1.7 vs 1.2 |
| `--caption-md-*` | 11 / 13.2–16 / .01–.05px | `text-xs` 12px | −1px |

**要点：Craft 的产品外壳（侧栏、菜单、右栏、列表行）基准字号是 13px，本地普遍用 14px（`text-sm`）。
这是覆盖面最大的一处系统性偏差，涉及约 20 个组件的字号类，未在本轮一并改（另一会话正在改同一批文件）。**

## 四、阴影与动效

| 官方 | 值 | 本地（改后） |
|---|---|---|
| `--shadow-xxs` | `0 0 0 1px rgb(0 0 0/.04), 0 1px 1.5px rgb(0 0 0/.06), 0 2.5px 4px rgb(0 0 0/.06)` | 已落 `--shadow-xxs` |
| `--shadow-sm` | 6 层，含 `0 0 0 1px rgb(0 0 0/.03)` 描边层 | 已按前 3 层落 `--shadow-sm` |
| `--shadow-md` | 6 层递进 | 已按前 3 层落 `--shadow-md` |
| `--shadow-doc` | `0 0 0 1px rgb(0 0 0/.06)` + 5 层递减扩散 | 新增 `--shadow-doc`（文档卡尚未接入） |
| `--transition-easing` | `cubic-bezier(.4, 0, .2, 1)` | 新增并用于三档 |
| fast / medium / slow | .15s / .2s / .5s | 本地原 100/150/250ms ease → 已改 150/200/500ms + 官方缓动 |

## 五、推翻的旧结论（`visual-diff-checklist.md` 2026-09-22 那批）

1. "页面背景 `rgb(252,249,247)` 暖纸白" → 营销页值。**产品内是 `rgb(252,253,254)`，冷调近白**；
   据此把全站 token 从色相 85（暖）改回色相 248（冷中性）。
2. "正文墨色 `rgb(3,3,2)`" → 产品内是 `rgb(26,28,30)`（前景）与 `rgb(31,34,37)/90%`（编辑器正文）。
3. "标题字体 Untitled Serif 48px" → 产品内文档标题是**斜体衬线**（截图里"页面标题"占位为斜体），
   本地标题为非斜体 `font-serif`。待改。
4. "主 CTA 药丸圆角属营销页风格" → 产品内确认按钮确实是**大圆角药丸**（`--radius-full`），
   见"在桌面应用中打开?"弹窗的"在应用中打开"按钮。此前"放弃修改"的判断作废。
5. "Inter 只是专有字体的开源替代" → 官方 Web 端字体栈首位就是 Inter。

## 六、本轮已改 / 待改

**已改（组件级 sweep 已完成，2026-09-25 中午）**

| 项 | 官方 | 改动 |
|---|---|---|
| light/dark 色板 | 见第一节 | `src/app/globals.css` 全量替换（暖色相 85 → 中性 248；暗色去蓝） |
| 编辑器正文墨色 | `--editor-text` | 新增 `--editor-fg`，`.tiptap` 取它 |
| 圆角阶 | 4/8/12/16 | `@theme` 内改为固定 px |
| 阴影 | `--shadow-xxs/sm/md/doc` | 按官方多层落 token，`--shadow-doc` 已接入文档卡 |
| 动效 | `.15/.2/.5s` + `cubic-bezier(.4,0,.2,1)` | 三档时长与缓动替换 |
| 侧栏宽度 | 288px | `use-sidebar-store` 默认值 260 → 288（桌面轨由 store 驱动，改 CSS 变量无效） |
| 右栏宽度 | ≈360px | `--panel-w: 300px → 360px` |
| 产品外壳字号 | `--ui-md` 13px / −0.04px | 侧栏 8 个组件 + 右栏 FormatTab/InsertTab 的 `text-sm` → `text-[13px]`（19 处） |
| 顶栏高度 | `--header-height` 48px | `AppPageHeader` `min-h-14 → min-h-12` |
| 页面标题 | ≈24px | `text-lg sm:text-xl → text-2xl` |
| 文档标题 | 斜体衬线 | `EditorHeader` 的 h1 与输入框加 `italic`；占位文案 `无标题 → 页面标题` |
| 主 CTA | 药丸 | `Button` 的 `default` 变体加 `rounded-full`（ghost/outline/icon 不变） |
| 右栏"插入" | 整行边框卡 + 右侧拖拽点，无描述行 | `InsertTab` 行改为 `border + bg-card + shadow-xxs`，去掉描述副标题，图标盒改 `bg-background` |
| 文档正文形态 | 浮起圆角卡（base 底 + `--shadow-doc`） | `DocumentEditor` 正文容器改为 `bg-background` 内衬 + `rounded-2xl shadow-doc` 卡片，`themeColor`/字体下沉到卡片 |
| 浏览页宽度与密度 | `--browse-max-width: 1630px`，1910 视口下 5 列 | `AppPageContainer` `max-w-5xl → max-w-[1630px]`；6 个浏览页网格补 `xl:grid-cols-4 2xl:grid-cols-5` |

**仍待改（按影响排序）**

1. **侧栏信息架构**与官方不同：官方是 space 切换器 → 新建文档 → 所有文档/任务/日历/连接/与我共享/我的模板 → 星标 / 文件夹 / 标签 分组；本地是 搜索 → 首页/收藏/最近/日记/任务/日历/模板/回收站 → 文档/文件夹/集合/白板 树。属结构改造，不是 token 修正。
2. **顶栏**：官方把页面名居中，右侧是 头像 + 共享 + 通知 + 帮助 + 面板开关；本地是面包屑居左。
3. 编辑器正文行高：官方 UI 阶是 16/19.2（1.2），本地 1.7；截图目测更接近 1.5–1.6，**需像素测量定档，不凭猜改**。
4. `--highlight-*` 7 色与 5 组 `--editor-gradient-*`：官方 9 色已记录在第一节，但**本地 `--highlight-*` 目前是死 token**（全仓无引用，高亮色实际硬编码在组件里），要先接线再换值。
5. 三档视口的官方截图只采到 desktop（1910×925）；`viewport.set()` 静默无效，tablet/mobile 需另开窗口尺寸重采。


## 七、截图留档

`docs/craft-ref/ref-<screen>-<w>.png`（已加入 `.gitignore`：这些图含用户真实工作区内容，只留本地）。
当前已采：`all-documents`、`tasks`、`calendar`、`connections`、`document`（含右栏插入 tab），均为
1910×925 视口（Edge 窗口实际内尺寸；`viewport.set(1440,900)` 未生效，三档矩阵待用独立窗口重采）。
本地对照图：`docs/craft-ref/local-*.png` 与 `e2e/visual.spec.ts-snapshots/`。

## 八、全量重采补充（2026-09-25 13:00 之后）

本节覆盖第七节的采集范围：上一轮只解析了 `index.css` 的首个 light / 首个 dark 块，只采了 5 屏。

- **`tokens-css-assets.md`**：13 个 CSS 资产全量解析结果。新增数据包括 `--ui-*` 60 个排版阶（xs 11px → xxl 16px，含 line-height 与负 letter-spacing）、12 个 `[data-accent=…]` 强调色块、23 个主题块的完整分布（含 116 属性的 dark 色阶覆盖 `--red-550…`）、根级 light 308 / dark 156 全表、真字体清单（Inter / Avenir Next Rounded / Source Serif / Untitled Serif / Roboto Mono / M PLUS Rounded 1c 354 子集 / CJK 组 / KaTeX 39）、220 个 excalidraw `--color-*`。
- **`tokens.json`**（已 gitignore）：机器可读的逐文件属性值数组，13 文件 / 546 + 220 属性。
- **`screens.md`**：10 条路由屏 + 弹层 + 12 个设置分区的截图与几何清单，含「编辑器屏侧栏从 y=176 起」「设置弹窗打开时侧栏折叠为 57px 图标栏」两条新事实。

对第六节待办的影响：第 3 条「编辑器正文行高需像素测量定档」现在有了官方依据（`--ui-*-line-height` 与 `--heading/body/caption` 族已全量记录）；第 5 条视口矩阵仍受 `viewport.set()` 无效限制未解决。
