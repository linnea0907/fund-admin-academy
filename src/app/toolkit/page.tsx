import type { Metadata } from "next";
import Link from "next/link";
import { AML_TOOLKIT, toolkitByKind } from "@/data/aml-toolkit";
import {
  TOOLKIT_KINDS,
  getToolkitKind,
  type AmlToolkitItem,
} from "@/types/aml-toolkit";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import { caseSlug, listCaseMetas } from "@/lib/cases";

export const metadata: Metadata = {
  title: "AML 实务工具包",
  description:
    "Fund Admin Wiki · AML 实务工具包：董事会 AML 监督清单、外包监督清单、制裁命中处置 SOP、AMLCO/MLRO/DMLRO 对比、CDD/EDD/SDD 对比。可直接拿来用的清单、流程与对照表。",
};

/* ---------------- 关联内容索引（术语 / 案例标题） ---------------- */

const TERM_LABEL = new Map(GLOSSARY_TERMS.map((t) => [t.id, t.term]));
const TERM_ZH = new Map(GLOSSARY_TERMS.map((t) => [t.id, t.zh]));
const CASE_TITLE = new Map(listCaseMetas().map((c) => [c.id, c.title]));

/* ---------------- 展示小块 ---------------- */

function KindChip({ kind }: { kind: AmlToolkitItem["kind"] }) {
  const def = getToolkitKind(kind);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ring-1 ${def.tint}`}
    >
      {def.label} · {def.zh}
    </span>
  );
}

function RelatedBlock({ item }: { item: AmlToolkitItem }) {
  const terms = item.relatedTerms ?? [];
  const cases = item.relatedCases ?? [];
  if (terms.length === 0 && cases.length === 0) return null;
  return (
    <div className="mt-5 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
      {terms.length > 0 && (
        <div>
          <p className="text-[11px] font-bold tracking-wide text-slate-400">
            相关术语
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {terms.map((id) => (
              <Link
                key={id}
                href={`/glossary/${id}`}
                className="rounded-lg bg-slate-50 px-2.5 py-1 text-[11.5px] font-medium text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
                title={TERM_ZH.get(id) ?? id}
              >
                {TERM_LABEL.get(id) ?? id}
              </Link>
            ))}
          </div>
        </div>
      )}
      {cases.length > 0 && (
        <div>
          <p className="text-[11px] font-bold tracking-wide text-slate-400">
            相关案例
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {cases.map((id) => (
              <Link
                key={id}
                href={`/cases/${caseSlug(id)}`}
                className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11.5px] font-semibold text-amber-800 ring-1 ring-amber-200 transition hover:bg-amber-100"
                title={CASE_TITLE.get(id) ?? id}
              >
                {id}
                {CASE_TITLE.get(id) ? ` · ${CASE_TITLE.get(id)}` : ""}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Pitfalls({ item }: { item: AmlToolkitItem }) {
  if (!item.pitfalls || item.pitfalls.length === 0) return null;
  return (
    <div className="mt-5 rounded-xl bg-rose-50/60 px-4 py-3.5 ring-1 ring-rose-100">
      <p className="text-[11px] font-bold tracking-wide text-rose-700">
        常见误区
      </p>
      <ul className="mt-2 space-y-1.5">
        {item.pitfalls.map((p) => (
          <li key={p} className="flex gap-2 text-[13px] leading-relaxed text-rose-900">
            <span aria-hidden className="mt-[3px] shrink-0 text-rose-400">
              ✕
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- 三种形态的正文 ---------------- */

function ChecklistBody({ item }: { item: AmlToolkitItem }) {
  const sections = item.sections ?? [];
  return (
    <div className="mt-5 space-y-4">
      {sections.map((sec, si) => {
        // 全局连续编号（纯计算，不累积状态）
        const start = sections
          .slice(0, si)
          .reduce((n, s) => n + s.items.length, 0);
        return (
          <div key={sec.title}>
            <p className="text-[12.5px] font-bold text-[#0e2a5e]">
              {sec.zh}
              <span className="ml-2 font-medium text-slate-400">{sec.title}</span>
            </p>
            <ul className="mt-2 space-y-1.5">
              {sec.items.map((it, idx) => (
                <li
                  key={it}
                  className="flex gap-2.5 rounded-lg bg-slate-50/70 px-3 py-2 text-[13px] leading-relaxed text-slate-700"
                >
                  <span
                    aria-hidden
                    className="mt-[1px] shrink-0 text-[11px] font-bold tabular-nums text-slate-400"
                  >
                    {String(start + idx + 1).padStart(2, "0")}
                  </span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function SopBody({ item }: { item: AmlToolkitItem }) {
  return (
    <div className="mt-5">
      <ol className="space-y-2.5">
        {(item.steps ?? []).map((s, i) => (
          <li key={s.title} className="relative flex gap-3">
            <div className="flex flex-col items-center">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0e2a5e] text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {i < (item.steps ?? []).length - 1 && (
                <span aria-hidden className="mt-1 w-px flex-1 bg-slate-200" />
              )}
            </div>
            <div className="flex-1 pb-1">
              <p className="text-[13.5px] font-bold text-[#0e2a5e]">
                {s.zh}
                <span className="ml-2 text-[12px] font-medium text-slate-400">
                  {s.title}
                </span>
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                {s.detail}
              </p>
              {s.note && (
                <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[12px] leading-relaxed text-amber-900 ring-1 ring-amber-100">
                  {s.note}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {item.outcomes && item.outcomes.length > 0 && (
        <div className="mt-5">
          <p className="text-[11px] font-bold tracking-wide text-slate-400">
            核验结果与后续动作
          </p>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {item.outcomes.map((o, i) => (
              <div
                key={o.title}
                className={`rounded-xl px-4 py-3.5 ring-1 ${
                  i === 0
                    ? "bg-emerald-50/60 ring-emerald-100"
                    : "bg-rose-50/60 ring-rose-100"
                }`}
              >
                <p
                  className={`text-[12.5px] font-bold ${
                    i === 0 ? "text-emerald-800" : "text-rose-800"
                  }`}
                >
                  {o.zh}
                  <span className="ml-2 font-medium opacity-70">{o.title}</span>
                </p>
                <p
                  className={`mt-1.5 text-[12.5px] leading-relaxed ${
                    i === 0 ? "text-emerald-900" : "text-rose-900"
                  }`}
                >
                  {o.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ComparisonBody({ item }: { item: AmlToolkitItem }) {
  const cmp = item.comparison;
  if (!cmp) return null;
  return (
    <div className="mt-5">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-[12.5px]">
          <thead>
            <tr>
              <th className="w-[132px] rounded-tl-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-left font-bold text-slate-500">
                &nbsp;
              </th>
              {cmp.columns.map((c, i) => (
                <th
                  key={c}
                  className={`border border-l-0 border-slate-200 bg-[#0e2a5e]/5 px-3 py-2.5 text-left font-bold text-[#0e2a5e] ${
                    i === cmp.columns.length - 1 ? "rounded-tr-xl" : ""
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cmp.rows.map((r, ri) => (
              <tr key={r.label}>
                <th
                  className={`border border-t-0 border-slate-200 bg-slate-50 px-3 py-2.5 text-left align-top font-bold text-slate-500 ${
                    ri === cmp.rows.length - 1 ? "rounded-bl-xl" : ""
                  }`}
                >
                  {r.label}
                </th>
                {r.cells.map((cell, ci) => (
                  <td
                    key={`${r.label}-${ci}`}
                    className={`border border-l-0 border-t-0 border-slate-200 px-3 py-2.5 align-top leading-relaxed text-slate-700 ${
                      ri === cmp.rows.length - 1 && ci === r.cells.length - 1
                        ? "rounded-br-xl"
                        : ""
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cmp.reminders && cmp.reminders.length > 0 && (
        <div className="mt-4 rounded-xl bg-violet-50/60 px-4 py-3.5 ring-1 ring-violet-100">
          <p className="text-[11px] font-bold tracking-wide text-violet-700">
            重点提醒
          </p>
          <ul className="mt-2 space-y-1.5">
            {cmp.reminders.map((r) => (
              <li
                key={r}
                className="flex gap-2 text-[13px] leading-relaxed text-violet-900"
              >
                <span aria-hidden className="mt-[3px] shrink-0 text-violet-400">
                  ▸
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ---------------- 页面 ---------------- */

/** 知识检索 · AML 实务工具包（V1.15.0；静态渲染，无客户端状态） */
export default function ToolkitPage() {
  const groups = toolkitByKind();
  const counts = TOOLKIT_KINDS.map((k) => ({
    ...k,
    n: AML_TOOLKIT.filter((t) => t.kind === k.id).length,
  }));

  return (
    <div className="space-y-4">
      <nav aria-label="面包屑" className="flex items-center gap-1.5 text-xs text-slate-400">
        <Link
          href="/search"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          AML 实务工具包
        </span>
      </nav>

      {/* Hero */}
      <header className="rounded-2xl bg-gradient-to-br from-[#0e2a5e] to-[#173d7a] px-5 py-6 text-white sm:px-7 sm:py-7">
        <p className="text-[11px] font-bold tracking-widest text-amber-300">
          FUND ADMIN WIKI · TOOLKIT
        </p>
        <h1 className="mt-2 text-xl font-black tracking-tight sm:text-2xl">
          AML 实务工具包
        </h1>
        <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-blue-100/90">
          可直接拿来用的清单、处置流程与角色/流程对照表。
          术语回答「是什么」，工具包回答「怎么做、问哪些问题、下一步是什么」。
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {counts.map((c) => (
            <span
              key={c.id}
              className="rounded-full bg-white/10 px-3 py-1 text-[11.5px] font-semibold text-blue-50 ring-1 ring-white/15"
            >
              {c.label} · {c.zh} <span className="text-amber-300">{c.n}</span>
            </span>
          ))}
          <Link
            href="/search"
            className="rounded-full bg-amber-300 px-3 py-1 text-[11.5px] font-bold text-[#0e2a5e] transition hover:bg-amber-200"
          >
            在知识检索中搜索 →
          </Link>
        </div>
      </header>

      {/* 收录原则 */}
      <section className="rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-200">
        <p className="text-[11px] font-bold tracking-wide text-slate-500">
          收录原则
        </p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-600">
          ✅ 收录可复用的<strong className="font-semibold text-slate-700">清单、处置顺序与对比框架</strong>；
          ❌ 不收录<strong className="font-semibold text-slate-700">法规时间线、生效日期、罚款金额、个别执法案例数字</strong>
          —— 这类内容时效性强，会带来持续维护成本。
        </p>
      </section>

      {/* 分组渲染 */}
      {groups.map((g) => {
        const def = getToolkitKind(g.kind as AmlToolkitItem["kind"]);
        return (
          <section key={g.kind} className="space-y-3 pt-2">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[13px] font-black tracking-wide text-[#0e2a5e]">
                {def.label}
                <span className="ml-2 text-[12px] font-semibold text-slate-400">
                  {def.zh}
                </span>
              </h2>
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold tabular-nums text-slate-400">
                {g.items.length}
              </span>
            </div>

            {g.items.map((item) => (
              <article
                key={item.id}
                id={item.id}
                className="scroll-mt-24 rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200 sm:px-6"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <KindChip kind={item.kind} />
                  <span className="font-mono text-[10.5px] text-slate-300">
                    #{item.id}
                  </span>
                </div>

                <h3 className="mt-2.5 text-[15.5px] font-bold text-[#0e2a5e]">
                  {item.zh}
                  <span className="ml-2 text-[13px] font-semibold text-slate-400">
                    {item.title}
                  </span>
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-slate-600">
                  {item.summary}
                </p>
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-slate-600">
                  <strong className="font-semibold text-slate-500">什么时候用：</strong>
                  {item.purpose}
                </p>

                {item.kind === "checklist" && <ChecklistBody item={item} />}
                {item.kind === "sop" && <SopBody item={item} />}
                {item.kind === "comparison" && <ComparisonBody item={item} />}

                <Pitfalls item={item} />
                <RelatedBlock item={item} />

                <p className="mt-4 text-[11px] text-slate-400">
                  来源：{item.source}
                </p>
              </article>
            ))}
          </section>
        );
      })}

      <p className="pt-1 text-center text-[11px] text-slate-400">
        工具包内容为内部实务整理，实施前请核对最新官方版本。
      </p>
    </div>
  );
}
