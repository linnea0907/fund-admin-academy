/**
 * 学习笔记数据层（V1.11 收藏夹 · 学习笔记 Tab）
 *
 * - 独立 localStorage key（`fund-admin-academy-notes-v1`），不混入全局学习进度。
 * - 与未来「阅读划线」共用同一结构：课程/案例正文选中文字 → 高亮/批注，
 *   由阅读浮窗写入；当前版本仅页面手动新增 + CRUD（划线 UI 见 V1.12+）。
 * - 纯客户端模块：禁止在服务端 import（组件须走 ssr:false 或 mounted 后再读）。
 */
import type { NoteSourceType, NoteType, StudyNote } from "@/types";

export const NOTES_STORAGE_KEY = "fund-admin-academy-notes-v1";

export const NOTE_TYPES: { key: NoteType; label: string }[] = [
  { key: "note", label: "笔记" },
  { key: "highlight", label: "高亮" },
];

export const NOTE_SOURCES: { key: NoteSourceType; label: string }[] = [
  { key: "course", label: "课程" },
  { key: "case", label: "案例" },
];

export function noteTypeLabel(t: NoteType): string {
  return NOTE_TYPES.find((x) => x.key === t)?.label ?? t;
}

export function noteSourceLabel(t: NoteSourceType): string {
  return NOTE_SOURCES.find((x) => x.key === t)?.label ?? t;
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

function normalizeNote(raw: unknown): StudyNote | null {
  if (!raw || typeof raw !== "object") return null;
  const n = raw as Record<string, unknown>;
  if (typeof n.noteId !== "string" || !/^Note-\d{3,}$/.test(n.noteId)) return null;
  const type: NoteType = n.type === "highlight" ? "highlight" : "note";
  const sourceType: NoteSourceType = n.sourceType === "case" ? "case" : "course";
  const note = typeof n.note === "string" ? n.note.trim() : "";
  if (!note) return null;
  return {
    noteId: n.noteId,
    type,
    sourceType,
    sourceId: typeof n.sourceId === "string" ? n.sourceId : "",
    sourceTitle: typeof n.sourceTitle === "string" ? n.sourceTitle : "",
    selectedText: typeof n.selectedText === "string" ? n.selectedText.trim() : "",
    note,
    createdAt: typeof n.createdAt === "number" ? n.createdAt : Date.now(),
    updatedAt: typeof n.updatedAt === "number" ? n.updatedAt : Date.now(),
  };
}

function persist(notes: StudyNote[]): void {
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
  persist(next);
  return { notes: next, saved };
}

export function deleteNote(
  notes: StudyNote[],
  noteId: string
): StudyNote[] {
  const next = notes.filter((n) => n.noteId !== noteId);
  persist(next);
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

/** 按类型 / 来源类型计数（空态与统计共用） */
export function noteCounts(notes: StudyNote[]) {
  return {
    total: notes.length,
    course: notes.filter((n) => n.sourceType === "course").length,
    case: notes.filter((n) => n.sourceType === "case").length,
    highlight: notes.filter((n) => n.type === "highlight").length,
    note: notes.filter((n) => n.type === "note").length,
  };
}
