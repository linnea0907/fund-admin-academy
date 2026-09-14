/**
 * Fund Admin Wiki — 待补充术语池扫描（服务端专用，V1.14.0）
 *
 * 逻辑（spec 十一）：当案例、课程、知识卡片中出现「未录入术语」时，自动进入待补充列表。
 *
 * 实现：
 *   1. 汇总语料（课程标题/简介/目标 + 模块正文与要点 + 案例标题与全部小节正文）；
 *   2. 用与页面标注完全相同的术语引擎标记已被识别的片段（term/fullName/alias）；
 *   3. 在未被识别的区间内抽取英文候选：
 *        a) 2~6 位全大写缩写（DMA / VCC / SOF）
 *        b) 首字母大写词组（Protector / Nominee / Private Trust Company）
 *   4. 过滤停用词、模板词与目录名，按「出现文档数 → 出现次数」排序。
 *
 * 结果供 /wiki「Missing Terms」展示，管理员可一键创建（草稿预填）或忽略（前端 localStorage）。
 */

import fs from "node:fs";
import path from "node:path";
import { orderedAllLessons } from "@/lib/ordering";
import { listCaseIds, readCase } from "@/lib/cases";
import { GLOSSARY_TERMS, annotateSegments } from "@/lib/glossary";

export interface MissingTermCandidate {
  /** 候选词（原样，如 "Protector" / "DMA"） */
  text: string;
  /** 归一 key（小写） */
  key: string;
  /** 出现的文档数 */
  docs: number;
  /** 总出现次数 */
  count: number;
  /** 出现位置示例（最多 3 条） */
  samples: { label: string; href: string; context: string }[];
  /** 是否全大写缩写 */
  acronym: boolean;
}

/** 停用词：模板词、目录/元数据词、通用业务词，避免污染候选池 */
const STOPWORDS = new Set(
  [
    // 模板与结构
    "case", "cases", "module", "modules", "index", "json", "md", "html", "pdf", "png", "jpg",
    "scenario", "documents", "document", "received", "missing", "questions", "question",
    "standard", "answer", "reasoning", "mistakes", "email", "sop", "reference", "takeaway",
    "client", "communication", "title", "level", "tags", "skill", "skills", "estimated", "time",
    "frontmatter", "description", "example", "note", "notes", "sample", "template",
    // 通用业务词（已在术语库中的不在此列）
    "fund", "funds", "admin", "administrator", "administration", "management", "manager",
    "investor", "investors", "investment", "asset", "assets", "capital", "account", "accounts",
    "company", "limited", "corporation", "entity", "structure", "cayman", "bvi", "hong", "kong",
    "singapore", "china", "usa", "uk", "japan", "taiwan", "macau", "korea", "india",
    "yes", "no", "not", "and", "or", "the", "for", "with", "from", "this", "that", "which",
    "please", "thank", "thanks", "dear", "sir", "madam", "regards", "best", "kind",
    "january", "february", "march", "april", "may", "june", "july", "august", "september",
    "october", "november", "december", "monday", "tuesday", "wednesday", "thursday", "friday",
    "id", "no", "no.", "type", "date", "name", "address", "city", "country", "code", "number",
    "page", "pages", "version", "internal", "external", "review", "reviews", "check", "checklist",
    "data", "file", "files", "form", "forms", "list", "lists", "item", "items", "step", "steps",
    "high", "low", "medium", "risk", "risks", "level", "status", "open", "close", "closed",
    "true", "false", "null", "none", "other", "others", "all", "any", "both", "each",
  ].map((s) => s.toLowerCase())
);

/** 语料片段 */
interface Corpus {
  label: string;
  href: string;
  text: string;
}

function buildCorpus(): Corpus[] {
  const out: Corpus[] = [];

  for (const lesson of orderedAllLessons) {
    const isElective = lesson.id.startsWith("E");
    const label = isElective ? `选修 ${lesson.id}` : `第 ${lesson.id} 讲`;
    const href = `/courses/${lesson.slug}`;
    out.push({
      label: `${label} · ${lesson.title}`,
      href,
      text: [lesson.title, lesson.subtitle, ...(lesson.goal ?? [])].join("\n"),
    });
    for (const mod of lesson.modules) {
      out.push({
        label: `${label} · ${mod.title}`,
        href: `${href}#${mod.id}`,
        text: [mod.title, ...(mod.body ?? []), ...(mod.points ?? [])].join("\n"),
      });
    }
    out.push({
      label: `${label} · Admin Checklist`,
      href,
      text: (lesson.checklist ?? []).join("\n"),
    });
    out.push({
      label: `${label} · 常见错误`,
      href,
      text: (lesson.commonMistakes ?? []).map((m) => `${m.title} ${m.detail}`).join("\n"),
    });
  }

  for (const id of listCaseIds()) {
    const c = readCase(id);
    if (!c) continue;
    const href = `/cases/${id.toLowerCase()}`;
    out.push({ label: `${id} · 标题`, href, text: c.title });
    for (const [key, body] of Object.entries(c.sections)) {
      if (!body) continue;
      out.push({ label: `${id} · ${key}`, href, text: body });
    }
  }

  return out;
}

