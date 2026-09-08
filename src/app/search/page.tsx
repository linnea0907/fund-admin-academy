"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { orderedLessons } from "@/lib/ordering";
import type { Lesson, LessonModule } from "@/types";

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

interface LessonHit {
  lesson: Lesson;
  field: "title" | "subtitle";
}

interface ModuleHit {
  lesson: Lesson;
  module: LessonModule;
}

export default function SearchPage() {
  const [keyword, setKeyword] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const kw = keyword.trim();

  const { lessonHits, moduleHits, total } = useMemo(() => {
    if (!kw) return { lessonHits: [] as LessonHit[], moduleHits: [] as ModuleHit[], total: 0 };
    const lower = kw.toLowerCase();
    const lh: LessonHit[] = [];
    const mh: ModuleHit[] = [];
    for (const lesson of orderedLessons) {
      if (lesson.title.toLowerCase().includes(lower))
        lh.push({ lesson, field: "title" });
      else if (lesson.subtitle.toLowerCase().includes(lower))
        lh.push({ lesson, field: "subtitle" });
      for (const mod of lesson.modules) {
        if (mod.title.toLowerCase().includes(lower))
          mh.push({ lesson, module: mod });
      }
    }
    return { lessonHits: lh, moduleHits: mh, total: lh.length + mh.length };
  }, [kw]);

  const suggestions = ["AML", "Trust", "Cayman", "CRS", "NAV", "FATCA", "BVI"];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">搜索</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          搜索课程标题、课程简介与模块名称（模糊匹配 · 不区分大小写）
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
          placeholder="输入关键词，例如：AML / Trust / Cayman / NAV"
          aria-label="搜索关键词"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
        />
      </div>

      {/* 快捷词 */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
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
            可匹配课程标题、课程简介与任意模块标题，支持中英文关键词。
          </p>
        </div>
      ) : total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-600">
            没有找到与「{keyword}」相关的内容
          </p>
          <p className="mt-1 text-xs text-slate-400">换个关键词试试，例如 AML、Trust、Cayman</p>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-slate-400">
            找到 {total} 项结果（课程 {lessonHits.length} · 模块 {moduleHits.length}），关键词「
            <span className="font-semibold text-[#0e2a5e]">{keyword}</span>」
          </p>

          {lessonHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">
                课程（{lessonHits.length}）
              </h2>
              <ul className="mt-3 space-y-2">
                {lessonHits.map(({ lesson, field }) => (
                  <li key={lesson.id}>
                    <Link
                      href={`/courses/${lesson.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e] text-xs font-bold text-white">
                        {lesson.id}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                          <Highlight text={lesson.title} keyword={kw} />
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

          {moduleHits.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">
                模块（{moduleHits.length}）
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {moduleHits.map(({ lesson, module: mod }) => (
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
                          第 {lesson.id} 讲 · {lesson.title}
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
        </div>
      )}
    </div>
  );
}
