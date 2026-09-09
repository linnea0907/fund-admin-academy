"use client";

import { useAcademy } from "@/hooks/use-academy";

/** 术语详情页收藏按钮（V1.11 收藏夹 · 术语资产入口） */
export default function TermFavoriteButton({ termId }: { termId: string }) {
  const { state, toggleFavorite } = useAcademy();
  const fav = state.favorites.some(
    (f) => f.type === "term" && f.termId === termId
  );
  return (
    <button
      type="button"
      onClick={() => toggleFavorite({ type: "term", termId })}
      title={fav ? "取消收藏术语" : "收藏术语"}
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold transition ${
        fav
          ? "bg-amber-300 text-amber-950 hover:bg-amber-200"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-amber-50 hover:text-amber-700"
      }`}
    >
      {fav ? "★ 已收藏" : "☆ 收藏术语"}
    </button>
  );
}
