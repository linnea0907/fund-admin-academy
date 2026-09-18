/**
 * 模拟考试记录数据层（V1.20.1）
 *
 * 背景：CamsExam 自 V1.16.0 上线起是「纯会话内」的——交卷后得分只在当前页面
 * 存在，离开即丢失，首页也无从展示「模拟考试记录」。本模块把每次交卷的结果
 * 落成一条本地记录，供首页「学习概览」展示。
 *
 * 设计约束（沿用 `notes.ts` / `storage.ts` 的既有约定）：
 * - **独立 localStorage key**（`fund-admin-academy-exam-records-v1`），
 *   不混入全局学习进度（`fund-admin-academy-v1`），也不混入笔记 key。
 * - **纯客户端模块：禁止在服务端 import**（组件须挂载后再读，见下）。
 * - **首帧不可读 localStorage**：SSG 出来的静态 HTML 里没有记录，
 *   若首帧就按存储求值 → 服务端与客户端首帧不一致 → React #418。
 *   因此调用方一律「首帧渲染空值 + 挂载后回读」，与 `use-ui-pref` 同口径。
 * - 记录按时间倒序、**只保留最近 MAX_EXAM_RECORDS 条**，避免无限增长。
 * - 旧数据免迁移：本模块首次出现即自带清洗（`normalizeRecord`），
 *   不存在历史结构，故无需任何迁移代码。
 */
import type { CamsDomain } from "@/types/cams";

export const EXAM_RECORDS_KEY = "fund-admin-academy-exam-records-v1";

/** 最多保留的考试记录条数（超出后丢弃最旧的） */
export const MAX_EXAM_RECORDS = 20;

export interface ExamDomainScore {
  correct: number;
  total: number;
}

export interface ExamRecord {
  /** 记录 id（`${examId}-${at}`，用于列表 key） */
  id: string;
  /** 考试标识（当前只有 CAMS 全真模拟） */
  examId: string;
  /** 交卷时间戳 */
  at: number;
  /** 答对题数 */
  correct: number;
  /** 总题数 */
  total: number;
  /** 百分制得分（0–100） */
  percent: number;
  /** 是否达到及格线 */
  passed: boolean;
  /** 实际作答题数 */
  answered: number;
  /** 用时（秒） */
  durationSec: number;
  /** 分域正确率 */
  byDomain: Record<CamsDomain, ExamDomainScore>;
}

/** 追加一条记录时的入参（id / at 由本模块生成，避免调用方各自造时间戳） */
export type ExamRecordInput = Omit<ExamRecord, "id" | "at">;

const DOMAINS: CamsDomain[] = ["A", "B", "C", "D"];

function normInt(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) && v >= 0
    ? Math.round(v)
    : fallback;
}

function normDomainScores(raw: unknown): Record<CamsDomain, ExamDomainScore> {
  const out: Record<CamsDomain, ExamDomainScore> = {
    A: { correct: 0, total: 0 },
    B: { correct: 0, total: 0 },
    C: { correct: 0, total: 0 },
    D: { correct: 0, total: 0 },
  };
  if (!raw || typeof raw !== "object") return out;
  const src = raw as Record<string, unknown>;
  for (const d of DOMAINS) {
    const item = src[d];
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const total = normInt(rec.total);
    const correct = Math.min(normInt(rec.correct), total);
    out[d] = { correct, total };
  }
  return out;
}

/** 单条记录清洗：结构不完整即丢弃（返回 null） */
function normalizeRecord(raw: unknown): ExamRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const at = normInt(r.at);
  const examId = typeof r.examId === "string" ? r.examId.trim() : "";
  const total = normInt(r.total);
  // 记录必须能定位到「哪次考试、何时交卷、多少题」，否则视为坏数据
  if (!at || !examId || !total) return null;
  const correct = Math.min(normInt(r.correct), total);
  const picked = normInt(r.percent);
  return {
    id: typeof r.id === "string" && r.id.trim() ? r.id.trim() : `${examId}-${at}`,
    examId,
    at,
    correct,
    total,
    // 百分制自洽：缺失时按答对率回算，避免出现「90% 但只答对 1 题」
    percent: picked || Math.round((correct / total) * 100),
    passed: r.passed === true,
    answered: Math.min(normInt(r.answered), total),
    durationSec: normInt(r.durationSec),
    byDomain: normDomainScores(r.byDomain),
  };
}

/** 读取全部考试记录（按时间倒序；脏数据逐条清洗，坏记录丢弃） */
export function loadExamRecords(): ExamRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXAM_RECORDS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (
      parsed
        .map(normalizeRecord)
        .filter((r): r is ExamRecord => r !== null)
        // 新→旧：首页「最近一次」直接取 [0]
        .sort((a, b) => b.at - a.at)
        .slice(0, MAX_EXAM_RECORDS)
    );
  } catch {
    return [];
  }
}

function persist(records: ExamRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(EXAM_RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("[fund-admin-academy] exam records save failed:", err);
  }
}

/**
 * 追加一条考试记录（交卷时调用）。
 *
 * 读→合并→写在同一函数内完成，避免调用方各自维护列表导致并发覆盖。
 * 返回写入后的完整列表（新→旧），方便调用方直接取 [0]。
 */
export function appendExamRecord(input: ExamRecordInput): ExamRecord[] {
  const at = Date.now();
  const record: ExamRecord = {
    ...input,
    byDomain: normDomainScores(input.byDomain),
    id: `${input.examId}-${at}`,
    at,
  };
  const next = [record, ...loadExamRecords()].slice(0, MAX_EXAM_RECORDS);
  persist(next);
  return next;
}

/** 最近一次考试记录（无记录返回 null） */
export function latestExamRecord(records: ExamRecord[]): ExamRecord | null {
  return records.length > 0 ? records[0] : null;
}

/** 已通过（达到及格线）的考试次数 */
export function passedExamCount(records: ExamRecord[]): number {
  return records.filter((r) => r.passed).length;
}

/** 历史最高分（无记录返回 null） */
export function bestExamPercent(records: ExamRecord[]): number | null {
  if (records.length === 0) return null;
  return records.reduce((best, r) => Math.max(best, r.percent), 0);
}
