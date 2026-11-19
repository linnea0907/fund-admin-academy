import type { Metadata } from "next";
import Link from "next/link";
import CaymanLawTimeline from "@/components/search/CaymanLawTimeline";
import CaymanGuidanceTimeline from "@/components/search/CaymanGuidanceTimeline";
import { CAYMAN_LAW_TIMELINE } from "@/data/cayman-law-timeline";
import { CAYMAN_GUIDANCE_TIMELINE } from "@/data/cayman-guidance-timeline";
import { CAYMAN_LAW_DETAILS } from "@/data/cayman-law-details";

/** 现行核心法规速览仅保留最新（2026）指引 */
const LATEST_DETAILS = CAYMAN_LAW_DETAILS.filter((d) => d.year === 2026);

export const metadata: Metadata = {
  title: "开曼法规沿革",
  description:
    "开曼群岛基金 / 公司监管的法律与 CIMA 指引沿革：从 1960《公司法》到 2024 修正法，以及 AMLRs、私募基金细则、公司治理规则等 CIMA Rules & Guidance，可视化左右错落时间轴，含官方 PDF 直链。",
};

/** 知识检索 · 开曼法规沿革（独立子版块，与案例库 / 术语库 / 实务工具包平级）
 *
 *  - 现行核心指引速览：最新 2026 指引卡片，含中英对照直达
 *  - 开曼法规历史沿革（Law）：CaymanLawTimeline —— 1960 公司法 → 2024 修正法（默认折叠）
 *  - 开曼指引历史沿革（Guidance）：CaymanGuidanceTimeline —— CIMA 发布的监管指引（默认折叠）
 *  - 两者均支持：旧→新/新→旧排序、跳到最新、主题筛选、反洗钱/基金高亮、逐条展开 + 官方 PDF 直链
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
          开曼法规沿革 · 指引沿革
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-blue-100/90">
          上为<b className="font-semibold text-amber-200">开曼法规历史沿革</b>（Law，1960《公司法》至 2024 修正法），
          下为<b className="font-semibold text-amber-200">开曼指引历史沿革</b>（Guidance，CIMA 发布的 Rules / Regulations /
          Guidance Notes / SOG）。两个板块默认折叠，点击板块标题即可展开。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15">
            法规 Law <span className="text-amber-300">{CAYMAN_LAW_TIMELINE.length}</span> 部
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

      {/* 现行核心指引速览（仅最新 2026 指引） */}
      <section
        aria-label="现行核心指引速览"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">现行核心指引速览</h2>
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
            最新 · 中英对照
          </span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3">
          {LATEST_DETAILS.map((d) => (
            <div
              key={d.id}
              className="flex flex-col rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 transition hover:border-emerald-300 hover:shadow"
            >
              <div className="flex items-center gap-1.5">
                <span className="rounded bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-white">
                  {d.year}
                </span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  {d.kind}
                </span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  最新
                </span>
              </div>
              <p className="mt-2 text-[13px] font-semibold leading-snug text-slate-700">{d.nameZh}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-400">{d.nameEn}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">{d.summary}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-emerald-100 pt-2.5">
                <Link
                  href={`/cayman-laws/${d.id}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0e2a5e] transition hover:underline"
                >
                  中英对照 ↕
                </Link>
                <a
                  href={d.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0e2a5e] transition hover:underline"
                >
                  官方文本（PDF）↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 开曼法规历史沿革（上半块，默认折叠） */}
      <CaymanLawTimeline />

      {/* 开曼指引历史沿革（下半块，默认折叠） */}
      <CaymanGuidanceTimeline />

      <p className="pt-1 text-center text-[11px] text-slate-400">
        法规名称与链接以 CIMA / legislation.gov.ky / gov.ky 官方发布为准，实施前请核对最新版本。
      </p>
    </div>
  );
}
