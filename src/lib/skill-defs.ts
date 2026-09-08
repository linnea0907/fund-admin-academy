/**
 * Case Library — Skills 能力标签体系（纯前端数据定义，可安全用于 client 组件）
 *
 * Skills 独立于 Module：Module 是「案例的一级分类」，Skill 是「案例训练的能力点」。
 * 一个案例可挂多个 Skill；一个 Skill 可出现在多个 Module 的案例中。
 *
 * 受控词表 = 下方 20 项（id 必须与案例 frontmatter 中 skills: 列表一致）。
 *
 * ── 技能成长地图（预留）─────────────────────────────────────────────
 * 后续可在 localStorage 记录 per-skill 熟练度（0–100），结构建议：
 *   interface SkillProgress { [skillId: string]: { score: number; lastPracticedAt: string } }
 *   StoredState 增加 skillProgress 字段，按 SkillDef.group 聚合生成成长雷达图；
 * 本阶段仅落地「注册表 + 案例打标 + 统计展示」，成长地图 UI 待后续迭代。
 */
import type { CaseId } from "@/types";

/** 技能分组（成长地图聚合维度，预留） */
export type SkillGroup =
  | "identity-docs" // 身份/住址/核证/SOF 文件类
  | "structure" // 架构与实益分析
  | "aml-letter" // AML Letter 审核
  | "onboarding" // 投资者准入
  | "compliance" // 升级/合规/风险
  | "core"; // 通用执业能力

export interface SkillDef {
  /** 技能 id（与案例 frontmatter skills: 一致；同时作为站点展示名） */
  id: string;
  /** 中文说明（Skills 页展示） */
  description: string;
  /** 分组 */
  group: SkillGroup;
  /** 成长阶段（预留：foundation → practitioner → advanced） */
  tier: "foundation" | "practitioner" | "advanced";
}

/** 技能组显示信息 */
export const SKILL_GROUPS: Record<SkillGroup, { label: string; hint: string }> = {
  "identity-docs": { label: "KYC 文件类", hint: "身份 / 住址 / 核证 / SOF" },
  structure: { label: "架构与实益分析", hint: "UBO / 穿透 / Trust" },
  "aml-letter": { label: "AML Letter", hint: "第三方文件审核" },
  onboarding: { label: "投资者准入", hint: "认购到 Closing" },
  compliance: { label: "升级与合规", hint: "红线判断 / 上报" },
  core: { label: "通用执业能力", hint: "跨模块基础功" },
};

