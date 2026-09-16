"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { camsQuestions } from "@/data/cams";
import { CAMS_DOMAINS, CAMS_EXAM } from "@/types/cams";
import type { CamsDomain } from "@/types/cams";

const LETTERS = ["A", "B", "C", "D"];

type Phase = "intro" | "exam" | "result";

interface AnswerRecord {
  picked: number | null;
}

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

/** CAMS 全真模拟考试（V1.16.0）
 *  120 题 / 3.5 小时 / 自动计时 / 自动评分 / 错题回顾；按官方权重 Domain A→B→C→D 组卷。 */
export default function CamsExam() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [current, setCurrent] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = camsQuestions.length;
  const answeredCount = useMemo(
    () => Object.values(answers).filter((a) => a.picked !== null).length,
    [answers]
  );

  // 自动计时（进入考试即开始；到时自动交卷）
  useEffect(() => {
    if (phase !== "exam") return;
    const startedAt = Date.now();
    timerRef.current = setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      setElapsed(sec);
      if (sec >= CAMS_EXAM.durationMinutes * 60) {
        if (timerRef.current) clearInterval(timerRef.current);
        setPhase("result");
      }
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const timeLeft = Math.max(0, CAMS_EXAM.durationMinutes * 60 - elapsed);

  function start() {
    setAnswers({});
    setCurrent(0);
    setElapsed(0);
    setPhase("exam");
  }

  function pick(optIdx: number) {
    const q = camsQuestions[current];
    setAnswers((prev) => ({ ...prev, [q.id]: { picked: optIdx } }));
  }

  function jump(i: number) {
    setCurrent(i);
  }

  function submit() {
    setPhase("result");
  }

  function restart() {
    start();
  }

  /* ---------- 结果统计 ---------- */
  const stats = useMemo(() => {
    const byDomain: Record<CamsDomain, { correct: number; total: number }> = {
      A: { correct: 0, total: 0 },
      B: { correct: 0, total: 0 },
      C: { correct: 0, total: 0 },
      D: { correct: 0, total: 0 },
    };
    let correct = 0;
    let wrong: typeof camsQuestions = [];
    for (const q of camsQuestions) {
      const rec = answers[q.id];
      const picked = rec?.picked ?? null;
      byDomain[q.domain].total += 1;
      if (picked === q.answer) {
        correct += 1;
        byDomain[q.domain].correct += 1;
      } else if (picked !== null) {
        wrong = [...wrong, q];
      }
    }
    const percent = Math.round((correct / total) * 100);
    return { correct, wrong, percent, byDomain };
  }, [answers, total]);

  const passed = stats.percent >= CAMS_EXAM.passPercent;

  /* ---------- 说明页 ---------- */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-2xl bg-[#0e2a5e] px-6 py-7 text-white">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">CAMS 模拟考试</h1>
              <p className="mt-1.5 text-sm text-blue-100">
                按官方蓝图 Domain A→B→C→D 组卷 · 全真计时
              </p>
            </div>
            <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black text-[#0e2a5e]">
              内测 · CAMS 认证支持
            </span>
          </div>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-slate-800">考试结构</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="题量" value={`${CAMS_EXAM.questionCount} 题`} />
            <Stat label="时长" value="3.5 小时" />
            <Stat label="及格线" value={`${CAMS_EXAM.passPercent}%`} />
            <Stat label="题型" value="单选题" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-slate-800">官方权重（Examination Blueprint）</h2>
          <div className="mt-3 space-y-2.5">
            {CAMS_DOMAINS.map((d) => (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-14 shrink-0 text-sm font-bold text-[#0e2a5e]">
                  CAMS-{d.id}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-600">{d.titleZh}</p>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${d.accent}`}
                      style={{ width: `${d.weight}%` }}
                    />
                  </div>
                </div>
                <span className="w-20 shrink-0 whitespace-nowrap text-right text-xs text-slate-400">
                  {d.weight}% · {d.questionCount} 题
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-sm leading-relaxed text-amber-800">
          <p className="font-semibold">说明</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-800/90">
            <li>进入考试后自动开始 3.5 小时倒计时，到时自动交卷。</li>
            <li>作答后自动评分（按答对率换算百分制），并可回顾错题解析。</li>
            <li>本模拟题为本站自编的学习材料，非 ACAMS 官方真题；及格线按官方 75 分口径以百分制换算，仅供自测参考。</li>
          </ul>
        </section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={start}
            className="rounded-lg bg-[#0e2a5e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            开始考试 →
          </button>
        </div>
      </div>
    );
  }

  /* ---------- 结果页 ---------- */
  if (phase === "result") {
    const elapsedText = fmt(elapsed);
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-2xl bg-[#0e2a5e] px-6 py-7 text-white">
          <h1 className="text-xl font-bold sm:text-2xl">考试结果</h1>
          <p className="mt-1.5 text-sm text-blue-100">
            作答 {answeredCount}/{total} 题 · 用时 {elapsedText}
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p
            className={`text-5xl font-black ${passed ? "text-emerald-600" : "text-amber-600"}`}
          >
            {stats.percent}%
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {passed ? "达到及格线 · 通过" : "未达及格线 · 继续巩固"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            答对 {stats.correct} / {total} 题 · 及格线 {CAMS_EXAM.passPercent}%
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-5 rounded-lg bg-[#0e2a5e] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            重新考试
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-slate-800">分域得分</h2>
          <div className="mt-3 space-y-2.5">
            {CAMS_DOMAINS.map((d) => {
              const s = stats.byDomain[d.id];
              const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <div key={d.id} className="flex items-center gap-3">
                  <span className="w-14 shrink-0 text-sm font-bold text-[#0e2a5e]">
                    CAMS-{d.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-600">{d.titleZh}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${d.accent}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-20 shrink-0 text-right text-xs text-slate-500">
                    {s.correct}/{s.total} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-bold text-slate-800">
            错题回顾
            {stats.wrong.length > 0 && (
              <span className="ml-2 text-xs font-normal text-slate-400">
                共 {stats.wrong.length} 题
              </span>
            )}
          </h2>
          {stats.wrong.length === 0 ? (
            <p className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              🎉 没有错题，全部答对
            </p>
          ) : (
            <div className="mt-4 space-y-5">
              {stats.wrong.map((q) => {
                const rec = answers[q.id];
                const picked = rec?.picked ?? null;
                const meta = CAMS_DOMAINS.find((d) => d.id === q.domain);
                return (
                  <div key={q.id} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                    <p className="text-sm font-medium text-slate-800">
                      <span className="mr-1.5 rounded bg-[#0e2a5e]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#0e2a5e]">
                        {q.id}
                      </span>
                      {meta && <span className="mr-1.5 text-[11px] font-semibold text-slate-400">CAMS-{meta.id}</span>}
                      {q.question}
                    </p>
                    <div className="mt-2.5 space-y-1.5">
                      {q.options.map((opt, oi) => {
                        const isCorrect = oi === q.answer;
                        const isPicked = oi === picked;
                        return (
                          <div
                            key={oi}
                            className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-sm ${
                              isCorrect
                                ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                                : isPicked
                                  ? "border-rose-300 bg-rose-50 text-rose-800"
                                  : "border-slate-100 bg-white text-slate-500"
                            }`}
                          >
                            <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#0e2a5e] text-[11px] font-bold text-white">
                              {LETTERS[oi]}
                            </span>
                            <span className="leading-snug">{opt}</span>
                            {isCorrect && <span className="ml-auto text-emerald-600">✓</span>}
                            {isPicked && !isCorrect && <span className="ml-auto text-rose-500">✕</span>}
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-relaxed text-amber-800">
                      <span className="font-semibold">解析 · </span>
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <Link href="/courses" className="text-sm font-medium text-[#0e2a5e] hover:underline">
            ← 返回课程中心
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- 考试页 ---------- */
  const q = camsQuestions[current];
  const meta = CAMS_DOMAINS.find((d) => d.id === q.domain);
  const rec = answers[q.id];
  const picked = rec?.picked ?? null;

  return (
    <div className="mx-auto max-w-3xl">
      {/* 顶部计时与进度 */}
      <div className="sticky top-0 z-10 -mx-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            第 {current + 1} / {total} 题
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">已答 {answeredCount}</span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold tabular-nums ${
                timeLeft <= 300
                  ? "bg-rose-100 text-rose-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              ⏱ {fmt(timeLeft)}
            </span>
          </div>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#0e2a5e] transition-all"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </div>

      {/* 题干 */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {meta && <span className="font-semibold text-[#0e2a5e]">CAMS-{meta.id}</span>}
          <span>·</span>
          <span>{meta?.titleZh}</span>
        </div>
        <p className="mt-3 text-base font-medium leading-relaxed text-slate-800 sm:text-lg">
          {q.question}
        </p>

        <div className="mt-5 grid gap-2.5">
          {q.options.map((opt, oi) => {
            const chosen = picked === oi;
            return (
              <button
                key={oi}
                type="button"
                onClick={() => pick(oi)}
                className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition ${
                  chosen
                    ? "border-[#0e2a5e] bg-[#0e2a5e]/5 text-[#0e2a5e]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/40"
                }`}
              >
                <span
                  className={`mt-px inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                    chosen ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {LETTERS[oi]}
                </span>
                <span className="leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 底部导航 */}
      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => jump(Math.max(0, current - 1))}
          disabled={current === 0}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← 上一题
        </button>
        {current < total - 1 ? (
          <button
            type="button"
            onClick={() => jump(current + 1)}
            className="rounded-lg bg-[#0e2a5e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            下一题 →
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            交卷
          </button>
        )}
      </div>

      {/* 题卡导航 */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-slate-800">答题卡</p>
          <p className="text-xs text-slate-400">
            已答 {answeredCount} / {total} · 未答 {total - answeredCount}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {camsQuestions.map((qq, i) => {
            const a = answers[qq.id]?.picked;
            const isCurrent = i === current;
            return (
              <button
                key={qq.id}
                type="button"
                onClick={() => jump(i)}
                aria-label={`跳转到第 ${i + 1} 题`}
                className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition ${
                  isCurrent
                    ? "ring-2 ring-[#0e2a5e] ring-offset-1"
                    : ""
                } ${
                  a !== undefined
                    ? "bg-[#0e2a5e] text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3">
          <button
            type="button"
            onClick={submit}
            className="ml-auto rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            交卷
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0e2a5e]">{value}</p>
    </div>
  );
}
