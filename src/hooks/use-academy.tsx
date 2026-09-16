"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ExportPayload, Favorite, StoredState } from "@/types";
import {
  clearState,
  defaultState,
  favoriteKey,
  loadState,
  normalize,
  saveState,
} from "@/lib/storage";

interface AcademyContextValue {
  state: StoredState;
  /** 标记/取消单个模块完成（key = `${lessonId}/${moduleId}`） */
  toggleModuleComplete: (key: string) => void;
  /** 整课一键标记完成 / 取消完成（作用于该课全部模块） */
  setLessonCompletion: (moduleKeys: string[], complete: boolean) => void;
  /** 标记/取消单个案例完成（Case Library V2，caseId = "Case-001"） */
  toggleCaseComplete: (caseId: string) => void;
  /** V1.12.1 一键完成学习：单向往完成标记（幂等），并记录 completedAt */
  completeCase: (caseId: string) => void;
  /** 标记案例已开始学习（打开详情即调用；V1.8 状态口径：学习中 = started && !completed） */
  markCaseStarted: (caseId: string) => void;
  /** 收藏 / 取消收藏（课程/模块/案例/术语） */
  toggleFavorite: (fav: Favorite) => void;
  /** 记录一次课程访问（用于"最近学习"） */
  recordView: (lessonId: string) => void;
  /** 重置学习进度（保留收藏与最近记录） */
  resetProgress: () => void;
  /** 清空全部收藏 */
  resetFavorites: () => void;
  /** 重置全部数据（进度 + 收藏 + 最近记录） */
  resetAll: () => void;
  /** 用外部数据整体覆盖（导入用，返回是否成功） */
  importData: (payload: unknown) => boolean;
  /** 生成导出载荷 */
  buildExport: () => ExportPayload;
}

const AcademyContext = createContext<AcademyContextValue | null>(null);

/**
 * 服务端渲染时退化为 useEffect（避免 "useLayoutEffect does nothing on the server" 警告）。
 * 与 `use-ui-pref.ts` 采用同一手法。
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * 学习数据 Provider（V1.15.4 修复首页 Hydration Mismatch，React #418）
 *
 * 旧实现 `useState(() => loadState())` 在**首次渲染**就读取 localStorage：
 *   - 服务端首帧：默认空态 → SSG 出的静态 HTML 是空态
 *   - 客户端首帧：localStorage 有数据 → DOM 与 SSG HTML 不一致
 *   → React 放弃 hydration（Error #418），改为整树客户端重渲染。
 *
 * 新实现三段式（与需求 Step 1 / Step 2 一致）：
 *   1) 首帧恒为 `defaultState()`，服务端与客户端首帧完全一致；
 *   2) 挂载后（布局副作用，浏览器绘制前）从 localStorage 恢复一次；
 *   3) `isLoaded` 写保护 —— 恢复完成前**禁止回写**，避免用空状态覆盖用户数据。
 *
 * 额外处理「恢复时机 vs 子组件挂载写入」的竞态（本期实测存在的问题）：
 *   `LessonViewer` / `CaseViewer` 在**挂载副作用**里调用 recordView / markCaseStarted，
 *   而 React 的副作用是「子先父后」执行 —— 若恢复时直接 `setState(loadState())`，
 *   会把刚记录的浏览/学习状态整体覆盖掉（表现为「最近学习」不再更新）。
 *   因此 Provider 的写入统一走 `update()`：恢复完成前先入队，恢复时以 **localStorage 为基线**
 *   顺序重放，既保数据、也不丢刚发生的操作。
 */
