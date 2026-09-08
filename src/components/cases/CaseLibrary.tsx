"use client";

import { useMemo, useState } from "react";
import type { CaseMeta } from "@/types";
import { CASE_MODULES } from "@/lib/case-modules";
import { useAcademy } from "@/hooks/use-academy";
import CaseCard from "./CaseCard";

type StatusFilter = "all" | "pending" | "active" | "done";

function sortValues(vals: Set<string>): string[] {
  return Array.from(vals).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

/** 案例库目录：模块 / 难度 / 标签 / 状态筛选 + 学习进度统计（V2） */
export default function CaseLibrary({ cases }: { cases: CaseMeta[] }) {
  const { state } = useAcademy();
  const doneIds = useMemo(
    () => new Set(state.completedCases.filter((c) => c.startsWith("Case-"))),
    [state.completedCases]
  );

  const [status, setStatus] = useState<StatusFilter>("all");
  const [module, setModule] = useState<number | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const readyTotal = cases.filter((c) => c.ready).length;
  const doneTotal = cases.filter((c) => c.ready && doneIds.has(c.id)).length;
  const pendingTotal = cases.length - readyTotal;
  const progress = readyTotal === 0 ? 0 : Math.round((doneTotal / readyTotal) * 100);

  // 可选项（由已导入内容动态生成）
  const levels = useMemo(
    () => sortValues(new Set(cases.filter((c) => c.ready && c.level).map((c) => c.level))),
    [cases]
  );
  const tags = useMemo(
    () => sortValues(new Set(cases.filter((c) => c.ready).flatMap((c) => c.tags))),
    [cases]
  );
  const moduleCounts = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of cases) m.set(c.module, (m.get(c.module) ?? 0) + 1);
    return m;
  }, [cases]);

  // 需要清除的筛选：难度/标签选中项若已不存在则自动重置
  const shownLevel = level && levels.includes(level) ? level : null;
  const shownTag = tag && tags.includes(tag) ? tag : null;

  const filtered = cases.filter((c) => {
    if (status === "pending" && c.ready) return false;
    if (status === "active" && (!c.ready || doneIds.has(c.id))) return false;
    if (status === "done" && !(c.ready && doneIds.has(c.id))) return false;
    if (module !== null && c.module !== module) return false;
    if (shownLevel && c.level !== shownLevel) return false;
    if (shownTag && !c.tags.includes(shownTag)) return false;
    return true;
  });

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: cases.length },
    { key: "pending", label: "待导入", count: pendingTotal },
    { key: "active", label: "学习中", count: readyTotal - doneTotal },
    { key: "done", label: "已完成", count: doneTotal },
  ];

  const noFilter = module === null && !shownLevel && !shownTag && status === "all";

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">案例库</h1>
            <p className="mt-1 text-sm text-slate-500">
              Fund Admin 实务案例库 · 答案以 ICS 内部 SOP 为准 · 共 {cases.length} 个案例，已导入{" "}
              {readyTotal} 个，完成 {doneTotal} 个
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-400">已导入完成率</p>
              <p className="text-lg font-bold text-[#0e2a5e]">
                {readyTotal === 0 ? "—" : `${progress}%`}
              </p>
            </div>
            {/* 环形进度 */}
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#eef1f6" strokeWidth="7" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={progress === 100 ? "#10b981" : "#0e2a5e"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                  className="transition-all"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 筛选区 */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">模块</span>
          <button
            type="button"
            onClick={() => setModule(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              module === null
                ? "bg-[#0e2a5e] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            全部
          </button>
          {CASE_MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              title={`${m.title} · ${m.zh}`}
              onClick={() => setModule(module === m.id ? null : m.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                module === m.id
                  ? "bg-[#0e2a5e] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              M{m.id} · {m.zh} {moduleCounts.get(m.id) ?? 0}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">状态</span>
          {statusTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStatus(t.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                status === t.key
                  ? "bg-[#0e2a5e] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label} {t.count}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">难度</span>
          {levels.length === 0 ? (
            <span className="text-xs text-slate-300">暂无（内容导入后自动出现）</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setLevel(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !shownLevel
                    ? "bg-[#0e2a5e] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                全部
              </button>
              {levels.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setLevel(shownLevel === lv ? null : lv)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    shownLevel === lv
                      ? "bg-amber-400 text-amber-950"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">标签</span>
          {tags.length === 0 ? (
            <span className="text-xs text-slate-300">暂无（内容导入后自动出现）</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setTag(null)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  !shownTag
                    ? "bg-[#0e2a5e] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                全部
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag(shownTag === t ? null : t)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    shownTag === t
                      ? "bg-amber-400 text-amber-950"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      {/* 案例网格 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">
            {noFilter ? "暂无案例" : "没有符合当前筛选条件的案例"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            案例正文按模块分阶段导入（以 ICS 内部 SOP 为准），导入后自动出现在此处
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CaseCard key={c.id} item={c} done={doneIds.has(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
