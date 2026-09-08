import { lessons, totalLessons } from "@/data/lessons";
import type { Lesson, StoredState } from "@/types";

/** 模块完成 key：lessonId/moduleId */
export function moduleKey(lessonId: string, moduleId: string): string {
  return `${lessonId}/${moduleId}`;
}

export function lessonModuleKeys(lesson: Lesson): string[] {
  return lesson.modules.map((m) => moduleKey(lesson.id, m.id));
}

/** 单课完成模块数 */
export function lessonDoneCount(state: StoredState, lesson: Lesson): number {
  const keys = new Set(lessonModuleKeys(lesson));
  return state.completedModules.filter((k) => keys.has(k)).length;
}

/** 单课进度 0-100 */
export function lessonPercent(state: StoredState, lesson: Lesson): number {
  const total = lesson.modules.length;
  if (total === 0) return 0;
  return Math.round((lessonDoneCount(state, lesson) / total) * 100);
}

/** 单课是否完成（全部模块完成） */
export function isLessonComplete(state: StoredState, lesson: Lesson): boolean {
  return lessonDoneCount(state, lesson) === lesson.modules.length && lesson.modules.length > 0;
}

export interface LessonProgressSummary {
  done: number;
  total: number;
  percent: number;
  completedLessons: number;
  totalLessons: number;
}

/** 全课程总进度 */
export function totalProgress(state: StoredState): LessonProgressSummary {
  let done = 0;
  let total = 0;
  let completedLessons = 0;
  for (const lesson of lessons) {
    total += lesson.modules.length;
    done += lessonDoneCount(state, lesson);
    if (isLessonComplete(state, lesson)) completedLessons += 1;
  }
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    completedLessons,
    totalLessons,
  };
}

/** 收藏数 */
export function favoriteCount(state: StoredState): number {
  return state.favorites.length;
}
