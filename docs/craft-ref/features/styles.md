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
⇒ ☆ **`.text-<档>`／`.font-*`／`.leading-*`／`.tracking-*`／`.z-*` 全部零命中**（`.text-*` 只有 `center/left/right`）⇒ **排版不走工具类**，只能读 `--heading-*-<档>-{size,weight,line-height,letter-spacing}` 语义 token ＋ 组件哈希类（G1059）。〔✎ **第 108 批补正**＝本句"排版不走工具类"在**utilities 层**成立，但官方其实有一层**具名桥接类 `.typography-*`（31 个）**，它挂在 **`@layer base`** 而不是 utilities ⇒ 所以"没在 utilities 里找到排版类"是真的、"只能靠组件哈希类"是**错的**⇒ 完整四层（四族 token ＋ `.typography-*` 类 ＋ 组件哈希类）见 **§十五**，gap 行 **G1092**〕

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

**仍未采到（本节）**：~~其余 **12 份 CSS**（含只在 `/tasks`、`/calendar` 加载的 `TaskViews.css`）未落盘 ⇒ 本表只覆盖登录后的主 CSS 一份，**不能断言"官方只有这 9 段 token 块"**~~ ⇒ ✎ **第 106 批结案**（13/13 全落盘，逐份清点见 **§十三.一**；"第三套色阶"的怀疑被否＝其余 12 份里没有 `[data-theme]` 色阶表，见 §十三.六／§十三.七）；★ 同批**修正本节的"95 个哈希族"口径＝严格捕获组复扫是 84 个**（旧口径把 `_title_11co4_8` 这种"类名本身恰为 5 个小写字母数字＋后接数字"误当成族名，见 §十三.一 末）；`--heading-*-<档>-*` 排版 token 的**完整档位表**（本批只撞到 `xs-500` 一个消费点）；`[data-accent=…]` 六档强调主题块的逐字值（本批只到 `--accent-<色>` 基色层）；95 个哈希族里另外 **91 个**族未读（★ 按 84 的新口径＝另外 **81 个**未读）；`:root` 裸块、`:root,.token-scope` 与 `[data-theme=light]` scale 块三者的**同名条目已实测逐字节相同**（重叠 48 条与 60 条，见 §四.末），但**层叠中谁胜出仍未做浏览器实测**（层序 base＜utilities＜components、且三者特异性同为 0,1,0 只是推断）；brand 档位序号在两档下反向的**实际消费点**未统计；`--shadow-*` 各档的实际消费点未统计；★ 以及"utilities 570 类"是否有别处以非 `.class` 形式扩展（未查 `@`规则内部）。

## 十三、**名册结案＝13 份官方 CSS 全量清点（858,303 字符）＋ 集合表格 `--st-*` 接口逐字（21 条定义／7 档 z 阶梯／8 个只消费不定义的宿主变量）＋ KaTeX 跨版本类名不通（官方 368 条 vs 本地 369 条，仅 218 条同名）＋ 字体名单结案（21 个 family／429 个 `@font-face`／CJK 是 5 目录 15 源拼接）**（✓盘上 第 106 批 2026-09-30 14:3x–15:2x，**零写入批**＝无沙盒、无删除、无偏好改动，唯一浏览器动作是只读取回 12 份 CSS 并用完 `close()`；原始读数在 `gap.md` §三点一〇五六 G1069–G1078、`_harvest/b106-verify.txt`／`b106-verify2.txt`／`b106-census.json`；⚠ 本节**结掉 §十二 遗留的"其余 12 份 CSS 未落盘"**，并**把 §十二 的"95 个哈希族"口径改为 84**）

### 一、13 份逐份清点（★ 本轮改用"先剥 `/* */` 注释、再按大括号配平"的 parse＝注释会污染选择器串，`fontdef.common.css` 的 15 个伪选择器就是这么来的）

| 文件 | 字符 | 不同选择器 | 规则块 | `@font-face` | `unicode-range` | 哈希族 | 自定义属性（定义／不同名） | 归属 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `fontdef.m-plus-rounded-1c.css` | 308,022 | 0 | 0 | **354** | **354** | 0 | 0／0 | 日文圆体，★ 官方明确"不并进 common、单独注入" |
| `index.css.CP00jDAy.css` | 297,080 | **2,219** | 2,114 | 0 | 0 | **84** | **1,430／544** | 主包＝`@layer base`＋`utilities`＋`components` 三层（at 块 156） |
| `vendor-excalidraw.css.tkYuNB5W.css` | 163,877 | 1,200 | 1,155 | 4 | 0 | 0 | 406／212 | 白板 vendor 自带主题（见 §十三.六） |
| `vendor-code-editor.css.DkZwelau.css` | 29,193 | 368 | 229 | 20 | 0 | 0 | 0／0 | ★ **名不符实＝100% KaTeX 0.16.25**（见 §十三.二） |
| `BlankFont.css.CSdHt10-.css` | 25,567 | 0 | 0 | 1 | 0 | 0 | 0／0 | `AdobeBlank` 空白兜底（见 §十三.八） |
| `fontdef.common.css` | 25,401 | 0 | 0 | 45 | 45 | 0 | 0／0 | ★ CJK 15 个源拼接＋16 条来源注释（见 §十三.七） |
| `fontdef.roboto-mono.css` | 3,382 | 0 | 0 | 12 | 12 | 0 | 0／0 | 等宽＝6 区 × 2 style |
| `TaskViews.css.DghTjfLb.css` | 2,240 | 19 | 20 | 0 | 0 | **3** | 0／0 | ★ **13 份里唯一"按路由才加载"的 CSS**（见 §十三.四） |
| `fontdef.avenir-next-rounded.css` | 1,485 | 0 | 0 | 8 | 0 | 0 | 0／0 | 400/500/600/700 × normal+italic |
| `fontdef.untitled-serif.css` | 1,045 | 0 | 0 | 6 | 0 | 0 | 0／0 | 400/500/700 × 2 |
| `fontdef.source-serif.css` | 353 | 0 | 0 | 2 | 0 | 0 | 0／0 | variable `200 900` |
| `AIChatPopup.css.D9rwJ006.css` | 333 | 4 | 4 | 0 | 0 | **1** | 0／0 | AI chip 条（见 §十三.五） |
| `fontdef.inter.css` | 325 | 0 | 0 | 2 | 0 | 0 | 0／0 | variable `100 900` |
| **合计** | **858,303** | — | — | **454** | **411** | **88** | 1,836 条（index 1,430＋excalidraw 406） | ★ 第 105 批只落 `index.css` 一份＝297,080／858,303＝**34.6%** ⇒ 此前所有"全文件"结论的分母其实只有三分之一 |

⇒ ★ **`@font-face` 454 个的分解**＝429（7 份 `fontdef.*`）＋20（KaTeX）＋4（白板 `Assistant`）＋1（`AdobeBlank`）；`unicode-range` 411＝45＋354＋12（只有这三份分片，其余 10 个 family 不分片）。
⇒ ★ **哈希族 88 个的分解**＝index 84＋TaskViews 3＋AIChatPopup 1 ⇒ **CSS-Module 只出现在 Craft 自写的三份里**，两份 vendor 与十份字体包一个都没有。
⇒ ✎ **口径修正**＝§十二 记的"95 个哈希族"按严格捕获组（`._<类名>_<5 位小写字母数字>_<序号>`）复扫＝**84 个**；旧正则把 `_title_11co4_8` 这种"类名本身恰为 5 字符且后接数字"的串当成族名，多算 11 个。
⇒ ☆ **"第三套色阶"的怀疑被否**＝除 `index.css` 外，**没有任何一份带 `[data-theme=…]` 色阶块**（excalidraw 走自己的 `--color-*`，10 份字体包只有 `@font-face`）⇒ 历批"本目录只覆盖主 CSS"的限定语可以收窄为"主色阶表已全覆盖，组件层只覆盖了 84 族里的 3 族"。

### 二、`vendor-code-editor.css`＝KaTeX 0.16.25 原件，**零 Craft 覆写** ⇒ 官方代码块语法高亮不在这 13 份里

| 项 | 官方（本轮逐字） | 本地（本轮实扫） |
| --- | --- | --- |
| 版本自印 | `.katex-version:after{content:"0.16.25"}` | `node_modules/katex/dist/katex.min.css` 自印 `content:"0.18.7"`（`package.json:66` 锁 `^0.18.7`） |
| 选择器 | **368 条不同**（229 个规则块），其中**只有 1 条不是 `.katex` 作用域＝`body`** | **369 条不同**（230 个规则块） |
| 两向差集 | **官方独有 150／本地独有 151／同名只有 218** ⇒ 跨 0.16↔0.18 **类名体系整体换了前缀** | 逐字对照样本＝官方 `.katex .base`／`.strut`／`.rule`／`.sqrt>.root`／`.clap>.inner`／`.sizing.reset-size1.size1` ↔ 本地 `.katex .katex-base`／`.katex-strut`／`.katex-rule`／`.sqrt>.katex-root`／`.clap>.katex-inner`／`.katex-sizing.reset-size1.size1` |
| 字体 | **20 个 `@font-face`／12 个 `KaTeX_*` 族**＝AMS／Caligraphic／Fraktur／Main／Math／SansSerif／Script／Size1／Size2／Size3／Size4／Typewriter，**全部 `font-display:block`**，`src` 指向 `/static/KaTeX_AMS-Regular-BqhdFmY1.woff2` 形态的哈希名资源 | 同为 20 faces、同为 `font-display:block`（本地经 `import 'katex/dist/katex.min.css'` ⇒ **一致**，`src/app/layout.tsx:3`） |
| 语法高亮 | ★ **`.cm-*`（CodeMirror）在 13 份 CSS 里 0 命中**；`index.css` 里 code-ish 的类只有 `token-scope`（第 105 批 §十二.5 的子树作用域）与预览卡族的 `_code`／`_codePlaceholder` ⇒ **代码块着色要么走 JS 注入、要么在未落盘的 chunk 里** | 本地代码块＝TipTap 自写（`src/app/globals.css:417` 用 `--font-mono`），**无 token 类名体系＝没有语法高亮着色** |

⇒ ★ **可执行结论**＝**不要"照官方 CSS 抄数学样式"**：本地 0.18 的类名与官方 0.16 只有 218/368 重合，任何按官方选择器写的覆写都会静默失效。二选一＝① 把 `katex` 锁到 `0.16.x` 以复用官方那份 CSS；② 留在 0.18 但**只对视觉结果**（字号阶、`.katex-display` 行高、`.vlist` 上下标位移），并在文档里显式声明"不共享官方 CSS"＝有意偏差。本地已有 1 条自写覆写 `.crafty-math .katex-display`（`src/app/globals.css:1035`，压 KaTeX 自己的 line-height）＝属②路线。

### 三、★ 集合表格对外的主题接口＝`--st-*`：本文件定义 21 条、消费 28 个名字、其中 8 个只被消费不被定义（＝宿主注入）

**（a）21 条定义逐字**（全在 `index.css` 的 `_l4u28_`／`_1xjl6_`／`_z4j2j_` 三族附近）

| 变量 | 值（逐字） | 变量 | 值（逐字） |
| --- | --- | --- | --- |
| `--st-row-height` | `35px` | `--st-z-base-cell` | `1` |
| `--st-index-column-width` | `45px` | `--st-z-index-cell-header` | `2`（★ 全文件**无任何 `var()` 消费点**＝定义了没用） |
| `--st-cell-padding-x` | `10px` | `--st-z-sticky-index` | `3` |
| `--st-cell-padding-y` | `4px` | `--st-z-sticky-header` | `6` |
| `--st-border-radius` | `5px` | `--st-z-sticky-header-index` | `7` |
| `--st-max-height` | `560px` | `--st-z-interactive-overlay` | `10` |
| `--st-scroll-left` | `0px` | `--st-z-resize-preview` | `12` |
| `--st-card-title-line-height` | `21px` | `--st-text-color` | `initial`（宿主注入占位） |
| `--st-index-bg` | `var(--st-page-bg, #fff)` | `--st-page-bg` | `initial`（宿主注入占位） |
| `--st-index-bg-hover` | `var(--st-page-bg-hover-opaque, #f8f8f8)` | | |
| `--st-index-bg-selected` | `var(--st-selection-bg-opaque, rgb(194, 223, 255))` | | |
| `--st-index-bg-selected-hover` | `var(--st-selection-hover-bg-opaque, rgb(173, 212, 255))` | | |

**（b）7 档 z-index 阶梯（★ 冻结体系的唯一权威次序）**＝`base-cell 1` ＜ `index-cell-header 2` ＜ `sticky-index 3` ＜ `sticky-header 6` ＜ **`sticky-header-index 7`（左上角交点格）** ＜ `interactive-overlay 10` ＜ `resize-preview 12`。
⇒ ☆ 读法＝**交点格（7）高于表头（6）高于索引列（3）**，与第 105 批浮层栈的 `z` 无冲突（`interactive-overlay 10`／`resize-preview 12` 是"拖列宽时的预览线"与"单元格编辑器浮层"，压在一切表格内容之上）。

**（c）8 个"只消费不定义"的宿主注入名与其内置兜底**（＝表格组件对宿主的要求清单，兜底写死在 `var()` 第二参里）

| 宿主注入名 | 兜底值（逐字） | 语义 |
| --- | --- | --- |
| `--st-page-bg-hover-opaque` | `#f8f8f8` | 不透明页底（悬停） |
| `--st-selection-bg-opaque` | `rgb(194, 223, 255)` | 不透明选中底 |
| `--st-selection-hover-bg-opaque` | `rgb(173, 212, 255)` | 不透明选中悬停底 |
| `--st-border-color` | `var(--foreground-100)` | 网格线（回落主 app token） |
| `--st-selection-color` | `var(--accent-500)` | 选中描边（回落强调色） |
| `--st-accent-selection` | `none` | 表头激活条（默认关） |
| `--st-grid-columns` | `none` | 列模板（由 JS 逐实例算完再写回） |
| `--st-font-family` | `Inter, system-ui, sans-serif` | 表格字体（★ 兜底里点名 `Inter`） |

