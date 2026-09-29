# Craft.do 任务 / 提醒 / 循环语义（实现级，静态解码）

来源：`_harvest/js/index-DiTmKH3z.js` 的 `B3`、`cYe/dYe`（下一次发生计算）、`zy/cde/dde`（三态与复制）、`rnn`（循环完成再建）、`X7e/Dzt/_zt`（提醒动作分派）、`Ny/gw/gU`（批量 action）、`Fq`（多标签合并）。手法：**从 i18n key 反查代码**（见 `_harvest/findkey.mjs`）。

## 一、任务三态（`tn`，数值编码）

```
Unchecked = 0    Checked = 1    Canceled = 2
```

- 线值映射（`h9e`）：`Checked → "completed"`、`Canceled → "cancelled"`、`Unchecked → "todo"`。
- 切换语义（`cde`）：`Unchecked → Checked`；`Checked → Unchecked`；**`Canceled → Unchecked`**（取消态再点回未勾选，而不是直接回完成）。
- 批量语义（`dde`）：一组里**只要有一个 Unchecked，结果就是 Checked**（全选即全勾），否则 Unchecked。
- 复制块时（`zy`）：`todoState` 保留键位但**值重置为 `Unchecked`**，同时用 `gI/A5` 从 `styleProps` 里剔掉任务属性再落到新位置。

⇒ 官方"已取消"是**第三态而非布尔**（对应快捷键 `SET_CANCELLED` = `⌘⌥⇧T` / Mac-only `⌘⌥/`，见 `keyboard.md` 表 D）。本地 `Task.status` 只有 `todo|doing|done`（`contract.prisma:304`），**没有 cancelled**，且 `doing` 是官方没有的。

## 二、四套独立时间维度

| 维度 | action | 载荷 | 语义 |
|---|---|---|---|
| 日程 schedule | `setTaskSchedule(blockIds, schedule)` | `{schedule}` | 计划哪天做 |
| 截止 deadline | `setTaskDeadline(blockIds, deadline)` | `{deadline}` | 最晚必须完成 |
| 提醒 reminder | 提醒实体（§四） | `{isCompleted, completionDate}` | 通知时点 |
| 完成 completion | 由 `reminder`  resolve/unresolve 带 | `completionDate` | 完成时刻 |

三个 setter 的 `blockIds` 都是**数组** ⇒ 官方所有任务时间操作天生支持多选批量。

## 三、循环配置（`repeatConfig`）

```
frequency ∈ daily | weekly | monthly | yearly
interval  ∈ 1 .. B3[frequency]        B3 = { daily: 31, weekly: 52, monthly: 12, yearly: 10 }
daily.skipWeekends     : boolean
monthly / yearly       : dynamicDays[]  （相对日，例如"每月最后一个周五"）
```

- **间隔上限按频率不同**（31/52/12/10）—— UI 里间隔档位长度就是 `Array.from({length: B3[p]})`，选完频率后 `interval` 重新可用。
- 选择频率时同步写入该频率的默认配置（`A(B3.yearly)` 之类），并立刻切到 `repeatConfig` 子层。
- 选取器是**三层导航**：`schedule → reminder` / `schedule → (repeatPresets | repeatConfig)` / `repeatPresets → repeatConfig` ⇒ 官方既有**预设档**也有**自定义层**，两者在同一弹层内前进后退，关闭时整层回到 `schedule`。
- 周末处理：文案 `tasks.also.on.weekends` / `tasks.skip.weekends`（同一选项的正反两态）。

**下一次发生时间的算法**（`cYe(from, config)`）：
- `daily`：循环最多 `my` 次向前推 `interval` 天，**遇到 `skipWeekends` 就跳过周末**，返回第一个落在工作日的答案；全是周末则返回 `null`。
- `weekly` / `monthly` / `yearly`：各自独立函数（`lLe` / `cg` / `uO`）。
- `monthly`/`yearly` 的 `dynamicDays`：算出的日期会**过滤回目标月**（`getMonth() === 期望月`），若过滤后为空则**回退到该月当天**，最后按时间升序排。⇒ 相对日永远不跨月溢出。

⇒ 本地已有循环实现（`Intl` 双遍算时区偏移，覆盖 DST 与月末钳制），但**没有 `skipWeekends`、没有 `interval` 上限表、没有第三态与循环再建的联动**。

