# Crafty 手工验收清单（验收第 3 档）

自动化两档（`e2e/visual.spec.ts` 截图基线 + 功能交互用例）只能证明"像素没漂"和"流程走得通"，
不能证明"和 craft.do 一样"。本清单是第三档：人工逐屏比对 + 自动化判不了的观感/手感项。

- 本地截图来源：`e2e/visual.spec.ts-snapshots/`（42 个视图状态 × 3 档宽度 = 126 张基线，文件名带
  `-win32` 平台后缀）；另有 9 张人工留档在 `docs/craft-ref/local-*.png`。
- 参考截图：**已用你登录态的 Edge 采到 5 屏 desktop**
  （`docs/craft-ref/ref-{all-documents,tasks,calendar,connections,document}-desktop.png`，1910×925；
  含个人内容，已 `.gitignore`，只留本地）。官方 token 已从 `index.css` 全量解出，对照表见 `tokens.md`。
  下表"参考"列：`✅` = 有官方 desktop 截图可直接并排比对，`⏳token` = 只能按 token 比对。
- tablet / mobile 档官方截图仍缺：`viewport.set()` 静默无效，需另开窗口尺寸重采（`capture.md` 路径 B）。
- 勾选含义：人眼在该分辨率下确认布局/留白/图标语义/动效；只看自动化通过不算勾。

## 一、逐屏对照表

宽度档：`desktop 1440×900` / `tablet 768×1024` / `mobile 390×844`；主题档：`light` / `dark`。
下表每行覆盖 3 档 × 2 主题，人工至少要亲自过 desktop 与 mobile 各一次、dark 至少一次。

| # | 屏 | 路由 | 本地基线前缀（`{theme}-`，×3 档） | 参考 | 人工判断点（自动化判不了的） | 有意偏差 | 状态 |
|---|---|---|---|---|---|---|---|
| 1 | 登录 | `/login` | `login` | ⏳待采 | 输入框聚焦环、提交失败抖动节奏 | 无 | ☐ |
| 2 | 注册 | `/register` | `register` | ⏳待采 | 同上 + 密码规则提示位置 | 无 | ☐ |
| 3 | 文档首页（含侧栏树） | `/documents` | `app-documents` | ✅ ref-all-documents | 树层级缩进量、拖拽插入指示线、hover 底色 | 图标为 lucide 近似 | ☐ |
| 4 | 最近 | `/recent` | `app-recent` | ⏳待采 | 空态插画留白、卡片阴影高度 | 无位图插画，用 CSS 近似 | ☐ |
| 5 | 收藏 | `/favorites` | `app-favorites` | ⏳待采 | 取消收藏后行的消失方式 | — | ☐ |
| 6 | 每日笔记 | `/daily-notes` | `app-daily-notes` | ⏳待采 | 日期分组标题字重与间距 | — | ☐ |
| 7 | 任务 | `/tasks` | `app-tasks` | ✅ ref-tasks | 勾选动效、提醒/循环徽标可读性 | — | ☐ |
| 8 | 日历 | `/calendar` | `app-calendar` | ✅ ref-calendar | 月格行高、今日标记、条目 chip 溢出 | 日详情 Sheet 未做（见偏差表） | ☐ |
| 9 | 模板 | `/templates` | `app-templates` | ⏳待采 | 模板卡缩略比例 | — | ☐ |
| 10 | 搜索 | `/search` | `app-search` | ⏳待采 | 命中高亮色、"加载更多" 反馈 | — | ☐ |
| 11 | 设置 | `/settings` | `app-settings` | ⏳待采 | 分组分隔线强度、开关动效 | — | ☐ |
| 12 | 回收站 | `/trash` | `app-trash` | ⏳待采 | 恢复/彻底删除的确认层级 | — | ☐ |
| 13 | 集合列表 | `/collections` | `app-collections` | ⏳待采 | 集合卡封面色带 | — | ☐ |
| 14 | 白板列表 | `/whiteboards` | `app-whiteboards` | ⏳待采 | 新建白板卡比例 | — | ☐ |
| 15 | 文档详情（编辑器） | `/documents/[id]` | `document-detail` | ✅ ref-document | 标题衬线字号、正文 16/1.7 行距、段间距节奏 | Inter 即官方字体；衬线栈为近似 | ☐ |
| 16 | 右栏·插入 | 同上，tab 插入 | `document-tab-插入` | ✅ ref-document | 分类分组留白、图标可辨识性 | — | ☐ |
| 17 | 右栏·格式 | 同上，tab 格式 | `document-tab-格式` | ⏳待采 | 色块圆点尺寸与选中标记 | — | ☐ |
| 18 | 右栏·样式 | 同上，tab 样式 | `document-tab-样式` | ⏳待采 | 封面/Washi 预览缩略、宽页切换瞬时布局 | 主题位图为 CSS 渐变近似 | ☐ |
| 19 | 右栏·信息 | 同上，tab 信息 | `document-tab-信息` | ⏳待采 | 属性行标签对齐、协作者头像堆叠 | — | ☐ |
| 20 | 集合详情（表格视图） | `/collections/[id]` | `collection` | ⏳待采 | 表头粘性、单元格编辑态边框、首列 sticky | — | ☐ |
| 21 | 白板画布 | `/whiteboards/[id]` | `whiteboard` | ⏳待采 | 工具栏图标、笔迹压感手感 | tldraw 水印按许可保留 | ☐ |

