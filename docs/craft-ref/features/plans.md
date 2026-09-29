# 套餐门禁与配额（`subscription.*` 331 条 + `teamsettings.*` 190 条）

证据来源：`_harvest/subscription-zh.txt`（331 行全量）、`_harvest/teamsettings-zh.txt`、`SubscriptionsPanel-Dp0f_AWs.js`、`ImagineView` 的 `invite.*`。
标注：`✓` = 代码或结构化文案直接证明；`~` = 仅由营销/说明文案直述。

这一轴此前被整体推给"动态批次"（`todo-actions.md` 里的 `[0]` 类远端上限），**本批从文案里静态解出多数具体数值**，因此原判定部分作废。

## 一、档位与支付通道 ✓

| 档位 | 键名证据 | 说明 |
|---|---|---|
| **Free** | `free.plan.desc`「别担心——你仍然可以在免费套餐中创建和编辑！」、`free.version.dec` | 降级后**仍可创建与编辑**，不是只读锁死 |
| **Plus**（个人 / 家庭 / 团队） | `plus.plan` / `plus.trial` / `plus.benefits.for.all.members`「所有成员均可享受 Plus 权益」 | 权益**按成员下发**，不是按空间 |
| **Business** | `business.customdomain.desc`、`business.upgraded.to.plus`「作为 Business 订阅的一部分，你的帐户已升级为 Plus」 | Business ⊃ Plus（自动继承） |
| 键名前缀遗留 | `pro.aiassistant.desc` / `pro.block.limit.reached` 等 8 处仍是 `pro.*`，但正文一律说 Plus | ⇒ **Pro 是 Plus 的旧名**，读键时不能当成第四档 |
| 支付通道 | `start.stripe.trial`「开始 [0] 天免费试用」 vs `start.pro.team.trial.desc`「你似乎拥有一个 **Apple** 的 Plus 个人订阅。要邀请其他人并开始协作，请更新你的付款信息。」 | **Stripe 与 Apple 订阅两条独立通道**，Apple 通道不能直接邀请协作者，必须先换付款信息 |
| 结账 | `checkout.copy.link` / `checkout.ready` / `checkout.ready.description`「结账页面已在你的浏览器中打开。如果没有看到，请复制链接并在浏览器中打开。」 | 购买走**外部浏览器**，应用内只给链接（与 `craft://credit` → `assistant-topup` 同一模式） |
| 恢复购买 | `button.restore` | Apple 通道的 IAP 恢复入口 |

## 二、配额硬数值（此前以为必须动态采集）

| 维度 | 数值 | 证据 | 置信 |
|---|---|---|---|
| 免费档**每空间区块总数** | 有上限，超限即拦；Plus = **每空间无限区块** | `pro.block.limit.reached.desc`「你的空间已达到区块上限。升级到 Plus，解锁每个空间的无限区块。」；`starter.desc.block.limit.enabled`「创建任意数量的文档，最多可创建 [0] 个区块。」；用量条 `block.limit.used`「已使用此套餐中可用的 **[1]** 个区块中的 **[0]** 个」 | ✓（上限**数值**仍是 `[0]` 远端下发） |
| 文档数 | **个人档不限文档**，限的是区块；**入门团队每空间最多 10 个文档** | `one.full.featured.account.desc`「获取无限内容和存储空间」；`over.limit.desc`「入门团队是免费的，但每个空间最多只能容纳 10 个文档。」 | ✓ |
| 试用时长 | **14 天 Plus 试用**；结束自动转 Free 并**保留已有文档**，此后**每周免费创建 2 篇** | `start.14.days.trial`、`free.trial.started`「14 天[0]免费试用已开始」、`end.of.your.trial`「除非你选择升级，否则我们会自动将你转至免费套餐」、`2.docs.per.week.keep.existing.docs` | ✓ |
| 空间数 | 个人订阅 = **1 个空间**；团队/Business = **25 个空间** | `limited.to.one`「[0] 订阅限制为 1 个空间」、`limited.x`「[0] 订阅限制为 [1] 个空间」、`paywall.more.space.desc(.1)`「团队和 Business 订阅限制为 25 个空间」 | ✓ |
| 成员数 | 家庭 **≤5**、团队 **≤25** | `invite.family.strong`「邀请最多 **5 位家庭成员**」、`invite.team.strong`「邀请最多 **25 名团队成员**」 | ✓ |
| 备份保留 | 两档 **30 天 / 180 天** | `paywall.backups.desc.1`「升级即可获得 30 天或 180 天的备份」、`desc.4`「目前显示 [0] 天」 | ✓ |
| 上传体积 | 免费档**限制文件个数与大小**（数值远端）；超限给**预填邮件文案** | `paywall.big.file.free`「免费套餐限制上传 [0] 个文件」、`big.file.contact.us`「你无法上传大于 [0] 的文件…请与我们联系！」、`big.file.contact.us.message`「你好，作为团队订阅者，我希望增加我的上传大小限制！」 | ✓（数值 `[0]`） |
| AI 额度 | Plus = **2 倍请求额度** + **GPT-4o**；免费档用较低模型 | `ai.upgrade.desc`「获得 2 倍 AI 助手请求额度，并可使用改进的 GPT-4o。」、`pro.aiassistant.desc`「使用 Plus 可在助手中解锁更高级的模型。」 | ✓ ⇒ 解释了 `assistant.md` §六/§七 的两轴与档位绑定 |

