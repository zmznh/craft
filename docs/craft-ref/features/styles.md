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

**仍未采到（本节）**：其余 **12 份 CSS**（名册里 `.css` 共 13 个）未落盘 ⇒ 本表只覆盖快捷键面板与 action 组件所在那一份；`Filled/Danger/Accent/DangerSubtle` 四变体的静止值未逐一抄（只抄了与 rail 直接相关的 `Active`／`Default` 链）；`-25`/`-50` 这类低档的实际消费点未统计；官方是否存在 `--foreground-950` 的别处定义（本文件无）；⇒ ✎ **第 105 批在本文件内结案**＝对 `--foreground-950:`／`--foreground-050:` 做逐字搜索**均 ABSENT**，`:root,.token-scope` 里的前景族**恰好 20 档**（`0｜25｜50…900`，见 §十二.五）；其余 12 份 CSS 仍未落盘，故只能说"主 CSS 无"。强调色六套的**具体三元组值**未逐色抄。

## 十一、**DS 按钮的完整官方规格（21 variant × 3 size × 8 状态类，逐字底色）＋ 两段式 18 档色阶全表**（✓盘上 第 100 批·上半 2026-09-30 00:3x–00:5x，零浏览器＝已落盘 CSS 的定点读；原始读数在 `gap.md` §三点一〇四五 G1009–G1017、`_harvest/b100-ds-button-1bml7.json`；⚠ 本节同时**作废 §九.2 的 accent 档位结论**）

### 一、两段式色阶（本目录此前只写过前一段）

| 族 | 档位数 | 前段（alpha） | 后段（不透明逐暗） |
| --- | --- | --- | --- |
| `--foreground-{0,25,…,900}` | **20** | `0%｜2%｜3%｜4%｜6%｜8%｜10%｜12%｜18%｜25%｜32%｜40%｜48%｜55%｜62%｜70%｜78%｜85%｜92%｜100%`（步长 25，多一档 `-0`） | **无**（前景已是最暗墨，变暗无意义） |
| `--red-{50,…,900}` | **18** | `-50…-500`＝`rgb(var(--red) / 6%…100%)`，逐档 `6｜12｜18｜24｜32｜40｜55｜70｜85｜100%` | `-550…-900`＝`rgb(237 54 58)`→`rgb(118 39 42)`（8 档，等步长变暗） |
| `--accent-{50,…,900}` | **18** | 别名转发 `var(--accent-<色>-N)` | 同左（转发到各色的加深段） |
| `--accent-blue-{50,…,900}` | **18** | 基色 `--accent-blue: 46 109 233`，alpha 段同 red | `rgb(44 103 217)`→`rgb(34 60 111)` |

⇒ ★ **两条要记住的口径**＝① **`-950` 依然不存在**（第 97 批那条没错），但 **`-900` 存在**（旧结论"accent 到 `-500` 为止"作废）；② **同一个后缀数字在不同族里是两种量纲**（foreground 是透明度、red/accent 的 `-550+` 是明度）⇒ **换算表不能跨族共用**。
⇒ ☆ 强调色主题＝`[data-accent=blue|pink|green|purple|yellow|gray]` **恰好 6 档**，每档整体重指 18 条别名（两跳：消费方读 `--accent-100`，主题块改指向）。⇒ ✎ **第 105 批加限定**＝这 6 档说的是**强调色板 `--accent-*`**，与**语义色板 `--blue/--red/--orange/--green`（只有 4 色、且 `--blue: 0 136 255` ≠ `--accent-blue: 46 109 233`）**是两套东西，两套蓝的逐字对照见 **§十二.三**（G1060）。

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

**仍未采到（本节）**：~~各 variant 的 `:active`／按下态底色（本轮只读到 hover／focus／popup-open 三档）~~ ⇒ ✎ **第 105 批结案**＝`:active` 全文件仅 10 条、Action 三条底色还包在 `@media (pointer: fine)` 里、`_1bml7_` 的 21 个 variant 实测 **0 条**，见 **§十二.九**；~~暗档下这 18 阶是否整体换表（未查 `[data-theme]`）~~ ⇒ ✎ **第 105 批结案**＝暗档是**三段逐色重指**（38＋116＋56 vars），且 **brand 族的档位序号在两档下整条反向**，见 **§十二.二／三／四／十二**；~~`@layer utilities` 的工具类全集~~ ⇒ ✎ **第 105 批结案**＝**570 个类名、55,653 字符（18.7%）**，含 16 档间距与 26 档圆角普查，见 **§十二.六**；☆ **`.text-<档>`／`.font-*`／`.leading-*`／`.z-*` 在 utilities 里零命中**＝排版不走工具类（§十二.六 末）。仍开着的：**其余 12 份 CSS**（含 `TaskViews.css`）里的第三套色阶可能。
## 十二、**CSS 单文件全量盘点＝九段 token 块逐字 ＋ 两段派生机制 ＋ 复选框／浮层壳／按下态／焦点环四族逐字规则**（✓盘上 第 105 批 2026-09-30 13:1x–14:1x，零浏览器读屏＝已落盘 `_harvest/css/index.css.CP00jDAy.css`（297,080 字符）的定点读；原始读数在 `gap.md` §三点一〇五二 G1059–G1067，机制解释在 `internals.md §四十四`；★ 本节**结掉 §十一 的三条遗留**（按下态底色、暗档是否整体换表、`@layer utilities` 工具类全集），并**修正本批会话内草稿的分层占比计算错误**）

### 一、三层体量（本批首条实测，且**修正本批会话内草稿的计算错误**）

| 层 | 偏移区间 | 字符数 | 占比 | 内容 |
| --- | --- | --- | --- | --- |
| `@layer base` | 1–26,151 | **26,151** | 8.8% | 主题 token 块、`color-scheme` 两行、字体与 reset |
| `@layer utilities` | 26,152–81,804 | **55,653** | 18.7% | **570 个不同类名** ＋ 两段 token 派生块（`:root,.token-scope` 与 `:root`）＋ 暗档重指块 ＋ 触摸按压全局规则 |
| `@layer components{…}` × **84 块** | 81,805–297,080 | **215,275** | **72.5%** | 95 个哈希前缀族（CSS-Module 逐组件产物），本节的四族规则都在这里 |

⇒ ★ **官方 CSS 的主体是"每组件一份哈希类"的组件层，不是工具类层**（工具类只占 18.7%）。
⇒ ✎ **作废记录**＝本批会话内草稿曾写"`@layer utilities`＝270,907 字符／91.2%／574 类"——那是把 utilities **之后**的 84 个 components 块误并进 utilities 的**跨度计算错误**（用 `indexOf` 取到 utilities 起点后直接减到文件尾，没有做花括号配平）。⇒ **纪律：量一层必须配平到该层的闭合 `}`**。类名数也随跨度错（574→**570**）。

### 二、token 块总览（**9 段纯 token 块**，逐段的量与归属层）

