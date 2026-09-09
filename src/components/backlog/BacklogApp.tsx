"use client";

import dynamic from "next/dynamic";

/**
 * Case Backlog 纯客户端入口（ssr:false）：
 * 数据全部存本机 localStorage，无需服务端渲染；关闭 SSR 可避免
 * 「服务端空态 vs 客户端数据」的 hydration 不一致，也无需多余首帧 loading。
 */
const CaseBacklog = dynamic(() => import("./CaseBacklog"), {
  ssr: false,
  loading: () => (
    <div className="space-y-6">
      <div className="h-40 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
      <div className="h-20 animate-pulse rounded-2xl border border-slate-100 bg-slate-50" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-2xl border border-slate-100 bg-slate-50"
          />
        ))}
      </div>
    </div>
  ),
});

export default function BacklogApp() {
  return <CaseBacklog />;
}
