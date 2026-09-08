"use client";

import Link from "next/link";
import type { CaseMeta } from "@/types";

/** 案例卡片（Case Library V1） */
export default function CaseCard({
  item,
  done,
}: {
  item: CaseMeta;
  done: boolean;
}) {
  const ready = item.ready;
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
        ) : (
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0e2a5e]">
            未完成
          </span>
        )}
      </div>

      <h3
        className={`mt-4 text-base font-bold ${
          ready ? "text-slate-800 group-hover:text-[#0e2a5e]" : "text-slate-400"
        }`}
      >
        {ready && item.title ? item.title : "（内容待 Copilot 导入）"}
      </h3>

      {item.level || item.category ? (
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          {item.level && (
            <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">
              {item.level}
            </span>
          )}
          {item.category && (
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
              {item.category}
            </span>
          )}
        </div>
      ) : (
        <div className="mt-2" />
      )}

      {item.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.tags.slice(0, 5).map((t) => (
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
          {ready ? "情景案例" : "预留编号"}
        </span>
        <span className="text-sm font-medium text-[#0e2a5e] opacity-0 transition group-hover:opacity-100">
          查看案例 →
        </span>
      </div>
    </Link>
  );
}
