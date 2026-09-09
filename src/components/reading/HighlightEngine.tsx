"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NoteSourceType, StudyNote } from "@/types";
import {
  deleteNote,
  loadNotes,
  nextNoteId,
  persistNotes,
} from "@/lib/notes";
import {
  clampCtx,
  normalizeText,
  locateRecord,
  type ReadingBlock,
} from "@/lib/reading";
import { siteConfig } from "@/lib/site-config";

/**
 * 阅读高亮引擎（V1.12）
 *
 * 职责：
 * 1. 扫描阅读区块级元素（p / li / blockquote），按「scope + tag + 序号」生成确定性锚点
 *    （与 lib/reading.buildCourseBlocks 规则一致），永不使用字符坐标。
 * 2. 挂载 / 数据变化时按 Anchor → Text → Context → Fuzzy(≥90%) 四层恢复，
 *    命中处包 <mark data-hl="Note-xxx">；模糊恢复标 data-status="partial"；找不到记 lost 保留记录。
 * 3. 选中文字浮出菜单（高亮 / 写笔记 / 复制）；长按选择在移动端同样触发（selectionchange）。
 * 4. 支持从 URL ?hl=Note-xxx 进入时滚动并闪烁定位；点选既有 mark 可移除。
 *
 * 本组件为纯客户端，父页面须在内容渲染完成后才置 ready。
 */

const BLOCK_SELECTOR = "p, li, blockquote";

/* ---------- 文本节点分片（块内全部 Text 节点 + 原始偏移） ---------- */
interface TextPiece {
  node: Text;
  start: number;
  end: number;
}

function collectTextPieces(el: HTMLElement): TextPiece[] {
  const out: TextPiece[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let n: Node | null = walker.nextNode();
  while (n) {
    const len = (n as Text).data.length;
    out.push({ node: n as Text, start: offset, end: offset + len });
    offset += len;
    n = walker.nextNode();
  }
  return out;
}

interface NormMap {
  norm: string;
  /** 规范化后每字符的原始起始下标 */
  starts: number[];
  /** 规范化后每字符的原始结束下标（含该字符，rawEnd = 其原始区间的 end） */
  ends: number[];
}

/** 空白折叠 + 去零宽 + 两端 trim，并同步原始下标映射（供 wrap 用） */
function normalizeWithRaw(raw: string): NormMap {
  const starts: number[] = [];
  const ends: number[] = [];
  let norm = "";
  let inWs = false;
  let wsStart = -1;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (/[\u200b-\u200d\u2060\ufeff]/.test(ch)) continue;
    if (/\s/.test(ch)) {
      if (!inWs) {
        inWs = true;
        wsStart = i;
      }
      continue;
    }
    if (inWs) {
      inWs = false;
      if (norm.length > 0) {
        starts.push(wsStart);
        ends.push(i);
        norm += " ";
      }
    }
    starts.push(i);
    ends.push(i + 1);
    norm += ch;
  }
  return { norm, starts, ends };
}

/* ---------- 块扫描 ---------- */
interface BlockScan extends ReadingBlock {
  el: HTMLElement;
  pieces: TextPiece[];
  normText: string;
  starts: number[];
  ends: number[];
}

const SCOPED_TAGS = new Set(["P", "LI", "BLOCKQUOTE"]);

/** 扫描容器内所有 [data-reading-scope] 下的块，赋确定性锚点 */
function scanBlocks(container: HTMLElement): BlockScan[] {
  const out: BlockScan[] = [];
  const scopes = container.querySelectorAll<HTMLElement>("[data-reading-scope]");
  scopes.forEach((scope) => {
    const scopeId = scope.getAttribute("data-reading-scope") ?? "";
    const counters: Record<string, number> = {};
    const els = scope.querySelectorAll<HTMLElement>(BLOCK_SELECTOR);
    els.forEach((el) => {
      if (el.closest("[data-reading-scope]") !== scope) return;
      const tag = el.tagName.toLowerCase();
      counters[tag] = (counters[tag] ?? 0) + 1;
      const seq = counters[tag] - 1;
      const pieces = collectTextPieces(el);
      const rawText = pieces.map((p) => p.node.data).join("");
      const map = normalizeWithRaw(rawText);
      out.push({
        anchorId: `${scopeId}-${tag}${seq}`,
        text: rawText,
        el,
        pieces,
        normText: map.norm,
        starts: map.starts,
        ends: map.ends,
      });
    });
  });
  return out;
}

