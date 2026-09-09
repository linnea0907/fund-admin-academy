/**
 * Case Library — 案例分类体系（V1.13.1 Jurisdiction First）
 *
 * 五维分类（在 module/skills/level/tags 基础上新增的标准化分类层）：
 *   1. Jurisdiction   属地 —— 规则来源地（优先级最高，如：开曼基金 KYC 规则 →
 *                     Cayman，即使投资人来自香港）。首批 9 项。
 *   2. Business Area  业务场景 —— 8 项受控场景（Onboarding/Transfer/Redemption…）
 *   3. Entity Type    实体类型 —— 交易对手/投资人主体类型（5 项）
 *   4. Topic          知识主题 —— 判断涉及的核心知识点（11 项，可多个）
 *   5. Tags           自由标签 —— 关键词检索（frontmatter 既有 tags 字段，继续演进）
 *
 * 设计目标：支撑 50–100+ 案例后的检索效率。数据源 = 案例 frontmatter
 * （scripts/build-case-index.mjs 烘焙进 index.json），展示/筛选用本注册表。
 *
 * 纯前端数据定义（无 fs/process 依赖），client/server 均可安全 import。
 */

/* ================================================================
 * Jurisdiction · 属地（适用规则来源地 —— 核心分类，优先级最高）
 * 案例首先按适用司法管辖区分类。Jurisdiction = 规则来源，
 * 而非投资人国籍/居住地。
 * ================================================================ */
export const CASE_JURISDICTIONS = [
  "Cayman",
  "BVI",
  "Hong Kong",
  "Singapore",
  "China",
  "USA",
  "UK",
  "UAE",
  "Other",
] as const;
export type CaseJurisdiction = (typeof CASE_JURISDICTIONS)[number];

/** 属地展示 meta（📍 Cayman） */
export function jurisdictionMeta(j: string): string {
  return `📍 ${j}`;
}

/* ================================================================
 * Business Area · 业务场景
 * ================================================================ */
export const CASE_BUSINESS_AREAS = [
  "Investor Onboarding",
  "Transfer",
  "Redemption",
  "Periodic Review",
  "AEOI / CRS / FATCA",
  "Fund Setup",
  "Fund Governance",
  "Fund Operations",
] as const;
export type CaseBusinessArea = (typeof CASE_BUSINESS_AREAS)[number];

/** 业务场景展示 meta（📂 Investor Onboarding） */
export function businessAreaMeta(a: string): string {
  return `📂 ${a}`;
}

/* ================================================================
 * Entity Type · 实体类型（案例交易对手/投资人主体）
 * ================================================================ */
export const CASE_ENTITY_TYPES = [
  "Individual",
  "Corporate",
  "Trust",
  "Partnership",
  "Fund",
] as const;
export type CaseEntityType = (typeof CASE_ENTITY_TYPES)[number];

/** 实体类型展示 meta（👤 Individual） */
export function entityTypeMeta(t: string): string {
  return `👤 ${t}`;
}

/* ================================================================
 * Topic · 知识主题（一个案例可关联多个；UI 主展示取首个）
 * ================================================================ */
export const CASE_TOPICS = [
  "Identity Verification",
  "Address Proof",
  "UBO",
  "Trust",
  "PEP",
  "Adverse Media",
  "SOF",
  "SOW",
  "Sanctions",
  "Tax Residency",
  "CRS",
  "FATCA",
] as const;
export type CaseTopic = (typeof CASE_TOPICS)[number];

/** 知识主题展示 meta（🏷 Identity Verification） */
export function topicMeta(t: string): string {
  return `🏷 ${t}`;
}

/* ================================================================
 * 工具：把自由 frontmatter 值归一为合法受控清单值（非法 → null）
 * ================================================================ */
export function asJurisdiction(v: unknown): CaseJurisdiction | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return (CASE_JURISDICTIONS as readonly string[]).includes(t)
    ? (t as CaseJurisdiction)
    : null;
}

/** 多属地归一（frontmatter/index 的 jurisdiction 数组）：值域内成员去重保留；
 *  输入非法/为空 → ["Other"]，保证元数据非空（跨属地对照案可含多值） */
export function asJurisdictions(v: unknown): CaseJurisdiction[] {
  if (Array.isArray(v)) {
    const out: CaseJurisdiction[] = [];
    const seen = new Set<string>();
    for (const x of v) {
      const t = asJurisdiction(x);
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    if (out.length > 0) return out;
  } else {
    const t = asJurisdiction(v);
    if (t) return [t];
  }
  return ["Other"];
}

export function asBusinessArea(v: unknown): CaseBusinessArea | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return (CASE_BUSINESS_AREAS as readonly string[]).includes(t)
    ? (t as CaseBusinessArea)
    : null;
}

export function asEntityType(v: unknown): CaseEntityType | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return (CASE_ENTITY_TYPES as readonly string[]).includes(t)
    ? (t as CaseEntityType)
    : null;
}

export function asTopics(v: unknown): CaseTopic[] {
  if (Array.isArray(v)) {
    const out: CaseTopic[] = [];
    const seen = new Set<string>();
    for (const x of v) {
      const t = asTopicSingle(x);
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    return out;
  }
  const t = asTopicSingle(v);
  return t ? [t] : [];
}

function asTopicSingle(v: unknown): CaseTopic | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return (CASE_TOPICS as readonly string[]).includes(t) ? (t as CaseTopic) : null;
}

/* ================================================================
 * 分类 Chip 展示信息（供卡片 / 详情页 / 筛选行用）
 * ================================================================ */
export interface CategoryChip {
  key: "jurisdiction" | "businessArea" | "entityType" | "topic";
  label: string;
  value: string;
}