| 选择器 | 所在层 | vars | 装什么 |
| --- | --- | --- | --- |
| `[data-theme=light]` | @layer base | **200** | 基色与标量尺全集（`--base`/`--foreground`/4 语义色/`--accent-*` 6 基色/`--brand-red`/`--editor-*` 12 色＋5 渐变＋spectrum/spacing 15/radius 5/shadow 8/transition 6/`--header-height`/`--browse-max-width`） |
| `[data-theme=dark]` | @layer base | **38** | 基色逐色重指（见 §三）＋ `--editor-*` 语法色暗档 |
| `[data-theme=light]`／`[data-theme=dark]` | @layer base | 0 | 只有 `color-scheme` ＋ `background-color:var(--base-900)` ＋ `color:var(--foreground-900)` |
| `[data-theme=light]`／`[data-theme=dark]`（200／38 vars） | @layer utilities | — | ★ **与 `@layer base` 里那两段逐字节相同**（实测 `block0===block4`、`block1===block5` 均为真）⇒ **构建重复，不是两套语义** |
| `:root`（裸，**全文件共 4 处**：0 vars @13738（base）／4 vars @14086（base）／112 vars @68244（utilities）／19 vars @292006（components（文件末段））） | @layer utilities | **112** | **上段字面色**＝4 语义色＋6 强调色的 `-550…-900`（10 族 × 8 档＝80 条）＋ brand **七族** 32 条 |
| `:root,.token-scope` | @layer utilities | **127** | **下段 alpha 派生**＝`--base-900` 1 条 ＋ `--foreground-*` 20 档 ＋（4 语义＋6 强调）× `-50…-500` 100 条 ＋ `--brand-red-*` 6 档；★ 全部形如 `rgb(var(--基色) / P%)`，**没有一条是字面色** |
| `[data-theme=light]`（scale） | @layer components（文件末段） | **116** | 6 强调色各 **18 档**（108）＋ 6 基色 ＋ `--accent-contrast(-900)` |
| `[data-theme=dark]`（scale） | @layer utilities | **116** | 4 语义＋6 强调的 `-550…-900` 暗档字面值 ＋ brand **五族**（red/coral/beige/green/blue）36 条 |
| `[data-theme=dark]`（accent） | @layer components（文件末段） | **56** | 6 强调色基色重指（`--accent-blue: 113 178 255` 等）＋ 各自 `-550…-900` ＋ `--accent-contrast: var(--base)`（★ 暗档下"强调色上的文字"反过来说＝**变成页面底色本身**，而不是保持白色） |

⇒ ★★ **`:root,.token-scope` 是公开的"子树级 token 作用域"接口**：任何子树挂 `.token-scope` 就自带整棵色阶（弹层／导出容器／iframe 内可用），**本地全库零对应物**（见 G1066）。

### 三、七组基色的 light／dark 双值（逐字，暗档**不是反色而是逐色重指**）

| token | light | dark | 变化方向 |
| --- | --- | --- | --- |
| `--base` | `252 253 254` | `30 30 30` | 重指 |
| `--base-overlay` | `rgb(252 252 252 / 100%)` | `rgb(35 35 35 / 100%)` | 重指 |
| `--foreground` | `26 28 30` | `249 249 249` | 重指 |
| `--red` | `255 56 60` | `255 66 69` | 重指 |
| `--orange` | `255 141 40` | `251 164 65` | 重指 |
| `--green` | `52 199 89` | `64 221 138` | 重指 |
| `--blue` | `0 136 255` | `0 145 255` | 重指 |
| `--accent-blue` | `46 109 233` | `113 178 255` | 重指 |
| `--accent-pink` | `214 23 155` | `255 106 209` | 重指 |
| `--accent-green` | `0 194 166` | `77 255 221` | 重指 |
| `--accent-purple` | `94 2 210` | `191 139 255` | 重指 |
| `--accent-yellow` | `228 192 17` | `255 233 123` | 重指 |
| `--accent-gray` | `82 92 102` | `188 194 201` | 重指 |
| `--accent-contrast` | `255 255 255` | `var(--base)` | 重指 |
| `--accent-contrast-900` | `rgb(255 255 255 / 100%)` | `var(--base-900)` | 重指 |
| `--brand-red` | `227 32 87` | **无 dark 值**（沿用 light） | — |
| `--editor-bluedark` | `rgb(3 0 245 / 100%)` | `rgb(170 169 249 / 100%)` | 重指 |
| `--editor-bluelight` | `rgb(41 98 246 / 100%)` | `rgb(65 146 247 / 100%)` | 重指 |
| `--editor-cyan` | `rgb(83 183 224 / 100%)` | `rgb(104 212 251 / 100%)` | 重指 |
| `--editor-text` | `rgb(31 34 37 / 90%)` | `rgb(255 255 255 / 90%)` | 重指 |

⇒ ★ 语义色板只有 **4 色**（red/orange/green/blue，**没有** yellow/purple/pink），强调色板有 **6 色**（blue/pink/green/purple/yellow/gray）⇒ **两板连色数都不同，不能互相代用**（G1060）。
⇒ ☆ `--accent-contrast` 在暗档被重指成 `var(--base)`＝**"强调色上的文字"在暗档变回页面底色**，而不是保持白色。

### 四、两段派生机制（同一个后缀数字在不同段里是**两种量纲**）

**下段＝alpha 派生**（`:root,.token-scope`，随主题基色自动变，light/dark 共用同一张百分比表）：

| 段 | 档位数 | 后缀 | 逐档百分比（逐字） |
| --- | --- | --- | --- |
| `--red-{N}`（下段） | **10** | `50｜100｜150｜200｜250｜300｜350｜400｜450｜500` | `6%｜12%｜18%｜24%｜32%｜40%｜55%｜70%｜85%｜100%` |
| `--accent-blue-{N}`（下段） | **10** | `50｜100｜150｜200｜250｜300｜350｜400｜450｜500` | `6%｜12%｜18%｜24%｜32%｜40%｜55%｜70%｜85%｜100%` |
| `--brand-red-{N}`（下段） | **6** | `50｜100｜200｜300｜400｜500` | `3%｜6%｜12%｜24%｜50%｜100%` |
| `--foreground-{N}`（**唯一有"上段"的族？否——前景只有 alpha**） | **20** | `0｜25｜50｜100｜150｜200｜250｜300｜350｜400｜450｜500｜550｜600｜650｜700｜750｜800｜850｜900` | `0%｜2%｜3%｜4%｜6%｜8%｜10%｜12%｜18%｜25%｜32%｜40%｜48%｜55%｜62%｜70%｜78%｜85%｜92%｜100%` |

⇒ ★ 两条口径：① **`-0` 与 `-25` 只有前景族有**（色板族从 `-50` 起）；② **前景的 `-0`＝0% 透明、`-900`＝100%**，而色板族的 `-50` 已经是 **6%**⇒ **同一后缀跨族不可换算**（`-50` 在前景是 3%、在色板是 6%）。

**上段＝字面 rgb**（裸 `:root` 给 light、`[data-theme=dark]` 给 dark，**只有 `-550…-900`**，等步长变暗／变亮）：

