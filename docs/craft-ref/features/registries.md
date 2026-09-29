# Craft.do 权威登记表（枚举 / 动作词表 / 通知类型 / 排序作用域）

来源：`_harvest/mine-enums.mjs` 扫全部 105 个 chunk（TS enum 编译产物 + zod enum + 大写键常量映射），加人工定位的分派 switch。机读全量在 `_harvest/enums.tsv`。

实测计数（`grep -v 'vendor-' enums2.tsv | cut -f4 | sort | uniq -c`）：**共 113 个枚举**，其中**应用侧 88 个** = `index` 65 + `socket.worker` 18 + `AIChatPopup` 3 + `PageCardMixer` 1 + `CodeEditorWrapper` 1；第三方 25 个（`vendor-excalidraw` / `vendor-BZCR0rqu` 等，已从本表排除）。机读全量：`_harvest/enums2.tsv`（列：kind / name / count / file / members=values）。
> 本文件 §一 的表是**修复大小写缺陷前**的 34 个高价值枚举（仍准确，只是不完整）；§二 是修复后新增的内容模型枚举。

工具本身的两个坑（已修）：成员扫描必须**用 IIFE 终止符 `))(` 截断**，否则会串到下一个枚举；起点要含首个成员，否则每个枚举少一项。

## 一、枚举登记表（app 侧，按值数降序）

