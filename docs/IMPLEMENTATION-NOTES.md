# Fund Admin Academy · 实现状态与对齐基线（v1）

> 用途：记录 v1 已落地实现与关键决策，便于与你方 PRD / 审查意见做逐项核对。
> 若 PRD 与本表冲突，以 PRD 为准，在本文件标记差异并跟进调整。

## 1. 已实现功能（可运行）

| # | 功能 | 页面 / 组件 | 状态 |
| --- | --- | --- | --- |
| 1 | 首页 Dashboard：总进度环、统计卡、最近学习、继续学习入口 | `app/page.tsx` + `ProgressTracker` | ✅ |
| 2 | 课程中心：6 讲卡片（进度 / 状态 / 简介） | `app/courses/page.tsx` + `CourseCard` | ✅ |
| 3 | 课程详情：学习目标 / 模块 / 风险提示 / 思维导图 / 自测 | `LessonViewer` + `MindMap` + `QuizPanel` | ✅ |
| 4 | 课程内导航：桌面左侧 sticky 目录，移动端顶部 chips | `LessonToc` | ✅ |
| 5 | 学习进度：模块级标记完成，整课一键完成；进度统计 | `hooks/use-academy.tsx` + `lib/progress.ts` | ✅ |
| 6 | 收藏：课程级 + 模块级收藏 / 取消 / 收藏夹列表 | `app/favorites` + `LessonViewer` 星标 | ✅ |
| 7 | 设置：重置进度 / 清空收藏 / 重置全部 / 导出 JSON / 导入 JSON | `app/settings` | ✅ |
| 8 | 持久化：localStorage，Key `fund-admin-academy-v1` | `lib/storage.ts` | ✅ |
| 9 | 移动端适配：抽屉菜单、横向目录 chips、响应式栅格 | `AppShell` 等 | ✅ |
| 10 | 404 兜底 | `app/not-found.tsx` | ✅ |

## 2. 关键实现决策

- **进度粒度 = 模块**：`completedModules: string[]`（key 形如 `01/m1`）。一课全部模块完成 ⇒ 该课完成。Dashboard / 卡片由此获得平滑进度，而非 0/100 两态。
- **收藏两层级**：`favorites` 支持 `{type:"lesson"}` 与 `{type:"module", moduleId}`，收藏夹分两段展示。
- **状态管理**：单一 `AcademyProvider`（Context + useState），任何变更自动写 localStorage；组件通过 `useAcademy()` 读取与操作。
- **UI 风格**：浅色背景（`#f4f6fa`）+ 深蓝 Banner（`#0e2a5e`）+ 白色卡片；中文系统字体栈（不依赖 Google Fonts，避免构建联网）。
- **内容单一数据源**：所有课程内容仅存于 `src/data/lessons.ts`。

## 3. 数据字典（Storage Key: fund-admin-academy-v1）

```jsonc
{
  "version": 1,
  "completedModules": ["01/m1", "02/m2"],
  "favorites": [
    { "type": "lesson", "lessonId": "01" },
    { "type": "module", "lessonId": "03", "moduleId": "m2" }
  ],
  "recentlyViewed": [{ "lessonId": "01", "at": 1757… }],
  "updatedAt": 1757…
}
```

## 4. 第二阶段预留（未实现逻辑，仅占位展示）

我的笔记 · 错题本 · 案例库 · Investor Onboarding · Trust & PTC · Fund Documents · AI 导师 · 商业阅读 · 登录系统 · 数据库 · 团队同步学习记录

## 5. 待对齐事项（占位）

- [ ] lessons.ts 数据规范（与你方输出核对）
- [ ] 课程内容审查意见（6 讲内容质量、口径、quiz 准确性）
- [ ] PRD 功能差异核对
- [ ] 路由结构是否符合 PRD（`app/notes/` 等预留路由是否需现在建）
