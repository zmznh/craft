# 样式面板与装饰系统（`style.*` 155 条）

证据：`_harvest/style-zh.txt`（155 行全量）。交叉验证对象：`registries.md` §二（`TextStyle`/`ListStyle`/`LineType`/`FontFamilyId` 枚举）、`protocol.md` §五（背景/渐变）、§八（数字格式）、`panels.md` §八（块右键 `turnInto` / `imageTo` / `previewTo` 动作）。
标注：`~` = 官方文案直述；`✓` = 有第二处独立证据（枚举或动作名）互相印证。

## 一、具名文本样式（不是 H1–H6，而是语义档位）~

官方中文的三档标题命名值得单独记：**`title`＝标题 / `heading`＝中标题 / `strong`＝小标题**。其余档位：`body` 正文、`caption` 说明、`card` 卡片、`page` 页面、`subtitle` 副标题、`text.style` 文本样式、`style.format` 格式。
⇒ 面板暴露的是**语义样式名**而非 `h1..h6`；块标题层级（H1–H4）与这套样式名的对应关系仍未证（`interactions.md` 遗留项）。

## 二、可保存的"自定义样式"是一等内容实体 ✓（此前完全未记）

| 能力 | 证据 |
|---|---|
| 保存 / 重命名 / 套用 / 使用 | `save.style` 保存样式、`rename.style`、`apply`「套用样式」、`use.style`「使用样式」 |
| **脏态** | `unsaved`「未保存」⇒ 样式编辑有未保存指示 |
| 两个来源分组 | `crafts.styles`「Craft 的样式」+ `created.by.craft` / `created.by.you`；另有 `your.styles`「你的样式」⇒ 列表按**作者维度**分栏 |
| 默认样式 | `default.style`「默认样式」+ `set.as.default.style`「设置为默认样式」⇒ 可把自定义样式**设为文档默认** |
| 浏览 | `style.gallery`「样式图库」、`all.styles`「所有样式」、`advanced`「高级」分区 |
| **付费门禁** | `custom.limit.desc`「你已达到自定义样式的上限。**升级以保存更多样式。**」⇒ 自定义样式条数受套餐限制（**数值未给**，属远端 `[0]` 类，归入动态/问询批次） |

## 三、颜色：24 个具名色，且有重复拼写键 ~

黑 / 白 / 灰 / **灰（`gray` 与 `grey` 两个键，中文都作"灰色"）** / 浅灰(`grey.light`) / 红 / 橙 / 粉 / 深粉 / 紫 / 深紫 / 绿 / 深绿 / 蓝 / 深蓝 / 浅蓝 / 海军蓝(`blue.navy`) / 海洋蓝(`blue.ocean`) / 棕 / 橄榄绿 / 青绿 / 浅米色(`light.beige`) / 默认颜色(`default`)。
配套动作 `select.color`「选择颜色」⇒ 具名色板 + 自由取色两路。
⇒ 界面用**色名**而非 hex；`gray`/`grey` 重复是官方遗留，本地只保留一套即可（不要照抄两个键）。

## 四、装饰（decorations）：和纸胶带与涂鸦 ~（本地完全缺失的一类）

`decorations` 装饰 → `decoration.block`（块装饰）与 `decoration.focus`（焦点装饰）两类；素材：`washi` 和纸、`washi.tape` **和纸胶带**、`washi.gallery` **和纸图库**、`doodle` 涂鸦、`pattern` 图案、`radial` 径向、`paper` 纸、`backdrop` 背景、`card.style` 卡片样式（`card.style.task`「任务」档）。
⇒ **和纸胶带/涂鸦是可浏览图库的页面装饰素材**，这是 Craft 的招牌视觉功能，不是"背景色"能概括的。

## 五、背景与封面 ✓

`custom.background` 自定义背景、`document.color` 文档颜色、`style.cover` 封面、`page.background.{start.color 起始颜色, end.color 结束颜色, faded 淡化, image.blur 模糊图像, immersive 沉浸式}`。
⇒ 页面背景有**渐变（起止色）+ 淡化 + 图像模糊 + 沉浸式**四组控制，与 `protocol.md` §五 的渐变枚举互证；`image.blur` 与 `immersive` 说明背景可以是**图片**且带模糊与沉浸布局。
图片来源：`unsplash`（外部图库，此前待决策项）+ `number.of.images`「图片数量」+ `shuffle`「随机」⇒ **封面图支持多图与随机轮换**。

## 六、交叉验证成果（本表最有价值的部分）✓

