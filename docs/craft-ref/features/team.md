# 团队·订阅·域名治理（`teamsettings.*` 190 + `team.*` 75）

证据：`_harvest/tail-team.txt`（265 行全量，脚本按 `team.` / `teamsettings.` 分桶）。
标注：`✓` = 有第二处证据互证或代码/结构直接证明；`~` = 文案直述。

## 一、i18n 插值有两套语法，且官方正在迁移 ✓（本文件最重要的一条架构事实）

| 旧式（命名插值） | 新式（位置插值） | 证据 |
|---|---|---|
| `alert.space.admin.added`「你现在是 **{{spaceName}}** 的管理员」 | — | mustache 双花括号 |
| `alert.space.joined`「你现在是 {{spaceName}} 的成员」 | `alert.space.joined.**new**`「你现在是 **[0]** 的成员」 | **同一句的新旧两版并存** |
| `craft.domain`「**{{craft}}** 域名」 | `craft.domain.**new**`「**[0]** 域名」 | 同上 |
| `invite.error.could.not.invite.email`「无法邀请 **{{email}}**」（无空格） | 位置式同族 `…users`「无法邀请{{count}}位用户」 | 命名式还带**参数旁缺空格**的排版问题 |

⇒ 规律：**键名带 `.new` 或 `.partN` 的是迁移后的版本，裸键与 `{{}}` 式是遗留**。复刻取值时应优先用 `.new` 变体。
⇒ 这与 `assistant.md` §八 的 `{0}`（内容插槽）/ `[0]`（人可见插值）合起来构成三套占位符体系：`{{name}}` 命名插值（旧）、`[0]` 位置插值（新）、`{0}` 提示模板插槽（AI 专用）。**混用会直接把模型输入或参数名显示给用户。**

## 二、长句被拆成分段片段序列 ✓（另一条架构事实）

`cancel.subscription.part1 / part2 / part3`、`delete.team.part1`、`custom.craft.domain.confirm.delete.and.update.text1 / text2.part1 / text2.part2 / text3`（**part 里再套 part**）。
⇒ 官方的确认长文不是单条字符串，而是**可插入组件（链接、粗体、变量）的片段序列**，因为 `text2.part1`「如果你的团队在当前域下发布了活动文档（」与 `part2`「）。如果你更改团队的 Craft 域…」必须把动态域名夹在中间。
⇒ 本地若用一整条 i18n 串就无法表达"句中插组件"，这是 i18next 的 `<Trans>` 用法特征（与 `feature-catalog` 里发现的 `<highlight>` / `<username>` 内联标记同源 ✓）。

## 三、订阅的三态生命周期 ✓（补 `plans.md` §一 的空缺）

| 态 | 事实 |
|---|---|
| 生效中 | `billing.no.active.subscription`「没有有效订阅」是反向判定；`billing.not.renewed.subscription`「未续订」 |
| **已取消但未到期** | `cancel.subscription.part1`「你和其他团队成员可以继续使用 Craft，直到」+ `part2`「当前计费周期结束」+ `part3`「之后，你将**无法向文档中添加新内容**」⇒ **到期后是"停止新增"而不是锁死或删除**（已有内容仍可读） |
| 可恢复 | `resume.*` 7 条 + `alert.subscription.{resumed,resume.failed}` ⇒ 取消与恢复是一对可逆动作；`alert.subscription.{canceled,cancel.failed}` |
| **跨渠道拒绝** | `cancel.appstore.on.web`「你的订阅由 App Store 管理。请在那里取消订阅。」⇒ Web 端能识别订阅来源并**拒答**，引导去原渠道（与 `plans.md` §一 的 Stripe/Apple 双通道互证 ✓） |
| 折扣 | `billing.recurring.coupon.{flat,percentage}`「已应用 `<code>[0]</code>` [1] 循环折扣」+ `recurring.modifiers.flat` ⇒ 账单支持**循环折扣**（flat 与百分比两种），且文案内嵌 `<code>` 标签 |
| 账单表 | `billing.table.{date,status,paid,unpaid,invoice.total,view.invoice}` + `invoice.*` ⇒ 有**发票列表**（日期/状态/已付/未付/合计/查看） |
| 账单邮箱 | `billing.billingemail.{header,part1,cta,part3}`「请联系我们 [联系支持] 如果你想更改帐单电子邮件。**我们会在 24 小时内为你完成**。」+ `change.email`「请求更改团队 [0] 的账单电子邮件」⇒ **账单邮箱不能自助改，走人工工单**，且有 SLA 时限 |

