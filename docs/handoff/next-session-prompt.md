# 接手提示词 — Crafty 多端同步（下一会话直接用这段开场）

> 用法：新开一个会话，把下面「提示词正文」整段粘贴进去即可。
> 生成时间：2026-10-01，同日更新（客户端元数据同步器已完成，并已合并进 `main`）。当前在 `main` 分支。

---

## 提示词正文

我在做一个类 Notion 的个人知识库 **Crafty**（`D:/code/cs`）。技术栈：Next.js 16 / React 19 / Prisma 8 + PostgreSQL / Tailwind v4 / next-auth v5 / Tiptap / tldraw / Yjs + Hocuspocus / Tauri v2。Web + 桌面双端，**单人自用**，目标是多端实时云同步，成本敏感。

**当前分支：`main`**（工作树干净，没有未提交改动；旧的 `deploy/vps-fullstack-offsite-backup` 分支已并入 main，可以不管它）。

请先读这三个文件建立上下文（顺序别变）：

1. `D:/code/cs/.workbuddy/memory/MEMORY.md` — 项目长期笔记
2. `D:/code/cs/docs/adr/0003-metadata-incremental-sync.md` — 本次任务的决策依据
3. `D:/code/cs/src/lib/sync/changes.ts` — 服务端已实现部分

### 三条架构红线（违反会引入数据损坏，务必遵守）

1. **文档正文唯一真源是 `YjsDocumentState.state`（Yjs 二进制）**，经 Hocuspocus（:3001）流式传输。`Document.content`（ProseMirror JSON）只是服务端派生的只读镜像，供搜索/预览/导出使用，**任何客户端代码都不得写它**。见 ADR-0001。
2. **白板唯一真源是 tldraw-sync 房间**（:3002），快照落 `Whiteboard.data`。
3. **元数据（目录树/标题/集合/标签）走 REST 轮询**，不要给它们上 WebSocket/SSE。

### 刚完成的任务：客户端元数据同步器（**已完成，勿重做**）

服务端（`src/lib/sync/changes.ts` + `src/app/api/sync/changes/route.ts`）此前已完成。客户端这一半现已落地：

| 文件 | 职责 |
|---|---|
| `src/lib/sync/client.ts` | 无框架依赖的轮询器：载荷校验、按主键幂等合并、退避、cursor 持久化 |
| `src/lib/store/use-sync-store.ts` | zustand store：cursor / 规范化行缓存 / 分表变更计数 / status |
| `src/components/providers/MetadataSyncProvider.tsx` | 生命周期组件，挂在 `src/app/(app)/layout.tsx`（登录壳内，不是根 layout） |
| `client.test.ts` + `use-sync-store.test.ts` | 37 项测试（假 fetch + 假定时器，不连库） |

**实现要点**（改动前先读这三段代码，别凭想象改）：

1. 冷启动无 cursor → 全量 pull；localStorage 有 cursor → 增量。键按用户隔离：`crafty:sync-cursor:v1:<userId>`。
2. 2.5s 轮询；`hasMore` 在**同一个 tick 内**继续拉，最多 20 页（防服务端卡住导致死循环）。
3. **cursor 在载荷应用之后才推进**：store 抛错时行不会越过游标被跳过。
4. 失败退避 2.5→5→10…上限 30s，成功归零；**401 直接停轮询**，等 provider 重新挂载（不再打接口）。
5. `visibilitychange` / `focus` / `online` 各触发一次立即同步。
6. UI 刷新走"**信号 + 重拉**"：provider 在 Document/Folder/Collection/Whiteboard 变化时调 `useSidebarStore.bumpTree()`，树组件订阅 `treeVersion`；标签面板订阅 `useMetadataRevision(['Tag','DocumentTag'])`。**取数仍走 `src/actions/*`** —— 服务端的过滤（isDeleted / isDailyNote / isTemplate / 权限）仍是"侧栏显示什么"的唯一定义。
7. `useMetadataSyncStore.tables` 是按 id 幂等覆盖的规范化缓存（`full` 表整表替换），目前 UI 不直接读它。

