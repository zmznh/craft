# 标签系统与浏览面（`tags.*` 67 + `browse.*` 132 + 小面）

证据：`_harvest/tail-{tags,browse,date,calendar,download,stats}.txt`。
标注：`~` = 文案直述；`✓` = 与另一处证据（代码常量 / 别的命名空间 / 枚举表）互证。

## 一、标签是两级树，不是扁平集合 ✓

`enter.a.valid.tag`「输入有效标签（例如 **#标签 或 #父级/子级**）」+ `only.one.child.allowed`「**仅允许一个 "/"**」
⇒ 层级深度固定为 **2（父级 / 子级）**，第三级非法。这条约束在编辑器里就是校验规则，不是显示效果。

## 二、标签字符校验规则集（6 条，逐条可实现）~

| 规则 | 文案 |
|---|---|
| 禁空格与标点 | `space.and.punctuation.are.not.allowed`「标签中不允许使用空格和标点符号。」 |
| 禁表情 | `tags.cannot.contain.emojis`「标签不能包含表情符号。」 |
| 禁分隔符 | `tags.cannot.contain.delimiter.char`「标签不能包含分隔符」（分隔符即 `/`） |
| 纯数字需放行 | `number.titlekey`「数字」+ `number.descriptionkey`「**仅包含数字的标签**，例如 #1」⇒ 这是规则表里的一个可切换项 |
| **十六进制颜色词不算标签** | `hexcolor.titlekey`「十六进制颜色值」+ `hexcolor.descriptionkey`「十六进制格式的颜色值，如 **#ff0000 或 #ccc**」⇒ 系统内置"识别颜色字面量并排除"的规则，避免 `#ccc` 变成标签 |
| 反馈态 | `tag.is.valid`「标签有效」/ `invalid.tag.x`「无效标签：[0]」/ `entered.current.tag`「你已输入当前标签。」/ `entered.invalid.tag`「你输入了无效的标签。」/ `continue.typing.to.create.(a.valid.)tag` 两句 |

⇒ 官方把"数字标签""颜色值"这类**误判场景做成了可管理的规则**，而不是硬编码黑名单。

## 三、忽略规则引擎（自定义规则是一等实体）✓

`ignore.list`「忽略列表」+ desc「**这里的任何内容都不会出现在你的标签列表中，即使带有 #**」；对规则本身有完整 CRUD：`add.custom.rule` / `add.ignore.rule` / `edit.rule` / `edit.ignore.rule` / `delete.rule` + 确认 `delete.rule.message`「你确定要删除"[0]"吗？」+ 输入项 `text.to.ignore`；命中后可见来源 `tag.ignored.by.custom.rule.x`「被自定义规则忽略的标签：[0]」；添加后提示 `tag.added.to.the.ignore.list`「标签已添加到忽略列表。你可以在"设置"中管理它」⇒ **从标签上直接"忽略"再回设置管理**是条双向路径。

**交叉验证成功** ✓✓：`hide.word.with.hashtag`「隐藏以 # 开头的词语」/ `hide.tags`「隐藏标签」正是 `publishing.md` §一 里那个**只在代码里出现、发布文案里没有对应句**的 `hideHashTagWords` 字段的界面标签 —— 上一节的遗留项在此结案。

## 四、固定标签（pinned）与筛选联动 ✓

`pin.tag` / `unpin.tag` / `manage.pinned`「管理固定标签」/ `pin.key.tags`「固定关键标签以便快速访问」/ **`pin.and.show.all.children`「固定并显示所有子项」**⇒ 固定父级时可选择连带展开所有子级；`pinned.limit.reached`「你已达到固定标签数的上限」（**上限数值未给**，属远端 `[0]` 类）；`pinned.error`。
⇒ 与 `registries.md` §二的动作词表 `tag_{pin,unpin,reorder}` 三件套互证 ✓（固定、取消固定、重排都是独立动作）。
筛选侧：`include.tag.in.filter`「在筛选中包含标签」/ `exclude.tag.from.filter`「从筛选中排除标签」⇒ 标签可直接成为集合筛选条件（接 `protocol.md` §九 的 19 操作符轴）。

## 五、标签的空间级开关：关闭 ≠ 删除 ✓

