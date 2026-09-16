"use client";

import type { ReactNode } from "react";
import type { Lesson } from "@/types";
import { DesktopToc } from "@/components/LessonToc";
import { useUiPref } from "@/hooks/use-ui-pref";

/** 本讲目录折叠后的窄条宽度（折叠态仅容纳「本讲目录 + 完成进度」） */
const TOC_RAIL_W = 96;
/** 本讲目录展开态列宽（与 V1.15.2 保持一致，勿随意改） */
const TOC_FULL_W = 250;

/**
 * 课程阅读布局壳（V1.15.3）
 *
 * 把「本讲目录是否折叠」这一状态提升到布局层：折叠后不只是隐藏目录条目，
 * 而是同步把网格左列从 250px 收窄到 96px，把空间真正让给正文（笔记本屏幕收益最明显）。
 * 状态持久化在 localStorage（key: fund-admin-academy-ui-v1 → tocCollapsed）。
 */
export default function LessonReader({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useUiPref("tocCollapsed", false);

  return (
    <div
      className="lg:grid lg:items-start lg:gap-8"
      style={{
        // 仅在 lg 断点（display:grid 生效）时有意义；小屏为块级布局，该属性不起作用
        gridTemplateColumns: `${collapsed ? TOC_RAIL_W : TOC_FULL_W}px minmax(0,1fr)`,
      }}
    >
      <DesktopToc
        lesson={lesson}
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
      />
      {children}
    </div>
  );
}
