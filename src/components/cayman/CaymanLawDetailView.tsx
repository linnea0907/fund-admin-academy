"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getTerm } from "@/lib/glossary";
import TermLink from "@/components/glossary/TermLink";
import type { CaymanLawDetail, CaymanLawProvisionGroup } from "@/data/cayman-law-details";

/**
 * 开曼核心法规 · 条款级中英对照（客户端视图）
 *
 * - 左侧英文原文、右侧中文译注（桌面双栏；移动端上下堆叠）
 * - 条款中的术语用 TermLink 标注，点击打开右侧 Drawer 查看解释
 * - 顶部「本法规关联术语」chips，一键跳转术语详情页
 * - 若法规同时提供 summaryGroups（简化版）与 groups（完整对照版），
 *   顶部渲染「简化版 / 完整对照版」切换开关，默认展示简化版。
 */
export default function CaymanLawDetailView({ detail }: { detail: CaymanLawDetail }) {
  const hasSummary = Boolean(detail.summaryGroups && detail.summaryGroups.length > 0);
  const [view, setView] = useState<"summary" | "full">(hasSummary ? "summary" : "full");

  const groups: CaymanLawProvisionGroup[] = useMemo(
    () => (view === "summary" && detail.summaryGroups ? detail.summaryGroups : detail.groups),
    [view, detail]
  );

  const related = useMemo(
    () =>
      detail.relatedTerms
        .map((id) => ({ id, term: getTerm(id) }))
        .filter((x): x is { id: string; term: NonNullable<ReturnType<typeof getTerm>> } =>
          Boolean(x.term)
        ),
    [detail.relatedTerms]
  );

  return (
    <div className="space-y-5">
      {/* 法规头卡 */}
      <header className="rounded-2xl bg-gradient-to-br from-[#0e2a5e] to-[#173d7a] px-5 py-6 text-white sm:px-7 sm:py-7">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-50 ring-1 ring-white/15">
            {detail.kind}
          </span>
          <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-blue-50 ring-1 ring-white/15">
            {detail.year}
          </span>
          {detail.highlight && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                detail.highlight === "反洗钱"
                  ? "bg-red-500/20 text-red-100 ring-1 ring-red-300/30"
                  : "bg-amber-500/20 text-amber-100 ring-1 ring-amber-300/30"
              }`}
            >
              {detail.highlight}
            </span>
          )}
        </div>
        <h1 className="mt-3 text-xl font-black tracking-tight sm:text-2xl">{detail.nameZh}</h1>
        <p className="mt-1 text-sm text-blue-200/90">{detail.nameEn}</p>
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-blue-100/90">{detail.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/cayman-laws#cayman-law-${detail.milestoneId}`}
            className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15 transition hover:bg-white/20"
          >
            ← 返回法规沿革
          </Link>
          <a
            href={detail.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-amber-300 px-3 py-1 text-[11.5px] font-bold text-[#0e2a5e] transition hover:bg-amber-200"
          >
            查看官方文本（PDF）↗
          </a>
        </div>
      </header>

      {/* Fund Admin 实务提示 */}
      <p className="rounded-xl border border-[#0e2a5e]/15 bg-[#0e2a5e]/[0.03] px-4 py-3 text-xs leading-relaxed text-slate-600">
        <b className="text-[#0e2a5e]">Fund Admin 提示：</b>
        {detail.faNote}
      </p>

      {/* 本法规关联术语 */}
      {related.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-800">
            本法规关联术语
            <span className="ml-2 rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
              {related.length}
            </span>
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {related.map(({ id, term }) => (
              <Link
                key={id}
                href={`/glossary/${id}`}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:bg-[#0e2a5e] hover:text-white"
              >
                {term.term}
                <span className="ml-1 font-normal opacity-70">{term.zh}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 简化版 / 完整对照版切换 */}
      {hasSummary && (
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setView("summary")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              view === "summary"
                ? "bg-[#0e2a5e] text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            简化版
            <span className="ml-1.5 font-normal opacity-70">
              {detail.summaryGroups?.reduce((n, g) => n + g.provisions.length, 0) ?? 0} 条
            </span>
          </button>
          <button
            type="button"
            onClick={() => setView("full")}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              view === "full"
                ? "bg-[#0e2a5e] text-white"
                : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            完整对照版
            <span className="ml-1.5 font-normal opacity-70">
              {detail.groups.reduce((n, g) => n + g.provisions.length, 0)} 条
            </span>
          </button>
        </div>
      )}

      {/* 条款级中英对照 */}
      {groups.map((g) => (
        <section key={g.titleEn} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-sm font-bold text-slate-800">{g.titleZh}</h2>
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {g.titleEn}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {g.provisions.map((p) => (
              <article
                key={`${g.titleEn}-${p.ref}`}
                className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50/20 md:grid-cols-2 md:gap-5"
              >
                {/* 英文原文 */}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {p.ref}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      EN
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-700">{p.en}</p>
                </div>
                {/* 中文译注 */}
                <div className="border-t border-dashed border-slate-200 pt-3 md:border-l md:border-t-0 md:pl-5 md:pt-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      ZH 译注
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{p.zh}</p>
                </div>

                {/* 关联术语热词 */}
                {p.terms && p.terms.length > 0 && (
                  <div className="col-span-1 mt-1 flex flex-wrap items-center gap-1.5 md:col-span-2">
                    <span className="text-[10px] font-semibold text-slate-400">术语</span>
                    {p.terms.map((tid) => {
                      const t = getTerm(tid);
                      if (!t) return null;
                      return (
                        <TermLink key={tid} termId={tid}>
                          {t.term}
                        </TermLink>
                      );
                    })}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}

      <p className="pt-1 text-center text-[11px] text-slate-400">
        英文原文以 CIMA / legislation.gov.ky / ciregistry.ky 官方发布为准；中文为学习译注，不构成法律意见。
      </p>
    </div>
  );
}
