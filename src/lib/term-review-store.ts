/**
 * 术语自动发现 — 本机审核状态（V1.20.5）
 *
 * ## 为什么是 localStorage
 * 站点为静态站 + 构建期单一数据源，「待审核术语」的候选池由构建期扫描产出
 * （`content/glossary/candidates.json`），浏览器无法直接改写源码。
 * 因此**审核动作**在本机完成：忽略 / 采纳只记录归一 key，
 * 再导出「术语补全包」交给 Copilot 补全 14 字段，最终落到
 * `content/glossary/imported.json` → `npm run gen:glossary` → 全站生效。
 *
 * 与 Case Backlog（`case-backlog.ts`）同构，反过度工程：无后端、无权限、无富文本。
 *
 * ## 刻意只存 key
 * 本状态**不存候选正文**（术语名 / 上下文都只认构建期 JSON）。这样：
 *   - 候选池重新扫描后内容自动更新，本机不会留旧副本造成前后不一致；
 *   - 术语日后进入术语库、候选池里消失时，采纳记录仍以 key 保留，可追溯。
 *
 * ## 存储隔离
 * 独立 key：`fund-admin-academy-term-review-v1`（与学习进度 / 案例工坊 / 术语热度互不干扰）。
 */
import type { TermCandidate } from "@/types/term-candidates";

export const TERM_REVIEW_STORAGE_KEY = "fund-admin-academy-term-review-v1";

/** 已采纳（待补全并落库）的术语 */
export interface AdoptedTerm {
  /** 归一 key（小写） */
  key: string;
  /** 术语名（采纳时的原文，仅作展示便利；权威以候选池为准） */
  text: string;
  /** 采纳时间（epoch ms） */
  adoptedAt: number;
}

export interface TermReviewState {
  version: 1;
  /** 已忽略的候选（归一 key，小写） */
  ignored: string[];
  /** 已采纳、待导出补全包的术语 */
  adopted: AdoptedTerm[];
  updatedAt: number;
}

export function emptyTermReviewState(): TermReviewState {
  return { version: 1, ignored: [], adopted: [], updatedAt: Date.now() };
}

function normalizeAdopted(raw: unknown): AdoptedTerm | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const key = typeof o.key === "string" ? o.key.trim().toLowerCase() : "";
  if (!key) return null;
  return {
    key,
    text: typeof o.text === "string" ? o.text.trim() : key,
    adoptedAt: typeof o.adoptedAt === "number" ? o.adoptedAt : Date.now(),
  };
}

