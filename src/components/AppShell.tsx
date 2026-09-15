"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";

/** 一级导航（V1.15.2 导航重构：按「用户使用频率 + 学习流程」组织，不按功能开发顺序）
 *
 *  学习概览 → 课程中心 → 知识检索▾（案例库 / 术语库 / 实务工具包）→ 案例工坊 → 收藏夹 → 设置
 *
 *  设计要点：
 *  - 「知识检索」是**统一知识入口**，案例库 / 术语库 / 实务工具包都是知识资产，收在同一层级下，
 *    查资料只需要认一个入口；
 *  - 一级条目由 9 项降为 6 项，层级化后更易理解；
 *  - 「案例工坊」（/backlog，seed 录入台）属生产工具而非查资料入口，保留为独立一级条目；
 *  - 「知识工坊」（/wiki）已于 V1.15.2 下线，其健康度看板迁入术语库页签。 */
interface NavItem {
  href: string;
  label: string;
  /** 子项（同一知识入口下的资产库） */
  children?: { href: string; label: string }[];
}

const NAV: NavItem[] = [
  { href: "/", label: "学习概览" },
  { href: "/courses", label: "课程中心" },
  {
    href: "/search",
    label: "知识检索",
    children: [
      { href: "/cases", label: "案例库" },
      { href: "/glossary", label: "术语库" },
      { href: "/toolkit", label: "实务工具包" },
    ],
  },
  { href: "/backlog", label: "案例工坊" },
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
        const children = item.children ?? [];
        // 子路由激活时，父条目按「所属组高亮」处理，避免与子项同时出现两个选中态
        const childActive = children.some((c) => isActive(pathname, c.href));
        const selfActive = isActive(pathname, item.href) && !childActive;

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={selfActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                selfActive || childActive
                  ? "bg-white/15 text-white"
                  : "text-blue-200/90 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  selfActive || childActive ? "bg-amber-300" : "bg-blue-200/40"
                }`}
              />
              {item.label}
              {children.length > 0 && (
                <span
                  aria-hidden
                  className={`ml-auto text-[10px] ${
                    childActive ? "text-amber-300" : "text-blue-200/50"
                  }`}
                >
                  {children.length}
                </span>
              )}
            </Link>

            {children.length > 0 && (
              <div className="ml-[18px] mt-0.5 flex flex-col gap-0.5 border-l border-white/10 pl-2.5">
                {children.map((c) => {
                  const active = isActive(pathname, c.href);
                  return (
                    <Link
                      key={c.href}
                      href={c.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition ${
                        active
                          ? "bg-white/10 font-semibold text-white"
                          : "text-blue-200/75 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className={`h-1 w-1 rounded-full ${
                          active ? "bg-amber-300" : "bg-blue-200/40"
                        }`}
                      />
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
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
