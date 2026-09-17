import Link from "next/link";
import { camsMockExam } from "@/data/cams/mock-exam";
import { CamsTags } from "@/components/CamsTag";

/**
 * 第 09 讲 · CAMS Full Mock Exam —— 必修学习路径末端的考试入口卡片。
 *
 * 视觉与 CourseCard 同构（编号块 / CAMS 标签 / 标题 / 副题 / 元信息行），
 * 但用琥珀色系区分「这是考试，不是内容课程」；底部进度条位置改为规格行。
 * 整卡可点，直达 `/cams-exam`。
 */
export default function MockExamCard() {
  const exam = camsMockExam;

  return (
    <Link
      href={exam.href}
      aria-label={`${exam.title} · 进入模拟考试`}
      className="group flex flex-col rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/70 to-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0e2a5e] text-sm font-bold text-white">
          {exam.id}
        </span>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
          全真模拟
        </span>
      </div>

      <div className="mt-2.5">
        <CamsTags domains={exam.cams} />
      </div>

      <h3 className="mt-2 text-base font-bold text-slate-800 group-hover:text-[#0e2a5e]">
        {exam.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
        {exam.subtitle}
      </p>

      {/* 规格行：题量 / 时长 / 评分方式 / 及格线 */}
      <ul className="mt-3.5 flex flex-wrap gap-1.5">
        {exam.highlights.map((h) => (
          <li
            key={h}
            className="rounded-md bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200"
          >
            {h}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center gap-3 border-t border-amber-100 pt-3 text-xs text-slate-400">
        <span>学完必修后应考 · 官方蓝图组卷</span>
        <span className="ml-auto font-medium text-[#0e2a5e]">进入考试 →</span>
      </div>
    </Link>
  );
}
