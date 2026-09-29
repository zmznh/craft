# Craft.do 数据契约与同步状态机（从客户端 schema 源码解码）

来源：`_harvest/js/socket.worker-CMvBLZvP.js`（同步 worker，含未压缩的枚举名）与 `index-DiTmKH3z.js`。提取法：正则匹配 TS `enum` 编译产物 `(e=>(e.X="…",e))(…)` 与 `KNOWN_KEYS` 常量对象。

**边界说明**：这里全部是**客户端源码里的常量与校验函数**，不是抓包结果（CDP `Network` body 在本通路恒被封）。因此"线上协议"一列是推断，标 `~`；枚举值本身是字面证据，标 `✓`（源码原文）。

## 一、合集列类型权威枚举（13 项，结案 model.md 未采清单第 4 条）

`DatabaseSchemaPropertyType`（在 index 里被压成 `le`，在 worker 里保留原名，两侧值完全一致）：

| # | 成员 | 线值 | 值的运行时类型（来自 `DMe`/`_Me` 校验分支，`~`） |
|---|---|---|---|
| 1 | TEXT | `text` | string |
| 2 | NUMBER | `number` | number |
| 3 | CHECKBOX | `checkbox` | boolean |
| 4 | DATE | `date` | **`instanceof Date`**（不是字符串！序列化层要显式转换） |
| 5 | URL | `url` | string |
| 6 | PERSON | `person` | object |
| 7 | SELECT | `select` | string，且必须 ∈ `config.options[].value` |
| 8 | MULTISELECT | `multiSelect` | **数组**，每项都是合法 option value |
| 9 | MEDIA | `media` | object |
| 10 | RELATION | `relation` | object |
| 11 | BLOCKLINK | `linkToBlock` | object |
| 12 | EMAIL | `email` | string |
| 13 | PHONE | `phone` | string |

校验器原文形态（说明**逐类型分派 + default 返回 false**，未知类型即非法）：
```
case "select": 值须为 string 且落在 config.options 的 value 集合内
case "date":   o instanceof Date
case "multiSelect": Array.isArray(o) && 每项 ∈ options
default: return false
```

注意 **`multiSelect` 是唯一 camelCase 线值**，其余全小写 ⇒ 本地 schema 若统一 snake_case 会与官方导出/导入对不上（`relation` 同理保持小写）。

另有 `collections.unsupported.property.type`「不支持的属性类型」⇒ 遇到未知线值有显式降级路径。

## 二、视图持久化字段全集（`STORED_VIEW_KNOWN_KEYS`，20 项）

```
id, name, type,
filters, sortBy, groupBy,
hiddenProperties, customPropertyOrder, columnWidth,
calculations, isCalculationsRowVisible,
galleryCardSize, galleryPreviewType, galleryShowsAllFields, visibleGalleryFields,
tableConfig, galleryConfig,
kanbanConfig, kanbanHiddenGroupValues, kanbanColumnOrder
```

这 20 个键就是官方"视图配置"的完整 schema，也是本地 `TableView` 持久化应对齐的目标。分三组读：

| 组 | 键 | 含义 |
|---|---|---|
| 通用 | `id name type` | 视图身份与类型（table / gallery / kanban，见 `collections.new.{table,gallery,kanban}`；`views.turn.into` 支持互转） |
| 数据整形 | `filters sortBy groupBy hiddenProperties customPropertyOrder` | 筛选 / 排序 / 分组 / 隐藏字段 / **字段自定义顺序**（与 hiddenProperties 分开存 ⇒ "隐藏"和"排序"是两件事） |
| 表格 | `columnWidth calculations isCalculationsRowVisible tableConfig` | 列宽独立存；计算行有"内容"和"是否显示"两个字段 |
| 画廊 | `galleryCardSize galleryPreviewType galleryShowsAllFields visibleGalleryFields` | 卡片大小（小/大）、预览类型、是否始终显示所有启用字段、显式字段列表 |
| 看板 | `kanbanConfig kanbanHiddenGroupValues kanbanColumnOrder` | **分组的隐藏态与列顺序各自单独持久化**（`kanban.show_hide_groups`） |

