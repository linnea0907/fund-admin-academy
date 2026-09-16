#!/usr/bin/env node
/**
 * 生成案例数据索引：content/cases/index.json
 *
 * 扫描 content/cases/Case-*.md，解析 frontmatter（id/title/level/module/tags/estimatedTime）
 * 并按 `# 中文小节` 判断内容是否已导入（ready）。索引仅含元数据，不含正文。
 *
 * V2 模板小节顺序：场景背景 → 已收到资料 → 缺失资料 → 你的判断 → 标准答案 →
 * 理由分析 → 常见错误 → 客户沟通示例 → ICS SOP依据 → Takeaway
 *
 * 用法：node scripts/build-case-index.mjs （npm run gen:cases）
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ROOT = process.cwd();
const DIR = path.join(ROOT, "content", "cases");
const OUT = path.join(DIR, "index.json");

/** 受控清单（与 src/lib/case-categories.ts 保持一致；此处仅做值域校验与缺省兜底） */
const JURISDICTIONS = new Set(["Cayman", "BVI", "Hong Kong", "Singapore", "China", "USA", "UK", "UAE", "Other"]);
const BUSINESS_AREAS = new Set(["Investor Onboarding", "Transfer", "Redemption", "Periodic Review", "AEOI / CRS / FATCA", "Fund Setup", "Fund Governance", "Fund Operations"]);
const ENTITY_TYPES = new Set(["Individual", "Corporate", "Trust", "Partnership", "Fund"]);
const TOPICS = new Set(["Identity Verification", "Address Proof", "UBO", "Trust", "PEP", "Adverse Media", "SOF", "SOW", "Sanctions", "Tax Residency", "CRS", "FATCA", "Screening", "AML Audit", "Outsourcing", "EDD", "Third Party Payment"]);

function stripComments(md) {
  return md.replace(/<!--[\s\S]*?-->/g, "");
}

const SECTIONS = [
  "场景背景",
  "已收到资料",
  "缺失资料",
  "你的判断",
  "标准答案",
  "理由分析",
  "常见错误",
  "客户沟通示例",
  "ICS SOP依据",
  "Takeaway",
];
const KEY_SET = new Set(SECTIONS);

