# Fund Admin Academy · Backlog（待排期需求池）

> 用法：Copilot / Lu 提出的**非本次交付范围**的增量需求登记在此，避免口头需求丢失。
> 每条注明：来源、目标、验收口径、涉及文件。排期时再决定归入哪个版本。

> ⚠️ **涉及首页 / 导航 / 信息架构的需求，一律先过 `docs/IA-PRINCIPLES.md`（Subtraction First 守则）**：
> 先删 → 再改 → 最后才加；左侧导航已有功能不得在首页重复展示；
> 首页默认只服务「继续学习」；新增必须证明现有模块无法解决。
> 该类需求登记时须附带「新增了什么 / 删除了什么 / 为什么不能只删除而必须新增」三问答复。

---

## V1.15.4 已交付（来源：V1.15.3 冒烟期发现的**既有**缺陷）

> 登记时间：2026-09-16　｜　状态：**已在 V1.15.4 修复并上线**
> 定性：**不是 V1.15.3 引入的回归** —— 线上 v1.15.2 完全同样复现，属全局状态层的既有设计问题。

### ~~P2~~ → P1 首页 hydration mismatch（React error #418）【已修复】

**复现步骤**：任意打开一讲课程（如 `/courses/aml-kyc`）→ 回到首页 `/`。
控制台报 `Minified React error #418`（Hydration failed because the server rendered HTML didn't match the client）。

**根因**（已确认）：`src/hooks/use-academy.tsx` 用 `useState(() => loadState())` —— 客户端**首帧**就按 localStorage 求值。
首页 `src/app/page.tsx` 据此渲染「最近学习 / 学习进度 / 收藏统计」，
而 SSG 出的 HTML 里这些是空态 → 客户端首帧带数据 → 两边 DOM 不一致 → React 放弃 hydration 并整树重渲染。

**实际修法（V1.15.4 落地）**：
1. Provider 首帧恒为 `defaultState()`（不再在 `useState` 初始化时读 localStorage）；
2. 布局副作用（浏览器绘制前）恢复一次，`isLoaded` 写保护 —— 恢复完成前 `saveState` 直接 return；
3. **额外堵住一个计划外竞态**：`LessonViewer` / `CaseViewer` 在挂载副作用里调
   `recordView` / `markCaseStarted`，而副作用是「子先父后」执行 —— 若恢复时直接
   `setState(loadState())`，会把刚记录的浏览/学习状态整体覆盖掉（表现为「最近学习」不再更新）。
   故写入统一走 `update()`：恢复完成前入队，恢复时以 localStorage 为基线顺序重放。
4. 文案口径：「hydrate 前的过渡态」最终选择**接受一帧默认态但用布局副作用消除可见闪动**
   （不新增骨架屏，符合「不加新功能」的 Bug Fix 定位）。

**涉及文件**：`src/hooks/use-academy.tsx`（唯一源码改动点，全部消费方自动受益）。

---

## V1.16.0 已交付（来源：2026-09-16 Lu 直接下达的 CAMS 轻量接入方案）

> 登记时间：2026-09-16　｜　状态：**已交付**（commit 见验收包）
> 范围：三项 P1 —— 课程 CAMS 标签 / CAMS 全真模拟考试 / 两门 CAMS 补强课程。

### 已交付内容

1. **课程 CAMS 标签**：`Lesson.cams?: CamsDomain[]`；课程卡片、课程详情页、课程筛选器三处展示；
   无独立 CAMS 导航、无案例 CAMS 标签（按 Lu 边界）。
2. **CAMS 模拟考试** `/cams-exam`（挂「知识检索」子项）：120 题 / 3.5 小时 / 自动计时 /
   自动评分 / 错题回顾，按官方权重 A 30% / B 20% / C 30% / D 20% 组卷。
3. **两门补强课程**：第 11 讲 AML Foundations（补 Domain A）、第 13 讲 AML Technology & Monitoring（补 Domain D）。
   （编号经 Lu 确认用空置的 11/13，12 已被 FATCA/CRS 占用。）

### 明确不做（后续若需再排期）

- ❌ CAMS 独立专区
- ❌ CAMS 案例标签
- ❌ 每日练习 / 50 题模拟
- ❌ 覆盖率仪表盘
- ❌ 第二套导航体系

---

## V1.16.1 已交付（来源：V1.16.0 验收意见）

> 登记时间：2026-09-16　｜　状态：**已交付**
> 范围：两项 P1 —— 补全 CAMS-B / CAMS-C 课程映射 · CAMS 模拟考试迁入课程中心。

### 1. 补全 CAMS-B / CAMS-C 课程域映射（P1）

**问题**：V1.16.0 上线后，课程中心顶部的 CAMS Domain 筛选只有 A / D 两域有结果，
点击 CAMS-B 或 CAMS-C 时课程为空，用户会误以为内容缺失。

**修法**：一门课程允许对应多个 CAMS Domain。映射调整为 ——

| 课程 | 本次新增 | 原有 |
|---|---|---|
| 01 一只境外基金如何运转 | CAMS-B | — |
| 02 基金结构全景 | CAMS-B | — |
| 10 AML 与投资者尽调 | CAMS-A / B / C | — |
| 11 AML Foundations | — | CAMS-A |
| 12 FATCA 与 CRS | CAMS-C | — |
| 13 AML Technology & Monitoring | — | CAMS-D |
| 16 CAMS Full Mock Exam | A / B / C / D 全覆盖 | — |

**验收实测**：CAMS-A → 2 门；CAMS-B → 3 门；CAMS-C → 2 门；CAMS-D → 1 门；
四域筛选结果均附第 16 讲模拟考试入口，**无空分类**。

### 2. CAMS 模拟考试迁入课程中心（P1）

**问题**：原挂在「知识检索 → CAMS 模拟考试」，层级语义不成立 ——
案例库 / 术语库 / 实务工具包属 Reference（查资料），模拟考试属 Learning Assessment（学习评估）。

**修法**：
- 新增第 16 讲 **CAMS Full Mock Exam**，位置排在必修区末尾（01…15 → 16），作为学习路径终点；
- 卡片显示 `120 Questions / 3.5 Hours / Auto Scoring / Pass Mark 75`，整卡可点，直达既有 `/cams-exam`
  （**未新建第二套考试系统**）；
- 左侧导航「知识检索」只保留 案例库 / 术语库 / 实务工具包；
- 首页「学习路线」末尾同步追加该节点；必修全部完成后的「下一步推荐」改为引导进入模拟考试。

**架构决策（供 Copilot 复核）**：第 16 讲**不进 `Lesson` 数据层**（它没有内容模块、没有自测题），
以独立数据 `src/data/cams/mock-exam.ts` + 独立卡片 `src/components/MockExamCard.tsx` 实现。
理由：若塞进 Lesson，`totalProgress` 的分母会多出一门永远无法「完成」的课程
（首页永远显示 `N/9 门完成`），并需要在 progress / CourseCard / LessonViewer / settings /
search / favorites / `[slug]` 静态生成等 7 处加特例分支。视觉与功能上它仍是学习路径的最后一讲。

### 明确不做（同 V1.16.0 边界）

- ❌ CAMS 独立专区 / ❌ CAMS 案例标签 / ❌ 每日练习 / ❌ 50 题模拟 / ❌ 覆盖率仪表盘 / ❌ 第二套导航

---

## V1.16.2 已交付（来源：V1.16.1 验收意见）

> 登记时间：2026-09-16　｜　状态：**已交付**
> 前置：V1.16.1 **验收通过** —— 验收方明确接受「第 16 讲不进 Lesson 数据层、不计入课程完成数」的实现
> （8 门课程 + 1 个全真模拟 = Assessment 独立于 Learning Content，比 9 门课程更符合产品逻辑）。
> 范围：两项 P1 —— CAMS Domain 覆盖均衡 · 课程中心顶部文案排查。

### 1. CAMS Domain 覆盖补强（P1）

**问题**：V1.16.1 后分布为 A=2 / B=3 / C=2 / **D=1**，虽无空分类但 D 域明显偏少。

**修法**：**只补标签、不新增课程**。

| 课程 | 调整前 | 调整后 | 依据 |
|---|---|---|---|
| 10 AML 与投资者尽调 | A / B / C | **A / B / C / D** | 含 Risk Screening / Monitoring / AML Process，与 Domain D 关联 |
| 14 Cayman 基金核心框架 | 无 | **B / D** | Cayman 监管框架 / 治理 / 持续合规 |
| 15 BVI 基金与管理人 | 无 | **B** | BVI 监管与合规框架 / 治理 |

**调整后分布**：**A=2 / B=5 / C=2 / D=3**（与验收意见给出的目标口径完全一致）。

### 2. 课程中心顶部文案排查（P1）

