"use client";

import Link from "next/link";
import type { CaseMeta } from "@/types";
import { getCaseModule } from "@/lib/case-modules";
import { levelLabel } from "@/lib/case-filter";

/** 案例卡片（Case Library V2 · Fund Admin 实务案例）
 *  V1.8：状态口径统一 待导入/待学习/学习中/已完成；难度展示归一 基础/进阶/高级 */
export default function CaseCard({
  item,
  done,
  started,
}: {
  item: CaseMeta;
  done: boolean;
  started: boolean;
}) {
  const ready = item.ready;
  const mod = getCaseModule(item.module);

  return (
    <Link
      href={`/cases/${item.id.toLowerCase()}`}
      className={`group flex flex-col rounded-2xl border p-5 shadow-sm transition ${
        ready
          ? "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
          : "border-dashed border-slate-200 bg-slate-50/60 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-9 items-center rounded-lg bg-[#0e2a5e] px-2.5 text-sm font-bold text-white">
          {item.id}
        </span>
        {!ready ? (
          <span className="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-500">
            待导入
          </span>
        ) : done ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            ✓ 已完成
          </span>
        ) : started ? (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-[#0e2a5e]">
            学习中
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
            待学习
          </span>
        )}
      </div>

      <h3
        className={`mt-4 text-base font-bold leading-snug ${
          ready ? "text-slate-800 group-hover:text-[#0e2a5e]" : "text-slate-500"
        }`}
      >
        {item.title || "（内容待 SOP 导入）"}
      </h3>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        {mod && (
          <span
            className="rounded-md bg-[#0e2a5e]/5 px-2 py-0.5 font-semibold text-[#0e2a5e] ring-1 ring-[#0e2a5e]/10"
            title={mod.title}
          >
            M{mod.id} · {mod.zh}
          </span>
        )}
        {item.level && (() => {
          const lv = levelLabel(item.level);
          return lv ? (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              {lv}
            </span>
          ) : null;
        })()}
        {item.estimatedTime != null && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
            约 {item.estimatedTime} 分钟
          </span>
        )}
      </div>

      {item.skills.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.skills.slice(0, 3).map((s) => (
            <span
              key={s}
              className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
              title={`能力标签：${s}`}
            >
              {s}
            </span>
          ))}
          {item.skills.length > 3 && (
            <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">
              +{item.skills.length - 3}
            </span>
          )}
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">
          {ready ? "ICS SOP 实务案例" : "正文待导入"}
        </span>
        <span className="text-sm font-medium text-[#0e2a5e] opacity-0 transition group-hover:opacity-100">
          查看案例 →
        </span>
      </div>
    </Link>
  );
}