| 本文件（文案档位） | 另一处证据（枚举/动作名） | 结论 |
|---|---|---|
| `image.fit` {fill 填充, fit 适应} × `image.size` {auto 自动, large 大} | 块菜单 4 项 `imageTo{Auto,Large,Fill,Fit}Style`（`panels.md` §八） | **图片样式是两根独立轴（尺寸×适配），各 2 值**，菜单把它摊平成 4 项 ⇒ 本地若做 4 个互斥档位就丢了轴结构 |
| `layout` {regular, card, embed, small} | 预览 4 项 `previewTo{Small,Regular,Card,Embed}Style` + 枚举 `Xn`/`LayoutStyle` | 链接预览 4 档三处一致 |
| `number` / `currency` / `percent` / `decimals` / `plain.text` | `protocol.md` §八 四态 `plain-text\|number\|percentage\|currency` + precision | 数字格式面板的五个控件名对应四态 + 小数位 |
| `list.{bullet,numbered,todo,toggle,none}` | `ListStyle` 5 项 | 列表五档一致（`none`＝取消列表格式） |
| `separator.style` / `separator.strong`「粗」/ `line` | `LineType` 6（`extraLight/light/regular/strong` + none/pageSeparator） | 分隔线档位一致；文案只暴露"粗"这一端 |
| `font` + `font.{system,serif,mono,round}`（各有 `.long` 重复标签） | `FontFamilyId` 4 = `system/system-serif/system-mono/system-rounded` | 字体四族一致；`font.mono` 与 `font.mono.long` 同值 ⇒ 短标签用于分段控件、长标签用于菜单 |
| `turn.into.{card,page,rich.link,text.link}` | 块菜单 `turnInto*` 系列 | 转换动作一致，但见下方"同义重复" |

**官方自身的两处同义重复（复刻时选一个，别两个都实现）**：
1. `turn.into.rich.link`「转换为富链接」与 `turn.into.preview.link`「变成富链接」是同一件事的两个键。
2. `indent.out`「减少缩进」与 `deindent`「减少缩进」；且 `indent`、`indentation`、`indent.in` 三键并存在同一概念上。

## 七、其余控件（逐条即清单）~

**内联格式**：`inline.{bold,italic,strike,code,link,highlight,format}` + `inline.blocklink` 区块链接 + **`inline.equation`「输入方程」**（行内数学公式，`BlockType` 13 项里没有对应类型 ⇒ 公式很可能是通过插入菜单/对象块实现，需动态确认）+ `inline.type.date`「输入日期」+ `inline.type.user.link`「输入用户链接」⇒ **"输入 X"是插入菜单里的占位动作**，与"选择器"并列的第三种输入通路。
**排版**：`text.align` 5 档（左/居中/右/两端 + 默认）、`direction` 方向 → `left.to.right` / `top.to.bottom` ⇒ **书写方向有两轴**（横排 LTR/RTL 与纵向）；`wide.page` 宽页；`indentation` 缩进 + `indent.in/out`。
**三态指示**：`mixed`「混合」⇒ 选区内样式不一致时控件显示"混合"，不是显示第一个值。
**清除**：`clear`「取消样式」。
**链接元数据**：`reload.link.info`「重新加载链接信息」⇒ 链接预览可手动刷新。
**插入菜单分区**：`insert.menu.section.{text.styles, separators}`；`style.insert…` 侧栏分区见 `publishing.md` §六。
**动态样式**：`dynamic.style`「动态样式」——一个独立样式概念，含义未在文案中说明（待动态确认）。

## 八、仍未覆盖

1. 自定义样式的**条数上限数值**（`custom.limit.desc` 没给 `[0]`）。
2. `dynamic.style`、`decoration.focus` 的实际行为。
3. 行内公式（`inline.equation`）落到哪个块类型、编辑器如何渲染。
4. 具名色与 CSS 变量的对应表（色名→色值只能从运行时或 token 表取，`tokens` 侧尚未覆盖 `style.color.*`）。✎ **第 97 批·尾记二＝本条部分清偿**：CSS 本体落盘后**通道层与 alpha 阶已全部拿到**（见 §九），⇒ 未清偿的只剩"`style.color.*` 那 24 个**具名色**→具体三元组"这一格（本轮只读到 `--accent-{blue,gray,green,pink,purple,yellow}` 六族的**存在与档位**，未逐色抄三元组值）。
5. ~~样式面板的分区顺序~~ **已实屏结案（动态 V12）**：自定义样式 → 所有样式 → 颜色（背景 / 文档颜色 / 文本颜色）→ 封面（封面图片）→ 分隔符样式（线 / 和纸胶带 / 涂鸦）→ 字体（默认 / 高级）→ 宽页。全文见 `interactions.md` V12 与 `gap.md` G209。

