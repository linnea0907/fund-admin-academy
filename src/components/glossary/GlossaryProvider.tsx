"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getGlossaryCategory,
  getTerm,
  type GlossaryUsageMap,
} from "@/lib/glossary";

/* ================================================================
 * 常量与全局去重状态
 * ================================================================ */

/** 每个术语在本次会话内只自动提示一次（提示“这里可点开术语”） */
const AUTO_HINT_SHOW_MS = 3200;
const MAX_AUTO_PER_PAGE = 2;

interface RectSnap {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom: number;
}

interface TooltipState {
  termId: string;
  rect: RectSnap;
  auto: boolean;
}

/* ================================================================
 * Context
 * ================================================================ */

interface GlossaryContextValue {
  openTerm: (termId: string) => void;
  closeTerm: () => void;
  requestTooltip: (termId: string, rect: DOMRect) => void;
  dismissTooltip: () => void;
  registerAutoHint: (termId: string, getRect: () => DOMRect | null) => void;
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
 * Tooltip 卡片（fixed 层，测量后定位）
 * ================================================================ */

function TooltipCard({
  state,
  onPickTerm,
  onGotoPage,
}: {
  state: TooltipState;
  onPickTerm: (id: string) => void;
  onGotoPage: (id: string) => void;
}) {
  const term = getTerm(state.termId);
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card || !term) return;
    const w = card.offsetWidth;
    const h = card.offsetHeight;
    const pad = 10;
    const left = Math.max(pad, Math.min(state.rect.left - 6, window.innerWidth - w - pad));
    const topAbove = state.rect.top - h - pad;
    const top = topAbove >= pad ? topAbove : state.rect.bottom + pad;
    setPos({ left, top });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, term?.id]);

  if (!term) return null;

  const category = getGlossaryCategory(term.category);

  return (
    <div
      ref={cardRef}
      role="tooltip"
      className="glossary-tooltip pointer-events-auto fixed z-[95] w-[320px] max-w-[calc(100vw-20px)] rounded-xl border border-slate-200 bg-white p-3.5 shadow-xl shadow-slate-900/10"
      style={pos ? { left: pos.left, top: pos.top, visibility: "visible" } : { visibility: "hidden", left: 0, top: 0 }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={categoryChipCls(term.category)}>{category.label}</span>
          <p className="mt-1.5 text-sm font-bold leading-tight text-slate-800">
            {term.en}
            <span className="ml-1.5 font-normal text-slate-400">{term.zh}</span>
          </p>
        </div>
        <button
          type="button"
          aria-label="关闭提示"
          onClick={() => onGotoPage("")}
          className="shrink-0 rounded-md p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{term.brief}</p>

      {term.related.length > 0 && (
        <div className="mt-2.5 border-t border-slate-100 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">关联术语</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {term.related.map((rid) => {
              const rt = getTerm(rid);
              if (!rt) return null;
              return (
                <button
                  key={rid}
                  type="button"
                  onClick={() => onPickTerm(rid)}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 transition hover:bg-[#0e2a5e] hover:text-white"
                >
                  {rt.en}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2.5 flex justify-end">
        <button
          type="button"
          onClick={() => onGotoPage(term.id)}
          className="text-[11px] font-semibold text-[#0e2a5e] underline decoration-dotted underline-offset-2 hover:decoration-solid"
        >
          查看完整术语 →
        </button>
      </div>
    </div>
  );
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
            <h2 className="mt-2 text-lg font-bold leading-snug text-slate-800">{term.en}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{term.zh}</p>
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
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-[#0e2a5e]/90">{term.brief}</p>
          <p className="mt-2 text-[13px] leading-relaxed text-slate-600">{term.definition}</p>
        </section>

        {/* 常见误区 */}
        {term.commonMistakes.length > 0 && (
          <section>
            <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-amber-600/80">
              <span className="h-1 w-1 rounded-full bg-amber-400" />
              常见误区
            </h3>
            <ul className="mt-2 space-y-1.5">
              {term.commonMistakes.map((mk, i) => (
                <li key={i} className="flex items-start gap-2 rounded-lg bg-amber-50/70 px-3 py-2 text-[13px] leading-relaxed text-amber-900">
                  <span className="mt-px text-amber-500">✕</span>
                  {mk}
                </li>
              ))}
            </ul>
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
                    {rt.en}
                    <span className="ml-1 font-normal opacity-70">{rt.zh}</span>
                  </button>
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
                        {l.id.startsWith("E") ? `E${l.id.replace("E", "")}` : `第 ${l.id} 讲`}
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
  const pathname = usePathname();

  const [drawerTermId, setDrawerTermId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [usageMap, setUsageMap] = useState<GlossaryUsageMap | null>(null);

  // 自动提示（首次出现提示、后续不提示）
  const hintedTermsRef = useRef<Set<string>>(new Set());
  const pageAutoCountRef = useRef(0);
  const autoQueueRef = useRef<{ termId: string; getRect: () => DOMRect | null }[]>([]);
  const autoBusyRef = useRef(false);
  const autoRemainRef = useRef<number | null>(null);

  // 路由变化：本页自动提示计数重置（会话内已提示术语不重复）
  const prevPathRef = useRef(pathname);
  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      pageAutoCountRef.current = 0;
    }
  }, [pathname]);

  // 自动提示队列依次播放（一个 3.2s 后播下一个；每术语每会话一次、每页至多 2 次）
  const drainAutoHintRef = useRef<() => void>(() => {});
  useEffect(() => {
    drainAutoHintRef.current = () => {
      if (autoBusyRef.current) return;
      const next = autoQueueRef.current.shift();
      if (!next) return;
      autoBusyRef.current = true;
      const rect = next.getRect();
      if (!rect) {
        autoBusyRef.current = false;
        drainAutoHintRef.current();
        return;
      }
      // 出现在视口外的术语不自动弹（例如折叠在下方的段落）
      if (rect.top < 0 || rect.top > window.innerHeight) {
        autoBusyRef.current = false;
        drainAutoHintRef.current();
        return;
      }
      setTooltip({
        termId: next.termId,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height, bottom: rect.bottom },
        auto: true,
      });
      autoRemainRef.current = window.setTimeout(() => {
        autoRemainRef.current = null;
        setTooltip((cur) => (cur && cur.auto ? null : cur));
        autoBusyRef.current = false;
        drainAutoHintRef.current();
      }, AUTO_HINT_SHOW_MS);
    };
  }, []);

  const registerAutoHint = useCallback((termId: string, getRect: () => DOMRect | null) => {
    if (hintedTermsRef.current.has(termId)) return;
    if (pageAutoCountRef.current >= MAX_AUTO_PER_PAGE) return;
    hintedTermsRef.current.add(termId);
    pageAutoCountRef.current += 1;
    autoQueueRef.current.push({ termId, getRect });
    drainAutoHintRef.current();
  }, []);

  const clearAutoRemain = useCallback(() => {
    if (autoRemainRef.current !== null) {
      window.clearTimeout(autoRemainRef.current);
      autoRemainRef.current = null;
    }
    autoBusyRef.current = false;
  }, []);

  const openTerm = useCallback((termId: string) => {
    if (!getTerm(termId)) return;
    clearAutoRemain();
    setTooltip(null);
    setDrawerTermId(termId);
  }, [clearAutoRemain]);

  const closeTerm = useCallback(() => {
    setDrawerTermId(null);
  }, []);

  const requestTooltip = useCallback(
    (termId: string, rect: DOMRect) => {
      clearAutoRemain();
      setTooltip({
        termId,
        rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height, bottom: rect.bottom },
        auto: false,
      });
    },
    [clearAutoRemain]
  );

  const dismissTooltip = useCallback(() => {
    setTooltip((cur) => (cur && cur.auto ? cur : null));
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

  // 卸载清理
  useEffect(
    () => () => {
      if (autoRemainRef.current !== null) window.clearTimeout(autoRemainRef.current);
    },
    []
  );

  const pickTerm = useCallback((id: string) => {
    if (getTerm(id)) {
      setDrawerTermId(id);
    }
  }, []);

  const drawerTerm = drawerTermId ? getTerm(drawerTermId) : null;

  return (
    <GlossaryContext.Provider
      value={{
        openTerm,
        closeTerm,
        requestTooltip,
        dismissTooltip,
        registerAutoHint,
        usageMap,
      }}
    >
      {children}

      {/* Tooltip */}
      {tooltip && (
        <TooltipCard
          state={tooltip}
          onPickTerm={(id) => {
            setTooltip(null);
            pickTerm(id);
          }}
          onGotoPage={(id) => {
            setTooltip(null);
            if (id) openTerm(id);
          }}
        />
      )}

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
            aria-label={`术语：${drawerTerm.en}`}
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
