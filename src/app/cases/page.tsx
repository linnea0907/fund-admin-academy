import type { Metadata } from "next";
import { listCaseMetas } from "@/lib/cases";
import CaseLibrary from "@/components/cases/CaseLibrary";

export const metadata: Metadata = {
  title: "案例库",
  description: "境外私募基金运营情景案例库（Case Library V1）",
};

export const dynamic = "force-static";

export default function CasesPage() {
  const cases = listCaseMetas();
  return <CaseLibrary cases={cases} />;
}
