import type { Metadata } from "next";
import HomeDashboard from "@/components/home/HomeDashboard";

/**
 * 首页 · 学习驾驶舱（V1.20.2）
 *
 * 本文件保持 **Server Component**：只为让首页能自持 metadata
 * （"use client" 文件不能导出 metadata）。原 V1.20.1 在此处装配「知识资产」
 * 数字（案例数依赖 node:fs）的职责已随该模块下线而移除。
 */
export const metadata: Metadata = {
  title: { absolute: "Fund Admin Academy · 境外基金行政知识平台" },
  description:
    "境外基金行政、AML/KYC 与合规运营学习平台：沿必修八讲建立境外基金运作与合规的全局框架，用全真模拟检验掌握程度。",
};

export default function HomePage() {
  return <HomeDashboard />;
}