## 四、循环任务完成 → 自动再建 + logbook

`rnn(spaceId, docLookup, node)`（任务创建路径）里：

- `taskCreationSource === "RepeatingTaskCompletion"` ⇒ 完成一个循环任务时系统自动创建下一条。
- 再建的目标位置是 **`{type:"logbook-subpage", blockId, logbookTitle: t("tasks.completed.tasks")}`** ⇒ **已完成任务被归档进一个"已完成的任务"logbook 子页**，不是原地翻态；普通新建则是 `{type:"inbox"}` 或 `{type:"page", blockId}`。
- `Inbox` 是**真实实体**：`INBOX_DOCUMENT_ID` + `INBOX_ROOT_BLOCK_ID`（有专门的文档与根块）。
- 创建载荷一次性带 `{preferredBlockId, title, runAttributes, schedule, deadline, assigneeUserId, state, repeat}`；`description` 非空时**额外建一个 subblock 承接正文**。
- 父块解析：给定 `parentId` 优先；否则 `documentId === INBOX_DOCUMENT_ID → INBOX_ROOT_BLOCK_ID`，再否则取该文档的 `rootBlockId`；断言非空。

## 五、提醒动作与深链

`X7e(reminder, patch, uiDispatch, signal, reason)`（`ReminderActions`）：

1. 先 `EW(i, reason)` 做统一富集/校验；
2. 若是"块提醒"（`Gl(i)`）：补 `deeplinkUrl = buildDynamicDeeplinkToBlock({blockId, documentId, spaceId, editingAllowed: true})` 再交给创建/更新分支；
3. 若是另一类（`o9(i)`，日程型）走第二分支；
4. 两者都不是 ⇒ **只记 warn 日志 `"Unknown reminder type"` 并带上 JSON**，不抛错。
- resolve/unresolve 是一等动作：`Dzt(...)` 就是 `QB(reminder, {isCompleted:true, completionDate:Date.now()}, ..., "resolve")`，反向 `"unresolve"` 把 `completionDate` 清成 `undefined`。
- 删除同理分两类，各自 `kzt` / `vzt`。
- 本地新建的提醒用 id 前缀 `new_reminder_` + uuid（`J7e`/`jzt`/`Rzt`）⇒ **未落库的临时提醒靠 id 前缀识别**。
- 相对时间桶含 `next_week`（`zb()` 判定），配合 `date.{this,next,last}.week` 等文案。

⇒ 提醒上限三档（总数/进行中/已完成，见 `dialogs.md` §一）走的是这些动作之前的校验。

## 六、多标签页并发（此前完全没记录的机制）

```
mergePatchesFromOtherTabs(incomingPatches, newLocalSyncIndex)
```

存在一个专门的 action：**同浏览器其它标签页产生的补丁要合并进来，并携带一个本地同步序号**。配合 `Fq` 的形状可确认官方是"每标签页一个写者 + 补丁合并 + 序号对齐"模型，而不是单例编辑器。

⇒ 本地若在同一浏览器开两个标签编辑同一文档，目前没有这层合并（Yjs 处理跨端，不处理"同端多标签的补丁序号对齐"这一层）。

## 七、集合侧的配套 action（同批发现）

`updateRecordObject` / `updateRecordObjectProperty` / `removeRecordObjectProperties(blockId, propertyIds)` / `updateObjectListData` ⇒ 集合行与字段的增删改都是**按 blockId 的显式 action**，与 `protocol.md` §四的 `BlocksV2Actions`（i/d/m/n）是两套不同层级的操作词表。

## 八、命令面 ↔ 内部模型 对照（第 2 批的观测清单，`~` 文案级）

§二/§三 是从代码反推的**模型**；这一节是官方**印在菜单与命令面板上的用户可见形态**，第 2 批动态采集就是逐条验它。

