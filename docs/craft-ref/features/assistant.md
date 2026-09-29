# AI 助手 / 接入中心 / 内部深链（`assistant.*` + `imagine.*` + `craft://`）

证据来源：`_harvest/js/AIChatPopup-ClUQFRna.js`（动作注册表 + 上下文分组表 + 深链解析）、`useCustomPrompts-D9zcYS-6.js`（4.3 KB 整模块）、`ImagineView-C1NQrx2U.js`、`index-DiTmKH3z.js`（`settings_state` 存取 + i18n 主表）。
机读产物：`_harvest/ai-quick-actions-zh.tsv`（62 行）、`_harvest/ai-context-groups.raw.txt`、`_harvest/{assistant,imagine,ideastarter}-zh.txt`。

**计数订正**：`assistant.*` 实为 **283 条**（`gap.md` G39 原写"223 条"作废）；`imagine.*` **101 条**（此前完全未成轴，且它不是"AI 生图"，是**第三方接入中心**）；`ideastarter.*` **44 条**（已在 `longtail.md` §1 成轴，本文不重复）。
置信标注：`✓` = 代码级证明；`~` = 仅由文案/键名推得。

## 一、动作注册表：62 条封闭清单 ✓

`AIChatPopup` 里 `z = { <actionKey>: { title, prompt, icon, actionType? } }` 共 **62 项**。关键结构事实：

**同一个"能力"在每个作用域下是一条独立注册项，而不是"一条模板 + 变量插值"。** `summarize` 拆成 `summarizeBlocks / summarizeDocs / summarizeDoc / summarizePage` 四条，各自有**不同的中文文案**（「请总结这些区块」/「请总结这份文档」/「请总结本页内容」）。「这些区块 / 这些文档 / 这份文档 / 本页」四格是官方词表，复刻时不能合并成一句泛化文案。

按能力聚合的**不重不漏分区**（62 键各出现一次；具体作用域见 §二的分组表）：

| 能力 | 注册项 | 数 |
|---|---|---|
| 总结 | `summarizeBlocks` `summarizePage` `summarizeDoc` `summarizeDocs` `comprehensiveSummary` `summarizeLastWeek` | 6 |
| 提升清晰度 | `improveClarity{Blocks,Page,Doc,Docs}` | 4 |
| 拼写语法 | `spelling{Blocks,Page,Doc,Docs}` | 4 |
| 翻译 | `translate{Blocks,Page,Doc,Docs}` | 4 |
| 提取行动项 | `actionItems{Page,Doc,Docs}` + `extractActionItemsPdf` | 4 |
| 分析写作风格 | `analyzeWriting{Doc,Page}` | 2 |
| 补充薄弱部分 | `expandWeakAreas{Doc,Page}` | 2 |
| 集思广益 | `brainstorm{Doc,Page}` | 2 |
| 建议相关主题 | `suggestRelatedTopics` / `…Short` / `…Doc` | 3 |
| 查找相关文档 | `findRelatedDocs`（跨 4 组复用） | 1 |
| 联网研究 | `research`（跨 **8** 组复用，覆盖面最广的动作） | 1 |
| 获取概览 | `getOverview`（跨 6 组复用） | 1 |
| 比较文档 | `compareDocs` | 1 |
| 任务清单 | `prioritizeTasks` `todaysTasks` `ongoingTasks` `completedTasks` `upcomingTasks` | 5 |
| 反思与规律 | `reflectOnProgress` `identifyPatterns` `findPatterns` | 3 |
| 检索与整理 | `findDocs` `semanticSearch` `organizeByTopic` | 3 |
| 代码 | `explainCode` `findBugs` `suggestOptimizations` `suggestRefactoring` | 4 |
| 图像 | `describeImage` `createCaption` `extractText` `generateAltText` | 4 |
| PDF | `summarizePdf` `extractKeyInfo` `searchInPdf` `askAboutPdf` | 4 |
| 合集/条目 | `summarizeEntries` `generateInsights` `helpFilter` `findEntry` | 4 |
| | **合计** | **62** |

## 二、13 个上下文作用域 → 各自的动作集 ✓（权威分派规则）

