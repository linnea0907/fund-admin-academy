/**
 * Fund Admin Wiki — 知识工坊本地状态（V1.14.0）
 *
 * 设计（与 Case Backlog 同构，反过度工程）：
 * - 站点为静态站 + 构建期单一数据源，浏览器不能直接写源码；
 * - 因此「批量导入 / 待补充术语一键创建」在本机工作区（localStorage）中完成
 *   解析、校验、暂存与编辑，导出为 `content/glossary/imported.json`，
 *   由 `npm run gen:glossary`（prebuild 自动执行）烘焙进 `src/data/glossary/imported.ts`，
 *   下一次构建即全站（列表 / 详情页 / 正文标注 / 检索）生效。
 * - 本地 key 独立：fund-admin-academy-wiki-v1（与学习进度、案例工坊互不干扰）。
 */
import { emptyDraft, type TermDraft } from "@/lib/wiki-import";

export const WIKI_STORAGE_KEY = "fund-admin-academy-wiki-v1";

export interface WikiLocalState {
  version: 1;
  /** 已忽略的待补充术语（归一 key，小写） */
  ignored: string[];
  /** 暂存区：待导出的术语草稿 */
  staged: TermDraft[];
  updatedAt: number;
}

function normalizeDraft(raw: unknown): TermDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const d = emptyDraft();
  let hasContent = false;
  for (const k of Object.keys(d) as (keyof TermDraft)[]) {
    const v = o[k];
    if (typeof v === "string") {
      d[k] = v;
      if (v.trim()) hasContent = true;
    }
  }
  return hasContent ? d : null;
}

export function emptyWikiState(): WikiLocalState {
  return { version: 1, ignored: [], staged: [], updatedAt: Date.now() };
}

/** 从 localStorage 读取（SSR / 不可用时返回空状态） */
export function loadWikiState(): WikiLocalState {
  if (typeof window === "undefined") return emptyWikiState();
  try {
    const raw = window.localStorage.getItem(WIKI_STORAGE_KEY);
    if (!raw) return emptyWikiState();
    const parsed = JSON.parse(raw) as Partial<WikiLocalState>;
    const ignored = Array.isArray(parsed.ignored)
      ? parsed.ignored.filter((x): x is string => typeof x === "string")
      : [];
    const staged = Array.isArray(parsed.staged)
      ? parsed.staged.map(normalizeDraft).filter((x): x is TermDraft => x !== null)
      : [];
    return {
      version: 1,
      ignored,
      staged,
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
    };
  } catch {
    return emptyWikiState();
  }
}

export function saveWikiState(state: WikiLocalState): void {
  if (typeof window === "undefined") return;
  try {
    const payload: WikiLocalState = { ...state, version: 1, updatedAt: Date.now() };
    window.localStorage.setItem(WIKI_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("[wiki-admin] save failed:", err);
  }
}

/** 触发浏览器下载文本文件 */
export function downloadTextFile(filename: string, text: string, mime = "application/json"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 复制到剪贴板（失败返回 false，调用方提示手动复制） */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