| 用户可见命令（i18n 键） | 对应内部 action | 备注 |
|---|---|---|
| `commands.task.deadline`「设定截止日期」/ `.today`「今天」/ `.for.tomorrow`「明天」/ `.next.monday`「下周一」/ `.date`「按日期设定截止日期…」/ `.clear`「清除截止日期」 | `setTaskDeadline(blockIds, deadline)` | 快捷档 = 今天 / 明天 / 下周一 + 日期选择器 + 清除 |
| `commands.task.schedule`「计划任务」/ `.for.today`「安排到今天」/ `.for.tomorrow`「安排到明天」/ `.next.monday`「安排到下周一」/ `.date`「按日期安排…」/ **`.x`「安排到 [0]」** / `.clear`「清除时间表」 | `setTaskSchedule(blockIds, schedule)` | **与 deadline 几乎对称，但多一条 `schedule.x`「安排到 [0]」**（动态日期短语）⇒ 日程是"可指任意一天"的主维度，截止没有这条 |
| `commands.change.deadline.3dot` / `commands.change.schedule.3dot` / `commands.reschedule`「改期」 | 同上两 setter 的 update 分支 | "已有值"时菜单项换成「更改…」⇒ **同一 setter 两种标题**（R22 时序三句在任务上的体现） |
| `commands.add.reminder` / `create.reminder` / `edit.reminder` / `remove.reminder` / `remind.me` / `remind.me.3.dots` / `mobile.remind` | §四 提醒实体 CRUD | **动词最多的一族**（添加/创建/编辑/移除/提醒我/提醒我…），且 `commands.mobile.remind` 单列 ⇒ 提醒在桌面与移动是**两套入口一套实体** |
| `commands.reminder.mark.resolved` / `.show.in.progress` / `.show.resolved` | 提醒的 `isCompleted` | ⇒ **提醒自身有完成态与两个筛选视图**，不是单纯的通知定时器（与 §二"完成维度由 reminder resolve 带"互证 ✓） |
| `commands.repeat`「重复…」 | `setTaskRepeat*Config` | 单数入口，进的是 §三 那个**三层导航弹层** |

**交叉验证成功 ✓✓**：`alert.reschedule.reminder.title`「**此区块**有一个即将到期的提醒。」—— 用"区块"而不是"任务"，正好对上 §五 那条 `Gl(i)` 块提醒分支（要补 `buildDynamicDeeplinkToBlock({blockId, documentId, spaceId})`）⇒ **提醒可挂在任意区块上，不只任务块**。这是本地最容易漏的一条。

**序列级操作**（此前只在代码里见过，命令面确认存在）：`tasks.complete.remaining`「完成剩余」/ `tasks.cancel.remaining`「取消剩余」⇒ 对重复任务可**一次性影响整个后续序列**；配套状态句 `tasks.cancelled`「已取消」+ `tasks.canceled.on`「已于 [0] 取消」+ `tasks.completed.on`「完成于 [0]」（**取消与完成各记一个时间戳**）。

**重复频率的自然语言模板有三档**：`tasks.0.on.1`「[0] 于 [1]」/ `tasks.0.on.the.1.day`「[0] 于 [1] 日」/ `tasks.0.on.the.1.day.of.2`「[0] 于 [2] 的第 [1] 天」⇒ 分别对应 **按星期 / 按日号 / 按某月第 N 天**，正是 §三 `dynamicDays` 的三种呈现，反证 `dynamicDays` 元素至少含 `{月, 日序}`。

**roll-forward 的官方口径**（本批最关键的一条待验事实）：`tasks.complete.task.decs`「当你完成任务时，下一个任务将根据**原始计划日期**进行安排。」⇒ 与 §三 的 `cYe(from, config)` 算法一致（从计划日推进而非从完成时间），但**文案是给用户看的承诺**，动态采集要验它是否真按承诺执行（尤其 `interval > 1` 与 `skipWeekends` 组合下）。

## 九、`repeatConfig` 完整 schema（2026-09-27 从本地保留的 bundle 反编译结案 ✓）

来源：`_harvest/js/`（26 MB，仍在盘上）里的**解析器 `dMe(t)`** 与**标签器 `ann(t,e,n)`**。这一节把 §三 里三处"只从用法反推"的空白全部坐实。

### 9.1 顶层字段

