import type { Favorite, StoredState } from "@/types";

/** 全局持久化 Key（产品约定，勿改） */
export const STORAGE_KEY = "fund-admin-academy-v1";

export const MAX_RECENT = 5;

export function defaultState(): StoredState {
  return {
    version: 1,
    completedModules: [],
    completedCases: [],
    startedCases: [],
    favorites: [],
    recentlyViewed: [],
    updatedAt: Date.now(),
  };
}

/** 从 localStorage 安全读取（含旧版本/脏数据容错） */
export function loadState(): StoredState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    return normalize(parsed);
  } catch {
    return defaultState();
  }
}

/** 结构校验与清洗，防止脏数据破坏 UI */
export function normalize(input: Partial<StoredState> | null | undefined): StoredState {
  const base = defaultState();
  if (!input || typeof input !== "object") return base;
  // 兼容早期字段 completedLessons -> 空（未发布，无需迁移）
  return {
    version: 1,
    completedModules: Array.isArray(input.completedModules)
      ? input.completedModules.filter((x): x is string => typeof x === "string")
      : [],
    completedCases: Array.isArray(input.completedCases)
      ? input.completedCases.filter((x): x is string => typeof x === "string")
      : [],
    startedCases: Array.isArray(input.startedCases)
      ? input.startedCases.filter((x): x is string => typeof x === "string")
      : [],
    favorites: Array.isArray(input.favorites)
      ? input.favorites.filter(isValidFavorite)
      : [],
    recentlyViewed: Array.isArray(input.recentlyViewed)
      ? input.recentlyViewed
          .filter(
            (r): r is { lessonId: string; at: number } =>
              !!r &&
              typeof r.lessonId === "string" &&
              typeof r.at === "number"
          )
          .slice(0, MAX_RECENT)
      : [],
    updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : Date.now(),
  };
}

function isValidFavorite(f: unknown): f is Favorite {
  if (!f || typeof f !== "object") return false;
  const fav = f as Favorite;
  if (fav.type === "lesson") return typeof fav.lessonId === "string";
  if (fav.type === "module") {
    return typeof fav.lessonId === "string" && typeof fav.moduleId === "string";
  }
  return false;
}

export function saveState(state: StoredState): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...state, updatedAt: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (err) {
    // 存储被禁用/超出配额时静默降级，不影响使用
    console.error("[fund-admin-academy] save failed:", err);
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

/* ---------- 派生查询 ---------- */

export function favoriteKey(fav: Favorite): string {
  return fav.type === "lesson"
    ? `lesson:${fav.lessonId}`
    : `module:${fav.lessonId}:${fav.moduleId}`;
}

export function hasFavorite(favorites: Favorite[], fav: Favorite): boolean {
  return favorites.some((f) => favoriteKey(f) === favoriteKey(fav));
}

export function lessonModuleFavoriteCount(
  favorites: Favorite[],
  lessonId: string
): number {
  return favorites.filter((f) => f.lessonId === lessonId).length;
}
