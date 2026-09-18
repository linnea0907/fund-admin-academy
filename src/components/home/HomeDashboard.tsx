"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { orderedLessons } from "@/lib/ordering";
import { camsMockExam } from "@/data/cams/mock-exam";
import { siteConfig } from "@/lib/site-config";
import { displayNumber } from "@/lib/lesson-number";
import { useAcademy } from "@/hooks/use-academy";
import {
  favoriteCount,
  isLessonComplete,
  lessonDoneCount,
  totalProgress,
} from "@/lib/progress";
import { loadNotes } from "@/lib/notes";
import {
  loadExamRecords,
  passedExamCount,
  type ExamRecord,
} from "@/lib/exam-records";
import ProgressTracker from "@/components/ProgressTracker";

/* ================================================================
 * 首页 · 学习驾驶舱（V1.20.2）
 *
 * 定位回退：V1.20.1 曾把首页做成「基金行政知识工作台」（知识检索、
 * 知识资产、快捷入口、学习路线、学习建议、内测状态卡六块平台视角内容）。
 * V1.20.2 按产品判断回归「学习首页」——首页只回答三个问题：
 *   ① 我现在学到哪了（Hero 进度 + 学习概览）
 *   ② 接下来该学什么（下一步推荐）
 *   ③ 我最近在学什么（最近学习）
 * 知识检索 / 案例库 / 术语库 / 工具包等跨模块能力一律只走左侧导航，
 * 不在首页重复陈列。
 *
 * 服务端 / 客户端分工：
 *   本组件是客户端组件（需要 useAcademy 读本机学习状态）。
 *   `src/app/page.tsx` 保持 Server Component，只为让首页能自持 metadata
 *   （"use client" 文件不能导出 metadata）。
 * ================================================================ */

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

