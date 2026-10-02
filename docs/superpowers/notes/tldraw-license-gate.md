# 阶段6 前置门槛核验：tldraw 许可、sync 包版本、Prisma 迁移流程

核验日期：2026-09-24。本文件是 `docs/superpowers/plans/2026-09-23-tldraw-whiteboard-collaboration.md` Task 1 的书面结论；
门槛通过，Task 2 及之后才允许安装依赖与修改 contract。

## 1. 许可（tldraw SDK License）

> **2026-10-01 重新核验：本节的旧结论已作废。** 旧版写的是「保留水印即可商用」，那是 tldraw SDK
> 4.0（2025-09）之前的模型。当前条款已改为 **License Key 强制制**，水印不再是「免费使用」的对价，
> 而是 Hobby 许可下的显示要求。以下为核实后的现行规则。

来源：tldraw 官方文档 `tldraw.dev/community/license`、`tldraw.dev/sdk-features/license-key`，
以及 `tldraw.dev/blog/20-things-i-wish-ai-chatbots-knew-about-tldraw`（2026-06 发布，官方逐条勘误）。

### 现行规则

- SDK 自 4.0 起为 **source-available**，不是 MIT/Apache。`npm` 包与 GitHub 源码均为 `tldraw license`。
- **Development Environment 完全免费、无需 Key**。判定条件（满足任一即为开发态）：
  `HTTP` 协议 / `localhost` / `NODE_ENV !== 'production'`。
- **Production Environment 必须有合法 Key**。判定条件：`HTTPS` + 非 localhost 域名 + `NODE_ENV=production`。
- **自托管不豁免**。条款约束的是「环境」，不是「字节跑在哪」。自己服务器上给真实用户用，
  即使是单人自用，仍是 Production Environment，仍需要 Key。
- **无 Key 上生产的后果不是加水印，而是白屏**：`LicenseProvider` 判定为 unlicensed-production 后，
  先正常渲染 `LICENSE_TIMEOUT = 5000ms`，随后把整个子树替换成隐藏节点。用户看到白板工作 5 秒后变空白，
  且这个现象极难排查。

### 三种 License

| 类型 | 费用 | 水印 | 适用 | 备注 |
|---|---|---|---|---|
| Trial | 免费 | 无 | 购买前评估 | 100 天，每个商业单位限一次，无宽限期 |
| Hobby | **免费** | **必须保留** | 非商业项目 | 需提交申请、由 tldraw 审核（discretionary），非自动授予 |
| Commercial | 付费（需联系销售，价格未公开） | 无 | 任何商业用途 | 年费；startup 定价可能存在，需核实 |

Key 绑定域名（`hosts`，支持 `*.example.com` 通配），部署到未授权域名按未授权处理。
商业/Hobby Key 不回传任何数据；Trial Key 回传 Key 哈希与部署域名；未授权状态会回传域名用于水印统计。

### 结论与执行约束

1. **Crafty 当前为单人自用、非商业** → 走 **Hobby License**（免费），**不需要**迁移到 Excalidraw。
   前提是：不商业化、不对外提供服务，且保留画布水印。
2. **公网 HTTPS 部署前必须先拿到 Key 并配置**，否则白板会在 5 秒后变空白。配置方式二选一：
   - 环境变量 `NEXT_PUBLIC_TLDRAW_LICENSE_KEY=<key>`（SDK 自动读取，无需改代码）；
   - 或 `<Tldraw licenseKey={...} />` 显式传入。
   Key 是客户端校验、可公开，放进前端 bundle 是安全的。
3. **不得**移除、隐藏或干扰水印，不得绕过任何 License 校验（`Board.tsx` 中也不得隐藏水印 DOM）。
4. **商业化前必须重新评估**：一旦转为商业用途，Hobby 不再适用，需购买 Commercial License。
   这是本次架构里**唯一可能远超服务器成本的支出项**，立项时应先向官方询价。
5. 依赖版本随 `package.json` 锁定，升级 tldraw 主版本前需重新核验许可条款。

### 备选方案（仅在 Hobby 申请被拒或成本不可接受时启用）

`excalidraw/excalidraw` 为 MIT 协议，无需 Key、无水印、无遥测。迁移代价：替换 `Board.tsx` 的画布组件、
重写 `@tldraw/sync` 的协同后端（Excalidraw 无官方 sync server，需自建或用其自带方案的 WebSocket 广播）、
以及迁移 `Whiteboard.data` 中已存的场景数据格式。**不要因为「怕麻烦」提前迁移，也不要因为「先用着」拖到商业化之后**。

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
