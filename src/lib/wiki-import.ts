/**
 * Fund Admin Wiki — 批量导入（解析 / 校验 / 转换）纯函数层（V1.14.0）
 *
 * 无 fs / DOM 依赖，client 与 Node 脚本均可使用。
 * 支持的输入：
 *   - CSV（首行表头；多值字段用 `|` 或 `;` 或 `、` 分隔）
 *   - JSON（对象数组，或 `{ terms: [...] }`）
 *   - Excel（.xlsx）由服务端转为 CSV 风格行后走同一条校验链
 *
 * 目标结构 = `GlossaryTerm`（见 src/types/glossary.ts），未提供的字段以安全默认值补齐，
 * 校验失败的行不进入结果，并给出可读错误，便于在导入预览表中定位。
 */
import {
  GLOSSARY_CATEGORIES,
  TERM_JURISDICTIONS,
  TERM_LEVELS,
  TERM_SCENARIOS,
  TERM_SOURCES,
  type GlossaryCategory,
  type GlossaryTerm,
  type TermJurisdiction,
  type TermLevel,
  type TermScenario,
  type TermSourceId,
} from "@/types/glossary";

/* ================================================================
 * 字段定义（表头映射 + 批量导入模板列顺序）
 * ================================================================ */
export type DraftFieldKey =
  | "id"
  | "term"
  | "fullName"
  | "zh"
  | "category"
  | "level"
  | "jurisdiction"
  | "definition"
  | "whyImportant"
  | "scenario"
  | "aliases"
  | "tags"
  | "source"
  | "related"
  | "cases"
  | "courses"
  | "brief"
  | "commonMistakes";

export interface DraftFieldDef {
  key: DraftFieldKey;
  /** 模板列名（CSV/Excel 首行） */
  header: string;
  label: string;
  required: boolean;
  /** 多值字段（用 | 分隔） */
  multi?: boolean;
  hint?: string;
}

export const DRAFT_FIELDS: DraftFieldDef[] = [
  { key: "term", header: "Term", label: "术语", required: true, hint: "英文缩写或术语名，如 VCC" },
  { key: "fullName", header: "Full Name", label: "全称", required: false, hint: "英文全称；无则留空" },
  { key: "zh", header: "Chinese Name", label: "中文名", required: true },
  {
    key: "category",
    header: "Category",
    label: "分类",
    required: true,
    hint: GLOSSARY_CATEGORIES.map((c) => c.label).join(" / "),
  },
  {
    key: "level",
    header: "Level",
    label: "等级",
    required: false,
    hint: `成熟度等级：${TERM_LEVELS.map((l) => `${l.label}(${l.zh})`).join(" / ")}；留空默认 Core`,
  },
  {
    key: "jurisdiction",
    header: "Jurisdiction",
    label: "属地",
    required: false,
    multi: true,
    hint: TERM_JURISDICTIONS.join(" / "),
  },
  { key: "definition", header: "Definition", label: "定义", required: true },
  { key: "whyImportant", header: "Why Important", label: "为什么重要", required: false },
  {
    key: "scenario",
    header: "Fund Admin Scenario",
    label: "实务场景",
    required: false,
    multi: true,
    hint: TERM_SCENARIOS.join(" / "),
  },
  { key: "aliases", header: "Alias", label: "别名", required: false, multi: true, hint: "缩写/全称/中文别称" },
  { key: "tags", header: "Tags", label: "标签", required: false, multi: true },
  {
    key: "source",
    header: "Source",
    label: "来源",
    required: false,
    multi: true,
    hint: TERM_SOURCES.map((s) => s.label).join(" / "),
  },
  { key: "related", header: "Related Terms", label: "关联术语", required: false, multi: true, hint: "术语 id" },
  { key: "cases", header: "Related Cases", label: "关联案例", required: false, multi: true, hint: "Case-001" },
  { key: "courses", header: "Related Courses", label: "关联课程", required: false, multi: true, hint: "01 / E1" },
  { key: "brief", header: "Brief", label: "一句话定义", required: false, hint: "留空则由 Definition 首句生成" },
  { key: "commonMistakes", header: "Common Mistakes", label: "常见误区", required: false, multi: true },
  { key: "id", header: "ID", label: "术语 id", required: false, hint: "留空按 Term 自动生成" },
];

/** 导入模板表头（供下载模板用） */
export const DRAFT_HEADERS = DRAFT_FIELDS.map((f) => f.header);