**服务端接口契约**（已实现，不要改）：

```
GET /api/sync/changes?since=<ISO 或 epoch-ms>&limit=<n>
鉴权：requireUserId()，会话态
响应：{ cursor: string(ISO), hasMore: boolean,
        changes: Record<模型名, Row[]>,   // 有 updatedAt，游标增量
        full:    Record<模型名, Row[]> }  // 无 updatedAt，每次全量
```

`changes` 覆盖：Folder / Document / Whiteboard / Task / Collection / DocumentShare / CollectionProperty / CollectionItem / CollectionView / CollectionValue。
`full` 覆盖：Tag / Favorite / DocumentTag / Backlink（这四张表**没有 `updatedAt` 列**，无法做游标，实测数据量只有几十行，每次全量传，别为此改 schema）。

**客户端行为（已实现，对照检查用）**：

1. 应用启动时**全量 pull**（不带 `since`），把 cursor 持久化（localStorage 即可）。
2. 之后按 **2–3 秒**定时轮询，带上 cursor。
3. `hasMore === true` 时**立即再拉一次**（不要等下个周期），直到 hasMore 为 false。
4. 按 **id 幂等覆盖**本地状态。同一毫秒的行会被重放一次（游标是毫秒截断而 PG 存微秒），幂等覆盖即可，无害。
5. 标签栏失焦/网络恢复时触发一次立即同步。
6. 写入仍走现有 REST action（`src/actions/*`），**不要改成经同步接口写入**。本地写 → 服务端 → 下次轮询拉回，单向。

**实测（本地真实库，非模拟）**：

- 该账号有 **1030 篇文档** → 冷启动需要 2 页（`limit=500`）。**`hasMore` 是真会触发的**，别假设一次拉完。
- 在 cursor 处再拉一次是纯重放：客户端 `changedTables` 为空 —— 毫秒截断的重放**不会**误报"有变化"，否则 UI 每 2.5s 会白刷一次。
- `full` 表实测规模：Tag 2 / DocumentTag 2 / Favorite 0 / Backlink 64，与 ADR-0003 一致。

**本轮新踩的坑**：

- **`Backlink` 的行键不是三元组**。`sourceBlockId` 可空且不在唯一约束里，真键是 `@@unique([sourceDocumentId, linkedDocumentId])`（见 `src/prisma/contract.prisma`）。用三元组会把同一行拆成多份、并丢掉 `sourceBlockId IS NULL` 的真实行（实测 64 行里有）。
- **`full` 表客户端必须整表替换**，不能按 id 合并增量 —— 那四张表既无 `updatedAt` 也无软删列，替换是删除唯一能落地的路径。

**验收**（需要用户真机做，AI 无法代劳）：两台设备/两个浏览器窗口，改标题、移动文档、加标签，2–3 秒内双向可见；服务端返回 500 或断网时不崩、能自动恢复。

### 已知坑（都是实测踩出来的，别重复踩）

- **ORM 的 `in` 过滤有静默陷阱**：`.where({ id: { in: [...] } })` **不报错但永远返回 0 行**。必须用回调形式 `.where(d => d.id.in([...]))`。
- **`prisma/schema.prisma` 是过时的废文件**（缺 `Document.pageStyle`、`Task`、`DocumentShare`、`Comment`、`Whiteboard.share*`）。真源是 **`src/prisma/contract.prisma`**，`contract.json` / `contract.d.ts` 由它生成。以 contract 为准。
- **ORM 返回的时间戳是 pg 原始字符串**（`"2026-09-29 18:06:49.485+08"`），不是 Date 对象。需要 `Date.parse` 转换，已封装为 `toEpochMs()`。
- **`.select()` 用可变参数**：`.select('id','title')`，不是数组。
- **tldraw**：无 License Key 上公网 HTTPS 生产态，画布会渲染 5 秒后整块变空白（不是显示水印）。Hobby License 免费但需申请。见 ADR-0002。
- **本工作区沙箱限制**：`next build` 会被拦（Turbopack 写 `.next` 报 EPERM），无法在本机验证完整构建产物，需要在外部构建机验证。git 命令 Bash 通道偶发失败，PowerShell 可用。

