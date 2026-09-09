"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BACKLOG_STORAGE_KEY,
  SEED_SOURCES,
  SEED_STATUSES,
  buildCasePackageText,
  formatSeedDate,
  formatSeedId,
  loadSeeds,
  nextSeedNumber,
  saveSeeds,
  sourceLabel,
  statusLabel,
  type CaseSeed,
  type SeedSourceKey,
  type SeedStatusKey,
} from "@/lib/case-backlog";
import { CASE_MODULES } from "@/lib/case-modules";

/** 统一 chip（与案例库同款：激活深蓝 / 未激活浅灰） */
function chip(active: boolean, extra = ""): string {
  return `rounded-full px-3 py-1 text-xs font-semibold transition ${
    active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
  } ${extra}`;
}

const ROW_LABEL = "mr-1 w-13 shrink-0 text-xs font-semibold text-slate-400";

/** 状态 pill 配色（4 状态固定映射） */
const STATUS_PILL: Record<SeedStatusKey, string> = {
  triage: "bg-slate-100 text-slate-600",
  pending: "bg-[#0e2a5e]/10 text-[#0e2a5e]",
  generated: "bg-amber-100 text-amber-700",
  live: "bg-emerald-100 text-emerald-700",
};

const STATUS_TEXT: Record<SeedStatusKey, string> = {
  triage: "text-slate-500",
  pending: "text-[#0e2a5e]",
  generated: "text-amber-600",
  live: "text-emerald-600",
};

const BTN_PRIMARY =
  "inline-flex items-center gap-1.5 rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#143a75] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0e2a5e]";

/** Case Backlog V1.0 — 案例种子池
 *  采集 →（待整理/待生成）→ 勾选「生成案例包」复制给 Copilot → 批量改「已生成」→「已上线」 */
