"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type CSSProperties, type ReactNode } from "react";
import { siteConfig } from "@/lib/site-config";
import { useUiPref } from "@/hooks/use-ui-pref";

/** 一级导航（V1.15.2 导航重构：按「用户使用频率 + 学习流程」组织，不按功能开发顺序）
 *
 *  学习概览 → 课程中心 → 知识检索▾（案例库 / 术语库 / 实务工具包）→ 案例工坊 → 收藏夹 → 设置
 *
 *  设计要点：
 *  - 「知识检索」是**统一知识入口**，案例库 / 术语库 / 实务工具包都是知识资产，收在同一层级下，
 *    查资料只需要认一个入口；
 *  - 一级条目由 9 项降为 6 项，层级化后更易理解；
 *  - 「案例工坊」（/backlog，seed 录入台）属生产工具而非查资料入口，保留为独立一级条目；
 *  - 「知识工坊」（/wiki）已于 V1.15.2 下线，其健康度看板迁入术语库页签。
 *
 *  V1.15.3：
 *  - 桌面侧栏支持**收起 / 展开**（收起后为窄图标栏，仅剩图标 + tooltip），状态持久化到 localStorage；
 *  - 每个一级条目补齐线性图标（收起态可辨识），移除原先右侧的「子项数量」数字
 *    （用户无法理解其含义，易误读为未读/待办，信息价值低）。
 *
 *  V1.16.1：
 *  - 「CAMS 模拟考试」由「知识检索」子项**迁出**，改为课程中心第 16 讲
 *    （学习路径终点，见 data/cams/mock-exam.ts 与 MockExamCard）。
 *    理由：案例库 / 术语库 / 实务工具包属 Reference（查资料），
 *    模拟考试属 Learning Assessment（学习评估），不应混在同一层级。
 */

type NavIconName =
  | "overview"
  | "courses"
  | "knowledge"
  | "workshop"
  | "favorites"
  | "settings";

interface NavItem {
  href: string;
  label: string;
  icon: NavIconName;
  /** 子项（同一知识入口下的资产库） */
  children?: { href: string; label: string }[];
}

const NAV: NavItem[] = [
  { href: "/", label: "学习概览", icon: "overview" },
  { href: "/courses", label: "课程中心", icon: "courses" },
  {
    href: "/search",
    label: "知识检索",
    icon: "knowledge",
    children: [
      { href: "/cases", label: "案例库" },
      { href: "/glossary", label: "术语库" },
      { href: "/toolkit", label: "实务工具包" },
    ],
  },
  { href: "/backlog", label: "案例工坊", icon: "workshop" },
  { href: "/favorites", label: "收藏夹", icon: "favorites" },
  { href: "/settings", label: "设置", icon: "settings" },
];

