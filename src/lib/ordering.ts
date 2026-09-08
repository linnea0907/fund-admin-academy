import { lessons, electiveLessons, isElectiveId } from "@/data/lessons";
import type { Lesson } from "@/types";

/**
 * 必修课序列：按课程 id 数字序（V2 编号体系 01/02/10/12/14/15）。
 * 学习路线、必修导航统一使用本序列。
 */
export const orderedLessons: Lesson[] = [...lessons].sort((a, b) =>
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
