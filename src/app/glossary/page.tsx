import type { Metadata } from "next";
import Link from "next/link";
import {
  GLOSSARY_TERMS,
  glossaryJurisdictions,
  glossarySources,
} from "@/lib/glossary";
import { buildTermRelations, wikiHealthSummary } from "@/lib/glossary-usage";
import type { TermUsageCounts } from "@/components/glossary/GlossaryExplorer";
import GlossaryTabs from "@/components/glossary/GlossaryTabs";

export const metadata: Metadata = {
  title: "Fund Admin Wiki · Terms",
  description:
    "Fund Admin Wiki 术语库：160+ 核心术语，统一结构（缩写 / 全称 / 中文名 / 分类 / 属地 / 定义 / 重要性 / 实务场景 / 别名 / 来源 / 标签），支持缩写、全称、中文名互搜与分类、属地、来源筛选；并含知识网络健康度 Dashboard。",
};

/** Fund Admin Wiki · 术语库（列表 + 健康度双页签）
 *  V1.12.2 起并入「知识检索」体系；V1.15.2 知识工坊下线，健康度 Dashboard 迁入本页第二页签。 */
export default function GlossaryPage() {
  // 关联关系（自动扫描 ∪ 人工指定）：与术语详情页 / 健康度 Dashboard 同源，
  // 保证「孤立」判定在列表、详情、Dashboard 三处一致。
  const relations = buildTermRelations();

  const usageCounts: Record<string, TermUsageCounts> = {};
  for (const t of GLOSSARY_TERMS) {
    const r = relations[t.id];
    usageCounts[t.id] = {
      lessons: r?.lessons.length ?? 0,
      cases: r?.cases.length ?? 0,
    };
  }

  // 健康度：构建期 SSG 烘焙（buildWikiHealth 为纯函数，不读窗口对象）
  const health = wikiHealthSummary();

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
          Fund Admin Wiki
        </span>
        <span aria-hidden>/</span>
        <span className="text-slate-500">术语库</span>
      </nav>
      <GlossaryTabs
        terms={GLOSSARY_TERMS}
        usageCounts={usageCounts}
        jurisdictions={glossaryJurisdictions()}
        sources={glossarySources()}
        health={health}
      />
    </div>
  );
}
