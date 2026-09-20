#!/usr/bin/env node
/**
 * Fund Admin Wiki — 术语数据校验（V1.14.1 固化；V1.20.6 改为直载真实数据层，接入 prebuild）
 *
 * ## V1.20.6 变更（收口 BACKLOG P3-1）
 * 不再用正则解析 TS 源码，改为经 `scripts/lib/ts-loader.mjs` 直载
 * `GLOSSARY_TERMS`（内置 ∪ 导入）。两条原因：
 *   ① 旧正则解析器对 `imported.ts` **天然失效** —— 该文件由 JSON.stringify 生成，
 *      key 带双引号（`"id": "x"`），而旧正则是 `\s{4}id:\s*"..."`，**一条都匹配不到**
 *      → 即便把它加回文件列表，也会「0 命中、静默通过」（假绿）。这才是当初
 *      `f !== "imported.ts"` 那行跳过逻辑背后的真实原因，不是「它是生成物」。
 *   ② 口径统一从「记得同步改两处」变成**结构性保证**：导入术语与内置术语走
 *      同一个数组、同一套六项检查，不存在「两条链路各自漂移」的空间。
 * ⚠️ 因此 prebuild 中 `gen:glossary` 必须排在 `check:glossary` **之前**
 *    （否则校验的是上一版烘焙产物）。见 package.json。
 *
 * 检查项：
 *   1. Duplicate IDs            — 术语 id 不可重复
 *   2. Broken Related Terms     — related 必须指向存在的术语 id
 *   3. Invalid Case References  — cases 必须指向 content/cases/<id>.md
 *   4. Invalid Course References— courses 必须是存在的课程 id（01 / 02 / 10… 或 E01..E11）
 *   5. Alias Collision          — 参与正文标注的文本（term / ASCII fullName / ASCII alias
 *                                  / 规范中文名 zh / 中文别名）不可撞车
 *                                  （V1.19.0 起覆盖中文通道，与 termMatchTexts 同口径）
 *   6. Required Fields Missing  — 结构必填项不可为空（含 level / category 枚举合法性）
 *
 * 用法：
 *   node scripts/check-glossary.mjs          # 校验并输出统计
 *   npm run check:glossary                   # 同上（prebuild 自动执行；失败阻断构建）
 *
 * 退出码：0 = 通过；1 = 存在错误（构建将被阻断）
 *
 * 依赖：Node ≥ 22.18（默认启用 TS 类型剥离）+ scripts/lib/ts-loader.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const CASES_DIR = path.join(ROOT, "content", "cases");
const LESSON_FILES = [
  path.join(ROOT, "src", "data", "lessons.ts"),
  path.join(ROOT, "src", "data", "lessons-cams.ts"),
  path.join(ROOT, "src", "data", "electives-a.ts"),
  path.join(ROOT, "src", "data", "electives-b.ts"),
  path.join(ROOT, "src", "data", "electives-c.ts"),
];

/* ---------------- 直载真实数据层 ---------------- */

try {
  register("./ts-loader.mjs", pathToFileURL(path.join(ROOT, "scripts", "lib") + path.sep));
} catch (err) {
  console.error(
    `[check:glossary] TS loader 注册失败（需 Node ≥ 22.18）：${err.message}\n` +
      `  本闸门依赖直载项目数据层，无法降级为「跳过校验」。`
  );
  process.exit(1);
}

let GLOSSARY_TERMS;
let IMPORTED_TERMS;
try {
  ({ GLOSSARY_TERMS } = await import("@/data/glossary"));
  ({ IMPORTED_TERMS } = await import("@/data/glossary/imported"));
} catch (err) {
  console.error(`[check:glossary] 加载术语数据层失败：${err.message}`);
  process.exit(1);
}

/** 术语来源标签：导入术语单独标出，便于定位坏数据来自哪条链路 */
const importedIds = new Set(IMPORTED_TERMS.map((t) => t.id));
const originOf = (id) => (importedIds.has(id) ? "imported.json" : "内置");

/* ---------------- 常量（与运行时代码同口径） ---------------- */

/** 参与正文标注的文本是否纯 ASCII（与 src/lib/glossary.ts 的 isAscii 一致） */
const isAscii = (s) => /^[\x20-\x7E]+$/.test(s);
/** 是否含中日韩统一表意文字（与 src/lib/glossary.ts 的 isCjk 一致） */
const isCjk = (s) => /[\u4e00-\u9fa5]/.test(s);
/**
 * 中文别名进入正文标注的最小长度（与 src/lib/glossary.ts 的 CH_ALIAS_MIN_LEN 一致）。
 * ⚠️ 两处必须同步改：本闸门负责拦截「撞车」，口径不一致会让闸门误放行或误报。
 */
const CH_ALIAS_MIN_LEN = 4;
/** 规范中文名的最小长度（与 glossary.ts 的 CH_TERM_MIN_LEN 一致） */
const CH_TERM_MIN_LEN = 2;

/* ---------------- 引用目标 ---------------- */

/**
 * 读取源码并把行尾统一为 LF。
 * Windows 上 core.autocrlf=true 会把检出文件写成 CRLF，若直接按 `\n` 切分，
 * 课程 id 会整体漏抓（假报"引用不存在"）。此处统一归一，保证校验与平台无关。
 */