**问题**：出现「必修八讲」这类孤立表述，易被误解为学习路径已结束。

**修法**：全站统一为「**必修八讲 + 第 16 讲全真模拟**」口径，覆盖 5 处：

| 位置 | 调整后文案 |
|---|---|
| `/courses` 顶部说明 | 学习路径：必修八讲（01 → … → 15）→ 第 16 讲 CAMS 全真模拟（Assessment，不计入课程完成数） |
| `/courses` 必修分组计数 | 共 N 门 + 第 16 讲 CAMS 全真模拟 · 学习主线 |
| 首页 Banner 编号体系 | 01 → 02 → 10 → 11 → 12 → 13 → 14 → 15 → 16（**修掉原来「11/13 → 12」的乱序**） |
| 首页品牌区标签 | 必修 · 全真模拟 · 选修 |
| `/search` 课程范围描述 | 必修八讲 + 第 16 讲全真模拟 + 选修专题 |

**顺带修正（同类文案缺陷，P1-2 排查中发现）**：首页统计卡 `课程数` 副标原为「编号 01/02/10/11/12/13/14/15」、
实务手册 4 张卡副标原为「必修 6 课…」—— 后者自 V1.16.0 起即已过时（必修实为 8 门），
统一改为「核心八讲 · 另有第 16 讲全真模拟」与「必修八讲…」。

### 下一步（本次验收方指定主线，优先级高于继续扩展 CAMS）

1. **术语库扩容**（100–150 核心术语）
2. **Jurisdiction 属地体系**
3. **SPC / FATCA / CRS 案例补强**（详见下方 Backlog 表）

---

## V1.17.0 已交付（来源：2026-09-16 Lu 直接下达）

> 登记时间：2026-09-16　｜　状态：**已交付**
> 范围：两项 P1 —— 学习笔记分类优化（系统属性 → 知识分类）· 术语库核心术语补充。

### 1. 学习笔记分类优化（P1）

**问题**：收藏夹「学习笔记」顶部按「课程 / 案例」筛选、卡片顶部标注「课程 / 高亮 / 正常」——
均为**系统属性**，对复习知识没有帮助；用户真正需要的是「我在第几讲记了什么」。

**修法**：

| 项 | 调整 |
|---|---|
| 卡片标签 | 移除「课程 / 案例」「高亮 / 笔记」「正常」标签（异常态「部分匹配 / 失效」的提示条**保留**，避免误以为高亮仍有效） |
| 顶部筛选 | 由「全部 / 课程 / 案例」改为「**全部 + 按课程归档**」，形如 `02 基金结构全景（5）` |
| 归档规则 | 笔记产生于哪一讲即自动归入该讲，**无需用户手工分类** |
| 排序 | 分类按课程编号升序（01→02→10→11→12→13→14→15→E01…）；组内最新笔记在前 |
| 案例 / 选修 | 选修（E01–E11）与案例各自追加分类（**仅在有笔记时出现**，不显示空分类） |
| 兜底 | 课程已下线 / sourceId 无法匹配的笔记单列一组，保证记录始终可见可删 |

**数据口径**：不改 localStorage 结构（仍是 `fund-admin-academy-notes-v1`），**零迁移**。

### 2. 术语库新增 6 条（P1）

Lu 指定 2 条 + 因关联术语缺失而一并补建 4 条（构建闸门会拦截 `related` 断链）：

| 术语 | id | 分类 | Level |
|---|---|---|---|
| Side Pocket 侧袋 | `side-pocket` | Fund Operations | Advanced |
| Suspension of Redemption 暂停赎回 | `suspension-of-redemption` | Fund Operations | Advanced |
| In-kind Distribution 实物分配 | `in-kind-distribution` | Fund Operations | Advanced |
| Tax Transparent Entity 税务透明主体 | `tax-transparent-entity` | AEOI / FATCA / CRS | Core |
| Account Holder 账户持有人 | `account-holder` | AEOI / FATCA / CRS | Core |
| Partnership 合伙企业 | `partnership` | Fund Structure | Core |

**顺带修复（既有闸门缺口）**：`scripts/check-glossary.mjs` 的 `LESSON_FILES` 未包含
`src/data/lessons-cams.ts`（V1.16.0 新增该文件后未同步）→ 术语的 `courses` 若引用第 11/13 讲会被
**误判为「无效课程引用」并阻断构建**。本次已补齐。

### 明确不做 / 待定

- ❌ 不改笔记本地存储结构、不做笔记云同步、不做笔记导出（本轮只做分类口径调整）
- ⏳ 术语库扩容（100–150 核心术语）为验收方指定主线，本次先交付 2+4 条，继续扩容待排期

---

## V1.18.0 已交付（来源：V1.17.0 验收意见）

> 登记时间：2026-09-17　｜　状态：**已交付**
> 范围：两项 P1 —— 补齐「课程 → 术语」与「案例 → 术语」两条反向边，
> 与已有的「术语 → 课程」「术语 → 案例」合起来构成 **课程 ⇄ 术语 ⇄ 案例** 双向知识网络。

### 背景

V1.17.0 已实现 **术语 → 课程 / 术语 → 案例**（术语详情页的「关联课程」「关联案例」区块）。
但课程页、案例页看不到对应反向边，知识网络只有单向边：
从课程出发无法进入术语层，从案例出发同样无法进入术语层。

### 交付内容

| 项 | 实现 |
|---|---|
| 数据来源 | **复用** `buildTermRelations()`（正文自动命中 ∪ 人工指定 `courses` / `cases`）**反转**得到，**零新增维护字段** |
| 新增 API | `src/lib/glossary-usage.ts` → `buildLessonTerms()` / `getLessonTerms(id)`、`buildCaseTerms()` / `getCaseTerms(id)`；共用反转器 `invertRelations()` |
| 新增类型 | `src/lib/glossary.ts` → `RelatedTermRef`（课程/案例同构），并导出别名 `LessonTermRef` / `CaseTermRef` |
| 共用展示组件 | `src/components/RelatedTerms.tsx`（props：`title` / `hint` / `icon` / `terms`），课程页与案例页共用同一视觉语言，避免两份重复实现 |
| 展示位置 | 课程页：「学习目标」之后、「模块内容」之前；案例页：Banner 之后、正文小节之前（均为「概览 → 关联术语 → 正文」） |
| 分组 | Core → Advanced → Expert（与 `TERM_LEVELS` 同序，空组不出现） |
| 组内排序 | 按术语名升序（大小写不敏感 + 数字自然序） |
| 交互 | chip 点击跳 `/glossary/<id>` |
| 空态 | 该课 / 该案例无关联术语时**整块不渲染** |
| 响应式 | flex-wrap chips + 等级分组，390px 单列可读 |

⚠️ **口径澄清**：需求中提到的 `relatedLessons` 字段在本项目**不存在**；术语挂靠课程的实际字段是
`GlossaryTerm.courses?: string[]`（注释名 "Related Courses"），案例侧对应 `cases?: string[]`。
本次直接复用这两个现有字段，未新增任何字段，也未把术语塞进课程 / 案例数据。

### 反向识别核对（验收方指定）

课程侧：

| 课程 | 应识别术语 | 实测 |
|---|---|---|
| 02 基金结构全景 | Side Pocket / Suspension of Redemption / Partnership | ✅ 均命中（3 条均为**人工指定** `courses:["02"]`） |
| 12 FATCA 与 CRS | Tax Transparent Entity / Account Holder | ✅ 均命中（人工指定 `courses:["12"]`） |
| In-kind Distribution | （无课程挂靠） | ✅ 不出现在任何课程页，符合预期 |

案例侧：**V1.17.0 新增的 6 条术语目前均无案例关联**（`cases` 为空数组，正文也未自动命中）——
它们只挂在课程上，因此不会出现在任何案例页。这是**内容缺口而非功能缺陷**（展示层只渲染真实关联），
如需在案例页看到它们，须由后续内容批次补 `cases` 挂靠或等案例正文覆盖到相关概念。

### 覆盖统计（构建期实测，数据来自 `/api/glossary/usage`）

课程侧：

- 19 门课（必修 8 + 选修 11）**全部**有 ≥1 条关联术语
- 每课条数：最少 1（E09 ESG）· 最多 22（01 一只境外基金如何运转）· 均值 8.2
- 仅 02 / 12 两讲含人工指定术语（共 5 条），其余均为正文自动命中

案例侧：

- 29 个案例中 **28 个**有 ≥1 条关联术语（仅 Case-019 无关联，按规则整块隐藏）
- 每案条数：最少 1 · 最多 12（Case-012 / Case-028）· 均值 4.9 · 关联总数 **136 条**
- 人工指定 `cases` 的术语 22 条，覆盖 Case-001/003/004/005/006/007/008/009/016/017/018/020/021/022/023/024/025/026/027/028

