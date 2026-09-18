"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  getGlossaryCategory,
  getTermSource,
  searchTerms,
  termBrief,
  type GlossaryTerm,
} from "@/lib/glossary";
import { recordTermEvents } from "@/lib/wiki-metrics";
import { displayNumber } from "@/lib/lesson-number";

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 把文本中命中的关键词高亮为 <mark> */
function Highlight({ text, keyword }: { text: string; keyword: string }) {
  if (!keyword) return <>{text}</>;
  const rx = new RegExp(`(${escapeRegExp(keyword)})`, "ig");
  const parts = text.split(rx);
  const lowerKw = keyword.toLowerCase();
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === lowerKw ? (
          <mark key={i} className="rounded bg-amber-200 px-0.5 text-inherit">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/** 长文本（SOP/模板小节）取命中位置附近片段，避免整节铺开 */
function snippet(text: string, kw: string, radius = 72): string {
  const lowerKw = kw.toLowerCase();
  const i = text.toLowerCase().indexOf(lowerKw);
  if (i < 0) return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  const from = Math.max(0, i - radius);
  const to = Math.min(text.length, i + kw.length + radius);
  return `${from > 0 ? "…" : ""}${text.slice(from, to)}${to < text.length ? "…" : ""}`;
}

/* ---------------- 数据类型（服务端 page 装配） ---------------- */

export interface SearchLesson {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  modules: { id: string; title: string }[];
}

export interface SearchCase {
  id: string;
  slug: string;
  title: string;
  module: string;
  tags: string[];
  skills: string[];
  ready: boolean;
  /** V1.13.1 分类字段（纳入检索与结果展示） */
  jurisdiction: string[];
  businessArea: string;
  entityType: string;
  topics: string[];
}

/** 术语关联内容（课程 / 案例）引用 */
export interface SearchRef {
  id: string;
  slug: string;
  title: string;
}

export interface SearchTermRelations {
  courses: SearchRef[];
  cases: SearchRef[];
}

/** 案例「ICS SOP 依据」小节（SOP 检索源） */
export interface SearchSop {
  caseId: string;
  slug: string;
  caseTitle: string;
  text: string;
}

/** 案例「客户沟通示例」小节（邮件模板检索源） */
export interface SearchTemplate {
  caseId: string;
  slug: string;
  caseTitle: string;
  text: string;
}

/** 课程 Admin Checklist 条目（Checklist 检索源） */
export interface SearchChecklist {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  text: string;
}

/** 实务工具包条目（V1.15.0 一级分类；V1.15.2 更名「实务工具包」并加业务分类） */
export interface SearchToolkit {
  id: string;
  /** checklist / sop / comparison */
  kind: string;
  kindLabel: string;
  /** 业务分类中文名（KYC 工具 / AML 工具 / …） */
  categoryLabel: string;
  title: string;
  zh: string;
  summary: string;
  /** 检索用长文本（purpose + 全部条目 + 步骤 + 表格 + 提醒 + 误区） */
  text: string;
}

export interface SearchCounts {
  terms: number;
  termsBuiltin: number;
  termsUsed: number;
  skills: number;
  lessonsRequired: number;
  lessonsTotal: number;
  cases: number;
  casesReady: number;
  sops: number;
  templates: number;
  checklists: number;
  toolkits: number;
}

interface SearchData {
  lessons: SearchLesson[];
  cases: SearchCase[];
  terms: GlossaryTerm[];
  termRelations: Record<string, SearchTermRelations>;
  sops: SearchSop[];
  templates: SearchTemplate[];
  checklists: SearchChecklist[];
  toolkits: SearchToolkit[];
  counts: SearchCounts;
}

interface LessonHit {
  lesson: SearchLesson;
  field: "title" | "subtitle";
}

interface ModuleHit {
  lesson: SearchLesson;
  module: { id: string; title: string };
}

interface TermHit {
  term: GlossaryTerm;
  score: number;
  fields: string[];
}

/** 检索范围（Terms / Cases / Courses / 实务工具包 为一级；Knowledge Notes 三类为二级） */
type Scope =
  | "all"
  | "term"
  | "case"
  | "course"
  | "toolkit"
  | "sop"
  | "template"
  | "checklist";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "term", label: "Terms 术语" },
  { key: "case", label: "Cases 案例" },
  { key: "course", label: "Courses 课程" },
  { key: "toolkit", label: "实务工具包" },
  { key: "sop", label: "SOP 依据" },
  { key: "template", label: "邮件模板" },
  { key: "checklist", label: "Checklist" },
];

