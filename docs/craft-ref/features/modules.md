# Craft 功能模块清单（200 个懒加载 chunk 去重后的 96 个模块）

来源：`_harvest/all-chunks.txt`（从 `index-DiTmKH3z.js` 的动态 import 表提取，200 个 chunk 文件名去掉 hash 后归一）。
用途：**功能面完整性检查表**——产品里每一个可延迟加载的功能都对应一个模块名，凡是"官方有模块、本地没实现"的行都是潜在缺口。置信：模块存在 = `✓`（文件名即证据）；其内部行为 = `~` 或 `?`。

## 一、编辑器与块

| 模块 | 功能推断 | 备注 / 本地状态 |
|---|---|---|
| `DocumentContainer` · `EditorPopup` · `EditorReadOnlyBlockPreview` | 文档容器、编辑器弹层、**只读块预览** | 本地公开页整页只读，无"块级只读预览"（G-候选） |
| `BlockLinkEditor` · `BlockLinkMenuQuickOpenWrapper` | 块链接的编辑与快速打开菜单 | 本地有 blockLink 节点 ✓ |
| `TextEditor` `NumberEditor` `DateEditor` `SelectEditor` `MultiSelectEditor` `PersonEditor` `PhoneEditor` `EmailEditor` `UrlEditor` `RelationEditor` `FormulaInput` `CalculationsRow` `SimpleTextInputEditor` `SidebarAttachments` | **集合列类型专用编辑器 13 种 + 汇总行 + 附件侧栏** | 与 `gap.md` G41 对应；本地无汇总行、类型清单无权威源 |
| `PageCardMixer` · `Toggle` · `CodeEditorWrapper` · `EditorMathFormulaRender` | 卡片混排、折叠块、代码块包装、公式渲染 | 本地 ✓（公式 ✓ 代码 ✓ 卡片 ✓ 折叠 ✓，但缺"全部展开/收起"） |
| `UnsplashSearchPanel` · `ImageEditorPopup` · `DoodleAssets` · `EmojiDataSource` · `themePreviews` · `StyleGalleryPopup` | Unsplash 搜索、图片编辑弹窗、涂鸦素材、emoji 数据源、主题预览、**样式图库** | 本地明确跳过 Unsplash（**应改判为缺口**，G17/G54）；样式图库近似 |
| `MarkdownExportApi` · `DocxExportApi` · `vendor-craft-export` · `ShareSheet` | Markdown / DOCX 导出 + 导出总面板 | 本地 4 格式，缺 DOCX/PDF/TextBundle/zip（G22） |
| `OnboardingImportClient` · `AiGeneratedDocumentImportPopup` | 导入向导、AI 生成文档的导入弹窗 | 本地仅 Markdown 导入（G22） |
| `blurhashEncoder.worker` | **图片 blurhash 模糊占位**（worker 里生成） | 本地图片加载无 blurhash → 观感差异（G55 候选） |
| `HTML5DnDProvider` · `TouchDnDProvider` · `ClipboardBoundary` | 桌面 HTML5 / 触摸 Touch 两套 DnD backend；剪贴板边界处理 | 本地单一拖拽实现，触摸端未分流（G56 候选） |
| `TaskViews` · `TasksBrowseUpcomingView.utils` · `NewTaskPopup` · `Calendar` | 任务视图组、Upcoming 浏览、新建任务弹窗、日历屏 | 与新 task 契约 `inbox/today/upcoming/all` 对应（G46） |
| `useCustomPrompts` · `AIChatPopup` · `ImagineView` · `Playground` | AI 自定义提示、AI 聊天弹层、Imagine(MCP/API) 视图、**Playground 试验场** | 本地无自定义提示与 Playground（G49） |
| `Members` · `MoveSpaceToTeamPopupContent` · `AllSpacesSidebar` · `MySpaces` · `SpacesClientMini` | 成员管理、**把空间迁移到团队**、全部空间侧栏、我的空间、空间迷你客户端 | 本地有 DocumentMember，无空间级组织（G57） |
| `SideMenuCommentsPage` · `FloatingThreadWindow` | 评论的**侧栏整页**与**浮动线程窗口**两种形态 | 本地评论只挂在信息 tab 内（G58） |
| `ShareSheet` · `PublishedContentSettingsButton` · `Integration` · `LazyMsalProvider(.constants)` | 分享面板、发布内容设置按钮、集成、Azure MSAL 登录 | 发布设置与集成本地为静态壳（G24） |
| `Settings` · `PreferencesPanel(+WithProfilePicture)` · `RenderOptionsPanel(.utils)` · `SubscriptionsPanel` · `UpgradePrompt` · `SubscriptionPopupContainer` · `SubscriptionCheckoutStartedPopup` · `useTeamSubscriptionDataFromRQ` | 设置与偏好、**渲染选项面板**、订阅与升级流程 | `RenderOptionsPanel` 说明"展示/渲染"是独立设置面板（本地展示项零散） |
| `PerformanceTab` · `SyncLogTab` · `BrowseSyncTab` · `DebugPrimitives` · `IncompatibleBrowserCheck` | **同步日志、性能面板、浏览同步、调试原语、浏览器兼容检查** | 官方有一整块可观测性 UI，本地完全没有（G59，且对应 i18n `diagnostics.*`、`error.report.*`） |
| `ExcalidrawPreview(.utils)` · `useExcalidrawAssets` · `ExcalidrawFocusMode` · `WhiteboardFocusMode` · `CodeEditorFocusMode` · `FocusModeToolbar` | 白板预览与资源、**三种专注模式**（画布/白板/代码）+ 专注模式工具条 | 本地零专注模式（G11），且官方是"多场景各自进入"，不是一键全局 |
| `EasterEgg` · `HelpButtonBody` · `MoveToFolderDialog` · `EditFolderDescriptionPopup` · `TemplatePicker` · `FolderIconAssetDataSource` | 彩蛋、帮助按钮内容、移动到文件夹、文件夹描述弹窗、模板选择器、文件夹图标资源 | 文件夹描述与图标资源本地部分具备 |

