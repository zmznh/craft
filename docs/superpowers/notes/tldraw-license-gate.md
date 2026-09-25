# 阶段6 前置门槛核验：tldraw 许可、sync 包版本、Prisma 迁移流程

核验日期：2026-09-24。本文件是 `docs/superpowers/plans/2026-09-23-tldraw-whiteboard-collaboration.md` Task 1 的书面结论；
门槛通过，Task 2 及之后才允许安装依赖与修改 contract。

## 1. 许可（tldraw SDK License）

来源：`node_modules/tldraw/LICENSE.md` 指向的 upstream `tldraw/tldraw/blob/main/LICENSE.md`，以及
`node_modules/@tldraw/sync-core/README.md` 的 License 段。

- 允许在**开发与内部测试环境**免费使用，可修改源码、可 bundle。
- 允许商业/非商业项目使用，**条件**是保留画布上的 "Made with tldraw" 水印。
- **Production Environment**（向终端用户或公众提供功能）需要购买 License Key；SDK 内置许可校验与水印逻辑。
- **禁止**移除或干扰水印、License Key 校验、使用遥测。

结论与执行约束：

1. Crafty 本轮交付目标是本地/内网自托管，属 Development Environment，可安装 `@tldraw/sync` 并实现白板实时协同。
2. 本项目**不得**公网部署该白板协同；若将来要上线，需先购买 tldraw business license 并配置 License Key。
3. 不修改、不绕过任何水印或许可校验代码（`Board.tsx` 中也不得隐藏水印 DOM）。
4. 依赖版本随 `package.json` 锁定，升级 tldraw 主版本前需重新核验许可条款。

## 2. sync 包版本兼容

- 已安装 `tldraw@5.4.2`；`@tldraw/sync@5.4.2` 与 `@tldraw/sync-core@5.4.2` 存在且**同版**。
- 两个包均以 `--save-exact` 精确锁定（无 `^`），避免协议版本漂移（`getTlsyncProtocolVersion()` 在服务端/客户端不一致会直接触发 `incompatibility-error`）。
- README 明确提示需优雅处理 `incompatibility-error`（版本不匹配）。

## 3. 实际 API（以安装的类型为准，非记忆）

`@tldraw/sync-core` 导出：`TLSocketRoom`、`InMemorySyncStorage`、`TLSyncClient`、`ClientWebSocketAdapter`、
`TLSyncRoom`、`SQLiteSyncStorage`、`TLSyncErrorCloseEventCode/Reason`、`TLRemoteSyncError`、`getTlsyncProtocolVersion` 等。

服务器侧用法（本仓库 `src/collab/tldraw-server.mjs`）：

- `new InMemorySyncStorage({ snapshot })` 承载房间状态，`storage.getSnapshot()` 取快照。
- `new TLSocketRoom({ storage, clientTimeout, log })`。
- `room.handleSocketConnect({ sessionId, socket, isReadonly, meta })`：`isReadonly` 直接实现 viewer 只读（服务端拒绝写入，非仅前端禁用）。
- `room.handleSocketMessage(sessionId, data)` / `handleSocketClose(sessionId)` / `handleSocketError(sessionId)`。
- `room.getCurrentSnapshot()` / `room.loadSnapshot(snapshot)`：快照与 `Whiteboard.data` 中既有的 `editor.getSnapshot()` 结构兼容（`RoomSnapshot | TLStoreSnapshot` 都接受）。
- `room.getSessions()` / `room.closeSession(sessionId, reason)`：实现分享撤销时踢断既有连接。
- `storage.onChange(cb)` 返回取消函数：用于节流 checkpoint 落库。

客户端用法（`src/components/whiteboard/Board.tsx`）：`useSync({ uri, userInfo, ... })` 来自 `@tldraw/sync`，
状态机为 `loading | 'synced-remote' | error`。

`ws@8.21.3` 仅作为传递依赖存在 → 已在 `package.json` 显式声明为直接依赖，避免被上游裁掉。

## 4. Prisma 8 可重复迁移流程（实测通过）

本仓库此前只有 `migrations/snapshots/*` 与 `migrations/app/refs/db.json`，**没有** on-disk 迁移包。
本轮建立流程并跑通一次（contract #1：`DocumentMember` + `YjsDocumentState` + `Whiteboard` 分享列）：

```
编辑 src/prisma/contract.prisma          # 只加可选列/新表/索引/唯一约束
npx prisma contract emit                 # 生成 contract.json + contract.d.ts
npx prisma db update --dry-run           # 人读输出：全部 operationClass 必须是 "additive"
npx prisma migration plan --name <slug>  # 离线生成迁移包（首次会同时生成 baseline 包）
npx prisma db migrate --show             # 只读预览将要应用的包
npx prisma db migrate                    # 应用（本次 13 个操作全部 additive）
npx prisma migration status              # "Up to date"
```

要点：`migration plan` 离线不查库；`db update` 对破坏性操作要求输入库名同意，因此本流程强制「先 dry-run 人读、确认全 additive、再 plan/migrate」。
禁止 `db init`（会重建）与任何 data-loss 同意。新列均可选或带默认值，`git revert` contract 后重跑 `emit + db update` 即可回滚。
