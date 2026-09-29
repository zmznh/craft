# 设置与账户轴（`preferences.*` 123 + `spaceSettings` 8 + `account` 4 + `login` 9 + `feedback` 13 + `analytics` 29）

证据：`_harvest/tail-{preferences,spaceSettings,account,login,feedback,analytics}.txt`。
标注：`~` = 文案直述；`✓` = 有第二处独立证据（代码常量或另一命名空间）互证。

设置面是**功能开关的注册表** —— 每一条都是一个可复刻的能力。本轴同时回收了 `collab.md` §四 与 `assistant.md` §六/§九 里几条"待动态"的说明句。

## 一、离线模式：一个开关带 11 条文案，含"将丢失清单"确认 ✓（本轴最有价值的交互设计）

| 层 | 事实 |
|---|---|
| 开关 | `offline.mode.title`「离线模式」+ 三版描述：通用「离线查看和编辑文档」/ 关「你可以离线查看**已访问**的文档，但需要联网才能编辑」/ 开「离线更改已保存，将在你下次上线时同步」 |
| 结果态 | `disabled.title`「离线编辑模式已禁用」/ `enabled.title`「离线编辑模式已启用」 |
| **关闭是危险操作** | `disable.confirm.title`「放弃离线更改？」+ `confirm.description`「以下文档有**未同步的离线更改，将会丢失**：」 |
| **列出具体对象** | 确认框里**逐个文档列名**，并**按空间分组**（`confirm.other.space`「在 [0]：」），溢出折叠为 `confirm.more`「还有 [0] 个」 |
| 按钮 | `confirm.button`「放弃并禁用」⇒ 按钮文案复述后果，而非"确定" |

⇒ 交互规则：**关闭一个会产生数据丢弃的开关时，必须先枚举受影响的具体对象、按容器分组、折叠溢出，并把后果写进按钮**。这与 `publishing.md` 的「是的，更改整个文档」、`collab.md` 的「是，离开」是同一套设计语言（第三、四处证据 ⇒ 可提升为通用约定 R21）。

## 二、设置的三层作用域（全局 → 团队 → 空间覆盖）✓

`settings.apply.to.published.content.in.your.space`「这些设置适用于你个人空间中发布的所有内容。」/ `…in.all.spaces`「这些设置适用于"[0]"团队**所有空间**发布的内容」+ `space.override.settings.for.individual.spaces`「你可以**覆盖单个空间**的这些设置。」
⇒ 发布/品牌类设置是**用户级或团队级默认 + 空间级覆盖**；空间本身还有独立设置入口（`space.settings` / `space.access` / `manage.access`）。

## 三、AI 助手在设置面的三处落点 ✓

| 项 | 事实 |
|---|---|
| **可按空间禁用，且不影响他人** | `enable.assistant` + `enable.assistant.description`「禁用后，你将无法访问助手。**不影响其他成员的设置**。」+ `assistant.space.desc`「你可以为单个空间禁用该助手。」⇒ 是**每用户 × 每空间**的开关，不是空间全局开关（闭环 `assistant.md` §五 的 `assistant.disabled`） |
| **额度上限在界面上告知** | `assistant.saved.prompts.limit.desc`「最多可保存 **[0]** 条提示词，每条最多 **[1]** 个字符。」⇒ 与代码常量 `ge=20 / G=1000`（`assistant.md` §九）**完全对上** ✓✓ |
| 面板结构 | `assistant.model`「模型」、`assistant.saved.prompts`「已保存的提示」、`assistant.add.prompt` / `assistant.delete.prompt`、`ai.usage.and.limits`「AI 使用和限制」、`view.ai.assistant.credits`「查看 AI 助手额度」⇒ 提示库可在设置里增删（与聊天面板内的保存路径并行） |

## 四、通知：三通道 × 三事件 × 可分空间 ✓（回收 `collab.md` §四 的待验证项）

- 通道：`notifications.push` 推送 / `notifications.email` 电子邮件 / `daily.email` **每日电子邮件**。
- 每日摘要有明确定义：「接收**当天所有任务和提醒的摘要**。你还将收到今天截止的摘要推送通知。」⇒ 摘要同时走邮件与推送两条。
- 事件：评论与提及（`comments.and.mentions`「当你收到新的评论和提及时得到通知」）、提醒（`reminders.desc`「当需要提醒时，Craft 会向你发送通知」）、每日任务摘要。
- **邮件通知可按空间单独开**：`notifications.email.desc`「如果你想**在此空间中**接收提及和评论的电子邮件通知，请启用」⇒ 官方邮件通知确实是分层实现，不是单一全局开关。

