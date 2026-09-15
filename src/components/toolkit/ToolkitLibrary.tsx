"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  TOOLKIT_CATEGORIES,
  getToolkitCategory,
  getToolkitKind,
  type ToolkitCategory,
  type ToolkitKind,
} from "@/types/aml-toolkit";
import ToolkitFavoriteButton from "./ToolkitFavoriteButton";

/** 卡片模型：由服务端从 AmlToolkitItem 拍平（避免把整份工具正文注入客户端 bundle） */
export interface ToolkitCardModel {
  id: string;
  category: ToolkitCategory;
  kind: ToolkitKind;
  /** 中文名 */
  zh: string;
  /** 英文名 */
  title: string;
  /** 一句话简介 */
  summary: string;
  /** 工具自身内容修订月份（YYYY-MM） */
  updated: string;
  /** 预拼全文（名称 / 简介 / 何时用 / 分类 / 形态 / 标签 / 关联 id），供关键词直达 */
  searchText: string;
}

/** 统一 chip 样式（与案例库一致：激活深蓝 / 未激活浅灰） */
function chip(active: boolean, extra = ""): string {
  return `rounded-full px-3 py-1 text-xs font-semibold transition ${
    active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
  } ${extra}`;
}

/**
 * 实务工具包 · 工具总览（V1.15.2）
 *
 * 结构对齐案例库：**工具包 → 工具列表 → 点击工具进详情**
 * - 搜索：名称 / 简介 / 何时用 / 分类 / 形态 / 标签 全文命中
 * - 分类筛选：6 类（无内容的分类标「规划中」且不可选）
 * - 收藏：卡片右上角，写入统一收藏夹（Favorite.type === "toolkit"）
 * - 一键进入：整卡可点，跳 /toolkit/<id>
 */
