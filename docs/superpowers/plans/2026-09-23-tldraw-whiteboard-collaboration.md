# 阶段6 tldraw 白板实时协同实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Crafty 白板提供官方 tldraw 实时同步、分享链接查看/编辑权限与可恢复持久化。

**Architecture:** Next.js 管理白板归属、分享设置和短时访问凭证；独立 Node.js WebSocket 服务以官方 tldraw sync 房间同步状态。同步服务通过双方认证的内部接口加载/保存 `Whiteboard.data` 检查点，并在分享撤销时断开相关连接。

**Tech Stack:** Next.js 16.3.5、React 19、tldraw 5.4.2、官方 `@tldraw/sync` 与 `@tldraw/sync-core`（兼容版本须经任务1确认）、Prisma contract、Vitest、Playwright。

**Spec:** `docs/superpowers/specs/2026-09-23-tldraw-whiteboard-collaboration-design.md`

## Global Constraints

- 分享默认关闭；权限等级为关闭、查看、编辑。
- 匿名用户可通过查看链接查看；编辑权限必须登录；所有者始终可编辑。
- 分享撤销必须阻止新连接并断开已有的分享连接。
- 沿用官方 tldraw 同步协议，不用 Hocuspocus/Yjs 承载白板房间。
- 健康运行时目标为变更后约 1 秒提交检查点；数据库不可用时不承诺固定数据丢失上限。
- 连接凭证需短时有效并限定白板 ID、角色和分享版本；服务端不得使用生产默认密钥。
- 实施前确认 SDK 许可允许当前用途与部署；许可不适用时停止依赖接入并重新评估方案。

---

## 文件职责图

- `src/prisma/contract.prisma`：白板分享权限/token/version 的持久化契约。
- `src/lib/whiteboard-sharing/`：纯授权判断、凭证签名/验证规则，便于 Vitest 覆盖。
- `src/actions/whiteboard/whiteboard.ts` 或相邻分享 action：所有者分享管理与页面数据读取。
- `src/app/api/whiteboards/[id]/collab-token/route.ts`：签发限定白板、角色和分享版本的连接凭证。
- `src/app/api/internal/whiteboards/[id]/snapshot/route.ts`：仅同步服务可调用的检查点读取/写入接口。
- `src/app/api/internal/whiteboards/[id]/collab-state/route.ts`：同步服务连接鉴权时读取当前分享权限、版本和删除状态，拒绝已撤销的旧凭证。
- `src/collab/tldraw-server.mjs`：官方 sync WebSocket 房间、凭证校验、检查点与服务端失效接口。
- `src/components/whiteboard/Board.tsx`：使用官方客户端接入房间，展示连接/授权状态。
- `src/components/whiteboard/WhiteboardShareDialog.tsx`：所有者分享开关、权限设置、复制与撤销链接。
- `src/app/(app)/whiteboards/[id]/WhiteboardBreadcrumb.tsx`：增加分享设置入口。
- `src/app/w/[token]/page.tsx`：匿名/分享访问入口，服务端验证后渲染白板。
- `e2e/whiteboard-collab.spec.ts`：双端实时同步、匿名只读、登录编辑和撤销连接场景。
- `playwright.config.ts`、`package.json`：启动 Next 与独立 tldraw 服务及测试命令。

## Task 1: 官方依赖、许可与迁移前置核验

**Files:** 无代码文件改动。

**Interfaces:** 产出可锁定的 `@tldraw/sync` / `@tldraw/sync-core` 兼容版本、官方 API 用法、许可结论，以及本项目对 `src/prisma/contract.prisma` 的实际数据库迁移流程。后续任务以该结果为前提。

