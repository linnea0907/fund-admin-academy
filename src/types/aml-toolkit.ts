/**
 * Fund Admin Academy — AML 实务工具包 · 类型层（V1.15.0）
 *
 * 与 `src/data/aml-toolkit.ts`（内容）分离，避免「数据文件 ↔ UI」循环依赖。
 *
 * 定位：知识检索的一级分类「AML 实务工具包」。内容形态是**可直接拿来用的实务工具**，
 * 而不是术语定义：
 *   checklist   清单 —— 开会/审阅时逐条打勾（董事会监督、外包监督）
 *   sop         流程 —— 事件发生时按步骤执行（制裁命中处置）
 *   comparison  对比 —— 容易混淆的角色/流程并排对照（AMLCO/MLRO/DMLRO、CDD/EDD/SDD）
 *
 * 设计取舍：**不写入法规时间线、生效日期、罚款金额、个别执法案例数字**。
 * 这类内容时效性强，会带来持续维护成本，本轮明确不纳入知识库。
 */

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
  /** 锚点 id（URL #hash 与检索结果跳转依赖，稳定后勿改） */
  id: string;
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
