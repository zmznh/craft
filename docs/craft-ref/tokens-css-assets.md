# craft.do 全量 CSS 资产与 token dump（2026-09-25 实测）

来源：用户已登录会话的 docs.craft.do 产物（Edge + Qoder Browser Connector 1.7.5）。只记录数值 token，不保存第三方源码本体。
采集：`pageAssets.list()` 取清单 → `tabs.content({contentType:"text"})` 取原文 → 页内解析。上一轮只解析了 index.css 的首个 light/dark 块，本文补齐 13 个资产与 23 个主题块。

## 一、CSS 资产清单（13 个，逐屏并集）

| 文件 | 字节 | 唯一自定义属性 | data-theme 块 | 字体 / 备注 |
|---|---|---|---|---|
| css/vendor-code-editor.css.DkZwelau.css | 29193 | 0 | 0 | 无自定义属性；39 个 KaTeX woff2 |
| css/vendor-excalidraw.css.tkYuNB5W.css | 163877 | 220 | 0 | 220 个白板 `--color-*` |
| css/index.css.CP00jDAy.css | 296789 | 546 | 23 | 主 token 源，23 个主题块 |
| roboto-mono/fontdef.css | 3382 | 0 | 0 | 字体资产 |
| avenir-next-rounded/fontdef.css | 1485 | 0 | 0 | 字体资产 |
| source-serif/fontdef.css | 353 | 0 | 0 | 字体资产 |
| inter/fontdef.css | 325 | 0 | 0 | 字体资产 |
| untitled-serif/fontdef.css | 1045 | 0 | 0 | 字体资产 |
| common/fontdef.css | 25401 | 0 | 0 | 字体资产 |
| m-plus-rounded-1c/fontdef.css | 308022 | 0 | 0 | 字体资产 |
| css/TaskViews.css.DghTjfLb.css | 2240 | 0 | 0 | 仅 /tasks 与 /calendar 加载 |
| css/BlankFont.css.CSdHt10-.css | 25567 | 0 | 0 | 无自定义属性，无 woff2 |
| css/AIChatPopup.css.D9rwJ006.css | 333 | 0 | 0 | 333 字节，无 token |

- `TaskViews.css` 仅在 `/tasks`、`/calendar` 加载 → 必须逐屏取并集才能采齐。
- `vendor-code-editor.css` 无自定义属性（纯类名 + 39 个 KaTeX 字体），代码块样式靠类名。
- `vendor-excalidraw.css` 自带 220 个 `--color-*` 等白板 token。

## 二、主题块分布（index.css 共 23 个 `[data-theme=…]` 块）

根级 light 合并 **308** 个属性，根级 dark 合并 **156** 个；accent 主题块 **0** 个；组件级主题覆盖 **3** 个。

### 组件级主题覆盖（上轮完全漏掉）

- `[data-theme=dark] ._popup_r2vgo_51` → --popup-bg-supported: rgb(35 35 35 / 85%)；--popup-bg-unsupported: rgb(35 35 35 / 100%)
- `[data-theme=dark] ._drawerPopup_r2vgo_203` → --popup-bg-supported: rgb(35 35 35 / 85%)；--popup-bg-unsupported: rgb(35 35 35 / 100%)
- `[data-theme=dark] ._pill_10sqk_13` → --pill-bg-supported: rgb(35 35 35 / 85%)；--pill-bg-unsupported: rgb(35 35 35 / 100%)

### accent 主题块

accent 切换块不带 `data-theme` 前缀，共 12 个，列在第五节。

## 三、全量 light / dark 对照（376 个根级 token）

