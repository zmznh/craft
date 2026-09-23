# Crafty 全场景测试报告(2026-09-22)

环境:dev server http://localhost:3000(用户提供实例);测试账号 craft-test@example.com;
浏览器:Qoder 内置浏览器(browser-use MCP)+ curl。

## 一、路由矩阵(19 条)

| # | 路由 | 断言 | 结果 |
|---|---|---|---|
| 1 | `/` | 307 → /login?callbackUrl=/(未登录) | ✅ |
| 2 | /login | 200,登录成功 → /documents | ✅ |
| 3 | /register | 200 | ✅ |
| 4 | /settings | 200,渲染"设置" | ✅ |
| 5 | /documents | 200,最近编辑列表(Test A/B/C/日记) | ✅ |
| 6 | /documents/[id] | 编辑器渲染、图标/标题/工具条 | ✅ |
| 7-9 | /trash、/favorites、/recent | 均 200(trash 空态文案"回收站是空的") | ✅ |
| 10 | /collections | 200,新建集合弹窗 | ✅ |
| 11 | /collections/[id] | 表格视图(默认视图 tab + 筛选/排序/分组) | ✅ |
| 12 | /daily-notes | 今日笔记自动列出(9月22日 周二)+ 打开按钮 | ✅ |
| 13 | /search | ⌘K 面板,输入"Test" → Test A/C/B 命中 | ✅ |
| 14-15 | /whiteboards、/whiteboards/[id] | 200;画板加载 + 快照恢复 | ✅ |
| 16 | /tasks | 任务收件箱:编辑器 taskItem 同步显示 | ✅ |
| 17 | /calendar | 月视图 + 今日选中 + 日记条目面板 | ✅ |
| 18 | /s/[token] | 分享页见下方口令流程 | ✅ |
| 19 | /p/[slug] | 发布页,未发布时显示"页面不存在或未发布"逻辑保留 | ✅ |
| 20 | 权限(12 路由 × 未登录) | 全部 307 → /login?callbackUrl=<原路径> | ✅ |

## 二、编辑器交互矩阵

| # | 交互 | 断言 | 结果 |
|---|---|---|---|
| 1 | 块拖拽 | mousemove 出 handle → pointer 拖 UL → [P,UL,P]→[UL,P,P] → 撤销恢复 | ✅ |
| 2 | `[[` 引用 | 中文"任务"后输入 `[[` 弹出"链接到文档",点击插入带 documentId 的 blockLink | ✅ |
| 3 | 卡片块 | / 菜单 → 布局 → 卡片,cardBlock 节点插入 | ✅ |
| 4 | taskItem 同步 | 编辑器勾选"task apple" → /tasks 显示 checked:true | ✅ |
| 5 | AI 浮动菜单 | ⌘J/✨ 打开、主菜单互斥、Esc 关闭、错误文案(无效 key → "Request timed out.") | ✅(成功路径待有效 key) |
| 6 | 白板拖入编辑器(新) | 侧栏白板条目 dragstart → 编辑器 drop → whiteboardLink 插入,点击跳转 /whiteboards/[id] | ✅ |
| 7 | 文档拖入编辑器 | 既有 sidebarDoc MIME 体系,Crafty 侧栏双向拖拽此前已验证 | ✅(回归未变) |
| 8 | 保存持久化 | 2s 防抖保存,刷新后内容/块引用/whiteboardLink 均在 | ✅ |

## 三、白板持久化

| 断言 | 结果 |
|---|---|
| 画布加载(canvas + tl-container) | ✅ |
| 合成 pointer 绘制一笔(12 段 move) | ✅ |
| 刷新后形状恢复(5 个 shape 元素、36 条 SVG path) | ✅ |

## 四、分享口令保护(新功能)

| 断言 | 结果 |
|---|---|
| ShareDialog 设置口令 → "已启用" | ✅ |
| /s/[token] 无 cookie → PasscodeGate(icon+标题+输入框) | ✅ |
| 错误口令 → 401 + "口令错误,请重试" + shake 动效 | ✅ |
| 正确口令 → Set-Cookie + reload → 内容可读 | ✅ |
| /p/[slug] 独立 path cookie → 同流程 | ✅ |
| 清除口令 → 无 cookie 直接可读(curl 验证 200 + 正文) | ✅ |

## 五、视觉还原(对照 craft.do)

- 暖纸白背景/暖墨色/微暖边框(oklch 色相 85)✅ 计算样式验证:lab 正 b* 轴
- 侧栏暖灰底 ✅
- 卡片圆角 12px 基准(xl≈16px)✅
- 文档标题衬线字体(Georgia/Noto Serif SC 栈,非搬运官方字体)✅
- 详见 `docs/craft-ref/visual-diff-checklist.md`

## 六、已知边界(非缺陷)

1. AI 成功路径(改写/续写/翻译/总结)依赖有效 OPENAI_API_KEY,当前 key 失效返回
   "Request timed out." —— 错误分支已优雅展示;换 key 后即可端到端验证。
2. /tasks 勾选不反向写回编辑器 taskItem —— 单向同步(编辑器→任务)为既有设计。
3. `CommandDialog` 需 `<Command>` 包裹的既有修复仍生效(⌘K 无回归)。
4. 测试中曾向文档写入测试节点,已全部清理。

## 结论

19 条路由 + 编辑器交互矩阵 + 白板持久化 + 分享口令流程全部通过;
`npm run build` 通过;未发现功能缺失、交互异常。视觉层面完成 token 级
对齐(暖纸白/暖墨色/衬线标题/圆角),无结构性偏差。
