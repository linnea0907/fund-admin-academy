"use client";

import dynamic from "next/dynamic";

/** FavoritesApp 纯客户端入口：localStorage（收藏 + 笔记）只在客户端读取，避免 SSR/hydration 不一致 */
const FavoritesAppInner = dynamic(
  () => import("@/components/favorites/FavoritesApp"),
  {
    ssr: false,
    loading: () => (
      <p className="py-10 text-center text-sm text-slate-400">
        加载收藏夹…
      </p>
    ),
  }
);

export interface FavoriteCaseRef {
  id: string;
  title: string;
  href: string;
}

export default function FavoritesLoader({
  caseRefs,
}: {
  caseRefs: FavoriteCaseRef[];
}) {
  return <FavoritesAppInner caseRefs={caseRefs} />;
}
