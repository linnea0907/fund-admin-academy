"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";

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
}

export interface SearchTerm {
  id: string;
  en: string;
  zh: string;
  brief: string;
  definition: string;
  aliases: string[];
  category: string;
}

/** V1.12.2：案例「ICS SOP 依据」小节（SOP 检索源） */
export interface SearchSop {
  caseId: string;
  slug: string;
  caseTitle: string;
  text: string;
}

/** V1.12.2：案例「客户沟通示例」小节（邮件模板检索源） */
export interface SearchTemplate {
  caseId: string;
  slug: string;
  caseTitle: string;
  text: string;
}

/** V1.12.2：课程 Admin Checklist 条目（Checklist 检索源） */
export interface SearchChecklist {
  lessonId: string;
  lessonSlug: string;
  lessonTitle: string;
  text: string;
}

export interface SearchCounts {
  terms: number;
  skills: number;
  lessonsRequired: number;
  lessonsTotal: number;
  cases: number;
  casesReady: number;
}

interface SearchData {
  lessons: SearchLesson[];
  cases: SearchCase[];
  terms: SearchTerm[];
  sops: SearchSop[];
  templates: SearchTemplate[];
  checklists: SearchChecklist[];
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

/** V1.12.2 检索范围（Lu：术语 / SOP / 模板 / 全站知识 + 课程案例/Checklist） */
type Scope = "all" | "term" | "course" | "case" | "sop" | "template" | "checklist";

const SCOPES: { key: Scope; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "term", label: "术语" },
  { key: "sop", label: "SOP 依据" },
  { key: "template", label: "邮件模板" },
  { key: "checklist", label: "Checklist" },
  { key: "course", label: "课程" },
  { key: "case", label: "案例" },
];

const SUGGESTIONS = ["AML Letter", "Capital Call", "UBO", "Trust", "CRS", "NAV", "FATCA", "Side Letter"];

