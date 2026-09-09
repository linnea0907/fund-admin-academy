# Fund Admin Academy · 境外私募基金学习中心

面向基金行政管理从业者的独立学习网站。将原 SharePoint 单页版《境外私募基金学习中心》重构为可长期维护的 Next.js 应用。

- **课程体系（6 讲）**：一只境外基金如何运转 / 基金结构全景 / Cayman 基金核心框架 / AML 与投资者尽调 / FATCA 与 CRS / BVI 基金与管理人
- **每讲结构**：学习目标 → 模块内容 → 风险提示 → 思维导图 → 课程自测
- **本地数据**：学习进度与收藏仅保存在浏览器（localStorage），支持导入 / 导出备份

## 技术栈

| 层 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router） |
| 语言 | TypeScript（strict） |
| 样式 | Tailwind CSS v4 |
| 规范 | ESLint（next 内置配置） |
| 存储 | localStorage（Key: `fund-admin-academy-v1`） |

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

## 项目结构

```
src/
├─ app/                    # App Router 页面
│  ├─ page.tsx             # Dashboard 首页（总进度/统计/最近学习）
│  ├─ courses/             # 课程中心 + 课程详情 [slug]
│  ├─ cases/               # 案例库：目录 /cases + 案例详情 /cases/[id]（Real Fund Admin Cases）
│  ├─ skills/              # Skills 技能页（技能说明 / 案例覆盖 / 完成率）
│  ├─ favorites/           # 收藏夹（课程 / 模块两级收藏）
│  └─ settings/            # 设置（重置 / 导出 / 导入）
├─ components/
│  ├─ AppShell.tsx         # 应用外壳：深蓝侧栏 + 移动端抽屉 + 全站页脚
│  ├─ CourseCard.tsx       # 课程卡片
│  ├─ ProgressTracker.tsx  # 环形进度
│  ├─ LessonViewer.tsx     # 课程详情主体
│  ├─ LessonToc.tsx        # 目录（桌面 sticky / 移动 chips）
│  ├─ MindMap.tsx          # 思维导图（纯 CSS）
│  ├─ QuizPanel.tsx        # 课程自测（即时判分）
│  ├─ cases/               # 案例库组件（目录/卡片/详情/Markdown 渲染）
│  └─ skills/              # Skills 技能页组件
├─ data/lessons.ts         # ★ 全部课程内容（内容迭代只改此文件）
├─ hooks/use-academy.tsx   # 全局状态 Provider（localStorage 持久化）
├─ lib/                    # storage / progress / case-modules / skill-defs / site-config 等工具
└─ types/                  # 领域类型

content/
└─ cases/                  # ★ 案例库正文（Case-001.md ~ Case-026.md + index.json，Module 1 现 6 例）
scripts/
└─ build-case-index.mjs    # 案例索引生成脚本（npm run gen:cases）
```

## 课程内容如何维护

课程数据集中在 **`src/data/lessons.ts`**，每讲为 `Lesson` 对象（含 `goal` / `modules` / `risks` / `mindmap` / `quiz`）。**新增或修改课程内容时只替换该文件即可**，页面与交互逻辑无需改动。

## 案例库如何维护（Real Fund Admin Cases，V2 + P1.8）

案例正文按 **`content/cases/Case-001.md ~ Case-026.md`** 存放（frontmatter 7 字段：`id` / `title` / `level` / `module` / `tags` / `estimatedTime` / `skills` + 正文 10 个中文 `#` 小节：场景背景 → 已收到资料 → 缺失资料 → 你的判断 → 标准答案 → 理由分析 → 常见错误 → 客户沟通示例 → ICS SOP依据 → Takeaway）。标准答案以 **ICS 内部 SOP** 为准；Skills 受控词表（20 项）见 `src/lib/skill-defs.ts`。字段规范、导入工作流见 **`docs/CASE-LIBRARY-SPEC.md`**。目录/技能/详情页均为 **SSG**：开发模式编辑即刷新；生产模式改内容后 `npm run build`（prebuild 自动刷新 `index.json`，无需手动 `gen:cases`）。

## 术语库如何维护（V1.9 Glossary）

术语**单一数据源**：`src/lib/glossary.ts`（51 词 × 5 类）。字段：`id` / `en`（参与自动匹配）/ `zh` / `category`（kyc·aml·structure·documents·operations）/ `brief`（Tooltip 一句话）/ `definition` / `commonMistakes` / `related`（关联术语 id）/ `aliases`（英文别名参与匹配，**勿放中文**避免子串误链）。新增术语只需追加一个对象：
- 课程 / 案例正文**自动标注**（英文词边界匹配，最长优先，code/pre/链接内不标注），无需改课程与案例文件；
- 相关课程 / 相关案例由构建期扫描自动生成（`src/lib/glossary-usage.ts`），随 `npm run build` 刷新；
- `/glossary` 列表与 `/glossary/[id]` 详情均为 SSG。