⇒ ★ **三条"opaque"变体是刻意的**＝主 app 的 `--base-*`／`--accent-*` 大多带 alpha，冻结单元格必须**遮住下方滚动的内容** ⇒ 表格另要一组**不透明**版本；这解释了为什么 `--st-index-bg-*` 全部 `var(--…, 十六进制)` 而不是直接引用主 token。
⇒ ★ **本地对照（本轮实扫）**＝`--st-` 前缀全库**零命中**；本地表格只有两处硬编码层级＝`src/app/(app)/collections/[id]/TableView.tsx:149` 的 `<thead className="sticky top-0 z-10">` 与 `:154` 的 `first:max-md:sticky first:max-md:left-0 first:max-md:z-20` ⇒ **方向一致（交点高于表头）但只有两档**，缺 `interactive-overlay`／`resize-preview`＝**本地没有列宽拖拽预览层**；单元格内距本地 `px-3 py-2`（12px／8px）vs 官方 10px／4px；行高本地未固定（全库无 `35px`／`rowHeight`）。

### 四、`TaskViews.css`＝13 份里唯一"按路由才加载"的一份（2,240 字符／20 条规则／19 个不同选择器／3 个族）

⇒ ★ 取证方式＝同一标签页在 `/all`（所有文档）屏拿到 128 个资产、点进侧栏「任务」后拿到 139 个资产，差集里只有这一份；⚠ **`/calendar` 屏未复验**（`title()` 本地超时，见 `todo-actions.md` 第 106 批日志）。

| 族 | 角色 | 逐字要点（本轮全量读，含每条规则所在的 at 层与断点） |
| --- | --- | --- |
| `_11co4_` | 任务页页头（**8 个不同选择器／9 条规则**＝`_heading._heading` 出现两次） | `_heading._heading{height:auto;flex-wrap:wrap;gap:8px;margin-bottom:16px}` → 宽屏覆写 `flex-wrap:nowrap`；`_title{display:flex;flex:1;align-items:center;min-width:0;min-height:36px}`＋`_title>h1{margin:0}` → 覆写 `min-height:48px`；`_tabs{order:1;flex:0 0 calc(100% + 32px);min-width:0;margin:-8px -16px;overflow-x:auto;scrollbar-width:none}`＋`_tabs::-webkit-scrollbar{display:none}` → 覆写 `order:0;flex:0 1 auto;margin:-8px`；`_tabsContent{display:flex;width:max-content;padding:8px 16px}` → `padding:8px`；`_settings{display:flex;flex-shrink:0}`＋`_settingsPlaceholder{visibility:hidden;pointer-events:none}`★ **覆写分布在两个不同断点里**＝`@media (width <= 747px){ _title{min-height:48px} }`（**窄屏抬高标题**）＋ `@media (width >= 748px){ @container web-shared-layout-main-wrapper (width >= 600px){ _heading._heading{flex-wrap:nowrap} ＋ _tabs{order:0;flex:0 1 auto;margin:-8px} ＋ _tabsContent{padding:8px} }`（**宽屏且容器够宽才把 tabs 提回第一行**）（★ 用等尺寸占位撑住宽度，避免切档时页头跳动） |
| `_ydla7_` | 任务视图卡片（**10 个不同选择器／7 条规则**） | `_card{position:relative;display:block;box-sizing:border-box;width:100%;height:11.25rem(180px);flex-shrink:0;margin:0;padding:0;border:none;border-radius:.9375rem(15px)}`；`_layer{position:absolute;top:0;right:0;bottom:0;left:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.75rem}`；`_iconSlot{display:flex;width:2.5rem;height:2.5rem;flex-shrink:0}`；★ **`_idle`／`_action` 两态互换**（见下）；焦点环 `[data-whatintent=keyboard] _card:focus{outline:1px solid var(--accent-500);outline-offset:-1px}` |
| `_fdch5_` | **框选矩形（1 条）** | ★（`@layer components` 顶层、无断点）`_rubberBand{position:fixed;background:var(--accent-100);border:1px solid var(--accent-500);border-radius:var(--radius-sm);pointer-events:none;z-index:10}` ⇒ **这是历批第一次在官方 CSS 里看到"拖框批选"的样式痕迹**；⚠ 本条**只有静态证据**，未做屏上验证 ⇒ 只能记成"官方声明了这个样式"，不能记成"官方任务视图支持框选"（→ 第 107 批队列①） |

⇒ ★ **"悬停换脸"逐字**（`_ydla7_` 族的四条组合规则）＝静止 `_idle, _action.isAlwaysVisible { opacity:1 }`；在 `[data-whatintent]:not([data-whatintent=touch])` 闸门下，`_card:hover _idle{opacity:0}` **且** `_card:hover _action{opacity:1}`；同一对规则**在 `[data-whatintent=keyboard] _card:focus` 下原样重复一遍** ⇒ **键盘聚焦与鼠标悬停共用同一套换脸**，而触摸档（`whatintent=touch`）整体被排除。
⇒ ★★★ **本节最大新发现＝官方用"具名容器查询"**＝`@container web-shared-layout-main-wrapper (width >= 600px)`，且**嵌在 `@media (width >= 748px)` 里面**（双层条件、不是替换）⇒ ① 主布局里存在一个名为 `web-shared-layout-main-wrapper` 的容器（侧栏折叠时**容器宽变、视口宽不变**，这才是页头要跟的量）；② 官方**同时使用视口断点与容器断点**，历批"侧栏展开/收起两档"的几何读数应理解为**容器宽度变化**；③ 本地若只写 `@media`，在"视口宽但侧栏展开（容器窄）"这一档会走错分支。⇒ ✎ **声明处已在本批落盘时补检索到**（初稿写"未检索到"是**没跑检索**，就地作废）＝`index.css` @134,582 逐字 `._mainWrapper_6sjpd_20{display:flex;flex-direction:column;height:100%;container-type:inline-size;container-name:web-shared-layout-main-wrapper}`；★ **全 13 份 `@container` 共 6 处、逐字清单见 §十三.九**（其中 4 处匿名 ⇒ 官方列表视图的**列显隐按内容区宽度**分档）。
⇒ ☆ 读法＝**不是"叠加显示"而是"两个图层互换"**：常驻信息淡出、动作件淡入，卡面高度不变（靠 `_layer{inset:0}` 绝对定位）。这与第 105 批 §十二.9 的"`_1bml7_` 按钮族 0 条 `:active`"是同一种取向＝官方把反馈放在**换脸与闸门**上，而不是按压缩放。

### 五、`AIChatPopup.css`＝13 份里最小的一份（333 字符／4 条规则／1 个族 `_apokp_`）

| 选择器 | 逐字 |
| --- | --- |
| `._scrollRoot_apokp_1` | `max-width:100%;margin-top:-8px;margin-bottom:-8px` |
| `._scrollViewport_apokp_7` | `padding-top:8px;padding-bottom:8px;scrollbar-width:none` |
| `._scrollViewport_apokp_7::-webkit-scrollbar` | `display:none` |
| `._scrollContent_apokp_19` | `display:inline-flex;gap:8px;min-width:fit-content!important;flex-direction:row` |

⇒ ☆ **负 margin ＋ 等量 padding**＝"内容贴边但焦点环不被裁"的成对写法（与第 105 批浮层壳 `--fadeout-padding-top` 同一族思路）；★ **AI 快捷动作条的本体是"横向滚动 chip 容器"**，其余样式全在 `index.css` ⇒ 说明这份 CSS 是"滚动容器补丁"而不是"AI 面板样式表"。
⇒ 本地对照＝`src/components/editor/bubble-menu/AiBubbleMenu.tsx` 存在，本轮**未读其溢出与滚动实现** ⇒ 不判定，进第 107 批队列。

### 六、白板＝**独立 vendor 主题体系**，与主 app 不共用一个 token（163,877 字符／1,200 个不同选择器／1,155 条规则）

| 项 | 官方逐字（本轮） |
| --- | --- |
| 变量总量 | 自定义属性 **406 条定义／212 个不同名**，其中 **`--color-*` 108 条定义／67 个不同名** |
| 主色族 | `--color-primary: #6965db`｜`--color-primary-darker: #5b57d1`｜`--color-primary-darkest: #4a47b1`｜`--color-primary-hover: #5753d0`｜`--color-primary-light: #e3e2fe`｜`--color-primary-light-darker: #d7d5ff`｜`--color-selection: #6965db` |
| 灰阶族 | `--color-gray-10 #f5f5f5`→`-20 #ebebeb`→`-30 #d6d6d6`→`-40 #b8b8b8`→`-50 #999999`→`-60 #7a7a7a`→`-70 #5c5c5c`→`-80 #3d3d3d`→`-85 #242424`→`-90 #1e1e1e`→`-100 #121212`（★ 11 档，**含 `-85`**，与主 app 的 20/18 档色阶完全不同族） |
| 表面族 | `--color-surface-high #f1f0ff`／`-mid #f6f6f9`／`-low #ececf4`／`-lowest #ffffff`／`--color-on-surface #1b1b1f`／`--color-surface-primary-container #e0dfff`／`--color-on-primary-container #030064` |
| 语义族 | `--color-danger #db6965`（＝**primary 的 RGB 反转**）／`-dark #db6965`（与基色同值）／`-darker #d65550`／`-darkest #d1413c`；`--color-warning #fceeca`／`-dark #f5c354`／`-darker #f3ab2c`／`-darkest #ec8b14`；`--color-success #cafccc`／`-darker #bafabc`／`-darkest #a5eba8`／`-text #268029`／`-contrast #65bb6a`／`-contrast-hover #6bcf70`／`-contrast-active #6edf74`；`--color-badge #0b6513` |
| 暗色机制 | ★★★ **整份文件 `[data-theme]` 0 处、`prefers-color-scheme` 0 处** ⇒ 白板暗色**不是 CSS 双档，而是运行时 JS 覆写 `--color-*`** |
| 断点 | 25 条 `@media`（`min-width:1921px`／`max-width:379px`／`orientation:landscape`／`min-width:861px`／`max-width:861px`／`max-width:450px`）＝白板自带超宽屏与手机横屏档 |
| 字体 | ★ **4 个 `@font-face` 全是 `Assistant`（400/500/600/700），且描述符写错**＝逐字 `style:normal`／`display:swap`（正确应为 `font-style`／`font-display`）⇒ **官方这份 `font-display:swap` 从未生效**＝vendor 缺陷；`--ui-font: Assistant, system-ui, BlinkMacSystemFont, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif` |

⇒ ★ **要记住的两条**＝① **白板主色是紫 `#6965db`，主 app 强调蓝是 `--accent-blue: 46 109 233`** ⇒ 同产品两套品牌色，跨面复刻时不能互相代入；② **暗色靠 JS 覆写变量**是官方（实为 excalidraw）的真实机制，与 §十二.3 主 app 的"三段逐色重指"是**两条不同的暗档通路**。
⇒ 本地对照＝白板走 **tldraw**（`package.json:78 tldraw ^5.4.2`＋`@tldraw/sync`，同步服务 `src/collab/tldraw-server.mjs`）⇒ **库不同＝有意偏差**（原因：许可与协同已按 tldraw 落地，不重做）；但"暗色靠 JS 覆写 CSS 变量"这一条本地是否做到，需下一批实扫 `src/components/whiteboard/`。

### 七、字体名单结案＝**21 个 family／429 个 `@font-face`／5 个语言目录 15 个源**

| 文件 | family（逐字） | faces | `font-weight` | `font-style` | `unicode-range` | 备注（逐字来源） |
| --- | --- | --- | --- | --- | --- | --- |
| `fontdef.inter.css` | `Inter` | 2 | **`100 900`（variable）** | normal, italic | 无 | ★ 整份 325 字符，两 face 各 5 行、**未压缩**；`font-display:swap`；`src:url("inter-variable.woff2") format("woff2")` |
| `fontdef.source-serif.css` | `Source Serif` | 2 | `200 900`（variable） | normal, italic | 无 | 353 字符 |
| `fontdef.avenir-next-rounded.css` | `Avenir Next Rounded` | 8 | 400／500／600／700 | normal, italic | 无 | `avenir-next-rounded-regular.woff2` 等 8 个静态 face |
| `fontdef.untitled-serif.css` | `Untitled Serif` | 6 | 400／500／700 | normal, italic | 无 | `untitled-serif-regular.woff2` 等 |
| `fontdef.roboto-mono.css` | `Roboto Mono` | 12 | `100 700`（variable） | normal, italic | **12 片** | ★ 6 区 × 2 style，**同一区的 normal 与 italic `unicode-range` 逐字相同**＝`cyrillic-ext: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F`／`cyrillic: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116`／`greek: U+0370-03FF`／`latin-ext: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF`／`latin: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD`／`vietnamese: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB`；文件名自带区名（`roboto-mono-cyrillic-ext-wght-normal.woff2`） |
| `fontdef.common.css` | **15 个 CJK family**＝`Noto Sans Mono JP`／`Pretendard JP`／`Source Han Serif JP`／`Jetendard`／`Nanum Square Round`／`Pretendard`／`Source Han Serif KR`／`Noto Sans Mono SC`／`Resource Han Rounded SC`／`Noto Sans SC`／`Source Han Serif SC`／`Noto Sans Mono TC`／`Resource Han Rounded TC`／`Noto Sans TC`／`Source Han Serif TC` | 45 | `100 900`／`200 900`／`100,200,300,400` 混用 | normal, italic | **45 片** | ★★★ 文件头注释逐字＝`Generated by scripts/build_cjk_common_css.py. DO NOT EDIT.`＋`Concatenation of every CJK language-pack fontdef.css except _japanese/rounded/m-plus-rounded-1c, which is injected as its own stylesheet.`＋**15 行 `Sources:`** 路径清单（`_japanese/{mono,sans,serif}`／`_korean/{mono,rounded,sans,serif}`／`_simplified-chinese/{mono,rounded,sans,serif}`／`_traditional-chinese/{mono,rounded,sans,serif}`）⇒ **语言目录 × 类别 = 构建真源** |
| `fontdef.m-plus-rounded-1c.css` | `M PLUS Rounded 1c` | **354** | 400／500／700 | normal | **354 片** | ★ 308,022 字符＝**13 份里最大**，且**完全没有压缩**（`@font-face {\n  font-family: 'M PLUS Rounded 1c';`）；分片粒度是**逐码点枚举**（首片 `U+25ee8, U+25f23, U+25f5c, …` 全在 CJK 扩展 B 区），末片回到 `U+20, U+2027, U+3001-3002, U+3041-307F, U+3081-308F, …`＝假名＋标点＋拉丁空格 ⇒ **按字形出现频率切片**，非常规 6 区 |

