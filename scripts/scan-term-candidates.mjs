#!/usr/bin/env node
/**
 * scan-term-candidates.mjs — 术语自动发现：扫描全站语料，产出「待审核术语」候选池
 *
 * 由来：V1.14.0 曾在 /wiki「知识工坊」内做过同一逻辑（src/lib/missing-terms.ts），
 * 于 V1.15.2 随知识工坊下线一并删除。本脚本按「术语自动发现」需求重建，
 * 落点改为案例工坊 → 术语库（不新增独立导航模块）。
 *
 * 使用：
 *   npm run scan:terms     # 手动
 *   npm run build          # prebuild 自动执行（非阻断：失败只告警，不拦构建）
 *
 * 产出：content/glossary/candidates.json（提交进仓库，同 content/cases/index.json 模式）
 *
 * 口径（三档信号，confidence 越高越可信）：
 *   declared  ①「中文名（缩写）」/「缩写（英文全称）」——正文自带声明，精度最高
 *   acronym   ② 中文语境中的 2~6 位全大写缩写（OFC / CFIUS / TBML / NFE）
 *   phrase    ③ 中文语境中的首字母大写词组 1~3 词（Private Investment Fund / Approved Manager）
 *
 * 过滤：
 *   - 用与页面标注**完全相同**的术语引擎 annotateSegments() 挖空已识别片段，只在未识别区间抽取
 *   - 「中文语境」规则：候选词 ±30 字符窗口内必须出现 CJK 字符
 *     → 自动剔除英文正文（客户邮件、英文 SOP 引用、双语段落）里的通用词（Kindly / Verify / the…）
 *   - 停用词 + 占位符（ABC / XYZ / 连续字母串）+ 地名货币缩写（HK / USD / EU…）
 *   - 与既有 candidates.json 合并，**保留 firstSeenAt**（首次发现时间跨构建稳定）
 *
 * 顺带取回（V1.20.6）：声明档会把正文自带的**中文名 / 英文全称**一并带回候选
 *   （`zh` / `fullName`），并记录课程 id（`courseIds`）—— 补全包据此直接填真实值，
 *   减少 Copilot 猜测面。**系统只负责发现与导出，定义类内容仍由 Copilot 撰写。**
 *
 * ⚠️ 边界：仅发现英文/缩写术语。中文术语不做自动发现（无词典兜底，误报率不可控）。
 *
 * 依赖：Node ≥ 22.18（默认启用 TS 类型剥离）+ scripts/lib/ts-loader.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const OUT_JSON = path.join(ROOT, "content", "glossary", "candidates.json");
const LIMIT = Number(process.env.FAA_SCAN_LIMIT || 200);

/* ================================================================
 * 0. 直载项目 TS 源码（与站点共用同一数据层，杜绝口径漂移）
 * ================================================================ */
try {
  register("./ts-loader.mjs", pathToFileURL(path.join(ROOT, "scripts", "lib") + path.sep));
} catch (err) {
  // Node < 22.18 无类型剥离 / register 不可用 → 非阻断
  console.warn(`[scan:terms] TS loader 注册失败（需 Node ≥ 22.18），保留既有 candidates.json：${err.message}`);
  process.exit(0);
}

let orderedAllLessons, listCaseIds, readCase, GLOSSARY_TERMS, annotateSegments;
try {
  ({ orderedAllLessons } = await import(
    pathToFileURL(path.join(ROOT, "src", "lib", "ordering.ts")).href
  ));
  ({ listCaseIds, readCase } = await import(
    pathToFileURL(path.join(ROOT, "src", "lib", "cases.ts")).href
  ));
  ({ GLOSSARY_TERMS, annotateSegments } = await import(
    pathToFileURL(path.join(ROOT, "src", "lib", "glossary.ts")).href
  ));
} catch (err) {
  // 非阻断：保留旧候选池，不拦构建
  console.warn(`[scan:terms] 源码加载失败，保留既有 candidates.json：${err.message}`);
  process.exit(0);
}

/* ================================================================
 * 1. 词表：停用词 / 占位符 / 地名货币
 * ================================================================ */