| token | light | dark |
|---|---|---|
| --accent-blue | 46 109 233 | 113 178 255 |
| --accent-blue-100 | rgb(var(--accent-blue) / 12%) | — |
| --accent-blue-150 | rgb(var(--accent-blue) / 18%) | — |
| --accent-blue-200 | rgb(var(--accent-blue) / 24%) | — |
| --accent-blue-250 | rgb(var(--accent-blue) / 32%) | — |
| --accent-blue-300 | rgb(var(--accent-blue) / 40%) | — |
| --accent-blue-350 | rgb(var(--accent-blue) / 55%) | — |
| --accent-blue-400 | rgb(var(--accent-blue) / 70%) | — |
| --accent-blue-450 | rgb(var(--accent-blue) / 85%) | — |
| --accent-blue-50 | rgb(var(--accent-blue) / 6%) | — |
| --accent-blue-500 | rgb(var(--accent-blue) / 100%) | — |
| --accent-blue-550 | rgb(44 103 217 / 100%) | rgb(124 184 255 / 100%) |
| --accent-blue-600 | rgb(43 97 203 / 100%) | rgb(133 189 254 / 100%) |
| --accent-blue-650 | rgb(42 91 188 / 100%) | rgb(143 194 254 / 100%) |
| --accent-blue-700 | rgb(40 85 172 / 100%) | rgb(154 199 253 / 100%) |
| --accent-blue-750 | rgb(38 78 156 / 100%) | rgb(165 205 253 / 100%) |
| --accent-blue-800 | rgb(37 72 141 / 100%) | rgb(174 210 252 / 100%) |
| --accent-blue-850 | rgb(36 67 127 / 100%) | rgb(184 215 252 / 100%) |
| --accent-blue-900 | rgb(34 60 111 / 100%) | rgb(195 221 251 / 100%) |
| --accent-contrast | 255 255 255 | var(--base) |
| --accent-contrast-900 | rgb(255 255 255 / 100%) | var(--base-900) |
| --accent-gray | 82 92 102 | 188 194 201 |
| --accent-gray-100 | rgb(var(--accent-gray) / 12%) | — |
| --accent-gray-150 | rgb(var(--accent-gray) / 18%) | — |
| --accent-gray-200 | rgb(var(--accent-gray) / 24%) | — |
| --accent-gray-250 | rgb(var(--accent-gray) / 32%) | — |
| --accent-gray-300 | rgb(var(--accent-gray) / 40%) | — |
| --accent-gray-350 | rgb(var(--accent-gray) / 55%) | — |
| --accent-gray-400 | rgb(var(--accent-gray) / 70%) | — |
| --accent-gray-450 | rgb(var(--accent-gray) / 85%) | — |
| --accent-gray-50 | rgb(var(--accent-gray) / 6%) | — |
| --accent-gray-500 | rgb(var(--accent-gray) / 100%) | — |
| --accent-gray-550 | rgb(78 87 96 / 100%) | rgb(193 198 205 / 100%) |
| --accent-gray-600 | rgb(74 82 91 / 100%) | rgb(197 202 208 / 100%) |
| --accent-gray-650 | rgb(70 78 86 / 100%) | rgb(201 206 212 / 100%) |
| --accent-gray-700 | rgb(65 73 81 / 100%) | rgb(206 210 215 / 100%) |
| --accent-gray-750 | rgb(61 68 75 / 100%) | rgb(211 215 219 / 100%) |
| --accent-gray-800 | rgb(57 63 70 / 100%) | rgb(216 219 223 / 100%) |
| --accent-gray-850 | rgb(53 59 64 / 100%) | rgb(220 223 226 / 100%) |
| --accent-gray-900 | rgb(48 54 59 / 100%) | rgb(225 227 230 / 100%) |
| --accent-green | 0 194 166 | 77 255 221 |
| --accent-green-100 | rgb(var(--accent-green) / 12%) | — |
| --accent-green-150 | rgb(var(--accent-green) / 18%) | — |
| --accent-green-200 | rgb(var(--accent-green) / 24%) | — |
| --accent-green-250 | rgb(var(--accent-green) / 32%) | — |
| --accent-green-300 | rgb(var(--accent-green) / 40%) | — |
| --accent-green-350 | rgb(var(--accent-green) / 55%) | — |
| --accent-green-400 | rgb(var(--accent-green) / 70%) | — |
| --accent-green-450 | rgb(var(--accent-green) / 85%) | — |
| --accent-green-50 | rgb(var(--accent-green) / 6%) | — |
| --accent-green-500 | rgb(var(--accent-green) / 100%) | — |
| --accent-green-550 | rgb(2 181 155 / 100%) | rgb(90 255 223 / 100%) |
| --accent-green-600 | rgb(4 169 146 / 100%) | rgb(103 254 225 / 100%) |
| --accent-green-650 | rgb(6 158 136 / 100%) | rgb(115 254 227 / 100%) |
| --accent-green-700 | rgb(8 145 125 / 100%) | rgb(128 253 229 / 100%) |
| --accent-green-750 | rgb(10 131 114 / 100%) | rgb(142 253 232 / 100%) |
| --accent-green-800 | rgb(12 119 105 / 100%) | rgb(155 252 234 / 100%) |
| --accent-green-850 | rgb(14 107 95 / 100%) | rgb(167 252 236 / 100%) |
| --accent-green-900 | rgb(16 94 84 / 100%) | rgb(180 251 238 / 100%) |
| --accent-pink | 214 23 155 | 255 106 209 |
| --accent-pink-100 | rgb(var(--accent-pink) / 12%) | — |
| --accent-pink-150 | rgb(var(--accent-pink) / 18%) | — |
| --accent-pink-200 | rgb(var(--accent-pink) / 24%) | — |
| --accent-pink-250 | rgb(var(--accent-pink) / 32%) | — |
| --accent-pink-300 | rgb(var(--accent-pink) / 40%) | — |
| --accent-pink-350 | rgb(var(--accent-pink) / 55%) | — |
| --accent-pink-400 | rgb(var(--accent-pink) / 70%) | — |
| --accent-pink-450 | rgb(var(--accent-pink) / 85%) | — |
| --accent-pink-50 | rgb(var(--accent-pink) / 6%) | — |
| --accent-pink-500 | rgb(var(--accent-pink) / 100%) | — |
| --accent-pink-550 | rgb(199 23 145 / 100%) | rgb(255 117 212 / 100%) |
| --accent-pink-600 | rgb(186 24 136 / 100%) | rgb(254 127 215 / 100%) |
| --accent-pink-650 | rgb(173 24 128 / 100%) | rgb(254 137 218 / 100%) |
| --accent-pink-700 | rgb(158 24 118 / 100%) | rgb(253 149 221 / 100%) |
| --accent-pink-750 | rgb(142 25 107 / 100%) | rgb(253 160 224 / 100%) |
| --accent-pink-800 | rgb(129 25 99 / 100%) | rgb(252 170 227 / 100%) |
| --accent-pink-850 | rgb(116 26 90 / 100%) | rgb(252 181 230 / 100%) |
| --accent-pink-900 | rgb(101 26 80 / 100%) | rgb(251 192 233 / 100%) |
| --accent-purple | 94 2 210 | 191 139 255 |
| --accent-purple-100 | rgb(var(--accent-purple) / 12%) | — |
| --accent-purple-150 | rgb(var(--accent-purple) / 18%) | — |
| --accent-purple-200 | rgb(var(--accent-purple) / 24%) | — |
| --accent-purple-250 | rgb(var(--accent-purple) / 32%) | — |
| --accent-purple-300 | rgb(var(--accent-purple) / 40%) | — |
| --accent-purple-350 | rgb(var(--accent-purple) / 55%) | — |
| --accent-purple-400 | rgb(var(--accent-purple) / 70%) | — |
| --accent-purple-450 | rgb(var(--accent-purple) / 85%) | — |
| --accent-purple-50 | rgb(var(--accent-purple) / 6%) | — |
| --accent-purple-500 | rgb(var(--accent-purple) / 100%) | — |
| --accent-purple-550 | rgb(89 4 196 / 100%) | rgb(196 148 255 / 100%) |
| --accent-purple-600 | rgb(84 6 183 / 100%) | rgb(200 155 254 / 100%) |
| --accent-purple-650 | rgb(79 8 170 / 100%) | rgb(204 163 254 / 100%) |
| --accent-purple-700 | rgb(74 10 156 / 100%) | rgb(208 172 253 / 100%) |
| --accent-purple-750 | rgb(68 12 142 / 100%) | rgb(213 181 253 / 100%) |
| --accent-purple-800 | rgb(63 14 129 / 100%) | rgb(217 189 252 / 100%) |
| --accent-purple-850 | rgb(59 16 116 / 100%) | rgb(221 196 252 / 100%) |
| --accent-purple-900 | rgb(53 18 102 / 100%) | rgb(226 205 251 / 100%) |
| --accent-yellow | 228 192 17 | 255 233 123 |
| --accent-yellow-100 | rgb(var(--accent-yellow) / 12%) | — |
| --accent-yellow-150 | rgb(var(--accent-yellow) / 18%) | — |
| --accent-yellow-200 | rgb(var(--accent-yellow) / 24%) | — |
| --accent-yellow-250 | rgb(var(--accent-yellow) / 32%) | — |
| --accent-yellow-300 | rgb(var(--accent-yellow) / 40%) | — |
| --accent-yellow-350 | rgb(var(--accent-yellow) / 55%) | — |
| --accent-yellow-400 | rgb(var(--accent-yellow) / 70%) | — |
| --accent-yellow-450 | rgb(var(--accent-yellow) / 85%) | — |
| --accent-yellow-50 | rgb(var(--accent-yellow) / 6%) | — |
| --accent-yellow-500 | rgb(var(--accent-yellow) / 100%) | — |
| --accent-yellow-550 | rgb(212 179 18 / 100%) | rgb(255 234 133 / 100%) |
| --accent-yellow-600 | rgb(198 168 19 / 100%) | rgb(254 235 142 / 100%) |
| --accent-yellow-650 | rgb(184 156 20 / 100%) | rgb(254 237 151 / 100%) |
| --accent-yellow-700 | rgb(168 143 21 / 100%) | rgb(253 238 161 / 100%) |
| --accent-yellow-750 | rgb(151 130 22 / 100%) | rgb(253 239 171 / 100%) |
| --accent-yellow-800 | rgb(137 118 23 / 100%) | rgb(252 240 180 / 100%) |
| --accent-yellow-850 | rgb(123 106 24 / 100%) | rgb(252 241 189 / 100%) |
| --accent-yellow-900 | rgb(107 94 25 / 100%) | rgb(251 243 199 / 100%) |
| --base | 252 253 254 | 30 30 30 |
| --base-overlay | rgb(252 252 252 / 100%) | rgb(35 35 35 / 100%) |
| --blue | 0 136 255 | 0 145 255 |
| --blue-550 | — | rgb(20 153 255 / 100%) |
| --blue-600 | — | rgb(37 160 254 / 100%) |
| --blue-650 | — | rgb(55 168 254 / 100%) |
| --blue-700 | — | rgb(74 176 253 / 100%) |
| --blue-750 | — | rgb(95 185 253 / 100%) |
| --blue-800 | — | rgb(112 192 252 / 100%) |
| --blue-850 | — | rgb(130 199 252 / 100%) |
| --blue-900 | — | rgb(149 207 251 / 100%) |
| --body-md-400-italic-letter-spacing | -.04px | — |
| --body-md-400-italic-line-height | 15.6px | — |
| --body-md-400-italic-size | 13px | — |
| --body-md-400-italic-style | italic | — |
| --body-md-400-italic-weight | 400 | — |
| --body-md-400-letter-spacing | -.04px | — |
| --body-md-400-line-height | 15.6px | — |
| --body-md-400-size | 13px | — |
| --body-md-400-weight | 400 | — |
| --body-md-500-italic-letter-spacing | -.04px | — |
| --body-md-500-italic-line-height | 15.6px | — |
| --body-md-500-italic-size | 13px | — |
| --body-md-500-italic-style | italic | — |
| --body-md-500-italic-weight | 500 | — |
| --body-md-500-letter-spacing | -.04px | — |
| --body-md-500-line-height | 15.6px | — |
| --body-md-500-size | 13px | — |
| --body-md-500-weight | 500 | — |
| --body-md-600-letter-spacing | -.04px | — |
| --body-md-600-line-height | 15.6px | — |
| --body-md-600-size | 13px | — |
| --body-md-600-weight | 600 | — |
| --brand-beige-100 | — | rgb(209 166 122 / 100%) |
| --brand-beige-200 | — | rgb(225 196 168 / 100%) |
| --brand-beige-300 | — | rgb(237 220 203 / 100%) |
| --brand-beige-400 | — | rgb(246 237 229 / 100%) |
| --brand-beige-50 | — | rgb(170 115 59 / 100%) |
| --brand-beige-500 | — | rgb(250 245 245 / 100%) |
| --brand-blue-100 | — | rgb(24 8 109 / 100%) |
| --brand-blue-200 | — | rgb(45 45 150 / 100%) |
| --brand-blue-300 | — | rgb(50 50 195 / 100%) |
| --brand-blue-400 | — | rgb(46 109 233 / 100%) |
| --brand-blue-50 | — | rgb(18 6 82 / 100%) |
| --brand-blue-500 | — | rgb(113 178 255 / 100%) |
| --brand-blue-600 | — | rgb(141 194 255 / 100%) |
| --brand-blue-700 | — | rgb(170 209 255 / 100%) |
| --brand-blue-800 | — | rgb(212 232 255 / 100%) |
| --brand-blue-900 | — | rgb(232 243 255 / 100%) |
| --brand-coral-300 | — | rgb(249 150 126 / 100%) |
| --brand-coral-400 | — | rgb(251 180 162 / 100%) |
| --brand-coral-500 | — | rgb(252 203 190 / 100%) |
| --brand-green-100 | — | rgb(0 46 31 / 100%) |
| --brand-green-200 | — | rgb(0 56 37 / 100%) |
| --brand-green-300 | — | rgb(0 72 48 / 100%) |
| --brand-green-400 | — | rgb(0 117 88 / 100%) |
| --brand-green-50 | — | rgb(0 41 27 / 100%) |
| --brand-green-500 | — | rgb(0 155 140 / 100%) |
| --brand-green-600 | — | rgb(128 205 197 / 100%) |
| --brand-red | 227 32 87 | — |
| --brand-red-100 | — | rgb(118 15 44 / 100%) |
| --brand-red-200 | — | rgb(140 18 52 / 100%) |
| --brand-red-300 | — | rgb(177 22 66 / 100%) |
| --brand-red-400 | — | rgb(213 27 79 / 100%) |
| --brand-red-50 | — | rgb(82 10 30 / 100%) |
| --brand-red-500 | — | rgb(227 32 87 / 100%) |
| --brand-red-600 | — | rgb(241 143 171 / 100%) |
| --brand-red-700 | — | rgb(248 201 215 / 100%) |
| --brand-red-800 | — | rgb(252 228 235 / 100%) |
| --brand-red-900 | — | rgb(253 242 245 / 100%) |
| --browse-max-width | 1630px | — |
| --caption-lg-400-letter-spacing | .05px | — |
| --caption-lg-400-line-height | 16px | — |
| --caption-lg-400-size | 12px | — |
| --caption-lg-400-weight | 400 | — |
| --caption-lg-500-letter-spacing | .01px | — |
| --caption-lg-500-line-height | 16px | — |
| --caption-lg-500-size | 12px | — |
| --caption-lg-500-weight | 500 | — |
| --caption-md-400-letter-spacing | .01px | — |
| --caption-md-400-line-height | 16px | — |
| --caption-md-400-size | 11px | — |
| --caption-md-400-weight | 400 | — |
| --caption-md-500-letter-spacing | .05px | — |
| --caption-md-500-line-height | 13.2px | — |
| --caption-md-500-size | 11px | — |
| --caption-md-500-weight | 500 | — |
| --editor-bluedark | rgb(3 0 245 / 100%) | rgb(170 169 249 / 100%) |
| --editor-bluelight | rgb(41 98 246 / 100%) | rgb(65 146 247 / 100%) |
| --editor-brown | rgb(126 80 25 / 100%) | rgb(126 80 25 / 100%) |
| --editor-cyan | rgb(83 183 224 / 100%) | rgb(104 212 251 / 100%) |
| --editor-gradient-blue | linear-gradient( 108.9deg, rgba(40, 188, 190, 1) 0%, rgba(57, 53, 221, 1) 100% ) | linear-gradient( 108.9deg, rgba(159, 246, 209, 1) 0%, rgba(114, 189, 245, 1) 100% ) |
| --editor-gradient-gold | linear-gradient( 108.9deg, rgba(177, 106, 77, 1) 0%, rgba(213, 166, 56, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 224, 169, 1) 0%, rgba(213, 166, 56, 1) 100% ) |
| --editor-gradient-orange | linear-gradient( 108.9deg, rgba(243, 169, 0, 1) 0%, rgba(228, 62, 41, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 130, 114, 1) 0%, rgba(255, 216, 125, 1) 100% ) |
| --editor-gradient-pink | linear-gradient( 108.9deg, rgba(255, 113, 0, 1) 0%, rgba(243, 0, 173, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 102, 86, 1) 0%, rgba(255, 135, 178, 1) 100% ) |
| --editor-gradient-purple | linear-gradient( 109.45deg, rgba(36, 73, 254, 1) 0%, rgba(202, 75, 167, 1) 100% ) | linear-gradient( 108.9deg, rgba(97, 229, 255, 1) 0%, rgba(255, 112, 245, 1) 100% ) |
| --editor-green | rgb(91 199 139 / 100%) | rgb(117 251 190 / 100%) |
| --editor-greydark | rgb(104 116 133 / 100%) | rgb(112 116 120 / 100%) |
| --editor-greylight | rgb(159 164 169 / 100%) | rgb(174 188 199 / 100%) |
| --editor-orange | rgb(240 151 55 / 100%) | rgb(240 151 55 / 100%) |
| --editor-purple | rgb(180 37 246 / 100%) | rgb(209 123 248 / 100%) |
| --editor-red | rgb(219 48 53 / 100%) | rgb(235 80 108 / 100%) |
| --editor-spectrum | conic-gradient( from 180deg at 50% 50%, rgba(255, 0, 0, 1) -54.01deg, rgba(0, 0, 255, 1) 54deg, rgba(0, 255, 0, 1) 147.6deg, rgba(243, 245, 219, 1) 223.2deg, rgba(243, 245, 219, 1) 226.8deg, rgba(255, 0, 0, 1) 306deg, rgba(0, 0, 255, 1) 413.99deg ) | — |
| --editor-text | rgb(31 34 37 / 90%) | rgb(255 255 255 / 90%) |
| --font-family | "Inter", var(--cjk-sans), "Pretendard", -apple-system, blinkmacsystemfont, sans-serif | — |
| --foreground | 26 28 30 | 249 249 249 |
| --green | 52 199 89 | 64 221 138 |
| --green-550 | — | rgb(79 223 147 / 100%) |
| --green-600 | — | rgb(92 225 155 / 100%) |
| --green-650 | — | rgb(105 227 162 / 100%) |
| --green-700 | — | rgb(119 229 171 / 100%) |
| --green-750 | — | rgb(134 232 180 / 100%) |
| --green-800 | — | rgb(147 234 188 / 100%) |
| --green-850 | — | rgb(160 236 196 / 100%) |
| --green-900 | — | rgb(175 238 205 / 100%) |
| --header-height | 48px | — |
| --heading-md-500-letter-spacing | -.09px | — |
| --heading-md-500-line-height | 16px | — |
| --heading-md-500-size | 14px | — |
| --heading-md-500-weight | 500 | — |
| --heading-md-600-letter-spacing | -.09px | — |
| --heading-md-600-line-height | 16px | — |
| --heading-md-600-size | 14px | — |
| --heading-md-600-weight | 600 | — |
| --heading-xs-500-letter-spacing | .01px | — |
| --heading-xs-500-line-height | 12px | — |
| --heading-xs-500-size | 12px | — |
| --heading-xs-500-weight | 500 | — |
| --heading-xs-600-allcaps-letter-spacing | .15px | — |
| --heading-xs-600-allcaps-line-height | 12px | — |
| --heading-xs-600-allcaps-size | 12px | — |
| --heading-xs-600-allcaps-transform | uppercase | — |
| --heading-xs-600-allcaps-weight | 600 | — |
| --heading-xs-600-letter-spacing | .05px | — |
| --heading-xs-600-line-height | 12px | — |
| --heading-xs-600-size | 12px | — |
| --heading-xs-600-weight | 600 | — |
| --heading-xxs-600-allcaps-letter-spacing | .05px | — |
| --heading-xxs-600-allcaps-line-height | 12px | — |
| --heading-xxs-600-allcaps-size | 11px | — |
| --heading-xxs-600-allcaps-transform | uppercase | — |
| --heading-xxs-600-allcaps-weight | 600 | — |
| --heading-xxs-600-letter-spacing | .05px | — |
| --heading-xxs-600-line-height | 12px | — |
| --heading-xxs-600-size | 11px | — |
| --heading-xxs-600-weight | 600 | — |
| --orange | 255 141 40 | 251 164 65 |
| --orange-550 | — | rgb(251 171 79 / 100%) |
| --orange-600 | — | rgb(251 177 92 / 100%) |
| --orange-650 | — | rgb(251 183 105 / 100%) |
| --orange-700 | — | rgb(250 189 120 / 100%) |
| --orange-750 | — | rgb(250 196 135 / 100%) |
| --orange-800 | — | rgb(250 202 148 / 100%) |
| --orange-850 | — | rgb(250 208 161 / 100%) |
| --orange-900 | — | rgb(250 215 175 / 100%) |
| --popupbase-blurred | linear-gradient( 140.99deg, rgba(250, 250, 250, 1) 0%, rgba(247, 247, 247, 1) 100% ) | linear-gradient(140.99deg, rgba(40, 42, 43, 1) 0%, rgba(34, 36, 37, 1) 100%) |
| --radius-full | 9999px | — |
| --radius-lg | 12px | — |
| --radius-md | 8px | — |
| --radius-sm | 4px | — |
| --radius-xl | 16px | — |
| --red | 255 56 60 | 255 66 69 |
| --red-550 | — | rgb(255 80 83 / 100%) |
| --red-600 | — | rgb(254 93 96 / 100%) |
| --red-650 | — | rgb(254 106 109 / 100%) |
| --red-700 | — | rgb(253 121 123 / 100%) |
| --red-750 | — | rgb(253 136 137 / 100%) |
| --red-800 | — | rgb(252 149 150 / 100%) |
| --red-850 | — | rgb(252 161 163 / 100%) |
| --red-900 | — | rgb(251 176 177 / 100%) |
| --shadow-doc | 0px 0px 0px 1px rgba(0, 0, 0, .06), 0px 1px 1px -.5px rgba(0, 0, 0, .06), 0px 3px 3px -1.5px rgba(0, 0, 0, .06), 0px 6px 6px -3px rgba(0, 0, 0, .06), 0px 12px 12px -6px rgba(0, 0, 0, .04), 0px 24px 24px -12px rgba(0, 0, 0, .03) | 0px 0px 0px 1px rgba(0, 0, 0, .12), 0px 1px 1px -.5px rgba(0, 0, 0, .1), 0px 3px 3px -1.5px rgba(0, 0, 0, .1), 0px 6px 6px -3px rgba(0, 0, 0, .1), 0px 12px 12px -6px rgba(0, 0, 0, .08), 0px 24px 24px -12px rgba(0, 0, 0, .08) |
| --shadow-empty | 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0) | 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0) |
| --shadow-inner | inset rgba(255, 255, 255, .88) 0px 0px 0px 1px | inset rgba(255, 255, 255, .04) 0px 0px 0px 1px |
| --shadow-md | 0px 4px 9px 0px rgba(0, 0, 0, .07), 0px 16px 16px 0px rgba(0, 0, 0, .06), 0px 36px 22px 0px rgba(0, 0, 0, .04), 0px 65px 26px 0px rgba(0, 0, 0, .01), 0px 101px 28px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03) | 0px 4px 9px 0px rgba(0, 0, 0, .12), 0px 16px 16px 0px rgba(0, 0, 0, .1), 0px 36px 22px 0px rgba(0, 0, 0, .06), 0px 65px 26px 0px rgba(0, 0, 0, .02), 0px 101px 28px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .12) |
| --shadow-sm | 0px 2px 4px 0px rgba(0, 0, 0, .07), 0px 8px 8px 0px rgba(0, 0, 0, .06), 0px 18px 11px 0px rgba(0, 0, 0, .04), 0px 32px 13px 0px rgba(0, 0, 0, .01), 0px 51px 14px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03) | 0px 2px 4px 0px rgba(0, 0, 0, .1), 0px 8px 8px 0px rgba(0, 0, 0, .09), 0px 18px 11px 0px rgba(0, 0, 0, .05), 0px 32px 13px 0px rgba(0, 0, 0, .01), 0px 51px 14px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .12) |
| --shadow-sr | 0px 1px 2px 0px rgba(0, 0, 0, .05), 0px 4px 4px 0px rgba(0, 0, 0, .04), 0px 9px 5px 0px rgba(0, 0, 0, .03), 0px 16px 6px 0px rgba(0, 0, 0, .01), 0px 25px 7px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03) | 0px 1px 2px 0px rgba(0, 0, 0, .09), 0px 4px 4px 0px rgba(0, 0, 0, .08), 0px 9px 5px 0px rgba(0, 0, 0, .05), 0px 16px 6px 0px rgba(0, 0, 0, .01), 0px 25px 7px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .12) |
| --shadow-xs | 0px 1px 1px 0px rgba(0, 0, 0, .04), 0px 3px 3px 0px rgba(0, 0, 0, .04), 0px 6px 4px 0px rgba(0, 0, 0, .02), 0px 11px 4px 0px rgba(0, 0, 0, .01), 0px 17px 5px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03) | 0px 1px 1px 0px rgba(0, 0, 0, .08), 0px 3px 3px 0px rgba(0, 0, 0, .07), 0px 6px 4px 0px rgba(0, 0, 0, .04), 0px 11px 4px 0px rgba(0, 0, 0, .01), 0px 17px 5px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .12) |
| --shadow-xxs | 0px 0px 0px 1px rgba(0, 0, 0, .04), 0px 1px 1.5px 0px rgba(0, 0, 0, .06), 0px 2.5px 4px 0px rgba(0, 0, 0, .06) | 0px 0px 0px 1px rgba(0, 0, 0, .12), 0px 1px 1.5px 0px rgba(0, 0, 0, .14), 0px 2.5px 4px 0px rgba(0, 0, 0, .16) |
| --spacing-0-5 | .125rem | — |
| --spacing-1 | .25rem | — |
| --spacing-1-5 | .375rem | — |
| --spacing-10 | 2.5rem | — |
| --spacing-12 | 3rem | — |
| --spacing-16 | 4rem | — |
| --spacing-2 | .5rem | — |
| --spacing-2-5 | .625rem | — |
| --spacing-3 | .75rem | — |
| --spacing-3-5 | .875rem | — |
| --spacing-4 | 1rem | — |
| --spacing-4-5 | 1.125rem | — |
| --spacing-5 | 1.25rem | — |
| --spacing-6 | 1.5rem | — |
| --spacing-8 | 2rem | — |
| --transition-duration-fast | .15s | — |
| --transition-duration-medium | .2s | — |
| --transition-duration-slow | .5s | — |
| --transition-easing | cubic-bezier(.4, 0, .2, 1) | — |
| --transition-fast | var(--transition-duration-fast) var(--transition-easing) | — |
| --transition-medium | var(--transition-duration-medium) var(--transition-easing) | — |
| --transition-slow | var(--transition-duration-slow) var(--transition-easing) | — |
| --ui-lg-400-letter-spacing | -.09px | — |
| --ui-lg-400-line-height | 16px | — |
| --ui-lg-400-size | 14px | — |
| --ui-lg-400-weight | 400 | — |
| --ui-lg-500-letter-spacing | -.09px | — |
| --ui-lg-500-line-height | 16px | — |
| --ui-lg-500-size | 14px | — |
| --ui-lg-500-weight | 500 | — |
| --ui-lg-600-letter-spacing | -.09px | — |
| --ui-lg-600-line-height | 16px | — |
| --ui-lg-600-size | 14px | — |
| --ui-lg-600-weight | 600 | — |
| --ui-md-400-letter-spacing | -.04px | — |
| --ui-md-400-line-height | 16px | — |
| --ui-md-400-size | 13px | — |
| --ui-md-400-weight | 400 | — |
| --ui-md-500-letter-spacing | -.04px | — |
| --ui-md-500-line-height | 16px | — |
| --ui-md-500-size | 13px | — |
| --ui-md-500-weight | 500 | — |
| --ui-md-600-letter-spacing | -.04px | — |
| --ui-md-600-line-height | 16px | — |
| --ui-md-600-size | 13px | — |
| --ui-md-600-weight | 600 | — |
| --ui-sm-400-letter-spacing | .01px | — |
| --ui-sm-400-line-height | 14.4px | — |
| --ui-sm-400-size | 12px | — |
| --ui-sm-400-weight | 400 | — |
| --ui-sm-500-letter-spacing | .01px | — |
| --ui-sm-500-line-height | 14.4px | — |
| --ui-sm-500-size | 12px | — |
| --ui-sm-500-weight | 500 | — |
| --ui-xl-400-letter-spacing | -.13px | — |
| --ui-xl-400-line-height | 18px | — |
| --ui-xl-400-size | 15px | — |
| --ui-xl-400-weight | 400 | — |
| --ui-xl-500-letter-spacing | -.13px | — |
| --ui-xl-500-line-height | 18px | — |
| --ui-xl-500-size | 15px | — |
| --ui-xl-500-weight | 500 | — |
| --ui-xl-600-letter-spacing | -.13px | — |
| --ui-xl-600-line-height | 18px | — |
| --ui-xl-600-size | 15px | — |
| --ui-xl-600-weight | 600 | — |
| --ui-xs-500-letter-spacing | .05px | — |
| --ui-xs-500-line-height | 13.2px | — |
| --ui-xs-500-size | 11px | — |
| --ui-xs-500-weight | 500 | — |
| --ui-xxl-400-letter-spacing | -.18px | — |
| --ui-xxl-400-line-height | 19.2px | — |
| --ui-xxl-400-size | 16px | — |
| --ui-xxl-400-weight | 400 | — |
| --ui-xxl-500-letter-spacing | -.18px | — |
| --ui-xxl-500-line-height | 19.2px | — |
| --ui-xxl-500-size | 16px | — |
| --ui-xxl-500-weight | 500 | — |
| --ui-xxl-600-letter-spacing | -.18px | — |
| --ui-xxl-600-line-height | 19.2px | — |
| --ui-xxl-600-size | 16px | — |
| --ui-xxl-600-weight | 600 | — |

