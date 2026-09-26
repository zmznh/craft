# craft.do 屏幕与弹层清单（2026-09-25 全量重采）

来源：用户已登录的 Edge 会话（docs.craft.do，Qoder Browser Connector 1.7.5）。截图含真实工作区内容，已被 `.gitignore` 的 `/docs/craft-ref/ref/` 覆盖，只留本地对照。

上一轮只采了 5 屏（all-documents / tasks / calendar / connections / document），本轮按路由 + 弹层 + 设置分区重采。

## 一、路由屏（10 屏，均已截图 + 几何量取）

窗口实测 1910×925（`viewport.set()` 无效，见下）。

| 屏 | 路由 | 截图字节 | 侧栏 | 内容列 |
|---|---|---|---|---|
| 所有文档 | `/s/<space>/all` | 247588 | 288 @0,48 | 754.4 @288,100；卡片 227.475×284.34，列间距≈36 |
| 任务 | `/s/<space>/tasks` | 54695 | 288 @0,48 | 754.4 @288,48 |
| 日历 | `/s/<space>/calendar` | 68136 | 288 @0,48 | 754.4 @288,48 |
| 连接 | `/s/<space>/connections` | 330524 | 288 @0,48 | 738.4 @296,48 |
| 我的模板 | `/s/<space>/templates` | 76267 | 288 @0,48 | 754.4 @288,100 |
| 未分类 | `/s/<space>/inbox` | 193555 | 288 @0,48 | 754.4 @288,100 |
| 文件夹 | `/s/<space>/f/<slug>--<uuid>` | 268415 | 288 @0,48 | 754.4 @288,100 |
| 与我共享 | `/shared-with-me`（标题显示「最近使用」） | 51791 | 288 @0,48 | 739.2 @288,100 |
| 文档 Welcome | `/editor/d/<space>/<docUuid>` | 108071 | 288 @0,**176** | 正文 textbox 522.4×23 @378.8,407 |
| 文档 Handbook | 同上 | 248752 | 288 @0,176 | — |

要点：
- 浏览视图侧栏从 y=48 起（顶栏 48px），**编辑器屏侧栏从 y=176 起** —— 编辑器顶栏明显更高，这一条上轮没量到。
- 内容列宽 754.4px（3 列卡片 + 2×36px 间距），`--browse-max-width: 1630px` 是其上限。

### ⚠️ 基准图窗口尺寸不统一（本轮用 sharp 逐张读 metadata 发现）

`ref/` 里 28 张 PNG 实际横跨 **4 种尺寸**，不能直接互相比像素：

| 尺寸（设备像素） | 张数 | 对应 CSS 视口（÷1.219） | 采集批次 |
|---|---|---|---|
| 1303×858 / 1303×857 | 18 | ≈1069×704 | 12:35–12:44（10 路由屏 + 前 5 个设置分区 + 2 菜单） |
| 1910×925 | 8 | ≈1567×759 | 16:32–21:05（重采的 6 个分区 + 2 张弹窗态 + `layout-a`） |
| 1910×883 / 1910×867 | 2 | ≈1567×724 / 711 | 弹窗高度在两次采集之间又变了 |

也就是说 **Edge 窗口在 12:44 与 16:32 之间被放大过**（不是采集方法差异）。副作用：`--browse-max-width` 之类的自适应布局在两批图里列数不同（见下），跨批对比必须先归一到 CSS 像素。上表 §一 的"窗口实测 1910×925"仅对 16:32 之后的批次成立。

### 卡片网格布局几何（`layout-a.png`，sharp 本地量边缘，不占浏览器预算）

> **换算比例待定，不要沿用 1.219**：下表 CSS 列按 ÷1.219 算，但第四点七的点击命中证据说明 x 方向比例 ≥1.26，而 `elementInfo` 的 227.5 对上设备 283 又给出 ≈1.245。三个来源不一致，说明"设备像素 ÷ 单一常数"这个模型本身不可靠（`cua.click` 的坐标空间与截图缩放可能不同源）。设备像素列与 pitch 关系仍然有效；`elementInfo` 直接返回的 CSS 值（227.5×284.3、288 侧栏、48 顶栏）才是可信基准。

对每行/每列做亮度突变检测（阈值 24），得到的稳定边缘：

| 量 | 设备像素 | CSS 像素（÷1.219） |
|---|---|---|
| 首列卡片左边缘 | 379.5 | 311 |
| 卡片外框 | 283 × 353 | **232 × 290** |
| 卡片内框（elementInfo 报的 content-box） | — | 227.5 × 284.3 |
| 列 pitch | 307–309 | 252 |
| 水平 / 垂直间距 | 24 / 25 | **≈20**（上表"列间距≈36"是反推错的，作废） |
| 内容区 | 379.5 → 1890.5 | 311 → 1551，右内边距 16 |
| 卡片行 pitch | 378 | 310 |

自适应规律：卡片宽度固定 232 CSS，**列数随视口变**——CSS 视口 1069 → 3 列（内容 311→1052），1567 → 5 列（311→1551）。即 `列数 = floor((vw - 311 - 16 + 20) / 252)`。侧栏与内容区同底色（`rgb(252,253,254)`），所以图上**量不到侧栏右边界**，只能靠 `elementInfo` 的 288。

## 二、弹层与菜单

| 弹层 | 入口 | 截图 | 内容 |
|---|---|---|---|
| 空间切换器 | 侧栏顶部 `<空间名> ⌄` | `menu-space-switcher.png` | 仅两项：**设置**（Gear）、**退出登录** |
| Ellipsis 菜单 | 顶栏 `…` | `menu-ellipsis.png` | 选择 / 排序方式（名称、上次浏览、创建日期、更新日期）/ 显示每日笔记 / 导入 / 导出为 Markdown / 导出为 TextBundle / 空间设置 |
| 设置弹窗 | 空间切换器 → 设置 | `settings-open.png` | ~~弹窗 ≈1165×645~~ **已推翻（2026-09-26 sharp 像素实测）**：弹窗实为 960×594 CSS px，在 1528×693 视口中居中（左上角 284,50），遮罩 rgba(0,0,0,.16)；左导航列 232×32 行、圆角 10、选中态 foreground 8%；内容卡片/分隔线 foreground 4%。~~弹窗打开时侧栏折叠为 ≈57px 图标栏~~ **已推翻**：全部 7+ 张官方设置截图（`state-settings-open.png`、`settings-*.png`）均显示完整 288px 侧栏位于遮罩之下，无折叠图标栏 |
| 通知面板 | 顶栏 Bell | `menu-bell.png` | 容器类名 `design-system-popupContainer`；标题「通知」+ Ellipsis；分段 tab 动态/提醒（选中格 `rgb(246,246,246)`）；4 条骨架屏；空态「还没有通知…」+「了解更多」 |
| Ellipsis 菜单（第二版，叠在表格视图上） | 顶栏 `…` | `menu-ellipsis-table.png` | 选择 / 排序方式（名称、上次浏览、创建日期、✓更新日期↓）/ ✓显示每日笔记 / 导入 / 导出为 Markdown / 导出为 TextBundle / 空间设置 |
| 帮助菜单 | 顶栏 Question Mark | `menu-help.png` 420075 | 意见反馈 / 最新特性 / ☆Web 和 Windows 版最新特性 / 常见问题 / 快捷键 / ⌘Markdown 快捷方式 |
| Teams 付费墙 | 侧栏底部 Person3 Fill | `menu-people.png` 449728 | 见下方几何；CTA「开始 15 天免费试用」**只看不点** |
| 桌面版 | 侧栏底部 Desktop | `menu-desktop.png` 410111 | **无弹层** —— 与基线仅差 230 字节（按钮按下态），不是设计屏 |

