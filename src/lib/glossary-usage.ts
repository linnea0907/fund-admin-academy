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
  GLOSSARY_CATEGORIES,
  GLOSSARY_TERMS,
  TERM_LEVELS,
  findTermMatches,
  getGlossaryCategory,
  type GlossaryCategory,
  type GlossaryUsageMap,
  type TermCaseRef,
  type TermLessonRef,
  type TermLevel,
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

/* ================================================================
 * V1.14.0 关联关系（Related Courses / Related Cases）
 *   自动扫描（使用索引） ∪ 人工指定（术语数据的 courses / cases 字段）
 * ================================================================ */

export interface TermRelations {
  /** 关联课程（自动命中 + 人工指定，按课程顺序） */
  lessons: TermLessonRef[];
  /** 关联案例（自动命中 + 人工指定，按案例编号） */
  cases: TermCaseRef[];
  /** 人工指定的课程 id（用于「指定」标记） */
  manualCourses: string[];
  /** 人工指定的案例 id */
  manualCases: string[];
}

function manualLessonRef(lessonId: string): TermLessonRef | null {
  const l = orderedAllLessons.find((x) => x.id === lessonId);
  if (!l) return null;
  return { id: l.id, slug: l.slug, title: l.title, modules: [] };
}

function manualCaseRef(caseId: string): TermCaseRef | null {
  const c = readCase(caseId);
  if (!c) return null;
  return { id: caseId, slug: caseSlug(caseId), title: c.title };
}

let relationsCache: Record<string, TermRelations> | null = null;

/** 全部术语的关联关系（自动 + 人工合并；进程内缓存） */
export function buildTermRelations(): Record<string, TermRelations> {
  if (relationsCache) return relationsCache;
  const usage = buildGlossaryUsage();
  const out: Record<string, TermRelations> = {};

  for (const t of GLOSSARY_TERMS) {
    const u = usage[t.id] ?? { lessons: [], cases: [] };
    const lessons: TermLessonRef[] = [...u.lessons];
    const manualCourses: string[] = [];
    for (const lid of t.courses ?? []) {
      if (lessons.some((l) => l.id === lid)) continue;
      const ref = manualLessonRef(lid);
      if (ref) {
        lessons.push(ref);
        manualCourses.push(lid);
      }
    }
    const cases: TermCaseRef[] = [...u.cases];
    const manualCases: string[] = [];
    for (const cid of t.cases ?? []) {
      if (cases.some((c) => c.id === cid)) continue;
      const ref = manualCaseRef(cid);
      if (ref) {
        cases.push(ref);
        manualCases.push(cid);
      }
    }
    cases.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
    out[t.id] = { lessons, cases, manualCourses, manualCases };
  }

  relationsCache = out;
  return relationsCache;
}

/** 单个术语的关联关系 */
export function getTermRelations(termId: string): TermRelations {
  return (
    buildTermRelations()[termId] ?? {
      lessons: [],
      cases: [],
      manualCourses: [],
      manualCases: [],
    }
  );
}

/* ================================================================
 * V1.14.1 Wiki 健康度（Health Dashboard）
 *   覆盖率 = 至少关联 1 门课程 或 1 个案例 的术语占比。
 *   「孤立术语（Isolated）」= 既无课程关联、也无案例关联。
 * ================================================================ */

export interface WikiHealthRow {
  id: string;
  term: string;
  zh: string;
  category: GlossaryCategory;
  level: TermLevel;
  lessonCount: number;
  caseCount: number;
  isolated: boolean;
}

export interface WikiHealthBreakdown {
  key: string;
  label: string;
  total: number;
  linked: number;
  isolated: number;
  /** 0~100，四舍五入 */
  coverage: number;
}

export interface WikiHealth {
  total: number;
  /** 至少关联 1 门课程的术语数 */
  linkedCourses: number;
  /** 至少关联 1 个案例的术语数 */
  linkedCases: number;
  /** 课程 + 案例都关联的术语数 */
  linkedBoth: number;
  /** 至少关联其一（并集） */
  linkedAny: number;
  /** 孤立术语数 */
  isolated: number;
  /** 覆盖率 %（linkedAny / total × 100） */
  coverage: number;
  byCategory: WikiHealthBreakdown[];
  byLevel: WikiHealthBreakdown[];
  rows: WikiHealthRow[];
}

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

let healthCache: WikiHealth | null = null;

