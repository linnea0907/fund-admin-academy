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
│  ├─ cases/               # 案例库：目录 /cases + 案例详情 /cases/[id]（V2 实务案例库）
│  ├─ favorites/           # 收藏夹（课程 / 模块两级收藏）
│  └─ settings/            # 设置（重置 / 导出 / 导入）
├─ components/
│  ├─ AppShell.tsx         # 应用外壳：深蓝侧栏 + 移动端抽屉
│  ├─ CourseCard.tsx       # 课程卡片
│  ├─ ProgressTracker.tsx  # 环形进度
│  ├─ LessonViewer.tsx     # 课程详情主体
│  ├─ LessonToc.tsx        # 目录（桌面 sticky / 移动 chips）
│  ├─ MindMap.tsx          # 思维导图（纯 CSS）
│  ├─ QuizPanel.tsx        # 课程自测（即时判分）
│  └─ cases/               # 案例库组件（目录/卡片/详情/Markdown 渲染）
├─ data/lessons.ts         # ★ 全部课程内容（内容迭代只改此文件）
├─ hooks/use-academy.tsx   # 全局状态 Provider（localStorage 持久化）
├─ lib/                    # storage / progress / case-modules / cases 工具
└─ types/                  # 领域类型

content/
└─ cases/                  # ★ 案例库正文（Case-001.md ~ Case-025.md + index.json）
scripts/
└─ build-case-index.mjs    # 案例索引生成脚本（npm run gen:cases）
```

## 课程内容如何维护

课程数据集中在 **`src/data/lessons.ts`**，每讲为 `Lesson` 对象（含 `goal` / `modules` / `risks` / `mindmap` / `quiz`）。**新增或修改课程内容时只替换该文件即可**，页面与交互逻辑无需改动。

## 案例库如何维护（Case Library V1）

案例正文按 **`content/cases/Case-001.md ~ Case-050.md`** 存放（11 个统一字段：`id` / `title` / `level` / `category` / `tags` + `background` / `facts` / `questions` / `analysis` / `practical_steps` / `common_mistakes` / `further_reading`）。字段规范、导入工作流见 **`docs/CASE-LIBRARY-SPEC.md`**。导入内容后运行 `npm run gen:cases` 刷新 `content/cases/index.json`。

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

- **V1（当前）**：Dashboard / 课程中心 / 课程详情 / 学习进度 / 收藏 / 设置（重置、导出、导入）；数据存于 localStorage。
- **Case Library V2（进行中）**：Fund Admin 实务案例库（取消原监管知识案例库思路），5 大 Module × 5 案例 = Case-001 ~ Case-025。目录/详情/模块筛选/进度/Markdown 渲染已上线；Module 1（KYC File Review）正文已按《02.2 KYC/CDD 操作手册》撰写，其余模块正文待对应 SOP 导入。
- **V2+（预留）**：我的笔记、错题本、Investor Onboarding、Trust & PTC、Fund Documents、AI 导师、商业阅读、登录系统、数据库与团队同步。仅保留扩展空间，未实现业务逻辑。

## 免责声明

课程内容仅用于基金行政管理从业者的内部学习与能力建设，不构成法律、税务或监管意见。