全站版本号统一维护于 **`src/lib/site-config.ts`**（当前 `v1.9 Beta`），升级版本只改该文件。

## 部署到 GitHub + Vercel

1. **推送到 GitHub**

   ```bash
   git init
   git add .
   git commit -m "feat: Fund Admin Academy v1"
   git branch -M main
   git remote add origin https://github.com/linnea0907/fund-admin-academy.git
   git push -u origin main
   ```

2. **Vercel 导入部署**
   - 打开 [vercel.com/new](https://vercel.com/new)，用 GitHub 账号登录并授权仓库
   - 选择 `linnea0907/fund-admin-academy`
   - 框架自动识别为 Next.js，无需额外配置，点击 **Deploy**
   - 部署完成后即可通过 `https://fund-admin-academy.vercel.app` 访问

3. **后续迭代**
   - 本地修改 → `git push` → Vercel 自动重新部署

## 阶段规划

- **当前版本：Fund Admin Academy v1.9 Beta**（版本号读 `src/lib/site-config.ts`）。
- **V1**：Dashboard / 课程中心 / 课程详情 / 学习进度 / 收藏 / 设置（重置、导出、导入）；数据存于 localStorage。
- **Case Library V2**：Real Fund Admin Cases（取消原监管知识案例库思路），5 大 Module 结构（Module 1 已扩至 6 例）= Case-001 ~ Case-026（当前 26 例，正文已导入 10 例：Module 1 全 6 例 + Module 3 三例 012/013/014 + Module 4 一例 018）。目录/详情/多维筛选/进度/Markdown 渲染已上线；正文按对应 SOP 逐份导入，其余骨架待投喂。
- **P1.8**：Skills 能力标签体系（20 项受控词表 + `/skills` 技能页 + 成长地图数据结构预留）；全站版本号统一配置与内测标识（Beta Badge / 状态卡 / 页脚）；**案例库筛选区重构**（业务模块 → 技能按一级动态展开 → 标签折叠进「高级筛选」）+ 难度归一 基础/进阶/高级 + 状态口径 待学习/学习中/已完成（首次打开详情即记开始）。
- **P1.8.1**：筛选区再收敛（适配 100+ 案例）——首屏行顺序固定 **模块 → 业务 → 技能（选中业务域展开）→ 难度**；业务域 7 类合并为 5 类（**KYC & Onboarding** = KYC/CDD + Investor Onboarding；**AML & Compliance** = AML + Compliance；Fund Structure / Fund Documents / Client Communication 不变；旧 URL `area` 值自动映射不失效）；**状态收纳进「高级筛选」**（与标签并列，默认折叠）；案例卡技能标签默认只显示前 2 个、其余折叠为 **+N**。
- **P1.8.2**：技能行默认折叠（「▸ 展开技能（N）」）+ 筛选器紧凑化（chips py-1 / p-4 / space-y-2），首屏再压缩 20%+。
- **V1.9（术语库 Glossary）**：全站术语单一数据源 `src/lib/glossary.ts`（51 词 × 5 类：KYC / AML / Fund Structure / Fund Documents / Operations）。课程与案例正文**自动识别标注**（英文术语虚线下划线，词边界防误链，code/pre/链接内不标注）；Hover 150ms Tooltip（中文名 + 一句话定义 + 关联术语），Click 右侧 Drawer（定义 / 常见误区 / 关联术语 / 相关课程 / 相关案例 + 完整页入口）；每个术语**会话内首次出现自动提示一次**、每页至多 2 次。新增 `/glossary` 列表（类别 + 检索）与 `/glossary/[id]` SSG 详情页（自动出现位置索引，构建期扫描课程与案例正文生成，零手工维护）；`/search` 升级为**一次命中术语 / 课程 / 模块 / 案例**。
- **V2+（预留）**：我的笔记、错题本、Investor Onboarding、Trust & PTC、Fund Documents、AI 导师、商业阅读、登录系统、数据库与团队同步、技能成长地图 UI。仅保留扩展空间，未实现业务逻辑。

## 免责声明

课程内容仅用于基金行政管理从业者的内部学习与能力建设，不构成法律、税务或监管意见。
