#!/usr/bin/env node
/**
 * Fund Admin Academy — 课程展示编号校验（V1.20.0，接入 prebuild）
 *
 * ## 背景
 * V1.20.0 把「数据主键」与「展示编号」拆成两层：
 *   - `lesson.id`       = 历史编号（01/02/10/11/12/13/14/15）—— URL、进度 key、
 *                         收藏 key、`data-reading-scope`、笔记 sourceId、
 *                         术语 `courses` 字段全部依赖它，**永不改变**；
 *   - 展示编号           = 连续编号 01–08，在 `src/lib/lesson-number.ts` 由
 *                         `orderedLessons` 下标派生。
 *
 * 这带来两类**静默失效**风险，本闸门负责在构建期拦截：
 *   ① 有人调整 `orderedLessons` 顺序 → 全站编号重排，但数据里写死的
 *      **模块标题前缀**（`1.1` / `3.1` / `7.1` …）不会跟着变 → 正文突然对不上号；
 *   ② 有人误改 `slug` 或 `id` → 已发出的 URL 失效 / 用户进度与收藏「消失」。
 *
 * ## 检查项
 *   1. URL Freeze             — 8 门必修的 slug 必须等于冻结表（保护已发出链接）
 *   2. Display Number         — 必修展示编号必须是连续且唯一的 01…08
 *   3. Module Prefix Match    — 每讲模块标题前缀必须等于 `
 *                               displayNumber去零 . 模块序号`（与 lesson-number.ts 同口径）
 *   4. Mock Exam Number       — CAMS_MOCK_EXAM_ID 必须恒等于 必修数 + 1（当前 09）
 *   5. No Id Collision        — 必修 id 不得与模拟考展示编号撞号
 *
 * 用法：
 *   node scripts/check-lesson-numbers.mjs    # 校验并输出表格
 *   npm run check:lesson-numbers             # 同上（prebuild 自动执行；失败阻断构建）
 *
 * 退出码：0 = 通过；1 = 存在错误（构建将被阻断）
 *
 * 说明：课程内容为 TypeScript 源码，本脚本不引入 TS 运行时，按「对象字面量块」结构解析
 * —— 讲级字段缩进 4 空格，模块标题缩进 8 空格。
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LESSON_FILES = [
  path.join(ROOT, "src", "data", "lessons.ts"),
  path.join(ROOT, "src", "data", "lessons-cams.ts"),
];
const MOCK_EXAM_FILE = path.join(ROOT, "src", "data", "cams", "mock-exam.ts");

/**
 * URL 冻结表：id → slug。
 * 改动这里等于**让已发出的课程链接 404**，只有在明确要废弃 URL 时才允许修改，
 * 且必须同步在 docs/BACKLOG.md 记录重定向方案。
 */
const FROZEN_URLS = {
  "01": "fund-lifecycle",
  "02": "fund-structure",
  "10": "aml-kyc",
  "11": "aml-foundations",
  "12": "fatca-crs",
  "13": "aml-technology-monitoring",
  "14": "cayman-framework",
  "15": "bvi-fund-manager",
};

const errors = [];
const err = (check, msg) => errors.push(`[${check}] ${msg}`);

/** 统一行尾（Windows 检出为 CRLF，直接按 \n 切分会解析不到块） */
const readSource = (f) => fs.readFileSync(f, "utf8").replace(/\r\n?/g, "\n");

const num = (id) => parseInt(id, 10);
const pad = (n) => String(n).padStart(2, "0");

/* ---------------- 解析 ---------------- */

/** 解析所有必修讲：id / slug / 模块标题前缀数组 */
function loadLessons() {
  const out = [];
  for (const file of LESSON_FILES) {
    const src = readSource(file);
    for (const block of src.split(/\n  \{\n/).slice(1)) {
      const idM = /(?:^|\n)    id: "([^"]+)"/.exec(block);
      const slugM = /(?:^|\n)    slug: "([^"]+)"/.exec(block);
      const titleM = /(?:^|\n)    title: "([^"]+)"/.exec(block);
      if (!idM || !slugM) continue;
      // 选修（E**）不在必修编号体系内，跳过
      if (/^E/.test(idM[1])) continue;
      // 模块标题：仅取带「数字.数字 」前缀的标题，避免误抓 quiz / mistakes
      const mods = [...block.matchAll(/(?:^|\n)        title: "(\d+\.\d+)[^"]*"/g)].map(
        (m) => m[1]
      );
      out.push({ id: idM[1], slug: slugM[1], title: titleM ? titleM[1] : "", mods });
    }
  }
  return out;
}

/** 解析模拟考展示编号 */
function loadMockExamId() {
  const src = readSource(MOCK_EXAM_FILE);
  const m = /CAMS_MOCK_EXAM_ID\s*=\s*"([^"]+)"/.exec(src);
  return m ? m[1] : null;
}