## 四、删除团队有前置依赖 ✓

`delete.team.tooltip`「你的团队的**订阅需要先取消**才能继续。」⇒ 删除按钮在仍有订阅时是被门禁的（tooltip 说明原因，与 `publishing.md` §二 的"不可用控件显示原因"同一模式 ✓）。
`delete.team.description`「删除你的团队将**永久删除所有团队空间中的所有文档**。此操作无法撤消！」+ `part1`「删除此团队将导致所有团队成员失去访问权限」+ 成功句 `delete.team.success`「团队 [0] 已删除」+ 失败句 `team.delete.failed`。
⇒ 删除团队同时命中"文档全毁"与"成员失去访问"两个后果，所以文案把两条都写出来。

## 五、域名治理：两套域 + DNS 验证状态机 ✓

**Craft 子域**（团队级）：`craft.domain.desc`「共享 Craft 文档时使用你的自定义 Craft 域名」；输入即时查可用 `type.to.see.availability`「输入以查看是否可用」→ 三态 `already.used` 已使用 / `available` 可用 / `not.available` 不可用；`change.domain` 更改域名。
**更改域的破坏性警告**（分段拼接，见 §二）：`confirm.delete.and.update.text1`「此更改将影响已发布的文档。」+ `text2.part1/2`（把当前活跃域夹在括号里）「…则**包含此地址的所有现有链接都将停止工作**。」+ `text3`「你确定要更改你的域名吗？」
⇒ 换域＝**外链全部失效**，官方选择在确认框里把这个后果说穿（R21 的又一处实例 ✓）。

**外部域**：`custom.domain.part1`「**你应该拥有这个域名。这应该是一个子域。**」+ `part2`「详细了解支持的域。」+ `yourdomain.placeholder`；
配置表 `external.domain.{dns.record, name.host, value.points.to}`（名称/主机、值/指向）+ 动作 `added.dns.records`「**我已添加 DNS 记录**」（由用户声明已完成）；
状态机 `dns.{verifying「正在验证 DNS…」→ verified「已验证 DNS」}`，失败两路 `dns.config.error.{title「找不到 DNS 配置」, subtitle「请稍后重试或联系支持人员」}` / `external.domain.no.dns.found`「未找到此域名的 DNS 配置。请在此处联系我们。」；
页面标题两态 `external.domain.title.{active「外部域名详情」, modify「修改你的域名 DNS 设置」}`；
断开三句 `disconnect.custom.domain.{title,description}`「断开后，共享页面将在 **craft.me 域**上可用，但你可以设置一个新的自定义域。」+ `disconnect.domain` + `disconnect.domain.config`「你确定要继续吗？」+ `disconnect.domain.text`。
⇒ **域的生命周期是四态**：未设置 → 已声明（等验证）→ 已验证 → 已断开（回落 craft.me）。本地若要支持自定义域，这四态与"用户自行声明已加记录"的交互都需实现。

## 六、成员·邀请·空间的成败句对（动作清单）✓

每个动作都有一对 `success` / `failed`：

| 动作 | 成功 | 失败 |
|---|---|---|
| 更新成员角色 | `member.role.updated` | `member.role.update.failed` |
| 移除成员 | （`collab.md` §六） | `member.remove.failed` |
| 撤销邀请 | `invite.revoked` | `invite.revoke.failed` |
| 加入空间 | `space.joined(.new)` | `space.join.failed` |
| 离开空间 | `space.member.removed`「你**不再是** {{spaceName}} 的成员」 | `space.leave.failed` |
| 成为管理员 | `space.admin.added`「你现在是 {{spaceName}} 的**管理员**」 | — |
| 移除文档权限 | — | `remove.document.permissions.failed` |
| 更新团队徽标 | — | `could.not.update.team.logo` + `…logo.url`（**两条**：文件上传与 URL 两条路径） |
| 通用设置写 | — | `error.could.not.update.setting` |

