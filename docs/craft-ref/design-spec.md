# Crafty ↔ Craft 原版设计规范（design-spec）

> 采集方法：browser-use 连接用户已登录 `docs.craft.do` 浏览器，程序化提取 `getComputedStyle` + CSSOM 规则 + 全页截图。
> 采集日期：2026-09-24 ｜ 桌面视口 1528×~734 ｜ 中文（zh-CN）｜ 亮色为主，暗色经设置临时切换采集后已恢复「系统」。
> 原始数据：`docs/craft-ref/styles/*.json`；截图：`docs/craft-ref/screens/ref-*.png`。
> 本文档是阶段 1–5 的唯一视觉基准；与旧 `visual-diff-checklist.md`（营销页基准）冲突时**以本文为准**（产品内界面 ≠ 营销页，例如营销页暖纸白 `rgb(252,249,247)` 而产品实际是 `rgb(252,253,254)` 冷白）。

## 0. 采集范围与豁免

| 本地路由 | 原版参照 | 状态 |
|---|---|---|
| `/documents` | `…/all` 所有文档（卡片网格） | ✅ ref-documents* |
| `/documents/[id]` | `/editor/d/…`（官方示例文档） | ✅ ref-editor*（含选区气泡菜单） |
| `/tasks` | `…/tasks/inbox` | ✅ ref-tasks（空状态） |
| `/calendar` | `…/calendar` | ✅ ref-calendar |
| `/favorites` | `…/starred` 星标 | ✅ ref-starred（空状态） |
| `/templates` | `…/templates` 我的模板 | ✅ ref-templates |
| `/trash` | 无直接页（回收站在原版入口深） | ⚪ 豁免，用空状态规范 |
| `/recent`、`/collections` | `…/shared-with-me`（最近使用）、文件夹视图 | 近似参照 ref-shared-recent / ref-inbox |
| `/settings` | 空间菜单 → 设置（**模态**） | ✅ ref-settings / ref-settings-dark |
| `/search` ⌘K | Ctrl+K 命令面板 | ✅ ref-commandpalette |
| 分享/协作 UI | 编辑器「共享」对话框 | ✅ ref-sharedialog |
| `/whiteboards` | 原版无网页白板 | ⚪ 豁免（tldraw 用主题 token 皮肤） |
| `/login` `/register` `/p` `/s` | 需登出才能采集，不登出 | ⚪ 豁免（本地自定，保证 token 一致即可） |
| 移动/平板视口截图 | 连接器浏览器不可调窗口尺寸 | ⚪ 用 CSSOM 断点（§6）+ 本地三视口回归验证 |

## 1. 色彩体系

### Light（`[data-theme=light]` / 默认）
| 用途 | 值 |
|---|---|
| 页面背景 | `rgb(252,253,254)` `#FCFDFE` |
| Shell 文本 | `rgb(26,28,30)` `#1A1C1E` |
| 文档内文本 | `rgb(31,34,37)` `#1F2225` |
| 次级文本阶梯 | `rgba(26,28,30, .85 → .55 → .4 → .25)` |
| 辅助灰文本 | `rgb(93,89,91)`、`rgb(143,145,146)`、`rgb(92,97,99)` |
| 卡片白 | `rgb(255,255,255)` |
| 半透明卡（连接卡等） | `rgba(250,250,250,.85)` |
| 空状态底 | `rgba(26,28,30,.03)`（h180、radius 15） |
| hover/Plain 底 | `rgba(26,28,30,.04)` |
| 选中导航底 | `rgba(26,28,30,.06)`（dark: `rgba(249,249,249,.06)`） |
| Filled 按钮 hover | `rgba(26,28,30,.08)` |
| 描边/inset ring | `rgba(26,28,30,.08)`（1px，或 `0.8px solid`） |
| **主 Accent 蓝** | `#2E6DE9`（`46 109 233`），alpha 阶梯 6/12/18/24/32/40/55/70/85/100%，hover 深阶 `#2C67D9`(550) / `#2B61CB`(600) |
| 可选强调色 | pink `#D6179B`、green `#00C2A6`、purple `#5E02D2`、yellow `#E4C011`、gray `#525C66`（完整阶梯见 theme-vars.json） |
| 危险 / 警告 | `#FF383C` / `#FF8D28`（淡底 .12/.24） |
| 链接蓝 | `rgb(39,72,135)`、`rgb(49,121,206)` |
| 蓝色 chip | 底 `rgba(46,109,233,.12)` 字 `#2E6DE9`；中性 chip 底 `rgba(26,28,30,.04)` 字 `.4` |

