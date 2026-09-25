# 响应式规范

本文件定义 Crafty 的断点约定与三层职责，改动任何 shell 尺寸前先读这里。

## 断点

四档，与 Tailwind 默认值一致：`640 / 768 / 1024 / 1280`。语义固定如下：

| 区间 | 称呼 | 侧栏 | 右侧面板 | 编辑器 |
|---|---|---|---|---|
| ≥1024 | 桌面 | 常驻可拖拽 | 右侧 300px | 用户测量宽度 + `3rem` 左右留白 |
| 768–1023 | 平板 | 常驻可拖拽 | 底部 Sheet | 同上，留白 `2rem` |
| ≤767 | 手机 | 抽屉 | 底部 Sheet（插入/格式常驻，样式/信息进 `⋯`） | 单栏满宽，留白 `1rem` |

`640` 只用于组件内部的局部挤压微调（表格单元格、工具栏图标），不用于改变上面三样东西的形态。

## 三层职责

1. **token 层**（`src/app/globals.css` 的 `:root` + 两个媒体查询）
   `--layout-sidebar-w`、`--panel-w`、`--editor-measure`、`--editor-max-w`、`--editor-pad-x`。
   全仓只有这一个地方按断点重定义尺寸；断点块只有 `max-width: 1023px` 和 `max-width: 767px` 两个。
2. **容器层**（只有这 4 个文件允许出现断点逻辑）
   `src/app/(app)/layout.tsx`、`src/components/sidebar/Sidebar.tsx`、
   `src/components/editor/DocumentEditor.tsx`、`src/components/editor/tabs/RightPanel.tsx`。
   形态切换（常驻 / 抽屉 / 底部 Sheet）走 `src/lib/use-is-mobile.ts` 的 `useIsMobile()` / `useIsCompact()`，
   不用 CSS 断点类做形态切换——形态是组件树结构，不是样式。
3. **组件局部层**（`max-md:`）
   只给确实会被挤坏的控件：白板面包屑、命令面板、日历单元格、看板列、表格首列、tldraw 画布外框。
   新增 `max-md:` 前先确认它属于这一类，否则应回到 token 层。

## 已知有意偏差

- 手机编辑器的正文字号仍是 `16px`（`.tiptap` 基础值），不额外下调：iOS 在聚焦元素字号小于 16px 时会自动放大视图。
- 手机上隐藏 tldraw 的小地图与样式面板（`.tlui-minimap` / `.tlui-style-panel`），这两块在触摸下只占画布不换收益。
- 集合表格里首列 `sticky` 只在手机生效；桌面表宽通常放得下，无需遮挡背景色差异。

## 校验

`e2e/visual.spec.ts` 以 desktop(1440×900) / tablet(768×1024) / mobile(iPhone 12) 三个 project 跑同一批路由截图，
`playwright.config.ts` 的 project 名与上表一一对应。