| 族 | light `-550 → -900`（8 档逐字） | dark `-550 → -900` |
| --- | --- | --- |
| `--red` | `rgb(237 54 58 / 100%)` `rgb(221 52 56 / 100%)` `rgb(205 50 53 / 100%)` `rgb(187 48 51 / 100%)` `rgb(168 45 49 / 100%)` `rgb(152 43 46 / 100%)` `rgb(136 41 44 / 100%)` `rgb(118 39 42 / 100%)` | `rgb(255 80 83 / 100%)` `rgb(254 93 96 / 100%)` `rgb(254 106 109 / 100%)` `rgb(253 121 123 / 100%)` `rgb(253 136 137 / 100%)` `rgb(252 149 150 / 100%)` `rgb(252 161 163 / 100%)` `rgb(251 176 177 / 100%)` |
| `--orange` | `rgb(237 132 39 / 100%)` `rgb(221 124 39 / 100%)` `rgb(205 116 38 / 100%)` `rgb(187 107 37 / 100%)` `rgb(168 98 36 / 100%)` `rgb(152 90 35 / 100%)` `rgb(136 82 35 / 100%)` `rgb(118 73 34 / 100%)` | `rgb(251 171 79 / 100%)` `rgb(251 177 92 / 100%)` `rgb(251 183 105 / 100%)` `rgb(250 189 120 / 100%)` `rgb(250 196 135 / 100%)` `rgb(250 202 148 / 100%)` `rgb(250 208 161 / 100%)` `rgb(250 215 175 / 100%)` |
| `--green` | `rgb(50 186 84 / 100%)` `rgb(48 174 80 / 100%)` `rgb(46 161 76 / 100%)` `rgb(44 148 71 / 100%)` `rgb(42 134 67 / 100%)` `rgb(40 122 62 / 100%)` `rgb(38 110 58 / 100%)` `rgb(36 96 54 / 100%)` | `rgb(79 223 147 / 100%)` `rgb(92 225 155 / 100%)` `rgb(105 227 162 / 100%)` `rgb(119 229 171 / 100%)` `rgb(134 232 180 / 100%)` `rgb(147 234 188 / 100%)` `rgb(160 236 196 / 100%)` `rgb(175 238 205 / 100%)` |
| `--blue` | `rgb(2 128 237 / 100%)` `rgb(4 120 221 / 100%)` `rgb(6 112 206 / 100%)` `rgb(8 104 188 / 100%)` `rgb(10 95 169 / 100%)` `rgb(12 87 154 / 100%)` `rgb(14 80 138 / 100%)` `rgb(16 71 120 / 100%)` | `rgb(20 153 255 / 100%)` `rgb(37 160 254 / 100%)` `rgb(55 168 254 / 100%)` `rgb(74 176 253 / 100%)` `rgb(95 185 253 / 100%)` `rgb(112 192 252 / 100%)` `rgb(130 199 252 / 100%)` `rgb(149 207 251 / 100%)` |
| `--accent-blue` | `rgb(44 103 217 / 100%)` `rgb(43 97 203 / 100%)` `rgb(42 91 188 / 100%)` `rgb(40 85 172 / 100%)` `rgb(38 78 156 / 100%)` `rgb(37 72 141 / 100%)` `rgb(36 67 127 / 100%)` `rgb(34 60 111 / 100%)` | `rgb(124 184 255 / 100%)` `rgb(133 189 254 / 100%)` `rgb(143 194 254 / 100%)` `rgb(154 199 253 / 100%)` `rgb(165 205 253 / 100%)` `rgb(174 210 252 / 100%)` `rgb(184 215 252 / 100%)` `rgb(195 221 251 / 100%)` |
| `--accent-pink` | `rgb(199 23 145 / 100%)` `rgb(186 24 136 / 100%)` `rgb(173 24 128 / 100%)` `rgb(158 24 118 / 100%)` `rgb(142 25 107 / 100%)` `rgb(129 25 99 / 100%)` `rgb(116 26 90 / 100%)` `rgb(101 26 80 / 100%)` | `rgb(255 117 212 / 100%)` `rgb(254 127 215 / 100%)` `rgb(254 137 218 / 100%)` `rgb(253 149 221 / 100%)` `rgb(253 160 224 / 100%)` `rgb(252 170 227 / 100%)` `rgb(252 181 230 / 100%)` `rgb(251 192 233 / 100%)` |
| `--accent-green` | `rgb(2 181 155 / 100%)` `rgb(4 169 146 / 100%)` `rgb(6 158 136 / 100%)` `rgb(8 145 125 / 100%)` `rgb(10 131 114 / 100%)` `rgb(12 119 105 / 100%)` `rgb(14 107 95 / 100%)` `rgb(16 94 84 / 100%)` | `rgb(90 255 223 / 100%)` `rgb(103 254 225 / 100%)` `rgb(115 254 227 / 100%)` `rgb(128 253 229 / 100%)` `rgb(142 253 232 / 100%)` `rgb(155 252 234 / 100%)` `rgb(167 252 236 / 100%)` `rgb(180 251 238 / 100%)` |
| `--accent-purple` | `rgb(89 4 196 / 100%)` `rgb(84 6 183 / 100%)` `rgb(79 8 170 / 100%)` `rgb(74 10 156 / 100%)` `rgb(68 12 142 / 100%)` `rgb(63 14 129 / 100%)` `rgb(59 16 116 / 100%)` `rgb(53 18 102 / 100%)` | `rgb(196 148 255 / 100%)` `rgb(200 155 254 / 100%)` `rgb(204 163 254 / 100%)` `rgb(208 172 253 / 100%)` `rgb(213 181 253 / 100%)` `rgb(217 189 252 / 100%)` `rgb(221 196 252 / 100%)` `rgb(226 205 251 / 100%)` |
| `--accent-yellow` | `rgb(212 179 18 / 100%)` `rgb(198 168 19 / 100%)` `rgb(184 156 20 / 100%)` `rgb(168 143 21 / 100%)` `rgb(151 130 22 / 100%)` `rgb(137 118 23 / 100%)` `rgb(123 106 24 / 100%)` `rgb(107 94 25 / 100%)` | `rgb(255 234 133 / 100%)` `rgb(254 235 142 / 100%)` `rgb(254 237 151 / 100%)` `rgb(253 238 161 / 100%)` `rgb(253 239 171 / 100%)` `rgb(252 240 180 / 100%)` `rgb(252 241 189 / 100%)` `rgb(251 243 199 / 100%)` |
| `--accent-gray` | `rgb(78 87 96 / 100%)` `rgb(74 82 91 / 100%)` `rgb(70 78 86 / 100%)` `rgb(65 73 81 / 100%)` `rgb(61 68 75 / 100%)` `rgb(57 63 70 / 100%)` `rgb(53 59 64 / 100%)` `rgb(48 54 59 / 100%)` | `rgb(193 198 205 / 100%)` `rgb(197 202 208 / 100%)` `rgb(201 206 212 / 100%)` `rgb(206 210 215 / 100%)` `rgb(211 215 219 / 100%)` `rgb(216 219 223 / 100%)` `rgb(220 223 226 / 100%)` `rgb(225 227 230 / 100%)` |

