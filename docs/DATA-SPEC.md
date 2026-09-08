# lessons.ts 数据规范（草案）

> 说明：本文件由实现侧先行落地，作为与你方输出的数据规范对齐的基线。
> 变更时保持 `src/data/lessons.ts` 为唯一内容源，页面与交互不感知内容差异。

## 存储位置

- 唯一内容文件：`src/data/lessons.ts`
- 导出：`lessons: Lesson[]`，另提供 `getLessonBySlug` / `getLessonById` 便捷查询
- 课程顺序 = 数组顺序（`01` → `06`）

## 类型定义

```ts
interface Lesson {
  id: string;              // 课程编号，两位字符串："01"…
  slug: string;            // URL 段：courses/[slug]
  title: string;           // 课程标题
  subtitle: string;        // 一句话简介（卡片/详情头部/Banner 使用）
  goal: string[];          // 学习目标，2~6 条
  modules: LessonModule[]; // 模块（章节），3~6 个
  risks: RiskItem[];       // 风险提示，2~4 条
  mindmap: MindMapNode;    // 思维导图根节点
  quiz: QuizQuestion[];    // 课程自测，3~5 题（单选题）
  minutes: number;         // 预计学习分钟数
}

interface LessonModule {
  id: string;   // "m1"…"mN"，同一课内唯一；详情页锚点 & 收藏粒度依赖它
  title: string;
  body: string[];   // 正文段落
  points?: string[]; // 要点列表（渲染为 ▸ 列表）
}

interface RiskItem {
  title: string;
  detail: string;
}

interface MindMapNode {
  label: string;
  note?: string;        // 仅根节点使用（副标题）
  children?: MindMapNode[]; // 一级分支（每个分支可再挂 children 叶子）
}

interface QuizQuestion {
  id: string;         // "q1"…，课内唯一
  question: string;
  options: string[];  // 选项（渲染为 A/B/C/D…）
  answer: number;     // 正确项下标，从 0 开始
  explanation: string; // 答后解析
}
```

## 约定与约束

1. `id` 用两位数字字符串（`"01"`），用于排序、徽标、模块完成 key 前缀。
2. `slug` 全小写英文，稳定后**勿改**（会破坏已收藏/已记录进度对应的 URL；历史收藏以 lessonId 为准，不受 slug 影响）。
3. 模块 `id` 为 `m1` 起顺序编号。**模块级完成与收藏都基于 `lessonId + moduleId`**，插入新模块请追加而非重排编号（避免进度错位）。
4. `quiz[].answer` 是对 `options` 的下标索引；`explanation` 必填，答后展示。
5. 思维导图推荐结构：根节点 = 讲主题；一级分支 4~6 个；每个分支下挂 2~5 个叶子。
6. 内容语言：简体中文；法律术语保留英文原文（如 Cayman、EDD），不强制翻译。

## 内容替换（不碰代码）

1. 编辑 `src/data/lessons.ts`，按类型改写对应字段；
2. 保持 6 讲的 `id` / `slug` 不变，仅可增删 modules/quiz；
3. 运行 `npm run dev` 即生效，无需改动任何组件或页面。
