# 发布与共享控制中心（`toolbar.*` 100 + `blockdetails.*` 55）

命名陷阱：`toolbar.*` **不是格式工具栏**，是**发布/共享面板**（`ShareSheet-DVttiwLH.js`，235 KB）。
证据：`_harvest/toolbar-zh.txt`（100 行全量）、`_harvest/blockdetails-zh.txt`（55 行）、`ShareSheet` chunk 的默认值对象与互斥判定代码。
标注：`✓` = 代码级证明；`~` = 文案直述。

## 一、发布设置的数据模型与默认值 ✓（权威）

`ShareSheet` 里 `const Pa = { … }` 就是**新建发布时的默认状态**，13 个字段逐条：

| 字段 | 默认 | 语义 |
|---|---|---|
| `commentLevel` | `"add"` | 访客评论权限三档：`"add"`（可添加）/ `"view"`（可查看评论）/ `"none"`。代码判定 `(level==="view" \| level==="add")` ⇒ 面板上"访客互动"分区**只在这两值下出现** |
| `enableObjectLinks` | `false` | 访客能否**跳转区块链接**（`visitors.follow.block.links`），文案强调"即使它们指向其他文档" ⇒ 这是一条跨文档权限 |
| `hideTableOfContents` | `false` | 目录显隐（默认显示） |
| `hidePresentationMode` | `false` | 演示模式显隐（默认显示） |
| `showAuthor` | `true` | 显示作者 |
| `showTitle` | `true` | 显示页面标题 |
| `showWatermark` | `true` | 显示水印（`show.created.with.craft`「页脚将提及 Craft」/ `footer.refers.not.craft`） |
| `enableSeo` | `false` | **搜索引擎索引默认关闭**（`dont.show.in.search` / `show.in.search` / `search.engine` 三句） |
| `passwordProtected` | `false` | 密码保护开关（另有 `no.password`「没有密码」） |
| `showDuplicateAsTemplate` | `false` | 访客可否**把本页当模板复制**（`visitors.can.duplicate.desc`「可以将内容复制到他们的空间中」）——默认关闭 |
| `emailBasedAccessEnabled` | `false` | 邮箱/域名访问限制 |
| `defaultDomain` | `undefined` | 域名档（见下） |
| `hideHashTagWords` | `false` | **是否在公开页隐藏 # 标签词**（100 条文案里没有对应句，纯代码字段）⇒ 第 14 个可见开关藏在代码里 |

**域名三档**（`$a()` 映射）✓：`default-craft` → "craft"（`craft.me`）/ `custom-craft`（自定义 Craft 域，需 Plus）/ `external`（外部域名，需 Business）。

## 二、三条硬互斥（这是"操作之间的交互逻辑"最有价值的部分）✓

面板对不可用的组合**不是禁用控件，而是把原因文案挂上去**：代码形态是 `外部域 ? t("toolbar.external.domain.access.restriction") : undefined`，即"不可用原因"是一段可渲染文本。

1. **外部域名 ⊄ 邮箱访问限制**：`external.domain.access.restriction`「外部域名不能与邮箱访问限制同时使用。」
2. **邮箱访问要求先退回 craft.me**：`email.access.revert.to.craft`「要启用电子邮件访问，你必须恢复到此特定文档的默认 craft.me 链接。」⇒ 与自定义域冲突；配套动作 `switch.to.craft`「切换到 craft.me」，且取消时有 `cancel.and.keep.custom.domain`「取消并保留自定义域」⇒ **两个损失各有对应按钮文案**。
3. **搜索引擎索引 ⊄ 密码**：`enable.search.engine.desc`「启用后，此页面将显示在搜索引擎结果中，例如 Google。**只有在没有提供密码的情况下才有效。**」

另有破坏性操作的后果预告：`remove.all.question`「你确定吗？所有人员和域限制都将被移除，**链接将向所有人开放**，直到再次更改。」⇒ "移除所有"的默认结果是**公开**，必须在确认文案里说穿。

## 三、访问控制的三种粒度 ✓

| 粒度 | 入口 | 事实 |
|---|---|---|
| 个人 | `add.people` / `people.with.access`「有访问权限的人」/ `view.and.add`「查看和添加」/ `restrict.individuals` | 支持**逗号分隔粘贴批量**：`add.emails.list`「添加单个电子邮件或粘贴逗号分隔的列表」；失败两句 `add.email.access.fail` / `add.email.domain.access.fail` |
| 域名 | `add.email.domain` / `restrict.email.domains` / `all.x.email.addresses`「全部 [0] 个电子邮件地址」 | 域名级白名单（邮箱后缀），与个人级并列 |
| 链接 | `access.link.view` / `access.link.edit`（见 `collab.md` §一）+ `password` + `expiration` | 密码三件套：`add.password` / `change.password` / `enter.password` / `no.password`；`password.desc`「设置密码后，只有拥有密码的人才能访问此链接的内容。」 |

**到期是独立一轴** ✓：`expiration` / `expiration.date` / `expire.never`「永不过期」/ `expire.on`「于 [0] 过期」/ `never` ⇒ 链接带 TTL。
**邀请的两条输入路径**：`click.to.invite`「点击邀请」（从候选里点）vs `keep.typing.to.invite`「继续输入以邀请」（键入新对象）⇒ 一个控件两种提交语义。
**审批入口在面板里**：`someone.wants.to.do`「[0] 想要 [1]」⇒ 请求-审批（`collab.md` §五）的可见位置。