## 四、UI 排版阶（`--ui-*`，60 个，上轮完全未采）

| 档位 | size | weight | line-height | letter-spacing |
|---|---|---|---|---|
| `--ui-xs-500` | 11px | 500 | 13.2px | .05px |
| `--ui-sm-400` | 12px | 400 | 14.4px | .01px |
| `--ui-sm-500` | 12px | 500 | 14.4px | .01px |
| `--ui-md-400` | 13px | 400 | 16px | -.04px |
| `--ui-md-500` | 13px | 500 | 16px | -.04px |
| `--ui-md-600` | 13px | 600 | 16px | -.04px |
| `--ui-lg-400` | 14px | 400 | 16px | -.09px |
| `--ui-lg-500` | 14px | 500 | 16px | -.09px |
| `--ui-lg-600` | 14px | 600 | 16px | -.09px |
| `--ui-xl-400` | 15px | 400 | 18px | -.13px |
| `--ui-xl-500` | 15px | 500 | 18px | -.13px |
| `--ui-xl-600` | 15px | 600 | 18px | -.13px |
| `--ui-xxl-400` | 16px | 400 | 19.2px | -.18px |
| `--ui-xxl-500` | 16px | 500 | 19.2px | -.18px |
| `--ui-xxl-600` | 16px | 600 | 19.2px | -.18px |

