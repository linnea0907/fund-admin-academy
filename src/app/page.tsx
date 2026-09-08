"use client";

import Link from "next/link";
import { orderedLessons } from "@/lib/ordering";
import { useAcademy } from "@/hooks/use-academy";
import {
  favoriteCount,
  isLessonComplete,
  lessonDoneCount,
  lessonPercent,
  totalProgress,
} from "@/lib/progress";
import ProgressTracker from "@/components/ProgressTracker";

function timeAgo(at: number): string {
  const diff = Date.now() - at;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

export default function DashboardPage() {
  const { state } = useAcademy();
  const stat = totalProgress(state);
  const favs = favoriteCount(state);

  // 学习进度派生
  const doneIds = orderedLessons
    .filter((l) => isLessonComplete(state, l))
    .map((l) => l.id);
  const nextLesson = orderedLessons.find((l) => !isLessonComplete(state, l));

  // 内容统计
  const moduleCount = orderedLessons.reduce((n, l) => n + l.modules.length, 0);
  const riskCount = orderedLessons.reduce((n, l) => n + l.risks.length, 0);
  const quizCount = orderedLessons.reduce((n, l) => n + l.quiz.length, 0);

  // 实务手册统计（自动派生）
  const manualStats = orderedLessons.reduce(
    (acc, l) => ({
      checklist: acc.checklist + l.checklist.length,
      commonMistakes: acc.commonMistakes + l.commonMistakes.length,
      documents: acc.documents + l.documentsToCheck.length,
      escalations: acc.escalations + l.escalationTriggers.length,
    }),
    { checklist: 0, commonMistakes: 0, documents: 0, escalations: 0 }
  );

  // 最近学习
  const recent = state.recentlyViewed
    .map((r) => {
      const lesson = orderedLessons.find((l) => l.id === r.lessonId);
      return lesson ? { lesson, at: r.at } : null;
    })
    .filter(
      (x): x is { lesson: (typeof orderedLessons)[number]; at: number } =>
        x !== null
    );

  return (
    <div className="space-y-6">
      {/* 深蓝 Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0e2a5e] px-6 py-7 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-amber-300/10 blur-2xl" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-blue-200">
            Dashboard
          </p>
          <h1 className="mt-1.5 text-xl font-bold sm:text-2xl">
            境外私募基金学习中心
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-blue-100">
            课程编号体系：01 运转 → 02 结构 → 10 AML → 12 FATCA → 14 Cayman → 15 BVI。
            学习进度与收藏保存在本机浏览器。
          </p>
          {nextLesson && (
            <Link
              href={`/courses/${nextLesson.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-[#0e2a5e] transition hover:bg-amber-200"
            >
              继续学习 · 第 {nextLesson.id} 讲 {nextLesson.title}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </section>

      {/* 学习中心说明 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight text-[#0e2a5e]">
              Fund Admin Academy
            </h2>
            <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
              境外基金行政管理学习中心
            </p>
          </div>
          <span className="hidden shrink-0 rounded-full border border-slate-200 px-3 py-1 text-[11px] font-medium text-slate-400 sm:inline-flex">
            必修 · 选修
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          基于《蓝宝书》与基金运营实践构建，帮助从业人员系统掌握基金架构、募集运营、AML/KYC、AEOI、Cayman、BVI
          等核心知识。
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          建议先完成必修课程，再根据工作需要学习选修专题。
        </p>
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
          仅供内部学习参考，不构成法律、税务或监管意见。
        </p>
      </section>

      {/* 统计卡：总进度环 + 四个内容统计 */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            总学习进度
          </p>
          <div className="mt-2">
            <ProgressTracker
              percent={stat.percent}
              label={`${doneIds.length}/${stat.totalLessons} 门课完成`}
              sublabel={`${stat.done}/${stat.total} 模块`}
            />
          </div>
        </div>
        <StatCard label="课程数" value={String(stat.totalLessons)} sub="编号 01/02/10/12/14/15" />
        <StatCard label="模块数" value={String(moduleCount)} sub="全部课程章节" />
        <StatCard label="风险提示数" value={String(riskCount)} sub="全部课程警示" />
        <StatCard label="自测题数" value={String(quizCount)} sub="全部课程题目" />
      </section>

      {/* 实务手册统计（全站自动统计） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">实务手册统计</h2>
          <span className="text-xs text-slate-400">从课程数据自动统计 · 必修范围</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Admin Checklist" value={String(manualStats.checklist)} sub="必修 6 课操作清单" />
          <StatCard label="Common Mistakes" value={String(manualStats.commonMistakes)} sub="必修 6 课警示" />
          <StatCard label="Documents To Check" value={String(manualStats.documents)} sub="必修 6 课文件清单" />
          <StatCard label="Escalation Triggers" value={String(manualStats.escalations)} sub="必修 6 课升级点" />
        </div>
      </section>

      {/* 下一步推荐 */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-amber-900">下一步推荐</h2>
            {nextLesson ? (
              <>
                <p className="mt-1 text-sm text-amber-800">
                  第 {nextLesson.id} 讲 · {nextLesson.title}
                </p>
                <p className="mt-0.5 text-xs text-amber-700/80">
                  当前进度 {lessonDoneCount(state, nextLesson)}/{nextLesson.modules.length} 模块 ·
                  预计 {nextLesson.minutes} 分钟 · {nextLesson.subtitle}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-amber-800">
                全部课程已完成 🎉 可前往收藏夹复习重点内容。
              </p>
            )}
          </div>
          {nextLesson && (
            <Link
              href={`/courses/${nextLesson.slug}`}
              className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-300"
            >
              去学习 →
            </Link>
          )}
        </div>
      </section>

      {/* 学习建议（随进度动态） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-800">学习建议</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <Suggestion icon="📍" text={suggestionText(stat.percent, doneIds.length, favs, nextLesson?.id ?? null)} />
          {stat.percent > 0 && stat.percent < 100 && (
            <Suggestion
              icon="🧭"
              text={`已完成 ${stat.percent}%（${doneIds.length}/${stat.totalLessons} 门课）。建议按编号顺序推进，当前停在 ${
                nextLesson ? `第 ${nextLesson.id} 讲` : "已完成"
              }。`}
            />
          )}
          {favs > 0 && (
            <Suggestion icon="★" text={`你有 ${favs} 项收藏，可定期回看巩固重点。`} />
          )}
        </ul>
      </section>

      {/* 学习路线 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">学习路线</h2>
          <span className="text-xs text-slate-400">
            共 {stat.totalLessons} 讲 · 按课程编号顺序
          </span>
        </div>
        <ol className="mt-4 space-y-2">
          {orderedLessons.map((lesson, i) => {
            const done = isLessonComplete(state, lesson);
            const percent = lessonPercent(state, lesson);
            return (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${lesson.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      done
                        ? "bg-emerald-500 text-white"
                        : "bg-[#0e2a5e]/10 text-[#0e2a5e]"
                    }`}
                  >
                    {done ? "✓" : lesson.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                      第 {lesson.id} 讲 · {lesson.title}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {lesson.subtitle}
                    </span>
                  </span>
                  <span className="hidden w-28 shrink-0 sm:block">
                    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <span
                        className={`block h-full rounded-full ${done ? "bg-emerald-500" : "bg-[#0e2a5e]"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="mt-1 block text-right text-[11px] text-slate-400">
                      {percent}%{i < orderedLessons.length - 1 ? "" : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                    →
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* 最近学习 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">最近学习</h2>
          <Link href="/courses" className="text-xs font-medium text-[#0e2a5e] hover:underline">
            全部课程 →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
            <p className="text-sm text-slate-500">还没有学习记录</p>
            <p className="mt-1 text-xs text-slate-400">
              从学习路线开始第一讲，进度会自动记录
            </p>
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {recent.slice(0, 3).map(({ lesson, at }) => (
              <li key={lesson.id}>
                <Link
                  href={`/courses/${lesson.slug}`}
                  className="flex items-center gap-3 py-3 transition hover:bg-slate-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e]/10 text-sm font-bold text-[#0e2a5e]">
                    {lesson.id}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700">
                      {lesson.title}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {lesson.subtitle}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {timeAgo(at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function suggestionText(
  percent: number,
  completedCourses: number,
  favs: number,
  nextId: string | null
): string {
  if (percent === 0)
    return "从第 01 讲开始，先建立“一只境外基金如何运转”的全局框架，再沿学习路线逐讲推进。";
  if (percent === 100)
    return "进度已满！建议输出型复习：把每讲风险提示整理成自己的检查清单，并关注 V2 规划中的进阶课程。";
  const base = `保持节奏：已完成 ${completedCourses} 门课程（${percent}%）。`;
  if (favs > 0)
    return `${base} 优先推进第 ${nextId} 讲，每周回看一次收藏内容巩固。`;
  return `${base} 优先推进第 ${nextId} 讲，看到重点内容记得点星标收藏，方便日后复习。`;
}

function Suggestion({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-px text-base leading-none">{icon}</span>
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#0e2a5e]">{value}</p>
      <p className="mt-0.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}
