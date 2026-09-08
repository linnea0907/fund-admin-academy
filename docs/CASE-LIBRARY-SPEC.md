# Case Library — Real Fund Admin Cases 数据规范（V2 + P1.8）

> 状态：V2 已落地，P1.8（Skills 能力标签 + 版本体系）已叠加（2026-09-08）。
> 定位：**Real Fund Admin Cases**——让新人学会真实工作中的判断，而不是背 AML 法规；**标准答案优先依据 ICS 内部 SOP**，不以通用教材、CAMS 教材或监管理论作为标准答案。后续案例正文由 **Copilot 提供**，WorkBuddy 仅负责导入与前端展示。
> 当前进度：Case-001 ~ Case-005（Module 1 · KYC File Review）已按《02.2 KYC/CDD 操作手册》撰写；Case-006 ~ Case-025 已建元数据骨架（含 title/module/level/skills），正文待对应 SOP 提供后导入。
> 本文是案例文件字段/结构与导入工作流的唯一依据。

## 一、文件位置与目录

```
content/cases/
├─ Case-001.md  ~  Case-025.md   # 案例正文（Markdown 单文件，每模块 5 个）
└─ index.json                     # 数据索引（由脚本生成，勿手改）
```

- 一个案例一个文件，文件名即案例编号 `Case-001.md`；编号按模块连续分配：
  Module 1 = 001–005，Module 2 = 006–010，Module 3 = 011–015，Module 4 = 016–020，Module 5 = 021–025。
- 站点运行时直接读取 Markdown，**内容以 Markdown 文件为准**；`index.json` 为元数据索引与校验快照。

## 二、一级分类（Module 注册表）

Module 编号写入 frontmatter 的 `module` 字段，站点侧注册表位于 `src/lib/case-modules.ts`（勿只改文档，两处需同步）：

| module | 分类 | 中文 | 重点训练 |
| --- | --- | --- | --- |
| 1 | Module 1 · KYC File Review | 文件审核实务 | 身份证明/地址证明是否可接受、核证是否合格、SOF 是否合格、文件是否过期、是否需补充 |
| 2 | Module 2 · Structure Chart Review | 架构图审核实务 | UBO 识别、穿透逻辑、10% 规则、25% 规则、上市公司豁免、持牌机构豁免 |
| 3 | Module 3 · AML Letter Review | AML Letter 实务 | AML Letter 是否接受、持牌证明检查、签署人资格判断、是否可替代 KYC |
| 4 | Module 4 · Investor Onboarding | 投资者准入实务 | 文件收集、SOF 审阅、Subscription Review、Closing 前检查 |
| 5 | Module 5 · Escalation & Compliance | 升级与特殊事项 | 客户沟通、Compliance 升级、红线判断 |

## 三、文件结构

每个 `.md` 由两部分组成：frontmatter 元数据 + 中文 `#` 小节正文。

### 1. Frontmatter（7 个元数据字段）

```yaml
---
id: Case-001
title: "开曼基金投资人仅提供香港永久居民身份证"
level: "入门"
module: 1
tags: ["开曼基金", "个人投资人", "身份证明"]
estimatedTime: 10
skills: ["KYC Review", "Identity Verification", "Certification Review", "Client Communication"]
---
```

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | ✅ | 案例编号，与文件名一致，一旦分配不得修改（已完成标记按 id 存 localStorage） |
| `title` | ✅ | 一句话标题，目录卡片展示（骨架阶段也填） |
| `level` | 导入后 | 难度：入门 / 进阶 / 高级 |
| `module` | ✅ | 一级分类编号 1~5，见上表 |
| `tags` | 导入后 | 字符串数组，目录标签筛选用 |
| `estimatedTime` | 导入后 | 预计学习分钟数（数字） |
| `skills` | ✅ | 能力标签（Skills）数组，见「五、Skills 能力标签」；当前已按案例主题初标，正文导入时如与训练目标不符可修订 |

### 2. 正文小节（10 个内容小节，`#` 中文标题，顺序固定）

Frontmatter 之后按**固定顺序**书写，标题必须与下表 label 完全一致（英文列为 Copilot/ICS 侧使用的标准结构名，二者一一对应，不改标题文案）：

```markdown
# 场景背景
模拟真实邮件及客户资料。

# 已收到资料
- 列出已收到文件

# 缺失资料
- 列出待补资料

# 你的判断
**Q1. 文件是否符合要求？**
**Q2. 需要补充哪些资料？**
**Q3. 下一步应该如何处理？**
**Q4. 是否需要升级至主管或 Compliance？**

# 标准答案
按 ICS 内部 SOP 编写，逐条回答 Q1–Q4。

# 理由分析
解释判断逻辑。

# 常见错误
新人最容易犯的错误。

# 客户沟通示例
附标准邮件措辞（可直接套用）。

# ICS SOP依据
对应知识库章节（如 02.2 KYC/CDD 操作手册 §一.1.2）。

# Takeaway
一句话总结实务经验。
```

| 小节 | 英文结构名（ICS 侧） | 内容要求 |
| --- | --- | --- |
| 场景背景 | Background | 一段邮件/场景描述，尽量还原真实工作输入 |
| 已收到资料 | Documents Received | 逐项列出客户已提供的文件 |
| 缺失资料 | Outstanding Items | 逐项列出待补文件 |
| 你的判断 | Questions | 固定 Q1–Q4 四问（可先遮住答案自测） |
| 标准答案 | Standard Answer | **以 ICS 内部 SOP 为准**逐问作答；SOP 未覆盖处明确写「需 Compliance 确认」，不得臆造 |
| 理由分析 | Reasoning | 解释为什么这样判断（法规/属地差异/文件逻辑） |
| 常见错误 | Common Mistakes | 新人最易犯的错误清单 |
| 客户沟通示例 | Client Communication Example | 标准英文邮件（主题+正文）+ 中文要点 |
| ICS SOP依据 | ICS SOP Reference | 精确到手册章节/QA 条目 |
| Takeaway | Takeaways | 一句话 |