| 枚举 | n | 域 | 值 |
|---|---|---|---|
| `nt` | 21 | **代码块主题** | `auto craftdark craftlight atomone aura bbedit daracula dracula githubdark githublight gruvboxdark gruvboxlight materialdark materiallight noctislilac nord sublime tokyonightday tokyonightstorm tokyonight vscodedark` |
| `le` | 13 | 合集列类型（权威，见 `protocol.md` §一） | `text number checkbox date url person select multiSelect media relation linkToBlock email phone` |
| `Us` | 13 | **认证/邮箱验证错误码** | `BLOCKED_REG INVALID_CODE EXPIRED EMAIL_LOCKED TOO_MANY_ATTEMPTS ALREADY_VERIFIED NEW_EMAIL_USED_BY_OTHER_ACCOUNT SSO_LOGIN_ENFORCED SSO_NOT_SUPPORTED INVALID_PARAMS AUTH_TOKEN_MISSING EXTENSION_NOT_INSTALLED UNKNOWN` |
| `oi` | 12 | 订阅/结算错误码 | `UNKNOWN ADMIN_ACCESS_REQUIRED PADDLE_SUBSCRIPTION_RESERVED CHECKOUT_NOT_FOUND CHECKOUT_EMAIL_MISMATCH TEAM_ALREADY_SUBSCRIBED INVALID_CHECKOUT_ID INTERNAL_SERVER_ERROR NO_ACTIVE_SUBSCRIPTION INVALID_RETURN_URL NOT_ELIGIBLE_FOR_DISCOUNT AUTHENTICATION_ERROR` |
| `uo` | 11 | 团队/席位错误码 | `UNKNOWN AUTHENTICATION_ERROR ADMIN_ACCESS_REQUIRED NO_SUBSCRIPTION_FOR_TEAM INVALID_SUBSCRIPTION LESS_SEATS_THAN_MEMBERS CANNOT_CHARGE UNSUPPORTED_MIGRATION INTERNAL_SERVER_ERROR TIER_LIMIT PAUSED_SUBSCRIPTION` |
| `os` | 11 | 同步状态（与 worker `SyncStatus` 同值，见 `protocol.md` §三） | `connected synced pendingSync syncing error disconnected connecting disconnect_issued creating_worker worker_ready terminated` |
| `ie` | 9 | **订阅档位全集（权威）** | `Free Pro Business V2_Free V2_Plus V2_Family V2_Team V2_Business Lite` |
| `u2` | 8 | 团队开通错误码 | `UNKNOWN INTERNAL_SERVER_ERROR ADMIN_ACCESS_REQUIRED TRIAL_ALREADY_USED TEAM_ALREADY_SUBSCRIBED NO_SUBSCRIPTION_FOR_TEAM TEAM_NOT_PRIVATE DEFAULT_TEAM_NOT_FOUND` |
| `Fs` | 7 | 同步状态（**另一套**，粒度更粗） | `initial synced syncing error unknown connected terminated` |
| `vc` | 7 | 自定义域名错误码 | `UNKNOWN ADMIN_ACCESS_REQUIRED NO_CUSTOM_DOMAIN INVALID_HOSTNAME HOSTNAME_ALREADY_USED INVALID_PREFIX PREFIX_ALREADY_USED` |
| `za` | 7 | 席位变更错误码 | `UNKNOWN UNSUPPORTED_SUBSCRIPTION LESS_SEATS_THAN_ALLOCATED CANNOT_CHARGE LESS_SEATS_THAN_BASE_COUNT NO_ACTIVE_SUBSCRIPTION TRIAL_SEAT_PERIOD_EXPIRED` |
| `yso` | 7 | **分享路径错误码** | `UnknownError AccessDeniedError Path segmenet too short（官方拼写错误） Path already used PASSWORD_PROTECTION_IS_ENABLED CRAFT_DOMAIN_IS_REQUIRED EMAIL_BASED_PROTECTION_IS_ENABLED` |
| `X3` | 6 | 空间/团队创建错误码 | `UNKNOWN BAD_REQUEST TOO_MANY_SPACES NO_ACTIVE_TEAM_SUBSCRIPTION AUTHENTICATION_ERROR ACCESS_DENIED` |
| `Fo` | 6 | 访客/权限错误码 | `AUTHENTICATION_ERROR ACCESS_DENIED INVALID_PARAMETERS UNKNOWN INTERNAL_SERVER_ERROR NOT_A_GUEST` |
| `Dh`(zod) | 5 | **日历分节类型** | `ongoing day remainingDaysInMonth month later` |
| `Rft` | 5 | 许可证错误码 | `UNKNOWN SUBSCRIPTION_ALREADY_ASSIGNED ACCOUNT_ALREADY_SUBSCRIBED SUBSCRIPTION_EXPIRED SUBSCRIPTION_NOT_FOUND` |
| `listType`(zod) | 4 | **任务列表视图（权威）** | `inbox today upcoming all` |
| `m7` | 4 | 文档加载状态（=`DocumentLoadStatus`） | `notLoaded loading loadedFromCache loadedFromServer` |
| `UO` | 4 | 分享访问错误码 | `UnknownError AccessDeniedError SubscriptionLimitReached SubscriptionDocumentLimitReached` |
| `W8` | 4 | 通用 API 错误码 | `UNKNOWN BAD_REQUEST INTERNAL_SERVER_ERROR AUTHENTICATION_ERROR` |
| `sortBy`(zod) | 3 | AI 检索排序 | `relevance dateCreated dateModified` |
| `ys` / `xu` | 3 | 页面背景尺寸（两份同值） | `full faded unknown` |
| `Zs` | 3 | 渐变方向 | `topToBottom leftToRight radial` |
| `bg` | 3 | **文本装饰** | `strikethrough faded none` |
| `ox` | 3 | 文档访问错误码 | `UnknownError AccessDeniedError NotFoundError` |

**更正**：上一版写"块类型、分享档位、视图类型未命中枚举"是**错的** —— 抽取器的成员正则会漏掉 PascalCase/camelCase 形态（`t.BlockTask="TASK"`、`t.PageRegular="pageRegular"`），而官方内容模型枚举正是这种形态。修好正则后重扫，57 → **113 个枚举**（应用侧 34 → **88 个**）。内容模型枚举全集见下面 §二。

## 二、内容模型枚举全集（权威，`✓` = 源码字面量）

### 块与样式