### 明确不做（scope discipline）

- ❌ 不改 `lessons.ts`（锁定基线）、不在课程 / 案例数据里新增术语字段
- ❌ 不在案例库列表卡片上铺术语 chips（28 张卡片 × 最多 12 条会显著增加噪声；只在详情页展开）
- ❌ 不改「术语 → 课程 / 案例」既有区块，不做二级链路跳转（课程 ⇄ 术语 ⇄ 案例 由各页区块自然串成）
- ⏳ 未把「关联术语」加入课程页左侧目录（TOC）；如需要可单独排期
- ⏳ 检索页 `/search` 未把「关联术语」纳入索引范围（术语本身已在检索范围内）

---

## V1.19.0 已交付（来源：V1.18.0 验收后 Lu 直接下达）

> 登记时间：2026-09-17　｜　状态：**已交付**
> 范围：两项 P1 —— ①「本课关联术语」默认收起 ② 课程 / 案例**正文中的中文术语**可直接点开解释。
> 目标：术语库从「字典」升级为「知识图谱」，把 课程内容 → 术语解释 → 案例 串成连续学习路径。

### 背景

V1.18.0 打通了双向导航，但验收反馈暴露两个体验问题：

1. 「本课关联术语」是正文前的一整块卡片，02 讲一次铺 20 个术语 → 密度过高、读者直接跳过；
2. 正文里的术语**点不动**。02 讲 2.3 明写「（如侧袋、赎回门槛、暂停赎回条款）」，
   读者能看到文字，却不知道这是可查的术语 —— 术语库与课程仍是「两张皮」。

### 需求1：关联术语区块默认收起

| 项 | 实现 |
|---|---|
| 形态 | **原生 `<details>/<summary>` 折叠面板**，默认收起（不写 `open`） |
| 收起态 | `📚 本课关联术语 31 ｜ Core 20 · Advanced 11 ｜ 展开 ⌄` 单行 |
| 展开态 | 原有分组 chips（Core / Advanced / Expert）原样呈现，hint 说明移入展开区 |
| 零 JS | 不引入 React 状态 → **无 hydration 风险**（本项目对 SSG/首帧不一致极敏感）；键盘与读屏器语义自带 |

⚠️ **一致性决策（请验收方确认）**：需求只写了「本课关联术语」，但组件是课程页与案例页共用的，
案例页「本案例关联术语」**同样改为默认收起**。理由：两处是同构区块，只改一处会造成
「同样的盒子在两个页面行为不同」；若认为案例页应保持展开，删掉 `RelatedTerms` 的 `<details>` 即可。

### 需求2：正文中文术语可直接点开解释

**根因**：标注引擎 `termMatchTexts()`（`src/lib/glossary.ts`）用 `isAscii()` **硬排除中文**——
只有 `term` / ASCII `fullName` / ASCII 别名进正文标注，中文名与中文别名「只参与搜索」。
而课程正文是中文，于是 `侧袋`、`赎回门槛`、`税务透明主体` 全部无法命中。
（`ELP` / `SPC` / `VCC` 的 `term` 本身是 ASCII，V1.19.0 之前就已可点 —— 验收清单里这 3 项原本就达标。）

**改法**：给 `termMatchTexts()` 增加中文通道，**零新增字段**：

| 通道 | 参与标注的文本 |
|---|---|
| 英文（不变） | `term` + ASCII `fullName` + ASCII 别名 |
| **中文（新增）** | `zh`（规范中文名，**恒可**）+ 中文别名（**长度 ≥ 4 字**） |

**为什么中文别名要设 4 字门槛**（实测依据，见下表）：中文没有词边界，2~3 字的别名多是
口语化 / 通用表达；全量放开会把中文正文点满，反而制造新的视觉噪音 —— 这恰好与「需求1 反感信息密度」相矛盾。
规范中文名不受限，因为它承担「中文读者认术语」的主职责（`侧袋` 只有 2 字，但正是验收指定项）。

| 口径 | 02 讲正文链接数 | 命中术语数 | 典型噪音 |
|---|---|---|---|
| 现状（仅 ASCII） | 127 | 19 | — |
| 全量中文（zh + 全部中文别名） | 200 | 39 | `管理人`×13、`开放式`×6、`封闭式`×6、`分配`×5、`牌照`×2 |
| **本次采用（zh + 中文别名≥4字）** | **164** | **33** | 噪音全部消除，验收项全部保留 |

> 阈值集中在 `CH_ALIAS_MIN_LEN = 4` 一个常量（`src/lib/glossary.ts`），如需更松/更紧改一处即可。
> `scripts/check-glossary.mjs` 的撞车校验已同步到同一口径（两处必须同步改）。

**Drawer 一行代码都没改**：需求列的「定义 / Why Important / Common Mistakes / 查看完整术语」
V1.14 就已全部具备（`GlossaryProvider` 的 `DrawerContent`，底部有「查看完整术语页 →」CTA）。
本版只是让中文术语也能走到这个抽屉。

### 顺带修复：中文别名撞车（既有盲区）

- **数据**：`业绩报酬` 同时是 `carried-interest` 与 `performance-fee` 的中文别名。
  `MATCH_TEXT_TO_ID` 首写优先 → 中文通道一开就是「任意链接」。按「`zh` 头部词条优先」归 `performance-fee`
  （其 `zh` = `业绩报酬（开放式基金）`），从 `carried-interest.aliases` 移除。
  实测：`业绩报酬` 在**全部课程与案例正文中出现 0 次** → 该歧义当时零实际影响，属休眠问题。
- **闸门**：`check-glossary.mjs` 第 5 项撞车校验原先**只覆盖 ASCII**（`isAscii(a)`），
  所以这条中文歧义一直没被拦住。已扩到「ASCII + 中文」同口径，并**反向验证过**
  （临时把别名加回 → 闸门报 `[Alias Collision] 标注文本 "业绩报酬" 同时命中: carried-interest, performance-fee` 且 `EXIT=1` 阻断构建）。

### 数据统计变化（构建期实测）

| 指标 | V1.18.0 | V1.19.0 | 差量 |
|---|---|---|---|
| 术语总数 | 170 | 170 | 0 |
| 可标注文本 | 314（英文通道） | **619**（+305 中文） | +305 |
| 已入网（自动 ∪ 人工指定） | 96 / 170 = 56% | **127 / 170 = 75%** | **+31** |
| 孤立术语 | 74 | **43** | **−31** |
| 课程侧覆盖 | 19 / 19 | 19 / 19 | 0 |
| 案例侧覆盖 | 28 / 29 | 28 / 29 | 0 |
| 案例侧关联总数 | 136 | 171 | +35 |
| 02 讲关联术语 | 20 | **31** | +11 |
| 12 讲关联术语 | 15 | 15 | 0 |
| 构建页数 | 238 | 238 | 0（无新增路由） |

02 讲新增 11 条：`limited-partnership`、`closed-ended-fund`、`open-ended-fund`、`unit-trust`、`trustee`、
`board-of-directors`、**`tax-transparent-entity`**、`sfc-type-9`、`registered-fund`、`redemption`、`valuation`。

⚠️ **这是本版最重要的连带影响**：`termMatchTexts()` 同时喂给 ① 正文标注 ② `findTermMatches()` → 术语关联 / 覆盖率。
两者**刻意同源**（否则会出现「正文里能点开、术语页却不列该课」的不一致）。代价是覆盖率一次跳 +19pp，
上一版「优先补最弱类（Legal Entity 9% / Tax 9%）」的扩容依据需要按新基线重看。

正文标注量（全课程语料）：900 → **1290** 链接（+390 / +43%）。
页面级实测：02 讲正文 77 个热词（中文 26）· 12 讲 52 个（中文 4）· Case-001 45 个（中文 20）。

### 明确不做（scope discipline）

- ❌ 不改 `lessons.ts`（锁定基线）、不在课程 / 案例数据里新增术语字段
- ❌ 不改标注的视觉语言（沿用 V1.14 的虚线热词样式，颜色不变）——「不是新增一套 UI，只是扩大命中范围」
- ❌ 不新增段落级 / 全页级去重以外的抑制机制；不引入「低信号词黑名单」（用长度阈值这一条通用规则替代）
- ⏳ 未把「关联术语」加入课程页 TOC；未把关联术语纳入 `/search` 索引范围

---

## V1.19.1 已交付（Hotfix · 来源：V1.19.0 上线后 Lu 实测报障）

**性质**：纯 Bug Fix + UX 收敛，**不是新功能**。零新增字段、零新增路由、零数据变更。

### Bug 1：进页未点击即自动弹术语卡

复现：进入课程页 / 案例页 → 用户未做任何操作 → 右侧自动出现术语预览卡（如 KYC）→ 数秒后自动消失。