### 写作约束

1. **标准答案必须引用 ICS 内部 SOP**（当前依据：02.2 KYC/CDD 操作手册）；不用通用教材/CAMS 理论做答案来源。
2. SOP 未覆盖、需上级或 Compliance 拍板的点，在正文写「需由上级和 Compliance 确认」，不要自行给结论。
3. 小节标题必须是上述 10 个之一；正文内部可用 `##`/`###`/列表/表格/引用/加粗。
4. 语言：简体中文为主，客户沟通示例用英文，术语保留原文（Cayman、SOF、CTC 等）。
5. 骨架占位注释（`<!-- … -->`）不计入内容，导入正文时整段替换。

## 四、导入工作流

1. 按上文结构填充 `content/cases/Case-XXX.md`（frontmatter + 10 个 `#` 小节）。
2. 生成/刷新索引并本地自检：
   ```bash
   npm run gen:cases   # 扫描 frontmatter 与小节，写 content/cases/index.json
   npm run dev         # 打开 /cases 与对应详情页核对渲染
   ```
3. 提交变更（正文 + `index.json` 一并提交）。

> 生效方式：`/cases`、`/skills` 与 `/cases/[id]` 均为 **SSG**。开发模式（`npm run dev`）下编辑保存后刷新即生效；生产（`npm run build && npm start`）需重新构建——`npm run build` 会通过 `prebuild` 钩子自动先刷新索引，无需手动执行 `gen:cases`。构建期每个案例文件只解析一次（进程内 mtime 缓存）。`id` 不得修改。

## 五、Skills 能力标签

Skills 独立于 Module：Module 是案例的一级分类，Skill 是案例训练的能力点。**一个案例可挂多个 Skill；一个 Skill 可出现在多个 Module 的案例中。**

- 受控词表（20 项）与中文说明、分组的唯一来源：`src/lib/skill-defs.ts`。案例 frontmatter 的 `skills` 只应从词表取值，写错/新词会绕过注册表展示（前端会兜底显示但不计入分组）。
- 打标责任：当前 25 个案例的 skills 由 WorkBuddy 按案例主题初标（每案例 2~4 项）；Copilot 导入正文时如与训练目标不符可修订。新案例由 Copilot 提供内容时**必须同时给出 skills**，WB 负责校验词表并入库。
- 分组（成长地图聚合维度，预留）：identity-docs（KYC 文件类）/ structure（架构与实益分析）/ aml-letter / onboarding（投资者准入）/ compliance（升级与合规）/ core（通用执业能力）。
- 成长地图预留：`SkillStat`（skill-defs.ts）已定义每技能的案例/完成统计聚合结构；后续计划在 localStorage 记录 per-skill 熟练度并按 group 生成成长雷达，UI 随后续迭代上线。

20 项受控技能：

| # | Skill | 分组 |
| --- | --- | --- |
| 1 | KYC Review | identity-docs |
| 2 | Address Proof Review | identity-docs |
| 3 | Identity Verification | identity-docs |
| 4 | Certification Review | identity-docs |
| 5 | SOF Review | identity-docs |
| 6 | Structure Chart Review | structure |
| 7 | UBO Identification | structure |
| 8 | Beneficial Ownership Analysis | structure |
| 9 | AML Letter Review | aml-letter |
| 10 | Investor Onboarding | onboarding |
| 11 | Trust Review | structure |
| 12 | Fund Structure Analysis | structure |
| 13 | PEP Screening | compliance |
| 14 | Adverse Media Review | compliance |
| 15 | Risk Assessment | compliance |
| 16 | Compliance Escalation | compliance |
| 17 | Client Communication | core |
| 18 | Closing Readiness Check | onboarding |
| 19 | Regulatory Analysis | core |
| 20 | Problem Solving | core |

## 六、内容就绪判断

判定「已导入（ready）」需同时满足：

- frontmatter `title` 非空；
- `module` 在 1~5 内；
- 至少一个正文小节有非空内容（骨架 HTML 注释不计入）。

未就绪案例：目录页显示「待导入」+ 标题；详情页显示占位说明；不可标记完成。

## 七、站点能力（V2 + P1.8）

| 能力 | 说明 |
| --- | --- |
| 案例目录页 | `/cases`，卡片网格 + 进度统计；筛选状态由 URL 承载（可分享/回退） |
| 多维筛选 | Module 1~5 · Level（难度）· Skills（技能）· Tags（标签）· 状态，可叠加；选项由全部案例聚合，当前条件可一键清除 |
| Skills 技能页 | `/skills`，20 项技能分区展示：说明 + 案例数量 + 已完成数量 + 完成率；「筛选案例」跳目录页并自动带 skill 过滤 |
| Skills 触点 | 案例详情页 skills 标签可点击 → `/cases?skill=…`；目录卡片展示技能 chips |
| 学习进度记录 | localStorage 记录已完成案例 id（completedCases） |
| 上/下一案例 | 详情页底部按编号序跳转 |
| Markdown 渲染 | 正文按 10 小节卡片渲染（react-markdown + remark-gfm） |
| 已完成标记 | 详情页按钮切换，目录卡片同步；未导入案例不可标记 |
| 版本体系 | 版本号统一读 `src/lib/site-config.ts`（当前 v1.8 Beta）；全站页脚 + 首页 Beta Badge/内测状态卡 |
