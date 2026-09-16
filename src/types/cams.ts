/**
 * CAMS（Certified Anti-Money Laundering Specialist）认证支持层 —— 类型与官方口径元数据
 *
 * ## 权威来源
 * ACAMS《Candidate Handbook for the Certified Anti-Money Laundering Specialist Examination》
 * （官方考场手册）。四个 Domain 的名称、权重与 test objectives 全部照手册原文整理。
 *
 * ## 定位（V1.16.0「轻量接入」边界）
 * 本文件只承载**认证支持能力**，不是第二套知识体系：
 * - 课程可标注所属 CAMS Domain（`Lesson.cams`），用于卡片/详情页展示与课程筛选；
 * - 提供一套按官方权重组卷的模拟考试题库与配置。
 * 明确不做的（见 docs/BACKLOG.md）：CAMS 独立专区、案例 CAMS 标签、每日练习、
 * 50 题小测、覆盖率仪表盘、第二套导航。
 *
 * ## 时效性约束
 * 手册中的费用、报名/改期政策、资格学分等属时点性信息，**不纳入本站内容**
 * （与全站「不收录时效性内容」原则一致）。此处只保留考试结构类事实：
 * 题量、时长、权重、及格线。
 */

/** 四个 Domain 的代号（与手册 A/B/C/D 一致） */
export type CamsDomain = "A" | "B" | "C" | "D";

export interface CamsDomainMeta {
  id: CamsDomain;
  /** 官方英文全称（照手册原文，便于对照官方材料） */
  title: string;
  /** 中文说明（本学习中心自撰，非官方译文） */
  titleZh: string;
  /** 官方权重（百分点） */
  weight: number;
  /** 按权重折算的题量（120 题口径） */
  questionCount: number;
  /** 手册列出的 test objective 条目数（用于「覆盖范围」提示） */
  objectiveCount: number;
  /** 标签配色（Tailwind 类名，浅底深字） */
  tint: string;
  /** 圆点/进度条主色 */
  accent: string;
}

/**
 * 官方考试蓝图（Examination Blueprint）。
 *
 * 权重照手册：A 30% / B 20% / C 30% / D 20%。
 * 题量 = 120 × 权重，四域相加恰为 120（36 + 24 + 36 + 24）。
 */
export const CAMS_DOMAINS: CamsDomainMeta[] = [
  {
    id: "A",
    title: "Understanding the Risks and Methods of Financial Crime",
    titleZh: "金融犯罪的风险与方法",
    weight: 30,
    questionCount: 36,
    objectiveCount: 17,
    tint: "bg-rose-50 text-rose-700 ring-rose-200",
    accent: "bg-rose-500",
  },
  {
    id: "B",
    title: "Global AFC Frameworks, Governance, and Regulations",
    titleZh: "全球反金融犯罪框架、治理与监管",
    weight: 20,
    questionCount: 24,
    objectiveCount: 13,
    tint: "bg-blue-50 text-blue-700 ring-blue-200",
    accent: "bg-blue-500",
  },
  {
    id: "C",
    title: "Building an Anti-Financial Crime Compliance Program",
    titleZh: "反金融犯罪合规体系建设",
    weight: 30,
    questionCount: 36,
    objectiveCount: 26,
    tint: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    accent: "bg-emerald-500",
  },
  {
    id: "D",
    title: "Tools and Technologies to Fight Financial Crime",
    titleZh: "反金融犯罪工具与技术",
    weight: 20,
    questionCount: 24,
    objectiveCount: 17,
    tint: "bg-amber-50 text-amber-700 ring-amber-200",
    accent: "bg-amber-500",
  },
];

export const CAMS_DOMAIN_MAP: Record<CamsDomain, CamsDomainMeta> = Object.fromEntries(
  CAMS_DOMAINS.map((d) => [d.id, d])
) as Record<CamsDomain, CamsDomainMeta>;

/** 取域元数据（课程标签渲染用；传入 undefined 返回 undefined） */
export function camsDomainMeta(id: CamsDomain | undefined): CamsDomainMeta | undefined {
  return id ? CAMS_DOMAIN_MAP[id] : undefined;
}

/** 考试结构（照手册：120 题多选题 / 3.5 小时 / 及格线 75） */
export const CAMS_EXAM = {
  /** 题量 */
  questionCount: 120,
  /** 时长（分钟）：3.5 小时 */
  durationMinutes: 210,
  /**
   * 及格线 75。
   * 手册表述为「passing score ... is 75」——ACAMS 官方采用量表分（scaled score），
   * 本站按百分制（答对率 × 100）换算作参考，判定口径在考试页明确标注。
   */
  passPercent: 75,
} as const;

/** 模拟考试题目（单选） */
export interface CamsQuestion {
  /** 题号，形如 "A01"（域代号 + 域内序号），全局唯一 */
  id: string;
  /** 所属 Domain */
  domain: CamsDomain;
  /** 题干 */
  question: string;
  /** 选项（4 项，A-D） */
  options: string[];
  /** 正确答案下标（从 0 开始） */
  answer: number;
  /** 答案解析 */
  explanation: string;
}
