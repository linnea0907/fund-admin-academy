import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CASE_SECTIONS,
  caseNeighbors,
  caseSlug,
  findCaseBySlug,
  listCaseIds,
  readCase,
} from "@/lib/cases";
import CaseViewer, { type CaseViewerSection } from "@/components/cases/CaseViewer";

type Params = Promise<{ id: string }>;

export const dynamic = "force-static";

export function generateStaticParams() {
  return listCaseIds().map((id) => ({ id: caseSlug(id) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: slug } = await params;
  const id = findCaseBySlug(slug);
  const c = id ? readCase(id) : null;
  return {
    title: c?.title ? `${id} · ${c.title}` : id ? `案例 ${id}` : "案例不存在",
    description: id
      ? `境外私募基金运营情景案例 ${id}`
      : "案例不存在",
  };
}

export default async function CasePage({ params }: { params: Params }) {
  const { id: slug } = await params;
  const id = findCaseBySlug(slug);
  const c = id ? readCase(id) : null;
  if (!id || !c) notFound();

  const { prev: prevId, next: nextId } = caseNeighbors(id);
  const readNeighbor = (nid: string | null) => {
    if (!nid) return null;
    const n = readCase(nid);
    return n ? { id: nid, title: n.title, ready: n.ready } : null;
  };

  const sections: CaseViewerSection[] = c.ready
    ? CASE_SECTIONS.map(({ key, label, hint }) => ({
        key,
        label,
        hint,
        content: c.sections[key] ?? "",
      })).filter((s) => s.content.trim() !== "")
    : [];

  return (
    <CaseViewer
      id={c.id}
      title={c.title}
      level={c.level}
      category={c.category}
      tags={c.tags}
      ready={c.ready}
      sections={sections}
      prev={readNeighbor(prevId)}
      next={readNeighbor(nextId)}
    />
  );
}
