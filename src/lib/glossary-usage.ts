/**
 * Fund Admin Academy — 术语使用索引（服务端专用）
 *
 * 扫描课程（lessons 数据）与案例（content/cases）正文，用与页面标注完全相同的
 * 匹配逻辑（glossary.findTermMatches）算出每个术语在哪些课程模块 / 案例中出现。
 *
 * 用途：
 *   - /glossary 列表：术语行显示“出现于 N 讲 · M 案例”
 *   - /glossary/[id] 详情：自动生成的 相关课程 / 相关案例 区块（零手工维护）
 *   - Drawer 与 /api/glossary/usage：点击术语时按需拉取关联位置
 *
 * 本模块引用 fs 与课程数据，仅限 Server Components / Route Handlers 使用。
 */

import { orderedAllLessons } from "@/lib/ordering";
import {
  GLOSSARY_TERMS,
  findTermMatches,
  type GlossaryUsageMap,
  type TermUsage,
} from "@/lib/glossary";
import { caseSlug, listCaseIds, readCase } from "@/lib/cases";

/** 课程正文里参与扫描的文本块（module title + body + points） */
function lessonTextChunks() {
  const chunks: { lesson: { id: string; slug: string; title: string }; module: { id: string; title: string }; text: string }[] = [];
  for (const lesson of orderedAllLessons) {
    for (const mod of lesson.modules) {
      const text = [mod.title, ...(mod.body ?? []), ...(mod.points ?? [])].join("\n");
      chunks.push({ lesson: { id: lesson.id, slug: lesson.slug, title: lesson.title }, module: { id: mod.id, title: mod.title }, text });
    }
  }
  return chunks;
}

/** 课程级文本（title/subtitle/goal）命中时记为该课整体出现（modules 为空 → 链接到课程页顶） */
function lessonLevelTexts() {
  const texts: { lesson: { id: string; slug: string; title: string }; text: string }[] = [];
  for (const lesson of orderedAllLessons) {
    const text = [lesson.title, lesson.subtitle, ...(lesson.goal ?? [])].join("\n");
    texts.push({ lesson: { id: lesson.id, slug: lesson.slug, title: lesson.title }, text });
  }
  return texts;
}

let cached: GlossaryUsageMap | null = null;

/**
 * 计算全部术语的使用位置（构建期/请求期共用；进程内缓存）。
 * 每个术语都返回条目（lessons/cases 可能为空数组）。
 */
export function buildGlossaryUsage(): GlossaryUsageMap {
  if (cached) return cached;

  const map: GlossaryUsageMap = {};
  for (const t of GLOSSARY_TERMS) map[t.id] = { lessons: [], cases: [] };

  // 课程（模块级命中 → 带锚点）
  for (const chunk of lessonTextChunks()) {
    const hits = findTermMatches(chunk.text);
    if (hits.length === 0) continue;
    for (const termId of hits) {
      const usage = map[termId];
      if (!usage) continue;
      let lessonRef = usage.lessons.find((l) => l.id === chunk.lesson.id);
      if (!lessonRef) {
        lessonRef = { ...chunk.lesson, modules: [] };
        usage.lessons.push(lessonRef);
      }
      if (!lessonRef.modules.some((mo) => mo.id === chunk.module.id)) {
        lessonRef.modules.push({ id: chunk.module.id, title: chunk.module.title });
      }
    }
  }

  // 课程（课程级命中 → modules 为空，链接到课程页顶）
  for (const lvl of lessonLevelTexts()) {
    const hits = findTermMatches(lvl.text);
    if (hits.length === 0) continue;
    for (const termId of hits) {
      const usage = map[termId];
      if (!usage) continue;
      if (!usage.lessons.some((l) => l.id === lvl.lesson.id)) {
        usage.lessons.push({ ...lvl.lesson, modules: [] });
      }
    }
  }

  // 案例（正文小节 + 标题）
  for (const id of listCaseIds()) {
    const c = readCase(id);
    if (!c) continue;
    const text = [c.title, ...Object.values(c.sections).filter(Boolean)].join("\n");
    const hits = findTermMatches(text);
    if (hits.length === 0) continue;
    for (const termId of hits) {
      const usage = map[termId];
      if (!usage) continue;
      if (!usage.cases.some((cs) => cs.id === id)) {
        usage.cases.push({ id, slug: caseSlug(id), title: c.title });
      }
    }
  }

  cached = map;
  return cached;
}

/** 单个术语的使用位置 */
export function getTermUsage(termId: string): TermUsage {
  return buildGlossaryUsage()[termId] ?? { lessons: [], cases: [] };
}

/** 汇总计数（供 /glossary 列表行）：某术语出现的课程数 / 案例数 */
export function termUsageCounts(usage: TermUsage): { lessons: number; cases: number } {
  return { lessons: usage.lessons.length, cases: usage.cases.length };
}
