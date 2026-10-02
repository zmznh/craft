# 实现级补充（本批由 bundle 直解，把"必须动态"的几项当场结案）

方法沿用 `keyboard.md` 那批的教训：**先问能否在本地 bundle 上算**。本批扫了 `index-DiTmKH3z.js` / `AIChatPopup` / `FloatingThreadWindow` / `ShareSheet`，结案 4 项、收窄 2 项、新发现 2 轴。

## 一、块转换不是"改块类型"，是 `setTextStyle` ✓（结案动态队列第一项）

从右键菜单 `turnIntoRegularPage` 的实现直接读到落库动作：

```js
// 「转为普通页面」
ni({name:"BlockContextMenuOptionClicked", props:{item:"turnIntoRegularPage"}});
const u = { type: "setTextStyle", blockIds: [t.blockId], textStyle: at.PageRegular };
s(u);
```

⇒ **转换动作是 `{type:"setTextStyle", blockIds[], textStyle}`**：块本体不变，只换文本样式枚举值（`at.*` = `TextStyle` 9 项，见 `registries.md` §二）。
⇒ 于是"**块转换丢什么属性**"对 page/card/标题这一族有了答案：**不丢**，因为根本没换块对象，只是样式档位变化；会丢属性的只可能是跨**块类型**的转换（如文本 ↔ 列表 ↔ 代码 ↔ 图片），而这类在本套菜单里也是走样式/属性动作而非重建块。
⇒ 另一条同类证据：转集合的菜单项 id 是 `turn-to-object-list`（`Le={id:"turnInto", actions:[{id:"turn-to-object-list", text:S("collections.turn.into.collection")}]}`）⇒ **"转为集合"＝把块变成 `objectList` 样式**，与 `BlockType` 里的 `objectList` 对上 ✓。
⇒ 复刻含义：本地若用"读旧节点 → 建新节点 type → 迁移 attrs"的转换实现，就会真的丢属性；官方的做法是让**样式成为块上的可切换维度**。

## 二、内联元素的类型判别值与内联菜单全表 ✓（结案"行内公式落到哪个块类型"）

`gbe(t, e)` 是内联子类型的显示名映射，直接给出**判别字面量**：

| 判别值 | 显示名键 | 结论 |
|---|---|---|
| `"tex"` | `style.inline.equation`「输入方程」⇒ **行内公式的 subtype 是 `tex`**，快捷键命令 id 为 **`ot.INLINE_TEX`** | 结案 |
| `"day"` | `style.inline.type.date`「输入日期」⇒ 日期内联元素 subtype 是 `day` | 结案 |
| `"craftdocs://users"` | `style.inline.type.user.link`「输入用户链接」⇒ **用户链接是一个 URL scheme 形态的 subtype**（与 `craft://` 并存的**第二个 scheme**） | 新发现 |

内联格式菜单是**"名称 + 命令 id 数组"**的封闭表（7 项）：

```
bold → [ot.BOLD]            italic → [ot.ITALIC]        code → [ot.CODE, ot.CODE2]   ← 一个命令两个键位
link → [ot.URL]             equation → [ot.INLINE_TEX]  blocklink → [ot.BLOCKLINK]   highlight → [ot.HIGHLIGHT]
```

⇒ `code` 绑两个命令 id ⇒ **一命令多键位 / 一键位多命令**都合法，进一步印证 `keyboard.md` 的"命令与键位分家"；也说明 `shortcuts` 字段是**数组**，本地实现按单键位写就会丢一档。

## 三、AI 的 agentType 是**五档**不是四档，且线程是带类型的持久对象 ✓（结案"三种代理态的结果呈现"并扩面）

```js
Gi = { assistant: li, search: tn, documentReview: f2, help: xi, websearch: Yi }   // 每种一个图标
Ki = (n) => Gi[n]                                                                // 取图标
```

⇒ 此前从快捷动作表只看到 `documentReview` / `search` / `websearch` 三档（`assistant.md` §三），现在拿到**权威全集 5 档**：多出 **`assistant`（默认，常量 `_t`）** 与 **`help`**（对应 i18n 里的 `help.and.support.desc`「关于 Craft 的一切，随时问我」、`help.center.topics`「帮助中心主题」、`ai.assistant.help.me.with` ⇒ **帮助/答疑是独立代理态**）。
⇒ **每条动作按 `actionType.openAgentType` 路由到对应线程类型**，线程列表项按类型取图标：`const p = a.agentType ?? _t; const b = Ki(p)`。

线程数据模型（本批新解，`assistant.md` 原本只有生命周期文案没有结构）：

```js
thread = { threadId, messages, agentType, lastUpdatedTime: Date.now(),
           uuidToStableId: _.getMap().uuidToStableId }
storeKey = `ai-chat-threads-by-space:${spaceId ?? null}`        // 按空间分桶持久化
复用逻辑 = [...threads].sort(按 lastUpdatedTime 降序)
                 .find(t => (t.agentType ?? _t) === 目标类型
                          && (期望threadId == null || t.threadId !== 期望threadId)
                          && t.lastUpdatedTime >= Date.now() - v1)
```

⇒ 四条可实现规则：① **线程按空间隔离**（切空间换一篮子会话）；② 线程**自带 agentType**（不是全局模式开关）；③ 列表行标题用 `threadId`、缺省回落「新聊天」，副标题是 `${消息数}` 且走 CLDR `1.message` / `x.messages`；④ **"复用近期同类型线程"**：按 `lastUpdatedTime` 降序取第一个在时间窗 `v1` 内、类型相同、且不是当前 threadId 的线程 ⇒ 同类型会话会自动续上而不是每次都新建（这条此前完全没记）。

## 四、触墙走集中式"受限功能弹窗" ✓（收窄"触墙呈现形态"）

`ShareSheet` 的组件签名里成对出现 `onShowRestrictedFeatureModal` / `onCloseRestrictedFeatureModal`，并把 `actionType` 一起下传 ⇒ **付费/权限拦截是一个可唤出的模态组件，由父层注入回调**，而不是各处内联 toast 或禁用。⇒ 动态只需验一次该弹窗的样式与按钮，其余功能点复用同一形态（成本从"逐功能验"降到"验一个组件"）。

## 五、撤销粒度：静态侧无果，但排除了一个假设 ?

全库扫 `captureTimeout|mergeTimeout|maxHistory|historyLimit|stackSize|Y.UndoManager` ⇒ **零命中**；`undo`/`redo` 只以命令 id（`ot.UNDO` / `ot.REDO`）与字符串标签形式出现。
⇒ 结论是**"未发现自定义撤销参数"** ⇒ 撤销栈的分组与深度走库默认，**不能**据此断言"官方按字符成步"或"按 500ms 合并"；粒度仍需动态用 `Ctrl+Z` 循环次数实测。这是本批唯一的负结果，如实记录以免下个会话重复搜索。

## 六、命令 id 权威表：64 项，值本身就是键定义 ✓（本批新解，原始串存 `_harvest/cmd-enum-raw.txt`）

命令枚举成员的字面量不是字符串，而是**键构造器调用**：

```js
FIND_IN_PAGE:  Co(Oo("f")),              // ⌘/Ctrl + 字符 f
INLINE_TEX:    ci(Oo("e")),              // ⌘⇧/Ctrl⇧ + 字符 e
TOGGLE_KEY_SHORTCUTS: zr(Vr("Comma"))    // ⌘⌥ / Ctrl⇧ + Comma
TOGGLE_ASSISTANT: Co(oo)
```

⇒ **修正 §三 与 `keyboard.md` 的表述**：不是"命令表与键表两张"，而是**一张以命令 id 为键、值内含默认键定义**的表；上下文通过引用 `ot.XXX` 复用同一命令。这样同一命令的跨平台差异可以在值里做（构造器本身带 mac/win 两分支）。
⇒ `zr(Vr("Comma"))` 是 **`Ctrl-Shift+,` 打开快捷键面板的第三次独立印证** ✓✓（前两次是 builder 语义解码与 `Vr("Comma")` 键名），彻底推翻早期因编码错乱得出的"网页版无快捷键面板"结论。
⇒ 新解出两个键构造器：`Oo("x")` 按字符、`Vr("Comma")` 按键名 ⇒ 与 `keyboard.md` 的 `letter/code/key` 三匹配模式对应。

### 64 项全集（括号＝修饰器类：Co=⌘/Ctrl，ci=⌘⇧/Ctrl⇧，zr=⌘⌥/Ctrl⇧，YM=⌘⌥/Ctrl-Alt，y2=⌥，qi=⇧，mo/Vn=裸键，yae=⌘char/Ctrl）

- **标题与样式族**：`TITLE` `SUBTITLE` `HEADING` `STRONG` `BODY`（全 `zr`）⇒ 与 `at.*`（`at.Title/Subtitle/Heading/Strong/PageRegular`）双向印证 ✓，`styles.md` §一 的语义档位就是这套枚举。
- **列表族**：`TODO_LIST` `TOGGLE_LIST` `BULLET_LIST` `NUMBERED_LIST`（`zr`）⇒ 与 `ListStyle` 5 档（含 `list.none`）互证 ✓。
- **装饰族**：`FOCUS_DECOR(ci)` `BLOCK_DECOR(ci)` ⇒ `styles.md` §四 的"焦点装饰/块装饰"是**命令级功能**，不是纯 CSS ✓✓。
- **转换族**：`PAGE(ci)` `CARD(ci)` ⇒ 转页面/转卡片各有独立命令（补 §一 样式族之外的跨类型入口）。
- **分组族（此前完全没记）**：`GROUP(Co)` `UNGROUP(ci)` ⇒ 官方支持**把多个块归组与解组**，块级一等操作。
- **折叠族**：`TOGGLE_TOGGLES(YM)` ⇒ **一键展开/折叠文档内全部折叠块**（本地只有单块 toggle）。
- **块移动族**：`MOVE_BLOCK_UP/DOWN/TOP/BOTTOM(y2)` + **`MOVE_BLOCK_TOP_MAC` `MOVE_BLOCK_BOTTOM_MAC(zr)`**。
- **选择族**：`SELECT_TO_TOP_COMMON` `SELECT_TO_BOTTOM_COMMON(ci)` + **`SELECT_TO_TOP_MAC` `SELECT_TO_BOTTOM_MAC(ci)`** ⇒ 同一模式：Mac 与 Windows 组合结构不同就**分裂命令成员**。
- **查找替换族**：`FIND_IN_PAGE` `FIND_NEXT(Co)` + `REPLACE_IN_PAGE` `FIND_PREVIOUS(ci)` ⇒ 四命令（G12 的依据更实）。
- **插入与编辑族**：`INSERT_AFTER(裸键)` `INSERT_BEFORE(qi)`、`DUPLICATE(Co)`、`RENAME(qi)`、`EDIT_BLOCK(裸键)`、`COMMENT(ci)`、`CANCEL(裸 Esc)`、`SELECT_ALL(Co)`、`INDENT(裸键)` / `DEINDENT(qi)`、`NAVIGATE_INTO` / `NAVIGATE_OUT(Co)`、`UNDO(Co)` / `REDO(ci)`。
- **表格族**：`ADD_TABLE_ROW(Co)` / `ADD_TABLE_COLUMN(ci)`。
- **外壳族**：`TOGGLE_LEFT_SIDEBAR(Co)`、`TOGGLE_FOCUS_MODE(yae)`、`TOGGLE_ASSISTANT(Co)`、`OPEN_DAILY_NOTE(YM)`。
- **快速打开有四个变体**：`TOGGLE_QUICK_OPEN(Co)` / `TOGGLE_QUICK_OPEN_SAFARI(ci)` / `TOGGLE_QUICK_OPEN_ALT(Co)` / `TOGGLE_QUICK_OPEN_LEGACY(Co)` ⇒ **Safari 专用命令**（避开浏览器占用）、Alt 变体、**LEGACY 兼容位**。

⇒ 复刻要点：① 需要同样一张**以命令 id 为键、值派生键位**的表，否则无法表达 `_MAC` / `SAFARI` / `LEGACY` 变体，也无法让弹层复用命令；② 分组/解组、一键展开全部折叠、块移到首/尾 三项是**功能级缺口**。

## 七、其它本批解出的实现细节 ✓

- **样式落库是"一动作多可选维度"**：`{type:"setTextStyle", blockIds[], textStyle? , textAlignStyle? , fontFamilyId?}` 实测五种组合 ⇒ 对齐与字体走同一动作；`fontFamilyId:null` 表示**回落默认字体**（"重置字体"的表示法）。⇒ `styles.md` §一/§七 的字体与对齐落库方式结案。
- **move 动作形状**：`{type:"move", newState:{blockId, documentId}}` ⇒ 移动可**跨文档换父**；其中一条的 `documentId` 由 `fsn(schedule, …)` 算出 ⇒ **任务改期会把它迁到对应日期的文档**（印证 `protocol.md` §四 与 `tasks.md` 的调度语义）。
- **`craftdocs://` 全集**（与 `craft://` 并存的第二个 scheme）：`craftdocs://users`（内联"用户链接"的类型判别值）、`craftdocs://opensettings`、`craftdocs://open` ⇒ 第一个 scheme 用于**内容对象寻址**，第二个用于**内联元素类型 + 外部深链动作**。
- **AI 线程复用窗口结案**：`v1 = 5*60*1e3` ⇒ **5 分钟**内的同类型线程被复用（§三 规则 ④）。

## 八、★ i18n 字符串的**内联标记契约**（2026-09-27 第 21 批；53 条键含标签，此前只被顺带引用、未成轴）

官方语言包**不是纯文本**：53 条键的值里内嵌标签，渲染端必须解析。全表扫出的标签与约定如下 —— **同一产品里并存 5 套插值/标记约定**。

### 8.1 标签全集（17 个，按出现次数）

| 类别 | 标签 | 次数 | 说明 |
|---|---|---|---|
| HTML 标准 | `<strong>` | 18 | 主力加粗 |
| HTML 标准 | `<b>` / `<br/>` | 各 1 | **与 `<strong>` 混用**（`invite.nudge.description.with.team` 用 `<b>[team]</b>`）；`<br/>` 是**自闭合**写法 |
| 自定义小写 | `<highlight>` | 17 | **协作/反应聚合句的高亮位**（`web.collab.reacted.*` 全家） |
| 自定义小写 | `<username>` | 4 | 用户名插槽 |
| 自定义小写 | `<formattedlink>` | 3 | 带格式的链接位 |
| 自定义小写 | `<toclink>` `<privacylink>` `<logoutlink>` `<helpsitelink>` `<guidelink>` `<domainlink>` | 各 1–2 | **每个具名链接一个标签**（不是通用 `<a>`）⇒ 链接目标是代码侧按标签名注入的 |
| 自定义小写 | `<name>` `<italic>` `<emojiwrapper>` `<code>` `<bold>` | 各 1–2 | ⇒ **`<italic>` 与 `<bold>` 是"用元素名当样式名"的非标准写法**（与 `<strong>`/`<em>` 并存） |
| **PascalCase** | `<UncoloredLink>` | 1 | **大小写约定也不统一**（`browse.best.experience.browsers`）⇒ 标签名解析不能假设全小写 |

### 8.2 ★ 第六种插值：react 风格的**数字子元素** `<0></0>`

`collab.invite.but.not.invited`「你想提及 **`<0></0>`**，但他们未被邀请加入此文档。」
⇒ 这不是占位符而是**空元素 + 数字索引 children**（`Trans` 组件风格）。⇒ 本产品的字符串里**同时存在 6 种插值约定**：`[0]` / `{{name}}` / `{0}`（AI 模板）/ `<tag>…</tag>` / `<0></0>` / **字面量文本**（如 `<b>[team]</b>` 里 `[team]` 是写死的词而非参数）。

### 8.3 宿主分布（38/53 在 `web.*`）

`web` 38 · `subscription` 5 · `teamsettings` 2 · `upgrade` / `team` / `onboarding` / `invite` / `collab` / `browse` / `blockdetails` / `alert` 各 1。
⇒ **`web.*` 命名空间是"协作活动流"文案集中地**（谁 reacted、谁和谁 reacted、1/2/x 三种复数形态各一版），这类句子必须带富文本，所以标签全堆在这里。

### 8.4 顺带掉出的**席位与配额硬数字**

| 数字 | 证据 |
|---|---|
| **Family 最多 5 位成员** | `subscription.invite.family.strong`「邀请最多 **5 位家庭成员**」 |
| **Team 最多 25 名成员** | `subscription.invite.team.strong`「邀请最多 **25 名团队成员**」⇒ 与 §五之二 D 的"25 个空间上限"是**两个不同的 25**，别混 |
| **区块配额有"已用/总量"回显** | `subscription.block.limit.used`「你已使用此套餐中可用的 `<strong>[1]</strong>` 个区块中的 `<strong>[0]</strong>` 个。」+ `.used.all` 版 ⇒ **G313 的 block-limit 配额模型有专门的用量条** |
| **剩余免费席位可加** | `team.invite.subscription.desc`「你的订阅已添加 [0]。你可以**免费**添加 **[1]**。」⇒ 席位有"已用/可免费"两段话术 |

⇒ **对本地实现的直接含义**：翻译渲染层不能只做 `[0]` 字符串替换，需要一个"标记解析器"，且要容忍 5 种标签命名风格与自闭合/数字 children 两种特殊形态；否则这 53 条键会原样漏出标签文本。

## 九、下一批线索

1. 四个 quick-open 变体的实际触发条件，以及 `_t`（默认 agentType）的字面值。
2. 跨块类型的**内容迁移规则**（列表↔代码↔图片之间是否保留子块）：需继续找块动作处理器注册表。
3. 已见 `CACHE_KEY` 枚举 7 值（`browse-layout` / `browse-sort-config` / `search-scope-preference` / `sidebar-inbox-item-order` / `sidebar-starred-item-order` / `tag-usage-stats` / `tags-short-cache`）⇒ **UI 偏好的本地存储键名全集**，尚未成文，可与 `settings.md` §二 的作用域模型对齐。
4. 分组（GROUP）后的块在目录/大纲里如何呈现。

## 十、同步层：事件枚举与连接状态机（2026-09-27 静态结案，`js/BrowseSyncTab-*.js` 16 KB / `js/SyncLogTab-*.js` 12 KB）

这两个 chunk 是**官方自己的调试面板**，等价于把内部同步协议打印成人能读的一张表 —— 比任何外部资料都权威，且此前完全没进过文档。

### 10.1 空间级（browse 层）同步事件全集 = 21 个 mutation

`BrowseSyncTab` 里逐条硬写的事件名（英文原样，未走 i18n ⇒ 调试界面）：

| 对象 | 事件 |
|---|---|
| Doc | `star` / `unstar` / `archive` / `unarchive` / `view` / `move` |
| Folder | `create` / `rename` / `icon` / `description` / `move` / `delete` / `reorder` |
| 结构 | `Subfolder reorder` / `Root reorder` / `Starred reorder` / `Folder pinned doc` |
| Tag | `pin` / `unpin` / `reorder` |

三条直接结论：

1. **`Doc view` 是一条同步事件** ⇒ "上次浏览时间"是**服务端记录、跨设备同步**的，不是本地历史。这解释了列表视图为什么能有一列「上次浏览」，也意味着本地把它做成 `localStorage` 是**行为不同**级差异。
2. **`Folder description` 与 `Folder icon` 同为独立事件** ⇒ 文件夹的描述字段是**一等可变属性**（有独立 mutation 通路），与 `tags-browse.md` 里"文件夹有 description 字段"的文案级证据互相印证，现已升级为协议级。
3. **顺序类事件有三条**（`Root reorder` / `Starred reorder` / `Subfolder reorder` / `Folder reorder`）⇒ **拖拽落点按容器分开排序**，与 `ui-affordances.md` §七 的 `insertAtIndex` 只在同一父级内计算一致。

### 10.2 ★ 连接状态机有 7 档，不是"在线/离线"两档

同一文件里的状态字符串集合：`connected` / `connecting` / `syncing` / `loading_cache` / `offline` / `disconnected` / `unknown`。

- **`loading_cache` 单独成态** ⇒ 冷启动时"先渲染本地缓存、再连服务端"是官方显式阶段（对应 `browse.*` 的离线徽标三态文案）；
- **`syncing` 与 `connecting` 分离** ⇒ "通道已连"和"数据在流动"是两个可观测状态，UI 徽标要能区分；
- **`disconnected` 与 `offline` 分离** ⇒ 前者是"套接字掉了"（会自动重连）、后者是"网络没有"（要提示）；本地目前把两者混为一谈会导致徽标语义错。
- 面板还显示 `Pending` / `Pending (space)` 两个**分别计数的待处理队列** ⇒ 全局与当前空间各有一条队列。

### 10.3 全局调试面板的分类与指标

`SyncLogTab` 的事件分类：**`lifecycle` / `socket` / `conflict` / `monitor` / `worker` / `network` / `offline` / `success`**。

- ★ **`conflict` 是一等分类** ⇒ 官方**存在可观测的冲突事件**（不是"CRDT 所以不会冲突"）。配合 `document.sync.failed` / 远端版本更新的文案，冲突处理是**必须实现的行为**，不是理论问题。
- 展示的分区表头：`Status` / `Network` / `Last Sync` / `Indices` / `Sync Patch` / `Local Patch` / `Objects` / `Sub Tier` / `Comments` / `Requests` / `Blocks` / `Object Links` / `Meta Objects` ⇒ **同步按对象分层**：`Indices`（索引）、`Blocks`（块）、`Object Links`（反向链接/对象关系）、`Meta Objects`（元对象）各一条通路，且有 **`Sub Tier` 分层优先级**与 **patch（增量）与本地 patch 双轨**。
- 空态文案 `No events yet`；导出按钮产出 `Debug log copied` / `Browse sync log copied`（**整份日志可一键复制到剪贴板**）。
- 面板顶部有 `Online` / `Offline` / `Pending: N` / `Last sync:` 与 `Details`。

### 10.4 与本地缓存键集合的交叉验证（两个视角是同一套模型）

`internals.md` §九 已记录的 7 个 `CACHE_KEY`：`browse-layout` / `browse-sort-config` / `search-scope-preference` / `sidebar-inbox-item-order` / `sidebar-starred-item-order` / `tag-usage-stats` / `tags-short-cache`。

与 §10.1 的同步事件对照可得一条**本地存储 vs 服务端同步的分界线**：

| mutation | 同步事件 | 本地缓存键 | 判定 |
|---|---|---|---|
| 视图模式（网格/列表/瀑布） | ✗ 无 | `browse-layout` | **纯本地偏好**，不跨设备 |
| 排序方式 | ✗ 无 | `browse-sort-config` | **纯本地偏好** |
| 搜索范围 | ✗ 无 | `search-scope-preference` | **纯本地偏好** |
| Inbox / Starred 顺序 | ✓ `Root reorder` / `Starred reorder` | `sidebar-*-item-order` | **双写**：服务端存权威顺序，本地缓存渲染序 |
| 标签统计/简称 | ✓ `Tag pin/unpin/reorder` | `tag-usage-stats` / `tags-short-cache` | 同上 |

⇒ 本地实现若把"视图模式/排序"做成同步字段，是**多做**（官方明确只留本地）；若把"顺序"只存本地，是**缺失**（官方服务端有权威序）。`~` 表中"同步事件"列来自调试面板字面量，"缓存键"列来自 `CACHE_KEY` 枚举，两列各自硬证据，**分界判定是推断**。

## 十一、★ 冲突解决引擎：官方在客户端做**完整三方合并**（2026-09-27 10:32 静态结案，`js/index-*.js` @6461179 / @6463218 / @580537 + `js/socket.worker-*.js` @402527）

§十 只采到 `conflict` 是**一等日志分类**；本节给出它的**实现**。⇒ 结案"离线/冲突态只能动态采"的旧判断。

### 1. 触发条件（精确到比较式）

```js
updateDocument(e) {
  latestSyncToken = e.syncToken;
  if (e.blocks.length > 0 &&
      currentDocStore.localSyncIndex > currentUiStore.connectionStatus.lastSyncPatchIndex) {
      log("conflict", "warn", "Conflict resolution started", {blockCount: e.blocks.length});
      blocks = conflictResolution(e);          // ← 三方合并
  } else blocks = e.blocks;                     // 直接采用服务端补丁
  ...
  if (!(blocks.length === 0 && sameDoc && hasLastSyncToken))
      docDispatch(hw(blocks, syncToken, docId), { undoable: false, ... });
}
```
⇒ **四件事同时确定**：
1. 冲突判据**不是版本号相等**，而是 **`localSyncIndex > lastSyncPatchIndex`** —— "本地有尚未上报的改动，且服务端补丁已落后" ⇒ 有未发送的本地态就要合并，而不是覆盖。
2. **只有 `blocks.length > 0` 才走合并**：空补丁（纯元数据/顺序更新）直接采用。
3. ★ **服务端补丁以 `{undoable: false}` 派发到本地事务管道** ⇒ **远端改动不进本地撤销栈**（与 V46"本地撤销会同步到服务端"合起来看：撤销栈只收本地动作，撤销动作本身再上行）。
4. `sameDoc = documentModel.id == null || === currentDocStore.documentId` ⇒ **补丁带文档身份守卫**，且 **`id == null` 被视为"属于当前文档"**（宽松）。

### 2. 基线（base）从哪来：**四个按 `syncToken` 索引的快照 Map**

```
baseToken = currentDocStore.lastSyncToken ?? "init"          ← 没有基线时用字面量 "init"
baseChildren = e.docIdTree?.get(baseToken)?.childMapping ?? {}     ← 树结构（父子顺序）也是快照之一
basePluginData / baseObjectData / baseTaskData = e.oldPluginData|oldObjectData|oldTaskData 的 .get(baseToken) ?? {}
```
⇒ ★ **服务端一次下发四个"旧值字典"+ 一棵 `docIdTree`，全部以 syncToken 为键** ⇒ 客户端不需要本地保存历史版本就能构造三方合并的 base。这是"补丁协议"的形状，**本地若只传新值就无法做同样的合并**。
⇒ 有 `"init"` 这个哨兵 ⇒ **首次同步时 base 全空**，此时"合并"退化为"服务端为准 + 本地非空字段保留"。

### 3. **五类数据各有独立合并器**（不是一套通用 diff）

| 数据 | 合并器 | 输入 | 关键细节 |
|---|---|---|---|
| 子块 ID 列表 | `e$(client, server, base)` | 三个 id 数组 | 产出 `{mergedBlockIds}` ⇒ **顺序合并**，不是集合合并 |
| `table` | `P0e({server,client,base}, mergedBlockIds)` | **pluginData 三向** | ★ 还要吃**刚合完的 `mergedBlockIds`** ⇒ 表格 cell 引用块被删时要过滤；无效则 `logger().error("TableConflictResolution","Invalid table data")` 并**整槽回退 `{}`** |
| `object`（记录） | `D0e({client,server,base}, objectListSchema)` | **objectData 三向** | ★ **额外传入"父 `objectList` 块的 `schema`"** ⇒ 字段定义本身可能同时被改，合并器需要当前 schema 才能裁决；父块必须是 `objectList` 才拿得到 schema，否则 `undefined` |
| `objectList`（集合表头） | `E0e({client,server,base})` | objectListData 三向 | schema/views 合并 |
| `taskData` | `_0e({client,server,base})` → `vVe()` 序列化回 | 任务四字段三向 | 判据是 `incoming.taskData != null \|\| local.taskData != null` ⇒ **任一侧是任务就要合** |

⇒ ★ **合并是"逐块逐槽"的**：一块可以同时产出表格合并结果与子块合并结果；**任一槽没产出就在最终组装时回退为服务端原值**：
```js
{...b, subblocks: n.get(id)?.mergedBlockIds ?? b.subblocks,
     pluginData: si(o.get(id)) ?? b.pluginData,
     objectData: s.get(id) ?? b.objectData,
     taskData:   i.get(id) ?? b.taskData}
```
⇒ **"合并器是可选增强、不是必经路径"** ⇒ 本地实现可以按类渐进支持（先只合子块，其余以服务端为准），不会破坏不变量。

### 4. **同一套逻辑有两份实现**（主线程与 worker）

`socket.worker-*.js` 里另有一套：`resolveConflictsBetweenRawBlockModels(server, client, base)` → 逐块 `resolveBlockConflict(client, server, base, all)`（内部 `mergeSubBlocks` / `mergeObjectData` / `mergeTaskData`），**入参顺序与主线程版不同**（worker 是 `(server, client, base)` 的 reduce，主线程是 `{clientData, serverData, baseData}` 具名）。
⇒ ★ 改合并语义要**同时改两处**；排障时先确认是哪一份在跑（worker 版处理 raw block models，主线程版处理 doc store 补丁）。
⇒ 顺带解出 §一之八 里 `stamp` 字段的用途：**`updateBlockStamps` 给每块维护一个 stamp 集合**（`C[id] ? C[id].add(stamp) : C[id]=new Set([stamp])`）⇒ 块级因果/版本标记，是冲突检测的辅助位。

### 5. 与"离线"侧的接缝

`preferences.offline.mode.*`（`settings.md` §一）负责**开关与放弃确认**；本节负责**上线后怎么并**。⇒ 离线写队列的产物就是 `localSyncIndex` 领先 `lastSyncPatchIndex` 的那段本地改动 ⇒ **冲突不是异常，而是离线编辑的必然路径**（日志级别是 `warn` 不是 `error`）。

## 仍未采到（同步层）

- 调试面板的**进入方式**（两个 Tab 在 `Settings` 里按什么条件出现：开发者开关？长按版本戳？），未证。
- `Sub Tier` 的具体档位含义与优先级规则。
- ~~`conflict` 事件触发后用户可见的处理形态（自动合并？提示？只记录日志？）~~ **机制侧结案（§十一）**：**自动三方合并、不打扰用户** + `t1("conflict","warn","Conflict resolution started",{blockCount})` 日志 + 补丁以 `{undoable:false}` 派发。**仍未采到**：合并失败或部分回退时**界面上有没有任何可见反馈**（§十一 3 的逐槽回退意味着「悄悄以服务端为准」是可能形态，需一次双客户端实测或 UI 文案侧证据）。
- 待处理队列 `Pending` 与 `Pending (space)` 的调度关系（全局队列是否优先）。

## 十二、五个小而独立的机制（2026-09-27 11:07 结案，来自 8 个 **617 B–1.8 KB** 的未点名 chunk；按 Step 6 新增的"体积升序 + grep 过滤"启发式选中）

### 1. ★ `ClipboardBoundary`：粘贴/剪切有**显式边界元素**（617 字节，一个组件的全部）

```jsx
<div onCut={stop} onCopy={stop} onPaste={stop} data-paste-boundary={true} {...props} />
```
⇒ ① 官方用**自定义 DOM 属性 `data-paste-boundary`** 标记边界（⇒ **样式与逻辑都能按属性选择**，不必加 class）；② 三种剪贴板事件**在边界上被拦截** ⇒ **嵌套编辑器（代码块 / 白板 iframe / 单元格输入）之间的剪贴板作用域隔离**由此实现；③ 处理函数 `onCut`/`onCopy`/`onPaste` **三者共用同一个引用** ⇒ 边界不区分事件类型，一律"到此为止"。
⇒ 本地完全没有这一层（`grep -rn "data-paste-boundary" src` ⇒ 0 命中）。**这是一个 5 行组件解决的一类 bug**（跨块粘贴把结构粘坏 / 内层粘贴被外层吃掉）。

### 2. ★ `TasksBrowseUpcomingView.utils`：「即将进行」视图的**权威排序器**（1.6 KB）

```js
T = { week: 0, month: 1, year: 2 }                              // 分组档优先级：周 > 月 > 年
S(a, b):  同一 date → 按 T[kind] 升序
           否则 a 早于今天 → -1 ；b 早于今天 → +1              // ★ 过期项排在最前
           否则按日期升序
W(a, b):  按 taskData.schedule（?? null）
           两者都 null → 0 ；a 为 null → -1 ；b 为 null → +1    // ★ 无排期排在有排期之前
           同 schedule → 再比 created
```
⇒ 两条**反直觉但有道理**的规则：**过期项优先于今天**；**没有 schedule 的任务排在有 schedule 的任务之前**（"待安排"比"已安排"更该先看）。⇒ 此前只记了档位名（`inbox/today/upcoming/all`），排序规则是本批首次成文。

### 3. ★ `RenderOptionsPanel.utils`：**命令式弹层 ↔ Promise 桥**，四种终态（799 字节）

```js
store = { callback: noop }
show(dispatch, type, spaceId, documentId, pageId) → new Promise(resolve => {
   store.callback = r => { store.callback = noop; dispatch({type:"closed"}); resolve(r) };
   dispatch({type:"open", configType, spaceId, documentId, pageId});
})
cancel()       → callback({type:"cancelled"})
submitResult(c)→ callback({type:"submitted", config: c})
```
⇒ ① 面板的**四种终态**：`open` / `closed` / `cancelled` / `submitted`，且 `closed` 是**任何终止路径都会补发**的一次（先置 `callback = noop` ⇒ **幂等：只解析一次**）；② `configType` + `spaceId`/`documentId`/`pageId` ⇒ **同一个面板承载多种配置类型**，且打开时把三级位置上下文都进 store；③ "命令式 API 返回 Promise + store 里放 callback"是官方**跨层（组件 ↔ store）交互的通用形态**，值得在本地复刻一套而不是散落的 `useState`。

### 4. DnD backend **按平台拆成两个懒加载 chunk**（各 665 字节）

`HTML5DnDProvider` = `<DndContext backend={HTML5ToBackend}>`、`TouchDnDProvider` = `<DndContext backend={TouchBackend}>` —— **就这一个差别**。
⇒ ★ **移动端不加载 HTML5 backend**（反之亦然），backend 选择发生在** provider 层而不是 hook 层** ⇒ 与 `ui-affordances.md` §七 的"桌面 HTML5 / 移动 Touch 两套 backend"互证，且**证明了它是一个独立 chunk 级决策**（可用来核对本地是否也该拆包）。

### 5. 付费墙模态的兜底文案与按钮规格（`UpgradePrompt`，1.7 KB）

`description` 缺省 = **i18n 键 `subscription.subscription.fallback.desc`**（★ **命名空间重复两遍** = 又一条"官方 key 命名不规则"实例，与 `alert.could.not add.reaction` 的键名带空格同族）；按钮文案 = **顶层裸键 `upgrade`**（不带命名空间）；按钮规格 = `type: FilledStrong, fluid: true`（★ 付费墙主按钮是**满宽的强填充档**，与其它模态的按钮不同档）。
⇒ 另：`LazyMsalProvider.constants` 全文只有一句 `export const msalInstance = new PublicClientApplication(config)` ⇒ **企业 SSO 的 MSAL 实例是模块级单例 + 单独懒加载 chunk**（与 `vendor-azure-msal` 配套），⇒ SSO 的启用成本很低（不加载就不初始化）。

## 仍未采到（机制面·第 41 批续）

- `ClipboardBoundary` 里 `stop` 的具体实现（`preventDefault` 还是 `stopPropagation`？两者语义差别很大，未读到函数体）。
- `RenderOptionsPanel` 的 `configType` **取值集合**（面板到底承载哪几种配置）。
- `S`/`W` 两个排序器**各用在哪个视图**（`week|month|year` 三档分组与 `tasks.upcoming.*` 文案的对应关系未对完）。
- `DndContext` 的 `sensors`/`accessibility` 配置（在调用侧，不在这两个 provider 里）。
- `SquareOnSquare` 这个 24×24 图标**用在哪**（图标按需体系的一个实例，未反查调用点）。

## 十三、弹层关闭与快捷键是同一套注册机制（2026-09-27 11:32 结案，`index-DiTmKH3z.js` @16762 / @19484 / @1038959 / @1039285 / @1039475 / @1039732 / @4790898 / @1383061；★ 结掉 §十二 与 §一之十四 的「具名浮层栈实现本体」「`getPlacementOffset` 表体」「`EDITOR_OVERHANG` 数值」「导出分辨率的 `E`」四条遗留）

### 1. `ao(id, onClose, {allowPropagation = false, isDisabled, aboveFocusStackId})` = 焦点栈注册 hook

```js
function ao(t, e, n) {
  const { allowPropagation: s = false, isDisabled: i, aboveFocusStackId: l } = n;
  const c = N9(e);                                   // ★ useLatestRef
  d = () => i ? ort                                  // ★ 禁用时注册返回空函数
              : (bn.pushIntoFocus({
                   id: t,
                   keyDefs: [{ matcher: Vn(qs), handler: () => c.current?.() }],
                   allowPropagation: s }, l),
                 () => bn.removeFromFocus(t));
  useEffect(d, [c, t, l, s, i]);
}
function ort() {}                                    // 字面量：空函数
```

- ★ **Esc 不是 `addEventListener`，而是一条 keyDef**：`{matcher: Vn(qs)}`，其中 **`qs = "Escape"`**、`Vn(t) = { keyCondition: na(t) }`（**不约束任何修饰键** ⇒ 裸 Esc）。
- **`isDisabled` 的语义是"根本不注册"**（返回 no-op `ort`），不是"注册后忽略" ⇒ 关闭态弹层**不会抢占 Esc**。
- **卸载是 `removeFromFocus(id)`**，按 **id** 增删 ⇒ 栈成员有稳定名字（这就是 `collection-v2-{date,select,multiselect,person,relation}-editor` 那些名字的用途，§一之十三 6 / §一之十四 3）。
- ★ **`allowPropagation` 默认 `false`** ⇒ **栈顶独占 Esc**，下层弹层收不到；`aboveFocusStackId` 可指定"插到某个 id 之上" ⇒ **嵌套顺序是显式可控的**（不是纯 LIFO）。
- **`N9` = useLatestRef**：`useRef(t)` + `useLayoutEffect(() => { n.current = t })` ⇒ 注册只做一次、handler 永远调用最新的 onClose。

### 2. 同一机制还有三个变体，且**存在第二条并行的注册通路**

- `$i(t, e, n)` = `ao(t, e, { ...n, isDisabled: false })` ⇒ "总是注册"封装。
- ★ **`zd(t, e, n)` → `Gd(t, e, { ...n, isDisabled: false })`** 是**另一套**：它先把 handler 存进一个 **按 id 的 store**：`Ai(e, `keys-${t}`, { equals: In })`，再做焦点栈注册 ⇒ **官方有两条并行的键绑定注册面**（焦点栈 vs `keys-${id}` store），**改键语义要两处同改**（与 §十一"合并逻辑两份实现"同一种重复）。
- 另一处消费者用 **`useLayoutEffect`**（`ao` 用 `useEffect`），且 **`keyDefs` 是条件数组**：`allowEscape ? [{ matcher: Vn(qs), handler: () => R("escape") }] : []` ⇒ ★ **关闭动作带一个"原因"字符串参数**（`"escape"`），与 §十二 3 的 `{type:"submitted"|"cancelled"|"closed"}` 是同一族设计。
- **`WH = "design-system-popupContainer"`** + `L4e = () => R4e(WH)` ⇒ 设计系统有一个**具名的弹层挂载容器 id**（集中 portal 目标）。

### 3. 快捷键定义是「平台双写」结构（360 条 `matcher:` 绑定的注册侧形态）

```js
Vn(t) = { keyCondition: na(t) }                                              // 不约束修饰键
mo(t) = { metaKey:false, shiftKey:false, altKey:false, ctrlKey:false, keyCondition: na(t) }   // 显式"无修饰"
qi(t) = { shiftKey:true,  altKey:false, metaKey:false, ctrlKey:false, keyCondition }          // Shift
Co(t) = { metaKey:true, shiftKey:false, altKey:false, ctrlKey:false, keyCondition,
          winMatcher: { ctrlKey:true, shiftKey:false, altKey:false, metaKey:false, keyCondition } }
```

⇒ ★ **Mac 的 ⌘ 与 Windows 的 Ctrl 写在同一个对象里**（`winMatcher` 是覆盖项），这就是"组合由 modifier 描述对象 + 平台映射在运行时拼装"的实现本体（此前只能从行为侧猜）。
⇒ `Vn` 与 `mo` 的区别很关键：**`Vn` 不限制修饰键** ⇒ 用 `Vn(qs)` 注册的"Esc 关闭"在 `Ctrl+Esc` 之类组合下**也会命中**（若产品不想这样就必须用 `mo`）。

### 4. 键名常量表与「code → 显示字形」表

- 键名字面量：`qs="Escape"`、`oo="Enter"`、`B4="Delete"`、`vd=" "`、`nc="Backspace"`、`f1="Tab"`、`ms/Ts/Vl/Il="Arrow{Down,Up,Left,Right}"`、`XM="Home"`、`JM="End"`、`uEe="Meta"`、`fEe="Control"`、`Sae="Shift"`。
- ★ **`pEe` 是 `KeyboardEvent.code → 显示符号` 映射**：`{" ": "space"}`（**空格用文字 `space`**）、方向键/`Enter`/`Backspace`/`Home`/`End` 用**字形符号**、`BracketLeft:"["`、`BracketRight:"]"`、`Slash:"/"`、`Backslash:"\\"`、`Quote:"'"`、`Backquote:"`"`、`Comma:","`、`Minus:"-"`（**标点用原字符**）。
- ⚠ 本地 dump 里那五个字形已 mojibake（`鈫` 等，非 ASCII 误解码，技能里已记过同种坑）⇒ **具体字形以官方语言包或实屏为准，不要按这份 bundle 文本复刻图标**。这是「⌘K/快捷键面板显示层」的权威来源，但**字形值本批未采到**。

### 5. ★ 集合/表格的几何常量表（一次解完 §一之十四 遗留的两个数）

```js
const sE = {
  ROW_HEIGHT: 35,
  CELL_H_PADDING: 10,
  POPUP_WIDTH: 264,
  EDITOR_OVERHANG: 10,
  EDIT_POPUP_OFFSET: t => { switch (t) {
      case le.TEXT: case le.NUMBER: case le.URL: case le.EMAIL: case le.PHONE: return -10;
      default: return -4 } },
  getPlacementOffset:   t => -35 + sE.EDIT_POPUP_OFFSET(t),   // = −ROW_HEIGHT + offset
  getPlacementSkidding: t => sE.EDIT_POPUP_OFFSET(t),
};
```

- ⇒ **文本族（TEXT/NUMBER/URL/EMAIL/PHONE）offset −10 ⇒ `getPlacementOffset = −45`；其余类型 −4 ⇒ `−39`**。输入组件再统一 `−1.5` ⇒ **实际 −46.5 / −40.5**。
- ★ **但 skidding 表值（−10 / −4）在集合输入里被 `overrideSkidding ?? −14` 覆盖** ⇒ **集合输入弹层横向偏移恒 −14**，与类型无关（`getPlacementSkidding` 服务别的调用方）。
- ★ **`EDITOR_OVERHANG = 10`** ⇒ 弹层宽 = 单元格宽 + **20px**；`POPUP_WIDTH = 264` 是**默认弹层宽**（无锚点/非输入类弹层用）。
- `ROW_HEIGHT = 35` 是**行高权威值**，且 `getPlacementOffset` 的 `−35` 就是"从行首起算"。

### 6. ★ 表格的降级阈值是**单元格数**，不是行数

```js
const p8n = 600;
function h8n(t) { return t.rowCount * t.visibleColumnCount > p8n }
```

⇒ **行 × 可见列 > 600 时走另一条渲染路径**（后面紧跟 `m8n({count, scroll…})` 的虚拟化辅助）。⇒ 官方给表格性能定的是一等常量，且判据是"**可见**列"而非总列 ⇒ **隐藏列不计入**。

### 7. `E` 结案 = `devicePixelRatio`，且官方是 matchMedia 跟随式

```js
function S3() {
  const [e, n] = useState(window.devicePixelRatio);
  useEffect(() => {
    const i = () => n(window.devicePixelRatio);
    const l = matchMedia(`(resolution: ${e}dppx), (-webkit-device-pixel-ratio: ${e})`);
    const r = new jo;                    // cleanup 集合
    SC(l, i, r.signal);                  // addEventListener with AbortSignal
    return () => r.cleanupAll();
  }, [e]);
  return e;
}
```

⇒ ★ **白板预览的导出分辨率 = 容器 CSS 尺寸 × devicePixelRatio**（`v = min(w*DPR/块宽, h*DPR/块高)` 再 contain），且 **DPR 变化（浏览器缩放 / 换屏）会通过 matchMedia 触发重订阅**。⇒ §25.5 里未解的 `E` 就此结案。

## 仍未采到（机制面·第 43 批）

- `pEe` 表里 `Arrow*` / `Enter` / `Backspace` / `Home` / `End` 的**真实字形字符**（bundle 文本已 mojibake）。
- ~~`na(t)` 的实现~~ **已结案（§十四 4）**：`na(t) = typeof t === "string" ? q7(t) : t`，字符串自动降为 `key` 档；另有 `code` / `letter` 两档与 letter 的抛错守卫。
- ~~`bn` 焦点栈本体~~ **已结案（§十四 1–3）**：模块级数组 `d0`、capture 阶段单一监听、四个 API（push/upsert/remove/initialize）、插入用 `startsWith`、重复 push 有 `UIFocusRePushed` 告警。
- `In`（`equals` 比较器）与 `Ai`（按 id 的 store）的具体语义。
- `h8n` 的消费侧**部分结案（§十四 5）**：latch 只置 true、退化边沿 `!Se && Ie`、`overscan:25` 都已知；★ **越过 600 后用户可感知的差异仍未证**（列入动态清单，G499）。
- ~~`m8n` 的虚拟化参数~~ **已结案（§十四 5）**：`estimateSize` 固定高、`overscan:25`、`enabled`、自定义 `observeElementOffset`、卸载 `clearTimeout`+`cancelAnimationFrame`；⚠ `Le` 具体喂给哪个入参未确认。

## 十四、UIFocusStack 与键表引擎：整条键盘分发的实现本体（2026-09-27 11:41 结案，`index-DiTmKH3z.js` @14189 / @15052 / @15768 / @15973 / @16713 / @4791220 / @4792377；★ 结掉 §十三 的 `na()`、`bn` 本体、`h8n` 消费侧、`m8n` 参数四条遗留）

### 1. 栈与 API（官方内部名 **`UIFocusStack`**）

```js
const bn = { initialize: eEe, pushIntoFocus: nEe, upsertIntoFocus: oEe, removeFromFocus: sEe };
function eEe(t) { zn.document.addEventListener("keydown", tEe, t, /* capture */ true); }
const d0 = [];                                            // ★ 模块级数组，不是 store
```

- ★ **监听在 `document` 的 capture 阶段**（第 4 个实参 `true`）⇒ 官方键盘分发**先于任何组件自己的 keydown**。
- 四个方法里 **`upsertIntoFocus` 是第三个通路**（§十三 2 只见到 push/remove 两个）。

### 2. 分发算法（`tEe`，逐行都能对上行为观测）

```js
function tEe(ev) {
  if (ev.keyCode !== 229)                                  // ★ 229 = IME 组合中 ⇒ 整条分发直接跳过
    for (let i = d0.length - 1; i >= 0; i--) {             // ★ 从栈顶往下
      const item = d0[i];
      const defs = typeof item.keyDefs === "function" ? item.keyDefs() : item.keyDefs;   // ★ 可为懒函数
      let hit = false;
      for (const d of defs)
        if (XI(ev, d.matcher)) {
          hit = true;
          const r = d.handler(ev, ev);                     // ★ handler 收两个相同实参
          (typeof r !== "object" || r.preventDefault)   && ev.preventDefault();
          (typeof r !== "object" || r.stopPropagation)  && ev.stopPropagation();
          break;                                           // 一项内只命中第一条
        }
      if (hit || !item.allowPropagation) break;             // ★ 命中 或 该项不允许多播 ⇒ 断链
    }
}
```

四条要记的语义：
1. ★ **IME 组合期间（`keyCode === 229`）官方所有快捷键都不工作**，包括 Esc 关弹层与 Enter 提交 ⇒ 这条此前只能靠动态猜，现在是字面量。
2. ★ **`allowPropagation` 默认 false ⇒ 栈顶项即便没命中也会把这条键"吃掉"**（`!allowPropagation` 就 break）⇒ 官方"栈顶独占"的确切强度是**断整条链**，不是"命中才拦"。
3. ★ **handler 返回值就是拦截控制对象**：返回**非对象** ⇒ 默认 `preventDefault` + `stopPropagation`；返回**对象且缺某键** ⇒ 该拦截被**豁免**（`{preventDefault:false}` 或直接返回 `{type:"cancelled"}` 这类不带这两键的对象）。⇒ ⚠ 与 §十二 3 的 `{type:"closed"|"cancelled"|"submitted"}` 返回值**共用同一条通道** ⇒ 官方设计里"返回一个控制对象"顺带就**放弃了拦截**；复刻时这条耦合要显式决定，不要当成巧合。
4. **`keyDefs` 可以是函数** ⇒ 每次按键重新求值，支持"按当前状态决定绑哪些键"（§十三 的条件数组是它的静态版）。

### 3. 插入、去重与可观测性

```js
function nEe(entry, aboveId) {
  if (aboveId != null) {
    const o = d0.findIndex(s => s.id.startsWith(aboveId));   // ★ startsWith，不是 ===
    if (o !== -1) { d0.splice(o + 1, 0, entry); return; }
  }
  const n = d0.findIndex(o => o.id === entry.id);
  n !== -1 && pe.logger().warn("UIFocusRePushed",
      `${entry.id} has been pushed to UIFocusStack, while it was already there, ` +
      `this is likely a component lifecycle glitch. ${rl(d0.map(o => o.id))}`);
}
function oEe(entry) { const e = d0.findIndex(n => n.id === entry.id); e === -1 ? d0.push(entry) : d0.splice(e, 1, entry); }
function sEe(id)    { const e = d0.findIndex(n => n.id === id);      e !== -1 && d0.splice(e, 1); }
```

- ★ **`aboveFocusStackId` 用 `startsWith` 找位** ⇒ **栈项 id 是按前缀命名空间设计的**（`collection-v2-*` 整族可以插到某个前缀之后），这就是 §一之十三/§一之十四 那批带 `v2` 前缀名字的第二个用途。
- ★ **重复 push 同一个 id 是一条专门的告警事件 `UIFocusRePushed`**，文案明写"大概是组件生命周期 glitch"，**并把整条栈的 id 列表序列化进日志** ⇒ 官方有"一键 dump 焦点栈"的可观测能力。
- ★ **`upsertIntoFocus` 是原位替换（`splice(e,1,t)`）⇒ 不改变栈序** ⇒ 重注册不会把某项意外顶到栈顶。

### 4. matcher：三档键寻址 + 平台双写选路

```js
function XI(ev, def) {
  const n = bae(def);                                  // ★ 平台归一
  if (n.altKey   != null && ev.altKey   !== n.altKey)   return false;
  if (n.ctrlKey  != null && ev.ctrlKey  !== n.ctrlKey)  return false;
  if (n.shiftKey != null && ev.shiftKey !== n.shiftKey) return false;
  if (n.metaKey  != null && ev.metaKey  !== n.metaKey)  return false;
  switch (n.keyCondition.type) { case "key": … }        // ★ 三档分派
}
function bae(t) { return Ll ? t : (t.winMatcher ?? t); }        // ★ Ll = 是否 Mac
function na(t)  { return typeof t === "string" ? q7(t) : t; }    // 字符串 ⇒ 自动按 key 寻址
function q7(t)  { return { type: "key",   key: t }; }            // KeyboardEvent.key
function Vr(t)  { return { type: "code",  code: t }; }           // KeyboardEvent.code（物理键位）
function Oo(t)  { if (!xae(t)) throw new Error(
      `Expected a single ASCII letter, received "${t}". For non-letter physical keys, use code() instead.`);
                  return { type: "letter", letter: t.toLowerCase() }; }
```

- ★ **四个修饰键都是"声明了才比较"**（`!= null` 门）⇒ `Vn(t)`（只给 `keyCondition`）＝**任意修饰键组合都命中**；要"精确无修饰"必须用 `mo(t)`（显式写四个 false）。§十三 3 的行为推断在此得到字面确认。
- ★ **键条件有三档寻址：`key` / `code` / `letter`** ⇒ 官方能区分"逻辑字符"与"物理键位"，`letter` 档还带**抛错守卫**（非单 ASCII 字母直接报错并提示改用 `code()`）⇒ 非 QWERTY 布局下的行为是可控的，且**报错文案就是给开发者的迁移提示**。
- ★ **平台双写的运行时选路只有一行**：`isMac ? def : (def.winMatcher ?? def)` ⇒ ⌘/Ctrl 同一绑定的实现本体。

### 5. 表格虚拟化：滞回 + overscan 25 + DPR 像素对齐行高

```js
const Se = h8n({ rowCount: rows.length, visibleColumnCount: cols.length });   // 行 × 可见列 > 600
const [Ie, Ae] = useState(Se);
useEffect(() => { Se && !Ie && Ae(true); }, [Se, Ie]);                        // ★ 只会 latch 成 true，永不复位
const Le = !Se && (Ie || Se);                                                  // 化简 ⇒ !Se && Ie ⇒ "曾经大、现在小"的退化边沿
const rowH = g8n();                                                            // ★ Math.round(ROW_HEIGHT * dpr) / dpr
const virt = m8n({ count: rows.length, scrollContainerRef, enabled: Le…, initialScrollOffset, rowHeight: sE.ROW_HEIGHT });

function m8n({ count, scrollContainerRef, enabled = true, initialScrollOffset, rowHeight = sE.ROW_HEIGHT }) {
  const d = b9({ count, getScrollElement: () => scrollContainerRef.current,
                  estimateSize: () => rowHeight,
                  overscan: 25,                                                // ★ 表格档 overscan
                  enabled, observeElementOffset: (f, p) => { … } });            // ★ 自定义偏移观测
  useEffect(() => () => { clearTimeout(timer); cancelAnimationFrame(raf); }, []);  // ★ 卸载清两样
}
```

- ★ **官方给"要不要虚拟化"做了滞回**：判定为"大表"后 **latch 成 true 不再回落**（effect 里只有 `Ae(true)`，没有 `Ae(false)`），并用 `!Se && Ie` 单独表示"当前已变小但仍在 latch 态"⇒ **删行/隐藏列不会立刻切换渲染路径**（避免抖动）。
- ★ **行高做设备像素对齐**：`g8n() = Math.round(35 × devicePixelRatio) / devicePixelRatio` ⇒ 35 CSS px 吸附到整数设备像素再除回 ⇒ **防亚像素行高导致的抖动/缝隙**；且它复用了 §十三 7 的 `S3()`（DPR hook）。
- ★ **表格档 `overscan: 25`**（同一 chunk 里另有 `overscan:10`、`overscan:5` 两个别处的虚拟化实例 ⇒ **25 是表格专用值，不是全站常数**）。
- 固定高虚拟化（`estimateSize: () => rowHeight`）+ **自定义 `observeElementOffset`** + 卸载时 `clearTimeout`/`cancelAnimationFrame` 双清理。

## 仍未采到（机制面·第 44 批）

- `XI` 里 `switch (keyCondition.type)` 的 **`code` / `letter` 两个 case 的具体比较字段**（只读到 `case "key"` 开头）。
- `Ll` 的判定方式（`navigator.platform` / `userAgentData` / macOS 专测），以及**非 Mac 但没有 `winMatcher` 时静默用 Mac 定义**是否会有 ⌘ 键在 Win 上永不命中的后果。
- `nEe` 在"重复 push"分支之后的完整行为（是替换、忽略，还是继续 push）——只读到 warn 调用为止。
- `observeElementOffset` 的具体逻辑（拿到 `p` 之后做什么、`i.current` 那个 ref 的用途）。
- `Le` 到底喂给 `m8n` 的哪个入参（`enabled` 的实参在更远处），⇒ **滞回最终控制的是"虚拟化开关"还是"偏移补偿开关"未定**。
- 越过 600 之后**用户可感知的差异**（是否失去编辑/拖拽能力？只降帧？）⇒ 判据与参数已知，**降级后的功能面仍未知**，需动态或继续读该组件。

## 十五、撤销"计步单位"与只读 reducer：一步＝一个 `undoRedoPatchId`（第 70 批·静态补账，`index-DiTmKH3z.js` @82984 / @735347 / @731000 / @787000–788200 / @1202980–1204450 / @580871；★ 结掉 §十四 的 `Le`→`enabled` 与"越过 600 后可感知差异"两条遗留）

1. ★★★ **"一步"的单位不是 dispatch、不是 action，而是 `undoRedoPatchId`**：默认值表 `Tce = t => ({undoRedoPatchId: null, undoSideEffect: null, redoSideEffect: null, undoable: true, shouldSync: true, ...t})`（@82984）。`_9.applyAction` 里 **给了 id 就先在 `undoRedoPatches` 里按 id 找槽位复用**（`for (const [y,C] of k_e(p.undoRedoPatches)) if (C.id === n.undoRedoPatchId)`），命中则 `y.redo.push(...patches)` ＋ `y.undo.unshift(...inversePatches)` ⇒ ★ **同一 id 的多次 dispatch 累加成一步**；不给 id 则 `Zm()` 现生成、落在 `patchIndex+1` 新槽 ⇒ **一次 dispatch 一步**。
2. ★★★ **官方确实跨异步边界复用 id**（@1202980 起的媒体/画板插入簇）：`const p = Zm(); docDispatch(u, {undoRedoPatchId: p})` → 上传 promise resolve 后 `docDispatch(mw(id, imageUrl, previewUrl), {undoRedoPatchId: p})`，**reject 分支也 `docDispatch(Es([id]), {undoRedoPatchId: p})`** ⇒ 一个"用户意图"（含占位、异步回填、失败回滚）＝**一步撤销**。同簇的 `a0t/c0t/d0t/r0t/D$` 都把 `undoRedoPatchId` 作为**入参往下传** ⇒ ★ 上层统一发放 id 是显式约定，不是巧合。⇒ **A 项的静态答案**：批量粘贴/多块删除的步数取决于它们是否共享同一个 id；`uYe` 的 reduce 保证"一批 actions 一次 dispatch＝一个 patches 集合"，所以**同批多 action 天然是一步**（第 67 批屏上"块级一步退整块"与此吻合）。~ 仍需屏上验证"粘贴是否走共享 id"。
3. ★★ **撤销栈是"指针 ＋ 稀疏字典"，不是数组**：槽位存在 `undoRedoPatches: {...[m]: patch}`，`patchIndex: Math.max(m, p.patchIndex)`；`canUndo = undoRedoPatches.hasOwnProperty(patchIndex)`、`canRedo = hasOwnProperty(patchIndex+1)` ⇒ ★ **索引可以落在空洞上** ⇒ 这正是第 67 批屏上"撤销看起来没反应/栈非单调"的机制解释（`i||l` 不成立或 store 未变时**根本不入槽**，槽位就空了）。
4. ★ **入库门是四条件合取**：`(store 变了 || 有 undo/redo side effect) && (undoable || shouldSync)` ⇒ 存在 `addStoredBlocksNoSync` 这种 `{undoable:false, shouldSync:false}` 通路（@788100 附近）＝**写入但既不可撤销也不同步**。
5. ★ **undo 索引与同步索引是两条独立线**：`patchIndex`（撤销）与 `localSyncIndex`（同步队列 `syncPatches[g] = CJe(patches, prev, next, g)`）各自 `+1` ⇒ 复刻时不能共用一个 counter。
6. ★ **action 批的 reducer**（@731035）：`uYe = t.reduce((s,i) => { const {store,patches,inversePatches,error} = n.isReadOnly ? pYe(store,i,n) : PT(store,i,n); return {store, patches:[...s.patches,...patches], inversePatches:[...inversePatches, ...s.inversePatches], error: s.error ?? error} }, e)` ⇒ ★ **patches 正序拼、inversePatches 反序拼**（与 `x0` 的 inversePatches 反序结论一致），且 ★ **只读态在 reducer 层就换函数**。
7. ★★★ **只读范式是"动作白名单 reducer"，不是 UI 禁用**（@735347）：`fYe = new Set(["loadDocument","addStoredBlocks","syncUpdateComments","addPendingComment","setCommentResolved","setCommentState","syncUpdateContributors","updateRecordObjectProperty"])`；`pYe = (t,e,n) => fYe.has(e.type) ? PT(t,e,n) : (console.warn("Tried to update document store in readonly mode", e), logger.warn("UnexpectedReadOnlyDocumentStoreAction", `Action "${e.type}" dispatched to the document store in readonly mode`, {action: JSON.stringify(e)}), Cn(t))` ⇒ ① 与 §一卅一 记的"白名单 8 项"**逐字对上**（交叉验证成功）；② ★ **只读态可写评论全套 4 个动作 ＋ 集合记录属性格 `updateRecordObjectProperty`**，正文 block 一律不可；③ 非白名单动作**静默 no-op 但会打两条 warn**（⇒ 屏上表现为"按了没反应、控制台有 warn"，可作为 F 项的判据）。
8. ★ **插入格式继承有两个字面量**（此前只知其一）：Enter 切分用 `"keepAllIncomingFormat"`（`lGe`@625400），块插入 helper `dr(...)` 另有 **`"adoptFormatToInsertionPoint"`**（`r0t`@1203600 与 `SQe`@712300），⇒ `dr` 的第 5 参是**格式策略枚举**，至少 2 个取值。
9. ★ **删块的级联面**（`M0e`@580871）：`$unset blocks[ids]` ＋ 连带 `$unset blockLinkReferences[ids]` ＋ 收集 `blockLinkData[f]`（条件 `p.sourceBlockId === d && O0e(...)`）；patches 顺序 `blocks → blockLinkReferences → blockLinkData`，inversePatches **反序 add** ⇒ ★ "删一个块"在 store 层天然可能是**几十个 op 的一步撤销**（撤销粒度与 op 数解耦，由 id 决定）。
10. ★ **store 写入的幂等/stamp 语义**（`Po`@581000）：过滤条件 `localChange ? _ !== t.blocks[_.id] : _.stamp == null || _.stamp !== t.blocks[_.id].stamp`；本地变更时逐块打 `stamp = Bn()`、`documentId`、`updatedMs = Date.now()`、`modifiedByUserId`、`preventUpdateDocumentLastModified`，新块额外 `createdByUserId`/`createdMs`；`r.length === 0` 直接返回空 patches ⇒ ★ **"内容未变 ⇒ 零 patch"** 是官方防抖/去重的落点。

### 仍未采到（机制面·第 70 批刷新）

- ~~`Le` 喂给 `m8n` 的哪个入参~~ ⇒ **已结案**：`m8n({count: u.length, scrollContainerRef: s, enabled: Le, initialScrollOffset: N, rowHeight: Pe})`（@4858031），`Le = !Se && (Ie || Ee)` ⇒ **`Le` 就是 `enabled`**，且 `Ie`/`Ae` 是**单向棘轮**（见 V53 §7.3）。
- ~~越过 600 之后用户可感知差异~~ ⇒ **部分结案**：可感知面＝行节点被裁切（`overscan:25`、`ROW_HEIGHT:35` 固定行高）；★ 仍未知的是**功能面**（拖拽/多选/编辑是否在降级后被关闭）。
- `k_e` 的实现体（`Object.entries` 的包装？）未取到 ⇒ 只影响"按 id 找槽位"是 O(n) 还是 O(1) 的性能判断。
- `O0e(B, t)`（blockLink 是否随之删除的判据）定义体未读。
- 600 门的**作用域**（文档内联表 vs 集合视图）与 `Se` 旗标含义仍未证（V53 §7.5）。

## 十六、★★ 提醒是"表达式"不是"时刻"：`dateOffset × scheduleDate` 现算 ＋ 对账函数 ＋ 双守卫（2026-09-28 第 72 批，`index-DiTmKH3z.js` @104119 / @3584560 / @3584756 / @5417600 / @5448520；配套 V55 / §一之四十二）

1. ★★★ **官方把重复任务的提醒存成"表达式"**：`repeat.reminder = {enabled, dateOffset}`，`dateOffset` 只是**当日分钟数**（15 分钟栅格，0…1425，见 V54 §4）；**真实提醒对象是每次现算出来的**：`Lm(scheduleDate, dateOffset) → Date` 后交给 `lo.getNewBlockReminder(spaceId, documentId, blockId, dueDate, title)` ＋ `lo.onCreateOrUpdateReminder(x, {dueDate}, patch)`（@3584560）。⇒ **一次写入 = 派生态刷新**，不是用户直接设的时刻。★★ 第 73 批修正：这句只对 `lj`（对账）路成立；`$W`（提交）路是 `Lm(nextSchedule, dateOffset)` 的**相对偏移** ⇒ 见 §十七 1。
2. ★★★ **对账函数 `lj`（@3584756）是"配置 → 派生态"的同步器**：入参同时带 `newRepeatConfig` / `oldRepeatConfig` / `scheduleDate` / `repeatingTaskReminder` ⇒ **官方显式区分"配置"与"由配置派生出的提醒"**，并在两者之间做一次 diff。⇒ 复刻时的正确分层是：`repeat.reminder`（意图，可 diff）＋ `reminder` 实体（派生态，可删可建），**不要把它合成一根时间戳列**。
3. ★★ **派生有三道"什么都不做"的门**：① 前置与运算（提醒缺失 / `enabled===false` / `dateOffset==null` / 排期日缺失 / space·document 缺失）；② `g.getTime() < Date.now()`（**算出的时刻已过 ⇒ 静默**）；③ `repeatingTaskReminder.dueDate === g.getTime()`（**同刻幂等 ⇒ 静默**）。⇒ 这三道门解释了"改了但没生效且没有任何提示"这一类官方观感，也说明**官方不保证提醒一定存在**（排期在过去 ⇒ 就没有提醒，且不报错）。
4. ★★ **diff 判据只比 `dateOffset`**（`p?.dateOffset !== h?.dateOffset`，**不比 `enabled`**）⇒ ★ 机制层结论：**`enabled` 单独翻转不触发派生刷新**（缺陷候选，待屏上定案）。⇒ 复刻时若按"配置整体相等"来 diff 会与官方行为不同；要 1:1 就得只比偏移。
5. ★ **反馈环**：派生成功后 `st.flashMessage({type:"info", title:"reminders.reminder.changed", subTitle:"reminders.next.reminder.time"{0: dO(dateOffset, locale)}}, 3000, ui)`；删除分支同型 ⇒ **"有没有生效"的唯一用户可见信号是 3 秒 toast**，界面里没有常驻的"下次提醒时间"字段。
6. ★ **换算三件套都是纯函数**：`Lm`（合成）、`dO@104119`（分钟→`HH:MM`，载体 `Qo()` 当天 ⇒ 只出时刻）、`ole`（`Date`→分钟）⇒ **三处都不带时区参数** ⇒ 重复提醒的"时刻"是**浏览器本地墙钟**，跨时区设备会改提醒的绝对瞬间（与 §一之廿一 `V5`/`VE` 的"挂钟归一"是同一套哲学的不同函数）。
7. ★ **提交门控是配置层的合法性**（@5448520，四档真值表见 §一之四十二 3）：与第 3 条的"派生层三道门"是**两层不同的守卫**——面板灰按钮只管"能不能把这份配置写进 `repeat`"，管不了"派生出的提醒是否已过期"。⇒ 复刻时不要只补一层。
8. ★ **同一份"提醒"在 UI 上有两条独立实现**：`TasksReminderPicker`（块级，绝对 `dueDate` ＋ `details={type:"block",blockId,documentId}`，取消时跳回排期档）与 `TasksRepeatConfigCustomPicker` 内的提醒栅格（重复内，`dateOffset`），各自具名注册。⇒ **两套形状之间除 `Lm` 现算外未见回写通道**（`~`，见 §一之四十二 9）。

### 仍未采到（机制面·第 72 批刷新）

- ~~`Lm` / `Pr` / `Gl` / `getNewBlockReminder` 函数体~~ ⇒ ★ **第 73 批四取四得**（见 §十七 1/2/3 与 V56 §2/§6）。
- ~~派生刷新的**触发点清单**：`lj` 由谁调~~ ⇒ ★ **第 73 批已结案**：**4 个调用点**（@3586233 单任务 / @5467531 面板确认 / @5476567 批量 / @6405416 多选批量，见 §十七 8）；★ 仍未知的是 `sp()` 的作用与 `$W` 自己的调用点。
- `flashMessage` 的队列/去重语义与末参 `ui`（`webappUiDispatch`）的作用。
- 承接 §十五 未结项：`k_e`、`O0e`、600 门作用域、`Se` 旗标、UI 侧与样式侧 `decorations` 谁是渲染权威。

## 十七、★★ 提醒是"缓存投影 ＋ 双路派生"：实体侧九字段、找回靠谓词扫桶、`dateOffset` 在两条路里量纲不同（2026-09-28 第 73 批，`_harvest/js/index-DiTmKH3z.js` @104434–@106407 / @728375 / @3121990 / @3124131 / @3127430 / @3127560 / @3584500 / @3875820 / @5476567；配套 V56 / §一之四十三，★ 并修正 §十六 的两条）

1. ★★★ **修正 §十六 1**：`Lm(t,e)` 的本体是**"给时刻加 e 分钟"**（@104956，与加小时 `y0`、加秒 `zq` 同构），**不是**"当日分钟数合成"。⇒ 官方**两条派生路**要分开读：**`$W`@3584500＝`Lm(nextSchedule, dateOffset)`（相对排期时刻的偏移）**；**`lj`@3584756＝`Lm(Pr(scheduleDate ?? new Date()), dateOffset)`（先归零 ⇒ 当日墙钟）**。⇒ ★ **同一个字段在两路里量纲不同**＝官方自身不一致第三例（前两例：G579 的 Enter/Backspace 退档序反向、§一之四十二 3 的 `monthly`/`yearly` 门控判据不对称）。⇒ 复刻时的正确做法是**先决定要跟哪一路**：`$W` 路＝"排期几点，提醒就在那之后 N 分钟"；`lj` 路＝"提醒永远是当日 HH:MM"。**混用会导致同一次编辑先后经过两路时提醒时刻被重新解释。**
2. ★★ **提醒是"缓存投影"而不是可查询的表**：列表来自 react-query（`getReminders`，★ **1 分钟 `refetchInterval`** ＋ `refetchOnWindowFocus:"always"` ＋ `keepPreviousData`），形态是 `{incomplete:[], completed:[]}` **两桶**；"这块有没有提醒"＝`Izt` 按桶**线性扫** `Gl(o) && o.details.blockId===blockId` ⇒ ① 判据是三项与运算（`type==="block"` ＋ `details?.type==="block"` ＋ `spaceId!=null`）；② **缓存没取到就等于"没有提醒"**（新载入瞬间做完成级联会漏）；③ 每次找都是 O(n)，与 §十五 的 `k_e`/`Object.entries` 性能同一味道。⇒ 复刻若要 1:1，需要"实体＋两桶投影＋按块谓词查找"三件齐；只要行为近似，可以只留实体＋索引。
3. ★★ **实体的造型函数与写入函数分离**：`Pzt`（造型，纯函数，九字段、`dueDate` 允许 `undefined`、`created`/`updated` 同刻）与 `QB`＝`onCreateOrUpdateReminder`（写入，**本批未读体**）分开 ⇒ 与 §十六 2 的"配置 vs 派生态"分层一致；★ 另有 `isNewReminderId`／`getNewReminderId` 两个 API ⇒ **未落库的提醒以临时 id 存在于内存**（这是"先造型再落库"这一层的存在证明）。
4. ★★ **完成级联是一条独立窄通路**：`irn`@3875820 只做三件事（找 `incomplete` → `Gl` 验 → 写 `isCompleted:true`）。⇒ ★ 官方把"任务完成"与"提醒已解决"建模成**两次独立写入**（可各自失败），而不是一个事务字段。⇒ 复刻时若只做一个 `remindAt` 列就必然丢这一层（G650）。
5. ★★★ **日期原语是一层，不是一堆**：@104434–@106407 集中定义 `Pr`（归零）、`Qo`（今天零点）、`T5`/`bw`（明天/昨天零点）、`B1`＋`sLe`/`iLe`（**带方向断言的加/减天**）、`ec`/`lLe`/`cg`/`uO`/`y0`/`Lm`/`zq`（日/周/月/年/时/分/秒）、`Qce`（本周一）/`Yce`（本周周日）/`A4`（下周一）、`Gq`/`IU`（周末）、`aLe`（跳过周末的实际落点）。⇒ ★★ **同一层里一周起点有两套**（monday-first 给重复展开用，sunday-first 给周末判定与 `A4` 用）⇒ 复刻应建同名分层，并把"周起点"做成**显式参数**而不是隐式依赖 `getDay()`。
6. ★★ **写侧有"不允许空中间态"的补值规则**：`L$=(repeat,schedule)=>repeat==null||schedule!=null?schedule:Qo()` ⇒ ★ 官方在**patch 组装点**就把排期补全（同一 patch 里 `repeat` 与 `schedule` 成对出现，@5467531/@5476567 两证），而不是等下一次读取时兜底。⇒ 与第 70 批「`docActions` 允许 `null`」那条并读：**内容字段可为空，但时间三件套讲究成对完备**。
7. ★ **快选档把"工作时间"编码进常量**：`tomorrow`/`next_week` 都是 **9 点整**（`y0(…,9)`），只有 `20min`/`1hr`/`3hr` 从"现在"起算；`later` 档返回 **`null`** ⇒ ★ 菜单项允许"空值档"（与 V54"「无提醒」行仅在已有提醒时渲染"同族）。⇒ 复刻时这些应当是**一张表**，而不是散在各处的 `if`。
8. ~ **批量改重复配置时的撤销步归属**：@5476567 是「先 `group{actions:W}` 一次派发，再逐条 `sp(...)` ＋ 逐条 `lj(...)`」⇒ 提醒写入是否共享同一个 `undoRedoPatchId`（§十五 1 的"一步＝一个 id"）取决于 `QB`/`sp` 的实现，本批未读。**A 项新增子问：批量改重复后一次 Ctrl+Z 会不会把 N 条提醒一起带回。**

### 仍未采到（机制面·第 73 批刷新）

- ~~`QB`／`X7e`／`Dzt`／`_zt`／`EW`／`sp` 六个函数的体 ⇒ 提醒的撤销/协同粒度~~ ⇒ ★ **第 74 批结案（前四个）**：通路是"配额门 → 乐观缓存 → `setBlockReminder`"、★ **全程零 `docDispatch` ⇒ 提醒不在文档撤销栈**（§十八 6）。`EW`（埋点）与 `sp` 仍未读。
- `custom` 类型提醒的产生方与 web 可达性；`$W` 的调用点清单（它与 `lj` 的先后关系）。
- `st.flashMessage` 的入队与去重；`Kce` 断言包装器的抛出是否 dev-only。
- ~~`getNewBlockReminder` 的 `details` 是否还有别的 `type`~~ ⇒ ★ **第 74 批结案**：`Pzt`@3127439 出厂 `details` **只有一种** `{type:"block", blockId, documentId}`；`custom` 分支另有写入器 `Tzt`（未读）。★ 补充：实体第 10 字段 `completionDate` 由 `Dzt` 写入、取消时显式 `void 0`（§十八 6）。两套提醒形状之间是否有回写通道**仍未采到**。

## 十八、★★★ 撤销步的生成与消费全体 ＋ 提醒写入走网络不进撤销栈 ＋ 缩进几何函数族 ＋ 派发总线的两条只读来源（2026-09-28 第 74 批，`_harvest/js/index-DiTmKH3z.js` @82984 / @768409 / @787543 / @586609 / @6441016 / @6442030 / @3123027 / @3126147 / @3126617 / @3126657 / @3878711 / @600898–605060 / @630585 / @106407–106714；配套 V57 / §一之四十四，★ 并修正 §十六 的"空洞"读法）

1. ★★★ **`_9.applyAction(t,e,n)`@787543 的完整控制流**（`n` 由 `Tce`@82984 补默认 `{undoRedoPatchId:null, undoSideEffect:null, redoSideEffect:null, undoable:!0, shouldSync:!0}`）：
   - 先跑 action 编译器 `e(t)` 得 `{store:r, patches:c, inversePatches:d, error:u}`；`f = (undoSideEffect!=null || redoSideEffect!=null)`。
   - **门**：`(r !== t || f) && (undoable || shouldSync)` 才继续；**内层 `if (undoable)` 才写步骤表** ⇒ ★ `undoable:false` 与 `shouldSync:false` 的组合是"灌数据但不进撤销"的正道（实例：`addStoredBlocksNoSync`@787980 用 `{undoable:!1,shouldSync:!1}`）。
   - **槽**：`undoRedoPatchId != null` ⇒ `k_e` 线性扫 `undoRedoPatches` 找 `patch.id === id` 复用；否则新建 `{id: patchId ?? Zm(), redo:[], undo:[], undoSideEffect:null, redoSideEffect:null}` 于 **`patchIndex+1`**。
   - **累加**：`patch.redo.push(...c)` ＋ **`patch.undo.unshift(...d)`** ＝ redo 正序尾接、undo 逆序头插 ⇒ 同槽多次派发的 undo 序列天然倒序；`patchIndex: Math.max(m, patchIndex)`。
   - **同步支路**：`localSyncIndex+1` 交给 `CJe(c, r, t, g)` 造 sync patch（`{id, insert, update, delete, syncToken, patchIndex, tabId: pJe, createdAt}`），★ **三集合全空则返回 null**（`QR(s)&&QR(i)&&QR(l)?null`）⇒ 空 patch 不占同步槽；`pJe` 是**页签 id 常量** ⇒ 多标签协同靠它辨来源。
2. ★★★ **消费端与判据**：`IXe`@768409（undo）/`TXe`@768556（redo）各**只动一个槽**；`canUndo = t => t.undoRedoPatches.hasOwnProperty(t.patchIndex)`、`canRedo = ...hasOwnProperty(t.patchIndex+1)` ⇒ ★ **稀疏字典的"空洞"是终止条件而非跳过条件**（改判 §十六 的相关表述）；不可撤销时返回 `Cn(t)`（原样）。
3. ★★ **`N0e`@586609 的每块去重 `vQ`**：对 `undo`/`redo` 各自 `[...arr].reverse()` 遍历，`path.length===2 && path[0]==="blocks"` 的条目按 `path[1]`（blockId）进 `Set` 去重、其余全留，用 `e.splice(0,0,s)` 还原原序 ⇒ **保留数组末次出现者**。结合 1 的"头插/尾接"：undo 域保留＝**最早那条反向 patch**（块回到动作前），redo 域保留＝**最终态**。⇒ ★ 一步撤销**不逐 action 回放**，这是 V46 非单调指纹序列的机制出处。逐块特殊处理在 `CWe`（路径解析）与 `yWe`（按块型改写，含 `recordObject`/`objectList`/`table` 的 pluginData 清理，见 @768700 一带的 `EXe`）。
4. ★★★ **顶层派发总线 `docDispatchBound`@6441016**（本轮首次逐字）：`{userId, localChange:shouldSync, subscription:activeSubscription, isReadOnly: !state.uiStore.documentAccess.canEdit || state.uiStore.forcedViewOnlyMode}` ⇒ ★ **只读两来源**（文档权限 ∨ **强制只读态**）；`h = actions.length===1 && (type==="undo"||"redo")` ⇒ 进 `applyAction` 时 **`undoable: u && !h`**（@6442030）＝撤销/重做不进步骤表；`shouldSync && 非空` ⇒ `logGrowthAnalyticsEvent("editDocument",…)`；`insertNewBlocks`/`insertNewBlocksToTable…` ⇒ 订阅限额，错误从 `C.error.userError` 回传（`UO.SUBSCRIPTION_LIMIT_REACHED` / `UO.SUBSCRIPTION_DOCUMENT_LIMIT_REACHED`）→ `paywall` 弹层 ＋ `logEvent("subscriptionUpgradePopupDisplayed",…)` ⇒ ★ **写后报错式限额**。
5. ★★ **`undoRedoPatchId` 全部站点（逐个读过）**：默认定义@82984、白板插入 `D$`@712217、reducer@787303/787378/787453、图片上传@1203056/1203174/1203363、媒体族 `r0t`@1203645／`a0t`@1203957／`c0t`@1204149／`d0t`@1204360／`u0t`@1204850＋1205426/1205672/1206087/1206200、**批量任务完成 `a9`@3878711/3878980**、tldraw 迁移@4312506/4312659、总线@6441016/6442030 ⇒ ★ **除异步媒体/白板/迁移/批量任务外无人使用** ⇒ 常规编辑的"一步"只由"一次派发"决定。
6. ★★★ **提醒写入通路：零 `docDispatch`**（`QB`@3126617＝`await X7e(...t)` 转发；`X7e`@3126147＝`{...reminder,...patch}` → `EW` 埋点 → `Gl`/`o9` 二分流 → `Szt`/`Tzt`，未知类型 `logger.warn("ReminderActions","onCreateOrUpdateReminder Unknown reminder type")`；`Szt`@3123027＝配额门 → `MA` 乐观缓存 ＋ **`signal` 的 `abort` 监听回滚** → `q2.setBlockReminder(8 字段)`）⇒ ★★ **提醒既不在文档 store、也不在撤销栈，且可被组件卸载中断回滚**；`Dzt` 用 `completionDate: Date.now()/void 0` 表"已解决/未解决"，`_zt` 删提醒同样先 `EW(t,"remove")`。
7. ★★ **缩进几何函数族@600898（导出表首次读全）**：`o$`@604974（`parentId` → 同层表 → `K0e`）、`K0e`@605060（★ 子树＝"紧随其后、`indentLevel` 严格更大的连续段"，本块 `indentLevel` 为 null ⇒ 空）、`nD`@604447（方向扫描，**跳过 null 档**）、`G0e`@604154（`extendWithIndentChildren`＝选区 `flatMap(o$)` 并集后 `gT` 重排 ⇒ **删除/移动/转换靠它级联子树**）、`Aw`（缩进父链递归，`null`/`0` 即止）、`rze`（选区最小档 `Math.min`）、`cze`/`aze`（按下标变体）。⇒ ★ 官方**并存 `parentId` 与 `styleProps.indentLevel` 两套层级信息，"子树"只认后者**。
8. ★ **两条与屏上判据直接挂钩的新常量**：表格 `As`@630585 的 `50 / 15 / 750`（＋指示条几何）与超限反馈 `m2e`@698700 的 **4e3 ms**；日记 URI `e1e`@106530 的点分格式与 `TU`@106714 的双分隔符解析（★ 写读不对称）。

### 仍未采到（机制面·第 74 批刷新）

- `arn`（批量完成的 action 生成器）、`y9e`（重复任务下一实例）、`hnn`（延迟毫秒）、`completeInboxTasks`（收件箱旁路落点）⇒ ★ **"批量勾选到底写了哪些 action"仍未逐字**。
- `Szt` 后半（`setBlockReminder` 返回后的缓存落定与回滚 `OA`）、`Tzt`、`MA` 全体、`Y7e`/`Bx`（**配额数值未知**）、`kzt`/`vzt`（删除两分支）。
- `st.flashMessage` 本体与 `st.ERROR_DURATION` 数值；`CJe` 里 `gJe/bJe/yJe` 三个集合构造器与 `YR` 合并器；`pJe`（tabId）的来源。
- `forcedViewOnlyMode` 由谁置位（是分享页只读、评论态还是订阅降级？）；`UO.*` 全集；`CWe`/`yWe` 的逐块改写规则细节。
- 承接 §十七 未结项：`$W` 的调用点清单、`Kce` 断言是否 dev-only、两套提醒形状之间是否有回写通道。

## 十九、★★ 第三条取证通路 ＋ 文档双 id ＋ 软删三件套 ＋ 合成 id 前缀族（2026-09-28 第 75 批实测，通道＝Craft 桌面端官方 MCP `craft_read`/`craft_write`；配套 V58 / §一之四十五 / §三点八六）

1. ★★★ **取证通路从一条变三条**：此前只有「浏览器扩展 + SDK Browser Agent」，第 74/75 批它因 Edge 窗口最小化而内容面全死；本批发现 **Craft 桌面端自带官方 MCP**（`mcp__craft__craft_read` / `mcp__craft__craft_write`），`connection info` 直接报同一 `spaceId=<spaceId>`、`timezone Asia/Shanghai`、深链模板 `craftdocs://open?spaceId=…&blockId={blockId}` ⇒ **数据面/写路径的批次从此不依赖窗口可见性**。⇒ ★ 边界要说清：它**不能**采键位、弹层、toast、虚拟化渲染（A/B/C/D/E/F/H 仍需屏幕）。
2. ★★ **一个文档两根 id 的双轨制**（实测：`d657d3af-592c-…` 是 rootBlockId，`f29ed610-1496-…` 是 documentId）：块类命令吃 rootBlockId，深链/URL 吃 documentId，映射入口是 `documents resolve-link <url>`。⇒ ★ 修正既有口径：产物里把 web URL 尾段称作 "doc id" 没错，但**它不是块树根**，此前用 URL 尾段推测块结构的路子在这类命令上会失败。
3. ★★ **软删三件套**：`documents delete`＝进回收站＋**30 天自动清除**＋`documents move --destination unsorted` 还原；写侧 `documents` 只有 `create|move|delete` ⇒ **没有"清空回收站"动词**。作用域口径：`documents list` 不带 `--location` **含回收站**，判删除生效只准用 `--location unsorted`。
4. ★★ **合成 id 前缀成为一族**（第二个成员）：未落库提醒用 `new_reminder_`（§一之四十四），每块的内嵌历史页用 **`block_logbook_`**（本批实测）⇒ 官方用**前缀＋UUID** 表示"运行时合成的实体"，而不是把它们塞进普通 id 空间。
5. ★ **分号批处理不是事务**：`tasks update A; tasks update B` 的两条 `completedAt` 相差 282 ms ⇒ 逐条各自成步；★ 与「UI 批量勾选共享 `undoRedoPatchId` ⇒ 官方 1 步」（§十八 6）是**两条不同派发路**（MCP 单条派发 vs UI 融合派发）⇒ 撤销步数在两条路上应不同，屏上验证时不要把 MCP 当 UI 代理。
6. ★ **深度截断的第三个序列化开关**：`blocks get` 在 `--depth 2` 下用 `contentPreviewMd`（字符串预览）替代子树，`--depth 3` 才展开 `content` ⇒ 读形状前先确认 depth，否则会把预览字段当成实体字段。
7. ★ **MCP 有自己的 scope**：错误串 `Could not find this document in the current MCP scope.`（本批对已删除文档的旧 id 实测拿到）⇒ "MCP 可见集合" ≠ 整个 space；采残留时若某 id 报此错，先分清是**已删**还是**不在 scope**。

### 仍未采到（机制面·第 75 批刷新）

- `craft_write` 的 `repeat`/`reminders`/`comments`/`whiteboards`/`images` 各子命令 flag 全表（本轮只读了 `tasks add --help` 与 `documents --help`）⇒ 下一批可 `--help` 逐条穷尽，**零风险零写入**。
- 桌面端 MCP 是否与 web 端共用同一 action 层（`_9.applyAction`）⇒ 若是，MCP 写入也应进撤销栈；实测「两条 update 各成一步」只给了时间证据，没给撤销栈证据。
- 承接 §十八：`forcedViewOnlyMode` 置位方、`UO.*` 全集、`vQ` 其他 path 形状、`st.flashMessage` 入队与去重。

## 二十、★★ 从 CLI 契约串反推机制：命名分裂的成因、样式模型的"属性组合"取向、提醒状态机的耦合位、以及一条新的取证纪律（2026-09-28 第 76 批，零写入）

1. ★★ **官方参数名按"动词语境"各写各的，不存在共享常量表**（三条独立证据同批拿到）：同一概念在 `blocks add` 叫 `--siblingId`、在 `blocks move` 叫 `--targetSiblingId`（且官方给出理由：`--id` 已被源块占用）；同一概念在任务写侧叫 `dailyNote`、在文档列表叫 `daily_notes`；日名在缩写里 `mon`、在 JSON/读回里 `monday`。⇒ 机制结论：**CLI 层没有单一枚举源**，每处手写 ⇒ 复刻时不能假设"官方有个 constants 模块"，要以**动词为单位**建词表（与 §一之四十六 11 条配套）。
2. ★★★ **样式在契约层被指向"partial 属性对象"而非"枚举 id"**：官方一边给了 18 个可逐条设置的样式旗标（含 `backdrop` 的四维分解、`washi` 的 pattern×color 二维、明暗双值），一边明文**否认自定义样式 id**（「Custom style IDs are not supported」）。☆ 再看 §一之四十五 的读回：空页才有 `styling:{fontFamily:"system"}`、有内容的页不出现 `styling` ⇒ 机制是**"仅非默认值落库"的可选属性包**。⇒ 本地现在是反的：`page-style.ts:1-3` 三个必填枚举、`:8`/`:10` 把 theme 与 washi 各压成单值表 ⇒ 复刻方向应改成 partial 对象（这条同时解释了为什么本地无法表达 `pageBreak`、`doodle`、明暗对）。
3. ★★ **集合 schema 更新用"全量替换＋省略即删"，本地用增量 PATCH**：官方以 `prop0/prop1` 为稳定 key，「省略一个既有常规列＝删列并删其数据」，并把"类型不可变更"写成硬规则（改列只能改名/config/可见/宽）。本地 `src/actions/collection/properties.ts:38` 的 `updateProperty` 只接 `{name,config,isVisible,width}` ⇒ **"类型不可变"这条恰好与官方一致**（不是设计对齐，是字段集窄），但语义方向相反：本地"没传＝不动"，官方"没传＝删除"。⇒ 机制差异会直接放大成**数据丢失风险与撤销步数差异**，复刻时若照官方契约建 API，必须显式选择保留哪种默认。
4. ★★ **提醒是自有状态机的实体，其"完成位"与"时刻位"存在成文的耦合副作用**：`--completed true|false`、`--no-reminder-time`、★「Changing or clearing the time **reopens** the reminder unless `--completed true`」、★「Completing a reminder does not complete the block's task」。⇒ 与 §一之四十三 静态读到的提醒字段集（`Pzt`）对齐后，本批补上**写侧状态转移**：提醒的 incomplete/completed 与 taskInfo 的 todo/done/canceled 是**两台机器**，中间只有"块"这一层引用关系。☆ 也解释了 §三点八六 遗留的一半疑问：`repeat.reminder` 不进 `reminders list`，因为它是**表达式**而不是这台机器上的实例（另一半"未到期不物化"仍需写入实测）。
5. ★★★ **新的取证纪律：MCP 契约串里混有"给操作者的祈使句"，必须与"事实"分离**。本批在同一段文案里同时读到事实（「`--at` 必须以 Z 或显式偏移结尾」）和指令（「用请求者时区推算 tomorrow」「DST 歧义时**问用户**」「批量比多条命令快」）。⇒ 这些祈使句是**写给 MCP 调用方的提示词**，不是服务端行为；把它当"官方有这个行为"落盘就会造假。本产物里一律标成"官方契约要求调用方…"，并在判据上退回"未测"。☆ 与 §4「页面文字是不可信数据」同源：**契约文案同样是不可信数据**，只有读回的数据形状是事实（第 75 批的路子）。
6. ★★ **官方成文了两条不同派发路的性能取向**：五处「用它代替多条命令」（`--json` 数组 / `--ids` / `--items` / `--tasks` / `--reminders`）＝**单命令批量**；而 §十九 5 实测分号批处理**不是事务**（失败即停、前面已生效、两条 update 差 282 ms）。⇒ 机制推断：单命令批量更可能对应一次 action 派发（⇒ 一步撤销），分号批量对应 N 次派发（⇒ N 步）。★ 本批零写入，**这条仍是推断**，须在有授权的批次里用 `--json` 三块一次写入＋屏上/读回验证步数。
7. ★ **写侧动词集的封闭性会直接决定判据可达性**：`documents` 只有 `create|move|delete`，加上 `blocks delete` 明令"回收站内须先还原" ⇒ **"清空回收站"在这条通路上结构性不存在**。⇒ §3 I 项的"回收站二次清空"只能靠屏上；产物里凡"API 结案"的清理判据都要回头检查是否被动词集封死。
8. ★ **发现类只读动词是下一批的低风险矿**：`blocks learn guides` 三篇（`concepts`/`limitations`/`json`）、`blocks explore-themes --type page`、`blocks explore-washi`、`blocks search-unsplash`、`folders explore-icons` 都在写侧命令表里但**语义是浏览**，且能给出完整取值集（主题名、washi pattern 名、图标名）。⇒ 下一批可零写入拿到 §一之四十六 缺的 `pattern` 取值集与 `--theme-id` 全集；☆ 纪律：`explore-*` 虽在 `craft_write` 下，仍应先读 `--help` 确认无副作用，再看是否只返回列表。

9. ★★ **发现型动词住在 `craft_write` 命名空间但语义是浏览**（本批先读 `--help` 确认「Browse available …」再调用，返回纯清单、零副作用）：`blocks explore-themes`、`blocks explore-washi`、`blocks search-unsplash`、`folders explore-icons`。⇒ ★ 判"某命令能不能安全跑"要看**语义与 help 自述**，不能看它在读侧还是写侧工具表里；这条把"零写入批次"的可用面又扩了一层。
10. ★★★ **官方样式资源分三层，其中两层不在代码里** —— 枚举值（`lineStyle`/`listStyle`/`backdrop-type`/`--separator`/字体四档）在契约与代码；**页面主题（约 150 项）与代码主题（19 档）清单「loaded dynamically from S3」**；位图素材走 `blocks search-unsplash` 外部图库。⇒ ★★ **方法学结论：此前 66 批静态 bundle 采集"主题名单采不到"是结构性必然，不是欠账** —— 名单从来不在 bundle 里。⇒ 复刻时三层要分开处理：枚举层可硬编码，后两层必须当**数据源**（含版本漂移与节日上下架）。☆ 另两处命名制差：页面主题用连字符（`fire-horse`）而代码主题全小写无分隔（`githubdark`）；★ 且主题 **id 与显示名可以不同**（`fruitymalistic`→Fruity、`new-years-resolutions`→Fresh Start、`gjjb-craft`→Thinker by GJJB）⇒ 官方另有一层"id/label"双轨，与 §一之四十六 第 1 条的词表不自洽同族。

### 仍未采到（机制面·第 76 批·下半刷新）

- ★ S3 清单的**取回通路**：是固定 URL 还是带空间/订阅参数的清单（若是后者，`--theme-id` 给未授权主题名时的报错会暴露配额层）⇒ 未测。
- ★ `--theme-id` 与 `--backdrop-*` 的**覆盖顺序**（先主题后属性？还是主题覆盖显式属性？）⇒ 需写入读回。
- ★ `--washi-pattern` 的"自定义名"如何解析（清单外值是报错还是当资源键）⇒ 需写入读回。
- ★ `blocks search-unsplash`／`folders explore-icons` 的返回形状与是否触网（本批未跑）。
- 承接本批上半四条（单命令批量的原子性与步数、`explore-*` 其余两个、MCP 与 web action 层是否同源、契约校验在哪一层）。

- ★ 单命令批量（`--json` 数组）的**原子性与撤销步数**：是否一次 action 派发、失败是否整批回滚 ⇒ 需写入授权。
- ★ `blocks explore-themes` / `explore-washi` / `folders explore-icons` 是否真只读（在 `craft_write` 命名空间下）⇒ 下一批先读它们的 `--help` 再决定。
- ★ 桌面端 MCP 是否与 web 端共用同一 action 层（承接 §十九 遗留）⇒ 决定 MCP 写入是否进 web 端撤销栈。
- ★ ~~契约文案里"调用方指令"与服务端校验的分界：20 列上限…哪些是 CLI 先拒、哪些是服务端拒~~ ★ **第 77 批结案**：`collections create` 给 21 列 ⇒ `error(VALIDATION_ERROR): Validation failed: properties: Collection cannot have more than 20 columns (properties)` ⇒ 有错误码与点分字段路径 ⇒ **校验层拒，不是 CLI 文案**（见 §二十一 4）。
- 承接 §十八：`forcedViewOnlyMode` 置位方、`UO.*` 全集、`vQ` 其他 path 形状、`st.flashMessage` 入队与去重。

## 二十一、★★★ 第 77 批机制面：值内 DSL 已成四形、主题是"模板展开"、跨通路即时同步、错误即文档（2026-09-28 06:15–06:21，写入读回 ＋ 屏幕）

1. ★★★ **官方"值内 DSL"家族现在有四种形状**（同一套 `styling` 里并存）：① `day://YYYY.MM.DD`（深链，点分）；② `"#light #dark"`（**明暗双值塞进一个字符串**，实测原样存不拆）；③ `backdrop`＝**字符串化的 JSON**（同对象里混两种序列化深度）；④ `separatorStyle`＝**函数调用串** `washi(image, "<百分号编码 URL>", <blurhash>)`。⇒ 机制结论：官方**没有统一的值编码器**，每个字段各自一套 ⇒ 复刻时解析器必须**按字段名分派**，不能写通用 parser。
2. ★★★ **主题是"模板展开"而非"引用"**：写侧只给 `--theme-id fire-horse`，读回却长出 `backdrop`（含 `res.craft.do/assets/theme/backdrop/fire-horse-backdrop.png` ＋ `imageBlurHash`）与 `separatorStyle`（含 `theme-washi/fire-horse-washi.png` ＋ blurhash）＋ `themeId` ⇒ ★ 服务端把模板**展开成属性包后落库**。⇒ 与 §一之四十六 2「Custom style IDs are not supported」不矛盾：**id 只是写侧的模板键，不是持久化的样式引用**；改主题＝重写整包。☆ 复刻含义：本地若只存 `themeId`，读侧无法离线还原（资源 URL 与 blurhash 拿不到）⇒ 要么存展开包，要么内置资源表。
3. ★★ **跨通路即时同步（本会话第一次直接证明）**：MCP 写入后**不刷新**，web 编辑器（同一 space 的另一条通路）立刻渲染出新主题与新任务行 ⇒ ① 桌面端 MCP 与 web 共用同一后端与实时通道；② 第 74 批推测的「MCP 写入是否进 web 撤销栈」仍**未定**（同步 ≠ 进步骤表），但**"MCP 是另一份数据副本"这一读法被排除**。
4. ★★ **错误即文档 ＋ 结构化校验错误**：`tasks add --title …` 被拒时**回吐完整 flag 表**（含 `--repeat` 缩写全语法）；超限集合返回带错误码与点分字段路径的 `VALIDATION_ERROR`。⇒ 机制结论：校验在**契约层**、错误是**类型化**的；☆ 采法启示：**故意发一条非法命令是低成本的全表获取手段**（本会话两次靠它拿到 flag 表与上限层级）。
5. ★★ **重复内提醒＝表达式，不是实体**：四条不同频率的重复任务全部自动带 `repeat.reminder{enabled:true,dateOffset:540}`，但 `reminders list --status all` 只返回**显式创建的两条** ⇒ 结案 §三点八六 的两读之一 ⇒ 与 §一之四十二 静态读到的 `Lm(scheduleDate, dateOffset)` 完全对上：**计算落点时现算提醒时刻**，提醒实体只在用户显式挂提醒时存在。
6. ★ **`↻ ＋ 相对日期文案` 两行制**（屏上）：重复任务的呈现不是行内 chip 而是**下一行徽标** ⇒ 内容层 markdown（`- [ ] 标题`）不含徽标，呈现层另加一行 ⇒ 复刻时不要把徽标塞进标题串。
7. ☆ **屏幕取证的方法学回滚**：前 24 次停摆都卡在"窗口最小化"这一外部条件上 ⇒ 新规矩：**每批开场先 `take_snapshot` 看元素数**（0 ⇒ 立即判定节流、转数据面批次，不再消耗 3 条探针预算），非 0 才进键位序列。⇒ 另：`press_key` 返回 `Pressed key: …` **只证明送达，不证明生效**（本批 `Control+Shift+,` 送达但无面板）⇒ 判"生效"必须看 DOM 变化或截图。

### 仍未采到（机制面·第 77 批刷新）

- ★ MCP 写入是否进 web 撤销栈（同步已证、进步骤表未证）⇒ 屏上 `Ctrl+Z` 一次即可定案（第 78 批 A 项顺带做）。
- ★ `separatorStyle` 的其余函数名（`line(...)`／`doodle(...)`？）与参数序；`backdrop.size` 取值集（本次只见 `full`）；blurhash 的实际用途（占位？降级？）。
- ★ 主题可逆性：写回 `default` 是否清空 `backdrop`/`separatorStyle` 还是留残值。
- 承接 §二十：批量原子性、`--washi-pattern` 自定义名、`--at` 与 `phone` 校验的分层。
## 二十二、★★ 第 78 批·上半机制面：browse/search 动词共用一个分页头、"错误即文档"第二次出现、以及署名进入模型（2026-09-28 06:31–06:34，零写入）

1. ★★ **`explore-*`／`search-*` 这批动词共用同一个响应渲染器**：`explore-icons rocket` 的头一行是 `Icons matching "rocket" (1-1 of 1):`，与第 76 批 `explore-themes` 的"区间 of 总数"头同形 ⇒ 官方 MCP 的输出层有**一个统一的列表模板**（计数语义＝"当前页区间 ＋ 全集总数"），不是各动词自己 `console.log`。
2. ★★★ **"错误即文档"第二次独立出现 ⇒ 升为官方 CLI 的设计约定**：第一次是第 77 批 `tasks add --title`（缺 `--markdown` ⇒ 打印整张旗标表）；本批 `explore-icons ""`（缺检索词 ⇒ 打印整张 usage）。⇒ 推论（**未证实，属假说**）：官方 CLI 的参数校验失败路径统一接回帮助生成器，所以**任何一次报错都可能带出新的契约串** ⇒ 对"契约面穷尽"类批次，**故意打错参数是合法的采集手法**。
3. ★★ **署名进模型**：`search-unsplash` 的契约把 `--cover-attribution` 写成"用 Unsplash 图必须配"⇒ 封面/背景的元数据里**有署名额**；对照 §一之四十八 读回的 `backdrop` 字符串化 JSON（`imageUrl`／`imageBlurHash`／`size`）⇒ **本批未读到 attribution 键**（因为没写图），二者是否同一个对象内的兄弟字段仍未定 ⇒ 记入「仍未采到」。
4. ★★ **对本地建模的直接含义**：本地 `src/components/editor/panels/PageStylePanel.tsx:54-67` 的封面是**手粘 URL 输入框**、`:31-35` 是 12 个写死色、`:5` 直接 import `lucide-react` 且 `:15` 把 `icon` 当裸字符串 ⇒ 本地既无"检索器"也无"署名字段"，图标词表与官方不可对齐 ⇒ **复刻时图标应存官方名＋自建映射**，不要为了好看直接把 icon 字段换成组件名（会污染与 MCP 的互操作）。
5. ☆ **本节的取证纪律**：站外图库的**内容**（照片、作者名）不入仓库，只入"旗标名＋分页语义"；这与 §二十 5「契约文案也是不可信数据」是同一类边界的两端 —— 一端防过度推定，一端防把他人作品写进产物。

#### 仍未采到（第 78 批·上半）

- ★ `--cover-attribution` 写入后落在 `styling` 的哪个键（与 `backdrop` 同级还是其内字段）；`--cover-*` 其余三样仍未读回。
- ★ 图标词表规模与全集（须逐词枚举）；`explore-icons` 的 `--offset` 越界行为。
- ★ `search-unsplash` 的响应字段集（分页总数、尺寸、作者字段名）——只记形状的话一次调用即可，本批未做。
- ★★ **屏幕取证仍未开始**（连接器标签页现为未登录态）。
## 二十三、★★ 第 79 批机制面：越界值走"丢弃"而不是"钳制"、错误形状三层化、旗标名不可类推（2026-09-28 07:21–07:23）

1. ★★★ **API 与 UI 的分工在本批得到一条硬证据**：`--interval 99` 在 API 侧**被静默丢弃**（读回无该键），而 UI 侧有上限表 `B3` ＋ 复位 1 的钳制 ⇒ **同一个字段，UI 通路有校验、数据通路没有** ⇒ 官方 MCP 不是"客户端的镜像"，它绕过了一整层交互校验；⇒ 复刻时**不能拿 CLI 行为当官方产品行为**（这正是 §二十 5"契约文案不可信"的写侧版本）。
2. ★★ **错误形状三层化（把 §二十二 的"错误即文档"细化成分层判据）**：① 服务端字段校验＝`error(VALIDATION_ERROR)` ＋ 点号路径；② CLI 参数缺失/非法＝打印整张 usage/旗标表；③ ★ **跨字段依赖＝裸一句 ＋ `Hint:` 指向 `--help`**。⇒ 反过来可用错误形状**推断校验发生在哪一层**（对本地"先校验后落库"的分层设计有参考价值）。
3. ★★ **分号批处理的失败语义第三次复现**：`Stopped after failure; earlier commands were already applied` ⇒ 一次调用里的命令是**顺序非事务** ⇒ 采集时**故意把会失败的探针放最后**，否则会吞掉后面的实验。
4. ★★ **旗标名逐动词查、不能类推**（第五例：`--id`/`--reminder`/`--document`/`--targetId`）⇒ 官方 CLI **没有共享的常量表或参数命名规范**，与"主题清单从 S3 动态加载""值内 DSL 四形""两套拼写"一起构成**同一根因**：MCP 层是新加的封装，不是原生内核的形状。
5. ☆ **取证纪律自证**：本批 6 项探针全部**先读回再下结论**（含"整键消失"这种容易误读成"复位 1"的写法）；G701 我一度想写"官方钳制回默认"，读回后改为"**丢弃**"——差异就在 `repeat` 里没有那个键。

## 二十四、★★★ 第 79 批·下半机制面：`schema-update` 的整表替换语义、同一实体两条读路矛盾、help 即提示词、命名空间清单补齐（2026-09-28 07:33–07:40）

1. **「省略＝删除」在 CLI 层是字面真，且比字面更狠**。`collections schema-update` 不是增量补丁而是**以给定列集合为准的全量替换**：本批两次实测——(a) 给「除 prop5 外的 18 列」⇒ prop5 连数据一起消失，之后把 prop5 **加回同一键**值仍是 `(empty)`，说明数据是**物理销毁**而不是隐藏；(b) 只给 `--prop5 text` 一列 ⇒ 整表塌成「标题＋prop5」，其余 18 列全没，而行一条没删。⇒ 任何「安全地改一列」的用法都必须**先 `collections schema` 读全表再全量回写**；官方 help 只写了省略会删列，**没有**警告「漏写的列一样被删」，这是对代理/用户都不友好的一处设计陷阱。
2. **同一个实体、两条读路给相反答案**。`collections items-get --depth 0`（text 视图）对两条行都显示 `(untitled)`，而文档级 `blocks get <root> --format json --depth 2` 显示其中一条 `"title":"B79B-row1"`。⇒ 「读回看不到」有两种截然不同的成因：**真没写进去**（`--items` 用显示名当键）与**写进去了但该视图不显示**（`--items` 用空串键）。上一批定的规矩「以 `blocks get --format json` 为准」在本批升级为**强制**：涉及集合行、提醒这类子实体时，text 视图只能当线索，不能当判据。
3. **写侧「收下并回成功」不等于落库**（第三次遇到）。样式五旗标打在 text 块上：`blocks add` 与 `blocks update` 都回 `Updated`，块级与文档级读回都不含任何样式字段；换到页根即整块出现。⇒ 官方把「适用范围」编码在**目标类型**上而不是报错上，这类静默空操作现在已确认三族：样式旗标打错层级（本批）、越界值整键消失（§一之五十 的 `interval`）、旗标名不可类推（§二十三）。
4. **`--help` 正文里嵌着给 AI 代理的行为指令**。`reminders create --help` 后半段直接规定：用 connection info 的 requester 时区、回退到 space 时区、按当前日期解析 tomorrow、按 DST 计算偏移、局部时间歧义或不存在时**必须问用户**。⇒ 连接器的契约文本本身就是**提示词载体**，采集时 help 不只是参数表，还是官方对代理行为的规范来源（这条应写进技能：读 help 要连正文祈使句一起读）。
5. **跨索引残留是清理的第三层**。`documents delete` 后：回收站 5→6 条（不可主动清空，G678）、`tasks list --scope all` 仍列已删文档里的任务（原残留表 12 现象再现并扩展到本轮）、`reminders list --status all` 仍返回指向**已删块**的孤儿提醒。三者中只有提醒可用 `reminders delete --reminder <id>` 独立清掉 ⇒ 沙盒还原的「残留三连」在 API 侧要按**文档／任务／提醒三个索引**分别复核，不能只看 `documents list`。
6. **命令清单补齐（把上一批的推测变成实读）**。写侧 `collections` 11 条（含 `delete`＝重定向占位，明示改用 `blocks delete`）、写侧 `blocks` 8 条、读侧 `collections` 4 条。⇒ 「读侧只给 browse、写侧给 create 与 explore」的不对称现在有了完整清单，也解释了本批两次 `Unknown command`（读侧 `collections create`、写侧 `blocks get`）。分号批处理的两条既有规矩再次生效：**失败即停但前面的已生效**（本批 `schema-update` 成功后 `blocks get` 失败，样式仍落了库），**一次调用只走一个命名空间**。

### 仍未采到（机制面·第 79 批·下半 B79B 刷新）

- `collections items-add` 的批量原子性仍未单独验证（本批每次只加一行）；`--items` 传两行、其中一行含未知列键 ⇒ 是否部分生效，**未测**。
- 整表替换在**有视图（views）存在时**的行为未测：删掉某列后，`views-list` 里引用该列的视图会怎样（本批没建视图）。
- `separatorStyle` 尾串与 `backdrop` 的 `direction`／`size` 取值域未测（无旗标 ⇒ 只能靠屏上或 bundle，屏幕仍不通）。
- 连接器对 `--at` 的时区指令是否真的会被执行（本批全程显式给 `Z`）**未验证**。
- 屏上证据：A/B/C/D/E/F/H 仍为零。

## 二十五、索引守卫与契约查询口（✓ 第 81 批 MCP 写入读回实测）

① **跨索引删除的守卫不对称**（本批最重要的一条机制）：同一份"宿主文档已软删"的状态下，**提醒**的孤儿条目可直接 `reminders delete --reminder <id>`（G714 已证），**任务**却不行 —— `tasks delete --task <id>` 回 `Failed to delete task: Cannot modify document in trash. Restore it first.` ⇒ 官方有**两套删除守卫**，任务侧要求宿主在可写态。⇒ 推论（已实测闭环）：**沙盒还原的正确顺序是 `tasks delete` 早于 `documents delete`**；一旦写反，恢复通路是 `documents move --destination unsorted`（把文档从回收站移回），再删任务，再删文档。
② **回收站的真实生命周期**：`documents delete` 的自述里藏着两个此前未采的字段 —— **软删（进回收站）** 与 **30 天自动彻底清除**；且 `documents` 命名空间**没有** `restore`/`purge` 动词（`Unknown command` 打印的可用清单只有 create／move／delete 三条）。⇒ 更正 G678 的绝对表述："回收站不可清空"只对"API 主动清空"成立，**系统侧 30 天会自动 purge**。
③ **`blocks learn <topic>` 是官方内置的按需契约查询口**，粒度比 `--help` 细（一 topic 一份形状指南），支持一次多 topic（空格或逗号分隔、同 topic 去重、单响应内用分隔线隔开）；不带参数才列 topic 全集。⇒ 此前 12 份契约串全部来自 `--help`，**`learn` 系列是一份未开采的平行契约文档**（本批只取了 `table`）。
④ **同一份 markdown 有两种落库结果**：`--markdown` 直给的管道表 → **一个 text 块**（`blocks get` 原样读回、屏上 0 个 table 语义）；`--json '{"type":"table","markdown":…}'` → **真 table 块**。⇒ 导入器是 **type 驱动**而非内容嗅探；同时 help 里"single `\n` stays text、`\n\n` 才分段"的口径与本例一致（我用了真实换行仍合成一个 text 块，说明**多行 markdown 结构在 `--markdown` 通路不被逐行解析**）。
⑤ **错误即文档的第 5、6 例**：`Document not found: <documentId>` 附带"用 rootBlockId 或用 documents resolve-link 换 id"的指引（⇒ `documents delete --document` 吃的是 **rootBlockId**，第一次用 documentId 被拒）；`tasks delete` 失败时附带"用 `tasks list --scope active` 复核"并列出其余 scope（inbox／upcoming／logbook）。⇒ 复刻 MCP façade 时**错误对象要承载下一步指令**，这是官方 CLI 的固定风格。
⑥ **孤儿可见性**：`tasks list --scope all` 的 `in:` 字段在宿主不可解析时退化为 `inbox` ⇒ 官方列表渲染里"归属丢失"被静默归到收件箱，**不是**"任务被移进收件箱"。

**仍未采到（机制面·第 81 批刷新）**
- `tasks delete` 的完整契约（旗标表未打印过；成功回执只有 `Deleted task <id>`，是否软删、能否撤销、是否进回收站均未知）
- 30 天 purge 的可配置性与计费差异（Plus 与免费的保留期是否不同）
- `blocks learn` 的 topic 全集与各 topic 正文
- 回收站内文档的 `documents list` 可见性开关（第 75 批记过"默认含回收站"，本批未复验）

## 二十六、键位描述符的两段式结构（✓ 第 82 批·上半，直读 `_harvest/js/index-DiTmKH3z.js` 偏移 16762–17776）

★ **官方一条键位＝主描述符 ＋ 可选 `winMatcher`**，实测样例（全部为本批直读原文，非推断）：

| 工厂 | 主描述符 | `winMatcher` | 用途（本轮定位到的命令） |
| --- | --- | --- | --- |
| `Vn(t)` | 只有 `keyCondition`（**不约束任何修饰键**） | 无 | 表格 `清除单元格内容`（`nc`=Backspace）；⇒ 与 `mo(t)`（四个修饰键全 false 的**精确无修饰**）是两回事 |
| `Co(t)` | `meta` | `ctrl` | `ADD_ROWS_AFTER`（添加行） |
| `ci(t)` | `meta+shift` | `ctrl+shift` | `ADD_COLUMNS_AFTER`（添加列） |
| `JI(t)` | `meta+shift+alt` | `ctrl+alt` | `ADD_COLUMNS_BEFORE`（在前面添加列） |
| `zr(t)` | `meta+alt`（显式 `shiftKey:false`） | **`ctrl+shift`**（显式 `altKey:false`） | `ADD_ROWS_BEFORE`（在前面添加行） |
| `y2(t)` | 只有 `alt`（显式 `shift/meta/ctrl:false`） | **无** | 表格四个 `MOVE_ROWS/COLUMNS_*` ⇒ Alt 族跨平台一致 |

**三条要保留的机制结论**
1. ★ **`winMatcher` 是"第二匹配式"而不是显示映射**：Windows 上命中判定走 `winMatcher`，面板印的也是它 ⇒ 于是 **`ADD_ROWS_BEFORE` 与 `ADD_COLUMNS_AFTER` 在 Windows 上的匹配式逐字段相同**（都是 `ctrl+shift` ＋ Enter），这是一个**真实存在的官方键位冲突**，Mac 侧不冲突（gap **G733**）。★ 反过来看：`keyboard.md` 表E 的"Mac 列／Win 列"其实是**主描述符／winMatcher** 两件事，**不是抄错**（本批据此把 G726 从"待裁定"结掉，gap **G732**）。
2. **有的工厂不带 `winMatcher`**（`Vn`、`y2`、`mo`）⇒ 这些命令跨平台同一套修饰键；带 `winMatcher` 的才需要分平台建模。本地复刻时若只做一套映射，会在 Windows 上把 `⌘` 族命令整体做错（Alt 族反而没事 ⇒ 缺陷分布不均匀，最容易漏测）。
3. **修饰键是四个字段全显式书写**（`metaKey/shiftKey/altKey/ctrlKey` 一律给值，不是省略即 false）⇒ 匹配是**逐字段相等**语义，任何"少写一个 false"的本地实现都会放宽命中条件。

**仍未采到（机制面·第 82 批·上半刷新）**
- 带 `winMatcher` 的命令**全集**未统计（本批只查了表格增删行列 4 条 ＋ Alt 移动族 4 条）⇒ 需扫键位注册表（偏移 3641223 一带）逐条配对
- G733 冲突在 Windows 上的**实际后果**（按 `Ctrl+Shift+⏎` 触发哪一条、是否取决于注册顺序）⇒ 需要真实键盘，当前连接器键盘通路全灭
- `na(t)`（`keyCondition` 的构造器）的取值域、以及 `QM(t)={...t,w...}` 这个包装工厂到底加什么（偏移 17387 之后被截断，未读全）
- 显示串构造器 `Cae()` 到底读主描述符还是 `winMatcher`（本批只证到"面板显示的是 winMatcher 组合"，未直读 `Cae()` 定义）

## 二十七、键表注册顺序即优先级：塌键的裁定办法（✓ 第 82 批·下半 B，直读 `_harvest/js/index-DiTmKH3z.js`）

前面各批把"同键不同结果"归因到"每个上下文一条有序列表，自上而下第一个匹配者吃掉事件"，但从未**读过任何一张列表的完整顺序**，所以 G726（Windows 上 `Ctrl+Shift+⏎` 同时印给"在前面添加行"与"添加列"）只能记成"未裁定"。本批的做法值得固化成一条通用技法：**遇到键位冲突，不要再去比对描述符，直接读那张列表的下标顺序**——顺序就是答案，且成本只有两次 `indexOf` ＋ 一段切片。

已读顺序的第一张表：表格单元格上下文 `Asn=({{blockDataRef,blockId,dispatch,currentPage}})=>[...]` @3644300–3644900。

| 序 | matcher | handler 首句（动作线索） | 读到的语义 |
|---|---|---|---|
| 1 | `mo(qs)` | 选区非折叠则收成焦点，否则按 cell 坐标发单选 | 表格内 `Esc` 的第一级（退选区） |
| 2 | `ci(oo)` | `lF(...,ha.column.right())` | 添加列·右（Mac `⌘⇧⏎`／Win `Ctrl+Shift+⏎`） |
| 3 | `zr(oo)` | `zA(...,ha.row.above())` | 在前面添加行（Mac `⌘⌥⏎`／Win 同 2） |
| 4 | `Co(oo)` | `zA(...,ha.row.below())` | 添加行·下（Mac `⌘⏎`／Win `Ctrl+⏎`） |
| 5 | `qi(oo)` | `N9e` | `Shift+Enter` 显式不拦截（E 项的官方 handler，在表格语境再次出现） |
| 6 | `mo(oo)` | `Ro(...).coordinateOfCell(s.cell.id)` 后调 `Nsn(...)` | 裸 `Enter`（取当前格坐标再交给 `Nsn`，语义仍未读） |
| 7 | `qi(f1)` / `mo(f1)` | `H9e(...)` / 单元格内 Tab 族 | `Tab`／`Shift+Tab` 的表格档 |

⇒ 2 在 3 之前，而两者 Windows 式逐字段相同 ⇒ **Windows 的 `Ctrl+Shift+⏎` 只能派发到"添加列·右"**。第二张表（表选区上下文）同序：`ci(oo)` @3764532 → `JI(oo)` @3764813 → `zr(oo)` @3765093，结论一致；`JI` 的 Windows 式是 `Ctrl+Alt`，插在其间不参与塌键。

三条机制层结论（本地实现直接受影响）：

1. **`winMatcher` 是"缺省沿用主描述符"的可选覆盖**（`bae(t)=Ll?t:t.winMatcher??t` @15959，`Ll` 是 Mac 位 @13738）⇒ 官方并没有"Windows 键表"，只有"Mac 键表 ＋ 少数命令的 Windows 覆盖"。⇒ 复刻时**默认继承 Mac 组合**才是与官方一致的行为，把 `⌘` 一律当 `Ctrl` 反而是本地自造（本地现状正是后者：三处绑定都写 `metaKey 或 ctrlKey`）。
2. **`QM` 是描述符装饰器而不是命令属性**（`{{...t, winMatcher:{{keyCondition:q7(()=>!1)}}}}` @17576）⇒ "Mac 专用"可以贴在任何工厂产物上；实测被贴在 `zr(Ts)`／`zr(ms)`（@6303561、@6303617）。判某键在某平台是否存在的正确问法是"它的描述符链里有没有 `QM`"，而不是"命令名里有没有 MAC"。
3. **平台差异有第三层：handler 体内读 `Ll`**（@3642465、@3642556 形如 `if(Ll){{...;return}} 另一条实现`）⇒ 光复刻两栏键位不够，同一命令在两端可能压根是两个动作。⇒ 本地（web／非 Mac 目标）应实现**非 Mac 分支**，且要逐命令确认分支内容；未读到的分支一律记 `~`。

**仍未采到（本机制面）**：三张键表只完整读了第一张；正文上下文（@3641223 一带）与任务/集合列表上下文（@6300153–6303617）的顺序只读到片段，尚未成表。`N9e`／`Nsn`／`lF`／`zA` 的函数体未读；`ot` 具名注册表里哪些命令带 `QM` 未枚举。

## 二十八、面板装配器与三张键位注册表（✓ 第 82 批·下半 C，直读 `_harvest/js/index-DiTmKH3z.js`，零写入）

这一层的存在解释了一个此前只能记成"官方自相矛盾"的现象：**面板显示的键位 ≠ 派发用的键位**，因为面板读的是第三份数据（一份"给人看的清单"），而派发读的是各上下文的有序键表。

三个函数就是面板与注册表之间的胶水（均在 @2112400–2112700 读到）：

| 函数 | 原文形状 | 作用 |
|---|---|---|
| `Zp` | `t => ({getName: t.getName, shortcuts: [t.shortcut]})` | 把 `hnt`（表格式命令，每条只有一个 `.shortcut`）适配成面板的 `{getName, shortcuts[]}` 形状 ⇒ **一对一展开、不去重** ⇒ 塌键在面板可见的直接原因 |
| `JX` | `t => { const e = S9t.get(t); return Ll && e != null ? [t, e] : [t] }`，`S9t = new Map([[ot.MOVE_BLOCK_TOP, ot.MOVE_BLOCK_TOP_MAC], [ot.MOVE_BLOCK_BOTTOM, ot.MOVE_BLOCK_BOTTOM_MAC]])` | **Mac 才把 `_MAC` 变体追加进展示列表**；非 Mac 只返回主键 ⇒ 面板的"同一命令两个键"是 Mac 专属展示 |
| `k9t` | `const {tableShortcuts: e} = ot` ＋ `{getName: s => s("tasks.mark.task.as.completed"), shortcuts: [ho.TOGGLE_DONE, ho.TOGGLE_DONE_SLASH]}` ＋ `shortcuts: Ll ? [ho.SET_CANCELLED, ho.SET_CANCELLED_SLASH] : …` | 任务类面板条目的组装；`ot` 里还嵌着一个 **`tableShortcuts` 子组**（⇒ `ot` 不是一张平表，有嵌套） |

三张注册表的分工（都是**未压缩的真实命令 id**，可直接抄成本地枚举）：

- `ot` @886723（66 项）＝ 正文＋外壳的通用命令（样式、块操作、导航、侧栏、快速打开、评论、每日笔记、撤销/重做、`ADD_TABLE_ROW`／`ADD_TABLE_COLUMN`）。条目形状＝`ID: <工厂>(<键>)`（纯描述符，无文案）。
- `ho` @904600 一带 ＝ 任务视图／任务全局命令。条目形状同上，但**面板源用 `ho.X` 引用**，且 `SET_CANCELLED_SLASH` 在 `ho` 里就写着 `QM(zr(Vr("Slash")))` ⇒ 该 id 天生 Mac 专用（与 表D 的旧注一致）。
- 表格式命令表（记作 `hnt`）@889009（15 项）＝ 条目形状是 `{getName: t => t("commands.add.rows.before"), shortcut: zr(oo)}` ⇒ **只有这张表自带文案 key**，这也是 表E 的官方中文列此前能对上的原因。

⇒ 由此得到一条可复用的采集判据：**要判"某键在 Windows 上到底存不存在"，必须同时看三处**——① 描述符链里有没有 `QM`；② 派发点用的是 `ot.X` 还是重新构造的 `QM(...)`（同一 id 在不同上下文可以一端有一端无）；③ 面板源的 `shortcuts` 数组是不是 `Ll ?` 三元。**只看面板会得出错结论**（第 81/82 批两次都是这样：面板印了不等于能派发，面板没印不等于没绑定）。

**仍未采到（本机制面）**：`ot.tableShortcuts` 子组的成员清单未展开；`S9t` 之外是否还有别的 `_MAC` 映射表未查；`k9t` 的非 Mac 分支只读到 `…` 截断处（`SET_CANCELLED_SLASH` 之外还裁了什么未读全）；面板源的 `shortcuts:[…]` 直写形式只抓到 57 条，经 `Zp`／变量传入的条目未穷尽。

## 二十九、键分派的四道外部闸门与「只读四来源」（✓ 第 96 批·上半 2026-09-29 09:26–10:20，零写入＝12 次页内 `fetch`／`indexOf`，产物走 `filePath` 落盘；原始窗 `_harvest/b96-*.json`）

此前 §十七／§十八／§二十四 把只读与撤销写在**动作层**（`fYe` 白名单、`docDispatchBound`、`undoable` 旗标）。本批在**入口层**又找到四道闸门，且它们**都在 `docDispatch` 之前**，所以"为什么按了没反应"的归因顺序必须先排这四道：

| # | 闸门 | 逐字位置 | 效果 | 判据 |
| --- | --- | --- | --- | --- |
| 1 | `allowBlockStyling` | 主包 `onKeyDownBound`@4,091,385：`this.props.allowBlockStyling && cne(...)` | 为假 ⇒ **块级键定义整条不调用**（`cne` 是唯一入口） | 只读态的 UI 侧总门，比 `fYe` 更靠前 |
| 2 | `tableId != null` | 同上：`const o = this.props.tableId != null ? [] : uF` | 表格内 ⇒ **键定义表被换成空数组** | markdown／块级快捷输入在单元格里整体失效 |
| 3 | `k2`＝Android | 同区首行 `if(k2)return`；`k2 = c4.indexOf("Android") > -1`@13,822 区 | Android UA ⇒ **块编辑器不分发任何键定义** | 平台位而非功能开关（§20.14.4） |
| 4 | IME 组合期 | `onCompositionStartBound ⇒ disableKeyDefs()`＝`bn.pushIntoFocus({keyDefs:[], allowPropagation:!1})`；`onCompositionEndBound ⇒ enableKeyDefs()`＝`bn.removeFromFocus(this.disabledId)` | 组合期间 ⇒ **焦点栈条目把键表清空且不放行** | 与 `keyCode===229` 短路是**两处独立实装** |

⇒ 与 §二十五 UIFocusStack 的关系首次具体化：`disableKeyDefs` 用的正是 `bn.pushIntoFocus`（G812 的 `bn={initialize,pushIntoFocus,upsertIntoFocus,removeFromFocus}`），**`allowPropagation:!1`** 意味着栈顶条目吞掉事件 ⇒ 第 89 批记的「常驻底座 `FOCUS_STACK_ID`@6,540,353 全局和弦分派点」在有内联编辑进行时收不到键。

**只读来源从两条改为四条**（同区 documentAccess／空间选择器逐字）：`cot = canView`、★ **`o3e = canEdit && !forcedViewOnlyMode`**、`dot = canEdit`、`uot = canComment`、`fot = subscription ?? null`、`pot = sharedBy ?? null`；另有 **`Nr = () => qe(s3e)`**（`s3e = t == null ? !0 : (t?.isAnonymousUser) ?? !1` ⇒ ★ **store 缺失时默认"匿名"＝保守拒绝**）与 **`z0 = () => !qe(yI)`**（`yI = spaces?.some(({id}) => id === 当前 spaceId)`，`aot` 在 `type==="quicknew"` 时回落 `Yi` ⇒ 「当前空间不在本账户空间列表」＝**外来／共享空间**）。⇒ 结论：官方只读实际是 **`canEdit` × `forcedViewMode` × 匿名 × 空间归属** 四个来源的合取，§十四记的"两个来源"是**不完整口径**（已就地加 ✎）。

**分派层新增两条口径**：① 组件层 `CompositeRoot` 默认 `stopEventPropagation:!0`（而 hook 层默认 `!1`）⇒ 弹层内方向键 **不冒泡到 document 分发器**（承 §20.6.6／G813），这是"弹层吞键"的机制级出处；② `ho` 任务命令表首两行逐字＝`PREV_TASK:{...mo(Ts), shiftKey:void 0}`／`NEXT_TASK:{...mo(ms), shiftKey:void 0}` ⇒ **裸 ↑／↓ 且显式声明 `shiftKey: void 0`**（`mo`＝严格裸键，G818），与屏上「信息 → 动作」子页签印的 `Alt-↑ Alt-↓` 不是同一组命令 ⇒ `keyboard.md` 表D 需按命令名分列（新未采项）。

**本批踩到的两条通路纪律**（要带走）：① ☆ `blocks get --format markdown` 报 `MCP error -32603: MCP tool invocation did not complete`，**同参数第二次与 `--depth 1` 都成功** ⇒ 报错也可能是抖动，**不得据此立"官方缺陷"**（与"指纹没变＝静默失效"互为镜像）；② ★ 帮助中心在**已登录会话**里直连 `/zh-Hans/<路径>` 会被接回 app 家路由（两次复现，`href` 落 `/s/<space>/home`）⇒ 第 95 批的"第三条通路不受阻塞"要降级为"零登录门槛、但有路由门槛"（G871）。

**仍未采到（本机制面）**：`cne` 定义本体（@3,777,934）的分支表与 `uF` 之外的键定义表来源；`allowBlockStyling` 由哪个 store 赋值；`forcedViewOnlyMode` 的写入方（与 §十四 的 `fYe` 关系仍未连上）；`bn.pushIntoFocus` 在 IME 期间的**栈条目 id 生命周期**（`this.disabledId` 生成规则未读）；表格内 `cne` 拿到空数组后**是否还有别的键表兜底**（例如 `uF` 之外的全局表）。


## 三十、焦点栈作用域的**屏上可观测性**：弹层压栈后兄弟命令不到达，且 `pd=false`（✓屏上 第 96 批·尾记八 2026-09-29 13:03–13:10，零日期提交；关联 §二十九 的四道外部闸门、§十四 UIFocusStack 与键表引擎、第 89 批 44 处 `pushIntoFocus`）

§二十九 把"按了没反应"的归因顺序排到第四道闸门（IME 摘键 `pushIntoFocus({keyDefs:[], allowPropagation:!1})`）。本批拿到**同一条机制在非 IME 场景下的屏上证据**，而且证明**用 `preventDefault` 判"被吞"是错的**：

```
状态：schedule 弹层打开（activeElement = INPUT[placeholder="日期"]）
按键：Ctrl+Shift+D  →  日志 d|KeyD|c1s1a0|t=INPUT|pd=false
结果：无第二个弹层、原弹层文案集与 outerHTML 长度零变化
对照：Escape 关层 → 同一条 Ctrl+Shift+D → 截止弹层正常出现（232×332 / 11,383 B）
```

三点机制读法：

1. ★★★ **`pd=false` ⇒ 事件没被任何 handler 阻止默认动作**，所以"命令不生效"**不可能**是 `preventDefault` 型吞键（与 §二十九 表内第 4 行 IME 的 `allowPropagation:!1` 不是同一种）。⇒ 唯一自洽的解释＝**全局分派器 `eEe` 在按键时按"栈顶条目的键定义表"过滤**：弹层压进来的条目**只带自己的键**（本例至少带 `Escape`），`OPEN_DEADLINE_DATEPICKER` 不在表内 ⇒ **命令根本没被匹配**，事件继续走默认路径（落在 INPUT 上无事发生）。⇒ **归因顺序要加一问**："这条键有没有进入当前栈顶条目的键定义表？"它排在 §二十九 四道闸门**之后**、`preventDefault` **之前**。
2. ★★ **弹层压栈与 IME 摘键共用同一条 `bn` API**（§十四 已给本体 `bn = {initialize:eEe, pushIntoFocus:nEe, upsertIntoFocus:oEe, removeFromFocus:sEe}`）。本批补上第三个使用者＝**日期弹层**（前两个＝内联编辑器 `onKeyDownBound` 与 IME `disableKeyDefs`，见 §二十九 表内第 4 行）⇒ 44 处 `pushIntoFocus` 注册点里"弹层类"至少占一处，且其效果**可屏上观测**（不必读码）。
3. ★ **打开型命令不是 toggle**：`Ctrl+Shift+S` 在层已开时再按一次，层仍在（`ae` 保持 `INPUT/日期`、`body` 文案集不变）⇒ 命令回调只做"开"，关闭只有 `Escape` 与外层点击两条路。⇒ 本地若把 chord 实现成 `setOpen(v => !v)` 会与官方分歧。

**仪器面（本节附带，已写进 `gap.md` G918）**：Craft 自有弹层 **零 ARIA 角色**（`dialog/menu/listbox/grid/cell` 全 0）⇒ 任何"以角色判开合"的探针**恒假**；可用三路读数＝① `activeElement` 标签名＋`placeholder` ② `body` 新增文案集 ③ 容器 `outerHTML` 长度。本批第一次误判（把"已开"读成"没开"）正是只用了角色直方图。

**仍未采到（本机制面）**：弹层栈顶条目的 `keyDefs` 实际内容（只知含 `Escape`）；`upsertIntoFocus` 是否有使用者（区别于 `pushIntoFocus`）；多层弹层同时打开时的栈深度上限；提醒子选择器是"第二个栈条目"还是"替换栈顶"（G922 未裁，故本批不能断）；块菜单路径是否走同一 `bn` 栈（本批未点块菜单）。


## 三十一、撤销的**"按块还原"语义首获屏上中间态证据** ＋ `lGe` 第三档与屏上冲突（✓屏上补记 第 96 批·尾记六／七 2026-09-29 12:02–12:42，沙盒 `QODER-HARVEST-B96B`／`B96C`；原始读数在 `gap.md` §三点一〇三一／一〇三二、`interactions.md` V84）

⚠ **本节是补记**（尾记六／七 当时漏了 §6 契约要求的 model/internals 两节，与 `model.md` §一之五十五 同批补齐）。

### 1. ★★★ **决定性证据＝一个"从未被真实按出来的中间态"**

在同一个任务块 T1 上连按 5 次改动：`Tab` 缩进 → 块首 `Backspace`（退缩进）→ 再按（退列表）→ 再按（合并）→ `Ctrl+A`＋`Backspace`（全选删除）。然后 `Ctrl+Z` 五次 ⇒ 计数 **1:1** 回到基线、**块 id 全程不变**。

关键在于**第 3 下撤销之后** T1 处于：`indentationLevel:1` ＋ **无** `taskInfo`／`listStyle`。⇒ **这个组合在我真实按下序列里从未出现过**（我按下时它是"1 档＋有列表型制"，或"0 档＋无列表型制"，中间没有"1 档＋无列表"这一站）。

⇒ 撤销**不是逆序重放动作**，而是**把每块还原到某个快照**。这正是第 74 批 §十五 从码路读到的两件事：
- **一步＝一个 `undoRedoPatchId` 槽**（跨异步复用同一 id ⇒ 多个动作可融进一步）
- **`vQ` 每块去重**（同一 patch 内同 `blockId` 只保留末次）

⇒ ★★ **本条是该读法的首个屏上反证型证据**：融合回放会**造出中间态**，逆序回放不会。两种实现的判据就差这一条，因此写进产物当作本地验收靶子。

### 2. ★★ **本地分歧点（P0）**

本地＝TipTap `history` 扩展，**逐事务严格逆序**。⇒ 在"跨档连按"这类序列上，本地撤销会经过官方**从不出现**的状态；反之官方经过的"1 档＋无列表"本地拿不到。⇒ 若要对齐，可选路径＝① 按块快照（自己维护 per-block 前态）② 或接受分歧并登记为有意偏差。**本批不裁**（需要产品决策），只把判据立住。

### 3. ★★★ **`lGe` 第三档（装饰一次全清）与屏上冲突 ⇒ 归因待裁**

第 70 批静态读到 `lGe` 退档序＝**缩进 → 列表 → 装饰**，其中装饰档写作"一次全清 `decorations.block`＋`decorations.focus`＋`color`"。屏上（尾记七）＝带加粗、无缩进、非列表的块在**块首**按一次 `Backspace` ⇒ **直接合并且加粗完整保留**。

⇒ 三条候选，一条都还没排除：
1. 装饰档**要求有选区**（块首无选区直接跳合并档）；
2. 静态 `lGe` 里的"装饰"分支**不在 `Backspace` 路径**，属于另一个动词（`Ctrl+\` 一类，本目录尚无该动词的注册表出处）；
3. 装饰档在 `lGe` 的**条件变量**上被跳过（第 70 批已记 `Dsn` 与 `lGe` 两处分派器的退档序**官方自身不一致**：`lGe` 缩进→列表→装饰、`Dsn` 列表→缩进→装饰 ⇒ 需先确认块首 Backspace 走的是哪一个）。

⚠ 纪律执行＝**在裁之前不得据此改本地模型**（`gap.md` G914 已写明）。

### 4. ★ **计步代理仍不可用（第三次登记）**

`blocks add` 一次调用可用 `\n\n` 建 5 块并全部返回 id（G911）⇒ "一次调用"≠"一次操作"；MCP 分号批处理**不是事务**。⇒ 撤销步数的取证**只能在屏上真按键**，任何 MCP 侧代理都会把 5 步测成 1 步。

**仍未采到（本机制面）**：`undoRedoPatchId` 的**融合边界**（隔多久／哪些字段会并进同一步）；`vQ` 去重是"末次胜出"还是"合并补丁"（屏上只见结果态）； redo 侧是否同构；装饰档触发条件（第 3 节三条候选）；拖拽移动的撤销步数（`drag` 通路未试）；全选删除是否单独占一步（本批样本里它与合并之间没有多余步）。

## 三十二、键分派的**无焦点可达性**：文档级 handler 照改状态，但**浏览器默认动作仍以焦点为前提**——两类可达性必须分开断言（✓屏上 第 96 批·尾记十二 2026-09-29 17:31，零写入＝2 次 `evaluate_script` ＋ 用户手按；原始读数在 `gap.md` §三点一〇三六、`interactions.md` V88）

### 1. ★★★ 同一次按键周期内，两条通路一条活一条死

面板切后台后 `activeElement` 归 `BODY`。此后：

| 键 | 事件是否进 `window` 捕获 | Craft 自有 handler 是否生效 | 浏览器默认动作 |
| --- | --- | --- | --- |
| `↓` | 是（`keydown`/`keyup` 各一条，`code` 正常、`defaultPrevented=0`） | **生效**＝选中 9 → 10 | 无（方向键默认动作对本页无效） |
| `Enter` | 是（同上） | 无可见效果 | **不发生**＝激活聚焦按钮的默认动作要求 `activeElement` 就是那枚 `<button>` |

⇒ 结论＝**"事件送达"与"默认动作可执行"是两个独立前提**。§二十九 的四道外部闸门（`k2` Android 短路／`tableId` 清表／`allowBlockStyling`／IME 摘键）讲的都是"Craft 自己的 handler 读不读这张键表"；本轮补上第五道、也是**仪器侧最容易踩的一道**：默认动作类结论还要 DOM 焦点在场。⇒ **凡"原生激活类"取证，指纹里必须含 `activeElement === 目标元素`**；`visibilityState` 与 `document.hasFocus()` 都替代不了（尾记九已证 `hasFocus:false` 下键仍送达 ⇒ `hasFocus` 对本通路不敏感）。

### 2. ★★ 与 `pushIntoFocus` 文档级监听自洽

`§十四`／`§二十九` 记的 `pushIntoFocus({keyDefs, allowPropagation})` 是把键表挂进**焦点栈**、由栈顶在文档级分派，而不是逐元素 `onKeyDown`。本轮的实测正好是它的可观测推论：**焦点已经不在栈内任何元素上，栈仍在工作**（选中照改）。⇒ 这既是官方设计，也解释了为什么本目录多次在 `hasFocus:false` 下用 `press_key` 驱动面板成功。

⚠ 反向推论**不得**写成缺陷：`Enter` 无效果**不能**归因于"焦点栈吞掉了 `Enter`"，因为焦点栈里 `Enter` 的键定义是否存在，本轮的前置条件已经不满足、读不出来（G890 记为无效轮）。

### 3. ☆ 日志器一次调用答四问（本机制面的采法沿用）

`type|key|code|ctrlshift|target|defaultPrevented` 六段式日志 ＋ `slice(<上次总条数>)` ＋ 同一次读回里带 `logLenTotal`、选中类名命中下标、`activeElement` 文本 ⇒ 一条读数同时回答：**送达了吗 / 目标是谁 / 状态改了吗 / 这轮能不能下结论**。本轮正是靠"目标是 `BODY`"这第四问把一次容易写错的因果（"官方抑制 `Enter`"）挡在产物之外。

**仍未采到（本机制面）**：焦点栈是否在 `Enter` 的键定义表里放了"激活"（需满足 §1 的焦点前提）；`defaultPrevented` 在编辑器级键上的分布（承 §三十 的 `pd=false` 只覆盖面板级）；键表清空（`keyDefs:[]`）时**文档级**监听是否也一并失效（本轮证明它不依赖焦点，但未证明它不依赖栈顶）。

## 三十三、**只读态真正的闸门＝`features.inlineEditing`（键定义注册层），`forcedViewOnlyMode` 在 web 构建里永不为真** ＋ `cne` 本体结案＝markdown 快捷输入分发器 ＋ 焦点栈 id 生命周期 ＋ **一条会让所有历史 `@` 偏移失效的资料卫生问题**（✓码路级 第 97 批 2026-09-29 20:12–21:14，盘上 `_harvest/js/index-DiTmKH3z.js`；⚠ **本节全部偏移＝盘上偏移**，与历史页内 `fetch().text()` 口径差约 ＋3,026，见 §5）

### 1. ★★★ 只读三层的连接关系（把 §十四 的 `fYe` 与 §三十 的焦点栈第一次串起来）

| 层 | 代码位置 | 语义 |
| --- | --- | --- |
| 键定义注册 | `updateKeyDefs(){if(!this.props.features.inlineEditing)return;…}` **@4,118,794**；`focus()` 同样先判 `inlineEditing` 才 `bn.pushIntoFocus({id:this.id,keyDefs:()=>this.keyDefs,allowPropagation:!1})` **@4,120,771** | 为假 ⇒ **块级键定义根本不进栈**（不是"进了栈被拦"，是压根没注册） |
| `inlineEditing` 来源 | 块组件 `inlineEditing:C`，`C` 来自 `js()` 的 `canEdit`（**@5,280,808** `canEdit:C,canComment:x}=js()`）；`js()` **@903,281**；selector **@904,035** ⇒ **`canEdit = documentAccess.canEdit && !forcedViewOnlyMode`**；features 默认全假对象 `KGt` **@3,203,751** | ⇒ **`forcedViewOnlyMode` 一经为真，键定义层与派发层同时关** |
| 派发层 | `isReadOnly: !documentAccess.canEdit \|\| forcedViewOnlyMode` **@6,441,443** → 管线 `uYe` 里 `n.isReadOnly ? pYe(…) : PT(…)` **@731,194** → **`fYe` 八项白名单 @735,470** | 八项＝`loadDocument`/`addStoredBlocks`/`syncUpdateComments`/`addPendingComment`/`setCommentResolved`/`setCommentState`/`syncUpdateContributors`/`updateRecordObjectProperty` ⇒ **只读仍允许评论与记录属性** |
| 覆盖位 | reducer `PYn(t,e){t.forcedViewOnlyMode=e.isReadOnly}` **@6,395,384**（case 表 **@6,380,226**）；creator `Vze` **@616,569** | ★★★ 见下条 |

★★★ **`forcedViewOnlyMode` 在当前 web 构建里永不为真**：实扫 `Vze(` 全文件命中 **2 处**＝定义 **@616,569** ＋ **唯一一个调用点 @6,460,111 `finally{this.uiDispatchBound(Vze(!1))}`**（传假）；且 `Vze`／`PYn` **都不在 `index` 的 export 表里**（export 块 @6,831,276）⇒ **任何 chunk 都无法把它设真**。⇒ 只读实际全走 `setDocumentAccess`（creator `ZR` @616,353；调用点 @6,438,817 全假、@6,450,116 全真、@6,460,912 由服务端 access 对象解构）。
⇒ **这条直接解释屏上 G937**：我以 owner 身份打开带 `?s=` 的链接不会进只读态，**不是通路问题、是这条覆盖位在 web 侧没有触发源**；它的 true 侧应当是桌面 App／深链专有，**缺的是浏览器侧的触发源，无法从本地回溯**（不得据此判"官方 web 没有只读态"——`documentAccess.canEdit` 那条路仍然会造出只读）。

### 2. ★★ `cne` 本体结案＝**"markdown 快捷输入分发器"，不是键定义表**（**@3,780,925–@3,781,453**，628 字符）

签名 11 参＝`(t=key, e=KeyboardEvent, n=slateEditor, o=editorState, s=blockId, i=keyDefs[], l=当前 model, r=docDispatch, c=uiDispatch, d=blocksRef.current, u=toggleStates)` ⇒ **表是调用方当第 6 参传进来的**，`cne` 自己不带表。

| 顺序 | 条件 | 结果 |
| --- | --- | --- |
| 1 | `o.length>0` 假 / `n.selection==null` / **选区非折叠（有选区）** / 键不在 `pln` 那 4 个 trigger 内 | **整条不执行** |
| 2 | `mc(o,selection)==null` | return（拿不到光标文本节点） |
| 3 | 逐条：`t!==g.trigger` 或 `prefix.match(g.pattern)==null` | 跳过（**前缀只取光标之前**的 `Sr(o).slice(0,p)`） |
| 4 | `g.isApplicable(C)` 返回假 | 不触发**且不 `preventDefault`**（继续正常打字） |
| 5 | 命中 | `setTimeout(0)` 跑 `g.callback({blockId,currentModel,cursor,m,slateEditor,slateState,docDispatch,uiDispatch,blockData,toggleStates})` ⇒ `preventDefault()` ⇒ **return ⇒ 只吃第一条命中** |

★ 表格内/表外**不在 `cne` 里分**，在调用方：`this.props.tableId!=null ? [] : uF`（表格里传**空数组**）。
★★ **`allowBlockStyling` 只门控 `cne`**（`this.props.allowBlockStyling && cne(...)`，`cne` 内部零引用）⇒ 本目录 §三十一 写的"为假 ⇒ 块级键定义整条不调用（`cne` 是唯一入口）"**过宽**，正确说法＝"为假 ⇒ markdown 快捷输入不跑"。★ 而它是**硬编码 JSX prop**＝普通块 `allowBlockStyling:!0` **@4,141,387**、**页面标题块 `!1` @5,284,081**（`isPageHeaderBlock:!0`、`data-testid="editor-title"`）⇒ **新事实：官方标题块永不做 markdown 快捷输入**（本地标题与正文共用同一套输入规则 ⇒ 差分）。另经 `{...this.props}` 灌进富文本→slate 转换器（`IY` @979,574，消费点 @982,170／@982,247／@982,556）。
☆ 调用方两处（同一个 `bC` 类，本体 **@4,080,202**）＝① `setupOnTextInput` **@4,081,115**（用 `s.data` 当 key）；② `onKeyDownBound` **@4,094,473**，首行 `if(k2)return`，`k2=c4.indexOf("Android")>-1` **@13,822** ⇒ **Android 只走 ①**。

### 3. ★★ 焦点栈的 id 生命周期（§三十 留的那个洞补完）

栈与派发 **@14,214**＝`bn={initialize:eEe, pushIntoFocus:nEe, upsertIntoFocus:oEe, removeFromFocus:sEe}`；`eEe` ＝ **`document.addEventListener("keydown", tEe, opts, true)`（捕获阶段）**；栈是模块级数组 `d0=[]`。
`tEe`（**@14,6xx**）流程＝**`if(t.keyCode!==229)`（跳过 IME 组字码）** → `for(e=d0.length-1;e>=0;e--)` **自顶向下** → `keyDefs` **可以是函数**（每次现算）→ `XI(t,l.matcher)` 命中即 `{preventDefault,stopPropagation}`（**返回对象可显式豁免**）→ `break`；**`i \|\| !n.allowPropagation` 则停止下沉**。matcher 谓词 `XI` **@14,290**＝**4 个修饰位逐位比 ＋ `key`/`keyCode`/`code`/`letter` 四类 ＋ `key` 兼容大小写**。
★ **id 生成规则到手**＝块编辑器实例 **`this.id = \`textEditor-${++bC.instanceCount}\``**（**模块级自增计数器，非 `useId`、不跨会话稳定**）→ **`this.disabledId = this.id + "disabled-for-ime"`（字面拼接、无分隔符）**。生命周期＝`onCompositionStartBound` → `disableKeyDefs()` → `pushIntoFocus({id:disabledId, keyDefs:[], allowPropagation:!1})`（**空表＋吃掉传播＝压住整条栈**）；`onCompositionEndBound`／`onBlurBound` → `removeFromFocus(disabledId)`。
☆ **出栈三条规则**＝带第二参 `aboveFocusStackId` ⇒ `d0.findIndex(s=>s.id.startsWith(aboveId))` 后 **`splice(o+1,0,entry)` 插到该宿主之上**（用 `startsWith`，所以 `BlockTask-<id>` 这类派生 id 能归位）；同 id 已存在 ⇒ `logger.warn("UIFocusRePushed")` ＋ **`splice(n,1,t)` 原地替换**；否则 `push`。`sEe(id)`＝按 id 精确 `splice`（**重复 remove 无害**）。全仓 `pushIntoFocus` **44 处**；同类 id＝`code_editor_${blockId}` @3,556,879、`EditorTableBlock-${s}` @3,763,252、`BlockTask-${id}` @5,379,480、`SideMenuPageCard-${renderKey}` @6,024,303。

### 4. ★ `uF` 整表 18 条（**@3,778,414–@3,780,878**，2,464 字符，字面量数组）

`pln = Array.from(new Set(uF.map(t=>t.trigger)))` **@3,780,889** ⇒ trigger 去重后**只有 4 个**＝**空格 12 条／`-` 4 条／`=` 1 条／`` ` `` 1 条**；18 条**全部没有 `key`/`code`/修饰位**，只有 `pattern`＋`trigger`＋`callback`（可选 `isApplicable`）。★ 尾部 6 条此前未记（逐条外观见 `longtail.md §十八`）：`--`→`$t.Regular`、`=-`→`$t.Strong`、`==`→**`$t.PageSeparator`**（trigger 是 `=`）、`.-`→`$t.Light`、`..`→`$t.ExtraLight`（这四条 `isApplicable` 均为 `textContent.length<4`）、`` `` ``→`hln(...)` 转代码块（action 标签 `"adoptFormatToInsertionPoint"` @3,781,80x）。辅助函数＝`od(t)`（剥触发串＋重放 runAttributes）**@3,781,453**、`Xb()`（分隔线）**≈@3,781,830**、`hln()`（代码块）。★ `P2(t,e)` 已裁＝`{type:"setDecorStyle",blockIds,decorations}` **@85,294** ⇒ `>`／`|` 那两条的 `focus:1` 是 **decor 字段**，**不是块类型**（这条会影响 markdown 族的实现判法）。

### 5. ★★★ 资料卫生：盘上副本与历史偏移**不是同一坐标系**

实扫＝`index-DiTmKH3z.js` **6,844,206 字符／6,864,717 字节／非 ASCII 字符 10,291 个**（无 astral ⇒ 不是代理对问题），而历史文档记的主包长度是 **6,841,180** ⇒ **盘上系统性偏长约 ＋3,026**，根因＝**非 ASCII 被二次编码（mojibake）撑长**。对照实测：`cne` 历史 @3,777,934 → 盘上 **@3,780,925**；`_categoryTitle_dm375_70` 历史 @2,116,956 → 盘上 **@2,119,926**。
⇒ **纪律**：① 历史产物里的 `@` 数字**不得当作盘上定位符复用**，要复用必须先用 `indexOf('符号名')` 重测；② 新写入的偏移**必须注明"盘上"**；③ mojibake 还会**破坏可复刻性**——`uF` 第 9 条正则里的 `[x…]` 在盘上被吞成 `U+E543` ⇒ **该 pattern 不可逐字复刻**，要复刻得回原站取未损坏副本。

### 6. ☆ `_dm375_`（快捷键面板自己的类名）**JS 侧已扫完、CSS 侧缺文件**

18 处字面量／16 个类名全在 `index` **@2,119,694–@2,120,266**，消费方同一个组件（映射表 `Aa={…}` @2,120,309、`tJ="CategorizedShortcutsPanel"` @2,120,351、JSX @2,121,589–@2,122,830）。★ 净新增 4 项＝`_headerText_dm375_57`（header 里小标题＋大标题容器）、**`_scrollRoot_dm375_77`＝`ks.Root` 虚拟滚动容器**（子 `ks.Viewport` 带 `fadeout{vertical,size:24}` ＋ `ks.Scrollbar`）、`_section_dm375_82` 与 `_sections_82` **同 hash**、`_key_dm375_124` 与 `_keys_124` 同理。⇒ **几何／颜色一律拿不到＝本地没有任何 craft.do 官方 CSS**（全仓 `.css` 只有 Next.js 自己的 8 个；历史提到的 `index.css.CP00jDAy.css` 从未落盘）⇒ 这条尾巴**需要回站点取 CSS**，不是"没读"。✎ **第 97 批·尾记二 就地更正＝这条已经清偿**：CSS 本体已落盘 `_harvest/css/index.css.CP00jDAy.css`（**297,080 字符、非 ASCII 0 个 ⇒ 这份没有 mojibake、偏移与字符串可直接逐字引用**），几何／颜色**首次可读**，结果见 `styles.md §九` 与 `gap.md` G970–G974（20 档 alpha 阶／五态阶梯／`720×560`＋`184px`＋`26px` 键帽等）。☆ 顺带把两个"18 vs 16"的口径钉死＝**本行的"18 处字面量／16 个类名"是主包 JS 侧（消费方，@2,119,694–@2,120,266）**，而 CSS 文件侧（定义方）实测＝**18 个类名／16 个不同 hash 后缀／22 次字面量出现**（`_section_dm375_82` 与 `_sections_dm375_82` 共用 hash `82`、`_key`/`_keys` 共用 `124`，故"名 18／hash 16"）⇒ **两侧的 18 是同数不同义**（JS 侧指出现次数、CSS 侧指类名数），历次"剩余 18 处 `_dm375_` CSS"这条尾巴按 CSS 侧结案。⚠ 仍缺其余 **12 份 CSS**（名册 `.css` 共 13 个）⇒ `styles.md §九` 不是全量官方 token 表。

**仍未采到（本机制面）**：`forcedViewOnlyMode` 的 true 侧触发源（App／深链，浏览器侧不可回溯）；`documentAccess.canEdit` 为假时的**屏上**只读渲染（本批只有码路，G937 仍无屏上证据）；`bn.pushIntoFocus` 在**编辑器内容级**键上的 `defaultPrevented` 分布（本轮只覆盖面板级）；栈是否给 `Enter` 放过"激活"定义（**已可判定为否**——`Enter` 的效果来自浏览器默认动作，见 `interactions.md V89`，但"栈内是否另有 `Enter` 条目"未逐条读）；`ks.*` 虚拟滚动组件的第三方身份（类名可读、包名未回溯）；`uF` 第 9 条 pattern 的逐字（需回原站）。


## 三十四、**呈现层的三条实现约定首次可读＝通道化变量 ＋ `@layer` 三层 ＋ 自研清理信号 `jo`**，外加一条"官方也有实现重复"的反直觉证据（✓盘上 第 97 批·尾记二 2026-09-29 22:0x–22:2x，零写入＝CSS 本体首次落盘 ＋ `node -e` 定点读；原始读数在 `gap.md` §三点一〇四〇 G970–G979、`styles.md §九`）

1. ★★★ **`rgb(var(--X) / N%)` 是官方整个中性色系统的承重结构**：`--foreground` / `--base` / `--accent` 各只存**一个空格分隔的三元组**（`--foreground: 26 28 30` 亮、`249 249 249` 暗），20 档 alpha 阶（`-0 … -900`，见 `styles.md §九` 全表）全部写成 `rgb(var(--foreground) / 4%)` 这种**通道 ＋ 百分比**形式 ⇒ 主题切换只翻一个声明、20 档无需重定义，强调色切换只再翻一枚 `[data-accent=…]` 块。⇒ 复刻口径：**别把官方的 `--foreground-150` 当"一个颜色"抄，它永远只是"当前前景色的 6%"**；任何按具体十六进制取色的做法都会把主题耦合死。★ 对照本地＝`src/app/globals.css:60/231` 用 oklch 直接存两个色值、半透明走 `color-mix`（同文件 21 处）与 `oklch(… / a)` ⇒ **两套都能工作，但本地语义名（`--muted`／`--border`／19 个）与官方阶梯名（`--foreground-550`）不是同一张表**，映射必须按 `styles.md §九` 的百分比走、不能按名字猜。
2. ★★ **官方 CSS 自己分三层**＝`@layer base`／`@layer components`／`@layer utilities`（本文件内 86 处 `@layer` 声明）⇒ DS 类（`_dm375_`／`_1j891_`）在 `components` 层、可被 `utilities` 层覆写；☆ 本地只有一个 `globals.css`、无层结构 ⇒ **本地 Tailwind 工具类与自定义规则靠选择器权重打架**，官方靠层顺序解决。这是"为什么官方能在 `_variantActive` 之后再用一条 `utilities` 覆盖"的机制解释。
3. ★★★ **`jo` 不是 `AbortController`**（@60,786）＝`class jo{constructor(){this.internalSignal=new I_e,this.signal=this.internalSignal}cleanupAll(){this.internalSignal.invokeAll();this.internalSignal.removeAll()}}`。它被直接当 `addEventListener` 的第 3 参用（形状兼容 `AbortSignal`），但 `cleanupAll()` 先 `invokeAll()` 再 `removeAll()` ⇒ **官方在"中断监听"之外还挂了一层自定义清理回调**。⇒ 复刻启示：这是"注册副作用时顺手登记撤销动作"的模式（本地靠 `useEffect` 返回函数，语义等价但登记处不同）；☆ 同段可见 `zn.window.addEventListener("storage", this.handleStorageEvent, this.storageCleanup.signal)`（@37,616 附近）⇒ **`zn.window` 是个 window 包装器、全仓统一走它，别按 `window.` 直接 grep 官方源码**。
4. ★★ **官方的数字解析惯例＝Maybe 而非 NaN**：`function ti(t,e=10){const n=parseInt(t,e);return isNaN(n)?null:n}`（@53,972）＋兄弟 `s1`＝同形的 `parseFloat` ⇒ 全仓判失败一律写 `x!=null`（本轮在码面 handler 里连见三次：`ti(C,10)!=null`、`ti(y,10)==null`、`Cve(t)` 内）。⇒ 这条解释了为什么官方代码里满是 `!=null` 短路：**不是随意，是解析层约定把 `NaN` 换成了 `null`**。
5. ★☆ **官方也存在"逐字同构的两份实现"**＝六格验证码面在包里是 `k8`（盘上 @6,560,4xx–6,563,3xx）与 `v8`（@6,613,2xx–6,615,5xx）两份独立代码，逻辑一致、只有压缩变量名不同；**两组共享的东西只有属性表 `Ba.noAutoFillInputAttributes`**。⇒ 反直觉但重要：**官方的复用做在"属性"层、没做在"组件"层** ⇒ 本地不必把官方当抽象完美的参照，遇到"官方这么写了"式的论据时，这条可以拿来平衡。
6. ☆ **资料卫生（承 §三十三 的偏移口径）**：CSS 这份落盘文件**非 ASCII 0 个**（297,080 字符）⇒ **CSS 侧的偏移与字符串可逐字直接引用**；而主包副本（`_harvest/js/index-DiTmKH3z.js`，6,844,206 字符、非 ASCII 10,291）仍有 mojibake ⇒ **JS 侧一律写"盘上偏移"，与历史页内 `fetch` 口径差约 ＋3,02x～＋3,035、逐区段不同**（承 G968）。

**仍未采到（本机制面）**：CSS 名册里其余 **12 份**（`.css` 共 13 个）未落盘 ⇒ `_1j891_` 的另四个变体（`Filled`／`Danger`／`Accent`／`DangerSubtle`）静止值、`--shadow-xs` 以上的完整阶梯、`--spacing-7` 之类缺档是否在别处定义，全部仍属未知；`I_e` 的 `invokeAll` 语义细节（回调从哪登记）未读；`zn` 包装器本体未定位。
## 三十五、**拖拽的两条内部事实：负载靠 provider 内存、手柄是无名 styled-components 节点**＋一条 `isTrusted` 型闸门（✓屏上反推 第 98 批 2026-09-29 22:40–23:00；原始读数在 `gap.md` §三点一〇四一 G982／G984／G986、`interactions.md` V91；⚠ 本节全部为**行为反推**，未读官方源码相关段落）

1. ★★ **负载不经过 `DataTransfer`**：官方 `dragstart` 只写入 `application/json` → 字符串 **`"[object Object]"`**（长度 15，`JSON.parse` 失败）⇒ drop 端不可能反序列化取回；结合懒加载 chunk 名 **`HTML5DnDProvider-C6oAI5bn.js`**（资源名册在册、本地未取回该 chunk ⇒ 未读其体）可判定＝**拖拽的"拖的是什么"存在 provider 的内存状态里，`DataTransfer` 只是用来满足 HTML5 规范的过场**。⇒ 复刻启示：**别照抄官方的 setData**（那是个 bug 形状的写法），要照抄的是"负载走内部状态、`dataTransfer` 只放 MIME 类型占位"这条**可达性设计**——它使跨窗口／外部粘贴天然失效，官方因此不必校验来源。
2. ★★ **手柄＝`[draggable=true].sc-1iqnrwp-0` ＋ 内层图标 `sc-1iqnrwp-1`（`draggable=false`）**＝**styled-components 系**（`sc-` 前缀），**不是**快捷键面板那种 CSS Modules hash 类（`_dm375_`／`_1j891_`）⇒ 官方两套样式体系并存：DS 组件走 CSS Modules、编辑器内部件走 styled-components。⇒ 历次按 CSS Modules 类名找编辑器内部件都会落空，**编辑器侧要按 `sc-` 前缀 ＋ `data-block-id` 锚点找**。
3. ★★★ **一条新形态的"静默失效"＝handler 跑了、`preventDefault` 了、预览画了，但模型不变**。三种合成 `DragEvent` 打法全部做到 `dragover:pd=true` ＋ `drop:pd=true`，数据面 0 变化 ⇒ 与"事件根本没送达"（第 80 批的键盘通路）**不是同一种失败**。⇒ 判据补条：**拖拽类结论只认数据面读回**（`blocks get`），屏上预览／`defaultPrevented` 都**不能**当"动作已提交"的证据；⚠ 且这条属**仪器边界（疑 `isTrusted` 闸）**，禁止写成官方缺陷。
4. ☆ **手柄的可达性缺陷是双刃**：正因为它**没有任何可访问名**（`aria-label`/`role` 皆无，第七次印证 Craft 自有控件零 ARIA），既导致屏上"入口枚举"必须靠坐标或 `data-*`（承 G931 的"枚举入口要同时走可访问名与可见文本两条"），也给了取证一个**可利用的空位**＝临时 `setAttribute('aria-label', …)` 就能把它请进无障碍树，从而被 uid 型工具驱动。⇒ 手法登记（**采完必须还原并复核 `leftover:0`**）：这是本目录第一次**改写 DOM 属性**来做取证，属可接受范围（同生命周期内、零模型写入、当场撤销），但**只能在沙盒页面上做**，严禁在用户文档里做。
5. ★☆ **撤销栈的焦点门槛在拖拽支上复现**：拖拽提交后 `hasFocus:true`／`rangeCount:0`，此时 `Ctrl+Z` 未测（我先补了焦点）；补焦点用**连接器 `click`**（承 G952"编辑焦点只能靠 trusted click"），拿到 `rangeCount:1` 后 `Ctrl+Z` 一步生效 ⇒ 与三档门槛一致＝**编辑器内容级键需 `hasFocus` ＋ `rangeCount>0`**。

**仍未采到（本机制面）**：`HTML5DnDProvider` 本体（chunk 未取回）；落点判定的具体算法（中心／边缘／四分之一如何映射到"上／下／子级"）；provider 在 `drop` 里对 `isTrusted` 的判断点（本轮只能反推，读不到码）；手柄挂载是 CSS `:hover` 还是 JS 状态（未隔离，二者都能唤出）。

## 三十六、**浮层 ARIA 要分两档：菜单类有、自绘面板类没有** ＋ 官方 testid 属性名 ＋ 三态复选框恒在 DOM（✓屏上 第 99 批 2026-09-29 23:4x–23:5x，零写入；原始读数在 `gap.md` §三点一〇四三 G996／G998、`interactions.md` V92）

1. ★★★ **既有判据要收窄**：本目录此前四次记"Craft 自有浮层零 ARIA"（日期弹层／帮助浮层／快捷键面板／分享浮层），本批在**下拉菜单**上实测相反＝`[role=menu]:1`、`[role=group]:2`、`[role=menuitem]:2` 全都在（且第 96 批·尾记九那次帮助菜单也记过 `role=menu:1`／6 项，只是当时没提炼成规则）。⇒ **正确表述＝"菜单类浮层（Base UI Menu）有 ARIA 角色；非菜单类的自绘面板（日期／分享／快捷键／集合视图）零 ARIA"** ⇒ 判开合前要先问"这是哪一类浮层"，别拿一条覆盖全部（承"判据越界"同族）。
2. ★★ **官方 testid 属性名＝`data-testid`（无连字符）**：本屏 26 个 testid 全部走这个属性（`header-root`／`sidebar-toggle`／`browse-header`／`browse-layout-toggle`／`browse-sort-button`／`document-list`／`browse-document-list` 等）；⇒ 探针只写 `[data-test-id="…"]` 会**静默 0 命中**（本批因此把 `browse-header` 读成 `null`、`browse-sort-button` 选择器抛 `TypeError`）；⇒ **写法固定为双属性回退**：`document.querySelector('[data-testid="X"],[data-test-id="X"]')`，并在取不到时**先枚举属性名再判"不存在"**。
3. ★★ **三态复选框在 DOM 里的形态**＝选择条里是 `SPAN[role=checkbox]`（`18×18`）＋ 内层 `SPAN[role=img][aria-label]` 表达**状态**：半选态的图标名是 **`Minus Bold Icon`**（本批实测＝"已选 1 项／共 15 行"⇒ 部分选中）；⇒ 官方用**图标可访问名**编码三态，而不是 `aria-checked="mixed"` ⇒ **判"全选/半选/未选"要读内层图标的 `aria-label`**，读 `aria-checked` 会读不到东西（本目录第一次见这个形态，值得记）。
4. ☆ **DS 菜单容器的类名家族＝`_content_16nf6_9`**（CSS Modules hash `16nf6`）⇒ 与已知的 `dm375`（快捷键面板）／`1j891`（action 按钮）／`6sjpd`／`1nu3o`／`v0ra3` 并列，**新增一个 hash 家族**；菜单项几何＝`248×32`、容器 `260×88`（左右内边距各 6、项间 12）；⇒ 本地若复刻下拉菜单，行高 32／容器宽 260 是官方值。
5. ☆ **顶栏中央的「打开」搜索框常驻**（截图可见）＝quick-open 的**可见**入口 ⇒ 与 V1/V2 结论一致（`⌘K` 与这个框都是"跳转到"，**web 侧没有 189 条命令的全局命令面板**；命令只以**局部 ⋯ 菜单**形态出现）。⇒ 这条给"官方删了命令面板"之类的猜测画上句号：**web 构建里命令面板从未存在**，只有 `command-palette-button` 这个 testid 残留在 bundle（本批在屏上 26 个 testid 里**没找到它**＝未渲染，与 V7"注册方不在 web DOM"同族）。

**仍未采到（本机制面）**：`_16nf6_` 家族其余类名与色值；菜单项 hover／键盘态样式；`Minus Bold Icon` 之外两态（全选／未选）的图标名；`command-palette-button` 的渲染条件（哪个开关或屏会挂它）。

## 三十七、**破坏性确认框是"零 ARIA ＋ 文案即信号"的极端形态：按 `role` 判会把它读成"点击无效"，而"重试"在这里等于二次触发不可逆动作**（✓屏上 第 99 批·尾记 2026-09-30 00:0x–00:2x，**写入批＝12 条永久删除**；原始读数在 `gap.md` §三点一〇四四 G1002／G1003／G1004、`interactions.md` V93）

1. ★★★ **机制**＝Craft 自有确认浮层（承 G622"既无 `role=dialog` 也无 `aria-modal`"）⇒ 打开后 `[role=dialog]`／`[role=alertdialog]`／`[role=menu]`／`[role=menuitem]`／`[role=group]` **全部为 0**，被删卡片仍在 DOM（删除尚未提交），`已选 12 项` 文案未变 ⇒ **三条常规指纹同时"没变"**。唯一变化是 `body.innerText` 多出「确定」与「无法撤销」两处。
2. ★★★ **为什么这条比前四次"零 ARIA"更严重**＝此前零 ARIA 的面（日期弹层／插入面板／快捷键／分享）判废的后果是"白采一轮"，**这里判废的后果是"再按一次删除"** ⇒  ⇒ **纪律**＝**在破坏性动作之后，禁止用"指纹没变 ⇒ 换通路重试"这条常规推定**；改为"读新增文案集 → 有反馈文案就停手核对，没有才允许换通路"。这是本目录第一次给既有铁律**加例外**，例外方向是**更保守**，不是更宽松。
3. ★★ **两代按钮 DS 的分工再获一证**＝同一屏上：⋯ 菜单项＝`BUTTON._action_1j891_1`（`_variantDefault`／`_variantActive` 族，承第 96 批 `1j891`）；选择条两枚图标按钮＝`_button_1bml7_1` ＋ `_variantPlain_1bml7_129`／**`_variantPlainDanger_1bml7_*`**（`1bml7` 族＝G622 已记的 `data-ds="button"` 那一族）；卡片复选框＝`_wrapper_1fgll_1` ＋ `_checkbox_1fgll_11`（`1fgll` 族）；菜单浮层内容壳＝`_content_16nf6_9`（`16nf6` 族）。⇒ ★ **一屏四族 hash 并存、各自负责一类控件** ⇒ 未来定位法＝**按控件类型选 hash 族**，不要指望一个前缀通吃。
4. ★ **危险语义只存在于 class**＝`variantPlainDanger` 是"这枚按钮会毁数据"的**唯一机器可读标记**（本体无 `aria-label`、无文字、无 `title`；可访问名挂在内层 `img[aria-label="Trash Slash Icon"]`）⇒ 反爬／自动化侧要识别危险控件，只能读 variant class 名；⇒ 本地实现反向建议＝**保留 `variant: destructive`（`src/components/ui/button.tsx:9-21`）并额外给 `aria-label`**，两件事都别省。

**仍未采到（本机制面）**：确认框本体的 class 族与它属于哪一代 DS（主动放弃，G1007）；`1bml7` 族的 variant 全集（只读到 `Plain`／`PlainDanger` 两枚）；`1fgll` 族是否有 `indeterminate` 专属类名（本轮只读到 `data-checked=""` 属性在 true 态出现）；`_content_16nf6_9` 家族其余类名。

## 三十八、**输入意图被做成 CSS 契约：`[data-whatintent]` 承担 `:focus-visible` 与"触屏无 hover"两件事，一处写入、349 处消费**（✓盘上 第 100 批·上半 2026-09-30 00:3x–00:5x，零浏览器；原始读数在 `gap.md` §三点一〇四五 G1011／G1014、`styles.md §十一`）

1. ★★★ **机制**＝官方**不写 `:focus-visible`**，而是在 `document` 上写一个属性 `data-whatintent`（值域实测出现在 CSS 里的＝`keyboard`／`touch`，第三态＝属性存在但值既非 keyboard 也非 touch＝鼠标），然后：
   - **焦点环**＝`[data-whatintent=keyboard] .X:focus{…}` ⇒ 只有键盘导航才画；
   - **悬停态**＝`[data-whatintent]:not([data-whatintent=touch]) .X:hover{…}` ⇒ 触屏设备**永不进 hover 样式**（不是 `@media (hover:hover)`，是运行时判定）。
   ⇒ CSS 内该属性出现 **349 次** ⇒ 这是**全仓级别的约定**，不是个别组件的补丁。
2. ★★ **与既有静态读数的咬合**＝第 94 批读到 `Npe` 的 `dataset.whatintent==="touch"` → `navigator.vibrate(...)`（触觉反馈只在触屏触发）⇒ **同一个属性的第二个消费者** ⇒  ⇒ 该属性的**写入方是全局输入意图检测器**（本轮未定位写入点，属未采到），**读取方至少两处＝DS 样式表 ＋ 触觉反馈**。
3. ★★ **第二道状态闸＝`isStatic`**＝所有 hover／focus 规则都写成 `:not(._isStatic_1bml7_134,[data-disabled])` ⇒ 官方把"**长得像被选中但不该响应**"（`isStatic`）与"**用户禁用**"（`data-disabled`）**分成两个类**，前者连常驻底色反馈也拿不到；★ 禁用态本体只有 `[data-disabled]{opacity:.4;cursor:default}`（**注意是 `cursor:default` 不是 `not-allowed`**）。
4. ★ **对本地实现的含义（两条，方向不同）**＝① 焦点环：本地用 Tailwind `focus-visible:`（`src/components/ui/button.tsx:6`）达成同一目的 ⇒ **登记有意偏差、不要求改**；② 触屏无 hover：本地**没有等价机制**（`focus-visible` 管不着 hover）⇒ 若要对齐，要么自建 `data-whatintent` 检测器，要么退一步用 `@media (hover:hover)`（形状不同、效果接近，需注明）。
5. ☆ **一条取证用法**＝DS 组件的"弹层开着"有 `[data-popup-open]` 属性 ⇒ 屏上判浮层开合时，**DS 族可读该属性**，零 ARIA 的自绘族仍只能读"新增文案集＋容器字节"（承第 96 批）。

**仍未采到（本机制面）**：`data-whatintent` 的**写入点**（在哪个 chunk、用什么事件判定、是否有防抖）；`isStatic` 的赋值来源（哪个 prop）；属性是否同时驱动 JS 侧逻辑（除触觉外还有没有别的读取方）。

## 三十九、**拖拽手柄是"单例浮层＋沟槽 pointermove 驱动"**，不是每块一个：这解释了历次"手柄↔行归属"漂移与假阳性（✓屏上反推 第 100 批·下半 2026-09-30 01:0x–01:3x；原始读数在 `gap.md` §三点一〇四六 G1018、`interactions.md` V94；⚠ 行为反推，未读官方相关源码段落）

1. ★★★ **结构**＝全页只有 **1 个** `[draggable=true].sc-1iqnrwp-0`，其父 `sc-1yfn40-0` 的 rect 是 **0×0**（＝portal／绝对定位锚），手柄自身 rect 被写到"当前行"的位置；⇒ 它**不在任何 `[data-block-id]` 内部**（`closest('[data-block-id]')` 返回 null）⇒ **历次"从手柄反查它属于哪一块"是不可靠的**，第 98 批的归属漂移教训由此有了机制解释。
2. ★★★ **驱动方式**＝位置更新只认**沟槽区的 `pointermove`**（x=340 实测有效），不认元素级 hover；⇒ 与第 98 批"合成 `DragEvent` 会被接收但不提交"是**两条独立的闸门**（一条管位置、一条管提交），未来批次不要把两者混成一条结论。
3. ★★ **对本地实现的含义**＝本地 `src/components/editor/drag-handle/DragHandle.tsx` 是**每块渲染一个手柄**（并按 hover 定位），因此：① 本地**不会**复现官方的归属漂移问题；② 但若要 1:1 复刻手感（手柄只在沟槽出现、单例、跟随指针），需要改成"单例浮层＋pointermove 驱动"；⇒ 判定＝**结构差、非缺陷差**，登记不排期。
4. ☆ **顺带一条**＝临时注入的 `aria-label`／`role`／`tabindex` 会**跨行保留在同一个节点上**（因为节点是单例）⇒ 只需注入一次，也只需清理一次。

**仍未采到（本机制面）**：手柄行的**写入方**（哪个 handler 监听沟槽 pointermove、是否节流）；幽灵预览与手柄是否共用同一 portal；`sc-1iqnrwp-*` 与 `sc-cyjsqg-*`／`sc-1yfn40-*` 三个 styled 组件的分工；沙盒删除后手柄节点是否残留（本轮未查，属屏上卫生项）。

## 四十、**块 DOM 是"一父五子"的分层（左沟槽／文本／整行／右沟槽／0×0 portal），且官方块落点**不做 y 带数学**（搜证）**（✓屏上反推＋bundle 搜证 第 101 批 2026-09-30 09:0x–09:4x；原始读数在 `gap.md` §三点一〇四七 G1025／G1029、`interactions.md` V95 §三）

1. ★★ **一个正文块的完整子层结构**（本轮第一次把一个块的 `children` 全量读回，沙盒页）：`[data-block-id]`（rect `358,173,654,28`）之下依次＝
   - `div.sc-cyjsqg-0`＝**左沟槽热区**，rect `228,171,250,28` ⇒ 从正文左缘**向外扩 130px**、并向内盖到 x=478（正文 x=358）；
   - `div.sc-3a69oq-1`＝**文本层**，rect `358,175,654,23`；
   - `div.sc-1fwvj4a-1`＝**整行层**，rect `352,173,666,28`（比正文宽 12px、左右各溢出 6）；
   - `div.sc-cyjsqg-1`＝**右沟槽热区**，rect `892,171,250,28`；
   - `div.sc-1fwvj4a-2`＝**0×0 的 portal 容器**（手柄浮层挂这里，承 §三十九）。
   ⇒ 本地含义：官方的"可拖拽热区"不是一个 24px 图标，而是**整条 250px 宽的沟槽**（手柄只是沟槽命中后浮出来的视觉）；本地若只给图标本身可拖，热区小一个量级。
2. ★★★ **块级落点判定里找不到 y 带数学**（一条**反向证据**，务必按证据强度消费）：在已加载的 56 个 JS 资源里，主包 `index-DiTmKH3z.js`（6,841,180 字符）中 `data-block-id` 只出现 **8 次**，且**没有任何一次**与 `clientY` 相邻 600 字符内；全库 `"into"`／`"child"` 位置字面量 **0 次**；能搜到的 `clientY` 数学属于**画廊**（`to < Eo.left + Eo.width/2 ? "left" : "right"`＝水平二分）与**卡片倾斜／白板**（`(clientY - top)/height` 归一化）两类，都不是正文块。⇒ **官方正文块的落点很可能按"命中了哪个 DOM 元素"而不是"点在行的哪一段"来判定** ⇒ 这正好解释第 100 批"落到目标块中心＝插到其前"，并把"落到子块＝嵌套"升为首选假说。⚠ **这是"搜不到"不是"不存在"**：块拖拽的实现可能在未加载的懒加载 chunk 里，也可能用了 `over` 回调而不读坐标。
3. ★★ **同一屏内并存两套按钮体系**（承 §三十五"编辑器内部件是 styled-components 不是 CSS Modules"，本轮把边界画清）：
   - **CSS Modules hash 族**＝DS 按钮：`_button_1bml7_1 _variantPlainDanger_1bml7_165 _sizeMd_1bml7_*`（回收站工具栏）、`_content_16nf6_9`（菜单）、`_wrapper_1fgll_1`（全选框）、`_action_1j891_1`（菜单动作项）；
   - **styled-components 族**＝`sc-wrwa8u-4 bdLahy` ＋ `sc-1bl4h28-1 kvoRFL FilledDanger`（**确认框里的「删除」按钮**）、`sc-1iqnrwp-0`（手柄）、`sc-cyjsqg-*`（沟槽）、`sc-3a69oq-*`／`sc-1fwvj4a-*`（块内层）、`sc-1mvhc0q-*`（正文容器）、`sc-1jxvk3b-*`（标题块）。
   ⇒ 含义＝**确认框不是 DS 组件**（或走的是 DS 的另一份 styled 旧实现）⇒ 本地按 `data-block-id`／`sc-` 找编辑器内部件、按 `_hash_` 找 DS 控件的**双词典规则**再次成立，且新增一条：**弹层/确认框要按 `sc-` 找**。
4. ★ **编辑器的选择模型自持、不镜像进 DOM Selection**：连接器点击与 7 连发都能命中块 DIV、`activeElement` 落在编辑器 DIV、`hasFocus:true`，但 `document.getSelection().rangeCount` 恒 **0**，而 `Alt+↑` 照样生效 ⇒ **a11y／Selection API 读不到官方的光标与选择范围**（第七条仪器边界的另一面）；本地 TipTap 是 ProseMirror 真 Selection，**这条差异无法 1:1，也不该 1:1**。
5. ☆ **页内 `fetch` ＋ 正则回片段**是零预算挖 bundle 的可行通路（本轮用它扫了 56 个资源、定位到 6 个含 `clientY` 的文件、读出画廊落点的水平二分式）：原文不进仓库、不进上下文，只回计数与窗口片段；⚠ 但**只能证明"搜得到什么"，不能证明"官方只有这些"**。

**仍未采到（本内部面）**：正文块拖拽的**真实判定函数**（在哪个 chunk、是否用 `over` 回调）；`pse(el, ctx)` 这个被画廊用的"相对位置"辅助函数的定义；确认框 `sc-1bl4h28-1` 族的完整规则（本轮只读到类名，未读样式）；`sc-cyjsqg-0/1` 两条沟槽的 `pointer-events`／`z-index` 关系（本轮只读到 `pe:"auto"`）；DS 与 styled 两套按钮的**混用清单**（哪些弹层用哪套）。


## 四十一、**一次 OS 拖拽的事件序列画像＝`dragstart:T` ×1 ＋ `dragenter` ×2 ＋ `dragover` ×100＋ ＋ `drop:T:p` ×1；以及"选择集可能跨操作累积"的源码线索**（✓屏上事件计数＋bundle 片段 第 102 批 2026-09-30 10:1x–10:5x；原始读数在 `gap.md` §三点一〇四八 G1036／G1037、`interactions.md` V96）

1. ★★ **判"拖拽是否真的发生"的唯一硬判据＝capture-phase 的 `dragstart` 是否存在**，不是连接器返回值、不是模型是否变化（第 101 批 4 次连接器 `drag` 全部"返回成功＋零 `dragstart`"）。⇒ 采拖拽类行为前**必须先装 `dragstart/dragenter/dragover/drop/dragend` 五名监听**，否则会把仪器失败记成官方行为。
2. ★★ **一次拖拽的事件量级**＝`dragover` 在 150 步移动下发了 **100＋ 次**、`dragenter` 2 次、`drop` 1 次且为 `T:p`（`isTrusted:true` ＋ `defaultPrevented`）⇒ **不能用"事件计数"判命中**（与 §四十"数 checkbox 判不了选择模式"同族盲区）；要判"命中了哪个块"只能在每次 `dragover` 里读 `e.target`（本轮未采，列入下一批）。
3. ★ **`draggedIds` 是 provider 级状态**（bundle 片段：`{canReorder, draggedIds, dropIndicator, onDragStart, onHover, clearDropIndicator, onDrop, onDragEnd}`，且存在 `clearDropIndicator` 但**未见 `clearDraggedIds`**）⇒ 为 D 枪"两处交换"与第 101 批"一次 `Alt+↑` 位移 2 格"提供同一个可能机制（**假说，未证**）；⚠ 采证方式＝在**全新沙盒、零前序操作**下打一枪看是否仍出现多位移。
4. ☆ **`dropIndicator` 是对象不是布尔**（同一段里 `onHover(bc, co, Mi, {top: Ti.top, height: ra.offset…})`＝画廊路数）⇒ 官方的落点指示携带 **top＋height** 两个几何量＝**一条"带"而不是"线"**，与第 98 批屏上所见"整块幽灵"吻合；本地是 ProseMirror `dropcursor` 2px 竖线（`src/components/editor/Editor.tsx:259-261`）⇒ **形状差分继续成立**。
5. ☆ **页内注入的监听器不是产品事实**＝本轮 9 个 `document` 级监听随页面销毁消失（未显式卸载）；⚠ 记录以免下批误以为"官方有常驻监听"。

**仍未采到（本内部面）**：正文块拖拽的真实判定函数本体（本轮只拿到 provider 的返回值形状与画廊路数）；`onHover` 收到的第 3 参（画廊是 `"left"|"right"`）在正文块上是什么词表；`draggedIds` 的清理时机。

## 四十二、**落点判定函数不在主包坐标数学里＝中线规则可能是"命中元素后二分"而非显式阈值；并把"选择集累积"降级**（✓屏上反推＋bundle 搜证 第 103 批 2026-09-30 10:5x–11:3x；原始读数在 `gap.md` §三点一〇四九 G1043／G1044、`interactions.md` V97）

1. ★★ **实现推断**＝官方主包里 `data-block-id` 邻近没有 `clientY` 数学（§四十.2），而屏上行为又精确到"整行中线"一格 ⇒ 两条候选：① 命中块后由**通用 helper** 做 `clientY > rect.top + rect.height/2` 二分（helper 不含 `data-block-id` 字样所以搜不到）；② 走 dnd-kit 的 `closestCenter` 语义（"离哪个块的中心近"在等间距下**数学上等价于中线**）。⇒ **②更能解释"为什么找不到显式阈值"**，且它同时预测：**当块高不等时（长文本块 vs 短行）落点会偏向"中心更近"的那块而不是几何中线** ⇒ 一条可证伪的预测，列入第 104 批。**✎ 第 104 批作废＝两条候选同时排除**（四次拖拽 397 条 `dragover` 的 target **全部**是正文容器 `DIV.sc-vts49g-1 deoTMl`（rect `top 48 × h 504`）、**没有一条**落在 `[data-block-id]` 行上 ⇒ 既不是"命中块后交给 helper"，也不是 dnd-kit per-row droppable；且"不等高块"实验本身不可判＝扁平兄弟里 after A ≡ before B 同一槽位 ⇒ 见 §四十三.2 与 G1054／G1056）
2. ★★ **"选择集累积"降级**＝该假说的预测是"同沙盒多枪后出现多位移"；本批同型操作（同沙盒 4 枪）**0/4 命中** ⇒ 从"假说"降为"偶发未证"。⚠ 未直接否证（第 102 批那枪的前序是 3 次**跨不同源块**的拖拽，本批也是跨源块 ⇒ 形状相同、结果不同 ⇒ 更可能是**那一次的抖动**，例如 drop 时正赶上预览重排的中间态）。
3. ★ **锚点歧义的新教训**＝`/Plain MediumSmall/` 在新视口命中 3 枚按钮 ⇒ **类名锚点必须回读结果判据**（`role=menuitem` 非空）才算成功；本轮第一次尝试因此静默失败（**没有**误触发任何动作，四计数复核 0）。
4. ☆ **仪器读数纪律再获一证**＝每枪的 `dragstart`/`drop` 计数都是"一枪一次"，与"模型只发生一次位移"互相咬合 ⇒ **事件计数＋几何序＋`blocks get` 三读一致**才算一条落点结论成立。

**仍未采到（本内部面）**：候选 ②（`closestCenter`）的正面证据；正文块拖拽真实判定函数本体；`draggedIds` 清理时机（本批未见累积迹象，可能根本每次清）。
## 四十三、**拖拽事件的 DOM 目标恒为正文容器＝逐块判定是 handler 内的 clientY 数学；`closestCenter` 与"命中行后二分"两条候选同时排除**（✓屏上事件日志＋bundle 反推 第 104 批 2026-09-30 12:2x–12:5x；原始读数在 `gap.md` §三点一〇五一 G1054／G1056）

1. ★★★ **事件目标拓扑到手**＝`dragstart.target = DIV.sc-1iqnrwp-0 fchNe`（手柄，rect 高 31、top 逐次跟随源行）；**`dragover`／`drop`／`dragend` 的 target 分别是 `DIV.sc-vts49g-1 deoTMl`（正文容器，rect `top 48 × h 504`）与手柄自身**，四次拖拽 397 条 `dragover` 里**没有一条**落在 `[data-block-id]` 行元素上 ⇒ **"命中哪一行"完全由 handler 用 `clientY` 自算**，DOM 只提供事件。
2. ★★★ **两条旧候选作废**＝第 103 批 §四十二.1 猜的"①命中块后通用 helper 二分"与"②dnd-kit `closestCenter`"都要求事件落在块元素上（dnd-kit 的 `closestCenter` 也仍需 droppable 注册到行），而实测事件目标是容器 ⇒ 新候选＝**容器单一 droppable ＋ 自算最近行带**（与 §四十.2"主包 `data-block-id` 邻近零 `clientY` 数学"仍然相容：数学在 styled 容器组件里，不在块节点上）。
3. ★★ **一条实验设计教训（省预算）**＝"不等高块区分 `closestCenter` vs 中线"根本不可判——扁平兄弟列表里"after A"与"before B"是同一槽位，两模型必然同解 ⇒ **落点类假说先问"它能否产生不同槽位"**；本批改用"沟槽＋上下越界"才拿到区分度（G1056）。
4. ☆ **一次拖拽的事件配额**（给后续批次定成本）＝`dragstart` 1 ＋ `dragover` ≈ 99 ＋ `drop` 1 ＋ `dragend` 1 ⇒ **计数事件不能用来数"命中了几次"**，只能用 `dragover` 的 `clientY` 序列反推轨迹。
5. ☆ **本地同族但不同实现**＝本地也是"容器收事件＋自算"（`DragHandle.tsx:131-136` 遍历 `view.dom.children`）⇒ **不需要引入 dnd-kit 的 per-row droppable**；要补的只有命中带与上夹紧（见 `model.md §一之六十二.4`）。

**仍未采到（本内部面）**：正文组件 `sc-vts49g-1` 的判定函数本体（未反编译，本轮预算给了行为）；插入指示线的 DOM 类名与它在沟槽里的落点归属；`draggedIds` 清理时机。

## 四十四、**官方色阶的两段构造法＝下段 alpha 派生（`rgb(var(--基色) / P%)`）、上段字面 rgb；同一份色阶在三个选择器下各写一遍；`:where()` 特异性 0 ＋ `!important` 三件套是"全局规则能插进组件里"的两根支柱**（✓盘上 第 105 批 2026-09-30 13:1x–14:1x，零浏览器＝已落盘主 CSS 的定点读；逐字值表在 `styles.md §十二.二／四／九`，gap 行在 `gap.md` §三点一〇五二 G1066／G1067）

### 一、`--X-<档>` 不是"一组颜色"，是**两种不同算法**

| 段 | 档位 | 写法 | 定义处 | 随主题变吗 |
| --- | --- | --- | --- | --- |
| **下段** | `-50 … -500`（步长 50，10 档）；前景族另有 `-0`／`-25` | `rgb(var(--基色) / P%)`，**P 是固定映射**：色板族 `6｜12｜18｜24｜32｜40｜55｜70｜85｜100`，前景族 `0｜2｜3｜4｜6｜8｜10｜12｜18｜25｜32｜40｜48｜55｜62｜70｜78｜85｜92｜100` | `:root,.token-scope` | **是**（只改基色三元组，20 档自动跟变） |
| **上段** | `-550 … -900`（步长 50，8 档） | **字面 `rgb(r g b / 100%)`**，逐档等步长变暗 | 裸 `:root`（light）＋ `[data-theme=dark]` scale 块（dark） | **否**（暗档必须逐档另写一套） |

⇒ ★★ **设计上这等于把"色阶"拆成两半：一半交给运行时、一半交给人手**。⇒ 本地要复刻时必须**分别实现**：只抄下段（用 alpha）能自动跟主题，但 `-550+` 在暗档会整体错位（官方在暗档是**变亮**：`--red-900` light `rgb(118 39 42)` → dark `rgb(251 176 177)`）。
⇒ ☆ **同一个后缀数字跨族不是同一量纲**：`-50` 在前景族＝3% 透明、在色板族＝6% 透明、在 brand 族又是另一套（`brand-red-50`＝3%）⇒ **换算表不能跨族共用**（与 §十一 的结论一致，本批补上了精确百分比）。

### 二、同一份色阶**在三个选择器下各写一遍**（实测重叠逐字节相同）

| 选择器 | 作用域意图 | 与本块重叠 |
| --- | --- | --- |
| `:root`（裸，`@layer utilities`） | 全局默认（不需要主题属性就能取到色阶） | 与 `[data-theme=light]` scale 块重叠 **48 条**（＝上段 `-550…-900`），值逐字节相同 |
| `:root,.token-scope`（`@layer utilities`） | ★ **公开的"子树级 token 作用域"接口**：任何子树挂 `.token-scope` 就自带整棵下段色阶（弹层／导出容器／iframe） | 与 `[data-theme=light]` scale 块重叠 **60 条**（＝下段 `-50…-500`），值逐字节相同 |
| `[data-theme=light]` scale 块（`@layer components` 末段） | 主题档显式重述 | 116 vars 里 **108 条是纯重复** |

⇒ ☆ **另有一处"整块重复"**＝200-var 的 `[data-theme=light]` 与 38-var 的 `[data-theme=dark]` 各在 `@layer base` 与 `@layer utilities` **输出两次、逐字节相同**（实测 `block0===block4`、`block1===block5`）⇒ **构建产物的重复，不是两套语义**；读官方 CSS 时不能按"出现次数"当"配置项数量"。
⇒ ☆ **层叠胜者未实测**：三者特异性同为 (0,1,0)，按层序 base＜utilities＜components 推断是 components 里的 scale 块胜出，但本批未做浏览器验证 ⇒ 记为推断（`styles.md §十二` 尾「仍未采到」同步登记）。

### 三、全局规则"插进组件里"用的两根支柱（都是**降低特异性**而非提高）

1. **`:where(...)`**＝特异性 **0** ⇒ 官方那条触摸按压全局规则**任何组件都能覆盖**，不需要 `!important` 提权（它只在必须压过组件自己的 `transition` 时对三个属性用了 `!important`）。
2. **`display:contents`**（`_searchList`）与 **`pointer-events:none`**（复选框 `_checkbox`，点击交给外层 wrapper）⇒ **"盒模型不参与"是官方浮层与表单控件的通用手法**，配套的是"命中区比可见框大"（wrapper 20px vs 框 18px）。
3. ☆ 状态类命名规律（本批再添 6 例）＝`_isStatic`（禁用反馈）、`_isActive`、`_isHoverable`、`_hasIcon`、`_isOnlyIcon`、`_isDropdown`，**外加属性闸门** `[data-disabled]`／`[data-popup-open]`／`[data-checked]`／`[data-indeterminate]`／`[data-orientation]`／`[data-ds=avatar]` ⇒ **官方把"状态"同时放在类与 data 属性两处**，读 CSS 时两处都要抓，只抓类会漏（`_variantPlain` 的 hover/focus/popup-open 三态就写在属性上）。

### 四、对本地实现的三条硬约束

1. **输入意图闸门**（`data-whatintent`）本地全库零对应物 ⇒ 不补它，触摸／键盘／鼠标三档的反馈与焦点环**不可能对齐**（G1063／G1064 的根因是同一条）。
2. **`.token-scope`** 本地无 ⇒ 浮层／导出预览／分享页这些"需要独立 token 树"的容器只能读全局；官方的做法是**同一棵色阶可被子树重挂**。
3. **档位必须分两段实现**（下段 alpha、上段字面）⇒ 本地现在连一个 `--X-<数字>` 档位都没有（`src/app/globals.css` 实测零命中），所以任何"直接抄官方某个 `-350` 值"的做法都会**在暗档失效**。


## 四十五、**资产文件名与真实归属不符＝`vendor-code-editor.css` 里 100% 是 KaTeX；CJK 字体包是 python 脚本拼出来的（源路径＝`_语言/类别/家族/fontdef.css`）；构建器把小字体内联成 data URI；`@container` 具名容器查询是官方布局的第二套断点**（✓盘上 第 106 批 2026-09-30 14:3x–15:2x，零写入批＝只读取回 12 份 CSS；逐字值表在 `styles.md §十三`，gap 行在 `gap.md` §三点一〇五六 G1069／G1070／G1072／G1074／G1075）

### 一、★ 三条"文件名骗人"的证据链（⇒ 以后按名字选题会选错，必须按内容判归属）

| 资产名 | 名字暗示 | 实测内容（本轮逐字） |
| --- | --- | --- |
| `vendor-code-editor.css.DkZwelau.css` | 代码编辑器（CodeMirror／Monaco）样式 | **29,193 字符里全是 KaTeX 0.16.25**＝20 个 `@font-face`（12 个 `KaTeX_*` 族）＋ 368 条选择器（其中只有 1 条不是 `.katex` 作用域＝`body`）＋ `.katex-version:after{content:"0.16.25"}`；**`.cm-*` 0 命中** |
| `fontdef.common.css` | 通用字体定义 | **是 CJK 专用拼接产物**，45 faces／15 个 family；文件头注释逐字点名生成方式（见 §四十五.二） |
| `vendor-excalidraw.css.tkYuNB5W.css` | 第三方白板样式（正确） | 但**它是第二套完整设计系统**＝67 个 `--color-*` 名／108 条定义、主色紫 `#6965db` 与主 app 强调蓝并存，且**整份 0 处 `[data-theme]`／`prefers-color-scheme`**（暗色靠运行时 JS 覆写变量） |

⇒ ☆ 推论＝**"官方代码块语法高亮在哪"这个问题被本批收窄但没有结案**＝排除了"在 13 份 CSS 里"，剩下两种可能（JS 注入 class＋运行时样式／在未落盘的 chunk 里）。⇒ 反编译入口已备好＝`index.css` 里 code-ish 的类只有 `token-scope`（子树 token 作用域，§四十四.二）与预览卡族的 `_code`／`_codePlaceholder`。

### 二、★★ CJK 字体包的构建真源（本轮从注释逐字恢复，属"官方自己的构建契约"）

`fontdef.common.css` 头部注释逐字＝
```
Generated by scripts/build_cjk_common_css.py. DO NOT EDIT.
Concatenation of every CJK language-pack fontdef.css except
_japanese/rounded/m-plus-rounded-1c, which is injected as its own
stylesheet. Regenerate after editing any source:
    python3 scripts/build_cjk_common_css.py
Sources:   （15 行路径）
```
⇒ ★ **源目录树是"语言 × 类别"二维**＝`_japanese/{mono,sans,serif,rounded}`／`_korean/{mono,rounded,sans,serif}`／`_simplified-chinese/{mono,rounded,sans,serif}`／`_traditional-chinese/{mono,rounded,sans,serif}`，共 15 个 `fontdef.css`，与 15 个 CJK family 一一对应。
⇒ ★ **唯一被排除的是 `_japanese/rounded/m-plus-rounded-1c`**＝它单独成一份 CSS（308,022 字符／354 faces）⇒ 排除原因可从体量反推（**它一份＝其余 12 份之和的 55%**），但**注释里没写原因**，本条按"证据不足"记录。
⇒ ☆ 路径形态差＝common 里的 `src` 是**回溯引用**（`url("../../_japanese/mono/noto-sans-mono/noto-sans-mono-jp-variable.woff2")`＝字体留在原语言目录），m-plus 里是**同目录引用**（`url("m-plus-rounded-1c-400.0.woff2")`）⇒ 拼接脚本**只搬 CSS、不搬 woff2**。
⇒ ★ 对本地构建的启示＝**语言×类别目录树 ＋ 一个生成脚本 ＋ 显式排除表**是官方把"21 个 family"管住的办法；本地若只做 `next/font`，就没有这层结构（本地只有 1 个 family）。

### 三、★★ 构建器内联与哈希命名（同一份 KaTeX CSS 里的两种产物形态）

| 现象 | 逐字证据 | 判定 |
| --- | --- | --- |
| **20 个 face × 3 格式＝60 个 `url()`，其中恰好 1 个是 data URI** | `KaTeX_Size3/400` 那一支的 `src` 以 `url(data:…` 开头（全文件 `url(data:` 计数＝1）；其余 59 个指向 `/static/<名>-<哈希>.woff2｜.woff｜.ttf` | ⇒ **构建器按体积阈值内联**（Size3 那一支最小，被内联；同目录的 `BlankFont.css` 里 `AdobeBlank` 也是 base64 内嵌＝同一套机制的两个实例） |
| 格式三元组 | `format()` 取值全集＝`woff2`／`woff`／`truetype` | ☆ 与本地 `next/font` 的"只出 woff2"是两种策略（官方仍保 woff／ttf 兜底） |
| 哈希名 | `/static/KaTeX_AMS-Regular-BQhdFMY1.woff2` | ⇒ 内容指纹进文件名＝可长期强缓存（与本地 Next 构建的 `_next/static/media/…` 同族，**一致**） |

### 四、★★★ 官方有**两套断点体系**＝视口 `@media` ＋ **具名容器 `@container`**（本批首次撞到，`TaskViews.css` 逐字）

⇒ 结构＝`@media (width >= 748px) { @container web-shared-layout-main-wrapper (width >= 600px) { …三条覆写… } }`，另有独立的 `@media (width <= 747px) { _title{min-height:48px} }`。
⇒ 机制读法＝**容器名 `web-shared-layout-main-wrapper` 说明主布局有一个具名容器**（侧栏折叠会改变它的宽度而不改变视口）⇒ ① 官方把"内容区宽度"当作一等公民，而不是"屏幕宽度"；② 双层是**合取**（视口宽 **且** 容器宽 ≥600 才提回第一行）；③ 历批"侧栏展开／收起两档"的几何读数（第 96／97 批）此前被理解为视口量，**应改读为容器量**＝⚠ 本条**未屏上复验**（本批零交互），列第 107 批队列②。
⇒ ✎ **声明处本批落盘时补检索已找到**（初稿写"没找到"是**没跑检索**，就地作废）＝`index.css` @134,582 逐字 `._mainWrapper_6sjpd_20{display:flex;flex-direction:column;height:100%;container-type:inline-size;container-name:web-shared-layout-main-wrapper}`；⇒ ★ **全 13 份 `@container` 共 6 处，其中 4 处是匿名查询**＝沿最近祖先容器（也就是这个 `_mainWrapper`）⇒ **官方列表视图的列显隐按内容区宽度分档**（≥768 出「更新／创建」、≥1024 出「最后查看」，逐字见 `styles.md §十三.九`，gap 行 **G1079**）。⇒ ☆ **纪律补一条＝写"找不到"之前必须先跑一次全库检索**（本目录第三次同类自我纠正，前两次见 §四十三 与 §三十四 的 ✎）。
⇒ 本地对照＝本地全库走 Tailwind 的 `md:`／`max-md:` 视口断点（如 `src/app/(app)/collections/[id]/TableView.tsx:154` 的 `first:max-md:sticky`）⇒ **没有任何 `@container`**＝缺失（机制），影响＝侧栏折叠时本地不会换档。

### 五、`--st-*`＝组件向宿主**要**主题、并自带兜底（一套可复制的接口范式）

⇒ 21 条定义／28 个被 `var()` 消费的名字 ⇒ **其中 8 个只被消费、从不定义**（`--st-page-bg-hover-opaque`、`--st-selection-bg-opaque`、`--st-selection-hover-bg-opaque`、`--st-border-color`、`--st-selection-color`、`--st-accent-selection`、`--st-grid-columns`、`--st-font-family`），每个都带第二参兜底；另有 **1 条定义了却没有任何消费点**（`--st-z-index-cell-header: 2`＝死变量）。
⇒ ★ 范式＝**"内部变量自己定义，外部变量只消费并兜底"** ⇒ 表格组件不 import 主 app 的 token 名，宿主不注入也能渲染（兜底里甚至写了 `Inter, system-ui, sans-serif` 这种字体栈）。
⇒ ☆ 与第 105 批 §十二.5 的 `:root,.token-scope` 是**两种不同层级的复用机制**＝`token-scope` 重挂整棵色阶，`--st-*` 是单个组件的窄接口。本地两者都无。

**仍未采到（本节）**：~~`container-type`／`container-name` 的声明处（在 JS 还是内联 `style`）未证~~ ⇒ ✎ **本批结案**（在 `index.css` 的 CSS-Module 族 `_6sjpd_` 里，见 §四十五.四）；`--st-*` 8 个宿主名的注入方未反编译；`AdobeBlank` 的注入点未找到（CSS 层 0 引用）；官方代码块高亮的真身（JS 注入 vs 未落盘 chunk）未取证；`build_cjk_common_css.py` 的完整逻辑只从注释反推，脚本本体不在前端资产里；白板暗色"JS 覆写 `--color-*`"的具体写入方未读到；★ 本批**未做任何反编译**（零 JS 读），以上四条都需要下一批开码路。

## 四十六、**输入意图闸门的完整链路结案＝第三方库写属性 ＋ 官方自研编译层改写伪类 ＋ 两套样式体系各用一个属性；代码块按语言分三条渲染路（CodeMirror 6 的样式由 StyleModule 运行时注入 ⇒ 这才是 `.cm-*` 不在 13 份 CSS 里的真因）；`--st-*` 是双向通路（JS 注入 ＋ JS 反读 CSS，兜底值双写）；`AdobeBlank` 是字形探测器不是兜底字体**（✓盘上 第 107 批 2026-09-30 15:4x–16:0x，**零浏览器调用**＝读数全部来自 `_harvest/js/` 已缓存的 105 个 chunk 与已落盘的 `index.css`；逐字值表在 `styles.md §十四`／`longtail.md §三十三`，gap 行在 `gap.md` §三点一〇五七 G1080–G1091）

### 一、★★★ `[data-what*]` 不是 Craft 写的：三层链路拆开看

⇒ **第 1 层（属性来源）＝开源库 `what-input` v5.2.12（MIT）**，落在 `vendor-BZCR0rqu.js` @2,527 的文件头注释里逐字可证（连 `@link` 都留着）；写入函数逐字＝`documentElement.setAttribute("data-what" + Xa, Xa === "input" ? lastInput : lastIntent)` ⇒ 属性名是**拼出来的**（这就是为什么在第 100 批之前的码路检索里按字面串搜 `data-whatintent` 会 0 命中——**只能搜到 CSS 侧的消费点**）。
⇒ ★ **属性一共四个**＝`data-whatinput`（上一次输入类型）、`data-whatintent`（当前意图）、`data-whatelement`（`activeElement` 的标签名小写）、`data-whatclasses`（其 classList，空格换逗号）；☆ 后两个是**诊断属性**（官方线上 DOM 里就挂着，历批屏上读数时可以从 `documentElement` 的 attribute 里直接看到，本批是第一次从代码侧确认来源）。
⇒ **第 2 层（官方自研编译层）＝把标准伪类改写成属性选择器**，逐字规则见 `interactions.md` V101 与 `gap.md` G1081；⇒ ★ 关键读法＝**开发者其实写的是 `:focus-visible`／`:hover`／`:not(:hover)`／`:raw-hover`，产物 CSS 里看到的是 `[data-whatintent]:not([data-whatintent=touch]) …`** ⇒ 历批"官方根本不用 `:focus-visible`"（第 100 批 G1012 一带）这句结论要**降级**：不是"不用"，而是**用了但在编译期被换掉了**。
⇒ **第 3 层（两套样式体系各用一个属性）**＝CSS Modules（静态产物）用 `data-whatintent`、styled-components（运行时注入）用 `data-whatinput` ⇒ ☆ 复刻时**两个属性都得写**，否则一半规则永远不命中；⇒ ★ 应用自己也把属性当状态源（`document.querySelector("[data-whatinput]")?.getAttribute("data-whatinput") ?? null`）＝**用 DOM 属性代替 React state 传递"当前输入方式"**（跨组件、无订阅）。

### 二、★★★ 代码块不是一个 `<pre>`：按语言分三条渲染路

⇒ 分派点逐字＝`langCode === "mermaid"` → 动态 `import("./MermaidRender-*.js")`（走 `__vite__mapDeps` 懒加载）→ `renderMermaidDiagram(text, { themeId, isDark })` → 失败 `catch` 回落成 `<pre white-space: pre-wrap;">Invalid Mermaid syntax: …</pre>`；公式档（`math_formula` → `stex`）→ `renderMathFormula(text)` → 失败回落到普通高亮；其余 37 档 → CodeMirror 编辑器本体；⇒ ★ 三条路的产物**都是 `dangerouslySetInnerHTML:{__html}`**（图与公式是 HTML 注入，不是 canvas／iframe）⇒ 复刻时的安全边界要自己划（官方没做净化，因为它自己生成）。
⇒ ☆ 空内容的处理是**显式短路**（`if (!text?.trim()) { setHtml(null); … return }`）＝**不画占位、不报错**。
⇒ ★★ **为什么 13 份 CSS 里没有 `.cm-*`（第 106 批留下的疑点）＝CodeMirror 6 用 StyleModule 运行时注入样式**：逐字 `new StyleModule(…, { finish(l) { return /&/.test(l) ? l.replace(/&\w*/, …) : l } })`，且暗档靠**两个运行时生成的类名**＝`W9t = {"&light": "." + newName(), "&dark": "." + newName()}` ⇒ **官方有两套暗档机制**（主 app 靠 `[data-theme=…]` 三段重指、白板靠 JS 覆写 `--color-*`、代码编辑器靠运行时类名）——三种暗档通路在同一产品里并存，这是本批最系统的一条结论。
⇒ ☆ 官方明确关掉的编辑器能力（逐字 `basicSetup`）＝`searchKeymap:false`、`foldGutter:false`、`highlightSelectionMatches:false`；开着的＝`closeBrackets:true`、`highlightActiveLine(Gutter): 仅可编辑时`、`autocompletion: 仅 surface==="web"`；⇒ **代码块里没有搜索、没有折叠**（此前直觉"专业编辑器都该有"不成立）。
⇒ ☆ 另有 `CodeEditorFocusMode`（4,757 字符的独立 chunk）＝**代码块专注模式**是懒加载的独立面；grammar 能力面（vendor 里的语言名）**大于**选择器的 39 档 ⇒ "能解析"与"能选"是两份名单。

### 三、★★ `--st-*` 是**双向**通路，且兜底值在两边各写一遍

⇒ **注入方向**＝① React 内联 style 对象（`{"--st-grid-columns": l, "--st-row-height": dt}`）② `style.setProperty("--st-scroll-left", `${scrollLeft}px`)`（滚动回调里，另有一处在 `requestAnimationFrame` 内与 `transform: translateX(-f px)` **同时**写）。
⇒ **反向读取**＝`getComputedStyle(el)` → `parseFloat(getPropertyValue("--st-row-height"))`，缺省回落 **35**、`--st-index-column-width` 回落 **45** ⇒ ★ **CSS 是几何的唯一真源、JS 只是消费者**，而 35／45 这两个数**在 CSS 与 JS 各写了一次**（官方自己的双写风险：改 CSS 不改 JS 会出现"渲染与测量不一致"）。
⇒ ☆ 浮层侧＝`EditorPopup` 把 `--st-font-family`（**从锚点元素的 computed style 里读出来**）、`--st-text-color`、`--st-border-color` 注入弹层 ⇒ **"单元格里的编辑器浮层继承该单元格的字体与色"** 是靠变量透传实现的，不是靠 props 逐层传。
⇒ ★ 与第 105 批 §十二.5 的 `:root,.token-scope` 对照＝**两种层级的复用机制**：`token-scope` 重挂整棵色阶（容器级），`--st-*` 是单组件的窄接口（组件级，且带内置兜底）。本地两者都无。

### 四、★★★ `AdobeBlank` 的真实算法＝"宽度为零 ⇒ 没有字形"（**推翻第 106 批 G1073 的作用判定**）

⇒ 调用体逐字拆解＝① 先 `document.fonts.load("1rem AdobeBlank", 首个字符)` **确保字体就绪**（否则 measure 会拿到回落字形的宽度）；② 建 `position:absolute; width:0; height:0` 的 canvas **追加进 body**（★ 不追加进文档就测不到，说明它必须参与布局）；③ `ctx.font = '1em "Apple Color Emoji", "Android Emoji", "Segoe UI Emoji", AdobeBlank'`；④ **`filter(c => ctx.measureText(c).width !== 0)`** ＝保留"有宽度"的那批，反过来说**宽度 0 的字符被判为"整条栈都没有字形"**；⑤ 测完 `canvas.remove()`。
⇒ ☆ 第二条分支（非 Web 通路）＝`ctx.font = '10px sans-serif"'` ＋ 取一个基准串的 `measureText(...).width / 2` 作阈值比较（⚠ 该基准串在盘上副本里是非 ASCII mojibake ⇒ **只记形状、不抄字面**，承「bundle 非 ASCII 会误解码」那条已知边界；且该串末尾多了一个 `"`，看着像官方源码里的引号错位，**不当缺陷登记**）。
⇒ ★ **结论改向**＝`BlankFont.css` 不是"渲染兜底"而是**检测用字体**，所以它**不需要**被 `font-family` 引用（CSS 层 0 引用是设计而非遗漏）。⇒ 对本地的直接影响：历批建议的"把空白字体挂到字体栈末位"**是错的方向**，真正要补的是一条字形探测通路（`gap.md` §〇「六」已改）。

### 五、★★ CJK 字体 CSS 是**运行时按 locale 注入**的（⇒ 名册读数带 locale 条件）

⇒ 注入清单**只有两条**＝`["_cjk/common/fontdef.css", "_japanese/rounded/m-plus-rounded-1c/fontdef.css"]`；触发白名单＝`["ja", "ko", "zh-Hans", "zh-Hant"]`；⇒ 建链逐字＝`link.rel="stylesheet"` ＋ `link.setAttribute("data-cjk-font-css","true")` ＋ `fetchpriority` 显式档 ＋ **`media="print"` 然后 `onload → media="all"`**（非阻塞 CSS 注入的标准形）；幂等闸门＝`document.head.querySelector('link[data-cjk-font-css]') != null`。
⇒ ☆ URL 形状＝`${publicUrlPrefix}/static/fonts/${构建号}/${路径}`，其中构建号形如 `r-48-g<hash>`；⇒ ★ **同一段里有一条恒假分支**（`!IS_DESKTOP && !1`）＝桌面／Web 两套前缀的开关被常量折叠，只余 Web 路 ⇒ **复刻时不要按"桌面走另一套路径"建模**（当前构建里那条路不存在）。
⇒ ☆ 语言归一化＝12 个 locale 的**前缀表**（`"zh-Hans":["zh-CN","zh-Hans","zh"]`、`"zh-Hant":["zh-TW","zh-Hant"]`、`"pt-BR":["pt-BR","pt"]`），匹配法＝把候选串按长度降序排好后做 `startsWith` ⇒ **`zh-CN` 会先命中 `zh` 之前的长串**，这条排序是有意的。
⇒ ★★ 对既有结论的影响＝第 106 批"13 份全部落盘"要加限定＝**本批读数是中文 locale 下的 13 份，英文 locale 下应为 11 份**（已在 `gap.md` G1069 就地 ✎）；☆ 顺带解释 `internals §四十五.二` 的"m-plus 为何不并进 common"＝**它两份都是运行时单独注入的 link**，`build_cjk_common_css.py` 的排除表与此吻合。

### 六、☆ 本批方法学（零浏览器的定点读，怎么做的）

⇒ 检索面＝`_harvest/js/` 的 **105 个 chunk**（历批缓存，本批**没有新增任何下载**）；⇒ 三条硬技巧＝① **先按"引用关系"选题**（扫全部 chunk 的 import 串找 `vendor-code-editor` 的引用方 ⇒ 一次得 14 个消费者，直接证明"代码块是跨面组件"＝⚠ **该推论已在第 108 批作废**（逐符号拆开后 14 处具名引用里 13 处只引 Vite 预加载 helper，真引 CM6 符号的只有 `CodeEditorWrapper` 一个 ⇒ 修正结论＝**CM6 是单一消费者组件**，见 §四十七.六 与 **G1104**））；② **属性名可能是拼出来的**（`"data-what" + Xa`）⇒ 按字面串 0 命中时，要退到**库名／注释／`setAttribute(` 调用点**三路再搜；③ **数组字面量要用括号配平取整表**（39 项语言三元组、`_6sjpd_` 类名表都是这么出来的，别按 `]` 首次出现切）。
⇒ ⚠ **本批没有做任何屏上验证** ⇒ G1087（Mermaid 是否有界面入口）、G1079（容器变宽的实际表现）、G1076（框选）三条**全部欠屏幕证据**；G1085 的"英文 locale 下 11 份"是**由代码推论、未复采**。

**仍未采到（本节）**：官方是否显式 `import` 了 what-input 的 CSS 侧配置（`specificKeys`／`ignoreKeys` 的实际入参本批只读到默认桩，未见调用参数）；`:focus-visible-within` 这条自造伪类的**完整改写分支**只读到三条（`:not(:focus-visible)` 那条的替换串未看全）；`--st-*` 其余 5 个宿主名（`--st-page-bg` 系列的注入点）未逐一定位；`MermaidRender` chunk 未读（渲染参数与主题映射表未知）；`CodeEditorFocusMode` 的触发入口未读；☆ grammar 能力面比 39 档大多少**未量化**；`tok-*` 28 档的**具体配色**未抄（只拿到类名）；★ 本批零屏上动作 ⇒ 意图闸门的可达性（V101 三条规则）与"表单控件里冻结 intent"**全靠代码断言**。

## 四十七、**代码块主题体系结案＝一个 `createTheme` 工厂 ＋ 20 档名册 ＋ 三处颜色来源（`tok-*` 那套在本构建里没有配色来源）；浏览屏网格是"按容器宽算列数"的四条公式；`data-whatinput` 与 `data-whatintent` 的写入分工在屏上被证实可以背离；★ 一条新的仪器边界＝`document.hasFocus()===false` 时 `:focus` 全链不匹配**（✓盘上＋屏上 第 108 批 2026-09-30 16:1x–16:5x，**零写入、零沙盒**＝盘上读 `_harvest/js/` 105 个 chunk ＋ 屏上 8 次只读 `evaluate_script`；`manifest.jsonl` **148 行不变**；逐字值表在 `styles.md §十五`／`longtail.md §三十四`，gap 行 `gap.md` §三点一〇五八 G1092–G1104）

### 一、★★★ 代码块主题的装配链（逐字）＝一个工厂 ＋ 一张名册 ＋ 一个 `auto` 解析器

⇒ **工厂**＝`gBn = r => { const {theme:i, settings:s, styles:l} = r; … return [ li.theme(O, {dark: i === "dark"}), R6e(uE.define(l)) ] }`（`li.theme`＝CM6 `EditorView.theme`、`R6e`＝`syntaxHighlighting`、`uE.define`＝`HighlightStyle.define`）⇒ ⇒ ★ **每档主题一次产出两条扩展＝容器样式 ＋ token 上色**，所以**颜色天生跟着主题走、与 app 的 `--accent-*`／`--editor-*` 无关**（☆ 全库只有 Excalidraw chunk 出现一次 `--editor-`）；
⇒ **settings → CSS 的映射逐条**＝`background`／`foreground` → `&{}`；`gutterBackground`／`gutterForeground`／`gutterBorder` → `.cm-gutters`；`fontFamily` → `&.cm-editor .cm-scroller`（★ **只作用在 scroller，正文 `.cm-content` 不单独设字体**）；`caret` → `.cm-content{caretColor}` ＋ `.cm-cursor, .cm-dropCursor{borderLeftColor}`；`lineHighlight` → `.cm-activeLine` ＋ `.cm-activeLineGutter`；`selection` → 三条并列选择器（`&.cm-focused .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection`）；`selectionMatch` → `& .cm-selectionMatch`；
⇒ ☆ **缺项就是不写**（`craftlight` 的 settings 没有 `caret` 与 `gutterBorder` ⇒ 官方亮档代码块的插入符走 CM6 默认）；
⇒ **名册**＝`ue={auto:null, craftdark, craftlight, atomone, aura, bbedit, darcula, dracula, githubdark, githublight, gruvboxdark, gruvboxlight, materialdark, materiallight, noctislilac, nord, sublime, tokyonightday, tokyonightstorm, tokyonight, vscodedark}`（21 键，源 `CodeEditorWrapper-DB8UxA00.js` @28,692）；**`auto` 解析**＝`De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]` ⇒ ☆ **`auto` 落到"官方自写的那两档"**，其余 18 档是具名第三方配色；
⇒ ⚠ **官方标签错配候选**＝`craftdark` 由 `fo()` 产出，而 `fo` 的形参默认是 `theme:"light"` 且**调用时没有覆盖** ⇒ 注册进 CM6 的是 `{dark:false}`；`craftlight` 同理默认 `light`（那条是对的）；⇒ ☆ 后果（`.cm-editor` 的 dark 侧默认样式／`color-scheme`）**未屏上复验**，按纪律只登记形状、不判官方缺陷（`longtail.md §三十四.二`）。

### 二、★★★ 三处颜色来源结案 ＝ `tok-*` 那套在本构建里"无色可用"（⇒ ✎ 第 107 批 `longtail §三十三.四` 的用途判定）

⇒ ① **主题自带 `styles`**（见 §一）＝实际生效的那一套；② **CM6 默认样式当 fallback**＝`basicSetup` 逐字 `i.syntaxHighlighting !== !1 && l.push(R6e(v2n, {fallback:!0}))`，`v2n`＝14 个硬编码 hex 的 `HighlightStyle.define`；③ **`tok-*` 的 30 条表**＝@lezer/highlight 的 **class 表**，逐字工厂是 `function n_t(r,i){ let s=Object.create(null); for (let p of r) if(!Array.isArray(p.tag)) s[p.tag.id]=p.class; else for(let g of p.tag) s[g.id]=p.class; … return {style(p){…}} }` ⇒ ⇒ ★ **它只把 tag 映射成 class 名、完全不含颜色**；而**13 份 CSS 里 `.tok-*` 规则 0 条、chunk 内规则形态 0 条** ⇒ ⇒ **本构建里 `tok-*` 体系即便被挂上也不会渲染色**；⚠ 未证＝它到底有没有被注册（`extensions:ge` 里有未展开的 `...g`）⇒ 记在「仍未采到」；
⇒ ☆ 修正后的名册＝**29 个不同 class 名／30 条声明**（真名带 camelCase：`tok-labelName`、`tok-variableName`、`tok-variableName2`、`tok-propertyName`、`tok-typeName`、`tok-className`、`tok-macroName`）⇒ 第 107 批记成 28 个是因为**正则只收了 `[a-z0-9]+`、把 camelCase 截断了**（同批 §三十三.四 已就地 ✎）；
⇒ ⇒ 对本地的含义（G1094）＝官方是"主题级颜色"，本地是"`hljs-*` ＋ CSS 类"，**两套不可映射**；要补就做一层代码主题变量（`--code-bg`／`--code-fg`／`--code-selection`／`--code-caret`／`--code-line-highlight`／`--code-gutter-*`），不要往 `hljs` 类上抄 hex。

### 三、★★ 浏览屏网格＝四条公式（不是断点）⇒ 官方"列数"是容器宽度的纯函数

⇒ 逐字常量与用处（结掉第 107 批 §三十三.二 那条"12 个常量含义未定"）＝基准卡宽 `ob=200`、桌面 gap `ic=20`、窄档／移动 gap `D7=8`、左右内边距 `$h=16`、卡宽上限 `FEt=268`、列数上限 `NEt=5`、**卡片宽高比 `of=1/1.25`**（★ 结案＝**不是 DPR**，用在 `height = width / of` 与 `boxAspectRatio:of` ⇒ 高＝宽×1.25）、封面图请求宽 `T_=208`（`devicePixelRatio * T_`）、空态占位卡 `QJ=240`（`width:QJ;height:QJ/of` ⇒ 240×300）、列表行高 `hm=65`（虚拟滚动 `estimateSize:()=>hm`）、入场动画 `appear:dS(true)` ＋ `timeout:uS(100)`；
⇒ 公式一（列数，逐字）＝`jme = 16*2 + 200*2 + 20`（＝452）；`t < 452 ⇒ 2`；否则 `Math.max(2, Math.min(Math.floor((t − 32 + 20) / (200 + 20)), 5))`；
⇒ 公式二（瀑布流行高）＝窄容器走 `gap=D7` 的两列分支、其余 `s = max(1, floor((t + gap) / (200 + gap)))`，`rowHeight = (t − (s−1)×gap) / s / of + gap`；
⇒ 公式三（网格卡宽）＝`i = min(s, 5)`；`columnWidth = (t − (i−1)×gap) / i`；**`cardWidth = min(columnWidth, 268)`** ⇒ ⇒ ★ **超过 5 列后卡片不再变宽、而是留白变多**；
⇒ 公式四（移动档）＝`({$isMobile:t}) => t ? D7 : ic` ⇒ gap 与 padding 一起从 20 降到 8；
⇒ ☆ 关键含义＝**官方把"多宽算几列"写死在 JS 里、按容器宽度算** ⇒ 侧栏折叠时列数会变（第 108 批屏上实测容器宽 703 而视口 991 ⇒ 官方此刻是"按 703 算"），本地用 `sm:/lg:/xl:/2xl:` 视口断点＝**方向性差分**（G1096）。

### 四、★★★ 屏上证实＝`input` 与 `intent` 的写入分工，两值可以长期背离

⇒ 逐字分工＝`Aa`（keydown／keyup／mousedown／pointerdown／touchstart…）里 `nu && Hr !== za ⇒ 写 input`，再 `nu && ca !== za ⇒（过表单控件闸门）写 intent`；`Pa`（pointermove／mousemove／wheel）里**只有一条**`ca !== eu ⇒ 写 intent`、**从不碰 `Hr`**；
⇒ ★ **屏上实测到的背离态**＝官方 `/s/<space>/tasks/all` 屏读到 `data-whatinput:"keyboard"` 且 `data-whatintent:"mouse"` **同时成立**（合成 `keydown` 让两值进 keyboard → 合成 `pointermove` 只把 intent 拉回 mouse）⇒ ⇒ 第 107 批 G1082 的"两套闸门分叉"从代码断言**升级为实测**；⇒ ☆ 读法＝**鼠标一动，静态层（读 intent）就退回鼠标档，而运行时层（读 input）仍停在键盘档**；
⇒ ☆ 顺带三条屏上实证＝`data-whatelement` 随焦点标签走（`div → span → button → null`）、`focusout` 一次删掉两个诊断属性、`data-whatclasses` 的 **`replace(" ", ",")` 非全局**缺陷形在真实 DOM 上成立（逐字 `"_viewport_1ltym_9,_scrollViewport_6sjpd_33 _vertical…"`＝第二个空格没换）；`sessionStorage` 两键 `what-input`／`what-intent` 实测在写、`data-whatpersist` 为 `null`（G1102／G1103）。

### 五、★★★ 新仪器边界＝焦点样式类读数必须先断言 `document.hasFocus()===true`

⇒ 实测形状＝`visibilityState:"visible"` ＋ `document.activeElement === 目标卡片` ＋ `data-whatintent:"keyboard"` **三条齐全**时，`el.matches(':focus')` 仍是 **`false`**、`document.hasFocus()` 是 **`false`** ⇒ ⇒ `:focus` 全链不匹配 ⇒ 官方 `[data-whatintent=keyboard] ._card_ydla7_1:focus{outline:1px solid var(--accent-500);outline-offset:-1px}`（盘上逐字，本批已复核）在屏上读不出环（`outline-style:"none"`）；
⇒ ★ 判定＝**该读数判"仪器不可用"，不得写成"官方无焦点环"、也不得据此改判 V100 的三档焦点环**（V100 的 `✓盘上` 标注维持）；⇒ ☆ 口径＝**焦点类样式复验协议第一步＝读 `document.hasFocus()`，为假就请用户点一下窗口再测**（这是 V88 六步协议"原生激活必须断言 `activeElement===目标`"的姊妹条：那条管"按键能否激活"，这条管"`:focus` 样式是否生效"）；
⇒ ☆ 第二条仪器事实＝**不要用 `cssRules[].cssText` 正则找声明**（浏览器会重排简写顺序，本批用 `outline:1px solid var(--accent-500)` 去匹配 `cssText` 拿到 0 条，而盘上原文确实在）⇒ 找规则要走"递归 `cssRules` ＋ 读 `style` 属性"或回盘上原文；
⇒ ☆ 第三条＝**`el.focus()` 对 Craft 的 checkbox 不生效**（`activeElement` 变成外层 `span`）＝与第 105 批 G1062"框本身 `pointer-events:none`、点击由 20px wrapper 承接"同形；⇒ ⇒ 本批"表单控件里冻结 intent"这条**没能在屏上裁**（唯一例外分支——不在 `form` 里的 `button`——裁到了：聚焦 `button` 后合成 `keydown` ⇒ intent 照改 ⇒ ★ **`pa` 名单与 `button ∉ form` 例外同时获得运行时支持**）。

### 六、☆ 本批方法学 ＋ 一条自我纠正

⇒ 盘上＝零新增下载（105 个缓存 chunk ＋ 已落盘 13 份 CSS）；屏上＝**8 次只读 `evaluate_script`、零 click／零 navigate_page**（路由切换用页面内 `a[href]` 的 `.click()` 走 SPA，收尾 `history.back()` 还原到进屏前的 `/trash`；焦点属性与 `sessionStorage` 两键全部还原成进屏前的 `mouse／mouse`）；⇒ 检索技巧＝① **按"引用关系"而非"文件内容"定位组件边界**（本批把 `vendor-code-editor` 的 53 处 side-effect ＋ 14 处具名 import 逐符号拆开，才发现其中 13 处只引 Vite 预加载 helper）；② **正则收 class 名必须允许 camelCase**（上一条 ✎ 的来源）。
⇒ ⚠ **自我纠正（G1104）＝第 107 批 §四十六.六 那句"一次得 14 个消费者 ⇒ 代码块是跨面组件"作废**＝真正引用 CM6 符号的只有 `CodeEditorWrapper` 一个 chunk；⇒ 修正后的结论＝**CM6 在官方架构里是"单一消费者"组件**（side-effect import 仍把它放进依赖闭包，但是否实际下载未取证＝网络面被 CDP 封，承既有边界）；☆ 同批 §四十六.六 的"选题法＝先扫 import 图"**仍然可用**，只是产出的是"谁引 helper"，判"跨面"要按符号拆。

**仍未采到（本节）**：`tok-*` 表有没有被注册进 `extensions`（`...g` 未展开）；`createTheme` 的 `dark` 标记错配对 CM6 内建样式的实际影响；三档焦点环的屏上证据（撞在 §五 的仪器边界上，需用户点一下窗口）；`--col*` 三个列元素在哪个视图渲染（屏上 `/tasks/all` 命中 0）；网格四公式的屏上对照（只拿到 JS 逐字，未量 DOM）；20 档主题里除 craft 两档外的 18 档 settings／styles 未逐字（只取名册）；`--heading-*` 缺 `lg`／`xl` 时页面标题走哪档；☆ 主题选择器面板的屏上形状与 `auto` 的显示文案（`blockdetails.theme` 只拿到 key 与中文值）。

## 四十八、**列表视图的渲染面结案＝一张 CSS-Module 类名常量表 ＋ 一个 `ResizeObserver` 列宽同步钩子 ＋ 三种表头变体共用同一组"槽位"类；★ 顺带把输入档闸门的运行时真相钉死（作废本批自己一条真按键读数），并结掉"主题 `dark` 标记从哪来"＝唯一来源是面板里被写死的字段、且有 3 档标反了**（✓盘上＋数据面＋屏上 第 109 批 2026-09-30 17:0x–17:4x 本地＝UTC 09:0x–09:4x，来源＝`index-DiTmKH3z.js` 与 `vendor-code-editor-BLm003PU.js` 逐字读 ＋ 沙盒 `QODER-HARVEST-B109-CODEFIELD` 的一次写入读回 ＋ 11 次只读屏上调用；★ 逐字名册在 `longtail.md` §三十五，行为取证在 `interactions.md` V103，gap 行 **G1105–G1118**）

### 一、★★★ 具名容器查询的消费面找到了＝模块 `1m9yz` 的列表视图，而"DOM 里没有 `_col*`"是**布局本来就在网格**

第 108 批留下的疑点（`/tasks/all` 屏运行时确认容器生效、但零个 `_col*` 元素）本轮在盘上直接结掉：列表视图的整套类是主包里一张**逐字常量表 ＋ 一张聚合对象**（`w$t="_headerRow_1m9yz_8"` … `Y$t="_newDocTag_1m9yz_314"`，共 27 个常量 ＋ `rn={headerRow:w$t,…,newDocTag:Y$t}`，位于 @2,922,687–2,924,289）。⇒ ★ **CSS-Module 的哈希类名在 Vite 产物里是以"字符串常量 ＋ 对象"的形式内联进 JS 的**（不是运行时代理），所以**只要知道任一哈希就能把整张名册捞出来**——这是本目录第一次把"某个组件有哪几个类"采全。

而网格视图用的是**另一族**（同一次屏上扫描逐字读到）＝`6sjpd:viewWrapper, scrollRoot, headerWrapper, headingWrapper, headingRightWrapper, scrollViewport, docGrid` ＋ `1wotv:virtualBody, virtualCardRow` ＋ 卡片 `dhebv:aspectRatioStretch, container, contentWrapper, titleRow, title, titleMargin, iconSlot, iconPosition, selectionCheckbox` ＋ `1fgll:wrapper, checkbox`。⇒ **网格本身也是虚拟滚动**（`virtualCardRow`），而第 107 批从 JS 常量算出的"卡片基准宽 200／上限 268／列数 2–5"（G1096）就是喂给这个 `docGrid` 的。

⇒ ☆ **口径修正**：历批"某元素在 DOM 里不存在"这类负向结论，**必须先判当前布局档**（网格／列表是两种 DOM 形状），否则会像本批上一次那样把"布局没开"读成"消费面没找到"。

### 二、★★ 行壳组件是无条件全渲染的、可见性 100% 交给 CSS

逐字行壳＝`Mx = forwardRef((t,e)=>{ … $e(rn.listRow, s) … children:[p, h, g, y, x, w] })`，props 解构＝`{leading, lastViewed, updated, created, trailing, children, className}`；六个子 DIV 里**只有 `leading` 判了 `!=null`**，其余四列（`colLastViewed＋dataCellLastViewed`、`colUpdated＋dataCellUpdated`、`colCreated＋dataCellCreated`、`statusCol`）**无条件渲染**。⇒ 官方把"要不要显示"完全交给 `@container` 规则（`_dataCol_1m9yz_197{…display:none…}` ＋ `@container (width>=768px){_colUpdated,_colCreated{display:flex}}` ＋ `@container (width>=1024px){_colLastViewed{display:flex}}`），**JS 侧不做宽度判断** ⇒ 这与第 104 批"落点数学在 handler 里"是同一种取向：**几何归 CSS，逻辑归模型**。

### 三、★★★ 列宽同步钩子 `aW()`＝"JS 写变量、CSS 消费、两处各写兜底"的又一例

逐字形状＝`aW(t)` 里三个 `useRef`（对应三个表头单元格）＋ 一个测量函数 `d`＝`c.style.setProperty("--col-last-viewed-width", n.current.offsetWidth + "px")`（三键同构，`c` 是容器 ref）；**先立即跑一次 `d()`**，再 `new ResizeObserver(d)` **观察三枚表头**，卸载时 `disconnect()`；CSS 侧消费＝`width: var(--col-last-viewed-width, 8rem)`／`--col-updated-width`／`--col-created-width`。⇒ 三条硬结论：① **表头与"虚拟滚动的行"不在同一个滚动容器里**，所以官方要用"表头实测宽 → CSS 变量 → 行内单元格消费"来对齐（这是虚拟列表表头对齐的一种通用解法，值得本地照抄）；② **`8rem` 这个兜底在 CSS 写、换算式在 JS 写**，与 `--st-row-height` 35／`--st-index-column-width` 45（第 107 批的 `--st-*` 双向通路）同族＝**"JS 写、CSS 消费、两处各写一遍兜底值"的又一例**；③ 三个 `--col-*` 在 13 份官方 CSS 里**零定义处**（本轮逐份正则扫＝定义 0／消费 3）⇒ 它们是**宿主注入接口**，不是主题变量。

### 四、★★ 类名是"槽位"不是"数据身份"＝同一组 `_col*` 在三张表头里贴到不同列上

三个表头变体逐字（同一段 `rn` 表被三处组件复用）＝变体 A（@2,924,800）`Bs.Title／Bs.LastViewed／Bs.Updated／Bs.Created` ＋ 标签 key `name`／`browse.sort.last.viewed`／`updated`／`created`；变体 B（@3,052,900）`Ns.Name／LastViewed／Updated／Created` ＋ 同标签；变体 C（@3,411,300）`wi.Name／Shared／SharedBy／LastViewed` ＋ 标签 `name`／`shared`／`shared.by`／`browse.sort.last.viewed`。★★ **变体 C 里 `rn.colLastViewed` 被贴在「共享」列上**＝逐字 `$e(rn.columnHeader, rn.colLastViewed, rn.sortable, {[rn.active]: w})` 且 `w = n.sortBy === wi.Shared` ⇒ 名字里的 `LastViewed` 只是**第一个数据槽**的历史命名，`@container` 门控的是"第 2／3／4 列"。⇒ ☆ 复刻含义：**别把列名写进宽度/可见性规则里**，槽位与数据要解耦，否则切换布局时会对不上官方行为。

顺带三条同区读到的形状＝① 类名拼装函数是 `$e(...)`（clsx 形状：位置参数 ＋ 一个 `{[类]: 布尔}` 对象）；② 每个表头 `button` 都带 `style:{flexGrow:1}` **只给名称列**；③ 排序箭头是同一个组件 `wd({isActive, sortDirection, sortable, ascendingValue, descendingValue})`，两档枚举逐字 `$n.Ascending／$n.Descending`（与第 107 批的 `Ascending／Descending` 对齐）。

### 五、★★★ 输入档闸门的运行时真相＝两条自我纠正（一条作废本批读数）

① **手改 `data-what*` 会让后续读数不可定性**＝本批把两枚属性强写成 `mouse` 之后，连接器一次**真实** `Tab`（窗口捕获日志逐字＝`keydown`／`Tab`／`Tab`／`kc9`／`trtrue`／`ae A`）把 `sessionStorage` 的 `what-input`／`what-intent` 改成了 `keyboard/keyboard`，**而 DOM 两枚属性仍是 `mouse/mouse`** ⇒ 真因＝库内部保存 current intent，**值未变就不写 DOM**；我手写的值与它内部值不同，但它认为"不需要改"。⇒ ★ 那条"真按键没切档"的读数**判废**，**不得写成官方行为**（已登记 G1112）。☆ 通用形态＝**任何"外部写入 vs 内部状态"双写的机制，人工写入之后所有"没变化"的读数都失去信息量**。

② **合成 `KeyboardEvent` 必须带 `keyCode`／`which`**＝只给 `key:'Tab'／code:'Tab'` 时 what-input 全程无反应（属性与 `sessionStorage` 都不动），补上 `keyCode:9, which:9` 后**同一通路立刻生效**（属性 `mouse/mouse → keyboard/keyboard`，随后 DS 按钮的 `outline` 当场出现）。⇒ ★ 这解释了历批一部分"合成键推不动"的归因：**不是官方校验 `isTrusted`，是官方 handler 读的是 `keyCode`**（第 107 批从代码读到的 `ma=[16,17,18,91,93]` 正是 `keyCode` 表，当时没意识到探针要照它写）。

③ **`el.focus()` 对 Craft 的表单控件普遍不生效**＝本批对一个真实 `<input>` 调 `focus()`，`document.activeElement` 变成**外层 `SPAN`** ⇒ 第 108 批在 checkbox 上撞到的不是个别组件，而是**一类现象**（自定义控件把焦点托管在外层容器上）；⇒ `pa` 名单主分支（表单控件里冻结 intent）仍**未裁**，需要真键盘把焦点走位送进控件（下批在有真焦点的窗口里做）。

### 六、★ 方法学：本批三条可复用做法

① **从一个哈希反查整张类名表**＝CSS 里任取一条 `._x_hashNN_line`，去主包搜 `hashNN`，就能拿到该组件全部类名常量与聚合对象（本批由此一次得到 27 键名册，含三个此前完全没线索的状态类 `isUnavailableOffline`／`selected`／`newDocTag`）。② **屏上"家族普查"代替逐个选择器猜**＝一次遍历 `mainWrapper` 后代的 `class` 属性、用 `/_([A-Za-z0-9]+)_([0-9a-zA-Z]{5})_(\d+)$/` 按 hash 归组，一次就分出六族（`6sjpd`／`1ltym`／`1wotv`／`1nu3o`／`dhebv`／`1fgll`），比逐个 `querySelector` 试省 5–6 次调用。③ **写侧探字段用"分歧档"**＝要判"存的是 A 还是 B"，别测两者相同的常规值，直接挑**逐字不同**的那几个（本批 `typescript→tsx`、`cs→csharp`、`math_formula→stex`、`plaintext→null` 四档一枪定案）。

### 七、★★★ 顺手结掉第 108 批留的一问＝主题的 `dark` 标记唯一来源是**面板自己那个被写死的字段**，而它有 3 档标反了

CM6 侧逐字（在 `vendor-code-editor-BLm003PU.js`，不在 `CodeEditorWrapper`）＝`var g=li.theme(O,{dark:i==="dark"}), w=uE.define(l), Q=[g,R6e(w)]; return Q`，其中 `i` 就是面板工厂传进来的 `theme` 字段 ⇒ ⇒ **界面明暗不参与这个判断**，只有 `auto` 换档时才会挑到另一档面板。⇒ ★ **错配 3 档（逐字）**＝`craftdark` 工厂写 `theme:t="light"` 而它 spread 的 `Ue` 底色是 `#28292B`；`materiallight` 写 `"dark"` 而 `Qe` 底色 `#FAFAFA`；`tokyonightday` 写 `"dark"` 而 `tt` 底色 `#e1e2e7`；✓ 对照＝`craftlight`/`noctislilac`/`bbedit` 都 `"light"` 且底色确为浅色，其余 9 档 `"dark"` 与底色一致。⇒ ☆ **影响面判断要克制**＝Craft 把 `background`／`foreground`／`caret`／`selection`／`gutter*` 都在 settings 里写死了，所以错配大概只波及 settings 未覆盖的 CM6 内建项（matchingBracket、搜索高亮、tooltip 色系一类），**本批没有屏上证据**，只登记"标记与真实明暗相反"这条确定事实；⚠ 但因为 **`auto` 在暗档下解析成 `craftdark`**，这条错配命中的是**默认路径**，不是冷门档。

**仍未采到（本节）**：① **代码块主题的真实作用域**（块级已被否；要 UI 里改一次再读回）；② **错配 3 档的可见影响**（要看 matchingBracket／搜索高亮在暗档下的实际取色）；③ **列可见性的屏上对照**（要做必须把布局切到列表＝空间级持久偏好，属禁区等点头）；④ 表头三变体各自对应哪一屏**只有枚举与标签证据**；⑤ `pa` 主分支；⑥ `_statusCheckboxVisible`／`_isUnavailableOffline`／`_newDocTag` 的触发条件；⑦ `rn` 名册里 `dragPreviewBase`／`dragPreviewInner` 在列表视图的拖拽行为（与第 102–104 批编辑器内拖拽是不是同一套）。

## 四十九、第 110 批＝`pluginData` 是主题的真正落点、两属性更新条件不对称、布局三档的组件归属（2026-09-30 18:5x–19:4x 本地＝UTC 10:5x–11:4x；屏上只读＋盘上反编译；★ 源＝`static/js/index-DiTmKH3z.js`（6,841,180 字符）与 `static/js/CodeEditorWrapper-DB8UxA00.js`（59,843 字符）两份页内 `fetch` 落盘后本地 grep，两条 dump 已删、逐字片段留档 `_harvest/b110-probe6.txt`）

### 一、★★★ 主题的读路径＝`pluginData.pluginConfigurationData.themeId`（结第 109 批"块级假设被否"）

index 逐字（@3,633,4xx 一带）：

```
let b;e:{const Q=m.pluginData;if(!Q||Q.pluginName!=="codeBlock"||!Q.pluginConfigurationData){b=null;break e}b=Q.pluginConfigurationData.themeId}const y=b;
```

同一函数往下：`const W=(t.isCursorText,"text"),z=y??"";` 再往下把值以 prop 形式交进编辑器子组件：

```
a.jsx(Ttn,{blockId:t.blockId,ref:o,inCodeEditing:h,storedLanguage:t.language,storedContent:t.content,onSave:w,onCodeEditorClick:F,onCopy:O,onFocusModeClick:v,inFocusMode:!1,storedThemeId:z,features:t.features,threeDotsMenuWrapperRef:N,isSelectionDragging:g})
```

⇒ ★★★ **同一个组件的 prop 列表把"两种存储层"并排暴露了出来**：`storedLanguage:t.language` 与 `storedContent:t.content` 取的是**块本体字段**，而 `storedThemeId:z` 取的是**插件数据槽**；⇒ ☆ 上批"往 `--json` 里塞 `theme`／`isDark` 被静默丢弃"因此不是"官方不落库"，而是**测错了键**（正确路径是 `pluginData.pluginConfigurationData.themeId`）；⇒ ★ 缺省态写的是**空串**（`y??""`），而解析函数是 `De(o,t)=>o==="auto"?…:ue[o]` ⇒ 空串会去查 `ue[""]`＝取不到色板；☆ 这条空串路径的渲染后果**本批未屏上取证**（下批若进编辑器可用"两块对照"一次判掉）。

### 二、★★★ 主题的写路径＝一条独立的 `pluginData` action，载荷六字段固定、第一参是数组

CodeEditorWrapper 逐字（`S`＝`docDispatch`、`o`＝blockId、`L`＝名册里选中的主题对象）：

```
(L)=>{B(L),S(Ut([o],{pluginType:"codeBlock",pluginName:"codeBlock",pluginConfigurationData:{themeId:L.id},horizontalSizeClass:null,verticalSizeClass:null,surfaceShadowOpacity:1}))}
```

与内容侧对照（index 同函数逐字）：`x=(Q,Y)=>{r(bRe(t.blockId,Q??"",Y))}`＝第 108 批认出的 `updateCodeBlock{blockId,content,language}`，**三个位置参数里没有 theme 位**。

⇒ ★★★ **主题与内容/语言分属两条 action** ⇒ 改主题与改代码在撤销栈上是两步、互不合并；⇒ ★ **载荷六字段是固定形状**（`pluginType`／`pluginName`／`pluginConfigurationData`／`horizontalSizeClass:null`／`verticalSizeClass:null`／`surfaceShadowOpacity:1`）⇒ 后三条是给"网页预览／图形"类插件块用的，代码块一律置 `null`／`1` ⇒ **`pluginData` 是一个跨插件块共用的通用槽位**；⇒ ☆ 第一参是**数组**（`[o]`）⇒ 多选状态下可一次改多块，这条与第 100～103 批"选择集跨操作累积"的未决问题相邻但**不构成证据**。

### 三、★★ 同一槽位的第二种厚度＝card 家族，以及按 `pluginName` 分派的序列化器

序列化器逐字（index `S1e`）：

```
function S1e(t){const e=t,n=si(t.pluginConfigurationData),o=t.pluginName;if(nMe.includes(o)){let s=null;if(n!=null){const i=n.backgroundData;s={fontStyle:n.fontStyle,pageStyle:n.pageStyle,backgroundData:{backgroundColor:Yt(i.backgroundColor),backgroundColorGradientEnd:Yt(i.backgroundColorGradientEnd),userInterfaceStyle:i.userInterfaceStyle,backgroundImageURL:i.backgroundImageURL,isLightColor:aI(i.isLightColor),key:i.key},decorations:n.decorations,contentStyle:n.contentStyle,themeAssetId:n.themeAssetId}}return{plugi…
```

导出分派逐字（两案并列）：`case "card":{const G=t.pluginData.pluginConfigurationData;z.themeAssetId=(G==null?void 0:G.themeAssetId)??void 0;z.fo…` ／ `case "codeBlock":{const G=t.pluginData.pluginConfigurationData;z.themeId=(G==null?void 0:G.themeId)??void 0;break}default:`

⇒ ★ **同一个 `pluginConfigurationData` 键，codeBlock 家族只装 `{themeId}`、card 家族装 9 字段厚对象** ⇒ 本地建模必须把它当作"按 `pluginName` 分派的可变形状"，不能定死一个 interface；⇒ ☆ 两文件穷尽枚举到的字面量＝`card`／`codeBlock`／`unknown`（`unknown` 是兜底：`return{pluginType:"unknown",pluginName:o,…}`）；⇒ ⚠ **`themeId` 是重载键**＝页面样式域里也有 `themeId`／`themeAssetId`（`dictPageStyleToOldPageStyle`、`setCustomStyle` 那一带），与代码块的不是同一回事 ⇒ 别把两处合并成一条事实。

### 四、★★★ 两属性更新条件不对称＝intent 冻结的主分支（结第 107 批判据、第 109 批两次失败）

盘上三段序列（全程**不手写任何 `data-what*` 属性**）：

1. `press_key Tab`（`activeElement` 由 `BODY` 变 `BUTTON#sidebar-toggle`）⇒ `data-whatinput=keyboard`、`data-whatintent=keyboard`、`data-whatelement=button`；⇒ 事件 target 不是 `pa` 成员时，键盘路径**两个都改**。
2. 派发带 `pointerType:"mouse"` 的真 `PointerEvent('pointerdown')` 到 `input[data-testid="quick-search-input"]` 上 ⇒ 两属性都变 `mouse`，`activeElement` 仍是该 input。
3. `press_key` 一发可信键（判据＝输入框 `value` 由 `z` 变 `zq`）⇒ **`data-whatinput` 翻成 `keyboard`，`data-whatintent` 保持 `mouse`**，`sessionStorage` 两键与 DOM 同步（`what-input=keyboard`、`what-intent=mouse`）。

⇒ ★★★ **`pa=["button","input","select","textarea"]` 名单的冻结只作用于 intent 这一路**＝键盘在表单控件里能改 `data-whatinput`、**不能**改 `data-whatintent`；⇒ ☆ 这解释了一条官方观感＝**在搜索框里打字时，页面上 hover 类样式不会跟着跳到 keyboard 档**（因为 hover 类闸门读的是 `data-whatintent`，见第 107 批 §四十六／第 109 批 §四十八）；⇒ ★ 本地落地参数因此是三条而不是一条：两个属性都写、默认值 `initial`、**冻结规则照抄**（只冻 intent 不冻 inputType）。

### 五、★★ 布局三档的组件归属与"哪一块在编辑代码"的态归属

selector 逐字（index，同一函数）：

```
p=Q=>{const{docStore:Y,uiStore:X}=Q;return{inCodeEditing:X.codeEditorState!=null&&X.codeEditorState.blockId===t.blockId,block:Y.blocks[t.blockId],isSelectionDragging:X.isSelectionDraggingActive}}
```

⇒ ★ **"当前哪一块在编辑代码"＝`uiStore.codeEditorState.blockId`**（视图态，不落块）；⇒ ★ **框选的状态名＝`uiStore.isSelectionDraggingActive`**（本批屏上起手已证、见 §四十九.七）；☆ 另读到每块一枚焦点注册 id `code_editor_{blockId}`，配 `bn.pushIntoFocus`／`bn.removeFromFocus` 的进／出对称调用（同 effect 的 cleanup 里 remove）。

布局三档的类模块归属（屏上实测）＝档 A（`Rectangle Grid2x2`）与档 B（`Rectangle3 Group`）共用卡片模块 `_1nu3o_`＋`_dhebv_`（档 A 另有行容器 `_virtualBody_1wotv_2`／`_virtualCardRow_1wotv_8`，**档 B 没有 `_virtualCardRow_`**）；档 C（`Line3 Horizontal`）独占表格模块 `_1m9yz_` ⇒ **三档不共享行/卡组件** ⇒ 本地"同一套卡片换 CSS 换档"的做法会做错。

### 六、★★★ 容器查询与列宽同步的运行时真相（结 G1101／G1114／G1125）

| 量 | 屏上实测值 | 含义 |
| --- | --- | --- |
| `div._mainWrapper_6sjpd_20` 的 `container-type`／`container-name` | `inline-size`／`web-shared-layout-main-wrapper` | 官方 CSS 里那条 `@container web-shared-layout-main-wrapper (…)` 的**容器本体**第一次找到 |
| 同一容器 `clientWidth` 对 `innerWidth` | **916** 对 1204 | 视口已过 1024 断点而「上次浏览」列仍 `display:none` ⇒ **门限吃容器宽**（不是媒体查询） |
| 全页带 `container-type` 的元素 | 3 颗（上述具名 916、一颗未命名 `size` 1204、`browse-document-list` 未命名 `inline-size` 884） | ⇒ **具名容器查询可隔级生效，中间夹无名容器不阻断** |
| `[data-testid="browse-document-list"]` 的内联自定义属性 | `--col-last-viewed-width:0px`、`--col-updated-width:112px`、`--col-created-width:112px` | ★ 隐藏列**照样写**、写的是 `0px` ⇒ `width:var(--col-last-viewed-width, 8rem)` 的 `8rem` 兜底**永不参与** |

⇒ ☆ 该容器是 **styled-components 壳**（`div.sc-1r02f4x-5 kfCFoF`）而不是 CSS Module ⇒ 官方的属性写入点在样式化外壳上，本地若用 Tailwind 类壳要另找载体；⇒ ★ 本地复刻的等价要求＝**"列隐藏时也把 `--col-*-width` 写成 0px"**，否则与官方差一个 8rem 的列宽。

### 七、★ 框选：起手已证、机制半边、矩形未采到

在 `_virtualBody_1wotv_2` 上（起手点先用 `elementFromPoint(1024,408)` 校验命中该校验过的空白虚线体、非卡片非按钮）依次派发 `pointerdown`＋`mousedown`＋`pointermove(0,+112)`＋`mousemove` ⇒ ① 卡片容器类新增 `_selectionMode_dhebv_393`（逐字 `_container_dhebv_49 _selectionMode_dhebv_393`）；② 8 枚 `role="checkbox"` 里 1 枚 `aria-checked` 翻成 `true`。⇒ **未派发 `pointerup`，一个往返后再读＝`_selectionMode_` 与勾选双双自行回退**（`checked:0`、`selMode:0`、`activeElement:BODY`）⇒ 官方把"按下但没抬起的拖选"按可弃处理。⚠ **矩形本体与落点判据仍未采到**＝两次启发式扫描（绝对定位且宽高>24 且带边框或背景；以及 `pointer-events:none` 的绝对定位元素）均 0 命中，合成 pointer 不保持按下态 ⇒ 按"指纹没变＝采到的是静默失效，不是官方没有"的纪律，**不得记成官方无矩形**；要拿需要 OS 级真拖拽＋中途截图，而"拖拽中途没有截图窗口"是已判定的通路限制（见技能失败表）。

### 八、方法论（本批三条，都可复用）

1. ★★★ **判"某字段到底存在哪"不要只测写侧，先把"同一个组件的 prop 列表"读全**＝本批一次 `storedLanguage:t.language`／`storedContent:t.content`／`storedThemeId:z` 三 prop 并排，直接暴露出"两种存储层"，比在 UI 里改主题再读回便宜且更硬；⇒ 通用式＝**沿 prop 名往回找定义点（`z=y??""` ⇒ `y=b` ⇒ `e:{…}` 标签块），比往前的渲染分支找更快命中存储**。
2. ★★ **要拿"两个属性是否同步更新"这类判据，先把两属性摆成分歧态，再打一发能被独立佐证的可信输入**＝本批用"输入框 `value` 变了"作为键真送达的旁证，避免了第 109 批"读数没变到底是冻结还是没送达"的两难；⇒ ☆ 与 G1112（手写属性）合起来读＝**摆态要用手能产生的事件（`PointerEvent` 带 `pointerType`），判据要用可独立佐证的副作用**。
3. ★☆ **选择器要按 CSS Module 的哈希段写，不要按语义前缀写**＝本批先按 `[class*="_col"]` 查列，结果整批命中 `_collectionName_*`（`_col` 前缀同名冲突），改按 `[class*="_1m9yz_"]` 才拿到真正的 22 枚列类；⇒ ☆ 顺带一条＝**一枚哈希可反查该组件全部类名册**（承 G1113 的方法），而语义前缀反查会跨组件串味。

**仍未采到（本节）**：① `De("",isDark)` 这条空串路径的实际渲染后果（缺省主题到底等价于 `auto` 还是取不到色板）；② `pluginData` 会不会出现在 MCP `blocks get --format json` 的读回里（若出现＝主题对账可以走数据面，不必开屏）；③ `Ut` 这个 action 构造器的**真名与完整字段**（只读到调用点，未回到第 108 批那张 88 项分派表上定位它的 case 标签）；④ `nMe`（card 家族白名单）除 `Xa` 五档外还有没有别的成员；⑤ 框选矩形与落点判据（承 §七）；⑥ 档 A／B 的列数公式（只量到 308.5 与 268 两个值，没拿到 CSS 侧的 minmax 表达式）。

## 五十、第 111 批＝两份主题名册的同一性证明、`settings` 键集不闭合、MCP 写主题的三条通路全否、桥的挂起形态（2026-09-30 20:3x–21:1x 本地＝UTC 12:3x–13:1x；★ 源＝`_harvest/js/CodeEditorWrapper-DB8UxA00.js`（59,843 字符，**两份名册都在这个 chunk 里**）＋ craft MCP 数据面实测；☆ 逐字表在 `longtail.md §三十七`，gap 在 G1141–G1159）

### 一、★★★ 名册同一性的证明链（结掉第 110 批 §三十六 的开放项⑦）

⇒ 选择器名册逐字（`V`，21 条）＝`{id:"materialdark",label:"Material Dark",keywords:[],isDark:!0,settings:Bo}`；工厂名册逐字（`ue`，21 键含 `auto:null`）＝`…materialdark:Mo,materiallight:jo…`；工厂体逐字＝`Lo=o=>{const{theme:t="dark",settings:a={},styles:r=[]}={};return I({theme:t,settings:{...Xe,...a},styles:[…36 条…]})}` 且 `Mo=Lo()`；★ **别名逐字**＝`,Bo=Xe,Lo=o=>{…`（`Bo` 就定义在工厂前一个逗号处）⇒ **两表 20/20 指向同一对象**，唯一一次改名＝`materialdark`；⇒ ☆ 上批列的"三种可能"里成立的是**第三种的一半**（同一对象、两个标识符），**不是**"settings 是入参／Mo 是产出的链条上下游"——链条那种读法会把 `a={}` 当成外部可注入，而本批复证：**解构源是字面量 `{}`、入参 `o` 恒被忽略**（承第 109 批"色板封闭"结论）。

### 二、✎ 改判：工厂的**声明形状**有两种（上批"20 档全同"过强）

⇒ 18 枚箭头＝`Xf=o=>{const{theme:t="…"`；★ 2 枚函数声明＝`function Oo(o){const{theme:t="dark",…}`（`sublime`，赋值处 `const Ho=Oo()`）与 `function qo(o){…}`（`vscodedark`，赋值处 `const $o=qo()`）；⇒ ☆ 返回形状（`I({theme,settings:{...SRC,...a},styles:[…]})`）**20/20 全同**；⇒ ★★ 方法论＝上批漏读 3 档的根因是**正则口径**两条：`\w` 不含 `$`（漏 `$o`／`$e`）、只认箭头形态（漏 `function`）⇒ 任何"全量枚举标识符"的脚本都要写 `[\w$]+` 并**同时认两种声明形态**。

### 三、★★ `settings` 是**变长对象**（键集不闭合）

⇒ 每档键数分布＝`{7:1, 8:1, 9:5, 10:7, 11:6}`；逐键出现档数＝`background`／`foreground`／`selection`／`selectionMatch` 20/20，`lineHighlight`／`gutterBackground`／`gutterForeground` 19/20，`caret`／`fontFamily` 18/20，`gutterBorder` 16/20，`gutterActiveForeground` **7/20**；⇒ 机制含义＝CM6 侧的 gutter 高亮前景**大多数档根本没给**，所以那档的 gutter 只能继承主题默认 ⇒ 本地若按定长结构建模会在 13 档上写出假值。

### 四、★★★ MCP 写代码主题＝三条通路全否（本批最大的通路结论）

⇒ ① **`--theme-id` 被页面名册吃掉**＝`blocks update --id <代码块> --theme-id dracula` 逐字回 `Error 1: Error: Theme "dracula" not found. Use "blocks explore-themes --type page" to see available themes, or apply style properties one-by-one (backdrop, colors, etc.).`；⇒ ② **`--json` 带 `theme`** ⇒ 调用挂起（`MCP tool invocation did not complete`），读回复核 `rawCode` 未变＝**没落库**；⇒ ③ **`--json` 带 `type`** ⇒ 一次挂起、一次 `Invalid JSON update payload at "root": Invalid input`；⇒ ★ 对照实验＝`--json {"id":…,"rawCode":…}`（不带 `type`／`theme`）**立即成功**（`Updated block <id>.`）⇒ 坏的是 payload 形状、不是桥；⇒ ☆☆ **推论**＝第 110 批盘上读到的那条 `Ut([blockId],{pluginData:{pluginConfigurationData:{themeId}}})` **只在 UI 通路上存在**，MCP 面没有等价写命令 ⇒ "主题对账走数据面"（队列②的通路收益）**不成立**，要证 `pluginData` 出现在读回里必须先经屏上改主题。

### 五、★★ 官方两个面的名册不等长（19 对 21）

⇒ MCP `blocks explore-themes --type code` 逐条回 19 档（`auto` ＋ 18 档第三方），**没有 `craftlight`／`craftdark`**；⇒ ★ 而界面名册 `V` 有 21 条、且 `auto` 的解析式 `De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]` **恰好落在这两档**上 ⇒ ☆ 机制＝craft 两档是"系统外观映射的目标"，官方**不给外部直接选**（外部只能选 `auto` 让它自己映射）；⇒ ⚠ 本批**未判**这是名单裁剪还是强制拒绝（想试 `--theme-id craftdark` 时桥已挂死；且 `--theme-id` 根本不吃代码名册，这条优先级下调）。

### 六、★★ 桥的挂起形态与"写后读回"纪律

⇒ 实测：`blocks get … --format json` **同一命令先成功后挂两次、第三次又成功**；`--format markdown` 全程正常；⇒ ★★ **一次挂起的写会把后续读与 `connection info` 一起拖挂**（本批最后 `connection info` 也不返回，等 30 s 无效）⇒ 桥**没有 per-call 超时隔离**；⇒ ☆☆ 纪律＝**写挂起后禁止重发写**，改"读回判状态"（本批据此判定 `rawCode=3` 那条没落库，屏上截图独立佐证＝块内显示 `var qoderB111 = 2`）；⇒ ☆ 顺带：`blocks add` 一次插 3 块**只回首个 id**（`Added 3 blocks. IDs: <133c06ea…>`）⇒ 要全部 id 只能读回。

### 七、★★ 工具解锁两条（收窄既有结论）

⇒ ① **`locator.evaluate()` 可用**（实测回 `{x:398,y:173,w:736,h:53.6,dpr:1.25,iw:1528}`）⇒ ★ 既有"evaluate 恒 null"要**收窄为"tab 级 `playwright.evaluate()` 恒 null"**；⇒ ☆ 影响＝量几何不必再靠"截图＋像素检测＋除 DPR"，可省大量屏幕预算；② **`screenshot()` 返回跨 realm 的 Uint8Array**＝`raw instanceof Uint8Array` 为 **false**（`constructor.name` 仍是 `Uint8Array`、`String(raw)` 是一串字节、首字节 137＝PNG 签名）⇒ 判形要用 `constructor.name` 或首字节，转换用 `Buffer.from(raw.buffer ?? Uint8Array.from(raw))`。

### 八、★ 屏上否证：主题面板不在这三条路上

⇒ 选中代码块（点块内文本 ⇒ `cm-focused` 出现、DOM ＋1,989 字节）＝全文 **0 处「主题」**、0 个 `<select>`；⇒ `cua.move` 悬停块头（几何由 `locator.evaluate` 给出）＝DOM 长度**一字不差**（179,058）⇒ **块头没有 hover 工具条**；⇒ 右侧栏四 tab（`插入／格式／样式／信息`）点「样式」＝面板是**页面级**（「封面」×2、「背景」×1），仍 0 处「主题」；⇒ ☆ 剩余候选＝块把手（`data-hover-only="true"` 静止态 8 枚）菜单／右键菜单／`⋯` 的「详情」；⚠ **本周期 tab 级命令已用掉 24 条（超 §预算的 ~14 条）** ⇒ 主动停手，不当"官方没有"下否定结论。

### 九、★☆ 顺带采到的官方 HTML 内联注释（内部路径线索）

⇒ 编辑器屏 HTML 的内联脚本里有逐字注释 `Mirrors the resolution logic in src/theme/theme-store.ts.` 与 `…matches the user's choice. Without this, ThemeProvider…`，另有 `parsed === "dark" || parsed === "light") theme = parsed;`；⇒ ☆ 含义＝官方**应用级**主题存储模块路径＝`src/theme/theme-store.ts`，档位字面量＝`dark`／`light`（外加持久化的其它值需回落），且解析发生在**首帧内联脚本**里（防 FOUC）；⇒ ⚠ 与代码块主题**无关**，别混用（同屏还有 `data-theme="light" data-accent="blue" data-whatinput="mouse"` 三个属性在同一元素上）。

**仍未采到（本节）**：① 主题面板的真实入口（三条已否）；② `De("",isDark)` 空串路径的渲染后果；③ `pluginData` 是否会出现在 MCP 读回里（本批判为"写不进所以读不到"，若官方将来放开则需复测）；④ 19 与 21 的差异是名单裁剪还是强制拒绝；⑤ 内联脚本里 `src/theme/theme-store.ts` 的**完整**解析式（本批只读到两条注释与一段条件式，没读全函数体）；⑥ `gutterActiveForeground` 只有 7/20 给了值，其余 13 档 CM6 实际继承到什么未证。

## 五十一、**代码块主题的装配管线一次走通（名册 → 工厂 → `gBn` → CM6 两套扩展），并结掉四条积压：缺省 gutter 前景、名册展示序、`De("",isDark)` 空串、`math_formula` 与导出映射**（✓盘上 第 112 批 2026-09-30 21:4x–23:1x，**零浏览器内容面调用、零写入**；★ 逐字清单在 `longtail.md` §三十八，色板与几何在 `styles.md` §十九，模型含义在 `model.md` §一之七十，gap 在 `gap.md` §三点一〇六二 G1160–G1178）

### 一、★★★ 一条完整的调用链（全部逐字，符号名可复查）

⇒ `CodeEditorWrapper-DB8UxA00.js` 顶部 import 串逐字＝`import{c as I,t as e,_ as ve,l as kt,a as yt,b as xt,E as Ct,d as vt,R as wt}from"./vendor-code-editor-BLm003PU.js"` ⇒ **`I` ＝ 该 chunk 导出 `c` ＝ `gBn`**（导出表整串逐字＝`export{n8t as D, Ls as E, B5n as R, $Bn as T, Ft as _, dBn as a, pBn as b, gBn as c, tBn as d, wBn as k, hBn as l, QBn as r, W as t}`），**`e` ＝ `W` ＝ `@lezer/highlight` 的 tag 集**（所以 368 条 styles 规则里的 `e.comment`／`e.function(…)` 全是 tag 常量）；☆ 其余七个别名一并对上＝`ve`＝`Ft`（★ **与本目录别处写的 `Ft` 不是同一个东西**，此处它是 `import(...)` 的 preload helper ⇒ 一条"同名不同源"的坑）、`yt`＝`dBn`、`kt`＝`hBn`、`xt`＝`pBn`、`Ct`＝`Ls`、`vt`＝`tBn`、`wt`＝`B5n`（＝React 编辑器本体，消费点逐字 `n.jsx(wt,{spellCheck:!1, ref:b, value:o, autoFocus:s, extensions:ge, height:"100%", readOnly:!t, editable:t, basicSetup:{…}, theme…})`）。
⇒ 20 个工厂体逐个 `return I({theme:t, settings:{…<名册 settings>…a}, styles:[<本档色板>…, ...r]})` ⇒ ⇒ **工厂直接产出 CM6 扩展数组**，不返回"配置对象"。
⇒ `gBn` 尾部逐字 `var g=li.theme(O,{dark:i==="dark"}), w=uE.define(l), Q=[g, R6e(w)]; return Q` ⇒ 三件身份已核：`li.theme` ＝ `EditorView.theme`；`uE.define` ＝ `HighlightStyle.define`；`R6e` ＝ CM6 的 `syntaxHighlighting`（判据＝其体内逐字 `r instanceof uE && (r.module && s.push(li.styleModule.of(r.module)), l=r.themeType)` 与 `d_t.of(r)`／`qxe.computeN([li.darkTheme], O=>O.facet(li.darkTheme)==(l=="dark")?[r]:[])`，即"带 `fallback` 才直推、否则按 `darkTheme` 条件挂载"）。
⇒ ☆ **`R6e(w)` 在 Craft 这条路上没有第二参数** ⇒ 不走 `fallback` 分支（G1094 里那条"CM6 默认 hex 样式当 fallback"是 `basicSetup` 的 `R6e(v2n,{fallback:!0})`，**与名册路径互斥**）⇒ 判：**选了名册档就没有兜底 hex 样式**。

### 二、★★★ "缺省值"问题的正解＝装配处一个默认值都没有

⇒ `gBn` 全文 15 条写操作**全是条件与**（`s.fontFamily&&`、`s.gutterBackground&&`、`s.gutterForeground&&`、`s.gutterBorder&&`、`s.caret&&`、`s.gutterActiveForeground&&`、`s.lineHighlight&&`、`s.selection&&`、`s.selectionMatch&&`）＋两条无条件（`O["&"]={backgroundColor:s.background,color:s.foreground}`、`O[".cm-gutters"]={}`）。
⇒ ⇒ ★★★ **不存在"默认 gutter 前景"**，上批队列的提法（"在装配处找默认 gutter 前景"）本身不成立；正确机制＝`.cm-activeLineGutter` 是一条**独立选择器**、其 `color` 不被写入时**沿 CSS 继承**取祖先 `.cm-gutters` 的 `color`（＝该档 `gutterForeground`），13 档的继承值因此全部可算（逐字见 `longtail.md` §三十八.一）。
⇒ ☆ 更妙的是 `p` 是**同一个对象引用**赋给 `O[".cm-activeLineGutter"]`：`gutterActiveForeground` 与 `lineHighlight` 两个键写进同一个 `p` ⇒ 两键都缺时**赋的是一条空规则** `{}`（`githublight` 就是这种）⇒ 该选择器在生成的 CSS 里不产出任何声明。

### 三、★★★ 暗档分支的判定与"三档错配"的真实后果

⇒ 逐字 `{dark:i==="dark"}`，`i` ＝ 工厂内 `theme:t="…"` 的字面量默认值（承第 109／111 批：解构源是字面量 `{}` ⇒ 参数进不来）。
⇒ 分支的落点机制（`vendor-code-editor` @165,412–168,300 逐字）＝`W9t={"&light":"."+C9t,"&dark":"."+Y9t}`（`C9t`／`Y9t` 是 `StyleModule.newName()` 生成的类名，逐字 `newName(){let i=HSt[FSt]||1; return HSt[FSt]=i+1, axe+i.toString(36)}`）＋ 根节点 class 逐字 `get themeClasses(){return Sxe+" "+(this.state.facet(kxe)?Y9t:C9t)+" "+this.state.facet(Ene)}`，而 `kxe=Facet.define({combine:r=>r.indexOf(!0)>-1})` ⇒ ⇒ ★★ **只要注册的主题里有一个声明 `dark:true`，整个编辑器根节点就取 dark 分支**（Craft 每编辑器只注册一个 ⇒ 等价于"该档工厂字面量说了算"）。
⇒ ☆ 因此第 111 批那三档错配的可见后果**不是**"代码块整体配色反了"（名册自己覆写了背景／前景／底色／选中／行号），**而是**"名册没覆写的那批基准选择器取相反分支"：基准主题里成对的 `&light`／`&dark` 共 **20 个去重选择器**，名册只碰得到 6 类（`.cm-gutters`／`.cm-activeLine`／`.cm-activeLineGutter`／`.cm-content` caret／`.cm-selectionBackground`／`.cm-selectionMatch`）⇒ 漏出面＝`.cm-searchMatch`、`.cm-searchMatch-selected`、`.cm-specialChar`（`red` vs `#f78`）、`.cm-panels*`、`.cm-button`、`.cm-snippetField`、`.cm-textfield`、`.cm-tooltip*`。
⇒ ★ 另有两条**天生不对称**的基准规则＝`.cm-cursor` **只有 dark 版**（`borderLeftColor:"#ddd"`）、`.cm-gutters` 的 flat 形态只有 dark 版（`#333338`／`#ccc`），light 版的 `border` 反倒多一条 `0px solid #ddd` ⇒ 名册缺 `caret` 的两档（`craftlight`／`githublight`）在亮分支下**根本不产出 cursor 颜色**。

### 四、★★★ 主题名册其实有三张、语言名册有四张（本批新增两张）

⇒ 主题三张＝`V`（展示，21 条，带 label／keywords／isDark／settings 引用）、`ue`（工厂表，21 键 → 工厂结果变量）、`nt`（TypeScript 枚举，21 条 `AUTO="auto"`…`VSCODEDARK="vscodedark"`）⇒ ★★ **`V` 与另外两张的声明序不同**，且分歧**只在 Tokyo Night 三档**（`V`：base→day→storm；`ue`／`nt`：day→storm→base）⇒ 展示序是**独立手写**的（不是从工厂表派生），规则结案见 §五。
⇒ 语言四张＝① 挑选名册 39 条三元组（第 107 批）；② **`Qvt` 41 项扁平名单**（本批新增，尾部多 `docs`／`blocks`／`suggestions`、**少 `mermaid`**，且 `Yvt=new Set(Qvt)`）；③ **`Xvt` 77 条扩展名／别名 → `storedLangCode`**（本批新增，逐字全表在 `longtail.md` §三十八.三）；④ **`PGe=["mermaid","math_formula","stex"]`** 三条"伪语言"（本批新增，被两条独立通路各用一次）。
⇒ ☆ `PGe` 的两次用法＝`rD=new Lo("codeEditorDefaultLanguage","javascript", t=>typeof t=="string" && !PGe.includes(t))`（**默认语言偏好校验器排除它们**）与挑选菜单里 `["mermaid","math_formula","stex"].includes(B.storedLangCode) || Ft.store(B.storedLangCode)`（**选这三档不写默认偏好**）⇒ ⇒ ★ 同一条规则两处独立实现、用词一致（`stex` 与 `math_formula` **同时**在名单里 ⇒ 说明存储侧与 grammar 侧两个码都可能出现）。

### 五、★★★ 展示序结案（结掉第 110 批开放项④）

⇒ 规则＝**`auto` 第 1 → `craftdark`／`craftlight` 第 2–3（暗前亮后）→ 其余 18 档严格按 `id` 字母升序**；判据三条：① 逐位与 `[...tail].sort()` 比对，**DIFF 数 0**；② 本 chunk 内 `.sort(`／`.reverse(`／`V.sort`／`[...V` **各 0 处** ⇒ 展示序＝字面量声明序；③ 消费点唯一加工＝`V.filter(b).map(N)`（过滤＋映射，**不改序**）。
⇒ ✎ 否证：纯字母序里 `auto` 应在第 3、`craftdark` 第 5、`craftlight` 第 6；按 `label` 排是另一套（`Atom One`、`Aura`、`Auto`、`BBEdit`…）；`isDark` 序列逐字 `DDLDDLDDDLDLDLLDDDLDD` ⇒ **既非亮前暗后也非暗前亮后**（上批"表里 `tokyonight` 排在 `tokyonightday` 之前"正是字母序的体现，不是异常）。

### 六、★★☆ 兜底策略有三套，同一件"未知名"三种下场

⇒ ① **名册层有兜底**＝`lt=(o,t)=>{if(o==="auto"){const r=t?"craftdark":"craftlight", s=V.find(D=>D.id===r); return s||V[0]} const a=V.find(r=>r.id===o); return a||V[0]}` ⇒ 空串／未知名 ⇒ **`V[0]`＝`auto`**（☆ 顺带：**`auto` 因此是"兜底位"**，把它放第 1 既是展示需要也是语义需要）。
⇒ ② **工厂层无兜底**＝`De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]` ⇒ `De("")` ⇒ **`undefined`**。
⇒ ③ **同步 effect 走早退**＝`useEffect(()=>{if(u){const L=V.find(P=>P.id===u); if(!L)return; B(L)}},[u])` ⇒ 外部传入未知 themeId ⇒ **保持当前值不变**（既不兜底也不报）。
⇒ ⇒ ★★★ 上批队列③的"`De("",isDark)` 空串复测"**在盘上结案**：组件里 `S` ＝ `editorTheme` prop（`ca=forwardRef(({…editorTheme:S,…})=>…)`，消费点逐字 `editorTheme:M`，而 `M` 只由 `B(L)`／`B(V[0])` 写入 ⇒ **恒为名册条目**）⇒ `De(S.id, …)` 拿不到空串 ⇒ **UI 通路不可达**，不必再花屏上预算。

### 七、★★★ 主题的写入面是两层，不是一层

⇒ 块级＝`Ut([o],{pluginType:"codeBlock", pluginName:"codeBlock", pluginConfigurationData:{themeId:L.id}, horizontalSizeClass:null, verticalSizeClass:null, surfaceShadowOpacity:1})`（第 110 批，逐字再证一次：本批在同 chunk @53480 又撞到一处）。
⇒ 账户级＝挑选菜单逐项 `onClick:()=>{St.store(v.id), s(v)}` ⇒ `St` ＝ 主包 @646,127 的 `MGe=new Lo("codeEditorDefaultTheme","auto", t=>typeof t=="string")`；⇒ ★★ **校验只验"是字符串"** ⇒ 任意／未知 themeId 都能进偏好库，之后由 §六① 的 `V[0]` 兜底 ⇒ 这是"契约宽、实现兜"的一条实例（与第 76 批"契约文案不可信"呼应但方向相反：**这里宽的是校验器**）。
⇒ 语言同构＝`Ft.store(B.storedLangCode)` ⇒ `rD` ＝ `new Lo("codeEditorDefaultLanguage","javascript", …)`（校验**排除** `PGe` 三档）。
⇒ ⇒ 对复刻的含义＝**"某块用什么主题"与"新块默认用什么主题"是两条独立持久通路**，本地现在两者都没有（G1093 未动 ＋ G1166 新增）。

### 八、★★☆ `themePreviews` chunk 的真实身份（✎ 作废上批一条推断）

⇒ 上批登记 G1140 时**只看了 chunk 名**（`themePreviews-BJcCJGmn.js` 在两份 contract 里被点名）就推断"每档主题有预览资源"；本批整块读完（**2,595 字符，一次读完**）⇒ ★ 它导出的是 **6 强调色 × 3 档外观＝18 张 `appearance.<色>.<档>@2x.png`** 的预载缓存，与代码块主题**毫无关系**；消费方＝`PreferencesPanel`／`SubscriptionsPanel`／`MySpaces`／`index`（`import{p as rl, g as xc}from"./themePreviews-BJcCJGmn.js"`）。
⇒ 实现细节（可复刻）＝模块级 `t=new Map()` 缓存；`r(e)` 造 `Image` 且 `alt:""`、`draggable:false`；`T(e)` 的三态 `idle/loading/loaded|failed`，**`onload` 里先 `image.decode().catch(()=>{})` 再 resolve**（⇒ 防"标记完成但字体／解码没好"）；`B(e)` 的 `preloadPromise` ＝ `Promise.all` 三支，**任一失败则把 `preloadPromise` 置回 undefined 允许重试**。
⇒ ☆ 顺带两条新事实＝**强调色恰好 6 档**（与本目录 CSS 侧 `[data-accent=…]` 全量枚举的 6 枚**两个独立源吻合**）＋ **外观有第三档叫 `dynamic`**（历批只见亮／暗；本地的对应词是 `system`，见 `src/actions/user/preferences.ts:6`）。

### 九、★★☆ Markdown 导出是一张 handlebars 模板 ＋ 一个三步解码器（不是历批那张 HTML 表）

⇒ 模板＝`de.template`（**2,729 字符**，整表已解码落盘 `_harvest/b112-export-template.txt`）；代码块分支逐字见 `longtail.md` §三十八.四；⇒ ★ 与 `model.md §一之六` 的 `g4e` 表**并存不矛盾**＝那张是**块样式 → HTML 标签**（导出 DOCX／HTML 侧），这张是**块 → Markdown 文本**（导出 md 侧），此前本目录一直只有前者。
⇒ 解码器＝`formatBlock(e,r,i)` 四步（① `split("\n").filter(o=>o.trim().length!==0).join("")`；② `l="\n"`；③ `i&&(s.includes("`")?l=" ":l="<br>")`；④ `\dl`→`\n\n`、`\sl`→`l`、`\i__craft`→`flavour.indentationCharacters`）⇒ ★ 模板里的换行／缩进因此**全是装饰**，所有真实输出顶格写；⇒ ★★ 一条可检验推论＝code 块的输出必然含反引号（`backticks` helper 自己发的）⇒ **inline 语境下代码块的软换行一律变空格**＝多行被摊成一行。
⇒ ☆ `inline` 的两个调用点＝`formatBlock(P,r,!0)` @40,151（块 id 解析支）与 `formatBlock(g,r,!1)` @40,653（先把 `styleAttributes.textStyle` 强设 `"title"`）⇒ `~` 真值语义（"什么算内联渲染"）本批未继续展开，转下批。
⇒ ☆ `backticks` helper 是**常量** `"```"` ⇒ 官方**不做自适应围栏**（与本地同缺陷，见 G1171）。

### 十、☆ 本批方法账（零预算盘上项怎么打）

⇒ 一条：**chunk 名会骗人**（`themePreviews` 案例），凡"某资源服务于 X"的推断，要么读完 chunk 体、要么读它的消费方 import，**不许按名字定性**（上批 G1140 就是按名字定的性）。
⇒ 二条：**"找不到默认值"本身是一条结论**，但要先证明装配处**没有**默认值才能这么说（本批把 `gBn` 全文读出来才敢写"缺省＝靠继承"）；☆ 上批队列写的是"去装配处找默认 gutter 前景"，**这个提法把'可能存在默认'预设进去了**，实际答案是不存在。
⇒ 三条：**配对类枚举要用带嵌套的括号配平**，不能用 `[^{}]*` 之类的" flat 正则"——本批第一版把 `&light .cm-gutters`（体内有 `"&.cm-gutters-before":{…}`）漏掉了，差点写出"`.cm-gutters` 只有 dark 版"这种错话；⇒ ★ 修正后＝20 个去重选择器、5 条单档（逐字表在 `longtail.md` §三十八.二）。
⇒ 四条（承第 111 批正则律）：`storedLangCode` 全量枚举这次是**用 `langCode:"…"` 形态匹配**的，因此漏掉唯一非字符串档 `plaintext`（`langCode:null`）⇒ 脚本报 38 条、官方实际 39 条；⇒ ☆ **按"值必须是字符串"写的正则会系统性漏掉 `null`／`undefined` 档**，全量枚举要么允许 `null` 要么与上一批的名册数对账（本批靠与 §三十三.一的 39 项对账才发现）。


### 十一、★★★ `kt`／`yt` 的身份结案＝**grammar 能力面登记表**（顺带把第 107 批"能力面未量化"结掉）

⇒ 别名还原走 export 表（承第 43 批那条纪律，别按字母猜）：CodeEditorWrapper 的 `import{l as kt, a as yt}` ⇒ `vendor-code-editor` 尾部导出表逐字 `… dBn as a, pBn as b, gBn as c, tBn as d, wBn as k, hBn as l, QBn as r, W as t` ⇒ ⇒ **`kt`＝`hBn`＝`Object.keys(jTe)`、`yt`＝`dBn`＝`function dBn(r){return jTe[r]?jTe[r]():null}`**。
⇒ 表本体＝`jTe={…}`（@1,477,736，体长 2,879 字符），**119 个键、全部唯一**，两种形态＝`:()=>F.define(Y)` 惰性 106 条 ＋ 直接引用 13 条（`javascript:Bne`、`jsx:()=>Bne({jsx:!0})`、`typescript:()=>Bne({typescript:!0})`、`tsx:()=>Bne({jsx:!0,typescript:!0})`、`sql:mysql:pgsql` 一族共用 `k4e` 加 dialect、`markdown:()=>UPn({base:h7e,codeLanguages:F5n})`…）。
⇒ 闸门逐字＝`l.useEffect(()=>{if(d){if(kt.includes(d)){const i=yt(d);B(i)}}else B(null)},[d])`，`d`＝**挑选名册的 `langCode`**（不是 `storedLangCode`）⇒ ⇒ ★ **闸门不做别名规范化**，查不到键就**根本不加载语言扩展**（`B` 保持 `null`）⇒ 于是"名册里可选、但不高亮"是可预期的：**`ada`／`bash`／`matlab`／`prolog`／`vbnet` 五档的 `langCode` 不在 119 键里**（☆ 而键表里有近义键 `shell`／`octave`／`vb` ⇒ 判"名册 `langCode` 与登记表键漏配"，不是"这些语言不支持"）；⇒ ☆ 四个已知分歧档（`csharp`／`objectiveC`／`tsx`／`stex`）都在表里 ⇒ ⇒ **`langCode` 这个字段的存在意义现在被解释了：它就是 grammar 键，与落库用的 `storedLangCode` 分属两个命名空间**。
⇒ ☆ `stex` 在表里 ⇒ 公式档**有一条真 grammar** ⇒ 与"公式另有 KaTeX 预览"并存（编辑态高亮、预览态渲染，两条各走各的）。
⇒ ★★★ **`M`（语言扩展）进不进 `extensions` 这一问，本批已证**＝组装点逐字 `ge=[Ct.changeFilter.of(i=>{…}), ne, ...M?[M]:[], vt({parent:v.current, position:"absolute"}), ...g]` ⇒ ⇒ **查不到 grammar 键 ⇒ `M` 是 `null` ⇒ 数组里那一项被展开成空 ⇒ 编辑器拿不到任何 language 扩展** ⇒ §十一 那条"五档不高亮"从推论升为**盘上实证**（☆ 仍缺屏上一次实测来确认观感，但不影响机制结论）。
⇒ ☆ 同一处还第一次给出 **Craft 的 CM6 `basicSetup` 裁剪**（逐字）＝`basicSetup:{highlightActiveLineGutter:t, highlightActiveLine:t, searchKeyMap:!1, foldGutter:!1, highlightSelectionMatches:!1, autocompletion:k==="web", closeBrackets:!0}`（`t`＝`inCodeEditing`、`k`＝platform）⇒ ★ **活跃行与活跃行行号槽只在"编辑态"开**（非编辑态整条关闭 ⇒ §三十八.一 那张继承表要在"编辑态"这一格才成立）；⇒ ★ **搜索键表关、折叠沟槽关、选中匹配不高亮、自动补全只在 web、括号自动配对开**；☆ `readOnly:!t, editable:t`、`autoFocus:s`（`s`＝`inFocusMode`）。

### 十二、★★☆ 图表档受**特性开关**控制（第一次把开关 id 抄到手）

⇒ 逐字 `m=Wt.isEnabled(Qt)` ＋ `X=m&&N.langCode==="mermaid"` ＋ 语言菜单 `c=pe.filter(L=>L.langCode!=="mermaid")`；⇒ 别名链＝CodeEditorWrapper `import{g5 as Wt, sY as Qt}` ⇒ index 导出表 `XN as sO,…`（☆ `Wt` 未再往下追）与 **`Qt`＝`OE`＝逐字 `"fs-mermaid-diagrams"`** ⇒ ★ **Mermaid 支持在 web 构建里是灰度开关**（⇒ 历批"图与公式可以不是独立块类型"那条要加一句：**图的渲染还额外受开关门**，屏上看不到 Mermaid 不等于代码没有）。
⇒ ☆ 顺带全 chunk 枚举前缀串（`fs-`／`pf-`／`ex-`）＝**41 条**，落盘 `_harvest/b112-flags.txt`；其中同段相邻的常量逐字＝`"fs-quick-search-space-filter"`、`"fs-workflow-links"`、`"fs-service-worker"`、`"fs-mermaid-diagrams"`、`"fs-collection-kanban-view"`、`"fs-offline-mode-rollout"`、`"pf-paddle-subscription"`、以及 **`fs-debug-*` 一族 13 条**（`reminder-options`、`sync-log`、`block-selection-borders`、`allow-inbox-root`、`allow-past-task-dates`、`dont-refetch-tasks-on-focus`、`extend-resize-observer-logs`、`pseudo-localization`、`disable-sentry`、`show-block-debug-info`、`whiteboard-low-limit`、`ai-chat-models`、`posthog-market`、`fps-overlay`）⇒ ★ 这一族是第 97 批 `DebugPrimitives` 面板的**后端名单**，且其中两条与历批结论直接相关：**`fs-debug-allow-past-task-dates`**（＝§11.3／G333 那条"过去日期不自动采纳，除非特性开关放开"的**开关本体**）与 **`fs-debug-allow-inbox-root`**。
⇒ ☆ 读法纪律＝`ex-data`／`ex-info` 两条疑似他库噪声（不认作 flag）⇒ 本批只把"**同一段常量表里的 21 条**"当权威名单，全 chunk 的 41 条只当候选。


**仍未采到（本节）**：① **同一 tag 出现两条规则时谁赢**（`styles` 数组末尾的 `...r` 与名册内 `dracula` 的重复 `e.atom` 都依赖这一点；本批只拿到声明顺序，未读 `HighlightStyle` 的优先级实现）；② `formatBlock` 的 `inline` 真值语义（哪些块会走内联支、官方自己会不会因此把多行代码摊平，属推论未实证）；③ `R6e` 内 `qxe`／`d_t`／`Q2n` 三个符号的身份（只判到"syntaxHighlighting 的形状"）；④ 基准主题 20 个选择器里 **`.cm-panels*`／`.cm-button`／`.cm-searchMatch*` 在 Craft 里是否可达**（要看 Craft 有没有挂 `search`／panel 扩展，本批没查）；⑤ `themePreviews` 的 18 张 PNG 在屏上的**呈现位**（外观设置卡片？订阅面板预览？）未屏上验；⑥ `yt(d)` 的结果进不进 `extensions`（逐字只读到 `B(i)` 赋值，没读到组装点 ⇒ "查不到键就 `null`"这条推论要在这里复证）；⑦ `Wt`（`sO`）本体与开关的**取值来源**（远端下发还是本地默认）；⑧ 第 112 批队列①②③（还原标签页、清残留、主题面板屏上入口）本批未做，原因见 `interactions.md` V106 的现场状态节。

## 五十二、**第 113 批＝"删除"与"id"各有两套口径的一次拆解（屏上「最近删除」不含 MCP 软删的文档／`rootBlockId` 与 `documentId` 不互通且只有反向翻译器／回收站写侧在块级 action 入口被拒／每个代码块是一个独立 CM6 实例）**（✓屏上只读＋MCP 数据面 第 113 批 2026-10-01 04:1x–04:4x 本地＝UTC 09-30 20:1x–20:4x；★ gap 在 `gap.md` §三点一〇六三 G1180–G1191，逐字回包在 `longtail.md` §三十九，模型含义在 `model.md` §一之七十一，现场状态在 `interactions.md` V107；⚠ 本批**建了一个沙盒并软删、但三条永久清除一条都没落刀**＝连接器在打开 ⋯ 菜单那一步挂死）

### 一、★★★ 「回收站」不是一个集合，是两个

⇒ 同一时刻、同一账户、同一空间：MCP `documents list --location trash` 回 **6 条**（含本批刚软删的 `B111-THEME`、`B113-CODEBLOCK`），屏上「最近删除」屏渲染 **4 张卡**（不含那两条）。
⇒ 两条假说都被排除＝**虚拟滚动**（把末行 `scrollIntoView` 之后仍是 4 行，且末行 `height:282`＝卡片、四张全在一屏内）与**客户端缓存**（`goto(同一 URL)` 在 SPA 里等于重载，重载后仍 4）。
⇒ ★ 所以正确读法＝**"删除"至少写了两层标记，而屏上列表与 MCP 列表各查各的**；☆ 由此得一条通路级后果＝**V93 屏上永久清除只能清"屏上列得出"的条目**，对上批那条"回收站二次清空只能屏上"要加这个限定。
⇒ ☆ 反证"屏上口径更严"的证据＝屏上那 4 条里含 `6cc9761c-…`（第 75 批"已删除并结案"的归属未定残留），它**不在** MCP 的 6 条里 ⇒ 两套名单**双向**都有对方没有的条目。

### 二、★★★ `rootBlockId` 与 `documentId`＝同一篇文档的两个命名空间，官方只给反向翻译器

⇒ 逐字对照＝`documents create` 回 `rootBlockId: <objId:19>`，而第二个 id 出现在 **`Craft app link: craftdocs://open?spaceId=<spaceId>&documentId=d0710568-…`** 的 query 里（☆ 所以第 111 批"同时回两个 id"的表述要改成"第二个 id 藏在 app link 行里"）。
⇒ `blocks get <documentId>` 逐字报 `Block not found: …` ＋ `Hint: If you have the Craft app/web link, run 'documents resolve-link <url>' via craft_read to get the rootBlockId.`
⇒ `documents resolve-link <web URL>` 回 `Resolved link to rootBlockId <8d3acfb3-…>` ＋ `Title: …` ＋ `Raw URL documentId: d0710568-…` ⇒ **一次调用把两层都回显**，是唯一的翻译入口，且**只吃 URL**（没有 `resolve-id`）。
⇒ ★ 屏上侧同源证据＝「最近删除」四条 `data-item-id`（`e8404352-…`／`cddd981c-…`／`6cc9761c-…`／`35edfc37-…`）与 MCP 六条 `rootBlockId` **零交集**，而 `35edfc37-…` 同时出现在历批缓存的 `docs.craft.do/editor/d/<spaceId>/35edfc37-…` ⇒ **屏上条目 id＝URL 层的 documentId**。
⇒ ☆ 与第 112 批 `langCode`／`storedLangCode` 那条同形＝**Craft 一贯把"给人看的链接层 id"与"给块层用的 id"分成两套命名空间**，复刻时任何按 id 寻址的实现都要先定是哪一层。

### 三、★★ 回收站的写侧闸门在块级 action 入口，且错误信息质量分三档

⇒ 逐字＝对回收站里那篇文档的块做 `blocks update` ⇒ `Failed to update block: Cannot modify document in trash. Restore it first.` ＋ `Hint: Restore trashed documents before deleting blocks inside them.`
⇒ 与第 111 批 G1155"回收站文档对 MCP 仍可读（json＋markdown 双通路完整返回）"合起来＝**读放行、写拒绝**，拒绝点在**块级 action**（不是文档级动词缺失、也不是静默成功）。
⇒ ☆ 同一条 CLI 里错误信息三档＝① 本条（有原因＋有下一步）② G1151 的 `at "root": Invalid input`（只有位置）③ G1149 的 `Theme "dracula" not found. Use "blocks explore-themes --type page"`（有原因＋有替代命令）⇒ **不要按"报错都很详细"设计本地错误层**。

### 四、★ 每个代码块是一个独立的 CodeMirror 6 实例

⇒ 实测＝六块文档里 `.cm-content` 的 locator `count()` **恰好 6** ⇒ 一块一编辑器（不是"整篇一个 CM6 ＋ 代码块内嵌 mode"）。
⇒ ☆ 这给历批两条现象补上机制＝**焦点在块内时 `Ctrl+Z` 被子编辑器吞掉**（走该实例自己的历史，为空即无操作）、**块内行高与块间距来自不同层**（块内＝每实例的 `.cm-content{line-height:24px !important}`＝第 112 批 G1176 那层；块间＝Craft 自己的布局）。
⇒ ☆ 顺得一条廉价判据＝**数代码块可以数 `.cm-content`**（官方不是 `pre`，历批按 `pre` 数会数不到）。

### 五、★★ "选了不高亮"的判据形态＝同屏对照，一次采集两类样本

⇒ 做法＝一篇文档里并排放五档"无 grammar"语言（`bash`／`ada`／`matlab`／`prolog`／`vbnet`）**加一档对照组**（`python`，在 `jTe` 119 键里）⇒ 一次截图同时得到"无 grammar ⇒ 整块单色"与"有 grammar ⇒ 按 `craftlight` 三组上色"。
⇒ ★ 对照组那三条色（`def`/`return` 红、`f`/`x`/`1`/`+` 蓝、`# note` 灰）逐一对应第 112 批的 `keyword→#d73a49`、`variableName/number/operator→#005cc5`、`comment→#6a737d` ⇒ **同一次采集把"漏配判定"和"映射表方向"两件事一起验了**。
⇒ ☆ 可复用为通用判据＝**能力面类结论（有没有 X）要自带一个"确定有 X"的对照档**，否则"没看到"永远可能是"没触发"。

### 六、☆ 契约与实现：这次对上的一条、没对上的两条

⇒ 对上＝`craft_read` 描述里逐字写着 `rootBlockId != URL docId`，本批实测完全一致（见 §二）⇒ ☆ 这是历批"契约文案不可信"的一条反例，**要记成"该条契约可信"而不是取消那条纪律**（同批 `explore-themes --type code` 的例子仍是错的＝G1149）。
⇒ 没对上①＝`documents list --filter QODER` 回全量 4 条 ⇒ `--filter` 在该动词上不生效（文档里它只出现在 `folders list` 的例子旁）。
⇒ 没对上②＝`blocks add` 一次 6 块的回包是 `Added 6 blocks.` ＋ 五个 id ＋ `(+1 more)` ⇒ 第 111 批"只回首个 id"过窄（那次 3 块只回 1 个，本批 6 块回 5 个 ＋ 截断标记）⇒ ☆ 判"回包够不够用"要按**枚举规模**测，不能只测一例。

### 七、☆ 仪器增补三条

⇒ ① **`locator.scrollIntoViewIfNeeded` 不存在**（逐字 `is not a function`）⇒ 滚元素用 **`locator.evaluate(el => el.scrollIntoView({block:'end'}))`**，实测可用且能同手回传 `getBoundingClientRect`（＝第 111 批那条"locator.evaluate 可用"的第二个用法）。
⇒ ② `cua.scroll` 的入参是 `{x, y, …}`（从某个视口坐标滚），**没有实测就不要用**。
⇒ ③ ★★★ **窗口可见时点击也能把扩展串行队列挂死**＝`locator.click()` 打 `BUTTON[data-testid="browse-sort-button"]` 之后 cell 永久 running、`node_repl_wait` 回 `AbortError: Execution was cancelled`、随后**连 `title()` 都拿不到**（`Tool command waited too long in queue`），而**当时 `visibility.get()`＝true** ⇒ ☆ 历批"挂死＝窗口最小化"的归因**不充分**：点击本身就能挂（最可能是那枚 ⋯ 触发了扩展侧不返回的原生路径）。⇒ 处置＝按"中断即停"立刻停手，**没有**在挂死队列上重试点击，**没有**做任何不可逆动作。

**仍未采到（本节）**：① 屏上「最近删除」的**查询条件**到底是什么（另一套删除标记？`trashedAt` 之类字段？还是"只列 UI 删的"）；② documentId→rootBlockId 有没有**非 URL** 的正向映射；③ 屏上选择模式能不能勾到"MCP 列得出、屏上列不出"的条目（本批在打开 ⋯ 那一步挂死）；④ 每块一个 CM6 实例 ⇒ **跨块撤销是否合并**（G1188 只给了机制，没跑行为）；⑤ 主题面板触发器（只剩块把手一条）。

## 五十三、**第 114 批＝CM6 高亮优先级的四层判据（同档后写覆盖前写／沿 `tag.set` 链具体优先／多档拼接／fallback 只在主样式为空时生效），外加一条历批没看到的门控缺失：Craft 不传 `themeType` ⇒ token 色板永远不受明暗面门控**（✓盘上 2026-10-01 04:4x–05:2x 本地＝UTC 09-30 20:4x–21:2x，**零浏览器内容面调用、零官方写入**；★ gap 在 `gap.md` §三点一〇六四 G1192–G1208，逐字清单在 `longtail.md` §四十，20 档有效色审计在 `styles.md` §十九之续（第 114 批），两条明暗轴的含义在 `model.md` §一之七十二，本地自证操作在 `interactions.md` V108）

### 一、★★★ 优先级不是一层，是四层（每层都要单独判，混起来就会判错"某档到底显示哪个色"）

⇒ **第 1 层＝同一档 `styles` 数组内**：`n_t`（＝CM6 `styleFor`，`vendor-code-editor-BLm003PU.js` @275,545）逐字 `let s=Object.create(null); for(let p of r) if(!Array.isArray(p.tag)) s[p.tag.id]=p.class; else for(let g of p.tag) s[g.id]=p.class` ⇒ 一张 **`tag.id → class` 的平表**，后写覆盖前写 ⇒ ★★★ **数组序里"最后一条赢"**，前面的同名条目退化成"生成了 class、但没有任何元素引用它"的死 CSS（class 仍留在 `StyleModule` 里，因为构造函数对**每条** spec 都调一次 `O(...)` 生成名字）。
⇒ **第 2 层＝tag 继承链**：`style:p=>{let g=O; for(let w of p) for(let Q of w.set){let S=s[Q.id]; if(S){g=g?g+" "+S:S; break}} return g}` 里那个 `break` ⇒ 沿 `tag.set` 找**第一个**有规则的；而 `set` 的顺序由 `Tag` 的静态工厂逐字决定＝`let O=new zxe(l,[],null,[]); if(O.set.push(O), s) for(let p of s.set) O.set.push(p)`（@273,252）⇒ **自身永远在链首** ⇒ ★ **具体 tag 优先于父 tag**（例：`t.className` 有规则时不会被 `[className, propertyName]` 之外的 `t.type` 规则抢走）。
⇒ **第 3 层＝多档样式之间**：`function DQn(r,i){let s=null; for(let l of r){let O=l.style(i); O&&(s=s?s+" "+O:O)} return s}` ⇒ ★ **不是择一，是全部拼接**（空格连接）⇒ 若同时挂两档 `HighlightStyle`，一个 token 会**带两个 class**，最终由 CSS 层的**声明顺序＋特异性**决定 ⇒ 与"第 1 层的覆盖"是**完全不同的机制**（一层是 map 赋值，一层是 class 串接）。
⇒ **第 4 层＝主样式与兜底样式之间**：`function DPe(r){let i=r.facet(qxe); return i.length?i:r.facet(d_t)}` ⇒ 主面（`qxe`）非空就**整条忽略**兜底面（`d_t`）⇒ 复核上批"名册路径与 `basicSetup` 的 `R6e(v2n,{fallback:!0})` 互斥"成立，且现在给出**判据本体**。

### 二、★★★ 一条历批没看到的门控缺失＝token 色板不进明暗门控

⇒ `R6e`（＝`syntaxHighlighting`）体逐字：`function R6e(r,i){let s=[Q2n],l; return r instanceof uE&&(r.module&&s.push(li.styleModule.of(r.module)), l=r.themeType), i!=null&&i.fallback?s.push(d_t.of(r)):l?s.push(qxe.computeN([li.darkTheme],O=>O.facet(li.darkTheme)==(l=="dark")?[r]:[])):s.push(qxe.of(r)), s}` ⇒ 三分支的**入口变量**是 `l=r.themeType`。
⇒ 而 Craft 侧逐字只有 `w=uE.define(l)`（**没有第二个实参**），`uE` 构造尾部 `this.themeType=s.themeType`、`static define(i,s){return new uE(i,s||{})}` ⇒ `s={}` ⇒ **`themeType` 恒为 undefined** ⇒ ⇒ ★★★ **恒走第三条 `qxe.of(r)`＝无条件挂载**，只有 `define(specs,{themeType:"dark"})` 才会进 `computeN([darkTheme], …)` 的条件挂载。
⇒ ⇒ ★★ **改判上批一条作用域**（不是推翻，是收窄）＝"名册 `theme` 字面量与界面明暗错配 ⇒ 取反分支"只成立于 `li.theme(O,{dark:i==="dark"})` 那条 **CSS**（含 `O["&"]` 的底色／前景色与 `.cm-gutters` 那一族），**语法色板永远来自所选档自己**；⇒ ☆ 屏上判据＝拿一档"名字与 `theme` 字面量相反"的档（上批错配名单里的），在**对面**明暗下看：**底色会跟着 CSS 分支走，token 色不会跟着走** ⇒ 两半可能"各取一边"。

### 三、★★★ `...r` 结案＝一个永远为空的死扩展点（把上批对 `theme` 的判据推广到三参）

⇒ 工厂统一形状（18 个箭头 ＋ 2 个函数声明，见 `gap.md` G1199）＝`io=o=>{const{theme:t="light",settings:a={},styles:r=[]}={}; return I({theme:t, settings:{...We,...a}, styles:[<本档条目>, ...r]})}` ⇒ ★ 解构源是**字面量 `{}`** ⇒ `t`／`a`／`r` **三个形参全部取默认值**，箭头入参 `o` 在体内**一次都没被引用** ⇒ `settings` 覆盖位与 `styles` 追加位都是"写好的接口、没人调用"；⇒ ☆ 直接推论＝名册**不可能被外部追加样式** ⇒ 第二节第 1 层的那些重复**全是工厂自己写进去的**，不是运行时拼进来的。

### 四、★★★ 20 档名册的"有效色"审计（第一次按"计算结果"而不是"声明"来读名册）

⇒ 仪器＝`_harvest/b114-style-precedence2.cjs`（第二版；第一版 `_harvest/b114-style-precedence.cjs` 因只匹配箭头式而**少数两档**，教训进 `longtail.md` §四十.五）；⇒ 三条结论：
① **`link` 在 6 档实际不上色**＝`aura`／`githublight`／`materiallight`／`tokyonightday`／`tokyonightstorm`／`tokyonight` 里，`{tag:[e.url,e.escape,e.regexp,e.link],color:"…"}` 被后面的 `{tag:e.link,textDecoration:"underline"}` 覆盖 ⇒ 链接只剩下划线、颜色退回该档 `foreground`，而 `url`／`escape`／`regexp` 不受影响；⇒ ☆ `craftlight`／`craftdark` 是**另一种"不上色"**＝9 条里根本没有 `link` ⇒ 与本地 `code-token-palette.test.ts` 的 `UNSTYLED` 名单里那枚 `hljs-link` 两个独立源吻合。
② **`annotation` 在 4 档被二次定义**（`gruvboxdark`／`gruvboxlight`／`materialdark`／`nord`）＋ `propertyName`（`sublime`）＋ `number`／`regexp`（`vscodedark`）⇒ 前一条全是死声明（逐值见 `styles.md` §十九之续）。
③ **两种"看起来像 bug"要分开判**＝`#fb4934d`（7 位）非法、整条声明被丢；`#E5393570`（8 位）是**合法 CSS Color 4 `#RRGGBBAA`**（alpha≈44%）⇒ 与上批 `ffeef0`（缺 `#`）三形态三判据。

### 五、★★★ flavour 表结案＝只有一份 29 字段，但可被模板改写、且只改写一半消费者

⇒ `vendor-craft-export-DIm_3hRN.js`（108,281 字符）@922 的 `Z.defaultFlavour` 是**全库唯一**的 flavour 字面量（另两处命中是构造器注入 `this.flavour=e`）⇒ 逐值见 `longtail.md` §四十.三；★ 三条最值钱的：`indentationCharacters:"   "`＝**三个空格**、`pageCard`≡`pageRegular`≡`strong`≡`"#### "`（子页面与"强"文本块都成 H4 前缀）、`caption`≡`body`≡`""`（**空串＝没有前缀，不是没有该档**）。
⇒ helper 逐字 `w.default.registerHelper("setFlavour",function(t){L=t?{...Ct.defaultFlavour,...t}:L, Et=new Lt.TextRunFormatter(L)})` ⇒ ① 覆盖是**浅合并**；② ★ **只重建 `Et`（行内格式器），`Wi`（`new Vi.TableFormatter(L)`）不重建** ⇒ 模板里改 flavour 之后表格通路仍用旧对象 ⇒ 记为官方缺陷候选（能不能观测取决于 `TableFormatter` 读哪几个字段，本批未展开）。

### 六、★★★ `formatBlock` 第三参真值语义＝只有表格通路用得到（收窄上批一条推论）

⇒ 两个调用点**都在** `TableFormatter.formatTable` 体内：`b=this.formatBlock(P,r,!0)`＝**单元格里的块**；`const v=this.formatBlock(g,r,!1)`＝**被踢出表格、排在表后的块** ⇒ ⇒ ★★ 上批"code 块必含反引号 ⇒ inline 语境软换行变空格 ⇒ 多行摊成一行"只在**表格单元格里的代码块**成立，正文代码块不受影响。
⇒ 模板侧 `inline` 是一等公民（不只是解码器参数）＝两处 `{{#unless inline}}` 逐字抑制 `{{{getHeading this parentSubBlocks}}}` 与 `{{lineAfterBlock parentSubBlocks myIndexInParent}}` ⇒ inline 语境**没有标题前缀、没有块间分隔**；再加解码器那句 `subBlocks: i?void 0:e.subBlocks` ⇒ ★★★ **inline 语境下子块整个不进模板上下文**。
⇒ ★★★ **导出器改写入参**（本批最意外的一条）＝单元格块若有子块：① 刚渲染的 `b` **整个丢弃**，换成 `**[[#<content>]]**`；② `content` 为空时**现场 `getUUID()` 写回 `P.content`** 并补一条覆盖全文的 `textRuns`；③ 该块进 `a` 队列，表后以 `textStyle="title"`（⇒ 取 flavour 的 `title:"# "` ⇒ **变成 H1**）＋ `_runAttributes=[]`（⇒ **行内样式全丢**）重出；④ 全程操作的是**调用方传进来的对象引用** ⇒ 导出一次把内存里的块模型改脏。⇒ ☆ 本地对照＝`src/lib/document-codec/index.ts:61-215` 全文没有一条对入参 `node` 的赋值 ⇒ 判"有意偏差（本地更稳，不照抄）"。

### 七、★★★ 明暗其实是两条轴：`forcedDarkOrLightMode`（两值＋null）与页面纸色 `colorMode`（三值含 dynamic）

⇒ **轴一＝界面明暗**：`$O=new K$("forcedDarkOrLightMode","system",CE(["light","dark"]))`，`CE` 的身份链＝`import{... dL as CE ...}from"./vendor-BZCR0rqu.js"` → 该 chunk 导出表 `enumType as dL` → `enumType=ZodEnum.create` ⇒ **`CE` 是 zod 枚举工厂**；⇒ ★ 默认值 `"system"` 不在枚举里**不是缺陷**＝setter 逐字 `setColorScheme:n=>{var s; $O.store(n==="system"?null:n), ...}` ⇒ **"跟随系统"落库为 `null`** ⇒ 存储域 `{light, dark, null}`、UI 域 `{light, dark, system}`。
⇒ 解析链逐字 `function Ik(t,e,n){let o=n??t; return fn.isEnabled(tU)?o="dark":fn.isEnabled(nU)&&(o="light"), o==="system"?e:o}` ⇒ 优先级＝**特性开关 ＞ URL ＞ 存储值 ＞ system→matchMedia**；URL 那条是 `Dtt`＝`t.has("dark")?"dark":t.has("light")?"light":t.has("system")?"system":null` ⇒ ★★ **官方自带 `?dark`／`?light`／`?system` 三个隐藏开关**（以后采暗档可以不改偏好＝绕开禁区）；状态面另有**不入库的派生字段** `resolvedColorScheme`（逐字 `resolvedColorScheme:Ik(hY,Ltt,Tk)`）。
⇒ **轴二＝页面样式纸色**＝`socket.worker-CMvBLZvP.js` @147,919 的**未混淆真名** `function calcPaperColorMode(e){const m=isColorGradient(e)?e.colorStops[0].color:e; return m.light!==m.dark?"dynamic":isBrightColor(m.light)?"light":"dark"}` ⇒ ★ `dynamic` 的语义是**"这一档自带两个值"**，不是"跟随系统"；validator 逐字 `Bet(t){return t==="light"||t==="dark"||t==="dynamic"?t:"dynamic"}`（**非法兜成 dynamic**）；消费侧逐字 `V=>{y(!V), V&&D!=="dynamic"&&K(D==="dark"), !V&&D!=="dynamic"&&K(x)}` ⇒ **预设不是 dynamic 时面板的明暗开关被钉回预设自身那档**（用户改不动）。
⇒ ⇒ ★★ **方法学结论**＝上批"外观有第三档叫 `dynamic`"这条挂账**改判**＝那是**页面样式域**的第三档，与界面明暗的 `system`、代码块主题的 `light`／`dark` 分支**是三件事**；以后凡见 `light`／`dark` 字样必须先问"哪条轴"。

### 八、☆ 仪器增补（本批）

⇒ ① **别名还原要按"导出表"两跳**＝`CE` 不在本 chunk 定义，链路是 `import{dL as CE}` → 目标 chunk 的 `export{enumType as dL}` → `enumType=ZodEnum.create` ⇒ ☆ 只查一跳会判成"找不到定义"，进而误判"validator 是本地函数"。
⇒ ② **同一 minified 名在不同 chunk 是不同对象**（本批实测）＝`CE` 在 `vendor-code-editor` 里是 `function CE(e,t){e.i=t}`（ELK 的 setter）、在 `vendor-excalidraw` 里是构造器、在 `vendor-react` 里是 `dns-prefetch` ⇒ ★ 按名字 grep 出多个定义时必须先用**引用它的 chunk** 收窄。
⇒ ③ **数正则要覆盖两种语法形态**＝箭头工厂 18 ＋ `function` 声明 2 ⇒ 第一版少数两档（差点下错结论），修法见 `_harvest/b114-style-precedence2.cjs`。
⇒ ④ **本地配色自证的正确切口＝计算值而不是源码**＝`_harvest/b114-palette-proof.cjs` 在真页面里注入 `.tiptap>pre>code` ＋ 31 枚 span（含 `hljs-title class_` 这种**双类名**形态），逐枚 `getComputedStyle().color` ⇒ 一次覆盖"token 是否定义／规则是否被 Tailwind layer 吃掉／`.dark` 是否真的重指"三件事，且**不依赖登录态与数据库**。
⇒ ⑤ ☆ 一条流程自证＝本批**先试**过把自证写成 `e2e/code-block-palette.spec.ts`，实跑失败在 `src/collab/secrets.mjs:11`（缺 `AUTH_SECRET`／`COLLAB_SECRET`）⇒ **删掉了这个未跑过的测试**（不提交没跑过的测试），改走④那条切口 ⇒ 记入台账「十三」阻塞行。

**仍未采到（本节）**：① `fn.isEnabled(tU)`／`fn.isEnabled(nU)` 两个强制明暗开关的**键名字面量**（只读到用法）；② `TableFormatter` 实际读 flavour 的哪几个字段（决定 §五.② 那条"半边更新"能否观测）；③ `isBrightColor` 的阈值与色彩空间；④ `blockLinkStyle:"blockLink"`／`subPageStyle:"flat"`／`artificialNewLines:false` 三个值的**消费点**（只拿到值）；⑤ 别的 chunk 里有没有第二份 flavour（HTML／打印导出路径，本批只扫了 `vendor-craft-export`）；⑥ `Q2n`（`R6e` 无条件 push 的那枚 facet）的身份。

## 五十四、**第 115 批＝功能开关层的三档可控性与"服务端 meta 才是真源"，外加官方有两条表格导出通路而转义严格度不同（handlebars 那条不转义竖线），以及同一份 flavour 在一次渲染里有两种新鲜度**（✓盘上 2026-10-01 05:3x–06:1x 本地＝UTC 09-30 21:3x–22:1x，**零浏览器内容面调用、零官方写入、零网络**；★ gap 在 `gap.md` §三点一〇六五 G1209–G1224，逐字清单在 `longtail.md` §四十一，形状谱系在 `styles.md` §十九之续（第 115 批），模型含义在 `model.md` §一之七十三，本批自证操作在 `interactions.md` V109）

### 一、开关层的真实形状：注册表 ＋ 三档白名单 ＋ 一个服务端注入口

1. **注册表是一个对象，不是一张表**＝`fn` 逐字有 10 个方法（`isEnabled`／`get`／`initFromQueryString`／`initFeature`／`initFromCsvOrArray`／`makeUrlControllable`／`makeUrlDisableable`／`makeLocalStorageControllable`／`setInLocalStorage`／`onFeatureChange`）。⇒ 含义＝**同一个开关可以被三种不同通路控制，而且三种是叠加的**：URL 可控、URL 可关、localStorage 可控是三张**独立的 Set**，一枚开关可以同时不在任何一张里（＝只能由服务端下发），也可以同时在两张里（`fs-service-worker` 既 URL 可关又 localStorage 可控）。
2. **白名单是运行期灌进去的**＝`const ace=new Set`（初值为空）＋ `fn.makeUrlControllable([…])` 在模块体某处调用一次。⇒ ★★ 采集含义＝**"这枚开关能不能用 URL 拨"没有静态名册可查**，必须读那一处调用的参数数组（本批已把 19 枚逐字抄进 `longtail.md` §四十一.二），或者屏上实测（后者被连接器挡住）。
3. **真源是 HTML 里的两个 `<meta>`**＝`fn.initFromCsvOrArray(kC("luki:enable-fs"), kC("luki:disable-fs"))`。⇒ ★★★ 这条是本批最有**采集价值**的发现：**读一次 meta 的 `content` 就能拿到当前账户被灰度到的全部开关，零写入、不碰任何禁区**，而且它是"官方屏上找不到某功能"的**第三种解释**（前两种＝入口确实没有／通路被门控）——灰度未开。以后凡是"某功能在 bundle 里有实现、界面上找不到"，先查这枚开关在不在 `luki:enable-fs` 里，再考虑登记成缺口。
4. **`_killMe` 那条是同一个注册表的第二个注入口**＝分享响应里的 `features.enabled/disabled` 会**整体覆盖**全局开关（`updateFeaturesFromShareResponse_killMe`）。⇒ ☆ 官方自己标了危险；本目录纪律＝照记不改名，但它给本地一条真启示＝**任何"远端响应能改全局功能面"的实现都要显式命名成危险**（本地没有灰度层，不构成差分）。

### 二、"两份实现漂移"家族又多两例，而且这一族的判据已经成熟

1. **主 app vs 协作 worker 的 URL 白名单不同**＝worker 那份逐字把 `FEATURE_DARK_MODE`／`FEATURE_LIGHT_MODE` 预置进 `urlControllableFeatures`，主 app 那份的 19 枚里没有这两枚。⇒ ★★★ 结论＝**同一个 `?dark` 在两条通路里语义相反**（worker 里是真开关、主 app 里对 flag 层无效）。⇒ ☆ 但这不等于"`?dark` 在主 app 完全无效"＝上批那条 app 级 `Dtt()` 直接读 `searchParams.has("dark")`，**和 flag 层互不相干**（两条独立通路碰巧用同一个词）。⇒ **本地复刻判据**：凡是"某参数有没有用"这类结论，必须写成"在 X 通路里有用／在 Y 通路里没用"，不许写全局的是或否。
2. **同一个键名被两处声明、默认值不同**＝`forcedDarkOrLightMode` 一份带 zod 枚举且默认 `"system"`，一份无校验且默认 `null`。⇒ 两侧各自做了归一化所以不致出错，但**"从未写入过"这个状态在两个消费者眼里是不同值**。⇒ ☆ 与上面第 1 条同族：**同名不同源**是本产品代码层的常态，历批已见到（两份主题名册／两套回收站口径／两个按钮体系／两个删除入口）。
3. **同一功能的两个优先级实现顺序不同**＝store 侧 `Ik()` 是"flag > URL > 存储 > matchMedia"，DOM 侧 `finalCalcDarkMode()` 是"systemDark → 存储覆盖 → flag 覆盖 → `calcDarkMode`"。⇒ ★ 判据（历批已立）：**遇到"谁赢"的问题不要外推**，两套实现要各自读到底。

### 三、表格导出：两条通路，一条不转义、一条转义且顺序是要点

1. **handlebars 那条（文档导出）＝`Bi`**：只做"字符串化＋算宽度＋对齐＋补空格＋首尾加分隔符"，单元格内容过一个纯 `String(t)`。⇒ ★★★ **没有任何竖线防护** ⇒ 单元格里的裸竖线把官方自己的表格串行。☆ 换行那一半**在别处被兜住**（上批的 `formatBlock` 第三参 `inline` 把 `\sl` 摊成空格／`<br>`），竖线这一半**没有兜底**。⇒ 判"缺陷候选，未屏上验证"，不写成官方事实。
2. **`MarkdownExportApi` 那条（数据表／集合视图 → markdown）＝`g()`**：三步顺序＝**① 反斜杠翻倍 → ② 竖线转义 → ③ 换行变空格**。⇒ ★★ ②必须在①之后，否则第①步刚造出的 `\\` 会让第②步把下一个竖线判成被转过的、从而**吃掉分隔符**。⇒ ★★★ 这是一条**顺序即语义**的判据，本地正是栽在这个顺序上（见 §五）。
3. **两条通路的共同盲区**＝它们**互不复用**（`vendor-craft-export` 里没有 `g()`，`MarkdownExportApi` 里没有 flavour）。⇒ ☆ 于是"官方的 markdown 表格"其实不是一个规格，而是**按产出路径分裂的规格**；历批那条"官方至少三条 markdown 产出路径"（文档 handlebars／数据表 API／块级 `formatBlock`）在本批拿到了逐字证据。

### 四、flavour 的新鲜度：一次渲染里两种

1. **helper 读模块级活变量 `L`**（`setFlavour`  shallow-merge 的就是它）；**`TableFormatter` 读构造期快照 `this.flavour`**（`new` 只在模块初始化跑一次，`setFlavour` 不重建）。⇒ ★★★ 结论＝**改 `indentationCharacters` 会得到混合结果**：标题前缀与列表样式用新档，表格缩进用旧档。⇒ ☆ 上批 G1201 说的是"半边不更新"，本批把范围**精确到一枚字段**——判据＝配平取到 `TableFormatter` 类体全文（1,673 字符），里面 `this.flavour.X` 只出现 `indentationCharacters` 一枚。⇒ **方法论**＝"某类读哪些字段"这种问题只能靠**取全类体再枚举成员访问**，不能靠 grep 字段名（字段名在别处也出现）。
2. **`flavourInfo` 消费点本批补齐 7 枚**＝⇒ 三条含义：① 那批"看起来像导出选项"的字段其实和格式档混住在同一个对象里；② `blockLinkStyle` 是**唯一能改写块链语义**的字段（三档：`pageLink`→`linkType="rootBlock"`／`headerLink`→把 `block` 改回去／默认不改）⇒ 官方的"块链"落到 markdown 有三种形态；③ `artificialNewLines` 是**第二条"导出器造内容"**（空文本块填一个空格＋补一条覆盖全文的 run 属性），上批那条 UUID 改写不是孤例。

### 五、本批唯一一条直接产出的本地缺陷（G1215）

> ☆ 本节凡写"半角竖线／全角｜"，语义见 `longtail.md` §四十一.〇：产物里的全角｜＝官方源码里的半角竖线。

- 本地 `renderMarkdownTable` 的单元格处理＝竖线转义 → 换行摊平 → `trim`，**缺第一步"反斜杠翻倍"**。⇒ 后果＝单元格文本以反斜杠结尾时（`a\`），本地产出＝`a` ＋ 一个反斜杠 ＋ 半角竖线（★ 这里不能照原样写进产物，否则会被表格解析器吃掉，故用文字描述）⇒ 这一对会被下游解析成"转义过的竖线"⇒ **分隔符被吃掉、表格塌一列**；官方产出＝`a` ＋ 两个反斜杠 ＋ 半角竖线＝先字面反斜杠、再转义竖线。⇒ ☆ 建议＝TDD 先行（两个用例：以反斜杠结尾的单元格、含竖线的单元格），补一次 `.replace(/\\/g,"\\\\")` 放在最前面。⇒ ★ 这是本批**不依赖任何未采到的信息**就能修的一条，且官方证据是逐字函数体，等级＝3/3。

### 仍未采到（本节）

① `ace`／`cce`／`oU` 三张白名单在运行期**是否还有别处追加**（本批只找到一处 `makeUrlControllable` 调用点）；② worker 那份 `Features` 到底有没有调 `initFromQueryString`（定义与预置都找到了，调用点没找到——**没找到不等于没调用**，可能是 `initFromCsvOrArray` 之外的形态）；③ `blockLinkStyle` 的 `pageLink`／`headerLink` 两档**由谁设置**（全仓只有一份 flavour 且默认 `blockLink` ⇒ 必有第二份配置源或运行期改写）；④ `MarkdownExportApi` 那条通路**由哪个用户动作触发**（chunk 只 8,670 字符，消费方未查）；⑤ `vn`（DOM 侧明暗管理器）完整生命周期、与 store 侧 `Xs` 谁驱动谁；⑥ ☆ 屏上三条＝单元格含竖线会不会真的串行／`?dark` 在主 app 是否真的对 flag 层无效／读一次 `luki:enable-fs` meta 的实际内容。

## 五十五、**第 117 批＝官方 markdown 导入器 `Jy` 类的解剖（构造默认值／两条标签正则／属性分层／一处沉默）**（2026-10-01 13:1x–13:2x 本地，★ 零预算盘上＝读 `_harvest/js/index-DiTmKH3z.js` @2,338,9xx–2,348,0xx；零网络、零屏幕、零写入 ⇒ `manifest.jsonl` 155 行不变；☆ 本节全部为**代码级证据**，没有一条来自界面）

### 五十五.一 构造即定死的东西（没有外部传入路径）

⇒ 逐字 `class Jy{constructor(e,n,o){this.tokens=e,this.markdownParseConfiguration=n,this.importM=o,this.index=0,this.blocks=[],this.footNoteIdUUID={},this.shouldParseInnerHTML=!0,this.openHtmlTagRegexp=/^\s*<([A-Za-z]+)(\s|>)/,this.closeHtmlTagRegexp=/<\/([A-Za-z]+)>\s*$/}`
⇒ 三点＝① **`shouldParseInnerHTML` 默认 `!0`＝HTML 内联默认会被再解析**，且本批**没找到把它设为 false 的通路**（☆ 那就是个死开关候选，第 112 批"装配处没有默认值"同族）；② 开标签正则只认 **`[A-Za-z]+`** ⇒ 带命名空间／数字／连字符的标签名（`my-tag`、`h1`…`h1` 可以，但 `fb:comment` 不行）进不了状态机；③ 闭标签正则要求**行尾**（`</tag>` 后只能有空白）⇒ 一行里两个闭标签只认最后一个；④ ☆ `footNoteIdUUID={}` 说明**脚注**是导入器的一等公民（本批未读其用法）。

### 五十五.二 属性分两层＝`properties` 与 `styleAttributes`，且"0／1"用字符串

⇒ 逐字 `updateBlockModelAttributes(e,n,o){o.currentListStyle()!=="none"&&(o.firstParagraph===!0?(e.indentationLevel=o.indentationLevel,e.listStyle=o.currentListStyle(),o.currentListStyle()==="numbered"&&(e.userDefinedListNumber=o.listOrder),o.currentListStyle()==="todo"&&(n.isTodoChecked=o.todoChecked===!0?"1":"0"),o.firstParagraph=!1):e.indentationLevel=o.indentationLevel+1),this.updateDecorationStyles(e,o)}`
⇒ ★ 四条＝① **列表项内"第一段"归当前层级、之后的段层级 +1**（＝`firstParagraph` 一次性标志，跨段靠它换算）；② **勾选态落在 `properties`、样式类落 `styleAttributes`**＝同一个块的属性按"是不是渲染样式"分两个对象；③ ★★★ **`isTodoChecked` 的值是字符串 `"1"`／`"0"`**，不是布尔 ⇒ ☆ 官方协议里的布尔字段有时用字符串数字（与第 110 批 `pluginData` 那类"键名分层"一样是协议噪声，复刻时若按布尔解析会静默错）；④ `userDefinedListNumber`＝有序列表允许用户指定起始号（`o.listOrder`）。

### 五十五.三 分派链的形状（同一个 `else if` 串里的五种 token）

⇒ 顺序逐字（节选）＝`blockquote_`→层级回退；`blockblock_`→`isBlock=false`；`fence｜｜code_block`→代码块（语言走 `tIt`、层级走 `MJ`）；`html_block`→按 `shouldParseInnerHTML` 分两路（走 `Jy` 再解析 ⇒ `FJ(...)` ⇒ `reportHtmlContent`）；`hr`→`type:"line"`＋`lineStyle` 表；`math_block`→`type:"code"`＋`properties.language:"math_formula"`；☆ **链尾 `else` 是打日志**＝`pe.logger().warn("MarkdownImport","Unrecognized markdown-it token type: "+i.type)` ⇒ ★ 这是"导入器承认自己会漏 token"的**权威清单来源**：漏哪些只能看运行期日志（与第 100 批"logger 字符串是恢复真名的第三词典"同法，这次反过来用＝**用日志键名反推能力边界**）。

### 五十五.四 两处"官方会吞内容"的位置（登记为取舍点）

⇒ ① fence 与 html_block **共用**的 `startsWith("<!--")===!1` 闸门＝以注释开头的围栏内容**整块不产出块**（不降级、不报错）；② 代码块正文 `content:i.content.slice(-1)[0]===" "?i.content.slice(0,-1):i.content`＝**末尾恰好一个空格时削一格**（☆ 判据只看最后一个字符，所以两空格结尾会削成一格）⇒ 本地 `src/lib/import/markdown.ts:136-151` 两条都没有；③ 另有一条"导出侧静默丢图"见 `longtail.md` §四十二.五。

**仍未采到（本节）**：① `Jy` 的完整 token 分派表（本批只读到上述五支＋default，`table`、`list` 内部支路未逐字）；② `footNoteIdUUID` 的状态机；③ `FJ(...)`（html_block 的收口函数）本体；④ `shouldParseInnerHTML=false` 到底有没有调用方；⑤ `updateDecorationStyles` 的引用块层级判据只读了前半段（`blockQuoteLevel>1` 才 `isBlock`），后半段未读。

## 五十六、**第 119 批＝列表识别的三条规则分工（`Dvt`／`Evt`／`Avt` 各判一种标记，且 `Evt` 的候选集只有两枚）＋ `Jy` 行内循环的四累加器解剖 ＋ `FJ` 的 aside 状态机 ＋ 导入器四旗标默认值表**（☆ 盘上逐字，来源＝`index-DiTmKH3z.js` @2,319,2xx–2,350,0xx；gap 在 `gap.md` §三点一〇六九，映射表在 `model.md` §一之七十五，逐字清单在 `longtail.md` §四十三；★ 零屏上、零写入 ⇒ `manifest.jsonl` 155 行不变）

### 一、列表到底靠什么被认出来：三条规则，一条一形态

⇒ 分派点（`Rvt`，@2,320,3xx 起）逐字顺序＝**先 `Dvt`（有序）→ 再 `Evt`（被赋名 `"todo"`）→ 再 `Avt`（bullet）→ 都不中就 `return false`**；⇒ ★★★ 三条规则各自的形态判据：

| 规则 | 判据（本轮读到） | 产出的 open token | markup |
| --- | --- | --- | --- |
| `Dvt` | 行首必须是 1–10 位数字（≥48 且 ≤57 逐字符），随后必须是`)`或`.`，且其后不能紧跟非空格 | `ordered_list_open`（tag `ol`） | 匹配到的末字符 |
| `Evt` | ★ **候选集只有两枚**＝`"-- "` 与 `"-+ "`；比较方式＝逐字符 `charCodeAt` **严格相等**（⇒ 不做大小写／全半角折叠，也不做正则） | `todo_list_open`（tag `ul`） | 匹配到的末字符（`-` 或 `+`）；⇒ ☆ 函数还额外返回一个布尔＝"命中的那枚候选里含 `+`" |
| `Avt` | 项目符号形态（本轮未展开其候选集） | `bullet_list_open`（tag `ul`） | 匹配到的末字符 |

⇒ ★★ **一条"同一标记两种含义"的重要旁证**＝`Evt` 认的是**两连字符**（`-- `）而不是 GitHub 的方括号语法；方括号那一套（`[ ] `／`[x] `）**只在行内层**被处理（`model.md` §一之七十五 第 1 支），且**只认小写 x**。⇒ ☆ 结论＝官方 markdown 的"任务/折叠列表"有**两套并行语法**，块级一套、行内一套，两者不共用判据也不互相校验。

### 二、`Jy` 的行内循环＝四个累加器配一张装饰表

⇒ 变量分工（本轮从循环体反推，逐字名）＝`d`＝文本累加器；`u`＝装饰数组（每项 `{range:[起,长], …}`）；`f`＝"某标签开始时的文本长度"栈（键＝去掉 `_open` 后的标签名）；`p`＝对应的 open token（用来事后取 `attrGet`）；⇒ ★ 结构＝**开标签只记位置、闭标签才产装饰**（`_open` 分支写 `f`/`p`，`_close` 分支算 `range` 再走那张六路 `switch`）⇒ ⇒ 未闭合标签＝**静默没有装饰**（既不开区间也不报错，`f` 里的残留随实例丢弃）。

### 三、`FJ`＝aside 的开／合驱动的三件事

⇒ `FJ`（@2,348,511）签名解构＝`{token, listInfo, blockModels, iconBlockIds, prevToken, importCtx}`；⇒ 只有当该 token 的 meta 里"原始标签名"＝`aside` 才动，且分两向：**开标签** ⇒ ① `listInfo.isBlock`＝真 ② 遍历传入块，把每块 `styleAttributes.decorations.isBlock` 置真（没有装饰对象则新建一个含 `isFocus:false` 的）③ ★ 若首块是 text 且其内容 trim 后"只含 emoji" ⇒ 把它的 id 加入 `iconBlockIds`（⇒ ☆ 这就是"页面图标从 aside 首块提取"的机制，且**由 `jr.isEmojiOnly` 单点判定**）④ ★ 若**前一个 token 也是 html_block 且是合标签** ⇒ 在块数组**最前面插一个空 text 块**（☆ 目的未读到，推测是防"两个 aside 贴在一起被合并"，标为未验）；**合标签** ⇒ ☆ **只把 `isBlock` 置假，第 ②③④ 步都不回滚**。

### 四、`oIt`＝图标合并的第二段，且默认不跑

⇒ `parseTokens` 返回前逐字＝"仅当配置 `handleIconsInAsideTags` 为真，才把块数组交给 `oIt(块, iconBlockIds)`"；⇒ ☆ 同一条旗标还控制导出侧一条规则是否注册（`asideImgSkip`，第 117 批记过）⇒ ★ **一枚旗标同时改两侧行为（导入合并＋导出跳过）＝它不是"显示开关"而是"这条特性开不开"**；⇒ 另三枚旗标（远端链接转文件／附加属性解析／markdown 风格子页）在**主 chunk 内只有默认值声明处、没有读取处**（机器计数各 1）⇒ ☆ 判为"死旗标或消费者在别处"，不据此断言能力不存在（承 §五十五 那条"别名与跨 chunk"纪律）。

### 五、埋点名册比上批记的多两枚

⇒ ✎ **改判第 117 批**＝HTML 内容上报不是"一条计数"而是**三枚**，同一函数体内顺序调三次＝`html_<标签>_count`、`html_<标签>_lines`（值＝该块按换行切分的段数）、`html_<标签>_createdBlocks`（值＝这次产出的块数）；⇒ ☆ 且**三枚都只在"是开标签"时才报**⇒ ⇒ 结论＝官方用埋点量的是"导入 HTML 时吃进去多少行、吐出多少块"，这是**一条产品级关注点**（HTML 导入的膨胀率），不是统计使用量。

**仍未采到（本节）**：① `Avt` 的候选标记全集（只确认可被 `Evt` 抢先）；② `oIt` 函数体的第二段（合并策略：图标块被并入哪里、原块是否删除）；③ `handleWrapper` 的两个调用点各自传的标签名 ⇒ aside 之外还有没有 wrapper；④ `f`/`p` 两个栈在嵌套同名标签（`<em><em>`）下的行为；⑤ "prevToken 也是合标签 ⇒ 插空块"这条的真实动机。

## 五十七、**第 124 批＝数据桥复通，外加一条可复用的仪器结案：同一族三枚"看起来通用"的旗标在官方 MCP 上有三种可达性（`--filter` 被吞／`--pattern` 生效／`--location` 生效且排他）⇒ 旗标能力只能逐动词实调，不能按名字类推**（✓数据面只读 2026-10-01 19:5x–20:4x 本地；★ 零屏幕内容面调用、零官方写入；gap 在 `gap.md` §三点一〇七五 G1247–G1250，逐字在 `longtail.md` §四十四，模型含义在 `model.md` §一之七十六，判据在 `interactions.md` V118）

### 一、通路状态（本轮逐条实测，不承抄上一批）

⇒ `connection info` 正常返回（space 段与历批同一枚 id、时区 `Asia/Shanghai`）⇒ ☆ **第 115–123 批连续九批的「`craft` MCP 零调用」口径自本批作废**；此后所有只读调用（含第二轮、第三轮补探）**无一次挂起**；
⇒ ★ 屏幕侧仍不可用＝`browsers.list()` 回一枚 `type:"extension"` 的 Edge，但 **`tabs.list()` 回空数组** ⇒ **没有可驱动的 craft.do 登录标签页**；☆ 这与历批"tab 级调用超时＝那一层全灭"是**两种不同的坏法**，恢复动作也不同（前者＝请用户开一页并交给连接器，后者＝请用户还原窗口）；
⇒ ☆ 只读面的命令全集**由报错串自己吐出来**＝`blocks update --help` ⇒ `Unknown command: blocks update` ＋ 五行清单（`blocks get`／`blocks learn`／`blocks explore-washi`／`blocks search-unsplash`／`blocks explore-themes`）⇒ 两件事：① 判"某动词在这一面存不存在"是**零成本**的（打一条不存在的命令逼它自报名单）；② `blocks update`（G1247 那条用法行里的写侧命令）**不在只读面上** ⇒ 历批"数据面无写通路"那条结论拿到**第二方证据**。

### 二、★ 三枚同名族旗标的可达性差分（本节主产物）

| 旗标 | 出现在哪些动词 | 本轮实测读数 | 结论 |
| --- | --- | --- | --- |
| `--filter <regex>` | `documents list`（G1185 在册）＋ `blocks explore-themes`（本批新增） | `--filter tokyo` 与 `--filter zzz-never-matches` 两次都回**整张表**（后者本不可能命中任何一档 ⇒ 排除"恰好都命中"） | **空操作**，覆盖面从 1 条动词扩到 2 条；☆ 契约头行明明写着 `Common flags: --offset, --cursor, --filter` ⇒ 记为**契约缺陷候选**，不写"官方有此行为" |
| `--pattern <name>` | `blocks explore-washi` | 只回**指定那一档**的三行 detail | **生效**（子选择器） |
| `--location <档>` | `documents list` 与 `search` | `documents list` 不带时**含**回收站（G1155 在册）；`search` 不带时**不含**、带 `--location trash` 时**只**搜回收站 | **生效、但是排他开关**，且两个动词的默认档口径**相反** ⇒ ☆ "默认作用域"不可跨动词类推 |

⇒ ★☆ 三条合起来的仪器含义＝**同一命名空间、同一套通用旗标，实现各管各的**（裁剪旗标被吞／子选择旗标生效／作用域旗标生效且排他）⇒ 判"某能力在数据面可达吗"只有"逐动词实调"一条路；`--help` 与契约头行只能给出**候选清单**，不能给出能力判定。

### 三、读法：`search` 的"零命中"到底证明了什么

⇒ 机制＝`search` 的默认作用域**不含回收站**，切到 `--location trash` 后**只**含回收站（G1248 收窄＋G1249 结案）；
⇒ ★ 反证链（同一批内两问一答）＝同一个词 `welcome`：默认档 3 条、trash 档 0 条；三条回收站沙盒的完整标题反向＝默认档 0 条、trash 档逐条命中 ⇒ 两档**互斥**，不是"默认档之外再并一档"；
⇒ ☆ 顺带否证一条我自己提的候选＝前缀 `QODER-HARVEST`（不含连字符右半截）在 trash 档一次命中三条**含连字符**的标题 ⇒ 分词与匹配都正常，"连字符被分词打散"不成立；
⇒ ★ 判据（已进 V118）＝"零命中"只能判成"**这一档作用域内**没命中"；要判存在性只准 `documents list --location <档>` 逐 id 对照。

### 四、仪器层三条自纠（本批全部当场抓到、全部写进产物）

⇒ ① 把手抄的名册喂进差集脚本 ⇒ 虚报"少一档"（`tokyonightstorm`）；② 把一次"零命中"读成覆盖范围 ⇒ G1248 在同批被收窄、另立 G1249；③ 首读 `blocks learn` 把 12 项 update 名单读成 **8 项** ⇒ 差点登记一条"官方改了契约"的假差分，复跑三遍（其中一遍是**同一次调用内连请求两遍**）才否证；
⇒ ☆ 从这三条抽出两条新仪器律＝**契约／名册类读数在同一个调用里请求两遍**（`X; X`，两遍逐字相同才算一次可信读数——它不依赖我对上下文的记忆）＋ **凡要做差集的读数当场落盘**（本批三份＝`_harvest/b124-washi.txt`／`b124-search-scope.txt`／`b124-learn.txt`）；
⇒ ★☆ 一条成本账：历批把 MCP 回包只留在上下文里 ⇒ 本轮对"官方是否改过契约"**无法排除也无法证实**（没有原件可比）⇒ "落盘"这条不是洁癖，是唯一能让后批复算的动作。

### 五、☆ 本批刻意**没做**的两件事

⇒ ① **页面主题名册的逐字差集**＝整表回读到了（约 150 行、唯一分组 `Modern:`、头行写着主题来自远端对象存储），但没有与 G709 在册的约 130 条对照 ⇒ 原因＝那需要把整表抄进脚本，正是 §四第①条要防的动作；⇒ 已挂台账「二十三」第②行，等一条"名册原文落盘"的通路；
⇒ ② **`whiteboards elements get`**＝这条只读动词历批零登记，但它要一枚真实 whiteboard id，而取得 id 属写侧 ⇒ 本批零写入纪律下不开。

**仍未采到（本节）**：① `blocks learn` 的另两份指南（`concepts`／`limitations`）正文本轮没读；② `explore-icons` 是否也有 detail 层（`--pattern` 之外的子选择还有没有）；③ `--location templates` 与 `--location daily_notes` 在 `search` 上是否可用（本轮只测了默认档与 `trash`）；④ 只读面自报的 5 条动词与契约头行里 `whiteboards …`／`collections …` 是否同面（拿一条不存在的动词名去逼它报名单即可判，本轮没做）；⑤ 屏幕面全部（缺登录标签页）。


## 五十八、**第 125 批＝旗标可达性表的第二版：把四枚旗标摊到五个动词上，结论是"旗标不是属性、是每条动词各自的一段实现"，并且失败有两种长相（显式报错／静默吞掉）**（✓数据面只读 2026-10-01 21:0x–21:3x 本地；★ 零屏幕、零写入、零新建实体 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七六 G1251–G1255，逐字在 `longtail.md` §四十五，判据在 `interactions.md` V119，清除协议的修正见 `interactions.md` V93 原地 ✎）

### 一、四枚旗标 × 五个动词（本批把第 124 批那张三行表扩成矩阵）

| 旗标 | `folders list` | `documents list` | `search` | `blocks explore-themes` | `blocks explore-washi` |
| --- | --- | --- | --- | --- | --- |
| `--filter <regex>` | ★ **生效**（不可能命中的串 ⇒ `No folders matching …`；`^日` 只中一条；`how` 中 `How to use Craft` ⇒ 大小写不敏感；两词并立的交替式两条全中 ⇒ 真正则而非子串，逐字见 `longtail.md` §四十五） | ☆ **静默吞**（G1185 在册＋本批范围内正控制：`--filter Welcome` 该剩 1 条却回 3 条） | 未测（本面 `search` 无此旗标声明） | ☆ **静默吞**（G1185 扩展） | 未测 |
| `--offset <n>` | ★ **生效且有校验**（`--offset 99` ⇒ `Offset 99 exceeds total of 2 folders.`） | ☆ **静默吞**（`--offset 2`／`--offset 99` 都回全量 3 条） | 未测 | ☆ **静默吞**（`--offset 15` 仍回 19 档全量） | 未测 |
| `--pattern <name>` | 不适用 | 不适用 | 不适用 | 不适用 | ★ **生效**（只回指定那档的 detail，G1247） |
| `--location <档>` | 不适用 | ★ **生效**（`unsorted`／`trash` 两档各回各的，G1155） | ★ **生效且排他**（默认档不含回收站；G1249） | 不适用 | 不适用 |

⇒ ★★★ 机制结论＝**"通用旗标"在这套 CLI 里不存在**：同一枚 `--filter` 在 `folders list` 上是一段真正则过滤器、在 `documents list` 上根本没人读；`--offset` 同形。⇒ 与历批"参数名按动词语境各写各的（官方无共享常量表四例）"是同一根因的**另一面**＝不止名字不共享，**实现也不共享**。
⇒ ★ 两种失败长相要分开对待：**显式报错**（`folders list --offset 99`）是友好失败，调用方能立刻知道旗标被理解了；**静默吞掉**是危险失败，因为回包长得与"旗标生效且恰好全命中"完全一样 ⇒ ☆ 所以测旗标必须做**范围内正控制**（挑一个一定命中的值、和一个一定不命中的值各测一次），单向测"不可能命中"仍不可判。

### 二、"逼它自报家门"这招的收益与边界（G1251／G1252 的机制侧）

⇒ 收益＝打一条不存在的**实体名**（`bogus`）会换回整棵命令树：**10 个实体段／18 条叶子动词**，三层嵌套只有一处（`whiteboards` → `whiteboards elements` → `elements get`）⇒ 比工具自带的那段压缩描述完整得多，且零成本；
⇒ ★☆ 边界＝**名单会漏项**：`images view` 不在自报名单里，但它真实可用（打 `images view --url x` 得到的是参数校验错 `Invalid asset URL format. Expected res.craft.do/user/... or r.craft.do/...`，不是 `Unknown command`）；
⇒ ⇒ 判据＝**只有 `Unknown command` 能证明"不存在"；参数校验错反而证明"存在"**；自报清单默认按"可能不完整"处理（与历批"虚拟滚动屏上零命中 ≠ 不存在"同族）。
⇒ ☆ 同批复现＝分号批处理**第一条失败即停**（`Stopped after failure; earlier commands were already applied.`，第三次复现）⇒ 对"会失败的命令"，"同一调用内跑两遍"这条纪律失效，只能改两次独立调用。

### 三、`blocks learn` 两份指南给协议层的三处补齐（G1254／G1255）

⇒ ① `--position` 的**词表随锚类型切换且默认档不对称**＝`--id`／`--date` ⇒ `start`／`end`（默认 `end`）；`--siblingId` ⇒ `before`／`after`（默认 `after`）⇒ 承 G672"（锚类型 × 方向）二维"，本轮补上两处默认值；
⇒ ② `blocks update` 的 id 有**两条来源**＝`--markdown` 必须配 `--id`；`--json` 传单对象时可省 JSON 内的 `id`、前提是外层给 `--id`（数组则每条都要 `id`）；
⇒ ③ `limitations` 把"写侧不可达"成文为四类（集合行／某些表格布局／回收站里的块／`blocks delete` 的跳过并警告）⇒ 其中回收站那条与 G1176 的**实测报错**双源咬合（`Cannot modify document in trash. Restore it first.`）⇒ 该约束从"单点实测"升为"契约＋实测"两源。
⇒ ☆ 三处全部停在「官方声明了 X」档（本批零写入，没做写侧验证）。

### 四、对采集流程本身的两条改写

⇒ **清除协议改一条**＝V93 五判据的第④条（`search <采集串>` 零命中）在本批被 G1249 判为**不可能失败** ⇒ 替换为 `search <采集串> --location trash`（清除前有命中、清除后应为 0），本批已凑齐正／负例 ⇒ 详见 `interactions.md` V93 原地 ✎ 与 G1255；
⇒ **一条采集路判死**＝"用 `--offset` 二分数名册、从而不必把整表抄进上下文"对 `documents list`／`blocks explore-themes` 不成立（旗标被吞）⇒ 台账「二十三」②"页面主题名册逐字差集"仍只能等名册原文落盘的通路。

**仍未采到（本节）**：① `--filter` 在 `tasks list`／`collections list` 上是否生效（矩阵里四格未测）；② `explore-icons` 的 `--offset` 越界行为（在册挂着，本批仍未测）；③ `--location templates`／`daily_notes` 在 `search` 上是否可用；④ 自报名单的其余漏项（`images view` 是第一个被抓到的，不会假设是最后一个）；⑤ `limitations` 里"某些表格布局只读"具体是哪些（要造出该报错）；⑥ 屏幕面全部。

## 五十九、**第 126 批＝旗标可达性表的第三版（三枚公共旗标摊到七条动词上＝21 格、本轮填 14 格，失败长相从两种增为三种）＋命令树的正确逼法＝逐段打 `<entity> bogus` 再取并集（顶层自报的那份按缩进数会错两格），并且名单本身会在同会话内漂移**（✓数据面只读 2026-10-01 21:4x–22:1x 本地；★ 零屏幕、零写入、零新建实体 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七七 G1256–G1261，逐字在 `longtail.md` §四十六，判据在 `interactions.md` V120，分隔线三面档名对照在 `model.md` §一之七十七）

### 一、★★★ 旗标矩阵第三版（行＝动词，列＝旗标；☆ 每格都注明"怎么判出来的"）

| 动词 | `--filter` | `--offset` | `--cursor` |
| --- | --- | --- | --- |
| `folders list` | **生效**（负控制回 `No folders matching "zzz-never-matches".`；锚点与交替各自验过＝真正则、大小写不敏感） | **生效**（越界回显式错 `…exceeds total of 2 folders.`） | ★ **被吞、且不校验**＝`--cursor bogus` 回正常两行全量、零报错 |
| `folders explore-icons` | ★★★ **值被当位置参数消费**＝`rocket --filter calendar` ⇒ 检索词变 `calendar`、`rocket` 被丢（☆ 既非生效也非吞掉，是第三种长相） | **生效**（`--offset 30` ⇒ `(31-42 of 42)`；越界回显式错 `…exceeds total of 42 results.`；☆ 页宽恰好 30） | 未测 |
| `documents list` | **静默吞**（四次并排回包逐字相同＝第 125 批） | **静默吞**（同上） | 未测 |
| `tasks list` | **静默吞**（`--scope all` 下九行全量逐字相同，同调用内两遍也相同） | **静默吞**（`--offset 99` 照样九行） | 未测 |
| `collections list` | **静默吞**（三条逐字相同） | **静默吞**（`--offset 99` 照样三条） | 未测 |
| `search` | **静默吞**（三条相同＝`Search results: 3 match(es)`），★★ 而该段自己的描述逐字写着 `with optional filter` | **静默吞**（`--offset 99` 照样三条） | 未测 |
| `blocks explore-themes` | **静默吞**（第 124／125 批两型） | 未测 | 未测 |

⇒ ☆ **`--cursor` 那条读数还带一条旁证**＝历批所有分页提示**只用 `--offset`、从不吐出一个 cursor 值** ⇒ 所以口径写满到"游标在本只读面上**没有生产者**"，而**不写成"整面未实现"**（缺一条合法游标做正控制）；

⇒ ☆ **矩阵合计＝7 条动词 × 3 枚旗标＝21 格，本轮填 14 格**（`--filter` 一列 7 格**全部测完**、`--offset` 一列测 6 格、`--cursor` 一列只测 1 格 ⇒ 已测＝7＋6＋1＝**14**、未测＝**7**）；⇒ ★ 分布＝`--filter`＝1 生效＋1 值被挪用＋5 吞；`--offset`＝2 生效＋4 吞；`--cursor`＝1 吞（不校验）＋6 未测；☆ 另有 **6 条动词整条未进矩阵**＝`blocks search-unsplash`／`blocks explore-washi`／`collections schema`／`collections items-get`／`collections views-list`／`documents resolve-link`（挂第 127 批队列）；⇒ ★ **一句话口径**＝`Common flags: --offset, --cursor, --filter` 这一行**不可当契约使用**，它描述的是一个只有 `folders` 一段实现的机制；☆ 而契约侧也同向＝九段自报里**只有 `folders list` 的动词描述把两枚旗标写进文本**（逐字 `List folder tree (--filter <JS regex> --offset <n>)`）⇒ **行为侧与契约侧第一次在同一条结论上咬合**（这是第 125 批那条"逐动词实现"的双源化）。

### 二、★★★★ 命令树的正确逼法＝逐段逼，顶层那份不能直接数

⇒ 方法＝对每个实体段打 `<entity> bogus`（九段各一次），回 `Unknown command` ＋ **该段**的 `Available commands`；☆ `search` 段逼不了＝它的参数是位置式检索词，`search bogus` 会真去搜。
⇒ 本轮逐段读数＝`documents` 2／`blocks` 5／`folders` 2／`tasks` 1／`collections` 4／`whiteboards` 1 叶（另有一条**分组行**）／`images` 1／`reminders` 1／`connection` 1 ⇒ **真实可调用叶＝19**。
⇒ ★★ **顶层自报那份按缩进数会错两格**＝① 顶层里那条 `whiteboards elements` 是**分组行**不是叶（真叶 `whiteboards elements get` 只在段级名单出现；☆ 而分组行本身也可调，回的是它的子名单＝"中间层有独立可达性"）；② `search` 这个动词在顶层**只有段行、没有叶行** ⇒ 按叶行数它会整个漏掉。
⇒ ★★★ **名单会在同会话内漂移**＝`blocks bogus` 第一次回 **4 条**（缺 `blocks explore-themes`），中间只夹了一次真实调用 `blocks explore-themes --type code`，此后两次同参读数都是 **5 条** ⇒ 两种候选（**懒注册**＝动词被调用过才进名单 ／ **不稳定截断**）**在同一个桥会话内分不开** ⇒ 结案需要一次桥重连后第一件事就打 `blocks bogus`（挂第 127 批队列）。
⇒ ★★★★ **本批推翻上批一条在册结论**＝第 125 批 G1252 写"顶层名单漏 `images view`、所以它是下界"；本批段级逼出 `images` 段就只有 `images view` 一条叶，而**盘上第 125 批的逐字 dump 里顶层 18 条叶行名单确实含它**（脚本对 `_harvest/b125-flags-and-tree.txt` 现算＝sections 10／leaf-lines 18）⇒ ☆ 那条"漏项"＝**我上批读错了**；判据本身（只有 `Unknown command` 能证明不存在）依然成立，但支撑它的例子换成上面①②两格。⇒ ☆ 方法论收获＝"大表读数当场落盘"这条纪律（第 124 批立）**第一次救回的不是虚报、而是一次误判**。

### 三、☆ 两条桥侧形态（读面，非产品）

⇒ **`<entity> --help`（不带动作名）不是可达通路**＝`documents --help; blocks --help` 一次调用回 `MCP error -32603: MCP tool invocation did not complete`；⇒ ☆ 但它**不拖挂后续**＝同会话紧接着 `connection info` 正常 ⇒ 与第 111 批"一次挂起的**写**会拖挂后续读"分清＝**读侧的 `-32603` 是这一次调用没成立，不等于桥死**；判活补齐＝撞到读侧 `-32603` 先跑一次 `connection info` 再决定停不停手。
⇒ **分号批处理的失败包装串逐字**＝`Command 2 failed: <命令原文>` ＋ 该命令自己的报错 ＋ `Stopped after failure; earlier commands were already applied.` ⇒ ① "失败即停"第四次复证（第三条确实没跑）；② ★★ 最后一句是官方**打印出来的**"已应用"＝批处理不是事务、中途失败**不回滚**（历批只从写侧实验推断，本批在只读面拿到原文）；③ ☆ 包装串自带**失败序号与命令原文** ⇒ 归因零成本，比"回包变短了"这种猜法可靠。

### 四、☆ 复证四条（不新登记）

⇒ `blocks learn` 插入 9 项／更新 12 项**第四次零漂移**（与 G681 逐字同）；`blocks explore-themes --type code` 再回 **19 档**（含 `tokyonightstorm`，无 `craftlight`／`craftdark`＝承第 111 批"两面名册不等长"）；`search welcome` 默认档仍 3 条；`documents get` 在本面**不存在**（`Unknown command`＝与第 124 批 `blocks update` 同形）。

## 六十、**第 127 批＝三段探针把"旗标可达性"这件事从"列一张表"升级成"列五种形态＋三层判据"，并把白板那一格用契约而非穷举判成结构性不可测**（✓数据面只读 2026-10-01 22:2x–23:3x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七八 G1262–G1267，逐字在 `longtail.md` §四十七，判据在 `interactions.md` V121，模型含义在 `model.md` §一之七十八）

### 一、★★ 三段探针各自的"问的问题"（同一座桥、三个判据）

| 段 | 问的问题 | 手段 | 结果 |
| --- | --- | --- | --- |
| ①名单复审（队列①） | 上批那次 4→5 是懒注册还是读数不稳？ | 开场先三连打 `blocks bogus`（不夹别的命令），再把**从未被调用过的** `search-unsplash` 真调一次，前后各比一次名单 | 懒注册被**两条实验否掉**（从未调用者 7/7 在场；真调前后逐字不变）；4 连读全 5 行 ⇒ 那次 4 行改判为**一次尾行截断** |
| ②矩阵下半＋未测五项（队列②＋⑤项） | 旗标到底有几种形态？ | 每格都带"不带旗标的基线"并排；`reminders` 空档先问选项层；`images view` 先用无效 URL 探校验次序 | 五种形态齐了（见 §二）＋三层判据（见 §三） |
| ③白板扫描（队列⑨） | 空间里有没有白板块？ | 14 篇 `blocks get --format json --depth 1` ＋ Handbook 三子页下钻 | 零命中；**但决定性理由来自契约**＝`whiteboard` 不在可插入 9 类 ⇒ 写侧造不出 ⇒ 结构性不可测 |

### 二、★★★ 旗标形态五档（本批长出第五档）

1. **生效**（`folders list` 的 `--filter`／`--offset`、`search-unsplash` 的 `--page` 之"页码生效"半格）；
2. **静默吞**（11 条动词的 `--filter`、11 格 `--offset`：回包与不带旗标逐字相同）；
3. **值被挪用**（`folders explore-icons`：旗标值顶掉位置参数）；
4. **越界继续**（`search-unsplash --page 99`：不报错、页码照递增、结果照出）；
5. ★★★ **选项层显式拒绝**（本批新增，`reminders list` 上的 `--filter`／`--offset`）⇒ 拒绝串**逐条列出该动词的选项白名单**＝`Supported options: --status, --limit, --cursor.`；
⇒ ☆ 由此浮出两枚新旗标＝`--limit`（`--limit 1` 被接受）与 `--cursor` 的**真实现**（`--cursor bogus` ⇒ `Pagination cursor invalid: Reminder no longer exists. Restart without cursor.`）；
⇒ ★ 且**校验本身逐动词**＝`images view` 对同一批旗标不报选项错（先报 URL 校验）、`documents list --metadata foo=bar` 也不报 ⇒ **"没拒绝"不等于"支持"**。

### 三、★★★ 三层判据（比第 126 批多一层）

1. **有没有报错**（错误本身分四种形态：纯文本行／JSON 错误包 `{"status":"Action failed",…}`／选项白名单行／错误码行 `error(NOT_FOUND_ERROR): …`）；
2. **回包逐字是否相同**（＝吞的判据）；
3. ★★★ **回包形态是否改变**（＝本批新增层）：`images view` 基线两次都回**图像内容块**（模型无视觉 ⇒ 被 harness 吞成占位，**可复现**），加任一旗标后变**文本** `Image returned.` ⇒ 形态变了 ⇒ 旗标改了响应分支；⇒ ☆ 这一层在 `screenshot().length` 一族旧判据之外，是**文本面**的对应物。

### 四、★★ 选项层先于数据层 ⇒ 空档也能判"旗标存在性"

⇒ `reminders list --status all` 在本账户**零条**，但 `--filter`／`--offset` 仍被选项层拒掉 ⇒ **第 125 批"空档＝不可判"被部分推翻**＝对**旗标存在性**（选项层）空档照样可判、对**生效语义**（数据层）仍不可判；
⇒ 分页／限额参数族至此**四套并存**＝`--offset`／`--page`／`--limit`／`--cursor`，而契约头 `Common flags: --offset, --cursor, --filter` **漏 `--limit` 与 `--page`** ⇒ 这一行**三重不可用**（漏实现／漏旗标名／逐动词失真，分别出自第 125／127／126 批）。

### 五、★★★ 白板格：用契约判、不靠穷举

⇒ 推理链三步＝① `blocks learn` 的可插入 9 类**不含** `whiteboard`（可更新 12 类含）⇒ **MCP 写侧造不出白板块**；② 已扫覆盖＝11 篇一级＋3 子页下钻零命中（未下钻约 12 子页、三篇自建沙盒跳过）⇒ 现存也没有；③ ⇒ 该格只剩两条路＝**屏幕面造一枚**（需当轮授权）或等空间里出现现存白板 ⇒ 判"**结构性不可测**"并转队列；
⇒ ☆ **方法论**＝"找一枚实体"的探针要先问"写侧能不能造出它"：能 ⇒ 穷举有上限；不能 ⇒ 直接换通路，扫描只用来**写下界**；
⇒ ☆ 覆盖的下界必须写清的原因＝`--depth 1` 也对子树做摘要（子页 `contentPreviewMd` ＋ `…and N more blocks`、集合 `itemsPreviewMd`）⇒ **扫一层 ≠ 扫全树**。

### 六、☆ 三条"官方自己指路"（失败路径自带导航，本批第三次）

⇒ ① `Hint: run documents list --metadata to see accessible documents and their rootBlockIds.`（resolve-link 失败时）；
② `Next page: blocks search-unsplash "mountains" --page 2`（结果尾部）；③ `Supported options: --status, --limit, --cursor.`（选项拒绝时）；
⇒ 判据＝**读报错串别只读前半**，后半常带着"下一通路"。

## 六十一、**第 128 批＝旗标普查批的方法与通路（一次 `--help` 打出六枚从未测过的旗标 ⇒ 历批"矩阵填格"打法的前提被推翻：旗标全集不能从 usage 行取）**（✓数据面只读 2026-10-02 00:5x–01:2x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇七九 G1268–G1275，逐字在 `longtail.md` §四十八，判据在 `interactions.md` V122，模型含义在 `model.md` §一之七十九）

### 一、本轮三段探针

| 段 | 手法 | 拿到什么 | 为什么这样排 |
| --- | --- | --- | --- |
| ① **契约层先打全**＝对 `documents list`／`reminders list`／`folders list`／`images view` 各取一次 `--help` | 纯文本、零命中集风险；把**声明的旗标全集**先抄下来再做矩阵 | ★★★ 六枚日期旗标（历批矩阵整族漏了）＋`--no-id`＋`1–200` 值域＋cursor 失效语义＋三种 `--help` 版式 | ☆ 修正历批打法＝我以前按"usage 行＋`Common flags` 头"取旗标全集，这次证明**同一动词的 Flags 段可以比 usage 行多 6 枚** ⇒ 矩阵开批前先 `--help` 逐动词穷尽 |
| ② **正／负对照 × 值域**＝同参数三连（合法窄值／合法宽值／非法值）＋相对词 | `--created-after 2025-06-01`→7 行、`2030-01-01`→空、`2020-01-01`→14 行、`bogus`→14 行、`yesterday`→空 | ★ 生效性＋"非法值静默回退"这一档；☆ 相对词是否被解析用 bogus 当对照才判得出来 | ⇒ **bogus 对照法**（见 `interactions.md` V122 第一条）＝判"值进没进逻辑"的唯一廉价手段 |
| ③ **空档上打越界值**＝`reminders list --limit 0／500／bogus`（该账户提醒为 0 条） | 三条校验句全数返回，且 `--limit 1`（合法）回 `No reminders found.` | ★★★★ **校验发生在取数之前**＝空档不再是"什么都判不了" | ☆ 直接升级第 127 批那条判据（原来只到"旗标是否被认识"，现在到"值是否被校验"） |

### 二、★★ 通路与边界

⇒ **零写入证明**＝本轮 20 次调用全走 `craft_read`，没有一次 `craft_write`；☆ 三条采集残留（`QODER-HARVEST-B109`／`B111`／`B113`）只在 `--location trash` 与裸跑里被**读到**，未做任何删除／还原／移动 ⇒ `manifest.jsonl` **155 行不变**；
⇒ **批处理不是事务**（复证第 126 批 G1260）＝本轮两次让 `--limit` 越界值排在批处理中间，回包逐字打印 `Command 2 failed: …` ＋ `Stopped after failure; earlier commands were already applied.`；⇒ ★ 新纪律应用＝**故意失败的探针一律放最后一条**（第 79 批在册），本轮 `folders list --no-id; reminders list --limit 500` 那次因为把失败排在末尾，前半读数完整拿到；
⇒ ☆ **零结果回包有两种形**＝`No documents found.`（默认作用域）与 `No documents found in "trash".`／`…in "daily_notes".`（作用域回显）⇒ 以后"空"要连回显一起记，否则两次空会互相冒充；
⇒ ★ **隐私闸门**＝`documents list --metadata 5` 那次回包把 **spaceId 原样打在 14 行里**，而盘上埋点证明同一枚值＝账户 `uid`（G1275）⇒ 本轮两份 dump 落在 `_harvest/`（gitignore），产物里一律折成 `<spaceId>`／`<rootBlockId-*>`／`<rawId-*>`，且**官方样板文档的具体时间戳不进产物**（只写"同秒／毫秒全 `.000`／偏移 `+08:00`"这类形状）。

### 三、☆ 本轮仪器错与自纠（写下来防复用）

1. ★ **复数词误推**＝历批我在某条描述行里读到复数 `metadata filters`，据此排了队列①"`--metadata` 带值过滤语义"；⇒ 本批打全 `documents list --help` 才看见**Filters 段是六枚专用日期旗标、`--metadata` 自述是显示旗标** ⇒ ☆ 纪律＝**"某旗标可带值"要由该旗标自己的描述行证明，不能由附近一个复数名词证明**（☆ 那句复数的原始出处本轮没重查到 ⇒ 记为"我引用过一条未能复核的文本"）；
2. ★ **在册口径强度未随新证据更新**＝第 126 批我写"游标在本只读面上没有生产者"，本批拿到契约侧对 cursor 生产与失效的明确描述 ⇒ 那句**降级**为"未观测到生产者"（见 `interactions.md` V122 原地 ✎）；☆ 形态＝我把"历批没见吐过"写成了接近"官方没有这回事"的强度；
3. ☆ **基线没重跑**＝G1271 的形态差集用的是历批在册的 `folders list` 头行（本批没重跑裸跑）⇒ 已在 `gap.md` 该节"仍未采到⑧"里写明"本轮实测 × 历批在册"，不许冒充双读数；
4. ☆ **三条校验句我一度记混**（`Too small` 与 `Invalid input` 哪句对应 `0`／`bogus`）⇒ 逐字串要进产物时**单独重跑一次取字**，不要从批处理回包的拼接文本里回忆。

## 六十二、**第 129 批＝旗标普查第二轮的方法与通路（16 份卡片打完的代价是把"批处理"这条通路本身改了：一次长回包会整条吞掉后面的命令；三条仪器新证＋三条本轮自纠，其中一条差点把"空判据"写成"旗标被吞"）**（✓数据面只读 2026-10-02 01:5x–02:2x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇八〇 G1276–G1283，逐字在 `longtail.md` §四十九，判据在 `interactions.md` V123，模型含义在 `model.md` §一之八十）

### 一、☆ 本轮打法（三段，全在一根只读桥上）

① **卡片段**＝15 份未读叶子的 `--help`＋一份对照（`connection info`），**每份单独一次调用**；② **行为段**＝从卡片里当场掉出来的两类新探针（`--page-size` 的界内／越界两发、`search` 与 `documents list` 的互斥四发）＋历批欠测的三发（`--offset` 越界、`--depth 0`、`--fetchMetadata` 有／无对照）；③ **复读段**＝裸 `folders list` 第二次读数（把上一批那条"本轮实测 × 历批在册"升级成本轮双读数）；
⇒ ☆ 本轮 **31 次成功的只读调用**＝16 份卡片＋15 发行为／复读探针（其中 **6 发是"故意违规"类**＝1 发 `--page-size` 越界＋1 发 `--offset` 越界＋4 发互斥组合），按纪律把会失败的那几发**各放在自己那次调用的最后**；⇒ ☆ 口径＝**31 项独立读数**（重发只算一项）＋2 项发出后完全没回包＋2 项因"失败即停"没跑而成对复跑；⇒ ★ 全程零挂死、零 `-32603`；开场判活＝`documents resolve-link --help` 秒回。

### 二、★★★ 三条仪器新证（都指向同一件事：批处理与并发都不可信，通路纪律要改成"一条命令一次调用"）

① **批处理里长回包会整条丢掉后一条命令**＝`blocks get --help; blocks learn --help` 只回**第一份**（且第一份**完整到最后一个字节**、第二份**一字不剩**），单独复跑 `blocks learn --help` 秒回全卡；对照＝`connection info --help; folders explore-icons --help`（两条都短）→ 两条全回；
⇒ ☆ 判据＝**用 `;` 批多条时，"回了几条"必须与"请求了几条"对数**，对不上不能据此判"官方没有该命令／该旗标"；
⇒ ★★ 这条同时给第 126／127 批那个悬了两轮的读数一个机制候选＝当年 `blocks` 段自报名单 4 行 vs 5 行的"末行被截"，**与本批"末条整条被吞"是同一族形状**（长度临界／缓冲上限），☆ 但仍**没有**复现出临界值，所以 G1258 的原地 ✎（判为一次不完整读数）**不改**；
② **并行发三条 `craft_read`，其中一条没有回包**＝`tasks list --help` 在并行批次里静默消失，单独复跑正常；⇒ ☆ 机制未定（桥侧并发丢包？CLI 侧并行折叠？），**不推断、不据此改任何在册结论**，只把通路纪律收紧；
③ ⇒ 新纪律入册＝**本目录的数据桥打法从"能用 `;` 就批"改为"一次一条"**；成本＝调用次数上升，收益＝"没回包"不再可能被误读成"官方没有"（而"官方没有"正是历批最容易写错的一类结论）。

### 三、★★★ 本轮四条方法（前两条是判据升级，后两条是判据改写）

① **每枚旗标跑两发＝越界发（判校验轴）＋界内极值发（判生效轴）**＝G1276 在同一条 `--page-size` 上拿到"500 被拒"和"1 不生效"，证明这两轴**互不蕴含**；☆ 历批只跑其中一发的地方要按两轴重读（`--limit` 在 `reminders list` 上只跑了越界发、界内那发落在空档＝仍属未判）；
② **旗标归属看卡片、旗标生效看回包，两者不许互推**＝G1277（`documents list` 没有 `--limit`，但不报错也不生效）＋G1278（`--page` 卡片签名行没有、Example 行有、且真生效）＝**"卡片没写"⇏"不能用"，"用了不报错"⇏"卡片写了"**；
③ ✎ **改写上一批的一条判据**＝V122/G1268 那句"旗标全集在 Flags 表而不在 usage 行"**口径过窄**＝本批见到 `tasks list` 三枚旗标**只在签名行**（该卡片无 Flags 段）、`--page` **只在 Example 行**、`--url`（`documents resolve-link`）也只在签名行 ⇒ 正确口径＝**四载体并集**＝签名行 ∪ Flags/Options 段 ∪ Example 行 ∪ 回包提示行（四者本批**各有实例**）；
④ **"输出层自述"是第三种廉价生效判据**＝历批已有 header 自述格式（`--no-id`，G1271），本批再添两枚＝`--page` 的 header 自述页码 `(page 2)`、`--offset` 越界的 `exceeds total of 1 results.` 自述总量 ⇒ ☆ 三种都不需要比较内容集合，**读一行头就能判旗标落没落地**。

### 四、★★★ 本轮三条自纠（动笔前／落盘前各抓到一条）

① **差点把"空判据"写成"旗标被吞"**＝`collections items-get --depth 0` 与缺省回包**逐字节相同**，第一反应是"又一枚被吞的旗标"；复核发现那三条条目**本身没有子内容**（只有一行属性），`0` 与 `1` 在这一档**不可区分** ⇒ ☆ 已按纪律改写成"结构上空判据"（G1276 表里没给它位置，正文记在 `_harvest/b129-help.txt` §7）；⇒ **判据固化＝判"旗标无效"之前先判"有没有可观察对象"**（这是历批"空档不能判覆盖面"的**旗标版**）；
② **差点把"卡片名册"当名册**＝`blocks explore-washi` 卡片只列 `hex`／`dot`／`stripe` 三档，而第 124 批真调用回的是更长的名册 ⇒ ☆ 结论＝**卡片里的小节是例子不是全集**，名册类结论只能来自真调用（本轮 `explore-themes --type fonts` 因此**只登记"未调用"**，没有据卡片写四档名册，见台账「二十八」④）；
③ **落盘前用节号逐份核对＝本批六份产物各命中 1 次**（第 127 批那条"整节漏落"教训的第二次执行）＝`一之八十`／`六十二`／`四十九`／`V123`／`三点一〇八〇`／`二十八` 各 1；☆ 又抓到**同一条坑第二次**（历批第四次）＝初稿按印象写"24 次调用＝16 卡片＋8 探针"，收尾按对话记录**逐条数完＝16 份卡片＋15 发行为／复读探针＝31 次成功调用**（另 2 次发出无回包）⇒ 已当场改回三处（本文件 §一、`gap.md` 选题段、台账叙述）；⇒ ★ **判据固化＝调用次数只能"列清单再数"，不能边写边估**，且"探针数"要与"卡片数"分栏记（本批初稿把 15 发压成 8 发＝把同一次调用里的多发只算了一发）。

⇒ **本批零代码改动** ⇒ 单测与 e2e 未跑（基线仍第 123 批的 272 通过／3 跳过）；⇒ ☆ 资料卫生增量＝本批 dump `_harvest/b129-help.txt` 头部写明"含真实 id／**真实姓名**／spaceId"，且**其中一发（`5376f8f3`）回包正文是用户自己写的任务书** ⇒ 该发在 dump 里**只记字段形状、不复制内容**（铁律"产物与证据都不复述用户长文本"的第一次在 dump 层执行；历批只约束了产物）。

## 六十三、**第 130 批＝零依赖只读五段的打法与通路（"一次命令一次调用"第一次有对照样本＝17 项读数零丢失；两条自纠：一枚空判据靠换目标解除、一条在册判据被自己的回包加了反面限定）**（✓数据面只读 2026-10-02 03:0x–03:3x 本地；★ 零屏幕、零写入、零 bundle 读取 ⇒ `manifest.jsonl` 155 行不变；gap 在 `gap.md` §三点一〇八一 G1284–G1291，逐字在 `longtail.md` §五十，判据在 `interactions.md` V124，模型含义在 `model.md` §一之八十一）

### 一、☆ 本轮打法（五段，全部零外部依赖）

① **名册段**＝`explore-themes --type fonts`（历批从未调用的一档）；② **引擎段**＝同一枚判别式在两动词上各打一次（`\1`／`(?=…)`／`(?P<n>…)` 共六发）；③ **生效轴段**＝`--regexp "."` 当全匹配控制、`--fetch-blocks` 看声明的东西在不在；④ **结构段**＝`search` 回包骨架与 `--depth` 两发对照；⑤ **闭环段**＝先用 `--metadata` 拿一对真 id，再喂给 `resolve-link`（并顺手测卡片没声明的那一形）；
⇒ ☆ 本批 **17 项读数**，全部**一次命令一次调用**（第 129 批刚立的纪律第一次有对照样本＝上一批用 `;` 与并行各丢一次，本批零丢失、零挂死、零 `-32603`）。

### 二、★★★ 本轮四条方法

① **判引擎只能靠"只有一种引擎支持的语法"，"能匹配"不证明引擎**＝`\1`（JS 合法、RE2 拒）＋`(?=…)`（同）＋`(?P<n>…)`（RE2 收、JS 拒）三枚构成**双向判别**，缺任何一枚都只能得"看起来像"；⇒ ☆ 顺带一条＝**拒绝串的两种长相**（`Invalid regular expression pattern: <回显>` vs 从不报语法错只给 `No folders matching "<回显>"`），两者都回显输入原文＝**回显原文是这一族拒绝串的共性**，可用来判"值有没有进编译器"；
② **判"生效"要看声明的那件东西在不在，不是看回包变没变**＝`--fetch-blocks` 让每条多出一行 `Hydrated blocks: 1`（回包变了）但**正文没进来**（声明没兑现）＝旗标失败形态里新的一档，介于第 129 批"界内不生效"与"静默吞"之间；
③ **空判据靠换目标解除，不靠加旗标**＝第 129 批那发 `items-get --depth 0` 之所以不可判，是因为条目本身无子内容；本批改挑一枚**真有子块**的目标（三枚 collection 的宿主页面）＝同一枚旗标一次就出正控制；⇒ ☆ 判据固化＝**测"某旗标无效"前先确认"有没有可观察对象"，没有就先造／先找可观察对象，不要先下结论**；
④ **正控制要先造输入，而输入可以从另一个动词的免费回包里拿**＝`resolve-link` 需要一对真 id，本批不是猜也不是造，而是 `documents list --metadata` 那三行里就有（零写入）；⇒ ☆ 打法＝**先翻历批回包形状再决定要不要写侧**（本批五项原计划里只有⑤看起来像要写侧，实际不用）。

### 三、★★★ 本轮两条自纠

① **差点把 header 自述当成完整格式说明**＝`documents list --metadata` 头行写 `format: <rootBlockId> Title (createdAt, lastModifiedAt)`，而每行实际**还多一列** `→ craftdocs://…`；⇒ ✎✎ 这直接给第 128 批 G1271（"header 自述格式＝最干净的形态判据"）加了**反面限定**＝自述只保证"会随旗标变"，**不保证"完整枚举列"**；⇒ ☆ 同一条自纠的另一面＝**这条判据是本批靠它自己发现的**（我按上一批立的规矩去读头行，读出的行却有第四列，才暴露出自述不全）＝纪律被执行才被抓错；
② **G102 的判定被我上一批的说法带偏**＝在册原文是"本地三档 `serif/mono/rounded` 与官方 `system-*` 命名不一致、改值即可"；本批真名册里**官方把这三个名字列为合法别名**（`--font serif` 官方接受）⇒ 差分不是"四档都错"而是"一档（`inter`）不在官方词表 ＋ 一处语义差（本地把字体栈写死成 Georgia 等，官方四档全系统族）"；⇒ ☆ 判据＝**"命名不一致"类结论要先查官方有没有把它列为别名**，别名的存在会把"改值"类缺陷降级。

⇒ **本批零代码改动** ⇒ 单测与 e2e 未跑（基线仍第 123 批的 272 通过／3 跳过）；⇒ ☆ 资料卫生增量＝本批 dump `_harvest/b130-probes.txt` 里含**真 documentId／rootBlockId／spaceId**，且检索回包有一行回显了**用户自己写的文档正文片段**（第 4 节）⇒ 与第 129 批同法处理＝**dump 只留骨架、正文一个字都不抄**，产物一律折占位；⇒ ★ 一条通路事实＝`--include QODER` 零命中**不能**读成"三条沙盒残留没了"（默认档不含回收站，第四次复证），本轮未读未动。