**根因**：`TermLink` 的**挂载副作用**调用 `registerAutoHint(termId, …)`，把术语塞进
`GlossaryProvider` 的自动提示队列；队列首个元素在 `AUTO_HINT_SHOW_MS = 3200ms` 后
显示、再 3.2s 后自动消失；`MAX_AUTO_PER_PAGE = 2` 表示每页最多自动弹 2 次。
所以「页面一打开就弹、几秒后消失」是**设计如此**，但产品上属于错误行为（用户没有触发任何操作）。

### Bug 2：Hover 即弹术语（两套交互重复）

**根因**：`TermLink` 的 `onMouseEnter` 起一个 `HOVER_DELAY_MS = 140ms` 定时器，
到点调 `requestTooltip()` 出预览卡。与 Click → Drawer 形成两套并行交互。

判断：V1.19.0 已具备「正文术语 → Drawer → 完整术语页」的完整链路，
Hover Preview 的边际价值为负 —— 干扰阅读、页面闪烁、与 Drawer 功能重复、易被误认为系统 Bug。

### 修改内容

| 文件 | 改动 |
| --- | --- |
| `src/components/glossary/TermLink.tsx` | 移除 hover 定时器 / `requestTooltip` / `dismissTooltip` / `registerAutoHint` 挂载副作用；组件收敛为「Click → `openTerm`」单一行为；`cursor-help` → `cursor-pointer` |
| `src/components/glossary/GlossaryProvider.tsx` | 删除 `TooltipCard` 组件、`TooltipState` / `RectSnap` 类型、`tooltip` state、`AUTO_HINT_SHOW_MS` / `MAX_AUTO_PER_PAGE` 常量、自动提示队列（`autoQueueRef` / `autoBusyRef` / `autoRemainRef` / `pageAutoCountRef` / `hintedTermsRef` / `prevPathRef` + pathname 重置 effect）、`registerAutoHint` / `requestTooltip` / `dismissTooltip` / `clearAutoRemain` / `pickTerm`；Context 收敛为 `openTerm` / `closeTerm` / `usageMap`。**保留** ESC 关闭 Drawer + 背景滚动锁定 + 使用位置惰性拉取。676 → 429 行 |
| `src/app/globals.css` | 删除 `.glossary-tooltip` 规则与 `glossary-pop` keyframes（仅 Tooltip 使用）；保留 Drawer 的 `glossary-slide-in` / `glossary-fade-in` |
| `src/lib/glossary.ts` | 订正文件头注释：原文写「中文别名只参与搜索，不参与正文标注」—— 该口径已被 V1.19.0 推翻，易误导后续维护 |
| `src/types/glossary.ts` `src/components/glossary/TermText.tsx` | 注释去 Tooltip 化 |
| `README.md` | V1.9 条目改为「Click-only」口径；术语维护章节订正为 170 词 × 8 类 / 18 字段 / V1.19.0 双通道匹配规则；版本号 `v1.9 Beta` → `v1.19.1` |
| `src/lib/site-config.ts` | `v1.19.0` → `v1.19.1` |

### 交互定稿（全站唯一口径）

```
Hover  → 仅视觉反馈（虚线下划线加深 + 极浅底色），不弹任何浮层
Click  → 打开右侧 Drawer（定义 / 为什么重要 / 常见误区 / 关联课程与案例 / 完整术语页）
ESC    → 关闭 Drawer
```

术语解释**只在用户点击时出现**。全站不再存在任何自动弹术语的逻辑。

### 验证口径（关键，别退回「采样法」）

「没有自动弹窗」不能用「某时刻 `querySelector` 为空」证明 —— 原自动提示 3.2s 后会自动消失，
采样点一旦错过就是**假绿**。正确做法：`addInitScript` 在 document 起点挂 `MutationObserver`，
把**任何一次** `.glossary-tooltip` / `[role=tooltip]` 节点的插入累加计数，
最终断言计数 `=== 0`，观察窗取 4.5s（> 3.2s）。

### 明确不做（scope discipline）

- ❌ 不改 `lessons.ts` / 案例数据 / 术语数据（本版 0 条术语增删改）
- ❌ 不改 Click → Drawer 链路本身（Drawer 内容、`/glossary/[id]` 详情页、`/api/glossary/usage` 全部不动）
- ❌ 不新增「首次进入引导 / 新手提示」等替代性自动浮层（同一产品错误换皮，不做）
- ❌ 不调整已交付的 V1.19.0 中文标注范围与阈值（与本次交互收敛无关）

---

## V1.20.0 已交付（来源：2026-09-17 Lu 直接下达）

**主题：课程编号重构 —— 展示编号连续化 01–09（纯展示层，数据主键零改动）**

### 背景与问题

课程主键 `lesson.id` 是历史遗留编号（`01 / 02 / 10 / 11 / 12 / 13 / 14 / 15`），
它同时充当进度 key、收藏 key、`data-reading-scope`、笔记 `sourceId`、
术语 `courses` 字段、路由 SSG 参数 —— **是数据主键，不能改**。
但它此前被**直接当展示编号渲染在全站 10 处**，对新用户不直观：
序号跳号（02 之后直接 10）、且模块标题前缀（`3.1` / `4.1`）与卡片编号
（14 / 10）根本对不上。

### 两层编号拆分（本版核心设计）

| 层 | 值 | 来源 | 可变性 |
|---|---|---|---|
| 数据主键 `lesson.id` | `01/02/10/11/12/13/14/15` | 课程数据文件 | **永不改**（URL/进度/收藏/笔记依赖） |
| 展示编号 | `01`…`08` | `lib/lesson-number.ts` 由 `orderedLessons` **下标派生** | 加课自动重排 |

新增单一数据源 `src/lib/lesson-number.ts`（`displayNumber` / `displayLabel` /
`displayTag` / `displayBadge` / `displayTitle` / `modulePrefix` / `resolveStoredTitle`），
**不新增任何数据字段**，全站 10 处渲染点统一改调它。

### 新编号映射

| 展示编号 | 数据主键 id | slug（URL 不变） | 课程 | 模块前缀 |
|---|---|---|---|---|
| 01 | `01` | `fund-lifecycle` | 一只境外基金如何运转 | 1.1–1.5 |
| 02 | `02` | `fund-structure` | 基金结构全景 | 2.1–2.5 |
| 03 | `10` | `aml-kyc` | AML 与投资者尽调 | 4.x → **3.1–3.5** |
| 04 | `11` | `aml-foundations` | AML Foundations | 11.x → **4.1–4.4** |
| 05 | `12` | `fatca-crs` | FATCA 与 CRS | 5.1–5.5 |
| 06 | `13` | `aml-technology-monitoring` | AML Technology & Monitoring | 13.x → **6.1–6.4** |
| 07 | `14` | `cayman-framework` | Cayman 基金核心框架 | 3.x → **7.1–7.5** |
| 08 | `15` | `bvi-fund-manager` | BVI 基金与管理人 | 6.x → **8.1–8.5** |
| 09 | （非 Lesson） | `/cams-exam` | CAMS Full Mock Exam | — |

模块标题前缀共重排 **23 处**（14→7.x、10→4.x→3.x、15→6.x→8.x、11→11.x→4.x、13→13.x→6.x）。

### 改动清单

**新增**
- `src/lib/lesson-number.ts` — 编号单一数据源
- `scripts/check-lesson-numbers.mjs` — 构建期闸门（接入 prebuild），5 项校验：
  ① URL 冻结（8 门必修 slug 必须等于冻结表）② 展示编号连续唯一
  ③ 模块标题前缀 === `modulePrefix()` ④ 模拟考编号 === 必修数 + 1
  ⑤ id 与模拟考编号不撞号

**渲染点（10 处 → 全部改调 displayNumber 系）**
- `components/CourseCard.tsx` 卡片编号块
- `components/LessonViewer.tsx` 面包屑 / 模块眉标 / 上下一讲 / `sourceTitle`
- `components/MockExamCard.tsx`（读 `camsMockExam.id`）
- `components/LessonToc.tsx`（无编号，未改）
- `components/search/SearchClient.tsx` 课程命中编号块 + 模块命中副标
- `components/favorites/FavoritesApp.tsx` 收藏 tag / 笔记分组 label / 笔记卡片标题解析 / 编辑器下拉
- `components/glossary/GlossaryProvider.tsx` Drawer「相关课程」徽标
- `app/page.tsx` 学习路线 / 继续学习 / 最近学习 / 下一步推荐 / 学习建议
- `app/courses/page.tsx` 路径文案 + 分区计数
- `app/courses/[slug]/page.tsx` metadata title
- `app/glossary/[id]/page.tsx` LessonBadge
- `app/settings/page.tsx` 课程体系列表
- `app/cams-exam/page.tsx` + `components/cams/CamsExam.tsx` 面包屑（读 `CAMS_MOCK_EXAM_ID`）

