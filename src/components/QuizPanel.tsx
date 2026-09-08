"use client";

import { useState } from "react";
import type { QuizQuestion } from "@/types";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface AnswerState {
  picked: number | null;
}

/** 课程自测：单选题，作答即时反馈 + 解析，末尾给得分 */
export default function QuizPanel({ quiz }: { quiz: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [redoCount, setRedoCount] = useState(0);

  const answered = Object.keys(answers).length;
  const correct = quiz.filter((q) => answers[q.id]?.picked === q.answer).length;
  const done = answered === quiz.length;

  function pick(q: QuizQuestion, optionIndex: number) {
    if (answers[q.id]) return; // 已作答，锁定
    setAnswers((prev) => ({ ...prev, [q.id]: { picked: optionIndex } }));
  }

  function redo() {
    setAnswers({});
    setRedoCount((n) => n + 1);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          课程自测
        </p>
        {done && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              correct === quiz.length
                ? "bg-emerald-100 text-emerald-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {correct} / {quiz.length} 题正确
            {correct === quiz.length && " · 全部通过 🎉"}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((q, qi) => {
          const st = answers[q.id];
          const isCorrect = st && st.picked === q.answer;
          return (
            <div key={`${redoCount}-${q.id}`} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
              <p className="mb-3 text-sm font-medium text-slate-800 sm:text-[15px]">
                <span className="mr-2 text-xs font-bold text-[#0e2a5e]">
                  {qi + 1}.
                </span>
                {q.question}
              </p>
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const chosen = st?.picked === oi;
                  const revealCorrect = st && oi === q.answer;
                  let cls =
                    "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/50";
                  if (st) {
                    if (revealCorrect)
                      cls = "border-emerald-400 bg-emerald-50 text-emerald-900";
                    else if (chosen)
                      cls = "border-rose-300 bg-rose-50 text-rose-800";
                    else cls = "border-slate-200 bg-slate-50 text-slate-400";
                  }
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={!!st}
                      onClick={() => pick(q, oi)}
                      className={`flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition ${cls} ${
                        st ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <span className="mt-px inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#0e2a5e] text-[11px] font-bold text-white">
                        {LETTERS[oi]}
                      </span>
                      <span className="leading-snug">{opt}</span>
                      {st && revealCorrect && (
                        <span className="ml-auto text-emerald-600">✓</span>
                      )}
                      {st && chosen && !revealCorrect && (
                        <span className="ml-auto text-rose-500">✕</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {st && (
                <div
                  className={`mt-2.5 rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-amber-50 text-amber-800"
                  }`}
                >
                  <span className="font-semibold">
                    {isCorrect ? "回答正确 · " : "解析 · "}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-600">
            得分 <span className="font-bold text-[#0e2a5e]">{correct}</span> /{" "}
            {quiz.length}
            {correct < quiz.length ? "，温习后再试一次吧" : ""}
          </p>
          <button
            type="button"
            onClick={redo}
            className="rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
          >
            重新作答
          </button>
        </div>
      )}
    </div>
  );
}
