import type { Metadata } from "next";
import { caseSlug, listCaseMetas } from "@/lib/cases";
import { AML_TOOLKIT } from "@/data/aml-toolkit";
import { getToolkitCategory, getToolkitKind } from "@/types/aml-toolkit";
import FavoritesLoader from "@/components/favorites/FavoritesLoader";

export const metadata: Metadata = {
  title: "收藏夹",
  description:
    "个人学习资产中心：收藏内容（课程 / 案例 / 术语 / 工具包）与学习笔记（高亮 / 批注）统一管理（V1.11；V1.15.2 支持工具包）",
};

/** 案例与工具包的跳转引用在服务端烘焙（slug / 详情路由由服务端派生，客户端不依赖） */
export default function FavoritesPage() {
  const caseRefs = listCaseMetas().map((c) => ({
    id: c.id,
    title: c.title,
    href: `/cases/${caseSlug(c.id)}`,
  }));
  const toolkitRefs = AML_TOOLKIT.map((t) => ({
    id: t.id,
    zh: t.zh,
    title: t.title,
    categoryLabel: getToolkitCategory(t.category).zh,
    kindLabel: `${getToolkitKind(t.kind).label} · ${getToolkitKind(t.kind).zh}`,
    summary: t.summary,
    href: `/toolkit/${t.id}`,
  }));
  return (
    <div className="space-y-5">
      <FavoritesLoader caseRefs={caseRefs} toolkitRefs={toolkitRefs} />
    </div>
  );
}