`[{id, prompts:[…]}]` 共 13 组，逐组实测：

| 组 id | 条数 | 动作（按注册顺序 = 界面顺序） |
|---|---|---|
| `no-context` | 3 | research, getOverview, findDocs |
| `page-context` | 12 | summarizePage, improveClarityPage, spellingPage, translatePage, analyzeWritingPage, actionItemsPage, expandWeakAreasPage, suggestRelatedTopics, brainstormPage, findRelatedDocs, getOverview, research |
| `document-context` | 12 | 同 page-context，但 `…Doc` 版 + `suggestRelatedTopicsDoc` |
| `selection-context` | 6 | summarizeBlocks, improveClarityBlocks, spellingBlocks, translateBlocks, findRelatedDocs, research |
| `multiple-documents-context` | 9 | summarizeDocs, compareDocs, improveClarityDocs, spellingDocs, translateDocs, actionItemsDocs, suggestRelatedTopicsShort, getOverview, findRelatedDocs |
| `folder-context` | 5 | getOverview, semanticSearch, comprehensiveSummary, organizeByTopic, research |
| `all-docs` | 5 | research, semanticSearch, getOverview, comprehensiveSummary, organizeByTopic |
| `collection-context` | 5 | summarizeEntries, findPatterns, generateInsights, helpFilter, findEntry |
| `pdf-context` | 5 | summarizePdf, extractKeyInfo, searchInPdf, askAboutPdf, extractActionItemsPdf |
| `image-context` | 4 | describeImage, createCaption, extractText, generateAltText |
| `code-context` | 4 | explainCode, findBugs, suggestOptimizations, suggestRefactoring |
| `tasks` | 5 | prioritizeTasks, todaysTasks, ongoingTasks, completedTasks, research |
| `calendar` | 6 | summarizeLastWeek, reflectOnProgress, upcomingTasks, todaysTasks, identifyPatterns, research |

⇒ **完整性双向闭合** ✓：13 组共 **81 个槽位**、去重后 **62 个动作**，与注册表 62 项**两侧零孤儿**（无"注册但未出现在任何组"，也无"被引用但未注册"）⇒ 这两张表就是 AI 动作面的全集，不存在第三条入口。
⇒ 复用度：`research` 8 组、`getOverview` 6、`findRelatedDocs` 4，其余 55 项 ≤2（`todaysTasks`/`semanticSearch`/`comprehensiveSummary`/`organizeByTopic` 各 2）⇒ 55 项是**作用域专属**动作。
⇒ `page-context` 与 `document-context` **各 12 条但内容不同**（唯一差异：page 用 `suggestRelatedTopics`，document 用 `suggestRelatedTopicsDoc`）——即"页面"与"文档"在两处文案上有区分，其余同构。
⇒ `tasks` 与 `calendar` 两组共用 `todaysTasks`，但 `completedTasks` 只在 tasks、`upcomingTasks/identifyPatterns/summarizeLastWeek` 只在 calendar。

## 三、执行态路由：动作按 `openAgentType` 分流（权威全集是 **5 档**，见 `internals.md` §三）

62 项里 48 项无 `actionType`（普通对话），14 项带 `actionType:{openAgentType:"…"}`：

| openAgentType | 数量 | 动作 |
|---|---|---|
| `documentReview` | 10 | `improveClarity{Blocks,Docs,Doc,Page}`、`spelling{Blocks,Docs,Doc,Page}`、`analyzeWriting{Doc,Page}` |
| `search` | 3 | `findRelatedDocs`、`findDocs`、`semanticSearch` |
| `websearch` | 1 | `research` |

⇒ 官方把改写建议类、检索类、联网类建成**不同代理态**，不是同一个聊天通道。
⇒ **本批由 `AIChatPopup` 的图标映射表修正为 5 档**：`Gi = {assistant, search, documentReview, help, websearch}` ⇒ 多出默认的 `assistant`（常量 `_t`）与 **`help`（帮助/答疑是独立代理态，对应 `help.and.support.desc` / `help.center.topics`）**。动作表里只能看到被显式指定的 3 档，因为未标 `actionType` 的 48 项都走默认 `assistant`。线程模型与"近期同类型线程复用"规则见 `internals.md` §三。