⇒ ★ **`[data-theme=light]` scale 块（116 vars）里的 108 条是纯重复**：与裸 `:root` 重叠 **48** 条（上段 `-550…-900`）、与 `:root,.token-scope` 重叠 **60** 条（下段 `-50…-500`），两组**逐字节相同**（实测 均为 true）⇒ **同一份色阶在三个不同选择器下各写一遍**（`:root` 全局、`:root,.token-scope` 可挂子树、`[data-theme=light]` 主题档），本表逐字取"上段＝裸 `:root`、下段＝`:root,.token-scope`"。

### 五、`--foreground-*` 20 档全表（唯一"跨满 0→900"的族，且**没有 `-950`**）

| 档 | 0 | 25 | 50 | 100 | 150 | 200 | 250 | 300 | 350 | 400 | 450 | 500 | 550 | 600 | 650 | 700 | 750 | 800 | 850 | 900 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 值 | 0% | 2% | 3% | 4% | 6% | 8% | 10% | 12% | 18% | 25% | 32% | 40% | 48% | 55% | 62% | 70% | 78% | 85% | 92% | 100% |

⇒ ☆ **`--foreground-950` 与 `--foreground-050` 逐字搜索均为 ABSENT**（本文件），⇒ 第 97 批"同名后缀不存在"的那条遗留问题**到此结案**（仍不能排除其余 12 份 CSS 有别的表）。

### 六、工具类普查（`@layer utilities` 内 **570 个不同类名**的构成）

| 工具类族 | 档数 | 档位（逐字，`-5` 表示"半档"） |
| --- | --- | --- |
| `p-{N}` | **16** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16` |
| `m-{N}` | **17** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16｜auto` |
| `gap-{N}` | **16** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16` |
| `w-{N}` | **20** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16｜auto｜fit｜full｜screen` |
| `h-{N}` | **20** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16｜auto｜fit｜full｜screen` |
| `min-w-{N}` | **17** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16｜full` |
| `max-w-{N}` | **17** | `0｜0-5｜1｜1-5｜2｜2-5｜3｜3-5｜4｜4-5｜5｜6｜8｜10｜12｜16｜full` |
| `fade-truncate-{N}` | **10** | `1｜2｜3｜4｜5｜6｜8｜10｜12｜16` |
| `grid-cols-{N}` | **7** | `1｜2｜3｜4｜6｜12｜none` |
| `rounded-{N}` | **26** | `b-lg｜b-md｜b-none｜b-sm｜b-xl｜full｜l-lg｜l-md｜l-none｜l-sm｜l-xl｜lg｜md｜none｜r-lg｜r-md｜r-none｜r-sm｜r-xl｜sm｜t-lg｜t-md｜t-none｜t-sm｜t-xl｜xl` |
| `shadow-{N}` | **8** | `doc｜empty｜inner｜md｜none｜sm｜sr｜xs` |
| `text-{N}` | **3** | `center｜left｜right` |
| `bg-{N}` | **35** | `accent｜accent-100｜accent-200｜accent-50｜base｜base-overlay｜foreground-0｜foreground-100｜foreground-150｜foreground-200｜foreground-25｜foreground-250｜foreground-300｜foreground-350｜foreground-400｜foreground-450｜foreground-50｜foreground-500｜foreground-550｜foreground-600｜foreground-650｜foreground-700｜foreground-750｜foreground-800｜foreground-850｜foreground-900｜green｜green-100｜green-50｜orange｜orange-100｜orange-50｜red｜red-100｜red-50` |

⇒ ★ **spacing 工具类 16 档 ≠ spacing token 15 个**＝多出来那档是 **`-0`**，它**没有对应 token**、直接写死（`.p-0{padding:0}`、`.m-0{margin:0}`、`.gap-0{gap:0}`…），其余 15 档逐条 `padding:var(--spacing-N)`；☆ **`-5` 结尾的是"半档"**（`2-5`＝`0.625rem`），一共 5 个（`0-5/1-5/2-5/3-5/4-5`）；☆ `.m-*` 比 `.p-*` 多 `auto`；☆ `.fade-truncate-*` 从 `-1` 起、**无 `-0`**；☆ `.w-{N}`／`.h-{N}` 各 **20 档**＝16 档间距 ＋ `auto｜fit｜full｜screen`，另有 `12`／`3-5` 与 `full` 这类跨族覆名。
⇒ ☆ **`.text-<档>`／`.font-*`／`.leading-*`／`.tracking-*`／`.z-*` 全部零命中**（`.text-*` 只有 `center/left/right`）⇒ **排版不走工具类**，只能读 `--heading-*-<档>-{size,weight,line-height,letter-spacing}` 语义 token ＋ 组件哈希类（G1059）。

### 七、复选框族 `_1fgll_`（4 条规则＝全量，逐字）

```css
/* @layer components 块内首条 */ ._wrapper_1fgll_1{display:inline-flex;align-items:center;justify-content:center;width:var(--cb-wrapper-size, 1.25rem);height:var(--cb-wrapper-size, 1.25rem);flex-shrink:0;cursor:pointer}
```
```css
._checkbox_1fgll_11{display:inline-flex;align-items:center;justify-content:center;width:var(--cb-size, 1.125rem);height:var(--cb-size, 1.125rem);border-radius:9999px;border:var(--cb-border-width, 1.5px) solid var(--foreground-200);background:var(--base-900);color:var(--accent-contrast-900);pointer-events:none;transition:var(--transition-fast);transition-property:border-color,background,opacity,transform}
```
```css
._checkbox_1fgll_11[data-checked],._checkbox_1fgll_11[data-indeterminate]{background:var(--accent-500);border-color:var(--accent-500)}
```
```css
._icon_1fgll_32{color:var(--accent-contrast-900)}
```

⇒ ★ **18px 圆形（`border-radius:9999px`）、1.5px 边框**；勾选／半选**同换**底色与边框为 `var(--accent-500)`；勾色 `var(--accent-contrast-900)`；`pointer-events:none`＝**点击由 20px 的 wrapper 承接**（⇒ 命中区比可见框每边大 1px）；`transition-property` **含 `transform`**⇒ 勾选带微缩放。
⇒ ☆ 三个尺寸全是**可覆盖变量**：`--cb-wrapper-size`（默认 1.25rem）／`--cb-size`（1.125rem）／`--cb-border-width`（1.5px）⇒ 消费方改尺寸不必改组件（本地无此接口，G1062）。

### 八、浮层壳 `_16nf6_`（25 条＝全量，逐字）

