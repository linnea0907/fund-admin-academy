"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GLOSSARY_CATEGORIES,
  getGlossaryCategory,
  getTermSource,
  searchTerms,
  termBrief,
  type GlossaryTerm,
  type TermJurisdiction,
  type TermSourceDef,
} from "@/lib/glossary";

export interface TermUsageCounts {
  lessons: number;
  cases: number;
}

/**
 * Fund Admin Wiki · Terms（术语）列表页（V1.14.0）
 *
 * - 客户端检索：缩写 / 全称 / 中文名 / 别名 / 定义关键词 互搜（命中字段可读化）
 * - 分类（8 类）· 属地 · 来源 三重筛选 + 「仅看已在内容中出现」开关
 * - 行数据与统计由服务端预烘焙（SSG）
 */
export default function GlossaryExplorer({
  terms,
  usageCounts,
  jurisdictions,
  sources,
}: {
  terms: GlossaryTerm[];
  usageCounts: Record<string, TermUsageCounts>;
  jurisdictions: TermJurisdiction[];
  sources: TermSourceDef[];
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | string>("all");
  const [jur, setJur] = useState<"all" | string>("all");
  const [src, setSrc] = useState<"all" | string>("all");
  const [onlyUsed, setOnlyUsed] = useState(false);

  const q = query.trim();

  const rows = useMemo(() => {
    const filtered = terms.filter((t) => {
      if (cat !== "all" && t.category !== cat) return false;
      if (jur !== "all" && !t.jurisdiction.includes(jur as TermJurisdiction)) return false;
      if (src !== "all" && !t.source.includes(src as never)) return false;
      if (onlyUsed) {
        const u = usageCounts[t.id];
        if (!u || (u.lessons === 0 && u.cases === 0)) return false;
      }
      return true;
    });
    if (!q) return filtered.map((t) => ({ term: t, fields: [] as string[] }));
    return searchTerms(filtered, q).map((h) => ({ term: h.term, fields: h.fields }));
  }, [terms, cat, jur, src, onlyUsed, q, usageCounts]);

  const activeFilters = (cat !== "all" ? 1 : 0) + (jur !== "all" ? 1 : 0) + (src !== "all" ? 1 : 0);

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">Fund Admin Wiki</h1>
          <span className="rounded-full bg-[#0e2a5e]/5 px-3 py-1 text-xs font-semibold text-[#0e2a5e]">
            Terms · {terms.length} 条
          </span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            课程 / 案例正文自动标注 · 悬停即查
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
          基金行政知识库术语层：统一结构涵盖 <b className="text-slate-600">缩写 / 全称 / 中文名 /
          分类 / 属地 / 定义 / 重要性 / 实务场景 / 别名 / 来源 / 标签</b>，并自动汇集
          关联术语、关联案例与关联课程。支持缩写、全称、中文名互搜。
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
          placeholder="互搜缩写 / 全称 / 中文名，例如 VCC · Variable Capital Company · 可变资本公司 · PTC · AML Letter"
          aria-label="搜索术语"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
        />
      </div>

      {/* 分类 chips */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-8 shrink-0 text-xs font-semibold text-slate-400">分类</span>
          <button
            type="button"
            onClick={() => setCat("all")}
            className={chip(cat === "all")}
          >
            全部 {terms.length}
          </button>
          {GLOSSARY_CATEGORIES.map((c) => {
            const n = terms.filter((t) => t.category === c.id).length;
            return (
              <button
                key={c.id}
                type="button"
                title={c.zh}
                onClick={() => setCat(cat === c.id ? "all" : c.id)}
                className={chip(cat === c.id)}
              >
                {c.label} {n}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-8 shrink-0 text-xs font-semibold text-slate-400">属地</span>
          <button type="button" onClick={() => setJur("all")} className={chip(jur === "all")}>
            全部
          </button>
          {jurisdictions.map((j) => (
            <button
              key={j}
              type="button"
              onClick={() => setJur(jur === j ? "all" : j)}
              className={chip(jur === j)}
            >
              📍 {j}
              <span className={jur === j ? "text-blue-200" : "text-slate-400"}>
                {" "}
                {terms.filter((t) => t.jurisdiction.includes(j)).length}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-8 shrink-0 text-xs font-semibold text-slate-400">来源</span>
          <button type="button" onClick={() => setSrc("all")} className={chip(src === "all")}>
            全部
          </button>
          {sources.map((s) => (
            <button
              key={s.id}
              type="button"
              title={s.nature}
              onClick={() => setSrc(src === s.id ? "all" : s.id)}
              className={chip(src === s.id)}
            >
              {s.label}
              <span className={src === s.id ? "text-blue-200" : "text-slate-400"}>
                {" "}
                {terms.filter((t) => t.source.includes(s.id)).length}
              </span>
            </button>
          ))}
          <label className="ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-[#0e2a5e]/40">
            <input
              type="checkbox"
              checked={onlyUsed}
              onChange={(e) => setOnlyUsed(e.target.checked)}
              className="h-3.5 w-3.5 accent-[#0e2a5e]"
            />
            仅看已在课程/案例中出现
          </label>
          {(activeFilters > 0 || onlyUsed) && (
            <button
              type="button"
              onClick={() => {
                setCat("all");
                setJur("all");
                setSrc("all");
                setOnlyUsed(false);
              }}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-200"
            >
              清除筛选
            </button>
          )}
        </div>
      </div>

      {/* 列表 */}
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-600">没有找到匹配的术语</p>
          <p className="mt-1 text-xs text-slate-400">
            换个关键词或清除筛选试试；缺失的核心术语可在「知识工坊」待补充池中一键创建
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-3 text-xs text-slate-400">
            命中 {rows.length} 条
            {q && (
              <>
                ，关键词「<span className="font-semibold text-[#0e2a5e]">{q}</span>」
              </>
            )}
            {cat !== "all" && (
              <>
                ，分类「
                <span className="font-semibold text-[#0e2a5e]">
                  {getGlossaryCategory(cat as never).label}
                </span>
                」
              </>
            )}
          </p>
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {rows.map(({ term: t, fields }) => {
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
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${c.tint}`}
                      >
                        {c.label}
                      </span>
                      {t.jurisdiction.slice(0, 3).map((j) => (
                        <span
                          key={j}
                          className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 ring-1 ring-slate-200"
                        >
                          📍 {j}
                        </span>
                      ))}
                      {refs && (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-100">
                          出现于 {refs}
                        </span>
                      )}
                    </span>
                    <p className="mt-2 text-[15px] font-bold text-slate-800 group-hover:text-[#0e2a5e]">
                      {t.term}
                      <span className="ml-2 text-xs font-normal text-slate-400">{t.zh}</span>
                    </p>
                    {t.fullName && t.fullName !== t.term && (
                      <p className="mt-0.5 truncate text-[11px] text-slate-400">{t.fullName}</p>
                    )}
                    <p className="mt-1 line-clamp-2 flex-1 text-[13px] leading-relaxed text-slate-500">
                      {termBrief(t)}
                    </p>
                    {fields.length > 0 && (
                      <p className="mt-1.5 text-[11px] text-emerald-600">
                        命中：{fields.slice(0, 4).join(" / ")}
                      </p>
                    )}
                    <span className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                      {t.source.map((s) => (
                        <span key={s} className="rounded bg-slate-50 px-1.5 py-0.5 ring-1 ring-slate-100">
                          {getTermSource(s)?.label ?? s}
                        </span>
                      ))}
                      <span className="ml-auto font-semibold text-[#0e2a5e]/70 transition group-hover:text-[#0e2a5e]">
                        查看完整术语 →
                      </span>
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

function chip(active: boolean): string {
  return `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
    active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
  }`;
}