⇒ 补齐 `collab.md` §一 的权限轴：**空间管理员**是可由通知授予的角色（`admin.added`），且"移除文档权限"是独立于"移除空间成员"的第三个动作。
⇒ 邀请去重两态：`invite.already.member.{title「用户已经加入团队」, subtitle「已经是团队成员」}` + `team.invite.email.already.member`「[0] 已是团队成员**或有待处理的邀请**」⇒ 重复判定含"待处理"这一中间态。
⇒ 创建分支三条：`create.{business,family,team}.name`「[0]的业务 / [0] 的家庭 / [0]的团队」⇒ **家庭、团队、业务是三种实体形态**（与 `plans.md` 档位对应，回应其 §六 遗留问题）。
⇒ 席位与上限：`team.paywall.member.count`「最多邀请 [0] 名成员」、`team.plan.benefit.four.more.seats`「额外 4 个席位」、`team.plan.benefit.plus.for.each.member`「每位成员均享完整 Plus 套餐」、`team.trial.ask.admin`「请联系团队管理员升级以保留共享空间」⇒ **试用到期会威胁到共享空间的保留**（不是只锁个人功能）。

## 六之二、`teamsettings.*` 190 条逐条重读后的**增量**（2026-09-27；§二–§六 已覆盖的面不重复）

★ **i18n 插值语法是双轨并存、且正在迁移** —— 这是本批对本地实现最有用的一条：

| 世代 | 语法 | 例 |
|---|---|---|
| 旧（具名 mustache） | `{{plan}} {{count}} {{date}} {{spaceName}} {{plusplan}} {{tier}} {{amount}}` | `plan.monthly`「{{plan}}，每月计费 {{amount}}」 |
| 新（位置 `[0]`） | `[0] [1]` | `plan.monthly.renewal.new`「[0]，按月计费」 |
| **同概念两键并存** | `X` 与 `X.new` | `plan.cancel.subscription`({{plan}}) vs `plan.cancel.subscription.new`([0])；`plan.weekly.renewal` vs `.new`；`plan.yearly.renewal` vs `.new`；`plan.monthly.renewal` vs `.new` |

⇒ 官方**尚未迁完**（`.new` 后缀就是迁移中的证据）。本地实现**必须同时支持两种插值**，且要注意 `alert.space.member.removed`「你不再是 **{{spaceName}}** 的成员」与 `alert.space.joined.new`「你现在是 **[0]** 的成员」**描述同一事件却用两套语法** —— 按 key 前缀猜插值方式会解析失败。

**团队有三种模板**（创建时选）：`create.business.name`「[0]的业务」/ `create.family.name`「[0] 的家庭」/ `create.team.name`「[0]的团队」。⇒ 团队不是单一形态，**business/family/team 三档**（默认名与后续文案都按档变）。

**计费维度比 §三 更细**：`plan.weekly`「每周计费」/ `plan.monthly` / `plan.yearly` + **`plan.per.seat.monthly`「{{plan}}，每个席位 {{amount}}，按月计费」/ `plan.per.seat.yearly`** ⇒ **存在"按席位计费"与"按周计费"两种正交维度**。配套硬失败态：**`invite.error.out.of.seats`「团队没有空位」** ⇒ 席位是**有上限的资源**，邀请会因无席位而失败（§六 的成败句对里此前没有这条）。
`plan.unknown.provider`「未知」⇒ **支付渠道多于一处**（Apple/Google/Web/Stripe），渠道未知时有兜底词。

**分享页品牌水印是团队级开关**：`share.page.branding.enabled`「已启用」/ `share.page.branding.disabled`「已禁用」⇒ 与 `publishing.md` 的发布页对照，**去水印权限挂在团队套餐上**，不是单文档设置。

**账单邮箱不可自助修改**：`billing.billingemail.part1/part3`「请联系我们…如果你想更改帐单电子邮件。**我们会在 24 小时内为你完成**」+ `billing.change.email`「请求更改团队 [0] 的账单电子邮件」⇒ **改账单邮箱是人工流程**（有 SLA），界面只有"请求"没有输入框。
**优惠券文案内嵌 HTML**：`billing.recurring.coupon.flat`「已应用 **`<code>[0]</code>`** [1] 循环折扣」⇒ 语言包里**直接带标签**，渲染端必须允许 HTML（或有 sanitize 通路）。

