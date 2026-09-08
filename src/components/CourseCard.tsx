"use client";

import Link from "next/link";
import type { Lesson } from "@/types";
import { useAcademy } from "@/hooks/use-academy";
import {
  isLessonComplete,
  lessonDoneCount,
  lessonPercent,
} from "@/lib/progress";

/** 课程卡片：简介 + 进度 + 状态（选修课通过 elective 显示徽章） */
export default function CourseCard({
  lesson,
  elective = false,
}: {
  lesson: Lesson;
  elective?: boolean;
}) {
  const { state } = useAcademy();
  const completed = isLessonComplete(state, lesson);
  const percent = lessonPercent(state, lesson);
  const doneCount = lessonDoneCount(state, lesson);
  const moduleCount = lesson.modules.length;
  const favCount = state.favorites.filter(
    (f) => f.lessonId === lesson.id
  ).length;

  return (
    <Link
      href={`/courses/${lesson.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0e2a5e] text-sm font-bold text-white">
          {lesson.id}
        </span>
        {completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            ✓ 已完成
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
            {moduleCount} 个模块
          </span>
        )}
      </div>

      {elective && (
        <span className="mt-3 inline-flex w-fit items-center rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700">
          选修
        </span>
      )}

      <h3 className={`${elective ? "" : "mt-3"} text-base font-bold text-slate-800 group-hover:text-[#0e2a5e]`}>
        {lesson.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {lesson.subtitle}
      </p>

      <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
        <span>⏱ {lesson.minutes} 分钟</span>
        <span>·</span>
        <span>自测 {lesson.quiz.length} 题</span>
        {favCount > 0 && (
          <>
            <span>·</span>
            <span className="text-amber-500">★ {favCount}</span>
          </>
        )}
        <span className="ml-auto font-medium text-[#0e2a5e] opacity-0 transition group-hover:opacity-100">
          进入课程 →
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>
          {doneCount}/{moduleCount} 模块
        </span>
        <span className="font-semibold text-[#0e2a5e]">{percent}%</span>
      </div>
      {/* 进度条 */}
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${completed ? "bg-emerald-500" : "bg-[#0e2a5e]"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </Link>
  );
}