/** 表头 → 字段 key（大小写/空格/下划线不敏感） */
const HEADER_LOOKUP: Map<string, DraftFieldKey> = (() => {
  const m = new Map<string, DraftFieldKey>();
  for (const f of DRAFT_FIELDS) {
    m.set(normHeader(f.header), f.key);
    m.set(normHeader(f.label), f.key);
    m.set(normHeader(f.key), f.key);
  }
  return m;
})();

function normHeader(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s_\-/]+/g, "");
}

/* ================================================================
 * CSV 解析（支持引号包裹、字段内换行、双引号转义）
 * ================================================================ */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^\uFEFF/, ""); // 去 BOM
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (ch === "\r") {
      // 忽略；换行由 \n 处理
    } else {
      cell += ch;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

/* ================================================================
 * 宽松草稿（导入/手工创建共用）
 * ================================================================ */
export interface TermDraft {
  id: string;
  term: string;
  fullName: string;
  zh: string;
  category: string;
  level: string;
  jurisdiction: string;
  definition: string;
  whyImportant: string;
  scenario: string;
  aliases: string;
  tags: string;
  source: string;
  related: string;
  cases: string;
  courses: string;
  brief: string;
  commonMistakes: string;
}

export function emptyDraft(): TermDraft {
  return {
    id: "",
    term: "",
    fullName: "",
    zh: "",
    category: "",
    level: "",
    jurisdiction: "",
    definition: "",
    whyImportant: "",
    scenario: "",
    aliases: "",
    tags: "",
    source: "",
    related: "",
    cases: "",
    courses: "",
    brief: "",
    commonMistakes: "",
  };
}

/** 多值字符串 → 数组（支持 | ; 、 ， 分隔） */
export function splitMulti(v: string): string[] {
  return v
    .split(/[|;、,，]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ================================================================
 * 枚举归一
 * ================================================================ */
function normKey(s: string): string {
  return s.trim().toLowerCase().replace(/[\s_\-/]+/g, "");
}

export function asCategory(v: string): GlossaryCategory | null {
  const k = normKey(v);
  for (const c of GLOSSARY_CATEGORIES) {
    if (k === normKey(c.id) || k === normKey(c.label) || k === normKey(c.zh)) return c.id;
  }
  return null;
}

export function asSource(v: string): TermSourceId | null {
  const k = normKey(v);
  for (const s of TERM_SOURCES) {
    if (k === normKey(s.id) || k === normKey(s.label)) return s.id;
  }
  // 常见别名宽容处理
  if (k === "ics" || k === "icssop") return "ics";
  if (k === "bluebook" || k === "蓝宝书") return "blue-book";
  if (k === "cima" || k === "cimaguidence" || k === "cimaguidance") return "cima";
  if (k === "sfc") return "sfc";
  if (k === "mas") return "mas";
  if (k === "internal" || k === "internalpractice") return "internal";
  return null;
}

export function asJurisdictionValue(v: string): TermJurisdiction | null {
  const k = normKey(v);
  for (const j of TERM_JURISDICTIONS) {
    if (k === normKey(j)) return j;
  }
  return null;
}

export function asScenarioValue(v: string): TermScenario | null {
  const k = normKey(v);
  for (const s of TERM_SCENARIOS) {
    if (k === normKey(s)) return s;
  }
  return null;
}

/** Level：Core / Advanced / Expert（容忍中文「基础/进阶/专精」与简写） */
export function asLevel(v: string): TermLevel | null {
  const k = normKey(v);
  for (const l of TERM_LEVELS) {
    if (k === normKey(l.id) || k === normKey(l.label) || k === normKey(l.zh)) return l.id;
  }
  if (k === "c" || k === "初级" || k === "入门") return "core";
  if (k === "a" || k === "中级") return "advanced";
  if (k === "e" || k === "高级") return "expert";
  return null;
}

/** Term → 术语 id（小写连字符；中文/非字母数字转 -） */
export function slugifyTermId(term: string): string {
  const s = term
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "term";
}

/* ================================================================
 * CSV / JSON → 草稿
 * ================================================================ */
export interface ImportIssue {
  /** 行号（1 = 首行数据行；0 = 表头问题） */
  row: number;
  field?: string;
  message: string;
}

export interface ParseResult {
  drafts: TermDraft[];
  issues: ImportIssue[];
  /** 未能识别的表头（提示用户列名不匹配） */
  unknownHeaders: string[];
  /** 缺失的必填列 */
  missingColumns: string[];
}

function rowToDraft(cells: string[], colMap: (DraftFieldKey | null)[]): TermDraft {
  const d = emptyDraft();
  colMap.forEach((key, i) => {
    if (!key) return;
    d[key] = (cells[i] ?? "").trim();
  });
  return d;
}

/** CSV 文本 → 草稿 */
export function draftsFromCsv(text: string): ParseResult {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return { drafts: [], issues: [{ row: 0, message: "文件为空或无法解析" }], unknownHeaders: [], missingColumns: [] };
  }
  const headers = rows[0].map((h) => h.trim());
  const colMap: (DraftFieldKey | null)[] = headers.map((h) => HEADER_LOOKUP.get(normHeader(h)) ?? null);
  const unknownHeaders = headers.filter((h, i) => h && !colMap[i]);
  const used = new Set(colMap.filter(Boolean) as DraftFieldKey[]);
  const requiredKeys = DRAFT_FIELDS.filter((f) => f.required).map((f) => f.key);
  const missingColumns = requiredKeys.filter((k) => !used.has(k));

  const drafts: TermDraft[] = [];
  const issues: ImportIssue[] = [];
  for (let r = 1; r < rows.length; r += 1) {
    const d = rowToDraft(rows[r], colMap);
    if (!d.term && !d.zh && !d.definition) continue; // 空行
    drafts.push(d);
    if (!d.term) issues.push({ row: r, field: "term", message: "缺少 Term" });
  }
  return { drafts, issues, unknownHeaders, missingColumns };
}

/** JSON 文本 → 草稿（对象数组 / { terms: [...] }） */
export function draftsFromJson(text: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { drafts: [], issues: [{ row: 0, message: "JSON 解析失败，请检查格式" }], unknownHeaders: [], missingColumns: [] };
  }
  const arr = Array.isArray(data)
    ? data
    : data && typeof data === "object" && Array.isArray((data as { terms?: unknown }).terms)
      ? ((data as { terms: unknown[] }).terms)
      : null;
  if (!arr) {
    return {
      drafts: [],
      issues: [{ row: 0, message: "JSON 结构不支持（需为对象数组或 { terms: [...] }）" }],
      unknownHeaders: [],
      missingColumns: [],
    };
  }
  const drafts: TermDraft[] = [];
  const issues: ImportIssue[] = [];
  arr.forEach((item, i) => {
    if (!item || typeof item !== "object") {
      issues.push({ row: i + 1, message: "该元素不是对象，已跳过" });
      return;
    }
    const o = item as Record<string, unknown>;
    const d = emptyDraft();
    for (const f of DRAFT_FIELDS) {
      const raw = o[f.key] ?? o[f.header] ?? o[f.label];
      if (raw === undefined || raw === null) continue;
      d[f.key] = Array.isArray(raw) ? raw.map((x) => String(x).trim()).join(" | ") : String(raw).trim();
    }
    if (!d.term && !d.zh) {
      issues.push({ row: i + 1, message: "缺少 Term / Chinese Name，已跳过" });
      return;
    }
    drafts.push(d);
  });
  return { drafts, issues, unknownHeaders: [], missingColumns: [] };
}

/* ================================================================
 * 草稿 → GlossaryTerm（含校验）
 * ================================================================ */
export interface DraftValidation {
  term: GlossaryTerm | null;
  errors: string[];
  warnings: string[];
}

/** 由 Definition 首句生成一句话定义 */
function briefFromDefinition(definition: string): string {
  const first = definition.split(/[。；;.!?]/)[0]?.trim() ?? "";
  return first ? (first.length > 60 ? `${first.slice(0, 58)}…` : `${first}。`) : "";
}

export function draftToTerm(
  draft: TermDraft,
  opts?: { existingIds?: Set<string> }
): DraftValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  const term = draft.term.trim();
  const zh = draft.zh.trim();
  const definition = draft.definition.trim();
  if (!term) errors.push("Term 必填");
  if (!zh) errors.push("Chinese Name 必填");
  if (!definition) errors.push("Definition 必填");

  const category = asCategory(draft.category);
  if (!category) {
    errors.push(
      draft.category.trim()
        ? `Category「${draft.category}」不在受控清单内`
        : "Category 必填"
    );
  }

  // Level：留空默认 Core（导入预览会提示，便于事后校正）
  let level: TermLevel = "core";
  const levelRaw = (draft.level ?? "").trim();
  if (levelRaw) {
    const v = asLevel(levelRaw);
    if (v) level = v;
    else warnings.push(`等级「${levelRaw}」不在受控清单内，已按 Core 处理`);
  } else {
    warnings.push("未指定 Level，已按 Core 处理");
  }

  const jurisdictionRaw = splitMulti(draft.jurisdiction);
  const jurisdiction: TermJurisdiction[] = [];
  for (const j of jurisdictionRaw) {
    const v = asJurisdictionValue(j);
    if (v) jurisdiction.push(v);
    else warnings.push(`属地「${j}」不在受控清单内，已忽略`);
  }

  const scenarioRaw = splitMulti(draft.scenario);
  const scenario: TermScenario[] = [];
  for (const s of scenarioRaw) {
    const v = asScenarioValue(s);
    if (v) scenario.push(v);
    else warnings.push(`实务场景「${s}」不在受控清单内，已忽略`);
  }

  const source: TermSourceId[] = [];
  for (const s of splitMulti(draft.source)) {
    const v = asSource(s);
    if (v) source.push(v);
    else warnings.push(`来源「${s}」不在受控清单内，已忽略`);
  }

  const id = (draft.id.trim() || slugifyTermId(term)).toLowerCase().replace(/\s+/g, "-");
  if (opts?.existingIds?.has(id)) errors.push(`术语 id「${id}」已存在，请改用其他 id`);

  if (errors.length > 0 || !category) return { term: null, errors, warnings };

  const fullName = draft.fullName.trim() || term;
  const aliases = splitMulti(draft.aliases).filter((a) => a.toLowerCase() !== term.toLowerCase());
  const brief = draft.brief.trim() || briefFromDefinition(definition);

  const out: GlossaryTerm = {
    id,
    term,
    fullName,
    zh,
    category,
    level,
    jurisdiction: jurisdiction.length > 0 ? jurisdiction : ["Global"],
    definition,
    whyImportant: draft.whyImportant.trim(),
    scenario,
    aliases,
    related: splitMulti(draft.related),
    source: source.length > 0 ? source : ["internal"],
    tags: splitMulti(draft.tags),
    brief,
  };
  const cases = splitMulti(draft.cases);
  if (cases.length > 0) out.cases = cases;
  const courses = splitMulti(draft.courses);
  if (courses.length > 0) out.courses = courses;
  const mistakes = splitMulti(draft.commonMistakes);
  if (mistakes.length > 0) out.commonMistakes = mistakes;

  if (!out.whyImportant) warnings.push("Why Important 为空");
  if (out.scenario.length === 0) warnings.push("Fund Admin Scenario 为空");
  if (out.related.length === 0) warnings.push("Related Terms 为空");

  return { term: out, errors, warnings };
}

