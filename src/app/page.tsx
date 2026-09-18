import type { Metadata } from "next";
import { knowledgeAssets } from "@/lib/knowledge-assets";
import HomeDashboard from "@/components/home/HomeDashboard";

/**
 * 首页 · 基金行政知识工作台（V1.20.1）
 *
 * 本文件是 **Server Component**，只做一件事：装配「知识资产」数字。
 *
 * 为什么要拆成服务端 / 客户端两段：案例数量来自 `@/lib/cases`（依赖 node:fs 读
 * `content/cases/index.json`），**不能进客户端 bundle**。因此静态体量在服务端算好，
 * 再以 props 传给客户端视图 `HomeDashboard`（它需要 useAcademy 读本机学习状态）。
 * 这也顺带让首页能自持 metadata（此前首页是 "use client"，无法导出 metadata）。
 */
export const metadata: Metadata = {
  title: { absolute: "Fund Admin Academy · 境外基金行政知识平台" },
  description:
    "境外基金行政、AML/KYC 与合规运营知识平台：课程学习、术语检索、实务案例、操作清单与 CAMS 认证备考整合在同一工作台，支持一次搜索直达术语、案例、课程与实务工具。",
};

export default function HomePage() {
  return <HomeDashboard assets={knowledgeAssets()} />;
}
