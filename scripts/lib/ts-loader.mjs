/**
 * ts-loader.mjs — 让 Node 直接 import 项目 TS 源码（构建脚本专用）
 *
 * 动机：构建脚本需要「与站点完全同一份数据层」（课程 / 案例 / 术语引擎），
 * 若改用正则解析 TS 源码，口径会随源码结构漂移，且拿不到 label / href 上下文。
 *
 * 能力：
 *   - `@/x`      → <cwd>/src/x.ts(.tsx) | src/x/index.ts
 *   - `./x`（无扩展名）→ 同目录补 .ts / .tsx / index.ts
 *
 * 依赖：Node ≥ 22.18（默认启用 --experimental-strip-types，无需额外依赖）
 * 用法：register("./scripts/lib/ts-loader.mjs", pathToFileURL(<scripts/lib>/))
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const ROOT = process.cwd();

const candidatesOf = (base) => [
  `${base}.ts`,
  `${base}.tsx`,
  path.join(base, "index.ts"),
  path.join(base, "index.tsx"),
];

export async function resolve(specifier, context, nextResolve) {
  let bases = [];

  if (specifier.startsWith("@/")) {
    bases = candidatesOf(path.join(ROOT, "src", specifier.slice(2)));
  } else if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    bases = candidatesOf(path.resolve(parentDir, specifier));
  }

  for (const c of bases) {
    if (existsSync(c)) return { url: pathToFileURL(c).href, shortCircuit: true };
  }

  return nextResolve(specifier, context);
}