/** 从 localStorage 读取（SSR / 不可用时返回空状态） */
export function loadTermReviewState(): TermReviewState {
  if (typeof window === "undefined") return emptyTermReviewState();
  try {
    const raw = window.localStorage.getItem(TERM_REVIEW_STORAGE_KEY);
    if (!raw) return emptyTermReviewState();
    const parsed = JSON.parse(raw) as Partial<TermReviewState>;

    const ignored = Array.isArray(parsed.ignored)
      ? Array.from(
          new Set(
            parsed.ignored
              .filter((x): x is string => typeof x === "string")
              .map((x) => x.trim().toLowerCase())
              .filter(Boolean)
          )
        )
      : [];

    const seen = new Set<string>();
    const adopted: AdoptedTerm[] = [];
    for (const raw2 of Array.isArray(parsed.adopted) ? parsed.adopted : []) {
      const a = normalizeAdopted(raw2);
      if (!a || seen.has(a.key)) continue;
      seen.add(a.key);
      adopted.push(a);
    }

    return {
      version: 1,
      ignored,
      adopted,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return emptyTermReviewState();
  }
}

export function saveTermReviewState(state: TermReviewState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: TermReviewState = { ...state, version: 1, updatedAt: Date.now() };
    window.localStorage.setItem(TERM_REVIEW_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("[term-review] save failed:", err);
  }
}

/** 本地日期（Asia/Shanghai）展示，如 2026-09-20；ISO 缺失时返回空串 */
export function formatFoundDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const p = (x: number) => String(x).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/* ================================================================
 * 状态迁移（纯函数式；集中在此避免在组件体内调用 Date.now()，
 * 否则会触发 react-hooks/purity —— 组件只负责把这些结果写回 localStorage）
 * ================================================================ */

/** 忽略一个候选（同时把它从已采纳里摘掉） */
export function withIgnored(state: TermReviewState, key: string): TermReviewState {
  return {
    ...state,
    ignored: Array.from(new Set([...state.ignored, key])),
    adopted: state.adopted.filter((a) => a.key !== key),
  };
}

/** 恢复一个被忽略的候选 */
export function withRestored(state: TermReviewState, key: string): TermReviewState {
  return { ...state, ignored: state.ignored.filter((k) => k !== key) };
}

/** 采纳一个候选（同时把它从已忽略里摘掉；重复采纳幂等） */
export function withAdopted(
  state: TermReviewState,
  candidate: { key: string; text: string }
): TermReviewState {
  return {
    ...state,
    adopted: state.adopted.some((a) => a.key === candidate.key)
      ? state.adopted
      : [...state.adopted, { key: candidate.key, text: candidate.text, adoptedAt: Date.now() }],
    ignored: state.ignored.filter((k) => k !== candidate.key),
  };
}

/** 取消采纳 */
export function withUnadopted(state: TermReviewState, key: string): TermReviewState {
  return { ...state, adopted: state.adopted.filter((a) => a.key !== key) };
}

/** 清空已采纳清单（已落库的内容不受影响） */
export function withClearedAdopted(state: TermReviewState): TermReviewState {
  return { ...state, adopted: [] };
}

/** 来源短标签：课程优先，其次案例；最多 3 个，其余折叠为「+n」 */
export function sourceTagsOf(c: TermCandidate): { text: string; href: string }[] {
  const out: { text: string; href: string }[] = [];
  for (const s of c.samples) {
    const text = s.label.split(" · ")[0];
    if (out.some((o) => o.text === text)) continue;
    out.push({ text, href: s.href });
  }
  return out;
}

/** 置信档中文名（补全包内展示用；受控枚举见 @/types/term-candidates） */
const CONF_ZH: Record<string, string> = {
  declared: "正文声明",
  acronym: "缩写",
  phrase: "词组",
};

/** 术语补全包（交给 Copilot 生成 14 字段条目） */
export function buildTermCompletionPackage(
  adopted: AdoptedTerm[],
  byKey: Map<string, TermCandidate>
): string {
  const blocks = adopted.map((a, i) => {
    const c = byKey.get(a.key);
    if (!c) {
      return [`${i + 1}. ${a.text}（候选池中已不存在，请人工确认）`, ""].join("\n");
    }
    const sources = sourceTagsOf(c)
      .map((s) => s.text)
      .join(" / ");
    const ctx = c.samples.map((s) => `   - ${s.label}：${s.context}`).join("\n");
    return [
      `${i + 1}. ${c.text}`,
      `   置信档：${CONF_ZH[c.confidence] ?? c.confidence}｜出现 ${c.docs} 篇 / ${c.count} 次｜来源：${sources || "—"}`,
      `   首次发现：${formatFoundDate(c.firstSeenAt)}`,
      `   上下文：`,
      ctx || "   - （无摘录）",
      "",
    ].join("\n");
  });

  const skeleton = adopted
    .map((a) => `{"id": "", "term": "${(byKey.get(a.key)?.text ?? a.text).replace(/"/g, '\\"')}", "zh": "", "category": "", "definition": "", "whyImportant": "", "scenario": [], "aliases": [], "related": [], "source": [], "tags": [], "brief": ""}`)
    .join(",\n  ");

  return [
    "====================================",
    `请基于以下 ${adopted.length} 个「待审核术语」补全 Fund Admin Wiki 术语条目。`,
    "",
    "语料来源：本站课程（含选修）与案例库正文；术语库已有条目已排除。",
    "请先按上下文判断该术语是否真的属于「境外基金行政 / AML·KYC / 合规运营」领域，",
    "不属于的直接剔除并在回复里说明理由。",
    "",
    "---- 待补全术语 ----",
    ...blocks,
    "---- 输出要求 ----",
    "1) 逐条补全 14 字段：id / term / fullName / zh / category / level / jurisdiction /",
    "   definition / whyImportant / scenario / aliases / related / source / tags / brief。",
    "   - id 用小写连字符（如 capital-call）；category / jurisdiction / scenario / source /",
    "     level 必须取自 src/types/glossary.ts 的受控枚举，不得自创。",
    "   - related 只能指向术语库中已存在的 id。",
    "2) 不要写入生效日期、罚款金额、执法数字等时效性内容（项目硬规矩）。",
    "3) 标准答案类内容必须依据 ICS SOP，不得臆造。",
    "4) 最终输出 `content/glossary/imported.json` 的完整内容：",
    '   {"version": 1, "terms": [ ... ]}',
    "   结构骨架（可直接在此之上填写字段值）：",
    "  [",
    `  ${skeleton}`,
    "  ]",
    "====================================",
  ].join("\n");
}
