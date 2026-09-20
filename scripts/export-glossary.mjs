#!/usr/bin/env node
/**
 * Fund Admin Wiki — 术语库全量导出（V1.20.6 新增）
 *
 * 用途：把术语库当前全量内容导出成**人可读 + 机可读**的快照，供交给外部
 * Copilot 做「查重 / 补写 / 审核」等离线工作。
 *
 * 设计原则：
 *   ① **单一口径**：经 `scripts/lib/ts-loader.mjs` 直载 `GLOSSARY_TERMS`，
 *      与页面渲染、与 `check-glossary.mjs` 闸门同源，绝不正则解析源码。
 *   ② **零臆造**：所有字段原样输出，不做改写、不做摘要。
 *   ③ **自包含**：导出文件里带上字段规范 + 受控枚举 + 统计，
 *      收到文件的人不需要再回仓库就能写出合法条目。
 *
 * 产出（默认写到 `--out` 指定目录）：
 *   glossary-full.md    全量条目 + 规范 + 枚举 + 统计（主交付物，可直接附件发出）
 *   glossary-full.json  结构化全量（工具消费 / 程序比对）
 *   glossary-index.tsv  一行一条的精简索引（最低 token 的查重表）
 *
 * 用法：
 *   node scripts/export-glossary.mjs --out "<目录>"
 */

import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = path.resolve(import.meta.dirname, "..");

register("./ts-loader.mjs", pathToFileURL(path.join(ROOT, "scripts", "lib") + path.sep));

const { GLOSSARY_TERMS } = await import("@/data/glossary");
const {
  GLOSSARY_CATEGORIES,
  TERM_LEVELS,
  TERM_JURISDICTIONS,
  TERM_SCENARIOS,
  TERM_SOURCES,
} = await import("@/types/glossary");
const { siteConfig } = await import("@/lib/site-config");
const { buildWikiHealth } = await import("@/lib/glossary-usage");

const SITE_VERSION = siteConfig.version;

/**
 * 官方覆盖率口径（与站内「术语库 · 健康度」Dashboard 完全同源）：
 *   覆盖率 = 至少关联 1 门课程 **或** 1 个案例的术语占比。
 *   孤立术语 = 既无课程关联、也无案例关联。
 * ⚠️ 与「无 related 关联边」是两个不同指标，本文件里分开呈现，避免误读。
 */
const health = buildWikiHealth();
const usageOf = new Map(health.rows.map((r) => [r.id, r]));

/* ---------------- 参数 ---------------- */
const outIdx = process.argv.indexOf("--out");
const OUT_DIR = outIdx > -1 ? path.resolve(process.argv[outIdx + 1]) : path.join(ROOT, "glossary-export");
fs.mkdirSync(OUT_DIR, { recursive: true });

/* ---------------- 派生统计 ---------------- */
const catZh = new Map(GLOSSARY_CATEGORIES.map((c) => [c.id, c]));
const lvlZh = new Map(TERM_LEVELS.map((l) => [l.id, l]));
const srcLabel = new Map(TERM_SOURCES.map((s) => [s.id, s]));

const byCategory = {};
const byLevel = {};
const byJurisdiction = {};
const bySource = {};
for (const t of GLOSSARY_TERMS) {
  byCategory[t.category] = (byCategory[t.category] ?? 0) + 1;
  byLevel[t.level] = (byLevel[t.level] ?? 0) + 1;
  for (const j of t.jurisdiction ?? []) byJurisdiction[j] = (byJurisdiction[j] ?? 0) + 1;
  for (const s of t.source ?? []) bySource[s] = (bySource[s] ?? 0) + 1;
}

// 关联图：出边 (related) + 入边（被别的术语引用）
const ids = new Set(GLOSSARY_TERMS.map((t) => t.id));
const inbound = new Map(GLOSSARY_TERMS.map((t) => [t.id, 0]));
let edgeCount = 0;
const brokenRelated = [];
for (const t of GLOSSARY_TERMS) {
  for (const r of t.related ?? []) {
    edgeCount++;
    if (!ids.has(r)) brokenRelated.push({ from: t.id, to: r });
    else inbound.set(r, (inbound.get(r) ?? 0) + 1);
  }
}
const isolated = GLOSSARY_TERMS.filter(
  (t) => (t.related ?? []).length === 0 && (inbound.get(t.id) ?? 0) === 0,
).map((t) => t.id);
const withCases = GLOSSARY_TERMS.filter((t) => (t.cases ?? []).length > 0).length;
const withCourses = GLOSSARY_TERMS.filter((t) => (t.courses ?? []).length > 0).length;
const withMistakes = GLOSSARY_TERMS.filter((t) => (t.commonMistakes ?? []).length > 0).length;
/** 官方「孤立」（既无课程关联、也无案例关联）——与上面 related 口径不同 */
const orphanIds = health.rows.filter((r) => r.isolated).map((r) => r.id);

