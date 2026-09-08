import { Suspense } from "react";
import type { Metadata } from "next";
import { listCaseMetas } from "@/lib/cases";
import CaseLibrary from "@/components/cases/CaseLibrary";

export const metadata: Metadata = {
  title: "案例库",
  description:
    "Real Fund Admin Cases：Fund Admin 实务案例库，答案以 ICS 内部 SOP 为准；三级筛选（业务模块 → 技能 → 标签/难度/状态）（Case Library v1.8）",
};

/** SSG：目录数据来自 content/cases/index.json（gen:cases 产物）；
 *  导入/修改案例内容后执行 npm run gen:cases && npm run build 重新生成静态页 */
export default function CasesPage() {
  const cases = listCaseMetas();
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">加载案例库…</div>}>
      <CaseLibrary cases={cases} />
    </Suspense>
  );
}