export default function SearchClient({ data }: { data: SearchData }) {
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const kw = keyword.trim();

  const hits = useMemo(() => {
    if (!kw) return null;
    const lower = kw.toLowerCase();

    // 术语：中英文名 / 别名 / 一句话 / 定义 / 类别
    const termHits = data.terms.filter((t) =>
      [t.en, t.zh, t.brief, t.definition, t.category, ...t.aliases]
        .join("\n")
        .toLowerCase()
        .includes(lower)
    );

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

    // 案例：标题 / 标签 / 技能 / 模块名
    const caseHits = data.cases.filter((c) =>
      [c.title, c.module, ...c.tags, ...c.skills].join("\n").toLowerCase().includes(lower)
    );

    // V1.12.2 新增三类知识源
    const sopHits = data.sops.filter((s) => s.text.toLowerCase().includes(lower));
    const templateHits = data.templates.filter((t) => t.text.toLowerCase().includes(lower));
    const checklistHits = data.checklists.filter((c) => c.text.toLowerCase().includes(lower));

    const total =
      termHits.length +
      lessonHits.length +
      moduleHits.length +
      caseHits.length +
      sopHits.length +
      templateHits.length +
      checklistHits.length;

    return {
      termHits,
      lessonHits,
      moduleHits,
      caseHits,
      sopHits,
      templateHits,
      checklistHits,
      total,
    };
  }, [kw, data]);

  /** 当前范围是否展示某结果组 */
  const show = (g: Exclude<Scope, "all">) => scope === "all" || scope === g;

  return (
    <div className="space-y-6">
      {/* ===== 标题 ===== */}
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">知识检索</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          统一检索 <b className="text-[#0e2a5e]">术语 · SOP 依据 · Checklist · 邮件模板</b>
          ，并覆盖课程、模块与案例全站知识
          （模糊匹配 · 不区分大小写）
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
            placeholder="全站知识搜索：输入关键词，例如 AML Letter / Cayman / 地址证明 / capital call 催缴邮件"
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

      {/* ===== 空闲态：知识目录（合并后的统一入口） ===== */}
      {!kw ? (
        <>
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <DirCard
              href="/glossary"
              badge="术语"
              badgeCls="bg-[#0e2a5e]/10 text-[#0e2a5e]"
              title="术语库"
              desc="Fund Admin 高频术语：中英对照 · 定义 · 误区 · 关联"
              meta={`${data.counts.terms} 个术语 · 5 大类`}
            />
            <DirCard
              href="/skills"
              badge="能力"
              badgeCls="bg-emerald-100 text-emerald-700"
              title="技能中心"
              desc="能力地图：技能定义 · 案例覆盖 · 完成进度"
              meta={`${data.counts.skills} 项受控技能`}
            />
            <DirCard
              href="/courses"
              badge="课程"
              badgeCls="bg-amber-100 text-amber-700"
              title="课程中心"
              desc="境外私募基金六讲必修 + 选修专题，模块化学习"
              meta={`${data.counts.lessonsRequired} 讲必修 · ${data.counts.lessonsTotal} 讲全部`}
            />
            <DirCard
              href="/cases"
              badge="案例"
              badgeCls="bg-blue-100 text-blue-700"
              title="案例库"
              desc="Real Fund Admin Cases · 答案以 ICS 内部 SOP 为准"
              meta={`${data.counts.cases} 个案例 · 已导入 ${data.counts.casesReady} 个`}
            />
          </section>

          {/* 知识沉淀内容谱系 */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">知识沉淀内容</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              术语库、技能中心与全站搜索已合并为本页统一检索；原页面与数据全部保留。
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Cat chip="术语 Glossary" note="悬停速览 · 点击展开释义" href="/glossary" />
              <Cat chip="SOP 依据" note="散落于各案例正文，可在上方直接检索" />
              <Cat chip="Checklist" note="六讲课程操作清单" />
              <Cat chip="邮件模板" note="案例「客户沟通示例」片段" />
              <Cat chip="实务指引" note="课程风险提示与操作指引（全站检索可达）" />
              <Cat chip="工作技巧" note="案例 Takeaway / 常见错误（全站检索可达）" />
            </div>
          </section>
        </>
      ) : !hits || hits.total === 0 ? (
        /* ===== 无结果 ===== */
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">没有找到与「{keyword}」相关的内容</p>
          <p className="mt-1 text-xs text-slate-400">
            换个关键词试试，例如 AML Letter、Capital Call、Trust、地址证明
          </p>
        </div>
      ) : (
        /* ===== 分组结果 ===== */
        <div className="space-y-6">
          {(() => {
            const scopeLabel = SCOPES.find((s) => s.key === scope)?.label ?? "";
            const filteredTotal =
              scope === "all"
                ? hits.total
                : scope === "term"
                  ? hits.termHits.length
                  : scope === "course"
                    ? hits.lessonHits.length + hits.moduleHits.length
                    : scope === "case"
                      ? hits.caseHits.length
                      : scope === "sop"
                        ? hits.sopHits.length
                        : scope === "template"
                          ? hits.templateHits.length
                          : hits.checklistHits.length;
            return (
              <p className="text-xs text-slate-400">
                {scope === "all" ? (
                  <>
                    找到 {hits.total} 项结果（术语 {hits.termHits.length} · SOP {hits.sopHits.length}{" "}
                    · 模板 {hits.templateHits.length} · Checklist {hits.checklistHits.length} ·
                    课程 {hits.lessonHits.length} · 模块 {hits.moduleHits.length} · 案例{" "}
                    {hits.caseHits.length}），范围「
                    <span className="font-semibold text-[#0e2a5e]">{scopeLabel}</span>」，关键词「
                    <span className="font-semibold text-[#0e2a5e]">{keyword}</span>」
                  </>
                ) : (
                  <>
                    找到 {filteredTotal} 项结果，范围「
                    <span className="font-semibold text-[#0e2a5e]">{scopeLabel}</span>」，关键词「
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
            );
          })()}

          {/* 术语 */}
          {show("term") && hits.termHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                术语（{hits.termHits.length}）
                <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
                  悬停即查 · 点击展开
                </span>
              </h2>
              <ul className="mt-3 space-y-2">
                {hits.termHits.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/glossary/${t.id}`}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="mt-0.5 shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        {t.category}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          <Highlight text={`${t.en} · ${t.zh}`} keyword={kw} />
                        </span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-slate-400">
                          <Highlight text={t.brief} keyword={kw} />
                        </span>
                      </span>
                      <span className="mt-0.5 shrink-0 text-xs font-semibold text-[#0e2a5e]/60">
                        查看术语 →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SOP 依据 */}
          {show("sop") && hits.sopHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                SOP 依据（{hits.sopHits.length}）
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                  来自案例「ICS SOP 依据」小节
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

          {/* 邮件模板 */}
          {show("template") && hits.templateHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                邮件模板（{hits.templateHits.length}）
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                  来自案例「客户沟通示例」小节
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

          {/* Checklist */}
          {show("checklist") && hits.checklistHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                Admin Checklist（{hits.checklistHits.length}）
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  课程操作清单
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

          {/* 课程 */}
          {show("course") && hits.lessonHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">课程（{hits.lessonHits.length}）</h2>
              <ul className="mt-3 space-y-2">
                {hits.lessonHits.map(({ lesson, field }) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${lesson.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e] text-xs font-bold text-white">
                        {lesson.id}
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

          {/* 模块 */}
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
                            : `第 ${lesson.id} 讲 · ${lesson.title}`}
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

          {/* 案例 */}
          {show("case") && hits.caseHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">案例（{hits.caseHits.length}）</h2>
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
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeCls}`}
      >
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
