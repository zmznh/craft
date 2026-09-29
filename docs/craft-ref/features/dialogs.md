# Craft.do 守卫、反馈与离线门禁（从 252 条 `alert.*` 回溯）

来源：`_harvest/i18n-zh.tsv` 的 `alert.*` 全量 252 条 + `collections.*` 200 条。方法论依据：**每条确认框 / toast / 错误文案背后是一个状态迁移或一条守卫规则**，文案就是官方的状态机表。置信度全部 `~`（静态证据充分、行为未做指纹验证）。

## 一、硬数字与上限（可直接写进校验层）

| 约束 | 官方值 | 证据键 |
|---|---|---|
| 单字段文本长度 | **10000 字符** | `alert.character.limit.reached.subtitle` |
| 自定义分享路径 | **≥2 字符、<500 字符、不含空格**；需自定义域名；Business 套餐过期即锁 | `alert.error.custom.paths.{too.short,too.long,no.spaces,empty}`、`.available.with.custom.domains`、`.tier.expired` |
| 提醒数量 | 三档独立上限：总数 / 进行中 / 已完成，均为远端下发的 `[0]` | `alert.max.{x,in.progress,resolved}.reminders`、`alert.cannot.add.more.reminders` |
| 合集字段数 | `字段数量不能超过 [0] 个` | `collections.error.field.limit`、`alert.field.limit.title` |
| 合集行数 | 独立上限 | `alert.row.limit.title` |
| 表格尺寸 | `已达到表格大小限制（[0] 列，[1] 行）`，并建议「尝试多个较小的表格」 | `alert.table.size.limit.reached`、`alert.try.smaller.tables` |
| 白板 | 元素数与图片数各自上限（见 `longtail.md` §6） | `whiteboard.{elements,assets}.limit` |
| 标题字段 | **必填** | `alert.title.required` |

## 二、删除生命周期（含可逆性分级）

官方把"删除"分成三档，可逆性不同，文案也不同：

1. **移至最近删除（可恢复）**：`alert.moved.to.trash`「将文档移至"最近删除"」、`alert.{item,items}.moved.to.recently.deleted`「此/这些项目将移至最近删除」。
2. **永久删除（不可逆，需二次确认）**：`alert.empty.trash.title`「你确定要永久删除这些项目吗？」、`alert.warning.delete`「你确定吗？此操作无法撤销。」、`alert.deleting.folders.cannot.be.undone`「删除文件夹无法撤销。」（**文件夹删除单独强调不可逆**）、`commands.delete.permanently.document`。
3. **自我移除（不可逆且影响自己）**：`alert.remove.access.confirmation`「你确定吗？你将无法再访问此文档，且无法撤销此操作。」

失败态各自独立：`alert.could.not.{delete.document,move.to.trash,restore.from.trash,delete.some.documents}`、`alert.cannot.delete.doc`。⇒ **「无法删除某些文档」说明批量删除是部分成功的**，本地批量删除要么全成要么报错，需改成逐项结果聚合。

## 三、权限守卫（authz 面板缺失的一整层）

官方在"移除某人权限"前有**三条解释性提示**，说明权限是多路叠加的：

| 情形 | 文案 | 含义 |
|---|---|---|
| 链接权限仍是 edit | `alert.member.can.edit.doc.file.permission`「此人仍然可以编辑，因为该文件设置为任何有链接的人都可以编辑。」 | 移除个人条目**不代表**他失去访问 |
| 团队级已有编辑权 | `alert.member.can.edit.doc.team.permission` | 团队授权覆盖文档授权 |
| 团队成员仍可见 | `alert.member.will.still.access.doc` | 同上，只读视角 |

其它权限事实：
- **分享降级自锁警告**：`alert.share.permission.change`「你确定吗？这将更改你的权限。你将无法再管理共享设置。」⇒ 官方在把 owner 权限降下去之前会警告（与本地已修的 `canOpenWhiteboardShare` 自锁缺陷同族，但官方是**允许 + 警告**）。
- **口令与邮件访问互斥**：`alert.password.not.enabled`「启用邮件访问权限后，无法同时启用密码保护。」⇒ 分享设置两个开关是 XOR，本地 `DocumentShare.passcode` 无此约束。
- **重置链接使旧链接失效**：`alert.previous.link.no.active`「先前的链接将不再有效。」
- **邮箱访问强制域名**：`alert.domain.enforced`「启用基于邮箱的访问后，将强制使用 Craft 域名。」
- 权限操作失败四态：`alert.error.{change,delete}.permission.title`、`alert.error.remove.share.access.title`、`alert.error.remove.x.access.title`、`alert.could.not.add.permission`、`alert.could.not.change.role`。
- **访问请求流**失败面：`alert.error.request.access.title`、`alert.{approving,declining}.request.failed`（批准/拒绝是两个动作）。
- 当前身份提示：`alert.permissions.logged.in`「你当前的登录身份为 [0]」。