### Teams 付费墙弹窗（`menu-people.png`，本地 sharp 量）

| 量 | 设备像素 | 换算 CSS（按 1.22–1.26 区间） |
|---|---|---|
| 弹窗宽 | 601 → 1308 = **707** | ≈ 561–580 |
| 弹窗高 | 顶 y=55，CTA 底 y=741（+「无需信用卡」行）≈ **790** | ≈ 627–648 |
| 遮罩色 | 页面底 `252,253,254` 被压到 **`211,212,213`** | ⇒ 遮罩 ≈ **`rgba(0,0,0,.16)`**（252×0.84≈212 对得上） |

文案与结构：标题「免费试用 Teams」；副标题「15 天免费试用，之后选择 US$17.99/月（最多 6 名成员）或固定 US$59.99/月（最多 10 名成员）」；5 条特性（用作协作的共享团队 / 多个团队空间，可邀请成员 / 集中计费 / 团队角色与权限 / 每位成员专属 Plus 私人账号）；黑色主 CTA + 次行「无需信用卡」；右上角 X 关闭。

## 三、设置分区（12 个）

导航分两组：`空间设置`（已发布内容 / 标签 / 空间设置）与 `常规设置`（外观 / 语言 / 高级设置 / 账户设置 / 我的订阅 / 团队 / 集成 / 助手 / 通知 / 关于 Craft）。

已确认取到有效截图的 5 个：

| 分区 | 截图字节 | 实测内容 |
|---|---|---|
| 外观 | 198882 | 主题三选：**系统 / 浅色 / 深色**；强调色 `blue / pink / green / purple …`（对应 CSS 的 12 个 `[data-accent=…]` 块） |
| 语言 | 146226 | 语言下拉（简体中文），对应 `--cjk-*` 与 `common/fontdef.css` 的 CJK 字体族 |
| 空间设置 | 156945 | 空间图标 + 相机按钮、空间名称行（带铅笔编辑按钮） |
| 已发布内容 | 182887 | craft.me 链接、自定义域名两行卡片（614×78） |
| 标签 | 179526 | 「使用标签」开关、忽略列表说明、十六进制颜色值条目 |

**待重采（连接器队列积压导致这批点击落空，截图与上一张重复）**：~~高级设置、集成~~、助手、通知、关于 Craft、账户设置、团队。

> 2026-09-25 13:30 补：换用「新标签页 + 语义树索引点击 + 截图字节校验」后，**高级设置**（229618）与**集成**（229579）已确认切换成功并重采；助手 / 通知 / 关于 Craft / 账户设置 / 团队 这 5 个分区的点击仍静默失效（截图字节与「集成」完全相同），原因是它们位于设置弹窗左导航的可视区之外，索引点击对滚出区域不生效，需先滚动导航列再点。

## 四、本轮仍未采到的屏

- ~~设置分区 4 个：通知、关于 Craft、账户设置、团队~~ 已于 2026-09-26 21:39 全部补齐（见第十节；注意 9-25 那批同名字节是假基准，已标 `_invalid-`）
- 顶栏弹层：Bell 通知、Question Mark 帮助、Plus Circle 快速新建、Person3 成员、Desktop 桌面版、Square And Arrow Down
- ~~浏览布局三态~~ 已于 2026-09-26 补齐（卡片 / 表格 / 列表三态各一张，见第四点七；但两张列表图的按钮归属待二次确认）
- ~~文档屏右栏（信息 / 样式 / 插入面板）~~ 已于 21:00 前补齐（见第八节）；~~卡片右键菜单~~ 已于 21:37 补齐（见第十节）；**分享面板仍未采到**
- ~~搜索面板（顶栏「打开」）~~ 已于 2026-09-26 17:51 采到，见第九节
- ~~白板屏（excalidraw）~~ 已于 2026-09-26 21:48 采到（内联态 + 全屏编辑态 + 块菜单 + `/` 插入面板），见第十节
- ~~暗色截图~~ 已于 2026-09-26 21:40–21:42 补齐 4 屏并已还原为「系统」，见第十节
- 移动端 / 平板视口：`viewport.set()` 实测静默无效，采不到不同分辨率

## 四点五、连接器三次失效记录（失效模式已收敛）

| 时间 | 触发操作 | 首个错误 | 之后 |
|---|---|---|---|
| 13:05 | `elementInfo` 28×N 网格扫描（约 170 次）+ 取消 cell | `Tool command waited too long in queue` | 静置 6–15 分钟不自愈 |
| 17:12 | 设置弹窗打开时循环 `ax.get('state',{disableDiffing:true})`（十几次） | `Browser extension request timed out: tools/invoke` | 转成队列堵塞，静置 90 秒不恢复 |
| 17:40 | 重连后 `tabs.new()` 报 `Debugger is not attached to the tab`；改 `claimTab` 成功，但打开设置后**第一次**全量语义树就把扩展挂死 | cell 永久挂起 → 取消 → `waited too long in queue` | 同上 |
| 17:55 | 第四次重连后：`tabs.new()` 正常、**只用紧凑语义树（9730 字节）+ diff（626 字节）成功打开设置弹窗**（`state-settings-open.png`，219812 字节），随后在弹窗上做 **6 次 `elementInfo` 点查** | `Browser extension request timed out: tools/invoke` | 连 `screenshot()` 都排队超时 |
| 20:51 | 第五次重连后：`tabs.new()` + 紧凑树 + diff 再次成功开弹窗（`nav-top.png`，181854 字节），随后在弹窗上做 **1 次 `cua.scroll`** | cell 永久挂起 → `tools/invoke` 超时 | 同上 |
| 21:05 | 第六次重连后（无遮罩页面！）：一个 cell 里连发 3 次 `ax.click(index)` 点同一排布局按钮 140→143→146。第 1 次成功并整页重渲染，第 2 次 `ax.click(143)` **既不返回也不抛错** | 20 秒后连 `tab.url()` 都本地超时；`node_repl` 的 cell 被自身 timeout 取消后队列仍不通 | 静置不恢复，需第 7 次重连 |
| 14:16 | 第 8 次（扩展重启 + 启动 Edge 后队列本来是通的：`goto` / `title` / 3 次坐标点击 + 3 张截图全部成功）：在连续 3 次布局点击之后调 **`ax.get()` 紧凑模式** | `local-timeout`（60 秒），随后 `title()` / `screenshot()` 全挂 | 需第 9 次恢复 |

### 遮罩层下调用白名单 / 黑名单（六次失效换来的结论）

| | 调用 | 实测 |
|---|---|---|
| 安全 | `screenshot()` | 多次连发从不挂 |
| 安全 | `cua.click({x,y})` | 切分区、选主题都成功 |
| 安全 | `ax.get()` 紧凑 diff（菜单刚弹出） | 626 字节正常返回 |
| **致命** | `elementInfo({x,y})` 点查 | 6 次即超时 |
| **致命** | `ax.get('state',{disableDiffing:true})` | 1 次即挂 |
| **致命** | `cua.scroll(...)` | 1 次即挂 |

