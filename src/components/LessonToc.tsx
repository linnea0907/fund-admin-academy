"use client";

import type { Lesson } from "@/types";
import { useAcademy } from "@/hooks/use-academy";
import { lessonDoneCount, moduleKey } from "@/lib/progress";

export interface TocEntry {
  id: string;
  label: string;
  kind: "goal" | "module" | "risks" | "mindmap" | "quiz";
}

export function buildTocEntries(lesson: Lesson): TocEntry[] {
  return [
    { id: "goal", label: "学习目标", kind: "goal" },
    ...lesson.modules.map((m) => ({ id: m.id, label: m.title, kind: "module" as const })),
    { id: "risks", label: "风险提示", kind: "risks" },
    { id: "mindmap", label: "思维导图", kind: "mindmap" },
    { id: "quiz", label: "课程自测", kind: "quiz" },
  ];
}

/** 移动端横向跳转 chips（置于内容顶部） */
export function MobileToc({ lesson }: { lesson: Lesson }) {
  const { state } = useAcademy();
  const items = buildTocEntries(lesson);
  return (
    <div className="thin-scroll -mx-4 mb-5 overflow-x-auto px-4 lg:hidden">
      <div className="flex w-max gap-2">
        {items.map((it) => {
          const done =
            it.kind === "module" &&
            state.completedModules.includes(moduleKey(lesson.id, it.id));
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                done
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-600"
              }`}
            >
              {done && <span className="text-emerald-500">✓</span>}
              {it.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/** 桌面 sticky 目录（置于内容左侧）
 *
 *  V1.15.3：支持折叠 —— 折叠后只保留「本讲目录 + 完成进度」与展开按钮，
 *  腾出的横向空间交还正文（列宽由 LessonReader 统一控制）。 */
export function DesktopToc({
  lesson,
  collapsed,
  onToggle,
}: {
  lesson: Lesson;
  collapsed: boolean;
  onToggle: () => void;
}) {
  const { state } = useAcademy();
  const doneCount = lessonDoneCount(state, lesson);
  const items = buildTocEntries(lesson);
  const dotLabels: Record<TocEntry["kind"], string> = {
    goal: "🎯",
    risks: "⚠",
    mindmap: "🧠",
    quiz: "✓",
    module: "",
  };
  const total = lesson.modules.length;
  const pct = total === 0 ? 0 : Math.round((doneCount / total) * 100);

  const toggle = (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={!collapsed}
      aria-label={collapsed ? "展开本讲目录" : "收起本讲目录"}
      title={collapsed ? "展开本讲目录" : "收起本讲目录"}
      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-[#0e2a5e]"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {collapsed ? <path d="M8 6l4 4-4 4" /> : <path d="M12 6l-4 4 4 4" />}
      </svg>
    </button>
  );

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {collapsed ? (
          /* 折叠态：仅「本讲目录 + 完成进度（n/m）」 */
          <div className="flex flex-col items-center gap-2 px-3 py-3.5">
            {toggle}
            <p className="text-[11px] font-bold leading-tight text-slate-500">
              本讲目录
            </p>
            <span className="text-xs font-semibold text-[#0e2a5e]">
              {doneCount}/{total}
            </span>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0e2a5e] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : (
          /* 展开态：完整章节导航 */
          <div className="p-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                本讲目录
              </p>
              <div className="flex items-center gap-0.5">
                <span className="text-xs font-semibold text-[#0e2a5e]">
                  {doneCount}/{total}
                </span>
                {toggle}
              </div>
            </div>
            <div className="thin-scroll mt-3 max-h-[calc(100vh-190px)] space-y-0.5 overflow-y-auto pr-1">
              {items.map((it) => {
                if (it.kind === "module") {
                  const done = state.completedModules.includes(
                    moduleKey(lesson.id, it.id)
                  );
                  return (
                    <TocLink key={it.id} href={`#${it.id}`} label={it.label} done={done} />
                  );
                }
                return (
                  <TocLink
                    key={it.id}
                    href={`#${it.id}`}
                    label={`${dotLabels[it.kind]} ${it.label}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[#0e2a5e] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TocLink({
  href,
  label,
  done,
}: {
  href: string;
  label: string;
  done?: boolean;
}) {
  return (
    <a
      href={`#${href}`}
      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-slate-600 transition hover:bg-slate-50 hover:text-[#0e2a5e]"
    >
      {typeof done === "boolean" ? (
        <span
          className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${
            done ? "bg-emerald-500 text-white" : "border border-slate-300 bg-white"
          }`}
        >
          {done && "✓"}
        </span>
      ) : (
        <span className="w-4 shrink-0 text-center text-[11px]">·</span>
      )}
      <span className="truncate">{label}</span>
    </a>
  );
}