⇒ ★★ **官方"支持中文"的实现口径**＝**4 个区域（`_simplified-chinese`／`_traditional-chinese`／`_korean`／`_japanese`）× 每区 3–4 个类别（sans／serif／mono／rounded）× 独立 `unicode-range`**，共 15 个 family，**不是一个"中文字体"**；日文圆体因为分片太多（354）被单独成文件、不并入 common。
⇒ ★ **两种加载策略**＝数学字体 **20 faces 全部 `font-display:block`**（宁可留白等字体，也不要替代字形闪一下）vs UI 与 CJK 字体 **`font-display:swap`**。
⇒ 本地对照（本轮实扫）＝**本地只有官方 21 个 family 里的 1 个**＝`Inter({ variable:'--font-sans', subsets:['latin'] })`（`src/app/layout.tsx:8-11`）⇒ **latin 单区、零 CJK 分片**；中文落哪个字体取决于用户机器（`src/app/globals.css:14` 的 `--font-serif` 里写了 `Georgia, 'Noto Serif SC', 'Songti SC'` 这类系统栈名）。☆ 本地 `--font-sans` 在 `@theme inline` 中自指（`:10`）＝**Tailwind v4 的正确写法**（引用 `next/font` 注入的运行时变量），本轮核实后**不登记为缺陷**。

### 八、`BlankFont.css`＝AdobeBlank 空白兜底（1 face，CSS 层零引用）

⇒ 逐字＝整份 **25,567 字符里 99% 是 base64**：`@font-face{font-family:AdobeBlank;src:url(data:font/opentype;base64,T1RUTwAKAIAAAwAgQ0ZG…==)}` ⇒ **无 `format()`、无 `font-display`、无 `unicode-range`、无 `font-weight`**。
⇒ ★ 作用＝Adobe 系的**不可见字体**：字形缺失时显示为**空白**而不是豆腐块／系统替代字形。⇒ **`index.css` 里 `AdobeBlank` 0 处引用** ⇒ 消费点在 JS（按字体栈注入），本批未证。
⇒ 本地＝**无 AdobeBlank、无 base64 字体、无 `size-adjust`**（grep 零命中）⇒ 缺字形时本地走系统 last-resort。

### 九、★★★ 官方有**两套断点体系**＝`@container` 具名容器查询（★ 本批落盘时补做全库检索才找到，逐字 6 处）

⇒ **声明处（全库唯一 1 处 `container-type`）逐字**＝`index.css` @134,582 逐字 `._mainWrapper_6sjpd_20{display:flex;flex-direction:column;height:100%;container-type:inline-size;container-name:web-shared-layout-main-wrapper}`（同一族还有 `._scrollRoot_6sjpd_28{flex:1;min-height:0}`，上游一个 `max-width:1280px`）⇒ **主内容区自己就是一个 inline-size 容器，名字等于它的角色**（web-shared-layout-main-wrapper）。

| # | `@container` 查询（逐字） | 所在族 | 效果 |
| --- | --- | --- | --- |
| 1 | `@container web-shared-layout-main-wrapper (width < 452px)` | `_6sjpd_`（浏览屏文档网格） | `._docGrid_6sjpd_59{gap:8px;…}`＝**具名窄容器里网格间距收到 8px** |
| 2 | `@container (width >= 768px)` | `_1m9yz_`（列表视图） | `._divider_1m9yz_56{left:14px;right:16px}` |
| 3 | `@container (width >= 768px)` | `_1m9yz_` | `._listRow_1m9yz_142{padding:12px 16px 12px 14px}` |
| 4 | `@container (width >= 768px)` | `_1m9yz_` | `._colUpdated_1m9yz_212,._colCreated_1m9yz_216{display:flex}`＝**"更新／创建"两列出现** |
| 5 | `@container (width >= 1024px)` | `_1m9yz_` | `._colLastViewed_1m9yz_208{display:flex}`＝**"最后查看"列出现** |
| 6 | `@container web-shared-layout-main-wrapper (width >= 600px)` | `TaskViews.css` 的 `_11co4_` | 页头三条覆写（`flex-wrap:nowrap`＋`_tabs{order:0}`＋`_tabsContent{padding:8px}`），且**外面还包着 `@media (width >= 748px)`＝合取** |

⇒ ★★★ **读法**＝① 6 处里只有 2 处具名、**4 处匿名**（匿名＝沿最近祖先容器，也就是 `_mainWrapper`）；② **列表视图的列数完全由"内容区有多宽"决定**（768／1024 两档三列），这与第 105 批的"表格 `--st-*`"是同一族的响应式策略；③ 官方**同时保留视口断点**（`@media (width <= 747px)` 与 `(width >= 748px)`），两套是**分工不是替代**＝视口档管"移动端 vs 桌面"，容器档管"内容区宽窄／侧栏折叠"。
⇒ ☆ **本目录历批把"侧栏展开／收起两档"当视口量是归因错位**（第 96／97 批的几何读数）⇒ ⚠ **仍未屏上复验**，列第 107 批队列②。
⇒ 本地对照（本轮实扫）＝全库检索 `@container｜container-type｜container-name`（`src/` 三扩展名 css／tsx／ts）**只有 1 处**＝`src/components/ui/card.tsx:27`（Tailwind `@container/card-header`，卡片内部自用）⇒ **主布局零容器**、表格与列表全走 `md:`／`max-md:` 视口断点（`TableView.tsx:154`）⇒ 缺失（机制）＋ 行为不同（列分档参考系），登记 **G1079**。

### 十、本节与本地的总结对照

| 项 | 官方（本批） | 本地（本轮实扫） | 判定 |
| --- | --- | --- | --- |
| CSS 份数 | 13 份／858,303 字符，1 份按路由分包 | 1 份自写 `src/app/globals.css`（36,308）＋ KaTeX 原件 ＋ Tailwind 运行时 | 有意偏差（构建与分包机制不同） |
| 数学排版 | KaTeX 0.16.25，368 条无前缀类名 | KaTeX 0.18.7，369 条带 `katex-` 前缀，同名仅 218 | 行为不同（跨版本不通） |
| 代码块高亮 | 不在这 13 份里（`.cm-*` 0 命中） | 无 token 类名体系＝无着色 | 缺失 |
| 字体 | 21 family／429 faces／CJK 四区 15 族 | 1 family／latin 单区 | 缺失＋有意偏差（不随包分发字体＝许可与包体） |
| 缺字形兜底 | `AdobeBlank` | 系统 last-resort | 缺失 |
| 表格接口 | `--st-*` 21 定义／7 档 z／8 宿主注入 | 两档硬编码 `z-10`／`z-20`，内距 12/8px | 缺失＋行为不同 |
| 白板主题 | 67 个 `--color-*`、暗色靠 JS 覆写、主色紫 | tldraw（不同库） | 有意偏差（附原因＝库与协同已定） |
| 框选 | `_fdch5__rubberBand` 样式存在 | 全库 `rubber`／`box-select` 零命中 | **待验证**（只有静态证据） |

**仍未采到（本节）**：★ 容器查询的**屏上行为**未验（折叠侧栏时 `_mainWrapper` 宽度是否真的跨过 768／1024）；★ **`/calendar` 屏的资产并集未复验**（`title()` 本地超时）⇒ 名义上"13 份"只对 `/all`＋`/tasks` 两屏负责，**不能排除第 14 份**；84 个哈希族里 **81 个**未逐条读；官方代码块语法高亮的真身（JS 注入 vs 未落盘 chunk）未取证；`AdobeBlank` 与 `--st-*` 宿主注入的**JS 侧写入点**未反编译；`_fdch5__rubberBand` 的触发处（哪种视图、什么手势）未屏上验证；KaTeX 0.16↔0.18 的 150／151 条差集**未逐条列**（本轮只给计数与 20 条样本）；白板暗色在本地 tldraw 下的实现未读（`src/components/whiteboard/` 本轮未开）；`--st-*` 的 8 个宿主名在官方是由谁注入（组件 props？`style` 属性？）未证。


## 十四、**token 层增量两表＝`--heading-*` 30 条逐字全表（三档 × 两权重 × 四属性 ＋ 两个 allcaps 变体）＋ 强调色六套的 light／dark 12 个基色三元组与"每套 19 条别名转发"结构（★★ 并给出"暗档只重指上段 8 档"的机制解释）**（✓盘上 第 107 批 2026-09-30 15:4x–16:0x，零浏览器＝已落盘 `index.css` ＋ `_harvest/js/` 缓存 chunk 的定点读；原始读数在 `gap.md` §三点一〇五七 G1089／G1090，机读结果 `_harvest/b107-probe3.txt`／`b107-probe4.txt`；★ 本节**结掉 §十二 遗留的两条**＝「`--heading-*` 完整档位表」与「`[data-accent=…]` 六档逐字值」；⚠ 同时**修正 §十三.八 对 `AdobeBlank` 的作用判定**）

### 一、`--heading-*` 排版语义 token＝**恰好 30 条，且 30 条全部有 `var()` 消费点**（⇒ 没有死 token）

⇒ 命名法＝`--heading-<档位>-<权重>[-allcaps]-<属性>`，档位只有 **`xxs｜xs｜md` 三档**、权重只有 **`500｜600` 两档**、属性四件＝`size｜weight｜line-height｜letter-spacing`，另有 **两个 `allcaps` 变体**各多一条 `-transform: uppercase`。

| 组 | `size` | `weight` | `line-height` | `letter-spacing` | `transform` |
| --- | --- | --- | --- | --- | --- |
| `xxs-600` | `11px` | `600` | `12px` | `.05px` | — |
| `xxs-600-allcaps` | `11px` | `600` | `12px` | `.05px` | `uppercase` |
| `xs-500` | `12px` | `500` | `12px` | `.01px` | — |
| `xs-600` | `12px` | `600` | `12px` | `.05px` | — |
| `xs-600-allcaps` | `12px` | `600` | `12px` | **`.15px`** | `uppercase` |
| `md-500` | `14px` | `500` | `16px` | `-.09px` | — |
| `md-600` | `14px` | `600` | `16px` | `-.09px` | — |

⇒ ★★★ **表里唯一一处"变体改动非 transform 的量"＝全大写把 letter-spacing 从 `.05px` 提到 `.15px`** ⇒ 官方的排版 token **不是纯样式别名，而是带光学修正的一层**（本地若只做 `text-transform` 别名会丢这条修正）。
⇒ ★ **`md` 两档只差 weight**（size／line-height／letter-spacing 三项逐字相同）⇒ 600 与 500 在 `md` 上是**同一字号的两级粗细**；而 `xs` 的 500 与 600 差的是 letter-spacing（`.01px` vs `.05px`）。
⇒ ☆ **档位只有三档**（xxs／xs／md）⇒ 这套 token 服务的是**界面小标题／标签／分区标题**，不是正文排版阶（正文阶在 `styles.md §一` 的具名样式表里，两者不同层）。
⇒ 本地对照（本轮实扫）＝`src/app/globals.css` 里 `heading` 一词只出现 2 次、**无任何 `--heading-*` token**（承 G1059／G1089）。

### 二、★★★ 强调色六套主题＝**12 个基色三元组逐字 ＋ 每个主题块恰好 19 条"别名转发"、块内零具体颜色**

| `[data-accent=…]` | light 基色 | dark 基色 | 提亮幅度（肉眼档） |
| --- | --- | --- | --- |
| `blue` | `46 109 233` | `113 178 255` | 中 |
| `pink` | `214 23 155` | `255 106 209` | 大 |
| `green` | `0 194 166` | `77 255 221` | 大（且青化） |
| `purple` | `94 2 210` | `191 139 255` | 大 |
| `yellow` | `228 192 17` | `255 233 123` | ★ 最大（几乎只提亮度、不改色相） |
| `gray` | `82 92 102` | `188 194 201` | 大（近反色） |

