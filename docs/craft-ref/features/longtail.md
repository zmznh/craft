# Craft.do 长尾功能面（从 i18n 命名空间反推的 10 个未成轴功能）

来源：`_harvest/i18n-zh.tsv`（4019 条官方简体中文文案）按命名空间做**覆盖度审计**后，挑出此前 A–T 采集轴没成轴、但文案量足以证明是完整功能的部分。文案即状态机：每条 toast / 空态 / 错误态背后是一个可观测状态。

置信度标记：`✓`=指纹验证过；`~`=静态证据充分、行为未验；`?`=推断。本文件全部是 `~`（零浏览器成本，未做动态验证）。

## 1. Idea Starter —— AI「你想从什么开始？」（44 条）

**这不是普通 AI 按钮，是一个带类型选择的文档生成流程。**

| 面 | 官方事实 | 证据键 |
|---|---|---|
| 入口 | 弹层标题「你想从什么开始？」，副标题「我们知道空白页面让人无从下手。描述你的需求，我们来帮你搭建结构。」 | `ideastarter.popup.title/subtitle` |
| 输入 | 单个自由文本框，占位「描述你想创建的内容…」+ 创建 / 关闭 两个动作 | `ideastarter.popup.placeholder/create/close` |
| 建议类型 | **6 种**：博客文章(guide)、任务清单(list)、会议记录(meeting)、项目文档(project)、旅行计划(travel)、头脑风暴(weekly) | `ideastarter.suggestion.*` |
| 进度反馈 | **每种类型 4 条独立进度文案**，共 6×4 + default 4 条；标题模板 `正在创建[0]` | `ideastarter.loading.<type>.0-3` |
| 结果 | 成功 toast「文档已创建！」；失败 toast 标题+副标题两段「无法创建文档 / 请重试」 | `ideastarter.toast.*` |

关键设计事实：进度文案**按类型定制**（travel 走"规划行程→添加目的地部分→创建行李清单→规划旅程"，meeting 走"创建议程→添加讨论部分→整理行动事项→准备模板"），即 **AI 生成的中间态是可命名的阶段**，不是通用 spinner。本地若只做一个"生成中…"就丢掉了这层反馈。

## 2. 发布页分析 Analytics（29 条）

独立功能屏，作用对象是**已分享链接**而非文档本身：

- 指标：`读者`、`位读者在过去 30 天内查看了此链接`、`平均阅读时间`、`来源`（含 `直接 / 无`、`其他`）、设备维度 `桌面端 / 移动端 / 平板电脑`。
- 状态：`还没有数据`（新发布）、`没有可用数据`、`无法加载数据，请检查你的网络连接。`
- 动作：`刷新` / `刷新数据` / `打开分析指南` / `[0] 分析`。
- 归属对象文案 `共享文档` ⇒ 分析面板挂在分享设置里。

本地 gap：`DocumentShare` 只有开关 + 口令，**无任何统计面**。

## 3. 文档统计 Stats（10 条，含付费墙）

维度 = `字数 / 字符数 / 不包括空格 / 区块 / 阅读时间`；作用域三档 = `这一页 / 完整文档 / 选择`。
付费墙文案：`字数、字符数、区块数量及阅读时间统计仅对 Plus 订阅用户开放。`（`stats.try.pro.text`）

⇒ 官方把统计做成**可切作用域的六维面板**，且是 Plus 卖点。本地 InfoTab 只有字数。

## 4. 活动 / 版本流 Activity（12 条）

`动态` 面板：`目前显示过去 [0] 天。` + `[0] 项变更` + `较早` 分组 + 空态 `还没有任何保存的版本。`
**`activity.changes.x.*` 展开了 CLDR 全部六档复数**（`.zero/.one/.two/.few/.many/.other`，中文只填 one/other）。

⇒ 与 V4 动态采到的「查看备份 → 历史版本面板（变更计数 + 昨天/较早分组 + 30/180 天付费墙）」是同一功能的两个入口。

## 5. 应用更新 Update（18 条）

完整更新生命周期：`检查更新 → 正在检查更新 → 暂无更新 / 有可用更新 → 正在下载更新 → 立即更新 / 提醒我…（10 分钟后 / 30 分钟后 / 1 小时后）`；另有 `强制` / `强制更新` / `需要更新` 三档强度，以及网页版专属 `请刷新页面以获取最新版本的应用。` 与 `有可用更新` 横幅。

⇒ 官方有**可延迟的更新提醒 + 强制更新**两套策略。本地 PWA 只有 `sw.js` 静默缓存，无更新提示。

## 6. 白板：两代格式与资源上限（15 条）

- **两代白板格式并存且需显式升级**：旧块文案 `此区块包含最新版本中可用的新白板区块的重要元数据。请更新你的应用以查看它。`；升级流 = `更新白板` 头部 + `我们改进了白板的使用体验。点击下方即可在新版本中继续。别担心，你的原始版本会保持不变。` + 按钮 `创建新版本` + 失败态 `白板升级失败`。
- 副本语义：`此白板是一个副本。编辑此白板也会更新原始版本。` ⇒ **白板副本是引用而非快照**（与文档副本行为相反）。
- 上限：`你最多只能添加 [0] 个元素。`、`你最多只能上传 [0] 张图片。`
- 上传失败分两条通路：图片（`图片上传失败。请刷新页面后重试。`）与视频（`视频上传失败`）；预览失败 `无法生成预览`。
- 灰度：`白板目前处于封闭测试阶段，仅供有限的用户使用。`

⇒ 本地 `whiteboard` 只有一代表单。**副本=引用**这条与文档副本的直觉相反，必须显式建模。

## 7. 每日笔记 Daily Note（8 条）

`创建新的每日笔记` / `每日笔记` / `后一天` / `前一天` 翻页 + 时间戳两态 `已更新 [0]` 与 **`离线更新于 [0]`**（离线写入的可见标记）。快捷键 `⌘⌥N`（`keyboard.md` 表 C）。

⇒ 有**日期前后翻页**导航；离线条目要显示"离线更新于"，本地 `draft-store` 只在编辑器内提示。

## 8. Web Clipper 是外部浏览器扩展（2 条 + 版本介绍）

`alert.error.extension.not.installed = Craft Web Clipper 未安装`、`onboarding.v326.intro.clipper.* = Web Clipper 更新 / 将你的研究直接放入你的文档或每日笔记中。`、`v319.intro.* = 标签、网页剪藏器、安卓移动网页`。

⇒ 剪藏功能本体在扩展里，**网页端只负责"未安装"引导**；剪藏目标可以是文档或每日笔记。复刻范围里应记为"外部依赖，仅做未安装引导"，不要当成缺失功能去自研。

## 9. 评论与协同的文案级规格（`web.collab.*`，24 条）

这批文案直接把评论交互写死了，等价于一次动态采集：

| 事实 | 证据 |
|---|---|
| 评论框：**Enter 发送**、**Shift+Enter 换行** | `web.collab.comment.hint.send.comment` / `.new.line` |
| 评论框支持 `:` 表情补全（提示语本身用 `[0]` 占位符渲染出真实的触发字符） | `web.collab.comment.hint.emoji` |
| 评论框支持 `@` 提及 | `web.collab.comment.hint.mention` |
| 表情回应（reaction）有 1 / 2 / N 三种聚合句式，且带"谁加了什么表情"两形态 | `web.collab.reacted.*` |
| 解决状态变更要显示操作人：`[0] 标记为已解决 / 未解决` | `web.collab.x.resolved` / `.unresolved` |
| **访问请求流**：`[0] 想要编辑` / `[0] 想要查看文档"[1]"` ⇒ viewer 可发起权限升级请求 | `web.collab.someone.want.to.edit/.read` |
| 分享权限是**整篇文档级**，不是块级：`你对谁可以查看或编辑所做的任何更改都将应用于整个 [0] 文档。` | `web.collab.share.document.warning` |

**i18n 内联标记语言**（新发现的内容模型事实）：官方字符串里直接嵌 `<highlight>` `<username>` `<emojiwrapper>` `<name>` `<strong>` `<formattedlink>` 标签，由客户端解析成带样式的 run。⇒ 通知/评论这类富文本提示不是 React 组件拼装，而是**带标签的本地化字符串**；复刻若用纯文本拼接，跨语言会错位。

## 10. 错误与诊断面（`web.error.*`）

`你使用的是测试版本，没有访问权限。`、`此应用仅供测试使用。请从 [链接] 下载最新版本或重新启动应用并使用其他帐户登录。`、`你认为你公司的防火墙阻止了 Craft 吗？`、以及按平台分叉的 `报告同步错误`（`commands.help.report.sync` / `.web.sync.error` / `.windows.sync.error`）。

⇒ 官方对**网络受阻/防火墙**有专门提示分支（与 `features.md` 技术栈里 4 个 ws 端点相呼应），本地无任何同步失败诊断入口。

## 覆盖度审计结论

按命名空间文案数排序，全部 ≥8 条的 45 个命名空间在 9 份交付文档里都有落点，无"整块为零"的区域；本轮新增的是上面这 10 个**此前只存在于 `feature-catalog.md` 原始串表里、没被写成规格**的功能面。`country`(261) 与 `unit`(79) 是地区/单位枚举（时区与日期格式设置的数据源），不是功能。

## 仍未采到

- Idea Starter 的真实入口位置（新建文档时？侧栏？AI 面板内？）与 6 种建议是否随订阅档位变化 —— 未做动态验证。
- Analytics 的数据字段（是否含趋势图、按来源分组粒度）只有文案，无界面几何。
- 白板元素/图片上限的**具体数字**（`[0]` 占位符值来自远端配置，bundle 里没有常量）。
- 表情回应是否与文档块共存（`reacted` 文案只出现在 `web.collab.*`，未确认块级反应）。
- 访问请求流（想要编辑/想要查看）在网页版是否可用（`web.*` 命名空间是 webapp 与桌面共用的可能性存在）。
- `update.*` 的强制更新触发条件（版本号从哪个接口下发）。


---

# 追加批次（2026-09-27 第 12 命名空间批）：§2 之外此前未成的 7 面

> 与 §1–§10 同源（`_harvest/i18n-zh.tsv` 4019 条），本批全部 `~`（静态证据充分、行为未验）。**注意**：分析屏已在 §2 成轴，本批不重复，只补一条 §2 没记的门禁粒度。

## 11. Sign in with Craft（`login.*` 9 条）—— Craft 作为身份提供方

`login.start.sign.in.with.craft`「使用 Craft 登录以继续前往 [0]」、`login.auth.signing.in.to`「正在登录 [0]」、`login.auth.greeting.welcome`「欢迎，[0]」与 `login.auth.greeting.sorry`「很抱歉，[0]」（**同一身份两种问候 ⇒ 有"是成员/不是成员"分支**）、`login.auth.success.message` + `login.auth.success.close`「你现在可以关闭此窗口了。」（**popup 窗口的铁证**）、`login.error.heading`「出了点问题」。

配套的错误与进行时串散在三个命名空间，合起来才是完整登录态机：`checking.your.account`「正在检查账号…」、`switching.account`「正在切换账号…」、`wrong.account`「账号错误」+ `wrong.account.signed.in.as`「当前登录账号为 {{currentEmail}}，但…」（**又一处 `{{var}}` 原生插值**）、`couldnt.add.members.to.space` / `couldnt.start.trial`（两句专错）。

⇒ 与 `assistant.md` §十 的 Imagine 接入中心方向相反：那是"外部 API 接进 Craft"，这是"Craft 身份接出到第三方"。本地完全没有这一面。

## 12. 访客与批量操作的权限后果（`guest.*` / `marking.*` / `duplicated.*`）

- `guest.warning.desc`「你确定吗？你即将邀请一位非团队成员的用户。**访客可以访问整个空间并更新任何文档。**」⇒ **权限模型第四轴：团队内成员 vs 非成员访客**，且访客默认**全空间可写**；官方把它做成带后果句的确认框（R21 第 5 例）。
- `marking.document.as`「将文档标记为 [0]」（one/other 两键，R25）+ `star.*` 4 条 + `annotate`「标注」+ `unstar`/`unstarred` ⇒ "标记"是一族动作而不只是收藏。
- `duplicated.x.documents`「已复制 [0] 个文档」⇒ **批量复制有结果回执**（与 V27 批量删除的「删除 N 个项目」同构）。
- `invited.by.invitorname`「{{invitorName}} 邀请」。

## 13. 空间设置与账号切换（`spaceSettings.*` 8 + `spaces.*` 3 + `accountselector.*` 3）

- **`spaceSettings.move.space.to.another.team`「将此空间移至另一个团队」** ⇒ 空间可跨团队迁移，此前 16 批都没采到这条能力。
- `spaceSettings.enter.space.name`「输入你的空间名称。」是**校验句而非占位符**；`space.name.updated` / `space.avatar.updated` 是 R22 三件套的两例。
- `spaceSettings.one.invite.deleted`「已删除 1 个邀请」与 `spaceSettings.x.invites.deleted`「已删除 {{deletedCount}} 个邀请」⇒ **官方存在两套插值语法并存**（`[0]` 位置插值 vs i18next `{{var}}`），`team.md` §一 原记"三套占位符"要改记四套。
- 切换器三分：`accountselector.my.spaces` / `shared.spaces` / `shared.with.me` ⇒ 顶栏空间切换器是**三个列表**，本地只有一个空间概念。
- `getting.your.space.ready`「正在准备空间…」⇒ 首登建空间有独立加载态。

## 14. 备份恢复的语义（`backup.*` 4 + `snapshot.*` 2）

`backup.version.to.restore`（V4 屏上已见）→ `backup.document.restored`「文档已恢复」→ `backup.go.to.restored.document`「**转至已恢复的文档**」；失败侧 `snapshot.cannot.restore.document`；`backup.snapshot.of`「快照 」（带尾空格的片段键，与 `team.md` part1/2/3 同族）。

⇒ **"转至已恢复的文档"证明恢复是产出新文档再导航，不是就地回滚** —— 直接决定本地 `VersionDialog` 的实现语义（G230）。

## 15. 搜索与输入的两个模式（`smart.search` / `regexp` / `freeform` / `checklist`）

`smart.search`「智能搜索」+ `regexp`「正则表达式」+ `freeform`「自由形式」⇒ **查找/搜索有模式切换**（本地只有单一匹配）；`checklist.complete`「完成此清单，充分利用你的 Craft 文档。」⇒ **onboarding 是一个可勾选清单**（与 `tipsandtricks.*` 三分入门/共享/PDF 导出 并列的第二个引导体系）；`need.some.inspiration.our.ai.assistant` 是空文档处的 AI 引导句。

## 16. 平台与集成侧角（`sharesheet.*` / `quit.craft` / `tooltip.redirect.to.beta.environment` / `blockdetailsios.*` / `subcription.file.upload.limit`）

- `sharesheet.save.opencraft.action`「打开 Craft」⇒ **macOS 系统分享扩展**（Save to Craft）存在。
- `quit.craft`「退出 Craft」⇒ 桌面菜单项；`whats.new.on.web.and.windows`「Web 和 Windows 版最新特性」⇒ **官方明确有 Windows 桌面端**。
- `tooltip.redirect.to.beta.environment`「我们将自动将你跳转到 Craft Beta 环境。」⇒ 有 Beta 通道与自动跳转偏好（与 `preferences.automatic.beta.redirect` 成对）。
- `tooltip.toggle.comments.sidebar.visibility`「切换评论侧边栏可见性」⇒ 评论侧栏是**可切换的独立栏**，不是弹层。
- `subcription.file.upload.limit`「文件上传限制」⇒ **单文件大小上限在 UI 里有正式名字**（`plans.md` §二 那条未解的远端值就挂在这里）。
- `blockdetailsios.export.pdf.paper.dynamic`「动态」⇒ PDF 纸张三档（A4 / 信纸 / **动态**）。

## 17. 分析门禁粒度（补 §2 一条）

`analytics.upgrade.to.unlock`「升级到 Plus 即可解锁 [0] 文档背后的详细统计信息。」——**插值的是文档名** ⇒ 分析付费墙是**逐共享文档判定**，不是空间级开关。

## 18. 覆盖度审计收尾裁决（剩余 74 命名空间 / 81 条）

`_harvest/coverage-audit.mjs` 在排除 `country`(261) 与 `unit`(79) 两组地区本地化数据后，仍列 74 个"未点名"命名空间。逐条看样本后的裁决：

| 类别 | 命名空间 | 裁决 |
|---|---|---|
| 已在 §11–§17 成轴，只是审计脚本按"反引号 + 命名空间 + 点"的字面格式匹配，而本文件正文把键名写成了裸文本 | login, wrong, switching, checking, couldnt, guest, marking, duplicated, invited, spaceSettings, spaces, accountselector, backup, snapshot, smart, regexp, freeform, checklist, need, sharesheet, quit, tooltip, blockdetailsios, subcription, lets, welcome, getting, info, star, unstar, unstarred, unsorted, untitled, moveto, present, deselect, weeklyPlan, kanban_no_group_property, qrcode, trash, whats, tipsandtricks, undo, redo, userinterface | **已覆盖**（本批正文里都有；审计的匹配法是格式敏感而非语义） |
| CLDR 局部数据（星期/时长单位/序数），不是功能 | monday, mondays, tuesday, tuesdays, wednesday, wednesdays, thursday, thursdays, friday, fridays, saturday, saturdays, sunday, sundays, hours, minutes, seconds, months, weeks, month, week, year, years, first, after, day | **显式排除**：与 `country`/`unit` 同类，属本地化数据，不是功能面 |
| 通用词表（单句 UI 原子词，宿主散在各屏） | annotate, aspect, attachments, btn, configure, cut, deleted, done, emojis, expires, exporting, importing, icon, less, location, optional, pending, previews, properties, recents, subject, switching(已归上), unknown, unlimited, unpublish, uploads, url, visit, always, another, centralized, comma, creating, filter, match, organize, pages, quit(已归上), repeat, relevance, send, sending, setting, setting, sharesheet(已归上), skip, starting, success, supported, try, upgrade, value, video, want, yes, x15 | **不单独成轴**：这些是单词级标签，已随宿主屏记录（导出/导入/发布/配额/筛选等各自轴内） |

## 19. `onboarding.*` 138 条逐条重读（2026-09-27 第 19 批；此前全库仅 1 处提及 ⇒ 真缺口）

### 19.1 ★ 官方 onboarding 是**版本化的更新轮播**，不是线性教程

命名空间里按版本分层堆积：`onboarding.v3.intro.{1,2,3,4}` · `onboarding.v326.intro.{1,4,5,clipper,weekly}` · `onboarding.v330.intro.{1,2,3,4}` —— **版本号直接进 key 名**（`v326` = 3.26、`v330` = 3.30），每版 4–5 屏 `{n}.title` + `{n}.content`，且**旧版不删**。
⇒ 复刻时这不是"一个欢迎流程"，而是**一个按版本累积的 changelog 轮播系统**（需要版本键 + 展示时机 + 已读记录）。此前 `settings.md` 记的"onboarding checklist"只是其中一环。

### 19.2 认证渠道共 **6 种**（此前只记了 3 种）

`continue.email.lowercase` 邮箱 · `continue.sso` / `continue.with.sso` **SSO** · `continue.with.apple` Apple · `continue.with.google` Google · `continue.with.microsoft` Microsoft（+ 专句 `logged.in.to.microsoft`「你已使用 [0] 登录 Microsoft」）· **`sign.in.with.setapp`「使用 Setapp 登录」**
⇒ 另有 `sign.in.on.web`「在 Web 上登录」、`dont.have.the.app`「还没有该应用？」+ `install.craft`「安装 Craft」（与 G239 网页↔桌面选择器互证 ✓）、`please.sign.in.to.continue`、`access.this.document.need.to.sign.in`（**共享文档可要求登录**）。

### 19.3 邮箱变更是一条独立五态子流程

`email.change.confirm.email`「请确认你的新电子邮件以继续。」→ `sending.code`「正在发送你的激活码…」→ `code.confirm.title`「请输入发送至以下邮箱的验证码」+ `code.confirm.issue.question`「没有收到邮件？」+ `code.confirm.issue.suggestion`「检查垃圾邮件文件夹」→ `confirming.email.change`「正在确认电子邮件变更…」→ `email.changed` / `could.not.complete.email.change`
⇒ **成功句 + 进行时 + 失败句 + 未收码救济句齐备**（R22 时序三句的完整实例）。注册还要 `page.name.firstname` / `page.name.lastname`。

### 19.4 兴趣选择 → 灌对应模板（8 档）

`document.popup.title`「真实体验 Craft」+ `document.popup.desc`「选择你感兴趣的事物：」+ `select.one`「选择一项开始」，8 个兴趣：`interests.{books 书单, finances 理财, habit 习惯追踪, project 项目跟踪, story 故事策划, student 学生空间, todo 待办事项清单, travel 旅行}`
⇒ **onboarding 的产物是"按兴趣建模板文档"**，与 `tags-browse.md` 的模板子系统（模板来源是特殊文件夹）接上。
另有 `insert.panel.{first,second,third}.task`「第一个/第二个/第三个任务」⇒ **插入面板自带三步引导任务**。

### 19.5 从 onboarding 文案里掉出来的**产品事实**（别处没记）

| 事实 | 证据 |
|---|---|
| ★ **存在"周套餐"** | `v326.intro.weekly.button`「以每周 [0] 试用」+ `weekly.title`「无限畅享 Craft」+ `weekly.content`「千万别错过我们的每周套餐优惠！」⇒ 与 §六之二 的 `plan.weekly` 互证 ✓（**Craft 有 weekly billing**，此前只记了月/年/席位） |
| **折扣率是远端参数** | `v326.intro.5.content` 把折扣**写死成「6 折」**，而 `…5.content.amount` 是「[0]% 优惠」、`…content.weekly.amount` 是「周套餐 [0]% 折扣」⇒ **同一句的"写死版"与"参数版"并存**（又一类官方不一致；参数版才是现行） |
| **AI 额度随订阅附带** | `v330.intro.3.smarter.ai.assistant.content`「**AI 额度已添加到你的订阅中**」⇒ 与 `assistant.aiCreditsAvailable`「[0] AI 积分可用」互证，credits 是订阅属性而非独立商品 |
| **Web Clipper 是独立产品线** | `v326.intro.clipper.title`「Web Clipper 更新」+ content「将你的研究直接放入你的文档或每日笔记中」 |
| **Android 测试版 + 离线模式** | `v330.intro.2.android.title`「Android 应用测试版」+ content 明写"支持无缝同步，并且现在还加入了**离线模式**" |
| **100+ 预设样式** | `v3.intro.3.content`「从 **100 多种预设样式**中选择，或用涂鸦、和纸胶带、纸张和文字颜色打造你自己的风格」⇒ `styles.md` 此前没有样式数量的官方口径 |
| **营销站导航也在这个命名空间** | `menu.{blog,community,download,help.and.support,pricing,product,reddit,slack,whats.new,writing,youtube}` 各带 `.desc` ⇒ **`onboarding.*` 同时服务官网导航栏**，读它时要区分"app 内引导"与"站外营销"两类宿主 |

## 20. 覆盖率审计的校准结论（2026-09-27，对 §18 裁决的重要修正）

逐条 key 审计（46.7%）跑完后人工复核，**榜首五个命名空间里只有两个是真缺口**：

| 命名空间 | 审计显示 | 复核结论 |
|---|---|---|
| `assistant` 217 未覆盖 | 23% | **100% 假缺口** —— `assistant.md` §一/§二 已有「13 个上下文作用域 → 动作集」的权威分派、§八 已有 35 条提示库与 `{0}`/`[0]` 占位符区别，**按聚合记录而非逐条引用** |
| `teamsettings` 136 | 28% | **大部分假缺口** —— §二–§六 已覆盖 DNS 状态机/订阅三态/成员成败句；真增量只有 6 条（已补 `team.md` §六之二） |
| `alert` 111 | 56% | 已真读（`dialogs.md` §八），剩余多为同族变体 |
| **`subscription` 276** | 17% | **真缺口** —— `plans.md` 全库只引 2 条键；子族 upgrade 54 / create 18 / paywall 13 / churn 12 / discount 11 / invite 10 / unlimited 9 / processing 8 / trial 5 / price 5 |
| **`onboarding` 135** | 2% | **真缺口** —— 全库仅 1 处提及；本批已结案（§19） |

⇒ **方法论**：覆盖率指标对"按聚合方式记录的命名空间"系统性低估。用它排榜之后**必须做一次"聚合已覆盖 / 真没读"的人工二分**，否则预算会浪费在已采过的面上（本轮我就差点把 `assistant` 的作用域维度重新写一遍）。

## 21. 第 19 批（onboarding）仍未采到

1. **更新轮播的展示机制**：`v3` / `v326` / `v330` 三版轮播**什么时候弹、弹哪一版、已读状态存哪**（文案齐但触发条件未证）。
2. **兴趣 → 模板的映射表**：8 个 `interests.*` 各自灌什么文档/模板（需实际走完 onboarding 或在 bundle 里找映射常量）。
3. **`insert.panel.{first,second,third}.task` 的宿主**：这三条引导任务出现在插入面板的哪个位置、点完产生什么。
4. **周套餐的价格与周期语义**：`[0]` 是远端参数，数值未采；weekly 与 per-seat 能否叠加未知。
5. **Setapp / SSO 两条渠道的实际入口形态**（`sign.in.with.setapp` 是按钮还是深链；SSO 是否要求先输邮箱域）。
6. **`onboarding.menu.*` 官网导航与 app 内引导的宿主边界**：同一命名空间服务两类界面，未逐条区分。
7. **`subscription.*` 276 条**（本批鉴定为**下一个真缺口**，尚未开挖）：upgrade 54 / paywall 13 / churn 12 / discount 11 / trial 5 等子族。

## 22. 第 23 批：只存在于代码里的功能面（静态，`js/` chunk 级挖掘）

连接器第 12 次卡死（`browsers.list()` 7ms 正常、`tabs.list()` 20s 本地超时），本批零浏览器预算。工具：`_harvest/findwin.mjs`（有界窗口提取）、`_harvest/defs.mjs`（按符号名取定义）、`_harvest/chunkkeys.mjs`（chunk → i18n 键直方图）。

### 22.1 ★ 内置小游戏「CRAFT BREAKER」（`js/EasterEgg-*.js` 29 KB + `EasterEgg.css`）

`Te.lazy(() => import("./EasterEgg-…"))` —— 独立路由级组件、独立 CSS chunk。从字面量还原出的完整规格：

- 标题与提示串（**全大写硬编码，未本地化**）：`CRAFT BREAKER` / `CLICK OR PRESS SPACE TO START` / `MOUSE OR ARROW KEYS: MOVE PADDLE` / `ESC: QUIT` / `SPACE: NEXT LEVEL    ESC: QUIT`。
- **事件名表**（打点用）：`ball_launch` / `wall_hit` / `paddle_hit` / `brick_destroy` / `ball_drop` / `level_complete`。
- 游戏状态至少两档：`playing` / `suspended`。
- 渲染：`canvas` + **WebGL**（着色器属性 `a_position` / `u_time` / `u_resolution` / `u_barrel`，含 `highpass` / `square` / `triangle` 一档波形参数 ⇒ 有后期效果），形状 `square`，配色为蓝紫渐变系（`rgb(38, 67, 138)` / `rgb(83, 67, 155)`）与暗底 `rgb(26, 28, 30)`。
- CRT 开机/关机动画：类名 `easter-egg-crt-on` / `easter-egg-crt-off`。
- 操作：**鼠标或 ←/→ 移动挡板**、**空格开始 / 过关**、**ESC 退出**，关卡制（`level_complete` + `NEXT LEVEL`）。
- 文件内有一个 UUID 常量 `<objId:14>`（在本 chunk 内自洽，index 中不出现 ⇒ **不是入口 id**，更像资源或会话标识）。

⇒ **入口仍未证**（无任何 ⌘K/菜单文案指向它），但"存在完整的关卡制打砖块 + WebGL 后期 + CRT 转场"是硬事实。这类功能**目视逛界面永远采不到**。

### 22.2 浏览器不兼容拦截（`js/IncompatibleBrowserCheck-*.js` 8.4 KB）

4 个 i18n 键即全部行为：`browser.not.compatible`（拦截文案）、`browse.best.experience.browsers`（推荐浏览器列表句）、`use.craft.anyways`（**允许强行继续**）、`not.show.this.again`（**可永久关闭该提示**）。⇒ 是"可绕过的警告"而非硬拦截，且"不再显示"是一个**持久化偏好**（本地需找对应存储位）。

### 22.3 搜索是**服务端 4 个 PUT 端点**，且入参是**词项数组 + 作用域**（`js/index-*.js` @966585 附近）

```
base + "/search-flexi/space/v1"
  PUT /search               {spaceId, scope, terms}      → .items
  PUT /document-highlights  {spaceId, documentId, terms} → .items
  (+ tagStats / searchBlock 两个同族 queryKey)
错误映射：401|403 → AccessDeniedError；document-highlights 另有 404 → NotFound
```

- `terms` **复数** ⇒ 客户端分词后传词项列表，不是把原始串丢给后端；
- `scope` 是一等参数 ⇒ `search-scope-preference` 这个本地缓存键的值会**随请求上行**；
- `getDocumentHighlights` 存在 ⇒ **结果页里的命中高亮是二次请求按文档取的**，不是一次搜索响应自带（解释"结果分组 + 逐文档展开"的两段式手感）；
- 用 `PUT` 而非 `GET` 做查询（同一份代码里 `postJson(..., {method:"PUT"})`）；
- 附近常量 `git = 20` 与分组函数 `bit()`（按谓词把结果分桶并给出 `{label, results, offset}`）⇒ **分组分页游标**在此层，与 `browse.see.more.results` / `show.x.more` 文案对上。

### 22.4 图片灯箱是**全局 store 驱动 + 命中即预取**

`GZn = We(Ms, t => t.craftLightboxData)` 配 `useEffect(() => { if (data) lazyChunk.preload() })` ⇒ 灯箱状态挂在**全局 store 字段 `craftLightboxData`**上（不是组件局部态），并且**一有数据就预取 chunk**。灯箱本身**不含任何 i18n 键**（无标题、无按钮文案）⇒ 纯查看器。外层是 `position:absolute; inset:0; width/height:100%` 的容器。

### 22.5 顺带确认的懒加载边界（有独立 chunk 与 CSS，说明是"重"功能）

`Playground`（自带 CSS，无任何 i18n 键 ⇒ 疑为开发/演示屏，用途未证）、`MoveToFolderDialog`、`SubscriptionCheckoutStartedPopup`、`AiGeneratedDocumentImportPopup`、`PreferencesPanelWithProfilePicture`、`FloatingThreadWindow`、`RenderOptionsPanel`（白板导出选项，含 `.utils` 伴生 chunk）。

### 22.6 覆盖率仪器的第二次校准：**命名覆盖 ≠ 行为覆盖**

把 89 个非 vendor chunk 名与 25 份文档做全文交叉：**87 个已被点到名字，只有 2 个从未出现**（`CraftLightboxContent`、`PreferencesPanelWithProfilePicture`）。但本批恰恰是在"名字早已出现过"的 `EasterEgg` / `SyncLogTab` / `BrowseSyncTab` 里第一次挖出行为规格。⇒ **chunk 名单不是缺口清单**；真正有效的问法是"这个 chunk 里的字面量与状态机有没有进文档"。与 §20（i18n 键覆盖率 48.8%）同一条教训：**任何"按名字算覆盖"的指标都会高估完成度**。

## 23. 第 23 批仍未采到

- `EasterEgg` 的**触发入口**（键盘序列？点版本戳？URL 参数？）。
- `Playground` 到底是什么屏（无文案可推断）。
- `browse.best.experience.browsers` 的实际浏览器名单（文案键已见，中文串未落到本地）。
- `not.show.this.again` 的持久化位置（7 个 `CACHE_KEY` 里没有它 ⇒ 可能在另一套存储键下）。
- `/search-flexi/space/v1/tag-stats`、`/search-block` 两个端点的路径与入参（只见到 queryKey 构造器，函数体未展开）。
- `terms` 的**分词规则**（客户端在哪一步切词、是否去停用词）。

## 24. 第 41 批：★ 白板与嵌入的架构（`js/WhiteboardFocusMode-*.js` 3.1 KB + `js/ExcalidrawPreview-*.js` 5 KB，全部字面量可读）

此前"白板"只在别的轴里被顺带点名（插入面板 1 项、`whiteboard.*` 键、离线禁创建），**架构级从未成文**。两个小 chunk 一次读完 ⇒ 三条结论。

### 1. ★ 白板在实现上就是「链接预览」的一种 —— 一个 iframe

```jsx
<iframe title="Whiteboard"
        className={link_preview["link-preview__embed-frame"]}   ← ★ 复用链接预览的样式类
        width="100%" height="100%" src={s} loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; web-share; fullscreen"
        allowFullScreen />
```
- URL 来源链：`block.url.url` → `j(U)` 解析 → **`P(smartLinkData, block, parsedUrl, spaceId)`** ⇒ ★ **白板是 smartLink 的一个消费者**（与 §一之八 里 `rawProperties.smartLinkData` / `smartLinkLastSyncTimestamp` 两字段对上）。
- **宿主向 iframe 传状态只靠改 URL 参数**：`searchParams.set("colorMode", isDarkMode ? "dark" : "light")` + `searchParams.set("isGuest", isGuest ? "true" : "false")`。
- ⇒ ★ **该 chunk 内没有任何出站 `postMessage`** ⇒ **主题或访客身份变化 = `src` 变 = iframe 重新加载**（不是热更新）。本地复刻若用 `postMessage` 通知主题就与官方行为不同（官方是重载）。
- 容器样式（专注模式自己重设外壳）：`width: calc(100vw - 16px)`、`height: calc(100vh - var(--header-height,0) - 7px)`、`box-shadow: theme.shadows.xs`、`--card-background: theme.colors.base[900]`、**`--header-height: <常量>px` 且带一个 `@media` 分支再给一个值** ⇒ 与 `tokens.md` 的 `--header-height` 双取值（默认/pointer:fine）对上。

### 2. 入站 postMessage 协议（4 类，带 origin 白名单）

```js
const origin = new URL(src)?.origin;
onMessage = e => { if (e.origin === origin) dispatch(e.data) }   ← ★ 只信同源
dispatch(msg) switch (msg.type) {
  undefined:                    忽略
  "callAnalytics":              analytics(msg.event)                          ← iframe 转发埋点
  "showToastNotification":      flashMessage({type,title,subTitle}, 3000, …)   ← ★ iframe 可让宿主弹 toast，固定 3 秒
  default:                      logger().warn("UnexpectedWhiteboardMessage", msg.type, devDetailFromError(msg))
}
```
⇒ 三条可复刻约定：① **origin 必须逐条比对**（不是 `*`）；② **未知消息类型是 `warn` 级 + `devDetailFromError` 带上下文**（不是抛错）；③ **通知时长常量是 3000ms**。监听用 `AbortController.signal` 注册、卸载时 `cleanupAll()`。

### 3. ★ 文档内的白板预览是「导出成图」，不是第二个编辑器（`ExcalidrawPreview`）

- 三态机 `"loading" | "ready" | "error"`；失败 `logger().error("GenerateExcalidrawPreview", …)` 并置 `"error"`。
- 渲染管线：`exportToSvg/Canvas({ getDimensions, elements, files: scene.assets ?? null, exportPadding: 32, appState: { exportBackground: false, exportWithDarkMode: isDark } })` → `replaceChildren(blob)`
  ⇒ ★ **`exportPadding: 32`、无背景导出、跟随暗色模式导出**三条是硬编码常量。
- **`getDimensions(w,h)` = 等比 contain**：`min(容器宽 × 基准 / w, 容器高 × 基准 / h)` ⇒ 不是 cover、不裁剪。
- ★ **重绘四重门控**：`if (!isTabVisible || blockEditorActive || scene.state !== "ready" || sizePending) return` ⇒ **只在标签页可见、没有块处于编辑态、数据 ready、尺寸已算完**时才重绘 ⇒ 副作用是**切回标签页会补一次重绘**。
- 尺寸观测：`ResizeObserver` 封装，**`debounceMs: 300`**。
- 订阅方式：`ee({blockId, buildLettuce, buildLettuceBinding, onBlockContentChange})` ⇒ ★ **"Lettuce" 是内部 Yjs 文档绑定工厂名**（`buildLettuce` / `buildLettuceBinding`），块内容变化回调驱动重绘。
- 顺带掉出一个**颜色算法** `ae(t)`：把色值向白混 **0.93**，再乘一个 **3×3 色彩矩阵**（用 `cos(π)`/`sin(π)` 生成）⇒ 预览底色的"提亮"不是简单 lighten。

### 4. 对本地实现的直接影响

| 项 | 官方 | 本地 |
|---|---|---|
| 白板编辑器 | **Excalidraw**（`vendor-excalidraw` 7.2 MB chunk + `ExcalidrawFocusMode` 45 KB） | **tldraw**（见 `verification-env` 记忆的快照基线）⇒ **选型有意偏差**，但**交互契约要照抄**（导出参数、三态、四重门控、iframe `allow` 清单） |
| 白板数据来源 | `blob` 里的 `{type:"whiteboard", data}`（§一之八 3）**且** URL 走 smartLink | 本地 `Whiteboard` 表 + tldraw 快照 |
| 主题传递 | 改 iframe `src` 的 `colorMode` 参数（**重载**） | 需明确选一种并记录差异 |
| 文档内预览 | 导出图片（contain + padding 32 + 无背景 + 暗色跟随） | 若直接挂活的 Excalidraw/tldraw 实例，性能与"切回标签页重绘"行为都会不同 |

**仍未采到（白板轴）**：`ExcalidrawFocusMode-*.js`（45 KB）里的**工具栏/快捷键与 Craft 侧快捷键如何不打架**；`WhiteboardFocusMode` 的**进入与退出**（哪个动作触发、Esc 是否回到文档）；smartLink 与白板 URL 的**同步时机**（`smartLinkLastSyncTimestamp` 谁写）；`buildLettuce` 工厂内部（Yjs doc 的命名/共享策略）。


## 25. 第 42 批：★ 白板预览的实现本体（`js/ExcalidrawPreview-*.js` 6.1 KB 整读 + `js/ExcalidrawPreview.utils-*.js` **615 B**，后者是本地 105 个 chunk 里最后一个"从未被产物点名"的非 vendor chunk）

⇒ 本批之后，`_harvest/js/` 的"体积升序 + 未被点名"启发式**已见底**（剩余未点名者全是 vendor：`react-virtuoso` 58 KB / `tanstack` 114 KB / `ds` 182 KB / `react` 342 KB / `code-editor` 3.58 MB）。后续选题必须改用别的轴（各文档的「仍未采到」清单）。

### 25.1 `.utils` 那 615 B 只有一个异步包装

```js
import { exportToCanvas as t } from "./vendor-excalidraw.js";
const i = async (e) => t(e);   // export { i as exportToCanvas }
```

⇒ ★ **官方专门开一个 chunk 把 `exportToCanvas` 包成 async**，为的是让预览组件**不在静态图上依赖 7.2 MB 的 `vendor-excalidraw`** —— 一个 615 B 文件承担"把重依赖推到运行时"的职责。（本地若把导出直接 import 进来，首包会背上整个 Excalidraw。）

### 25.2 白板背景色存在 `model.data.meta.viewBackgroundColor`

```js
const R = "#ffffff";
const bg = useStore(sel => {
  const s = state[blockId];
  return ((s?.model)?.type) !== "whiteboard" ? R : s.model.data.meta?.viewBackgroundColor ?? R;
});
```

- ★ **判据是块 `model.type !== "whiteboard"`** ⇒ 非白板块走硬编码常量 `#ffffff`（不是 undefined），即**这个选择器对任何块都能返回一个颜色**。
- ★ **背景色不是块的一级字段**，藏在 **`model.data.meta.viewBackgroundColor`**（Excalidraw 的 appState 被整体存进块 data 的 `meta` 里）。
- ★ **暗色模式下容器底色 = 提亮后的背景色**：`style={{ background: isDark ? lighten(bg) : bg }}` ⇒ 官方**不直接用 `viewBackgroundColor` 当容器色**，因为画布是导出的位图、暗色下需要垫一层更亮的底。

### 25.3 提亮算法的完整常量（补 §24.3 那句"向白混 0.93"）

```js
const s = .93;                                   // 向白混合系数
r' = round(r*(1-s) + (255-r)*s)                  // 逐通道先向白混
[c, l, m] = [r', g', b'] / 255
θ = Math.PI;  o = cos θ;  q = sin θ              // o = -1, q ≈ 1.22e-16 ≈ 0
matrix = [.213+o*.787-q*.213, .715-o*.715-q*.715, .072-o*.072+q*.928,
          .213-o*.213+q*.143, .715+o*.285+q*.14,  .072-o*.072-q*.283,
          .213-o*.213-q*.787, .715-o*.715+q*.715,  .072+o*.928+q*.072]
out = clamp(matrixRow · [c,l,m], 0, 1) * 255      // 逐行一次，再 round
```

⇒ 写成 `cos(π)/sin(π)` 是**用三角函数生成一个固定矩阵**（等价于"绕亮度轴旋转 π"的色相翻转），展开后的常量是：
`[[-.574, 1.43, .144], [.426, .43, .144], [.426, 1.43, -.856]]`。
⇒ ★ **净效果不是"变亮"而是"向白混 + 色相翻转"**：本地若用 CSS `color-mix(in oklab, X, white 93%)` 得到的是**另一半**（少了矩阵那步），像素值必然对不上（G449 的定量版）。

### 25.4 白板图片资源存在 `model.data.assets`，取图有固定变换参数

```js
const raw = useStore(sel => { const b = docStore.blocks[blockId]; return isBlock(b) ? b.model.data.assets ?? {} : null; });
// 逐条：
Q(item.url, { width: 1200, fit: "scale-down" })   // 图片服务参数
const res = await Promise.allSettled(list);
for (const p of res) { if (p.status === "rejected") { logger().error("ExcalidrawAssetDownloadError", ...); continue; } out[p.value.id] = p.value; }
setState({ state: "ready", assets: out });
// 每项：{ id, mimeType, dataURL, created: Date.now(), version: 1 }
```

- ★ **资源字典在 `model.data.assets`**（与 `meta` 并列，都在块 data 里）。
- ★ **预览取图统一 `width: 1200, fit: "scale-down"`** ⇒ 官方给白板内嵌图片写死了一个导出用尺寸档。
- ★ **`Promise.allSettled` + 逐条 `continue`** ⇒ **单张图片失败只 logError，其余照常渲染**（三态仍进 `ready`）⇒ 与 §一之十二"表格逐字段降级"是同一种容错哲学，这里落到资源层。
- ★ **`version: 1` 是常量**（不是资源真实版本号）⇒ 喂给 Excalidraw `files` 协议的版本位被固定填 1。

### 25.5 重绘四重门控的**确切**判据（把 §24.3 的"无块处于编辑态"定量化）

```js
const editingBlock = useSelector(s => { const bes = s.uiStore.blockEditorState; return bes != null ? exists(s.docStore.blocks[bes.blockId]) : null; });
const redraw = async (elements) => {
  if (!isTabVisible || editingBlock || state !== "ready" || isBeforeCalculation) return;
  ...
};
```

⇒ ★ 第二道门是 **`uiStore.blockEditorState` 指向的块是否存在**，取的是**全局**状态 ⇒ **文档里任何一处块进入编辑态，白板预览就不重绘**（不是只看这个白板块自己）。
⇒ 尺寸来源是 `useElementObserver({ debounceMs: 300 })` 的 `{elementWidth, elementHeight, isBeforeCalculation}`；导出分辨率 `v = min(w*E/wc, h*E/hc)`，`E` 是一个从 store 取的比值（本批未解出它是什么，见未采到）。

### 25.6 三态是**组件本地 useState**，且每态有自己的视觉规格

- `loading` → `<Spinner height={24} color={t => t.colors.neutral[600]}>`，居中撑满。
- `error` → 图标 32px **`red[500]`** + 文案键 **`whiteboard.preview.error`**（`userSelect: "none"`，`neutral[400]`，纵向 gap 8）。
- `ready` → **`forceMount`**（保持挂载）+ 一个 `pointer-events:none; position:absolute; inset:0` 的 styled 容器，内部 `canvas { width:100%; height:100%; object-fit: contain; }`。
⇒ ★ 预览层是**不吃鼠标事件的位图**（`pointer-events: none`）⇒ 点击白板必然落到下层块（进入编辑/聚焦），而不是画布。
⇒ 另：Yjs 绑定经 `useExcalidrawAssets({ blockId, buildLettuce, buildLettuceBinding, onBlockContentChange: redraw })` 注入，**redraw 就是内容变化的回调**。

### 25.7 顺带采到的两处工程约定

- **每个 chunk 顶部都有 Sentry 的 `_sentryDebugIds` IIFE**（以抛错取 stack 作 key，value 是该 chunk 的 debug UUID）⇒ 官方用 **Sentry + debug id** 做压缩产物的 sourcemap 归属；本地无任何 Sentry 依赖（`grep -rn sentry package.json src` = 0 命中）。
- **React Compiler 已全量启用**：组件体首行 `const e = React.c(33)`、逐 hook 依赖缓存槽、`Symbol.for("react.memo_cache_sentinel")` 作初始 state 哨兵 ⇒ 源码里没有 `useMemo` 手写缓存，编译期插入。

## 仍未采到（白板轴·第 42 批）

- `E`（导出分辨率的那个比值，`$()` 取自 index chunk）到底是什么：**DPR？缩放档位？导出质量档？** 未解。
- `ExcalidrawFocusMode`（45 KB）：工具栏与 Craft 侧快捷键的冲突处理、进入/退出动画。
- `assets` 字典的写入侧（谁往 `model.data.assets` 里放东西、上传与去重规则）。
- `WhiteboardFocusMode` 的进入动作与退出后落点（§24 已读到外壳，动线未采）。
- 白板副本与原件联动的实现（文案侧有"副本与原件联动"，代码侧未定位）。
## 十五、帮助中心中文站 IA（第 95 批·上半 2026-09-29 00:36–00:42，零写入＝第三条取证通路首采）

来源＝`docs.craft.do/zh-Hans`（**未登录可达、不受窗口 `visibilityState` 影响**；本轮实际落在 `/zh-Hans/write-and-edit/formatting/markdown-shortcuts`）。下面按 `nav a`／`aside a` 逐条读回的官方中文名与 slug：

| 顶层分区 | 子页（官方中文名 / slug） |
| --- | --- |
| 撰写与编辑 `/write-and-edit` | 概览；块与页面；格式化（概览／拼写检查与更正 `spell-check`／Markdown 快捷键 `markdown-shortcuts`／查找和替换 `find-replace`／包裹选中内容 `surround-selection`／添加日期 `dates`／插入表情 `emoji`／下标与上标 `subscript-superscript`）；媒体 `media`；文件与链接 `files-and-links`；代码 `code`；数学公式 `math-formulas`；Mermaid 图表 `mermaid-diagrams`；Image Playground `image-playground`；表格 `tables`；白板 `whiteboards`；绘图 `drawings`；模板 `templates`；版本历史 `version-history` |
| 整理与查找 `/organize-and-find` | 概览；标签 `tags`；空间 `spaces`；Teams `teams` |
| 计划与执行 `/plan-and-do` | 概览；日历 `calendar`；每日笔记 `daily-notes`；提醒事项 `reminders` |
| 分享与发布 `/share-and-publish` | 概览（子页未展开） |
| AI 助手 `/ai-assistant` | 使用 Craft Assistant `using`；使用 Craft Assistant 编辑文档 `editing`；选择 AI 模型 `models` |

⇒ **用法与边界**：这份树是**独立于 i18n 命名空间的第二份官方功能分类**，用来对账 `features.md` 的分区与本地路由命名；但它是**文档站**，不得当作 app 界面事实（技能失败路径表里「从帮助中心抄交互表当事实」一栏要求每条都要有指纹证据）。

**仍未采到（longtail 本节）**：各子页正文；`markdown-shortcuts` 键表内容（该页无 `kbd`／无 `table`，载体结构未探）；`share-and-publish` 子页；英文版 `/en` 与中文是否同结构（未取）。
## 十六、输入面与键位分发面的功能清单（第 96 批·上半 2026-09-29 09:26–10:20，零写入＝页内 `fetch`＋`indexOf` 直读主包与 CSS；原始窗 `_harvest/b96-onkeydown.json`／`b96-css.json`／`b96-css2.json`）

前面十五节都是**按功能分区**列面；本节补的是**"输入即转换"与"按键分发"这两张此前没有成轴的表**，来源是 bundle 里的注册表与 CSS 消费点（不是界面观察），因此每条都带"待屏上复核"尾巴。

### 16.1 输入面：`uF`（markdown 快捷输入表，主包 @3,775,423）

| 触发（`trigger` 全部＝空格） | 结果 | 派发形状 | 屏上待验 |
| --- | --- | --- | --- |
| `#`／`##`／`###` | `at.Title`／`at.Subtitle`／`at.Heading` | `setTextStyle` ＋ `od(t)` | 输完一个空格即换档，且触发串被剥掉 |
| **`####`** | **`at.Strong`**（★ 不是四级标题） | 同上 | 与 表A `STRONG`「强调」vs 面板「粗」的命名差同源 |
| `[x×☐□]`／`[ ]`／`-[]` | `Nt.Todo` ＋ `tn.Unchecked` | `ir(...)` ＋ `f5(...)` ＋ `od` | ★ **四种写法**都要验（含全角 `×`、`☐`、`□`） |
| `[x×]` | `Nt.Todo` ＋ `tn.Checked` | 同上 | 直接生成已完成态 |
| `-*•` | `Nt.Bullet` | `ir(...)` ＋ `od` | 三种 bullet 符 |
| **`+`** | **`Nt.Toggle`** | 同上 | 与第 76 批 markdown 扩展的 `+ Toggle` 同源 |
| **`>` 与 `\|`** | `P2([blockId], {focus: 1})` | 单 action ＋ `od` | ★ callout **两个触发符**；`focus:1` 语义未证 |
| **`(\d+)\.`** | `Nt.Numbered` **起始序号＝匹配到的数字**（`ti(m[1],10)`） | `ir(...,Nt.Numbered,n)` ＋ `od` | ★ 输 `7. ` 应从 7 起编（本地做不到） |

⇒ 一条**跨面判据**：整张表在**表格内被整体停用**（`onKeyDownBound` 里 `tableId != null ? [] : uF`，见 `internals.md` §二十九 第 2 道门）⇒ 单元格内输 `# ` 应当不变标题。另整张表在 **Android 上不分发**（`if(k2)return`）。⇒ 这两条都是**一次输入即可证伪**的行为，优先级高于任何样式采集。

### 16.2 键位分发面：主包 37 处 `onKeyDown` 的分布画像（逐窗读内容分类，不是计数）

| 归属 | 处数 | 偏移（升序） | 说明 |
| --- | --- | --- | --- |
| 团队邀请邮箱行 | 7 | 2,247,538／2,258,955／2,260,857／2,276,207／2,278,515／6,733,728／6,734,923 | 形态＝`{addRow, updateEmail, onKeyDown, setInputRef}` ＋ 占位文案 key `team.invite.example.email`；★ 提示"**按 Enter 加一行**"，是本轮最大一块（占 37 处的 7 处）⇒ 与 `team.md` 的邀请动线对账 |
| **六位数字码输入** | 12 | 6,559,643／6,559,770／6,559,897／6,560,054／6,560,181／6,560,308 ＋ 6,611,839／6,611,966／6,612,093／6,612,250／6,612,377／6,612,504 | ★ **新功能面候选**：两组各 6 格、`inputMode:"numeric", maxLength:1`、`id:"input1…input6"` ⇒ 形状＝**两步验证／恢复码／邀请码**一类的分格输入；两份实现并存（`k8` 与 `v8` 两个组件名）⇒ 本轮**只认出形状，未认出用途**（不得升为事实） |
| DS Menu 与 sections | 5 | 2,631,502／2,632,098／2,634,375／2,634,592／2,636,007 | 含 `role:"menu"` 挂载点与一个 `onKeyDownCapture`；与 §二十八／G815 的 `MRt` 白名单四键同源 |
| **块编辑器（本轮新结案）** | 3 | **4,091,385**（本体）／4,106,936／4,106,951（接线） | 三道门见 `internals.md` §二十九 |
| 表格单元格 | 1 | 4,820,898 | 带 `data-cell-id` 的单元格里另有自己的 `onKeyDown` ⇒ 与"表内停用 `uF`"并存（两回事） |
| URL／链接输入 | 3 | 3,795,422／3,811,214／5,465,249 | `urlInputOnKeyDown` 与一处 `Qvn(ne) && (preventDefault, F())` 门 |
| 通用输入与 textarea | 3 | 1,060,238／1,060,903／5,193,724 | DS 输入组件与 `noAutoFillInputAttributes` textarea |
| 下拉／胶囊／自定义按钮 | 3 | 2,197,928／5,412,164／5,457,081 | 含 `tabIndex:0, onClick, onKeyDown` 的自定义按钮一处 |

⇒ ★ 结论（第四次复现）：**主包内没有任何"全局键盘抑制"**——37 处全是**组件级 prop 接线**；唯二的"整表清空"出现在块级（表格分支）与焦点栈（IME 分支）。这解释了为什么 Enter 悖论只能靠**库默认值 vs 产品显式传参**结案（G845／G855），而不是靠找抑制点。

### 16.3 指示条面：CSS 有、装配无

`index.css` 里 `._indicator_x8v9o_94` 消费 `--active-tab-left`／`-width`／`-height`（三个，自带兜底 0），而 Base UI `TabsIndicator` 在主包**零引用** ⇒ 官方弹层**没有滑动指示条**（除非屏上另有实现）；`role:"presentation"` ＋ `hidden: !(w>0 && h>0)` ⇒ 即便渲染也不进无障碍树。⇒ 「模型大于 UI 的单向富余档」第 4 例（见 `model.md` §一之五十三）。

**仍未采到（longtail 本节）**：六位数字码输入的**用途与触发入口**（只认出形状）；`team.invite` 的完整邀请动线（Enter 加行／上限／校验文案）；`uF` 表尾；`P2` 的 `focus:1` 语义；`_dm375_` 模块其余 18 处 CSS 命中未逐条读；帮助中心六页正文（本批被登录会话的路由重定向挡住，见 G871）。


## 十七、日期弹层的**视觉与文案长尾**（第 96 批·尾记八 2026-09-29 13:03–13:10，沙盒 `QODER-HARVEST-B96D`，零日期提交；截图 `_harvest/b96d-schedule.png`）

前面十六节没有成轴的是**"一个弹层长什么样"**。本批两个弹层各自到手，把可复制的几何/文案一次列全（这些是**屏上实测**，不是 bundle 推断）：

| 项 | 日程弹层（`Ctrl+Shift+S`） | 截止日期弹层（`Ctrl+Shift+D`） |
| --- | --- | --- |
| styled-components class | `sc-st2m8s-0 WAcGA` | **同一个** `sc-st2m8s-0 WAcGA` |
| 位置与尺寸（CSS px，视口 638 宽档） | `x=356 y=141`、**232×413** | `x=356 y=222`、**232×332** |
| `outerHTML` 长度 | **15,518 B** | **11,383 B** |
| 输入框 placeholder | **「日期」** | **「截止日期」** |
| 表头 | `今天 九月` ＋ **「一 二 三 四 五 六 日」＝周一起始** | 同 |
| 日期数字序列 | `31 1 2 … 30 1 2 … 11`（**上/下月补位**，逐格连续） | 同 |
| 底部按钮集 | **6 枚**：`今天` ＋ 3 枚无文本（翻月/导航）＋ `提醒我…` ＋ `重复…` | **4 枚**：`今天` ＋ 3 枚无文本（**无提醒/重复**） |
| ARIA 角色 | **全 0**（`dialog/menu/listbox/grid/cell` 皆无） | 同 |
| 关闭方式 | `Escape`（实测生效）；同一条 chord 重复按**不关闭**（非 toggle） | 同 |

五条长尾事实：

1. ★★ **周一起始**＝表头逐字 `一 二 三 四 五 六 日`。⇒ 本地任务面板**根本没有日历**：用的是原生 `<input type="date">`（`src/app/(app)/tasks/page.tsx:287-291`／`296-299`），周首与月份补位全交给浏览器、无法与官方对齐；项目里自绘的 `src/components/ui/calendar.tsx`（react-day-picker `DayPicker`）**未设 `weekStartsOn`**（`grep -rn "weekStartsOn" src` ⇒ **0 命中**）⇒ 它取库默认档，**与官方周一起始是否一致未核**。⚠ 官方该档也可能随 locale 变，本批只在 `zh-Hans` 会话下测得，**不得当成写死常量**。
2. ★★ **月份补位用相邻月的真实日期**（读数首格 `31`＝上月末、尾格 `1…11`＝下月初）而非空格 ⇒ 视觉上呈"整块铺满"。⚠ **本轮未逐格数出行数**（读数只到文案序列），"6 行固定"是**待核推断**、不得当规格。
3. ★ **"今天"是弹层内的第一枚按钮**、不是页脚链接 ⇒ 一次点击即设值；与 `SCHEDULE_FOR_TODAY`（`keyboard.md` 屏上串 `Ctrl+Alt+S`）疑为同义双入口，⚠ **本批未实测点击「今天」**，等同关系待验。
4. ★ **3 枚无文本按钮**＝翻月/导航类图标按钮，`textContent` 为空 ⇒ 读屏不可达；与快捷键面板 7 枚分类图标未本地化同族（见 `interactions.md` 面板 a11y 记录）⇒ 官方既有可及性缺陷候选。⚠ 本批**未读 `aria-label`**，故"确无名称"仅为 textContent 层面的观察。
5. ☆ **弹层贴着当前块锚定**（两弹层 `x` 同为 356、`y` 差 81）⇒ 定位器是"块右侧"而非"视口中心"；与 `internals.md` 记的表格弹层 `EDIT_POPUP_OFFSET` 是两套不同实现。

**仍未采到（本节）**：提醒子选择器外观（G922）；「重复…」二级面板外观与字段映射；选中某日后弹层是否自动关闭；月/年快切面板；弹层内能否用键盘改月份（未测，且弹层内 `INPUT` 吞键，见 `internals.md` §三十）；暗色主题下的弹层配色（本批全程浅色）。

## 十八、**备份／提醒／共享三处的文案与几何长尾 ＋ `uF` 尾部 6 条 pattern ＋ `_dm375_` 净新增 4 项**（第 97 批 2026-09-29 20:12–21:14，桌面档 1206；沙盒 `QODER-HARVEST-B97-INDENT` 已还原、零值提交；截图 `_harvest/b97-backups-modal.png`／`b97-g890-enter-space.png`）

1. ★★★ **备份／历史版本弹层的全部文案只有四行**（此前从未采过这层）＝**「历史版本」**（层标题）／**「选择要恢复的版本。」**（副标题，句号是官方自带）／**「较早」**（分组标签）／**「升级即可获得 30 天或 180 天的备份。 查看计划」**（付费引导，句末两个空格再接按钮文案）。几何＝modal `600×553 @x303,y13`，类名 `sc-st2m8s-0 WAcGA`；可点元素**只有 2 枚**＝`Close`（`24×24 @x29`）＋「查看计划」（`52×? @`）；层内元素总数 **22**、`[contenteditable]` **0**、无 `role`。**没有任何版本条目**（且容器不可滚）⇒ 该层的"较长／较早"分组结构**只有下半截到手**。⇒ ★ 官方把备份留存与**付费计划**直接绑死在文案里（30 天／180 天两档），这是"免费账户有备份吗"的第一方回答。
2. ★★★ **提醒视图的文案与几何**（G922 结案，逐字）＝外层从日程的 `232×413 / 15,518 B` 变成 **`232×336 / 8,365 B`**（**同一个容器换内容**，不是新开一层）；入口两枚「提醒我…」「重复…」（各 `216×32 @x342,y482 / y514`）在换视图后**消失**；日期区下方多出一枚 **`108×34` 时间钮，默认文案「22:00」**；底部新增 **`216×48`** 容器＝**「取消」（`@x350,y506`）＋「应用」（`@x454,y506`）**。⇒ 「取消／应用」这对措辞在**日期层里没有**（日期是即选即写）⇒ 官方在同一个弹层里**对提醒用了两步提交**，是文案与语义双重可对账的一条。
3. ★★★ **三级时间列表＝96 个 `HH:MM` 字面量**（逐字前几档＝`00:00`／`00:15`／`00:30`／`00:45`／`01:00`／`01:15`／`01:30`／`01:45`／`02:00`…），容器 **`112×300`**（视口）／**`81×3088`**（内容列），**行距 32 px** ⇒ 3088÷32 ≈ **96 档、步长 15 分钟、从 `00:00` 起**。⇒ 这是本目录第一次把"提醒时间档"从静态字段（`repeat.reminder.dateOffset`）落到**可见字面量集合**；`22:00` ＝第 **89** 档（1320÷15＝88，从 `00:00` 起算第 89 项）。⚠ 列表**没有**「无提醒」这一项⇒ 取消提醒只能靠「取消」或再点「提醒我…」收回，本轮未测。
4. ★★ **帮助菜单在桌面档＋文档页＝8 项，其中一枚未本地化**＝逐字 **`Sync Status`**（**英文原样出现在中文界面**）／「报告同步」（**疑机翻**：`Report sync`?）／「意见反馈」／「最新特性」／「Web 和 Windows 版最新特性」／「常见问题」／「快捷键」／「Markdown 快捷方式」；`role=menu:1`、`role=group:2`（两组＝同步组＋帮助组）、menuitem 各 `266×32 @x865`，`y` 从 50 起、组间隔 12 px。⇒ 与空间屏 6 项／compact 档 5 项的差异**由档位＋页面态解释**（G950），三次读数不再互相打脸。⚠ 两枚新项**本轮未点**（点了会走站外，且本桥没有 `close_page`）。
5. ★★ **`/shared-with-me`（与我共享）空态＝没有任何文案**。屏上到手的全部文字＝侧栏 13 项 ＋ `H1` **「与我共享」**（`88×26 @x304,y61`）＋右上 `156×36` 容器里的 **2 枚无可见文本图标钮**（`34×28`／`28×28`）；主区是 **`_docGrid_6sjpd_59`（`870×2166`）** 里的 **`_outerBox_1nu3o_20`／`_innerBox_1nu3o_120`＝203×253 空格子**。`document.body.innerText` 总长仅 **130 字符**。⇒ 与侧栏计数「与我共享 **0**」一致；⇒ ★ **官方这一屏不写空态话术**（对比任务面明写「你的 Inbox 为空！准备就绪后即可添加任务。」、星标面写「收藏文档以便快速访问」、标签面写「固定关键标签以便快速访问」）⇒ **空态文案是不均匀的，本地别给所有屏统一套一句"暂无内容"**。⚠ 首读时 `H1` 与网格**都还不在 DOM 里**（`body` 只有 22 行侧栏文本）⇒ **主区懒渲染，判"这屏没有 X"必须二次读**。
6. ★★ **侧栏 13 条 `href` 逐字（路由长尾）**＝`新建文档` **`/editor/d/<spaceId>?nd=<uuid>`**、`所有文档` `/s/<空间名--空间id>/all`、`任务` `…/tasks`、`日历` `…/calendar`、`连接` `…/connections`、**`与我共享` `/shared-with-me`（唯一不带空间段）**、`我的模板` `…/templates`、`星标` `…/starred`、`文件夹` `…/folders`、**`未分类` `…/inbox`**、`How to use Craft` `…/f/How-to-use-Craft--<id>`、`标签` `…/tags`、文档卡 `/editor/d/<spaceId>/<docId>`。⇒ 三点值得记：① 界面写「未分类」而 slug 是 **`inbox`**（本地化与路由命名不同源）；② `新建文档` 的 `nd` 是**客户端预生成的新文档 id**（点一下就已经决定 id）；③ 官方**两套 URL 形状并存**＝slug 化 `名称--id`（空间内视图）与纯 id（文档／新建）。⚠ 空间名与 id 均属个人标识 ⇒ **产物只记形状**。
7. ★★★ **`uF` 表尾部 6 条 pattern（盘上 @3,780,2xx–@3,780,79x，此前只记 12 条）**：

| pattern | trigger | `isApplicable` | 动作（逐字符号名） |
| --- | --- | --- | --- |
| `/^\s*--$/` | `-` | `textContent.length<4` | `Xb(e,$t.Regular,…)`＝**普通分隔线** |
| `/^\s*=-$/` | `-` | 同上 | `$t.Strong`＝**粗线** |
| `/^\s*==$/` | **`=`** | 同上 | `$t.PageSeparator`＝**分页符** |
| `/^\s*\.-$/` | `-` | 同上 | `$t.Light`＝**细线** |
| `/^\s*\.\.$/` | `-` | 同上 | `$t.ExtraLight`＝**最细线** |
| ``` /^``$/ ``` | **`` ` ``** | 无 | `hln(e,rD.get(),…)`＝**转代码块**（action 标签 `"adoptFormatToInsertionPoint"`） |

⇒ ★ 整表 **18 条**、trigger 去重后只有 **4 个**（空格 12／`-` 4／`=` 1／`` ` `` 1）⇒ 官方 markdown 快捷的"键面"极小、"模式面"很大；⇒ ★ **分隔线官方 5 档**（Regular/Strong/Light/ExtraLight/分页符）第一次拿到**码路级**印证（此前只有帮助站文档级证据）；⇒ `P2(t,e)` 已裁＝`{type:"setDecorStyle",blockIds,decorations}` @85,294 ⇒ `>`／`|` 两条的 `focus:1` 是 **decor 字段**、不是块类型。⚠ 盘上副本的第 9 条正则因 mojibake 把 `]` 吞成 `U+E543` ⇒ **该 pattern 不可逐字复刻**（`internals.md §三十三/5`）。
8. ★ **`_dm375_` 净新增 4 项类名（JS 侧，盘上 @2,119,694–@2,120,266）**＝`_headerText_dm375_57`／`_scrollRoot_dm375_77`／`_section_dm375_82`（与 `_sections_82` **同 hash 行号**）／`_key_dm375_124`（与 `_keys_124` 同理）。⇒ ★ **两处"同 hash 别名对"是 CSS Modules 行号复用**，按类名前缀匹配判组件时会误合并；⇒ `_scrollRoot_77` 揭示**面板内容区是虚拟滚动**（`ks.Root` ＋ `ks.Viewport fadeout{vertical,size:24}` ＋ `ks.Scrollbar`）⇒ 官方 89 条**不是一次全渲染**，滚动过才有键帽 ⇒ 历次"数 `kbd` 数"必须理解为**当前视口内**的数量（本批实测分类 `kbd` 数＝通用 16／文档 11／样式 80／整理 13／合集 38，与第 82 批「通用 16／合集 38」逐字复现）。⚠ **CSS 规则本体缺文件**（本地无官方 CSS）⇒ 几何／颜色仍不可得。
9. ☆ **「＋ 插入栏」与「拖拽手柄」在静止态根本不在 DOM**：可编辑态实扫 `plusByText:0`、`dragByName:0`（按可访问名与文案两条枚举都是 0）⇒ 它们是 **hover 才挂载**的。⇒ ⚠ 这是一条**会制造假差分的判据**：将来在只读态"读不到 ＋／手柄"**不能**当作"只读态隐藏了它"，必须先对块发 `pointerover` 再判。本轮因为进不去版本预览（G949），这一对照**没做成**。
10. ☆ **暗色主题**：本批全程浅色，未切主题（属账户级偏好＝禁区）。

**仍未采到（本节）**：备份弹层的**有版本条目**形态（「较长」分组与条目行的文案、恢复按钮措辞）；「查看计划」落地页文案（付费页，未点）；`Sync Status`／「报告同步」两枚的目标与文案（一个英文一个疑机翻，值得对账 i18n 覆盖）；提醒三级列表**选中后的回写字段**（需写入授权）；「重复…」「二级面板的文案与档名；`/shared-with-me` **非空态**（需邀请协作者＝禁区）；`_dm375_` 全部几何与颜色（需回站点取官方 CSS）；`uF` 第 9 条 pattern 的逐字（需未损坏副本）。


## 十九、**六位数字码输入面结案（形状 → 用途 → 完整契约）＋ helper 表 `Ba` 的输入属性组 ＋ 一条"别用"命名趣闻**（第 97 批·尾记 2026-09-29 21:3x，**零写入、零屏幕**＝盘上 `node -e` 静态取证；⚠ 偏移一律**盘上口径**，与历史页内 `fetch` 口径差约 ＋3,02x～＋3,035）

1. ★★★ **§十六 表里那条"六位数字码输入｜12｜★ 新功能面候选｜本轮只认出形状，未认出用途"就地结案**：它**不是新功能面**，而是**登录／注册域的邮箱一次性验证码**，且**同一机制有两份实现**——

| 组 | 盘上偏移（6 格）| 格子组件 | 判别子（邻接 i18n 命名空间） | 用途裁定 |
| --- | --- | --- | --- | --- |
| 第一组 | `6,562,678 → 6,563,343` | **`k8`** | `alert.registration.is.unavailable` ＋ 一整片 `onboarding.menu.*`（product／whats.new／writing／planning／research／styling／help.and.support／blog／community／reddit／youtube／slack） | **注册／入驻**流程的邮箱验证码 |
| 第二组 | `6,614,874 → 6,615,539` | **`v8`** | **`browse.login.was.not.initiated.in.this.browser`**／`browse.logging.in`／`browse.sign.in.failed`／`browse.back.to.login`／`login.start.welcome`／`login.start.sign.in.with.craft(.to.continue)`／`onboarding.your.email`／`onboarding.continue`／`web.onboarding.accept.terms.and.privacy` | **浏览器侧登录**流程的邮箱验证码 |

⇒ 两组**共用**标题键 `onboarding.code.confirm.title`（「请输入发送至以下邮箱的验证码」）与同一批 alert 码 ⇒ 这就是"两份实现、标题却相同"的原因。★★★ **候选排除（要写清，防下批又去挖 2FA）**：全 105 个本地 JS 里 `twoFactor`／`totp`／`verificationCode`／`confirmEmail` **0 命中**；`recovery` 唯一命中 **@507,038** 是解析器生成器报错串、`otp` 唯一命中 **@5,941,901** 在 base64 数据块内部 ⇒ **两步验证／TOTP／恢复码／邀请码四条猜测全部作废**。⇒ **应用内（已登录态）永远不会出现这六个格子**。
2. ★★ **码面完整契约**（将来若做登录页可直接抄）：逐格 `inputMode:"numeric"` ＋ **`maxLength:1`** ＋ `id:"input1"…"input6"` ＋ **三个独立 handler** `onChange`／**`onPaste`**／`onKeyDown` ⇒ ★ **整串粘贴与逐格键盘导航是两条不同代码路径**（不是同一函数里的分支）；六格**共用同一个 ref 回调** `ref:g` ⇒ 焦点推进由父级持索引。每格展开 `{...Ba.noAutoFillInputAttributes}` ＝ **`{autoComplete:"off", …}`**（@4,003,894）⇒ **官方主动关掉 OTP 自动填充**（浏览器默认会试着填，这里拒绝）。★ 文案层：标题后**紧跟目标邮箱回显**（`i("…title")` 之后接变量 `t`）＋ 两行救济句＝「没有收到邮件？」（`…issue.question`）＋「检查垃圾邮件文件夹」（`…issue.suggestion`），两行都是 `userSelect:"none"` ＋ `colors.neutral[400]`。☆ **失败态与状态态**（第一组邻接）＝`alert.invalid.code`／`alert.expired.code`／`alert.code.already.verified`／`alert.account.locked`／`alert.too.many.attempts`／`alert.registration.is.unavailable` ⇒ 其中**「账户已锁定」「尝试次数过多」两条是 `dialogs.md:105` 的四态清单之外**的（那里只记了 expired/invalid/already.verified/add.email 四态）⇒ **验证码失效态实际至少六条**。☆ **加载态形状**＝第二组里 `c ? <_s spinner 32×32/> : 六格` ⇒ **校验中是把整排格子换成一个转圈**，不是禁用格子。
3. ★★ **几何与样式（第一次量到这套分格码的观感参数）**：页面 `Vs.MainContent contentWidth:588` ＋ 顶部 `Vs.Logo`；返回钮偏移 `top:32,left:32`（`lt type:Ut.Outlined`，第二组是 `type:"Outlined"`）；纵向列 `gap:48`；格子行间距 **`gap:4`**、行与救济句间距 **`gap:24`**、组宽 **`$maxWidth:384`**＋`$width:"100%"`；输入格 `k8`（`K.input.withConfig({componentId:"sc-gs1grf-0"})` @6,563,703）＝**`font-size:30px`／`text-align:center`／`border-radius:10px`／`box-shadow: inset 0 0 0 1px <动态色>`／`outline:none`／`padding-top/bottom:16px`／`height:auto`／`width:100%`**。⇒ ★ 边框走 **inset box-shadow 而不是 `border`** ⇒ 与官方 DS 其它控件同一做法（改色不改几何），本地若写 `border` 会在 focus 态对不齐。
4. ★ **helper 表 `Ba`（@4,005,6xx）＝官方把输入框的"脏活"集中成一组**：`addInputStyles`／`addTextAreaStyles`／`addDisableNativeAppearanceStyles`／`addDisableAutofillStylesExperimental`／`addDialogInputStyles`／**`noAutoFillInputAttributes`**／`onChange`（`zan(t)={onChange:t,onBlur:t,onInput:t}`＝**三个事件绑同一个 handler**）／`emailInputAttributes`（`{id:"email",type:"email",name:"username",autoComplete:"username",placeholder:"e.g. john.doe@craft.do"}`）／**`numberInputAttributesDontUse`**。
5. ☆ **一条命名趣闻（也是判据）**：那个 `{type:"number",min:"0",inputMode:"numeric",pattern:"[0-9]*"}` 工厂（@4,005,225）在表里的导出名是 **`numberInputAttributesDontUse`**＝**官方源码自己写着"别用"**。⇒ 两个用处：① 它是**第 13 处 `inputMode:"numeric"`**、与六位码**无关** ⇒ 任何按 `inputMode` 关键词归类的读数都要**减 1** 才是码面数；② 说明 `inputMode:"numeric"` **不是码面的可靠指纹**（通用数字输入也用同一个值）⇒ 历次分类要靠 `maxLength:1` ＋ `id:"inputN"` 这对组合，而不是 `inputMode`。
6. ☆ **对本地的判定（把这条写死，防止再为它开批）**：这两个码面属**登录／注册域**、应用内无入口 ⇒ **不构成 1:1 复刻的缺口**；本域**唯一真有对位物的**仍是 §十七／G307 的**邮箱变更五态子流程**（`sending.code` → `code.confirm.title` → `confirming.email.change` → `email.changed`／`could.not.complete.email.change`），本地改邮箱**直提无验证码环节** ⇒ 该补的是 G307。☆ 另有一条"组织方式差"＝官方把 `autoComplete`／`inputMode`／外观重置集中成 `Ba`，本地逐处手写属性 ⇒ P3、不建议单开批。

**仍未采到（本节）**：`onPaste`／`onKeyDown` 两个 handler 的**分流规则细节**（是否自动前进、退格是否回前一格、粘贴超过 6 位如何截断——需再读 `Hto`/`Gto` 体内的 `h`/`p`/`m` 闭包，本轮停在"两条代码路径并存"）；`alert.account.locked`／`alert.too.many.attempts` 的**中文逐字**；`resend`（重新发送）这条动线在两组里各自的键名与冷却时长；登录／注册域其余屏（已整域判为复刻域外，只留 G307）。


## 二十、**登录码面的文案与几何长尾 ＋ 资源名册的口径分裂（17 vs 10）＋ 一条"官方自带三家身份 SDK"的旁证**（第 97 批·尾记二 2026-09-29 22:0x–22:2x，**零写入、零沙盒、零屏幕**＝盘上 `node -e` ＋ 名册交叉核对；原始读数在 `gap.md` §三点一〇四〇 G970–G979、`interactions.md` V90）

1. ★★ **六位码面的布局几何首次到手＝两行三格，不是横排六格**：`a.jsxs(de,{gap:4,children:[input1,input2,input3]})` ＋ 第二个 `de{gap:4}` 装 `input4..6`，每格 `a.jsx(k8,{id:"inputN",ref:g,...Ba.noAutoFillInputAttributes,onChange:h,onPaste:p,onKeyDown:m,inputMode:"numeric",maxLength:1})` ⇒ ① **六格分两层 flex 行、行内 `gap:4`**；② 每格都展开**同一份** `Ba.noAutoFillInputAttributes`（禁自动填充的属性组）；③ `id` 是 **`input1`…`input6` 字面量**，且 handler 靠 `Object.values(l.current).findIndex(I=>I.id===y.target.id)` 定位 ⇒ **格子的顺序身份来自 `id` 字符串、不来自 DOM 顺序**（本地若复刻，用 index 会在 DOM 重排时错位）。
2. ★★ **文案长尾＝两条硬编码英文 ＋ 三条新 i18n key**：`"Login was not initiated in this browser"`（本地取不到 `xl.loginActivationCode` 时）、`"Wrong login code"`（`ti(y,10)==null || y.length!==6`）⇒ **这两句不走 i18n**、中文语言包里查无；同区一张码→key 的 switch 净新增三条＝`alert.error.invalid.params`／`alert.error.auth.token.missing`／**`alert.error.extension.not.installed`**。☆ 最后一条顺带给出旁证：**官方存在一个"需要安装的浏览器扩展"参与认证链路**（否则不会有这条错误分支），本目录此前从未记过该扩展。
3. ★★★ **名册其实有两份、口径不可互换 ⇒ "缺几个"必须指明是哪一份**：① **静态名册** `_harvest/all-chunks.txt`（承 G965，本轮逐字复现无误）＝**200 行／118 个唯一 basename／与本地 `_harvest/js/` 的 105 个文件交叉后缺 14**；② **运行时名册**＝本轮新落盘的 `_harvest/b97-resource-roster.json`（屏上 `performance.getEntriesByType('resource')`，⚠ **文件是双层 JSON 字符串**，`JSON.parse` 一次得到的还是 string、必须解两次）＝**总资源 250 条／`.js` 61 条／去重 54 个／缺 10 个唯一名（按条目算是 17 次）**，差 7 次＝`sw.js` 出现 **7 次**、`gtm.js` 2 次。⇒ 两份的差集有解释：**运行时名册含跨源外部脚本**＝`appleid.auth.js`／`gtm.js`／`profitwell.js`／`cc.js` **都不在静态名册**（`uc.js` 则在，属应用自身提供）；**静态名册含本会话从未加载的懒加载库**＝`vendor-jszip`／`vendor-katex`／`vendor-mammoth`／`vendor-pdf`／`vendor-react-cropper`／`vendor-csv-parse`／`blurhashEncoder.worker`／`useExcalidrawAssets`／`useTeamSubscriptionDataFromRQ`（`socket.worker` **在本地**、不属缺项）。⇒ **结论：两份互补、不是谁更新谁**，今后凡写"资源名册"必须带来源（静态清单 vs 运行时 Performance）。★ **一条新旁证**：官方 web 构建自带 **Apple 登录（`appleid.auth.js`）＋ Microsoft/Azure 登录（`vendor-azure-msal`）＋ Sentry 上报** ⇒ 三方身份与观测 SDK 走懒加载／外部脚本，与登录页屏上见过的"SSO·Google·Apple·Microsoft"文案互印；☆ 运行时名册的后缀分布＝`.js 61｜无扩展 80｜.ico 65｜.woff2 24｜.css 13｜.json 5｜.html 2`（合计 250 自洽）⇒ **`.ico` 65 条**说明图标请求量远超预期，本地做 favicon 派生时这是个数量级参考。
4. ☆ **一份 CSS 只是十三分之一**：名册里 `.css` 共 **13 个**，本轮落盘的是主样式 `index.css.CP00jDAy.css`（297,080 字符）⇒ `styles.md §九` 的阶梯表**只覆盖这一份**，其余 12 份（含各懒加载块的 CSS）未取 ⇒ 别把 §九 当全量官方 token 表用。
5. ☆ **命名趣闻续（承 §十九 的 `numberInputAttributesDontUse`）**：属性表 `Ba` 里同时存在 `addDisableNativeAppearanceStyles`／`addDisableAutofillStylesExperimental`／`addDialogInputStyles`／`emailInputAttributes` 等兄弟项，其中**"禁自动填充"有两份、一份标了 Experimental** ⇒ 官方自己在自动填充上做过未收敛的实验；☆ 另有 `--base-overlay: rgb(252 252 252 / 100%)` **写死、不跟随 `--base`**（暗档 `--base: 30 30 30` 时它不变）⇒ 官方自己也有"该走 token 却硬编码"的地方，是"官方＝抽象完美"这条直觉的第二反例（第一例见 `internals.md §三十四` 第 5 条的重复实现）。

**仍未采到（本节）**：`uc.js`／`cc.js` 的用途未查（不猜）；`sw.js` 七次请求是"多个作用域"还是"同一份重复计数"未证；那枚"需要安装的浏览器扩展"的名称与入口未定位（**属登录域，暂不开批**）；其余 12 份 CSS；`xl.loginActivationCode` 的存储介质（读 cookie／storage 是禁区，本轮**未读**，只拿到 key 名）。
## 二十一、**块手柄与拖拽预览的视觉长尾（24×31／距正文左缘 28px／幽灵副本 x+74 w+16）＋ 截图基准**（第 98 批 2026-09-29 22:40–23:00，桌面档 `innerWidth:1154`，沙盒 `QODER-HARVEST-B97-DRAG` 已还原；截图 `_harvest/b98-drag-moved.png`）

1. ★★ **块手柄几何**＝`24 × 31`（`x=330`，正文 `x=358` ⇒ **手柄中心比正文左缘靠左 28px**）；内层图标 `16 × 16`（`sc-1iqnrwp-1`，实测 `x=326,y=344`）⇒ **外框 24 宽、图标 16 宽、内边距左右各约 4px**；外框 `draggable=true`、图标 `draggable=false` ⇒ 抓取热区是**整块 24×31**、不是 16 的图标（本地若把 draggable 放内层，热区会小一半）。
2. ★★ **拖拽预览（幽灵）的位移量**＝相对原件 **`x` ＋74、`w` ＋16**，`y` 落在目标行上沿（原件 `x=358,w=670` → 幽灵 `x=432,w=686`）⇒ 官方用**"右移 74px ＋ 加宽 16px"**表达"这块要变成目标的下级／更深一层"的观感，而**落点本身只做了重排**（数据面次序证明）⇒ ★ 也就是说**预览的缩进感与实际结果不一定一致**，别拿预览位置当落点判据（本轮我就差点中招）。
3. ☆ **正文行的静止几何**＝`x=358`、`w=670`、行容器高 `28`、行 pitch **36px**（y＝173／209／245／281），文本 span 高 18 ⇒ 行内上下留白各 5；文档标题块同一 `x`／`w`（`y=116`）。⇒ 与快捷键面板的 `min-height:36px`（G973）**同一个 36**＝官方列表行高统一 36px，这条终于有了第二处印证。
4. ☆ **截图基准**＝`_harvest/b98-drag-moved.png`（拖拽已重做后的 A,C,B,D 态，桌面档 1154 宽）；⚠ `_harvest/` 被 gitignore，只作本地对照。☆ 本批**没有**拍到"拖拽进行中"的幽灵帧（`drag` 是原子调用、结束即落定），若下批要视觉稿需改成"hover 后不松手"的其它通路（本桥做不到 ⇒ 记为通路缺，不是官方缺）。
5. ★ **文案长尾＝本批零新增 i18n 键**（拖拽全程无 toast／无菜单／无文案变化，唯一文本变化是顶栏时间戳从 `1 minute ago` 变 `刚刚`）⇒ ☆ 顺手记一条：**文档时间戳用相对时间、且随读取时刻改写**（`刚刚`／`6天前`／`1 周前`／`3 年前` 在同屏同时出现），本地 `task.documentTitle` 一类展示若也要相对时间，这是官方口径样例。

**仍未采到（本节）**：手柄 hover 态的颜色／阴影（未量，要 `getComputedStyle` 再跑一轮）；暗档下的手柄与幽灵色值；手柄在 compact 档是否存在（本批桌面档）；幽灵副本的 z-index／透明度；跨容器（toggle 内／分栏内）拖拽的预览形态。

## 二十二、**回收站屏的图标可访问名清单 ＋ 卡片预览会泄露已删文档正文 ＋ 一处第 97 批结论的意外印证**（第 99 批 2026-09-29 23:4x–23:5x，零写入＝暗档、网格档、桌面档 `innerWidth:1154`；截图 `_harvest/b99-trash-menu.png`；原始读数在 `gap.md` §三点一〇四三 G997、`interactions.md` V92）

1. ★★ **本屏图标可访问名逐枚清单**（顶栏与头部，全部来自 `aria-label`，`role=img` 或 `role` 缺失）＝`Sidebar Left Icon Chevron Down Bold Icon`（侧栏开关）／`Bell Badge Icon`／`Question Mark Icon`／`Sidebar Right Icon Chevron Down Bold Icon`／`Doc Badge Plus Icon 新建文档`／`Doc On Doc Icon 所有文档`／`Checkmark Circle Icon 任务 Plus Icon`／`Calendar Icon 日历 Dot Viewfinder Icon`／`Cloud Icon 连接`／`Person Wave2 Fill Icon 与我共享`／`Doc Append Icon 我的模板`／`Tray Full Icon Expand 未分类`／`Plus Bold Icon`／`Chevron Down Icon`／视图三档＝`Rectangle Grid2x2 Icon`／`Rectangle3 Group Icon`／`Line3 Horizontal Icon`／`Ellipsis Icon`／选择条＝`Minus Bold Icon`／`Arrow Uturn Backward Icon`／`Trash Slash Icon`；左下 rail＝`Desktop Icon`／`Square And Arrow Down Icon`／`Person3 Fill Icon`／`Trash Icon`。⇒ ☆ **图标名是英文、界面文案是中文**（同一元素上并存两套语言）⇒ 本地做 i18n 时这类"图标名不参与翻译"是官方口径。
2. ★★★ **回收站卡片预览会渲染已删文档正文**（网格档每张卡带内容摘要）：`QODER-HARVEST-B97-DRAG` 卡上次序 **`DRAG-A alpha / DRAG-C charlie / DRAG-B bravo / DRAG-D delta`** ＝ 我删除那一刻的最后状态（撤销后又 `Ctrl+Shift+Z` 重做过）⇒ **摘要反映服务端最后落库态**；`QODER-HARVEST-B96D` 卡上带 `QODER-HARVEST-B96D G1 task` ⇒ 任务块在摘要里以纯文本出现（含前缀的块文本）。
3. ★★ **一处意外印证**＝`QODER-HARVEST-B97-INDENT` 卡上有一行 **`B97 A4 plain B97 D1 fully bold`**（两段文本**同行**）⇒ 第 97 批"块首 `Backspace` 把 D1 合并进 A4"这条**当场观测过的结论，拿到第二次独立印证**（这次是回收站卡片摘要，不是我读 `blocks get`）⇒ 方法学含义：**历次沙盒文档的卡片摘要是一个可回看的"行为留痕源"**，等价于免费的第二方证据。
4. ★ **一处隐私边界**＝卡片摘要会把文档正文**明文渲染在列表屏**上（本批截图里能看到历次采集串的自我文本）⇒ 本目录的沙盒文本都是无意义标记，无外泄；但**这条对真实用户内容意味着"回收站列表屏会暴露正文片段"** ⇒ 产物里不复述用户文档正文的纪律，正是为了不在截图／摘要里带出它们（本批截图只含自建的 `QODER-HARVEST-*` 标记文本，且 `_harvest/` 被 gitignore）。
5. ☆ **暗档观察（未量值）**＝本屏整体暗色（深底 ＋ 卡片描边 ＋ 菜单深灰底），属用户既有偏好，**本批未切主题、未点任何视图切换**（当前档＝网格，与进入前一致）；⇒ 若要 1:1 复刻选择条，暗档色值是下批的活。

**仍未采到（本节）**：分组档／横线档下回收站的布局与是否有"删除日期分组"这类附加行；卡片摘要的**截断规则**（几行、多少字符、超出如何省略）；摘要是否实时（需改一篇已删文档再看，属禁区）；选择模式下卡片是否显示勾选框在右上还是左上（本批未逐枚量）。

## 二十三、**回收站确认框的几何长尾（两枚 154×32 等宽并排）＋ 三处"坐标会自己动"的实测 ＋ 一屏四套 CSS Module hash 族**（第 99 批·尾记 2026-09-30 00:0x–00:2x，**写入批**；截图 `_harvest/b99-purge-selected.png`（前态）／`_harvest/b99-purge-after.png`（后态），两张均核看；原始读数在 `gap.md` §三点一〇四四 G1002／G1005／G1006、`internals.md` §三十七）

1. ★★ **确认框几何**＝文案行「删除 12 个项目 你确定吗？你无法撤销此操作。」＋ 两枚按钮**等宽 154、等高 32、并排、间距 8**（`取消 419,311` ／ `删除 581,311`）⇒ 在 `innerWidth:1154` 下整组居中偏左（组宽 324）；☆ 与第 97 批量到的对话框 `width:min(720px, calc(100vw - 2rem))` **不是同一形状**（这个确认框明显更窄、无标题栏分隔）⇒ 属"轻确认浮层"而非 `dialog`。
2. ★★ **三处坐标会自己动（都是同一次操作内发生的，不是跨重载）**＝① 全选框 mixed→true 时自身 x **822 → 815**（`Minus Bold Icon` vs `Checkmark Bold Icon` 宽度不同）；② 卡片复选框在 `scrollIntoView({block:'center'})` 后 y 从 `832/1533` 变成 `189`（列位 x 不变）；③ 确认框「删除」按钮 rect 与上一帧读到的可能不同 ⇒ **落刀前重新取 rect**。⇒ 汇总成一条＝**本目录所有坐标类判据只在"单次读→单次用"内有效**。
3. ★ **一屏四套 hash 族**（枚举自本轮实际命中的节点）＝`1j891`（菜单项／rail 按钮，承第 96 批）／`16nf6`（菜单浮层壳与 group）／`1bml7`（DS 按钮，含 `variantPlainDanger`）／`1fgll`（复选框 wrapper 与本体）。☆ 另＝卡片标题「无标题文档」是**占位文案**、不是文档真名（MCP 侧 `Title` 为空串）⇒ ★ **判"这条是不是采集沙盒"只准用 id／前缀，不准用屏上标题**（无标题项在屏上看起来"像空的"，正是 G992 那类误判的来源）。
4. ☆ **暗档观察（承前）**＝本轮全程在暗档：被选卡片＝蓝色描边＋右上实心圆勾（`Checkmark`），未选＝右上空圈（`aria-checked:"false"`）；全选框半选＝**实心圆底＋横线**（`Minus Bold Icon`）⇒ 三态在屏上是**实心圆／横线／勾**三种图形，本地若用 `src/components/ui/checkbox.tsx` 需自备第三态图形。

**仍未采到（本节）**：确认框浮层本体的 class 族与阴影／圆角（主动放弃，G1007）；网格档下卡片封面缩略图的取图规则（本轮 12 张卡片里有 3 张带渐变封面、其余空白，未追因）；列表档／紧凑档下选择模式的形状（本轮只测网格档）；「已选 N 项」在 N>99 时是否换行；暗档下 `variantPlainDanger` 的具体色值（未 `getComputedStyle`）。

## 二十四、**按钮几何长尾（28／32／34 高三档、圆角 7／8／9、内边距只给横向）＋ 三处"正则少一个下划线就全空"的坑**（第 100 批·上半 2026-09-30 00:3x–00:5x，**盘上＝零浏览器、零写入**；原始读数在 `gap.md` §三点一〇四五 G1012／G1017、`styles.md §十一.三`）

1. ★★ **三档尺寸的完整六元组**（height／radius／padding／`--icon-height`／`--chevron-size`／gap）＝`28px·7px·0 10px·18·13·2px`、`32px·8px·0 12px·20·14·2px`、`34px·9px·0 13px·22·15·2px` ⇒ ★ **圆角是 7／8／9 的连续小步**、不是第 97 批那套 `sm4/md8/lg12/xl16` 的通用 radius 阶 ⇒ **按钮 radius 走的是组件私有阶**（复刻时别套通用阶，会差 1～4px）。
2. ★★ **`--icon-height` 与 `--chevron-size` 是"由尺寸档写入的局部变量"**＝图标高度 18／20／22、下拉箭头 13／14／15 ⇒ ★ 本地若只按 Tailwind `size-4` 写死图标，**三档尺寸下图标不会跟着变**（本地 `button.tsx` 的 `[&_svg:not([class*='size-'])]:size-4` 是单一档）。
3. ★ **`isOnlyIcon` 只改 padding 不改 width**＝`padding:0 .3125rem`＋居中 ⇒ 方形外观来自"padding 对称＋内容等宽"，**不是 `aspect-ratio` 或固定 width**；☆ 本地把"只有图标"做成了 `icon`／`icon-xs`／`icon-sm`／`icon-lg` **四个尺寸档**（`button.tsx` size 变体）⇒ 轴不同，见 G1012。
4. ★ **`fluid` 是"占满＋内容居中"两个声明**（`width:100%;justify-content:center`）⇒ 官方没有 `block` 型按钮 prop，只有这一个类。
5. ★☆ **坑（工具层，值得记）**＝CSS Module 类名**自带前导下划线**（`_variantPlainDanger_1bml7_165`），所以：① 正则写 `[A-Za-z][A-Za-z0-9]*_1bml7_[0-9]+` 能**枚举到**类名，但拿它去搜 `.`＋名字会**全部 NOT FOUND**（因为选择器里是 `._variant…`）⇒ **枚举与检索要用同一个带下划线的形态**；② 本轮 36 个类名里 **33 个有独立基础规则、3 个只在组合选择器出现** ⇒ "搜不到基础规则"不等于"这个类不存在/没样式"。
6. ☆ **一屏四套 hash 族的成员数（本轮实测）**＝`_1bml7_` **36**（DS 按钮）／`_1j891_` **21**（菜单项与 rail 按钮，承第 96 批）／`_16nf6_` **11**（菜单浮层壳：`searchField`／`scrollArea`／`header`／`group`／`item`／`groupLabel`／`groupLabelClickable`／`footer`／`searchList`／`content`／`scrollAreaViewport`）／`_1fgll_` **3**（复选框 `wrapper`／`checkbox`／`icon`）⇒ ★ **`_16nf6_` 里有 `searchField` 与 `searchList`** ⇒ 这套浮层是**带搜索框的命令菜单壳**（本轮未屏上验证，属"结构暗示"级，标 `~`）。

**仍未采到（本节）**：`_16nf6_`／`_1fgll_` 两族的规则正文（本轮只枚举手类名）；`_1bml7_` 的 `:active` 态；暗档色阶映射表；`TaskViews.css` 等其余 12 份 CSS 里的第四／第五套族。

## 二十五、**编辑器几何长尾补三笔：行距 36px／沟槽 x=340／手柄 x 会随状态从 322 跳到 330**（第 100 批·下半 2026-09-30 01:0x–01:3x；沙盒 `QODER-HARVEST-B100-UNDOGROUP` 已软删；原始读数在 `gap.md` §三点一〇四六 G1018／G1019、`interactions.md` V94）

1. ★★ **正文行几何**＝四块 `[data-block-id]` 的 rect 依次 y＝173／209／245／281（**行距恒定 36px**）、块高 28、x=358、w=670；标题块 y=116（与首块差 57＝含标题行距）。⇒ 本地复刻时**行距 36 是"块高 28 ＋ 间距 8"**，不是 36 的 padding。
2. ★★ **沟槽命中区**＝正文左缘 −18px（x=340）处 `elementFromPoint` 命中的是 `DIV.sc-cyjsqg-0`（**不是**块本体），在该点派发 pointermove 才驱动手柄 ⇒ ★ **手柄的"可及区"比手柄本身宽**（手柄 x=322/330、宽 24 ⇒ 覆盖 322–354，而 340 也在其中）。
3. ★ **手柄 x 有两个值**＝未挂行时 322、挂到行后 330（与第 98 批实测 x=330 一致）⇒ **量到手柄坐标要先"挂行"**，否则拿到的是空态位置。
4. ☆ **拖拽落点本轮两例都是"插到目标之前"**（含"拖到最后一块中心"这一例）⇒ 若官方真有上缘／下缘分档，**中心点（y＋14）落在"前半"的概率很高** ⇒ 下批做分档时要把落点 y 明确取到**目标行的上 1/4 与下 1/4**，别再用中心。

**仍未采到（本节）**：暗档与 compact 档下的同一组几何；表格单元格内、折叠体内部的块行距（第 70 批静态说"嵌套块不可达合并档"，几何未量）；`--indent-w:28px` 与本轮 36px 行距在缩进态下的合成值。

## 二十六、**回收站屏几何全集＋"块内行高 24px vs 块间距 36px"的区分＋OS 坐标换算式**（第 101 批 2026-09-30 09:0x–09:4x；沙盒 `QODER-HARVEST-B101-DROPOFFSET` 已软删；原始读数在 `gap.md` §三点一〇四七 G1027／G1032、`interactions.md` V95 §一）

| 项 | 实测值 | 备注 |
| --- | --- | --- |
| 回收站屏 ⋯ 按钮 | `1106,60,28×28` → 中心 `1120,74` | **与第 99 批逐字一致**＝两批之间几何零漂移，可作为该屏的坐标锚点 |
| 选择模式·全选框 | `822,65,18×18`，`aria-checked:"mixed"` | 同 V93；⚠ 本轮未采"第三次点击去向" |
| 选择模式·行内复选框 | 网格 3 列：`x=536 / 820 / 1105`，第一行 `y=130`，均 `18×18` | ★ **卡片是 3 列网格**（`265×331` 一张），DOM 序≠视觉序 ⇒ 配对标题必须按 rect 包含判定 |
| 危险按钮（永久删除） | `938,58,32×32` → 中心 `954,74` | V93 记的是内层 icon `944,56,20×20`＝同一按钮的两层 |
| 确认框两按钮 | 「取消」`419,311,154×32`／「删除」`581,311,154×32` | **与第 99 批逐字一致**；等宽并排、间距 8px |
| 回收站卡片预览 | 4 行正文全露（`U1 alpha…U2 bravo`），无截断标记 | ☆ 预览取**当前序列**（见 `model.md §一之五十九.4`） |
| 硬重载后的复选框 | 行上仍有 3 个 `role=checkbox`，但工具栏无「已选」计数 | ☆ 未深采＝选择模式工具栏与行内复选框不是同一开关 |
| 正文块（单行） | `358,173,654,28` | 正文 x=358、宽 654（第 100 批记的 670 是**含内边距**的整行 666／文本层 654 三种口径，今后一律写清是哪一层） |
| **块内行高 vs 块间距** | 长文本块 `358,209,654,120`＝**5 行 ⇒ 行高 24px**；块与块起点差 **36px**（173→209→337→373） | ★★★ **两条不要混用**＝块内换行 24px、块间 pitch 36px（第 100 批只记了后者）；⇒ 本地若把 `line-height` 设成 36 会让长文本块高出一半 |
| 左沟槽热区 | `228,171,250,28`（正文左缘外扩 130px） | 见 `internals.md §四十.1` |
| 手柄 | `330,374,24,31`（随沟槽 pointermove 跳行） | 承 §三十九；☆ 本轮另见 `x=330` 稳定、`y` 逐行跟随 |
| 视口 | `innerWidth 1154 × innerHeight 578`、`devicePixelRatio 1.25` | 嵌入 webview 的实际 CSS 视口 |
| **OS 坐标换算式** | `image = ((440 + css_x) / 1.0913, (196 + css_y) / 1.0913)` | ★★ 单点自洽验证（OS 点击 image(832,670) → 页面读到 css(468,535)）；推导链＝窗口 bounds 1550×838 ↔ 截图 1420×768 ＋ dpr 1.25 ＋ 视口原点 css→screen (433,189)。⚠ **只对当前窗口布局成立**（改窗口尺寸／换面板比例就要重标） |

**仍未采到（本长尾面）**：回收站屏的**列表视图与瀑布视图**两档几何（本轮只在网格档采）；⋯ 菜单两项各自的 hover／focus 态；确认框的遮罩层与圆角／阴影（本轮主动不读样式，只读类名）；「最近删除」标题的字号与 y；卡片预览文本的截断规则；OS 换算式在窗口还原／最大化切换后的漂移量。


## 二十七、**OS 坐标换算式与"视口跨批漂移"两条仪器几何（＋回收站屏锚点在新视口下的实测值）**（第 102 批 2026-09-30 10:1x–10:5x；原始读数在 `gap.md` §三点一〇四八 G1038／G1039、`interactions.md` V96）

| 项 | 实测值 | 备注 |
| --- | --- | --- |
| **换算式（当前窗口布局）** | `image = ((css_x + 333) / 1.056, (css_y + 178) / 1.056)` | ★★ 两点求解、自洽到 1px；中间量＝`css = screen − (433,189)`、`screen = bounds.origin + image × 1.056`，`bounds = 1336×811 @ (100,11)`、截图 `1265×768`、`dpr 1.25` |
| 视口漂移 | 第 101 批 `1154×578` → 第 102 批 **`991×558`** | ★★★ 根因＝宿主窗口取消最大化（bounds `1550×838 @ −7,−7` → `1336×811 @ 100,11`）⇒ **一切硬编码坐标每批重导**；本轮正文块左缘由 `x=358` 变 **`x=345`**、块宽由 654 变 **505** |
| 回收站 ⋯ 按钮（新视口） | 实时中心 `957,74`（旧值 `1120,74` 作废） | ☆ 定位法＝找 `className` 含 `Plain MediumSmall` 的按钮，别记 x/y |
| 危险按钮（新视口） | `775,58,32×32` → 中心 `791,74` | 定位法＝`/Danger/i.test(className)` |
| 确认框按钮（新视口） | 「删除」`500,301,154×32` | ⚠ 与上批 `581,311` 差 81px＝视口宽度所致 ⇒ **落刀前必须重取实时 rect** |
| 沙盒块几何（新视口） | 正文块 `[345,173,505,28]`；长文本块 `[345,209,505,120]`；手柄 `[317,374,24,31]` | ☆ 手柄 x 由 330 变 **317**（＝正文左缘 −28）⇒ 手柄横向锚点也应现取 |
| OS 拖拽参数 | `duration_ms:1200`、`steps:150`、`cursorMoveFrames:15` | ☆ 1200ms 足够让官方画出预览并完成 drop；更短未测 |

**仍未采到（本长尾面）**：换算式在窗口**改变尺寸/位置**后的重标成本（本轮只标了一种布局）；`duration_ms` 与"是否触发预览渲染"的关系；OS 通路下**拖拽中途**的截图（需要在 `drag` 执行期间并发拍帧，本工具做不到）。

## 二十八、**落点二分五枪几何表（＋奇偶取整未决项）**（第 103 批 2026-09-30 10:5x–11:3x；沙盒 `QODER-HARVEST-B103-BOUNDARY` 已软删；原始读数在 `gap.md` §三点一〇四九 G1042／G1046）

| 枪 | 源块 | 落点 css y | 占目标块高度 | 结果 | 与"中线规则"是否一致 |
| --- | --- | --- | --- | --- | --- |
| 1（全新沙盒） | D4（末位） | 299 | **75.0%** | 插到 D2 **之后** | ✅ |
| 2 | D3（末位） | 285 | **62.5%** | 之后 | ✅ |
| 3 | D4（与 D2 隔 2 位） | 277 | **56.7%** | 之后 | ✅ |
| 4 | D3（与 D2 隔 2 位） | 270 | **50.8%** | 之后 | ✅ |
| 参照（第 102 批） | C3 | 块顶＋60 | **50.0%** | **之前** | ✅（正中点归 before） |

- 目标块几何（本轮）＝整行 `[345,209,505,120]` ⇒ 中线＝**269**；边界实测落在 **(269, 270]** ⇒ **＝中线，正中点归 before**。
- OS 换算式沿用第 102 批（窗口布局未变：bounds `1336×811 @100,11`、截图 `1265×768`、`dpr 1.25`、视口 `991×558`）＝`image = ((css_x+333)/1.056, (css_y+178)/1.056)`；☆ 四枪的 `from` 都是 `(625,535)`＝**源块行沟槽中心 css(327,387)**，实测 `pointerdown` 每次都精确落在此点 ⇒ 换算式跨批复用有效（**前提是窗口布局不变**）。
- ☆ 短行几何（本轮）＝`[345,173,505,28]`／`[345,337,505,28]`／`[345,373,505,28]` ⇒ 行 pitch 仍是 **36px**、块内行高仍是 **24px**（承 §二十六）。
- ⚠ **未决取整项**＝28px 短行的中线是 `top+14`（整数），若块高为奇数（如 27px）则中线是 `.5`，官方归哪一侧未采。

**仍未采到（本长尾面）**：块间 padding 空隙里的 `y` 归属；不等高块相邻时是否仍按各自中线（`closestCenter` 候选的正面检验）；水平方向落点。
## 三十、**第 104 批五枪落点几何表（六行短块：行高 28／pitch 36／沟槽 8）**（第 104 批 2026-09-30 12:2x–12:5x；沙盒 `QODER-HARVEST-B104-GAPBAND` 已软删；原始读数在 `gap.md` §三点一〇五一 G1052／G1053）

| 枪 | 源块（css 行带） | 落点 css y | 落点属于 | 模型结果 |
| --- | --- | --- | --- | --- |
| E1 | G6（`353..381`） | **205** | G1 与 G2 之间的**沟槽**（`202..208`） | 插到 G1 之后＝G2 之前（`G1,G6,G2,…`） |
| E2 | G5（`353..381`） | **165** | 首块顶 173 **之上 8px** | 插到**最前** |
| E3 | G5（`173..201`，此时已在首位） | **399** | 末块尾沟槽 `382..389` **之外 10px** | **零变化**（`drop` 仍送达容器） |
| E4 | G1（`209..237`） | **385** | 末块 G4 的**尾沟槽内** | 插到**最后** |
| E5 | G4（`317..345`） | **150** | 首块顶之上 **23px**（远超一个沟槽） | 插到**最前**＝上夹紧 |

- 行带（同一轮内）＝`G1 173..201 / G2 209..237 / G3 245..273 / G4 281..309 / G5 317..345 / G6 353..381` ⇒ 行高 **28**、pitch **36**、**沟槽 8px**（与 §二十六／§二十七 的"块内行高 24 vs pitch 36"合起来＝24 文本行 ＋ 4 上内边距 ＋ 8 段间距）。
- 正文容器 rect＝`top 48 × height 504`（css）＝拖拽事件的恒定 target；容器 x 段＝`48..552`（宽 504）。
- OS↔css 换算（本轮复标＝零误差）＝`image = ((css_x+333)/1.056, (css_y+178)/1.056)`；实测 `(881,416) → (597,261)`。☆ 拖拽 `from` 恒取源行沟槽中心 css `(327, rowCenter)`。
- ⚠ **未钉死**＝下界在 `(389, 399]` 之间（本轮只测了 385 有效／399 无效两点）；上界是否真的无限（只测到 −23px）。

**仍未采到（本长尾面）**：高块（120px）与短行相邻时尾沟槽是否仍是 8px；嵌套父子之间的缝隙归属；水平方向落点；容器之外（正文左缘更左／标题区）拖拽的语义。

## 三十一、**长尾素材：brand 七族色阶（档位序号在两档下"整条反向"）＋ `--editor-*` 语法色与 5 条封面渐变与 1 条 spectrum ＋ 两处"官方刻意不重指"**（✓盘上 第 105 批 2026-09-30 13:1x–14:1x；逐字全表在 `styles.md §十二.十二／十三`，gap 行 `gap.md` G1067／G1068）

### 一、brand 七族＝只有 5 族进暗档，且**方向相反**

| 族 | light 档数 | dark 档数 | 特征 |
| --- | --- | --- | --- |
| `brand-blue` | **10**（`50…900`） | **10** | light `50`＝`rgb(113 178 255/16%)` → `900`＝`rgb(18 6 82)`；**dark 整条掉头**＝`50`＝`rgb(18 6 82)` → `900`＝`rgb(232 243 255)` |
| `brand-red` | **10** | 10（下段 alpha 另有 6 档在 `:root,.token-scope`） | light 深端 `rgb(118 15 44)`；dark 浅端 `rgb(253 242 245)` |
| `brand-green` | **7**（`50…600`） | 7 | light `50…200` 是 **alpha**（`rgb(128 205 197/16%｜30%｜60%)`），`-300` 起转 100%；dark 全字面 |
| `brand-beige` | **6** | 6 | light `-100/-300/-400` 是同一 RGB 的三种 alpha（`/35%｜72%｜80%`）＝**"同色不同透明"而非不同色** |
| `brand-coral` | **3**（`300…500`） | 3 | dark 侧序号同样反向（light `500`＝`rgb(249 150 126)` ↔ dark `500`＝`rgb(252 203 190)`） |
| `brand-orange` | **1**（只有 `-500`＝`rgb(255 117 36/100%)`） | **无** | ★ 单点品牌色，不是色阶 |
| `brand-yellow` | **1**（只有 `-500`＝`rgb(253 185 1/100%)`） | **无** | 同上 |

⇒ ★★ **档位序号表示"相对深浅"而不是固定色值**＝同一个类名（`bg-brand-blue-100`）在两档下落在色阶**相反两端**；⇒ 任何"把官方某个 `-N` 值抄成常量"的做法在暗档必然错（这是本批最硬的一条复刻约束）。
⇒ ☆ 与 §十一.一 的 `-550…-900` 上段合起来看＝**官方一共存在三种色阶表**：语义／强调板（alpha＋字面两段）、brand 板（整表字面、两档反向）、前景（只有 alpha、20 档）。

### 二、`--editor-*` 语法色＝11 条色 ＋ 5 条渐变 ＋ 1 条 spectrum

- **10 条代码高亮色**（`bluedark`／`bluelight`／`cyan`／`green`／`orange`／`red`／`purple`／`brown`／`greydark`／`greylight`）＋ `--editor-text`（正文墨，`rgb(31 34 37/90%)` → dark `rgb(255 255 255/90%)`）；
- ★ **两档同值的只有 2 条**＝`--editor-orange`（`rgb(240 151 55)`）与 `--editor-brown`（`rgb(126 80 25)`）⇒ **官方刻意不重指**（这两色在深浅底上都能读）；其余 8 条逐色重指，跨度最大的是 `--editor-bluedark`：`rgb(3 0 245)` → `rgb(170 169 249)`（**深蓝→浅靛**）；
- **5 条封面渐变** `--editor-gradient-{blue,purple,pink,orange,gold}`：角度只有两种（`108.9deg`，`purple` 在 light 用 `109.45deg`），light 是"深端→深端"、dark 是"浅端→浅端"（例：`purple` light `rgba(36,73,254)→rgba(202,75,167)` ↔ dark `rgba(97,229,255)→rgba(255,112,245)`）；
- ☆ `--editor-spectrum`＝**一条 `conic-gradient`**，角度出现**负值与超过 360°**（`-54.01deg`、`413.99deg`）且**首尾各重复一次同色**（红出现 2 次、蓝 2 次、`rgba(243,245,219)` 连写两次跨 223.2°／226.8°）⇒ **这是"手改过、没有再归一化"的渐变**（官方自己的不整洁样本，与 `alert.*` 文案三条同义那条同族）；

### 三、本地落点与差分（本轮逐条比过）

| 项 | 本地 | 判定 |
| --- | --- | --- |
| 10 条语法色 light 值 | `src/app/globals.css:143-152` **逐字等于官方 light** | 一致 |
| 5 条渐变的 light／dark 两套 | `:153-157`（light）与 `:310-314`（dark）**都与官方对应档逐字一致** | 一致（本轮最大面积） |
| 语法色 dark | 8 条与官方暗档逐字一致；★ **`--editor-blueDark`／`--editor-blueLight` 照抄 light**（`:300-301`） | **行为不同**（G1068） |
| `--editor-text`／`--editor-spectrum` | 两个 token 都**无定义**（`:120` 只有注释提到 `--editor-text`）；☆ 本地唯一的 conic 用法是**棋盘格占位**（`repeating-conic-gradient(...)`，`src/components/editor/panels/PageStylePanel.tsx:226`／`tabs/StyleTab.tsx:166`）＝与官方 spectrum（彩色环）**不是同一用途** | 缺失 |
| brand 七族 | **全库零命中**（无 `--brand-*`） | 缺失（本地没有品牌色阶这一层，封面／高亮的 brand 语义无处落） |
| 变量名大小写 | 本地 camelCase（`blueDark`／`greyLight`）vs 官方全小写 | 有意偏差候选（附原因＝本地沿用 JS 命名；⚠ CSS 变量大小写敏感，混用必失效） |

**仍未采到（本节）**：brand 七族在**界面上的实际消费点**（哪些屏用 `brand-blue-300` 等）未统计，需要全 DOM 扫描或读 JS；`--editor-*` 10 色与代码块／数学块的**对应关系**未采（即"哪种语言 token 用哪个色"）；`--editor-spectrum` 用在哪个界面（疑似 AI／渐变头像背景，未证）；其余 12 份 CSS 是否另有第 4 套色阶；本地那两条"照抄 light"的 dark 值在真实暗色屏上的可读性（未截图对照，属可见度判断）。


## 三十二、**长尾素材：13 份 CSS 的"原始清单层"＝TaskViews 19 个选择器串全集 ＋ KaTeX 20 face 逐支 ＋ CJK 45 face 逐族逐权重 ＋ m-plus 354 片的分片统计 ＋ roboto-mono 12 片全 `unicode-range` 逐字 ＋ 白板 67 个 `--color-*` 全列 ＋ `--st-*` 的 8 个宿主名与 1 个死变量**（✓盘上 第 106 批 2026-09-30 14:3x–15:2x，零写入；★ 本节只放"逐字清单"，解释与判定在 `styles.md §十三`／`internals.md §四十五`／`model.md §一之六十四`，gap 行 `gap.md` G1069–G1078；原始机读结果＝`_harvest/b106-census.json`／`b106-detail.txt`／`b106-verify.txt`／`b106-verify2.txt`）

### 一、`TaskViews.css` 的 19 个选择器串（逐字，按文件内出现序）

```
._rubberBand_fdch5_1
._heading_11co4_1._heading_11co4_1                         （出现 2 次＝基础＋宽屏覆写）
._title_11co4_8 ／ ._title_11co4_8>h1                       （窄屏再出现 1 次）
._tabs_11co4_24 ／ ._tabs_11co4_24::-webkit-scrollbar       （宽屏再出现 1 次）
._tabsContent_11co4_37                                      （宽屏再出现 1 次）
._settings_11co4_43 ／ ._settingsPlaceholder_11co4_48
._card_ydla7_1 ／ [data-whatintent=keyboard] ._card_ydla7_1:focus
._layer_ydla7_27
._idle_ydla7_42,._action_ydla7_46._isAlwaysVisible_ydla7_46
[data-whatintent]:not([data-whatintent=touch]) ._card_ydla7_1:hover ._idle_ydla7_42,
[data-whatintent=keyboard] ._card_ydla7_1:focus ._idle_ydla7_42
[data-whatintent]:not([data-whatintent=touch]) ._card_ydla7_1:hover ._action_ydla7_46,
[data-whatintent=keyboard] ._card_ydla7_1:focus ._action_ydla7_46
._iconSlot_ydla7_61
```
⇒ ☆ 20 条规则／19 个不同串／3 个族；at 块 6 个＝`@layer components` ×3 ＋ `@media (width <= 747px)` ×1 ＋ `@media (width >= 748px)` ×1 ＋ 其中的 `@container web-shared-layout-main-wrapper (width >= 600px)` ×1。

### 二、KaTeX 0.16.25 的 20 个 face（family／weight／style／首个 `src` 文件名）

```
KaTeX_AMS/400/normal/KaTeX_AMS-Regular-BQhdFMY1.woff2
KaTeX_Caligraphic/700/normal/KaTeX_Caligraphic-Bold-Dq_IR9rO.woff2
KaTeX_Caligraphic/400/normal/KaTeX_Caligraphic-Regular-Di6jR-x-.woff2
KaTeX_Fraktur/700/normal/KaTeX_Fraktur-Bold-CL6g_b3V.woff2
KaTeX_Fraktur/400/normal/KaTeX_Fraktur-Regular-CTYiF6lA.woff2
KaTeX_Main/700/normal／KaTeX_Main/700/italic／KaTeX_Main/400/italic／KaTeX_Main/400/normal  （4 支）
KaTeX_Math/700/italic／KaTeX_Math/400/italic                                               （2 支，★ 只有斜体）
KaTeX_SansSerif/700/normal／400/italic／400/normal                                          （3 支）
KaTeX_Script/400/normal ／ KaTeX_Size1/400/normal ／ KaTeX_Size2/400/normal
KaTeX_Size3/400/normal  ← ★ src 首选是 url(data:…) 内联（全文件唯一 1 处 data URI）
KaTeX_Size4/400/normal ／ KaTeX_Typewriter/400/normal
```
⇒ ☆ 20 face × 3 格式（`woff2`／`woff`／`truetype`）＝**60 个 `url()`**；`font-display` 全部 `block`。

### 三、CJK 包（`fontdef.common.css`）的 45 个 face ＝**逐族 × 逐权重**（本轮实测分解）

| 语言目录 | family | face 数 | 权重清单（逐字） |
| --- | --- | --- | --- |
| `_japanese` | `Noto Sans Mono JP` | 1 | `100 900` |
| `_japanese` | `Pretendard JP` | 1 | `100 900` |
| `_japanese` | `Source Han Serif JP` | 1 | `200 900` |
| `_korean` | `Jetendard` | **16** | 100／200／300／400／500／600／700／800，**每档 × 2（normal＋italic）** |
| `_korean` | `Nanum Square Round` | 4 | 300／400／700／800 |
| `_korean` | `Pretendard` | 1 | `100 900` |
| `_korean` | `Source Han Serif KR` | 1 | `200 900` |
| `_simplified-chinese` | `Noto Sans SC` | 1 | `100 900` |
| `_simplified-chinese` | `Noto Sans Mono SC` | 1 | `100 900` |
| `_simplified-chinese` | `Source Han Serif SC` | 1 | `200 900` |
| `_simplified-chinese` | `Resource Han Rounded SC` | **7** | 200／300／**350**／400／500／700／900 |
| `_traditional-chinese` | 同上四族（`… TC`） | 1＋1＋1＋7＝10 | 与 SC 逐字相同 |
| **合计** | **15 个 family** | **45** | ★ JP 3＋KR 22＋SC 10＋TC 10 |

⇒ ☆ `format()` 只有 `woff2`（与 KaTeX 的三格式不同）；`font-display` 全部 `swap`；`src` 路径全部**回溯到语言目录**（`../../_japanese/mono/noto-sans-mono/noto-sans-mono-jp-variable.woff2`）。

### 四、`unicode-range` 的两套分片法（★ 同为"分片"，粒度差两个数量级）

| 包 | 片数 | 逐字样本 |
| --- | --- | --- |
| `fontdef.roboto-mono.css` | 12（6 区 × 2 style，**同区 normal／italic 范围逐字相同**） | `cyrillic-ext: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F`／`cyrillic: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116`／`greek: U+0370-03FF`／`latin-ext: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF`／`latin: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`／`vietnamese: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB` |
| `fontdef.m-plus-rounded-1c.css` | **354**（首片起于 CJK 扩展 B 区） | 首片 `U+25ee8, U+25f23, U+25f5c, U+25fd4, U+25fe0, U+25ffb, U+2600c, …`（★ **逐码点枚举**，不是区间）；末片 `U+20, U+2027, U+3001-3002, U+3041-307f, U+3081-308f, U+3091-3093, U+3099-309a, U+309d-309e, U+30a1-30e1, U+30e3-30ed, U…`（假名＋标点＋拉丁空格）；**每片码点引用数 min=2／max=211，合计 24,840** |

⇒ ☆ 文件名两形＝roboto-mono 用**区名**（`roboto-mono-cyrillic-ext-wght-normal.woff2`）、m-plus 用**权重＋序号**（`m-plus-rounded-1c-400.0.woff2`、`…400.1…`、`…400.2…`，354 个文件）。⇒ m-plus 的 weight 只有 400／500／700 三档、style 只有 normal。

### 五、白板 67 个 `--color-*` 全列（108 条定义＝有重复覆写，本轮按首次定义取值；★ 分组只是本节排版用，**不宣称组内条数**）

| 组 | 名＝值（逐字） |
| --- | --- |
| primary | `--color-primary #6965db`｜`-darker #5b57d1`｜`-darkest #4a47b1`｜`-hover #5753d0`｜`-light #e3e2fe`｜`-light-darker #d7d5ff`｜`--color-brand-hover #5753d0`＋`--color-brand-active #4440bf` |
| 选中／滚动条 | `--color-selection #6965db`｜`--color-slider-track hsl(240, 100%, 90%)`｜`--color-slider-thumb var(--color-gray-80)`｜`--color-icon-white #ffffff` |
| gray | `-10 #f5f5f5`｜`-20 #ebebeb`｜`-30 #d6d6d6`｜`-40 #b8b8b8`｜`-50 #999999`｜`-60 #7a7a7a`｜`-70 #5c5c5c`｜`-80 #3d3d3d`｜`-85 #242424`｜`-90 #1e1e1e`｜`-100 #121212`（★ 含 `-85`，11 档） |
| surface／on | `-surface-high #f1f0ff`｜`-surface-mid #f6f6f9`｜`-surface-low #ececf4`｜`-surface-lowest #ffffff`｜`-on-surface #1b1b1f`｜`-surface-primary-container #e0dfff`｜`-on-primary-container #030064`｜`-border-outline #767680`＋`-border-outline-variant #c5c5d0` |
| danger | `#db6965`｜`-dark #db6965`（★ 与基色同值）｜`-darker #d65550`｜`-darkest #d1413c`｜`-text black`｜`-background #fff0f0`｜`-icon-background #ffdad6`＋`-color #700000`＋`-icon-color #700000` |
| warning | `#fceeca`｜`-dark #f5c354`｜`-darker #f3ab2c`｜`-darkest #ec8b14`｜`-text var(--text-primary-color)`｜`-background var(--color-warning)`｜`-icon-background var(--color-warning-dark)`＋`-color`／`-icon-color` 同指 `--text-primary-color` |
| success | `#cafccc`｜`-darker #bafabc`｜`-darkest #a5eba8`｜`-text #268029`｜`-contrast #65bb6a`｜`-contrast-hover #6bcf70`｜`-contrast-active #6edf74` |
| muted／其他 | `--color-muted var(--color-gray-30)`｜`-darker var(--color-gray-60)`｜`-darkest var(--color-gray-100)`｜`-background var(--color-gray-80)`｜`-background-darker var(--color-gray-100)`；`--color-disabled var(--color-gray-40)`｜`--color-promo var(--color-primary)`｜`--color-logo-icon var(--color-primary)`｜`--color-logo-text #190064`｜`--color-badge #0b6513` |

⇒ ★ 三个"看起来是规律"的读数＝① **`--color-danger` 是 `--color-primary` 的 R/B 互换**（`6965db`→`db6965`）＝白板色板是**派生自品牌色**的；② `--color-danger-dark` 与基色同值＝该档**实际无效**（可能是 vendor 遗留）；③ 灰阶 11 档里 **`-85` 是插入档**（暗色 UI 用）。

### 六、`--st-*` 的两份清单（★ 21 条定义在 `styles.md §十三.三` 已逐字，本节给"消费面"）

⇒ **被 `var()` 消费的 28 个名字**＝`--st-page-bg`、`--st-page-bg-hover-opaque`、`--st-selection-bg-opaque`、`--st-selection-hover-bg-opaque`、`--st-border-color`、`--st-border-radius`、`--st-index-bg`、`--st-index-bg-hover`、`--st-index-bg-selected`、`--st-index-bg-selected-hover`、`--st-scroll-left`、`--st-text-color`、`--st-max-height`、`--st-grid-columns`、`--st-row-height`、`--st-cell-padding-x`、`--st-cell-padding-y`、`--st-index-column-width`、`--st-font-family`、`--st-card-title-line-height`、`--st-accent-selection`、`--st-selection-color` ＋ 7 个 `--st-z-*`。
⇒ **8 个"只消费不定义"＝宿主注入清单**＝`--st-page-bg-hover-opaque`／`--st-selection-bg-opaque`／`--st-selection-hover-bg-opaque`／`--st-border-color`／`--st-selection-color`／`--st-accent-selection`／`--st-grid-columns`／`--st-font-family`。
⇒ **1 个"定义了却零消费"＝死变量**＝`--st-z-index-cell-header: 2`。
⇒ ☆ 表格族前缀共 3 个（`_l4u28_`／`_1xjl6_`／`_z4j2j_`），`--st-*` 横跨三者 ⇒ **变量是"跨组件共享层"，类名是"组件私有层"**。

### 七、名册取证数据（★ 记法本身要留档，否则下批复现不了"13 份"这个结论）

⇒ `/all`（所有文档）屏 `pageAssets` 资产 **128 个** → 点侧栏「任务」进任务屏 **139 个**，差集里唯一新增的 CSS＝`TaskViews.css.DghTjfLb.css`；⇒ `AIChatPopup.css`／10 份 `fontdef.*`／`BlankFont.css`／两份 `vendor-*` 全部在 `/all` 屏就已出现（＝**不按需加载**）；⇒ ⚠ **`/calendar` 屏未复验**（`T.title()` 本地超时＝tab 级队列停摆，当场停手、`browsers.list()` 确认控制面存活后 `close()`）⇒ **"13 份"只对 `/all`＋`/tasks` 两屏负责**。

### 八、★★★ 具名容器查询的逐字原文（★ 本批落盘时补做全库检索才拿到，与 §十三.九 互为"清单↔解释"）

```
/* 声明（全 13 份里唯一 1 处 container-type，在 index.css @134,582）*/
._mainWrapper_6sjpd_20{display:flex;flex-direction:column;height:100%;
  container-type:inline-size;container-name:web-shared-layout-main-wrapper}
._scrollRoot_6sjpd_28{flex:1;min-height:0}

/* 消费点（6 处）*/
@container web-shared-layout-main-wrapper (width < 452px){._docGrid_6sjpd_59{gap:8px;grid-templ…}}
@container (width >= 768px){._divider_1m9yz_56{left:14px;right:16px}}
@container (width >= 768px){._listRow_1m9yz_142{padding:12px 16px 12px 14px}}
@container (width >= 768px){._colUpdated_1m9yz_212,._colCreated_1m9yz_216{display:flex}}
@container (width >= 1024px){._colLastViewed_1m9yz_208{display:flex}}
@container web-shared-layout-main-wrapper (width >= 600px){…TaskViews 页头三条覆写…}
      ← 这条外面还包着 @media (width >= 748px){…}＝合取，不是替代
```

⇒ ☆ 检索口径（可复现）＝对 13 份逐份 `grep -o '@container'` 与 `grep -o 'container-type'` ⇒ **只有 `index.css`（5 ＋ 1）与 `TaskViews.css`（1 ＋ 0）非零**；⇒ ★ 其余 11 份（含两份 vendor 与十份字体包）**一处容器查询都没有**＝容器策略只用在 Craft 自写的浏览／列表／任务三面。

**仍未采到（本节）**：84 个哈希族里除 `_fdch5_／`_11co4_`／`_ydla7_`／`_apokp_` 之外**全部未逐条读**；KaTeX 150／151 条差集**只给了计数与 20 条样本**，未出全表；白板 108 条 `--color-*` 定义里的**重复覆写位置**（谁在后、是否暗色注入）未定位；`--st-*` 的注入方（组件 props／内联 `style`／JS）未反编译；`AdobeBlank` 的消费点未找到；m-plus 354 片的**权重×序号分布**（400／500／700 各多少片）未拆；`fontdef.*` 的 `src` 指向的 **woff2 本体未落盘**（只取了 CSS）；★ 官方**是否存在第 14 份 CSS**（日历屏）未证。

## 三十三、**长尾素材：JS 侧的"原始名册层"＝代码块语言 39 项三元组逐字全表 ＋ app shell 的 `_6sjpd_` 9 个类名与 12 个同段常量与 2 个排序枚举 ＋ `what-input` 的属性／取值／事件映射／修饰键／表单控件名单全册 ＋ CM6 的 28 个 `tok-*` 与 `&light`／`&dark` 双档机制 ＋ CJK 注入的两条路径与 12 条 locale 前缀表 ＋ `--st-*` 的 13 个注入名（与 §六 的 8 个宿主名对齐）**（✓盘上 第 107 批 2026-09-30 15:4x–16:0x，**零浏览器调用、零写入**；★ 本节只放"逐字清单"，解释与判定在 `internals.md §四十六`／`styles.md §十四`／`model.md §一之六十五`／`interactions.md V101`，gap 行 `gap.md` G1080–G1091；原始机读结果＝`_harvest/b107-probe1.txt`～`b107-probe5.txt`；★ 与 §三十二 的分工＝§三十二 是 CSS 层清单、本节是 JS 层清单，两节的唯一交叉点是 `--st-*`）

### 一、代码块语言三元组（39 项，逐字，按数组内出现序；源＝`CodeEditorWrapper-DB8UxA00.js` @28,995，整表用括号配平取出，数组 2,211 字符）

| # | storedLangCode | langCode | label |
|---|---|---|---|
| 1 | `ada` | `ada` | Ada |
| 2 | `bash` | `bash` | Bash |
| 3 | `cpp` | `cpp` | C++ |
| 4 | `cs` | `csharp` | C# |
| 5 | `css` | `css` | CSS |
| 6 | `dart` | `dart` | Dart |
| 7 | `dockerfile` | `dockerfile` | Dockerfile |
| 8 | `math_formula` | `stex` | Formula (TeX) |
| 9 | `go` | `go` | Go |
| 10 | `groovy` | `groovy` | Groovy |
| 11 | `haskell` | `haskell` | Haskell |
| 12 | `html` | `html` | HTML |
| 13 | `java` | `java` | Java |
| 14 | `javascript` | `javascript` | JavaScript |
| 15 | `json` | `json` | JSON |
| 16 | `julia` | `julia` | Julia |
| 17 | `kotlin` | `kotlin` | Kotlin |
| 18 | `lua` | `lua` | Lua |
| 19 | `markdown` | `markdown` | Markdown |
| 20 | `matlab` | `matlab` | Matlab |
| 21 | `mermaid` | `mermaid` | Mermaid |
| 22 | `objectivec` | `objectiveC` | Objective-C |
| 23 | `perl` | `perl` | Perl |
| 24 | `php` | `php` | PHP |
| 25 | `prolog` | `prolog` | Prolog |
| 26 | `plaintext` | **`null`** | Plain text |
| 27 | `python` | `python` | Python |
| 28 | `r` | `r` | R |
| 29 | `ruby` | `ruby` | Ruby |
| 30 | `rust` | `rust` | Rust |
| 31 | `scala` | `scala` | Scala |
| 32 | `shell` | `shell` | Shell |
| 33 | `sql` | `sql` | SQL |
| 34 | `swift` | `swift` | Swift |
| 35 | `typescript` | `tsx` | TypeScript |
| 36 | `vbnet` | `vbnet` | Visual Basic.NET |
| 37 | `xml` | `xml` | XML |
| 38 | `yaml` | `yaml` | Yaml |
| 39 | `other` | `other` | Other |

⇒ ☆ **两码不同的恰好 5 项**＝`cs→csharp`、`objectivec→objectiveC`（★ 唯一的大写 `C`，grammar 侧大小写敏感时会踩）、`typescript→tsx`（★ 不是 `typescript`）、`math_formula→stex`、`plaintext→null`（★ 全表唯一非字符串）。
⇒ ☆ **破坏字母序的一处**＝`math_formula` 夹在 `dockerfile` 与 `go` 之间（其余 38 项按 `storedLangCode` 升序，`other` 固定末尾）＝"公式"是被插进列表的，不是原生成员。
⇒ ☆ **label 大小写混形**＝缩写全大写的有 `C++／C#／CSS／HTML／JSON／PHP／SQL／XML／R`，但 **`Yaml` 只首字母大写**（同族该写 `YAML`）；另有 `Formula (TeX)`／`Plain text`／`Visual Basic.NET` 三处带空格或括号的长名 ⇒ 本地照抄时**不要顺手规范化**（承「产品自己的字符串表会暴露自相矛盾」）。
⇒ ☆ i18n 引用逐字＝面板标题用 `blockdetails.language`、搜索框用 `blockdetails.search.languages`（本批只读到这两个 key，其余条目全走数组 `label`、**不经语言包** ⇒ 语言选择器在非中文界面也显示英文 label）。

### 二、app shell 的 `_6sjpd_` 族：9 个类名 ＋ 同段 12 个常量 ＋ 2 个排序枚举（逐字，源＝`index-DiTmKH3z.js` @2,487,132～@2,487,400）

| 对象键 | 类名串 | 族内行号 |
|---|---|---|
| `noScroll` | `_noScroll_6sjpd_1` | 1 |
| `viewWrapper` | `_viewWrapper_6sjpd_5` | 5 |
| `headerWrapper` | `_headerWrapper_6sjpd_13` | 13 |
| `mainWrapper` | `_mainWrapper_6sjpd_20` | 20 |
| `scrollRoot` | `_scrollRoot_6sjpd_28` | 28 |
| `scrollViewport` | `_scrollViewport_6sjpd_33` | 33 |
| `headingWrapper` | `_headingWrapper_6sjpd_39` | 39 |
| `headingRightWrapper` | `_headingRightWrapper_6sjpd_51` | 51 |
| `docGrid` | `_docGrid_6sjpd_59` | 59 |

⇒ ★ 这族就是 §三十二.八／`styles.md §十三.九` 那条**具名容器查询的宿主**（`mainWrapper` @20＝`container-type:inline-size` 的声明者）；⇒ ☆ 行号间距（1／5／13／20／28／33／39／51／59）与 CSS 里规则块的顺序一致 ⇒ **可用行号差反推每条规则的块大小**。
⇒ **同段 12 个常量逐字**＝`T_=208`、`$h=16`、`ic=20`、`D7=8`、`QJ=240`、`ob=200`、`of=1/1.25`、`FEt=268`、`NEt=5`、`hm=65`、`dS=!0`、`uS=100`；⚠ ~~本批未读到任何一个的使用点 ⇒ 含义全部未定~~ ⇒ ✎ **第 108 批全部结案**（12 个用处逐条见 **§三十四.三**／`internals §四十七.三`／**G1096**）＝基准卡宽 200／桌面 gap 20／窄档 gap 8／左右内边距 16／卡宽上限 268／列数上限 5／**卡片宽高比 `of=1/1.25`**／封面图请求宽 208／空态占位卡 240×300／列表行高 65／入场动画 appear＋timeout 100；★ 其中 `of` **不是 DPR**（本目录历批的 OS→css 换算式与它无关）＝**卡片宽高比**，用在 `height = width / of` 与 `boxAspectRatio:of`。
⇒ **两个枚举逐字**＝`wi = {Name:"Name", Shared:"Shared", SharedBy:"SharedBy", LastViewed:"LastViewed"}` 与 `ja = {Ascending:"Ascending", Descending:"Descending"}` ⇒ ☆ 与第 103 批的稳定锚点 `BUTTON[data-testid="browse-sort-button"]` 咬合＝**浏览屏排序＝四维度 × 两方向**，且四维度里有两个（`SharedBy`／`LastViewed`）本地排序面板没有（`model.md §一之六十五`）。

### 三、`what-input` v5.2.12 全册（源＝`vendor-BZCR0rqu.js`，文件头注释 @2,527 逐字带 `@link`／`@license MIT`；常量块 @3,303；`Aa` @4,961；`Oa` @5,490；`Pa` @5,517；`Ua` @5,816）

⇒ **写入的属性 4 个**＝`data-whatinput`（上一次输入类型）、`data-whatintent`（当前意图）、`data-whatelement`、`data-whatclasses`；★ 属性名是**拼出来的**＝`Pr.setAttribute("data-what" + Xa, Xa === "input" ? Hr : ca)` ⇒ 按字面串全库检索会 0 命中。
⇒ **取值**＝`initial`（初值，`Hr="initial", ca=Hr`）、`mouse`、`keyboard`、`touch`；☆ 事件表里另有 `"pointer"` 这个中间值，但 `pointer` 立刻被 `La` 换成 `pointerType` 真值 ⇒ **`data-what*` 上不会出现 `pointer`**（本批按代码判定，未屏上复验）。
⇒ **事件→类型映射逐字**＝`{keydown:"keyboard", keyup:"keyboard", mousedown:"mouse", mousemove:"mouse", MSPointerDown:"pointer", MSPointerMove:"pointer", pointerdown:"pointer", pointermove:"pointer", touchstart:"touch", touchend:"touch"}`。
⇒ **`pointerType` 表逐字**＝`{2:"touch", 3:"touch", 4:"mouse"}` ＋ `pointerType==="pen" → "touch"` ⇒ ★ **手写笔归 touch**；另 `typeof pointerType=="number"` 才查表，字符串（现代浏览器）直接透传（`"mouse"`／`"touch"`／`"pen"`／`"eraser"`）。
⇒ **修饰键排除表逐字**＝`ma=[16,17,18,91,93]`（Shift／Ctrl／Alt／MetaLeft／MetaRight）；`specificKeys` 默认空数组 `ga=[]`。
⇒ **表单控件名单逐字**＝`pa=["button","input","select","textarea"]`（intent 冻结判据，见 `V101` 第 3 条）。
⇒ **持久化**＝`sessionStorage` 键 `what-input`／`what-intent`；闸门属性 `data-whatpersist="false"`（读 `documentElement` 或 `body`）。〔✎ **第 108 批屏上补测**＝官方页面上 `documentElement.dataset.whatpersist` 实测为 **`null`** ⇒ **闸门从未被拉下、持久化是开着的**（两键实测在写、进屏读到 `mouse／mouse`）⇒ 本行"闸门属性"只是库能力，**不要读成"官方关了持久化"**〕
⇒ **API 面 6 个**＝`ask`、`element`、`ignoreKeys`、`specificKeys`、`registerOnChange`、`unRegisterOnChange`；⇒ ☆ **无 SSR 退化桩逐字**＝`{ask:function(){return "initial"}, element:function(){return null}, ignoreKeys:function(){}, specificKeys:function(){}, registerOnChange:function(){}, unRegisterOnChange:function(){}}`（`typeof document>"u" || typeof window>"u"` 时整套 API 退化成这份桩 ⇒ **服务端渲染阶段属性为 `initial`、且不会被写**）。
⇒ **其余三个回调**＝`Ua`（`focusin`）只写两个诊断属性、`qa`（`focusout`）把两个都 `removeAttribute`、`Ta`（`DOMContentLoaded`）回灌并首次 `Oa("input")＋Oa("intent")`。

### 四、CodeMirror 6 侧名册（源＝`vendor-code-editor-BLm003PU.js`，`tok` 表 @279,197、主题 @165,452～@166,700；`basicSetup` 在 `CodeEditorWrapper-DB8UxA00.js`）

⇒ ⚠ **本行初稿把名册记错、第 108 批就地更正＝真名册是 29 个不同名／30 条声明**（初稿正则只收 `[a-z0-9]+`，**把 camelCase 后缀截断了**）；⇒ 更正后的 28 个 `tok-*` 类名逐字（按 `class:"tok-"` 表内出现序）＝`tok-link`、`tok-heading`、`tok-emphasis`、`tok-strong`、`tok-keyword`、`tok-atom`、`tok-bool`、`tok-url`、`tok-labelName`、`tok-inserted`、`tok-deleted`、`tok-literal`、`tok-string`、`tok-number`、`tok-string2`、`tok-variableName`、`tok-local`、`tok-definition`、`tok-variableName2`、`tok-propertyName`、`tok-typeName`、`tok-namespace`、`tok-className`、`tok-macroName`、`tok-operator`、`tok-comment`、`tok-meta`、`tok-invalid`、`tok-punctuation`。
⇒ ★ ☆ 形状＝`{tag: W.link, class:"tok-link"}` 的数组，外面包的是 @lezer/highlight 的 **class 表工厂**（逐字 `function n_t(r,i){…s[p.tag.id]=p.class…return{style(p){…}}}`）⇒ **只映射 tag→class、完全不含颜色**；★ 而**13 份 CSS 里 `.tok-*` 规则 0 条、chunk 内规则形态 0 条** ⇒ ⇒ **本构建里这套 class 表没有配色来源**，真正的颜色来自代码块主题自带的 `styles`（`internals §四十七.一／二`、**G1094**）；☆ 数组前面有一句 `i instanceof j2 && (i.name = r)`（给 `tags` 里没具名的补名）⇒ **前 4 个（link／heading／emphasis／strong）不是语言 token、是 markdown 面**（`tok-heading`／`tok-emphasis`／`tok-strong` 与本地 `lowlight` 的 `hljs-*` 命名完全不同体系）。
⇒ **双档机制逐字**＝`Sxe=u4.newName(), C9t=u4.newName(), Y9t=u4.newName(), W9t={"&light":"."+C9t, "&dark":"."+Y9t}` ＋ `new u4(i, {finish(l){ return /&/.test(l) ? l.replace(/&\w*/, …) : l }})` ⇒ ☆ 三个 `newName()`＝两个主题类＋一个未定性变量。
⇒ **两条明写的暗档值**＝`&light .cm-content{caretColor:"black"}`／`&dark .cm-content{caretColor:"white"}`；`&light .cm-selectionBackground{background:"#d9d9d9"}`／`&dark{background:"#222"}`；另 `.cm-line{display:"block";padding:"0 2px 0 6px"}`、`.cm-layer{position:"absolute";left:0;top:0;contain:"size style";& > *{position:"absolute"}}`、正文 `white-space:"pre-wrap"`／`word-break:"break-word"`／`overflow-wrap:"anywhere"`／`flex-shrink:1`。
⇒ **`basicSetup` 逐字**＝`{highlightActiveLineGutter:t, highlightActiveLine:t, searchKeymap:!1, foldGutter:!1, highlightSelectionMatches:!1, autocompletion: k==="web", closeBrackets:!0}`（`t`＝可编辑位、`k`＝surface）；同段编辑器 props＝`readOnly:!t, editable:t, height:"100%", theme: j ?? void 0` ＋ `onMouseDown`／`onTouchEnd` 两个处理器。

### 五、CJK 字体 CSS 的运行时注入名册（源＝`index-DiTmKH3z.js` @492,279～@493,100）

⇒ **注入清单只有 2 条**＝`NHe = ["_cjk/common/fontdef.css", "_japanese/rounded/m-plus-rounded-1c/fontdef.css"]`；**触发白名单**＝`FHe = ["ja","ko","zh-Hans","zh-Hant"]`；**标记属性**＝`X1e = "data-cjk-font-css"`；**构建号**＝`BHe = "r-48-g9244379"`。
⇒ **URL 形状逐字**＝`${去尾斜杠的 publicUrlPrefix}/static/fonts/${UHe()}${路径}`，`UHe()` 返回 `` `${BHe}/` ``；⚠ 同一函数有一条**恒假分支**（`!IS_DESKTOP && !1`）⇒ 桌面／Web 两套前缀的开关被常量折叠，**当前构建只余 Web 路**。
⇒ **建链逐字**＝`o.rel="stylesheet"` ＋ `o.setAttribute(X1e,"true")` ＋ `o.setAttribute("fetchpriority", e)` ＋ **`o.media="print"`，`o.onload=()=>{o.media="all"}`**，然后 `document.head.appendChild(o)`；**幂等闸门**＝`document.head.querySelector("link[data-cjk-font-css]") != null`；调度＝`requestAnimationFrame` ＋ `setTimeout(…, 0)` 双保险、只跑一次（`Cu`／`MR` 两个模块级变量）。
⇒ **12 条 locale 前缀表逐字**＝`{en:["en"], de:["de"], es:["es"], fr:["fr"], it:["it"], pl:["pl"], ja:["ja"], ko:["ko"], vi:["vi"], "pt-BR":["pt-BR","pt"], "zh-Hans":["zh-CN","zh-Hans","zh"], "zh-Hant":["zh-TW","zh-Hant"]}`；★ 归一化算法＝把 `(候选串 → 规范名)` 摊平成对、**按候选串长度降序排序**，再做 `startsWith` 首中即返 ⇒ ☆ `"zh-CN"` 命中的是 `"zh-CN"`（最长）而不是 `"zh"`，这个排序是有意的。
⇒ ☆ 顺带读到**语言包条数**：同一句里 12 个 locale 的 `translationCaches.<lang>` 回退到打包常量（`it/de/es/fr/ja/ko/vi/pl/pt-BR/zh-Hans/zh-Hant` ＋ 内置 `en`）⇒ **官方把 12 份翻译全打进主包**（第 108 批可查每份大小）。

### 六、`--st-*` 的 JS 注入名全列（13 个，源＝`index-DiTmKH3z.js` 的 20 处 `--st-` ＋ `EditorPopup` 的 4 处；★ 消费面在 §六、兜底值与双向机制在 `internals.md §四十六.三`）

⇒ **index 侧 13 个注入名逐字**＝`--st-row-height`、`--st-index-column-width`、`--st-scroll-left`、`--st-grid-columns`、`--st-selection-color`、`--st-page-bg`、`--st-page-bg-hover-opaque`、`--st-text-color`、`--st-border-color`、`--st-font-family`、`--st-accent-selection`、`--st-selection-bg-opaque`、`--st-selection-hover-bg-opaque`。
⇒ **EditorPopup 侧 3 个**＝`--st-font-family`（★ 值是**从锚点元素 `getComputedStyle().getPropertyValue()` 读出来的**）、`--st-text-color`、`--st-border-color`。
⇒ ★ **与 §六 的 8 个"只消费不定义"对齐＝8 个全部落在 13 个里**；JS 额外注入的 5 个＝`--st-row-height`、`--st-index-column-width`、`--st-scroll-left`、`--st-page-bg`、`--st-text-color` ⇒ ☆ 这 5 个**在 CSS 里有默认定义**（行高 35px／索引列宽 45px），JS 用内联 `style` 覆写 ⇒ **优先级链＝JS 内联 ＞ CSS 声明 ＞ JS 反读的 `||35`／`||45` 兜底**（"CSS 是几何真源"这条只对没被内联覆写的实例成立，比 §四十六.三 的说法更准确）。
⇒ 两个注入形态逐字＝内联对象 `{"--st-grid-columns": l, "--st-row-height": dt}`（`dt` 是模板串 `` `${行高}px` ``）＋ `el.style.setProperty("--st-scroll-left", `${el.scrollLeft}px`)`（另一处在 `requestAnimationFrame` 里与 `transform: translateX(-f px)` **同时**写）。

### 七、名册取证数据（★ 记法要留档，否则下批复现不了本节任何一张表）

⇒ **零新增下载**＝检索面是历批缓存的 `_harvest/js/` **105 个 chunk**，本批没有一次浏览器调用；⇒ 三条取表法＝① **先扫 import 图选题**（对全部 chunk 的 import 串找 `vendor-code-editor` 的引用方 ⇒ 14 个消费者，据此断定"代码块是跨面组件"）；② **属性名可能是拼出来的**（`"data-what" + Xa`）⇒ 字面串 0 命中时退到"库名注释／`setAttribute(` 调用点／`dataset.` 读法"三路再搜（本批 `document.documentElement.dataset.whatintent` 是在 @2,099,675 撞到的第二路）；③ **数组字面量用括号／花括号配平取整表**（39 项三元组、`_6sjpd_` 名册都是这么出来的，**别按首个 `]` 切**）。
⇒ ⚠ **非 ASCII 只记形状**＝`AdobeBlank` 探测分支里的基准串在盘上副本里是 mojibake（承「bundle 非 ASCII 会误解码」）⇒ 本节不抄字面、不给长度；☆ 同段还有一条 `n.font='10px sans-serif"'`（★ 串尾多一个 `"`，看着像官方源码里的引号错位，**不当缺陷登记**）。
⇒ ☆ 本节**全部为代码断言、零屏上证据**；欠的证据清单在 `interactions.md V101` 末尾与「仍未采到」。

**仍未采到（本节）**：`_6sjpd_` 同段 12 个常量的**使用点**（一个都没读到）；`tok-*` 的**具体配色**（只拿到类名，样式在 `highlightStyle` 的另一半里未读全）；grammar 能力面（本批只读到"vendor 里的语言名比 39 档多"这个形状，**未量化**）；`Sxe` 第三个 `newName()` 的用途；`MermaidRender-DrFu6-mF.js` 本体未读（`themeId` 取值表、图类型支持面未知）；`blockdetails.*` 里代码块相关的其他 key 未逐条读；`storedLangCode` 在**写侧**的字段名（MCP／mutation）未取证 ⇒ 需一次 `blocks add` 读回（写入批）；★ 12 份 `translationCaches` 的体积与是否全量打进主包未量化。

## 三十四、**长尾素材：代码块主题名册逐字（21 键）＋ `craftlight`／`craftdark` 两套 settings 与 token 色板全量逐字 ＋ 排版四族的**值**表（`--ui-*` 15 组合 ＋ `--caption-*` 4 ＋ `--body-*` 5，`--heading-*` 见 §十四）＋ `_6sjpd_` 12 个常量的用处逐条 ＋ 浏览屏网格四条公式逐字 ＋ `tok-*` 更正后的 29 个名册 ＋ `vendor-code-editor` 引用面的逐符号拆分**（✓盘上＋屏上 第 108 批 2026-09-30 16:1x–16:5x，**零写入、零沙盒**；★ 本节只放逐字清单，解释在 `internals.md §四十七`／`styles.md §十五`／`model.md §一之六十六`／`interactions.md V102`，gap 行 `gap.md` §三点一〇五八 G1092–G1104；机读结果 `_harvest/b108-probe1.txt`～`b108-probe17.txt`；⚠ 本节同时**更正 §三十三.四 的 `tok-*` 名册**（已就地 ✎）与 **§三十三.二 的 `of` 猜测**）

### 一、代码块主题名册（21 键，逐字，源＝`CodeEditorWrapper-DB8UxA00.js` @28,692）

| 键 | 实现 | 键 | 实现 |
| --- | --- | --- | --- |
| `auto` | **`null`**（解析成 craft 两档） | `materialdark` | 具名第三方板 |
| `craftdark` | **官方自写**（＝`fo()`，板见 §二） | `materiallight` | 具名第三方板 |
| `craftlight` | **官方自写**（＝`io()`，板见 §二） | `noctislilac` | 具名第三方板 |
| `atomone` | 具名第三方板 | `nord` | 具名第三方板 |
| `aura` | 具名第三方板 | `sublime` | 具名第三方板 |
| `bbedit` | 具名第三方板 | `tokyonightday` | 具名第三方板 |
| `darcula` | 具名第三方板 | `tokyonightstorm` | 具名第三方板 |
| `dracula` | 具名第三方板 | `tokyonight` | 具名第三方板 |
| `githubdark` | 具名第三方板 | `vscodedark` | 具名第三方板（＝`qo()`） |
| `githublight` | 具名第三方板 | `gruvboxdark`／`gruvboxlight` | 具名第三方板 |

⇒ ☆ `auto` 的解析式逐字＝`De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]`；⇒ ⚠ **本批只逐字了 craft 两档**，其余 18 档的 settings／styles 未抄（同 chunk 内，可下批补）〔✎ **第 109 批结案**＝20 档工厂形状、settings 对象名、tag 条目数与 dark 标记全表见 §三十五.一；⚠ 但只有 7 个 settings 对象逐字到底（底色已读），其余 14 档的 background 仍未抄〕；⇒ ☆ 与语言选择器同族的 i18n 逐字＝`blockdetails.theme`「主题」／`blockdetails.themes`／`blockdetails.search.themes`「搜索主题」＋ `blockdetails.language`「语言」／`blockdetails.search.languages`。

### 二、★★★ `craftlight`／`craftdark` 两套逐字（settings ＋ token 色板）

⇒ **`craftlight`（`go = io()`）settings 逐字**＝`{background:"#FBFBFB", foreground:"#3D3D3D", selection:"#BBDFFF", selectionMatch:"#BBDFFF", gutterBackground:"#FBFBFB", gutterForeground:"rgba(31,34,37,0.3)", gutterActiveForeground:"rgba(31,34,37,0.6)", lineHighlight:"rgba(0,0,0,0.03)", fontFamily:"Roboto Mono, monospace"}` ⇒ ⚠ **无 `caret`、无 `gutterBorder`**（这两条不写 ⇒ CM6 走默认插入符）；
⇒ **`craftlight` token 色板逐字（＝GitHub Light 系）**＝

| tag（逐字分组） | color | 附加 |
| --- | --- | --- |
| `comment`, `bracket` | `#6a737d` |  |
| `className`, `propertyName` | `#6f42c1` |  |
| `variableName`, `attributeName`, `number`, `operator` | `#005cc5` |  |
| `keyword`, `typeName`, `typeOperator`, `typeName` | `#d73a49` | ☆ `typeName` 在同一组里**写了两遍** |
| `string`, `meta`, `regexp` | `#032f62` |  |
| `name`, `quote` | `#22863a` |  |
| `heading` | `#24292e` | `fontWeight:"bold"` |
| `emphasis` | `#24292e` | `fontStyle:"italic"` |
| `deleted` | `#b31d28` | `backgroundColor:"ffeef0"`（⚠ **缺前导 `#`**＝官方逐字串，看着像 bug，登记不修正；✎ 第 109 批全量复扫＝**四档同串**，见 §三十五.四 ④） |

⇒ **`craftdark`（`uo = fo()`）settings 逐字**＝`{background:"#28292B", foreground:"#CECFD0", caret:"#fff", selection:"#385576", selectionMatch:"#385576", lineHighlight:"rgba(255,255,255,0.05)", gutterBackground:"#28292B", gutterForeground:"rgba(255,255,255,0.4)", gutterActiveForeground:"rgba(255,255,255,0.7)", gutterBorder:"#f4f4f41f", fontFamily:"Roboto Mono, monospace"}`；
⇒ **`craftdark` token 色板逐字（＝GitHub Dark 系）**＝`comment`／`bracket`＝`#8b949e`；`className`／`propertyName`＝`#d2a8ff`；`variableName`／`attributeName`／`number`／`operator`＝`#79c0ff`；`keyword`／`typeName`／`typeOperator`＝`#ff7b72`；`string`／`meta`／`regexp`＝`#a5d6ff`；`name`／`quote`＝`#7ee787`；`heading`＝`#d2a8ff`＋bold；`emphasis`＝`#d2a8ff`＋italic；`deleted`＝`#ffdcd7`＋`backgroundColor:"ffeef0"`（★ 与亮档同一条**没有 `#` 的底色串**）；
⇒ ★★★ **两套的结构性结论**＝**官方自写的 craft 两档 ＝ "GitHub Light／GitHub Dark 的 token 色板 ＋ 一套自己的容器色（底／前景／选区／行高亮／gutter）＋ Roboto Mono"** ⇒ ⇒ **与 app 的 `--accent-*`／`--editor-*` 完全无关**（☆ 全库仅 Excalidraw chunk 出现过一次 `--editor-`）；⇒ ⚠ **`craftdark` 的 `theme` 形参停在工厂默认 `"light"` 未被覆盖**（`fo` 的默认是 `t="light"`，调用是 `fo()`）⇒ 注册成 `EditorView.theme(O,{dark:false})` ⇒ 后果未屏上复验，登记为**官方错配候选**；⇒ ☆ 装配式逐字＝`g = li.theme(O,{dark:i==="dark"}), w = uE.define(l), Q = [g, R6e(w)]` ⇒ **主题一次产出两条扩展＝容器样式 ＋ 上色**。

### 三、★★ `_6sjpd_` 同段 12 个常量的用处逐条（第 107 批欠的那条，本批结掉）

| 常量 | 值 | 用处（逐字片段） |
| --- | --- | --- |
| `ob` | `200` | 卡片基准宽（列数公式里 `(ob + ic)`＝220 一档） |
| `ic` | `20` | 桌面档 gap（`gap:ic`；`jme=Ame*2+ob*2+ic`） |
| `D7` | `8` | 窄档／移动档 gap（`({$isMobile:t})=>t?D7:ic`；两列分支 `const r=D7`） |
| `$h` | `16` | 左右内边距（`Ame=$h`、`x7e=$h`、`w7e=$h` 三处别名都参与 `padding*2`） |
| `FEt` | `268` | **卡宽上限**（`r=Math.min(l,FEt)`；另有独立的 `dDt=268` 作 masonry 列 `max-width`） |
| `NEt` | `5` | 列数上限（`i=Math.min(s,NEt)`） |
| `of` | `1/1.25`（＝0.8） | ★ **卡片宽高比**（`rowHeight=(t-(c-1)*r)/c/of`、`boxAspectRatio:of`、`height:QJ/of`）⇒ **不是 DPR** |
| `T_` | `208` | 封面图请求宽（`Wme(url, window.devicePixelRatio*T_, e)` ＋ `width:T_`） |
| `QJ` | `240` | 空态占位卡（`width:QJ;height:QJ/of`＝**240×300**，`border-radius:8px`，`&.isHidden{visibility:hidden}`） |
| `hm` | `65` | **列表档行高**（`estimateSize:()=>hm` ＋ `Pe=hm` 的拖拽矩形 `height`） |
| `dS` | `true` | 入场动画 `appear`（`<Transition in appear:dS timeout:uS>`） |
| `uS` | `100` | 入场动画 `timeout:100`（＝**卡片入场 100ms**） |

### 四、网格四条公式逐字（源＝`index-DiTmKH3z.js` @2,499,970～／@2,989,862～／@2,994,728～）

⇒ **公式一（列数）**＝`jme = 16*2 + 200*2 + 20`（＝452）；`uDt = t => { if (t < jme) return 2; const e = t - 16*2, n = Math.floor((e + 20) / (200 + 20)); return Math.max(2, Math.min(n, 5)); }`；
⇒ **公式二（瀑布流行高）**＝`MZt(t)`：`t<=0 → {columns:1, gap:20, rowHeight:0}`；`t + 32 < 452 → {columns:2, gap:8, rowHeight:(t-8)/2/of + 8}`；否则 `gap=20, s=max(1, floor((t+20)/(200+20))), rowHeight=(t-(s-1)*20)/s/of + 20`；
⇒ **公式三（网格卡宽）**＝`$Zt`／同族：`i = min(s, 5)`；`columnWidth = (t - (i-1)*gap)/i`；`cardWidth = min(columnWidth, 268)` ⇒ ★ **超过 5 列后卡宽不再增长**（余量变成留白）；
⇒ **公式四（布局落地）**＝网格项**绝对定位**（逐字 `style:{top:M.y, left:M.x, width:M.width}`）＋ **虚拟滚动**（`estimateSize`／`overscan`）＋ 列表档行高 65；
⇒ ☆ 另两处同族阈值＝`UZt = 16*2 + 200*2 + 20`（第三份网格实现，与 `jme`／`PZt` 同式）⇒ ⇒ **官方有三份并列的网格尺寸函数**（`uDt` 列数、`MZt` 行高、`$Zt` 卡宽），共用同一组常量。

### 五、★ `tok-*` 更正后的名册（29 个不同 class 名／30 条声明，源＝`vendor-code-editor-BLm003PU.js` @279,180）

⇒ 逐字序＝`tok-link`、`tok-heading`、`tok-emphasis`、`tok-strong`、`tok-keyword`、`tok-atom`、`tok-bool`、`tok-url`、`tok-labelName`、`tok-inserted`、`tok-deleted`、`tok-literal`、`tok-string`、`tok-number`、`tok-string2`、`tok-variableName`、`tok-local`、`tok-definition`、`tok-variableName2`、`tok-propertyName`、`tok-typeName`、`tok-namespace`、`tok-className`、`tok-macroName`、`tok-operator`、`tok-comment`、`tok-meta`、`tok-invalid`、`tok-punctuation`；
⇒ ☆ 三条形状注记＝① `tok-local` 与 `tok-definition` 是**双 class 条目**（`class:"tok-variableName tok-local"`）⇒ 所以"30 条声明／29 个不同名"；② `tok-string2` 来自 `{tag:[W.regexp, W.escape, W.special(W.string)]}`；③ 表前一句 `for (let r in W) { let i = W[r]; i instanceof j2 && (i.name = r) }`＝给没具名的 tag 补名；
⇒ ★ **本套 class 名在本构建里没有配色来源**（13 份 CSS 内 `.tok-*` 0 条、chunk 内规则形态 0 条）⇒ 见 `internals §四十七.二`／**G1094**。

### 六、排版四族的**值**表（`--heading-*` 30 条已在 `styles.md §十四.一`，此处补其余三族）

⇒ `--ui-*`（15 组合＝60 个 token，逐字）＝

| 档 | size | weight | line-height | letter-spacing |
| --- | --- | --- | --- | --- |
| `xs-500` | 11px | 500 | 13.2px | .05px |
| `sm-400`／`sm-500` | 12px | 400／500 | 14.4px | .01px |
| `md-400`／`md-500`／`md-600` | 13px | 400／500／600 | 16px | −.04px |
| `lg-400`／`lg-500`／`lg-600` | 14px | 400／500／600 | 16px | −.09px |
| `xl-400`／`xl-500`／`xl-600` | 15px | 400／500／600 | 18px | −.13px |
| `xxl-400`／`xxl-500`／`xxl-600` | 16px | 400／500／600 | 19.2px | −.18px |

⇒ `--caption-*`（4 组合＝16 个 token，逐字）＝`md-400`＝11px／400／**16px**／**.01px**；`md-500`＝11px／500／**13.2px**／**.05px**；`lg-400`＝12px／400／16px／**.05px**；`lg-500`＝12px／500／16px／**.01px**；⇒ ⚠ **加粗那两格是 §十五.四 的官方不自洽候选**（`md` 档 400 与 500 的行高／字距互反）。
⇒ `--body-*`（5 组合＝22 个 token，逐字）＝`md-400`＝13px／400／15.6px／−.04px；`md-500`＝13px／500／15.6px／−.04px；`md-600`＝13px／600／15.6px／−.04px；`md-400-italic`＝同 400 ＋ `-style: italic`（5 条）；`md-500-italic`＝同 500 ＋ `-style: italic`（5 条）；⇒ ★ **body 只有 `md` 一档 size、且 600 没有 italic 变体**（三档权重里只前两档有斜体族）。
⇒ ☆ 四族 size 的**交叉关系**＝`ui` 11–16px／`caption` 11–12px／`heading` 11–14px／`body` 13px ⇒ ⇒ **正文只有一档 13px**，而 `.tiptap` 根字号在本地是 16px（`src/app/globals.css:360`）＝一条可裁的度量差分候选（未屏上量过官方正文像素）。

### 七、`vendor-code-editor-BLm003PU.js` 引用面的逐符号拆分（★ 本批的自我纠正，G1104）

⇒ 该 chunk **3,564,744 字符**；被引用面＝**side-effect import 53 处 ＋ 具名 import 14 处**；⇒ ★ **14 处具名里有 13 处只引 `_`**（＝Vite 的 `__vitePreload` helper，逐字 `import{_ as an}from"./vendor-code-editor-BLm003PU.js"`）⇒ **真正引 CM6 符号的只有 `CodeEditorWrapper-DB8UxA00.js` 一处**（它一次引 8 个符号＝`c as I, t as e, _ as ve, l as kt, a as yt, b as xt, E as Ct, d as vt, R as wt`）；
⇒ ⇒ ☆ 修正后的结论＝**CM6 在官方架构里是"单一消费者"组件**（不是第 107 批说的跨面组件）；side-effect import 仍会把该 chunk 放进依赖闭包，**但"每个功能屏都实际下载 3.5MB"未取证**（网络面被 CDP 封，承既有边界）；
⇒ ☆ 方法学修正＝**"按 import 图选题"这个工具仍然可用，但产出的是"谁引 helper"**；要判"跨面"必须**逐符号拆**（本批就是这么把自己上一条结论推翻的）。

**仍未采到（本节）**：18 档第三方主题的 settings／styles 逐字（只逐字了 craft 两档）；`qo()`（vscodedark）只读到尾部片段；`tok-*` 表有没有被注册进 `extensions`（`...g` 未展开）；`dDt=268` 与 `FEt=268` 是不是同一个量的两份定义（未追使用点）；三份网格函数（`uDt`／`MZt`／`$Zt`）各自服务哪个屏（组件归属未追）；`--body-*` 只有 `md` 一档时**大段正文**（如全屏文档视图）走哪条；☆ 官方正文实际渲染像素（13px 还是 16px）未屏上量取；☆ `--ui-*` 的 `xs-500` 之上是否还有更大档（名册里 `xxl-600` 是末端，未见 `2xl`）。

## 三十五、**长尾素材：20 档代码块主题的逐字形状表（工厂 ＋ settings 对象名 ＋ tag 条目数 ＋ `dark` 标记）＋ 列表视图 `rn` 27 键类名表逐字 ＋ 三张表头变体的枚举与标签 key ＋ 官方色值缺陷清单**（✓盘上 第 109 批 2026-09-30 17:0x–17:4x 本地＝UTC 09:0x–09:4x，全部来自 `_harvest/js/index-DiTmKH3z.js` 与 `CodeEditorWrapper-DB8UxA00.js` 与 `vendor-code-editor-BLm003PU.js` 的定点读；★ 本节只放逐字清单，机制与判定在 `internals.md` §四十八、`gap.md` G1105–G1118；⚠ 20 个工厂体全文另存 `_harvest/b109-theme-<id>.txt`，不进仓库）

### 一、★★★ 主题名册的完整形状＝"每档一个工厂 ＋ 每个工厂一个 settings 对象"

名册逐字＝`ue={auto:null, craftdark:uo, craftlight:go, atomone:so, aura:bo, bbedit:ho, darcula:lo, dracula:yo, githubdark:wo, githublight:Co, gruvboxdark:Do, gruvboxlight:Fo, materialdark:Mo, materiallight:jo, noctislilac:Ro, nord:To, sublime:Ho, tokyonightday:Po, tokyonightstorm:Uo, tokyonight:Go, vscodedark:$o}`；`auto` 解析式逐字＝`De=(o,t)=>o==="auto"?(t?ue.craftdark:ue.craftlight):ue[o]`；装配末端逐字（在 `vendor-code-editor`）＝`var g=li.theme(O,{dark:i==="dark"}), w=uE.define(l), Q=[g,R6e(w)]; return Q`。⇒ 工厂调用形状 20 档全同＝`Xf=o=>{const{theme:t="light|dark",settings:a={},styles:r=[]}={};return I({theme:t,settings:{...<settings对象>,...a},styles:[<内联 tag 条目…>,...r]})}` ⇒ ★ **解构源是字面量 `{}`、入参 `o` 恒被忽略** ⇒ 主题表封闭、不可外部覆写。

| 主题 id | 工厂＝变量 | settings 对象 | `tag` 条目数 | 工厂里的 `theme` 字面量 | 底色（逐字） | `dark` 标记与底色是否一致 |
| --- | --- | --- | --- | --- | --- | --- |
| `craftlight` | `go = io()` | `We` | 9 | `"light"` | `#FBFBFB` | ✓ 一致 |
| `craftdark` | `uo = fo()` | `Ue` | 9 | `"light"` | `#28292B` | ✗ **反了** |
| `atomone` | `so = co()` | `Pe` | 8 | `"dark"` | 未逐字（第三方板） | 未知（底色未读） |
| `aura` | `bo = mo()` | `Ke` | 20 | `"dark"` | `#21202e` | ✓ 一致 |
| `bbedit` | `ho = po()` | `Ge` | 13 | `"light"` | `#FFFFFF` | ✓ 一致 |
| `darcula` | `lo = no()` | `_e` | 9 | `"dark"` | 未逐字 | 未知 |
| `dracula` | `yo = ko()` | `qe` | 8 | `"dark"` | 未逐字 | 未知 |
| `githublight` | `Co = xo()` | `$e` | 15 | `"light"` | 未逐字 | 未知 |
| `githubdark` | `wo = vo()` | `ze` | 14 | `"dark"` | 未逐字 | 未知 |
| `gruvboxlight` | `Fo = So()` | `Ye` | 34 | `"light"` | 未逐字 | 未知 |
| `gruvboxdark` | `Do = No()` | `Ve` | 34 | `"dark"` | 未逐字 | 未知 |
| `materiallight` | `jo = Ao()` | `Qe` | 20 | `"dark"` | `#FAFAFA` | ✗ **反了** |
| `materialdark` | `Mo = Lo()` | `Xe` | 36 | `"dark"` | 未逐字 | 未知 |
| `noctislilac` | `Ro = Io()` | `Je` | 15 | `"light"` | `#f2f1f8` | ✓ 一致（这档确实是浅板） |
| `nord` | `To = Eo()` | `Ze` | 36 | `"dark"` | 未逐字 | 未知 |
| `sublime` | `Ho = Oo()` | `et` | 11 | `"dark"` | 未逐字 | 未知 |
| `tokyonightday` | `Po = _o()` | `tt` | 20 | `"dark"` | `#e1e2e7` | ✗ **反了** |
| `tokyonightstorm` | `Uo = Wo()` | `ot` | 20 | `"dark"` | 未逐字 | 未知 |
| `tokyonight` | `Go = Ko()` | `at` | 20 | `"dark"` | 未逐字 | 未知 |
| `vscodedark` | `$o = qo()` | `rt` | 17 | `"dark"` | 未逐字 | 未知 |

⇒ ☆ **"未知"是因为底色只在 settings 对象里、本批只逐字了 7 个对象**（`We／Ue／Ke／Ge／Qe／tt／Je`）；⇒ ★ 已可下的结论＝**错配至少 3 档**（`craftdark`／`materiallight`／`tokyonightday`），其中 **`craftdark` 是 `auto` 在暗档下的默认落点**；☆ 补齐动作已列第 110 批队列（把余下 14 个 settings 对象的 `background` 逐字读一遍即可判全表）。

### 二、★★★ 列表视图类名表逐字（模块 `1m9yz`，27 键 ＋ 常量名）

常量段逐字（`w$t` 起、`Y$t` 止）＝`_headerRow_1m9yz_8`／`_columnHeader_1m9yz_29 typography-caption-md-500`／`_sortable_1m9yz_43`／`_active_1m9yz_51`／`_divider_1m9yz_56`／`_listItemWrapper_1m9yz_74`／`_virtualRow_1m9yz_92`／`_isUnavailableOffline_1m9yz_102`／`_selected_1m9yz_108`／`_statusCheckbox_1m9yz_116`／`_statusCheckboxVisible_1m9yz_123`／`_starPinIcon_1m9yz_127`／`_listRow_1m9yz_142 no-select`／`_thumbnailCol_1m9yz_160`／`_nameCol_1m9yz_169`／`_rowTitle_1m9yz_179 typography-ui-md-600`／`_rowSubtitle_1m9yz_188 typography-ui-xs-500`／`_colLastViewed_1m9yz_208 _dataCol_1m9yz_197 typography-ui-sm-500`／`_colUpdated_1m9yz_212 _dataCol_1m9yz_197 typography-ui-sm-500`／`_colCreated_1m9yz_216 _dataCol_1m9yz_197 typography-ui-sm-500`／`_dataCellLastViewed_1m9yz_221`／`_dataCellUpdated_1m9yz_225`／`_dataCellCreated_1m9yz_229`／`_statusCol_1m9yz_249`／`_iconBox_1m9yz_259`／`_pinIcon_1m9yz_271`／`_starIcon_1m9yz_274`／`_dragPreviewBase_1m9yz_278`／`_dragPreviewInner_1m9yz_283`／`_virtualBody_1m9yz_290`／`_newDocTag_1m9yz_314`；聚合对象逐字＝`rn={headerRow, columnHeader, sortable, active, divider, listItemWrapper, virtualRow, isUnavailableOffline, selected, statusCheckbox, statusCheckboxVisible, starPinIcon, listRow, thumbnailCol, nameCol, rowTitle, rowSubtitle, colLastViewed, colUpdated, colCreated, dataCellLastViewed, dataCellUpdated, dataCellCreated, statusCol, iconBox, pinIcon, starIcon, dragPreviewBase, dragPreviewInner, virtualBody, newDocTag}`（27 键，值全指向上面的常量）。

⇒ ★ **四处"哈希类 ＋ 排版档"成对写死**＝表头 `typography-caption-md-500`、行标题 `typography-ui-md-600`、行副标题 `typography-ui-xs-500`、三个数据列 `typography-ui-sm-500` ⇒ 官方排版档是**组件级显式声明**（G1117）；☆ `listRow` 还成对带一个**非哈希工具类** `no-select`。

### 三、★★ 三张表头变体的枚举／标签 key 逐字（同一个 `rn` 被三处组件复用）

| 变体 | 主包偏移 | 排序枚举（逐字局部名） | 出现的列 | 标签 key（逐字） |
| --- | --- | --- | --- | --- |
| A | @2,924,800 一带 | `Bs.Title`／`Bs.LastViewed`／`Bs.Updated`／`Bs.Created` | 名称＋三数据列 | `name`／`browse.sort.last.viewed`／`updated`／`created` |
| B | @3,052,900 一带 | `Ns.Name`／`Ns.LastViewed`／`Ns.Updated`／`Ns.Created` | 同 A | 同 A |
| C | @3,411,300 一带 | `wi.Name`／`wi.Shared`／`wi.SharedBy`／`wi.LastViewed` | 名称＋共享＋共享者＋上次浏览 | `name`／`shared`／`shared.by`／`browse.sort.last.viewed` |

⇒ ★★★ **类名是"槽位"**＝变体 C 把 `rn.colLastViewed` 贴在「共享」列上（逐字 `$e(rn.columnHeader, rn.colLastViewed, rn.sortable, {[rn.active]: w})`，`w = n.sortBy === wi.Shared`）；⇒ ☆ 方向列都来自同一组件 `wd({isActive, sortDirection, sortable, ascendingValue, descendingValue})`，两档枚举逐字 `$n.Ascending`／`$n.Descending`（与第 107 批的 `Ascending／Descending` 对齐），且**只有名称列带 `style:{flexGrow:1}`**；☆ 语言包侧的列标题有两个可用 key＝裸 `name`「名称」与 `browse.sort.name`「名称」**同值**（代码用裸 key）＝官方自身不一致候选。

### 四、★★★ 官方色值缺陷清单（本批新增三条、并给一条"看着像错其实合法"的免修正标记）

① `gruvboxdark`＝`{tag:[e.annotation], color:"#fb4934d"}` ⇒ **7 位十六进制＝非法**；⇒ ★ 同一条 styles 里 `annotation` **又出现在下一条** `{tag:[e.number,e.changed,e.annotation,e.modifier,e.self,e.namespace], color:"#d3869b"}` ⇒ CM6 首条命中 ⇒ **`annotation` token 实际永久无色**。② 同档 `{tag:e.invalid, color:"#fe8019", borderBottom:"1px dotted #fb4934d"}` ⇒ 同一个非法串，**虚线边框整条失效**。③ ☆ `materiallight` 的 `color:"#E5393570"` 是**合法的 8 位 RRGGBBAA**（alpha `0x70`），与 ①② 不同类 ⇒ **登记、不要"顺手补 `#` 或截断"**。④ 承第 108 批：`deleted` 档 `backgroundColor:"ffeef0"` **缺前导 `#`**（同类缺陷，非本批新发现）；⇒ ★★★ **本批按 20 档全量复扫后该条要改写**＝同一串在 **四档里逐字相同**（`craftlight`／`craftdark`／`githublight`／`githubdark` 的 `deleted` 都是 `{color:…, backgroundColor:"ffeef0"}`），上批归因为"暗档一处"是**抽样导致的错**（已就地 ✎）；★★ 且**两档暗色沿用的是亮档粉底**（`craftdark`／`githubdark` 的 `deleted` ＝ `color:"#ffdcd7"` ＋ `ffeef0`）⇒ 在 `#28292B`／`#0d1117` 底上等于**把删除行涂成不透明浅粉**＝第二处缺陷候选，与"缺 `#`"是两条独立问题（补上 `#` 也不对）。⇒ ☆ 四条的处置建议统一＝**照抄 ＋ 注释**，否则对不上官方渲染；要修就先在产物里把"官方此处错"写死，避免下个会话以为是本地引入的回归。

**仍未采到（本节）**：① 其余 14 档 settings 的 `background` 逐字（判全表 `dark` 标记一致性）；② 各档 `settings` 里除 `background`／`foreground`／`caret`／`selection`／`gutter*` 之外的键全集；③ 第三方板与上游原版的差异（有没有被 Craft 改过色值——需要外部基准，本目录不引外部资料，默认**不做**）；④ `_statusCheckboxVisible`／`_isUnavailableOffline`／`_newDocTag` 三个状态类的触发条件；⑤ `rn` 的 `dragPreviewBase`／`dragPreviewInner` 在列表视图里的拖拽表现（与编辑器内拖拽是否同一套）。

## 三十六、第 110 批＝主题名册 `V` 全 21 条逐字、`pluginData` 两种厚度、框选常量与三型命中器、列表档 22 枚类全表（2026-09-30 18:5x–19:4x；★ 源＝`_harvest/js/index-DiTmKH3z.js`（盘上缓存，本批新取 `CodeEditorWrapper-DB8UxA00.js` 一份、抽完即删）＋ 屏上只读实测）

### 一、★★★ 代码块主题名册 `V` 全表（逐字 21 条，形状＝`{id,label,keywords,isDark,settings}`）

| # | `id` | `label`（面板可见文案） | `keywords` | `isDark` | `settings` 引用 |
| --- | --- | --- | --- | --- | --- |
| 1 | `auto` | Auto | `["system"]` | **true** | **`null`**（⇒ 走 `De` 的 auto 分支，不查表） |
| 2 | `craftdark` | Dark | `[]` | true | `Ue` |
| 3 | `craftlight` | Light | `[]` | false | `We` |
| 4 | `atomone` | Atom One | `["dark"]` | true | `Pe` |
| 5 | `aura` | Aura | `["dark"]` | true | `Ke` |
| 6 | `bbedit` | BBEdit | `["light"]` | false | `Ge` |
| 7 | `darcula` | Darcula | `["dark"]` | true | `_e` |
| 8 | `dracula` | Dracula | `["dark"]` | true | `qe` |
| 9 | `githubdark` | GitHub Dark | `["dark"]` | true | `ze` |
| 10 | `githublight` | GitHub Light | `[]` | false | `$e` |
| 11 | `gruvboxdark` | Gruvbox Dark | `["dark"]` | true | `Ve` |
| 12 | `gruvboxlight` | Gruvbox Light | `[]` | false | `Ye` |
| 13 | `materialdark` | Material Dark | **`[]`** | true | `Bo` |
| 14 | `materiallight` | Material Light | `["light"]` | false | `Qe` |
| 15 | `noctislilac` | Noctis Lilac | `["light"]` | false | `Je` |
| 16 | `nord` | Nord | `["dark"]` | true | `Ze` |
| 17 | `sublime` | Sublime | `["dark"]` | true | `et` |
| 18 | `tokyonight` | Tokyo Night | `["dark"]` | true | `at` |
| 19 | `tokyonightday` | Tokyo Night Day | `["light"]` | false | `tt` |
| 20 | `tokyonightstorm` | Tokyo Night Storm | `["dark"]` | true | `ot` |
| 21 | `vscodedark` | **VS Code**（★ 唯一一条 label 不带明暗字样而 id 带 `dark`） | `["dark"]` | true | `rt` |

⇒ ★★★ **同一档存在两个暗标记、且不同源**＝本表的 `isDark`（★ 21/21 与档名一致，含 `craftdark`＝true）与第 109 批读到的**色板工厂内部 `theme` 字面量**（该处实测 `craftdark` 自标 `"light"`、`materiallight` 与 `tokyonightday` 自标 `"dark"`）；⇒ ⇒ **CM6 侧只吃后者**（`li.theme(O,{dark:i==="dark"})` 的 `i` 是工厂里的 `theme`）⇒ ☆ 于是第 109 批 G1118 的影响面收窄＝**官方的明暗分类（名册 `isDark`、搜索 keywords、面板列表）是对的，错的只有 CM6 主题注册那一个字段**；⇒ ★ 本地若"照抄官方"必须把这两个标记分开抄，否则会把对的抄错。
⇒ ⚠ **本表与第 109 批 §三十五.一 那张"工厂名／settings 对象名／tag 条目数／dark 标记"表不能直接互推**＝本表的 `settings` 引用（如 `materialdark`→`Bo`）与上批 `ue` 名册里的值（逐字 `materialdark:Mo`）**不是同一个标识符**，而上批表那一行同时给了 `Mo = Lo()`；⇒ ☆ 三种可能＝`settings` 是喂给工厂的入参、`Mo` 是工厂产出的 CM6 `Theme` 对象（则两表是链条上下游）／两 chunk 各自混淆出不同名／其中一张表读错；**本批没有证据判定是哪一种，故不做互推、也不改上批表**，登记为下批一条零预算盘上核对项（`Bo`→`Lo()`→`Mo`→`ue.materialdark` 是否成立）。
⇒ ☆ `keywords` 的服务对象＝挑选面板的搜索框（逐字过滤式 `v.label.toLowerCase().includes(D.toLowerCase())`，另有 keywords 一并参与匹配）；☆ 名册顺序**不是字母序**＝`auto` → 官方两档 → 其余按 id 字母序（但 `tokyonight` 排在 `tokyonightday`／`tokyonightstorm` 之后＝纯字符串序里 `tokyonight` < `tokyonightday`，官方却排最后 ⇒ ☆ **面板展示序另有规则，本批未解**）。

### 二、★★ `pluginData` 的两种厚度与按 `pluginName` 分派的序列化器

codeBlock 家族（逐字，写入侧）＝`{pluginType:"codeBlock",pluginName:"codeBlock",pluginConfigurationData:{themeId:L.id},horizontalSizeClass:null,verticalSizeClass:null,surfaceShadowOpacity:1}` ⇒ **有效载荷只有一条 `themeId`**。
card 家族（逐字，序列化器 `S1e` 内）＝`{fontStyle,pageStyle,backgroundData:{backgroundColor,backgroundColorGradientEnd,userInterfaceStyle,backgroundImageURL,isLightColor,key},decorations,contentStyle,themeAssetId}` ⇒ **九字段厚对象**。
分派面（逐字）＝`case "card":{…z.themeAssetId=(G==null?void 0:G.themeAssetId)??void 0;…}` ／ `case "codeBlock":{…z.themeId=(G==null?void 0:G.themeId)??void 0;break}` ／ `default:`；白名单＝`nMe=Object.values(Xa)`，而 `Xa` 逐字＝`{Large:"card.large",Wide:"card.wide",SmallRight:"card.small.right",Subtle:"card.subtle",SmallSmallRight:"card.small.small.right"}`（★ 五条值都是 `card.*` ⇒ **`Xa` 是"卡片样式"枚举而不是 `pluginName` 枚举**，与 switch 里的裸 `"card"` 不同层，本批不合并处理）。
⇒ ☆ 另两个页面样式侧枚举顺带到手＝`Pm={Dynamic:"dynamic",Fix:"fix"}`（分页宽类型）、`ys={FULL:"full",FADED:"faded",UNKNOWN:"unknown"}`（背景淡出档）；⚠ **`themeId` 是重载键**＝页面样式域也有 `themeId`／`themeAssetId`（`dictPageStyleToOldPageStyle`、`setCustomStyle` 一带），与代码块不是同一回事。

### 三、★★★ 框选（rubber band）的常量、CSS 与三型命中器（逐字全案）

| 项 | 逐字 | 含义 |
| --- | --- | --- |
| 命中判定 | `function j7e(t,e){return t.left<e.left+e.width&&t.left+t.width>e.left&&t.top<e.top+e.height&&t.top+t.height>e.top}` | **严格矩形相交**；四边都是严格不等号 ⇒ **边贴边不算命中**，"整行入框"候选被否 |
| 起手否决 | `EVt=t=>t.closest("[data-item-id], a, button, input, textarea, select, [contenteditable='true']")!=null` | 命中这些元素则**不起手**（⇒ 从卡片上按下不是框选） |
| 起手阈值 | `const AVt=5` 且 `if(Math.sqrt(Z*Z+V*V)<AVt)return;` | 指针须移动 **≥5px（欧氏距离）** 才进入框选 |
| 自动滚动 | `const Uee=30,$ee=200` 与 `Y=±Uee*Math.pow(Math.min(越界/$ee,1),1.5)` | 越界 **200px** 内按 **1.5 次幂**加速，上限 **30px/帧**，上下对称反向 |
| 选择集操作 | `no.getState().replaceSelection(te,te.at(-1)??null)`、`clearSelection()`、`selectedIds` | ★ **整体替换**（不是累加），锚点＝命中集最后一个；store 是 `getState()` 形状（zustand 家族） |
| 起手副作用 | `no.getState().clearSelection()` 之前先 `y.current=new Set(no.getState().selectedIds)` | 记旧选择集（★ 用途本批未读到，动手前要补这一格） |
| 矩形渲染 | `createPortal(<div className="_rubberBand_fdch5_1" style={top,left,width,height}/>,document.body)` | 挂到 `body`、内联四值 |
| 矩形样式 | `._rubberBand_fdch5_1{position:fixed;background:var(--accent-100);border:1px solid var(--accent-500);border-radius:var(--radius-sm);pointer-events:none;z-index:10}` | ★ **`position:fixed`＝视口坐标**（不随容器裁剪）；配色走 `--accent-100/500` 同族 |
| 期间屏蔽 | `addEventListener("dragstart",_Vt)` 与 `("selectstart",DVt)`，两函数都是 `t.preventDefault()` | 框选期间禁原生拖拽与原生选区 |
| Escape | `bn.pushIntoFocus("BrowseSelectionRubberBandEscape",…)`（cleanup 里 `removeFromFocus`） | ☆ **与代码编辑器同一张焦点注册表**（`code_editor_{blockId}` 同源） |
| 命中器分派 | `function IVt(t,e){if(e.type==="list")return Nee(t,e.items);const n=Nee(t,e.folderItems);return e.type==="cards"&&e.documentsGrid?n.push(...kVt(t,e.documentsGrid)):e.type==="waterfall"&&n.push(...vVt(t,e.columns)),n}` | **三型 `list`／`cards`／`waterfall` ＋ 一层 `folderItems` 永远参与**（cards 型把文件夹区与文档网格两组分别命中再合并） |
| 网格命中器 | `kVt`＝`d=columnWidth+gap`、`u=rowHeight+gap`、`floor((band.left-left)/d)` 取列区间、`floor((band.top-top)/u)` 取行区间、圈内逐格回判 `j7e`、`itemCount` 夹尾 | ★ **纯算术剪枝**，输入是 `documentsGrid{top,left,columnCount,columnWidth,rowHeight,gap,itemIds,itemCount}` ⇒ ☆ **第 108 批那 12 个网格常量的用途在此** |
| 瀑布流命中器 | `vVt`＝先按列 x 区间剪枝，再对 `itemTops` 二分（`s[d]+i[d]<t.top ? r=d+1 : c=d`）后线性扫到 `s[d]>t.top+t.height` | **O(log n＋k)**；输入是 `columns[].{left,width,itemTops,itemHeights,itemIds}` |
| hook 入参 | `bW({enabled,scrollElementRef,layoutGeometryRef,remeasure})` | ⇒ 框选是独立 hook，几何靠 `layoutGeometryRef` 供数 |

### 四、★★ 列表档实际渲染的 22 枚 `_1m9yz_` 类（对照第 109 批 27 条名册）

逐字（类名去掉哈希后缀，按号序）＝`_headerRow_8`、`_columnHeader_29`、`_sortable_43`、`_active_51`、`_divider_56`、`_listItemWrapper_74`、`_virtualRow_92`、`_statusCheckbox_116`、`_listRow_142`、`_thumbnailCol_160`、`_nameCol_169`、`_rowTitle_179`、`_rowSubtitle_188`、`_dataCol_197`、`_colLastViewed_208`、`_colUpdated_212`、`_colCreated_216`、`_dataCellLastViewed_221`、`_dataCellUpdated_225`、`_dataCellCreated_229`、`_statusCol_249`、`_virtualBody_290`；⇒ ☆ **名册 27 条里有 5 条静止态不渲染**（含 `dragPreviewBase`／`dragPreviewInner` 一族与三个状态类）；★ 表头实测四列＝名称（宽 590）／上次浏览（**rect 0×0**，被容器查询藏）／已更新（112，带 `_active`＝当前排序列）／已创建（112）；★ 行壳逐字 `_listRow_1m9yz_142 no-select`、**行高 65**（与第 108 批盘上常量咬合）。

**⇒ 本批另两处顺带**＝① 主题挑选面板有独立懒加载 chunk `themePreviews-BJcCJGmn.js`（⇒ 预览是异步取回，不是同步渲染 20 档）；② 浏览屏条目寻址属性是 **`data-item-id`**（实测当前档 8 枚、值为 uuid、挂在卡片 `_outerBox_` 上，同屏 `[data-block-id]` 为 0），而 `_isActive_1nu3o_62` 在静止态 8/8 全带 ⇒ **不能当选中判据**。

**仍未采到（本节）**：① `y.current` 里那份"起手前的旧选择集"最后被怎么用（合并？shift 增选？取消时回滚？本批只读到写入点，没读到读取点）；② `shift`/`meta` 修饰键在框选中的分支（本批只读到无修饰路径）；③ `type` 的第四种取值有没有（`list`／`cards`／`waterfall` 之外）；④ 名册面板的展示序规则（§一 末条）；⑤ 表格档条目到底由哪个属性承载 id（本批未再切档复查）；⑥ `documentsGrid`／`columns` 两个几何模型的**更新时机**（`remeasure` 由谁调）；⑦ **本表 `settings` 名与上批 `ue` 名册值的对应链**（`Bo`→`Lo()`→`Mo`→`ue.materialdark` 是否成立）＝零预算盘上核对项，下批做。

## 三十七、第 111 批＝20 档代码主题 `settings` 全字段逐字（底色一次闭合）＋ 名册同一性全表 ＋ MCP 名册 19 档逐字 ＋ 主题面板入口三条否证（2026-09-30 20:3x–21:1x；★ 源＝`_harvest/js/CodeEditorWrapper-DB8UxA00.js` 定点读＋craft MCP 实测；☆ 机制与判定在 `internals.md §五十`、gap 在 G1141–G1159；★ 逐字表由 `_harvest/b111-theme-scan.cjs` 直接生成、未手抄）

### 一、★★★ 全表（21 行含 `auto`；`两表同一对象?`＝第 110 批 §三十六 的 `V.settings` 与第 109 批 §三十五.一 的工厂内 settings 源是否同一对象）


| # | id | label | keywords | isDark | V.settings | 别名链 | 结果变量=工厂() | 工厂形状 | 工厂内 settings 源 | 两表同一对象? | theme 字面量 | tag 数 | background | foreground | caret | selection | gutterBackground | gutterForeground | gutterBorder | fontFamily | settings 键数 | 底色亮度 | 三者一致性 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | auto | Auto | ["system"] | true | null | =自身 | null = ?() | - | - | auto→null | - | - | ? | ? | - | - | - | - | - | ? | - | - | auto 不入表 |
| 2 | craftdark | Dark | [] | true | Ue | =自身 | uo = fo() | arrow | Ue | YES | "light" | 9 | #28292B | #CECFD0 | #fff | #385576 | #28292B | rgba(255,255,255,0.4) | #f4f4f41f | Roboto Mono, monospace | 11 | 40.9 | 不一致：底色暗／字面量亮／isDark暗 |
| 3 | craftlight | Light | [] | false | We | =自身 | go = io() | arrow | We | YES | "light" | 9 | #FBFBFB | #3D3D3D | - | #BBDFFF | #FBFBFB | rgba(31,34,37,0.3) | - | Roboto Mono, monospace | 9 | 251.0 | 三者一致 |
| 4 | atomone | Atom One | ["dark"] | true | Pe | =自身 | so = co() | arrow | Pe | YES | "dark" | 8 | #272C35 | #9d9b97 | #797977 | #ffffff30 | #272C35 | #465063 | transparent | Roboto Mono, monospace | 11 | 43.6 | 三者一致 |
| 5 | aura | Aura | ["dark"] | true | Ke | =自身 | bo = mo() | arrow | Ke | YES | "dark" | 20 | #21202e | #edecee | #a277ff | #3d375e | #21202e | rgba(237,236,238,0.4) | transparent | Roboto Mono, monospace | 11 | 33.2 | 三者一致 |
| 6 | bbedit | BBEdit | ["light"] | false | Ge | =自身 | ho = po() | arrow | Ge | YES | "light" | 13 | #FFFFFF | #000000 | #FBAC52 | #fffca5 | #f5f5f5 | #4D4D4C | transparent | Roboto Mono, monospace | 10 | 255.0 | 三者一致 |
| 7 | darcula | Darcula | ["dark"] | true | _e | =自身 | lo = no() | arrow | _e | YES | "dark" | 9 | #2B2B2B | #f8f8f2 | #FFFFFF | rgba(255, 255, 255, 0.1) | #414040 | #999 | transparent | Roboto Mono, monospace | 10 | 43.0 | 三者一致 |
| 8 | dracula | Dracula | ["dark"] | true | qe | =自身 | yo = ko() | arrow | qe | YES | "dark" | 8 | #282a36 | #f8f8f2 | #f8f8f0 | rgba(255, 255, 255, 0.2) | #282a36 | #6D8A88 | transparent | Roboto Mono, monospace | 10 | 42.4 | 三者一致 |
| 9 | githubdark | GitHub Dark | ["dark"] | true | ze | =自身 | wo = vo() | arrow | ze | YES | "dark" | 14 | #0d1117 | #c9d1d9 | #c9d1d9 | #003d73 | - | - | #f4f4f41f | Roboto Mono, monospace | 8 | 16.6 | 三者一致 |
| 10 | githublight | GitHub Light | [] | false | $e | =自身 | Co = xo() | arrow | $e | YES | "light" | 15 | #fff | #24292e | - | #BBDFFF | #fff | #6e7781 | - | Roboto Mono, monospace | 7 | 255.0 | 三者一致 |
| 11 | gruvboxdark | Gruvbox Dark | ["dark"] | true | Ve | =自身 | Do = No() | arrow | Ve | YES | "dark" | 34 | #282828 | #ebdbb2 | #ebdbb2 | rgba(189,174,147,0.5) | #282828 | #7c6f64 | - | Roboto Mono, monospace | 9 | 40.0 | 三者一致 |
| 12 | gruvboxlight | Gruvbox Light | [] | false | Ye | =自身 | Fo = So() | arrow | Ye | YES | "light" | 34 | #fbf1c7 | #3c3836 | #af3a03 | rgba(235,219,178) | #ebdbb2 | #665c54 | transparent | Roboto Mono, monospace | 10 | 240.1 | 三者一致 |
| 13 | materialdark | Material Dark | [] | true | Bo | Bo→Xe | Mo = Lo() | arrow | Xe | YES | "dark" | 36 | #2e3235 | #bdbdbd | #a0a4ae | rgba(215,212,240,0.7) | #2e3235 | #999 | transparent | Roboto Mono, monospace | 11 | 49.4 | 三者一致 |
| 14 | materiallight | Material Light | ["light"] | false | Qe | =自身 | jo = Ao() | arrow | Qe | YES | "dark" | 20 | #FAFAFA | #90A4AE | #272727 | #80CBC440 | #FAFAFA | #90A4AE | transparent | Roboto Mono, monospace | 10 | 250.0 | 不一致：底色亮／字面量暗／isDark亮 |
| 15 | noctislilac | Noctis Lilac | ["light"] | false | Je | =自身 | Ro = Io() | arrow | Je | YES | "light" | 15 | #f2f1f8 | #0c006b | #5c49e9 | #d5d1f2 | #f2f1f8 | #0c006b70 | - | Roboto Mono, monospace | 9 | 241.7 | 三者一致 |
| 16 | nord | Nord | ["dark"] | true | Ze | =自身 | To = Eo() | arrow | Ze | YES | "dark" | 36 | #2e3440 | #FFFFFF | #FFFFFF | #4c566a | #2e3440 | #4c566a | transparent | Roboto Mono, monospace | 11 | 51.6 | 三者一致 |
| 17 | sublime | Sublime | ["dark"] | true | et | =自身 | Ho = Oo() | function | et | YES | "dark" | 11 | #303841 | #FFFFFF | #FBAC52 | #4C5964 | #303841 | #FFFFFF70 | transparent | Roboto Mono, monospace | 10 | 54.9 | 三者一致 |
| 18 | tokyonight | Tokyo Night | ["dark"] | true | at | =自身 | Go = Ko() | arrow | at | YES | "dark" | 20 | #1a1b26 | #787c99 | #c0caf5 | #515c7e | #1a1b26 | #787c99 | transparent | ? | 9 | 27.6 | 三者一致 |
| 19 | tokyonightday | Tokyo Night Day | ["light"] | false | tt | =自身 | Po = _o() | arrow | tt | YES | "dark" | 20 | #e1e2e7 | #3760bf | #3760bf | #99a7df | #e1e2e7 | #3760bf | transparent | Roboto Mono, monospace | 10 | 226.1 | 不一致：底色亮／字面量暗／isDark亮 |
| 20 | tokyonightstorm | Tokyo Night Storm | ["dark"] | true | ot | =自身 | Uo = Wo() | arrow | ot | YES | "dark" | 20 | #24283b | #7982a9 | #c0caf5 | #6f7bb6 | #24283b | #7982a9 | transparent | ? | 9 | 40.5 | 三者一致 |
| 21 | vscodedark | VS Code | ["dark"] | true | rt | =自身 | $o = qo() | function | rt | YES | "dark" | 17 | #1e1e1e | #9cdcfe | #c6c6c6 | #6199ff2f | #1e1e1e | #838383 | transparent | Roboto Mono, monospace | 11 | 30.0 | 三者一致 |

### 聚合（20 档，auto 除外）
⇒ gutterBorder 取值分布＝{"#f4f4f41f":2,"(无此键)":4,"transparent":14}
⇒ fontFamily 取值分布＝{"Roboto Mono, monospace":18,"(无此键)":2}
⇒ caret 分布＝{"#fff":1,"(无此键)":2,"#797977":1,"#a277ff":1,"#FBAC52":2,"#FFFFFF":2,"#f8f8f0":1,"#c9d1d9":1,"#ebdbb2":1,"#af3a03":1,"#a0a4ae":1,"#272727":1,"#5c49e9":1,"#c0caf5":2,"#3760bf":1,"#c6c6c6":1}
⇒ 每档 settings 键数分布＝{"7":1,"8":1,"9":5,"10":7,"11":6}
⇒ 每个键在 20 档里出现的档数＝background=20/20、foreground=20/20、selection=20/20、selectionMatch=20/20、lineHighlight=19/20、gutterBackground=19/20、gutterForeground=19/20、caret=18/20、fontFamily=18/20、gutterBorder=16/20、gutterActiveForeground=7/20

⇒ ★ 判据公式（可复算）＝亮度 `0.2126R + 0.7152G + 0.0722B`（Rec.709 加权、0–255 域），阈值 **128**（小于判暗），三位十六进制（`githublight` 的 `#fff`）先展开成六位再算；⇒ ☆ 表里 `-` ＝该档 settings **没有这个键**，`?` ＝非字符串值或本脚本没解析（`auto` 行整行不适用）。

### 二、★★★ 闭合结论

⇒ **底色 20/20 闭合**（上批 14 档"未逐字"一次补完）；⇒ **暗标记错配＝恰好 3 档**＝`craftdark`（暗底、字面量 `"light"`）／`materiallight`（亮底、`"dark"`）／`tokyonightday`（亮底、`"dark"`），其余 **17 档三者一致**；⇒ ★ **两表同一对象 20/20 成立**（唯一别名＝`materialdark` 的 `Bo=Xe`）⇒ 第 110 批开放项⑦结案；⇒ ☆ **声明形状两种**（18 箭头＋2 `function`）＝`sublime`（`function Oo(o)`）与 `vscodedark`（`function qo(o)`）。

### 三、★★ MCP 面的代码主题名册逐字（19 条，`blocks explore-themes --type code`）

⇒ 逐条＝`auto`（Automatically match system appearance）、`atomone`（Atom One theme）、`aura`（Aura theme with soft colors）、`bbedit`（BBEdit classic theme）、`darcula`（JetBrains Darcula theme）、`dracula`（Popular Dracula color scheme）、`githubdark`（GitHub Dark theme）、`githublight`（GitHub Light theme）、`gruvboxdark`（Gruvbox Dark (retro colors)）、`gruvboxlight`（Gruvbox Light (retro colors)）、`materialdark`（Material Design Dark）、`materiallight`（Material Design Light）、`noctislilac`（Noctis Lilac purple theme）、`nord`（Nord polar-inspired theme）、`sublime`（Sublime Text Monokai-like）、`tokyonight`（Tokyo Night dark theme）、`tokyonightday`（Tokyo Night Day variant）、`tokyonightstorm`（Tokyo Night Storm variant）、`vscodedark`（VS Code Dark+ theme）；⇒ ★★ **缺 `craftlight`／`craftdark`**（界面名册有、且 `auto` 恰好解析到这两档）⇒ 名册 19 对 21；⇒ ⚠ 同一条输出末尾印的 Usage＝`These themes are used with code blocks via --theme-id` ＋ 例子 `blocks update --id <code-block-id> --theme-id dracula` —— **实测该例子必失败**（`--theme-id` 走页面名册），见 `internals.md §五十.四`。

### 四、☆ 官方色值缺陷清单（本批增量）

⇒ ①（承第 109／110 批）`deleted` 的 `backgroundColor:"ffeef0"` 缺前导 `#`＝**四档同串**，登记不修正；② ☆ 新登记一条**非缺陷但易踩**＝`githublight` 的 `background` 是**三位** `#fff`（其余 19 档全六位）⇒ 按"必须是六位"写的解析器会在这档静默失败；③ ☆ `gruvboxlight.selection`＝`rgba(235,219,178)`（**三个分量、无 alpha**，CSS 合法但看着像漏写）⇒ 登记为"官方写法不规范"，不判缺陷。

**仍未采到（本节）**：① 20 档里 `styles`（token 色板）**仍只有第 109 批那 7 档逐字**，本批只闭合了 `settings` 一族；② `gutterActiveForeground` 缺的 13 档实际继承值；③ 主题面板屏上入口（三条已否，剩块把手菜单／右键菜单／`⋯` 详情）；④ `V` 名册的**展示序规则**（承第 110 批开放项④，本批仍未判：表里 `tokyonight` 排在 `tokyonightday` 之前，既非纯字母也非"亮前暗后"）；⑤ MCP 19 档与界面 21 档差值的**强制层**（拒绝还是只是不列）。

## 三十八、**第 112 批＝20 档 `styles` token 色板逐字全表（368 条规则）＋ CM6 基准主题 `&light`／`&dark` 全表（119 键 grammar 表 ＋ 5 档挑选名册无 grammar）＋ Markdown 导出模板逐字 ＋ 名册三张与语言名册四张 ＋ 官方色值缺陷新增一条**（2026-09-30 21:4x–23:1x；★ 源＝`_harvest/js/` 缓存的 `CodeEditorWrapper-DB8UxA00.js`（59,843 字符）、`vendor-code-editor-BLm003PU.js`（3,578,108 字符）、`vendor-craft-export-DIm_3hRN.js`、`index-DiTmKH3z.js`、`themePreviews-BJcCJGmn.js`（2,595 字符，本批第一次读）；★ 判定在 `internals.md` §五十一、`model.md` §一之七十、`styles.md` §十九，gap 在 `gap.md` §三点一〇六二 G1160–G1179；★ 机读结果＝`_harvest/b112-styles.txt`（22,831 字节，368 条规则逐字，由 `b112-style-scan.cjs` 生成、**未手抄**）、`_harvest/b112-base-theme.txt`（`b112-base-theme.cjs`，括号配平版）、`_harvest/b112-grammar.txt`（`b112-grammar.cjs`，深度感知取键）、`_harvest/b112-export-template.txt`（`b112-export-tpl.cjs`，2,729 字符整表）、`_harvest/b112-lang-roster.txt`（`b112-lang-roster.cjs`，38 条三元组）、`_harvest/b112-color-audit.txt`（`b112-color-audit.cjs`，形态普查）、`_harvest/b112-second-roster.cjs`（第四张名单 ＋ 别名表 77 条）；⚠ **本批零浏览器内容面调用、零写入**）

### 一、★★★ 缺 `gutterActiveForeground` 的 13 档：继承值逐档（结掉第 111 批 §三十七 开放项②）

⇒ 装配处逐字（`gBn`，`vendor-code-editor` @1,481,662）＝`var p={}; s.gutterActiveForeground&&(p.color=s.gutterActiveForeground), s.lineHighlight&&(O[".cm-activeLine"]={backgroundColor:s.lineHighlight}, p.backgroundColor=s.lineHighlight), O[".cm-activeLineGutter"]=p` ⇒ **一个默认值都没有**，缺键＝不写该声明 ⇒ 前景沿 CSS 继承取自 `.cm-gutters` 的 `color`（＝该档 `gutterForeground`）。

| 档 | 声明的 `gutterActiveForeground` | 活跃行行号**前景**的实际来源 | 活跃行行号**底色**的实际来源 |
| --- | --- | --- | --- |
| craftdark | `rgba(255,255,255,0.7)` | 自己声明 | 名册 `lineHighlight` `rgba(255,255,255,0.05)` |
| craftlight | `rgba(31,34,37,0.6)` | 自己声明 | `rgba(0,0,0,0.03)` |
| atomone | `#8997b2` | 自己声明 | `rgba(255,255,255,0.05)` |
| aura | `rgba(237,236,238,0.7)` | 自己声明 | `rgba(255,255,255,0.05)` |
| materialdark | `#c2c2c2` | 自己声明 | `rgba(84,91,97,0.5)` |
| nord | `#d8dee9` | 自己声明 | `rgba(255,255,255,0.05)` |
| vscodedark | `#fff` | 自己声明 | `#ffffff0f` |
| darcula | **缺** | 继承 `gutterForeground` `#999` | `rgba(255, 255, 255, 0.05)` |
| bbedit | **缺** | 继承 `#4D4D4C` | `#00000012` |
| dracula | **缺** | 继承 `#6D8A88` | `rgba(255, 255, 255, 0.05)` |
| gruvboxdark | **缺** | 继承 `#7c6f64` | `rgba(60,56,54,0.5)` |
| gruvboxlight | **缺** | 继承 `#665c54` | `rgba(235,219,178,0.4)` |
| materiallight | **缺** | 继承 `#90A4AE` | `#CCD7DA50` |
| noctislilac | **缺** | 继承 `#0c006b70`（★ 带 alpha） | `rgba(225,222,243,0.5)` |
| tokyonight | **缺** | 继承 `#787c99` | `rgba(255,255,255,0.05)` |
| tokyonightday | **缺** | 继承 `#3760bf` | `#5f5faf11` |
| tokyonightstorm | **缺** | 继承 `#7982a9` | `rgba(255,255,255,0.05)` |
| sublime | **缺** | 继承 `#FFFFFF70`（★ 带 alpha） | `#00000059` |
| githublight | **缺** | ★ **空规则**（`lineHighlight` 也缺 ⇒ `.cm-activeLineGutter` 赋的是 `{}`）⇒ 前景继承 `#6e7781`、底色落回基准 | 基准 `&light` `#e2f2ff`／`&dark` `#222227`（该档标 light ⇒ 取 `#e2f2ff`） |
| githubdark | **缺** | ★★ **两级都缺**（`gutterForeground` 也没有）⇒ 落 CM6 基准 `&dark .cm-gutters{color:"#ccc"}` | 名册 `lineHighlight` `#36334280`；行号槽**底色**也缺 ⇒ 基准 `&dark` `#333338`（★ 与该档正文底色 `#0d1117` 不同 ⇒ 屏上可见的色差） |

### 二、★★★ CM6 基准主题的 `&light`／`&dark` 全表（**35 条规则、20 个去重选择器**；★ 必须用括号配平取，flat 正则会把带嵌套的 `&light .cm-gutters` 整条漏掉）

| 选择器 | `&light` 声明（逐字） | `&dark` 声明（逐字） |
| --- | --- | --- |
| .cm-activeLine | `backgroundColor:"#cceeff44"` | `backgroundColor:"#99eeff33"` |
| .cm-activeLineGutter | `backgroundColor:"#e2f2ff"` | `backgroundColor:"#222227"` |
| .cm-button | `backgroundImage:"linear-gradient(#eff1f5, #d9d9df)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#b4b4b4, #d0d3d6)"}` | `backgroundImage:"linear-gradient(#393939, #111)",border:"1px solid #888","&:active":{backgroundImage:"linear-gradient(#111, #333)"}` |
| .cm-content | `caretColor:"black"` | `caretColor:"white"` |
| .cm-cursor | **（无 light 版）** | `borderLeftColor:"#ddd"` |
| .cm-gutters | `backgroundColor:"#f5f5f5",color:"#6c6c6c",border:"0px solid #ddd","&.cm-gutters-before":{borderRightWidth:"1px"},"&.cm-gutters-after":{borderLeftWidth:"1px"}` | `backgroundColor:"#333338",color:"#ccc"`（★ 无 border 键） |
| .cm-panels | `backgroundColor:"#f5f5f5",color:"black"` | `backgroundColor:"#333338",color:"white"` |
| .cm-panels-bottom | `borderTop:"1px solid #ddd"` | **（无 dark 版）** |
| .cm-panels-top | `borderBottom:"1px solid #ddd"` | **（无 dark 版）** |
| .cm-searchMatch | `backgroundColor:"#ffff0054"` | `backgroundColor:"#00ffff8a"` |
| .cm-searchMatch-selected | `backgroundColor:"#ff6a0054"` | `backgroundColor:"#ff00ff8a"` |
| .cm-selectionBackground | `background:"#d9d9d9"` | `background:"#222"` |
| .cm-snippetField | `backgroundColor:"#00000022"` | `backgroundColor:"#ffffff22"` |
| .cm-specialChar | `color:"red"` | `color:"#f78"` |
| .cm-textfield | `backgroundColor:"white"` | （见 `_harvest/b112-base-theme.txt`） |
| .cm-tooltip .cm-tooltip-arrow | **（无 light 版）** | `"&:before":{borderTopColor:"#333338",borderBottomColor:"#333338"},"&:after":{borderTopColor:"transparent",borderBottomColor:"transparent"}` |
| .cm-tooltip-section:not(:first-child) | `borderTop:"1px solid #bbb"` | **（无 dark 版）** |

⇒ ★ 单档缺失的 5 条（`.cm-cursor`、`.cm-tooltip-arrow` 只有 dark；`.cm-panels-bottom`、`.cm-panels-top`、`.cm-tooltip-section` 只有 light）＝**名册不覆写时另一档这个属性根本没有值**。
⇒ ☆ 分支选择的逐字机制＝`W9t={"&light":"."+C9t,"&dark":"."+Y9t}` ＋ 根 class 逐字 `Sxe+" "+(state.facet(kxe)?Y9t:C9t)+" "+state.facet(Ene)`，而 `kxe` 的 combine 是 `r.indexOf(!0)>-1` ⇒ **任一主题声明 dark 即整编辑器取 dark 分支**；Craft 每编辑器只注册一条主题 ⇒ 等价于"该档工厂 `theme` 字面量"。

### 三、★★★ grammar 能力面登记表 `jTe`（结掉第 107 批 §三十三.五 开放项"能力面未量化"）

⇒ 身份＝`kt` ＝逐字 `hBn=Object.keys(jTe)`，`yt` ＝逐字 `function dBn(r){return jTe[r]?jTe[r]():null}`（`vendor-code-editor` @1,477,736 起，体长 2,879 字符）；⇒ 加载闸门逐字（CodeEditorWrapper @41,784）＝`l.useEffect(()=>{if(d){if(kt.includes(d)){const i=yt(d);B(i)}}else B(null)},[d])`，`d` ＝ **挑选名册的 `langCode`**（消费点逐字 `langCode:N.langCode`）⇒ ⇒ **闸门不做任何规范化**。
⇒ **键数＝119，全部唯一**；形态两种＝`:()=>F.define(…)` 惰性 106 条 ＋ 直接引用 13 条（`javascript:Bne`、`jsx:()=>Bne({jsx:!0})`、`typescript:()=>Bne({typescript:!0})`、`tsx:()=>Bne({jsx:!0,typescript:!0})`、`markdown:()=>UPn({base:h7e,codeLanguages:F5n})`、`sql:k4e`、`mysql:()=>k4e({dialect:Ixn})`、`pgsql:()=>k4e({dialect:Wxn})`、`html:p4n`、`css:Poe`、`python:E3n`、`xml:exn`、`lezer:UTn`…）。
⇒ 全键逐字（声明序）＝`apl、asciiArmor、asterisk、c、csharp、scala、kotlin、shader、nesC、objectiveC、objectiveCpp、squirrel、ceylon、dart、cmake、cobol、commonLisp、crystal、cypher、d、diff、dtd、dylan、ebnf、ecl、eiffel、elm、factor、fcl、forth、fortran、gas、gherkin、groovy、haskell、haxe、http、idl、jinja2、mathematica、mbox、mirc、modelica、mscgen、mumps、nsis、ntriples、octave、oz、pig、properties、protobuf、puppet、q、sas、sass、sieve、smalltalk、solr、sparql、spreadsheet、`**`stex`**`、textile、tiddlyWiki、tiki、troff、ttcn、turtle、velocity、verilog、vhdl、webIDL、xQuery、yacas、z80、wast、javascript、jsx、typescript、tsx、json、html、css、python、markdown、xml、sql、mysql、pgsql、java、rust、cpp、lezer、php、go、shell、lua、swift、tcl、yaml、vb、powershell、brainfuck、stylus、erlang、nginx、perl、ruby、pascal、livescript、less、scheme、toml、vbscript、clojure、coffeescript、julia、dockerfile、r`
⇒ ★★★ **挑选名册 38 条 string `langCode` 里有 7 条在 `jTe` 里查不到**＝`ada`、`bash`、`matlab`、`mermaid`、`prolog`、`vbnet`、`other` ⇒ 其中 `mermaid`／`other` 本就无需 grammar，但 **`ada`／`bash`／`matlab`／`prolog`／`vbnet` 五档是真语言档 ⇒ 选它们时闸门不进分支 ⇒ 不加载任何 language 扩展 ⇒ 不高亮**（☆ 而 `jTe` 里存在近义键 `shell`、`octave`、`vb` ⇒ 名册的 `langCode` 与登记表的键**对不上**；别名表 `Xvt` 里 `bash→shell`、`matlab?`… 有映射但那条表服务的是**另一条通路**（导入），不在这条闸门之前）；⇒ ☆ 反证设计意图＝四个已知分歧档（`csharp`／`objectiveC`／`tsx`／`stex`）**都在 `jTe` 里** ⇒ ⇒ `langCode` 确实就是 grammar 键，所以那 5 档是漏配而非另有机制。
⇒ ☆ 能力面 3.13 倍（119／38）：`jTe` 有而挑选名册没有的共 88 个（`apl`、`cmake`、`cobol`、`octave`、`protobuf`、`erlang`、`nginx`、`pascal`、`scheme`、`toml`、`clojure`、`coffeescript`…）⇒ **官方能解析的语言远多于可选项**，且 13 个直接引用形态说明这张表是从 `@codemirror/language-data` 一类包裁剪而来（☆ 未证，仅形状）。
⇒ ★ `stex` **在 `jTe` 里** ⇒ 公式档（`math_formula` → `langCode:"stex"`）**有一条真 grammar** ⇒ 与"公式另有 KaTeX 预览通路"不矛盾（预览与高亮两条并存，承 §一之六十五 的三条渲染路）。

### 四、★★★ Markdown 导出模板 `de.template`（2,729 字符，整表落盘 `_harvest/b112-export-template.txt`）

⇒ 代码块分支逐字（模板源，`\sl`／`\dl` 是令牌不是文本）＝`{{#case 'code'}} {{#ifEquals properties.language 'math_formula'}} $$\sl{{{replaceNewLines content }}}\sl$$\dl {{else}} {{{backticks}}}{{properties.language}}\sl{{{replaceNewLines content }}}\sl{{{backticks}}}\dl {{/ifEquals}} {{/case}}`
⇒ 其余与本节相关的分支逐字＝`{{#case 'line'}} {{getLine}}\dl`；`{{#case "file"}} [{{properties.fileName}}]({{rawDataUrl_relative}}){{{getBlockIdIndicator this}}}\dl`；`{{#case 'url'}} [{{{properties.title}}}]({{{properties.url}}})\dl`；`image` → `![{{properties.fileName}}]({{{rawDataUrl_relative}}})`；`video` → `[{{properties.fileName}}](…)`（★ **不是 `![…]`**＝视频塌成链接）；`drawing` → `![…]({{{previewImageUrl_relative}}})`（★ 用预览图 URL 而非原图）；`text` 分支前缀＝`{{getSpacesForIndentationLevel styleAttributes.indentationLevel parentSubBlocks}}` ＋ 列表样式 switch（`toggle`／`bullet`／`todo`／`numbered`）＋ `focus`／`block` 两个 decoration 判定 ＋ `{{#unless inline}}{{{getHeading this parentSubBlocks}}}{{/unless}}`。
⇒ helper 逐字（本批新读 9 条）＝`backticks` → 常量 `"```"`；`replaceNewLines` → `t.replace(/\n/g,"\\sl")`；`getSpacesForIndentationLevel` → `Array(Number(t)+1).join("\\i__craft")`；`getHeading` → `e===void 0 ? L.title : (r in L ? L[r] : "")`（★ 标题前缀**从 flavour 表按 textStyle 名取**）；`getBulletListStyle` → `L.bulletListStyle`；`getNumberedListStyle` → `L.numberedListStyle.replace("{number}",t)`；`getTodoListStyle` → `Number(t)>0 ? L.todoListStyleChecked : L.todoListStyleUnchecked`；`getToggleListStyle` → `L.toggleListStyle`；`getFocus` → `L.focus`、`getBlock` → `L.block`；`hasChildren` → `t.subBlocks ? t.subBlocks.length>0 : !1`。
⇒ 解码器逐字＝`formatBlock(e,r,i)`：`s=r({...e,flavourInfo, parentSubBlocks:e.subBlocks, inline:i, subBlocks:i?void 0:e.subBlocks})`；`s=s.split("\n").filter(o=>o.trim().length!==0).join("")`；`let l="\n"`；`return i&&(s.includes("`")?l=" ":l="<br>"), s=s.replace(/\\dl/g,"\n\n").replace(/\\sl/g,l).replace(/\\i__craft/g,this.flavour.indentationCharacters), s`；⇒ ☆ 调用点两处＝`formatBlock(P,r,!0)` @40,151、`formatBlock(g,r,!1)` @40,653（后者前一行逐字 `g.styleAttributes.textStyle="title"`）。

### 五、★★★ 名册三张（主题）与四张（语言）

⇒ 主题＝`V`（展示，21 条）、`ue`（工厂，21 键含 `auto:null`）、`nt`（TypeScript 枚举，21 条）；枚举逐字＝`AUTO="auto"、CRAFTDARK="craftdark"、CRAFTLIGHT="craftlight"、ATOMONE="atomone"、AURA="aura"、BBEDIT="bbedit"、DARCULA="darcula"、DRACULA="dracula"、GITHUBDARK="githubdark"、GITHUBLIGHT="githublight"、GRUVBOXDARK="gruvboxdark"、GRUVBOXLIGHT="gruvboxlight"、MATERIALDARK="materialdark"、MATERIALLIGHT="materiallight"、NOCTISLILAC="noctislilac"、NORD="nord"、SUBLIME="sublime"、TOKYONIGHTDAY="tokyonightday"、TOKYONIGHTSTORM="tokyonightstorm"、TOKYONIGHT="tokyonight"、VSCODEDARK="vscodedark"`。
⇒ **展示序逐位（`V` 声明序，即屏上顺序）**＝1 `auto`（`isDark:true`、`keywords:["system"]`、`settings:null`）→ 2 `craftdark` → 3 `craftlight` → 4 `atomone` → 5 `aura` → 6 `bbedit` → 7 `darcula` → 8 `dracula` → 9 `githubdark` → 10 `githublight` → 11 `gruvboxdark` → 12 `gruvboxlight` → 13 `materialdark` → 14 `materiallight` → 15 `noctislilac` → 16 `nord` → 17 `sublime` → 18 `tokyonight` → 19 `tokyonightday` → 20 `tokyonightstorm` → 21 `vscodedark`；⇒ ★ 第 4 项起与 `[...].sort()` **逐位相同**（DIFF 数 0），且 chunk 内 `.sort(`／`.reverse(` 各 **0 处**；⇒ ☆ 纯字母序下 `auto` 第 3、`craftdark` 第 5、`craftlight` 第 6；`isDark` 序列＝`DDLDDLDDDLDLDLLDDDLDD`。
⇒ ☆ `ue` 与 `V` 的去 auto 对照：**只有位置 16/17/18 不同**（`V`＝tokyonight→day→storm；`ue`／`nt`＝day→storm→base）⇒ 展示序不是从工厂表派生。
⇒ 语言＝① 挑选名册 39 条三元组（§三十三.一，本批用 `langCode:"…"` 形态只匹到 38 条 ⇒ ☆ **与上批的 39 对账才发现漏了唯一非字符串档 `plaintext`（`langCode:null`）**）；② `Qvt` **41 项**扁平名单逐字＝`ada、bash、cpp、cs、css、dart、dockerfile、go、groovy、haskell、html、java、javascript、json、julia、kotlin、lua、markdown、matlab、objectivec、perl、php、prolog、plaintext、python、r、ruby、rust、scala、shell、sql、swift、typescript、vbnet、yaml、xml、math_formula、other、docs、blocks、suggestions`（⇒ 与挑选名册的双向差集＝**多 `docs`／`blocks`／`suggestions`、少 `mermaid`**；`Yvt=new Set(Qvt)`）；③ `Xvt` **77 条**扩展名／别名表逐字＝`c、cc、cpp、cxx、h、hh、hpp、hxx、ino→cpp`；`cjs、js、jsx、mjs→javascript`；`cts、mts、ts、tsx→typescript`；`sh、bash、ksh→shell`；`svg、xsd、xsl→xml`；`md、mkd→markdown`；`pl、pm→perl`；`php3、php4、php5、php7、phtml→php`；`kt→kotlin`；`hs→haskell`；`gradle→groovy`；`hbs、handlebars、htm→html`；`cql、pls→sql`；`py、pyw→python`；`rb→ruby`；`rs→rust`；`jl→julia`；`map→json`；★ `ltx、tex→math_formula`；其余同名自映射（`cs、css、dart、go、java、json、lua、markdown、perl、php、r、scala、sql、swift、yaml`）⇒ ⇒ ☆ **29 个目标语言里只有 `cs` 与 `math_formula` 不在 `jTe`**（`cs` 靠挑选名册的 `langCode:"csharp"` 才有 grammar；`math_formula` 靠 `stex`）；④ `PGe=["mermaid","math_formula","stex"]`。

### 六、★★☆ 账户级默认偏好的两条定义逐字

⇒ 主包 @646,001 一段逐字＝`PGe=["mermaid","math_formula","stex"]，rD=new Lo("codeEditorDefaultLanguage","javascript",t=>typeof t=="string"&&!PGe.includes(t))，MGe=new Lo("codeEditorDefaultTheme","auto",t=>typeof t=="string")`；⇒ ☆ 顺带同段一条无关但可复核的＝`Fc=t=>(t==null?void 0:t.startsWith("="))??!1`；☆ 另一条同形态但不同类＝`new K$("forcedDarkOrLightMode","system",CE(["light","dark"]))` 与 `new Lo("forcedDarkOrLightMode",null,…)` **同名两实例**（☆ 未展开，转下批）。
⇒ 写入点逐字＝主题菜单 `onClick:()=>{St.store(v.id), s(v)}`；语言菜单 `onClick:()=>{["mermaid","math_formula","stex"].includes(B.storedLangCode)||Ft.store(B.storedLangCode), s(B)}`。

### 七、★★☆ `themePreviews-BJcCJGmn.js` 全表（2,595 字符，本批第一次整块读）

⇒ **与代码块主题无关**；它是一张 **18 项路径表** ＝ 6 强调色 × 3 档外观：`appearance.{blue,pink,green,purple,yellow,gray}.{light,dark,dynamic}@2x.png.<hash>.png`，聚合形态逐字 `I={blue:{light, dark, dynamic}, pink:{…}, green:{…}, purple:{…}, yellow:{…}, gray:{…}}`；⇒ ☆ 与 CSS 侧 `[data-accent=…]` 全量枚举的 6 枚**两个独立源吻合**（`blue｜gray｜green｜pink｜purple｜yellow`）。
⇒ 预载器形态逐字＝`t=new Map()`；`r=e=>{const a=new Image; return a.alt="", a.draggable=!1, {image:a, src:e, status:"idle"}}`；`T=e=> e.status==="loaded" ? Promise.resolve(!1) : (… e.image.onload=()=>{e.image.decode().catch(()=>{}).then(()=>n(!1))}, e.image.onerror=()=>n(!0), e.image.src=e.src …)`；`B=e=>{… Promise.all(Object.values(a.images).map(T)).then(n=>{n.some(Boolean)&&(a.preloadPromise=void 0)})}`；导出仅两符号（`_ as g`、`B as p`）；⇒ ☆ 消费方＝`PreferencesPanel`（`import"./themePreviews-…"`）、`SubscriptionsPanel`（`import{p as rl, g as xc}`）、`MySpaces`、`index` 的 modulepreload 表。

### 八、★★ 官方色值缺陷清单（本批增量，承 §三十五.三／§三十七）

⇒ ☆ ①承上批：`deleted` 的 `backgroundColor:"ffeef0"` 缺前导 `#`＝**四档同串**（暗档沿用亮粉底）。
⇒ ★★ ②**本批新增**＝`gruvboxdark` 里 **7 位十六进制 `#fb4934d`** 出现**两处**：`{tag:[e.annotation],color:"#fb4934d"}` 与 `{tag:e.invalid,color:"#fe8019",borderBottom:"1px dotted #fb4934d"}`；⇒ ☆ 同档另有合法串 `{tag:[e.contentSeparator],color:"#fb4934"}` ⇒ 判"多打一个 `d`"；⇒ ⇒ 后果＝两处声明均**非法 CSS、整条丢弃**（annotation 失去颜色、invalid 的下划线失去颜色），☆ 但 `e.annotation` 在该档**还出现在另一条合法规则里**（`{tag:[e.number,e.changed,e.annotation,e.modifier,e.self,e.namespace],color:"#d3869b"}`）⇒ 谁生效取决于 CM6 的匹配顺序（**本批未证**，见 §五十一 仍未采到①）。
⇒ ☆ ③`atomone` 同档 hsl 写法三种混用＝`"hsl(207, 82%, 66%)"`、`"hsl(38,71%,66%)"`、★`"hsl( 29, 54%, 61%)"`（左括号后带空格）。
⇒ ☆ ④`dracula` 同档内 `e.atom` 出现两次且同色 `#bd93f9`（`{tag:[e.atom,e.number]}` 与 `{tag:e.atom}`）。
⇒ ☆ ⑤**368 条规则里 31 条根本没有 `color` 键**（只带 `fontWeight`／`fontStyle`／`textDecoration`），且全部属于 `strong`／`emphasis`／`link`／`strikethrough` 一族 ⇒ ☆ 这些 token 的"颜色"因此完全依赖名册的 `foreground` 继承，跨档一致。

### 九、☆☆ 本批方法账（三条，均已写进 `internals.md` §五十一.十）

⇒ ① **chunk 名不能定性**（`themePreviews` 案）；② **"缺省值找不到"要先把装配函数全文读出来**才能写成"没有默认"；③ **配对类／名册类枚举必须用括号配平或深度感知取键**，本批两处都先踩了 flat 正则（`&light .cm-gutters` 被整条漏掉、`jTe` 键数先算成 121 且有重复）。


**仍未采到（本节）**：① 挑选名册 5 档无 grammar（`ada`／`bash`／`matlab`／`prolog`／`vbnet`）是**漏配还是另有第二道 grammar 源**（`jTe` 里存在 `shell`／`octave`／`vb` 近义键 ⇒ 需要屏上实测"选 Bash 有没有高亮"才能定案）；② `HighlightStyle` 里同 tag 多条规则的**胜负顺序**（只拿到声明序，未读 `uE.define` 的建树实现）⇒ 影响 §八.② 与名册末尾 `...r` 的可覆盖性判定；③ `kt`／`yt` 的加载结果 `M` **具体进不进 `extensions`**（本批只读到 `B(i)` 赋值与闸门，没读到组装点）；④ flavour 表（`L.title`、`L.bulletListStyle`、`L.numberedListStyle`、`L.todoListStyleChecked/Unchecked`、`L.focus`、`L.block`、`L.lineStyle`、`indentationCharacters`）的**逐字取值**与 flavour 有几档；⑤ `formatBlock` 的 `inline` 真值语义（哪些块走内联支 ⇒ 官方代码块会不会因此在表格里被摊平）；⑥ `themePreviews` 18 张 PNG 的**屏上呈现位**（外观设置卡片？订阅面板？）；⑦ `forcedDarkOrLightMode` 为何有 `Lo` 与 `K$` 两个构造、各服务什么；⑧ `new K$(…)` 这个类的校验器 `CE(["light","dark"])` 与屏上第三档 `dynamic` 的关系（名单里只有两档）。

## 三十九、**第 113 批＝MCP 逐字回包七条（两个 id／两道闸门／一次回包形态改判）＋ 屏上快照计数五条（六块对照／两套回收站名单／`.cm-content` 枚数）＋ 仪器逐字三条**（✓屏上只读＋MCP 数据面 2026-10-01 04:1x–04:4x 本地＝UTC 09-30 20:1x–20:4x；★ 判定在 `internals.md` §五十二、`model.md` §一之七十一、`interactions.md` V107，gap 在 `gap.md` §三点一〇六三 G1180–G1191；★ 原始快照＝`_harvest/b113-codeblocks.png`（116,239 字节，**已亲眼看过**）、`b113-dom-focused.html`（188,524 字符）、`b113-dom-rightclick.html`（同字节数）、`b113-dom-trash.html`／`b113-dom-trash2.html`（166,442 字符）；⚠ 本批**没有落任何不可逆动作**）

### 一、★★★ MCP 逐字回包（七条，命令与响应都原样）

⇒ ① **建文档**＝`documents create --title QODER-HARVEST-B113-CODEBLOCK` ⇒

```
Created document "QODER-HARVEST-B113-CODEBLOCK"
rootBlockId: 8d3acfb3-…
Use with: blocks get 8d3acfb3-…
Next: add body content, not the title, with blocks add --id 8d3acfb3-… --markdown "..."
Craft app link: craftdocs://open?spaceId=<spaceId>&documentId=d0710568-…
```

⇒ ② **多块插入回包（改判上批）**＝`blocks add --id 8d3acfb3-… --markdown "<6 个围栏块>"` ⇒ `Added 6 blocks.` ＋ `IDs: <936897f3-…>, <8d8fae17-…>, <5a7beec5-…>, <ca84e4d9-…>, <413cd637-…> (+1 more)` ⇒ ★ 形态＝**枚举多数并显式截断**（上批 3 块只回 1 个 ⇒ "只回首个 id"过窄）。
⇒ ③ **读回逐键**＝`blocks get 8d3acfb3-… --depth 1 --format json` ⇒ `{id,type:"page",textStyle:"page",markdown:"QODER-HARVEST-B113-CODEBLOCK",content:[{id,type:"code",language,rawCode,markdown}×6]` ⇒ ☆ 六块 `language` 全部落库为围栏那串（`bash`／`ada`／`matlab`／`prolog`／`vbnet`／`python`）。
⇒ ④ **用 documentId 喂块层**＝`blocks get d0710568-… --format markdown` ⇒ `Command 1 failed: … Block not found: d0710568-…` ＋ `Hint: If you have the Craft app/web link, run 'documents resolve-link <url>' via craft_read to get the rootBlockId. Otherwise run documents list to find rootBlockIds.` ＋ `Stopped after failure; earlier commands were already applied.` ⇒ ★★★ 一条回包里同时给出**两 id 不互通**＋**分号批处理不是事务且失败中止后续**（第三次复现）。
⇒ ⑤ **两 id 翻译器**＝`documents resolve-link https://docs.craft.do/editor/d/<spaceId>/d0710568-…` ⇒ `Resolved link to rootBlockId <8d3acfb3-…>` ＋ `Title: QODER-HARVEST-B113-CODEBLOCK` ＋ `Raw URL documentId: d0710568-…` ＋ `Next: blocks get 8d3acfb3-…` ⇒ ★ 一次调用**两层都回显**；☆ 且它证明 web URL 的路径段就是 **documentId**。
⇒ ⑥ **回收站写侧闸门**＝`blocks update --id 936897f3-… --markdown "```bash …"`（该块所在文档已被本批软删）⇒ `Failed to update block: Cannot modify document in trash. Restore it first.` ＋ `Hint: Restore trashed documents before deleting blocks inside them. Use "blocks update --help" for full usage.`；☆ 同篇文档**读**侧仍可完整返回（第 111 批 G1155）⇒ **读放行／写拒绝**。
⇒ ⑦ **软删两次**＝`documents delete e5696832-…`／`documents delete 8d3acfb3-…` ⇒ 均回 `Deleted document <id> (moved to trash)`；随后 `documents list --location trash` 回 **6 条**＝`2db38d6b-…`、`d8af008b-…`、`73dc4026-…`、`d48fd45a-…`(B109)、`e5696832-…`(B111)、`8d3acfb3-…`(B113)。
⇒ ☆ **契约不生效一条**＝`documents list --location unsorted --filter QODER` 回**全量 4 条**（含 `Welcome to Craft` 与两条无标题）⇒ `--filter` 在该动词上被忽略。

### 二、★★★ 屏上回收站名单与 MCP 名单：双向都不同步

⇒ 屏上「最近删除」（`title()` 逐字 `最近删除`）DOM 里 `data-item-id` 四条逐字＝`e8404352-…`、`cddd981c-…`、`6cc9761c-…`、`35edfc37-…`；其中**唯一**带采集串的是 `QODER-HARVEST-B109-CODEFIELD`。
⇒ 与 §一.⑦ 的 MCP 六条**零交集** ⇒ ★ 屏上条目 id 属 **documentId 层**（交叉证据＝`35edfc37-…` 同时出现在第 111 批缓存的 `docs.craft.do/editor/d/<spaceId>/35edfc37-…`）。
⇒ ☆ `6cc9761c-…`＝第 75 批"已删除并结案"的归属未定残留 ⇒ **它今天仍在屏上回收站**，且**不在** MCP 名单里 ⇒ 上批"屏上回收站只剩 3 条无标题项"这条要按此修正。
⇒ ☆ 排除项两条＝**虚拟滚动**（末行 `scrollIntoView` 后仍 4 行；末行 `getBoundingClientRect().height`＝282＝卡片高）与**客户端缓存**（`goto(同一 URL)` 重载后仍 4 行）。

### 三、★★ 六块同屏对照表（屏上是否上色＝`langCode ∈ jTe` 的派生态）

| # | 围栏语言 | `rawCode`（本批自造样本） | `langCode` 在 `jTe` 119 键里？ | 屏上实测 |
| --- | --- | --- | --- | --- |
| 1 | `bash` | `echo hi # note` | **否**（表内只有近义键 `shell`） | **整块单色** |
| 2 | `ada` | `with Ada.Text_IO; -- note` | **否** | **整块单色** |
| 3 | `matlab` | `x = [1 2]; % note` | **否**（近义键 `octave`） | **整块单色** |
| 4 | `prolog` | `father(X) :- parent(X, y).` | **否** | **整块单色** |
| 5 | `vbnet` | `Dim x = 1 ' note` | **否**（近义键 `vb`／`vbscript`） | **整块单色** |
| 6 | `python` | `def f(x): return x + 1  # note` | **是** | **上色**＝`def`／`return` 红、`f`／`x`／`1`／`+` 蓝、`# note` 灰 |

⇒ ★ 对照组三条色逐一对上 `craftlight`＝`keyword→#d73a49`、`variableName/attributeName/number/operator→#005cc5`、`comment/bracket→#6a737d`（第 112 批 §三十八.一 那张表）⇒ ☆ 同一次采集把"漏配判定"与"lezer→hljs 映射方向"一起验了。
⇒ ☆ 顺带读数＝六块都有行号槽（每块一个 `1`）、块底色为浅灰白（`craftlight` 的 `#FBFBFB` 档），与历批屏上"块内行高 24"同源。

### 四、☆ 主题面板入口的两条新否证（逐字读数）

⇒ ① 点进第六块（`.cm-content` 第 6 枚，`count()`＝6）→ 快照 188,524 字符内 **`主题` 0 处**、**`<select>` 0 个**、`cm-focused` 9 处、`data-testid` 去重 23 枚（全是侧栏／头部那批：`sidebar-profile`、`new-document-button`、`header-root`…）。
⇒ ② 对同一块 `click({button:'right'})` → 快照 **188,524→188,524（delta 0）**、`role="menuitem"` **0** ⇒ 没有应用内浮层。
⇒ ☆ 累计五条否证（第 111 批三条 ＋ 本批两条）⇒ **只剩块把手 `data-hover-only` 菜单一条候选**。

### 五、☆ 仪器逐字三条（本批新踩）

⇒ ① `rows.nth(...).scrollIntoViewIfNeeded is not a function` ⇒ 该 SDK 的 locator 包装**没有**这个方法；可用替代＝`locator.evaluate(el => el.scrollIntoView({block:'end'}))`（实测可用，且同手回传几何）。
⇒ ② `cua.scroll` 的入参形态（SDK 文档逐字）＝`ScrollOptions`＝"Scroll by a delta from a specific viewport coordinate" ⇒ 要 `{x, y, …}`；**本批未实测，别按猜测用**。
⇒ ③ ★★★ 一次 `locator.click()` 打 `BUTTON[data-testid="browse-sort-button"]` 把扩展串行队列**挂死**＝cell 永久 running → `node_repl_wait` 回 `[node_repl timeout] AbortError: Execution was cancelled` → 随后连 `title()` 都报 `Tool command waited too long in queue`；**而当时 `visibility.get()`＝true** ⇒ ☆ 历批"挂死＝窗口最小化"归因**不充分**，点击本身可挂；☆ 处置＝立刻停手、不在挂死队列上重试、不做不可逆动作。

**仍未采到（本节）**：① 屏上回收站的**查询条件**（哪个字段决定可见性）；② documentId→rootBlockId 的**非 URL** 正向映射；③ 屏上选择模式对"屏上列不出"条目的可见性；④ 焦点在块内时 `Ctrl+Z` 的撤销归属；⑤ 五档无 grammar 语言在**导出 markdown** 里的语言名是否仍正确；⑥ `browse-sort-button` 菜单里到底有什么（本批一点就挂，未读到菜单文本集）。

## 四十、**第 114 批＝CM6 高亮栈逐字七段（`uE` 构造／`n_t`／`DQn`／`DPe`／`R6e`／`Tag.define`／`tV` 三态）＋ flavour 表 29 字段逐字＋表格导出通路逐字＋明暗解析链逐字**（✓盘上 2026-10-01 04:4x–05:2x 本地＝UTC 09-30 20:4x–21:2x；★ 全部来自 `_harvest/js` 本地缓存，**零浏览器内容面调用**；☆ 机制解释在 `internals.md` §五十三，gap 在 `gap.md` §三点一〇六四）

### 一、★★★ `HighlightStyle` 本体（`vendor-code-editor-BLm003PU.js` @300,114，逐字）

⇒ `class uE{constructor(i,s){this.specs=i; let l; function O(w){let Q=u4.newName(); return (l||(l=Object.create(null)))["."+Q]=w, Q} const p=typeof s.all=="string"?s.all:s.all?O(s.all):void 0, g=s.scope; this.scope=g instanceof lp?w=>w.prop(y5)==g.data:g?w=>w==g:void 0, this.style=n_t(i.map(w=>({tag:w.tag,class:w.class||O(Object.assign({},w,{tag:null}))})),{all:p}).style, this.module=l?new u4(l):null, this.themeType=s.themeType} static define(i,s){return new uE(i,s||{})}}`
⇒ ☆ 三条读法＝① class 名由 `u4.newName()`（＝`StyleModule`）自动生，**每条 spec 一个**（`Object.assign({},w,{tag:null})` 只用于生成键，不参与去重 ⇒ 内容相同的两条 spec 也拿两个 class 名）；② `all`／`scope` 两个选项 Craft 都没传 ⇒ `p=void 0`、`this.scope=void 0`；③ `themeType` 是**唯一**决定"进不进明暗门控"的字段，Craft 恒 undefined（见 §一.五）。

### 二、★★★ `styleFor` 本体（@275,545，逐字）

⇒ `function n_t(r,i){let s=Object.create(null); for(let p of r) if(!Array.isArray(p.tag)) s[p.tag.id]=p.class; else for(let g of p.tag) s[g.id]=p.class; let{scope:l,all:O=null}=i||{}; return{style:p=>{let g=O; for(let w of p) for(let Q of w.set){let S=s[Q.id]; if(S){g=g?g+" "+S:S; break}} return g}, scope:l}}`
⇒ 多档聚合＝`function DQn(r,i){let s=null; for(let l of r){let O=l.style(i); O&&(s=s?s+" "+O:O)} return s}`；facet 取用＝`const qxe=Yi.define(), d_t=Yi.define({combine(r){return r.length?[r[0]]:null}}); function DPe(r){let i=r.facet(qxe); return i.length?i:r.facet(d_t)}`
⇒ ☆ 注意 `d_t.combine` 只取 `[r[0]]` ⇒ **兜底面即使塞多条也只留第一条**，而主面 `qxe`（`Yi.define()` 无 combine）是**全量数组** ⇒ 两条轴的"多档语义"不同（主面拼接、兜底面择一）。

### 三、★★★ `syntaxHighlighting` 三分支（@300,650 附近，逐字）

⇒ `function R6e(r,i){let s=[Q2n],l; return r instanceof uE&&(r.module&&s.push(li.styleModule.of(r.module)), l=r.themeType), i!=null&&i.fallback?s.push(d_t.of(r)):l?s.push(qxe.computeN([li.darkTheme],O=>O.facet(li.darkTheme)==(l=="dark")?[r]:[])):s.push(qxe.of(r)), s}`
⇒ Craft 名册路径逐字（`CodeEditorWrapper` 侧的 `gBn` 尾部，上批已录）＝`var g=li.theme(O,{dark:i==="dark"}), w=uE.define(l), Q=[g,R6e(w)]; return Q` ⇒ ⇒ ★★★ `R6e(w)` 的 `i` 是 undefined、`w.themeType` 是 undefined ⇒ **走第三分支 `qxe.of(r)`＝无条件挂载**。

### 四、★★★ `Tag` 与继承链构造（@273,252，逐字）

⇒ `j2=class zxe{constructor(i,s,l,O){this.name=i,this.set=s,this.base=l,this.modified=O,this.id=VQn++} ... static define(i,s){let l=typeof i=="string"?i:"?"; if(i instanceof zxe&&(s=i), s!=null&&s.base) throw new Error("Can not derive from a modified tag"); let O=new zxe(l,[],null,[]); if(O.set.push(O), s) for(let p of s.set) O.set.push(p); return O} static defineModifier(i){let s=new vre(i); return l=>l.modified.indexOf(s)>-1?l:vre.get(l.base||l, l.modified.concat(s).sort((O,p)=>O.id-p.id))}}`
⇒ ⇒ ★★★ `tag.set` ＝ `[自身, ...父 tag.set]`（**自身先 push**）⇒ §二里那个 `break` 的语义就是"具体 tag 永远优先于父 tag"；修饰符（`strong`／`em`／`link` 之类 `defineModifier` 产物）另走 `vre`（＝`ModifiedTag`），其 `set` 由 `for(let w of i.set) if(!w.modified.length) for(let Q of g) O.push(vre.get(w,Q))` 生成（`g=LQn(s)`＝修饰符子集按长度降序的幂集）⇒ ☆ 一条可检验推论＝**带修饰符的 tag 的 `set` 里全是"祖先×修饰符组合"**，所以名册里若给 `t.strong(t.comment)` 单独配色，它会**先于** `t.comment` 命中。
⇒ 节点标签表三态（@274,700 附近，逐字）＝`let tV=class{constructor(i,s,l,O){this.tags=i,this.mode=s,this.context=l,this.next=O} get opaque(){return this.mode==0} get inherit(){return this.mode==1} ...}; tV.empty=new tV([],2,null)` ⇒ ★ 三态＝0 opaque／1 inherit／2 普通；遍历侧逐字 `let S=O, x=BQn(i)||tV.empty, T=DQn(p,x.tags); if(T&&(S&&(S+=" "),S+=T, x.mode==1&&(O+=(O?" ":"")+T))), this.startSpan(Math.max(s,w),S), if(x.opaque) return` ⇒ ⇒ **inherit 模式把自己的 class 传给子孙**，opaque 模式**停止下钻**。

### 五、★★★ flavour 表 29 字段逐字（`vendor-craft-export-DIm_3hRN.js` @922，全库唯一）

⇒ `Z.defaultFlavour={caption:"", body:"", pageCard:"#### ", pageRegular:"#### ", strong:"#### ", heading:"### ", subtitle:"## ", title:"# ", focus:"> ", block:"> ", bold:"**", italic:"*", strikethrough:"~~", code:"`", highlight:"::", numberedListStyle:"{number}. ", bulletListStyle:"- ", toggleListStyle:"+ ", todoListStyleChecked:"- [X] ", todoListStyleUnchecked:"- [ ] ", lineStyle:"---", fixListOrders:!0, fixIndentationLevel:!1, indentationCharacters:"   ", artificialNewLines:!1, blockLinkStyle:"blockLink", base64Assets:!1, printFullCss:!1, subPageStyle:"flat"}`
⇒ ☆ 分组读法＝**前缀类** 15 枚（`caption`／`body`／`pageCard`／`pageRegular`／`strong`／`heading`／`subtitle`／`title`／`focus`／`block`／`bold`／`italic`／`strikethrough`／`code`／`highlight`）、**列表样式类** 5 枚（`numberedListStyle`／`bulletListStyle`／`toggleListStyle`／`todoListStyleChecked`／`todoListStyleUnchecked`）、**几何与行为开关** 9 枚（`lineStyle`／`fixListOrders`／`fixIndentationLevel`／`indentationCharacters`／`artificialNewLines`／`blockLinkStyle`／`base64Assets`／`printFullCss`／`subPageStyle`）。
⇒ ★ 四条"塌值"＝`pageCard`≡`pageRegular`≡`strong`（`"#### "`）、`focus`≡`block`（`"> "`）、`caption`≡`body`（`""`）；★ 三个硬数字＝缩进**三空格**、完成态**大写 `X`**、未完成态**空格占位**（`- [ ] `）。
⇒ helper 逐字＝`qi.registerCommonHelpers(w.default); let L=Ct.defaultFlavour, It, Et=new Lt.TextRunFormatter(L), Wi=new Vi.TableFormatter(L); w.default.registerHelper("setFlavour",function(t){L=t?{...Ct.defaultFlavour,...t}:L, Et=new Lt.TextRunFormatter(L)})` ⇒ ☆ **`Wi` 不重建**（`this.flavour` 在构造时按值捕获）。

### 六、★★★ 表格导出通路逐字（同文件 @39,571–@41,018）

⇒ 入口＝`class Fi{constructor(e){this.flavour=e} formatTable(e,r){ var i,s,l,o,f; let u=[]; const h=e.pluginData.rows, p=e.pluginData.columns, d=e.pluginData.cells; if(h!=null&&p!=null&&d!=null){ const n=this.toMap(d, g=>this.cellCoordinate(g), g=>g), c=this.toMap((i=e.subBlocks)??[], g=>g.id, g=>g), a=[]; ... } ... }`
⇒ 单元格分支逐字＝`const P=c.get(k.blockId); if(P!=null){ const S=(l=(s=P.subBlocks)===null||s===void 0?void 0:s.length)!==null&&l!==void 0?l:!1; b=this.formatBlock(P,r,!0), S&&((P.content==null||P.content.length===0)&&(P.content=Ri.getUUID(), P.styleAttributes=(o=P.styleAttributes)!==null&&o!==void 0?o:{}, P.styleAttributes.textRuns=[{text:P.content,range:[0,P.content.length]}]), b=`**[[#${P.content}]]**`, a.push(P)) } v.push(b)`
⇒ 表后重出逐字＝`let m=Hi.markdownTable(u,{})+"\\dl"; if(a.length>0) for(const g of a){ g.styleAttributes=(f=g.styleAttributes)!==null&&f!==void 0?f:{}, g.styleAttributes.textStyle="title", g.styleAttributes._runAttributes=[]; const v=this.formatBlock(g,r,!1); m=m+v } return m } else return "" }`
⇒ 解码器逐字（上批已录，此处补第三参来源）＝`formatBlock(e,r,i){let s=r({...e,flavourInfo:this.flavour,parentSubBlocks:e.subBlocks,inline:i,subBlocks:i?void 0:e.subBlocks}); s=s.split("\n").filter(o=>o.trim().length!==0).join(""); let l="\n"; return i&&(s.includes("`")?l=" ":l="<br>"), s=s.replace(/\\dl/g,"\n\n").replace(/\\sl/g,l).replace(/\\i__craft/g,this.flavour.indentationCharacters), s}`
⇒ 坐标与映射逐字＝`toMap(e,r,i){return e.reduce((s,l)=>(s.set(r(l),i(l)),s),new Map)} cellCoordinate(e){return this.coordinate(e.columnId,e.rowId)} coordinate(e,r){if(!(e==null||r==null)) return `${e}_${r}`}` ⇒ ☆ 键形态＝`列id_行id`（★ **列在前**，与直觉的"行_列"相反，本地若做同类映射要注意）。

### 七、★★★ 明暗解析链逐字（`index-DiTmKH3z.js` @867,646 与 @845,066）

⇒ 偏好声明＝`const i0o=["blue","pink","green","purple","yellow","gray"], $O=new K$("forcedDarkOrLightMode","system",CE(["light","dark"])), HO=new K$("accentColor","blue",CE(["blue","pink","green","purple","yellow","gray"]))`
⇒ 三个取值器＝`function ZO(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}`、`function Dtt(){const t=new URLSearchParams(window.location.search); return t.has("dark")?"dark":t.has("light")?"light":t.has("system")?"system":null}`、`function _tt(){return $O.get()}`、`function jtt(){return HO.get()}`、`function Rtt(){return window.matchMedia("(pointer: fine)").matches?"fine":window.matchMedia("(pointer: coarse)").matches?"coarse":"none"}`
⇒ 解析＝`function Ik(t,e,n){let o=n??t; return fn.isEnabled(tU)?o="dark":fn.isEnabled(nU)&&(o="light"), o==="system"?e:o}`
⇒ 状态面＝`const Tk=Dtt(), Ltt=ZO(), hY=_tt(), Xs=fc((t,e)=>($O.subscribe(n=>{const o=ZO(); t({colorScheme:n,resolvedColorScheme:Ik(n,o,Tk)})}), HO.subscribe(n=>{t({accentColor:n})}), {colorScheme:hY, resolvedColorScheme:Ik(hY,Ltt,Tk), accentColor:jtt(), primaryPointer:Rtt(), isScrollbarPersistent:!1, setColorScheme:n=>{var s; $O.store(n==="system"?null:n); const o=ZO(); t({colorScheme:n,resolvedColorScheme:Ik(n,o,Tk)}), (s=window.t...`
⇒ 另一条轴（页面纸色）＝`function calcPaperColorMode(e){const m=isColorGradient(e)?e.colorStops[0].color:e; return m.light!==m.dark?"dynamic":isBrightColor(m.light)?"light":"dark"}`（`socket.worker-CMvBLZvP.js` @147,919，★ **真名未混淆**）＋ `function Bet(t){return t==="light"||t==="dark"||t==="dynamic"?t:"dynamic"}`（`index` @845,066）＋ 面板消费 `V=>{y(!V), V&&D!=="dynamic"&&K(D==="dark"), !V&&D!=="dynamic"&&K(x)}`、`C=>{tt(pi({ignoreAppTheme:!C, drawPageBackground:C}, d)), C&&b!=="dynamic"&&_(b==="dark"), !C&&b!=="dynamic"&&_(l)}`（`RenderOptionsPanel-Ce9vLC8i.js` @23,792）
⇒ ☆ 顺带两条同段可复核事实＝`isScrollbarPersistent` **初值硬编码 `!1`**（上批那组滚动条常量的闸门在这里给默认值）、页面主题 id 把档位写进名字（逐字 `themeId:"brown-dynamic"`、`styleId:"luki"`）。

### 八、☆ 本批仪器与踩坑（逐字留档，防下批重犯）

⇒ ① 第一版审计（`_harvest/b114-style-precedence.cjs`）只匹配 `X=o=>{const{theme:t="..."...}` ⇒ 跑出 **18 档**并漏掉 `sublime`／`vscodedark`（它们是 `function Oo(o){...}` 形式）⇒ ☆ 差点下错"20 档里有 2 档不是工厂"；修法＝`_harvest/b114-style-precedence2.cjs` 用正则并集 `(?:([A-Za-z$_]{1,3})=o=>|function ([A-Za-z$_]{1,3})\(o\))` ＋ 用 `_harvest/b114-factory-names.cjs` 的"名册对象名→工厂名"映射反查档名（21 键含 `auto:null`）。
⇒ ② 第一版还有一处**假阴性**＝`grep -c "HighlightStyle"` 在 105 个 chunk 上全为 0 ⇒ 差点判成"CM6 的 `HighlightStyle` 不在这个 bundle 里"；实际是**类名被混淆**、真身是 `class uE` ⇒ ☆ 判据要换成**结构关键字**（本批用的是 `hierarchical`，结果命中的全是 ELK/J2CL 的图布局代码，绕了一段才改用它的使用点 `uE.define` 反查）。
⇒ ③ 一条 bash 教训（第 N 次）＝把含反引号与 `"..."` 的 JS 片段塞进 `node -e "..."` ⇒ 引号提前闭合、报 `syntax error near unexpected token '('` ⇒ ☆ 一律落成 `.cjs` 文件再跑（本批 `_harvest/b114-fix-gap.cjs` 就是这么来的）。
⇒ ④ 一次**未跑就删**的测试＝本批先写了 `e2e/code-block-palette.spec.ts`（真编辑器＋计算样式），实跑卡在 `src/collab/secrets.mjs:11` 缺签名密钥 ⇒ **删掉**（连同临时 `playwright.palette.config.ts`），改走 §八.④ 那条不依赖登录态的切口 ⇒ ☆ 规则化＝"不提交没跑过的测试"。

**仍未采到（本节）**：① `Q2n`（`R6e` 无条件 push 的那枚 facet）的身份；② `tU`／`nU` 两枚强制明暗 flag 的键名字面量；③ `LQn` 幂集与 `vre.get` 缓存策略对**实际渲染**的影响（名册里没有修饰符条目，故本批判"不影响 Craft"，但未证）；④ `Hi.markdownTable` 的实现（表格行→`|` 串的转义规则，尤其竖线与换行怎么逃）；⑤ `getHeading` 的**第二实参** `parentSubBlocks` 到底怎么用（本批只看到调用形态）；⑥ `It`（`setFlavour` 旁边那枚未初始化变量）的用途。

## 四十一、**第 115 批＝特性开关层逐字（注册表 13 枚方法／三档白名单实参全量／服务端 meta 注入口／`_killMe` 第二条注入口）＋ 两条表格导出通路逐字（`Bi` 函数体全文与三个 helper／`g()` 三步转义）＋ `v2n`＝`defaultHighlightStyle` 19 条逐字＋`flavourInfo` 七枚消费点逐字＋存储写入语义逐字**（✓盘上 2026-10-01 05:3x–06:1x 本地＝UTC 09-30 21:3x–22:1x；★ 全部来自 `_harvest/js` 本地缓存（105 chunk，本批零新增下载），**零浏览器内容面调用、零写入**；☆ 机制解释在 `internals.md` §五十四，gap 在 `gap.md` §三点一〇六五；★ 机读来源＝`_harvest/b115-probe1.cjs`…`b115-probe11.cjs`（十一**全部只读、可原样复跑，每条把 `@偏移` 打进 stdout**）

### 〇、☆ 本节竖线口径（先读这条，否则下面的"逐字"会被当成走样）

⇒ 本节**表格外**的代码引文里，竖线一律写成**全角**`｜`／`｜｜`，官方源码里是**半角** `|`／`||`（为避开 Markdown 表格分隔符做的字形替换；复刻时写半角）。⇒ ☆ 代码围栏内的 `|` 是**真半角逐字**（围栏行不以`｜`开头，校验脚本按行首判表，不会误算）。

### 一、★★ 开关注册表 `fn` 的方法面（`index-DiTmKH3z.js` @68,588，263 字符，逐字全长）

⇒ ``{isEnabled:U_e,get:rce,initFromQueryString:q_e,initFeature:bd,isDefined:$_e,setUndefined:N_e,initFromCsvOrArray:Q_e,initFromLocalStorage:Y_e,makeUrlControllable:H_e,onFeatureChange:K_e,makeUrlDisableable:Z_e,makeLocalStorageControllable:V_e,setInLocalStorage:G_e}`` ⇒ **13 枚公开方法**（☆ 比" isEnabled 一个读接口"丰富得多：`isDefined`／`setUndefined` 说明**"没定义"本身是一等状态**，与"定义为假"不同）。
⇒ 服务端注入口（@6,830,199，逐字）：`fn.initFromCsvOrArray(kC("luki:enable-fs"),kC("luki:disable-fs"))`。
⇒ `kC`（getMetatag，@62,862，逐字）：`function kC(t){const e=document.getElementsByTagName("meta");for(const n of e)if(n.getAttribute("name")===t)return n.getAttribute("content");return null}`。
⇒ `initFromCsvOrArray` 骨架（逐字语义）＝入参可为数组或逗号串 ⇒ `.split(",").filter(s=>s.length>0).forEach(s=>bd(s,!0))`，第二参走 `bd(s,!1)` ⇒ **enable 与 disable 两张名单、逗号分隔、空串丢弃**。
⇒ 第二条注入口（@6,447,017，逐字）：`updateFeaturesFromShareResponse_killMe(e){var n,o;fn.initFromCsvOrArray(((n=e.features)==null?void 0:n.enabled)||null,((o=e.features)==null?void 0:o.disabled)||null)}` ⇒ ★ **方法名自带 `_killMe`**，做的是一次网络响应覆盖全局功能面。
⇒ 两条硬默认值（逐字）：`const isDesktop=!1; fn.initFeature(FEATURE_SPELL_CHECK,isDesktop)` ⇒ **web 构建里拼写检查默认关**。

### 二、★★★ 三档白名单**实参数组逐字**（调用点 @69,972／@70,065／@70,444；别名→字面量由 `b115-probe10.cjs` 解出，★ 不是手抄）

⇒ **URL 可控 19 枚**，源码实参逐字＝`[sje,sU,X_e,dce,vC,eg,sI,gce,uce,fce,iU,lU,FE,x9,cje,oje,dje,OE,bce]`，按同序解出字面量＝`fs-debug-sync-log`／`fs-disable-sync`／`fs-show-title`／`fs-grammarly`／`fs-debug-reminder-options`／`fs-debug-allow-inbox-root`／`fs-debug-allow-past-task-dates`／`fs-debug-pseudo-localization`／`fs-import-docx`／`fs-export-docx`／`fs-legacy-sync-token`／`fs-quick-search-space-filter`／`pf-paddle-subscription`／`fs-show-tldraw`／`fs-debug-whiteboard-low-limit`／`fs-workflow-links`／`fs-debug-ai-chat-models`／`fs-mermaid-diagrams`／`fs-debug-posthog-market`。
⇒ **URL 可关 6 枚**，实参逐字＝`[tje,fw,l1,a1,BE,jm]` ⇒ `fs-suggested-collaborators`／`fs-beta-redirect`／`fs-excalidraw`／`fs-service-worker`／`fs-offline-mode-rollout`／`fs-collection-kanban-view`。
⇒ **localStorage 可控 2 枚**，实参逐字＝`[a1,rU]` ⇒ `fs-service-worker`／`fs-debug-fps-overlay`。
⇒ ☆ ★ **`a1`＝`fs-service-worker` 同时在后两档** ⇒ 三档不互斥（三个独立 Set，一枚开关可落在零到三档）。
⇒ ☆ **调用点用方法名、不用别名**（`fn.makeUrlControllable([...])`）⇒ 这是 `b115-probe9.cjs` 按别名搜调用点**零命中**的原因；⇒ ★ 规则＝**混淆代码里"找某方法的调用点"要搜它在注册表里的属性名，不是搜那个短别名**。

### 三、★★ 38 枚 `fs-*` 名册逐字（＋非 `fs-` 前缀一枚）＝`new Set` 全量枚举结果（`b115-probe5.cjs`）

⇒ `fs-address-book`、`fs-assertion-errors-popup`、`fs-beta-redirect`、`fs-check-orphans`、`fs-collection-kanban-view`、`fs-debug-ai-chat-models`、`fs-debug-allow-inbox-root`、`fs-debug-allow-past-task-dates`、`fs-debug-block-selection-borders`、`fs-debug-disable-sentry`、`fs-debug-dont-refetch-tasks-on-focus`、`fs-debug-extend-resize-observer-logs`、`fs-debug-fps-overlay`、`fs-debug-posthog-market`、`fs-debug-pseudo-localization`、`fs-debug-reminder-options`、`fs-debug-show-block-debug-info`、`fs-debug-sync-log`、`fs-debug-whiteboard-low-limit`、`fs-disable-sync`、`fs-excalidraw`、`fs-export-docx`、`fs-grammarly`、`fs-idea-starter-experiment`、`fs-import-docx`、`fs-legacy-sync-token`、`fs-mermaid-diagrams`、`fs-new-flash-message`、`fs-offline-mode-rollout`、`fs-onboarding-experiment-2025`、`fs-quick-search-space-filter`、`fs-service-worker`、`fs-show-title`、`fs-show-tldraw`、`fs-spell-check`、`fs-subscription-experiment-2025`、`fs-suggested-collaborators`、`fs-workflow-links`，另 `pf-paddle-subscription`。
⇒ ☆ **消费方盲区（实测）**＝三枚名字（`fs-debug-sync-log`／`fs-assertion-errors-popup`／`fs-debug-show-block-debug-info`）在 105 个缓存 chunk 里**只命中名册所在的两份**（`index-DiTmKH3z.js` 与 `socket.worker-CMvBLZvP.js`），其余 103 个零命中 ⇒ 判"**名册里有＝实现存在于未缓存的懒加载 chunk**"（☆ 这条把 G1211 里"mermaid／excalidraw 是灰度特性"的确信度从"名册证据"降为"名册证据＋消费方未证"）。

### 四、★★★ worker 那份实现的白名单预置逐字（`socket.worker-CMvBLZvP.js` @217,044）

⇒ `const urlControllableFeatures=new Set([FEATURE_DARK_MODE,FEATURE_LIGHT_MODE])`（★ 该 chunk 里这两枚是**可读常量名**、没被混淆 ⇒ 与主 app 那份全是短别名形成对照，说明 worker 是**另一份未同批混淆的构建**）。
⇒ ⇒ ★★★ **与主 app 那 19 枚不同**＝强制明暗两枚开关只在 worker 里可被 URL 拨 ⇒ 记入"两份实现漂移"家族（承历批"两份主题名册／两套回收站口径／两个按钮体系"）。

### 五、★★★ 第一条表格通路：handlebars 注册的 `markdownTable`＝`Bi` 函数体逐字全文（`vendor-craft-export-DIm_3hRN.js` @37,883）

⇒ 为可读做了**折行**，未删节、未改写；竖线此处是**真半角**（在围栏内）：

```
function Bi(t,e){const r=e||{},i=(r.align||[]).concat(),s=r.stringLength||Ti,l=[];let o=-1;
const f=[],u=[],h=[];let p=0,d,n,c,a,m,g,v,_,y;
for(;++o<t.length;){for(d=-1,n=[],c=[],t[o].length>p&&(p=t[o].length);++d<t[o].length;)
  m=Di(t[o][d]),r.alignDelimiters!==!1&&(a=s(m),c[d]=a,(h[d]===void 0||a>h[d])&&(h[d]=a)),n.push(m);f[o]=n,u[o]=c}
if(d=-1,typeof i=="object"&&"length"in i)for(;++d<p;)l[d]=ht(i[d]);else for(y=ht(i);++d<p;)l[d]=y;
for(d=-1,n=[],c=[];++d<p;)y=l[d],v="",_="",y===99?(v=":",_=":"):y===108?v=":":y===114&&(_=":"),
  a=r.alignDelimiters===!1?1:Math.max(1,h[d]-v.length-_.length),m=v+"-".repeat(a)+_,
  r.alignDelimiters!==!1&&(a=v.length+a+_.length,a>h[d]&&(h[d]=a),c[d]=a),n[d]=m;
f.splice(1,0,n),u.splice(1,0,c),o=-1;const k=[];
for(;++o<f.length;){for(n=f[o],c=u[o],d=-1,g=[];++d<p;)m=n[d]||"",v="",_="",
  r.alignDelimiters!==!1&&(a=h[d]-(c[d]||0),y=l[d],y===114?v=" ".repeat(a):y===99?a%2?(v=" ".repeat(a/2+.5),_=" ".repeat(a/2-.5)):(v=" ".repeat(a/2),_=v):_=" ".repeat(a)),
  r.delimiterStart!==!1&&!d&&g.push("|"),
  r.padding!==!1&&!(r.alignDelimiters===!1&&m==="")&&(r.delimiterStart!==!1||d)&&g.push(" "),
  r.alignDelimiters!==!1&&g.push(v),g.push(m),r.alignDelimiters!==!1&&g.push(_),
  r.padding!==!1&&g.push(" "),(r.delimiterEnd!==!1||d!==p-1)&&g.push("|");
  k.push(r.delimiterEnd===!1?g.join("").replace(/ +$/,""):g.join(""))}
return k.join(`
`)}
```

⇒ 三个 helper 逐字（★ 关键＝单元格只过 `Di`）：`function Di(t){return t==null?"":String(t)}` @39,254；`function Ti(t){return t.length}` @39,297；`function ht(t){const e=typeof t=="string"?t.charCodeAt(0):0;return e===67｜｜e===99?99:e===76｜｜e===108?108:e===82｜｜e===114?114:0}` @39,328（＝C／c→99 center、L／l→108 left、R／r→114 right、其它→0 默认左）。
⇒ ⇒ ★★★ **单元格内容没有任何转义分支**（只有 `String(t)`）⇒ 竖线直通；换行那一半由上批 `formatBlock(…,inline)` 在别处摊平。
⇒ ☆ **一条必须记的形状判据**＝`Bi` 的选项面（`stringLength`／`alignDelimiters`／`delimiterStart`／`delimiterEnd`／`padding`／`align`）与 `mdast-util-to-markdown` 的 `markdownTable` 形状一致，且 Craft 调用点逐字 `Hi.markdownTable(u,{})`（★ 四枚选项一个没传）⇒ 准确表述＝**"上游库既有行为＋调用点全默认＝没补转义"**，不要写成"Craft 写了个不转义的表格器"。

### 六、★★★ 第二条表格通路：`MarkdownExportApi-CkVOp9F7.js` @719 的转义函数逐字

⇒ `function g(e){return e.replace(/\\/g,"\\\\").replace(/\｜/g,"\\｜").replace(/\n/g," ")}`（★ 半角竖线，本节写全角）。
⇒ 调用点逐字：`m=[g(c),…p.map(d=>g(d.name｜｜"Untitled"))]; f.push("｜ "+m.join(" ｜ ")+" ｜"), f.push("｜ "+m.map(()=>"---").join(" ｜ ")+" ｜")` ＋ `const y=g(d.block.textContent｜｜"")`。
⇒ ⇒ ★ 这条通路的读取面＝`a.properties.filter(d=>!d.isHidden)`、`contentProperty.name` 缺省 `"Title"`、属性名缺省 `"Untitled"` ⇒ **数据表／集合视图 → markdown 表格**；与文档导出通路互不复用（该 chunk 全文 8,670 字符，零 flavour 引用）。

### 七、★★ `v2n`＝CM6 `defaultHighlightStyle` 19 条逐字（`vendor-code-editor-BLm003PU.js` @301,832）

⇒ `v2n=uE.define([{tag:W.meta,color:"#404740"},{tag:W.link,textDecoration:"underline"},{tag:W.heading,textDecoration:"underline",fontWeight:"bold"},{tag:W.emphasis,fontStyle:"italic"},{tag:W.strong,fontWeight:"bold"},{tag:W.strikethrough,textDecoration:"line-through"},{tag:W.keyword,color:"#708"},{tag:[W.atom,W.bool,W.url,W.contentSeparator,W.labelName],color:"#219"},{tag:[W.literal,W.inserted],color:"#164"},{tag:[W.string,W.deleted],color:"#a11"},{tag:[W.regexp,W.escape,W.special(W.string)],color:"#e40"},{tag:W.definition(W.variableName),color:"#00f"},{tag:W.local(W.variableName),color:"#30a"},{tag:[W.typeName,W.namespace],color:"#085"},{tag:W.className,color:"#167"},{tag:[W.special(W.variableName),W.macroName],color:"#256"},{tag:W.definition(W.propertyName),color:"#00c"},{tag:W.comment,color:"#940"},{tag:W.invalid,color:"#f00"}])`
⇒ ⇒ ★★★ 第 114 批那 6 档里的覆盖条目逐字＝`{tag:e.link,textDecoration:"underline"}`＝**与本表第 2 条同形** ⇒ "link 不上色"的来源是**从默认样式复制时丢了 color**，不是 CM6 语义。
⇒ ☆ 同段 `Q2n` 逐字＝`const Q2n=N2.high(Nu.fromClass($2n,{decorations:r=>r.decorations}))` ⇒ ＝`Decorator.high(TreeHighlighter)`（`$2n` 带 `markCache`／`buildDeco`／`decoratedTo`）。

### 八、★★ `flavourInfo` 七枚被读字段的消费点逐字

⇒ `blockLinkStyle`：`==="pageLink"&&(e.linkType="rootBlock")`／`==="headerLink"&&e.linkType==="block"&&(e.linkType="block")`（默认 `"blockLink"` ⇒ 不改写）；`artificialNewLines`：`===!0` 时空文本块填一个空格并补一条覆盖全文的 `_runAttributes`；`fixListOrders`→`this.fixListOrders(h.subBlocks,…)`；`fixIndentationLevel`→`===!0 && this.fixIndentationLevel(h.subBlocks)`；`printFullCss`→`===!0 && this.setBlockModelExportClasses(h)`；`base64Assets`→`isBase64:this.flavourInfo.base64Assets`；`indentationCharacters`→`TableFormatter` 唯一读的字段（★ 类体 1,673 字符内 `this.flavour.X` 只出现这一枚）。
⇒ ☆ `getHeading` 逐字：`registerHelper("getHeading",function(t,e){if(e===void 0)return L.title;const r=t.styleAttributes.textStyle;return r in L?L[r]:""})`；模板调用形态 `{{getHeading this parentSubBlocks}}` ⇒ **第二参从不被读，只当哨兵**。
⇒ ☆ `It` 逐字：`registerHelper("setBlockTemplate",function(t){It=t})` ＋ `registerHelper("formatTable",function(t){return Wi.formatTable(t,It)})`，声明行 `let L=Ct.defaultFlavour,It,Et=new …` ⇒ **`It` 无初值**。

### 九、★★ 存储与明暗的写入语义逐字（改掉上批一条表述）

⇒ `store(e){var n;try{e==null?localStorage.removeItem(this.key):localStorage.setItem(this.key,JSON.stringify(e))}catch{}typeof window<"u"&&((n=window.topApi)!=null&&n.broadcastStorageChange)&&…}` @36,513 ⇒ ⇒ ★★★ **`system`＝删键，不是写 `null`**（☆ 判据＝"存 null"与"删键"在 `localStorage.length`／`for` 枚举／`Object.keys` 上可分辨，`getItem` 都是 `null` 所以不能作为判据）。
⇒ 读侧归一化逐字：`const o=xl.darkModeSetting.get();return o==="dark"?"dark":o==="light"?"light":"system"`。
⇒ 同键双声明逐字：`$O=new K$("forcedDarkOrLightMode","system",CE(["light","dark"]))` 与 `qje=new Lo("forcedDarkOrLightMode",null)` @78,867。
⇒ 强制明暗键名逐字（@67,033）：`tU="dark",nU="light",Iq="text-context"`；两处读取：`fn.isEnabled(tU)?o="dark":fn.isEnabled(nU)&&(o="light")`（`Ik()`）／`fn.isEnabled(tU)?s=!0:fn.isEnabled(nU)&&(s=!1)`（`finalCalcDarkMode()` @5,189,322）。
⇒ DOM 侧两条副作用逐字（`vn` 类体内，@5,189,1xx）：`document.querySelector("meta[name='theme-color']")?.setAttribute("content",_t.background(e))` 与 `document.documentElement.style.setProperty("color-scheme",e?"dark":"light")`。
⇒ 亮度判据逐字（`socket.worker` @137,065）：`function isBrightColor(e){const{r:m,g:C,b:N}=toRGB(e);return .2126*(m/255)+.7152*(C/255)+.0722*(N/255)>.65}` ⇒ ☆ 与第 111 批"阈值 128"那条**不同域、不同阈值**（那条是代码主题底色、8 位整数域）。

### 十、☆ 仪器留档（十一条探针各自答什么）

⇒ `probe1`＝helper 消费面（`getHeading`／`setFlavour`）；`probe2`＝明暗键名（搜"右值是 `"dark"` 且同段有 `"light"`"的**赋值形态**，不是搜词）；`probe3`＝注册表方法面与 `flags[` 存储形态；`probe4`＝`Bi` 与三 helper；`probe5`＝`isBrightColor` 阈值＋名册全量枚举；`probe6`＝三档白名单调用点＋"有没有开关调试面板消费这 38 枚"（⇒ 未找到消费方）；`probe7`＝`Q2n`／`v2n`；`probe8`＝worker 交叉验证＋`luki:enable-fs`＋`kC`＋四枚别名字面量；`probe9`＝按别名搜调用点＝**零命中**（产出 §二末那条规则）；`probe10`＝别名→字面量对照；`probe11`＝`Bi` 全长重取。

**仍未采到（本节）**：① 38 枚开关各自的**消费方 chunk**（需一次逐路由 `pageAssets` 采集）；② worker 里 `urlDisableableFeatures` 的完整成员（本批只取到初始化片段）；③ `initFromQueryString` 在 worker 那份里到底调不调；④ `ace`／`cce`／`oU` 三张 Set 有没有第二处追加；⑤ `blockLinkStyle` 非默认两档的设置方；⑥ `MarkdownExportApi` 的触发动作；⑦ ☆ 屏上三条（含竖线的单元格会不会串行／`?dark` 对主 app flag 层是否真无效／读一次 `luki:enable-fs` meta 的实际内容）＝全依赖连接器。

## 四十二、**第 117 批＝markdown 导入器层的四张语言名册与三张映射表逐字（别名表 79 条全表／41 项导入名单／`lineStyle` 五档／turndown 四选项）**（2026-10-01 13:1x–13:2x 本地＝UTC 05:1x–05:2x，★ 零预算盘上批＝只读 `_harvest/js/index-DiTmKH3z.js` 缓存（@2,336,3xx–2,348,0xx 一段），零网络、零屏幕、零写入 ⇒ `manifest.jsonl` 155 行不变；本批同时**推翻自己一条计数**＝别名表"77 条"应为 **79 条**）

> ☆ 本节口径：表内竖线一律写作全角`｜`（＝源码里的半角 `|`）；`｜｜`＝`||`。所有计数由脚本 `_harvest/b117-roster-diff.mjs` 给出，**不手数**。

### 四十二.一 别名表 `Xvt` 全量 **79 条**逐字（`index-DiTmKH3z.js` @2,337,3xx，紧跟在 `Qvt` 之后）

⇒ 逐字形态（保持源码里的键序，★ 该表**同时是"恒等表"＝已归一的语言仍自映射**，如 `cpp:"cpp"`，所以它既能判"是不是别名"也能判"是不是标准码"）：

```
c→cpp | "c++"→cpp | cc→cpp | cpp→cpp | cxx→cpp | h→cpp | "h++"→cpp | hh→cpp | hpp→cpp | hxx→cpp | ino→cpp
cs→cs | css→css | dart→dart | go→go | gradle→groovy | groovy→groovy
hs→haskell | haskell→haskell | handlebars→html | hbs→html | htm→html | html→html | java→java
cjs→javascript | js→javascript | jsx→javascript | mjs→javascript | javascript→javascript
json→json | map→json | jl→julia | julia→julia | kt→kotlin | kts→kotlin | kotlin→kotlin | lua→lua
markdown→markdown | md→markdown | mkd→markdown | perl→perl | pl→perl | pm→perl
php→php | php3→php | php4→php | php5→php | php7→php | phtml→php
py→python | python→python | pyw→python | r→r | rb→ruby | ruby→ruby | rs→rust | rust→rust | scala→scala
bash→shell | ksh→shell | sh→shell | shell→shell | cql→sql | pls→sql | sql→sql | swift→swift
ltx→math_formula | tex→math_formula | cts→typescript | mts→typescript | ts→typescript | tsx→typescript | typescript→typescript
svg→xml | xml→xml | xsd→xml | xsl→xml | yaml→yaml | yml→yaml
```

⇒ 结构事实五条＝① **最宽的一组是 11 枚键**（`c`／`c++`／`cc`／`cpp`／`cxx`／`h`／`h++`／`hh`／`hpp`／`hxx`／`ino` 全归 `cpp`）⇒ C 系与 C++ 系在官方**不可区分**；② ★ **两枚键是带引号的非裸词**＝`"c++"`／`"h++"` ⇒ 这正是"77 条"错数的成因（只匹配裸词键的正则必然漏这两枚）；③ ☆ **`mermaid` 在这张表里完全没有**（与第 112 批"`Qvt` 少 `mermaid`"相互印证，它是靠单元素集 `eIt` 放行的特例）；④ ☆ **`tex`／`ltx` 是唯二通向伪语言 `math_formula` 的别名**，而 `math_formula` 自己没有恒等键（所以表外查询要靠名单那一步）；⑤ **别名表 29 个目标值全部落在 41 项名单内**（机器比对＝差集为空）⇒ 归一化不会造出名单外的值。

### 四十二.二 导入名单 `Qvt` 全量 **41 项**逐字（＋派生的 `Yvt=new Set(Qvt)`）

⇒ 逐字＝`ada｜bash｜cpp｜cs｜css｜dart｜dockerfile｜go｜groovy｜haskell｜html｜java｜javascript｜json｜julia｜kotlin｜lua｜markdown｜matlab｜objectivec｜perl｜php｜prolog｜plaintext｜python｜r｜ruby｜rust｜scala｜shell｜sql｜swift｜typescript｜vbnet｜yaml｜xml｜math_formula｜other｜docs｜blocks｜suggestions`（竖线为全角分隔记号，不是语法字符）

⇒ ★ **11 项在别名表里根本没有键**＝`ada`／`dockerfile`／`matlab`／`objectivec`／`prolog`／`plaintext`／`vbnet`／`other`／`docs`／`blocks`／`suggestions` ⇒ 这些值只能经"未命中别名 ⇒ 在名单内 ⇒ 原样返回"这一步通过；☆ 尾部三枚 `docs`／`blocks`／`suggestions` **不是编程语言**（第 112 批已记，仍未采到它们到底喂给谁）。
⇒ ☆ **官方自相矛盾新例**＝`bash` 同时在名单（作为独立档）与别名表（`bash→shell`）里 ⇒ 走归一化路径时 `bash` 变成 `shell`，但挑档面板仍把 `bash` 当一档；☆ 本地挑选名册 `src/components/editor/extensions/code-block-view.tsx:9-32` 有**三档官方名单外**＝`jsx`／`tsx`／`diff`（前两人在官方是别名，`diff` 是本地独有）。

### 四十二.三 分隔线样式映射（`hr` 分支的表，五档逐字）

⇒ 逐字＝`{lineStyle:{"---":"regular","..-":"extraLight",".--":"light","=--":"strong","===":"pageSeparator"}[i.markup]??"regular"}` ⇒ 块＝`{id,type:"line",content:"",styleAttributes:{lineStyle}}`
⇒ 三条要点＝① **`---` 是默认档 `regular`**（☆ 本地把 `---` 当最粗档 `thick` ⇒ 语义相反）；② **`=--`＝strong**（本地虚线用两字符 `=-`）；③ ★ **`===`＝`pageSeparator` 是分页符档**，界面没有入口、只能靠 markdown 打出来（本地四档词表 thin／medium／thick／dashed 里没有对应物）；④ 兜底＝未匹配一律 `regular`（☆ 与 G1105"未知即省略"不同，这里**未知即默认档**，说明兜底策略按面而异）。

### 四十二.四 导出装配层的 turndown 选项（第三份 flavour，四键逐字）

⇒ 逐字＝`new Kvt({headingStyle:"atx",hr:"---",bulletListMarker:"-",codeBlockStyle:"fenced"})` ＋ `.use([Gvt])` ＋ 三条 emoji 还原规则名 `convertFromUrlEmojiRule`／`convertFromAltEmojiRule`／`convertFromTeamsEmojiRule` ＋ 可选 callback ＋ `.turndown(t)`
⇒ ☆ 与第 114 批的 29 字段 flavour、第 115 批 `Bi`(handlebars) 的 `markdownTable` 合起来＝**官方"markdown 序列化"至少三套实现**（turndown 装配层／flavour 表／handlebars 模板），本批把第一套的四枚选项钉死；⇒ 本地对照＝标题 `#`、无序 `- `、`---`、fenced 四枚**已一致**，☆ 差的是 emoji 三族还原规则（本地导出原样留字符）。

### 四十二.五 本批顺带得到的两处沉默（产品侧风险面）

⇒ ① **围栏内容以 `<!--` 开头 ⇒ 整块丢弃**（`i.content.trimStart().startsWith("<!--")===!1` 是 fence 与 html_block 共用的闸门）；② **`<aside>` 里第一张 `width<50` 的图 ⇒ 导出时返回空串**（`qvt`＋`widthThreshold:50`）⇒ ☆ 两条都**没有警告、没有 toast**＝官方导入／导出面有两处"静默吞内容"，与第 113 批"未知语言不报错"同族 ⇒ 登记为复刻时的**行为取舍点**（照抄＝也静默；不照抄＝要写清为什么）。

**仍未采到（本节）**：① `docs`／`blocks`／`suggestions` 三枚非语言值的消费方；② `handleIconsInAsideTags` 由谁打开、阈值 50 是否可配；③ 官方 web 导入后块上 `language` 到底是 `other` 还是省略键（G1226，需一次导入实跑）；④ `===`／`=--` 在官方界面上渲染成什么（需屏上）；⑤ `" -- "` 替换的真实字节（本批缓存已 mojibake）；⑥ 别名表是否在**导出侧**也生效（本地只在导入侧做了归一）。

## 四十三、**第 119 批逐字清单＝行内标签分派表六枚 case 与静默 default／列表标记候选集两枚／两枚 meta 键名的字面值／三枚埋点名／导出样式常量表八键／导入旗标默认值四键／标签→排版映射九键**（☆ 全部为盘上逐字，来源＝`index-DiTmKH3z.js` 与 `vendor-craft-export-DIm_3hRN.js`；★ 本批零屏上、零新增下载 ⇒ `manifest.jsonl` 155 行不变；☆ 每条都在 chunk 里逐字符读过，计数一律由脚本给出；gap 在 `gap.md` §三点一〇六九）

### 一、行内标签 → 装饰的分派表（六枚 case ＋ 一枚空分支 ＋ 静默 default）

⇒ 分支标签名逐字＝`strong`、`em`、`link`、`highlight`、`s`、`span`；⇒ 对应写入的装饰键名＝`isBold`、`isItalic`、`linkURL`、`highlightColor`、`isStrikethrough`、（`span` 无）；⇒ `default` 的语句逐字＝`continue`（⇒ **不抛错、不记日志**）；⇒ ☆ 同函数上方另有一条**会记日志**的分派链尾（第 117 批已记）⇒ ★ **同产品同文件内两处对"未识别"的严格度不同**：token 类型＝记 `warn`；HTML 标签＝静默。

### 二、列表标记候选集（块级规则）＝逐字两枚

⇒ 候选集逐字＝`"-- "`、`"-+ "`（各三字符，含尾随空格）；⇒ 匹配方式逐字＝`charCodeAt` 严格相等逐位比较；⇒ 返回值第二项逐字＝"命中的那枚候选 `toLowerCase()` 后是否含 `+`"；⇒ 三种 open token 名与 HTML tag 配对逐字＝`ordered_list_open`/`ol`、`bullet_list_open`/`ul`、`todo_list_open`/`ul`；⇒ `markup` 一律＝"匹配到的末字符的 `String.fromCharCode`"。

### 三、行内侧的方括号语法（与上一节**不是**同一套判据）

⇒ 逐字判据＝"当前列表样式为 bullet" 且 "文本以`[ ] `或`[x] `开头" ⇒ 三个动作＝往列表样式栈压 `todo`、`todoChecked`＝该串第 2 个字符是否等于小写 `x`、文本砍掉前 4 字符；⇒ ★ 机器计数＝**主 chunk 里带方括号的"未勾选"字面量出现 1 次、"勾选（小写）"字面量与它同一处，大写形式的任务标记字面量 0 次**。

### 四、两枚 meta 键名的字面值（第 117 批只见别名，本轮拿到字符串）

⇒ 逐字＝`craftOrigTagName`、`craftIsOpenTag`；⇒ 写入点＝只处理 `html_block` 的那个函数，用两条正则（开／合）判出标签名后写 `n.meta[键]`；⇒ ☆ 值是**布尔**（开＝真、合＝假），不是字符串。

### 五、三枚埋点名（✎ 加固上批"一条"的说法）

⇒ 模板逐字＝`html_<标签>_count`、`html_<标签>_lines`、`html_<标签>_createdBlocks`；⇒ ☆ 三个都只在"是开标签"时上报；⇒ `_lines` 的值＝该块内容按换行切分后的段数、`_createdBlocks` 的值＝该次产出的块数。

### 六、导出侧的样式常量表（★ 新 chunk，`vendor-craft-export-DIm_3hRN.js` @828）

⇒ 八键逐字＝`numberedListStyle`（值含占位的`{number}. `）、`bulletListStyle`＝`- `、`toggleListStyle`＝`+ `、`todoListStyleChecked`＝**勾选档用大写 X**、`todoListStyleUnchecked`＝`[ ] `、`lineStyle`＝`---`、`fixListOrders`＝真、`fixIndentationLevel…`（同名前缀的第二个修复开关）；⇒ ★★★ 与第 116 批那条"导出用三空格缩进"同族：这张表证明**导出侧的列表／分隔线写法全是一组可配常量**，而导入侧把它们当字面量认 ⇒ ⇒ **"导出写大写 X、导入只认小写 x"落在同一份代码的两侧**（照记，不判成 bug）。

### 七、导入器配置默认值（四键）

⇒ 逐字四键＝`autoConvertRemoteLinksToFiles`、`parseAdditionalAttributes`、`parseMarkdownStyleSubpages`、`handleIconsInAsideTags`，默认值全为假；⇒ ★ 机器计数＝前三枚在主 chunk 内**各只出现 1 次**（＝只有这一处声明），第四枚出现 4 次（声明＋导出侧注册＋返回前合并＋另一处调用）；⇒ ☆ 另：这张默认值表所在函数的参数顺序＝(文本, 导入上下文, 配置)，配置是**被展开覆盖**的（⇒ 调用方可逐键覆盖）。

### 八、标签 → 排版层的映射表（九键，兜底 `body`）

⇒ 逐字＝`h1`→`title`、`h2`→`subtitle`、`h3`→`heading`、`h4`→`strong`、`h5`→`strong`、`h6`→`strong`、`p`→`body`、`pageRegular`→`pageRegular`、`pageCard`→`pageCard`；⇒ ★ **读不到键时兜底＝`body`**；⇒ ☆ 两条含义：⑴ 官方层级词表（title/subtitle/heading/strong/body）在**导入侧也是同一套**，与第 109 批"层级词表不是 H1–H4"的结论互证；⑵ **h4/h5/h6 三档合并成 `strong`** ⇒ 从 HTML 导入时**四级以下标题的层级信息丢失**（只剩三级可区分）。

**仍未采到（本节）**：① 导出样式常量表的**完整键集**（本轮只读到列表／分隔线一族，缩进与代码块族在第 116 批读到）；② `Avt` 的标记候选集（`-`/`*`/`+` 还是别的）；③ 大写 X 是否被上游某个规整步骤降级（只有上屏能判）；④ `pageRegular`/`pageCard` 两个"标签"从哪来（官方文档导出里有这两档吗）。

## 四十四、**第 124 批逐字清单＝washi 六档 detail 全文 ＋ 契约索引层整段 ＋ `line`／`json` 两份指南全文 ＋ 只读面自报名单 ＋ `search` 作用域四组回包**（✓数据面只读 2026-10-01 19:5x–20:4x 本地；★ 全部来自 `craft` MCP 只读动词、零写入、零屏幕；☆ 三份原始回包同时落盘＝`_harvest/b124-washi.txt`／`b124-search-scope.txt`／`b124-learn.txt`；机制在 `internals.md` §五十七，模型含义在 `model.md` §一之七十六，gap 在 `gap.md` §三点一〇七五 G1247–G1250）

### 一、`blocks explore-washi --pattern <名>` 六档逐字（每档三行＋两行用法）

⇒ 六档 `Description` 逐字＝

```
hex        Hexagon geometric pattern
dot        Dot pattern
stripe     Horizontal stripe pattern
diagonal   Diagonal stripe pattern
grid       Grid pattern
wave       Wave pattern
```

⇒ 每档 `Type` 一行**全部逐字相同**＝`Type: built-in` ⇒ ☆ 本轮观察不到第二种类型 ⇒ "还有非内置档"这一说**没有证据**（也不排除）；
⇒ 每档的用法段结构相同（以 `hex` 为例，余五档只是把 `--washi-pattern` 的值换成该档名）＝

```
Usage with blocks update:
  blocks update --id <blockId> --separator washi --washi-pattern hex
  blocks update --id <blockId> --separator washi --washi-pattern hex --washi-color #3B82F6
```

⇒ ★☆ 这两行是历批第一次从官方自己嘴里拿到"和纸分隔线"的**写侧形状**（三枚旗标＝`--separator washi`／`--washi-pattern`／`--washi-color`）；⇒ ☆ 但 `blocks update` **不在只读面上**（见 §五）⇒ 本批无法执行它 ⇒ 全部按「官方声明了 X」登记，不写"官方有此行为"。

### 二、`blocks learn`（契约索引层）整段逐字——★ 四遍复跑逐字相同（其中一遍是同一次调用内连请求两遍）

```
blocks learn — topics: blocks learn <topic> [<topic> ...]

Request several topics in one command (tokens separated by spaces or commas) to fetch
multiple guides at once — recommended over separate craft_read calls when you need
more than one topic.

Guides:
  concepts — How blocks read/write commands fit together (markdown vs JSON, targets, positions).
  limitations — Operations that blocks add/update cannot replace (collection items, some tables, trash).
  json — Quick reference for --json on blocks add and blocks update.

Block types (insert JSON — blocks add --json):
  text, page, code, richUrl, line, table, image, video, file

Block types (update JSON — blocks update --json):
  text, page, image, video, file, drawing, whiteboard, table, collection, code, richUrl, line

Tip: richUrl is the JSON "type" for link cards (topics: richUrl, url, link).
Tip: Search works on aliases and keywords — e.g. blocks learn task line or blocks learn concepts, limitations.
```

⇒ 计数（脚本数）＝insert **9** 项、update **12** 项 ⇒ ★ 与在册 G681（第 76 批）**零差集**；☆ 我首读把它读成 8 项，据此几乎登记"官方改契约"的假差分，复跑三遍才否证 ⇒ 过程在 `gap.md` §三点一〇七五 §四第③条；
⇒ ☆ 三份指南里 `concepts` 与 `limitations` 正文本批**没读**（挂"仍未采到"）。

### 三、`blocks learn line` 整段逐字（★ 历批只拿到片段，本批第一次整段）

```
line — Visual line / separator between sections.

Insert JSON: { "type": "line", "lineStyle": "strong|regular|light|extraLight|pageBreak" }
lineStyle defaults to regular if omitted.

Update JSON: id plus optional lineStyle and other partial fields.
Shared optional fields on many blocks: indentationLevel (0–5), listStyle, decorations, color (#RRGGBB), taskInfo.
```

⇒ ★☆ 注意 §一 与 §三 **不是同一面旗标**：这里枚举 `lineStyle` 五值、**没有** `washi`；§一 的用法行用的是 `--separator` ⇒ 两套并存的官方声明，关系未裁定（G1250）；
⇒ ☆ `color (#RRGGBB)`＝契约声明 6 位，而屏上实测存在 8 位带 alpha 的值（G1146 的 `#f4f4f41f`）⇒ 记为**契约缺陷候选**，不改判在册；
⇒ ★ 默认档 `regular` 与 G1229 那条"官方 `---` ＝ `regular`（默认档）"**两条独立通路咬合**（一条来自 markdown 导入器逐字、一条来自契约指南）⇒ 该默认档从"单源"升为"双源"。

### 四、`blocks learn json` 整段逐字（两遍相同；★ 它自己把类型名单推给索引层 ⇒ 索引层是唯一出处）

```
json — Quick reference for --json on blocks add and blocks update.

blocks add --json: pass one NewBlock object or an array of NewBlock. Types below under “Insert JSON”.
blocks update --json: pass one BlockUpdate object or an array. Every object in an array must include id.

Invalid JSON or schema mismatch returns a readable error with the first field path that failed validation.
```

### 五、`blocks update --help` 的报错串逐字（★ 只读面的命令全集由这条报错自己枚举）

```
Unknown command: blocks update

Available commands:

  blocks get - Read document content as markdown (by ID or --date)
  blocks learn - Explain block JSON types, concepts, and limitations for craft_write; pass multiple topic names in one call when useful
  blocks explore-washi - Browse available washi tape patterns
  blocks search-unsplash - Search Unsplash for hero cover or background images
  blocks explore-themes - Browse available page styling and code themes
```

⇒ ★ 两义＝① 判"某动词在这一面存不存在"零成本（故意打一条不存在的命令）；② §一 那两行用法里的 `blocks update` **不在只读面上** ⇒ "官方声明了写侧形状"与"本面能不能执行"是两件事。

### 六、`search` 作用域四组回包逐字（★ 这一组把 G1248 从"看不见"改成"默认档不含"）

⇒ ① 三条沙盒完整标题、**不带**旗标 ⇒ 三次全 `No matches found for the provided search criteria.`；同时 `documents list --location trash` 回 `6 document(s)`，三条沙盒**逐条在册**（另三条是无标题历史项）；
⇒ ② 加旗标再问一次 ⇒ `search QODER-HARVEST-B109-CODEFIELD --location trash` 回

```
Search results: 1 match(es)

1) Document <id-4>
   Match:
     **QODER-HARVEST-B109-CODEFIELD**
   Created: 2026-09-30T17:13:14.000+08:00
   Modified: 2026-09-30T17:14:29.000+08:00
```

⇒ ③ 只给前缀 ⇒ `search QODER-HARVEST --location trash` 回 `3 match(es)`，三条含连字符的标题**全部命中**（匹配串被打分成 `**QODER-HARVEST**-B113-CODEBLOCK` 这种"命中段加粗"的形状）⇒ ★ 否证"连字符被分词打散"；
⇒ ④ 反向对照 ⇒ `search welcome` 回 `3 match(es)`（三条**活动**文档），`search welcome --location trash` 回 `No matches found` ⇒ ★ **两档互斥**；
⇒ ☆ id 已按历批脱敏纪律折成占位（`<id-4>` 等），本目录产物不出现官方实体 uuid；☆ 逐字原件（含时间戳与顺序）在 `_harvest/b124-search-scope.txt`。

### 七、☆ 本批刻意**没有**重抄的两份名册（并写明为什么）

⇒ **代码主题 19 档**＝本轮复跑与在册 G1148 逐字零差集 ⇒ 只记"复证成功"，**不重抄名单**（重抄＝另造一份可能抄错的副本，历批已经因为手抄虚报过一次）；
⇒ **页面主题名册（约 150 行、唯一分组 `Modern:`、头行写着主题来自远端对象存储）**＝整表回读到了但**没做逐字差集** ⇒ 原因＝要抄进脚本才能比 ⇒ 与上一条同族风险 ⇒ 挂台账「二十三」第②行，等"名册原文落盘"的通路。

**仍未采到（本节）**：① `blocks learn concepts`／`blocks learn limitations` 两份指南正文；② `explore-icons` 是否也有 detail 层；③ `--location templates` 与 `--location daily_notes` 在 `search` 上是否可用；④ washi 六档的**观感**与**导出形状**（要写入或导出才能读）；⑤ 只读面自报的 5 条动词与契约头行里 `whiteboards …`／`collections …` 是否同面；⑥ 官方移动端整族。


## 四十五、**第 125 批逐字清单＝`blocks learn concepts`／`limitations` 两份指南全文 ＋ 只读面命令树全量自报 ＋ 四枚旗标的六组回包**（✓数据面只读 2026-10-01 21:0x–21:3x 本地；★ 全部只读、零写入、零屏幕；☆ 原始读数＝`_harvest/b125-flag-audit.txt`（队列①）＋`_harvest/b125-flags-and-tree.txt`（队列②③）；机制在 `internals.md` §五十八，gap 在 `gap.md` §三点一〇七六 G1251–G1255，判据在 `interactions.md` V119）

### 一、`blocks learn concepts, limitations` 全文（同一次调用内两遍，逐字相同）

```
concepts — How blocks read/write commands fit together (markdown vs JSON, targets, positions).

blocks get reads a page or daily note as markdown (and optional JSON with --format json).

blocks add needs a target plus content:
  • --id <page root block id> or --date <daily note> or --siblingId <block>
  • --position: with --id/--date → start|end (default end); with --siblingId → before|after (default after)
  • Content: --markdown <text> OR --json <object|array> (mutually exclusive)

blocks update needs:
  • --markdown: requires --id
  • --json: object or array; each update needs id. For a single object you may omit id in JSON if you pass --id.

JSON payloads are validated against the same schemas as MCP block tools (partial typed updates allowed where the schema allows).

────────

limitations — Operations that blocks add/update cannot replace (collection items, some tables, trash).

Collection items: rows inside a collection are not edited with blocks update. Use collection item tools.

Tables: some table layouts are read-only or only safely edited via markdown; service errors include hints when that applies.

Trash: blocks inside trashed documents cannot be mutated until the document is restored.

Delete: blocks delete skips collection-like and trashed targets with warnings (see blocks delete help).
```

⇒ ★ 三处新细节＝`--position` 的两套词表与**两处默认档**（`end`／`after`）、`blocks update --markdown` 必须配 `--id` 而 `--json` 单对象可省、`limitations` 明写回收站不可写（与 G1176 实测报错双源咬合）；⇒ ☆ 全部按「官方声明了 X」登记。

### 二、只读面命令树全量自报（★ 打一条不存在的实体名逼出来的，G1252）

⇒ 输入＝`bogus`；输出首行 `Unknown command: bogus`，之后是整棵树（**10 个实体段／18 条叶子动词**，脚本数）：

```
  connection - Read MCP connection metadata and timezone information
    connection info - Show connection metadata, space timezone, requester timezone, and current dates
  folders - Browse and search folders
    folders list - List folder tree (--filter <JS regex> --offset <n>)
    folders explore-icons - Search available folder icons by name
  documents - Browse and list documents
    documents list - List documents with optional location, folder, date, and metadata filters
    documents resolve-link - Resolve a Craft document link to a rootBlockId
  search - Search across the entire space with optional filters
  tasks - Browse and filter tasks. Task dates notify in-app. For timed alerts on any block: reminders --help.
    tasks list - List tasks by scope (--scope active|upcoming|inbox|logbook|document|all). ...
  reminders - Block reminders belong to the connected Craft user with OAuth, or the creator of a single-user-space link. Document scope always applies.
    reminders list - List reminders
  collections - Browse and search collections
    collections list - List all collections in the space or a specific document
    collections schema - Show collection schema with item-title guidance, property keys, and types
    collections views-list - List collection views
    collections items-get - Get items from a collection
  whiteboards - Read whiteboard content
    whiteboards elements - Read whiteboard elements
      whiteboards elements get - Get elements, assets, and app state for a whiteboard block
  images - View images from Craft resource URLs or short links
    images view - Return an image payload for a Craft image URL
  blocks - Read document content
    blocks get - Read document content as markdown (by ID or --date)
    blocks learn - Explain block JSON types, concepts, and limitations for craft_write; pass multiple topic names in one call when useful
    blocks explore-washi - Browse available washi tape patterns
    blocks search-unsplash - Search Unsplash for hero cover or background images
    blocks explore-themes - Browse available page styling and code themes
```

⇒ ☆ 两处"声明与实测相反"（本目录自报清单里的官方文案 vs 历批实测）＝`documents list` 写着"…and metadata filters"而 `--filter` 在该动词上被吞（G1251）；`search` 写着"across the **entire space**"而默认档不含回收站（G1249）；
⇒ ★☆ **该名单不完整**＝`images view` 不在树里却真实可用：

```
--- images view --url x; images view --url x
Command 1 failed: images view --url x
{"status":"Action failed","error":"Validation error: Invalid asset URL format. Expected res.craft.do/user/... or r.craft.do/..."}
Stopped after failure; earlier commands were already applied.
```

⇒ ⇒ 回包是**参数校验错**而不是 `Unknown command` ⇒ 判据＝报 `Unknown command` 才算动词不存在；☆ 且"两遍相同"对会失败的命令无效（分号批处理第一条失败即停，第三次复现）。
⇒ ☆ 单实体探测也给同一层信息（七次独立调用＝`documents`／`folders`／`tasks`／`collections`／`whiteboards`／`reminders`／`connection` 各加 `bogus`）⇒ 每个实体段只报**自己那一段**，所以全量必须靠顶层那条。

### 三、`folders list` 的四种旗标形态逐字（★ `--filter` 在这条动词上确实生效，G1251）

```
--- folders list
Showing 1-2 of 2 folders with the following format: <folderId> Folder Name (document count)

* <id-F1> How to use Craft (3 docs)
  * <id-F2> 日记 (2 docs)

--- folders list --filter zzz-never-matches
No folders matching "zzz-never-matches".

--- folders list --offset 99
Command 3 failed: folders list --offset 99
Offset 99 exceeds total of 2 folders.

--- folders list --filter ^日
Showing 1-1 of 1 folders with the following format: <folderId> Folder Name (document count)

* <id-F1> How to use Craft (3 docs)
  * <id-F2> 日记 (2 docs)

--- folders list --filter how
Showing 1-1 of 1 folders with the following format: <folderId> Folder Name (document count)

* <id-F1> How to use Craft (3 docs)
  * <id-F2> 日记 (2 docs)

--- folders list --filter 日|H
Showing 1-2 of 2 folders with the following format: <folderId> Folder Name (document count)

* <id-F1> How to use Craft (3 docs)
  * <id-F2> 日记 (2 docs)
```

⇒ ★ 三条判据从这组里出来＝① `--filter` 是**真·大小写不敏感 JS 正则**（锚点、交替、不敏感三项各自验过）⇒ `api-contract.md:49` 那条声明**为真**（仅对该动词）；
⇒ ★ ② **树形过滤保留祖先但计数只数命中项**＝头行 `1-1 of 1` 而树里两行 ⇒ 数行＝2、数计数＝1 ⇒ G1253；
⇒ ★ ③ `--offset` 越界会**显式报错**（`folders` 族）⇒ 与 `documents list` 的静默吞形成两类失败长相 ⇒ 内部机制含义见 `internals.md` §五十八.1。

### 四、`documents list --location unsorted` 的四条并排回包（★ 范围内正控制，逐字相同）

⇒ 四条命令＝不带旗标／`--offset 2`／`--filter Welcome`／`--filter zzz-never-matches`，回包**四条逐字相同**：

```
3 document(s) — format: <rootBlockId> Title

  <id-D1> Welcome to Craft
  <id-D2> （无标题）
  <id-D3> （无标题）
```

⇒ ⇒ 若 `--offset 2` 生效该剩 1 条、若 `--filter Welcome` 生效该剩 1 条、若 `--filter zzz-never-matches` 生效该 0 条或报错 ⇒ **三枚旗标全部被吞且不报错**；
⇒ ☆ 这正是"危险的那一类失败"＝回包与"旗标生效且恰好全命中"无法区分 ⇒ 单靠"不可能命中"的探针不足以判，必须同时做范围内正控制。

### 五、☆ 本批刻意**没有**做的事

⇒ 没有重抄任何名册（代码主题 19 档只做第三遍复跑比对，本轮逐字与 G1148 在册零差集）；⇒ 没有测 `--filter` 在 `tasks list`／`collections list` 上是否生效（矩阵留四格未测，挂"仍未采到"）；⇒ 没有任何写侧探针（`limitations` 那四类禁地只读契约文案，未造报错）。

**仍未采到（本节）**：① `--filter` 在 `tasks list`／`collections list`／`documents list --folder` 上的可达性；② `explore-icons` 的 `--offset` 越界行为（在册挂着，本轮仍未测）；③ `--location templates`／`daily_notes` 在 `search` 上是否可用；④ 只读面自报名单的其余漏项；⑤ `limitations` 里"某些表格布局只读"的具体档位；⑥ 官方移动端整族。

## 四十六、**第 126 批逐字清单＝九段命令树自报全文 ＋ `--filter` 三种长相的对照回包 ＋ 两处越界报错措辞 ＋ 批处理失败包装串 ＋ `documents resolve-link` 的 Usage 全文 ＋ `blocks learn` 主题名册与 `line` 指南回包**（✓数据面只读 2026-10-01 21:4x–22:1x 本地；★ 零屏幕、零写入；☆ 所有账户内容（任务正文／集合名／文件夹名／文档标题）一律折成占位，id 全部掩掉；gap 在 `gap.md` §三点一〇七七，机制在 `internals.md` §五十九，判据在 `interactions.md` V120）

### 一、九段命令树自报（每段＝打 `<entity> bogus` 逼出，☆ 逐字只保留命令名与描述行）

⇒ `documents bogus` ⇒ `Unknown command: documents bogus` ⇒ Available＝`documents list - List documents with optional location, folder, date, and metadata filters` ／ `documents resolve-link - Resolve a Craft document link to a rootBlockId`；
⇒ `blocks bogus` ⇒ Available（第二、三次读数）＝`blocks get - Read document content as markdown (by ID or --date)` ／ `blocks learn - Explain block JSON types, concepts, and limitations for craft_write; pass multiple topic names in one call when useful` ／ `blocks explore-washi - Browse available washi tape patterns` ／ `blocks search-unsplash - Search Unsplash for hero cover or background images` ／ `blocks explore-themes - Browse available page styling and code themes`；⇒ ★★★ **第一次读数只有前四条、没有 `blocks explore-themes`**（同参、同会话，中间只夹了一次 `blocks explore-themes --type code` 的真实调用）；
⇒ `folders bogus` ⇒ Available＝`folders list - List folder tree (--filter <JS regex> --offset <n>)` ／ `folders explore-icons - Search available folder icons by name`；⇒ ★ **描述行逐字带两枚旗标的只有 `folders list` 这一条**（九段全文里唯一）；
⇒ `tasks bogus` ⇒ Available＝`tasks list - List tasks by scope (--scope active|upcoming|inbox|logbook|document|all). Task dates notify in-app. For timed alerts on any block: reminders --help.`；
⇒ `collections bogus` ⇒ Available＝`collections list - List all collections in the space or a specific document` ／ `collections schema - Show collection schema with item-title guidance, property keys, and types` ／ `collections views-list - List collection views` ／ `collections items-get - Get items from a collection`；
⇒ `whiteboards bogus` ⇒ Available＝`whiteboards elements - Read whiteboard elements`（**分组行**）＋ `whiteboards elements get - Get elements, assets, and app state for a whiteboard block`（**叶行**）；⇒ ☆ 而**顶层**自报只有分组行那一条；☆ 分组行本身也可调＝`whiteboards elements` 回 `Available commands:` ＋它自己的子名单（不是报错）；
⇒ `images bogus` ⇒ Available＝`images view - Return an image payload for a Craft image URL`；⇒ ★★★★ **这一条同时否证了第 125 批"顶层名单漏 `images view`"那句**（顶层 18 条叶行清单里本来就有它，见 `internals.md` §五十九之二）；
⇒ `reminders bogus` ⇒ Available＝`reminders list - List reminders`；`connection bogus` ⇒ Available＝`connection info - Show connection metadata, space timezone, requester timezone, and current dates`；
⇒ ☆ 顶层自报里 `search` **只有段行**＝`search - Search across the entire space with optional filter`，**没有对应的叶行** ⇒ 按缩进数叶会把这个动词整个漏掉。

### 二、`--filter` 的三种长相（三组回包逐字并排）

⇒ ① **生效**＝`folders list --filter zzz-never-matches` ⇒ `No folders matching "zzz-never-matches".`；
⇒ ② **静默吞**＝`tasks list --scope all --filter zzz-never-matches` ⇒ `Tasks (all): 9 result(s)` ＋九行与不带旗标时**逐字相同**（同调用内再跑一遍也相同）；同形＝`collections list --filter zzz-never-matches` ⇒ `Found 3 collections:` 三行不动、`search welcome --filter zzz-never-matches` ⇒ `Search results: 3 match(es)` 三条不动；
⇒ ③ ★★★ **值被当位置参数消费**＝`folders explore-icons rocket --filter calendar` ⇒ `Icons matching "calendar" (1-30 of 42):` ＋30 行 calendar 族图标 ⇒ **检索词被换成 `--filter` 的值、位置参数 `rocket` 被丢弃**；☆ 无位置参数时同形＝`folders explore-icons --filter zzz-never-matches` ⇒ `No icons matching "zzz-never-matches".`
⇒ ☆ 顺带钉一条该动词的**回包句式三档**＝有命中⇒`Icons matching "<term>" (a-b of n):`；零命中⇒`No icons matching "<term>".`；无检索词⇒`Usage: folders explore-icons <search-term> [--offset <n>]` ＋两行说明＋例子。

### 三、`--offset` 与 `--cursor`（措辞对照逐字）

⇒ `folders explore-icons calendar --offset 30` ⇒ `Icons matching "calendar" (31-42 of 42):` ＋12 行 ⇒ ☆ 页宽恰好 **30**，且尾部提示逐字＝`Next page: folders explore-icons calendar --offset 30`；
⇒ `folders explore-icons calendar --offset 99` ⇒ **`Offset 99 exceeds total of 42 results.`**；☆ 与在册 `folders list` 那句 **`Offset 99 exceeds total of 2 folders.`** 措辞不同（一处分说名词、一处统一 `results`）⇒ 同一族校验在各动词各写一份文案；
⇒ `tasks list --scope all --offset 99`／`collections list --offset 99`／`search welcome --offset 99` ⇒ 三格**都回全量、零报错**＝静默吞；
⇒ `folders list --cursor bogus` ⇒ 回正常全量、零报错 ⇒ ☆ 只证明"不校验"；配合"分页提示从不吐 cursor"才写成"本面无生产者"。

### 四、★★★ 批处理失败的包装串（官方逐字）

⇒ 一次三条批处理（`folders explore-icons rocket; documents get; folders explore-icons rocket`）的回包＝
```
Icons matching "rocket" (1-1 of 1):

  rocket

Command 2 failed: documents get
Unknown command: documents get

Available commands:

  documents list - List documents with optional location, folder, date, and metadata filters
  documents resolve-link - Resolve a Craft document link to a rootBlockId

Stopped after failure; earlier commands were already applied.
```
⇒ ① 第三条**没有执行**（失败即停第四次复证）；② ★★★★ 末行是官方自己打印的**"前面的命令已经应用"**＝分号批处理不是事务、中途失败不回滚（历批这条只能从写侧实验推断）；③ ☆ 包装串带**失败项序号与命令原文** ⇒ 归因零成本；④ ☆ `documents get` 在本面不存在＝`Unknown command`。

### 五、★ `documents resolve-link` 的校验串与 Usage 全文

⇒ `documents resolve-link not-a-url` ⇒
```
Invalid URL. Pass a craftdocs:// or https://docs... Craft link.

Usage:
  documents resolve-link <craftdocs-or-web-url>
  documents resolve-link --url <craftdocs-or-web-url>

Converts Craft app/web document links to the rootBlockId used by blocks get/write commands.
Craft URLs contain a raw documentId that is for opening the app; it is not necessarily the block ID MCP tools need.

Examples:
  documents resolve-link craftdocs://open?spaceId=<spaceId>&documentId=<rawUrlDocumentId>
  documents resolve-link https://docs.craft.do/editor/d/<spaceId>/<rawUrlDocumentId>
```
⇒ ★ **位置参数与 `--url` 两种入参都收**；⇒ ★ web 链接形状逐字＝`https://docs.craft.do/editor/d/<spaceId>/<documentId>`（历批只记过"URL 尾段是 documentId"，本批第一次拿到**整条模板**）；⇒ ★★★ **同一座桥的 `connection info` 里 `urlTemplates.app` 逐字用 `blockId=`**（`craftdocs://open?spaceId=<id>&blockId={blockId}`）**而这里的例子用 `documentId=`** ⇒ 两个参数名在官方两处契约文本里各写一份，给第 113 批"`rootBlockId` 与 `documentId` 互不互通"再添一码路证据；☆ 且官方自己逐字承认"raw documentId … not necessarily the block ID"。

### 六、☆ `search` 作用域四档与"空档"的三条交叉证据

⇒ `search welcome --location templates`／`search welcome --location daily_notes` ⇒ 两条都回 `No matches found for the provided search criteria.`（☆ 旗标被接受、不报错）；
⇒ 交叉三条＝`documents list --location templates` ⇒ `No documents found in "templates".`；`documents list --location daily_notes` ⇒ 同形（档名换成 `daily_notes`）；`blocks get --date today --format markdown` ⇒ `Daily note for date <今天> does not exist.`；
⇒ ☆ 所以这两格＝**空作用域里的零命中**（空判据），本批不据此下任何覆盖范围结论（`interactions.md` V120 第④条判据）。

### 七、☆ `blocks learn` 主题层回包两条

⇒ `blocks learn`（无主题）⇒ 三段名册逐字＝Guides＝`concepts`／`limitations`／`json`；Block types (insert JSON — blocks add --json)＝`text, page, code, richUrl, line, table, image, video, file`（**9**）；Block types (update JSON — blocks update --json)＝`text, page, image, video, file, drawing, whiteboard, table, collection, code, richUrl, line`（**12**）⇒ ☆ 与在册 G681／G1250 **第四次零差集**（脚本数）；另逐字给了并提语法与"richUrl 是 link 卡的 JSON type"这条提示；
⇒ `blocks learn bogus` ⇒ `No topic matched "bogus".` ＋一行提示（可以空格或逗号并提多主题）⇒ ☆ 主题名错**不报 `Unknown command`**，与动词层是两套校验。

### 八、☆ 读侧失败形态一条

⇒ `documents --help; blocks --help` ⇒ **`MCP error -32603: MCP tool invocation did not complete`**（☆ 带动作名的 `--help` 历批可用，**不带**动作名的不可用）；⇒ ☆ 同会话紧接着 `connection info` 正常返回 ⇒ 读侧 `-32603`＝本次调用未成立，**不等于桥挂**。

## 四十七、**第 127 批逐字清单＝选项白名单拒绝串 ＋ 五种错误／回包形态各一条 ＋ resolve-link 正负两套回包 ＋ `--metadata` 回包头部 ＋ 块模型真数据片段**（✓数据面只读 2026-10-01 22:2x–23:3x 本地；★ 零写入；☆ 用户个人文本（一篇日记、一段用户自己的指令）**未抄入本文件**，只登记"存在"；id 一律折占位；gap 在 `gap.md` §三点一〇七八，机制在 `internals.md` §六十，判据在 `interactions.md` V121）

### 一、★ 选项白名单拒绝串（旗标级自报，两枚旗标同一句式）

```
Invalid, duplicate or missing option: --filter. Supported options: --status, --limit, --cursor.
Invalid, duplicate or missing option: --offset. Supported options: --status, --limit, --cursor.
```
⇒ 同动词两次调用、句式逐字相同（只有被拒旗标名变）；⇒ ☆ 顺带两格＝`reminders list --status all --limit 1` ⇒ `No reminders found.`（`--limit` **被接受**，而该档零条目 ⇒ 数据效果不可判）；`reminders list --status all` 基线同为 `No reminders found.`（**空档**）。

### 二、★ `--cursor` 的值校验串（该动词上 `--cursor` 有真实现）

```
Pagination cursor invalid: Reminder no longer exists. Restart without cursor.
```

### 三、四种错误／回包形态各一条

① **纯文本行**（最常见）：`No folders matching "zzz-never-matches".`（第 125 批在册，本批复用为对照）；
② **JSON 错误包**（`images view`）：
```
{"status":"Action failed","error":"Validation error: Invalid asset URL format. Expected res.craft.do/user/... or r.craft.do/..."}
```
③ **选项白名单行**＝本节一；
④ **错误码行**（`whiteboards elements get`，按**块 id** 找）：
```
error(NOT_FOUND_ERROR): Whiteboard block not found
```

### 四、★★ resolve-link 的负／正两套回包（同一 URL 模板、尾段换成两枚 id）

负（尾段喂 rootBlockId）：
```
Command 1 failed: documents resolve-link https://docs.craft.do/editor/d/<spaceId>/<rootBlockId-W>
Could not find this document in the current MCP scope.
Raw URL documentId: <rootBlockId-W>
Hint: run documents list --metadata to see accessible documents and their rootBlockIds.

Stopped after failure; earlier commands were already applied.
```
正（尾段喂 raw documentId，三档带／不带 `--filter`／`--offset` **逐字相同**）：
```
Resolved link to rootBlockId <rootBlockId-W>
Title: Welcome to Craft
Raw URL documentId: <rawId-W>
Next: blocks get <rootBlockId-W>
```

### 五、★★ `documents list --metadata` 回包头部（批量对照器）

```
14 document(s) — format: <rootBlockId> Title (createdAt, lastModifiedAt)

  <rootBlockId-1> Quick Start: get going (created: …, modified: …) → craftdocs://open?spaceId=<spaceId>&documentId=<rawId-1>
  …（14 行同形，每行两枚 id 各不相同）
```
⇒ ☆ 两条附带读数＝① **本批没有重跑裸 `documents list`**（14 行这个数是 `--metadata` 那次自己给的；在册的裸跑是第 125 批的 `--location unsorted`＝3 行，两者差异来自 `--location` 档不是 `--metadata`）；② **默认档含回收站复证（G1155）**＝这 14 行里能看见三篇 `QODER-HARVEST-*` 沙盒（它们在回收站里）⇒ 与在册口径同向。

### 六、★★ 块模型真数据片段（`blocks get --format json --depth 1` 抽样，id 折占位）

```
{"id":"…","type":"page","textStyle":"page",
 "styling":{"pageWidth":"false",
   "backdrop":"{\"image\":{\"imageBgColor\":\"#ffe5cf\",\"imageBlurHash\":\"@HT8Xdu…\",\"imageIsBlurred\":true,\"imageUrl\":\"https://res.craft.do/user/full/…\"},\"size\":\"full\",\"type\":\"image\"}"},
 "markdown":"…","content":[ … ]}
```
⇒ 三处要点＝**`styling.backdrop` 的值是一整段 JSON 字符串**、`pageWidth` 的值是**字符串 `"false"`**、backdrop 内的 `imageUrl` 是 `res.craft.do/user/full/…` 形（与 `images view` 的 URL 校验串对上）。
```
{"id":"…","type":"text","textStyle":"h4","decorations":["quote","callout"],"markdown":"<callout>…</callout>"}     ← decorations 实读＝数组
{"id":"…","type":"text","taskInfo":{"state":"todo"},"listStyle":"task","markdown":"- [ ] …"}                        ← taskInfo 实读
{"id":"…","type":"line","lineStyle":"light","markdown":"****"}                                                      ← lineStyle 实读（五值内）
{"id":"…","type":"image","url":"https://r.craft.do/<code>","indentationLevel":1,"markdown":"  ![Image](…)"}
{"id":"…","type":"richUrl","url":"https://youtu.be/…","title":"…","description":"…","markdown":"[…]"}
```
⇒ ☆ 另一枚真色值实读＝`"color":"#00ca85"`（callout 文字色，六位 hex；同批另见 `#0064ff`／`#0085a4`／`#ef052a` 与封面 `imageBgColor` `#ffe5cf`／`#ffb28e` ⇒ 全部进 `styles.md` §二十二）。

### 七、☆ 官方 markdown／页面形态两条（`blocks get --format markdown` 抽样）

```
<page id="<docId>"><pageTitle>…</pageTitle><content>… <callout>…</callout> … ![Image](https://r.craft.do/<code>) … </content></page>
```
⇒ 图块在 markdown 里就是 `![Image](url)`；`<highlight color="gradient-purple|red|yellow|blue|mint|green">` 六枚颜色名（`gradient-*` 的 CSS 值第 112 批已在册，本批不重复登记）。

### 八、☆ 失败路径自带导航的第三次（三串并列）

```
Hint: run documents list --metadata to see accessible documents and their rootBlockIds.
Next page: blocks search-unsplash "mountains" --page 2
Supported options: --status, --limit, --cursor.
```

## 四十八、第 128 批逐字串（✓数据桥只读 2026-10-02 00:5x–01:2x 本地；★ 零写入 ⇒ `manifest.jsonl` 155 行不变；☆ 所有 id／时间戳折占位，原文只留 `_harvest/b128-dateflags.txt`／`_harvest/b128-flagforms.txt`，两份都在 gitignore 目录内）

### 一、`documents list --help`（★ Flags 段有十枚、usage 行只有四枚）

```
Usage: documents list [--location <loc>] [--folder <folderId>] [--metadata] [--cursor <token>]
       documents resolve-link <craftdocs-or-web-url>

Flags:
  --location <loc>            Filter by virtual location: unsorted, trash, templates, daily_notes
  --folder <folderId>         Filter by folder ID (includes subfolders recursively; cannot be used with --location)
  --metadata                  Include timestamps (createdAt, lastModifiedAt) and clickable links
  --created-after <date>      Only documents created on or after this date
  --created-before <date>     Only documents created on or before this date
  --modified-after <date>     Only documents modified on or after this date
  --modified-before <date>    Only documents modified on or before this date
  --daily-note-after <date>   Only daily notes on or after this date
  --daily-note-before <date>  Only daily notes on or before this date
  --cursor <token>            Pagination cursor from a previous response

Dates: YYYY-MM-DD or relative (today, yesterday, tomorrow).
Without --location or --folder, returns ALL documents (may be large — use folders list first).
The IDs shown in this command are rootBlockIds — use them with blocks get.
Craft app/web links contain a different raw documentId; use documents resolve-link to convert links.
If a cursor becomes invalid (CURSOR_INVALID), the underlying data has changed — retry without --cursor.

Example: documents list --location unsorted
         documents list --folder abc-123 --metadata
         documents list --modified-after 2025-01-01 --modified-before today

Tip: Use "documents list --help" for this usage reference.
```

⇒ ☆ **历批矩阵整族漏读的直接原因**＝只从 usage 行与 `Common flags` 头取旗标全集；⇒ ★ 三条自报值得单独抄＝`Dates: YYYY-MM-DD or relative (today, yesterday, tomorrow)`（**两种输入形态**）／`cannot be used with --location`（**唯一声明的互斥对**，只说 folder×location）／`--cursor <token>`＋`CURSOR_INVALID`（**契约描述过游标的生产与失效**）。

### 二、`reminders list --help`（★ 版式②＝单行签名＋散文，无 `Usage:`／`Flags:` 段）

```
reminders list [--status incomplete|completed|upcoming|all] [--limit 50] [--cursor cursor]
Defaults to incomplete, including overdue and Save for later items. Upcoming includes incomplete reminders with a future time or no time (Save for later). All includes incomplete and completed reminders within this connection's scope. Results are ordered by creation time, then ID; limit is 1–200, default 50. Continue with the returned cursor and the same status filter. If the cursor becomes invalid, restart without it.
```

⇒ ☆ 值域与缺省**写在散文里**（`limit is 1–200, default 50`）；⇒ ★ `--cursor cursor`＝占位符直接回填参数名；⇒ ★★★ 生产者的官方措辞逐字＝`Continue with the returned cursor`（本轮实测没能观测到任何一次吐出 cursor，但契约这样写）。

### 三、`images view --help`（★ 版式③＝`Usage:` 换行多签名 ＋ `Options:`）

```
Usage:
  images view --url <resource-or-short-url>
  images view <resource-or-short-url>

Options:
  --url  Craft image URL from blocks_get. Supports r.craft.do/... short links and res.craft.do/user/... resource URLs.

Returns raw MCP image content, matching the legacy image_view tool.
```

⇒ ☆ **同一动词两种签名并列**＝位置参数形与 `--url` 形等价（本轮**未实测**位置形，只按"官方声明了 X"记）；⇒ ☆ `legacy image_view tool` 这个措辞＝**该动词是从旧工具面迁移来的**（历批"两套命名体系并存"再添一例）。

### 四、五条回包逐字（★ 本轮的关键错误形）

```
documents list --created-after bogus
⇒ 14 document(s) — format: <rootBlockId> Title                         （★ 与裸跑逐字相同＝值被丢弃、不报错）

documents list --cursor bogus
⇒ Invalid cursor format. Retry without cursor.
  Hint: Use documents list --help for full usage.                       （★ 两行形＝拒绝句＋Hint 行）

reminders list --limit 0        ⇒ limit: Too small: expected number to be >=1
reminders list --limit 500      ⇒ limit: Too big: expected number to be <=200
reminders list --limit bogus    ⇒ limit: Invalid input: expected number, received NaN
```

⇒ ☆ 三条校验句的形状＝`<字段名>: <校验器语句>`，**本轮单独重跑逐条取字**（先前在批处理拼接文本里我把 `Too small` 与 `Invalid input` 记混过一轮）；⇒ ★ 批处理里的两种包装（同一句错误）＝`Command 2 failed: reminders list --limit 500` ＋ 原句 ＋ `Stopped after failure; earlier commands were already applied.`；☆ 单独跑只有裸行、没有 `Command N failed:` 前缀。

### 五、分页头与零结果形的两种写法

```
folders list --no-id
⇒ Showing 1-2 of 2 folders with the following format: Folder Name (document count)
  * How to use Craft (3 docs)
    * 日记 (2 docs)

documents list --location trash
⇒ 6 document(s) — format: <rootBlockId> Title

documents list --location trash --created-after 2030-01-01
⇒ No documents found in "trash".

documents list --location daily_notes
⇒ No documents found in "daily_notes".

documents list --created-after 2030-01-01
⇒ No documents found.
```

⇒ ★★★ 头行里那句 `with the following format: …` **会随 `--no-id` 改写**（在册基线同账户同两条＝`…format: <folderId> Folder Name (document count)`）⇒ 显示类旗标读 header 即可判落地；⇒ ★ **零结果两种形**＝默认作用域不带作用域名、`--location` 那一路带 `in "trash".`／`in "daily_notes".` ⇒ ☆ "空"要连回显一起记，否则两次空会互相冒充；⇒ ☆ 树里那行中文文件夹名（`日记`）与 `How to use Craft` 是**结构读数**、不含任何用户正文，按历批口径可以进产物。

### 六、日期旗标 × 作用域的四格对照（本轮实测）

```
documents list                                        ⇒ 14 行（★ 本批补上历批欠的那次裸跑）
documents list --created-after 2020-01-01             ⇒ 14 行，id 集与裸跑逐字相同
documents list --created-after 2025-06-01             ⇒ 7 行（★ 真子集＝生效）
documents list --created-after 2030-01-01             ⇒ No documents found.
documents list --created-before 2020-01-01            ⇒ No documents found.
documents list --created-before today                 ⇒ 14 行
documents list --created-after today                  ⇒ No documents found.
documents list --created-after yesterday              ⇒ No documents found.   （★ 相对词被解析：若回退应得 14 行）
documents list --modified-after 2020-01-01 --modified-before today ⇒ 14 行
documents list --location daily_notes --daily-note-after 2020-01-01 ⇒ No documents found in "daily_notes".（与不带旗标逐字相同＝空档不可判）
```

⇒ ☆ 逐 id 关系＝回收站那 6 行是裸跑 14 行的**子集**（G1155 第三次复证、第一次逐 id 对上）；⇒ ★ 时间戳形状（只写形状，具体时刻不进产物）＝`created: <ISO 本地时刻>`，本轮 14 行里毫秒段**全为 `.000`**、偏移**全为 `+08:00`**，且三篇官方样板文档的 `created` 与 `modified` **逐字相同**（＝从未修改过的旁证）。

## 四十九、第 129 批逐字串（✓数据桥只读 2026-10-02 01:5x–02:2x 本地；★ 零写入 ⇒ `manifest.jsonl` 155 行不变；☆ 所有 id／姓名／时间戳折占位，原文只留 `_harvest/b129-help.txt`（gitignore 目录内），卡片十六份的**完整原文**也在该 dump）

### 一、★★★★ 游标的生产条件三行（`blocks get --help` 的 `Pagination notes:` 小节，逐字）

```
Pagination notes:
  - Cursor pagination applies to direct children of the fetched block/page (top-level content array).
  - If the target has 50 or fewer direct children, no cursor is returned, even for very deep/nested content.
  - In markdown mode, the cursor is shown in a "Next page:" line. In json mode, it is returned as nextCursor.
```
同卡片另两行逐字＝
```
If a cursor becomes invalid (CURSOR_INVALID), the underlying data has changed — retry without --cursor.
         blocks get ABC-123 --depth 5 --cursor 50:cache-key
```
⇒ ☆ 游标形状第一次到手＝`<数字>:<cache-key>` 样式（历批只知"不透明令牌"）；⇒ ★ 该卡片 Example 段第一行写 `blocks get ABC-123`（位置式），Flags 段第一行写 `--id <blockId>` 且注明 `same target semantics as positional ID`。

### 二、★★★ 值域拒绝＋整卡重放（`collections items-get --page-size 500`，第六种回包形）

```
Command 1 failed: collections items-get --collection <collectionBlockId> --page-size 500
Invalid --page-size: 500. Must be between 1 and 200.

Usage: collections items-get --collection <collectionBlockId> [--cursor <token>] [--depth <n>] [--format <format>] [--page-size <n>]
…（随后该动词整张 usage／Flags 卡片原样重放，逐字同 `--help`）…
Stopped after failure; earlier commands were already applied.
```
对照那一发（界内、不生效）＝`--page-size 1` 打在 **3 条目**集合上：
```
Collection: <collectionName> <collectionBlockId>
Items: 3
Format: text
```
⇒ ★★ 三条头部逐字都在＝`Collection:`／`Items: 3`／`Format: text`；⇒ ★★★ **"值被拒"与"值不生效"落在同一枚旗标上**（G1276）；⇒ ☆ `Format: text`＝回包自己声明**生效的缺省格式**，是本批第四种"输出层自述"。

### 三、★★★ 互斥拒绝四句（两动词、四组合，逐字；注意两份文案不同）

```
documents list --folder <fid> --location unsorted
⇒ --location and --folder cannot be used together. Use --location for virtual locations (unsorted, trash, templates, daily_notes) or --folder for a specific folder ID — not both.

search --include roadmap --location unsorted --folder <fid>
⇒ --location and --folder cannot be used together. Choose one filtering mode.

search --include roadmap --document <did> --location unsorted
⇒ Command 1 failed: …
   --document cannot be combined with --location or --folder filters.
   Stopped after failure; earlier commands were already applied.

search --include roadmap --document <did> --folder <fid>
⇒ --document cannot be combined with --location or --folder filters.
```
⇒ ☆ 四发全部**先于取数**被拒（零检索、零列目录）；⇒ ★ 同一约束 `documents list` 那份**把 location 四档值重述一遍**、`search` 那份只有一句；⇒ ☆ `--document` 的两发**逐字同一句**。

### 四、★★★ `--fetchMetadata` 有／无对照（簇五枚；姓名与 spaceId 折占位，具体时刻不进产物）

不带（`--format json --depth 0`）＝块对象五键：
```
{"data":[{"id":"<rootBlockId>","type":"page","textStyle":"page","markdown":"<官方样例页标题>","contentPreviewMd":"<markdown 预览，尾部逐字 …and 28 more blocks>"}]}
```
带＝多出**一整个 `metadata` 对象**、其余逐字不变：
```
"metadata":{"lastModifiedAt":"<ISO，毫秒全 .000，偏移 +08:00>","createdAt":"<同形>","lastModifiedBy":"<personName>","createdBy":"<personName>","clickableLink":"craftdocs://open?spaceId=<spaceId>&blockId=<rootBlockId>"}
```
⇒ ★★★ 五枚＝when 两枚＋**who 两枚（真人姓名）**＋link 一枚；⇒ ★ `clickableLink` 用 `blockId=` 且值＝rootBlockId（第三种链接形态）；⇒ ☆ 另一发对照（同一动词、不同页面）里键集**多一枚 `"styling":{"fontFamily":"system"}`、且 `markdown` 为空串** ⇒ 块对象键集不闭合。

### 五、★★ 总量越界的第三种自述写法（`folders explore-icons rocket --offset 999`）

```
Offset 999 exceeds total of 1 results.
```
⇒ ☆ 一句话同时给出**越界拒绝**与**命中总量**；⇒ ★ 顺带证明 `explore-icons <search-term>` 是**过滤**（`rocket` 命中 1 枚）不是浏览。

### 六、★★★ 旗标别名行（`whiteboards elements get --help` 整卡，版式④＝`Options:`）

```
Usage:
  whiteboards elements get --whiteboard <whiteboardBlockId>
  whiteboards elements get <whiteboardBlockId>

Options:
  --whiteboard  Whiteboard block id. Aliases: --whiteboard-block, --whiteboardBlockId, --whiteboardId, --id.

Returns elements, assets, and appState as JSON, matching the legacy whiteboardElements_get tool.
```
⇒ ★★★ 一枚语义**四枚别名**、且 **kebab 与 camel 混写**；⇒ ★★ 文案里存活两枚 snake_case 旧工具名（本枚 `whiteboardElements_get`、另枚见 §七 `connection_info`）；⇒ ☆ 该卡片**无 Example、无 Tip**。
同段的分组节点回包（`whiteboards elements --help`）＝版式⑤：
```
Available commands:

  whiteboards elements get - Get elements, assets, and app state for a whiteboard block
```
⇒ ★☆ 分组节点的 `--help` 回的是**子名单**（与 `Unknown command` 同形），且描述写 `app state`（两词）而叶子卡片写 `appState`（驼峰）＝**同一动词在分组行与叶子卡片上描述逐字不同**。

### 七、☆ 另两枚"版式④／③"小卡逐字（`connection info`、`documents resolve-link`）

```
Usage:
  connection info

Returns the same connection metadata previously exposed by connection_info.
```
```
Usage: documents resolve-link <craftdocs-or-web-url>
       documents resolve-link --url <craftdocs-or-web-url>

Converts Craft app/web document links to the rootBlockId used by blocks get/write commands.
Craft URLs contain a raw documentId that is for opening the app; it is not necessarily the block ID MCP tools need.
```
⇒ ☆ `--url` 只在签名行（该卡片零旗标段）；⇒ ★ 官方自己把"app 链接里的 documentId 不是 MCP 要的 id"写成散文＝第 113 批双 id 口径的**第二次契约自报**。

### 八、★★ `tasks list --help` 的两段自述（版式③：签名行有旗标、无 Flags 段）

```
Usage: tasks list [--scope <scope>] [--document <rootBlockId>] [--cursor <cursor>]

Scopes: active (default), upcoming, inbox, logbook, document, all

Scope descriptions:
  active   - Open tasks whose task date (schedule, otherwise deadline) is <= today
  upcoming - Open tasks whose task date (schedule, otherwise deadline) is >= tomorrow
  inbox    - Task blocks in the inbox document
  logbook  - Completed or canceled tasks
  document - Tasks in a specific document (requires --document <rootBlockId>)
  all      - Every task block in the full space, across all documents and states; not a union of the other scopes (full-space MCP only)
```
卡片末行逐字＝`Task dates notify in-app. For timed alerts on any block: reminders --help.`
⇒ ★★ "task date" 的**取舍次序**（schedule 优先、缺则 deadline）第一次成文；⇒ ★ `logbook`＝完成**或取消**；⇒ ★★ `all` 自述**"不是其余各档的并集"**；⇒ ☆ 三枚旗标全在签名行＝历批"抓 Flags 段"会整族漏读的那个实例。

### 九、☆ `search --help` 的两段新类自述（互斥小节＋RE2 声明）

```
  --include <term>            Match raw text term (AND semantics; repeatable)
  --regexp <pattern>          Match RE2 regex pattern (AND semantics; repeatable)
```
```
Mutual exclusivity:
  - --location and --folder cannot be combined
  - --document cannot be combined with --location/--folder
```
⇒ ★★ 契约里出现**正则引擎名**（RE2），而 `folders list` 的自报描述写的是 `--filter <JS regex>` ⇒ **两种方言并存**（本批只到"官方声明了 X"，未自证）；⇒ ☆ `--include`＝检索词的**旗标式**（与位置式并存），历批只用过位置式；⇒ ☆ 卡片日期旗标 6 枚（含 `--daily-note-after/before`）与 `documents list` 同族同序。

### 十、☆ `--no-id` 双读数的第二发逐字（裸 `folders list`，与第 128 批在册值逐字相同）

```
Showing 1-2 of 2 folders with the following format: <folderId> Folder Name (document count)

* <folderId> <folderName> (3 docs)
  * <folderId> <folderName> (2 docs)
```
⇒ ★ 两次独立读数逐字相同＝G1271 由"本轮实测 × 历批在册"升为**本轮双读数**；⇒ ☆ 两枚 folder 名折占位（其一为中文短名，无法判定官方样例还是账户自建）。

### 十一、☆☆ 三枚"卡片名册"逐字（例子≠全集的两例＋真生效的一例）

```
Washi patterns:
  hex       Hexagon pattern
  dot       Dot pattern  
  stripe    Stripe pattern
  Custom patterns via --washi-pattern in blocks update
```
```
Theme types:
  page      Page themes (loaded from S3)
  fonts     Page font families (system, serif, rounded, mono)
  code      Code editor color themes (dracula, githubdark, etc.)
```
```
Lists table, gallery, and kanban view definitions.
```
⇒ ★★ 第一份只有 **3 档**而第 124 批真调用回的是更长的名册 ⇒ **卡片名册≠真名册**；⇒ ★ 第二份的 `fonts` 档**历批从未真调用**（登记为下批队列）；⇒ ☆ 第一份 `dot` 行尾**两个空格**（官方文案自带尾随空格）；⇒ ★ 第三份＝`collections views-list` 的视图类型自述**恰好三档**（table／gallery／kanban），与第 124 批真调用的回包口径一致。

## 五十、第 130 批逐字串（✓数据桥只读 2026-10-02 03:0x–03:3x 本地；★ 零写入 ⇒ `manifest.jsonl` 155 行不变；☆ 所有 id／时间戳／用户正文折占位，原文只留 `_harvest/b130-probes.txt`（gitignore 目录内））

### 一、★★★ 字体族真名册与别名行（`blocks explore-themes --type fonts`，首次真调用）

```
Available font families:

  system           - System sans-serif font (default) (aliases: sans-serif)
  system-serif     - System serif font (aliases: serif)
  system-rounded   - Rounded sans-serif font (aliases: rounded)
  system-mono      - Monospace font for code (aliases: mono)

Usage with blocks update:
  blocks update --id <blockId> --font system-serif
  blocks update --id <blockId> --font sans-serif    (alias for system)
  blocks update --id <blockId> --font mono          (alias for system-mono)
```
⇒ ★★★ 卡片（第 129 批）写的 `system, serif, rounded, mono` 里后三档**是别名不是规范名**；⇒ ☆ 三行 Usage 里官方**只示范了规范名与两枚别名**，没示范 `system-rounded`。

### 二、★★★★ 两动词的正则拒绝串逐字（同一枚探针、相反结果）

```
search --include QODER --regexp "(a)\1"            ⇒ Invalid regular expression pattern: (a)\1
search --include QODER --regexp "(?=QODER)"        ⇒ Invalid regular expression pattern: (?=QODER)
search --include QODER --regexp "(?P<n>QODER)"     ⇒ No matches found for the provided search criteria.
folders list --filter "(a)\1"                      ⇒ No folders matching "(a)\1".
folders list --filter "(?=How)"                    ⇒ Showing 1-1 of 1 folders with the following format: <folderId> Folder Name (document count)
folders list --filter "zzzzqqq"                    ⇒ No folders matching "zzzzqqq".
```
⇒ ★★★ `search` 侧＝反向引用拒、lookahead 拒、`(?P<name>)` 收＝**RE2**；`folders` 侧＝lookahead **收且命中**、`\1`（JS 合法）不报错＝**JS**；⇒ ☆ 两枚拒绝串都**原样回显输入的 pattern**；⇒ ☆ `(?=How)` 那发返回**两行**（父档命中、子档随树出现）＝复证 G1253"树形过滤保留祖先"。

### 三、★★★ `--fetch-blocks` 的半交付（逐字只多这一行）

```
Hydrated blocks: 1
```
⇒ ★★★★ 契约原文＝`Include full hydrated blocks in results`（`search --help` 的 Flags 段），实测只给计数行、**块正文一个字符都没进来**，其余各行与不带时逐字相同。

### 四、★★★ `search` 回包骨架（首次全量，id 与正文折占位）

```
Search results: 12 match(es)

1) Document <rootBlockId>
   Blocks: <blockId>
   Match:
     **<命中词>** <后续正文…>
   Created: 2023-04-18T22:45:56.000+08:00
   Modified: 2023-04-18T22:45:56.000+08:00
```
⇒ ☆ 逐字行名四枚＝`Document`／`Blocks`／`Match`／`Created`／`Modified`；⇒ ★★ `Blocks:` 实测最多一发射 **5 枚 id 逗号并列**；12 match 跨 **6 篇文档**；⇒ ★ 文档级两枚时间戳**免费给**（不带任何旗标），但不给作者名。

### 五、★★★★ header 自述与实际列不符（`documents list --location unsorted --metadata`）

```
3 document(s) — format: <rootBlockId> Title (createdAt, lastModifiedAt)

  <rootBlockId> <Title> (created: <ISO>, modified: <ISO>) → craftdocs://open?spaceId=<spaceId>&documentId=<documentId>
```
⇒ ★★★★ 头行的 `format:` 只列了三列，**每行实际有四段**（多出的 `→ craftdocs://…` 没被写进自述）；⇒ ☆ 这是第 128 批那条"header 自述＝最干净的形态判据"的**反面限定**；⇒ ☆ 顺带第五次复证"一篇文档两个 id"（两枚 id 逐字不同，真值只留 dump）。

### 六、★★★ `documents resolve-link` 两形两回包（逐字，id 折占位）

```
documents resolve-link "craftdocs://open?spaceId=<spaceId>&documentId=<documentId>"
⇒ Resolved link to rootBlockId <rootBlockId>
   Title: <文档标题>
   Raw URL documentId: <documentId>
   Next: blocks get <rootBlockId>

documents resolve-link "craftdocs://open?spaceId=<spaceId>&blockId=<rootBlockId>"
⇒ Resolved link to target block ID <rootBlockId>
   This link targets a block, not a document root.
   Next: blocks get <rootBlockId>
```
⇒ ★★★★ 第二形（`blockId=`）**卡片里根本没声明**（`Usage:` 与 Examples 只给 `documentId=` 与 web URL），实测被接受且回包**换成三行、少两行**（无 `Title:`、无 `Raw URL documentId:`），并幂等返回传入的那枚 id；⇒ ★ 官方 `--fetchMetadata` 生成的 `clickableLink` 正是这第二形 ⇒ **两个动词的产物互不闭合**；⇒ ☆ `Next: blocks get …` 是回包内"下一步命令"的第二种载体。

### 七、★★★ `--depth` 两发对照（同一目标，键集差异逐字）

```
blocks get <rootBlockId> --format json --depth 0
⇒ {"data":[{"id":"…","type":"page","textStyle":"page","styling":{"fontFamily":"system"},"markdown":"","contentPreviewMd":"<collection>\n  <title>…</title>\n  <properties></properties>\n  <content>\n\n  </content>\n</collection> …"}]}

blocks get <rootBlockId> --format json --depth 1
⇒ {"data":[{"id":"…","type":"page","textStyle":"page","styling":{"fontFamily":"system"},"markdown":"",
     "content":[
       {"id":"<collectionBlockId>","type":"collection","markdown":"<集合标题>","itemsPreviewMd":"<collectionItem>\n\n  <title></title>\n</collectionItem>\n …"},
       …共三枚 ]}]}
```
⇒ ★★★ `--depth 0`＝**`content` 键整个缺席**；`--depth 1`＝多出 `content` 数组 ⇒ 该旗标真生效（本批唯一一枚"两轴都过"）；
⇒ ★★ 新键 **`itemsPreviewMd`**（历批产物全文零命中）＝集合块独有；预览值是官方自造**伪 markdown 标签流**，实测标签五种＝`collection`／`title`／`properties`／`content`／`collectionItem`；
⇒ ☆ `markdown` 在 collection 块上装标题（与 page 同构）；⇒ ☆ 三条条目 `<title></title>` 全空＝与第 124 批"三个 untitled 项"对上；⇒ ☆ `collectionBlockId` ＝块 id（与 `collections list` 同一枚）。

### 八、☆ 位置式与旗标式逐字相同

```
search youtube                ⇒ Search results: 2 match(es) ＋两条完整记录
search --include youtube      ⇒ 与上一发**逐字相同**
```
⇒ ★★ 第一次实测咬合＝检索词的位置式与 `--include` 式等价（历批只用位置式，卡片只用 `--include`）。

## 五十一、第 131 批逐字清单（✓数据桥只读 2026-10-02 04:0x–04:3x 本地；★ 零写入 ⇒ `manifest.jsonl` 155 行不变；☆ 所有 id／用户正文折占位，原文只留 `_harvest/b131-probes.txt`（gitignore 目录内））

### 一、★★★ 大小写三发对照（同一作用域，唯一变量＝pattern 的大小写与 flag）

```
search --include Craft                     ⇒ Search results: 12 match(es)     ← 历批基线复跑＝同枚数，无漂移
search --include Craft --regexp "Craft"    ⇒ No matches found for the provided search criteria.
search --include Craft --regexp "craft"    ⇒ Search results: 10 match(es)
search --include Craft --regexp "(?i)Craft"⇒ Search results: 10 match(es)     ← 与上一发逐字同集
search --include Craft --regexp "."        ⇒ Search results: 9 match(es)      ← 历批读数复跑＝同枚数
```
⇒ ★☆ 关键咬合＝`(?i)Craft` 的加粗打在**原文的大写处**（`**Craft** Handbook`、`Welcome to **Craft**`），而裸 `Craft` 却是 0 条 ⇒ **匹配面＝折叠过大小写的文本；显示面＝原文**＝两侧不同源（G1292）；
⇒ ☆ 三条拒绝／空包逐字＝`No matches found for the provided search criteria.`（本批出现**三次**、逐字相同：裸 `Craft`、`zzzzqqq`＋`handbook`、`youtube`＋`handbook`）／`Invalid cursor format`／`--location and --folder cannot be used together. Choose one filtering mode.`；

### 二、★★★★ 分层 AND 的正反两发

```
search --include youtube --regexp "video"  ⇒ 5 match；第 1 条 Blocks:<标题块id>  Match: Watch: how to **video**s
search --include zzzzqqq --regexp "handbook"⇒ No matches found …
search --include youtube --regexp "handbook"⇒ No matches found …
```
⇒ ★★★ 第 1 条那个块**整块没有 `youtube`**＝include 与 regexp 不同层＝include 筛文档、regexp 挑块（G1293）；
⇒ ★☆ 同一条回包里还见到**双加粗**＝第 2 条 `**video**s` 与 `**youtube**` 同时加粗，而第 5 条里的 `youtube` 是白字＝加粗规则未定（G1294／仍未采到①）；
⇒ ☆ `--include` 两枚求交＝`search --include craft --include youtube` → **1 match**（卡片 `repeatable` 兑现，文档级求交）。

### 三、★★★ 未声明旗标与半交付（同一发里两件事）

```
search --include youtube --fetch-blocks --format json
⇒ Search results: 2 match(es)
   …（纯文本条目，非 JSON）… 每条末尾：   Hydrated blocks: 1
```
⇒ ★★★ `search --help` 的 Flags 段**没有 `--format`**（13 枚全列，逐枚见下节）⇒ 打上去不报错、回包仍纯文本＝**未声明旗标被静默容忍的第二例**（G1296；第一例＝`documents list --limit`）；
⇒ ☆ `--fetch-blocks` 在这种"伪装 json 请求"下仍只给计数 ⇒ 半交付升为该动词通性（G1297）；

### 四、★★ `search` 卡片逐枚（本轮普查＝usage 行与 Flags 段**同数**）

⇒ Flags 段 13 枚＝`--include`／`--regexp`／`--document`／`--location`／`--folder`／`--created-after`／`--created-before`／`--modified-after`／`--modified-before`／`--daily-note-after`／`--daily-note-before`／`--cursor`／`--fetch-blocks`；usage 行也是这 13 枚（分两行排）＝**与第 128 批 `documents list`（usage 4 枚 < Flags 10 枚）构成两种类别并存**（G1295）；
⇒ ☆ 卡片逐字两处新口径＝`--include <term>  Match raw text term (AND semantics; repeatable)`／`--regexp <pattern>  Match RE2 regex pattern (AND semantics; repeatable)`＝**"AND semantics"没说是哪一层**（本批实测＝文档级 ⇒ G1293 是"契约不足、需实测"的又一例）；
⇒ ☆ 卡片互斥段两条＝`--location and --folder cannot be combined`／`--document cannot be combined with --location/--folder`；⇒ ★ **运行时文案与卡片文案不同**＝实测回的是 `… cannot be used together. Choose one filtering mode.`（多一句"Choose one filtering mode."、动词换成 `used`）＝**同一动词内**卡片 vs 运行时两份文案（历批只记过"两动词两份文案"）；
⇒ ☆ 卡片尾部还有一行 `Tip: Use search --help for this usage reference.`＝**自指型提示行**（第六种回包内提示载体候选）。

### 五、★★★★ `blocks get` 吃非 root 块 id ＋ 第三个簇键 `items`（id 折占位）

```
collections list
⇒ Found 3 collections:
     合集 <合集块id-A> - 3 items (in document <文档rootBlockId-C>)
     合集 <合集块id-B> - 3 items (in document <文档rootBlockId-C>)
     合集 <合集块id-C> - 3 items (in document <文档rootBlockId-C>)

blocks get <合集块id-A> --format json --depth 1
⇒ {"data":[{"id":"<合集块id-A>","type":"collection","markdown":"<合集名>",
     "items":[
       {"id":"<条目id-1>","type":"collectionItem","title":"","properties":{},"markdown":""},
       {"id":"<条目id-2>","type":"collectionItem","title":"","properties":{},"markdown":""},
       {"id":"<条目id-3>","type":"collectionItem","title":"","properties":{},"markdown":""}]}]}
```
⇒ ★★★ `"items"` 这一枚键在**全部产物里逐字零命中**＝本批确证为新键（对照＝第 130 批 `itemsPreviewMd` 也是零命中才敢写"新键"）；
⇒ ☆ 三面合集**全在同一篇文档**，而那篇文档不在本轮任何 `search` 读数里＝"合集存在"与"搜索可达"是两件事；
⇒ ☆ 空合集的条目是**四键齐全、值为空**（`title:""／properties:{}`）＝与 `--depth 0` 时 `content` 整键缺席是两种形态。

### 六、★★★ callout 的第二档样式（`blocks get <rootBlockId-W> --format json --depth 1`，18 块）

```
{"id":"…","type":"text","textStyle":"caption","textAlignment":"center",
 "decorations":["callout"],"color":"#00ca85",
 "markdown":"<callout><caption>…</caption></callout>"}
{"id":"…","type":"text","taskInfo":{"state":"todo"},"listStyle":"task","markdown":"- [ ] …"}   ← 四枚同形
{"id":"…","type":"text","markdown":""}                                                          ← 键在、值空
```
⇒ ☆ 历批在册的 callout 实读是 `textStyle:"h4"＋decorations:["quote","callout"]`（第 127 批）＝本批是**第二档样式**（`caption`＋居中＋单装饰 `callout`＋同一枚 `#00ca85`）⇒ 复证＋新增一档，不新编号；
⇒ ☆ 四枚任务块三件套形状逐字相同；一枚 `markdown:""` 空块与"键缺席"分开登记。

### 七、★★ resolve-link 的 host 段不校验（本轮 web 形补测）

```
documents resolve-link "https://www.craft.do/editor/d/<spaceId>/<documentId-W>"
⇒ Resolved link to rootBlockId <rootBlockId-W>
   Title: Welcome to Craft
   Raw URL documentId: <documentId-W>
   Next: blocks get <rootBlockId-W>
```
⇒ ★★ 与历批在册形状（`https://docs.craft.do/editor/d/…`，G1261）**换了 host 仍然成功、四行逐字同形**＝scheme＋host 整体不被校验、只有尾段 documentId 参与解析；
⇒ ☆ `documents list --location unsorted --metadata` 复跑＝3 行（每行四段：rootBlockId／Title／两枚时间／`→ craftdocs://…documentId=`）＝历批"header 自述三列而实际四列"的 G1271 反面限定**第二次复现**；
⇒ ☆ 一条对照＝同一批里 `blocks get <documentId>` 会回 `Block not found`（第 113 批在册）＝所以 id 分层完整表述＝**rootBlockId ⊂ blockId，documentId 是另一套**。
