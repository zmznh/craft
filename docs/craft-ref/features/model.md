# Craft 数据模型（块 / 集合 / 任务 / 序列化）

证据：`_harvest/js/`（105 个 bundle，含 200 个懒加载 chunk 名单 `all-chunks.txt`）、`_harvest/i18n-zh.tsv`（4019 条官方中文串）、`_harvest/dom-snapshot-*.html`（渲染后 HTML）。

置信：`~` = 静态证据（词表/命令名/chunk 名/文案）支持；`✓` = DOM 屏上实测；`?` = 需动态验证。**块之间的嵌套规则、转换保真、撤销粒度全部是 `?`**（依赖 `_harvest/todo-actions.md` 第 1 批沙盒动作）。

## 一、块类型词表（bundle 内出现的类型字面量 + 出现次数）

来源：对 105 个 JS 做 `"…" `字面量频次统计。次数只表示该词在代码里被引用的密度，不是"文档里有多少这种块"。

| 类型字面量 | 频次 | 创建入口（官方命令名） | 本地对应 | 置信 |
|---|---|---|---|---|
| `text` | 502 | `commands.insert.snippet.text` 插入正文片段 | paragraph | ~ |
| `image` | 308 | 插入文件 / Image from Unsplash | imageBlock | ~ |
| `table` | 199 | `commands.insert.table` | table ✓ | ~ |
| `code` | 156 | `commands.insert.snippet.code` | codeBlock ✓ | ~ |
| `title` | 123 | 标题（右栏格式面板） | Heading | ~ |
| `link` | 118 | `ctrl+k`（Slate 默认） | link ✓ | ~ |
| `file` | 90 | `commands.insert.image.files` | attachment ✓ | ~ |
| `video` | 73 | 嵌入 | videoEmbed ✓ | ~ |
| `math` | 69 | `commands.insert.snippet.formula`（TeX） | mathBlock/inlineMath ✓ | ~ |
| `html` | 57 | 嵌入 | — | ? |
| `whiteboard` | 54 | `commands.insert.whiteboard` | whiteboardLink/Embed ✓ | ~ |
| `iframe` | 54 | 嵌入（外链 iframe 预览） | linkPreview ~ 近似 | ? |
| `mention` | 50 | `@` 提及（R2） | mention 节点存在但**无触发器** | ~ |
| `card` | 48 | 卡片（`style.card.*`：配置/表情/任务卡） | cardBlock ✓ | ~ |
| `separator` | 46 | `commands.insert.line` 分隔符 | divider | ? |
| `toggle` | 40 | `commands.open.close.toggle` | toggleBlock ✓ | ~ |
| `drawing` | 31 | 绘图 | drawing ✓（自研） | ~ |
| `todo` | 30 | 待办 | taskItem ✓ | ~ |
| `mermaid` | 27 | `commands.insert.snippet.mermaid` | **本地无** | ~ |
| `embed` | 24 | 嵌入 | linkPreview | ? |
| `subtitle` | 17 | `style.text.subtitle`（副标题） | **本地无独立副标题** | ~ |
| `columns` | 17 | 分栏 | columns ✓（硬编码 2 栏；官方栏数待测） | ~ |
| `quote` | 16 | 引用 | blockquote ✓ | ~ |
| `blockLink` | 16 | `[[`（R：`commands.commands.mention.placeholder` 搜页面） | blockLink ✓ | ~ |
| `audio` | 14 | — | **本地无** | ~ |
| `gallery` | 13 | 图片网格 | imageGallery ✓ | ~ |
| `divider` | 10 | 与 `separator` **同时存在**：两族还是同族异名待测 | divider | ? |
| `snippet` | 9 | 插入片段族（text/code/formula/mermaid） | 部分 | ~ |

**两个必须动态澄清的点**：① `separator` 与 `divider` 并存 —— 官方可能有"分隔线（四档粗细）"与"分页符/分隔块"两种东西（`blockdetails.insert.page.break` 支持这个猜测）；② `title` / `subtitle` 与标题层级 H1–H4 的关系（本地 Heading 限 1–4，官方 `style.text.*` 里标题与副标题是分开的样式项）。

## 一之二、网页版右侧栏三面板实屏权威清单（动态 V10–V12，`✓`）

上表"创建入口"一列此前全部来自 i18n 键推断；现在用实屏（登录态网页版、样例文档、零写入）逐面板校准。**三个面板的分工不同，混为一谈会错判块全集**：

| 面板 | 内容 | 结论 |
|---|---|---|
| **插入**（16 项，**一个分组标题「合集」**，副标题「将任何项目拖放到文档中」） | 无标题组：文本、页面、卡片、文件附件、图片、插入 Unsplash 图片、代码块、公式（TeX）、Mermaid 图表、白板；**「合集」组**：表格、图库、**Kanban**；末尾三行：插入 线、插入分页符、插入表格（带行列网格选择器提示「插入一个包含所选行数和列数的表格。」）。条目**不进无障碍树**（`ax.get()` 回 "no change" 而 DOM +73 KB），只能坐标点 | ① 这一列＝**块级对象**全集，**列表家族（无序/编号/待办/折叠）、引用、分栏、嵌入统统不在这里** ⇒ 它们的创建入口只有斜杠命令与 Markdown 快捷方式（`blockdetails.press.slash.command` 按 "/" 快速操作）；② **`separator` vs `divider` 结案**：面板同时有「插入 线」和「插入分页符」⇒ 是两种东西（分隔线块 / 分页块），而样式页里的「分隔符样式＝线 / 和纸胶带 / 涂鸦」是分隔线的**外观维度**；③ `mermaid`、`math`(TeX)、`gallery`(图库) **确认有真实 web 入口**，且 **Kanban 是插入面板的一等条目**（⇒ 集合三种视图都能从文档内直接建）；④ i18n 键 `blockdetails.sidebar.{lists,media}` 的中文串在 web DOM **零出现** ⇒ 那两个分组标题只在别的平台/布局渲染 |
| **格式**（作用在当前块/选区上，**选择感知**：所属档蓝框高亮） | **文本 6 档**（槽位 class `sc-aqusau-2…7`：标题 / 副标题 / **标题**（= `heading` 中标题，走 `style.text.heading.short` ⇒ **面板上出现两个「标题」**）/ 小标题 / 正文 / 说明）→ **分组**（页面 / 卡片）→ **内联三行纯图标**（`B I S </>` ｜ 待办 折叠 无序 有序 ｜ 缩进← 缩进→ 左 中 右 两端）→ **装饰**（焦点 / 块）→ 颜色 → 字体 | 与 `internals.md` §七 `setTextStyle{blockIds[], textStyle, fontFamilyId}` 一一对上 ⇒ **"块转换"不是独立动作，就是套文本样式**；「分组：页面/卡片」证实 `GROUP`/`UNGROUP` 在 web 有 UI；「装饰：焦点/块」证实 `FOCUS_DECOR`/`BLOCK_DECOR` 有面板承载。**更正**：本行原判"内联格式不在面板"是错的（纯图标按钮无文本节点，被"按可见文本抽取"漏掉），见 `interactions.md` V22 |
| **样式**（作用在整篇文档/页面上） | 自定义样式 → 所有样式 → 颜色（背景 / 文档颜色 / 文本颜色）→ 封面（封面图片）→ 分隔符样式（线 / 和纸胶带 / 涂鸦）→ 字体（默认 / 高级）→ 宽页 | **和纸胶带与涂鸦在网页版有真实入口**（此前怀疑"只有桌面端"作废）；`dynamic.style`「动态样式」在此面板的"所有样式"区，行为仍未采 |

## 一之三、权威结构定义见 `api-contract.md`

产品自己的 zod schema 与 `.describe()` 注释给出了此前只能靠词表推断的硬事实（`_harvest/api-describes.tsv`）：

- 块对象 = `{id, type, content, children[], isPage}`，**页面就是"有子块的块"**，块带直接子块计数，子树以 **markdown 字符串**投影（`pageContent`）。
- **嵌套深度上限 10**（`depth` 默认 10）；列表/树返回有 `limit` 默认 100 与 50 两档。
- 层级词表是 **`title` / `subtitle` / `heading` / `strong` / `page` / `body`** —— 上面第一节留的"官方 title/subtitle 与 H1–H4 的关系"由此结案：官方不用 1–4 级阶梯。
- 任务视图四档 `inbox / today / upcoming / all`（与屏上实测一致）；任务状态除 completed 外还有 **cancelled**；可按**正则**过滤任务内容。
- 循环/归类枚举 `ongoing / day / remainingDaysInMonth / month / later`。
- 搜索排序 `relevance / dateCreated / dateModified`，可按 starred、dailyNote 三态过滤，文件夹名支持大小写不敏感正则，结果带块级命中与总数。

## 二、标题与文本样式（`style.*` 155 条）

- 颜色 **25 档**（`style.color.*`：黑/蓝/海军蓝/海洋蓝/棕/深蓝…），文本样式面板项见 `style.text.*` 15 条（对齐 5 档：左/中/右/两端 + 正文/标题/副标题）。
- 背景与纹理：`style.backdrop`（背景）、`themePreviews` chunk、卡片样式 `style.card.configurations/configure/emoji/style/task`。
- 高级样式入口：`style.advanced`（高级）、`style.all.styles`（所有样式）、`style.clear`（取消样式）。

## 三、集合（Collections / Database）

| 层 | 事实 | 证据 | 置信 |
|---|---|---|---|
| 记录对象 | 集合行在内部叫 **`recordObject`**，带 `objectSchemaId`、`parentId`、`model.objectData` | `propertyType:n.type` 与 `recordObject` 分支代码 | ~ |
| **列类型（权威，已结案）** | `DatabaseSchemaPropertyType` = `text` `number` `checkbox` `date` `url` `person` `select` `multiSelect` `media` `relation` `linkToBlock` `email` `phone`（13 项；`multiSelect` 是唯一 camelCase 线值）。逐类型校验器 + `default:false` + 未知类型文案「不支持的属性类型」 | `socket.worker-CMvBLZvP.js` 与 `index` 内 `le` 两处一致 → 全文见 `protocol.md` §一 | ✓ |
| 列类型（旧推测，**部分作废**） | 此前由 200 个 chunk 名推得 13 个编辑器 + `FormulaInput` + `CalculationsRow`；常量侧证 `TEXT/NUMBER/SELECT/URL/LINK/BOOLEAN/TASK/IMAGE/PERSON/FILE/TAG` 是**另一套常量**（块/媒体类型），不是属性类型 | 现已被上行权威枚举取代：属性枚举里**没有** `formula`/`created_at`/`updated_at`/`file`/`tag`/`task` —— 公式在"计算行/聚合"层，时间戳在排序维度层，`file` 叫 `media` | 作废依据见 `protocol.md` §一/§六 |
| 视图配置持久化 | **20 键**：`id name type / filters sortBy groupBy hiddenProperties customPropertyOrder columnWidth calculations isCalculationsRowVisible / galleryCardSize galleryPreviewType galleryShowsAllFields visibleGalleryFields / tableConfig galleryConfig kanbanConfig kanbanHiddenGroupValues kanbanColumnOrder`。字段可见性与列序**按视图各存一套** | `STORED_VIEW_KNOWN_KEYS` 原文，详表见 `protocol.md` §二 | ✓ |
| 视图 | 添加其他视图、画廊视图、`collections.views.turn.into`（**视图互相转换**）、排序（`browse.sort.*` 12 条：字母/创建日期/创建共享日期/更新日期/浏览日期）、视图保存二选一（`save.for.current` / `save.as.new`）、视图重命名与重排序 | i18n + `STORED_VIEW_KNOWN_KEYS` | ~ |
| 筛选（**已结案**） | 操作符 19 个封闭线值 + **按列类型许可集**（checkbox 只能 equals；number 只能 6 个 number_* + 空/非空；relation/person 只有 relation_has* 三件套）；内层结构 `{propId, type, value}`；求值不对称（`isNoneOf` 空值→true，`contains` 空值→false） | 全文见 `protocol.md` §九 | ✓ |
| 筛选与分组（旧行，已被上行取代） | `collections.add.*` 18 条含「添加筛选器」；`commands.sort`；分组命令 `?`（二级分组 `collections.add.subgroup` 如何进 `groupBy` 仍未证） | i18n | ~ |
| 公式 | 25 个函数带中文说明（ABS/AVERAGE/COUNT/COUNTA/…），`vendor-formulas` 提供求值 | `table.formula.*` | ~ |
| 单元格 | 填充色、单元格格式/样式、清除内容/样式、列宽（`CalculationsRow` 说明有**汇总行**） | `table.*` 80 条 | ~ |
| 菜单限制 | 部分表格操作禁止上下文菜单，提示「请使用 [0] 来 [1]」（R10） | `table.alert.*` | ~ |

## 四、任务模型（四套独立时间维度）

| 维度 | 官方命令与文案 | 本地 | 差异 |
|---|---|---|---|
| 完成态 | `todo`、任务视图、`tasks.*` 132 条 | `isCompleted` ✓ | 一致 |
| **Deadline 截止** | `commands.task.deadline.*`（设/清/今天/明天/下周一/按日期） | `dueDate` ✓ | 概念对应 |
| **Schedule 排期** | `commands.task.schedule.*`（安排到今天/明天/下周一/按日期/清除、`安排到 [0]`）、chunk `task-schedule`(25 次) | **无独立概念**（`TaskSchedule` 只是批量入参名） | 缺失（G15） |
| **Reminder 提醒** | `commands.reminder.*`（20 分钟/1 小时/3 小时/下周/自定义）、`reminders.*`（下次提醒时间/已更改/已移除/**标记为已解决**）、ws 通道 `/api/ws-noti/v1` | `remindAt` 有字段无投递（G02） | 只有壳 |
| 循环 | `tasks.every.*` 14 档（含「每 [0] 天一次，周末除外」「每月 [0] 日」「每周 [0]」） | `recurrence` + roll-forward ✓，档位对齐待测 | 待测 |
| 状态 | `status(todo/doing/done)`？官方有「In Tasks Views」与 Upcoming 视图（`TaskViews` chunk） | 本地有 `status` 枚举 | 待测（G-新） |

## 五、导入 / 导出映射

**导出格式（官方全集）**：`DOCX`（Word，chunk `DocxExportApi`）、`PDF`（选项：A4/信纸、页码、水印、深色模式、插入分页符）、`Markdown`、`HTML`、`TextBundle`、`Plain`、`zip`（整库）。
→ 本地 4 种（Markdown/HTML/Text/JSON），**缺 DOCX / PDF / TextBundle / zip**，且本地多出 JSON（官方未见）。

**导入来源（官方全集，`import.*` 中文串实测）**：`来自 Evernote`、`来自 Google Docs`、`来自 Notion`、`来自 Readwise`、`来自 Markdown 文件`；另有 `OnboardingImportClient`、`AiGeneratedDocumentImportPopup`（AI 生成文档的导入弹窗）两个 chunk。
→ 本地只有 Markdown（≤20 文件）。

## 六、序列化与标识（DOM/网络侧证）

- 块级稳定标识：`data-block-id` 存在；URL 形态 `…/editor/d/<docUuid>/<blockUuid>?s=<shareToken>` → **块级深链是一等能力**（`?s=` 是分享态挂在查询串）。
- 粘贴/拖拽载荷：`text/plain`、`text/html`（Slate 序列化）；`application/pdf`、`application/zip`（ShareSheet 导出侧）；未见自定义 MIME（本地用的 `application/x-crafty-slash-command` 是自有扩展，官方插入面板拖拽走什么载荷 = 待测）。
- WebSocket 服务面（功能分组线索）：`/api/ws/v1`（文档同步）、`/api/ws-noti/v1`（通知）、`/api/ws-rtc/v1`（**实时通信/通话**，本地完全没有）、`/api/ws-ai-agent/v1/socket`（AI agent）。
- 后端源码位置在 HTML 注释里被直接指出：`github.com/lukilabs/Luki.Serverless` → 服务端渲染分享页（`editor_renderer.ts`），可作行为参考但**不据此推断协议**。

## 一之四、第 1 批沙盒写入采到的模型事实（`✓` 2026-09-27）

| 事实 | 证据 | 对复刻的含义 |
|---|---|---|
| **新建文档是"信号式 deeplink"**：`/editor/d/<rootDocId>?nd=<uuid>`，`nd` 里的 uuid **被丢弃**，真实页面 id 由 app 另分配 | V15：`nd=18dee1c7…` → 实际 `f4524777…` | 本地"前端生成 id 再 POST"的做法与官方不同；官方的 id 分配权在服务端/CRDT 侧，前端只表达"要建一个" |
| **新文档落点是「未分类」**（= 侧栏 `sidebar-inbox` 那一档），不是根目录也不是某个文件夹 | V15 信息页 位置 段「📁 未分类」 | 本地新建文档目前直接落根目录（`parentId=null`），缺"未分类"这一中间态 |
| **同一实体两套标题文案**：顶栏显示「无标题页面」，浏览器标签与列表显示「无标题文档」 | V15 | 印证"页面 vs 文档"是两层概念（见 `api-contract.md`）；本地两处都写「未命名」 |
| **代码块 / 公式 / Mermaid 的编辑器是 CodeMirror 6**，每实例挂载注入一段 hash 类名 `<style>`；**公式块无行号槽，代码与 Mermaid 有** | V21、`ins-*.html` diff（`.cm-content`、`.ͼ1o .cm-content ::selection{background-color:#BBDFFF}`） | 本地三者都用同一套 textarea/pre，缺"公式是可编辑的 CM 实例"这一层；选中色 `#BBDFFF` 是官方代码区选区色 |
| **撤销是编辑器焦点栈上的、按事务合并的栈**：一次面板建块=一步、连续输入 26 字符=一步、焦点不在编辑器时 Ctrl+Z 无效、光标点进 CM 子编辑器时 Ctrl+Z 被 CM 吞掉 | V16（4 次量化指纹） | 本地若用 TipTap 默认 history 且无"子编辑器隔离"，撤销语义会与官方不一致（这是行为级差异，不是缺功能） |
| **统计·这一页 是派生态**：区块数把**空块**也计入，随撤销实时更新，阅读时间格式为 `0s` | V19 | 本地 `wordCount` 走 `characterCount` 存储且只有一档，缺 区块/阅读时间/字符数 三项与"这一页"口径 |
| 文档卡片预览走 **`res.craft.do/render/document_preview/v1/<space>/<doc>/t/<ts>?v=1&s=<sig>&size=m&theming=true`**（带 `theming` 参数） | `dyn-alldocs-after-del.html` | 本地 tldraw 快照只覆盖白板；文档级预览图是另一个后端服务，本地要么自渲染要么明确不做 |
| `<html>` 上有 **whatinput** 属性组（`data-whatinput/intent/element/classes/data-pointer`） | `ins-mermaid.html` 头部 | 官方的"键盘 vs 鼠标焦点态"靠它全局驱动；本地只有 `:focus-visible` |

## 一之五、第 14 批零写入复验采到的浏览面模型事实（`✓` 2026-09-27）

| 事实 | 证据 | 对复刻的含义 |
|---|---|---|
| **浏览面路由是空间级前缀**：`<space>` 根 = 所有文档、`<space>/trash` = 最近删除、`<space>/inbox` = 未分类（侧栏行就是 `<a href>` 带 `--indent-level: 0`） | V31 + `dyn-trash.html` 侧栏行 | 本地路由树要按 `/<space>/<view>` 两级组织，`/trash` **不是全局路由**；侧栏行用真 `<a>` 而非按钮，且**缩进由 CSS 自定义属性 `--indent-level` 传** |
| **「最近删除」是有屏无入口的一等浏览屏**：侧栏、所有文档 ⋯（11 项）、⌘K 面板三处都不列它 | V31 ④ | 复刻时保留入口（官方是缺陷），但**屏本体行为要照抄**：⋯ 只有「清空最近删除」、空态只一句、30 天 disclaimer 条件渲染 |
| **删除有两条路径且后果不同**：批量选择 → 垃圾桶 → 「你无法撤销此操作」＝**硬删**（实测删完 `/trash` 仍空）；单项「将"X"移至最近删除」＝进回收站留 30 天（文案级） | V27 + V31 ⑤ + `move.x.to.recently.deleted` | 本地模型要区分 `permanent` 与 `to-trash` 两种删除语义，不能只有一个 `deletedAt` |
| **三档视图各是独立组件**：网格 `_1nu3o_/_dhebv_`（卡片 + `--grid-gap: 20px` + `--dc-aspect-ratio: 125%`）／瀑布（未采）／列表 `_1m9yz_`（表格 + 列头 + 112px 日期列） | V32 | 视图切换不是"改列数"，是**换渲染器**；三档共享同一份数据与排序状态 |
| **排序档位在列表视图里升格为可点列头**（名称/上次浏览/已更新/已创建，当前列带 ↓） | V32 ③ + V28 | 排序状态是**屏级共享**：⋯ 里选的和列头点的是同一个 state |

## 一之六、块样式九值 / 六级序号 / 导出映射（2026-09-27 反编译结案 ✓✓）

来源：`_harvest/js/index-DiTmKH3z.js`。这一节把 T-C2「逐档转换保真度」与 Step 4 一直想要的**导出映射表**一次性结掉。

### 1. `textStyle` 枚举全集 = **9 个**（不是 6 个）

按使用频次直读 `at.*`：`PageRegular(44) · Body(32) · PageCard(26) · Title(22) · Heading(22) · Subtitle(21) · Strong(17) · Caption(12) · Note(4)`。

**官方层级序号函数 `eY(t)`**（权威，直接给出"第几级"）：

| 枚举 | 序号 | 格式面板槽位（V22 实测 `sc-aqusau-2…7`） | 对外字符串（`mst()` 解析器） |
|---|---|---|---|
| `Title` | **1** | slot-2「标题」 | `title` |
| `Subtitle` | **2** | slot-3「副标题」 | `subtitle` |
| `Heading` | **3** | slot-4「标题」（**与 Title 同名的官方 i18n 碰撞**） | `heading` |
| `Strong` | **4** | slot-5「小标题」 | `strong` |
| `Body` | **5** | slot-6「正文」 | `body` |
| `Caption` | **6** | slot-7「说明」 | `caption` |
| `PageRegular` / `PageCard` | default→**5** | 不在面板（页面级） | `pageRegular` / `pageCard` |
| `Note` | default→**5** | **不在面板、也不在对外字符串表** | — |

⇒ 三件事同时结案：① **六档层级有数字序号**（不是只有词表）；② 面板 6 档 ↔ 枚举 9 值 的差集是 `{PageRegular, PageCard, Note}`，其中 **`Note` 在 UI 与协议两侧都不出现**（内部遗留值，复刻时可忽略但要能容忍读到）；③ 两个「标题」不是采集错误，是官方把 `Title` 与 `Heading` 都译成「标题」，**靠序号 1/3 区分**。

### 2. 导出映射表（块语义最硬的证据）

`g4e` 里的字面量映射（样式/类型 → 导出标签）：

```
title→h1   subtitle→h2   heading→h3   toggle→h4          ← 只有前三档进 h1-h3，toggle 独占 h4
focus→blockquote   unorderedList→ul   orderedList→ol   listItem→li   todo→li
PageSeparator→hr   Image→img   Video→p   File→p   Drawing→div   Whiteboard→div
```
⇒ **Video / File 塌成 `p`、Drawing / Whiteboard 塌成 `div`**（结构与内容丢失）；`Strong` / `Body` / `Caption` 不在此表内（走默认段落分支）。⇒ 复刻导出时按这张表逐格对齐，不要自己发明映射。

### 3. 块类型判定的**优先级链**（同一函数体的反向逻辑）

`listStyle ∈ {Bullet,Numbered,Todo} → listItem` ▸ `textStyle Title/Subtitle/Heading → title/subtitle/heading` ▸ `listStyle Toggle → toggle` ▸ `lineStyle PageSeparator → PageSeparator` ▸ `lineStyle ≠ None → Line` ▸ `decorations.focus → focus` ▸ `url != null → Url` ▸ `model.type` switch
⇒ **列表样式压过文本样式**：一个"项目符号 + 同时是 Heading"的块，判定结果是 `listItem` 而不是 `heading`。本地若按 textStyle 优先判就会不一致。

### 4. "页面"的判据是**两条任一**，不是单条

```
k4e = [PageRegular, PageCard]
NH(block) = k4e.includes(block.styleProps.textStyle) || block.subblocks.length > 0
```
⇒ **修正此前记忆里的"isPage = 有子块的块就是页面"单条判据**：官方是 `textStyle ∈ {PageRegular, PageCard}` **或** 有子块，两条满足其一即页面。⇒ 一个 `textStyle=PageRegular` 但**尚无子块**的空页面也是页面（此前判据会把它判成普通块）。
另三组常量：`Oh = [Heading, Subtitle, Title]`（三档"标题类"）、`v4e = [PageRegular, Title, Subtitle, Heading, PageCard]`、`Hlt = v4e + Strong`（多含 Strong）。

### 5. 降级时子块的去向（`w$`，此前完全没采到）

把一个**有子块**的块转成非页面样式时，官方发的事务是：
`setTextStyle(blockIds:[t.id], textStyle: Heading)` **＋** 把 `t.subblocks` 整批移到 `afterAnchor(t.id)`（即**提到父级、紧跟在原块之后**），随后选中 `t.id + 其原子块`。
⇒ **子块既不删除也不保留嵌套，而是平铺上提**。这是"页面降级为标题"最容易被本地实现做错的一格。

### 6. 移动与缩进（`jT`，Alt-↑/↓ 的精确语义）

`extendWithIndentChildren(…)` → `firstLastSelectedIdxInParent(…)` → `getMinIndentOfSelection(…)` → 按 `direction === "up" ? first : last` 取锚点
⇒ **移动单位是"含缩进子块的整块"，方向决定取选中集的首锚还是尾锚，且以最小缩进为界** —— 不是单块换序。

### 7. 落点寻址有 **6 种**（`Rr/Wi/pa/fT/dI/vMe`），比画廊 hook 更深

```
{type:"indexInParent", index, parentId}
{type:"afterAnchor", anchorBlockId, parentId}
{type:"afterAnchorVisible", anchorBlockId, parentId}      ← 跳过不可见块
{type:"beforeAnchorVisible", anchorBlockId, parentId}     ← 跳过不可见块
{type:"coverImage", pageId}
{type:"intoObjectList", objectListId}
```
⇒ 存在 **`*Visible` 两档** ⇒ **折叠/隐藏的子块在落点计算中被越过**（与 §七 画廊的半区公式配套：UI 算 index，协议层算 anchor）。谓词 `IMe = afterAnchor|indexInParent`、`fp = afterAnchorVisible|beforeAnchorVisible`。

### 8. 块的完整线格式（`B1e`，20 字段）与新建默认值（`F1e`）

`{id, type, parentId, documentId, createdByUserId, modifiedByUserId, rawProperties, pageStyle, pageStyleProps, style, content, subblocks, isDeleted, created, updated, pluginData, objectData, taskData, blob, stamp, resourceId}`；序列化时 `SMe` 把 `blocks` 改名 `subblocks`。
新建块默认：`type:"text"`、`style:{textStyle: Body}`、`rawProperties:{}`、`pageStyle:{themeId:null, styleId:"luki", themeColor:null, paragraphSpacingType:null, authorVisibilityType:null, pageWidthType:null, textColor:null, paperBgColor:null, background:null, lineThemeStyle:null, cardThemeStyle:null}`、`pageStyleProps:{fontName:"system"}`。
⇒ **每个块（不只页面块）都自带一份 11 子字段的 `pageStyle`**，默认 `styleId:"luki"`；文档根块由 `N1e` 建为 `textStyle: PageRegular` 并返回 `{spaceId, documentId, blocks:[root], rootBlockId}`。

### 9. 撤销/重做与块操作在**同一张 action 分派表**（26 项）

`insertNewBlocksToTable · insertNewBlocksToObjectList · mergeTextBlocks · setTextStyle · setListStyle · setImageStyle · setDecorStyle · setLayoutStyle · setTodoState · setBlockColor · setPageBackground · setPageFontStyle · setPageParagraphSpacingType · setPageStylePreset · setLineType · duplicateSubtree · setMediaUploaded · setPluginData · setCoverImage · toggleCoverImageEnabled · setCoverImageUploaded · updateShare · deleteShare · replaceSharesForDocument · undo · redo`
⇒ **`undo`/`redo` 是协议级 action**，与 `setTextStyle` 平级，不是纯客户端栈（与 V16"撤销按事务合并"互证：一个事务就是若干这类 action 的数组）。另注意 `setLineType`（分隔符样式三档）、`setPageParagraphSpacingType`、`duplicateSubtree` 是此前任何文档都没记录的 action。

## 仍未采到（模型面）

1. ~~每个块的**属性全集**（Slate attrs）——需要块级复制/导出 JSON 反推~~ **已结案（§一之六 8）**：块线格式 20 字段（`B1e`）+ 新建默认值（`F1e`，含 11 子字段 `pageStyle` 与 `styleId:"luki"`），直接从代码字面量读到，**不需要剪贴板通路**。仍缺的是 `rawProperties` / `objectData` / `taskData` 三个**容器内部**的字段名（各自有独立解析器，尚未逐个展开）。
2. ~~嵌套规则与转换保真矩阵 → 待第 1 批沙盒动作~~ **大部分结案（§一之六）**：九值 `textStyle` + 数字序号 `eY()` + 导出映射表（`title→h1 … toggle→h4`、`Video/File→p` 塌缩）+ 类型判定优先级链（`listStyle` 压过 `textStyle`）+ 降级时子块平铺上提（`w$`）。**仍缺**：哪些块类型能进分栏/表格/折叠块的**白名单**（`allowedChildren` 类常量未定位到），以及 `Strong`/`Body`/`Caption` 三档在导出表里没有条目 ⇒ 它们的导出形态仍要靠实际导出物对。
3. ~~`separator` 与 `divider` 的区分、`title/subtitle` 与 H1–H4 的映射~~ —— 层级部分已由契约结案（见 §一之三：`title/subtitle/heading/strong/page/body`，无 1–4 级阶梯）；**`separator` 与 `divider` 也已由实屏结案**（§一之二：插入面板同时有「插入 线」与「插入分页符」⇒ 分隔线块 与 分页块 两种东西）。
4. ~~集合列类型的权威枚举值~~ **已结案**（`protocol.md` §一，13 项 `DatabaseSchemaPropertyType`，源码字面量）。仍缺的是 `filters`/`sortBy`/`groupBy`/`calculations` 四个**内层结构**的字段名，以及筛选操作符与聚合函数的线值字符串（i18n 侧已给出 14 个操作符人话形态与 12 种聚合，见 `dialogs.md` §6 与 `protocol.md` 未采清单）。
5. `/api/ws-rtc/v1` 对应的产品功能（视频通话？白板协同？）——界面未见入口，需进日历/会议相关屏验证。

## 一之七、集合字段类型系统（2026-09-27 09:29 静态结案，`js/index-*.js` @156816 / @163204，零浏览器预算）

⇒ **结案 `gap.md` §六 采集缺口第 4 条**（"集合列类型全集未枚举 → G23 清单可能不完整"）。

### 1. 类型枚举 = **13 个值**（内部枚举 `le`，字面量原样）

```
text | number | checkbox | date | url | person | select | multiSelect
     | media | relation | linkToBlock | email | phone
```

★ 注意三个**不叫直觉名字**的值：**`linkToBlock`（不是 `link`）**、`multiSelect`（驼峰）、`media`（图片/文件类统一一个类型）。⇒ 本地若按 `select/multiselect/link` 命名会与官方协议不兼容。

### 2. 值校验器 `$Me({type, value}, field)` —— 每类型的合法值定义（权威）

| 类型 | 合法值判据（源码原样） |
|---|---|
| `text` / `url` | `typeof value === "string"` |
| `select` | 字符串 **且** ∈ 该字段配置的选项值集（`_C(fieldId, config?.options)`，经 `Is` memo） |
| `number` | `typeof value === "number"`（**不是字符串数字**） |
| `checkbox` | `typeof value === "boolean"` |
| `date` | **`value instanceof Date`** ⇒ 运行时必须是真 `Date` 对象，**ISO 字符串一律不合法** |
| `person` | `typeof === "object" && !== null` |
| `media` / `relation` / `linkToBlock` | 各有专用谓词 `ZMe` / `VMe` / `WMe` |
| `multiSelect` | `Array.isArray` **且每个元素都是字符串且都在选项值集内** ⇒ **一个越界选项就使整格判否** |
| **其它（含 `email`、`phone`）** | **`default: return false`** ⇒ ★ 这两个类型在校验器里**没有 case 分支** |

★ 关于 `email`/`phone` 恒 false：**不断言这是官方 bug** —— `$Me` 的实际用途未定位（可能是"可用于分组/筛选的值"而非"可写入的值"）。但事实要记：**枚举里有 13 类、校验器只覆盖 11 类**。

### 3. 数字字段有 **3 种显示子格式**（从图标映射器反推）

`UMe(t)`：`percent → "percentage"`、`currency → "money"`、`default → "hashtag"` ⇒ **number 字段带一个"数字 / 百分比 / 货币"三档格式**，图标分别是 `#`、百分比、钱袋。
类型图标映射另给出：`email → "envelope"`、`phone → "phone"`、`person → "at-sign"`、未知 → `"objects-placeholder"` ⇒ **每个字段类型都有独立图标**，本地做集合面板时需要这 13 个图标位。

### 4. 列的拖拽落点类型（顺带）

`EMe(t, e, n) = { type: "afterTableColumnLocation", tableId, column, maxCol }` ⇒ **列拖拽的落点是一个带 `maxCol` 上限的位置对象**，与 §一之六 的块级六寻址是**两套独立的落点协议**（块用 `indexInParent`/`afterAnchor`…，列用 `afterTableColumnLocation`）。

### 5. 彩蛋屏的挂载方式（顺带结案一半）

`this.props.isEasterEggOpen && createPortal(<Suspense fallback={null}><EasterEgg/></Suspense>, document.body)` ⇒ 游戏是**根组件上的 body 级 Portal**，由 `webappUiStore.isEasterEggOpen` 驱动；action creator `K1o(t) = {isOpen, type:"openEasterEggAction"}` 在 index 里**没有任何调用者** ⇒ **触发入口仍在别处（未证）**，但状态字段与挂载形态已确定。同族还有 `openPlaygroundAction`、`openFullSearchAction`、`openSharedWithMeAction` ⇒ **四个"隐藏屏"共用一套 store 开关**。

### 仍未采到（§一之七 遗留）

- `email` / `phone` 在 `$Me` 里无分支的**真实原因**（该函数的调用点未定位）。
- `ZMe` / `VMe` / `WMe`（media / relation / linkToBlock）的**内部结构要求**。
- `_C(fieldId, options)` 的选项对象形状（只确认有 `value` 字段）。
- `openEasterEggAction` 的**触发者**（键盘序列？隐藏手势？）。
- `afterTableColumnLocation` 的 `maxCol` 上限值与列数门禁。

## 一之八、块线格式 ↔ 内部模型映射（解析器 `m1`，2026-09-27 09:44 静态结案，`js/index-DiTmKH3z.js` @148600 / @150100）

⇒ **结案 §一 开放项 1 的后半**（`rawProperties` / `objectData` / `taskData` 三个容器的字段名），并新出**任务 API 契约**（§一之九）。

### 1. 一个块的完整线字段（`m1(t)` 读了什么）

```
id  parentId  documentId  createdByUserId  modifiedByUserId
type  content  subblocks  created  updated  isDeleted
resourceId  stamp  blob
rawProperties   ← 一个 JSON 容器（按 type 走 w1e）
pluginData      ← 一个 JSON 容器（表格数据在这里）
taskData        ← 一个 JSON 容器（任务四字段在这里）
objectData      ← 一个 JSON 容器（集合对象在这里）
style  pageStyle  pageStyleProps
```

⇒ 本地建模时的**分层原则**由此确定：`content` 只是文本，**结构化负载全在四个 JSON 容器里**，而容器内部字段是**带类型门禁的**（`w1e(t.type, P)` 的 `t.type` 说明不同块类型读不同子集）。

### 2. `rawProperties` 实际被读出的键（9 个，全部 `?? null` 缺省）

`todoState`、`coverImage`、`titleEnabled`、`model`、`url`、`areCommentsHidden`、`dailyNoteDate`、`smartLinkData`、`smartLinkLastSyncTimestamp`，另加 `toDoCheckedDate`（经 `mLe` 宽松解析：`Number.isNaN ? null : Date`）。

★ 注意有**两个"勾选完成时间"字段名**：线格式里是 `rawProperties.toDoCheckedDate`，而**任务 API 层叫 `todoCheckedTime`**（9 处引用）。本地 Prisma 用的是第三种名字 `completedAt`（`contract.prisma:303`）⇒ 三处三个名，对齐时要选一个并写清映射。

### 3. 三种块的负载藏在哪（此前完全没记录）

| 块类型 | 负载位置 | 证据 |
|---|---|---|
| `table` | **`pluginData`** | `if(t.pluginData!=null) switch(t.type){case"table": … M.type==="success" && (C={type:"table",data:M.tableData})}` ⇒ 解析结果是**带 `type:"success"` 判别式的 Result**，失败则 `model` 保持 `rawProperties.model` 的原值 |
| `object` / `objectList` | **`objectData`** | `type==="object"` → `{type:"recordObject", objectData}`；`type==="objectList"` → `{type:"objectList", objectListData}` ⇒ ★ **集合不是独立实体，而是两种块类型**；`objectList` 才是"集合表头/字段配置"的载体 |
| `code` | **`blob`** | `t.type==="code" ? (r = M.data.content)` ⇒ ★ **代码块的正文不在 `content` 而在 `blob`**（大文本走对象存储）|
| `whiteboard` | **`blob`** | `t.type==="whiteboard" ? j = M.data` → `{type:"whiteboard", data}` |

⇒ 其余类型若有 `blob` 会走 `trackError(new Error("Unexpected blob data for block type ${type}"))` —— **官方对"负载出现在错误位置"是有断言与上报的**，本地可照抄这一条不变量做校验。

### 4. 时间是"挂钟对齐"的毫秒数，且序列化/反序列化互逆（★ 复刻最容易做错的一处）

```
读入：deadline / schedule / startDate / dailyNoteDate 都是  ti(x) = parseInt(x, 10)  →  VE(d)
      VE(t) = shiftMinutes(new Date(t), +getTimezoneOffset())      // 往"本地挂钟"方向挪
写出：schedule / deadline 走  V5(x)
      V5(t) = { t.setHours(0,0,0,0); shiftMinutes(t, -getTimezoneOffset()).getTime() }  // 归到当日 00:00 再挪回 UTC
```

⇒ **官方把"只有日期"的任务时间存成"本地当日 00:00 对应的 UTC 瞬时"**，读取时再挪回来显示。跨时区设备看到的**不是同一个瞬时**，而是**同一个挂钟日** ⇒ 这是 date-only 语义的正确实现方式。
★ 三档区分得很干净：`deadline`/`schedule` 用 `V5`（**午夜对齐**），`todoCheckedTime` 与 `repeat.startDate` 只用 `.getTime()`（**真实瞬时，不做归一化**），`repeat.reminder.dateOffset` 是**当日分钟数**（见 `tasks.md` §10.9）。⇒ **同一张表里混着三种时间口径**，本地一律用 `DateTime` 就会串味。

### 5. 页面（文档级）样式字段（`I1e` 解析器，@150380 起）

`styleId`、`authorVisibilityType`、`pageWidthType`、`themeColor`（经 `Yt` 校验）、`paragraphSpacingType`（**必须 ∈ `oMe` 枚举，否则置 null**）、`background`（判别式 `{type:"solid", solidColor, size}`，还有其它分支未展开）。
⇒ 本地设置面板已有的字段要按这组命名对齐；`authorVisibilityType` 与 `pageWidthType` 是官方独有的两档，此前只从 UI 见到、没有字段名。

### 6. 顺带掉出的日期原语（一张表，别再重新发现）

| 函数 | 语义 |
|---|---|
| `ec(t,e)` | 加**日**（`setDate`） |
| `lLe(t,e)` | 加 `e*7` 日（= 加周） |
| `cg(t,e)` | 加**月**（`setMonth`） |
| `y0(t,e)` | 加小时 |
| `Lm(t,e)` | 加分钟（时区挪移就是用它） |
| `zq(t,e)` | 加秒 |
| `ti(t,e=10)` | `parseInt`，NaN → `null` |
| `s1(t)` | `parseFloat`，NaN → `null` |
| `mLe(t)` | 宽松 Date：`Number.isNaN(getTime()) ? null : Date` |
| `n1e(arr)` | **按 `getTime()` 去重**保序 |
| `vi(a,b)` | **同年**比较（只比 `getFullYear`） |
| `r7(t,e,n,o)` | 区间包含判断；**`n<=e` 直接 throw `"Start date must be earlier than end date"`** |
| `Azt(ms)` | `Math.round(ms/1e3/60)` = 毫秒→分钟 |
| `zb(a,b)` | `\|a-b\| < 20s` ⇒ **官方用 20 秒容差判"同一时刻"**（去抖/相等比较） |
| `sLe` / `iLe` | `Kce(t=>t>=0,"Must be positive")` / `t<=0,"Must be negative"` ⇒ **断言工厂 `Kce(v,msg)` 抛 `n3`** 是通用约定 |

## 一之九、任务 API 契约（★ 子任务在此结案到结构级，2026-09-27 09:46）

### 1. 读：任务就是块

`Ed = t => m1(SMe(t))` ⇒ API 返回的 task 形状经 `SMe` 适配后**直接进同一个块解析器**；`mqe`（批量写）的响应取的是 `.blocks`。⇒ **官方没有"任务表"这一层，任务 = 带 `taskData` 的块**，与 §一之八 3 呼应。

### 2. 四个端点（从 URL 构造器与 verb 直读）

| 端点用途 | 请求 | 响应 |
|---|---|---|
| 日历/日程取任务（**月 or 日 二选一**） | `GET {spaceId, month}` 或 `{spaceId, day}` + `continuationToken` | `{documents, tasks[], users[], continuationToken, pageInfo:{…debug, …pageInfo}}` |
| 按文档分组的任务 | `GET …` | `{documents:[{…doc, tasks[]}], users[], continuationToken, pageInfo}` |
| **子任务批量** | `GET …(t)` | `{subTasks: [{rootTaskBlockId, subTaskBlocks: Block[]}]}` ⇒ 客户端建 `Map<rootTaskBlockId, Block[]>` |
| 批量写 | `PUT {tasks:[…]}`（**整个数组一次提交**） | `{blocks:[…]}` 再逐块 `Ed` |
| 单任务写 | `PUT {target, task}` | 同上（`gqe`） |

★ 两个"写入口"的时间归一化**不一致**：批量 `mqe` 对 `schedule`/`deadline` 过 `V5()`（午夜对齐），单任务 `gqe` **不过 `V5`**、只过 `e2e(repeat)`。⇒ **事实记录，不断言是 bug**（可能 `target` 路径的入参已是归一后的值），但这是动态采集该验的一条：**同一字段两条路径写入的结果是否相同**。

### 3. `repeat` 的序列化只动一个字段

`e2e = t => t && {...t, startDate: t.startDate ? t.startDate.getTime() : t.startDate}` ⇒ `interval`、`daily/weekly/monthly/yearly`、`reminder` **原样透传**。⇒ 与读侧 `dMe` 用 `ti()`（parseInt 容忍字符串）形成不对称：**写出去是 number，读回来允许是 string**。本地校验器若严格 `typeof === "number"` 会拒收官方数据。

### 4. 子任务的字段级证据

- 任务对象上**没有** `parentTaskId`（全 bundle **0 次**）；`rootTaskBlockId` 与 `subTaskBlocks` **各只出现 1 次**（都在那个批量端点里）。
- ⇒ **客户端不携带父子指针，关系由服务端按块层级推导后回给客户端**。本地若想在 Task 表上加 `parentId` 列，就是与官方模型的**有意偏差**（要在 gap 里显式写明原因）。
- ⇒ 升级 G263：从"官方有 `tasks.subtasks` 这个文案键"（命名覆盖）→"**有一条专门的子任务端点与 `{rootTaskBlockId, subTaskBlocks}` 响应结构**"（结构覆盖）。

## 一之十、集合的两层结构与新建工厂（2026-09-27 10:16 静态结案 ⇒ **§一之八/§一之九 的两处前提一并解除**）

### 1. `SMe` 适配器只改一个字段名（结案 §一之九 的"未展开"警告）

`SMe(t) = { t.subblocks = t.blocks; delete t.blocks; return t }`
⇒ ★ **API 层的任务/块用 `blocks` 表子级，wire 层用 `subblocks`**，**除此之外字段名完全一致**。⇒ §一之九 里"所有 API 字段名结论都以 `SMe` 未展开为前提"**这句作废**：`deadline`/`schedule`/`todoCheckedTime`/`repeat`/`rootTaskBlockId` 等都是**真实线上字段名**，不是适配器改名后的产物。

### 2. 集合 = 两种块各持一半（★ 回答"字段定义到底存在哪一层"）

| 块类型 | `objectData` 解析器 | 字段 |
|---|---|---|
| `objectList`（**集合表头**） | `DC` | `{schema, views: [] }` ⇒ ★ **字段定义（schema）与视图配置（views 数组）都在 `objectList` 上**；`views` 缺失时**默认空数组**（容错） |
| `object`（**记录对象**） | `uT` | `{properties, schemas, theme}`，线上字段名分别是 `properties` / `schemas` / **`themeString`**（★ 内存里叫 `theme`、线上叫 `themeString`，反向序列化器 `hp` 负责改名并做编码 `rl()`） |

⇒ **`properties` 与 `schemas` 在解析器里原样透传、不做校验** ⇒ 校验发生在**别处**（§一之七 的 `$Me` 是值校验器，但它的调用点仍未定位）。

### 3. ★ 一个记录对象可以属于**多个 schema**（集合可跨列表聚合的结构基础）

判定代码（@663609）：
```
x.type !== "recordObject"                                → false
e.objectSchemaId == null || C.model.objectData.schemas == null → true      ← ★ 缺省即"通过"
否则 → C.model.objectData.schemas.includes(e.objectSchemaId)
```
⇒ 三条结论：① 记录对象上另有**块级字段 `objectSchemaId`**（不在 `objectData` 里）；② `object.schemas` 是**该对象可归属的 schema id 数组** ⇒ **同一对象可同时出现在多个集合里**；③ 匹配判定是**宽松的**：任一侧缺字段就返回 `true`（"没配置就不筛"），**不是**抛错或判否。
⇒ 本地若把"记录 ↔ 集合"做成外键单值（`collectionId`）就表达不出第 ②③ 条 —— 这是**模型级差异**，不是字段命名问题。

### 4. 新建块工厂 `F1e(createdByUserId, documentId = null)`（★ 默认值全集，且**没有 order 字段**）

```
id: <uuid>          content: ""          subblocks: []        type: "text"
style: { textStyle: Body }
rawProperties: {}                         ← 空对象，不是 null
pageStyle: { themeId, styleId:"luki", themeColor, paragraphSpacingType, authorVisibilityType,
             pageWidthType, textColor, paperBgColor, background, lineThemeStyle, cardThemeStyle }   ← 11 键，除 styleId 外全 null
pageStyleProps: { fontName: "system" }    createdByUserId = modifiedByUserId = 入参
created = updated = Date.now()            parentId: null       documentId: 入参
isDeleted: false    pluginData: null  objectData: null  taskData: null  blob: null  stamp: null  resourceId: null
```
⇒ ★ **块顺序由 `subblocks` 数组的位置表达，工厂与 wire 里都没有 `order`/`index` 字段** ⇒ 本地 `Task.order Float` 与文档侧的排序列是**另一种建模选择**（有意偏差候选：本地要显式排序列，官方靠父数组下标 + 移动 action）。
⇒ ★ `rawProperties` 初值是 **`{}` 而不是 `null`**，而 `pluginData`/`objectData`/`taskData`/`blob` 初值是 **`null`** ⇒ **两类容错语义不同**：读 `rawProperties` 的解析器（`Yn`）必然拿到对象，读那四个容器的则可能拿到 null（`m1` 里确实是 `t.pluginData != null` 才进 switch）。
⇒ 工厂**不产出** `styleProps`/`todoState`/`coverImage`/`titleEnabled`/`url`/`dailyNoteDate`/`smartLinkData` ⇒ 这些全是 `rawProperties` 内的可选键（§一之八 2）。

### 5. 新建页面/文档的请求体形状（`N1e`）

`N1e(spaceId, documentId, userId, title?) = { spaceId, documentId, blocks: [root], rootBlockId: root.id }`，其中 root = 工厂产物再覆盖 `{subblocks: [], style: {textStyle: PageRegular}, content: title ?? ""}`。
⇒ ★ **页面标题就是 root 块的 `content`**（没有独立 `title` 字段），且 `content` 可 `undefined` → 回退 `""`；root 块的判别属性是 **`style.textStyle = PageRegular`**（与 §一之六"页面两条判据"里的第一条一致）。
⇒ 顺带定名下两个落点构造器：`Rr(parentId, index) = {type:"indexInParent", index, parentId}`、`Wi(anchorBlockId, parentId) = {type:"afterAnchor", anchorBlockId, parentId}`（§一之六 六寻址的其中两个的**实际形状**）。

## 一之十一、`rawProperties` 的按类型分支表与插件系统（2026-09-27 10:20 结案 §一之八 遗留 1）

### 1. `w1e(type, rawProperties)` 返回值 = 固定 8 键 + 按类型分叉的 `model`

```
todoState     = +rp.isTodoChecked ?? 0                    ← 数值编码（不是布尔）
coverImage    = { enabled, uri, attribution, primaryColor, aspectRatio, imageWidth,
                  hasTransparency, rawUrl, rawAspectRatio, rawImageWidth, cropMask }
titleEnabled  /  areCommentsHidden  /  dailyNoteDate  /  smartLinkData  /  smartLinkLastSyncTimestamp
model         = l   ← 只有四种 type 会产出
url           = r   ← 只有 type === "url" 才产出
```
★ **字段改名对照**（线上名 → 内存名）：`coverImageValueKey`→`uri`、`coverUnsplashAttribution`→`attribution`、`coverImageEnabled`→`enabled`、`uploaded`→`isUploaded`、`iconUrl`→`imageUrl`、`lastSyncTimestamp`→`smartLinkLastSyncTimestamp`、`isTodoChecked`→`todoState`。⇒ **wire 命名不带 `is` 前缀、内存带**（`uploaded`/`isUploaded`、`hasTransparency` 例外）。

### 2. `model` 的三条类型分支（块类型全集里各型的专属负载）

| type | `model` 形状 |
|---|---|
| `image` / `video` / `file` / `drawing` | 共用一份 `{fileName, aspectRatio, isUploaded, rawUrl, isPreviewImageUploaded, url, mimeType, primaryColor, rawDataSize, previewImageWidth, previewImageHasTransparency, type}`；**`image` 再加 `unsplashMetaData`**；**`file`/`video` 再加 `fileExtension`** |
| `url`（书签/嵌入块） | `{title, description, url, imageUrl, originalUrl}` ⇒ ★ **`url` 本身就是一个块类型**，且它**同时占用 `model` 之外的独立 `url` 字段**（两条不同产出） |
| `code` | `{type:"code", language}` ⇒ 语言在这里，**正文在 `blob`**（§一之八 3） |

⇒ **媒体主色是算出来的**（`primaryColor: iMe(l)`，对整包媒体属性求值），而**封面主色是写死的 `#f2f2f2`**（字面量在 `w1e` 里）⇒ 两者来源不同，复刻时不要给封面也去做取色。另见同文件的 `GE = "#e6e6e6"` 常量与 `d1 = false` 开关。

### 3. ★ 同一个 rawProperties 里有**两套 date-like 解析**（易错点）

| 字段 | 解析器 | 产出 |
|---|---|---|
| `dailyNoteDate`、`smartLinkLastSyncTimestamp` | `Rf` = **`parseFloat`**（NaN→null） | **number，不是 `Date` 对象** ⇒ 极可能是日序数/整数戳 |
| `deadline`、`schedule`、`repeat.startDate` | `ti` = `parseInt` → `VE`（挂钟归一） | **`Date` 实例** |
| `toDoCheckedDate` | `mLe` = `new Date` + NaN 检查 | `Date` 或 `null` |

⇒ **结论：官方对"日期"没有统一表示**，同一容器内三种解析路径并存 ⇒ 本地若假设"所有日期字段同一个编解码器"必然出错。`smartLinkData` 与 `objectList` 的 `themeString` 都过同一个 **`si`**（⇒ `si` 是 JSON 解析包装，反向是 `rl`）。

### 4. `S1e(pluginData)`：★ **样式主题是一个"插件"**

`pluginType: "card"` 分支的准入是 **`pluginName ∈ nMe`**（`nMe = Object.values(Xa)` ⇒ **白名单是一个枚举对象的值**），配置体经 `si(pluginConfigurationData)` 解析后取：
```
{ fontStyle, pageStyle,
  backgroundData: { backgroundColor, backgroundColorGradientEnd, userInterfaceStyle,
                    backgroundImageURL, isLightColor, key },
  decorations, contentStyle, themeAssetId }
```
⇒ ① **文档"主题/卡片样式/背景"是以插件形式挂在块的 `pluginData` 上的**，且带 **`themeAssetId`**（⇒ 主题资产是独立资源，与图标 `FolderIconAssetDataSource` 那套资产体系同源）；② 背景支持**双色渐变**（`backgroundColor` + `backgroundColorGradientEnd`）与**用户界面风格**字段 ⇒ 主题能改外壳而不只是内容；③ **`isLightColor` 是随主题下发的布尔**（⇒ 深浅判定不在前端算）。
⇒ 同族还有两个白名单：`oMe = Object.values(Pm)`（`paragraphSpacingType` 的合法值，§一之八 5 用它做校验）、`sMe = Object.values(ys)`。~~`Xa`/`Pm`/`ys` 三个枚举体本身未取到~~ **已结案（§一之十五 1）**：编译后的 TS 枚举写作 `(t=>(t.X="…",t))(T||{})`，所以按 `Xa={…}` 匹配必然失败（教训已写进技能）。
⇒ 顺带一条通用小函数：`j3 = (t, e, n) => t != null && e.includes(t) ? t : n` ⇒ **官方"枚举白名单校验"的统一写法就是这一行**（三处 `Object.values` 都配它用），本地可直接照抄成 helper。



## 一之十二、表格的数据结构（`_U` 解析器，2026-09-27 10:27 结案 §一之八 遗留"表格单元格模型"）

### 1. `tableData` 是**三张平行数组 + 一个 style**，不是嵌套的 row→cell 树

`_U(parserCtx, raw)`：先判 `raw` 是 object（否则 `{type:"failure", errors:["raw table data must be \`object\`"]}`），再**逐项独立**解析
```
rows:    TableRow[]      ← $Le
columns: TableColumn[]   ← HLe   →  {id, metadata?}（metadata 走 ULe）
cells:   TableCell[]     ← VLe   ← ★ 与 rows/columns **并列**的扁平一维数组
style:   NLe
```
⇒ ★ **每个缺项都会单独 `logError("`rows` is not TableRow[]")`**，**且不会整体失败** —— 三项各自 `|| void 0` ⇒ 部分损坏的表格数据仍能解析出剩余部分。⇒ 官方的表格容错是**逐字段降级**，本地若做"schema 校验失败即整块丢弃"就不等价。
⇒ 解析结果外面还包一层 Result 判别式：`M.type === "success"` 才写入 `model = {type:"table", data: M.tableData}`（§一之八 3）。

### 2. ★ 单元格 = **四个 id，内容是指向块的引用**

`VLe(t, ctx)` 逐字段判类型：`{id: string, rowId: string, columnId: string, blockId: string?}`
⇒ 三条硬结论：
1. **单元格不内联存文本**，而是**持有一个 `blockId`** ⇒ **表格单元格的正文就是一块普通块**（可以有子块、可以嵌代码/任务/图片），这解释了"表格能装任意块"的手感，也解释了 §一之六 找不到的 `allowedChildren` 白名单为什么在块层不存在。
2. 单元格用 **`(rowId, columnId)` 二元引用**挂在两张独立数组上 ⇒ **增删行/列不需要重排 cells**，只需要动 `rows[]`/`columns[]` 并补/删对应 cell ⇒ 与本地"二维数组套内容"的表格实现是**不同结构**。
3. **每个 cell 自己有稳定 `id`** ⇒ 单元格可被引用/定位（`复制区块链接`、公式区域引用 `formula.above/below/…` 都需要稳定可寻址单元）。
⇒ ~~未展开：`$Le` / `NLe` / `ULe`~~ **第 46 批全部结案（§一之十六）**：行只有 `{id, metadata?}`（**无 height**，猜测证伪），行 metadata 唯一字段 `isHeaderRow`；表 style 三字段 `alternatingRowColor` / `hasColumnsHeader` / `hasRowsHeader`；列 metadata 唯一字段 `width`，且**存成 `{percentage}` 百分比对象**。

## 仍未采到（模型面·第 39 批）

- `objectList.schema` 的**内部结构**（字段定义列表？含 §一之七 的 13 类型与选项集？`DC` 原样透传，未展开）。
- `object.properties` 的值形态（`$Me` 校验器期望的 `{fieldId: value}` 形状未在此确认）。
- ~~`hp`/`rl` 做什么~~ **本批部分结案（§一之十一 3）**：`si` = JSON 解析包装、`rl` = 其反向（`themeString` 与 `smartLinkData` 两处共用）；**尚未证**的是 `rl` 是否另有编码/压缩步骤。
- `objectSchemaId` 在**哪些**块字段上出现（只在一处判定里读到，未看写入侧）。
- 移动/重排 action 到底改什么（既然没有 order 列，`Doc move` / `Folder reorder` 应当是改 `parentId` + 数组下标 ⇒ 未证）。
- ~~★ `Xa` / `Pm` / `ys` 三个枚举体本身~~ **第 45 批结案**：`Xa` = 五种 `card.*` 卡片主题样式（= `nMe` 白名单）、`Pm` = `{dynamic, fix}`（**段落间距只有两档**）、`ys` = `{full, faded, unknown}`；连同 12 个白名单集与 `j3` 安全回退函数一起见 **§一之十五 1–2**。⇒ 「样式主题有哪几种」「段落间距有哪几档」两个问题结案。
- `iMe(l)`（媒体主色算法）与 `s1e`（封面 `cropMask` 形状）未展开。




## 一之十三、集合单元格的十个按类型编辑器（2026-09-27 10:46 结案，`js/{Text,Email,Phone,Url,Date,Select,MultiSelect,Person,BlockLink}Editor-*.js` + `js/Toggle-*.js`，合计 15.6 KB **全部整文件读完**）

⇒ **本批一次结掉 §一之七 的四个遗留**（`email`/`phone` 为何无校验分支、`HMe`/`ZMe`/`VMe`/`WMe` 的值结构、`_C` 选项对象形状），并推翻一条隐含假设。

### 1. 三种编辑器形态（13 个字段类型 → 10 个 chunk）

| 形态 | 类型 | 关键事实 |
|---|---|---|
| **行内输入**（4 个，共用同一个基础输入组件） | `text` / `email` / `phone` / `url` | ★ **四者只差 `inputMode`**：`"text"` / `"email"` / `"tel"` / `"url"`；`propertyType` 可由外部覆盖（`i === void 0 ? 默认 : i`）⇒ **一个编辑器可服务多类型**；`placeholder` 默认 `""`，**唯 `url` 的默认 placeholder 是 i18n 键 `style.inline.link`**（★ 复用行内链接的文案） |
| **弹层**（5 个） | `date` / `select` / `multiSelect` / `person` / `linkToBlock` | 统一 props `{open, onClose, anchorEl, value, onSave, …}`；**`if (!open) return null`** ⇒ 弹层是**条件挂载**而不是隐藏；`placement: "bottom-start"`、`placementOffset: 4` |
| **开关**（1 个） | `checkbox` | 见 §5 的精确视觉常量 |

⇒ `media` / `relation` / `number` 没有独立 chunk ⇒ 走别的通路（未证）。

### 2. ★ 单元格值是**带类型的判别对象**，不是裸值 ⇒ `$Me` 不是写入校验器

每个弹层都构造 `propMeta = {id, name, theme: undefined, options?, origSchema: {type, config}}` 与 **`value = {type, theme, value}`**（★ **值的值再嵌一层**），再交给统一的 `onPropertyChange`。
⇒ 与 §一之七 的 `$Me({type, value}, field)` 对"裸值"做 `typeof` 判定**形状不匹配** ⇒ **强证据：`$Me` 校验的不是单元格写入值**（更可能是"可用于分组/筛选/聚合的值"）。⇒ 本条只到"不匹配"这一事实，**不断言 `$Me` 的确切用途**（调用点仍未定位）。
⇒ 同时回答 §一之七 遗留：★ **`email`/`phone` 有专门的编辑通路（只是换了 `inputMode`）⇒ "校验器无分支"不等于"这两种类型不能写"**。

### 3. ★ 清空一律写 `null`（不是 `[]`、不是空串）

`Date`：`onSave(f => r(f ?? null))` ｜ `Select`：`a(o ?? null)` ｜ `MultiSelect`：**`const p = i ?? []; 提交 (p.length > 0 ? p : null)`** ｜ `Person`/`BlockLink`：`!items || items.length === 0 → 存 null`
⇒ 与 `tasks.md` §10.8 的"关掉提醒写 `{enabled:false}` 而不是删字段"、§一之七 的"缺失 ≠ 关闭"是**同一条产品哲学：空态要显式**；但同时**空数组一律收敛成 null** ⇒ 本地若把"清空"实现成 `[]` 会与官方数据不兼容。

### 4. 各类型值结构（回答 §一之七 遗留 2、3）

- **`person`**：`{type:"person", items: [{userId, profileImgUrl?, firstName?, lastName?}]}` ⇒ ★ **人员值内嵌 4 字段快照**（不只是用户 id）⇒ 改名/换头像后旧单元格仍是旧快照；且 `allowMultiple` **默认 false**（多人员是显式开关）。
- **`linkToBlock`**（★ 反直觉）：保存时 `items.map(({name, url}) => ({name, url}))` ⇒ **存的是 `{name, url}`，不是 blockId** ⇒ 类型名叫"链接到块"但**落库形态是名字 + 链接**（改名/移动后不是活引用）。选择器是带搜索框的弹层（`initialSearchKeyword: ""`、`showInlineSearchField: true`、`blocksRef` = `docStore.blocks` 全量）。
- **`select` / `multiSelect`**：选项对象形状 **`{id, value, themeString}`**（★ 回答 §一之七 遗留：**选项不止 `value`，还带 `id` 与 `themeString` ⇒ 选项可配色，与主题同一编码通路**）；`origSchema.config.options` 保留**完整原始选项数组**；`typingBuffer`（打字即过滤）；`overrideOffset` / `overrideSkidding`（弹层定位覆写）；**`multiSelect` 有 `onValueChange` ⇒ 支持"边选边提交"**，否则只在保存时提交 ⇒ 多选两种提交模式并存。
- **`date`**：`propMeta.origSchema = {type: DATE, config: {}}` 且 **`showApplyButton: true`** ⇒ ★ 与动态采到的 V38「取消 / 应用」双按钮**互相印证**（静态↔动态闭环）。

### 5. `checkbox` 开关的精确视觉常量（可直接对齐 `tokens.md`）

```
高 = 24px    宽 = 39px    border-radius = 高/2 = 12px    transition = 0.3s
on  背景 = var(--accent-500)                                  ← 跟随强调色
off 背景 = elevateGrey(theme.background(), isDarkMode, 3)      ← ★ 不是写死灰，而是在当前背景上做 3 级灰阶提升
滑块方向 = isOnRightSide（开启靠右）
```
⇒ **关闭态颜色随主题背景与暗色模式计算** ⇒ 本地写死灰色在暗色下会偏亮（对照 §一之十一 的 `GE = "#e6e6e6"`：那是别处用的常量）。

### 6. ★ 浮层栈按**名字**注册，且集合已是 v2

每个弹层第一行都调 `hook("<名字>", onClose, {isDisabled: !open})`，取值：
`collection-v2-date-editor` / `collection-v2-select-editor` / `collection-v2-multiselect-editor` / `collection-v2-person-editor`
⇒ ① ★ **命名带 `v2`** ⇒ 集合模块重做过一次（与 `plans.md` §五之二 C 的 `upgrade.team.v2.*` 同一现象：**官方在关键子系统上并行留 v2 痕迹**）；② **弹层注册名是字符串常量** ⇒ 存在一个**全局浮层栈 / Esc 路由**，按名字决定"谁响应关闭"，`isDisabled` 控制是否参与 ⇒ 本地做多层弹层时应照抄"具名浮层栈"，而不是各自 `addEventListener('keydown')`。

## 仍未采到（模型面·第 36 批遗留）

- ~~`w1e(type, props)` 的按类型分支表~~ **第 39 批结案（§一之十一 1–3）**：固定 8 键 + `model` 三分支（媒体四型 / `url` / `code`）、7 处字段改名对照、封面主色是常量 `#f2f2f2` 而媒体主色是算出来的、**同一容器内 date-like 有三套解析器**。
- ~~`S1e`（`pluginData` 的通用 schema）与 `DU`/`_U`（表格解析器）的内部字段；表格 `tableData` 的单元格模型~~ **第 39 批结案**：`S1e` 见 §一之十一 4（主题是 `pluginName` 白名单插件）、`_U`/`VLe` 见 §一之十二（三张平行数组 + cell 持 `blockId`）。~~仍未展开：`$Le`(行)、`NLe`(表 style)、`ULe`(列 metadata)~~ **第 46 批结案（§一之十六）**；`DU` 仍只见到 `logError` 一个成员（留在未采到）。
- `ZMe` / `VMe` / `WMe` 三个专用谓词的内部结构（§一之七 遗留）。
- 背景 `background` 除 `solid` 之外的分支（图片/渐变？）。
- `pageStyleProps`（服务端字典形态）与 `pageStyle`（旧形态）的**双读优先级**已确认（前者优先、`??` 回退），但**写出时写哪个**未查。（§一之八 4 的工厂显示新建块**只写 `pageStyle` 与一个单键 `pageStyleProps.fontName`** ⇒ 两容器**分工**而非冗余，但未逐键对过。）
- ~~`uT` / `DC`（集合的 schema 存在哪一层）~~ **第 39 批结案（§一之十 2）**：`objectList` 持 `{schema, views[]}`、`object` 持 `{properties, schemas, themeString}`。
- ~~`SMe` 适配器本体~~ **第 39 批结案（§一之十 1）**：只把 `blocks` 改名成 `subblocks`，其余字段名与 wire 一致 ⇒ §一之九 的前提警告解除。

## 仍未采到（模型面·第 41 批）

- `$Me` 的**调用点**（本批给出"形状不匹配 ⇒ 它不是单元格写入校验器"的强证据，但没定位它到底管什么）。
- ~~`media` / `relation` / `number` 三类的录入通路~~ **已结案（§一之十四）**：relation 有独立 `RelationEditor`、number 有独立 `NumberEditor`；`media` 仍无 chunk（转入 §一之十四 未采到）。
- ~~四兄弟共同委托的基础输入组件内部：提交/失焦/校验时机~~ **已结案（§一之十四 1）**：`SimpleTextInputEditor` 就是那个组件，trim→null、Enter+stopPropagation、blur 带 `document.contains` 守卫、`typingBuffer` 上升沿灌值。
- 具名浮层栈的实现本体：**本批只拿到调用形态** `x(name, onClose, {isDisabled})`（§一之十四 3），栈序与 Esc 路由规则仍未解。
- `elevateGrey(bg, isDark, 3)` 的公式常量。

## 一之十四、集合输入层：基础输入组件 + number 双向换算 + relation 值形态（2026-09-27 11:19 结案，`js/SimpleTextInputEditor`（2.4 KB）+ `js/NumberEditor`（3.4 KB）+ `js/RelationEditor`（2.6 KB）整读；★ 结掉 §一之十三 遗留的「media/relation/number 录入通路」与「四兄弟共同委托的基础输入组件」两条）

### 1. `SimpleTextInputEditor` 就是四兄弟共同委托的那一个基础输入组件

props：`{open, onClose, anchorEl, value, onSave, typingBuffer, placeholder, propertyType, inputMode, overrideOffset, overrideSkidding, overrideWidth, overridePlacement}`，其中 `propertyType ?? TEXT`、`inputMode ?? "text"`。

- ★ **`typingBuffer` 是"外部持有的未提交草稿"这一层**：本地初值 `typingBuffer !== undefined ? typingBuffer : value ?? ""`；且灌值**只在 `open` 的上升沿发生一次**（一个布尔 ref 守卫，`open` 变 false 时复位）⇒ **编辑中途外部 `value` 变化不会覆盖正在输入的内容**。
- ★ **打开即 focus，并把光标移到文本末尾**（`focus()` 后 `setSelectionRange(value.length, value.length)`）。
- ★ **提交前三重归一**：`const r = text.trim(); onSave(r || null)` ⇒ 空串与**纯空格**都写成 `null` ⇒ §一之十三 那条"清空一律 null"的**实现位置就在这一层**，不在各类型编辑器里。
- ★ **Enter 提交并阻断冒泡**：`key === "Enter" && !shiftKey` → `preventDefault()` + **`stopPropagation()`** + save ⇒ Shift+Enter 不提交；单行输入也显式排除 shift，说明**Enter 会冒泡到块级处理**，必须在输入层截住。
- ★ **blur 提交带"元素还在文档里"守卫**：`ref.current && document.contains(ref.current) && save()` ⇒ 弹层已卸载时不再写库（防"卸载触发的 blur 再提交一次"）。
- DOM 形态：`<div className={styles.inputWrapper}><Input type="text" inputMode={…} autoComplete="off" /></div>` ⇒ **`type` 恒为 `text`，只用 `inputMode` 切键盘**（印证 §一之十三 1）。
- 弹层几何（四个 `override*` 入参 ⇒ **同一组件被非集合场景复用**，那里锚点几何不同）：
  - `offset = overrideOffset ?? getPlacementOffset(propertyType) − 1.5` ⇒ ★ **纵向偏移是按字段类型查表**，再统一减 1.5；
  - `skidding = overrideSkidding ?? −14`（**横向偏移固定 −14**）；
  - `width = overrideWidth ?? (anchorEl ? anchorEl.offsetWidth + 2 × EDITOR_OVERHANG : "anchor")` ⇒ ★ **弹层宽 = 单元格宽 + 2×溢出常量**，无锚点时退化为字符串 `"anchor"`（交给弹层库跟随锚点）。

### 2. `NumberEditor`：percent 是「存小数 / 显百分」的双向换算，且解析失败静默 null

- `isPercent = !!(config && "format" in config && config.format === "percent")` ⇒ ★ 用 **`"format" in config`** 做判别而不是判值。
- **显示方向**：`v == null ? "" : String(isPercent ? parseFloat((v * 100).toPrecision(10)) : v)` ⇒ ★ **`toPrecision(10)` 是浮点尾差修正**（`0.07 * 100` = `7.000000000000001` → `"7"`）。
- **输入方向**（一个纯函数 `parse(text)`）：
  1. `if (!text.trim()) return null`；
  2. `text.replace(/[,\s]/g, "").replace(/[%$]/g, "")` ⇒ ★ **千分位逗号、空格、百分号、美元符号一律先剥**（`1,234.50` / `$12` / `12%` 都能直接输）；
  3. percent 分支原文是 `K === "percent" && !t.includes("%") || K === "percent" && t.includes("%") && (F = F.replace(/%/g, ""))` —— **没有括号**，按 `A || B && C` 优先级求值，净效果＝「含 `%` 时才去掉 `%`」⇒ **带百分号与不带百分号两种写法都被接受**（读作官方代码风格缺陷，语义正确，别照抄写法）；
  4. `parseFloat`；`isNaN ⇒ null` ⇒ ★ **解析失败静默写 null，不报错、不弹提示、不保留旧值**；
  5. percent ⇒ `z / 100` **回存小数**。
- 保存：`onSave(parse(text))`（**不再额外 `|| null`**，因为 parse 已保证 null）。
- ★ **focus 行为与基础组件分叉**：`typingBuffer === undefined ? input.select() : setSelectionRange(len, len)` ⇒ **无草稿时打开即全选**（便于直接覆盖），**有草稿时续写光标在末尾**。⇒ 与 `SimpleTextInputEditor` 恒"移到末尾"**不一致**，是官方两族输入组件的真实差异（复刻时要么统一、要么显式记录差异来源）。
- 弹层几何与 §1 完全同构（同一组 `getPlacementOffset − 1.5 / −14 / offsetWidth + 2×EDITOR_OVERHANG`、同一对类名 `inputWrapper` / `inputEditor`）⇒ **一套几何常量服务所有输入弹层**。

### 3. `RelationEditor`：关联字段值形态与「注册但不渲染」

- `allowMultiple ?? false`（与 `person` 同默认）。
- ★ **值 = `{type: "relation", objectListId, items}`**，而 `objectListId` 取自 `property.config.objectListId` ⇒ **目标集合 id 存在字段 config 里，不在值里**（值里那份是冗余快照）。
- ★ **空态再次收敛**：`!value || !items || items.length === 0 ⇒ onSave(null)`。
- `propMeta = {id, name, theme: undefined, origSchema: {id, name, type: RELATION, config}}` ⇒ ★ **relation 没有配色位**（`theme` 显式 undefined）。
- ★ **浮层栈注册与渲染解耦**：先无条件调 `x("collection-v2-relation-editor", onClose, {isDisabled: !open})`，紧接着 `if (!open) return null` ⇒ **关闭时仍占这个名字但不产生 DOM**。⇒ 这次拿到的是**调用侧接口形态 `(name, onClose, {isDisabled})`**，实现本体仍在 index chunk（见下方未采到）。
- 委托的通用选择器收到的 anchor 是 **ref 对象** `{current: anchorEl}`（可为 `undefined`），不是裸 DOM 元素。
⇒ 至此集合族的具名弹层**五个名字齐了**：`collection-v2-{date, select, multiselect, person, relation}-editor`。

## 仍未采到（模型面·第 42 批）

- `media` 类（图片/文件）单元格的录入通路：磁盘上**没有 `MediaEditor` chunk** ⇒ 疑走 `ImageEditorPopup`（另一族，6 KB），未证。
- 具名浮层栈 `x(name, onClose, {isDisabled})` 的**实现本体**（栈序、Esc 如何路由到栈顶、`isDisabled` 是否等于出栈）。
- `getPlacementOffset(propertyType)` 的**表体**（每个字段类型的实际偏移数值）。
- `EDITOR_OVERHANG` 的具体数值（常量定义在 index chunk，本批未取）。
- `NumberEditor` 的 Enter/blur 分支是否与基础组件逐条相同（本批读到解析函数为止，后半段未展开）。

## 一之十五、枚举区与类型谓词：样式面板的权威词表 + 线格式的两套布尔编码 + Mermaid 的真实身份（2026-09-27 11:48 结案，`index-DiTmKH3z.js` @110415 / @137400–@140400 / @150498；★ 结掉 §一之七 / §一之八 / §一之十一 的「`Xa`/`Pm`/`ys` 三个枚举体未取到」与 `iMe` 主色算法两条遗留）

这一片是**连续的枚举声明区**（TS 枚举编译形态 `(t=>(t.X="…",t))(T||{})`，所以此前按 `Xa={…}` 匹配必然失败）。⇒ **教训：minified 枚举的搜索形态必须先确认"编译产物写法"，不能按源码写法猜正则。**

### 1. 枚举全集（值即线上字符串，权威）

| 枚举（minified 名） | 值 | 用途（置信度） |
|---|---|---|
`Xe` | `text / image / video / url / file / drawing / code / line / pageSeparator / table / object / objectList / whiteboard` | ★ **块类型枚举全集 13 值**（高：与 §一之八 的 `type` 字段逐项吻合；注意 `RecordObject` 的**值是 `object`**、`ObjectList` 是 `objectList`） |
`io` | `automatic / light / dark` | ★ **外观三档权威枚举**（高：localStorage 键 `forcedDarkOrLightMode` 的取值域由此确定） |
`Jt` | `system / system-serif / system-mono / system-rounded` | ★ **字体存储值四档**（高：`pageStyleProps.fontName:"system"` 的合法域） |
`h5` | `regular / serif / rounded / mono` | ★ **字体 UI 值四档**，与 `Jt` 一一对应（高：**UI 档名 ≠ 存储值**，映射为 regular↔system、serif↔system-serif、rounded↔system-rounded、mono↔system-mono） |
`$t` | `none / extraLight / light / regular / strong / pageSeparator` | 线/分隔粗细六档（中：`QPe = Object.values($t)` 作白名单；`PageSeparator` 混在同一枚举里 ⇒ 疑"分隔符样式"与"边框强度"共用一档域） |
`Zy` | `default / icon / sticky / booklet / collage / emojiCloud / none` | ★ **封面/图片展示样式七档**（中：名称强烈指向封面样式；`emojiCloud` 是唯一意外的成员） |
`Xa` | `card.large / card.wide / card.small.right / card.subtle / card.small.small.right` | ★ **卡片主题样式五种 = `nMe` 白名单**（高：§一之十一 4 那个 `pluginType:"card"` 分支的 `pluginName` 合法值就是这五个 `card.*`） |
`Pm` | `dynamic / fix` | ★ **`paragraphSpacingType` 只有两档**（高：`oMe = Object.values(Pm)` 即 §一之八 5 的校验白名单 ⇒ "段落间距"设置的真身是**两档开关**而非数值） |
`ys` | `full / faded / unknown` | `sMe` 白名单（中：**含 `unknown` 哨兵** ⇒ 这是一个"三态 + 未知"型枚举，疑为**缩进/淡出**类外观档） |
`Zs` | `topToBottom / leftToRight / radial` | ★ **背景渐变方向三档**（高：两条线性 + 一条径向） |
`Fa` | `…/ scaleAspectFill / scaleAspectFit`（前段在窗口外） | 图片填充模式（中） |
`r1` | `auto / fullWidth` | ★ **图片/块宽度两档**（高：与 `pageWidthType` 呼应） |
`u7` / `Wu` | `small/regular` 与 `small/regular/large` | 两个尺寸枚举（低：仅取到值，未定位用途） |

⇒ **一整套白名单集合**：`GPe=Object.values(at)`（textStyle）、`KPe=…(Ho)`、`qPe=…(Nt)`、`QPe=…($t)`、`YPe=…(S9)`、`XPe=…(Xn)`、`JPe=…(Fa)`、`eMe=…(r1)`、`tMe=…(Jt)`、`nMe=…(Xa)`、`oMe=…(Pm)`、`sMe=…(ys)` ⇒ ★ **官方有 12 个"枚举白名单校验集"**，全部经下面这个同一函数消费。

### 2. `j3(value, whitelist, fallback)`：未知枚举**静默回退**，不报错

```js
const j3 = (t, e, n) => t != null && e.includes(t) ? t : n;
```

⇒ ★ **这就是 §一之八"逐字段降级"的实现**：线上读到不在白名单里的值 ⇒ 直接当 `null`/默认处理，**不抛错、不整块失败**。⇒ 复刻含义：**官方解析器对"未来版本写来的新枚举值"是容忍的**（向前兼容是设计出来的），本地若用 zod `enum` 严格校验会在遇到新值时整块解析失败。

### 3. ★ 线格式里**并存两套布尔编码**，且都是三态

```js
function aI(t) { return t === "1" ? true : t === "0" ? false : null; }      // "1" / "0"
function Yq(t) { return t === "true" ? true : t === "false" ? false : null; } // "true" / "false"
```

- ⇒ ★ **同一个块里两种编码混用**：`hasTransparency` 走 `aI`（"1"/"0"），而 `coverImageEnabled`、`titleEnabled` 走 `Yq`（"true"/"false"）。⇒ 解析必须**两种都认**，且**不能把"缺字段"当成 false** —— 两者都返回 `null` 表示"从没设过"（与 `tasks.md` §10.8 的"关掉 vs 从没配过"同一哲学）。

### 4. `cropMask` 是竖线分隔的四元组，且**全有或全无**

```js
function yLe(t) { return t != null ? [t.x, t.y, t.width, t.height].join("|") : undefined; }   // 序列化
function s1e(t) { if (t == null) return null;
  const e = t.split("|");
  const a = s1(e[0]), b = s1(e[1]), c = s1(e[2]), d = s1(e[3]);
  return a != null && b != null && c != null && d != null ? { x: a, y: b, width: c, height: d } : null; }
```

⇒ ★ **裁剪框存成 `"x|y|w|h"` 字符串**（不是对象、不是 JSON）⇒ 线格式最紧凑的几何编码；**任一分量非法 ⇒ 整块 mask 变 null**（不部分接受）。

### 5. `primaryColor` 是**整型存储**，读取时补 `#`

```js
function iMe(t) { const c = t.primaryColor; return c != null ? "#" + c.toString(16) : null; }
```

- ⇒ ★ **主色按整数存**（位打包的 RGB），显示层才转 hex。
- ⚠ **缺陷候选**：`toString(16)` **不补前导零** ⇒ 当 R 分量高位为 0 时（如 `0x00ff00`）会得到 `#ff00`（4 位 hex，语义变成别的颜色）。⇒ **这是"若 primaryColor 高位字节为 0 则 hex 短一位"的静态推断，未实测**，记为候选而非事实；但**本地复刻一定要 `padStart(6,"0")`**。

### 6. `w1e(type, fields)`：封面（cover）是**固定 11 字段**的对象

```js
{ enabled: Yq(e.coverImageEnabled), uri: e.coverImageValueKey, attribution: e.coverUnsplashAttribution,
  primaryColor: "#f2f2f2",                        // ★ 默认主色是浅灰常量
  aspectRatio: Rf(e.coverAspectRatio), imageWidth: Rf(e.coverImageWidth),
  hasTransparency: aI(e.coverHasTransparency),    // ★ 注意这里换成了 "1"/"0" 编码
  rawUrl: e.coverImageRawUrl, rawAspectRatio: Rf(e.coverImageRawAspectRatio),
  rawImageWidth: Rf(e.coverImageRawWidth), cropMask: s1e(e.coverImageCropMask) }
```

- ⇒ ★ **封面自带"原图"与"处理后"两套尺寸**（`aspectRatio/imageWidth` 与 `rawAspectRatio/rawImageWidth`）⇒ 官方能区分"用户裁过的尺寸"与"原始文件尺寸"。
- ⇒ ★ **`isTodoChecked` 在这条路径上被规约成 `0 / 1`**（`const o = e.isTodoChecked, n = o != null ? +o : 0`）⇒ **同一布尔值在不同层有第三种编码（数字）** ⇒ 合计**三处编码形态**（"1"/"0"、"true"/"false"、0/1）。
- ⇒ 之后是 `switch (type)` 的 `image|video|file|drawing` 分支，各给一套内容字段（`fileName, aspectRatio, isUploaded, rawUrl, isPreviewImageUploaded, url, mimeType, primaryColor, rawDataSize: ti(…), previewImageWidth` …）⇒ **附件类块的"序列化侧"字段集**（此前只采到过"模型侧"）。

### 7. 类型谓词族与 ★ **Mermaid 的真实身份**

```js
function LU(t) { return t?.type === "image" || t?.type === "file" || t?.type === "drawing" || t?.type === "video"; }  // 有封面的一类
function E1e(t) { return t.type === "file"; }
function PU(t)  { return t.type === "code"; }
function D1e(t) { return t != null && PU(t) && t.language === "mermaid"; }   // ★ Mermaid = code + language
function gr(t, e) { return t === e ? void 0 : (t ?? void 0); }               // ★ diff 最小化
```

- ★ **Mermaid 不是独立块类型**，而是 `type:"code"` 且 `language === "mermaid"` 的特例 ⇒ 插入面板里"Mermaid"是一项，但模型层它就是个代码块；⇒ 与 §一之八"code 与 whiteboard 存 `blob`"合起来看，**Mermaid 走的是代码块的存储通路**。
- ★ **`gr(t, e)` 是补丁最小化的实现**：新旧相等 ⇒ 返回 `void 0`（即"这个字段不进补丁"），否则 `t ?? void 0` ⇒ 与 §一之九"批量 PUT 与单条 PUT 的归一化差异"是同一条链上的上游。

## 仍未采到（模型面·第 45 批）

- ~~`Fa` 前段成员与 `S9`/`Xn`/`Nt`/`Ho` 四个白名单对应的枚举体~~ **第 47/49 批结案**：`Fa` 只有 2 值（前段猜测证伪）、`Ho={left,center,right,justify}`、`Nt`＝`listStyle` 五值、`S9`/`Xn` 两套尺寸枚举 —— 且**落点也定了（§一之十九 1）**：`S9` 用于 **`urlStyle`**、`Xn` 用于 **`layoutStyle`**。
- `s1(...)`（cropMask 的单分量解析器）是 `parseInt` 还是带容错的 `mLe`。
- `u7` / `Wu` 两个尺寸枚举的**归属**（标题尺寸？卡片尺寸？封面尺寸？）。
- `Zy`（七档展示样式）到底落在哪个字段（`pageStyle` 里没看到对应槽位 ⇒ 可能在 `pluginData` 或 `rawProperties`）。
- `ys = {full, faded, unknown}` 的**语义**（`unknown` 是哨兵还是真有一档"淡化"？）。
- ~~主色提取算法本体（`iMe` 只做整型→hex）~~ **读写两侧已闭环（第 56 批 §一之二十六 3）**：读 `IVe = ti(t.substr(1,6),16)`（**6 位**→整型）、写 `iMe = "#"+toString(16)`（**不补零** ⇒ G504 确认）⇒ **`primaryColor` 是独立的 6 位通道**，与 8 位 color 对无关。★ **从图片算主色的提取本体仍未取**。

## 一之十六、表格四个解析器的全集 + 「缺省即键缺失」的通用约定（2026-09-27 11:59 结案，`index-DiTmKH3z.js` @50280 / @113439 / @113530 / @113872 / @113991 / @114253；★ 结掉 §一之十二 挂了三批的「`$Le` 行 / `NLe` 表 style / `ULe` 列 metadata / `DU` 未展开」）

### 1. 五个解析器的完整字段（行、列、单元格、表 style、块 style）

```js
function FLe(t) { return isObj(t) && hasBool(t,"isHeaderRow") ? { isHeaderRow: t.isHeaderRow } : {}; }     // 行 metadata
function $Le(t, e) {                                        // 行
  if (!isObj(t)) { e.logError("Table row should be `object`"); return null; }
  if (!hasStr(t,"id"))  { e.logError("Table row should have `id`");      return null; }
  return hasProp(t,"metadata") ? { id: t.id, metadata: FLe(t.metadata) } : { id: t.id };
}
function ULe(t) {                                           // 列 metadata
  if (isObj(t) && hasStr(t,"width")) { const n = s1(t.width);
    return { width: Is(n, v => ({ percentage: v })) }; }    // ★ 列宽是 {percentage}
  return {};
}
function HLe(t, e) { …同构… }                                // 列：{id, metadata?}
function NLe(t) {                                           // 表 style，只有三字段
  let e, n, o;
  if (hasStr(t,"alternatingRowColor")) e = Is(t.alternatingRowColor, bU);   // ★ 主题色查表
  if (hasBool(t,"hasColumnsHeader"))   n = t.hasColumnsHeader;
  if (hasBool(t,"hasRowsHeader"))      o = t.hasRowsHeader;
  return { ...e==null?{}:{alternatingRowColor:e}, ...n==null?{}:{hasColumnsHeader:n}, ...o==null?{}:{hasRowsHeader:o} };
}
function ZLe(t, e) {                                        // 块/cell style，两字段
  const o = hasStr(t,"blockStyleModifiers") ? Is(t.blockStyleModifiers, _Le) : void 0;
  return { backgroundColor: hasStr(t,"backgroundColor") ? Is(t.backgroundColor, bU) : void 0,
           blockStyleModifiers: o };
}
function VLe(t, e) {                                        // 单元格：★ 逐字段各自可选
  const id   = hasStr(t,"id")       ? t.id       : void 0;
  const rowId= hasStr(t,"rowId")    ? t.rowId    : void 0;  // columnId / blockId 同构
  …
}
```

⇒ ★ **五个要点**：
1. **行对象只有 `{id, metadata?}`，没有高度字段** ⇒ §一之十二 猜测的"row 可能带 height"**证伪**。
2. **行 metadata 只有一个字段 `isHeaderRow`** ⇒ 标题行是**行级布尔标记**，同时表级还有 `hasRowsHeader` 开关 ⇒ ★ **两层并存**（表级开关 + 行级标记），本地只有一层（见 G509）。
3. ★ **列宽是 `{percentage: n}` 对象，不是 px**，且 `width` 在线格式里是**字符串**（先 `s1()` 转数值再包对象）⇒ 官方列宽模型是百分比 ⇒ **窗口变宽时列按比例重排**。
4. ★ **表 style 只有三字段**（`alternatingRowColor` / `hasColumnsHeader` / `hasRowsHeader`）⇒ **"标题行与标题列是两个独立开关"从文案证据升级为模型证据**（G091 结案）。
5. ~~★ `alternatingRowColor` 与 `backgroundColor` 都经 `bU` 查表解析 ⇒ 表格颜色存的是主题色 id~~ **【第 47 批更正】**`bU` **不是查表函数而是解码器**：颜色字段的值是**空格分隔的 hex 对** `#RRGGBBAA #RRGGBBAA`（只给一段则明暗同值），见 **§一之十七 1**。⇒ 教训：`Is(value, X)` 的第二参可以是任意 mapper（本批 `Is(x, v=>({percentage:v}))` 已证明），**不能据调用形态假定 `X` 是表**。

### 2. ★ 「缺省即键缺失」而不是「键值为 undefined」——两处独立实现

- `NLe` 用 `{...(e==null ? {} : {alternatingRowColor: e})}` ⇒ **字段没解析出来时，对象里根本没有这个键**。
- `ZLe` / `VLe` 用 `void 0` ⇒ **键在、值为 undefined**。
⇒ ★ **同一段代码里两种"缺省"表达并存** ⇒ 对本地复刻的直接含义：**判"有没有配过"必须用 `key in obj` 而不是 `obj[k] !== undefined`**（前者才与官方一致），否则 JSON 序列化一次（`undefined` 被丢弃）两种写法又等价了 ⇒ 这是个易被"看起来没问题"掩盖的坑。
- 支撑 helper：`Is = (t, e) => t == null ? void 0 : e(t)`（有值才映射）、`ki = (t, e) => t != null ? e[t] ?? null : null`（查表）、`gr(t,e)`（相等则 void 0，§一之十五 7）、`SR(t,{low,high})`（区间）。

### 3. 穷尽性检查抛的是 **AssertionError 子类**，且带静态判定器

```js
function He(t) { throw new n3("Unexpected object: " + t); }
class n3 extends Error { name = "AssertionError"; ERROR_TYPE = "AssertionError";
                         static isAssertionError(e) { return e instanceof n3 || e?.ERROR_TYPE === …; } }
```

⇒ ★ `Unexpected object: <值>` 是表格/枚举解析器在**穷尽分支不成立**时的固定文案（与 §一之八 的 `Kce` assert 工厂同族）；★ **`ERROR_TYPE` 字符串 + `static isAssertionError`** ⇒ 上层可**按错误类型捕获**，不依赖 `instanceof`（跨 chunk/跨 worker 场景下 `instanceof` 会失效 ⇒ 这就是它加 `ERROR_TYPE` 的原因，与 §十一"合并逻辑有两份实现"里 worker 侧同源）。

### 4. ★ 官方内部文案不一致的新一例（同类噪声要当成果交付）

- 行解析报错用 **"Table row should be \`object\`" / "Table row should have \`id\`"**（大写 T + *should*）；
- 列解析报错用 **"table column must be \`object\`" / "table column must have \`id\`"**（小写 t + *must*）；
- 单元格解析报错又是 **"table cell must be \`object\`"**（小写 + must）。
⇒ 与 `alert.*` 那批（三种失败前缀、key 名带空格）是同一现象：**官方的开发者面向日志没有统一命名规范** ⇒ 本地做日志对齐时**不要"顺手统一"**，否则与官方日志文本对不上，跨产品排障时失去可比性。

### 5. 新出现、此前完全没记过的字段：`blockStyleModifiers`

⇒ ★ **块样式上有一组"修饰符"**（经 `_Le` 映射），与 `backgroundColor` 并列成块 style 的两字段。⇒ **修饰符集合的枚举体 `_Le` 未取到**（列在未采到），但它证明：**官方的"块格式"= 背景色 + 一组修饰符**，而不是逐属性铺开。

## 仍未采到（模型面·第 46 批）

- ~~`bU`（主题色 id → 值的表）~~ **第 47 批结案**；★ **`_Le` 也已结案（第 48 批 §一之十八 1）**：`_Le(t) = t.split("|")` 后读四个单字母旗标 `b/i/s/c` + 五个前缀值项，字段名是 `blockStyleModifiers`（挂在单元格 `style` 上）。
- ~~`DU`（表格 parser 的上下文对象）~~ **第 48 批结案（§一之十八 2）**：`class DU { blockId, _errors[], errors(), logError(n) → "Error validating: <blockId>: <n>" }`，失败走 `{type:"success"|"failure"}` 判别式不抛错。
- `s1(...)`（列宽字符串 → 数值）到底是 `parseInt` 还是带容错的 `mLe`。
- `hasColumnsHeader` 与行级 `isHeaderRow` **同时存在时的优先级**（模型证据有了，行为仍需动态或渲染侧代码）。
- 列宽 `{percentage}` 之和是否必须为 100、超/欠时的归一化规则。
- `alternatingRowColor` 的**具体效果载体**（是 CSS `nth-child` 还是逐行 style）。

## 一之十七、★ 颜色的线格式是「空格分隔的 hex 对」+ `todoState` 三值状态机 + 枚举区剩余成员（2026-09-27 12:14 结案，`index-DiTmKH3z.js` @90017 / @90516 / @136829–@137300 / @627874 / @757356；★ 结掉 §一之十六 的 `bU`/`_Le` 遗留与 §一之十五 的 `Fa`/`S9`/`Xn`/`Nt`/`Ho` 四个枚举体，并**推翻本目录上一批对 `bU` 的解释**）

### 1. ★★ 颜色不是"主题色 id 查表"，而是**一个字符串里打包明暗两色 + 各自 alpha**

```js
function PRe(t) {                                    // 拆"hex 对"
  const e = t.trim().split(/\s+/).filter(Boolean);
  if (e.length === 1 && _R.test(e[0])) return [e[0], e[0]];                    // ★ 单值 ⇒ 明暗同值
  if (e.length === 2 && _R.test(e[0]) && _R.test(e[1])) return [e[0], e[1]];    // ★ 双值 ⇒ 明 / 暗
}                                                                   // 其它形状 ⇒ 隐式 undefined
function Nq(t) { const e = t.slice(1);                               // 去掉 `#`
  return [parseInt(e.slice(0,2),16), parseInt(e.slice(2,4),16),
          parseInt(e.slice(4,6),16), parseInt(e.slice(6,8),16)]; }   // ★ 固定切 8 位 = RGBA
const rO = 255;
function bU(t) {                                                    // ★ 解码器，不是查表
  const e = PRe(t); if (e == null) return;
  const [r,g,b,a] = Nq(e[0]), [R,G,B,A] = Nq(e[1]);
  return { light: `rgba(${r}, ${g}, ${b}, ${a/rO})`,
           dark:  `rgba(${R}, ${G}, ${B}, ${A/rO})` };
}
function Bce(t) { const e = bU(t); if (e == null) throw new Error(`Invalid hex color pair with opacity: ${t}`); return e; }
```

⇒ ★ **线格式形态**：`"#RRGGBBAA #RRGGBBAA"`（空格分隔，第一段浅色、第二段深色），**或只写一段表示明暗同值**。
⇒ ⇒ **一个颜色字段自带两套主题的取值** —— 官方"暗色下换色"不是靠 CSS 变量或 class，而是**值本身就成对**。⇒ 这解释了为什么 §一之十五 的 `#e6e6e6`、`#f2f2f2` 这类默认色可以直接内联在代码里。
⇒ ★ **`bU` 是解码函数**，不是 id→值的表；上一批（§一之十六 1 末条）"表格颜色存的是主题色 id，经 `bU` 查表解析"的表述**作废**，已就地更正。
⇒ ~~⚠ 缺陷候选（6 位 hex ⇒ alpha NaN）~~ **【第 50 批推翻】**`_R = /^#[0-9A-Fa-f]{8}$/` **强制 8 位** ⇒ 6 位进不去 `PRe`（`bU` 返回 undefined ⇒ `Bce` 主动抛 `Invalid hex color pair with opacity`），`Nq.slice(6,8)` 永远安全、`parseInt("")` 不可达 ⇒ 见 **§一之二十 0**，`gap.md` G520 一并作废。
⇒ 编码侧同族函数 `Oce` 用 `padStart(2,"0")` + `.toUpperCase()` ⇒ **官方编码侧是补零的**（与 §一之十五 5 的 `primaryColor.toString(16)` 短 hex 问题形成对照 ⇒ 那条缺陷候选的"正确写法"就在这里）。

### 2. ★ `todoState` 是**三值数字枚举**，且切换/聚合语义都不是"显然的那一种"

```js
tn = { Unchecked: 0, Checked: 1, Canceled: 2 }                       // ★ 数字编码，不是字符串

function cde(t) { switch (t) {                                        // 单击切换
    case tn.Unchecked: return tn.Checked;
    case tn.Checked:
    case tn.Canceled:  return tn.Unchecked; } }                       // ★ 取消态点一下回"未选"，不直接变完成

function dde(t) { for (const e of t) if (e === tn.Unchecked) return tn.Checked;
                  return tn.Unchecked; }                              // ★ 批量：只要有一个未选 ⇒ 整批设为已选

// 写侧（更新函数）
if (o.todoState !== e.todoState) {
  s = { ...o, todoState: e.todoState };
  if (e.todoState === tn.Checked || e.todoState === tn.Canceled)
      s.toDoCheckedDate = new Date();                                 // ★ 取消也写时间戳
} else s = { ...o, todoState: e.fallbackIfAlreadySet };               // ★ 另一条回退入参
// 埋点：仅 Checked 发 "todoCompleted"
```

- ★ **取消（Canceled）是一等状态**且**与完成共用时间戳字段 `toDoCheckedDate`** ⇒ 字段名与语义不符（官方内部噪声新一例）。
- ★ **批量勾选的聚合规则是"混合态 → 全选"**（不是常见的"混合 → 清空/取消"）。
- ★ **`fallbackIfAlreadySet`** 证明写侧有一条"目标已有值时用回退值"的通路（上下文未展开，列未采到）。
- ★ 还有一处 `todoState: t.todoState == null ? null : tn.Unchecked` ⇒ **疑"复制/新建时把已有态重置为未选"**（所在函数未展开，标为未证）。
- 视图侧回退：`this.props.block.todoState || tn.Unchecked`。

### 3. 枚举区剩余成员（§一之十五 遗留的四白名单一次补齐）

| 枚举 | 值 | 结案说明 |
|---|---|---|
`Ho` | `left / center / right / justify` | ★ **对齐四档，含两端对齐**（`KPe` 即其白名单） |
`Nt` | `none / bullet / numbered / todo / toggle` | ★★ **`listStyle` 权威五值 ⇒ "折叠块"在官方模型里是一种列表样式**（与 §一之八"`listStyle` 压过 `textStyle`"合起来：**任务列表、项目符号、编号、折叠全都是同一个字段的不同取值**） |
`x1e` | `none / single / double / strong` | ★ **线型四档**（此前完全没记；`strong` 不是 CSS 关键字 ⇒ 官方自定的粗线档） |
`S9` | `default / small / regular / card` | 尺寸族 A（`YPe`） |
`Xn` | `regular / small / card / embed` | 尺寸族 B（`XPe`，★ 多一档 `embed`） |
`Fa` | `scaleAspectFill / scaleAspectFit` | **结案：只有 2 值**（前段无更多成员 ⇒ 上一批"被窗口切掉"的猜测是错的，枚举本来就 2 个） |

⇒ ★ **`S9` 与 `Xn` 是两套"三档 + 一特殊档"的同构枚举**（`default/small/regular/card` vs `regular/small/card/embed`）⇒ 官方**图片/块的尺寸有两种独立档位域**（一个含 `default`、一个含 `embed`），与 §一之八"块线格式 20 字段"里的尺寸字段对应关系仍未证。

## 仍未采到（模型面·第 47 批）

- ~~`_R` 是否强制 8 位~~ **第 50 批结案**：`const _R = /^#[0-9A-Fa-f]{8}$/` ⇒ 强制 8 位，§一之十七 1 的 NaN 缺陷候选随之作废。
- ~~`_Le`（`blockStyleModifiers` 的映射器）~~ **第 48 批结案（§一之十八 1）**：`_Le = t => { const e = t.split("|"); return { isBold, isItalic, isStrike, isCode, font, highlightColor, textColor, align, format } }`。
- `lg()`（编码侧的分量→hex 辅助）与 `Oce` 的完整签名。
- `S9`/`Xn` 两套尺寸枚举**分别落在哪个字段**。
- `fallbackIfAlreadySet` 的调用场景（哪个动作会带它）。
- `todoState` 三值在**对外 MCP/API 契约**里怎么表达（§一之九 的 task 契约只见过 `state`，未与 `tn` 对上）。

## 一之十八、`blockStyleModifiers` 的旗标词表 + `DU` 错误收集器 + 字体族穷尽映射（2026-09-27 12:32 结案，`index-DiTmKH3z.js` @113991 附近 + `function _Le` / `class DU` / `jLe`/`RLe`/`WE`/`i1e`；★ 结掉 §一之十六/§一之十七 挂着的 `_Le` 与 `DU` 两条遗留）

### 1. `blockStyleModifiers` 是**竖线分隔的标记串**（与 `cropMask` 同款编码）

```js
const l1e = "|";
function _Le(t) {
  const e = t.split(l1e);
  return {
    isBold:   wLe(e),      // t.includes("b")
    isItalic: SLe(e),      // t.includes("i")
    isStrike: kLe(e),      // t.includes("s")
    isCode:   vLe(e),      // t.includes("c")
    font:          ILe(e),   // find(startsWith("font")) → WE(e, RLe)
    highlightColor:TLe(e), textColor: ALe(e), align: ELe(e), format: DLe(e),
  };
}
const i1e = t => e => { const n = e.find(o => o.startsWith(t)); return n… };   // ★ 前缀查找器工厂
```

- ★ **四个单字母旗标 `b / i / s / c`** ⇒ 行内加粗/斜体/删除线/行内码**在官方线格式里是样式字段里的标记，不是文本 mark**。
- ★ **其余五项是"前缀值项"**（`font*`、高亮、文本色、对齐、格式各按 `startsWith` 找一段再解析）⇒ `i1e` 是**工厂式前缀查找器**（对各字段复用同一逻辑）。
- ★ **唯一调用方在 `VLe`（单元格解析器）**：`r = n.prop(t,"style") && ZLe(t.style) || void 0` ⇒ ★ **字段名 `blockStyleModifiers` 挂在单元格 `style` 上**（命名与承载不符 —— 官方内部噪声新一例）；**块级是否有同字段本批未证**（列未采到，不许据此断言块有）。

### 2. `DU` 是显式错误收集器，也是三条日志文案的宿主

```js
class DU {
  constructor(e) {
    this.blockId = e; this._errors = [];
    this.errors    = () => [...this._errors];
    this.logError  = n => this._errors.push(`Error validating: ${this.blockId}: ${n}`);
  }
}
// 消费侧：const P = new DU(t.id), M = _U(P, t.pluginData);
//         M.type === "success" && (result = { type:"table", data: M.tableData })
```

- ★ **解析失败不抛错**，返回 **`{type:"success" | "failure"}` 判别式 + 错误列表** ⇒ 与 §一之十二 的"逐字段降级"合起来看：**整个表格解析是一条"尽量读出 + 记账"的通路**。
- ★ **完整日志形态** = `Error validating: <blockId>: <文案>` ⇒ §一之十六 4 的三条不一致文案（`Table row should …` / `table column must …` / `table cell must …`）到此有了宿主，可直接写出三行真实日志样例。

### 3. 字体族 → CSS 关键字映射是**穷尽 switch + 抛错兜底**

```js
function jLe(t) { switch (t) {
    case Jt.System:       return "sans-serif";
    case Jt.SystemSerif:  return "serif";
    case Jt.SystemRounded:return "rounded";
    case Jt.SystemMono:   return "mono";
    default: He(t); } }          // ★ 未知字体族 ⇒ throw new AssertionError("Unexpected object: <值>")
const ILe = t => { const e = t.find(n => n.startsWith("font")); return e == null ? null : WE(e, RLe); };
```

- ★ `RLe` 是**第二步**（`font*` 项拆出内部值后再转 CSS），即**两步映射**：串段 `fontXxx` → 内部值（`RLe` switch）→ CSS 关键字（`jLe` switch）。
- ★ **四值之外直接抛 AssertionError** ⇒ 官方对"字体枚举被扩了"的态度是**立即失败**（与 `j3` 的"未知枚举静默回退"**相反**）⇒ ★ **官方内部对"读值"宽容、对"渲染映射"严格**，两套策略并存 —— 这是个反直觉且重要的复刻口径。

## 仍未采到（模型面·第 48 批）

- **块级是否也有 `blockStyleModifiers`**（唯一已证的调用方是单元格 `VLe`；字段名暗示块有，但没有第二个调用方证据）。
- `TLe/ALe/ELe/DLe`（高亮色/文本色/对齐/格式四个前缀项）各自的 mapper —— 高亮与文本色**推测**走 `bU`（hex 对），但未抓到定义。
- `WE(e, RLe)` 的实现（串段 → 内部值的抽取逻辑）。
- `wLe/SLe/kLe/vLe` 之外**还有没有别的单字母旗标**（如下划线）——`_Le` 返回 9 项已全读，但旗标词表只覆盖 4 个（下划线疑在 format 或缺项）。
- `l1e="|"` 这条链上的**写侧**（序列化时谁把 `{isBold…}` 压回 `"b|i"` 串）。

## 一之十九、★ 官方块样式解析器全量（字段白名单 + 默认值 + run 模型）（2026-09-27 12:36 结案，`index-DiTmKH3z.js` @147474 整窗读出；顺带结掉 §一之十五 的 `S9`/`Xn` 落点问题）

`@147474` 是一个"把线格式原始对象读成块样式对象"的解析器（所有 `j3(t?.字段, 白名单, 默认值)` 调用集中在一处）⇒ **这是本批最密集的一处发现：一次读出 10 个字段的白名单与默认值**。

### 1. 字段 → 白名单 → 默认值全表（权威）

| 原始字段 | 白名单 | 默认值 | 备注 |
|---|---|---|---|
| `textStyle` | `GPe` = `Object.values(at)`（九值，§一之三） | **`"body"`** | ★ 默认档是 body，不是 title |
| `alignmentStyle` | `KPe` = `Ho` 四档（left/center/right/justify） | **`null`** | ★ **null = 继承/未设**（不是 none） |
| `listStyle` | `qPe` = `Nt` 五值（none/bullet/numbered/todo/toggle） | `"none"` | §一之十七 3 的消费侧 |
| `lineStyle` | `QPe` = `$t` 六值（none/extraLight/light/regular/strong/pageSeparator） | `"none"` | 粗细档 |
| `lineThemeStyle` | **不走 `j3`**，走 `T1e(…) ?? null` | `null` | ★ **两个"线"字段、两种解析策略**（下 §3） |
| `urlStyle` | `YPe` = `S9`（default/small/regular/card） | `"default"` | ★ **结案 `S9` 落点＝`urlStyle`** |
| `layoutStyle` | `XPe` = `Xn`（regular/small/card/embed） | `"regular"` | ★ **结案 `Xn` 落点＝`layoutStyle`** |
| `fontStyle` | `tMe` = `Jt` 四档（system/…-mono） | **`null`** | null = 跟随文档字体 |
| `imageFillStyle` | `JPe` = `Fa`（scaleAspectFill/scaleAspectFit） | `"scaleAspectFill"` | 填充默认是**裁满** |
| `imageSizeStyle` | `eMe` = `r1`（auto/fullWidth） | `"auto"` | |
| `indentationLevel` | — | **`?? 0`** | ★ 官方块有**整数缩进层级**（`--indent-w` 的存储来源，一级 = 28px 已知） |
| `userDefinedListNumber` | — | **`?? null`** | ★ **编号列表可手动指定起始编号**（null = 自动） |
| `decorations` | — | **`?? {}`** | ★ 装饰对象（形状未知） |
| `paragraphStyle.spacingBefore` / `.spacingAfter` | — | 各 `?? null` | ★ **段前/段后距**两字段 |
| `themeInstanceProps` | — | `?? null` | ★ 主题实例属性 |

⇒ 默认值的两种姿态并存：**枚举字段给具体默认值**（`"body"`/`"none"`/`"auto"`…），**"可继承"字段给 `null`**（alignment/font/lineTheme/spacing）⇒ ★ **null 语义是"未设、跟随文档"，不等于 "none"**（这两个值必须区分，否则"清除对齐"与"从没设过对齐"无法区分 —— 与 G501 三态布尔同一哲学）。

### 2. ★ 行内属性是 **run 模型**（不是 mark、也不是 text span）

```js
const w = t._runAttributes;
h = w?.map(I => {
  let T; if (I.highlightColor != null) T = kc(I.highlightColor);
  return { ...I, start: I.range[0], length: I.range[1], highlightColor: T };   // ★ range → start/length
});
```

- ⇒ **模型层的行内格式 = "带范围的 run 数组"**：每项有 `range: [起, 止]`，读入时**展开成 `start` / `length`**，`highlightColor` 另经 `kc()` 转换。
- ⇒ ★ **三套行内表示并存**（这是本目录此前不知道的）：**run 数组**（跨行范围）、**`blockStyleModifiers` 标记串**（§一之十八，整块级的 b/i/s/c）、**文本 mark**（渲染层）⇒ 三种不是重复，是**不同粒度**（跨行强调 vs 块级强调 vs 渲染）。
- ⚠ 本地 `grep -rn "runAttributes\|highlightColor" src` ⇒ **0 命中** ⇒ **"跨行/带范围的高亮与颜色"这一整个概念本地没有**。

### 3. ★ `color` 的归一：旧字段名被读入时改写

```js
const S = t.color;
if (S != null) { if (S === "secondarycolor") m = "themeColor"; else m = Yt(S) || void 0; }
```

- ⇒ 字面量 **`"secondarycolor"` 是历史字段名，读入时被归一成 `"themeColor"`** ⇒ **官方存在过一次字段重命名**，旧数据靠这条分支继续可用（向前兼容的又一例，与 `j3` 同族）。
- ⇒ 其余值经 `Yt(S)` 解析（失败 ⇒ `undefined`）。

### 4. `lineStyle` vs `lineThemeStyle`：两个"线"字段、两种策略

- `lineStyle` 走 `j3(…, $t白名单, "none")` ⇒ **未知值静默回退**；
- `lineThemeStyle` 走 `T1e(…) ?? null` ⇒ **完全不同的函数，未知值的处置方式未取到**（列未采到）。
- ⇒ 这解释了 §一之八 记的 `pageStyle.lineThemeStyle` 与本表的 `lineStyle` 是**两个独立槽位**（一个主题线样式、一个线粗细档）。

## 仍未采到（模型面·第 49 批）

- ~~`T1e()` 的实现与未知值处置~~ **第 50 批结案（§一之二十 3）**：`lineThemeStyle` 是 `{type, patternSource:{type, color}}` 对象，`T1e` 只对 `type==="washi"` 就地规范化（大写化→`Yt` 转明暗对写回），**未知 type 原样保留**（既不回退也不抛）。
- ~~`decorations` 对象的形状~~ **第 51 批结案（§一之二十一 4）**：**`{focus?, block?}` 两成员**，写条件 `focus != null || block != null`（更新恒写、新建仅有值才写）；正好对应本地 `focus-style.tsx` / `shaded-style.tsx` 的语义。★ 仍开：`themeInstanceProps` 的成员、`focus`/`block` 各自的形状。
- ~~`kc()` 与 `Yt(S)` 的内部~~ **第 50 批结案（§一之二十 1–2）**：`Yt(str)` → `{light,dark}`（单值复制、畸形 `null` 不抛）；`kc(t, degree=90)` 解析 `"色;色;…g"` 为 `{type:"linear", degree:90, colorStops}` ⇒ **高亮是 90° 渐变**。
- ~~`_runAttributes` 的写侧~~ **第 51 批结案（§一之二十一 4）**：写侧 `{...z, highlightColor: MC(…), range: [start, length], start: void 0, length: void 0}` ⇒ 读 `range→start/length`、写 `start/length→range`，`MC` 是 `kc` 的逆。★ 仍开：run 的 `type`/字段集、`MC()`/`b0e` 内部。
- `runAttributes` 与 `blockStyleModifiers` 的**分工边界**（何时用 run、何时用块级标记）。
- `userDefinedListNumber` 的 UI 入口（哪个动作允许手动指定编号）。

## 一之二十、★ 颜色子系统全貌：三形态取值 + 渐变高亮 + `lineThemeStyle` 真身（2026-09-27 12:43 结案，`index-DiTmKH3z.js` @11604 / @58728 / @89677 / @97228 / @97312 / @146589；★ **推翻 §一之十七 的一条缺陷候选**，并结掉 §一之十九/§一之十八 挂着的 `Yt`/`kc`/`T1e` 三条遗留）

### 0. ★★ **被推翻的旧结论：「6 位 hex 会让 alpha 变 NaN」是错的**

`_R`（hex 合法性谓词）的定义到手：

```js
const _R = /^#[0-9A-Fa-f]{8}$/;          // ★ 正则明确强制 8 位
```

⇒ ⇒ **6 位 hex 根本进不去 `PRe`**：`PRe` 返回 `undefined` ⇒ `bU` 返回 `undefined` ⇒ `Bce(t)` **主动抛 `Invalid hex color pair with opacity: <原值>`**。`Nq` 的 `slice(6,8)` **永远拿得到 8 位**，`parseInt("")` 那条路径不可达。
⇒ **§一之十七 1 的 ⚠「缺陷候选（6 位 ⇒ alpha NaN）」与 `gap.md` G520 一并作废**（G520 已就地改写为"结论被推翻 + 保留读写位数约定"）。⇒ 教训：**静态推断的"缺陷候选"必须在拿到谓词/入口校验后再回判一次**，否则会把"设计好的守卫"写成"漏洞"。

### 1. ★ 颜色值的三形态与读写闭环

```js
function Wn(t, e)  { return { light: t, dark: e }; }                    // 规范形：明暗对
function Xt(t, e)  { return e ? t.dark : t.light; }                     // ★ 按"是否暗色"取一个
function ig(t)     { return (t?.hasOwnProperty("light") && t?.hasOwnProperty("dark")) ?? false; }  // 判明暗对
function I2(t)     { return t?.hasOwnProperty("colorStops") ?? false; }  // 判渐变
function Ad(t)     { return `${t.light} ${t.dark}`; }                   // ★ 序列化（空格拼接）
function Yt(t) { const e=(t||"").split(" ").filter(n=>n.length>0);
  return e.length===2 ? Wn(e[0],e[1]) : e.length===1 ? Wn(e[0],e[0]) : null; }   // ★ 畸形 ⇒ null（不抛）
```

⇒ ★ **读写闭环全通**：写 `Ad(pair)` → 空格字符串，读 `Yt(str)` → `{light,dark}`（单值复制、空/畸形 → `null` 不抛），渲染 `Xt(pair, isDark)` → 单值。与 §一之十七 1 的 `PRe`/`Nq`/`bU` 合起来是**完整的一对函数**。
⇒ ★ **畸形值返回 `null`（不是 undefined、不抛）** ⇒ 与 `j3` 同一哲学：颜色解析**从不失败**，失败的只有 `Bce` 这个"必须成功"的包装。
⇒ **三形态**：① 明暗对（`ig`）② 渐变（`I2`，带 `colorStops`）③ 普通字符串（两者都不是 ⇒ 走 `Wn(s,s)` 复制）。

### 2. ★★ **高亮是渐变**：`kc(t, degree = 90)`

```js
function kc(t, e = 90) {
  if (t != null && t.endsWith("g")) {                 // ★ 末尾的 `g` 是渐变标记
    const n = t.split(";").filter(o => o.length>0 && o!=="g");    // ★ 分号分隔色标
    if (n.length === 1) return Yt(n[0]);               // 单色标 ⇒ 退化普通色
    if (n.length > 1) {
      const stops = bt(n.map((s,i) => { const l = Yt(s);
        return l != null ? { color: l, percent100: 0 + i*(100/(n.length-1)) } : null; }));
      return { type: "linear", degree: e, colorStops: stops };    // ★ 度数默认 90（90°＝竖直向下）
    }
    return null;                                        // 全脏 ⇒ null
  }
  return Yt(t);                                         // 非渐变 ⇒ 普通明暗对
}
function bt(t) { return t.filter(e => e !=null); }            // 忽略脏项
```

- ⇒ ★ **荧光笔/高亮是 90° 线性渐变**，线格式 `"<色1>;<色2>;<色3>g"`（**分号分隔、`g` 结尾**），**色标百分比按索引均分** `i × 100/(n−1)`（3 色标 ⇒ 0/50/100）。
- ⇒ **每个色标自己又是明暗对**（`Yt` 内嵌）⇒ **一个高亮值能同时携带"明色渐变"与"暗色渐变"两套**。
- ⇒ 脏色标被 `bt` 过滤、**全部脏则整个渐变为 `null`**（部分降级）。
- ⇒ `runAttributes.highlightColor` 经 `kc()` 转换（§一之十九 2）⇒ **行内高亮就是这套渐变模型**。
- 本地对照：`grep -rn "colorStops" src` ⇒ **0**、`linear-gradient`（editor/lib）⇒ **0** ⇒ **本地高亮只有单色 mark，官方是渐变**。

### 3. `lineThemeStyle` 的真身：**一个对象**（不是枚举），解析只做"就地规范化"

```js
function T1e(t) {
  if (t?.type === "washi"
   && ((t.patternSource?.type === "solidColor" && typeof t.patternSource.color === "string")
    || (t.patternSource?.type === "pattern"     && typeof t.patternSource.color === "string")))
    t.patternSource.color = Yt(m0(t.patternSource.color));   // ★ 就地改写：大写化 + 转明暗对
  return t;                                                   // ★ 原样返回（pass-through）
}
function m0(t) { return C9(t) ? t.toUpperCase() : null; }      // 校验 + 大写（规范 hex 大小写）
```

- ⇒ ★ **`lineThemeStyle` 是 `{type, patternSource:{type, color}}` 对象**，`type` 至少有 `"washi"`（**和纸胶带** —— 与设计 token 采集时记的「分隔符样式：线 / 和纸胶带 / 涂鸦」完全对上）。
- ⇒ **它不是白名单字段，是"嵌套对象就地规范化"的 pass-through**：未知 `type` **原样保留**（不是回退、不是抛错）⇒ 这就是 §一之十九 里"另一条通路"的解释，**已结案**：`j3`（白名单回退）与 `T1e`（就地规范化）两种策略，**取决于字段是"枚举"还是"结构化对象"**。
- ⇒ 与 §一之十七 的 `secondarycolor → themeColor` 归一、`pageStyle` 默认 `null` 全部同一套兼容哲学：**读入时把旧形状整理成新形状，绝不丢弃**。

### 4. 顺带读到的三个小工具（与 §一之十六 的 `Is`/`ki`/`gr` 同族）

- `oc() = {string:(t,e)=>jb(t,e) && typeof t[e]==="string", number:…, boolean:…}`，`jb(t,e)= e in t` ⇒ ★ **验证器工厂，`in` 判字段存在（含原型链）** —— 这就是 `$Le`/`NLe` 那批 `n.string(t,"id")` 谓词的来源。
- `kR(t, map)` ⇒ **任一项映射成 `null` 就整体返回 `null`**（map-or-bail，与 `Is` 的"有值才映射"相反：这是"整批要么全成要么全弃"）。
- `U1(a, b)` = 递归深度比较（含嵌套数组）；`Gn`/`_u` = 过滤 boolean / 过滤 non-null-non-false；`es()` 返回共享常量空数组 `ZAe`（**避免分配**）。

## 仍未采到（模型面·第 50 批）

- `Wn` 之外的颜色规范形有没有中间层（`Xt(pair,isDark)` 之上）：**渲染时谁决定 `isDark`**（主题 store？CSS 变量？）。
- `C9(t)`（`m0` 的校验器，猜测是"像 hex 就 true"）与 `lg()`/`Oce` 的编码侧全貌（§一之十七 遗留）。
- `m0` 只大写不补零 ⇒ **写侧如果产生 6 位 hex，`T1e` 这条路也读不出来**（同族问题，是否成立取决于写侧 —— **待查写侧**）。
- `T1e` 只处理 `type==="washi"` ⇒ **涂鸦（doodle）与"线"两种分隔符在这个解析器里怎么走**（未出现 ⇒ 可能在别处，或它们不带 `patternSource.color`）。
- `_runAttributes` 的写侧与 run 字段集（§一之十九 遗留，本批未触）。

## 一之二十一、★ 序列化写侧全貌（读侧的镜像）+ 两向字段名映射（2026-09-27 12:53 结案，`index-DiTmKH3z.js` @555900–@557700 整窗 + @556434 / @557231 / @799026 / @931373；★ 结掉 §一之十五/§一之十九 的 `_runAttributes` 写侧、`gr` 的真实用法、`decorations` 形状三条遗留）

`@555900` 起这一窗是**线格式的序列化器**（把内存 `styleProps` 压回线上字段），与 §一之十七/§一之十九/§一之二十 的读侧**逐字段成对** ⇒ **读写闭环至此完整**。

### 1. ★★ `gr(值, 默认值)` 的真实用法：**新建写全默认、编辑省略等于默认的字段**

```js
v = {
  textStyle:        gr(t.styleProps.textStyle,       n ? at.Body        : void 0),
  alignmentStyle:   gr(t.styleProps.textAlignStyle,  n ? Ho.Left        : void 0),
  listStyle:        gr(t.styleProps.listStyle,       n ? Nt.None        : void 0),
  lineStyle:        gr(t.styleProps.lineStyle,       n ? $t.None        : void 0),
  urlStyle:         gr(t.styleProps.urlStyle,        n ? S9.Default     : void 0),
  layoutStyle:      gr(t.styleProps.layoutStyle,     n ? Xn.Regular     : void 0),
  imageFillStyle:   gr(t.styleProps.imageStyle.fillStyle, n ? Fa.ScaleAspectFill : void 0),
  imageSizeStyle:   gr(t.styleProps.imageStyle.sizeStyle, n ? r1.Auto    : void 0),
  fontStyle:        gr(t.styleProps.fontFamilyId,    n ? Jt.System      : void 0),
  indentationLevel: gr(t.styleProps.indentLevel,     n ? 0              : void 0),
  lineThemeStyle:   gr(gQ(h0e(...)), void 0),  themeInstanceProps: gr(gQ(...), void 0),
  userDefinedListNumber: t.styleProps.userDefinedOrdinal ?? void 0,
  paragraphStyle: (spacingBefore==null && spacingAfter==null) ? void 0 : {...},
}
const I = gr(t.todoState, n ? tn.Unchecked : …)
```

- ⇒ **`gr(t, e) = t === e ? void 0 : (t ?? void 0)`（§一之十五 7）第二个参数就是"默认值"** ⇒ 写侧靠它做**字段级最小化**（值等于默认 ⇒ 不写该字段）。
- ★★ ~~但默认值是条件式 `n ? 默认 : void 0` ⇒ 新建块（n 为真）写默认值、更新块省略等于默认的字段；同一字段在「新建」与「更新」两种请求里形态不同~~ **【第 52 批更正：方向反了 + 归因是猜的】`n = omitDefault`** ⇒ **`n=true` 才省略等于默认的字段**（`gr(值, 默认)` 相等即 `void 0`），`n=false` 则全量写入；「新建/更新」的归因**作废**，真实是**调用方按需选这个选项**（哪条链用哪个未取）。⇒ **读侧必须带 `j3(…, 默认)` 的结论仍成立**，成因改为「`omitDefault` 决定字段是否被省略」。详见 **§一之二十二 0**、`gap.md` **G543**。
- ⇒ 这也解释了读侧为什么必须有 `j3(值, 白名单, 默认)`：**更新请求里字段是缺的**，读侧要补默认。

### 2. ★★ `color` 的反向改名：**线上永远是旧名 `secondarycolor`**

```js
color: t.styleProps.color === "themeColor" ? "secondarycolor" : E5(t.styleProps.color || null)
```

- ⇒ 读侧（§一之十九 3）把 `"secondarycolor"` 归一成内存名 `"themeColor"`，**写侧反向** ⇒ ★ **`themeColor` 只是内存别名，磁盘/线上存的是 `secondarycolor`**。⇒ **按内存名写数据会写错**（值为 `null`/未设时写 `E5(null)` ⇒ 未取 `E5`）。

### 3. ★ 两向字段名不一致清单（本地复刻必须建映射表）

| 线上（wire） | 内存（styleProps） | 证据 |
|---|---|---|
`indentationLevel` | `indentLevel` | §一之二十一 1 |
`userDefinedListNumber` | `userDefinedOrdinal` | §一之二十一 1 |
`color: "secondarycolor"` | `color: "themeColor"` | §一之二十一 2 |
`smartLinkLastSyncTimestamp` | `lastSyncTimestamp` | 写侧 `y.lastSyncTimestamp = t.smartLinkLastSyncTimestamp` |
`areCommentsHidden: "0"/"1"`（字符串） | `areCommentsHidden`（布尔经 `rI()`） | `gr(rI(t.areCommentsHidden), n ? "0" : void 0)` |

⇒ ★ **四组 + 一组布尔编码** ⇒ 复刻与对账时**不能按名字猜字段**；`grep` 同名结果为 0 可能是"换了名字"而不是"不存在"（本目录此前踩过这类反向误判的边）。

### 4. ★ run 模型的写侧与 `decorations` 的两成员

```js
const x = b0e(t.styleProps.runAttributes).map(z => ({ ...z,
  highlightColor: MC(z.highlightColor),            // ★ kc 的逆（色对象 → 线格式串）
  range: [z.start, z.length], start: void 0, length: void 0 }));   // ★ 压回 range、删掉 start/length
const w = t.styleProps.decorations, S = w.focus != null || w.block != null;
// decorations: S || !n ? w : void 0
```

- ⇒ **run 读写完全成对**：读 `range → start/length`、写 `start/length → range`（§一之十九 2 的闭环补上）。
- ★ **`decorations` 的形状是 `{focus?, block?}`** ⇒ 写条件 `S || !n`：**更新已有块时恒写（即使两者都空）、新建时只有确实有 `focus`/`block` 才写** ⇒ 又一处"新建 vs 更新"形态差。⇒ **`focus` 与 `block` 正好对应本地的 `focus-style.tsx` / `shaded-style.tsx` 两个 CSS 实现**（本地存在，但作为**编辑器样式实现**，不是持久化数据字段 ⇒ 承载差异）。
- ⇒ 同窗还有**布尔写成 `"0"` 字符串**（`gr(rI(bool), n?"0":void 0)`）⇒ 与 §一之十七 2 的 `aI`("1"/"0") **读写成对** ⇒ **三种布尔编码是有意的按字段设计，不是历史垃圾**。

### 5. 同窗顺带读到的四个结构（附带证据）

- **url 块字段集**：`title / description / url / iconUrl / originalUrl`（`t.url` 存在时才写）+ `smartLinkData` **`JSON.stringify` 后写入** + `dailyNoteDate.toString()` ⇒ url/智能链接/每日笔记三类元数据都在块上。
- **`rawObjectData: JSON.stringify(t.rawObjectData)`**（`IJe`）⇒ ★ **线上还有 `rawObjectData` 这个"字符串化的对象数据"字段**（与 `objectData` 平行），本地 0 命中。
- **链接类型三值 + 未知抛错**：`vJe(t)`：`blockLink` → 保持；`link`/`relation` → `{targetDocumentId:"", targetBlockId:"", updated, isDeleted:false}`；`default: He(t)` ⇒ 又一处渲染/反序列化严格。
- **反向 switch 也穷尽抛错**：`cst(t)`（left/center/right→`Ho.*`）、`dst(t)`（`system`→`Jt.System` …，`system-serif`→`SystemSerif`），`default: He(t)` ⇒ **读侧 `j3` 宽容、写侧反向 switch 严格**，与 §一之十八 的策略矩阵一致。

## 仍未采到（模型面·第 51 批）

- **`n` 的确切语义**（新建？脏标记？"是否传默认值"开关？）—— 决定上面"两种形态"的表述精度。
- `E5()`（color 写侧转换）、`MC()`（highlightColor 写侧逆转换）、`gQ`/`h0e`（lineThemeStyle 写侧链）、`b0e`（run 预处理）。
- `rI()`（布尔 → `"0"/"1"`）与 `Rf`/`ti` 等**写侧数值序列化族**全表。
- `rawObjectData` 的**读侧**（谁 `JSON.parse` 它、与 `objectData` 的分工）。
- `focus`/`block` 两成员各自的形状（`{color?}`？）。
- 主色**提取本体仍未取**（**读写已闭环**：`IVe`/`iMe`，6 位通道，§一之二十六 3）；写侧 `primaryColor` 只见三个取值（`"#f2f2f2"`、`iMe(e)`、`null`）⇒ 提取逻辑不在这条链上。

## 一之二十二、★ 序列化器签名 `YU(t, {omitDefault, omitNonRenderProps})` + **更正 §一之二十一 的方向性错误** + 任务时间/重复的写侧（2026-09-27 13:01 结案，`index-DiTmKH3z.js` @554400–@555950）

### 0. ★★ **【第 52 批更正】`n` 不是"新建块"，是 `omitDefault` 选项，方向与 §一之二十一 1 的推断相反**

```js
function YU(t, { omitDefault: n, omitNonRenderProps: o } = {}) {
  const l = o ? null : t.documentId,   r = o ? null : t.createdByUserId,
        c = o ? null : t.modifiedByUserId,  f = o ? null : t.createdMs,
        p = o ? null : t.updatedMs,     m = o ? null : t.resourceId,
        g = o ? null : t.stamp;          // ★ 非渲染属性整批置 null
  …
  textStyle: gr(t.styleProps.textStyle, n ? at.Body : void 0),   // ★ n = omitDefault
}
```

- ⇒ **`n = omitDefault`** ⇒ `gr(值, 默认) = 值===默认 ? void 0 : (值 ?? void 0)` 的真实语义：
  - **`omitDefault: true` ⇒ 默认值参数被填上** ⇒ 值等于默认时返回 `void 0` ⇒ **该字段被省略**；
  - **`omitDefault: false/省略` ⇒ 默认参数是 `void 0`** ⇒ 只有值本身为 `undefined` 才省略 ⇒ **全量写入**（哪怕值等于默认也写）。
- ⇒ ★★ **因此 §一之二十一 1 那句「新建块写全默认、更新块省略等于默认的字段」方向反了、且"新建/更新"这个归因是猜的** ⇒ **本条就地作废**：真实是**调用方按需选 `omitDefault`**（哪条链用 `true`、哪条用 `false` **未取**，列未采到）。读侧必须带 `j3(…, 默认)` 的理由**仍然成立**（写侧可能省略字段，读侧要补默认），但成因描述改为"**`omitDefault` 决定字段是否被省略**"。
- ⇒ `o = omitNonRenderProps` ⇒ **`documentId`/`createdByUserId`/`modifiedByUserId`/`createdMs`/`updatedMs`/`resourceId`/`stamp` 七个"非渲染属性"**在 `o` 为真时整批置 `null` ⇒ ★ **官方有"只传渲染所需"的传输精简开关**（审计/权限字段不必过线）。
- 本地对照：`grep -rn "omitDefault\|omitNonRenderProps" src` ⇒ **0**。

### 1. ★ 任务时间的**两套写侧编码**（与读侧 §一之八 对上）

```js
function SVe(t) { return t != null ? { assignee: t.assignee,
  deadline:  t.deadline  ? V5(t.deadline)  : t.deadline,     // ★ V5 版
  schedule:  t.schedule  ? V5(t.schedule)  : t.schedule,
  repeat:    t.repeat    ? wVe(t.repeat)    : void 0,
  reminder:  t.reminder } : null; }
function vVe(t) { return t != null ? { assignee, deadline:  t.deadline  ? t.deadline.getTime()  : …,   // ★ 毫秒版
  schedule: … getTime() …, repeat: kVe(t.repeat), reminder } : null; }
```

- ⇒ ★ **同一份任务字段有两套时间编码**：**`V5(...)`（日历归一版）与 `getTime()`（毫秒版）** ⇒ 与 §一之八 记的 `V5`/`VE` 一起构成**任务线格式的时间三通路**（`V5` 读写共用同一函数形、`VE` 为另一侧）。⇒ **`V5` 在读写两侧都出现 ⇒ 它是"日历归一"的通用变换**，不是单向解析。
- ⇒ 两套并存的原因未证（疑：不同接口/不同客户端）⇒ 列未采到。

### 2. ★ repeat 是**两套转换器 × 四个频档**（**"读写两套字段名"的猜想被自己的证据否掉**）

```js
// SVe（V5 版）里 repeat 走 wVe(t.repeat)；vVe（毫秒版）里走 kVe(t.repeat) ⇒ ★ repeat 有两套转换器
function kVe(t) { const e = { type: t.type, frequency: t.frequency };
  t.interval   != null && (e.interval = t.interval);
  t.startDate  != null && (e.startDate = t.startDate.getTime());     // ★ 起始日是毫秒时间戳
  t.daily   != null && (e.daily   = y0e(t.daily));      // ★ 四频档各自一个转换器
  t.weekly  != null && (e.weekly  = C0e(t.weekly));
  t.monthly != null && (e.monthly = x0e(t.monthly));
  t.yearly  != null && (e.yearly  = w0e(t.yearly));
  t.reminder != null && (e.reminder = k0e(t.reminder));
  return e; }                                       // 全部"有才写"
function w0e(t) { const e = { months: t.months };
  t.days        != null && (e.days = t.days);
  t.dynamicDays != null && (e.dynamicDays = t.dynamicDays.map(S0e)); return e; }   // ★ w0e 是 yearly 档
function S0e(t) { return { selector: t.selector, type: t.type }; }
function k0e(t) { return { enabled: t.enabled,
  ...(t.dateOffset != null ? { dateOffset: t.dateOffset } : {}) }; }
```

- ⇒ ★ **`{months, days, dynamicDays}` 是 `w0e`（yearly 档）的字段，不是 repeat 的读侧形态** —— 我在动笔时把 `w0e` 误读成了 `wVe`，**"repeat 读写两套字段名"这条断言当场撤回**（本批同窗里 `wVe` 的实现体**没有被读到**，它只是 `SVe` 里的调用名）。⇒ 教训：**同音/近形的 minified 名（`w0e` / `wVe` / `kVe` / `vVe`）必须按完整 token 与调用位置核对，不能凭相似性配对**。
- ⇒ 已证实的部分：**`repeat = {type, frequency, interval?, startDate?, daily?, weekly?, monthly?, yearly?, reminder?}`**，四频档各有一个转换器（`y0e/C0e/x0e/w0e`），全部"有才写"（省略语义与 §一之十七 的 `zPe`/`gr` 一致）；**`yearly = {months, days?, dynamicDays?}`**；**`dynamicDays` 元素 = `{selector, type}`**（印证此前"`selector` 按字符串存"）；**`reminder = {enabled, dateOffset}` 且 `dateOffset` 有才写**（与 `tasks.md` §10.8 的 `u(v)=>{enabled, dateOffset}` 读写同构 ✓）；**`startDate` 是毫秒时间戳**。
- 本地对照：`src/lib/task/recurrence.ts:3-11` 是 `{freq, days?, byMonthDay?, until?}` —— **① 字段名 `freq` ≠ 官方 `frequency`；② ★ 本地多出 `until` 字段（上批次 10.9 已证官方 `until/endDate/repeatEnd/…` 全 0 命中 ⇒ 本地是"超出官方"的方向性差异）；③ 本地无 `interval/startDate/dynamicDays/selector`；④ 本地 `parseRecurrence` 是严格校验（任一不合法 ⇒ 整条 `null`），与官方 `j3` 逐字段回退 + `DU` 记账相反**。`grep -rn "frequency\|dynamicDays\|selector" src/lib/task src/actions/task` ⇒ **0**。

### 3. 同窗顺带（本批未展开，列下批）

`y0e`/`C0e`/`x0e`/`w0e`（daily/weekly/monthly/yearly 四档各自的转换器，§10.7/10.8 的写侧）、`V5` 是否确为读写共用、`mVe`/`xVe`（model 与 dailyNoteDate 的转换）。

## 仍未采到（模型面·第 52 批）

- ~~哪条调用链用 `omitDefault: true`~~ **第 53 批结案（§一之二十三 3）**：唯一观测调用点是「先 `runAttributes=[]` → `YU(w,{omitDefault:!0,omitNonRenderProps:!0})` → `m0e(I)` → `i.set(w.id,…)`」⇒ **疑似按块 id 的索引/快照构造**（组件未展开）。
- 任务时间两套编码的**调用方仍未取**（哪条请求用 `V5` 版、哪条用毫秒版）；★ **repeat 侧已完成配对**：`SVe↔wVe`（均 `V5`）与 `vVe↔kVe`（均 `getTime()`）——§一之二十四 1。
- ~~**`wVe` 的实现体**~~ **第 54 批结案（§一之二十四 1）**：`wVe` 与 `kVe` **逐字段同构，唯一差别是 `startDate` 用 `V5`（日历归一）还是 `getTime()`（毫秒）** ⇒ 与 `SVe`/`vVe` 一一配对 ⇒ 「两套编码」＝两个接口版本。
- ~~四档转换器的字段集~~ **第 53 批结案（§一之二十三 2）**：daily `{skipWeekends?}` / weekly `{days}` / monthly `{days?, dynamicDays?, skipWeekends?}` / yearly `{months, days?, dynamicDays?}`；**`skipWeekends` 只在 daily 与 monthly** ⇒ 即「周末除外」。
- ~~`V5` 实现体是否读写共用~~ **第 53 批结案（§一之二十三 1）**：`V5` 清零到本地 0 点后 `Lm(e, -offset)`、`VE` 反向 `Lm(e, +offset)` 再 `fLe` ⇒ **双向对称**，按「UTC 表示的本地零点」存。

## 一之二十三、★ 时间归一配对 `V5`/`VE` + repeat 四档字段集 + `omitDefault` 的唯一调用点（2026-09-27 13:21 结案，`index-DiTmKH3z.js` @109238 / @554097 / 调用点 `const I = YU(w, {omitDefault:!0, omitNonRenderProps:!0})`；★ 结掉 §一之二十二 的 `V5`、四档转换器、"哪条链用 `omitDefault:true`"三条遗留）

### 1. ★ **`V5` 是"日历日期 → 线格式"、`VE` 是反向，两者对称**

```js
function V5(t) { const e = new Date(t); e.setHours(0,0,0,0);
                 return Lm(e, -e.getTimezoneOffset()).getTime(); }      // 清零到本地 0 点 → 向前偏移
function VE(t) { const e = new Date(t), n = Lm(e, e.getTimezoneOffset());
                 return fLe(n); }                                        // 向后偏移 → Date
const mLe = t => { const e = new Date(t); return Number.isNaN(e.getTime()) ? null : e; };  // ★ 宽松解析 NaN→null
function n1e(t) { const e = new Set; return t.filter(n => { const o = n.getTime();
                 return e.has(o) ? !1 : (e.add(o), !0); }); }            // ★ 按毫秒去重
function gLe(t) { let e; t == null ? e = Kh() : … }                       // 默认取 `Kh()`（未展开）
```

- ⇒ **`setHours(0,0,0,0)` 清到本地 0 点、再用 `±getTimezoneOffset()` 对称偏移** ⇒ ★ **日期按「UTC 表示的本地零点」存 ⇒ 跨时区读回来仍是本地零点** ⇒ 这是官方"日期是日历日而非时间戳"的实现（与 §一之八 记的 `V5`/`VE` 读写配对一致，**本批拿到实现体并确认双向对称**）。
- ★ **`mLe` 是宽松解析**（NaN ⇒ `null`，不抛）与 §一之十六 的"逐字段降级"同族；`n1e` 是**按毫秒去重**（日期列表去重的通用 helper）。
- 本地对照：`grep -rn "getTimezoneOffset" src` ⇒ **0 命中** ⇒ **本地完全没有时区归一**；`setHours(0,0,0,0)` 只有 3 处且**全在每日笔记路径**（`src/actions/daily-notes/daily-notes.ts:18`、`src/app/(app)/daily-notes/page.tsx:21/:63`）⇒ **任务/日期类字段没有这套归一** ⇒ 跨时区/跨设备显示不一致的风险点。

### 2. ★ repeat **四档字段集全图**（每档的转换器都读到）

| 档 | 转换器 | 字段 |
|---|---|---|
daily | `y0e` | `{skipWeekends?}` |
weekly | `C0e` | `{days}`（星期几数组，**必有**） |
monthly | `x0e` | `{days?, dynamicDays?, skipWeekends?}` |
yearly | `w0e` | `{months, days?, dynamicDays?}` |

- ⇒ ★ **`skipWeekends` 只出现在 daily 与 monthly**（weekly 用 `days`、yearly 用 `months`）⇒ 与 `tasks.md` §10.7 读侧的「每 N 天一次，**周末除外**」对上：**"周末除外"就是 `skipWeekends`**。
- ⇒ 四档全部"有才写"（省略语义一致）；`dynamicDays` 元素 `{selector, type}`（已知）。
- 本地对照：`grep -rn "skipWeekends\|weekend" src` ⇒ **0 命中** ⇒ **"跳过周末"这个循环档本地不存在**（文案与模型两层都缺）。

### 3. ★ `omitDefault:true` 的唯一观测调用点 ⇒ 疑似"最小渲染索引"构造

```js
… (A.substring(0, S)) ?? null, w.styleProps.runAttributes = []);        // ★ 先把 run 清空
const I = YU(w, { omitDefault: true, omitNonRenderProps: true });       // 两个开关都开
if (I == null) return;
const T = m0e(I);
i.set(w.id, …)                                                           // ★ 存进一个按 blockId 的 Map
```

- ⇒ **两个开关同时开、并把结果 `set` 进 Map** ⇒ **不是网络请求**，形态是**构造一份按块 id 索引的最小对象**（清空 run、剥掉审计字段、省略默认值）⇒ **疑似索引/快照/预览缓存**（**标疑似**，所属组件未展开）。
- ⇒ ★ 这部分解释了"为什么要省略默认值"：**索引/缓存场景要的是差异化的最小载荷**，与 G542 的"传输精简"互补。
- 本地对照：`grep -rn "omitDefault\|omitNonRenderProps" src` ⇒ 0（第 52 批已核）。

## 仍未采到（模型面·第 53 批）

- `Lm(date, offset)` 与 `fLe(date)` 的实现（偏移工具本体）与 `Kh()`（`gLe` 的默认值来源）。
- `m0e()`（把最小化结果再转换一次的函数）与 `i` 是什么 Map（哪个组件的索引）。
- **`V5` 版与毫秒版两套时间编码分别服务哪个接口**（§一之二十二 遗留，本批仍未解）。
- `V5` 写入端的调用面（哪些字段用它：deadline/schedule/dailyNoteDate 分别用哪套）。
- `wVe`（`SVe` 里 repeat 的转换器）实现体 —— §一之二十二 遗留，本批仍未取。

## 一之二十四、★ `wVe` 结案（repeat 起始日双编码）+ 布尔四对读写 + 渐变写侧 + 日历周起始（2026-09-27 13:25 结案，`index-DiTmKH3z.js` @107614 / @110314 / @545431 / @553726；★ 结掉 §一之二十二 的 `wVe` 与"两套编码分别服务哪个接口"两条遗留）

### 1. ★ **`wVe` 与 `kVe` 同构，唯一差别是 `startDate` 的时间编码** ⇒ 不是两代数据，是**两个版本的同一接口**

```js
// SVe（V5 版）配 wVe：   startDate: V5(t.startDate)      ← 日历归一
// vVe（毫秒版）配 kVe：  startDate: t.startDate.getTime() ← 毫秒
function wVe(t) { const e = { type: t.type, frequency: t.frequency };
  t.interval != null && (e.interval = t.interval);
  t.startDate != null && (e.startDate = V5(t.startDate));
  t.daily    != null && (e.daily = y0e(t.daily));
  t.weekly   != null && (e.weekly = C0e(t.weekly));
  t.monthly  != null && (e.monthly = x0e(t.monthly));
  t.yearly   != null && (e.yearly = w0e(t.yearly));
  t.reminder != null && (e.reminder = k0e(t.reminder));
  return e; }
```

- ⇒ ★ **`wVe` = `kVe` 的镜像**（字段逐条相同），**只有 `startDate` 一个差别：`V5`（日历归一）vs `getTime()`（毫秒）** ⇒ ★ 与 §一之二十二 1 的 `SVe`/`vVe` **一一配对** ⇒ **"两套时间编码"是"两个接口版本"，不是两代数据、也不是读写两套字段名**（此前那条已被撤回的猜想，现在有了正面解释）。
- ⇒ 仍未取：`SVe`（V5 版）与 `vVe`（毫秒版）**分别被谁调用**（列未采到）。

### 2. ★ 布尔编码**两对读写函数**（`"1"/"0"` 与 `"true"/"false"` 各成一对）

```js
function rI(t) { return t == null ? void 0 : t ? "1"  : "0"; }     // 写 → 与 aI 对
function Qq(t) { return t == null ? void 0 : t ? "true": "false"; } // 写 → 与 Yq 对
function aI(t) { return t === "1" ? true : t === "0" ? false : null; }   // 读（已知）
function Yq(t) { return t === "true" ? true : t === "false" ? false : null; } // 读（已知）
```

- ⇒ ★ **写侧补齐 ⇒ §一之十七 2 的表述应从"三种编码"改为**：**两对读写函数**（`rI`↔`aI` 用 `"1"/"0"`、`Qq`↔`Yq` 用 `"true"/"false"`，**缺字段两侧都返回 `void 0`/`null`**）+ `tn` 数字三态（0/1/2）+ `isTodoChecked` 的 `+o`（0/1）⇒ **四种编码形态**，**全部读写成对 ⇒ 按字段的有意设计**（与 §一之二十一 4 的结论一致，本批给出完整配对表）。
- 同窗还有 `yLe`/`s1e`（cropMask 编解码）成对出现 ⇒ **编码/解码函数在源码里总是相邻成对**（本目录的选题提示：**找到读侧就能在邻近处找到写侧**）。

### 3. ★ 渐变写侧 `MC` 与两处不一致的颜色序列化

```js
function E5(t) { return t == null ? void 0
  : t.light === t.dark ? t.light : t.light + " " + t.dark; }              // ★ 单色只写一段
function MC(t) { if (t != null) return I2(t)
  ? t.colorStops.map(e => `${e.color.light} ${e.color.dark}`).join(";") + ";g"   // ★ 渐变：色;色;…;g
  : t.light === t.dark ? t.light : t.light + " " + t.dark; }
function sVe(t) { return t == null ? null
  : t.type === "gradient" ? { ...t, gradient: MC(t.gradient), colorMode: t.colorMode }
  : t.type === "soli…" … }                                                 // ★ 上层样式对象二态（gradient / solid…）
```

- ⇒ ★ **渐变读写闭环完成**：读 `kc("<色>;<色>…g")` ↔ 写 `MC(...) = "色;色;…;g"` ⇒ **末尾 `;g` 与读侧 `split(";").filter(o => o.length>0 && o!=="g")` 完全对上**（空段被滤掉）。
- ★ **两处序列化写法不一致**：`E5`/`MC` 在单色时**只写一段**，而 §一之二十一 读到的 `Ad(t) = `${t.light} ${t.dark}`` **恒拼两段** ⇒ 同一语义两种实现（与 §一之十六 日志文案不统一同族的内部噪声）。
- `sVe` 显示还有更高一层的样式对象：`{type: "gradient" | "solid"…, gradient?, colorMode?}` ⇒ **`colorMode` 是样式对象的字段**（与白板 `colorMode` 参数不是一回事，未展开）。

### 4. ★ `fLe` 就近归日 + `AU` 里官方日历的**周起始判据**

```js
function fLe(t) { const e = t.getTime(), n = new Date(t); n.setHours(0,0,0,0);
  const o = new Date(n); o.setDate(o.getDate()+1);
  const s = n.getTime(), i = o.getTime(), l = (s+i)/2;
  return e <= l ? n : o; }                          // ★ 距当日中点 ≤ 则归当天，否则归次日
const AU = (t, e, n) => { const o = Qo(), s = vi(o, t),       // Qo() = 今天
  l = o.getDay() === 1 ? o : B1(Yce(o), 1),                   // ★ 周一起始（getDay()===1 ⇒ Monday）
  {t: r, locale: c} = n ?? {},
  d = r7(t, B1(l,-7), l,  {includeEnd:!1}),                    // ★ r7 = 区间判定，带含端点开关
  u = r7(t, l,  A4(l),    {includeStart:!0, includeEnd:!1}),
  f = r7(t, A4(Qo()), B1(A4(Qo()),7), {includeStart:!0, …}) ; …}
```

- ⇒ ★ **`VE`（线格式→Date）先偏移再 `fLe` 就近归日** ⇒ 完整读链：线格式 → `Lm(+offset)` → **跨过当日中点就归次日** ⇒ 这是"时区偏移后仍保持正确日期"的关键一步。
- ⇒ ★ **官方日历周起始是 Monday**（`o.getDay() === 1` 直接判"今天是周一就用今天"，否则回退到最近的周一）⇒ 与此前动态实测「中文 locale 下周一起始」**静态印证**（§10.8 的 `下周五→2026-10-09` 也可独立复算）。
- ⇒ `r7(t, start, end, {includeStart, includeEnd})` 是**带端点开关的区间判定工具** ⇒ 本地 `grep -rn "includeEnd\|includeStart" src` ⇒ **0 命中**。
- 本地对照：`src/lib/utils/daily-note.ts:6` 用 `weekdays[date.getDay()]`（**JS 默认 Sunday=0 直接取星期名**）、`CalendarView.tsx:34` 用 `getDay()` 取当月首日星期（**周起始档位本批未核**）；`grep -rn "0 = Sunday" src` = 1（`recurrence.ts:5` 注释 **0 = Sunday**）⇒ 官方周段用 Monday、本地注释用 Sunday-0 ⇒ **两者不冲突但口径不同，需逐处核**。

## 仍未采到（模型面·第 54 批）

- ~~`SVe`/`vVe` 分别被谁调用~~ **第 55 批拿到分工线索（§一之二十五 2，标疑似）**：`vVe`（毫秒）在**冲突合并回写**（`i.set(y, vVe(L))`，`L=_0e({clientData,serverData,baseData})`），`SVe`（`V5` 归一）在**线格式读入**处（`t.objectDataRaw`/`t.taskData`）⇒ 疑似「读入归一 / 合并写回毫秒」。★ 仍开：`SVe` 所在函数签名与两处是否同一数据流。
- `Lm(date, offset)` 偏移工具本体（`V5`/`VE` 都用它）与 `fLe` 之外的 `Yce`/`B1`/`A4`/`vi`/`Qo`/`r7` 日期工具族（`Qo()` 猜测＝今天）。
- `sVe`/`J7`/`oVe` 那一层样式对象的完整形状（`type: gradient|solid…`、`colorMode` 字段）。
- `B1(Yce(o), 1)` 中 `Yce` 是什么（"最近周一"的算法）。
- `AU` 的消费方（哪个屏在算周段 ⇒ 与 `registries.md` §五之二 的日历分区对账）。

## 一之二十五、★ 日期工具族 + `SVe`/`vVe` 的调用点分工线索（2026-09-27 13:30 结案，`index-DiTmKH3z.js` @104506 与两处调用点；★ 结掉 §一之二十四 的"两套编码调用方"部分遗留）

### 1. ★ 官方日期加减工具族（**且有同义重复**）

```js
function B1(t, e) { const n = new Date(t); return n.setDate(n.getDate() + e), n; }   // ±天
const ec = (t, e) => { const n = new Date(t); return n.setDate(n.getDate() + e), n; } // ★ 与 B1 完全同义（重复实现）
const Qo  = () => Pr(new Date);          // ★ "今天"（`Pr` 未展开）
const T5  = () => B1(Qo(), 1);           // 明天
const bw  = () => B1(Qo(), -1);          // 昨天
function uO(t, e) { … n.setFullYear(n.getFullYear() + e) … }        // ±年（独立工具 ⇒ 闰年面）
const cg = (t, e) => { … n.setMonth(n.getMonth() + e) … };          // ±月
const lLe = (t, e) => ec(t, e * 7);                                  // ★ 周 ＝ 天 × 7 直乘
```

- ⇒ ★ **官方日期工具是"纯函数包 `Date` 方法"**，且 **`B1` 与 `ec` 同义重复** ⇒ 与 §一之十六 日志文案不统一、§一之二十四 `E5`/`Ad` 不一致同族的**内部重复第 N 例**。
- ⇒ `lLe(周) = 天 × 7` ⇒ **周不做月级修正**（简单直乘），与 `cg`（月）分开 ⇒ 闰月/月长问题只存在于月级工具。
- ★ 本地对照：`grep -rn "setDate(\|setMonth(\|setFullYear(" src/lib src/components/editor` ⇒ **0 命中** ⇒ 官方这套直乘 `Date` 方法的工具本地没有；**但本地有 `addDays`/`addMonths` 且带类型**：`src/lib/task/recurrence.ts:200` `function addDays(wall: WallClock, days: number)` 与 `:212` `function addMonths(wall: WallClock, months: number)` ⇒ ★ **本地的实现反而更显式（`WallClock` 抽象）且不重复** ⇒ 这一条**不是缺失，是风格/类型化差异**（本地超出方向的第 2 例，第 1 例是 G545 的 `until`）。

### 2. ★ `vVe`（毫秒版）的调用点落在**冲突合并的回写**上，`SVe`（V5 版）落在**线格式读入**处

```js
// 调用点 A（合并链，接 §十一 三方合并）
M = Yn(b.taskData, iQ),
L = _0e({ clientData: P, serverData: M, baseData: j });     // ★ §十一 3 的任务合并器
i.set(y, vVe(L));                                            // ★ 合并结果用毫秒版序列化
// 调用点 B（读入解析链）
const D = t.objectDataRaw, _ = t.taskData, j = SVe(_);       // ★ 线格式字段读出 → V5 版
```

- ⇒ ★ **分工线索**：**`vVe`（毫秒）出现在服务端补丁/合并结果的回写，`SVe`（`V5` 归一）出现在从线格式读出块** ⇒ 推断 **读入用归一版、合并写回用毫秒版**（**标疑似**：`SVe` 所在函数签名未读全、两处是否同一数据流未证）。
- ⇒ 这也解释了"为何同一字段两种编码"：**读入层要做日历归一（跨时区一致），合并层只做差异运算（毫秒更稳妥）**。⇒ 若推断成立，本地若做合并应**在读入层归一、在合并层保留原始时间戳**。
- ★ 本地对照：`grep -rn "clientData\|serverData\|baseData" src` ⇒ **0 命中**（与 §十一 / G440 的"本地无三方合并"一致 ✓）。

### 3. ★ "同名不同物"新一例：线格式字段 `taskData` ↔ 本地局部变量 `taskData`

- 官方：`t.taskData` 是**线格式字段**（与 `objectDataRaw` 并列，在读入/序列化链里取用）。
- 本地：`grep -rn "objectDataRaw\|taskData" src` ⇒ **2 处**，都是**局部变量**（`src/app/(app)/calendar/page.tsx:25` `const [taskData, noteData] = await Promise.all([getTasks(), getDailyNotes()])`、`:26` `setTasks(taskData)`）。
- ⇒ ★ **同名但完全不是同一物** ⇒ 与 §一之二十一 3（两向字段名不一致）、§一之十八 4（`decorations` 巧合同名是 ProseMirror API）同族 ⇒ **本目录又多一条方法论证据：`grep` 命中也可能与官方字段无关**（反向：`grep` 0 命中可能是换名，`grep` 命中可能是巧合）。

## 仍未采到（模型面·第 55 批）

- ~~`Pr(new Date)`（`Qo()` 即「今天」的实现）~~ **第 56 批结案（§一之二十六 1）**：`Pr(t)`＝四次 `setX(0)` 到本地零点 ⇒ `Qo()` ＝**本地零点的今天**；连带 `e1e` ⇒ **第三个 URL scheme `day://YYYY.MM.DD`**、`TU` ＝严格日期解析器。★ 仍开：`r7`/`Yce`/`A4`/`vi`（区间判定与最近周一算法）。
- ~~**`SVe` 所在函数的签名与调用方**~~ **第 56 批确认（§一之二十六）**：它在**线格式→内部模型的读入解析器**里（同函数并读 `objectDataRaw` / `taskData` / `blob`，并分派 `whiteboard`→`sQ` 与 `code`→`textContent`）⇒ **「读入用 `SVe`（`V5` 归一版）」从「疑似」升级为强证据**；两处是否同一数据流仍未证。
- `Yn(b.taskData, iQ)`（把 `taskData` 拆出 `iQ` 的那个函数）与 `_0e` 的完整签名（§十一 3 的入参名是 `{clientData, serverData, baseData}` ✓，但本处 `iQ` 是什么未读）。
- `y0(t, e)`（@104506 被截断的那个日期工具）。

## 一之二十六、★ 日期上下界 + **第三个 URL scheme `day://`** + 严格日期解析器 + 两条读写闭环（2026-09-27 13:37 结案，`index-DiTmKH3z.js` @106407 / @545908 / @561324 与 `SVe` 调用点；★ 结掉 §一之二十五 的 `Pr`、§一之二十四 的 `SVe` 所在链、以及 §一之十五 的主色 6/8 位归属）

### 1. `Pr` / `_1o` / `e1e` / `TU` —— 日期工具四件套（含 **`day://` scheme**）

```js
function Pr(t) { const e = new Date(t); e.setHours(0); e.setMinutes(0); e.setSeconds(0); e.setMilliseconds(0); return e; }
function _1o(t) { const e = ec(Pr(new Date(t)), 1); e.setTime(e.getTime() - 1); return e; }   // ★ 当日 23:59:59.999（次日0点−1ms）
function e1e(t) { return "day://" + t.getFullYear() + "." + ("0"+(t.getMonth()+1)).slice(-2) + "." + ("0"+t.getDate()).slice(-2); }
function TU(t, e = false) { … const i = /^(?<year>\d{4})[-.](?<month>\d{1,2})[-.](?<day>\d{1,2})$/, … }
```

- ⇒ **`Qo() = Pr(new Date)` ＝ 本地零点的今天**；**`_1o` ＝ 当日 23:59:59.999** ⇒ 官方"日范围"是 `[Pr(日), _1o(日)]` 这对。
- ★★ **`e1e` 生成第三个 URL scheme：`day://2026.09.27`**（**点分隔 + 两位零填充**）⇒ 与 `contract.json` 挖到的 `craft://`、`craftdocs://` 合计 **三个 scheme**，`day://` 是**每日笔记深链**。
- ★ **`TU(t, force)` 是严格日期解析器**：**`^(?<year>\d{4})[-.](?<month>\d{1,2})[-.](?<day>\d{1,2})$`** ⇒ 允许 `-` 或 `.` 分隔、**强制四位年**、用命名捕获组 ⇒ 与 §一之八 记的"严格格式（`2026.09.27`→`2026/09/27`、闰年 2 月校验）**同步先试**"对上，**这就是那条严格解析器**。
- 本地对照：`grep -rn "day://" src` ⇒ **0**；`grep -rn "craft://\|craftdocs://" src` ⇒ **0** ⇒ **三个 scheme 本地全无**；`setHours(0,0,0,0)` 组合 3 处仅每日笔记、`23:59` 仅 1 处字面量 ⇒ **官方这对日期上下界工具本地没有**；`grep -rn "\d{4}" src/lib` ⇒ 8 处正则（**逐条形态未对**，列未采到）。

### 2. `h0e` ＝ `T1e` 的逆 ⇒ **`lineThemeStyle` 读写闭环完成**

```js
function h0e(t) { if (t == null) return null;
  if (t.type !== "washi") return t;                       // 非 washi 原样
  const ps = t.patternSource;
  if (ps.type === "pattern" || ps.type === "solidColor")
    return { ...t, patternSource: { ...ps, color: E5(ps.color) } };   // ★ 明暗对 → 字符串
  return t; }
function D5(t, e = false) { const n = {}; … n.styleId = t.styleId ?? void 0; n.authorVisibilityT… }   // pageStyle 写侧
```

- ⇒ **读 `T1e`（color 字符串 → 大写 + `Yt` 明暗对）／写 `h0e`（明暗对 → `E5` 字符串，单色一段/双色两段）** ⇒ 与 §一之二十三 3 的 `E5` 用法对上 ⇒ **lineThemeStyle 整条读写闭环**。
- ★ `pattern` 与 `solidColor` **两种 `patternSource` 走完全相同的写侧处理** ⇒ 写侧不区分图案类型。
- 同处 `D5(t, e)` 是 **pageStyle 的写侧**（`styleId` / `authorVisibilityType` …），与 §一之十五 的读侧默认工厂 `zPe()` **配对**。

### 3. ★★ `primaryColor` 完整闭环 ⇒ **它是独立的 6 位通道，与 8 位 color 对无关**

```js
function IVe(t) { return t == null || t.length < 1 ? void 0 : ti(t.substr(1, 6), 16) ?? void 0; }   // "#RRGGBB" → 24 位整型
function iMe(t) { const c = t.primaryColor; return c != null ? "#" + c.toString(16) : null; }         // 整型 → hex（不补零）
```

- ⇒ ★ **读：去 `#` 取 6 位 → `parseInt(16)` 整型；写：`toString(16)` 补 `#` 但不补前导零** ⇒ **G504 的"短 hex 缺陷候选"从读写两侧同时确认**（`iMe` 不补零、`IVe` 只吃 6 位 ⇒ **6 位是硬约定，8 位 color 对对它无效**）。
- ⇒ ★★ **修正 G520/G515 的适用范围**：**`_R` 的"强制 8 位"只适用于 `color`/高亮的明暗对**；`primaryColor` 是**独立的 6 位 RGB 通道**（cover 默认 `#f2f2f2` 正是 6 位）⇒ 两个通道位数不同是**设计如此**，不是缺陷。
- 本地对照：`grep -rn "parseInt(.*16)" src/lib/editor src/lib/utils` ⇒ **0** ⇒ 本地无 primaryColor 提取/存储（G504 侧一致）。

### 4. `TVe`：**复制/插入链的遍历策略**（顺带坐实 `YU` 默认不省略）

```js
function TVe(t, e) {
  const n = new Map, o = i => { const l = e[i]; if (l != null) {
    const r = YU(l);                                      // ★ 不传选项 ⇒ omitDefault 默认 false ⇒ 全量写入
    if (r != null) { const c = m0e(r); n.set(l.id, c);
      c.subBlocks = []; c.tempId = c.id; c.id = void 0; } } };
  const s = { depth: "all", includeRoot: true };
  On.traverseSubBlocksPreOrder(e, t, s, (i, l) => (o(i.id), true)); …
}
```

- ⇒ ★ **批量复制策略**：先按**前序遍历**把每个块压成最小对象（`YU` 默认档 ⇒ 全量），**剥掉子块（`subBlocks=[]`）、把原 id 挪进 `tempId` 并清空 `id`**，再逐个 `set` 进 Map ⇒ **id 重分配在后置阶段**（`tempId` 是旧 id 与新 id 的桥）。
- ⇒ ★ 这是**第三处印证 `YU(l)` 不带选项**（⇒ `omitDefault` 默认 false，与 G543 一致）。
- 本地对照：`grep -rn "traverseSubBlocks\|PreOrder" src` ⇒ **0**（本地复制实现方式未核，列未采到）。

## 仍未采到（模型面·第 56 批）

- ~~**`m0e()`**~~ **第 57 批结案（§一之二十七 1）**：`m0e` ＝**内存块→线格式的定型函数**（与 `YU` 分工：`YU` 管样式与时间、`m0e` 管块本体）：四个 `JSON.stringify` 字段（`rawProperties`→`properties`、`pageStyle`、`pageStyleProps`、**`style`→`styleAttributes`**）+ `content` + `subBlocks:[]`（恒空）+ 作者/软删标记；**两向字段名五组→七组（新增 `parentId→parentBlock`、`style→styleAttributes`）**。★ 仍开：`created:` 之后的字段表。
- **`J7()`**（`gQ = t => J7(t)`，pageStyle/themeInstanceProps 的写侧转换）与 `D5` 的完整字段表。
- ~~三个 scheme 的注册与解析侧~~ **第 57 批部分结案（§一之二十七 3）**：★ **scheme 权威清单是四个**（`_w=["tex://","day://","craftdocs://users"]` + i18n 里的 `craft://`）；**`day://` 两端已闭环**（`e1e` 生成 / `protocol==="day:"` 判定 / `yw` 去前缀→`TU` 严格解析）。★ 仍开：**`tex://` 与 `craftdocs://users` 的构造点与读入点**（常量 `Cg`/`_5` 的消费方未取）。
- `TU(t, force=true)` 的 `force` 分支做什么（只看到正则 `i`）。
- **本地 8 处 `\d{4}` 日期正则与官方 `TU` 的逐条对照**（严格档是否同形态）。
- `On.traverseSubBlocksPreOrder` 的调用方族（还有哪些遍历场景）与 `m0e`/`tempId` 的后置重放。

## 一之二十七、★ `m0e` 定型函数 + 两向字段名再加两组 + `J7` 递归剥空 + **四个 scheme**（2026-09-27 14:08 结案，`index-DiTmKH3z.js` @546876 / @59247 / scheme 三处；★ 结掉 §一之二十六 的 `m0e`、scheme 读入侧两条遗留）

### 1. ★★ `m0e(t)` ＝ **内存块 → 线格式的定型函数**（`YU` 的姊妹层）

```js
function m0e(t) {
  return {
    id: t.id,
    parentBlock: t.parentId || void 0,                    // ★★ 内存名 parentId → 线名 parentBlock
    type: t.type,
    createdByUserId: t.createdByUserId || void 0,
    properties:      JSON.stringify(t.rawProperties || void 0),   // ★ 四个 JSON 字符串化字段
    pageStyle:       JSON.stringify(t.pageStyle || void 0),
    pageStyleProps:  JSON.stringify(t.pageStyleProps || void 0),
    styleAttributes: JSON.stringify(t.style || void 0),           // ★★ 内存名 style → 线名 styleAttributes
    content: t.content || void 0,
    subBlocks: [],                                          // ★ 恒空（复制场景的剥子块在这里完成）
    isDeleted: t.isDeleted || void 0,
    created: t.crea…,
  };
}
```

- ⇒ ★ **分工**：`YU` 只管 styleProps/时间等"样式与时间字段"的最小子集（含 `omitDefault`），**`m0e` 管块本体的定型**：id/父块/类型/作者 + **四个 JSON 字符串化字段**（`rawProperties`→`properties`、`pageStyle`、`pageStyleProps`、`style`→`styleAttributes`）+ `content` + `subBlocks` + 软删标记。
- ★★ **两向字段名不一致再加两组**（§一之二十一 3 五组 ⇒ **七组**）：**`parentId → parentBlock`**、**`style → styleAttributes`**。
- ★ **线上有四个 `JSON.stringify` 字段**（properties/pageStyle/pageStyleProps/styleAttributes）⇒ 与 §一之八 的"四个 JSON 容器"（`rawProperties`/`pluginData`/`taskData`/`objectData`）**是同族但不同的一批**（后者是载荷容器、前者是样式容器）⇒ 线上至少 **8 个字段是 JSON 字符串**。
- ★ **`subBlocks: []` 在此恒空** ⇒ §一之二十六 4 里 TVe 的"剥子块"其实是 `m0e` 直接完成的。
- 本地对照：`grep -rn "parentBlock\|styleAttributes" src` ⇒ **0**；本地 `JSON.stringify` 只在**导出分支**（`src/lib/document-codec/index.ts:216` `if (format === 'json') return JSON.stringify(document, null, 2)`）⇒ **字段级四容器序列化层本地没有**。

### 2. ★ `J7(t)` ＝ **递归剥空**（"缺省即键缺失"的工具层实现）

```js
function J7(t) {
  if (Array.isArray(t)) return t.map(e => e && typeof e === "object" ? J7(e) : e).filter(e => e != null);
  return Object.entries(t)
    .map(([k, v]) => [k, v && typeof v === "object" ? J7(v) : v])
    .reduce((acc, [k, v]) => { if (v != null) acc[k] = v; return acc; }, {});
}
```

- ⇒ ★ **对象键值为 null/undefined ⇒ 删键；数组里 null 元素 ⇒ 删元素；递归到叶子** ⇒ §一之十六 2 的"缺省即键缺失"**在工具层的实现**；`gQ(t) = J7(t)` 用于 `lineThemeStyle` / `themeInstanceProps` **写前清洗**。
- ⇒ 与 `Is`（有值才映射）、`gr`（相等则省）、`kR`（任一 null 整批弃）、`bt`/`Gn`/`_u`（过滤族）并列 ⇒ **官方"写前清洗"工具层至此五件齐**。
- 本地对照：`grep -rn "recursive\|deep.*null" src/lib/document-codec` ⇒ **0** ⇒ 本地无递归剥空（写入什么原样什么）。

### 3. ★★ **scheme 从两个变成四个，且 `day://` 读入闭环到手**

```js
const _w = ["tex://", "day://", "craftdocs://users"], Cg = _w[0], zu = _w[1], _5 = _w[2];
function qZe(t) { return `day://${t}`; }                        // 构造
function yw(t)  { return TU(t.replace("day://", "")); }          // ★ 读入：去前缀 → 严格解析器 TU
… return e != null && e.protocol === "day:";                     // 协议判定（`URL` 实例的 protocol）
function pk(t, e) { return Math.abs(cLe(t, e) …                   // 日期距离
```

- ⇒ ★★ **权威 scheme 清单是四个**：**`tex://`**（公式/数学）、**`day://`**（每日笔记深链）、**`craftdocs://users`**（用户级文档路径）、**`craft://`**（i18n 文案里 `craft://credit` 等内部链接）⇒ 此前 `contract.json` 只记到 `craft://`/`craftdocs://` **两个** ⇒ **本批补齐 `tex://` 与 `craftdocs://users` 两个**。
- ★ **`day://` 完整闭环**：`protocol==="day:"` 判定 → `qZe(t)` 构造 `day://<字符串>` → **`yw(t)` 去前缀并喂给严格解析器 `TU`** ⇒ **深链生成（`e1e`）↔ 解析（`yw`→`TU`）两端都在**。
- ★ **i18n 文案里含内部 scheme 链接**（如 `[balance](craft://credit)` 出现在 `assistant.*` 的值里）⇒ **营销/提示文案可触发内部深链**（本地化串是"可执行"的入口，属采集提示）。
- 本地对照：`grep -rn "tex://" src` ⇒ 0、`grep -rn "day://" src` ⇒ 0、（`craft://|craftdocs://` 第 56 批已 0）⇒ **四个 scheme 本地全无**。

## 仍未采到（模型面·第 57 批）

- **`tex://` 与 `craftdocs://users` 的构造点与读入点**：★ **判定消费方已到手（第 58 批 §一之二十八 3）** —— `sGe(t)` 用 `_w.some(n => t.linkURL.startsWith(n))` 在**富文本 run 的 `linkURL` 组装**处把三前缀判为内部深链；★ 仍开：**`tex://` 的渲染（公式块？）与 `craftdocs://users` 的路由读入**、`Cg`/`_5` 的具名调用点。
- ~~`m0e` 的完整字段表~~ **第 58 批结案（§一之二十八 1）**：共 **11 个字段线上是 `JSON.stringify`**（样式四 + 载荷三 + **`resourceId`/`stamp`/`blob`**）；★ **`blob` 是 JSON 字符串**（不是二进制）。
- `J7` 的调用方族（除 `gQ` 外还有谁在用）与 `Oy`/`wq`/`g_e`（同窗三个小工具：按下标取、按下标取、判空对象）。
- `cLe`（日期距离）与 `pk` 的用途（差值计算的消费方）。
- `qZe` 的入参 `t` 是日期字符串还是 `Date`（决定构造格式）。

## 一之二十八、★ `m0e` 完整字段表（11 个 JSON 字符串）+ **逐级退出格式的降级链 `lGe`** + scheme 判定（2026-09-27 14:18 结案，`index-DiTmKH3z.js` @546876（`m0e`/`rVe`）+ @624715 起（`sGe`/`ade`/`eh`/`lGe`）；★ 结掉 §一之二十七 的 `m0e` 字段表与 scheme 消费方两条遗留）

### 1. ★★ `m0e` 完整字段表 —— **11 个字段线上是 `JSON.stringify` 的字符串**

```js
function m0e(t) { return {
  id, parentBlock: t.parentId || void 0, type, createdByUserId,
  properties:      JSON.stringify(t.rawProperties || void 0),   // 样式四容器
  pageStyle:       JSON.stringify(t.pageStyle || void 0),
  pageStyleProps:  JSON.stringify(t.pageStyleProps || void 0),
  styleAttributes: JSON.stringify(t.style || void 0),
  content, subBlocks: [], isDeleted, created, updated,
  objectData: JSON.stringify(t.objectData || void 0),           // 载荷三容器
  taskData:   JSON.stringify(t.taskData   || void 0),
  pluginData: JSON.stringify(t.pluginData || void 0),
  resourceId: JSON.stringify(t.resourceId || void 0),           // ★ 也是 JSON 字符串
  stamp:      JSON.stringify(t.stamp      || void 0),           // ★ 也是
  blob:       JSON.stringify(t.blob       || void 0)            // ★ 也是（白板/代码的载荷）
}; }
```

- ⇒ ★★ **JSON 字符串化字段是 11 个不是 8 个**（§一之二十七 1 说"至少 8 个"**已按完整字段表修正**）：样式四 + 载荷三 + **`resourceId`/`stamp`/`blob`**；裸值只有 `id/parentBlock/type/createdByUserId/content/subBlocks/isDeleted/created/updated`。
- ⇒ **`blob` 是 JSON 字符串** ⇒ 与 §一之八「`code` 与 `whiteboard` 存 `blob`」对上（**blob 不是二进制、是 JSON**）。

### 2. ★ `rVe(t, e, n, o)` ＝ `fileBlockToStoredBlock` 反向定型（**缺 id 抛错**）

```js
function rVe(t, e, n, o) {
  if (n == null && (n = t.id ?? t.tempId), n == null)
    throw new Error(`fileBlockToStoredBlock: Unexpected missing block id in ${t}`);
  return { id: n, type: t.type,
    parentId: o ?? t.parentBlock ?? null,                 // ★ 线名 parentBlock → 内存 parentId（第七组反向确认）
    documentId: t.documentId ?? null, createdByUserId: …, modifiedByUserId: …,
    rawProperties: s…                                     // （后续被截断）
  };
}
```

- ⇒ ★ **id 可由 `tempId` 兜底** ⇒ **印证 §一之二十六 4 的"`tempId` 是复制时的旧 id 与新 id 的桥"**。
- ★ **缺 id 直接 `throw`** ⇒ 与"读值宽容、渲染严格"并列的**第三类：结构必填严格**（读值宽容 / 渲染穷尽抛错 / 结构必填抛错）。
- `parentId` 的兜底顺序 `o ?? t.parentBlock ?? null` ⇒ 覆盖 → 线名 → null 三档。

### 3. ★ scheme 判定消费方到手：`sGe`（**内部 scheme 不当外链**）

```js
function sGe(t) { if (t.linkURL == null) return false;
  return _w.some(n => t.linkURL.startsWith(n) ?? false); }   // _w = ["tex://","day://","craftdocs://users"]
```

- ⇒ 消费场景在**富文本 run 组装**里（同窗 `p.linkURL` 出现在 runAttributes 打包处）⇒ **粘贴/生成的链接若以三前缀开头 ⇒ 判为内部深链，不走外链处理**；`Cg`/`zu`/`_5` 是给具体路由用的具名常量（`day://` 的读入已见，`tex://`/`craftdocs://users` 的路由仍未取）。

### 4. ★★★ **`lGe` ＝ 逐级退出格式的降级链**（本轮最重要的交互发现）

```js
function lGe(t, e, n, o, s) {
  if (n == null) return { docActions: [], uiActions: [], redoUiState: null };
  if (o) {                                    // ★ 疑为 Shift+Tab / Esc 类"退一档"
    const m = t[e];
    if (m != null) {
      if (m.styleProps.indentLevel > 0)
        return { docActions: [og([m.id], -1)], … };                    // ① 先减缩进
      if (m.styleProps.listStyle !== Nt.None)
        return { docActions: [ir([m.id], Nt.None)], … };               // ② 再去列表
      if (m.styleProps.decorations.block || m.styleProps.decorations.focus || m.styleProps.color != null)
        return { docActions: [P2([m.id], {block:0, focus:0}), fU([m.id], null)], … };  // ③ 再清 focus/block 装饰与颜色
    }
  }
  …（继续：else 分支与更下层，未读完）
}
```

- ⇒ ★★★ **"退一档"是三段优先级降级链：① 缩进 ② 列表 ③ 装饰与颜色** ⇒ **这是「退一档」三段链的官方实现**（此前只在文案与 V 动态里见过现象，现在拿到优先级与 action 形态）。★ **【第 59 批更正】`o` 为假的分支是 Enter 分割链（§一之二十九 3），故「Esc / Shift+Tab」的触发键归因撤回 —— 降级链事实保留、触发键第 60 批结案＝**Enter 打在空块上**（`o` = `JO(s)` = 块完全为空）；见 `gap.md` G574 / G577。
- ★ **`decorations` 的值是数字**（`{block:0, focus:0}` ⇒ **0/非0 档位**）⇒ 与 §一之二十一 4 的 `{focus?, block?}` 合起来：**装饰是数值档位而非布尔**。
- ★ **返回三元组 `{docActions, uiActions, redoUiState}`** ⇒ **action 的统一返回形态**（与 §十三 的 26 项 action 分派表呼应）：一次按键产生**文档动作 + UI 动作 + 可重做的 UI 状态**。
- ★ 三个 action 形态：`og(ids, -1)` 减缩进、`ir(ids, Nt.None)` 置列表为 none、`P2(ids, {block,focus})` 清装饰 + `fU(ids, null)` 清颜色。
- 本地对照：**① `grep "'Tab'" src/components/editor` 只命中菜单**（`emoji-suggestion.tsx:112`、`slash-menu/SlashCommandExtension.ts:91`）⇒ **正文没有 Tab 缩进键位**（与 G218「普通段落无法缩进」同源）；**② Shift+Tab 只是工具栏按钮**（`tabs/FormatTab.tsx:39/40` `liftListItem`/`sinkListItem('listItem')`）⇒ **只作用于列表、不是键盘、无优先级链**；**③ `grep "'Escape'" src/components/editor` 5 处全是菜单/弹层关闭**（AiBubbleMenu/block-link-menu/math 等）⇒ **没有"逐级清格式"**。

### 5. 同窗的 run 工具（`ade`/`eh`/`yT`/`G5`）—— 贴齐 §一之十九 2 的 run 模型

- `ade(t, e, n=true)`：替换块文本时**把 `start===0` 的 runAttributes 复制并改 `length` 为新文本长度** ⇒ **替换文本时首段 run 的样式保留、长度随之调整**。
- `eh(t, e)`：`t.start >= e.start && t.start+t.length <= e.start+e.length` ⇒ **range 包含判定**（右端点 = `start + length` ⇒ run 语义确认）。
- `yT(t)`/`G5(t)`：`{type:"textSelectionGeom", point}` / `{type:"textSelectionIndexBackwards", index}` ⇒ **选区两形态**（几何点位 / 反向索引）。

## 仍未采到（模型面·第 58 批）

- ~~**`lGe` 的 else 分支与更下层**~~ **第 59 批结案（§一之二十九 3）**：`o` 为假 ⇒ **Enter 分割链**（`rGe` 从索引切开保 `afterRuns`、`aGe` 三情形 + `keepAllIncomingFormat` + 第三种选区 `textSelectionIndex` + 非文本节点 Enter **抛错**）。★ **第 60 批结案：`o` = `JO(s)` =「块完全为空」⇒ 触发键是 Enter**（§一之三十 1）；仍开：`s` 的含义；`aGe` 中间情形体与 `newBlockLocation` 全部取值；`UE` action 全名；`ol`/`G4` uiAction 族；`zy` 新建空块工厂。
- `og`/`ir`/`P2`/`fU` 四个 action 的内部签名与**它们是否在 §十三 的 26 项表里**。
- `rVe` 的 `rawProperties:` 之后的字段（表只读到开头）。
- `tex://` 的渲染（公式块？）与 `craftdocs://users` 的路由读入。
- `yg`/`f4`/`rde`（run 组装与反组装）与 `docActions/uiActions/redoUiState` 三元组的消费方（动作应用器）。

## 一之二十九、★ 15 个 action 构造器 + **复制链三方闭环** + **更正 `lGe` 的触发键归因**（2026-09-27 14:27 结案，`index-DiTmKH3z.js` @84192 / @85190 / @85532 + `lGe` 尾部；★ 结掉 §一之二十八 的 `og`/`ir`/`P2`/`fU` 签名与"`o` 为假走什么"两条遗留）

### 1. ★ **15 个 action 构造器（字段即协议）**

| 构造器 | action 形态 | 要点 |
|---|---|---|
`og(t,e)` | `{type:"indentBlocks", blockIds:t, delta:e}` | ★ **± delta**，不是绝对值 |
`IC(t,e)` | `{type:"setIndentation", blockId, indentLevel}` | 单块绝对值 |
`ir(t,e,n)` | `{type:"setListStyle", blockIds, listStyle, userDefinedOrdinalOfFirst: n ?? null}` | ★ **手动列表编号在 action 层**（对上 `userDefinedListNumber` 写入端） |
`P2(t,e)` | `{type:"setDecorStyle", blockIds, decorations}` | ★ 名是 **`setDecorStyle`**（不是 setDecorations） |
`u5(t,e)` | `{type:"setLayoutStyle", blockIds, layoutStyle}` | |
`f5(t,e,n)` | `{type:"setTodoState", blockId, todoState, fallbackIfAlreadySet: n\|\|e}` | ★ **`fallbackIfAlreadySet` 确认在 action 层**（§一之十七 2 的写入端） |
`fU(t,e)` | `{type:"setBlockColor", blockIds, color}` | |
`sa(t,e,n)` | `{type:"updateTextBlock", blockId, textContent, runAttributes}` | ★ 文本与 run **一起更新** |
`bRe(t,e,n)` | `{type:"updateCodeBlock", blockId, textContent, language}` | |
`DR(t,e,n,o)` | `{type:"updateSmartLinkBlock", blockId, smartLinkData, lastSyn…}` | |
`sg(t,e,n)` | `{type:"duplicateSubtree", blockIds, insertlocation, idMapping}` | ★★ **复制子树带 `idMapping`** |
`mw(t,e,n)` | `{type:"setMediaUploaded", blockId, url, previewUrl}` | |
`yRe(t)` | `{type:"setCoverImageUploaded", ...t}` | |
`Dce(t,e)` | `{type:"setPluginData", blockIds, pluginData}` | |
`UE(t,e)` | `{type:"setCo…`（截断，疑 `setContent`/`setObjectData`） | 未读全 |

⇒ 与 §十三 的"**26 项 action 分派表**"对上：本批直接读到 **15 项**（含构造器与字段）⇒ **action 是协议级对象**（`{type, blockIds…}`）⇒ 与 §一之二十八 4 的 `{docActions, uiActions, redoUiState}` 返回形态衔接。

### 2. ★★ **复制链三方闭环**（`TVe` → `m0e` → `duplicateSubtree` → `rVe`）

```
TVe(遍历，depth:"all", includeRoot:true)
  → YU(l)（默认档全量）→ m0e（剥 subBlocks=[]、id→tempId）
  → duplicateSubtree {blockIds, insertlocation, idMapping}   ← action 层带映射表
  → rVe（读入反向：n = t.id ?? t.tempId，缺则 throw）
```

⇒ ★ **`idMapping` 是 action 的显式入参** ⇒ **id 重分配在 action 层完成**，`tempId`/`idMapping` 两处印证同一设计 ⇒ §一之二十六 4 与 §一之二十八 2 的两条推断**在此合龙**。

### 3. ★★ **【第 59 批更正】`lGe` 不是 Shift+Tab —— `o` 为假的分支是 Enter 分割链**

```js
// o 为真（上一批已读）：三段退格式链 …
// o 为假（本批读到）：
… (u, [c], t, s, "keepAllIncomingFormat"),            // ★ 格式保留模式字符串
p = { type: "textSelectionIndex", index: 0 },          // ★ 第三种选区形态
h = [ ol({ blockId: d === "after" ? i : r.id, initSelection: d === "after" ? void 0 : p }) ];
return { docActions: f, uiActions: h, redoUiState: G4(i, p) };

function rGe(t, e) { const { afterRuns } = $8(t.runAttributes, e);
  return { textContent: t.textContent.slice(e), runAttributes: afterRuns }; }   // ★ 从索引切开，run 保留后半
function aGe(t, e, n) {                                  // ★ Enter 的三种情形
  if (t.textContent == null) { const o = "Invalid state: Enter is pressed in non-text node";
    throw pe.logger().error("getUpdatedTextBlocksFromEnterPress", o), Error(o); }   // ★ 非文本节点按 Enter **抛错**
  if (e.start === 0)  return { existingBlock: o(保留), newBlock: zy(…,{textContent:"",runAttributes:[]}), newBlockLocation: "before" };   // 光标在首 ⇒ 空块在前
  if (e.end === t.textContent.length) …newBlockLocation 后半情形…                 // 光标在末 ⇒ 空块在后
  … (中间 ⇒ 左右都切，被截断)
}
```

- ⇒ ★★ **`lGe` 的两条分支**：**`o` 真 ⇒ 三段退格式链**（缩进→列表→装饰颜色，上批事实**保留**）、**`o` 假 ⇒ Enter 分割链** ⇒ 因此 §一之二十八 4 / `gap.md` **G570 里「疑为 Shift+Tab / Esc 类退一档」的归因撤回**（降级链本身成立；★ **第 60 批结案：调用方是 `mo(oo)`＝Enter，`o` = `JO(s)` =「块完全为空」⇒ 触发键就是 Enter**，见 §一之三十 1 / G577）。
- ⇒ **Enter 三条硬事实**：① 格式保留模式字符串 **`keepAllIncomingFormat`**（写入 action 第 5 参）；② **第三种选区形态 `{type:"textSelectionIndex", index}`**（前两种是几何点与反向索引）；③ ★ **非文本节点按 Enter 直接 throw**（`getUpdatedTextBlocksFromEnterPress`）⇒ 官方**第四类严格**（状态必填/非法状态抛错）。
- ⇒ **run 分割工具 `$8(runs, index)` → `{beforeRuns, afterRuns}`** ⇒ Enter 切块时**run 随索引一分为二**（`rGe` 取后半）。
- 本地对照：`grep -rn "keepAllIncomingFormat\|beforeRuns\|afterRuns" src` ⇒ **0**、`grep -rn "non-text\|Enter is pressed" src` ⇒ **0**；本地 `'Enter'` 在 `Editor.tsx`/`extensions/*` 只 **3 处** ⇒ **Enter 分割是 TipTap 默认行为，本地没有"三情形 + 格式保留模式 + run 切分"这套显式实现**。

## 仍未采到（模型面·第 59 批）

- `aGe` 第三种情形（光标在中间 ⇒ 左右都切）的完整体与 `newBlockLocation` 的全部取值（已见 `"before"`，其余未取）。
- `UE` action 的 `type` 全名；`ol`（uiAction 的"聚焦块+选区"）与 `G4`（redoUiState 生成器）。
- `n3`/`ol` 之外的 uiAction 构造器族（`h` 数组里的项）。
- `ke`/`zy`（新建空块的工厂，`zy(t,n,{textContent:"",runAttributes:[]})` ⇒ 复用原块样式？未展开）。

## 一之三十、★★ **`lGe` 触发键结案 ＝ Enter 打在空块上** ＋ **`Dsn` Backspace 六段链** ＋ 键位注册表与包装器解码（2026-09-28 00:24 结案，`index-DiTmKH3z.js` @3646570 `Esn` / @3646846 `Dsn` / @984987 `JO` / @706380 `sm` / @995136 `Wc`+`Jm` / @3654478 `Usn`+`z9e`+`rF` / @85022 `Ece` / @19502 键名常量表 / @16804–18263 包装器族；★ 结掉 §一之二十九 的头号遗留「`o` 的真名」）

### 1. ★★★ `lGe(t,e,n,o,s)` 的 `o` ＝ `JO(s)` ＝ **块是否为空** ⇒ **降级链的触发键是 Enter**

```js
function Esn(t,e,n,o,s,i,l){                      // ← mo(oo)="Enter" 的 handler 尾巴
  if (i.selection == null) return;
  const r = mc(s, i.selection),
        {docActions: c, uiActions: d, redoUiState: u} = lGe(t, e, r, JO(s), l),   // ★ o = JO(s)
        f = vo.isRange(i.selection) ? Yn(Xm(s, i.selection), p => G4(e, p)) : null;  // ★ 只有选区是 range 才有 undo 副作用
  c.length > 0 && n(c, {undoSideEffect: f, redoSideEffect: u});
  d.length > 0 && o(d);
}
function JO(t){                                    // t = Slate 节点数组（当前路径上的节点）
  if (t.length === 0) throw new Error("Invalid slate state, empty slate nodes");    // ★ 第二处「非法状态抛错」
  if (t.length > 1) return false;                  // 多节点路径 ⇒ 不算空
  for (const e of t) { const n = LD(e);
    for (const o of n) if (_c.isText(o)) { if (o.text.length > 0) return false }     // 有任何文本 ⇒ 非空
    else switch (o.type) {
      case "paragraph": pe.logger().warn("UnexpectedCodePath", "encountered nested paragraph element"); break;  // ★ 渲染层「不该出现」走 warn
      case "math": case "day": case "mention": if (o.elementContent.length > 0) return false; break;            // ★ 原子内联看 elementContent
      case "tag"… （截断）
```

⇒ 五条决定复刻的事实：① ★★★ **`o` 真 ＝ "当前块完全为空"（文本长度 0 且原子元素 `elementContent` 为空）⇒ 走三段降级链；`o` 假 ⇒ 走正常 Enter 分割链**（§一之二十九 3 的 Enter 分割事实保留）。⇒ **G570 的触发键归因为「Enter」结案**，`Esc` 与 `Shift+Tab` **两个猜测都不对**（G574 就地更正）。② ★★ **`lGe` 的 `n`（＝ `mc` 出的 `{start,end}`）只判 `== null`、不参与任何分支** ⇒ 对比 `Dsn` 明查 `f.start !== 0 || f.end !== 0` ⇒ **Enter 链不看光标位置（空块时位置无意义），Backspace 链必须在 offset 0** —— 两条链的守卫强度不同是有意设计。③ ★ **原子内联元素的权威词表 = `math` / `day` / `mention` / `tag`**（都带 `elementContent`）⇒ 此前只能从 i18n 与 slash 菜单反推，现在有代码级枚举。④ ★ **严格性再分一层**：状态层「不该出现」`throw`（本行 + `aGe` 的 Enter-in-non-text）、渲染层「不该出现但能画」`warn("UnexpectedCodePath")` ⇒ **与 §一之十八 / §一之二十八 的四类严格并成同一谱系**。⑤ `vo.isRange(selection)` 才生成 `undoSideEffect` ⇒ **折叠选区的 Enter 不写 undo 副作用**（与 V46「撤销粒度是产品决策」衔接）。

### 2. ★★ **`Dsn` ＝ Backspace 的六段链**（`mo(nc)`，与 `lGe` 前三段**同族但顺序相反**）

```js
function Dsn(t,e,n,o,s,i,l,r){
  const c = {preventDefault: !1};
  if (r.selection == null) return;
  const d = () => { …const y = Xm(l, r.selection); const C = t()?.id; return C == null ? null : G4(C, y) };  // undo 副作用生成器
  const u = Wc(r) != null,                            // ★ 光标在原子内联元素内部
        f = mc(l, r.selection);
  if (u || f == null || f.start !== 0 || f.end !== 0) return c;   // ★★ 必须 collapsed 且 offset 0
  const p = t(); if (p == null) return c;
  if (p.styleProps.listStyle !== Nt.None) { s(ir([p.id], Nt.None)); return }              // ① 先去**列表**
  if (p.styleProps.indentLevel > 0)       { s(og([p.id], -1)); return }                   // ② 再去**缩进**
  if (p.styleProps.decorations.block || p.styleProps.decorations.focus || p.styleProps.color != null)
      { s([P2([p.id], {block:0, focus:0}), fU([p.id], null)]); return }                    // ③ 再清装饰与颜色
  const h = Usn(p.id, e, n);                                                              // ④ 取**前一个块**
  if (h == null) { Qr(p) && (s(Es([p.id])), i(St(Et.blocks([])))); return }                //    无前置 ⇒ 本块为空则删自己 + 清空选区
  if (Qr(h)) { s(Es([h.id])); return }                                                    // ⑤ 前块是空文本块 ⇒ **删前块**
  const m = rF(h), g = z9e(p);
  if (m) { const y = Sr(l), C = G4(h.id, {type:"textSelectionIndex", index: h.textContent?.length ?? -1});
      s(Ece(h.id, p.id), {undoSideEffect: d(), redoSideEffect: C}),                        // ⑥ ★ mergeTextBlocks
      i(ol({blockId: h.id, initSelection: G5(y.length)})); return }                        //    ★ 光标落到上块末尾
  if (!m && g) { s(Es([p.id])), i(St(Et.blocks([h.id]))); return }                         //    非文本块且本块空 ⇒ 删自己并选中前块
  return c
}
```

- 辅助函数全部定名：`Usn(id, orderedIds, map)` = **前一个块**（`indexOf < 1 ⇒ null`）；`Qr(t)` = `Xe.Text && (textContent==null||"") && subblocks.length===0` ＝ **空文本块**；`z9e(t)` = 文本空且无子块（**不带类型判定**）；`rF(t)` = `jn(t)===Xe.Text`；`$sn(t)` = 有子块；`Wc`/`Jm` = 折叠选区且 `anchor.path.length>1` 且父节点 `type ∈ {math, day, mention, tag}` ⇒ **返回该原子元素**；`Ece(a,b)` = **`{type:"mergeTextBlocks", blockId1, blockId2}`**；`G5(i)` = `{type:"textSelectionIndexBackwards", index:i}`。
- ⇒ ★★ **官方 Backspace 是六段优先级链，前三段与 Enter 的降级链同族但顺序相反**（`lGe`：**缩进→列表→装饰**；`Dsn`：**列表→缩进→装饰**）⇒ 这是**官方自身的不一致点**，本地复刻必须先选一个口径并写明（不能"两边都学"）。
- ⇒ ★ **后三段是"删除/合并"决策**：无前置块 ⇒ 空块删自己；前块为空 ⇒ 删前块；前块是文本 ⇒ **`mergeTextBlocks` 并把光标送到上块末尾**；前块非文本且本块空 ⇒ 删自己并把选中集落在前块 ⇒ **四类落点，本地一条都没有**。

### 3. ★ **`sm`（Tab 缩进）整批含缩进子树，与降级链的 `og([单块])` 作用域不同**

```js
function Qte(t,e,n,o){ n(sm([t], e, o)) }                                   // mo(f1)=Tab ⇒ +1；qi(f1)=Shift+Tab ⇒ -1
function sm(t,e,n){ const o = new Set(t);
  for (const s of t) { const i = e[s];
    i != null && i.styleProps.indentLevel + n >= 0
      && Ft.getIndentChildrenOfBlock(e, s).forEach(l => o.add(l)) }          // ★★ 连**缩进子块**一起
  return og(Array.from(o), n) }
```
⇒ ★ Tab/Shift+Tab 走 `sm`（**收集本块 + `getIndentChildrenOfBlock` 的全部缩进子块 ⇒ 整批 ±1，且 `indentLevel + delta >= 0` 才纳入 ⇒ 减到 0 自然停**），Enter/Backspace 的降级链走 `og([m.id], -1)`（**只动单块**）⇒ **「缩进」有两个不同作用域的入口**，本地若只做一个必然错。

### 4. ★ **键位常量表与包装器族解码**（`@19502` / `@16804–18263`）

```js
const qs="Escape", oo="Enter", B4="Delete", vd=" ", nc="Backspace", f1="Tab",
      ms="ArrowDown", Ts="ArrowUp", Vl="ArrowLeft", Il="ArrowRight",
      XM="Home", JM="End", uEe="Meta", fEe="Control", Sae="Shift",
      pEe={[vd]:"space",[ms]:"↓",[Ts]:"↑",[Vl]:"←",[Il]:"→", …}             // ★ code→显示字形表
// 归一：t.startsWith("Key") ? t.substr(3) : pEe[t]
mo(t)={meta:0,shift:0,alt:0,ctrl:0}   qi(t)={shift:1}   y2(t)={alt:1}   Co(t)={meta:1}
eT(t)={shift:1,alt:1, winMatcher:{…}}   Vn(t)={只给 keyCondition ⇒ 不限修饰键}
```
⇒ 注册表实测解码：`mo(f1)` Tab ⇒ `Qte(…,+1)`｜`qi(f1)` Shift+Tab ⇒ `-1`｜`mo(oo)` **Enter ⇒ `Esn`/`lGe`**｜`qi(oo)` Shift+Enter ⇒ `N9e`（**函数体只有 `return{preventDefault:!1}` ⇒ 空实现，软换行交给默认行为**）｜`mo(nc)` **Backspace ⇒ `Dsn`**｜`mo(B4)` Delete ⇒ `jsn`｜`mo(ms)` ↓ `Rsn`｜`qi(ms)`/`eT(ms)` ⇒ `PP`｜`y2(Ts)` Alt+↑ ⇒ `Xte(…, {skipDirection:"prev", shouldSkipFromEdgeOfBlock:true})`。⇒ ★ **§十四 的 UIFocusStack 包装器族有了具体名与语义**（`mo/qi/y2/Co/eT/Vn` ＝ 修饰键组合的六种预设，`eT` 带 `winMatcher` 印证平台双写），且 ★ **`pEe` 字形表结案**（遗留项"pEe 字形从语言包"改为：就在主包 @19502，`space/↑/↓/←/→` 等，`Key*` 走 `substr(3)`）。

### 5. 本地对照（本轮实跑）

- `grep -rn "'Enter'|'Backspace'" src/components/editor src/extensions` ⇒ Enter 6 处**全是菜单/对话框**（`block-link-menu.tsx:127`、`emoji-suggestion.tsx:112`、`math-inline-view.tsx:21`、`PageStylePanel.tsx:138`、`SlashCommandExtension.ts:91`、`MembersSection.tsx:149`），**Backspace 0 处** ⇒ **Enter-空块降级链与 Backspace 六段链在本地整块不存在**，块级删除/合并完全交给 TipTap 默认 `joinBackward`/`splitBlock`。
- `grep -rni "mergeTextBlock|mergeBlocks|joinBackward" src` ⇒ **0** ⇒ 官方 `mergeTextBlocks{blockId1, blockId2}` 无对应协议对象（与 G572 的「本地动作是直接改 Prisma、无可重放 action」同源）。
- `grep -rn "name: '…'" src/components/editor/extensions/*` 得本地节点全集 32 个（`attachment/blockLink/callout/columns/divider/drawing/imageBlock/inlineMath/mathBlock/mention/tableOfContents/toggleBlock/whiteboardEmbed/…`）⇒ **原子内联四类里本地只有 `mention` 与 `inlineMath`/`mathBlock`，缺 `day`（每日笔记日期原子）与 `tag`（标签原子）**；⇒ 连带来看，`JO`/`Jm` 对这两类的特殊处理在本地无从复现。
- 缩进入口：`FormatTab.tsx:39/40` 是 `liftListItem('listItem')` / `sinkListItem('listItem')` 工具栏按钮 ⇒ **① 无 Tab/Shift+Tab 键位（与 G218 一致）②`listItem` 作用域只动一项 ⇒ 无「连缩进子树整批 ±1」语义**。

## 仍未采到（模型面·第 60 批）

- `JO` 的 `case "tag"` 之后与 `default` 分支、以及函数尾部（`elementContent` 之外的判据）。
- `Dsn` 第 6 段 `Ece(h.id, p.id)` 的**应用器**（两个块的文本与 run 具体怎么并、样式谁赢）。
- `jsn`（Delete 键）与 `Rsn`/`PP`/`Xte`（方向键族）的函数体；`_sn`/`Es`/`St`/`Et.blocks` 的 uiAction 全名。
- `lGe` 的 `s`（第 5 参，透传进 `aGe`）到底是什么（场景枚举还是"新建块位置"）。
- `zy` 新建空块工厂；`UE` action 全名；`n3` 之外的 uiAction 族。
- 菜单/对话框内 Enter 的注册表（本表是**正文编辑器**的，弹层另有一套）。

## 一之三十一、★★★★ **88 项 action 应用器分派表**（此前只记到 26 项）＋ **只读模式白名单＝viewer 权限实现体** ＋ `mergeTextBlocks` 合并全规则（2026-09-28 00:29 结案，`index-DiTmKH3z.js` @731623 `PT` / @735529 `pYe`+`fYe` / @753390 `KYe` / @731500 `x0`）

### 1. ★★★★ **`PT(t,e,n)` 是 88 个 `case` 的完整 action 协议表**（`default: He(e)`）

按域分组（左边是 action `type`，右边是应用器名）：

| 域 | action type |
|---|---|
| 文档 | `createNewDocument`→hYe｜`createNewDailyDocument`→mYe｜`loadDocument`→gYe｜`importSnapshotsToDocument`→jYe |
| 块结构 | `addStoredBlocks`→pD｜`moveBlocks`→bYe｜`deleteBlocks`→JC｜`indentBlocks`→yYe｜`setIndentation`→CYe｜`insertNewBlocks`→O2e｜`insertNewBlocksToTable`→WYe｜`insertNewBlocksToObjectList`→VYe｜`mergeTextBlocks`→KYe｜`duplicateSubtree`→fXe |
| 块内容 | `updateTextBlock`→xYe｜`updateCodeBlock`→wYe｜`updateSmartLinkBlock`→SYe｜`updateBlobBlockContent`→rJe｜`addBlobBlockAsset`→aJe｜`bulkAddBlobBlockAssets`→cJe｜`removeBlobBlockAsset`→dJe｜`updateBlobBlockMeta`→uJe |
| 块样式 | `setTextStyle`→qYe｜`setListStyle`→YYe｜`setImageStyle`→QYe｜`setDecorStyle`→XYe｜`setLayoutStyle`→JYe｜`setBlockColor`→nXe｜`setLineType`→dXe｜`setBlockThemeInstanceProps`→aXe |
| 页面样式 | `setPageStyle`→lXe｜`setPageBackground`→oXe｜`setPageFontStyle`→sXe｜`setPageParagraphSpacingType`→iXe｜`setPageStylePreset`→cXe |
| 任务 | `updateTaskData`→oJe｜`setTaskSchedule`→sJe｜`setTaskDeadline`→iJe｜`setTaskRepeatConfig`→lJe｜`setTodoState`→eXe |
| 集合/记录 | `updateRecordObject`→JXe｜`updateRecordObjectProperty`→eJe｜`removeRecordObjectProperties`→tJe｜`updateObjectListData`→nJe｜`insertMetaObject`→P$ |
| **表格（18 项，最大一域）** | `addRowToTable`｜`addColumnToTable`｜`deleteRowFromTable`｜`deleteColumnFromTable`｜`moveColumnAction`｜`moveRowAction`｜`addCellToTableAction`｜`deleteCellFromTable`｜`addTextBlockToTableAction`｜`deleteTextBlockFromTableAction`｜`updateCellStyle`｜`updateAlternatingRowColor`｜`updateRowHeader`｜`updateColumnHeader`｜`updateColumnMetaData`｜`clearCellContents`｜`clearCellContentsByCoordinate`｜`setRowsOrder` |
| **评论（8 项）** | `addPendingComment`｜`updateComment`｜`deleteComment`｜`deleteThread`｜`setCommentResolved`｜**`deleteCommentResolved`**｜`setCommentState`｜`syncUpdateComments` |
| 链接 | `insertBlockLink`→V2e｜`syncDeleteBlockLinks`→xXe｜`syncUpdateBlockLinks`→kXe |
| 封面/媒体 | `setMediaUploaded`→pXe｜`setCoverImage`→gXe｜`toggleCoverImageEnabled`→bXe｜`setCoverImageUploaded`→hXe |
| 分享 | `updateShare`→yXe｜`deleteShare`→CXe｜`replaceSharesForDocument`→vXe |
| 历史/协同 | `undo`→IXe｜`redo`→TXe｜`mergePatchesFromOtherTabs`→fJe｜`syncUpdateContributors`→SXe |
| 其它 | `setUrlModel`→AXe｜`setBlockModel`→EXe｜`setPluginData`→mXe |

- ⇒ ★ **§十三 的"26 项 action 分派表"是低估**：真实规模 **88 项**（`case"…"return f(` 正则精确计数），⇒ **action 协议是本地完全没有的一整层**（G572/G577 已证本地动作直改数据库）。
- ⇒ ★ **`default: He(e)`** ⇒ 未知 action 类型走 §一之十六 的**渲染穷尽抛错**家族 ⇒ **穷尽性检查的又一处**（第五处）⇒ 官方对"协议外类型"零容忍。
- ⇒ ★ **表格域 18 项、评论域 8 项**是此前 gap 表里最薄的两块，现在有了权威操作名单（评论含 `setCommentResolved` 与**独立**的 `deleteCommentResolved` ⇒ "已解决"是可单独删除的状态，不是布尔翻转）。

### 2. ★★★ **`pYe` ＋ `fYe` ＝ 只读模式下的 action 白名单 ⇒ viewer 权限的客户端实现体**

```js
const fYe = new Set(["loadDocument","addStoredBlocks","syncUpdateComments","addPendingComment",
                     "setCommentResolved","setCommentState","syncUpdateContributors","updateRecordObjectProperty"]);
function pYe(t,e,n){ return fYe.has(e.type) ? PT(t,e,n)
  : (console.warn("Tried to update document store in readonly mode", e), pe.logger().warn("UnexpectedRe…")) }
```
- ⇒ ★★★ **只读态下只有 8 类 action 能进 store**：文档加载两项 + **评论四项**（`syncUpdateComments`/`addPendingComment`/`setCommentResolved`/`setCommentState`）+ `syncUpdateContributors` + **`updateRecordObjectProperty`** ⇒ **viewer 可以评论、可以看协同者变化、可以改集合记录的单个属性，但不能改块本体** ⇒ 这是"权限档 × 操作"矩阵的**权威白名单**（此前只能从 i18n 文案与按钮禁用反推）。
- ⇒ ★ **越权 action 的处理是 `warn` 而不是 `throw`**（同时 `console.warn` 与埋点 logger）⇒ **客户端权限守卫是"防误操作"而非"防攻击"**（真正的强制必然在服务端）⇒ 本地复刻时应同样：UI 层 warn + 拒绝，服务端仍要独立校验。
- ⇒ ★ **`updateRecordObjectProperty` 在白名单里**（唯一进入只读集的写操作）⇒ **集合的属性格在只读文档里仍可编辑**，与 §一之十四 的集合单元格编辑器族呼应，属**权限矩阵的非直觉格子**。

### 3. ★★ **`KYe` ＝ `mergeTextBlocks` 应用器：合并方向、样式胜负、run 拼接、三类静默 no-op**

```js
function KYe(t,e,n){
  const o = t.blocks[e.blockId1], s = t.blocks[e.blockId2];
  if (o == null || s == null) return pe.logger().error("InconsistentDocument",
      `executeMergeTextWithPrevious called with missing block, blockId1: ${e.blockId1} blockId2: ${e.blockId2}`), Cn(t);  // ★ 日志露出内部名
  if (o.textContent == null || s.textContent == null) return Cn(t);                       // 任一侧非文本 ⇒ no-op
  if (s.parentId != null) { const y = t.blocks[s.parentId]; if (y != null && !ex(y)) return Cn(t) }  // 父块不容纳 ⇒ no-op
  const i = f4(yg(o), yg(s)),                                                             // ★ run 拼接：两侧先 yg 归一，再 f4 合并
        l = (y, C) =>
            y.textContent == null || (C.subblocks.length > 0 && y.subblocks.length === 0) ? C.styleProps   // ①② 后块赢
          : (y.textContent.length > 0 || y.styleProps.listStyle !== Nt.None || y.subblocks.length > 0) ? y.styleProps : C.styleProps,  // ③ 前块赢 ④ 后块赢
        r = { ...o, textContent: i.textContent, styleProps: { ...l(o, s), runAttributes: i.runAttributes } };
  const { store: c, patches: d, inversePatches: u } = Po(t, [r], n, [], []);              // ★ Po = 应用器公共入口（immer）
```
- ⇒ ★★ **合并方向**：结果写回 `blockId1`（前块），后块内容并入；配合 `Dsn` 的 redo 选区 `{type:"textSelectionIndex", index: 前块文本长度}` ⇒ **光标停在拼接点**。
- ⇒ ★★★ **样式胜负四条判定**（决定"Backspace 合并后这一行是什么样式"）：① 前块 `textContent == null` ⇒ 用**后块**样式；② **后块有子块且前块无子块** ⇒ 后块样式；③ 前块有文本 **或** 前块是列表项 **或** 前块有子块 ⇒ **前块样式**；④ 其余 ⇒ 后块样式。⇒ 本地 `joinBackward` 完全把这条交给 ProseMirror，**没有任何一条对得上**。
- ⇒ ★ **run 拼接是两步**：`yg(块)` 归一 → `f4(a,b)` 合并 ⇒ 与 §一之十九 的 run 模型衔接（run 不是简单数组 concat）。
- ⇒ ★ **三类静默 no-op（`Cn(t)`）+ `error` 日志**：缺块、非文本、父块不容纳 ⇒ 对比 `default: He(e)` 的抛错 ⇒ **严格性再分一层：协议外类型抛错、已知 action 的非法数据静默降级**（"契约层严格 / 数据层宽容"的又一例）。
- ⇒ ★ **寻宝法复用**：内部函数名 `executeMergeTextWithPrevious` 从**日志字符串**里漏出（同法此前从 `tab.dev.logs` 拿到 Amplitude 事件名）⇒ **日志与埋点字符串是恢复 minified 真名的第三词典**。

### 4. ★★ **`x0` ＝ patch 组合规则 ⇒ 撤销栈的实现体**

```js
function x0(t,e){ return { store: e.store,
  patches: [...t.patches, ...e.patches],
  inversePatches: [...e.inversePatches, ...t.inversePatches] } }   // ★ 注意逆补丁顺序**反转**
```
⇒ ★ **正向补丁顺序拼接、逆向补丁前置拼接** ⇒ 撤销按 LIFO 生效的**唯一实现处**；配合 `undo`→`IXe` / `redo`→`TXe` / **`mergePatchesFromOtherTabs`→fJe** ⇒ **官方有跨标签页的补丁合并动作**（同一浏览器多开一页时的本地态合并），这是本地 IndexeddbPersistence 方案里没有的概念。

### 5. 本地对照（本轮实跑）

- `grep -rni "readonly|canEdit|'viewer'" src` ⇒ 本地权限在 **server action 边界**：`src/actions/comment/comment.ts:11` 的 `need: 'viewer'|'commenter'|'editor'`、`requireDocumentAccess(documentId, userId, 'viewer')`（`backlinks.ts:49`、`export.ts:27`、`favorite.ts:9/:32`）、`members.ts:6` 的 `MemberRole` ⇒ **档位名与官方一致，但只在请求侧校验，store 层没有 `fYe` 式白名单**；**编辑器在 viewer 下是否禁用输入本轮未核**（不写成结论）。
- `grep -rn "inversePatches|patches\b" src/lib src/stores` ⇒ **0**（唯一命中是 `block-anchor.ts:144` 的 `history.replaceState`）⇒ **本地没有 patch 级撤销栈**，撤销完全交给 ProseMirror history ⇒ 无法实现"按 action 撤销/重做"和跨标签页补丁合并。

## 仍未采到（模型面·第 61 批）

- `fYe` 只读白名单里 `updateRecordObjectProperty` 的确切语义（只读集合属性格能改什么）。
- `Po(t, [r], n, [], [])` 的形参含义（后两个空数组是什么）与应用器统一返回形态。
- `ex(y)`（父块是否容纳合并）、`Cn(t)`、`yg`/`f4` 的函数体。
- 88 项里除 `KYe` 外的全部应用器实现体（本批只拿到名单与 `mergeTextBlocks` 一个）。
- `undo`→`IXe` / `redo`→`TXe` / `mergePatchesFromOtherTabs`→fJe 的函数体（撤销栈深度、合并策略）。
- 评论 8 项与表格 18 项 action 的字段形态（本批只有 `type` 与应用器名）。

## 一之三十二、★★★★ **261 个 action 构造器全表（字段即契约）**：权限四维、选区九形态、落点九族、拖拽与编辑生命周期都是 action（2026-09-28 00:36 结案，`index-DiTmKH3z.js` 全文正则 `function NAME(args){return{type:"T",…}}` 扫描；★ 补齐 §一之三十一 的 88 项之外的全部层）

### 1. ★★★★ 规模与口径

- **261 个 type / 267 个构造点**（字面量 `return{type:"…"}` 形态）。⇒ 这是 §一之三十一 `PT` 那 **88 项文档 store action 的超集**：余下 173 项属于 UI store、协同、通知、空间/团队、任务视图、公式输入等。⇒ **官方整个前端是"一切变化皆 action"**，与 G572/G583 的"本地直改数据库"构成最根本的架构差。
- ★ **口径说明（防误读）**：fields 列为 `{}` 的构造器是 **`{type:"X", ...t}` 展开式**（例：`ss(t)` 实为 `{type:"setTextStyle", ...t}`，@85022 直读过），**不是"无字段"**；展开式的真实字段在调用方，本批未逐个回读。

### 2. ★★★ **权限的权威契约是"三键 + 两上下文"**

```js
setDocumentAccess        <-ZR(t,e,n,o,s) {documentAccess, canView, canComment, canEdit, subscription, sharedBy}
setForcedViewOnlyModeAction <-Vze(t) {isReadOnly}
mention                  <-Xcn(t) {userId, email, name, profileImgUrl, role, documentRole, source}
```
- ⇒ ★ **`canView` / `canComment` / `canEdit` 是三个独立布尔，不是单维角色枚举**；再叠 `subscription`（套餐）与 `sharedBy`（谁分享给我）两个上下文；`@提及` 里同时带 `role` 与 `documentRole` ⇒ **空间角色与文档角色是两层**。
- ⇒ ★★★ **`setForcedViewOnlyModeAction{isReadOnly}` 是独立于角色的第六维** ⇒ 与 §一之三十一 2 的 `pYe` 白名单**互为表里**：一个设"只读态"，一个在只读态里放行 8 类 action。⇒ **官方"viewer"不是一个 role，而是 role × can\* × forcedReadOnly 的乘积**。

### 3. ★★ **选区是九形态判别联合**（此前只知三形态）

`textSelectionGeom{point}`｜`textSelectionIndex{index}`｜`textSelectionIndexBackwards{index}`｜`textSelectionFlatRange{selection}`｜`blockSelection{blocks}`｜`objectListRowSelection{blockIds}`｜`objectListCellSelection{blockId,propertyId}`｜`objectListSelection{listId,sel,type,blockIds}`｜`tableSelection{sel,type,tableId,anchor,focus,cells}`
⇒ ★ **文本 / 块 / 集合行 / 集合格 / 表格 五个域各有自己的选区表示**，`tableSelection` 同时带 `anchor`+`focus`+`cells` ⇒ 表格支持锚点式扩选；`setSelection <-St(t,e=!1,n={}){selection,preventAutoScroll,autoScrollSettings}` ⇒ ★ **选中一个块可以显式关闭自动滚动并传滚动设置**（G578 里 `St(Et.blocks([...]))` 的第三参用途到手）。

### 4. ★★ **落点/插入位置九族，且带边界钳制参数**

`aboveTableRowLocation{tableId,row,maxRow}`｜`belowTableRowLocation{tableId,row,maxRow}`｜`afterTableColumnLocation{tableId,column,maxCol}`｜`beforeTableColumnLocation{tableId,column,maxCol}`｜`afterAnchor{anchorBlockId,parentId}`｜`afterAnchorVisible{anchorBlockId,parentId}`｜`beforeAnchorVisible{anchorBlockId,parentId}`｜`indexInParent{index,parentId}`｜`intoObjectList{objectListId}`
⇒ ★ 表格落点自带 **`maxRow`/`maxCol`** ⇒ **钳制发生在构造时**（调用方必须传入上界），本地若靠应用器 clamp 是另一种形状。⇒ ★ `afterAnchor` 与 `…AnchorVisible` **并存** ⇒ **折叠（toggle）内部块有两套寻址**：按真实兄弟序 vs 按可见序（折叠时不可见 ⇒ 落点不同）。这是折叠块拖拽/粘贴落点的权威区分（§一之十三 的"落点六寻址"要按九族重写）。

### 5. ★★ **拖拽与"进出编辑"本身都是 action 状态机**

```
startSelectionDragging <-Jxe(t,e=null,n) {startPoint, startBlockId, startBlockHasOwnDrag}
updateSelectionDragging <-ewe(t,e=null)   {endPoint, endBlockId}
stopSelectionDragging  <-MG(t)            {removeState}
startTextEdit <-ol(t) {}   stopTextEdit <-Jr(t,e) {allowToBeRemovedWhenEmpty, backupSelection}
startCodeEdit <-Ew(t) {}   stopCodeEdit <-Y0e() {}   toggleBlockEditor <-l3(t,e) {blockId,isOpen}
```
- ⇒ ★ **拖拽三段（start/update/stop）是显式 action**，且 `startBlockHasOwnDrag` ⇒ **块可以自带拖拽行为**（父块与子块各自决定）⇒ 与 dnd-kit 的 `activationConstraint` 一起构成官方拖拽模型（§一之十一 的 `closestCenter` 等）。
- ⇒ ★★★ **`stopTextEdit{allowToBeRemovedWhenEmpty, backupSelection}`**：离开编辑态时决定**空块是否删除**、并携带**备份选区** ⇒ 这是"点出去后空块消失"与"再点回来选区还在"的官方实现体，本地 TipTap 无对应概念。
- ★ 与 §一之三十 的 `renderTextBackupSelection{value, backupSelectionType}` 同族 ⇒ **备份选区是独立 action 类型**。

### 6. ★★ **评论域：已解决是有作者与时间戳的事件，且有发送态**

`addPendingComment{comment}`｜`updateComment{commentId,content,style}`｜`deleteComment{commentId}`｜`deleteThread{threadId}`｜`setCommentResolved{commentId,isResolved,authorId,timestamp}`｜`deleteCommentResolved{commentId,timestamp,isResolved}`｜`setCommentState{commentId,sendState}`｜`setCommentDraft`/`removeCommentDraft`｜`syncUpdateComments{comments}`｜`setAreResolvedThreadsVisible{areResolvedThreadsVisible}`｜`setSelectedCommentBlockId{blockId,threadId,anchorTo,commentBlockIdType}`
⇒ ★ **`sendState` ⇒ 评论有发送态**（离线/排队/已发）；⇒ ★ **解决动作携带 `authorId`+`timestamp`** ⇒ 可显示"谁在何时解决"；⇒ ★ `comment.style` ⇒ **评论内容带样式**；⇒ ★ `anchorTo` + `commentBlockIdType` ⇒ **评论锚点有两类寻址**。

### 7. ★★ **表格域 18 项的字段权威名**（结掉两条遗留）

`addRowToTable{tableId,row,offset}`｜`addColumnToTable{tableId,column,offset}`｜`deleteRowFromTable{tableId,row}`｜`deleteColumnFromTable{tableId,column}`｜`moveRowAction{tableId,base,rowIds,offset}`｜`moveColumnAction{tableId,base,columnIds,offset}`｜`setRowsOrder{tableId,newRowIds}`｜`updateRowHeader{tableId,hasRowHeader}`｜`updateColumnHeader{tableId,hasColumnHeader}`｜`updateCellStyle{tableId,cellIds,style}`｜`updateColumnMetaData{tableId,columnIds,columnMeta}`｜`updateAlternatingRowColor{tableId,alternatingRowColor}`｜`clearCellContentsByCoordinate{tableId,cellCoordinates,mode}`｜`addCellToTableAction{tableId,cellModel}`｜`deleteCellFromTable{tableId,cellPosition}`｜`addTextBlockToTableAction{tableId,cellId,block}`｜`deleteTextBlockFromTableAction{tableId,cellId}`｜`insertNewBlocksToTable{tableId,blocks,cells}`
⇒ ★ **权威字段名是 `hasRowHeader` / `hasColumnHeader`**（遗留项"hasColumnsHeader vs isHeaderRow 优先级"的命名一半结案；`hasColumnsHeader` 拼写不存在）。⇒ ★ **`move*Action` 带 `base` + 复数 ids + `offset`** ⇒ 移动是"以 base 为参照的整批位移"，不是 swap；★ 另有 `setRowsOrder{newRowIds}` ⇒ **整批重排是另一个 action**（列没有对应项 ⇒ 不对称）。⇒ ★ `clearCellContentsByCoordinate` 带 **`mode`** ⇒ 清空有模式档位。

### 8. ★★ **协同可见性 ＝ 光标 + 正在编辑的块 + 打开的页面**

`addRealtimeCursor{realtimeCursor}`｜`removeRealtimeCursor{rtcId}`｜`setRealtimeCursors{realtimeCursors}`｜`updateRTCEditingBlock{rtcId,editingBlocks,updatedAt}`｜`updateRTCOpenPages{rtcId,openPages,updatedAt}`｜`setRtcId{rtcId}`
⇒ ★ 三件事各自独立 action 且**都带 `updatedAt`** ⇒  presence 有陈旧判定；`rtcId` 是会话身份而非 user id。

### 9. ★ 其它值得单独记的格子

- `insertNewBlocks <-ia(t,e,n=!1){location, blocks, strictValidation}` ⇒ ★ **`strictValidation` 默认 false** ＝ 官方"数据层宽容"的开关在 action 层（印证 §一之三十一 5 与 G587）。
- `navigateToPageBlock{pageId, scrollTop}` ⇒ **导航携带滚动位置**；`openMostRecentDocument{rightSidebarTab, openCraftAssistant}` ⇒ 启动恢复同时决定右栏页与是否开助手。
- 任务视图三态分离：`setFilter{filter}`｜`setSort{sort}`｜`setQuickFilter{filter}`｜`navigateToQuickFilter{filter}`｜`setTasksViewDefaultTab{tasksViewDefaultTab}`；任务写侧 `updateTask{blockId, changes}`（★ 局部 changes）而 `setTaskSchedule/Deadline/RepeatConfig` 都是 **复数 `blockIds`** ⇒ **批量设置时间、单条改属性**。
- 空间/团队：`switchSpace{selectedSpaceId}`｜`addSpace{spaceData}`｜`updateSpaceSetting{spaceId, settings}`｜`addSpaceMembers{spaceId, invitedTeamMembers}`｜`duplicateDocuments{spaceId, sources, folderId, targetSpaceId}`（★ **跨空间复制**）｜`moveDocumentsToSpace{sourceSpaceId, targetSpaceId, documentIds}`。
- 公式编辑器自成一套：`openFormulaInputAtSelection{initialValue}`｜`closeFormulaInput`｜`setFormulaInputValue{value}`｜`editFormulaInputCellReference{reference}`｜`setCurrentlyEditedCellReferences{references}`｜`setCurrentlyEditedCellReferenceIndex{index}`｜`setCurrentlyFormulaBuilderHoveredRangeLabel{label}`。
- 上传三件套：`addMediaUploadInfo{mediaType, blockId, uploadInfo}`｜`updateMediaUploadStatus{mediaType, blockId, status}`｜`removeMediaUploadInfo{mediaType, blockId}` ⇒ ★ **上传是有状态的（add/update/remove）**，`mediaType` 参数化 ⇒ 图片/视频/文件共用一套。
- `group <-qon(t,e){actions}` ⇒ ★★ **存在"把多个 action 合成一个"的 action**（官方撤销粒度的机制层，直接对上 V46「3 个动作要按 4 次 Ctrl+Z」）。
- `updateSmartLinkBlock{blockId, smartLinkData, lastSyncTimestamp, forceOverwriteTitle, forceUpdateDocumentLastModifiedDate}` ⇒ 两个 `force*` 开关（正则把 `...` 展开式误记成 `0`，字段名以 §一之二十七 的 `smartLinkLastSyncTimestamp↔lastSyncTimestamp` 为准）。

### 10. 本地对照（本轮实跑）

- 权限：`src/components/editor/DocumentEditor.tsx:47` `const canEdit = role === 'owner' || role === 'editor'`，并在 `:77/:89/:252/:260/:289` 单点消费 ⇒ **本地只有一个 `canEdit`**，**无 `canView`/`canComment` 分离、无 `forcedViewOnly`** ⇒ 后果可判定：`MemberRole` 里的 `'commenter'`（`members.ts:6`）在编辑器侧与 `'viewer'` **行为完全相同**（都 `readOnly={!canEdit}`）。
- 协同：`src/lib/collaboration/presence.ts` + `src/components/editor/collab/CursorLayer.tsx:11/:21/:37`（`PresenceUser`/`clientId`）⇒ **只有光标一件**；`editingBlocks`/`openPages`/`rtcId` 在 `src` **0 命中** ⇒ 缺"谁在编辑哪些块""谁打开了哪些页面"两维。
- 任务视图：`grep -rn "quickFilter|sort" src/components/tasks src/app/tasks` ⇒ 无命中（路径可能不同名）⇒ **未核，不下结论**，只记"未定位到与官方三态分离对应的实现"。

## 仍未采到（模型面·第 62 批）

- 13 个 `...t` 展开式构造器的字段全集（要逐个回调用点）。
- 173 项非文档-store action 的**分派表**（各自 store 的 `case` 表，本批只有构造器）。
- `group` action 的应用器与撤销栈如何计层（V46 的机制侧仍未闭环）。
- `base`（moveRow/Column）到底是什么（参照行 id 还是索引）。
- 官方任务视图 filter/sort/quickFilter 的持久化时机（本地路径未定位）。

## 一之三十三、★★★ **全应用 60 张 `switch(x.type)` 分派表**（＝action 路由图）＋ 集合菜单 uiAction 全名 ＋ 三处枚举结案（2026-09-28 00:39 结案，`index-DiTmKH3z.js` 全文正则扫描 `switch(<id>.type){case"…`＋大括号配平计数；只列 ≥4 case 的表）

### 1. ★★★★ 规模：**60 张分派表**，最大的三张就是三条 store 路由

| 排名 | case 数 | 偏移 | 首项 | 判定 |
|---|---|---|---|---|
| 1 | **88** | @731642 | `createNewDocument…` | **文档 store**（§一之三十一 的 `PT`，`default: He(e)` 穷尽抛错） |
| 2 | **65** | @6377790 | `setSelection, toggleSelection, startTextEdit, stopTextEdit, setSelectionDraggingActive, selectAll` | **UI/选区 store**（`default:true`） |
| 3 | **63** | @6686072 | `hideNotification, showNotification, setNotificationsPosition, setQuickFilter, openLeftSidebar, setSidebarForcedOpenState` | **应用外壳 store**（通知、侧栏、快捷筛选） |
| 4 | 22 | @3601025 | `upsertDocumentsWithTasks, upsertDocumentsWithActiveTasks, …` | **任务列表数据 store**（`default:false`） |
| 5 | 20 | @807569 | `document_star, document_unstar, document_archive, document_unarchive, document_view, document_move` | **命令/活动 id 表**（蛇形命名 ⇒ 埋点或命令注册） |

⇒ ★ **三条 store 路由 ＝ 88 + 65 + 63 ＝ 216 项**，正好覆盖 §一之三十二 的 261 个构造器的大部分 ⇒ ★ 更正：全量重跑后是 **65 / 63**（不是初记的 68 / 66，差 3 项是因为初版正则把非 `return f(` 形态的 case 也算进）⇒ **"261 构造器"与"88 分派"之间的缺口不是缺失，而是分属不同 store**（这是上一批遗留项①的答案）。
⇒ ★ **`setSelectionDraggingActive` 是新名字**（§一之三十二 只扫出 `start/update/stopSelectionDragging` 三段）⇒ **拖拽态实际有四段**（三段显式 + 一个 active 开关），本批修正。

### 2. ★★ **集合模块的菜单 uiAction 全名**（§一之十四 / 第 41 批的"具名浮层栈"补上动作层）

@5170857（11 case，`default:false`）：`openHeaderMenu`｜`openEditProperty`｜`openEditPropertyOption`｜`openConfigureCollection`｜`openAddProperty`｜`openRowContextMenu`｜…
⇒ ★ 集合的六种入口（列头菜单、改属性、改属性选项、配置集合、加字段、行右键）都是**独立 action 名**，与第 41 批采到的 `collection-v2-{date,select,multiselect,person}-editor` 浮层栈是**两个层次**（action 打开 ⇒ 浮层栈注册）。

### 3. ★★ **三处权威枚举结案**（此前只能从文案反推）

1. **搜索结果类型（同一枚举三处消费）**：@4013275 / @4014005 / @4039177 各 10 case ⇒ `document`｜`page`｜`block`｜`date`｜`mention`｜`documentAction`｜…；@4013727 的 8 case 变体含 `folder`｜`space`｜`loadingMoreMentions` ⇒ ★ **搜索分组六类 + 两个非结果项（folder/space）+ 一个加载哨兵（loadingMoreMentions）** ⇒ 本地搜索若无"分组类型判别联合"即缺整层。
2. **活动日志动作六类（两处消费）**：@3613241 / @3616956 各 8 case ⇒ `create`｜`delete`｜`move`｜`update`｜`reorder`｜`pin`｜… ⇒ 与 @807569 的 20 项蛇形命令 id 是**同一事物的两级抽象**（动词 × 对象）。
3. **侧栏/空间视图枚举**：@3388544（11）`ALL,FOLDERS,STARRED,COLLECTION,INBOX,TRASH…`｜@1574638（10）`ALL,FOLDERS,INBOX,STARRED,TRASH,TEMPLATES…`｜@2393969（10）`tasks,tasksCalendar,team,all,folders,inbox`｜@2398468（14）与 @2408504（14）`home,all,folders,folder,inbox,starred,templates…` ⇒ ★ **四个视图 tab 枚举并存** ⇒ 侧栏分组、任务视图、团队视图各自有独立枚举，不是同一份。
4. **块类型菜单**：@553470（9）`file,image,drawing,code,video,table…`｜@1266942（12）`text,code,card,page,line,unsplash…`｜@5817330（12）`line,table,text,card,page,code…`｜@3272751（9）`separator,imageRow,preview,fixedGridRow,pageCard,code…`｜@5267263（9）`pageCard,text,table,objectList,code,image…`｜@5247235（13）`separator,image,video,preview,text,subpage…` ⇒ ★ **六份"块类型 → 某行为"的表并存且取值集合各不相同**（`imageRow`/`fixedGridRow`/`subpage`/`objectList` 只在个别表出现）⇒ **官方块类型词表在不同能力面上是分别裁剪的**，本地若做一份统一枚举会与官方六处都不完全一致（对照 §一之十五 的 `Xe` 13 值）。

### 4. 方法论（本批新增，已回写技能）

- ★ **同一招（全量正则枚举 + 本地聚合）连中三次**：§一之三十一（`PT` 88 项，为闭合一个 action 撞开）、§一之三十二（261 构造器，一条正则）、本批（60 张分派表，一条正则）。⇒ **挖协议层时先做"全量枚举"再做"逐个深读"**；反过来的效率低一个量级。
- ★ 大括号配平计数（不用正则贪婪匹配）是取回整张表的安全做法：`switch(...) {` 起点 + 逐字符深度计数，上限 12000 字符防爆。

## 仍未采到（模型面·第 63 批）

- 68 项 UI store 表与 66 项外壳表的**完整名单**（本批只取首 6 项与计数）。
- 各表的 `default` 分支形态差异（`default:true` 与 `default:He(e)` 之外，`default:false` 的 4 张表是"什么都不做"还是别的结果）。
- @807569 的 20 项命令 id 全集与其消费方（埋点？命令面板？）。
- 集合 11 项 uiAction 的字段形态；四个视图枚举的完整取值。

## 一之三十四、★★★ **UI store 65 项 ＋ 外壳 store 63 项 分派表全文**（含 16 个新 action 名 ⇒ 反向修正第 63 批计数与"有无 `default:He` 可判分派器"的判据）（2026-09-28 00:42 结案，`index-DiTmKH3z.js` @6377790 / @6686072，大括号配平取整表）

### 1. ★★★★ **判据修正：60 张表里真正的"store 路由"只有带 `default: He(…)` 的那几张**

- 本批用同一脚本重跑，两张大表的准确计数是 **65**（UI/选区）与 **63**（外壳），**第 63 批记的 68 / 66 偏高 3 项**（初版把非 `case"X":return f(` 形态的分支也算作 case）⇒ 已就地更正 §一之三十三 1 的表与合计（222 → **216**）、`gap.md` G594、features.md 导航行、第 63 批日志。
- ⇒ ★★ **可用判据**：三张 store 路由表的 `default` 都是 **`He(参数)`**（§一之十六 的渲染穷尽抛错家族）⇒ **`default: He` 存在 ＝ 这是"会改状态的分派器"**；而没有 `default` 的那几张（~~22 项任务数据表 @3601025~~ ⇒ ★ **第 65 批更正：`Unn` 其实是 store 路由，只是兜底写在函数末尾 `return void 0` 而不是 `default:` 标签** ⇒ "有无 default"不能单独作判据，见 §一之三十五 1 / G603；11 项集合菜单 @5170857、8 项活动日志 @3613241/@3616956 仍是映射表）是**纯映射函数**（输入 type 输出标签/组件/文案），不是派发器。⇒ **区分"协议表"与"映射表"不必读实现，只看 default 分支。**

### 2. ★★ **16 个 action 名不在第 62 批的 261 构造器表里** ⇒ 两向差集是必需品

`restoreTextEdit`｜`setDocumentSearchString`｜`setCurrentlyFocusedSearchIndex`｜`updateHighlightedTextReplaceItemsAction`｜`toggleObjectListRowSelection`｜`openFullSearchAction`｜`openSharedWithMeAction`｜`openPlaygroundAction`｜**`openEasterEggAction`**｜`toggleWebappDebugPanelAction`｜`notificationChangesLoaded`｜`updateSpaceInvitesData`｜`updateTeamMemberRoleAction`｜`removeTeamMemberAction`｜`setTeamStatusAction`｜`setSelectionDraggingActive`（第 63 批已抓到）
⇒ ★ 构造器正则与分派表正则各漏一侧 ⇒ **协议全集必须取两者并集**（本批并集后 UI 面 ≈ 261 ∪ 16）。

### 3. ★★★ **UI store（65 项）分域全表**（`@6377790`，`default: He(n)`）

- **选区/编辑生命周期 8**：`setSelection`｜`toggleSelection`｜`startTextEdit`｜**`stopTextEdit`**｜**`restoreTextEdit`**｜`setSelectionDraggingActive`｜`selectAll`｜`renderTextBackupSelection` ⇒ ★★ **`restoreTextEdit` 与 `stopTextEdit` 成对** ⇒ "退出编辑"是**可恢复**的（备份选区的消费方在此），本地无此概念。
- **侧栏/右栏 7**：`toggleRightSidebarOpen`｜`setRightSidebarPage`｜`setRightSidebarInfoAndActionsPage`｜`setRightSidebarForcedOpenState`｜`setLeftSidebarTab`｜`toggleFocusMode`(在外壳)｜`setSidebarForcedOpenState`(在外壳) ⇒ ★ **左/右栏各自有"forced open state"** ⇒ 临时展开与持久选择是两维。
- **搜索 4**：`setIsDocumentSearchOpen`｜`setDocumentSearchString`｜`setCurrentlyFocusedSearchIndex`｜**`updateHighlightedTextReplaceItemsAction`** ⇒ ★ **文档内搜索三态（开/词/当前命中）+ 查找替换高亮集**（⇒ 官方支持替换，命中项集合是独立 state）。
- **权限 3**：`setDocumentAccess`｜`setDocumentAccessSignature`｜`setForcedViewOnlyModeAction` ⇒ ★★ **权限三项住在 UI store，不在文档 store**（与 §一之三十二 2 的 `canView/canComment/canEdit` 同一构造器）⇒ 权限是"界面可见态"而非"数据态"，这也解释了 §一之三十一 的只读白名单为什么在 store 层。
- **实时协同 6**：`setRtcId`｜`setRealtimeCursors`｜`addRealtimeCursor`｜`removeRealtimeCursor`｜`updateRTCEditingBlock`｜`updateRTCOpenPages`。
- **上传 3**：`addMediaUploadInfo`｜`removeMediaUploadInfo`｜`updateMediaUploadStatus`。
- **公式编辑器 6**：`closeFormulaInput`｜`setFormulaInputValue`｜`openFormulaInputAtSelection`｜`editFormulaInputCellReference`｜`setCurrentlyEditedCellReferenceIndex`｜`setCurrentlyEditedCellReferences`｜`setCurrentlyFormulaBuilderHoveredRangeLabel`（7 项）。
- **弹层/菜单 10**：`openUnsplash`/`closeUnsplash`｜`toggleCmdMenu`｜`openRenameOnBlock`/`closeRenameOnBlock`｜`updateContextMenuState`｜`togglePageCardMixer`｜`setFloatingMenuOpen`｜`setIsShortcutsModalOpen`｜`setCraftLightbox`｜`toggleModal`(外壳)｜`updateGlobalConfirmPopup`(外壳)。
- **评论/任务/集合选择 5**：`setSelectedCommentBlockId`｜`setAreResolvedThreadsVisible`｜`setTaskEditSelection`｜`toggleObjectListRowSelection`｜`openToggleListAction`。
- **块编辑与杂项 8**：`navigateToPageBlock`｜`setLastInteractedBlock`｜`setSyncStatus`｜`updateLastUsedHighlight`｜`updatePDFExportPopupAction`｜`setActiveSubscription`｜`startCodeEdit`/`stopCodeEdit`｜`setUndoRedoBannerOpen`。
- **移动端 4**：`setMobileEditingBannerContentType`｜`setMobileEditingBannerSource`｜`deleteMobileEditingBannerState`｜`setIsInMobileCellSelectionMode` ⇒ ★ **手机上有"编辑横幅"三态**（内容类型/来源/删除）＋ 单元格选择模式。

### 4. ★★★ **外壳 store（63 项）里的新功能面**（此前完全没采到）

- ★ **`openEasterEggAction`** ⇒ **官方有彩蛋**（与 `openPlaygroundAction`、`toggleWebappDebugPanelAction`、`setDebugLimit`、`setApplicationHaltError` 同域 ⇒ 调试/隐藏能力自成一组）。
- ★ **`setCustomizeLeftSidebarOpen` / `setCustomizeLeftSidebarOption{option,isChecked}` / `setCustomizeLeftSidebarOptionsOrder{order}`** ⇒ **侧栏项目可勾选且可排序**（本地侧栏是固定项）。
- ★ **团队/空间 11 项**：`switchSpace`｜`addSpace`｜`removeSpace`｜`updateSpaceData`｜`updateSpaceSetting`｜**`updateSpaceInvitesData`**｜`addSpaceMembers`｜`addTeam`｜`updateTeamPropsAction`｜**`updateTeamMemberRoleAction`**｜**`removeTeamMemberAction`**｜`setTeamStatusAction`｜`deleteTeamAction` ⇒ ★ **成员角色可改、可移除，团队有状态位**（`setTeamStatusAction`）。
- ★ **匿名态 2 项**：`setAnonymousProfileV3`｜`setAnonymousLoginState` ⇒ 未登录可用（本地是强制登录）。
- ★ **通知 5 项**：`showNotification`/`hideNotification`/`setNotificationsPosition`/`setNotificationSummary`/**`notificationChangesLoaded`**/`updateNotificationSidebarScrollPosition` ⇒ ★ **通知面板记住滚动位置**，且 `position` 可设（通知是可拖位的）。
- ★ **分享/域名/更新 5 项**：`openSharedWithMeAction`｜`openAppLinkOffer`｜`setLoginDeeplink`｜**`updateCustomDomainsAction`**｜**`setHasUpdatePendingAction`** ⇒ 自定义域名 ＋ "有新版本待刷新"提示（SPA 常驻产品的标配）。
- ★ **视图/排序 4 项**：`setQuickFilter`｜`setDocumentListSort`｜`setTasksViewDefaultTab`｜`setTemplateIndex`｜`setIsFirstSession`｜`setIsOnboardingVisible`｜`setHasActiveAppStartPopup`｜`setMobilePage`｜`setConnectionStatus`｜`setAdvancedSettings`｜`setLastDownloadedLinkAction`｜`isNotificationsPanelOpenAction`｜`isTopLoadingBarVisibleAction`｜`isQuickSearchOpenAction`｜`setTopLoadingBar…` ⇒ ★ **`isXxxAction` 命名族 ＝ 显式"设置某个可见性布尔"的 action**（三个：通知面板/顶部加载条/快搜）。

### 5. 本地对照

- 本地无 action 层已由 G583/G594 实跑证实（无分派表、无 `patches`）⇒ 本批不重复断言，改为记两个"可直接对齐的具体功能"：
  - ★ **侧栏自定义**（`setCustomizeLeftSidebarOption{option,isChecked}` + `…OptionsOrder{order}`）⇒ 本地侧栏项目固定、无排序 ⇒ 新缺失格（G600）。
  - ★ **文档内搜索的"当前命中索引"是独立 state**（`setCurrentlyFocusedSearchIndex`）＋ **替换命中集是独立 state**（`updateHighlightedTextReplaceItemsAction`）⇒ 本地无搜索替换（此前只在 G594 层面记"无 action"，本行给出具体行为差）。

## 仍未采到（模型面·第 64 批）

- 22 项任务数据表（@3601025）与 20 项命令 id 表（@807569）的完整名单（前者是映射还是路由需看 default）。
- `He` 与各 `default` 的实际行为差异（`He(n)` vs `He(e)` 只是形参名不同？）。
- `restoreTextEdit` 与 `stopTextEdit{backupSelection}` 的配对细节（备份什么、何时还原）。
- 16 个"仅在分派表出现"的 action 的构造器与字段。

## 一之三十五、★★★ **任务数据 store（`Unn` 22 项）＋ 空间/文件夹命令路由（`$Je` 蛇形 payload 方言）**；★ **并更正第 64 批刚立的"看 default 判分派器"判据**（2026-09-28 00:46 结案，`index-DiTmKH3z.js` @3601000 `Unn` / @807540 `$Je`）

### 1. ★★★ **判据更正：`Unn` 没有 `default:` 标签，但它是真正的 store 路由**

```js
function Unn(t, e, n) { switch (e.type) {
  case "upsertDocumentsWithTasks": return Wnn(t, e);
  …共 22 项…
} return void 0 }        // ★ 兜底写在函数末尾，不是 default: 标签
```
- ⇒ ★★ **第 64 批 §一之三十四 1 的判据（"有 `default: He(...)` ＝ 分派器；无 default ＝ 纯映射函数"）当场作废一半**：`Unn` 会改 `t.documents` / `t.taskBlocks`，**是路由**，只是用**函数末尾 `return void 0`** 兜底。⇒ 正确判据是**看函数体是否写 store（immer 草稿参数 `t` 被改）而不是看 `default:` 标签**；`default:He(e)` 只是"穷尽抛错型"路由的特征，另一型是"末尾静默 no-op"。
- ⇒ ★ **两种兜底的语义差**本身是事实：`PT`（文档 store）遇到未知 type **抛错**；`Unn`（任务列表 store）遇到未知 type **静默返回 undefined** ⇒ **同一产品内对不同 store 的严格度不同**：核心数据协议严格、列表缓存宽容。

### 2. ★★ **`Unn` 22 项全表 ⇒ "任务"是一层独立的分页文档缓存**

- **6 个 upsert**：`upsertDocumentsWithTasks`｜`upsertDocumentsWithActiveTasks`｜`upsertDocumentsWithUpcomingTasks`｜`upsertInboxDocument`｜`upsertLogbookDocument`｜`upsertPinnedDocuments`
- **★ 3 个分页游标**：`updateContinuationToken`｜`updateOngoingTasksContinuationToken`｜`updateUpcomingTasksContinuationToken` ⇒ **ongoing / upcoming / 文档列表各自独立分页**；配 `updateLoadStatus{status}`｜`setPageInfo{pageInfo}`｜`resetFetchDocumentsWithTasks` ⇒ 无限滚动三件套。
- **任务写侧 6**：`createTask{block}`｜`updateTask{blockId,changes}`｜`deleteTask{blockId}`｜`moveTask{blockId,documentId}`｜`reorderTasks{blockId,afterBlockId}`｜`updateDailyDocumentIds{map}`
- **视图态 2**：`setFilter{filter}`｜`setSort{sort}`；**文档收藏 2**：`pinDocument{documentId, afterDocumentId?}`｜`unpinDocument{documentId}`
⇒ ★★ **`moveTask` 带 `documentId`** ⇒ 跨文档移动任务是一个显式操作（与 `updateTask{changes}` 分开）；★ **`reorderTasks{blockId, afterBlockId}`** ⇒ 任务排序是"插到某任务之后"的**相对定位**，不是索引（与 §一之三十二 的 `…afterDocumentId` 同一族）。

### 3. ★★★ **"收件箱 / 日志本"各是一篇文档，且有一类"受限任务文档"特判**

```js
function zW(t, e) { return Bo.isRestrictedTaskDocument(e) || $x(e, t.inboxDocumentId) || k9e(e, t.logbookDocumentId) }
// hb(t,e,n,o=false,s=false) —— 服务端返回一批文档后重建 taskBlocks：
for (const l of e) {
  if (!s && zW(t, l.id)) continue;                          // ★ 跳过特殊文档
  const { taskBlocks: r, ...c } = l, d = $nn(r);
  t.documents[c.id] = c;
  t.taskBlocks = Wo(t.taskBlocks, u => {
    if ((u.taskData?.schedule != null || u.taskData?.deadline != null) && u.documentId === c.id && !d.has(u.id)) return u;  // ★ 保留
    if (o && u.documentId === c.id && !d.has(u.id)) return …                                                                // （截断）
```
- ⇒ ★★★ **任务的"从列表里消失"是本地按游标结果剪枝**：新结果里没有、且**没有 schedule/deadline** 的任务块被剔除；**带排期或截止的任务即使不在本次返回里也保留**。⇒ 这解释了一类官方现象（与 V22/V31 任务动线、以及"勾掉的任务在收件箱消失但仍存在于文档"直接相关）：**过滤是本地缓存层的剪枝，不是服务端删块**。
- ⇒ ★★ **`inboxDocumentId` / `logbookDocumentId` 存在 store 里 ⇒ 收件箱与日志本各是"一篇真实文档"**（不是虚拟视图）；再加 `isRestrictedTaskDocument` 一类 ⇒ **三类文档在任务列表里被特殊对待**。

### 4. ★★ **`$Je` ＝ 第二套 action 方言：蛇形 type ＋ `spaceId` ＋ `payload`**

```js
$Je = (t, e) => { switch (e.type) {
  case "document_star":   return Sk(t, e.spaceId, e.payload.documentId, { isStarred:  true });
  case "document_unstar": return Sk(t, e.spaceId, e.payload.documentId, { isStarred: false });
  case "document_archive":   return Sk(…, { isArchived:  true });
  case "document_unarchive": return Sk(…, { isArchived: false });
  case "document_view":   return ZJe(t, e.spaceId, e.payload.documentId, qy(e));            // ★ 记录访问时间
  case "document_move":   return VJe(t, e.spaceId, e.payload.documentId, e.payload.targetFolderId ?? null, e.payload.position);
  case "folder_create" | "folder_rename"(n.name) | "folder_set_icon" | "folder_set_description"
       | "folder_set_pinned" | "folder_move"(parentId ?? null, position) | "folder_delete" | "folder_reorder" …
```
- ⇒ ★★ **同一产品内两种 action 约定并存**：文档 store 是 `{type, …扁平字段}`（camelCase），空间/文件夹这层是 **`{type: "snake_case", spaceId, payload: {…}}`** ⇒ 复刻时不能只认一种形状。
- ⇒ ★ **写侧三细节**（`folder_set_*`）：`icon === void 0 ⇒ delete n.properties.icon`（**显式删属性而非写 null**）；`description == null || "" ⇒ delete properties.description`（**空串等同删除**）；`folder_set_pinned` 把 `pinnedDocumentIds` 写成 `documentId ? [id] : []` ⇒ **"固定文档"是数组但只放 0 或 1 个 ＝ 单选**。
- ⇒ ★ `document_star`/`document_unarchive` 等**成对且只差一个布尔**（`Sk(t, spaceId, docId, {isStarred:bool})`）⇒ 收藏与归档都是**布尔字段**，不是枚举状态；`document_view` 携带 `qy(e)`（从 payload 取时间，未展开）。

### 5. 本地对照（本轮实跑＋承前）

- 本地有收藏，但是**独立 server action**：`src/actions/document/favorite.ts:9/:32` 各调 `requireDocumentAccess(documentId, userId, 'viewer')` ⇒ 官方收藏走 `document_star{payload}` 且**记在 space 层的 `isStarred` 布尔**上（`upsertPinnedDocuments`/`pinDocument` 又是任务层的另一套）⇒ ★ **官方"收藏/固定"至少有两处不同实现**（space 的 `isStarred` 与任务 store 的 `pinnedDocuments`），本地若只做一个会漏。
- 任务剪枝规则（§一之三十五 3）本地**没有对应层**（本地任务查询直读 Prisma，无 continuationToken/游标概念）⇒ 但"带排期/截止的任务不因结果集变化而消失"这条**行为**在本地是自然成立的（每次全量查库），差异在**分页与增量**时才显形 ⇒ 记为"当前不显形、上分页后必显形"的风险项。

## 仍未采到（模型面·第 65 批）

- `hb` 里 `o` 分支与 `ret` 之后的完整剪枝条件（本批被截断）。
- `qy(e)`、`Sk`、`ZJe`、`VJe`、`kk` 的实现体（`folder_*` 系列的公共写入器）。
- `$Je` 剩余 case（本批只读到 `folder_reorder` 开头）⇒ **蛇形方言的完整名单未取全**。
- `isRestrictedTaskDocument` 的判据（哪些文档算受限）。
- 20 项命令 id 与 `Unn` 22 项的**消费方**（谁 dispatch 它们）。

## 一之三十六、★★★ **`$Je` 蛇形方言完整名单（16 项）＋ `HJe` 批量变更归一应用器 ＋ 三种兜底形态**（2026-09-28 00:51 结案，`index-DiTmKH3z.js` @807540–809900；★ 本节的原始取数与"25 处 `cursor` 假警报"结案记录见 `_harvest/todo-actions.md` 第 65 批续・种子段）

### 1. ★★ **`$Je` 尾部补齐：侧栏有五个可整批排序的列表，标签可置顶**

```js
case "folder_reorder":    return KJe(t, e.spaceId, e.payload.folderId,      e.payload.orderedIds, qy(e));
case "subfolder_reorder": return qJe(t, e.spaceId, e.payload.parentFolderId, e.payload.orderedIds);
case "tag_pin":   return QJe(t, e.spaceId, e.payload.tag);
case "tag_unpin": return YJe(t, e.spaceId, e.payload.tag);
case "tag_reorder": return XJe(t, e.spaceId, e.payload.orderedTags);
case "root_reorder":    return JJe(t, e.spaceId, e.payload.orderedIds);
case "starred_reorder": return eet(t, e.spaceId, e.payload.orderedIds);
default: return {}                                            // ★ 兜底第三形态
```
⇒ ★★★ **`root_reorder` / `starred_reorder` / `folder_reorder` / `subfolder_reorder` / `tag_reorder` 五个整批排序 action 并存** ⇒ 侧栏的可排序对象**不止文档列表**，星标区与标签区各自独立；★ **`tag_pin`/`tag_unpin` ⇒ 标签可置顶**（标签功能面此前只采到设置里的管理界面，操作层第一次拿到）。
⇒ 全部走 `payload.orderedIds` ⇒ **排序一律"提交完整新顺序"而非 swap**（与 §一之三十二 `setRowsOrder{newRowIds}` 同一族，官方在"重排"上的一致性很强）。

### 2. ★★★ **`HJe` ＝ 批量变更归一应用器（协同增量的消费形态）**

```js
HJe = (t, e) => { let n = {};
  for (const o of e) { const s = { ...t, ...n }; n = { ...n, ...$Je(s, o.change) } }
  return n }
```
⇒ ★ **一串 change 在「基态 ＋ 已合并补丁」的快照上按序逐条应用，最后一次性返回合并结果**（不是逐条提交给 store）⇒ 协同/批量更新是**「包内含 `change` 数组」**的形态（`o.change`）。
⇒ ★★ 这正是动态遗留清单第 8 项（**批量 vs 单条是否归一**）在官方代码里的对应实现体 ⇒ 静态侧已闭环，剩下的是"屏幕上如何表现"（撤销算一步还是 N 步）仍需动态验。

### 3. ★ **三种兜底形态 ⇒ 判据最终版**

| 表 | 兜底 | 语义 |
|---|---|---|
| `PT`（文档 store 88 项） | `default: He(e)` | 未知 type **抛错**（穷尽检查） |
| `Unn`（任务数据 store 22 项） | 函数末尾 `return void 0` | **静默 no-op** |
| `$Je`（空间/文件夹 16 项） | `default: return {}` | **返回空补丁**（等价 no-op，但保持返回类型一致） |
⇒ ★★ **判"是不是会改状态的分派器"要看函数体是否写 store，`default:` 标签只是辅助信号**（§一之三十四 1 的初版判据在 §一之三十五 1 被推翻，本节给出最终版）；⇒ ★ 同产品内**三张路由三种严格度**：核心数据协议抛错、列表缓存静默、空间层"空对象保类型"。

### 4. ★★ **写入器与文档字段**

- `Sk(t, spaceId, docId, patch)` ＝ **通用文档字段合并器**（`{spaces[id].documents[docId]: {...旧, ...patch}}`）⇒ `document_star/unstar/archive/unarchive` 全是它 ＋ 一个布尔 ⇒ **收藏与归档是文档对象上的布尔字段，不是枚举状态**。
- `ZJe`（`document_view`）＝ `lastViewed: bD(i.lastViewed, o)` ⇒ ★ **文档上有 `lastViewed` 且经 `bD(旧,新)` 合并**（合并策略未读）。
- `VJe`（`document_move`）＝ `Y2(t.spaces, …)` 遍历 folders 且 `r.isDeleted ||` 跳过 ⇒ ★ **文件夹有软删标志 `isDeleted`**。

### 5. ★ 一条反向方法学教训（已进用户级记忆与技能）

`grep -rn "continuationToken|cursor" src/lib src/actions` 命中 **25** 处，逐条读完全部是同名异物：`folder-tree.ts:18–23` 的父链上溯循环变量、`presence.ts:17–77` 的**鼠标光标**、`import/markdown.ts:139–165` 的解析索引指针；★ 单独 `grep continuationToken` ⇒ **0 命中** ⇒ **G604 的"本地无分页游标"成立、不需要回改**。⇒ **与"未覆盖 N 条只当候选定位器"互为镜像的错误**：宽松 alternation 的命中数同样能诱导**把已经写对的结论改回错的**（差点制造一个假"已实现"）。规矩：**计数只用于找候选文件，任何"有/没有"的断言必须读命中内容；`grep -c` 的结果永不进产物。**

## 一之三十七、屏幕侧块模型（第 67 批＝首个动态块级批次；证据＝`_harvest/b67-*.html` 15 份 DOM 快照 + 逐字节 diff）

**取数方式**：沙盒文档 `14a17c04-…`（`docs.craft.do/editor/d/<spaceId>/14a17c04-…`）里用键盘建块，每步取一次 `domSnapshot()` 全量 HTML 落盘，再做公共前缀/后缀 diff。⇒ **本节是"渲染层契约"**（官方自己写出来的 DOM），与 §一之一–§一之三十六 的"代码层契约"（bundle 直读）互为两侧证据；凡本节与前面各节冲突处，以本节为准并就地标注。

1. ★★★★ **官方编辑器内核是 Slate，不是 ProseMirror/TipTap**。DOM 里稳定出现 `data-slate-editor="true"`、`data-slate-node="value"`、`data-slate-node="element"`、`data-slate-leaf="true"`、`data-slate-zero-width="n"`、`data-slate-length="0"`、`role="textbox" aria-multiline="true" translate="no"`；全量 HTML 里 **`ProseMirror` 字样为 0**。
   ⇒ ★ **这是整份复刻最根本的一条架构分歧**：本地是 `@tiptap/starter-kit`（`src/components/editor/Editor.tsx:5`、`:244`），**块级输入行为、选区模型、历史栈全部来自不同实现**，此前所有"块行为"结论都不能靠"TipTap 默认如此"来推。
   ⇒ 顺带一条通路事实：官方在 `#editor-center-view` 之外另有一个 **`#spellCheckEnabler` 的 `contenteditable="true"`** 节点，真正的编辑器 root 在 `ph-mask` 内层且 `contenteditable` 为 `false` 的包装里（与技能里"`ax.setValue` 会写进 `#spellCheckEnabler``"的失败记录同源）。

2. ★★★ **一个块在 DOM 里有三重身份，且 id 大小写分两制**。
   ```
   <span id="blockrowwrap-<ID>" style="--overhang-left: 0px; --overhang-right: 0px; --overhang-left-print: 0px; --overhang-right-print: 0px;">
     <div id="blockwrap-<ID>" data-block-id="<ID>" data-menu-inside="false" class="sc-1fwvj4a-0 …">
       … <div id="<ID>" class="sc-3a69oq-5 …">   ← 第三重：裸 id
   ```
   - ★ **标题块 id 是小写 UUID**（`<objId:15>`，`data-testid="editor-title"`），**正文块 id 是大写 UUID**（`<objId:16>`）⇒ ★ **两制并存于同一篇文档**，任何"按 UUID 大小写归一化/去重"的实现都会在这里出错；本地若生成小写 id 再对账就会不匹配。
   - `data-menu-inside`、`--overhang-left/right`（**含打印专用两版**）、`data-hover-only` 是块行上的稳定属性位。

3. ★★ **空块的屏幕形态**：`<span data-slate-zero-width="n" data-slate-length="0"> <br></span>`（实测建块瞬间 `brs` 0→1、`zeroW="n"`、`slateLen="0"`）。⇒ **判"块为空"在屏幕侧有一个可直接用的锚点**，比读 `text.length===0` 更贴近官方；`"n"` 疑为 newline（与硬换行档位相关，未解）。

4. ★★★ **缩进的载体是兄弟占位 div，不是块的样式**（见 `interactions.md` V50 1）：`<div class="_indent_1oz2o_33" style="--indent-w: 28px;"></div>` 插在 `_flexRow_1oz2o_1` 内，**每档一个**，而块的 `padding-left`/`margin-left`/`--overhang-left` 在缩进前后**逐字不变**。⇒ ★ **缩进在 DOM 上是扁平序列**（不嵌套），父子关系只存在于数据层 ⇒ "从 DOM 结构推断层级"的写法一律不可用；`28px` 是缩进档宽度基准（可直接进 CSS）。

5. ★★ **`Ctrl+A` 选中态让 DOM 净增 14,159 字节，但 `data-selected` / `aria-selected="true"` 计数为 0** ⇒ **官方选中态用其它属性/子元素表达**（未识别）。⇒ 本地做多选时不能假定"加 `aria-selected` 就等价"。

6. ★★★ **撤销栈混粒度**（实测序列见 `interactions.md` V50 6）：**块级操作一步撤销一整块**（连续八步差值恒为 `2,115 / 2,200` 量级），**而打字按字符入栈**（连续三步各差 **1 字节**，文本 `-丙段 → -丙段 → 丙段`）。⇒ ★ **官方历史不是"按用户动作分组"而是"按补丁粒度"** ⇒ 与 §一之三十二 6 的 `group{actions}`（复合动作 action）**并存**：`group` 存在，但**没有把一次输入过程合并成一个 undo 层**。⇒ 本地若要行为一致，历史层要按"块级 vs 文字级"两种粒度分别成组，不能统一用 TipTap 默认的 `newGroupDelay` 时间窗。

7. ★ **屏幕侧对"块类型词表六份并存"（§一之三十三 4）的补充**：本轮用键盘只造出了 **文本块**（`data-slate-node="element"` 的普通段）一种；**列表标记在屏幕上从未出现**（`<li>` 计数恒 0、无 `data-block-type`），而 `- ` 两个字符确实进了文档（撤销时被逐字节退掉），`Ctrl-Shift-7` 逐字节零变化 ⇒ ★ **至少"markdown 简写建列表"与"TOGGLE_LIST 键位建列表"两条通路在 web 端不生效**，块类型建面**仍需走浮层/菜单**（未采）。

## 一之三十八、屏幕侧块行为矩阵与浏览卡片属性（第 68 批·动态取证）

1. ★ **块首 Backspace 是一个四档分派器，不是单一"合并"**（屏上逐字节，V51 §2–§5）：前块为文本→**合并**（−386 B、块数 −1）；本块有缩进→**只删一个 28px 缩进占位 div**（−62 B、块数不变、不合并）；前块为空→**删掉那个空块**（−1,989 B＝与"新建一块 +1,989 B"精确对称、当前块文本不变）；本块是标题块之后的第一个正文块→**零变化**（不并入标题）。⇒ 屏幕侧块模型的"删除"语义按 **prev 类型 × 本块格式档 × 是否首块** 三因子分派。
2. ★ **合并后的光标位置是一个可寻址值**：`DDDD` + `EEEE` 合并成 `DDDDEEEE` 后插入探针字符得 `DDDDXEEEE` ⇒ 光标落在**上块文本长度**处，与静态 §一之三十 的 `{type:"textSelectionIndex", index: 上块文本长度}` 对应 ⇒ **落点用"块 + 块内字符下标"表达，不是 DOM 位置**（复刻时不能用 ProseMirror 默认落点想当然）。
3. ✓ **块的屏幕身份（第 68 批修正）**：块容器是 **`id="blockwrap-<uuid>"`**（第 67 批误记为 `class="blockwrap-"`），同值另存于 `data-block-id`，标题块额外带 `data-testid="editor-title"`；缩进是**兄弟占位 div**（`--indent-w: 28px`，每档一个），因此**块在 DOM 里是扁平序列**，父子关系只存在于 `data-block-id` 侧，不能从 DOM 层级推断。
4. ★ **浏览屏卡片的属性集**：`<div draggable="true">` → `_outerBox_1nu3o_20` 带 **`data-item-id`（文档 id）/ `data-selection-kind="document"` / `aria-expanded`**；卡内 `<a href="/editor/d/<space>/<doc>">`；预览图 `res.craft.do/render/document_preview/v1/<space>/<doc>/t/<epochMs>?…&size=m&theming=true`。⇒ **卡片标题与预览来自服务端渲染快照（带 `t=` 时间戳）**，与文档实时内容可不同步（第 68 批实测：改了标题、删了文档，卡片仍是旧值）。
5. ★ **官方前端有两套并存的按钮设计体系**：浏览屏工具栏 = **Base UI**（`data-ds="button"` + `id="base-ui-_r_5n_"` + `_variantPlainDanger_1bml7_165`）；删除确认框按钮 = **旧 styled-components**（`sc-wrwa8u-4 … FilledDanger Medium fluid`）。⇒ 复刻时"统一组件库"会**偏离官方真实形态**；且**确认框不带 `role="dialog"`/`aria-modal`**（无障碍语义缺失是官方事实，不是采集误差）。

## 一之三十九、表格单元格数据模型（第 69 批·静态补账，直读 `_harvest/js/index-DiTmKH3z.js`）

★ 本节做掉的是 `features.md`「不依赖连接器的下一批靶子」第 7 条里点名的 `S1e`/`DU`/`_U`（表格 `tableData` 单元格模型）。全部偏移都在主 chunk `index-DiTmKH3z.js`。

1. ★★★ **表格不是节点树，是 `pluginData` 里的一段 JSON**：块适配器在 `@149391` 处 `if(t.pluginData!=null) switch(t.type){ case "table": const P=new DU(t.id), M=_U(P,t.pluginData); M.type==="success"&&(C={type:"table",data:M.tableData}) }` ⇒ **`type:"table"` 的块，其内容整体存在 `pluginData` 里，由 `_U(校验器, raw)` 解析成 `{rows, columns, cells, style}`**（`@115332`）。⇒ 表格**不走子块 children**，与 §一之八/§一之九 的"块线性表"是两套承载方式。
2. ★★★★ **单元格的正文是一个 `blockId` 引用，不是内联文本**：cell 校验器 `VLe`（`@114754`）逐字段要求 `id` / `rowId` / `columnId` / `blockId` 四个 string 都存在（缺任一即 `logError("\`x\` must be defined in \`TableCellModel\`")`），外加可选 `style`。⇒ **每个单元格指向 docStore 里的一个独立块**；表格本身只持有三维坐标（行 id × 列 id → 块 id）。
3. ★★ **行/列是"只有 id + metadata"的独立数组**：行 ` $Le`（`@113991`）＝`{id, metadata?}`，metadata 只有 `isHeaderRow`（`FLe` `@113439`）；列 `HLe`（`@114253`）＝`{id, metadata?}`，metadata 只有 `width`（`ULe` `@113872`）。⇒ **网格的"骨架"与"内容"彻底分离**：`rows`/`columns` 定义拓扑，`cells` 定义填充，三者各自是数组 ⇒ 插删行列不需要动 `cells` 全集。
4. ★★ **表级 style 三字段**：`NLe`（`@113439`）＝`{alternatingRowColor?, hasColumnsHeader?, hasRowsHeader?}`。⇒ 官方把"表头"做成**行、列两个独立开关**（外加斑马纹色），而不是"第一行/第一列特殊化"这种 DOM 约定。
5. ★★★ **单元格样式是 `|` 分隔的紧凑串，不是结构化 mark**：`ZLe` 只认 `blockStyleModifiers: string[]`；解析器 `_Le`（`@111675`）把串按 `l1e="|"` 切成数组后判位：`b`→`isBold`、`i`→`isItalic`、`s`→`isStrike`、`c`→`isCode`，再用前缀取键：`font*`（`RLe` 映射 `serif|sans-serif|rounded|mono` ↔ `Jt.System*`）、`highlightcolor*`、`textcolor*`、`align*`、`format*`。⇒ **与 §一之六 的 `TextStyle` 九值不是同一套编码**：正文块用结构化对象，表格单元格用这套紧凑串 ⇒ 复刻时两套不能互串。
6. ★★★ **渲染侧是 CSS Grid，不是 `<table>`**（`@4927747`）：先建 `Map` 键为 `` `${rowId}:${columnId}` `` → `blockId`，再**行优先**双层展开（`for(const A of p) for(const E of u)`，`p`=rows、`u`=columns）拉平成一维 `cellBlockIds`；容器样式 `gridTemplateColumns: repeat(colCount, 1fr)`、`gridTemplateRows: repeat(rowCount, auto)`；单元格内容按 `blockId` 从 `T.docStore.blocks[A] ?? null` 取。⇒ **列在该渲染器里是等宽 `1fr`**，`column.metadata.width` 存在但不参与这一路（★ 是否另有带宽度的一条渲染路径＝未采，见 仍未采到）。
7. ★★ **坐标钳位与反查**：`nY(t,e,n)` 把 `{row,column}` 夹到 `maxRow-1` / `maxCol-1`（`@716164` 附近）⇒ 存在以 **(row,col) 数值坐标**寻址单元格的键盘/选区路径；反查"某块属于哪个单元格"是 `for(const i of o.model.data.cells) if(i.blockId===t)` 的**线性扫描**（同处），⇒ `>600` 格时的性能瓶颈在结构上就存在（与动态项 H 同源，屏上仍未证）。
8. ★ **往返序列化不对称**：宽度写出走 `WLe`＝`` `${pct.toFixed(2)}%` ``（**字符串**，`@115889` 区），读入走 `s1()` 解析回数值再包 `{percentage}`；行/列 metadata 的序列化器 `zLe` 在 `metadata==null` 时写 `n.metadata={}`（**空对象而非省略**）。⇒ 与 §一之三十五 的"七组两向字段名"同族：**wire 形态与内存形态不同构，且会写空对象占位**。
9. ★ **单元格文本→样式的映射是"整格级"**：`OO(t,e)` 产出 `{start:0, length:e, highlightColor: t.highlightColor??void 0, isBold, isItalic, isStrikethrough, isCode}`（`@716164`）——`start` 恒为 0、`length` 是全文长度 ⇒ 至少在这条路径上**表格单元格不支持字符区间级富文本**。~ 未确认：`OO` 可能只服务导出/摘要而非编辑器内渲染，需要屏上或调用点复证。
10. ★ **记忆化层**：`Ro(t,e)` 以 `` `tableDataWithCaches-${id}` `` 为缓存键（`TQe` 是其别名，`@716164`）⇒ 表格的"带缓存视图"是按 table id 记忆化的独立对象，不是每次重算。

## 仍未采到（模型面·第 69 批刷新）

- **表格是否另有使用 `column.metadata.width` 的渲染路径**（§一之三十九 6 只证到 `repeat(n,1fr)` 等宽那一路）。
- **`OO` 的调用点**（整格级样式是渲染事实还是导出事实，§一之三十九 9 标 `~`）。
- **`S1e` 本体定义**：`@149391` 只见到 `Yn(t.pluginData,S1e)` 的引用，主 chunk 内 `S1e=` **0 命中** ⇒ 该 schema 应来自懒加载 chunk，尚未定位到具体文件。
- **列表项 / 待办 / 代码块在屏幕侧的标识**：仍未成功造出一个列表 ⇒ 无 `data-block-type` 之类属性可采（web 端建列表三条通路全失效，见 `gap.md` G617）。
- **块首 Backspace 的"装饰档"与"前块为非文本块"两档**：四档矩阵缺这两格。
- **`--indent-w` 是否随层级变宽**、**`_blockOverhang` / `--overhang-*` 何时非 0**：仍只测到 1 档 28px。
- **`data-slate-zero-width` 的全部取值**（只见过 `"n"`）、**`Ctrl+A` 选中态的真实 DOM 表达**（+14,159 B 但 `data-selected`/`aria-selected` 均 0）。
- **标题块与正文块 id 大小写两制的边界**。
- §一之三十三～三十六 遗留项不变：`HJe` 调用方、`tag_*` 宿主、`bD`/`qy` 实现体、`group{actions}` 应用器、16 个"仅在分派表出现"的 action 构造器、`w1e` 分支表、`S1e`/`DU`/`_U` 表格单元格模型、`uT`/`DC` 集合 schema。

- **块类型的屏幕侧标识**：普通文本块在 DOM 里靠什么属性区分 `textStyle`（本轮只见到 styled class hash 变化，没有 `data-block-type`）。⇒ ★ 需要成功造出一个列表/待办/代码块后再看 DOM。
- `data-slate-zero-width` 的全部取值（只见过 `"n"`）。
- 标题块与正文块 **id 大小写两制的边界**（是否"用户新建=大写、导入=小写"，或"space/doc 根块=小写"）。
- `Ctrl+A` 选中态的真实 DOM 表达（属性名/子元素）。
- 缩进档数上限与 `--indent-w` 是否会随层级变宽（只测到 1 档 28px）；`_blockOverhang` 与 `--overhang-*` 何时非 0（折叠/列表标记占位？）。
- §一之三十三～三十六 遗留项不变：`HJe` 调用方、`tag_*` 宿主、`bD`/`qy` 实现体、`group{actions}` 应用器、16 个"仅在分派表出现"的 action 构造器、`w1e` 分支表、`S1e`/`DU`/`_U` 表格单元格模型、`uT`/`DC` 集合 schema。


## 一之四十、块级键位的模型字段与兄弟序列（第 70 批·静态补账；证据＝`_harvest/js/index-DiTmKH3z.js` 逐字节，带偏移）

1. ★ **"前一块"不是文档序，而是 `subblocks` 兄弟序**：`Usn @3654478` = `e.indexOf(id)` 且 `e` 来自调用点的 `当前块.parent.subblocks`（@3641520）。⇒ 内容模型里**兄弟序列是唯一的邻接权威**；屏幕侧 DOM 扁平序列（§一之三十八）只是渲染产物。⇒ 复刻时 `prevBlock(id)` 必须走"父节点 children 数组下标 −1"，不能走文档展平序。
2. ★ **空块有两个不同定义，不可合并成一个谓词**：`Qr @706316` = `type===Text && 文本空 && subblocks.length===0`（多要求 type）；`z9e @3654615` = `文本空 && 无子块`。Backspace 用 `Qr` 判前块、用 `z9e` 判当前块 ⇒ **两把键共享的"空"语义不同**。
3. ★ **块的"装饰"是三个字段的一组，且退档是全清**：`styleProps.decorations.block` / `styleProps.decorations.focus` / `styleProps.color`；清除动作 = `[P2(ids, {block:0, focus:0}), fU(ids, null)]` ⇒ `decorations` 是**含 `block` 与 `focus` 两键的对象**（不是位掩码），`color` 用 `null` 表示"无"（不是 `"default"`、不是删键）。
4. ★ **`styleProps` 在本区间的字段面**（被键位码直接读到的部分）：`indentLevel`（number，下界 0 由 `sm` 守卫）、`listStyle`（枚举，空值是 `Nt.None`）、`decorations{block,focus}`、`color`、`runAttributes`（`$8(...).afterRuns` 按偏移切分）。⇒ 与 §一之三十九 的 cell `style` 紧凑串是**两个方向**：块级是对象，单元格样式是 `|` 分隔串。
5. ✓ **落点类型再确认**：块内位置只有 `{type:"textSelectionIndex", index:number}` 一种出现在键位码里（Enter / Backspace 两侧共 4 处），且 `index` 允许 `?? -1` 兜底（前块 `textContent` 为 null 时传 −1）⇒ **官方接受 −1 作为"未知/末尾"哨兵**，本地若做校验不能拒绝 −1。
6. ★ **选区构造器一览（表格侧新面）**：`Ft` 模块槽表 @600860 导出 `singleCellSelection` / `fullTableCellSelection` / `emptyTableCellSelection` / `toggleInTableCellSelection` / `cellBorderFromSelection` / `cellBorderFromFormulaCellReferences` ⇒ **单元格选区至少三态**，其中"空态"是显式构造器而不是 null；另有 `isHiddenInToggle` / `getNextVisibleBlock` 说明 **toggle 折叠对"可见块序列"生效**（与兄弟序列正交）。
7. ★ **`docActions` 数组允许 `null` 占位**：@700100 的 `bt([ss(...), c1(...), cond?ir(...):null, p>0?og(...):null])` ⇒ 条件动作直接以 `null` 留在数组里 ⇒ 复刻时 action 列表必须**容忍 null 项**（下游过滤），不能用强类型非空数组。

### 一之四十·追加（同批二次读取，修正第 1 条）

1. ★★ **修正第 1 条**：`Dsn`/`jsn` 用的邻接序列是 **`currentPage.subblocks`（页级展平块序列）**，不是"当前块的 subblocks"。⇒ 三条后果：① **跨页永不合并**；② 不在页顶层的块（折叠体内、表格单元格内）`indexOf < 1` ⇒ "删邻块 / 合并"两档**结构性不可达**；③ 缩进块**也在同一条序列里**（缩进＝`indentLevel` 字段，不是嵌套）⇒ `getIndentChildrenOfBlock` 大概率按"后续连续更大 indentLevel"计算，而非走 `subblocks`（定义体仍未读到，标 `~`）。⇒ ★ 同时说明：`subblocks` 字段在**页**与**块**上同名存在但用途不同（页＝正文展平序列；块＝真子块，如折叠/卡片），判"空块"的两个谓词都要求 `subblocks.length===0`。
2. ✓ **块装饰有两层，同名不同物**：样式侧 `styleProps.decorations{block, focus}` ＋ `styleProps.color`；UI 侧 keymap 组件 prop `decorations` 是**按 blockId 索引、条目含 `textContent`/`subblocks` 的块视图映射**（@3640560 props、@3647994 用法）。
3. ✓ **落点类型补一种**：`{type:"textSelectionFlatRange", selection}`（范围型，`qte` 构造 @3640520）与 `{type:"textSelectionIndex", index}`（点型，`F9e` 构造）并存 ⇒ undo/redo 副作用里的"选区"在**范围**时走前者。
4. ✓ **键位是 per-block React 组件**（`Tsn`，每块一份 keymap，props 带 `nextBlockId`）⇒ 官方没有"全局 backspace 拦截器"，块与块之间靠 props 传入邻块 id ⇒ 复刻时若用全局 ProseMirror plugin，需要在插件里自建"邻块查表"，且要接受"邻块 lookup 只在页级序列内"这条边界。

### 一之四十·三次追加（同批，表格/集合视图的渲染几何）

1. ✓ **降级门是"行×可见列"而非总格数**：`h8n(t) = t.rowCount * t.visibleColumnCount > 600`（`p8n = 600` @4791220）⇒ 复刻判据要用**可见列**（隐藏列不计）。
2. ✓ **虚拟化开关是单向棘轮**：`useState(门值)` ＋ `effect(门值 && !state ⇒ setState(true))` ⇒ 越过阈值后**不可逆**（缩回也不会关）。
3. ✓ **行级虚拟化几何常量表 `sE` @4790908**：`ROW_HEIGHT: 35`（固定 ⇒ 单元格内容不撑高行）、`CELL_H_PADDING: 10`、`POPUP_WIDTH: 264`、`EDITOR_OVERHANG: 10`、`EDIT_POPUP_OFFSET(type) = TEXT|NUMBER|URL|EMAIL|PHONE ? −10 : −4`、`getPlacementOffset = −35 + offset`、`getPlacementSkidding = offset`。⇒ 弹层定位是一个**纯函数**（输入单元格内容类型），可直接照抄。
4. ✓ **`overscan` 官方按屏各异**（`5 / 5 / 5 / 5 / 10 / 25 / 2`），分组列表另有 `group-header` 行高 `fxe = 40` ⇒ 不存在全局统一值。
5. ✓ **`Esc` 的三级降级依赖两种选区表达**：单元格用 `Ft.singleCellSelection(coord, tableId)`（`coord` 来自 `Ro(tableId, table).coordinateOfCell(cellId)`）、块级用 `St(Et.blocks([id]))`、文本范围塌回用 `eo.select(state, {focus, anchor: focus})` ⇒ ★ 官方选区有**三套互不兼容的表达层**（单元格坐标 / 块 id 集合 / Slate 范围）。

## 一之四十一、★ 重复/提醒字段的**取值边界**：`type` 两档封闭、`interval` 上限表、`dateOffset` 的 15 分钟栅格、周/月/年子结构必填对（2026-09-28 03:51 结案，`index-DiTmKH3z.js` @143016 / @143727 / @5425700 / @5436349 / @5438300 / @5449250；配套交互见 V54）

★ 本节只记**字段与取值边界**；行为序列、文案与键位见 V54。§一之二十二/廿三/廿四 已给出 `repeat` 的字段集与四档转换器，本节补的是"**合法值从哪来、越界怎么处理**"，不重复字段清单。

1. ★★ **`type` 是封闭二值枚举 `{fixed, flexible}`**，取值来源是 UI 侧的 `setRepeatType`，全站只有这两个实参（四个频率行都以 `d("fixed")` 开头；「相对于完成」行传 `"flexible"`）。⇒ §一之廿三 里"`type` 是什么"从"存在一个字段"升级为"**只有两个值、且值由哪个动作产生已确定**"。
2. ★ `type` 的**缺省值是 `flexible`**：`typeof e.type=="string" ? e.type : "flexible"`（@143016）⇒ 一条没有 `type` 的历史数据在读取侧被判为"相对完成"，但**写回时会把 `"flexible"` 显式落进对象**吗？⇒ 写侧转换器是否补默认值＝未采到（见本节末）。
3. ★★ **`type` 两档的语义锚点不同**（文案实证）：`fixed` ＝ 下一次按**原始计划日期**排（锚在日历，`tasks.complete.task.decs`）；`flexible` ＝ 下一次按**完成时刻 + N 个单位**排（锚在完成，`tasks.task.rescheduled.to.x.later`）。⇒ 这是 repeat 的**第三个正交维度**（前两维＝`frequency`、`interval`），且它决定**其余字段是否可读**：`flexible` 下 `weekly.days` / `monthly.dynamicDays` 被格式化器整体忽略（因为没有日历可锚）。
4. ★★ **`interval` 有每档上限**：`B3 = {daily:31, weekly:52, monthly:12, yearly:10}`（@5436349）。⇒ **值域不是"正整数"而是"1…cap(frequency)"**。越界处理是**单向复位 1**（`ft > An ? 1 : ft`，`An` 为新档位上限），**不是 clamp**；触发时机只有"切频率"，输入时不钳（⇒ `~` 到上限后 UI 形态未采）。
5. ★★ **`repeat.reminder.dateOffset` 的单位与粒度确认**：生成式 `y = b * Ov`、`Ov = 15`、条目数 `Math.floor(1440/15)` ⇒ **自午夜起的分钟数，步长 15，取值 0…1425，共 96 档**。⇒ §一之廿二 的"`dateOffset` 是当日分钟数"由 UI 生成侧闭环；也⇒ **它不是"提前多久"的相对量**（本地若按 lead-time 实现，语义完全不同，见 gap G639）。
6. ★ **`repeat.reminder.enabled` 是必填判据**：解析器 `mMe` 先算 `enabled = typeof e.enabled=="boolean" ? e.enabled : void 0`，**`enabled` 非布尔则整个 reminder 返回 undefined**（连 `dateOffset` 一起丢）。⇒ 与 §一之十七「缺失 ≠ 关闭」一致：**写 `{dateOffset}` 而不写 `enabled` 等于没有提醒**。
7. ★ **"有提醒"的判定是三条件与运算**：`t==null || !t.enabled || t.dateOffset==null ⇒ null` ⇒ **`enabled:true` 但偏移缺失会被降级为"无提醒"**（读取侧的隐性守卫）。
8. ★ **`dynamicDays` 元素 `{selector, type}` 两字段必须同时存在**：`v1e` 里 `if (!n || !o) return`（任一缺失即整条丢弃）⇒ **`{selector:"last"}` 单独不合法**。`selector` 值集在格式化器里只被读作 `"first"` / `"last"`（其余静默出空串）⇒ `~` 是否存在第三种 selector。
9. ★ **周/月/年子结构的类型互不通用**（`uMe`/`fMe`/`pMe`/`hMe` 逐字段回退）：`weekly.days` **只接受字符串数组**（星期名）；`monthly.days` **只接受数字数组**（几号）；`yearly.months` **只接受数字数组且为 1-based**（格式化器写 `new Date(2000, months[0]-1, …)`）；`skipWeekends` **只存在于 daily 与 monthly** 两个结构体。⇒ 本地 `days: number[]`（0=周日…6=周六）在两个维度上与官方不兼容：**类型不同、周起点不同**。
10. ★ **周序常量**：`$_n = ["monday",…,"sunday"]` ⇒ **周一起始**，与 V34 屏上网格、以及 §一之三十九 的日历周起始一致（三处互证）。
11. ★ **同一组件 props 上三套时间并列**：`Owe({block, onPickRepeatConfig, onReminderChange, reminder, repeatConfig, scheduleDate, onScheduleSelected, onClose})`，且内部 `const [mode, setMode] = useState("schedule")`、唯一的切换回调只做 `mode==="schedule" && setMode("reminder")` ⇒ ★ **"schedule / reminder" 是同一个弹层的两个档，默认落在 schedule，且该回调不提供反向切换**。`repeatConfig` 是第三个并列槽（走独立子面板 `TasksRepeatConfigCustomPicker`）。⇒ deadline 家族在 `Owe` 的 props 上**没有名字**（⇒ V40 的"deadline 与 schedule 共用选择器"仍成立，但共用点在 `Owe` 之外，`~` 未取到那层）。
12. ★ **集合日期格的数据形状**（`DateEditor` chunk）：属性编辑器不认"日期格"，而是**当场合成** `propMeta = {id:"date", name, theme: void 0, origSchema:{type: DATE, config:{}}}` ＋ `value = {type: DATE, theme: void 0, value: <日期|undefined>}` ⇒ ★ **集合里的日期是"临时冒充的动态属性"**，而文档内任务的 `scheduleDate` 是块上的**一等字段**（§11 三族命令）。⇒ 同一个"日期"在两处**根本不是同一类数据**。
13. ★ **弹层注册标识是字符串常量**：`"collection-v2-date-editor"` 与 `"TasksRepeatConfigCustomPicker"` ⇒ 官方有一张**按名字索引的弹层/键位注册表**（`cY` 退注用 `{isDisabled:true}` 而非卸载）。⇒ 这两个字面量可直接用于 `keyboard.md` 的作用域列。

### 仍未采到（模型面·第 71 批刷新）

- `type` 缺失时**写侧是否补成 `"flexible"`**（读侧补默认已证，写侧转换器 `wVe`/`kVe` 本批未重读该分支）。
- `dynamicDays.type` 的取值集（格式化器不读它，只有 `selector` 被消费）。
- `interval` 达上限后的界面形态（禁用 / 截断 / 静默复位）。
- `Owe` 之外那一层如何把同一选择器分派给 deadline 家族（V40 只证到结构一致）。
- ~~`dO(分钟, locale)` 实现体（96 档的显示串形态）~~ ⇒ ★ **第 72 批已结案**（@104119）：`HH:MM` 两位制式、载体当天、无时区参（见 §一之四十二 2）。
- ~~`L`（重复面板提交门控）的循环头判据~~ ⇒ ★ **第 72 批已结案**：四档真值表见 §一之四十二 3（★ `monthly` 用 `&&`、`yearly` 用 `||` 不对称）。

## 一之四十二、★ 提醒的两套编码与重复面板的合法性真值表（2026-09-28 04:08 结案，`index-DiTmKH3z.js` @104119 / @3584560 / @5417600 / @5430600 / @5448520；配套见 V55）

1. ★★ **同一个"提醒"在官方有两套互不兼容的形状**：
   - **重复配置内**的提醒 ＝ `repeat.reminder = {enabled: boolean, dateOffset: 当日分钟数}`（§一之四十一）——**表达式，不含日期**。
   - **真提醒对象**（`getNewBlockReminder(spaceId, documentId, blockId, dueDate, title)` 的产物）＝ 携带**绝对 `dueDate`（毫秒）**＋ `details = {type:"block", blockId, documentId}` ＋ 标题（**块文本，空则 `untitled` 本地化**）。
   ⇒ ★ 二者的桥是 `Lm(排期日, dateOffset) → Date`：**真提醒是每次现算出来的**，不是存下来的（机制见 `internals.md` §十六）。★★ **第 73 批修正**：这座桥有**两个桥墩、量纲不同** —— `$W`（提交路，@3584500）＝`Lm(nextSchedule, dateOffset)` **相对偏移**；`lj`（对账路）＝`Lm(Pr(排期日), dateOffset)` **当日墙钟** ⇒ 见 §一之四十三 3 与 §十七 1。
2. ★★ **`dateOffset` 的三个换算函数**：`Lm(date, minutes) → Date`（正向；★★ 第 73 批已读到本体 @104956＝**"时刻加 N 分钟"** ⇒ "当日墙钟"只在先过 `Pr` 的 `lj` 路成立，本条原判已限定范围）、`dO(minutes, locale) → "HH:MM"`（@104119，`Math.floor(t/60)` 时 ＋ `t%60` 分，用 `Intl.DateTimeFormat({hour:"2-digit",minute:"2-digit"})`，**载体是当天 ⇒ 只出时刻不出日期**）、`ole(Date) → h*60+m`（反向）。⇒ **三者都不带时区参数** ⇒ 官方重复提醒的"时刻"语义是**浏览器本地墙钟**。
3. ★★★ **重复面板提交门控（`L`）的真值表**——本批把它从"未读循环头"结成为四条：
   | `type` / `frequency` | 有效条件（源码判据） |
   |---|---|
   | `flexible`（任意频档） | **恒真** |
   | `fixed` ＋ `daily` | **恒真** |
   | `fixed` ＋ `weekly` | `(weekly.days ?? []).length > 0` |
   | `fixed` ＋ `monthly` | `!((days ?? []).length === 0 && (dynamicDays ?? []).length === 0)`（**二者至少其一**） |
   | `fixed` ＋ `yearly` | `!((days ?? []).length === 0 \|\| (months ?? []).length === 0)`（**二者都要有**） |
   ⇒ ★ **monthly 用 `&&`、yearly 用 `||`**，两条判据不对称 ⇒ 官方自身不一致的又一例（与 G579 同族，可屏验）。
4. ★ **面板内 `reminder` 是整字段替换**：`D = ne => p(re => ({ ...re, reminder: ne }))` ⇒ 与七个窄 setter（V54 §5.5）并存，**提醒是唯一"子对象整体换"的字段**。
5. ★ **`dynamicDays` 的 UI 可达取值集只有 `{selector:"last", type:"day"}`**（@5430810 唯一构造点）⇒ 格式化器读的 `selector === "first"`（key `first.small`）**在 web 端不可达**（只被读、不被写）⇒ **"模型 > UI"的单向富余档**；勾选态用 `some(N => N.selector === "last")` 聚合。
6. ★ **日号与月份都是多选 toggle**：月内日 `l.includes($)` ＋ `z_n(...)`；年内月 `months.includes(m) ? filter : [...months, m]`（`q_n` @5433576）⇒ 数字数组**去重靠 includes 分支**，`months` 是 **1-based**（§一之四十一）。
7. ★ **提醒变更的用户反馈是一条 toast**：`flashMessage({type:"info", title:"reminders.reminder.changed", subTitle:"reminders.next.reminder.time"{0: dO(dateOffset, locale)}}, 3000, ui)` ⇒ ★ 结掉 `interactions.md` 汇总表 **R5**（"提醒有『已解决』与『下次提醒时间』显示"）长期挂 `~` 的那半：**「下次提醒时间」出现在改提醒后的 toast 副标题里，时长 3 秒**，而不是常驻界面。
8. ★ **对账函数 `lj` 的变化判据只比 `dateOffset`**（不比 `enabled`）＋ **两道幂等守卫**（算出的时刻已过 ⇒ return；与既有提醒同 `dueDate` ⇒ return）⇒ ★ 记为**官方侧缺陷候选**：`enabled` 单独翻转静默无副作用；排期改到过去 ⇒ 提醒不更新且无提示。
9. ~ **块级 `reminder`（`⋯` 菜单与日期弹层两处入口）最终是否也写进 `repeat.reminder`**：本批只读到 `TasksReminderPicker` 走"绝对 `dueDate` ＋ `details`"这条，**未见它写 `dateOffset`** ⇒ 两套形状之间**除 `Lm` 现算外是否有回写通道**未证。

### 仍未采到（模型面·第 72 批刷新）

- ~~`Lm` / `Pr` / `Gl` / `getNewBlockReminder` 四个函数体~~ ⇒ ★ **第 73 批四取四得**（@104956 / @106407 / @3121990 / @3127430，见 §一之四十三 1/3/7）；★ 其中"合成"一说被**改判**为"时刻加 N 分钟"（§一之四十三 3）。
- ~~`F` 旗标（`clear-monthly-days` 项出现条件）~~ ⇒ ★ **第 73 批结案：不是旗标**，是局部派生布尔（§一之四十三 13）。`st.flashMessage` 的入队去重（连发同 key 是否覆盖）**仍未采到**。
- 承接 §一之四十一 的未采项：写侧是否补 `type:"flexible"`、`dynamicDays.type` 全集、间隔到顶后的界面形态、`Owe` 之外那层的 deadline 分派。

## 一之四十三、★ 提醒实体字段集与日期原语层（2026-09-28 第 73 批结案，`_harvest/js/index-DiTmKH3z.js` @104434–@106407 / @728375 / @3121990 / @3124131 / @3127088 / @3127430 / @3127560 / @3584500；配套 V56，★ 并**修正 §一之四十二 的两处口径**）

1. ★★ **提醒实体字段集**（`Pzt`@3127430 逐字）＝ `id`（`Bn()` 本地新 id）＋ `type:"block"` ＋ `spaceId` ＋ `dueDate`（**可为 `undefined`**）＋ `isCompleted:false` ＋ `created` ＋ `updated` ＋ `title` ＋ `details:{type:"block", blockId, documentId}`。⇒ ★ **实体侧没有 `enabled`／`dateOffset`**（§一之四十二 1 的"两套形状"在实体侧逐字确证）；★ `type` 与 `details.type` **双写同值**。
2. ★★★ **`reminder.type` 至少两值 `{block, custom}`**（`o9 = t => t.type === "custom"` @3122010）⇒ `custom` 提醒不绑块、因而不被 `Gl` 认可、不被 `findReminderByBlockId` 找回。⇒ ★ §一之四十二 的"两套形状"要读成**两套形状 × 两种 type**；`custom` 的创建入口未采到（`~`）。
3. ★★★ **`dateOffset` 的量纲随写路径而变（本批对 §一之四十二 2 的修正）**：`Lm(t,e)` 本体是**"加 e 分钟"**（@104956，与 `y0` 加小时、`zq` 加秒同构）；⇒ **`$W`（提交派生，@3584500）＝ `Lm(nextSchedule, dateOffset)`（相对排期时刻的偏移）**，而 **`lj`（对账派生）＝ `Lm(Pr(scheduleDate ?? new Date()), dateOffset)`（当日墙钟分钟数）**。⇒ 官方同一个字段在两条通路里语义不同 ⇒ **"提醒＝当日分钟数"仅适用于 `lj` 路**。
4. ★★ `$W` 的守卫是**六条**（提醒存在／`enabled!==false`／`dateOffset!=null`／`nextSchedule!=null`／`spaceId!=null`／`documentId!=null`），★ **`blockId` 不在守卫内** ⇒ 可产出 `details.blockId===undefined` 的提醒（V55 记作"五条件"，本批更正）。
5. ★★ **提醒 API 面十项**（`lo`@3127560 逐字）：`onCreateOrUpdateReminder`／`onCreateOrUpdateReminderWithResult`／`onMarkCompleted`／`onDeleteReminder`／`getNewReminderId`／`isNewReminderId`／`logReminder`／`findReminderByBlockId`／`getTitleForReminder`／`getNewBlockReminder` ⇒ ★ **有"是否新 id"谓词** ⇒ 未落库提醒以临时 id 存在。
6. ★★ **提醒列表是 react-query 缓存投影**（@3127880）：`pP = fromMinutes(1)` ⇒ **staleTime＝cacheTime＝refetchInterval＝1 分钟** ＋ `refetchOnWindowFocus:"always"` ＋ `retry:1` ＋ `keepPreviousData:true`；返回体分 `incomplete`／`completed` **两桶**；`Izt`（findReminderByBlockId）＝**按桶线性扫** `Gl(o) && o.details.blockId===blockId`。⇒ ★ 提醒的"存在性"取决于缓存是否已取到（缓存未命中＝查不到提醒）。
7. ★★ **可找回判据 `Gl`**（@3121990）＝ `type==="block"` ＋ `details?.type==="block"` ＋ `spaceId!=null` 三项与运算 ⇒ 绑块且绑空间才谈得上"这条块的提醒"；勾选完成级联 `irn`@3875820（找 `incomplete` → `Gl` → `isCompleted:true`）是 R5「已解决」的函数级出处。
8. ★★ **提醒快选六档 `rr`**（@3122040）＝ `20min`／`1hr`／`3hr`（从"现在"起算）＋ `tomorrow`＝**明天 09:00**＋ `next_week`＝**下周一 09:00**＋ `later`＝**`null`（空值档）** ⇒ ★★ 官方把"提醒默认时刻"锚在 **9AM**；V38 屏上的"默认 17:00"只是 96 档栅格按当时墙钟定位的实例。
9. ★★★ **日期原语层集中一处**（@104434–@106407）：`Pr` 归零／`Qo` 今天零点／`T5`·`bw` 明天·昨天零点／`B1` 加天（＋ `sLe`"Must be positive"、`iLe`"Must be negative" **方向断言**）／`y0`·`Lm`·`zq` 时·分·秒偏移／`ec`·`lLe`·`cg`·`uO` 天·周·月·年（后二者**不归一**）／`Qce` 本周一（monday-first）／`Yce` 本周周日（sunday-first）／`A4` 下周一／`Gq{Sunday=0,Saturday=6}`·`IU` 周末判定／`aLe` **跳过周末档的实际落点＝明天，若周六或周日则下周一**。⇒ ★★ **官方一周有两套起点**（`weekly.days` 展开用 monday-first，周末判定与 `A4` 用 sunday-first）⇒ 复刻不能统一成一根 `getDay()`。
10. ★★ **排期缺省规则 `L$`**（@728375）＝ `(repeat, schedule) => repeat==null || schedule!=null ? schedule : Qo()` ⇒ ★ **不允许"有重复但无排期"的中间态存在**：刚加重复且排期为空 ⇒ 自动写"今天零点"；两处调用点（@5467531 面板确认、@5476567 批量）都是把它放进同一个 patch。
11. ★★ **批量改重复配置的形态**：`W.length===1 ? W[0] : {type:"group", actions:W}` **一次派发** ＋ ★ 随后 `for…of` **逐条** `sp(...)` 与 `lj(...)`（共 4 个 `lj` 调用点：单任务／面板确认／批量／多选批量）⇒ `~` 提醒写入是否并入同一撤销步取决于 `QB`/`sp` 是否共用 patchId（本批未读）。
12. ★ **提醒标题按块类型本地化**（`Lzt`@3127088）＝ File→`model.fileName` 或 key `file.in{0}`；Image→`image.in`；Drawing→`drawing.in`；Video→`video.in`；Table→`table.in`；whiteboard→`whiteboard.in`；其余→块文本（截断规则未读全）。⇒ ★ key 家族 `*.in` ＝"某块里的提醒"。
13. ★ **`clear-monthly-days`（「取消选择全部」）不是旗标**：出现条件＝局部派生布尔 `已选日号.length>1 || dynamicDays.length>0`（@5430914 年档、@5435110 月档同型），清空动作**一次写两个字段** `{days:[], dynamicDays:[]}` ⇒ 结掉 §一之四十二／V55 的 `F` 旗标挂账（原判"受旗标控制"是**误读局部变量名**）。

### 仍未采到（模型面·第 73 批刷新）

- ~~`Lzt` 里"其余→块文本"的截断/省略号规则~~ ⇒ ★ **第 74 批结案**：`Lzt` 全体已读（@3126690），**没有截断/省略号逻辑**，真正的形状是**按块型选 6 个 `*.in` i18n 模板**（§一之四十四 6）。`custom` 类型提醒的创建入口（`Tzt`）与 web 可达性**仍未采到**。
- ~~`QB`／`X7e`／`Dzt`／`_zt` 四个提醒写入器的实现体（**提醒是否进撤销栈**）~~ ⇒ ★ **第 74 批结案**：`QB` 是 `await X7e(...)` 的转发，`X7e`→`Szt`→`q2.setBlockReminder({blockId,documentId,spaceId,title,dueDate,isCompleted,completionDate,deeplinkUrl})`，★ **零 `docDispatch` ⇒ 不进撤销栈**，另有配额门 `Y7e`（数值未知）；`EW`（埋点）与 `Tzt`（custom 写入）仍未读（§一之四十四 1–4、V57 §3）。
- 承接 §一之四十二：`Pr` 之外 `getNewBlockReminder` 的 `details` 是否还有别的 `type` 取值（`{type:"block"}` 之外）、`lj` 与 `$W` 各自的调用时序关系（谁先谁后、是否重复写）。
- 承接 §一之四十一：写侧是否补 `type:"flexible"`、`dynamicDays.type` 全集、间隔到顶后的界面形态、`Owe` 之外那层的 deadline 分派。

## 一之四十四、★ 提醒的远端契约与配额 ＋ 表格硬上限常量 ＋ `day://` 日记 URI ＋ `indentLevel` 的几何语义（2026-09-28 第 74 批结案，`_harvest/js/index-DiTmKH3z.js` @3123027 / @3126147 / @3126617 / @3126657 / @3126690 / @3127439 / @630585 / @698700 / @106407–106714 / @600898–605060；配套 V57 / §十八，★ 并修正 §一之四十三 的"九字段"口径）

> 全部来自本地留存 bundle 的逐字反编译（`_harvest/js/index-DiTmKH3z.js`），证据链见 `interactions.md` V57、`internals.md` §十八。**零写入、无屏幕证据**（§6 判据未满足）。

1. ★★★ **提醒实体有第 10 个字段 `completionDate`**：出厂 `Pzt`@3127439 **不带**该键；`onMarkCompleted`（`Dzt`@3126657）完成时写 `Date.now()`、取消完成写 **`completionDate: void 0`（显式空值，不是删键）** ⇒ 完整字段集＝`id / type:"block" / spaceId / dueDate / isCompleted / created / updated / title / details{type,blockId,documentId}` ＋ 写入期补的 `completionDate / deeplinkUrl`。★ 修正 §一之四十三 1 的"九字段"说法：那是**出厂态**计数，不是实体全貌。
2. ★★★ **提醒的远端契约是 8 个入参**＝`setBlockReminder({blockId, documentId, spaceId, title, dueDate, isCompleted, completionDate, deeplinkUrl})`（`Szt`@3123027）⇒ 这是目前**唯一逐字读到的**提醒后端调用形状（只记前端调用点，不猜协议）。
3. ★★ **提醒自带深链且写死允许编辑**：`deeplinkUrl: i.deeplinkUrl ?? mn.buildDynamicDeeplinkToBlock({blockId, documentId, spaceId, editingAllowed: !0})` ⇒ 与块深链**同一个工厂**，且**已有值就不覆盖**。
4. ★★ **提醒有配额，且"进行中／已完成"分两条上限**：写入前先过 `Y7e(reminder)`，不过 ⇒ `st.flashMessage({type:"error", title:"alert.cannot.add.more.reminders", subTitle: isCompleted ? "alert.max.resolved.reminders" : "alert.max.in-progress.reminders"}（参数 `{0: Bx(isCompleted)}`）, st.ERROR_DURATION, ui)` 并 **`return !1`**。★ 上限**数值仍未采到**（`Bx`／`Y7e` 未读）。
5. ★ **未落库的乐观提醒靠 id 前缀辨认**：`J7e="new_reminder_"`、`getNewReminderId=()=>`${J7e}${Bn()}``、`isNewReminderId=t=>t.startsWith(J7e)` ⇒ 没有独立布尔位（§一之四十三 记过这两个 API 的名字，本条给出真实语义）。
6. ★★★ **提醒标题是按块型选的 i18n 模板**（`Lzt`@3126690 全体）：File→**`file.in`**（有 `model.fileName` 时**直接用文件名**）、Image→`image.in`、Drawing→`drawing.in`、Video→`video.in`、Table→`table.in`、白板→`whiteboard.in`，参数一律 `{0: 容器名}`；**其余才** `t.textContent || _e("untitled")` ⇒ §一之四十三 的"块文本→untitled"其实排在最后。
7. ★★★ **表格硬上限**（`As`@630585）＝`MAX_ROW_COUNT:50`、`MAX_COL_COUNT:15`、`MAX_CELL_COUNT:750`。★ 与 §十五 的"600 门"**分层不冲突**：600 是渲染层"行×可见列"棘轮，**750 才是数据上限**。超限反馈＝error toast `alert.table.size.limit.reached`（参数 `{0:MAX_COL_COUNT, 1:MAX_ROW_COUNT}`）＋ 副标题 `alert.try.smaller.tables`，时长 **4e3 ms**（`m2e`@698700）。
8. ★★ **表格/页面几何 token 一批**（同一 `As` 与相邻对象）：`BASELINE_COL_WIDTH:375`、`MIN_COL_WIDTH:100`、`MIN_AUTO_WIDTH:168`、`MIN_SIDE_MARGIN:48`、`GAP_SIZE:1`、`CELL_RIGHT_PADDING:14`、行指示条 `32 + 8`、列指示条 `24 + 8`；宽版几何 `COLUMN_WIDTH_WITH_MARGIN_WIDE:1280`、`MIN_SIDE_MARGIN_WIDE:32`、`SIDE_MARGIN_WIDE:32`、`BLOCK_DOTS_MENU_MIN_MARGIN:5`、`BLOCK_DOTS_MENU_SIZE:32`、`LEFT_SIDEBAR_WIDTH:288`、`PADDING:6` ⇒ 可直接进设计 token 对照表。
9. ★★ **日记深链形状**：`e1e`@106530＝`"day://" + YYYY + "." + MM + "." + DD`（**点分＋零填充**）；解析 `TU`@106714 的正则 `^(?<year>\d{4})[-.](?<month>\d{1,2})[-.](?<day>\d{1,2})$` ⇒ ★ **同时吃点分与连字符**、不匹配给 `new Date(NaN)`；`yw`＝剥前缀后交 `TU`。⇒ **写读不对称**（写只写点分，读两种都收）。
10. ★ **日期差值口径**：`cLe`＝`(a-b)/1e3` 秒差、`pk`＝其绝对值、`Kq`＝**`Math.floor((a-b)/864e5)`**（★ 按 24 小时整除的"天差"，**不是日历日差**）、`dLe`＝`(年差)*12+月差`、`uLe`＝年差；`_1o`@106470＝**日终**（`Pr(t)+1 天−1 ms`）；`Pr`@106407 内部 `setHours(0)` 之后又 set 了分/秒/毫秒（★ 冗余保险，语义不变）。
11. ★★★ **`indentLevel` 是"可空数字样式属性"，缩进子树纯按位置几何判定**：`K0e`@605060＝"紧随本块之后、`indentLevel` **严格更大**的一段连续兄弟，遇到第一个不大于自己的即止"；★ **档号为 `null`/`undefined` 的块既不算子树、也不切断子树**（`nD`@604447 的条件是 `c!=null && pred(c)`）；`o$`@604974 只用 `parentId` 取**同层表**而非取子级；`Aw`（缩进父链）把 `null` 与 `0` 同判"无父"；`rze`＝选区最小档（`Math.min`，null 被滤）。⇒ 官方**同时存 `parentId` 与 `indentLevel` 两套层级信息，子树只认后者**。
12. ★★ **订阅限额是"写后报错"，两个键**：`applyAction` 的 `error.userError===UO.SUBSCRIPTION_LIMIT_REACHED` ⇒ `webappUiDispatch({id:"paywall", payload:{title:"subscription.pro.block.limit.reached", description:"….desc"}})` ＋ `logEvent("subscriptionUpgradePopupDisplayed", {feature:"block-limits"})`；`UO.SUBSCRIPTION_DOCUMENT_LIMIT_REACHED` ⇒ documents-limits 版（@6442030）。⇒ **不是先校验后放行**。
13. ★ **编辑埋点绑 `shouldSync`**：`shouldSync && actions.length>0` ⇒ `logGrowthAnalyticsEvent("editDocument", {spaceId, documentId, stringValue1: documentId})`（@6441016）⇒ 与"是否可撤销"**无关**。
14. ★ **长尾两条**：① 文档已被删 → toast `alert.document.removed`（时长 **2500 ms**）＋ `redirectTo(routeBackToHome)`；② 块三点菜单首项＝`{id:"craftAssistant", analyticsId:"assistant", label:"assistant.assistant", tags:["assistant","summarize","translate","continue","writing","ai"], hidden:!1}`（@3878980）⇒ **菜单项自带搜索标签**，且 `Obe`（该菜单项工厂）的入参含 `blockHasReminder / isTaskBlock / hasTaskSchedule / hasTaskDeadline / setBlockTaskScheduleDate` ⇒ **三点菜单直接感任务三时间**（G 项新线索）。

### 仍未采到（模型面·第 74 批刷新）

- ★ **提醒配额的具体数值与计数口径**（`Y7e`／`Bx` 未读）；`Tzt`（custom 提醒）的入参形状 ⇒ `type:"custom"` 的完整字段集仍未拿到。
- `forcedViewOnlyMode` 的定义与置位方；`UO.*` 错误码全集；`insertNewBlocksToTable…` 的完整动作名单。
- `indentLevel` 是否有上限（§一之四十一 的 `B3` 只压过重复间隔，未压档号）；`children:lze` 与 `o$` 的差别未读。
- `As` 之外是否还有 daily-note／whiteboard／文档块数的独立上限对象。
- 承接 §一之四十三：`repeat.type` 写侧是否补默认、`dynamicDays.type` 取值集、间隔到顶后的界面形态、`Owe` 之外那层的 deadline 分派。

## 一之四十五、★★★ 官方桌面端 MCP 契约：`taskInfo` 字段名、`repeat` 完整 JSON、logbook 子块、三态序列化、文档双 id（2026-09-28 第 75 批实测，通道＝`craft_read`/`craft_write` MCP，space `<spaceId>`）

1. ★★★ **任务的时间载体叫 `taskInfo`，字段名是 `scheduleDate` / `deadlineDate` / `completedAt` / `canceledAt` / `state`**（实测读回，逐字：`"taskInfo":{"state":"todo","scheduleDate":"2026-09-28","repeat":{…}}`、`{"state":"todo","deadlineDate":"2026-09-29"}`、`{"state":"done","completedAt":"2026-09-28T05:34:57.058Z"}`、`{"state":"canceled","deadlineDate":"2026-09-29","canceledAt":"2026-09-28T05:35:39.366Z"}`）⇒ ★ **排期与截止是"日期"（`YYYY-MM-DD`），两个时刻字段是"UTC 毫秒 ISO"** ⇒ 同一对象里**两种日期类型并存**，与 §一之四十二 的三套提醒量纲合起来＝**官方日期制有四套**。
2. ★★★ **`repeat` 的完整写侧形状（第一次拿到全貌，且可读回）**：`{"type":"fixed"|"flexible","frequency":"weekly","startDate":"2026-09-28","weekly":{"days":["monday","wednesday","friday"]},"reminder":{"enabled":true,"dateOffset":540}}` ⇒ ① `type` **写侧有默认**（缩写不带 type ⇒ `fixed`，结掉遗留项）；② `frequency` 是**独立字段**（不是从 `type` 推）；③ ★ **`startDate` 存在且完成一次后不前移**（`scheduleDate` 才前移）⇒ 双指针模型；④ `weekly.days` 是**全名小写字符串**（`monday`…）⇒ 本地 `days:number[]` `0=Sunday` 是另一种载体；⑤ ★ `reminder` **嵌在 `repeat` 里**（不是 `taskInfo.reminder`）⇒ 提醒的两种形状在模型层坐实：块级提醒＝实体（§一之四十三），重复内提醒＝`repeat.reminder` 表达式。
3. ★★ **建重复即自动挂 `reminder:{enabled:true,dateOffset:540}`**（`540` 分＝**当日 09:00**，且 `540/15=36` 落在 96 档栅格上）⇒ §一之四十三 的"官方锚 9AM"从快选档推断**升级为写侧默认值实测**；非重复任务（只有 `deadlineDate`）**不挂 reminder** ⇒ 默认提醒只随重复出现。
4. ★★★ **logbook 是"母块自己长出的子页"**：`state done` 后母块 `type` 由 `text` 变 **`page`**（`textStyle:"page"` 与 `listStyle:"task"` **并存**），子块 id 前缀 **`block_logbook_`** ＋ UUID，`markdown:"Completed tasks"`，其内一条 `type:"text"` 任务行（`state:"done"` ＋ `completedAt` ＋ `markdown:"- [x] B75-T1 fixed weekly (2026-09-28)"`）⇒ ★ 完成历史**就地嵌套**、行文本带**括号日期后缀**；`new_reminder_`（§一之四十四）与 `block_logbook_` 是**同一族"合成 id 前缀"**（第二个成员）。
5. ★★★ **三态在两处序列化里表示不同**：`canceled` ⇒ markdown 是 `- [ ] ~标题~`（★ checkbox **不变**，靠 `~删除线~`），而 `tasks list` 的行首符号是 `[-]`；`done` ⇒ markdown `- [x] 标题 (YYYY-MM-DD)`、列表符号 `[x]` ⇒ **同一状态在 markdown 层与列表层各有一套记号**（本地 `status` 单列无法承载）。
6. ★★ **一个文档有两根 id**：`rootBlockId`（块树根，给 `blocks`/`tasks --document` 用）与 `documentId`（给 `craftdocs://open?spaceId=…&documentId=…` 与 web `/editor/d/<space>/<documentId>` 用），**两者是不同的 UUID**（实测 `d657d3af-592c-…` ↔ `f29ed610-1496-…`；`d8af008b-7492-…` ↔ `6cc9761c-874a-…`）⇒ ★ 之前把 URL 尾段叫 "doc id" 是对的，但它**不能**当 `blocks get` 的参数；`documents resolve-link <url>` 就是这层映射的官方入口。大小写两制在两根 id 上都出现（`DFF43C2D…` 大写 vs `2db38d6b…` 小写）。
7. ★★ **`documents delete` ＝软删**：`--document <rootBlockId>` ⇒ 进回收站、**30 天自动清除**、`documents move --destination unsorted` 可还原；写侧 `documents` 只有 `create`/`move`/`delete` 三个动词 ⇒ **无"清空回收站"API**。★ 作用域口径：`documents list` **不带 `--location` 时含回收站**，`--location unsorted|trash|templates|daily_notes|folder` 才是过滤 ⇒ 判"是否真删"只准用 `--location unsorted`。
8. ★★ **`blocks get` 的截断开关是 `contentPreviewMd`**：`--depth 2` 时 logbook 子块只给 `contentPreviewMd:"- [x] … (2026-09-28)"`，`--depth 3` 才展开成 `content` 数组 ⇒ 与 §一之四十二「序列化两开关」并列的**第三个开关（深度截断预览字段）**。
9. ★★ **任务查询作用域五档**：`tasks list --scope active|upcoming|inbox|logbook|document|all`（`all`＝全空间每个任务块，不是并集）；★ `--scope upcoming` **也返回只有 `deadlineDate` 的任务**（⇒ "upcoming" 不是"仅 schedule 在未来"）；`in:` 字段给归属（文档名＋rootBlockId，或字面 **`inbox`**）；`repeat:` 行的可读串＝`weekly (fixed) on monday, wednesday, friday`（★ type 在括号内、日名全名、逗号＋空格分隔）。
10. ★★ **写侧三值枚举齐了**：`--state todo|done|canceled`（★ 没有 `doing`）、`--location inbox|dailyNote|document`（默认 `inbox`）、`--date YYYY-MM-DD|today|tomorrow|yesterday`（配合 `dailyNote`）；`--tasks '<json array>'` 是批量入口（官方文案：「比多条命令更快」）；「done/canceled tasks auto-move to logbook」＝官方自己给出的两态去向声明（★ canceled 实测**没有**产生 logbook 子块，只有 `canceledAt`＋删除线 ⇒ **文案与行为不符，官方缺陷候选第 4 条**）。
11. ★ `page` 根的读回形状：`{id, type:"page", textStyle:"page", markdown:<标题>, content:[…]}`；★ 空页多一个 `styling:{fontFamily:"system"}` 而有内容的页**没有** `styling` ⇒ `styling` 是**可选、仅在非默认时出现**（`system` 是字体枚举的一个成员，其余取值未采）。
12. ★ `documents create` 的回执形状（对新实体有用）：`rootBlockId` ＋ `Next: blocks add --id …` ＋ `Craft app link: craftdocs://open?spaceId=…&documentId=…`，并明确「加正文用 `blocks add`，不要写标题」；`--destination unsorted|templates|folder`。
13. ★ 错误串（新的可采语言包面）：`Could not find this document in the current MCP scope.` ＋ `Hint: run documents list --metadata to see accessible documents and their rootBlockIds.` ⇒ ★ **MCP 有自己的 scope 概念**（不等同整个 space），批处理失败即停（`Stopped after failure; earlier commands were already applied.` ⇒ **分号批处理不是事务**，两条 update 各自成步，实测 `completedAt` 相差 282 ms）。
14. ★ `reminders list [--status incomplete|completed|upcoming|all]` 存在且 `all` ⇒ 本空间 `No reminders found`，而两个重复任务带 `repeat.reminder` ⇒ **重复内提醒不在提醒列表里**（待定案，见 §三点八六 仍未采到）。

### 仍未采到（模型面·第 75 批刷新）

- `repeat` 的其余频率子对象形状：`daily`/`monthly`（`days`、`dynamicDays`）/`yearly`（`months`）的**写侧 JSON**、`interval` 字段名与缺省、`monthly` 的 `dynamicDays.type` 取值集 ⇒ ★ 下一批用同一通道可**直接结案**（`tasks add --repeat monthly:1,15` 与 `--repeat yearly` 读回即可）。
- `block_logbook_` 的粒度：同一母块多次完成是否累积多条？canceled 是否也可能进 logbook（文案说会、实测说不会）？logbook 子页能否被 `blocks delete` 单独删？
- `styling` 的完整取值集（`fontFamily:"system"` 之外还有哪些、`codeFontFamily` 是否存在）。
- MCP `--scope` 与屏上 `/tasks`、`/calendar`、`/inbox` 的对应关系；`documents list --metadata` 之外是否有 `trashedAt`/`purgeAt` 字段（回收站 30 天倒计时的载体）。
- `tasks update` 的 flag 全表（能否单改 `--schedule`/`--deadline`/`--repeat` 而不互相覆盖；本地 `onSchedule` 是合并语义，官方是逐字段还是整体替换待定）。
- 承接 §一之四十四：`As` 之外是否还有 daily-note／whiteboard／文档块数上限对象；`forcedViewOnlyMode` 的置位方；`UO.*` 限额错误码全集。

## 一之四十六、★★ 官方 MCP 契约全表：`--position` 两方言、页面样式 18 旗标、提醒实体的"无时刻态"、集合 schema 七条硬规则（2026-09-28 第 76 批，通道＝`craft_write --help` ＋ `blocks learn`，**零写入**）

1. ★★ **`--position` 是（锚类型 × 方向）二维**：`blocks add` 用 `--id <rootBlockId>` 或 `--date <daily>` ⇒ 位置只允许 `start|end`（默认 `end`）；用 `--siblingId` ⇒ 只允许 `before|after`（默认 `after`）。`blocks move` 源用 `--id`/`--ids`，目标三选一 `--targetId|--targetDate|--targetSiblingId`，位置 `start|end|before|after` 按目标类型收窄；官方给出改名理由：「Move uses --targetId/--targetSiblingId (not --id/--siblingId from 'blocks add') because --id is already used for the source block」。⇒ 同一概念在两个动词下**旗标名不同**（`--siblingId` vs `--targetSiblingId`），这是官方自己的命名分裂，不是我们的推测。
2. ★★★ **页面样式＝一组正交属性，且官方明文否认"自定义样式对象"**。`blocks add` 的样式旗标五族共 18 个：
   - 字体：`--font system | system-serif | system-rounded | system-mono`，别名 `sans-serif / serif / rounded / mono`（★ 四个正式值全部以 `system` 开头）。
   - 三通道色：`--text-color` / `--bg-color` / `--theme-color`，每个都接受 `#RRGGBB` **或** `"#light #dark"`（★ 官方称 appearance-aware，即明暗双值写在同一个参数里）。
   - 封面：`--cover-url`、`--cover-crop`（`x,y,width,height`，值域 `0.0–1.0`）、`--cover-attribution`。
   - 背景：`--backdrop-type solid | gradient | image | pattern | none`，并按类型**必填对应项**（`solid`→`--backdrop-color`、`gradient`→`--backdrop-colors` 逗号分隔＋`--backdrop-direction`（默认 `top-to-bottom`）、`image`→`--backdrop-url`）。
   - 分隔：`--separator line | doodle | washi | none` ＋ `--washi-pattern`（示例 `wave,hex,stripe,dot`）＋ `--washi-color (#RRGGBB)`。
   - 主题：`--theme-id`（示例 `fire-horse`、`soft-spring`），发现入口 `blocks explore-themes --type page`。★ 收尾一句硬边界：「**Custom style IDs are not supported.** To achieve a custom look, set properties one-by-one (backdrop, colors, etc.) or use a built-in theme.」
3. ★★ **markdown 三条扩展 ＋ 折叠子级规则 ＋ 输入净化契约**（`blocks add --help`）：`<callout>…</callout>`＝提示块；行首 `+ `＝`listStyle=toggle` 的普通文本块（★ 官方明确"它就是一个 listStyle=toggle 的 regular text block"）；`>`＝引用。toggle 的子级**必须缩进在标题行之下**，「同级的普通文本行会变成**空 toggle**」，并给出改写示例。正文侧：「不要把文档标题重复写进正文，`documents create` 已经建了标题」；换行用真实换行符，「转义的 `\n\n` 可当段落间隔，单个 `\n` 仍是文本，避免双转义」。
4. ★★★ **提醒实体（`reminders create|update|delete|list`）有"无时刻态"和独立完成位**：`create --block <id> [--at <ISO>]` 或批量 `--reminders '[{"blockId","remindAt"}]'`（★「Batch JSON matches the REST reminders array」⇒ 提醒是有 REST 数组形态的一等实体）；**省略 `--at`/`remindAt` ＝ Save for later without a notification**；`update --reminder <id> [--at … | --no-reminder-time] [--completed true|false]`，★ 两条耦合规则成文：「Changing or clearing the time **reopens** the reminder unless `--completed true`」与「**Completing a reminder does not complete the block's task**」⇒ 提醒完成与任务完成**双向解耦**，而"改时刻自动重开"是官方默认。时刻格式：`--at` **必须以 `Z` 或显式 UTC 偏移结尾**；时区解析链＝**请求者时区 →（缺省）空间时区**，相对日期（tomorrow）按该时区当天推算，DST 模糊/不存在时刻要求回头问用户。
5. ★★★ **集合 schema 的七条硬规则**（`collections schema-update --help`）：常规列类型集 `text number boolean date url email phone select multiSelect relation`（别名 `checkbox→boolean`、`select→singleSelect`、`link→url`；`relation:targetCollectionId`）；**上限 20 列**；**每个集合恰一个 title 列，恒为 text、不可删，只能用 `--title` 改名**（新建默认叫 `Title`）；列 key 自动生成 `prop0/prop1…`，**用已有 key＝更新该列（保数据、可改名）、用新名字＝加列、★ 省略某个已有列＝删列并删其数据**（全量替换语义）；**常规列类型不可变更**（text 不能变 number）；保留名 14 个（`allow-new-options collection content debug document help id name position property title verbose`）不可用作新列名，改同名既有列要 `--prop:<key>`；`--allow-new-options` 才允许 select/multiSelect 造新选项。☆ **官方类型表里没有 formula、file、created_at、updated_at，但有 `phone`**（对照见 §三点八七 G676）。
6. ★★ **集合行的两级写入**：`items-add --collection <id> --<显示名> <值>`（★ 用**显示名**而非 schema key，大小写不敏感；保留名要用 `--prop:title` 这类前缀）或批量 `--items '[{"title":…,"properties":{…}}]'`；★ 行本身是 **page 块**，正文必须「先建行，再 `blocks add --id <item-id> --position end --markdown …`」，官方明令不要为行内正文另建行；不给标题值 ⇒ 行显示 **`(untitled)`**。值格式：boolean 接受 `true/false/yes/no/1/0/on/off`、multiSelect 用逗号串、`relation`/`blockLink` 用 **blockId**。读侧限制承接 §十九：集合行不能用 `blocks update`。
7. ★★ **`blocks delete` 的四条约束**：回执**只有数量**（不回显 id）；父块删除**可能级联**子块；集合行须改用 collection 工具；★ **回收站内文档的块必须先还原才能变更/删除**。⇒ 与「写侧 `documents` 只有 `create|move|delete`、无 purge 动词」合起来＝**API 侧无法清空回收站**。
8. ★★ **`documents move` 的落点模型**：`--folder <id>` 与 `--destination <unsorted|templates>` **互斥且必选其一**；删除走 `documents delete`，从回收站还原＝`move --destination unsorted`；★ **Daily notes cannot be moved**；官方还要求「移动前先记录当前位置以便回退」，并把发现入口写进回执（`documents list` 取 rootBlockId、`documents resolve-link` 取 id 映射、`folders list` 取 folderId）。
9. ★ **五处成文的批量入口**（性能声明，措辞都是「用它代替多条命令」）：`blocks add --json <数组>`、`blocks move --ids`、`blocks delete --ids`/`--id <csv>`、`collections items-add --items`、`tasks add --tasks`、`reminders create --reminders`。☆ 与 §十九 的实测互证：分号批处理不是事务 ⇒ 单命令批量才是官方推荐的原子形状（其失败语义本批未测）。
10. ★ **块类型能力不对称**（`blocks learn`）：插入 JSON 支持 9 类（`text page code richUrl line table image video file`），更新 JSON 支持 12 类（另加 `drawing whiteboard collection`，★ 并注明 collection 不在 NewBlock 联合里）。共享可选字段 5 个：`indentationLevel (0–5)`、`listStyle`、`decorations`、`color (#RRGGBB)`、`taskInfo`；`listStyle` 五值 `none|bullet|numbered|toggle|task`；`lineStyle` 五值 `strong|regular|light|extraLight|pageBreak`（默认 `regular`）。☆ `pageBreak` 使"分隔线"这一族里含**分页语义**，与 §一之四十五 的 `textStyle:"page"` 同属"块字段承载文档结构"一路。
11. ★ **`--location` 在任务与文档两侧不同名**：任务写侧 `inbox|dailyNote|document`（默认 `inbox`），文档列表 `unsorted|trash|templates|daily_notes|folder`（★ 蛇形 `daily_notes` vs 驼峰 `dailyNote`）⇒ 官方**同一概念两套拼写**的第三例（另两例：日名 `mon` vs `monday`、`day://` 点分 vs parser 吃 `-`）。

### 仍未采到（模型面·第 76 批刷新）

- ★ 样式旗标的**落库形状**：`"#light #dark"` 写入后是一个字符串还是拆成两字段；`--theme-color` 与 `--bg-color` 同时给时谁覆盖谁；`--backdrop-type pattern` 的 `pattern` 取值集（`--washi-pattern` 只给了示例）。⇒ 需写入授权。
- ★ 提醒实体的字段全集与物化：`reminders list` 的行字段（id/时刻/完成位/所属块）、「Save for later」在读侧长什么样、`--no-reminder-time` 后 `--completed` 位是否保留。
- ★ 集合上限的层级：20 列是 CLI 侧校验还是服务端；超列报错串；`--allow-new-options` 未给时的失败形态。
- ★ 批量入口的失败语义：`--json` 数组中一条坏块是否整批回滚（对照 §十九「分号批处理不是事务」）。
- ★ `phone` 列的读回格式与校验；`relation` 用 blockId 时读侧如何回显（本地存 `collectionId`，对照见 G676）。
- 承接第 75 批未动：`repeat` 其余频率子对象写侧 JSON、`interval` 字段名与缺省、`monthly.dynamicDays.type` 取值集、`block_logbook_` 粒度、`styling` 完整取值集、MCP `--scope` 与屏上三屏的对应。

## 一之四十七、★★ 三张官方取值全集（页面主题约 150 项／washi 6 图案／代码主题 19 档）＋ 字体别名映射表（2026-09-28 第 76 批·下半，通道＝`blocks explore-themes`／`blocks explore-washi`，**零写入**）

1. ★★ **发现型动词住在 `craft_write` 但语义是浏览**：`blocks explore-themes [--type page|fonts|code]`、`blocks explore-washi [--pattern <name>]`、`blocks search-unsplash`、`folders explore-icons`。⇒ 用前**先读它们的 `--help` 确认是「Browse available …」再调用**；本批实测三者返回纯清单、无副作用。
2. ★★★ **页面主题＝约 150 项具名清单，官方明说「Themes loaded dynamically from S3」**（快照 2026-09-28）。首档 `default - Original`；命名可分组看出官方是**成套设计资源**而非算法生成：现代组（`fire-horse`、`fire-petals`、`prosperity-bloom`、`lunar-ink`、`soft-spring`、`sunrise`、`golden-hour`、`sunset`、`midnight`、`spring`、`old-money`、`soil-and-clay`、`techy`、`mdr`、`photo-lab`、`hello`、`leopard`、`drafts-and-drawings`、`azure-breeze`、`film`、`road-trip`、`market-walks`、`beach`、`vibrant-nights`、`weather-clearing`、`outlines`、`time-period`、`silk-screen`、`bubble-optics`、`cold-beauty`、`shopping-list`、`handmade`、`frozen`、`optical-illusions`、`retro`、`one-of-a-kind`、`da-ba-dee`、`almost-bright`、`leaves`、`warmer-layers`、`monday-to-friday`、`blurry-bloom`、`preservation`、`earthbound`、`candybar`、`skylight`、`inner-personality`、`planetopia`、`fruitymalistic`(显示名 Fruity)、`shape-shifting`(Shape Shift)、`stillness`、`start-of-the-day`、`hopefully-sweet`、`holowaves`、`end-of-day`、`drawn-in-the-sky`、`pre-phones`、`little-world`、`stop-time`、`bright-sun`、`floradora`、`childhood`、`electric`、`geometric`、`gradient`、`savoir-faire`、`cat`、`antiquities`、`black-white`、`le-mans`、`a-blogger-from-philly`、`collage`、`infinity-void`、`light-blue`、`anime`、`objects-contrasts`、`old-movie`、`paper`、`soft-green`、`space`、`the-tour`、`underwater`、`writer`）＋**联名/事件档**（`paris-2024`、`gjjb-craft` = Thinker by GJJB）＋**季节档**（`breeze`、`citrus`、`oasis`、`blushblue`、`harmony`、`dark-glow`、`indigo`、`breathe`、`honey`、`wave`、`nostalgia`、`gummy`、`soft-keys`、`prism`、`plum`、`coral`、`chrome`、`rewind`、`sage`、`let-it-go`、`paradise`、`astro-wave`、`echo`、`lemonade`、`sparkles`、`rose`(Rosé)、`koi`、`morning`、`partners-in-crime`、`night-guests`、`acid-surprise`、`crust-or-no-crust`、`memento`）＋**节日档**（`winter-charm`、`christmas-glow`、`sparkle-night`、`new-years-resolutions`(显示名 Fresh Start)、`snowfall`、`winterlight`、`snake-fire`、`crimson-coil`、`lunar-glow`、`lovelight`、`pure`、`lovey-dovey`）。☆ ★ 用法串是 **`blocks update --id <blockId> --theme-id <name>`**（更新通路，不是 `blocks add`）；★ 且 id 与显示名**可以不同**（`fruitymalistic`→Fruity、`shape-shifting`→Shape Shift、`new-years-resolutions`→Fresh Start、`gjjb-craft`→Thinker by GJJB）。
3. ★★ **washi 图案全集＝6 档几何纹理**：`hex`（六边形）／`dot`（圆点）／`stripe`（横条）／`diagonal`（斜条）／`grid`（网格）／`wave`（波浪）。★ 用法串 `blocks update --id <blockId> --separator washi --washi-pattern <name>`；☆ help 里另有一句「Custom patterns via `--washi-pattern` in blocks update」⇒ **同一旗标接受清单外的自定义名**（自定义名如何解析未测）。
4. ★★ **代码块主题全集＝19 档，首档 `auto`＝跟随系统外观**：`auto`、`atomone`、`aura`、`bbedit`、`darcula`、`dracula`、`githubdark`、`githublight`、`gruvboxdark`、`gruvboxlight`、`materialdark`、`materiallight`、`noctislilac`、`nord`、`sublime`、`tokyonight`、`tokyonightday`、`tokyonightstorm`、`vscodedark`。★ 官方明确这些走**同一个 `--theme-id` 旗标**（「used with code blocks via `--theme-id`」）⇒ **一旗标两套词表**（页面主题名 vs 代码主题名），按块型解释；命名是全小写无分隔（`githubdark`、`tokyonightstorm`）⇒ 与页面主题的连字符制（`fire-horse`）不同。
5. ★★ **字体族四规范名 ＋ 四别名，映射不规律**：规范名 `system`（默认，系统无衬线）／`system-serif`／`system-rounded`／`system-mono`（代码用等宽）；别名 `sans-serif→system`、`serif→system-serif`、`rounded→system-rounded`、`mono→system-mono`。⇒ ★ 陷阱在 **`sans-serif` 不指向 `system-serif` 而指向 `system`**（别名表不是"去掉前缀"的规律映射）；☆ 且 `explore-themes --type fonts` 的**标题行**写成「Page font families (system, serif, rounded, mono)」＝**把别名集当清单展示**，正文才给规范名 ⇒ 与 §一之四十六 第 1 条（`--siblingId` vs `--targetSiblingId`）、第 11 条（`dailyNote` vs `daily_notes`）同族：**词表的层级在文案里不自洽**。
6. ★ **官方样式资源的三层分布**（本批第一次看全）：枚举值（`lineStyle`/`listStyle`/`backdrop-type`/`separator`/字体）在契约与代码里；**主题清单在 S3**（page 与 code 两套）；**位图素材走 `blocks search-unsplash`**（外部图库）⇒ 复刻时这三层必须分开处理：前层可硬编码，后两层是**数据源**。

### 仍未采到（模型面·第 76 批·下半刷新）

- ★ 主题名的落库形状：`--theme-id fire-horse` 写入后读回是 `styling:{themeId}` 还是展开成 backdrop／颜色字段（并顺带结掉 G673 的 `"#light #dark"` 双值问题）⇒ 需写入授权。
- ★ S3 清单的版本漂移与**分层归属**：约 150 项是否受订阅档位限制（`--theme-id` 给不付费的主题名时报什么）、是否随节日上下架。
- ★ `blocks search-unsplash`／`folders explore-icons` 的返回形状（未跑）。
- ★ `--washi-pattern` 的"自定义名"到底接受什么（清单外值是否报错）。
- ★ 19 档代码主题的渲染器与 `auto` 档的联动（屏上）。
- 承接第 76 批上半的五条（批量原子性、20 列上限层级、提醒三态与级联方向、`repeat` 其余频率 JSON、`block_logbook_` 粒度）。

## 一之四十八、★★★ 写侧读回全形：`styling` 六字段（含字符串化 backdrop）、四频率 `repeat` 子对象、提醒三态回执串、`VALIDATION_ERROR` 错误形状（2026-09-28 第 77 批实测，通道＝桌面端 MCP 写入后 `blocks get --format json --depth 3` 读回；沙盒 `QODER-HARVEST-B77` 已删）

1. ★★★ **`styling` 的完整字段集（六样，实测一次写四个旗标得到六个字段）**：`fontFamily`、`textColor`、`backgroundColor`、`backdrop`、`themeId`、`separatorStyle`。⇒ ① **写读字段名映射**：`--font→fontFamily`、`--text-color→textColor`、`--bg-color→backgroundColor`、`--theme-id→themeId`；`backdrop` 与 `separatorStyle` 由主题**展开产生**（本次并未写 `--backdrop-*`／`--separator`）。② ★ **明暗双值不拆分**：`textColor:"#111111 #eeeeee"` 原样一个字符串。③ ★★★ **`backdrop` 是字符串化的 JSON**（值本身是 `"{\"type\":\"image\",\"image\":{\"imageUrl\":\"…fire-horse-backdrop.png\",\"imageBlurHash\":\"LAOAh#01??$j00S3%KDl?s%KoKtQ\"},\"size\":\"full\"}"`）⇒ 官方在同一个 `styling` 对象里**混用两种序列化深度**（一层对象 ＋ 一层字符串化 JSON）。④ ★★★ **`separatorStyle` 是"函数调用串"**：`washi(image, "https%3A%2F%2F…fire-horse-washi.png", LDN6iCDQIV_K%eDkIV?tx@af%eMy)` ⇒ 三参数（类型／**百分号编码的 URL**／blurhash）⇒ 官方第三种值内 DSL（前两种：`day://YYYY.MM.DD`、`#light #dark`）。⑤ ★ 主题写侧只给 id，读侧**展开成资源引用**（`res.craft.do/assets/theme/...`）⇒ id 是模板键，不是持久引用；★ 这也解释了 §一之四十六 2 的"否认自定义样式 id"与"主题清单在 S3"如何共存。
2. ★★★ **四频率 `repeat` 子对象的完整形状**（同一天 06:16 创建四条，`startDate` 全为创建日）：`daily` ⇒ `{type:"fixed",frequency:"daily",startDate,daily:{skipWeekends:false},reminder:{enabled:true,dateOffset:540}}`；`monthly:1,15` ⇒ `monthly:{days:[1,15]}`（★ 缩写不写 `dynamicDays`）；`yearly` ⇒ `yearly:{months:[9],days:[28]}`（★ 由创建日派生月与日）；`flexible:weekly:mon,fri` ⇒ `{type:"flexible",frequency:"weekly",weekly:{days:["monday","friday"]},…}`（★ flexible 同样带 days）。⇒ ① **`daily.skipWeekends` 是新字段**（对应静态 `aLe` 跳过周末的码路）；② **四条都自动挂 `reminder{enabled:true,dateOffset:540}`**（第三次确认 09:00 默认）；③ ★ **缩写路径不产生 `interval`** ⇒ 静态 §一之四十一 的上限表 `31/52/12/10` 在 API 侧无入口（全 JSON 形式能否写 `interval` 未测）。
3. ★★ **`tasks list` 的 `repeat:` 渲染四型**：`daily (fixed)`、`monthly (fixed) on day 1, 15`、`yearly (fixed)`、`weekly (flexible) on monday, friday` ⇒ 无 `days` 的频率不渲染 `on` 段；★ `monthly` 用「on day 1, 15」而 `weekly` 用「on monday, friday」⇒ 同一位置两套措辞。
4. ★★★ **提醒实体的三态与回执串**（写侧自述格式）：有时刻 ⇒ `Set Reminder <id>: <任务标题>` ＋ `Block: <blockId>` ＋ `Incomplete; scheduled for 2026-09-29T09:00:00.000Z`；★ 无时刻（省略 `--at`）⇒ `Incomplete; saved for later (no notification scheduled)`；删除 ⇒ `Deleted reminder <id>`。⇒ ① **无时刻态确证**；② `reminders list --status all` **两种都在**，且**重复任务内挂的 `repeat.reminder` 不在列表里** ⇒ ★ 定案：`repeat.reminder` 是**表达式**，永不物化；③ 提醒 id 是普通 UUID（★ 与未落库提醒的 `new_reminder_` 前缀不同族，见 §一之四十四）。
5. ★★ **集合校验的错误形状**：`error(VALIDATION_ERROR): Validation failed: properties: Collection cannot have more than 20 columns (properties)` ⇒ ① **结构化错误码** `VALIDATION_ERROR`；② **点分字段路径** `properties:`；③ 措辞「more than 20 columns (properties)」⇒ ★ **20 只数常规列，title 列不计**。☆ 上限由校验层强制，不是 CLI 文案（对照 §一之四十六 5）。
6. ★★ **`collections create` 的旗标语义（易误读）**：`--name`＝集合名；★ `--title <columnName>`＝**行标题列的名字**（默认 `Title`），官方警告不要把行标题建成常规列，否则行显示 `(untitled)` 且名字被塞进侧列；★ 集合必须挂在文档里（`--document <rootBlockId>`），`--position start|end` 默认 end；常规列定义 `--<property> <type>[:options]` 可重复。
7. ★ **`tasks add` 的必旗标是 `--markdown`**（不是 `--title`）；☆ 失败时**回吐完整 flag 表**＝"错误即文档"的设计模式；★ 顺带拿到 `--repeat` 缩写全语法表：`daily`／`weekly`／`weekly:mon,wed,fri`／`monthly`／`monthly:1,15`／`yearly`／`flexible:weekly:mon,fri`（三段式）＋ 全 JSON `{"type":"fixed","frequency":"weekly","weekly":{"days":["monday"]}}`；☆ 另两条成文：`--state done`（不是 `--done true`）、「done/canceled tasks auto-move to logbook」。
8. ☆ **`blocks add --json` 含坏块的观察**：MCP 返回 `-32603 MCP tool invocation did not complete`，读回 `content:[]` ⇒ 整批未落；★ **但不足以断言原子性**（超时与整批拒绝两种读法都成立）⇒ 待"两条好块"对照实验。

### 仍未采到（模型面·第 77 批刷新）

- ★ `styling` 的其余字段：`--theme-color` 落成什么键、`--cover-*` 三样、`--backdrop-type gradient` 的 `colors/direction` 串形态、`separatorStyle` 的其余函数名（`line(...)`/`doodle(...)`？）。
- ★ `interval` 能否经全 JSON 写入；`monthly.dynamicDays` 能否经 JSON 写入（缩写不产生）。
- ★ 提醒的读回字段集（`reminders list` 只给文本行，`--format json` 未试）；`--completed true` 后 `list --status` 的分桶表现。
- ★ 20 列上限的"恰好 20"边界与 title 列是否真不计（需建成 20 列成功一次）。
- 承接：`block_logbook_` 粒度、`styling` 之外的 `codeFontFamily`、MCP `--scope` 与屏上三屏的对应。
## 一之四十九、★★ 三个 browse/search 动词的取值边界：图标词表不可穷举、Unsplash 是双落点第三方源、`explore-*` 能力不对称（2026-09-28 第 78 批·上半，通道＝`--help` ＋ 两次真实调用，**零写入**）

1. ★★ **图标集合是"只能按词查"的封闭词表，没有全表入口**：`folders explore-icons <search-term> [--offset <n>]`；实调 `rocket` ⇒ `Icons matching "rocket" (1-1 of 1):` ＋ 缩进列表体 ⇒ **头部是「区间 of 总数」双段**（与 `explore-themes` 同形，说明这批动词共用一个分页渲染器）；空串被拒 `Please provide a search term.` ＋ **整张 usage 再打一遍**（★ error as documentation 第二例）。⇒ 想知道图标全集只能**逐词枚举查询**（本批未做）；⇒ 图标名是**官方自有词表**（`rocket`／`calendar`…），与 `--icon` 写入旗标同域。
2. ★★★ **封面与背景是两个不同的写入旗标，且共享一个站外检索器**：`blocks search-unsplash <query> [--page <number>]` ⇒ 契约把用途直说成两类 —— 页顶 hero 用 `--cover-url`、内容背后用 `--backdrop-url`（★ 与 §一之四十六 的 18 旗标里的 cover/backdrop 两组正好对上：检索器只负责"找到 URL"，落库仍走那两组旗标）；★ 契约要求配 `--cover-attribution` ⇒ **署名是模型字段**（不是注释），与 §一之四十八 读到的 `backdrop.imageUrl`/`imageBlurHash` 同层。
3. ★★ **四动词能力分级（下批选题的可达性判据）**：可一次穷举 ＝ `blocks explore-themes`（约 150 项）／`blocks explore-washi`（6 档）；须按词查 ＝ `folders explore-icons`（`--offset`）／`blocks search-unsplash`（`--page`，★ 且数据源在站外）；⇒ **"取值全集"类目标要先判断动词属哪一级**，属第二级时只能采"响应形状＋旗标名"。
4. ☆ **未采（也是本节的边界）**：`search-unsplash` 的响应字段集与分页语义**没有实调**（结果含他人作品 ⇒ 按铁律不入仓库，只留契约名）；图标词表规模未知。
## 一之五十、★★★ 第 79 批写侧读回：`styling` 内两种序列化风格并存、`interval` 在 API 侧根本写不进去、提醒完成态两刻并存（2026-09-28 07:21–07:23，沙盒 `QODER-HARVEST-B79`，已 LIFO 还原）

1. ★★ `styling` 实测键集（本批只写样式旗标时）＝ `{coverImage:{url, unsplashAttribution}, backgroundColor, themeColor}` ⇒ 对照第 77 批的 `{fontFamily, textColor, backgroundColor, backdrop, themeId, separatorStyle}` ⇒ **`styling` 是"按需出现的稀疏对象"**（写了哪几类就出现哪几个键），且 **`coverImage` 是嵌套真对象、`backdrop` 是字符串化 JSON** ⇒ 同一个容器内两种编码风格。
2. ★★★ **`themeColor` 与 `backgroundColor` 是两个并存字段、互不覆盖**（`--theme-color "#112233 #445566"` ＋ `--bg-color "#778899"` 同时给 ⇒ 都在）；明暗双值仍是**一个字符串**。
3. ★★ **署名槽实现泄漏**：自造 URL 也被记进 **`unsplashAttribution`** ⇒ 字段名硬绑第三方源（语义上应叫 attribution）。
4. ★★★ **`repeat` 里 `interval` 无法经 CLI 写入**：给 `--interval 99` ⇒ 写侧接受、读回**整键不存在**（不存 99、也不复位 1）⇒ 静态上限表 `B3={daily:31,weekly:52,monthly:12,yearly:10}` 的钳制**只存在于 UI 通路**；⇒ 官方"缺省即键缺失"约定（§一之四十六）在**越界值**上同样成立。
5. ★★ **`weekly.days` 缺省＝创建日的星期**（2026-09-28 ⇒ `["monday"]`）⇒ 与 `yearly` 的 months/days 从创建日反推**同构**。
6. ★★★ **提醒实体的完成态是两刻并存**：`Completed at <ISO>; scheduled for <ISO>` ⇒ `completionDate` ＋ `dueDate` 互不抹除；★★ **提醒标题＝所属块文本**（回执 `Set Reminder <id>: B79-p001`）；`reminders update` 用 **`--reminder`** 指 id（不是 `--id`），支持集＝`--reminder/--at/--completed/--no-reminder-time`。
7. ★☆ **`documents create --title` 回执**给出三行：`rootBlockId` ＋ `Next: add body content, not the title, with blocks add --id …` ＋ `Craft app link: craftdocs://open?spaceId=…&documentId=…` ⇒ **同一实体三套标识/入口一次给全**（一个文档两根 id 的第二次直接证据）。
8. ☆ **本节边界**：批量原子性（只证保序）、`--backdrop-colors` 的正确落库形状、20 列省略破坏面、任务→提醒级联 ⇒ 全部未采。


## 一之五十一、★★★ `styling` 的页根限定、`separatorStyle` 双形态、集合行的空串标题键与「视图丢字段」（2026-09-28 第 79 批·下半 B79B，沙盒 `QODER-HARVEST-B79B`，已 LIFO 还原）

1. **`styling` 是页根专属对象**（★ 修正 §一之五十 的表述）：块级 `blocks update --id <text块>` 带样式旗标 ⇒ 写侧成功、读侧零字段；同一组旗标打在 `type:"page"` 的 rootBlockId 上 ⇒ `styling` 整块出现。页根读回形状（`fire-horse` 主题＋渐变背景＋washi hex）：

   ```
   "styling": {
     "fontFamily": "system-serif",
     "textColor": "#400000",
     "backgroundColor": "#f7c98f #f7c98f",
     "backdrop": "{\"type\":\"gradient\",\"gradientColors\":{\"startColor\":\"#ff0000\",\"endColor\":\"#00ff00\"},\"direction\":\"top-to-bottom\",\"size\":\"full\"}",
     "themeId": "fire-horse",
     "separatorStyle": "washi(image, \"https%3A%2F%2Fres.craft.do%2Fassets%2Ftheme%2Ftheme-washi%2Ffire-horse-washi.png\", <不透明尾串>)"
   }
   ```

   ⇒ `styling` 内**三种值风格并存**：普通字符串（fontFamily、textColor、themeId）、空格连接的明暗对（backgroundColor）、**字符串化 JSON**（backdrop）、**mini-DSL 串**（separatorStyle）。

2. **`separatorStyle` 两种形态**：`washi(image, "<percent-encoded url>", <尾串>)`（主题给图）与 `washi(<pattern>)`（显式 pattern 覆盖后只剩裸名）。`--washi-pattern` 的合法取值集＝`hex`、`dot`、`stripe`、`diagonal`、`grid`、`wave`（恰好 6 个）；素材按**主题**命名（`<themeId>-washi.png`），不是按 pattern 命名。

3. **`--theme-id` 是打包写入**：一次落 `fontFamily`、`textColor`、`backgroundColor`、`themeId`、`separatorStyle` 五个字段 ⇒ 主题不是「一个颜色」，是字体＋文字色＋背景对＋分隔线的组合。主题全集本批整份读回 130 条，全部在唯一分组 `Modern:` 下，头行标注 `Themes loaded dynamically from S3`。

4. **`backdrop` 渐变形状与不可达默认值**：`--backdrop-colors` 用**逗号**分隔（空格分隔被判「不足 2 色」）；落库对象里 `direction:"top-to-bottom"`、`size:"full"` 没有对应旗标 ⇒ API 侧只能写两色，方向与尺寸恒为默认。

5. **集合（collection）的数据模型补齐**：
   - schema 列形状＝`key → display name`，标题列的 key 是**空串**，显示名＝创建时 `--title` 给的值；普通列 key 为 `prop0…propN`（本批 20 列＝标题＋`prop0…prop18`，恰好触顶）。
   - `--items` 里**只有空串键能写进行标题**；用显示名当键会被静默丢弃。行的落库形状＝`{id, type:"collectionItem", title, properties, markdown}`，`title` 与 `markdown` 镜像同值。
   - `collections items-get --format` 取值只有 `text`、`markdown`（**无 json**），且其 text 视图对已写好的 `title` 恒显示 `(untitled)` ⇒ 集合行标题的**权威读路是文档级 `blocks get --format json`**。
   - `collections schema-update` 是**整表替换**：省略＝删列**且永久删数据**（列加回同键也不复活），行不受影响。

6. **任务与提醒的时间字段彼此独立**：块侧只有 `taskInfo:{state, completedAt}`＋`listStyle:"task"`（提醒**不在**块对象里）；提醒是独立实体，有**自己的 id**（本批 `25748609` ≠ 块 id `d891bbe6`），`reminders create` 支持 `--at`（必须 `Z` 或显式偏移）或省略 `--at`＝「稍后保存、不通知」，批量形状 `--reminders '[{"blockId","remindAt"}]'`；`tasks update --state done` **不推进**提醒完成态（`reminders list --status all` 仍 `Incomplete; scheduled for …`）。`documents delete` 后提醒与任务都留在各自索引里，需 `reminders delete --reminder <id>` 单独清理。

### 仍未采到（模型面·第 79 批·下半 B79B 刷新）

- `separatorStyle` 第三个参数的语义（签名／版本／素材哈希）未定，只有 `fire-horse` 一个样本。
- `backdrop` 的 `direction`、`size` 有无其他取值、`--backdrop-type` 全集（除 `gradient` 外是否有 `image`、`pattern`）未读到；`--backdrop-type pattern` 是否配 `--washi-pattern` 之外另有 pattern 旗标**未确认**。
- 主题 130 条是当前快照，除 `fire-horse` 外**没有逐条读过五字段包**；`code themes`（`blocks explore-themes` 的另一类）本批未取。
- 集合列的**类型系统**只测了 `text`；`select:A,B`、`multiSelect`、`relation:<id>`、`date`、`url` 的落库形状与校验层未测。
- `collections items-update` 是否能改标题、有无同样的视图丢字段问题未测。
- 提醒完成态的反向级联（`reminders update --completed true` 是否把块推成 `[x]`）未测。

## 一之五十二、快捷键面板的取值集与表格/回收站的数据形状（✓ 第 81 批屏上＋MCP 实测）

① **面板分类与键帽形状**：7 类 `通用／文档／任务／编辑／样式／整理／合集`；键帽是 `SPAN._keys_dm375_124`（一组）包 `KBD._key_dm375_124 typography-ui-md-500 no-select`（一枚），多键并列时同组内连排（读作 `CtrlShift,`），"或"关系显式印成文本 `或者`（如 `快速开启 CtrlO 或者 CtrlP`、`标记完成 CtrlAltT 或者 Ctrl/`、`删除 ⌫ 或者 Delete`）⇒ **显示层是"键帽数组 ＋ 连接词文本"，不是单字符串**，本地复刻须建模成 `{mods[], key, alt?[]}` 而非 `"Ctrl+Shift+,"`。每类键帽数 16／11／34／27／80／13／38（合计 219）。原始七段全文见 `_harvest/b81-panel-all.txt`。
② **「整理」段的键位是移动＋组合两族**：`向上移动 Alt↑`／`向下移动 Alt↓`／`移动到顶部 Alt⤒`／`移动到底部 Alt⤓`／`组合 CtrlG`／`取消组合 CtrlShiftG`；`文档` 段 4 条（`每日笔记 CtrlAltN`、`全选 CtrlA`、`选择到顶部 CtrlShift⤒`、`选择到底部 CtrlShift⤓`）⇒ **块级移动与"选择到顶/底"共用 ⤒⤓ 字形、靠 Alt 与 CtrlShift 分化**，这是本地键盘层要显式建的两档。
③ **块级表格的屏上数据形状**：表容器 `DIV._viewport_1ltym_9.base-ui-disable-scroll[role=presentation]`（41×15 时 `scrollHeight==clientHeight==1305`、宽 580，**无内部滚动**）；**每个单元格是一个独立编辑器实例**，链为 `DIV[role=textbox] > DIV.ph-mask > SPAN > SPAN.sc-1i6i6bx-6 > SPAN(文本叶)`，行高 18、块高 23；`<table>`/`<tr>`/`<td>`/`[role=gridcell]`/`[role=row]` 在 Craft 表里**一个都不用** ⇒ 表格可访问性别指望原生 table 语义，也无 `role=grid`。
④ **MCP 侧的表格数据形状**（`blocks learn table` 原文）：新建 ＝ `{"type":"table","markdown":"…"}`（**布局用 markdown 承载、但 type 必须显式**）；更新 ＝ 只给 `id` 即部分元数据、改行常走 markdown；**嵌套单元格表可能只读**（官方原文 "may be read-only — follow error hints"）；共享可选字段 `indentationLevel (0–5)`、`listStyle`、`decorations`、`color (#RRGGBB)`、`taskInfo`。
⑤ **回收站字段语义**：`documents delete` 自述 **软删 → 回收站 → 30 天自动彻底清除 → 还原用 `documents move`**；`tasks list --scope all` 的 `in:` 字段在宿主可解析时是文档名＋id，宿主不可解析时退化为 `inbox` ⇒ **`in: inbox` 是"宿主已不可达"的可用信号**；scope 词表官方枚举 `active／inbox／upcoming／logbook`（错误提示里给出）。

**仍未采到（模型面·第 81 批刷新）**
- 面板 7 类逐条键帽与 表 A–E 的完整对账（只裁了 5 条差异）；`_harvest/b81-panel-all.txt` 已落盘，零浏览器预算即可补
- 表头行（`c1…c15`）在 DOM 里是否与数据行同构（本轮只量了值叶与行标签叶）
- `blocks learn` 不带参数时的 topic 全集（官方形状指南还有几份）
- 表格列宽／列向溢出的布局参数（15 列 580 px 是否已横向滚）

## 一之五十三、块样式四档词表在快捷输入侧的第四次印证 ＋ `####`→`Strong` ＋ 有序列表**起始序号** ＋ Toggle／Callout 触发符（✓静 第 96 批·上半 2026-09-29 09:26–10:20，零写入＝主包 @3,775,423 区 `uF` 表逐条读回；原始窗 `_harvest/b96-onkeydown.json`／`b96-gates.json`）

第 36／47／49 批从序列化读侧、第 6 批从 i18n 词表得到的**层级四档** `Title / Subtitle / Heading / Strong`（不是 H1–H4），本批在**输入即转换**这一侧第四次独立印证，并且给出此前完全没采到的三条形状：

| 触发（`trigger` 一律是**空格**，pattern 允许前导空白 `^\s*`） | 派发动作 | 此前状态 |
| --- | --- | --- |
| `#`／`##`／`###` | `setTextStyle` → `at.Title`／`at.Subtitle`／`at.Heading` ＋ `od(t)` | 已知档位名，**未知输入侧映射** |
| ★ `####` | `setTextStyle` → **`at.Strong`** | **新**（⇒ 官方第四档不是 heading4） |
| `[x×☐□]`／`[ ]`／`-[]` | `ir(...Nt.Todo)` ＋ `f5(...tn.Unchecked)` ＋ `od` | **新**：四种方括号／符号写法并存 |
| `[x×]` | 同上但 `tn.Checked` | **新**：`×` 也算完成 |
| `-*•` | `Nt.Bullet` | 已知三种 bullet 符 |
| ★ `+` | **`Nt.Toggle`** | **新**（此前 Toggle 只有菜单／`+ Toggle` markdown 扩展两条路，见 §一之四十六） |
| ★ `>` 与 `\|` | `P2([blockId], {focus: 1})` | **新**：callout 有**两个**触发符，且带 `focus:1` 属性 |
| ★ `(\d+)\.` | `ir(..., Nt.Numbered, ti(m[1], 10))` ＋ `od` | **新**：**有序列表可从任意序号起编**（匹配到的数字直接当 `start`） |

⇒ 每条都是**一次 `docDispatch` 派发两个 action**（样式／线形 action ＋ `od(t)`＝剥掉触发串的补丁）⇒ 与 §一之四十四「一步撤销＝一个 `undoRedoPatch` 槽」咬合：**一次 markdown 转换在撤销栈上是一步**（两个 action 共享同一次派发）⇒ 屏上可验（输 `# ` 后按一次 `Ctrl+Z` 应回到 `#` 原文）。
⇒ `od`／`ir`／`f5`／`P2` 是构造器别名，语义按 §六十二（261 个 action 构造器全表）对照；`ti(x,10)`＝十进制解析（**未读到定义**，按用法记）。

**面板（快捷键弹层）的几何与两档布局**（`index.css.CP00jDAy.css` 内 `_dm375_` 模块 22 处命中的关键四条逐字）：

- dialog 基线＝`width:min(720px, calc(100vw - 2rem))` ＋ `height:min(560px, calc(100dvh - var(--spacing-8)))` ＋ `box-sizing:border-box; display:flex; align-items:stretch; overflow:hidden`。
- ★ compact 档是**覆盖式**（不是隐藏 rail）＝`._dialog_dm375_1._isCompact_dm375_15{width:calc(100vw - var(--spacing-4)); height:calc(100dvh - var(--spacing-6))}`。
- 宽栏 rail＝`._sidebar_dm375_26{...width:184px; padding:var(--spacing-4) var(--spacing-3); border-right:1px solid var(--foreground-150); overflow-y:auto; gap:2px}`；compact rail＝`._compactNav_dm375_20{flex-shrink:0; padding:0 var(--spacing-5) var(--spacing-4); border-bottom:1px solid var(--foreground-150)}`；主区＝`._main_dm375_37{flex:1; min-width:0}`。
- ☆ 指示条样式存在但**没被驱动**＝`._indicator_x8v9o_94{--active-tab-left:0;--active-tab-width:0;--active-tab-height:0; position:absolute; top:0; left:var(--active-tab-left); width:var(--active-tab-width); height:var(--active-tab-height); border-radius:var(--radius-full); background:var(--base-overlay); box-shadow:var(--shadow-xxs)}` ⇒ 主包零引用 `TabsIndicator`（G861）⇒ **模型大于 UI 的单向富余档第 4 例**（前三例＝`dynamicDays` 的 `selector:"first"`、`interval` 上限表只在 UI、`repeat` 的 `flexible` 也带 `days`）。
- ★ 断点常量＝**`$0e = 748`**，两条媒体串由模板生成：`wa = (min-width: 748px)`、**`zo = (max-width: 747px)`** ⇒ 这解释第 91 批「`hn` 本体四搜未定位」（搜字面量 `max-width: 747px` 必 0 命中）；另有恒真／恒假哨兵串 `H0e = (min-width: -1px)`／`Z0e = (max-width: -1px)` 按 `theme.isTouchDevice` 互换，与「触屏 56／指针 48」两档 `gg = t => t ? 56 : 48`（`Xh=48`／`Jh=56`）一并到手 ⇒ **`--header-height` 的 48／56 双值从此有代码侧出处**。

**本地对照（本轮实跑 grep，均已读命中内容）**

- `src/components/editor/extensions/markdown-shortcuts.ts`（137 行，规则在 :13／:34／:55／:78／:91／:108）只有六条＝`~~`／`==`／`[]()`／`$$`（`nodeInputRule` 到 `mathBlock`）／`$x^2$`／**`^\[([ xX])\]\s$`→`taskList`**（且 `:112` 限定 `$at.depth !== 1 || parent.type.name !== "paragraph"` 就 return）。⇒ 缺失四条：**`+ → Toggle`**、**`>` 与 `| → callout`**、**`[x×☐□]`／`[ ]`／`-[]` 三种写法变体**、**有序列表起始序号**；语义相反一条：井号第四档（本地 `Editor.tsx:250 heading:{levels:[1,2,3,4]}` 出 heading4，官方出 **Strong**）。⇒ 判 **P0**（这是"输入即转换"的核心手感，且 `keyboard.md` 表A 的第四档命名与此同源）。
- `src/lib/use-is-mobile.ts:5` ＝ `MOBILE_QUERY = '(max-width: 767px)'`，`src/app/globals.css:217／961／990／1050` 四处同值 ⇒ 本地 **767** vs 官方 **747**（常量 748），**差 20px 且本地只有单一档**；本地无「恒真／恒假媒体串」样式开关，也没有 48／56 两档尺寸。⇒ 直接喂给 P1 决策「本地要不要 747 compact 档」。
- `grep -rn "activateOnFocus|segmented|active-tab" src` 本轮**无命中** ⇒ 本地没有分段控件档、没有指示条变量、没有 roving（`grep -rn "tabIndex={" src --include=*.tsx` 亦无命中）。

**仍未采到（模型面·第 96 批刷新）**：`uF` 表尾（窗口截到 `pattern:/^\s*-`，之后条目未读全，⚠ **命名覆盖≠行为覆盖**，不得判"表已完整"）；`P2` 构造器本体（callout 的 `focus:1` 语义未证）；`ti(x,10)` 定义；`od(t)` 的精确形状；`_dm375_` 模块其余 18 处命中未逐条读（分区标题／行／键帽类的几何）；`--active-tab-*` 在暗色主题下是否另有覆盖块（本轮只查了 light 侧的同名串）。


## 一之五十四、任务三时间的**UI 归属 ≠ schema 归属**：schema 平一层，UI 只把提醒与重复挂在 schedule（✓屏上 第 96 批·尾记八 2026-09-29 13:03–13:10，沙盒 `QODER-HARVEST-B96D`，零日期提交；原始读数见 `gap.md` §三点一〇三三／`interactions.md` V85）

§一之十九 从写侧函数 `SVe` 得到的是**扁平五字段**：

```js
{ assignee, deadline: V5(t.deadline), schedule: V5(t.schedule),
  repeat: wVe(t.repeat), reminder: t.reminder }
```

本批在屏上第一次看到**这五个字段被 UI 切成两组**：

| UI 入口 | 键位 | 弹层实测 | 能改的字段 |
| --- | --- | --- | --- |
| 日程选择器 | `Ctrl+Shift+S`（`OPEN_SCHEDULE_DATEPICKER:ci(Oo("s"))`） | `sc-st2m8s-0 WAcGA`、**232×413**、`outerHTML` **15,518**、6 枚按钮（今天／提醒我…／重复…／3 枚无名）、placeholder「日期」 | `schedule` ＋ `repeat` ＋ `reminder` |
| 截止日期选择器 | `Ctrl+Shift+D`（`OPEN_DEADLINE_DATEPICKER:ci(Oo("d"))`） | **同一 class**、**232×332**、`outerHTML` **11,383**、4 枚按钮、placeholder「截止日期」 | **只有 `deadline`** |

四条模型侧结论：

1. ★★ **差别只在 UI，不在 schema**：既然 `SVe` 把 `deadline` 与 `reminder` 放在同一个对象里，"截止日期带提醒"在**数据层是合法组合**，只是**没有 UI 入口**。⇒ 复刻时不要把这事建模成"deadline 不支持提醒"（那是把 UI 限制误读成 schema 约束）；本地 `TaskSchedule`（`src/actions/task/task.ts:205-210`）平铺四字段**与官方 schema 一致**。
2. ★★ **「重复」与「提醒」是同级的两个独立槽，不是从属关系**：屏上看像"提醒挂在重复里"，但码路 `repeat` 内另有一个 `reminder = {enabled, dateOffset}`（§一之十九 第 5 条），顶层**还**有一个 `reminder`（`SVe` 里原样透传、**不过任何时间变换**）。⇒ **官方有两个 reminder**：顶层那个是"这条任务本身的提醒"，`repeat.reminder` 是"每次重复的提醒时刻（当日分钟数、步长 15、96 档）"。⚠ 本批未能区分弹层「提醒我…」写的是哪一个（提醒子选择器未采到，G922）。
3. ★ `deadline` 与 `schedule` **共用 `V5`（午夜/日历归一）**，而 `reminder` 顶层不过变换、`repeat.startDate` 用 `getTime()` ⇒ 屏上两个弹层看起来几乎一样（同一 `styled` class、只差底部两条入口）是**有道理的**：它们的值语义相同；真正让 `reminder` 与它们不同味的是 §一之八 记的**第三种时间口径**。
4. ☆ **本地对照实扫**：`src/app/(app)/tasks/page.tsx:283-320` 一个展开面板并列 截止日期(286)／提醒时间(294)／重复(302)／重复结束于(317)，`setTaskSchedule`（`src/actions/task/task.ts:212-227`）一次写四字段 ⇒ **有意偏差**（官方分两个入口、本地一个面板），但**不违反 schema**；本地缺的是官方的"提醒是预设档"形态（`commands.reminder.*`：20 分钟／1 小时／3 小时／下周／自定义），本地用 `datetime-local` 绝对时刻替代。

**仍未采到（本节）**：弹层「提醒我…」写的是顶层 `reminder` 还是 `repeat.reminder`；「重复…」二级面板的字段映射（`interval`／`daily`／`weekly`／`monthly`／`yearly` 在 UI 上如何呈现）；在两个弹层里选中某日后 `blocks get --format json` 的字段回写形状（本轮刻意不提交日期）；顶层 `reminder` 与 `dateOffset` 的 96 档在 UI 上是否逐项可选。


## 一之五十五、缩进的**三个载体**、选区单位＝块、合并的**属性归属规则**（✓屏上补记 第 96 批·尾记六／七 2026-09-29 12:02–12:42，沙盒 `QODER-HARVEST-B96B`／`B96C`，均已 LIFO 还原；原始读数在 `gap.md` §三点一〇三一／一〇三二）

⚠ **本节是补记**：尾记六／七 当时只落进 `gap.md` 与 `interactions.md`，违反 §6"每批必做"契约，故在尾记八统一补齐（同时纠正 `internals.md` §三十一）。

### 1. ★★★ 缩进在模型里有**三个互不同步的载体**，在 DOM 里只露出其中一个

| 载体 | 读数处 | 本批实测 | 与既有结论的关系 |
| --- | --- | --- | --- |
| **结构属性** | `blocks get --format json` 的 `indentationLevel` | `Tab` 后从"无"变 `1`，`Shift+Tab` 后消失 | §一之四十四 第 7 条「缩进子树＝`indentLevel` 位置几何」✓ |
| **几何** | `getBoundingClientRect().x` | **356→384→412，一档 28 px**（宽度同步 515→487） | §一之三十七 记的 `--indent-w: 28px` **逐像素对上** |
| **序列化前导空格** | `--format markdown` | 缩进块前导**两个空格** | 与 §一之三十七"缩进载体＝占位 div"**并存不矛盾**（占位 div 管几何、`indentationLevel` 管语义、前导空格管导出） |

⇒ ★★ **模型↔DOM 映射表必须三列都记**：`paddingLeft` 在 `contenteditable` 与其 `ph-mask` 父级上**恒为 0px**（＝尾记五/六 那三条假阴性的根因），缩进**不落在这两个节点上**。

★ **本地实扫（本轮 `grep -in indent src` ⇒ 12 处／3 个文件，不是"零实现"，但也不是块级缩进）**：
- `src/components/editor/tabs/FormatTab.tsx:39-40` ＝ 左/右缩进两枚按钮，动作是 `e.chain().focus().liftListItem('listItem')` / `.sinkListItem('listItem')` ⇒ **只在列表项内生效**，普通段落按了无事；且 UI 上存在（有 `Indent`/`Outdent` 图标）但**没有绑 `Tab`／`Shift+Tab`**。
- `src/lib/import/markdown.ts:113-126` ＝ 导入侧已经在**读前导空格数**当 `indent`（`line.length - line.trimStart().length`），而本地编辑器**不写回**它。⇒ 有意思的不对称：**本地"读得进官方的缩进、写不出官方的缩进"**（导出时缩进会丢）。
- `src/lib/import/markdown.test.ts:…` ＝ 上述导入路径的测试。

⇒ 复刻结论：官方的"缩进"是**独立的块级第三轴**（`indentationLevel`，与"是否在列表里"正交）；本地把它**折叠进列表语义**（listItem 的 sink/lift）⇒ 结构差分，不是缺失。

### 2. ★★ **选区单位＝块，不存在文档级全选**

`Ctrl+A` 在 Craft 编辑器内 ⇒ `getSelection().toString()` 长度 **42＝当前块全文**，同文档其余四块**不在选区**；随后 `Backspace` 只把当前块 `markdown` 清空成 `""`，**块本身不被删除、id 保留**。

⇒ 与 §一之四十 读到的选区类型 `{type:"textSelectionIndex", index}` **同构**：官方的选择域是 **(blockId, offset)** 而非文档级 `(from, to)`。⇒ ★ 本地走浏览器默认全文档全选 ⇒ **P1 语义差分**；且"全选后删除不删块"这条行为要单独实现，浏览器默认会连块一起删。

### 3. ★★ **合并的属性归属规则＝前块赢**

两处独立实测：
- B1（`**B1** decorated`、无缩进）并入 A3（`indentationLevel:1`）后 ⇒ 结果块**仍 `indentationLevel:1`**（＝G914 附注）
- T1（任务块、1 档）并入 P4 ⇒ 合并后 id 归一、文本拼接，光标 `anchorOffset=21`＝**上块字符数**（＝G908，与 §一之四十 静态 `{type:"textSelectionIndex", index: 上块文本长度}` 完全一致）

⇒ 归纳：**块型制属性（缩进档）取前块、marks 取后块（加粗被完整保留）、光标落在前块文本末尾**。⚠ 本条是**两点样本**归纳，不是全表——着色/列表型制的归属仍未测。

### 4. ★★★ **块 id 全程不变**是撤销正确性的前提

尾记六 5 次改动（缩进／退缩进／退列表／合并／全选删除）＋ 5 次撤销回到基线，期间 **T1 的 id `159770cf…` 从未改变**。⇒ 官方撤销按块还原（见 `internals.md` §三十一）之所以能"回到中间态"，靠的是**块身份稳定**；⇒ 本地若用 TipTap 事务重建节点（合并/拆分常产生新 id），撤销后**同一逻辑块会换 id**，与官方可观察分歧（协作场景下更严重，与 G218 同源不同层）。

**仍未采到（本节）**：缩进三载体里"占位 div"与 `x` 位移是否同一物（本批只量到 x，没读那个 div）；着色／列表型制在合并后的归属；全选跨原子节点（数学块/提及）时的选区形状；`indentationLevel` 上限档数（本批只测到 1 档）。

## 一之五十六、快捷键目录的**状态模型**＝单 `activeIndex`、焦点是它的**下游副作用**且可丢失不干扰（✓屏上 第 96 批·尾记十二 2026-09-29 17:31，零写入＝2 次 `evaluate_script` ＋ 用户手按 `↓`／`Enter`；原始读数在 `gap.md` §三点一〇三六、`interactions.md` V88）

### 1. ★★★ 官方状态只有一个"选中 index"，没有与之并列的"焦点 index"

面板 `visibilityState:hidden` ＋ `hasFocus:false` ＋ `activeElement` 已归 `BODY`（＝焦点态在 DOM 侧**已经不存在**）的状态下，用户按 `↓` 仍把选中从「整理」（rail 下标 9）推进到「合集」（下标 10）。⇒ 若官方模型里导航的起点是当前焦点元素，这次按键**必然静默**（没有元素可作起点）。因此：

- **单一真源**＝`activeIndex`（选中）；
- **焦点＝`activeIndex` 的下游副作用**，由一次 `element.focus()` 同步，且**可以被外部（切窗口、面板后台）单独打断而不回写状态**；
- 键处理挂在**文档／容器级**，读的是"当前状态"而不是"当前事件目标的下一个兄弟"。

这与第 94 批静态读到的 `useCompositeRoot` 传 `activateOnFocus:!0`、以及尾记九"选中反推高亮"（`useIsoLayoutEffect` 把焦点吸回选中项）互相咬合：**官方从不把焦点当输入，只把它当输出**。

### 2. ★★ 桌面档的键盘可达面**没有 roving tabindex**

7 枚分类按钮属性逐枚读回：`aria-selected` 全 `null`、`tabindex` 全 `"0"`、选中态仅由 `_variantActive_1j891_*` 类表达。⇒ 桌面档建模＝**7 个常聚焦按钮 ＋ 一个类名位**，`Tab` 可以逐枚走完；compact 档（Base UI Tabs，`x8v9o` 哈希）才是 roving ＋ `aria-selected`。**两档 `Tab` 序列长度不同**，本地不可共用一套焦点管理（此条与 V86 的"判据不可跨档共用"同源，但第一次给出**可达面**而非**判据**层面的差分）。

### 3. ★ 本地实现约束（据此写就分歧最小）

| 项 | 官方（本轮实测） | 若本地这样写会分歧 |
| --- | --- | --- |
| 导航起点 | 从 `activeIndex` 推进 | 从 `document.activeElement` 找下一个 ⇒ 焦点一漂移即静默失效 |
| 越界 | 末档夹紧、不环绕（复现 V86） | `modulo` 环绕 |
| 焦点同步 | 单向：选中 → 焦点（`activateOnFocus`） | 反向：焦点 → 选中 ⇒ 浏览器把焦点交给别处时被"劫持" |
| ARIA | 桌面档零 ARIA 表达选中 | 自造 `aria-selected` ＋ roving ⇒ 与官方焦点行为不一致 |

**仍未采到（本节）**：`Enter`／`Space` 是否在这个单 index 模型上再多做一步"激活"（G890，本轮无效）；选中切换时内容区是否**同帧**换（懒渲染时机）；`Home`／`End` 语义；面板关闭后 `activeIndex` 是否被持久化（下次开面板是否记得「合集」）。

## 一之五十七、**提醒／日程的时间模型**＝"当日分钟数 96 档预设 ＋ 两步提交"，与**分类 rail 的单 index ＋ 原生激活**（✓屏上 第 97 批 2026-09-29 20:12–21:14，桌面档 1206；沙盒 `QODER-HARVEST-B97-INDENT`＝1 文档 6 块，**已还原、结构侧零提交复证**；原始读数在 `gap.md` §三点一〇三八、`interactions.md` V89）

### 1. ★★★ 提醒不是"绝对时刻输入"，是**离散档 ＋ 显式提交**

| 维度 | 官方实测值 | 与既有静态／码路的对账 |
| --- | --- | --- |
| 候选集 | **`00:00` 起、步长 15 分钟、约 **96 档****（三级列表容器 `112×300`、列内容总高 **3,088 px**、行距 **32 px** ⇒ 3088÷32 ≈ 96） | 与第 96 批静态 `repeat.reminder = {enabled, dateOffset}`（**当日分钟数**、步长 15、96 档）**逐字对上**＝本目录第一次把这条静态字段用屏上几何证成 |
| 默认值 | 未选提醒时那枚时间钮印 **「22:00」**（`108×34`） | 新增事实，此前无任何批次读到过提醒默认档 |
| 提交模型 | 二级视图底部有**「取消」「应用」一对按钮**（`216×48`）⇒ **必须点「应用」才写库** | ★ 与"选日期即写"的日程档**不同**＝日程是即选即写、提醒是两步提交；⇒ 官方在同一个弹层里**混用两种提交语义** |
| 呈现方式 | 点「提醒我…」＝**同一容器内视图替换**（`232×413/15,518 B` → `232×336/8,365 B`），**不是新弹层**、入口两枚消失 | 修正第 96 批"疑似独立弹层"的猜测（真因＝命中目标错误，G903 同族） |
| 字段归属 | 「提醒我…」写在**顶层 `reminder`** 还是 `repeat.reminder`——**仍未裁**（本批零提交，刻意只走「取消」／`Escape`） | ⚠ 要裁它必须提交一次真实提醒值＝**需新一轮写入授权**（§7① 那类） |

⇒ **对本地的意义**：`src/app/(app)/tasks/page.tsx:294-299` 的 `datetime-local`（自由绝对时刻）**现在可以正式登记为行为差分**（G922 的"尚不能当需求"作废）。官方语义＝**离散 15 分钟档 ＋ 一个默认档 ＋ 取消/应用**；若本地保留自由输入，就是**有意偏差**，需在产物里这样标。

### 2. ★★★ 分类 rail 的状态模型补一条：**激活是"焦点 → 选中"的唯一反向通道，且它不是官方代码**

`§一之五十六` 立的模型＝单一真源 `activeIndex`、焦点是它的下游副作用、方向键**只改 index 不搬焦点**。本批把剩下那一半补齐：

| 输入 | 谁处理 | 改什么 | 不改什么 |
| --- | --- | --- | --- |
| `ArrowUp`／`ArrowDown` | **Craft 自己的 handler**（文档级、不要求持焦） | `activeIndex ±1`，**夹紧不环绕** | 焦点、`tabindex` |
| `Home`／`End`／`ArrowLeft`／`ArrowRight` | **无人处理**（送达但零变化） | — | — |
| `Tab`／`Shift+Tab` | **浏览器默认动作**（顺序焦点导航） | 焦点逐枚搬 | `activeIndex` |
| `Enter`／`Space` | **浏览器默认动作**（按钮激活 → `click`） | **`activeIndex` ← 焦点 index** | 焦点 |
| `Escape` | Craft handler（文档级） | 关栈顶层 | `activeIndex`（跨重载仍保持，承 G756） |

⇒ 三条推论：① 官方 rail 是**纯 `<button>` ＋ 类名表达选中**，激活语义**外包给浏览器**，所以本地只要用真 `<button>` 就免费一致，**写了自绘 `onKeyDown` 反而会产生官方没有的分支**；② "焦点 → 选中"的反向流动**只在激活这一步**发生，且它的前提是焦点项**未被选中**（Base UI 的 `onClick` 在已选中时早退）；③ 方向键与 `Escape` 属文档级可达（不要求持焦），`Tab`／`Enter`／`Space` 属默认动作（**要求持焦**）⇒ **同一块面板上并存两种可达性**，这是本目录判"键有没有被抑制"必须先分档的根因。

### 3. ★★ 缩进的状态模型＝**整数档位、线性、无上限；级联作用域＝连续子树**

| 事实 | 屏上证据 | 建模含义 |
| --- | --- | --- |
| `indentationLevel` 可到 **4**（**无 3 档上限**） | 4 次 `Tab` ⇒ `blocks get --format json` 读回 `indentationLevel:4` | 官方档位是**开放整数**，不是"最多 3 档"那类枚举 |
| `markdown` 侧**每档 2 空格** | 同一块 `markdown` 前导 **恰好 8 空格** | ⇔ 序列化口径＝`" ".repeat(2 × level)`；本地导入用 `line.length - line.trimStart().length`（`src/lib/import/markdown.ts:121`）＝**按 1 空格粒度**解析 ⇒ 与官方"2 空格/档"不冲突但**更松**，往返会重新分布空格数 |
| 几何与档位线性 | `x` 337 → 449（**4×28 px**，与 `--indent-w:28px` 逐像素对上），宽度同步 `515 → 403` | 缩进**不是 `paddingLeft`**（承 G903 盲区），是外层容器位移 ⇒ 判据必须走几何 `x` |
| **平级兄弟不跟随** | A1 进到 4 档时，A2/A3/A4/D1 **留在 0 档** | ★ 级联作用域＝**连续子树**（第 96 批 G912/G913 的正例）＋本批的**反例** ⇒ "改父级带动整棵子树"的判定要加一句"仅当后续块档位更深" |

⇒ 本地现状＝**运行态根本没有缩进命令**（`grep -rn "indent" src/components/editor/` 0 命中；缩进只存在于导入解析），所以这里给出的三行规格（2 空格/档、28px/档、子树作用域）是**可直接实现的最小模型**，不需要先补 schema。

### 4. ☆ 只读态的**分层**（与 `internals.md §三十三` 配对看）

官方"只读"不是一位布尔，而是**三层**：① **键定义注册层**＝`features.inlineEditing` 为假时连 `updateKeyDefs` 都不跑；② **派发层**＝`isReadOnly` 时走 `pYe` 而不是 `PT`，只放行 `fYe` 那八项白名单；③ **覆盖位**＝`forcedViewOnlyMode`（与 `documentAccess.canEdit` 合成出 `canEdit`）。本批码路侧新证：**该覆盖位在当前 web 构建里永不为真**（唯一 creator 只有一个传假的调用点、且不在 export 表）⇒ ⇒ ③ 在 web 端**实际不参与**，只读全由 ①② 经 `setDocumentAccess` 驱动。这与屏上"owner 打开 `?s=` 链接不进只读"（G937）**互为解释**。本地只读是**一层**＝`editable: !locked`（`src/components/editor/Editor.tsx:380`）⇒ 若要真做访客只读，缺的是"动作白名单放行"这一层（评论、属性格等仍要能写）。

**仍未采到（本节）**：提醒值写在 `reminder` 还是 `repeat.reminder`（需提交一次真值）；「重复…」二级面板的字段映射；`activeIndex` 持久化载体（未读存储，属铁律）；只读态下 `fYe` 八项的**屏上**验证（G962 给了机制、仍无屏上证据）；缩进档位的**上限**是否真的不存在（本批只到 4 档）；跨档撤销时 `indentationLevel` 与列表型制的融合中间态（承 §一之五十五 的"按块还原快照"）。


### 5. ☆ 本批补的三条口径级更正（会影响历史条目）

① **偏移口径**：盘上 `_harvest/js/index-DiTmKH3z.js` ＝ 6,844,206 字符（比历史记的 6,841,180 **多约 3,026**，非 ASCII 10,291 个被二次编码），⇒ **本文件与 `internals.md` 里所有历史 `@` 偏移都不能拿去盘上文件直接定位**；新节一律写"盘上偏移"。
② **`allowBlockStyling` 的作用域收窄**：它只门控 **markdown 快捷输入分发器 `cne`**（硬编码 prop：普通块 `!0`、**页面标题块 `!1`** ⇒ 官方标题块永不做 markdown 快捷输入），**不是**"块级键定义整条不调用"那扇门（那扇是 `features.inlineEditing`）。
③ **`uF` 整表 18 条**（此前只记 12 条）：trigger 去重后只有 **4 个**＝空格 12／`-` 4／`=` 1／`` ` `` 1；尾部 6 条是**五种线型分隔线 ＋ 分页符 ＋ 反引号转代码块**（详见 `longtail.md §十八`）。⇒ 官方"分隔线 5 档"这条帮助站级证据，现在有了**码路级独立印证**。

## 一之五十八、**块身份（`data-block-id`）在移动／撤销／重做全程恒定**＝"按块还原快照"落到 id 层（✓屏上＋数据面双证 第 98 批 2026-09-29 22:40–23:00，沙盒 `QODER-HARVEST-B97-DRAG` 已还原；原始读数在 `gap.md` §三点一〇四一 G980／G981、`interactions.md` V91）

1. ★★★ **本轮首次把"id 恒定"钉成模型级事实**：四个块（`b8a2c7ea`／`aed7e860`／`6e85948d`／`f35ca062`）经历"拖拽改序 → `Ctrl+Z` → `Ctrl+Shift+Z`"三个动作后，**id 集合与配对关系始终不变，变的只有次序**。⇒ 官方的撤销**不是**"删除旧块 ＋ 插入新块"（那样 id 会重生），而是**把块的位置还原** ⇒ 与历次"撤销＝按块还原快照、不是逆序重放"（`internals.md §二十一`／`gap.md` 尾记六／七）在**拖拽这一支**上第四次咬合，且这次是**第一次同时拿到 id 层证据**。
2. ★★ **次序即模型**＝`blocks get --format json` 返回的 `content[]` **数组顺序就是屏上的 y 序**（本轮 6 次读回逐条对齐：`A@173,B@209,C@245,D@281` ↔ `[b8a2c7ea,aed7e860,6e85948d,f35ca062]`；移动后 `A@173,C@209,B@245,D@281` ↔ `[b8a2c7ea,6e85948d,aed7e860,f35ca062]`）⇒ 官方**没有独立的"块位置字段"** ⇒ 复刻口径＝**块级不要加显式排序数值列**。★ 本地实扫（本轮，路径已核对）＝`src/prisma/contract.prisma:52` 的 `Document` 里 `content Json?`（**`:58`**）、**全仓没有 Block 表** ⇒ 块序同样靠数组位置 **✅ 与官方一致**；☆ 但**文档级**有 `order Float @default(0)`（**`:60`**；另有 Folder `:32`／Collection `:128`／CollectionItem `:169`／Favorite `:268` 等 9 处 `order`）⇒ 官方"文档在列表里的次序"靠什么本轮未测 ⇒ **不外推、不判差**，只登记为缺证据；☆ 一条资料卫生：**契约文件真实路径是 `src/prisma/contract.prisma`**（历次产物有 3 处漏了 `src/` 前缀，本轮已改正；行号复核无误＝`isDeleted:71`／`deletedAt:72`／`@@index([isDeleted]):102`／`onDelete: SetNull:310`）。
3. ☆ **`data-block-id` 在 DOM 上是 `div[data-block-id]` 的属性、值＝块 id 逐字**（本轮直接读回，不是推断）⇒ 这是**屏上定位块的最可靠锚点**（比 `innerText`／类名稳），但**拖拽期间会临时出现同 id 的幽灵副本**（`interactions.md V91` 表行 4）⇒ 用它计数前先确认没有在拖。
4. ★★ **本地对账（本轮实扫）**＝`src/components/editor/drag-handle/DragHandle.tsx:148-168` 的 `performMove`＝**单个 tr** 做 `delete(from,to)` ＋ `insert(insertPos, slice.content)`，而块 id 由 `src/components/editor/extensions/block-id.ts` 挂在节点 attrs 上 ⇒ ProseMirror 的 `Slice` 搬运**保留 attrs**，所以本地**应当**同样 id 恒定；⚠ 但这是**从代码推出的、不是测出来的** ⇒ 立为验收项：**跑一次本地 e2e，移动→撤销→读 id 序列，与官方这条对照**，若本地 id 变化即 P0。
5. ☆ **id 恒定还解释了一条旧观测**＝历次"撤销后块上的评论／提醒仍挂在同一块"（第 66 批一带）——只有 id 不重生才可能挂得住；本轮把它从"顺理成章的假设"升为**有直接证据的事实**。

**仍未采到（本节）**：跨文档移动是否仍同一 id（要第二个沙盒＝新授权）；把块拖进 toggle／分栏后 id 与父级关系如何变；`blocks move`（MCP 写侧）与屏上拖拽走的是否同一条代码路（若是同一条，id 恒定可代理验证；若不同，则屏上证据不可替代）。

## 一之五十九、**键盘"移动块"命令＝扁平重排、块 id 恒定；回收站卡片预览渲染的是文档当前正文**（✓屏上＋数据面双证 第 101 批 2026-09-30 09:0x–09:4x；沙盒 `QODER-HARVEST-B101-DROPOFFSET` 已软删；原始读数在 `gap.md` §三点一〇四七 G1026／G1033、`interactions.md` V95 §二）

1. ★★★ **移动命令的效果面＝纯重排，不产生嵌套、不改 id**：`blocks get <沙盒> --depth 3 --format markdown` 在 `Alt+ArrowUp` 前后给出 `V1,V2,V3,V4` → `V2,V3,V1,V4`，**层级始终是 `<page>>content` 一层**（无 `<toggle>`／无子页），4 个块 id 全程恒定 ⇒ 第 98 批"按块还原快照、不是逆序重放"的 id 层证据**在键盘通路上再获一证**（此前只有拖拽通路一例，而那条读数本轮已被降级）。
2. ★★ **可逆性在"单操作"尺度上严格对称**＝一次移动 ⇄ 一次 `Ctrl+Z` ⇄ 一次 `Ctrl+Shift+Z`，三步读数逐字可回环（第 100 批"两次拖拽＋连按三次"得到的 `U1,U3,U4,U2` 回不到基线，本轮改用"单操作＋单按键＋逐次回读"就没有那个歧义）⇒ **测撤销粒度必须一次只做一个操作**，这条写进自检。
3. ⚠ **未解＝一次 `Alt+↑` 产生 2 位位移**（V1 从索引 0 → 2，等价于"V2,V3 整体上移一格"）⇒ 两种解释（多块选择被整体移动／键被重复投递）都**没有读数支撑**，因为编辑器的选择**不镜像进 `document.getSelection()`**（`rangeCount` 恒 0）⇒ 记为"官方行为未定"，本地不要照抄"Alt+↑ 移两格"。
4. ★★ **回收站卡片预览＝文档当前正文的前若干行，逐字可读**：本轮前态截图里 `QODER-HARVEST-B100-UNDOGROUP` 卡片的预览文本是 `U1 alpha／U3 charlie／U4 delta／U2 bravo`＝**第 100 批撤销实验留下的终态顺序**（不是原始顺序 `U1,U2,U3,U4`）⇒ 三条含义＝① 软删文档的正文**未被抹平**、仍参与渲染与读侧（承 G671"软删保留内容"）；② 预览按**当前序列**取行 ⇒ 撤销实验会直接改变回收站卡片外观；③ 预览行数≤5（本轮 4 行全部露出、无截断标记）。
5. ☆ **对本地内容模型的含义**＝`src/prisma/contract.prisma` 的块序字段要支持"重排即一步事务"（本地 `DragHandle.tsx:148-168` 的 `performMove` 已是单个 `tr`，形状一致 ✅）；而**回收站屏若要显示预览**，读侧必须返回正文前 N 行（本地 `src/actions/document/get.ts:70` 的 `.where({userId, isDeleted: true})` 目前是否带子块内容＝本轮未读，列入下一批队列）。

**仍未采到（本模型面）**：`Alt+↓／Alt+⤒／Alt+⤓` 三条移动命令的效果面；移动命令是否受"跨页／跨文件夹"限制；回收站预览的**截断规则**（多少字符／几行／是否含标题）；已删文档能否被写入（⚠ 禁区，历次未采）。

## 一之六十、**块序列的移动语义＝只有 before／after 两档、没有 "into" 档＝拖拽不产生层级**（✓屏上四枪＋`blocks get` 双读 第 102 批 2026-09-30 10:1x–10:5x；沙盒 `QODER-HARVEST-B102-BANDS` 已软删；原始读数在 `gap.md` §三点一〇四八 G1034／G1035、`interactions.md` V96）

1. ★★★ **层级不因拖拽而改变**＝四种纵向落点（上 1/4／中心／下 1/4／3/4）× 三种源块，每次读回的 `<content>` 都是**同一层四个兄弟块**，没有任何一次出现子层 ⇒ 官方内容模型里**"块属于哪一页"不是拖拽能改的量**（缩进另有通路：`Tab`/`Shift+Tab`，见 §一之五十族）。⇒ 本地 `performMove` 只搬顶层 range 的形状**与官方一致**。
2. ★★ **移动的单步形状＝"从序列里移除源块 → 按目标带插入"**＝A/B/C 三枪都能被这个模型精确复算（例：`[C1,C4,C2,C3]` 拖 C1 落 C2 下 1/4 ⇒ 移除 C1 得 `[C4,C2,C3]`，插到 C2 之后得 `[C4,C2,C1,C3]` ✓ 与实测逐块一致）；块 id 全程恒定 ⇒ 第 98 批"按块还原快照"第三次印证。
3. ⚠ **该模型在 D 枪失效**＝`[C4,C3,C2,C1]` → `[C3,C4,C1,C2]` 是**两处相邻交换**，单步移除-插入推不出；`drop` 只发 1 次 ⇒ 不是重复触发 ⇒ **本条第 2 点的适用范围限定为"本轮前三枪"**，官方是否存在"多块一起搬"的选择集累积仍未证（与第 101 批 `Alt+↑` 2 位位移同族）。
4. ★ **回收站预览再获一例**＝本轮 OS 截图里沙盒文档行的标题与"刚刚"正常显示，且拖拽改序后预览文本随当前序列走（承 §一之五十九.4）。

**仍未采到（本模型面）**：拖拽能否跨页/跨文档移动块；`into` 档在"目标块真有子块"时是否出现（本轮沙盒全扁平）；水平落点与缩进的耦合。

## 一之六十一、**块落点语义只有一条规则＝中线（正中点算 before）；层级仍不因拖拽改变**（✓屏上五枪 第 103 批 2026-09-30 10:5x–11:3x；沙盒 `QODER-HARVEST-B103-BOUNDARY` 已软删；原始读数在 `gap.md` §三点一〇四九 G1042／G1044／G1045、`interactions.md` V97）

1. ★★★ **落点语义收敛为一条**＝`y <= 块中线 → 插到该块之前；y > 块中线 → 插到该块之后`；**没有第三档**（第 102 批已否掉 `into`）。⇒ 内容模型侧的含义＝**拖拽只改 `order`，不改 `parentId`／不改 `type`／不改块 id**。
2. ★★ **等号归属是产品决策**＝官方把正中点判给 `before`（实测 269→before、270→after，块中线恰在 269）⇒ 本地 `before = clientY < mid` 把正中点判给 `after`；**差一格**，改 `<=` 即等价。
3. ★★ **参考系是整行 rect**（`[data-block-id]` 元素的 rect），不是内层文本层 rect——由"269 判 before"反推（文本层中线是 268.5，若以它为准则 269 已越线）。⚠ 弱证＝单块单次。
4. ☆ **块 id 全程恒定**（第五次印证）＝四枪前后 `[data-block-id]` 集合完全相同，只是顺序变 ⇒ 承 §一之五十九"按块还原快照"。
5. ☆ **对本地的含义**＝`DragHandle.tsx:126-141` 的 `computeDropTarget` 结构（遍历顶层子节点、命中 rect 即返回）与官方一致，**不需要引入"三档"或"子块即嵌套"的额外状态**；唯一要动的是那个比较符。

**仍未采到（本模型面）**：正中点归属在**奇数高度块**（如 27px 行）上的取整方向；`y` 落在两块之间空隙（padding 区）时的归属；跨页/跨文档拖拽是否仍只改 `order`。
## 一之六十二、**块落点的命中带＝行矩形＋其后 8px 尾沟槽；上下边界不对称（上夹紧、下不夹紧）；仍只改 `order`**（✓屏上五枪 第 104 批 2026-09-30 12:2x–12:5x；沙盒 `QODER-HARVEST-B104-GAPBAND` 已软删；原始读数在 `gap.md` §三点一〇五一 G1052–G1054、`interactions.md` V98）

1. ★★★ **命中带比行矩形宽**＝每行的可判定区＝`[top, top + pitch)`（行高 28 ＋ 尾沟槽 8 ＝ 36px）；落在沟槽里＝"上行之后＝下行之前"的同一槽位 ⇒ **模型语义只有"槽位"，没有"行"**（第 103 批的中线规则是"行内怎么分前后"，本批是"行与行之间也算数"）。
2. ★★★ **上下不对称**＝首块之上仍算"插到最前"（实测 y=150，比块顶还高 23px）；末块尾沟槽之外**没有任何槽位**（y=399 时 `drop` 送达但模型零变化）⇒ 官方只在**头部**做夹紧，尾部交给"无目标"。
3. ★★ **拖拽不改层级、不改块 id**（第六次印证）＝五枪前后都是 6 个扁平兄弟块，只有顺序变 ⇒ 承 §一之六十一。
4. ☆ **对本地的含义**＝`drop-band.ts` 需要两处改动才等价：① 命中带从"矩形内"扩到"矩形＋尾沟槽"（否则沟槽内零动作）② 首块之上夹紧到"before first"（尾部保持不动＝与官方一致）。⚠ 本轮**未改**，等点头；下界确切位置（389 与 399 之间）未钉死，改的时候按"末块底＋一个 pitch"起算即可与实测不冲突。

**仍未采到（本模型面）**：下界的确切像素位置；尾沟槽的归属在**最后一块是高块**时是否仍是"after last"；嵌套子块的沟槽（父子之间）是否也算带；水平方向落点。

## 一之六十三、**"什么算可交互元素"的官方定义＝一条 `:where()` 名单（7 项，含一个 `data-interactive` 逃生舱）；"什么算被选中／被按下"则同时写在类与 `data-` 属性两处**（✓盘上 第 105 批 2026-09-30 13:1x–14:1x，来源＝主 CSS 的触摸按压全局规则；gap 行 `gap.md` G1063／G1065，机制 `internals.md §四十四.三`）

### 一、可交互判定集（逐字）

```
:where(button, a[href], [role=button], [role=option], [role=menuitem], [role=tab], [data-interactive])
```

| 成员 | 覆盖的东西 | 本地对应 |
| --- | --- | --- |
| `button` | 原生按钮 | 有（Base UI `Button`，`src/components/ui/button.tsx`） |
| `a[href]` | **带 href 的链接**（无 href 的 `<a>` 不算） | 无专门判定（全库无 `a[href]` 形式的选择器） |
| `[role=button]` | 伪按钮（div 装的） | **源码里 `role="button"` 字面 0 个文件**（grep 实扫） |
| `[role=option]` | **列表选项**＝命令面板／搜索结果行 | **只有 1 个文件**写 `role="option"`＝`src/components/editor/slash-menu/SlashCommandMenu.tsx` |
| `[role=menuitem]` | **菜单项**＝侧栏树行右键菜单、⋯ 菜单 | **源码 0 个文件手写**＝依赖 Base UI 内部生成（本地不可按此名单做全局样式） |
| `[role=tab]` | **标签页**＝设置弹窗左栏、文档标签 | 1 个文件＝`src/components/editor/tabs/RightPanel.tsx`（配 `aria-selected`，共 3 个文件用到） |
| `[data-interactive]` | ★ **逃生舱**：任何元素挂上该属性就进入交互集合（用于自绘控件、不在上述 role 里的东西） | **全库零命中**＝没有这条扩展位 |

⇒ ★ 含义＝**官方"可交互"是一等概念**，且**以 ARIA role 为准、不以标签名为准**；⇒ 任何"哪些东西该有按压反馈／焦点环／快捷键可达"的问题，官方都只需要问这一条名单。
⇒ ☆ 名单**不含** `[role=checkbox]`／`[role=switch]`／`input`／`select`／`textarea` ⇒ **表单控件的按压反馈不走这条全局规则**（复选框自己用 `transition-property:…,transform` 表达勾选微动效，见 `styles.md §十二.七`）。

### 二、状态记号的**双写**约定（本批新读到的命名层）

| 状态 | 类 | `data-` 属性 | 备注 |
| --- | --- | --- | --- |
| 禁用 | — | `[data-disabled]` | 官方反馈规则一律 `:not(._isStatic,[data-disabled])` 前置 |
| 静态（不参与反馈） | `._isStatic` | — | ★ 这是"**关掉反馈**"的标记，与"禁用"并列但语义不同 |
| 选中 | `._isActive` | `[role=tab]` 走 ARIA `aria-selected` | 按钮族的"当前项"用类 |
| 勾选／半选 | — | `[data-checked]`／`[data-indeterminate]` | 复选框两态**同换**底色与边框（`--accent-500`） |
| 弹层已开 | — | `[data-popup-open]` | ★ **菜单触发按钮在弹层打开期间保持 hover 观感**（与 focus／hover 并列三态）；☆ 本地**有该属性**（`src/components/ui/dropdown-menu.tsx`／`navigation-menu.tsx` 两文件），但**没有任何 CSS 用它做"保持观感"**（本地弹层开合不改底色） |
| 只有图标／带图标／下拉 | `._isOnlyIcon`／`._hasIcon`／`._isDropdown` | — | "只有图标"是**状态类不是尺寸档**（§十一.三）；☆ 本地用 `icon`／`icon-*` **尺寸档**表达同类需求（`button.tsx:22-34`）＝分类方式不同 |
| 朝向 | — | `[data-orientation]` | 滚动条视口用；壳内 `[data-orientation]{z-index:2}` |
| 设计系统槽位 | — | `[data-ds=avatar]` | ★ **条目内的子组件按 `data-ds` 值覆写**（头像尺寸／圆角在此被 `!important` 改写）；☆ 本地 **`data-ds` 全库零命中**＝没有"槽位类型"这一层 |

⇒ ☆ 对本地 schema 的含义：**这些状态里只有"勾选／半选／禁用"进了数据模型**（`checked`/`disabled` 是块属性），其余（`_isStatic`、`_isActive`、`[data-popup-open]`、`[data-ds=…]`）全是**视图期状态**，不应落库；⇒ 本地若把"当前选中项"当数据存，就会与官方在撤销粒度／同步面上不一致。

**仍未采到（本节）**：`[data-interactive]` 的**实际使用者**（哪些自绘控件挂它）未统计，需要读 JS 或全 DOM 扫描；`data-whatintent` 的**写入方与取值全集**未读到（在 JS 里，不在 CSS）；`_isStatic` 由谁设置（是"非交互渲染"还是"性能优化"）未证；`[data-ds=…]` 的取值全集（本批只撞到 `avatar` 一个）未枚举。


## 一之六十四、**字体不是自由字符串＝21 个 family 的封闭名单（429 faces／CJK 靠 `unicode-range` 自动分流，"语言"不进模型）；白板 67 个 `--color-*` 与 `--st-*` 8 个宿主注入名都是运行时态、不是字段**（✓盘上 第 106 批 2026-09-30 14:3x–15:2x，来源＝新落盘的 12 份官方 CSS；逐字全表在 `styles.md §十三.六／七`，机制解释 `internals.md §四十五`，gap 行 `gap.md` G1072／G1073／G1074／G1075）

### 一、字体名单（family 全集 21 个，逐字；★ 这是一份"可选值枚举"，不是实现细节）

| family（官方逐字） | faces | `font-weight` 写法 | 分片 | 归属 |
| --- | --- | --- | --- | --- |
| `Inter` | 2 | `100 900`（**variable**） | 否 | UI 主字体（＋italic 一支） |
| `Source Serif` | 2 | `200 900`（variable） | 否 | 衬线 UI |
| `Avenir Next Rounded` | 8 | 400／500／600／700 离散 | 否 | 圆体 UI（× 2 style） |
| `Untitled Serif` | 6 | 400／500／700 离散 | 否 | 展示衬线（× 2 style） |
| `Roboto Mono` | 12 | `100 700`（variable） | **6 区**（cyrillic-ext／cyrillic／greek／latin-ext／latin／vietnamese）× 2 style | 等宽 |
| `Noto Sans SC`／`Noto Sans TC` | 各 **1** | `100 900`（variable） | 是 | 简／繁黑体 |
| `Noto Sans Mono SC`／`TC`／`JP` | 各 **1** | `100 900`（variable） | 是 | 三语等宽 |
| `Source Han Serif SC`／`TC`／`KR`／`JP` | 各 **1** | `200 900`（variable） | 是 | 四语衬线（★ KR 也归在 Source Han Serif 名下） |
| `Pretendard`／`Pretendard JP` | 各 **1** | `100 900`（variable） | 是 | 韩文主字体；日文复用 Pretendard JP |
| `Jetendard` | **16** | 100–800 **离散 8 档 × 2 style** | 是 | 韩文等宽（＝45 faces 里最占数的一族） |
| `Nanum Square Round` | **4** | 300／400／700／800 离散 | 是 | 韩文圆体 |
| `Resource Han Rounded SC`／`TC` | 各 **7** | 200／300／**350**／400／500／700／900 离散 | 是 | 中文圆体（★ 官方唯一出现 **350** 权重的族） |
| `M PLUS Rounded 1c` | **354** | 400／500／700 | **354 片**（逐码点枚举，每片 2–211 个引用、合计 **24,840** 个码点引用） | 日文圆体，★ 唯一不并入 `common` 的包 |
| `AdobeBlank` | 1 | 无描述符 | 否 | ★ 空白兜底（base64 内嵌，CSS 层零引用） |
| `KaTeX_*` × 12（AMS／Caligraphic／Fraktur／Main／Math／SansSerif／Script／Size1／Size2／Size3／Size4／Typewriter） | 20 | 400／700 | 否 | 数学排版专用 |
| `Assistant`（白板） | 4 | 400／500／600／700 | 否 | ★ 白板自己的 UI 字体，与主 app 的 Inter 并存 |

⇒ ★ **45 个 CJK face 的分解（本轮逐字统计）＝JP 3＋KR 22＋SC 10＋TC 10＝45**；⇒ 三语主字体走 variable（1 face 覆盖 100–900），只有 `Jetendard`／`Nanum Square Round`／`Resource Han Rounded SC·TC` 是离散档位 ⇒ **同一个"字体"概念在官方数据里是两种粒度**（一 face 覆盖全字重 vs 每字重一 face）。
⇒ ★★ **对模型的第一条含义＝"文档语言"不是字段**＝官方 45 个 CJK face 全靠 `unicode-range` 分流，**同一段文字里混中英文会逐字符切换字体**，不需要 `locale`／`language` 属性 ⇒ 本地若加"中文字体开关"是错的方向；正确做法是把字体栈写成**带 `unicode-range` 的多 face**（本地现在只有 `Inter subsets:['latin']`，中文落系统栈＝`src/app/layout.tsx:8-11`）。
⇒ ★ 第二条含义＝**字体候选集是封闭枚举**（21 个 family，其中真正给用户的 UI 字体是 Inter／Source Serif／Avenir Next Rounded／Untitled Serif／Roboto Mono ＋ 15 个 CJK ＋ 兜底与 vendor）⇒ 本地 `document` 级字体偏好字段（若有）应校验在这个集合内，而不是自由文本。
⇒ ☆ 第三条＝**两种 `font-display` 策略是数据语义的反映**＝数学 20 faces 全 `block`（式子不能先闪替代字形）、UI 与 CJK 全 `swap`；白板那 4 个 face 写的是 `display:swap`（**描述符拼错、实际未生效**＝vendor 缺陷，见 `internals.md §四十五.一`）。

### 二、白板与表格＝**运行时态，不进文档模型**（★ 本节的判据价值在这条）

| 观测 | 逐字证据 | 模型判定 |
| --- | --- | --- |
| 白板主题 | `--color-*` 67 个名／108 条定义，**整份文件 0 处 `[data-theme]`／`prefers-color-scheme`** | ⇒ 暗色**不是存储字段、也不是 CSS 双档，而是运行时覆写变量** ⇒ 本地不应把白板配色入库（与历批"偏好分纯本地 vs 服务端同步"的分界线一致，见 `internals.md` 的 `CACHE_KEY` 一节） |
| 表格列模板 | `--st-grid-columns` **只被消费、从不定义**，兜底 `none` | ⇒ 列宽由宿主**逐实例注入**（JS 算完写内联变量）⇒ **列宽属于视图配置而不是块属性**（与 §一之十 的"`views: []` 挂在 `objectList` 块上"同族，本地对应 `CollectionView` 表） |
| 表格滚动位 | `--st-scroll-left: 0px` ＋ `--st-index-bg: var(--st-page-bg, #fff)` | ⇒ 滚动偏移是**会话内视口态**，官方把它做成变量而非 state ⇒ 本地不需要为它建字段 |
| 表格选中色 | `--st-selection-bg-opaque` 兜底 `rgb(194, 223, 255)`、hover `rgb(173, 212, 255)` | ⇒ 选中态是 UI 态，不入数据；但**不透明版本的存在**说明"冻结列必须遮住内容"＝渲染约束，不是数据约束 |

### 三、★ 数学块的跨版本风险＝**序列化不受影响、渲染类名受影响**

⇒ 官方 KaTeX **0.16.25** 用无前缀类名（`.base`／`.strut`／`.rule`／`.sqrt>.root`），本地 **0.18.7** 用前缀（`.katex-base`…），**368 vs 369 条选择器里只有 218 条同名**。
⇒ 对模型的含义＝**块内容里存的 LaTeX 源不受影响**（数学块的持久化是源字符串，历批已证子树序列化成 markdown），但**任何"导出 HTML 再回灌"的通路会类名不通**⇒ 若本地做"官方导出的 HTML 直接渲染"，必须锁版本（0.16.x）或只做视觉对齐（`gap.md` G1070 的两条路）。

**仍未采到（本节）**：官方**用户可选的字体列表**（是全部 21 个还是 UI 那 5 个）未从界面确认，需要读设置屏或 i18n 的 `style.*` 命名空间；`AdobeBlank` 与 `--st-*` 的 JS 侧写入方未反编译；CJK 各 family 的**具体 face 数**（本轮只给 15 族的名单与合计 45，未逐族拆）；`--st-grid-columns` 的实际值形态（`repeat(...)`？）未采到；白板主题在本地 tldraw 下的实现未读（`src/components/whiteboard/` 本轮未开）；★ 字体偏好是否**随文档持久化**（本地字段该不该存在）未验证，需要一次屏上写入实验（属写入批）。

## 一之六十五、**代码块的"语言"不是一个字符串＝官方是三元组 `{storedLangCode, langCode, label}`（39 项封闭名单，`plaintext` 的 `langCode` 是 `null`）；同一个代码块按语言档分成三条渲染路 ⇒ "图"与"公式"可以不是独立块类型；浏览屏排序是四维度 × 两方向的封闭枚举**（✓盘上 第 107 批 2026-09-30 15:4x–16:0x，来源＝`CodeEditorWrapper`／`index` chunk 的逐字读；★ 本节**给 G1086／G1087／G1091 三条模型含义**，逐字全表在 `longtail.md §三十三.一／二`，机制在 `internals.md §四十六.二`）

### 一、语言字段＝三个不同用途的值，官方从不混用

| 字段 | 用途 | 逐字样本（不一致处全部列出） |
| --- | --- | --- |
| `storedLangCode` | **写进块属性、参与持久化与导出** | `ada｜bash｜cpp｜cs｜css｜dart｜dockerfile｜math_formula｜go｜groovy｜haskell｜html｜java｜javascript｜json｜julia｜kotlin｜lua｜markdown｜matlab｜mermaid｜objectivec｜perl｜php｜prolog｜plaintext｜python｜r｜ruby｜rust｜scala｜shell｜sql｜swift｜typescript｜vbnet｜xml｜yaml｜other` |
| `langCode` | **只喂给 CodeMirror 的 grammar** | `cpp｜**csharp**｜**stex**｜**objectiveC**｜**tsx**｜**vbnet**｜…`，其中 `plaintext` 的是 **`null`**、`other` 的是 `"other"` |
| `label` | 界面显示 | `C++｜C#｜Formula (TeX)｜Objective-C｜TypeScript｜Visual Basic.NET｜Plain text｜Other｜Mermaid｜Matlab｜Shell｜Yaml`（★ `Yaml` 与 `Matlab` 的官方大小写就是如此，非 `YAML`／`MATLAB`） |

⇒ ★★ **五处两两不一致**＝`cs↔csharp`、`typescript↔tsx`、`objectivec↔objectiveC`、`math_formula↔stex`、`vbnet` 的 label 与两个 code 差更远 ⇒ **本地只存一个字段就必然对不上官方**（本地现为 `node.attrs.language`，`src/components/editor/extensions/code-block-view.tsx:36`）。
⇒ ★★★ **`plaintext` 的 `langCode` 是 `null`（不是空串）**⇒ 官方用**显式 null 表达"高亮关闭"**这一状态 ⇒ 本地是"空值回落成 `'plaintext'` 字符串"＝表达不同、语义等价（但导出给官方时 `null` 与 `"plaintext"` 不可互换）。
⇒ ☆ **末位有 `other` 档**⇒ 语言选择器允许"未知语言"，意味着**语言字段是开放语义、封闭名单**（存 `other` 而非拒绝）。
⇒ ☆ label 大小写是**显示串、不是枚举名**（`Yaml`／`Matlab`）⇒ 历批"官方文案自身不一致"家族的最新一例：这里更像**未做统一格式化**，登记为"照抄，别顺手改成 `YAML`"。

### 二、★★★ 同一个块、三条渲染路 ⇒ **"图"和"公式"不必是独立块类型**

⇒ 分派只看 `langCode`：`mermaid` → 懒加载渲染器出 HTML；`stex` → 公式渲染；其余 → 代码编辑器本体（`internals.md §四十六.二` 逐字）。
⇒ 对本地模型的含义＝**官方 `code` 块是"多态容器"**（正文永远是一段文本源，产物随语言档变），而本地现在是＝`code` 块（TipTap＋lowlight）与**独立的 math 块**（`src/components/editor/extensions/math-block-view.tsx:6,11` 走 `@/lib/math/render`）两种块类型 ⇒ ★ 这是一条**真实的建模分叉**：官方把公式当"代码块的一种语言"，本地把公式当"块类型"。⇒ 判**有意偏差**（原因＝本地 math 块有独立的编辑态与焦点环规格，历批已定；改回"语言档"会推翻已锁的 math 交互），但**导出／导入互通时必须做映射**：官方 `math_formula` 档 ↔ 本地 math 块。
⇒ ☆ Mermaid 在本地**完全没有**（`package.json` 无该依赖）⇒ 属缺失面（G1087），且若要补，**官方形状是"加一档语言"而不是"加一种块"**。
⇒ ⚠ 本节全部是**代码级断言**＝未屏上验证过 Mermaid 入口是否对用户暴露（第 108 批队列①）。

### 三、★ 浏览屏排序＝封闭枚举两两组合（代码侧真名首次到手）

⇒ 逐字＝维度 `{Name, Shared, SharedBy, LastViewed}` × 方向 `{Ascending, Descending}`（与历批在 ⋯ 菜单里读到的"排序方式"是同族的代码真名）。
⇒ 模型含义＝排序是**视图态**（与第 84／96 批"浏览屏偏好是空间级、会同步"的结论一致），不是块属性；⇒ ☆ `LastViewed` 与 `SharedBy` 两档意味着**本地要存"最后查看时间"与"分享者"**才可能对齐（本地 `contract.prisma` 目前是否有 `lastViewedAt`／`sharedBy` 本批未查 ⇒ 登记为待查，不判缺失）。

### 四、☆ 顺带掉出来的三个数（对本地有直接含义）

| 观测 | 值 | 含义 |
| --- | --- | --- |
| 引用代码编辑器 chunk 的消费者 | **14 个**（含 `TaskViews`／`ShareSheet`／`PreferencesPanel`／`AIChatPopup`／`DocxExportApi`） | ★ **代码编辑器不是编辑器局部件**＝分享页、导出、任务视图、AI 弹窗都要它 ⇒ 本地若只在编辑器里挂 `CodeBlockLowlight`，覆盖面窄于官方 |
| 高亮类名数 | **28 个 `tok-*`** ＋ **63 个 `cm-*`** | ⇒ 本地是 `hljs-*` 一套 ⇒ **三套不通**（G1088） |
| `--heading-*` token 数 | **30 条，全部有消费点** | ⇒ 排版语义层在官方是**独立且完整的一层**（本地 0 条）；同族前缀穷举后**不存在 `--body-*` 等兄弟族** |

**仍未采到（本节）**：`storedLangCode` **到底存在块的哪个字段**（本批只看到前端数组与 `updateAttributes` 语义，未读写侧 mutation／MCP 契约里代码块的 `language` 字段名）⇒ 需下一次 `blocks add` 写入读回（属写入批）；39 档里哪些 grammar 真能解析（能力面 vs 可选项）未量化；Mermaid 的**入口 UI 与失败态文案**未屏上验证；`blockdetails.*` 命名空间里代码块相关的其他 key（如"专注模式""复制"）未逐条读；本地 `contract.prisma` 是否已有 `lastViewedAt`／`sharedBy` 两列未查；☆ `other` 档选中后 `langCode` 传什么给 grammar 未读到（数组里是 `"other"`，但 CM 侧是否有该 grammar 未证）。

## 一之六十六、**代码块实体的第二个字段＝`theme`（21 键名册、`auto` 解析成 craft 两档）；★ 官方"预览／拆分视图"与"全屏模式"是代码块自带的三档呈现态 ⇒ 图与公式不只是"渲染成 HTML"，而是有可切换的编辑面；浏览屏是"同一份数据的两种布局"（网格与列表），且列表行高写死 65**（✓盘上＋屏上 第 108 批 2026-09-30 16:1x–16:5x，来源＝`CodeEditorWrapper-DB8UxA00.js` 逐字读 ＋ 8 次只读屏上读数；★ 本节**接 §一之六十五 的语言三元组**，机制在 `internals.md §四十七.一／三`，逐字名册在 `longtail.md §三十四`，gap 行 `gap.md` G1093／G1096）

### 一、★★ 代码块的第二条设置＝主题（字段候选表）

| 量 | 逐字来源 | 模型含义 | 置信度 |
| --- | --- | --- | --- |
| `language`（三元组） | 39 项 `{storedLangCode, langCode, label}`（§一之六十五） | 块上存的是 **`storedLangCode`**（★ 不是 `langCode`、不是 `label`） | ✓盘上，写侧字段名**未取证** |
| `theme` | 名册 21 键 `ue={auto:null, craftdark, craftlight, atomone, aura, bbedit, darcula, dracula, githubdark, githublight, gruvboxdark, gruvboxlight, materialdark, materiallight, noctislilac, nord, sublime, tokyonightday, tokyonightstorm, tokyonight, vscodedark}` | ⇒ **代码块需要一个"主题 id"字段**，且 `auto` 是**合法值**（不是"没选"）⇒ 本地建模时 `theme` 的默认值应为 `auto`，而不是某个具体主题 | ✓盘上 |
| `isDark` | `De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]` ＋ `te=S.id===nt.AUTO?lt(S.id,c).isDark:S.isDark` | ⇒ `auto` 时**跟随宿主明暗**、非 `auto` 时**用主题自带的明暗属性** ⇒ ★ 一个"深色主题但 app 是亮档"的组合是**允许且稳定**的（不是被覆盖） | ✓盘上 |
| ⚠ **作用域未定** | 读到的是 `S.id`／`S.isDark`（一个设置对象），**没有证据说明它是块级／文档级／空间级** | ⇒ 本地先按**块级**建模还是按**全局偏好**建模＝待定，需一次写入读回（第 109 批队列④）；☆ 同批读到 `blockdetails.theme` 与 `blockdetails.themes` **两条 key**（单复数并存），提示"面板标题＋列表标题"两处文案、也提示可能存在"块级选择 ＋ 全局默认"两层 | ✎ 未证，已记在未采到 |

### 二、★★ 代码块有三档呈现态＝编辑／预览／拆分视图（⇒ 图与公式是"可切换的编辑面"，不是单向渲染）

⇒ 语言包逐字＝`blockdetails.edit.code`「编辑代码」＋`blockdetails.code.close.preview`「关闭预览」＋`blockdetails.code.split.view`「拆分视图」＋`blockdetails.full.screen.mode`「全屏模式」；⇒ ★ 读法＝**`mermaid`／`math_formula` 两档在"源码"与"渲染结果"之间是可来回切换的两个面，且还能同时看（拆分视图）**⇒ 与第 107 批 §四十六.二 的"三条渲染路"咬合：三条路不是"三选一固定"，而是**同一个块在编辑态与预览态之间切换**；
⇒ ☆ 另有独立 chunk `CodeEditorFocusMode`（4,757 字符，懒加载）＝「全屏模式」的实现体；
⇒ **对本地建模的含义**＝代码块组件需要一个 `viewMode ∈ {edit, preview, split}` 的态（★ 且只对图／公式两档有意义——纯代码档没有可预览语义），本地现状只有 `<pre>` 加编辑器、**没有任何预览通路**（`src/components/editor/extensions/code-block-view.tsx` 全文 65 行只有语言选择与复制）。

### 三、★ 浏览屏＝同一份数据的两种布局，行高与卡片尺寸都是常量

⇒ 屏上逐字（`/tasks/all`，视口 991×558、容器宽 703）＝同一元素上同时挂着**组件类与排版类**＝`class="_card_ydla7_1 typography-ui-md-500"` ⇒ ⇒ ☆ 模型含义＝**排版档是组件的显式声明、不是继承结果**（本地 Tailwind 走继承＋变体）；
⇒ 网格布局由 JS 计算后**绝对定位**（逐字 `style:{top:M.y,left:M.x,width:M.width}` ＋ 虚拟滚动 `estimateSize:()=>hm`），列表布局行高写死 **65px**；⇒ ★ ⇒ 对本地＝**"网格／列表"是视图态字段（要持久化），不是 CSS 开关**；☆ 与 §一之六十五 的排序四维度（`Name／Shared／SharedBy／LastViewed` × 两方向）合起来＝**浏览屏的显示态至少有三维：排序、布局、（列显隐待证）**；
⇒ ⚠ **本批没找到的那条**＝`_colUpdated`／`_colCreated`／`_colLastViewed` 三个列元素在 `/tasks/all` 屏 **DOM 里 0 个**（同屏 `_card_ydla7_1` 存在 ⇒ 不是样式表没加载）⇒ ⇒ 口径＝**"显示哪几列"目前在官方界面上没有找到消费面**，不得据此建"三列开关"字段（G1101）。

### 四、☆ 与本地代码的对照（本轮实扫）

⇒ 本地代码块＝`code-block-view.tsx:9-32` 的 22 档语言 `<select>`（`CODE_LANGUAGES`）＋ `:36` 的 `(node.attrs.language as string) || 'plaintext'` ⇒ ⇒ **只有 `language` 一个字段、且档位是官方的 22／39**；**没有 `theme`、没有 `viewMode`、没有 `font-mono` 指定**（`src/app/globals.css:11` 的 `--font-mono` 是系统栈、无 Roboto Mono）；
⇒ 本地浏览屏布局＝**视口断点**（`src/app/(app)/documents/page.tsx:28,39` 等 5 个页面写 `sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5`）＋**没有布局态字段**（无网格／列表切换的持久化）；⇒ ☆ 与 §三 的差分＝官方是"数据驱动的两种布局 ＋ 容器宽算列"，本地是"CSS 断点一种布局"。

**仍未采到（本节）**：`theme` 的**作用域**（块级／文档级／空间级）与**写侧字段名**（同 `storedLangCode` 一起欠一次 `blocks add` 读回）；`viewMode` 三档的屏上形状与切换入口（「拆分视图」在哪个按钮上）；★ 20 档主题的**默认可选集**（是不是 20 档全部可选、有没有付费档）；列表档 65px 行高在屏上的实际值（只拿到 JS 逐字，未量 DOM）；`_col*` 三列的渲染面；☆ 布局态（网格／列表）是否随空间持久化；☆ `blockdetails.theme` 单复数两条的实际用途。

## 一之六十七、**代码块的模型字段结案＝`{type:"code", language, rawCode}`（★ 正文载体叫 `rawCode` 不叫 `content`、★ `language` 存的是 `storedLangCode`、★ "没有语言"＝键不存在）；☆ 主题与明暗标记**不是块级字段**（写侧塞进去会被静默丢弃）**；☆ 浏览屏"列表"是第三种形状（网格／列表两布局之外，还有独立的类名族与虚拟滚动）**（✓数据面实测＋盘上 第 109 批 2026-09-30 17:0x–17:4x 本地＝UTC 09:0x–09:4x，来源＝沙盒 `QODER-HARVEST-B109-CODEFIELD` 的 `blocks add` → `blocks get --format json` 读回 ＋ 主包与两个 chunk 的逐字读；★ 机制在 `internals.md` §四十八，逐字表在 `longtail.md` §三十五，gap 行 **G1105／G1106／G1107／G1113**）

### 一、★★★ 代码块的落库形状（本目录第一次拿到"写入 → 读回"的双侧证据）

| 字段 | 逐字读回值（本轮实测） | 模型含义 | 置信度 |
| --- | --- | --- | --- |
| `type` | `"code"` | 代码块**是独立块类型**（不是"带语言的文本块"），与第 107 批分派表里的 `code` 档一致 | ✓实测 |
| `language` | `"python"`／`"typescript"`／`"cs"`／`"plaintext"`／`"math_formula"` | ★ **存的是 `storedLangCode`**（不是 `langCode`、不是 `label`）＝四个分歧档全部按存储码落库：`typescript`（`langCode` 是 `tsx`）、`cs`（`csharp`）、`math_formula`（`stex`）、`plaintext`（`langCode` 是 `null` **却照样存 `plaintext`**） | ✓实测 |
| `language` **缺席** | 未知语言 `qqqlang` 的块读回＝`{id, type:"code", rawCode:"d", markdown:"…\n…"}` ⇒ **整键不存在** | ⇒ ☆ **"未选语言"在官方模型里＝"键不存在"**，不是空串、不是 `plaintext`；且**未知语言不会被拒绝、不报错、不提示** | ✓实测 |
| `rawCode` | `"print('qoder-b109')"` | ★★★ **正文载体字段叫 `rawCode`**（历批一直假设是 `content`）；序列化出来的 `markdown` 是**读侧派生串**（围栏语言跟着 `language` 走，无语言时围栏退化成裸三个反引号） | ✓实测 |
| `theme` / `isDark` | 写入 `--json` 后读回**两键都不存在**（回执仍是 `Added 1 block`、不报错） | ⇒ ★ **块级假设被否**；作用域候选收窄为"文档级／空间级／另一条未暴露的 mutation"；⚠ **仍欠一次屏幕写侧复测**（在 UI 里真改一次主题再读回） | ✓实测（否证）＋ ⚠ 未定（真作用域） |

⇒ 三条建模结论：① 本地属性名 `language` 与官方一致（不用改），但**"无语言"不能归一化成 `plaintext`**（本地 `code-block-view.tsx:36` 的兜底要摘掉）；② 与 MCP 互操作时**正文要能映射到 `rawCode`**；③ **不要给代码块建块级 `theme` 字段**，等屏幕写侧判清作用域再建，否则会建错层再迁一次。

### 二、☆ 浏览屏的第三种形状（承 §一之六十六的"两种布局"）

本轮把两布局的**类名族与组件面**都拿到了：网格＝模块 `6sjpd`（`docGrid`／`scrollViewport`／`viewWrapper`）＋ `1wotv`（`virtualBody`／`virtualCardRow`，★ **网格也是虚拟滚动**）＋ 卡片 `dhebv`（`aspectRatioStretch`／`container`／`titleRow`／`iconSlot`／`selectionCheckbox`）＋ 复选框 `1fgll`（`wrapper`／`checkbox`）；列表＝模块 `1m9yz` 的 27 键名册（表头四枚可排序按钮、六个无条件渲染的行槽、`dragPreviewBase`／`dragPreviewInner`、`isUnavailableOffline`、`newDocTag`）。⇒ 模型侧的含义＝**"同一份文档集合"在官方有两套渲染树、两套类名族、两套 checkbox 实现**（第三个复选框族 `1nu3o` 还自带具名 `focusRing` 子元素），所以本地若只补一种布局，另一种的交互（列排序、列显隐、行选择）会永远缺一块。

**仍未采到（本节）**：① **`theme`／`isDark` 的真实作用域**（需要屏幕写侧一次）；② `language` 是否有独立的写入动词（MCP 无代码块主题旗标 ⇒ 只能靠 markdown 围栏）；③ 代码块的**其它属性**（有没有 `wrap`、字号、语言"最近使用"等）本轮没探到，因为读回只有那三个键＋派生 `markdown`；④ 列表／网格的**选择集模型**（`selectionCheckbox` 与 `selected` 类背后的状态是否共享一套 Set，与第 102–103 批"选择集跨操作累积"假说相关）；⑤ 卡片与行的 `isUnavailableOffline` 触发条件（离线态未采）。

## 一之六十八、第 110 批＝块模型新增一层 `pluginData`（两种厚度）、浏览屏"型制"几何模型、选择 store 与条目寻址（2026-09-30；★ 源＝逐字反编译 `_harvest/js/index-DiTmKH3z.js` ＋ 屏上只读实测；置信度＝除标注项外全部"逐字＋读数双证"）

### 一、★★★ 代码块的真实字段集（把上批的结论改写到正确键路径上）

| 字段 | 键路径 | 是否落库 | 逐字来源 |
| --- | --- | --- | --- |
| 块类型 | `type` ＝ `"code"` | 是 | 第 109 批写侧读回（`{"type":"code","language":"python","rawCode":"…"}`） |
| 语言 | **块本体 `.language`**（读侧 prop 名 `storedLanguage`） | 是；★ 不在名册里的语言 ⇒ **整键省略**（不写空串、不写 `plaintext`） | 上批读回 ＋ 本批 prop 列表 `storedLanguage:t.language` |
| 代码正文 | **块本体 `.content`**（写侧序列化键是 `rawCode`） | 是 | 上批读回 ＋ 本批 `storedContent:t.content` |
| 主题 | **`pluginData.pluginConfigurationData.themeId`** | 是（★ 但**不在 attrs 顶层**） | 读侧 `e:{const Q=m.pluginData;if(!Q｜｜Q.pluginName!=="codeBlock"｜｜!Q.pluginConfigurationData){b=null;break e}b=Q.pluginConfigurationData.themeId}`（★ 表内逻辑或写作全角 `｜｜`，真机逐字是半角双竖线） ＋ 写侧 `Ut([o],{…pluginConfigurationData:{themeId:L.id}…})` |
| 缺省态 | `pluginData` 缺失或不匹配 ⇒ 取 `null` ⇒ prop 收到**空串**（`y??""`） | — | 同上 ＋ `const z=y??""` |
| 暗档标记 | **不落库**（每档色板自带 `isDark`／工厂内 `theme` 字面量两路，见 `longtail.md §三十六.一`） | — | 名册 `V` 逐字 |

⇒ ★★★ **改判第 109 批 §一之六十七 的一条措辞**＝上批写"主题不是块级落库字段（塞 `theme`/`isDark` 被静默丢弃）"，正确说法是**块级成立、但键在 `pluginData` 里**；上批之所以证否，是因为把 `theme` 当顶层 attr 塞 ⇒ 属于"测错键"，不是"官方不落库"。⇒ ☆ 这条改判已同步写进 `gap.md` 的 G1120 与 §三点一〇五九 的「仍未采到」①。

### 二、★★ `pluginData` 是通用槽：固定六字段外壳 ＋ 按 `pluginName` 分派的可变载荷

外壳（写入侧逐字）＝`{pluginType, pluginName, pluginConfigurationData, horizontalSizeClass, verticalSizeClass, surfaceShadowOpacity}`；
已知三种 `pluginName` 字面量＝`"card"`／`"codeBlock"`／`"unknown"`（`unknown` 是兜底 `return{pluginType:"unknown",pluginName:o,…}`）；
载荷两种厚度＝codeBlock 只有 `{themeId}`；card 有 `{fontStyle,pageStyle,backgroundData{backgroundColor,backgroundColorGradientEnd,userInterfaceStyle,backgroundImageURL,isLightColor,key},decorations,contentStyle,themeAssetId}`（九字段，序列化器 `S1e`）。
⇒ ★ **建模要求**＝`pluginConfigurationData` 必须是"按 `pluginName` 判别的联合类型"，不能定死单一 interface；⇒ ☆ `horizontalSizeClass`／`verticalSizeClass`／`surfaceShadowOpacity` 三字段在代码块路径下恒为 `null`／`null`／`1` ⇒ 它们是给"网页预览／图形"类插件块用的（★ 那两类的 `pluginName` 本批未采到）。

### 三、★★★ 浏览屏的"型制"几何模型（框选命中器的输入，本地要复刻必须先有这一层）

`IVt(bandRect, geometry)` 的分派面逐字给出三种型 ＋ 一个通用层：

| 型 | `geometry.type` | 输入字段 | 命中算法 |
| --- | --- | --- | --- |
| 列表 | `"list"` | `items[]`，每项含 `{id,left,top,width,height}` | 遍历逐个严格相交（`Nee`→`j7e`） |
| 卡片网格 | `"cards"` | **两组**＝`folderItems[]`（同列表）＋ `documentsGrid{top,left,columnCount,columnWidth,rowHeight,gap,itemIds,itemCount}` | 文件夹区遍历；网格区**纯算术剪枝**（列区间＝`floor((band.left−left)/(columnWidth+gap))`，行区间同理，圈内逐格回判、`itemCount` 夹尾） |
| 瀑布流 | `"waterfall"` | `columns[]`，每列含 `{left,width,itemTops[],itemHeights[],itemIds[]}` | 先按列 x 剪枝，再对 `itemTops` **二分**找首个底边越带顶的项、顺序扫到带底为止（O(log n＋k)） |

⇒ ★ **`documentsGrid`／`columns` 是"派生态"而不是 DOM 量测**（框选不读 DOM rect，只读这份模型）⇒ ☆ 这解释了第 108 批那 12 个网格常量的去处，也意味着**本地复刻框选的前置是先把几何模型建出来**（`bW({enabled,scrollElementRef,layoutGeometryRef,remeasure})` 的 `layoutGeometryRef`）；⇒ ⚠ 模型的更新时机（谁调 `remeasure`）本批未读到。

### 四、★★ 选择集与"当前编辑块"的态归属

| 态 | 归属 | 逐字证据 |
| --- | --- | --- |
| 条目选择集 | 一个 `getState()` 形状的 store（zustand 家族）＝`selectedIds`、`replaceSelection(ids, anchor)`、`clearSelection()` | 框选每帧 `no.getState().replaceSelection(te,te.at(-1)??null)` ⇒ **整体替换、锚点＝命中集最后一个** |
| 是否正在框选 | **`uiStore.isSelectionDraggingActive`** | selector 逐字 `isSelectionDragging:X.isSelectionDraggingActive` |
| 哪一块在编辑代码 | **`uiStore.codeEditorState.blockId`**（不落块） | selector 逐字 `inCodeEditing:X.codeEditorState!=null&&X.codeEditorState.blockId===t.blockId` |
| 条目寻址 | DOM 属性 **`data-item-id`**（值是 uuid）；★ 浏览屏**没有** `data-block-id`（同屏实测 0 枚） | 实测 8 枚挂在 `DIV._outerBox_1nu3o_20` 上 ＋ 起手否决式 `t.closest("[data-item-id], a, button, input, textarea, select, [contenteditable='true']")` |

⇒ ☆ 三条门槛由此而来＝① 判"选中"不能看 `_isActive_1nu3o_62`（静止态 8/8 全带）；② 判"正在拖选"要读 store 而不是 DOM；③ 浏览屏行/卡 e2e 选择器应当用 `data-item-id`，别沿用编辑器屏的 `data-block-id`。

**仍未采到（本节）**：① 除 `card`／`codeBlock`／`unknown` 之外的 `pluginName`（网页预览／图形块）；② `codeEditorState` 的完整字段（只读到 `blockId`）；③ 选择 store 的其余动作（有没有 `addToSelection`／`toggleSelection`，本批只读到 `replaceSelection`／`clearSelection`）；④ `waterfall` 型对应官方哪一屏（本批三枚按钮只证到两枚的类归属）；⑤ `items`／`documentsGrid`／`columns` 三份模型的构建处（谁算的、什么时机）。

## 一之六十九、第 111 批＝代码块在 MCP 面上的读写契约（逐字段，含三条写通路全否）（2026-09-30 20:3x–21:1x；★ 源＝craft MCP 数据面实测（沙盒 `QODER-HARVEST-B111-THEME`，3 个代码块）；☆ 机制在 `internals.md §五十`、gap 在 G1148–G1156）

### 一、★★ 读回字段（`blocks get --format json`，逐键）

| 层 | 逐字键集 | 备注 |
| --- | --- | --- |
| 页面根 | `id, type:"page", textStyle:"page", markdown, content[]` | `markdown` 在根上＝**标题文本**（不是整篇） |
| 代码块（有语言） | `id, type:"code", language, rawCode, markdown` | `rawCode`＝正文载体；`markdown`＝派生围栏串 |
| 代码块（无语言） | `id, type:"code", rawCode, markdown` | ★ **`language` 键整个省略**（不是空串、不是 `null`）⇒ 与 G1105 同一条 |
| 代码块（设过主题） | **不可达**（数据面写不进主题，见下节） | ⇒ ☆ 第 110 批盘上读到的 `pluginData.pluginConfigurationData.themeId` **在 MCP 读回里是否出现，本批判为"当前无法证"** |
| 文本块（模板文档实测） | `id, type:"text"` ＋ 可选 `textStyle, textAlignment, decorations[], color, listStyle, taskInfo{state}, markdown` | ☆ `decorations:["callout"]` 与 `markdown` 里的 `<callout><caption>…` **同时出现**＝标记双向映射 |

### 二、★★★ 写主题的三条通路（全部否定，逐字回包）

| 通路 | 请求逐字 | 官方回包逐字 | 判定 |
| --- | --- | --- | --- |
| ① flag | `blocks update --id <代码块> --theme-id dracula` | `Error 1: Error: Theme "dracula" not found. Use "blocks explore-themes --type page" to see available themes, or apply style properties one-by-one (backdrop, colors, etc.).` | ✗ 该 flag 绑**页面**主题名册 |
| ② `--json` 带 `theme` | `--json {"id":…,"rawCode":…,"theme":"dracula"}` | `MCP tool invocation did not complete`（读回复核＝`rawCode` 未变） | ✗ 未落库 |
| ③ `--json` 带 `type` ＋ `theme` | `--json {"id":…,"type":"code","rawCode":…,"theme":…}` | 一次 `did not complete`、一次 `Invalid JSON update payload at "root": Invalid input` | ✗ 报错只到 root、不指字段 |
| 对照（成功基线） | `--json {"id":…,"rawCode":"var qoderB111 = 2"}` | `Updated block <7ad87e09…>.` | ✓ 桥正常，坏的是 payload 形状 |

⇒ ★★★ **结论**＝代码块主题**没有数据面写通路**；官方唯一的写路径是 UI 里那条 `Ut([blockId], {pluginType:"codeBlock", pluginName:"codeBlock", pluginConfigurationData:{themeId}, horizontalSizeClass:null, verticalSizeClass:null, surfaceShadowOpacity:1})`（第 110 批逐字）⇒ ☆ 本地建模时**不要**为"API 改主题"留接口。

### 三、★ `blocks add`／`blocks get` 的接口信息量

⇒ 一次 `blocks add --markdown` 插 3 个围栏块 ⇒ 回包 `Added 3 blocks. IDs: <只给第一个 id>`（★ 另两个 id 只能读回拿）；⇒ `blocks get --format json` **间歇挂起**（同命令先成功后挂两次再成功），`--format markdown` 全程正常；⇒ ★ **回收站里的文档两条通路都照样读得到**（`QODER-HARVEST-B109-CODEFIELD` 7 个块全回）；⇒ ☆ `documents list` 不带 `--location` 时**含回收站**（复证），且 `--filter` 在该命令上**不生效**（回全量 12 条）。

### 四、☆ 数学公式在序列化层的形状（待与导出映射表对账）

⇒ 第 109 批沙盒里那条公式块，MCP 读回＝`{type:"code", language:"math_formula", rawCode:"x^2", markdown:"```math_formula\nx^2\n```"}` ⇒ ★ **公式在数据面就是一种代码语言**；⇒ ⚠ 本地公式走独立 KaTeX 通路（`src/lib/math/render.ts`），`CODE_LANGUAGES`（`code-block-view.tsx:9-32`，22 条）里**没有** `math_formula` ⇒ 记为**有意偏差**（原因＝本地另有渲染器，把公式塞进代码语言会双轨）。

**仍未采到（本节）**：① 设过主题的代码块在 MCP 读回里的键形状（当前不可达）；② `collections`／`richUrl`（link card）在写侧的字段形状（本批只证到读侧）；③ `math_formula` 与既有导出映射表（`model.md` 导出节）的逐档对账；④ `documents create --destination unsorted` 的回包同时给了 `rootBlockId` 与另一个 `documentId`（`craftdocs://` 深链里那个），**两者不等**⇒ 两者的作用域差别未判。

## 一之七十、**代码块的"语言"与"主题"两侧各有多张名册：grammar 能力面 119 键（★ 其中挑选名册 5 档查不到键 ⇒ 不高亮）、主题持久化其实是两层（块级 `pluginData` ＋ 账户默认 `codeEditorDefaultTheme`）、Markdown 导出是一张 handlebars 模板（`math_formula` 出 `$$…$$`、其余出围栏、围栏长度是常量）**（✓盘上 第 112 批 2026-09-30 21:4x–23:1x，**零浏览器内容面调用、零写入**；★ 来源＝`_harvest/js/` 缓存的 `vendor-code-editor-BLm003PU.js`／`CodeEditorWrapper-DB8UxA00.js`／`vendor-craft-export-DIm_3hRN.js`／`index-DiTmKH3z.js` 定点读；★ 逐字表在 `longtail.md` §三十八，机制在 `internals.md` §五十一，样式在 `styles.md` §十九，gap 在 `gap.md` §三点一〇六二 G1160–G1179；☆ 本节接 §一之六十五（语言三元组）与 §一之六十六（主题名册））

### 一、★★★ 语言不是一个字符串、也不是一张表：本批数出**四张**

| 名册 | 条数 | 用途 | 关键形状（逐字） |
| --- | --- | --- | --- |
| 挑选名册 | **39** | 界面下拉／菜单 | `{storedLangCode, langCode, label}`（§一之六十五；本批用 `langCode:"…"` 形态匹到 38 条 ⇒ ☆ 漏的正是唯一非字符串档 `plaintext`（`langCode:null`）） |
| `jTe` | **119**（全唯一） | **CodeMirror grammar 能力面** | `X:()=>F.define(Y)` 106 条 ＋ 直接引用 13 条；`kt=Object.keys(jTe)`、`yt(r)=jTe[r]?jTe[r]():null` |
| `Qvt` | **41** | 另一域（导入／检索侧） | 扁平字符串数组 ＋ `Yvt=new Set(Qvt)`；比挑选名册**多** `docs`／`blocks`／`suggestions`、**少** `mermaid` |
| `Xvt` | **77** | **扩展名／别名 → `storedLangCode`** | `tex→math_formula`、`ltx→math_formula`、`ts/tsx/cts/mts→typescript`、`sh/bash/ksh→shell`、`c/cc/h/hpp…→cpp`（9 个别名最宽） |
| `PGe` | **3** | "伪语言"名单 | `["mermaid","math_formula","stex"]`，被**默认语言校验器**与**菜单写入守卫**各用一次 |

⇒ ★★★ **能力面判据逐字**＝`l.useEffect(()=>{if(d){if(kt.includes(d)){const i=yt(d);B(i)}}else B(null)},[d])`，`d`＝该块的 `langCode`（消费点逐字 `langCode:N.langCode`）⇒ **闸门不做任何别名规范化**（`Xvt` 那张表服务的是另一条通路）。
⇒ ⇒ ★★ 由此得一条**可屏上复验的预测**＝挑选名册 38 条 string `langCode` 里有 **7 条在 `jTe` 查不到**＝`ada`、`bash`、`matlab`、`prolog`、`vbnet`（真语言档）＋ `mermaid`、`other`（本就无需 grammar）⇒ **前五档选中后不会加载任何 language 扩展 ⇒ 不高亮**；☆ 而 `jTe` 里存在 `shell`、`octave`、`vb` 这些近义键 ⇒ ⇒ 判"名册的 `langCode` 与登记表键漏配"（不是"这些语言不支持"）；⇒ ☆ 反证设计意图＝四个已知分歧档 `csharp`／`objectiveC`／`tsx`／`stex` **全在 `jTe` 里** ⇒ `langCode` 确实就是 grammar 键。
⇒ ☆ `stex` 在 `jTe` 里 ⇒ **公式档有一条真 grammar** ⇒ 与"公式另有 KaTeX 预览通路"并存不矛盾（编辑态高亮 ＋ 预览态渲染，两条各走各的）。
⇒ 对本地模型的含义＝本地只有**一张 22 条 `CODE_LANGUAGES`**（`src/components/editor/extensions/code-block-view.tsx:9-32`）＋ 一次 `createLowlight(common)`（`src/components/editor/Editor.tsx:20,71`）⇒ 本地既没有"可选项／能力面"之分，也没有别名层；☆ 若要 1:1，最小形＝把挑选名册补到 39 条 ＋ 加一张 `tex|ltx|ts|tsx|…` 别名表，**不必**复刻 119 键的 grammar 面（低亮能力本地由 lowlight 的 common 集决定，属有意偏差，承 G1088）。

### 二、★★★ 主题不是"只落在块上"：持久化有两层，且默认层的校验**不验名册**

⇒ 块级层（承 §一之六十六／第 110 批）＝`Ut([o],{pluginType:"codeBlock", pluginName:"codeBlock", pluginConfigurationData:{themeId:L.id}, horizontalSizeClass:null, verticalSizeClass:null, surfaceShadowOpacity:1})`。
⇒ ★★ **账户默认层（本批新增）**＝挑选菜单每一项的 `onClick` 逐字 `()=>{St.store(v.id), s(v)}`，而 `St` ＝ `MGe=new Lo("codeEditorDefaultTheme","auto", t=>typeof t=="string")` ⇒ ⇒ ☆ **校验只验"是字符串"** ⇒ 任意／未知 themeId 都能进偏好，之后靠名册层 `lt()` 的 `‖V[0]` 兜底成 `auto`（契约宽、实现兜）。
⇒ ☆ 语言同构＝`Ft.store(B.storedLangCode)` ⇒ `rD=new Lo("codeEditorDefaultLanguage","javascript", t=>typeof t=="string" && !PGe.includes(t))` ⇒ ★ 两条默认偏好的**宽严不同**：主题"什么都收"、语言"显式排除三档伪语言"。
⇒ 解析层的三套兜底策略（同一件"未知名"三种下场）＝① 名册 `lt` ⇒ `V[0]`＝`auto`；② 工厂 `De` ⇒ **`undefined`（无兜底）**；③ 外部 themeId 的同步 effect ⇒ `if(!L) return`（**保持原值**）。⇒ ⇒ ☆ 上批"屏上复测 `De("",isDark)`"这条**在盘上结案并转负**（组件里 `editorTheme` prop 恒为名册条目，空串在 UI 通路不可达）。
⇒ 对本地模型的含义＝本地**两条默认键都没有**、且本地没有任何客户端偏好层（`grep -rn 'localStorage|sessionStorage' src` 0 命中；持久面只有 `prisma/schema.prisma:19-21` 的 `theme`／`editorFont`／`editorWidth`）⇒ 若要做代码块主题面，**建模要一次做两层**（块级 override ＋ 账户默认），否则与官方行为对不上（G1166）。

### 三、★★☆ Markdown 序列化的权威映射：一张模板 ＋ 一个三令牌解码器（结掉 §一之六十九 开放项③）

⇒ 模板＝`de.template`（`vendor-craft-export` @14,612，**2,729 字符**，整表落盘 `_harvest/b112-export-template.txt`）；代码块分支逐字＝`{{#ifEquals properties.language 'math_formula'}} $$\sl{{{replaceNewLines content }}}\sl$$\dl {{else}} {{{backticks}}}{{properties.language}}\sl{{{replaceNewLines content }}}\sl{{{backticks}}}\dl {{/ifEquals}}`。
⇒ ★★★ **公式在导出侧走显示数学 `$$…$$`、不是围栏** ⇒ 与 §一之六十九 读回的 MCP 字段 `markdown:"```math_formula\nx^2\n```"` **不等价** ⇒ ⇒ **官方自己两条 markdown 码路对同一个块给出两种产物**（导出模板 vs MCP 序列化器）⇒ 判"两条通路各自口径"，不断言谁错（与第 76 批"契约文案不可信"同族：读回的 `markdown` 字段不能当导出规格）。
⇒ ☆ 解码器＝`formatBlock(e,r,i)` 四步：① 先 `split("\n").filter(o=>o.trim().length!==0).join("")`（**模板自身的换行与缩进整行丢弃** ⇒ 模板里的缩进纯装饰，真实输出全部顶格）；② `l="\n"`；③ **仅当 `i`（inline）为真**时 `l = s.includes("`") ? " " : "<br>"`；④ `\dl`→`\n\n`、`\sl`→`l`、`\i__craft`→`flavour.indentationCharacters` ⇒ ★ 由 ③ 与 `backticks` 是常量可推：**任何 code 块的输出必然含反引号 ⇒ inline 语境下代码块的软换行一律变空格 ⇒ 多行代码被摊成一行**（☆ 推论，未屏上复证；`inline` 两个调用点逐字＝`formatBlock(P,r,!0)` 与 `formatBlock(g,r,!1)`）。
⇒ ☆ 围栏长度＝`registerHelper("backticks",function(){return"```"})` **常量三条** ⇒ 官方**不做自适应围栏**（内容含 ```` ``` ```` 会破栏）⇒ 与本地同缺陷（`src/lib/document-codec/index.ts:78-79`）⇒ ⇒ 记为"同构"，不算本地落后。
⇒ 本地对照（本轮实扫）＝`src/lib/document-codec/index.ts:78-79`（codeBlock → ` ```{language}\n{内容}\n``` `，语言为空时是空串）与 `:83-84`（mathBlock → `$$\n{latex}\n$$`）⇒ ★ **两条都与官方导出模板同形**；☆ 但官方"一种块类型（code）＋一个语言档分支"，本地"两种块类型两条分支"＝§一之六十五 已判的**建模分叉（有意偏差）**，本批补一句：**分叉只分在模型上，导出产物这一格是对得上的**。
⇒ ★★ 导入侧才是真缺口＝官方逐字 `else if(i.type==="math_block"){ …type:"code", content:i.content, properties:{language:"math_formula"} }`（与导出的 `$$` 分支互逆），而本地导入**没有** `$$`／`math_block` 分支（`src/lib/import/markdown.ts` 的块级分支只有 fence `:34`、heading `:51`、rule `:62`、quote `:68`、image `:81`、list `:88`；`INLINE` 正则 `:171-172` 无数学档）⇒ ⇒ **官方导出的 `.md` 再导入本地，公式会变成普通段落**（G1173，与 §一之六十五"缩进读得进写不出"同形的另一处单向断链）。
⇒ ☆ 顺带一张此前没记的映射＝`{{#case "video"}}` 出 `[fileName](url)`（**没有 `!`** ⇒ 视频塌成普通链接）、`{{#case "drawing"}}` 出 `![fileName]({{{previewImageUrl_relative}}})`（★ 用**预览图** URL 而非原图）、`{{#case "file"}}` 出 `[fileName](rawDataUrl_relative)`。

### 四、☆ 本节新增的三条"未证就不断言"

⇒ ① `yt(d)` 的加载结果进不进 `extensions`（只读到赋值 `B(i)` 与闸门，没读到组装点）；② 同 tag 多条规则的胜负顺序（影响 §三十八.八 那条 7 位十六进制缺陷的实际后果）；③ flavour 表（`L.title`／`L.bulletListStyle`／`L.numberedListStyle`／`L.todoListStyleChecked/Unchecked`／`L.focus`／`L.block`／`L.lineStyle`）的逐字取值与 flavour 一共几档。


**仍未采到（本节）**：① 上面第四条的三件；② `ada`／`bash`／`matlab`／`prolog`／`vbnet` 五档不高亮**只到盘上为止**，要屏上实测一次才算结案（☆ 零写入批可做：打开任一代码块切这五档、看 token 是否有色）；③ 主题的两层持久化在**读取顺序**上的优先级（块级 override 与账户默认谁盖谁，本批只看到 `lt(themeId, isDark)` 的入参来自外部数据，未读到"块上没设主题时是否回落默认"那条分支）；④ `Qvt` 这 41 项名单到底服务什么域（`docs`／`blocks`／`suggestions` 三个非语言值是关键线索，未读消费点）；⑤ `Xvt` 别名表的消费点（导入文件？拖拽上传？）未定位；⑥ 官方 MCP 序列化器（第 109 批读回那张）的本体未读——它在哪份 chunk、与 `de.template` 什么关系。

## 一之七十一、**第 113 批＝文档身份其实是两个 id、"在不在回收站"也不是一个布尔：`rootBlockId`（块层）与 `documentId`（链接层）不互通，回收站可见性按通路分两套；代码块语言档还带第三个隐式属性"有没有 grammar"**（✓屏上＋MCP 第 113 批 2026-10-01 04:1x–04:4x 本地＝UTC 09-30 20:1x–20:4x；★ 机制在 `internals.md` §五十二，gap 在 `gap.md` §三点一〇六三 G1180–G1191，逐字在 `longtail.md` §三十九；☆ 本节接 §一之六十九（读写契约）与 §一之七十（多张名册））

1. ★★★ **一篇文档有两个 id、两个命名空间**＝`rootBlockId`（块层，`blocks get/add/update` 只认它）＋ `documentId`（链接层，出现在 `craftdocs://open?…&documentId=` 与 web URL `editor/d/<spaceId>/<documentId>`，也是**屏上 DOM 里 `data-item-id` 的值**）；⇒ ☆ 两者**互不能直接喂给对方**（`blocks get <documentId>` 报 `Block not found`），唯一翻译器＝`documents resolve-link <url>`（且只吃 URL）⇒ ✎ **第 127 批收窄（原地）**＝它是**逐条 URL 的语义解析器、不是唯一通路**：`documents list --metadata` 一次把 **14 行**"rootBlockId ↔ raw documentId"并排打出来（批量对照器），而 `resolve-link` 的价值收窄为三件＝校验 URL 形／回显 Title／给 `Next: blocks get <rootBlockId>` 接续提示；☆ 这枚旗标还是**官方在报错 Hint 里自己指出来的**（见 `gap.md` G1262、`model.md` §一之七十八）；⇒ ★ 与第 112 批 `langCode`／`storedLangCode` 同形＝**Craft 反复把"给人/给链接的标识"与"给块层的标识"分成两套**，任何按 id 寻址的建模都要先回答"哪一层"。
2. ★★★ **"是否已删除"至少两个口径**＝MCP 的 `--location trash`（本批 6 条）与屏上「最近删除」列表（同刻 4 条），**双向都有对方独有的条目**（屏上含第 75 批已结案那条、MCP 含本批刚软删那两条）；⇒ ☆ 模型含义＝文档上不止 `isDeleted` 一个位，**"删除"与"进屏上回收站"是两个可分离的状态**；⇒ ★ 复刻口径建议＝本地只有单一 `deletedAt`（`prisma/schema.prisma`）⇒ **不要**为了对齐而凭空造第二个标记，但要在产物里写清"官方两套名单不同步"，否则下批会把"屏上看不见"当成"没删掉"。
3. ★★ **回收站的写侧模型＝读放行／写拒绝**＝同一篇回收站文档，`blocks get` 两条通路都完整返回（第 111 批 G1155），`blocks update` 逐字被拒 `Cannot modify document in trash. Restore it first.`；⇒ ☆ 拒绝点在**块级 action 入口**，不在文档级动词层（`documents` 根本没有 purge/restore 动词＝G678 那条）。
4. ★★ **语言档的第三个隐式属性＝"有没有 grammar"**＝§一之六十五 给了三元组 `{label, langCode, storedLangCode}`、§一之七十 给了 `jTe` 119 键；本批补上**行为后果**＝挑选名册 38 条 string `langCode` 里 5 条（`ada`／`bash`／`matlab`／`prolog`／`vbnet`）**选了之后整块单色**（屏上实测，对照组 `python` 正常上色）⇒ ☆ 所以"语言档"这个实体的完整属性集＝`label`（展示）＋`storedLangCode`（落库）＋`langCode`（取 grammar）＋**派生态"能否高亮"＝`langCode ∈ jTe`**。
5. ★ **代码块实体不是"文内一段"而是"一个子文档级实例"**＝六块 ⇒ `.cm-content` 六枚 ⇒ 每块自带一个 CodeMirror 编辑器（各自的撤销栈、各自的 `!important` 几何层）；⇒ ☆ 模型含义＝块级"子编辑器"边界是**运行时对象边界**，不只是渲染边界；本地是单 ProseMirror 文档内装饰 ⇒ **有意偏差**（原因＝本地不嵌子编辑器，撤销天然整篇一致）。
6. ☆ **MCP 写侧回包形态两条新基线**＝① `blocks add` 多块＝`Added N blocks.` ＋ 枚举多数 id ＋ `(+1 more)`（⇒ 要全量 id 就 `blocks get <root> --depth 1 --format json`，本批就是这么把六块的 `id`／`language`／`rawCode`／`markdown` 逐键读回的）；② `documents create` 的第二个 id **只在 app link 行**，不要指望有独立字段。

**仍未采到（本节）**：① 屏上回收站的查询条件（哪个字段决定"进不进屏上列表"）；② 两 id 的正向映射是否存在（非 URL 通路）；③ `restore` 类动词在 MCP 面到底有没有（历批结论＝没有，本批未复探）；④ 每块一个 CM6 实例 ⇒ 跨块撤销是否合并（行为未跑）；⑤ grammar 缺失的五档在**导出 markdown** 里是否仍写对语言名（本批只看了读回，没看导出）。

## 一之七十二、**第 114 批＝"明暗"其实是三条互不相干的轴（界面 `forcedDarkOrLightMode` 两值＋null、页面纸色 `colorMode` 三值含 `dynamic`、代码块主题 `theme` 字面量两分支），而"导出"这条通路不是只读的：它会改写传进去的块模型**（✓盘上 2026-10-01 04:4x–05:2x；★ 机制在 `internals.md` §五十三，逐字在 `longtail.md` §四十，gap 在 `gap.md` §三点一〇六四 G1205–G1207）

### 一、★★★ 三条轴的字段表（本地建模时**不要合并**，官方就没合并）

| 轴 | 载体 | 取值域（存储） | 取值域（UI） | 默认 | 校验器 | 是否入库 |
| --- | --- | --- | --- | --- | --- | --- |
| 界面明暗 | `forcedDarkOrLightMode` | `light`／`dark`／**`null`** | `light`／`dark`／`system` | `"system"` | zod 枚举 `CE(["light","dark"])`（⇒ **只校验显式写入**） | 是（`system` 存成 `null`） |
| 界面明暗·派生 | `resolvedColorScheme` | `light`／`dark` | 同左 | 运行时算 | 无（`Ik()` 的输出） | ★ **不入库**（每次从 开关＞URL＞存储＞matchMedia 现算） |
| 页面纸色 | `colorMode`（页面样式预设自带） | `light`／`dark`／`dynamic` | 同左 | 由 `calcPaperColorMode` 从 `{light,dark}` 两个色**算出来** | `Bet()`：非法值兜成 **`dynamic`** | 随页面样式预设走（不是账户级偏好） |
| 代码块主题 | 名册工厂里的 `theme` 字面量 | `light`／`dark` | 屏上是 20 档主题名，不是明暗档 | 每档写死（★ 与档名可以相反） | 无（解构默认值，参数进不来） | 随块 `pluginData` 与账户 `codeEditorDefaultTheme` 两层 |
⇒ ⇒ ★★★ **一条建模结论**＝"明暗"在官方**不是一个枚举被三处复用**，而是三套各自成立的机制；⇒ ☆ 本地现状（本轮实扫）＝`src/actions/user/preferences.ts:6` 把 `light|dark|system` 三值**全部入库**、`src/components/theme/ThemeProvider.tsx:8-10` 交给 next-themes 在渲染期解析 ⇒ 本地**没有** resolved 字段这一层，也没有页面纸色轴。

### 二、★★★ "导出"不是只读操作＝块模型会被就地改三处

⇒ 触发条件＝**表格某个单元格里的那个块自己有子块**（`S = P.subBlocks?.length`）；⇒ 改动逐字（`vendor-craft-export` @40,151 一带）＝① `P.content = Ri.getUUID()`（★ 仅当 content 为空）＋ `P.styleAttributes.textRuns = [{text:P.content, range:[0,P.content.length]}]`；② 该块在表格里的渲染结果被丢弃、换成 `**[[#<content>]]**`；③ 表后重出时 `g.styleAttributes.textStyle = "title"` ＋ `g.styleAttributes._runAttributes = []`。
⇒ ⇒ ★★★ **含义**＝导出一次，内存里的块模型就被改脏（标题可能被换成一个 UUID 字符串、行内样式被清空、层级被压平成一个 `# ` 块）；⇒ ☆ 这不是"导出结果不同"而是**副作用泄漏**——同一篇文档连续导出两次，第二次进的是第一次改过的模型（本批判为官方缺陷候选，未做屏上验证＝要写入实验，本批零预算）。
⇒ ☆ 本地对照＝本轮实扫 `src/lib/document-codec/index.ts:61-215` 全文没有一条对入参 `node` 的赋值 ⇒ **本地是纯函数** ⇒ 记为"有意偏差（本地做法更稳，不照抄）"。

### 三、★★ 单元格的内容在模型层"少三样东西"

⇒ 官方 inline 语境（＝单元格）逐字三抑制＝① `{{#unless inline}}{{{getHeading ...}}}{{/unless}}` ⇒ **没有标题前缀**；② `{{#unless inline}}{{lineAfterBlock ...}}{{/unless}}` ⇒ **没有块间分隔**；③ `subBlocks: i?void 0:e.subBlocks` ⇒ **子块整个不进上下文**。
⇒ ⇒ ★ **含义**＝"单元格里放一个带子块的块"这件事在官方导出里**只有两种结局**：要么内容被压成一行内联文本（无子块），要么（有子块时）走 §二那条"换成块链＋表后重出"。⇒ ☆ 本地现状＝`src/lib/document-codec/index.ts:128-137` 用 `textContent(cell)` ⇒ **永远走"压成一行"这一支**，且无条件摊换行 ⇒ 与官方差在"没有第二支"，而不是"第二支做得不对"。

**仍未采到（本节）**：① 页面纸色 `colorMode` 在**数据面**的落点（是随 `pageStyle` 一起存，还是每次由 `calcPaperColorMode` 现算）；② `isBrightColor` 的阈值与色彩空间（决定"两值相等时"怎么分档）；③ 账户级是否还有第三条"跟随系统"的独立开关（本批只看到 `forcedDarkOrLightMode` 一枚）；④ 导出副作用能否在屏上观测（要一次写入实验：连续导出两次并比对块内容）。

## 一之七十三、**第 115 批＝块链落 markdown 其实有三档形态（由 `blockLinkStyle` 改写 `linkType`），而"导出会改写传进来的块模型"拿到第二个实例；外加同一份格式档在一次渲染里有两种新鲜度＝字段读取按"活变量／构造期快照"分边**（✓盘上 2026-10-01 05:3x–06:1x；★ 机制在 `internals.md` §五十四，逐字在 `longtail.md` §四十一，gap 在 `gap.md` §三点一〇六五 G1214–G1222；☆ 本节接 §一之七十二（三条明暗轴与导出改写第一例））

### 一、块链（blockLink）的三种 markdown 形态

| `blockLinkStyle` | 官方逐字行为 | 落到 markdown 的形态 | 本地对应面 |
| --- | --- | --- | --- |
| `blockLink`（flavour 默认） | 不改写 `linkType` | 指向该块自身 | `src/lib/document-codec/index.ts:52-54`（`mention`／`blockLink` 统一 `[标题](目标)`，★ 只有一档） |
| `pageLink` | `==="pageLink"` 时把 `e.linkType` 置为 `"rootBlock"` | 指向**所在页面根块**（＝文档级链接） | 无分档 |
| `headerLink` | `==="headerLink"` 且当前是 `block` 时把它改回去 | 指向**所在标题段落** | 无分档 |

⇒ ★★ 模型含义＝**同一个"块引用"对象在导出层可以变成三种不同的链接目标**，而这三种**不由用户在这个块上选**、由一份全局格式档决定。⇒ ☆ 由谁设置仍未采到（见 `internals.md` 本节末③），所以本地**不要**提前实现三档分叉，但要在文档里承认"官方的块链不是单一语义"。

### 二、"导出器改写入参"的第二例（第一条＝上批的 UUID 重分配）

- 本批新增＝`artificialNewLines === true` 时，导出通路会给**空文本块的 content 填一个空格**，并补一条覆盖全文的 run 属性。⇒ ★★★ 含义＝**"导出"不是模型的只读投影，它可以在序列化过程中制造模型里没有的内容**。⇒ ☆ 复刻判据＝本地导出层应保持纯函数（本轮实扫＝`src/lib/document-codec/index.ts` 全文**没有对入参 `node` 的赋值**，是纯的 ⇒ 本地在这一面比官方严格，属**有意偏差**，别"对齐官方"去改写入参）。

### 三、同一份 flavour 的两种新鲜度（模型层含义）

- **格式档是"活的"**＝helper 每次调用现读模块级变量 ⇒ 一次导出中途改档会影响后续块。
- **表格缩进是"死的"**＝`TableFormatter` 持构造期快照 ⇒ 改 `indentationCharacters` 后**只有表格里的缩进不跟着变**。
- ⇒ ★★ 模型结论＝**官方导出层有一个"全局可变配置 + 一次性构造的协作者"的混合结构**，它的可观测面＝"改了缩进，标题动了、表格没动"。⇒ ☆ 本地含义＝本地没有共享可变导出配置（每次导出重新读 `node`）⇒ **不构成差分，但要在验收时知道**：如果将来本地加"导出格式档"，要一次做全（不要复现这种半新鲜）。

### 四、开关层给模型面的含义（一条判据级）

- 38 枚 `fs-*` 里 `fs-mermaid-diagrams`／`fs-excalidraw`／`fs-show-tldraw`／`fs-import-docx`／`fs-export-docx` 都是**灰度中的功能**。⇒ ★★★ 上批"mermaid 档没有 grammar 所以永不高亮"那条现在多一层解释＝**mermaid 块本身就是灰度特性**（不是漏配）。⇒ ☆ 采集纪律级结论＝**"官方没有 X"与"官方有 X 但本账户没被灰度到"是两件事**，判据源就是那两个 `<meta>`。

### 仍未采到（本节）

① `blockLinkStyle` 两档非默认值的设置方；② `linkType` 全集（本批只看到 `rootBlock`／`block` 两枚字面量）；③ `artificialNewLines` 与 `fixListOrders`／`fixIndentationLevel`／`printFullCss`／`base64Assets` 五枚字段**在 web 构建里由谁置真**（flavour 默认全是 falsy ⇒ 要么有第二份配置源，要么这些是桌面端专用形状）；④ `MarkdownExportApi` 那条通路的触发动作（决定它是"集合导出"还是"单表复制"）。

## 一之七十四、**第 117 批＝导入侧「markdown token → 块模型」映射表逐字（五种 token 的落点／属性层／兜底）**（来源＝`index-DiTmKH3z.js` @2,347,0xx–2,348,0xx 的 `Jy.parseTokens` 分派链，★ 盘上代码级证据，☆ 没有一条来自界面往返；本批同时把**本地导入器**补齐两格＝`$$` 与语言归一，见 `gap.md` §三点一〇六七 G1225 与 §〇·二）

> ☆ 本节口径：表内如出现源码里的半角 `|`，一律写作全角`｜`。

| markdown 侧 | 官方落成的块 | 属性落点（逐字键名） | 兜底与沉默 | 本地对照（本轮实扫） |
| --- | --- | --- | --- | --- |
| 围栏 `fence` 与缩进 `code_block`（两支同路） | `type:"code"` | `properties.language`＝`tIt(info,"other")`；`styleAttributes.indentationLevel`＝`MJ(token)`＝`trunc(sCount/3)`，且**为 0 时不写键** | ☆ 正文以 `<!--` 开头 ⇒ **整块丢弃**；☆ 正文末尾恰好一个空格 ⇒ 削掉一格 | `src/lib/import/markdown.ts:136-151`（fence 一支，`normalizeLanguage` 本批新加）＋ `:153-168`（`$$` 一支）；☆ 本地**没有** `indentationLevel`（`grep -rn indentationLevel src` ⇒ 0 命中） |
| `math_block`（`$$…$$`） | `type:"code"` ＋ `properties.language:"math_formula"` | 只写 `properties.language` 一键，**没有 `styleAttributes`**＝`{id,type:"code",content,properties:{language:"math_formula"}}` 逐字 | ☆ 未识别的 token 不产块，只打 `logger().warn("MarkdownImport", …)` ⇒ ⇒ **公式不是独立块类型**＝与导出侧 `$$` 分支互为逆运算（第 114／116 批第三次同证） | 本地导入落 **`mathBlock` 节点**（`src/components/editor/extensions/math-block.tsx`）＝**有意偏差**：本地渲染面以 `mathBlock` 为唯一入口，且导出侧已产 `$$`，往返闭合；☆ 若要接 MCP／官方块协议需另加"code＋math_formula"视图 |
| `hr` | `type:"line"`，`content:""` | `styleAttributes.lineStyle`＝五档表 `---`→regular／`..-`→extraLight／`.--`→light／`=--`→strong／`===`→pageSeparator | ☆ 未匹配 ⇒ `regular`（**未知即默认档**，与 G1105"未知即省略键"策略相反） | 本地 `divider` 四档 thin／medium／thick／dashed（`src/components/editor/extensions/divider.tsx:4-15`）＋导入侧 `src/lib/import/markdown.ts:182-187` **无条件 `style:'thin'`**＝完全没读 markup ⇒ `gap.md` G1229 |
| `bullet_list_*`／`ordered_list_*`／`todo_list_*` | 列表种类由 `OJ(token)` 判＝`bullet`／`numbered`／`todo`，★ 且 **`markup==="+"` 的无序列表判成 `toggle`** | `styleAttributes.listStyle`／`indentationLevel`；`properties.isTodoChecked`＝**字符串 `"1"`／`"0"`**；`numbered` 另写 `styleAttributes.userDefinedListNumber` | ☆ 列表项内**第一段归本层、后续段层级 +1**（`firstParagraph` 标志位） | 本地 `src/lib/import/markdown.ts:245-295`（`parseList`）＝按缩进建树、`taskList`／`taskItem`＋**布尔** `checked`；☆ 无 toggle 分支（`grep -n toggle` ⇒ 0 命中）⇒ `gap.md` G1228 |
| `html_block` | 两路＝`shouldParseInnerHTML===!0` ⇒ **再起一个 `Jy` 解析**（`BJ(content)` 先把 HTML 转成 markdown 再吃）⇒ 否则原样落一个空属性代码块 | 收口逐字 `FJ({token,listInfo,blockModels,iconBlockIds,prevToken,importCtx})`；☆ 之后 `reportHtmlContent` 按标签计数上报 `html_<tag>_count` | ☆ 以 `<!--` 开头的 html_block **整块丢弃**（与 fence 共用同一道闸门） | ☆ 本地**完全没有 HTML 面**＝`grep -rn "html_block｜aside｜<!--" src/lib/import` ⇒ 0 命中 ⇒ `gap.md` G1231／G1232／G1233 |

⇒ ★★★ **本节最大的一条模型结论＝"块类型名与 markdown 概念并不同名"**＝官方块侧叫 `line`／`code`／`toggle`，markdown 侧叫 `hr`／`fence`／`bullet_list_+`，中间靠 `OJ`／`MJ`／`tIt` 三个纯函数换算 ⇒ 复刻时**不要按 markdown token 名去建本地节点类型**（本地 `divider`／`codeBlock`／`toggleBlock` 三者的词表都与官方错位，见上表末列）。
⇒ ☆ 协议噪声一条＝**布尔字段有时是字符串 `"1"`／`"0"`**（`isTodoChecked`），本地一律用真布尔 ⇒ 若将来接官方协议（MCP／导入 JSON），这一格会静默错，需在边界处显式换算。

**仍未采到（本节）**：① `table`／`list_item`／`paragraph` 三支的逐字落点（本批只读到五支）；② `iconBlockIds` 是什么（图标块？）；③ 脚注 `footNoteIdUUID` 的块形状；④ 官方导入 `===`／`=--` 之后界面上到底显示什么（需屏上）；⑤ 本地导入的 `mathBlock` 与官方 `code`＋`math_formula` 之间要不要加一层映射（属建模裁决，等点头）。

## 一之七十五、**第 119 批＝导入侧「行内 token → run 装饰」映射表首次成表（数学走 `tex://` scheme、代码走 `isCode`、两种换行不可区分）＋表格导入三段判据（全连字符行／`<br>` 占位往返／结尾换行削除）＋图片块七字段形状**（☆ 盘上逐字，来源＝`index-DiTmKH3z.js` @2,339,9xx–2,346,9xx；★ 本批零屏上读数、零写入 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇六九 G1236–G1246，机制在 `internals.md` §五十六，逐字在 `longtail.md` §四十三，唯一色值在 `styles.md` §二十一）

### 一、行内侧：一个 `inline` token 进去，出来的是「一段纯文本＋一组 run 装饰」

| 子 token | 产出的装饰（键＝官方原名） | 文本怎么处理 | 证据偏移 |
| --- | --- | --- | --- |
| `text` | 无 | ★ 先做一次破折号改写（把` -- `换成一个 dash 字符），再判任务标记；⇒ ☆ **同一段文本里 `" -- "` 既是"todo 块标记的一半"又是"排版替换的输入"** | @2,343,564 |
| `<strong>` 闭合 | `isBold` | 装饰区间＝`[开标签处累计长度, 当前长度)` | @2,344,000（六路 `switch`） |
| `<em>` 闭合 | `isItalic` | 同上 | 同上 |
| `<s>` 闭合 | `isStrikethrough` | 同上 | 同上 |
| `<highlight>` 闭合 | `highlightColor`＝一枚硬编码明暗双值 | 同上 ⇒ ☆ 不接受官方自己写 HTML 时的任意色 | 同上 |
| `<link>` 闭合 | `linkURL`＝href | ☆ 前置排除谓词：host 为移动站短链域者整条丢弃 | 同上＋`sIt` @2,349,687 |
| `<span>` 闭合 | **无（空分支）** | 装饰数组不追加 ⇒ 等价于"标签存在但样式丢失" | 同上 |
| 其它标签闭合 | **无，且 `default:continue`** | ☆ 静默、不记日志（与分派链尾会 `warn` 的严格度不同） | 同上 |
| `code_inline` | `isCode` | 原文照抄进文本累加器 | @2,344,669 |
| `math_inline`／`math_inline_double` | ★ **`linkURL:"tex://"<原文>`** | ⇒ ☆ **行内数学在官方模型里不是"数学"，是一条带自定义 scheme 的链接**；同一段原文同时进文本 | @2,344,850 |
| `softbreak`／`hardbreak` | 无 | ☆ **共用一支**，都只追加一个换行 ⇒ 导入后无法区分"源里是软换行还是硬换行" | @2,344,792 |

⇒ ★★★ **形状结论**＝行内层没有"节点树"，只有 `文本 ＋ range 装饰数组` 两样东西；⇒ 与块级数学（第 117 批 G1225＝`code` 块＋`language:"math_formula"`）是**两套完全不同的表示**，同一产品内"数学"有两种落法。

### 二、表格侧：三段各有判据，且单元格是**递归子解析**

1. **收集与丢弃**（`parseTableRows` @2,339,958）＝遇到 `tr_close` 时决定这一行留不留，判据逐字＝"该格**删掉所有连字符后仍非空**，或该格本来就是空" ⇒ ★ 官方靠这个把分隔行（`|---|---|` 那一族）**整行丢掉**；☆ 它**不看冒号** ⇒ 对齐标记在导入侧根本不被解析（与第 116 批本地导出器造 `---` 的行为对照：两边都丢，但判据不同）。
2. **单元格**（`parseCell`）＝① 把 `<br>` 换成占位串（占位串含双反斜杠前缀，避免与真实反斜杠冲突）→ ② **为该格新建一个 `Jy` 递归解析**，取首块；取不到才回退成 text 块 → ③ 把占位串换回真换行 → ④ ★ **削掉结尾的一对 CRLF 或单个 LF**（⇒ 单元格永远不以换行结尾，与 G1232④ 那条"末格空格"是同族但不同动作）。
3. **装配**（`parseTable` @2,341,197）＝行 id／列 id／单元格三组 uuid 预生成；★ **首行若"没有任何非空格子"则整行删除**；块形状＝`type:"table"` ＋ `content`＝一个固定字面量（不是表格内容）＋ `pluginData` 装 `rows`/`columns`/`cells` 三组 id ＋ `subBlocks` 装单元格块 ⇒ ☆ 官方表格是"**空壳块 ＋ 三张 id 表 ＋ 扁平子块**"，不是嵌套单元格。

### 三、图片块：七个字段、三处冗余、一个硬编码比例

⇒ 逐字形状（@2,344,321）＝`type:"image"`、`content`＝src、`properties`＝`{altText, uploaded, url, rawUrl, fileName, aspectRatio}`；★★ 其中 **`uploaded` 恒为真**、**`url`／`rawUrl`／`fileName` 三者都等于 src**、**`aspectRatio` 是常量 1.5**（与图片真实比例无关 ⇒ 导入后第一帧按 1.5 占位，☆ 与第 110 批"布局列宽实测"那族同形：先给常量再等真实值）。

⇒ **本地对照**（本轮实扫）＝`src/lib/import/markdown.ts:203` 只产 `{type:'imageBlock', attrs:{src, alt}}` ⇒ ☆ 块类型名不同（`imageBlock` vs `image`）、字段 2 vs 7；⇒ 若要对齐字段名，**改的是数据迁移不是代码**（库里已有 `imageBlock`）。

**仍未采到（本节）**：① 装饰区间与 `tex://` 链接装饰同时命中同一段文本时谁生效（未读渲染侧）；② `parseCell` 递归子解析对**嵌套表格**的终止条件；③ `pluginData` 里三组 id 与单元格块的配对方向（cells 存的是"行 id→列 id→块 id"的哪一层）；④ `aspectRatio` 常量 1.5 在真实导入后是否被后续测量改写（需上屏）。

## 一之七十六、**第 124 批＝「和纸」在两处是同名不同物：官方案板是分隔线的一种样式（挂在块上、图案×颜色二维），本地同名族是文档卡片顶部的装饰胶带（不是块、不进内容模型、不进导出）⇒ 对齐的正确落点是 `divider` 节点而不是 `page-style`**（✓数据面只读 2026-10-01 19:5x–20:4x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七五 G1247–G1250，仪器与通路在 `internals.md` §五十七，逐字在 `longtail.md` §四十四，判据在 `interactions.md` V118）

### 一、官方对"分隔线"同时存在两套声明（关系未裁定）

⇒ **A 套**（在册，本轮整段复现）＝`line` 块 ＋ `lineStyle` 五值枚举 `strong／regular／light／extraLight／pageBreak`，默认 `regular`（G681／G101／G1229）；
⇒ **B 套**（本轮首读，G1247）＝`--separator washi` ＋ `--washi-pattern <六档之一>` ＋ `--washi-color <十六进制>` ⇒ 二维＝"几何图案 × 任意色"；
⇒ ★☆ **两式的关系未裁定**＝`line` 指南的五值枚举里**没有** `washi`，而 B 套用的旗标名既不是 `--line-style` 也不是 `lineStyle` ⇒ 两种候选各自含义不同＝① `washi` 是 `lineStyle` 的第 6 档（那么图案与颜色是这一档的子参数）② `separator` 是与 `lineStyle` 正交的第二字段（那么一条线可以同时有粗细与图案）。⇒ 裁定要写侧（G1250 挂第 125 批队列，且要先拿当轮具名授权）。
⇒ ☆ 顺带一条不闭合＝A 套指南逐字写着共享字段 `color (#RRGGBB)`（**6 位**），而屏上实测数据里存在 8 位带 alpha 的值（G1146 的 `#f4f4f41f`）⇒ 契约声明与实测数据在 alpha 通道上不一致 ⇒ **记为契约缺陷候选**，不改判在册读数、也不据此说官方错。

### 二、本地这两套各自的对应面（本轮实扫）

| 官方形状 | 本地最近的对应物 | 差在哪 |
| --- | --- | --- |
| `line` 块 ＋ `lineStyle` 五档（含 `pageBreak`） | `src/components/editor/extensions/divider.tsx:4` 的 `DividerStyle` ＝ `thin／medium／thick／dashed` 四档；`:33-41` 单属性 `style`（默认 `thin`）；`:50` 渲染成 `hr[data-type="divider"][data-style]` | 档名不同族、**无分页档**、默认档不同（官方 `regular` vs 本地 `thin`）⇒ 已在册 G31／G101／G1229，本批不重复登记 |
| `--separator washi` 的"图案 6 档 × 任意色" | **无对应面**＝本地 `washi` 是另一件东西：`src/components/editor/themes/page-style.ts:11`（`WashiId` 六枚＝`none／sunset／ocean／forest／candy／aurora`）、`:29`（`washiTapes` 每档挂**一条 CSS 渐变变量**、**没有颜色参数**）、`panels/PageStylePanel.tsx:240` 的 `washiTapes.map` ＋ `:252` `setPageStyle({ washi: tape.id })`、渲染侧 `DocumentEditor.tsx:115` 取渐变 ＋ `:227-232` 画成 `aria-hidden` 的 `h-5 w-32 -rotate-2 opacity-80` 小条 | ★★★ **同名不同物**＝本地 `washi` 是**页面级装饰**（不是块、不在内容模型里、不进 markdown／html 导出），官方 `washi` 是**块级分隔线样式** ⇒ ☆ 任何"对齐和纸"的改动都必须落在 `divider` 节点上，**改 `page-style.ts` 是改错对象**（这条就是本节存在的理由） |

### 三、建模含义（三条）

⇒ ① **名称撞车是跨系统对齐的主要风险面**＝两边都有 `washi`、都是六枚 id，但一个是块属性、一个是页面装饰 ⇒ ☆ 今后每登记一条"本地对应物"都要先问一句"它在不在同一个层（块／页面／空间）"，只比对 id 名单必然得出假差分（本批草稿就犯了一次，见 `gap.md` §三点一〇七五 §二 G1247 的 ✎ 改判）；
⇒ ② 若 B 套日后要在本地落地，需要的不是"再多几档枚举"，而是**给 `divider` 节点在 `style` 之外加两字段**（图案名 ＋ 颜色），且颜色要能表达"任意值" ⇒ 与 G672 那条"页面样式＝18 个正交旗标、官方明文否认自定义样式 id"同族＝**官方一贯用正交属性，不用可命名样式对象**；
⇒ ③ 官方自己给出的 `--washi-color #3B82F6` 是**用法示例里的例子值**，不是任何一档的官方色值 ⇒ ☆ 不许进 `styles.md`（本批 `styles.md` 因此**无新节**，原因同时写进 `gap.md` §五）。

**仍未采到（本节）**：① A／B 两套的关系（两条候选未裁，要写侧）；② 官方**屏幕**里"分隔线样式"面板是否给图案与颜色入口（零写就能采，卡在标签页）；③ washi 六档的**实际观感**（本轮只有英文描述，无截图、无导出物）；④ `Type` 是否真只有 `built-in` 一种（只观察到一种 ≠ 穷尽证明）；⑤ 图案与颜色的**存储形状**（官方 `styling` 里 `separatorStyle` 是一段 DSL 串＝G686 在册，本批没有新写入所以没读到图案档怎么落库）；⑥ 官方移动端整族。

## 一之七十七、**第 126 批＝"分隔线样式"在官方三个面上是三份不同的名册（六档默认 `none`／五档默认 `regular`／五档围栏表出 `pageSeparator`），而 `pageBreak` 与 `pageSeparator` 是两条通路各自的写法 ⇒ 本地若要吃官方 JSON 必须先建一张档名映射表**（✓数据面只读 2026-10-01 21:4x–22:1x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七七 G1256–G1261，仪器在 `internals.md` §五十九，逐字在 `longtail.md` §四十六，判据在 `interactions.md` V120；☆ 本节**不新增任何一次实测**，它是对三条**已在册**读数的一次对齐＝G526／G530／G681／G1229／G1250）

⇒ ★★★ **三个面、三份档名表，逐档对照如下**（每行的右侧都注明出处，避免本节被当成一次新读数）：

| 面 | 档名集合 | 缺省值 | 出处（在册编号） |
| --- | --- | --- | --- |
| A＝主包解析层（`$t`／白名单 `QPe`） | `none`／`extraLight`／`light`／`regular`／`strong`／`pageSeparator` **六档** | `"none"`（未知值经 `j3(…)` **静默回退**成它） | G101、G526、G530、`model.md` §一之十九（`lineStyle` 那一行的六档与默认值） |
| B＝MCP 契约指南（`blocks learn line`） | `strong`／`regular`／`light`／`extraLight`／`pageBreak` **五档** | `regular`（逐字 `lineStyle defaults to regular if omitted`） | G681、G1250 第②段、`longtail.md` §四十四之三 |
| C＝markdown 导入器（围栏字符 → 档名） | `..-`→`extraLight`／`.--`→`light`／`---`→`regular`／`=--`→`strong`／`===`→`pageSeparator` **五档** | `?? "regular"` | G1229、`longtail.md` §四十二（逐字串在该节内） |

⇒ ★★★★ **对照出来的三条确定事实**＝① **同一枚"分页符"档在 B 面写作 `pageBreak`、在 A／C 面写作 `pageSeparator`** ⇒ 两条通路各自用词，官方内部**没有共用一枚枚举名**（这是历批"两向字段名不一致五组"（G538）之后**又一个同族实例**，而且是同一个值在两份官方文本里不同名，比换字段名更隐蔽）；② **`none` 档只存在于 A 面**＝B 面的可写枚举里没有"无"，C 面的围栏表也产不出它 ⇒ ⇒ "没有线"这个态在官方模型里是**解析层的一个兜底档**，不是一个可写入的值；③ **两个面的缺省值相反**＝A 面缺省 `none`（＝没有线）、B 面缺省 `regular`（＝一条常规线）⇒ ☆ 这不是笔误级差异，而是**语义层不同**＝A 面的缺省是"属性没写时的解析兜底"，B 面的缺省是"插入时不传 `lineStyle` 会得到什么"。
⇒ ⚠ **一条推论，标为未实测（严禁写成官方行为）**＝如果 B 面的 `pageBreak` 原样送进 A 面的解析器（白名单是 `$t` 六值），按 G530 在册的"未知值静默回退"，它应当会落到 `none` 而不是 `pageSeparator` ⇒ **但本批零写入 ⇒ 没有做过一次真实的 `blocks update --json` 往返** ⇒ 登记为候选，结案需要写侧（挂第 127 批队列，需要当轮具名授权）；☆ 若成立，含义＝**从 MCP 写"分页符"会得到一条隐形的线**，这是一条值得盯的产品级陷阱。
⇒ ★★ **本地侧的唯一含义（不是差分，是映射工作量）**＝本地分隔线只有 `DividerStyle = 'thin'／'medium'／'thick'／'dashed'` 四档、默认 `thin`（`src/components/editor/extensions/divider.tsx:4`，速记表在 `:7`，已在册见 G101 与 G1229）⇒ 本地既没有"分页符"档也没有"无"档；⇒ ☆ 所以对齐官方 JSON 时**要建的是一张三向映射表**（本地四档 ↔ A 面六档 ↔ B 面五档），而不是一一对位；★ 并且要显式决定"未知值怎么办"＝**别照抄 A 面的静默回退**（那条在官方是缺陷温床，历批已记 G530"未知值处置方式未取到"）。

## 一之七十八、**第 127 批＝两枚 id 的"批量对照器"到手（`documents list --metadata` 逐行并排打 rootBlockId 与 raw documentId）⇒ 上一节那条"唯一翻译器"收窄；外加五条块模型真数据实读（shared 四字段、decorations 形态、backdrop 是字符串、lineStyle 落五值内、image／richUrl 字段名）**（✓数据面只读 2026-10-01 22:2x–23:3x 本地；★ 零屏幕、零写入 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七八 G1262–G1267，机制在 `internals.md` §六十，逐字在 `longtail.md` §四十七，判据在 `interactions.md` V121，色值在 `styles.md` §二十二）

### 一、★★★ 双 id：从"单一翻译器"到"一份对照表＋一个语义解析器"

⇒ 原句在 §一之七十一 1（第 113 批），逐字＝`唯一翻译器＝documents resolve-link <url>（且只吃 URL）`，**本批原地 ✎ 收窄为**：
⇒ ★ **`documents list --metadata` 是第二个翻译器，且是批量的**＝回包逐行格式（逐字）＝`<rootBlockId> Title (createdAt, lastModifiedAt)` ＋ `→ craftdocs://open?spaceId=<spaceId>&documentId=<rawId>` ⇒ **14 行一次给齐两枚 id 的对照**，而且每篇的两枚都不同（例：样本文档的 rootBlockId 与 raw id 各自独立，本产物折作 `<rootBlockId-W>`／`<rawId-W>`）；
⇒ ★★ **而这个旗标是官方自己在报错 Hint 里指给我的**（逐字 `Hint: run documents list --metadata to see accessible documents and their rootBlockIds.`）⇒ 结构上＝**失败路径自带导航**（与 `Next page: … --page 2`、`Supported options: …` 同族，第三次）；
⇒ ★ **resolve-link 的价值收窄为三件**＝① 单条 URL 的**语义解析**（校验 URL 形、拒绝"不是链接的东西"）② 输出 Title（对照用）③ 给下游一个 `Next: blocks get <rootBlockId>` 的接续提示；
⇒ ★★ **正／负对照才把模板语义钉死**＝负＝拿 rootBlockId 当 web URL 尾段 ⇒ `Could not find this document in the current MCP scope.`（回包还回显 `Raw URL documentId: <我喂进去的那枚>` ⇒ 官方**告诉我它把哪一格当成了 raw id**）；正＝换 raw id ⇒ 成功 ⇒ `https://docs.craft.do/editor/d/<spaceId>/<rawDocumentId>` 的**尾段＝raw documentId** 结案，且 web 形与 `craftdocs://` 形共用同一套 raw id；
⇒ ☆ **本地含义（不是差分）**＝本地是单 id 体系（`src/actions/document/search.ts:42`／`:70` 只用自家 uuid），没有两枚 id 的翻译层 ⇒ 官方这层"标识分叉"（G538 那族）在本地**根本不存在**，对齐时不要凭空造出来。

### 二、★★★ 五条块模型真数据实读（声明层第一次和数据层对上）

1. **G1250 的 shared optional fields 有四枚同时出现**＝`indentationLevel: 1`（Quick Start 里两张缩进的图块）、`taskInfo: {"state":"todo"}`（四个任务块）、`decorations`、`color: "#00ca85"`（**六位 hex** ＝ 与契约 `color (#RRGGBB)` 一致；☆ G1146 记过屏上存在 8 位带 alpha 的值 ⇒ 两种都存在、不改判）；
2. ★ **`decorations` 的实读形态是数组**（值形如 `["quote","callout"]`），而 G530 记的**默认值是 `{}`（对象）**⇒ 默认与填充两种形态不一致的候选（只登记实读，不判谁对）；☆ 本地仍只有巧合同名的 ProseMirror `decorations(state)`（`sidebar-drop.ts:38`）；
3. ★★★ **`styling.backdrop` 是 JSON 字符串而不是对象**＝值逐字形如 `{"image":{"imageBgColor":"#ffe5cf","imageBlurHash":"@HT8Xdu…","imageIsBlurred":true,"imageUrl":"https://res.craft.do/user/full/…"},"size":"full","type":"image"}` ⇒ **同一层里既放了结构又把它序列化成字符串**；同层 `pageWidth` 的值是**字符串 `"false"`**（不是布尔）⇒ **G538 那族"两向形态不一致"的最新一例是对象→字符串**；⇒ ★ 对齐含义＝本地若要吃这份数据，**必须先按字符串再解析一层**，照抄成对象会静默丢整个封面；
4. ★ **`lineStyle` 真数据落在这五值契约内**＝实见 `"lineStyle":"light"`（Watch／Handbook 的分隔线）与 `"extraLight"`（Quick Start／Import 段的分隔线）⇒ 与 `blocks learn line` 的五值枚举、与 §一之七十七 的三面对照表**同向**（本批没见到第六个值，也没见到 `pageBreak`／`pageSeparator`）；
5. ☆ **字段名两处实读**＝`type:"image"` 的图块用 **`url`**（不是 `src`）且带 `indentationLevel`；`type:"richUrl"` 带 `url`／`title`／`description`／`markdown` 四字段（与 G681"richUrl 是 link 卡"对上）。

### 三、☆ 覆盖范围必须一起记的原因

⇒ 本批的 JSON 扫描用的是 `--depth 1`，而**深度 1 也会对子树做摘要**＝子页给 `contentPreviewMd` ＋ 尾行 `…and N more blocks`、集合给 `itemsPreviewMd`（`<collectionItem>` 模板）⇒ **"扫过"只覆盖到第一层与摘要行**；⇒ 所以 G1266 的覆盖要写成"11 篇一级＋3 个子页下钻"，而不是"全空间扫过"。

⇒ ☆ **仍未采到（本节）**：① `documents list --metadata` 的**带值过滤**形态（描述行写作复数 `metadata filters`，本批只跑过裸跑）＝`gap.md` 台账「二十六」③；② `decorations` 的默认 `{}`（G530 在册）与实读数组两种形态里，哪一条是写侧产生的＝需写侧或盘上反编译，本批零 bundle 读取；③ `styling.backdrop` 本批只在**两篇**（Craft Handbook／Quick Start）实见、两处都是字符串形态，其余 12 篇是否同形态未验；④ `pageWidth` 除字符串 `"false"` 之外的取值集合未穷举（同一 `styling` 层里是否还有别的字符串化布尔也未扫）；⑤ 白板那一格的模型侧读数＝等屏幕授权（`gap.md` G1267 与台账「二十六」②）；⑥ `richUrl` 的四字段是否恒为四字段（本批只见一处形状，未穷举）。

## 一之七十九、**第 128 批＝文档元数据模型拿到第二次独立印证，而且这一次是契约自己写的：`documents list` 的 Flags 段有六枚日期旗标，过滤的正是上一批那两枚时间字段 ⇒ "双 id ＋ 两枚时间戳"从实测读数升格为声明层**（✓数据面只读 2026-10-02 00:5x–01:2x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七九 G1268–G1275，机制在 `internals.md` §六十一，逐字在 `longtail.md` §四十八，判据在 `interactions.md` V122；☆ `styles.md` 本批无新节＝零色值读数）

### 一、★★★ 两枚时间字段第一次有了"可查询"的声明

⇒ 上一节（§一之七十八）记的是**实测**＝`documents list --metadata` 逐行打 `(createdAt, lastModifiedAt)`；本批打 `documents list --help` 得到**声明层**（逐字）＝`--metadata  Include timestamps (createdAt, lastModifiedAt) and clickable links` ⇒ ☆ **同一对字段名在两处独立出现**（一枚是回包格式行、一枚是旗标描述行）⇒ 这两个名字的**大小写与拼写**由此升格为双源事实；
⇒ ★★★ **官方把这对字段做成了可过滤维度**＝`--created-after`／`--created-before`／`--modified-after`／`--modified-before` ＋ `--daily-note-after`／`--daily-note-before`，值形＝`Dates: YYYY-MM-DD or relative (today, yesterday, tomorrow)`；⇒ ☆ **两种日期形态并存**＝ISO 风格的 `YYYY-MM-DD` 与三个英文相对词 ⇒ 与第 56 批在册的 `day://2026.09.27`（点分隔）是**第三套**日期写法，本地若要复刻这三套要先建一张"日期输入形态"表；
⇒ ★ **日记账有两枚专用旗标，说明"日记账"在模型里是一个可寻址子集而不是标题形态**（本空间 `--location daily_notes` 为 0 条 ⇒ 实测上仍不可判它的成员条件，见 `gap.md` G1268 未采到②）。

### 二、★★★ 双 id 模型的第二次独立成文（这次是契约文案，不是我的实测）

⇒ 上一节我写"`documents list --metadata` 是第二个批量对照器"，靠的是回包里 `craftdocs://open?…documentId=<rawId>` 与行首 `<rootBlockId>` 并排；本批 `--help` 里官方**逐字自报**（原文照抄）：
```
The IDs shown in this command are rootBlockIds — use them with blocks get.
Craft app/web links contain a different raw documentId; use documents resolve-link to convert links.
```
⇒ ★★★ **两枚命名空间＋唯一反向翻译器＝契约文本自证**，⇒ ☆ 第 113 批那条"唯一翻译器＝`documents resolve-link`（且只吃 URL）"至此拿到**第三个支撑**（实测正负对照 → 批量对照器 → 契约自报），但也同时被 §一之七十八 那条原地 ✎ 限定＝**批量通路存在**，`resolve-link` 只是逐条语义解析器；
⇒ ☆ 同一段还给出**缺省作用域的行为声明**＝`Without --location or --folder, returns ALL documents (may be large — use folders list first)` ⇒ ★ **裸跑包含回收站**（G1155 在册）现在有了契约侧的半句旁证（"ALL documents"），但官方没在这里明说"含已删除"⇒ 不升格，仍按实测口径用。

### 三、★★ cursor 的模型含义：契约描述了一个"会失效的状态"

⇒ 逐字＝`If a cursor becomes invalid (CURSOR_INVALID), the underlying data has changed — retry without --cursor.` ＋ `reminders list` 散文里的 `Continue with the returned cursor and the same status filter. If the cursor becomes invalid, restart without it.`；
⇒ ★ 模型侧读法＝**游标不是 offset 的别名，而是与底层数据版本绑定的令牌**（"数据变了就失效"＝游标里编码了快照位置），而 `--offset` 历批实测是纯位置跳过 ⇒ **两种分页在模型上是两回事**（本地若只做 `skip/take`，复刻的是 `--offset` 那一支，不是 cursor 那一支）；
⇒ ☆ `--cursor` 的**校验严格度逐动词不同**（第 127 批：`folders list` 不校验值、`reminders` 校验；本批：`documents list` 回 `Invalid cursor format. Retry without cursor.` ＋ Hint 行＝**校验格式**）⇒ 三条凑齐"同一族旗标三种严格度"。

### 四、☆ 一条与本地模型直接相反的读数（不是差分，是提醒）

⇒ 官方声明缺省作用域返回 **ALL**（含回收站），本地 `searchAll` 缺省写死 `isDeleted: false`（`src/actions/document/search.ts:70`）＝**排除**回收站 ⇒ ☆ 这条自第 122 批起在册；本批新增的只是"官方契约自己也说 ALL"这半句 ⇒ 判定不变、不改代码、不升 P0。
