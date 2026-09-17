/**
 * Fund Admin Wiki — 术语聚合 + 文本匹配引擎（V1.14.0）
 *
 * - 类型与受控枚举在 `src/types/glossary.ts`；术语内容在 `src/data/glossary/*.ts`
 *   （含 `npm run gen:glossary` 从 `content/glossary/imported.json` 烘焙出来的 imported.ts）。
 *   本文件负责聚合 + 检索/标注引擎 + 使用索引类型。
 * - 纯数据 + 纯函数模块（无 fs / process 依赖），client / server 均可安全 import。
 * - 自动识别规则：`term` + `fullName`（纯 ASCII 时）+ `aliases`（纯 ASCII，避免中文子串误链）
 *   参与正文文本匹配；zh / brief / definition / whyImportant 等供 Tooltip、Drawer、
 *   详情页与搜索展示。**中文别名只参与搜索，不参与正文标注**（防中文子串误链）。
 * - 内容口径：Fund Admin 实务视角，与课程正文及案例库（ICS SOP）对齐。
 */

import { GLOSSARY_TERMS, GLOSSARY_BUILTIN_COUNT } from "@/data/glossary";
import {
  GLOSSARY_CATEGORIES,
  TERM_JURISDICTIONS,
  TERM_LEVELS,
  TERM_SCENARIOS,
  TERM_SOURCES,
  getTermLevel,
  type GlossaryCategory,
  type GlossaryCategoryDef,
  type GlossaryTerm,
  type TermJurisdiction,
  type TermLevel,
  type TermSourceDef,
  type TermSourceId,
} from "@/types/glossary";

export {
  GLOSSARY_CATEGORIES,
  TERM_JURISDICTIONS,
  TERM_LEVELS,
  TERM_SCENARIOS,
  TERM_SOURCES,
  getTermLevel,
};
export type {
  GlossaryCategory,
  GlossaryCategoryDef,
  GlossaryTerm,
  TermJurisdiction,
  TermLevel,
  TermLevelDef,
  TermScenario,
  TermSourceDef,
  TermSourceId,
} from "@/types/glossary";

/** 全部术语（内置 + 导入层；数组顺序 = 匹配优先级，长词优先由引擎另行排序） */
export { GLOSSARY_TERMS, GLOSSARY_BUILTIN_COUNT };

export function getGlossaryCategory(id: GlossaryCategory): GlossaryCategoryDef {
  return GLOSSARY_CATEGORIES.find((c) => c.id === id) ?? GLOSSARY_CATEGORIES[0];
}

export function getTermSource(id: TermSourceId): TermSourceDef | undefined {
  return TERM_SOURCES.find((s) => s.id === id);
}

/** 术语 id → 术语 */
export function getTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === id);
}

/* ================================================================
 * 自动识别（client/server 通用，纯函数）
 * ================================================================ */

export interface TermMatchPattern {
  termId: string;
  /** 参与匹配的文本（按长度降序，长的先命中） */
  patterns: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 是否纯 ASCII（含空格与 & / - . 等连接符）——中文别名不参与正文标注，避免子串误链 */
function isAscii(s: string): boolean {
  return /^[\x20-\x7E]+$/.test(s);
}

/**
 * 单个术语参与正文标注的文本集合：
 * term + fullName（纯 ASCII 且与 term 不同）+ aliases（仅纯 ASCII）。
 * 中文名与中文别名只用于搜索匹配，不进正文标注。
 */
export function termMatchTexts(t: GlossaryTerm): string[] {
  const set = new Set<string>();
  if (t.term && t.term.trim()) set.add(t.term.trim());
  if (t.fullName && isAscii(t.fullName) && t.fullName.trim() !== t.term.trim()) {
    set.add(t.fullName.trim());
  }
  for (const a of t.aliases ?? []) {
    if (a && isAscii(a)) set.add(a.trim());
  }
  return [...set].sort((a, b) => b.length - a.length);
}

/** 每个术语的可匹配文本 */
export const GLOSSARY_MATCHABLES: TermMatchPattern[] = GLOSSARY_TERMS.map((t) => ({
  termId: t.id,
  patterns: termMatchTexts(t),
}));

/** 术语 → 匹配文本 查找（命中文本反查术语 id，冲突时取词表靠前者） */
const MATCH_TEXT_TO_ID: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const entry of GLOSSARY_MATCHABLES) {
    for (const p of entry.patterns) {
      if (!m.has(p.toLowerCase())) m.set(p.toLowerCase(), entry.termId);
    }
  }
  return m;
})();

/** 全局识别正则（词边界：左右不为字母/数字，避免长词内误链） */
export const GLOSSARY_PATTERN: RegExp = (() => {
  const alts: string[] = [];
  for (const entry of GLOSSARY_MATCHABLES) alts.push(...entry.patterns);
  const sorted = [...alts].sort((a, b) => b.length - a.length);
  return new RegExp(
    `(?<![A-Za-z0-9])(?:${sorted.map(escapeRegExp).join("|")})(?![A-Za-z0-9])`,
    "gi"
  );
})();