| 枚举 | n | 值 |
|---|---|---|
| **`BlockType`** | 13 | `text image video url file drawing code line pageSeparator table recordObject objectList whiteboard`（线值：`object` / `objectList`） |
| **`TextStyle`**（= `at`） | 9 | `pageRegular title subtitle heading strong body caption note pageCard` |
| **`ListStyle`**（= `Nt`） | 5 | `none bullet numbered todo toggle` |
| **`LineType`**（分隔线，= `$t`） | 6 | `none extraLight light regular strong pageSeparator` ⇒ **可见档位是 4 档**（extraLight/light/regular/strong），另有 none 与 pageSeparator 两个语义档 |
| 装饰线/下划线（`x1e`） | 4 | `none single double strong` |
| 样式作用属性（`f1e`） | 22 | `styleId saturation backgroundColor backdrop secondaryColor textColor textAlpha textAlignemt（官方拼错） fontName …` ⇒ 样式系统能改的**全部轴** |
| 卡片封面/样式（`Zy`） | 7 | `default icon sticky booklet collage emojiCloud none` |
| 卡片版式（`CardPluginDataType` = `Xa`） | 5 | `card.large card.wide card.small.right card.subtle card.small.small.right` |
| 页面背景类型（`F8`） | 4 | `none solid gradient image` |
| 官方渐变预设（`dm`） | 3 | `default BlueToPurple YellowToBlue` ⇒ **官方只有两个具名渐变预设** |
| 图片适配（`pd`） | 3 | `scaleAspectFill scaleAspectFit center` |
| 字体族（`FontFamilyId` = `Jt`） | 4 | `system system-serif system-mono system-rounded`（另一枚举 `h5`：`regular serif rounded mono`） ⇒ **官方字体只有 4 个系统族，不含任何品牌字体名** |
| 主题（`io`） | 3 | `automatic light dark` |
| 导出用块类型（`m4e`） | 9 | `title subtitle heading unorderedList orderedList listItem todo toggle focus` ⇒ markdown 导出层把 `focus` 当一等块类型 |
| Badge 名（`bi`） | 8 | `BadgePageTitle BadgeTitle BadgeSubtitle BadgeHeading BadgeStrong BadgeBody BadgeCaption BadgeComment` |

### 面板与视图（直接对账本地右侧面板）

| 枚举 | n | 值 |
|---|---|---|
| **`SideMenuPage`**（右侧面板 tab，= `Cs`） | 6 | `Insert Style PageStyle Actions Info Comments` ⇒ **官方右栏是 6 个 tab**，本地现在是 4 个（插入/格式/样式/信息）——`Actions` 与 `Comments` 是独立 tab |
| **`LeftSidebarTab`**（左侧栏工具 tab，= `C0`） | 4 | `Attachments FindReplace(TableOfContents Tasks` ⇒ **查找替换、目录、附件、任务在左栏各占一个 tab**（不是弹层），这解释了 `TOGGLE_KEY_SHORTCUTS` 与 `FIND_IN_PAGE` 的落点 |
| **`Gs`/`wl`**（集合视图类型） | 3 | `table gallery kanban`（另有 `objectList` 块类型；`collections.new.object` 是 relation 选择器不是视图） |
| 浏览布局（`Kn`） | 3 | `list cards waterfall` |
| 统计作用域（`id`） | 3 | `fullDocument thisPage selection`（线值 PascalCase）⇒ 结案 `longtail.md` §3 的三档 |
| 浏览排序选项（`us` / `Ns` / `wi` / `Bs`） | 6/4/4/6 | `Name Updated Created LastViewed Kind Manual`、`Name Shared SharedBy LastViewed`、`Relevance Title Modified LastViewed Created Updated` ⇒ 四处不同排序集（列表/侧栏/共享/搜索） |
| 按钮外观（`Ut`） | 19 | `Filled FilledStrong FilledStrongBrand FilledStrongBrandBlack FilledAccentLight FilledWeak FilledDanger… ` ⇒ 官方组件库的 variant 名单，本地 Base UI 对齐目标 |
| 外观档位（`Zo` / `Jj` / `xd` / `Md` / `vSe` / `qu` / `Wu`） | 3–7 | `Default/Filled/Active/Danger/DangerSubtle/Accent/AccentIcon`、`Filled/FilledOutlined/Plain`、`Default/Grey/Warning/Danger`、`Primary/Accent/Danger/Secondary`、`Default/Active/DefaultExpanded`、`Medium/ExtraSmall/MediumSmall`、`Small/Regular/Large` |
| 日期编辑器形态（`I7`） | 3 | `default split picker` |
| 上传载荷类型（`Ffe`） | 5 | `Image Video Markdown CSV Blob` |

