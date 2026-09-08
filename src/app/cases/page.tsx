import type { Metadata } from "next";
import { listCaseMetas } from "@/lib/cases";
import CaseLibrary from "@/components/cases/CaseLibrary";

export const metadata: Metadata = {
  title: "案例库",
  description: "Fund Admin 实务案例库：让新人学会真实工作中的判断，答案以 ICS 内部 SOP 为准（Case Library V2）",
};

export const dynamic = "force-static";

export default function CasesPage() {
  const cases = listCaseMetas();
  return <CaseLibrary cases={cases} />;
}
