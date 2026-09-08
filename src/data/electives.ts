import type { Lesson } from "@/types";
import { electivesA } from "./electives-a";
import { electivesB } from "./electives-b";
import { electivesC } from "./electives-c";

/**
 * 选修课程合集（E01-E11）。
 * 保留必修 6 门（lessons.ts）不变；选修课独立编号 E01..E11，
 * module key 为 `${id}/${moduleId}`（如 "E01/m1"），与必修 key 无冲突。
 * 进度/收藏逻辑复用现有 use-academy（不做任何结构性改动）。
 */
export const electiveLessons: Lesson[] = [
  ...electivesA,
  ...electivesB,
  ...electivesC,
];
