# craft.do 基准采集规程

> **状态：已执行过一轮（2026-09-25 中午）。** 此前"本机无外网"是误判：Craft 产品端域名是
> `docs.craft.do`，`app.craft.do` 才是不通的；用户 Edge 里就有登录态。
> 实际采集走的是下面的 **路径 B**，产物见 `tokens.md` 与 `ref-*-desktop.png`。
> 路径 B 的四条坑（`playwright.evaluate` 恒返回 null、`pageAssets.bundle()` 恒报 snapshot is stale、
> CDP 只放开 `DOM.*` 因而拿不到 computed style、`viewport.set()` 静默无效）已写在文末与项目记忆里，
> 下次别再试。

## 路径 A：Playwright 独立采集（需自己的账号会话）

产物进本目录：`ref-<screen>-<desktop|tablet|mobile>.png` + `tokens.json`。
对照结论写进 `visual-diff-checklist.md`（逐项处置）与 `manual-checklist.md`（逐屏状态与偏差表）。

## 前置

- **外网可达**：本机 2026-09-24/25 实测 `app.craft.do` DNS 解析失败、`google.com` 连接超时，
  唯一可达的是 Playwright 浏览器 CDN。因此本规程尚未执行过一次完整采集，`ref-*.png` 为空，
  `manual-checklist.md` 的"参考"列全是 `⏳待采`。网络恢复后从这里开始。
- 一个已登录的 craft.do 账号（免费档即可覆盖全部界面形态）。
- Playwright 浏览器已装：`npx playwright install chromium`（离线时可用镜像
  `PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright/`）。

## 步骤

```bash
# 1)  headed 登录一次，会话存到 e2e/.craft-ref-state.json（已 gitignore）
node scripts/capture-ref.mjs --login

# 2)  13 个静态路由 × 3 档
node scripts/capture-ref.mjs

# 3)  实体屏（文档 / 集合详情 / 白板）URL 因账号而异，用 --only 命名 + --path 指定
node scripts/capture-ref.mjs --only=document-detail --path=/documents/<id>
node scripts/capture-ref.mjs --only=collection --path=/collections/<id>
node scripts/capture-ref.mjs --only=whiteboard --path=/whiteboards/<id>

# 4)  右栏四 tab、集合四视图、日历月格这类"同一 URL 不同状态"的屏，脚本不模拟交互：
#     用 --login 的 headed 窗口手动切到该状态，或直接改 SCREENS 临时加一条带 hash/查询的路径，
#     再按 `ref-<screen>-<w>.png` 命名手动补图
```

## 每屏要记的字段

`tokens.json` 由脚本自动写入，键为 `<screen>@<viewport>`，值为下列属性在
`body / main / nav / card / button / h1 / input` 上的 `getComputedStyle` 结果：

`background-color, color, font-family, font-size, line-height, letter-spacing, padding, gap, border-radius, border-color`

对齐时按 `manual-checklist.md` 第二节表逐行填：基准值 | 本地值 | Δ | 处置 | 是否有意偏差。

## 判读规则

- **Δ ≤ 1px / 色相差 ΔHue ≤ 2**：视为一致，不改。
- **专有字体/图标/主题位图**：不搬运，用系统衬线栈 / lucide / 自绘图标近似（本轮既定边界）。
  例外：**Inter 不是近似，是官方 Web 端字体栈第一位**（`--font-family: "Inter", var(--cjk-sans),
  "Pretendard", -apple-system, …`），所以本地用 Inter 属"与官方一致"而非偏差。
- **暗色主题**：已按官方 `[data-theme=dark]` 的 `30/30/30` + `35/35/35` + `249/249/249` 改过，
  官方是中性和灰、**不带蓝紫偏色**。
- **单一来源**：本地值只从 `src/app/globals.css` 的 token 读，不接受组件里写死的十六进制；
  发现写死即视为缺陷，改回 token。
- 采集失败的单屏不阻塞整批（脚本按屏 try/catch，把错误写进 `tokens.json`），会话过期就重跑
  `--login`。

## 路径 B：Browser Agent 走用户已登录会话（本轮实际用法）

不需要账号密码，也不要把凭据写进任何脚本或对话。

```js
// node_repl 里
const { createBrowserAgent } = await import('@qoder-space/computer-use-sdk');
const agent = await createBrowserAgent();
const browser = await agent.browsers.get(<browsers.list() 返回的 Edge id>);
const tab = await browser.tabs.new();
await tab.goto('https://docs.craft.do/');       // 会跳到该账号的 /s/<space>/all
await tab.markHandoff();                        // 否则本 turn 结束标签页被自动关闭
```

1. **截图**：`await tab.screenshot({format:'png'})` 拿字节，用 `fs.writeFile` 落
   `docs/craft-ref/ref-<screen>-<w>.png`。下一 turn 用 `browser.tabs.list()` + `tabs.get(id)` 重新取回标签页。
2. **设计 token**：`browser.tabs.content({ urls:[<index.css 地址>], contentType:'text' })`
   直接取回官方样式表全文（`contentType` 只认 `text`），再用正则抽 `[data-theme=light|dark]{…}`
   与 `--*` 定义；rgb → oklch 换算用一段 node 现算。
3. **几何**：`tab.playwright.elementInfo({x, y})` 返回该点命中的元素栈（含 `bounds`），
   用它量侧栏/顶栏/卡片宽高。
4. **不要试的四条路**：`tab.playwright.evaluate(...)` 恒返回 `null`；`pageAssets.bundle()` 恒报
   `snapshot is stale`；CDP 只放开 `DOM.*`，`CSS.enable` 被拒所以拿不到 computed style；
   `viewport.set({width,height})` 返回 `undefined` 但**不生效**（截图仍是窗口内尺寸）。
5. 截图含用户真实内容 → `ref-*.png` 已进 `.gitignore`，只留本地对照。

## 与自动化的分工

本目录的 `ref-*` 是**人看的对照图**；CI 门禁是 `e2e/visual.spec.ts` 的 126 张本地基线
（42 视图状态 × 3 档，掩码掉侧栏树/日历格/时间戳）。两者不互替：基线防回归，`ref-*` 定"对不对"。
