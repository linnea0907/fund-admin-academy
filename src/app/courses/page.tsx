"use client";

import { orderedLessons, electiveLessonsOrdered } from "@/lib/ordering";
import CourseCard from "@/components/CourseCard";

export default function CoursesPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">课程中心</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          必修六讲（01/02/10/12/14/15）+ 选修课程（E01–E11）· 每讲含学习目标、模块内容、风险提示、思维导图与自测
        </p>
      </header>

      {/* 必修课程 */}
      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-800">必修课程</h2>
          <span className="text-xs text-slate-400">
            共 {orderedLessons.length} 门 · 学习主线
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {orderedLessons.map((lesson) => (
            <CourseCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </section>

      {/* 选修课程 */}
      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-800">选修课程</h2>
          <span className="text-xs text-slate-400">
            共 {electiveLessonsOrdered.length} 门 · 按需深入（不进入必修学习路线）
          </span>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {electiveLessonsOrdered.map((lesson) => (
            <CourseCard key={lesson.id} lesson={lesson} elective />
          ))}
        </div>
      </section>
    </div>
  );
}
