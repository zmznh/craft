# Craft.do 键盘契约（静态解码，官方版本 3.6.3）

来源：`_harvest/js/index-DiTmKH3z.js` 的三个注册表常量 `Iu`（文档/样式，66 项）、`ho`（任务视图，23 项）、`hnt`（表格子表，15 项），以及 `ot={...Iu,textStyleShortcuts,decorShortcuts,tableShortcuts}` 聚合出口；360 条 `matcher:` 运行时绑定站点。解码脚本 `_harvest/decode-keymap.mjs`（纯词法+递归下降，不执行第三方代码）。原始解码结果 `_harvest/keymap-full.tsv`。
**本表已机器核验**：`node _harvest/check-keyboard.mjs` 把本文件所有大写 id 行与解码输出逐格比对，当前 83 行完全一致、0 处实质差异（余 2 行仅因 markdown 表格里的 `\\` 转义被比对脚本剥掉）。改了表就跑这条命令。

> 本表推翻了此前的采集结论"bundle 内无 ⌘ 字形串，快捷键需逐条 pressKey 验证"——见文末「采集方法更正」。

## 机制（决定"怎么算按对"）

- 每个快捷键是一个描述符 `{metaKey, ctrlKey, altKey, shiftKey, keyCondition[, winMatcher]}`。
- **平台切换**：`bae(d) = isMac ? d : (d.winMatcher ?? d)`。Windows 上没有 `winMatcher` 的描述符沿用 Mac 值（⇧/⌥/裸键两侧一致；带 ⌘ 的才需要 winMatcher）。
- **keyCondition 三种匹配**（决定键盘布局兼容性）：
  | 构造 | 匹配依据 | 含义 |
  |---|---|---|
  | `Oo("b")` letter | `event.key` 单字母 | 跟随布局（Dvorak 上按物理 U 也触发 b） |
  | `Vr("Digit1")` code | `event.code` 物理键位 | **不跟随布局**；数字与方向键、`Backslash`、`Minus`、`Comma` 走这条 |
  | `q7("/")` key | `event.key` 字符 | 标点类（`/` 命令菜单、`.` 专注模式） |
- **`Vn(k)` vs `mo(k)`**：前者只约束按键、**不管修饰键**（弹层里 Esc/Backspace 常这样放行）；后者显式要求四个修饰键全 false。差别在"⌘Esc 会不会也被吃掉"。
- **`QM(d)`**：把 `winMatcher.keyCondition` 换成永假函数 → **Mac 专用快捷键**。
- 显示串：`Cae()` 按 meta→ctrl→alt→shift→key 顺序拼，**Mac 用空格分隔**（`⌘ ⇧ K`），**Windows 用 `-`**（`Ctrl-Shift-K`）。标签：⌘/⌃/⌥/⇧ ↔ Win/Ctrl/Alt/Shift。

## 表 A · 文本样式与格式（块级）

| id | macOS | Windows | 官方中文 |
|---|---|---|---|
| TITLE | ⌘ ⌥ 1 | Ctrl-Shift-1 | 标题 |
| SUBTITLE | ⌘ ⌥ 2 | Ctrl-Shift-2 | 副标题 |
| HEADING | ⌘ ⌥ 3 | Ctrl-Shift-3 | 标题 |
| STRONG | ⌘ ⌥ 4 | Ctrl-Shift-4 | 强调 |
| BODY | ⌘ ⌥ 5 | Ctrl-Shift-5 | 正文 |
| PAGE | ⌘ ⇧ P | Ctrl-Shift-P | 页面 |
| CARD | ⌘ ⇧ L | Ctrl-Shift-L | 卡片 |
| TODO_LIST | ⌘ ⌥ 6 | Ctrl-Shift-6 | 待办 |
| TOGGLE_LIST | ⌘ ⌥ 7 | Ctrl-Shift-7 | 列表 |
| BULLET_LIST | ⌘ ⌥ 8 | Ctrl-Shift-8 | 项目符号 |
| NUMBERED_LIST | ⌘ ⌥ 9 | Ctrl-Shift-9 | 编号 |
| NO_LIST | ⌘ ⌥ 0 | **Ctrl-Shift-`** | 无列表 |
| BOLD | ⌘ B | Ctrl-B | 加粗 |
| ITALIC | ⌘ I | Ctrl-I | 斜体 |
| STRIKETHROUGH | ⌘ ⇧ - | Ctrl-Shift-- | 删除线 |
| HIGHLIGHT | ⌘ ⇧ B | Ctrl-Shift-B | 高亮 |
| CODE | ⌘ ⇧ C | Ctrl-Shift-C | 代码 |
| CODE2 | ⌘ E | Ctrl-E | 行内代码（另一条通路） |
| INLINE_TEX | ⌘ ⇧ E | Ctrl-Shift-E | 行内公式 |
| URL | ⌘ K | Ctrl-K | 链接 |
| BLOCKLINK | ⌘ ⇧ K | Ctrl-Shift-K | 区块链接 |
| FOCUS_DECOR | ⌘ ⇧ \\ | Ctrl-Shift-\\ | 聚焦装饰 |
| BLOCK_DECOR | ⌘ ⇧ ' | Ctrl-Shift-' | 区块装饰 |
| GROUP | ⌘ G | Ctrl-G | 组合 |
| UNGROUP | ⌘ ⇧ G | Ctrl-Shift-G | 取消组合 |
| TOGGLE_TOGGLES | ⌘ ⌥ T | Ctrl-Alt-T | 展开/折叠全部折叠块 |

数字档 **1–9 与 0 是一条连续的"样式槽"设计**（1 标题 → 9 编号 → 0 无列表），Windows 上因 Shift 取代 Alt 而整体位移，`NO_LIST` 甚至换到了反引号。

## 表 B · 块操作、查找、导航（文档内）

| id | macOS | Windows | 官方中文 |
|---|---|---|---|
| EDIT_BLOCK | ⏎ | ⏎ | 编辑区块 |
| INSERT_AFTER | space | space | 在后方插入 |
| INSERT_BEFORE | ⇧ space | Shift-space | 在前方插入 |
| DUPLICATE | ⌘ D | Ctrl-D | 创建副本 |
| RENAME | ⇧ ⏎ | Shift-⏎ | ★ 编辑页面区块（面板源 key `commands.edit.block.page`；本列旧值"重命名"**在语言包里查无对应 key**，是本地按 id 名反推 ⇒ gap G750） |
| INDENT | ⇥ | ⇥ | 缩进 |
| DEINDENT | ⇧ ⇥ | Shift-⇥ | 减少缩进 |
| MOVE_BLOCK_UP | ⌥ ↑ | Alt-↑ | 区块上移 |
| MOVE_BLOCK_DOWN | ⌥ ↓ | Alt-↓ | 区块下移 |
| MOVE_BLOCK_TOP | ⌥ ↖ | Alt-↖ | 区块移至顶部 |
| MOVE_BLOCK_BOTTOM | ⌥ ↘ | Alt-↘ | 区块移至底部 |
| MOVE_BLOCK_TOP_MAC | ⌘ ⌥ ↑ | Ctrl-Shift-↑ | 同上（Mac 变体） |
| MOVE_BLOCK_BOTTOM_MAC | ⌘ ⌥ ↓ | Ctrl-Shift-↓ | 同上（Mac 变体） |
| SELECT_TO_TOP_COMMON | ⌘ ⇧ ↖ | Ctrl-Shift-↖ | 选至顶部 |
| SELECT_TO_BOTTOM_COMMON | ⌘ ⇧ ↘ | Ctrl-Shift-↘ | 选至底部 |
| SELECT_TO_TOP_MAC | ⌘ ⇧ ↑ | Ctrl-Shift-↑ | 选至顶部（Mac 变体） |
| SELECT_TO_BOTTOM_MAC | ⌘ ⇧ ↓ | Ctrl-Shift-↓ | 选至底部（Mac 变体） |
| NAVIGATE_INTO | ⌘ → | Ctrl-→ | 进入 |
| NAVIGATE_OUT | ⌘ ← | Ctrl-← | 退出 |
| SELECT_ALL | ⌘ A | Ctrl-A | 全选 |
| CANCEL | esc | esc | 取消 |
| UNDO | ⌘ Z | Ctrl-Z | 撤销 |
| REDO | ⌘ ⇧ Z | Ctrl-Shift-Z | 重做 |
| FIND_IN_PAGE | ⌘ F | Ctrl-F | 页内查找 |
| FIND_NEXT | ⌘ G | Ctrl-G | 查找下一个 |
| REPLACE_IN_PAGE | ⌘ ⇧ F | Ctrl-Shift-F | 查找与替换 |
| FIND_PREVIOUS | ⌘ ⇧ G | Ctrl-Shift-G | 查找上一个 |
| CMD_MENU | / | / | 命令菜单（裸斜杠，无需修饰键） |

`*_MAC` 与 `*_COMMON` 成对存在 ⇒ **同一语义两组键位并存**（`⌥↖` 与 `⌘⌥↑` 都能把区块移到顶部），本地实现若只做一组会表现为"官方能用我这里没反应"。

## 表 C · 外壳 / 全局

| id | macOS | Windows | 官方中文 |
|---|---|---|---|
| TOGGLE_LEFT_SIDEBAR | ⌘ \\ | Ctrl-\\ | 切换侧栏 |
| TOGGLE_FOCUS_MODE | ⌘ . | Ctrl-. | 专注模式 |
| TOGGLE_KEY_SHORTCUTS | ⌘ ⌥ , | Ctrl-Shift-, | 显示快捷键 |
| TOGGLE_QUICK_OPEN | ⌘ O | Ctrl-O | 快速打开 |
| TOGGLE_QUICK_OPEN_ALT | ⌘ P | Ctrl-P | 快速打开（变体） |
| TOGGLE_QUICK_OPEN_LEGACY | ⌘ K | Ctrl-K | 快速打开（旧版；★ **不在面板源里** ⇒ 面板永不展示，非"采集漏项" ⇒ gap G746） |
| TOGGLE_QUICK_OPEN_SAFARI | ⌘ ⇧ O | Ctrl-Shift-O | 快速打开（★ 仅 Safari 的面板会印：源里写成 `Hd ? [SAFARI, ALT] : [QUICK_OPEN, ALT]` ⇒ gap G746） |
| TOGGLE_ASSISTANT | ⌘ ⏎ | Ctrl-⏎ | AI 助手 |
| OPEN_DAILY_NOTE | ⌘ ⌥ N | Ctrl-Alt-N | 打开每日笔记 |
| COMMENT | ⌘ ⇧ M | Ctrl-Shift-M | 添加评论 |

`TOGGLE_QUICK_OPEN*` 四个 id 并存 = **同一功能四套键位在灰度/浏览器兼容分支间切换**（Safari 保留 ⌘⇧O，⌘K 标 legacy）。⌘K 同时是 `URL` 与 `TOGGLE_QUICK_OPEN_LEGACY` ⇒ **键位按上下文（是否处于编辑器内的文本选区）分派**，不是全局唯一表。

## 表 D · 任务视图 / 合集（`ho`，23 项）

| id | macOS | Windows | 语义 |
|---|---|---|---|
| PREV_TASK / NEXT_TASK | ↑ / ↓ | ↑ / ↓ | 任务间移动（`shiftKey: void 0` = 不区分 Shift） |
| EDIT_START | ⏎ | ⏎ | 开始编辑 |
| TOGGLE_STATE / CREATE_NEW | space | space | 勾选完成 / 新建（同一物理键，按焦点位置分派） |
| TOGGLE_DONE | ⌘ ⌥ T | Ctrl-Alt-T | 标记完成 |
| TOGGLE_DONE_SLASH | ⌘ / | Ctrl-/ | 标记完成（另一通路） |
| SET_CANCELLED | ⌘ ⌥ ⇧ T | Ctrl-Alt-Shift-T | 标记取消 |
| SET_CANCELLED_SLASH | ⌘ ⌥ / | **Mac 专用**（QM 屏蔽 Windows） | 标记取消 |
| SCHEDULE_FOR_TODAY | ⌘ ⌥ ⇧ S | Ctrl-Alt-S | 安排到今天 |
| OPEN_SCHEDULE_DATEPICKER | ⌘ ⇧ S | Ctrl-Shift-S | 打开日程选择器 |
| OPEN_DEADLINE_DATEPICKER | ⌘ ⇧ D | Ctrl-Shift-D | 打开截止日期选择器 |
| REMIND_IN_ONE_HOUR | ⌘ ⌥ ⇧ R | Ctrl-Alt-R | 一小时后提醒 |
| OPEN_TASK_LOCATION | ⌘ ⇧ O | Ctrl-Shift-O | 跳到任务出处 |
| OPEN_NEW_TASK_POPUP | ⌘ J | Ctrl-J | 新建任务弹窗 |
| OPEN_PAGE | ⌘ → | Ctrl-→ | 打开页面 |
| SECTION_TOGGLE_COLLAPS | space | space | 分组折叠切换 |
| SECTION_COLLAPSE / SECTION_EXPAND | ← / → | ← / → | 分组折叠/展开 |
| DELETE / DELETE_FORWARD | ⌫ / del | ⌫ / del | 删除（两个方向） |
| UNDO / REDO | ⌘ Z / ⌘ ⇧ Z | Ctrl-Z / Ctrl-Shift-Z | 与文档共用 |

任务视图**自带一套独立的 undo/redo**，与表 B 同键位不同 store。

★★ 本表末列（Windows 串）**本轮起有注册表级出处**（`ho` 的工厂归属，见 §十三）：`TOGGLE_DONE=YM`→`Ctrl-Alt-T`、`TOGGLE_DONE_SLASH=yae("/")`→`Ctrl-/`、`SET_CANCELLED=lEe`→`Ctrl-Alt-Shift-T`、`SET_CANCELLED_SLASH=QM(zr(code Slash))`→**Windows 无**、`REMIND_IN_ONE_HOUR=JI`→`Ctrl-Alt-R`，与第 81 批屏上串逐条吻合。
★ 另需注意：`SECTION_TOGGLE_COLLAPS`／`SECTION_COLLAPSE`／`SECTION_EXPAND` 与 `TOGGLE_STATE`／`CREATE_NEW` 用的是 **`Vn`（只写键条件、四个修饰字段一概不写）** ⇒ 在任务视图里 `space`／`←`／`→` **在任何修饰组合下都命中**（正文同类键用 `mo` 精确匹配），本地若把修饰键写成"必须为假"就与官方不同（gap G749）。

## 表 E · 表格（`hnt`，15 项）

| id | macOS | Windows | 官方中文 |
|---|---|---|---|
| CUT / COPY / PASTE | ⌘ X / ⌘ C / ⌘ V | Ctrl-X/C/V | 剪切/复制/粘贴 |
| CLEAR_CELL_CONTENTS | ⌫ | ⌫ | 清除单元格内容 |
| ADD_ROWS_BEFORE | ⌘ ⌥ ⏎ | Ctrl-Shift-⏎ | 在前面添加行 |
| ADD_ROWS_AFTER | ⌘ ⏎ | Ctrl-⏎ | 添加行 |
| ADD_COLUMNS_BEFORE | ⌘ ⌥ ⇧ ⏎ | Ctrl-Alt-⏎ | 在前面添加列 |
| ADD_COLUMNS_AFTER | ⌘ ⇧ ⏎ | Ctrl-Shift-⏎ | 添加列 |
| MOVE_ROWS_UP / DOWN | ⌥ ↑ / ⌥ ↓ | Alt-↑ / Alt-↓ | 移动行 |
| MOVE_COLUMNS_LEFT / RIGHT | ⌥ ← / ⌥ → | Alt-← / Alt-→ | 移动列 |
| DELETE_ROWS | ⌘ ⌫ | Ctrl-⌫ | 删除行 |
| DELETE_COLUMNS | ⌘ ⇧ ⌫ | Ctrl-Shift-⌫ | 删除列 |
| ADD_CONTENT | ⌃ [ | Ctrl-[ | 添加内容 |

行/列操作与表 B 的块移动**共用 ⌥+方向键**，靠上下文区分"当前在表格内"。

★★ **Windows 塌键（第 82 批·下半 B/C 结案，见 gap G742／G748 与 `internals.md` §二十七）**：`ADD_ROWS_BEFORE`（`zr`）与 `ADD_COLUMNS_AFTER`（`ci`）的 Windows 匹配式逐字段相同，而表格式键表里 `ci` 那条**注册在前** ⇒ 本表这两行的 Windows 列**不能按字面实现**：`Ctrl-Shift-Enter` 实际只派发到"添加列"，"在前面添加行"在该平台键盘不可达。另 `ot` 里还并存 `ADD_TABLE_COLUMN:ci(oo)`（同串、同语义）⇒ 两条候选都叫"添加列"，结论一致。

## 分派机制（`matcher`/`handler` 列表 —— 决定"同键不同结果"）

360 条绑定全部是这个形状：`Gn([{matcher: <描述符>, handler: fn}, …])`，即**每个上下文注册一条有序列表，自上而下第一个匹配的 handler 吃掉事件**。所以官方行为里有三类本地难以复现的性质：

1. **同一物理组合按上下文落到不同 handler**：`⌘K` 在编辑器选区内是 `URL`，在外壳是 `TOGGLE_QUICK_OPEN_LEGACY`；`⌥↑↓` 在正文是跨块移光标、在表格内是移动行。**没有"全局快捷键表"这回事**，本地若用一张扁平 map 必然互相抢键。
2. **`mo(k)` 与 `Vn(k)` 的差别在真实分派里起作用**：表格内 `Esc` 用 `mo(qs)`（精确无修饰）⇒ `⌘Esc` 不会被表格吃掉；`Backspace`/`Delete` 同理。
3. **一个 handler 内部还有二级分支**（实测样本）：
   - 表格内 `Esc`：若当前是"单元格扩选"，先把选区收回到焦点格；否则才离开表格。⇒ **Esc 的粒度是"退一层"，不是"关面板"**（与 V3 动态观测"Escape 关不掉弹层"是同一套哲学的两个面）。
   - `Tab`（`mo(f1)`）在表格内 = 单元格间移动，在正文 = `INDENT`。
   - `↓`（`mo(ms)`）、`Shift+↓`（`qi(ms)`）、`⇧⌥↓`（`eT(ms)`）是三个不同 handler：移动 / 扩选 / 跨块扩选。
   - `⌥↑`（`y2(Ts)`）带选项 `{skipDirection:"prev", shouldSkipFromEdgeOfBlock:!0}` ⇒ **块首按上会跳到上一块末尾、块尾按下会跳到下一块开头**（边缘跳过是显式开关，不是默认行为）。

> 逐条 handler 到命令名的映射需要作用域分析（handler 全是压缩后的短标识符，`matcher` 对象内不含 `name`/`id`），静态性价比低。官方快捷键面板（`Ctrl-Shift+,`）一次就能拿全，留作动态项。

## 平台不对称（本地必须显式建模，否则 Windows 用户全废）

| 构造 | macOS | Windows | 备注 |
|---|---|---|---|
| `Co` | ⌘ | Ctrl | 常规 |
| `ci` | ⌘ ⇧ | Ctrl-Shift | 常规 |
| `zr` | ⌘ ⌥ | **Ctrl-Shift** | Windows 用 Shift 顶替 Alt |
| `YM` | ⌘ ⌥ | Ctrl-Alt | 与 `zr` 同 Mac 串、不同 Win 串 |
| `JI` | ⌘ ⇧ ⌥ | **Ctrl-Alt** | Windows 少一个 Shift |
| `lEe` | ⌘ ⇧ ⌥ | Ctrl-Alt-Shift | |
| `eT` | ⇧ ⌥ | Shift-Alt | |
| `iEe` | ⌃ | Ctrl | 两侧一致 |
| `yae(c)` | ⌘ c | Ctrl-c | 仅非字母单字符 |
| `QM(d)` | 生效 | **禁用** | Mac 专用 |

推论：**本地若用一套 `Mod+Shift+Alt+K` 字符串描述键位，就无法表达 Craft 的键位表**（`zr` 与 `YM` 在 Mac 上完全相同、Windows 上不同）。需要 `{mac, win}` 双描述符。

## 运行时绑定与焦点栈抢占（`✓` 本批由 445 站点重测并解出机制）

机制不是"全局监听 + 判断焦点在哪个元素"，而是**焦点栈注册**：

```js
pushIntoFocus({ id: <上下文id>, keyDefs: [{ matcher, handler }], allowPropagation })
removeFromFocus(id)                                  // 卸载时注销
srt(t) => Rn(t,"matcher") ? {matcher:t.matcher, handler:t.callback}
                            : {matcher:Vn(t.key),  handler:t.callback}   // 归一化器
