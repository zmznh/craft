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
4. 具名色与 CSS 变量的对应表（色名→色值只能从运行时或 token 表取，`tokens` 侧尚未覆盖 `style.color.*`）。
5. ~~样式面板的分区顺序~~ **已实屏结案（动态 V12）**：自定义样式 → 所有样式 → 颜色（背景 / 文档颜色 / 文本颜色）→ 封面（封面图片）→ 分隔符样式（线 / 和纸胶带 / 涂鸦）→ 字体（默认 / 高级）→ 宽页。全文见 `interactions.md` V12 与 `gap.md` G209。