### 分享与拖拽（原计划动态采集，静态即结案）

| 枚举 | n | 值 | 意义 |
|---|---|---|---|
| **`r4`**（分享访问档） | 3 | `AnyoneWithLinkCanView AnyoneWithLinkCanEdit Restricted` | **官方分享只有三档**，`Restricted` = 仅受邀成员。本地 `DocumentShare` 缺 view/edit 两档（P0 的 G04）目标值由此确定，不用再猜 |
| **`xr`**（拖拽落点类型） | 5 | `blocks tableColumn tableRow newBlock importBlocks` | **落点只有 5 类**：块之间、表格列、表格行、新建块、导入块 ⇒ `keyboard.md`/`dialogs.md` 里"视图带筛选/排序/分组时禁拖"是这五类之上的守卫 |
| **`qD`**（拖拽落库行为） | 3 | `BlockTask=TASK UpdateOnDrop=UPDATE_ON_DROP PinOnDrop=PIN_ON_DROP` | 拖拽入合集/固定区时的三种写库语义：建任务、更新既有项、固定 |

（其余 20 余个为组件库内部的尺寸/颜色档位枚举，已收录在 `_harvest/enums2.tsv`，未逐条抄录。）

## 三、实体动作词表（侧栏/资源层的可变操作全集）

从 `index` 里的 `switch(t){case"document_star":return Sk(t,e.spaceId,e.payload.documentId,{isStarred:!0})…}` 解出。**动作 id + 目标字段**是官方"能改什么"的封闭清单：

| 前缀 | 动作 | 落库字段 |
|---|---|---|
| `document_` | `star` / `unstar` | `isStarred: true/false` |
| | `archive` / `unarchive` | `isArchived: true/false` |
| | `view` | 读操作（单独 handler） |
| | `move` | 单独 handler（改所属文件夹） |
| `folder_` | `create` `rename` `set_icon` `set_description` `set_pinned` | 后四个共用一个 patch handler |
| | `move` `delete` `reorder` | 各自独立 handler |
| `subfolder_` | `reorder` | 独立于 `folder_reorder` |
| `tag_` | `pin` `unpin` `reorder` | 各自独立 handler |
| `root_` | `reorder` | 顶层顺序 |
| `starred_` | `reorder` | 收藏区顺序 |

⇒ **归档（archive）是独立于"最近删除"的另一维**（`isArchived` 与 `isDeleted` 并存），此前 9 份文档都没记到。
⇒ **五种重排作用域**（root / starred / folder / subfolder / tag）各自独立 —— 这就是拖拽落点判定的官方分类骨架，动态批次只需逐条验"某元素能不能落到某作用域"，不必再猜有哪些作用域。

## 四、通知类型全集（6 种）

`["comment_mention", "comment", "comment_resolved", "block_mention", "share_page_comment", "document_access_request"]`

⇒ 通知只有这 6 类，且 `document_access_request` 与「想要编辑/想要查看」（`longtail.md` §9）是同一件事的服务端形态；`block_mention` 与 `comment_mention` 分开 ⇒ **@文档 与 @人 是两种通知**。本地无通知中心。

## 五、AI/MCP 工具契约（补 `api-contract.md` §四）

