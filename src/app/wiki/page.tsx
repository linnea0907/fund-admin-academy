import type { Metadata } from "next";
import Link from "next/link";
import { GLOSSARY_BUILTIN_COUNT, GLOSSARY_TERMS } from "@/lib/glossary";
import { wikiHealthSummary } from "@/lib/glossary-usage";
import { IMPORTED_TERMS } from "@/data/glossary";
import { scanMissingTerms } from "@/lib/missing-terms";
import WikiLoader from "@/components/wiki/WikiLoader";

export const metadata: Metadata = {
  title: "知识工坊",
  description:
    "Fund Admin Wiki 术语建设后台：Wiki 健康度 Dashboard（覆盖率 / 孤立术语 / 热门术语）、CSV / Excel / JSON 批量导入、待补充术语池（Missing Terms）与导出落盘。",
};

/** 知识工坊（术语建设后台；服务端完成健康度统计与语料扫描，客户端负责暂存与导出） */
export default function WikiPage() {
  const missing = scanMissingTerms(150);
  const health = wikiHealthSummary();
  const existingLabels = GLOSSARY_TERMS.map((t) => ({ id: t.id, term: t.term, zh: t.zh }));

  return (
    <div className="space-y-4">
      <nav aria-label="面包屑" className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link href="/search" className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e]">
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">知识工坊</span>
        <span aria-hidden>/</span>
        <span className="text-slate-500">术语建设</span>
      </nav>
      <WikiLoader
        missing={missing}
        health={health}
        existingIds={GLOSSARY_TERMS.map((t) => t.id)}
        existingLabels={existingLabels}
        builtinCount={GLOSSARY_BUILTIN_COUNT}
        importedCount={IMPORTED_TERMS.length}
        totalCount={GLOSSARY_TERMS.length}
      />
    </div>
  );
}