`turn.off.tags.for.this.space`「关闭此空间的标签吗？」+ desc「**此空间中的标签仍处于活动状态。关闭后，标签将在所有位置隐藏。**」+ 两个按钮 `yes.turn.off`「是的，关闭」/ `no.keep.on`「不，保持开启」。
禁用后的提示链：`disabled`「标签已禁用。你可以在空间设置中启用它们。」→ `enable.tags.in.the.settings`「在设置中启用标签」。
`changing.these.settings.wont.affect.member.settings`「更改这些设置不会影响其他成员的设置。」⇒ 与 AI 助手、通知同款"**每用户×每空间**"作用域句（`settings.md` §三/§四 第三处互证 ✓）。
另 `tags.settings.error`「保存标签设置时发生错误」是设置写的失败句。
`space.and.punctuation…`、`uppercase` / `lowercase` 两档 ⇒ **标签显示大小写是设置项**。

## 六、标签面板的其他要素 ~

分区：`all.tags` 所有标签 / `other.tags` 其他标签 / `recommended.tags` 推荐标签 / `related.tags` 相关标签 / `any.tag`「任意 [0]」/ `x.tags`「[0] 个标签」/ `create.tag.x`「创建 #[0]」。
空态五句：`all.tags.placeholder`（含官方中文示例词 **#工作、#想法、#学校**）、`no.docs.found`、`no.tags.in.doc`、`no.other.existing.tags`、`tags.will.appear.here`。
动作：`edit.tag`、`change.to.text`「更改为文本」⇒ **标签可降级为纯文本**（反向于"选中文字加 #"）。
引导：`learn.more.about.tags`、`use.tags`。
⇒ 本地 `SettingsModal.tsx:37` 已有「标签」分区，但据 `panels.md`/`tags` 对账，上述规则引擎与固定标签管理均未实现（见 gap）。

## 七、浏览面（`browse.*` 132）

| 子轴 | 事实 |
|---|---|
| **排序 12 档** ✓ | `sort.by` + `alphabetically` / `name` / `kind` 类型 / `manual` **手动的**（⇒ 手动排序＝拖拽，与 `registries.md` 的五种 reorder 作用域对上）/ `shared.by` 分享者 / `last.edited` / `last.viewed` / `date.created` / `date.created.shared` 创建\|共享日期 / `date.updated` / `date.viewed` 浏览日期（与 `protocol.md` §二 视图键互证） |
| 视图两档 | `grid.view` 网格 / `list.view` 列表 + `list` 列表 + `viewed` 已浏览 |
| 侧栏三组展开/折叠 | `expand.{folders,starred,tags}` 与 `collapse.{…}` 成对 ⇒ **只有这三组可折叠** |
| **侧栏可个性化** | `sidebar.reorder.or.hide`「重新排序或隐藏部分以个性化你的视图。」⇒ 侧栏分区的顺序与可见性是用户偏好；`sidebar.inbox` 的中文标签是「**未归档**」（⇒ 官方把 inbox 译作"未归档"，与 `isArchived` 轴呼应，`registries.md` §七） |
| 模板四条 | `templates.creating`「从模板创建文档」（进行时）/ `cannot.create`「无法创建模板」/ **`doc.too.large`「文档太大，无法用作模板」**（守卫句，此前只有 `assistant.md` 的 document.too.big）/ `inserting`「将模板插入文档」⇒ **模板有两个动作族：从模板新建 vs 把模板插入当前文档**；`new.template`、`new.document.from.template` |
| 导入 | `import.files` 导入文件 / `import.md`「导入」/ **`import.md.where`「你想从哪里导入？」**⇒ 导入是先问来源的一级流程 |
| 导出 | `export.contents` 导出内容 / `export.as.md` / `export.as.textbundle`（⇒ 与 `plans.md` G22 的 7 类导出对账：浏览面只暴露 md 与 TextBundle 两项，其余在别的面板） |
| 打开与深链 ✓ | `open.in.app`「在应用中打开」/ `open.in.app.question` / `open.in.desktop.app`「在桌面应用中打开？」/ `open.gallery` 打开图库 / `open.space`「打开空间…」⇒ 与 `settings.md` §五 的 `link.open.preference`（Web vs 桌面）互证，**深链落地策略确有其事** |
| 空间标识 | `change.space.avatar`(+desc「添加或更改团队的徽标或图标」+`error`) / `change.space.name`(+desc) ⇒ **空间头像与名称都可改，各有失败句** |
| 新建与空态 | `new.doc` / `new.document` 两个键（短标签与长标签）、`empty.document` 空文档、`note.for.today`「今日笔记」、`no.documents.yet`、`no.results.found` + `no.results.found.for`「未找到 [0] 的结果」 |
| 搜索态 | `search.in.documents` / `search.results` / `search.results.for` / `search.create.doc`「创建 [0]」（**搜索框内可直接建新文档**）/ `searching.for.other.matches`「正在搜索其他匹配项」（⇒ 搜索是**分阶段返回**：先给一类匹配，再找其他） |
| 共享区 | `shared.with.you`「与你共享」+ `shared.with.me.placeholder`「与你共享的文档将显示在此处」 |
| 团队入口 | `view.teams.and.spaces`「查看团队和空间以及更多内容…」 |

