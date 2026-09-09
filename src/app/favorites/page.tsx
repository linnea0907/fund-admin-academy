import type { Metadata } from "next";
import { caseSlug, listCaseMetas } from "@/lib/cases";
import FavoritesLoader from "@/components/favorites/FavoritesLoader";

export const metadata: Metadata = {
  title: "收藏夹",
  description:
    "个人学习资产中心：收藏内容（课程 / 案例 / 术语）与学习笔记（高亮 / 批注）统一管理（V1.11）",
};

/** 案例跳转引用在服务端烘焙（slug 路由由 cases.ts 派生，客户端不依赖） */
export default function FavoritesPage() {
  const caseRefs = listCaseMetas().map((c) => ({
    id: c.id,
    title: c.title,
    href: `/cases/${caseSlug(c.id)}`,
  }));
  return (
    <div className="space-y-5">
      <FavoritesLoader caseRefs={caseRefs} />
    </div>
  );
}
