# 协同：角色·评论·提及·通知·分享·空间生命周期（`collab.*` 164 + `invite.*` 23）

证据：`_harvest/collab-zh.txt`（164 行全量）、`_harvest/invite-zh.txt`、`_harvest/teamsettings-zh.txt`（190 行，本文只取与权限直接相关部分）。
标注：`✓` = 代码/结构化文案证明；`~` = 文案直述，行为未验。

## 一、两套正交的权限轴（本地混成了一套 —— 结构性偏差）

| 轴 | 档位 | 定义句 | 置信 |
|---|---|---|---|
| **文档级角色** | `role.viewer` 查看者 / `role.editor` 编辑 / `role.owner` **文档所有者** | 「此文档的查看者」「本文档的编辑者」 | ✓ |
| **空间级角色** | `space.permission.owner` 所有者 / `member` 成员 / `guest` 访客 | owner「可以更改设置并邀请新成员」；member「**无法更改设置或邀请新成员**」（`collab.space.permission.member.description`，另有 `cant.change.settings.or.invite.new.members`「可以访问整个空间并更新任何文档」⇒ **member 对内容是全权、对治理是无权**） | ✓ |
| **访问级别**（分享面板用，非角色） | 仅协作者 / 可查看并评论 / 可编辑并评论 / 知道链接可查看 / 知道链接可编辑 | `access.{only.collaborators, view.and.comment, edit.and.comment, link.view, link.edit}`；footer「无需 Craft 帐户」 | ✓ |

⇒ 官方是 **角色（人是什么）× 访问级别（链接开放到什么程度）× 层级（文档 / 空间 / 团队）三轴**；`view.and.comment` 与 `edit.and.comment` 证明**"可评论"是独立于"可查看"的一档**，不是评论功能的开关。
⇒ **席位是计费事件**：`increase.seat.desc` 与 `increase.seat.free.desc` 是同一段话的**付费/免费两版**，付费版多一句「这是一个计费事件。」⇒ 邀请升级席位前必须显式告知扣费。
⇒ 团队邀请的完整语义：受邀者获得**整个团队的完全成员权限**并看到所有公共空间（不是只给这一个文档）。

## 二、评论：一个有状态机的子系统 ✓

| 层 | 事实 |
|---|---|
| CRUD | `comment.add` 添加评论 / `comment.edit` 编辑 / `delete.thread` + `delete.thread.question`「删除话题？」（确认）/ `comment.edited`「已编辑」标记 |
| 失败分列 | `failed.to.edit`「编辑失败」与 `failed.to.update`「更新失败」是**两句** ⇒ 正文编辑与状态更新是两次不同写操作 |
| 解决态 | `resolve` 设为已解决 / `unresolve` 设为未解决 / toast `thread.marked.resolved.short` / `thread.marked.unresolved.short` |
| **重新打开必须写评论** | 输入框占位在未解决态是 `comment.type.placeholder`「输入你的评论」，在可重新打开态变成 **`type.placeholder.unresolve`「输入你的评论以重新打开」** ⇒ 复活话题的触发器是"提交一条新评论"，不是点按钮 |
| 折叠 | `show.resolved` / `hide.resolved` 短标签 + `show.resolved.threads` / `hide.resolved.threads` 长说明（tooltip 与菜单项两套文案） |
| 计数（CLDR） | `comments.count.1`「1 条评论」/ `comments.count.x`「[0] 条评论」；串内 `one.more.comment`「还有 1 条评论」/ `x.more.comments`「还有 [0] 条评论」——**又一处 one/other 分键** |
| **离线限制** | `comment.reconnect.to.delete`「重新连接网络以删除评论串」⇒ **删除评论串必须联网**（本地可写、不可删） |
| 加载失败 | `unable.to.load.comment`「无法加载评论」——独立错误态，不是空态 |
| 空态 | `no.comments.yet`「暂时没有评论」+ 引导句 `share.your.thoughts`「分享你的想法、开始讨论或留下反馈！」 |
| 输入框 | `comment.type.placeholder`；面板标题 `comments`「评论」 |
| 表情回应 | `reaction.add` 添加表情 + **三档人称文案**：`reacted.count.1`「[0] 添加了 [1] 表情」/ `count.2`「[0] 和 [1] 添加了 [2] 表情」/ `count.x`（N 人同句式）⇒ one/two/other 三形态 |

## 三、@提及的权限约束与候选来源 ✓

