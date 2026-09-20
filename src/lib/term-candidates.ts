/**
 * 术语自动发现 — 候选池读取（V1.20.5，**服务端专用**）
 *
 * ## 数据来源
 * `content/glossary/candidates.json` 由 `scripts/scan-term-candidates.mjs` 在 prebuild
 * 阶段生成（`npm run scan:terms`），候选池**提交进仓库**——同 `content/cases/index.json`
 * 的模式，好处是「首次发现时间」跨构建稳定、可 git 追溯。
 *
 * ## 服务端专用（硬约束）
 * 本模块依赖 `node:fs` / `node:path`，**绝不可在客户端组件里 import**。
 * 装配方式与首页一致：`src/app/glossary/page.tsx`（Server Component）调用本模块
 * → 以 props 传给 `GlossaryTabs`（"use client"）。
 * 若日后有人在客户端组件里 import 本文件，构建会失败——这是刻意的护栏。
 *
 * ## 兜底
 * 文件缺失 / JSON 损坏 / 字段非法 → 返回空池（并告警），页面显示空态而非报错。
 * 构建脚本是「非阻断」的：扫描失败不会拦构建，只是候选池保持上一次的内容。
 */

import fs from "node:fs";
import path from "node:path";
import {
  EMPTY_CANDIDATE_POOL,
  type CandidateConfidence,
  type CandidateSample,
  type TermCandidate,
  type TermCandidatePool,
} from "@/types/term-candidates";

const POOL_FILE = path.join(process.cwd(), "content", "glossary", "candidates.json");

const CONFIDENCES = new Set<CandidateConfidence>(["declared", "acronym", "phrase"]);

/** 单项正常化（脏数据丢弃，不阻断整池） */
function normalizeCandidate(raw: unknown): TermCandidate | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const key = typeof o.key === "string" ? o.key.trim().toLowerCase() : "";
  const text = typeof o.text === "string" ? o.text.trim() : "";
  if (!key || !text) return null;

  const samples: CandidateSample[] = Array.isArray(o.samples)
    ? (o.samples
        .map((s) => {
          if (!s || typeof s !== "object") return null;
          const r = s as Record<string, unknown>;
          const label = typeof r.label === "string" ? r.label : "";
          const href = typeof r.href === "string" ? r.href : "";
          if (!label || !href) return null;
          return {
            kind: r.kind === "case" ? ("case" as const) : ("course" as const),
            label,
            href,
            context: typeof r.context === "string" ? r.context : "",
          };
        })
        .filter((x): x is CandidateSample => x !== null))
    : [];

  const strArr = (v: unknown): string[] =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];

  return {
    key,
    text,
    confidence:
      typeof o.confidence === "string" && CONFIDENCES.has(o.confidence as CandidateConfidence)
        ? (o.confidence as CandidateConfidence)
        : "phrase",
    acronym: o.acronym === true,
    docs: typeof o.docs === "number" ? o.docs : 0,
    courses: strArr(o.courses),
    cases: strArr(o.cases),
    count: typeof o.count === "number" ? o.count : 0,
    samples,
    firstSeenAt: typeof o.firstSeenAt === "string" ? o.firstSeenAt : "",
    lastSeenAt: typeof o.lastSeenAt === "string" ? o.lastSeenAt : "",
  };
}

let cache: TermCandidatePool | null = null;

/**
 * 读取候选池（构建期调用一次，进程内缓存）。
 * 同一次构建里页面多处读取只解析一遍。
 */
export function loadCandidatePool(): TermCandidatePool {
  if (cache) return cache;

  if (!fs.existsSync(POOL_FILE)) {
    console.warn("[term-candidates] 候选池不存在（先运行 npm run scan:terms），按空池处理");
    cache = EMPTY_CANDIDATE_POOL;
    return cache;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(POOL_FILE, "utf8")) as Record<string, unknown>;
    const list = Array.isArray(parsed.candidates) ? parsed.candidates : [];
    const candidates = list
      .map(normalizeCandidate)
      .filter((x): x is TermCandidate => x !== null);

    const b = (parsed.baseline ?? {}) as Record<string, unknown>;
    const num = (v: unknown) => (typeof v === "number" ? v : 0);

    cache = {
      version: typeof parsed.version === "number" ? parsed.version : 1,
      generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : "",
      baseline: {
        glossaryTerms: num(b.glossaryTerms),
        documents: num(b.documents),
        courses: num(b.courses),
        cases: num(b.cases),
      },
      candidates,
    };
    return cache;
  } catch (err) {
    console.warn(`[term-candidates] 候选池解析失败，按空池处理：${String(err)}`);
    cache = EMPTY_CANDIDATE_POOL;
    return cache;
  }
}