⇒ **门禁的主计量单位是"区块"而不是"文档"** —— 这对内容模型是结构性事实：本地若按"文档数"限额就限错了对象。
⇒ 三处 `[0]` 数值确实只能由服务端下发（区块上限、文件大小、文件个数），动态批次只剩这三项。

## 三、按档解锁的功能（付费墙清单）✓

`advanced.options.control.desc`「使用 Plus 订阅控制高级共享选项」、`author.control.desc`「通过 Plus 订阅控制作者」、`card.styles.control.desc`「通过 Plus 订阅访问所有卡片样式」、`backups.desc`、`business.customdomain.desc`「使用自定义域名和路径共享 Craft 文档」、`advanced.publishing.desc`「获取自定义域名和品牌以及**高级分析**的权限」、`advanced.ai.models`、`additional.card.styles`。
⇒ **卡片样式全集、作者控制、高级共享选项、自定义域名、高级分析、备份**六项是 Plus/Business 专属 —— 复刻时若把它们放在免费路径上，就与官方权限模型不一致（属产品决策，需显式记录，不宜默默偏离）。

## 四、取消挽留流程（churn，15 条成轴）✓

结构是**三段式**，不是单一确认框：

1. 标题 `churn.before.you.go`「在你离开之前…」+ 说明 `churn.desc`（征求原因）。
2. **5 个原因单选**（封闭集）：`change.plan`「我想更改我的订阅套餐。」/ `expensive`「相比我获得的价值，价格偏高。」/ `missing.feature`「缺少我需要的关键功能。」/ `issues`「我遇到了技术问题。」/ `alternative`「我找到了更适合我需求的替代方案。」/ `service`「我不再需要这类服务。」—— 实为 **6 项**。
3. 兜底双出口：`custom.title`「让我们一起聊聊最适合你的方案」+ `custom.desc`「预约一次简短的通话，解锁专属优惠、升级方案和为你量身定制的灵活选择」；以及硬退出 `cancel.anyway`「仍然取消」。
4. 优惠码子系统：`redeem.offer`「兑换优惠」/ `failed.to.redeem.offer`「兑换优惠失败，请重试。」/ `thank.you`「谢谢你呀！」；`charging.remaining`「扣费 [0]，剩余余额：[1]」⇒ **优惠额度是可部分消费的余额**，不是一次性折扣。

⇒ 这套"取消 → 原因 → 挽留 offer → 仍可取消"的状态机本地完全没有；`cancel.at.any.time.before.renewal.date` 还规定**必须在续订日前至少 1 天**取消。

## 五、团队设置（`teamsettings.*` 190 条）轴概览