| 事实 | 证据 |
|---|---|
| **查看者的提及范围被裁剪**：只能提及"通过电子邮件邀请的人" | `doc.viewer.mention.desc`「作为此文档的查看者，你只能提及通过电子邮件邀请的人员。」 |
| 提及未受邀者时是**可操作的提示**，不是静默失败；文案里带 React 内联标记 `<0></0>`（即人名是渲染节点） | `invite.but.not.invited`「你想提及 <0></0>，但他们未被邀请加入此文档。」 |
| 候选列表有两个来源 | `suggested.collaborators`「推荐的协作者」+ `from.your.contacts`「来自你的联系人」 |
| 提及框内可直接发邀请 | `add.emails.to.invite`「添加邮箱以邀请」；未受邀者状态标记 `not.invited` |
| 人名聚合展示有两档 | `names.list.2`「[0] 和 [1]」/ `names.list.x`「[0] 和其他 [1] 人」 |
| 键名 typo | `collab.mentioned.in.this document`（键里含**空格**）——复刻键名时不要照抄 |

## 四、通知中心（独立子系统，与评论解耦）✓

- 触发三类：`notifications.onboarding`「当有人**提及你、对你的文档发表评论或回复你的评论**时，你会在此处收到通知。」
- 已读是**可逆**的：`mark.as.read` / `mark.as.unread` / `mark.all.as.read`（三档操作齐备）
- 删除通知有确认：`delete.notification`「删除通知？」
- 空态 `no.notifications.yet` + 手动重试 `reload.notifications`
- **电子邮件通知是一层独立开关**，且禁用态有三连文案：`enable.email`（动作）/ `notifications.are.disabled`（状态句）/ `disable`（结果 toast）/ `disabled.desc`「要接收电子邮件通知，前往设置并启用电子邮件通知。」⇒ 面板内不直接开邮件通知，而是**引导去设置**（跨面板跳转）
- 通知类型封闭 6 集见 `registries.md`

## 五、分享与私密链接的状态与危险操作确认 ✓

**链接态**（每条都有独立的"进行中/完成"两句）：`removing.link` 正在移除链接 → `link.removed`；`updating.link` 正在更新链接；`updating.password` 正在更新密码 → `secret.link.password.updated`；`secret.link.created`；`link.copied.clipboard`。
⇒ 官方给**每个异步写操作一个 present-continuous 态**，不是通用 spinner。

**三个必须记的交互规则：**

1. **分享子页 = 分享整个文档**。`share.subpage.warning`「分享适用于整个文档。你对查看或编辑权限所做的任何更改都将应用于整个文档。」配合确认按钮 `share.document.confirm`「是的，更改整个文档」，以及提示句 `share.document.warning`「你对查看或编辑权限所做的任何更改都将应用于整个 [0] 文档。」⇒ 权限变更的作用域会**向上扩大到文档根**，并且用确认按钮文案复述这个后果。
2. **撤销访问是两问合一**。`question.revoke.access`「此人的访问权限将从所有文档中移除。你是否**还想**撤销他们对特别邀请的文档的访问权限？」⇒ "从空间移除"与"撤销被单独邀请的文档"是两件事，一句话里问第二遍。配套动作 `remove.all.access` / `remove.access.to.all.docs`。
3. **请求-审批闭环**。查看者侧 `shared.document.ask.to.edit`「请求编辑」→ `request.sent`「请求已发送」；所有者侧 `access.request.approve`「批准」/ `access.request.decline`「拒绝」；无权限者入口 `request.access.to.document` + 副标题「你的请求获得批准后，你可以查看此文档。」
4. 复制的链接是哪一档会被回读告知：`sharing.copied.link`「你复制的链接是[0]。通过邀请其他人来设置共享或更改访问设置以查看或编辑。」

**空间邀请链接治理**：`space.invite.link.generate` + 确认标题、`invite.delete`（单个）/ `invites.delete.all`（全部，两句确认：标题 + `delete.all.invites.confirmation`）、`space.invites.pending`「待处理邀请」列表、失败分支 `invites.sent.without.access`「无法将他们添加到此空间，你需要自行与他们共享该空间。」⇒ **邀请发出 ≠ 权限生效**，两条独立通路。

## 六、空间的三种离开方式（语义严格不同）✓

| 动作 | 后果句 | 确认 |
|---|---|---|
| **删除空间** | `space.delete.description`「将**永久删除所有人的所有内容**。任何人都无法恢复」 | 文案级最重 |
| **离开空间** | `space.leave.description`「你将无法访问其所有内容，并且**无法再打开此空间**」 | `leave.alert.confirm`「是，离开」 |
| **移除空间**（仅本地） | `removing.space.wont.delete.the.space`「移除该空间**不会从你的设备中删除**该空间」；离线版 `delete.offline.space`「不会从你的磁盘中删除内容——**你需要手动执行此操作**」 | `remove.alert.title`「移除空间？」 |