另有 3 类窄屏形态已在基线里，但**必须人工在真机/模拟器上过一遍**（截图看不出触摸目标与滚动惯性）：
移动抽屉（左滑出侧栏）、底部 Sheet 面板（插入/格式，样式与信息收进 `⋯`）、编辑器 16px 防 iOS 聚焦放大。

## 二、tokens 偏差表

`craft.do` 列取自 2026-09-22 对官方营销页的 `getComputedStyle` 实测（`visual-diff-checklist.md`）；
登录后界面的对应值待外网恢复后补采。Δ 为本地与基准的可量化差。

| 维度 | craft.do 基准 | 本地 token | Δ | 处置 | 有意偏差 |
|---|---|---|---|---|---|
| 页面背景 | `rgb(252,249,247)` | `--background: oklch(0.982 0.005 85)` | ≈同 | 已对齐 | 否 |
| 正文墨色 | `rgb(3,3,2)` | `--foreground: oklch(0.16 0.008 85)` | ≈同 | 已对齐 | 否 |
| 主按钮 | `rgb(3,3,2)` + 白字 | `--primary: oklch(0.18 0.008 85)` | 略浅 | 已对齐 | 否 |
| 边框 | 微暖灰 | `--border: oklch(0.92 0.004 85)` | ≈同 | 已对齐 | 否 |
| 卡片圆角 | 16px | `--radius: 0.75rem`（lg 12 / xl 16.8px） | ≤1px | 已对齐 | 否 |
| CTA 圆角 | 药丸（全圆角） | 产品内 `rounded-md` | 形态不同 | **不改**：药丸是营销页语言，产品内按钮保持中等圆角 | ✅ 有意 |
| 标题字体 | Untitled Serif 48px | `font-serif` = Georgia/Times/Noto Serif SC，`text-3xl`(30px) | 字体不可搬运；字号更小 | 系统衬线栈近似 | ✅ 有意（版权） |
| 正文字体 | Untitled Sans 16px | `Inter` 16px / `line-height 1.7` | 字体近似，字号同 | Inter 为最接近的开源替代 | ✅ 有意（版权） |
| 等宽 | 专有 mono | `--font-mono` 系统等宽栈 | 字体近似 | 不搬运 | ✅ 有意 |
| 图标 | 专有图标集 | lucide + 自绘（`scripts/gen-icons.mjs` 出 favicon/manifest 图标） | 语义近似 | 不搬运 | ✅ 有意（版权） |
| 主题背景/Washi 位图 | 专有素材 | CSS 渐变/图案近似 | 纹理差异 | 不搬运 | ✅ 有意（版权） |
| 暗色主题 | 未公开基准 | `--editor-bg: oklch(0.19 0.005 260)` 等 | 无对照 | 保持现状，待基准 | ⏳ 待采 |
| 动效时长 | 转场约 200–300ms | `--transition-fast 100 / base 150 / slow 250ms ease` | 区间内 | 已对齐 | 否 |
| 侧栏宽度 | 待采 | `--layout-sidebar-w: 260px`（≤767 变抽屉 `min(20rem,88vw)`） | — | 结构已对齐，数值待校 | ⏳ 待采 |
| 右栏宽度 | 待采 | `--panel-w: 300px`（≤1023 转底部 Sheet） | — | 同上 | ⏳ 待采 |
| 正文measure/内边距 | 待采 | `--editor-measure: 720px`、`--editor-pad-x: 3rem → 2rem → 1rem` | — | 同上 | ⏳ 待采 |