## 八、显式排除（不是遗漏）

- **`onboarding.*` 138 条**：`menu` 26 条是**菜单命令标签**（已由 `commands-catalog.md` 189 条覆盖）；`v3` / `v326` / `v330` / `v350` 共 47 条是**按版本号编排的"新功能导流"文案**（营销/引导内容，非功能契约）；其余是兴趣采集（`interests` 8）与欢迎语。⇒ 对 1:1 复刻无契约价值，按内容处理而非按功能处理。
- `country` 261 / `unit` 79：地区与单位**数据表**（选择器素材）。
- `date` 40 / `calendar` 24 / `download` 14 / `stats` 10：已分别由 `tasks.md`（四套时间维度、日历五档分节）、`longtail.md`（Stats/Activity/应用更新）、`plans.md` 覆盖，本文件不重复。


---

# 追加批次（2026-09-27 第 13 命名空间批，静态 `browse.*` 131 条全量重读）

> 此前本文件只用了 `browse.*` 的排序与分区部分。把 131 条**全量**重读后，补出七个成块的面，其中**回收站**直接推翻 `interactions.md` V27 的结论。全部 `~`（文案级证据，行为未验，除注明 ✓ 者）。

## 一、回收站 =「最近删除」，**保留 30 天后永久删除**

| 键 | 串 | 含义 |
|---|---|---|
| `recently.deleted` | 最近删除 | 屏名（不是"回收站"，`alert.could.not.move.to.trash` 里才出现"回收站"字样 ⇒ **同一实体两套叫法，内部键名 `trash`、用户可见名「最近删除」**） |
| `browse.doc.you.deleted.will.appear.here` | 你删除的文档将显示在此处 | 空态引导 ⇒ 它是 **browse 屏的一个视图档** |
| **`browse.trash.disclaimer`** | **文档将保留 30 天。之后，文档将被永久删除。** | **保留期 30 天**，与备份 30/180 天是两个独立轴 |
| `alert.moved.to.trash` | 将文档移至"最近删除" | 移动成功句 |
| `alert.item.moved.to.recently.deleted` / `alert.items…` | 此项目将移至最近删除。/ 这些项目将移至最近删除。 | **one/other 两键**（R25），且用"将移至"＝**确认前的陈述句**，不是完成句 |
| `move.x.to.recently.deleted` / `move.x.items.to.recently.deleted` | 将"[0]"移至最近删除 / 将 [0] 个项目移至最近删除 | **单项与批量各一句标题** |
| `moved.to.recently.deleted` | 已移至最近删除 | 完成句 ⇒ 于是删除动作有**进行时/确认前/完成**三句（R22） |
| `commands.restore` / `commands.restore.document` | 恢复 / 恢复文档 | 反向操作是命令（有键位槽） |
| `commands.empty.trash` + `alert.empty.trash.title` | 清空最近删除 / 你确定要**永久删除**这些项目吗？ | **清空＝不可逆**，且用词从"删除"升级为"永久删除" |
| `alert.could.not.move.to.trash` / `alert.could.not.restore.from.trash` | 无法移到回收站 / 无法从最近删除中恢复文档 | 两条专错（移入与恢复**各自一条**） |
| `trash.find.in.history` | 查找历史 | 回收站语境里"恢复"的另一入口＝走备份/历史 |

