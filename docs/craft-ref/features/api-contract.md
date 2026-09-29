# Craft 操作契约（AI / MCP / Imagine API 的 zod schema）

来源：`_harvest/js/AIChatPopup-*.js` 等产品自带 bundle 里的 **zod schema + `.describe()` 英文说明**（全量转写见 `_harvest/api-describes.tsv`，30 条说明 + 4 个枚举集）。
这是产品**给自己写的机器可读契约**：它定义"外部（AI 或用户）能对文档做哪些操作、参数默认值是什么、返回什么"，因此比界面截图更接近操作语义的权威源。置信标记：`✓`=契约文本直述；`~`=由契约推断界面行为。

## 一、内容模型（`✓`）

块（block）对象的字段：

| 字段 | 契约原文 | 含义 |
|---|---|---|
| `id` | `id: string` | 块唯一 id（界面侧证：`data-block-id`；URL 可直接带 blockUuid 深链） |
| `type` | `type: string` | 块类型（词表见 `model.md` 第一节） |
| `content` | `content: string` | 块自身文本 |
| `children` | `children: array(block)?` | 子块数组 |
| `isPage` | "Whether this block has children (is a page/subpage)" | **页面不是独立实体：有子块的块就是页面** |
| 子计数 | "Number of direct children this block has" | 块带直接子块计数 |
| `pageContent` | "the content of all its direct children in one string in **markdown format**" | 子树内容以 markdown 字符串表示；`includeSubPagesRecursively=true` 时递归包含全部后代 |
| `subPages` | "List of subpages (children with their own children). Only included if `includeSubPagesRecursively` is false" | 子页 = **自己也有子块的子块**；不递归时单列出来 |

层级与遍历参数：
- `depth`：**最大 10**（"Maximum depth the structure is displayed. Default value is 10."）→ 官方嵌套上限的权威数字。
- `includeSubPagesRecursively`：默认 `true`；`false` 时只取一层并把子页列表另给。
- `limit`：文档/文件夹树默认 **100**；文档列表默认 **50**。

**标题层级词表（`✓`，直接回答"官方 title/subtitle 与 H1–H4 的关系"）**：
> "The heading level: `'title'`, `'subtitle'`, `'heading'`, `'strong'`, `'page'`, `'body'`"

即官方的排版层级是 **title / subtitle / heading / strong / page / body** 六档，**不是** 1–4 级标题的线性阶梯。`heading` 是单一档名（层级细节另由属性表达），`page` 与 `strong` 也是层级值 —— 本地用 `Heading 1–4` + 无 `subtitle/strong/page` 档，属于模型级差异（见 gap.md G51）。

## 二、任务与日历操作（`✓`）

| 契约 | 事实 |
|---|---|
| `listType: enum(["inbox","today","upcoming","all"])` | 任务视图四档 = **inbox / today / upcoming / all**，与屏上实测的「未归档 / 今天 / 即将进行 / 所有任务」一一对应 → R4 的"Schedule 到底是什么"由此定性：它就是这套**分档视图**，不是独立时间字段 |
| `showCompletedTasks?`（默认关） | "By default **only pending tasks** are shown in the calendar. If true, **completed and cancelled** tasks will also be included." → 日历默认过滤未完成；**任务状态含 `cancelled`（已取消）**，与 `completed` 并列 |
| `contentRegex?` | "only tasks whose content matches the given regular expression" → 任务可按**正则**过滤内容 |
| `startDate` / `endDate`（ISO `yyyy-MM-dd`） | 不给时："the calendar won't show sections for past months, the first section after the **'Ongoing'** items will be the today section"；结束默认 "up to 1 extra month after the current month" ； → 日历时间轴结构 = **Ongoing 段 + 逐日段**；回溯/前瞻有默认窗口 |

日历分节类型枚举（`✓`，zod `Dh`）：`["ongoing","day","remainingDaysInMonth","month","later"]`
→ ★ **本行旧描述作废**（原文写"循环节类枚举 / 官方的重复档位是这 5 个语义值"）：这 5 个值是 **`space_list-calendar` 返回结构里的 `sectionType`（日历分区类型）**，与任务的**重复配置无关**。真正的重复词表是 `{type: fixed|flexible, frequency: daily|weekly|monthly|yearly, interval, startDate, daily, weekly, monthly, yearly, reminder}` —— 见 `tasks.md` §九 / §十，块级 schema 见 `model.md` §一之八。
⇒ 分区的具体生成窗口（前 5 月 + 本月剩余 + Ongoing(2024-01-01 起) + 7 个逐日段 + 下月剩余 + 后 6 月 + Later）见 **`registries.md` §五之二**。
⇒ **一处未调和的矛盾**（保留观测，不当已结案）：本行上方 `startDate` 的 `.describe()` 说"不给 startDate 就不显示过去的月份分区"，而 `generateDateSections()` **无条件产出 5 个往回月** ⇒ 说明**工具层在生成分区后还有一道按 `startDate`/`endDate` 的过滤**，该过滤器代码未定位。

## 三、搜索与浏览操作（`✓`）

