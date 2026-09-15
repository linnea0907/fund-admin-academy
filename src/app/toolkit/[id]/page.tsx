import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AML_TOOLKIT, getToolkitItem } from "@/data/aml-toolkit";
import { getToolkitCategory, getToolkitKind } from "@/types/aml-toolkit";
import ToolkitDetail from "@/components/toolkit/ToolkitDetail";

type Params = Promise<{ id: string }>;

/** SSG：工具详情页（V1.15.2 从 /toolkit 单页拆出）
 *  新增 / 修改工具后执行 npm run build 重新生成静态页 */
export function generateStaticParams() {
  return AML_TOOLKIT.map((t) => ({ id: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const item = getToolkitItem(id);
  if (!item) return { title: "工具不存在" };
  const cat = getToolkitCategory(item.category);
  const kind = getToolkitKind(item.kind);
  return {
    title: `${item.zh} · ${cat.zh}`,
    description: `${item.summary}（${kind.label} · ${kind.zh}；${cat.zh}）`,
  };
}

export default async function ToolkitItemPage({ params }: { params: Params }) {
  const { id } = await params;
  const item = getToolkitItem(id);
  if (!item) notFound();
  return <ToolkitDetail item={item} />;
}