**套餐赠送/升级**：`granted.description`「作为 {{plan}} 订阅的一部分，你的帐户已升级至 {{plusplan}}。」⇒ **一个订阅可授予另一档套餐**（plan → plusplan 的升级链），此前 `plans.md` 没有这条。

> **测量口径修正**：本命名空间在覆盖率审计里显示 15%，但**绝大部分是假缺口**——§二–§六 早已覆盖 DNS 状态机、订阅三态、成员成败句对、危险区、分段片段，只是**没有逐字引用 key 名**。⇒ 覆盖率数字只能用来找"整块没读过的命名空间"，**不能用来判定某条已摘要的面缺失**。

## 六之三、`teamsettings.{team,plan}.*` 剩余 56 条重读后的**真残留**（2026-09-27 第 38 批）

⇒ **先记一条仪器复核结论（第三次）**：`plans.md` §六-1 与 `team.md` §七 都曾把"`teamsettings.team.*` 36 + `plan.*` 20 未逐条转写"列为**下一个真缺口**。逐条重读后：**其中大部分也早已在别处成文** —— `plan.per.seat.{monthly,yearly}` 与 `plan.weekly*` 在 `plans.md` §五之二 B、`plan.unknown.provider` 与 `*.renewal.new` 在本文件 §六之二。⇒ **剩下的只有下面 5 组**。⇒ 结论已经够硬了：**覆盖率仪器在本目录上已连续三次（`imagine` 82 / `subscription` 256 / `teamsettings` 56）把"已采到但写成散文或省了键名前缀"判成缺口 ⇒ 不要再按仪器排名开批**。

### 1. 成员角色 = **四态，管理员可多人、无自定义角色**（★ 直接结案 §七-2）

`team.role.{admin, member, deactivated, pending}` ⇒ 角色枚举里**把"停用"和"待定"与 admin/member 并列**，但语义上它们是**生命周期态**而非权限档：
- `change.to.admin.title/subtitle`「管理员 / **可以**更改团队设置、账单明细并查看所有空间」
- `change.to.member.title/subtitle`「成员 / **无法**查看设置、账单以及未加入的空间」
⇒ ★ **权限档只有两档**（admin / member），且切换是**逐成员**动作 ⇒ **管理员不是唯一席位、可多人**；"能看哪些空间"由**是否已加入**决定（member 看不到未加入的空间），与 `collab.md` §六之二"空间权限只有两档"呼应。
- `team.deactivated.members`「已停用成员（{{count}}）」+ **`.no.count` 变体**（无计数形态）⇒ **同一行有两种渲染**（0 个或不显示数字）；`members.count`「成员（{{count}}）」、`pending.invites`「待处理邀请（ {{count}} ）」⇒ ★ **三处括号内空格不一致**（`（ {{count}} ）` 前后带空格、其余不带）＝官方排版自身不一致。
- **席位不变量补一条**：`deactivated` 成员**是否占席位**文案未给 ⇒ 与 `invite.error.addseat.less.seat.than.allocated`「席位数量必须 ≥ 分配的席位数量（**会员+邀请**）」对照，该式**只点名会员与邀请、没点停用** ⇒ 停用成员大概率**不占席位**（**推断，未证**）。

### 2. 两条**破坏性操作的确认框**（此前只知有邀请，不知有撤销/移除动线）

| 操作 | 四件套 |
|---|---|
| 移除成员 | `.remove.from.team`（入口）/ `.header`（标题）/ `.text`「你确定要从团队中删除{{name}} ( {{email}} ) 吗？」/ `.cta`（按钮文案与标题**不同词**：「从团队中删除」vs「从团队中移除」） |
| 撤销邀请 | `.revoke.invitation` / `.header`「撤销邀请？」/ `.text`「你确定要撤销来自{{email}}的邀请吗？」/ `.cta`「撤销」 |