## 三、功能/交互层"只有人工能确认"的清单

1. **拖拽手感**：侧栏文档拖进编辑器/集合、DragHandle 抓取首块、拖入分栏列内、看板卡片跨列。
   自动化只断言了结果，插入指示线的出现时机与抖动需要手感判断。（DragHandle 本轮修掉两个真缺陷：
   指针移向把手时把手被隐藏、首块因 `posAtDOM` depth=0 而抓不住。）
2. **中文 IME**：拼音候选期间的 inputRule 不应误触发（`#`、`- `、`[] `、`~~`、`==`、`$x^2$`、`..-`/`.--`/`---`/`=-`）。
3. **撤销/重做跨结构**：删除分栏、把表格拆成段落、镜像块插入后 Ctrl+Z 链是否连续。
4. **协作观感**：双端同开一份文档，远端光标名字标签位置、颜色区分度、断网重连后内容不倒退、
   离开再进来块数不翻倍（有回归用例，但"多人同时打字不抢焦点"要人工感受）。
5. **只读与权限观感**：viewer 打开文档/白板时工具条确实禁用且提示可读；口令页输错 3 次仍不泄露内容。
6. **离线与 PWA**：DevTools offline 后导航到 `/offline.html`、安装态图标（自绘 192/512/maskable）、
   重连后草稿恢复弹窗出现一次且只出现一次。
7. **导出保真**：`/信息` → 导出 markdown / html / text / json 四格式逐个人工核对富块（callout、卡片、
   表格、分栏、公式、白板嵌入）有没有丢内容 —— 这是 codec 的 `default: textContent` 老缺陷的回归面。
8. **移动端触摸目标**：44px 命中区、底部 Sheet 拖拽关闭、`⋯` 菜单不误触。
9. **暗色对比度**：正文/次要文字/禁用三档在 `oklch(0.19 0.005 260)` 底上是否达到 4.5:1。
10. **空态与错误态**：无网络下的 AI 生成、图片生成、链接预览失败提示文案与重试入口。

## 四、采集状态（2026-09-25 更新：外网可达，已采一轮）

误判已纠正：官方产品端是 `docs.craft.do`（`app.craft.do` 才不通），你的 Edge 里就有登录态，
所以**我能自己截图**。走 `capture.md` 路径 B（Browser Agent）已采到 6 屏 desktop：
`all-documents`、`tasks`、`calendar`、`connections`、`document`（右栏插入 tab 同框）、以及重采的一版
`all-documents`。官方 `index.css` 全量 token 已解出并写进 `tokens.md`，第二节里
侧栏宽 / 右栏宽 / 暗色三行已由"待采"变成实测值。

仍缺：

1. **tablet / mobile 档官方截图**——`browser.capabilities.get('viewport').set()` 返回 `undefined`
   但静默无效（截图仍是 1910×925），需要用独立窗口或独立 profile 重开再采。
2. 右栏 格式 / 样式 / 信息 三 tab 的官方图（需先在官方界面里打开右栏再点 tab）。
3. 登录 / 注册 / 回收站 / 设置 等本地专有路由：官方对应界面入口不同（设置是弹窗、无独立回收站页），
   按 token 比对即可，不必强求逐屏截图。

`scripts/capture-ref.mjs` 是路径 A 的产物（自带 Playwright 会话，需自己的账号），保留备用。