## 四、离线状态机（本地 `draft-store` 的对账基准）

**状态**：`alert.you.are.offline` / `you.are.connected` / `not.connected.to.internet` / `no.internet.connection` / `reconnecting` / `reconnecting.3dot`。

**离线时的数据命运**（四句构成完整链路）：
1. `alert.unsaved.changes.offline.saved.locally`「你的更改已保存到本地但尚未同步，确定要离开吗？」⇒ 离线写入落本地，且**离开时询问**。
2. `alert.offline.changes.will.sync`「连接后，你的更改将同步」
3. `alert.offline.changes.restored`「离线更改已恢复」
4. `alert.offline.changes.synced`「离线更改已同步」

**离线门禁清单**（官方明确要求联网才能做的动作 —— 逐条对账本地实现）：

| 动作 | 文案 |
|---|---|
| 添加 / 移除表情反应 | `alert.not.connected.to.internet.{adding,removing}.reactions` |
| 添加评论 | `alert.reconnect.to.the.internet.to.comment` |
| 编辑评论 | `alert.reconnect.to.edit.a.comment` |
| 删除评论 | `alert.reconnect.to.the.internet.to.delete.comment` |
| 导出文档 | `alert.reconnect.to.the.internet`（「重新连接网络以导出文档」） |
| 导入文档 | `alert.reconnect.to.the.internet.to.import` |
| 共享文档 | `alert.no.internet.connection.desc`「重新连接网络即可共享此文档」 |
| 创建白板元素 | `alert.reconnect.to.create.new.elements` |
| 查看某文档 | `alert.get.back.online.to.view.this.doc` |
| 泛化 | `alert.not.available.offline`「离线不可用」 |

⇒ **官方离线策略是"读缓存 + 评论/反应/导入导出/白板创建全部禁用"**，而不是全线乐观写入。本地目前只有编辑器草稿，没有按动作分类的门禁矩阵。
另有代码块级容错：`alert.lazy.load.{title,desc}`「某些功能无法加载 / 请检查你的网络连接或重新加载页面」⇒ **懒加载 chunk 失败有专门 UI**（对应 96 个功能模块的代码分割）。

## 五、块 / 任务 / 提醒的交互反馈（补齐 interactions.md 的效果与反馈两列）

- **提醒是块级属性且改期要确认**：`alert.reschedule.reminder.{title,desc}`「此区块有一个即将到期的提醒。/ 请确认你是否要更改。」⇒ 移动或改动带到期提醒的块会弹确认。
- **任务可被移动到文档或每日笔记**，并回报目标：`alert.task.moved.to`「任务已移至 [0]」+ 复数版 `…to.plural`、`alert.task.moved.to.a.daily.note`(+复数)。⇒ 这是任务↔文档双向链路的**官方成功反馈**，本地 `syncDocumentTasks` 无任何反馈文案。
- **评论生命周期错误面**：`alert.{not.update,deleting.comment.failed}.comment`、`alert.error.comment.send`、`alert.could.not.{resolve,unresolve}.the.thread`、`alert.delete.comment.question`「删除评论？」、`alert.thread.delete.message`「你确定吗？这也会删除其所有回复。」⇒ **删线程连带删回复**（级联语义明确）。
- 反应失败：`alert.could.not {add,remove}.reaction`（配合 `longtail.md` §9 的 reaction 聚合文案 ⇒ 评论表情反应确认存在）。

## 六、合集编辑的守卫（`collections.*`）

| 守卫 | 官方事实 | 证据 |
|---|---|---|
| **标题列类型锁死** | 「标题的类型无法更改。它充当每个项目的标识符。」 | `collections.title.type.cannot.be.changed` |
| **改字段类型 = 尽力转换值** | 「如果可以转换，修改字段类型将会转换当前值。你确定要继续吗？」 | `alert.field.type.changing.{title,desc.updated}` |
| **删组不删项** | 「这将删除 [1] 个项目中的"[0]"值。项目本身不会被删除。」 | `collections.delete.group.{title,message}` |
| 删组内全部项目才是不可逆 | 「确定要删除此分组中的所有项目吗？此操作无法撤销。」 | `collections.confirm.delete.all.items.in.group` |
| **拖拽在视图有排序态时禁用** | 「已筛选、排序或分组的集合不支持拖放操作」 | `collections.drag.drop.not.available{.desc}` |
| 跨类型粘贴要兼容 | 「无法粘贴到选定字段 / 请确保复制的值与字段类型兼容」 | `alert.cannot.paste.into.selected.field{.subtitle}` |
| 批量编辑回报计数 | 「已应用 [0] 项更改」 | `collections.x.change(s).applied` |
| 视图保存二选一 | 「保存当前」/「另存为新版本」 | `collections.save.{for.current,as.new}` |
| 块转合集 | 「转为合集」 | `collections.turn.into.collection` |
| 行移出为独立对象（测试版） | 「移出行（测试版）」 | `collections.move.out.{row,items}.beta` |
| 空态与搜索 | 「未找到任何项目」「搜索项目…」「选择合集」 | `collections.{no.items.found,search.item.3.dot,select.collection}` |
| 合集内建文档失败 | 「无法创建文档 / 遇到了技术问题，请重试」 | `collections.create.document.error{.desc}` |

