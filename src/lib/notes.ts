/**
 * 学习笔记数据层（V1.11 收藏夹 · V1.12 阅读高亮）
 *
 * - 独立 localStorage key（`fund-admin-academy-notes-v1`），不混入全局学习进度。
 * - 课程/案例正文选中文字 → 高亮/批注 由阅读引擎（HighlightEngine）写入同一结构。
 * - 三重定位字段（anchorId / selectedText / contextBefore|After）由 V1.12 起保存；
 *   恢复时按 Anchor → Text → Context → Fuzzy 四层匹配，永不使用字符坐标。
 * - 纯客户端模块：禁止在服务端 import（组件须走 ssr:false 或 mounted 后再读）。
 */
import type {
  HLStatus,
  NoteSourceType,
  NoteType,
  StudyNote,
} from "@/types";

export const NOTES_STORAGE_KEY = "fund-admin-academy-notes-v1";

export const NOTE_TYPES: { key: NoteType; label: string }[] = [
  { key: "note", label: "笔记" },
  { key: "highlight", label: "高亮" },
];

export const NOTE_SOURCES: { key: NoteSourceType; label: string }[] = [
  { key: "course", label: "课程" },
  { key: "case", label: "案例" },
];

export const HL_STATUS_META: {
  key: HLStatus;
  label: string;
  hint: string;
}[] = [
  { key: "active", label: "正常", hint: "" },
  {
    key: "partial",
    label: "部分匹配",
    hint: "内容已更新，系统已自动恢复定位",
  },
  {
    key: "lost",
    label: "失效",
    hint: "原内容已不存在，记录与批注已保留",
  },
];

export function noteTypeLabel(t: NoteType): string {
  return NOTE_TYPES.find((x) => x.key === t)?.label ?? t;
}

export function noteSourceLabel(t: NoteSourceType): string {
  return NOTE_SOURCES.find((x) => x.key === t)?.label ?? t;
}

export function hlStatusMeta(s?: HLStatus) {
  return HL_STATUS_META.find((x) => x.key === s) ?? null;
}

function normStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normTs(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : fallback;
}

/** 读取全部笔记（脏数据逐条清洗，坏记录丢弃） */
export function loadNotes(): StudyNote[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeNote).filter((n): n is StudyNote => n !== null);
  } catch {
    return [];
  }
}

/**
 * 结构清洗。注意：必须透传 V1.12 三重定位字段——
 * 若此处只挑白名单字段，读→改→写会静默丢掉用户的锚点与上下文（学习资产丢失，不可接受）。
 */
function normalizeNote(raw: unknown): StudyNote | null {
  if (!raw || typeof raw !== "object") return null;
  const n = raw as Record<string, unknown>;
  if (typeof n.noteId !== "string" || !/^Note-\d{3,}$/.test(n.noteId)) return null;
  const type: NoteType = n.type === "highlight" ? "highlight" : "note";
  const sourceType: NoteSourceType = n.sourceType === "case" ? "case" : "course";
  const note = normStr(n.note);
  // 手动笔记必须有内容；纯高亮允许空批注（note 可空），但必须有 selectedText
  if (type === "note" && !note) return null;
  const selectedText = normStr(n.selectedText);
  if (type === "highlight" && !selectedText) return null;
  const status: HLStatus | undefined =
    n.status === "partial" || n.status === "lost" || n.status === "active"
      ? (n.status as HLStatus)
      : undefined;
  return {
    noteId: n.noteId,
    type,
    sourceType,
    sourceId: normStr(n.sourceId),
    sourceTitle: normStr(n.sourceTitle),
    selectedText,
    note,
    ...(typeof n.anchorId === "string" && n.anchorId.trim()
      ? { anchorId: n.anchorId.trim() }
      : {}),
    ...(typeof n.contextBefore === "string" && n.contextBefore.trim()
      ? { contextBefore: n.contextBefore.trim() }
      : {}),
    ...(typeof n.contextAfter === "string" && n.contextAfter.trim()
      ? { contextAfter: n.contextAfter.trim() }
      : {}),
    ...(status ? { status } : {}),
    ...(typeof n.appVersion === "string" && n.appVersion.trim()
      ? { appVersion: n.appVersion.trim() }
      : {}),
    ...(typeof n.contentVersion === "string" && n.contentVersion.trim()
      ? { contentVersion: n.contentVersion.trim() }
      : {}),
    createdAt: normTs(n.createdAt, Date.now()),
    updatedAt: normTs(n.updatedAt, Date.now()),
  };
}

export function persistNotes(notes: StudyNote[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error("[fund-admin-academy] notes save failed:", err);
  }
}

