import { inflateRawSync } from "node:zlib";

/**
 * Fund Admin Wiki — Excel（.xlsx）解析（V1.14.0）
 *
 * 无第三方依赖：直接读取 xlsx 的 ZIP 结构（中央目录 → 本地头 → inflateRaw），
 * 解析 xl/sharedStrings.xml + xl/worksheets/sheet*.xml，输出与 CSV 等价的行文本，
 * 交由客户端走同一条「表头映射 → 校验 → 预览」链路。
 *
 * 仅支持 .xlsx（Office 2007+；.xls 二进制格式请另存为 .xlsx 或 .csv）。
 */

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB

interface ZipEntry {
  name: string;
  method: number;
  compressedSize: number;
  localOffset: number;
}

function readZipEntries(buf: Buffer): ZipEntry[] {
  // 定位 EOCD（0x06054b50），从尾部回溯
  let eocd = -1;
  const start = Math.max(0, buf.length - 66000);
  for (let i = buf.length - 22; i >= start; i -= 1) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("不是有效的 xlsx（未找到 ZIP 结构）");
  const cdCount = buf.readUInt16LE(eocd + 10);
  const cdOffset = buf.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];
  let p = cdOffset;
  for (let i = 0; i < cdCount; i += 1) {
    if (p + 46 > buf.length || buf.readUInt32LE(p) !== 0x02014b50) break;
    const method = buf.readUInt16LE(p + 10);
    const compressedSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    entries.push({ name, method, compressedSize, localOffset });
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

function readEntry(buf: Buffer, e: ZipEntry): string {
  const p = e.localOffset;
  if (buf.readUInt32LE(p) !== 0x04034b50) throw new Error(`ZIP 本地头损坏：${e.name}`);
  const nameLen = buf.readUInt16LE(p + 26);
  const extraLen = buf.readUInt16LE(p + 28);
  const dataStart = p + 30 + nameLen + extraLen;
  const data = buf.subarray(dataStart, dataStart + e.compressedSize);
  const raw = e.method === 0 ? data : inflateRawSync(data);
  return raw.toString("utf8");
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}

/** 解析 sharedStrings.xml → 字符串数组 */
function parseSharedStrings(xml: string | null): string[] {
  if (!xml) return [];
  const out: string[] = [];
  for (const si of xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g)) {
    const inner = si[1];
    let text = "";
    for (const t of inner.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) text += decodeXml(t[1]);
    out.push(text);
  }
  return out;
}

/** 列字母 → 0 基下标（A=0, B=1, AA=26…） */
function colIndex(ref: string): number {
  const m = /^([A-Z]+)/.exec(ref.toUpperCase());
  if (!m) return 0;
  let n = 0;
  for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/** 解析工作表 → 二维字符串 */
function parseSheet(xml: string, shared: string[]): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of xml.matchAll(/<row\b[^>]*>([\s\S]*?)<\/row>|<row\b[^>]*\/>/g)) {
    const inner = rowMatch[1] ?? "";
    const cells: string[] = [];
    for (const cellMatch of inner.matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = cellMatch[1] ?? "";
      const body = cellMatch[2] ?? "";
      const ref = /\br="([A-Za-z]+\d+)"/.exec(attrs)?.[1] ?? "";
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1] ?? "";
      const idx = ref ? colIndex(ref) : cells.length;

      let value = "";
      if (type === "inlineStr") {
        for (const t of body.matchAll(/<t\b[^>]*>([\s\S]*?)<\/t>/g)) value += decodeXml(t[1]);
      } else {
        const v = /<v\b[^>]*>([\s\S]*?)<\/v>/.exec(body)?.[1] ?? "";
        if (type === "s") {
          const n = Number(v);
          value = Number.isInteger(n) ? shared[n] ?? "" : "";
        } else {
          value = decodeXml(v);
        }
      }
      while (cells.length < idx) cells.push("");
      cells[idx] = value;
    }
    rows.push(cells);
  }
  return rows;
}

function toCsv(rows: string[][]): string {
  const esc = (s: string) => (/[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  return rows.map((r) => r.map((c) => esc(c ?? "")).join(",")).join("\n");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ ok: false, error: "未收到文件" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ ok: false, error: "文件超过 8MB 上限" }, { status: 413 });
    }
    const buf = Buffer.from(await file.arrayBuffer());
    // 校验 ZIP 魔数
    if (buf.length < 4 || buf.readUInt16LE(0) !== 0x504b) {
      return Response.json(
        { ok: false, error: "不是 .xlsx 文件（.xls 旧格式请另存为 .xlsx 或 .csv）" },
        { status: 400 }
      );
    }

    const entries = readZipEntries(buf);
    const find = (re: RegExp) => entries.find((e) => re.test(e.name));

    const sharedEntry = find(/^xl\/sharedStrings\.xml$/i);
    const shared = sharedEntry ? parseSharedStrings(readEntry(buf, sharedEntry)) : [];

    const sheetEntries = entries
      .filter((e) => /^xl\/worksheets\/sheet\d+\.xml$/i.test(e.name))
      .sort((a, b) => {
        const na = Number(/sheet(\d+)/i.exec(a.name)?.[1] ?? 0);
        const nb = Number(/sheet(\d+)/i.exec(b.name)?.[1] ?? 0);
        return na - nb;
      });
    if (sheetEntries.length === 0) {
      return Response.json({ ok: false, error: "未找到工作表（xlsx 结构异常）" }, { status: 400 });
    }

    const rows = parseSheet(readEntry(buf, sheetEntries[0]), shared);
    // 去掉尾部完全空行
    while (rows.length > 0 && rows[rows.length - 1].every((c) => !c || c.trim() === "")) rows.pop();

    return Response.json({
      ok: true,
      sheet: sheetEntries[0].name.replace(/^xl\/worksheets\//, "").replace(/\.xml$/, ""),
      sheetCount: sheetEntries.length,
      rowCount: rows.length,
      text: toCsv(rows),
    });
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : "解析失败" },
      { status: 500 }
    );
  }
}