⇒ ★ **主题块结构逐字**（以 `blue` 为例，六套完全同构）＝19 条 ＝ `--accent: var(--accent-blue)` ＋ `--accent-{50,100,150,200,250,300,350,400,450,500,550,600,650,700,750,800,850,900}: var(--accent-blue-<同档>)` ⇒ **切换强调色 = 整体重指 19 个别名，块内一个颜色值都不出现**（与第 100 批 §十一.二 的"六档 × 18 条别名"读数一致，本批补齐为 **19 条含 `--accent` 本体**）。
⇒ ★★★ **暗档为什么只需重指 8 档＝机制结案**（补强 §十二.3 的"三段逐色重指 38＋116＋56"）＝下段 `-50…-500` 全部写成派生式 `rgb(var(--accent-<色>) / 6%｜12%｜18%｜24%｜32%｜40%｜55%｜70%｜85%｜100%)` ⇒ **基色一改，整段自动跟随**；上段 `-550…-900` 是**字面 rgb**（逐字样本：`--accent-pink-550: rgb(199 23 145 / 100%)`、`--accent-pink-700: rgb(158 24 118 / 100%)`、`--accent-pink-900: rgb(101 26 80 / 100%)`）⇒ **必须逐档重写**。实测各主题块的引用数＝**light 侧 18 条、dark 侧各 8 条**。
⇒ ☆ 全文件 `[data-accent=…]` 出现 **12 次**＝六色 × 两处（同一族被重复输出两遍，与 §四十四.三 的"同一份色阶在三个选择器下各写一遍"同形＝构建产物特征，不是设计）。
⇒ ★ **六套主题不重指对比色**＝`--accent-contrast`（值 `255 255 255`）与 `--accent-contrast-900` 在任何 `[data-accent=…]` 块内**都不出现**（本轮实测引用数 0）⇒ **无论选哪套强调色，字上底色永远是白**（含 `yellow` 这种亮黄＝对比度是官方自己的取舍，不复刻时不要自作聪明改成黑字）。
⇒ ★★ **本地对照（本轮实扫，含一条陷阱）**＝本地 `src/app/globals.css` 里 `--accent` 有值但**语义完全不同**＝`:81-82` 是 shadcn 的中性强调对（`oklch(0.97 0 0)` ／ `oklch(0.205 0 0)`）、`:247` 是暗档 `oklch(0.3 0 0)`，而本地真正的品牌强调色叫 **`--craft-accent`**（`:127` light `oklch(0.5668 0.199 262)`、`:284` dark `oklch(0.72 0.15 250)`，另各带一条 `-hover`）⇒ ★★★ **同名不同义**：照官方 `--accent-N` 的写法在本地会取到近白／近灰的中性色而不是蓝 ⇒ 六套主题与 18 档别名本地全无（缺失，G1090），且**迁移时变量必须改名或加映射表**。

### 三、⚠ 对 §十三.八 的就地修正

⇒ 第 106 批把 `BlankFont.css` 里的 `AdobeBlank` 判成**渲染兜底字体**（"缺字形时显示空白而不是豆腐块"），并据此建议本地"把空白字体挂到字体栈末位"。⇒ ★ **该判定作废**＝本批读到 JS 侧调用体：`document.fonts.load("1rem AdobeBlank", …)` ＋ 一个 `0×0` canvas ＋ `ctx.font = '1em "Apple Color Emoji", "Android Emoji", "Segoe UI Emoji", AdobeBlank'` ＋ **`measureText(char).width !== 0` 过滤** ⇒ 它是**字形缺失探测器**（挑出"整条兜底栈都没有字形"的字符），不是样式表里的兜底字体 ⇒ 逐字与判定见 `gap.md` **G1084**，机制解释见 `internals.md §四十六.四`。
⇒ ☆ §十三.八 其余三条读数不变（25,567 字符／99% base64／CSS 层 0 引用；无 `format()`／`font-display`／`unicode-range`）。

**仍未采到（本节）**：`--heading-*` 三档在界面上的**实际消费点分布**（哪个组件用 `md-600`、哪个用 `xxs-600`）未统计，需要读 styled 表或全 DOM 扫描；★★ **同族检索已做完＝`--heading-*` 是官方唯一的语义排版 token 族**（`--body-`／`--caption-`／`--label-`／`--text-`／`--font-size`／`--title-`／`--paragraph` 七种前缀的定义数**全为 0**）⇒ 其余排版量必然写在具名样式或工具类里；六套强调色上段 `-550…-900` 的**字面 rgb 只抄了 pink 的 3 条样本**，其余五套 × 8 档未逐条抄（⇒ 已进第 108 批队列）；☆ `allcaps` 只有两处（`xxs-600-allcaps`／`xs-600-allcaps`）＝本轮按 30 条全集穷举过，**md 档没有 allcaps 变体**；★ 强调色的**屏上验证**（切档后是否真按预期提亮）仍为零——本批连一次浏览器调用都没有。

## 十五、**排版层结案＝四族 token 的完整族结构（`--ui-*` 60／`--caption-*` 16／`--body-*` 22，`--heading-*` 30 已在 §十四）＋ 31 个 `.typography-*` 桥接类逐字（每类固定六件套声明）＋ 强调色上段 96 个值（六套 × 8 档 × 两档，★★ 亮档逐档变深、暗档逐档变浅）＝本目录第一次拿到"官方排版怎么落地"的完整一环**（✓盘上 第 108 批 2026-09-30 16:1x–16:5x，零浏览器写屏＝已落盘 `index.css` ＋ `_harvest/js/` 缓存 chunk 的定点读，另加 8 次只读屏上读数；原始读数 `gap.md` §三点一〇五八 G1092／G1097／G1098，机读结果 `_harvest/b108-probe10.txt`～`b108-probe17.txt`；★ 本节**结掉 §十二.六 的"排版不走工具类"口径**（已就地 ✎）与 §十四「仍未采到」的「`--heading-*` 消费点」；⚠ 同时给出**一条官方不自洽候选**（§十五.四））

### 一、四族 token 的族结构（逐字清点，源＝`index.css`）

| 族 | token 数 | 档位组合（逐字） | 每档属性数 | 备注 |
| --- | --- | --- | --- | --- |
| `--ui-*` | **60** | `xs-500｜sm-400｜sm-500｜md-400｜md-500｜md-600｜lg-400｜lg-500｜lg-600｜xl-400｜xl-500｜xl-600｜xxl-400｜xxl-500｜xxl-600` | 4（size／weight／line-height／letter-spacing） | ★ **同一 size 的三档只有 `weight` 变、其余三条完全相同**（15 组合逐字核过）＝"权重不改变度量" |
| `--heading-*` | **30** | `xxs-600｜xs-500｜xs-600｜md-500｜md-600` ＋ 两个 `allcaps` 变体 | 4（allcaps 多一条 `transform`） | 逐字值表见 **§十四.一**；★ **只有 5 档、没有 `lg`／`xl`** |
| `--caption-*` | **16** | `md-400｜md-500｜lg-400｜lg-500` | 4 | ⚠ 400 与 500 的 `line-height`／`letter-spacing` 互反，见 §四 |
| `--body-*` | **22** | `md-400｜md-500｜md-600` ＋ `md-400-italic｜md-500-italic` | 4（italic 变体 5，多一条 `-style`） | ★ **body 只有 `md` 一档 size**（正文没有尺寸档，只有权重档） |

⇒ ☆ 四族合计 **128 个不同 token 名**（60＋30＋16＋22）；⇒ ★ **每个 token 在文件里出现两次是常态**（`:root` 与 `[data-theme=…]` 块各写一遍；`--heading-*` 的"60 处声明／30 个不同名"与 §十四 一致）。

### 二、`.typography-*` 31 个桥接类（逐字名册 ＋ 声明体）

⇒ **名册（31 个，按 `ui → heading → caption → body` 序）**＝`ui-xs-500`、`ui-sm-400`、`ui-sm-500`、`ui-md-400`、`ui-md-500`、`ui-md-600`、`ui-lg-400`、`ui-lg-500`、`ui-lg-600`、`ui-xl-400`、`ui-xl-500`、`ui-xl-600`、`ui-xxl-400`、`ui-xxl-500`、`ui-xxl-600`（15 个）＋ `heading-xxs-600`、`heading-xxs-600-allcaps`、`heading-xs-500`、`heading-xs-600`、`heading-xs-600-allcaps`、`heading-md-500`、`heading-md-600`（7 个）＋ `caption-md-400`、`caption-md-500`、`caption-lg-400`、`caption-lg-500`（4 个）＋ `body-md-400`、`body-md-400-italic`、`body-md-500`、`body-md-500-italic`、`body-md-600`（5 个）。
⇒ **声明体六件套逐字**（`typography-ui-md-500` 为样本，全部 31 个同构）＝`font-family:var(--font-family)` ＋ `-webkit-font-smoothing:antialiased` ＋ `font-variant-numeric:lining-nums` ＋ `font-feature-settings:"lnum" 1,"calt" 1` ＋ `font-size:var(--ui-md-500-size)` ＋ `font-weight:var(--ui-md-500-weight)` ＋ `line-height:var(--ui-md-500-line-height)` ＋ `letter-spacing:var(--ui-md-500-letter-spacing)`；⇒ ☆ italic 变体多一条 `font-style:var(--body-md-400-italic-style)`；allcaps 变体多一条 `text-transform:var(--heading-xxs-600-allcaps-transform)`。
⇒ ★★★ **这 31 个类全在 `@layer base` 里**（第一个类起点 @14,975，紧接在 normalize.css 与 CJK `--cjk-*` 变量之后）⇒ ☆ 读法＝**官方把"排版类"当基础层、把"组件哈希类"当组件层**；组件里 `class="… _card_ydla7_1 typography-ui-md-500"`（★ 本批屏上实测读到的 `class` 属性就是这种**同一元素上并存"组件类＋排版类"**的形状，见 `interactions.md V102` 第 5 条）⇒ ⇒ **`--font-family` 是排版类唯一的字体入口**（换字体＝改一个变量，不换类）。
⇒ ☆ `font-variant-numeric:lining-nums` ＋ `"lnum" 1,"calt" 1` 是**全 31 个类共有**的＝官方刻意让数字用等高老式数字并开连字（本地零对应）。

### 三、★★★ 强调色上段 `-550…-900` 逐字 96 个值（六套 × 8 档 × 两档；★ 两档方向相反）

⇒ 亮档（源＝`:root` 块 @69,357 起，与 `[data-theme=light]` 块 @287,638 起**逐字节相同**）＝

| 档 | blue | pink | green | purple | yellow | gray |
| --- | --- | --- | --- | --- | --- | --- |
| `-550` | `44 103 217` | `199 23 145` | `2 181 155` | `89 4 196` | `212 179 18` | `78 87 96` |
| `-600` | `43 97 203` | `186 24 136` | `4 169 146` | `84 6 183` | `198 168 19` | `74 82 91` |
| `-650` | `42 91 188` | `173 24 128` | `6 158 136` | `79 8 170` | `184 156 20` | `70 78 86` |
| `-700` | `40 85 172` | `158 24 118` | `8 145 125` | `74 10 156` | `168 143 21` | `65 73 81` |
| `-750` | `38 78 156` | `142 25 107` | `10 131 114` | `68 12 142` | `151 130 22` | `61 68 75` |
| `-800` | `37 72 141` | `129 25 99` | `12 119 105` | `63 14 129` | `137 118 23` | `57 63 70` |
| `-850` | `36 67 127` | `116 26 90` | `14 107 95` | `59 16 116` | `123 106 24` | `53 59 64` |
| `-900` | `34 60 111` | `101 26 80` | `16 94 84` | `53 18 102` | `107 94 25` | `48 54 59` |

⇒ 暗档（源＝`[data-theme=dark]` 块 @78,234 起）＝

| 档 | blue | pink | green | purple | yellow | gray |
| --- | --- | --- | --- | --- | --- | --- |
| `-550` | `124 184 255` | `255 117 212` | `90 255 223` | `196 148 255` | `255 234 133` | `193 198 205` |
| `-600` | `133 189 254` | `254 127 215` | `103 254 225` | `200 155 254` | `254 235 142` | `197 202 208` |
| `-650` | `143 194 254` | `254 137 218` | `115 254 227` | `204 163 254` | `254 237 151` | `201 206 212` |
| `-700` | `154 199 253` | `253 149 221` | `128 253 229` | `208 172 253` | `253 238 161` | `206 210 215` |
| `-750` | `165 205 253` | `253 160 224` | `142 253 232` | `213 181 253` | `253 239 171` | `211 215 219` |
| `-800` | `174 210 252` | `252 170 227` | `155 252 234` | `217 189 252` | `252 240 180` | `216 219 223` |
| `-850` | `184 215 252` | `252 181 230` | `167 252 236` | `221 196 252` | `252 241 189` | `220 223 226` |
| `-900` | `195 221 251` | `251 192 233` | `180 251 238` | `226 205 251` | `251 243 199` | `225 227 230` |

⇒ ★★★ **档位序号在两档下表示"更深 vs 更浅"的反向语义**＝亮档 `-550→-900` 逐档**变深**、暗档同区间逐档**变浅** ⇒ 与第 105 批 brand 七族"整条反向"（§十二.十三）同形；⇒ ★ **把官方任一 `-N` 抄成常量必在暗档失效**（G1097 的本地建议＝两套一起抄、走 CSS 变量切换）；⇒ ☆ 每条都是 `rgb(… / 100%)` 的不透明写法（**上段没有 alpha**，与下段 `rgb(var(--基) / P%)` 相对，承 G1009 的两段式）。
⇒ ☆ 暗档 `-550` 的起点比该色族的**暗档基色更浅一档**（如 blue 暗基色 `113 178 255` 而 `-550`＝`124 184 255`）⇒ **上段在暗档里是"基色往更浅走"的 8 档**，不是"基色往更深走"。

### 四、⚠ 官方不自洽候选＝`--caption-*` 族内 400／500 两档的两条度量互反

⇒ 逐字＝`--caption-md-400-line-height:16px` ＋ `-letter-spacing:.01px`，而 `--caption-md-500-line-height:13.2px` ＋ `-letter-spacing:.05px`；⇒ **`lg` 档正好反过来**＝`--caption-lg-400-line-height:16px`＋`.05px`、`--caption-lg-500-line-height:16px`＋`.01px`；⇒ ☆ 对照 `--ui-*` 族的规律（同 size 只有 `weight` 变、其余相同）＝**这条反差只在 caption 族出现**，看着像手误；⇒ ⚠ 按纪律**登记为"官方自相矛盾候选"**＝本地**照抄数值、不修正**（否则对不上官方像素），并把该条写进注释免得后人当漂移"顺手规范化"（G1098）。

### 五、本地对照与落点