/** 桌面侧栏宽度（收起态需与 main 的 lg:ml-* 保持同值） */
const RAIL_W = 72;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 线性图标（描边继承 currentColor，fill 由 svg 根节点统一置 none） */
const ICON_ATTRS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function NavIcon({ name }: { name: NavIconName }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden {...ICON_ATTRS}>
      {name === "overview" && (
        <path d="M3 8.6 10 3.2l7 5.4V16a1 1 0 0 1-1 1h-3.6v-4.7h-4.8V17H4a1 1 0 0 1-1-1z" />
      )}
      {name === "courses" && (
        <>
          <path d="M10 5.4C8.4 4.2 6.5 3.7 4 3.7v11.4c2.5 0 4.4.5 6 1.7 1.6-1.2 3.5-1.7 6-1.7V3.7c-2.5 0-4.4.5-6 1.7z" />
          <path d="M10 5.4v11.4" />
        </>
      )}
      {name === "knowledge" && (
        <>
          <circle cx="9" cy="9" r="4.8" />
          <path d="M12.6 12.6 17 17" />
        </>
      )}
      {name === "workshop" && (
        <>
          <path d="M13.1 3.5a1.9 1.9 0 0 1 2.7 0l.7.7a1.9 1.9 0 0 1 0 2.7l-7.4 7.4-4.6 1.1 1.1-4.6z" />
          <path d="M12 4.6l3.4 3.4" />
        </>
      )}
      {name === "favorites" && (
        <path d="M10 2.9l2.2 4.5 5 .7-3.6 3.5.9 5L10 14.2l-4.5 2.4.9-5L2.8 8.1l5-.7z" />
      )}
      {name === "settings" && (
        <>
          <circle cx="10" cy="10" r="2.6" />
          <path d="M10 2.6v2.1M10 15.3v2.1M17.4 10h-2.1M4.7 10H2.6M15.2 4.8l-1.5 1.5M6.3 13.7l-1.5 1.5M15.2 15.2l-1.5-1.5M6.3 6.3 4.8 4.8" />
        </>
      )}
    </svg>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  /** 桌面侧栏收起态（刷新后保持，key: fund-admin-academy-ui-v1） */
  const [collapsed, setCollapsed] = useUiPref("navCollapsed", false);

  /** rail = 窄图标栏（仅桌面收起态使用；移动端抽屉始终完整）
   *  id 由调用方显式传入：桌面侧栏与移动抽屉同时存在，不能共用同一 id */
  const buildNav = (rail: boolean, id: string) => (
    <nav id={id} className="flex flex-col gap-1">
      {NAV.map((item) => {
        const children = item.children ?? [];
        // 子路由激活时，父条目按「所属组高亮」处理，避免与子项同时出现两个选中态
        const childActive = children.some((c) => isActive(pathname, c.href));
        const selfActive = isActive(pathname, item.href) && !childActive;
        const parentActive = selfActive || childActive;

        if (rail) {
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              aria-current={parentActive ? "page" : undefined}
              className={`relative flex h-10 w-10 items-center justify-center rounded-lg transition ${
                parentActive
                  ? "bg-white/15 text-white"
                  : "text-blue-200/75 hover:bg-white/5 hover:text-white"
              }`}
            >
              {parentActive && (
                <span className="absolute -left-1.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-amber-300" />
              )}
              <NavIcon name={item.icon} />
            </Link>
          );
        }

        return (
          <div key={item.href}>
            <Link
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={selfActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
                parentActive
                  ? "bg-white/15 text-white"
                  : "text-blue-200/90 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center ${
                  parentActive ? "text-amber-300" : "text-blue-200/50"
                }`}
              >
                <NavIcon name={item.icon} />
              </span>
              {item.label}
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

  /** 收起/展开 按钮（仅桌面侧栏顶部） */
  const toggleButton = (
    <button
      type="button"
      onClick={() => setCollapsed(!collapsed)}
      aria-controls="app-desktop-nav"
      aria-expanded={!collapsed}
      aria-label={collapsed ? "展开总目录" : "收起总目录"}
      title={collapsed ? "展开总目录" : "收起总目录"}
      className="shrink-0 rounded-lg p-2 text-blue-200/75 transition hover:bg-white/10 hover:text-white"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" aria-hidden {...ICON_ATTRS}>
        <rect x="2.4" y="3.4" width="15.2" height="13.2" rx="2.2" />
        <path d="M7.3 3.4v13.2" />
        {collapsed ? (
          <path d="M11.6 7.8l2.2 2.2-2.2 2.2" />
        ) : (
          <path d="M13.8 7.8l-2.2 2.2 2.2 2.2" />
        )}
      </svg>
    </button>
  );

  return (
    <div
      className="min-h-screen bg-[#f4f6fa]"
      /* 侧栏宽度单一来源：桌面侧栏 width 与主内容 lg:ml-* 共用该变量，避免两处写死后失配 */
      style={{ "--sidebar-w": `${collapsed ? RAIL_W : 240}px` } as CSSProperties}
    >
      {/* 桌面侧栏（V1.15.3：可收起为窄图标栏） */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-[#0e2a5e] py-6 transition-[width] duration-200 lg:flex ${
          collapsed ? "px-3" : "px-4"
        } lg:w-[var(--sidebar-w)]`}
      >
        <div
          className={
            collapsed
              ? "flex flex-col items-center gap-3"
              : "flex items-start justify-between gap-2 px-2"
          }
        >
          {collapsed ? (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-300 text-sm font-black text-[#0e2a5e]">
              FA
            </div>
          ) : (
            brand
          )}
          {toggleButton}
        </div>

        <div className={collapsed ? "mt-6 flex flex-col items-center gap-1" : "mt-8"}>
          {buildNav(collapsed, "app-desktop-nav")}
        </div>

        {!collapsed && (
          <div className="mt-auto rounded-xl bg-white/5 px-3.5 py-3 text-[11px] leading-relaxed text-blue-200/70">
            学习数据保存在本机浏览器
            <br />
            （localStorage · {siteConfig.storageKey}）
            <br />
            <span className="text-blue-200/50">
              {siteConfig.name} · {siteConfig.releaseStage} {siteConfig.version}
            </span>
          </div>
        )}
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
            <div className="mt-8">{buildNav(false, "app-mobile-nav")}</div>
          </div>
        </div>
      )}

      {/* 主内容（左边距随侧栏宽度联动） */}
      <main className="flex min-h-screen flex-col px-4 pb-16 pt-6 transition-[margin] duration-200 sm:px-6 lg:ml-[var(--sidebar-w)] lg:px-10 lg:pt-8">
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
