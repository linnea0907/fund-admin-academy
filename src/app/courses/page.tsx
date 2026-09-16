"use client";

import { useCallback, useMemo, useState } from "react";
import { orderedLessons, electiveLessonsOrdered } from "@/lib/ordering";
import CourseCard from "@/components/CourseCard";
import MockExamCard from "@/components/MockExamCard";
import { CAMS_DOMAINS } from "@/types/cams";
import type { CamsDomain } from "@/types/cams";

/**
 * 课程中心（V1.16.0：新增 CAMS 域筛选器；V1.16.1：必修区末端纳入第 16 讲全真模拟）
 *
 * 筛选器为「AND」语义：选中一个或多个 CAMS 域后，仅显示覆盖该域（任一命中）的课程。
 * 必修/选修分组内分别过滤；未选任何域时显示全部。
 *
 * V1.16.2（V1.16.1 验收意见 P1-1）：补全域标签使四域分布均衡 —— 10 → A/B/C/D、
 * 14 → B/D、15 → B，最终 A=2 / B=5 / C=2 / D=3，四域均无空分类。
 *
 * 第 16 讲「CAMS Full Mock Exam」是**考试入口卡片**而非内容课程
 * （见 data/cams/mock-exam.ts 的说明），它覆盖四个 Domain，因此在任何筛选条件下
 * 都显示在必修区末尾 —— 保证任一 CAMS 域筛选都不会得到「空分类」体验。
 *
 * 顶部文案口径（V1.16.2，验收意见 P1-2）：一律表述为「必修八讲 + 第 16 讲全真模拟」，
 * 严禁出现「必修八讲」孤立的结尾式表述，避免用户误以为学习路径到此结束。
 */
export default function CoursesPage() {
  const [selected, setSelected] = useState<CamsDomain[]>([]);

  function toggle(d: CamsDomain) {
    setSelected((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  function clear() {
    setSelected([]);
  }

  const filterFn = useCallback(
    (cams?: CamsDomain[]) =>
      selected.length === 0 ||
      (cams != null && cams.some((d) => selected.includes(d))),
    [selected]
  );

  const required = useMemo(
    () => orderedLessons.filter((l) => filterFn(l.cams)),
    [filterFn]
  );
  const electives = useMemo(
    () => electiveLessonsOrdered.filter((l) => filterFn(l.cams)),
    [filterFn]
  );

  const anyCams = orderedLessons.some((l) => l.cams?.length) ||
    electiveLessonsOrdered.some((l) => l.cams?.length);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">课程中心</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          学习路径：必修八讲（01 → 02 → 10 → 11 → 12 → 13 → 14 → 15）→ 第 16 讲 CAMS 全真模拟
          （Assessment，不计入课程完成数）· 选修课程（E01–E11）按需深入 ·
          每讲含学习目标、模块内容、风险提示、思维导图与自测
        </p>
      </header>

      {/* CAMS 域筛选器（V1.16.0） */}
      {anyCams && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-800">按 CAMS 域筛选</h2>
            {selected.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="text-xs font-medium text-[#0e2a5e] hover:underline"
              >
                清除筛选
              </button>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {CAMS_DOMAINS.map((d) => {
              const active = selected.includes(d.id);
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(d.id)}
                  title={d.title}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#0e2a5e] bg-[#0e2a5e] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/40"
                  }`}
                >
                  <span className="font-bold">CAMS-{d.id}</span>
                  <span className={active ? "text-blue-200" : "text-slate-400"}>
                    {d.titleZh}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 必修课程（含第 16 讲考试入口） */}
      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-800">必修课程</h2>
          <span className="text-xs text-slate-400">
            共 {required.length} 门 + 第 16 讲 CAMS 全真模拟 · 学习主线
          </span>
        </div>
        {required.length === 0 && (
          <p className="mb-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
            所选 CAMS 域下暂无内容课程，可直接进入下方全真模拟考试
          </p>
        )}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {required.map((lesson) => (
            <CourseCard key={lesson.id} lesson={lesson} />
          ))}
          {/* 第 16 讲：学习路径终点的 CAMS 全真模拟考试入口 */}
          <MockExamCard />
        </div>
      </section>

      {/* 选修课程 */}
      <section>
        <div className="mb-3 flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-800">选修课程</h2>
          <span className="text-xs text-slate-400">
            共 {electives.length} 门 · 按需深入（不进入必修学习路线）
          </span>
        </div>
        {electives.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            没有符合所选 CAMS 域的选修课程
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {electives.map((lesson) => (
              <CourseCard key={lesson.id} lesson={lesson} elective />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
