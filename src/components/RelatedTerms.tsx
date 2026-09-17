import Link from "next/link";
import { TERM_LEVELS } from "@/types/glossary";
import type { RelatedTermRef } from "@/lib/glossary";

/**
 * 关联术语（V1.18.0 新增 · V1.19.0 改为默认收起）——
 * 「课程 → 术语」「案例 → 术语」共用的反向导航区块。
 *
 * 数据由服务端反向索引给出：`getLessonTerms()` / `getCaseTerms()`，
 * 二者同源（反转术语库关联关系：自动命中 ∪ 人工指定 courses / cases），
 * 课程与案例数据里都不维护第二套字段。
 * 分组 Core → Advanced → Expert；组内顺序由数据层排好，这里只做切分。
 * 无关联术语时整块不渲染（「只显示实际关联术语」）。
 *
 * ★ V1.19.0：改为**默认收起的折叠面板**。
 *   原因（验收反馈）：读者进课程后直接开始读正文，很少停下来看这块；
 *   而 02 讲一次展示 20 个术语，信息密度过高反而被忽略。
 *   术语库的定位应是「随取随用的辅助工具」，不是正文前的视觉障碍。
 *
 * 实现刻意用**原生 `<details>/<summary>`**，不引入 React 状态：
 *   ① 零 JS、无 hydration 风险（本项目对 SSG/客户端首帧不一致极其敏感）；
 *   ② 默认收起 = 不写 `open` 属性；③ 键盘与读屏器自带无障碍语义。
 * 因此本组件保持「无状态 / 不引 server-only 模块」，client 与 server 两侧均可渲染。
 */
export default function RelatedTerms({
  title,
  hint,
  icon = "📚",
  terms,
}: {
  /** 区块标题，如「本课关联术语」/「本案例关联术语」 */
  title: string;
  /** 展开后的一行说明（讲清数据来源，避免被误认为手工维护） */
  hint: string;
  /** 标题图标（默认 📚） */
  icon?: string;
  terms: RelatedTermRef[];
}) {
  if (terms.length === 0) return null;

  const groups = TERM_LEVELS.map((level) => ({
    level,
    items: terms.filter((t) => t.level === level.id),
  })).filter((g) => g.items.length > 0);

  // 收起态也要能一眼看出「值不值得展开」：带上一句等级分布
  const levelSummary = groups.map((g) => `${g.level.label} ${g.items.length}`).join(" · ");

  return (
    <details className="group mt-6 rounded-xl border border-slate-200 bg-white">
      <summary
        className="flex cursor-pointer list-none items-center gap-2.5 rounded-xl px-4 py-3 transition hover:bg-slate-50/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e2a5e]/25 [&::-webkit-details-marker]:hidden"
        aria-label={`${title}，共 ${terms.length} 个，点击展开`}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#0e2a5e] text-xs text-white">
          {icon}
        </span>
        <span className="text-sm font-bold text-slate-700">{title}</span>
        <span className="rounded bg-[#0e2a5e]/5 px-1.5 py-0.5 text-[10px] font-semibold text-[#0e2a5e]">
          {terms.length}
        </span>
        <span className="hidden truncate text-[11px] text-slate-400 sm:inline">{levelSummary}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1 text-xs font-medium text-slate-500">
          <span className="group-open:hidden">展开</span>
          <span className="hidden group-open:inline">收起</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
            className="transition-transform group-open:rotate-180"
          >
            <path
              d="M3 4.5 6 7.5l3-3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>

      <div className="border-t border-slate-100 px-4 pb-4 pt-3">
        <p className="text-xs text-slate-400">{hint}</p>

        <div className="mt-3.5 space-y-4">
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
      </div>
    </details>
  );
}