## 四、上下文对象（ContextItem）契约 ✓

从 chip 构造代码解出：

```js
{ …textContent,
  hasChildren: subblocks?.length > 0 ? "true" : "false",   // 字符串，不是布尔
  type: isDocument ? "document" : "page",
  subtitle: t(isDocument ? "assistant.current.document" : "current.page"),
  documentId }
```

选区类 chip：`{ title: "assistant.current.selection"（当前选择）, subtitle: "assistant.x.blocks"（[0] 个区块） }`。
**去重规则**：`if (existing.has(ctx.id)) return` —— 同一上下文不能重复挂第二份。

chip 词表全量：`当前文档` / `当前页面`（跨命名空间键 `current.page`）/ `当前选择` / `已选区块` / `[0] 个区块` / `这次对话` / `添加更多上下文`。

## 五、对话生命周期与状态机

| 层 | 事实 | 证据 | 置信 |
|---|---|---|---|
| 三类"新建" | `new.chat`「新聊天」≠ `new.thread`「新对话」≠ `new.search`「新搜索」—— 会话与搜索是两类对象 | 三键并存 | ✓ |
| 思考态 | `thnking.3dot`「正在思考…」（**官方键名拼错 thnking**）；`thought.for.x.s` = `Math.ceil((endTime - startTime) / 1000)`，**向上取整秒**，且 `endTime ?? Date.now()` 兜底 | `AIChatPopup` | ✓ |
| 取消 | `operation.cancelled`「AI 操作已取消」 | i18n | ~ |
| 错误 | `prompt.error`「发生错误」+ `prompt.error.try.again`「请稍后重试」；**两类输入超限各有专句**：`error.conversation.too.long`「对话太长了，请开始新对话。」/ `error.document.too.big`「文档太大，无法处理，请缩小处理范围或复制粘贴重要部分。」 | i18n | ✓ |
| 历史 | `conv.history` / `no.conv.history`「无对话历史」/ `clear.history.3dot`「清除历史记录……」（带省略号＝有二次确认）/ `delete.conversation` + `.desc`「此操作无法撤销」 | i18n | ✓ |
| 消息计数 | `1.message`「1 条消息」独立成键 + `x.messages`「[0] 条消息」——**CLDR 复数**，one 与 other 分开 | i18n | ✓ |
| 结果落文档 | `insert.document`「插入」/ `replace.document`「替换」/ `save.image` / `save.x`「保存 [0]」 | i18n | ~ |
| 入口 | 卡片菜单 `assistant-open`＝`open.assistant`「打开助手」；面板 `message.craft.assistant`「给 Craft 助手发消息」；输入框占位 `prompt`「问我任何问题，或在下面选择一个选项」；关闭态 `assistant.disabled` + `enable.assistant.in.settings` ⇒ **助手是可在设置整体关闭的** | `index` + i18n | ✓ |
| 变更标题 | `change.title`「更改标题」——对话可重命名 | i18n | ~ |

## 六、额度：两套并行计量，各自硬停 ✓

