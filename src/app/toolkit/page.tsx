import type { Metadata } from "next";
import Link from "next/link";
import { AML_TOOLKIT, toolkitCategoryCounts } from "@/data/aml-toolkit";
import {
  TOOLKIT_CATEGORIES,
  TOOLKIT_KINDS,
  getToolkitCategory,
  getToolkitKind,
} from "@/types/aml-toolkit";
import ToolkitLibrary, {
  type ToolkitCardModel,
} from "@/components/toolkit/ToolkitLibrary";
import ToolkitHashRedirect from "@/components/toolkit/ToolkitHashRedirect";

export const metadata: Metadata = {
  title: "实务工具包",
  description:
    "Fund Admin Wiki · 实务工具包：可直接拿来用的清单、处置流程与角色/流程对照表。按 KYC / AML / FATCA·CRS / 基金运营 / 估值 / 注册及架构 六类整理，支持搜索、分类筛选与收藏。",
};

/** 知识检索 · 实务工具包（V1.15.2：由「单页长文 + 锚点」改为「工具总览 → 工具详情」）
 *
 *  - 总览页（本页）：搜索 + 分类筛选 + 收藏，一眼看清有哪些工具、在哪里
 *  - 工具详情：/toolkit/<id>（SSG，见 src/app/toolkit/[id]/page.tsx）
 *  - 旧深链 /toolkit#<id> 由 ToolkitHashRedirect 兜底跳转到新详情页 */

/** 卡片模型：只把列表需要的字段传给客户端（正文留在服务端） */
function toCards(): ToolkitCardModel[] {
  return AML_TOOLKIT.map((t) => {
    const cat = getToolkitCategory(t.category);
    const kind = getToolkitKind(t.kind);
    const searchText = [
      t.zh,
      t.title,
      t.summary,
      t.purpose,
      cat.zh,
      kind.label,
      kind.zh,
      ...t.tags,
      ...(t.relatedTerms ?? []),
      ...(t.relatedCases ?? []),
    ]
      .join("\n")
      .toLowerCase();
    return {
      id: t.id,
      category: t.category,
      kind: t.kind,
      zh: t.zh,
      title: t.title,
      summary: t.summary,
      updated: t.updated,
      searchText,
    };
  });
}

export default function ToolkitPage() {
  const cards = toCards();
  const catCounts = toolkitCategoryCounts();
  const liveCats = TOOLKIT_CATEGORIES.filter((c) => (catCounts[c.id] ?? 0) > 0).length;
  const kindCounts = TOOLKIT_KINDS.map((k) => ({
    ...k,
    n: AML_TOOLKIT.filter((t) => t.kind === k.id).length,
  }));

  return (
    <div className="space-y-4">
      <ToolkitHashRedirect ids={cards.map((c) => c.id)} />
      <nav aria-label="面包屑" className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href="/search"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          实务工具包
        </span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl bg-gradient-to-br from-[#0e2a5e] to-[#173d7a] px-5 py-6 text-white sm:px-7 sm:py-7">
        <p className="text-[11px] font-bold tracking-widest text-amber-300">
          FUND ADMIN WIKI · TOOLKIT
        </p>
        <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
          实务工具包
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-blue-100/90">
          可直接拿来用的清单、处置流程与角色/流程对照表。
          术语回答「是什么」，工具包回答「怎么做、问哪些问题、下一步是什么」。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15">
            共 <span className="text-amber-300">{AML_TOOLKIT.length}</span> 个工具
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15">
            已上线分类 <span className="text-amber-300">{liveCats}</span> / {TOOLKIT_CATEGORIES.length}
          </span>
          {kindCounts.map((k) => (
            <span
              key={k.id}
              className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15"
            >
              {k.label} · {k.zh} <span className="text-amber-300">{k.n}</span>
            </span>
          ))}
          <Link
            href="/search"
            className="rounded-full bg-amber-300 px-3 py-1 text-[11.5px] font-bold text-[#0e2a5e] transition hover:bg-amber-200"
          >
            在知识检索中搜索 →
          </Link>
        </div>
      </header>

      {/* 收录原则 */}
      <section className="rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold tracking-wide text-slate-500">
          收录原则
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          ✅ 收录可复用的<strong className="font-semibold text-slate-700">清单、处置顺序与对比框架</strong>；
          ❌ 不收录<strong className="font-semibold text-slate-700">法规时间线、生效日期、罚款金额、个别执法案例数字</strong>
          —— 这类内容时效性强，会带来持续维护成本。
        </p>
      </section>

      {/* 工具总览（客户端：搜索 / 分类 / 收藏） */}
      <ToolkitLibrary cards={cards} />

      <p className="pt-1 text-center text-[11px] text-slate-400">
        工具包内容为内部实务整理，实施前请核对最新官方版本。
      </p>
    </div>
  );
}