- 排序枚举：`["relevance","dateCreated","dateModified"]`（搜索）、`["dateCreated","dateModified"]`（列表）。
- 过滤器：`starred: true/false`（"only starred (true) or non-starred (false)… Default undefined, so no filtering"）、`dailyNote: true/false` 同样三态。
- 文件夹名过滤：**大小写不敏感正则**（"Filter folders by name pattern (case-insensitive regex). Example: 'Performance'…"）。
- 返回附带：文档创建/修改日期、**块数量**、starred 与 dailyNote 标记（默认 true）；`includeBlockMatches`（默认 true）→ 搜索结果带**块级命中**；带 `total`（匹配总数）。
- 上下文收窄："If the current context is tied to a folder (when the user opened the assistant from a folder), the folder Id can be provided here to limit the results" → **AI 有"当前文件夹上下文"概念**。

## 四、AI 代理工具面（`✓` 标识符 / `~` 语义）

bundle 里出现的工具与上下文标识符：`blocks_get`、`web_search`、`web_crawl`、`web_ask`、`insert_text`、`view_credits`、`user_selected_blocks`、`current_page`、`context_badge`、`collection_mode`、`user_specified_document_*`、`selection_file_*`、`connect_error`、`craft_ai_chat_recent_searches`。

读出的操作语义：
1. AI 能**读块**（`blocks_get`）、**插入文本**（`insert_text`）、**查看额度**（`view_credits`）。
2. AI 有**联网三工具**：搜索 / 抓取 / 问答（`web_search` / `web_crawl` / `web_ask`）—— 本地完全没有联网能力。
3. AI 的上下文来源是**用户选中的块**与**当前页**（`user_selected_blocks` / `current_page`），界面上以 `context_badge`（屏上 DOM 有 `data-hover-badges`）呈现 → 「上下文徽标」是一个独立 UI 组件与交互（本地无）。
4. 连接失败有专门的态标识 `connect_error`（配合 `/api/ws-ai-agent/v1/socket`）。
5. 变更类工具带 **"Optional message to display to the user describing the action"** → 官方契约要求**每次代理写操作都附一句给用户看的动作说明**（可审计性设计，本地 AI 无此约定）。

## 五、给复刻的三条硬结论

1. **块 = 树节点，页面 = 有子块的块**，深度上限 10，子树序列化统一走 markdown 字符串。本地 `Document.content` 也是树，但"页面"是独立实体 + `children` 计数/`isPage` 语义没有暴露 → 与官方对不齐（影响：目录、TOC、子页列表、块计数显示）。
2. **排版层级是六档语义名而非 1–4 级**，且 `subtitle/strong/page/body` 都参与样式与目录生成 → 本地 Heading 1–4 需要重映射（G51）。
3. **任务状态有 `cancelled`**，日历默认只显示 pending，且支持正则过滤与 Ongoing 分段 → 本地 `status(todo|doing|done)` 缺一档，日历默认口径也不同（G52）。

## 仍未由契约证明的部分

契约只覆盖"能被外部调用的读/写操作"，**不能证明界面手势**（拖拽落点判定、撤销粒度、输入规则、手势弹层）。dnd-kit 侧证只到组件层：实测代码里有 `DropIndicator`（29 处）、`closestCenter` / `closestCorner` 碰撞算法、`activationConstraint`（`distance:` 57 处）、`DragOverlay`、桌面 HTML5 backend 与移动 Touch backend 两个 Provider —— **指示线确实存在且是独立组件**，但其出现时机与落点映射仍需动态验证（第 1 批沙盒动作）。

## 六、AI 检索的实现级细节（`AIChatPopup` chunk，源码直译）

```
searchDocuments(space, docs, {regexes, limit, sortBy, sortDescending, includeBlockMatches, ...})
  scope = 0 < docs.length < 1000 ? {type:"document", documentIds} : {type:"all", includeTemplates:false, includeRecentlyDeleted:false}
  conditions = regexes.map(expr => ({type:"regex", expr}))
  results = ql.search(space, scope, conditions)   // 每项含 {documentId, score, matchCount}
  sortBy ?? "relevance"      // 注意：MCP 工具层默认 dateCreated，检索层默认 relevance
  sortDescending ?? true
  limit ?? 50                // 与 §二 MCP describe 的"默认 100"不同层，两处默认值不一致
  includeBlockMatches → addBlockMatches(docs, regexes)   // 块级命中是可选二次查询
  addCollectionPrefix(docs, space)                        // 结果带集合前缀
  返回 {totalCount, documents, spaceName, folderName, searchQuery: regexes.join(" | ")}
```

实现事实（对复刻有直接约束）：
- **搜索以正则表达式为一等条件**（`{type:"regex", expr}`），多个正则在返回里用 `" | "` 拼成查询串回显 ⇒ 官方搜索框实际是**正则/或条件**模型，不是简单子串。
- 命中同时返回 **`score`（相关度）与 `matchCount`（命中次数）**两个量 ⇒ 排序可切 `relevance`（`sortBy` 三值 `relevance|dateCreated|dateModified`，见 `registries.md` §一）。
- **文档数 < 1000 才走按 id 白名单**，否则整体扫描并显式排除模板与最近删除 ⇒ 有规模阈值分支。
- 子文件夹递归：`getAllSubfolderIds` 深度展开 `folder.subfolders`。
- 检索失败 `catch` 后**吞异常返回空**（只打日志）⇒ 官方搜索是"永不报错、退化为空结果"的策略。
- 返回体带 `spaceName`/`folderName`，说明结果行的面包屑是**服务端/worker 侧算好**的，不是前端再查。

本节仍未证明的部分：`ql.search` 的实际索引后端（本地 worker 还是远端服务）、`score` 的计算方式、`regexes` 是否用户可直接输入正则还是由关键词编译而来。