## 九、通道化配色与控件五态阶梯＝**本轮起官方值首次到手**（盘上 `@layer components` 实扫 第 97 批·尾记二 2026-09-29 22:0x–22:2x；原始读数在 `gap.md` §三点一〇四〇 G971–G974、机制解释在 `internals.md §三十四`）

1. ★★★ **中性色是一张 20 档不透明度表、不是一组色值**：命名后缀→alpha＝`0→0%｜25→2%｜50→3%｜100→4%｜150→6%｜200→8%｜250→10%｜300→12%｜350→18%｜400→25%｜450→32%｜500→40%｜550→48%｜600→55%｜650→62%｜700→70%｜750→78%｜800→85%｜850→92%｜900→100%`；每条写作 `rgb(var(--foreground) / N%)`，而 `--foreground` 只有两值（亮 `26 28 30`／暗 `249 249 249`）。★★ **两处命名陷阱**：① **没有 `-050`、也没有 `-950`**（此前口径里出现过 `-050`，本轮全量枚举后确认实为不存在 ⇒ 就地作废）；② 阶梯**非等差**＝前段密（2／3／4／6／8／10／12）后段疏（18／25／32／40／48／55／62／70／78／85／92／100），`350→18%` 是个明显跳跃 ⇒ **按"后缀÷10＝百分比"心算是错的**（只有 `-900=100%` 与 `-500=40%` 附近凑巧接近）。
2. ★★★ **官方有两套标度不同的 alpha 阶梯 ⇒ 同名后缀是两个值（本轮补测，会制造静默错色）**：前景族 `--foreground-{0,25,50,100,…,900}` **20 档**（满值 `-900=100%`），强调色族 `--accent-{blue,gray,green,pink,purple,yellow}-{50,100,150,200,250,300,350,400,450,500}` **各 10 档且六套逐字同构**＝`50=6%｜100=12%｜150=18%｜200=24%｜250=32%｜300=40%｜350=55%｜400=70%｜450=85%｜500=100%` ⇒ **`--foreground-100` 是 4%、`--accent-*-100` 是 12%**；强调色的满值后缀是 `-500` 而非 `-900`，`-600`～`-900` 在 accent 系里根本不存在〔✎ **第 100 批·上半作废并更正**＝`-50…-500` 是 **alpha 段**（10 档）、`-550…-900` 是**不透明逐档加深段**（8 档），合计 **18 档**；"满值后缀"这个说法本身不成立，因为两段各有一个满值（`-500=100%` 与 `-900=最深`）。⇒ 全表与逐字值见 **§十一**，作废理由见 `gap.md` **G1009**〕。★ 切换机制＝**18 条别名重指**（消费方只读 `--accent-100`，而 `--accent-100: var(--accent-blue-100)`；`[data-accent=gray]` 整块把 18 条别名改指 `--accent-gray-*`）⇒ **语义层 ＋ 通道层两跳**，与中性色的"一跳"不同。☆ `--base-*` **只有 1 档**（`--base-900: rgb(var(--base) / 100%)`，亮 `252 253 254`／暗 `30 30 30`），且另有 `--base-overlay: rgb(252 252 252 / 100%)` **硬编码不跟随 `--base`**（暗档下它仍是 252 252 252）⇒ 复刻时别把 overlay 当 `--base` 的派生值。★ 对照本地＝本地按语义名取值（`--color-muted` 等 19 个），**不存在"后缀数字"这一层** ⇒ 本地任何 `-100/-150` 式的命名迁移都会撞上这个双标度陷阱，**必须按家族分别建表**。
3. ★★★ **控件五态阶梯（官方 DS 的 action 组件 `_1j891_`，21 类名／6 变体）逐字到手**：

   | 态 | `_variantActive_1j891_163`（选中／rail 当前档） | `_variantDefault_1j891_116`（普通） |
   | --- | --- | --- |
   | 静止 | `background: --foreground-100`（**4%**）＋ `color: -900` | **无背景**，只有 `color: --foreground-900` |
   | hover ＋ `[data-popup-open]` ＋ 键盘焦点 ＋ `_forceHover_1j891_122` ＋ `[data-highlighted]`（**五种条件共用同一条规则**） | `--foreground-150`（**6%**） | `--foreground-100`（**4%**） |
   | `@media (pointer: fine)` 下 `:active` | `--foreground-200`（**8%**） | `--foreground-200`（**8%**，⇒ **Default 从 4% 直接跳 8%、不经过 6%**） |

   每条都带 `:not(._isStatic_1j891_31,[data-disabled])`；`_isStatic_1j891_31{cursor:default}`＝"长得像按钮但不是按钮"的静态变体；禁用是一条**全局**属性规则 `[data-disabled]{opacity:.4;cursor:default}`；图标比正文淡＝`._leftContent/_rightContent{color:var(--foreground-800)}`（85% vs 100%）。★★ **`--foreground-100` 与 `-150` 只差 2% 不透明度** ⇒ 这就是第 94–97 批"屏上选中态几乎看不出"的量测根据，也是**判据必须靠类名而不能靠肉眼**的官方侧解释。
