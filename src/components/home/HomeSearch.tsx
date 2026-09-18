"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 首页知识搜索入口（V1.20.1）
 *
 * 首页从「课程主页」升级为「基金行政知识工作台」后，检索应是一等入口，
 * 因此在这里提供一个能直接发起检索的输入框，而不是只放一个跳转按钮。
 *
 * ## 范围口径
 * 首页只暴露 4 个最常用范围（对齐产品需求）：课程 / 术语 / 案例 / 实务工具包，
 * 外加「全部」。`/search` 页面自身仍保留全部 8 个范围（含 SOP 依据 / 邮件模板 /
 * Checklist），此处不重复罗列，避免首页信息过载。
 *
 * ## 深链方式
 * 提交后跳 `/search?q=…&scope=…`。`SearchClient` 在挂载后回读这两个参数
 * （见该文件顶部说明：SSG 页面上不能用 useState 初值读 URL，否则 hydration 不一致）。
 */

type HomeScope = "all" | "course" | "term" | "case" | "toolkit";

const SCOPES: { key: HomeScope; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "course", label: "课程" },
  { key: "term", label: "术语" },
  { key: "case", label: "案例" },
  { key: "toolkit", label: "实务工具包" },
];

/** 示例关键词：点一下即发起检索，降低「不知道能搜什么」的门槛 */
const EXAMPLES = ["VCC", "AML Letter", "侧袋", "SPC"];

export default function HomeSearch() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");
  const [scope, setScope] = useState<HomeScope>("all");

  function go(kw: string, sc: HomeScope) {
    const q = kw.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (sc !== "all") params.set("scope", sc);
    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(keyword, scope);
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-800">知识检索</h2>
        <span className="text-xs text-slate-400">
          一次搜索直达术语、案例、课程与实务工具
        </span>
      </div>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">搜索关键词</span>
          <span
            aria-hidden
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          >
            🔍
          </span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索术语 / 案例 / 课程 / 实务工具：输入缩写、全称或中文名"
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-[15px] text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
          />
        </label>
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#0e2a5e] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
        >
          搜索
        </button>
      </div>

      {/* 检索范围 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400">范围</span>
        {SCOPES.map((s) => {
          const active = scope === s.key;
          return (
            <button
              key={s.key}
              type="button"
              aria-pressed={active}
              onClick={() => setScope(s.key)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                active
                  ? "border-[#0e2a5e] bg-[#0e2a5e] text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/40"
              }`}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* 示例关键词 */}
      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <span className="text-xs text-slate-400">试试</span>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setKeyword(ex);
              go(ex, scope);
            }}
            className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            {ex}
          </button>
        ))}
      </div>
    </form>
  );
}