在 `AIChatPopup` chunk 里找到**工具入参的 zod 定义与上下文富集函数**：

- 工具名（源码字面）：`space_list-tasks`、`space_list-calendar`。
- `space_list-tasks` 参数含 `listType ∈ inbox|today|upcoming|all`，且**缺省自动补 `all`**（`e.toolName==="space_list-tasks"&&!t.listType&&(t.listType="all")`）。
- 通用文档检索参数：`{spaceId, limit(默认 100), sortBy(dateCreated|dateModified, 默认 dateCreated), sortDescending(默认 true), filterIsDailyNote, filterIsStarred, filterByFolderId}` —— **有明确默认值**，且 `filterByFolderId` 由"助手是在某个文件夹上下文里打开的"自动带上。
- **上下文富集规则**（`Gd`）：调用方没给 `spaceId`/`blockIds`/`rootBlockId` 时，分别从 `context.space.spaceId` → `context.current_page[0].spaceId` → `scope.spaceId`；`blockIds` ← `context.user_selected_blocks`；并写入日志 `ToolsUtils.enrichToolArgs`。⇒ **官方 AI 自动把"当前选中的块"作为作用域**，这正是本地 AiBubbleMenu 缺的语义。
- 日历返回结构：`{sections: [{title, tasks[], dailyNotes[], sectionType}]}`，`sectionType ∈ 第一节`；`dailyNotes` 项形如 `{id, type, hasChildren?, listStyle?}` ⇒ **每日笔记条目带块类型与列表样式**。
- 日历分节语义（`.describe()` 原文）：`ongoing` 段含**过去但仍未完成**的任务；过去的段只能放已完成/已取消的任务和每日笔记；不给 `endDate` 则日历显示到当前月之后再一个月。
- 时间格式化：`remainingDaysInMonth` 渲染成 `yyyy-MM-dd - yyyy-MM-dd` 区间；`month` 用 `Intl.DateTimeFormat(locale,{year:'numeric',month:'short'})`；`later` 输出字面 `Later`；日期解析 `split('-').map(Number)` ⇒ **ISO 日期串是线上的存储形态**（与列类型 `date` 运行时为 `Date` 实例并不矛盾：序列化 vs 内存）。

### 五之二、日历分区的**生成窗口算法**（`generateDateSections()`，2026-09-27 09:50 反编译结案 ✓）

上面只记了枚举与渲染，这里补"到底生成哪些段、按什么顺序"。**顺序即渲染顺序**，逐段带 `{title, sectionType, startDate, endDate}`：

| 序 | 段 | 区间 | 标题（`getSectionTitle`） |
|---|---|---|---|
| 1 | `month` × **5**（往回） | `startOfMonth(today) - u 月` 的整月，`u = 5..1` | `Intl` 短月名 |
| 2 | `remainingDaysInMonth` | `[本月 1 号, 今天-1]`，★ **仅当今天不是 1 号**才产出（`s.getTime() !== t.getTime()`） | 区间串 |
| 3 | `ongoing` | `[new Date(2024,0,1), 今天-1]` | ★ **字面 `"Ongoing"`** |
| 4 | `day` × **7** | `[今天+u, 今天+u]`，`u = 0..6` | ★ **手工拼 `YYYY-MM-DD`**（`padStart(2,"0")`），不过 `Intl` |
| 5 | `remainingDaysInMonth` | `[今天+7, 那一周的月末]` | 区间串 |
| 6 | `month` × 1 | `[Gl(今天+7), 该月月末]` | `Intl` 短月名 |
| 7 | `month` × **5**（往前） | 以第 6 段起点为锚 `+u 月`，`u = 1..5` | `Intl` 短月名 |
| 8 | `later` | `[startOfMonth(最后一段endDate+1), Kl(·,5)]` | ★ **字面 `"Later"`** |