function splitSections(body) {
  const out = {};
  const lines = body.split(/\r?\n/);
  let cur = null;
  const buf = [];
  const flush = () => {
    if (cur) {
      const text = stripComments(buf.join("\n")).trim();
      if (text) out[cur] = true;
    }
    buf.length = 0;
  };
  for (const line of lines) {
    const m = /^#\s+(.+?)\s*$/.exec(line.trim());
    if (m && KEY_SET.has(m[1].trim())) {
      flush();
      cur = m[1].trim();
    } else if (cur) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

const normStr = (v) => (typeof v === "string" ? v.trim() : "");
const normNum = (v) => {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.round(n) : 0;
};
const normTime = (v) => {
  const n = normNum(v);
  return n > 0 ? n : null;
};
const normModule = (v) => {
  const n = normNum(v);
  return n >= 1 && n <= 5 ? n : 0;
};
const normTags = (v) =>
  Array.isArray(v)
    ? v.map((t) => String(t).trim()).filter(Boolean)
    : typeof v === "string" && v.trim()
      ? [v.trim()]
      : [];
const normSkills = (v) => {
  if (!Array.isArray(v)) return [];
  const seen = new Set();
  const out = [];
  for (const s of v) {
    const t = String(s).trim();
    if (t && !seen.has(t)) {
      seen.add(t);
      out.push(t);
    }
  }
  return out;
};

/** 规范化受控多值字段（如 jurisdiction/topics）：值域外的项丢弃；缺省/非法 → [fallback] */
const normList = (v, allowed, fallback) => {
  if (Array.isArray(v)) {
    const seen = new Set();
    const out = [];
    for (const x of v) {
      const t = String(x).trim();
      if (t && allowed.has(t) && !seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
    }
    if (out.length > 0) return out;
    return fallback !== undefined ? [fallback] : [];
  }
  const t = normStr(v);
  if (t && allowed.has(t)) return [t];
  return fallback !== undefined ? [fallback] : [];
};

/** 规范化受控单值字段（businessArea/entityType）：非法 → fallback */
const normSingle = (v, allowed, fallback) => {
  const t = normStr(v);
  return t && allowed.has(t) ? t : fallback;
};

/**
 * 全文检索词元（V1.15.3 案例库搜索栏）
 *
 * 口径 = 元数据（编号 / 标题 / 难度 / 属地 / 实体 / 业务域 / 标签 / 主题 / 技能）
 *      + 正文中的**拉丁词元**（小写去重、长度 ≥3、剔除常见英文停用词）。
 * 中文正文不入索引（29 篇全文约 160KB，塞进 RSC payload 不划算）——
 * 中文检索覆盖标题、标签、主题等元数据字段；英文缩写（SPC / UBO / AML / CRS / PEP 等）
 * 由正文词元兜住。
 *
 * ⚠️ 与 src/lib/cases.ts 的 buildCaseSearchText() 必须保持同一口径（两处同步改）。
 */
const SEARCH_STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "are", "was", "were",
  "has", "have", "had", "not", "but", "you", "your", "our", "their", "his",
  "her", "its", "all", "any", "can", "may", "must", "should", "will", "would",
  "shall", "been", "being", "into", "out", "about", "after", "before", "when",
  "where", "which", "who", "whom", "what", "how", "why", "than", "then",
  "there", "here", "they", "them", "these", "those", "such", "also", "only",
  "more", "most", "other", "some", "each", "both", "over", "under", "between",
  "per", "via", "yes", "nor", "own", "too", "very", "just", "same", "able",
]);

/** 由元数据 + 正文生成 searchText（小写、空格分隔、去重） */
function buildSearchText(meta, body) {
  const parts = [
    meta.id,
    meta.title,
    meta.level,
    ...(meta.jurisdiction ?? []),
    meta.businessArea,
    meta.entityType,
    ...(meta.tags ?? []),
    ...(meta.topics ?? []),
    ...(meta.skills ?? []),
  ];
  for (const tok of String(body ?? "").match(/[A-Za-z][A-Za-z0-9&/']{2,}/g) ?? []) {
    const t = tok.toLowerCase().replace(/[&/']+$/, "");
    if (t.length >= 3 && !SEARCH_STOP_WORDS.has(t)) parts.push(t);
  }
  const seen = new Set();
  const out = [];
  for (const p of parts) {
    const v = String(p ?? "").trim().toLowerCase();
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out.join(" ");
}

const files = fs
  .readdirSync(DIR)
  .filter((f) => /^Case-\d{3,}\.md$/i.test(f))
  .sort((a, b) => {
    const n = (f) => Number(/^Case-(\d+)\.md$/i.exec(f)[1]);
    return n(a) - n(b);
  });

const cases = files.map((file) => {
  const raw = fs.readFileSync(path.join(DIR, file), "utf8");
  const { data, content } = matter(raw);
  const title = normStr(data.title);
  const modNum = normModule(data.module);
  const sections = splitSections(content);
  const ready = title !== "" && modNum > 0 && Object.keys(sections).length > 0;
  const meta = {
    id: normStr(data.id) || file.replace(/\.md$/i, ""),
    file,
    title,
    level: normStr(data.level),
    module: modNum,
    tags: normTags(data.tags),
    skills: normSkills(data.skills),
    estimatedTime: normTime(data.estimatedTime),
    ready,
    // V1.13.1 分类体系
    jurisdiction: normList(data.jurisdiction, JURISDICTIONS, "Other"),
    businessArea: normSingle(data.businessArea, BUSINESS_AREAS, "Investor Onboarding"),
    entityType: normSingle(data.entityType, ENTITY_TYPES, "Other"),
    topics: normList(data.topics, TOPICS),
  };
  return { ...meta, searchText: buildSearchText(meta, stripComments(content)) };
});

const index = {
  schema: "case-library-index",
  version: 5,
  generatedAt: new Date().toISOString(),
  total: cases.length,
  ready: cases.filter((c) => c.ready).length,
  cases,
};

fs.writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(
  `[case-index] ${OUT} written — total ${cases.length}, ready ${index.ready}`
);