/** 生成下一个 Note 序号（基于现有列表最大序号 + 1） */
export function nextNoteId(notes: StudyNote[]): string {
  let max = 0;
  for (const n of notes) {
    const m = /^Note-(\d+)$/.exec(n.noteId);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `Note-${String(max + 1).padStart(3, "0")}`;
}

export interface UpsertNoteInput {
  noteId?: string;
  type: NoteType;
  sourceType: NoteSourceType;
  sourceId: string;
  sourceTitle: string;
  selectedText: string;
  note: string;
  /** 以下为 V1.12 阅读高亮定位字段（可选；手动笔记不填） */
  anchorId?: string;
  contextBefore?: string;
  contextAfter?: string;
  status?: HLStatus;
  appVersion?: string;
  contentVersion?: string;
}

/** 新增或更新（有 noteId 则更新该条，否则新增） */
export function upsertNote(
  notes: StudyNote[],
  input: UpsertNoteInput
): { notes: StudyNote[]; saved: StudyNote } {
  const now = Date.now();
  const saved: StudyNote = {
    noteId: input.noteId ?? nextNoteId(notes),
    type: input.type,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    sourceTitle: input.sourceTitle.trim(),
    selectedText: input.selectedText.trim(),
    note: input.note.trim(),
    ...(input.anchorId?.trim() ? { anchorId: input.anchorId.trim() } : {}),
    ...(input.contextBefore?.trim()
      ? { contextBefore: input.contextBefore.trim() }
      : {}),
    ...(input.contextAfter?.trim()
      ? { contextAfter: input.contextAfter.trim() }
      : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.appVersion?.trim() ? { appVersion: input.appVersion.trim() } : {}),
    ...(input.contentVersion?.trim()
      ? { contentVersion: input.contentVersion.trim() }
      : {}),
    createdAt: now,
    updatedAt: now,
  };
  const exists = notes.some((n) => n.noteId === saved.noteId);
  const next = exists
    ? notes.map((n) => {
        const updated: StudyNote = {
          ...n,
          ...saved,
          createdAt: n.createdAt,
          updatedAt: now,
        };
        return n.noteId === saved.noteId ? updated : n;
      })
    : [saved, ...notes];
  persistNotes(next);
  return { notes: next, saved };
}

export function deleteNote(
  notes: StudyNote[],
  noteId: string
): StudyNote[] {
  const next = notes.filter((n) => n.noteId !== noteId);
  persistNotes(next);
  return next;
}

/** 就地修补单条字段（如恢复后回写 status），返回新数组并落盘 */
export function patchNote(
  notes: StudyNote[],
  noteId: string,
  patch: Partial<Pick<StudyNote, "status" | "anchorId">>
): StudyNote[] {
  let changed = false;
  const next = notes.map((n) => {
    if (n.noteId !== noteId) return n;
    const merged: StudyNote = { ...n, ...patch, updatedAt: n.updatedAt };
    changed = JSON.stringify(merged) !== JSON.stringify(n);
    return merged;
  });
  if (changed) persistNotes(next);
  return next;
}

/** 关键词匹配：标题 / 原文 / 笔记内容 */
export function matchNote(n: StudyNote, kw: string): boolean {
  const q = kw.trim().toLowerCase();
  if (!q) return true;
  return (
    n.sourceTitle.toLowerCase().includes(q) ||
    n.sourceId.toLowerCase().includes(q) ||
    n.selectedText.toLowerCase().includes(q) ||
    n.note.toLowerCase().includes(q)
  );
}

/* ================================================================
 * V1.17.0 知识分类 · 按来源自动归档
 *   收藏夹「学习笔记」顶部筛选由「系统属性」（课程 / 案例、高亮 / 正常）
 *   改为「知识分类」（按课程编号归档）。用户复习时关心的是
 *   「我在第几讲记了什么」，而非「这是高亮还是笔记」。
 * ================================================================ */

export interface NoteGroupCourse {
  id: string;
  title: string;
  /** required = 必修八讲（01/02/10/11/12/13/14/15）；elective = 选修 E01–E11 */
  kind: "required" | "elective";
}

export type NoteGroupKind = "all" | "required" | "elective" | "case" | "other";

export interface NoteGroup {
  /** `all` | `course:<课程id>` | `case` | `other:<来源id>` */
  key: string;
  kind: NoteGroupKind;
  /** 展示名：全部 / `02 基金结构全景` / 案例 */
  label: string;
  count: number;
  /** 组内笔记（最新在前） */
  notes: StudyNote[];
}

/**
 * 把笔记按来源归档成有序分组（收藏夹筛选栏数据源）：
 *   全部 → 必修课（课程编号升序）→ 选修课（课程编号升序）→ 案例 → 兜底分组。
 *
 * - 只有「全部」恒存在；其余分组**仅在有笔记时出现**（不展示空分类）。
 * - 组内排序：最新笔记在前（updatedAt 降序）。
 * - 兜底分组用于课程已下线 / sourceId 无法匹配的笔记，保证记录始终可见、可删。
 */
export function groupNotesBySource(
  notes: StudyNote[],
  courses: NoteGroupCourse[]
): NoteGroup[] {
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  const known = new Set(courses.map((c) => c.id));

  const byCourse = new Map<string, StudyNote[]>();
  const orphan = new Map<string, StudyNote[]>();
  const caseNotes: StudyNote[] = [];
  const bucket = (map: Map<string, StudyNote[]>, key: string) => {
    const list = map.get(key);
    if (list) return list;
    const created: StudyNote[] = [];
    map.set(key, created);
    return created;
  };
  for (const n of sorted) {
    if (n.sourceType === "case") {
      caseNotes.push(n);
      continue;
    }
    const target = known.has(n.sourceId) ? byCourse : orphan;
    bucket(target, n.sourceId).push(n);
  }

  const out: NoteGroup[] = [
    { key: "all", kind: "all", label: "全部", count: sorted.length, notes: sorted },
  ];

  for (const c of courses) {
    const list = byCourse.get(c.id);
    if (!list || list.length === 0) continue;
    out.push({
      key: `course:${c.id}`,
      kind: c.kind,
      label: `${c.id} ${c.title}`,
      count: list.length,
      notes: list,
    });
  }

  if (caseNotes.length > 0) {
    out.push({
      key: "case",
      kind: "case",
      label: "案例",
      count: caseNotes.length,
      notes: caseNotes,
    });
  }

  for (const [sourceId, list] of orphan) {
    out.push({
      key: `other:${sourceId}`,
      kind: "other",
      label: list[0].sourceTitle || sourceId || "未知来源",
      count: list.length,
      notes: list,
    });
  }

  return out;
}
