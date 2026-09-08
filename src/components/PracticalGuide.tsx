"use client";

import { useState } from "react";
import type { CommonMistake } from "@/types";

/**
 * 实务手册 Practical Guide —— 将课程数据中的 checklist / commonMistakes /
 * documentsToCheck / escalationTriggers 渲染为课程内区块。
 * 位置约定：风险提示 ↓ 实务手册 ↓ 思维导图。
 * 说明：勾选状态仅存于当前页面会话（不影响 localStorage 学习进度）。
 */
export default function PracticalGuide({
  checklist,
  commonMistakes,
  documentsToCheck,
  escalationTriggers,
}: {
  checklist: string[];
  commonMistakes: CommonMistake[];
  documentsToCheck: string[];
  escalationTriggers: string[];
}) {
  // Admin Checklist 勾选状态（会话级，不改写持久化进度）
  const [checked, setChecked] = useState<boolean[]>(() =>
    checklist.map(() => false)
  );
  const doneCount = checked.filter(Boolean).length;

  const hasAny =
    checklist.length > 0 ||
    commonMistakes.length > 0 ||
    documentsToCheck.length > 0 ||
    escalationTriggers.length > 0;
  if (!hasAny) return null;

  return (
    <section
      id="practical-guide"
      className="mt-6 scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* 区块头 */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-[#0e2a5e]">实务手册</h2>
        <span className="text-xs font-medium uppercase tracking-widest text-slate-400">
          Practical Guide
        </span>
      </div>

      {/* ===== 1. Admin Checklist ===== */}
      {checklist.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <span aria-hidden>✅</span> Admin Checklist
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
              {doneCount}/{checklist.length} 已完成
            </span>
          </div>
          <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-200">
            {checklist.map((item, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={checked[i]}
                  onClick={() =>
                    setChecked((prev) =>
                      prev.map((v, idx) => (idx === i ? !v : v))
                    )
                  }
                  className={`flex w-full items-start gap-3 px-3.5 py-2.5 text-left transition ${
                    checked[i]
                      ? "bg-emerald-50/60"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border text-[11px] transition ${
                      checked[i]
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-slate-300 bg-white text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span
                    className={`text-[13px] leading-relaxed ${
                      checked[i]
                        ? "text-slate-400 line-through"
                        : "text-slate-700"
                    }`}
                  >
                    {item}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 2. Common Mistakes ===== */}
      {commonMistakes.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <span aria-hidden>⚠️</span> Common Mistakes
          </h3>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {commonMistakes.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border-l-4 border-rose-300 bg-rose-50/60 px-4 py-3"
              >
                <p className="text-[13px] font-bold text-rose-800">{m.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-rose-700/90">
                  {m.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== 3. Documents To Check ===== */}
      {documentsToCheck.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <span aria-hidden>📄</span> Documents To Check
          </h3>
          <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl ring-1 ring-slate-200">
            {documentsToCheck.map((doc, i) => (
              <li
                key={i}
                className="flex items-center gap-3 bg-white px-3.5 py-2.5 transition hover:bg-slate-50"
              >
                <svg
                  className="h-4 w-4 shrink-0 text-[#0e2a5e]/60"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M4 1.5h5L12.5 5v9.5h-8.5z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                  <path d="M9 1.5V5h3.5" stroke="currentColor" strokeWidth="1.4" />
                </svg>
                <span className="text-[13px] leading-relaxed text-slate-700">
                  {doc}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ===== 4. Escalation Triggers ===== */}
      {escalationTriggers.length > 0 && (
        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
            <span aria-hidden>🚨</span> Escalation Triggers
          </h3>
          <ul className="mt-2 space-y-2">
            {escalationTriggers.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5"
              >
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                  !
                </span>
                <span className="text-[13px] leading-relaxed text-amber-900">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
