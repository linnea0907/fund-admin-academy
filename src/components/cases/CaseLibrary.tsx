"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CaseMeta, CaseModuleId } from "@/types";
import {
  CASE_DOMAINS,
  getCaseDomain,
  domainOfAbility,
  caseInDomain,
  LEVEL_OPTIONS,
  LEVEL_KEY_LABEL,
  levelBucket,
  STATUS_OPTIONS,
  caseLearnStatus,
  type CaseDomainId,
  type CaseStatusKey,
  type LevelKey,
} from "@/lib/case-filter";
import { CASE_MODULES } from "@/lib/case-modules";
import {
  CASE_JURISDICTIONS,
  CASE_ENTITY_TYPES,
  CASE_TOPICS,
  jurisdictionMeta,
  entityTypeMeta,
  topicMeta,
} from "@/lib/case-categories";
import { useAcademy } from "@/hooks/use-academy";
import CaseCard from "./CaseCard";

/** 筛选行标签最小宽度 */
const ROW_LABEL = "mr-1 w-13 shrink-0 text-xs font-semibold text-slate-400";

/** 统一 chip 样式（V1.8.2 紧凑：py-1；minimal：激活深蓝 / 未激活浅灰） */
function chip(active: boolean, extra = ""): string {
  return `rounded-full px-3 py-1 text-xs font-semibold transition ${
    active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
  } ${extra}`;
}

/** 技能行折叠按钮样式（虚线描边，弱化；与主筛选 chips 区分） */
const SKILL_TOGGLE =
  "rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-[#0e2a5e] hover:text-[#0e2a5e]";

/** 模块 chip 展示名：M1 文件审核实务 … */
function moduleChipLabel(id: CaseModuleId, zh: string): string {
  return `M${id} ${zh}`;
}

/** 解析 URL 筛选参数（合法值归一，非法返回 null/all） */
function readFilters(sp: URLSearchParams) {
  const area = getCaseDomain(sp.get("area"))?.id ?? null;
  const modRaw = sp.get("module");
  const mod =
    modRaw && /^[1-5]$/.test(modRaw) ? (Number(modRaw) as CaseModuleId) : null;
  const levelRaw = sp.get("level")?.trim() || null;
  const level =
    levelRaw && LEVEL_OPTIONS.some((o) => o.key === levelRaw)
      ? (levelRaw as LevelKey)
      : null;
  const statusRaw = sp.get("status");
  const status = (["all", "todo", "learning", "done"] as const).includes(
    statusRaw as CaseStatusKey
  )
    ? (statusRaw as CaseStatusKey)
    : "all";
  // V1.13.1 分类维度（受控清单内才接受）
  const jurisdictionRaw = sp.get("jurisdiction")?.trim() || null;
  const jurisdiction = (CASE_JURISDICTIONS as readonly string[]).includes(
    jurisdictionRaw ?? ""
  )
    ? jurisdictionRaw
    : null;
  const entityRaw = sp.get("entity")?.trim() || null;
  const entity = (CASE_ENTITY_TYPES as readonly string[]).includes(entityRaw ?? "")
    ? entityRaw
    : null;
  const topicRaw = sp.get("topic")?.trim() || null;
  const topic = (CASE_TOPICS as readonly string[]).includes(topicRaw ?? "")
    ? topicRaw
    : null;
  return {
    mod,
    area,
    skill: sp.get("skill")?.trim() || null,
    level,
    tag: sp.get("tag")?.trim() || null,
    status,
    jurisdiction,
    entity,
    topic,
  };
}

function sortZh(vals: string[]): string[] {
  return Array.from(vals).sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));
}

/** 案例库目录（V1.8.2 筛选区重构）：
 *  首屏行顺序固定 模块 → 业务领域 → 技能（默认折叠，点击「展开技能（N）」）→ 难度；
 *  状态与标签收纳进默认折叠的「高级筛选」。全部维度写回 URL，可分享可回退。
 *  业务域维持 5 类（KYC & Onboarding / AML & Compliance / Fund Structure /
 *  Fund Documents / Client Communication，结构与名称本轮不动）。 */
