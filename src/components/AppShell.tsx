"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

/** 一级导航（导航规范 V1.2 定稿：按使用频率重构 · 案例库→案例工坊同一学习链路紧邻 · 术语库/技能中心/搜索并入「知识检索」） */
const NAV = [
  { href: "/", label: "学习概览" },
  { href: "/courses", label: "课程中心" },
  { href: "/cases", label: "案例库" },
  { href: "/backlog", label: "案例工坊" },
  { href: "/search", label: "知识检索" },
  { href: "/favorites", label: "收藏夹" },
  { href: "/settings", label: "设置" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
              active
                ? "bg-white/15 text-white"
                : "text-blue-200/90 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                active ? "bg-amber-300" : "bg-blue-200/40"
              }`}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex min-w-0 items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-sm font-black text-[#0e2a5e]">
        FA
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[13px] font-bold text-white">
          {siteConfig.name}
        </p>
        {/* 空间不足时（移动端顶栏/抽屉）省略中文副题，采用 Logo 简化版 */}
        <p className="hidden truncate text-[9px] text-blue-200/80 lg:block">
          {siteConfig.nameZh}
        </p>
        <p className="truncate text-[10px] text-amber-200/90">
          内测版 {siteConfig.version}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f6fa]">
      {/* 桌面侧栏 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-[#0e2a5e] px-4 py-6 lg:flex">
        <div className="px-2">{brand}</div>
        <div className="mt-8">{nav}</div>
        <div className="mt-auto rounded-xl bg-white/5 px-3.5 py-3 text-[11px] leading-relaxed text-blue-200/70">
          学习数据保存在本机浏览器
          <br />
          （localStorage · {siteConfig.storageKey}）
          <br />
          <span className="text-blue-200/50">
            {siteConfig.name} · {siteConfig.releaseStage} {siteConfig.version}
          </span>
        </div>
      </aside>

      {/* 移动端顶栏 */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-[#0e2a5e] px-4 py-3 lg:hidden">
        {brand}
        <button
          type="button"
          aria-label="打开菜单"
          onClick={() => setOpen(true)}
          className="rounded-lg p-2 text-white hover:bg-white/10"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      {/* 移动端抽屉 */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[#0e2a5e] px-4 py-6 shadow-2xl">
            <div className="flex items-center justify-between px-2">
              {brand}
              <button
                type="button"
                aria-label="关闭菜单"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-blue-200 hover:bg-white/10 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-8">{nav}</div>
          </div>
        </div>
      )}

      {/* 主内容 */}
      <main className="flex min-h-screen flex-col px-4 pb-16 pt-6 sm:px-6 lg:ml-60 lg:px-10 lg:pt-8">
        <div className="mx-auto w-full max-w-6xl flex-1">{children}</div>

        {/* 全站页脚（所有页面底部） */}
        <footer className="mx-auto mt-12 w-full max-w-6xl border-t border-slate-200 pb-2 pt-6 text-center">
          <p className="text-xs font-semibold tracking-wide text-slate-500">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Internal Beta Version · {siteConfig.version}
          </p>
          <p className="mt-0.5 text-[10px] text-slate-300">
            {siteConfig.footerDisclaimer}
          </p>
        </footer>
      </main>
    </div>
  );
}
