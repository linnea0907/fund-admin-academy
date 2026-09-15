"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 旧深链兜底（V1.15.2）
 *
 *  V1.15.0 / V1.15.1 的工具详情是 `/toolkit#<id>` 锚点形式，本版改为 `/toolkit/<id>` 独立页。
 *  检索结果、收藏与站内链接已全部更新，但用户可能存过带锚点的旧链接 ——
 *  挂载时若发现 hash 命中已知工具 id，静默替换到新的详情路由，避免"点进来停在总览页顶端"。 */
export default function ToolkitHashRedirect({ ids }: { ids: string[] }) {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash || !ids.includes(hash)) return;
    router.replace(`/toolkit/${hash}`);
  }, [ids, router]);

  return null;
}