function readSource(file) {
  return fs.readFileSync(file, "utf8").replace(/\r\n?/g, "\n");
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

const terms = GLOSSARY_TERMS;
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
      `id "${t.id}" 重复出现于 ${originOf(t.id)} 与 ${originOf(byId.get(t.id).id)}（内置与导入不可同 id）`
    );
  } else {
    byId.set(t.id, t);
  }
}

/* 2. Broken Related Terms */
const relatedEdges = new Set();
for (const t of terms) {
  for (const r of t.related ?? []) {
    if (r === t.id) {
      fail("Broken Related Terms", `${t.id}（${originOf(t.id)}）的 related 指向自身`);
      continue;
    }
    if (!idSet.has(r)) {
      fail("Broken Related Terms", `${t.id}（${originOf(t.id)}）-> "${r}" 不存在`);
    } else {
      relatedEdges.add(`${t.id}->${r}`);
    }
  }
}

/* 3. Invalid Case References */
for (const t of terms) {
  for (const c of t.cases ?? []) {
    if (!caseIds.has(c)) {
      fail("Invalid Case References", `${t.id}（${originOf(t.id)}）-> "${c}"（content/cases/${c}.md 不存在）`);
    }
  }
}

/* 4. Invalid Course References */
for (const t of terms) {
  for (const c of t.courses ?? []) {
    if (!courseIds.has(c)) {
      fail("Invalid Course References", `${t.id}（${originOf(t.id)}）-> "${c}"（课程 id 不存在）`);
    }
  }
}

/* 5. Alias Collision（正文标注文本撞车）
 *   口径必须与 src/lib/glossary.ts 的 termMatchTexts() 完全一致：
 *   英文通道 = term + ASCII fullName + ASCII alias；
 *   中文通道 = zh（长度 ≥ CH_TERM_MIN_LEN）+ 中文别名（长度 ≥ CH_ALIAS_MIN_LEN）。
 *   V1.19.0 前只校验英文通道，导致「业绩报酬」同时挂在 carried-interest 与
 *   performance-fee 上却未被发现（中文别名当时不参与标注，属休眠歧义）。 */
const matchTexts = new Map();
for (const t of terms) {
  const texts = new Set();
  if (t.term) texts.add(t.term.trim());
  if (t.fullName && isAscii(t.fullName) && t.fullName.trim() !== (t.term ?? "").trim()) {
    texts.add(t.fullName.trim());
  }
  for (const a of t.aliases ?? []) if (a && isAscii(a)) texts.add(a.trim());
  // 中文通道
  if (t.zh && isCjk(t.zh) && t.zh.trim().length >= CH_TERM_MIN_LEN) texts.add(t.zh.trim());
  for (const a of t.aliases ?? []) {
    if (!a) continue;
    const v = a.trim();
    if (!v || isAscii(v) || !isCjk(v)) continue;
    if (v.length >= CH_ALIAS_MIN_LEN) texts.add(v);
  }
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
      `标注文本 "${list[0].raw}" 同时命中: ${uniqueIds.map((id) => `${id}（${originOf(id)}）`).join(", ")}`
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
  const from = originOf(t.id);
  for (const k of REQUIRED_STR) {
    if (!t[k] || !String(t[k]).trim()) {
      fail("Required Fields Missing", `${t.id}（${from}）缺少必填字段 "${k}"`);
    }
  }
  for (const k of REQUIRED_ARR) {
    if (!Array.isArray(t[k]) || t[k].length === 0) {
      fail("Required Fields Missing", `${t.id}（${from}）缺少必填数组 "${k}"`);
    }
  }
  if (t.level && !VALID_LEVELS.has(t.level)) {
    fail("Required Fields Missing", `${t.id}（${from}）的 level "${t.level}" 非法（core/advanced/expert）`);
  }
  if (t.category && !VALID_CATEGORIES.has(t.category)) {
    fail("Required Fields Missing", `${t.id}（${from}）的 category "${t.category}" 非法`);
  }
}

/* 附加信息：人工指定关联（供人工巡检参考） */
const manualCaseTerms = terms.filter((t) => (t.cases ?? []).length > 0).length;
const manualCourseTerms = terms.filter((t) => (t.courses ?? []).length > 0).length;
if (terms.length < 100) {
  warnings.push(`术语总数 ${terms.length} < 100（V1.14.0 验收基线为 ≥100）`);
}
if (terms.length !== GLOSSARY_TERMS.length) {
  warnings.push(`术语集合不一致：${terms.length} vs ${GLOSSARY_TERMS.length}`);
}

/* ---------------- 输出 ---------------- */

const levelCount = { core: 0, advanced: 0, expert: 0 };
const catCount = {};
for (const t of terms) {
  if (levelCount[t.level] !== undefined) levelCount[t.level] += 1;
  catCount[t.category] = (catCount[t.category] || 0) + 1;
}

console.log("── Fund Admin Wiki · 术语数据校验（直载数据层） ────");
console.log(`术语总数          ${terms.length}`);
console.log(`来源分布          内置 ${terms.length - importedIds.size} · 导入 ${importedIds.size}（imported.json）`);
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

console.log(
  `\n✅ 校验通过：${terms.length} 条术语（内置 ${terms.length - importedIds.size} + 导入 ${importedIds.size}），` +
    `0 重复 / 0 断链 / 0 无效引用 / 0 标注撞车 / 0 缺字段`
);
process.exit(0);