**数据/配置**
- `src/data/cams/mock-exam.ts` — `CAMS_MOCK_EXAM_ID` `"16"` → `"09"`
- `src/data/lessons.ts` / `lessons-cams.ts` — 模块标题前缀 23 处 + 编号约定注释
- `src/lib/ordering.ts` — 注明「本数组顺序 = 全站展示编号唯一来源」
- `src/lib/notes.ts` — `NoteGroupCourse` 新增可选 `label`，分组标签改用它
- `package.json` — prebuild 前置 `check:lesson-numbers`
- `src/lib/site-config.ts` — `v1.19.1` → `v1.20.0`

### 旧数据免迁移（关键验收项）

`sourceTitle` 是**存进 localStorage 的数据**，历史笔记里写的是旧编号
（如 `"14 Cayman 基金核心框架"`）。本版**不做数据迁移**：

- 笔记归档靠 `sourceId` 匹配 → 归档行为不变；
- 笔记卡片标题改由 `resolveStoredTitle()` **显示时按 sourceId 回查课程表重算编号**
  → 旧笔记自动显示 `07 Cayman 基金核心框架`，回查不到（孤儿/案例笔记）时退回存储值；
- 新写入的 `sourceTitle` 用 `displayTitle()`（存新编号）。

进度 / 收藏 / 高亮锚点全部靠 `lesson.id`，**完全不受影响**。

### 明确不做（scope discipline）

- ❌ 不改 `lesson.id`、`slug`、任何 URL（`FROZEN_URLS` 闸门锁死）
- ❌ 不改进度 key（`moduleKey` = `14/m1`）、收藏 key、`data-reading-scope`（`14-m1`）
- ❌ 不改术语 `courses` 字段（`["12"]` 等引用的是 id，非展示编号）
- ❌ 不写任何 localStorage 迁移代码
- ❌ 不改案例库的 `module: 1`（那是 **ICS Module 号**，与课程编号体系无关）
- ❌ 不改案例正文的「02.2 KYC/CDD 操作手册」引用（**ICS 内部知识库文档编号**，
  见 `docs/CASE-LIBRARY-SPEC.md`，与站内课程编号无关 —— 曾误判为课程引用，已排除）
- ❌ 不收录/改动任何课程正文内容

### 踩坑记录（写入 ENV-NOTES）

- **同一文件并行 Edit 会互相覆盖**：Edit 是「读盘 → 改 → 写盘」，同文件多个并行调用
  最后一个写入者胜，前面的静默丢失。本版在 `LessonViewer.tsx` 上实测丢了 4 处编辑
  （只有 1 处存活），改用「单进程一次性读改写」修正。**教训：同文件多处修改必须串行或合并成一次写入。**
- grep 出来的「漏点」**必须先判断归属**：`{cs.id}` 是案例号、`module: 1` 是 ICS Module 号，
  都不是课程编号 —— 机械替换会把 29 个案例的引用改坏。

### 统计差量

| 指标 | V1.19.1 | V1.20.0 | 差量 |
|---|---|---|---|
| 必修展示编号 | 01/02/10/11/12/13/14/15 | 01–08 连续 | 跳号消除 |
| 模拟考展示编号 | 16 | 09 | −7 |
| 模块标题前缀失配 | 4 讲失配（14/10/15/11/13） | 0 | 全部对齐 |
| 渲染点改调编号派生 | 0 | 10 处 | — |
| 构建期闸门 | 1（术语） | 2（+编号） | +1 |
| 数据主键/slug 改动 | 0 | **0** | 无 |
| localStorage 迁移 | — | **无** | — |

---

## V1.20.1 已交付（来源：2026-09-18 Lu 直接下达 · P0）

**主题：首页重构 —— 从「课程主页」升级为「基金行政知识工作台」**

### 背景与问题

平台已从「8 讲课程」长成含课程、术语库、案例库、案例工坊、实务工具包、
CAMS 认证备考、全真模拟的**综合知识平台**，但首页信息架构仍是课程网站的：
顶部 Banner 写的是「课程编号体系：01 运转 → 02 结构 → 10 AML → …」，
统计区只统计课程体量（模块数 / 风险提示数 / 自测题数），
站点最核心的检索能力在首页**完全没有入口**，术语库 / 案例库 / 工具包
在首页无任何露出。新用户看到的仍是「一个课程站」。

### 交付内容

| 板块 | V1.20.0 及以前 | V1.20.1 |
|---|---|---|
| Hero | 「学习概览」标题 + 课程编号体系说明 | 「Fund Admin Academy」+ 副标题「境外基金行政、AML/KYC 与合规运营知识平台」+ 平台能力简介 + **8 个能力关键词** + 「继续学习」「进入知识搜索」双按钮 |
| 知识检索 | **无首页入口** | **新增首页搜索框**：4 个范围 chip（课程 / 术语 / 案例 / 实务工具包）+ 示例词，提交直达 `/search?q=&scope=` |
| 学习概览 | 总进度环 + 课程数 / 模块数 / 风险提示数 / 自测题数 | **个人数据 4 项**：已完成课程（进度环）/ 已收藏内容 / 学习笔记 / 模拟考试记录 |
| 知识资产 | 无 | **新增**：课程 19 · 术语 170 · 案例 29 · Checklist 111 · Common Mistakes 63 · Documents To Check 81 · Escalation Triggers 66 |
| 快捷入口 | 无 | **新增六张卡**：课程中心 / 术语库 / 案例工坊 / 实务工具包 / CAMS 专区 / 全真模拟 |
| 内测状态卡 | 顶部 | 移至页尾（内容不变） |
| 「学习中心说明」卡 | 有 | 删除（内容已并入 Hero 简介，免责声明保留在 Hero 底部） |

### 数据层新增（两处，均为「补既有的洞」而非新功能堆叠）

1. **`src/lib/exam-records.ts`** —— 模拟考试记录持久化。
   这是 V1.16.0 起挂账的 **P2「考试进度持久化」**：`CamsExam` 此前是纯会话内的，
   交卷后离开页面即丢失，首页无从展示「模拟考试记录」。
   独立 storage key `fund-admin-academy-exam-records-v1`，最多保留 20 条，
   记录得分 / 用时 / 分域正确率 / 是否通过；挂载后回读（首帧空值，防 #418）。
   写入点放在 `phase === "result"` 的 effect 里，**同时覆盖手动交卷与到时自动交卷**两条路径，
   `recordedRef` 保证一场考试只落一条。
2. **`src/lib/knowledge-assets.ts`** —— 知识资产统计（**服务端专用**）。
   案例数量必须服务端算（`@/lib/cases` 依赖 `node:fs`），故首页拆成
   「服务端 `page.tsx` 装配 → 客户端 `HomeDashboard` 渲染」两段。
   这同时让首页首次可以自持 `metadata`（此前 `"use client"` 无法导出 metadata）。

### ⚠️ 统计口径变更（需验收确认）

首页「实务手册」四类数字由 **必修八讲范围** 改为 **全站课程范围**（与「知识资产」
的定位一致，也与同模块的课程 / 术语 / 案例口径统一）：

| 指标 | 旧口径（必修八讲） | 新口径（全站） |
|---|---|---|
| Checklist | 53 | **111** |
| Common Mistakes | 30 | **63** |
| Documents To Check | 37 | **81** |
| Escalation Triggers | 31 | **66** |

**这是口径变更，不是数据变更** —— 数据一条没动，选修 11 门课程的实务手册内容
此前从未在首页被统计过。若希望回到必修-only，改 `knowledge-assets.ts` 的聚合数组即可。

### 设计决策（已与 Lu 确认）

- **「已掌握术语」按 Lu 指示删除**，首页不做术语掌握度（状态层本无此概念）。
- **「CAMS 专区」入口指向 `/cams-exam`**（Lu 指定）。注意：第六张卡「全真模拟」同指该页，
  两张卡会指向同一目标 —— 见下方 P2-1。
- **「案例工坊」指向 `/backlog`**（与侧栏命名严格一致）。
- **「实务工具包」沿用站点既有用户可见文案**（`/toolkit` 的对外名称），
  产品需求里写的「实务手册」在本站是**课程内的 Practical Guide 区块**（每讲正文里的
  checklist / commonMistakes / documentsToCheck / escalationTriggers），
  它不是独立页面，故六张卡中不设「实务手册」入口；其四类条数改由「知识资产」模块承载。

### 统计差量

