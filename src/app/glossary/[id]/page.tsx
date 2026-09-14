import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GLOSSARY_TERMS,
  getGlossaryCategory,
  getTerm,
  getTermLevel,
  getTermSource,
  termBrief,
} from "@/lib/glossary";
import { getTermRelations } from "@/lib/glossary-usage";
import TermFavoriteButton from "@/components/favorites/TermFavoriteButton";
import TermViewTracker from "@/components/wiki/TermViewTracker";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return GLOSSARY_TERMS.map((t) => ({ id: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) return { title: "术语不存在" };
  return {
    title: `${term.term} · ${term.zh}`,
    description: termBrief(term),
  };
}

function LessonBadge({ id }: { id: string }) {
  const isElective = id.startsWith("E");
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold ${
        isElective ? "bg-amber-100 text-amber-700" : "bg-[#0e2a5e] text-white"
      }`}
    >
      {isElective ? id : `第 ${id} 讲`}
    </span>
  );
}

/** 术语详情页（V1.14.0：统一结构 + Related Terms / Cases / Courses） */
export default async function GlossaryTermPage({ params }: { params: Params }) {
  const { id } = await params;
  const term = getTerm(id);
  if (!term) notFound();

  const category = getGlossaryCategory(term.category);
  const level = getTermLevel(term.level);
  const relations = getTermRelations(id);
  const isIsolated = relations.lessons.length === 0 && relations.cases.length === 0;
  const idx = GLOSSARY_TERMS.findIndex((t) => t.id === id);
  const prevT = idx > 0 ? GLOSSARY_TERMS[idx - 1] : null;
  const nextT = idx >= 0 && idx < GLOSSARY_TERMS.length - 1 ? GLOSSARY_TERMS[idx + 1] : null;
  const mistakes = term.commonMistakes ?? [];

  return (
    <div className="space-y-5">
      <TermViewTracker termId={term.id} />
      {/* 面包屑 */}
      <nav aria-label="面包屑" className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <Link href="/search" className="font-medium text-slate-500 transition hover:text-[#0e2a5e]">
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <Link href="/glossary" className="font-medium text-slate-500 transition hover:text-[#0e2a5e]">
          Fund Admin Wiki
        </Link>
        <span aria-hidden>/</span>
        <span className="text-slate-500">Terms</span>
        <span aria-hidden>/</span>
        <span className="font-semibold text-[#0e2a5e]">{term.term}</span>
      </nav>

      {/* 术语头卡 */}
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${category.tint}`}
          >
            {category.label}
          </span>
          <span className="text-xs text-slate-400">{category.zh}</span>
          <span
            title={`术语成熟度：${level.label} · ${level.zh}`}
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${level.tint}`}
          >
            {level.label}
            <span className="ml-1 font-normal opacity-70">{level.zh}</span>
          </span>
          {term.jurisdiction.map((j) => (
            <Link
              key={j}
              href="/glossary"
              className="rounded-full bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e]"
            >
              📍 {j}
            </Link>
          ))}
          <span className="ml-auto flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                isIsolated ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200" : "bg-slate-100 text-slate-500"
              }`}
            >
              {isIsolated
                ? "孤立术语 · 暂无课程 / 案例关联"
                : `出现于 ${relations.lessons.length} 讲课程 · ${relations.cases.length} 个案例`}
            </span>
            <TermFavoriteButton termId={term.id} />
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-slate-800 sm:text-3xl">{term.term}</h1>
        {term.fullName && term.fullName !== term.term && (
          <p className="mt-1 text-sm text-slate-500">{term.fullName}</p>
        )}
        <p className="mt-1 text-base text-slate-500">{term.zh}</p>
        <p className="mt-3 max-w-3xl rounded-xl bg-[#0e2a5e]/[0.04] px-4 py-3 text-sm font-medium leading-relaxed text-[#0e2a5e]/90">
          {termBrief(term)}
        </p>

        {/* Source + Tags */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-[11px] font-semibold text-slate-400">来源</span>
          {term.source.map((s) => {
            const def = getTermSource(s);
            return (
              <span
                key={s}
                title={def?.nature}
                className="rounded-full bg-[#0e2a5e]/5 px-2.5 py-0.5 text-[11px] font-medium text-[#0e2a5e]"
              >
                {def?.label ?? s}
                {def && <span className="ml-1 text-[10px] text-slate-400">{def.nature}</span>}
              </span>
            );
          })}
          {term.tags.length > 0 && (
            <>
              <span className="ml-2 text-[11px] font-semibold text-slate-400">标签</span>
              {term.tags.map((t) => (
                <span key={t} className="rounded bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-100">
                  #{t}
                </span>
              ))}
            </>
          )}
        </div>
      </header>

      {isIsolated && (
        <p className="rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs leading-relaxed text-amber-800">
          <b>该术语尚未进入知识网络</b>：课程正文与案例正文都没有引用它，因此没有关联课程 / 关联案例。
          可在「知识工坊 → 健康度」查看全部孤立术语，优先在课程或案例中引入这些概念。
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* 左列 */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">定义</h2>
            <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">{term.definition}</p>
          </section>

          {term.whyImportant && (
            <section className="rounded-2xl border border-[#0e2a5e]/15 bg-[#0e2a5e]/[0.03] p-6">
              <h2 className="text-sm font-bold text-[#0e2a5e]">为什么重要</h2>
              <p className="mt-2.5 text-[15px] leading-relaxed text-slate-600">{term.whyImportant}</p>
            </section>
          )}

          {term.scenario.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">Fund Admin 实务场景</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {term.scenario.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {mistakes.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6">
              <h2 className="text-sm font-bold text-amber-800">常见误区</h2>
              <ul className="mt-3 space-y-2">
                {mistakes.map((mk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-amber-900">
                    <span className="mt-px shrink-0 font-bold text-amber-500">✕</span>
                    {mk}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {term.aliases.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">别名（Alias）</h2>
              <p className="mt-1 text-xs text-slate-400">
                以下任一名称均可检索到本术语（缩写 / 全称 / 中文别称互搜）
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {term.aliases.map((a) => (
                  <span
                    key={a}
                    className="rounded-full border border-slate-200 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {term.related.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800">关联术语（Related Terms）</h2>
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
                      {rt.term}
                      <span className="ml-1 font-normal opacity-70">{rt.zh}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* 右列：关联课程 / 关联案例 */}
        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              关联课程
              <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
                {relations.lessons.length}
              </span>
            </h2>
            {relations.lessons.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">暂未在课程正文中命中</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {relations.lessons.map((l) => (
                  <li key={l.id}>
                    <Link
                      href={`/courses/${l.slug}`}
                      className="block rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="flex items-center gap-2">
                        <LessonBadge id={l.id} />
                        <span className="truncate text-sm font-semibold text-slate-700">{l.title}</span>
                        {relations.manualCourses.includes(l.id) && (
                          <span className="ml-auto shrink-0 rounded bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-600">
                            指定
                          </span>
                        )}
                      </span>
                      {l.modules.length > 0 && (
                        <span className="mt-2 flex flex-wrap gap-1.5">
                          {l.modules.slice(0, 5).map((mo) => (
                            <span
                              key={`${l.id}/${mo.id}`}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500"
                            >
                              {mo.title}
                            </span>
                          ))}
                          {l.modules.length > 5 && (
                            <span className="text-[11px] text-slate-400">+{l.modules.length - 5}</span>
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
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
              关联案例
              <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
                {relations.cases.length}
              </span>
            </h2>
            {relations.cases.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">暂未在案例正文中命中</p>
            ) : (
              <ul className="mt-3 space-y-1.5">
                {relations.cases.map((cs) => (
                  <li key={cs.id}>
                    <Link
                      href={`/cases/${cs.slug}`}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/40"
                    >
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold text-slate-500">
                        {cs.id}
                      </span>
                      <span className="truncate text-sm text-slate-600">{cs.title}</span>
                      {relations.manualCases.includes(cs.id) && (
                        <span className="ml-auto shrink-0 rounded bg-emerald-50 px-1.5 py-px text-[10px] font-medium text-emerald-600">
                          指定
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">术语信息</h2>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">术语 id</dt>
                <dd className="font-mono text-slate-600">{term.id}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">分类</dt>
                <dd className="text-slate-600">{category.label}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">等级</dt>
                <dd className="text-slate-600">
                  {level.label} · {level.zh}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">属地</dt>
                <dd className="text-right text-slate-600">{term.jurisdiction.join(" · ")}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-400">关联术语</dt>
                <dd className="text-slate-600">{term.related.length}</dd>
              </div>
            </dl>
            <Link
              href="/glossary"
              className="mt-4 block rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-[#0e2a5e]"
            >
              返回 Fund Admin Wiki →
            </Link>
          </section>
        </aside>
      </div>

      {/* 相邻术语导航 */}
      <nav className="flex flex-wrap gap-2 pt-1">
        {prevT && (
          <Link
            href={`/glossary/${prevT.id}`}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 transition hover:border-blue-300 hover:text-[#0e2a5e]"
          >
            ← {prevT.term}
          </Link>
        )}
        {nextT && (
          <Link
            href={`/glossary/${nextT.id}`}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 transition hover:border-blue-300 hover:text-[#0e2a5e]"
          >
            {nextT.term} →
          </Link>
        )}
      </nav>
    </div>
  );
}