> 注：light 根块共 308 个属性，`--ui-*` 60 个均在其中。

外壳基准字号 = `ui-md-400` 13px；`lg` 14px；letter-spacing 随字号递负。

## 五、强调色切换块（`[data-accent=…]`，12 个）

| accent | 定义数 | --accent-100 | --accent-500 | --accent-900 |
|---|---|---|---|---|
| blue | 19 | var(--accent-blue-100) | var(--accent-blue-500) | var(--accent-blue-900) |
| pink | 19 | var(--accent-pink-100) | var(--accent-pink-500) | var(--accent-pink-900) |
| green | 19 | var(--accent-green-100) | var(--accent-green-500) | var(--accent-green-900) |
| purple | 19 | var(--accent-purple-100) | var(--accent-purple-500) | var(--accent-purple-900) |
| yellow | 19 | var(--accent-yellow-100) | var(--accent-yellow-500) | var(--accent-yellow-900) |
| gray | 19 | var(--accent-gray-100) | var(--accent-gray-500) | var(--accent-gray-900) |
| blue | 19 | var(--accent-blue-100) | var(--accent-blue-500) | var(--accent-blue-900) |
| pink | 19 | var(--accent-pink-100) | var(--accent-pink-500) | var(--accent-pink-900) |
| green | 19 | var(--accent-green-100) | var(--accent-green-500) | var(--accent-green-900) |
| purple | 19 | var(--accent-purple-100) | var(--accent-purple-500) | var(--accent-purple-900) |
| yellow | 19 | var(--accent-yellow-100) | var(--accent-yellow-500) | var(--accent-yellow-900) |
| gray | 19 | var(--accent-gray-100) | var(--accent-gray-500) | var(--accent-gray-900) |

