#!/usr/bin/env node
/**
 * 生成案例数据索引：content/cases/index.json
 *
 * 扫描 content/cases/Case-*.md，解析 frontmatter（id/title/level/category/tags）
 * 并判断内容是否已导入（ready）。索引仅含元数据，不含正文。
 *
 * 用法：node scripts/build-case-index.mjs
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
  "background",
  "facts",
  "questions",
  "analysis",
  "practical_steps",
  "common_mistakes",
  "further_reading",
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
    const m = /^##\s+([A-Za-z_]+)\s*$/.exec(line.trim());
    if (m && KEY_SET.has(m[1])) {
      flush();
      cur = m[1];
    } else if (cur) {
      buf.push(line);
    }
  }
  flush();
  return out;
}

const normStr = (v) => (typeof v === "string" ? v.trim() : "");
const normTags = (v) =>
  Array.isArray(v)
    ? v.map((t) => String(t).trim()).filter(Boolean)
    : typeof v === "string" && v.trim()
      ? [v.trim()]
      : [];

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
  const level = normStr(data.level);
  const category = normStr(data.category);
  const tags = normTags(data.tags);
  const sections = splitSections(content);
  const ready = title !== "" && Object.keys(sections).length > 0;
  return {
    id: normStr(data.id) || file.replace(/\.md$/i, ""),
    file,
    title,
    level,
    category,
    tags,
    ready,
  };
});

const index = {
  schema: "case-library-index",
  version: 1,
  generatedAt: new Date().toISOString(),
  total: cases.length,
  ready: cases.filter((c) => c.ready).length,
  cases,
};

fs.writeFileSync(OUT, JSON.stringify(index, null, 2) + "\n", "utf8");
console.log(
  `[case-index] ${OUT} written — total ${cases.length}, ready ${index.ready}`
);