## 五、外观与编辑偏好 ~

`appearance` + `appearance.accent.color`「强调色」（+ 描述「选择强调色」）⇒ 与 token 侧已采的 `[data-accent=…]` 6 色互证 ✓。
`advanced.completed.task.appearance`「完成任务的外观」**三档**：`faded` 淡化 / `strike` 删除线 / `none` 无 + 描述「自定义已完成任务**在应用中**的显示方式」⇒ 全局偏好，影响所有已完成任务渲染。
`advanced.date.badges`「日期标记」+ 描述「显示带有日期标记的每日笔记链接是在文档中突出显示它的好方法」⇒ **每日笔记链接可显示日期徽标**。
`advanced.link.open.preference`「Craft 文档链接默认打开方式」+ `open.in.app.link.tooltip`「自定义 Craft 链接应在 Craft for Web 还是桌面应用中打开」⇒ **`craft://` 深链的落地策略是用户偏好**（补 `assistant.md` §十一 的消费侧）。
`daily.note.tooltip`「在主页上默认显示每日笔记」；`section.title.language`「语言与拼写检查」⇒ **界面语言与拼写检查语言是两个独立设置**（`language` / `spell.checked.language` / `spelling.description`「默认拼写检查语言」/ `spellcheck.tooltip`「更改**所有文档上**拼写检查器的默认语言」）。
`keyboard.shortcuts` 快捷键、`available.platforms` 可用平台、`automatic.beta.redirect`「自动重定向至 Beta 版本」（**内测通道开关**）、`reset.doc.cache`「重置文档缓存」+ `document.cache.cleared`「文档缓存已清除」（**本地缓存有手动清空出口** ⇒ 印证空间在设备上有真实落点，`collab.md` §六）。

## 六、账户与身份 ~

分体姓名 `family.name`「姓」+ `name`；`name.description`「你的姓名在你通过**共享链接和电子邮件**与他人共享的文档中可见」⇒ 姓名是对外可见信息，故可改。
**每个 profile 写操作都有三件套**（进行时 / 成功 / 失败）：`name.updating` + `name.updated` + `alert.change.name`；`updating.photo` + `profile.photo.updated` + `alert.update.photo` ⇒ 与 `publishing.md` §五 的"每异步写一句进行时"**第四次互证** ✓。
邮箱：`email` + `email.description` + `email.change` 更改邮箱。
**删除账户三连**：`account.delete` / `account.delete.title`「帐户删除」/ `account.delete.message`「删除帐户将**永久删除你的所有文档**。此操作无法撤消。」（官方中文有"撤消/撤销"混用）。
`sign.out` 退出登录、`account.title`「我的账户」、`general.account.settings`「账户设置」。
邮件入档：`email.to.craft`「**邮件发送至 Craft**」⇒ 有一个专属邮箱地址可把邮件存进 Craft（此前完全未记的功能面）。

## 七、空间治理与成员（`spaceSettings` 8 + `manage.*` + `members.and.invites`）✓

空间可见性两档：`manage.private`「私密」+ desc「只能通过邀请查看或加入」/ `manage.open.desc`「**开放空间**是可见的，所有团队成员都可以加入」；另有 `space.private.desc`「**团队管理员**可以看到并可以通过邀请加入」⇒ 私密空间的可见者是管理员，不是成员。
成员操作：`members.and.invites`、`add.members.to.space` + `…sending`「发送空间邀请」（进行时again）、`leave.x.question`「离开 [0]？」、`remove.user.from.space` + `confirm`（**双参数**「你确定要从空间"[1]"中移除"[0]"吗？」）、`remove.user.from.team` + `confirm`、`switch.to.space`「切换至空间」、`team.image.updated`。
⇒ 与 `collab.md` §一 的空间角色轴对上：邀请、移除、离开、切换都是空间级治理动作，且移除确认句在设置面与协同面各有一套。

## 八、发布品牌（团队级）与 `analytics`