**轴一：请求数（30 天滚动窗口）**
`usage`「[0] 用量」/ `usage.and.limits`「使用和限制」/ `usage.max`「最大请求数（**30 天**）」/ `usage.used`「使用的请求数」/ `usage.remaining`「剩余请求数」/ `usage.date`「限制重置日期」；告警 `one.request.remaining`「个请求剩余」（与 `x.requests.remaining`「剩余 [0] 个请求」分写，又一处 CLDR one）；触顶句 `you.reached.usage.limit`「已达到 Craft 助手使用限制。可随时查看和更新 [使用配额](craft://credit)。」

**轴二：积分（credits）**
`aiCredits` / `availableAiCredits`「可用 AI 积分」/ `availableAiCreditsForTeam`「可用 AI 积分（[0]）」← 团队名插值 ⇒ 同一控件两种数据源；`buyMoreCredits`「购买更多积分」/ `upgradeToGetMoreCredits` / `upgrade.for.more.ai.usage` / `view.credits`；触顶句 `you.used.all.your.available.credits`「你的可用积分已全部用完。你可以随时查看你的[余额](craft://credit)。」
⇒ **两句触顶文案不同、指向同一深链 `craft://credit`** ⇒ 两轴独立判定，UI 只有一个出口。

**充值页 URL** ✓：`addToPath("assistant-topup")` + searchParams `teamId` / `locale` / `platform` ⇒ 充值是**跳外部网页**，不是应用内弹窗。

## 七、模型两档 + 额度驱动自动切换 ✓

只有两档：**GPT-3.5**「非常适合日常任务」/ **GPT-4o**「最新、最先进的模型」（`assistant.gpt35.desc` / `assistant.gpt4o.desc`），营销句 `model.switch.gpt4o`「切换到 GPT-4o 以释放 Craft AI 的全部潜力」+ `switch.to.gpt4o.short`。
自动切换规则：`model.switched`「已切换助手模型」+ `model.switched.to.x`「**已将助手模型切换为 [0]，因为它有可用额度。**」⇒ 系统会因额度可用性**自行换模型**，并必须给用户一条**说明原因**的回执，而不是静默降级。
（注意：bundle 里出现的 `gpt-4.1` / `gpt-5` 等全部来自 `vendor-BZCR0rqu.js` 的 OpenAI SDK 模型名表，**不是** Craft 的档位，不要误采。）

## 八、内置提示库：35 条"标题 + 模板"，模板体是 `指令: --- {0} ---` ✓

每条一个动作两个键：`assistant.prompt.<name>`（人看的标题）+ `assistant.prompt.<name>.template`（发给模型的模板）。35 个 `<name>`：

- 语气 3：`change.tone.{confident,friendly,professional}`
- 长度 2：`make.{longer,shorter}`
- 生成文体 8：`write.{article,blog,essay,example,facebook.post,poem,template,twitter.post}` ＋ 自身 `write`
- 翻译 **9 语种**：`translate.{dutch,english,french,german,italian,japanese,korean,portuguese,spanish}`
- 结构/元信息 12：`brainstorm.ideas` `continue.writing` `explain` `fix.spelling.and.grammar` `generate.hashtags` `generate.keywords` `improve.writing` `outline` `pros.and.cons` `simplify.language` `suggest.title` `summarize`

**两种占位符不能混**：`{0}` = 模板内的**内容插槽**（`集思广益关于这个话题的想法： --- {0} ---`），`[0]` = i18n **人可见插值**。
**键名陷阱** ✓：`assistant.prompt.write.template` 是标题（「创建有关此主题的模板」），它的模板体是 `assistant.prompt.write.template.template` —— 后缀 `.template` 与动作名 `write.template` 同形。
三处中文模板尾部带**尾随空格**（如 `改为友好的语气: --- {0} --- `），逐字复刻时需保留。

## 九、自定义提示系统（整模块 4.3 KB，契约完整）✓

| 层 | 事实 |
|---|---|
| 硬上限 | **条数 20**（`ge=20`）、**单条 1000 字符**（`G=1e3`） |
| 超限行为不对称 | 条数 ≥20 → `flashMessage({type:"error", title: c("assistant.prompt.limit",{0:20})}, 4e3)`（**4 秒 toast**）并中止；长度超限 → `m.substring(0, 1000)` **静默截断后再保存**，不报错 |
| 数据形状 | `{ text, title: title ?? "", id }`，id 来自 `vendor-core-utils` 的 uuid；另有 `type` 字段，已知取值 `CARD:"card"` |
| 存储 | 键值 `settings_state` = `{ prompts: string[], promptObjects: {…}[] }`，**双写**：`setPromptObjects` 同时写 `o.map(s=>s.text)` 进 `prompts` 以兼容旧读取方 |
| 读时迁移 | `promptObjects` 空但 `prompts` 非空 → `prompts.map(e=>({text:e}))` |
| 校验谓词 | 必须是非 null 对象；必须至少含 `prompts` 或 `promptObjects` 之一；每项须 `{text: string, title?: string}` |
| 归属 | 按 **userId** 存取（`Xzn=({userId…`）⇒ 是"用户偏好"而非文档内容，**不走文档同步** |
| 编辑器 | 组件 `PromptEditDialog`：标题字段 + 正文字段；`isEdit` 时标题＝`t("edit")`，否则「创建自定义提示」；挂载后 `setTimeout(fn, 0)` 抢焦点 |
| 周边文案 | `prompt.save` / `prompt.saved` / `your.prompts` / `create.custom.prompt` / `prompt.length.limit` |

## 十、`imagine.*` = 第三方接入中心（MCP / API），不是生图 ✓

**两个平行实体族**，各自独立 CRUD 与列表：API 连接（`my.api`/`your.apis`/`new.api`）与 MCP 服务器（`my.mcp`/`your.mcp.servers`/`new.mcp.server`）。

| 维度 | 取值 | 证据 |
|---|---|---|
| 权限级别（3） | `read-only`「只能查看文档内容」/ `write-only` / `read-write`「可以查看和修改文档内容」 | 落库 `details.tools = {type:"preset", presets:["read" \| "write" \| "read","write"]}` ✓ |
| 访问模式 | `public`「任何拥有该网址的人都可以访问」/ 受保护；受保护有 **两种**：`protectionType:"key"`（API 密钥）与密码（`set.password…` / `enter.new.password…` / `remove.password`） | ✓ |
| 作用域（3） | 该空间所有文档 / 选定文档 / 每日笔记和任务（`api.for.{all.doc,selected.docs}`、`mcp.for.daily.notes.and.tasks`、`all.daily.notes.and.tasks`） | ✓ |
| 密钥生命周期 | 创建后**只显示一次**：「请务必立即复制你的 API 密钥。你将无法再次查看它！」；默认名 `API 密钥 [0]`；密钥有独立的创建/复制/删除，与连接本身分离 | ✓ |
| 硬上限 | **最多 10 个 API**：「目前仅支持 10 个 API。如需更多，请联系 support@craft.do」 | ✓ |
| 删除确认 | API：「所有 API 密钥都将被撤销，且此操作无法撤销」；MCP：「所有连接都将被终止」 | ✓ |
| 反馈文案 | 成功 8 条 / 失败 8 条，按 (API / MCP / API 密钥) × (创建 / 更新 / 删除) 矩阵各有一句，**不是通用 toast** | ✓ |
| 其它 | `download.ai.bundle`「下载 AI 软件包」、`api.reference` / `mcp.reference` 两个外链、`browse.examples`「看看其他人都构建了些什么」、空态 `press.plus.to.create.a.key` | ✓ |
| 开关 | 每文档两级：`enable.api`（"用作应用或网站的后端/CMS"）与 `enable.mcp`（"连到 AI 工具处理"）——同一文档可分别开 | ✓ |

## 十一、内部深链 scheme `craft://` ✓（全新轴）

`AIChatPopup` 内 29 处引用，解析器是前缀匹配链（`startsWith("craft://folder/")` / `startsWith("craft://tasks")` / 精确 `===`）。全集：

| 深链 | 语义 |
|---|---|
| `craft://doc/{id}` | 常量 `Ti`；id 经 `stableIdToUuid.get(id)` 映射，再带 `spaceId`/`documentId`/`webappDocSt…` 跳转 |
| `craft://folder/{folderId}` | 文件夹 |
| `craft://folder/unsorted` `…/starred` `…/all-docs` | **三个保留字 sentinel**，与真实 folderId 同处一个命名空间 |
| `craft://tasks` | 任务总入口 |
| `craft://tasks/{inbox,today,upcoming,all}` | **四档任务列表**的深链，与 `protocol.md` zod `listType` 四值互相印证 |
| `craft://tags` `craft://calendar` `craft://credit` | 标签屏 / 日历屏 / 额度屏 |

⇒ `craft://credit` 是两句额度触顶文案里内嵌 markdown 链接的目标；`tasks.md` 的提醒 `deepLinkUrl` 用的就是这套 scheme。**本地无任何内部 URL scheme**，因此 AI 文案、提醒跳转、跨端分享都缺一层可寻址性。

## 十一之二、`ideastarter.*` = 空白页 AI 启动器 ✓（全新轴，44 键此前完全未成文）

**入口与文案**：弹层标题 `popup.title`「你想从什么开始？」+ 副标题「我们知道空白页面让人无从下手。描述你的需求，我们来帮你搭建结构。」+ 输入占位「描述你想创建的内容…」，按钮只有 `popup.create`「创建」与 `popup.close`「关闭」。⇒ 这是一个**自由文本 → AI 生成整篇文档骨架**的一次性弹层，不是模板选择器（模板另有 `TemplatePicker`）。

**六个可见建议 + 一个隐形 default（★ 七族加载文案里 default 没有建议芯片）**：

| 类型 | 建议芯片文案 | 四阶段进度文案（0→3） |
|---|---|---|
| `guide` | 博客文章 | 正在规划内容… / 正在添加关键部分… / 正在构建叙事结构… / 正在创建框架… |
| `list` | 任务清单 | 正在整理任务… / 正在创建待办事项… / 正在添加优先级部分… / 正在创建清单… |
| `meeting` | 会议记录 | 正在创建议程… / 正在添加讨论部分… / 正在整理行动事项… / 正在准备模板… |
| `project` | 项目文档 | 正在创建行动计划… / 正在规划关键里程碑… / 正在添加引导部分… / 正在制定路线图… |
| `travel` | 旅行计划 | 正在规划行程… / 正在添加目的地部分… / 正在创建行李清单… / 正在规划旅程… |
| `weekly` | 头脑风暴 | 正在捕捉灵感… / 正在创建思考空间… / 正在整理头脑风暴… / 正在创建灵感画布… |
| `default` | （无芯片） | 正在创建文档… / 正在创建结构… / 正在添加引导部分… / 正在准备模板… |

三条可直接落到实现的结论：

1. **进度是"四段轮播"而不是百分比**：标题另有两态 —— `loading.title.default`「正在创建文档」与 `loading.title.type`「正在创建[0]」（`[0]` = 类型名）⇒ **识别出类型时标题会换成类型名**，识别不出保持默认。
2. **分类是服务端/AI 判定的结果**，用户只输入自由文本；六枚芯片是**快捷输入**而非单选（点芯片等价于填了该类型）。
3. **有独立失败态**：`toast.error.title`「无法创建文档」+ `toast.error.subtitle`「请重试」，成功是 `toast.success`「文档已创建！」⇒ 创建是异步且可失败的操作，**失败文案不走通用 toast**（与 `dialogs.md` §8.5 的 11 条进行中文案相补，这里再多 7×4 条阶段文案）。

**旁证与坑**：`js/index` 里 `ideastarter.*` 只有 5 处命中且**全部落在内联英文语言包对象内**，没有独立 chunk ⇒ 组件在主包或共享 AI chunk 里；且该内联英文串有**解码损坏**（省略号变 `鈥`、`we'll` 变 `we鈥檒l`）⇒ 再次验证"**关键文案一律以本地化 JSON 为准，bundle 英文只用于补键名**"。

## 仍未采到（接入与启动器轴）

- `ideastarter` 的**真实入口位置**（新文档按钮旁？空文档正文里？⌘K？）与是否需要 AI 额度（`assistant` 侧有 credit 门禁，本轴 44 键里没有任何额度或付费文案 ⇒ 疑为免费，未证）。
- 生成结果的**块结构**（是否真的产出 heading/todo 块，还是纯文本段落）。
- 类型判定失败的可见证据（文案上只能推断"退回 default 族"）。

## 十二、仍未由静态证明的部分

1. `documentReview` / `search` / `websearch` 三态的**结果呈现形态**（批注？结果列表？引用来源卡片？）——需动态。
2. 每组动作在面板里的**是否可滚动/可搜索/是否随订阅档位裁剪**——静态只看到顺序。
3. 额度的**具体数值**（每档多少请求、多少积分）不在 bundle 内，服务端下发。
4. `hasChildren: "true"/"false"` 送给模型后是否有实际作用（提示词构造在服务端）。
5. `imagine` 的作用域 3 档 × 权限 3 档 × 保护 2 档能否自由组合成 18 种，未见约束代码。
6. `type` 字段除 `CARD:"card"` 外是否还有其它提示类型。
