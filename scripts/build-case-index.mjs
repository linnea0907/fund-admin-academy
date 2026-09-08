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
  return {
    id: normStr(data.id) || file.replace(/\.md$/i, ""),
    file,
    title,
    level: normStr(data.level),
    module: modNum,
    tags: normTags(data.tags),
    skills: normSkills(data.skills),
    estimatedTime: normTime(data.estimatedTime),
    ready,
  };
});

const index = {
  schema: "case-library-index",
  version: 3,
  generatedAt: new Date().toISOString(),
  total: cases.length,
  ready: cases.filter((c) => c.ready).length,
  cases,
};

fs.writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(
  `[case-index] ${OUT} written — total ${cases.length}, ready ${index.ready}`
);