所以"滚出可视区的 4 个设置分区"在弹窗内无解：翻页只能靠键盘，或先关弹窗换入口。

### 坐标标定（新发现，必须做）

`cua.click` 吃 **CSS 像素**，`screenshot()` 给的是**设备像素**，实测比例 **1.219**（CSS 视口 ≈1567×759，截图 1910×925）。用已知 CSS 值标定：侧栏 288 CSS ↔ 图上约 351px。不换算就会每行偏十几像素、点到隔壁行。

## 四点六、本轮补采结果（21:05 批次 1，方案 2 第一步）

- 内核被重置（`node_repl_reset` 后 generation 2），重新走 Step 0：`@qoder-space/computer-use-sdk` → `createBrowserAgent()` → `browsers.get()` → `user.openTabs()` 只剩 1 个标签页 → `claimTab` 成功（tab `…770481`）。**重连后 `tabs.new()` 不再需要**，直接接管已有标签页更稳。
- `goto(/all)` + 紧凑语义树（9730 字节 / 227 行，落 `_ax_all.txt`）一次成功，顺带把顶栏按钮索引全量确认：`15 Bell`、`19 Question Mark`、`25 空间切换器`、`120 Desktop`、`123 Square And Arrow Down`、`126 Person3 Fill`、`130 Plus Circle Fill`、`135 Crown 获得 Craft Plus`（禁点）、`140/143/146 布局三态`、`149 Ellipsis`。路由也补齐了 `/shared-with-me` 与 `/f/<slug>--<uuid>` 两种形态。
- 新增有效截图：**`layout-a.png` 410831 字节 = 卡片网格布局**（`Rectangle Grid2x2`），带文档正文预览缩略、封面图、右侧两列被裁切——是此前 10 屏里没有的视图形态。
- 采完第 1 个布局就撞上第六次连接器死亡（见第四点五），`Rectangle3 Group` / `Line3 Horizontal` 两态未取到。
- **账户状态未被改动（已用像素证据推翻上一轮的担心）**：`layout-a.png` 上分段控件三格在 y=94 的填充色分别是 `246,246,246` / `255,255,255` / `255,255,255`，图标描边 `26,28,30`（选中）vs `140,141,142`（未选中）——**第 1 格 `Rectangle Grid2x2` 本来就是选中态**，我那次 `ax.click(140)` 点的是已选中项，是 no-op。`layout-a.png`(410831) 与 `all-desktop.png`(247588) 的字节差完全来自窗口从 1303 变 1910，不是布局切换。主题同样是「系统 / 强调色 blue」，本轮全程无写入型点击。
- 顺带量到分段控件（布局切换器）几何与配色：外框 x 1694→1836、y 75→114（设备像素）= **116.5 × 32 CSS**，三格各 ≈39 CSS 宽；选中格填充 `rgb(246,246,246)`，选中图标 `rgb(26,28,30)`（= `--base-fg`），未选中图标 `rgb(140,141,142)`。
- 仍缺：通知、关于 Craft、账户设置、团队 4 个分区（需键盘翻页），顶栏 6 个弹层，布局另外两态（`Rectangle3 Group` CSS≈(1449,77)、`Line3 Horizontal` CSS≈(1484,77)，还原点 `(1413,77)`），文档右栏，分享面板，卡片右键菜单，白板屏，暗色截图。
- 下一轮改法（已写进 Skill）：同一排按钮的连续点击**一律改用 `cua.click({x,y})` 坐标**，一个 cell 只做「1 次点击 + 1 张截图 + 字节校验」；每次点击后若发生整页重渲染，禁止再复用旧索引。开工前先用本地超时探针判活，**且探针要用 `title()`/`screenshot()`，不能用 `url()`/`openTabs()`（会假阳性）**。

## 四点七、2026-09-26 14:14 批次（重启扩展后跑通，但结论要更正）

**恢复验证成功**：在 `edge://extensions` 关掉再打开 Qoder Browser Connector 之后，队列真的清空了 —— 报错从"永久挂死"变成快速返回（`No current window`）。随后用 computer-use 的 `launch_app` 启动 Edge（`apps-folder:MSEdge`，pid 11936）建出窗口，`tabs.new()` 恢复正常，新建标签页 `goto(/all)` + `title()` 返回「所有文档」，登录态完好。

**本轮新采到 4 张图**（都是 1910×883，即 CSS 视口 1516×701）：

| 文件 | 字节 | 实际内容 |
|---|---|---|
| `layout-grid-1910.png` | 409850 | 卡片网格（`Rectangle Grid2x2`，原本就在的态） |
| `layout-table.png` | 148923 | **表格式列表**：列头「名称 / 上次浏览 / 已更新 / 已创建」+ 排序箭头，行含缩略图、斜体衬线标题、正文摘要、三个日期列 |
| `layout-list2.png` | 149005 | 另一种列表态（`Rectangle3 Group`），与上者字节接近 |
| `menu-ellipsis-table.png` | 170708 | **不是布局**：Ellipsis 菜单被误点开，叠在表格视图上 |

**⚠️ 更正一：坐标标定比例是 1.26，不是 1.219。** 1.219 来自"侧栏 288 CSS ↔ 图上约 351 像素"的目测，本轮被点击命中结果直接推翻：按 1.219 算应落在第 3 个分段按钮的 CSS 1483，实际打开了旁边的 Ellipsis 菜单（设备 1849–1886）。按 **1.26** 反推则三次点击全部自洽：1412→cell2(设备1779)、1448→cell3(1824)、1483→Ellipsis(1868)。**本文档里所有按 ÷1.219 换算的 CSS 值都应改按 ÷1.26**，受影响的主要是分段控件：142×39 设备 = **112.7 × 31 CSS**（原写 116.5×32）。卡片 232×290 那组是 `elementInfo` 直接给的 CSS 值，不受影响。

**⚠️ 更正二：上一轮"布局三态已齐"的说法作废。** 真正拿到的只有卡片 + 表格 + 一个疑似 `Rectangle3 Group` 的态，且第 3 张其实是误开的 Ellipsis 菜单（顺带算采到了菜单第二版：`选择 / 排序方式（名称·上次浏览·创建日期·✓更新日期↓）/ ✓显示每日笔记 / 导入 / 导出为 Markdown / 导出为 TextBundle / 空间设置`）。

**⚠️ 未还原项（需要你处理）**：`/all` 的浏览布局现在停在**列表态**，原来是**卡片网格**。重连后我点回 `Rectangle Grid2x2`（CSS ≈ (1366, 75)），或者你直接点顶栏最左边那个方格图标。主题与强调色未动。

**第 8 次死亡的新线索**：本轮前 6 条浏览器命令（`tabs.new` / `goto` / `title` / 3 次 `cua.click` + 3 次 `screenshot`）全部正常，是在 3 次布局重渲染**之后**调了一次 `ax.get()` 紧凑模式才挂的 —— 说明"紧凑 diff"在大树（224 节点 / ~10KB）上重渲染后同样危险，之前"只有 `disableDiffing` 危险"的判断不完整。

**下一轮的打法**（预算按"每次重连只够 6–8 条命令"规划）：不再混用坐标与索引；一个 cell 固定只做 `ax.get()` → 立即 `ax.click(新索引)` → `screenshot()`，且**同一 cell 内不再叠加第二个动作**；顶栏 6 个弹层按"一次重连采 2 个"排班。