⇒ **排版层**＝本地**整层缺失**＝字号写在 `.tiptap h1…h4`（`src/app/globals.css:369-396`＝1.875／1.5／1.25／1.0625rem，`line-height` 1.3／1.35／1.4／1.45）、正文根字号 `:360-361`＝`16px／1.5`；**全部没有 `letter-spacing`、没有 `font-variant-numeric`、没有 `font-feature-settings`**；`grep -rn "typography-｜--ui-｜--caption-｜--body-md" src/` 零命中（只在 `globals.css:1061` 的一句注释里提到过官方 `--ui-md 13`）；
⇒ **强调色**＝本地只有 `--craft-accent`／`--craft-accent-hover` 两档（`src/app/globals.css:127-128,284-285`），**没有 550–900 上段、也没有暗档反向机制**；☆ 另注意 §十四 的命名陷阱＝本地 shadcn 的 `--accent` 是灰底 hover 色、与官方 `--accent`（强调色）同名不同物；
⇒ ☆ **可执行改法**（`gap.md` §〇「七」第 1／5 行）＝先在 `@layer base` 补四族 token ＋ 31 个类（六件套逐字），再把 `.tiptap h1…h4` 改成读类；强调色两套上段 96 个值直接可抄（本节两张表）。

**仍未采到（本节）**：`--ui-*`／`--caption-*`／`--body-*` **在界面上的实际消费分布**（哪个组件用哪档）只读到一处屏上样本（任务卡片＝`typography-ui-md-500`）〔✎ **第 109 批**＝消费点从 1 处补到 4 处（表头 `typography-caption-md-500`／行标题 `typography-ui-md-600`／行副标题 `typography-ui-xs-500`／三个数据列 `typography-ui-sm-500`，见 §十六.四）〕；`.typography-*` 是否被 CSS-Module 之外的地方引用（未做全库消费点扫描）；`--heading-*` 缺 `lg`／`xl` 时**页面标题与副标题走哪一档**未裁；☆ `--font-family` 在暗档／不同文档字体偏好下是否被改写（承第 106 批"字体偏好是否随文档持久化"这条未结项）；★ 上段 96 个值的**生成规律**未反推（亮档看着像按固定步长压暗，但没验证是否与 `--accent-N` 的 HSL 调整一致）。

## 十六、**焦点层结案＝官方焦点环实测逐字 `outline:1px solid var(--accent-500)` ＋ `outline-offset:-1px`（由 `data-whatinput` 闸门控制，鼠标档下 `outline-style:none`）；★★★ 一条必须写进验收脚本的换算律＝屏上 `border-width`／`outline-width`／`outline-offset` 读数在本桥是"设备像素量化后"的值，要 ×DPR 才是声明值**（✓屏上实测＋盘上 第 109 批 2026-09-30 17:0x–17:4x 本地＝UTC 09:0x–09:4x；★ 行为侧在 `interactions.md` V103，gap 行 **G1110／G1111／G1116／G1117**，与 `styles.md` §十五 的排版消费点合并读）

### 一、★★★ 屏上换算律（先讲这个，因为不先讲就会把官方读成"三档环对不上"）

自插锚点探针实测（DPR＝1.25 的同一帧里）＝`border:1px` → computed **`0.8px`**；`outline:medium`（规范上 3px）→ **`2.4px`**；`outline-offset:1px` → **`0.8px`**；而同一探针的 `width:100px`／`font-size:20px`／`line-height:20px`／`getBoundingClientRect().width` **全部原样**。⇒ 结论＝**只有会被 snap 到设备像素的"发丝线"属性（`border-width`／`outline-width`／`outline-offset`）受 1/DPR 量化影响**，本桥 1px 声明 → 0.8px 读数；⇒ ★ **历批"焦点环三档（通用 ＋1.5px／tab −2px／卡片 −1px，来自 CSS 声明）与屏上 0.8px 读数不一致"的疑点结案＝不是官方不一致，是读数没换算**；⇒ ☆ 反向规则＝**报告里凡是屏上量到的 1px 级线宽，要 ×1.25 还原成声明值再与 CSS 对账**；☆ 附带一条环境差＝本地 Playwright 的 DPR 通常是 1 ⇒ **跨环境比较"环宽"字节必然不等**，与第 104 批"端口复用跑成别人代码"同属验收脚本的环境门槛。

### 二、★★★ DS 按钮的焦点环逐字（第一次拿到"屏上真焦点"的读数）

| 态 | 读数（屏上 computed，已按 §一 换算） | 对应声明 |
| --- | --- | --- |
| 窗口真焦点 ＋ `data-whatinput="keyboard"` | `outline-style:solid`／`outline-width:1px`／`outline-color:rgb(113,178,255)`／`outline-offset:-1px` | ⇒ 与主包与 CSS 里都存在的模板串 **`outline:1px solid var(--accent-500);outline-offset:-1px;`** 逐字对上 |
| 同一元素、两档属性打回 `mouse` | `outline-style:none` | ⇒ ★ **闸门确实是 `input` 属性**（不是浏览器自己的 `:focus-visible` 判定），且 `:focus`／`:focus-visible` 本身**一直是匹配的** |
| 链接（`A`，键盘档下） | `outline-style:none` ＋ `outline-offset:1px`（换算后） | ⇒ ☆ **链接在鼠标档没有环**；offset 保留说明规则命中过但 style 被 `outline:none` 关掉 |
| DS 按钮（`MediumSmall` 档）另两条 | computed `height:32px`／`font-size:13px` | ⇒ 与第 100 批"三档尺寸 28／32／34"与第 105 批"`--ui-md` 13"两条静态值**交叉复证** |

⇒ ★ **环色＝`--accent-500`**，暗档逐字 `113 178 255`（第 107 批的强调色上段表）⇒ 焦点层与色阶层在此咬合；⇒ ☆ 本地对照（三项都不同）＝`src/components/ui/button.tsx:6` 与 `src/components/ui/checkbox.tsx:12` 用 `outline-none` ＋ `focus-visible:ring-3 focus-visible:ring-ring/50`（**box-shadow 环、3px、50% alpha**）、`src/app/globals.css:345-346` 的 `* { @apply border-border outline-ring/50 }` 只定色、`src/app/globals.css:798-800` 的 `.math-block-edit:focus{outline:2px solid var(--craft-accent);outline-offset:-1px}` 是**2px 且无闸门**。

### 三、★★ 官方"环"至少有三套实现（不要按一种抄）

① **`outline` 型**＝DS 按钮一类（§二）；② **具名子元素型**＝复选框模块 `1nu3o` 的键集逐字＝`outerBox／innerBox／focusRing／isActive` ⇒ **环是一个真实 DOM 子节点**（可自带缩放与层级）；③ **换脸型**＝卡片的 `_idle`→0 与 `_action`→1 成对规则（第 106 批），鼠标 `:hover` 与键盘 `:focus` 共用同一对、触摸档被 `:not([data-whatintent=touch])` 整体排除。⇒ ☆ 另注＝同屏还读到第二、第三种 checkbox 族（`1fgll:wrapper,checkbox` 与 `dhebv:…,selectionCheckbox`）⇒ **浏览屏至少三种复选框实现**，本地只有一个 `ui/checkbox.tsx`。

### 四、★☆ 排版档的真实消费点（把 §十五 的"类存在"补成"类被谁用"）

逐字来自 §三十五.二的类名表＝表头 `typography-caption-md-500`、行标题 `typography-ui-md-600`、行副标题 `typography-ui-xs-500`、三个数据列 `typography-ui-sm-500`；⇒ ★ **官方把哈希类与排版档写在同一个字符串常量里**（例：`"_columnHeader_1m9yz_29 typography-caption-md-500"`）⇒ **排版档是组件级显式声明、不靠父级继承**；⇒ 本地要落地就得**逐组件挂档**（`src/app/globals.css:369-396` 那种写死 rem 的写法要一并迁到 token）。

⇒ **就地 ✎**＝`styles.md` §十五 的「仍未采到」第一条（"`--ui-*`／`--caption-*`／`--body-*` 在界面上的实际消费分布只读到一处屏上样本＝任务卡片 `typography-ui-md-500`"）本批**结一半**＝列表视图四档消费点逐字到手（§四：`caption-md-500`／`ui-md-600`／`ui-xs-500`／`ui-sm-500`），★ 且样本从 1 处变 4 处；仍缺**编辑器正文与标题档**的消费点，该条不整条划掉。

**仍未采到（本节）**：① **触摸档的环／`active` 替代**（本批窗口有真焦点但没有触摸模拟，`:hover`→`:active` 那条编译产物仍未屏上复现）；② 复选框 `focusRing` 子元素的**实测尺寸与颜色**（本轮 `role=checkbox` 在 `/all` 静止态不存在，需要进选择模式＝会改视图态，未做）；③ `--accent-500` 在**亮档**下的环色实测（亮档值逐字是 `46 109 233`，未屏上复验）；④ 三档 DS 按钮尺寸各自的环偏移（只测了 `MediumSmall`）；⑤ 卡片"换脸"在键盘档的实测（只拿到规则）。

## 十七、第 110 批＝框选矩形的官方 CSS、卡片焦点环实测、容器查询与列宽的运行值、`initial` 档对样式的作用（2026-09-30；★ 源＝盘上 CSS/JS 逐字 ＋ 屏上 `getComputedStyle` 实测；DPR 换算律见 §十六）

### 一、★★★ 框选矩形的官方声明（逐字，来自 `_harvest/css/TaskViews.css.DghTjfLb.css`，同一条也在 `css/index.css.*` 里）

```
._rubberBand_fdch5_1{position:fixed;background:var(--accent-100);border:1px solid var(--accent-500);border-radius:var(--radius-sm);pointer-events:none;z-index:10}
```

⇒ ★ **`position:fixed` ＋ `createPortal(…, document.body)` ＋ 内联 `top/left/width/height`**（渲染侧逐字见 `longtail.md §三十六.三`）⇒ 矩形用的是**视口坐标**、不受容器裁剪，且它挂在 `body` 上而不是浏览屏容器里（⇒ 本地若把它放进滚动容器会出现滚动错位）；⇒ ☆ 配色＝`--accent-100` 底 ＋ `--accent-500` 描边（与 §十六 DS 按钮焦点环同族，但环宽 1px vs 按钮 1px vs 卡片 3px ⇒ **官方三套环/框三种粗细**）；⇒ ☆ `z-index:10` 是有意的低层（在浮层栈之下，见第 107 批两档 z 层）。

### 二、★★★ `data-whatintent="initial"` 这一档**对样式选择器的实际作用**（本批最容易被漏掉的一条）

盘上选择器形态（历批已录）＝`[data-whatintent]:not([data-whatintent=touch]) X:hover` 之类；屏上实测全新载入（清掉持久键后重载）时两属性逐字为 **`initial`**。
⇒ ★★★ **`initial` 同时满足"属性存在"与"不等于 touch"两个条件 ⇒ 首帧就按"非触摸档"渲染 hover/active 规则**，即：官方**没有**"意图未知 ⇒ 不给 hover"这一档；
⇒ ☆ 本地复刻的含义＝如果只写"检测到 mouse 时才写属性"，首帧的 hover 类样式就会与官方不同（官方首帧已生效）⇒ **正确做法是装载即写 `data-whatinput="initial"` 与 `data-whatintent="initial"`**（已并入 `gap.md` 台账「九」第 5 行）。

### 三、★★★ 容器查询的实测值（把第 109 批的盘上断点变成运行时事实）

| 元素 | `container-type` | `container-name` | `clientWidth` |
| --- | --- | --- | --- |
| `div._mainWrapper_6sjpd_20` | `inline-size` | **`web-shared-layout-main-wrapper`** | **916** |
| 一颗未命名 DIV（祖先） | `size` | `none` | 1204 |
| `div.sc-1r02f4x-5`（`[data-testid="browse-document-list"]`） | `inline-size` | `none` | 884 |

同屏 `innerWidth`＝**1204**；`_colLastViewed` 的 computed `display:none`、`min-width` 仍声明 `112px`、`offsetWidth:0`；`_colUpdated` 的 computed `display:flex`、`width:112px`。
⇒ ★★★ **1204 ≥ 1024 而「上次浏览」仍隐藏 ⇒ 断点吃的是容器 916**（若是 `@media (min-width:1024px)` 就该显示）⇒ 第 109 批读到的 `@container web-shared-layout-main-wrapper (width>=768px｜1024px)` 两条**运行时成立**；⇒ ☆ 中间夹一颗**无名 `inline-size` 容器（884）不阻断具名查询** ⇒ 官方具名容器可以隔级生效。

### 四、★★★ 列宽自定义属性的运行值＝`0px` 会覆盖 CSS 兜底

`[data-testid="browse-document-list"]`（★ styled-components 壳，不是 CSS Module 类）内联样式逐字三条＝

```
--col-last-viewed-width: 0px
--col-updated-width: 112px
--col-created-width: 112px
```

⇒ ★★★ 上批读到的消费式 `width:var(--col-last-viewed-width, 8rem)` 里 **`8rem` 只在属性"未定义"时参与**，而写入方量的是 `offsetWidth`（元素被 `display:none` 时恒为 0）⇒ **列被藏起来时写进去的是 `0px`，兜底值永不生效**；⇒ ☆ 复刻要求＝"隐藏时也照样写 `0px`"，否则与官方差一个 8rem；☆ 这也给出一个可复现的抖动来源（切档瞬间先写 0px 再被容器查询恢复）。

### 五、★★ 两档卡片网格的实测几何（对照第 108 批的 12 个常量）

| 档（按钮图标） | 行容器 | 每行列数 | 卡宽 | `height/width` |
| --- | --- | --- | --- | --- |
| `Rectangle Grid2x2`（开场档） | `_virtualBody_1wotv_2` ＋ `_virtualCardRow_1wotv_8` | **2** | **308.5**（超出上批"上限 268"） | **1.25** |
| `Rectangle3 Group` | 无 `_virtualCardRow_`（另一套列表壳） | 未逐行量 | **268**（＝上批常量） | 1.242 |

