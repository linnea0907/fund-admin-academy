/**
 * Fund Admin Academy — 实务工具包 · 类型层（V1.15.0；V1.15.2 增加业务分类）
 *
 * 与 `src/data/aml-toolkit.ts`（内容）分离，避免「数据文件 ↔ UI」循环依赖。
 *
 * 定位：知识检索体系的一级分类「实务工具包」。内容形态是**可直接拿来用的实务工具**，
 * 而不是术语定义：
 *   checklist   清单 —— 开会/审阅时逐条打勾（董事会监督、外包监督）
 *   sop         流程 —— 事件发生时按步骤执行（制裁命中处置）
 *   comparison  对比 —— 容易混淆的角色/流程并排对照（AMLCO/MLRO/DMLRO、CDD/EDD/SDD）
 *
 * V1.15.2：工具包从「AML 单域」扩展为**跨域工具箱**，新增 `category` 业务分类维度
 * （KYC / AML / FATCA·CRS / 基金运营 / 估值 / 注册及架构），总览页按分类筛选。
 * 类型/文件名保留 `aml-toolkit` 为历史命名（避免大范围重命名），对用户可见文案统一为「实务工具包」。
 *
 * 设计取舍：**不写入法规时间线、生效日期、罚款金额、个别执法案例数字**。
 * 这类内容时效性强，会带来持续维护成本，本轮明确不纳入知识库。
 */

/** 业务分类（V1.15.2）：决定总览页的分组与筛选 */
export type ToolkitCategory =
  | "kyc"
  | "aml"
  | "fatca-crs"
  | "fund-ops"
  | "valuation"
  | "registration";

export interface ToolkitCategoryDef {
  id: ToolkitCategory;
  /** 中文展示名（总览页分组标题 / 筛选 chip） */
  zh: string;
  /** 一句话说明该类工具解决什么问题 */
  hint: string;
  /** chip 配色（Tailwind 组合，浅底深字） */
  tint: string;
}

/** 6 个业务分类固定顺序（总览页按此顺序渲染，空分类显示为「规划中」） */
export const TOOLKIT_CATEGORIES: ToolkitCategoryDef[] = [
  {
    id: "kyc",
    zh: "KYC 工具",
    hint: "客户身份识别与尽调：CDD / EDD / SDD 的适用与要求",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    id: "aml",
    zh: "AML 工具",
    hint: "反洗钱治理、筛查与事件处置：监督清单、制裁命中 SOP、角色分工",
    tint: "bg-rose-50 text-rose-700 ring-rose-200",
  },
  {
    id: "fatca-crs",
    zh: "FATCA / CRS 工具",
    hint: "涉税信息申报：身份分类、表格收集与申报口径核对",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "fund-ops",
    zh: "基金运营工具",
    hint: "日常运营：认购赎回、转账、费用与档案管理",
    tint: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  {
    id: "valuation",
    zh: "估值工具",
    hint: "净值与估值：估值政策、定价来源与复核流程",
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    id: "registration",
    zh: "注册及架构工具",
    hint: "设立与存续：注册登记、架构变更与公司秘书事务",
    tint: "bg-violet-50 text-violet-700 ring-violet-200",
  },
];

export function getToolkitCategory(id: ToolkitCategory): ToolkitCategoryDef {
  return (
    TOOLKIT_CATEGORIES.find((c) => c.id === id) ?? TOOLKIT_CATEGORIES[1]
  );
}

export type ToolkitKind = "checklist" | "sop" | "comparison";

export interface ToolkitKindDef {
  id: ToolkitKind;
  /** 英文短名（分组标题 / chips） */
  label: string;
  /** 中文名 */
  zh: string;
  /** chip 配色（Tailwind 组合，浅底深字） */
  tint: string;
}

export const TOOLKIT_KINDS: ToolkitKindDef[] = [
  {
    id: "checklist",
    label: "Checklist",
    zh: "清单",
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    id: "sop",
    label: "SOP",
    zh: "标准流程",
    tint: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  {
    id: "comparison",
    label: "Comparison",
    zh: "对比",
    tint: "bg-violet-50 text-violet-700 ring-violet-200",
  },
];

/* ---------------- checklist ---------------- */

export interface ToolkitChecklistSection {
  /** 清单分组标题（英文） */
  title: string;
  /** 分组标题（中文） */
  zh: string;
  /** 逐条检查项 */
  items: string[];
}

/* ---------------- sop ---------------- */

export interface ToolkitSopStep {
  /** 步骤标题（英文） */
  title: string;
  /** 步骤标题（中文） */
  zh: string;
  /** 该步骤要做什么 */
  detail: string;
  /** 补充要点（可选） */
  note?: string;
  /** 醒目警示（可选）：渲染为高对比警示条，用于红线级禁止事项（如 Tipping Off） */
  warning?: string;
}

/** SOP 分支结果（如 False Positive / True Match） */
export interface ToolkitSopOutcome {
  title: string;
  zh: string;
  detail: string;
}

/* ---------------- comparison ---------------- */

/** 对比表的行标签（会作为表格首列） */
export interface ToolkitComparisonRow {
  label: string;
  /** 与 columns 等长的单元格内容 */
  cells: string[];
}

export interface ToolkitComparison {
  /** 对比对象（表格列，首列由行标签占据） */
  columns: string[];
  rows: ToolkitComparisonRow[];
  /** 表格下方的重点提醒 */
  reminders?: string[];
}

/* ---------------- 条目 ---------------- */

export interface AmlToolkitItem {
  /** 锚点 id（URL 路径 /toolkit/<id> 与检索结果跳转依赖，稳定后勿改） */
  id: string;
  /** 业务分类（V1.15.2）：总览页分组与筛选 */
  category: ToolkitCategory;
  kind: ToolkitKind;
  /** 英文标题 */
  title: string;
  /** 中文标题 */
  zh: string;
  /** 一句话说明（列表行 / 检索结果展示） */
  summary: string;
  /** 什么场景下用这个工具 */
  purpose: string;
  /** 来源说明 */
  source: string;
  /** 本工具自身的更新时间（YYYY-MM，指内容修订月份，非法规生效日期） */
  updated: string;
  /** 自由标签（检索） */
  tags: string[];
  /** 关联术语 id（GlossaryTerm.id） */
  relatedTerms?: string[];
  /** 关联案例 id（Case-027…） */
  relatedCases?: string[];
  /** checklist：分组条目 */
  sections?: ToolkitChecklistSection[];
  /** sop：步骤 */
  steps?: ToolkitSopStep[];
  /** sop：分支结果 */
  outcomes?: ToolkitSopOutcome[];
  /** comparison：对照表 */
  comparison?: ToolkitComparison;
  /** 常见误区 */
  pitfalls?: string[];
}

export function getToolkitKind(kind: ToolkitKind): ToolkitKindDef {
  return TOOLKIT_KINDS.find((k) => k.id === kind) ?? TOOLKIT_KINDS[0];
}

export const TOOLKIT_KIND_LABEL: Record<ToolkitKind, string> = {
  checklist: "Checklist",
  sop: "SOP",
  comparison: "Comparison",
};