## 四点八、2026-09-26 14:4x 批次（重启扩展后：还原成功 + 第一个顶栏弹层）

**恢复方法再次生效**：`edge://extensions` 关掉再打开扩展 → 全新 `createBrowserAgent()` → `openTabs()` 返回空（Edge 窗口在）→ `tabs.new()` 成功（tab `…770787`）→ `goto(/all)` → `title()` 返回「所有文档」。**布局已还原并双向校验**：`ax.get()` 全量树（11377 字节）→ 立即 `ax.click(140)`（Grid2x2）→ `screenshot()` = **409881 字节 ≈ 原始 409850（差 31 字节，仅光标/抗锯齿）**，且肉眼看截图已是 5 列卡片网格。账户侧现在**无残留改动**。

**新增弹层：`menu-bell.png`（441107 字节）通知面板**，diff 只花 797 字节就拿到全部结构：

- 容器类名 **`design-system-popupContainer`**（官方弹层容器的语义化 hook，本地复刻应直接对齐这个名字）
- 头部：`通知` 标题 + 一个 `Ellipsis` 按钮
- 分段 tab：**动态 / 提醒**（选中格填充 `rgb(246,246,246)`，与顶栏布局切换器同一个色，说明是同一个 token 而非局部硬编码）
- 4 条骨架屏占位条（垂直间距实测约 60 设备像素），带紫/粉系微光渐变
- 空态文案：`还没有通知` + `当有人提及你、对你的文档发表评论或回复你的评论时，你会在此处收到通知。` + `了解更多` 链接（指向 YouTube）
- 面板顶边在设备 y=59（紧贴 48px 顶栏下方），锚在 Bell 图标右下

**本轮三条机制级新结论（已写进 Skill）**

1. **diff 快照会收窄"可点索引"集合**：`ax.get()` 连续读返回 diff 后，只有 diff 里出现的索引能点，其余报 `Accessibility element N is not present in the latest snapshot` —— 但它是**快速失败、不挂队列**。要重新拿到全量索引，最便宜的办法是 `goto(当前 URL)` 重载，而不是 `{disableDiffing:true}`。
2. **索引不是稠密序号**：同一个 Bell 按钮在两份全量树里分别是 `15` 和 `363`（节点数 224 → 258 后编号整体位移）。任何"记住上次的索引"都不成立，必须每次从当前树正则取、当场用。
3. **预算模型要改写**：本周期连发 14 条浏览器命令（含 3 次全量 `ax.get()`）都没挂。之前"每次重连只够 6–8 条"是被误归因——真正的区分是**调用类型**（`elementInfo` 批量点查 / 遮罩下全量树 / `cua.scroll` / 越界索引），普通 `goto` + `screenshot` 循环几乎不会挂。

**顶栏弹层进度：4 / 6（另 2 个判定为写入项永久跳过）**

| 弹层 | 入口 | 结果 |
|---|---|---|
| Bell 通知 | 顶栏 Bell | ✅ `menu-bell.png` 441107（见第二节表格） |
| 帮助菜单 | 顶栏 Question Mark | ✅ `menu-help.png` 420075：**意见反馈 / 最新特性 / ☆Web 和 Windows 版最新特性 / 常见问题 / 快捷键 / ⌘Markdown 快捷方式**（打开后 `ax.get()` 40s 超时，菜单项改从截图读出） |
| 桌面版 | 侧栏底部 Desktop | ✅ 结论是**没有弹层**：`menu-desktop.png` 410111 与基线仅差 230 字节（按钮按下态），非设计屏 |
| Teams 付费墙 | 侧栏底部 Person3 Fill | ✅ `menu-people.png` 449728，几何与遮罩色见第二节；CTA 只看不点，事后用 `goto` 重载关闭（410184 ≈ 基线 410111，确认已关） |
| 新建文档 | 标题左侧 Plus Circle Fill | ⛔ **主动跳过**：点击会在你的空间里创建文档，属写入项 |
| 导出/分享 | 侧栏底部 Square And Arrow Down | ⛔ 主动跳过（可能直接触发导出下载） |

**第 9 次死亡的性质要单独记**：这次不是"某类调用必挂"，而是 `ax.get()` 全量树**在同一周期内成功 2–4 次后开始超时**（60s、120s 都没回），而它之前 `title()` 还是正常的。所以 `ax.get()` 要当稀缺资源用：一个周期最多 2 次，能靠截图读出内容就别读树。

**当前账户状态：干净。** 最后一次成功的动作是把布局还原成卡片网格（`layout-grid-restored2.png` 409881 ≈ 原始 409850），之后的失败周期没有产生任何点击。

## 五、暗色截图：未采集，账户偏好未被改动

已获授权尝试「临时切深色 → 采一批 → 切回系统」，但执行在 `browser.tabs.new()` 一步就撞上连接器队列堵塞，`steps` 为空数组证明**没有任何点击发生**，因此主题仍是原来的「系统」，无需还原。暗色基准图（`dark-*.png`、`ref-*-dark.png`）本轮未产出。

## 六、连接器状态与排班

- **当前状态：健康，且账户侧干净**。第 10 次恢复（`edge://extensions` 关掉再打开扩展）后，用"单弹层最小配方"在一个周期内连做 Desktop + Person3 两个弹层 + 一次 `goto` 关弹窗，全部成功，共约 12 条命令、其中 `ax.get()` 只用 2 次。
- **有效的恢复方法**：在 `edge://extensions` 把扩展关掉再打开（重启 service worker）—— 队列真的清空，报错从"永久挂死"变成快速返回。单纯点重连无效（第 7 次已证明）。Edge 若被完全退出，可用 computer-use 的 `launch_app`（`apps-folder:MSEdge`）拉起。
- **已验证配方（写进 Skill Step 6b 第 9/10 条）**：`goto(当前 URL)` → **node 自己的 `setTimeout` 等待（不要用 `playwright.waitForTimeout`，它也占一条浏览器命令）** → `ax.get()` 全量 + 当场正则取索引 → `ax.click(idx)` → node sleep → `screenshot()`；菜单项**从截图读**，不补第二次 `ax.get()`。关弹层用 `goto` 重载，不要去找 X。
- 顶栏/侧栏弹层已收尾（4 采 + 2 跳过），**文档右栏 4 个 tab 全部采齐**（见第八节）。**剩余待采**：搜索面板（**三种机制都试过打不开，见下**）、卡片右键菜单、白板屏（excalidraw）、暗色批次、以及滚出可视区的 4 个设置分区（通知 / 关于 Craft / 账户设置 / 团队）。
- **搜索面板「打开」是本轮唯一的负结果**：① `ax.click(14)`（text 节点）与 `ax.click(11)`（container 节点）都报 `BrowserAgentRuntimeError`（**索引点击只吃真正的 button**）；② `cua.click({x:763,y:27})` 与 `cua.click({x:548,y:26})` 都返回成功但界面零变化（实测搜索框是设备 x 655→1255、y 18→48，两种比例解读下坐标都落在框内）；③ `cua.keypress('Meta+k')` 报参数错误。**三张"点了没变"的截图已删除**，不留假基准。下一步该试的是 `ax.performSecondaryAction` 或 Playwright locator 路线，而不是继续换坐标。
- 标签页：本轮 `tabs.new()` 建的 `…770799` 未标 deliverable，Turn 结束会自动关闭；前几轮遗留的 `1701770218`、`1701770270`、`1701770474` 若还在请手动关掉。

