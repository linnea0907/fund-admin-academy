/**
 * Case Library V1 — 案例数据模块（仅服务端使用）
 *
 * - 内容源：content/cases/Case-001.md … Case-050.md（Markdown 单文件承载全部字段）
 * - 文件结构：frontmatter 元数据（id/title/level/category/tags）+ `## 小节`
 *   小节 key 顺序固定：background → facts → questions → analysis →
 *   practical_steps → common_mistakes → further_reading
 * - 本模块负责扫描文件、解析 frontmatter、切分正文小节、判断内容是否已导入
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { CaseId, CaseMeta, CaseSectionKey, CaseData } from "@/types";

export const CASE_DIR = path.join(process.cwd(), "content", "cases");

/** 正文小节展示顺序与中文标题 */
export const CASE_SECTIONS: {
  key: CaseSectionKey;
  label: string;
  hint: string;
}[] = [
  { key: "background", label: "案例背景", hint: "业务情境、相关主体与背景" },
  { key: "facts", label: "关键事实", hint: "已知事实与需核对的文档" },
  { key: "questions", label: "待决问题", hint: "本次案例需要回答的问题" },
  { key: "analysis", label: "分析路径", hint: "判断链与要点" },
  { key: "practical_steps", label: "实操步骤", hint: "Fund Admin 落地动作" },
  { key: "common_mistakes", label: "常见错误", hint: "易错点与规避" },
  { key: "further_reading", label: "延伸阅读", hint: "官方指引/法规/文档" },
];

const SECTION_KEYS = new Set<string>(CASE_SECTIONS.map((s) => s.key));

/** 移除 Markdown 中的 HTML 注释（骨架占位注释不应视为内容） */
function stripComments(md: string): string {
  return md.replace(/<!--[\s\S]*?-->/g, "");
}

/** 从文件名解析 Case id：Case-001.md → "Case-001" */
export function caseIdFromFile(file: string): CaseId | null {
  const m = /^(Case-\d{3,})\.md$/i.exec(file);
  return m ? (m[1].charAt(0).toUpperCase() + m[1].slice(1)) : null;
}

function normalizeTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((t) => String(t).trim()).filter(Boolean);
  if (typeof v === "string" && v.trim()) return [v.trim()];
  return [];
}

function normalizeStr(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

/** 解析正文：按 `## key` 切分（忽略未知小节标题） */
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
    const m = /^##\s+([A-Za-z_]+)\s*$/.exec(line.trim());
    if (m && SECTION_KEYS.has(m[1])) {
      flush();
      cur = m[1] as CaseSectionKey;
    } else if (cur) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

/** 读取并解析单个案例文件（文件不存在返回 null） */
export function readCase(id: CaseId): (CaseMeta & { sections: CaseData["sections"] }) | null {
  if (!/^Case-\d{3,}$/.test(id)) return null;
  const file = path.join(CASE_DIR, `${id}.md`);
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const title = normalizeStr(data.title);
  const level = normalizeStr(data.level);
  const category = normalizeStr(data.category);
  const tags = normalizeTags(data.tags);
  const sections = splitSections(content);
  const ready =
    title !== "" &&
    Object.values(sections).some((s) => stripComments(s).replace(/\s/g, "").length > 0);

  return { id, title, level, category, tags, ready, sections };
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
  return nums
    .map((x) => caseIdFromFile(x.f))
    .filter((x): x is CaseId => x !== null);
}

/** 全部案例元数据（目录页用） */
export function listCaseMetas(): CaseMeta[] {
  return listCaseIds()
    .map((id) => {
      const c = readCase(id);
      return c
        ? { id, title: c.title, level: c.level, category: c.category, tags: c.tags, ready: c.ready }
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