/* ---------------- 1) 全量 JSON ---------------- */
const jsonPayload = {
  meta: {
    site: "Fund Admin Academy",
    module: "Glossary",
    version: SITE_VERSION,
    exportedAt: new Date().toISOString(),
    total: GLOSSARY_TERMS.length,
    note: "唯一数据源 src/data/glossary/*.ts 的完整快照；字段定义见 src/types/glossary.ts",
  },
  enums: {
    categories: GLOSSARY_CATEGORIES.map((c) => ({ id: c.id, label: c.label, zh: c.zh })),
    levels: TERM_LEVELS.map((l) => ({ id: l.id, label: l.label, zh: l.zh })),
    jurisdictions: TERM_JURISDICTIONS,
    scenarios: TERM_SCENARIOS,
    sources: TERM_SOURCES.map((s) => ({ id: s.id, label: s.label, nature: s.nature })),
  },
  stats: {
    total: GLOSSARY_TERMS.length,
    relatedEdges: edgeCount,
    isolatedByRelatedEdge: isolated.length,
    isolatedByRelatedEdgeList: isolated,
    withCases,
    withCourses,
    withCommonMistakes: withMistakes,
    byCategory,
    byLevel,
    byJurisdiction,
    bySource,
    brokenRelated,
    /** 官方覆盖率口径（同站内健康度 Dashboard） */
    coverage: {
      definition: "至少关联 1 门课程 或 1 个案例的术语占比；孤立 = 两者皆无",
      linkedCourses: health.linkedCourses,
      linkedCases: health.linkedCases,
      linkedBoth: health.linkedBoth,
      linkedAny: health.linkedAny,
      isolated: health.isolated,
      coveragePct: health.coverage,
      byCategory: health.byCategory,
      byLevel: health.byLevel,
    },
  },
  /** 每个术语在课程 / 案例正文中的自动命中数（零人工维护，与站内展示一致） */
  usage: Object.fromEntries(
    health.rows.map((r) => [r.id, { lessons: r.lessonCount, cases: r.caseCount, isolated: r.isolated }]),
  ),
  orphanTerms: orphanIds,
  terms: GLOSSARY_TERMS,
};
fs.writeFileSync(path.join(OUT_DIR, "glossary-full.json"), JSON.stringify(jsonPayload, null, 2), "utf8");

/* ---------------- 2) 精简索引 TSV ---------------- */
const tsvHead = [
  "#",
  "id",
  "term",
  "fullName",
  "zh",
  "category",
  "level",
  "jurisdiction",
  "related_count",
  "courses_auto",
  "cases_auto",
  "isolated",
  "cases",
  "courses",
].join("\t");
const tsvRows = GLOSSARY_TERMS.map((t, i) => {
  const u = usageOf.get(t.id);
  return [
    i + 1,
    t.id,
    t.term,
    t.fullName,
    t.zh,
    t.category,
    t.level,
    (t.jurisdiction ?? []).join("|"),
    (t.related ?? []).length,
    u?.lessonCount ?? 0,
    u?.caseCount ?? 0,
    u?.isolated ? "Y" : "",
    (t.cases ?? []).join("|"),
    (t.courses ?? []).join("|"),
  ].join("\t");
});
fs.writeFileSync(path.join(OUT_DIR, "glossary-index.tsv"), [tsvHead, ...tsvRows].join("\n") + "\n", "utf8");

/* ---------------- 3) 全量 Markdown（主交付物） ---------------- */
const L = [];
const p = (s = "") => L.push(s);

