# ADR-0001: 文档正文以 Yjs 房间为唯一真源

- 状态：已接受
- 日期：2026-10-01

## 场景

Crafty 的文档正文同时存在两份存储：

1. `YjsDocumentState.state` —— Yjs 房间二进制，由 Hocuspocus 增量同步；
2. `Document.content` —— ProseMirror JSON，由每个打开的编辑器客户端在 2 秒 debounce 后**全量覆盖写入**。

`Document.content` 被搜索、导出、公开分享页、块镜像、版本快照读取，因此不能删除。但两处都可写、且
没有任何版本关联，构成典型的双真源。在单人多设备场景下它已经足以造成丢内容：

- **陈旧覆盖**：设备 A 改完落库为 v2；设备 B 的编辑器仍持有 v1，其 debounce 触发后用 v1 全量覆盖 v2。
- **播种翻倍**：一篇尚未进入 Yjs 的存量文档被两台设备同时首次打开，双方各自把 `Document.content`
  灌进空房间，CRDT 合并两次独立插入 → 正文翻倍。

协作模式下每个客户端都是写者，客户端越多，覆盖窗口越宽。

## 决策

对**开启了协作的文档**，确立单一真源与单向数据流：

```
编辑器 ──(Yjs 增量)──▶ Hocuspocus 房间 ──(真源)──▶ YjsDocumentState.state
                                          │
                                          └──(服务端派生, 只读)──▶ Document.content
                                                                   / plainText / wordCount
```

1. **Yjs 房间是唯一真源。** 客户端在协作模式下不再写 `Document.content`。
2. **`Document.content` 是服务端派生的只读镜像。** 由 `src/collab/persist.mjs` 在房间落库时
   用 `@tiptap/y-tiptap` 的 `yDocToProsemirrorJSON` 渲染后回写，供搜索/导出/分享/块镜像读取。
3. **空房间不得回写。** `deriveSnapshot` 在 `getXmlFragment('default').length === 0` 时返回 null，
   避免新建的空房间把尚未迁移的存量正文清零。
4. **播种需服务端原子认领。** 新增 `POST /api/collab/claim-seed`，以 `yjs_document_states`
   的唯一 `documentId` 索引作为锁，首个插入者获得播种权；认领后未产出字节且超过 5 分钟视为作废，
   允许他人接管。
5. **非协作模式维持原状。** 此时不存在 Yjs 房间，`Document.content` 本身就是唯一真源，不构成双写。
   两种模式互斥，任一时刻只有一个真源。

## 理由

- 服务端是唯一写者，天然消除并发覆盖；不再需要版本号、锁或冲突提示。
- `@tiptap/y-tiptap` 的反向转换**不需要 ProseMirror schema**，因此纯 Node 的 collab 进程即可完成派生，
  不必把编辑器的整个扩展栈搬进服务端。已用 round-trip 验证：JSON → Yjs → JSON 完全一致，
  且派生结果可被 schema 正常解析。
- 用数据库唯一索引做认领锁，不引入 Redis、MQ 或任何新组件。

## 代价与后果

- **派生有延迟**：`Document.content` 的更新跟随房间 checkpoint（debounce 1s / maxDebounce 5s），
  不再是编辑即写。搜索与导出读到的是最多落后数秒的镜像。对单人自用可接受。
- **派生值是近似值**：`plainText` 以换行连接块文本，`wordCount` 取拼接字符数，与编辑器
  `characterCount.characters()` 不保证逐字相等。镜像只用于检索与展示，不参与计费或配额。
- **新增依赖方向**：collab 服务现在依赖 `@tiptap/y-tiptap`。它已是
  `@tiptap/extension-collaboration` 的既有传递依赖（tiptap 3.x 用它替代 `y-prosemirror`），
  未引入新第三方库，但升级 tiptap 主版本时需重新验证转换兼容性。
- **播种失败会留空**：认领后若客户端在写入前崩溃，该文档在 5 分钟内无人可播种，期间打开为空白。
  这是为消除翻倍所付的代价；恢复手段是等待作废或直接删除该空状态行。
- **版本快照改由服务端接管**：`DocumentVersion` 原先是 `updateDocument` 写 content 时的副作用。
  客户端不再写 content 后该副作用消失，因此改为在 `mirrorDocumentContent` 派生成功后由服务端按同样的
  10 分钟节流写入，避免版本历史静默断裂。

## 验证

- `src/collab/derive-snapshot.test.mjs`：镜像渲染、空房间守卫、脏数据守卫、atom 节点标签可检索。
- `src/collab/persist.test.mjs`：连接真实数据库的往返存取仍然通过。
