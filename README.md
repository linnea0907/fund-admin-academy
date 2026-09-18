# Fund Admin Academy · 境外基金行政知识平台

面向基金行政管理从业者的独立学习站点。将原 SharePoint 单页版《境外私募基金学习中心》重构为可长期维护的 Next.js 应用，现覆盖课程、术语库、案例库、实务工具包与 CAMS 认证支持。

- **课程体系（19 门）**：必修八讲 `01`–`08` + 第 `09` 讲全真模拟（考试入口，非内容课程）+ 选修 `E01`–`E11`
  - 必修：01 一只境外基金如何运转 / 02 基金结构全景 / 03 AML 与投资者尽调 / 04 AML Foundations / 05 FATCA 与 CRS / 06 AML Technology & Monitoring / 07 Cayman 基金核心框架 / 08 BVI 基金与管理人
- **知识资产**：术语库 **170** 条（8 分类）· 实务案例 **29** 篇（13 篇正文已导入）· 实务工具包 **5** 份 · 课程内 Checklist **111** / Common Mistakes **63** / Documents To Check **81** / Escalation Triggers **66**
- **检索**：`/search` 单一入口，8 个范围（全部 · 术语 · 案例 · 课程 · 实务工具包 · SOP 依据 · 邮件模板 · Checklist），支持深链 `?q=` / `?scope=`
- **本地数据**：学习进度、收藏、笔记、高亮、考试记录仅存于浏览器（localStorage），支持导入 / 导出备份
- **首页定位**：学习驾驶舱 —— 只回答「学到哪了 / 接下来学什么 / 最近在学什么」，其余功能一律走左侧导航（见 `docs/IA-PRINCIPLES.md`）

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router，静态 SSG） |
| 语言 | TypeScript（strict） |
| 样式 | Tailwind CSS v4 |
| 内容渲染 | react-markdown + remark-gfm（案例正文）· gray-matter（frontmatter） |
| 规范 | ESLint（next 内置配置） |
| 存储 | localStorage（学习 `fund-admin-academy-v1` 等独立 key，详见「数据与状态」） |

## 本地运行

要求：Node.js ≥ 20（开发环境使用 v22.22.2）。

```bash
npm install
npm run dev
```

打开 http://localhost:3000 即可访问。

生产构建：

```bash
npm run build && npm run start
```

> 网络提示：国内执行 `npm install` 较慢时可加镜像参数：
> `npm install --registry=https://registry.npmmirror.com`

### npm 脚本

| 脚本 | 作用 |
| --- | --- |
| `dev` / `build` / `start` / `lint` | 常规开发、构建、启动、检查 |
| `gen:cases` | 重建案例检索索引 `content/cases/index.json` |
| `gen:glossary` | 由 `content/glossary/imported.json` 烘焙 `src/data/glossary/imported.ts` |
| `check:lesson-numbers` | **构建期闸门**：URL 冻结表 / 展示编号连续唯一 / 模块标题前缀 / 模拟考号 |
| `check:glossary` | **构建期闸门**：重复 ID / 断链 / 无效引用 / 标注文本撞车 / 必填字段 |
| `prebuild` | 依次跑上列四步；因此 `npm run build` 会自动执行全部闸门与生成 |

> 任一道闸门失败即中断构建。改动课程顺序、术语数据或案例索引后，先单独跑对应 `check:*` / `gen:*` 更快定位。

## 项目结构

```
src/
├─ app/                        # App Router 路由（全部静态 SSG）
│  ├─ page.tsx                 # 首页 · 学习驾驶舱（Server Component）
│  ├─ courses/                 # 课程中心 + 课程详情 [slug]
│  ├─ cases/                   # 案例库目录 + 案例详情 [id]
│  ├─ glossary/                # 术语库列表（双页签）+ 术语详情 [id]
│  ├─ search/                  # 全站检索（8 范围）
│  ├─ toolkit/                 # 实务工具包 + 详情 [id]
│  ├─ cams-exam/               # 第 09 讲 CAMS 全真模拟考试
│  ├─ backlog/                 # 案例工坊（案例种子录入）
│  ├─ favorites/               # 收藏夹（课程 / 模块 / 案例 / 术语 / 工具包）
│  ├─ skills/                  # 案例技能覆盖视图
│  ├─ settings/                # 设置（重置 / 导出 / 导入 / 版本与内测状态）
│  └─ api/glossary/usage/      # 术语关联位置索引（Drawer 惰性拉取）
├─ components/                 # AppShell / 课程 / 案例 / 术语 / 首页 / 检索 等视图组件
├─ hooks/use-academy.tsx       # 全局状态 Provider（localStorage 持久化）
├─ data/                       # ★ 内容数据（见下表）
├─ lib/                        # 状态 / 排序 / 编号 / 检索 / 术语关系 等纯逻辑
└─ types/                      # 领域类型（index=课程与通用 · glossary · cams · aml-toolkit · knowledge-note）

content/
└─ cases/                      # ★ 案例正文 Case-001.md ~ Case-029.md + index.json（构建期生成）

scripts/                       # 索引生成与构建期闸门（见「npm 脚本」）
docs/                          # 规范与文档（见「文档索引」）
```