⇒ 第五行的**拖拽禁用规则**是原计划靠动态采集才能拿到的"拖拽落点规则"的关键一半：只要视图带 filter/sort/group，重排就被禁掉。

## 七、账号 / 订阅 / 认证守卫（多为有意的付费墙与外部依赖）

- 删除账户要**输入邮箱地址**：`alert.account.delete.{message.confirmation,message.otherspaces,message.personal.only,type.email}` ⇒ 二次确认用文本匹配而非按钮；且区分"只删个人空间"与"连带其它空间"。
- 失败次数过多 → `alert.account.locked`、`alert.too.many.attempts`（+`try.again.later`）。
- 验证码四态：`alert.{expired,invalid}.code`、`alert.code.already.verified`、`alert.add.email`。
- 邮箱占用冲突：`alert.apple.id.already.used`、`alert.your.email.is.registered.to.a.team`、`alert.license.key.{already.used,already.subscribed,invalid.or.expired}`。
- SSO 两条：`alert.use.sso`「此邮箱已绑定 SSO 认证，请使用 SSO 登录。」、`alert.error.sso.not.setup`。
- 订阅侧（本地按有意偏差处理，只记不实现）：`alert.failed.to.{register,updated}.subscription`、`alert.subscription.provider...`、`alert.not.supported.team.upgrade`、`alert.team.setup.not.support.upgrades`、`alert.support.for.subscription.upgrade`。
- 授权集成（MCP/API，见 `api-contract.md`）：`alert.authorization.{error,successful}` + `.successful.subtitle`「你现在可以在你的文档中使用此集成。」
- 未分类但有信号的功能：`alert.builing.your.presentation`「我们正在制作你的演示文稿……」⇒ **存在演示文稿生成功能**（`?` 入口未定位）；`alert.copy.success.deeplink` ⇒ 深层链接复制；`alert.only.images.as.cover.image` ⇒ 封面仅图片；`alert.page.has.been.removed` ⇒ 被分享者侧的远端移除通知；`alert.files.are.not.supported.in.this.browser` ⇒ 浏览器能力门（对应 `IncompatibleBrowserCheck`）。

## 八、`alert.*` 252 条逐条重读的**增量**（2026-09-27；§一/§二/§四/§七 已覆盖的不重复）

### 8.1 ★ 官方自身的不一致（复刻时要逐条决定"照抄"还是"修正"，必须显式记，否则下轮会当成 bug 改回去）

| 现象 | 证据 |
|---|---|
| **"无法撤销"有**三条**同义文案** | `alert.warning.delete`「你确定吗？此操作无法撤销。」· `alert.warning.delete.newline`「你确定吗？␣此操作无法撤销。」（**问号后多一个半角空格**）· `alert.this.action.cannot.be.undone`「此操作无法撤**消**」（**"撤消"与"撤销"两种用字并存**） |
| **key 名里带空格** | `alert.could.not add.reaction`「无法添加表情」⇒ 命名空间里有**含空格的 key**，任何按 `.` 分段查表的实现都会在这条上失败 |
| **同一语义三种前缀** | `alert.could.not.X` / `alert.not.update.X`（`comment`、`space.access`、`email.notification.settings`）/ `alert.not.load.pending invites`（**后者 key 里也有空格**）⇒ 失败句前缀不统一 |
| **进行时句省略号不一致** | `alert.deleting.document`「正在删除文档」（无 …）vs `alert.deleting.documents`「正在删除文档…」（有 …）；`alert.deleting.account…` 有、`alert.creating.documents`「正在创建文档」无 ⇒ **标点不能靠规则生成** |

### 8.2 危险操作的**输入式确认**（比二次确认更强一档）

`alert.account.delete.message.personal.only`「…将被永久删除！ **要继续，请输入你的电子邮件地址：**」+ `alert.account.delete.message.otherspaces`（**列出受影响的空间清单**）+ `alert.account.delete.message.confirmation`（个人空间版）⇒ 删账户是**三态文案 + 输入邮箱解锁提交**。⇒ 本地目前只有"点确认按钮"一档，缺"输入指定字符串才允许提交"这一档。

### 8.3 **离开共享文档**是独立确认（单/复数两键）