export function AcademyProvider({ children }: { children: ReactNode }) {
  // Step 1：首帧统一默认状态（不在 useState 初始化时读取 localStorage）
  const [state, setState] = useState<StoredState>(defaultState);
  // 是否已完成「从 localStorage 恢复」；未完成前不允许 saveState()
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedRef = useRef(false);
  /** 恢复完成前发生的写入操作（待重放队列） */
  const pendingRef = useRef<Array<(s: StoredState) => StoredState>>([]);

  /** 统一写入入口：恢复完成前入队，完成后直接应用 */
  const update = useCallback((fn: (s: StoredState) => StoredState) => {
    if (!loadedRef.current) {
      pendingRef.current.push(fn);
      return;
    }
    setState(fn);
  }, []);

  // Step 2：挂载后恢复用户数据（布局副作用 → 绘制前完成，无「空态一闪」）
  useIsomorphicLayoutEffect(() => {
    const base = loadState();
    const replay = pendingRef.current;
    pendingRef.current = [];
    loadedRef.current = true;
    if (replay.length > 0) {
      setState(replay.reduce((acc, fn) => fn(acc), base));
    } else {
      setState(base);
    }
    setIsLoaded(true);
  }, []);

  // 任何变更自动持久化（Storage Key: fund-admin-academy-v1）；恢复完成前跳过，防数据覆盖
  useEffect(() => {
    if (!isLoaded) return;
    saveState(state);
  }, [state, isLoaded]);

  const toggleModuleComplete = useCallback(
    (key: string) => {
      update((s) => ({
        ...s,
        completedModules: s.completedModules.includes(key)
          ? s.completedModules.filter((k) => k !== key)
          : [...s.completedModules, key],
      }));
    },
    [update]
  );

  const setLessonCompletion = useCallback(
    (moduleKeys: string[], complete: boolean) => {
      update((s) => {
        const existing = new Set(s.completedModules);
        if (complete) {
          moduleKeys.forEach((k) => existing.add(k));
        } else {
          moduleKeys.forEach((k) => existing.delete(k));
        }
        return { ...s, completedModules: Array.from(existing) };
      });
    },
    [update]
  );

  const toggleCaseComplete = useCallback(
    (caseId: string) => {
      update((s) => {
        const already = s.completedCases.includes(caseId);
        if (!already) {
          return {
            ...s,
            completedCases: [...s.completedCases, caseId],
            caseCompletedAt: { ...s.caseCompletedAt, [caseId]: Date.now() },
          };
        }
        const nextAt = { ...s.caseCompletedAt };
        delete nextAt[caseId];
        return {
          ...s,
          completedCases: s.completedCases.filter((c) => c !== caseId),
          caseCompletedAt: nextAt,
        };
      });
    },
    [update]
  );

  /** V1.12.1 一键完成学习：只置完成、永不取消（重复标记保留首次 completedAt） */
  const completeCase = useCallback(
    (caseId: string) => {
      update((s) =>
        s.completedCases.includes(caseId)
          ? s
          : {
              ...s,
              completedCases: [...s.completedCases, caseId],
              caseCompletedAt: {
                ...s.caseCompletedAt,
                [caseId]: Date.now(),
              },
            }
      );
    },
    [update]
  );

  const markCaseStarted = useCallback(
    (caseId: string) => {
      update((s) =>
        s.startedCases.includes(caseId)
          ? s
          : { ...s, startedCases: [...s.startedCases, caseId] }
      );
    },
    [update]
  );

  const toggleFavorite = useCallback(
    (fav: Favorite) => {
      update((s) => {
        const key = favoriteKey(fav);
        const exists = s.favorites.some((f) => favoriteKey(f) === key);
        return {
          ...s,
          favorites: exists
            ? s.favorites.filter((f) => favoriteKey(f) !== key)
            : [...s.favorites, fav],
        };
      });
    },
    [update]
  );

  const recordView = useCallback(
    (lessonId: string) => {
      update((s) => {
        const rest = s.recentlyViewed.filter((r) => r.lessonId !== lessonId);
        const next = [{ lessonId, at: Date.now() }, ...rest].slice(0, 5);
        return { ...s, recentlyViewed: next };
      });
    },
    [update]
  );

  const resetProgress = useCallback(() => {
    update((s) => ({
      ...s,
      completedModules: [],
      completedCases: [],
      caseCompletedAt: {},
      startedCases: [],
    }));
  }, [update]);

  const resetFavorites = useCallback(() => {
    update((s) => ({ ...s, favorites: [] }));
  }, [update]);

  const resetAll = useCallback(() => {
    clearState();
    update(() => defaultState());
  }, [update]);

  const importData = useCallback(
    (payload: unknown): boolean => {
      try {
        if (!payload || typeof payload !== "object") return false;
        const p = payload as Partial<ExportPayload>;
        if (p.app !== "fund-admin-academy") return false;
        const incoming = normalize(p.data);
        update(() => incoming);
        return true;
      } catch {
        return false;
      }
    },
    [update]
  );

  const buildExport = useCallback((): ExportPayload => {
    return {
      app: "fund-admin-academy",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: state,
    };
  }, [state]);

  const value = useMemo<AcademyContextValue>(
    () => ({
      state,
      toggleModuleComplete,
      setLessonCompletion,
      toggleCaseComplete,
      completeCase,
      markCaseStarted,
      toggleFavorite,
      recordView,
      resetProgress,
      resetFavorites,
      resetAll,
      importData,
      buildExport,
    }),
    [
      state,
      toggleModuleComplete,
      setLessonCompletion,
      toggleCaseComplete,
      completeCase,
      markCaseStarted,
      toggleFavorite,
      recordView,
      resetProgress,
      resetFavorites,
      resetAll,
      importData,
      buildExport,
    ]
  );

  return (
    <AcademyContext.Provider value={value}>{children}</AcademyContext.Provider>
  );
}

export function useAcademy(): AcademyContextValue {
  const ctx = useContext(AcademyContext);
  if (!ctx) throw new Error("useAcademy 必须在 <AcademyProvider> 内使用");
  return ctx;
}