function unwrapMarks(container: HTMLElement): void {
  container.querySelectorAll("mark[data-hl]").forEach((m) => {
    const parent = m.parentNode;
    if (!parent) return;
    while (m.firstChild) parent.insertBefore(m.firstChild, m);
    parent.removeChild(m);
  });
}

/* ---------- 在块内按规范化区间包 mark ---------- */
function wrapRangeInBlock(
  scan: BlockScan,
  normS: number,
  normE: number,
  hlId: string,
  partial: boolean
): boolean {
  if (normS < 0 || normE <= normS || normE > scan.normText.length) return false;
  const rawS = scan.starts[normS];
  const rawE = scan.ends[normE - 1];
  const pieces = scan.pieces;
  let wrapped = false;
  for (const p of pieces) {
    const segS = Math.max(rawS, p.start);
    const segE = Math.min(rawE, p.end);
    if (segS >= segE) continue;
    const parent = p.node.parentNode;
    if (!parent) continue;
    const data = p.node.data;
    const relS = segS - p.start;
    const relE = segE - p.start;
    const mark = document.createElement("mark");
    mark.setAttribute("data-hl", hlId);
    if (partial) {
      mark.setAttribute("data-status", "partial");
      mark.title = "内容已更新，系统已自动恢复定位";
    }
    const before = data.slice(0, relS);
    const mid = data.slice(relS, relE);
    const after = data.slice(relE);
    if (before) parent.insertBefore(document.createTextNode(before), p.node);
    mark.appendChild(document.createTextNode(mid));
    parent.insertBefore(mark, p.node);
    if (after) parent.insertBefore(document.createTextNode(after), p.node);
    parent.removeChild(p.node);
    wrapped = true;
  }
  return wrapped;
}

/* ---------- 选区 → 块内规范化区间 ---------- */
function rangeToNormOffsets(
  scan: BlockScan,
  range: Range
): { s: number; e: number } | null {
  const pieces = scan.pieces;
  const locatePos = (node: Node, offset: number): number | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      const p = pieces.find((x) => x.node === node);
      if (!p) return null;
      return p.start + Math.max(0, Math.min(offset, p.end - p.start));
    }
    // Element 边界（少见）：offset 计子节点；近似取首个/末个文本位置
    const el = node as Element;
    const firstText = findFirstText(el);
    const lastText = findLastText(el);
    if (offset === 0 || !firstText || !lastText) {
      if (!firstText) return null;
      const p = pieces.find((x) => x.node === firstText);
      return p ? p.start : null;
    }
    const p = pieces.find((x) => x.node === lastText);
    return p ? p.end : null;
  };
  const s = locatePos(range.startContainer, range.startOffset);
  const e = locatePos(range.endContainer, range.endOffset);
  if (s === null || e === null || e <= s) return null;
  // 转规范化下标：二分 starts
  const toNorm = (raw: number): number => {
    let lo = 0;
    let hi = scan.starts.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (scan.starts[mid] <= raw) lo = mid + 1;
      else hi = mid;
    }
    return lo - 1;
  };
  let ns = toNorm(s);
  let ne = toNorm(e - 1) + 1;
  // 掐掉两端空白
  while (ns < ne && /\s/.test(scan.normText[ns])) ns++;
  while (ne > ns && /\s/.test(scan.normText[ne - 1])) ne--;
  if (ne <= ns) return null;
  return { s: ns, e: ne };
}

function findFirstText(el: Element): Text | null {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  return w.nextNode() as Text | null;
}
function findLastText(el: Element): Text | null {
  const all: Text[] = [];
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let n: Node | null;
  while ((n = w.nextNode())) all.push(n as Text);
  return all[all.length - 1] ?? null;
}

/* ---------- 组件 ---------- */

export interface HighlightEngineProps {
  sourceType: NoteSourceType;
  /** course = lesson.id（如 "01"）；case = Case id（如 "Case-001"） */
  sourceId: string;
  sourceTitle: string;
  contentVersion?: string;
  /** 包含 [data-reading-scope] 区域的容器 ref（正文渲染完成后传入） */
  scopeRef: React.RefObject<HTMLElement | null>;
  /** 阅读正文是否就绪（课程恒 true；案例正文未导入时为 false） */
  ready?: boolean;
}

type MenuMode = "selection" | "mark";

interface SelDraft {
  anchorId: string;
  selectedText: string;
  contextBefore: string;
  contextAfter: string;
}