⇒ ★ **官方对同一动作的"标题词"与"按钮词"刻意不同**（删除 vs 移除、撤销邀请 vs 撤销）⇒ 本地按"标题=按钮"生成会不一致；★ **确认框里带 name + email 双标识**（防同名）。

### 3. 团队徽标可配 + **点击后跳外部 URL**

`team.logo.click`「点击团队标志」+ `.description`「**单击文档顶部的徽标时，将打开此链接**」+ `logo.url`「自定义团队徽标 URL」+ `change.logo`(+`.description`)。
⇒ ★ **文档顶栏的徽标是一个可配置的外链**（企业入口），本地顶栏目前无此位。
⇒ ★ `change.logo` 有**三套变体**：generic / `.family`（「更改 Family 徽标」，且值里**英文 `Family` 不译**）/ `.team` ⇒ 与 `role.*`、`space` 三分支一致：**Family 与 Team 是同一条代码路径的两个渲染分支**。

### 4. 订阅管理的**两条"走不通"路径**（比 `plans.md` §一 的支付通道更硬）

- `team.subscription.cannot.be.managed.on.platform`「**该平台无法管理此订阅**」⇒ ★ 应用内**主动拒绝**管理某些渠道的订阅（App Store / Setapp 等外部托管），不是"没有入口"而是"点了给错"。
- `team.family.subscription.first.cancel`「**你需要先取消 Family 订阅才能继续**」⇒ ★ **订阅之间存在前置依赖**（有家庭订阅时不能直接做团队侧操作）⇒ 本地若把订阅当单一实体就表达不出这条守卫。
- `team.default.cannot.delete`「你的默认团队无法被删除」⇒ **默认团队是一等概念**且有删除守卫。
- `plan.no.active.subscription`「没有有效订阅」/ `plan.expired`「已到期」/ `plan.expired.at`「于{{date}}过期」/ `plan.expires.at.not.renewed`「{{date}}到期，**未续订**」⇒ ★ **"过期"文案有两版**：一版只说时间、一版明说不再续订 ⇒ 与 `dialogs.md` §8「过期 ≠ 档位」的守卫分档一致。
- `plan.please.retry`「请稍后重试」⇒ 订阅操作有**通用失败兜底**（与 `alert.*` 的三条同义"无法撤销"同族）。

### 5. `.new` 后缀键族 = **插值体系正在迁移**（`{{named}}` → `[0]` 位置插值）

四对并存：`cancel.subscription`{{plan}} ↔ `.new`[0]；`{monthly,weekly,yearly}.renewal`{{plan}} ↔ `.new`「[0]，按月/每周/年计费」（★ **新版的措辞还换了**：从"X 套餐每月续订"变成"X，按月计费"，**语义从"续订"退化为"计费"**）；`plan.tier` 用 `{{tier}}`。
⇒ ★ **迁移未完成 ⇒ 两套键同时在线**（与 `starter.desc` / `starter.desc.block.limit.enabled` 的配额双版、`discount.tooltip.*` / `tooltipv2.*` 的折扣三代是同一模式：**官方对"正在改的东西"用新后缀键并行发布**）。⇒ 本地复刻时**不要只取一版**，否则切开关时会发现文案对不上。

## 七、仍未覆盖


1. ~~`teamsettings.team.*` 36 条与 `plan.*` 20 条未逐条转写~~ **第 38 批结案（§六之三）**：真残留只有 7 条，其余早在 `plans.md` §五之二 B 与本文件 §六之二 成文。⇒ **仍然未证的**：`plan.tier` / `{{plan}}` 的**实际取值集合**（语言包不给枚举，要从 bundle 或实屏取）。
2. ~~角色能否自定义、管理员是否可多人~~ **结案（§六之三 1）**：**权限档只有 admin / member 两档、无自定义角色；管理员可多人**（切换是逐成员动作）。`deactivated` 是否占席位是**推断未证**（分配式只点名"会员+邀请"）。
3. DNS 验证的轮询间隔与超时（`verifying` 之后的机制）。
4. 集成 `disconnect.*` 5 条的对象（断开的是哪类连接）——需与 `imagine.*` 接入中心对账。
5. 发票/账单数据是否可在应用内下载 PDF。