⇒ 本地 `view.config` 目前只存 filters/sorts/groupBy（见项目进度记忆），其余 15 项要么没有要么混在一个对象里；`customPropertyOrder` 与 `hiddenProperties` 合并存是常见实现捷径，但会让"显示/隐藏字段"与"列宽/列序"互相覆盖。

**视图类型另有第四个"对象"入口**（`collections.new.object` / `object.type` / `type.to.search.for.object`），从字面看是 relation 字段的对象选择器而非视图类型；`?` 待定。

## 三、同步状态机（`SyncStatus` 11 态 + `TaskType` 5 类 + `DocumentLoadStatus` 4 态）

```
SyncStatus:        connected  synced  pendingSync  syncing  error  disconnected
                   connecting  disconnect_issued  creating_worker  worker_ready  terminated
TaskType:          connect  refresh  sendSync  empty  syncReceived
SyncClientEvent:   sync  echo
DocumentLoadStatus: notLoaded  loading  loadedFromCache  loadedFromServer
```

读法（`~` 推断，但状态名是源码原文）：
1. **连接子机**：`disconnected → connecting → creating_worker → worker_ready → connected`；主动断开走 `disconnect_issued`，终止态 `terminated`。⇒ **worker 生命周期是显式状态**，本地 Hocuspocus 只有"连上/没连上"。
2. **同步子机**：`connected → pendingSync → syncing → synced`，失败进 `error`。`synced` 与 `connected` **是分开的两个状态** ⇒ UI 上"已连接"不等于"已同步"，这解释了 `dialogs.md` §4 为什么离线文案要区分"已保存到本地但尚未同步"和"离线更改已同步"。
3. **`echo` 事件**：客户端-服务端往返心跳（用于测活/RTT）。
4. **`TaskType` 是 worker 的任务队列类型**，其中 `empty` 说明队列有空转态；`refresh` 与 `sendSync` 分开 ⇒ 主动刷新与增量同步两条通路。
5. **`DocumentLoadStatus` 区分 `loadedFromCache` 与 `loadedFromServer`** ⇒ 文档加载来源对用户可感知（配合 `alert.get.back.online.to.view.this.doc`）。本地 tldraw/Yjs 缓存没有来源标记。

## 四、块操作词汇表（`BlocksV2Actions`）

```
INSERT = "i"   DELETE = "d"   MOVE = "m"   NOOP = "n"
```

⇒ 官方块级操作只有这四种，且 **MOVE 是一等公民**（不是 delete+insert 的组合），线值单字母压缩。本地对块重排的持久化走整篇 `content` JSON 覆盖写，没有 move 语义 —— 这与"撤销粒度"直接相关（`todo-actions.md` 的沙盒批次 1 待验项）。

## 五、样式相关枚举（可直接对齐 PageStyle 面板）

```
PageBackgroundSize:              full | faded | unknown
GradientPageBackgroundDirection: topToBottom | leftToRight | radial
```

⇒ 背景图两档尺寸（完整/淡化）+ 渐变三方向，线值即官方值；`unknown` 是向后兼容占位。此前 `panels.md` 里"背景尺寸/渐变方向"的档位靠截图目视，此处结案。

## 六、与本地实现的差距（已逐项核对源码）

本地列类型定义在 `src/components/collection/AddPropertyMenu.tsx:19-33`，共 13 项：`text number select multi_select date checkbox url email file relation formula created_at updated_at`。