/** 全量术语健康度（构建期静态烘焙；进程内缓存） */
export function buildWikiHealth(): WikiHealth {
  if (healthCache) return healthCache;
  const relations = buildTermRelations();

  const rows: WikiHealthRow[] = GLOSSARY_TERMS.map((t) => {
    const r = relations[t.id];
    const lessonCount = r?.lessons.length ?? 0;
    const caseCount = r?.cases.length ?? 0;
    return {
      id: t.id,
      term: t.term,
      zh: t.zh,
      category: t.category,
      level: t.level,
      lessonCount,
      caseCount,
      isolated: lessonCount === 0 && caseCount === 0,
    };
  });

  const total = rows.length;
  const linkedCourses = rows.filter((r) => r.lessonCount > 0).length;
  const linkedCases = rows.filter((r) => r.caseCount > 0).length;
  const linkedBoth = rows.filter((r) => r.lessonCount > 0 && r.caseCount > 0).length;
  const linkedAny = rows.filter((r) => !r.isolated).length;
  const isolated = total - linkedAny;

  const group = (
    keyOf: (r: WikiHealthRow) => string,
    labelOf: (key: string) => string,
    order: string[]
  ): WikiHealthBreakdown[] =>
    order
      .map((key) => {
        const list = rows.filter((r) => keyOf(r) === key);
        const linked = list.filter((r) => !r.isolated).length;
        return {
          key,
          label: labelOf(key),
          total: list.length,
          linked,
          isolated: list.length - linked,
          coverage: pct(linked, list.length),
        };
      })
      .filter((b) => b.total > 0);

  healthCache = {
    total,
    linkedCourses,
    linkedCases,
    linkedBoth,
    linkedAny,
    isolated,
    coverage: pct(linkedAny, total),
    byCategory: group(
      (r) => r.category,
      (k) => getGlossaryCategory(k as GlossaryCategory).label,
      GLOSSARY_CATEGORIES.map((c) => c.id)
    ),
    byLevel: group(
      (r) => r.level,
      (k) => TERM_LEVELS.find((l) => l.id === k)?.label ?? k,
      TERM_LEVELS.map((l) => l.id)
    ),
    rows,
  };
  return healthCache;
}

/** 孤立术语条目（Dashboard 展开列表用） */
export interface WikiIsolatedTerm {
  id: string;
  term: string;
  zh: string;
  category: GlossaryCategory;
  level: TermLevel;
}

/** 可序列化的健康度摘要（服务端 → 客户端 Dashboard） */
export interface WikiHealthSummary {
  total: number;
  linkedCourses: number;
  linkedCases: number;
  linkedBoth: number;
  linkedAny: number;
  isolated: number;
  coverage: number;
  byCategory: WikiHealthBreakdown[];
  byLevel: WikiHealthBreakdown[];
  isolatedTerms: WikiIsolatedTerm[];
  /**
   * 「仅正文自动命中」口径（不含术语数据里人工指定的关联）。
   * 用于区分：覆盖率提升是**内容侧真的引用了**，还是**人工挂靠**。
   */
  auto: {
    linkedCourses: number;
    linkedCases: number;
    linkedBoth: number;
    linkedAny: number;
    isolated: number;
    coverage: number;
  };
}

/** 健康度摘要（不含 155 行明细，控制 RSC 载荷） */
export function wikiHealthSummary(): WikiHealthSummary {
  const h = buildWikiHealth();
  const usage = buildGlossaryUsage();
  const autoRows = GLOSSARY_TERMS.map((t) => {
    const u = usage[t.id];
    return { l: u?.lessons.length ?? 0, c: u?.cases.length ?? 0 };
  });
  const aCourses = autoRows.filter((r) => r.l > 0).length;
  const aCases = autoRows.filter((r) => r.c > 0).length;
  const aBoth = autoRows.filter((r) => r.l > 0 && r.c > 0).length;
  const aAny = autoRows.filter((r) => r.l > 0 || r.c > 0).length;

  return {
    total: h.total,
    linkedCourses: h.linkedCourses,
    linkedCases: h.linkedCases,
    linkedBoth: h.linkedBoth,
    linkedAny: h.linkedAny,
    isolated: h.isolated,
    coverage: h.coverage,
    byCategory: h.byCategory,
    byLevel: h.byLevel,
    isolatedTerms: h.rows
      .filter((r) => r.isolated)
      .map((r) => ({ id: r.id, term: r.term, zh: r.zh, category: r.category, level: r.level })),
    auto: {
      linkedCourses: aCourses,
      linkedCases: aCases,
      linkedBoth: aBoth,
      linkedAny: aAny,
      isolated: h.total - aAny,
      coverage: pct(aAny, h.total),
    },
  };
}