| 指标 | V1.20.0 | V1.20.1 | 差量 |
|---|---|---|---|
| 首页板块数 | 8 | 10（+知识检索 +知识资产 +快捷入口，−学习中心说明） | — |
| 首页搜索入口 | 0 | 1（4 范围深链） | +1 |
| 学习概览指标 | 5（进度环 + 4 内容统计） | 4（个人数据） | −1 |
| 知识资产指标 | 0 | 7 | +7 |
| 快捷入口卡片 | 0 | 6 | +6 |
| 新增 storage key | 0 | 1（考试记录） | +1 |
| 新增 lib 模块 | 0 | 2（exam-records / knowledge-assets） | +2 |
| 新增 metadata | 无（首页是 client 组件） | 有 | — |
| 构建产物页面 | 238 | 238 | 0（无新增路由） |
| localStorage 迁移 | — | **无** | — |

### 待验收确认

- **P2-1「CAMS 专区」与「全真模拟」同指 `/cams-exam`**：按 Lu 指定实现，但两张卡
  落点重复。建议后续二选一：① 合并为一张卡；② 新建轻量 `/cams` 专区页
  （四域蓝图 + 覆盖课程 + 备考路径）承接「CAMS 专区」。
- **P2-2 统计口径变更**（见上表）：确认「全站」是否符合预期。

## V1.20.2 已交付（来源：2026-09-18 Lu 直接下达 · P1）

**主题：首页简化 —— 从「知识工作台」回归「学习驾驶舱」**

### 背景

V1.20.1 把首页从「课程主页」推成「基金行政知识工作台」，一次加了六块平台视角
内容（知识检索入口 / 知识资产 / 快捷入口 / 学习路线 / 学习建议 / 内测状态卡）。
上线后产品判断：**信息量过大，「管理员视角」的陈列弱化了首页最核心的功能「继续学习」**。
知识检索、案例库、术语库、工具包等能力本就可从左侧导航进入，首页无需重复展示。

### 调整清单

| 板块 | V1.20.1 | V1.20.2 |
|---|---|---|
| Hero | 标题 + 副标题 + 平台能力简介 + **8 个能力关键词** + 「继续学习」「进入知识搜索」双按钮 | **瘦身版**：标题 + 一句副标题 + **当前学习进度（百分比 / 进度条 / 门数 / 模块数）** + 「继续学习」单按钮。删除能力关键词、平台介绍文案、知识搜索按钮 |
| 学习概览 | 个人数据 4 项 | **保留，作为首页核心模块**（内容零改动） |
| 下一步推荐 | 有 | **保留**（内容零改动） |
| 最近学习 | 有 | **保留**（内容零改动） |
| 知识检索（首页搜索框） | 有 | **删除**（能力保留在 `/search`，含深链 `?q=&scope=`） |
| 知识资产（7 项统计） | 有 | **删除** |
| 快捷入口（6 张卡） | 有 | **删除** |
| 学习路线（9 项） | 有 | **删除**（课程中心本就有完整路线） |
| 学习建议 | 有 | **删除** |
| 内测状态卡 | 页尾 | **迁移至 `/settings`** |

### 设计原则（Lu 定稿）

> 首页 = 学习驾驶舱（Learning Dashboard），不是知识平台宣传页。
> 知识检索、案例库、术语库、工具包等功能继续通过左侧导航进入即可，不需要在首页重复展示。

首页只回答三个问题：① 我现在学到哪了 ② 接下来该学什么 ③ 我最近在学什么。
（Hero 新增的「当前学习进度」正是为 ① 服务——原 V1.20.1 把进度只放在「学习概览」里，
Hero 反而被平台文案占满。）

### 实现要点

- `src/app/page.tsx` 不再装配知识资产，但**保持 Server Component**：
  `"use client"` 文件不能导出 `metadata`，首页 metadata 依赖它。
- 内测状态卡迁入 `/settings`，复用既有 `siteConfig.statusCard`，**零新数据**。
  首页 Hero 右上角的「内测版 vX」徽标保留（轻量全局版本指示，非状态卡模块）→ 见 P3-2。
- ⚠️ `src/lib/knowledge-assets.ts` 与 `src/components/home/HomeSearch.tsx`
  **保留在仓库但当前零引用**（不做删除，便于回退）→ 见 P3-1。
- Hero 底部的免责声明短句一并删除（全站 footer 已有 `siteConfig.footerDisclaimer`，
  `/settings` 也已说明数据存本机）。

### 数据 / 能力影响

| 项 | 变化 |
|---|---|
| 路由 | 0（无新增 / 无删除） |
| 数据主键 / URL | 0 改动 |
| localStorage | 0 迁移（含 V1.20.0 时代旧数据） |
| 术语 / 案例 / 工具包数据 | 0 改动 |
| 首页 HTML 体积 | 43885 B → **21146 B（−52%）** |
| 首页 `<section>` 数 | 9 → **4** |

### 测试资产变更

- 新增 `v1202-smoke.mjs`：A Hero 瘦身 / B 板块集合 / C 学习概览 / D 下一步推荐与最近学习 /
  E 内测卡迁移 / F 既有能力 / G 稳定性。
- **`v1201-smoke.mjs` 退役**：它断言的是 V1.20.1「知识工作台」结构，其中
  知识资产 / 快捷入口 / 学习路线 / 学习建议 / 内测卡 / 首页搜索框已被本版按产品决策移除。
- `v1200-smoke.mjs` 的 B 组由「首页学习路线编号」改点 Hero / 下一步推荐
  （编号能力未变，只是承载页面从首页搬到了课程中心）。

### 待验收确认

- **P3-1**：`knowledge-assets.ts` / `HomeSearch.tsx` 是否清理（当前保留、零引用）。
- **P3-2**：Hero 右上角「内测版 vX」徽标是否一并移除（本次保留）。
- **P3-3**（既有，非本版引入）：`/settings` 的「课程体系」列 8 门必修，
  与课程中心 01–09（含第 09 讲模拟考）口径不一致。

---

## V1.20.3 已交付（来源：2026-09-20 Lu 直接下达 · 案例内容优化）

**主题：Case-028「AML Audit Coverage」案例主线收敛 —— 做 AML ≠ 审 AML**

### 背景

案例复盘发现：Case-028 把四个层次的知识点（AML Operations / AML Monitoring /
AML Governance / AML Audit）同时铺在一个场景里，**主线不突出**。学员读完后最典型的
疑问是「Administrator 已经做了很多 AML 工作，为什么还不算 AML Audit？」——
说明案例没有先把「执行」与「独立验证」的分界讲清楚。

### 七项调整（Lu 建议 → 落地位置）

| # | 建议 | 落地 |
|---|---|---|
| 一 | 核心概念区（做 AML ≠ 审 AML + 记账 / 开车 / 经营公司类比） | `# 场景背景` 内首块「## 本案例只讲一个概念」 |
| 二 | 三层防线图（执行 / 监督 / 独立验证） | `# 场景背景` 内「## 三层防线：谁在做什么」（```text 流程图） |
| 三 | 重写案例背景（减少监管术语 + 董事会视角 + 明确待解问题） | `# 场景背景` 内「## 案例背景」 |
| 四 | 错误理解 vs 正确理解 | `# 场景背景` 内「## 错误理解 vs 正确理解」 |
| 五 | 标准答案 Q1 增补「关键区别」 | `# 标准答案` Q1 新增 Evidence vs Independent Conclusion |
| 六 | 新增实务场景（500 KYC / 100 周期审查 / 全部制裁筛查） | `# 场景背景` 内「## 实务场景」 |
| 七 | 重写 Takeaway（瘦身，去双语） | `# Takeaway` |

### ⚠️ 一条边界（重要）

**建议三只改了「表述」，没有换「场景」。** 案例的 ICS SOP 依据 = `Audit Coverage` 7 条
（服务商 / 集团层面证据只能支持、不能替代基金层面结论），Q2 / Q3 与它强绑定。
若换成「Administrator 提交 AML 执行报告」，Q2 / Q3 与 7 条 SOP 依据会同时失去依据
（项目硬规矩：**标准答案必须依据 ICS SOP，不得臆造**）。故按「保留主线 + 重写表述」执行。

### 结构约束（案例渲染契约）

`docs/CASE-LIBRARY-SPEC.md` 规定正文**只允许固定的一级小节、标题不可改、不可新增**。
七项建议中的 5 个新区块因此全部落在既有小节**内部**（用 `##` 子标题），
一级小节仍为 8 个（Module 5 案例惯例，不含「已收到资料 / 缺失资料」）。

### 其他改动

- `estimatedTime` 12 → **15**（正文 +22%）；`tags` 新增 `Three Lines of Defense`
- Takeaway 原有**双语 Key Takeaway**（全库仅此一例）已移除，与 Case-027 / 029 / 012
  的中文短句口径统一
- `src/lib/site-config.ts` 版本 → **v1.20.3**
- `docs/CASE-LIBRARY-SPEC.md` 进度行由「10/26（2026-09-08）」更新为「13/29（2026-09-20）」

### 交付

