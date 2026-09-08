import { lessons } from "@/data/lessons";
import type { Lesson } from "@/types";

/**
 * 按课程 id 数字序返回课程列表。
 * V2 编号体系为 01/02/10/12/14/15（非连续），学习路线、课程中心、
 * 详情页上/下讲导航统一使用本序列，保证与编号顺序一致。
 */
export const orderedLessons: Lesson[] = [...lessons].sort((a, b) =>
  a.id.localeCompare(b.id, undefined, { numeric: true })
);

/** 课程在有序序列中的下标（用于上一讲/下一讲） */
export function orderedIndex(lessonId: string): number {
  return orderedLessons.findIndex((l) => l.id === lessonId);
}