export default function CaseBacklog() {
  // 纯客户端页面（父层 ssr:false 动态加载），首帧即可安全读 localStorage
  const [seeds, setSeeds] = useState<CaseSeed[]>(() =>
    typeof window === "undefined" ? [] : loadSeeds()
  );
  const [statusFilter, setStatusFilter] = useState<SeedStatusKey | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<SeedSourceKey | "all">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [packageIds, setPackageIds] = useState<string[] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 任何变更即时落盘
  useEffect(() => {
    saveSeeds(seeds);
  }, [seeds]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 2200);
  };

  /* ---------- 派生统计 ---------- */
  const total = seeds.length;
  const statusCounts = useMemo(() => {
    const m: Record<SeedStatusKey, number> = {
      triage: 0,
      pending: 0,
      generated: 0,
      live: 0,
    };
    for (const s of seeds) m[s.status] += 1;
    return m;
  }, [seeds]);

  const sourceCounts = useMemo(() => {
    const m = new Map<SeedSourceKey, number>();
    for (const s of seeds) m.set(s.source, (m.get(s.source) ?? 0) + 1);
    return m;
  }, [seeds]);

  const filtered = useMemo(
    () =>
      seeds.filter(
        (s) =>
          (statusFilter === "all" || s.status === statusFilter) &&
          (sourceFilter === "all" || s.source === sourceFilter)
      ),
    [seeds, statusFilter, sourceFilter]
  );

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const pendingSelected = useMemo(
    () =>
      seeds
        .filter((s) => selectedSet.has(s.seedId) && s.status === "pending")
        .sort((a, b) => a.createdAt - b.createdAt),
    [seeds, selectedSet]
  );
  const allFilteredSelected =
    filtered.length > 0 && filtered.every((s) => selectedSet.has(s.seedId));

  /* ---------- 多选 ---------- */
  const toggleSelect = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleSelectAllVisible = () => {
    if (allFilteredSelected) {
      const keep = new Set(filtered.map((s) => s.seedId));
      setSelected((prev) => prev.filter((id) => !keep.has(id)));
    } else {
      setSelected((prev) => {
        const set = new Set(prev);
        for (const s of filtered) set.add(s.seedId);
        return Array.from(set);
      });
    }
  };

  /* ---------- 新增 ---------- */
  const handleCreate = (input: {
    title: string;
    summary: string;
    source: SeedSourceKey;
    module: number | null;
  }) => {
    const now = Date.now();
    const seed: CaseSeed = {
      seedId: formatSeedId(nextSeedNumber(seeds)),
      title: input.title.trim(),
      summary: input.summary.trim(),
      source: input.source,
      module: input.module,
      status: "pending", // 新种子统一进入「待生成」队列
      createdAt: now,
      updatedAt: now,
    };
    setSeeds((prev) => [seed, ...prev]);
    setCreateOpen(false);
    showToast(`已保存 ${seed.seedId} · 30 秒采集完成`);
  };

  /* ---------- 批量修改状态 ---------- */
  const handleBatchStatus = (next: SeedStatusKey) => {
    if (selected.length === 0) return;
    if (!window.confirm(`确定将选中的 ${selected.length} 个种子改为「${statusLabel(next)}」？`)) {
      return;
    }
    const sel = new Set(selected);
    const now = Date.now();
    setSeeds((prev) =>
      prev.map((s) =>
        sel.has(s.seedId) && s.status !== next
          ? { ...s, status: next, updatedAt: now }
          : s
      )
    );
    showToast(`已将 ${selected.length} 个种子改为「${statusLabel(next)}」`);
    setSelected([]);
  };

  /* ---------- 生成案例包 ---------- */
  const openPackage = () => {
    if (pendingSelected.length === 0) return;
    setPackageIds(pendingSelected.map((s) => s.seedId));
  };

  const packageSeeds = useMemo(() => {
    if (!packageIds) return [];
    const set = new Set(packageIds);
    return seeds
      .filter((s) => set.has(s.seedId))
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [packageIds, seeds]);

  /* ---------- 渲染 ---------- */
  return (
    <div className="space-y-6">
      {/* 页面顶部：标题 + 统计区 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">案例工坊</h1>
            <p className="mt-1 text-sm text-slate-500">
              案例种子库（用于积累真实案例并批量生成标准案例）
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              数据仅保存在本机浏览器 · localStorage（{BACKLOG_STORAGE_KEY}）
            </p>
          </div>
          <button type="button" onClick={() => setCreateOpen(true)} className={BTN_PRIMARY}>
            <PlusIcon />
            新增案例种子
          </button>
        </div>

        {/* 统计区：总种子 / 待整理 / 待生成 / 已生成 / 已上线 */}
        <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-100 bg-slate-100 sm:grid-cols-5">
          <StatCell label="总种子" value={total} valueCls="text-[#0e2a5e]" />
          {SEED_STATUSES.map((st) => (
            <StatCell
              key={st.key}
              label={st.label}
              value={statusCounts[st.key]}
              valueCls={STATUS_TEXT[st.key]}
            />
          ))}
        </dl>
      </section>

      {/* 筛选：状态 + 来源 */}
      <section className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>状态</span>
          <button type="button" onClick={() => setStatusFilter("all")} className={chip(statusFilter === "all")}>
            全部
          </button>
          {SEED_STATUSES.map((st) => {
            const active = statusFilter === st.key;
            return (
              <button
                key={st.key}
                type="button"
                onClick={() => setStatusFilter(active ? "all" : st.key)}
                className={chip(active)}
              >
                {st.label}
                <span className={active ? "text-blue-200" : "text-slate-400"}> {statusCounts[st.key]}</span>
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={ROW_LABEL}>来源</span>
          <button type="button" onClick={() => setSourceFilter("all")} className={chip(sourceFilter === "all")}>
            全部
          </button>
          {SEED_SOURCES.map((so) => {
            const active = sourceFilter === so.key;
            return (
              <button
                key={so.key}
                type="button"
                onClick={() => setSourceFilter(active ? "all" : so.key)}
                className={chip(active)}
              >
                {so.label}
                <span className={active ? "text-blue-200" : "text-slate-400"}> {sourceCounts.get(so.key) ?? 0}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 批量操作条（勾选后出现） */}
      {selected.length > 0 && (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-[#0e2a5e]">已选 {selected.length} 项</span>
            {pendingSelected.length > 0 && (
              <span className="text-slate-500">其中「待生成」{pendingSelected.length} 项可打包</span>
            )}
            <button
              type="button"
              onClick={() => setSelected([])}
              className="rounded-full bg-white px-2.5 py-0.5 font-medium text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100"
            >
              取消选择
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="批量修改状态"
              defaultValue=""
              onChange={(e) => {
                const v = e.target.value as SeedStatusKey;
                e.target.value = "";
                if (v) handleBatchStatus(v);
              }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 outline-none transition focus:border-[#0e2a5e]"
            >
              <option value="" disabled>
                批量修改状态…
              </option>
              {SEED_STATUSES.map((st) => (
                <option key={st.key} value={st.key}>
                  改为「{st.label}」
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={openPackage}
              disabled={pendingSelected.length === 0}
              title={
                pendingSelected.length === 0
                  ? "请先勾选至少 1 条「待生成」状态的种子"
                  : `打包 ${pendingSelected.length} 条种子`
              }
              className={BTN_PRIMARY}
            >
              <SparkIcon />
              生成案例包
            </button>
          </div>
        </section>
      )}

      {/* 列表头部 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-400">
          共 {filtered.length} 条
          {(statusFilter !== "all" || sourceFilter !== "all") && `（已筛选）`}
        </p>
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={toggleSelectAllVisible}
            className="text-xs font-medium text-[#0e2a5e] hover:underline"
          >
            {allFilteredSelected ? "取消全选" : "全选当前列表"}
          </button>
        )}
      </div>

      {/* 案例种子卡片 */}
      {seeds.length === 0 ? (
        <EmptyState onCreate={() => setCreateOpen(true)} />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
          <p className="text-sm font-semibold text-slate-500">没有符合当前筛选条件的种子</p>
          <p className="mt-1 text-xs text-slate-400">可清除「状态 / 来源」筛选后重试</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((s) => (
            <SeedCard
              key={s.seedId}
              seed={s}
              checked={selectedSet.has(s.seedId)}
              onToggle={() => toggleSelect(s.seedId)}
            />
          ))}
        </div>
      )}

      {/* 新增种子弹窗 */}
      {createOpen && (
        <NewSeedModal
          onClose={() => setCreateOpen(false)}
          onSave={handleCreate}
        />
      )}

      {/* 生成案例包弹窗 */}
      {packageIds && (
        <PackageModal
          seeds={packageSeeds}
          onClose={() => setPackageIds(null)}
        />
      )}

      {/* 轻量 toast */}
      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0e2a5e] px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ================= 子组件 ================= */

function StatCell({
  label,
  value,
  valueCls,
}: {
  label: string;
  value: number;
  valueCls: string;
}) {
  return (
    <div className="bg-white px-4 py-3 text-center sm:text-left">
      <dt className="text-[11px] font-medium text-slate-400">{label}</dt>
      <dd className={`mt-0.5 text-xl font-bold ${valueCls}`}>{value}</dd>
    </div>
  );
}

function SeedCard({
  seed,
  checked,
  onToggle,
}: {
  seed: CaseSeed;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={checked}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`flex cursor-pointer flex-col gap-1.5 rounded-2xl border p-4 text-left transition ${
        checked
          ? "border-[#0e2a5e]/60 bg-blue-50/50 ring-1 ring-[#0e2a5e]/20"
          : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={checked}
            onChange={onToggle}
            onClick={(e) => e.stopPropagation()}
            aria-label={`选择 ${seed.seedId}`}
            className="h-4 w-4 shrink-0 accent-[#0e2a5e]"
          />
          <span className="font-mono text-[11px] font-semibold tracking-wide text-slate-400">
            {seed.seedId}
          </span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_PILL[seed.status]}`}
        >
          {statusLabel(seed.status)}
        </span>
      </div>

      <p className="text-sm font-semibold leading-snug text-slate-800">{seed.title}</p>
      {seed.summary && (
        <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{seed.summary}</p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2 text-[11px]">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
          {sourceLabel(seed.source)}
        </span>
        {seed.module && (
          <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-0.5 font-medium text-[#0e2a5e]">
            M{seed.module} {CASE_MODULES.find((m) => m.id === seed.module)?.zh}
          </span>
        )}
        <span className="ml-auto text-slate-400">创建于 {formatSeedDate(seed.createdAt)}</span>
      </div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-12 text-center">
      <p className="text-sm font-semibold text-slate-500">还没有案例种子</p>
      <p className="mx-auto mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        发现案例时花 30 秒记下：标题 + 一句话描述 + 来源即可。攒够一批后勾选「待生成」种子，
        点「生成案例包」复制给 Copilot，即可批量产出标准案例。
      </p>
      <button
        type="button"
        onClick={onCreate}
        className={`${BTN_PRIMARY} mt-5`}
      >
        <PlusIcon />
        记录第一个案例种子
      </button>
    </div>
  );
}

/* ================= 新增种子弹窗 ================= */

function NewSeedModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (v: {
    title: string;
    summary: string;
    source: SeedSourceKey;
    module: number | null;
  }) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [source, setSource] = useState<SeedSourceKey>("real_case");
  const [module, setModule] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    if (!title.trim()) {
      setError("请填写标题（必填），30 秒即可完成记录");
      return;
    }
    onSave({ title, summary, source, module });
  };

  return (
    <ModalShell onClose={onClose} label="新增案例种子">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="space-y-4"
      >
        <Field label="标题（必填）" hint="一句话概括：问题 / 场景 / 判断点">
          <input
            autoFocus
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            placeholder="例如：AML Letter由Fund出具是否可以接受"
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e] ${
              error ? "border-red-300" : "border-slate-200"
            }`}
          />
        </Field>
        {error && <p className="-mt-2 text-xs font-medium text-red-500">{error}</p>}

        <Field label="一句话描述（选填）" hint="关键事实或结论，越具体越便于生成">
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={2}
            placeholder="例如：客户提供Fund签发AML Letter，要求GP重新出具"
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e]"
          />
        </Field>

        <Field label="来源">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value as SeedSourceKey)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0e2a5e]"
          >
            {SEED_SOURCES.map((so) => (
              <option key={so.key} value={so.key}>
                {so.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="关联模块（选填）" hint="便于生成时对齐模块；不确定可留空">
          <select
            value={module ?? ""}
            onChange={(e) => setModule(e.target.value === "" ? null : Number(e.target.value))}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0e2a5e]"
          >
            <option value="">未关联</option>
            {CASE_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                M{m.id} {m.zh}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <p className="text-[11px] text-slate-400">
            保存后状态为
            <span className="ml-1 rounded-full bg-[#0e2a5e]/10 px-2 py-0.5 font-semibold text-[#0e2a5e]">
              待生成
            </span>
            <br />
            可在列表中勾选后批量调整
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button type="submit" className={BTN_PRIMARY}>
              保存种子
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold text-slate-600">{label}</span>
        {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/* ================= 生成案例包弹窗 ================= */

function PackageModal({
  seeds,
  onClose,
}: {
  seeds: CaseSeed[];
  onClose: () => void;
}) {
  const text = useMemo(() => buildCasePackageText(seeds), [seeds]);
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
    <ModalShell onClose={onClose} label="生成案例包" wide>
      <div className="space-y-3">
        <p className="text-xs leading-relaxed text-slate-500">
          已将选中的{" "}
          <span className="font-semibold text-[#0e2a5e]">{seeds.length}</span> 条「待生成」种子拼装为提示词。
          复制后粘贴给 Copilot，即可批量生成 Case-xxx 标准案例；生成后记得回列表把对应种子批量改为「已生成」。
        </p>
        <textarea
          readOnly
          value={text}
          onFocus={(e) => e.currentTarget.select()}
          spellCheck={false}
          className="thin-scroll h-64 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/70 p-3 font-mono text-[12.5px] leading-5 text-slate-700 outline-none transition focus:border-[#0e2a5e] lg:h-72"
        />
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-400">自动包含编号与「......」，可直接使用</p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
            >
              关闭
            </button>
            <button type="button" onClick={doCopy} className={BTN_PRIMARY}>
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "已复制到剪贴板" : copyFailed ? "复制失败，请手动选择复制" : "复制到剪贴板"}
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

/** 通用弹窗外壳（居中卡片；Esc/遮罩可关） */
function ModalShell({
  children,
  onClose,
  label,
  wide,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  wide?: boolean;
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
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative w-full ${
          wide ? "max-w-2xl" : "max-w-md"
        } rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6`}
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

/* ================= 图标 ================= */

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M7 1.5l1.2 3.6 3.6 1.2-3.6 1.2L7 11.1 5.8 7.5l-3.6-1.2 3.6-1.2L7 1.5z"
        fill="currentColor"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="4.5" y="4.5" width="7" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9.5 4V3.2A1.2 1.2 0 008.3 2H3.2A1.2 1.2 0 002 3.2v5.1a1.2 1.2 0 001.2 1.2H4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2.5 7.5l3 3 6-6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** execCommand 兜底复制（剪贴板 API 不可用时） */
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