```css
/* @layer components 块内首条 */ ._searchField_16nf6_2{padding:var(--spacing-1-5);width:100%;z-index:1}
```
```css
._content_16nf6_9{--menu-width: auto;--menu-min-width: 220px;--menu-max-height: none;--search-field-size: 2.5rem;padding:var(--spacing-1-5);scroll-padding-block:var(--spacing-1-5);width:var(--menu-width);min-width:var(--menu-min-width);max-height:min(var(--menu-max-height),var(--available-height, 100vh));display:flex;flex-direction:column;overflow-y:auto}
```
```css
._content_16nf6_9:has(._scrollArea_16nf6_24){padding:0}
```
```css
._content_16nf6_9 ._scrollAreaViewport_16nf6_28{padding:var(--spacing-1-5);scroll-padding-block:var(--spacing-1-5)}
```
```css
._content_16nf6_9:not(:has(._header_16nf6_33)):has(._searchField_16nf6_2) ._scrollAreaViewport_16nf6_28{--fadeout-padding-top: var(--search-field-size);padding-block-start:var(--search-field-size);scroll-padding-block-start:var(--search-field-size)}
```
```css
._content_16nf6_9:not(:has(._header_16nf6_33)):has(._searchField_16nf6_2) ._searchField_16nf6_2{position:absolute;top:0}
```
```css
._content_16nf6_9:not(:has(._header_16nf6_33)):has(._searchField_16nf6_2) ._scrollArea_16nf6_24 [data-orientation]{z-index:2}
```
```css
@media (pointer: coarse) and (width <= 747px){._content_16nf6_9{--search-field-size: 3.625rem;width:100%;padding:.4375rem}
```
```css
._content_16nf6_9 ._scrollAreaViewport_16nf6_28{padding:.4375rem;scroll-padding-block:.4375rem}
```
```css
._searchField_16nf6_2{padding:.4375rem}
```
```css
._group_16nf6_71{padding-block:.4375rem}
```
```css
._groupLabel_16nf6_75{padding:.75rem .875rem}
```
```css
._item_16nf6_79 [data-ds=avatar]{--avatar-size: 1.5625rem !important;--avatar-border-radius: .375rem !important}
```
```css
._header_16nf6_33,._footer_16nf6_88{padding:.9375rem 1.25rem}
```
```css
._item_16nf6_79{width:100%;scroll-margin-block:var(--spacing-4)}
```
```css
._group_16nf6_71{position:relative;padding:var(--spacing-1-5) 0}
```
```css
._group_16nf6_71:first-child{padding-top:0}
```
```css
._group_16nf6_71:last-child{padding-bottom:0}
```
```css
._group_16nf6_71+._group_16nf6_71:before{content:\"\";position:absolute;top:0;left:var(--spacing-2);right:var(--spacing-2);height:1px;background:var(--foreground-100)}
```
```css
._groupLabel_16nf6_75{padding:var(--spacing-2-5) .6875rem;color:var(--foreground-500);font-size:var(--heading-xs-500-size);font-weight:var(--heading-xs-500-weight);line-height:var(--heading-xs-500-line-height);letter-spacing:var(--heading-xs-500-letter-spacing)}
```
```css
._groupLabelClickable_16nf6_136{display:block;width:100%;background:none;border:none;text-align:left;cursor:pointer;border-radius:var(--radius-sm);transition:var(--transition-fast);transition-property:color}
```
```css
[data-whatintent]:not([data-whatintent=touch]) ._groupLabelClickable_16nf6_136:hover{color:var(--foreground-800)}
```
```css
._header_16nf6_33{padding:var(--spacing-3) var(--spacing-4);border-bottom:1px solid var(--foreground-150)}
```
```css
._footer_16nf6_88{padding:var(--spacing-3) var(--spacing-4);border-top:1px solid var(--foreground-150)}
```
```css
._searchList_16nf6_165{display:contents}
```

⇒ ★ **"壳里到底有没有搜索框"结案＝有，且定位随"有没有 header"翻转**：`_content:not(:has(_header)):has(_searchField)` ⇒ 搜索框 `position:absolute;top:0` ＋ 给滚动视口设 `--fadeout-padding-top:var(--search-field-size)`（用渐隐补位），有 header 时搜索框就正常进文档流。
⇒ ★ **同一壳有两档密度**：`_content` 第一次起 `--search-field-size:2.5rem; padding:var(--spacing-1-5)`，第二次覆写 `--search-field-size:3.625rem; width:100%; padding:.4375rem`（7px）⇒ `3.625rem` 档是"占满宽＋密 7px"的命令面板形态。
⇒ ☆ 四个接口变量＝`--menu-width:auto`、**`--menu-min-width:220px`**、**`--menu-max-height:none`**、`--search-field-size`；☆ 分组分隔线是 `_group+_group:before`（1px、`var(--foreground-100)`、左右内缩 `var(--spacing-2)`）；☆ 分组标签用**排版 token**（`--heading-xs-500-*` 四件套）＋ `color:var(--foreground-500)`；☆ 条目里头像覆写 `--avatar-size:1.5625rem !important`／`--avatar-border-radius:.375rem !important`；☆ `_searchList{display:contents}`＝**搜索列表不产生布局盒**。

### 九、按下态与触摸反馈（★ 结掉 §十一 遗留①）

全文件 `:active` 规则共 **10 条**（逐字全量如下，按文件顺序）。其中带 `background` 的 **7 条**，**属于 Action 族 `_1j891_` 的 3 条**，**包在 `@media (pointer: fine)` 里的 3 条**，**属于 DS 按钮族 `_1bml7_` 的 0 条**：

```css
[data-whatintent=touch] :where(button,a[href],[role=button],[role=option],[role=menuitem],[role=tab],[data-interactive]):not(.noPressFeedback):active{transform:scale(.99);opacity:.75}
```
```css
._closeButton_hlglt_29:active{background:var(--foreground-150)}
```
```css
._thumb_1ltym_54:active{background:var(--scrollbar-thumb-active, var(--foreground-500))}
```
```css
@media (pointer: fine) /* 该块内 */
._variantDefault_1j891_116:not(._isStatic_1j891_31,[data-disabled]):active{background:var(--foreground-200)}
```
```css
@media (pointer: fine) /* 该块内 */
._variantFilled_1j891_139:not(._isStatic_1j891_31,[data-disabled]):active{background:var(--foreground-200)}
```
```css
@media (pointer: fine) /* 该块内 */
._variantActive_1j891_163:not(._isStatic_1j891_31,[data-disabled]):active{background:var(--foreground-200)}
```
```css
[data-whatintent]:not([data-whatintent=touch]) ._defaultAppearance_ag9lu_17:not(:disabled):hover,._defaultAppearance_ag9lu_17:not(:disabled):active,[data-whatintent=keyboard] ._defaultAppearance_ag9lu_17:not(:disabled):focus,[data-whatintent]:not([data-whatintent=touch]) ._activeAppearance_ag9lu_18:not(:disabled):hover,._activeAppearance_ag9lu_18:not(:disabled):active,[data-whatintent=keyboard] ._activeAppearance_ag9lu_18:not(:disabled):focus{background:transparent}
```
```css
._link-preview__button_4t8un_1:active{opacity:.91}
```
```css
._toggleButton_1kiy9_34:active{background:var(--foreground-150)}
```
```css
[data-whatintent]:not([data-whatintent=touch]) ._subtitle_1p200_17 a:hover,._subtitle_1p200_17 a:active,[data-whatintent=keyboard] ._subtitle_1p200_17 a:focus{text-decoration:underline;color:inherit}
```
⇒ ★ **三条 Action 底色被包在同一个 `@media (pointer: fine){…}` 块里**⇒ **"按下变深一档"是鼠标档专属**；触摸档走下面那条全局缩放，两者互斥。
⇒ ★ **DS 按钮族 `_1bml7_`（21 个 variant、36 个标识符）的 `:active` 规则实测 0 条**⇒ "按下变深一档"只属于 Action，不属于按钮。
⇒ ★ 按钮的按下反馈由**两条全局规则**承担（触摸意图档：一条静止态预置、一条 `:active`，后者已在上面第 1 条）。**静止态预置条逐字**＝