```

⇒ **谁在栈顶谁先吃键**，`allowPropagation` 决定是否把事件继续交给下层。全库显式出现 **115 次（true 51 / false 64）** ⇒ 约 44% 的上下文选择"放行给下层"，不是清一色独占。
⇒ 组件 API 允许调用方给"键名"或给"自定义 matcher"两种形态（`srt` 归一化）⇒ **本地若只支持键名字符串，就无法表达条件型绑定**。

### 具名上下文清单（13 个用字面量 id 注册，可直接解码）

机读表 `_harvest/kbd-contexts.tsv`（脚本 `kbd-contexts.mjs`）。解码依据：`Vn`=裸键、`Co`=⌘/Ctrl、`KEYCONST`（`qs`=Escape `oo`=Enter `nc`=Backspace `ms/Ts/Vl/Il`=↑↓←→）。

| 上下文 id | 模块 | 键数 | 解码后的键集 / 结论 |
|---|---|---|---|
| `inlinemenu` | index | 7 | ↑ ↓ ← → + Backspace + Enter + Escape ⇒ **内联菜单的完整导航八件套** |
| **`PresentationModeToolbar`** | DocumentContainer | 10 | 四方向键 + **`N.TOGGLE_ASSISTANT` / `N.TOGGLE_QUICK_OPEN` / `N.TOGGLE_FOCUS_MODE` / `N.TOGGLE_QUICK_OPEN_SAFARI`** ⇒ 演示模式内可唤出助手/快速打开/专注模式，且**有 Safari 专用命令变体** |
| `CodeEditorContextMenuSelector` | CodeEditorWrapper | 4 | 同一修饰器的四个候选项导航（`ae(…)`×4） |
| `WhatsNewPopup` | index | 4 | ← → + Backspace + Escape ⇒ **新功能弹窗支持左右翻页** |
| `SpaceModal` / `emojimenu` | index | 3 | ↑ ↓ Enter ⇒ 列表型弹层的标准三件组，两处一致 |
| `ConfirmPopupDS` / `DeleteCommentConfirmationPopup` | index | 2 | Enter + Escape ⇒ **确认弹窗默认 Enter 确认 / Esc 取消**，且评论删除确认是独立上下文 |
| `CollectionQuickSearchInput` | index | 2 | **`Co(Oo("a"))` + Enter** ⇒ 集合快搜里 ⌘A/Ctrl-A 被**重新绑定**（不是全选）；同时证明 `Oo("a")` 是**按字符**构造器 |
| `HelpButton` | index | 1 | `ot.TOGGLE_KEY_SHORTCUTS` ⇒ 帮助按钮绑的是"显示快捷键"**命令 id**（即 §平台不对称 里那条 `Ctrl-Shift+,`） |
| `BrowseSelectionRubberBandEscape` | index | 1 | **`Vn(q7(L => ref.current && L===qs))`** ⇒ **谓词型 matcher**：只在浏览面正发生橡皮筋框选时吃 Escape（条件读 ref） |
| `CodeEditorContextMenuUpgrade` / `PageCardMixer` | 各自模块 | 1 | `ae(Re)` / `bl(yl)` |
| ★ `TasksRepeatConfigCustomPicker` | `DateEditor` chunk（第 71 批补读，**不在 `kbd-contexts.mjs` 的 445 站点样本里**） | 2 | `zd(name, bindings)` 只注册**两条**：`oo`=Enter（回调被提交门控 `L` 把关 ⇒ **灰按钮 ⇔ Enter 无效**）＋ `qs`=Escape（三级降级：子菜单 → 提醒菜单 → 整面板）。⇒ ★ 与 `ConfirmPopupDS` 同型（Enter/Esc 二件组），但**多一层"门控值同时驱动按钮禁用与键位有效性"**——本地若只禁用按钮而键位不查门控，就会造出官方没有的"键盘提交非法配置"通路 |

★ **注册 API 分两类，别混记**（第 72 批自纠）：`zd(name, bindings)` ＝**键位作用域**注册；`$i(name, onClose)` 与 `cY(name, onClose, {isDisabled})` ＝**具名弹层**注册（后者带"禁用而不卸载"的入参）。⇒ 已见名：键位作用域 `TasksRepeatConfigCustomPicker`；具名弹层 `TasksReminderPicker`（@5417600）、`collection-v2-date-editor`（V54 §7）。

三条可移植结论：① **弹层类上下文一律自带 Enter/Escape（+方向键）**，本地只挂一个 Esc 就少一层；② **命令与键位是两张表**（`N.*` / `ot.*` 是命令 id 枚举，同一命令可在多上下文被绑定），本地现在把两者混在编辑器扩展里；③ 存在**按运行时状态瞬时成立的上下文**（框选 Escape），这类静态键表穷举不到，只能动态验。

### 模块级归属（哪些功能自带快捷键子上下文）

`matcher:` 站点全库 **445 处**（此前记"360 条"是只扫了 `index` 的样本窗口，**作废**），分布 12 个模块：`index` 362（81%）、`FloatingThreadWindow` 19、`AIChatPopup` 18、`DocumentContainer` 10、`TaskViews` 9、`FormulaInput` 8、`CodeEditorWrapper` 5、`EasterEgg` 5、`NewTaskPopup` 4、`ExcalidrawFocusMode` 3、`Integration` 1、`PageCardMixer` 1 ⇒ **AI 线程 / AI 弹窗 / 公式输入 / 代码块 / 彩蛋 / 新任务弹窗 / 白板全屏 都是独立的按键上下文**。
编辑器扩展选择侧：`⌘ ↑/↓`、`⌘ ⇧ ↑/↓`、`⌥ ⇧ ↑/↓`、`⇧ space`。
绝大多数站点**没有 i18n 标签**（`matcher` 是纯分派键），键→人名须靠命令目录（`commands-catalog.md` 189 条）交叉，不能靠绑定表本身。
**残留**：44 个 `pushIntoFocus` 站点里 31 个的 `id` 是压缩变量名，解码需完整别名追踪，故 `allowPropagation` 的逐上下文取值未全。⇒ **"matcher 作用域归属"从动态队列移除**（已结案到模块粒度 + 13 具名上下文，★ 第 71 批又从 `DateEditor` chunk 补到 14 个：`TasksRepeatConfigCustomPicker`），动态只剩谓词型上下文与彩蛋 5 键的实际内容。


## 官方快捷键面板的分组（来自 i18n，说明官方怎么归类）

`commands.shortcuts.keyboard.general`=通用 · `commands.shortcuts.keyboard.editing`=编辑 · `commands.shortcuts.in.tables`=在表格中 · `commands.shortcuts.in.tasks.views`=在任务视图中 · `commands.shortcuts.in.collections`=在合集中 · `commands.shortcuts.in.find.and.replace`=在查找和替换中 · `tasks.global.shortcuts`=全局快捷键 · `preferences.keyboard.shortcuts`=快捷键（设置里独立一栏） · `commands.open.shortcuts`=查看所有快捷键。另 `commans.exit.focus.mode.shortcut`=`退出专注模式 • [0]` —— **占位符 `[0]` 由运行时注入键位串**，即面板文案模板本身不含键位。

## 本地实现 gap

| 项 | 现状 | 需要 |
|---|---|---|
| 中央键位表 | **不存在**。全仓库只有三处键盘绑定：`src/components/editor/Editor.tsx:510`（⌘/Ctrl+S 保存）、`src/components/search/CommandPalette.tsx:33`（⌘/Ctrl+K 面板）、`src/components/editor/extensions/font-size.ts:67-77`（`addKeyboardShortcuts` 四条字号档），其余靠 TipTap StarterKit 默认（⌘B/⌘I/⌘⇧Z/⌘Z/⌘⇧X）；`markdown-shortcuts.ts` 是输入规则不是快捷键 | 建 `{mac,win}` 双描述符的 keymap 层，覆盖表 A–E |
| ⌘S | 我方自造，**官方两个枚举里都没有保存快捷键**（Craft 自动保存） | 要么删掉，要么在 `gap.md` 记为有意偏差 |
| ⌘K 语义 | 本地 = 命令面板；官方 = `URL`（编辑器内）∪ `TOGGLE_QUICK_OPEN_LEGACY`（外壳） | 需按上下文分派，不能全局抢键 |
| 查找与替换 | 无 | ⌘F/⌘G/⌘⇧F/⌘⇧G（表 B）—— 与 `panels.md` 的查找替换面板同一件事 |
| 专注模式 / 侧栏 / 快捷键面板 | 无 | ⌘. / ⌘\\ / ⌘⌥, |
| 任务视图键位 | 无 | 表 D 整表，含 Mac-only 的 `SET_CANCELLED_SLASH` |
| 表格键位 | 无（只有 `TableToolbar` 鼠标入口） | 表 E 整表，含 ⌃[ 添加内容 |
| 样式槽 1–9/0 | 无 | 表 A 的连续数字档，注意 Windows 端 `NO_LIST` 落到反引号 |

## 采集方法更正（重要，防止下个会话再犯）

`_harvest/js/*.js` 里所有非 ASCII 字符都被 **UTF-8 → CP936 误解码**污染：`⌘`(U+2318, `E2 8C 98`) 变成 `鈱`(U+9231) + U+FFFD，`↓` `⇧` `⏎` `←` 同理。因此：

1. 之前记录的"bundle 里没有 ⌘ 字形串 ⇒ 快捷键只能运行时逐条 pressKey 验证"**是采集假象，不是官方事实**，本文件已推翻。
2. **`tabs.content({contentType:'text'})` 对 JS 资源的文本解码不安全**。同一通道取回的 `zh-Hans.json` 中文完好（服务端带 `charset=utf-8`），JS 资源则按本地代码页解码。
3. 校验办法（下次采集必做一步）：取回后立刻在 node 里打印目标字符的码点数组，例如 `[...s.slice(i,i+40)].map(c=>c.codePointAt(0).toString(16))`；出现 `9231 fffd` / `7321 fffd` 这类"两个字符替一个"的模式即为转码损坏。
4. 损坏是**可逆推断**的：结构（标识符、`keyCondition`、修饰键布尔）全在 ASCII 区，本文件即据此重建；但**不能**把这些 bundle 里的任何非 ASCII 文本当证据使用。
5. ★★ **`_harvest/check-keyboard.mjs` 报的两处 DIFF 是仪器伪差异，不要"顺手规范化"**：该脚本在比对前会把 md 单元里的反斜杠**全部剥掉**，所以 `FOCUS_DECOR`（keyboard.md:47）与 `TOGGLE_LEFT_SIDEBAR`（keyboard.md:94）无论写成双反斜杠还是单反斜杠，都恒报 `md[…Ctrl-Shift-]` 对 `tsv[…Ctrl-Shift-\]`。第 83 批·上半的屏上证据已复核：官方面板**确实**印 `切换左侧边栏 = Ctrl` 加一枚反斜杠键帽、`焦点 = Ctrl Shift` 加一枚反斜杠键帽（见 `_harvest/b83-panel-tab-tongyuan.parsed.txt` 与 `_harvest/b83-panel-tab-yangshi.parsed.txt`）⇒ **表里的值是对的、仪器是错的**。单元里保留双反斜杠是刻意的（避免单元内出现"反斜杠紧邻竖线"断表；`check-tables.mjs` 对两种写法都判 CONSISTENT）。要消掉这两处只能改脚本的剥字符逻辑，**不要改正文**。

## 八、第二方交叉验证源：信息页「动作」子页签印出的键位（V26 ✓ 2026-09-27 实屏）

官方在**文档右侧栏 →「信息」→「动作」子页签**里，把 12 条页面/块操作连同**渲染后的键位字形**一起列出来（不需要快捷键面板）。实测清单：

| 面板项 | 印出的键位 | 对应命令 id（本文件已解出） | 交叉结论 |
|---|---|---|---|
| 在页面中查找 | — | `FIND_IN_PAGE:Co(Oo("f"))` | 面板无字形 ⇒ 该命令的键位**只在编辑器上下文栈里生效**，面板不展示 |
| 快速开启 | — | `QUICK_OPEN` 族（4 变体） | 同上；与 ⌘K 实测行为一致（V1/V6） |
| 添加评论 | — | `COMMENT` | 本行旧结论作废：★★ 官方**有**默认快捷键。第 81 批面板「编辑」分类印出 `添加或查看评论 = CtrlShiftM`，且 表C 早已把 `COMMENT` 记为 `⌘ ⇧ M / Ctrl-Shift-M` ⇒ 「动作」子页签不印字形只代表**该子页签不展示**，不代表无绑定（§十二 要点 1 同源） |
| 向上移动 | `Alt-↑` | `MOVE_BLOCK_UP` | **Alt 修饰 + 方向键**，与本文件"方向键族用 Alt"的解码一致 ✓ |
| 向下移动 | `Alt-↓` | `MOVE_BLOCK_DOWN` | ✓ |
| 移动到顶部 | `Alt-⤒` | `MOVE_BLOCK_TOP`（+ `_MAC` 变体） | ✓ 字形 ⤒ = Up 的"到顶"变体 |
| 移动到底部 | `Alt-⤓` | `MOVE_BLOCK_BOTTOM`（+ `_MAC` 变体） | ✓ |
| 组合 / 取消组合 | `⌘ G` / `⌘ ⇧ G` | `GROUP` / `UNGROUP` | ★★ **本行旧结论已作废**（旧写「无字形 ⇒ 分组没有默认快捷键」）：第 81 批经**点击通路**唤出官方快捷键面板，「整理」分类**印出了** `组合 = CtrlG`、`取消组合 = CtrlShiftG` ⇒ 键位确实存在，与本文 表A `GROUP`/`UNGROUP` 两行一致；当时的"无字形"只因**信息页动作子页签不印**，不能外推成"官方无此键"（gap **G725**） |
| 重命名 | `Shift-⏎` | `RENAME` | ✓ 新解出的字形 |
| 创建副本 | `⌘ D`（Win `Ctrl-D`） | `DUPLICATE` 族 | ★ 第 81 批面板「编辑」分类**印出** `创建副本 CtrlD`（旧写"面板不印"是当时面板唤不出所致）；★ 同键在「合集」分类里另作 `复制行` ⇒ 上下文分派 |
| 删除 | `⌫` | 删除块 = Backspace | ✓ 与 Slate 默认 `Backspace` 合并语义并存 |

**两点要保留的谨慎**：① 这个面板的语境是**当前页面**，所以"向上移动"到底是"移动块"还是"移动本页在树中的位置"，本表按命令 id 对应到 `MOVE_BLOCK_*`，**未做二次区分**（要区分需在多块文档里选中不同层级再点）；② 面板只印**有键的项**，"没印"不等于"官方没有键"，也可能是该上下文未激活。

## 九、屏上可得性台账（动态核验，第 67–68 批，2026-09-28）

本表只记"**在真屏幕上按过、且用 `domSnapshot().length` 逐字节判过**"的键位，用来把"解码得到"与"屏幕可得"分开。判据一律是 DOM 增量与新增文本，不用截图字节。

| 键位（Windows 拼法） | 对应 id | 屏幕语境 | 实测结果 | 判定 |
|---|---|---|---|---|
| `Enter` | — | 编辑器非空块内 | `150,894→152,883`（+1,989 B，新增一个块行） | ✓ 生效 |
| `Tab` / `Shift+Tab` | 缩进档 | 编辑器块内 | 每档净增/净减**一个** `--indent-w: 28px` 占位 div（`−62 B`）；★ **Shift+Tab 不带动缩进子树** | ✓ 生效（V50 D） |
| `Backspace`（块首） | 合并/退档 | 编辑器 offset 0 | **四档分派**：合并 −386 / 退缩进 −62 / 删空前块 −1,989 / 首块 0 | ✓ 生效（V51 C） |
| `Shift+Enter` | `HARD_BREAK` 族 | 编辑器块内 | 两块两次**逐字节相同**（`150,894→150,894`、`152,940→152,940`），`<br>` 恒 0；同 cell 改按纯 `Enter` 立刻 +1,989 作通路对照 | ✓ **确认无效**（官方显式不拦截，V50 E） |
| `Ctrl+A` → `Delete` | 全选/删除 | 编辑器 | 全选让 DOM 净增 `+14,159 B`（但 `data-selected`/`aria-selected` 计数 0）；删除 1 次 `Ctrl+Z` 精确复原 | ✓ 生效（V50 A） |
| `Ctrl+Z` | `UNDO` | 编辑器 | 连续 15 步 `176,535 … 155,047`，**块级一步退一整块、打字按字符入栈** | ✓ 生效（V50 A） |
| `Ctrl-Shift-7` | `TOGGLE_LIST`（列表） | 编辑器**非空块** | `174,482→174,482`、diff `−0 +0` | ~ **本语境未生效**（≠ 官方没有该能力，见下"未试清单"） |
| `Control+Shift+,` | `TOGGLE_KEY_SHORTCUTS` | **「所有文档」浏览屏** | `130,826→130,826`（`ax.pressKey` 返回 OK） | ~ 浏览屏不生效；与 V7"面板 web 端不可得"同向（★ 编辑器屏本批未重跑） |
| `-` + `Space` | markdown 简写建列表 | 编辑器空块 | `ax.pressKey` 逐字节零增量（⇒ **`ax.pressKey` 不投递可打印字符**）；`cua.type('- ')` 字符进了文档但**不转换** | ~ 两条通路都不触发（G617） |

### 未试清单（下一批的最低成本靶子，按能解锁的价值排序）

★ **表 A 的列表家族只试过 `Ctrl-Shift-7` 一条**：`TODO_LIST=Ctrl-Shift-6`、`BULLET_LIST=Ctrl-Shift-8`、`NUMBERED_LIST=Ctrl-Shift-9`、`NO_LIST=Ctrl-Shift-` `` ` `` **全部未在任何屏幕按过**。若 `Ctrl-Shift-8` 能建列表，则同时解锁三件事：G617 结案、**B 的"列表档"可测**（V50 只证到缩进档）、**`G579` 的"Enter 与 Backspace 退档顺序相反"可判**。
表 B 的 `FIND`/`REPLACE`、表 D（任务视图 23 项）、表 E（表格 15 项）**一条都没在屏幕上按过** ⇒ 这三张表目前全是契约级证据。
`Alt-↑/↓`（`MOVE_BLOCK_UP/DOWN`，V26 的第二方对照已印出字形）未做屏上验证——它同时能回答"**移动块算几步撤销**"（A 项遗留）。

## 十、第 74 批补账：新任务弹窗的**命令 id ↔ 动作**映射 ＋ 弹窗内也绑 `UNDO`（静态，`NewTaskPopup-Br4pt8ap.js` @4959）

逐字形状：`const le = t.useMemo(() => [{matcher: xe(et), callback: () => (x(), {preventDefault:!0, stopPropagation:!0})}, ...[[C.OPEN_SCHEDULE_DATEPICKER,"openSchedule"], [C.SCHEDULE_FOR_TODAY,"scheduleToday"], [C.OPEN_DEADLINE_DATEPICKER,"openDeadline"], [C.OPEN_TASK_LOCATION,"openLocation"], [C.REMIND_IN_ONE_HOUR,"remindInOneHour"]].map(([e,S]) => ({matcher:e, callback: () => (K.current[S](), {preventDefault:!0, stopPropagation:!0})})), {matcher: C.UNDO, callback: …}], …)`

1. ★ **新任务弹窗自带五个命令 id**（排期弹层／今天排期／截止弹层／任务位置／1 小时后提醒），与表 A/B 里"排期·截止·提醒"三条命令**同一枚举 `C.*`** ⇒ ★ "命令表与键位表是两张表"的又一实例：**同一命令在弹层上下文里被重新绑定一次**（承 §七 的三结论 ②）。
2. ★★ **弹窗里也绑 `C.UNDO`** ⇒ **新建任务界面内可直接撤销**；此前只在编辑器上下文记过撤销键。⇒ 本地"弹层只挂 Enter/Esc"的差距**再加一条**（G646/G648 所在的重复面板只记过 `TasksRepeatConfigCustomPicker` 的 Enter/Esc 三级降级）。
3. ★★★ **`remindInOneHour` 的实现是 `Q.getNewBlockReminder(c, u, F.id, new Date(Date.now()+60*60*1e3), i)`** ⇒ ① 键位动作直连**块提醒工厂**（V57 §3 的 5 参数形状在**另一个 chunk** 里得到第三次印证）；② ★ **"1 小时后"是绝对时刻 `now + 3600000`，不是 96 档 `dateOffset`** ⇒ 提醒的"三套量纲"再添一证（承 §一之四十二／§一之四十四／`rr` 快选档里的 `20min/1hr/3hr`＝同样用 `new Date` 现加）。
4. ★ 每个 callback 一律 `return {preventDefault:!0, stopPropagation:!0}` ⇒ **弹层上下文完全吃键、不外溢**，与 §九"弹层类上下文自带 Enter/Esc＋方向键"同构。
5. ★ 交叉线索（键位无关，只记出处）：块三点菜单项工厂 `Obe`@3878980 的首项是 `{id:"craftAssistant", analyticsId:"assistant", label:_e("assistant.assistant"), tags:["assistant","summarize","translate","continue","writing","ai"], hidden:!1}` ⇒ **菜单项自带搜索标签**；同一工厂入参含 `blockHasReminder / isTaskBlock / hasTaskSchedule / hasTaskDeadline / setBlockTaskScheduleDate` ⇒ **三点菜单直接感任务三时间**（G 项的新入口：不用开日期弹层也可能看到三时间的呈现差）。

### 仍未采到（键位面·第 74 批刷新）

- 首条 `{matcher: xe(et), …}` 里的 `et` 是压缩变量 ⇒ **该键的实际按键未解**（需别名追踪）；`C.UNDO` 在弹窗内的按键与**撤销域**（撤刚建的任务？还是撤编辑器内容？）未证。
- 五个 `C.*` 命令 id 的**平台按键**仍未拿到 ⇒ 需与 `commands-catalog.md`（189 条）交叉的下一轮静态批。
- ★ **屏上可得性仍是 §九 的 9 条**，本批**未新增任何屏上键位证据**（连接器停在 turn 守卫，见 V57 §0）。

## 仍未采到
- **(第 94 批·上半)** `useCompositeRoot` 主 `onKeyDown` 全文与 `isMainOrientationToEndKey` 调用方；`--active-tab-*` 属性全集；§20.13.3 的屏上判据需窗口可见才能复核。

- ★ **屏上可得性只覆盖 9 条键位**（§九）⇒ 表 A/B/C/D/E 合计 100+ 条里 **约 91% 从未在屏幕上按过**；下一批最低成本靶子是 **`Ctrl-Shift-6 / 8 / 9`（待办 / 项目符号 / 编号）**——列表家族只试过 `Ctrl-Shift-7` 一条，试 8 若成立可同时解锁 G617、B 的列表档、`G579` 的顺序差。
- ~~360 条 `matcher:` 站点各自的命令名与生效上下文~~ **已结案**（见 §模块级归属：445 站点 / 12 模块 / 13 具名上下文；剩 31 个变量名 id 需别名追踪）。
- ~~`TOGGLE_KEY_SHORTCUTS`（⌘⌥,）弹出的官方快捷键面板截图~~ **面板本身判定为 web 不可得**（`interactions.md` V7 ✓：两种拼法指纹零变化、无 `<kbd>`、无 dialog、⌘K 不列该命令、注册方 `HelpButton` 不在 web DOM）；**但第二方对照已经拿到，走的是另一条路**：文档「信息」页的**「动作」子页签直接把键位印在菜单项右侧**（V26 ✓，见 §八）。⇒ "拿不到官方面板"不再等于"没有交叉验证源"。
- 键位是否**用户可自定义**：`preferences.keyboard.shortcuts` 说明设置里有"快捷键"一栏，但该项是只读展示还是可改绑未验证。
- 输入法/中文键盘布局下 `Oo` letter 匹配的实际表现（描述符语义已明确，运行时未观测）。

## 十一、官方快捷键面板的屏上全表（✓ 第 81 批 2026-09-28 08:03–08:06，经**点击**通路唤出：帮助菜单 →「快捷键」）

★ 面板**唤不出来的根因是键盘通路，不是官方无此面板**；面板自己就印着 `查看所有快捷键 = Ctrl Shift ,`。唤出与遍历配方见 `interactions.md` **V62**；七段原文（含每段键帽顺序串）已落盘 `_harvest/b81-panel-all.txt`，逐条对账是第 82 批第 1 项（零浏览器预算）。

| 分类（H2） | 段（H3）与键位（Win 显示串） | 键帽数 | 与本文既有表的关系 |
| --- | --- | --- | --- |
| 通用 | 取消 `esc`；查看所有快捷键 `Ctrl Shift ,`；导航：导航到 `Ctrl→`、返回上层 `Ctrl←`、快速开启 `CtrlO 或者 CtrlP`；视图：切换专注模式 `Ctrl.`、切换左侧边栏 `Ctrl\` | 16 | `快速开启` 双绑定 ⇒ ★ **不是新增**：`Ctrl-O` 与 `Ctrl-P` 都已在 表C（keyboard.md:97 的 `TOGGLE_QUICK_OPEN` 与 keyboard.md:98 的 `TOGGLE_QUICK_OPEN_ALT`），面板只是把同一命令的双绑定并置（§十二 要点 1 更正本行旧口径）；`取消=esc` 是全局唯一一条 Esc 记录 |
| 文档 | `每日笔记 CtrlAltN`、`全选 CtrlA`、`选择到顶部 CtrlShift⤒`、`选择到底部 CtrlShift⤓` | 11 | 表C 已有每日笔记；**`选择到顶/底` 两条是新的**（与表D 任务视图的 `⤒⤓` 同字形不同修饰） |
| 任务 | 全局：`新任务 CtrlJ`、`将任务标记为已完成 CtrlAltT 或者 Ctrl/`、`将任务标记为已取消 CtrlAltShiftT`、`计划任务 CtrlShiftS`、`安排到今天 CtrlAltS`、`设定截止日期 CtrlShiftD`；在任务视图中：`编辑任务 ⏎`、`导航至区块 Ctrl→`、`上一个任务 ↑`、`下一个任务 ↓`、`收起分组 ←`、`展开分组 →`、`删除 ⌫ 或者 Delete`、`撤销 CtrlZ`、`重做 CtrlShiftZ` | 34 | ★ 表D 的三条任务时间键位**屏上确认**（计划／今天／截止 = 三个独立入口，见 gap **G727**）；`Ctrl/`（标记完成的第二条通路）与 `CtrlAltShiftT`（取消态）**都已在 表D**（keyboard.md:115、keyboard.md:116）⇒ 属并置而非新增（§十二 要点 1 更正本行旧口径）；任务视图内也绑 `UNDO/REDO` |
| 编辑 | `查找 CtrlF`、`查找和替换 CtrlShiftF`；插入新区块：`在下方 space`、`在上方 Shiftspace`；编辑选择：`编辑文本区块 ⏎`、**`编辑页面区块 Shift⏎`**、`创建副本 CtrlD`、`打开斜线菜单 /`；评论：`添加或查看评论 CtrlShiftM`；在查找和替换中：`查找下一个 CtrlG`、`查找上一个 CtrlShiftG`；其他：`撤销 CtrlZ`、`重做 CtrlShiftZ` | 27 | ★ **`Shift⏎` 在面板叫「编辑页面区块」，表B 的 `RENAME` 显示名是「重命名」** ⇒ 同一物理键两处语义名不同（gap G727 末段）；`space`/`Shift+space` 与表B `INSERT_AFTER/BEFORE` 一致 |
| 样式 | 文本样式：`标题 CtrlShift1`、`副标题 CtrlShift2`、`中标题 CtrlShift3`、`粗 CtrlShift4`、`正文 CtrlShift5`、`页面 CtrlShiftP`、`卡片 CtrlShiftL`；列表：`待办列表 CtrlShift6`（内含标记完成/取消两条重复项）、`折叠列表 CtrlShift7`、`打开/关闭切换 CtrlAltT`、`无序列表 CtrlShift8`、`编号列表 CtrlShift9`、`取消列表格式 CtrlShift\``；装饰：`焦点 CtrlShift\`、`块 CtrlShift'`；缩进：`增加缩进 Tab`、`减少缩进 ShiftTab`；文字格式：`粗体 CtrlB`、`斜体 CtrlI`、`代码 CtrlShiftC 或者 CtrlE`、`删除线 CtrlShift-`、`链接 CtrlK`、`输入方程 CtrlShiftE`、`区块链接 CtrlShiftK`、`高亮 CtrlShiftB` | 80 | ★ **`增加缩进 Tab`/`减少缩进 ShiftTab` 屏上确认**（D 项的键位侧证据，效果侧仍未测）；★ **`打开/关闭切换 CtrlAltT` 与 `将任务标记为已完成 CtrlAltT` 同键** ⇒ 折叠块与任务块共享一个物理键、按块型分派，与表D `TOGGLE_STATE/CREATE_NEW = space` 的"同键按焦点分派"同族 |
| 整理 | 移动所选区块：`向上 Alt↑`、`向下 Alt↓`、`移动到顶部 Alt⤒`、`移动到底部 Alt⤓`；组合与取消组合：`组合 CtrlG`、`取消组合 CtrlShiftG` | 13 | ★ 推翻本文 §八 旧行「分组没有默认快捷键」（已就地更正）；`CtrlG`/`CtrlShiftG` 与表B 的 `FIND_NEXT`/`FIND_PREVIOUS` **同键不同上下文** |
| 合集 | 在表格中：`清除单元格内容 ⌫`、`在前面添加行 CtrlShift⏎`、`添加行 Ctrl⏎`、`在前面添加列 CtrlAlt⏎`、`添加列 CtrlShift⏎`、`向上移动行 Alt↑`、`向下移动行 Alt↓`、`向左移动列 Alt←`、`向右移动列 Alt→`、`删除行 Ctrl⌫`、`删除列 CtrlShift⌫`、`添加内容 Ctrl[`；在合集中：`添加一行 Ctrl⏎ 或者 Shift⏎`、`复制行 CtrlD`、`选择所有行 CtrlA`、`清除单元格值 ⌫`、`删除行 Ctrl⌫` | 38 | ★★ **面板 Windows 串与 表E 的 Mac 字形列对不上**：`在前面添加行`（Mac `⌘⌥⏎` vs Win `Ctrl-Shift-⏎`）、`在前面添加列`（Mac `⌘⌥⇧⏎` vs Win `Ctrl-Alt-⏎`）⇒ 后果是面板里 `在前面添加行` 与 `添加列` 显示为**同一组合**；`添加行`/`添加列` 两侧一致 ⇒ 差异局限在两行，谁在派发未裁定（gap **G726**） |

**结构事实**：分类是**懒渲染**（DOM 里只有当前分类，切标签才重渲染）⇒ "面板只印一次就够"的采集假设不成立，7 类必须逐类切；容器 `DIV._content_hlglt_2._dialog_dm375_1`，键帽组 `SPAN._keys_dm375_124`，单枚 `KBD._key_dm375_124 typography-ui-md-500 no-select`，面板内导航是 `nav[aria-label=快捷键]` ＋ 7 个 `button`（**是 button 不是 tab 角色**）。

**第 83 批·上半 二次复现（✓ 2026-09-28 09:01–09:11，`browser-use` MCP 的 `evaluate_script` ＋ 页内合成点击；本轮新的是机制与通路，不是键位）**：七类按钮文案与顺序、每类分段与键帽串与上表**逐条吻合**（合集 17 行、样式 27 行、任务 15 行、编辑 13 行、通用 7 行、文档 4 行、整理 6 行，分类计数 7／4／15／13／27／6／17 与 §十二 的归并结果逐项相等），原文与解析件已落盘 `_harvest/b83-panel-tab-*.json` 与 `_harvest/b83-panel-tab-*.parsed.txt` ⇒ 第 81 批的屏上串不是采集抖动。★ 本轮新增四条：① **逐类 DOM 长度序列**（`128,349` 基线 → `合集 133,990` → `通用 131,073` → `文档 129,906` → `任务 133,585` → `编辑 132,933` → `样式 138,831` → `整理 130,528` → Esc 后 `128,211`）⇒ 定量证实"分类懒渲染"，且**序列非单调**（切类可以整体变小）；② **`Escape` 只弹一层**——面板关闭后下层帮助菜单**回显**（`opacity:1`、`pointer-events:auto`、rect `482,44 278×204`），本面板自印的 `取消 esc` 由 `~` 升为 ✓；③ **OS 级 `press_key` 并非全废**——它驱动了 `Escape`，只是驱动不了键表注册的 `Ctrl+Shift+,` ⇒ 上表末条"实际生效性仍为 0"的口径不变，但**下一批每条键要先试 `press_key`、失败再用 V63 的合成键兜底**，并标注由哪条通路驱动；④ **帮助菜单六项逐字**（`意见反馈`／`最新特性`／`Web 和 Windows 版最新特性`／`常见问题`／`快捷键`／`Markdown 快捷方式`）⇒「Markdown 快捷方式」是**并列的第二个入口**，不是本面板的一节；★ 尾轮（09:12–09:26）已定其落点＝**站外帮助中心新标签**（`support.craft.do/zh-Hans/write-and-edit/formatting/markdown-shortcuts`，标题「Markdown 快捷键 - Craft Help Center」），应用内**不渲染任何面板**（见 gap **G758**／`interactions.md` **V65**）。☆☆ **同批尾记的判据更正**：上面那条"逐类 DOM 长度序列"**只在同一次页面生命周期内可比** —— 尾轮发现同一张列表屏在零写入条件下会量到 `128,xxx` 与 `181,xxx` 两档基线（差约 5.3 万字节），故跨时刻／跨重载的绝对字节对齐不成立（gap **G760**）。详见 `interactions.md` **V64／V65** 与 gap **G752–G760**。
**仍未采到（键位面·第 81 批刷新）**
- 上表 7 段与 表A–E 的**逐条**对账（本轮只裁了差异项）⇒ 原始串在 `_harvest/b81-panel-all.txt`，纯本地工作
- ★ 面板上**没有**的键位是否等于"官方无绑定"（面板只 7 类，bundle 注册表里的 261 个 action 构造器远多于此）⇒ 面板是**子集展示**还是**全集**未证；已知候选：`Ctrl+S 保存`（本地自造）在面板任何一类里都没出现
- G726 的裁定（回主 chunk 重读 `Cae()` 与 `ADD_ROWS_BEFORE` 定义）
- ★ **本面板证据是 Windows 显示串**；Mac 串仍只有 bundle 反编译的 `⌘ ⇧ X` 列 ⇒ 官方是否只在一侧映射出错修饰键，未定
- 键位的**实际生效性**：面板证明"官方声明并展示"，不证明"按下有用"——A／B／C／D／E 的按键效果仍零屏上证据。★ 第 83 批·上半把"键盘通路未修"收窄为**"OS 级键能驱动弹层自挂的 `Escape`（已实测关闭面板），但驱动不了键表注册的组合键"** ⇒ 跑批时每条键先试 `press_key`、失败再用 V63 的合成键兜底，并标注驱动通路（G753）

## 十二、面板 ↔ 表 A–E 逐条对账（第 82 批·零写入）

输入只有两份：`_harvest/b81-panel-all.txt`（7 段屏上原文）与本文件既有表。归并规则：把每段 `text` 串按「标签 ＋ 紧随其后的键帽」切开，`或者` 连接的备选串**算同一条**；切完每类的键帽数与 JSON 里的 `kbd` 字段**逐一相等**（16／11／34／27／80／13／38，合计 219），故 89 条「标签＋键位」既无漏项也无冗项（分类 7／4／15／13／27／6／17）。
**判据（本轮只用这四句，各带一条理由）**：`一致` ＝ 屏上组合与静态表某条同键且说的是同一动作（标签近义改写不算差异，因为 表D 的末列是本地注解而非官方文案）；`屏上补全` ＝ 静态表无此条，或静态表有该命令但屏上多给一个静态表没记的备选串；`语义名不同` ＝ 同键但两侧显示名指向的动作对象不同（照面板名实现会做成另一条命令）；`冲突` ＝ 两侧组合本身对不上，或面板内部两标签塌成同一串导致 表↔面板 无法一一对应。
「表A–E 的对应条目」列的行号指本文件自身；`表A–E 无` ＝ 全文（含 §八／§九／§十／具名上下文）找不到该命令。

| 面板分类·标签 | 面板屏上键位（Win 显示串） | 表 A–E 的对应条目（命令 id 与出处行号） | 判定 |
| --- | --- | --- | --- |
| 通用·取消 | `esc` | `CANCEL`（表B）keyboard.md:79 | 一致 —— 同键同义，且这是全文唯一一条 Esc 记录 |
| 通用·查看所有快捷键 | `CtrlShift,` | `TOGGLE_KEY_SHORTCUTS`（表C）keyboard.md:96 | 一致 —— Win 串逐字相同，面板自己印证了 §十一 的唤出配方 |
| 通用·导航到 | `Ctrl→` | `NAVIGATE_INTO`（表B）keyboard.md:76 | 一致 —— 表B 官方中文作"进入"，属近义改写 |
| 通用·返回上层 | `Ctrl←` | `NAVIGATE_OUT`（表B）keyboard.md:77 | 一致 —— 表B 作"退出"，同动作 |
| 通用·快速开启 | `CtrlO` 或者 `CtrlP` | `TOGGLE_QUICK_OPEN` keyboard.md:97 ＋ `TOGGLE_QUICK_OPEN_ALT` keyboard.md:98（同键族还有 keyboard.md:99、keyboard.md:100） | 一致 —— 两串都已在 表C，只是被拆成两个 id；面板证明二者是**同一命令的双绑定**（§十一 说"`Ctrl-O` 是 表C 之外多出的"与 keyboard.md:97 重复计账，本轮不改 §十一，只在此登记） |
| 通用·切换专注模式 | `Ctrl.` | `TOGGLE_FOCUS_MODE`（表C）keyboard.md:95 | 一致 —— 同键，标签为"模式"与"切换"之别 |
| 通用·切换左侧边栏 | `Ctrl\` | `TOGGLE_LEFT_SIDEBAR`（表C）keyboard.md:94 | 一致 —— 逐字相同 |
| 文档·每日笔记 | `CtrlAltN` | `OPEN_DAILY_NOTE`（表C）keyboard.md:102 | 一致 —— 逐字相同 |
| 文档·全选 | `CtrlA` | `SELECT_ALL`（表B）keyboard.md:78 | 一致 —— 同键在合集类另作"选择所有行"（跨上下文，见要点 3） |
| 文档·选择到顶部 | `CtrlShift⤒` | `SELECT_TO_TOP_COMMON`（表B）keyboard.md:72（Win `Ctrl-Shift-↖`） | 一致 —— ⤒ 是面板的"到顶"箭头字形，与 §八 keyboard.md:262 把 `Alt-⤒` 对到 `Alt-↖` 同一映射；若 ⤒ 实为 ↑ 则应对 keyboard.md:74 的 `*_MAC` 行（见末段遗留） |
| 文档·选择到底部 | `CtrlShift⤓` | `SELECT_TO_BOTTOM_COMMON`（表B）keyboard.md:73 | 一致 —— 同上（⤓ ↔ ↘） |
| 任务·新任务 | `CtrlJ` | `OPEN_NEW_TASK_POPUP`（表D）keyboard.md:123 | 一致 —— 逐字相同 |
| 任务·将任务标记为已完成 | `CtrlAltT` 或者 `Ctrl/` | `TOGGLE_DONE` keyboard.md:114 ＋ `TOGGLE_DONE_SLASH` keyboard.md:115 | 一致 —— 两串都已在 表D（§十一 说"`Ctrl/` 表D 未列"不成立，见要点 1） |
| 任务·将任务标记为已取消 | `CtrlAltShiftT` | `SET_CANCELLED`（表D）keyboard.md:116 | 一致 —— 逐字相同；表D 另有 Mac 专用 `SET_CANCELLED_SLASH` keyboard.md:117，面板不印 ⇒ 与 `QM()` 屏蔽 Windows 的解码互相印证 |
| 任务·计划任务 | `CtrlShiftS` | `OPEN_SCHEDULE_DATEPICKER`（表D）keyboard.md:119 | 一致 —— 表D 末列"打开日程选择器"是本地注解，不是官方文案，故名字之别不算语义名不同（判据已说明） |
| 任务·安排到今天 | `CtrlAltS` | `SCHEDULE_FOR_TODAY`（表D）keyboard.md:118 | 一致 —— ✎ **第 90 批·下半更正**：原注"Mac 列 `⌘ ⌥ ⇧ S` 经 `lEe`（keyboard.md:173）映射成 Win `Ctrl-Alt-S`"**错账**——`lEe` 的 winMatcher 是 **Ctrl+Shift+Alt 三键全带**（见 §平台表 178 行），照它应显示 `Ctrl+Shift+Alt+S`；屏上实测 `CtrlAltS` ⇒ 工厂只能是 **`JI`**（⌘⇧⌥ ↔ Ctrl+Alt，Mac 串三修饰吻合），见 G822／§20.8 |
| 任务·设定截止日期 | `CtrlShiftD` | `OPEN_DEADLINE_DATEPICKER`（表D）keyboard.md:120 | 一致 —— 逐字相同 |
| 任务·编辑任务 | `⏎` | `EDIT_START`（表D）keyboard.md:112 | 一致 —— 同键，另与 表B `EDIT_BLOCK` keyboard.md:59 撞键（按焦点分派） |
| 任务·导航至区块 | `Ctrl→` | `OPEN_PAGE`（表D）keyboard.md:124 ＋ `NAVIGATE_INTO` keyboard.md:76 | 一致 —— 同组合在通用类叫"导航到"，面板自己给出两名 |
| 任务·上一个任务 | `↑` | `PREV_TASK`（表D）keyboard.md:111 | 一致 —— 逐字相同（表D 注"不区分 Shift"，面板未展示 Shift 档） |
| 任务·下一个任务 | `↓` | `NEXT_TASK`（表D）keyboard.md:111 | 一致 —— 同上 |
| 任务·收起分组 | `←` | `SECTION_COLLAPSE`（表D）keyboard.md:126 | 一致 —— 逐字相同 |
| 任务·展开分组 | `→` | `SECTION_EXPAND`（表D）keyboard.md:126 | 一致 —— 逐字相同 |
| 任务·删除 | `⌫` 或者 `Delete` | `DELETE` ／ `DELETE_FORWARD`（表D）keyboard.md:127 | 一致 —— 两串都在，面板用"或者"把两个 id 并成一条，直接证明"两个方向"是同一命令 |
| 任务·撤销 | `CtrlZ` | `UNDO`（表D）keyboard.md:128 ＋ 表B keyboard.md:80 | 一致 —— 同键；表D 的"任务视图自带 undo store"由此获得屏上佐证 |
| 任务·重做 | `CtrlShiftZ` | `REDO`（表D）keyboard.md:128 ＋ 表B keyboard.md:81 | 一致 —— 同上 |
| 编辑·查找 | `CtrlF` | `FIND_IN_PAGE`（表B）keyboard.md:82 | 一致 —— 表B 作"页内查找" |
| 编辑·查找和替换 | `CtrlShiftF` | `REPLACE_IN_PAGE`（表B）keyboard.md:84 | 一致 —— 逐字相同 |
| 编辑·在下方插入新区块 | `space` | `INSERT_AFTER`（表B）keyboard.md:60 | 一致 —— 同键同动作；表D keyboard.md:113 的"勾选完成"也用 `space` 但面板任务类没印 ⇒ 面板只展示编辑器侧一档 |
| 编辑·在上方插入新区块 | `Shiftspace` | `INSERT_BEFORE`（表B）keyboard.md:61 | 一致 —— 逐字相同 |
| 编辑·编辑文本区块 | `⏎` | `EDIT_BLOCK`（表B）keyboard.md:59 | 一致 —— 表B 作"编辑区块"，面板用"文本区块"把对象限定得更窄 |
| 编辑·编辑页面区块 | `Shift⏎` | `RENAME`（表B）keyboard.md:63 | 语义名不同 —— 同键 `Shift-⏎`，表B 官方中文"重命名"与面板"编辑页面区块"指向不同动作对象（照面板名会做成进入页面编辑，照表B 会做成改标题）；另 合集类"添加一行"的备选串也是 `Shift⏎` |
| 编辑·创建副本 | `CtrlD` | `DUPLICATE`（表B）keyboard.md:62（§八 keyboard.md:266 已就地更正） | 一致 —— 逐字相同，屏上第二次印刷 |
| 编辑·打开斜线菜单 | `/` | `CMD_MENU`（表B）keyboard.md:86 | 一致 —— 屏上就是一枚裸 `/`，与表B"无需修饰键"完全吻合 |
| 编辑·添加或查看评论 | `CtrlShiftM` | `COMMENT`（表C）keyboard.md:103 | 一致 —— 逐字相同；面板名多"或查看"一层（顺带：§八 keyboard.md:259 那行"评论没有默认快捷键、本文件表里也确实没有"与本行两处证据都相反，本轮不改 §八，只登记） |
| 编辑·查找下一个 | `CtrlG` | `FIND_NEXT`（表B）keyboard.md:83 | 一致 —— 逐字相同；同组合在整理类是 `GROUP` keyboard.md:49（上下文分派，见要点 3） |
| 编辑·查找上一个 | `CtrlShiftG` | `FIND_PREVIOUS`（表B）keyboard.md:85 | 一致 —— 同上，同组合在整理类是 `UNGROUP` keyboard.md:50 |
| 编辑·撤销 | `CtrlZ` | `UNDO`（表B）keyboard.md:80 ＋ 表D keyboard.md:128 | 一致 —— 逐字相同 |
| 编辑·重做 | `CtrlShiftZ` | `REDO`（表B）keyboard.md:81 ＋ 表D keyboard.md:128 | 一致 —— 逐字相同 |
| 样式·标题 | `CtrlShift1` | `TITLE`（表A）keyboard.md:26 | 一致 —— 数字档 1 逐字相同 |
| 样式·副标题 | `CtrlShift2` | `SUBTITLE`（表A）keyboard.md:27 | 一致 —— 逐字相同 |
| 样式·中标题 | `CtrlShift3` | `HEADING`（表A）keyboard.md:28 | 语义名不同 —— 同键，但 表A 把 1 档与 3 档的官方中文都写成"标题"（keyboard.md:26、28 同名），面板才用"中标题"区分 1／2／3 三档；照 表A 的名字无法判断该做哪一档 |
| 样式·粗 | `CtrlShift4` | `STRONG`（表A）keyboard.md:29 | 语义名不同 —— 同键，表A 名"强调"、面板名"粗"，而面板另有"粗体 `CtrlB`"（`BOLD` keyboard.md:38）⇒ 块级强调与行内加粗只差一字，本地若合并会做出官方没有的"一个命令两个键" |
| 样式·正文 | `CtrlShift5` | `BODY`（表A）keyboard.md:30 | 一致 —— 逐字相同 |
| 样式·页面 | `CtrlShiftP` | `PAGE`（表A）keyboard.md:31 | 一致 —— 逐字相同 |
| 样式·卡片 | `CtrlShiftL` | `CARD`（表A）keyboard.md:32 | 一致 —— 逐字相同（§八 keyboard.md:264 更正链的同源证据） |
| 样式·待办列表 | `CtrlShift6` | `TODO_LIST`（表A）keyboard.md:33 | 一致 —— 表A 作"待办"；§九 keyboard.md:289 记的"从未在屏幕按过"只关乎**效果**，键位存在已由屏上确认 |
| 样式·将任务标记为已完成（列表段内） | `CtrlAltT` 或者 `Ctrl/` | `TOGGLE_DONE` keyboard.md:114 ＋ `TOGGLE_DONE_SLASH` keyboard.md:115 | 一致 —— 与任务类同一条命令，面板把它**重复印在样式类**，键位两串不变 |
| 样式·将任务标记为已取消（列表段内） | `CtrlAltShiftT` | `SET_CANCELLED`（表D）keyboard.md:116 | 一致 —— 同上，跨分类重复印刷 |
| 样式·折叠列表 | `CtrlShift7` | `TOGGLE_LIST`（表A）keyboard.md:34 | 一致 —— 表A 官方中文作"列表"，面板名更具体；§九 keyboard.md:283 的"本语境未生效"是效果侧结论，不与键位冲突 |
| 样式·打开／关闭切换 | `CtrlAltT` | `TOGGLE_TOGGLES`（表A）keyboard.md:51 | 一致 —— 同键；标签与表A"展开／折叠全部折叠块"同义（注意面板标签自带一个斜杠，键帽只有 `CtrlAltT` 三枚，归并已由 80 枚的总数校验锁定） |
| 样式·无序列表 | `CtrlShift8` | `BULLET_LIST`（表A）keyboard.md:35 | 一致 —— 表A 取 i18n 词"项目符号"，面板用"无序列表"，同一概念 |
| 样式·编号列表 | `CtrlShift9` | `NUMBERED_LIST`（表A）keyboard.md:36 | 一致 —— 表A 作"编号" |
| 样式·取消列表格式 | `` CtrlShift` `` | `NO_LIST`（表A）keyboard.md:37 | 一致 —— 表A 的 Win 列就是 `Ctrl-Shift-` 加反引号，"数字档 1–9/0 在 Windows 整体位移、0 档落到反引号"这条推论**首次得到屏上确认** |
| 样式·焦点 | `CtrlShift\` | `FOCUS_DECOR`（表A）keyboard.md:47 | 一致 —— 逐字相同（面板把反引号与反斜杠分成两枚键帽，与上一行不撞键） |
| 样式·块 | `CtrlShift'` | `BLOCK_DECOR`（表A）keyboard.md:48 | 一致 —— 逐字相同 |
| 样式·增加缩进 | `Tab` | `INDENT`（表B）keyboard.md:64 | 一致 —— 表B 写 ⇥ 字形、面板写 `Tab` 字样；§九 keyboard.md:278 已实测生效，键位与效果两侧都齐 |
| 样式·减少缩进 | `ShiftTab` | `DEINDENT`（表B）keyboard.md:65 | 一致 —— 同上 |
| 样式·粗体 | `CtrlB` | `BOLD`（表A）keyboard.md:38 | 一致 —— 逐字相同 |
| 样式·斜体 | `CtrlI` | `ITALIC`（表A）keyboard.md:39 | 一致 —— 逐字相同 |
| 样式·代码 | `CtrlShiftC` 或者 `CtrlE` | `CODE` keyboard.md:42 ＋ `CODE2` keyboard.md:43 | 一致 —— 两串都在（表A 早已注"另一条通路"），面板证明是同一命令的双绑定而非两个命令 |
| 样式·删除线 | `CtrlShift-` | `STRIKETHROUGH`（表A）keyboard.md:40 | 一致 —— 表A Win 列 `Ctrl-Shift--` 即 减号键 |
| 样式·链接 | `CtrlK` | `URL`（表A）keyboard.md:45 | 一致 —— 逐字相同；同组合在 表C:99 是 `TOGGLE_QUICK_OPEN_LEGACY`，面板未印该标签，故屏上只见编辑器一档（§分派机制 keyboard.md:154 的"同键按上下文"实例） |
| 样式·输入方程 | `CtrlShiftE` | `INLINE_TEX`（表A）keyboard.md:44 | 一致 —— 表A 作"行内公式"、面板作"输入方程"，同一动作；注意与上一行的 `CtrlE` 只差 Shift，两侧都在表内 |
| 样式·区块链接 | `CtrlShiftK` | `BLOCKLINK`（表A）keyboard.md:46 | 一致 —— 逐字相同 |
| 样式·高亮 | `CtrlShiftB` | `HIGHLIGHT`（表A）keyboard.md:41 | 一致 —— 逐字相同 |
| 整理·向上移动 | `Alt↑` | `MOVE_BLOCK_UP`（表B）keyboard.md:66 | 一致 —— §八 keyboard.md:260 的第二方对照与本轮屏上第三次一致 |
| 整理·向下移动 | `Alt↓` | `MOVE_BLOCK_DOWN`（表B）keyboard.md:67 | 一致 —— 同上 |
| 整理·移动到顶部 | `Alt⤒` | `MOVE_BLOCK_TOP`（表B）keyboard.md:68（Win `Alt-↖`，另有 `*_MAC` keyboard.md:70） | 一致 —— ⤒↔↖ 的字形映射由 §八 keyboard.md:262 先立，本轮再证一次；面板用 `Alt` 系而非 `CtrlShift↑` ⇒ `*_MAC` 行不在面板展示 |
| 整理·移动到底部 | `Alt⤓` | `MOVE_BLOCK_BOTTOM`（表B）keyboard.md:69（＋ `*_MAC` keyboard.md:71） | 一致 —— 同上 |
| 整理·组合 | `CtrlG` | `GROUP`（表A）keyboard.md:49 | 一致 —— ★ 这条就是 §八 keyboard.md:264 被推翻又更正的对象，屏上串与 表A Win 列逐字相同；同组合在编辑类是 `FIND_NEXT` keyboard.md:83 |
| 整理·取消组合 | `CtrlShiftG` | `UNGROUP`（表A）keyboard.md:50 | 一致 —— 同上；同组合在编辑类是 `FIND_PREVIOUS` keyboard.md:85 |
| 合集·在表格中·清除单元格内容 | `⌫` | `CLEAR_CELL_CONTENTS`（表E）keyboard.md:137 | 一致 —— 逐字相同 |
| 合集·在表格中·在前面添加行 | `CtrlShift⏎` | `ADD_ROWS_BEFORE`（表E）keyboard.md:138（Mac `⌘ ⌥ ⏎`，Win 列 `Ctrl-Shift-⏎`） | 冲突 —— 面板串与 表E 的 Win 列同串，但**同一串在面板里同时是"添加列"**（keyboard.md:141）⇒ 表E 靠 Mac 列区分的两行在 Win 端塌成一键，表与面板无法一一对应（G726 仍未裁定） |
| 合集·在表格中·添加行 | `Ctrl⏎` | `ADD_ROWS_AFTER`（表E）keyboard.md:139 | 一致 —— 两侧同串同义，是四行里唯一 Mac／Win 都不同形的；同组合在 表C:101 是 `TOGGLE_ASSISTANT`，面板无"AI 助手"标签 |
| 合集·在表格中·在前面添加列 | `CtrlAlt⏎` | `ADD_COLUMNS_BEFORE`（表E）keyboard.md:140（Mac `⌘ ⌥ ⇧ ⏎` 经 `JI` keyboard.md:172 映射为 Win `Ctrl-Alt-⏎`） | 一致 —— 与"在前面添加行"的 `CtrlShift⏎` 可区分 ⇒ 塌键只发生在 138 与 141 两行，不在本行 |
| 合集·在表格中·添加列 | `CtrlShift⏎` | `ADD_COLUMNS_AFTER`（表E）keyboard.md:141 | 冲突 —— 与"在前面添加行"显示为**完全相同的组合**（同上，G726） |
| 合集·在表格中·向上移动行 | `Alt↑` | `MOVE_ROWS_UP`（表E）keyboard.md:142 | 一致 —— 与整理类"向上移动"（`MOVE_BLOCK_UP` keyboard.md:66）同组合 ⇒ 表E keyboard.md:148 记的"共用 Alt＋方向键、靠上下文区分"得屏上确认 |
| 合集·在表格中·向下移动行 | `Alt↓` | `MOVE_ROWS_DOWN`（表E）keyboard.md:142 | 一致 —— 同上 |
| 合集·在表格中·向左移动列 | `Alt←` | `MOVE_COLUMNS_LEFT`（表E）keyboard.md:143 | 一致 —— 块导航用 `Ctrl←`（keyboard.md:77）、列移动用 `Alt←`，面板两侧不撞 |
| 合集·在表格中·向右移动列 | `Alt→` | `MOVE_COLUMNS_RIGHT`（表E）keyboard.md:143 | 一致 —— 同上 |
| 合集·在表格中·删除行 | `Ctrl⌫` | `DELETE_ROWS`（表E）keyboard.md:144 | 一致 —— 逐字相同 |
| 合集·在表格中·删除列 | `CtrlShift⌫` | `DELETE_COLUMNS`（表E）keyboard.md:145 | 一致 —— 逐字相同 |
| 合集·在表格中·添加内容 | `Ctrl[` | `ADD_CONTENT`（表E）keyboard.md:146 | 一致 —— 表E 的 Mac 列是 `⌃ [`（Control），Win 列 `Ctrl-[` 与屏上逐字相同 |
| 合集·在合集中·添加一行 | `Ctrl⏎` 或者 `Shift⏎` | 表A–E 无 —— 集合行的加行命令全文没有记录；两个串分别与 `ADD_ROWS_AFTER` keyboard.md:139、`RENAME` keyboard.md:63 同组合 | 屏上补全 —— `Shift⏎` 是静态表从未给过"加行"的第二绑定（本轮唯一一条真正新增的备选串）；且"集合行"这一整个上下文在 表A–E 缺席 |
| 合集·在合集中·复制行 | `CtrlD` | 表A–E 无 —— 无"复制集合行"命令；同组合＝`DUPLICATE`（表B）keyboard.md:62（§八 keyboard.md:266 已记为上下文分派） | 屏上补全 —— 命令面缺条，只有键位侧可挂到 `DUPLICATE` |
| 合集·在合集中·选择所有行 | `CtrlA` | 表A–E 无 —— 同组合＝`SELECT_ALL`（表B）keyboard.md:78；另 keyboard.md:207 记合集合快搜里 `Ctrl-A` 被重新绑定 | 屏上补全 —— 命令面缺条；同组合至少三义（全选正文／选所有行／快搜内重绑），是"键位按上下文分派"的最强屏上证据 |
| 合集·在合集中·清除单元格值 | `⌫` | `CLEAR_CELL_CONTENTS`（表E）keyboard.md:137 | 一致 —— 同键同义，面板把同一条命令在"在表格中"与"在合集中"各印一次，且一处写"内容"一处写"值" |
| 合集·在合集中·删除行 | `Ctrl⌫` | `DELETE_ROWS`（表E）keyboard.md:144 | 一致 —— 同上，属重复印刷而非新命令 |

**本轮对账要点**

1. **面板给出、静态表从未记录的"第二绑定"只有 1 条**：`合集·在合集中·添加一行` 的 `Shift⏎`（静态表里 `Shift-⏎` 只挂在 `RENAME` keyboard.md:63）。其余 4 组"或者"关系在静态表**早已各占两个 id**，屏上只是把它们并置回一条命令：`快速开启`（97＋98）、`将任务标记为已完成`（114＋115）、`代码`（42＋43）、`删除`（127 的 `⌫`／`Delete`）。⇒ ★ 更正 §十一 的三处口径：`Ctrl-O`、`Ctrl/`、`CtrlAltShiftT` **都不是** 表A–E 之外的新绑定，它们分别在 keyboard.md:97、115、116；本轮不改 §十一，只在此登记，避免下批把"并置"当"新增"二次入账。
2. **面板是子集，不是全集（反向证据）**：静态表有、面板任何分类都没印的至少 12 条 —— `CUT`／`COPY`／`PASTE`（keyboard.md:136）、`TOGGLE_ASSISTANT`（101）、`TOGGLE_QUICK_OPEN_LEGACY`（99）、`TOGGLE_QUICK_OPEN_SAFARI`（100）、`OPEN_TASK_LOCATION`（122）、`REMIND_IN_ONE_HOUR`（121）、`SET_CANCELLED_SLASH`（117，Mac 专用故 Win 面板不印，属预期）、`SECTION_TOGGLE_COLLAPS` 与 `TOGGLE_STATE`／`CREATE_NEW` 的 `space`（113、125，面板只在编辑器语境印 `space`）、`MOVE_BLOCK_TOP_MAC`／`BOTTOM_MAC`（70、71）、`SELECT_TO_TOP_MAC`／`BOTTOM_MAC`（74、75）。⇒ "面板 89 条"与"键位全集"之间还差这批漏项，且面板的 7 类里没有"外壳类命令"的独立分类。
3. **同物理组合跨上下文／跨分类复用（逐条列全）**：`Ctrl→`（通用"导航到"19 行 ↔ 任务"导航至区块"，表B:76 ↔ 表D:124）；`CtrlG`（编辑"查找下一个" ↔ 整理"组合"，83 ↔ 49）；`CtrlShiftG`（编辑"查找上一个" ↔ 整理"取消组合"，85 ↔ 50）；`CtrlD`（编辑"创建副本" ↔ 合集"复制行"，62 ↔ 合集段）；`CtrlA`（文档"全选" ↔ 合集"选择所有行" ↔ 快搜重绑 207）；`⌫`（任务"删除" ↔ 表格"清除单元格内容" ↔ 合集"清除单元格值"，127 ↔ 137）；`⏎`（任务"编辑任务" ↔ 编辑"编辑文本区块"，112 ↔ 59）；`Shift⏎`（编辑"编辑页面区块" ↔ 合集"添加一行"备选，63 ↔ 139）；`Ctrl⏎`（表格"添加行" ↔ 合集"添加一行"，表C:101 同串却不印）；`Alt↑`／`Alt↓`（整理移块 ↔ 合集移行，66／67 ↔ 142）；`CtrlAltT`（样式"打开／关闭切换"51 ↔ 任务与样式两处的"标记已完成"114）；`CtrlZ`／`CtrlShiftZ`（任务类与编辑类各印一次，80／81 ↔ 128）；`CtrlK`（样式"链接"45 ↔ 表C:99 legacy 快速打开）；`space`（编辑器插入 60 ↔ 任务视图勾选 113）。另 **面板内部自身塌键**：`CtrlShift⏎` 同时是"在前面添加行"与"添加列"（138 ↔ 141）。
4. **面板行数不等于命令数**：89 行里有 **6 行是同一条命令的第二印刷**（已完成、已取消各在任务类与样式类印一次＝keyboard.md:114／115／116；撤销、重做各在任务类与编辑类印一次＝表B:80／81 与 表D:128；"清除单元格值"与"删除行"在合集两段各印一次＝表E:137／144），去掉这 6 行约得 **83 条**不同命令（若再把 通用"导航到"与 任务"导航至区块"算作同一条，则 82 条）⇒ 对账时**不能按面板行数判覆盖率**，否则会把重复项误当新增。
5. **表A 的"官方中文"列有两处需要回改（本轮不改表）**：`TITLE` 与 `HEADING` 都写"标题"（26、28），面板用 标题／副标题／中标题 三档区分 ⇒ 表A 无法从名字反推 1／2／3 各是哪档；`STRONG` 写"强调"（29）而面板写"粗"，与 `BOLD`"加粗"（38）只差一字。其余名字之别（列表／折叠列表、项目符号／无序列表、编号／编号列表、无列表／取消列表格式、行内公式／输入方程、命令菜单／打开斜线菜单）都是同义异名，不改变判定。
6. **面板标签与 表D／表E 末列的"语义"之别是注解之别**：表D 末列表头是"语义"（本地注解），表A／B／C／E 末列才是"官方中文"（i18n）⇒ 只有后者的名字差异才可能构成 `语义名不同`。本轮三条 `语义名不同` 全部落在 i18n 列（28、29、63）上，不是注解口径之争。

**仍未采到（对账面·第 82 批）**
- **面板是否等于键位全集仍未证**：要点 2 列出 12 条"表A–E 有、面板无"，故面板确定是子集；但反过来"bundle 注册表里有、面板与 表A–E 都没有"的集合仍未穷尽（219 枚键帽 ↔ 261 个 action 构造器的比例本身就说明面板不覆盖动作面），本轮只能证"面板 ⊂ 表A–E ∪ 表A–E ⊄ 面板"，两侧的真差集仍未量出。★★ **第 82 批·下半 C 推进**：面板源已找到（§十三），面板＝一份人工挑选清单 ⇒ "面板是子集"由数据形状直接证明；且面板条目还会被 `Ll`／`Hd` 三元与功能开关裁掉（`assistant.assistant` 在源里、屏上没印）⇒ "表A–E 有、面板无"要分成"源里就没有"与"源里有但该设备不渲染"两类。
- ~~Mac 串完全没与屏上对照；G726 未推进~~ **G726 已裁定**（第 82 批·下半 B，见 gap **G742** 与 `internals.md` §二十七）：两张表格键表里 `ci(oo)`（添加列·右）都排在 `zr(oo)`（在前面添加行）**之前**，而两者 Windows 式逐字段相同 ⇒ **Windows 的 `Ctrl+Shift+Enter` 派发的是"添加列·右"，"在前面添加行"在该平台键盘不可达**；面板把两个标签都印出来是枚举描述符不去重。**Mac 串仍未与屏上对照**（这条没结）。
- **⤒／⤓ 的字形归属仍是推断**：判据来自 §八 keyboard.md:262 的一条旁证（`Alt-⤒` ↔ `Alt-↖`）。若 ⤒ 实为 ↑，则 文档类"选择到顶部 `CtrlShift⤒`"对应的应是 `SELECT_TO_TOP_MAC`（74）而非 COMMON（72）；顺带：表B 内部 `MOVE_BLOCK_TOP_MAC`（70）与 `SELECT_TO_TOP_MAC`（74）的 Win 串**逐字相同**（都是 `Ctrl-Shift-↑`），面板里没有 `CtrlShift↑` 这一条，故也无法用屏上裁定这处静态表自撞。★★ **第 82 批·下半 C 结案（见 §十三）**：`JX()` 与三处 `Ll ?` 证明 **`*_MAC` 变体只在 Mac 的面板里追加展示** ⇒ 非 Mac 面板没有 `CtrlShift↑` 是设计如此，不是漏采；`SELECT_TO_*_MAC` 与 `MOVE_BLOCK_*_MAC` 的 Windows 串自撞仍是**静态表内部问题**（前者进派发、后者的派发点尚未定位）。
- **`Ctrl-S`（本地自造的保存）在面板 7 类中仍未出现**，与 keyboard.md:234 那条"官方两个枚举里都没有保存快捷键"一致 ⇒ 本地这一条仍是需要主动决策的偏差，不因面板到手而结案。
- **键位的实际生效性本轮零条**：89 行全是"官方声明并展示"级证据；§九 的屏上按过并判过的仍只有 9 条，表D／表E 一条都没按过（键盘通路未修）。
- **面板是否随焦点上下文换串未测**：本轮只在"沙盒文档正文 ＋ 面板打开"这一种状态下采；表格内、集合内、任务视图内的同一标签是否会显示不同组合（例如 `CtrlShift⏎` 的两条塌键在表格焦点下是否已被拆开），需要先把光标放进对应上下文再开面板，未做。
- **"在合集中"段的命令 id 未解**：5 条面板标签只能对到 表E 的同串项，`ho`／`hnt`／`Iu` 三张注册表里都没有"集合行"语义的 id ⇒ 需回 bundle 找第四张注册表（或确认面板这一段来自 i18n 硬编码而非注册表）。

## 十三、面板自己的构造源与三张键位注册表（✓ 第 82 批·下半 C，纯本地读 bundle ＋ 语言包回查）

面板不是注册表的转储，而是 @2112400–2119000 一份**人工挑选的清单**，形状 `{id, getTitle:s=>s(key), shortcuts:[{getName:s=>s(key), shortcuts:[描述符…]}]}`。⇒ 本节的用途：**判"某键位官方到底有没有"时的第三个对照源**（前两个＝描述符链、派发点顺序）。

**段的真实层级是 18 段 → 7 个标签页**（段 id 与 `getTitle` key 逐字读到，`中文` 已在 `i18n-zh.tsv` 查到）：

| 标签页（屏上） | 段 id | 段标题 key（中文） |
|---|---|---|
| 通用 | `general-navigation` ／ `general-view` | `commands.navigation`（导航）／ `view`（视图） |
| 文档 | —（该 tab 的段未在源里以 `getTitle` 形式读到） | ☆ 未穷尽 |
| 任务 | `tasks-global` ／ `tasks-views` | `tasks.global.shortcuts`（全局快捷键）／ `commands.shortcuts.in.tasks.views`（在任务视图中） |
| 编辑 | `editing-insert` ／ `editing-selection` ／ `editing-comments` ／ `editing-find-replace` ／ `editing-other` | `commands.insert.new.block`（插入新区块）／ `commands.edit.selection`（编辑选择）／ `comments`（评论）／ `commands.shortcuts.in.find.and.replace`（在查找和替换中）／ `other`（其他） |
| 样式 | `style-text` ／ `style-list` ／ `style-decorations` ／ `style-indentation` ／ `style-format` | `style.text.style`（文本样式）／ `browse.list`（列表）／ `style.decorations`（装饰）／ `style.indentation`（缩进）／ `style.inline.format`（文字格式） |
| 整理 | `organize-move` ／ `organize-group` | `commands.move.blocks.selection`（移动所选区块）／ `commands.group.and.ungroup`（组合与取消组合） |
| 合集 | `collections-tables` ／ `collections-collections` | `commands.shortcuts.in.tables`（在表格中）／ `commands.shortcuts.in.collections`（在合集中） |

⇒ 屏上第 81 批采到的 H3 段名与上表**逐字吻合**（`_harvest/b81-panel-all.txt` 里每段的 `headings` 就是这些中文标题），故 7 tab 的分类折叠是**渲染层**行为，官方数据面给的是 18 段。

**面板源里的三处平台／浏览器裁剪**（⇒ "面板印了什么"依赖设备）：

1. `commands.quick.open` ＝ `Hd ? [ot.TOGGLE_QUICK_OPEN_SAFARI, ot.TOGGLE_QUICK_OPEN_ALT] : [ot.TOGGLE_QUICK_OPEN, ot.TOGGLE_QUICK_OPEN_ALT]` ⇒ **`⌘⇧O` 只在 Safari 面板出现**（`Hd` 是 Safari 位）⇒ 表C 的"四套快速打开键位"要重述为：**同一命令按浏览器选一条主键 ＋ 恒有 `⌘P` 备选**，而 `TOGGLE_QUICK_OPEN_LEGACY`（`⌘K`）**根本不在面板源里** ⇒ 面板永远不会展示它。
2. `tasks.mark.task.as.cancelled` ＝ `Ll ? [ho.SET_CANCELLED, ho.SET_CANCELLED_SLASH] : …` ⇒ Windows 面板只印一条（与屏上一致：只见 `CtrlAltShiftT`）。
3. `select.to.top`／`select.to.bottom` ＝ `Ll ? [ot.SELECT_TO_*_COMMON, ot.SELECT_TO_*_MAC] : …`，另有装配器 `JX()` 对 `MOVE_BLOCK_TOP`／`BOTTOM` 做同样的"Mac 才追加 `_MAC`"处理 ⇒ **★ §十二 遗留的"表B 内部 `MOVE_BLOCK_TOP_MAC` 与 `SELECT_TO_TOP_MAC` 的 Windows 串逐字相同、面板里没有 `CtrlShift↑`"就此消解**：非 Mac 端这些条目压根不进面板，面板没有该串是设计如此。

**`ho`（任务注册表）的工厂归属 ⇒ 表D 的 Windows 列首次逐条第二方对照**：`TOGGLE_DONE=YM(Oo("t"))`→`Ctrl-Alt-T`、`TOGGLE_DONE_SLASH=yae("/")`→`Ctrl-/`、`SET_CANCELLED=lEe(Oo("t"))`→`Ctrl-Alt-Shift-T`、`SET_CANCELLED_SLASH=QM(zr(Vr("Slash")))`→**Windows 无**、`REMIND_IN_ONE_HOUR=JI(Oo("r"))`→`Ctrl-Alt-R`、`OPEN_TASK_LOCATION=ci(Oo("o"))`、`OPEN_DEADLINE_DATEPICKER=ci(Oo("d"))`、`OPEN_PAGE=Co(Il)`⇒ 与屏上 7 类里的「任务」段**逐条一致**。★ 结构差：`SECTION_TOGGLE_COLLAPS/COLLAPSE/EXPAND` 用 **`Vn`（只写键条件、四个修饰字段全不写）** ⇒ 任务视图的 `space`／`←`／`→` 在**任意修饰组合下都命中**，而正文用 `mo`（四修饰字段显式为假）⇒ 官方有意让两处宽容度不同（表D 注的 `shiftKey: void 0` 就是这个）。

**`ot`（66 项）的 Windows 位移家族归属**：`zr`（`⌘⌥`→`Ctrl-Shift`）12 项（含数字样式档 1–9 与 `TOGGLE_KEY_SHORTCUTS`）、`ci`（`⌘⇧`→`Ctrl-Shift`）20 项、`Co`（`⌘`→`Ctrl`）17 项、`YM`（`⌘⌥`→`Ctrl-Alt`）2 项、`yae`（非字母单字符）1 项（`TOGGLE_FOCUS_MODE`）、内联字面量 1 项（`NO_LIST`：`code Digit0`→`code Backquote`）。⇒ 表A／表B／表C 的 Windows 列由此**全部有工厂级出处**，不再是逐条反编译。

**★ 一处本地文档错误（已就地更正）**：`RENAME` 的官方中文在语言包里**没有对应 key**（`commands.rename` 查无），面板源给的是 `commands.edit.block.page` ＝ **编辑页面区块**（另有 `commands.edit.block.text` ＝ 编辑文本区块）。⇒ 表B 旧值"重命名"是本地按 id 名反推的，不是官方文案；§十二 把这条判成"语义名不同"应降级为"本地列名错"。

**☆ 面板条目还有第四层裁剪（功能开关，未验证）**：面板源里有 `{getName:s=>s("assistant.assistant"), shortcuts:[ot.TOGGLE_ASSISTANT]}`（`assistant.assistant` ＝ 助手），但第 81 批屏上「编辑」各段没印这一行 ⇒ 属"源里有、渲染没有"，最可能是 AI 档位／账户状态相关。⇒ 用面板判"官方无此绑定"之前，要先排除这一类。

**仍未采到（本节）**
- 面板源经 `Zp`／变量传入的条目未穷尽（本轮只抓到 57 条 `shortcuts:[…]` 直写项）；「文档」tab 的段 `getTitle` 未读到。
- `ot.tableShortcuts` 子组成员；`k9t` 的非 Mac 分支读至截断处。
- `TOGGLE_ASSISTANT` 与 `ADD_TABLE_ROW` 同为 `Co(oo)`（`⌘⏎`／`Ctrl+⏎`）⇒ 表格选区语境谁赢**未裁定**。
- 平台位 `_d`（`Ll` 定义里的取反项）与 `JAe`／`gae`／`k2`（CrOS／Firefox／Android）是否也参与键位选取，未查。
- ★ 第 83 批·下半尾记新开两条：① 帮助菜单**其余四项**（`意见反馈`／`最新特性`／`Web 和 Windows 版最新特性`／`常见问题`）的落点未验 —— 本轮只判了 `快捷键`（应用内面板）与 `Markdown 快捷方式`（站外 help center），**不要把结论推广到全六项**；② 面板"当前分类"**跨整页重载保持**已实测（G756 结案），但**持久化载体未证**（按铁律没读 `localStorage`／IndexedDB）且~~**分类切换是否受键盘（非点击）影响、面板内有无搜索框**都还没看~~ ★ **两项均已在第 84 批·上半结案**：`press_key` 的 `ArrowDown`／`ArrowUp` **一步一档改变选中分类**（而 `Tab` 只移焦点不改选中 ⇒ 焦点态与选中态两套状态分离），面板内**没有**任何 `input`／`textarea`／`[role=searchbox]` ⇒ 无过滤入口；另拿到 7 枚分类图标的 `aria-label` 全英文词表 ⇒ 见 gap **G761／G762／G763** 与 `interactions.md` **V66**。

## 十四、帮助菜单六项落点 ＋ 面板"合集"段逐行 ＋ 面板键盘导航矩阵（✓ 第 84 批·下半 2026-09-28 09:55–10:02，零写入；手法＝读实时 React fiber 闭包 ＋ 拦截 `window.open`，**不真跳**）

### 14.1 帮助菜单六项：站内还是站外，逐项定版

| 菜单项 | 闭包逐字（fiber 深度 3 的 `onSelect`／深度 9 的具名回调） | 实测落点 | 菜单是否自己关 |
| --- | --- | --- | --- |
| 意见反馈 | `()=>{l(yn({id:"feedback"})),T(!1)}` | **不调 `window.open`**；拦截后 captured＝null、`dialog`＝0、700 ms 内站内无反馈 ⇒ 落点**未确认**（`mailto:`／系统层／开关未开） | 关（`T(!1)`） |
| 最新特性 | `function nRt(){window.open(Yhe,"_blank")}` | 站外 `https://www.craft.do/whats-new`；★ **缺第三参 ⇒ 无 `noopener`**（新标签持有 `window.opener`） | **不关** ⇒ 实测该次点击后 `[role=menu]`＝1（其余四项＝0），与闭包里缺 `T(!1)` 互相印证 |
| Web 和 Windows 版最新特性 | `()=>{window.open(Xhe,"_blank","noopener=true"),T(!1)}` | 站外 `https://www.craft.do/whats-new-web-windows` | 关 |
| 常见问题 | `()=>{window.open(Kjt,"_blank","noopener=true"),T(!1)}` | 站外 `https://support.craft.do` | 关 |
| 快捷键 | **六项中唯一在祖先链上取不到 `onSelect`** ⇒ 不走同一按钮包装 | 站内 `dialog`（承 §十一／§十二） | 关 |
| Markdown 快捷方式 | `()=>{window.open(Gjt,"_blank","noopener=true"),T(!1)}` | 站外 help center（URL 由第 83 批屏上实测给出）⇒ **闭包级＋屏上级双证** | 关 |

⇒ 六项里**只有两项是站内**（`快捷键` 与未确认的 `意见反馈`），其余四项是站外新标签。⇒ **方法论**：自绘菜单的落点不必靠"点一下看去哪"——沿 `__reactFiber$…` 的 `return` 链读 `memoizedProps` 就能拿到闭包源码，再配合拦截 `window.open`（返回假句柄）取参数，**零新标签**（本桥没有 `close_page`，真开就留残留）。⇒ gap `G765`；`interactions.md` **V67**。

### 14.2 面板"合集"段逐行（18 行＝17 命令＋1 别名行，结案 G764 的仪器分歧）

段标题两个：`在表格中`、`在合集中`。逐行（`_row_dm375_102` 索引 ＋ 名称子元素类型 ＋ 键帽串）：

| # | 名称 | 键帽 | 备注 |
| --- | --- | --- | --- |
| 0 | 清除单元格内容 | `⌫` | 与第 16 行同键不同名（见 14.4） |
| 1 | 在前面添加行 | `Ctrl` `Shift` `⏎` | ★ 与第 4 行同串（G742 第二次截图级复现，见 `_harvest/b84-keyboard-nav.png`） |
| 2 | 添加行 | `Ctrl` `⏎` | |
| 3 | 在前面添加列 | `Ctrl` `Alt` `⏎` | |
| 4 | 添加列 | `Ctrl` `Shift` `⏎` | ★ 同第 1 行 |
| 5 | 向上移动行 | `Alt` `↑` | |
| 6 | 向下移动行 | `Alt` `↓` | |
| 7 | 向左移动列 | `Alt` `←` | |
| 8 | 向右移动列 | `Alt` `→` | |
| 9 | 删除行 | `Ctrl` `⌫` | 与第 17 行完全同名同键（跨段重复） |
| 10 | 删除列 | `Ctrl` `Shift` `⌫` | |
| 11 | 添加内容 | `Ctrl` `[` | 截图底部被裁掉的那行 |
| 12 | 添加一行 | `Ctrl` `⏎` | |
| 13 | **（别名行）** | `或者` `Shift` `⏎` | ★ 第一个子是 `_rowAlternative_dm375_118` 而非 `_rowName_dm375_110` ⇒ 它是第 12 行的**第二键位**，不是一条命令 |
| 14 | 复制行 | `Ctrl` `D` | |
| 15 | 选择所有行 | `Ctrl` `A` | |
| 16 | 清除单元格值 | `⌫` | 与第 0 行同键不同名 |
| 17 | 删除行 | `Ctrl` `⌫` | 与第 9 行同名同键 |

⇒ **口径定版**：`[class*="_row_"]` 数得 18、按 `_rowName_` 解析得 17，两把尺子都对，但**"命令数"只能按主行计** ⇒ `合集`＝**17 条命令／18 行／38 枚键帽**。逐行原始形状见 `_harvest/b84-e-rows.txt`。⇒ gap `G767`。

### 14.3 面板键盘导航矩阵（★ 只有纵向）

`整理` 段本轮也逐行采到（6 行，全部 `_rowName_`，无别名行）：`向上移动 Alt ↑`／`向下移动 Alt ↓`／`移动到顶部 Alt ⤒`／`移动到底部 Alt ⤓`／`组合 Ctrl G`／`取消组合 Ctrl Shift G`。⇒ ★ **结案一条遗留**：`⤒`／`⤓` 两个字形属于**「移动到顶部／移动到底部」的键帽**（`Alt` 修饰），不是列表缩进或滚动指示用字（此前只知其在「动作」子页签里出现，归属未定）。

`press_key`（OS 级）逐键结果（页内捕获阶段 `keydown`＋`keyup` 双监听为送达证据，采样见 `interactions.md` V67 第三节）：

| 键 | 送达 | 选中分类 | 判定 |
| --- | --- | --- | --- |
| `ArrowLeft` | ✓（2 条日志） | `整理` 不变 | 官方**未注册** |
| `ArrowRight` ×2 | ✓ | `整理` 不变 | 官方**未注册** |
| `Home` | ✓ | `整理` 不变 | 官方**未注册** |
| `End` | ✓ | `整理` 不变 | 官方**未注册** |
| `Enter` | ✓ | `整理` 不变 | **不可判失效**（焦点停在已选中按钮上）⇒ 未确认 |
| `ArrowDown` | ✓ | `整理 → 合集` | ✓ 生效；★ 焦点在分类按钮上时同样生效 ⇒ 纵向导航与焦点落点无关 |

⇒ **面板只实现纵向 roving**（`ArrowUp`／`ArrowDown` 一步一档），横向与 `Home`／`End` 无 handler；`Tab` 只移焦点不改选中（V66／G762）。⇒ gap `G766`。

### 14.4 面板自身的两处"官方不一致"（新增到 G579 那条清单）

1. **同面板内同键不同名**：`⌫` 在 `在表格中` 段叫「清除单元格内容」、在 `在合集中` 段叫「清除单元格值」。
2. **跨段整条重复**：`删除行 = Ctrl ⌫` 在两段各印一次（第 9／17 行）。
⇒ ⇒ 面板**不是去重后的全局命令表**，而是"按 section 各自渲染"，同一命令在不同上下文各出现一次。本地若做全局去重就与官方对不上（建议照抄分段、统一文案，登记为有意偏差）。⇒ gap `G768`。

### 仍未采到（第 84 批·下半 刷新）

- ☆ `意见反馈` 落点未确认（已排除站内 `dialog` 与 `window.open` 两条）。
- ☆ `Space` 未测；Base UI 按钮 `onKeyUp` 里对 `$a.key === " "` 的专门分支已从 fiber 读到 ⇒ 按一次可双验。
- ☆ 键帽与关闭按钮的 `aria-label` 未采（只拿到 7 枚分类图标名，G763）。
- ☆ `Yhe`／`Xhe`／`Kjt`／`Gjt` 四个字面常量只采到三个 URL（`Gjt` 靠第 83 批屏上实测对齐）。
- ☆ 其余 5 个分类（通用／文档／任务／编辑／样式）的**逐行形状**本轮未重采（§十二 已有第 81 批全表）⇒ 别名行（`_rowAlternative_`）在别的分类里还有几条，未穷尽。

## 十五、面板七分类的三口径全表 ＋ `Space` 重置行为 ＋ 面板 a11y 词表（✓ 第 85 批·上半 2026-09-28 10:12–10:14，零写入；单次页内脚本连点七个分类）

### 15.1 三口径全表（gap `G771`）

| 分类 | 行 | 主行 | 别名行 | 键帽 | 段标题 |
| --- | --- | --- | --- | --- | --- |
| 通用 | 8 | 7 | 1 | 16 | 导航／视图 |
| 文档 | 4 | 4 | 0 | 11 | （无段标题） |
| 任务 | 17 | 15 | 2 | 34 | 全局快捷键／在任务视图中 |
| 编辑 | 13 | 13 | 0 | 27 | 插入新区块／编辑选择／评论／在查找和替换中／其他 |
| 样式 | 29 | 27 | 2 | 80 | 文本样式／列表／装饰／缩进／文字格式 |
| 整理 | 6 | 6 | 0 | 13 | 移动所选区块／组合与取消组合 |
| 合集 | 18 | 17 | 1 | 38 | 在表格中／在合集中 |
| 合计 | 95 | 89 | 6 | 219 | — |

⇒ **结案第 83 批遗留**：「面板条目为什么只有 89 条」＝**89 是主行数＝命令数**，其余 6 行是同一命令的第二键位（别名行 `_rowAlternative_`），不是被功能开关／浏览器位／平台位裁掉的条目。
⇒ **219 枚键帽**与第 81 批完全一致，但手法不同（81 批逐类点＋DOM 串；本批单次脚本连点七类）⇒ 可当回归基线。
⇒ ★ **`文档` 是唯一没有分段标题的分类** ⇒ "分段"是可选层，本地别假设每类都有段标题。
⇒ 键帽最密的是 `样式`（27 命令／80 枚 ⇒ 平均近 3 枚／命令），最疏的是 `文档`（4 命令／11 枚）。

六条别名行逐字（＝同一命令的第二键位）：`通用`「或者 `Ctrl` `P`」；`任务`「或者 `Ctrl` `/`」、「或者 `Delete`」；`样式`「或者 `Ctrl` `/`」、「或者 `Ctrl` `E`」；`合集`「或者 `Shift` `⏎`」。⇒ 别名行只出现在 4／7 个分类。

逐分类的 89 条「命令名 ＝ 键帽串」明细已落盘 `_harvest/b85-panel-7cat.json` 的 `detail` 字段，**尚未与 §十二 的表 A–E 逐条对账**（`样式` 那一档最可能藏新的同键冲突）。

### 15.2 `Space` ＝ 重置回第一个分类（gap `G772`）（★★★ **本小节结论已于第 86 批·上半改判作废** ⇒ `Space`＝"激活当前聚焦的按钮"，不是"重置"；定版矩阵见 §十七 17.1，改判证据见 gap **G782**）

前置＝点 `合集`（`active` 合集、`kbd` 38、len `134,436`、焦点在 `合集` 按钮）⇒ `press_key('Space')` ⇒ 读到 `active`＝**`通用`**、`kbd` 16、len `130,896`、焦点落到 `通用` 按钮。
⇒ **在已选中的分类按钮上按空格，官方把选中项重置回第一个分类**；同位置按 `Enter` 则毫无变化（G766）⇒ 两个"激活键"在同一按钮上语义不同。
⇒ 本地取舍：照抄＝"重置"；做成 no-op＝**有意偏差**（理由：误触不该让用户丢掉正在看的分类）⇒ 需在 gap 表登记原因。

### 15.3 面板 a11y 词表（gap `G773`，承 G763）

`[role=dialog]` 内 `button` 共 8 枚＝7 分类按钮（`aria-label` **全 null**，只有可见中文）＋ 关闭按钮（`aria-label="Close"`、class `_closeButton_hlglt_29`）⇒ 中文界面里关闭按钮可读名是英文。`kbd` 元素 `aria-label`／`title` **全空**（样本 `⌫`／`Ctrl`／`Shift`／`⏎`）⇒ 读屏用户拿到裸字形。⇒ 复刻建议：分类按钮补中文 `aria-label`、关闭按钮补「关闭」、键帽补屏幕阅读器读法（`⌫`→退格、`⏎`→回车、`⤒`／`⤓`→顶部／底部）。

### 15.4 `意见反馈` 按"不可采"结案（gap `G774`）

三条通路已穷尽：站内弹层＝0（700 ms 内无 `[role=dialog]`）；新标签＝拦截 `window.open` 后 captured＝null；页内导航＝`location.href` 未变、`title` 未变、`body.children` 未增 ⇒ 只剩 `mailto:`／OS 层邮件客户端这类**本连接器观测不到**的候选。⇒ 记"未确认＋不可采原因"，不得写成"官方无此行为"。

### 仍未采到（第 85 批·上半 刷新）

- ☆ 89 条主行明细与 §十二 表 A–E 的逐条对账（尤其 `样式` 27 命令／80 键帽档内的同键冲突）。
- ☆ `Space` 重置的机制层原因（`setCategory(0)` 还是重挂载）⇒ 属静态批，读面板组件 handler 源码即可。
- ☆ 别名行的数据源字段名（bundle 侧未确认）与"为何只有 4 个分类有别名行"。
- ★★★ A／B／C／D／E／G 的按键效果与弹层仍为零条 ⇒ 卡在第 85 批沙盒写入授权。

## 十六、面板键帽词表、两条可推导恒等式与两次采集互证（✓ 第 85 批·下半·零写入本地批 2026-09-28 10:23–10:27，纯本地对账 `_harvest/b85-panel-7cat.json` ↔ §十二，**本轮零浏览器调用**）

输入＝第 85 批上半落盘的逐分类明细（89 条主行 `命令名 = 键帽串`、6 条别名行）＋ §十二 那 89 行（源自第 81 批的整屏文本转储）。两条来源的**采集手法完全不同**（前者＝逐分类点击后按 `_row_` 读每行 DOM，后者＝开面板后一次性取整屏可见文本），本节做三件事：恒等式核验、同组合冲突矩阵、两次采集互证。

### 16.1 恒等式一：每条命令恰好一枚"非修饰键"⇒ 面板没有序列键

把 89 条主行的键帽串按 `+` 切开并分类：**修饰键（`Ctrl`／`Shift`／`Alt`）119 枚 ＋ 非修饰键 89 枚 ＝ 208 枚**，而非修饰键的 89 **恰好等于主行数**，且逐行检查"非修饰键数≠1"零命中。⇒ 官方面板里**没有任何"两个主键"或"先后序列"（GNU/Emacs 风格 `Ctrl-X Ctrl-K`）式键位**，键位模型可定形为 `{mods:{ctrl,shift,alt}, key:string}`，不需要序列槽。
修饰键数量直方图：**0 枚 13 条／1 枚 35 条／2 枚 39 条／3 枚 2 条**（合计 89）。⇒ 全表面板唯一的三修饰键组合是 `Ctrl+Alt+Shift+T`（将任务标记为已取消，在任务类与样式类各印一次＝2 条行、1 条命令）。
13 条**无修饰键**命令逐个列出（这是"裸键"全集，本地实现里它们最容易和浏览器默认行为打架）：`esc`（通用·取消）、`⏎`×2（任务·编辑任务、编辑·编辑文本区块）、`↑`／`↓`／`←`／`→`（任务视图四导航）、`⌫`×3（任务·删除、合集·清除单元格内容、合集·清除单元格值）、`space`（编辑·在下方插入新区块）、`/`（编辑·打开斜线菜单）、`Tab`（样式·增加缩进）。

### 16.2 恒等式二：`kbd` 计数可完全重算；别名行是第二种序列化风格

把每类"主行键帽数 ＋ 别名行键帽数"与该分类屏上实际 `<kbd>` 元素数（`kbd` 字段）比对，**七个分类全部相等**，合计 208＋11＝219：

| 分类 | 主行 | 主行键帽 | 别名行 | 别名键帽 | 重算合计 | 屏上 `<kbd>` | 平均键帽/主行 | 小标题段数 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 通用 | 7 | 14 | 1 | 2 | 16 | 16 | 2.00 | 2 |
| 文档 | 4 | 11 | 0 | 0 | 11 | 11 | 2.75 | 0 |
| 任务 | 15 | 31 | 2 | 3 | 34 | 34 | 2.07 | 2 |
| 编辑 | 13 | 27 | 0 | 0 | 27 | 27 | 2.08 | 5 |
| 样式 | 27 | 76 | 2 | 4 | 80 | 80 | 2.81 | 5 |
| 整理 | 6 | 13 | 0 | 0 | 13 | 13 | 2.17 | 2 |
| 合集 | 17 | 36 | 1 | 2 | 38 | 38 | 2.12 | 2 |
| 合计 | 89 | 208 | 6 | 11 | 219 | 219 | 2.34 | 18 |

★ **但按 `+` 切别名行会少数 5 枚**：主行存成 `Ctrl+Shift+,`（带 `+`），别名行只有行 innerText（`或者CtrlP`、`或者Ctrl/`、`或者CtrlE`、`或者Shift⏎`）**没有任何分隔符** ⇒ 同一份面板数据里两种键帽序列化风格并存。6 条别名中 5 条双键、1 条单键（`或者Delete`），差值恰为 5，且**逐类吻合**（通用 −1／任务 −1／样式 −2／合集 −1，其余三类 0）。⇒ ★ 反向教训：**按字符走查同样会错**（`Delete` 会被拆成 6 枚）⇒ 判"这行有几枚键帽"的唯一可靠办法是数 `<kbd>` 元素，任何由文本反推的计数都要先声明它是哪种切分法。
☆ 平均键帽数最高的是 `样式`（2.81）与 `文档`（2.75）——`样式` 高是因为块型档全带 `Ctrl+Shift+数字`，`文档` 高是因为 4 条里 2 条是 `Ctrl+Shift+⤒/⤓`。

### 16.3 键帽词表：49 种 token、三套字形风格混用、零 Mac 修饰字形

按类汇总 208 枚主行键帽的出现次数（token 种类＝去重后的键帽字形数）：

| 类 | token 种类 | 出现次数 | 明细（字形＝次数） |
| --- | --- | --- | --- |
| 修饰键 | 3 | 119 | `Ctrl`=65　`Shift`=38　`Alt`=16 |
| 方向／箭头 | 6 | 17 | `←`=3　`↑`=3　`→`=4　`↓`=3　`⤒`=2　`⤓`=2 |
| 字母 | 18 | 35 | `T`=5　`G`=4　`Z`=4　`A`=2　`B`=2　`D`=3　`F`=2　`K`=2　`S`=2　`C`=1　`E`=1　`I`=1　`J`=1　`L`=1　`M`=1　`N`=1　`O`=1　`P`=1 |
| 数字 | 9 | 9 | `1`…`9` 各 1，**没有 `0`** |
| 标点与特殊 | 13 | 28 | `⏎`=8　`⌫`=6　`space`=2　`Tab`=2　`\`=2　`esc`=1　`/`=1　`[`=1　`,`=1　`.`=1　`-`=1　`'`=1　`` ` ``=1 |

★ **`⌘ ⌥ ⇧ ⌃` 一个都没出现** ⇒ Windows 面板把修饰键渲染成英文词（`Ctrl`／`Shift`／`Alt`），却把回车与退格渲染成 Mac 风格 Unicode 符号 `⏎`／`⌫`，另有 `esc`／`space`／`Tab` 三个**小写英文单词** ⇒ 同一张表里**三套字形风格并存**（英文词／Unicode 符号／字面字符）。⇒ 本地若做键位显示，必须有一张"逻辑键 → 平台字形"的映射表并**照抄这种混搭**，不要"顺手统一成 ⌘ 风格"或"统一成 Ctrl+Enter 大写"。
★ 数字档只印到 **1–9**、`0` 档的位置被反引号占据（`取消列表格式 = Ctrl+Shift+` `` ` ``）⇒ §十二 表A 那条"Windows 数字档整体位移、0 档落到反引号"的推论，本轮在**词表层面**第二次得到确认（不是单条命令的巧合）。
☆ 标点里 `\` 出现 2 次是两个不同命令（`切换左侧边栏 = Ctrl+\`、`焦点 = Ctrl+Shift+\`），差一枚 `Shift`；`'`（单引号）只出现 1 次（`块 = Ctrl+Shift+'`）⇒ 面板把反引号、反斜杠、单引号当成三枚独立键帽，彼此不撞。
★★ **给「采集方法更正」第 5 条（keyboard.md:255，`check-keyboard.mjs` 那两处恒久 DIFF）补第三次独立确认，并把口径收紧**：`⌘ ⇧ /` 那两行的正确值确实是反斜杠 —— 本轮词表给出**两条独立判据**：① `\` 作为键帽在整个面板只出现 **2 次**，恰好对应 `TOGGLE_LEFT_SIDEBAR` 与 `FOCUS_DECOR`；② `/` 作为键帽只出现 **1 次**，属于「编辑·打开斜线菜单」这条**裸键**命令（无任何修饰键）⇒ `/` 不可能同时是两条 `Ctrl+Shift` 命令的键帽。⇒ 结论不变（**表里的值是对的、仪器是错的，正文不要动**），但判据从"肉眼看那两行"升级为"整张字形表计数"。**表内 `\\` 双反斜杠仍是刻意的**（`check-tables.mjs` 对两种写法都判 CONSISTENT，单反斜杠紧邻竖线会断表）。

### 16.4 同组合冲突矩阵（程序算全，含 §十二 要点 3 未列的两处）

主行 × 主行 范围内，同一"归一化组合"（`+` 切分后排序）挂在 **>1 条命令**上的共 16 组：

| 归一化组合 | 命令数 | 挂载的命令（分类·标签） | §十二 是否已记 |
| --- | --- | --- | --- |
| `Ctrl+Alt+T` | 3 | 任务·将任务标记为已完成／样式·将任务标记为已完成／样式·打开/关闭切换 | ★ **未完全记**：要点 3 只按"跨分类复用"记，没指出**同一分类（样式）内部**也有两条不同命令共用它 |
| `⌫` | 3 | 任务·删除／合集·清除单元格内容／合集·清除单元格值 | 已记 |
| `Ctrl+Alt+Shift+T` | 2 | 任务·将任务标记为已取消／样式·将任务标记为已取消 | ★ **要点 3 未列**（要点 4 只作为"重复印刷"入账） |
| `Ctrl+⌫` | 2 | 合集·删除行／合集·删除行 | ★ 未列：这组是**标签也相同、键位也相同**的两行（分属两个小标题段） |
| `Ctrl+→` | 2 | 通用·导航到／任务·导航至区块 | 已记 |
| `Ctrl+A` | 2 | 文档·全选／合集·选择所有行 | 已记 |
| `⏎` | 2 | 任务·编辑任务／编辑·编辑文本区块 | 已记 |
| `Ctrl+Z` | 2 | 任务·撤销／编辑·撤销 | 已记 |
| `Ctrl+Shift+Z` | 2 | 任务·重做／编辑·重做 | 已记 |
| `Ctrl+D` | 2 | 编辑·创建副本／合集·复制行 | 已记 |
| `Ctrl+G` | 2 | 编辑·查找下一个／整理·组合 | 已记 |
| `Ctrl+Shift+G` | 2 | 编辑·查找上一个／整理·取消组合 | 已记 |
| `Alt+↑` | 2 | 整理·向上移动／合集·向上移动行 | 已记 |
| `Alt+↓` | 2 | 整理·向下移动／合集·向下移动行 | 已记 |
| `Ctrl+Shift+⏎` | 2 | 合集·在前面添加行／合集·添加列 | 已记（派发归属见 G742） |
| `Ctrl+⏎` | 2 | 合集·添加行／合集·添加一行 | 已记 |

★ 另有 **1 条只在"主行↔别名行"合并后才显形**的冲突：`Shift+⏎` 既是主行「编辑·编辑页面区块」的串，又是别名行「合集·添加一行」的第二绑定 ⇒ 上面这张程序算出的矩阵**只覆盖主行×主行**，跨形态冲突必须把别名行并进同一张反查表才会出现。⇒ 本地若做"按键位反查命令"（例如冲突检测、或"这个键被谁占了"的提示），**必须把主串与别名串并进同一个多值索引**，按形态分开建两张表就会漏。
☆ 面板内**复用度最高是 3**（`Ctrl+Alt+T` 与 `⌫`）⇒ 官方自己不保证"一键一命令"，因此"面板里印了这条键"绝不能当作"这条键属于这个命令"的证据（§十二 判据再确认一次）。

### 16.5 两次独立采集互证：89 条标签与 89 条主串全部对齐

按分类顺序逐行对齐（89 ↔ 89）：

1. **命令名 89/89 对齐**。唯一 19 处的写法之别**全部是我在 §十二 手工补的消歧前缀**（`样式·…（列表段内）` 2 条、`合集·在表格中·` 12 条、`合集·在合集中·` 5 条），面板原文里并没有这些前缀 ⇒ §十二 的分段注解与面板真实分段一致，不是臆造。
2. **主键位串 89/89 一致**（归一化掉 `+`、反引号与"或者"尾巴后）。报告出的唯一 1 处"不一致"是 `样式·取消列表格式`：§十二 为容纳键帽本身是反引号，写成了 `` `` CtrlShift` `` `` 的双反引号形式，我的解析器取第一个反引号段取到空串 ⇒ **是解析器局限，不是数据冲突**，两源都是 `Ctrl+Shift+` 加反引号。
3. **别名行数 6 = 6**，且逐类分布相同（通用 1／任务 2／样式 2／合集 1，文档与编辑 0）。
⇒ 结论：**面板键位表已是双源可复现的静态事实**，后续不必再为"要不要重采一遍面板"花浏览器预算；要花的预算只在**键位是否真的生效**（§九 至今仅 9 条按过）与**焦点上下文会不会换串**。

**仍未采到（键帽词表面·第 85 批·下半）**
- ☆ `文档` 分类的**小标题段数采到 0**，其余六类为 2／2／5／5／2／2（合计 18）。同一次脚本、同一选择器在其余六类都取到非空 ⇒ 更可能是"该分类真的不分段"，但也可能是该分类用了另一个 class；本轮没有留原始判据（`sectionTitle` 节点数与该分类首层子元素的 class），**标 `~` 未确认**。
- ☆ **面板↔键位是否随焦点上下文换串**仍未测（§十二 遗留，本轮是纯本地批，无新证据）。
- ☆ 16.4 的矩阵只覆盖**主行×主行**；"别名行×别名行"的冲突未算（6 条别名太少，且两条 `Ctrl/` 属同一命令在两个分类的重印，不构成新冲突）。
- ☆ 词表里 18 个字母 token 只给出屏上次数，**未反查它们各自属于哪张注册表的描述符**（属静态批：需要在 bundle 的 modifier 描述对象里逐个字母对齐 `key` 字段）。
- ☆ 数字档"整体位移"只有 `0→反引号` 一档拿到屏上证据；`1–9` 是否也位移（即官方描述符里写的是 `Digit1` 还是 `1`）仍未证。

## 十七、面板键盘导航定版矩阵 ＋ `Space` 改判 ＋ 四口径表（✓ 第 86 批·上半 2026-09-28 10:35–10:39，零写入，`browser-use` MCP ＋ OS 级 `press_key` ＋ 页内按键日志器；`visibilityState=hidden` ⇒ **无截图**）

本轮把"分类按钮上到底哪些键有用"一次测清，方法＝先把 **DOM 焦点与选中项分开放**（`el.focus()` 放焦点，面板选中项是跨重载保持的 `合集`），再逐条按键，每条键采 **keydown/keyup × 即时/延迟 520 ms** 四个点。原始数据 `_harvest/b86-keylog.json`（16 条采样）、`_harvest/b86-sections.json`、`_harvest/b86-verify.json`。

### 17.1 键盘导航定版矩阵（焦点在分类按钮上时）

| 键 | 对焦点的作用 | 对选中项的作用 | 证据 | 状态 |
| --- | --- | --- | --- | --- |
| `Space` | 焦点不动；被激活的按钮 class 由 `_variantDefault_` 转 `_variantActive_` | **激活"焦点所在"的分类**（前置：焦点 `文档`／选中 `合集` ⇒ 结果 `文档`） | keydown/keyup 即时点仍 `合集`，520 ms 两点为 `文档` | ✓ |
| `Enter` | 不动 | **不变**（前置：焦点 `通用`／选中 `合集` ⇒ 仍 `合集`） | 四个采样点全 `合集` | ✓（★ 官方抑制 Enter） |
| `ArrowDown` | **不跟随**（焦点仍 `文档`，class 保持 `_variantDefault_`） | 选中前移一档（`文档`→`任务`，`rows 17`／`kbd 34`） | keyup 即时点已变 | ✓（本轮阳性对照） |
| `ArrowUp` | 同上 | 选中后移一档 | 第 84 批上半已证（`合集`→`整理` 一步还原） | ✓ |
| `ArrowLeft` | 不动 | **不变** | 即时与 520 ms 四点全 `任务` | ✓（第三次复现，由 `~` 升） |
| `ArrowRight`／`Home`／`End` | — | — | 第 84 批上半的"送达但未注册"（G766）本轮**未重测** | `~` |
| `Tab` | 只移焦点（第 84 批上半 V66） | 不变 | V66 | ✓ |
| `Escape` | — | 关栈顶一层，下层 menu 残留 | V63、G761 | ✓ |

★ **面板没有 roving tabindex**：选中项被 `ArrowUp`/`Down` 改变时焦点**不搬**，所以"当前聚焦项"与"当前选中项"可以长期不一致，而 `Space` 只认前者。⇒ 本地规格＝`{selectedIndex, focusedIndex}` 两个独立 state。
☆ 可及性缺陷候选：只用 `Enter` 的键盘／读屏用户在官方面板里**切不了分类**（`Enter` 被抑制、左右键未注册）。本地若让 `Enter` 也能激活，要登记为**有意偏差**（原因＝可及性，见 gap G783）。
★★ **`Space` 的生效时机**：即时采样点看不到变化、520 ms 才看到 ⇒ 与"原生 button 在 **keyup** 才合成 click"一致；但 200／400 ms 两档未测，机制未证（见末段）。

### 17.2 ★★★ `Space` 改判：上一批的"重置回第一个分类"是误读

第 85 批观察到"点 `合集` 后按 `Space`，选中回到 `通用`"，据此写下"`Space` 重复激活当前分类＝重置索引"（gap G772）。本轮把焦点与选中分开放之后证明：**`Space` 激活的是聚焦按钮**，而**页面 reload 后浏览器默认把焦点放在第一个分类按钮**（`通用`），选中项 `合集` 却是跨重载保持的（G756）⇒ 两状态本就分离，于是产生"看起来像重置"的假象。⇒ **G772 作废**，改判记入 gap **G782** 与 `interactions.md` **V70**。
⇒ 通用教训（比这条事实更贵）：**按键实验必须先记录 `document.activeElement`，否则"命令语义"可能是"焦点默认值"的投影。** 官方面板并没有任何"重置"分支。

### 17.3 四口径表（本轮新增第四口径＝弹层自身长度；三口径为第三次独立复现）

| 分类 | 行数 | 主行（＝命令数） | 别名行 | 键帽 | 分段标题数 | 分段标题（逐字） | 弹层 `outerHTML` 长度 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 通用 | 8 | 7 | 1 | 16 | 2 | 导航／视图 | 15,920 |
| 文档 | 4 | 4 | 0 | 11 | **0** | （无） | 14,753 |
| 任务 | 17 | 15 | 2 | 34 | 2 | 全局快捷键／在任务视图中 | 18,432 |
| 编辑 | 13 | 13 | 0 | 27 | 5 | 插入新区块／编辑选择／评论／在查找和替换中／其他 | 17,780 |
| 样式 | 29 | 27 | 2 | 80 | 5 | 文本样式／列表／装饰／缩进／文字格式 | 23,678 |
| 整理 | 6 | 6 | 0 | 13 | 2 | 移动所选区块／组合与取消组合 | 15,375 |
| 合集 | 18 | 17 | 1 | 38 | 2 | 在表格中／在合集中 | 18,837 |
| 合计 | 95 | 89 | 6 | 219 | 18 | — | — |

★ `文档` 分类的"0 个分段标题"**结案**（G780 → 已证）：同一脚本同一选择器在其余六类都取到非空，且 `文档` 与 `整理` 的骨架 class 逐字相同（dialog 直接子＝`NAV#_sidebar_dm375_26` ＋ `DIV#_main_dm375_37`，行容器＝`DIV#_sections_dm375_82`）⇒ 同结构取到 0 只能是数据里没有 ⇒ 复刻时"分段标题"要当**可选**字段，本地若统一强判非空会渲染出官方没有的空段。
☆ **第四口径的用途**：此前所有 `len` 都是整页 `outerHTML.length`（受列表虚拟滚动与相对时间文本干扰，见 G760／G764／G770）。弹层自身长度只随分类变化（14,753–23,678，`样式` 最长），是**弹层内更适合的指纹**；但仍只应在同一生命周期内作相对判据。

**仍未采到（键盘导航面·第 86 批·上半）**
- `ArrowRight`／`Home`／`End` 本轮未重测（沿用第 84 批上半的 `~`）。
- 分类按钮上的**真实 `Tab`/`Shift+Tab` 序列落点**未证（本批焦点由程序放置；坐标点击在本桥后台标签不可用）。
- `Space` 的生效延迟机制未拆（需要 200／400 ms 定时采样区分"keyup 合成 click"与"React 渲染节流"）。
- 面板是否随**焦点上下文**（正文／表格／集合／任务视图）换串仍未测——本批焦点始终在面板内。
- ☆ **仪器效应**（G787）：页内 `element.click()` 不搬 DOM 焦点 ⇒ 本批"点 `整理` 后焦点仍是 `文档`"是工具假象，**不得**当作官方行为引用。

## 十八、面板键帽串与焦点上下文 ＋ `Space` 生效时机 ＋ 还原复核四计数口径（✓ 第 86 批·下半 2026-09-28 11:53–12:13，零写入，`browser-use` MCP ＋ OS 级 `press_key`，**无截图**）

数据源 `_harvest/b86-ctx-list.json`（列表屏）、`b86-ctx-tasks.json`（任务视图）、`b86-k2-install.json`＋`b86-k2-log.json`（时机采样）、`b86-restore2.json`＋`b86-verify2.json`（还原复核）。

### 18.1 两档焦点上下文逐行比对（键帽串不换）

方法＝在两档上下文各开一次面板，逐分类逐行读 `命令名｜键帽串`（主行取 `_rowName_`、别名行取 `_rowAlternative_`，键帽串由该行全部 `<kbd>` 以 `+` 连接），程序逐字比对：

| 分类 | 行数 | 键帽串比对 | 分段数 | 弹层长度 | `contentChildren` |
| --- | --- | --- | --- | --- | --- |
| 通用 | 8 | IDENTICAL | 2 | 15,920 | `DIV#_sections_dm375_82` |
| 文档 | 4 | IDENTICAL | 0 | 14,753 | 同 |
| 任务 | 17 | IDENTICAL | 2 | 19,061 | 同 |
| 编辑 | 13 | IDENTICAL | 5 | 18,409 | 同 |
| 样式 | 29 | IDENTICAL | 5 | 24,308 | 同 |
| 整理 | 6 | IDENTICAL | 2 | 15,375 | 同 |
| 合集 | 18 | IDENTICAL | 2 | 19,466 | 同 |

⇒ **列表屏（`focusBefore=BODY`）与任务视图（`…/tasks/inbox`，路由已切、`focusBefore=BODY`）两档下，89 主行＋6 别名行的命令名与键帽串全部逐字相同**，分段数、行数、`contentChildren` 也相同，两档的弹层长度逐一相同。⇒ 结案 §十二／G781 挂着的"面板是否随焦点上下文换串"：**这两档不换串**；本地做面板时键帽表可当**全局静态数据**渲染，不必接焦点上下文信号。
☆ 覆盖边界：**正文块焦点、表格单元格焦点、合集行焦点**三档仍未测（后两档需要已有表／合集的实体，属沙盒授权或用户确认的既有实体）。

### 18.2 `Space` 的生效时机＝`keyup` 同帧（改写 §十七 的"延迟未证"）

采样：capture 相位 `keydown`／`keyup` 各一点，`keyup` 后 50/100/200/300/400/600 ms 各一点（记 `dt`）。前置态＝焦点 `通用`（`def`）、选中 `合集`（rows 18／kbd 38／len 19,466）。

| 采样点 | 真实 dt | 选中项 | rows/kbd/len | 焦点 class |
| --- | --- | --- | --- | --- |
| keydown | — | `合集` | 18/38/19,466 | `通用·def` |
| keyup | 0 ms | `合集` | 18/38/19,466 | `通用·def` |
| t50 | **58 ms** | **`通用`** | **8/16/15,920** | **`通用·ACTIVE`** |
| t100／t200／t300／t400／t600 | 105–615 ms | `通用` | 8/16/15,920 | `通用·ACTIVE` |

★ **上一批"只有 520 ms 采样点看到变化"是仪器效应**：capture 相位的 `keyup` 监听跑在浏览器为原生 `<button>` 合成 `click` **之前**，所以那两点读到的是"click 前"状态；真实链路是 `keyup → click → setState`，**58 ms 内完成**。
⇒ **判据修订（比这条事实更贵）**：第 83 批的"派发后必须等 ≥400 ms 才能判静默失效"要加限定——**它假设采样点在事件链之后**；若监听挂在 capture 相位的 `keydown`/`keyup`，事件链尚未结束，必然读到"未生效"的假象。今后口径：**capture 相位监听 ＋ 事件链结束后 ≥50 ms 再采样**。

### 18.3 还原复核四计数口径（`Close` 不关下层菜单）

程序点面板右上角 `Close`（`aria-label="Close"`）关闭 dialog 后**立刻**读角色计数，得到 `dialog:0`、**`menu:1`／`menuitem:6`／`group:1`** ⇒ 下层帮助菜单仍在，一直挂到 `reload` 才消失。⇒ 与 G761 的"`Escape` 只关一层"同源，但这次是 `Close` 通路 ⇒ **关闭对话框从来不等于关闭整串弹层**。
⇒ **可执行口径（入册）**：还原复核必须同时报 **`dialog`／`menu`／`group`／`menuitem` 四项且全 0**，只看 `dialog===0` 会漏掉残留菜单。本批终态：四项全 0、直方图 `img:3 presentation:8 button:3 checkbox:8`，与开批基线一致。

### 18.4 跨重载的弹层长度"台阶"（G790）

跨一次 `navigate_page(reload)` 前后，`任务` 18,432→19,061、`编辑` 17,780→18,409、`样式` 23,678→24,308、`合集` 18,837→19,466（各约 +629），而 `通用` 15,920／`文档` 14,753／`整理` 15,375 **逐字节恒定**；行数、分段数、键帽数、`contentChildren` 全部相同。⇒ 这不是随机漂移，是**按分类分档的结构性台阶**（高内容四类多出约 629 字节的同一处元素，位于 `_sections_` 内部），但本轮未存 `outerHTML` 故**未定位到那 629 字节**。
⇒ 规则：**"绝对字节只在同生命周期内可比"从整页扩展到弹层自身**（承 G760／G764／G770）；面板自检应校验**行数／键帽数／分段数**三个结构量，不要校验字节。

**仍未采到（键盘面板面·第 86 批·下半）**
- 焦点上下文换串只测两档（列表／任务视图）；**正文、表格、合集**三档未测。
- `ArrowRight`／`Home`／`End` 本轮第一轮日志因**帮助菜单懒渲染**（900 ms 取空 `n=0`）而作废 ⇒ **仍未测**，沿用第 84 批上半的 `~`，不得当已测。
- G790 的 +629 字节未定位（需跨重载前后各存 `dialog.outerHTML` 并 diff）。
- ☆ 仪器两条：帮助菜单**跨视图首开要留 1.4–1.5 s**（列表屏 700–900 ms 够）；`visibilityState` 同批内会来回翻（本批中段 `visible`、收尾 `hidden`）⇒ 截图现场读。

### 18.5 入口可用性台账（✓ 第 87 批·上半 2026-09-28 12:42–12:51，零写入；**入口缺失 ⇒ §十七 的 `ArrowRight`／`Home`／`End` 重测与 `Tab` 落点未能开跑**）

| 通路 | 在 648×578 CSS px（DPR 1.25）下的实测 | 结论 |
| --- | --- | --- |
| 顶栏 `DIV[aria-label="Question Mark Icon"]` →「快捷键」menuitem | `querySelector` 返回 **null**；全页 40 个 `aria-label` 无 question／help／快捷键 项；同一选择器在**同一路径** `…/all` 的第 84 批、第 86 批·上半均一次命中 | **该视口下入口不渲染**（成因未证：宽度门控 vs 窗口状态，标 `~`） |
| 顶栏 `⋯`（列表屏视图菜单） | 12 项＝网格视图／瀑布／列表视图／名称／上次浏览／创建日期／更新日期／显示每日笔记／导入／导出为 Markdown／导出为 TextBundle／空间设置 | **不含「快捷键」** ⇒ 无替代入口 |
| chord `Ctrl+Shift+,` | OS 级 `press_key` 不通（第 83/84 批已判） | 自动化 OS 通路不可达 |

⇒ **环境级阻断**：凡依赖"先开面板"的重测全部保持 `~`（`ArrowRight`／`Home`／`End`、`Tab`/`Shift+Tab` 焦点落点、焦点上下文换串的表格／合集档）。**解锁条件＝用户把视口恢复到正常宽度**（顺带解锁截图）。
⇒ **复刻含义（有意偏差候选）**：官方的帮助入口受视口门控、窄视口下只剩 chord；本地若做面板**必须**给一个窄视口下仍在的入口（视图菜单内一项／固定快捷键），原因登记＝官方此处可及性更差。

## 十九、面板组件源码首探：模块边界、行渲染结构、平台过滤（✓ 第 87 批·下半 2026-09-28 12:56–13:00，零 UI 交互＝`evaluate_script` ＋ 页内 `fetch`，**未动页面状态**，原文留系统 Temp 不入仓库）

**手法（可复用）**：① 遍历 `document.styleSheets` 找含 `_sectionTitle_dm375_93` 的规则 ⇒ 面板 CSS 全在 **`index.css.CP00jDAy.css`** ⇒ 组件必在**主 bundle** `index-DiTmKH3z.js`（6,841,180 B）；② 页内 `fetch` 主 bundle 后**在页内 `indexOf`**，只回传偏移表与小窗口片段；③ 按 CSS 类名偏移反推模块边界，再统计窗口内 `onKeyDown`／`tabIndex` 计数得**否定结论**。

### 19.1 模块边界与偏移表

| 键（CSS 类） | 偏移 | 含义 |
| --- | --- | --- |
| `_closeButton_hlglt_29` | 1,365,369 | **dialog 外壳**另一模块（`hlglt`） |
| `_action_1j891_1` | 2,092,143 | 分类按钮（DS `actionButton`）样式入口 |
| `_variantActive_1j891_163` | 2,092,580 | 选中态 |
| `_categoryTitle_dm375_70` | 2,116,956 | 分类标题 |
| `_sectionTitle_dm375_93` | 2,117,094 | 分段标题 |
| `_rowName_dm375_110` | 2,117,175 | 主行标签 |
| `_key_dm375_124` | 2,117,306 | 键帽 |

⇒ **面板主体模块 ≈ 2,092,143–2,117,306（约 25 KB）**。窗口 2,114,800–2,120,400 内 `onKeyDown` 计数 **0**、`tabIndex` 计数 **0**；全包 `onKeyDown` 共 **37** 处（最近 1,060,903 与 2,197,928，**均在模块外**）、`onKeyUp` 见 2,197,928 附近、全包 `tabIndex` 仅 **12** 处、`"Enter"` 字面量 9 处（19,501／2,196,492／2,246,965／4,531,569…）。

★ **否定结论**：`Enter` 被抑制（G783）与 `ArrowLeft` 未注册（G785）**不是面板组件代码做的** ⇒ 下一步去**全局键处理器**（候选 1,060,238／1,060,903／2,197,928／2,247,538）与 **`vendor-ds` 的按钮**里找。

### 19.2 行渲染结构（逐字，压缩空格）

```js
b.shortcuts.map((y,C)=>{
  const x = y.shortcuts.map(w => v9t(Cae(w))).filter(w => w.length>0);
  return a.jsx("div",{children: x.map((w,S)=>a.jsxs("div",{className:Aa.row, children:[
    S===0 ? a.jsx("span",{className:Aa.rowName,       children:y.getName(e)})
          : a.jsx("span",{className:Aa.rowAlternative, children:e("or")}),
    a.jsx("span",{className:Aa.keys, children: w.map((v,I)=>a.jsx("kbd",{className:Aa.key, children:G9t(v)},I))})
  ]},S))}, `${b.id}-${C}`)
})
```

四条可落地事实：
1. **主行／别名行由 `S===0` 判定**；别名行文案 key ＝ **`or`**（i18n，中文＝「或者」）⇒ 别名行不是独立字段，是同一命令的**第二个 display**。
2. **每个 display 是独立渲染的**：`span.rowName`／`span.rowAlternative`（纯文案）＋ **兄弟节点** `span.keys` 挂多个 `<kbd>` ⇒ **文本里没有键帽分隔符**，分隔在 DOM 结构里 ⇒ 承 G796 改判（主行与别名行 `innerText` **同样**无分隔，"两种序列化风格"是我两条读取路径不对称造成的假象）。
3. **键帽字形由 `G9t(descriptor)`** 从描述符生成 ⇒ 与 §十三 描述符链／`winMatcher` 对上。
4. 导航：`aria-label = e("preferences.keyboard.shortcuts")`（新 i18n key）。

### 19.3 平台过滤发生在"描述符 → 显示串"阶段

`y.shortcuts.map(w=>v9t(Cae(w))).filter(w=>w.length>0)` —— `Cae` ＝平台 matcher（＝§十三 的 `winMatcher` 一族）、`v9t` ＝转显示串，**空结果被过滤掉**。⇒ ① 某平台只剩一个 display ⇒ 只有一行（解释"别名行只出现在 4 个分类"的**下界**）；② 描述符层即可裁行，**组件层不判平台** ⇒ 本地若要"按平台隐藏第二键位"，逻辑应放在**描述符→显示串**这一步，不是渲染层。

### 19.4 导航二态（响应式开关存在，条件未定位 `~`）

`i ? nav.compactNav + Npe({value:d.id, onValueChange:c, items:[{value,icon,ariaLabel}]}) : nav.sidebar`（同一 `aria-label`）⇒ 官方在某条件下切 **compact（Tabs 型受控）** 与 **sidebar（列表型）** 两种导航。★ 与 G793（窄视口下顶栏帮助按钮不渲染）同属响应式开关家族；`i` 的求值表达式在窗口外 ⇒ **未定位**。本地若只做一态要登记**有意偏差**（原因＝官方二态但单态不影响功能）。

**仍未采到（源码面·第 87 批·下半）**
- `Enter` 抑制／`ArrowLeft` 未注册的实现位置（全局键处理器或 `vendor-ds` 按钮）；全包 12 处 `tabIndex` 未逐个看。
- `i`、`Cae`、`v9t`、`G9t`、`Npe`、`Aa` 的定义未读（窗口不够）；`hlglt`（dialog 外壳）模块未读。
- G793 的视口门控成因（需用户恢复视口）；★ A–G 效果面仍为零（需第 87 批沙盒授权）。
- 临时残留：系统 Temp 里 4 个 bundle 片段文件应清理。

## 二十、键位导航与字形常量表的源码定位（✓ 第 88 批·上半 2026-09-28 13:03–13:08，零 UI 交互＝页内 fetch ＋ `indexOf`，**未动页面状态**；原文留系统 Temp 不入仓库）

本节回答两个悬案：**面板纵导航来自哪**（部分）与**键帽字形从哪来**（结案）。

### 20.1 官方菜单焦点导航 hook `MRt` @2,629,970（逐字）

```js
nee='[role="menuitem"]:not([data-disabled])';
function MRt(t,e){                       // 挂载：聚焦第一个可选项
  … c=t.current; c.querySelector(nee)?.focus({preventScroll:!0}) …
  i = r => { const c=t.current; if(!c)return;
    const d=Array.from(c.querySelectorAll(nee)), u=d.findIndex(ORt);
    if(r.key==="ArrowDown"){ r.preventDefault(); const f=u<d.length-1?u+1:0;
      d[f]?.focus({preventScroll:!0}); d[f]?.scrollIntoView({block:"nearest"}) }
    else if(r.key==="ArrowUp"){ r.preventDefault(); const f=u>0?u-1:d.length-1; … }
    else if(r.key==="Home"){ r.preventDefault(); const f=d[0]; … }
    else if(r.key==="End"){ r.preventDefault(); … } }
```

相邻常量 **`I6e=new Set(["ArrowDown","ArrowUp","Home","End"])`**（组件白名单）。

★ 三条结论：
1. **官方菜单的标准四键 ＝ `ArrowUp`／`ArrowDown`／`Home`／`End`**，含**环绕**（到头回绕）、`focus({preventScroll})` 与 `nearest` 滚动。
2. **白名单里没有 `ArrowLeft`／`ArrowRight`** ⇒ 与实测左右键无效**完全吻合**（G785／G766）；而 `Home`／`End` **在标准集里**。
3. `MRt` 只匹配 **`role=menuitem`** ⇒ 面板分类按钮若是 `BUTTON` 而不带该 role，此 hook 不会生效（分类按钮的 `role` **未记录** ⇒ G801 待验）。

### 20.2 键帽字形常量表与匹配链 @19,540（结案 §十六 的"字形从哪来"）

```js
const qs="Escape", oo="Enter", B4="Delete", vd=" ", nc="Backspace", f1="Tab",
      ms="ArrowDown", Ts="ArrowUp", Vl="ArrowLeft", Il="ArrowRight",
      XM="Home", JM="End", uEe="Meta", fEe="Control", Sae="Shift",
pEe = { [vd]:"space", [ms]:"↓", [Ts]:"↑", [Vl]:"←", [Il]:"→",
        [oo]:"⏎", [nc]:"⌫", [XM]:"⤒", [JM]:"⤓",
        BracketLeft:"[", BracketRight:"]", Slash:"/", Backslash:"\\",
        Quote:"'", Backquote:"`", Comma:",", Minus:"-" };
$N={keyCondition:{type:"keyCode", keyCode:t=>…}};
```

- **`pEe` 就是 §十六 字形表的来源**：`space`／`↓↑←→`／`⏎⌫`／`⤒⤓`／`[ ] / \ ' ` , -` 逐字对上；**键帽的"三套字形风格混用"是这张表决定的**（修饰键走英文词、回车退格走 Unicode、箭头走单字符、`Home/End` 走 `⤒⤓`）。
- **`dEe` 转换链**：`Digit*` → 去前缀取数字；`Key*` → 去前缀取字母；否则查 `pEe` ⇒ **描述符里的键名是 `KeyboardEvent.code` 族**（`BracketLeft`／`Slash`／`Backslash`／`Quote`／`Backquote`／`Comma`／`Minus`／`Digit1`／`KeyT`）。
- **`rEe` 匹配判据**：单字母走 `key.toLowerCase()===e`；否则 `(非单字母 unicode ／ Mac 且 altKey) && code===cEe(e)`，`cEe`＝`` `Key${大写}` `` ⇒ **字母键按 `code=KeyX` 匹配**（Shift／键盘布局会影响 `key`，用 `code` 才稳）。
- **`Ll` ＝ Mac 平台标志**：`Ll?"⌃":"Ctrl"`，标签 join **`Ll ? " " : "-"`** ⇒ **Mac 用空格连字、Win 用连字符**（`xo(t)=Cae(t).map(e=>e.label).join(...)`）。
⇒ 本地 `keycap()` 必须显式实现：① 字母键按 `code`（`KeyX`／`DigitX`）；② 字形查 `pEe` 同构的映射表；③ **Mac 空格／Win 连字符**的差异。

### 20.3 `Enter` 抑制与左右键的排除性结论

| 搜索 | 结果 | 结论 |
| --- | --- | --- |
| `"ArrowLeft"` 全包 | **仅 1 处（19,583，就在字形表里）** | ★ **主 bundle 层面没有任何 handler 引用左右键** ⇒ 实测无效有源码级否定证据 |
| `"Enter"` 全包 9 处 | 付费弹窗／**邮箱列表 `onKeyDown`（2,246,965，`preventDefault`＋聚焦下一行）**／styled／quick-open／caret／textarea 自适应 | 都不是面板或全局抑制 ⇒ **仍未定位** |
| `"ArrowUp"` 5 处 | 19,570 字形表、2,452,836 图标 switch、**2,630,187＝`MRt` hook**、2,631,302 相邻、5,456,645＝下拉"方向键展开"（`preventDefault, open()`） | 面板纵导航的出处**仍未定位**（面板模块内 0 处 `onKeyDown`） |
| `onKeyDown` 全包 | **37 处**（偏移清单见 G795／`b87-enter-regions.json`） | 下一步逐个看（候选已收窄） |

**仍未采到（键盘导航面·第 88 批·上半）**
- **`Home`／`End` 在面板分类按钮上的实测**（G801 待验，两种候选互斥）＋ 分类按钮的 `role` 未读 ⇒ 需**视口恢复**。
- `Enter` 抑制的实现位置；面板纵导航的确切出处（37 处 `onKeyDown` 未逐个读）。
- ☆ 系统 Temp 现有 6 个 bundle 片段（**不入仓库**），用完清理。

### 20.4 37 处 `onKeyDown` 全包指纹分类（✓ 第 88 批·下半 2026-09-28 13:12–13:15，零 UI 交互）

方法＝页内 fetch 主 bundle 后对 37 个 `onKeyDown` 偏移**逐个取 ±700 B 窗口**，统计窗口内 `"Enter"`／箭头字面量／`preventDefault`／`addEventListener("keydown"`／`menuitem` 出现情况（原始表 `_harvest/b88-kdmap.json`）。

| 分类 | 处数 | 偏移与归属 |
| --- | --- | --- |
| 含 `"Enter"` 字面量 | **2** | 2,247,538＝**邮箱列表** props（`onKeyDown:x`，其 handler 在 2,246,965：`key!=="Enter"\|\|shift/meta/ctrl/alt → preventDefault + 聚焦下一行`）；5,193,724＝textarea 样式定义旁 |
| 含箭头/`Home`/`End` | **2** | **2,631,502＝DS Menu 使用点**；5,457,081＝胶囊下拉"方向键展开" |
| `document`／`window` 级 `addEventListener("keydown"`（**37 个 `onKeyDown` 偏移 ±700B 窗口内**） | **0** | ✎ **第 89 批·下半更正**：这是**窗口口径**，不等于全包；全包实测 **7 处**（document 级 4 处，含分派器注册 @14,301）⇒ "主包没有全局键盘监听"不成立，见 §20.6.6／G813 |
| 其余 | 33 | 各组件自身的局部 `onKeyDown` prop（表单、快捷输入、下拉等） |

**2,631,502 逐字（`MRt` 的调用方）**：
```js
{onKeyDown:s, width:i, minWidth:l, maxHeight:r, ref:c}=t, d=k.useRef(null), u=la(c,d);
let f = S=>{ I6e.has(S.key) && T6e(d.current), s?.(S) };   // 白名单四键先过滚动辅助 T6e
… const h = MRt(…)                                          // 焦点导航 hook（2,629,970）
… a.jsx(<container>, {onKeyDown: f, …})
```
⇒ **白名单 `I6e` 先过 `T6e`（滚动辅助）再进 `MRt`（焦点移动）**；该模块的 CSS 模块 `ga` 是 `_searchList_16nf`／`_selectionList_16nf` ⇒ **这是 DS Menu 组件，不是面板自己的代码**。

**两条排除性结论**：
1. **主包层面"唯一列表导航＝DS Menu"** ⇒ 若面板分类按钮（或祖先）带 `role=menuitem`，则实测 `ArrowUp`/`ArrowDown` 生效由 `MRt` 解释、`Home`/`End` 也应生效（G801 的**正面候选**）；若不带，面板纵导航必在其他 chunk（主包已排除）。
2. **`Enter` 抑制不在主包、也不在面板**（37 处中 2 处的 `Enter` 都是局部组件），`vendor-ds`（181,813 B）**`"Enter"` 字面量 0**（G805）⇒ 候选收窄到三通道：`window.onkeydown=` 赋值式监听／`vendor-react` root listener 的应用侧回调／其他 211 个 app chunk 的懒加载组件。

**仍未采到（37 处分类面·第 88 批·下半）**
- `Enter` 抑制的实现位置（三通道候选）；`Home`／`End` 与分类按钮 `role` 的实测（需视口恢复）。
- 33 处"其余"只做了指纹、未逐个读语义（按需抽读）。

### 20.5 `Enter` 检查点穷尽：全包只有两处（✓ 第 89 批·上半 2026-09-28 13:16–13:19，零 UI 交互）

承 §20.4（37 处 `onKeyDown` 排除）继续：按**别名**与**数字 keyCode**两条通道反查（`Enter` 在键位库里的最小化别名是 `oo`；数字通道用 `===13`）。

| 搜索 | 全包命中 | 归属 | 是否全局 |
| --- | --- | --- | --- |
| `===oo`（＝`key==="Enter"` 的别名形式） | **1** @5,411,289 | 输入框组件：`if(ue.key===oo){ if(u===null){ ue.preventDefault(); return } i(u) }` ⇒ **未选中则拦默认、选中则提交** | 否（组件局部） |
| `===13`（数字 `keyCode`） | **1** @5,193,557 | DS 文本域：`f.key==="Enter" && f.keyCode===13 && (enterKeyCallback ? cb(f) : f.prevent…)` ⇒ **有回调就调、否则拦默认** | 否（输入组件局部） |
| `keyCode` 全部 | **16** | **14,736–19,884（键位条件库 `$N.keyCondition` 一族）** ＋ 4,531,556／590（styled） | 否（匹配用，非拦截） |
| `document`/`window` 级 `addEventListener("keydown"`（§20.4，**窗口口径**） | **0** | ✎ 全包 7 处（含分派器 @14,301），见 §20.6.6／G813 | — |

⇒ **三句话结论**：
1. **主包里"检查 Enter"的代码总共 2 处，都是输入类组件自身语义**；`keyCode` 只用于**键位条件匹配**。
2. ⇒ **`Enter` 在面板分类按钮上不激活的原因，至今没有在主包／`vendor-ds`／面板模块的任何代码里找到**（四个通道已排除）。
3. ⇒ **剩余候选只有三条**：(a) **分类按钮的 `role` 与所用复合组件**（若 rail 是 Base UI `Tabs`/`Composite`，其 `onKeyDown` 未定位 ⇒ 读 `role` 即可判，见 G801）；(b) 其他 211 个 app chunk 的懒加载组件；(c) `window.onkeydown=` 赋值式监听。

**建模收获**：`$N={keyCondition:{type:"keyCode", keyCode:t=>…}}` ⇒ 官方键位条件至少有 **`keyCode`（数值区间）型**与 **`code`（`KeyX`/`DigitX`/`BracketLeft`…）型**两种（与 §十三 描述符两段式一致）；本地自定义快捷键若要对齐官方行为，这两类匹配都得支持。

**仍未采到（`Enter` 检查点面·第 89 批·上半）**
- 抑制实现位置（候选 (a) 要读 `role` ⇒ 需视口恢复；(b)／(c) 未查）。
- ☆ 系统 Temp bundle 片段 9 个，**不入仓库**，用完清理。

### 20.6 焦点栈注册全表、面板纵导航出处与分派器全文（✓ 第 89 批·下半 2026-09-28 13:28–13:55，零 UI 交互＝3 次 `evaluate_script` 页内 fetch ＋ `indexOf`，**未动页面状态**；原始表 `_harvest/b89-pushfocus.json`／`b89-defs.json`／`b89-defs2.json`，原文留系统 Temp 不入仓库）

#### 20.6.1 面板纵导航出处结案：`tJ="CategorizedShortcutsPanel"` @2,118,334

组件 `qZ`、CSS 模块 `dm375`（与 §19 样式反查同源），关键段逐字：

```js
Aa={dialog:I9t,isCompact:T9t,compactNav:A9t,sidebar:E9t,main:D9t,…,sectionTitle:B9t,row:F9t,rowName:N9t,rowAlternative:U9t,keys:$9t,key:H9t},
tJ="CategorizedShortcutsPanel",
Z9t=t=>typeof t=="string",
V9t=new Lo("shortcutsPanelLastActiveCategory",null,Z9t),
… [r,c]=z1(V9t), d=l.find(b=>b.id===r)??l[0], …            // 存储值无效 ⇒ 回落第一个分类
k.useEffect(()=>{const b=y=>{const C=p.current.map(S=>S.id),x=h.current,
    w=Math.min(Math.max(C.indexOf(x)+y,0),C.length-1); c(C[w]??x)},
  return bn.pushIntoFocus({id:tJ,keyDefs:[
      {matcher:Vn(qs),handler:()=>f.current()},                     // Esc → 关闭
      {matcher:ot.TOGGLE_KEY_SHORTCUTS,handler:()=>f.current()},    // Ctrl+Shift+, → 关闭
      {matcher:Vn(Ts),handler:()=>b(-1)},                           // ↑ 上一分类
      {matcher:Vn(ms),handler:()=>b(1)}],                           // ↓ 下一分类
    allowPropagation:!1}), ()=>{bn.removeFromFocus(tJ)}},[c]);
```

五条结论：
1. **分类导航＝焦点栈 Up/Down 条目**，索引 `Math.min(Math.max(cur+y,0),len-1)` ⇒ **夹紧不环绕**（首分类 `↑`、末分类 `↓` 都应 no-op——屏上可测的新预测）。
2. handler 只 `c(C[w]??x)` **改选中 state、不搬焦点** ⇒ G782「焦点与选中互不跟随、无 roving tabindex」的代码级解释。
3. `keyDefs` **没有 `Home`／`End`／`ArrowLeft`／`ArrowRight`** ⇒ G801 三键 no-op 的源码级预测（屏上复测仍待视口恢复）。
4. `Esc` 与 `Ctrl+Shift+,` 两个 handler 都走 `f.current()` → `onClose` ＋ `uiDispatch(wO(!1))`；`wO(t)={type:"setIsShortcutsModalOpen",isOpen:t}` @613,695 ⇒ **面板开关是 store action**；`HelpButton` 条目 @2,596,520 也注册了 `ot.TOGGLE_KEY_SHORTCUTS`（prop `!0`）。
5. `Vn(...)` 是**宽松匹配**（20.6.3）⇒ 带修饰的 `↑`/`↓`（如 `Ctrl+↑`）理论上也切分类（屏上可测）。

#### 20.6.2 ★ G756 持久化载体结案：localStorage key

`Lo` 类 @36,201（`let Lo=class{constructor(e,n,o,s){this.key=e,this.defaultValue=n,this.isCacheValid=o,…}}`）：
```js
store(e){… e==null?localStorage.removeItem(this.key):localStorage.setItem(this.key,JSON.stringify(e)) …
         typeof window<"u"&&window.topApi?.broadcastStorageChange&&window.topApi.broadcastStorageChange(this.key,…)}
get(){try{localStorage.getItem…JSON.parse}catch{return null}}     // 另有 handleStorageEvent 跨标签 storage 事件同步
```
读写经 `z1` @37,643：`useState(t.get())` ＋ `subscribe` ＋ `store`。
⇒ **"面板当前分类跨整页重载保持"（G756）的载体＝localStorage key `shortcutsPanelLastActiveCategory`**：**本地 per-browser、不跨设备**，跨标签靠 `storage` 事件、跨窗口靠 `topApi.broadcastStorageChange`；读到无效值回落第一个分类。运行时存储内容按铁律**未读**，载体结论全部来自静态定义。

#### 20.6.3 分派器注册与 `XI` 全文（@14,273–14,400，关键行逐字）

```js
const bn={initialize:eEe,pushIntoFocus:nEe,upsertIntoFocus:oEe,removeFromFocus:sEe};
function eEe(t){zn.document.addEventListener("keydown",tEe,t,!0)}      // document 级 capture 注册
function XI(t,e){const n=bae(e);
  if(n.altKey!=null&&t.altKey!==n.altKey||n.ctrlKey!=null&&t.ctrlKey!==n.ctrlKey
   ||n.shiftKey!=null&&t.shiftKey!==n.shiftKey||n.metaKey!=null&&t.metaKey!==n.metaKey)return !1;
  switch(n.keyCondition.type){
    case"key":return typeof n.keyCondition.key=="function"?n.keyCondition.key(t.key)
             :t.key===n.keyCondition.key||t.key===n.keyCondition.key.toUpperCase();
    case"keyCode":…; case"code":…; case"letter":return rEe(t,n.keyCondition.letter)}}
function bae(t){return Ll?t:t.winMatcher??t}                           // 平台选择（Ll=isMac）
```
- **修饰字段 `==null` ⇒ 不校验** ⇒ `Vn(k)`（不带修饰字段）在**任意修饰组合下都匹配（宽松）**；`mo(k)` 显式全 `false`＝严格裸键。官方两档并存。
- `key` 型带 `toUpperCase()` 兜底；`letter` 型走 `rEe`（单字母看 `key.toLowerCase()`，其余 `code===KeyX`）。

#### 20.6.4 键位条件与修饰 builder 全家族 @15,973–17,500（G808 的完整化）

| builder | 语义 | 平台 |
| --- | --- | --- |
| `q7(t)` | `{type:"key",key:t}`（`KeyboardEvent.key`） | — |
| `Vr(t)` | `{type:"code",code:t}`（`KeyboardEvent.code`） | — |
| `Oo(t)` | `letter()`：单 ASCII 字母→小写；非字母 throw（提示改用 `code()`） | — |
| `yae(t)` | 非字母单字符条件；**字母 throw、数字也 throw ⇒ 数字快捷键必须走 `code()`** | — |
| `na(t)` | 字符串自动包成 `key` 型 | — |
| `Vn(t)` | 只带 `keyCondition` ⇒ **宽松（任意修饰）** | — |
| `mo(t)` | 修饰全 `false` ⇒ **严格裸键** | — |
| `Co(t)` | ⌘ | `winMatcher`＝Ctrl |
| `qi(t)`／`y2(t)`／`iEe(t)` | Shift／Alt／Ctrl | 部分带 `winMatcher` |
| `ci(t)` | ⌘+Shift | `winMatcher`＝Ctrl+Shift |
| `JI(t)`／`zr(t)` | ⌘⌥⇧／⌘⌥ | 各自带 `winMatcher` |
| `QM(t)` | `{...t,winMatcher:{keyCondition:q7(()=>!1)}}` ⇒ **Windows 恒不匹配（Mac-only 装饰器）** | — |
| `bae(t)` | `Ll?t:t.winMatcher??t` ⇒ **平台选择器** | — |

#### 20.6.5 焦点栈注册点全表＝主包 44 处 `pushIntoFocus`（原始表 `_harvest/b89-pushfocus.json`）

关键行（偏移｜id｜键｜`allowPropagation`）：
- **@6,540,353｜`this.FOCUS_STACK_ID`｜`TOGGLE_LEFT_SIDEBAR`／`TOGGLE_KEY_SHORTCUTS`／`TOGGLE_QUICK_OPEN`＋`_SAFARI`／`_ALT`／`_LEGACY`／`FIND_IN_PAGE`／`TOGGLE_FOCUS_MODE`…｜`!1`** ⇒ **全局和弦的常驻分派底座**。
- @2,118,334｜`tJ`（面板，见 20.6.1）；@2,596,520｜`"HelpButton"`｜`TOGGLE_KEY_SHORTCUTS`｜`!0`。
- @2,386,698｜`"ConfirmPopupDS"`、@3,454,528｜`"DeleteCommentConfirmationPopup"`｜`Esc`＋`Enter` 双键｜`!1`（确认框＝Esc 取消／Enter 确认）。
- @2,516,991｜`_I` 快搜｜Down/Up/`Co(oo)`/`Vn(oo)`｜`!0`；@5,128,191｜`"CollectionQuickSearchInput"`｜`Co(Oo("a"))`(⌘/Ctrl+A)＋`Esc`｜`!1`。
- @6,029,306｜`"inlinemenu"`｜Down/Up/Left/Right/Backspace/Enter/Esc 七键｜`!1`；@3,824,928｜`"emojimenu"`、@2,886,337｜`"SpaceModal"`｜Down/Up/Enter｜`!0`。
- @6,136,774｜`LM`（find-in-page）｜`mo(oo)`／`qi(oo)` 双 Enter＋Down/Up＋`Esc`＋`FIND_IN_PAGE`/`REPLACE_IN_PAGE`/`FIND_NEXT`/`FIND_PREVIOUS`｜`!1`。
- @5,376,463｜`` `BlockTask-${id}` ``｜`ho.NEXT_TASK`／`ho.PREV_TASK`｜`!0`；@6,021,285｜`` `SideMenuPageCard-${id}` ``｜`Esc`｜`!0`。
- @3,027,712｜`"BrowseSelectionRubberBandEscape"`；@5,375,798｜`"TaskWithMultiSelectContextProvider"`；@1,036,533／@1,037,202＝通用 hook `ao`／`Gd`（id 由调用方给）；@1,380,114＝弹层（body 滚动锁＋`Esc`→`R("escape")`）；余下见原始表（44 处＝全包 `pushIntoFocus` 全部命中）。

#### 20.6.6 `addEventListener("keydown"` 全包 7 处（✎ §20.4／§20.5 与 G804 的口径更正）

| # | 偏移 | 层级 | 内容（本轮已读） |
| --- | --- | --- | --- |
| 1 | **14,301** | document capture | **分派器注册 `eEe`**：`zn.document.addEventListener("keydown",tEe,t,!0)` |
| 2 | 1,377,493 | document | **Tab 焦点陷阱**：`shiftKey&&activeElement===v?focus(I):!shiftKey&&activeElement===I?focus(v)` 两端互跳 |
| 3 | 4,890,138 | document capture（signal） | `pointermove＋pointerup＋contextmenu＋window.blur＋keydown` 组合（疑交互状态观测；**handler `L` 函数体未读**） |
| 4 | 6,316,375 | document | `Tqn`：`keydown:vqn`＋`keyup:Iqn`＋body class 开关（**handler 未读**） |
| 5 | 4,227,765 | 元素 `h` | widget 的 pointer／keyboard 集 |
| 6 | 4,943,912 | 元素 `Pe` | 输入框：Enter 提交（`F(value.trim()\|\|null,"enter")`）／`Esc` 取消 |
| 7 | 5,127,992 | 元素 `V` | `key==="Enter"&&I()` 局部激活 |

⇒ ① §20.4／§20.5 的 **0 是"37 个 `onKeyDown` ±700B 窗口内"的计数**，"主包没有全局键盘监听"**不成立**（分派器本身就是 document 级 capture）；② `.onkeydown=` 赋值式三模式（`window.onkeydown`／`document.onkeydown`／`.onkeydown=`）全包 **0 命中** ⇒ G803 候选 (c) **主包内排除**；③ **新增两条未读的 document 级 handler（#3 `L`、#4 `vqn`）＝ `Enter` 抑制的新候选 (d)／(e)**。

**仍未采到（焦点栈与分派面·第 89 批·下半）**
- `Home`／`End`／`ArrowLeft`／`ArrowRight` 在面板的屏上复测（源码预测 no-op）＋ 首/末分类夹紧 no-op ＋ `Ctrl+↑` 宽松匹配也切分类 ⇒ 都要**视口恢复**后一次测完（G801／G809 预测）。
- 分类按钮的 `role`／tag（G803 候选 (a)）；document 级 handler `L`@4,890,138 与 `vqn`@6,316,375 的函数体（候选 (d)／(e)）；211 个懒 chunk（候选 (b)）。
- `k9t`（分类清单构造器，箭头函数本轮未定位）；`Lo.migrateValue` 分支；`ot.TOGGLE_KEY_SHORTCUTS` 在命令注册表里的完整修饰式。
- ☆ 系统 Temp bundle 片段 9 个（**不入仓库**），用完清理。

### 20.7 视口探针、rail 双态、`k9t`/`ot` 片段与两条 document handler 结案（✓ 第 90 批·上半 2026-09-28 14:06–14:12，零 UI 交互＝1 次视口探针＋3 次页内 fetch＋`indexOf`，**未动页面状态**；原始表 `_harvest/b90-static.json`／`b90-ds.json`／`b90-defs2.json`）

#### 20.7.1 视口探针＝程序侧不可解（G819）

```js
window.resizeTo(1440,900) → innerWidth/innerHeight 648×578 → 648×578（err=null，静默无效果）
同次读数：[aria-label="Question Mark Icon"] 不在 DOM（help:false）
dialog/menu/group/menuitem ＝ 0/0/0/0；visibilityState=hidden；title=所有文档
```
⇒ 浏览器忽略非脚本打开窗口的 `resizeTo` ⇒ **G801／G809 三条预测／G793 截图／Enter 悖论 (f)(g) 复测全部压在"用户恢复视口"上**（与停摆 #24 同类：恢复动作归用户）。

#### 20.7.2 分类 rail 双态（`qZ` @2,117,855±，逐字关键行）

```js
// compact（i=hn() 为真）
a.jsx("nav",{className:Aa.compactNav,"aria-label":e("preferences.keyboard.shortcuts"),
  children:a.jsx(Npe,{size:"lg",value:d.id,onValueChange:c,
    items:l.map(b=>({value:b.id,icon:b.icon,ariaLabel:b.getLabel(e)}))})})
// sidebar（默认）
a.jsx("nav",{className:Aa.sidebar,"aria-label":e("preferences.keyboard.shortcuts"),
  children:l.map(b=>a.jsx(a6,{variant:b.id===d.id?"active":"default",
    leftContent:a.jsx(Do,{icon:b.icon}),onClick:()=>c(b.id),children:b.getLabel(e)},b.id))})
```
- **`a6`＝DS Button（主包 @2,093,356）**：解构 `{children,caption,leftContent,rightContent,variant,isStatic,forceHover,isOneLine,className,type,render}`，变体经 `Tr.variant*` map；**rail 调用方只传 variant/leftContent/onClick/children** ⇒ 无 `role`/`onKeyDown`/`tabIndex` 覆写，屏上 `BUTTON._action_1j891_1` 佐证是真 `<button>`。
- **`Npe`＝紧凑图标分段控件（@2,096,517）**：`{items,value,onValueChange,size,className}`、默认 `sm`、`dataset.whatintent==="touch"` 时调 `_2()`、内建 `ResizeObserver`。
- 关闭＝`ls.CloseButton`；dialog 外层 `aria-labelledby`；滚动区 `ks.Root/Viewport/Content/Scrollbar`；`i=hn()`（**`hn` 仍未定位**）。
- ⇒ **G803 候选 (a) 静态清白**：真按钮＋面板/主包/`vendor-ds` 三处无 Enter 拦截 ⇒ 与屏上"Enter 不激活"构成**代码-屏上悖论**（复测假设改写见 gap G803 第五次收窄）。

#### 20.7.3 `k9t` 分类清单构造器 @2,109,810（＋`JX`）

```js
k9t=t=>{const{tableShortcuts:e}=ot, …
  return [{id:"general",getLabel:s=>s("commands.shortcuts.keyboard.general"),icon:Upe,sections:[
      {id:"general-base",shortcuts:[cancel→ot.CANCEL, open.shortcuts→ot.TOGGLE_KEY_SHORTCUTS]},
      {id:"general-navigation",getTitle:s=>s("commands.navigation"),shortcuts:[NAVIGATE_INTO, NAVIGATE_OUT,
        quick.open→[Hd?TOGGLE_QUICK_OPEN_SAFARI:TOGGLE_QUICK_OPEN, TOGGLE_QUICK_OPEN_ALT]]},
      {id:"general-view",getTitle:s=>s("view"),shortcuts:[TOGGLE_FOCUS_MODE, TOGGLE_LEFT_SIDEBAR]}]},
    {id:"documents",…,sections:[{id:"documents-base",shortcuts:[daily.note, select.all, select.to.top…]}]}, …];
JX=t=>{const e=S9t.get(t);return Ll&&e!=null?[t,e]:[t]};   // Mac 才追加 *_MAC 变体（§13 结论的函数名）
```
- ★ **`documents` 只有 `documents-base` 且无 `getTitle`** ⇒ 屏上"`文档` 是唯一没有段标题的分类"的源码级解释。
- ★ **`ot.tableShortcuts` 字段实存**（`const{tableShortcuts:e}=ot`）。
- Mac-only 显示分支：`SET_CANCELLED` 档 `Ll?[SET_CANCELLED,SET_CANCELLED_SLASH]:[SET_CANCELLED]`；`SELECT_TO_TOP` 档 `Ll?[COMMON,MAC]:[COMMON]`；快速开启按 `Hd`（Safari）切 `_SAFARI`。

#### 20.7.4 `ot` 注册表片段 @884,935 ＋ 修饰 builder 补全（G818）

```js
FIND_NEXT:Co(Oo("g")), FIND_PREVIOUS:ci(Oo("g")), INSERT_AFTER:mo(vd), INSERT_BEFORE:qi(vd),
DUPLICATE:Co(Oo("d")), TOGGLE_LEFT_SIDEBAR:Co(Vr("Backslash")), TOGGLE_KEY_SHORTCUTS:zr(Vr("Comma")),
TOGGLE_FOCUS_MODE:yae("."), TOGGLE_QUICK_OPEN:Co(Oo("o")), TOGGLE_QUICK_OPEN_SAFARI:ci(Oo("o"))
function zr(t){return{metaKey:!0,shiftKey:!1,altKey:!0,ctrlKey:!1,keyCondition:na(t),
  winMatcher:{ctrlKey:!0,shiftKey:!0,altKey:!1,metaKey:!1,keyCondition:na(t)}}}   // Mac ⌘⌥ ↔ Win Ctrl+Shift
function YM(t){…winMatcher:{ctrlKey:!0,shiftKey:!1,altKey:!0,…}}}                   // Mac ⌘⌥ ↔ Win Ctrl+Alt
function JI(t){…winMatcher:{ctrlKey:!0,shiftKey:!1,altKey:!0,…}}}                   // Mac ⌘⇧⌥ ↔ Win Ctrl+Alt（丢 Shift）
```
- **`TOGGLE_KEY_SHORTCUTS` 的键＝物理 `Comma` 码**（`Vr`），修饰＝`zr` ⇒ 屏上 `Ctrl+Shift+,` 完整码路；Mac 侧显示 ⌘⌥, ＝预测。
- **`TOGGLE_FOCUS_MODE:yae(".")` 无修饰字段 ⇒ 宽松匹配**（`XI` 对 `==null` 不校验），屏上印 `Ctrl+.` 的修饰显示来源仍待追。
- **`TOGGLE_KEY_SHORTCUTS` 三个消费点**：@2,118,417 面板自身、@2,596,572 `HelpButton`（`handler:()=>{i||u(eRt)}`，prop `!0`）、@6,540,481 全局底座；另有 @6,297,695 类组件 editor 级 keyDefs（`pressCmdLeft`＋`isFocusModeActive` 守卫）。

#### 20.7.5 两条 document handler ＋ `vendor-ds` 唯一 `onKeyDown` 结案（G815／G816）

| 目标 | 正文要点 | 结论 |
| --- | --- | --- |
| `L`@4,890,138 | `L=F=>{F.key==="Escape"&&(l.current&&(F.stopPropagation(),F.preventDefault(),p.current([])),j())}`，同组＝`pointermove/pointerup/contextmenu/window.blur` | **框选（rubber band）组件，只处理 `Escape`**（仅框选进行中）⇒ **(d) 排除** |
| `vqn`@6,316,375 | `vqn(t){kae(t.key)&&body.classList.add(wW)…, t.key===Sae&&…}`；`Iqn`＝keyup 反向；`rve()` 复位；`Tqn` 注册＋body class | **打字态/Shift 态 body-class 开关，无 `preventDefault`** ⇒ **(e) 排除** |
| `vendor-ds` @71,888 | `m=h.key==="Tab"&&!alt&&!ctrl&&!meta` → `preventDefault`＋`TreeWalker(tabIndex>=0)` 首尾互跳；DS 焦点陷阱栈 `Si`（add/remove/pause/resume） | **Tab 焦点陷阱**；全 chunk `keyCode===13`／`key==="Enter"`／`which===13` 均 0 ⇒ **DS 侧 Enter 嫌疑清零** |

**仍未采到（视口与 rail 面·第 90 批·上半）**
- **视口与截图两个锁等用户**（`resizeTo` 已证无效）⇒ G801／G809 三预测／G793 截图／**Enter 悖论 (f)(g) 复测**全压在这上面。
- `hn()`（compact/sidebar 条件）**两种搜法均 NOTFOUND**；~~`lEe` 的 winMatcher 尾部截断~~（§20.8 已补全文）；~~`TOGGLE_FOCUS_MODE` 的修饰显示来源未追~~（§20.8 结案＝`yae`）；211 懒 chunk（候选 (b)）未穷尽。
- ☆ 系统 Temp bundle 片段 12 个（**不入仓库**），用完清理。

### 20.8 `yae` 全文、显示串管线闭环与 `lEe` 归属更正（✓ 第 90 批·下半 2026-09-28 14:19–14:24，零 UI 交互＝1 次页内 fetch＋`indexOf`，**未动页面状态**；原始表 `_harvest/b90-lower-defs.json`）

#### 20.8.1 `yae`＝`primaryCharacter()` @16,244（逐字；错误文案自曝规范名）

```js
function yae(t){ if(!aEe(t))throw new Error(`Expected a single character, received "${t}".`);
  if(wae(t))throw new Error(`Expected a non-letter character, received "${t}". For letter shortcuts, use letter() instead.`);
  if(/^[0-9]$/.test(t))throw new Error(`Digit shortcuts intentionally use code("Digit*") today; primaryCharacter() rejects "${t}".`);
  return{metaKey:!0,altKey:!1,ctrlKey:!1,keyCondition:q7(t),
         winMatcher:{metaKey:!1,altKey:!1,ctrlKey:!0,keyCondition:q7(t)}} }
```
- **Mac ⌘+字符 ↔ Win Ctrl+字符** ⇒ `TOGGLE_FOCUS_MODE:yae(".")` 屏上 `Ctrl+.` 的修饰来源**结案**（G818 的"待追"关闭）。
- 规范函数名三枚随错误文案到手：**`primaryCharacter()`＝`yae`／`letter()`＝`Oo`／`code()`＝`Vr`**；数字快捷键官方强制 `code("Digit*")`。

#### 20.8.2 描述符→显示串管线闭环（87 批挂账 `Cae`／`v9t` 结案）

```js
function Cae(t){ const e=bae(t); let n=null;
  switch(e.keyCondition.type){ case"key": n=…key…; break; case"keyCode": break;
    case"code": n=…code…; break; case"letter": n=e.keyCondition.letter; }
  if(n==null)return[];                                   // ★ keyCode 型 ⇒ 不显示
  const o=dEe(n)??(n.length===1?n.toUpperCase():n),      // 字形表兜底 / 单字符大写 / 原名
        s=(i,l,r)=>i?{kind:"modifier",modifier:l,label:r}:null;
  return bt([s(e.metaKey,"meta",Ll?"⌘":"Win"), s(e.ctrlKey,"ctrl",Ll?"⌃":"Ctrl"),
             s(e.altKey,"alt",Ll?"⌥":"Alt"), s(e.shiftKey,"shift",Ll?"⇧":"Shift"),
             {kind:"key",key:n,label:o}]) }
v9t=t=>{ if(!Ll)return t;                                 // ★ Win 原样返回
  const e=t.filter(s=>s.kind==="modifier"), n=t.filter(s=>s.kind==="key"),
        o=s=>s.kind==="modifier"?["ctrl","alt","shift","meta"].indexOf(s.modifier):4;
  return[...e.sort((s,i)=>o(s)-o(i)), ...n] }             // Mac 才重排：Ctrl-Alt-Shift-Meta
```
⇒ **本地 `keycap()` 完整规格三连（G821，P1）**：① **Win 下 meta 的标签是 `"Win"`**（不是 ⌘）；② **`keyCode` 型描述符面板不显示**（`qZ` 行渲染 `filter(len>0)` 的上游原因）；③ **Mac 修饰显示序＝Ctrl-Alt-Shift-Meta**（`v9t` 排的，非构造序）——配合 §20.6.4 的 builder 表与 §19 字形表，显示面规格齐了。

#### 20.8.3 `lEe`／`eT`／`YM`／`JI` 全文 ＋ 370 行归属更正

| builder | Mac | Win（winMatcher 逐字） |
| --- | --- | --- |
| `lEe` | ⌘⇧⌥ | **Ctrl+Shift+Alt**（三键全带） |
| `eT` | ⌥⇧ | Shift+Alt |
| `YM` | ⌘⌥ | Ctrl+Alt |
| `JI` | ⌘⇧⌥ | **Ctrl+Alt（Win 丢 Shift）** |

⇒ **`keyboard.md:370`（§十二）原注"Mac `⌘ ⌥ ⇧ S` 经 `lEe` 映射成 Win `Ctrl-Alt-S`"自相矛盾**：`lEe` 的 winMatcher 是 Ctrl-Alt-**Shift**、照它屏上应显示四键帽，而实测是三键帽 `CtrlAltS` ⇒ **工厂只能是 `JI`**（⌘⇧⌥↔Ctrl-Alt，Mac 三修饰吻合）⇒ **该行已就地 ✎ 更正**（G822）。
**通用教训**：屏上串反推工厂必须**逐字段对 `winMatcher`**——`JI` 与 `lEe` 是"同 Mac 串、Win 差一个 Shift"的孪生构造器，只数 Mac 侧修饰数必错。

**仍未采到（显示管线面·第 90 批·下半）**
- `hn()`（compact/sidebar 条件）两种搜法 NOTFOUND；`SCHEDULE_FOR_TODAY` 的 `JI` 归属＝**由屏上串＋修饰对反推**，`ho` 注册表原文未直读（下一抽定点确认）；211 懒 chunk（候选 (b)）未穷尽。
- ★ **视口与截图两个锁仍等用户**（G801／G809 三预测／G793 截图／Enter 悖论 (f)(g) 复测）。
- ☆ 系统 Temp bundle 片段 13 个（**不入仓库**），用完清理。

### 20.9 `ho` 任务注册表片段直读、`hn()` 画像与 Temp 清理（✓ 第 91 批·上半 2026-09-28 14:23–14:27，零 UI 交互＝2 次页内 fetch＋`indexOf`，**未动页面状态**；原始表 `_harvest/b91-static.json`／`b91-hn.json`）

#### 20.9.1 `ho` 注册表片段 @901,613（逐字节选；G822 反推→原文）

```js
…,EDIT_START:mo(oo),TOGGLE_STATE:mo(vd),CREATE_NEW:mo(vd),
OPEN_NEW_TASK_POPUP:Co(Oo("j")),OPEN_SCHEDULE_DATEPICKER:ci(Oo("s")),
SCHEDULE_FOR_TODAY:JI(Oo("s")),OPEN_DEADLINE_DATEPICKER:ci(Oo("d")),
OPEN_TASK_LOCATION:ci(Oo("o")),REMIND_IN_ONE_HOUR:JI(Oo("r")),
TOGGLE_DONE:YM(Oo("t")),TOGGLE_DONE_SLASH:yae("/")…
```

| 命令 | 工厂 | Win 显示（屏上对账） |
| --- | --- | --- |
| `SCHEDULE_FOR_TODAY` | **`JI(Oo("s"))`（原文确认）** | `Ctrl+Alt+S` ✓（Mac `⌘⇧⌥S`↔Win Ctrl+Alt，`JI` 丢 Shift） |
| `OPEN_NEW_TASK_POPUP` | `Co(Oo("j"))` | `Ctrl+J` ✓ |
| `OPEN_SCHEDULE_DATEPICKER` | `ci(Oo("s"))` | `Ctrl+Shift+S` ✓ |
| `OPEN_DEADLINE_DATEPICKER` | `ci(Oo("d"))` | `Ctrl+Shift+D` ✓ |
| `OPEN_TASK_LOCATION` | `ci(Oo("o"))` | （面板未印） |
| `REMIND_IN_ONE_HOUR` | `JI(Oo("r"))` | `Ctrl+Alt+R` ✓（与 §十三 归属一致） |
| `TOGGLE_DONE` | `YM(Oo("t"))` | `Ctrl+Alt+T` ✓ |
| `TOGGLE_DONE_SLASH` | **`yae("/")`** | `Ctrl+/` ✓（**`yae` 第二例**：非 `.` 字符） |
| `EDIT_START` | **`mo(oo)`** | `⏎` ＝**严格裸 Enter**（`mo` 全修饰显式 false） |
| `TOGGLE_STATE`／`CREATE_NEW` | `mo(vd)` | 严格裸 `space` |

⇒ **G822 的"待 `ho` 原文确认"关闭**；表D 工厂累计实读 11+ 条。复刻纪律：**抄工厂不抄屏上串**（`JI`/`lEe` 孪生，见 §20.8.3）。

#### 20.9.2 `hn()` 使用面画像（`qZ` rail 双态判定源）

12 处采样（`grep` 式页内枚举）：select 组件 `T=hn()`、拖拽把手 `$=hn()`、icon-picker `w=hn()`→`{columnCount,containerWidth}=tut(w)`、色选 `c=hn()`、upgrade 弹窗 `o=hn()`（`!o` 门控）、pricing `l=hn()`（`l?"100%":…`）、**面板 `i=hn()`（compactNav/sidebar 分支）** ⇒ **无参全局响应式查询（疑似移动端/紧凑判定），非面板局部状态**。
本体**未定位**：`function hn(`／`hn=()=>`／`hn=t=>`／`as hn` 四搜皆非；`wr as hn`@6,833,180 所在**尾部大别名表动词未裁**（`wr` 本体＝24×24 SVG 图标 @3,587,019，与 `hn()` hook 无关）。
**方法注（纪律第二次验证）**：**别名表只能读表头动词（`import{`／`export{`），不能按字母猜两侧**——与第 85 批"按加号切键帽数"同型的推断错误，本次在读正文前被拦下。

**仍未采到（注册表与 `hn` 面·第 91 批·上半 → 下半刷新）**
- ~~尾部别名表动词~~（**下半结案＝`export{local as exportName}` @6,828,250**，6.8M 后 `import{`/`from"` 零命中，见 §20.10／G825）；`hn()` 本体＝**只剩 `class hn` 与 `hn=<标识符>` 两形态未搜**（下批一发即裁）。
- ★ 视口与截图两个锁仍等用户（G801／G809／G793／Enter 悖论 (f)(g)）。
- ☆ **Temp 原文残留已清 5 个**（本批）；211 懒 chunk（候选 (b)）未穷尽。

### 20.10 尾部别名表动词结案（✓ 第 91 批·下半 2026-09-28，1 次页内 fetch）

@6,828,250 逐字：`…afe();export{DG as $,x6e as A,go as B,…,wr as hn,O2 as ho,…}` ⇒ **表＝主包自己的 `export{local as exportName}`**（exportName 为短 minified 名 `$ A B C … hn ho hp …`，延伸至文件尾 6,841,180）；6.8M 之后 `import{`／`from"` 零命中 ⇒ 尾部无 import 段。⇒ **"别名表先读动词"纪律落地**：动词到手前两侧推断一律作废。
`hn` 本体仍悬：内部 12 处 `hn()` 调用必须有本地绑定，而 `function hn(`／独立 `hn=`（非标识符右值）／`const hn`（唯一命中＝`hno` 假阳性）全空 ⇒ **只剩 `class hn` 与 `hn=<标识符>` 两形态**；export 面 `hn`＝图标 `wr`（24×24 SVG @3,587,019）的导出名，与内部 `hn()` **同名不同物**。
✎ **第 92 批·上半结案**：命中在**第 4 种未搜形态＝`hn=V0e(zo)` 别名式赋值**（@589,268，见 §20.11.1）；本段的"仍悬"作废，但**"export 面 `hn` 与内部 `hn()` 同名不同物"这条依然成立**（导出的是图标 `wr`）。

### 20.11 `hn` 结案＝747px 断点 ＋ Base UI `useButton` 真值表 ＋ 已加载 chunk 的 `Enter` 扫描（✓ 第 92 批·上半 2026-09-28 14:34–14:40，零 UI 交互＝3 次页内 `fetch`＋`indexOf`（含 1 次 40-chunk 扫描），**未动页面状态**；原始表 `_harvest/b92-static.json`／`b92-baseui.json`／`b92-flags.json`，原文留系统 Temp 不入仓库）

#### 20.11.1 `hn()` 本体结案（G824／G825 关闭）

@589,268 同段逐字（关键行）：

```
_We = t => matchMedia(t).matches
mg  = () => _We(zo)
V0e = t => () => md(t)          // 工厂：把 query 包成"无参 hook"
hn  = V0e(zo)                    // ← 目标
W0e = V0e(wa)
$0e = 748
```

⇒ **`hn()` ＝ `md(zo)`**，`zo` ＝ `"(max-width: " + ($0e - 1) + "px)"` ＝ **`(max-width: 747px)`**；`wa` ＝ `(min-width: 748px)`。上一节列的四搜落空的原因：真身是**别名式赋值 `hn=V0e(zo)`（右值是标识符）**，而 §20.10 的守卫把"右值以标识符开头"的那一类过滤掉了。

伴生常量（同段，一并入档）：`H0e="(min-width:-1px)"`／`Z0e="(max-width:-1px)"` ＝ **always／never 成对**（触屏主题交换用）、`Bc`／`DWe` ＝ pointer 查询、`EWe` ＝ Android UA 判定、`tD` ＝ fine-pointer 判定、`Xh=48`／`Jh=56` ＝紧凑尺寸档。

⇒ **面板 rail 双态的判定源结案＝纯宽度断点 747px**（G814 的 `i=hn()` 关闭；不是"移动/紧凑"枚举、不是账户偏好）。
⇒ **新屏上预测（待视口恢复验）**：当前 648px ＜ 747 ⇒ 面板若能打开应渲染 **compactNav（`Npe` 图标分段）** 而非 `a6` 按钮列 ⇒ 这也可能改写 V73 的"Enter 无反应"归因（见 §20.11.2 备注）。

#### 20.11.2 `vendor-BZCR0rqu.js` 的 `useButton` onKeyDown ＝ Enter 悖论第一嫌疑（G827）

@993,321 逐字节选（旗标已全部解出）：

```
function useButton($r = {}) {
  const { disabled: Ar = !1, focusableWhenDisabled: Cr, tabIndex: Rr = 0,
          native: Pr = !0, composite: Ir } = $r,          // ← native 默认 true
        fa = Ir ?? (CompositeRootContext !== void 0),      // ← 是否处于 Composite 上下文
        { onClick: va, onMouseDown: ya, onKeyUp: wa, onKeyDown: ba,
          onPointerDown: Ea, ...} = ga;                     // ← va＝调用方传的 onClick
  return mergeProps({ type: Pr ? "button" : void 0, ... })
}
```

keydown 核心两行：`Ua && (!Pr && (Ia || qa) && $a.preventDefault()`，`!Pr && qa && va?.($a))`；Space 另有独立分支 `Ta && fa && Ia → preventDefault 后 (Pa || Pr && Oa) ? Aa.click() : Ua && va?.()`。其中 `qa`＝`Enter`、`Ia`＝`Space`、`Ua`＝`target===currentTarget ∧（Pr ? isButton : 非合法 link）`。

⇒ **真值表**（"是否拦／是否代触发 click"完全由 `native` 与 `onClick` 接线决定）：

| `native` | `onClick` 是否经 `getButtonProps` 接线 | `Enter` 结果 | `Space` 结果 | 与屏上是否吻合 |
| --- | --- | --- | --- | --- |
| `true`（默认） | 任意 | **keydown 完全不拦** ⇒ 原生 `<button>` 默认行为触发 click | 原生触发 | ✗ 与"Enter 无反应"**矛盾** |
| `false` | 未接（`va` 为 `undefined`） | **preventDefault 后什么都不发生＝死** | `fa=true` 分支可走 `Aa.click()`＝**仍活** | ✓ **与"Space 活／Enter 死"完全吻合** |
| `false` | 已接 | preventDefault 后调 `va`＝活 | 视 `Pa`／`Oa` 分支 | ✓ 但 Enter 也应活 ⇒ 不吻合 |

⇒ **最后一问**＝`a6`（面板 sidebar 态的分类按钮）到底是不是 Base UI Button、其 `native`／`composite`／`onClick` 接线方式（下一发读 `a6` 的 jsx root 即裁）。
★ **本地映射（P1）**：`src/components/ui/button.tsx:1` ＝ `import { Button as ButtonPrimitive } from "@base-ui/react/button"` ⇒ **本地 Button 与官方同一库、同一 `useButton`** ⇒ 若本地某处传 `native:false` 会复现同款悖论；**本地按钮的 Enter 行为从未实测**。

#### 20.11.3 已加载 JS 资源的 `Enter` 扫描＝候选 (b) 在会话域关闭（G828）

本会话 JS 资源 45 个、实扫 40 个（跳过主包，主包已单独审过）。`"Enter"` ±260 B 内含 `preventDefault` 的只有 3 处，**全在 vendor**：

| # | chunk | 内容 | 是否 Enter 抑制点 |
| --- | --- | --- | --- |
| 1 | `vendor-react` | Base UI composite（roving）键处理 `[" ", "Enter"].includes(key) && onValueChange(...)` | 否（自身不拦） |
| 2 | `vendor-BZCR0rqu` | §20.11.2 的 `useButton` handler | **是唯一候选** |
| 3 | `vendor-code-editor` | CodeMirror keymap 表（`Home`／`End` 条目带 `preventDefault:!0`） | 否（编辑器子域） |

⇒ **已加载 app chunk 零命中**；未加载 chunk 不可能在当前会话生效 ⇒ **候选 (b)（"某个懒 chunk 里有全局 Enter 拦截"）在当前会话范围实质关闭**。

**仍未采到（第 92 批·上半）**
- ★★★ `a6` 的 jsx root 与 Base UI 接线（§20.11.2 最后一问，静态一发即裁）。
- ★★★ A／B／C／D／E／G 的**按键效果与弹层仍为零条** ⇒ 瓶颈＝**新的沙盒写入授权**（队列 1）。
- ★ 视口两个锁仍等用户：G801／G809 三预测／G793 截图／**648＜747 应渲染 compactNav 的新预测**／Enter 屏上 (f)(g) 复测。
- ☆ ~~`a6` 的 jsx root 与 Base UI 接线~~（**下半结案＝G829**，见 §20.12.1）；`md(` hook 定义未读；33 处其余 `onKeyDown` 语义抽读；未扫的 5 个 JS 资源；`_We` 型一次性读（`mg`）与 `hn` 型订阅式 hook 的差异（是否随 resize 重渲染）只到源码级、未屏上验。

### 20.12 `a6`＝Base UI Button 薄封装 ＋ rail 双态的屏上判据 ＋ keycap 第 7 条 ＋ Assistant 可见性判据（✓ 第 92 批·下半 2026-09-28 14:41–14:52，零 UI 交互＝2 次页内 `indexOf`（bundle 已页内缓存，第二次零下载），**未动页面状态**；原始表 `_harvest/b92-lower.json`）

#### 20.12.1 `a6` 接线结案：`nativeButton = render == null`（G829）

`a6`@2,093,356 的 return 逐字：`j=a.jsxs(zre,{type:C,render:r,nativeButton:S,"data-ds":"action",className:I,...l,children:[T,D,_]})`，其中 **`S=r==null`**、`C=h===void 0?"button":h`；`zre` 来自 import 表 @5,881 的 `ec as zre`（＝Base UI `Button`，其 `nativeButton` prop 即 §20.11.2 `useButton({native})` 的公开入口）。
**`nativeButton` 全包只有 2 处**：@2,094,829（`a6`＝DS Action）与 @1,540,180（DS Button，`"data-ds":"button"`，原样转发调用方的 `nativeButton:W`）。⇒ 之前搜 `native:` 得到三处全假阳性（色板 token `neutralContrast.native`@1,070,879／@1,079,286／@2,117,559）⇒ **纪律：找 prop 名要找 DS 封装层的对外名（`nativeButton`），不是库的内部参数名（`native`）**。

**★ 决定性**：面板 sidebar 态 rail 的用法点 @2,119,491 逐字 **不传 `render`**：

```
a.jsx("nav",{className:Aa.sidebar,"aria-label":e("preferences.keyboard.shortcuts"),
  children:l.map(b=>a.jsx(a6,{variant:b.id===d.id?"active":"default",
    leftContent:a.jsx(Do,{icon:b.icon}), onClick:()=>c(b.id),
    children:b.getLabel(e)}, b.id))})
```

⇒ `nativeButton:true` ⇒ 落 §20.11.2 真值表**第 (1) 行**＝**keydown 完全不拦 Enter，原生 `<button type="button">` 应触发 click** ⇒ **"官方在 sidebar 态抑制 Enter"这一支被排除** ⇒ **G803 悖论只剩两条出口**：**(h) 648px＜747px ⇒ 观测时实际是 compact 态的分段控件（不是按钮）**、**(f) `press_key('Enter')` 的事件形态**。

传 `render` 的四个用法点（＝`nativeButton:false` 的真实用例，G830）：DS Menu item @2,633,506（`role:"menuitem"`）／集合行列项 @2,637,609（`b=a.jsx("div",{})` 再 `render:b`，**onClick 挂在外层 `UIe`** ⇒ Enter 需 Base UI 代触发、Space 靠 composite 分支）／标题栏 action @2,704,783／升级条 @6,721,289。

#### 20.12.2 compact 态真实控件 ＋ 双态的屏上判据（G831）

`Npe`@2,096,517 的 return＝`a.jsx(TIe,{ref:c,"data-ds":"segmented-control",className:b,value:o,onValueChange:p,children:x})`；touch 守卫 `document.documentElement.dataset.whatintent==="touch"&&_2()`；面板 compact 分支 items＝`l.map(b=>({value:b.id,icon:b.icon,ariaLabel:b.getLabel(e)}))` ⇒ **compact 态无文本 DOM、只有 `aria-label`**。
同段 **CSS module 类名映射表**（`dm375` 是该模块 hash）：`Aa={dialog:I9t,isCompact:T9t,compactNav:"_compactNav_dm375_20",sidebar:"_sidebar_dm375_26",main:"_main_dm375_37",header:"_header_dm375_44",headerText,caption,categoryTitle:"_categoryTitle_dm375_70",scrollRoot,sections,section,sectionTitle,row,rowName,rowAlternative,keys,key}`（`dialog`／`isCompact` 两值被窗口左界截断）。
渲染出口逐字：`a.jsxs(ls.Content,{className:$e(Aa.dialog,{[Aa.isCompact]:i}),children:[!i&&g, …]})` ⇒ **`i=hn()`（＝`md(zo)`＝747px 断点）同时决定 `isCompact` 类与 rail 分支**（§20.11.1 的渲染端闭环）。
⇒ **屏上判据（视口恢复后一发即裁 G826 预测）**：`document.querySelector('[class*="_compactNav_"]')` vs `'[class*="_sidebar_"]'`。

#### 20.12.3 keycap 规格第 7 条 ＋ 载体逐字（G832）

```
W9t = { meta:"⌘ Cmd", ctrl:"⌃ Ctrl", alt:"⌥ Opt", shift:"⇧ Shift" }
z9t = { [qs]:"esc" }
G9t = t => t.kind==="modifier" ? (Ll && W9t[t.modifier] || t.label)
                             : (z9t[t.key] ?? t.label)
```

⇒ ①**修饰键符号串只在 Mac 生效**（`Ll &&`），Windows 落回 `t.label`（与 §20.8.2 `Cae` 的 `meta`→`Win` 互补：`Cae` 出 token、`G9t` 出标签）；②**`Escape` 印成小写 `esc`** 是唯一键名特例；⇒ 本地 `keycap()` 规格累计 **7 条**。
载体逐字：`V9t=new Lo("shortcutsPanelLastActiveCategory",null,Z9t)`（`Z9t=t=>typeof t==="string"`）＋ `[r,c]=z1(V9t)` ＋ `d=l.find(b=>b.id===r)??l[0]` ⇒ G810 由"封装推断"升级为"面板内逐字"。

#### 20.12.4 Assistant 分类可见性判据（G833）＋ 表格命令注册表 `u8`（G834）

`Q0=()=>{const e=qe(x9t),n=qe(C9t),o=Nr(),s=z0();const l=(n==null?void 0:n.toUpperCase())==="CN"||o||s;return{isEnabledInSpace:e,isCraftAssistantEnabledForSpace:e,hideFromUI:l}}`；`C9t=We(Ws,t=>(t==null?void 0:t.market)??null)`；`x9t=We(Ui,t=>{var n;const e=t.selectedSpaceId;return e==null?sA:((n=t.spacesSettings[e])==null?void 0:n.isCraftAssistantEnabled)??sA})`；`sA=!0`。
⇒ **`hideFromUI` ＝「账户 `market` 大写＝`CN`」OR 两个未读全局旗标**；★ **`market` 缺失 ⇒ 第一项为假**（是 `n==null?void 0` 而不是默认值）⇒ "没配 market" ≠ "隐藏 Assistant"；`sA=!0` 只作用于空间开关默认值。面板侧 `l=k.useMemo(()=>k9t({includeAssistant:!o}),[o])` ⇒ **这是 §十九"条目受功能开关裁剪"的唯一账户级判据**。
`u8`（表格／集合命令键位注册表，表D 工厂实读累计 17 条）：

| 命令 | 工厂（逐字） | i18n key |
| --- | --- | --- |
| 添加行 | `qi(oo)` | `collections.add.a.row` |
| 重复行 | `Co(Oo("d"))` | `collections.duplicate.row` |
| 全选行 | `Co(Oo("a"))` | `collections.select.all.rows` |
| 清除单元格 | `Vn(nc)` | `collections.clear.cell.value` |
| 删除行 | `Co(nc)` | `table.delete.row` |

⇒ **`Shift+Enter` 添加行**（`qi`＝Shift 装饰 × 严格 Enter）；`nc` 身份未解（候选 `Delete`／`Backspace`）；同段 `w9t=Co(oo)`＝`⌘/Ctrl+Enter`（消费点未读）。

**仍未采到（第 92 批·下半）**
- ★★★ (h) 假设的关键＝**`TIe`（DS 分段控件）自身的 `Enter`／`Space` 语义未读**；(f) `press_key` 通路仍待屏上。
- ★ 屏上：`[class*=_compactNav_]` vs `_sidebar_` 一发判 G826；`Nr()`／`z0()` 两旗标身份；`nc` 常量；`Aa.dialog`／`Aa.isCompact` 两 class 字面量；DS Button 上游有没有传 `nativeButton:false`。
- ☆ A–G 效果面仍零条（写授权未到手）。

### 20.12.5 `useButton` 全文 ＋ Base UI 的 Enter no-op 机制（✓ 第 92 批·补录 2026-09-28 14:53–15:02，零 UI 交互＝3 次页内 fetch／`indexOf`，**未动页面状态**；原始表 `_harvest/b92-lower-2.json`）

`vendor-BZCR0rqu.js` @992,900–994,600 逐字骨架（`Pr`＝`native`、`fa`＝composite、`va`＝`onClick`、`Ar`＝disabled）：

```
onKeyDown($a){
  if (Ar || (makeEventPreventable($a), ba?.($a), $a.baseUIHandlerPrevented)) return;
  const Ta=$a.target===$a.currentTarget, Aa=$a.currentTarget,
        Oa=isButtonElement(Aa), Pa=!Pr&&isValidLinkElement(Aa),
        Ua=Ta&&(Pr?Oa:!Pa), qa=$a.key==="Enter", Ia=$a.key===" ",
        La=Aa.getAttribute("role"),
        Da=(La?.startsWith("menuitem"))||La==="option"||La==="gridcell";
  if (Ta && fa && Ia) {                                   // Space + composite
    if ($a.defaultPrevented && Da) return;
    $a.preventDefault();
    (Pa||Pr&&Oa) ? (Aa.click(), $a.preventBaseUIHandler())
                 : Ua && (va?.($a), $a.preventBaseUIHandler());
    return;
  }
  Ua && (!Pr && (Ia||qa) && $a.preventDefault(),         // ← Enter 的唯一入口：!Pr
         !Pr && qa && (va?.($a)))
}
onKeyUp($a){ … if (target===currentTarget && Pr && fa && isButtonElement && key===" ") { preventDefault; return } … }
mergeProps$2({type: Pr?"button":void 0, …}, Pr?void 0:{role:"button"}, da, xa)
```

`Button` 本体 @1,208,713：`nativeButton:ca=!0` → `useButton({…, native:ca})`，`useRenderElement("button",Ar,{props:[fa,da]})` ⇒ **`nativeButton`→`native` 映射逐字到手**，且 **`onClick` 经 `getButtonProps`（`da`）接线**。

⇒ **G827 真值表收敛**：`nativeButton:true` ⇒ Enter 分支**一行都不执行**（原生按钮默认行为）；只有 `false` 才 `preventDefault` 并代触发 `va`。⇒ **规格 ＋2 条**：① `role` 三类特例（`menuitem*`／`option`／`gridcell` 在 `defaultPrevented` 时早退）；② `nativeButton:false` 时库补 `role:"button"`（**a11y 补偿**；与 Craft 分类按钮"无 role 覆写"合读＝官方依赖库默认）。

**库内"选项类条目"的真实默认（G836）**：`ComboboxItem` @1,391,153 的 `nativeButton:fa=!1`（**默认 false**）；Listbox／Combobox popper @1,381,573 的 Enter＝`const Da=state.activeIndex; if(Da==null) return; stopEvent(La); listRef.current[Da].click()`，容器 `role:"listbox"`／`"grid"`、`tabIndex:-1`；chip 分支 @1,379,412 同型且带 `which!==229` IME 守卫。
⇒ **不需要 Craft 侧抑制即可解释"Enter 死／Space 活"的机制候选**：**没有高亮项时 Enter 直接 return**；与第 86 批"焦点与选中两套状态互不跟随"实测咬合 ⇒ 屏上裁定动作改写（判档 → 读 `role`／`data-ds` → 按 Enter 并同读是否有高亮项）。

**`TIe` 出处判否（G837）**：该 vendor chunk（3,888,008 B）内 `TIe` **零命中**，export 头＝`export{serialize as $,tinycolor as A,Bm as B,dedent as C,memoize$3 as D,…}` ⇒ 上一步"从别名向后取第一个 `from"`"的定界法不可信 ⇒ **纪律：import／export 别名表必须先定界（向前 `import{`、向后 `}from"`）再取值**（与第 85／91 批同型的第三次失误）。

**仍未采到（20.12.5）**：`TIe` 真实出处；compact 态条目的 `role`／`data-ds`／高亮判据（屏上）；`XM` 之后的键名常量未逐字；A–G 效果面零条（写授权）。

### 20.12.6 `TIe` 结案＝Base UI `TabsRoot`（分段控件＝Tabs）＋ ✎ G837 更正（✓ 第 93 批·上半 2026-09-28 15:30–15:33，零 UI 交互＝2 次页内 `indexOf`＋vendor 页内缓存回读，**未动页面状态**）

**定界法逐字**：主包 import 语句起 @5,288、配平右花括号 @6,600、尾句 `}from"./vendor-BZCR0rqu.js";import{r as k,h as H,…` ⇒ `TIe` 的**左侧（vendor 导出名）＝`ei`**。
**vendor export 表逐字**（@3,880,220 起第 5,802 字）：`…ec,getI18n$2 as ed,Trans$2 as ee,TabsTab as ef,TabsIndicator as eg,TabsList as eh,TabsRoot as ei,Input$1 as ej,Blurhash as ek,…` ⇒ 同一 chunk 里 **`ec`＝`Button`**、**`ef`/`eh`/`eg`/`ei`＝`TabsTab`/`TabsList`/`TabsIndicator`/`TabsRoot`** ⇒ **面板 compact 态的分段控件就是 Base UI Tabs**。

`TabsRoot` @1,211,689 关键字段：`defaultValue:Pr=0`、`orientation:Hr="horizontal"`、`pa=useDirection()`、`[ya,wa]=useControlled({controlled:fa,default:Pr,name:"Tabs",state:"value"})`、`ba=fa!==void 0`、`Ta=(Va,Za)=>{Ir?.(Va,Za), !Za.isCanceled&&(wa(Va),$a(Za.activationDirection))}`、context 含 `getTabElementBySelectedValue`／`getTabIdByPanelValue`／`tabActivationDirection`。`TabsTab` @1,215,895 含 **`nativeButton:fa=!0`（默认 true）** ＋ `activateOnFocus`／`highlightedTabIndex`／`onTabActivation`。roving 判键 @1,111,675：`isMainOrientationToEndKey(…)= …||$r==="Enter"||$r===" "||$r===""` ⇒ **Tabs 把 Enter／Space／空串都算"主方向到末尾键"**。

⇒ **对 G803 的影响（第九次更新）**：两档 rail（`a6`＝Button、`Npe`→`TabsTab`）**都不传 `render` ⇒ `nativeButton` 都默认 true** ⇒ 按 §20.12.5 全文，**Enter 分支在两档里一行都不执行** ⇒ **(h) 也被静态削弱**；嫌疑只剩 **(f) `press_key(Enter)` 的事件形态** 与 **(i) `activateOnFocus` 下"已选中项再激活本就无变化"**。屏上裁定动作定稿＝**判档（带 `_dm375_` 限定）→ 记 `activeElement` 且指向未选中项 → 页内 keylogger 读事件是否到达与 `defaultPrevented` → 再判有无变化**。

#### 20.12.7 ✎ G837 的"判否"作废（别名两侧搜反）＋ 双态判据要带 CSS module hash

1. ✎ **G837 更正**：原推理「vendor 里 `as TIe` 零命中 ⇒ chunk 路径不可信」错在**拿主包的本地名去 vendor 搜**。正解＝主包 `import{导出名 as 本地名}`、chunk `export{本地名 as 导出名}`，**两侧名字不同**；chunk 路径本来就对（定界法已复验）。⇒ **纪律写死：跨 chunk 追别名先在发起侧定界取"左侧名"，再到对面搜那个名字**；同型失误累计四次（85 批按加号切键帽／91 批按字母猜别名两侧／92 批按邻近取 `from"`／本批按本地名去 vendor 搜）。
2. ★ **双态判据修正（仪器事实）**：列表屏（面板未开）跑 `[class*="_sidebar_"]` 命中 **`_sidebar_dpkxs_58`**＝app shell 侧栏（另一个 CSS module），面板 rail 是 **`dm375`** ⇒ 通用判据被污染 ⇒ **正确写法＝`[class*="_sidebar_dm375_"]` vs `[class*="_compactNav_dm375_"]`**（或限定在 `[role=dialog]` 子树内）。同次 `compactNav` 为空**只证明面板没开**，不证明窄视口下不存在该档。
3. ☆ **视口复核（15:30）**：`648×578`／`mq(747)=true`／`dpr 1.25`／**`visibilityState=hidden`**／顶栏 help 按钮不在 DOM（G793 复现）／`dialog`·`menu`＝0 ⇒ 两个外部锁仍未解；本会话另 **`mcp_list` 查 `craft` 返回 0 个工具 ⇒ 数据面写入通路不可用** ⇒ 沙盒需走屏幕创建 ⇒ 更要等可见性。

**仍未采到（20.12.6–7）**：`TabsList`／`TabsTab` 的 `onKeyDown` 全文（roving 具体动作）；`activateOnFocus` 默认值；`isMainOrientationToEndKey` 调用方；屏上裁定 (f)(i)；A–E／G 沙盒。

### 20.13 第 94 批·上半：`Tabs` 自动激活结案（Enter 悖论的静态终结）

#### 20.13.1 两侧默认值（决定"方向键算不算选中"）

| 位置 | 逐字 | 语义 |
| --- | --- | --- |
| vendor `TabsList` @1,226,228 窗内 | `const{activateOnFocus:Rr=!1,className:Pr,loopFocus:Ir=!0,render:Hr,...ca}=Ar` | **库默认＝手动激活**（方向键只移焦点，Enter/Space 才选中） |
| 主包 `Npe` @2,097,804（全包 `activateOnFocus` 唯一偏移） | `a.jsxs(IIe,{className:lh.list,activateOnFocus:!0,children:[y,C]})` | **Craft 主动改成自动激活**（方向键即选中） |

⇒ **§20.11–20.12 的"官方抑制 Enter"叙述作废**：紧凑栏（分段控件）里方向键已经把分类切过去了，`Enter` 落在 `aria-selected="true"` 的项上，`TabsTab` 的 `onClick`／`onFocus` 都以 `Oa`（＝已选中）早退 ⇒ **"无反应"是设计**。

#### 20.13.2 `TabsTab` 键面（@1,215,895–1,218,900）

- **没有任何 `onKeyDown`**。唯一键钩子 `onKeyDownCapture(){Pa.current=!0}`，被 `useIsoLayoutEffect` 里 `if(Pa.current){Pa.current=!1;return}` 消费 ⇒ 键盘驱动焦点时**不**用选中项反向设置 `highlightedTabIndex`。
- `nativeButton:fa=!0`（默认 true）＋ 不传 `render` ⇒ 原生 `<button role="tab">`，Enter 的激活靠浏览器原生 click。
- 指针意图门控 `Za`：`Da.current`／`Fa.current` 记录"是否主键 pointerdown"，`Va` 里 `!Da.current ‖‖ (Da.current && Fa.current)` 才允许自动激活 ⇒ **中／右键聚焦不切换分类**。
- 禁用档 `Pr` 在 `ru`／`Va`／`Za` 三处都早退 ⇒ 灰态 tab 完全静默。

#### 20.13.3 屏上判据（把 V77/V78 的"先判档"落成可执行选择器）

| 目标 | 选择器（必须带 CSS module hash，G840 纪律） |
| --- | --- |
| 宽栏分类条目 | `BUTTON._action_1j891_1`（`data-ds:"action"`） |
| 紧凑栏分类条目 | `[class*="_tab_x8v9o_"]`（list＝`_list_x8v9o_16`、indicator＝`_indicator_x8v9o_94`） |
| 面板容器（区分 app shell） | `[class*="_sidebar_dm375_"]`／`[class*="_compactNav_dm375_"]` |
| **选中**项 | `[role="tab"][aria-selected="true"]` |
| **高亮**（roving 焦点）项 | `[data-composite-item-active]`（`ACTIVE_COMPOSITE_ITEM` 字面值） |
| 悬停是否夺高亮 | 默认**不**（`highlightItemOnHover:!1`） |

⇒ **裁定动线**：`[data-composite-item-active]` 与 `aria-selected` 落在同一元素 ⇒ 自动激活生效 ⇒ Enter 必然"无反应"（设计）；落在不同元素 ⇒ 手动激活 ⇒ Enter 应激活，若仍无反应才是 (f) 通路问题。

#### 20.13.4 禁用态吞键（唯一找到的按钮级 Enter `preventDefault`）

`useFocusableWhenDisabled`（@991,941 起）：`onKeyDown(pa){Cr&&Ar&&pa.key!=="Tab"&&pa.preventDefault()}` ⇒ **disabled ＋ focusableWhenDisabled 时除 `Tab` 外所有键被 `preventDefault`**，且 `useButton` 的 `onClick` 里 `if(Ar){$a.preventDefault();return}`。⇒ 官方灰态按钮＝**焦点可停、键无反馈、click 被吃**，属 F 权限矩阵的可观测判据。

**仍未采到（§20.13）**：~~`useCompositeRoot` 主 keydown 全文（方向键／Home／End 的拦截与 `stopEventPropagation` 落点）~~ **✎ 第 96 批结案＝§20.14.1／§20.14.2**；~~`isMainOrientationToEndKey` 调用方~~ **✎ 第 96 批结案＝§20.14.3（3 处调用方全在 Floating UI `useListNavigation` 体内，与面板 rail 无关）**；~~`--active-tab-*` 属性全集~~ **✎ 第 96 批结案＝G861（全集 6 个；Craft 主包零引用 `TabsIndicator`，CSS 只消费 left／width／height）**；(f) 屏上 keylogger 复核（等窗口可见）**仍未做**。另新增未采：`uF` 表尾、`cne` 本体、`enableHomeAndEndKeys`／`loopFocus` 的实际传参（G859）。
### 20.14 第 96 批·上半：`useCompositeRoot` 主 keydown 全文 ＋ 平台常量表 ＋ 块编辑器三道门 ＋ markdown 快捷输入表 `uF`（✓静，零写入；2026-09-29 09:26–10:20，12 次 `evaluate_script` 页内 `fetch`／`indexOf`，产物走 `filePath` 落盘；原始窗 `_harvest/b96-composite*.json`／`b96-static*.json`／`b96-onkeydown.json`／`b96-css*.json`／`b96-gates.json`）

#### 20.14.1 composite 根的方向键模型（vendor `vendor-BZCR0rqu.js` @1,221,599 起，处理体 @1,222,100–1,225,500）

解构默认值逐字：`{itemSizes, cols:1, loopFocus:!0, dense:!1, orientation:"both", direction, highlightedIndex, onHighlightedIndexChange, rootRef, enableHomeAndEndKeys:!1, stopEventPropagation:!1, disabledIndices, modifierKeys:EMPTY_ARRAY}`。

处理体四道门（逐字）：

1. `const Ua = pa ? ALL_KEYS : ARROW_KEYS;` ⇒ **`enableHomeAndEndKeys` 为假时键集只有四向箭头**。
2. `if (!Ua.has(Pa.key) || isModifierKeySet(Pa, ga) || !ba.current) return;`，其中 `isModifierKeySet($r,Ar) = for (const Cr of MODIFIER_KEYS.values()) if (!Ar.includes(Cr) && $r.getModifierState(Cr)) return !0` ⇒ ★ **按住任意一个不在白名单里的修饰键（Ctrl／Alt／Shift／Meta）＝整条方向键导航直接放弃**（`modifierKeys` 默认空数组 ⇒ 一个都不豁免）。
3. RTL 与方向映射：`Ia = Hr==="rtl"`；前进键 `Da = {horizontal:La, vertical:ARROW_DOWN, both:La}[Ir]`、后退键 `ru = {horizontal:Fa, vertical:ARROW_UP, both:Fa}[Ir]`（`both` 档的前进＝**右**、后退＝**左**）；`ja`／`Xa` 两个键集在 `both` 档分别是 `[右, ↓]`／`[左, ↑]` ⇒ ★ **`both` 档把上下键也当主轴**。
4. 原生输入框让路：`isNativeInput(target) && !isElementDisabled(target)` 时按 `selectionStart/End`、`shiftKey`、光标是否在串首/串尾决定放行（有选区或光标不在边界 ⇒ `return`，把键留给原生行为）。

Home／End 与移动与收尾（逐字形状）：`pa && (Pa.key===HOME ? Va=Za : Pa.key===END && (Va=Ga))`（`Za=getMinListIndex`、`Ga=getMaxListIndex`）⇒ **只有开了第 1 条的开关才走**；`Va===$a && (ja.includes||Xa.includes) && ( loopFocus ? (末＋前进⇒首 ／ 首＋后退⇒末) : findNonDisabledListIndex(...) )`；终局 `Va!==$a && !isIndexOutOfListBounds(xa,Va) && ( ha && Pa.stopPropagation(), eu.has(Pa.key) && Pa.preventDefault(), Ta(Va,!0), queueMicrotask(()=> xa.current[Va]?.focus()) )`。

⇒ 三条**可直接屏上证伪的预测**（窗口解锁后一发行裁）：
- **P-1**：`Alt+ArrowDown`／`Shift+ArrowDown` 在面板里**不应有反应**（第 2 道门）。
- **P-2**：`Home`／`End` **不应有反应**，除非 Craft 在 `TabsList`／`CompositeRoot` 上传了 `enableHomeAndEndKeys`（第 1 道门 ⇒ 与第 88 批"源码说它们是标准键"的改判对冲，本批把天平推回"默认关"）。
- **P-3**：真正导航成功时 **DOM 焦点会在一个微任务后搬过去**（`queueMicrotask(...focus())`）⇒ 若屏上仍测到"改选中不搬焦点"，则该 rail **不是** `CompositeRoot`（而是 Craft DS 自绘的 `Npe` 分段控件），本地实现据此选边。

#### 20.14.2 两侧默认值相反第二例：`stopEventPropagation`

`useCompositeRoot` 这个 **hook** 默认 `stopEventPropagation:!1`，而包它的 **组件** `CompositeRoot`（@1,225,511）默认 **`wa=!0`** 并透传下去；`CompositeRoot` 另有 `highlightItemOnHover:!1`、`tag:"div"`，并把处理体以 **`relayKeyboardEvent: Oa.onKeyDown`** 再暴露一次。⇒ 凡走组件树（Craft 的面板 rail 属这种），方向键会 **`stopPropagation()`** ⇒ 页面上挂在 `document` 的和弦分发器（`eEe`@14,301，见 §20.6.6／G813）**在弹层打开期间收不到方向键**（捕获相位除外）。⇒ 这是"弹层吞键"这条老观察的第二个机制出处（第一个是 §20.13 的禁用吞键）。⚠ **纪律沿用 G845**：判"官方有没有做 X"之前，**库默认值**与**包装层实际传参**必须两侧都拿到手——本批再次出现"两侧默认值相反"，只看一侧就会把结论写歪。

#### 20.14.3 ✎ `isMainOrientationToEndKey` 结案＝**归属错了**（Floating UI，不是 Base UI composite）

本体逐字（vendor @1,111,555）：`function isMainOrientationToEndKey($r, Ar, Cr) { return doSwitch(Ar, $r===ARROW_DOWN, Cr ? $r===ARROW_LEFT : $r===ARROW_RIGHT) || $r==="Enter" || $r===" " || $r===""; }`；同区还有 `doSwitch`（`vertical⇒Ar, horizontal⇒Cr, default⇒Ar||Cr`）、`isMainOrientationKey`、`isCrossOrientationOpenKey`、`isCrossOrientationCloseKey`（`both` 或 `horizontal 且 cols>1` 时改吃 `ESCAPE`）。**调用方 3 处全部落在同一个函数体内**：@1,114,145（`useIsoLayoutEffect`，打开列表时决定高亮**首项还是末项**）、@1,117,295 与 @1,117,355（`if (isMainOrientationKey(Ba.key,$a)) { stopEvent(Ba); … }` 的 forward／backward 分支）。而该函数所属 **`useListNavigation` 是 Floating UI 的 hook**（同区逐字符号 `getFloatingFocusElement`／`useFloatingTree`／`floatingElement`／`domReferenceElement`／`cols`／`rtl` 为证）。

⇒ ★★ **更正**：第 92／93 批把「`Enter`／`Space`／空串算到末尾键」当成快捷键面板 Enter 语义的候选（G836），是**跨库张冠李戴**——这里的"末尾键"语义是「**用末档键进入列表 ⇒ 初始高亮落在列表末尾**」，与「按 Enter 激活按钮」无关；面板分类 rail 走的是 Base UI composite（§20.14.1），两码事。⇒ G836 的"无需 Craft 侧抑制"机制候选**去掉一条**，Enter 悖论的静态结论仍以 G845（`activateOnFocus:!0`）为准。

#### 20.14.4 平台常量表逐字（主包 @13,822 区）＝`k2`／`_d`／`JAe`／`gae` 四个疑名结案

`_E = navigator.platform ?? ""`；`c4 = navigator.userAgent ?? ""`；`YAe = c4.toLowerCase().indexOf("macintosh") > -1 && navigator.maxTouchPoints > 2`；`_d = /iPad|iPhone/.test(_E) || c4.indexOf("iPad") > -1 || YAe`；`jE = ["Win32","Win64","Windows","WinCE"].indexOf(_E) > -1`；`XAe = _E.indexOf("Linux") > -1`；**`Ll = _E.indexOf("Mac") > -1 && !_d`**；`JAe = c4.indexOf("CrOS") > -1`；`gae = c4.indexOf("Firefox") > -1`；**`k2 = c4.indexOf("Android") > -1`**；`Hd = c4.indexOf("Safari") > -1 && 不含 Chrom／CriOS／FxiOS`；`ff(t) = jE || Ll || XAe || k2 || JAe`。

⇒ 三条含义：① ★ **`Ll`（Mac 标志）判的是 `navigator.platform` 而不是 UA**，且带 `maxTouchPoints>2` 的 iPadOS（伪装 Macintosh）被 `YAe` 归进 iOS ⇒ 表D「Mac／Windows 两列」的分叉源头在这里；② ★ **`k2`＝Android** ⇒ 见 §20.14.5 的短路；③ `ff()` 是"桌面族"五员（含 Android，不含 iOS／Safari-only），供其它门控复用。⇒ 本地 `grep -rn "navigator.platform\|userAgent" src/` 本轮**无命中**（输出为空）⇒ **本地零平台判定**，键帽与分派不分 Mac／Win（与 G777 的 `⌘K` 写死同源）。

#### 20.14.5 块编辑器 `onKeyDownBound` 的三道门（主包 @4,091,385，逐字）

`this.onKeyDownBound = n => { if (k2) return; const o = this.props.tableId != null ? [] : uF; this.props.allowBlockStyling && cne(n.key, n, this.editor, this.state.editorState, this.props.blockId, o, this.saveChangesBound, this.docDispatchBound, this.uiDispatchBound, this.props.blocksRef.current, this.props.uiStoreRef.current.toggleStates); }`

⇒ ① **Android 上块级键定义整体不分发**；② ★ **`tableId != null` ⇒ 键定义表换成空数组** ⇒ 表格单元格内 markdown／块级快捷输入整体失效（`cne` 定义 @3,777,934）；③ **`allowBlockStyling` 为假 ⇒ `cne` 整个不调用**＝只读态在 UI 侧的总门（比 §十七 的 `fYe` 动作白名单更靠前）。

同区 IME 与焦点栈（逐字）：`disableKeyDefs = () => bn.pushIntoFocus({id: this.disabledId, keyDefs: [], allowPropagation: !1})`、`enableKeyDefs = () => bn.removeFromFocus(this.disabledId)`、`onCompositionStartBound ⇒ isInComposition=!0; disableKeyDefs()`、`onCompositionEndBound ⇒ isInComposition=!1; enableKeyDefs()` 并把 cmd／emoji／blockLink 三个菜单的 `setSearchKeywordOverride(null)` 清一遍；`onCompositionUpdateBound` 按 `inlineMenuState.type` 把 `searchKeyword + n.data` 转发给对应菜单，emoji 取词正则 `/^:([^\s^/]+)(:?)/`。⇒ ★ **IME 组合期间快捷键失效的第二处实装**（第一处是 `keyCode===229` 短路；这次是**整张键定义表被摘掉且 `allowPropagation:!1`**）。另 `undoBound` 在派发前先 `setState({inlineMenuState:null})`（撤销先关内联菜单），`toggleHighlightBound` 读 **`lastUsedHightlight`**（★ 官方属性名少一个 h，登记进「官方自身不一致」词表）。⇒ 本地 `grep -rn "onCompositionStart\|isComposing\|compositionstart" src/` **无命中** ⇒ **本地组合期不摘键定义**（P0 真缺陷候选：中文选词按 Enter 会误发 `EDIT_START`／逐级退档）。

#### 20.14.6 ★ markdown 快捷输入表 `uF` 全量（主包 @3,775,423 起）＝「Markdown 快捷方式」的实现本体

所有条目 `trigger` 都是**空格**、pattern 一律允许前导空白 `^\s*`。逐条：`#`→`at.Title`；`##`→`at.Subtitle`；`###`→`at.Heading`；★ **`####`→`at.Strong`（不是四级标题）**；`[x×☐□]`／`[ ]`／`-[]`→`Nt.Todo`＋`tn.Unchecked`；`[x×]`（含 `[x]`）→`tn.Checked`；`-*•`→`Nt.Bullet`；★ **`+`→`Nt.Toggle`**；`>` 与 `|`→`P2([blockId],{focus:1})`；★ **`(\d+)\.`→`Nt.Numbered` 且把匹配到的数字 `ti(m[1],10)` 当起始序号**（支持从任意序号起编）。每条派发 `[样式 action, od(t)]` 两个 action（`od`＝剥掉触发串）。

⇒ 与本仓库 `keyboard.md` 表A 的关系：官方的**四级样式词表**在这里第四次印证为 `Title/Subtitle/Heading/Strong`（不是 H1–H4），`####` 落 `Strong` 意味着**表A 的 `STRONG`「强调」vs 面板「粗」**那条差异有了第三源。⇒ 屏上预测（零写入即可验，需沙盒则走低授权）：在正文输 `+ ` 应生成 Toggle、输 `7. ` 应生成起始序号为 7 的有序列表、**在表格单元格里输 `# ` 不应生效**（§20.14.5 第②条）。

#### 20.14.7 `ho` 任务命令表首两行逐字（主包 @900,806 之后）

`ho = { PREV_TASK: {...mo(Ts), shiftKey: void 0}, NEXT_TASK: {...mo(ms), shiftKey: void 0}, EDIT_START: mo(oo), … }` ⇒ ★ **`PREV_TASK`／`NEXT_TASK` 用的是裸 `↑`／`↓`（`mo`＝严格裸键，G818）并显式写 `shiftKey: void 0`**，与屏上 表D 记的 `Alt-↑ Alt-↓`（文档「信息 → 动作」子页签印出的键帽）**不是同一组** ⇒ 说明"上一个／下一个任务"与"上一个／下一个块"是两条不同命令，`keyboard.md` 表D 需要按命令名分列（新采集项，见 20.14.9）。

#### 20.14.8 CSS 侧的键帽／焦点环判据（`index.css` 296,789 B，逐字）

`[data-whatintent=keyboard] ._tab_x8v9o_26:focus{outline:2px solid var(--accent-500); outline-offset:-2px}` ⇒ ★ **焦点环只在键盘意图下出现，且 `outline-offset` 是负 2px（描边内收）**；`._tab_x8v9o_26[data-disabled]{opacity:.4;cursor:default}` ⇒ 灰态＝**不透明度 0.4 ＋ cursor 默认**；`._tab_x8v9o_26[data-active]`（与非触屏 hover 同条）把 `--label-color` 从 `var(--foreground-600)` 提到 `var(--foreground-900)`；`._segmentedControlWrapper_1b2pm_1{padding:4px 0}`。⇒ 与 §20.13.4 的禁用吞键、G845 的自动激活拼成 **F 只读灰态三面判据**（属性／键行为／视觉），窗口一解锁可零写入直测。

#### 20.14.9 37 处 `onKeyDown` 全表分类（主包，本轮逐窗读回，不是计数）

偏移（升序）＝1,060,238／1,060,903／2,197,928／2,247,538／2,258,955／2,260,857／2,276,207／2,278,515／2,631,502／2,632,098／2,634,375／2,634,592／2,636,007／3,795,422／3,811,214／**4,091,385**／4,106,936／4,106,951／4,820,898／5,193,724／5,412,164／5,457,081／5,465,249／6,559,643／6,559,770／6,559,897／6,560,054／6,560,181／6,560,308／6,611,839／6,611,966／6,612,093／6,612,250／6,612,377／6,612,504／6,733,728／6,734,923。⇒ **37 处**与第 88 批「主包 37 处」第三次独立复现（口径＝主包内 `onKeyDown` 字面量出现处）。分类（逐窗读内容判的，不是数）：① **唯一的块级主分发器＝4,091,385**（§20.14.5，本轮新结案）；② 团队邀请邮箱行（2,247,538／2,258,955／2,260,857／2,276,207／2,278,515／6,733,728／6,734,923＝7 处，`addRow/updateEmail` 形态，占最大一块）；③ 六位数字验证码输入（6,559,6xx 与 6,611,8xx 两组 × 6 格，`inputMode:"numeric", maxLength:1`）；④ DS Menu 与 sections（2,631,502／2,632,098／2,634,375／2,634,592，`role:"menu"`）＋ 一个 `onKeyDownCapture`（2,636,007）；⑤ 表格（4,106,936／4,106,951＝`onKeyDownBound` 接线处；4,820,898＝带 `data-cell-id` 的单元格）；⑥ URL／链接输入（3,795,422／3,811,214／5,465,249）；⑦ 通用输入与 textarea（1,060,238／1,060,903／5,193,724）；⑧ 下拉与自定义按钮（2,197,928／5,412,164／5,457,081）。⇒ ★ **主包内没有任何"全局键盘抑制"**的结论第四次复现：37 处全是**组件级 prop 接线**，唯一的"整表清空"出现在块级（表格分支）与焦点栈（IME 分支）。

**仍未采到（§20.14）**：`uF` 表尾（窗口截到 `pattern:/^\s*-` 处，之后条目形状待补）；`cne` 定义本体（@3,777,934）与 `allowBlockStyling` 的赋值来源；Craft 是否给 `TabsList`／`CompositeRoot` 传 `enableHomeAndEndKeys` 与 `loopFocus:!1`（G859 冲突未裁）；`TabsTab` 的 `onFocus` 里 `Da.current／Fa.current` 两个 ref 在"指针按下后聚焦"场景下的完整门控链（只读到定义，未读全 `Va(Xa)` 的所有分支）；表D 的「上一个／下一个」两命令在面板里的**键帽印串**对照（需屏上或面板 DOM）；(f) 宽栏真 `button` 上 Enter 是否到达——**依旧需要屏上 keylogger**。


## 20.15 官方 markdown 快捷输入表全量（第 96 批·下半，G854 结案）

来源＝`docs.craft.do/zh-Hans/write-and-edit/formatting/markdown-shortcuts`（标题「Markdown 快捷键 - Craft Help Center」），载体实测＝**`<li>` 内的 `<code>`**（`code:36 / li:90 / kbd:0 / table:0 / dt+dd:0/0`），进入方式＝应用内帮助浮层的「Markdown 快捷方式」menuitem 整页导航（**直链不可达**，见 `gap.md` G879）。页内标题层级（`textContent` 抓回）＝`H1 Markdown 快捷键` → `H2 块级快捷方式`（`H3 标题和文本样式／列表与任务／特殊块／分隔线`）→ `H2 行内格式化`（`H3 文本样式／特殊行内元素`）→ `H2 在此页面`。

⚠ 证据等级：**这是官方文档站正文＝「官方在文档里声明了 X」，不是屏上行为事实**（§4）。凡与 bundle／本地代码冲突处一律标出，不得据文档改实现；`uF` 列为第 96 批·上半从主包反编译得到的独立印证（`gap.md` 三点一〇二四）。

| 触发（官方文档原样） | 文档声明的结果 | `uF` bundle 静态印证 | 本地现状（本轮实扫） | 判定 |
| --- | --- | --- | --- | --- |
| `#` | 主标题 | 标题档 | StarterKit `heading.levels=[1,2,3,4]`（`Editor.tsx:249-251`） | ✓ 一致 |
| `##` | 副标题 | 同上 | 同上（H2） | ✓ 一致 |
| `###` | 小标题 | 同上 | 同上（H3） | ✓ 一致 |
| `####` | **加粗块** | ★ `####` → `at.Strong`（**不是标题**） | 本地 `levels` 含 4 ⇒ `####` 造出 **H4 标题** | **行为不同（P1）**：官方第四档不是标题而是 Strong；本地把它当 H4 |
| `-` 或 `*` | 无序列表 | `Nt.Bullet` 类 | StarterKit BulletList（默认输入规则） | ✓ 一致 |
| `1.`／`2.`／`3.` | 有序列表，「大于 1 的数字会将该数字作为起始编号」 | ★ `(\d+)\.` → `Nt.Numbered` ＋ `ti(m[1],10)` 起始序号 | StarterKit OrderedList（其默认规则带 `start`） | ✓ 一致（**文档独立印证了这条非显而见的静态结论**） |
| `x` 或 `[]` | 未完成的待办 | 待办档 | 本地正则 `/^\[([ xX])\]\s$/`（`markdown-shortcuts.ts:109`）**只吃 `[]`/`[x]`，不吃裸 `x`** | **缺失一半**：裸 `x` 档未实现 |
| `[x]` | 已完成的待办 | 同上 | 同上，`checked: match[1].toLowerCase() === 'x'` | ✓ 一致 |
| `+` | 可折叠列表 | ★ `+` → `Nt.Toggle` | 本地**无 Toggle/Details 扩展**（`grep Toggle\|Details src/components/editor/Editor.tsx` 零命中） | **缺失（P1）** |
| `>` 或 `\|` | 引用块 | ★ `>`／`\|` → `P2({focus:1})` | StarterKit Blockquote 只吃 `>`；`\|` 别名无 | **缺 `\|` 别名**；⚠ 术语待对账（文档＝引用块，静态 `P2` 我记为 callout） |
| ` ``` ` 或 `'''` | 代码块 | 代码块档 | `codeBlock:false` ＋ `CodeBlockLowlight.extend`（`Editor.tsx:245/304`）⇒ ` ``` ` 有、`'''` 待实测 | 部分（`'''` 未确认） |
| `=--` | 粗横线 | 分隔线族 | 本地 `horizontalRule:false` ＋ 自研 divider（注释自述「four weights」，`Editor.tsx:246-248`） | **档数待实测**：官方 5 档 vs 本地注释 4 档 |
| `---` | 普通横线 | 同上 | 同上 | 待实测 |
| `.--` | 点状横线（浅） | 同上 | 同上 | 待实测 |
| `..-` | 三点线（极浅） | 同上 | 同上 | 待实测 |
| `===` | **分页符** | 独立节点 | 本地无分页符节点（divider 族里未见 page break） | **缺失候选**，须先确认官方 `===` 落什么节点 |
| `*text*` 或 `_text_` | 斜体 | 斜体 mark | 本地无显式规则，依赖 TipTap Italic 默认输入规则（`*` 变体是否在默认表内**未实测**） | 待实测 |
| `**text**` 或 `__text__` | 加粗 | 加粗 mark | 同上（TipTap Bold 默认） | 待实测 |
| `***text***` 或 `___text___` | 加粗并斜体 | 组合 mark | 无显式规则 | 待实测 |
| `~~text~~` | 删除线 | 删除线 mark | ✓ 本地已实现（`markdown-shortcuts.ts:11-29`） | ✓ 一致 |
| `::text::` 或 `==text==` | 高亮 | 高亮 mark | 本地只有 `/(==(.+?)==)$/`（`markdown-shortcuts.ts:34-49`）⇒ **`::` 别名缺** | **缺 `::` 别名** |
| `` `text` `` | 内联代码 | 内联代码 mark | TipTap Code 默认输入规则 | ✓ 一致（未逐字实测） |
| `$$text$$` | **行内**公式 | 公式族 | 本地 `$$…$$` → **mathBlock**（`markdown-shortcuts.ts:78-83`），`$x$` → inlineMath（`:90-101`） | **行为不同**：官方把 `$$text$$` 归在「特殊行内元素」，本地当块级 |
| `[link name](url)` | 插入链接 | 链接 mark | ✓ 本地已实现（`markdown-shortcuts.ts:55-71`） | ✓ 一致 |
| `@` 或 `[[` | 插入页面或块链接 | 提及/链接族 | 本地 `markdown-shortcuts.ts` 无此规则；是否有 mention 扩展走独立触发器**未扫** | 缺失候选（须先扫 mention/slash 扩展） |

**小结（本表新增的可执行缺口）**：`####`→Strong 与本地 H4 冲突（P1）、`+`→可折叠列表整体缺失（P1）、裸 `x`→待办缺、`\|`→引用块别名缺、`::text::`→高亮别名缺、`$$text$$` 行内/块级判定相反、分隔线 5 档 vs 本地 4 档待实测、`@`/`[[` 页面链接触发器未扫。

**仍未采到（§20.15）**：以上「待实测」全部需要**有绘制面的屏幕＋键盘通道**（本批 G875 已证两桥按键均不落地）；官方文档与 `uF` 表在「引用块 vs callout」术语上的对账；`===` 分页符落到哪个块类型；分隔线五档各自的节点属性。