⇒ ☆ 于是上批那条"卡宽上限 268"**只适用于第二档**；第一档实测 308.5 ⇒ 官方两档用的是两套布局公式（与 §三十六.三 的 `documentsGrid` 剪枝模型一致：一档有 `columnCount/columnWidth/rowHeight/gap` 可算，另一档走 `columns` 列模型）；⇒ ★ 比值 1.25 两档一致 ⇒ "卡片宽高比 1/1.25"这条常量仍然成立。

### 六、★★ 卡片焦点环与复选框的实测声明值

`_focusRing_1nu3o_7`（静止态）computed＝`position:absolute`、`inset:-1px`、`border:2.4px solid rgb(113,178,255)`、`z-index:1`、`display:none`、尺寸 0×0；父元素 `_outerBox_1nu3o_20 _isActive_1nu3o_62`。
⇒ ★ 按 §十六 的 DPR 律还原：2.4 × 1.25 ＝ **声明值 3px**；☆ `inset` 报 `-1px`（未被量化）⇒ **只有 `*-width` 一族会被量化，`inset` 不会**（这条把上批的律收窄了一格）；⇒ ★ `rgb(113,178,255)` 与 `--accent-500`／`brand-blue` 浅端同值族（§十一.一）⇒ 官方三处环都取 accent 族，只是粗细与载体不同（按钮 `outline:1px`／卡片 `border:3px` 子元素／框选 `border:1px`）。
复选框实测＝`SPAN[role="checkbox"][tabindex="-1"][data-unchecked=""][aria-checked="false"][id^="base-ui-"]`（类 `_checkbox_1fgll_11`，18×18，位于行右端）＋ 同级隐藏 `INPUT[type="checkbox"][tabindex="-1"][aria-hidden="true"]`（内联 `clip-path: inset(50%)`）；⇒ ★ 两枚都 `tabindex=-1` ⇒ **列表/网格行的选择不可 Tab 达到**；⇒ ✎ **上批 G1116 归位**＝`focusRing` 属卡片模块 `1nu3o`，**不属复选框模块 `1fgll`**（本轮实测 `1fgll` 只有 `_wrapper_1fgll_1` 与 `_checkbox_1fgll_11` 两枚，且表格档全页 `[class*="focusRing"]` 0 命中）。

### 七、☆ 盲区一条（会骗人）

静止态 `[class*="_isActive_"]` 命中 **8/8 张卡** ⇒ **`_isActive_` 不是"被选中"**；卡片档的选中判据只能走 `role="checkbox"` 的 `aria-checked`（本批框选起手时确有 1 枚翻 true）或选择 store（`selectedIds`）。

**仍未采到（本节）**：① 卡片环 `_focusRing_` 真正显示时的态（要 `:focus-visible` 或选中态，本轮静止）；② 框选矩形的屏上运行值（`top/left/width/height` 实数与是否被滚动改写）；③ 第二档与第三档下的 `--col-*-width`（本批只在表格档读到三条）；④ 具名容器在**更窄视口**下（<768）两列是否也一起消失；⑤ `_divider_1m9yz_56` 与 `_thumbnailCol_1m9yz_160` 的可见条件与实宽；⑥ `--radius-sm` 与框选圆角的实测值（未量）。

## 十八、第 111 批＝20 档代码主题底色全表（暗标记错配闭合）＋ `settings` 键集分布 ＋ 本地暗档语法色已对齐（2026-09-30 20:3x–21:1x；★ 源＝`_harvest/js/CodeEditorWrapper-DB8UxA00.js` 逐字＋`locator.evaluate` 屏上实测；☆ 全表在 `longtail.md §三十七.一`，gap 在 G1143–G1147／G1159）

### 一、★★★ 暗标记错配＝恰好 3 档（判据可复算）

⇒ 判据＝亮度 `0.2126R + 0.7152G + 0.0722B`（Rec.709、0–255 域）、阈值 **128** 判暗、三位十六进制先展开；⇒ 逐档亮度（暗档侧）＝`githubdark 16.6`／`tokyonight 27.6`／`vscodedark 30.0`／`aura 33.2`／`craftdark 40.9`／`gruvboxdark 40.0`／`tokyonightstorm 40.5`／`darcula 43.0`／`atomone 43.6`／`dracula 42.4`／`materialdark 49.4`／`nord 51.6`／`sublime 54.9`；（亮档侧）`githublight 255.0`／`bbedit 255.0`／`craftlight 251.0`／`materiallight 250.0`／`noctislilac 241.7`／`gruvboxlight 240.1`／`tokyonightday 226.1`；⇒ ★ **错配三档**＝`craftdark`（暗底 40.9、工厂字面量 `"light"`）／`materiallight`（亮底 250.0、`"dark"`）／`tokyonightday`（亮底 226.1、`"dark"`）⇒ **CM6 只吃工厂字面量**（`li.theme(O,{dark:i==="dark"})`）⇒ 这三档的 CM6 侧暗标记是反的，而选择器 `isDark` 是对的 ⇒ ☆ 本地若做代码主题面：**以 `isDark` 为准**，并把这三档的官方错配登记为"不照抄"。

### 二、★★ `settings` 键集分布（不是定长对象）

⇒ 键数分布 `{7:1, 8:1, 9:5, 10:7, 11:6}`；⇒ 逐键出现档数＝`background`／`foreground`／`selection`／`selectionMatch` 20/20、`lineHighlight`／`gutterBackground`／`gutterForeground` 19/20、`caret`／`fontFamily` 18/20、`gutterBorder` 16/20、`gutterActiveForeground` **7/20**；⇒ ★ `gutterBorder` 三态＝14 档 `transparent` ＋ 2 档 `#f4f4f41f`（**只有 `craftdark` 与 `githubdark`**，逐字同串）＋ 4 档无键（`craftlight`／`githublight`／`gruvboxdark`／`noctislilac`）；⇒ ☆ `fontFamily` 缺 2 档（`tokyonight`／`tokyonightstorm`）＝这两档代码字体不落 settings；`caret` 也缺 2 档（`craftlight`／`githublight`）。

### 三、★ 官方不规范写法两条（登记不修正）

⇒ `githublight.background` ＝ **三位** `#fff`（其余 19 档六位）；⇒ `gruvboxlight.selection` ＝ `rgba(235,219,178)`（三分量、无 alpha，CSS 合法但看着像漏写）；⇒ ☆ 与既有缺陷（`deleted` 的 `"ffeef0"` 缺 `#`，四档同串）同族＝**官方色值串写法不统一**。

### 四、☆ 屏上量到的应用级样式事实（本批顺带）

⇒ 编辑器屏同一元素上并排 `data-theme="light"` `data-accent="blue"` `data-whatinput="mouse"` ⇒ ★ 应用级主题与强调色是**属性驱动**（与代码块主题无关，别混用）；⇒ ☆ 视口实测 `innerWidth 1528`、DPR 1.25、截图 1910×867 ⇒ 与第 110 批的 1204/916 是**不同窗口尺寸**，跨批几何不可直接比字节；⇒ ★ 右侧栏四 tab 的 label 在 DOM 里**各出现两次**（`sc-pdtez-1` ＋ `sc-pdtez-0` 两个 span）⇒ 按文本定位会命中不可作用元素（本批 `click()` 因此超时）。

### 五、★★ 本地已对齐项（本批改的两行）

⇒ `src/app/globals.css:300-301` 暗档 `--editor-blueDark` 由 `rgb(3 0 245)`→`rgb(170 169 249)`、`--editor-blueLight` 由 `rgb(41 98 246)`→`rgb(65 146 247)`（＝官方暗档逐字，G1068）⇒ ☆ 至此本地 `.dark` 的 `--editor-*` 一族**全部**与官方暗档一致（除 G1068 记的"缺 `--editor-text`／`--editor-spectrum`"与命名大小写差仍在）；⇒ ★ 测试守＝`src/lib/editor/dark-syntax-tokens.test.ts`（读 CSS 断言暗档两值＋亮档两值不被改动）。

**仍未采到（本节）**：① 20 档的 `styles`（token 色板）仍只有第 109 批 7 档逐字；② `gutterActiveForeground` 缺的 13 档实际继承到什么值；③ 主题在屏上的**实际渲染底色**（本批全部来自盘上 settings，未做屏上底色对照，因主题面板入口未找到）；④ `--editor-spectrum` 与 `--editor-text` 在本地补齐（G1068 的缺失半条）。

## 十九、**第 112 批＝代码块"色从哪来"这一面的一次闭合：CM6 基准主题 `&light`／`&dark` 全表 ＋ 缺省 gutter 的继承链 ＋ Craft 压在 CM6 上的 `!important` 层 ＋ 浮层与滚动条的 app 级常量**（✓盘上 第 112 批 2026-09-30 21:4x–23:1x，**零浏览器内容面调用、零写入**；★ 逐字表在 `longtail.md` §三十八.一／二／七，机制在 `internals.md` §五十一，gap 在 `gap.md` §三点一〇六二 G1160–G1179；机读结果 `_harvest/b112-base-theme.txt`／`_harvest/b112-styles.txt`）

### 一、★★★ 名册覆写不到的部分走"基准主题"，而基准主题**按 `&light`／`&dark` 分档**

⇒ 本节把一件以前只能"猜兜底"的事量化了：CM6 基准主题（`vendor-code-editor` @165,701 起）里有 **35 条 `&light`／`&dark` 规则、去重 20 个选择器**（逐字两列表在 `longtail.md` §三十八.二），而 Craft 的 20 档名册通过 `gBn` 只覆写其中 **6 类**（`&`、`.cm-gutters`、`.cm-activeLine`、`.cm-activeLineGutter`、`.cm-selectionBackground`、`.cm-selectionMatch`，外加 `.cm-content` 的 `caretColor` 与 `.cm-cursor`／`.cm-dropCursor` 的 `borderLeftColor`、`&.cm-editor .cm-scroller` 的 `fontFamily`）⇒ ⇒ **其余 14 类选择器（`.cm-searchMatch*`、`.cm-specialChar`、`.cm-panels*`、`.cm-button`、`.cm-snippetField`、`.cm-textfield`、`.cm-tooltip*`）在 Craft 里永远是 CM6 基准值**，且基准值本身是亮暗两套 ⇒ ★ 复刻时的正确做法＝**把这两套也当作规格表抄**，而不是只抄 20 档名册。
⇒ ★★★ 分支的判定**不看底色**，看逐字 `{dark:i==="dark"}` 里的 `i`＝工厂 `theme` 字面量 ⇒ 于是第 109／111 批钉死的三档错配（`craftdark` 自标 `light`、`materiallight`／`tokyonightday` 自标 `dark`）在本节有了**具体的可见后果**：这三档从**相反分支**取那 14 类基准值（例如 `craftdark` 的搜索命中高亮会取亮档的 `#ffff0054` 而不是暗档的 `#00ffff8a`、`.cm-specialChar` 取 `red` 而不是 `#f78`）。
⇒ ☆ 另有 5 条基准规则**天生只有一档有**＝`.cm-cursor` 与 `.cm-tooltip-arrow` 只有 dark 版、`.cm-panels-bottom`／`.cm-panels-top`／`.cm-tooltip-section:not(:first-child)` 只有 light 版 ⇒ 名册若也不写（`craftlight`／`githublight` 没有 `caret`），该属性**整条不存在**。

### 二、★★★ 行号槽（gutter）的颜色链：名册 → 继承 → 基准，三层且没有中间默认值

⇒ 逐字装配（`gBn` @1,481,662）：`O[".cm-gutters"]={}` 起手，随后 `s.gutterBackground&&(O[".cm-gutters"].backgroundColor=…)`、`s.gutterForeground&&(O[".cm-gutters"].color=…)`、`s.gutterBorder&&(O[".cm-gutters"].borderRightColor=…)`；活跃行那一支是 `var p={}; s.gutterActiveForeground&&(p.color=…); s.lineHighlight&&(…, p.backgroundColor=…); O[".cm-activeLineGutter"]=p` ⇒ ⇒ ★ **装配处没有任何默认值**，缺键＝该声明根本不产出 ⇒ ⇒ 13 档缺 `gutterActiveForeground` 的"实际颜色"＝**CSS 继承 `.cm-gutters` 的 `color`**（逐档继承值表在 §三十八.一）。
⇒ ★★ 两个边界值可作判据：① `githublight` 的 `gutterActiveForeground` 与 `lineHighlight` **都缺** ⇒ `p` 是空对象 ⇒ 官方给它生成一条**不产出任何声明**的 `.cm-activeLineGutter{}`；② `githubdark` 的 `gutterForeground`／`gutterBackground` **也缺** ⇒ 落到基准 `&dark .cm-gutters{backgroundColor:"#333338",color:"#ccc"}` ⇒ ☆ 与该档正文底色 `#0d1117` 形成**肉眼可见的色差**（行号槽比正文偏亮）⇒ 这条是本批唯一"名册缺字段会直接改变观感"的实例。

### 三、★★☆ Craft 压在 CM6 之上的 `!important` 几何层（历批屏上读数的码路来源）

