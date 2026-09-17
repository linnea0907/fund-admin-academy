import Link from "next/link";
import { TERM_LEVELS } from "@/types/glossary";
import type { RelatedTermRef } from "@/lib/glossary";

/**
 * 关联术语（V1.18.0）—— 「课程 → 术语」「案例 → 术语」共用的反向导航区块。
 *
 * 数据由服务端反向索引给出：`getLessonTerms()` / `getCaseTerms()`，
 * 二者同源（反转术语库关联关系：自动命中 ∪ 人工指定 courses / cases），
 * 课程与案例数据里都不维护第二套字段。
 * 分组 Core → Advanced → Expert；组内顺序由数据层排好，这里只做切分。
 * 无关联术语时整块不渲染（「只显示实际关联术语」）。
 *
 * 纯展示组件：无状态、不引 server-only 模块，client / server 边界内均可渲染，
 * 因此课程页（client 的 LessonViewer）与案例页（client 的 CaseViewer）都能直接复用。
 */
export default function RelatedTerms({
  title,
  hint,
  icon = "📚",
  terms,
}: {
  /** 区块标题，如「本课关联术语」/「本案例关联术语」 */
  title: string;
  /** 标题下的一行说明（讲清数据来源，避免被误认为手工维护） */
  hint: string;
  /** 标题图标（默认 🎓 书籍） */
  icon?: string;
  terms: RelatedTermRef[];
}) {
  if (terms.length === 0) return null;

  const groups = TERM_LEVELS.map((level) => ({
    level,
    items: terms.filter((t) => t.level === level.id),
  })).filter((g) => g.items.length > 0);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-800">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0e2a5e] text-xs text-white">
          {icon}
        </span>
        {title}
        <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
          {terms.length}
        </span>
      </h2>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>

      <div className="mt-4 space-y-4">
        {groups.map(({ level, items }) => (
          <div key={level.id}>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ring-1 ${level.tint}`}
              >
                {level.label}
                <span className="ml-1 font-normal opacity-70">{level.zh}</span>
              </span>
              <span className="text-[11px] text-slate-400">{items.length}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {items.map((t) => (
                <Link
                  key={t.id}
                  href={`/glossary/${t.id}`}
                  title={`${t.zh} · ${level.label}`}
                  className="max-w-full rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#0e2a5e] hover:bg-[#0e2a5e] hover:text-white"
                >
                  {t.term}
                  <span className="ml-1 font-normal opacity-70">{t.zh}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