**推翻既有结论**：`interactions.md` **V27 判定"网页版硬删除、没有回收站"是错的**。屏上实测看到的确认框正文是「你确定吗？你无法撤销此操作。」，但产品侧存在完整的"最近删除 + 30 天 + 恢复 + 清空"体系 ⇒ 要么该框属于另一条路径（例如**从空间/文件夹里删**而非从文档删），要么官方文案与实现不一致。**已把 V27 降级为"部分未解"，并把这条列为下一轮浏览器恢复后的第一个复验项。**

### 一之二、动态复验结果（2026-09-27 第 14 批，零写入 `goto <space>/trash`）✓

上面那句"要么该框属于另一条路径"**已被证实** —— 两条删除路径并存，V27 与 V27b 同时成立：

| 路径 | 动线 | 后果 | 证据强度 |
|---|---|---|---|
| **批量选择删除** | 所有文档 → ⋯ →「选择」→ 勾选卡片 → 红色垃圾桶 → 确认框「你确定吗？你无法撤销此操作。」 | **不进回收站**（删完 `/trash` 仍是空态、URL 直接落营销页） | ✓ 实测（manifest 第 4 条 + 本批 `shot-trash.png`） |
| **单项"移至最近删除"** | i18n 独立标题 `move.x.to.recently.deleted`「将"[0]"移至最近删除」+ 完成句 `moved.to.recently.deleted` | 进回收站、留 30 天 | ~ 文案级，**动线未找到**（见下） |

屏本身的事实（全部 ✓ 实测，详见 `interactions.md` **V31**）：路由 `<space>/trash` 真实可达、标题「最近删除」、与 所有文档 共用浏览屏外壳；空态 = `browse.doc.you.deleted.will.appear.here`；**`browse.trash.disclaimer` 的 30 天句在空态下不渲染**（⇒ 条件行）；本屏 ⋯ **只有「清空最近删除」一项**，没有 选择 / 排序方式 / 导入导出 / 空间设置。

**入口三处全落空**：侧栏、所有文档 ⋯（11 项）、⌘K「打开」面板都不列它 ⇒ 网页版当前**只能 URL 直达**，这本身是一条值得复刻的"有屏无入口"事实（见 `gap.md` G233 更新）。

## 二、视图是**三档**不是两档

`grid.view`「网格视图」、`list.view`「列表视图」、**`waterfall`「瀑布」**。⇒ 本文件原记"网格/列表两视图"要改三档；V27 屏上看到的 `data-grid-body="cards"` 对应"网格"。另有 `browse.edit.layout.view.sort.and.more`「编辑布局视图、排序等…」＝这四类设置的统一入口句。

**动态复验（第 14 批，V32）✓**：三档按钮在语义树里是 `Rectangle Grid2x2` / `Rectangle3 Group` / `Line3 Horizontal` 三个 `button`，按图标语义与实测结果映射为 **网格视图 / 瀑布（中间档，仍未采到）/ 列表视图**。点第三档后整套类名换成表格组件 `_1m9yz_`，**列头四列 = 名称 / 上次浏览 / 已更新 / 已创建**，当前排序列带方向箭头（实测「已更新 ↓」），三日期列宽各 `--col-last-viewed-width: 112px`。⇒ ① **排序档位与列表视图的列是一一对应关系**（V28 的 4 档排序 = 4 个可排序列）；② 行的副标题是**内容摘要回退链**（正文预览 → 空文档显示「空文档」→ 只有分隔符显示「/」→ 集合显示子项名串），不是字段；③ CSS 里有 `_statusCol`/`_statusCheckbox` 但截图看不到 ⇒ 复选框列由「选择」模式条件渲染。

## 三、搜索面此前只采到皮毛（`quick.search*` + 结果屏 10 句）

