import type { Metadata } from "next";
import Link from "next/link";
import { listCaseMetas } from "@/lib/cases";
import SkillsBoard from "@/components/skills/SkillsBoard";

export const metadata: Metadata = {
  title: "技能中心",
  description:
    "Fund Admin Academy 技能中心：能力地图 — 20 项受控技能（Skills）的说明、案例覆盖与完成进度（P1.8）",
};

/** SSG：技能聚合基于案例元数据（index.json），构建时一次生成 */
export default function SkillsPage() {
  const cases = listCaseMetas();
  return (
    <div className="space-y-4">
      {/* V1.12.2：技能中心已并入「知识检索」，保留本站内面包屑 */}
      <nav
        aria-label="面包屑"
        className="flex items-center gap-1.5 text-xs text-slate-400"
      >
        <Link
          href="/search"
          className="rounded-md bg-white px-2 py-1 font-medium text-slate-500 ring-1 ring-slate-200 transition hover:text-[#0e2a5e] hover:ring-[#0e2a5e]/30"
        >
          知识检索
        </Link>
        <span aria-hidden>/</span>
        <span className="rounded-md bg-[#0e2a5e]/5 px-2 py-1 font-semibold text-[#0e2a5e]">
          技能中心
        </span>
      </nav>
      <SkillsBoard cases={cases} />
    </div>
  );
}