### Dark（实测 + theme-vars.json）
| 用途 | 值 |
|---|---|
| 页面背景 | `rgb(18,19,20)` `#121314` |
| 文本 | `rgb(249,249,249)` `#F9F9F9`（次级 `.85/.55/.4/.25`） |
| 卡片 | `rgb(34,34,34)` `#222` |
| Accent（提亮） | blue `113 178 255`、pink `255 106 209`、green `77 255 221`、purple `191 139 255`、yellow `255 233 123`、gray `188 194 201` |

**对本地的影响**：现有 `globals.css` 暖色相 hue-85 体系（背景 `oklch(0.982 .005 85)` 等）与原版实测冷白不符，阶段 1 按上表整体重定；`--craft-accent` 蓝紫 `hue 296` → 替换为 `#2E6DE9`。

## 2. 字体层级（字体栈：`Inter, "PingFang SC", "Microsoft YaHei", sans-serif, Pretendard, -apple-system, …`）

| 规格 | 字号/字重/行高 | 用途 |
|---|---|---|
| 页面 H1 | 22px / 600 / 26.4 | 所有列表页标题 |
| 文档标题 | 23px / 700 / 28，色 `#1F2225` | 编辑器大标题 |
| 文内 H2 | 20px / 700 / 24 | 正文二级 |
| 文内 H3 | 18px / 600 / 22 | 正文三级 |
| 正文 | 15px / 400 / 23 | 编辑器段落（**不是 16px**） |
| 卡片标题 | 15px / 600 / 18（`typography-ui-xl-600`） | 文档卡 |
| 面包屑 | 14px / 500 / 16，色 `.4`，radius 6 | 编辑器顶栏（居中） |
| UI 主规格 | 13px / 500 / 16 | 按钮、设置项、tab、命令面板 |
| 侧栏导航 | 13px / 400 / 16，色 `.85` | 侧栏项 |
| 分区标题 | 12px / 600 / 12 | 侧栏分组（星标/文件夹/标签） |
| meta | 12px / 400–500 / 15.6 | 卡片日期、辅助说明 |
| 极小 | 10px / 500 / 10 | 嵌入卡元数据 |

本地映射建议：新建语义字号 token（`--text-ui: 13px`、`--text-meta: 12px`、`--text-body: 15px` 等），消灭 71 处 `text-[10~13px]` 任意值。

## 3. 间距与布局结构

- **全局壳**：顶栏 h**48**（全宽，含左侧侧栏开关 32×32/radius10/pad4、**居中面包屑**、右侧图标按钮组）；侧栏 w**288**（`transition: width .2s cubic-bezier(.4,0,.2,1)`），侧栏左右 padding 10。
- **内容区**：侧栏右侧起 padding **16**（内容 x=304=288+16），页头顶部约 13–16（H1 y=61）；页头 = 28×28 图标按钮（radius8/pad3）+ H1，间距使 H1 x 比内容 x 右移 ~50。
- **文档网格**：`grid-template-columns: repeat(auto-fill, minmax(200px,1fr))`、**gap 20**；卡片 = 容器 pad `6px 6px 0`，内白底 `radius 10 10 0 0`，标题区 pad `7px 10px 0`，下方 previewBox（内容缩略图，overflow hidden），整卡约 226×282。
- **编辑器**：内容列宽 **800px**，实测 x=358（主区 288 起，左偏移 70，右侧留白 ~370 给面板区）；文档 icon 占 x358–386，标题文字 x394；正文块 x394 对齐 icon 后（+36）。
  - 本地现有 580/720/900 三档宽度保留为功能，但默认档宽度与左右留白按此实测校准。
