"use client";

import { useAcademy } from "@/hooks/use-academy";

/** 实务工具包收藏按钮（V1.15.2 收藏夹 · 工具资产入口）
 *  与 TermFavoriteButton 同形：SSG 页面首帧为未收藏态，挂载后按本机 localStorage 校正。 */
export default function ToolkitFavoriteButton({
  toolkitId,
  size = "default",
}: {
  toolkitId: string;
  /** compact：总览页卡片右上角使用 */
  size?: "default" | "compact";
}) {
  const { state, toggleFavorite } = useAcademy();
  const fav = state.favorites.some(
    (f) => f.type === "toolkit" && f.toolkitId === toolkitId
  );

  const compact = size === "compact";
  const idleLabel = compact ? "☆ 收藏" : "☆ 收藏工具";
  const favLabel = compact ? "★ 收藏中" : "★ 已收藏工具";
  return (
    <button
      type="button"
      onClick={(e) => {
        // 卡片整体是链接：阻止冒泡，避免点收藏时跳转
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite({ type: "toolkit", toolkitId });
      }}
      aria-pressed={fav}
      title={fav ? "取消收藏工具" : "收藏工具"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-semibold transition ${
        compact ? "px-2 py-0.5 text-[10.5px]" : "px-3 py-1 text-[11px]"
      } ${
        fav
          ? "bg-amber-300 text-amber-950 hover:bg-amber-200"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-amber-50 hover:text-amber-700"
      }`}
    >
      {fav ? favLabel : idleLabel}
    </button>
  );
}
