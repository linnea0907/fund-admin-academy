import type { CamsDomain, CamsQuestion } from "@/types/cams";
import { CAMS_DOMAINS, CAMS_EXAM } from "@/types/cams";
import { questionsA } from "./questions-a";
import { questionsB } from "./questions-b";
import { questionsC } from "./questions-c";
import { questionsD } from "./questions-d";

/**
 * CAMS 题库聚合层。
 *
 * 按官方蓝图 Domain A→B→C→D 顺序拼装，总题数 = CAMS_EXAM.questionCount（120）。
 * 各域题量须与 CAMS_DOMAINS 的 questionCount 严格一致（36/24/36/24）。
 */

const BY_DOMAIN: Record<CamsDomain, CamsQuestion[]> = {
  A: questionsA,
  B: questionsB,
  C: questionsC,
  D: questionsD,
};

/** 按官方顺序（A→B→C→D）拼装的全量题库 */
export const camsQuestions: CamsQuestion[] = CAMS_DOMAINS.flatMap(
  (d) => BY_DOMAIN[d.id]
);

/** 某域的题量（校验用） */
export function camsCountByDomain(d: CamsDomain): number {
  return BY_DOMAIN[d].length;
}

/** 按域取题（错题回顾 / 分域统计用） */
export function camsQuestionsByDomain(d: CamsDomain): CamsQuestion[] {
  return BY_DOMAIN[d];
}

/** 题库自检：返回错误列表（空 = 通过）。构建期与运行时均可调用。 */
export function camsQuestionBankErrors(): string[] {
  const errs: string[] = [];
  const seen = new Set<string>();

  if (camsQuestions.length !== CAMS_EXAM.questionCount) {
    errs.push(
      `总题数 ${camsQuestions.length} ≠ 官方 ${CAMS_EXAM.questionCount}`
    );
  }

  for (const d of CAMS_DOMAINS) {
    const n = camsCountByDomain(d.id);
    if (n !== d.questionCount) {
      errs.push(`Domain ${d.id} 题数 ${n} ≠ 蓝图 ${d.questionCount}`);
    }
  }

  for (const q of camsQuestions) {
    if (seen.has(q.id)) {
      errs.push(`重复题号 ${q.id}`);
    }
    seen.add(q.id);
    if (q.options.length !== 4) {
      errs.push(`${q.id} 选项数 ${q.options.length} ≠ 4`);
    }
    if (q.answer < 0 || q.answer >= q.options.length) {
      errs.push(`${q.id} 答案下标 ${q.answer} 越界`);
    }
    if (!q.question.trim() || !q.explanation.trim()) {
      errs.push(`${q.id} 题干或解析为空`);
    }
  }

  return errs;
}