- 两个入口：`quick.search`「快速搜索」与 `quick.search.alt`「快速搜索（alt）」⇒ **同一功能两条命令**（与 `keyboard.md` 里 QUICK_OPEN 有 4 变体同族）。
- 结果屏：`search.results` / `search.results.for`「[0] 的搜索结果」/ `type.to.search` / `no.results.found` 与 `no.results.found.for`（**空态也分"有查询词"与"无查询词"两句**）。
- **两段式检索的现场证据**：`searching.for.other.matches`「正在搜索其他匹配项」+ `see.more.results`「查看更多结果」+ `show.x.more`「再显示 [0] 项」⇒ 首屏只给一部分命中，其余**按需再查**。
- **搜不到就建**：`search.create.doc`「创建 [0]」⇒ 结果列表里始终提供"用当前查询词新建文档"。
- `search.in.documents`「在文档中搜索」⇒ 与"搜索文档"是两件事（全文检索 vs 标题检索），呼应 `settings.md` §十 `FALLBACK_PREFERENCE="local"`。
- `remove.from.recents`「从最近使用中移除」+ `recently.viewed` / `recently.viewed.desc`「你最近打开的文档会显示在这里」⇒ "最近浏览"是**可手动剔除**的列表。

## 四、模板是一等子系统（9 句，含两条硬限制）

`new.template` / `browse.create.template` / `browse.edit.template` / `new.document.from.template`「从此模板新建文档」/ `from.template`「来自模板」/ `save.time.with.templates` / **`templates.doc.too.large`「文档太大，无法用作模板」**（⇒ 模板有**体积上限**，与 `plans.md` §二 未解的"远端上限"同源）/ `templates.creating`「从模板创建文档」进行时 + `templates.cannot.create` 失败句 / `templates.inserting`「将模板插入文档」⇒ **模板既能"新建"也能"插入"**，两个动作。
**`browse.custom.templates.desc`「创建新文档或页面时，添加到此文件夹的文档可用作模板」**⇒ 模板来源是**一个特殊文件夹**，不是独立库。

## 五、离线态在列表里有**三种徽标**

`browse.doc.edited.offline`「已离线编辑」、`browse.doc.edited.offline.sync`「已编辑 · 打开以同步」、`browse.doc.open.to.sync`「打开以同步」⇒ 与 `settings.md` §一 的离线模式开关对得上，且**徽标区分"未同步"与"打开才会同步"**。

## 六、空间切换与登录失败的完整错误屏（11 句）

`open.space`「打开空间…」、`view.teams.and.spaces`、**`unsaved.change.switch.space`「你有未保存的更改。确定要切换空间吗？」**（R21 第 6 例：切空间这种"会丢数据"的动作也要确认）、`space.not.found` / `unknown.space` / `browse.cannot.open.space.title`「空间无法打开」+ `.desc`「你可能需要使用其他帐户登录，或者请空间所有者邀请你。」、`sign.in.failed`、`logging.in`、**`login.was.not.initiated.in.this.browser`「登录操作并非在此浏览器中发起」**、`browse.back.to.login`、`leaving.space`。
⇒ `login.was.not.initiated.in.this.browser` 与 §11（`longtail.md`）的 popup 式登录互相印证：**登录是有会话上下文的跨窗口流程**，换浏览器就要报错。

## 七、网页 ↔ 桌面 App 的跳转选择器（4 句）

`open.in.app`「在应用中打开」、`open.in.app.question` / `open.in.desktop.app`「在桌面应用中打开？」、**`remember.my.choice`「记住我的选择」**⇒ 每次深链都可能弹"要不要转桌面端"，且选择可持久化（对应 `preferences.open.in.app.link.preference` 与 `preferences.use.your.custom.craft.me`）。

## 八、其余五条

1. **`browse.drop.here.to.pin.document`「拖放到此处以固定文档」**⇒ 主页有拖放固定区（`registries.md` §二 的 `PIN_ON_DROP` 落库行为在 UI 侧的对应句）。
2. **`inbox.desc` 与 `inbox.desc.new` 两句并存**（「不在任何文件夹中的文档都会收集在这里」/「任何尚未移动到特定文件夹的文档都将显示在此处。」）⇒ 官方**同一位置留了新旧两版文案**，复刻时选 `.new`。
3. `sidebar.inbox`「未归档」vs `unsorted`「未分类」vs 屏上实测信息页「未分类」⇒ **同一个容器三个名字**（键位不同宿主不同）。
4. `only.you.can.see.your.starred.items`「只有你可以查看收藏的项目」⇒ **收藏是私有维度**，不随空间共享（协同语义上很重要）。
5. 文件夹侧：`folder.deleteprompt.subtitle`「不会删除文件夹中的文档。」（删文件夹的**后果澄清句**）、`browse.subfolders`、`folder.empty`、`folder.updated`/`folder.deleted`/`updating.folder`/`creating.folder` 进行时三件套、`browse.add.description.to.folder`「向此文件夹添加说明」⇒ **文件夹有 description 字段**（本地 schema 里没有这一列）。

