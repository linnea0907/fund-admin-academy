"use client";

import dynamic from "next/dynamic";
import type { MissingTermCandidate } from "@/lib/missing-terms";
import type { WikiHealthSummary } from "@/lib/glossary-usage";

/** WikiApp 纯客户端入口：暂存区（localStorage）只在客户端读取，避免 SSR/hydration 不一致 */
const WikiAppInner = dynamic(() => import("@/components/wiki/WikiApp"), {
  ssr: false,
  loading: () => <p className="py-10 text-center text-sm text-slate-400">加载知识工坊…</p>,
});

export default function WikiLoader(props: {
  missing: MissingTermCandidate[];
  health: WikiHealthSummary;
  existingIds: string[];
  existingLabels: { id: string; term: string; zh: string }[];
  builtinCount: number;
  importedCount: number;
  totalCount: number;
}) {
  return <WikiAppInner {...props} />;
}
