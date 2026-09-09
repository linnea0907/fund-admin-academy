"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAcademy } from "@/hooks/use-academy";
import { allLessons as courseAllLessons } from "@/data/lessons";
import { orderedAllLessons } from "@/lib/ordering";
import { GLOSSARY_TERMS } from "@/lib/glossary";
import {
  deleteNote,
  hlStatusMeta,
  loadNotes,
  matchNote,
  noteCounts,
  noteSourceLabel,
  noteTypeLabel,
  upsertNote,
} from "@/lib/notes";
import { buildCourseBlocks, hasLocator, locateRecord } from "@/lib/reading";
import type {
  HLStatus,
  NoteSourceType,
  NoteType,
  StudyNote,
} from "@/types";

/* ================================================================== */
/*  收藏夹 · 个人学习资产中心（V1.11）                                  */
/*  顶部 Tab：[收藏内容] / [学习笔记]；本组件纯客户端（ssr:false 包装）  */
/* ================================================================== */

interface CaseRef {
  id: string;
  title: string;
  href: string;
}

export default function FavoritesApp({ caseRefs }: { caseRefs: CaseRef[] }) {
  const { state } = useAcademy();
  const [tab, setTab] = useState<"fav" | "notes">("fav");
  const [notes, setNotes] = useState<StudyNote[]>(() => loadNotes());
  const favCount = state.favorites.length;

  const courseMap = useMemo(() => {
    const m = new Map<string, (typeof courseAllLessons)[number]>();
    for (const l of courseAllLessons) m.set(l.id, l);
    return m;
  }, []);
  const termMap = useMemo(() => {
    const m = new Map<string, (typeof GLOSSARY_TERMS)[number]>();
    for (const t of GLOSSARY_TERMS) m.set(t.id, t);
    return m;
  }, []);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">收藏夹</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          管理收藏内容与个人学习笔记
        </p>
      </header>

      {/* Tab 栏 */}
      <div className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <TabButton
          active={tab === "fav"}
          onClick={() => setTab("fav")}
          label="收藏内容"
          count={favCount}
        />
        <TabButton
          active={tab === "notes"}
          onClick={() => setTab("notes")}
          label="学习笔记"
          count={notes.length}
        />
      </div>

      {tab === "fav" ? (
        <FavoritesPanel
          caseRefs={caseRefs}
          courseMap={courseMap}
          termMap={termMap}
        />
      ) : (
        <NotesPanel
          notes={notes}
          setNotes={setNotes}
          caseRefs={caseRefs}
          courseMap={courseMap}
        />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-[#0e2a5e] text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-px text-[10px] font-bold ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

/* ================================================================== */
/*  Tab 1 · 收藏内容                                                   */
/* ================================================================== */

interface FavRowModel {
  key: string;
  category: "课程" | "案例" | "术语";
  /** 首行小字：整课 · 第 01 讲 / 模块 · xx / 案例 · Case-001 / 术语 */
  tag: string;
  href: string;
  title: string;
  subtitle: string;
  remove: () => void;
}

function FavoritesPanel({
  caseRefs,
  courseMap,
  termMap,
}: {
  caseRefs: CaseRef[];
  courseMap: Map<string, (typeof courseAllLessons)[number]>;
  termMap: Map<string, (typeof GLOSSARY_TERMS)[number]>;
}) {
  const { state, toggleFavorite } = useAcademy();
  const [q, setQ] = useState("");
  const favs = state.favorites;

  const rows = useMemo<FavRowModel[]>(() => {
    const out: FavRowModel[] = [];
    for (const f of favs) {
      if (f.type === "lesson") {
        const l = courseMap.get(f.lessonId);
        if (!l) continue;
        out.push({
          key: `lesson:${l.id}`,
          category: "课程",
          tag: `整课 · ${l.id.startsWith("E") ? `选修 ${l.id}` : `第 ${l.id} 讲`}`,
          href: `/courses/${l.slug}`,
          title: l.title,
          subtitle: l.subtitle,
          remove: () => toggleFavorite({ type: "lesson", lessonId: l.id }),
        });
      } else if (f.type === "module") {
        const l = courseMap.get(f.lessonId);
        const lm = l?.modules.find((m) => m.id === f.moduleId);
        if (!l || !lm) continue;
        out.push({
          key: `module:${l.id}:${lm.id}`,
          category: "课程",
          tag: `模块 · ${l.title}`,
          href: `/courses/${l.slug}#${lm.id}`,
          title: lm.title,
          subtitle: (lm.body[0] ?? "").slice(0, 80) + "…",
          remove: () =>
            toggleFavorite({ type: "module", lessonId: l.id, moduleId: lm.id }),
        });
      } else if (f.type === "case") {
        const c = caseRefs.find((x) => x.id === f.caseId);
        if (!c) continue;
        out.push({
          key: `case:${c.id}`,
          category: "案例",
          tag: `案例 · ${c.id}`,
          href: c.href,
          title: c.title,
          subtitle: "Fund Admin 实务案例 · 答案以 ICS 内部 SOP 为准",
          remove: () => toggleFavorite({ type: "case", caseId: c.id }),
        });
      } else if (f.type === "term") {
        const t = termMap.get(f.termId);
        if (!t) continue;
        out.push({
          key: `term:${t.id}`,
          category: "术语",
          tag: "术语",
          href: `/glossary/${t.id}`,
          title: `${t.en} · ${t.zh}`,
          subtitle: t.brief,
          remove: () => toggleFavorite({ type: "term", termId: t.id }),
        });
      }
    }
    return out;
  }, [favs, caseRefs, courseMap, termMap, toggleFavorite]);

  const kw = q.trim().toLowerCase();
  const filtered = kw
    ? rows.filter((r) =>
        `${r.tag} ${r.title} ${r.subtitle}`.toLowerCase().includes(kw)
      )
    : rows;

  if (favs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <p className="text-3xl">☆</p>
        <p className="mt-2 text-sm font-medium text-slate-600">收藏夹还是空的</p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
          在课程详情页点「收藏本课 / 模块星标」、案例详情页点「收藏」、术语详情页点「收藏术语」，
          把重点内容收进个人资产中心，随时回来复习。
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium">
          <Link href="/courses" className="rounded-lg bg-[#0e2a5e] px-4 py-2 text-white transition hover:bg-blue-900">
            去课程中心
          </Link>
          <Link href="/cases" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-blue-300 hover:text-[#0e2a5e]">
            去案例库
          </Link>
          <Link href="/glossary" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600 transition hover:border-blue-300 hover:text-[#0e2a5e]">
            去术语库
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索收藏内容（课程 / 模块 / 案例 / 术语）"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e] focus:bg-white"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          没有符合「{q.trim()}」的收藏
        </div>
      ) : (
        (["课程", "案例", "术语"] as const).map((cat) => {
          const catRows = filtered.filter((r) => r.category === cat);
          if (catRows.length === 0) return null;
          return (
            <section
              key={cat}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-sm font-bold text-slate-800">
                {cat === "课程" && "收藏的课程"}
                {cat === "案例" && "收藏的案例"}
                {cat === "术语" && "收藏的术语"}
                <span className="ml-2 text-xs font-normal text-slate-400">
                  {catRows.length}
                </span>
              </h2>
              <ul className="mt-2 divide-y divide-slate-100">
                {catRows.map((r) => (
                  <FavRow key={r.key} row={r} />
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}

function FavRow({ row }: { row: FavRowModel }) {
  return (
    <li className="group flex items-center gap-4 py-3">
      <Link href={row.href} className="min-w-0 flex-1">
        <p className="truncate text-xs text-[#0e2a5e]/70">{row.tag}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
          {row.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">{row.subtitle}</p>
      </Link>
      <button
        type="button"
        onClick={row.remove}
        title="取消收藏"
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
      >
        取消收藏
      </button>
    </li>
  );
}

/* ================================================================== */
/*  Tab 2 · 学习笔记                                                   */
/* ================================================================== */

type SourceFilter = "all" | NoteSourceType;

function NotesPanel({
  notes,
  setNotes,
  caseRefs,
  courseMap,
}: {
  notes: StudyNote[];
  setNotes: (n: StudyNote[]) => void;
  caseRefs: CaseRef[];
  courseMap: Map<string, (typeof courseAllLessons)[number]>;
}) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<SourceFilter>("all");
  const [editing, setEditing] = useState<StudyNote | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const cnt = noteCounts(notes);
  const shown = useMemo(
    () =>
      notes
        .filter((n) =>
          filter === "all" ? true : n.sourceType === filter
        )
        .filter((n) => matchNote(n, q))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [notes, q, filter]
  );

  const flash = (text: string) => {
    setMsg(text);
    window.setTimeout(() => setMsg(null), 2600);
  };

  /** 课程正文块（实时状态判定用；案例正文在服务端，用阅读页回写的 status） */
  const courseBlocksByLesson = useMemo(() => {
    const m = new Map<string, ReturnType<typeof buildCourseBlocks>>();
    for (const n of notes) {
      if (n.sourceType !== "course") continue;
      const l = courseMap.get(n.sourceId);
      if (l && !m.has(l.id)) m.set(l.id, buildCourseBlocks(l));
    }
    return m;
  }, [notes, courseMap]);

  const liveStatus = (
    n: StudyNote
  ): { key: HLStatus; label: string; hint: string } | null => {
    if (!hasLocator(n)) return null;
    if (n.sourceType === "course") {
      const blocks = courseBlocksByLesson.get(n.sourceId);
      if (!blocks) {
        return { key: "lost", label: "失效", hint: hlStatusMeta("lost")!.hint };
      }
      const r = locateRecord(n, blocks);
      const meta = hlStatusMeta(r.status) ?? hlStatusMeta("active")!;
      return { key: r.status, label: meta.label, hint: meta.hint };
    }
    // 案例：无法在收藏夹读到 md 正文 → 用最近一次阅读恢复状态；整案下架才判失效
    const exists = caseRefs.some((c) => c.id === n.sourceId);
    if (!exists) {
      return { key: "lost", label: "失效", hint: hlStatusMeta("lost")!.hint };
    }
    const st: HLStatus = n.status ?? "active";
    const meta = hlStatusMeta(st) ?? hlStatusMeta("active")!;
    return { key: st, label: meta.label, hint: meta.hint };
  };

  const handleDelete = (n: StudyNote) => {
    const kind = noteTypeLabel(n.type);
    const extra = hasLocator(n) ? "，原页面高亮将同步消失" : "";
    if (!window.confirm(`确定删除这条${kind}记录${extra}？`)) return;
    setNotes(deleteNote(notes, n.noteId));
    flash("已删除");
  };

  const jump = (n: StudyNote): string | null => {
    // 高亮记录带 ?hl= 参数 → 阅读页自动滚动定位到对应高亮区域并闪烁
    const hl = hasLocator(n) ? `?hl=${encodeURIComponent(n.noteId)}` : "";
    if (n.sourceType === "course") {
      const l = courseMap.get(n.sourceId);
      return l ? `/courses/${l.slug}${hl}` : null;
    }
    const c = caseRefs.find((x) => x.id === n.sourceId);
    return c ? `${c.href}${hl}` : null;
  };

  return (
    <div className="space-y-4">
      {/* 工具栏：新增 + 搜索 + 来源筛选 */}
      <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            自动汇总阅读时的高亮 / 划线 / 批注
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#143a75]"
          >
            + 新增笔记
          </button>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索笔记：标题 / 原文 / 笔记内容"
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e] focus:bg-white"
        />
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["all", `全部（${cnt.total}）`],
              ["course", `课程（${cnt.course}）`],
              ["case", `案例（${cnt.case}）`],
            ] as [SourceFilter, string][]
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                filter === k
                  ? "bg-[#0e2a5e] text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {msg && (
        <p className="rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-medium text-white">
          {msg}
        </p>
      )}

      {notes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-3xl">📝</p>
          <p className="mt-2 text-sm font-medium text-slate-600">还没有学习笔记</p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-400">
            在课程 / 案例正文选中文字，点「高亮」或「写笔记」即自动汇总到这里；
            内容升级后系统会按锚点 + 原文 + 上下文自动恢复高亮定位。
          </p>
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setCreateOpen(true);
            }}
            className="mt-4 inline-block rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
          >
            新增第一条笔记
          </button>
        </div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
          没有符合条件的笔记
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((n) => (
            <NoteCard
              key={n.noteId}
              note={n}
              status={liveStatus(n)}
              href={jump(n)}
              onEdit={() => {
                setEditing(n);
                setCreateOpen(true);
              }}
              onDelete={() => handleDelete(n)}
            />
          ))}
        </ul>
      )}

      {(createOpen || editing) && (
        <NoteEditorModal
          note={editing}
          caseRefs={caseRefs}
          courseOptions={orderedAllLessons.map((l) => ({
            id: l.id,
            title: `${l.id} ${l.title}`,
          }))}
          onClose={() => {
            setCreateOpen(false);
            setEditing(null);
          }}
          onSave={(input) => {
            const res = upsertNote(notes, input);
            setNotes(res.notes);
            setCreateOpen(false);
            setEditing(null);
            flash(input.noteId ? "笔记已更新" : `已保存 ${res.saved.noteId}`);
          }}
        />
      )}
    </div>
  );
}

function NoteCard({
  note,
  status,
  href,
  onEdit,
  onDelete,
}: {
  note: StudyNote;
  status: { key: HLStatus; label: string; hint: string } | null;
  href: string | null;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const stColor =
    status?.key === "active"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status?.key === "partial"
        ? "bg-amber-50 text-amber-700 ring-amber-200"
        : status?.key === "lost"
          ? "bg-rose-50 text-rose-600 ring-rose-200"
          : "";
  return (
    <li className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
            note.sourceType === "course"
              ? "bg-sky-50 text-sky-700 ring-sky-200"
              : "bg-violet-50 text-violet-700 ring-violet-200"
          }`}
        >
          {noteSourceLabel(note.sourceType)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${
            note.type === "highlight"
              ? "bg-amber-50 text-amber-700 ring-amber-200"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
          }`}
        >
          {noteTypeLabel(note.type)}
        </span>
        {status && (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${stColor}`}
            title={status.hint || undefined}
          >
            {status.label}
          </span>
        )}
        <span className="ml-auto text-[11px] text-slate-400">
          {fmtDate(note.createdAt)}
        </span>
      </div>

      <p className="mt-2.5 text-[15px] font-semibold text-slate-800">
        {note.sourceTitle}
      </p>

      {note.selectedText && (
        <blockquote className="mt-2.5 rounded-lg border-l-2 border-amber-300 bg-amber-50/60 px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-amber-500/80">
            原文
          </p>
          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {note.selectedText}
          </p>
        </blockquote>
      )}

      <div className="mt-2.5 rounded-lg border border-slate-100 bg-slate-50/80 px-3.5 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
          我的笔记
        </p>
        {note.note ? (
          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {note.note}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-slate-300">（未写批注 · 纯高亮）</p>
        )}
      </div>

      {status?.hint && (
        <p
          className={`mt-2 rounded-lg px-3 py-1.5 text-[11px] ${
            status.key === "lost"
              ? "bg-rose-50 text-rose-500"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {status.key === "lost" ? "⚠ " : "ℹ "}
          {status.hint}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs font-medium">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0e2a5e]/5 px-3 py-1.5 text-[#0e2a5e] transition hover:bg-[#0e2a5e]/10"
          >
            查看原文 →
          </Link>
        ) : (
          <span className="px-1 text-xs text-slate-300">原文已下架</span>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-3 py-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          {note.type === "highlight" && !note.note ? "写笔记" : "编辑"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          title={hasLocator(note) ? "删除记录（原页面高亮同步消失）" : undefined}
          className="rounded-lg px-3 py-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
        >
          删除
        </button>
      </div>
    </li>
  );
}

/* ---------------- 新增 / 编辑弹窗 ---------------- */

interface NoteEditorModalProps {
  note: StudyNote | null;
  caseRefs: CaseRef[];
  courseOptions: { id: string; title: string }[];
  onClose: () => void;
  onSave: (input: {
    noteId?: string;
    type: NoteType;
    sourceType: NoteSourceType;
    sourceId: string;
    sourceTitle: string;
    selectedText: string;
    note: string;
  }) => void;
}

function NoteEditorModal({
  note,
  caseRefs,
  courseOptions,
  onClose,
  onSave,
}: NoteEditorModalProps) {
  const initial = note
    ? {
        sourceType: note.sourceType,
        sourceId: note.sourceId,
        selectedText: note.selectedText,
        note: note.note,
      }
    : {
        sourceType: "course" as NoteSourceType,
        sourceId: courseOptions[0]?.id ?? "",
        selectedText: "",
        note: "",
      };

  const [sourceType, setSourceType] = useState<NoteSourceType>(initial.sourceType);
  const [sourceId, setSourceId] = useState(initial.sourceId);
  const [selectedText, setSelectedText] = useState(initial.selectedText);
  const [body, setBody] = useState(initial.note);

  const options =
    sourceType === "course"
      ? courseOptions.map((o) => ({ id: o.id, title: o.title }))
      : caseRefs.map((c) => ({ id: c.id, title: `${c.id} ${c.title}` }));

  const resolvedTitle = options.find((o) => o.id === sourceId)?.title ?? "";
  const dirty = (sourceId ? true : false) && body.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">
            {note ? "编辑笔记" : "新增笔记"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">来源类型</p>
            <div className="flex gap-2">
              {(
                [
                  ["course", "课程"],
                  ["case", "案例"],
                ] as [NoteSourceType, string][]
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setSourceType(k);
                    const first =
                      k === "course"
                        ? courseOptions[0]?.id ?? ""
                        : caseRefs[0]?.id ?? "";
                    setSourceId(first);
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                    sourceType === k
                      ? "bg-[#0e2a5e] text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">
              内容 {sourceType === "course" ? "（课程）" : "（案例）"}
            </p>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-[#0e2a5e]"
            >
              {options.length === 0 && <option value="">暂无可用来源</option>}
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">
              原文 / 划线摘录
              <span className="ml-1 font-normal text-slate-300">（选填）</span>
            </p>
            <textarea
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              rows={2}
              placeholder="阅读时划线的原文（未来选中文字自动带入）"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e]"
            />
          </div>

          <div>
            <p className="mb-1.5 text-xs font-semibold text-slate-500">
              我的笔记
              <span className="ml-1 font-normal text-slate-300">（必填）</span>
            </p>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="例如：先确认投资主体，再判断 KYC 范围。"
              className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e]"
            />
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!dirty}
            onClick={() =>
              onSave({
                noteId: note?.noteId,
                type: note?.type ?? "note",
                sourceType,
                sourceId,
                sourceTitle: resolvedTitle || note?.sourceTitle || sourceId,
                selectedText,
                note: body,
              })
            }
            className="rounded-lg bg-[#0e2a5e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#143a75] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {note ? "保存修改" : "保存笔记"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- 工具 ---------------- */

function fmtDate(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