按子前缀分桶（详表待逐条转写，见"仍未覆盖"）：成员与席位、邀请（含 `invite.error.addseat.trial.expired`「添加试用席位的期限已过。」⇒ **试用席位有单独到期规则**）、角色与权限、空间共享、账单归属。
`subscription.plus.benefits.for.all.members` 与 `business.upgraded.to.plus` ⇒ 团队权益是**成员级展开**的（每个成员各自拿到 Plus 额度），这决定了 AI 额度显示为什么需要 `availableAiCreditsForTeam`（团队名插值，`assistant.md` §六）。

## 五之二、`subscription.*` 331 条逐条重读的**增量**（2026-09-27 第 20 批；§一–§四 已覆盖的不重复）

### A. 免费档配额：一套**随时间增长**的机制，且官方并存两版模型

| 键 | 文案 | 含义 |
|---|---|---|
| `starter.desc` | 免费创建最多 **10 个文档**。**此后每周获得 2 个额外的免费文档。** | ⇒ 免费额度不是常数，是 `10 + 2×周数` 的**时间增长函数** |
| `starter.desc.block.limit.enabled` | 创建**任意数量的文档**，最多可创建 **[0] 个区块**。 | ⇒ **第二版模型：不限文档数、改限区块数**（`[0]` 远端参数）。两版**同时在线** ⇒ 官方在迁移配额模型（文档数 → 区块数），本地必须两版都实现并能切换 |
| `unlimited.docs.desc` | 免费用户可以创建有限数量的文档。要创建无限文档，请升级到 Craft Plus。 | 付费墙话术 |
| `unlimited.storage.for.days` | **14 天**无限存储。无需信用卡。 | 试用附带存储无限 + **无需信用卡** |

⇒ `subscription.unlimited.*` 一族给出**无限系列的五个维度**：`content` 内容 · `content.and.storage` · `docs` 文档 · `media.upload` 媒体上传 · `storage` 存储；另 `everything`「无限一切」+ desc「在你的空间中获取无限存储空间，并且**文件上传不受大小限制**」⇒ **"无限一切"同时覆盖存储与单文件大小两维**。

### B. 价格后缀矩阵：**计价单位按档不同**（6 个键，此前完全未记）

```
per.month.plus   = /月（一人）          per.year.plus   = /年（单人）
per.month.family = /月（整个团体）       per.year.family = /年（整组总计）
per.month.team   = /月（整个团队总计）    per.year.team   = /年（整个团队总计）
```
⇒ **Plus 按人计价、Family/Team 按团体总计计价**，且中文话术三样（「一人」/「整个团体」/「整个团队总计」）。⇒ 本地若统一显示"/月"就丢了**计费主体**这一维；再叠加 §六之二 的 `plan.per.seat.{monthly,yearly}` 与 `plan.weekly`，官方价格展示维度是 **{weekly, monthly, yearly} × {单人, 每席位, 团体总计}**。
`tier.{free, individual, teams}` ⇒ 套餐页的**三大分区**是 Free / 个人 / 团队，个人含 Plus，团队含 Family/Team/Business。

### C. ★ `upgrade.team.v2.*`：一整套**团队升级流程**（v2 ⇒ 官方重做过一次，此前 0 记录）