```css
[data-whatintent=touch] :where(button,a[href],[role=button],[role=option],[role=menuitem],[role=tab],[data-interactive]):not(.noPressFeedback){transform:scale(1);opacity:1;will-change:transform,opacity;transition-property:transform,opacity!important;transition-duration:.2s!important;transition-timing-function:cubic-bezier(.4,0,.2,1)!important}
```

⇒ 逐字要点＝① 选择器用 **`:where(...)`**（特异性 0，任何组件都能盖）；② 名单＝`button, a[href], [role=button], [role=option], [role=menuitem], [role=tab], [data-interactive]`；③ 闸门＝**`[data-whatintent=touch]`**（⇒ 鼠标按下**不缩放**）；④ 三属性全带 `!important`（强制覆盖组件自己的 transition）；⑤ 按压值＝`transform:scale(.99)` ＋ `opacity:.75`，时长 `.2s`；⑥ **唯一豁免口 `.noPressFeedback`**（全文件仅出现 2 处＝这两条自己）。
⇒ ☆ **零星四条各自为政**＝`_closeButton`（关闭按钮）与 `_toggleButton` 用 `background:var(--foreground-150)`、`_link-preview__button` 用 `opacity:.91`（★ 又一个独立按压值：**只降透明度、不缩放**）、滚动条 `_thumb` 用 `var(--scrollbar-thumb-active, var(--foreground-500))`、链接外观两条把 `:active` 与 `:hover`/`:focus` **并列**（前者 `background:transparent` 清底、后者 `text-decoration:underline`）⇒ ★ **官方没有统一的"按下"token**，每个组件自取一档，且**同一组件的 hover/active/focus 三态可以共用一条规则**（＝三态视觉相同）。

### 十、焦点环（★ 首次拿到具体数值）

键盘意图闸门 `[data-whatintent=keyboard]` 下共 **58 条规则**，其中**动到 `outline` 的 15 条**（`outline:none` 的 8 条）：

```css
[data-whatintent=keyboard] :focus{outline:1px solid var(--accent-500);outline-offset:1.5px}
```
```css
[data-whatintent=keyboard] [contenteditable=true]:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._action_1j891_1:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._tab_x8v9o_26:focus{outline:2px solid var(--accent-500);outline-offset:-2px}
```
```css
[data-whatintent=keyboard] ._row_v0ra3_1:has(>._stretchedLink_v0ra3_39:focus){outline:2px solid var(--accent-500);outline-offset:-2px}
```
```css
[data-whatintent=keyboard] ._actionButton_v0ra3_210:focus{opacity:1!important;outline:1px solid var(--accent-500);outline-offset:-1px}
```
```css
[data-whatintent=keyboard] ._buttonWrapper_2tc9o_6:focus{outline:1px solid var(--accent-500);outline-offset:-1px}
```
```css
[data-whatintent=keyboard] ._propertyCheckbox_l4u28_786:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._selectChevron_l4u28_920:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._cell_l4u28_91:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._cell_l4u28_91._cellSelected_l4u28_1233:focus{outline:none}
```
```css
[data-whatintent=keyboard] [data-cell-selected=true]:focus{outline:none}
```
```css
[data-whatintent=keyboard] ._root_dcpw4_1:focus{outline:2px solid var(--accent-500);outline-offset:2px}
```
```css
[data-whatintent=keyboard] ._collectionName_10ujq_30:focus{outline:none}
```
```css
[data-whatintent=keyboard] :is(._primary_15me0_15,._chevron_15me0_16):focus{outline:2px solid var(--accent-500);outline-offset:2px}
```
⇒ ★ **通用环＝1px／offset **+1.5px**；tab 环＝**2px／offset **−2px**（内嵌）**⇒ 官方**同一属性两种环**，不是全局一套；
⇒ ★ **`[contenteditable=true]:focus{outline:none}`＝编辑器正文持焦刻意不画环**（正文靠光标本身表达焦点）；☆ Action 组件同样去环（`._action_1j891_1:focus{outline:none}`）＝它自己承担焦点表现。

### 十一、标量尺（四族全量逐字）

**spacing（15 个 token／16 个工具档）**

| token | 值 | token | 值 | token | 值 |
| --- | --- | --- | --- | --- | --- |
| `spacing-0-5` | `.125rem` | `spacing-1` | `.25rem` | `spacing-1-5` | `.375rem` |
| `spacing-2` | `.5rem` | `spacing-2-5` | `.625rem` | `spacing-3` | `.75rem` |
| `spacing-3-5` | `.875rem` | `spacing-4` | `1rem` | `spacing-4-5` | `1.125rem` |
| `spacing-5` | `1.25rem` | `spacing-6` | `1.5rem` | `spacing-8` | `2rem` |
| `spacing-10` | `2.5rem` | `spacing-12` | `3rem` | `spacing-16` | `4rem` |

