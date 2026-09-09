"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

export function AcademyProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredState>(() => loadState());

  // 任何变更自动持久化（Storage Key: fund-admin-academy-v1）
  useEffect(() => {
    saveState(state);
  }, [state]);

  const toggleModuleComplete = useCallback((key: string) => {
    setState((s) => ({
      ...s,
      completedModules: s.completedModules.includes(key)
        ? s.completedModules.filter((k) => k !== key)
        : [...s.completedModules, key],
    }));
  }, []);

  const setLessonCompletion = useCallback(
    (moduleKeys: string[], complete: boolean) => {
      setState((s) => {
        const existing = new Set(s.completedModules);
        if (complete) {
          moduleKeys.forEach((k) => existing.add(k));
        } else {
          moduleKeys.forEach((k) => existing.delete(k));
        }
        return { ...s, completedModules: Array.from(existing) };
      });
    },
    []
  );

  const toggleCaseComplete = useCallback((caseId: string) => {
    setState((s) => {
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
  }, []);

  /** V1.12.1 一键完成学习：只置完成、永不取消（重复标记保留首次 completedAt） */
  const completeCase = useCallback((caseId: string) => {
    setState((s) =>
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
  }, []);

  const markCaseStarted = useCallback((caseId: string) => {
    setState((s) =>
      s.startedCases.includes(caseId)
        ? s
        : { ...s, startedCases: [...s.startedCases, caseId] }
    );
  }, []);

  const toggleFavorite = useCallback((fav: Favorite) => {
    setState((s) => {
      const key = favoriteKey(fav);
      const exists = s.favorites.some((f) => favoriteKey(f) === key);
      return {
        ...s,
        favorites: exists
          ? s.favorites.filter((f) => favoriteKey(f) !== key)
          : [...s.favorites, fav],
      };
    });
  }, []);

  const recordView = useCallback((lessonId: string) => {
    setState((s) => {
      const rest = s.recentlyViewed.filter((r) => r.lessonId !== lessonId);
      const next = [{ lessonId, at: Date.now() }, ...rest].slice(0, 5);
      return { ...s, recentlyViewed: next };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setState((s) => ({
      ...s,
      completedModules: [],
      completedCases: [],
      caseCompletedAt: {},
      startedCases: [],
    }));
  }, []);

  const resetFavorites = useCallback(() => {
    setState((s) => ({ ...s, favorites: [] }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState(defaultState());
  }, []);

  const importData = useCallback((payload: unknown): boolean => {
    try {
      if (!payload || typeof payload !== "object") return false;
      const p = payload as Partial<ExportPayload>;
      if (p.app !== "fund-admin-academy") return false;
      const incoming = normalize(p.data);
      setState(incoming);
      return true;
    } catch {
      return false;
    }
  }, []);

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
