"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_COUNT,
  GLOSSARY_TERMS,
  getGlossaryCategory,
  type GlossaryCategory,
} from "@/lib/glossary";

export interface TermUsageCounts {
  lessons: number;
  cases: number;
}

/** 术语库列表页（客户端检索 + 类别过滤；行数据与统计由服务端预烘焙） */
export default function GlossaryExplorer({
  usageCounts,
}: {
  usageCounts: Record<string, TermUsageCounts>;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | GlossaryCategory>("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GLOSSARY_TERMS.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (!q) return true;
      const hay = [
        t.en,
        t.zh,
        t.brief,
        t.definition,
        t.category,
        getGlossaryCategory(t.category).zh,
        ...(t.aliases ?? []),
      ]
        .join("\n")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query, cat]);

  const counted = rows.filter((t) => {
    const u = usageCounts[t.id];
    return u && (u.lessons > 0 || u.cases > 0);
  }).length;

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">术语库</h1>
          <span className="rounded-full bg-[#0e2a5e]/5 px-3 py-1 text-xs font-semibold text-[#0e2a5e]">
            {GLOSSARY_COUNT} 条术语
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            已在课程/案例自动标注 · 悬停即查 · 点击展开
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
          阅读课程或案例时，术语以虚线下划线标出：Hover 显示一句话定义与关联术语，点击打开完整
          Drawer（定义 / 常见误区 / 相关课程 / 相关案例）。术语定义全站共用一份数据源，随页面
          即时生效。
        </p>
      </header>

      {/* 搜索 */}
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
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="搜索术语：中 / 英文、缩写、定义关键词，例如 Capital Call / UBO / 分配 / AML"
          aria-label="搜索术语"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
        />
      </div>

      {/* 类别 chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCat("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            cat === "all"
              ? "bg-[#0e2a5e] text-white"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          全部 {GLOSSARY_COUNT}
        </button>
        {GLOSSARY_CATEGORIES.map((c) => {
          const n = GLOSSARY_TERMS.filter((t) => t.category === c.id).length;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(cat === c.id ? "all" : c.id)}
              title={c.zh}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                cat === c.id
                  ? "bg-[#0e2a5e] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {c.label} {n}
            </button>
          );
        })}
      </div>

      {/* 列表 */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-600">没有找到匹配的术语</p>
          <p className="mt-1 text-xs text-slate-400">换个关键词或清除类别筛选试试</p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs text-slate-400">
            命中 {rows.length} 条
            {query && (
              <>
                ，关键词「<span className="font-semibold text-[#0e2a5e]">{query}</span>」
              </>
            )}
            {cat !== "all" && (
              <>
                ，类别「
                <span className="font-semibold text-[#0e2a5e]">
                  {getGlossaryCategory(cat).label}
                </span>
                」
              </>
            )}
            · {counted} 条已出现在已导入内容中
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rows.map((t) => {
              const c = getGlossaryCategory(t.category);
              const u = usageCounts[t.id];
              const refs =
                u && (u.lessons > 0 || u.cases > 0)
                  ? `${u.lessons > 0 ? `${u.lessons} 讲` : ""}${
                      u.lessons > 0 && u.cases > 0 ? " · " : ""
                    }${u.cases > 0 ? `${u.cases} 案例` : ""}`
                  : null;
              return (
                <li key={t.id}>
                  <Link
                    href={`/glossary/${t.id}`}
                    className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                  >
                    <span className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 ring-1 ring-slate-200">
                        {c.label}
                      </span>
                      {refs && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-100">
                          出现于 {refs}
                        </span>
                      )}
                    </span>
                    <p className="mt-2 text-[15px] font-bold text-slate-800 group-hover:text-[#0e2a5e]">
                      {t.en}
                      <span className="ml-2 text-xs font-normal text-slate-400">{t.zh}</span>
                    </p>
                    <p className="mt-1 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-500">
                      {t.brief}
                    </p>
                    <span className="mt-2 text-xs font-semibold text-[#0e2a5e]/70 transition group-hover:text-[#0e2a5e]">
                      查看完整术语 →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
