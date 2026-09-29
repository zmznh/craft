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