**步骤**：团队命名（`change.team.name.placeholder`「为你的团队添加名称」+ `change.team.name.later`「你可以稍后在设置中更改此设置」⇒ **可跳过**）→ 购买（走 **AppStore**：`appstore.next` / `appstore.purchase.success`「订阅成功」）→ 就绪（`business.is.set`「你的 Business 已准备就绪！」）→ 邀请成员。
**失败态（各自独立）**：`failed.subscription.creation`「无法创建订阅。请重试。」· `failed.to.invite`「无法邀请团队成员」· **`failed.appstore.subscription.and.team.creation.error`「无法创建团队并订阅 AppStore 产品」** ⇒ 最后这条是**一个事务同时做两件事（建团队 + 订阅），失败时合并报告**（不是两个独立失败），是本地最容易拆错的一处。
**两类"不可升级"，救济路径不同**：
- `not.available.for.this.type.of.teams.contact`「目前，此类团队无法升级。请联系我们的客户支持…」⇒ 走人工。
- `not.available.for.this.type.of.teams.remove`「订阅升级不适用于团队。**升级前请移除团队成员和待处理的邀请。**」⇒ **个人订阅升团队订阅要先清空成员与待处理邀请**（前置条件，不是错误）。
**席位**：**`no.more.seats`「你的订阅已添加 [0] 个成员。升级以添加更多。」** ⇒ 席位上限由当前订阅决定，加满即挡（与 `teamsettings.invite.error.out.of.seats` 互证 ✓，两处独立键）。
**其它**：`upgrade.incomplete`「升级未完成」⇒ **存在半完成态**（可恢复/需重试，机制未证）；`appstore.error`「出了点问题，请重试。」；`upgrade.additional.requests`「升级即可解锁助手中的**额外请求**」⇒ **AI 请求数按套餐分级**（与 `assistant.aiCreditsAvailable` 互证）；`upgrade.contact.support`「联系我们的支持团队来升级你的帐户」⇒ 某些升级只能人工。

### D. 付费墙新增条目（补 §三）

`paywall.markdown.import`「Markdown 导入」+ `.desc`「**批量** Markdown 导入仅适用于 Plus 用户」⇒ 批量导入是付费功能（单文件导入不是）。
`paywall.textbundle.export`「TextBundle 导出仅适用于 Plus 用户」+ `paywall.pdf.export`「升级到 Craft Plus 以启用 PDF、Markdown 等的高级导出设置」⇒ **导出侧两处墙**，与 V28 采到的"所有文档 ⋯ 只有 Markdown 与 TextBundle 两种导出"对得上：**TextBundle 那一档就是付费墙位**。
`paywall.custom.domain.desc`「自定义域名和路径仅适用于 Plus 套餐」。
`paywall.big.file.*` 四键：`哦不！文件太大了！` + `你无法上传大于 [0] 的文件。如果你希望增加上传限制，**请与我们联系**！` + **预填邮件模板** `你好，作为团队订阅者，我希望增加我的上传大小限制！你能帮我吗？` ⇒ **上传限额可申请提额，且官方备好邮件正文**。
`paywall.file.limit`「你无法上传大于 [0] 的文件」+ `big.file.free`「免费套餐限制上传 [0] 个文件」+ `big.file.tier`「[0] 套餐仅限上传 [1] 个文件」⇒ **文件数与文件大小是两条独立限制**，且后者按套餐参数化（两键：free 版与 tier 版）。
`paywall.backups.desc.{1,2,3,4}`：「升级即可获得 **30 天或 180 天**的备份」/「180 天的备份」/「升级可获得 180 天」/「**目前显示 [0] 天**」⇒ 备份保留期按档 30/180 天，且第 4 条是**当前状态回显**（不是墙话术）。
`paywall.more.space.desc`「[0] 团队最多可创建 **25 个空间**。请联系销售人员为你的团队获取更多空间」+ `.desc.1`「**团队和 Business** 订阅限制为 25 个空间。联系客服获取更多空间」⇒ **空间数上限 25**（两版话术，`.1` 明确了适用档）。

### E. churn 补充（§四 之外的两条）

`churn.change.plan`「我想更改我的订阅套餐」是**取消原因之一** ⇒ 取消流程内嵌"改道到改套餐"；`churn.custom.{title,desc}`「让我们一起聊聊最适合你的方案 / **预约一次简短的通话**，解锁专属优惠、升级方案和为你量身定制的灵活选择」⇒ 取消流程可转人工通话；`churn.{redeem.offer, failed.to.redeem.offer}` ⇒ **挽留时发优惠码并要兑换**（有失败态）；`churn.cancel.anyway`「仍然取消」是最终出口按钮。