| 字段 | 类型 | 缺省 | 说明 |
|---|---|---|---|
| `type` | `"flexible"` \| `"fixed"` | **`"flexible"`** | **锚点模式**，见 9.2 |
| `frequency` | string；**非 string 时整个 config 直接返回 `undefined`** | 必填 | `daily\|weekly\|monthly\|yearly` |
| `interval` | int \| null（`ti()` 后还查 `isNaN`） | `null` | 上限表见 §三 `B3={daily:31,weekly:52,monthly:12,yearly:10}` |
| `startDate` | 日期（`cMe` 校验） | — | |
| `daily` | `{skipWeekends: boolean}` | — | |
| `weekly` | `{days: string[]}` | — | **星期名数组**，代码用 `{sunday:0,…,saturday:6}` 查表转数字 |
| `monthly` | `{days?: number[], dynamicDays?: Array<{type,selector}>}` | — | |
| `yearly` | 同 `monthly` | — | |
| `reminder` | 提醒对象（`mMe`） | — | |

### 9.2 锚点其实有**两档**（推翻上一轮 G256 的单一口径结论）

- **`type === "flexible"`** ⇒ 标签 ``After {interval} {unit}``（unit 随 interval 单复数变形），`daily` 且 `skipWeekends` 时追加 `` (skip weekends)``。对应 i18n `tasks.after.x.days/weeks/months/years` + `tasks.after.completion`「完成后」+ **`tasks.relative.to.completion`「相对于完成」** ⇒ **下一档从完成时刻起算**。
- **`type === "fixed"`** ⇒ 日历锚定标签：`Daily` / `Every N days` / `Weekly on Mondays`（单日加 `"s"`，多日逗号+and 连接）/ `Monthly on the {ordinal} day` / `Yearly …` ⇒ **按原始计划日期推进**，即 `tasks.complete.task.decs` 那句承诺。
- UI 点「相对于完成」时执行 `()=>{s(1), d("flexible"), b(!1)}` ⇒ **副作用是三件事**：`interval` 复位为 1、`type` 设 `"flexible"`、再关掉一个布尔开关（疑为"清除自定义日选择"）。

⇒ 官方是**两档可选**，不是单一口径。本地按完成时刻滚动只等价于 `flexible`，**缺的是 `fixed` 档和切换器本身**。

### 9.3 `dynamicDays` 元素形状与 `monthly.days` 的三档语义

`{type, selector}` 两个正交维度。**解析器 `v1e` 要求两者都 `typeof === "string"`，缺一即整个元素被丢弃** ⇒ 即使是"第 15 天"，`selector` 也以**字符串**存储（本地建模时别用 number）：
- `type === "day"` ⇒ `selector` 是**日号字符串** ⇒ 标签 `` on the {selector} day``；★ **但 `selector` 也可以是 `"last"`**：月Picker 的「最后一天」行写出的是 `{selector:"last", type:"day"}`，循环引擎按 `r.type==="day" && (o.push(r.selector==="last" ? 该月末 : 该日号))` 处理 ⇒ **"day 型"下 `last` 是保留字，不是日号**。
- 否则 ⇒ `type` 是**星期名**、`selector ∈ {"first" | "last" | 数字字符串}` ⇒ 标签 `` on the {type} {selector}``（显示层 `case "last"/"first"` 走 i18n，`default` 走数字）。

`monthly.days`：**`length === 0` 的语义是「on the last day」（最后一天），不是"未选择"**；`length === 1` ⇒ 该日号序数；`length > 1` ⇒ 用 `" and "` 连接。⇒ 复刻时若把空数组当"无配置"就会漏掉官方默认档。

## 十、重复选择器的真实结构（`TasksRepeatConfigBasePicker`，组件 `ejn`，2026-09-27 反编译结案 ✓）

埋点名从 `$i("TasksRepeatConfigBasePicker", …)` 直接读到，**是官方自己的组件名**，可当验收对照物。

### 10.1 六个 setter + 一个类型切换器（props 全集）

`setTaskRepeatFrequency` / `setTaskRepeatInterval` / `setTaskRepeatDailyConfig` / `setTaskRepeatWeeklyConfig` / `setTaskRepeatMonthlyConfig` / `setTaskRepeatYearlyConfig` / **`setRepeatType`** / `onClose`
⇒ **`type` 有独立 setter**，与频率、间隔平级 —— 本地若把"相对于完成"做成频率的子选项就错位了。

### 10.2 两个"默认值"在不同层，别混

| 场景 | 值 | 出处 |
|---|---|---|
| **解析旧数据时缺省** | `type = "flexible"` | `dMe()` 里 `typeof e.type=="string" ? e.type : "flexible"` |
| **用户打开「重复…」时的初始配置** | `{type:"fixed", frequency:"daily", interval:1, startDate:new Date, daily:{skipWeekends:false}, reminder:b9e(…)}` | 工厂函数 `B_n` |