## 七、采集方法上的四条硬教训

1. **CSS 必须逐屏取并集**：`TaskViews.css` 只在 `/tasks`、`/calendar` 出现；只解析 `index.css` 会漏掉 220 个白板 `--color-*` 与整套 KaTeX 字体。
2. **`elementInfo` 不能做网格扫描**：一次 28×N 的点查循环会把连接器的串行命令队列堵死（`Tool command waited too long in queue`），且新建标签页也救不回来，只能等积压排空。逐屏探针要限制在个位数。
3. **每次点击后必须校验界面真的变了**：比较 `screenshot()` 的字节长度是否与上一张相同。12 个设置分区里有 5 个是"点了但没切"，语义树索引点击对滚出导航可视区的行会静默失效——不校验就会交出一批互相重复的假基准图。
4. **失效索引点击是最隐蔽的挂死方式**：它不像参数错误会抛异常，而是让扩展那条串行命令永远排不完——第 6 次死亡只用了 2 条浏览器命令（`ax.click(140)` 成功后 `ax.click(143)`），且发生在**没有遮罩的普通页面**，所以"弹窗危险"不是唯一条件。规则：一次 cell 只发 1 次 `ax.click(index)`，且点击后若整页重渲染就必须重新取树；同一排按钮连点改走 `cua.click({x,y})`。

## 八、文档编辑器右栏（`doc-handbook-1910.png` 360587，1910×883 新基准）

旧的 `doc-*-desktop.png` 全是 1303 宽；这张是 1910 宽下第一次拿到，而且**右栏默认就是展开的** —— 零 `ax.get()` 成本就换到了最值钱的一屏。

**编辑器外壳**

- 顶栏：面包屑居中「📁 How to use Craft / Craft Handbook」；右侧依次 空间头像（紫底）·「共享」·Bell·Question Mark·右栏收起图标。
- 左侧目录栏：顶部页面名 + 「5 年前」，下面一行 4 个图标 tab（目录 / 历史 / 链接 / 搜索），再下面「目录」标题与子页树（Craft Handbook → Adding Content → Adding Text…，靠缩进表达层级）。
- 目录栏底部一行图标：Sharing / Export / Link Share（被正文卡片部分遮住）。
- 正文卡片：外层是**粉→橙渐变衬底**（对应 CSS 的 `--editor-gradient-*`），里面才是白色文档纸；标题「Craft Handbook」是**斜体衬线**。

**右栏 = 4 个 tab + 分组条目列表**

| tab | 状态 |
|---|---|
| **插入** | 当前选中，内容见下 |
| 格式 / 样式 / 信息 | 未采，需 1 次 `ax.get()` 拿 tab 索引 |

「插入」tab 顶部提示行：**「将任何项拖放到您的文档中」**；条目分两组，每条左侧图标 + 名称，**右侧是六点拖拽把手（⠿）**：

- 第一组（无标题）：文本 · 页面 · 卡片 · 文件附件 · 图片 · 插入 Unsplash 图片 · 代码块 · 公式（TeX）· Mermaid 图表 · 白板
- **合集**：表格 · 图库 · Kanban

这 13 条 + 拖拽把手 + 「拖放到文档」提示，就是 Crafty 侧「插入面板改整行卡片 + 右侧拖拽点」待办的官方依据；条目名可与资源一一对上（公式 TeX → KaTeX 字体集，白板 → `vendor-excalidraw.css` 的 220 个 `--color-*`，代码块 → `vendor-code-editor.css`）。

### 右栏 4 个 tab 全部采齐（15:4x 补）

tab 行是 4 个**普通 button**（不是 ARIA tab）：`插入 / 格式 / 样式 / 信息`，选中态是**加粗黑字**（没有下划线、没有底色）。基准图均 1910×883：

| tab | 文件 | 字节 |
|---|---|---|
| 插入 | `doc-handbook-1910.png` | 360587 |
| 格式 | `panel-format.png` | 360949 |
| 样式 | `panel-style.png` | 375038 |
| 信息 | `panel-info.png` | 361585 |

**格式**：`文本` 组（标题 / 副标题 / 标题(衬线斜体) / 小标题 / 正文 / 说明 —— 正好对应 CSS 里 `--st-*` 与 `--dc-*` 两族排版预设）；`分组` 组（页面 / **卡片**，选中是深灰药丸）；三行工具按钮 `B I S </>` · `☑ ▶ ≔ ≔(编号)` · `⇤ ⇥ ⊏ ⊐ 居中 ⊟ ⊞`；`装饰` 组（焦点 / 块）；`颜色` 组 11 个圆点（灰、灰蓝、浅灰、紫、蓝、浅蓝、绿、紫粉、红、橙、棕 + 一个**彩虹渐变描边的勾选圆**＝跟随主题）；`字体` 组被截断。

**样式**：顶部「自定义样式」预览卡 + `所有样式` 按钮；`颜色` 组三行（背景＝粉橙渐变块 / 文档颜色＝黑白对角块 / 文本颜色＝黑白对角块）；`封面` 组（封面图片 + `+`）；`分隔符样式` 组三选（**线**（选中，淡紫底）/ 图片 / 声波）；`字体` 组四选（**Aa 默认**（选中）/ Ss / 00 / Rr）；`高级` 组被截断。

**信息**：顶部分段两选（**页面信息** / 动作）；`属性` 组（已创建: 3 年前 / 已更新: 3 年前 / 作者: <账户持有人>）；`动作` 组（展示 / 移动到… / 创建副本 / 收藏文档 / 查看备份 / **删除**＝红字，只看不点）；`位置` 组（👋 How to use Craft）；`统计 · 这一页` 组 + 底部三个图标 tab。

**采法**：每个 tab 都要 `goto(DOC)` → `ax.get()`（编辑器树实测 29–35KB，是浏览页的 3 倍）→ 正则取索引 → `ax.click(idx)` → `screenshot()`。不 `goto` 直接 `ax.get()` 只会拿到 3.5KB 的 diff，里面**没有未变化的 tab 行**，索引取不到。同一个 tab 按钮在三次加载里的索引分别是 454 / 1212 / 1789 —— 再次证明索引不可跨快照复用。

**本轮新坑**：`BR.tabs.new()` 建的标签页会在回合之间被回收，表现为 `Debugger is not attached to the tab` + 该 tab 后续调用全部超时，而 `user.openTabs()` 仍然秒回 —— **看起来像队列挂死，其实只是标签页没了**。建完立刻 `await tab.markHandoff()` 才能跨回合持有。

## 九、2026-09-26 17:49–18:00 批次：locator 能力面 + 搜索面板

### 9.1 坐标换算定论（推翻此前所有猜测）

`playwright.elementInfo({x, y})` 返回的是**视口 CSS px**：在 `/all` 上 `(300,100)` 命中主内容区 `div[role=presentation]`，`bounds = {x:288, y:100, width:1240, height:700}`，即侧栏 288 + 内容 1240 = **视口 CSS 宽 1528**；而截图宽 **1910**。`1910 / 1528 = 1.25` —— 正是 Windows 125% 缩放的 DPR。

