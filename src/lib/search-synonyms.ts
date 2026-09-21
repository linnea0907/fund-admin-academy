/**
 * 搜索同义词层（V1.20.8，P2）
 *
 * 解决的问题：「Fund Manager」在实务里是**泛称**——可能指投资管理人、普通合伙人、
 * 管理公司或发起人，但术语库里没有这个词条，直接搜索命中 0，用户得不到任何指引。
 *
 * ★ 为什么不用 aliases：
 *   alias 会经 `termMatchTexts()` 变成**可标注文本**，而「fund manager(s)」在
 *   课程正文里高频出现且指代不唯一，一旦入 alias 就会把正文点满（过度标注）。
 *   因此本层**只作用于检索推荐**：不参与正文标注、不进 `related` 图谱、
 *   不写 aliases。
 *
 * 设计纪律：
 *   - 触发词只做**整串匹配**（见 `normalizeQuery`）：搜「fund manager letter」
 *     不会误触发；
 *   - 目标术语 id 渲染前经 `existingIds` 过滤——词条不存在就不渲染，
 *     绝不产生指向 404 的链接；
 *   - 不做自动跳转、不改变搜索结果集本身，只加一块「你可能想找」。
 */

export interface SynonymRedirect {
  /** 触发词（小写整串匹配；含常见复数与中文说法） */
  triggers: string[];
  /** 推荐术语 id。⚠️ 必须真实存在于术语库，否则不会渲染 */
  targets: string[];
  /** 推荐块的说明文案 */
  note: string;
}

/**
 * ⚠️ 覆盖度说明（V1.20.8 实测）：
 *   概念上「Fund Manager」可指向 4 个角色 —— Investment Manager / General Partner /
 *   Management Company / Sponsor。但后两者**术语库当前没有词条**，无法作为推荐落点
 *   （渲染不存在 id 会产生死链）。故本轮只登记已具备词条的两项；
 *   `management-company` 与 `sponsor` 的缺口已记入 `docs/BACKLOG.md`。
 *   待其入库后，在下方 `targets` 里追加相应 id 即可，**无需改动渲染层**。
 */
export const SEARCH_SYNONYM_REDIRECTS: SynonymRedirect[] = [
  {
    triggers: ["fund manager", "fund managers", "基金经理", "基金管理人"],
    targets: ["investment-manager", "gp"],
    note: "「Fund Manager」是泛称，实务中通常对应下列受控角色之一：",
  },
];

/** 归一化：去首尾空白 / 全角空格 / 大小写 / 末尾标点与所有格 */
function normalizeQuery(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[\s\u3000]+/g, " ")
    .replace(/[’']s$/, "")
    .replace(/[?？!.。；;：:，,、]+$/, "");
}

export interface SynonymMatch {
  /** 命中的触发词（原样，用于文案） */
  trigger: string;
  /** 已在术语库中命中的推荐术语 id（保证非空，且全部真实存在） */
  targetIds: string[];
  note: string;
}

/**
 * 命中同义词推荐。
 * @param query       用户输入
 * @param existingIds 术语库现存 id 集合（用于过滤死链）
 * @returns 命中且**至少有一个可用落点**时返回，否则 null
 */
export function matchSynonymRedirect(
  query: string,
  existingIds: ReadonlySet<string>,
): SynonymMatch | null {
  const q = normalizeQuery(query);
  if (!q) return null;
  for (const r of SEARCH_SYNONYM_REDIRECTS) {
    if (!r.triggers.some((t) => normalizeQuery(t) === q)) continue;
    const targetIds = r.targets.filter((id) => existingIds.has(id));
    if (!targetIds.length) return null;
    return { trigger: r.triggers[0], targetIds, note: r.note };
  }
  return null;
}
