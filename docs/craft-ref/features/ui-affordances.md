# UI 可供性与动作埋点清单（bundle 静态实证）

来源：对 `_harvest/js/` 105 个 bundle 全量 grep（`data-testid` 123 个唯一值 + 埋点事件名）。这些是产品自己给界面元素起的名字与记录的动作，**等价于一份"官方控件与操作字典"**，用来补截图看不到的入口与状态。

## 一、上下文菜单项（`ctx-*`，11 项）

`ctx-copy-link`（复制链接）、`ctx-duplicate`（创建副本）、`ctx-duplicate-selected`（**副本-多选版**）、`ctx-delete`、`ctx-edit`、`ctx-move-to`（移至）、`ctx-open-new-tab`、`ctx-pin` / `ctx-unpin`（**固定 / 取消固定**）、`ctx-restore`（恢复）、`ctx-leave-selected`（**取消所选**）。

比之前实测到的"卡片右键 6 项"多出：`pin/unpin`、`duplicate-selected`、`leave-selected`、`restore` —— 说明**不同实体（卡片 / 块 / 多选 / 回收站项）的上下文菜单集合不同**，复刻时不能只做一套菜单。

## 二、任务与提醒

`tasks-view-tabs`（任务页有**视图标签组**）、`tasks-header`、`tasks-add-button`、`tasks-settings-button` / `tasks-settings-slot` / `tasks-settings-placeholder`（任务页可配置设置位）、`tasks-zero-state` / `tasks-zero-state-idle` / `tasks-zero-state-action`（**空态分两种：零任务 与 idle**）。

关键：`task-popup-deadline-button` 与 `task-popup-schedule-button` **是两个并列按钮** → R4"截止 vs 排期是两套属性"在 UI 层得到实证（不只是文案推断）。

## 三、白板（Excalidraw 工具全集）

`toolbar-hand`、`toolbar-selection`、`toolbar-rectangle`、`toolbar-arrow`、`toolbar-text`、`toolbar-laser`、`toolbar-lasso`、`toolbar-frame`、`toolbar-magicframe`、`toolbar-image`、`toolbar-embeddable`、`toolbar-freedraw`、`toolbar-eraser`、`toolbar-lock`；画布侧：`canvas-background-picker` / `canvas-background-label` / `clear-canvas-button` / `cancel-clear-canvas-button`。
→ 官方"白板工具"= 这 14 项 + 背景选择 + 清空。本地用 tldraw（有意偏差 D2），但**工具档位需对齐**：`frame` / `magicframe` / `embeddable` / `laser` / `lasso` / `lock` 本地若缺就是功能缺口，不只是外观差异。

## 四、浏览页 / 搜索 / 侧栏

`browse-header`、`browse-document-list`、`browse-layout-toggle`（布局切换：列表/网格…）、`browse-sort-button`、`browse-new-doc-button`、`browse-empty-state`；
`quick-search-input`、`quick-search-results`、`quick-search-no-results`、`quick-search-sees-more`（`see-more`，即"查看更多"分页态）、`search-menu-button`、`command-menu`、`command-palette-button`、`main-menu-trigger`；
`sidebar-toggle` / `sidebar-close` / **`sidebar-dock`（侧栏可固定停靠）** / `sidebar-header` / `sidebar-imagine` / `sidebar-profile` / `sidebar-shared-with-me` / `sidebar-templates`；`home-button`、`header-root`、`collab-button`（顶栏协作入口）、`toggle-dark-mode`（**顶栏直接切深色**）、`stats-element-type`（统计项按类型标注）。

修正此前两个结论：
1. **网页版有命令面板入口**（`command-palette-button` + `command-menu`）——不是"只在桌面端"；⌘K 只做页面跳转是因为它是"跳转到"，命令面板另有按钮。
2. 存在 `json-export-button` → **官方有 JSON 导出**（`gap.md` G22 里"本地多出 JSON"的说法作废）；另有 `image-export-button`、`lib-dropdown--export` / `--load` / `--remove`（**库级导出与导入**）。

## 五、文件夹 / 回收站 / 导出 / 其它

`folder-create-button`、`folder-name-input`、`folder-color-button` / `folder-color-picker` / `folder-color-swatches`（**文件夹可配色**）、`folder-icon-button` / `folder-icon-option-default`（**文件夹可选图标**）、`folder-description` / `folder-description-button` / `folder-description-done-button`（**文件夹描述，编辑态有独立完成按钮**）、`modal-edit-folder`、`empty-trash-cancel` / `empty-trash-confirm`（清空回收站二次确认）、`save-button` / `save-as-button`、`publish-library-success-close`、`whats-new-close-button`（**"新功能"弹窗**）、`upgrade-plus-close-button`、`yearly-save-badge`（年付省多少徽标）、`team-space-welcome-close-button`、`team-trial-setup/opt-in/ended-close-button`、`lib-dropdown--*`、`new-doc-menu-item`、`popup-backdrop`、`modal-confirm`、`dropdown-menu(-button)`、`date-picker-today-button`、`virtuoso-item-list` / `virtuoso-scroller`（长列表虚拟滚动）、`brave-measure-text-error`（**为 Brave 浏览器做的文本度量兜底**，兼容性分支）、`ttd-dialog-output-error`、`load-button`。

