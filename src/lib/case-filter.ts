/**
 * Case Library — 筛选模型（V1.8 筛选区重构）
 *
 * 三级筛选结构：
 *   L1 业务模块（主筛选，默认只显示这一层）
 *   L2 具体技能（选中一级后动态展开）
 *   L3 标签（默认折叠进「高级筛选」）
 * 另附：难度归一（基础/进阶/高级）与状态口径（待学习/学习中/已完成）。
 *
 * 纯前端数据定义（无 fs/process 依赖），client/server 均可安全 import。
 */

/* ================================================================
 * L1 · 业务模块注册表（7 类 + 全部）
 * 域成员判定：案例命中该域技能清单任一项即属该域；
 * 技能命中 = frontmatter skills 含该项，或（非受控词表的域技能如
 * Subscription Review）tags 含该项。
 * ================================================================ */

export type CaseDomainId =
  | "kyc-cdd"
  | "aml"
  | "fund-structure"
  | "fund-documents"
  | "investor-onboarding"
  | "compliance"
  | "client-communication";

export interface CaseDomainDef {
  id: CaseDomainId;
  /** 英文展示名 */
  label: string;
  /** 中文说明（chip tooltip） */
  zh: string;
  /** 本域二级技能清单（L2 chips 展示顺序） */
  skills: string[];
}

export const CASE_DOMAINS: CaseDomainDef[] = [
  {
    id: "kyc-cdd",
    label: "KYC/CDD",
    zh: "身份/文件审核与客户尽调",
    skills: [
      "Identity Verification",
      "Address Proof Review",
      "Certification Review",
      "UBO Identification",
      "SOF Review",
    ],
  },
  {
    id: "aml",
    label: "AML",
    zh: "反洗钱：AML Letter / 筛查 / 风险",
    skills: ["PEP Screening", "Adverse Media Review", "AML Letter Review", "Risk Assessment"],
  },
  {
    id: "fund-structure",
    label: "Fund Structure",
    zh: "基金架构与实益链条",
    skills: ["Structure Chart Review", "Beneficial Ownership Analysis", "Fund Structure Analysis"],
  },
  {
    id: "fund-documents",
    label: "Fund Documents",
    zh: "认购与交割文件",
    skills: ["Subscription Review", "Certification Review", "Closing Readiness Check"],
  },
  {
    id: "investor-onboarding",
    label: "Investor Onboarding",
    zh: "投资者准入全流程",
    skills: ["Investor Onboarding", "KYC Review"],
  },
  {
    id: "compliance",
    label: "Compliance",
    zh: "合规升级与规则适用",
    skills: ["Compliance Escalation", "Regulatory Analysis"],
  },
  {
    id: "client-communication",
    label: "Client Communication",
    zh: "客户沟通与问题处理",
    skills: ["Client Communication", "Problem Solving"],
  },
];

/** 域 id → 定义 */
export function getCaseDomain(id: string | null): CaseDomainDef | null {
  if (!id) return null;
  return CASE_DOMAINS.find((d) => d.id === id) ?? null;
}

/** 某技能（或标签）属于哪个域（按注册顺序取第一个） */
export function domainOfAbility(ability: string): CaseDomainDef | null {
  return CASE_DOMAINS.find((d) => d.skills.includes(ability)) ?? null;
}

/** 案例是否命中某一「能力项」：skills 或 tags 含该项 */
export function caseHitsAbility(
  c: { skills: string[]; tags: string[] },
  ability: string
): boolean {
  return c.skills.includes(ability) || c.tags.includes(ability);
}

/** 案例是否属于某业务域（命中该域任一能力项） */
export function caseInDomain(c: { skills: string[]; tags: string[] }, domain: CaseDomainDef): boolean {
  return domain.skills.some((s) => caseHitsAbility(c, s));
}

/* ================================================================
 * 难度归一：入门 / L1 / 基础 → 基础；进阶 / L2 → 进阶；高级 → 高级
 * 数据层仍保留原始难度值，仅在展示与筛选处统一映射。
 * ================================================================ */

export type LevelKey = "basic" | "intermediate" | "advanced";

export const LEVEL_OPTIONS: { key: LevelKey | null; label: string }[] = [
  { key: null, label: "全部" },
  { key: "basic", label: "基础" },
  { key: "intermediate", label: "进阶" },
  { key: "advanced", label: "高级" },
];

/** 原始难度值（frontmatter level）→ 归一档位；无法识别返回 null */
export function levelBucket(raw: string | null | undefined): LevelKey | null {
  const v = (raw ?? "").trim();
  if (!v) return null;
  const upper = v.toUpperCase();
  if (v === "入门" || upper === "L1" || v === "基础") return "basic";
  if (v === "进阶" || upper === "L2") return "intermediate";
  if (v === "高级") return "advanced";
  return null;
}

export const LEVEL_KEY_LABEL: Record<LevelKey, string> = {
  basic: "基础",
  intermediate: "进阶",
  advanced: "高级",
};

/** 展示用归一难度名：识别不出时回退原始值；空串返回 null */
export function levelLabel(raw: string | null | undefined): string | null {
  const bucket = levelBucket(raw);
  if (bucket) return LEVEL_KEY_LABEL[bucket];
  const v = (raw ?? "").trim();
  return v || null;
}

/* ================================================================
 * 状态口径：全部 / 待学习 / 学习中 / 已完成
 *   - 待学习：正文已导入（ready）且未开始未完成
 *   - 学习中：已开始（打开过详情）但未完成
 *   - 已完成：标记完成
 *   - 骨架案例（ready=false）不参与状态统计（仍以「待导入」卡片展示）
 * ================================================================ */

export type CaseStatusKey = "all" | "todo" | "learning" | "done";

export const STATUS_OPTIONS: { key: CaseStatusKey; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "todo", label: "待学习" },
  { key: "learning", label: "学习中" },
  { key: "done", label: "已完成" },
];

export type CaseLearnStatus = "todo" | "learning" | "done" | null;

/** 计算单个案例的学习状态（ready=false → null，即不参与状态筛选） */
export function caseLearnStatus(
  c: { ready: boolean },
  started: boolean,
  done: boolean
): CaseLearnStatus {
  if (!c.ready) return null;
  if (done) return "done";
  if (started) return "learning";
  return "todo";
}

export const STATUS_KEY_LABEL: Record<Exclude<CaseStatusKey, "all">, string> = {
  todo: "待学习",
  learning: "学习中",
  done: "已完成",
};
