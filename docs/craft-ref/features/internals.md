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
