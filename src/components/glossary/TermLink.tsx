"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useGlossary } from "./GlossaryProvider";

/** 术语热词的统一样式：默认虚线下划线、不改变正文颜色；hover 加深。
 *  保留 button 默认 inline-block 排版，不加 min-w-0/max-w-full/whitespace-normal，
 *  避免在窄宽（Tablet 档）下被父容器收缩为几字符宽，导致"Commitment"等
 *  英文长词被字符级断行。外层 li 上的 break-words 会按需在单词级换行。 */
export const TERM_LINK_CLASS =
  "glossary-term cursor-help rounded-[3px] border-b border-dotted border-[#0e2a5e]/45 px-px align-baseline text-inherit transition hover:border-[#0e2a5e]/85 hover:bg-[#0e2a5e]/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e2a5e]/25";

const HOVER_DELAY_MS = 140;

/**
 * 页面内术语热词：
 * - Hover 140ms 出 Tooltip（中文名 + 一句话定义 + 关联术语）
 * - Click 打开右侧 Drawer（完整字段）
 * - 术语在本次会话首次出现时自动弹提示一次（详见 GlossaryProvider）
 */
export default function TermLink({
  termId,
  children,
}: {
  termId: string;
  children: ReactNode;
}) {
  const { openTerm, requestTooltip, dismissTooltip, registerAutoHint } = useGlossary();
  const ref = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | null>(null);
  const hintedOnce = useRef(false);

  // 首次出现（本会话内该术语第一次渲染）自动提示一次
  useEffect(() => {
    if (hintedOnce.current) return;
    hintedOnce.current = true;
    registerAutoHint(termId, () => ref.current?.getBoundingClientRect() ?? null);
  }, [termId, registerAutoHint]);

  useEffect(
    () => () => {
      if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    },
    []
  );

  const scheduleHover = () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => {
      const r = ref.current?.getBoundingClientRect();
      if (r) requestTooltip(termId, r);
    }, HOVER_DELAY_MS);
  };

  const cancelHover = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    dismissTooltip();
  };

  return (
    <button
      ref={ref}
      type="button"
      data-term={termId}
      onClick={() => openTerm(termId)}
      onMouseEnter={scheduleHover}
      onMouseLeave={cancelHover}
      className={TERM_LINK_CLASS}
    >
      {children}
    </button>
  );
}