commit + push + Vercel 自动部署；验收包 `acceptance/v1.20.3/`；
冒烟 `v1203-smoke.mjs` **50 PASS / 0 FAIL**（本地 + 线上）；tsc / lint / 两道闸门 / build 全绿。

### 待验收确认

- **P3-1**：本版给了版本号 V1.20.3（你的需求原文未带版本号）。若视为纯内容修订、不需要
  独立版本，回退只需改 `site-config.ts` 一行。
- **P3-2**：`场景背景` 内新增 5 个子块后，子块标题用 `##`（16px / 粗体），
  与小节标签（16px / 粗体 + 灰色 hint 后缀）视觉层级接近。是否把子块降为 `###`（15px）？
- **P3-3**（既有，非本版引入）：`docs/CASE-LIBRARY-SPEC.md` §5 的 Skills 受控词表（20 项）
  与案例实际 `skills` 不一致 —— Case-027 / 028 / 029 共 6 个 skill 名不在词表内
  （如 Outsourcing Oversight / Evidence Assessment / Transaction Review）。
  按规范「词表外的项不计入分组」，这三例在 `/skills` 不会归组。修法是扩词表或改标，属独立版本。

---

## V1.20.4 已交付（来源：2026-09-20 Lu 直接下达 · 案例答案区优化 P1）

**主题：案例答案区「题干常显 + 答案默认折叠」**

### 背景

案例详情的「标准答案」小节原先**直接摊开全部答案**，学员进入案例即被剧透；
且看 Q2/Q3/Q4 的答案时往往已忘记题目，需要来回滚动到上方对照，学习体验差。

### 需求（Lu 原文的 4 条实现原则）

| # | 原则 | 落地 |
|---|---|---|
| 1 | 问题始终显示 | 每题卡片折叠条常显题号 + **题干全文**（含选项） |
| 2 | 答案默认折叠 | 原生 `<details>`，首帧即收起（**零 JS state / 零 storage 读取**） |
| 3 | 点击后展开答案 | 点折叠条展开，按钮文案翻转为「收起答案」 |
| 4 | Q1–Q4 独立展开/收起 | 每题独立 `<details>`，互不影响 |

### Lu 定的两处边界（AskUserQuestion 确认）

1. **折叠范围 = 答案区四节全收**：「标准答案」逐题折叠 + `理由分析` / `常见错误` / `ICS SOP依据` 整节收起。
   `场景背景` / `你的判断` / `客户沟通示例` / `Takeaway` 保持展开。
   （若只收标准答案，「理由分析」仍会把答案推理摊给学员 —— 不彻底。）
2. **卡片留在「标准答案」小节**，不改「你的判断」。
   → 关键原因：阅读高亮/笔记的块级锚点是 `${案例id}-${小节key}-${标签}${序号}`，
   **答案正文跨小节搬迁会让用户已存的划线/高亮全部漂位**。留在原小节 + 题干进折叠条，
   同样做到「题目与答案同屏」，且锚点零漂移。

### 改动

- **新增 `src/lib/case-answers.ts`**：把「你的判断」与「标准答案」按题号切成 `{ q, question, answer }[]`。
  **同时支持两套历史格式**（`## Qn` 子标题 / `**Qn. …**` 行内加粗）。
  ⚠️ 安全策略：题号数量或序列不一致 → 返回 `[]`，渲染层**退回整节原样渲染，绝不丢内容**。
- **新增 `src/components/cases/CaseAnswerDeck.tsx`**：逐题折叠卡片。
  用原生 `<details>`（React 19 下**不可能触发 #418**，因为不存在首帧/回填差异）。
  ⚠️ `summary` 内**只放 span/div、不放 p/li/blockquote** —— 否则会给高亮锚点插队、导致漂移。
- **`CaseViewer.tsx`**：`standard_answer` 走卡片；三个「答案推理类」小节整节 `<details>` 收起。
- **`HighlightEngine.tsx`（配套修复）**：`?hl=` 跳转定位前先 `openAncestorDetails()` ——
  否则目标高亮落在收起的小节内时，`scrollIntoView` 会滚到空白处、用户看不到闪烁。
- **`docs/CASE-LIBRARY-SPEC.md`**：新增写作约束 #6（两小节题号序列必须一致）+ §七「答案区默认折叠」能力行。

### 验证

- **锚点零漂移（硬证据）**：改造前后同口径采集 Case-028 / Case-001 / Case-029 的
  `data-reading-scope` 块锚点 —— **26 个作用域 / 296 个锚点，序列完全一致**。
- 另注入一条落在「标准答案」内的 `?hl=` 高亮记录：跳转后**恢复状态 = active**
  （Tier 1 锚点精确命中），且**所在答案卡片被自动展开** —— 端到端证明不漂移。
- 冒烟 `v1204-smoke.mjs`：**本地 59 PASS / 0 FAIL**。
- 案例正文 **一行未改**（纯渲染层改动）；13 个已导入案例全部正确切题（4 题 / 5 题两种）。

### ⚠️ 一条测试口径教训（已写入 ENV-NOTES / playwright-ui-smoke skill）

判 `<details>` 收起态下内容是否可见，**必须用 `el.checkVisibility()`**：
收起态的 `getComputedStyle().display` 仍是 `"block"`、`getBoundingClientRect().height`
仍有非零值（实测 439px），用它们是**假绿**。另：`localStorage` 里手写高亮记录时
`noteId` 必须匹配 `/^Note-\d{3,}$/`，否则整条被 `loadNotes()` 静默丢弃（我第一版夹具就踩了）。

### 待验收确认

- **P3-w**：折叠条上的题干显示**全文**（含 A/B/C/D 选项）。好处是展开答案时无需回看上方；
  代价是与上方「你的判断」区存在一次文本重复。若你更想只显示**首句**（选项仅在上方出现），
  改一行即可。

---

## V1.20.5 已交付（来源：2026-09-20 Lu 直接下达 · 术语自动发现 P1）

> 登记时间：2026-09-20　｜　状态：**已交付**
> 需求原文要点：**不新增独立模块**；位置「管理后台 → 术语库」；增加「已发布术语 / 待审核术语」；
> 课程导入时自动扫描专业术语；发现术语库中不存在的术语后进入【待审核术语】列表；
> 后台显示 **术语名称 / 来源课程·案例 / 发现时间**；管理员可 **导入术语库 / 忽略**。
> 原则：**不新增独立导航模块，避免后台越来越复杂。**

### 一处必须先讲清的前提

站点一级导航为 学习概览 / 课程中心 / 知识检索 / 案例工坊 / 收藏夹 / 设置，**并不存在「管理后台」**。
本版按 Lu 在选项中的裁决，把审核视图**落进术语库页本身**（`/glossary` 第三页签），
即字面意义上的「管理后台 → 术语库」，同时满足「不新增独立导航模块」。
（术语库页在 V1.15.2 就已有「术语列表 / 健康度 Dashboard」双页签，第三页签是同一模式的延续。）

### 同一逻辑在 V1.14.0 做过、V1.15.2 被删

`src/lib/missing-terms.ts`（「待补充术语池扫描」）随「知识工坊」下线一并删除。
**但数据层与导入链路当时被刻意保留**：`content/glossary/imported.json` → `npm run gen:glossary`
→ `src/data/glossary/imported.ts` → 全站生效。
本版是**恢复被删逻辑 + 换落点 + 补双列表**，不是从零造。

### 交付内容

| # | 需求项 | 落地 |
|---|---|---|
| 1 | 位置：术语库内，不新增导航模块 | `/glossary` 第三页签「术语审核」；一级导航 6 项未变 |
| 2 | 已发布术语 | 审核页内「已发布术语」分段：紧凑检索表（术语 / 中文 / 分类 / 关联课程 / 关联案例 / 详情） |
| 3 | 待审核术语 | 「待审核术语」分段：候选池列表 |
| 4 | 自动扫描（构建期） | `scripts/scan-term-candidates.mjs` 挂进 prebuild；扫描 **275 篇语料**（课程 128 / 案例 147） |
| 5 | 术语名称 | 行内术语名 + 置信档徽标 |
| 6 | 来源课程 / 案例 | 行内来源标签（可点进来源，最多 3 个 + `+n`） |
| 7 | 发现时间 | 行内 `YYYY-MM-DD`，取自产物 `firstSeenAt`（**跨构建稳定**，签名未变则复用） |
| 8 | 导入术语库 | 采纳 → 「已采纳」清单 → **生成术语补全包**（含上下文 + 14 字段骨架）→ 交 Copilot 落 `imported.json` |
| 9 | 忽略 | 本机记录归一 key 移出队列；「已忽略」视图可随时恢复 |

### 扫描器口径（三档置信度）

