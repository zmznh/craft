# ADR-0003：元数据增量同步采用游标轮询

- 状态：已接受
- 日期：2026-10-01
- 分支：`deploy/vps-fullstack-offsite-backup`

## 背景

Crafty 有三套同步机制，其中两套已由既有组件覆盖：

| 数据 | 真源 | 机制 | 状态 |
|---|---|---|---|
| 文档正文 | `YjsDocumentState.state` | Hocuspocus WS 增量 | 已有 |
| 白板 | 内存 room → `Whiteboard.data` | tldraw-sync WS | 已有 |
| 其余元数据 | Postgres 行 | Prisma + REST | **无实时，本 ADR 解决** |

元数据指：目录树、文档标题/图标/排序、收藏、标签、集合（Collection）及其属性/项/值/视图、白板列表、任务、日记配置、分享开关。

使用场景是**单人 2–3 台设备**，目标是秒级感知，不是多人协作。

## 决策

**`GET /api/sync/changes?since=<cursor>` + 客户端定时轮询。不引入 WebSocket / SSE / 托管实时服务。**

响应结构：

```jsonc
{
  "cursor": "2026-10-01T04:00:00.000Z",   // 下次请求带回
  "hasMore": false,                        // 有表撞到单表上限，立即再拉一次
  "changes": { "Document": [...], "Folder": [...] },  // updatedAt > since
  "full":    { "Tag": [...], "Favorite": [...] }      // 无 updatedAt，每次全量
}
```

### 为什么不推送

单人场景下 2–3 秒轮询只需几十行客户端代码。SSE/WebSocket 要处理断线重连、代理缓冲、超时、连接数上限，而换来的只是"少几百毫秒延迟"——对一个人在两台设备间切来切去的场景没有实际差别。托管实时服务（Liveblocks、Supabase Realtime）按连接数计费，与"成本接近 0"的目标直接冲突。

### 表分两类

**增量表**（有 `updatedAt`）：Folder、Document、Whiteboard、Task、Collection，以及通过父 id 归属的 DocumentShare、CollectionProperty、CollectionItem、CollectionView、CollectionValue。

**全量表**（**没有 `updatedAt` 列，只有 `createdAt`**）：Tag、DocumentTag、Favorite、Backlink。

这四张表做不了游标，且**删除也无法检测**（无软删字段）。选项只有两个：改 schema 加 `updatedAt` + 软删，或者每次全量。实测开发库规模：Tag 2 行、DocumentTag 2 行、Favorite 0 行、Backlink 64 行——每次全量只多几 KB。所以选全量，零迁移。

若将来任一关联表达到数千行，再给它们加 `updatedAt` 与软删列并转为增量；接口形状不变，客户端无感。

### 不传正文（红线）

`Document.content`、`Document.plainText`、`Whiteboard.data` **不在任何白名单里**。正文由 Yjs 同步，白板由 tldraw-sync 同步；把它们塞进轮询载荷既浪费带宽，又会给正文造出第二个真源——那正是 ADR-0001 刚消灭的问题。

测试里有显式断言守住这条：`FORBIDDEN_COLUMNS` 不得出现在任何表的列白名单中。

同样排除的还有 `password`、`passcode`、`token`、`shareToken`。分享的**开关状态**（`isPublished`/`slug`/`sharePermission`/`shareVersion`）要同步，但令牌本身不外发。

### 租户隔离

每张表都必须收敛到调用者自己的行。两类做法：

- 直接带 `userId` 的表 → `where({ userId })`
- 挂在父对象上的表 → `IN (<父 id 集合>)`

**踩坑**：ORM 的对象形式 `where({ id: { in: [...] } })` **不报错但静默匹配 0 行**。必须用回调形式 `where((d) => d.id.in([...]))`。已写进代码注释。

另有一个实现陷阱：如果把父 id 过滤放到内存里做（先按游标取一页再 filter），别人的行会占满页预算，导致 `hasMore` 永远为 true、客户端陷入无限轮询。所以过滤必须在 SQL 层完成。

## 已知代价

1. **延迟上限 = 轮询间隔**。默认建议 2–3 秒。
2. **游标是毫秒截断，Postgres 存微秒**。同一毫秒内的行会被重放一次。客户端按 id 幂等覆盖即可，无害；测试断言的是"重放行必须是上一批已发过的行"，而非"第二批次为空"。
3. **单次请求有额外查询**：为了给父 id 集合做过滤，每次会全量取一次 `Document.id`、`Collection.id`、`CollectionItem.id`。只取 id 列，单人规模下是毫秒级。
4. **全量表每次都传**。
5. `hasMore` 为 true 时客户端应立即再拉一次，否则会落后。

## 未覆盖

- `CommentThread` / `Comment`：评论是协作功能，单人自用基本不用；且过滤需要 documentId 集合再套一层。暂不同步。
- `DocumentMember`：协作者名单，单人场景为空。
- `DocumentVersion`：版本历史体积大且低频，按需拉取即可，不进轮询。

## 实施中发现：schema 真源不是 `prisma/schema.prisma`

`prisma/schema.prisma` 已过时——它缺少 `Document.pageStyle`、`Task`、`DocumentShare`、`DocumentMember`、`CommentThread`、`Comment`、`Backlink.sourceBlockId`、`Whiteboard.share*` 等。真正的 contract 真源是 **`src/prisma/contract.prisma`**（`contract.json` / `contract.d.ts` 由它生成）。

本次实现按 `contract.prisma` 取字段。建议后续把 `prisma/schema.prisma` 删掉或明确标注为废弃，避免再被当成真源。
