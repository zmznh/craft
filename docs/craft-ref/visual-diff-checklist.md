# Crafty ↔ craft.do 视觉对照清单

对照方法:craft.do 官方站为营销页(产品内界面需登录),通过 browser-use 在
`https://www.craft.do` 与 `/app` 页面**程序化提取计算样式**(getComputedStyle),
提取到的官方基准参数如下;本地侧以 `src/app/globals.css` tokens 逐项对齐。
截图(`ref-<screen>.png` / `local-<screen>.png`,1440×900)可后续按需用
chrome-devtools MCP 补充存入本目录。

## 官方基准参数(craft.do,2026-09-22 提取)

| 维度 | craft.do 实测值 | 说明 |
|---|---|---|
| 页面背景 | `rgb(252, 249, 247)` | 暖纸白 |
| 正文墨色 | `rgb(3, 3, 2)` | 近黑微暖 |
| 标题字体 | UntitledSerifFont(专有字体,48px) | 衬线大标题 |
| 正文字体 | UntitledSansFont(专有,16px) | 无版权字体,不可搬运 |
| 主 CTA | 近黑底 `rgb(3,3,2)` + 白字,**全圆角(药丸)**,13-16px | |
| 卡片 | 白 50% 透明度底,圆角 **16px** | |
| 侧栏导航项 | 圆角药丸 | |

## 逐项对照与处置

| # | 屏/维度 | 本地现状(改动前) | 参考基准 | 处置 | 状态 |
|---|---|---|---|---|---|
| 1 | 全局背景色 | `oklch(0.985 0 0)` 纯冷白 | 暖纸白 `rgb(252,249,247)` | light 主题背景改 `oklch(0.982 0.005 85)`(暖色调,色相 85) | ✅ 已改 |
| 2 | 全局墨色 | `oklch(0.145 0 0)` 冷黑 | 近黑微暖 `rgb(3,3,2)` | 前景/主色改 `oklch(0.16~0.18 0.008 85)` | ✅ 已改 |
| 3 | 主按钮色 | 冷黑 `oklch(0.205 0 0)` | 近黑暖 | `oklch(0.18 0.008 85)` | ✅ 已改 |
| 4 | 边框/输入框 | 纯中性灰 | 微暖灰 | `oklch(0.92 0.004 85)` | ✅ 已改 |
| 5 | 侧栏底色 | 蓝紫微染(色相 260) | 暖灰(纸感) | 色相 260 → 85,chroma 保持 0.004-0.005 | ✅ 已改 |
| 6 | 卡片圆角 | `--radius: 0.625rem`(10px,xl=14px) | 卡片 16px | `--radius: 0.75rem`(12px,xl≈16.8px) | ✅ 已改 |
| 7 | 文档标题字体 | 无衬线粗体(text-3xl font-bold) | 衬线标题(Untitled Serif) | 标题改 `font-serif`(系统衬线栈 Georgia/Noto Serif SC,不搬运官方字体)+ 去粗 | ✅ 已改 |
| 8 | 分享页标题 | 同上 | 同上 | 同上 | ✅ 已改 |
| 9 | 主 CTA 药丸圆角 | 按钮为 rounded-md | 官网 CTA 为全圆角 | **不改**:药丸是营销页风格,产品内 UI 按钮为中等圆角,改动会破坏产品一致性 | ⏸ 放弃(有理由) |
| 10 | 无衬线正文字体 | Inter/系统栈 | UntitledSansFont(专有) | **不搬运专有字体**;Inter 为最接近的开源替代 | ⏸ 放弃(版权边界) |
| 11 | 暗色主题 | 冷色调 | 官网未提供暗色基准 | 保持现状,避免无依据回归 | ⏸ 放弃(无基准) |
| 12 | 动效节奏 | 100/150/250ms ease | 官网转场约 200-300ms | 现有 `--transition-slow: 250ms` 已在区间内 | ✅ 无需改 |

## 验证方式

- 改动仅涉及 `src/app/globals.css` tokens、`EditorHeader.tsx`、`SharedDocView.tsx`
  三处,无结构性重构。
- 视觉回归:阶段 5 全场景测试对每个路由截图留档,人工复核暖色调过渡是否自然。

## 截图留档状态（2026-09-25 更新）

| 项 | 状态 | 位置 |
|---|---|---|
| 本地三档截图（documents / document / whiteboard × 1440/768/390） | ✅ 已存 9 张 | `docs/craft-ref/local-<screen>-<w>.png` |
| craft.do 登录后基准截图 `ref-<screen>-<w>.png` | ⛔ 未采集：本机无外网（`app.craft.do` DNS 失败、`google.com` 超时），需网络恢复后按 `scripts/capture-ref.mjs` 补 | — |
| `tokens.md`（ref 值 / local 值 / Δ / 是否有意偏差） | ⛔ 同上阻塞，暂以本仓 `src/app/globals.css` tokens 与上表为准 | — |
| 自动化视觉基线（回归用，非对照用） | ✅ 96 张，三档 × 明暗 × 全路由 + 四 tab + 集合 + 白板 | `e2e/visual.spec.ts-snapshots/` |

结论：像素级对照仍缺 craft.do 侧基准图，属外部依赖未清；本仓侧的视觉一致性已由 96 张
自动化基线锁住，任何后续样式漂移都会在 `npm run test:e2e` 里失败。

## 本轮新增界面的偏差登记

| 界面 | 处理 | 理由 |
|---|---|---|
| 文档内白板块 | 自绘头部条（图标+标题+「只读预览」+跳转）+ tldraw 只读画布，工具条隐藏 | craft.do 的嵌入白板卡为专有位图风格，此处用本仓 token 自绘 |
| 侧栏树右键菜单 | 用本仓 `ui/context-menu`（Base UI）+ 现有 popover token | 菜单项文案按 Craft 语义（重命名/创建副本/移入回收站），样式沿用本仓圆角与间距 |
| 协作者区块 | 放在「信息」tab 内，与标签/反向链接同列 | Craft 的分享面板为弹窗；本仓分享语义在 ShareDialog，成员是文档级权限，归信息面板更一致 |
| 集合画廊/表单视图 | 卡片与表单均用现有 `PropertyCell` | 避免为视图新增一套控件 |
