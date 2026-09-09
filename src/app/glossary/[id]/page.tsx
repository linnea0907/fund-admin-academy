import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOSSARY_TERMS,
  getGlossaryCategory,
  getTerm,
} from "@/lib/glossary";
import { getTermUsage } from "@/lib/glossary-usage";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) return { title: "术语不存在" };
  return {
    title: `${term.en} · ${term.zh}`,
    description: term.brief,
  };
}

const CATEGORY_TINT: Record<string, string> = {
  kyc: "bg-sky-50 text-sky-700 ring-sky-200",
  aml: "bg-rose-50 text-rose-700 ring-rose-200",
  structure: "bg-teal-50 text-teal-700 ring-teal-200",
  documents: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  operations: "bg-amber-50 text-amber-700 ring-amber-200",
};

export default async function GlossaryTermPage({ params }: { params: Params }) {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) notFound();

  const category = getGlossaryCategory(term.category);
  const usage = getTermUsage(id);

  return (
    <div className="space-y-5">
      {/* 面包屑 */}
      <p className="text-sm text-slate-400">
        <Link href="/glossary" className="font-medium text-[#0e2a5e] hover:underline">
          ← 术语库
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-500">{term.en}</span>
      </p>

      {/* 术语头卡 */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${
              CATEGORY_TINT[term.category] ?? "bg-slate-100 text-slate-500 ring-slate-200"
            }`}
          >
            {category.label}
          </span>
          <span className="text-xs text-slate-400">{category.zh}</span>
          <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
            出现于 {usage.lessons.length} 讲课程 · {usage.cases.length} 个案例
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">{term.en}</h1>
        <p className="mt-1 text-base text-slate-500">{term.zh}</p>
        <p className="mt-3 max-w-3xl rounded-xl bg-[#0e2a5e]/[0.04] px-4 py-3 text-sm font-medium leading-relaxed text-[#0e2a5e]/90">
          {term.brief}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* 左列：定义 + 误区 + 关联 */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">定义</h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">{term.definition}</p>
          </section>

          {term.commonMistakes.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <h2 className="text-sm font-bold text-amber-800">常见误区</h2>
              <ul className="mt-3 space-y-2">
                {term.commonMistakes.map((mk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-amber-900">
                    <span className="mt-px shrink-0 font-bold text-amber-500">✕</span>
                    {mk}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {term.related.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">关联术语</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {term.related.map((rid) => {
                  const rt = getTerm(rid);
                  if (!rt) return null;
                  return (
                    <Link
                      key={rid}
                      href={`/glossary/${rid}`}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:bg-[#0e2a5e] hover:text-white"
                    >
                      {rt.en}
                      <span className="ml-1 font-normal opacity-70">{rt.zh}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* 右列：出现位置 */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">相关课程</h2>
            {usage.lessons.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">暂未在课程正文中命中</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {usage.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${l.slug}`}
                      className="block rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold ${
                            l.id.startsWith("E")
                              ? "bg-amber-100 text-amber-700"
                              : "bg-[#0e2a5e] text-white"
                          }`}
                        >
                          {l.id.startsWith("E") ? `E${l.id.replace("E", "")}` : `第 ${l.id} 讲`}
                        </span>
                        <span className="truncate text-sm font-semibold text-slate-700">
                          {l.title}
                        </span>
                      </span>
                      {l.modules.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {l.modules.slice(0, 5).map((mo) => (
                            <Link
                              key={`${l.id}/${mo.id}`}
                              href={`/courses/${l.slug}#${mo.id}`}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500 transition hover:bg-[#0e2a5e] hover:text-white"
                            >
                              {mo.title}
                            </Link>
                          ))}
                          {l.modules.length > 5 && (
                            <span className="text-[11px] text-slate-400">
                              +{l.modules.length - 5}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">相关案例</h2>
            {usage.cases.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">暂未在案例正文中命中</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {usage.cases.map((cs) => (
                  <li key={cs.id}>
                    <Link
                      href={`/cases/${cs.slug}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold text-slate-500">
                        {cs.id}
                      </span>
                      <span className="truncate text-sm text-slate-600">{cs.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      {/* 相邻术语导航 */}
      <nav className="flex flex-wrap gap-2 pt-1">
        {(() => {
          const idx = GLOSSARY_TERMS.findIndex((t) => t.id === id);
          const prevT = idx > 0 ? GLOSSARY_TERMS[idx - 1] : null;
          const nextT = idx >= 0 && idx < GLOSSARY_TERMS.length - 1 ? GLOSSARY_TERMS[idx + 1] : null;
          return (
            <>
              {prevT && (
                <Link
                  href={`/glossary/${prevT.id}`}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 transition hover:border-blue-300 hover:text-[#0e2a5e]"
                >
                  ← {prevT.en}
                </Link>
              )}
              {nextT && (
                <Link
                  href={`/glossary/${nextT.id}`}
                  className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 transition hover:border-blue-300 hover:text-[#0e2a5e]"
                >
                  {nextT.en} →
                </Link>
              )}
            </>
          );
        })()}
      </nav>
    </div>
  );
}