export default function ToolkitLibrary({
  cards,
}: {
  cards: ToolkitCardModel[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | ToolkitCategory>("all");

  const kw = q.trim().toLowerCase();

  /** 各分类工具数（含 0） */
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cards) m.set(c.category, (m.get(c.category) ?? 0) + 1);
    return m;
  }, [cards]);

  const filtered = useMemo(() => {
    const byCat = cat === "all" ? cards : cards.filter((c) => c.category === cat);
    const hit = kw ? byCat.filter((c) => c.searchText.includes(kw)) : byCat;
    // 组内按更新时间倒序，同月按名称
    return [...hit].sort(
      (a, b) => b.updated.localeCompare(a.updated) || a.zh.localeCompare(b.zh, "zh-Hans-CN")
    );
  }, [cards, cat, kw]);

  /** 按固定分类顺序分组（仅含有结果的分类） */
  const groups = useMemo(
    () =>
      TOOLKIT_CATEGORIES.map((def) => ({
        def,
        items: filtered.filter((c) => c.category === def.id),
      })).filter((g) => g.items.length > 0),
    [filtered]
  );

  const planned = TOOLKIT_CATEGORIES.filter((d) => (counts.get(d.id) ?? 0) === 0);
  const hasActive = cat !== "all" || kw.length > 0;

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
          >
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
            <path
              d="M12.2 12.2L16 16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索工具（名称 / 场景 / 关键词，如：制裁、CDD、外包、董事会）"
            aria-label="搜索实务工具"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e] focus:bg-white"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-13 shrink-0 text-xs font-semibold text-slate-400">
            分类
          </span>
          <button
            type="button"
            onClick={() => setCat("all")}
            className={chip(cat === "all")}
            title="查看全部工具"
          >
            全部
            <span className={cat === "all" ? "text-blue-200" : "text-slate-400"}>
              {" "}
              {cards.length}
            </span>
          </button>
          {TOOLKIT_CATEGORIES.map((def) => {
            const n = counts.get(def.id) ?? 0;
            const active = cat === def.id;
            if (n === 0) {
              return (
                <span
                  key={def.id}
                  title={`${def.hint}（规划中，暂无工具）`}
                  aria-disabled="true"
                  className="cursor-not-allowed rounded-full border border-dashed border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-300"
                >
                  {def.zh}
                  <span className="ml-1 font-normal">规划中</span>
                </span>
              );
            }
            return (
              <button
                key={def.id}
                type="button"
                onClick={() => setCat(active ? "all" : def.id)}
                title={`${def.hint}（${n} 个工具）`}
                className={chip(active)}
              >
                {def.zh}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {n}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 结果提示 */}
      {hasActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2.5">
          <p className="text-xs font-semibold text-blue-900">
            {filtered.length} / {cards.length} 个工具
            {kw && <span className="ml-1 font-normal">· 关键词「{q.trim()}」</span>}
            {cat !== "all" && (
              <span className="ml-1 font-normal">· {getToolkitCategory(cat as ToolkitCategory).zh}</span>
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setQ("");
              setCat("all");
            }}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
          >
            清除筛选
          </button>
        </div>
      )}

      {/* 卡片网格（按分类分组） */}
      {groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">没有匹配的工具</p>
          <p className="mt-1 text-xs text-slate-400">
            换个关键词试试，或点「清除筛选」回到全部工具
          </p>
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.def.id} className="space-y-2.5">
            <div className="flex items-center gap-2.5 pt-1">
              <h2 className="text-[13px] font-black tracking-wide text-[#0e2a5e]">
                {g.def.zh}
              </h2>
              <span className="hidden text-[11px] font-medium text-slate-400 sm:inline">
                {g.def.hint}
              </span>
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                {g.items.length}
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {g.items.map((c) => (
                <ToolkitCard key={c.id} card={c} />
              ))}
            </div>
          </section>
        ))
      )}

      {/* 规划中分类（未被搜索/筛选时展示，说明后续扩展方向） */}
      {!hasActive && planned.length > 0 && (
        <section className="space-y-2.5 pt-2">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[13px] font-black tracking-wide text-slate-400">
              规划中分类
            </h2>
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] font-semibold tabular-nums text-slate-400">
              {planned.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {planned.map((def) => (
              <div
                key={def.id}
                className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-4"
              >
                <p className="text-sm font-bold text-slate-500">{def.zh}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                  {def.hint}
                </p>
                <p className="mt-3 text-[11px] font-semibold text-slate-300">
                  暂未上线 · 规划中
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------- 工具卡片 ---------------- */

function ToolkitCard({ card }: { card: ToolkitCardModel }) {
  const cat = getToolkitCategory(card.category);
  const kind = getToolkitKind(card.kind);

  return (
    <article className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
      {/* 整卡可点（stretched link）：内层内容整体禁用指针事件，点击一律落到这张链接上；
          只有收藏按钮重新开启指针事件，避免点收藏时误跳转 */}
      <Link
        href={`/toolkit/${card.id}`}
        aria-label={`查看工具 ${card.zh}`}
        className="absolute inset-0 rounded-2xl"
      />

      <div className="pointer-events-none flex flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ${cat.tint}`}
            >
              {cat.zh}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-bold ring-1 ${kind.tint}`}
            >
              {kind.label}
            </span>
          </div>
          {/* 收藏按钮必须 relative + z-10：stretched link 是定位元素，会盖过静态内容，
              不提升层级会导致「点收藏」被链接截获而误跳转 */}
          <span className="pointer-events-auto relative z-10">
            <ToolkitFavoriteButton toolkitId={card.id} size="compact" />
          </span>
        </div>

        <h3 className="mt-3 text-[15px] font-bold leading-snug text-slate-800 group-hover:text-[#0e2a5e]">
          {card.zh}
        </h3>
        <p className="mt-0.5 text-[12px] font-medium text-slate-400">
          {card.title}
        </p>

        <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-slate-600">
          {card.summary}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-[11px] text-slate-400">
            更新 {card.updated} · {kind.zh}
          </span>
          <span className="text-sm font-medium text-[#0e2a5e] opacity-0 transition group-hover:opacity-100">
            查看工具 →
          </span>
        </div>
      </div>
    </article>
  );
}
