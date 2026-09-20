/**
 * 案例「你的判断 / 标准答案」逐题切块（V1.20.4）
 *
 * 背景：案例正文里存在**两套题目书写格式**（均为 Copilot 提供的原稿，历史遗留）：
 *   A. 子标题式：`## Q1` 起一段（Module 3/4/5 及 Case-026 使用）
 *   B. 行内加粗式：`**Q1. 题干**`（「你的判断」）/ `**Q1 — 答案首句**`（「标准答案」）
 *      —— Module 1 的 Case-001 ~ Case-005 使用
 *
 * 本模块把两套格式统一切成 [{ q, question, answer }]，供「题干常显 + 答案默认折叠」渲染。
 *
 * ⚠️ 安全策略：任何不满足「题号数量相等 + 题号序列相同」的情况一律返回空数组，
 *    渲染层随即退回「整节原样渲染」——**绝不因为解析失败而丢内容**。
 *
 * ⚠️ 纯字符串处理，不依赖 node:fs，可安全用于服务端与客户端。
 */

export interface CaseAnswerItem {
  /** 展示用题号，如 "Q1" */
  q: string;
  /** 题干全文（含选项，如有）：纯文本，段落已压成单换行，便于在折叠条内紧凑展示 */
  question: string;
  /** 该题的标准答案正文（Markdown，原样保留） */
  answer: string;
}

/** `## Q1` 子标题式 */
const RE_HEADING_Q = /^##\s+Q(\d+)\s*$/;
/** `**Q1. …**` / `**Q1 — …**` 行内加粗式（分隔符后必须有内容） */
const RE_BOLD_Q = /^\*\*\s*Q(\d+)\s*[.．、:：—–-]\s*\S/;

interface Block {
  n: number;
  lines: string[];
}

/** 按 `## Qn` 子标题切块（非 Qn 的 `##` 行保留在块内） */
function splitByHeading(src: string): Block[] {
  const out: Block[] = [];
  let cur: Block | null = null;
  for (const line of src.split("\n")) {
    const m = RE_HEADING_Q.exec(line);
    if (m) {
      cur = { n: Number(m[1]), lines: [] };
      out.push(cur);
      continue;
    }
    if (cur) cur.lines.push(line);
  }
  return out;
}

/** 按 `**Qn …` 行内加粗标记切块（标记行本身作为块的起始行保留） */
function splitByBold(src: string): Block[] {
  const out: Block[] = [];
  let cur: Block | null = null;
  for (const line of src.split("\n")) {
    if (RE_BOLD_Q.test(line)) {
      const n = Number(/Q(\d+)/.exec(line)![1]);
      cur = { n, lines: [line] };
      out.push(cur);
      continue;
    }
    if (cur) cur.lines.push(line);
  }
  return out;
}

function splitBlocks(src: string): Block[] {
  const byHeading = splitByHeading(src);
  return byHeading.length > 0 ? byHeading : splitByBold(src);
}

/** 题干清洗：去题号标记与加粗，压掉段间空行（折叠条内紧凑展示） */
function cleanQuestion(lines: string[]): string {
  return lines
    .join("\n")
    .replace(/^\s*\*\*\s*Q\d+\s*[.．、:：—–-]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * 答案清洗：
 * - 子标题式：整块原样（`## Qn` 标题已剥离）
 * - 行内加粗式：把 `**Q1 — 不符合要求。**` 还原为 `**不符合要求。**`（保留加粗首句）
 */
function cleanAnswer(lines: string[]): string {
  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  const m = /^\*\*\s*Q\d+\s*[.．、:：—–-]\s*([\s\S]*)$/.exec(text);
  if (!m) return text;
  const rest = m[1].trim();
  return rest.endsWith("**") ? `**${rest}` : rest;
}

/**
 * 把「你的判断」与「标准答案」两个小节正文切成逐题条目。
 *
 * @param questionsContent `你的判断` 小节正文
 * @param answerContent    `标准答案` 小节正文
 * @returns 题号数量与序列均一致时返回条目数组；否则返回 `[]`（调用方应退回原样渲染）
 */
export function splitCaseAnswers(
  questionsContent: string,
  answerContent: string
): CaseAnswerItem[] {
  if (!questionsContent.trim() || !answerContent.trim()) return [];

  const qBlocks = splitBlocks(questionsContent);
  const aBlocks = splitBlocks(answerContent);
  if (qBlocks.length === 0 || qBlocks.length !== aBlocks.length) return [];

  const items: CaseAnswerItem[] = [];
  for (let i = 0; i < qBlocks.length; i += 1) {
    const q = qBlocks[i];
    const a = aBlocks[i];
    // 题号必须逐位对应（子标题式与加粗式可能混用，这里只认数字序列）
    if (q.n !== a.n) return [];

    const question = cleanQuestion(q.lines);
    const answer = cleanAnswer(a.lines);
    if (!question || !answer) return [];

    items.push({ q: `Q${q.n}`, question, answer });
  }
  return items;
}
