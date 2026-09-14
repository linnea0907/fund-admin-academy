"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  GLOSSARY_CATEGORIES,
  TERM_JURISDICTIONS,
  TERM_SCENARIOS,
  TERM_SOURCES,
  type GlossaryTerm,
} from "@/lib/glossary";
import type { MissingTermCandidate } from "@/lib/missing-terms";
import {
  DRAFT_FIELDS,
  buildCsvTemplate,
  buildImportedJson,
  draftToTerm,
  draftsFromCsv,
  draftsFromJson,
  emptyDraft,
  type ImportIssue,
  type TermDraft,
} from "@/lib/wiki-import";
import {
  copyText,
  downloadTextFile,
  loadWikiState,
  saveWikiState,
  type WikiLocalState,
} from "@/lib/wiki-admin";

type Tab = "import" | "missing" | "staging";

interface PreviewRow {
  draft: TermDraft;
  ok: boolean;
  errors: string[];
  warnings: string[];
}

export default function WikiApp({
  missing,
  existingIds,
  existingLabels,
  builtinCount,
  importedCount,
  totalCount,
}: {
  missing: MissingTermCandidate[];
  existingIds: string[];
  existingLabels: { id: string; term: string; zh: string }[];
  builtinCount: number;
  importedCount: number;
  totalCount: number;
}) {
  const [tab, setTab] = useState<Tab>("import");
  // 本组件经 dynamic(ssr:false) 挂载，初始 render 只发生在客户端 → 可直接惰性读 localStorage
  const [state, setState] = useState<WikiLocalState>(() => loadWikiState());
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<PreviewRow[] | null>(null);
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [headers, setHeaders] = useState<{ unknown: string[]; missing: string[] }>({
    unknown: [],
    missing: [],
  });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<number | null>(null);

  const persist = useCallback((next: WikiLocalState) => {
    setState(next);
    saveWikiState(next);
  }, []);

  const staged = useMemo(() => state.staged, [state.staged]);
  const ignored = useMemo(() => new Set(state.ignored), [state.ignored]);

  const existingIdSet = useMemo(() => new Set(existingIds), [existingIds]);
  const labelIndex = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of existingLabels) m.set(t.id, `${t.term} · ${t.zh}`);
    return m;
  }, [existingLabels]);

  /** 校验单条草稿（id 冲突含其它暂存项） */
  const validate = useCallback(
    (draft: TermDraft, selfIndex: number): { ok: boolean; errors: string[]; warnings: string[] } => {
      const ids = new Set(existingIdSet);
      staged.forEach((d, i) => {
        if (i === selfIndex) return;
        const id = (d.id.trim() || d.term.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")).toLowerCase();
        if (id) ids.add(id);
      });
      const r = draftToTerm(draft, { existingIds: ids });
      return { ok: r.term !== null, errors: r.errors, warnings: r.warnings };
    },
    [existingIdSet, staged]
  );

  const stagedRows = useMemo(
    () =>
      staged.map((d, i) => {
        const v = validate(d, i);
        return { draft: d, index: i, ...v };
      }),
    [staged, validate]
  );
  const stagedValid = stagedRows.filter((r) => r.ok);

  /* ---------------- 文件导入 ---------------- */
  const handleFile = async (file: File) => {
    setBusy(true);
    setToast("");
    setFileName(file.name);
    try {
      const lower = file.name.toLowerCase();
      let parsed;
      if (lower.endsWith(".xlsx")) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/wiki/parse", { method: "POST", body: fd });
        const json = (await res.json()) as { ok: boolean; text?: string; error?: string; sheet?: string };
        if (!json.ok || !json.text) {
          setToast(`Excel 解析失败：${json.error ?? "未知错误"}`);
          setPreview(null);
          return;
        }
        parsed = draftsFromCsv(json.text);
        setToast(`Excel 已解析（工作表 ${json.sheet}）`);
      } else if (lower.endsWith(".json")) {
        parsed = draftsFromJson(await file.text());
      } else if (lower.endsWith(".csv") || lower.endsWith(".txt")) {
        parsed = draftsFromCsv(await file.text());
      } else {
        setToast("仅支持 .csv / .xlsx / .json");
        setPreview(null);
        return;
      }

      const rows: PreviewRow[] = parsed.drafts.map((d, i) => {
        const v = validate(d, -1 - i);
        return { draft: d, ...v };
      });
      setPreview(rows);
      setIssues(parsed.issues);
      setHeaders({ unknown: parsed.unknownHeaders, missing: parsed.missingColumns });
      if (parsed.drafts.length === 0) setToast("未解析到数据行，请检查表头是否与模板一致");
    } finally {
      setBusy(false);
    }
  };

  const addPreviewToStaging = () => {
    if (!preview || !state) return;
    const add = preview.filter((r) => r.ok).map((r) => r.draft);
    if (add.length === 0) {
      setToast("预览中没有通过校验的行");
      return;
    }
    persist({ ...state, staged: [...state.staged, ...add] });
    setToast(`已加入暂存区 ${add.length} 条`);
    setTab("staging");
  };

  /* ---------------- 待补充术语 ---------------- */
  const visibleMissing = missing.filter((m) => !ignored.has(m.key));

  const createFromMissing = (c: MissingTermCandidate) => {
    const d = emptyDraft();
    d.term = c.text;
    d.brief = "";
    persist({ ...state, staged: [...state.staged, d] });
    setEditing(state.staged.length);
    setTab("staging");
    setToast(`已为「${c.text}」创建草稿，请补全中文名与定义`);
  };

  const ignoreMissing = (key: string) => {
    persist({ ...state, ignored: [...state.ignored, key] });
  };
  const restoreMissing = (key: string) => {
    persist({ ...state, ignored: state.ignored.filter((k) => k !== key) });
  };

  /* ---------------- 暂存区编辑 / 导出 ---------------- */
  const updateDraft = (index: number, key: keyof TermDraft, value: string) => {
    const next = state.staged.map((d, i) => (i === index ? { ...d, [key]: value } : d));
    persist({ ...state, staged: next });
  };
  const removeDraft = (index: number) => {
    persist({ ...state, staged: state.staged.filter((_, i) => i !== index) });
    setEditing(null);
  };
  const clearStaged = () => {
    persist({ ...state, staged: [] });
    setEditing(null);
  };

  const exportTerms = useMemo(() => {
    const out: GlossaryTerm[] = [];
    const seen = new Set<string>();
    staged.forEach((d, i) => {
      const v = validate(d, i);
      if (!v.ok) return;
      const r = draftToTerm(d, { existingIds: new Set([...existingIdSet, ...seen]) });
      if (r.term && !seen.has(r.term.id)) {
        seen.add(r.term.id);
        out.push(r.term);
      }
    });
    return out;
  }, [staged, validate, existingIdSet]);

  const exportJson = buildImportedJson(exportTerms);

  const doDownload = () => {
    downloadTextFile("imported.json", exportJson);
    setToast("已下载 imported.json ── 放入 content/glossary/ 后运行 npm run gen:glossary");
  };
  const doCopy = async () => {
    const ok = await copyText(exportJson);
    setToast(ok ? "已复制 JSON（粘贴为 content/glossary/imported.json）" : "复制失败，请改用下载");
  };

  return (
    <div className="space-y-5">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">知识工坊</h1>
          <span className="rounded-full bg-amber-300 px-3 py-1 text-xs font-black tracking-wide text-[#0e2a5e]">
            Fund Admin Wiki · 术语建设后台
          </span>
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500">
          批量导入（CSV / Excel / JSON）、待补充术语池与导出落盘。术语为构建期单一数据源：
          导入内容先在<strong className="text-slate-600">本机暂存区</strong>解析与编辑，
          导出 <code className="rounded bg-slate-100 px-1 text-[12px]">imported.json</code> 放到{" "}
          <code className="rounded bg-slate-100 px-1 text-[12px]">content/glossary/</code> 后运行{" "}
          <code className="rounded bg-slate-100 px-1 text-[12px]">npm run gen:glossary</code>
          （build 已自动执行），下一次构建即全站生效。
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <Stat label="术语总数" value={totalCount} />
          <Stat label="内置" value={builtinCount} />
          <Stat label="已导入（仓库生效）" value={importedCount} />
          <Stat label="暂存待导出" value={staged.length} />
          <Stat label="待补充候选" value={visibleMissing.length} />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
        <TabBtn active={tab === "import"} onClick={() => setTab("import")} label="批量导入" badge={preview?.length} />
        <TabBtn
          active={tab === "missing"}
          onClick={() => setTab("missing")}
          label="待补充术语池"
          badge={visibleMissing.length}
        />
        <TabBtn active={tab === "staging"} onClick={() => setTab("staging")} label="暂存与导出" badge={staged.length} />
        <Link
          href="/glossary"
          className="ml-auto self-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-200 hover:text-[#0e2a5e]"
        >
          查看 Fund Admin Wiki →
        </Link>
      </div>

      {toast && (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-medium text-emerald-800">
          {toast}
        </p>
      )}

      {/* ============ Tab 1 · 批量导入 ============ */}
      {tab === "import" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">1 · 选择文件</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              支持 <b>CSV</b> / <b>Excel（.xlsx）</b> / <b>JSON</b>；首行表头需与模板列名一致，多值字段用{" "}
              <code className="rounded bg-slate-100 px-1">|</code> 分隔。必填列：
              {DRAFT_FIELDS.filter((f) => f.required)
                .map((f) => f.header)
                .join(" / ")}
              。
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0e2a5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0e2a5e]/90">
                选择文件
                <input
                  type="file"
                  accept=".csv,.xlsx,.json,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleFile(f);
                    e.target.value = "";
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  downloadTextFile("glossary-import-template.csv", buildCsvTemplate(), "text/csv")
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:text-[#0e2a5e]"
              >
                下载 CSV 模板
              </button>
              {fileName && <span className="text-xs text-slate-400">已读取：{fileName}</span>}
              {busy && <span className="text-xs text-slate-400">解析中…</span>}
            </div>
          </section>

          {preview && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
                2 · 校验预览（{preview.length} 行）
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  通过 {preview.filter((r) => r.ok).length}
                </span>
                {preview.filter((r) => !r.ok).length > 0 && (
                  <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                    待修正 {preview.filter((r) => !r.ok).length}
                  </span>
                )}
              </h2>

              {(headers.missing.length > 0 || headers.unknown.length > 0 || issues.length > 0) && (
                <div className="mt-3 space-y-1.5 rounded-xl bg-amber-50/70 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
                  {headers.missing.length > 0 && (
                    <p>缺少必填列：{headers.missing.map((k) => DRAFT_FIELDS.find((f) => f.key === k)?.header ?? k).join(" / ")}</p>
                  )}
                  {headers.unknown.length > 0 && <p>未识别的列：{headers.unknown.join(" / ")}</p>}
                  {issues.slice(0, 5).map((it, i) => (
                    <p key={i}>
                      第 {it.row} 行{it.field ? `（${it.field}）` : ""}：{it.message}
                    </p>
                  ))}
                </div>
              )}

              <div className="thin-scroll mt-3 max-h-[420px] overflow-auto rounded-xl border border-slate-100">
                <table className="w-full min-w-[720px] border-collapse text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">状态</th>
                      <th className="px-3 py-2">Term</th>
                      <th className="px-3 py-2">Full Name</th>
                      <th className="px-3 py-2">Chinese Name</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">问题</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {preview.slice(0, 60).map((r, i) => (
                      <tr key={i} className={r.ok ? "" : "bg-rose-50/40"}>
                        <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                        <td className="px-3 py-2">{r.ok ? "✅" : "⚠️"}</td>
                        <td className="px-3 py-2 font-semibold text-slate-700">{r.draft.term || "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{r.draft.fullName || "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{r.draft.zh || "—"}</td>
                        <td className="px-3 py-2 text-slate-500">{r.draft.category || "—"}</td>
                        <td className="px-3 py-2 text-rose-600">{r.errors.join("；")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {preview.length > 60 && (
                <p className="mt-2 text-center text-xs text-slate-400">仅预览前 60 行（导出时按全部合法行处理）</p>
              )}

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={addPreviewToStaging}
                  className="rounded-xl bg-[#0e2a5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0e2a5e]/90"
                >
                  将合法行加入暂存区（{preview.filter((r) => r.ok).length}）
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setIssues([]);
                    setFileName("");
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                >
                  清除预览
                </button>
              </div>
              <p className="mt-2 text-[11px] text-slate-400">
                提示：未通过校验的行不会进入暂存区；可回到源文件修正后重新上传。
              </p>
            </section>
          )}
        </div>
      )}

      {/* ============ Tab 2 · 待补充术语池 ============ */}
      {tab === "missing" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">待补充术语池（Missing Terms）</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              扫描课程正文与要点、案例标题与全部小节，抽取出<strong>尚未录入术语库</strong>的英文候选
              （缩写与大写词组），按出现文档数排序。点「一键创建」生成草稿并补全内容，或「忽略」不再提示。
            </p>
          </section>

          {visibleMissing.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">暂无待补充候选</p>
              <p className="mt-1 text-xs text-slate-400">全部已录入，或候选均被忽略（可在下方恢复）</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {visibleMissing.map((c) => (
                <li key={c.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {c.acronym ? "缩写" : "词组"}
                    </span>
                    <span className="text-sm font-bold text-slate-800">{c.text}</span>
                    {existingIdSet.has(c.key) && (
                      <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
                        已录入：{labelIndex.get(c.key)}
                      </span>
                    )}
                    <span className="ml-auto flex items-center gap-3 text-[11px] text-slate-400">
                      出现于 {c.docs} 个片段 · 共 {c.count} 次
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1">
                    {c.samples.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg bg-slate-50/70 px-3 py-1.5 text-[11px] text-slate-500">
                        <Link
                          href={s.href}
                          className="shrink-0 font-semibold text-[#0e2a5e] hover:underline"
                          title="打开来源位置"
                        >
                          {s.label}
                        </Link>
                        <span className="min-w-0 break-words">{s.context}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => createFromMissing(c)}
                      className="rounded-xl bg-[#0e2a5e] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0e2a5e]/90"
                    >
                      一键创建
                    </button>
                    <button
                      type="button"
                      onClick={() => ignoreMissing(c.key)}
                      className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-medium text-slate-500 transition hover:border-slate-300"
                    >
                      忽略
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {ignored.size > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800">已忽略（{ignored.size}）</h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[...ignored].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => restoreMissing(k)}
                    title="点击恢复"
                    className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-500 transition hover:bg-slate-200"
                  >
                    {k} ↺
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ============ Tab 3 · 暂存与导出 ============ */}
      {tab === "staging" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800">
              暂存区（{staged.length}）
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                可导出 {stagedValid.length}
              </span>
              {staged.length - stagedValid.length > 0 && (
                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                  待补全 {staged.length - stagedValid.length}
                </span>
              )}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              仅「可导出」的条目会进入 JSON；展开编辑可补全中文名 / 定义 / 分类等必填字段。
            </p>

            {staged.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-xs text-slate-400">
                暂存区为空 —— 可在「批量导入」上传文件，或在「待补充术语池」一键创建
              </p>
            ) : (
              <>
                <ul className="mt-3 space-y-2">
                  {stagedRows.map((r) => (
                    <li
                      key={r.index}
                      className={`rounded-xl border px-3 py-2.5 ${
                        r.ok ? "border-slate-200 bg-white" : "border-rose-200 bg-rose-50/40"
                      }`}
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {r.draft.term || "（未填 Term）"}
                        </span>
                        <span className="text-xs text-slate-400">{r.draft.zh || "（未填中文名）"}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">
                          {r.draft.category || "未分类"}
                        </span>
                        {r.ok ? (
                          <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">
                            ✅ 可导出
                          </span>
                        ) : (
                          <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">
                            {r.errors[0]}
                          </span>
                        )}
                        <span className="ml-auto flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(editing === r.index ? null : r.index)}
                            className="text-[11px] font-semibold text-[#0e2a5e] hover:underline"
                          >
                            {editing === r.index ? "收起" : "展开编辑"}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeDraft(r.index)}
                            className="text-[11px] font-medium text-slate-400 hover:text-rose-600"
                          >
                            移除
                          </button>
                        </span>
                      </div>

                      {editing === r.index && (
                        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          <Field label="Term *">
                            <input
                              value={r.draft.term}
                              onChange={(e) => updateDraft(r.index, "term", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Full Name">
                            <input
                              value={r.draft.fullName}
                              onChange={(e) => updateDraft(r.index, "fullName", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Chinese Name *">
                            <input
                              value={r.draft.zh}
                              onChange={(e) => updateDraft(r.index, "zh", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Category *">
                            <select
                              value={GLOSSARY_CATEGORIES.find((c) => c.label === r.draft.category || c.id === r.draft.category)?.label ?? ""}
                              onChange={(e) => updateDraft(r.index, "category", e.target.value)}
                              className={inputCls}
                            >
                              <option value="">— 请选择 —</option>
                              {GLOSSARY_CATEGORIES.map((c) => (
                                <option key={c.id} value={c.label}>
                                  {c.label} · {c.zh}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Jurisdiction（| 分隔）">
                            <input
                              value={r.draft.jurisdiction}
                              onChange={(e) => updateDraft(r.index, "jurisdiction", e.target.value)}
                              placeholder={TERM_JURISDICTIONS.slice(0, 4).join(" | ")}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Source（| 分隔）">
                            <select
                              value=""
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const cur = r.draft.source ? `${r.draft.source} | ${e.target.value}` : e.target.value;
                                updateDraft(r.index, "source", cur);
                              }}
                              className={inputCls}
                            >
                              <option value="">— 添加来源 —</option>
                              {TERM_SOURCES.map((s) => (
                                <option key={s.id} value={s.label}>
                                  {s.label} · {s.nature}
                                </option>
                              ))}
                            </select>
                          </Field>
                          <div className="sm:col-span-2">
                            <Field label="Definition *">
                              <textarea
                                value={r.draft.definition}
                                onChange={(e) => updateDraft(r.index, "definition", e.target.value)}
                                rows={3}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                          <div className="sm:col-span-2">
                            <Field label="Why Important">
                              <textarea
                                value={r.draft.whyImportant}
                                onChange={(e) => updateDraft(r.index, "whyImportant", e.target.value)}
                                rows={2}
                                className={inputCls}
                              />
                            </Field>
                          </div>
                          <Field label="Alias（| 分隔）">
                            <input
                              value={r.draft.aliases}
                              onChange={(e) => updateDraft(r.index, "aliases", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label={`Fund Admin Scenario（| 分隔）`}>
                            <input
                              value={r.draft.scenario}
                              onChange={(e) => updateDraft(r.index, "scenario", e.target.value)}
                              placeholder={TERM_SCENARIOS.slice(0, 3).join(" | ")}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Related Terms（id，| 分隔）">
                            <input
                              value={r.draft.related}
                              onChange={(e) => updateDraft(r.index, "related", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Tags（| 分隔）">
                            <input
                              value={r.draft.tags}
                              onChange={(e) => updateDraft(r.index, "tags", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Related Cases（Case-001 | …）">
                            <input
                              value={r.draft.cases}
                              onChange={(e) => updateDraft(r.index, "cases", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="Related Courses（01 | E1）">
                            <input
                              value={r.draft.courses}
                              onChange={(e) => updateDraft(r.index, "courses", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="常见误区（| 分隔）">
                            <input
                              value={r.draft.commonMistakes}
                              onChange={(e) => updateDraft(r.index, "commonMistakes", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          <Field label="ID（留空自动生成）">
                            <input
                              value={r.draft.id}
                              onChange={(e) => updateDraft(r.index, "id", e.target.value)}
                              className={inputCls}
                            />
                          </Field>
                          {r.warnings.length > 0 && (
                            <p className="sm:col-span-2 text-[11px] text-amber-600">
                              警告：{r.warnings.join("；")}
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={doDownload}
                    disabled={exportTerms.length === 0}
                    className="rounded-xl bg-[#0e2a5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0e2a5e]/90 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    导出 imported.json（{exportTerms.length}）
                  </button>
                  <button
                    type="button"
                    onClick={doCopy}
                    disabled={exportTerms.length === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:text-[#0e2a5e] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    复制 JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadTextFile("glossary-import-template.csv", buildCsvTemplate(), "text/csv")}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300"
                  >
                    下载 CSV 模板
                  </button>
                  <button
                    type="button"
                    onClick={clearStaged}
                    className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-rose-200 hover:text-rose-600"
                  >
                    清空暂存区
                  </button>
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800">落盘步骤</h2>
            <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500">
              <li>1 · 点击「导出 imported.json」（或复制 JSON）；</li>
              <li>
                2 · 保存到仓库 <code className="rounded bg-slate-100 px-1">content/glossary/imported.json</code>
                （目录不存在则新建）；
              </li>
              <li>
                3 · 运行 <code className="rounded bg-slate-100 px-1">npm run gen:glossary</code> 烘焙进{" "}
                <code className="rounded bg-slate-100 px-1">src/data/glossary/imported.ts</code>（build 会自动执行）；
              </li>
              <li>4 · 下一次构建后，术语列表 / 详情页 / 正文标注 / 知识检索全部生效。</li>
            </ol>
            <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
              说明：站点为静态站 + 构建期单一数据源，浏览器无法直接写源码文件，因此导入采用
              「本机暂存 → 导出 → 落盘烘焙」流程；这正是 500~1000 条术语规模下最稳妥的扩展方式。
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-[#0e2a5e] focus:ring-2 focus:ring-[#0e2a5e]/10";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-500">
      {label}
      <b className="text-[#0e2a5e]">{value}</b>
    </span>
  );
}

function TabBtn({
  active,
  onClick,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  badge?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
        active ? "bg-[#0e2a5e] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span
          className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-white text-slate-400"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