export interface TermSegment {
  text: string;
  termId?: string;
}

export interface AnnotateOptions {
  /**
   * 段落级去重（V1.14.1）：同一段文本内，同一术语**仅第一次**出现标注为热词，
   * 后续出现降级为普通文本，降低正文标注密度、提升可读性。
   * 调用侧按「段落 / 列表项 / 表格单元格」粒度调用即得到段落级效果。
   */
  unique?: boolean;
  /**
   * 外部共享的去重作用域。传入后本次标注与后续标注共用同一个「已标注术语」集合，
   * 用于跨多次调用仍保持同一段落级去重（例：markdown 段落内嵌套 &lt;strong&gt; 时，
   * 各文本叶子共享一个 Set）。
   */
  seen?: Set<string>;
}

/** 把一段文本切成 普通文本 + 术语 片段（术语按词表最长优先匹配） */
export function annotateSegments(text: string, options: AnnotateOptions = {}): TermSegment[] {
  if (!text) return [{ text: "" }];
  const seen = options.seen ?? (options.unique ? new Set<string>() : null);
  const out: TermSegment[] = [];
  // 相邻普通片段合并，减少 DOM 文本节点
  const pushPlain = (t: string) => {
    if (!t) return;
    const last = out[out.length - 1];
    if (last && last.termId === undefined) last.text += t;
    else out.push({ text: t });
  };
  GLOSSARY_PATTERN.lastIndex = 0;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = GLOSSARY_PATTERN.exec(text)) !== null) {
    const start = m.index;
    const matched = m[0];
    if (start > cursor) pushPlain(text.slice(cursor, start));
    let termId: string | undefined = MATCH_TEXT_TO_ID.get(matched.toLowerCase());
    if (termId !== undefined && seen) {
      // 同一段落内已标注过该术语（含其别名/全称）→ 本次降级为普通文本
      if (seen.has(termId)) termId = undefined;
      else seen.add(termId);
    }
    if (termId === undefined) pushPlain(matched);
    else out.push({ text: matched, termId });
    cursor = start + matched.length;
    if (matched.length === 0) GLOSSARY_PATTERN.lastIndex += 1; // 防御空匹配
  }
  if (cursor < text.length) pushPlain(text.slice(cursor));
  return out;
}

/** 一段文本命中的去重术语 id 列表（使用索引扫描用） */
export function findTermMatches(text: string): string[] {
  const ids = new Set<string>();
  for (const seg of annotateSegments(text)) {
    if (seg.termId) ids.add(seg.termId);
  }
  return [...ids];
}

/* ================================================================
 * 检索（V1.14.0：缩写 / 全称 / 中文名 / 别名 互搜）
 * ================================================================ */

/** 术语一句话展示文本（brief 缺失时回落到 definition 首句） */
export function termBrief(t: GlossaryTerm): string {
  if (t.brief && t.brief.trim()) return t.brief;
  const first = t.definition.split(/[。；;]/)[0] ?? "";
  return first ? `${first}。` : t.definition;
}

export interface TermSearchHit {
  term: GlossaryTerm;
  /** 命中分（0 = 未命中）；越大越靠前 */
  score: number;
  /** 命中字段说明（展示「命中：缩写 / 全称 / 中文名」） */
  fields: string[];
}

/**
 * 单术语匹配评分。
 * 权重：精确 > 前缀 > 包含；名称类字段（term/fullName/zh/alias）> 正文类（brief/definition）
 * > 分类/来源/场景/标签。
 */
export function scoreTerm(t: GlossaryTerm, rawQuery: string): TermSearchHit | null {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;

  const names: { label: string; value: string }[] = [
    { label: "缩写", value: t.term },
    { label: "全称", value: t.fullName },
    { label: "中文名", value: t.zh },
    ...(t.aliases ?? []).map((a) => ({ label: "别名", value: a })),
  ];

  let best = 0;
  const fields = new Set<string>();
  for (const { label, value } of names) {
    const v = (value ?? "").trim().toLowerCase();
    if (!v) continue;
    if (v === q) {
      if (100 > best) best = 100;
      fields.add(label);
    } else if (v.startsWith(q)) {
      if (90 > best) best = 90;
      fields.add(label);
    } else if (v.includes(q)) {
      if (70 > best) best = 70;
      fields.add(label);
    }
  }

  const bodies: { label: string; value: string; score: number }[] = [
    { label: "一句话", value: termBrief(t), score: 40 },
    { label: "定义", value: t.definition, score: 35 },
    { label: "重要性", value: t.whyImportant, score: 30 },
    { label: "标签", value: t.tags.join(" "), score: 24 },
    { label: "场景", value: t.scenario.join(" "), score: 22 },
    {
      label: "来源",
      value: t.source.map((s) => getTermSource(s)?.label ?? s).join(" "),
      score: 20,
    },
    {
      label: "分类",
      value: `${getGlossaryCategory(t.category).label} ${getGlossaryCategory(t.category).zh}`,
      score: 20,
    },
    { label: "属地", value: t.jurisdiction.join(" "), score: 18 },
    { label: "误区", value: (t.commonMistakes ?? []).join(" "), score: 18 },
  ];
  for (const { label, value, score } of bodies) {
    if (value && value.toLowerCase().includes(q)) {
      if (score > best) best = score;
      fields.add(label);
    }
  }

  if (best === 0) return null;
  return { term: t, score: best, fields: [...fields] };
}