⇒ 官方语义：**老数据没写 type 就当 flexible（保守：不凭空造日历锚点）**；**新配置默认给 fixed + 每天**（用户主动开循环，多半要的是"每天重复"而不是"N 天后再来"）。这两条要分别复刻，是最容易只实现一半的地方。

### 10.3 菜单 id 图（从组件内 `id:"…"` 序列直读）

```
repeatFrequencies            ← 顶层二选一：after(=flexible) / every(=fixed)
  ├─ flexible                ← 「相对于完成」条目（i18n tasks.relative.to.completion）
  └─ frequency → daily | weekly | monthly | yearly
repeatIntervals              ← Array.from({length: B3[frequency]})，即 31/52/12/10
daily-weekend-items → on-weekends | skip-weekends
```
顶层标签用 `after`「后」与 `every`「每」两个短词，子层用 `week`/`month`/`year`/`day` 与 `daily`/`weekly`/`monthly.capitalized`/`yearly.uppercase`（**注意后两个带 `.capitalized` / `.uppercase` 后缀 ⇒ 同一概念按位置有不同大小写形态的键**，本地 i18n 若只做一个键会在英文下出现大小写不一致）。

### 10.4 周末处理是**两条互斥菜单项**，不是开关

`{id:"on-weekends", text:"tasks.also.on.weekends", rightContent: 勾选态(!skipWeekends), onClick: ()=>{setDaily({skipWeekends:false}); v(false)}}`
`{id:"skip-weekends", text:"tasks.skip.weekends", rightContent: 勾选态(skipWeekends), onClick: ()=>{setDaily({skipWeekends:true}); v(false)}}`
⇒ 两条都带 `rightContent` 勾选标记（互斥单选视觉），且**两条的 onClick 都额外调 `v(false)`**（收起当前子层）⇒ 选完即回退一层，不是留在原地等用户自己关。

### 10.5 间隔选择的回退规则

`T = (选中的值 An) => { const ft = interval ?? 1; const At = ft > An ? 1 : … }`
⇒ **往小选（新的 `An` 小于当前 `ft`）时把 interval 重置为 1**，而不是保留旧值。这是"换频率后间隔要归 1"的同类保护，本地实现容易漏。

### 10.6 循环配置里内嵌的 reminder 形状

`mMe()` ⇒ `reminder: {enabled: boolean, dateOffset: int|null}`，**`enabled` 不是 boolean 时整个 reminder 变 `undefined`**（不是"默认关闭"）。

★ **本条第二句已被 §10.8 推翻**：`dateOffset` 不是"距事件 X 单位的偏移量"，而是**当日时刻（距 00:00 的分钟数）**。

### 10.8 提醒时刻菜单的真实形状（组件 `U_n`，2026-09-27 09:44 静态结案 ⇒ **动态项 #2/#4 就地结案**）

`U_n({reminder, setTaskRepeatReminder, isReminderMenuOpen, setIsReminderMenuOpen})`：

```
Ov = 15                                            // 网格步长：15 分钟
h  = Math.floor(1440 / Ov) = 96                    // 菜单项数：00:00 … 23:45
项 = Array.from({length:h}, (_,b) => b*Ov)         // 值就是"当日分钟数"
标签 = dO(y, locale)   // dO(t) = { setHours(floor(t/60)); setMinutes(t%60) } 按 hour/minute 2-digit 格式化
样式 = fontVariant:"tabular-nums"                  // 等宽数字，防抖动
容器 = {minWidth: 236, maxHeight: 200, placement:"bottom-start"}   // ⇒ 菜单内滚动，不是 96 行全展开
写入 = u(v) => setTaskRepeatReminder({enabled: v!=null, dateOffset: v ?? void 0})
清提醒 = 首行 {id:"no-reminder", text:"reminders.no.reminder"}      // ★ 仅当"当前已有提醒"时才插入这一行
默认高亮/滚动定位 = r!=null ? r : floor((getHours()*60+getMinutes())/15)*15
```

