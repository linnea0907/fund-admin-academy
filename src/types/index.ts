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
  /** 内容元数据（数据治理） */
  meta: LessonMeta;
}

/** 收藏对象：整课 或 课程内某个模块 */
export type Favorite =
  | { type: "lesson"; lessonId: string }
  | { type: "module"; lessonId: string; moduleId: string };

/** 模块完成 key：`${lessonId}/${moduleId}` */
export type ModuleKey = string;

/** 本地持久化数据结构（Storage Key: fund-admin-academy-v1） */
export interface StoredState {
  version: 1;
  /** 已标记完成的模块 key 列表（一课的模块全完成 = 该课完成） */
  completedModules: ModuleKey[];
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