⇒ 四条可实现的结论：
1. **窗口是"前 5 月 + 本周剩余 + 后 6 月 + 一个兜底 Later"**，不是"今天为中心对称"。第 4 段的 7 天窗口固定从**今天**起算。
2. **`Ongoing` 的下界是硬编码 `2024-01-01`** ⇒ 2024 年以前创建的未完成任务在日历里会**与 2024 后的一起混在同一段**（官方自己的边界选择，不是设计对称）。
3. ★ **两处英文硬编码 + 一处手工日期串**（`"Ongoing"`、`"Later"`、`day` 段的 `YYYY-MM-DD`）与 `month`/`remainingDaysInMonth` 走 `Intl`/locale **不一致** ⇒ 中文界面下这两段仍是英文。与 `longtail.md` §22.1（游戏内硬编码大写串）、`tasks.md` §11.4（`Set Deadline to …` 未本地化）是**同一类官方不一致**，本地按 key 生成会自然分开 ⇒ **有意偏差候选**。
4. 第 2 段与第 5 段是**同一个 `sectionType` 出现在两处**（本月剩余 + 下周所在月剩余）⇒ **`sectionType` 不是唯一键**，本地若用 `sectionType` 做 React key 或 Map 键会撞。

**辅助函数语义（按用法反推，逐条给依据）**：`Ge(d,n)` = 加**日**（7 天循环与 `[t,t]` 单日段）；`St(d,n)` = 加**月**（5 个往回月、`St(h,1)` 再 `Ge(·,-1)` 得月末）；`kn(d)` = **月首**（`s.getTime()!==t.getTime()` 判"今天不是 1 号"）；`Gl(·)` 与 `Kl(·,5)` **未证** —— `Gl` 用法上与月首同族，`Kl(r,5)` 从"Later 是兜底段"推为**加 5 年**（也可能是 5 个月，未定）。
⇒ **仍未采到**：`Gl`/`Kl` 定义在另一 chunk（AIChatPopup 里是 import），且**日历屏 UI 是否复用同一个 `generateDateSections`** 未验（本函数在 MCP 工具类 `Ah` 上，属 `space_list-calendar` 的实现）。

## 六、对本地实现的直接影响

| 项 | 官方 | 本地 | gap |
|---|---|---|---|
| 归档维度 | `isArchived` 与 `isDeleted` 并存，动作 `document_archive/unarchive` | 无归档 | G93 |
| 重排作用域 | root/starred/folder/subfolder/tag 五套独立 | 仅 folder 内 itemOrder | G94 |
| 通知类型 | 6 种封闭集 | 无通知中心 | G95 |
| 任务视图 | `inbox/today/upcoming/all` 四档 | 侧栏有 tasks 但无四档切换 | G96 |
| AI 作用域 | 自动富集 `user_selected_blocks` + 文件夹上下文 + 默认值表 | AiBubbleMenu 传选区但无富集与默认值 | G97 |
| 代码块主题 | 21 个具名主题（含 craftdark/craftlight/auto） | 无主题选择 | G98 |
| 档位枚举 | 9 档（含 V2_* 与 Lite） | 无档位概念 | 有意偏差（不做付费墙） |

## 仍未采到

- 上述动作词表只覆盖 `document_/folder_/tag_/root_/starred_`；**块级动作**（move/duplicate/turn-into 等）没在这段 switch 里，走的是 `BlocksV2Actions` + 编辑器命令，二者如何对应未追。
- `Fs` 与 `os` 两套同步状态并存（粗/细），各自服务于哪一层（UI 徽标 vs 传输层）未证。
- `nt` 代码主题的**深色/浅色归属**与是否随应用主题自动切（`auto` 的行为）。
- 错误码到 UI 文案的映射表（只拿到码，未逐条回溯到 `alert.*`；样例：`EXTENSION_NOT_INSTALLED` ↔ `alert.error.extension.not.installed`）。
- MCP 工具全集（本次只确认 `space_list-tasks` / `space_list-calendar` 两个字面量；`api-contract.md` §四 列的其余标识符可能是事件名/图标名而非工具名，需复核）。