## 九、搜索面板的数据面与分组规则（2026-09-27 静态结案，`js/index-*.js` @966585–971587）

原排在动态队列上的"⌘K 查看更多阈值"，在 bundle 里直接结案，且顺带纠正了一处猜测。

### 9.1 SearchFlexi 四个端点的完整形状（★ 响应字段名不统一）

基址 `const Dk = "/search-flexi/space/v1"`，**全部用 `PUT` 发 JSON**：

| 端点 | 入参 | 取响应的字段 | 错误映射 |
|---|---|---|---|
| `/search` | `{spaceId, scope, terms}` | **`.items`** | 401\|403 → AccessDeniedError |
| `/document-highlights` | `{spaceId, documentId, terms}` | **`.items`** | 401\|403 → AccessDenied、**404 → NotFound（只有它有）** |
| `/search-block` | `{spaceId, terms, ...(limit!=null?{limit}:{})}` | **`.results`** | 401\|403 → AccessDenied |
| `/tag-stats` | 整个参数对象直接当 body（内含 `spaceId`） | **`.items`** | 401\|403 → AccessDenied |

三条结论：① `terms` 是**数组** ⇒ 客户端已分词，服务端不收原始查询串；② `scope` 是一等入参 ⇒ 本地缓存键 `search-scope-preference` 的值**随请求上行**（与 `internals.md` §10.4 的分界线判断吻合）；③ **`/search-block` 的 `limit` 省略即由服务端决定默认值**（代码里是条件展开，不是传 0），且它是唯一返回 `results` 的端点 —— 本地按同一解析器写会踩字段名不一致。

### 9.2 结果分组是**客户端按谓词多归属**分桶，并预计算累计 offset

```
bit(query, items, predicates /* {组名: item=>bool} */)
  → items.forEach: for (const [label, fn] of entries(predicates)) fn(item, query) && buckets[label].push(item)   // 不 break
  → reduce 成 [{label, results, offset}]，offset = 前面各组条数之和
```

- **一条结果可同时进多个组**（匹配到就 push，没有提前退出）⇒ 分组不是划分而是视图；
- **`offset` 是跨组累计序号** ⇒ 弹层把分组结果拍平给方向键导航用（↑/↓ 走的是"组内序号 + 该组 offset"），这解释了为什么分组后键盘导航仍能连续；
- 谓词签名是 `fn(item, query)` ⇒ **分组可以依赖查询串本身**（不只是 item 属性）。

### 9.3 查询串若能解析成日期，就追加一个「日期」结果项

`yit(q) = Gw(q).then(d => d==null ? [] : [{type:"date", date:d}]).catch(() => [])` —— 复用 §（`tasks.md` §十一）那条**异步** chrono 解析链，**失败静默成空数组**。⇒ 在搜索框输入"明天"会看到一条日期类结果（本地若同步解析就没有这次异步往返）。

### 9.4 ★ 「查看更多」不是 20 条阈值：`git=20` 的真实身份

常量 `git = 20` 全 bundle **只被使用一次**，且不在"查看更多"路径上，而在搜索面板的**最近文档组**：

```
getDocumentSortFunction(Ns.Updated, $n.Ascending)  →  [...docs].filter(d => d.id !== currentDocId).sort(cmp).slice(0, git)
```

⇒ 硬事实：**最近文档 = 排除当前正在看的文档 + 按"已更新/升序"排 + 截断 20 条**；排序比较器由服务端风格的工厂 `getDocumentSortFunction(枚举, 方向枚举)` 提供（与浏览面 6 档排序共用，见 `gap.md` G348）。此前把"搜索结果 20 条"写进候选清单是**猜测，现予作废**；`browse.show.x.more` / `see.more.results` 的真实阈值仍未定位（见下方第 10 条）。