- [ ] 对照官方 5.4.2 文档/发布记录确认客户端 `useSync`、服务端房间、只读写入拦截、presence 和 snapshot 存储的真实 API。
- [ ] 查询并阅读 `tldraw` SDK 许可及 sync 包许可，确认 Crafty 当前用途和部署方式允许使用；记录结论和适用限制。
- [ ] 查看当前 Prisma 8 CLI 命令和仓库迁移产物，确认如何生成并应用仅新增列的数据库迁移；不得用 `db init` 替代已有数据迁移。
- [ ] 若许可不适用、依赖版本不兼容或无法确认可重复执行的迁移流程，停止后续实现并报告阻塞，不安装依赖、不改 contract。
- [ ] 记录精确依赖版本、导入路径、服务启动/关闭 API 与存储读写方法，供后续任务直接使用。

验证：`npm view @tldraw/sync versions` 与 `npm view @tldraw/sync-core versions` 用于版本核对；最终以官方文档和实际安装类型为准。许可与迁移流程需人工核对对应官方文件/项目配置，不以包查询代替。

## Task 2: 分享契约与纯授权规则

**Files:**
- Modify: `src/prisma/contract.prisma`
- Regenerate: `src/prisma/contract.json`, `src/prisma/contract.d.ts`
- Create: `src/lib/whiteboard-sharing/access.ts`
- Create: `src/lib/whiteboard-sharing/access.test.ts`

**Interfaces:**
- `WhiteboardSharePermission = 'off' | 'view' | 'edit'`
- `WhiteboardAccessClaims = { boardId: string; role: 'owner' | 'viewer' | 'editor'; shareVersion: number; exp: number; subject: string }`
- `canOpenWhiteboardShare(permission, requestedRole): boolean`

- [ ] 先为纯规则写 Vitest：关闭权限拒绝 viewer/editor；view 允许 viewer 不允许 editor；edit 允许 viewer/editor。
- [ ] 运行 `npx vitest run src/lib/whiteboard-sharing/access.test.ts`，确认测试因实现缺失失败。
- [ ] 在 Whiteboard contract 增加分享权限（默认 `off`）、可空随机 token、分享版本号（默认 `0`）；不把公开 token 或角色写进白板画布 JSON。
- [ ] 根据任务1确认的 Prisma 8 工作流生成 contract 类型和 additive migration；检查迁移只增加分享字段、不重建/清空白板表。
- [ ] 实现纯授权函数，严格区分匿名 viewer、登录 editor 与 owner，并验证 claims 的白板/角色/版本/有效期。
- [ ] 运行 `npx vitest run src/lib/whiteboard-sharing/access.test.ts` 与 `npm run build`。

## Task 3: 分享管理、凭证与内部检查点 API

**Files:**
- Modify: `src/actions/whiteboard/whiteboard.ts`
- Create: `src/app/api/whiteboards/[id]/collab-token/route.ts`
- Create: `src/app/api/internal/whiteboards/[id]/snapshot/route.ts`
- Create: `src/app/api/internal/whiteboards/[id]/collab-state/route.ts`
- Create: `src/lib/whiteboard-sharing/token.ts`
- Create: `src/lib/whiteboard-sharing/token.test.ts`

**Interfaces:**
- `setWhiteboardShare(id, permission)`：仅所有者可调用；启用时确保随机 token 存在，变更权限/撤销时递增版本。
- `getWhiteboardShare(id)`：仅所有者可读取管理数据；返回权限和可复制的分享 URL，不返回签名密钥。
- `POST /api/whiteboards/[id]/collab-token` body `{ shareToken?: string }`：返回 `{ token: string; role: 'owner' | 'viewer' | 'editor'; syncUrl: string }`。
- 内部 snapshot API 只接受同步服务的服务端认证，GET 返回当前 snapshot，PUT 写入当前 snapshot。
- 内部 collab-state API 只接受同步服务的服务端认证，返回当前 permission、shareVersion 和删除状态，用于每次 WebSocket 连接校验 claims。