const STOPWORDS = new Set(
  [
    // 模板与结构词
    "case", "cases", "module", "modules", "index", "json", "md", "html", "pdf", "png", "jpg",
    "scenario", "documents", "document", "received", "missing", "question", "questions",
    "standard", "answer", "reasoning", "mistakes", "email", "sop", "reference", "takeaway",
    "title", "level", "tags", "skill", "skills", "estimated", "time", "frontmatter",
    "description", "example", "examples", "note", "notes", "sample", "template", "summary",
    "section", "sections", "part", "chapter", "appendix", "q1", "q2", "q3", "q4", "q5",
    // 通用业务词（术语库已收录的不在此列）
    "fund", "funds", "admin", "administrator", "administration", "management", "manager",
    "investor", "investors", "investment", "asset", "assets", "capital", "account", "accounts",
    "company", "limited", "corporation", "entity", "structure", "cayman", "bvi", "hong", "kong",
    "singapore", "china", "japan", "taiwan", "macau", "korea", "india",
    // 英文虚词与连接语（中文语境里夹带的）
    "yes", "no", "not", "and", "or", "the", "for", "with", "from", "this", "that", "which",
    "also", "such", "when", "where", "what", "who", "why", "how", "then", "than", "into",
    "over", "under", "about", "between", "within", "without", "through", "against", "upon",
    "only", "same", "each", "every", "some", "most", "many", "much", "more", "less", "least",
    "however", "therefore", "moreover", "furthermore", "otherwise", "meanwhile", "based",
    "using", "used", "use", "make", "made", "take", "given", "keep", "kept",
    // 邮件与礼貌用语
    "please", "thank", "thanks", "dear", "sir", "madam", "regards", "best", "kind", "kindly",
    "mr", "mrs", "ms", "dr", "prof", "team", "group", "member", "members", "attached",
    // 通用动作 / 状态 / 形容词（首字母大写词组误报高发区）
    "done", "draft", "final", "new", "old", "first", "second", "third", "before", "after",
    "during", "give", "send", "sent", "receive", "provided", "provide", "required", "require",
    "include", "includes", "included", "following", "below", "above", "important", "warning",
    "result", "results", "action", "actions", "issue", "issues", "point", "points", "reason",
    "reasons", "practice", "practices", "procedure", "procedures", "process", "processes",
    "service", "services", "system", "systems", "business", "activity", "activities",
    "verify", "identify", "monitor", "screen", "screening", "understand", "review", "reviews",
    "check", "checklist", "update", "updated", "update", "confirm", "confirmed", "submit",
    "submitted", "apply", "applied", "approve", "approved", "accept", "accepted", "reject",
    "escalate", "escalated", "report", "reported", "notify", "notified", "record", "recorded",
    "close", "closed", "closing", "open", "opened", "complete", "completed", "high", "low",
    "medium", "risk", "risks", "status", "true", "false", "null", "none", "other", "others",
    "all", "any", "both", "each", "card", "blue", "blue", "agent", "corp", "act", "non",
    "reporting", "holding", "holdings", "name", "address", "city", "country", "code", "number",
    "page", "pages", "version", "internal", "external", "type", "date", "day", "days", "week",
    "weeks", "month", "months", "year", "years", "today", "tomorrow", "annual", "quarterly",
    "monthly", "weekly", "daily", "lu", "wb", "source", "sources", "amount", "amounts",
    "total", "value", "values", "period", "periods", "basis", "base", "basis", "form", "forms",
    "list", "lists", "item", "items", "step", "steps", "data", "file", "files",
    // 常见缩写但非本域术语
    "ai", "it", "pc", "ok", "id", "ip", "url", "api", "ui", "ux", "iso", "faq", "cv",
    "na", "tbd", "etc", "aka", "eg", "ie", "vs", "asap", "fyi", "re", "no.",
  ].map((s) => s.toLowerCase())
);