## 五之三、第 37 批增量：结账状态机 / 倒计时粒度 / 折扣文案族 / 空间创建门禁（2026-09-27 10:02，`subscription.*` 逐条重读的**真残留**）

⇒ 先记一条**采集纪律教训**：本批是覆盖率仪器把 `subscription` 报成"256/331 未覆盖（23%）"后开批的，实际重读发现 **§一–§五之二 早已成文覆盖其核心**（10 文档/空间、每周 +2、25 空间、家庭 5 / 团队 25、14 天试用与到期降 Free、区块上限按空间、计价单位矩阵、`upgrade.team.v2.*`、churn 六因与优惠码子系统、席位不变量）⇒ **仪器报的大数是"键名没逐条列"而不是"事实没采到"**。本节只写**真正新增的五块**。

**A. 结账是"跳出到系统浏览器"的三段状态机**（`checkout.*` + `processing.*`，9 条，此前 0 记录）

| 态 | 文案 | 增量语义 |
|---|---|---|
| 就绪 | `checkout.ready`「结账准备就绪！」+ `.ready.description`「结账页面已在你的浏览器中打开。**如果没有看到，请复制链接并在浏览器中打开**」 | ★ 官方支付页在**外部浏览器**，且 UI 自带**降级路径 = 复制结账链接**（`checkout.copy.link`）⇒ Web 端不做内嵌支付 |
| 处理中 | `processing.checkout`「正在处理你的结账…」+ `.description`「我们正在确认你的付款，请稍候」 | |
| 已取消 | `processing.canceled`「结账已取消」+ `.description`（同句重复一遍） | ★ **取消是一等终态**，不是错误 |
| 失败 | `processing.error`「无法确认付款」+ `.description`「请联系 Craft 支持团队。」 | ★ **失败只给"找人工"，不重试、不自动退款文案** |
| 等待确认 | `wait.for.sub.confirmation`「马上就好！请等待你的订阅确认。」 | 与 `processing.checkout` 并存 ⇒ **处理中与"等订阅生效"是两个态** |

⇒ 复刻要点：**五态里有两个"良性态"（已取消 / 等待确认）**，本地若把非成功都归 error 就会与官方语义不同。

**B. 配额恢复倒计时有「天 / 小时」两档粒度，且句式是**拼接**的**

`wait.to.get.more.or.upgrade`「等待 [0] 获取更多次数，或升级到 Plus 获取无限使用权限」＋ `x.days.left`「还剩 [0] 天」＋ `x.hours.left`「还剩 [0] 小时」＋ **`x.left.until`「后即可创建新文档。」**
⇒ ★ 末段是一个**没有主语、以「后」开头**的续句 ⇒ 官方把「等待 [0]」与「[0] 天/小时后」跨键拼成一句话 ⇒ **本地按 key 生成整句会拼不出通顺中文**（要么改成带插值的单键，要么复刻同样的拼接）。同时 ⇒ **倒计时粒度按时长自适应（>1 天用天、不足用小时）**，与 §二 的"每周 +2 文档"是同一个机制的两端。

**C. 折扣文案有两代（tooltip 三条 → tooltipv2 一条），且"折扣只适用第一个计费期"**

```
discount.perc.x                = [0]% 折扣            discount.apply.perc.x(+ .lowercase)   = 应用 [0]% 折扣
discount.applied.perc.x        = 已应用 [0] 折扣（优惠 [1]%）   ← ★ 两个插值：文案 + 百分比
discount.applied.perc.x.short  = 已应用 [0]% 折扣
discount.save.perc.x.lowercase = 节省 [0]              ← ★ 不带 %，插值里自带符号
discount.applied.for.first.billing.period = 折扣适用于第一个计费期。   ← ★ 折扣作用域
tooltip.line1/2/3 = 限时优惠，可享受 [0]% 的折扣 / 如果你现在购买，明年也可锁定此折扣 / 优惠券代码：[0]
tooltipv2.line1   = 终身享受 [0]% 折扣 – 限时优惠！
```
⇒ ★ **v1 明说"明年也锁定"（= 续费期有效）、v2 说"终身" ⇒ 两代承诺不同**，v2 疑为"首计费期"话术的升级替代；而 `applied.for.first.billing.period` 与两代都并存 ⇒ **官方同时存在三种折扣口径**（首计费期 / 续费锁定 / 终身）。
⇒ **`.lowercase` / `.short` 后缀再次出现**（与 `monthly.capitalized`、`yearly.uppercase` 同族）⇒ **同一概念按句内位置有不同大小写/长短形态的键**，这是官方 i18n 的通用约定，本地只做一个键会在英文下出错。