⇒ **四条硬事实**：
1. `dateOffset` ∈ **{0,15,30,…,1425} ∪ {null}**，语义是**当天几点几分**（不是提前量）。显示层与滚动定位两处独立佐证（`dO` 按小时/分钟格式化；打开时滚到"现在"所在格子）。
2. **步长 15 分钟、全天 96 档**，且 1440 除 15 是 `Math.floor` ⇒ 官方假设一天=1440 分钟（不做 DST 变长日的特殊处理）。
3. **「不提醒」这一项是条件渲染的**：当前没提醒时菜单里**没有**"不提醒"行 ⇒ 用户无法在一个未设提醒的任务上"再选一次不提醒"。这种"清单项只在有值时出现"的模式在设置面也出现过，是官方的通用约定。
4. **值 = `null` 与"字段缺失"是两态**：`u(null)` 写出 `{enabled:false, dateOffset:undefined}`，而 `mMe` 对缺失 `enabled` 直接返回 `undefined` ⇒ 读取侧要区分"关掉了"与"从来没配过"。

★ **顺带修正 V38 的一条推断**：动态采到的"提醒时间默认 `17:00`"**不是常量**，而是**观测时刻落在 15 分钟网格上的结果**（观测时约 17:0x）。⇒ 本地复刻时**不要写死 17:00**，默认值应是"当前时间向下取整到 15 分钟"。留一次动态复验：**在非整刻时间（如 xx:07）打开提醒，看默认高亮是否跟着时钟走**（成本 1 个弹层配方）。

⇒ 与 §10.6 的层级关系澄清：`U_n` 是**重复配置弹层里**的提醒行（setter 名 `setTaskRepeatReminder`），V38 采到的是**日期弹层里**的"提醒我…"时刻态；两处 UI 不同、**数据结构同一**（`{enabled, dateOffset}`）。官方另有 `reminders.no.reminder` 等 `reminders.*` 键（见 `feature-catalog.md`）。

### 10.9 `repeat` **没有"截止日"字段**（负证据，2026-09-27 09:53）

在 index bundle 里按**引号字面量**统计：`"until"`、`"endDate"`、`"repeatEnd"`、`"recurrenceEnd"`、`"untilDate"` 各 **0 次**；`dMe`（读）与 `e2e`（写）两个 `repeat` 序列化器也**不读任何 end 类键**（`e2e` 只改 `startDate`）。
⇒ **官方 web 端的重复配置是"无限循环"**，没有"重复到某天为止"这一档。
★ 别和**日历轴**的 `endDate` 混：`space_list-calendar` 确实有 `startDate`/`endDate` 参数（`api-contract.md` §二），但那是**查询窗口**，不是任务的重复规则。
⇒ 本地 `Task.recurrenceEnd` 列与 `RecurrenceRule.until` 是**官方没有的概念** ⇒ 记为**有意偏差候选（G407）**：保留，但在文档里标明来源是本地设计选择，避免下个会话当"对齐缺陷"删掉。
⇒ 仍未证：官方移动端/App 端是否有截止日（本次只采 web bundle）；AI/MCP 写入路径是否会设结束条件（`assistant.md` 的工具面里没有 repeat 相关参数）。

### 10.7 星期名与复数键

`Mwe = (d) => ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"][d.getDay()]`；标签层把星期名映射到**复数形式的 i18n 键**（`mondays`、`tuesdays`…），单日时英文靠代码补 `"s"`（`` `${u} on ${m}${locale.startsWith("en")?"s":""}` ``）⇒ **英文复数是代码拼的、不是文案键**，中文不受影响，但本地若照抄键名会缺 `s` 分支。

## 十一、自然语言日期解析链（2026-09-27 静态结案，`js/DateExpressionParser-*.js` 1.2 KB + `js/index-*.js` 四处调用点）

第 2 批（任务三套时间语义）原本要动态点的"输入规则"，大半在这条链里，且**零浏览器预算**：

### 11.1 解析器是 chrono-node，按 App 语言选 locale，且**异步**

`DateExpressionParser` chunk 全文只有 1237 字节，导出一个 `parseDate(str, forceGB=false)`：

- 内建 **7 个 locale 解析器**：`{en, de, es, fr, ja, "zh-Hans": chrono.zh.hans, "zh-Hant": chrono.zh.hant}`；
- 取 `i.language`（App 语言）决定用哪个 ⇒ **中文界面下"下周三"走中文解析器**，不是英文；
- 语言是 `en` 且 `forceGB===true` ⇒ 改走 `chrono.en.GB.parseDate`（**英式 DD/MM 优先**，否则美式 MM/DD）；
- 整段包 `try{…}catch{ return null }` ⇒ **解析失败返回 null，不抛错**。