export default function CaseLibrary({ cases }: { cases: CaseMeta[] }) {
  const { state } = useAcademy();
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const raw = readFilters(sp);

  // 深链带高级条件（状态/标签）时默认展开高级筛选
  const [showAdvanced, setShowAdvanced] = useState(
    () => raw.status !== "all" || raw.tag !== null
  );
  // 技能行折叠控制：默认收起；深链已带 skill 时默认展开以高亮所选
  const [showSkills, setShowSkills] = useState(() => raw.skill !== null);

  const doneIds = useMemo(
    () => new Set(state.completedCases.filter((c) => c.startsWith("Case-"))),
    [state.completedCases]
  );
  const startedIds = useMemo(
    () => new Set(state.startedCases.filter((c) => c.startsWith("Case-"))),
    [state.startedCases]
  );

  /* ---------- 有效筛选条件（含失效保护） ---------- */

  // 业务域：URL 有值则用；深链 /cases?skill=X 时按技能自动归属域
  const areaDef = useMemo(() => {
    if (raw.area) return getCaseDomain(raw.area);
    if (raw.skill) return domainOfAbility(raw.skill);
    return null;
  }, [raw.area, raw.skill]);

  // 域内技能（仅接受该域清单内的技能；无域时仅接受真实存在的技能作为自由筛选）
  const shownSkill = useMemo(() => {
    if (!raw.skill) return null;
    if (areaDef) return areaDef.skills.includes(raw.skill) ? raw.skill : null;
    return cases.some((c) => c.skills.includes(raw.skill!)) ? raw.skill : null;
  }, [raw.skill, areaDef, cases]);

  // 模块 / 难度 / 标签 / 状态
  const shownModule = raw.mod;
  const shownLevel = raw.level;
  const tagsInUse = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of cases) for (const t of c.tags) m.set(t, (m.get(t) ?? 0) + 1);
    return sortZh(Array.from(m.keys())).map((t) => ({ tag: t, count: m.get(t)! }));
  }, [cases]);
  const shownTag = raw.tag && tagsInUse.some((x) => x.tag === raw.tag) ? raw.tag : null;

  const update = (
    patch: Partial<{
      module: CaseModuleId | null;
      area: CaseDomainId | null;
      skill: string | null;
      level: LevelKey | null;
      tag: string | null;
      status: CaseStatusKey | null;
      jurisdiction: string | null;
      entity: string | null;
      topic: string | null;
    }>
  ) => {
    const p = new URLSearchParams(sp.toString());
    (Object.entries(patch) as [string, unknown][]).forEach(([k, v]) => {
      if (v === null || v === "" || v === "all") p.delete(k);
      else p.set(k, String(v));
    });
    const q = p.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  };

  /* ---------- 统计 ---------- */
  const readyTotal = cases.filter((c) => c.ready).length;
  const doneTotal = cases.filter((c) => c.ready && doneIds.has(c.id)).length;
  const startedTotal = cases.filter(
    (c) => c.ready && startedIds.has(c.id) && !doneIds.has(c.id)
  ).length;
  const todoTotal = readyTotal - startedTotal - doneTotal;
  const progress = readyTotal === 0 ? 0 : Math.round((doneTotal / readyTotal) * 100);

  const moduleCounts = useMemo(() => {
    const m = new Map<CaseModuleId, number>();
    for (const mod of CASE_MODULES) {
      m.set(mod.id, cases.filter((c) => c.module === mod.id).length);
    }
    return m;
  }, [cases]);

  const domainCounts = useMemo(() => {
    const m = new Map<CaseDomainId, number>();
    for (const d of CASE_DOMAINS) {
      m.set(d.id, cases.filter((c) => caseInDomain(c, d)).length);
    }
    return m;
  }, [cases]);

  /* V1.13.1 分类维度计数 */
  const jurisdictionCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const j of CASE_JURISDICTIONS)
      m.set(j, cases.filter((c) => c.jurisdiction.includes(j)).length);
    return m;
  }, [cases]);
  const entityCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of CASE_ENTITY_TYPES)
      m.set(e, cases.filter((c) => c.entityType === e).length);
    return m;
  }, [cases]);
  const topicCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of CASE_TOPICS)
      m.set(t, cases.filter((c) => c.topics.includes(t)).length);
    return m;
  }, [cases]);

  const statusCounts: Record<CaseStatusKey, number> = {
    all: cases.length,
    todo: todoTotal,
    learning: startedTotal,
    done: doneTotal,
  };

  /* ---------- 结果过滤 ---------- */
  const filtered = cases.filter((c) => {
    if (shownModule && c.module !== shownModule) return false;
    if (areaDef && !caseInDomain(c, areaDef)) return false;
    if (shownSkill && !c.skills.includes(shownSkill)) return false;
    if (shownLevel && levelBucket(c.level) !== shownLevel) return false;
    if (shownTag && !c.tags.includes(shownTag)) return false;
    // V1.13.1 分类维度（组合 AND）
    if (raw.jurisdiction && !c.jurisdiction.includes(raw.jurisdiction)) return false;
    if (raw.entity && c.entityType !== raw.entity) return false;
    if (raw.topic && !c.topics.includes(raw.topic)) return false;
    if (raw.status !== "all") {
      const st = caseLearnStatus(c, startedIds.has(c.id), doneIds.has(c.id));
      if (st !== raw.status) return false;
    }
    return true;
  });

  const statusActive = raw.status !== "all";
  const hasActive =
    shownModule !== null ||
    areaDef !== null ||
    shownSkill !== null ||
    shownLevel !== null ||
    shownTag !== null ||
    statusActive ||
    raw.jurisdiction !== null ||
    raw.entity !== null ||
    raw.topic !== null;

  const statusLabel = (k: CaseStatusKey) =>
    STATUS_OPTIONS.find((o) => o.key === k)?.label ?? "";

  const setModule = (id: CaseModuleId | null) => update({ module: id });
  const setArea = (id: CaseDomainId | null) => {
    // 切换业务域后技能行回到折叠态
    setShowSkills(false);
    update({ area: id, skill: null });
  };
  const setSkill = (s: string | null) =>
    update(areaDef ? { area: areaDef.id, skill: s } : { skill: s });
  const setJurisdiction = (j: string | null) => update({ jurisdiction: j });
  const setEntity = (e: string | null) => update({ entity: e });
  const setTopic = (t: string | null) => update({ topic: t });

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
      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 sm:p-4">
        {/* 行 1 · 属地 Jurisdiction（V1.13.1 核心分类，置顶首行） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>属地</span>
          <button
            type="button"
            onClick={() => setJurisdiction(null)}
            className={chip(raw.jurisdiction === null)}
            title="查看全部司法管辖区"
          >
            📍 全部
          </button>
          {CASE_JURISDICTIONS.map((j) => {
            const active = raw.jurisdiction === j;
            return (
              <button
                key={j}
                type="button"
                title={`适用规则来源：${j}（${jurisdictionCounts.get(j) ?? 0} 例）`}
                onClick={() => setJurisdiction(active ? null : j)}
                className={chip(active)}
              >
                {j}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {jurisdictionCounts.get(j) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 行 2 · 模块（一级分类 Module 1~5） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>模块</span>
          <button
            type="button"
            onClick={() => setModule(null)}
            className={chip(shownModule === null)}
            title="查看全部模块"
          >
            全部
          </button>
          {CASE_MODULES.map((m) => {
            const active = shownModule === m.id;
            return (
              <button
                key={m.id}
                type="button"
                title={`${m.title} · ${m.zh}`}
                onClick={() => setModule(active ? null : m.id)}
                className={chip(active)}
              >
                {moduleChipLabel(m.id, m.zh)}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {moduleCounts.get(m.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 行 2 · 业务领域（合并后 5 类） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>业务</span>
          <button
            type="button"
            onClick={() => setArea(null)}
            className={chip(areaDef === null)}
            title="查看全部业务领域"
          >
            全部
          </button>
          {CASE_DOMAINS.map((d) => {
            const active = areaDef?.id === d.id;
            return (
              <button
                key={d.id}
                type="button"
                title={`${d.label} · ${d.zh} · ${domainCounts.get(d.id) ?? 0} 例`}
                onClick={() => setArea(active ? null : d.id)}
                className={chip(active)}
              >
                {d.label}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {domainCounts.get(d.id) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 行 3 · 技能（选中业务域后出现，默认折叠为「展开技能（N）」） */}
        {areaDef && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={ROW_LABEL}>技能</span>
            {!showSkills ? (
              <button
                type="button"
                onClick={() => setShowSkills(true)}
                className={SKILL_TOGGLE}
                title={`展开 ${areaDef.label} 的 ${areaDef.skills.length} 项技能`}
                aria-expanded={false}
              >
                ▸ 展开技能（{areaDef.skills.length}）
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setSkill(null)}
                  className={chip(shownSkill === null)}
                >
                  本域全部
                </button>
                {areaDef.skills.map((s) => {
                  const active = shownSkill === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      title={`${areaDef.label} · ${s}`}
                      onClick={() => setSkill(active ? null : s)}
                      className={chip(active)}
                    >
                      {s}
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setShowSkills(false)}
                  className={SKILL_TOGGLE}
                  aria-expanded={true}
                >
                  ▾ 收起
                </button>
              </>
            )}
          </div>
        )}

        {/* 行 4 · 难度（归一：基础 / 进阶 / 高级） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>难度</span>
          {LEVEL_OPTIONS.map((o) => {
            const active = shownLevel === o.key;
            return (
              <button
                key={o.key ?? "all"}
                type="button"
                onClick={() => update({ level: active ? null : o.key })}
                className={chip(active)}
              >
                {o.label}
              </button>
            );
          })}
        </div>

        {/* 行 5 · 实体类型（V1.13.1） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>实体</span>
          <button
            type="button"
            onClick={() => setEntity(null)}
            className={chip(raw.entity === null)}
            title="查看全部实体类型"
          >
            👤 全部
          </button>
          {CASE_ENTITY_TYPES.map((e) => {
            const active = raw.entity === e;
            return (
              <button
                key={e}
                type="button"
                title={`实体类型：${e}（${entityCounts.get(e) ?? 0} 例）`}
                onClick={() => setEntity(active ? null : e)}
                className={chip(active)}
              >
                {e}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {entityCounts.get(e) ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* 行 6 · 知识主题（V1.13.1） */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>主题</span>
          <button
            type="button"
            onClick={() => setTopic(null)}
            className={chip(raw.topic === null)}
            title="查看全部知识主题"
          >
            🏷 全部
          </button>
          {CASE_TOPICS.map((t) => {
            const count = topicCounts.get(t) ?? 0;
            if (count === 0) return null;
            const active = raw.topic === t;
            return (
              <button
                key={t}
                type="button"
                title={`知识主题：${t}（${count} 例）`}
                onClick={() => setTopic(active ? null : t)}
                className={chip(active)}
              >
                {t}
                <span className={active ? "text-blue-200" : "text-slate-400"}>
                  {" "}
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 高级筛选（状态 + 标签，默认折叠） */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`flex w-full items-center justify-between px-3.5 py-2 text-xs font-semibold transition hover:text-[#0e2a5e] ${
              hasActive ? "text-[#0e2a5e]" : "text-slate-600"
            }`}
            aria-expanded={showAdvanced}
          >
            <span className="flex items-center gap-2">
              高级筛选
              {statusActive && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-[#0e2a5e]">
                  {statusLabel(raw.status)}
                </span>
              )}
              {shownTag && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  已选 #{shownTag}
                </span>
              )}
            </span>
            <span className="text-slate-400">{showAdvanced ? "收起 ▲" : "展开 ▼"}</span>
          </button>
          {showAdvanced && (
            <div className="space-y-3.5 border-t border-slate-100 px-3.5 pb-4 pt-3">
              {/* 状态 */}
              <div>
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
                  状态 · 学习进度
                </p>
                <div className="flex flex-wrap items-center gap-1.5">
                  {STATUS_OPTIONS.map((o) => {
                    const active = raw.status === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => update({ status: active ? "all" : o.key })}
                        className={chip(active)}
                      >
                        {o.label}
                        <span className={active ? "text-blue-200" : "text-slate-400"}>
                          {" "}
                          {statusCounts[o.key]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* 标签 */}
              <div className="border-t border-slate-100 pt-3.5">
                <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-slate-400">
                  标签 · Topics
                </p>
                {tagsInUse.length === 0 ? (
                  <p className="text-xs text-slate-300">暂无标签</p>
                ) : (
                  <div className="flex flex-wrap items-center gap-1.5">
                    {tagsInUse.map(({ tag, count }) => {
                      const active = shownTag === tag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => update({ tag: active ? null : tag })}
                          className={chip(active)}
                        >
                          #{tag}
                          <span className={active ? "text-blue-200" : "text-slate-400"}>
                            {" "}
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 当前筛选提示（可逐项移除） */}
      {hasActive && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="mr-1 font-semibold text-blue-900">
              {filtered.length} / {cases.length} 例
            </span>
            {shownModule && (
              <ActiveChip
                label={`M${shownModule}`}
                onClear={() => setModule(null)}
              />
            )}
            {areaDef && (
              <ActiveChip label={areaDef.label} onClear={() => setArea(null)} />
            )}
            {shownSkill && (
              <ActiveChip
                label={shownSkill}
                onClear={() => setSkill(null)}
                tone="emerald"
              />
            )}
            {shownLevel && (
              <ActiveChip
                label={LEVEL_KEY_LABEL[shownLevel]}
                onClear={() => update({ level: null })}
                tone="amber"
              />
            )}
            {shownTag && (
              <ActiveChip
                label={`#${shownTag}`}
                onClear={() => update({ tag: null })}
                tone="amber"
              />
            )}
            {raw.jurisdiction && (
              <ActiveChip
                label={jurisdictionMeta(raw.jurisdiction)}
                onClear={() => setJurisdiction(null)}
                tone="navy"
              />
            )}
            {raw.entity && (
              <ActiveChip
                label={entityTypeMeta(raw.entity)}
                onClear={() => setEntity(null)}
                tone="navy"
              />
            )}
            {raw.topic && (
              <ActiveChip
                label={topicMeta(raw.topic)}
                onClear={() => setTopic(null)}
                tone="navy"
              />
            )}
            {statusActive && (
              <ActiveChip
                label={statusLabel(raw.status)}
                onClear={() => update({ status: "all" })}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              update({
                module: null,
                area: null,
                skill: null,
                level: null,
                tag: null,
                status: "all",
                jurisdiction: null,
                entity: null,
                topic: null,
              })
            }
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
            可尝试清除部分筛选条件，或在「高级筛选」中调整状态与标签
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <CaseCard
              key={c.id}
              item={c}
              done={doneIds.has(c.id)}
              started={startedIds.has(c.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** 当前筛选条件小 chip（带移除按钮） */
function ActiveChip({
  label,
  onClear,
  tone = "navy",
}: {
  label: string;
  onClear: () => void;
  tone?: "navy" | "emerald" | "amber";
}) {
  const toneCls =
    tone === "emerald"
      ? "bg-emerald-100 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-100 text-amber-700"
        : "bg-[#0e2a5e]/10 text-[#0e2a5e]";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold ${toneCls}`}
    >
      {label}
      <button
        type="button"
        onClick={onClear}
        aria-label={`移除条件 ${label}`}
        className="rounded-full leading-none opacity-60 transition hover:opacity-100"
      >
        ✕
      </button>
    </span>
  );
}
