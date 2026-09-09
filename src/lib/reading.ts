/**
 * 阅读定位引擎（V1.12 高亮划线与学习笔记）
 *
 * 设计红线：永不使用「字符坐标」定位高亮。课程/案例内容增删 → 坐标全偏 → 高亮全失效，不可接受。
 * 每条高亮记录保存 anchorId + selectedText + contextBefore/After，恢复顺序：
 *   1 Anchor 命中（块级锚点；内容结构未变时精确定位）
 *   2 完整文本匹配（Anchor 失效时全文搜索 selectedText）
 *   3 Context 匹配（同句多次出现 / 结构调整时用上下文辨位）
 *   4 模糊匹配（课程小幅修改，≥90% 相似度恢复）
 * 状态：active=正常(Anchor/Text/Context 精确命中) / partial=模糊恢复成功 / lost=找不到
 *
 * 本模块为纯函数 + 纯客户端（不触碰 DOM / localStorage），便于收藏夹页复用做实时状态判定。
 */
import type { Lesson, StudyNote } from "@/types";
import type { HLStatus } from "@/types";

/* ================= 文本规范化 ================= */

/** 空白折叠 + trim + 去零宽字符；中文间空格保留单空格，避免吞词 */
export function normalizeText(s: string): string {
  return s
    .replace(/[\u200b-\u200d\u2060\ufeff]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** 截断到上下文窗口（默认 60 字符） */
export function clampCtx(s: string, max = 60): string {
  const t = normalizeText(s);
  return t.length > max ? t.slice(t.length - max) : t;
}

/* ================= 相似度（Levenshtein ratio） ================= */

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  if (la > lb) {
    // 保证 a 是较短者，压缩 DP 行宽
    [a, b] = [b, a];
  }
  const row = Array.from({ length: a.length + 1 }, (_, i) => i);
  for (let j = 1; j <= b.length; j++) {
    let prevDiag = row[0];
    row[0] = j;
    for (let i = 1; i <= a.length; i++) {
      const prev = row[i];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[i] = Math.min(row[i] + 1, row[i - 1] + 1, prevDiag + cost);
      prevDiag = prev;
    }
  }
  return row[a.length];
}

export function similarity(a: string, b: string): number {
  const la = a.length;
  const lb = b.length;
  if (la === 0 && lb === 0) return 1;
  if (la === 0 || lb === 0) return 0;
  return 1 - levenshtein(a, b) / Math.max(la, lb);
}

/* ================= 块级结构与定位 ================= */

export interface ReadingBlock {
  /** 块级锚点，如 "01-m1-p0" / "Case-001-scenario-p0" */
  anchorId: string;
  /** 块内全部文字（原文；locate 内部会再规范化） */
  text: string;
}

export interface LocateHit {
  found: true;
  /** 命中块下标（对应传入 blocks） */
  blockIndex: number;
  /** 命中区间（在规范化后的块文本上） */
  start: number;
  end: number;
  /** 匹配方式 */
  method: "anchor" | "text" | "context" | "anchor-fuzzy" | "context-fuzzy" | "fuzzy";
  /** 恢复状态 */
  status: HLStatus;
  similarity: number;
}

export interface LocateMiss {
  found: false;
  status: "lost";
}

export type LocateResult = LocateHit | LocateMiss;

const FUZZY_MIN_SIM = 0.9;

/**
 * 模糊查找：在 haystack 内找与 needle 相似度 ≥ minSim 的窗口。
 * 窗口长度允许 ±6 个字符（应对插入/删除少量词）。返回区间（规范化文本上）。
 */
export function fuzzyFind(
  needle: string,
  haystack: string,
  minSim = FUZZY_MIN_SIM
): { start: number; end: number; sim: number } | null {
  const n = needle.length;
  const h = haystack.length;
  if (n === 0 || h === 0) return null;
  const minLen = Math.max(1, Math.floor(n * 0.7));
  const maxLen = Math.min(h, Math.ceil(n * 1.6) + 1);
  let best: { start: number; end: number; sim: number } | null = null;
  for (let len = minLen; len <= maxLen; len++) {
    const step = len <= 40 ? 1 : 2;
    for (let s = 0; s + len <= h; s += step) {
      const win = haystack.slice(s, s + len);
      const sim = similarity(needle, win);
      if (sim >= minSim && (!best || sim > best.sim)) {
        best = { start: s, end: s + len, sim };
        if (sim >= 0.999) return best;
      }
    }
  }
  return best;
}

interface LocateInput {
  anchorId?: string;
  selectedText: string;
  contextBefore?: string;
  contextAfter?: string;
}

/**
 * 四层定位。返回：
 * - found + status=active：Anchor / Text / Context 精确命中
 * - found + status=partial：模糊恢复成功（anchor-fuzzy / context-fuzzy / fuzzy）
 * - lost：四层均未命中（记录保留，不自动删除）
 */
export function locateRecord(input: LocateInput, blocks: ReadingBlock[]): LocateResult {
  const needle = normalizeText(input.selectedText);
  if (!needle || blocks.length === 0) {
    return { found: false, status: "lost" };
  }

  const ctxB = input.contextBefore ? normalizeText(input.contextBefore) : "";
  const ctxA = input.contextAfter ? normalizeText(input.contextAfter) : "";

  // —— Tier 1：Anchor 命中 ——
  if (input.anchorId) {
    const anchorBlocks = blocks
      .map((b, i) => ({ b, i }))
      .filter((x) => x.b.anchorId === input.anchorId);
    for (const { b, i } of anchorBlocks) {
      const text = normalizeText(b.text);
      const exact = text.indexOf(needle);
      if (exact >= 0) {
        return {
          found: true,
          blockIndex: i,
          start: exact,
          end: exact + needle.length,
          method: "anchor",
          status: "active",
          similarity: 1,
        };
      }
      // Anchor 命中但文字已有小改 → 仅在该块内模糊恢复
      const f = fuzzyFind(needle, text);
      if (f) {
        return {
          found: true,
          blockIndex: i,
          start: f.start,
          end: f.end,
          method: "anchor-fuzzy",
          status: "partial",
          similarity: f.sim,
        };
      }
    }
  }

  // —— Tier 2：完整文本匹配（全文精确） ——
  for (let i = 0; i < blocks.length; i++) {
    const text = normalizeText(blocks[i].text);
    const exact = text.indexOf(needle);
    if (exact >= 0) {
      return {
        found: true,
        blockIndex: i,
        start: exact,
        end: exact + needle.length,
        method: "text",
        status: "active",
        similarity: 1,
      };
    }
  }

  // —— Tier 3：Context 辨位（限定候选块） ——
  const hasCtx = Boolean(ctxB || ctxA);
  if (hasCtx) {
    const ctxCands = blocks
      .map((b, i) => ({ b, i }))
      .filter(({ b }) => {
        const t = normalizeText(b.text);
        return (ctxB && t.includes(ctxB)) || (ctxA && t.includes(ctxA));
      });
    for (const { b, i } of ctxCands) {
      const text = normalizeText(b.text);
      const exact = text.indexOf(needle);
      if (exact >= 0) {
        return {
          found: true,
          blockIndex: i,
          start: exact,
          end: exact + needle.length,
          method: "context",
          status: "active",
          similarity: 1,
        };
      }
      const f = fuzzyFind(needle, text);
      if (f) {
        return {
          found: true,
          blockIndex: i,
          start: f.start,
          end: f.end,
          method: "context-fuzzy",
          status: "partial",
          similarity: f.sim,
        };
      }
    }
  }

  // —— Tier 4：全文模糊匹配 ——
  for (let i = 0; i < blocks.length; i++) {
    const text = normalizeText(blocks[i].text);
    const f = fuzzyFind(needle, text);
    if (f) {
      return {
        found: true,
        blockIndex: i,
        start: f.start,
        end: f.end,
        method: "fuzzy",
        status: "partial",
        similarity: f.sim,
      };
    }
  }

  return { found: false, status: "lost" };
}

/* ================= 课程块镜像（收藏夹实时状态判定用） ================= */

/**
 * 依据课程数据结构镜像 DOM 块锚点（与阅读页扫描规则一致）：
 * 每个模块 article 内，正文 <p> 按 p0.. 计数、要点 <li> 按 li0.. 计数。
 * 收藏夹页无需渲染正文即可对课程笔记做实时四层状态判定。
 */
export function buildCourseBlocks(lesson: Lesson): ReadingBlock[] {
  const blocks: ReadingBlock[] = [];
  for (const m of lesson.modules) {
    const prefix = `${lesson.id}-${m.id}`;
    m.body.forEach((p, i) => {
      if (p.trim()) blocks.push({ anchorId: `${prefix}-p${i}`, text: p });
    });
    (m.points ?? []).forEach((pt, i) => {
      if (pt.trim()) blocks.push({ anchorId: `${prefix}-li${i}`, text: pt });
    });
  }
  return blocks;
}

/** 高亮记录能否参与定位（有摘录文字才算） */
export function hasLocator(n: StudyNote): boolean {
  return Boolean(n.selectedText?.trim()) && n.type === "highlight";
}