p(`# Fund Admin Academy · 术语库全量导出`);
p();
p(`- **版本**：${SITE_VERSION}`);
p(`- **导出时间**：${new Date().toISOString().replace("T", " ").slice(0, 19)} UTC`);
p(`- **术语总数**：**${GLOSSARY_TERMS.length}** 条 · 覆盖率 **${health.coverage}%**（${health.linkedAny}/${health.total}）· 孤立 **${health.isolated}** 条`);
p(`- **数据源**：仓库唯一数据层 \`src/data/glossary/*.ts\`（本文件为其完整快照，未做任何改写）`);
p();
p(`> 用途：供外部协作方（Copilot）做**查重**、**字段对照**、**补写新术语**三类工作。`);
p(`> 收到本文件即可独立产出合法条目，无需访问仓库。`);
p();
p(`---`);
p();

/* --- 一、字段规范 --- */
p(`## 一、字段规范（共 18 个字段，前 13 项为结构必填）`);
p();
p(`| 字段 | 类型 | 必填 | 说明 |`);
p(`|---|---|---|---|`);
p(`| \`id\` | string | ✅ | 唯一标识，URL 用，kebab-case（如 \`capital-call\`）。**稳定后不可改**——收藏、正文高亮锚点、其他术语的 \`related\` 全依赖它 |`);
p(`| \`term\` | string | ✅ | 英文缩写或术语名（如 \`AML\` / \`Capital Call\`） |`);
p(`| \`fullName\` | string | ✅ | 英文全称；无全称时**与 \`term\` 相同** |`);
p(`| \`zh\` | string | ✅ | 中文名 |`);
p(`| \`category\` | enum | ✅ | 八大分类之一，见 §二.1 |`);
p(`| \`level\` | enum | ✅ | 成熟度 \`core\` / \`advanced\` / \`expert\`，见 §二.2 |`);
p(`| \`jurisdiction\` | enum[] | ✅ | 规则来源属地（**非投资人国籍**），可多个；通用规则用 \`Global\`，见 §二.3 |`);
p(`| \`definition\` | string | ✅ | 定义，2~4 句 |`);
p(`| \`whyImportant\` | string | ✅ | 为什么重要，实务视角，2~4 句 |`);
p(`| \`scenario\` | enum[] | ✅ | 实务发生环节（受控词表），见 §二.4 |`);
p(`| \`brief\` | string | ✅ | 一句话定义，用于列表行 / 抽屉标题下摘要 |`);
p(`| \`aliases\` | string[] | ✅ | 别名（英文全称、缩写变体、中文别称）。**参与正文标注**，撞车会被闸门拦下 |`);
p(`| \`related\` | string[] | ✅ | 关联术语 id（须指向存在的 id，否则闸门报断链） |`);
p(`| \`tags\` | string[] | ✅ | 自由标签，关键词检索用 |`);
p(`| \`source\` | enum[] | ✅ | 术语来源，可多个，见 §二.5 |`);
p(`| \`cases\` | string[] | ⬜ | 人工指定关联案例 id（\`Case-001\`），须指向存在的案例 |`);
p(`| \`courses\` | string[] | ⬜ | 人工指定关联课程 id（\`01\` / \`E1\`），须是存在的课程 |`);
p(`| \`commonMistakes\` | string[] | ⬜ | 常见误区 1~3 条 |`);
p();
p(`**硬规矩**：`);
p();
p(`1. 不写**时效性内容**（生效日期、罚款金额、执法数字）——静态站点不维护时效数据。`);
p(`2. \`aliases\` 与 \`related\` 若填错，构建会被闸门**阻断**（不是警告）。`);
p(`3. 无法确定值时可留空数组 \`[]\`，但**不可写占位符**（\`〔待补〕\` 会被导入脚本拒收）。`);
p();

