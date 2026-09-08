"use client";

import { orderedLessons } from "@/lib/ordering";
import CourseCard from "@/components/CourseCard";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">课程中心</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          六讲体系 · 每讲含学习目标、模块内容、风险提示、思维导图与自测 · 按课程编号顺序排列
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {orderedLessons.map((lesson) => (
          <CourseCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </div>
  );
}