> 旧表里 1.219 / 1.245 / 1.26 三个互相矛盾的标定比，根因是把「截图设备像素」和「窗口外框像素」混着除。**换算只有一条：CSS px = 截图 px ÷ 1.25**，且 `elementInfo` 的坐标空间与 CSS 空间一致，不需要再标定。

### 9.2 反射出来的完整能力面（此前只用到冰山一角）

| 对象 | 方法 |
| --- | --- |
| `tab` | `goto back forward reload close markHandoff markDeliverable screenshot title url requestManualHandoff getJsDialog` |
| `tab.playwright` | `goBack goForward evaluate locator getByRole getByText getByLabel getByPlaceholder getByTestId frameLocator waitForURL waitForLoadState waitForTimeout waitForEvent expectNavigation elementInfo elementScreenshot domSnapshot` |
| `locator` | `click dblclick selectOption fill type press setChecked check uncheck waitFor count all textContent innerText allTextContents getAttribute isVisible isEnabled downloadMedia evaluate evaluateAll pressSequentially locator getByRole getByText getByLabel getByPlaceholder getByTestId filter first last nth and or` |
| `tab.ax` | `get write click drag performSecondaryAction pressKey scroll selectText setValue typeText` |

签名（本地反射，不占浏览器命令）：
- `locator.click(options = {})` → 只转发 `{button, modifiers, force, timeoutMs}`。**`button:'right'` 实测可用**。
- `ax.scroll(target, direction, pages)` —— 三参，能按索引滚动，是「弹层内滚不动」的正解。
- `ax.performSecondaryAction(elementIndex, action)`。
- `ax.write(mode = "state", options)` —— AX 快照不止一种 mode。
- `elementInfo(options)` 要求 `{x, y}` 两个 number。

### 9.3 搜索面板（项1，已采）

入口是顶栏 `container Magnifyingglass Icon` + `text 打开`（本轮快照里是节点 14）。**它是 `text` 行不是 `button` 行，所以 `ax.click(14)` 必然报错**，但 `locator` 能点：

```js
await TB.playwright.getByText('打开', { exact: true }).first().click();  // → undefined = 成功
```

弹层形态（`ref/search-panel.png` 410086 B / `ref/search-panel-2.png` 410335 B，1910×925）：顶部锚定的圆角模态，横向居中（右边界 device x≈1240 → CSS x≈992）；内有一条搜索框（`+ 打开` 占位，聚焦时蓝色描边，框高 device 40 → **CSS 32**）；下方分组标题 `文档`，结果行 = 左侧缩略图 + 标题 + 副标题 `在<空间名>中`。

**判活靠字节数**：同一页面同一状态下 `screenshot()` 完全确定（本轮三次分别 410086 / 410084 / 410086，只差在动效帧），所以「弹层有没有开」= 与基线的字节差。无弹层的 `/all` 基线 409881，开弹层 410086。

### 9.4 本轮新失败路径（四条）

| 试过的 | 结果 | 正解 |
| --- | --- | --- |
| `getByText('Search')`（默认子串匹配） | 命中 `<style>`/`<script>` 里的文本，`allTextContents()` 一次吐回 ~1 MB，直接吃掉上下文预算 | 一律 `{exact:true}`；要读结构就 `ax.get()` 落盘再本地 grep |
| `locator.click({force:true})` | `BrowserAgentRuntimeError: No element matched locator: internal:text="打开"s >>` —— 传 options 后选择器被序列化坏了 | 只用 `{button, modifiers}`；需要跳过可交互性检查时改目标 |
| `getByText(...).first().locator('xpath=..')` 取父节点 | 同上，选择器被打断，`count()` 直接 0 | 不能用 XPath 上溯；换 CSS 作用域或坐标 |
| `ax.performSecondaryAction(14, 'Press')` | `Unsupported secondary action: Press` | 动作名待试 `ShowMenu` 等；普通点击用 `locator.click` |

### 9.5 连接器之外的两个新死法

1. **node_repl 僵尸 cell**：cell 实际跑完并落了盘，但 harness 仍记它为 active。此后 `node_repl_wait` 和 `node_repl_cancel` 都回 `no active cell`，而新的 `node_repl` 回 `already has active cell …`，`node_repl_reset` 回 `cell … is active; cancel it before resetting` —— **三个入口互相踢皮球，死锁**。工具文档写了默认执行上限 10 分钟，所以解法就是干等；缓解办法是把 cell 拆短，让它在默认 `yield_time_ms=10000` 内返回。
2. **`browser-use` MCP 不能替代 Browser Agent SDK**：它自管一个干净浏览器实例（`list_pages` 只有 `about:blank`），导航到 `docs.craft.do` 直接撞「欢迎来到 Craft / 请确认你的邮箱」登录墙。要登录态只有 Browser Agent SDK 一条路。

### 9.6 第 10 种失效：目标标签页被切到后台 ⇒ 全队列挂死（根因已定位）

10:41 的一次 `goto` 之后，`screenshot / title / url / count / click` 全部本地超时，**连浏览器级的 `user.openTabs()` 也超时**。事后从 `list_windows` 拿到真相：Edge 窗口被最小化，且标题已变成「身份验证成功 | Gemini Code Assist … **和另外 12 个页面**」—— 用户把 Craft 标签页切走了。

结论：**这条通道要求目标标签页处于前台且窗口未最小化**。后台/被遮挡的标签页拿不到合成帧，`screenshot()` 就永久挂起，而扩展的命令队列是串行的，于是一条卡死的截图会拖死整个浏览器通道 —— 表现和「队列挂死」一模一样，但**重启扩展没用，把标签页切回前台才有用**。

判据（省一次误判）：
- 只有 `tab.*` 超时、`browsers.list()` 秒回 → 标签页被回收（见第八节 markHandoff）。
- `tab.*` 与 `user.openTabs()` **同时**超时 → 目标页在后台/窗口最小化，先让用户切回来。
- 两者都超时且切回前台无效 → 才是真的需要重启扩展。

**10:00 复核（把判据收紧）**：卡死 20 分钟后逐层探测，`AG.browsers.list()` 仍然**秒回**（它由 SDK 本地/registry 回答，不进扩展队列），而 `BR.tabs.list()` 与 `BR.tabs.selected()` 全部超时 —— 说明**不是 tab 作用域的节流，而是整条扩展串行队列被队首命令堵死**，任何要往返扩展的命令都出不去。`list_windows` 佐证 Edge 仍是 `isMinimized:true` 且活动标签页不是 Craft。所以恢复动作只有一个：**用户把 Edge 窗口取消最小化并选中 Craft 那个标签页**（卡住的截图会当场完成、队列随即排空）；重启扩展只是把那条命令丢掉，窗口不可见的话截图照样出不来。

附带一条：`computer-use` 的 `activate_window` 对浏览器窗口有 **URL 策略闸门**（`browser_url_policy / insufficient_url_confidence`），最小化状态下拿不到 URL 就直接停掉本轮，所以**不能用它替用户把 Craft 标签页唤回前台**。但 `list_windows` 不受此限，可以用它免费判断"窗口到底可不可见"。

### 9.7 队列卡死期间把 SDK 反射干净了（纯本地，零浏览器调用）

`Object.keys(tab)` 显示 tab 上还有四个**从没被用过**的能力对象：`dom_cua` / `content` / `clipboard` / `dev`。逐个 `String(fn)` 读出的签名：