`alert.leave.document`「你确定要离开该文档吗？**你可能无法再访问它。**」+ `alert.confirm.leave.documents`「你确定要离开 [0] 个文档吗？你可能无法再访问它们。」+ 失败态 `alert.leave.shared.document.desc`「无法离开文档。请稍后重试。」+ `alert.error.leave.doc.title`「无法离开文档」⇒ **离开后可访问性不保证**是官方明写的后果句，且单/复数各一键、成败四键齐备。

### 8.4 **字段类型变更会尝试转换现有值**（不是清空）

`alert.field.type.changing.desc.updated`「**如果可以转换**，修改字段类型将会转换当前值。你确定要继续吗？」⇒ 转换是**尽力而为**：能转则转、不能转的行为未在此句承诺（仍待动态验）。与 §六 的集合编辑守卫同层。

### 8.5 **11 条进行时句 = 异步操作的 pending 态全集**（可直接当本地 loading 清单）

`creating.documents` / `creating.folders` / `creating.link` / `deleting.account…` / `deleting.document` / `deleting.documents…` / `deleting.invite…` / `deleting.invites…` / `exporting.documents` / `updating.space.avatar` / `updating.user…`
⇒ **导出与"更新空间头像"也有独立 pending 句**（此前 `publishing.md` 与 `settings.md` 都没记）；⇒ 每个都应有对应的进行中 UI 态，本地目前只有删除有。

### 8.6 **58 条失败句按面归并**（= 可失败操作 census）

- **收藏/星标的成败是成对的**：`could.not.star.document` + `could.not.unstar.document` ⇒ 收藏与取消收藏各自可失败。
- **表情反应**：`could.not add.reaction` + `could.not.remove.reaction` + **离线专错两条**（`not.connected.to.internet.{adding,removing}reactions`）⇒ **reaction 明确禁离线**（与 §四 离线状态机对照：并非所有写操作都能排队）。
- **讨论**：`could.not.{resolve,unresolve}.the.thread`（**"重新打开"官方叫 unresolve**）+ `deleting.thread.failed` + `delete.thread.failed`? ⇒ 双向各有专错。
- **文件夹**：`could.not.create.folder` / `could.not.update.folder` / `browse.could.not.delete.folder` ⇒ 建/改/删三条独立失败。
- **链接**：`link.not.{created,removed,updated}` + `copy.link.error`「无法将链接复制到剪贴板」⇒ **剪贴板失败是单独一条**（浏览器权限拒绝的真实场景）。
- **权限**：`error.{change,delete}.permission.title` + `not.update.space.access` + `error.auth.token.missing`「无法验证你的身份」。
- **邀请**：`could.not.invite.members` / `delete.invites`(单复两键) / `not.load.pending invites` / `alert.delete.invite(s)`。
- **套餐过期导致的**功能锁（≠ 套餐档位不足）：`error.business.tier.expired`「由于你的 Business 套餐**已过期**，无法更改自定义域名。」+ `error.custom.paths.tier.expired`（自定义路径）⇒ **过期与降级的守卫是分开的两条**，`plans.md` 只记了档位门禁。
- **加载类**：`cannot.load.pinned.document` / `error.failed.to.load.documents` / `error.document.not.found.desc`「我们无法加载你尝试打开的文档」/ `load.preview.error` / **`lazy.load.title`「某些功能无法加载」**⇒ **懒加载 chunk 失败有专错**（对应本地 dynamic import 失败态）。
- **通用兜底**：`operation.failed`「操作失败 **[0]**」⇒ 兜底句带**原因插值**，不是纯静态文案。
- **注册/登录**：`error.login.failed` / `registration.is.unavailable`「当前无法注册，请稍后重试」/ `not.updated`「密码无法更新」。
- **粘贴**：`failed.to.paste`「粘贴失败」⇒ **粘贴有失败态**（此前 `internals.md` 的 MIME 面没记到用户可见反馈）。

### 8.7 通知与邮件设置各有独立成败

`not.get.email.notification.settings` / `not.update.email.notification.settings` / `deleting.notification.failed` ⇒ 邮件通知设置是**读 + 写 + 删通知**三个独立可失败操作。

## 仍未采到

- 所有 `[0]` 占位符的**实际数值**（提醒上限、字段上限、表格尺寸上限、白板元素上限都由远端配置下发，bundle 无常量）。
- 每条告警对应的**按钮组**（确认/取消/重试/联系的分布）—— 文案里没有按钮名，需动态采集或在 `commands.*` 里逐条回溯。
- 离线门禁是"禁用控件"还是"点击后弹提示"—— 两种都可能，未观测。
- `alert.builing.your.presentation` 的入口与产出形态。
- 演示文稿 / 深层链接 / 空间移动（`alert.space.moved.successfully` + `alert.move.space.to.team.desc` 带 `<strong>` 标签的三个占位符）的完整流程。