- [ ] 为 token helper 写签名、验签、过期、room mismatch、shareVersion mismatch 的单元测试，并验证签名比较采用恒定时间比较。
- [ ] 运行 `npx vitest run src/lib/whiteboard-sharing/token.test.ts` 确认失败。
- [ ] 实现分享读取/更新 actions：每个操作校验登录、白板存在、所有者 ID、未删除状态；token 使用密码学随机字节生成，权限关闭时使旧版本失效。
- [ ] 实现连接凭证 route：viewer 凭证允许匿名但要求有效分享链接；editor 凭证要求登录及 edit 分享；owner 凭证必须验证资源所有权。凭证只签发短时声明，不接受客户端自报角色或版本。
- [ ] 实现内部 collab-state GET：认证同步服务身份后返回白板当前 sharePermission、shareVersion、isDeleted；同步服务在每次连接时查询并比对 claims，确保撤销后服务重启也不能接受旧 token。
- [ ] 实现内部 snapshot GET/PUT route：要求独立高熵 `TLDRAW_INTERNAL_SECRET` 的服务端认证，校验白板存在/未删除并按该白板 ID 更新 `data`；不允许浏览器 session/CORS 成为绕过认证的替代路径。
- [ ] 运行 token tests、分享权限 tests 与 `npm run build`；确认无 token/secret 出现在公开页面 props 或日志中。

## Task 4: 官方同步服务、检查点和撤销断连

**Files:**
- Create: `src/collab/tldraw-server.mjs`
- Create: `src/collab/tldraw-auth.mjs`
- Create: `src/collab/tldraw-auth.test.mjs`
- Modify: `package.json`

**Interfaces:**
- `npm run dev:tldraw-sync` starts a separate WebSocket listener using `TLDRAW_SYNC_PORT`.
- Sync service validates the signed claims from Task 3 against room ID and role before accepting a connection.
- Service loads/saves snapshots only through the authenticated internal Next.js snapshot API.
- Authenticated internal revocation endpoint invalidates share-version credentials and disconnects non-owner clients for that board.

- [ ] 根据任务1记录的已锁定 API 为房间鉴权、只读权限 enforcement、on-change snapshot callback 写测试；测试包括房间不匹配和 viewer 写操作拒绝。
- [ ] 安装锁定版本的官方 `@tldraw/sync` 与 `@tldraw/sync-core`，在 `package.json` 增加独立开发脚本；不升级 `tldraw` 主版本，除非官方兼容性核验明确要求并经重新评估。
- [ ] 实现服务启动：缺少签名密钥、内部 API 地址或必要配置时启动失败；不使用 `dev-secret` 作为默认密钥。
- [ ] 实现房间创建时读取 snapshot、变更后约 1 秒内节流 checkpoint、正常关闭时 flush；数据库写失败记录错误且不标记成功。
- [ ] 实现内部撤销接口，要求服务端认证，按 board ID/shareVersion 关闭受影响连接；owner 连接不受分享撤销影响。
- [ ] Next.js 分享权限变更成功后调用同步服务撤销接口；接口不可达时必须向所有者返回可识别失败状态，不能显示“撤销成功”但保留编辑连接。
- [ ] 运行服务单元测试、`npm test` 和 `npm run build`；手动启动 Next 与同步服务，使用一个有效房间验证连接与 snapshot 重启恢复。

## Task 5: 白板客户端、公开分享路由与分享 UI

**Files:**
- Modify: `src/components/whiteboard/Board.tsx`
- Modify: `src/app/(app)/whiteboards/[id]/page.tsx`
- Modify: `src/app/(app)/whiteboards/[id]/WhiteboardBreadcrumb.tsx`
- Create: `src/components/whiteboard/WhiteboardShareDialog.tsx`
- Create: `src/app/w/[token]/page.tsx`

**Interfaces:**
- `Board` consumes `{ whiteboardId: string; initialData: unknown; shareToken?: string; initialRole: 'owner' | 'viewer' | 'editor' }` and obtains a fresh signed connection token from Task 3.
- Public route resolves token server-side and passes only board display fields, share token, and viewer/editor gate state; never passes signing/internal secrets.

