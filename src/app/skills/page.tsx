import type { Metadata } from "next";
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
  return <SkillsBoard cases={cases} />;
}
