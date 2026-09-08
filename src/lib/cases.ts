/**
 * Case Library V2 — 案例数据模块（仅服务端使用）
 *
 * - 内容源：content/cases/Case-001.md … Case-025.md（Markdown 单文件承载全部字段）
 * - 文件结构：frontmatter 元数据（id/title/level/module/tags/estimatedTime）+ `# 中文小节`
 *   小节 key 顺序固定（见 CASE_SECTIONS）：场景背景 → 已收到资料 → 缺失资料 → 你的判断 →
 *   标准答案 → 理由分析 → 常见错误 → 客户沟通示例 → ICS SOP依据 → Takeaway
 * - 标准答案以 ICS 内部 SOP 为准，不由通用教材/监管理论替代
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CaseId, CaseMeta, CaseData, CaseSectionKey } from "@/types";
import { SECTION_LABEL_TO_KEY } from "@/lib/case-modules";

export const CASE_DIR = path.join(process.cwd(), "content", "cases");

/** 移除 Markdown 中的 HTML 注释（骨架占位注释不应视为内容） */
function stripComments(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, "");
}

/** 从文件名解析 Case id：Case-001.md → "Case-001" */
export function caseIdFromFile(file: string): CaseId | null {
  const m = /^(Case-\d{3,})\.md$/i.exec(file);
  return m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : null;
}

function normalizeTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((t) => String(t).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function normalizeStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function normalizeModule(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : 0;
}

function normalizeTime(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

/** 解析正文：按 `# 中文标题` 切分（仅识别注册过的小节；其余行归入当前小节） */
function splitSections(body: string): Partial<Record<CaseSectionKey, string>> {
  const out: Partial<Record<CaseSectionKey, string>> = {};
  const lines = body.split(/\r?\n/);
  let cur: CaseSectionKey | null = null;
  const buf: string[] = [];

  const flush = () => {
    if (cur) {
      const stripped = stripComments(buf.join("\n")).trim();
      if (stripped) out[cur] = stripped;
    }
    buf.length = 0;
  };

  for (const line of lines) {
    const m = /^#\s+(.+?)\s*$/.exec(line.trim());
    if (m) {
      const key = SECTION_LABEL_TO_KEY[m[1].trim()];
      if (key) {
        flush();
        cur = key;
        continue;
      }
    }
    if (cur) buf.push(line);
  }
  flush();
  return out;
}

/** 读取并解析单个案例文件（文件不存在返回 null） */
export function readCase(
  id: CaseId
): (CaseData & { ready: boolean }) | null {
  if (!/^Case-\d{3,}$/.test(id)) return null;
  const file = path.join(CASE_DIR, `${id}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const title = normalizeStr(data.title);
  const modNum = normalizeModule(data.module);
  const level = normalizeStr(data.level);
  const tags = normalizeTags(data.tags);
  const estimatedTime = normalizeTime(data.estimatedTime);
  const sections = splitSections(content);
  const ready =
    title !== "" &&
    modNum > 0 &&
    Object.values(sections).some((s) => stripComments(s ?? "").replace(/\s/g, "").length > 0);

  return {
    id,
    title,
    module: modNum,
    level,
    tags,
    estimatedTime,
    sections,
    ready,
  };
}

/** 列出全部案例文件（按编号升序），返回 CaseId[] */
export function listCaseIds(): CaseId[] {
  if (!fs.existsSync(CASE_DIR)) return [];
  const nums = fs
    .readdirSync(CASE_DIR)
    .filter((f) => /^Case-\d{3,}\.md$/i.test(f))
    .map((f) => {
      const m = /^Case-(\d+)\.md$/i.exec(f);
      return m ? { f, n: Number(m[1]) } : null;
    })
    .filter((x): x is { f: string; n: number } => x !== null)
    .sort((a, b) => a.n - b.n);
  return nums.map((x) => caseIdFromFile(x.f)).filter((x): x is CaseId => x !== null);
}

/** 全部案例元数据（目录页用） */
export function listCaseMetas(): CaseMeta[] {
  return listCaseIds()
    .map((id) => {
      const c = readCase(id);
      return c
        ? {
            id,
            title: c.title,
            level: c.level,
            module: c.module,
            tags: c.tags,
            estimatedTime: c.estimatedTime,
            ready: c.ready,
          }
        : null;
    })
    .filter((x): x is CaseMeta => x !== null);
}

/** URL slug：Case-001 → case-001 */
export function caseSlug(id: CaseId): string {
  return id.toLowerCase();
}

/** 按 slug 定位案例（case-001 → Case-001） */
export function findCaseBySlug(slug: string): CaseId | null {
  const upper = slug.replace(/^case-/i, "Case-");
  const m = /^Case-\d{3,}$/.exec(upper);
  if (!m) return null;
  return fs.existsSync(path.join(CASE_DIR, `${upper}.md`)) ? upper : null;
}

/** 上/下一案例（按编号序跨越全部已建案例） */
export function caseNeighbors(id: CaseId): {
  prev: CaseId | null;
  next: CaseId | null;
} {
  const ids = listCaseIds();
  const i = ids.indexOf(id);
  if (i < 0) return { prev: null, next: null };
  return {
    prev: i > 0 ? ids[i - 1] : null,
    next: i < ids.length - 1 ? ids[i + 1] : null,
  };
}