| 维度 | 官方（`DatabaseSchemaPropertyType`） | 本地（实测） | 判定 |
|---|---|---|---|
| 多选线值 | `multiSelect`（**唯一 camelCase**） | `multi_select` | **命名不一致**，导入导出/复制粘贴会对不上 |
| 文件类 | `media` | `file` | 命名不一致 |
| 缺 4 类 | `person` `phone` `linkToBlock`（+ `media` 语义更广） | 无 | 缺失 |
| 多 3 类 | 属性枚举里**没有** `formula` / `created_at` / `updated_at` | 有 | **有意偏差候选**：官方把公式放在"计算行/聚合"层（`collections.{sum,average,min,max,median,range,count…}` + `calculations` 键），时间戳走 `browse.sort.*` 的创建/更新日期维度，都不是可存储的属性类型。需产品决策：保留（更简单）还是按官方分层。 |
| `date` 运行时类型 | `instanceof Date` | **存字符串**：`PropertyCell.tsx:192` 用 `<input type="date">`，时间戳也是 `createdAt?: string`（`PropertyCell.tsx:24`） | 行为不同（跨端序列化要对齐） |
| 校验器 | 逐类型分派 + `default: false` + 独立文案「不支持的属性类型」 | 无未知类型降级路径 | 缺失 |
| 视图配置 | 20 键分五组（`STORED_VIEW_KNOWN_KEYS`） | **只有 3 键**：`{filters, sorts, groupBy}`（`src/app/(app)/collections/[id]/TableView.tsx:30-46`），且本地键名 `sorts` 对官方 `sortBy` | 缺失 17 键 + 命名不一致 |
| 字段可见性与顺序 | 存在**视图**里（`hiddenProperties` / `customPropertyOrder`）⇒ 每个视图各自一套 | 存在**属性行**上（`p.isVisible` / `a.order`，同文件 46-47 行）⇒ 全合集共用一套 | **结构性差异**：官方"表视图隐藏 A 列、看板仍显示 A 列"是可行的，本地做不到 |
| 同步态 | 11 态，`connected` ≠ `synced`，worker 生命周期显式 | Hocuspocus 事件直连 UI | 行为不同 |
| 块操作 | `insert/delete/**move**/noop` 四类 | 整篇 JSON 覆盖写，无 move | 缺失 |
| 背景/渐变档位 | `full\|faded` / `topToBottom\|leftToRight\|radial` | 见 `panels.md` | 命名未对齐 |

## 七、计算行聚合权威表（`CalculationsRow` chunk 实现级，21 项）

线值是 snake_case，按前缀分四组（`ve()` 就是靠 `startsWith` 归组的）：

| 组 | 可用于 | 成员 |
|---|---|---|
| 基础（**所有列类型**） | 全部 13 类 | `count_all` `count_empty` `count_notEmpty` `count_values` `count_unique` `percent_empty` `percent_notEmpty` |
| `number_` | 仅 `number` | `number_sum` `number_average` `number_median` `number_min` `number_max` `number_range` |
| `date_` | 仅 `date` | `date_min` `date_max` `date_range_days` `date_range_months` |
| `*_checkbox_*` | 仅 `checkbox` | `count_checkbox_checked` `count_checkbox_unchecked` `percent_checkbox_checked` `percent_checkbox_unchecked` |

选择器实现事实：`Le(type) = [...基础] ++ (类型对应追加)` ⇒ **可用聚合是"基础集 + 单一类型专属集"，不存在多选或跨类组合**；菜单按上面四组分组渲染（`ke()`），组标签来自 i18n。

其它实现细节（对本地 `evalFormulas` 直接可用）：
- 每个聚合有**两个标签**：`menuLabel`（菜单里「计算全部」）与 `cellLabel`（单元格里只显示「全部」）⇒ 单元格文案是短形态。
- 空值判定 `z(e)`、唯一计数 `he(e).size`（用 Set）、复选框真值判定 `H(e)`；百分比一律 `(总数 - 空值数) / 总数`，**分母是总行数不是非空行数**；`c===0` 时返回字符串 `"0%"` 而不是 NaN。
- 数字格式化统一走 `Intl.NumberFormat`，`number_average/min/max/median/range` 在**空集时 `return`  undefined（不显示）**，与百分比的 `"0%"` 不同。

⇒ 本地现状只有 SUM/AVG/MIN/MAX/COUNT（见项目进度记忆 2026-09-23 轮），缺 16 项，且没有"按列类型限制可选聚合"这层守卫。

## 八、粘贴/输入到单元格的类型推断与序列化（`index` 实现级）

**字符串 → 列类型推断**（`ZZe`，决定拖入/粘贴时建什么列）：