/** 地名 / 货币 / 法域缩写（非术语，即使出现在中文语境） */
const GEO_CCY = new Set(
  [
    "hk", "sg", "us", "uk", "eu", "cn", "jp", "tw", "mo", "kr", "in", "au", "ca", "ch", "de",
    "fr", "nz", "my", "th", "vn", "ph", "ae", "sa", "za", "br", "mx", "ru", "usd", "hkd",
    "rmb", "cny", "eur", "gbp", "jpy", "aud", "cad", "sgd", "chf", "nzd", "prc", "apac", "emea",
  ].map((s) => s.toLowerCase())
);

/** 占位符：同名连续字母串（ABC / DEF / ABCD / XYZ / 重复字母） */
function isPlaceholder(raw) {
  const s = raw.toUpperCase();
  if (/^(.)\1+$/.test(s)) return true; // AA / BBB
  if (/^XYZ$/.test(s)) return true;
  if (s.length >= 3 && s.length <= 6) {
    let asc = true;
    let desc = true;
    for (let i = 1; i < s.length; i += 1) {
      const d = s.charCodeAt(i) - s.charCodeAt(i - 1);
      if (d !== 1) asc = false;
      if (d !== -1) desc = false;
    }
    if (asc || desc) return true;
  }
  return false;
}

/**
 * 本项目专有噪声（非行业术语）：机构名、产品名。
 * 新增只需在数组里加一项归一 key（小写）。
 */
const PROJECT_NOISE = new Set(["ics", "faa", "wb", "lu"]);

/** 实体名形态：以公司后缀结尾的，判为案例虚构主体而非行业术语 */
const ENTITY_SUFFIX = /\b(Ltd|Limited|LLC|LP|LLP|Inc|Corp|Corporation|Pte|Pty|GmbH|NV|BV)\b\.?$/i;
function looksLikeEntityName(raw) {
  return ENTITY_SUFFIX.test(raw.trim());
}

/* ================================================================
 * 2. 语料构建（label 供「来源课程 / 案例」列展示）
 * ================================================================ */
function buildCorpus() {
  const out = [];

  for (const lesson of orderedAllLessons) {
    const isElective = lesson.id.startsWith("E");
    const label = isElective ? `选修 ${lesson.id}` : `第 ${lesson.id} 讲`;
    const href = `/courses/${lesson.slug}`;
    if (lesson.title) {
      out.push({
        kind: "course",
        label: `${label} · ${lesson.title}`,
        href,
        text: [lesson.title, lesson.subtitle, ...(lesson.goal ?? [])].join("\n"),
      });
    }
    for (const mod of lesson.modules ?? []) {
      out.push({
        kind: "course",
        label: `${label} · ${mod.title}`,
        href: `${href}#${mod.id}`,
        text: [mod.title, ...(mod.body ?? []), ...(mod.points ?? [])].join("\n"),
      });
    }
    if (lesson.checklist?.length) {
      out.push({
        kind: "course",
        label: `${label} · Admin Checklist`,
        href,
        text: lesson.checklist.join("\n"),
      });
    }
    if (lesson.commonMistakes?.length) {
      out.push({
        kind: "course",
        label: `${label} · 常见错误`,
        href,
        text: lesson.commonMistakes.map((m) => `${m.title} ${m.detail}`).join("\n"),
      });
    }
  }

  for (const id of listCaseIds()) {
    const c = readCase(id);
    if (!c) continue;
    const href = `/cases/${id.toLowerCase()}`;
    out.push({ kind: "case", label: `${id} · 标题`, href, text: c.title });
    for (const [key, body] of Object.entries(c.sections ?? {})) {
      if (!body) continue;
      out.push({ kind: "case", label: `${id} · ${key}`, href, text: body });
    }
  }

  return out;
}

/* ================================================================
 * 3. 已录入术语的匹配文本（与页面标注同口径）
 * ================================================================ */
function registeredKeys() {
  const set = new Set();
  for (const t of GLOSSARY_TERMS) {
    set.add(t.term.toLowerCase());
    if (t.fullName) set.add(t.fullName.toLowerCase());
    for (const a of t.aliases ?? []) set.add(a.toLowerCase());
  }
  return set;
}

/** 把文本切成「未被术语引擎识别」的区间 */
function unrecognizedChunks(text) {
  return annotateSegments(text)
    .filter((s) => !s.termId)
    .map((s) => s.text);
}

