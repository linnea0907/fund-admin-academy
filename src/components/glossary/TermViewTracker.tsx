"use client";

import { useEffect } from "react";
import { recordTermEvents } from "@/lib/wiki-metrics";

/** 本次页面加载内已记录的术语（模块级 → 抗 React StrictMode 双挂载重复计数） */
const recorded = new Set<string>();

/**
 * 术语详情页浏览量埋点（本机 localStorage；用于「热门术语 Top」）。
 * 渲染为 null，不产出任何 DOM。
 */
export default function TermViewTracker({ termId }: { termId: string }) {
  useEffect(() => {
    if (!termId || recorded.has(termId)) return;
    recorded.add(termId);
    recordTermEvents([termId], "view");
  }, [termId]);

  return null;
}
