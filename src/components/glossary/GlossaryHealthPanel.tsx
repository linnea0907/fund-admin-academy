"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getGlossaryCategory, getTerm, getTermLevel } from "@/lib/glossary";
import type { WikiHealthBreakdown, WikiHealthSummary } from "@/lib/glossary-usage";
import {
  TERM_METRICS_WINDOW_DAYS,
  clearTermMetrics,
  loadTermMetrics,
  metricEventCount,
  topTerms,
  type TermMetricsState,
  type TopTermRow,
} from "@/lib/wiki-metrics";

/** 覆盖率配色：>=70 绿 / >=40 琥珀 / 其余 红 */
function coverageTone(pct: number) {
  if (pct >= 70) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", ring: "ring-emerald-200" };
  if (pct >= 40) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-50", ring: "ring-amber-200" };
  return { bar: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", ring: "ring-rose-200" };
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number | string;
  sub?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const cls =
    tone === "good"
      ? "border-emerald-200 bg-emerald-50"
      : tone === "warn"
        ? "border-amber-200 bg-amber-50"
        : tone === "bad"
          ? "border-rose-200 bg-rose-50"
          : "border-slate-200 bg-white";
  return (
    <div className={`rounded-2xl border px-4 py-3 ${cls}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums text-slate-800">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function BreakdownTable({
  title,
  hint,
  rows,
}: {
  title: string;
  hint: string;
  rows: WikiHealthBreakdown[];
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-sm font-bold text-slate-800">{title}</h2>
        <span className="text-[11px] text-slate-400">{hint}</span>
      </div>
      <ul className="mt-3 space-y-2">
        {rows.map((r) => {
          const tone = coverageTone(r.coverage);
          return (
            <li key={r.key} className="flex items-center gap-3">
              <span className="w-40 shrink-0 truncate text-xs font-medium text-slate-600" title={r.label}>
                {r.label}
              </span>
              <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                <span
                  className={`block h-full rounded-full ${tone.bar}`}
                  style={{ width: `${Math.max(r.coverage, r.coverage > 0 ? 3 : 0)}%` }}
                />
              </span>
              <span className={`w-24 shrink-0 text-right text-[11px] tabular-nums ${tone.text}`}>
                {r.coverage}%
                <span className="ml-1 text-slate-400">
                  · 孤立 {r.isolated}
                </span>
              </span>
              <span className="w-16 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
                {r.linked}/{r.total}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** 术语库 · 健康度 Dashboard（V1.14.1 随 /wiki 引入；V1.15.2 知识工坊下线后迁入术语库页签）
 *
 *  口径与 /glossary 列表、术语详情完全同源（buildWikiHealth / buildTermRelations），
 *  双口径并存：merged（自动命中 ∪ 人工指定）与 auto（仅正文自动命中）。 */
export default function GlossaryHealthPanel({
  health,
  onShowList,
}: {
  health: WikiHealthSummary;
  /** 切回「术语列表」页签（用于「去列表筛孤立术语」入口） */
  onShowList: () => void;
}) {
  // 本面板只在客户端页签展开时挂载 → 初始 render 即可惰性读 localStorage
  const [metrics, setMetrics] = useState<TermMetricsState>(() => loadTermMetrics());
  const [showAllIsolated, setShowAllIsolated] = useState(false);

  const top = useMemo(() => topTerms(metrics, TERM_METRICS_WINDOW_DAYS, 10), [metrics]);
  const eventCount = useMemo(() => metricEventCount(metrics, TERM_METRICS_WINDOW_DAYS), [metrics]);

  const tone = coverageTone(health.coverage);
  const isolatedShown = showAllIsolated ? health.isolatedTerms : health.isolatedTerms.slice(0, 24);

  /** 薄弱分类（覆盖率升序，取前三） */
  const weakest = useMemo(
    () => [...health.byCategory].sort((a, b) => a.coverage - b.coverage || b.isolated - a.isolated).slice(0, 3),
    [health.byCategory]
  );

  return (
    <div className="space-y-5">
      {/* 概览 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">Wiki Health Dashboard</h2>
          <span className="rounded-full bg-[#0e2a5e]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#0e2a5e]">
            知识网络完整度
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          覆盖率 = 至少关联 1 门课程 <b>或</b> 1 个案例的术语占比。「关联」包含课程 / 案例正文的自动命中，
          以及术语数据里人工指定的关联。孤立术语即两者皆无的知识孤岛。
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Total Terms" value={health.total} sub="术语总数" />
          <Stat
            label="Linked to Courses"
            value={health.linkedCourses}
            sub={`${Math.round((health.linkedCourses / health.total) * 100)}% 术语`}
            tone={health.linkedCourses > 0 ? "good" : "default"}
          />
          <Stat
            label="Linked to Cases"
            value={health.linkedCases}
            sub={`${Math.round((health.linkedCases / health.total) * 100)}% 术语`}
            tone={health.linkedCases > 0 ? "good" : "default"}
          />
          <Stat label="Linked to Both" value={health.linkedBoth} sub="课程 + 案例都有" />
          <Stat
            label="Isolated Terms"
            value={health.isolated}
            sub="知识孤岛，需补关联"
            tone={health.isolated > 0 ? "warn" : "good"}
          />
          <Stat
            label="Coverage"
            value={`${health.coverage}%`}
            sub={`${health.linkedAny} / ${health.total} 已入网`}
            tone={health.coverage >= 70 ? "good" : health.coverage >= 40 ? "warn" : "bad"}
          />
        </div>

        {/* 覆盖率总条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>知识网络覆盖率</span>
            <span className="tabular-nums">
              {health.linkedAny} 已关联 · {health.isolated} 孤立
            </span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${health.coverage}%` }} />
          </div>
        </div>

        {weakest.length > 0 && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-2.5 text-xs leading-relaxed text-amber-800">
            <b>薄弱区域（按覆盖率升序）</b>：
            {weakest.map((w, i) => (
              <span key={w.key}>
                {i > 0 && " · "}
                {w.label} <span className="tabular-nums">{w.coverage}%</span>
                <span className="text-amber-600/80">（孤立 {w.isolated}）</span>
              </span>
            ))}
            <span className="ml-1 text-amber-700/80">—— 建议优先在这些分类补课程 / 案例引用。</span>
          </p>
        )}

        <p className="mt-3 rounded-xl bg-slate-50 px-4 py-2.5 text-[11px] leading-relaxed text-slate-500">
          <b className="text-slate-600">口径对照</b>：上表为「自动命中 ∪ 人工指定」。
          其中<b>仅正文自动命中</b>口径为 —— 课程 {health.auto.linkedCourses} · 案例 {health.auto.linkedCases} ·
          两者 {health.auto.linkedBoth} · 孤立 {health.auto.isolated} · 覆盖率 {health.auto.coverage}%。
          两口径的差值即「仅在术语数据里人工挂靠、正文尚未引用」的部分，是下一阶段真正需要补内容的地方。
        </p>
      </section>

      {/* 分类 / 等级 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BreakdownTable
          title="按分类（Category）"
          hint="定位哪一类知识最缺关联"
          rows={[...health.byCategory].sort((a, b) => a.coverage - b.coverage)}
        />
        <BreakdownTable
          title="按成熟度（Level）"
          hint="Core / Advanced / Expert 的入网情况"
          rows={health.byLevel}
        />
      </div>

      {/* 孤立术语 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">孤立术语（Isolated Terms）</h2>
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 ring-1 ring-amber-200">
            {health.isolated} 条
          </span>
          <button
            type="button"
            onClick={onShowList}
            className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-[#0e2a5e]"
          >
            去术语列表筛「仅看孤立术语」→
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          这些术语既未在课程正文出现、也未在案例正文出现，点开可查看详情并在内容侧引入。
        </p>
        {health.isolatedTerms.length === 0 ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
            没有孤立术语 —— 全部 {health.total} 条术语都已进入知识网络。
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {isolatedShown.map((t) => {
                const c = getGlossaryCategory(t.category);
                return (
                  <Link
                    key={t.id}
                    href={`/glossary/${t.id}`}
                    title={`${t.term} · ${t.zh}（${c.label} / ${getTermLevel(t.level).label}）`}
                    className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800"
                  >
                    {t.term}
                    <span className="ml-1 font-normal text-slate-400">{t.zh}</span>
                  </Link>
                );
              })}
            </div>
            {health.isolatedTerms.length > 24 && (
              <button
                type="button"
                onClick={() => setShowAllIsolated((v) => !v)}
                className="mt-3 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-200"
              >
                {showAllIsolated ? "收起" : `展开全部 ${health.isolatedTerms.length} 条`}
              </button>
            )}
          </>
        )}
      </section>

      {/* Top Terms */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">Top Terms</h2>
          <span className="rounded-full bg-[#0e2a5e]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#0e2a5e]">
            过去 {TERM_METRICS_WINDOW_DAYS} 天 · 本机
          </span>
          {eventCount > 0 && (
            <button
              type="button"
              onClick={() => {
                clearTermMetrics();
                setMetrics(loadTermMetrics());
              }}
              className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-200"
            >
              清空本机统计
            </button>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          记录<b>本机</b>对术语的浏览（打开详情页）与检索命中（互搜命中）。站点为静态导出、不采集服务端访问数据，
          因此榜单口径是「你最近在看什么」，用于识别学习需求与内容优先级，不代表全站流量。
        </p>
        {top.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
            暂无数据 —— 打开任意术语详情页或在 Fund Admin Wiki 中检索术语，即可累积热度。
          </p>
        ) : (
          <ol className="mt-3 space-y-1.5">
            {top.map((row, i) => (
              <TopTermRowItem key={row.id} rank={i + 1} row={row} />
            ))}
          </ol>
        )}
      </section>

      {/* Knowledge Notes 预留 */}
      <section className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-600">Knowledge Notes（下一阶段预留）</h2>
          <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            V1.15.0
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          实务中大量知识既不是术语、也不是单个案例，而是「判断规则 / 接受标准 / 穿透逻辑」。
          本版本已预留数据结构（<code className="rounded bg-white px-1 ring-1 ring-slate-200">src/types/knowledge-note.ts</code>），
          尚未开发页面与检索接入。
        </p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {["台湾地址证明接受标准", "AML Letter 接受条件", "Trust 穿透逻辑", "DMA 判断逻辑", "美国 W-8BEN 填写要点"].map((t) => (
            <li key={t} className="rounded-full bg-white px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-200">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function TopTermRowItem({ rank, row }: { rank: number; row: TopTermRow }) {
  const term = getTerm(row.id);
  if (!term) return null;
  const c = getGlossaryCategory(term.category);
  const lv = getTermLevel(term.level);
  return (
    <li>
      <Link
        href={`/glossary/${row.id}`}
        className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/40"
      >
        <span
          className={`w-6 shrink-0 text-center text-xs font-black tabular-nums ${
            rank <= 3 ? "text-amber-500" : "text-slate-300"
          }`}
        >
          {rank}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
          {term.term}
          <span className="ml-1.5 font-normal text-slate-400">{term.zh}</span>
        </span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${c.tint}`}>{c.label}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${lv.tint}`}>{lv.label}</span>
        <span className="w-28 shrink-0 text-right text-[11px] tabular-nums text-slate-500">
          浏览 {row.views} · 检索 {row.searches}
        </span>
      </Link>
    </li>
  );
}