/* ================================================================
 * 导出：content/glossary/imported.json
 * ================================================================ */
export function buildImportedJson(terms: GlossaryTerm[]): string {
  return `${JSON.stringify({ version: 1, terms }, null, 2)}\n`;
}

/** 导入草稿模板（CSV 文本，含一行示例） */
export function buildCsvTemplate(): string {
  const example: Record<string, string> = {
    Term: "VCC",
    "Full Name": "Variable Capital Company",
    "Chinese Name": "可变资本公司",
    Category: "Fund Structure",
    Level: "Advanced",
    Jurisdiction: "Singapore",
    Definition: "新加坡推出的公司型基金架构，可按需增减股本并下设资产隔离的子基金。",
    "Why Important": "当前新加坡基金最主流架构之一。",
    "Fund Admin Scenario": "Fund Setup | Fund Operations",
    Alias: "Variable Capital Company | 可变资本公司",
    Tags: "Singapore | 伞形基金",
    Source: "MAS Guidance | Blue Book",
    "Related Terms": "sub-fund | mas",
    "Related Cases": "",
    "Related Courses": "",
    Brief: "新加坡专为基金设计的公司型载体。",
    "Common Mistakes": "",
    ID: "vcc",
  };
  const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const head = DRAFT_HEADERS.map(esc).join(",");
  const line = DRAFT_HEADERS.map((h) => esc(example[h] ?? "")).join(",");
  return `${head}\n${line}\n`;
}