```
"" → TEXT          可 parse 为数字 → NUMBER
false/true 字面串 → CHECKBOX       URL 形态 → URL
邮箱形态 → EMAIL    日期形态 → DATE     电话形态 → PHONE
其它 → TEXT
```

**单元格文本 → 值**（`le.*` 分支）：
- `SELECT`：`t.split(", ")` ⇒ **多值序列化用 `", "` 连接**（不是 `;`、不是 JSON 数组）；同时从 option 上取 `themeString` 还原颜色。
- `NUMBER`：若目标列格式是 `percent` 且原文不含 `%`，**除以 100** 存内部值 ⇒ 内部存小数、显示乘 100。
- `CHECKBOX`：比对 `trueStrings`/`falseStrings` 白名单（大小写不敏感）。
- `DATE`：`new Date(t)`，`NaN` 则整格为 `undefined`（**不报错、静默丢弃**）。
- 未知类型 `default: return` ⇒ 不写入。

⇒ 与 `alert.cannot.paste.into.selected.field`「请确保复制的值与字段类型兼容」互为表里：兼容判定就是上面这段。

**数字格式（`valueFormat`）**：四种 `plain-text | number | percentage | currency`；`precision` **0–5 六档**（菜单就是 6 个 action），默认 2；币种默认 `"USD"`，用 `Intl.NumberFormat`/currency lib 显式 `decimal:"." thousand:","`。⇒ 与 `dialogs.md` §1 的"10000 字符上限"同属单元格层。

## 九、筛选操作符权威表（19 个线值 + 按列类型的可选集 + 求值语义）

**线值全集**（`Qde()` 操作符 → 文案 / `TKe()` 按类型许可 / `_Ke()` 求值，三处交叉一致）：

| 线值 | 显示 | 求值语义（源码直译） |
|---|---|---|
| `isEmpty` | 为空 | `value == null \|\| value === ""` |
| `isNotEmpty` | 不为空 | `value != null && value !== ""` |
| `equals` | 是 | `zQ(值, 列)` 规范化后相等 |
| `doesNotEqual` | 不是 | 上者取反 |
| `string_contains` | 包含 | 值为空或操作数为空串 ⇒ **返回 false**；否则走 `KQ` 文本匹配 |
| `string_doesNotContain` | 不包含 | `KQ` 取反（同样有"空值即 false"的边界） |
| `select_isAnyOf` | 任何 | 两侧都归一成数组后 `some(includes)`；操作数非数组 ⇒ false |
| `select_isNoneOf` | 无 | **值为 null ⇒ true**；否则 `every(!includes)` |
| `relation_hasAnyOf` | 拥有任一 | 两侧类型必须同为 relation 或同为 person；relation 先比 `objectListId` 再比 `items[].{spaceId,blockId}`；person 比 `items[].userId` |
| `relation_hasAllOf` | 拥有全部 | 同上，量词换 all |
| `relation_hasNoneOf` | 都不含 | 同上，取反 |
| `date_isBefore` / `date_isAfter` | 早于 / 晚于 | 仅当列类型是 `date` 才合法 |
| `number_equal` / `number_notEqual` | `=` / `≠` | 仅 `number` 列 |
| `number_smaller` / `number_smallerOrEqual` | `<` / `≤` | 仅 `number` 列 |
| `number_greater` / `number_greaterOrEqual` | `>` / `≥` | 仅 `number` 列 |

⇒ 数字与日期的操作符显示**不走 i18n**（`=` `<` `≥` 直接是字面量），其余走 `collections.*` 文案；未知操作符进 `default: He(t)`（**开发期断言抛错**）。

**按列类型许可的操作符集（`TKe`，本地必须照抄的守卫表）**：

