import type { Metadata } from "next";
import Link from "next/link";
import CaymanLawTimeline from "@/components/search/CaymanLawTimeline";
import CaymanGuidanceTimeline from "@/components/search/CaymanGuidanceTimeline";
import { CAYMAN_LAW_TIMELINE } from "@/data/cayman-law-timeline";
import { CAYMAN_GUIDANCE_TIMELINE } from "@/data/cayman-guidance-timeline";
import { CAYMAN_LAW_DETAILS } from "@/data/cayman-law-details";

export const metadata: Metadata = {
  title: "开曼法规沿革",
  description:
    "开曼群岛基金 / 公司监管的法律与 CIMA 指引沿革：从 1960《公司法》到 2024 修正法，以及 AMLRs、私募基金细则、公司治理规则等 CIMA Rules & Guidance，可视化左右错落时间轴，含官方 PDF 直链。",
};

/** 知识检索 · 开曼法规沿革（独立子版块，与案例库 / 术语库 / 实务工具包平级）
 *
 *  - 现行核心法规速览：当前有效的 4 部核心法规卡片，含生效年份 + 中英对照直达
 *  - 法律（Law）：CaymanLawTimeline —— 1960 公司法 → 2024 修正法，左右错落时间轴
 *  - 指引（Rules / Regulations / Guidance / SOG）：CaymanGuidanceTimeline —— CIMA 发布的监管指引
 *  - 两者均支持：旧→新/新→旧排序、跳到最新、主题筛选（下拉）、反洗钱/基金高亮、逐条展开结构化内容 + 官方 PDF 直链
 */
export default function CaymanLawsPage() {
  return (
    <div className="space-y-4">
      <nav aria-label="面包屑" className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href="/search"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          开曼法规沿革
        </span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl bg-gradient-to-br from-[#0e2a5e] to-[#173d7a] px-5 py-6 text-white sm:px-7 sm:py-7">
        <p className="text-[11px] font-bold tracking-widest text-amber-300">
          CAYMAN REGULATORY &amp; GUIDANCE TIMELINE
        </p>
        <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
          开曼法规 &amp; 指引历史沿革
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-blue-100/90">
          从 1960 年《公司法》到 2024 年修正法，梳理开曼基金 / 公司监管的立法演变；并同步收录
          CIMA 发布的监管指引（Rules / Regulations / Guidance Notes / SOG）。
          点击任意节点查看监管要点、对 Fund Admin 的实务影响与官方 PDF 原文。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15">
            法律 Law <span className="text-amber-300">{CAYMAN_LAW_TIMELINE.length}</span> 部
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15">
            指引 Guidance <span className="text-amber-300">{CAYMAN_GUIDANCE_TIMELINE.length}</span> 项
          </span>
          <Link
            href="/search"
            className="rounded-full bg-amber-300 px-3 py-1 text-[11.5px] font-bold text-[#0e2a5e] transition hover:bg-amber-200"
          >
            返回知识检索 →
          </Link>
        </div>
      </header>

      {/* 现行核心法规速览（查询最新指引的直达入口） */}
      <section
        aria-label="现行核心法规速览"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">现行核心法规速览</h2>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            当前有效 · 中英对照
          </span>
          <p className="ml-auto text-[11px] text-slate-400">
            日常查证优先看这几部，其余见下方时间轴
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {CAYMAN_LAW_DETAILS.map((d) => {
            const is2026 = d.year === 2026;
            return (
              <Link
                key={d.id}
                href={`/cayman-laws/${d.id}`}
                className={`group flex flex-col rounded-xl border p-4 transition ${
                  is2026
                    ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300 hover:shadow"
                    : "border-slate-200 bg-white hover:border-[#0e2a5e]/30 hover:shadow"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                      is2026 ? "bg-emerald-500 text-white" : "bg-slate-800 text-white"
                    }`}
                  >
                    {d.year}
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {d.kind}
                  </span>
                  {is2026 && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      最新
                    </span>
                  )}
                </div>
                <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-700 group-hover:text-[#0e2a5e]">
                  {d.nameZh}
                </p>
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-slate-400">{d.nameEn}</p>
                <p className="mt-auto pt-2 text-[11px] font-semibold text-[#0e2a5e]">
                  中英对照 ↕
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 法律沿革 */}
      <CaymanLawTimeline />

      {/* 指引沿革 */}
      <CaymanGuidanceTimeline />

      <p className="pt-1 text-center text-[11px] text-slate-400">
        法规名称与链接以 CIMA / legislation.gov.ky / gov.ky 官方发布为准，实施前请核对最新版本。
      </p>
    </div>
  );
}