### 验证命令（跑完再报告）

```bash
cd "D:/code/cs"
npx vitest run              # 当前基线：37 文件 / 326 测试全过（含你新增的）
npx tsc --noEmit            # 当前基线：零报错
```

这两个基线是干净的，跑出任何失败都是你引入的，别当成既有问题放过。

### 不要做

- 不要改数据层访问方式（不要换成 CloudBase `app.rdb()`，已评估过，性价比为负）
- 不要给元数据上 WebSocket/SSE
- 不要把 `Document.content` / `Whiteboard.data` 塞进同步载荷（兆字节级，且会重新引入双真源）
- 不要在没有 ADR 的情况下改 schema

### 已完成的前置工作（不用重做）

- ADR-0001 双真源收敛（服务端派生 content、播种认领防内容翻倍）
- ADR-0002 tldraw 授权核实
- ADR-0003 元数据增量同步（服务端 + 10 项测试）
- ADR-0003 的**客户端一半**：轮询器 `src/lib/sync/client.ts` + store + provider + 37 项测试（本轮完成）
- `deploy/` 部署配置：3 个 systemd unit、Caddyfile、Postgres 1GB 调参、打包脚本
- `deploy/backup/` 备份链路：pg_dump → 校验 → 加密 → 上传 CloudBase → 本地轮转，含 restore 脚本与 systemd timer

### 下一步（按优先级）

1. **真机验收客户端同步**：两个浏览器窗口，改标题 / 移动文档 / 加标签，看 2–3 秒内是否双向可见；再把服务端打挂或断网，确认不崩、恢复后自动跟上。
2. 在构建机跑一次 `next build` 验证 `output: "standalone"`（本工作区沙箱拦 Turbopack，跑不了）。
3. 其余待办见下面「我还没做的事」。

### 我（用户）还没做的事，你不用催但要知道

- tldraw Hobby License 申请（拿到 Key 前别开放 `sync.` 子域名公网访问）
- 在构建机跑一次 `next build` 验证 `output: "standalone"`
- 备份脚本上服务器后先 `bash -n` 校验，并按 `deploy/README.md` 11.7 做一次恢复演练

---

## 上下文快照（给人看的，不用粘给 AI）

| 项 | 值 |
|---|---|
| 分支 | `main`（工作树干净；旧的 `deploy/vps-fullstack-offsite-backup` 已并入 main，未推送） |
| 本次落地的 5 个提交 | `Ignore local-only artifacts…`、`Make the Yjs room the only writer…`(ADR-0001)、`Gate the tldraw licence…`(ADR-0002)、`Add the metadata sync client…`(ADR-0003)、`Add the VPS deploy assets…`(ADR-0004 + deploy/) |
| 未提交改动 | 无 |
| 未跟踪 | 无（`.workbuddy/`、`.cursor/mcp.json`、`src-tauri/target`、`src-tauri/gen`、`.next.bak-*` 已进 `.gitignore`） |
| 测试基线 | `npx vitest run` → 37 文件 / 326 测试全过 |
| 类型基线 | `npx tsc --noEmit` → 零报错 |
| 数据库 | 本地 Postgres 已连通（`.env` 有 `DATABASE_URL`），测试可连真实库 |
| 注意 | `src-tauri/` 下没有源码（只有 `gen/schemas` 生成物与 1.3 GB `target/`），两处都已忽略；将来加 Tauri 源码时要调整 `.gitignore` |
| 清理项 | 根目录 `.next.bak-1790797201/` 已被忽略，可以删 |
