/**
 * Fund Admin Wiki — 术语类型层（V1.14.0）
 *
 * 与 `src/lib/glossary.ts`（匹配引擎 + 聚合）分离，避免「数据文件 ↔ 引擎」循环依赖：
 *   src/types/glossary.ts   类型 + 受控枚举（本文件，零依赖）
 *   src/data/glossary/*.ts  术语内容（按分类拆文件）
 *   src/lib/glossary.ts     聚合 + 文本匹配/标注引擎 + 使用索引类型
 *
 * 术语统一结构见 GlossaryTerm（对齐 V1.14.0 spec 的 14 个字段）。
 */

/* ================================================================
 * 分类体系（V1.14.0 八大类；替代 V1.9 的五类）
 * ================================================================ */
export type GlossaryCategory =
  | "fund-structure"
  | "aml-kyc"
  | "aeoi"
  | "fund-operations"
  | "regulatory"
  | "legal-entity"
  | "governance"
  | "tax";

export interface GlossaryCategoryDef {
  id: GlossaryCategory;
  /** 英文短名（chips / 搜索） */
  label: string;
  /** 中文说明 */
  zh: string;
  /** 列表/详情 chip 配色（Tailwind 组合，浅底深字） */
  tint: string;
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryDef[] = [
  {
    id: "fund-structure",
    label: "Fund Structure",
    zh: "基金结构",
    tint: "bg-teal-50 text-teal-700 ring-teal-200",
  },
  {
    id: "aml-kyc",
    label: "AML / KYC",
    zh: "反洗钱与客户尽调",
    tint: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    id: "aeoi",
    label: "AEOI / FATCA / CRS",
    zh: "税务信息自动交换",
    tint: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    id: "fund-operations",
    label: "Fund Operations",
    zh: "基金运营",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "regulatory",
    label: "Regulatory",
    zh: "监管与牌照",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "legal-entity",
    label: "Legal Entity",
    zh: "法律实体",
    tint: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  {
    id: "governance",
    label: "Governance",
    zh: "治理与受托",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    id: "tax",
    label: "Tax",
    zh: "税务",
    tint: "bg-orange-50 text-orange-700 ring-orange-200",
  },
];

/* ================================================================
 * Source · 术语来源（用于区分「监管要求 / 公司实践 / 培训知识」）
 * ================================================================ */
export type TermSourceId =
  | "ics"
  | "blue-book"
  | "cima"
  | "sfc"
  | "mas"
  | "internal";

export type TermSourceNature = "监管要求" | "公司实践" | "培训知识";

export interface TermSourceDef {
  id: TermSourceId;
  label: string;
  /** 归类性质：监管要求 / 公司实践 / 培训知识 */
  nature: TermSourceNature;
}

export const TERM_SOURCES: TermSourceDef[] = [
  { id: "ics", label: "ICS SOP", nature: "公司实践" },
  { id: "internal", label: "Internal Practice", nature: "公司实践" },
  { id: "blue-book", label: "Blue Book", nature: "培训知识" },
  { id: "cima", label: "CIMA Guidance", nature: "监管要求" },
  { id: "sfc", label: "SFC Guidance", nature: "监管要求" },
  { id: "mas", label: "MAS Guidance", nature: "监管要求" },
];

/* ================================================================
 * Fund Admin Scenario · 业务场景（受控词表，与案例库业务域对齐）
 * ================================================================ */
export const TERM_SCENARIOS = [
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
] as const;
export type TermScenario = (typeof TERM_SCENARIOS)[number];

/* ================================================================
 * Jurisdiction · 属地（规则来源地，非投资人国籍）
 * ================================================================ */
export const TERM_JURISDICTIONS = [
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
] as const;
export type TermJurisdiction = (typeof TERM_JURISDICTIONS)[number];

/* ================================================================
 * Level · 术语成熟度等级（V1.14.1）
 *   用于学习路径 / 考试系统 / 新人培养分层：
 *   core     = 基础：入门必学、日常高频
 *   advanced = 进阶：需要一定实务经验
 *   expert   = 专精：高度专业或小众主题
 * ================================================================ */
export type TermLevel = "core" | "advanced" | "expert";

export interface TermLevelDef {
  id: TermLevel;
  label: string;
  zh: string;
  /** chip 配色（Tailwind 组合，浅底深字） */
  tint: string;
}

export const TERM_LEVELS: TermLevelDef[] = [
  { id: "core", label: "Core", zh: "基础", tint: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { id: "advanced", label: "Advanced", zh: "进阶", tint: "bg-amber-50 text-amber-700 ring-amber-200" },
  { id: "expert", label: "Expert", zh: "专精", tint: "bg-rose-50 text-rose-700 ring-rose-200" },
];

export function getTermLevel(id: TermLevel): TermLevelDef {
  return TERM_LEVELS.find((l) => l.id === id) ?? TERM_LEVELS[0];
}

/* ================================================================
 * 术语（V1.14.0 统一结构）
 * ================================================================ */
export interface GlossaryTerm {
  /** 术语 id（URL 用，如 "capital-call"；稳定后勿改，收藏与高亮锚点依赖） */
  id: string;
  /** Term：英文缩写或术语名 */
  term: string;
  /** Full Name：英文全称（无全称时与 term 相同） */
  fullName: string;
  /** Chinese Name：中文名 */
  zh: string;
  /** Category：八大分类之一 */
  category: GlossaryCategory;
  /** Level：成熟度等级（Core / Advanced / Expert；V1.14.1） */
  level: TermLevel;
  /** Jurisdiction：属地（可多个；Global 表示通用规则） */
  jurisdiction: TermJurisdiction[];
  /** Definition：定义 */
  definition: string;
  /** Why Important：为什么重要 */
  whyImportant: string;
  /** Fund Admin Scenario：实务中在哪些环节遇到（受控词表） */
  scenario: TermScenario[];
  /** Alias：别名（含英文全称、变体、中文别称），参与搜索匹配 */
  aliases: string[];
  /** Related Terms：关联术语 id（知识图谱式导航） */
  related: string[];
  /** Related Cases：人工指定关联案例 id（Case-001）；自动扫描结果由使用索引补充 */
  cases?: string[];
  /** Related Courses：人工指定关联课程 id（"01" / "E1"）；自动扫描结果由使用索引补充 */
  courses?: string[];
  /** Source：术语来源（可多个） */
  source: TermSourceId[];
  /** Tags：自由标签（关键词检索） */
  tags: string[];
  /** 一句话定义（Tooltip / 列表行展示） */
  brief: string;
  /** 常见误区（可选，1~3 条） */
  commonMistakes?: string[];
}
