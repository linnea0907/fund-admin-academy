"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CaseMeta } from "@/types";
import { CASE_MODULES } from "@/lib/case-modules";
import { SKILL_DEFS } from "@/lib/skill-defs";
import { useAcademy } from "@/hooks/use-academy";
import CaseCard from "./CaseCard";

type StatusFilter = "all" | "pending" | "active" | "done";

const STATUS_KEYS: StatusFilter[] = ["all", "pending", "active", "done"];

function isStatus(v: string | null): v is StatusFilter {
  return v !== null && (STATUS_KEYS as string[]).includes(v);
}

function sortZh(vals: Set<string>): string[] {
  return Array.from(vals).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

/** 从 URL 读取当前筛选（状态单一来源 = URL，支持分享 / 回退 / 刷新） */
function readFilters(sp: URLSearchParams) {
  const rawModule = sp.get("module");
  const n = rawModule ? Number(rawModule) : NaN;
  return {
    module: Number.isInteger(n) && n >= 1 && n <= 5 ? n : null,
    level: sp.get("level")?.trim() || null,
    skill: sp.get("skill")?.trim() || null,
    tag: sp.get("tag")?.trim() || null,
    status: isStatus(sp.get("status")) ? sp.get("status")! : ("all" as StatusFilter),
  };
}

/** 案例库目录：Module / Level / Skills / Tags / 状态 多维筛选 + 学习进度统计 */
export default function CaseLibrary({ cases }: { cases: CaseMeta[] }) {
  const { state } = useAcademy();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const filters = readFilters(sp);

  const doneIds = useMemo(
    () => new Set(state.completedCases.filter((c) => c.startsWith("Case-"))),
    [state.completedCases]
  );

  /** 更新筛选（写回 URL；null 表示删除该维度） */
  const update = (patch: Partial<{ module: number | null; level: string | null; skill: string | null; tag: string | null; status: StatusFilter | null }>) => {
    const p = new URLSearchParams(sp.toString());
    (Object.entries(patch) as [string, unknown][]).forEach(([k, v]) => {
      if (v === null || v === "") p.delete(k);
      else p.set(k, String(v));
    });
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  // 统计（全量 / 已就绪 / 已完成）
  const readyTotal = cases.filter((c) => c.ready).length;
  const doneTotal = cases.filter((c) => c.ready && doneIds.has(c.id)).length;
  const pendingTotal = cases.length - readyTotal;
  const progress = readyTotal === 0 ? 0 : Math.round((doneTotal / readyTotal) * 100);

  // 可选项（按需展示使用中的维度值）
  const allSkillsInUse = useMemo(() => {
    const used = new Set(cases.flatMap((c) => c.skills));
    const inOrder = SKILL_DEFS.filter((s) => used.has(s.id)).map((s) => s.id);
    const rest = sortZh(new Set([...used].filter((s) => !inOrder.includes(s))));
    return [...inOrder, ...rest];
  }, [cases]);
  const levels = useMemo(() => sortZh(new Set(cases.map((c) => c.level).filter(Boolean))), [cases]);
  const tags = useMemo(() => sortZh(new Set(cases.flatMap((c) => c.tags))), [cases]);
  const moduleCounts = useMemo(() => {
    const m = new Map<number, number>();
    for (const c of cases) m.set(c.module, (m.get(c.module) ?? 0) + 1);
    return m;
  }, [cases]);

  // 失效选项保护：URL 指向已不存在的值时按空处理
  const shownLevel = filters.level && levels.includes(filters.level) ? filters.level : null;
  const shownTag = filters.tag && tags.includes(filters.tag) ? filters.tag : null;
  const shownSkill = filters.skill && allSkillsInUse.includes(filters.skill) ? filters.skill : null;

  const filtered = cases.filter((c) => {
    if (filters.status === "pending" && c.ready) return false;
    if (filters.status === "active" && (!c.ready || doneIds.has(c.id))) return false;
    if (filters.status === "done" && !(c.ready && doneIds.has(c.id))) return false;
    if (filters.module !== null && c.module !== filters.module) return false;
    if (shownLevel && c.level !== shownLevel) return false;
    if (shownSkill && !c.skills.includes(shownSkill)) return false;
    if (shownTag && !c.tags.includes(shownTag)) return false;
    return true;
  });

  const statusTabs: { key: StatusFilter; label: string; count: number }[] = [
    { key: "all", label: "全部", count: cases.length },
    { key: "pending", label: "待导入", count: pendingTotal },
    { key: "active", label: "学习中", count: readyTotal - doneTotal },
    { key: "done", label: "已完成", count: doneTotal },
  ];

  const hasActive =
    filters.module !== null ||
    shownLevel !== null ||
    shownSkill !== null ||
    shownTag !== null ||
    filters.status !== "all";

  const chipBase = (active: boolean) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold transition ${
      active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
    }`;

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">案例库</h1>
            <p className="mt-1 text-sm text-slate-500">
              Real Fund Admin Cases · 答案以 ICS 内部 SOP 为准 · 共 {cases.length} 个案例，已导入{" "}
              {readyTotal} 个，完成 {doneTotal} 个
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[11px] text-slate-400">已导入完成率</p>
              <p className="text-lg font-bold text-[#0e2a5e]">
                {readyTotal === 0 ? "—" : `${progress}%`}
              </p>
            </div>
            {/* 环形进度 */}
            <div className="relative h-14 w-14">
              <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#eef1f6" strokeWidth="7" />
                <circle
                  cx="28"
                  cy="28"
                  r="24"
                  fill="none"
                  stroke={progress === 100 ? "#10b981" : "#0e2a5e"}
                  strokeWidth="7"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 24}
                  strokeDashoffset={2 * Math.PI * 24 * (1 - progress / 100)}
                  className="transition-all"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-600">
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 筛选区 */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">模块</span>
          <button type="button" onClick={() => update({ module: null })} className={chipBase(filters.module === null)}>
            全部
          </button>
          {CASE_MODULES.map((m) => (
            <button
              key={m.id}
              type="button"
              title={`${m.title} · ${m.zh}`}
              onClick={() => update({ module: filters.module === m.id ? null : m.id })}
              className={chipBase(filters.module === m.id)}
            >
              M{m.id} · {m.zh} {moduleCounts.get(m.id) ?? 0}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">状态</span>
          {statusTabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => update({ status: filters.status === t.key ? null : t.key })}
              className={chipBase(filters.status === t.key)}
            >
              {t.label} {t.count}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">难度</span>
          {levels.length === 0 ? (
            <span className="text-xs text-slate-300">暂无</span>
          ) : (
            <>
              <button type="button" onClick={() => update({ level: null })} className={chipBase(!shownLevel)}>
                全部
              </button>
              {levels.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => update({ level: shownLevel === lv ? null : lv })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    shownLevel === lv
                      ? "bg-amber-400 text-amber-950"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {lv}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">技能</span>
          {allSkillsInUse.length === 0 ? (
            <span className="text-xs text-slate-300">暂无</span>
          ) : (
            <>
              <button type="button" onClick={() => update({ skill: null })} className={chipBase(!shownSkill)}>
                全部
              </button>
              {allSkillsInUse.map((s) => (
                <button
                  key={s}
                  type="button"
                  title={`能力标签：${s}`}
                  onClick={() => update({ skill: shownSkill === s ? null : s })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    shownSkill === s
                      ? "bg-emerald-500 text-white"
                      : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 hover:bg-emerald-100"
                  }`}
                >
                  {s}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 w-12 text-xs font-semibold text-slate-400">标签</span>
          {tags.length === 0 ? (
            <span className="text-xs text-slate-300">暂无</span>
          ) : (
            <>
              <button type="button" onClick={() => update({ tag: null })} className={chipBase(!shownTag)}>
                全部
              </button>
              {tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => update({ tag: shownTag === t ? null : t })}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    shownTag === t
                      ? "bg-amber-400 text-amber-950"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  #{t}
                </button>
              ))}
            </>
          )}
        </div>
      </section>

      {/* 当前筛选提示 */}
      {hasActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2.5">
          <p className="text-xs text-blue-900">
            当前筛选：{filtered.length} / {cases.length} 个案例
            {filters.module !== null && ` · M${filters.module}`}
            {shownLevel && ` · ${shownLevel}`}
            {shownSkill && ` · ${shownSkill}`}
            {shownTag && ` · #${shownTag}`}
            {filters.status !== "all" &&
              ` · ${statusTabs.find((t) => t.key === filters.status)?.label ?? ""}`}
          </p>
          <button
            type="button"
            onClick={() => update({ module: null, level: null, skill: null, tag: null, status: null })}
            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
          >
            清除全部筛选
          </button>
        </div>
      )}

      {/* 案例网格 */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">
            {!hasActive ? "暂无案例" : "没有符合当前筛选条件的案例"}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            案例正文按模块分阶段导入（以 ICS 内部 SOP 为准），导入后自动出现在此处
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CaseCard key={c.id} item={c} done={doneIds.has(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