- **空状态**：整宽卡 h180、底 `rgba(26,28,30,.03)`、radius **15**、文字 13px/500 `.4`。
- **设置（模态）**：fixed **960×594**，x284 y50；左栏导航项 x300 宽 232，13px/500 pad`6px 8px` radius **10** h32，active 底 `.04`；顶部空间卡 182×200；右栏 x588 宽 632。外观 =3 张 189×149 预览卡（系统/浅色/深色）+ 6 个 32×32 圆形色点（选中 = 2px inset 底色环 + 2px accent 外环）。
- **命令面板**：**480×424**，y56 水平居中；输入 13px/500 pad`6px 6px 6px 4px`，placeholder「打开」；结果分组标题「文档」。
- **分享对话**：分段 tab（共享/发布/导出）**pill radius 9999** h26 pad`0 8px`，active 色 `.85` / inactive `.55`；访问选择器底 `.04` radius10 border`0.8px rgba(26,28,30,.08)` h34；「复制链接」蓝色主按钮 radius10 pad8 h32；辅助链接 12px/500 `.4`。
- **连接卡**：**radius 18**、底 `rgba(250,250,250,.85)`、阴影 `rgba(26,28,30,.08) 0 0 0 1px, rgba(0,0,0,.07) 0 2px 4px 0, …`（原版标准“描边+软影”卡）。
- **下拉菜单**：宽 268（侧栏锚定），actionItem pad **7** radius **10** h34 文字 16px。
- **气泡菜单**：h**36**、底 `rgb(250,250,250)`、radius **8**、分层阴影 `0 1px 1px rgba(0,0,0,.04), 0 3px 3px rgba(0,0,0,.04), 0 6px 4px rgba(0,0,0,.02)…`，位于选区上方。

## 4. 按钮与交互状态矩阵

按钮体系类名 `.hYjVVK`（Plain / Filled / FilledStrong / Outlined / …）：

| 变体 | 默认 | hover / focus-keyboard | active |
|---|---|---|---|
| Plain（顶栏/设置项） | 透明 | 底 `rgba(26,28,30,.04)` | 同 hover |
| Filled | 底 `.04` | 底 `.08` | `.08` |
| **FilledStrong（主 CTA）** | 底 `#2E6DE9` 字白，13/500，pad `8px 16px`，radius **10**，h32 | 深阶 `#2B61CB` | — |
| Outlined（「共享」） | 透明 + **inset ring** `0 0 0 1px rgba(26,28,30,.08)` | ring `.08` 加深 | 底 `.04` |
| AccentPlain | 蓝字 | 底 `rgba(46,109,233,.12)` | — |
| PlainDanger | 红字 `#FF383C` | 底 `rgba(255,56,60,.12)` | — |
| Icon 按钮（顶栏） | 32×32 radius **10** pad4 | 底 `.04` | — |
| Icon 按钮（页头） | 28×28 radius **8** pad3 | 底 `.04` | — |
| 禁用 | 色 `.25`、无过渡 | — | — |

- 侧栏导航项：h**32**、radius **8**、pad `7px 11px 7px 6px`、13px `.85`；hover 底 `.04`→选中 `.06`（实测 nav 元素 `transition: all`）；展开箭头 18×18 圆（radius 9999）色 `.4`。
- 卡片 hover：`transition: background-color .3s`（无位移无阴影变化；hover 时出现操作按钮浮层——见 ref-documents-card-hover.png）。
- **过渡时长/缓动统一**：`color/background/box-shadow/opacity .15s cubic-bezier(.4,0,.2,1)`；侧栏宽度 `.2s` 同缓动；卡片底色 `.3s`。本地 `--transition-*` token 改为该缓动曲线。
- 焦点：`[data-whatinput=keyboard]` + `:focus` → `0 0 0 2px var(--focus-highlight-color)` 焦点环（全局统一）。