4. ★★ **hover 的门控写法值得照抄**＝`[data-whatintent]:not([data-whatintent=touch]) … :hover` ⇒ 只要意图属性存在且**不是 touch**，hover 就生效（pointer 与 keyboard 都算）；键盘焦点态另用 `[data-whatintent=keyboard] … :focus`，且 `._action_1j891_1:focus{outline:none}` ＝**官方在键盘态把描边换成背景加深**。☆ 对照本地＝`grep -rn 'whatintent\|hoverOnlyWhenSupported\|pointer: fine' src` ⇒ **0 命中**，本地 `hover:` 恒生效、键盘态用 `focus-visible:ring-3 ring-ring/50`（`src/components/ui/button.tsx:6`）⇒ **触屏上本地会把 hover 背景焊住，官方不会；键盘态本地多一圈 ring、官方没有**（两条都是可见差分，见 G972）。
5. ★★ **圆角与间距的真实档位**＝圆角只有 **5 档**（`sm 4px｜md 8px｜lg 12px｜xl 16px｜full 9999px`，**没有 `2xl/3xl/4xl`**）；间距只有 **10 档、按 4 的倍数命名且非等差**（`1 .25rem｜2 .5rem｜3 .75rem｜4 1rem｜5 1.25rem｜6 1.5rem｜8 2rem｜10 2.5rem｜12 3rem｜16 4rem`，`-7/-9/-11/-13~-15` 均不存在）；阴影是一整条六段式阶梯，`--shadow-xxs` **亮档 `.04/.06/.06`、暗档 `.12/.14/.16`** ⇒ **暗档阴影更重**。☆ 本地对齐情况＝`src/app/globals.css:44-50` 的 `sm/md/lg/xl` 与官方逐字相同、`globals.css:99` 的注释已抄过官方五档，但**本地没有 `--radius-full` token**（胶囊形靠 `rounded-full` 工具类硬写，`button.tsx:11`），且本地多出官方没有的 `2xl/3xl/4xl` 三档。
6. ☆ **快捷键面板的视觉规格首次可查**（承 G973）＝dialog `720×560` 上限（`min(720px,100vw-2rem)` × `min(560px,100dvh-spacing-8)`）、compact 覆盖为 `100vw-spacing-4` × `100dvh-spacing-6`、侧栏固定 **184px** ＋ `gap:2px` ＋ `1px solid --foreground-150` 右边线、行 `min-height:36px` ＋ `space-between`、键帽 **26px 高／最小宽 26px／`radius-sm`／底色 `base-900`／`shadow-xxs`／字色 `foreground-800`／`font-family:inherit`**、键帽组 `gap:spacing-1`、说明性文字统一 `foreground-500`（40%）。⇒ 与第 96 批的屏上几何读数互相咬合。

**仍未采到（本节）**：其余 **12 份 CSS**（名册里 `.css` 共 13 个）未落盘 ⇒ 本表只覆盖快捷键面板与 action 组件所在那一份；`Filled/Danger/Accent/DangerSubtle` 四变体的静止值未逐一抄（只抄了与 rail 直接相关的 `Active`／`Default` 链）；`-25`/`-50` 这类低档的实际消费点未统计；官方是否存在 `--foreground-950` 的别处定义（本文件无）；强调色六套的**具体三元组值**未逐色抄。

## 十一、**DS 按钮的完整官方规格（21 variant × 3 size × 8 状态类，逐字底色）＋ 两段式 18 档色阶全表**（✓盘上 第 100 批·上半 2026-09-30 00:3x–00:5x，零浏览器＝已落盘 CSS 的定点读；原始读数在 `gap.md` §三点一〇四五 G1009–G1017、`_harvest/b100-ds-button-1bml7.json`；⚠ 本节同时**作废 §九.2 的 accent 档位结论**）

