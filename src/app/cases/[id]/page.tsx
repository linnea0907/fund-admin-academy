import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_SECTIONS } from "@/lib/case-modules";
import { splitCaseAnswers } from "@/lib/case-answers";
import { getCaseTerms } from "@/lib/glossary-usage";
import {
  caseNeighbors,
  caseSlug,
  findCaseBySlug,
  listCaseIds,
  readCase,
} from "@/lib/cases";
import CaseViewer, { type CaseViewerSection } from "@/components/cases/CaseViewer";

type Params = Promise<{ id: string }>;

/** 已知案例预渲染为静态；未收录的新案例（导入后）按需动态渲染，无需重新构建 */
export function generateStaticParams() {
  return listCaseIds().map((id) => ({ id: caseSlug(id) }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id: slug } = await params;
  const id = findCaseBySlug(slug);
  const c = id ? readCase(id) : null;
  return {
    title: c?.title ? `${id} · ${c.title}` : id ? `案例 ${id}` : "案例不存在",
    description: id ? `Fund Admin 实务案例 ${id}（答案以 ICS 内部 SOP 为准）` : "案例不存在",
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

  // V1.20.4 逐题答案：把「你的判断」与「标准答案」按题号配对，供逐题折叠卡片渲染。
  // 解析不通过（题号对不上 / 数量不等）→ 返回 []，CaseViewer 退回整节原样渲染，不丢内容。
  const answers = splitCaseAnswers(
    c.sections.questions ?? "",
    c.sections.standard_answer ?? ""
  );

  // V1.18.0 案例 → 术语：反转术语库关联关系（自动命中 ∪ 人工指定 cases），零新增维护字段
  const terms = getCaseTerms(c.id);

  return (
    <CaseViewer
      id={c.id}
      title={c.title}
      module={c.module}
      level={c.level}
      tags={c.tags}
      skills={c.skills}
      estimatedTime={c.estimatedTime}
      ready={c.ready}
      sections={sections}
      prev={readNeighbor(prevId)}
      next={readNeighbor(nextId)}
      jurisdiction={c.jurisdiction}
      businessArea={c.businessArea}
      entityType={c.entityType}
      topics={c.topics}
      terms={terms}
      answers={answers}
    />
  );
}
