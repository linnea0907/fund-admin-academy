import type { Metadata } from "next";
import Link from "next/link";
import {
  GLOSSARY_TERMS,
  glossaryJurisdictions,
  glossarySources,
} from "@/lib/glossary";
import { buildGlossaryUsage } from "@/lib/glossary-usage";
import GlossaryExplorer, { type TermUsageCounts } from "@/components/glossary/GlossaryExplorer";

export const metadata: Metadata = {
  title: "Fund Admin Wiki · Terms",
  description:
    "Fund Admin Wiki 术语层：100+ 核心术语，统一结构（缩写 / 全称 / 中文名 / 分类 / 属地 / 定义 / 重要性 / 实务场景 / 别名 / 来源 / 标签），支持缩写、全称、中文名互搜与分类、属地、来源筛选。",
};

/** Fund Admin Wiki · Terms（术语列表；V1.12.2 起并入「知识检索」体系） */
export default function GlossaryPage() {
  // 使用索引：列表与详情页在构建期静态烘焙（新内容 build 后自动刷新）
  const usage = buildGlossaryUsage();

  const usageCounts: Record<string, TermUsageCounts> = {};
  for (const t of GLOSSARY_TERMS) {
    const u = usage[t.id];
    usageCounts[t.id] = {
      lessons: u?.lessons.length ?? 0,
      cases: u?.cases.length ?? 0,
    };
  }

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
        <span className="text-slate-500">Terms</span>
      </nav>
      <GlossaryExplorer
        terms={GLOSSARY_TERMS}
        usageCounts={usageCounts}
        jurisdictions={glossaryJurisdictions()}
        sources={glossarySources()}
      />
    </div>
  );
}
