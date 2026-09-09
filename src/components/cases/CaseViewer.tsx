"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CaseSectionKey } from "@/types";
import { getCaseModule } from "@/lib/case-modules";
import { levelLabel } from "@/lib/case-filter";
import { useAcademy } from "@/hooks/use-academy";
import MarkdownBody from "./MarkdownBody";
import HighlightEngine from "@/components/reading/HighlightEngine";

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
  module: number;
  level: string;
  tags: string[];
  skills: string[];
  estimatedTime: number | null;
  ready: boolean;
  sections: CaseViewerSection[];
  prev: Neighbor | null;
  next: Neighbor | null;
}

/** 小节卡片底色：区分「先思考 / 答案 / 总结」三类 */
const PANEL_STYLE: Partial<Record<CaseSectionKey, string>> = {
  questions: "border-blue-200 bg-blue-50/40",
  standard_answer: "border-amber-200 bg-amber-50/40",
  takeaway: "border-emerald-200 bg-emerald-50/40",
};

export default function CaseViewer({
  id,
  title,
  module,
  level,
  tags,
  skills,
  estimatedTime,
  ready,
  sections,
  prev,
  next,
}: CaseViewerProps) {
  const router = useRouter();
  const { state, completeCase, toggleCaseComplete, markCaseStarted, toggleFavorite } = useAcademy();
  const done = state.completedCases.includes(id);
  const completedAt = state.caseCompletedAt[id];
  const started = state.startedCases.includes(id);
  const fav = state.favorites.some((f) => f.type === "case" && f.caseId === id);
  const mod = getCaseModule(module);
  const levelText = levelLabel(level);

  // V1.12.1 底部「完成学习」：轻量 Toast + 跳转节流（防连点）
  const [toast, setToast] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const toastTimer = useRef<number | null>(null);
  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  /** 完成学习：置完成（幂等）→ Toast → 自动进入下一案例；已是最后一例则返回案例工坊 */
  const handleFinish = useCallback(() => {
    if (!ready || advancing) return;
    if (!done) completeCase(id);
    setAdvancing(true);
    if (next) {
      showToast(done ? "本案例已完成 · 前往下一案例" : "✅ 已标记为完成");
      window.setTimeout(() => {
        router.push(`/cases/${next.id.toLowerCase()}`);
      }, done ? 350 : 800);
    } else {
      showToast(done ? "已是最后一个案例 · 返回案例工坊" : "🎉 已完成全部案例 · 返回案例工坊");
      window.setTimeout(() => {
        router.push("/cases");
      }, done ? 350 : 1200);
    }
  }, [ready, advancing, done, id, next, completeCase, router, showToast]);

  // V1.8 状态口径：打开已导入案例详情即记为「开始学习」（已完成的不再改动）
  useEffect(() => {
    if (ready && !done && !started) markCaseStarted(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ready]);

  // V1.12 阅读高亮引擎的作用域（正文小节区域）
  const bodyScopeRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={bodyScopeRef} className="space-y-6">
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
            {mod && (
              <span
                className="rounded bg-white/10 px-2 py-0.5 font-medium text-blue-100"
                title={mod.title}
              >
                {mod.title}
              </span>
            )}
            {!ready && (
              <span className="rounded bg-amber-300 px-2 py-0.5 font-semibold text-amber-950">
                内容待导入
              </span>
            )}
            {done && (
              <span
                className="rounded bg-emerald-400 px-2 py-0.5 font-semibold text-emerald-950"
                title={
                  completedAt
                    ? `完成于 ${fmtDateTime(completedAt)}（可点 Banner 按钮取消完成）`
                    : "已完成（可点 Banner 按钮取消完成）"
                }
              >
                ✓ 已完成
              </span>
            )}
            {ready && !done && started && (
              <span className="rounded bg-blue-300 px-2 py-0.5 font-semibold text-blue-950">
                学习中
              </span>
            )}
          </div>

          <h1 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
            {title || `案例 ${id} · 内容待导入`}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {mod && (
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-blue-100">
                M{mod.id} · {mod.zh}
              </span>
            )}
            {levelText && (
              <span className="rounded-md bg-amber-300/90 px-2 py-0.5 text-xs font-semibold text-amber-950">
                {levelText}
              </span>
            )}
            {estimatedTime != null && (
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-blue-100">
                约 {estimatedTime} 分钟
              </span>
            )}
            {skills.map((s) => (
              <Link
                key={s}
                href={`/cases?skill=${encodeURIComponent(s)}`}
                className="rounded-full bg-emerald-300/90 px-2 py-0.5 text-xs font-semibold text-emerald-950 transition hover:bg-emerald-200"
                title="能力标签 · 点击按此技能筛选案例"
              >
                {s}
              </Link>
            ))}
            {tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-blue-100"
              >
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
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
                正文待对应 SOP 导入后即可学习与标记完成。
              </p>
            )}
            <button
              type="button"
              onClick={() => toggleFavorite({ type: "case", caseId: id })}
              title={fav ? "取消收藏本案例" : "收藏本案例"}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition ${
                fav
                  ? "bg-amber-300 text-amber-950 hover:bg-amber-200"
                  : "bg-white/10 text-blue-100 hover:bg-white/20"
              }`}
            >
              {fav ? "★ 已收藏" : "☆ 收藏"}
            </button>
          </div>
        </div>
      </header>

      {/* ===== 正文小节 ===== */}
      {!ready ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-12 text-center">
          <p className="text-base font-bold text-slate-500">本案例正文待导入</p>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-slate-400">
            案例元数据已预置在 content/cases/{id}.md 中。正文按 V2 模板
            （场景背景 → 已收到资料 → 缺失资料 → 你的判断 → 标准答案 → 理由分析 → 常见错误 →
            客户沟通示例 → ICS SOP依据 → Takeaway）编写，标准答案以 ICS 内部 SOP 为准。
          </p>
        </div>
      ) : (
        sections.map((s) => (
          <section
            key={s.key}
            className={`scroll-mt-20 rounded-2xl border p-5 sm:p-6 ${
              PANEL_STYLE[s.key] ?? "border-slate-200 bg-white"
            }`}
          >
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
              {s.label}
              <span className="text-xs font-normal text-slate-400">· {s.hint}</span>
            </h2>
            <div
              className="mt-4"
              data-reading-scope={`${id}-${s.key}`}
            >
              <MarkdownBody content={s.content} />
            </div>
          </section>
        ))
      )}

      {/* ===== V1.12.1 底部完成学习操作条（看完即完成，无需滚回顶部） ===== */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:gap-3 sm:p-4">
        {/* 上一案例 */}
        {prev ? (
          <Link
            href={`/cases/${prev.id.toLowerCase()}`}
            className="group flex min-w-0 flex-col justify-center rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#0e2a5e]">
              ← 上一案例
            </span>
            <span className="mt-0.5 truncate text-xs font-medium text-slate-600">
              {prev.id}
              {prev.title ? ` · ${prev.title}` : " · 正文待导入"}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}

        {/* ✅ 完成学习 */}
        <div className="flex min-w-0 flex-col items-center justify-center gap-1.5 px-1">
          {ready ? (
            <button
              type="button"
              data-finish-case={id}
              onClick={handleFinish}
              disabled={advancing}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition sm:px-6 ${
                done
                  ? "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-200"
                  : "bg-emerald-500 text-white shadow-sm hover:bg-emerald-400 disabled:opacity-60"
              }`}
            >
              {done && !next
                ? "🎉 完成全部案例 · 返回案例工坊"
                : done
                  ? "✓ 已完成 · 前往下一案例"
                  : "✅ 完成学习"}
            </button>
          ) : (
            <span
              className="cursor-not-allowed whitespace-nowrap rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-300 sm:px-6"
              title="正文待导入，暂不能标记完成"
            >
              内容待导入
            </span>
          )}
          {ready && (
            <span className="hidden text-[10px] text-slate-400 sm:block">
              {done
                ? next
                  ? "点击前往下一案例"
                  : "已完成 · 点击返回案例工坊"
                : "看完点击即完成 · 自动进入下一案例"}
            </span>
          )}
        </div>

        {/* 下一案例 */}
        {next ? (
          <Link
            href={`/cases/${next.id.toLowerCase()}`}
            className="group flex min-w-0 flex-col items-end justify-center rounded-xl border border-slate-100 px-3 py-2.5 text-right transition hover:border-blue-200 hover:bg-blue-50/40"
          >
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#0e2a5e]">
              下一案例 →
            </span>
            <span className="mt-0.5 truncate text-xs font-medium text-slate-600">
              {next.id}
              {next.title ? ` · ${next.title}` : " · 正文待导入"}
            </span>
          </Link>
        ) : (
          <span aria-hidden />
        )}
      </div>

      {/* 轻量 toast（完成学习反馈；自动跳转期间可见） */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#0e2a5e] px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* V1.12 阅读高亮引擎（正文小节内选中文字 → 高亮/写笔记/复制） */}
      <HighlightEngine
        sourceType="case"
        sourceId={id}
        sourceTitle={title ? `${id} ${title}` : `${id} 内容待导入`}
        scopeRef={bodyScopeRef}
        ready={ready}
      />
    </div>
  );
}

/** V1.12.1 完成时间展示：YYYY-MM-DD HH:mm（本地时区） */
function fmtDateTime(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