/** 按关键词检索术语（返回命中并按分数降序；同分保持原始顺序） */
export function searchTerms(terms: GlossaryTerm[], query: string): TermSearchHit[] {
  if (!query.trim()) return [];
  const scored: { hit: TermSearchHit; i: number }[] = [];
  terms.forEach((t, i) => {
    const hit = scoreTerm(t, query);
    if (hit) scored.push({ hit, i });
  });
  scored.sort((a, b) => b.hit.score - a.hit.score || a.i - b.i);
  return scored.map((x) => x.hit);
}

/** 术语 → 检索用文本（保留 V1.9 兼容签名） */
export function termHaystack(t: GlossaryTerm): string {
  return [
    t.term,
    t.fullName,
    t.zh,
    ...(t.aliases ?? []),
    t.brief,
    t.definition,
    t.whyImportant,
    ...t.scenario,
    ...t.jurisdiction,
    ...t.tags,
    ...(t.commonMistakes ?? []),
    getGlossaryCategory(t.category).label,
    getGlossaryCategory(t.category).zh,
    ...t.source.map((s) => getTermSource(s)?.label ?? s),
  ]
    .join("\n")
    .toLowerCase();
}

/* ================================================================
 * 统计
 * ================================================================ */

/** 术语总数（含导入层） */
export const GLOSSARY_COUNT = GLOSSARY_TERMS.length;

export function glossaryCategoryCounts(): Record<GlossaryCategory, number> {
  const counts = {
    "fund-structure": 0,
    "aml-kyc": 0,
    aeoi: 0,
    "fund-operations": 0,
    regulatory: 0,
    "legal-entity": 0,
    governance: 0,
    tax: 0,
  } as Record<GlossaryCategory, number>;
  for (const t of GLOSSARY_TERMS) counts[t.category] += 1;
  return counts;
}

/** 全部出现过的属地（按 TERM_JURISDICTIONS 固定顺序） */
export function glossaryJurisdictions(): TermJurisdiction[] {
  const seen = new Set<string>();
  for (const t of GLOSSARY_TERMS) for (const j of t.jurisdiction) seen.add(j);
  return TERM_JURISDICTIONS.filter((j) => seen.has(j)) as TermJurisdiction[];
}

/** 全部出现过的来源（按 TERM_SOURCES 固定顺序） */
export function glossarySources(): TermSourceDef[] {
  const seen = new Set<string>();
  for (const t of GLOSSARY_TERMS) for (const s of t.source) seen.add(s);
  return TERM_SOURCES.filter((s) => seen.has(s.id));
}

/* ================================================================
 * 使用索引类型（纯数据，client / server 通用）
 * glossary-usage.ts（server）负责扫描计算；Drawer / 详情页消费此结构。
 * ================================================================ */

/** 一个术语在一门课里命中的模块（用于带锚点跳转） */
export interface TermLessonModuleRef {
  id: string;
  title: string;
}

export interface TermLessonRef {
  id: string;
  slug: string;
  title: string;
  modules: TermLessonModuleRef[];
}

export interface TermCaseRef {
  id: string;
  slug: string;
  title: string;
}

export interface TermUsage {
  lessons: TermLessonRef[];
  cases: TermCaseRef[];
}

export type GlossaryUsageMap = Record<string, TermUsage>;

/* ================================================================
 * 反向索引类型（V1.18.0）：课程 → 术语 / 案例 → 术语
 *   由 buildTermRelations()（自动命中 ∪ 人工指定 courses / cases）反转得到，
 *   不在课程数据（lessons.ts 锁定基线）或案例数据里维护第二套字段。
 *   展示层只需可序列化的最小字段。
 * ================================================================ */

/** 反向索引的最小可序列化字段（课程侧 / 案例侧同构，故共用一个接口） */
export interface RelatedTermRef {
  /** 术语 id（详情页路由 = /glossary/<id>） */
  id: string;
  /** 英文术语名（chip 主标） */
  term: string;
  /** 中文名（chip 副标 / tooltip） */
  zh: string;
  /** 成熟度等级：core / advanced / expert（分组用） */
  level: TermLevel;
}

/** 课程 → 术语（V1.18.0） */
export type LessonTermRef = RelatedTermRef;

/** 案例 → 术语（V1.18.0） */
export type CaseTermRef = RelatedTermRef;