| 面 | 实测签名 |
|---|---|
| `tab.cua` | `click({x,y})` `double_click({x,y})` `move({x,y})` `scroll({x,y,scrollX,scrollY})` `type({text})` `keypress({keys:[…]})` `drag({path:[{x,y},…]})` |
| `tab.dom_cua` | `get_visible_dom()`（**无参**）`click({node_id})` `double_click({node_id})` `scroll({x,y,node_id?})` `type` `keypress` |
| `tab.ax` | `get(mode='state',options)` `write(mode='state',options)` `click(target,options)` `drag(from,to)` `performSecondaryAction(elementIndex,action)` `pressKey(key)` `scroll(target,direction,pages)` `setValue(elementIndex,value)` `typeText` |
| `tab.playwright` | 额外两个：`elementScreenshot({x,y})`（定点裁剪）、`domSnapshot()`（无参） |
| `tab.content` | `export()` 返回落盘 path、`exportGsuite(type)`、`exportYouTubeTranscript()` |
| `tab.dev` | `logs({filter, levels, limit})` |

三条直接可用的收获：
1. **`cua.keypress` 要数组**：`{ keys: ['Control','k'] }`。之前那次 `keypress('Meta+k')` 参数错误就是这个原因。tab 级还有 `ax.pressKey('Control+k')`（单字符串）。
2. **`dom_cua.click({node_id})` 是第三条点击通路**，按 DOM 节点 id 点，不吃语义树索引，理论上绕开「索引不稠密 / 只对 button 生效」两件事。`get_visible_dom()` 无参，值得在下一个周期单独试一次。
3. **`elementScreenshot({x,y})`** 能量单个元素的图，比整页截图省一个量级字节 —— 后续量弹层/卡片尺寸应该优先用它。

以上已全部写进 Skill（`browser-design-token-harvest` 现 261 行，失败路径表 14 → 22 条，新增 Step 1b「反射完整能力面」）。

### 9.8 本目标剩余项的状态与授权

| 项 | 状态 |
|---|---|
| 搜索面板 | ✅ `ref/search-panel.png`（410086 B） |
| 卡片右键菜单 | 通路已验证（`locator.click({button:'right'})` 实测可用），等标签页回前台 |
| 4 个滚出可视区的设置分区 | 通路已换（`locator.click()` 自动滚动，不再需要 `cua.scroll`），等标签页回前台 |
| 暗色批次 | 已授权（须 `finally` 还原），等标签页回前台 |
| 白板屏 | **已授权"在已有文档里插入白板 → 截图 → 删掉 → 确认复原"**，等标签页回前台 |

### 9.9 根因再修正：**致命的是 `goto`，不是 `screenshot`**（11:05 实测）

用户把 Craft 切成了活动标签页（窗口仍 `isMinimized:true`）后，通道**恢复了**：重新 `openTabs()` + `claimTab()` + `markHandoff()` 之后，`screenshot()` 直接成功返回 400215 字节 —— 说明**窗口最小化时，对"已经画好的页面"截图是完全可以的**。

但紧接着一次 `goto(/all)`（同一个 URL 重新加载）之后，`screenshot()` 立刻永久超时，队列再次全堵。

结论（推翻 9.6 的"后台标签页拿不到帧所以截图挂死"）：
- **不可见窗口里，`screenshot()` 本身没问题**，它拿的是上一次合成的帧。
- **`goto` / 重新加载会让文档失去已有帧**，而不可见窗口不会再产新帧 ⇒ 那条 `screenshot()` 永远等不到 ⇒ 串行队列被拖死。
- 所以操作纪律是：**窗口不可见时严禁 `goto` / `reload` / 任何导航**，只在当前已渲染的页面上做点击 + 截图。需要换屏就先请用户把窗口显示出来。
- 恢复动作也由此改变：卡死后**只要把窗口显示出来，那条挂着的 `screenshot()` 就会当场完成、队列自动排空**（本次实测正是"用户切回 Craft 标签页"后自行恢复的，不是重启扩展的功劳）。

推论：本目标剩下的四项在"窗口不可见"下**仍可做完三项**（卡片右键菜单、设置分区、暗色），因为它们只需要点击，不需要导航；只有白板屏要进文档，必须让窗口可见。

**11:32 复盘：上面这条推论被推翻。** 实测在最小化窗口上对卡片做一次 `locator.click({button:'right'})` 之后，队列**照样死掉**（`count()` 先超时、`click()` 返回 undefined、随后 `screenshot()` 永久超时，静置 10 分钟不自愈）。所以准确说法是：**窗口不可见时，任何会引起重绘的操作（导航、点击改状态、开弹层）都会挂死队列**；只有"对当前已渲染页面做只读 `screenshot()`"是安全的 —— 而这恰恰采不到任何新屏。结论：**本目标剩余四项全部要求 Edge 窗口可见，没有绕法。**

顺带找到一条此前完全没发现的合规入口（不需要用户动手就能显示/隐藏浏览器窗口）：

```js
await BR.capabilities.list();                       // → visibility | viewport | management
const vis = await BR.capabilities.get('visibility');
await vis.get();          // 读当前可见性
await vis.set(true);      // 命令 browser_visibility_set —— 等价于"取消最小化"
```

它比被 `browser_url_policy` 闸门挡死的 computer-use `activate_window` 干净得多，**以后要唤窗口一律先走它**。但这次没能救回来：`visibility.set()` 同样要往返扩展、同样排在被挂死的 `screenshot()` 后面，实测 `set` 与 `get` 一起超时。**队列已经堵死时它是死路；队列活着时它是首选。**

### 9.10 其它两条新实测

- `node_repl` 的 `yield_time_ms` **上限是 60000**，传 90000 直接 `parameter validation failed: params/yield_time_ms must be <= 60000`（不占浏览器预算，但会浪费一个回合）。
- `tab.title()` 在队列已死时会**返回 `undefined`**（不是超时、也不是报错），`JSON.stringify` 会把 `undefined` 键整个丢掉，看起来像"探针没跑"。所以判活**只能用 `screenshot()`**，`title()` 也是假阳性源（此前只把 `url()` 记为假阳性）。

| 项 | 状态 |
|---|---|
| 搜索面板 | ✅ `ref/search-panel.png`（410086 B） |
| 卡片右键菜单 |  通路已验证（`locator.click({button:'right'})` 实测可用），等标签页回前台 |
| 4 个滚出可视区的设置分区 | ⏸ 通路已换（`locator.click()` 自动滚动，不再需要 `cua.scroll`），等标签页回前台 |
| 暗色批次 | ⏸ 已授权（须 `finally` 还原），等标签页回前台 |
| 白板屏 | ⏸ **已授权"在已有文档里插入白板 → 截图 → 删掉 → 确认复原"**，等标签页回前台 |

阻塞原因只有一个：**Craft 标签页在后台 / Edge 窗口最小化**，需要用户手动切回前台（重启扩展对这一类无效）。

## 十、2026-09-26 21:35–21:55 批次：五项全部补齐（已目视核验）

窗口恢复可见后一次跑完。新窗口尺寸 **1910×865 / 867**（CSS 视口 1528×692，`1910 ÷ 1528 = 1.25` 再次成立）。

