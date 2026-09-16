"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { readUiPrefs, writeUiPref, type UiPrefs } from "@/lib/ui-prefs";

/**
 * 读取 / 更新单项界面偏好（V1.15.3）
 *
 * 为什么首屏用「默认值 + 布局副作用回读」而不是 `useState(() => readUiPrefs())`：
 * 导航侧栏与课程目录是 SSG 出来的静态 HTML，若在首次渲染就按 localStorage 求值，
 * 服务端（展开）与客户端（收起）的 class 不一致 → React 19 会报 hydration mismatch。
 * 因此首帧统一渲染默认态，再在 **useLayoutEffect**（浏览器绘制前）回读偏好，
 * 既避免 hydration 报错，也避免用户看到「先展开再收起」的闪动。
 */
export function useUiPref<K extends keyof UiPrefs>(
  key: K,
  fallback: UiPrefs[K]
): [UiPrefs[K], (value: UiPrefs[K]) => void] {
  const [value, setValue] = useState<UiPrefs[K]>(fallback);

  // 客户端首帧绘制前同步一次（服务端渲染时退化为 useEffect，不触发警告）
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;
  useIsomorphicLayoutEffect(() => {
    setValue(readUiPrefs()[key]);
  }, [key]);

  const update = useCallback(
    (next: UiPrefs[K]) => {
      setValue(next);
      writeUiPref(key, next);
    },
    [key]
  );

  return [value, update];
}