**radius（5 档）／transition（3 档＋1 easing）／两个布局宽**

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
--transition-easing: cubic-bezier(.4, 0, .2, 1);
--transition-duration-slow: .5s;
--transition-duration-medium: .2s;
--transition-duration-fast: .15s;
--transition-slow: var(--transition-duration-slow) var(--transition-easing);
--transition-medium: var(--transition-duration-medium) var(--transition-easing);
--transition-fast: var(--transition-duration-fast) var(--transition-easing);
--header-height: 48px;
--browse-max-width: 1630px;
```

⇒ ☆ 本地对照（`src/app/globals.css`）＝`--transition-easing` 与三档时长**等价**（`:190-192`；官方写 `cubic-bezier(.4, 0, .2, 1)`、本地写 `cubic-bezier(0.4, 0, 0.2, 1)`＝同一曲线的两种字面），官方 `-medium` 在本地叫 `-base`、且本地**没有"时长＋easing 组合变量"的两层写法**（直接 `150ms var(--transition-easing)`）；`--header-height: 48px` 已有（`:203` `--layout-header-h`）；**缺** `--browse-max-width: 1630px`、缺 `--radius-full`（本地 7 档 4/8/12/16/20/24/28px，比官方多出 `2xl/3xl/4xl` 三档）、缺全部 `--spacing-*`。

**shadow（8 档，逐字）**

| 档 | 层数 | 值（逐字） |
| --- | --- | --- |
| `shadow-empty` | 6 | `0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0), 0px 0px 0px 0px rgba(0, 0, 0, 0)` |
| `shadow-xxs` | 3 | `0px 0px 0px 1px rgba(0, 0, 0, .04), 0px 1px 1.5px 0px rgba(0, 0, 0, .06), 0px 2.5px 4px 0px rgba(0, 0, 0, .06)` |
| `shadow-xs` | 6 | `0px 1px 1px 0px rgba(0, 0, 0, .04), 0px 3px 3px 0px rgba(0, 0, 0, .04), 0px 6px 4px 0px rgba(0, 0, 0, .02), 0px 11px 4px 0px rgba(0, 0, 0, .01), 0px 17px 5px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| `shadow-sm` | 6 | `0px 2px 4px 0px rgba(0, 0, 0, .07), 0px 8px 8px 0px rgba(0, 0, 0, .06), 0px 18px 11px 0px rgba(0, 0, 0, .04), 0px 32px 13px 0px rgba(0, 0, 0, .01), 0px 51px 14px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| `shadow-md` | 6 | `0px 4px 9px 0px rgba(0, 0, 0, .07), 0px 16px 16px 0px rgba(0, 0, 0, .06), 0px 36px 22px 0px rgba(0, 0, 0, .04), 0px 65px 26px 0px rgba(0, 0, 0, .01), 0px 101px 28px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| `shadow-sr` | 6 | `0px 1px 2px 0px rgba(0, 0, 0, .05), 0px 4px 4px 0px rgba(0, 0, 0, .04), 0px 9px 5px 0px rgba(0, 0, 0, .03), 0px 16px 6px 0px rgba(0, 0, 0, .01), 0px 25px 7px 0px rgba(0, 0, 0, 0), 0px 0px 0px 1px rgba(0, 0, 0, .03)` |
| `shadow-doc` | 6 | `0px 0px 0px 1px rgba(0, 0, 0, .06), 0px 1px 1px -.5px rgba(0, 0, 0, .06), 0px 3px 3px -1.5px rgba(0, 0, 0, .06), 0px 6px 6px -3px rgba(0, 0, 0, .06), 0px 12px 12px -6px rgba(0, 0, 0, .04), 0px 24px 24px -12px rgba(0, 0, 0, .03)` |
| `shadow-inner` | 1 | `inset rgba(255, 255, 255, .88) 0px 0px 0px 1px` |

⇒ ★ **6 档是 6 层叠加**，其中 `--shadow-empty`＝**6 层全透明**（占位用，保证任何档都占用同样的层数⇒ 覆写时不会掉层）；`--shadow-xxs` 只有 **3 层**、`--shadow-inner` 是**白色内描边** `inset rgba(255,255,255,.88) 0px 0px 0px 1px`；其余 6 层档的**第 6 层恒为 `0px 0px 0px 1px` 的 1px 描边**（⇒ 官方阴影自带描边，本地 `sm/md` 抄到第 3 层就断了，G1067）。

### 十二、brand 七族（上段字面色逐字，暗档另有 5 族重指）

| 族 | light（`:root` 裸块） | dark（`[data-theme=dark]` scale 块） |
| --- | --- | --- |
| `brand-red` | `600`→`rgb(213 27 79 / 100%)` `700`→`rgb(177 22 66 / 100%)` `800`→`rgb(140 18 52 / 100%)` `900`→`rgb(118 15 44 / 100%)` | `50`→`rgb(82 10 30 / 100%)` `100`→`rgb(118 15 44 / 100%)` `200`→`rgb(140 18 52 / 100%)` `300`→`rgb(177 22 66 / 100%)` `400`→`rgb(213 27 79 / 100%)` `500`→`rgb(227 32 87 / 100%)` `600`→`rgb(241 143 171 / 100%)` `700`→`rgb(248 201 215 / 100%)` `800`→`rgb(252 228 235 / 100%)` `900`→`rgb(253 242 245 / 100%)` |
| `brand-orange` | `500`→`rgb(255 117 36 / 100%)` | **无暗档族** |
| `brand-yellow` | `500`→`rgb(253 185 1 / 100%)` | **无暗档族** |
| `brand-coral` | `300`→`rgb(252 203 190 / 100%)` `400`→`rgb(251 180 162 / 100%)` `500`→`rgb(249 150 126 / 100%)` | `300`→`rgb(249 150 126 / 100%)` `400`→`rgb(251 180 162 / 100%)` `500`→`rgb(252 203 190 / 100%)` |
| `brand-beige` | `50`→`rgb(250 245 245 / 100%)` `100`→`rgb(237 220 203 / 35%)` `200`→`rgb(246 237 229 / 100%)` `300`→`rgb(237 220 203 / 72%)` `400`→`rgb(237 220 203 / 80%)` `500`→`rgb(237 220 203 / 100%)` | `50`→`rgb(170 115 59 / 100%)` `100`→`rgb(209 166 122 / 100%)` `200`→`rgb(225 196 168 / 100%)` `300`→`rgb(237 220 203 / 100%)` `400`→`rgb(246 237 229 / 100%)` `500`→`rgb(250 245 245 / 100%)` |
| `brand-green` | `50`→`rgb(128 205 197 / 16%)` `100`→`rgb(128 205 197 / 30%)` `200`→`rgb(128 205 197 / 60%)` `300`→`rgb(128 205 197 / 100%)` `400`→`rgb(0 155 140 / 100%)` `500`→`rgb(0 117 88 / 100%)` `600`→`rgb(0 72 48 / 100%)` | `50`→`rgb(0 41 27 / 100%)` `100`→`rgb(0 46 31 / 100%)` `200`→`rgb(0 56 37 / 100%)` `300`→`rgb(0 72 48 / 100%)` `400`→`rgb(0 117 88 / 100%)` `500`→`rgb(0 155 140 / 100%)` `600`→`rgb(128 205 197 / 100%)` |
| `brand-blue` | `50`→`rgb(113 178 255 / 16%)` `100`→`rgb(113 178 255 / 30%)` `200`→`rgb(113 178 255 / 60%)` `300`→`rgb(113 178 255 / 80%)` `400`→`rgb(113 178 255 / 100%)` `500`→`rgb(46 109 233 / 100%)` `600`→`rgb(50 50 195 / 100%)` `700`→`rgb(45 45 150 / 100%)` `800`→`rgb(24 8 109 / 100%)` `900`→`rgb(18 6 82 / 100%)` | `50`→`rgb(18 6 82 / 100%)` `100`→`rgb(24 8 109 / 100%)` `200`→`rgb(45 45 150 / 100%)` `300`→`rgb(50 50 195 / 100%)` `400`→`rgb(46 109 233 / 100%)` `500`→`rgb(113 178 255 / 100%)` `600`→`rgb(141 194 255 / 100%)` `700`→`rgb(170 209 255 / 100%)` `800`→`rgb(212 232 255 / 100%)` `900`→`rgb(232 243 255 / 100%)` |

