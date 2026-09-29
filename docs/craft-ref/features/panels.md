# 面板与微交互规格（官方文案逐条反推）

来源：`_harvest/i18n-zh.tsv`（官方中文语言包全量）。这些命名空间是**界面局部**的，之前的功能矩阵按大轴归类时漏掉了细节；本文件逐条转写为可实现规格。全部为 `~`（官方文案直述，行为未做指纹验证）。

## 一、右栏·插入面板（`blockdetails.sidebar.*`）

- 三个分区：**插入**（`sidebar.insert`）、**列表**（`sidebar.lists`）、**媒体**（`sidebar.media`）。
- 插入面板有两个子视图：`插入` 与 **`快捷方式`**（`sidebar.insert.shortcuts` = "快捷方式"；`blockdetails.shortcuts.markdown` = "Markdown 快捷方式"）→ **插入面板里可以直接看 markdown 快捷规则**（本地完全没有这层展示）。
- 副标题文案「**将任何项目拖放到文档中**」（`sidebar.insert.subtitle`）→ 插入面板项**支持拖放进入文档**，不只是点击。
- 提示：`blockdetails.press.slash.command`「按 "/" 快速操作」。
- `blockdetails.bottom.addContent`「+ 内容」与 `blockdetails.bottom.comment`「评论」→ 页面底部有固定动作条（添加子内容 / 评论）。

## 二、右栏·反向链接（`mentions.*`）

- 标题语：`@链接到此页面`（`mentions.links.to.this`）、加载态「正在加载此页面的链接…」。
- **三种排序**：按字母顺序 / 按创建日期 / **按链接数**。
- **两个批量动作**：全部展开 / 全部折叠（`mentions.expand.all` / `collapse.all`）。
→ 本地 `BacklinksPanel` 只有列表，无排序、无折叠、无加载态（gap G63）。

## 三、右栏·分享成图片（`share.image.panel.config.*`）—— 此前完全未知的功能

| 配置项 | 官方值 |
|---|---|
| 字体大小 | 大 / 标准 / 小 |
| 页面大小 | 适应文档 / 横排 / 竖排 / 正方形 |

另有 `share.secretlink.comments.add`「添加评论」→ **私密链接可开启评论**。
→ 官方支持把文档渲染成**分享卡片图片**并可调版式（本地只有 Markdown/HTML 导出，G64）。

## 四、页面设置（`pagesettings.*` / `language`）

- **拼写检查**开关 + **语言**选择 + 「搜索语言」→ 文档级拼写检查与其语言选择器（本地零，G65）。
- `blockdetails.theme` / `themes` / `search.themes`「搜索主题」→ 主题可搜索。
- `show.document.title`「显示文档标题」→ **页面级"是否显示标题"开关**（本地无）。

## 五、图片编辑（`reposition.or.crop.image`）

「重新定位或裁剪」+ `select.an.image`/`select.image`/`image-export-button` → **块级图片支持重定位与裁剪**（本地 `imageBlock` 无裁剪 UI，G66）。

## 六、查找与替换（`find.*`，14 条完整规格）

| 能力 | 官方文案 |
|---|---|
| 面板名 | 查找和替换 |
| 两种模式 | **文本**（`find.text` / `find.text.in.doc` / `find.text.on.page`）与 **正则**（`find.regex` / `find.regex.in.doc` / `find.regex.on.page`） |
| 两种范围 | **在文档中** 与 **在页面上** |
| 导航 | 查找下一个 / 上一个，带命中序号（「下一个匹配项 [0]」） |
| 计数 | 「[0] 结果 [1]」 |
| 替换 | 「替换为……」 |

→ 本地完全没有（G12 现在有了可实现规格：模式 × 范围 × 命中导航 × 替换）。

## 七、统计（`stats.*`）

- 维度：**字数 / 字符数（不包括空格）/ 区块 / 阅读时间**。
- 范围：**这一页 / 选择 / 完整文档** 三档。
- **付费墙**：「字数、字符数、区块数量及阅读时间统计仅对 **Plus** 订阅用户开放」。
→ 本地只有页级字数/字符（`InfoTab` 统计），缺"选择/完整文档"范围切换（G67）。

## 八、动态与版本（`activity.*`）

- 「动态」是独立屏（侧栏 `activity`），底部有「较早」分组。
- 条目文案「**[0] 项变更**」，且官方为 CLDR 复数写了 one/two/few/many/zero **全部档位** → V4 实测的「2 项变更」出处即此。
- 「目前显示过去 [0] 天。」= 活动流有**时间窗口**参数（与备份 30/180 天档位一致）。
- 「还没有任何保存的版本。」= 版本空态文案。

