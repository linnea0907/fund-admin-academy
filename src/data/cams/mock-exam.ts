import type { CamsDomain } from "@/types/cams";
import { CAMS_EXAM } from "@/types/cams";

/**
 * 第 16 讲 · CAMS Full Mock Exam —— 学习路径末端的考试入口。
 *
 * ## 为什么它不是一个 Lesson
 * 它没有内容模块（m1-mN）、没有自测题、没有风险/清单等课程字段，本质是
 * **一个入口**而非一门课。若塞进 Lesson 数据层，会让 `totalProgress` 的
 * 分母多出一门永远无法「完成」的课程（首页会永远显示 N/9 门完成），
 * 并需要在 progress / CourseCard / LessonViewer / settings / search /
 * favorites / [slug] 静态生成等 7 处加特例分支。
 *
 * 因此这里的做法是：**独立数据 + 独立卡片组件**，视觉上与课程卡片同构，
 * 编号 16 排在课程中心「必修课程」网格末尾与首页「学习路线」末尾，
 * 点击直接进入既有 `/cams-exam`（不新建第二套考试系统）。
 */

/** 课程中心/学习路线中的展示编号（接在必修 01…15 之后） */
export const CAMS_MOCK_EXAM_ID = "16";

/** 卡片点击目标：既有模拟考试页面 */
export const CAMS_MOCK_EXAM_HREF = "/cams-exam";

export interface MockExamEntry {
  /** 编号（"16"） */
  id: string;
  /** 点击目标路由 */
  href: string;
  /** 英文标题（照官方材料用语） */
  title: string;
  /** 中文副题（自撰，非官方译文） */
  subtitle: string;
  /** 覆盖的 Domain：全真模拟四域全覆盖 */
  cams: CamsDomain[];
  /** 卡片规格行（题量 / 时长 / 评分 / 及格线） */
  highlights: string[];
}

export const camsMockExam: MockExamEntry = {
  id: CAMS_MOCK_EXAM_ID,
  href: CAMS_MOCK_EXAM_HREF,
  title: "CAMS Full Mock Exam",
  subtitle: "按官方蓝图 Domain A→B→C→D 组卷 · 全真计时 · 自动评分与错题回顾",
  cams: ["A", "B", "C", "D"],
  highlights: [
    `${CAMS_EXAM.questionCount} Questions`,
    "3.5 Hours",
    "Auto Scoring",
    `Pass Mark ${CAMS_EXAM.passPercent}`,
  ],
};
