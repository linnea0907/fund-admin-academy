/**
 * Case Backlog V1.0 — 案例种子池（纯前端数据层）
 *
 * - 目标：把「案例想法采集」从聊天窗口搬到网站，30 秒记录一条种子，
 *   累计若干条后一键「生成案例包」交给 Copilot 批量生成标准案例（Case-xxx）。
 * - 存储：独立 localStorage key（fund-admin-academy-case-backlog-v1），
 *   与主学习进度（fund-admin-academy-v1）互不干扰。
 * - 状态仅 4 种：待整理 → 待生成 → 已生成 → 已上线，不允许扩展。
 * - 本模块为纯数据 + 纯函数，client/server 均可安全 import。
 */

/** 种子来源（下拉固定 6 项） */
export const SEED_SOURCES = [
  { key: "real_case", label: "真实案例" },
  { key: "client_consult", label: "客户咨询" },
  { key: "internal_sop", label: "内部SOP" },
  { key: "regulatory", label: "监管规则" },
  { key: "audit", label: "审计发现" },
  { key: "other", label: "其他" },
] as const;
export type SeedSourceKey = (typeof SEED_SOURCES)[number]["key"];

/** 状态仅保留 4 种（严禁新增） */
export const SEED_STATUSES = [
  { key: "triage", label: "待整理" },
  { key: "pending", label: "待生成" },
  { key: "generated", label: "已生成" },
  { key: "live", label: "已上线" },
] as const;
export type SeedStatusKey = (typeof SEED_STATUSES)[number]["key"];

/** localStorage Key（产品约定，勿改） */
export const BACKLOG_STORAGE_KEY = "fund-admin-academy-case-backlog-v1";

/** 案例种子 */
export interface CaseSeed {
  /** 编号，如 "Seed-001"（自动递增，不因删除复用） */
  seedId: string;
  /** 标题（必填） */
  title: string;
  /** 一句话描述（选填） */
  summary: string;
  /** 来源 */
  source: SeedSourceKey;
  /** 关联模块 M1~M5（选填，见 CASE_MODULES） */
  module: number | null;
  status: SeedStatusKey;
  /** 创建时间（epoch ms） */
  createdAt: number;
  /** 最近更新时间（epoch ms） */
  updatedAt: number;
}

interface BacklogPayload {
  version: 1;
  seeds: CaseSeed[];
}

const SOURCE_KEYS = new Set<string>(SEED_SOURCES.map((s) => s.key));
const STATUS_KEYS = new Set<string>(SEED_STATUSES.map((s) => s.key));

/** 单条种子结构校验（脏数据丢弃，避免破坏 UI） */
function normalizeSeed(raw: unknown): CaseSeed | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const title = typeof s.title === "string" ? s.title.trim() : "";
  if (!title) return null;
  const mod =
    typeof s.module === "number" && s.module >= 1 && s.module <= 5 ? s.module : null;
  return {
    seedId:
      typeof s.seedId === "string" && /^Seed-\d{3,}$/.test(s.seedId)
        ? s.seedId
        : "Seed-000",
    title,
    summary: typeof s.summary === "string" ? s.summary.trim() : "",
    source: typeof s.source === "string" && SOURCE_KEYS.has(s.source)
      ? (s.source as SeedSourceKey)
      : "other",
    module: mod,
    status:
      typeof s.status === "string" && STATUS_KEYS.has(s.status)
        ? (s.status as SeedStatusKey)
        : "pending",
    createdAt: typeof s.createdAt === "number" ? s.createdAt : Date.now(),
    updatedAt: typeof s.updatedAt === "number" ? s.updatedAt : Date.now(),
  };
}

/** 从 localStorage 安全读取（SSR / 不可用时返回空） */
export function loadSeeds(): CaseSeed[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BACKLOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<BacklogPayload>;
    const seeds = Array.isArray(parsed.seeds)
      ? parsed.seeds.map(normalizeSeed).filter((x): x is CaseSeed => x !== null)
      : [];
    // 防御：seedId 冲突时补齐
    return dedupeSeedIds(seeds);
  } catch {
    return [];
  }
}

export function saveSeeds(seeds: CaseSeed[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: BacklogPayload = { version: 1, seeds: dedupeSeedIds(seeds) };
    window.localStorage.setItem(BACKLOG_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("[case-backlog] save failed:", err);
  }
}

/** 保证 seedId 唯一（按出现顺序，重复项以后缀 _dup 兜底重排） */
function dedupeSeedIds(seeds: CaseSeed[]): CaseSeed[] {
  const seen = new Set<string>();
  const nextN = nextSeedNumber(seeds);
  let n = nextN;
  return seeds.map((s) => {
    if (!seen.has(s.seedId)) {
      seen.add(s.seedId);
      return s;
    }
    const copy = { ...s, seedId: `Seed-${String(n).padStart(3, "0")}` };
    n += 1;
    seen.add(copy.seedId);
    return copy;
  });
}

/** 下一个可用的种子序号（现有最大序号 + 1，删除不复用） */
export function nextSeedNumber(seeds: CaseSeed[]): number {
  let max = 0;
  for (const s of seeds) {
    const m = /^Seed-(\d+)$/.exec(s.seedId);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

export function formatSeedId(n: number): string {
  return `Seed-${String(n).padStart(3, "0")}`;
}

/** 本地日期（Asia/Shanghai）展示，如 2026-09-09 */
export function formatSeedDate(ms: number): string {
  const d = new Date(ms);
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function sourceLabel(key: SeedSourceKey): string {
  return SEED_SOURCES.find((s) => s.key === key)?.label ?? key;
}

export function statusLabel(key: SeedStatusKey): string {
  return SEED_STATUSES.find((s) => s.key === key)?.label ?? key;
}

/**
 * 生成案例包文本（交给 Copilot 的批量生成提示词）。
 * 仅接收「待生成」状态的种子，保持与页面调用约定一致。
 */
export function buildCasePackageText(
  seeds: Pick<CaseSeed, "title" | "summary">[]
): string {
  const items = seeds
    .map((s, i) => {
      const head = `${i + 1}. ${s.title}`;
      return s.summary ? `${head}\n${s.summary}` : head;
    })
    .join("\n");
  return [
    "====================================",
    "请基于以下案例种子生成 Fund Admin Academy 标准案例：",
    items,
    "......",
    "请输出：",
    "Case-xxx Markdown格式。",
    "====================================",
  ].join("\n");
}
