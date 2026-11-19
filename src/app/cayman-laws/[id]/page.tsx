import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CAYMAN_LAW_DETAILS, getCaymanLawDetail } from "@/data/cayman-law-details";
import CaymanLawDetailView from "@/components/cayman/CaymanLawDetailView";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return CAYMAN_LAW_DETAILS.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const detail = getCaymanLawDetail(id);
  if (!detail) return { title: "法规不存在" };
  return {
    title: `${detail.nameZh} · 中英对照`,
    description: `${detail.nameEn} 条款级中英对照与术语标注（Fund Admin 学习用）`,
  };
}

/** 开曼核心法规 · 条款级中英对照详情页（SSG） */
export default async function CaymanLawDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const detail = getCaymanLawDetail(id);
  if (!detail) notFound();

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
        <Link
          href="/cayman-laws"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          开曼法规沿革
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          中英对照
        </span>
      </nav>

      <CaymanLawDetailView detail={detail} />
    </div>
  );
}
