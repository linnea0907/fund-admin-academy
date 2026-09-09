"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Lesson } from "@/types";
import { useAcademy } from "@/hooks/use-academy";
import {
  isLessonComplete,
  lessonDoneCount,
  lessonModuleKeys,
  moduleKey,
} from "@/lib/progress";
import MindMap from "@/components/MindMap";
import QuizPanel from "@/components/QuizPanel";
import Disclaimer from "@/components/Disclaimer";
import PracticalGuide from "@/components/PracticalGuide";
import TermText from "@/components/glossary/TermText";
import HighlightEngine from "@/components/reading/HighlightEngine";

interface LessonViewerProps {
  lesson: Lesson;
  prev?: Lesson | null;
  next?: Lesson | null;
}

/** 课程详情主体：目标 / 模块 / 风险 / 导图 / 自测 */
export default function LessonViewer({ lesson, prev, next }: LessonViewerProps) {
  const {
    state,
    toggleModuleComplete,
    setLessonCompletion,
    toggleFavorite,
    recordView,
  } = useAcademy();

  // V1.12 阅读高亮引擎的正文作用域（模块 article 区域）
  const moduleScopeRef = useRef<HTMLElement | null>(null);

  // 进入课程时记录"最近学习"
  useEffect(() => {
    recordView(lesson.id);
  }, [lesson.id, recordView]);

  const moduleKeys = lessonModuleKeys(lesson);
  const doneCount = lessonDoneCount(state, lesson);
  const complete = isLessonComplete(state, lesson);
  const lessonFav = state.favorites.some(
    (f) => f.type === "lesson" && f.lessonId === lesson.id
  );
  const isFav = (moduleId: string) =>
    state.favorites.some(
      (f) => f.type === "module" && f.lessonId === lesson.id && f.moduleId === moduleId
    );
  const isDone = (moduleId: string) =>
    state.completedModules.includes(moduleKey(lesson.id, moduleId));

  return (
    <div className="min-w-0">
      {/* ===== 深蓝 Banner：课程头 ===== */}
      <header className="relative overflow-hidden rounded-2xl bg-[#0e2a5e] px-5 py-6 text-white sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/20 blur-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-xs text-blue-200">
            <Link href="/courses" className="hover:underline">
              ← 课程中心
            </Link>
            <span>/</span>
            {lesson.id.startsWith("E") ? (
              <span className="rounded bg-amber-300 px-2 py-0.5 font-semibold text-amber-950">
                选修 · {lesson.id}
              </span>
            ) : (
              <span>第 {lesson.id} 讲</span>
            )}
            <span>/</span>
            <span className="rounded bg-white/10 px-2 py-0.5">⏱ {lesson.minutes} 分钟</span>
          </div>
          <h1 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
            {lesson.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-blue-100 sm:text-[15px]">
            {lesson.subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setLessonCompletion(moduleKeys, !complete)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                complete
                  ? "bg-emerald-400 text-emerald-950 hover:bg-emerald-300"
                  : "bg-white text-[#0e2a5e] hover:bg-blue-50"
              }`}
            >
              {complete ? "✓ 本课已完成" : "标记本课完成"}
            </button>
            <button
              type="button"
              onClick={() => toggleFavorite({ type: "lesson", lessonId: lesson.id })}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition ${
                lessonFav
                  ? "bg-amber-300/90 text-amber-950 hover:bg-amber-200"
                  : "bg-white/10 text-blue-50 hover:bg-white/20"
              }`}
            >
              {lessonFav ? "★ 已收藏本课" : "☆ 收藏本课"}
            </button>
            <span className="ml-auto rounded-full bg-white/10 px-3 py-1 text-xs text-blue-100">
              模块进度 {doneCount}/{lesson.modules.length}
            </span>
          </div>
          {/* 模块级进度条 */}
          <div className="mt-4 h-1.5 w-full max-w-md overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-amber-300 transition-all"
              style={{
                width: `${Math.round(
                  (doneCount / lesson.modules.length) * 100
                )}%`,
              }}
            />
          </div>
        </div>
      </header>

      {/* ===== 学习目标 ===== */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0e2a5e] text-xs text-white">
            🎯
          </span>
          学习目标
        </h2>
        <ul className="mt-3 space-y-2">
          {lesson.goal.map((g, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-slate-600">
              <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#0e2a5e]" />
              <TermText text={g} />
            </li>
          ))}
        </ul>
      </section>

      {/* ===== 模块内容（V1.12：article 带 data-reading-scope 供高亮引擎扫描） ===== */}
      <section ref={moduleScopeRef} className="mt-6 space-y-5">
        {lesson.modules.map((m) => {
          const done = isDone(m.id);
          const fav = isFav(m.id);
          return (
            <article
              key={m.id}
              id={m.id}
              data-reading-scope={`${lesson.id}-${m.id}`}
              className="scroll-mt-20 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-slate-800">
                  <span className="mr-2 inline-flex h-6 items-center rounded-md bg-[#0e2a5e] px-2 text-xs text-white">
                    {lesson.id}·{m.id.replace("m", "")}
                  </span>
                  {m.title}
                </h3>
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite({ type: "module", lessonId: lesson.id, moduleId: m.id })
                  }
                  aria-label="收藏本模块"
                  title={fav ? "取消收藏本模块" : "收藏本模块"}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 text-sm transition ${
                    fav
                      ? "bg-amber-100 text-amber-600"
                      : "text-slate-300 hover:bg-slate-100 hover:text-amber-500"
                  }`}
                >
                  {fav ? "★" : "☆"}
                </button>
              </div>

              <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-slate-600">
                {m.body.map((p, pi) => (
                  <p key={pi}>
                    <TermText text={p} />
                  </p>
                ))}
              </div>

              {m.points && m.points.length > 0 && (
                <ul className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  {m.points.map((pt, pi) => (
                    <li key={pi} className="flex gap-2">
                      <span className="text-[#0e2a5e]">▸</span>
                      <span>
                        <TermText text={pt} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => toggleModuleComplete(moduleKey(lesson.id, m.id))}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    done
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      : "bg-slate-100 text-slate-500 hover:bg-[#0e2a5e] hover:text-white"
                  }`}
                >
                  {done ? "✓ 已学完此模块" : "标记此模块已学完"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* V1.12 阅读高亮引擎（选中文字 → 高亮/写笔记/复制；恢复与 ?hl= 定位） */}
      <HighlightEngine
        sourceType="course"
        sourceId={lesson.id}
        sourceTitle={`${lesson.id} ${lesson.title}`}
        contentVersion={lesson.meta?.contentVersion}
        scopeRef={moduleScopeRef}
      />

      {/* ===== 风险提示 ===== */}
      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-bold text-amber-800">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-400 text-sm text-white">
            ⚠
          </span>
          风险提示
        </h2>
        <div className="mt-3 space-y-3">
          {lesson.risks.map((r, i) => (
            <div key={i} className="rounded-xl bg-white/70 p-4 ring-1 ring-amber-100">
              <p className="text-sm font-semibold text-amber-900">
                <TermText text={r.title} />
              </p>
              <p className="mt-1 text-sm leading-relaxed text-amber-800/90">
                <TermText text={r.detail} />
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== 实务手册 Practical Guide（风险提示 ↓ 此处 ↓ 思维导图） ===== */}
      <PracticalGuide
        checklist={lesson.checklist}
        commonMistakes={lesson.commonMistakes}
        documentsToCheck={lesson.documentsToCheck}
        escalationTriggers={lesson.escalationTriggers}
      />

      {/* ===== 思维导图 ===== */}
      <section className="mt-6">
        <MindMap root={lesson.mindmap} />
      </section>

      {/* ===== 课程自测 ===== */}
      <section id="quiz" className="scroll-mt-20 mt-6">
        <QuizPanel quiz={lesson.quiz} />
      </section>

      {/* ===== 统一免责声明（每讲底部） ===== */}
      <Disclaimer />

      {/* ===== 上下课导航 ===== */}
      <nav className="mt-8 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link
            href={`/courses/${prev.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-xs text-slate-400">← 上一讲</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {prev.id} · {prev.title}
            </p>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={`/courses/${next.slug}`}
            className="rounded-2xl border border-slate-200 bg-white p-4 text-right transition hover:border-blue-300 hover:shadow-sm"
          >
            <p className="text-xs text-slate-400">下一讲 →</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {next.id} · {next.title}
            </p>
          </Link>
        )}
      </nav>
    </div>
  );
}
