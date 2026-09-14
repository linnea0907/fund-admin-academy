#!/usr/bin/env node
/**
 * build-glossary-import.mjs — 把 content/glossary/imported.json 烘焙为
 * src/data/glossary/imported.ts（Fund Admin Wiki 批量导入落点）
 *
 * 使用：
 *   npm run gen:glossary        # 手动
 *   npm run build               # prebuild 自动执行
 *
 * 约定：
 * - imported.json 结构：{ version: 1, terms: GlossaryTerm[] }（由「知识工坊 /wiki」导出）
 * - 文件缺失 / 损坏 / 无 terms → 生成空数组文件（保证 import 永不失败）
 * - 字段缺失或枚举非法 → 归一为安全默认值并打印警告，不阻断构建
 * - id 与内置术语重复 → 跳过并警告（内置优先）
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC_JSON = path.join(ROOT, "content", "glossary", "imported.json");
const OUT_TS = path.join(ROOT, "src", "data", "glossary", "imported.ts");

/** 与 src/types/glossary.ts 保持一致的受控清单 */
const CATEGORIES = [
  "fund-structure",
  "aml-kyc",
  "aeoi",
  "fund-operations",
  "regulatory",
  "legal-entity",
  "governance",
  "tax",
];
const JURISDICTIONS = [
  "Global",
  "Cayman",
  "BVI",
  "Hong Kong",
  "Singapore",
  "China",
  "USA",
  "UK",
  "EU",
  "Luxembourg",
  "Mauritius",
  "Other",
];
const SCENARIOS = [
  "Investor Onboarding",
  "Transfer",
  "Redemption",
  "Periodic Review",
  "AEOI / CRS / FATCA",
  "Fund Setup",
  "Fund Governance",
  "Fund Operations",
  "Regulatory Filing",
  "Client Communication",
];
const SOURCES = ["ics", "blue-book", "cima", "sfc", "mas", "internal"];

/** 内置术语 id（读源码数据文件，避免与内置重复） */
function builtinIds() {
  const dir = path.join(ROOT, "src", "data", "glossary");
  const ids = new Set();
  if (!fs.existsSync(dir)) return ids;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith(".ts") || f === "index.ts" || f === "imported.ts") continue;
    const text = fs.readFileSync(path.join(dir, f), "utf8");
    for (const m of text.matchAll(/^\s{4}id:\s*"([^"]+)"/gm)) ids.add(m[1]);
  }
  return ids;
}

function asStr(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean).join(" ");
  return v === undefined || v === null ? "" : String(v).trim();
}

function asArr(v) {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  const s = asStr(v);
  if (!s) return [];
  return s
    .split(/[|;、,，]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function pickEnum(values, allowed, fallback) {
  const out = [];
  for (const v of values) {
    const hit = allowed.find((a) => a.toLowerCase() === v.toLowerCase());
    if (hit && !out.includes(hit)) out.push(hit);
  }
  if (out.length > 0) return out;
  return fallback ? [fallback] : [];
}

function briefOf(term) {
  if (term.brief) return term.brief;
  const first = term.definition.split(/[。；;.!?]/)[0]?.trim() ?? "";
  if (!first) return term.definition.slice(0, 60);
  return first.length > 60 ? `${first.slice(0, 58)}…` : `${first}。`;
}

const warnings = [];
let terms = [];

if (fs.existsSync(SRC_JSON)) {
  try {
    const parsed = JSON.parse(fs.readFileSync(SRC_JSON, "utf8"));
    const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.terms) ? parsed.terms : [];
    const builtin = builtinIds();
    const seen = new Set();
    for (const [i, raw] of list.entries()) {
      if (!raw || typeof raw !== "object") {
        warnings.push(`第 ${i + 1} 条不是对象，已跳过`);
        continue;
      }
      const term = asStr(raw.term);
      const zh = asStr(raw.zh ?? raw.chineseName);
      const definition = asStr(raw.definition);
      if (!term || !zh || !definition) {
        warnings.push(`第 ${i + 1} 条缺少 Term / Chinese Name / Definition，已跳过`);
        continue;
      }
      const id = (asStr(raw.id) || term.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")).toLowerCase();
      if (builtin.has(id)) {
        warnings.push(`id「${id}」与内置术语重复，已跳过`);
        continue;
      }
      if (seen.has(id)) {
        warnings.push(`id「${id}」在导入文件中重复，已跳过`);
        continue;
      }
      const category = pickEnum([asStr(raw.category)], CATEGORIES, null);
      if (category.length === 0) {
        warnings.push(`id「${id}」Category「${asStr(raw.category)}」非法，已跳过`);
        continue;
      }
      seen.add(id);

      const jurisdiction = pickEnum(asArr(raw.jurisdiction), JURISDICTIONS, "Global");
      const scenario = pickEnum(asArr(raw.scenario), SCENARIOS, null);
      const source = pickEnum(asArr(raw.source), SOURCES, "internal");

      const out = {
        id,
        term,
        fullName: asStr(raw.fullName) || term,
        zh,
        category: category[0],
        jurisdiction,
        definition,
        whyImportant: asStr(raw.whyImportant),
        scenario,
        aliases: asArr(raw.aliases),
        related: asArr(raw.related),
        source,
        tags: asArr(raw.tags),
        brief: briefOf({ brief: asStr(raw.brief), definition }),
      };
      const cases = asArr(raw.cases);
      if (cases.length) out.cases = cases;
      const courses = asArr(raw.courses);
      if (courses.length) out.courses = courses;
      const mistakes = asArr(raw.commonMistakes);
      if (mistakes.length) out.commonMistakes = mistakes;

      terms.push(out);
    }
    if (terms.length === 0 && list.length > 0) {
      warnings.push("没有可用条目（全部未通过校验）");
    }
  } catch (err) {
    warnings.push(`imported.json 解析失败：${err.message}`);
    terms = [];
  }
}

const body = terms.length > 0
  ? terms.map((t) => `  ${JSON.stringify(t, null, 2).replace(/\n/g, "\n  ")},`).join("\n")
  : "";

const out = `/**
 * Fund Admin Wiki — 批量导入层（自动生成，请勿手改）
 *
 * 由 \`scripts/build-glossary-import.mjs\` 从 \`content/glossary/imported.json\` 生成。
 * 导入术语请在「知识工坊（/wiki）」中上传后导出 JSON，落到 content/glossary/imported.json，
 * 再运行 \`npm run gen:glossary\`（或直接 build）。
 *
 * 本次烘焙：${terms.length} 条导入术语
 * 源文件：${fs.existsSync(SRC_JSON) ? "content/glossary/imported.json" : "（不存在，输出空数组）"}
 */
import type { GlossaryTerm } from "@/types/glossary";

export const IMPORTED_TERMS: GlossaryTerm[] = [
${body}
];
`;

fs.mkdirSync(path.dirname(OUT_TS), { recursive: true });
fs.writeFileSync(OUT_TS, out, "utf8");

console.log(
  `[gen:glossary] 导入术语 ${terms.length} 条 → src/data/glossary/imported.ts` +
    (warnings.length ? `（${warnings.length} 条警告）` : "")
);
for (const w of warnings.slice(0, 20)) console.log(`  ⚠ ${w}`);
if (warnings.length > 20) console.log(`  … 其余 ${warnings.length - 20} 条警告省略`);
