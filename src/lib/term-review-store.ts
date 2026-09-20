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

/**
 * 由术语名推导 id（V1.20.6）。
 * ⚠️ 必须与 `scripts/build-glossary-import.mjs` 的兜底推导**同口径**，
 * 否则补全包里预填的 id 与生成器实际产出的 id 会不一致。
 */
export function slugOfTerm(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 待补占位符（导入脚本会拒收含该标记的条目，见 build-glossary-import.mjs） */
export const TODO_MARK = "〔待补〕";

const ENUMS = {
  category: [
    "fund-structure",
    "aml-kyc",
    "aeoi",
    "fund-operations",
    "regulatory",
    "legal-entity",
    "governance",
    "tax",
  ],
  level: ["core", "advanced", "expert"],
  jurisdiction: [
    "Global",
    "Cayman",
    "BVI",
    "Hong Kong",
    "Singapore",
    "China",
    "USA",
    "UK",
    "EU",
    "Luxembourg",
    "Mauritius",
    "Other",
  ],
  scenario: [
    "Investor Onboarding",
    "Transfer",
    "Redemption",
    "Periodic Review",
    "AEOI / CRS / FATCA",
    "Fund Setup",
    "Fund Governance",
    "Fund Operations",
    "Regulatory Filing",
    "Client Communication",
  ],
  source: ["ics", "blue-book", "cima", "sfc", "mas", "internal"],
};

/**
 * 术语补全包（V1.20.6：结构化半成品 —— 系统填「可确定的」，Copilot 写「内容类」）
 *
 * 职责分工（Lu 定稿「系统负责发现，AI 负责内容」）：
 *   系统预填（零臆造）：id / term / zh / fullName（正文自带声明时）/ courses / cases
 *   Copilot 撰写：definition / whyImportant / commonMistakes / brief / category /
 *                 level / jurisdiction / scenario / aliases / related / source / tags
 * 末尾附可直接落库的 imported.json 骨架（合法 JSON 结构 + 〔待补〕 占位）。
 * ⚠️ 导入脚本会拒收仍含 〔待补〕 的条目 —— 占位未替换就无法入库（双保险：闸门还会再拦断链）。
 */
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
    const filled = [
      `term=${c.text}`,
      `id=${slugOfTerm(c.text)}`,
      c.zh ? `zh=${c.zh}` : null,
      c.fullName ? `fullName=${c.fullName}` : null,
    ]
      .filter(Boolean)
      .join("｜");
    const rel =
      [
        (c.courseIds ?? []).length ? `关联课程 ${JSON.stringify(c.courseIds)}` : null,
        (c.cases ?? []).length ? `关联案例 ${JSON.stringify(c.cases)}` : null,
      ]
        .filter(Boolean)
        .join("｜") || "关联课程 / 案例：未识别到（请人工确认）";
    const ctx = c.samples.map((s) => `     - ${s.label}：${s.context}`);
    return [
      `${i + 1}. ${c.text}  〔${CONF_ZH[c.confidence] ?? c.confidence}〕`,
      `   出现 ${c.docs} 篇 / ${c.count} 次｜来源：${sources || "—"}｜首次发现 ${formatFoundDate(c.firstSeenAt)}`,
      `   系统已填：${filled}`,
      `   ${rel}`,
      ...(c.zh || c.fullName
        ? ["   ⚠️ 中文名 / 英文全称由正文声明自动提取，可能有前缀噪声，请校验后再用。"]
        : []),
      `   上下文：`,
      ...(ctx.length ? ctx : ["     - （无摘录）"]),
      "",
    ].join("\n");
  });

  const skeleton = adopted
    .map((a) => {
      const c = byKey.get(a.key);
      const esc = (s: string) => s.replace(/"/g, '\\"');
      const parts = [
        `"id": "${slugOfTerm(c?.text ?? a.text)}"`,
        `"term": "${esc(c?.text ?? a.text)}"`,
        `"fullName": ${c?.fullName ? `"${esc(c.fullName)}"` : `"${TODO_MARK}"`}`,
        `"zh": ${c?.zh ? `"${esc(c.zh)}"` : `"${TODO_MARK}"`}`,
        `"category": "${TODO_MARK}"`,
        `"level": "${TODO_MARK}"`,
        `"jurisdiction": ["${TODO_MARK}"]`,
        `"definition": "${TODO_MARK}"`,
        `"whyImportant": "${TODO_MARK}"`,
        `"scenario": ["${TODO_MARK}"]`,
        `"aliases": ["${TODO_MARK}"]`,
        `"related": ["${TODO_MARK}"]`,
        `"source": ["${TODO_MARK}"]`,
        `"tags": ["${TODO_MARK}"]`,
        `"brief": "${TODO_MARK}"`,
      ];
      const courseIds = c?.courseIds ?? [];
      const cases = c?.cases ?? [];
      if (courseIds.length) parts.push(`"courses": ${JSON.stringify(courseIds)}`);
      if (cases.length) parts.push(`"cases": ${JSON.stringify(cases)}`);
      return `  { ${parts.join(", ")} }`;
    })
    .join(",\n");

  return [
    "====================================",
    "Fund Admin Wiki · 术语补全包（结构化半成品）",
    "====================================",
    `共 ${adopted.length} 个已采纳术语待补全。`,
    "系统已填好「可确定字段」（id / 术语名 / 正文自带的中文名与英文全称 / 关联课程·案例），",
    `其余字段以 ${TODO_MARK} 标出，请你撰写。术语库已有条目已排除。`,
    "",
    "---- 硬规矩 ----",
    "1) 受控枚举（只能取以下值，不得自创）：",
    `   category      ${ENUMS.category.join("｜")}`,
    `   level         ${ENUMS.level.join("｜")}`,
    `   jurisdiction  ${ENUMS.jurisdiction.join("｜")}`,
    `   scenario      ${ENUMS.scenario.join("｜")}`,
    `   source        ${ENUMS.source.join("｜")}`,
    "2) related 只能指向术语库中**已存在**的 id（可查 src/data/glossary/*.ts 或站内 /glossary）。",
    "3) aliases / scenario / related / source / tags 均为**非空数组**，至少 1 项。",
    "4) 不要写入生效日期、罚款金额、执法数字等**时效性内容**（项目硬规矩）。",
    "5) 定义与标准答案类内容必须依据 ICS SOP 与课程 / 案例原文，不得臆造。",
    "6) 请先按上下文判断该术语是否真属于「境外基金行政 / AML·KYC / 合规运营」领域，",
    "   不属于的直接剔除并在回复里说明理由（不要为了凑数而收录）。",
    "",
    "---- 待补全术语 ----",
    ...blocks,
    "---- 输出要求 ----",
    `把下方骨架里**所有 ${TODO_MARK} 替换为真实内容**（导入脚本会拒收仍含占位符的条目），`,
    "然后输出 content/glossary/imported.json 的完整内容：",
    '{"version": 1, "terms": [ ... ]}',
    "骨架（已是合法 JSON 结构，可直接在此之上填写字段值）：",
    "[",
    skeleton,
    "]",
    "====================================",
  ].join("\n");
}
