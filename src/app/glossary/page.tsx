import type { Metadata } from "next";
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

  return <GlossaryExplorer usageCounts={usageCounts} />;
}