## 六、动作埋点（产品的自述动作表）

`thread_resolve` / `thread_unresolve` 各带 `*_error`（评论解决/重开及其失败态）、`team_trial_prompt_shown` / `team_trial_started` / `team_trial_plan_select_shown|click` / `team_trial_ended_popup_shown|upgrade|learn_more|dismissed`、`team_welcome_popup_shown|dismissed|completed`、`team_invite_prompt_send|skip`、`centralized_login_completed` / `centralized_login_failed`、`v2_subscription_flow_event`（订阅主流程单事件多态）。

读出的交互事实：**解决/重开是显式操作且有失败回滚**（`_error` 变体说明有失败提示与状态还原）；团队试用与欢迎流程各有独立的弹窗生命周期事件（shown / dismissed / completed）；登录成功失败成对上报。

## 七、拖拽与落点（2026-09-27 从本地 bundle 反编译结案 ✓）

此前 T-C4「拖拽落点」被判为"必须动态采"，实际**激活阈值与落点索引规则都在代码里**，先静态结案，动态只复核视觉。

### 7.1 起拖阈值（`activationConstraints`，两套配置）

| 配置 | 指针设备 | 触摸设备 | 用途 |
|---|---|---|---|
| `GCe`（通用） | **位移 8px** 才起拖（`GM.Distance({value:8})`） | **长按 150ms、容差 5ms**（`GM.Delay({value:150,tolerance:5})`） | 主拖拽通路 |
| `R8n` | **无阈值**（按下即拖） | 同 | 另一类（更激进的把手） |
| `ixn`（看板卡片） | 一律**长按 150ms / 容差 5ms**（不分设备） | 同 | 看板 |

⇒ **同一产品内阈值不统一**：主列表按设备分档、看板一律长按。本地若只做一个全局阈值就会与官方不一致。

### 7.2 按下不起拖的排除区（`preventActivation`）

通用配置的排除选择器 `zCe` = `input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), a[href]`
⇒ **落在表单控件或链接上按下永远不起拖**（把点击让给控件）。看板版 `oxn` 在此基础上**多排除 `[data-object-id]`**，并额外查 `[data-kanban-card-list]` 内元素。
另有常数 `sxn = 20`（看板侧，疑为滚动激活边距或阈值，未取到使用点 ⇒ 标 `~`）。

### 7.3 落点索引规则（`nCn` 画廊卡片 reorder hook，函数体直读）

```
onDragStart(被悬停卡片 y, index C)：
  若 y.objectIds 不在当前选中集内 → 先 selectSingle(y) 再拖
  返回 {type:"gallery-card", index:C, objectIds:选中集}

onHover(y, C, side, extra)：
  T = (side === "left") ? C : C + 1        ← 左半区插到该位之前，右半区插到之后
  三种情况【不显示指示线】：
    ① 悬停位就是被拖元素自身
    ② T 位元素在被拖集合内
    ③ T-1 位元素在被拖集合内            ← 即"整组相邻移动"无意义
  否则 dropIndicator = {insertAtIndex: T, ...extra}

onDrop()：reorderObjects(draggedIds, insertAtIndex)
```
⇒ 官方落点是**半区判定**（不是"最近中心"），且**相邻同组会主动抑制指示线**。
⇒ **拖一个未选中的卡片会即时改写选中集**（发生在 `onDragStart`，不是落点后）——这条最容易漏。

### 7.4 指示线是**分类型独立组件**

- 表格有自己的 `_tableDropIndicator_1p8kk_3`，渲染为 `<div style={{top: indicator.top}}>`，且 `indicator.top` 未设时**整个节点不渲染**；
- 辅助函数 `v7n = t => t !== "0px" ? t : ""` ⇒ **0px 值被主动清空**（避免"0px 边框"造成的视觉抖动）；
- 拖拽预览层 `_overlayRoot_5firf_3` + `_preview_5firf_8`；
- 选中环用 `selectionRing` + `selectionRingHidden` 两个 class **常驻 DOM 靠切 class 显隐**（不是挂载/卸载）。

### 7.5 虚拟化与拖拽的耦合（顺带采到）

列表走 `b9()` 虚拟滚动：`estimateSize` 对 `type === "group-header"` 用独立行高常数 `fxe`、`overscan: 2`，并有 `onScrollForVirtualizer` 用 `requestAnimationFrame` + **150ms 防抖** 双路更新偏移。
⇒ 分组标题与普通行**不同高**，且滚动停 150ms 后才做第二次精算 —— 本地做虚拟列表时这两个数值是官方口径。

## 仍未证明的部分

testid 与埋点只证明"有这个控件/动作"，不证明**行为效果与状态迁移**。仍需动态批次：块级操作（转换/嵌套/撤销粒度）、任务勾选双向同步、权限档位矩阵、集合列类型编辑态。

**拖拽落点已从"必须动态采"改判**（§七）：激活阈值、排除区、落点索引公式、指示线抑制条件、虚拟列表行高**全部在代码里可直读**，已静态结案。动态只剩两件事：① 指示线的**视觉形态**（粗细/颜色/是否有动画，代码只给 class 名）；② `sxn = 20` 这个看板常数的实际用途（未取到使用点）。
