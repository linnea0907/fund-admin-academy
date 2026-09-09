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

interface SearchData {
  lessons: SearchLesson[];
  cases: SearchCase[];
  terms: SearchTerm[];
}

interface LessonHit {
  lesson: SearchLesson;
  field: "title" | "subtitle";
}

interface ModuleHit {
  lesson: SearchLesson;
  module: { id: string; title: string };
}

const SUGGESTIONS = ["AML Letter", "Capital Call", "UBO", "Trust", "CRS", "NAV", "FATCA", "Side Letter"];

export default function SearchClient({ data }: { data: SearchData }) {
  const [keyword, setKeyword] = useState("");
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

    // 课程：标题 / 简介（原逻辑）
    const lh: LessonHit[] = [];
    const mh: ModuleHit[] = [];
    for (const lesson of data.lessons) {
      if (lesson.title.toLowerCase().includes(lower)) lh.push({ lesson, field: "title" });
      else if (lesson.subtitle.toLowerCase().includes(lower)) lh.push({ lesson, field: "subtitle" });
      for (const mod of lesson.modules) {
        if (mod.title.toLowerCase().includes(lower)) mh.push({ lesson, module: mod });
      }
    }

    // 案例：标题 / 标签 / 技能 / 模块名
    const caseHits = data.cases.filter((c) =>
      [c.title, c.module, ...c.tags, ...c.skills].join("\n").toLowerCase().includes(lower)
    );

    const total = termHits.length + lh.length + mh.length + caseHits.length;
    return { termHits, lessonHits: lh, moduleHits: mh, caseHits, total };
  }, [kw, data]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">搜索</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          一次搜索同时命中 <b className="text-[#0e2a5e]">术语库</b>、课程与模块名称、案例库
          （模糊匹配 · 不区分大小写）
        </p>
      </header>

      {/* 搜索框 */}
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
          placeholder="输入关键词，例如：AML Letter / Capital Call / Trust / Cayman / UBO"
          aria-label="搜索关键词"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
        />
      </div>

      {/* 快捷词 */}
      <div className="flex flex-wrap gap-2">
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

      {/* 结果状态 */}
      {!kw ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm font-medium text-slate-600">输入关键词开始搜索</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
            术语命中会直达 /glossary 术语页；课程与模块命中课程中心；案例命中案例库。
          </p>
        </div>
      ) : !hits || hits.total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">没有找到与「{keyword}」相关的内容</p>
          <p className="mt-1 text-xs text-slate-400">
            换个关键词试试，例如 AML Letter、Capital Call、Trust
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            找到 {hits.total} 项结果（术语 {hits.termHits.length} · 课程 {hits.lessonHits.length} ·
            模块 {hits.moduleHits.length} · 案例 {hits.caseHits.length}），关键词「
            <span className="font-semibold text-[#0e2a5e]">{keyword}</span>」
          </p>

          {hits.termHits.length > 0 && (
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

          {hits.lessonHits.length > 0 && (
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

          {hits.moduleHits.length > 0 && (
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

          {hits.caseHits.length > 0 && (
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