## 六、编辑器高亮 / 渐变 / 正文色

| token | light | dark |
|---|---|---|
| --editor-bluedark | rgb(3 0 245 / 100%) | rgb(170 169 249 / 100%) |
| --editor-bluelight | rgb(41 98 246 / 100%) | rgb(65 146 247 / 100%) |
| --editor-brown | rgb(126 80 25 / 100%) | rgb(126 80 25 / 100%) |
| --editor-cyan | rgb(83 183 224 / 100%) | rgb(104 212 251 / 100%) |
| --editor-gradient-blue | linear-gradient( 108.9deg, rgba(40, 188, 190, 1) 0%, rgba(57, 53, 221, 1) 100% ) | linear-gradient( 108.9deg, rgba(159, 246, 209, 1) 0%, rgba(114, 189, 245, 1) 100% ) |
| --editor-gradient-gold | linear-gradient( 108.9deg, rgba(177, 106, 77, 1) 0%, rgba(213, 166, 56, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 224, 169, 1) 0%, rgba(213, 166, 56, 1) 100% ) |
| --editor-gradient-orange | linear-gradient( 108.9deg, rgba(243, 169, 0, 1) 0%, rgba(228, 62, 41, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 130, 114, 1) 0%, rgba(255, 216, 125, 1) 100% ) |
| --editor-gradient-pink | linear-gradient( 108.9deg, rgba(255, 113, 0, 1) 0%, rgba(243, 0, 173, 1) 100% ) | linear-gradient( 108.9deg, rgba(255, 102, 86, 1) 0%, rgba(255, 135, 178, 1) 100% ) |
| --editor-gradient-purple | linear-gradient( 109.45deg, rgba(36, 73, 254, 1) 0%, rgba(202, 75, 167, 1) 100% ) | linear-gradient( 108.9deg, rgba(97, 229, 255, 1) 0%, rgba(255, 112, 245, 1) 100% ) |
| --editor-green | rgb(91 199 139 / 100%) | rgb(117 251 190 / 100%) |
| --editor-greydark | rgb(104 116 133 / 100%) | rgb(112 116 120 / 100%) |
| --editor-greylight | rgb(159 164 169 / 100%) | rgb(174 188 199 / 100%) |
| --editor-orange | rgb(240 151 55 / 100%) | rgb(240 151 55 / 100%) |
| --editor-purple | rgb(180 37 246 / 100%) | rgb(209 123 248 / 100%) |
| --editor-red | rgb(219 48 53 / 100%) | rgb(235 80 108 / 100%) |
| --editor-spectrum | conic-gradient( from 180deg at 50% 50%, rgba(255, 0, 0, 1) -54.01deg, rgba(0, 0, 255, 1) 54deg, rgba(0, 255, 0, 1) 147.6deg, rgba(243, 245, 219, 1) 223.2deg, rgba(243, 245, 219, 1) 226.8deg, rgba(255, 0, 0, 1) 306deg, rgba(0, 0, 255, 1) 413.99deg ) | — |
| --editor-text | rgb(31 34 37 / 90%) | rgb(255 255 255 / 90%) |