**D. 价格显示含 VAT 两态 + 一个"重算"动作**

`price.billed.with.vat`「含增值税，按[0]计费」/ `.without.vat`「不含增值税，按[0]计费」（★ **`按[0]` 之间无空格、`按 [0]` 有空格，两键只差一个空格 ⇒ 官方自己也有排版不一致**）/ `price.vat`「[0] + 增值税」/ `price.total`「合计」/ **`price.continue.to.recalculate`「继续重新计算」**
⇒ ★ 存在一个**"税率未知 ⇒ 提示用户继续以重算价格"**的流程，说明含税价依赖**位置/账单地址**，本地静态价签会缺这一环。

**E. 空间创建的门禁与不变量**（`create.new.space.*` 19 条，此前 0 记录）

- **三选一的空间类型**：`private.space`「私人空间」/ `invite.to.family`「邀请加入家庭」/ `invite.to.team`「邀请加入团队」⇒ ★ **家庭与团队是空间层面的两个分支**，不是账户属性。
- **私人空间要升级**：`upgrade.to.make.space.private`「升级以使空间私有」+ `.description`「私人空间只能通过邀请查看或加入」⇒ **"邀请制可见"是付费功能**（此前只知空间数受限）。
- ★ **硬不变量：成员必须先在团队里**——`.invite.team.member.desc.as.admin`「只能将现有团队成员添加到空间。要添加新人，**你**必须先邀请他们加入团队」/ `.as.member`「…要添加新人，**管理员**必须先邀请他们加入团队」⇒ **同一条规则按角色给两种人称的文案**（权限守卫文案要分 admin/member 两版）。
- `error.no.team.selected`「未选择团队」是**建空间的前置校验**；`.space.description.for.private.plus`「创建一个单独整理的空间」是**免费档的私人空间描述**（与上面付费墙并存 ⇒ 私人空间本身可建，**"只能邀请进入"这一档才收费**）。
- `invite.pending`「待处理」⇒ 空间成员列表里有 **pending 态**（与 `collab.md` §六之二"邀请≠授权"呼应）。

## 六、仍未覆盖的部分


1. `teamsettings.*` 190 条尚未逐条转写为权限矩阵（下一步）。
2. 区块上限、单文件上限、文件个数上限三处 `[0]` 的确切数值 —— 服务端下发，只能动态或向官方问询。
3. 免费档与 Plus 在**具体动作**上的禁用差异（文案只说"需要升级"，没说按钮变灰还是弹付费墙）—— 需动态，且属禁区外的只读观察。
4. ~~家庭组（5 人）与团队（25 人）是否为同一实体族的不同档位，键名不足以证明。~~ **部分结案（§五之三 E）**：`create.new.space.*` 里 **私人 / 邀请加入家庭 / 邀请加入团队 是建空间时的三个并列分支** ⇒ 二者是**同一"空间类型"实体的两档**，不是账户属性。**仍未证**：家庭组是否也走 `invite.error.addseat.*` 那套席位不变量（该族文案只在团队语境出现）。
5. **§五之三 新掉的未采到**：`discount.tooltip.line1-3`（v1）与 `tooltipv2.line1`（v2）**同时存在于语言包**⇒ 无法从文案判断线上用哪一代，需实屏看一次付费墙折扣气泡；`price.continue.to.recalculate` 的触发条件（首次进入未取到地区？税率为空？）；`processing.*` 五态之间的**跳转与超时**（契约只给文案，不给时序）。
