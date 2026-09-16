#!/usr/bin/env node
/**
 * Fund Admin Wiki — 术语数据校验（V1.14.1 固化，接入 prebuild）
 *
 * 检查项：
 *   1. Duplicate IDs            — 术语 id 不可重复
 *   2. Broken Related Terms     — related 必须指向存在的术语 id
 *   3. Invalid Case References  — cases 必须指向 content/cases/<id>.md
 *   4. Invalid Course References— courses 必须是存在的课程 id（01/02/10/12/14/15 或 E01..E11）
 *   5. Alias Collision          — 参与正文标注的文本（term / ASCII fullName / ASCII alias）不可撞车
 *   6. Required Fields Missing  — 14 字段结构必填项不可为空
 *
 * 用法：
 *   node scripts/check-glossary.mjs          # 校验并输出统计
 *   npm run check:glossary                   # 同上（prebuild 自动执行；失败阻断构建）
 *
 * 退出码：0 = 通过；1 = 存在错误（构建将被阻断）
 *
 * 说明：术语内容为 TypeScript 源码（src/data/glossary/*.ts），本脚本不引入 TS 运行时，
 * 而是按「对象字面量块」结构解析——块首缩进固定为 `  {`，字段缩进 4 空格。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GLOSSARY_DIR = path.join(ROOT, "src", "data", "glossary");
const CASES_DIR = path.join(ROOT, "content", "cases");
const LESSON_FILES = [
  path.join(ROOT, "src", "data", "lessons.ts"),
  path.join(ROOT, "src", "data", "lessons-cams.ts"),
  path.join(ROOT, "src", "data", "electives-a.ts"),
  path.join(ROOT, "src", "data", "electives-b.ts"),
  path.join(ROOT, "src", "data", "electives-c.ts"),
];

/** 参与正文标注的文本是否纯 ASCII（与 src/lib/glossary.ts 的 isAscii 保持一致） */
const isAscii = (s) => /^[\x20-\x7E]+$/.test(s);

/* ---------------- 解析 ---------------- */

/**
 * 读取源码并把行尾统一为 LF。
 * Windows 上 core.autocrlf=true 会把检出文件写成 CRLF，若直接按 `\n` 切分，
 * 术语块会整体解析不到（假报"引用不存在"）。此处统一归一，保证校验与平台无关。
 */
function readSource(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
}

function splitBlocks(src) {
  return src.split(/\n  \{\n/).slice(1);
}

/** 取字符串字段（单行 `k: "v"` 或换行 `k:\n "v"`） */
function str(block, key) {
  const same = new RegExp(`(?:^|\\n)\\s{4}${key}:\\s*"([^"]*)"`).exec(block);
  if (same) return same[1];
  const next = new RegExp(`(?:^|\\n)\\s{4}${key}:\\s*\\n\\s*"([^"]*)"`).exec(block);
  return next ? next[1] : null;
}

/** 取数组字段（仅支持单行数组） */
function arr(block, key) {
  const m = new RegExp(`(?:^|\\n)\\s{4}${key}:\\s*\\[([^\\]]*)\\]`).exec(block);
  if (!m) return null;
  return m[1]
    .split(",")
    .map((x) => x.trim().replace(/^"|"$/g, ""))
    .filter(Boolean);
}

function loadTerms() {
  const files = fs
    .readdirSync(GLOSSARY_DIR)
      .filter((f) => f.endsWith(".ts") && f !== "index.ts" && f !== "imported.ts");

  const terms = [];
  for (const file of files) {
    const src = readSource(path.join(GLOSSARY_DIR, file));
    for (const block of splitBlocks(src)) {
      const id = str(block, "id");
      if (!id) continue;
      terms.push({
        file,
        id,
        term: str(block, "term"),
        fullName: str(block, "fullName"),
        zh: str(block, "zh"),
        category: str(block, "category"),
        level: str(block, "level"),
        definition: str(block, "definition"),
        whyImportant: str(block, "whyImportant"),
        brief: str(block, "brief"),
        jurisdiction: arr(block, "jurisdiction") ?? [],
        scenario: arr(block, "scenario") ?? [],
        aliases: arr(block, "aliases") ?? [],
        related: arr(block, "related") ?? [],
        cases: arr(block, "cases") ?? [],
        courses: arr(block, "courses") ?? [],
        source: arr(block, "source") ?? [],
        tags: arr(block, "tags") ?? [],
      });
    }
  }
  return terms;
}

function loadCaseIds() {
  if (!fs.existsSync(CASES_DIR)) return new Set();
  return new Set(
    fs
      .readdirSync(CASES_DIR)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
  );
}

function loadCourseIds() {
  const ids = new Set();
  for (const file of LESSON_FILES) {
    if (!fs.existsSync(file)) continue;
    const src = readSource(file);
    for (const m of src.matchAll(/^\s{2,4}id:\s*"([^"]+)"/gm)) {
      if (/^E?\d{2}$/.test(m[1])) ids.add(m[1]);
    }
  }
  return ids;
}

/* ---------------- 校验 ---------------- */

const terms = loadTerms();
const caseIds = loadCaseIds();
const courseIds = loadCourseIds();
const idSet = new Set(terms.map((t) => t.id));

const errors = [];
const warnings = [];
const fail = (check, msg) => errors.push(`[${check}] ${msg}`);

/* 1. Duplicate IDs */
const byId = new Map();
for (const t of terms) {
  if (byId.has(t.id)) {
    fail(
      "Duplicate IDs",
      `id "${t.id}" 重复出现于 ${byId.get(t.id).file} 与 ${t.file}`
    );
  } else {
    byId.set(t.id, t);
  }
}