## 七、阴影阶

| token | light |
|---|---|
| --shadow-empty | `0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0)` |
| --shadow-xxs | `0px 0px 0px 1px rgba(0, 0, 0, .04), 0px 1px 1.5px 0px rgba(0, 0, 0, .06), 0px 2.5px 4px 0px rgba(0, 0, 0, .06)` |
| --shadow-xs | `0px 1px 1px 0px rgba(0, 0, 0, .04), 0px 3px 3px 0px rgba(0, 0, 0, .04), 0px 6px 4px 0px rgba(0, 0, 0, .02), 0px 11px 4px 0px rgba(0, 0, 0, .01), 0px 17px 5px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| --shadow-sm | `0px 2px 4px 0px rgba(0, 0, 0, .07), 0px 8px 8px 0px rgba(0, 0, 0, .06), 0px 18px 11px 0px rgba(0, 0, 0, .04), 0px 32px 13px 0px rgba(0, 0, 0, .01), 0px 51px 14px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| --shadow-md | `0px 4px 9px 0px rgba(0, 0, 0, .07), 0px 16px 16px 0px rgba(0, 0, 0, .06), 0px 36px 22px 0px rgba(0, 0, 0, .04), 0px 65px 26px 0px rgba(0, 0, 0, .01), 0px 101px 28px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| --shadow-sr | `0px 1px 2px 0px rgba(0, 0, 0, .05), 0px 4px 4px 0px rgba(0, 0, 0, .04), 0px 9px 5px 0px rgba(0, 0, 0, .03), 0px 16px 6px 0px rgba(0, 0, 0, .01), 0px 25px 7px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| --shadow-doc | `0px 0px 0px 1px rgba(0, 0, 0, .06), 0px 1px 1px -.5px rgba(0, 0, 0, .06), 0px 3px 3px -1.5px rgba(0, 0, 0, .06), 0px 6px 6px -3px rgba(0, 0, 0, .06), 0px 12px 12px -6px rgba(0, 0, 0, .04), 0px 24px 24px -12px rgba(0, 0, 0, .03)` |
| --shadow-inner | `inset rgba(255, 255, 255, .88) 0px 0px 0px 1px` |