调用侧不是直接 import，而是**懒加载包装**：`async function Gw(t, e=false){ return (await hit()).parseDate(t,e) }`，`hit()` 用 promise 缓存只做一次动态 `import("./DateExpressionParser-…")`。⇒ **首次输入日期表达式时要等 chunk 下载**，第二次起才有即时反馈。本地若同步实现，行为差异会体现在"第一次比后续慢"这个官方真实手感上。

### 11.2 两档解析：先严格格式（同步）、再自然语言（异步）

调用点固定形态：`EC(input, gbFlag) ? strictParse(input, gbFlag) : await Gw(input, gbFlag)`

- `EC(t,e=false)` = `typeof t!=="string" ? false : !Number.isNaN(wU(t,e).getTime())` ⇒ **"这串能不能被严格格式解析"**；
- `wU` 侧的证据：`Vce(year, month, day)` 是**闰年日期校验**（`%4&&!%100 || %400` ⇒ 2 月只允许到 29/28），`YRe = (t,e) => isMatch(t) ? q1(new Date(t.replace(/\./g,"/")), e) : null` ⇒ **点分隔被改写成斜杠分隔**（`2026.09.27` → `2026/09/27`）后才交给 `Date`。
- 结论：**"支持哪些写法"不是单一 NLP 黑名单，而是"严格格式 ∪ chrono 自然语言"两层**，两层对同一个 `forceGB` 参数都敏感。

### 11.3 落地守卫：只有"未来或今天"才自动写回（除非特性开关放开）

任务属性编辑处的真实分支（`js/index` @5413980 附近）：

```
const gb = j_n(), strict = EC(h, gb) ? wU(h, gb) : null;
const ok = fn.isEnabled(SFLAG) || parsed.getTime() > Date.now() || isSameDay(parsed, Qo());
if (parsed && !alreadySame && ok) setProperty(parsed);
```

- `Qo = () => Pr(new Date)` = **今天零点**；配套 `T5`=明天、`bw`=昨天（`B1(Qo(), ±1)`）。
- ⇒ **过去的日期不会被自动采纳**，除非该 App 是"回显今天"（同一天）或特性开关打开。这一条解释了"输入上周五没反应"这类手感，**不是 bug 是守卫**。
- 采纳前先 `vi(当前值, 新值)` 比较，相同就跳过 ⇒ **不产生多余的脏态/撤销步**。
- 清空文本框会显式 `f(null)` ⇒ **清空 = 清除该时间属性**，而不是"保持原值"。
- 另有 `q.setHours(0,0,0,0)` 的写法 ⇒ **写回统一归一到本地零点**（日期型，不带时刻）。

### 11.4 快捷菜单里 schedule 与 deadline 是**两个独立候选项**（★ 本批最重要的交互结论）

两个几乎重复的构造函数（分属两处 UI，回调派发器不同：`_y()` 与 `jy()`）：

| | schedule 项 | deadline 项 |
|---|---|---|
| id | `` `schedule_${date}` `` | `` `deadline_${date}` `` |
| analyticsId | `` `task_schedule_date_${date.getTime()}` `` | `` `task_deadline_date_${date.getTime()}` `` |
| 标签来源 | i18n 键 `commands.task.schedule.x`，`{0}`=格式化日期，**英文兜底 `` `Schedule for ${o}` ``** | **硬编码英文 `` `Set Deadline to ${…}` ``，没有 i18n 键** |
| icon | `Ss`（日历类） | `wr`（截止类） |
| tags | `[rawInput]`（把用户原话带进埋点） | `[rawInput]` |
| callback | `n([ids], date)` / `n(i.map(r=>r.id), date)` | `_y(s,i,date)` / `jy(s,i,date)` |

⇒ **交互事实**：在任务里打出日期表达式后，菜单同时给"安排到 X"和"设置截止日期为 X"两项，用户必须显式二选一 —— 这正是 §一–§三 三套时间语义（deadline / schedule / reminder）在输入层的落点。**reminder 在这一对里没有出现**，说明提醒不走这条快捷链（与 §八 的 7 个提醒动词单独成组一致）。