### 9.5 顺带掉出的两条浏览模型事实

- **每日笔记文档没有自己的标题**：显示名由 `dailyNoteDate` + locale 现场合成（`aU(S.dailyNoteDate)` → `kit(date, locale, t)`，取不到才回退 `rc(S.title ?? "", …)`）⇒ "文档标题"在浏览面上可能是**派生值**，本地若存成字面标题会与官方不一致。
- **未分类/收件箱文件夹是一个哨兵 id**（代码里 `if (S.folderId === dl) return w`，直接跳过常规命名分支）⇒ 与 `craft://folder/unsorted` 保留字（`assistant.md` §十一）互相印证：**特殊文件夹用哨兵常量而非真实 id**。

## 仍未采到（本批 5 条 + 此前遗留 4 条；本节在合并追加批时重写过，遗留四条按正文 `~` 标记复原）

1. ~~「最近删除」屏的**真实入口与布局**~~ → **入口已排除三处**（侧栏 / 所有文档 ⋯ / ⌘K 面板，均不列它，见 §一之二），**"有屏无入口"本身成为结论**；仍缺 **有内容时的列表布局**（恢复 / 永久删除 两按钮的实际形态），需要一次"建→删→看回收站"的写入批次。
2. ~~`waterfall` 瀑布视图在哪些屏出现、与网格的差异~~ → **部分结案（V32）**：三档已定为 网格视图 / **瀑布（中间档 `Rectangle3 Group`，仍未采）** / 列表视图（第三档，已实测成表格）。仍缺：瀑布档的布局与它在哪些屏可选。
3. 搜索"两段式"的**触发阈值**与第二段的请求方式（`searching.for.other.matches` 何时出现）。
4. 模板体积上限的具体数值（`templates.doc.too.large` 没给数）与"模板文件夹"如何被标记为模板源。
5. 文件夹 `description` 字段的渲染位置（`add.description.to.folder` 只证明可编辑）。
6. **§二 六条标签校验规则的实际触发时机**（输入时拦截 / 提交时报错 / 静默清洗），文案齐但行为未验。
7. **§六 标签面板的分区语义**：`all.tags` / `other.tags` / `recommended.tags` / `related.tags` / `anchor?` 五组**怎么划分**（推荐与相关的算法不可见）。
8. **`edit.tag` 与 `change.to.text`「更改为文本」** 两个动作的后效（标签降级为文本时，已打该标签的所有位置一起变还是只变当前一处）。
9. 侧栏分区"重排或隐藏"（`sidebar.reorder.or.hide`）的**可重排范围**与持久化时机（`settings.md` §十 已记两套独立顺序，但没记拖拽重排的落库时机）。
10. **`browse.show.x.more` / `see.more.results` 的真实阈值与触发条件**：`git=20` 已被 §9.4 证伪（它是"最近文档"组的截断，不是查看更多）；分组函数 `bit()` 内也没有任何 slice ⇒ 阈值在调用方或服务端（`/search` 不带 limit，`/search-block` 才带），**未定位到字面量**。

## 十、搜索面静态结案（2026-09-27 09:15，`js/index-*.js` 四处代码位，零浏览器预算）

连接器第 17 次卡死（`ax.pressKey('Control+k')` 与基线 `domSnapshot` 双双超时）后转静态，一次结掉三个原列为"待动态"的项。

### 10.1 ★ 结果类型全集 = 9 种，且「查看更多」是一个**虚拟结果行**而不是阈值

渲染器 `ucn`/其姊妹函数（@4013655）的 `switch (t.type)` 分支即权威类型表：

| `type` | 渲染成 | 含义 |
|---|---|---|
| `document` | 文档行 | 常规命中 |
| `block` | `t.content` | **块级命中**（对应 `/search-block` 端点） |
| `date` | `q1(t.date, e).mergedString` | ★ 查询串可解析成日期时插入的**日期结果项**（与 `tasks.md` §11 / V35 的 `{type:"date"}` 双向印证） |
| `documentAction` | `browse.search.create.doc`「创建 [0]」 | ⇒ 证实"结果里永远有一条创建项"是**类型级实现**，不是文案巧合 |
| `mention` | `<jz>{t.name}</jz>`，副行可显示 `t.email` | 提及人 |
| `folder` / `space` | `t.name` / `t.spaceName` | 跨空间结果 ⇒ **搜索作用域可含空间级条目** |
| **`loadingMore`** | **`browse.searching.for.other.matches`** | ★ **分页哨兵行** |
| **`loadingMoreMentions`** | 同上文案 | 提及分组独立续页 |