## 八、圆角 / 间距 / 尺寸 / 动效

| token | light | 备注 |
|---|---|---|
| --browse-max-width | 1630px | 浏览视图最大宽 |
| --header-height | 48px | 默认 56px，@media (pointer: fine) 下 48px |
| --popupbase-blurred | linear-gradient( 140.99deg, rgba(250, 250, 250, 1) 0%, rgba(247, 247, 247, 1) 100% ) |  |
| --radius-full | 9999px | 药丸按钮 |
| --radius-lg | 12px |  |
| --radius-md | 8px |  |
| --radius-sm | 4px |  |
| --radius-xl | 16px |  |
| --spacing-0-5 | .125rem |  |
| --spacing-1 | .25rem |  |
| --spacing-1-5 | .375rem |  |
| --spacing-10 | 2.5rem |  |
| --spacing-12 | 3rem |  |
| --spacing-16 | 4rem |  |
| --spacing-2 | .5rem |  |
| --spacing-2-5 | .625rem |  |
| --spacing-3 | .75rem |  |
| --spacing-3-5 | .875rem |  |
| --spacing-4 | 1rem |  |
| --spacing-4-5 | 1.125rem |  |
| --spacing-5 | 1.25rem |  |
| --spacing-6 | 1.5rem |  |
| --spacing-8 | 2rem |  |
| --transition-duration-fast | .15s |  |
| --transition-duration-medium | .2s |  |
| --transition-duration-slow | .5s |  |
| --transition-easing | cubic-bezier(.4, 0, .2, 1) |  |
| --transition-fast | var(--transition-duration-fast) var(--transition-easing) |  |
| --transition-medium | var(--transition-duration-medium) var(--transition-easing) |  |
| --transition-slow | var(--transition-duration-slow) var(--transition-easing) |  |

## 九、文档排版族（heading / body / caption / st 表格 / dc 文档头）

| token | light | dark |
|---|---|---|
| --body-md-400-italic-letter-spacing | -.04px | — |
| --body-md-400-italic-line-height | 15.6px | — |
| --body-md-400-italic-size | 13px | — |
| --body-md-400-italic-style | italic | — |
| --body-md-400-italic-weight | 400 | — |
| --body-md-400-letter-spacing | -.04px | — |
| --body-md-400-line-height | 15.6px | — |
| --body-md-400-size | 13px | — |
| --body-md-400-weight | 400 | — |
| --body-md-500-italic-letter-spacing | -.04px | — |
| --body-md-500-italic-line-height | 15.6px | — |
| --body-md-500-italic-size | 13px | — |
| --body-md-500-italic-style | italic | — |
| --body-md-500-italic-weight | 500 | — |
| --body-md-500-letter-spacing | -.04px | — |
| --body-md-500-line-height | 15.6px | — |
| --body-md-500-size | 13px | — |
| --body-md-500-weight | 500 | — |
| --body-md-600-letter-spacing | -.04px | — |
| --body-md-600-line-height | 15.6px | — |
| --body-md-600-size | 13px | — |
| --body-md-600-weight | 600 | — |
| --caption-lg-400-letter-spacing | .05px | — |
| --caption-lg-400-line-height | 16px | — |
| --caption-lg-400-size | 12px | — |
| --caption-lg-400-weight | 400 | — |
| --caption-lg-500-letter-spacing | .01px | — |
| --caption-lg-500-line-height | 16px | — |
| --caption-lg-500-size | 12px | — |
| --caption-lg-500-weight | 500 | — |
| --caption-md-400-letter-spacing | .01px | — |
| --caption-md-400-line-height | 16px | — |
| --caption-md-400-size | 11px | — |
| --caption-md-400-weight | 400 | — |
| --caption-md-500-letter-spacing | .05px | — |
| --caption-md-500-line-height | 13.2px | — |
| --caption-md-500-size | 11px | — |
| --caption-md-500-weight | 500 | — |
| --font-family | "Inter", var(--cjk-sans), "Pretendard", -apple-system, blinkmacsystemfont, sans-serif | — |
| --heading-md-500-letter-spacing | -.09px | — |
| --heading-md-500-line-height | 16px | — |
| --heading-md-500-size | 14px | — |
| --heading-md-500-weight | 500 | — |
| --heading-md-600-letter-spacing | -.09px | — |
| --heading-md-600-line-height | 16px | — |
| --heading-md-600-size | 14px | — |
| --heading-md-600-weight | 600 | — |
| --heading-xs-500-letter-spacing | .01px | — |
| --heading-xs-500-line-height | 12px | — |
| --heading-xs-500-size | 12px | — |
| --heading-xs-500-weight | 500 | — |
| --heading-xs-600-allcaps-letter-spacing | .15px | — |
| --heading-xs-600-allcaps-line-height | 12px | — |
| --heading-xs-600-allcaps-size | 12px | — |
| --heading-xs-600-allcaps-transform | uppercase | — |
| --heading-xs-600-allcaps-weight | 600 | — |
| --heading-xs-600-letter-spacing | .05px | — |
| --heading-xs-600-line-height | 12px | — |
| --heading-xs-600-size | 12px | — |
| --heading-xs-600-weight | 600 | — |
| --heading-xxs-600-allcaps-letter-spacing | .05px | — |
| --heading-xxs-600-allcaps-line-height | 12px | — |
| --heading-xxs-600-allcaps-size | 11px | — |
| --heading-xxs-600-allcaps-transform | uppercase | — |
| --heading-xxs-600-allcaps-weight | 600 | — |
| --heading-xxs-600-letter-spacing | .05px | — |
| --heading-xxs-600-line-height | 12px | — |
| --heading-xxs-600-size | 11px | — |
| --heading-xxs-600-weight | 600 | — |

