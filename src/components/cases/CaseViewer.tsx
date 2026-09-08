"use client";

import Link from "next/link";
import type { CaseSectionKey } from "@/types";
import { useAcademy } from "@/hooks/use-academy";
import MarkdownBody from "./MarkdownBody";

export interface CaseViewerSection {
  key: CaseSectionKey;
  label: string;
  hint: string;
  content: string;
}

interface Neighbor {
  id: string;
  title: string;
  ready: boolean;
}

interface CaseViewerProps {
  id: string;
  title: string;
  level: string;
  category: string;
  tags: string[];
  ready: boolean;
  sections: CaseViewerSection[];
  prev: Neighbor | null;
  next: Neighbor | null;
}

export default function CaseViewer({
  id,
  title,
  level,
  category,
  tags,
  ready,
  sections,
  prev,
  next,
}: CaseViewerProps) {
  const { state, toggleCaseComplete } = useAcademy();
  const done = state.completedCases.includes(id);

  return (
    <div className="space-y-6">
      {/* ===== 深蓝 Banner ===== */}
      <header className="relative overflow-hidden rounded-2xl bg-[#0e2a5e] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 text-xs text-blue-200">
            <Link href="/cases" className="hover:underline">
              ← 案例库
            </Link>
            <span>/</span>
            <span className="rounded bg-white/10 px-2 py-0.5 font-semibold text-white">
              {id}
            </span>
            {!ready && (
              <span className="rounded bg-amber-300 px-2 py-0.5 font-semibold text-amber-950">
                内容待导入
              </span>
            )}
            {done && (
              <span className="rounded bg-emerald-400 px-2 py-0.5 font-semibold text-emerald-950">
                ✓ 已完成
              </span>
            )}
          </div>

          <h1 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
            {ready && title ? title : `案例 ${id} · 内容待导入`}
          </h1>

          {(level || category || tags.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {level && (
                <span className="rounded-md bg-amber-300/90 px-2 py-0.5 text-xs font-semibold text-amber-950">
                  {level}
                </span>
              )}
              {category && (
                <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-blue-100">
                  {category}
                </span>
              )}
              {tags.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-100"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5">
            {ready ? (
              <button
                type="button"
                onClick={() => toggleCaseComplete(id)}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  done
                    ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                    : "bg-white text-[#0e2a5e] hover:bg-blue-50"
                }`}
              >
                {done ? "✓ 已标记完成" : "标记为已完成"}
              </button>
            ) : (
              <p className="text-xs text-blue-200/90">
                案例正文尚未导入，待 Copilot 提供内容后即可学习与标记完成。
              </p>
            )}
          </div>
        </div>
      </header>

      {/* ===== 正文小节 ===== */}
      {!ready ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 text-center">
          <p className="text-base font-bold text-slate-500">本案例内容待导入</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            11 个统一字段（id / title / level / category / tags / background / facts /
            questions / analysis / practical_steps / common_mistakes / further_reading）
            已预置在 content/cases/{id}.md 中，正文由 Copilot 分阶段填充。
          </p>
        </div>
      ) : (
        sections.map((s) => (
          <section
            key={s.key}
            className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
              <span className="flex h-6 items-center rounded-md bg-[#0e2a5e] px-2 text-xs text-white">
                {id}
              </span>
              {s.label}
              <span className="text-xs font-normal text-slate-300">· {s.hint}</span>
            </h2>
            <div className="mt-4">
              <MarkdownBody content={s.content} />
            </div>
          </section>
        ))
      )}

      {/* ===== 上/下一案例 ===== */}
      <nav className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/cases/${prev.id.toLowerCase()}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-xs text-slate-400">← 上一案例</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {prev.id}
              {prev.title ? ` · ${prev.title}` : " · 待导入"}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/cases/${next.id.toLowerCase()}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-xs text-slate-400">下一案例 →</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {next.id}
              {next.title ? ` · ${next.title}` : " · 待导入"}
            </p>
          </Link>
        )}
      </nav>
    </div>
  );
}