/* --- 二、受控枚举 --- */
p(`## 二、受控枚举全清单`);
p();
p(`### 二.1 分类 category（8 类，共 ${GLOSSARY_CATEGORIES.length} 项）`);
p();
p(`| id | 英文 | 中文 | 本类现有条数 |`);
p(`|---|---|---|---|`);
for (const c of GLOSSARY_CATEGORIES) p(`| \`${c.id}\` | ${c.label} | ${c.zh} | ${byCategory[c.id] ?? 0} |`);
p();
p(`### 二.2 等级 level（3 档）`);
p();
p(`| id | 英文 | 中文 | 含义 | 现有条数 |`);
p(`|---|---|---|---|---|`);
p(`| \`core\` | Core | 基础 | 入门必学、日常高频 | ${byLevel.core ?? 0} |`);
p(`| \`advanced\` | Advanced | 进阶 | 需要一定实务经验 | ${byLevel.advanced ?? 0} |`);
p(`| \`expert\` | Expert | 专精 | 高度专业或小众主题 | ${byLevel.expert ?? 0} |`);
p();
p(`### 二.3 属地 jurisdiction（12 项）`);
p();
p(`${TERM_JURISDICTIONS.map((j) => `\`${j}\``).join(" · ")}`);
p();
p(`现有分布：${Object.entries(byJurisdiction).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(" · ")}`);
p();
p(`### 二.4 实务场景 scenario（10 项）`);
p();
p(`${TERM_SCENARIOS.map((s) => `\`${s}\``).join(" · ")}`);
p();
p(`### 二.5 来源 source（6 项）`);
p();
p(`| id | 名称 | 性质 | 现有引用条数 |`);
p(`|---|---|---|---|`);
for (const s of TERM_SOURCES) p(`| \`${s.id}\` | ${s.label} | ${s.nature} | ${bySource[s.id] ?? 0} |`);
p();
p(`---`);
p();

/* --- 三、统计 --- */
p(`## 三、当前统计`);
p();
p(`### 三.1 覆盖率（官方口径，与站内「健康度」Dashboard 同源）`);
p();
p(`> 覆盖率 = **至少关联 1 门课程 或 1 个案例**的术语占比。该数字由全站正文自动扫描得出，零人工维护。`);
p(`> 「孤立术语」= 既无课程关联、也无案例关联 —— **这是判断"哪些术语还需要补内容/补关联"的主要依据**。`);
p();
p(`| 项 | 值 |`);
p(`|---|---|`);
p(`| 术语总数 | ${health.total} |`);
p(`| 至少关联 1 门课程 | ${health.linkedCourses} |`);
p(`| 至少关联 1 个案例 | ${health.linkedCases} |`);
p(`| 课程与案例都关联 | ${health.linkedBoth} |`);
p(`| 至少关联其一（并集） | **${health.linkedAny}** |`);
p(`| **覆盖率** | **${health.coverage}%** |`);
p(`| **孤立术语** | **${health.isolated}** |`);
p();
p(`按分类覆盖：`);
p();
p(`| 分类 | 总数 | 已关联 | 孤立 | 覆盖率 |`);
p(`|---|---|---|---|---|`);
for (const b of health.byCategory) {
  if (!b.total) continue;
  p(`| ${b.label} | ${b.total} | ${b.linked} | ${b.isolated} | ${b.coverage}% |`);
}
p();
p(`### 三.2 关联图与字段完整度`);
p();
p(`| 项 | 值 | 说明 |`);
p(`|---|---|---|`);
p(`| 关联术语边（\`related\` 出边合计） | ${edgeCount} | 人工维护的术语↔术语关联 |`);
p(`| 无 \`related\` 关联边的术语 | ${isolated.length} | ⚠️ 与上方「孤立术语」口径**不同**（此项只看 related，不看课程/案例正文命中） |`);
p(`| 手工填写 \`cases\` 的术语 | ${withCases} | 其余靠正文自动扫描补充 |`);
p(`| 手工填写 \`courses\` 的术语 | ${withCourses} | 同上 |`);
p(`| 带 \`commonMistakes\` 的术语 | ${withMistakes} | 缺此项不报错，但影响学习价值 |`);
p(`| 断链 \`related\`（应为 0） | ${brokenRelated.length} | 非 0 会被构建闸门阻断 |`);
p();
if (orphanIds.length) {
  p(`**孤立术语 id 清单（${orphanIds.length} 条，补关联优先看这里）**：`);
  p();
  p("```");
  p(orphanIds.join(", "));
  p("```");
  p();
}
p(`---`);
p();

/* --- 四、速查索引 --- */
p(`## 四、速查索引（查重用，按分类分组）`);
p();
p(`> **新增术语前请先在本表与 §五 全文里搜一遍**，避免与既有术语重复或语义重叠。`);
p(`> 「讲/例」= 该术语在课程正文 / 案例正文中被自动命中的数量，\`0/0\` 即孤立术语。`);
p();
for (const c of GLOSSARY_CATEGORIES) {
  const list = GLOSSARY_TERMS.filter((t) => t.category === c.id);
  if (!list.length) continue;
  p(`### ${c.zh}（\`${c.id}\`）· ${list.length} 条`);
  p();
  p(`| # | term | 中文名 | 等级 | 讲/例 | id |`);
  p(`|---|---|---|---|---|---|`);
  for (const t of list) {
    const g = GLOSSARY_TERMS.indexOf(t) + 1;
    const u = usageOf.get(t.id);
    p(`| ${g} | ${t.term} | ${t.zh} | ${t.level} | ${u?.lessonCount ?? 0}/${u?.caseCount ?? 0} | \`${t.id}\` |`);
  }
  p();
}
p(`---`);
p();

