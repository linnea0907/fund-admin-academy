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
/** 元数据索引（scripts/build-case-index.mjs 生成，npm run gen:cases / prebuild） */
export const CASE_INDEX_FILE = path.join(CASE_DIR, "index.json");

/**
 * 进程内缓存（mtime 失效）：
 * - 构建期 25 案例 ×（generateMetadata + render + 邻居）≈100 次文件读 + gray-matter 解析 → 降为每文件 1 次
 * - dev 下编辑 Markdown 后 mtime 变化即自动失效，无需重启
 */
const parseCache = new Map<string, { mtimeMs: number; data: (CaseData & { ready: boolean }) | null }>();
let idsList: CaseId[] | null = null;
let idsDirMtime = -1;
let indexMetas: CaseMeta[] | null = null;
let indexMtime = -1;

function safeStat(p: string): fs.Stats | null {
  try {
    return fs.statSync(p);
  } catch {
    return null;
  }
}

/** content/cases 目录内最新 Case md 的 mtime（用于判断 index.json 是否过期） */
function newestCaseFileMtime(): number {
  const dirSt = safeStat(CASE_DIR);
  if (!dirSt || !dirSt.isDirectory()) return 0;
  let max = 0;
  for (const f of fs.readdirSync(CASE_DIR)) {
    if (!/^Case-\d{3,}\.md$/i.test(f)) continue;
    const st = safeStat(path.join(CASE_DIR, f));
    if (st) max = Math.max(max, st.mtimeMs);
  }
  return max;
}

/** index.json 是否新鲜（不旧于任何案例文件） */
function isIndexFresh(): boolean {
  const indexSt = safeStat(CASE_INDEX_FILE);
  if (!indexSt) return false;
  return indexSt.mtimeMs >= newestCaseFileMtime();
}

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

/** 技能列表规范化：去空、trim、去重（保留词表外技能，展示端会 fallback 处理） */
function normalizeSkills(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of v) {
    const t = String(s).trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
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

/** 读取并解析单个案例文件（文件不存在返回 null；进程内按 mtime 缓存） */
export function readCase(
  id: CaseId
): (CaseData & { ready: boolean }) | null {
  if (!/^Case-\d{3,}$/.test(id)) return null;
  const file = path.join(CASE_DIR, `${id}.md`);
  const st = safeStat(file);
  if (!st) return null;

  const hit = parseCache.get(id);
  if (hit && hit.mtimeMs === st.mtimeMs) return hit.data;

  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const title = normalizeStr(data.title);
  const modNum = normalizeModule(data.module);
  const level = normalizeStr(data.level);
  const tags = normalizeTags(data.tags);
  const skills = normalizeSkills(data.skills);
  const estimatedTime = normalizeTime(data.estimatedTime);
  const sections = splitSections(content);
  const ready =
    title !== "" &&
    modNum > 0 &&
    Object.values(sections).some((s) => stripComments(s ?? "").replace(/\s/g, "").length > 0);

  const parsed = {
    id,
    title,
    module: modNum,
    level,
    tags,
    skills,
    estimatedTime,
    sections,
    ready,
  };
  parseCache.set(id, { mtimeMs: st.mtimeMs, data: parsed });
  return parsed;
}

/** 列出全部案例文件（按编号升序），返回 CaseId[]（readdir 结果按目录 mtime 缓存） */
export function listCaseIds(): CaseId[] {
  const dirSt = safeStat(CASE_DIR);
  if (!dirSt || !dirSt.isDirectory()) return [];
  if (idsList && idsDirMtime === dirSt.mtimeMs) return idsList;
  const nums = fs
    .readdirSync(CASE_DIR)
    .filter((f) => /^Case-\d{3,}\.md$/i.test(f))
    .map((f) => {
      const m = /^Case-(\d+)\.md$/i.exec(f);
      return m ? { f, n: Number(m[1]) } : null;
    })
    .filter((x): x is { f: string; n: number } => x !== null)
    .sort((a, b) => a.n - b.n);
  idsDirMtime = dirSt.mtimeMs;
  idsList = nums.map((x) => caseIdFromFile(x.f)).filter((x): x is CaseId => x !== null);
  return idsList;
}

/** 全部案例元数据（目录页/技能页用）：
 *  优先读 content/cases/index.json（gen:cases 产物，一次 JSON 解析即得 25 条）；
 *  索引缺失/过期（编辑了 md 未跑 gen:cases）时回退为逐文件解析，保证 dev 与直接改 md 的场景正确。 */
export function listCaseMetas(): CaseMeta[] {
  const indexSt = safeStat(CASE_INDEX_FILE);
  if (indexSt && isIndexFresh()) {
    if (indexMetas && indexMtime === indexSt.mtimeMs) return indexMetas;
    try {
      const idx = JSON.parse(fs.readFileSync(CASE_INDEX_FILE, "utf8")) as {
        cases?: Array<{
          id?: unknown;
          title?: unknown;
          level?: unknown;
          module?: unknown;
          tags?: unknown;
          skills?: unknown;
          estimatedTime?: unknown;
          ready?: unknown;
        }>;
      };
      if (Array.isArray(idx.cases) && idx.cases.length > 0) {
        indexMetas = idx.cases
          .map((c): CaseMeta | null => {
            const id = normalizeStr(c.id);
            if (!id) return null;
            return {
              id,
              title: normalizeStr(c.title),
              level: normalizeStr(c.level),
              module: normalizeModule(c.module),
              tags: normalizeTags(c.tags),
              skills: normalizeSkills(c.skills),
              estimatedTime: normalizeTime(c.estimatedTime),
              ready: c.ready === true,
            };
          })
          .filter((x): x is CaseMeta => x !== null);
        indexMtime = indexSt.mtimeMs;
        return indexMetas;
      }
    } catch {
      // JSON 损坏 → 回退逐文件解析
    }
  }
  // 回退：逐文件解析（与索引同逻辑）
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
            skills: c.skills,
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