/* 2. Broken Related Terms */
const relatedEdges = new Set();
for (const t of terms) {
  for (const r of t.related) {
    if (r === t.id) {
      fail("Broken Related Terms", `${t.id} 的 related 指向自身`);
      continue;
    }
    if (!idSet.has(r)) {
      fail("Broken Related Terms", `${t.id} -> "${r}" 不存在`);
    } else {
      relatedEdges.add(`${t.id}->${r}`);
    }
  }
}

/* 3. Invalid Case References */
for (const t of terms) {
  for (const c of t.cases) {
    if (!caseIds.has(c)) {
      fail("Invalid Case References", `${t.id} -> "${c}"（content/cases/${c}.md 不存在）`);
    }
  }
}

/* 4. Invalid Course References */
for (const t of terms) {
  for (const c of t.courses) {
    if (!courseIds.has(c)) {
      fail("Invalid Course References", `${t.id} -> "${c}"（课程 id 不存在）`);
    }
  }
}

/* 5. Alias Collision（正文标注文本撞车） */
const matchTexts = new Map();
for (const t of terms) {
  const texts = new Set();
  if (t.term) texts.add(t.term.trim());
  if (t.fullName && isAscii(t.fullName) && t.fullName.trim() !== (t.term ?? "").trim()) {
    texts.add(t.fullName.trim());
  }
  for (const a of t.aliases) if (a && isAscii(a)) texts.add(a.trim());
  for (const txt of texts) {
    const key = txt.toLowerCase();
    if (!matchTexts.has(key)) matchTexts.set(key, []);
    matchTexts.get(key).push({ id: t.id, raw: txt });
  }
}
for (const list of matchTexts.values()) {
  const uniqueIds = [...new Set(list.map((x) => x.id))];
  if (uniqueIds.length > 1) {
    fail(
      "Alias Collision",
      `标注文本 "${list[0].raw}" 同时命中: ${uniqueIds.join(", ")}`
    );
  }
}

/* 6. Required Fields Missing */
const REQUIRED_STR = [
  "id",
  "term",
  "fullName",
  "zh",
  "category",
  "level",
  "definition",
  "whyImportant",
  "brief",
];
const REQUIRED_ARR = ["jurisdiction", "scenario", "aliases", "related", "source", "tags"];
const VALID_LEVELS = new Set(["core", "advanced", "expert"]);
const VALID_CATEGORIES = new Set([
  "fund-structure",
  "aml-kyc",
  "aeoi",
  "fund-operations",
  "regulatory",
  "legal-entity",
  "governance",
  "tax",
]);

for (const t of terms) {
  for (const k of REQUIRED_STR) {
    if (!t[k] || !String(t[k]).trim()) {
      fail("Required Fields Missing", `${t.id} 缺少必填字段 "${k}"`);
    }
  }
  for (const k of REQUIRED_ARR) {
    if (!Array.isArray(t[k]) || t[k].length === 0) {
      fail("Required Fields Missing", `${t.id} 缺少必填数组 "${k}"`);
    }
  }
  if (t.level && !VALID_LEVELS.has(t.level)) {
    fail("Required Fields Missing", `${t.id} 的 level "${t.level}" 非法（core/advanced/expert）`);
  }
  if (t.category && !VALID_CATEGORIES.has(t.category)) {
    fail("Required Fields Missing", `${t.id} 的 category "${t.category}" 非法`);
  }
}

/* 附加信息：孤立术语（无人工案例 / 课程指定时的静态快照，供人工巡检参考） */
const manualCaseTerms = terms.filter((t) => t.cases.length > 0).length;
const manualCourseTerms = terms.filter((t) => t.courses.length > 0).length;
if (terms.length < 100) {
  warnings.push(`术语总数 ${terms.length} < 100（V1.14.0 验收基线为 ≥100）`);
}

/* ---------------- 输出 ---------------- */

const levelCount = { core: 0, advanced: 0, expert: 0 };
const catCount = {};
for (const t of terms) {
  if (levelCount[t.level] !== undefined) levelCount[t.level] += 1;
  catCount[t.category] = (catCount[t.category] || 0) + 1;
}

console.log("── Fund Admin Wiki · 术语数据校验 ─────────────────");
console.log(`术语总数          ${terms.length}`);
console.log(`分类分布          ${JSON.stringify(catCount)}`);
console.log(`等级分布          Core ${levelCount.core} · Advanced ${levelCount.advanced} · Expert ${levelCount.expert}`);
console.log(`关联术语边        ${relatedEdges.size}`);
console.log(`人工指定案例      ${manualCaseTerms} 条术语`);
console.log(`人工指定课程      ${manualCourseTerms} 条术语`);
console.log(`可标注文本        ${matchTexts.size} 个（无撞车时 1 文本 → 1 术语）`);
console.log(`案例库可引用      ${caseIds.size} 个 · 课程可引用 ${courseIds.size} 个`);

if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} 条提醒：`);
  for (const w of warnings) console.log(`   · ${w}`);
}

if (errors.length > 0) {
  console.log(`\n❌ 校验失败：${errors.length} 个问题`);
  for (const e of errors) console.log(`   · ${e}`);
  console.log("\n构建已阻断。请修复上述问题后重试。");
  process.exit(1);
}

console.log(`\n✅ 校验通过：${terms.length} 条术语，0 重复 / 0 断链 / 0 无效引用 / 0 标注撞车 / 0 缺字段`);
process.exit(0);