export default function HomeDashboard() {
  const { state } = useAcademy();
  const stat = totalProgress(state);
  const favs = favoriteCount(state);

  // 学习进度派生
  const doneIds = orderedLessons
    .filter((l) => isLessonComplete(state, l))
    .map((l) => l.id);
  const nextLesson = orderedLessons.find((l) => !isLessonComplete(state, l));
  const continueHref = nextLesson ? `/courses/${nextLesson.slug}` : camsMockExam.href;
  const continueLabel = nextLesson
    ? `继续学习 · 第 ${displayNumber(nextLesson.id)} 讲 ${nextLesson.title}`
    : `必修已完成 · 进入第 ${camsMockExam.id} 讲全真模拟`;

  // 收藏构成（terms / cases 用于「已收藏内容」的副标）
  const termFavs = state.favorites.filter((f) => f.type === "term").length;
  const caseFavs = state.favorites.filter((f) => f.type === "case").length;

  /**
   * 本机数据（笔记 / 考试记录）必须在挂载后回读。
   * 首帧一律渲染空值：SSG 出的静态 HTML 里没有这些数据，
   * 若首帧就按 localStorage 求值 → 服务端与客户端首帧不一致 → React #418。
   * 与 `use-ui-pref` / `AcademyProvider` 同一口径（布局副作用内回读，绘制前完成）。
   */
  const [notesCount, setNotesCount] = useState(0);
  const [noteBreakdown, setNoteBreakdown] = useState({ highlight: 0, note: 0 });
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);

  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    const notes = loadNotes();
    setNotesCount(notes.length);
    setNoteBreakdown({
      highlight: notes.filter((n) => n.type === "highlight").length,
      note: notes.filter((n) => n.type === "note").length,
    });
    setExamRecords(loadExamRecords());
  }, []);

  const latestExam = examRecords.length > 0 ? examRecords[0] : null;

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
      {/* ================= Hero：标题 + 副标题 + 当前进度 + 继续学习 ================= */}
      <section className="relative overflow-hidden rounded-2xl bg-[#0e2a5e] px-6 py-8 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-52 w-52 rounded-full bg-amber-300/10 blur-2xl" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Fund Admin Academy
              </h1>
              <p className="mt-2 text-sm font-medium text-blue-100 sm:text-base">
                境外基金行政、AML/KYC 与合规运营知识平台
              </p>
            </div>
            {/* 版本徽标（首页右上角） */}
            <span
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black tracking-wide text-[#0e2a5e]"
              title={`${siteConfig.name} · ${siteConfig.releaseStage} ${siteConfig.version}`}
            >
              内测版 {siteConfig.version}
            </span>
          </div>

          {/* 当前学习进度 + 继续学习（首页唯一主行动点） */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5">
            <div className="min-w-[240px] flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs font-semibold text-blue-100">
                  当前学习进度
                </span>
                <span className="text-sm font-bold text-white">
                  {stat.percent}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all"
                  style={{ width: `${stat.percent}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-blue-200/90">
                已完成 {doneIds.length} / {stat.totalLessons} 门 · {stat.done} /{" "}
                {stat.total} 模块
              </p>
            </div>
            <Link
              href={continueHref}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-semibold text-[#0e2a5e] transition hover:bg-amber-200"
            >
              {continueLabel}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= 学习概览（首页核心模块 · 个人数据 4 项） ================= */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">学习概览</h2>
          <Link
            href="/favorites"
            className="text-xs font-medium text-[#0e2a5e] hover:underline"
          >
            收藏夹与笔记 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 已完成课程（保留进度环） */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              已完成课程
            </p>
            <div className="mt-2">
              <ProgressTracker
                percent={stat.percent}
                size={72}
                strokeWidth={8}
                label={`${doneIds.length} / ${stat.totalLessons} 门`}
                sublabel={`${stat.done}/${stat.total} 模块`}
              />
            </div>
          </div>

          <MetricCard
            label="已收藏内容"
            value={favs}
            unit="项"
            sub={
              favs > 0
                ? `术语 ${termFavs} · 案例 ${caseFavs} · 其他 ${favs - termFavs - caseFavs}`
                : "看到重点内容点星标即入收藏夹"
            }
            href="/favorites"
          />

          <MetricCard
            label="学习笔记"
            value={notesCount}
            unit="条"
            sub={
              notesCount > 0
                ? `高亮 ${noteBreakdown.highlight} · 笔记 ${noteBreakdown.note}`
                : "在课程 / 案例正文划线即可记录"
            }
            href="/favorites"
          />

          <MetricCard
            label="模拟考试记录"
            value={examRecords.length}
            unit="次"
            sub={
              latestExam
                ? `最近一次 ${latestExam.percent}% · 已通过 ${passedExamCount(examRecords)} 次`
                : "还没有考试记录，去完成一次全真模拟"
            }
            href={camsMockExam.href}
          />
        </div>
      </section>

      {/* ================= 下一步推荐 ================= */}
      <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-amber-900">下一步推荐</h2>
            {nextLesson ? (
              <>
                <p className="mt-1 text-sm text-amber-800">
                  第 {displayNumber(nextLesson.id)} 讲 · {nextLesson.title}
                </p>
                <p className="mt-0.5 text-xs text-amber-700/80">
                  当前进度 {lessonDoneCount(state, nextLesson)}/{nextLesson.modules.length} 模块 ·
                  预计 {nextLesson.minutes} 分钟 · {nextLesson.subtitle}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-amber-800">
                必修课程已全部完成 🎉 建议进行第 {camsMockExam.id} 讲 {camsMockExam.title}，
                检验整体掌握程度。
              </p>
            )}
          </div>
          <Link
            href={nextLesson ? `/courses/${nextLesson.slug}` : camsMockExam.href}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-amber-300"
          >
            {nextLesson ? "去学习 →" : "进入模拟考试 →"}
          </Link>
        </div>
      </section>

      {/* ================= 最近学习 ================= */}
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
              从课程中心开始第一讲，进度会自动记录
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
                    {displayNumber(lesson.id)}
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

/** 「学习概览」指标卡（可点击 → 对应资产页） */
function MetricCard({
  label,
  value,
  unit,
  sub,
  href,
}: {
  label: string;
  value: number;
  unit: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-bold text-[#0e2a5e]">
        {value}
        <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-slate-400 group-hover:text-slate-500">
        {sub}
      </p>
    </Link>
  );
}
