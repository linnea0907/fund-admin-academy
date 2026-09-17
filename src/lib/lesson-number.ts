import { orderedLessons } from "@/lib/ordering";
import { isElectiveId } from "@/data/lessons";
import { CAMS_MOCK_EXAM_ID } from "@/data/cams/mock-exam";

/* ================================================================
 * 课程展示编号（V1.20.0）—— 全站唯一数据源
 * ================================================================
 *
 * ## 为什么需要一个单独的模块
 *
 * 课程主键 `lesson.id` 是**历史遗留编号**（01 / 02 / 10 / 11 / 12 / 13 / 14 / 15），
 * 它同时充当：进度 key、收藏 key、`data-reading-scope`、笔记 `sourceId`、
 * 术语 `courses` 字段、路由 SSG 参数……**是数据主键，绝不能改**。
 *
 * 但它此前被直接当**展示编号**渲染在全站 10 处。V1.20.0 起把两件事拆开：
 *   - `lesson.id`   = 数据主键（不变，URL/进度/收藏/笔记全部依赖它）
 *   - `displayNumber(lessonId)` = 用户看到的连续编号（01…08）
 *
 * 展示编号**不改数据字段**，而是在运行时由 `orderedLessons` 的下标派生 ——
 * 这样「加一门必修课 → 全站编号自动重排」，不存在第二张手写映射表。
 *
 * ## 顺序契约
 *
 * `orderedLessons`（= lessons + camsLessons，按 id 数字序）即展示顺序：
 *   01 一只境外基金如何运转   → 01
 *   02 基金结构全景          → 02
 *   10 AML 与投资者尽调       → 03
 *   11 AML Foundations      → 04
 *   12 FATCA 与 CRS        → 05
 *   13 AML Technology       → 06
 *   14 Cayman 基金核心框架    → 07
 *   15 BVI 基金与管理人       → 08
 *   16 CAMS Full Mock Exam  → 09（考试入口，非 Lesson）
 *
 * ⚠️ 改动 `orderedLessons` 的顺序 = 全站编号重排，会同时改变**模块标题前缀**
 * 与笔记归档顺序。必要时同步跑 `npm run check:lesson-numbers`（prebuild 常驻）。
 */

/** 必修课程 id → 展示编号（两位，01…08）。选修（E**）不参与，原样返回 */
const MANDATORY_DISPLAY: ReadonlyMap<string, string> = new Map(
  orderedLessons.map((l, i) => [l.id, String(i + 1).padStart(2, "0")])
);

/** 必修课程总数（= 展示编号最大值） */
export const MANDATORY_TOTAL = orderedLessons.length;

/** 必修课展示顺序（供校验脚本与 UI 兜底使用） */
export const MANDATORY_ORDER: readonly string[] = orderedLessons.map((l) => l.id);

/**
 * 课程展示编号。
 * - 必修：`"01"` … `"08"`
 * - 选修（E01…）：原样返回 `"E01"`（选修沿用 E 前缀，本来就是连续编号）
 * - 未知 id（理论上不存在）：原样返回，避免渲染出 `undefined`
 */
export function displayNumber(lessonId: string): string {
  return MANDATORY_DISPLAY.get(lessonId) ?? lessonId;
}

/** 展示编号的数字形式（`"03"` → `3`），供模块前缀等场景使用 */
export function displayNumberRaw(lessonId: string): number {
  return Number(displayNumber(lessonId));
}

/**
 * 课程编号标签：必修 `"第 03 讲"`，选修 `"E01 · 选修"`。
 * 语义与旧 `data/lessons.ts` 的 `lessonLabel()` **完全一致**（仅编号取展示值），
 * 供 metadata / 列表等文本场景使用。
 */
export function displayLabel(lesson: { id: string }): string {
  return isElectiveId(lesson.id)
    ? `${lesson.id} · 选修`
    : `第 ${displayNumber(lesson.id)} 讲`;
}

/**
 * 徽标内的小编号：必修 `"第 03 讲"`，选修 `"E01"`（不带「选修」前缀）。
 * 用于收藏夹分区标题等「原文只显示编号」的位置。
 */
export function displayTag(lessonId: string): string {
  return isElectiveId(lessonId)
    ? `选修 ${lessonId}`
    : `第 ${displayNumber(lessonId)} 讲`;
}

/**
 * 纯编号徽标：必修 `"第 03 讲"`，选修原样 `"E01"`。
 * 与旧代码 `isElective ? id : \`第 ${id} 讲\`` 逐字一致，仅编号取展示值。
 */
export function displayBadge(lessonId: string): string {
  return isElectiveId(lessonId)
    ? lessonId
    : `第 ${displayNumber(lessonId)} 讲`;
}

/**
 * 带编号的课程标题（笔记 sourceTitle / 搜索结果副标 / 笔记编辑器下拉）。
 * 选修沿用 `E01 专题名`。
 */
export function displayTitle(lesson: { id: string; title: string }): string {
  return isElectiveId(lesson.id)
    ? `${lesson.id} ${lesson.title}`
    : `${displayNumber(lesson.id)} ${lesson.title}`;
}

/**
 * 从「存储的 sourceTitle」解析出当前展示标题。
 *
 * 笔记 `sourceTitle` 是**存进 localStorage 的数据**，历史笔记里写的是旧编号
 * （如 `"14 Cayman 基金核心框架"`）。V1.20.0 不做数据迁移，改为**显示时按
 * sourceId 回查课程表**重新生成编号 —— 旧笔记因此自动显示新编号。
 * 回查不到（孤儿笔记 / 案例笔记）时退回存储值。
 */
export function resolveStoredTitle(
  sourceId: string,
  lookup: (id: string) => { id: string; title: string } | undefined,
  fallback: string
): string {
  if (isElectiveId(sourceId)) return fallback;
  const hit = lookup(sourceId);
  return hit ? displayTitle(hit) : fallback;
}

/**
 * 模块标题前缀：`modulePrefix("14", 0)` → `"7.1"`。
 * 与数据层模块标题里写死的 `"7.1 …"` 必须一致（校验脚本会比对前缀）。
 */
export function modulePrefix(lessonId: string, moduleIndex: number): string {
  return `${displayNumberRaw(lessonId)}.${moduleIndex + 1}`;
}

/* ================================================================
 * 模拟考试（第 09 讲）
 * ================================================================ */

/**
 * CAMS 全真模拟的展示编号。
 * 定义在 `data/cams/mock-exam.ts`（单一来源），此处仅做重导出，
 * 避免两处各写一个 "09"。校验脚本会断言它 === MANDATORY_TOTAL + 1。
 */
export const MOCK_EXAM_NUMBER = CAMS_MOCK_EXAM_ID;

/** 学习路径文案用的箭头串：`"01 → 02 → … → 08 → 09"` */
export function learningPathText(): string {
  const nums = [
    ...orderedLessons.map((l) => displayNumber(l.id)),
    MOCK_EXAM_NUMBER,
  ];
  return nums.join(" → ");
}