## 内容如何维护

| 内容 | 数据源 | 说明 |
| --- | --- | --- |
| 必修课程 | `src/data/lessons.ts`（6 讲）、`src/data/lessons-cams.ts`（CAMS 2 讲） | 每讲为 `Lesson` 对象（`goal` / `modules` / `risks` / `mindmap` / `quiz` / 实务四类清单） |
| 选修课程 | `src/data/electives-a·b·c.ts` | 共 11 门，`E` 前缀 id |
| 术语库 | `src/data/glossary/*.ts`（8 分类各一文件） | **18 字段**；`term` / `aliases` 参与正文标注与检索；可选批量导入通道 `content/glossary/imported.json`（当前 0 条，全部为手写数据） |
| 案例库 | `content/cases/Case-*.md` | frontmatter 7 字段 + 正文 10 个中文小节；规范见 `docs/CASE-LIBRARY-SPEC.md` |
| 实务工具包 | `src/data/aml-toolkit.ts` | 5 份（`checklist` / `sop` / `comparison`） |
| CAMS 题库与口径 | `src/types/cams.ts`、`src/data/cams/` | 四域权重 30/20/30/20；120 题 / 210 分钟 / 及格线 75 |
| 展示编号 | `src/lib/lesson-number.ts` | 由 `orderedLessons` **下标派生**，无映射表 |
| 版本号与品牌 | `src/lib/site-config.ts` | 升级版本只改此文件 |

### 两条不可违反的约定

1. **两层编号勿混**。数据主键 `lesson.id`（`01/02/10/11/12/13/14/15`）被 URL、进度、收藏、笔记、术语 `courses` 字段依赖，**永不改**；页面展示的是运行时派生的连续编号 `01`–`09`。新增课程只需加入 `orderedLessons`，展示编号自动重排，**不写迁移代码**。
2. **术语解释只在点击时出现**。Hover 仅保留视觉反馈，无浮层、无自动弹出。

## 数据与状态（localStorage）

| key | 内容 |
| --- | --- |
| `fund-admin-academy-v1` | 学习进度、收藏、最近学习 |
| `fund-admin-academy-notes-v1` | 学习笔记与高亮 |
| `fund-admin-academy-ui-v1` | 界面偏好（侧栏 / 目录折叠） |
| `fund-admin-academy-exam-records-v1` | 模拟考试记录（上限 20 条） |

新增持久化一律「**独立 key + 追加式字段 + 清洗函数**」；客户端读取一律「**首帧默认值 + 挂载后回读**」，以避免 SSR/CSR 不一致。

## 文档索引

| 文档 | 用途 |
| --- | --- |
| `docs/IA-PRINCIPLES.md` | **信息架构守则（Subtraction First）** —— 涉首页 / 导航 / 信息架构的改动必读 |
| `docs/BACKLOG.md` | 需求池与版本历史（含每版交付要点） |
| `docs/DATA-SPEC.md` | 数据层规范 |
| `docs/CASE-LIBRARY-SPEC.md` | 案例字段、模块划分与导入工作流 |
| `docs/ACCEPTANCE_TEMPLATE.md` | 版本验收包模板（12 章节） |
| `docs/BLUEBOOK_MAPPING.md` | 与《境外私募基金募集与运营法律实务指南》的章节映射 |
| `docs/IMPLEMENTATION-NOTES.md` / `docs/V2_ROADMAP.md` / `docs/V2_CASE_SEED.md` | 实现笔记与规划 |

## 部署

推送到 `main` 即由 Vercel 自动构建部署（`npm run build`，prebuild 自动执行全部闸门与索引生成），线上地址：

https://fund-admin-academy.vercel.app

## 免责声明

课程与案例内容仅用于基金行政管理从业者的内部学习与能力建设，不构成法律、税务或监管意见。案例标准答案以 ICS 内部 SOP 为准。
