/**
 * 术语自动发现 — 待审核候选池类型层（V1.20.5）
 *
 * 与 `src/lib/term-candidates.ts`（服务端读取层，依赖 `node:fs`）分离：
 *   src/types/term-candidates.ts  类型 + 受控枚举（本文件，零依赖，客户端可安全 import）
 *   src/lib/term-candidates.ts    读取 content/glossary/candidates.json（**服务端专用**）
 *   scripts/scan-term-candidates.mjs  扫描器（prebuild 生成候选池 JSON）
 *
 * 候选池由构建期扫描产出，客户端只做「渲染 + 本机审核状态」，
 * 因此本文件必须保持零依赖，避免把 node 内置模块带进客户端 bundle。
 */

/* ================================================================
 * 置信度三档（扫描器按此顺序排序，越靠前越可信）
 * ================================================================ */
export type CandidateConfidence = "declared" | "acronym" | "phrase";

export interface CandidateConfidenceDef {
  id: CandidateConfidence;
  /** 短标签（列表徽标用） */
  label: string;
  /** 该档的判定口径说明 */
  rule: string;
  /** 徽标配色（Tailwind 组合，浅底深字） */
  tint: string;
  /** 实测精度说明（扫描器在真实语料上的表现） */
  note: string;
}

export const CANDIDATE_CONFIDENCES: CandidateConfidenceDef[] = [
  {
    id: "declared",
    label: "正文声明",
    rule: "正文自带「中文名（缩写）」或「缩写（英文全称）」，等于原文自己声明了这是一个术语",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    note: "精度最高",
  },
  {
    id: "acronym",
    label: "缩写",
    rule: "出现在中文语境中的 2~6 位全大写缩写（前后 30 字符内有中文字）",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
    note: "精度高",
  },
  {
    id: "phrase",
    label: "词组",
    rule: "出现在中文语境中的首字母大写词组（1~3 词）",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
    note: "含人名与通用词误报，需人工判断",
  },
];

export function getCandidateConfidence(id: CandidateConfidence): CandidateConfidenceDef {
  return CANDIDATE_CONFIDENCES.find((c) => c.id === id) ?? CANDIDATE_CONFIDENCES[2];
}

/* ================================================================
 * 候选条目
 * ================================================================ */
export interface CandidateSample {
  /** 来源类型：课程 / 案例 */
  kind: "course" | "case";
  /** 来源标签，如「第 02 讲 · 2.1 维度一：组织形式」 */
  label: string;
  /** 站内跳转（课程 / 案例） */
  href: string;
  /** 上下文摘录（±45 字符） */
  context: string;
}

export interface TermCandidate {
  /** 归一 key（小写），本机忽略 / 采纳状态以此为准 */
  key: string;
  /** 术语名（原样，如 "OFC" / "Private Investment Fund"） */
  text: string;
  confidence: CandidateConfidence;
  /** 是否缩写形态（用于列表筛选） */
  acronym: boolean;
  /** 出现在多少篇语料文档中 */
  docs: number;
  /** 出现的课程标签（去重），如 ["第 02 讲"] */
  courses: string[];
  /** 出现的案例编号（去重），如 ["Case-028"] */
  cases: string[];
  /** 总出现次数 */
  count: number;
  /** 上下文样例（最多 3 条） */
  samples: CandidateSample[];
  /** 首次被发现的时间（ISO 8601；跨构建稳定，签名未变则复用） */
  firstSeenAt: string;
  /** 最近一次在语料中出现的时间（ISO 8601） */
  lastSeenAt: string;
}

export interface CandidatePoolBaseline {
  /** 扫描时术语库已有条目数 */
  glossaryTerms: number;
  /** 语料文档总数 */
  documents: number;
  /** 其中课程文档数 */
  courses: number;
  /** 其中案例文档数 */
  cases: number;
}

export interface TermCandidatePool {
  version: number;
  /** 候选池生成时间（ISO 8601；内容无变化时不刷新） */
  generatedAt: string;
  baseline: CandidatePoolBaseline;
  candidates: TermCandidate[];
}

/** 空池（`candidates.json` 缺失 / 损坏时的兜底，页面据此显示空态而非报错） */
export const EMPTY_CANDIDATE_POOL: TermCandidatePool = {
  version: 1,
  generatedAt: "",
  baseline: { glossaryTerms: 0, documents: 0, courses: 0, cases: 0 },
  candidates: [],
};