const SUGGESTIONS = [
  "VCC",
  "PTC",
  "AML Letter",
  "CRS",
  "DMA",
  "SPC",
  "Source of Wealth",
  "Side Letter",
  "Waterfall",
  "可变资本公司",
];

/** 由术语派生关联内容时，仅取「名称级命中」的术语（score ≥ 70） */
const DERIVE_MIN_SCORE = 70;
const DERIVE_MAX = 12;

export default function SearchClient({ data }: { data: SearchData }) {
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const kw = keyword.trim();

  /**
   * 深链参数回读（V1.20.1）：支持从首页搜索框直达 `/search?q=…&scope=…`。
   *
   * 为什么不用 `useSearchParams()`：本页是 SSG 静态页，useSearchParams 必须包在
   * Suspense 边界内，且会把整页拖入客户端渲染；这里改为挂载后读
   * `window.location.search`，与 `use-ui-pref` / `AcademyProvider` 同一套
   * 「首帧渲染默认值 + 布局副作用回读」口径 —— 既不触发 React #418
   * （SSR 首帧为空、客户端首帧同样为空），也不影响静态导出。
   */
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const s = params.get("scope");
    if (q) setKeyword(q);
    if (s && SCOPES.some((x) => x.key === s)) setScope(s as Scope);
  }, []);

  const hits = useMemo(() => {
    if (!kw) return null;
    const lower = kw.toLowerCase();

    // Terms：缩写 / 全称 / 中文名 / 别名 / 定义 / 重要性 / 场景 / 标签 / 来源
    const termHits: TermHit[] = searchTerms(data.terms, kw);

    // 术语派生内容：术语命中时联出它的关联案例 / 关联课程（V1.14.0 统一结果页）
    const derivedCaseIds = new Set<string>();
    const derivedCourseIds = new Set<string>();
    const derivedCases: { ref: SearchRef; from: string }[] = [];
    const derivedCourses: { ref: SearchRef; from: string }[] = [];
    for (const h of termHits) {
      if (h.score < DERIVE_MIN_SCORE) continue;
      const rel = data.termRelations[h.term.id];
      if (!rel) continue;
      for (const c of rel.cases) {
        if (derivedCaseIds.has(c.id) || derivedCases.length >= DERIVE_MAX) continue;
        derivedCaseIds.add(c.id);
        derivedCases.push({ ref: c, from: h.term.term });
      }
      for (const l of rel.courses) {
        if (derivedCourseIds.has(l.id) || derivedCourses.length >= DERIVE_MAX) continue;
        derivedCourseIds.add(l.id);
        derivedCourses.push({ ref: l, from: h.term.term });
      }
    }

    // 课程：标题 / 简介；模块：标题
    const lessonHits: LessonHit[] = [];
    const moduleHits: ModuleHit[] = [];
    for (const lesson of data.lessons) {
      if (lesson.title.toLowerCase().includes(lower)) {
        lessonHits.push({ lesson, field: "title" });
      } else if (lesson.subtitle.toLowerCase().includes(lower)) {
        lessonHits.push({ lesson, field: "subtitle" });
      }
      for (const mod of lesson.modules) {
        if (mod.title.toLowerCase().includes(lower)) moduleHits.push({ lesson, module: mod });
      }
    }

    // 案例：标题 / 模块 / 标签 / 技能 / 分类字段
    const caseHits = data.cases.filter((c) =>
      [
        c.title,
        c.module,
        ...c.tags,
        ...c.skills,
        ...c.jurisdiction,
        c.businessArea,
        c.entityType,
        ...c.topics,
      ]
        .join("\n")
        .toLowerCase()
        .includes(lower)
    );

    // Knowledge Notes 三类
    const sopHits = data.sops.filter((s) => s.text.toLowerCase().includes(lower));
    const templateHits = data.templates.filter((t) => t.text.toLowerCase().includes(lower));
    const checklistHits = data.checklists.filter((c) => c.text.toLowerCase().includes(lower));

    // 实务工具包（一级分类；标题 / 中文名 / 摘要 / 形态 / 业务分类 / 全文条目）
    const toolkitHits = data.toolkits.filter((t) =>
      [t.title, t.zh, t.summary, t.kindLabel, t.categoryLabel, t.text]
        .join("\n")
        .toLowerCase()
        .includes(lower)
    );

    const total =
      termHits.length +
      derivedCases.length +
      derivedCourses.length +
      lessonHits.length +
      moduleHits.length +
      caseHits.length +
      toolkitHits.length +
      sopHits.length +
      templateHits.length +
      checklistHits.length;

    return {
      termHits,
      derivedCases,
      derivedCourses,
      lessonHits,
      moduleHits,
      caseHits,
      toolkitHits,
      sopHits,
      templateHits,
      checklistHits,
      total,
    };
  }, [kw, data]);

  /** 检索命中的术语写入本机热度统计（防抖 700ms，供「热门术语 Top」） */
  const topHitKey = useMemo(
    () =>
      (hits?.termHits ?? [])
        .filter((h) => h.score >= DERIVE_MIN_SCORE)
        .slice(0, 5)
        .map((h) => h.term.id)
        .join(","),
    [hits]
  );
  const lastRecordedRef = useRef("");
  useEffect(() => {
    if (kw.length < 2 || !topHitKey || lastRecordedRef.current === topHitKey) return;
    const timer = window.setTimeout(() => {
      lastRecordedRef.current = topHitKey;
      recordTermEvents(topHitKey.split(","), "search");
    }, 700);
    return () => window.clearTimeout(timer);
  }, [kw, topHitKey]);

  /** 当前范围是否展示某结果组 */
  const show = (g: Exclude<Scope, "all">) => scope === "all" || scope === g;

  const scopeLabel = SCOPES.find((s) => s.key === scope)?.label ?? "";

  return (
    <div className="space-y-6">
      {/* ===== 标题 ===== */}
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">知识检索</h1>
          <span className="rounded-full bg-[#0e2a5e]/5 px-3 py-1 text-xs font-semibold text-[#0e2a5e]">
            Fund Admin Wiki
          </span>
        </div>
        <p className="mt-1.5 text-sm text-slate-500">
          一次搜索直达 <b className="text-[#0e2a5e]">Terms 术语 · Cases 案例 · Courses 课程</b>
          ，并覆盖 <b className="text-[#0e2a5e]">实务工具包</b>与 Knowledge Notes（SOP 依据 /
          Checklist / 邮件模板）；命中术语时自动联出它的关联案例与关联课程（模糊匹配 · 不区分大小写）
        </p>
      </header>

      {/* ===== 统一搜索框 ===== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12.2 12.2L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索术语 / 案例 / 课程：输入缩写、全称或中文名，例如 VCC · PTC · AML Letter · 可变资本公司"
            aria-label="知识检索关键词"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
          />
        </div>

        {/* 范围 chips */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-slate-400">范围</span>
          {SCOPES.map(({ key, label }) => {
            const active = scope === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setScope(key)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                  active
                    ? "bg-[#0e2a5e] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 快捷词 */}
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setKeyword(s);
                inputRef.current?.focus();
              }}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-[#0e2a5e] hover:text-[#0e2a5e]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ===== 空闲态：知识检索四级结构 ===== */}
      {!kw ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            <DirCard
              href="/glossary"
              badge="Terms"
              badgeCls="bg-[#0e2a5e]/10 text-[#0e2a5e]"
              title="Fund Admin Wiki"
              desc="术语层：缩写 / 全称 / 中文名互搜，定义 · 重要性 · 实务场景 · 关联案例与课程"
              meta={`${data.counts.terms} 条术语（内置 ${data.counts.termsBuiltin}）· 8 大类`}
            />
            <DirCard
              href="/toolkit"
              badge="Toolkit"
              badgeCls="bg-emerald-100 text-emerald-700"
              title="实务工具包"
              desc="清单 · SOP · 对比：董事会监督清单、外包监督清单、制裁命中处置流程、角色与尽调对照表"
              meta={`${data.counts.toolkits} 个工具 · 6 类知识域`}
            />
            <DirCard
              href="/search"
              badge="Knowledge Notes"
              badgeCls="bg-emerald-100 text-emerald-700"
              title="知识卡片"
              desc="SOP 依据 · Admin Checklist · 客户沟通邮件模板，散落于案例与课程正文"
              meta={`SOP ${data.counts.sops} · 模板 ${data.counts.templates} · Checklist ${data.counts.checklists}`}
            />
            <DirCard
              href="/cases"
              badge="Cases"
              badgeCls="bg-blue-100 text-blue-700"
              title="案例库"
              desc="Real Fund Admin Cases · 答案以 ICS 内部 SOP 为准"
              meta={`${data.counts.cases} 个案例 · 已导入 ${data.counts.casesReady} 个`}
            />
            <DirCard
              href="/courses"
              badge="Courses"
              badgeCls="bg-amber-100 text-amber-700"
              title="课程中心"
              desc="必修八讲 + 第 09 讲全真模拟 + 选修专题，模块化学习与考核"
              meta={`${data.counts.lessonsRequired} 讲必修 · ${data.counts.lessonsTotal} 讲全部`}
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">知识检索长期结构</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              知识检索是 Fund Admin Academy 的核心入口，统一承载以下五层知识；原文页面与数据全部保留。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Cat chip="Terms 术语" note={`${data.counts.terms} 条 · 悬停速览 · 点击展开释义`} href="/glossary" />
              <Cat chip="实务工具包" note={`${data.counts.toolkits} 个工具 · 清单 / SOP / 对比`} href="/toolkit" />
              <Cat chip="Knowledge Notes 知识卡片" note="SOP 依据 / Checklist / 邮件模板，可在上方直接检索" />
              <Cat chip="Cases 案例" note={`${data.counts.cases} 个 Fund Admin 实务案例`} href="/cases" />
              <Cat chip="Courses 课程" note={`${data.counts.lessonsTotal} 讲课程与模块`} href="/courses" />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs text-slate-400">相关入口</span>
              <Cat chip="技能中心" note={`${data.counts.skills} 项受控技能与案例覆盖`} href="/skills" />
              <Cat
                chip="术语覆盖"
                note={`${data.counts.termsUsed} / ${data.counts.terms} 条已在课程或案例中出现`}
              />
            </div>
          </section>
        </>
      ) : !hits || hits.total === 0 ? (
        /* ===== 无结果 ===== */
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">没有找到与「{keyword}」相关的内容</p>
          <p className="mt-1 text-xs text-slate-400">
            换个关键词试试，例如 VCC、PTC、AML Letter、CRS、Waterfall、可变资本公司
          </p>
          <Link
            href="/glossary"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#0e2a5e]/5 px-3 py-1.5 text-xs font-semibold text-[#0e2a5e] transition hover:bg-[#0e2a5e]/10"
          >
            浏览术语库全部 {data.counts.terms} 条术语 →
          </Link>
        </div>
      ) : (
        /* ===== 分组结果 ===== */
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            {scope === "all" ? (
              <>
                找到 {hits.total} 项结果（Terms {hits.termHits.length} · 术语派生{" "}
                {hits.derivedCases.length + hits.derivedCourses.length} · Cases {hits.caseHits.length}{" "}
                · Courses {hits.lessonHits.length + hits.moduleHits.length} · 实务工具包{" "}
                {hits.toolkitHits.length} · SOP {hits.sopHits.length} · 模板{" "}
                {hits.templateHits.length} · Checklist {hits.checklistHits.length}），关键词「
                <span className="font-semibold text-[#0e2a5e]">{keyword}</span>」
              </>
            ) : (
              <>
                范围「<span className="font-semibold text-[#0e2a5e]">{scopeLabel}</span>」，关键词「
                <span className="font-semibold text-[#0e2a5e]">{keyword}</span>」
                <button
                  type="button"
                  onClick={() => setScope("all")}
                  className="ml-2 rounded-full bg-[#0e2a5e]/5 px-2 py-0.5 text-[11px] font-medium text-[#0e2a5e] transition hover:bg-[#0e2a5e]/10"
                >
                  查看全部
                </button>
              </>
            )}
          </p>

          {/* ===== Terms ===== */}
          {show("term") && hits.termHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                Terms 术语（{hits.termHits.length}）
                <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
                  Fund Admin Wiki
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.termHits.slice(0, 40).map((h) => {
                  const t = h.term;
                  const c = getGlossaryCategory(t.category);
                  const rel = data.termRelations[t.id];
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/glossary/${t.id}`}
                        className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                      >
                        <span
                          className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${c.tint}`}
                        >
                          {c.label}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                            <Highlight text={`${t.term} · ${t.zh}`} keyword={kw} />
                            {t.fullName && t.fullName !== t.term && (
                              <span className="ml-2 text-[11px] font-normal text-slate-400">
                                {t.fullName}
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                            <Highlight text={termBrief(t)} keyword={kw} />
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                            {h.fields.length > 0 && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-600">
                                命中 {h.fields.slice(0, 3).join("/")}
                              </span>
                            )}
                            {t.jurisdiction.slice(0, 2).map((j) => (
                              <span key={j} className="rounded bg-slate-50 px-1.5 py-0.5 ring-1 ring-slate-100">
                                📍 {j}
                              </span>
                            ))}
                            {t.source.slice(0, 2).map((s) => (
                              <span key={s} className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[#0e2a5e]">
                                {getTermSource(s)?.label ?? s}
                              </span>
                            ))}
                            {rel && (rel.cases.length > 0 || rel.courses.length > 0) && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5">
                                关联 {rel.courses.length} 课程 · {rel.cases.length} 案例
                              </span>
                            )}
                          </span>
                        </span>
                        <span className="mt-0.5 shrink-0 text-xs font-semibold text-[#0e2a5e]/60">
                          查看术语 →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              {hits.termHits.length > 40 && (
                <p className="mt-3 text-center text-xs text-slate-400">
                  仅展示前 40 条，请细化关键词或前往{" "}
                  <Link href="/glossary" className="font-semibold text-[#0e2a5e] hover:underline">
                    Fund Admin Wiki
                  </Link>{" "}
                  查看全部
                </p>
              )}
            </section>
          )}

          {/* ===== 术语派生内容（Cases / Courses） ===== */}
          {show("term") && (hits.derivedCases.length > 0 || hits.derivedCourses.length > 0) && (
            <section className="rounded-2xl border border-blue-100 bg-blue-50/30 p-5">
              <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                术语关联内容（{hits.derivedCases.length + hits.derivedCourses.length}）
                <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700">
                  由命中的术语自动联出 · 避免反复切换模块
                </span>
              </h2>
              <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                {hits.derivedCourses.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      关联课程（{hits.derivedCourses.length}）
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {hits.derivedCourses.map(({ ref, from }) => (
                        <li key={ref.id}>
                          <Link
                            href={`/courses/${ref.slug}`}
                            className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200"
                          >
                            <span className="shrink-0 rounded bg-[#0e2a5e] px-1.5 py-px text-[10px] font-bold text-white">
                              {ref.id}
                            </span>
                            <span className="truncate text-sm text-slate-600 group-hover:text-[#0e2a5e]">
                              {ref.title}
                            </span>
                            <span className="ml-auto shrink-0 text-[10px] text-slate-400">via {from}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {hits.derivedCases.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      关联案例（{hits.derivedCases.length}）
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {hits.derivedCases.map(({ ref, from }) => (
                        <li key={ref.id}>
                          <Link
                            href={`/cases/${ref.slug}`}
                            className="group flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 transition hover:border-blue-200"
                          >
                            <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold text-slate-500">
                              {ref.id}
                            </span>
                            <span className="truncate text-sm text-slate-600 group-hover:text-[#0e2a5e]">
                              {ref.title}
                            </span>
                            <span className="ml-auto shrink-0 text-[10px] text-slate-400">via {from}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ===== Cases ===== */}
          {show("case") && hits.caseHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">Cases 案例（{hits.caseHits.length}）</h2>
              <ul className="mt-3 space-y-2">
                {hits.caseHits.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/cases/${c.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e]/10 text-[10px] font-bold text-[#0e2a5e]">
                        {c.id.replace("Case-", "C")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          {!c.ready && (
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                              待导入
                            </span>
                          )}
                          <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                            <Highlight text={c.title} keyword={kw} />
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {c.module}
                          {c.jurisdiction.length > 0 && (
                            <> · {c.jurisdiction.map((j) => `📍 ${j}`).join(" + ")}</>
                          )}
                          {c.businessArea && <> · {c.businessArea}</>}
                          {c.tags.length > 0 && <> · #{c.tags.join(" · #")}</>}
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== Courses（课程） ===== */}
          {show("course") && hits.lessonHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">Courses 课程（{hits.lessonHits.length}）</h2>
              <ul className="mt-3 space-y-2">
                {hits.lessonHits.map(({ lesson, field }) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${lesson.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e] text-xs font-bold text-white">
                        {displayNumber(lesson.id)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          {lesson.id.startsWith("E") && (
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              选修
                            </span>
                          )}
                          <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                            <Highlight text={lesson.title} keyword={kw} />
                          </span>
                        </span>
                        {field === "subtitle" ? (
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            简介命中：
                            <Highlight text={lesson.subtitle} keyword={kw} />
                          </span>
                        ) : (
                          <span className="mt-0.5 block truncate text-xs text-slate-400">
                            {lesson.subtitle}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== Courses（模块） ===== */}
          {show("course") && hits.moduleHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">模块（{hits.moduleHits.length}）</h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {hits.moduleHits.map(({ lesson, module: mod }) => (
                  <li key={`${lesson.id}/${mod.id}`}>
                    <Link
                      href={`/courses/${lesson.slug}#${mod.id}`}
                      className="group flex items-center gap-3 py-3 transition hover:bg-slate-50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          <Highlight text={mod.title} keyword={kw} />
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-400">
                          {lesson.id.startsWith("E")
                            ? `${lesson.id} · 选修 · ${lesson.title}`
                            : `第 ${displayNumber(lesson.id)} 讲 · ${lesson.title}`}
                        </span>
                      </span>
                      <span className="shrink-0 rounded-full bg-[#0e2a5e]/5 px-2.5 py-1 text-[11px] font-medium text-[#0e2a5e]">
                        查看模块 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== 实务工具包（一级分类，V1.15.0；V1.15.2 更名并拆出详情页） ===== */}
          {show("toolkit") && hits.toolkitHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                实务工具包（{hits.toolkitHits.length}）
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Toolkit · 清单 / SOP / 对比
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.toolkitHits.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/toolkit/${t.id}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-emerald-200 hover:bg-emerald-50/40"
                    >
                      <span className="mt-0.5 shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                        {t.kindLabel}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          <Highlight text={`${t.zh} · ${t.title}`} keyword={kw} />
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          <Highlight text={t.summary} keyword={kw} />
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-xs font-semibold text-emerald-700/70">
                        打开工具 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== Knowledge Notes · SOP 依据 ===== */}
          {show("sop") && hits.sopHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                SOP 依据（{hits.sopHits.length}）
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  Knowledge Notes · 来自案例「ICS SOP 依据」小节
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.sopHits.map((s) => (
                  <li key={s.caseId}>
                    <Link
                      href={`/cases/${s.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {s.caseId}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          {s.caseTitle}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          <Highlight text={snippet(s.text, kw)} keyword={kw} />
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-xs font-semibold text-[#0e2a5e]/60">
                        查看案例 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== Knowledge Notes · 邮件模板 ===== */}
          {show("template") && hits.templateHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                邮件模板（{hits.templateHits.length}）
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                  Knowledge Notes · 来自案例「客户沟通示例」小节
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.templateHits.map((t) => (
                  <li key={t.caseId}>
                    <Link
                      href={`/cases/${t.slug}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {t.caseId}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          {t.caseTitle}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          <Highlight text={snippet(t.text, kw)} keyword={kw} />
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-xs font-semibold text-[#0e2a5e]/60">
                        查看模板 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ===== Knowledge Notes · Checklist ===== */}
          {show("checklist") && hits.checklistHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                Admin Checklist（{hits.checklistHits.length}）
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Knowledge Notes · 课程操作清单
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.checklistHits.map((c) => (
                  <li key={`${c.lessonId}/${c.text}`}>
                    <Link
                      href={`/courses/${c.lessonSlug}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e] text-xs font-bold text-white">
                        {c.lessonId}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          {c.lessonTitle}
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          <Highlight text={c.text} keyword={kw} />
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                        →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- 知识目录卡片 ---------------- */

function DirCard({
  href,
  badge,
  badgeCls,
  title,
  desc,
  meta,
}: {
  href: string;
  badge: string;
  badgeCls: string;
  title: string;
  desc: string;
  meta: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}>
        {badge}
      </span>
      <p className="mt-2 text-[15px] font-bold text-slate-800 group-hover:text-[#0e2a5e]">
        {title} →
      </p>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">{desc}</p>
      <p className="mt-2 border-t border-slate-100 pt-2 text-[11px] font-medium text-slate-400">
        {meta}
      </p>
    </Link>
  );
}

function Cat({ chip, note, href }: { chip: string; note: string; href?: string }) {
  const inner = (
    <span className="inline-flex items-start gap-1.5 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-2">
      <span className="whitespace-nowrap text-xs font-semibold text-slate-600">{chip}</span>
      <span className="text-[11px] leading-relaxed text-slate-400">{note}</span>
    </span>
  );
  return href ? (
    <Link href={href} className="transition hover:opacity-80" title="进入该知识库">
      {inner}
    </Link>
  ) : (
    inner
  );
}