## 5. 动效

- 弹层 keyframes：`fadeIn/fadeOut` + `slideFromTop/Bottom/Left/Right`（`translate3d(±var(--initial-transform,100%),0,0)` 进出场）——Radix 风格方向滑入；菜单/对话框用之。
- shadcn 本地已有 `tw-animate-css`（fade-in/zoom-in-95），阶段 4 给自研弹层统一接入，并将缓动改为 `cubic-bezier(.4,0,.2,1)`、时长 150ms。
- 路由转场：**Next 16 官方 `<ViewTransition>`（`import { ViewTransition } from 'react'`），App Router 零配置、路由导航自动触发**（见 `node_modules/next/dist/docs/01-app/02-guides/view-transitions.md`）。方案：默认内容区 cross-fade ~200ms；文档卡→编辑器可用 `name` 共享元素 morph（可选）。不引 framer-motion。
- `prefers-reduced-motion`：原版 CSSOM 无该媒体查询规则（excalidraw 有）；本地仍按可访问性最佳实践加“降级为瞬时”规则。

## 6. 响应式断点（来自 CSSOM 实测）

| 条件 | 行为 |
|---|---|
| **`(max-width: 747px)`** | 应用壳主断点：弹层/卡片 `background: transparent; radius 0; padding 0; shadow none`（去卡片化）、`button/a { transition: unset }`、内容 margin 归零 |
| **`(min-width: 748px)`** | 内容 `padding-top: 16px; gap: 20px` |
| `(pointer: coarse) and (max-width: 747px)` | 弹层子项 `width: auto; max-width: calc(100vw - 2rem)` |
| 右侧面板（库/分享类） | 视口 600–900 → `min-width: 300px`；≥900 → `min-width: 480px`；编辑器内 `min(480px, 100vw - 558px)` |
| 文档网格 | `auto-fill minmax(200px,1fr)` 自适应（天然覆盖桌面/平板/移动） |

**本地落地**：侧栏在 <748px 抽屉化（复用 `ui/sheet.tsx`）；RightPanel 600–900 视口 ≥300 宽、窄屏覆盖式；列表 padding 断点 747 对齐（而非 Tailwind 默认 640/768——新增自定义断点或用 `max-md` 近似）。

## 7. 结构差异记录（保留本地功能，仅对齐视觉）

1. **日历**：原版=按日时间轴（每日笔记+任务 chip），本地=月历网格 → 保留月历，chip/按钮/配色按 §3–4 对齐。
2. **设置**：原版=960×594 模态双栏，本地=独立页 → 阶段 2 将本地设置页改为同规格模态壳（纯 UI 改动，Server Actions 不动）；若改动风险大则保留页结构、对齐内部控件。
3. **收藏=星标**、**最近≈shared-with-me 最近使用**、**任务=inbox 分组**——语义映射如 §0。
4. **连接/标签**页本地无对应 → 不新建页面（功能范围外），侧栏/网格样式受益于统一 token。
5. **回收站、登录/注册、分享公开页**无原版实测 → 用本规范 token 手工对齐。
6. 本地快捷操作 QuickActions 原版对应「新建文档」主按钮 + 空状态卡。

## 8. 截图索引

`ref-documents`、`ref-documents-dark`、`ref-documents-card-hover`、`ref-tasks`、`ref-calendar`、`ref-starred`、`ref-templates`、`ref-inbox`、`ref-connections`、`ref-tags`、`ref-shared-recent`、`ref-editor`、`ref-editor-bubblemenu`、`ref-spacemenu`、`ref-settings`、`ref-settings-dark`、`ref-commandpalette`、`ref-sharedialog`（均 1528×734 PNG，位于 `docs/craft-ref/screens/`）。
