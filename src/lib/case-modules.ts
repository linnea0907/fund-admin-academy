/**
 * Case Library V2 — 纯前端数据定义（可安全用于 client 组件）
 *
 * - CASE_MODULES：5 个一级分类（Module 1~5）注册表
 * - CASE_SECTIONS：案例正文小节定义（与 Markdown 文件中的 `# 中文标题` 一一对应）
 */
import type { CaseModuleId, CaseSectionKey } from "@/types";

export interface CaseModuleInfo {
  id: CaseModuleId;
  /** 站点展示标题，如 "Module 1 · KYC File Review" */
  title: string;
  /** 中文名，如 "文件审核实务" */
  zh: string;
  /** 本模块重点训练的能力点 */
  focus: string[];
}

/** 一级分类注册表（与 frontmatter 的 module: 1~5 对应） */
export const CASE_MODULES: CaseModuleInfo[] = [
  {
    id: 1,
    title: "Module 1 · KYC File Review",
    zh: "文件审核实务",
    focus: [
      "身份证明是否可接受",
      "地址证明是否可接受",
      "核证是否合格",
      "SOF 是否合格",
      "文件是否过期",
      "文件是否需补充",
    ],
  },
  {
    id: 2,
    title: "Module 2 · Structure Chart Review",
    zh: "架构图审核实务",
    focus: ["UBO 识别", "穿透逻辑", "10% 规则", "25% 规则", "上市公司豁免", "持牌机构豁免"],
  },
  {
    id: 3,
    title: "Module 3 · AML Letter Review",
    zh: "AML Letter 实务",
    focus: ["AML Letter 是否接受", "持牌证明检查", "签署人资格判断", "是否可替代 KYC"],
  },
  {
    id: 4,
    title: "Module 4 · Investor Onboarding",
    zh: "投资者准入实务",
    focus: ["文件收集", "SOF 审阅", "Subscription Review", "Closing 前检查"],
  },
  {
    id: 5,
    title: "Module 5 · Escalation & Compliance",
    zh: "升级与特殊事项",
    focus: ["客户沟通", "Compliance 升级", "红线判断"],
  },
];

export function getCaseModule(id: number): CaseModuleInfo | null {
  return CASE_MODULES.find((m) => m.id === id) ?? null;
}

export interface CaseSectionDef {
  key: CaseSectionKey;
  /** Markdown 文件中的中文小节标题（`# 场景背景`） */
  label: string;
  /** UI 辅助说明 */
  hint: string;
}

/** 正文小节展示顺序与中文标题（V2 模板顺序） */
export const CASE_SECTIONS: CaseSectionDef[] = [
  { key: "scenario", label: "场景背景", hint: "模拟真实邮件与客户资料" },
  { key: "documents_received", label: "已收到资料", hint: "已收到文件清单" },
  { key: "missing_documents", label: "缺失资料", hint: "待补文件清单" },
  { key: "questions", label: "你的判断", hint: "Q1–Q4 先自己判断，再看答案" },
  { key: "standard_answer", label: "标准答案", hint: "按 ICS 内部 SOP 编写" },
  { key: "reasoning", label: "理由分析", hint: "判断逻辑拆解" },
  { key: "common_mistakes", label: "常见错误", hint: "新人最容易犯的错误" },
  { key: "client_email", label: "客户沟通示例", hint: "标准邮件措辞" },
  { key: "sop_reference", label: "ICS SOP依据", hint: "对应知识库章节" },
  { key: "takeaway", label: "Takeaway", hint: "一句话实务经验" },
];

/** 中文标题 → key 的映射（解析 Markdown 用） */
export const SECTION_LABEL_TO_KEY: Record<string, CaseSectionKey> = Object.fromEntries(
  CASE_SECTIONS.map((s) => [s.label, s.key])
);