## 二、图标/资源类模块

`Eye` · `TrayEmpty` · `PlusCircle` · `SunHaze` · `NumbersRectangle` · `SquareOnSquare` · `DoodleAssets` · `FolderIconAssetDataSource` · `EmojiDataSource` —— 单个图标或素材被拆成独立 chunk（按需加载图标），说明官方图标是**自绘集**且总量大（另有 `res.craft.do/assets/icons/n/all.json` 4.7 MB 图标清单，本地已落盘未解析）。

## 三、由模块清单新暴露的缺口（待并入 gap.md 编号）

| 候选 | 官方事实（模块证据） | 本地 |
|---|---|---|
| G54 | Unsplash 搜索面板是正式功能模块 | 明确跳过且不出入口 → 与"1:1 复刻"标准冲突，需重新决策 |
| G55 | blurhash worker：图片先显示模糊占位再清晰 | 无 |
| G56 | 桌面 / 触摸两套 DnD backend 分流 | 单实现，触摸端未验证 |
| G57 | 空间级管理（全部空间侧栏、我的空间、空间迁移到团队） | 无空间概念 |
| G58 | 评论两种形态：侧栏整页 + 浮动线程窗口 | 仅信息 tab 内嵌 |
| G59 | 同步日志 / 性能 / 诊断 / 浏览器兼容检查 四块可观测 UI | 无 |
| G60 | 三种 FocusMode（画布 / 白板 / 代码）+ 专注模式工具条 | 无（G11 的细化：不是一键全局，而是分场景） |
| G61 | 按需加载的图标资源体系（含 4.7 MB 图标清单 JSON） | lucide + 自绘近似（有意偏差，但**清单已可解析**，若要贴近可逐项对齐） |

## 仍未覆盖

模块名只证明"存在这块功能代码"。每个模块的**行为细节**（参数、状态迁移、失败分支）需要：① 逐模块读 bundle 逻辑（静态可做，成本高）；② 动态进屏验证（需连接器）。当前已深挖的是 AI/Imagine 契约（`api-contract.md`）与 DnD 组件层（`ui-affordances.md`）。
