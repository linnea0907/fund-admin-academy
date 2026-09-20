"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  CANDIDATE_CONFIDENCES,
  getCandidateConfidence,
  type CandidateConfidence,
  type TermCandidate,
  type TermCandidatePool,
} from "@/types/term-candidates";
import {
  buildTermCompletionPackage,
  formatFoundDate,
  loadTermReviewState,
  saveTermReviewState,
  sourceTagsOf,
  withAdopted,
  withClearedAdopted,
  withIgnored,
  withRestored,
  withUnadopted,
  type TermReviewState,
} from "@/lib/term-review-store";

const BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-lg bg-[#0e2a5e] px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-[#143a75] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0e2a5e]";
const BTN_GHOST =
  "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700";

function chip(active: boolean, extra = ""): string {
  return `rounded-full px-3 py-1 text-xs font-semibold transition ${
    active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
  } ${extra}`;
}

/** 置信档筛选：三档 + 「高置信」合并档 + 全部（默认高置信，见下） */
type ConfFilter = "high" | "all" | CandidateConfidence;
type SourceFilter = "all" | "course" | "case";
/** 审核三态（V1.20.6：原「待审核 / 已发布」改为「待审核 / 已采纳 / 已忽略」） */
type Panel = "pending" | "adopted" | "ignored";

/** 「高置信」= 正文声明 + 缩写。V1.20.6 起默认只展示这一档，词组档按需查看。 */
const HIGH_CONF: CandidateConfidence[] = ["declared", "acronym"];

const PLACEHOLDER: Record<Panel, string> = {
  pending: "搜索候选术语…",
  adopted: "搜索已采纳术语…",
  ignored: "搜索已忽略术语…",
};

/**
 * 术语库 · 术语审核（V1.20.5 建立；V1.20.6 收敛）
 *
 * 「术语自动发现」的审核入口：构建期扫描全站课程 + 案例语料，把术语库里没有的
 * 专业术语收进候选池（`content/glossary/candidates.json`），在本面板逐条审核。
 *
 * ## 职责边界（V1.20.6 定稿：系统负责发现，AI 负责内容）
 * 本面板只做三件事：**发现 → 审核（采纳 / 忽略）→ 导出补全包**。
 * `definition` / `whyImportant` / `commonMistakes` 等**内容生产**不在本页发生，
 * 由 Copilot 依据补全包批量撰写后再落库 —— 避免站内出现两个内容来源。
 * 因此本页不展示、也不编辑术语正文；「已发布术语」视图已于 V1.20.6 删除
 * （与「术语列表」页签重复，按 Subtraction First 移除）。
 *
 * ## 为什么落在术语库页签
 * 需求明确「不新增独立导航模块」。术语库页本就已有「术语列表 / 健康度 Dashboard」
 * 双页签（V1.15.2 迁入），审核作为第三页签是同一模式的延续。
 *
 * ## 首帧安全性（重要）
 * 本面板**只在用户点开页签后挂载**（默认页签是「术语列表」），因此初始 render
 * 可以惰性读 localStorage —— 与 `GlossaryHealthPanel` 同一约定，不会产生
 * 「服务端空态 vs 客户端数据」的 hydration 不一致（React #418）。
 * ⚠️ 若日后把本页签改为**默认页签**，必须改成「首帧恒默认态 + 挂载后回读」。
 *
 * ## 审核动作与落库链路
 * 静态站浏览器无法改写源码，因此：
 *   忽略 / 采纳 → 本机 localStorage（只记归一 key）
 *   采纳 → 导出「术语补全包」→ Copilot 补全字段 → 落到 `content/glossary/imported.json`
 *        → `npm run gen:glossary`（prebuild 自动执行）→ 经闸门校验 → 全站生效。
 */
export default function TermReviewPanel({ pool }: { pool: TermCandidatePool }) {
  // 面板仅在页签点击后挂载 → 首帧即可安全读 localStorage（见上方约定）
  const [review, setReview] = useState<TermReviewState>(() => loadTermReviewState());
  const [panel, setPanel] = useState<Panel>("pending");
  const [query, setQuery] = useState("");
  // V1.20.6：默认只看高置信（正文声明 + 缩写）；词组档需显式切换，避免噪声淹没审核队列
  const [conf, setConf] = useState<ConfFilter>("high");
  const [source, setSource] = useState<SourceFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [packOpen, setPackOpen] = useState(false);

  const candidates = pool.candidates;
  const byKey = useMemo(() => new Map(candidates.map((c) => [c.key, c])), [candidates]);

  const ignoredSet = useMemo(() => new Set(review.ignored), [review.ignored]);
  const adoptedSet = useMemo(() => new Set(review.adopted.map((a) => a.key)), [review.adopted]);

  /** 统一写盘：所有变更都走这里，避免读写竞态；时间戳由 store 的迁移函数负责 */
  const commit = (next: TermReviewState) => {
    setReview(next);
    saveTermReviewState(next);
  };

  const ignore = (key: string) => commit(withIgnored(review, key));
  const restore = (key: string) => commit(withRestored(review, key));
  const adopt = (c: TermCandidate) => commit(withAdopted(review, { key: c.key, text: c.text }));
  const unadopt = (key: string) => commit(withUnadopted(review, key));

  const q = query.trim().toLowerCase();

  /* ---------------- 待审核（三态互斥：未忽略且未采纳） ---------------- */
  /** 未处理集合（不含筛选条件），与列表筛选解耦 —— 计数只认它，避免受当前筛选影响 */
  const pendingAll = useMemo(
    () => candidates.filter((c) => !ignoredSet.has(c.key) && !adoptedSet.has(c.key)),
    [candidates, ignoredSet, adoptedSet]
  );

  const pending = useMemo(() => {
    return pendingAll.filter((c) => {
      if (conf === "high") {
        if (!HIGH_CONF.includes(c.confidence)) return false;
      } else if (conf !== "all" && c.confidence !== conf) {
        return false;
      }
      if (source !== "all" && !c.samples.some((s) => s.kind === source)) return false;
      if (q && !c.text.toLowerCase().includes(q) && !c.key.includes(q)) return false;
      return true;
    });
  }, [pendingAll, q, conf, source]);

  /* ---------------- 已采纳（按采纳时间倒序；含已从候选池消失的历史记录） ---------------- */
  const adoptedRows = useMemo(
    () =>
      review.adopted
        .slice()
        .sort((a, b) => b.adoptedAt - a.adoptedAt)
        .map((a) => ({ record: a, candidate: byKey.get(a.key) ?? null }))
        .filter(({ record, candidate }) => {
          if (!q) return true;
          const text = (candidate?.text ?? record.text).toLowerCase();
          return text.includes(q) || record.key.includes(q);
        }),
    [review.adopted, byKey, q]
  );

  /* ---------------- 已忽略（池内按候选池顺序，池外追加在后） ---------------- */
  const ignoredRows = useMemo(() => {
    const inPool = candidates.filter((c) => ignoredSet.has(c.key));
    const outPool = review.ignored.filter((k) => !byKey.has(k));
    const rows: { key: string; text: string; candidate: TermCandidate | null }[] = [
      ...inPool.map((c) => ({ key: c.key, text: c.text, candidate: c as TermCandidate | null })),
      ...outPool.map((k) => ({ key: k, text: k, candidate: null })),
    ];
    if (!q) return rows;
    return rows.filter((r) => r.text.toLowerCase().includes(q) || r.key.includes(q));
  }, [candidates, ignoredSet, review.ignored, byKey, q]);

  /* ---------------- 计数（三态互斥；池外历史记录不计入待审核） ---------------- */
  const total = candidates.length;
  const pendingCount = pendingAll.length;
  const highConf = useMemo(
    () => candidates.filter((c) => HIGH_CONF.includes(c.confidence)).length,
    [candidates]
  );
  const confCount = (k: CandidateConfidence) => candidates.filter((c) => c.confidence === k).length;

  return (
    <div className="space-y-5">
      {/* 扫描口径说明（唯一不重复的信息块：语料规模 + 术语库基线） */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-bold text-slate-800">术语自动发现</h2>
          <span className="rounded-full bg-[#0e2a5e]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#0e2a5e]">
            构建期扫描
          </span>
          {pool.generatedAt && (
            <span className="text-[11px] text-slate-400">
              最近扫描 {formatFoundDate(pool.generatedAt)}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-4xl text-xs leading-relaxed text-slate-500">
          每次构建都会扫描全部课程（含选修）与案例正文，把<b className="text-slate-600">术语库中不存在</b>
          的专业术语收进候选池。已识别片段由站内同一套术语引擎挖空，因此不会收录术语库里已有的词。
          候选<b className="text-slate-600">只发现英文与缩写</b>；中文术语不做自动发现（无词典兜底，误报率不可控）。
        </p>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-slate-500">
          <div className="flex gap-1.5">
            <dt className="text-slate-400">语料</dt>
            <dd className="font-semibold tabular-nums text-slate-700">
              {pool.baseline.documents} 篇
              <span className="ml-1 font-normal text-slate-400">
                （课程 {pool.baseline.courses} / 案例 {pool.baseline.cases}）
              </span>
            </dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="text-slate-400">术语库基线</dt>
            <dd className="font-semibold tabular-nums text-slate-700">{pool.baseline.glossaryTerms} 条</dd>
          </div>
        </dl>
      </section>

      {/* 分段（三态）+ 搜索 + 全局动作 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <SegButton
            active={panel === "pending"}
            onClick={() => setPanel("pending")}
            label="待审核"
            count={pendingCount}
            testId="pending"
          />
          <SegButton
            active={panel === "adopted"}
            onClick={() => setPanel("adopted")}
            label="已采纳"
            count={review.adopted.length}
            testId="adopted"
          />
          <SegButton
            active={panel === "ignored"}
            onClick={() => setPanel("ignored")}
            label="已忽略"
            count={review.ignored.length}
            testId="ignored"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={PLACEHOLDER[panel]}
              className="w-56 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/15"
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </span>
          </div>
          {/* 全局动作：不论当前在哪个分段都可导出；无已采纳项时不出现（不做 disable 占位） */}
          {review.adopted.length > 0 && (
            <button type="button" data-package-open onClick={() => setPackOpen(true)} className={BTN_PRIMARY}>
              生成术语补全包
            </button>
          )}
        </div>
      </div>

      {panel === "pending" ? (
        <>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">置信档</span>
            <button
              type="button"
              data-conf-filter="high"
              onClick={() => setConf("high")}
              className={chip(conf === "high")}
              title="正文声明 + 缩写（高置信，默认）"
            >
              高置信 {highConf}
            </button>
            <button
              type="button"
              data-conf-filter="all"
              onClick={() => setConf("all")}
              className={chip(conf === "all")}
            >
              全部 {total}
            </button>
            <span className="mx-1 h-4 w-px bg-slate-200" />
            {CANDIDATE_CONFIDENCES.map((d) => (
              <button
                key={d.id}
                type="button"
                data-conf-filter={d.id}
                onClick={() => setConf(d.id)}
                className={chip(conf === d.id)}
                title={d.rule}
              >
                {d.label} {confCount(d.id)}
              </button>
            ))}
            <span className="mx-1 h-4 w-px bg-slate-200" />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">来源</span>
            <button
              type="button"
              data-source-filter="all"
              onClick={() => setSource("all")}
              className={chip(source === "all")}
            >
              全部
            </button>
            <button
              type="button"
              data-source-filter="course"
              onClick={() => setSource("course")}
              className={chip(source === "course")}
            >
              课程
            </button>
            <button
              type="button"
              data-source-filter="case"
              onClick={() => setSource("case")}
              className={chip(source === "case")}
            >
              案例
            </button>
            {/* 消歧：分段徽标是「状态总数」，列表受筛选收窄 —— 两个数字都要能看见 */}
            <span data-count-hint className="ml-auto text-[11px] text-slate-400">
              显示 <b className="tabular-nums text-slate-600">{pending.length}</b> / 共{" "}
              <b className="tabular-nums text-slate-600">{pendingAll.length}</b>
            </span>
          </div>

          {pending.length === 0 ? (
            <EmptyHint panel="pending" hasCandidates={total > 0} conf={conf} />
          ) : (
            <ul className="space-y-2.5">
              {pending.map((c) => {
                const def = getCandidateConfidence(c.confidence);
                const isOpen = expanded === c.key;
                const tags = sourceTagsOf(c);
                return (
                  <li
                    key={c.key}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition"
                    data-candidate={c.key}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-bold text-slate-800">{c.text}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${def.tint}`}
                            title={def.rule}
                          >
                            {def.label}
                          </span>
                          <span className="text-[11px] tabular-nums text-slate-400">
                            {c.docs} 篇 · {c.count} 次
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                          <span className="flex flex-wrap items-center gap-1">
                            <span className="text-slate-400">来源</span>
                            {tags.length === 0 && <span className="text-slate-400">—</span>}
                            {tags.slice(0, 3).map((t) => (
                              <Link
                                key={t.text}
                                href={t.href}
                                className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-200 hover:text-[#0e2a5e]"
                              >
                                {t.text}
                              </Link>
                            ))}
                            {tags.length > 3 && (
                              <span className="text-slate-400">+{tags.length - 3}</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="text-slate-400">发现时间</span>
                            <b className="font-semibold tabular-nums text-slate-600">
                              {formatFoundDate(c.firstSeenAt)}
                            </b>
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button type="button" onClick={() => adopt(c)} className={BTN_PRIMARY}>
                          导入术语库
                        </button>
                        <button type="button" onClick={() => ignore(c.key)} className={BTN_GHOST}>
                          忽略
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpanded(isOpen ? null : c.key)}
                          aria-expanded={isOpen}
                          className={BTN_GHOST}
                        >
                          {isOpen ? "收起上下文" : "看上下文"}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                        {c.samples.length === 0 && (
                          <li className="text-[11px] text-slate-400">无上下文摘录</li>
                        )}
                        {c.samples.map((s, i) => (
                          <li key={`${s.label}-${i}`} className="text-[12px] leading-relaxed">
                            <Link href={s.href} className="font-semibold text-[#0e2a5e] hover:underline">
                              {s.label}
                            </Link>
                            <p className="mt-0.5 text-slate-500">{s.context}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : panel === "adopted" ? (
        <>
          {review.adopted.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
              <p className="text-xs leading-relaxed text-amber-900">
                已采纳 <b className="tabular-nums">{review.adopted.length}</b> 个术语。导出补全包 →
                交给 Copilot 撰写定义类内容 → 落到{" "}
                <code className="rounded bg-white/70 px-1">content/glossary/imported.json</code>
                → 下次构建经闸门校验后全站生效。
              </p>
              <button
                type="button"
                onClick={() => commit(withClearedAdopted(review))}
                className={`${BTN_GHOST} shrink-0`}
              >
                清空已采纳
              </button>
            </div>
          )}
          {adoptedRows.length === 0 ? (
            <EmptyHint panel="adopted" hasCandidates={total > 0} conf={conf} />
          ) : (
            <ul className="space-y-2.5">
              {adoptedRows.map(({ record, candidate }) => (
                <li
                  key={record.key}
                  className="rounded-2xl border border-amber-200 bg-white p-4 shadow-sm ring-1 ring-amber-50"
                  data-adopted={record.key}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold text-slate-800">
                          {candidate?.text ?? record.text}
                        </span>
                        {candidate ? (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                              getCandidateConfidence(candidate.confidence).tint
                            }`}
                          >
                            {getCandidateConfidence(candidate.confidence).label}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                            已不在候选池
                          </span>
                        )}
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          待补全
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                        {candidate && (
                          <span className="flex flex-wrap items-center gap-1">
                            <span className="text-slate-400">来源</span>
                            {sourceTagsOf(candidate).slice(0, 3).map((t) => (
                              <Link
                                key={t.text}
                                href={t.href}
                                className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-200 hover:text-[#0e2a5e]"
                              >
                                {t.text}
                              </Link>
                            ))}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="text-slate-400">采纳时间</span>
                          <b className="font-semibold tabular-nums text-slate-600">
                            {formatFoundDate(new Date(record.adoptedAt).toISOString())}
                          </b>
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button type="button" onClick={() => unadopt(record.key)} className={BTN_GHOST}>
                        取消采纳
                      </button>
                      {candidate && (
                        <button
                          type="button"
                          onClick={() => setExpanded(expanded === record.key ? null : record.key)}
                          aria-expanded={expanded === record.key}
                          className={BTN_GHOST}
                        >
                          {expanded === record.key ? "收起上下文" : "看上下文"}
                        </button>
                      )}
                    </div>
                  </div>
                  {candidate && expanded === record.key && <ContextList candidate={candidate} />}
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          {ignoredRows.length === 0 ? (
            <EmptyHint panel="ignored" hasCandidates={total > 0} conf={conf} />
          ) : (
            <ul className="space-y-2.5">
              {ignoredRows.map(({ key, text, candidate }) => (
                <li
                  key={key}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  data-ignored={key}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[15px] font-bold text-slate-500">{text}</span>
                        {candidate && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
                              getCandidateConfidence(candidate.confidence).tint
                            }`}
                          >
                            {getCandidateConfidence(candidate.confidence).label}
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          已忽略
                        </span>
                      </div>
                      {candidate && (
                        <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
                          <span className="text-slate-400">来源</span>
                          {sourceTagsOf(candidate).slice(0, 3).map((t) => (
                            <Link
                              key={t.text}
                              href={t.href}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600 transition hover:bg-slate-200 hover:text-[#0e2a5e]"
                            >
                              {t.text}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => restore(key)} className={BTN_PRIMARY}>
                      恢复
                    </button>
                  </div>
                  {candidate && expanded === key && <ContextList candidate={candidate} />}
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {packOpen && (
        <PackageModal adopted={review.adopted} byKey={byKey} onClose={() => setPackOpen(false)} />
      )}
    </div>
  );
}

/* ================= 上下文摘录 ================= */

function ContextList({ candidate }: { candidate: TermCandidate }) {
  return (
    <ul className="mt-3 space-y-2 border-t border-slate-100 pt-3">
      {candidate.samples.length === 0 && <li className="text-[11px] text-slate-400">无上下文摘录</li>}
      {candidate.samples.map((s, i) => (
        <li key={`${s.label}-${i}`} className="text-[12px] leading-relaxed">
          <Link href={s.href} className="font-semibold text-[#0e2a5e] hover:underline">
            {s.label}
          </Link>
          <p className="mt-0.5 text-slate-500">{s.context}</p>
        </li>
      ))}
    </ul>
  );
}

/* ================= 补全包弹窗 ================= */

function PackageModal({
  adopted,
  byKey,
  onClose,
}: {
  adopted: TermReviewState["adopted"];
  byKey: Map<string, TermCandidate>;
  onClose: () => void;
}) {
  const text = useMemo(() => buildTermCompletionPackage(adopted, byKey), [adopted, byKey]);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const doCopy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = fallbackCopy(text);
    }
    if (ok) {
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 2600);
    } else {
      setCopyFailed(true);
    }
  };

  return (
    <ModalShell onClose={onClose} label="生成术语补全包">
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-slate-500">
          已将 <b className="text-[#0e2a5e]">{adopted.length}</b> 个已采纳术语拼装为补全提示词，
          其中<b className="text-slate-600">系统可确定的部分已预填真值</b>（id / 中英文名 / 关联课程·案例），
          其余字段列出受控枚举待补。复制后交给 Copilot 批量撰写，产出{" "}
          <code className="rounded bg-slate-100 px-1">content/glossary/imported.json</code>
          ；落到仓库后下次构建即经闸门校验并全站生效。
        </p>
        <textarea
          readOnly
          data-package-text
          value={text}
          onFocus={(e) => e.currentTarget.select()}
          spellCheck={false}
          className="thin-scroll h-72 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-[12.5px] leading-5 text-slate-700 outline-none transition focus:border-[#0e2a5e] lg:h-80"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">
            含受控枚举清单与「不写时效性内容」硬规矩，可直接使用
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
            >
              关闭
            </button>
            <button type="button" onClick={doCopy} className={BTN_PRIMARY}>
              {copied ? "已复制到剪贴板" : copyFailed ? "复制失败，请手动选择复制" : "复制到剪贴板"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/** 通用弹窗外壳（与案例工坊同款交互：Esc / 遮罩可关） */
function ModalShell({
  children,
  onClose,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">{label}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ================= 子组件 ================= */

function SegButton({
  active,
  onClick,
  label,
  count,
  testId,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-panel={testId}
      aria-current={active ? "page" : undefined}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-[#0e2a5e] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-px text-[10px] font-bold tabular-nums ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyHint({
  panel,
  hasCandidates,
  conf,
}: {
  panel: Panel;
  hasCandidates: boolean;
  conf: ConfFilter;
}) {
  const CONF_LABEL: Record<ConfFilter, string> = {
    high: "高置信",
    all: "全部候选",
    declared: "正文声明",
    acronym: "缩写",
    phrase: "词组",
  };
  const title =
    panel === "adopted"
      ? "还没有采纳任何候选"
      : panel === "ignored"
        ? "没有已忽略的候选"
        : !hasCandidates
          ? "候选池为空"
          : conf === "high"
            ? "当前没有高置信候选"
            : "当前筛选下没有候选";

  const desc =
    panel === "adopted"
      ? "在「待审核」里点【导入术语库】即可采纳；采纳后在此导出术语补全包。"
      : panel === "ignored"
        ? "你在本机【忽略】过的候选会出现在这里，可随时恢复。"
        : !hasCandidates
          ? "候选池由构建期扫描生成。确认本机跑过一次 npm run scan:terms（或 npm run build）后重试。"
          : conf === "high"
            ? "高置信档（正文声明 + 缩写）已清空；切到【全部】或【词组】可继续审核低置信候选。"
            : `当前筛选档为「${CONF_LABEL[conf]}」。换个置信档 / 来源筛选，或清空搜索词试试。`;

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <p className="text-sm font-semibold text-slate-600">{title}</p>
      <p className="mx-auto mt-1.5 max-w-lg text-xs leading-relaxed text-slate-400">{desc}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/** 剪贴板兜底（http / 权限受限时用 execCommand） */
function fallbackCopy(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}