## 十、字体链（含 CJK 语言回退）

### 字体资产清单

| 族 | 字重 | woff2 子集 |
|---|---|---|
| Inter | 100–900 variable | 2 |
| Avenir Next Rounded | 400 / 500 / 600 / 700 | 8 |
| Source Serif | 200–900 | 2 |
| Untitled Serif | 400 / 500 / 700 | 6 |
| Roboto Mono | 100–700 | 12 |
| M PLUS Rounded 1c | 400 / 500 / 700 | 354 |
| common（CJK） | Noto Sans Mono JP、Pretendard JP、Source Han Serif JP、Jetendard 100–900 | 45 |
| KaTeX（code-editor 内） | AMS/Caligraphic/Fraktur/Main/Math/SansSerif… | 39 |

主字体栈：`"Inter", var(--cjk-sans), "Pretendard", -apple-system, blinkmacsystemfont, sans-serif`

| 资产 | 字体族 | 字重 | woff2 |
|---|---|---|---|
| css/vendor-code-editor.css.DkZwelau.css | KaTeX_AMS, KaTeX_Caligraphic, KaTeX_Fraktur, KaTeX_Main, KaTeX_Math, KaTeX_SansSerif | 400/700 | 无自定义属性；39 个 KaTeX woff2 |
| roboto-mono/fontdef.css | 'Roboto Mono' | 100 700 | 字体资产 |
| avenir-next-rounded/fontdef.css | "Avenir Next Rounded" | 400/500/600/700 | 字体资产 |
| source-serif/fontdef.css | 'Source Serif' | 200 900 | 字体资产 |
| inter/fontdef.css | "Inter" | 100 900 | 字体资产 |
| untitled-serif/fontdef.css | "Untitled Serif" | 400/500/700 | 字体资产 |
| common/fontdef.css | 'Noto Sans Mono JP', 'Pretendard JP', 'Source Han Serif JP', 'Jetendard' | 100 900/200 900/100/200/300/400/500/600/700 | 字体资产 |
| m-plus-rounded-1c/fontdef.css | 'M PLUS Rounded 1c' | 400/500/700 | 字体资产 |
| css/BlankFont.css.CSdHt10-.css | — | — | 无自定义属性，无 woff2 |

### `--cjk-*` 在不同条件下的实际取值（22 处）

- `--base: 252 253 254;--base-overlay: rgb(252 252 252 / 100%);--foregrou` → `--cjk-sans), "Pretendard", -apple-system, blinkmacsystemfont, sans-serif;`
- `(继属块)` → `--cjk-sans: "CJK Fallback Placeholder";`
- `--cjk-sans: "CJK Fallback Placeholder";` → `--cjk-serif: "CJK Fallback Placeholder";`
- `--cjk-sans: "CJK Fallback Placeholder";--cjk-serif: "CJK Fallback Plac` → `--cjk-rounded: "CJK Fallback Placeholder";`
- `--cjk-sans: "CJK Fallback Placeholder";--cjk-serif: "CJK Fallback Plac` → `--cjk-mono: "CJK Fallback Placeholder"}html[lang=ja]{--cjk-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;`
- `(继属块)` → `--cjk-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;`
- `--cjk-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;` → `--cjk-serif: "Source Han Serif JP";`
- `--cjk-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;--cjk-serif: "` → `--cjk-rounded: "M PLUS Rounded 1c";`
- `--cjk-sans: "Hiragino Sans", "Yu Gothic UI", sans-serif;--cjk-serif: "` → `--cjk-mono: "Noto Sans Mono JP"}html[lang=ko]{--cjk-sans: "Pretendard";`
- `(继属块)` → `--cjk-sans: "Pretendard";`
- `--cjk-sans: "Pretendard";` → `--cjk-serif: "Source Han Serif KR";`
- `--cjk-sans: "Pretendard";--cjk-serif: "Source Han Serif KR";` → `--cjk-rounded: "Nanum Square Round";`
- `--cjk-sans: "Pretendard";--cjk-serif: "Source Han Serif KR";--cjk-roun` → `--cjk-mono: "Jetendard"}html[lang=zh-Hans]{--cjk-sans: "PingFang SC", "Microsoft YaHei", sans-serif;`
- `(继属块)` → `--cjk-sans: "PingFang SC", "Microsoft YaHei", sans-serif;`
- `--cjk-sans: "PingFang SC", "Microsoft YaHei", sans-serif;` → `--cjk-serif: "Source Han Serif SC";`
- `--cjk-sans: "PingFang SC", "Microsoft YaHei", sans-serif;--cjk-serif: ` → `--cjk-rounded: "Resource Han Rounded SC";`
- `--cjk-sans: "PingFang SC", "Microsoft YaHei", sans-serif;--cjk-serif: ` → `--cjk-mono: "Noto Sans Mono SC"}html[lang=zh-Hant]{--cjk-sans: "PingFang TC", "Microsoft JhengHei", sans-serif;`
- `(继属块)` → `--cjk-sans: "PingFang TC", "Microsoft JhengHei", sans-serif;`
- `--cjk-sans: "PingFang TC", "Microsoft JhengHei", sans-serif;` → `--cjk-serif: "Source Han Serif TC";`
- `--cjk-sans: "PingFang TC", "Microsoft JhengHei", sans-serif;--cjk-seri` → `--cjk-rounded: "Resource Han Rounded TC";`
- `--cjk-sans: "PingFang TC", "Microsoft JhengHei", sans-serif;--cjk-seri` → `--cjk-mono: "Noto Sans Mono TC"}.typography-ui-xs-500{font-family:var(--font-family);`
- `--base: 252 253 254;--base-overlay: rgb(252 252 252 / 100%);--foregrou` → `--cjk-sans), "Pretendard", -apple-system, blinkmacsystemfont, sans-serif;`