⇒ 逐字（`CodeEditorWrapper` @34,900 段，styled/emotion 的 `Ae([...])` 模板）＝`.cm-content{line-height:24px !important; font-size:14px; cursor:text; padding:12px 0 !important; .cm-line{padding-left:10px !important}}`、`.cm-theme{height:100%; overflow:auto}`、`.cm-gutters{line-height:24px !important; font-size:14px; <插他>; border-top-left-radius:5px}`、`.cm-gutterElement{padding:0 10px !important; min-width:36.8px !important; &:not(:first-child){min-height:24px}}`、`.cm-focused{outline:none !important}` ⇒ ★ **这一层与"档"无关**（20 档共用一套），⇒ ⇒ 分工＝**名册管颜色、这一层管几何**；☆ 历批屏上量到的"块内行高 24"在此有声明（`line-height:24px !important`），且 `min-width:36.8px` ＝官方给行号列的**非整数最小宽**（★ 屏上量它时要按第 109 批的 DPR 律还原：1.25 档下 `36.8` 是声明值、不受量化）。
⇒ ☆ 焦点环：`.cm-focused{outline:none !important}` ⇒ **代码块内部刻意取消 CM6 自己的 outline**（与第 109 批"环有三处三种写法"并列的新素材：代码编辑器内部是**第四处**，而且是无）。
⇒ ☆ 自动补全菜单两支逐字＝`.cm-completionLabel{font-family:"Roboto Mono",monospace;font-size:13px}`、`.cm-completionDetail{font-family:"Roboto Mono",monospace;font-size:11px;font-style:italic}`、`.cm-completionIcon{padding-right:1rem !important}`、`li{border-radius:6px;padding:6px 8px !important;background:<插>; &[aria-selected]{background:<插> !important; color:inherit !important}}` ⇒ ★ 这里出现了本目录少见的 **`[aria-selected]` 直接当选中态**（与第 97／108 批"Craft 自有浮层零 ARIA"形成对照：**CM6 自己的补全菜单是有 ARIA 的**）。
⇒ ☆ tooltip 一支＝`.cm-tooltip{z-index:1000; background:<渐变> !important; background:transparent; box-shadow:0 0 0 1px <边框色>, <阴影>; border-radius:8px; overflow:hidden; border:none !important; padding:8px; @supports (backdrop-filter:saturate(1.5) blur(32px)){background:<渐变85%> !important; backdrop-filter:… !important}}` ⇒ ☆ 同一条里"先给 `!important` 的实色、再给不带 `!important` 的 `transparent`、再用 `@supports` 盖回"这种三段式是官方一处**故意的渐进增强**写法。

### 四、★☆ 浮层与滚动条的 app 级常量（代码块专用，与 token 名无关）

⇒ 两条渐变逐字＝`me=(o,t)=>o ? "linear-gradient(116deg, rgb(40 42 43 / "+t+"%), rgb(34 36 37 / "+t+"%))" : "linear-gradient(116deg, rgb(250 250 250 / "+t+"%), rgb(244 244 244 / "+t+"%)"`（调用时 `t` 传 **100** 与 **85** 两档）；一条 backdrop＝`se="saturate(1.5) blur(32px)"`。
⇒ 滚动条四色＋一个透明常量逐字＝`zo="#C1C1C1"`（亮 thumb）、`Vo="#686868"`（暗 thumb）、`Yo="#A8A8A8"`（亮 track）、`Xo="#7B7B7B"`（暗 track）、`Se="transparent"`；闸门＝`if(o.isScrollbarPersistent) return K([...])` ⇒ **不持久时整段不产出**（☆ 默认走另一支，本批未读那支）；几何＝`::-webkit-scrollbar{width:14px;height:14px;overflow:visible}`、`thumb{border:3px solid transparent;border-radius:7px;min-height:28px;padding:100px 0 0;background-clip:padding-box}`、`track{margin:0 4px;border-width:4px !important}`。
⇒ ☆ 数学排版一支＝`Ae([".katex{font-size:","em !important;}"], o=>(1.21*(o.fontScale??1)).toFixed(2))` ⇒ ⇒ **KaTeX 的字号是 `1.21 × fontScale` 个 em，且写成两位小数字符串**（☆ 第 111 批读到的 `fontScale` 由此第一次有消费点）。

### 五、★★ 本地对照（本轮实扫）

⇒ **本地根本没有 token 配色层**＝`grep -rn 'hljs' src` **0 命中**、`grep -rn '\.hljs' src e2e` **0 命中**，而高亮是 `createLowlight(common)`（`src/components/editor/Editor.tsx:20,71`）＋ `CodeBlockLowlight.configure({lowlight})`（`:304-310`）⇒ 发出去的是 `hljs-*` 类名，**没有任何规则消费** ⇒ ⇒ ★ **本地代码块现在是单色的**（这条以前只记过"命名三套不通"G1088／G1094，本批把"本地这一套也没接上"钉死）。
⇒ 本地的 `--editor-*` 语法九色（`:143-152` 亮／`:300-309` 暗）只派生出 `--highlight-*`（`:158-165`／`:315-322`）＝**文本高亮标记**用，与代码 token 无关；☆ 第 111 批改的 `--editor-blueDark`／`--editor-blueLight` 两行至今只有测试消费（`src/lib/editor/dark-syntax-tokens.test.ts:16-21`）。
⇒ 几何差＝本地 `pre` 是 Tailwind `overflow-x-auto p-3 text-sm`（`code-block-view.tsx:73`）＋ `globals.css:424-441` 的 `pre{line-height:1.6; font-size:0.875rem; padding:1rem 1.25rem; background:oklch(0.2 0.005 260); border-radius:8px}` ⇒ 与官方"行高强制 24px／字号 14px／`padding:12px 0`／行号列最小宽 36.8px／左上圆角 5px"**四格全不同**，且本地无行号槽。
⇒ ☆ 命名差＝本地外观第三档叫 `system`（`src/actions/user/preferences.ts:6` 的 `themeValues`＝`light／dark／system`），官方对应词是 **`dynamic`**（`appearance.*.dynamic@2x.png`）⇒ 语义同、词表不同 ⇒ 若做导出／对账映射要显式列这条。

**仍未采到（本节）**：① 滚动条"不持久"那一支的 css（`ct` 的 else 分支未读）；② `.cm-gutters` 模板里那个插值位（逐字 `…font-size:14px;"," border-top-left-radius:5px`）实际注入的是哪个 helper 的返回值（同段的插值序列第一个是 `he("none")`，☆ 未证它注入到哪一位）；③ 官方屏上"行号槽底色与正文底色不同"（`githubdark` 的 `#333338` vs `#0d1117`）尚未屏上复验——需要能切到该档；④ 本地要不要补 token 配色层（G1163）属**待用户裁**项，未动。

### 十九之续（第 113 批）＝**`craftlight` 三组着色获屏上复核；本批无新样式读数**（✓屏上 2026-10-01 04:1x–04:4x 本地＝UTC 09-30 20:1x–20:4x；★ gap 在 `gap.md` G1180，逐字对照在 `longtail.md` §三十九.三）

⇒ ☆ **为什么不单开一节**＝本批没有新的样式读数，只做了一件事＝**把 §十九.一 那张 `craftlight` 表拿去屏上复核**：同一篇文档里并排六块（五档无 grammar ＋ `python` 对照），实测 `python` 块出现三组色＝`def`／`return` 红、`f`／`x`／`1`／`+` 蓝、`# note` 灰，逐一对应 `keyword→#d73a49`、`variableName/attributeName/number/operator→#005cc5`、`comment/bracket→#6a737d`；☆ 另两条几何读数与历批一致＝**每块都有行号槽**、块底色浅灰白（`--code-background` 那档 `#FBFBFB`）。
⇒ ★ 由此把 §十九 的一条"未证"降级为"已证"＝**名册色板确实会渲染成屏上像素**（此前只有码路与 CSS 生成层证据，没有屏上像素）；☆ 同时**没有**给 §十九 的 `!important` 层加新值（`line-height:24px`／`font-size:14px`／`min-width:36.8px` 三条本批未重测）。
⇒ ☆ 本地对应面（本轮实扫）＝`src/app/globals.css:172-186`（`:root`＝`craftlight` 逐字）／`:345-355`（`.dark`＝`craftdark` 逐字）／`:452-526`（八组 `.hljs-*` 规则）⇒ 提交 `0bc777b`；⚠ **本地侧的屏上自证仍欠**（连接器在本批末挂死，没来得及开 `localhost:3000`）⇒ 记在台账「十二」的 P1 行。

### 十九之续（第 114 批）＝**第一次按"计算结果"而不是"声明"读 20 档色板：6 档的 `link` 实际不上色（☆ ✎ **第 115 批改判＝7 档**，漏了 `githubdark`；且该数只数了"被无色后条覆盖"这一种成因，准确口径与三种成因分列见 §十九之续（第 115 批）§一）、4 档的 `annotation` 前一条是死声明；外加本地两档在真浏览器里的 62 个 computed 读数全部对上官方值**（✓盘上＋本地 2026-10-01 04:4x–05:2x 本地＝UTC 09-30 20:4x–21:2x；★ gap 在 `gap.md` §三点一〇六四 G1192–G1199／G1208，判据本体在 `internals.md` §五十三.一–四，逐字在 `longtail.md` §四十.一–四）

#### 一、★★★ 为什么"声明表"和"有效表"不是一张（判据一句话）

⇒ CM6 的 `styleFor`（本批逐字，`vendor-code-editor-BLm003PU.js` @275,545）把 `styles` 数组摊成一张 **`tag.id → class` 的平表**，逐条**后写覆盖前写** ⇒ ⇒ ★ 只要同一档里某个 tag 出现两次，**前一条就退化成"生成了 class 名、但没有任何元素引用它"的死 CSS**（class 仍在 `StyleModule` 里，屏上不可见）；⇒ ☆ 而 `...r` 尾串恒为空（§五十三.三）⇒ 这些重复**全是工厂自己写进去的**，不是运行时拼进来的。

#### 二、★★★ 20 档"有效色"审计表（本轮实扫，逐档）

| 档（名册键） | 工厂／`theme` 字面量 | 条目数 | 被覆盖的 tag | 覆盖前 → 覆盖后（有效值） |
| --- | --- | --- | --- | --- |
| `craftlight` | `io`／light | 9 | ☆ 无跨条覆盖（条内 `typeName` 写了两遍，同色无害） | — |
| `craftdark` | `fo`／**light**（★ 与档名相反，承 G1118） | 9 | ☆ 同上 | — |
| `atomone` | `co`／dark | 8 | 无 | — |
| `aura` | `mo`／dark | 20 | ★ `link` | `#61ffca` → **只有 `text-decoration:underline`、颜色退回 foreground** |
| `bbedit` | `po`／light | 13 | 无 | — |
| `darcula` | `no`／dark | 9 | 无 | — |
| `dracula` | `ko`／dark | 8 | `atom`（同色两次） | `#bd93f9` → `#bd93f9`（无视觉差） |
| `githublight` | `xo`／light | 15 | ★ `link`；☆ 条内 `typeName` 重复；`regexp` 同色两次 | `#032f62` → **只有下划线、无颜色** |
| `githubdark` | `vo`／dark | 14 | ☆ 条内 `typeName` 重复 | — |
| `gruvboxdark` | `No`／dark | 34 | ★ `annotation` | `#fb4934d`（★ 7 位＝**非法色、整条声明被丢**）→ `#d3869b` |
| `gruvboxlight` | `So`／light | 34 | ★ `annotation` | `#9d0006` → `#8f3f71` |
| `materialdark` | `Lo`／dark | 36 | ★ `annotation` | `#ff5f52` → `#ffad42` |
| `materiallight` | `Ao`／**dark**（★ 与档名相反） | 20 | ★ `link`；☆ `invalid` 用 8 位十六进制 | `#91B859` → **只有下划线、无颜色**；`#E5393570`＝**合法 CSS Color 4 `#RRGGBBAA`（alpha≈44%）** |
| `noctislilac` | `Io`／light | 15 | 无 | — |
| `nord` | `Eo`／dark | 36 | ★ `annotation` | `#d30102` → `#b48ead` |
| `sublime` | `Oo`／dark（★ **函数声明形态**） | 11 | ★ `propertyName` | `#629ccd` → `#36b7b5` |
| `tokyonightday` | `_o`／**dark**（★ 档名是 day） | 20 | ★ `link` | `#587539` → **只有下划线、无颜色** |
| `tokyonightstorm` | `Wo`／dark | 20 | ★ `link` | `#b4f9f8` → **只有下划线、无颜色** |
| `tokyonight` | `Ko`／dark | 20 | ★ `link` | `#b4f9f8` → **只有下划线、无颜色** |
| `vscodedark` | `qo`／dark（★ **函数声明形态**） | 17 | ★ `number`、★ `regexp` | `#4ec9b0` → `#b5cea8`；`#d4d4d4` → `#d16969` |
⇒ ★★★ **合计**＝跨条覆盖 **12 处**（`link` 6、`annotation` 4、`propertyName` 1、`number` 1、`regexp` 1，其中 `regexp` 那处是**同色**故无视觉差）＋ 条内 tag 写重 **4 处**（全是 `typeName`）＋ 非法色 **2 处**（同一档 `gruvboxdark`：`annotation` 的前一条与 `invalid` 的 `borderBottom:"1px dotted #fb4934d"`）；⇒ ☆ 计数口径＝按"档 × tag"计，不按声明行计（与 §十九 的"368 条逐字"两口径并存，不冲突）。

#### 三、★★ 三种"看起来像 bug"的十六进制要分开判（本批把上批那条扩成三形态）

| 形态 | 逐字例 | 出处 | 浏览器行为 |
| --- | --- | --- | --- |
| 缺 `#` | `backgroundColor:"ffeef0"` | `craftlight` 的 `deleted`（上批） | **整条声明丢弃** ⇒ 只有前景生效 |
| 位数非法 | `#fb4934d`（7 位） | `gruvboxdark` 的 `annotation` 前一条 ＋ `invalid` 的 `borderBottom` | **整条声明丢弃**（后者连边框一起没了） |
| 合法带 alpha | `#E5393570`（8 位＝`#RRGGBBAA`） | `materiallight` 的 `invalid` | **正常生效**（≈44% 不透明的红）⇒ ☆ 不是缺陷，别"顺手修" |

#### 四、★★★ 本地两档在真浏览器里的 computed 实测（G1191 剩一格结案）

⇒ 手法＝`_harvest/b114-palette-proof.cjs`（Playwright 直连本机 3100，在已加载 `globals.css` 的页面里注入 `.tiptap>pre>code` ＋ 31 枚 span 覆盖八组规则的全部选择器形态）；⇒ 逐字输出＝`light spans=31 pre=rgb(251, 251, 251) code=rgb(61, 61, 61) ALL MATCH` 与 `dark spans=31 pre=rgb(40, 41, 43) code=rgb(206, 207, 208) ALL MATCH`；
⇒ ☆ 明暗切换用 `documentElement.classList.toggle('dark')`＝**与 next-themes 真实换档同一条 CSS 通路**（十枚 token 就挂在 `.dark` 上），不需要 reload；