⇒ ☆ `--brand-orange` 与 `--brand-yellow` **各只有 1 档**⇒ 它们是"单点品牌色"不是色阶；`brand-blue`／`brand-red` 各有 **10 档**＝真正在用的品牌梯度；⇒ `[data-theme=dark]` 只重指 **5 族**（red/coral/beige/green/blue），orange 与 yellow **暗档不重指**＝沿用 light 值。
⇒ ★★★ **brand 族的档位序号在两档下是"反向"的**（不是逐档重指，而是整条色阶掉头）＝`brand-blue` light `50`＝`rgb(113 178 255/16%)`（最浅）→ `900`＝`rgb(18 6 82)`（最深），而 dark `50`＝`rgb(18 6 82)`（最深）→ `900`＝`rgb(232 243 255)`（最浅）；`brand-green`／`brand-beige`／`brand-red` 同型 ⇒ **同一个类名（如 `bg-brand-blue-100`）在两档下落在色阶的相反两端**＝"档位表示相对深浅、不表示固定色值"的最硬证据（`internals.md §四十四.3`）。
⇒ ☆ light 侧 brand 族还**混用 alpha 与字面**（`brand-green-50/100/200`＝`rgb(128 205 197 / 16%｜30%｜60%)`，到 `-300` 才转成 100%），而 dark 侧全是 100% 字面⇒ **两档不是同一张表的两行，是两张表**。

### 十三、`--editor-*` 语法色与封面渐变（11 条色＝10 色＋`--editor-text`，5 条渐变，1 条 spectrum；逐字）

```css
/* light（[data-theme=light]，@layer base） */
--editor-bluedark: rgb(3 0 245 / 100%);
--editor-bluelight: rgb(41 98 246 / 100%);
--editor-cyan: rgb(83 183 224 / 100%);
--editor-green: rgb(91 199 139 / 100%);
--editor-orange: rgb(240 151 55 / 100%);
--editor-red: rgb(219 48 53 / 100%);
--editor-purple: rgb(180 37 246 / 100%);
--editor-brown: rgb(126 80 25 / 100%);
--editor-greydark: rgb(104 116 133 / 100%);
--editor-greylight: rgb(159 164 169 / 100%);
--editor-text: rgb(31 34 37 / 90%);
--editor-spectrum: conic-gradient( from 180deg at 50% 50%, rgba(255, 0, 0, 1) -54.01deg, rgba(0, 0, 255, 1) 54deg, rgba(0, 255, 0, 1) 147.6deg, rgba(243, 245, 219, 1) 223.2deg, rgba(243, 245, 219, 1) 226.8deg, rgba(255, 0, 0, 1) 306deg, rgba(0, 0, 255, 1) 413.99deg );
--editor-gradient-blue: linear-gradient( 108.9deg, rgba(40, 188, 190, 1) 0%, rgba(57, 53, 221, 1) 100% );
--editor-gradient-purple: linear-gradient( 109.45deg, rgba(36, 73, 254, 1) 0%, rgba(202, 75, 167, 1) 100% );
--editor-gradient-pink: linear-gradient( 108.9deg, rgba(255, 113, 0, 1) 0%, rgba(243, 0, 173, 1) 100% );
--editor-gradient-orange: linear-gradient( 108.9deg, rgba(243, 169, 0, 1) 0%, rgba(228, 62, 41, 1) 100% );
--editor-gradient-gold: linear-gradient( 108.9deg, rgba(177, 106, 77, 1) 0%, rgba(213, 166, 56, 1) 100% );
/* dark（[data-theme=dark]，@layer base）——该块内 --editor-* 全量 16 条 */
--editor-bluedark: rgb(170 169 249 / 100%);
--editor-bluelight: rgb(65 146 247 / 100%);
--editor-cyan: rgb(104 212 251 / 100%);
--editor-green: rgb(117 251 190 / 100%);
--editor-orange: rgb(240 151 55 / 100%);
--editor-red: rgb(235 80 108 / 100%);
--editor-purple: rgb(209 123 248 / 100%);
--editor-brown: rgb(126 80 25 / 100%);
--editor-greydark: rgb(112 116 120 / 100%);
--editor-greylight: rgb(174 188 199 / 100%);
--editor-text: rgb(255 255 255 / 90%);
--editor-gradient-blue: linear-gradient( 108.9deg, rgba(159, 246, 209, 1) 0%, rgba(114, 189, 245, 1) 100% );
--editor-gradient-purple: linear-gradient( 108.9deg, rgba(97, 229, 255, 1) 0%, rgba(255, 112, 245, 1) 100% );
--editor-gradient-pink: linear-gradient( 108.9deg, rgba(255, 102, 86, 1) 0%, rgba(255, 135, 178, 1) 100% );
--editor-gradient-orange: linear-gradient( 108.9deg, rgba(255, 130, 114, 1) 0%, rgba(255, 216, 125, 1) 100% );
--editor-gradient-gold: linear-gradient( 108.9deg, rgba(255, 224, 169, 1) 0%, rgba(213, 166, 56, 1) 100% );
```

⇒ ★ **两档同值的 `--editor-*` 只有 2 条**（`--editor-orange`／`--editor-brown`）⇒ 官方**刻意**不重指这两色；其余全部逐色重指（`--editor-bluedark` 从 `rgb(3 0 245/100%)` 跳到 `rgb(170 169 249/100%)`＝**深蓝→浅靛**）。
⇒ ★ **本地对照（本轮逐条比过，G1068）**＝light 侧 **10 条逐字等于官方 light**（`src/app/globals.css:143-152`，在 `:root`「Craft Design System — Light Theme」块内），**5 条渐变 light（`:153-157`）与 dark（`:310-314`）双双逐字一致**＝本轮最大面积的一致项；★ **但 `.dark` 里 `--editor-blueDark: rgb(3 0 245)` 与 `--editor-blueLight: rgb(41 98 246)` 照抄了 light 值**（官方暗档＝`rgb(170 169 249)`／`rgb(65 146 247)`）⇒ **暗色下这两档等于没换**；☆ 本地**缺 `--editor-text`**（只有 `:120` 注释提到）与 **`--editor-spectrum`**；☆ 命名差＝本地 camelCase（`blueDark`／`greyLight`）vs 官方全小写（`bluedark`／`greylight`）⇒ **CSS 变量大小写敏感**，按官方名写的消费方代码会取不到值。

**仍未采到（本节）**：其余 **12 份 CSS**（含只在 `/tasks`、`/calendar` 加载的 `TaskViews.css`）未落盘 ⇒ 本表只覆盖登录后的主 CSS 一份，**不能断言"官方只有这 9 段 token 块"**；`--heading-*-<档>-*` 排版 token 的**完整档位表**（本批只撞到 `xs-500` 一个消费点）；`[data-accent=…]` 六档强调主题块的逐字值（本批只到 `--accent-<色>` 基色层）；95 个哈希族里另外 **91 个**族未读；`:root` 裸块、`:root,.token-scope` 与 `[data-theme=light]` scale 块三者的**同名条目已实测逐字节相同**（重叠 48 条与 60 条，见 §四.末），但**层叠中谁胜出仍未做浏览器实测**（层序 base＜utilities＜components、且三者特异性同为 0,1,0 只是推断）；brand 档位序号在两档下反向的**实际消费点**未统计；`--shadow-*` 各档的实际消费点未统计；★ 以及"utilities 570 类"是否有别处以非 `.class` 形式扩展（未查 `@`规则内部）。
