"use client";

import { type ReactNode } from "react";
import { useGlossary } from "./GlossaryProvider";

/** 术语热词的统一样式：默认虚线下划线、不改变正文颜色；hover 仅加深下划线 + 极浅底色。
 *  保留 button 默认 inline-block 排版，不加 min-w-0/max-w-full/whitespace-normal，
 *  避免在窄宽（Tablet 档）下被父容器收缩为几字符宽，导致"Commitment"等
 *  英文长词被字符级断行。外层 li 上的 break-words 会按需在单词级换行。
 *
 *  V1.19.1：cursor-help → cursor-pointer。hover 已不再弹出任何浮层，
 *  「问号」光标会误导用户以为悬停有内容。 */
export const TERM_LINK_CLASS =
  "glossary-term cursor-pointer rounded-[3px] border-b border-dotted border-[#0e2a5e]/45 px-px align-baseline text-inherit transition hover:border-[#0e2a5e]/85 hover:bg-[#0e2a5e]/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e2a5e]/25";

/**
 * 页面内术语热词。V1.19.1 起为**纯点击**交互：
 * - Hover：仅 CSS 视觉反馈（虚线加深 + 浅底），**不弹任何浮层**
 * - Click：打开右侧 Drawer（定义 / 为什么重要 / 常见误区 / 关联课程与案例 / 完整术语页）
 * - ESC：关闭 Drawer（由 GlossaryProvider 统一监听）
 *
 * V1.19.1 移除两项交互（Bug Fix + UX 收敛）：
 * 1. hover 140ms Tooltip —— 进页不点即弹、干扰阅读、页面闪烁、与 Drawer 功能重复；
 * 2. 首次出现自动提示（registerAutoHint）—— 未触发任何操作就自动弹卡，属错误行为。
 * 术语解释现在**只在用户点击时出现**。
 */
export default function TermLink({
  termId,
  children,
}: {
  termId: string;
  children: ReactNode;
}) {
  const { openTerm } = useGlossary();

  return (
    <button
      type="button"
      data-term={termId}
      onClick={() => openTerm(termId)}
      className={TERM_LINK_CLASS}
    >
      {children}
    </button>
  );
}