⇒ ★ **原"⌘K 查看更多阈值"这个问题本身是错的**：官方不是"超过 N 条就显示查看更多"，而是**往结果数组里插一条 `type:"loadingMore"` 的虚拟项**，渲染文案就是那句"正在搜索其他匹配"，到达即触发下一页。⇒ `tags-browse.md` 未采到清单第 10 条**结案**，且**不需要浏览器**。
⇒ 另注意 `loadingMore` 与 `loadingMoreMentions` **两条哨兵分开** ⇒ 主结果与提及结果各有独立分页游标。

### 10.2 分组在前端：`bit(查询串, 合并后的结果数组, 谓词映射)`

调用点 @4038545：`M = bit(P, j, u)`，其中 `j` 由**三批结果拼成**（`[...D, ...E, ...h]`，按当前分支还有 `[...D, ...E]` 的两批形态）⇒ **服务端返回的是扁平列表，分组/分节完全在前端做**，且谓词签名 `(item, query)` 可用查询串本身参与归组（§9.2 的 `bit()` 实现已记）。

### 10.3 ★ 搜索的 react-query 缓存契约（"手感"的实现级根据）

```
Kg = h1.fromMinutes(1).milliseconds          // = 60_000
search / getDocumentHighlights 两个 hook 共用：
  staleTime: Kg, cacheTime: Kg, retry: 1,
  keepPreviousData: true, refetchOnWindowFocus: true, enabled: <bool>
```

⇒ 四条可观测后果，本地要逐一对应：**① 同一查询 1 分钟内不重发**；**② 结果缓存也只留 1 分钟**；**③ 切走窗口再回来会重新取**（`refetchOnWindowFocus`）；**④ 输入新词时旧结果不闪空**（`keepPreviousData`）—— 官方"打字时列表不抖"就是这个开关。
⇒ 另有一个通用**防抖 hook**（@2549828：`setTimeout(()=>setState(next), delay)` + 卸载时 `clearTimeout`），搜索框走它；**延迟常量的具体值未取到**（在参数位）。

### 10.4 ★ 侧栏分区折叠阈值是硬编码 `20` 与 `25`

@2792983：`RBt = 20, nP = 25`。两处使用：

- **Inbox 分区**：`j.length > nP` 时渲染 `m8e`（折叠行），props = `{indentLevel:0, isExpanded, remainingCount, showLessLabel: "tasks.show.less", showMoreLabelFactory: n => "browse.show.x.more"{0:n}, onToggle, textLeftOffset: 22}`；且整个分区还要 `viewProps.isOpen && M.length > 0` 才出现。
- **星标分区**：`n.length > L` 时同一组件，无 `textLeftOffset`。

⇒ 修正 §9.4 的遗留问题：`git=20` 是"最近文档"截断，而**侧栏折叠阈值是另外两个常量 20 / 25**；`browse.show.x.more` 与 `tasks.show.less` 都**不属于搜索面板**。
⇒ 顺带一条官方不一致：侧栏折叠的"收起"文案取自 **`tasks.` 命名空间**（`tasks.show.less`）而"展开"文案取自 **`browse.` 命名空间**（`browse.show.x.more`）⇒ **同一控件的两个标签跨了两个命名空间**。

## 仍未采到（搜索与浏览，本批更新）

- ~~`browse.show.x.more` / `see.more.results` 的真实阈值~~ **已结案（§10.1 + §10.4）**：搜索结果侧是分页哨兵行不是阈值；侧栏折叠阈值是 `20`/`25`。
- 搜索框防抖的**延迟常量值**（机制已明，数值未取到）。
- `bit()` 的**谓词映射 `u` 的具体分组名**（决定"哪些组、什么顺序"，在调用方的 memo 分支里，未定位到字面量）。
- 三批结果 `[...D,...E,...h]` 各自的来源端点（推测为文档/块/提及三路并行，未逐一证）。
