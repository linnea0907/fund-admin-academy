import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { buildGlossaryUsage } from "@/lib/glossary-usage";
import GlossaryExplorer, { type TermUsageCounts } from "@/components/glossary/GlossaryExplorer";

export const metadata: Metadata = {
  title: "术语库",
  description:
    "Fund Admin 高频术语库：KYC / AML / Fund Structure / Fund Documents / Operations 五大模块；单一数据源，课程与案例正文自动标注，悬停速览、点击展开完整释义。",
};

export default function GlossaryPage() {
  // 使用索引：/glossary 列表与详情页在构建期静态烘焙（新内容 build 后自动刷新）
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
      {/* V1.12.2：术语库已并入「知识检索」，保留本站内面包屑 */}
      <nav
        aria-label="面包屑"
        className="flex items-center gap-1.5 text-xs text-slate-400"
      >
        <Link
          href="/search"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          术语库
        </span>
      </nav>
      <GlossaryExplorer usageCounts={usageCounts} />
    </div>
  );
}