interface BubbleState {
  mode: MenuMode;
  x: number;
  y: number;
  draft: SelDraft | null;
  /** mark 模式下命中的记录 */
  record: StudyNote | null;
  existingId: string | null;
}

export default function HighlightEngine({
  sourceType,
  sourceId,
  sourceTitle,
  contentVersion,
  scopeRef,
  ready = true,
}: HighlightEngineProps) {
  const [notes, setNotes] = useState<StudyNote[]>(() => loadNotes());
  const [bubble, setBubble] = useState<BubbleState | null>(null);
  const [modal, setModal] = useState<{
    draft: SelDraft;
    noteId: string | null;
    note: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);
  const flashTimer = useRef<number | null>(null);
  const applied = useRef(false);

  const sourceRecords = useMemo(
    () =>
      notes.filter(
        (n) => n.type === "highlight" && n.sourceType === sourceType && n.sourceId === sourceId
      ),
    [notes, sourceType, sourceId]
  );

  const showToast = useCallback((text: string) => {
    setToast(text);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const existsFor = useCallback(
    (draft: SelDraft): StudyNote | null =>
      sourceRecords.find(
        (n) =>
          n.sourceId === sourceId &&
          n.anchorId === draft.anchorId &&
          normalizeText(n.selectedText) === normalizeText(draft.selectedText)
      ) ?? null,
    [sourceRecords, sourceId]
  );

  /* ---------- 恢复 + 落色 ---------- */
  const applyAll = useCallback(() => {
    const container = scopeRef.current;
    if (!container || !ready) return;
    unwrapMarks(container);
    const blocks = scanBlocks(container);

    let dirty = false;
    const resultById = new Map<
      string,
      { block: BlockScan; s: number; e: number; partial: boolean }
    >();
    const statusPatch: { noteId: string; status: "active" | "partial" | "lost" }[] = [];

    for (const rec of sourceRecords) {
      if (!rec.selectedText?.trim()) continue;
      const hit = locateRecord(rec, blocks);
      if (hit.found) {
        const b = blocks[hit.blockIndex];
        if (b) {
          resultById.set(rec.noteId, {
            block: b,
            s: hit.start,
            e: hit.end,
            partial: hit.status === "partial",
          });
        }
      }
      const wanted: "active" | "partial" | "lost" = hit.found ? hit.status : "lost";
      if (rec.status !== wanted) {
        statusPatch.push({ noteId: rec.noteId, status: wanted });
        dirty = true;
      }
    }

    resultById.forEach((r, id) => {
      wrapRangeInBlock(r.block, r.s, r.e, id, r.partial);
    });

    if (dirty && statusPatch.length > 0) {
      const next = notes.map((n) => {
        const p = statusPatch.find((x) => x.noteId === n.noteId);
        return p && n.status !== p.status ? { ...n, status: p.status } : n;
      });
      setNotes(next);
      persistNotes(next);
    }
    applied.current = true;
  }, [scopeRef, ready, sourceRecords, notes]);

  useEffect(() => {
    if (ready) applyAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, sourceRecords, sourceId, sourceType]);

  /* ?hl=Note-xxx 定位闪烁（到达本页/内容渲染后） */
  useEffect(() => {
    if (!ready || !applied.current) return;
    const hl = new URLSearchParams(window.location.search).get("hl");
    if (!hl) return;
    const marks = scopeRef.current?.querySelectorAll(`mark[data-hl="${hl}"]`) ?? [];
    if (marks.length === 0) {
      const rec = sourceRecords.find((n) => n.noteId === hl);
      if (rec) {
        // 推迟到下一帧再提示，避免在 effect 体内同步 setState
        window.setTimeout(() => showToast("未能定位该高亮：原内容可能已更新"), 0);
      }
      return;
    }
    const first = marks[0] as HTMLElement;
    first.scrollIntoView({ behavior: "smooth", block: "center" });
    marks.forEach((m) => m.classList.add("hl-flash"));
    if (flashTimer.current) window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => {
      marks.forEach((m) => m.classList.remove("hl-flash"));
    }, 1800);
  }, [ready, sourceRecords, applied, scopeRef, showToast]);

  /* ---------- 悬浮菜单（选中文字 / 点选既有 mark） ---------- */

  const hideBubble = useCallback(() => setBubble(null), []);

  useEffect(() => {
    const container = scopeRef.current;
    if (!container) return;

    const isEditable = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.isContentEditable || t.tagName === "INPUT" || t.tagName === "TEXTAREA");

    const showForSelection = () => {
      if (!ready) return;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (!range || range.collapsed) return;
      const text = normalizeText(sel.toString());
      if (!text) return;

      const startBlock = blockAncestor(range.startContainer, container);
      const endBlock = blockAncestor(range.endContainer, container);
      if (!startBlock || startBlock !== endBlock) return;
      const scopeEl = startBlock.closest<HTMLElement>("[data-reading-scope]");
      if (!scopeEl) return;

      // 现算该块的扫描（含确定性锚点），避免与扫描表错位
      const scans = scanBlocks(container);
      const scan = scans.find((b) => b.el === startBlock);
      if (!scan) return;
      const normRange = rangeToNormOffsets(scan, range);
      if (!normRange) return;
      const selText = scan.normText.slice(normRange.s, normRange.e);
      if (!selText.trim()) return;

      const ctxB = scan.normText.slice(0, normRange.s);
      const ctxA = scan.normText.slice(normRange.e);
      const draft: SelDraft = {
        anchorId: scan.anchorId,
        selectedText: selText.trim(),
        contextBefore: clampCtx(ctxB),
        contextAfter: clampCtx(ctxA, 60),
      };

      const rect = range.getBoundingClientRect();
      const vw = window.innerWidth;
      const x = Math.min(Math.max(rect.left, 8), vw - 200);
      let y = rect.top - 46;
      if (y < 8) y = rect.bottom + 10;
      setBubble({
        mode: "selection",
        x,
        y,
        draft,
        record: null,
        existingId: existsFor(draft)?.noteId ?? null,
      });
    };

    const onMouseUp = (e: MouseEvent) => {
      if (isEditable(e.target)) return;
      window.setTimeout(showForSelection, 30);
    };
    const onSelectionChange = () => {
      window.setTimeout(showForSelection, 160);
    };
    const onClick = (e: MouseEvent) => {
      if (isEditable(e.target)) return;
      const target = e.target as HTMLElement;
      const markEl = target.closest("mark[data-hl]");
      if (markEl) {
        e.preventDefault();
        const id = markEl.getAttribute("data-hl") ?? "";
        const rec = sourceRecords.find((n) => n.noteId === id);
        const rect = markEl.getBoundingClientRect();
        const x = Math.min(Math.max(rect.left, 8), window.innerWidth - 220);
        const y = Math.max(rect.top - 46, 8);
        setBubble({ mode: "mark", x, y, draft: null, record: rec ?? null, existingId: null });
        return;
      }
      // 点击悬浮菜单/弹窗内部不提前关闭（避免与按钮动作竞态）
      if (target.closest('[role="menu"], [role="dialog"]')) return;
      hideBubble();
    };
    const onScroll = () => hideBubble();

    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("click", onClick, true);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [ready, existsFor, hideBubble, sourceRecords, showToast, scopeRef]);

  /* ---------- 动作 ---------- */

  const createRecord = useCallback(
    (draft: SelDraft, note: string) => {
      const existing = existsFor(draft);
      const now = Date.now();
      const saved: StudyNote = {
        noteId: existing?.noteId ?? nextNoteId(notes),
        type: "highlight",
        sourceType,
        sourceId,
        sourceTitle,
        selectedText: draft.selectedText,
        note: note.trim(),
        anchorId: draft.anchorId,
        contextBefore: draft.contextBefore,
        contextAfter: draft.contextAfter,
        status: "active",
        appVersion: siteConfig.version,
        ...(contentVersion ? { contentVersion } : {}),
        createdAt: now,
        updatedAt: now,
      };
      const next = existing
        ? notes.map((n) => (n.noteId === existing.noteId ? { ...n, ...saved, createdAt: n.createdAt } : n))
        : [saved, ...notes];
      persistNotes(next);
      setNotes(next);
      setBubble(null);
      setModal(null);
      return saved;
    },
    [notes, existsFor, sourceType, sourceId, sourceTitle, contentVersion]
  );

  const onHighlight = useCallback(() => {
    if (!bubble?.draft) return;
    if (bubble.existingId) {
      showToast("这段文字已高亮，可直接点「写笔记」补充批注");
      return;
    }
    createRecord(bubble.draft, "");
    showToast("已高亮 ✓");
  }, [bubble, createRecord, showToast]);

  const onWriteNote = useCallback(() => {
    // 选区模式用 draft；点选 mark 模式从记录还原 draft（保留原锚点与上下文）
    let draft = bubble?.draft ?? null;
    let existing: StudyNote | null = null;
    if (bubble?.mode === "selection" && bubble.existingId) {
      existing = sourceRecords.find((n) => n.noteId === bubble.existingId) ?? null;
    }
    if (bubble?.mode === "mark" && bubble.record) {
      const rec = bubble.record;
      draft = {
        anchorId: rec.anchorId ?? "",
        selectedText: rec.selectedText,
        contextBefore: rec.contextBefore ?? "",
        contextAfter: rec.contextAfter ?? "",
      };
      existing = rec;
    }
    if (!draft) return;
    setBubble(null);
    setModal({
      draft,
      noteId: existing?.noteId ?? null,
      note: existing?.note ?? "",
    });
  }, [bubble, sourceRecords]);

  const onCopy = useCallback(() => {
    if (!bubble?.draft) return;
    navigator.clipboard
      ?.writeText(bubble.draft.selectedText)
      .then(() => showToast("已复制到剪贴板"))
      .catch(() => showToast("复制失败，请手动复制"));
  }, [bubble, showToast]);

  const onRemoveMark = useCallback(() => {
    if (!bubble?.record) return;
    const rec = bubble.record;
    if (rec.note && !window.confirm("该高亮带有批注，移除高亮将同时删除批注与记录，确定吗？")) {
      return;
    }
    setNotes((prev) => deleteNote(prev, rec.noteId));
    setBubble(null);
    showToast("已移除高亮");
  }, [bubble, showToast]);

  /* ---------- 渲染 ---------- */

  return (
    <>
      {bubble && (
        <div
          role="menu"
          className="fixed z-[70] flex items-center gap-1 rounded-xl bg-slate-900/95 px-1.5 py-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur"
          style={{ left: bubble.x, top: bubble.y }}
        >
          {bubble.mode === "selection" ? (
            <>
              <button
                type="button"
                onClick={onHighlight}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  bubble.existingId
                    ? "bg-amber-300/20 text-amber-300"
                    : "bg-amber-300 text-amber-950 hover:bg-amber-200"
                }`}
              >
                {bubble.existingId ? "已高亮" : "高亮"}
              </button>
              <button
                type="button"
                onClick={onWriteNote}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                写笔记
              </button>
              <button
                type="button"
                onClick={onCopy}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                复制
              </button>
            </>
          ) : (
            <>
              <span className="max-w-[180px] truncate px-2 text-xs text-slate-400">
                {bubble.record?.note
                  ? `已批注 · ${bubble.record.note.slice(0, 12)}…`
                  : "高亮"}
              </span>
              <button
                type="button"
                onClick={onWriteNote}
                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                {bubble.record?.note ? "编辑批注" : "写笔记"}
              </button>
              <button
                type="button"
                onClick={onRemoveMark}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200"
              >
                移除高亮
              </button>
            </>
          )}
        </div>
      )}

      {modal && (
        <NoteModal
          initialNote={modal.note}
          isEdit={Boolean(modal.noteId)}
          onClose={() => setModal(null)}
          onSave={(note) => {
            createRecord(modal.draft, note);
            showToast(modal.noteId ? "批注已更新" : "已高亮并写入批注 ✓");
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-slate-800/95 px-4 py-2 text-xs font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}

/* ---------- 工具：找块祖先 ---------- */
function blockAncestor(node: Node, root: HTMLElement): HTMLElement | null {
  let cur: Node | null = node;
  while (cur && cur !== root) {
    if (cur.nodeType === Node.ELEMENT_NODE && SCOPED_TAGS.has((cur as Element).tagName)) {
      return cur as HTMLElement;
    }
    cur = cur.parentNode;
  }
  return null;
}

/* ---------- 批注弹窗 ---------- */
function NoteModal({
  initialNote,
  isEdit,
  onClose,
  onSave,
}: {
  initialNote: string;
  isEdit: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
}) {
  const [body, setBody] = useState(initialNote);
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[75] flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">我的笔记</h3>
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
        <p className="mt-1 text-xs text-slate-400">
          批注将随高亮一起保留；内容升级后系统会自动恢复定位。
        </p>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="例如：先确认投资主体，再判断 KYC 范围。"
          className="mt-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-[#0e2a5e] focus:bg-white"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
          >
            取消
          </button>
          <button
            type="button"
            disabled={!isEdit && !body.trim()}
            onClick={() => onSave(body)}
            className="rounded-lg bg-[#0e2a5e] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#143a75] disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