/* ================================================================
 * 4. 抽取规则
 * ================================================================ */
/** ① 正文自带声明：任意前置文字（全大写缩写） */
const RX_DECLARED_ZH = /[\u4e00-\u9fa5A-Za-z][^\n（(]{0,24}[（(]\s*([A-Z][A-Za-z]{1,7})\s*[）)]/g;
/** ① 正文自带声明：缩写（英文全称） */
const RX_DECLARED_FULL = /\b([A-Z][A-Za-z]{1,7})\s*[（(]\s*([A-Z][a-z]+(?:\s+[A-Za-z]+){1,5})\s*[）)]/g;
/** ② 全大写缩写 */
const RX_ACRONYM = /\b[A-Z]{2,6}\b/g;
/** ③ 首字母大写词组 1~3 词 */
const RX_PHRASE = /\b[A-Z][a-z]{2,}(?:\s+[A-Z][a-z]{2,}){0,2}\b/g;

const CJK = /[\u4e00-\u9fff]/;
/** 「中文语境」判定：候选词 ±30 字符窗口内出现 CJK */
function inChineseContext(text, idx, len) {
  const from = Math.max(0, idx - 30);
  const to = Math.min(text.length, idx + len + 30);
  return CJK.test(text.slice(from, to));
}

function snippetOf(text, idx, len) {
  const from = Math.max(0, idx - 45);
  const to = Math.min(text.length, idx + len + 45);
  return `${from > 0 ? "…" : ""}${text.slice(from, to).replace(/\s+/g, " ")}${to < text.length ? "…" : ""}`;
}

/**
 * 从语料 label 反推稳定的实体 id（V1.20.6，供补全包的 courses 字段直接使用）。
 * label 由 buildCorpus() 生成，格式固定：
 *   课程 = 「第 02 讲 · …」/「选修 E04 · …」；案例 = 「Case-027 · …」（本身即 id）
 * → 课程 id 形态与术语数据的 `courses` 一致（"02" / "E04"，两位补零）。
 */
function refIdOf(doc) {
  const head = doc.label.split(" · ")[0];
  if (doc.kind === "case") return head;
  const m1 = /^第\s*(\d{2})\s*讲$/.exec(head);
  if (m1) return m1[1];
  const m2 = /^选修\s*([Ee]\d{2})$/.exec(head);
  return m2 ? m2[1].toUpperCase() : null;
}

/**
 * 「中文名（缩写）」里括号**之前**的中文名（V1.20.6）。
 * 规则保守，只取紧贴括号的尾部连续中文串（2~10 字）并剥掉常见前导虚词／状语，
 * 拿不准就返回空串 —— 宁可空着交给 Copilot，也不给错线索。
 *
 * ⚠️ 刻意**只剥虚词与状语**（另行 / 单独 / 应当 / 的 …），不剥实义动词：
 * 「登记机构」「报告主体」「披露义务」这类真实中文名以动词性字眼开头，
 * 剥了反而更错。残留前缀（如「提交可疑活动报告」）属可接受噪声 ——
 * 补全包里已显式标注「自动提取，需校验」。
 */
const ZH_LEAD_NOISE =
  /^(?:另行|单独|一并|同时|还需|仍然|应当|必须|应|需|须|则可|则不|则|并|还|该|本|其|此|是|即|指|称|称为|叫做|简称|如|的|在|由|向|对|和|与|或|包括|例如)+/;
function zhNameBefore(matchText) {
  const before = matchText.split(/[（(]/)[0];
  const tail = /([\u4e00-\u9fa5]{2,10})$/.exec(before);
  if (!tail) return "";
  const cleaned = tail[1].replace(ZH_LEAD_NOISE, "");
  return cleaned.length >= 2 ? cleaned : "";
}

const CONF_RANK = { declared: 0, acronym: 1, phrase: 2 };

/* ================================================================
 * 5. 扫描
 * ================================================================ */
function scan() {
  const corpus = buildCorpus();
  const registered = registeredKeys();
  const map = new Map();

  for (const doc of corpus) {
    for (const chunk of unrecognizedChunks(doc.text)) {
      const collect = (rx, confidence, group, extract) => {
        rx.lastIndex = 0;
        let m;
        while ((m = rx.exec(chunk)) !== null) {
          // 声明的捕获组在括号内（group=1），自由抽取取整个匹配（group=0）
          const raw = (m[group] ?? m[0]).trim();
          if (!raw || !/[A-Za-z]/.test(raw)) continue;
          const key = raw.toLowerCase();
          if (key.length < 2) continue;
          if (!confidence.startsWith("declared") && key.length < 3) continue;
          if (STOPWORDS.has(key) || GEO_CCY.has(key) || PROJECT_NOISE.has(key)) continue;
          if (registered.has(key)) continue;
          if (isPlaceholder(raw)) continue;
          if (looksLikeEntityName(raw)) continue;
          // 中文语境：窗口要覆盖整段匹配，保证「中文名（缩写）」也被判为中文语境
          if (!inChineseContext(chunk, m.index, m[0].length)) continue;

          let e = map.get(key);
          if (!e) {
            e = {
              key,
              text: raw,
              confidence,
              docs: new Set(),
              courses: new Set(),
              courseIds: new Set(),
              cases: new Set(),
              count: 0,
              samples: [],
              zh: "",
              fullName: "",
            };
            map.set(key, e);
          }
          if (CONF_RANK[confidence] < CONF_RANK[e.confidence]) e.confidence = confidence;
          // 正文自带的声明值（V1.20.6）：首个非空者为准，后续不覆盖，避免被后文噪声改写
          if (extract) {
            const extra = extract(m);
            if (extra?.zh && !e.zh) e.zh = extra.zh;
            if (extra?.fullName && !e.fullName) e.fullName = extra.fullName;
          }
          e.count += 1;
          e.docs.add(doc.label);
          if (doc.kind === "course") {
            e.courses.add(doc.label.split(" · ")[0]);
            const refId = refIdOf(doc);
            if (refId) e.courseIds.add(refId);
          } else {
            e.cases.add(doc.label.split(" · ")[0]);
          }
          if (e.samples.length < 3) {
            e.samples.push({
              kind: doc.kind,
              label: doc.label,
              href: doc.href,
              context: snippetOf(chunk, m.index, m[0].length),
            });
          }
        }
      };
      // 声明档顺带取回正文自带的中文名（group 1 是缩写，中文名在括号前）
      collect(RX_DECLARED_ZH, "declared", 1, (m) => ({ zh: zhNameBefore(m[0]) }));
      // 声明档顺带取回英文全称（group 2 = `SAR（Suspicious Activity Report）` 里的全称）
      collect(RX_DECLARED_FULL, "declared", 1, (m) => ({ fullName: (m[2] ?? "").trim() }));
      collect(RX_ACRONYM, "acronym", 0);
      collect(RX_PHRASE, "phrase", 0);
    }
  }

  const list = [...map.values()].map((v) => ({
    key: v.key,
    text: v.text,
    confidence: v.confidence,
    acronym: v.confidence !== "phrase" && /^[A-Z]/.test(v.text),
    docs: v.docs.size,
    courses: [...v.courses].sort(),
    cases: [...v.cases].sort(),
    count: v.count,
    samples: v.samples,
    // 正文自带声明值（V1.20.6）：有则填真值，无则空串
    zh: v.zh,
    fullName: v.fullName,
    // 课程 id（"02" / "E04"）：与术语数据 courses 字段同口径，供补全包直接使用
    courseIds: [...v.courseIds].sort(),
  }));

  list.sort((a, b) => {
    const ca = CONF_RANK[a.confidence];
    const cb = CONF_RANK[b.confidence];
    if (ca !== cb) return ca - cb;
    if (b.docs !== a.docs) return b.docs - a.docs;
    if (b.count !== a.count) return b.count - a.count;
    return a.text.localeCompare(b.text);
  });

  return { corpus, list };
}

/* ================================================================
 * 6. 与既有候选池合并（保留 firstSeenAt）
 * ================================================================ */
function readExisting() {
  if (!fs.existsSync(OUT_JSON)) return { version: 1, candidates: [] };
  try {
    const parsed = JSON.parse(fs.readFileSync(OUT_JSON, "utf8"));
    return {
      version: parsed.version ?? 1,
      generatedAt: typeof parsed.generatedAt === "string" ? parsed.generatedAt : "",
      candidates: Array.isArray(parsed.candidates) ? parsed.candidates : [],
    };
  } catch {
    console.warn("[scan:terms] 既有 candidates.json 解析失败，按空池重建");
    return { version: 1, generatedAt: "", candidates: [] };
  }
}

/**
 * 候选「稳定签名」：只取内容性字段，排除 firstSeenAt / lastSeenAt。
 * 签名未变 → 复用旧时间戳，使 candidates.json 在无内容变更时**逐字节稳定**
 * （否则每次构建都会刷新时间戳、污染 git 工作区）。
 */
function signatureOf(c) {
  return JSON.stringify([
    c.text,
    c.confidence,
    c.docs,
    c.count,
    c.courses,
    c.cases,
    c.zh ?? "",
    c.fullName ?? "",
    c.courseIds ?? [],
    c.samples.map((s) => [s.label, s.context]),
  ]);
}

let payload;
let stats;

try {
  const now = new Date().toISOString();
  const existing = readExisting();
  const prevByKey = new Map(existing.candidates.map((c) => [c.key, c]));
  const { corpus, list } = scan();

  let fresh = 0;
  let changed = 0;

  const candidates = list.slice(0, LIMIT).map((c) => {
    const prev = prevByKey.get(c.key);
    if (!prev) {
      fresh += 1;
      return { ...c, firstSeenAt: now, lastSeenAt: now };
    }
    const same = signatureOf(prev) === signatureOf(c);
    if (!same) {
      changed += 1;
      return { ...c, firstSeenAt: prev.firstSeenAt, lastSeenAt: now };
    }
    return { ...c, firstSeenAt: prev.firstSeenAt, lastSeenAt: prev.lastSeenAt };
  });

  // 池内条目增减也视为变更（决定 generatedAt 是否刷新）
  const setChanged =
    fresh > 0 ||
    changed > 0 ||
    existing.candidates.length !== candidates.length ||
    existing.candidates.some((c, i) => c.key !== candidates[i]?.key);

  payload = {
    version: 1,
    generatedAt: setChanged ? now : existing.generatedAt || now,
    baseline: {
      glossaryTerms: GLOSSARY_TERMS.length,
      documents: corpus.length,
      courses: corpus.filter((d) => d.kind === "course").length,
      cases: corpus.filter((d) => d.kind === "case").length,
    },
    candidates,
  };
  stats = { fresh, changed, setChanged };
} catch (err) {
  // 非阻断：保留旧候选池，不拦构建
  console.warn(`[scan:terms] 扫描失败，保留既有 candidates.json：${err.message}`);
  process.exit(0);
}

const before = fs.existsSync(OUT_JSON) ? fs.readFileSync(OUT_JSON, "utf8") : "";
const after = `${JSON.stringify(payload, null, 2)}\n`;
const touched = before !== after;
if (touched) fs.writeFileSync(OUT_JSON, after, "utf8");

const byConf = (k) => payload.candidates.filter((c) => c.confidence === k).length;
const withZh = payload.candidates.filter((c) => c.zh).length;
const withFull = payload.candidates.filter((c) => c.fullName).length;
console.log(
  `[scan:terms] 语料 ${payload.baseline.documents} 篇（课程 ${payload.baseline.courses} / 案例 ${payload.baseline.cases}）` +
    ` · 已有术语 ${GLOSSARY_TERMS.length} 条 · 候选 ${payload.candidates.length} 个` +
    `（声明 ${byConf("declared")} / 缩写 ${byConf("acronym")} / 词组 ${byConf("phrase")}）` +
    ` · 正文自带中文名 ${withZh} / 英文全称 ${withFull}` +
    ` · 新增 ${stats.fresh} / 更新 ${stats.changed}` +
    ` → content/glossary/candidates.json${touched ? "" : "（无变化，未改动文件）"}`
);