/* ---------------- 校验 ---------------- */

const lessons = loadLessons();
const mockId = loadMockExamId();

if (lessons.length === 0) {
  err("Parse", `未从 ${LESSON_FILES.length} 个数据文件解析到任何必修讲 —— 解析器可能已失效`);
}

// 展示顺序 = id 数字序（与 src/lib/ordering.ts 的 orderedLessons 同口径）
const ordered = [...lessons].sort((a, b) => num(a.id) - num(b.id));

/** 展示编号：必修下标 + 1 */
const displayOf = new Map(ordered.map((l, i) => [l.id, pad(i + 1)]));

/* 1. URL 冻结 */
for (const l of ordered) {
  const frozen = FROZEN_URLS[l.id];
  if (!frozen) {
    err("URL Freeze", `新增必修讲 id=${l.id} 未登记进 FROZEN_URLS —— 请补冻结表`);
  } else if (frozen !== l.slug) {
    err(
      "URL Freeze",
      `id=${l.id} 的 slug 被改为 "${l.slug}"（冻结值 "${frozen}"）—— 已发出的 /courses/${frozen} 将 404`
    );
  }
}
for (const id of Object.keys(FROZEN_URLS)) {
  if (!ordered.some((l) => l.id === id)) {
    err("URL Freeze", `冻结表中 id=${id} 已不存在于课程数据 —— 请确认是有意删除并同步冻结表`);
  }
}

/* 2. 展示编号连续且唯一 */
const seenNum = new Map();
for (const l of ordered) {
  const d = displayOf.get(l.id);
  if (seenNum.has(d)) {
    err("Display Number", `展示编号 ${d} 同时被 id=${seenNum.get(d)} 与 id=${l.id} 占用`);
  }
  seenNum.set(d, l.id);
}
for (let i = 1; i <= ordered.length; i += 1) {
  if (!seenNum.has(pad(i))) {
    err("Display Number", `展示编号序列缺号 ${pad(i)}（期望连续 01…${pad(ordered.length)}）`);
  }
}

/* 3. 模块标题前缀与展示编号一致 */
for (const l of ordered) {
  const want = num(displayOf.get(l.id));
  if (l.mods.length === 0) {
    err("Module Prefix Match", `id=${l.id}（展示 ${displayOf.get(l.id)}）未解析到任何模块标题`);
    continue;
  }
  l.mods.forEach((prefix, idx) => {
    const expected = `${want}.${idx + 1}`;
    if (prefix !== expected) {
      err(
        "Module Prefix Match",
        `id=${l.id}（展示 ${displayOf.get(l.id)}）第 ${idx + 1} 个模块标题前缀为 "${prefix}"，` +
          `应为 "${expected}" —— 数据里的标题前缀没跟着展示编号走`
      );
    }
  });
}

/* 4. 模拟考编号 = 必修数 + 1 */
const expectedMock = pad(ordered.length + 1);
if (!mockId) {
  err("Mock Exam Number", `未能从 ${path.basename(MOCK_EXAM_FILE)} 解析出 CAMS_MOCK_EXAM_ID`);
} else if (mockId !== expectedMock) {
  err(
    "Mock Exam Number",
    `CAMS_MOCK_EXAM_ID="${mockId}"，但必修 ${ordered.length} 门的下一号应为 "${expectedMock}"`
  );
}

/* 5. id 与模拟考编号撞号 */
if (mockId && ordered.some((l) => l.id === mockId)) {
  err("No Id Collision", `必修 id="${mockId}" 与模拟考展示编号撞号 —— 编号体系已不自洽`);
}

/* ---------------- 输出 ---------------- */

console.log("课程展示编号校验（V1.20.0）\n");
console.log(`  必修 ${ordered.length} 门 + 全真模拟 1 门\n`);
console.log("  展示编号   数据主键 id   slug                        模块前缀");
console.log("  ─────────────────────────────────────────────────────────────────");
for (const l of ordered) {
  console.log(
    `     ${displayOf.get(l.id)}      ${l.id.padEnd(11)}  ${l.slug.padEnd(26)}  ${l.mods.join(" / ")}`
  );
}
console.log(
  `     ${(mockId ?? "??").padEnd(8)}  ${"—".padEnd(11)}  ${"（/cams-exam，考试入口）".padEnd(24)}  —`
);
console.log("");

if (errors.length > 0) {
  console.error(`✗ 编号校验发现 ${errors.length} 个问题：\n`);
  for (const e of errors) console.error(`  ${e}`);
  console.error("\n构建已阻断。修复后重跑 `npm run check:lesson-numbers`。");
  process.exit(1);
}

console.log("✓ 编号校验通过：URL 冻结一致 · 展示编号连续唯一 · 模块前缀匹配 · 模拟考编号自洽");
process.exit(0);
