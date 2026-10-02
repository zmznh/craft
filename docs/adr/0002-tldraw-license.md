# ADR-0002: 白板保留 tldraw，走免费 Hobby License

- 状态：已接受（待用户完成申请动作）
- 日期：2026-10-01

## 场景

白板基于 `tldraw@5.4.2` + `@tldraw/sync@5.4.2`。既有文档 `docs/superpowers/notes/tldraw-license-gate.md`
（2026-09-24 核验）记录的条款是「保留 "Made with tldraw" 水印即可使用」，并据此禁止公网部署。

该结论已过时。tldraw SDK 自 4.0（2025-09）起改为 License Key 强制制，水印不再是免费使用的对价。
需要重新判断：保留 tldraw，还是迁移到 MIT 协议的 Excalidraw。

## 决策

**保留 tldraw，申请免费 Hobby License，保留水印。不迁移 Excalidraw。**

## 理由

核实现行条款（tldraw 官方文档 License / License key 页，及官方 2026-06 发布的勘误文）：

| 环境 | 判定 | 是否需要 Key |
|---|---|---|
| Development | HTTP / localhost / `NODE_ENV !== 'production'`（满足任一） | 否，完全免费 |
| Production | HTTPS + 非 localhost 域名 + `NODE_ENV=production` | **是** |

- **自托管不豁免**：条款约束的是环境而非部署位置，自家服务器给真实用户用仍属 Production。
- **Crafty 单人自用、非商业** → 符合 **Hobby License**（免费），代价是必须保留画布水印、且需提交申请
  由 tldraw 审核（非自动授予）。
- Commercial License 为付费年费、价格未公开、需联系销售 —— 这是本架构中唯一可能远超服务器成本的
  支出项，但在非商业前提下不需要。

迁移到 Excalidraw 的代价明显更高：替换画布组件、重写 `@tldraw/sync` 协同后端（Excalidraw 无官方
sync server）、迁移 `Whiteboard.data` 已存的场景数据格式。在非商业自用前提下不划算。

## 关键风险：无 Key 上生产不是"加水印"，而是白屏

`LicenseProvider` 判定 unlicensed-production 后先正常渲染 `LICENSE_TIMEOUT = 5000ms`，然后把整个
子树替换为隐藏节点。表现是「白板正常工作 5 秒后变空白」，极难排查。

因此**公网 HTTPS 部署前必须完成以下动作**（属于部署前置条件，非代码改动）：

1. 向 tldraw 提交 Hobby License 申请，等待审核下发 Key；
2. 部署环境配置 `NEXT_PUBLIC_TLDRAW_LICENSE_KEY=<key>`。SDK 自动读取该环境变量，
   **无需改代码**；Key 为客户端校验、可公开，放入前端 bundle 是安全的；
3. 确认部署域名在 Key 的 `hosts` 覆盖范围内（Key 绑定域名，未授权域名按未授权处理）。

## 代价与后果

- Hobby License 需人工申请且有审核不确定性；在拿到 Key 之前**不得公网 HTTPS 部署白板**。
- 水印必须保留，`Board.tsx` 及任何样式都不得隐藏水印 DOM —— 这是 Hobby 许可的条件，
  也是既有文档已立的红线。
- **商业化触发重新决策**：一旦对外提供服务或产生商业用途，Hobby 不再适用，必须购买 Commercial
  License，否则应改走 Excalidraw 迁移。
- 已同步重写 `docs/superpowers/notes/tldraw-license-gate.md`，标注旧结论作废并补充完整条款与备选方案。

## 未做的事

- 未申请 Key（需用户本人完成，涉及向第三方提交项目信息）。
- 未在代码中显式传 `licenseKey` prop（SDK 自动读环境变量，显式传入反而增加泄露与维护面）。
- 未加运行期告警：如需在「缺 Key 的生产构建」下提前预警，可另加一条构建期检查，当前未做。