⇒ **本地空间是磁盘上的真实目录**：`space.settings.show.in.finder`「在 Finder 中显示此空间」及其 description ⇒ 官方存储模型含"本地可见的文件系统落点"这一层，Web 版也保留该入口（macOS 文案）。
⇒ **所有权可以主动放弃**：`owner.remove.from.self.{button, title, description}`「移除你的所有权？/ 你确定要将角色更改为成员吗？你将无法再管理此空间。」⇒ 降级自己是一个显式、需确认的动作。
其它：`space.details` / `space.name` / `space.update.image.success` / `member.permission.updated` / `member.remove.success/failed` / `role.update.failed` / `user.is.removed.alert` / `view.all.members`。

## 六之二、`collab.space.*` 全量重读的**增量**（2026-09-27 第 22 批；§五/§六 已覆盖的不重复）

### A. ★ 空间权限**只有两档 + 访客**，且每档带一句能力边界（权威 authz 表）

| 档 | 键 | 官方能力描述 |
|---|---|---|
| **所有者** | `permission.owner` | `…owner.description`「**可以更改设置并邀请新成员**」 |
| **成员** | `permission.member` | `…member.description`「**无法更改设置或邀请新成员**」 |
| 访客 | `permission.guest` | 无描述句（与 `plans.md` 的"第四档权限轴"里的 guest 一致） |

⇒ 边界就这两件事：**改设置**、**邀请成员**。⇒ 本地若实现 editor/viewer/owner 多档，与官方**空间级只有 owner/member 两档**不一致（文档级另有查看/编辑，见 §五）——**空间级与文档级是两套权限轴**，这是最容易在实现里被合并成一套的地方。

### B. ★ 所有者可**主动放弃所有权**（自我降级，带不可逆感确认）

`permission.owner.remove.from.self.button`「移除所有权」+ `.title`「移除你的所有权？」+ `.description`「你确定要将角色更改为成员吗？**你将无法再管理此空间。**」
⇒ 这是一条独立于"被移除"的路径，且**降级后没有自助升级回来的说法**（措辞是"无法再管理"）。

### C. **邀请 ≠ 授权**（一种部分成功态）

`space.invites.sent`「邀请已发送」vs **`space.invites.sent.without.access`**「**无法将他们添加到此空间，你需要自行与他们共享该空间。**」
⇒ 同一个邀请动作有**两种成功语义**：邀请发出但没拿到空间权限。⇒ 本地若只有"邀请成功"一种回包会漏掉这条分支。

### D. 邀请链接与待处理邀请的完整 CRUD

`invite.link.generate`「生成新链接」+ `.alert.title`「生成新链接？」⇒ **链接可轮换**（旧链接随之失效，与 §五 私密链接状态互证）。
删除侧三路径：`invite.delete`（单条）/ `invites.delete`（单条，**近义重复键**）/ `invites.delete.all`「删除所有邀请」+ 两条确认文案（`.all.alert.description`「受邀用户将无法再加入此空间」与 `.all.invites.confirmation`「你确定要删除所有邀请吗？」**语义重复但措辞不同**）。
状态：`invite.pending`「待接受的邀请」/ `invites.pending`「待处理邀请」（**两键同义**）。

### E. 删除空间的后果句是**最强的不可逆措辞**

`space.delete.description`「删除此空间后，将**永久删除所有人的所有内容。任何人都无法恢复**此空间的内容。」
⇒ 与文档的"移至最近删除留 30 天"（`tags-browse.md` §一）形成**两级可逆性**：**文档可恢复、空间不可恢复且波及所有人**。⇒ 空间删除**不进回收站**。

### F. 又一类官方不一致（补 `dialogs.md` §8.1）

| 现象 | 证据 |
|---|---|
| **中英混排未翻译** | `collab.space.user.removed`「用户已从 **Space** 中移除」——同一产品另一键 `member.remove.success` 译作「用户已从**空间**中移除」 |
| **同义重复键成灾** | `member.role.update.failed`「无法更新成员角色」vs `space.member.permission.updated`「用户角色已更新」/ `member.role.updated`「用户角色已更新」⇒ **成功句有两键同文**；`invite.delete` vs `invites.delete`；`invite.pending` vs `invites.pending` |
| **单/复数靠两个键而非插值** | `member.remove`「从空间中移除」/ `member.remove.alert`「移除用户」/ `.alert.title`「移除用户？」⇒ 同一动作三条标题措辞（移除…/移除用户/移除用户？），无统一模板 |

## 七、仍未覆盖

1. 评论的**嵌套深度**（是否支持子回复到第几层）与 resolve 后是否仍可回复 —— 文案暗示可（`unresolve`）但无层级证据。
2. `presence`（同页协作在场感）只有 `realtime.thispage`「此页面」一句，未见头像堆叠/光标等文案 —— 需动态。
3. 空间级与文档级权限的**叠加优先级**（member 能编辑所有文档，但文档被单独限制时？）未在文案中。
4. `teamsettings.*` 剩余 150 条（账单、域名、团队级默认）尚未转写。
5. 本地目录与空间的物理映射（Finder 那一层）在 Web 版实际行为未验。
