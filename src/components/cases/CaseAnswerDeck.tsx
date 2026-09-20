"use client";

import type { CaseAnswerItem } from "@/lib/case-answers";
import MarkdownBody from "./MarkdownBody";

/**
 * 案例「标准答案」逐题折叠卡片（V1.20.4）
 *
 * 目标：① 题干常显、答案默认收起（避免进入案例即被剧透）
 *      ② 展开时题干与答案同屏（免去来回滚动对照）
 *      ③ 每题独立展开 / 收起
 *
 * 实现要点：
 * - 用**原生 `<details>` / `<summary>`**，不引入任何 React state / localStorage 读取
 *   → 折叠态是纯 CSS/DOM 行为，首帧即默认收起，**不可能触发 hydration mismatch（#418）**
 * - `summary` 内**只放 span/div**（不放 `<p>`/`<li>`/`<blockquote>`）：
 *   阅读高亮引擎按「作用域内 p/li/blockquote 的序号」生成锚点，
 *   summary 内若出现这些标签会插队改变锚点 → 用户已存的划线/高亮会漂移。
 *   题干因此以 `whitespace-pre-line` 纯文本呈现，而不是再走一遍 MarkdownBody。
 * - 答案正文才走 `MarkdownBody`，术语热词、表格、列表等能力保持不变。
 */
export default function CaseAnswerDeck({ items }: { items: CaseAnswerItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((it) => (
        <details
          key={it.q}
          data-answer-card={it.q}
          className="group overflow-hidden rounded-xl border border-amber-200/80 bg-white/60 open:bg-white open:shadow-sm"
        >
          <summary
            data-answer-toggle={it.q}
            className="flex cursor-pointer list-none items-start gap-3 px-4 py-3 transition hover:bg-amber-50/70 [&::-webkit-details-marker]:hidden"
          >
            <span className="mt-0.5 shrink-0 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
              {it.q}
            </span>
            <span className="min-w-0 flex-1 whitespace-pre-line text-sm font-semibold leading-relaxed text-slate-800">
              {it.question}
            </span>
            <span
              data-answer-action={it.q}
              className="mt-0.5 shrink-0 whitespace-nowrap text-xs font-semibold text-amber-700"
            >
              <span className="group-open:hidden">查看答案 ▾</span>
              <span className="hidden group-open:inline">收起答案 ▴</span>
            </span>
          </summary>
          <div className="border-t border-amber-100 bg-white px-4 py-3">
            <MarkdownBody content={it.answer} />
          </div>
        </details>
      ))}
    </div>
  );
}