★ **`Set Deadline to …` 未本地化**是官方缺陷（同一屏 `commands.task.schedule.x` 却走了键），归入 `dialogs.md` §8.1 的"官方自相矛盾"类 ⇒ 本地若把它做成中文，属**有意偏差**，不要当作对齐官方。

日期显示串来自 `q1(date, {t:_e, locale}).mergedString` —— **`mergedString` 是"合并后的本地化日期串"**，即格式化也走 i18n 的 t 函数，不是 `Intl` 裸调。

### 11.5 顺带掉出的快捷输入规则：`NxM` 直接生表格

同一族候选项生成器里有 `Rrn/`…`= /^(?<rows>\d+)x?(?<cols>\d*)$/i`：

- `cols` 省略时**默认等于 rows**（`s===""||s==null ? i : parseInt(s)`）；
- 抑制条件 `i<=9 && i===l || i===0 || l===0 ⇒ []` ⇒ **≤9 的正方形（如 `4x4`）不弹提示**，两个构造器 `H3(i,l)` / `Z3(i,l)` 分别产两种块（推测为普通表 vs 集合/看板式）；
- 大小写不敏感（`/i`）。⇒ 在快捷面板输入 `12x3` 会得到表格候选，这是一条**只有代码里有的功能**，菜单与文档都不显示。

## 仍未采到

- ~~`weekly`/`monthly` 配置的完整字段（`setTaskRepeatWeeklyConfig`、`dynamicDays` 的元素类型只从用法反推）~~ **已结案（§九）**：`weekly.days: string[]`（星期名）、`monthly.{days: number[], dynamicDays: [{type, selector}]}`、`selector ∈ {"first","last",数字}`、**`monthly.days === []` 的语义是「最后一天」而非"未选"**。
- ~~`repeatPresets` 的**具体预设项**（预设列表在别的 memo 分支里，未定位到数组字面量）~~ **改判（§九）**：预设项**不是代码里的数组字面量**，而是 §八 那组 `tasks.every.*` 文案 + `ann()` 的 `fixed` 分支**动态拼出来的**（`Daily` / `Every N days` / `Weekly on Mondays` / `Monthly on the {序数} day` / `Yearly …` + 工作日档 `tasks.monday.to.friday`）。⇒ 之前"找预设数组"是错方向，**要复现的是标签器**。真身已定位，见 **§10.3 菜单 id 图**：顶层就是 `after` / `every` 二选一（即 `type` 两档），下面才是 `frequency → interval → 子配置`。
- 提醒到点后的**推送通路**（`ws-noti` 端点已知，payload 结构未追）。
- `my`（daily 跳过周末的最大尝试次数）的具体数值 —— 变量在闭包内，未取到字面量。
- ~~logbook 子页与"回收站/归档"的关系~~ **部分结案**：`tasks.logbook`「日志」+ `tasks.logbook.placeholder`「已完成的任务将显示在这里」⇒ logbook 是**已完成任务的归档流**，与"最近删除"（文档软删）不同层；`isArchived` 与 logbook 是否同一存储仍未证。
- 任务"分配人 + 日程 + 截止 + 提醒"四者同时存在时的通知去重规则。
- **§八 全部命令的用户可见形态仍未实测**（第 2 批已获授权但**连接器在 04:46 挂死**）：三族菜单项在任务块上的实际排布、快捷档点完写进哪个字段、`repeatPresets` 预设项列表、三层导航弹层的前进后退、以及"完成剩余/取消剩余"的入口位置。
- ~~**`tasks.complete.task.decs` 的承诺是否真兑现**~~ **静态结案（§九）**：官方**两档并存**（`type: "flexible"` 按完成时刻 / `"fixed"` 按原始计划日），`tasks.complete.task.decs` 那句只描述 `fixed` 档 ⇒ 不存在"单一承诺"，**要验的是切换器 UI 与两档各自的推进结果**。G256 已按此改写。
- 提醒能否真的挂到**非任务块**（§八 由文案与代码分支推断为能，动线未走通）。
- **开放残留**：沙盒文档 `QODER-HARVEST-20260927-tasks` 已创建但内容状态未知（`cua.type` 超时），见 `_harvest/manifest.jsonl` 最后两条；下周期第一件事是复核并纳入 LIFO 删除。
