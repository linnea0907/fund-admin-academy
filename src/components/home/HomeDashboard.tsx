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
  lessonPercent,
  totalProgress,
} from "@/lib/progress";
import { loadNotes } from "@/lib/notes";
import {
  loadExamRecords,
  passedExamCount,
  type ExamRecord,
} from "@/lib/exam-records";
import type { KnowledgeAssets } from "@/lib/knowledge-assets";
import ProgressTracker from "@/components/ProgressTracker";
import HomeSearch from "@/components/home/HomeSearch";

/* ================================================================
 * 首页 · 基金行政知识工作台（V1.20.1）
 *
 * 定位变化：从「课程主页」升级为「平台工作台」。因此首页顶部不再是
 * 学习概览 + 课程编号体系说明，而是 Hero（平台能力）+ 知识检索入口；
 * 个性化数据（进度/收藏/笔记/考试）下沉为「学习概览」，
 * 平台内容体量单列为「知识资产」，跨模块入口收进「快捷入口」。
 *
 * 服务端 / 客户端分工：
 *   本组件是客户端组件（需要 useAcademy 读本机学习状态）。
 *   「知识资产」里的案例数量必须由服务端算（@/lib/cases 依赖 node:fs），
 *   故由 `src/app/page.tsx`（Server Component）装配后经 props 传入。
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

/** Hero 主视觉下方的平台能力关键词（对齐产品定位，替代原「课程编号体系」文案） */
const CAPABILITIES = [
  "基金架构与运营",
  "AML/KYC/CDD",
  "FATCA/CRS/AEOI",
  "Cayman",
  "BVI",
  "AML Technology",
  "CAMS",
  "实务案例与操作手册",
];

/** 快捷入口（六张卡） */
interface QuickEntry {
  href: string;
  icon: string;
  title: string;
  desc: string;
}