| token | 官方 `craftlight` | 本地实测（亮） | 官方 `craftdark` | 本地实测（暗） | 屏上类名（该组全部） |
| --- | --- | --- | --- | --- | --- |
| background | `#FBFBFB` | `rgb(251, 251, 251)` ✓ | `#28292B` | `rgb(40, 41, 43)` ✓ | `pre` 的 `background-color` |
| foreground | `#3D3D3D` | `rgb(61, 61, 61)` ✓ | `#CECFD0` | `rgb(206, 207, 208)` ✓ | `pre>code` 的 `color` |
| comment | `#6a737d` | ✓ | `#8b949e` | ✓ | `hljs-comment`／`hljs-punctuation`／`hljs-tag` |
| symbol | `#6f42c1` | ✓ | `#d2a8ff` | ✓ | `hljs-title class_`（双类名）／`hljs-selector-class`／`hljs-attribute` |
| literal | `#005cc5` | ✓ | `#79c0ff` | ✓ | `hljs-attr`／`hljs-variable`／`hljs-number`／`hljs-operator`／`hljs-params` |
| keyword | `#d73a49` | ✓ | `#ff7b72` | ✓ | `hljs-keyword`／`hljs-type`／`hljs-built_in` |
| string | `#032f62` | ✓ | `#a5d6ff` | ✓ | `hljs-string`／`hljs-meta`／`hljs-code`／`hljs-bullet` |
| tag | `#22863a` | ✓ | `#7ee787` | ✓ | `hljs-name`／`hljs-quote` |
| heading | `#24292e` ＋bold | ✓（粗体已读过图） | `#d2a8ff` ＋bold | ✓（与 symbol 同值＝官方本身如此） | `hljs-section`／`hljs-emphasis`（后者另带 italic） |
| deleted | `#b31d28` | ✓ | `#ffdcd7` | ✓ | `hljs-deletion` |
| —（不上色） | 无条目 | 8 枚全部继承 `#3D3D3D` ✓ | 无条目 | 8 枚全部继承 `#CECFD0` ✓ | `hljs-literal`／`hljs-strong`／`hljs-link`／`hljs-addition`／`hljs-title`／`hljs-function`／`hljs-selector-tag`／`hljs-doctag` |
⇒ ★ 两条**读过图**才得到的结论（不是数字）＝① 亮档最后八枚与前景同灰（＝"官方没着色的本地也不许上色"那条反向守卫在**像素层**成立）；② 暗档 `hljs-section`／`hljs-emphasis` 与符号组同紫 ⇒ ☆ **别当 bug 改**（官方 `craftdark` 的 `heading`／`emphasis` 值就是 `#d2a8ff`）；
⇒ ☆ 证据文件＝`_harvest/b114-local-codepalette-light.png`／`-dark.png`（各 760×726）＋ `_harvest/b114-palette-proof.json`；★ **证据等级＝CSS 层（合成 DOM），不是编辑器实景**（实景需本地栈凭据与库，见台账「十三」阻塞行）。

#### 五、☆ 一条与 §十九.一 的衔接（改判而非新增）

⇒ 上批 §十九 那张 `craftlight` 表是**按声明**录的（9 条、`deleted` 带非法 `ffeef0`）；本批**不推翻它**，只加一条限定＝**"声明表"与"有效表"在 `craftlight`／`craftdark` 两档上恰好重合**（这两档没有跨条覆盖，`link` 是"根本没定义"而不是"被覆盖"）⇒ ⇒ ★ 所以本地只做这两档时**不需要**实现 §二那套覆盖语义；一旦将来扩到 20 档，§二 这张表才是"该显示什么"的准绳。

**仍未采到（本节）**：① `Hi.markdownTable` 的转义规则（表格里出现竖线／换行时官方怎么逃）；② `isBrightColor` 阈值（`colorMode` 两值相等时怎么分 light／dark）；③ 屏上实测 §二 那 6 档"链接无颜色"（要选那几档主题并放一段链接，属官方写入面 ⇒ 需点头）；④ `#fb4934d` 那两处非法在屏上是否表现为"完全没有边框／颜色退回"（同上，且要 `gruvboxdark`）；⑤ 编辑器**实景**两档截图。

### 十九之续（第 115 批）＝**把 20 档色板的"形状来源"追到 CM6 默认样式（`v2n` 19 条逐字到手）：★ 上批数的"6 档 `link` 不上色"本批改判为 **7 档**（漏了 `githubdark`），且真正口径是"12/20 档定义了 `link`"，其成因是复制默认样式时丢了 `color` 而不是 CM6 语义；外加同一产品里两条亮度阈值第一次并排（代码底色 128／8 位整数域 vs 页面纸色 0.65／归一化域），以及本地两条 DOM 副作用（`color-scheme`／`theme-color`）确认全缺**（✓盘上 2026-10-01 05:3x–06:1x 本地＝UTC 09-30 21:3x–22:1x；★ gap 在 `gap.md` §三点一〇六五 G1213／G1217／G1223，逐字在 `longtail.md` §四十一.七，判据在 `internals.md` §五十四.一–二；☆ 上一节＝§十九之续（第 114 批）的"有效色审计表"，本节补 §十九之续（第 114 批）的一条**计数改判**、加"来源"与"阈值"，不重复审计）

#### 一、★★★ ✎ **改判上批一条计数＝"6 档 `link` 不上色"应为"7 档"，且真正的口径是"12 档定义了 `link`、其中 7 档不带色、8 档根本没有这一条"**（本批用 `_harvest/b112-styles.txt` §聚合的全量直方图复核，非抽样）

⇒ 逐字复核数据（机器枚举结果，`_harvest/b112-styles.txt` @442 行段）＝**`link` 的定义档数＝12/20**（与 `attributeName`／`escape`／`invalid`／`strikethrough`／`url` 同在一档直方）；⇒ 12 档里按"该条带不带 `color`"二分＝**7 档不带色**（`aura`／`githublight`／**`githubdark`**／`materiallight`／`tokyonightday`／`tokyonightstorm`／`tokyonight`）＋ **5 档带色**（`gruvboxdark` `#a89984`／`gruvboxlight` `#7c6f64`／`materialdark` `#56c8d8`／`nord` `#a3be8c` 四条都还带 `textUnderlinePosition`，`vscodedark` `#6a9955` 只带 `textDecoration`）；⇒ ☆ 其余 **8 档（`darcula`／`atomone`／`craftlight`／`craftdark`／`bbedit`／`dracula`／`noctislilac`／`sublime`）压根没有 `link` 条目** ⇒ 屏上效果与"条目不带色"不可分辨（都继承前景），但**机制不同**（前者＝名册里没有这一条）。
⇒ ⇒ ★★★ 上批只数了"同档内后条覆盖前条"的 6 档，漏掉 `githubdark`＝**它的 `e.link` 条目不是覆盖、而是该档唯一一条、且不带色**（逐字 `e.link -> (无) +textDecoration`，@146 行段可复跑）⇒ ☆ **规则化＝"某 tag 实际不上色"有三种成因，必须分开数**＝① 同档内被无色的后条覆盖 ② 该档唯一条目本来就无色 ③ 该档没有这一条；上批用 ① 一种当全部。
⇒ ☆ 同一条口径也适用于 `strong`（11/20 定义）与 `emphasis`（14/20）——**"名册覆盖率"不是 20/20 的 tag 有很多，报"某 tag 如何"之前必须先报"它被几档定义"**（与 `feedback-concrete-specs` 同源）。

#### 二、★★★ `v2n`（`defaultHighlightStyle`）与 20 档的形状谱系：四条"装饰型"条目是被整条搬过来的

⇒ 逐字对照（★ 官方默认样式条目 vs 名册档里的同名条目）：

| CM6 默认 `v2n` 第 N 条（逐字） | 20 档里的对应形态 | 谱系判定 |
| --- | --- | --- |
| 第 2 条 `{tag:W.link,textDecoration:"underline"}`（★ **无 `color`**） | 上述 7 档里 `link` 条目逐字＝`{tag:e.link,textDecoration:"underline"}`（★ 前 6 档是**覆盖**掉一条带色的、`githubdark` 是该档**唯一**一条） | ★★★ **同形** ⇒ 这 7 档"link 不上色"＝**照抄默认样式时把"默认本来就没色"一起抄了进来**；其中 6 档**自己本来是有颜色的**（上批审计里"覆盖前 → 覆盖后"那一列就是被丢的原色），`githubdark` 则从未给过 `link` 色 |
| 第 3 条 `{tag:W.heading,textDecoration:"underline",fontWeight:"bold"}` | 名册档普遍写成 `{tag:e.heading,...}` 但**没有 `textDecoration`**（只有粗体／颜色） | ☆ 反方向＝**默认样式有下划线、名册把它删了** ⇒ 同一份移植里既有"照抄多余"也有"照抄漏掉"，说明**逐条手改过、不是一次性复制** |
| 第 4／5 条 `emphasis`＝`fontStyle:"italic"`、`strong`＝`fontWeight:"bold"`（★ 都**无 `color`**） | 名册里 `emphasis`／`strong` 常**带颜色** | ⇒ 名册在这两条上比默认样式更"上色"，与 `link` 那条的处理方向相反（☆ 这就是为什么"link 不上色"看起来像刻意设计——它其实只在一枚 tag 上发生，而同族另两条方向相反） |
| 第 1 条 `{tag:W.meta,color:"#404740"}` 等 15 条带 hex | 20 档全部**换掉**这些 hex（档色板逐条重写） | ⇒ ☆ 谱系结论＝**名册＝"以 `v2n` 的 tag 分组结构为骨架、逐条换色"**，骨架来自默认样式 ⇒ 遇到"某条只有装饰没有色"时先怀疑骨架残留，再怀疑档设计 |

⇒ ★★ 附带一条**给采集用的判据**＝`v2n` 是 CM6 `basicSetup` 的兜底样式 ⇒ 上批"选了名册档就没有兜底 hex"那条现在有了对照物：**兜底样式自己也只给一部分 tag 上色**（`link`／`emphasis`／`strong` 三条只有装饰）⇒ ⇒ 所以"某 tag 在官方屏上是前景色"**不能直接判成缺陷**，要分三种成因（档里被覆盖／骨架残留／兜底本来如此）。

#### 三、★★ 两条亮度阈值第一次并排（同一产品、两个域、两个阈值）

| 判据 | 逐字 | 输入域 | 阈值 | 用途 | 本地对应面 |
| --- | --- | --- | --- | --- | --- |
| 代码主题底色明暗 | 第 111 批那条：三位十六进制先展开、Rec.709 加权、与 128 比 | 0–255 整数 | **128**（≈0.502） | 判一档代码主题是不是暗档（`isDark`） | ☆ 本轮实扫＝**本地没有这条**（`grep -rn "isDark" src` 零命中；本地暗档走 `.dark` class ＋ `next-themes`，`src/components/theme/ThemeProvider.tsx:8-10`） |
| 页面纸色明暗 | `function isBrightColor(e){const{r:m,g:C,b:N}=toRGB(e);return .2126*(m/255)+.7152*(C/255)+.0722*(N/255)>.65}` | 0–1 归一化 | **0.65** | 判页面背景色算 light 还是 dark（`colorMode` 三档里的非 `dynamic` 分支） | ☆ 本地无页面纸色轴 ⇒ 无面可差 |

⇒ ⇒ ★★★ **同族公式、不同阈值**（0.502 vs 0.65）⇒ 复刻时**不要合并成一个函数**：阈值差 0.15 意味着"中灰偏亮的纸色"在两条判据下结论相反（例：`#a0a0a0` 归一化 0.627 ⇒ `isBrightColor` 判**不亮**、128 判据判**亮**）。
⇒ ☆ 顺带一条＝本目录历批那条"阈值 128 判 `isDark`"是**判据、不是已落地代码**（上批建议"本地要用 `isDark`、不要吃工厂 `theme` 字面量"至今未实装）。

#### 四、★ 本地缺的两条 DOM 副作用（样式面可验证、一行量级）

⇒ 官方换档时做两件事（逐字见 `longtail.md` §四十一.九）＝① 写 `meta[name='theme-color']` 的 `content` ⇒ **浏览器标签页／地址栏随主题变色**；② 在 `<html>` 上 `style.setProperty("color-scheme","dark"/"light")` ⇒ **影响原生滚动条／表单控件配色**（与第 112 批"滚动条常量受 `isScrollbarPersistent` 门控"是同一条链下游）。
⇒ 本轮实扫＝`grep -rn "color-scheme" src` 与 `grep -rn "theme-color" src` **均零命中**（`src/app/layout.tsx:12` 只有静态 `metadata`，不随主题更新）。
⇒ ☆ **验收判据（不依赖官方通路）**＝本地开暗档后：原生滚动条是否还是亮色（`color-scheme` 缺位的直接观感）；标签页颜色是否跟随（`theme-color` 缺位）。⇒ 两条都可本地自证，属"不需要连接器、不需要点头就能验"的那类。

**仍未采到（本节）**：① 官方屏上 `theme-color` 的**实际值**（要读 meta，一条 `evaluate`，连接器阻塞）；② `color-scheme` 在官方屏上的生效证据（`getComputedStyle(documentElement).colorScheme`）；③ 20 档里 `heading` 的"删掉下划线"是否有档保留（本批只逐条比对了 `link`，其余三条靠名册抽样 ⇒ ☆ 要一次全量对照需重跑 `b114-style-precedence2.cjs` 加字段）；④ `v2n` 与 Craft 名册的 tag **分组粒度差**（默认样式把 `atom/bool/url/contentSeparator/labelName` 并成一条、名册是否同粒度未逐条比）。