- [ ] 为分享 dialog 添加交互测试：关闭、查看、编辑、复制、撤销及 server action 失败时维持原 UI 状态。
- [ ] 运行对应测试确认失败后，实现所有者分享 dialog，并将入口放入白板 breadcrumb；匿名者页面不渲染所有者管理按钮。
- [ ] 创建 `/w/[token]` server route：校验链接存在、白板未删除、分享启用；view 链接允许匿名查看；edit 链接对匿名访问显示登录入口并保留返回地址。
- [ ] 将 `Board.tsx` 的本地 `Tldraw onMount + loadSnapshot + 1.5 秒整份保存` 替换为任务1确认的 `useSync` 客户端连接；旧 `Whiteboard.data` 只作为同步房间首次启动 snapshot，不再由每个浏览器覆盖写回。
- [ ] Viewer 模式同时启用客户端只读状态与服务端写操作拒绝；editor 登录后刷新连接凭证并进入可编辑状态。
- [ ] 添加连接中、已连接、重连中、授权失效状态；凭证/权限错误停止自动重连并提供返回/重新登录路径。
- [ ] 运行 `npm test`、`npm run build` 并手动通过浏览器验证所有者分享入口和匿名查看 golden path。

## Task 6: Playwright 协作与安全验收

**Files:**
- Create: `e2e/whiteboard-collab.spec.ts`
- Modify: `playwright.config.ts`

**Interfaces:** Playwright 启动 Next.js 与 tldraw sync 服务两个进程；E2E 复用现有测试账号 `craft-test@example.com` / `test1234`，并通过独立 browser contexts 覆盖匿名与登录访问。

- [ ] 增加两浏览器 owner/editor 同房间用例：创建、移动、删除图形，另一端实时收到状态。
- [ ] 增加匿名 viewer 用例：可加载白板，不能新增/移动/删除图形，数据库检查点不改变。
- [ ] 增加编辑权限登录门槛用例：匿名访问 edit link 被要求登录，登录后恢复链接并成功编辑。
- [ ] 增加撤销用例：分享管理端撤销后，已连接 share client 断开；新建连接和新凭证都失败；owner 仍可编辑。
- [ ] 增加房间隔离、过期/无效 token、服务重启 checkpoint 恢复测试。
- [ ] 在 `playwright.config.ts` 的 `webServer` 数组中启动 `npm run dev` 与 `npm run dev:tldraw-sync`，为两个服务设置可复用 URL 和启动超时；不要让 Next 的 reuseExistingServer 掩盖缺失的 sync service。
- [ ] 运行 `npm run test:e2e`，确认所有新用例与 `e2e/core.spec.ts`、`e2e/collab.spec.ts` 一起通过。

## Task 7: 全面验证

**Files:** 无文件改动；仅执行最终自动化与浏览器验证。

- [ ] 运行 `npm test`。
- [ ] 运行 `npm run test:e2e`。
- [ ] 运行 `npm run lint`。
- [ ] 运行 `npm run build`。
- [ ] 手动验证 viewer、editor、owner、撤销、重连、Next/sync 任一服务重启和 snapshot 恢复；检查浏览器控制台与两个服务日志。
- [ ] 检查最终 diff，确保未覆盖已有工作区改动、未把密钥加入版本控制、未将分享凭证写入 console 或持久化画布数据。

## Coverage Self-Review

- 官方依赖、API、许可与 Prisma migration 前置门槛：Task 1。
- 分享关闭/查看/编辑、匿名只读、登录编辑、owner 访问及凭证范围：Tasks 2–3。
- 撤销后拒绝新连接、断开现有连接：Tasks 3–4、6。
- 官方房间实时同步、snapshot checkpoint、服务重启恢复：Tasks 4、6。
- UI 分享管理、公开路由、登录返回和连接状态：Task 5。
- 旧 snapshot 兼容与文档协作回归：Tasks 5–7。
- 当前 scope 中无团队邀请、离线合并、历史回放、分布式扩展或完整媒体托管。

## Execution Notes

本计划不包含 Git commit 步骤；未经明确要求不得创建提交。任务1的许可/兼容性/迁移核验是硬门槛，未通过时不得继续安装官方同步依赖或改数据库 contract。
