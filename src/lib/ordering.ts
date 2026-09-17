import { lessons, electiveLessons, camsLessons, isElectiveId } from "@/data/lessons";
import type { Lesson } from "@/types";

/**
 * 必修课序列：按课程 id 数字序 —— 01 / 02 / 10 / 11 / 12 / 13 / 14 / 15。
 *
 * ⚠️ **本数组的顺序是全站展示编号的唯一来源**：`lib/lesson-number.ts` 的
 * `displayNumber()` 取的就是这里 (index + 1)。
 *   - `id` = 数据主键（历史编号 10/11/12/13/14/15），URL/进度/收藏/笔记依赖它，**不可改**；
 *   - 展示编号 = V1.20.0 起的连续编号 01–08，由本序列下标派生。
 * 因此**调整本数组顺序 = 全站编号重排 + 模块标题前缀失配**，改动后必须跑
 * `npm run check:lesson-numbers`（prebuild 常驻，会比对模块标题前缀）。
 *
 * V1.16.0：新增 id 11/13（CAMS 补强课，见 camsLessons）并入必修序列，
 * 学习路线、必修导航统一使用本序列。
 */
export const orderedLessons: Lesson[] = [...lessons, ...camsLessons].sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true })
);

/** 选修课序列（E01..E11，数据顺序即 id 顺序） */
export const electiveLessonsOrdered: Lesson[] = [...electiveLessons];

/** 全部课程（必修在前 + 选修在后），搜索等全量场景使用 */
export const orderedAllLessons: Lesson[] = [...orderedLessons, ...electiveLessons];

/** 课程在必修序列中的下标（详情页旧接口保留） */
export function orderedIndex(lessonId: string): number {
  return orderedLessons.findIndex((l) => l.id === lessonId);
}

/** 按课程所属序列给出上/下一讲（选修课在选修序列内导航，必修在必修序列内） */
export function lessonNeighbors(lesson: Lesson): {
  prev: Lesson | null;
  next: Lesson | null;
} {
  if (isElectiveId(lesson.id)) {
    const i = electiveLessonsOrdered.findIndex((l) => l.id === lesson.id);
    return {
      prev: i > 0 ? electiveLessonsOrdered[i - 1] : null,
      next:
        i >= 0 && i < electiveLessonsOrdered.length - 1
          ? electiveLessonsOrdered[i + 1]
          : null,
    };
  }
  const i = orderedLessons.findIndex((l) => l.id === lesson.id);
  return {
    prev: i > 0 ? orderedLessons[i - 1] : null,
    next: i >= 0 && i < orderedLessons.length - 1 ? orderedLessons[i + 1] : null,
  };
}