- `declared` 正文声明（「中文名（缩写）」/「缩写（英文全称）」）—— 精度最高
- `acronym` 中文语境中的 2~6 位全大写缩写 —— 精度高
- `phrase` 中文语境中的首字母大写词组 —— 含人名 / 通用词误报，需人工判断

**最有效的过滤是「中文语境」规则**（候选 ±30 字符内必须有 CJK）：中文夹英文才叫术语，
整段英文（客户邮件 / 英文 SOP 引用）里的 `Kindly` / `Verify` / `Please` 由此整类滤掉。
另叠加占位符（`ABC` / `XYZ` / 连续字母）、地名货币（`HK` / `USD`）、公司后缀（`…Pte Ltd`）剔除。
术语库已有的词不会重复冒出 —— 挖空用的是**与页面标注同一套**术语引擎。

**边界**：只发现英文与缩写，**中文术语不做自动发现**（无词典兜底，误报率不可控）。

### 实测产出（本次扫描）

| 档 | 数量 | 样例 |
|---|---|---|
| 正文声明 | **11** | CFIUS / SAR / PIF / TBML / ATL / BTL / BSA / SRI / BO / ML / TF |
| 缩写 | **31** | OFC(9篇) / ESG(6) / ERISA(6) / LPF / NFE / AIV / PPOC / SFDR / PFIC / OFAC / TCSP … |
| 词组 | **73** | Reference Letter(11篇) / Mutual Fund(8) / Private Investment Fund / Approved Manager … |
| **合计** | **115** | 高置信（声明 + 缩写）= **42** |

### 顺带修复：导入链路的两处既有硬伤（非本需求，但挡在关键路径上）

1. **`build-glossary-import.mjs` 从不产出 `level` 字段** —— 而 `GlossaryTerm.level` 必填、
   `check-glossary` 也校验该枚举。也就是说 `imported.json` 一旦真放进术语，`tsc` 会直接失败。
   自 V1.14.1 加 `level` 起该链路即为坏的。本版补上（缺省 `advanced` + 告警）。
2. **必填内容缺失时照常输出条目** —— `whyImportant` / `scenario` / `aliases` / `related` / `tags`
   为空会产出残缺条目，且 `check-glossary` 显式跳过 `imported.ts`、没有任何环节会拦。
   本版改为**跳过该条 + 告警**，保证一份不完整的 `imported.json` 不会把构建弄红。

已端到端实测：完整条目 → 导入 1 条、`check:glossary` 170 条 0 错、`tsc` 0 报错、运行时
`GLOSSARY_TERMS = 内置 ∪ IMPORTED_TERMS`；残缺条目 → 跳过并给出逐项告警。

### 验证

tsc 0 / lint 0 / `check:lesson-numbers` 通过 / `check:glossary` 通过（170 条）/ build **238 页**
· 冒烟 `v1205-smoke.mjs` **本地 66 PASS / 0 FAIL**（含刷新后本机状态保持、390→1920 无水平溢出、
无控制台错误 / 无 #418、一级导航未新增条目、默认页签术语列表 170 条零变化）
· 截图 **14 张本地 + 5 张线上，md5 全唯一**
· 扫描器**幂等**：连跑两次产物 md5 一致，构建不再污染 git 工作区

### 待验收确认

- **P3-甲**：`check-glossary.mjs` 显式跳过 `imported.ts`（`f !== "imported.ts"`），
  即导入术语**不走内建的 14 字段闸门**。本版用「导入脚本自查 + 跳过告警」兜住，
  但闸门是否应覆盖导入层，属独立决定。
- **P3-乙**：「已发布术语」视图与「术语列表」页签、健康度 Dashboard 有信息重叠
  （多了关联课程 / 案例计数）。若判定价值不足，按 Subtraction First 应删。
- **P3-丙**：词组档精度约六成（人名 / 通用词混入）。更强的收紧手段会误杀只出现一次的真术语。

链路规范全文见 **`docs/TERM-AUTODISCOVERY-SPEC.md`**。

---

## V1.16.0 后续候选（CAMS 相关，暂未排期）

### 每日练习 / 50 题小测

CAMS 轻量接入方案中明确「暂不开发」。若后续要上，可复用 `src/data/cams/` 题库与
`src/components/cams/CamsExam.tsx` 的作答/评分引擎，只改「选题数量」与「入口」。

### 覆盖率仪表盘

需要「课程/案例/术语 → CAMS Domain」的映射统计。当前只有 `Lesson.cams` 一条映射，
若要做，需先给案例（`CaseMeta`）与术语（`GlossaryTerm`）也加 `cams` 字段并回填，
工作量较大，建议作为独立版本单独评估。

---

## V1.16.0 Backlog（来源：V1.15.1 Copilot 验收意见附带的新增需求）

> 登记时间：2026-09-15　｜　状态：**未开工**（V1.15.1 只交付内容修正，不含本组）
> 定性：属于「案例内容增强」，不涉及新路由 / 新功能页。

### P1 案例内容补充：SPC / FATCA / CRS（来源：V1.15.3 案例库搜索验证）

**触发**：V1.15.3 案例库搜索栏验收时，用需求方给出的示例词实测，**SPC = 0 例、FATCA = 0 例**。
经全文 grep 复核：29 篇案例的标题 / 标签 / 受控主题词 / 正文里**确实不存在**这两个词，
属**案例内容缺口，不是搜索功能故障**（UBO / AML Letter / VCC / PEP 均有正常命中）。

**目标**：补齐以下 5 个高价值主题的案例（暂定编号 Case-030 起）：

| # | 主题 | 说明 |
|---|---|---|
| 1 | SPC 基础案例 | Special Purpose Company 在基金架构中的设立与角色 |
| 2 | SPC 穿透案例 | SPC 与隔离单元（Segregated Portfolio）的穿透识别 / UBO 判定 |
| 3 | FATCA Self-Certification | 自证表收集时点、有效性、缺失处理 |
| 4 | CRS Classification | 实体分类（FI / NFE / Active NFE）判定 |
| 5 | US Investor FATCA | 美国投资者识别与预扣（Withholding）场景 |

**验收口径**：新增案例在 `/cases` 搜索 SPC / FATCA 能命中；标签归属到现有受控主题词
（若需新增主题词，`src/lib/case-categories.ts` 的 `CASE_TOPICS` 与
`scripts/build-case-index.mjs` 的 `TOPICS` **两处同步改**）。

**边界**：仍遵守「不收录时效性内容」原则 —— 不写生效日期 / 罚款金额 / 个别执法案例数字。

### P1 新增 Red Flags Framework（风险识别模块）

案例模板**统一新增** `🚩 Red Flags` 模块（覆盖全部案例）。

示例（Case-029）：

```text
🚩 Last-minute account change
🚩 Third-party payment
🚩 Different jurisdiction
🚩 Unclear ownership
🚩 Weak commercial rationale
🚩 Pressure to bypass normal process
```

**目标**：把案例从「案例问答」升级为「风险识别训练」——让读者先自己识别红旗，再看标准答案。

**待定口径（排期时确认）**：
- 是否 29 个案例全量补齐，还是先覆盖 AML / 制裁相关案例？
- Red Flags 与现有 `topics` 受控主题词是否需要映射关系？
- 是否需要受控词表（避免自由文本膨胀）？

**涉及文件**：`content/cases/Case-*.md`（新增 `# 🚩 Red Flags` 小节）、
`scripts/build-case-index.mjs`（若需纳入 `SECTIONS`）、`src/components/cases/MarkdownBody.tsx`（如需专属样式）。

### P2 新增 Regulatory Focus（监管关注点模块）

案例模板**统一新增** `Regulatory Focus / 监管关注点` 模块。

示例（Case-028）：

```text
• Fund-level Evidence
• Outsourcing Oversight
• Independent AML Audit
• Board Accountability
```

**目标**：帮助用户理解**为什么监管会关注这个案例**，而不是只记答案。

**待定口径（排期时确认）**：
- 是否复用术语库 id 做链接（如 `fund-level-evidence` / `outsourcing-oversight`）？
- 与 `/toolkit` 相关条目的交叉引用方式。

**涉及文件**：同上方 P1（Red Flags）。

### P2 案例库中文全文检索

当前案例库检索基于英文/拉丁词元（`searchText` 由 `build-case-index.mjs` 预生成，V1.15.3）。
需求：支持中文关键词直检 —— 实益拥有人、资金来源、最终受益人、授权签字人、税务居民、受托人。

**说明**：英文术语检索已满足日常需求，中文全文检索涉及分词与索引体积，
需单独评估（是否引入分词库 / 是否只做「中文别名 → 英文词元」映射表）。
注意索引体积：29 案拉丁词元已约 12KB，加中文词元需关注 SSG 页面体积。

**涉及文件**：`scripts/build-case-index.mjs`、`src/lib/cases.ts`、`src/components/cases/CaseLibrary.tsx`。
