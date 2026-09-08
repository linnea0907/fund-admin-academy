/** Fund Admin Academy — 领域类型定义 */

/** 课程自测题（单选） */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  /** 正确答案下标（从 0 开始） */
  answer: number;
  /** 答案解析（答完展示） */
  explanation: string;
}

/** 课程模块（章节） */
export interface LessonModule {
  id: string;
  title: string;
  /** 正文段落 */
  body: string[];
  /** 要点列表（可选） */
  points?: string[];
}

/** 风险提示条目 */
export interface RiskItem {
  title: string;
  detail: string;
}

/** 思维导图节点（树） */
export interface MindMapNode {
  label: string;
  note?: string;
  children?: MindMapNode[];
}

/** 课程内容元数据（数据治理预留字段，V1 UI 不强制展示） */
export interface LessonMeta {
  /** 内容依据，如《境外私募基金募集与运营法律实务指南》(2024-07) + Fund Admin 实务 */
  sourceBasis: string;
  /** 内容版本号，如 "2.0" */
  contentVersion: string;
  /** 最近复核日期（ISO 日期） */
  reviewedAt: string;
  /** 时点性/易变信息清单：法规版本、费用、期限、表格、门槛、牌照类别、申报流程等 */
  timeSensitive: string[];
  /** 实务办理时应核对的官方文件/指引清单 */
  documentsToCheck: string[];
  /** 提示向主管/MLRO/专业顾问升级的情形 */
  escalationTriggers: string[];
}

/** 常见操作错误（Fund Admin 实务手册版） */
export interface CommonMistake {
  title: string;
  detail: string;
}

/** 一讲（一门课） */
export interface Lesson {
  /** 课程编号，如 "01" */
  id: string;
  /** URL slug */
  slug: string;
  title: string;
  subtitle: string;
  /** 学习目标 */
  goal: string[];
  /** 模块内容 */
  modules: LessonModule[];
  /** 风险提示 */
  risks: RiskItem[];
  /** 思维导图（树根） */
  mindmap: MindMapNode;
  /** 课程自测 */
  quiz: QuizQuestion[];
  /** 预计学习时长（分钟） */
  minutes: number;
  /** 实务操作清单（V1.5：Fund Admin 手册化） */
  checklist: string[];
  /** 常见操作错误（V1.5） */
  commonMistakes: CommonMistake[];
  /** 办理时应核对的官方文件/单据清单（V1.5 权威清单；meta 同名项为兼容保留） */
  documentsToCheck: string[];
  /** 提示升级/上报的情形（V1.5 权威清单；meta 同名项为兼容保留） */
  escalationTriggers: string[];
  /** 内容元数据（数据治理） */
  meta: LessonMeta;
}

/** 收藏对象：整课 或 课程内某个模块 */
export type Favorite =
  | { type: "lesson"; lessonId: string }
  | { type: "module"; lessonId: string; moduleId: string };

/** 模块完成 key：`${lessonId}/${moduleId}` */
export type ModuleKey = string;

/** 案例 ID：如 "Case-001" */
export type CaseId = string;

/** 一级分类（Module）编号：1 = KYC File Review … 5 = Escalation & Compliance */
export type CaseModuleId = 1 | 2 | 3 | 4 | 5;

/** 案例文件正文小节 key（与 Markdown 文件 `# 中文标题` 一一对应，V2 模板顺序） */
export type CaseSectionKey =
  | "scenario"
  | "documents_received"
  | "missing_documents"
  | "questions"
  | "standard_answer"
  | "reasoning"
  | "common_mistakes"
  | "client_email"
  | "sop_reference"
  | "takeaway";

/** 案例库中一个案例的完整结构（V2：Fund Admin 实务案例，答案以 ICS 内部 SOP 为准） */
export interface CaseData {
  /** 案例编号，如 "Case-001"（与文件名一致） */
  id: CaseId;
  title: string;
  /** 难度（入门/进阶/高级） */
  level: string;
  /** 一级分类编号 1~5（见 CASE_MODULES 注册表） */
  module: number;
  tags: string[];
  /** 能力标签（P1.8：受控词表见 src/lib/skill-defs.ts，每案例 1~N 个） */
  skills: string[];
  /** 预计学习时长（分钟）；未提供时为 null */
  estimatedTime: number | null;
  /** 各小节 Markdown 正文 */
  sections: Partial<Record<CaseSectionKey, string>>;
}

/** 案例元数据（目录页/列表用；不含正文） */
export interface CaseMeta {
  id: CaseId;
  title: string;
  level: string;
  module: number;
  tags: string[];
  skills: string[];
  estimatedTime: number | null;
  /** 内容是否已导入（标题非空且至少一个正文小节有内容） */
  ready: boolean;
}

/** 本地持久化数据结构（Storage Key: fund-admin-academy-v1） */
export interface StoredState {
  version: 1;
  /** 已标记完成的模块 key 列表（一课的模块全完成 = 该课完成） */
  completedModules: ModuleKey[];
  /** 已标记完成的案例 id 列表（Case Library V2） */
  completedCases: CaseId[];
  /** 已开始学习的案例 id 列表（V1.8：打开过详情即算开始；未完成 = 学习中） */
  startedCases: CaseId[];
  /** 收藏列表 */
  favorites: Favorite[];
  /** 最近学习（按时间倒序，最多保留 5 条） */
  recentlyViewed: { lessonId: string; at: number }[];
  updatedAt: number;
}

/** 导出/导入的 JSON 文件结构 */
export type ExportPayload = {
  app: "fund-admin-academy";
  schemaVersion: 1;
  exportedAt: string;
  data: StoredState;
};