| 列类型 | 允许的操作符 |
|---|---|
| `checkbox` | **只有 `equals`** |
| `text` `url` `email` `phone` | `string_contains` `string_doesNotContain` `isEmpty` `isNotEmpty` `equals` `doesNotEqual` |
| `media` | `string_contains` `string_doesNotContain` `isEmpty` `isNotEmpty` |
| `number` | `number_equal` `number_notEqual` `number_smaller` `number_smallerOrEqual` `number_greater` `number_greaterOrEqual` `isEmpty` `isNotEmpty` |
| `select` `multiSelect` | `equals` `doesNotEqual` `select_isAnyOf` `select_isNoneOf` `isEmpty` `isNotEmpty` |
| `linkToBlock` | `equals` `doesNotEqual` `select_isAnyOf` `select_isNoneOf` `isEmpty` `isNotEmpty` |
| `relation` `person` | `relation_hasAnyOf` `relation_hasAllOf` `relation_hasNoneOf` `isEmpty` `isNotEmpty` |
| `date` | `equals` `doesNotEqual` `date_isBefore` `date_isAfter` `isEmpty` `isNotEmpty` |
| 其它（`objectList` 等） | 无（`TKe` 无 default 分支 ⇒ undefined） |

**操作数类型规则（`xw`）**：`isEmpty/isNotEmpty` 无操作数；`equals/doesNotEqual` 在 `linkToBlock` 上把操作数列改判为 `select`；`select_isAnyOf/NoneOf` 要求操作数是 `multiSelect`；不匹配则整个筛选无效（返回 null 而不是报错）。另有 `V1e` 做**单值/多值自动降级**：`select` 列上的 `equals` 若拿到数组会先去重再折回单值。

**芯片文案**：筛选 = `"{字段名} {操作符小写} {值}"`（空/非空不带值段）；分组 = `"按 [0] 分组"`；排序 = `"{字段名} ↑|↓"`（`direction` ∈ `asc|desc`）。

**字段显隐合并算法（`W1e`）**：`[OBJECT_TITLE_PROP_ID, ...保留的既有顺序, ...新增]` ⇒ **标题字段永远第一位且不可移**（与 `collections.title.type.cannot.be.changed` 同族的第二条锁死规则）。

**搜索匹配（`KQ`）**：单元格值先 `anyPropToString` 再小写包含匹配；**number 列额外再匹配"按列 schema + 当前语言格式化后的显示串"** ⇒ 官方输入 `1,000` 也能命中值为 1000 的单元格。

**排序实现**：`new Intl.Collator(undefined, {numeric: true, sensitivity: "base"})` ⇒ 数字感知（`item2 < item10`）+ 不区分大小写与重音；空值恒排最前（`null → -1`）。

**视图配置写库函数**（同文件紧邻处）证实 `protocol.md` §二 的 20 键，并补两条实现规则：`tableConfig`/`galleryConfig`/`kanbanConfig` **为空对象时整键不写**（`PR()` 剪枝），`visibleGalleryFields` 与 `galleryShowsAllFields` 联动决定 `hiddenFields` 是否导出。

## 仍未采到

- 每个枚举的**序列化位置**（放在哪个 Yjs shared map / 请求字段里）—— worker 里只读到常量与校验器，未做完整数据流追踪。
- `filters` / `sortBy` / `groupBy` 三个**内层对象**的字段名：`filters` 已结案（§九：`{propId, type, value}`，`type` 是 19 个线值之一）；`sortBy` 项已结案（`{propId?, direction: "asc"|"desc"}`，见 `DKe`/排序实现）；`groupBy` 项已知 `{propId}`（`EKe` 只用到 propId），**二级分组（`collections.add.subgroup`）如何在 `groupBy` 里表达仍未证**。
- 上传/附件、白板、评论的内部枚举（未做定向 hunt）。
- ~~计算/聚合的权威枚举~~ **已结案**：见 §七（21 项 + 按列类型的可选集）。
- 筛选操作符的权威枚举（i18n 侧：`is` / `is.not` / `contains` / `does.not.contain` / `any.of` / `none.of` / `has.all.of` / `is.empty` / `is.not.empty` / `is.after` / `is.before` / `earliest` / `latest` / `unique`，共 14 个人话形态；线值未定位）。
- 分组的**多级**支持：`collections.add.subgroup`「添加子组」证明存在二级分组，但 `groupBy` 是否数组未证。
