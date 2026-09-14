/**
 * Fund Admin Wiki — 术语热度统计（V1.14.1）
 *
 * 记录本机使用行为，滚动 30 天窗口：
 *   - view   打开术语详情页
 *   - search 在术语/知识检索中命中该术语
 *
 * 设计取舍：纯前端 localStorage，**不做服务端埋点**（站点为静态导出 + 无后端存储，
 * 且学习站不希望引入用户追踪）。因此榜单口径是「本机近 30 天热度」，
 * 用于识别个人学习需求与内容优先级，不代表全站流量。
 */

export const TERM_METRICS_KEY = "fund-admin-academy-wiki-metrics-v1";
export const TERM_METRICS_WINDOW_DAYS = 30;

export type TermMetricKind = "view" | "search";

export interface TermMetricEvent {
  /** 术语 id */
  id: string;
  /** view = 打开术语详情；search = 检索命中 */
  k: TermMetricKind;
  /** 时间戳（ms） */
  t: number;
}

export interface TermMetricsState {
  events: TermMetricEvent[];
}

export interface TopTermRow {
  id: string;
  views: number;
  searches: number;
  total: number;
}

const WINDOW_MS = TERM_METRICS_WINDOW_DAYS * 24 * 60 * 60 * 1000;
/** 事件上限（超出丢弃最旧的，避免 localStorage 无限增长） */
const MAX_EVENTS = 4000;

const EMPTY: TermMetricsState = { events: [] };

function canUseStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

/** 只保留 30 天窗口内的最新 MAX_EVENTS 条 */
function prune(events: TermMetricEvent[], now = Date.now()): TermMetricEvent[] {
  const cut = now - WINDOW_MS;
  const fresh = events.filter((e) => e && typeof e.t === "number" && e.t >= cut);
  return fresh.length > MAX_EVENTS ? fresh.slice(fresh.length - MAX_EVENTS) : fresh;
}

export function loadTermMetrics(): TermMetricsState {
  if (!canUseStorage()) return EMPTY;
  try {
    const raw = window.localStorage.getItem(TERM_METRICS_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as TermMetricsState;
    const events = Array.isArray(parsed?.events) ? parsed.events : [];
    return { events: prune(events) };
  } catch {
    return EMPTY;
  }
}

export function saveTermMetrics(state: TermMetricsState): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(
      TERM_METRICS_KEY,
      JSON.stringify({ events: prune(state.events) })
    );
  } catch {
    /* 配额或隐私模式：静默失败，不影响主功能 */
  }
}

export function clearTermMetrics(): void {
  if (!canUseStorage()) return;
  try {
    window.localStorage.removeItem(TERM_METRICS_KEY);
  } catch {
    /* 忽略 */
  }
}

/** 批量记录事件（同一批同 id 同类型去重） */
export function recordTermEvents(ids: string[], kind: TermMetricKind): void {
  if (!canUseStorage() || ids.length === 0) return;
  const now = Date.now();
  const uniq = [...new Set(ids.filter(Boolean))];
  if (uniq.length === 0) return;
  const state = loadTermMetrics();
  for (const id of uniq) state.events.push({ id, k: kind, t: now });
  saveTermMetrics(state);
}

/** 近 N 天热门术语榜（按合计次数降序；同分按 views 降序） */
export function topTerms(
  state: TermMetricsState,
  days = TERM_METRICS_WINDOW_DAYS,
  limit = 10
): TopTermRow[] {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  const map = new Map<string, TopTermRow>();
  for (const e of state.events) {
    if (!e || e.t < cut) continue;
    const row = map.get(e.id) ?? { id: e.id, views: 0, searches: 0, total: 0 };
    if (e.k === "view") row.views += 1;
    else row.searches += 1;
    row.total = row.views + row.searches;
    map.set(e.id, row);
  }
  return [...map.values()]
    .sort((a, b) => b.total - a.total || b.views - a.views || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** 近 N 天事件总数（用于「暂无数据」判定与展示） */
export function metricEventCount(state: TermMetricsState, days = TERM_METRICS_WINDOW_DAYS): number {
  const cut = Date.now() - days * 24 * 60 * 60 * 1000;
  return state.events.filter((e) => e && e.t >= cut).length;
}