/* --- 五、全量条目 --- */
p(`## 五、全量条目（完整字段）`);
p();
p(`> 顺序与数据层数组一致（也是正文标注的匹配优先级：同文本冲突取靠前者）。`);
p();
GLOSSARY_TERMS.forEach((t, i) => {
  const n = String(i + 1).padStart(3, "0");
  const u = usageOf.get(t.id);
  p(`### ${n} · ${t.term} — ${t.zh}`);
  p();
  p(`| 字段 | 值 |`);
  p(`|---|---|`);
  p(`| \`id\` | \`${t.id}\` |`);
  p(`| \`term\` | ${t.term} |`);
  p(`| \`fullName\` | ${t.fullName} |`);
  p(`| \`zh\` | ${t.zh} |`);
  p(`| \`category\` | \`${t.category}\`（${catZh.get(t.category)?.zh ?? ""}） |`);
  p(`| \`level\` | \`${t.level}\`（${lvlZh.get(t.level)?.zh ?? ""}） |`);
  p(`| \`jurisdiction\` | ${(t.jurisdiction ?? []).map((j) => `\`${j}\``).join(" · ") || "—"} |`);
  p(`| \`scenario\` | ${(t.scenario ?? []).map((s) => `\`${s}\``).join(" · ") || "—"} |`);
  p(`| \`source\` | ${(t.source ?? []).map((s) => `\`${s}\`（${srcLabel.get(s)?.label ?? ""}）`).join(" · ") || "—"} |`);
  p(`| \`aliases\` | ${(t.aliases ?? []).join(" / ") || "—"} |`);
  p(`| \`related\` | ${(t.related ?? []).map((r) => `\`${r}\``).join(" · ") || "—"} |`);
  p(`| \`cases\` | ${(t.cases ?? []).join(" · ") || "—"} |`);
  p(`| \`courses\` | ${(t.courses ?? []).join(" · ") || "—"} |`);
  p(`| \`tags\` | ${(t.tags ?? []).join(" · ") || "—"} |`);
  p(`| 正文自动命中 | 课程 ${u?.lessonCount ?? 0} · 案例 ${u?.caseCount ?? 0}${u?.isolated ? "（**孤立术语**）" : ""} |`);
  p();
  p(`**brief**：${t.brief}`);
  p();
  p(`**definition**：${t.definition}`);
  p();
  p(`**whyImportant**：${t.whyImportant}`);
  p();
  if ((t.commonMistakes ?? []).length) {
    p(`**commonMistakes**：`);
    p();
    for (const m of t.commonMistakes) p(`- ${m}`);
    p();
  }
});

const md = L.join("\n");
fs.writeFileSync(path.join(OUT_DIR, "glossary-full.md"), md, "utf8");

/* ---------------- 报告 ---------------- */
const kb = (s) => `${(Buffer.byteLength(s, "utf8") / 1024).toFixed(1)} KB`;
console.log("── 术语库导出完成 ──────────────────────");
console.log(`版本           ${SITE_VERSION}`);
console.log(`术语总数       ${GLOSSARY_TERMS.length}`);
console.log(`覆盖率         ${health.coverage}%（${health.linkedAny}/${health.total}）· 孤立 ${health.isolated}`);
console.log(`输出目录       ${OUT_DIR}`);
console.log(`  glossary-full.md     ${kb(md)}`);
console.log(`  glossary-full.json   ${kb(JSON.stringify(jsonPayload))}`);
console.log(`  glossary-index.tsv   ${kb([tsvHead, ...tsvRows].join("\n"))}`);
console.log(`关联边 ${edgeCount} · 无 related 边 ${isolated.length} · 断链 ${brokenRelated.length}`);
if (brokenRelated.length) {
  console.error("⚠️ 存在断链 related：", brokenRelated);
  process.exit(1);
}