export default function HomeDashboard({ assets }: { assets: KnowledgeAssets }) {
  const { state } = useAcademy();
  const stat = totalProgress(state);
  const favs = favoriteCount(state);

  // 学习进度派生
  const doneIds = orderedLessons
    .filter((l) => isLessonComplete(state, l))
    .map((l) => l.id);
  const nextLesson = orderedLessons.find((l) => !isLessonComplete(state, l));

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

  const quickEntries: QuickEntry[] = [
    {
      href: "/courses",
      icon: "🎓",
      title: "课程中心",
      desc: `必修八讲 + 第 09 讲全真模拟 · 选修 ${assets.coursesElective} 门专题`,
    },
    {
      href: "/glossary",
      icon: "📖",
      title: "术语库",
      desc: `${assets.terms} 条术语 · ${assets.termCategories} 类知识分类 · 支持中英文检索`,
    },
    {
      href: "/backlog",
      icon: "🧪",
      title: "案例工坊",
      desc: "30 秒记录案例种子，攒批一键生成标准案例",
    },
    {
      href: "/toolkit",
      icon: "🧰",
      title: "实务工具包",
      desc: `${assets.toolkits} 个即用工具：清单 · 处置流程 · 角色对照表`,
    },
    {
      href: camsMockExam.href,
      icon: "🎯",
      title: "CAMS 专区",
      desc: "官方四域蓝图（A/B/C/D）· 认证备考路径与考试入口",
    },
    {
      href: camsMockExam.href,
      icon: "📝",
      title: "全真模拟",
      desc: "120 题 · 3.5 小时 · 自动评分与错题回顾",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================= Hero：平台定位 + 能力 + 双入口 ================= */}
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

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-blue-100/95">
            面向境外基金行政、合规与 AML 岗位，把
            <span className="font-semibold text-white">课程学习、术语检索、实务案例、操作清单</span>
            与{" "}
            <span className="font-semibold text-white">CAMS 认证备考</span>
            整合在同一个工作台：沿主线完成必修八讲建立全局框架，遇到具体问题用知识检索直达术语、案例与工具包，最后用全真模拟检验掌握程度。
          </p>

          {/* 平台能力关键词（替代原「课程编号体系」说明） */}
          <ul className="mt-5 flex flex-wrap gap-2">
            {CAPABILITIES.map((c) => (
              <li
                key={c}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-blue-50"
              >
                {c}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {nextLesson ? (
              <Link
                href={`/courses/${nextLesson.slug}`}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-semibold text-[#0e2a5e] transition hover:bg-amber-200"
              >
                继续学习 · 第 {displayNumber(nextLesson.id)} 讲 {nextLesson.title}
                <span aria-hidden>→</span>
              </Link>
            ) : (
              <Link
                href={camsMockExam.href}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-300 px-4 py-2.5 text-sm font-semibold text-[#0e2a5e] transition hover:bg-amber-200"
              >
                必修已完成 · 进入第 {camsMockExam.id} 讲全真模拟
                <span aria-hidden>→</span>
              </Link>
            )}
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              进入知识搜索
              <span aria-hidden>→</span>
            </Link>
          </div>

          <p className="mt-4 text-[11px] text-blue-200/80">
            仅供内部学习参考，不构成法律、税务或监管意见。学习进度、收藏与笔记保存在本机浏览器。
          </p>
        </div>
      </section>

      {/* ================= 知识检索入口（P0） ================= */}
      <HomeSearch />

      {/* ================= 学习概览（个人数据 4 项） ================= */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">学习概览</h2>
          <Link
            href="/favorites"
            className="text-xs font-medium text-[#0e2a5e] hover:underline"
          >
            个人资产中心 →
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 已完成课程（保留进度环，弱化「课程数量」叙事） */}
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

      {/* ================= 知识资产（平台内容体量） ================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">知识资产</h2>
          <span className="text-xs text-slate-400">
            从数据层实时统计 · 全站范围（必修 + 选修）
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <AssetCard
            label="课程数量"
            value={assets.courses}
            sub={`必修 ${assets.coursesRequired} + 选修 ${assets.coursesElective}`}
          />
          <AssetCard
            label="术语数量"
            value={assets.terms}
            sub={`${assets.termCategories} 类知识分类`}
          />
          <AssetCard
            label="案例数量"
            value={assets.cases}
            sub={`${assets.casesReady} 个已导入正文`}
          />
          <AssetCard label="Checklist" value={assets.checklist} sub="实务操作清单" />
          <AssetCard
            label="Common Mistakes"
            value={assets.commonMistakes}
            sub="常见操作错误"
          />
          <AssetCard
            label="Documents To Check"
            value={assets.documents}
            sub="应核对文件 / 单据"
          />
          <AssetCard
            label="Escalation Triggers"
            value={assets.escalations}
            sub="需升级 / 上报情形"
          />
        </div>
      </section>

      {/* ================= 快捷入口（六张卡） ================= */}
      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">快捷入口</h2>
          <span className="text-xs text-slate-400">按使用场景直达</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickEntries.map((e) => (
            <Link
              key={`${e.title}-${e.href}`}
              href={e.href}
              className="group flex items-start gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 hover:shadow"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0e2a5e]/10 text-lg">
                {e.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-800 group-hover:text-[#0e2a5e]">
                    {e.title}
                  </span>
                  <span
                    aria-hidden
                    className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0e2a5e]"
                  >
                    →
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                  {e.desc}
                </span>
              </span>
            </Link>
          ))}
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

      {/* ================= 学习路线 ================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-slate-800">学习路线</h2>
          <span className="text-xs text-slate-400">
            共 {stat.totalLessons} 讲 + 全真模拟 · 按课程编号顺序
          </span>
        </div>
        <ol className="mt-4 space-y-2">
          {orderedLessons.map((lesson) => {
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
                    {done ? "✓" : displayNumber(lesson.id)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                      第 {displayNumber(lesson.id)} 讲 · {lesson.title}
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
                      {percent}%
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                    →
                  </span>
                </Link>
              </li>
            );
          })}

          {/* 第 09 讲：学习路径终点的 CAMS 全真模拟考试入口 */}
          <li>
            <Link
              href={camsMockExam.href}
              className="group flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/50 px-3 py-2.5 transition hover:border-amber-300 hover:bg-amber-50"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0e2a5e] text-xs font-bold text-white">
                {camsMockExam.id}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                  第 {camsMockExam.id} 讲 · {camsMockExam.title}
                </span>
                <span className="block truncate text-xs text-slate-400">
                  {camsMockExam.subtitle}
                </span>
              </span>
              <span className="hidden shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 sm:inline-flex">
                全真模拟
              </span>
              <span className="shrink-0 text-slate-300 transition group-hover:text-[#0e2a5e]">
                →
              </span>
            </Link>
          </li>
        </ol>
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

      {/* ================= 学习建议 ================= */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-bold text-slate-800">学习建议</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <Suggestion
            icon="📍"
            text={suggestionText(
              stat.percent,
              doneIds.length,
              favs,
              nextLesson ? displayNumber(nextLesson.id) : null
            )}
          />
          {stat.percent > 0 && stat.percent < 100 && (
            <Suggestion
              icon="🧭"
              text={`已完成 ${stat.percent}%（${doneIds.length}/${stat.totalLessons} 门课）。建议按编号顺序推进，当前停在 ${
                nextLesson ? `第 ${displayNumber(nextLesson.id)} 讲` : "已完成"
              }。`}
            />
          )}
          {favs > 0 && (
            <Suggestion
              icon="★"
              text={`你有 ${favs} 项收藏，可定期回看巩固重点。`}
            />
          )}
          {notesCount > 0 && (
            <Suggestion
              icon="✎"
              text={`已有 ${notesCount} 条笔记 / 高亮，可在收藏夹按来源分类回看。`}
            />
          )}
          {latestExam && (
            <Suggestion
              icon="📝"
              text={`最近一次全真模拟 ${latestExam.percent}%${
                latestExam.passed ? "（已达及格线）" : "（未达及格线）"
              }，共 ${examRecords.length} 次记录。`}
            />
          )}
        </ul>
      </section>

      {/* ================= 内测状态卡（原首页顶部，V1.20.1 移至页尾） ================= */}
      <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
              {siteConfig.statusCard.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-amber-900">
                {siteConfig.statusCard.title}
              </p>
              <p className="mt-0.5 text-xs text-amber-800/90">
                Current Version: {siteConfig.version}
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-700/80 sm:text-right">
            {siteConfig.statusCard.line}
          </p>
        </div>
      </section>
    </div>
  );
}

function suggestionText(
  percent: number,
  completedCourses: number,
  favs: number,
  /** 下一讲的**展示编号**（如 "03"），由调用方用 displayNumber() 转换后传入 */
  nextDisplayNumber: string | null
): string {
  if (percent === 0)
    return "从第 01 讲开始，先建立“一只境外基金如何运转”的全局框架，再沿学习路线逐讲推进。";
  if (percent === 100)
    return "进度已满！建议输出型复习：把每讲风险提示整理成自己的检查清单，并以第 09 讲 CAMS Full Mock Exam 检验掌握程度。";
  const base = `保持节奏：已完成 ${completedCourses} 门课程（${percent}%）。`;
  if (favs > 0)
    return `${base} 优先推进第 ${nextDisplayNumber} 讲，每周回看一次收藏内容巩固。`;
  return `${base} 优先推进第 ${nextDisplayNumber} 讲，看到重点内容记得点星标收藏，方便日后复习。`;
}

function Suggestion({ icon, text }: { icon: string; text: string }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-px text-base leading-none">{icon}</span>
      <span className="leading-relaxed">{text}</span>
    </li>
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

/** 「知识资产」统计卡（只读） */
function AssetCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#0e2a5e]">{value}</p>
      <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{sub}</p>
    </div>
  );
}