/** 已录入术语的全部匹配文本（小写） */
function registeredKeys(): Set<string> {
  const set = new Set<string>();
  for (const t of GLOSSARY_TERMS) {
    set.add(t.term.toLowerCase());
    if (t.fullName) set.add(t.fullName.toLowerCase());
    for (const a of t.aliases ?? []) set.add(a.toLowerCase());
  }
  return set;
}

/** 把文本切成「未识别区间」（已识别术语片段被挖空） */
function unrecognizedChunks(text: string): string[] {
  return annotateSegments(text)
    .filter((s) => !s.termId)
    .map((s) => s.text);
}

const ACRONYM_RX = /\b[A-Z]{2,6}\b/g;
const PHRASE_RX = /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,2}\b/g;

/** 上下文摘录（±40 字符） */
function snippetOf(text: string, idx: number, len: number): string {
  const from = Math.max(0, idx - 40);
  const to = Math.min(text.length, idx + len + 40);
  return `${from > 0 ? "…" : ""}${text.slice(from, to).replace(/\s+/g, " ")}${to < text.length ? "…" : ""}`;
}

/**
 * 扫描语料，返回未录入的英文术语候选。
 * @param limit 返回的最大候选数（默认 120）
 */
export function scanMissingTerms(limit = 120): MissingTermCandidate[] {
  const corpus = buildCorpus();
  const registered = registeredKeys();
  const map = new Map<
    string,
    { text: string; docs: Set<string>; count: number; acronym: boolean; samples: { label: string; href: string; context: string }[] }
  >();

  for (const doc of corpus) {
    const seenInDoc = new Set<string>();
    for (const chunk of unrecognizedChunks(doc.text)) {
      const collect = (rx: RegExp, isAcronym: boolean) => {
        rx.lastIndex = 0;
        let m: RegExpExecArray | null;
        while ((m = rx.exec(chunk)) !== null) {
          const raw = m[0].trim();
          if (!raw) continue;
          const key = raw.toLowerCase();
          if (key.length < 3 && !isAcronym) continue;
          if (STOPWORDS.has(key)) continue;
          if (registered.has(key)) continue;
          if (!/[A-Za-z]/.test(raw)) continue;
          const entry =
            map.get(key) ??
            { text: raw, docs: new Set<string>(), count: 0, acronym: isAcronym, samples: [] };
          entry.count += 1;
          if (!entry.docs.has(doc.label)) entry.docs.add(doc.label);
          if (entry.samples.length < 3) {
            entry.samples.push({
              label: doc.label,
              href: doc.href,
              context: snippetOf(chunk, m.index, raw.length),
            });
          }
          map.set(key, entry);
          seenInDoc.add(key);
        }
      };
      collect(ACRONYM_RX, true);
      collect(PHRASE_RX, false);
    }
    void seenInDoc;
  }

  const list: MissingTermCandidate[] = [...map.entries()].map(([key, v]) => ({
    key,
    text: v.text,
    docs: v.docs.size,
    count: v.count,
    samples: v.samples,
    acronym: v.acronym,
  }));

  list.sort((a, b) => {
    if (b.docs !== a.docs) return b.docs - a.docs;
    if (b.count !== a.count) return b.count - a.count;
    return a.text.localeCompare(b.text);
  });

  return list.slice(0, limit);
}

/** 已在仓库生效的导入术语数量（供 /wiki 头部统计） */
export function importedTermCount(): number {
  const file = path.join(process.cwd(), "content", "glossary", "imported.json");
  if (!fs.existsSync(file)) return 0;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { terms?: unknown[] };
    return Array.isArray(parsed.terms) ? parsed.terms.length : 0;
  } catch {
    return 0;
  }
}