### 一、两段式色阶（本目录此前只写过前一段）

| 族 | 档位数 | 前段（alpha） | 后段（不透明逐暗） |
| --- | --- | --- | --- |
| `--foreground-{0,25,…,900}` | **20** | `0%｜2%｜3%｜4%｜6%｜8%｜10%｜12%｜18%｜25%｜32%｜40%｜48%｜55%｜62%｜70%｜78%｜85%｜92%｜100%`（步长 25，多一档 `-0`） | **无**（前景已是最暗墨，变暗无意义） |
| `--red-{50,…,900}` | **18** | `-50…-500`＝`rgb(var(--red) / 6%…100%)`，逐档 `6｜12｜18｜24｜32｜40｜55｜70｜85｜100%` | `-550…-900`＝`rgb(237 54 58)`→`rgb(118 39 42)`（8 档，等步长变暗） |
| `--accent-{50,…,900}` | **18** | 别名转发 `var(--accent-<色>-N)` | 同左（转发到各色的加深段） |
| `--accent-blue-{50,…,900}` | **18** | 基色 `--accent-blue: 46 109 233`，alpha 段同 red | `rgb(44 103 217)`→`rgb(34 60 111)` |

⇒ ★ **两条要记住的口径**＝① **`-950` 依然不存在**（第 97 批那条没错），但 **`-900` 存在**（旧结论"accent 到 `-500` 为止"作废）；② **同一个后缀数字在不同族里是两种量纲**（foreground 是透明度、red/accent 的 `-550+` 是明度）⇒ **换算表不能跨族共用**。
⇒ ☆ 强调色主题＝`[data-accent=blue|pink|green|purple|yellow|gray]` **恰好 6 档**，每档整体重指 18 条别名（两跳：消费方读 `--accent-100`，主题块改指向）。

### 二、DS 按钮变体全集（`_1bml7_` 族，逐字底色）

| variant | 底色（逐字） | 反馈态 |
| --- | --- | --- |
| `variantPlain` | `color:var(--foreground-900);background:transparent` | hover／focus／`[data-popup-open]` ⇒ 各自规则（`:not(._isStatic,[data-disabled])` 前置） |
| `variantPlainAccent` | 同上族 | hover `background:var(--accent-100)` |
| `variantPlainDanger` | `color:var(--red-500);background:transparent` | hover `background:var(--red-100)` |
| `variantFilled` | `color:var(--foreground-900);background:var(--foreground-100)`（＝**4% 前景底**） | — |
| `variantFilledDanger` | `color:var(--red-500);background:var(--red-100)`（＝**12% 红底**） | — |
| `variantOutlined` | `background:var(--foreground-0);box-shadow:inset 0 0 0 1px var(--foreground-200)` | ★ **边框是 inset shadow 画的，不是 `border`**（与第 97 批六位码面同族 ⇒ DS 通用做法） |

☆ 全集 21 个变体名（Plain 族 7／Filled 族 9／Outlined 族 3／`variantActive`）与 33 条基础规则逐字在 `_harvest/b100-ds-button-1bml7.json`；★ 另 3 条（`dropdownIconWrapper`／`iconContainer`／`isHoverable`）**没有独立基础规则**，只出现在组合选择器里。

### 三、尺寸与形状（三档，全部逐字）

| 档 | height | radius | padding | `--icon-height` | `--chevron-size` | gap |
| --- | --- | --- | --- | --- | --- | --- |
| `sizeSm` | `1.75rem`(28px) | **7px** | `0 .625rem` | 18px | 13px | `.125rem` |
| `sizeMd` | `2rem`(32px) | **8px** | `0 .75rem` | 20px | 14px | `.125rem` |
| `sizeLg` | `2.125rem`(34px) | **9px** | `0 .8125rem` | 22px | 15px | `.125rem` |

☆ 两个修饰类＝`isOnlyIcon{padding:0 .3125rem;align-items:center;justify-content:center}`（**"只有图标"是状态类、不是尺寸档**）＋ `fluid{width:100%;justify-content:center}`。
☆ 禁用＝`[data-disabled]{opacity:.4;cursor:default}`（★ **40%**，本地 `src/components/ui/button.tsx:6` 是 `disabled:opacity-50`＝50%）。

**仍未采到（本节）**：各 variant 的 `:active`／按下态底色（本轮只读到 hover／focus／popup-open 三档）；暗档下这 18 阶是否整体换表（未查 `[data-theme]`）；`@layer utilities` 的工具类全集；其余 12 份 CSS（含 `TaskViews.css`）里的第三套色阶可能。