## 四、访客互动分区（5 组开关）✓

`user.interactivity` 分区标题 + 逐个：可复制（`visitors.can.duplicate(.desc)`，成对给出允许/不允许两句）、可跳转区块链接（`follow.block.links` 有 **4 句**：开关名 + desc + allowed + not allowed，其中 allowed/not allowed 措辞不是对称的「可以查看链接的页面」/「无法访问链接的页面」）、可查看评论（`view.comments`）、可添加评论（`add.comments`）、可当模板（`duplicate.allowed`「将此页面用作模板」）。
⇒ **每个开关都写了"允许/不允许"两版描述**，即界面在开关两侧都有说明，不是只有 tooltip。

## 五、视觉选项与导出（发布面板内）✓

`visual.options` 分区：作者、标题、目录、演示模式、"Created With Craft" 页脚五组，每组同样是成对句（`show.x` + `x.shown` / `x.hidden`）。
`advanced.options` 分区：自定义网址（`customize.url`）、路径（`path`、失败句 `update.path.fail.title`）、二维码共享（`share.as.qr.code`）、搜索引擎、外部域信息（`using.external.domain`、`learn.more.craft.domains`）。
**导出格式在此面板列出**：`docx`「Microsoft Word」/ `word`「MS Word」/ `pdf` / `markdown` / `textbundle` / `print` 打印 / `workflowlinks`「工作流程链接」（**iOS Workflow 集成**，本地概念里不存在）。
`publish.preview.subtitle`「使用秘密链接将你的文档发布到网络并控制谁可以看到它」= 面板的一句话定义；`create.document.from.template` 与 `select.space.create.template`「选择要创建模板的空间」⇒ **发布面板兼任"把本文档变成模板"的入口**，且模板归属空间（不是文档）。
`style.and.inspector`「样式与检查器」= 面板里跳编辑器的动作。
`tasks.placeholder`「本文档中的任务将出现在此处。」= 发布页的**任务区空态** ⇒ 公开页会渲染文档内任务清单。

## 六、`blockdetails.*`：块详情面板（55 条）✓

| 分区 | 内容 |
|---|---|
| **历史版本** | `backups`「历史版本」⇒ 版本入口在块详情面板（与 `plans.md` 的 30/180 天备份额度是同一功能的两端） |
| **反向链接 / 提及** | `mentions.links.to.this`「@链接到此页面」、`loading.links`「正在加载此页面的链接…」（**独立加载态**）、`collapse.all` / `expand.all`、**三种排序**：按字母 / 按创建日期 / **按链接数** ⇒ 反链是一等实体，可聚合排序 |
| **代码块** | `edit.code` / `copy.code` / `split.view`「拆分视图」/ `full.screen.mode` / `close.preview`、`language` + `search.languages`「搜索语言」（**可搜索的语言选择器**）、`theme` + `search.themes`（**可搜索的主题选择器**） |
| **PDF 导出选项** | 纸张三档 `A4` / `信纸(US Letter)` / **`动态(dynamic)`**；开关：深色模式、显示页码、显示水印。键名带 `ios.` 前缀 ⇒ iOS 与 Web 共用同一 i18n 命名空间 |
| **分享图片面板** | `share.image.panel.config`：**字体大小 3 档**（小/标准/大）× **页面大小 4 档**（适应文档 / 横排 / 竖排 / 正方形）⇒ "把文档渲染成分享卡片"是独立子系统，有自己的配置面板 |
| **插入侧栏** | 5 个分区：`insert`（副标题「将任何项目拖放到文档中」）/ `shortcuts` / `lists` / `media` / `pageinfo`；另有 `shortcuts.markdown`「Markdown 快捷方式」 |
| **页面设置** | `pagesettings.spelling`「拼写检查」是**页面级**设置（不是全局） |
| **空态与引导** | `placeholder.empty.desc.mac`「页面预览将显示在此处。单击以添加内容。」（**键名带 `.mac`** ⇒ 平台分文案）、`placeholder.title`「页面标题」、`press.slash.command`「按 "/" 快速操作」、`placeholder.link.paste`「粘贴链接，例如 www.baidu.com」（**官方中文示例用的就是 baidu**）、`toggle.empty`「空折叠块」、`bottom.addContent`「+ 内容」、`bottom.comment`、`insert.page.break`「插入分页符」、`reposition.or.crop.image`「重新定位或裁剪」 |
| **登录态显示** | `you.are.logged.in.as.strong`「你已以`<strong>[0]</strong>`的身份登录」⇒ 文案内嵌 HTML 加粗 |
| 其它 | `connect.to`「连接到 [0]」（区块链接目标选择）、`more.faq` |

## 七、仍未覆盖

1. `expirationDate` 的具体档位（几天/自定义）未在文案中，只有 `expire.on [0]` 结果句。
2. `hideHashTagWords` 的界面标签（13 个字段里唯一没有对应文案的）——需动态在面板上找。
3. 密码保护与邮箱访问、到期三者叠加时的优先级未见约束代码。
4. 二维码生成后是否可下载/重生成。
5. 发布页对**集合/任务/白板**的渲染规则（只知道任务区有空态）。
