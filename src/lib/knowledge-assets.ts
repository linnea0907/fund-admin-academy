/**
 * 知识资产统计（V1.20.1 首页「知识资产」模块）
 *
 * ## 为什么单独成模块
 * 首页「知识资产」需要展示全平台的内容体量（课程 / 术语 / 案例 / 实务手册四类）。
 * 这些数字里有 **只有服务端能算** 的部分：案例数量来自 `content/cases/index.json`，
 * 经 `@/lib/cases`（依赖 `node:fs` / `node:path`）读取。
 *
 * ## 服务端专用（硬约束）
 * `@/lib/cases` 会打包 node 内置模块，**绝不可在客户端组件里 import**。
 * 因此首页拆成「服务端 page 装配数字 → 客户端视图渲染」两段：
 *   `src/app/page.tsx`（Server Component）调用本模块 → 以 props 传给
 *   `src/components/home/HomeDashboard.tsx`（"use client"）。
 * 若日后有人在客户端组件里 import 本文件，构建会失败——这是刻意的护栏。
 *
 * ## 统计口径
 * - 课程 / 术语 / 案例：**全站范围**（必修 + 选修）——「知识资产」问的是平台总存量。
 * - Checklist / Common Mistakes / Documents To Check / Escalation Triggers：
 *   课程数据里的「实务手册」四类字段（每讲正文均渲染，见 `PracticalGuide.tsx`），
 *   同样按**全站课程**汇总。
 *   ⚠️ V1.20.0 及以前首页的「实务手册统计」只统计**必修八讲**，本版起改为全站，
 *   因此这四个数字会变大（口径变更，非数据变更）。
 * - 数字全部由数据层实时派生，**无手写常量**，加课/加案例后自动跟随。
 */
import { orderedAllLessons, orderedLessons, electiveLessonsOrdered } from "@/lib/ordering";
import { GLOSSARY_COUNT, GLOSSARY_CATEGORIES } from "@/lib/glossary";
import { listCaseMetas } from "@/lib/cases";
import { AML_TOOLKIT } from "@/data/aml-toolkit";

export interface KnowledgeAssets {
  /** 全站课程数（必修 + 选修，不含全真模拟） */
  courses: number;
  /** 必修课程数 */
  coursesRequired: number;
  /** 选修课程数 */
  coursesElective: number;
  /** 术语总数（内置 + 导入层） */
  terms: number;
  /** 术语知识分类数 */
  termCategories: number;
  /** 案例总数 */
  cases: number;
  /** 案例中正文已导入的数量 */
  casesReady: number;
  /** 实务工具包条目数 */
  toolkits: number;
  /** Admin Checklist 条目数（全站课程） */
  checklist: number;
  /** Common Mistakes 条目数（全站课程） */
  commonMistakes: number;
  /** Documents To Check 条目数（全站课程） */
  documents: number;
  /** Escalation Triggers 条目数（全站课程） */
  escalations: number;
}

/** 装配全站知识资产统计（服务端调用） */
export function knowledgeAssets(): KnowledgeAssets {
  const caseMetas = listCaseMetas();

  return {
    courses: orderedAllLessons.length,
    coursesRequired: orderedLessons.length,
    coursesElective: electiveLessonsOrdered.length,
    terms: GLOSSARY_COUNT,
    termCategories: GLOSSARY_CATEGORIES.length,
    cases: caseMetas.length,
    casesReady: caseMetas.filter((c) => c.ready).length,
    toolkits: AML_TOOLKIT.length,
    checklist: orderedAllLessons.reduce((n, l) => n + (l.checklist?.length ?? 0), 0),
    commonMistakes: orderedAllLessons.reduce(
      (n, l) => n + (l.commonMistakes?.length ?? 0),
      0
    ),
    documents: orderedAllLessons.reduce(
      (n, l) => n + (l.documentsToCheck?.length ?? 0),
      0
    ),
    escalations: orderedAllLessons.reduce(
      (n, l) => n + (l.escalationTriggers?.length ?? 0),
      0
    ),
  };
}
