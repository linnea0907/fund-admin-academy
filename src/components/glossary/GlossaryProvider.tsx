"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  getGlossaryCategory,
  getTerm,
  getTermSource,
  termBrief,
  type GlossaryUsageMap,
} from "@/lib/glossary";
import { displayBadge } from "@/lib/lesson-number";

/* ================================================================
 * Context
 *
 * V1.19.1 交互收敛：全站术语**只在点击时**出现解释。
 * 已移除 hover Tooltip 与「首次出现自动提示」两条链路
 * （requestTooltip / dismissTooltip / registerAutoHint / TooltipCard）。
 * ================================================================ */

interface GlossaryContextValue {
  openTerm: (termId: string) => void;
  closeTerm: () => void;
  usageMap: GlossaryUsageMap | null;
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function useGlossary(): GlossaryContextValue {
  const ctx = useContext(GlossaryContext);
  if (!ctx) throw new Error("useGlossary 必须在 <GlossaryProvider> 内使用");
  return ctx;
}

/** 分类主色（subtle chip） */
const CATEGORY_TINT: Record<string, string> = {
  kyc: "bg-sky-50 text-sky-700 ring-sky-200",
  aml: "bg-rose-50 text-rose-700 ring-rose-200",
  structure: "bg-teal-50 text-teal-700 ring-teal-200",
  documents: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  operations: "bg-amber-50 text-amber-700 ring-amber-200",
};

function categoryChipCls(category: string): string {
  return `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ring-1 ${
    CATEGORY_TINT[category] ?? "bg-slate-100 text-slate-500 ring-slate-200"
  }`;
}

/* ================================================================
 * Drawer（右侧滑出）
 * ================================================================ */

function DrawerContent({
  termId,
  usageMap,
  onPickTerm,
  onClose,
}: {
  termId: string;
  usageMap: GlossaryUsageMap | null;
  onPickTerm: (id: string) => void;
  onClose: () => void;
}) {
  const term = getTerm(termId);
  if (!term) return null;
  const category = getGlossaryCategory(term.category);
  const usage = usageMap?.[termId];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* 头部 */}
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={categoryChipCls(term.category)}>{category.label}</span>
              <span className="text-[11px] text-slate-400">{category.zh}</span>
            </div>
            <h2 className="mt-2 text-lg font-bold leading-snug text-slate-800">{term.term}</h2>
            {term.fullName && term.fullName !== term.term && (
              <p className="mt-0.5 text-[11px] text-slate-400">{term.fullName}</p>
            )}
            <p className="mt-0.5 text-sm text-slate-500">{term.zh}</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {term.jurisdiction.map((j) => (
                <span key={j} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 ring-1 ring-slate-100">
                  📍 {j}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭术语"
            onClick={onClose}
            className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 4l8 8M12 4L4 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* 正文 */}
      <div className="thin-scroll min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-4">
        {/* 定义 */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
            定义
          </h3>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-[#0e2a5e]/90">{termBrief(term)}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{term.definition}</p>
        </section>

        {/* 为什么重要 */}
        {term.whyImportant && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[#0e2a5e]/70">
              <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
              为什么重要
            </h3>
            <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">{term.whyImportant}</p>
          </section>
        )}

        {/* 实务场景 */}
        {term.scenario.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
              Fund Admin 实务场景
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {term.scenario.map((s) => (
                <span
                  key={s}
                  className="rounded-full border border-slate-200 bg-slate-50/60 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                >
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 常见误区 */}
        {(term.commonMistakes ?? []).length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600/80">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              常见误区
            </h3>
            <ul className="mt-2 space-y-1.5">
              {(term.commonMistakes ?? []).map((mk, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50/70 px-3 py-2 text-[13px] leading-relaxed text-amber-900">
                  <span className="mt-px text-amber-500">✕</span>
                  {mk}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 别名 */}
        {term.aliases.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
              别名（Alias）
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {term.aliases.map((a) => (
                <span
                  key={a}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500 ring-1 ring-slate-100"
                >
                  {a}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* 关联术语 */}
        {term.related.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
              关联术语
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {term.related.map((rid) => {
                const rt = getTerm(rid);
                if (!rt) return null;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => onPickTerm(rid)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:bg-[#0e2a5e] hover:text-white"
                  >
                    {rt.term}
                    <span className="ml-1 font-normal opacity-70">{rt.zh}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* 来源 */}
        {term.source.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
              来源（Source）
            </h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {term.source.map((s) => {
                const def = getTermSource(s);
                return (
                  <span
                    key={s}
                    title={def?.nature}
                    className="rounded-full bg-[#0e2a5e]/5 px-2.5 py-1 text-[11px] font-medium text-[#0e2a5e]"
                  >
                    {def?.label ?? s}
                    {def && <span className="ml-1 text-[10px] text-slate-400">{def.nature}</span>}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* 相关课程 */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
            相关课程
          </h3>
          {usage === undefined ? (
            <p className="mt-2 animate-pulse text-xs text-slate-400">正在定位出现位置…</p>
          ) : usage.lessons.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">暂未在课程正文中命中</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {usage.lessons.map((l) => (
                <li key={l.id}>
                  <Link
                    href={`/courses/${l.slug}`}
                    onClick={onClose}
                    className="block rounded-lg border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-slate-700">
                      <span
                        className={`shrink-0 rounded px-1.5 py-px text-[10px] font-bold ${
                          l.id.startsWith("E")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-[#0e2a5e] text-white"
                        }`}
                      >
                        {/* V1.20.0：必修显示连续编号（lesson.id 仍为数据主键） */}
                        {displayBadge(l.id)}
                      </span>
                      <span className="truncate">{l.title}</span>
                    </span>
                    {l.modules.length > 0 && (
                      <span className="mt-1.5 flex flex-wrap gap-1.5">
                        {l.modules.slice(0, 4).map((mo) => (
                          <span
                            key={`${l.id}/${mo.id}`}
                            className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500"
                          >
                            {mo.title}
                          </span>
                        ))}
                        {l.modules.length > 4 && (
                          <span className="text-[11px] text-slate-400">+{l.modules.length - 4}</span>
                        )}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 相关案例 */}
        <section>
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
            <span className="h-1 w-1 rounded-full bg-[#0e2a5e]" />
            相关案例
          </h3>
          {usage === undefined ? (
            <p className="mt-2 animate-pulse text-xs text-slate-400">正在定位出现位置…</p>
          ) : usage.cases.length === 0 ? (
            <p className="mt-2 text-xs text-slate-400">暂未在案例正文中命中</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {usage.cases.map((cs) => (
                <li key={cs.id}>
                  <Link
                    href={`/cases/${cs.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    <span className="shrink-0 rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold text-slate-500">
                      {cs.id}
                    </span>
                    <span className="truncate text-[13px] font-medium text-slate-600">{cs.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* 底部 CTA */}
      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          href={`/glossary/${term.id}`}
          onClick={onClose}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0e2a5e] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0e2a5e]/90"
        >
          查看完整术语页
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/* ================================================================
 * Provider
 * ================================================================ */

export default function GlossaryProvider({ children }: { children: ReactNode }) {
  const [drawerTermId, setDrawerTermId] = useState<string | null>(null);
  const [usageMap, setUsageMap] = useState<GlossaryUsageMap | null>(null);

  const openTerm = useCallback((termId: string) => {
    if (!getTerm(termId)) return;
    setDrawerTermId(termId);
  }, []);

  const closeTerm = useCallback(() => {
    setDrawerTermId(null);
  }, []);

  // Drawer 打开时：ESC 关闭 + 锁定背景滚动
  useEffect(() => {
    if (!drawerTermId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerTermId(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerTermId]);

  // 首次打开 Drawer 时拉取使用位置（惰性 + 进程缓存）
  const usageLoadingRef = useRef(false);
  useEffect(() => {
    if (!drawerTermId || usageMap || usageLoadingRef.current) return;
    usageLoadingRef.current = true;
    fetch("/api/glossary/usage")
      .then((r) => (r.ok ? r.json() : null))
      .then((data: GlossaryUsageMap | null) => {
        if (data) setUsageMap(data);
      })
      .catch(() => {
        /* 拉取失败：Drawer 只显示“正在定位”为空，不影响主功能 */
      })
      .finally(() => {
        usageLoadingRef.current = false;
      });
  }, [drawerTermId, usageMap]);

  const drawerTerm = drawerTermId ? getTerm(drawerTermId) : null;

  return (
    <GlossaryContext.Provider value={{ openTerm, closeTerm, usageMap }}>
      {children}

      {/* Drawer */}
      {drawerTerm && drawerTermId && (
        <div className="fixed inset-0 z-[80]">
          <div
            className="glossary-drawer-overlay absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={closeTerm}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label={`术语：${drawerTerm.term}`}
            className="glossary-drawer-panel absolute inset-y-0 right-0 flex w-[420px] max-w-[94vw] flex-col bg-white shadow-2xl"
          >
            <DrawerContent
              termId={drawerTermId}
              usageMap={usageMap}
              onPickTerm={(id) => {
                if (getTerm(id)) setDrawerTermId(id);
              }}
              onClose={closeTerm}
            />
          </aside>
        </div>
      )}
    </GlossaryContext.Provider>
  );
}
