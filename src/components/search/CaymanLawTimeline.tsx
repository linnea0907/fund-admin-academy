"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CAYMAN_LAW_TIMELINE,
  CAYMAN_LAW_TAGS,
  CAYMAN_LAW_HIGHLIGHTS,
  type CaymanLawMilestone,
} from "@/data/cayman-law-timeline";

/**
 * 开曼法规历史沿革（知识检索页内板块）
 *
 * 交互能力：
 *  1. 左右两列错落（zigzag）时间轴，默认「旧 → 新」自上而下；「跳到最新」一键滚动定位；
 *  2. 「旧 → 新 / 新 → 旧」排序切换；
 *  3. 顶部主题标签筛选（公司法 / 共同基金 / 反洗钱 …）；
 *  4. 反洗钱 / 基金相关法规高亮显示（红 / 金色边框 + 徽标）；
 *  5. 每节点均可展开查看结构化具体内容（监管要点 / 实务影响 / 关键条款）与官方超链接。
 */

/** 高亮主题 → 视觉样式映射 */
const HIGHLIGHT_STYLE: Record<
  string,
  { border: string; dot: string; chip: string; chipText: string; ring: string }
> = {
  反洗钱: {
    border: "border-red-300 hover:border-red-400",
    dot: "bg-red-500",
    chip: "bg-red-50",
    chipText: "text-red-700",
    ring: "ring-red-100",
  },
  基金: {
    border: "border-amber-300 hover:border-amber-400",
    dot: "bg-amber-500",
    chip: "bg-amber-50",
    chipText: "text-amber-700",
    ring: "ring-amber-100",
  },
};

