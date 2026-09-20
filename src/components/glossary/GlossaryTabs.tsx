"use client";

import { useState } from "react";
import type { GlossaryTerm, TermJurisdiction, TermSourceDef } from "@/lib/glossary";
import type { WikiHealthSummary } from "@/lib/glossary-usage";
import type { TermCandidatePool } from "@/types/term-candidates";
import GlossaryExplorer, { type TermUsageCounts } from "./GlossaryExplorer";
import GlossaryHealthPanel from "./GlossaryHealthPanel";
import TermReviewPanel from "./TermReviewPanel";

type Tab = "list" | "health" | "review";

/** 术语库页签（V1.15.2 起双页签；V1.20.5 增「术语审核」）
 *
 *  知识工坊（/wiki）下线后，其「健康度 Dashboard」并未消失 —— 作为术语库的第二个页签保留，
 *  术语列表（Terms）与知识网络健康度在同一入口下切换。
 *  V1.20.5「术语自动发现」的审核入口同样按此模式落为第三页签，**不新增独立导航模块**。
 *  默认「术语列表」：健康度面板含本机 localStorage 热度读数，默认不挂载可避免首屏无谓读取；
 *  术语审核面板同理（含本机审核状态），只在点开时挂载。 */
export default function GlossaryTabs({
  terms,
  usageCounts,
  jurisdictions,
  sources,
  health,
  candidatePool,
}: {
  terms: GlossaryTerm[];
  usageCounts: Record<string, TermUsageCounts>;
  jurisdictions: TermJurisdiction[];
  sources: TermSourceDef[];
  health: WikiHealthSummary;
  /** 构建期扫描产出的候选池（V1.20.5） */
  candidatePool: TermCandidatePool;
}) {
  const [tab, setTab] = useState<Tab>("list");

  return (
    <div className="space-y-5">
      <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <TabButton
          active={tab === "list"}
          onClick={() => setTab("list")}
          label="术语列表"
          count={terms.length}
          testId="list"
        />
        <TabButton
          active={tab === "health"}
          onClick={() => setTab("health")}
          label="健康度 Dashboard"
          count={`${health.coverage}%`}
          hint={
            health.isolated > 0
              ? `知识网络覆盖率 · 孤立 ${health.isolated} 条`
              : "知识网络覆盖率"
          }
          testId="health"
        />
        <TabButton
          active={tab === "review"}
          onClick={() => setTab("review")}
          label="术语审核"
          count={candidatePool.candidates.length}
          hint="术语自动发现：发现 → 审核（采纳 / 忽略）→ 导出补全包"
          testId="review"
        />
      </div>

      {tab === "list" ? (
        <GlossaryExplorer
          terms={terms}
          usageCounts={usageCounts}
          jurisdictions={jurisdictions}
          sources={sources}
        />
      ) : tab === "health" ? (
        <GlossaryHealthPanel health={health} onShowList={() => setTab("list")} />
      ) : (
        <TermReviewPanel pool={candidatePool} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
  hint,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number | string;
  hint?: string;
  /** 稳定测试锚点（UI 冒烟按 data-tab 选页签，不依赖文案） */
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-tab={testId}
      aria-current={active ? "page" : undefined}
      title={hint}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#0e2a5e] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}