| 目标项 | 文件 | 字节 | 实测内容 |
|---|---|---|---|
| 项1 搜索面板 | `search-panel.png` | 410086 | 顶部锚定居中模态；搜索框 CSS 高 32；分组「文档」；行＝缩略图 + 标题 + `在<空间名>中` |
| 项2 卡片右键菜单 | `menu-card-context.png` | 402176 | 在新标签页中打开 / 复制链接 / 收藏 / 创建副本 / 移至 / **删除**（红） |
| 项3 白板屏 | `whiteboard-edit.png` | 36813 | 全屏 excalidraw：左上「< 关闭」+「≡」；顶栏 12 工具（选择1 手2 矩形3 菱形4 椭圆5 箭头6 线条7 画笔8 文本A 图片 橡皮 …3D）；提示「要移动画布，请按住 鼠标滚轮 或 空格 同时拖拽鼠标，或使用抓手工具。」；左下 − 100% + 与撤销/重做；右下 ? |
| 项3 附：内联态 | `whiteboard-doc.png` | 88733 | 文档内的大号圆角画布块，选中为蓝框，右上 `···` 把手 |
| 项3 附：块菜单 | `menu-block-whiteboard.png` | 110409 | 打开白板 / 提醒我… / 在上方插入区块 / 在下方插入区块 / 复制区块链接 / **删除** |
| 项3 附：插入面板 | `insert-panel-slash.png` / `insert-panel-filter.png` | 107023 / 93045 | `/` 唤起的插入面板，以及输入「白板」后的过滤态 |
| 项4 暗色①外观 | `dark-settings-appearance.png` | 196547 | 深色卡片带勾选角标 + 蓝描边；强调色 6 个 swatch |
| 项4 暗色②浏览 | `dark-browse.png` | 364687 | `/all` 卡片网格暗色 |
| 项4 暗色③文档 | `dark-doc.png` | 333076 | Craft Handbook 编辑页暗色 |
| 项4 暗色④搜索 | `dark-search.png` | 357473 | 搜索面板暗色 |
| 项4 还原证明 | `theme-restored-system.png` | 260803 | 「系统」重新选中（勾选角标 + 蓝描边），界面回到浅色 |
| 项5 账户设置 | `settings-account.png` | 151185 | 我的账户：名称 / 电子邮件 / 退出登录 / 危险区·删除账户 |
| 项5 团队 | `settings-team.png` | 110651 | 我的团队 + 「创建新团队」 |
| 项5 通知 | `settings-notify.png` | 158043 | 评论和提及 / 提醒 / 每日电子邮件（时间 08:00）/ 空间 |
| 项5 关于 Craft | `settings-about.png` | 162228 | **Craft 3.6.3** 检查更新 / 法律信息（条款和条件·隐私政策·许可证和开源说明）/ 社交媒体（在 X 上关注 @CraftDocs）/ 意见反馈 |
| 项5 附：弹窗初开 | `settings-open.png` / `settings-appearance.png` | 170592 / 212553 | 空间设置默认落地页 / 外观页（浅色态） |

### 10.1 设置弹窗信息架构（实测导航全序）

`空间设置` 入口在 **Ellipsis（`···`）菜单**里，同菜单还有 `导入` / `导出为 Markdown` / `导出为 TextBundle` 三个写入项，按只读纪律全部跳过。弹窗导航分四组：

- **空间设置**：已发布内容 · 标签 · 空间设置
- **常规设置**：外观 · 语言 · 高级设置
- **账户区**（标题是用户名 + 邮箱）：账户设置 · 我的订阅 · 团队 · 集成 · 助手 · 通知
- 底部独立项：**关于 Craft**

### 10.2 白板是「子页面」，不是内联块

`/白板` 插入后，面包屑变成 `How to use Craft / 日记 / 2025/5/5 / 白板` —— 它建了一个**子页面**，文档里那个大圆角块是它的内联视图。**双击内联块**才进入全屏 excalidraw 编辑器。

### 10.3 复原过程与三条实测教训

1. **Craft Web 的 `Ctrl+Z` 撤销不了插入的白板块**（`cua.keypress({keys:['Control','z']})` 连按 3 次，截图字节纹丝不动）。删除必须走块菜单 `···` → 删除。
2. **图标按钮的 `关闭` 用 `getByText('关闭').click()` 不生效**（返回成功但界面没动），改 `cua.click({x:46, y:26})` CSS 坐标才退出全屏。
3. 删掉后 `85701` vs 基线 `85415`，差值只来自侧栏「刚刚」和右栏「已更新: 刚刚」两处时间戳；正文一行未变、`/ 白板` 子页面已从面包屑消失 ⇒ 判定复原成功。**唯一不可逆的是文档的"已更新"时间**，这类残留要在台账里写明。

### 10.4 推翻一条旧结论：9-25 那批设置分区是假基准

`md5sum` 实测 `settings-关于-Craft.png` / `settings-账户设置.png` / `settings-通知.png` / `settings-集成.png` **四个文件字节完全相同**（`17cbac13…`，229579 B）—— 正是「点击静默失效却产出同一张图」那个坑的真实样本。已全部改名加 `_invalid-` 前缀。本节的 4 张新图（字节互不相同且逐张目视确认）才是这 4 个分区的真基准。

### 10.5 本批次新验证的调用面

- 可用：`cua.type({text})`（含中文）、`cua.keypress({keys:['Control','z']})`、`cua.double_click({x,y})`、`cua.click({x,y})`（CSS px，DPR 1.25）、`ax.pressKey('Escape'|'End'|'Enter')`。
- `getByRole('button', { name: 'Ellipsis' })` **匹配不到** —— 图标按钮的可访问名带 ` Icon` 后缀（实际是 `Ellipsis Icon`），且 `(collapsed)` 状态也会进名字。取它只能靠语义树正则 `/(\d+) button (?:\(collapsed\) )?Ellipsis/` + `ax.click(idx)`。
- **窗口可见后，同一个 cell 里连发多个 `locator.click()` 是安全的**（4 个设置分区一个 cell 跑完，字节各不相同）；此前"连发点击必挂"的结论只对 `ax.click(index)` 成立。
- `ax.get()` 连续读会返回 ~349 字节的**空 diff**，里面没有任何未变化元素，正则取不到索引；要新索引必须 `goto` 刷全量树（窗口可见时 `goto` 安全）。

## 十一、P2 接线决策（2026-09-26）

- `--editor-*` 10 色与 `--editor-gradient-*` 5 组已按 `tokens-css-assets.md` 全量落入 `globals.css`（light/dark 双块）。
- `--highlight-*` 改为 `color-mix(in srgb, var(--editor-*) N%, transparent)` 派生（light 20–26%、dark 28–32%），mark 规则扩到官方 10 名；legacy `yellow/pink/blue` 保留为别名（yellow 为 markdown `==…==` 默认色，官方无黄色 token，记为偏差）。
- 格式 tab 文本色 10 圆点换成官方 10 色 hex（内容存 hex，不存 var）。
- 5 组渐变接入 washi 胶带（sunset/ocean/forest/candy/aurora → orange/blue/gold/pink/purple）。
- 编辑器正文行高 1.7 → **1.5**：官方正文段落多为单行、像素行距无法定档（ref-editor 仅 5 个文本簇）；依据 goal 给定官方值 ~1.2/1.5 与壳 token 族（15.6/13=1.2、19.2/16=1.2）定档。
