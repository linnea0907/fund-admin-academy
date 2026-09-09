"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { CaseMeta } from "@/types";
import { SKILL_DEFS, SKILL_GROUP_ORDER, SKILL_GROUPS, type SkillGroup, type SkillStat } from "@/lib/skill-defs";
import { useAcademy } from "@/hooks/use-academy";

const GROUP_COLOR: Record<SkillGroup, string> = {
  "identity-docs": "text-[#0e2a5e]",
  structure: "text-violet-700",
  "aml-letter": "text-sky-700",
  onboarding: "text-teal-700",
  compliance: "text-rose-700",
  core: "text-slate-600",
};

/** Skills 能力页：每项技能的说明 / 案例数 / 已完成数 / 完成率（P1.8） */
export default function SkillsBoard({ cases }: { cases: CaseMeta[] }) {
  const { state } = useAcademy();
  const doneIds = useMemo(
    () => new Set(state.completedCases.filter((c) => c.startsWith("Case-"))),
    [state.completedCases]
  );

  // 每技能统计（含未挂载技能：0 案例）
  const stats = useMemo<SkillStat[]>(() => {
    return SKILL_DEFS.map((def) => {
      const caseIds = cases.filter((c) => c.skills.includes(def.id)).map((c) => c.id);
      const readyIds = caseIds.filter((id) => cases.find((c) => c.id === id)?.ready);
      const doneCount = readyIds.filter((id) => doneIds.has(id)).length;
      const readyCount = readyIds.length;
      return {
        def,
        caseIds,
        readyCount,
        doneCount,
        rate: readyCount > 0 ? Math.round((doneCount / readyCount) * 100) : null,
      };
    });
  }, [cases, doneIds]);

  const used = stats.filter((s) => s.caseIds.length > 0);
  const readyLinked = used.reduce((n, s) => n + s.readyCount, 0);
  const doneLinked = used.reduce((n, s) => n + s.doneCount, 0);
  const avgRate =
    readyLinked === 0 ? null : Math.round((doneLinked / readyLinked) * 100);
  const maxLinked = Math.max(0, ...used.map((s) => s.caseIds.length));

  const byGroup = (g: SkillGroup) => stats.filter((s) => s.def.group === g);

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">技能中心</h1>
            <p className="mt-1 text-sm text-slate-500">
              能力地图 · 受控技能词表（20 项），独立于课程模块；每项展示挂载案例与完成进度
            </p>
          </div>
          <div className="flex items-center gap-6 text-right">
            <div>
              <p className="text-[11px] text-slate-400">技能总数</p>
              <p className="text-lg font-bold text-[#0e2a5e]">{stats.length}</p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">覆盖案例 · 可学/完成</p>
              <p className="text-lg font-bold text-[#0e2a5e]">
                {used.length > 0 ? `${used.length} 项 / ${readyLinked} · ${doneLinked}` : "—"}
              </p>
            </div>
            <div>
              <p className="text-[11px] text-slate-400">平均完成率</p>
              <p className="text-lg font-bold text-[#0e2a5e]">
                {avgRate === null ? "—" : `${avgRate}%`}
              </p>
            </div>
          </div>
        </div>
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
          完成率 = 已标记完成的「可学习案例」/ 该技能下内容已导入（ready）的案例；正文未导入的骨架案例不计入分母。
          技能成长地图（per-skill 熟练度）数据结构已预留，UI 随后续迭代上线。
        </p>
      </section>

      {/* 按技能分组 */}
      {SKILL_GROUP_ORDER.map((g) => {
        const groupStats = byGroup(g);
        const meta = SKILL_GROUPS[g];
        return (
          <section key={g} className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className={`text-sm font-bold ${GROUP_COLOR[g]}`}>{meta.label}</h2>
              <span className="text-xs text-slate-400">{meta.hint}</span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {groupStats.map((s) => (
                <SkillCard key={s.def.id} stat={s} doneIds={doneIds} maxLinked={maxLinked} cases={cases} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 使用说明 */}
      <section className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 text-xs leading-relaxed text-slate-400">
        每个案例在 frontmatter 中声明其训练的能力标签（skills）。点击技能名可跳转案例库并自动按该技能筛选；点案例编号直达案例详情。
        技能打标由 WorkBuddy 按案例主题初标，Copilot 导入正文时可修订。
      </section>
    </div>
  );
}

function SkillCard({
  stat,
  doneIds,
  maxLinked,
  cases,
}: {
  stat: SkillStat;
  doneIds: Set<string>;
  maxLinked: number;
  cases: CaseMeta[];
}) {
  const { def, caseIds, readyCount, doneCount, rate } = stat;
  const readyCases = cases.filter((c) => c.ready && c.skills.includes(def.id));
  const learnable = readyCount;
  const width = maxLinked === 0 ? 0 : Math.round((caseIds.length / maxLinked) * 100);

  return (
    <div className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/40 p-4 transition hover:border-emerald-200 hover:bg-emerald-50/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-800" title={def.id}>
            {def.id}
          </p>
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{def.description}</p>
        </div>
        <Link
          href={`/cases?skill=${encodeURIComponent(def.id)}`}
          className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-emerald-600"
        >
          筛选案例
        </Link>
      </div>

      {/* 覆盖度条（相对最多案例技能） */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>案例覆盖</span>
          <span>
            案例 {caseIds.length} · 可学 {learnable} · 完成 {doneCount}
          </span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${width}%` }} />
        </div>
      </div>

      {/* 完成率 */}
      <div className="mt-3 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/70">
          <div
            className={`h-full rounded-full transition-all ${
              rate === null ? "bg-slate-300" : rate === 100 ? "bg-emerald-500" : "bg-[#0e2a5e]"
            }`}
            style={{ width: `${rate ?? 0}%` }}
          />
        </div>
        <span className="w-11 shrink-0 text-right text-xs font-bold text-slate-600">
          {rate === null ? "—" : `${rate}%`}
        </span>
      </div>

      {/* 可学习案例快捷入口 */}
      {readyCases.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2.5">
          {readyCases.slice(0, 6).map((c) => {
            const done = doneIds.has(c.id);
            return (
              <Link
                key={c.id}
                href={`/cases/${c.id.toLowerCase()}`}
                className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium transition ${
                  done
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-[#0e2a5e] hover:ring-blue-200"
                }`}
              >
                {c.id}
                {done ? " ✓" : ""}
              </Link>
            );
          })}
          {readyCases.length > 6 && (
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] text-slate-400 ring-1 ring-slate-200">
              +{readyCases.length - 6}
            </span>
          )}
        </div>
      )}
      {caseIds.length === 0 && (
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
          暂无案例挂载此技能
        </p>
      )}
      {caseIds.length > 0 && readyCases.length === 0 && (
        <p className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
          {caseIds.length} 个关联案例正文待导入
        </p>
      )}
    </div>
  );
}