/** 受控技能词表（20 项；顺序即 Skills 页展示顺序） */
export const SKILL_DEFS: SkillDef[] = [
  {
    id: "KYC Review",
    description: "审核投资人 KYC 文件是否完整、合格，符合基金属地与 ICS 内部 SOP 要求。",
    group: "identity-docs",
    tier: "foundation",
  },
  {
    id: "Address Proof Review",
    description: "判断住址证明的形式、时效与核证是否可接受，识别不可替代的证明类别。",
    group: "identity-docs",
    tier: "foundation",
  },
  {
    id: "Identity Verification",
    description: "判断身份证明类型是否合格：有效期、国籍与签名要素是否满足属地要求。",
    group: "identity-docs",
    tier: "foundation",
  },
  {
    id: "Certification Review",
    description: "核证合格性检查：核证语句、一年内核证、核证人资质与联系方式。",
    group: "identity-docs",
    tier: "foundation",
  },
  {
    id: "SOF Review",
    description: "审阅资金来源（SOF）合理性、金额匹配与支持性材料是否充分。",
    group: "identity-docs",
    tier: "foundation",
  },
  {
    id: "Structure Chart Review",
    description: "审核投资人架构图与穿透链条的完整性、层级与逻辑一致性。",
    group: "structure",
    tier: "foundation",
  },
  {
    id: "UBO Identification",
    description: "识别最终受益人（UBO），应用 10%/25% 门槛与控制权判定。",
    group: "structure",
    tier: "practitioner",
  },
  {
    id: "Beneficial Ownership Analysis",
    description: "穿透多层 SPV / Trust，分析实益拥有链条与豁免情形（上市公司/持牌机构）。",
    group: "structure",
    tier: "practitioner",
  },
  {
    id: "AML Letter Review",
    description: "审核第三方 / 管理人 AML Letter 的出具方资格、效力、签署人与时效。",
    group: "aml-letter",
    tier: "foundation",
  },
  {
    id: "Investor Onboarding",
    description: "端到端投资者准入：文件收集、资料审阅、Subscription 与 Closing 前就绪检查。",
    group: "onboarding",
    tier: "foundation",
  },
  {
    id: "Trust Review",
    description: "审核信托架构的 KYC 责任对象：委托人、受托人、受益人、保护人。",
    group: "structure",
    tier: "advanced",
  },
  {
    id: "Fund Structure Analysis",
    description: "分析基金 / 投资载体的组织形式、监管状态与豁免适用（持牌机构 / 上市公司）。",
    group: "structure",
    tier: "practitioner",
  },
  {
    id: "PEP Screening",
    description: "识别政治公众人物（PEP）及其家人 / 密切关系人，触发强化尽调。",
    group: "compliance",
    tier: "practitioner",
  },
  {
    id: "Adverse Media Review",
    description: "处理负面新闻命中：区分命中类型、核实关联、评估影响并正确升级。",
    group: "compliance",
    tier: "practitioner",
  },
  {
    id: "Risk Assessment",
    description: "综合风险评级：客户属地、客户类型、交易结构与制裁名单交叉判断。",
    group: "compliance",
    tier: "practitioner",
  },
  {
    id: "Compliance Escalation",
    description: "判断何时升级主管 / Compliance，按正确路径上报并留痕。",
    group: "compliance",
    tier: "practitioner",
  },
  {
    id: "Client Communication",
    description: "专业书面沟通：补件邮件、规则解释、预期管理，守住标准不因催办放松。",
    group: "core",
    tier: "foundation",
  },
  {
    id: "Closing Readiness Check",
    description: "交割前就绪检查：文件、资金、KYC 三者齐备方可确认份额。",
    group: "onboarding",
    tier: "foundation",
  },
  {
    id: "Regulatory Analysis",
    description: "把属地监管要求（SOP / Guidance / 规则）应用于具体场景并给出判断。",
    group: "core",
    tier: "practitioner",
  },
  {
    id: "Problem Solving",
    description: "处理不完整 / 矛盾信息：识别缺口、权衡选项、给出下一步最优解。",
    group: "core",
    tier: "foundation",
  },
];

/** 技能 id → 定义（未知技能返回 null，仍可在案例中展示但不入统计词典） */
export function getSkillDef(id: string): SkillDef | null {
  return SKILL_DEFS.find((s) => s.id === id) ?? null;
}

export function getSkillGroup(id: string): SkillGroup | null {
  return getSkillDef(id)?.group ?? null;
}

/** 技能分组顺序（Skills 页分区展示用） */
export const SKILL_GROUP_ORDER: SkillGroup[] = [
  "identity-docs",
  "structure",
  "aml-letter",
  "onboarding",
  "compliance",
  "core",
];

/**
 * 技能成长地图的聚合输入（预留；供后续 /skills 页或 Dashboard 直接消费）
 */
export interface SkillStat {
  def: SkillDef;
  /** 挂载该技能的案例 id 列表（含未导入正文的骨架案例） */
  caseIds: CaseId[];
  /** 挂载案例中内容已就绪（可学习）的数量 */
  readyCount: number;
  /** 已标记完成的案例数量（由客户端结合 completedCases 计算） */
  doneCount: number;
  /** 完成率 = doneCount / readyCount（readyCount 为 0 时为 null） */
  rate: number | null;
}