export default function CaymanLawTimeline() {
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  // 默认只展开「有高亮（反洗钱 / 基金）」的法规，普通法规仅保留标题行
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(CAYMAN_LAW_TIMELINE.filter((m) => m.highlight).map((m) => m.id))
  );

  // 点击筛选面板外部时关闭
  useEffect(() => {
    if (!showFilter) return;
    const onDocClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilter(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showFilter]);

  const items = useMemo(() => {
    const filtered = activeTag
      ? CAYMAN_LAW_TIMELINE.filter((m) => m.tags.includes(activeTag))
      : CAYMAN_LAW_TIMELINE;
    return order === "asc" ? filtered : [...filtered].reverse();
  }, [order, activeTag]);

  const latest = CAYMAN_LAW_TIMELINE[CAYMAN_LAW_TIMELINE.length - 1];

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () => setExpanded(new Set(CAYMAN_LAW_TIMELINE.map((m) => m.id)));
  const collapseAll = () => setExpanded(new Set());

  const jumpToLatest = () => {
    setOrder("asc");
    setActiveTag(null);
    setExpanded(new Set([latest.id]));
    requestAnimationFrame(() => {
      document.getElementById(`cayman-law-${latest.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  return (
    <section
      id="cayman-law-timeline"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      {/* 标题 + 动作 */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
            开曼法规历史沿革
            <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
              Cayman Regulatory Timeline
            </span>
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500">
            从 1960 年《公司法》到 2024 年修正法，左右错落梳理开曼基金 / 公司监管的立法演变；
            <span className="font-semibold text-red-600">反洗钱</span> 与{" "}
            <span className="font-semibold text-amber-600">基金</span> 相关法规已高亮，点击任意节点查看具体内容。
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={jumpToLatest}
            className="rounded-full bg-[#0e2a5e] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0e2a5e]/90"
          >
            ⤵ 跳到最新法规
          </button>
          <div className="flex overflow-hidden rounded-full border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrder("asc")}
              className={`px-2.5 py-1.5 transition ${
                order === "asc" ? "bg-[#0e2a5e] text-white" : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              旧 → 新
            </button>
            <button
              type="button"
              onClick={() => setOrder("desc")}
              className={`px-2.5 py-1.5 transition ${
                order === "desc" ? "bg-[#0e2a5e] text-white" : "bg-white text-slate-500 hover:bg-slate-50"
              }`}
            >
              新 → 旧
            </button>
          </div>
        </div>
      </div>

      {/* 图例 + 筛选下拉 + 展开/收起 */}
      <div className="relative mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* 高亮图例 */}
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">高亮图例</span>
          {CAYMAN_LAW_HIGHLIGHTS.map((h) => (
            <span key={h.key} className="inline-flex items-center gap-1.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  h.key === "反洗钱" ? "bg-red-500" : "bg-amber-500"
                }`}
              />
              <span className="font-semibold">{h.label}</span>
              <span className="hidden text-slate-400 sm:inline">（{h.desc}）</span>
            </span>
          ))}
        </div>

        {/* 筛选下拉按钮 */}
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              showFilter || activeTag
                ? "border-[#0e2a5e] bg-[#0e2a5e]/5 text-[#0e2a5e]"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M2 4h12M4 8h8M6 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            筛选
            {activeTag && (
              <span className="rounded-full bg-[#0e2a5e] px-1.5 text-[10px] text-white">
                {activeTag}
              </span>
            )}
            <svg
              className={`h-3.5 w-3.5 transition-transform ${showFilter ? "rotate-180" : ""}`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* 筛选弹层 */}
          {showFilter && (
            <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTag(null);
                    setShowFilter(false);
                  }}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeTag === null
                      ? "bg-[#0e2a5e] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  全部
                </button>
                {CAYMAN_LAW_TAGS.map((t) => {
                  const active = activeTag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setActiveTag(active ? null : t);
                        setShowFilter(false);
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                        active
                          ? "bg-[#0e2a5e] text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* 展开全部 / 收起 */}
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            全部展开
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            全部收起
          </button>
        </div>
      </div>

      {/* 左右错落时间轴 */}
      <div className="relative mt-6">
        {/* 中轴 */}
        <div
          className="absolute bottom-3 top-3 left-1/2 w-px -translate-x-1/2 bg-slate-200"
          aria-hidden="true"
        />

        <ol className="relative space-y-6">
          {items.map((m, idx) => (
            <TimelineNode
              key={m.id}
              item={m}
              isLatest={m.id === latest.id}
              side={idx % 2 === 0 ? "left" : "right"}
              expanded={expanded.has(m.id)}
              onToggle={() => toggle(m.id)}
            />
          ))}
        </ol>
      </div>

      {/* 底部说明 */}
      <p className="mt-6 border-t border-slate-100 pt-3 text-[11px] leading-relaxed text-slate-400">
        注：本板块为知识索引，非法律意见。法规沿革以 CIMA 与开曼政府官方公报为准；完整现行文本请点击各节点超链接访问
        legislation.gov.ky / cima.ky 官方来源。
      </p>
    </section>
  );
}

function TimelineNode({
  item,
  isLatest,
  side,
  expanded,
  onToggle,
}: {
  item: CaymanLawMilestone;
  isLatest: boolean;
  side: "left" | "right";
  expanded: boolean;
  onToggle: () => void;
}) {
  const hl = item.highlight ? HIGHLIGHT_STYLE[item.highlight] : null;
  const isLeft = side === "left";

  return (
    <li id={`cayman-law-${item.id}`} className="relative">
      {/* 节点圆点（居中） */}
      <span
        className={`absolute left-1/2 top-5 flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full ring-4 ${
          isLatest
            ? "bg-emerald-500 ring-emerald-100"
            : hl
              ? `${hl.dot} ${hl.ring}`
              : "bg-[#0e2a5e] ring-slate-100"
        }`}
        aria-hidden="true"
      />

      {/* 内容卡片：左列在左、右列在右 */}
      <div
        className={`flex ${isLeft ? "justify-start" : "justify-end"}`}
      >
        <div
          className={`w-full sm:w-[calc(50%-1.75rem)] ${isLeft ? "sm:pr-0" : "sm:pl-0"}`}
        >
          <button
            type="button"
            onClick={onToggle}
            className={`group w-full rounded-xl border bg-white text-left shadow-sm transition ${
              hl
                ? `${hl.border} hover:shadow`
                : "border-slate-100 hover:border-blue-200 hover:bg-blue-50/30"
            }`}
          >
            <div className="flex items-start gap-3 px-3.5 py-3">
              <span
                className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-xs font-bold tabular-nums ${
                  hl ? hl.chip : "bg-[#0e2a5e]/5 text-[#0e2a5e]"
                } ${hl ? hl.chipText : ""}`}
              >
                {item.year}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
                    {item.zh}
                  </span>
                  {item.highlight && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                        hl ? `${hl.chip} ${hl.chipText}` : ""
                      }`}
                    >
                      {item.highlight}
                    </span>
                  )}
                  {isLatest && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                      最新
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-400">
                  {item.law}
                </span>
                <span className="mt-1 inline-flex flex-wrap items-center gap-1.5">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                    {item.kind}
                  </span>
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] text-[#0e2a5e]"
                    >
                      #{t}
                    </span>
                  ))}
                </span>
              </span>
              <svg
                className={`mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition-transform ${
                  expanded ? "rotate-180" : ""
                }`}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 6l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* 折叠态：仅标题行（隐藏概括与详情，点开才显示） */}

            {/* 展开态：结构化具体内容 */}
            {expanded && (
              <div className="border-t border-slate-100 px-3.5 py-3">
                <p className="text-xs leading-relaxed text-slate-600">{item.summary}</p>

                {/* 监管要点 */}
                <div className="mt-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    监管要点
                  </h4>
                  <ul className="mt-1.5 space-y-1.5">
                    {item.details.points.map((p, i) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#0e2a5e]" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 对 Fund Admin 的影响 */}
                <div className="mt-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                    对 Fund Admin 的实务影响
                  </h4>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                    {item.details.impact}
                  </p>
                </div>

                {/* 关键条款 */}
                {item.details.keyItems && item.details.keyItems.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                      关键条款 / 制度
                    </h4>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {item.details.keyItems.map((k) => (
                        <span
                          key={k}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 官方链接 */}
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#0e2a5e] transition hover:underline"
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6.5 4.5h-3a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-3M9 3h4v4M8 8l5-5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  查看官方文本（PDF）
                </a>
              </div>
            )}
          </button>
        </div>
      </div>
    </li>
  );
}