`published.content.settings`、`setup.custom.domain` + desc「发布 Craft 文档时使用你自己的域名」、`your.craft.me.link` + `use.your.custom.craft.me`、`show.logo.in.header` + `show.your.logo.in.the.header`「在**所有已发布文档**的页眉中显示你的徽标」⇒ 品牌是团队级默认、文档级可覆盖（对应 `publishing.md` §一 的域名三档）。
`analytics` 29 条与 `stats` 10 条属"已发布页面分析"（`plans.md` §三 已把高级分析列为 Business 权益）；细分项在 `longtail.md` §Analytics，本轴不重复。
反馈与社区：`send.feedback`「意见反馈」、`have.an.idea`「有想法、功能请求或发现了错误？请告诉我们，我们会尽快处理！」、`follow.craftdocs.app.x`「在 X 上关注 @CraftDocs」、`preferencesinterested.in.new`（**这是扁平键，不是 `preferences.` 子键** ⇒ 官方键名里有一处前缀粘连，别按命名空间切分时误判）、`about` / `about.legal` / `about.social` / `license.notes`「许可证和开源说明」。
集成：`integrations` / `integration` / `connect` / `connected.platforms` / `disconnect`「断开」/ `learn.more.integrations` ⇒ 与 `imagine.*` 接入中心是同一层的两个入口（设置里列已连接平台，Imagine 屏做增删）。

## 九、仍未覆盖

1. 各开关的**默认值**（文案不给；需代码常量或动态）。
2. `daily.email` 的发送时间是否可配。
3. Beta 重定向的判定条件（账号标签？）。
4. `email.to.craft` 的地址形态与投递后的落点（进收件箱？进指定空间？）。
5. 设置面板的**分区顺序与层级**（本文只给出分区存在性）。

## 十、UI 偏好存储层与权威默认值 ✓（`index` bundle 直读，本批补上）

官方把界面偏好放进一个统一的小存储层，模式是**每个偏好一个服务对象 + 三件套**：

```js
Service.CACHE_KEY   = "<键名>";
Service.FALLBACK_x  = <硬编码默认值>;
Service.cache       = new Lo(Service.CACHE_KEY, <初始对象>, <校验器>);
// 读写：const v = Service.cache.get(); …; Service.cache.store({...v, field: x})
```

⇒ 与 `assistant.md` §九 自定义提示的"谓词校验 + 读写双写"**同构** ✓ ⇒ 官方有一致的"带校验器的本地偏好存储"约定，而非各处 `localStorage.setItem`。

| 键 | 内容 | **权威默认值** | 校验器 / 备注 |
|---|---|---|---|
| `browse-layout` | 浏览面视图：`{folders:{}, quickFilters…}` | **`FALLBACK_LAYOUT = Kn.Cards`** ⇒ **默认是卡片视图，不是列表** | 与 `data-testid="browse-layout-toggle"` 对应（`ui-affordances.md` 可加一条） |
| `browse-sort-config` | 排序：`{sortBy, sortDirection, quickFilters}` | **`FALLBACK_SORT = {sortBy: Ns.Updated, sortDirection: $n.Descending}`** ⇒ **默认按更新日期降序** | 写入点之一是把 `quickFilters.TAGS` 置位 ⇒ 快筛与排序同一对象 |
| `search-scope-preference` | 搜索范围偏好 `{preference}` | **`FALLBACK_PREFERENCE = "local"`** | `static set(e){ cache.store({preference:e}) }` 单字段写 |
| `sidebar-inbox-item-order` | 未归档区的自定义顺序（按 id 的 map） | 初始 `{}` | 校验器 `typeof e==="object" && e!==null && Object.values(…)` ⇒ 与拖拽序（`registries.md` 的 `root_/tag_/folder_reorder`）配套 |
| `sidebar-starred-item-order` | 收藏区自定义顺序 | 初始 `{}` | 同上，独立一把（不共用 inbox 顺序） |
| `tag-usage-stats` | 标签使用统计（用于 `recommended.tags` 排序） | 初始 `{}` | 有**逐键删除**路径（`delete o[id][k]` 后 store）⇒ 统计可清 |
| `tags-short-cache` | 标签精简缓存 | 初始 `{}`（未取到默认结构） | 具体形状未证，留待下批 |

三条可立即落地的结论：① 复刻时**新用户的初始视图应是卡片 + 更新日期降序**，不是列表；② **搜索默认范围是 `local`**（只搜本地/当前范围），与 `assistant.md` §六 的检索默认 `limit=100 sortBy=dateCreated` 是两条不同的默认轴，别混；③ 侧栏的"未归档"和"收藏"各有**独立顺序存储**，所以两者可分别拖拽排序（呼应 `registries.md` 的五种 reorder 作用域）。

### 残留
`tags-short-cache` 的默认结构与失效策略、`Lo` 存储的落点（localStorage / IndexedDB / 同步 kv）未证 —— `Lo` 的构造签名可见，但底层载体需动态或继续解码。