## 九、任务与日历的界面开关（`show.*` + 契约）

- `show.completed.tasks`「显示已完成的任务」→ 就是 API 契约里的 `showCompletedTasks`，**界面确实有这个开关**（契约与 UI 双向印证）。
- `show.1.more.item` / `show.x.more.items` / `show.more` → 列表折叠展开带计数（本地"加载更多"缺失，见既有 gap）。

## 十、通用微文案档位（实现时必须成对存在）

- 计数：`[0] 个文档` / `[0] 个文件夹` / `[0] 个项目` / `[0]/[1] 个文档` / `已选 [0] 项` / `[0] 个结果`；**Free 档限「5 个私人工作区」**（`x.private.spaces`）。
- 删除确认档位：`删除？` / `删除 [0]？` / `删除 1 个文档？` / `删除 [0] 个项目` / `删除页面` / `删除文件夹` / `删除文档` + 「你确定吗？你无法撤销此操作。」
- 相对时间词表：刚刚 / 1 分钟前 / 1 小时前 / 1 天前 / 本周 / 本周 / 上周 / 周一…周日。
- 空态与异常：`暂无文档` / `暂无结果 [0]` / `未找到任何建议` / `没有可用的预览` / `无权访问` / `没有电子邮件` / `没有可邀请的新成员`。
- 保存：`保存更改` / `保存文件`；成功移除回显：「已成功从"[1]"中移除"[0]"」。
- 其它：`打开助手`、`在浏览器中打开`、`无需信用卡`。

## 与动态验证的关系

本文件全部来自官方文案，**能直接当作实现规格**（模式、档位、文案），但每档的**触发路径与状态迁移**仍要按 `_harvest/todo-actions.md` 动态确认（例如"全部折叠"到底在面板的哪个按钮、正则模式是否有高亮差异）。

## 仍未采到

- 每个面板项的**触发路径与状态迁移**（哪个按钮开哪层、切换后焦点落点、是否即时持久化）—— 文案只证明"存在这一档"。
- 面板几何（宽度、行高、分组间距）不在本文件范围内，见 `../tokens.md` 与 `../screens.md`。
- 档位背后的**远端配置值**（如各类上限的具体数字）未采。

## 八、块右键（`⋮`）菜单全 30 项（按块类型封闭枚举）

来源：埋点 `BlockContextMenuOptionClicked{item:"…"}` 的 props 值全集（`_harvest/js` 全量扫描，vendor 除外）。埋点 props 是**功能面的权威清单**：没有 UI 入口的动作不会出现在这里。

| 块类型 | 菜单项 |
|---|---|
| 代码块 | `openCodeLanguage`（语言）· `openCodeTheme`（**主题单独一项**，对应 21 档主题表）· `goCodeFullscreen` · `copyCode` |
| 图片块 | `imageToAutoStyle` · `imageToLargeStyle` · `imageToFillStyle` · `imageToFitStyle` ⇒ **4 档尺寸/适配**（与 `pd` = `scaleAspectFill/scaleAspectFit/center` + auto 交叉验证一致） |
| 链接预览 | `previewToSmallStyle` · `previewToRegularStyle` · `previewToCardStyle` · `previewToEmbedStyle` ⇒ **与 `Xn`/`LayoutStyle` = `regular/small/card/embed` 逐档吻合**（两处独立证据互证）· `renameLink` · `reloadLinkInfo` · `turnIntoTextLink` · `turnToRichLink` · `openLinkInNewTab` · `copyLinkUrl` |
| 页面/卡片 | `openPageCardStyle` · `turnIntoPageCard` · `turnIntoRegularPage` |
| 白板 | `whiteboardFullscreen` · `reloadWhiteboard` |
| 表格型文件 | `turnIntoCollection` ⇒ **CSV 文件块一键转集合**（见下） |
| 通用 | `addComment` · `copyLinkToBlock` · `delete` · `download` · `openInNewWindow` · `addContent` |

**CSV → 集合**（此前完全没记的功能）：`Bd.isCsvFileBlock(t)` 守卫（非 CSV 块直接返回），点击后 `Me().logEvent("turnCsvIntoCollection",{blockId, state:"start"})` ⇒ **长任务埋点带 `state` 阶段**（start/…），集合名取 `fileName` 去掉扩展名，正文走 `vH(...).proxyUrl(...)` 代理下载。

⇒ 本地 `panels.md` §一~七 是面板与微文案，本节补上"块级动作面"。与 `gap.md` 的关系：本地块右键菜单（`InsertTab`/侧栏树菜单之外）缺 `imageTo*` 四档、`previewTo*` 四档、`turnIntoPageCard`/`turnIntoRegularPage`、`openCodeTheme`、CSV 转集合。
