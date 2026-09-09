import type { Metadata } from "next";
import { orderedAllLessons } from "@/lib/ordering";
import { caseSlug, listCaseMetas, readCase } from "@/lib/cases";
import { getCaseModule } from "@/lib/case-modules";
import { GLOSSARY_TERMS, getGlossaryCategory } from "@/lib/glossary";
import { SKILL_DEFS } from "@/lib/skill-defs";
import SearchClient, {
  type SearchCase,
  type SearchChecklist,
  type SearchLesson,
  type SearchSop,
  type SearchTemplate,
  type SearchTerm,
} from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "知识检索",
  description:
    "知识检索（原术语库 / 技能中心 / 搜索合并）：术语 / SOP 依据 / Checklist / 邮件模板 + 全站课程与案例统一检索，原数据与页面全部保留。",
};

export default function SearchPage() {
  const caseMetas = listCaseMetas();

  // 课程（服务端装配，客户端零搜索开销）
  const lessons: SearchLesson[] = orderedAllLessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    subtitle: l.subtitle,
    modules: l.modules.map((m) => ({ id: m.id, title: m.title })),
  }));

  // 案例（标题 / 模块 / 标签 / 技能）
  const cases: SearchCase[] = caseMetas.map((c) => ({
    id: c.id,
    slug: caseSlug(c.id),
    title: c.title,
    module: getCaseModule(c.module)?.zh ?? `Module ${c.module}`,
    tags: c.tags,
    skills: c.skills,
    ready: c.ready,
  }));

  // 术语（单一数据源）
  const terms: SearchTerm[] = GLOSSARY_TERMS.map((t) => ({
    id: t.id,
    en: t.en,
    zh: t.zh,
    brief: t.brief,
    definition: t.definition,
    aliases: t.aliases ?? [],
    category: getGlossaryCategory(t.category).label,
  }));

  // V1.12.2 SOP / 邮件模板 索引：已导入案例的「ICS SOP 依据」与「客户沟通示例」小节
  const sops: SearchSop[] = [];
  const templates: SearchTemplate[] = [];
  for (const m of caseMetas) {
    if (!m.ready) continue;
    const full = readCase(m.id);
    if (!full) continue;
    const sop = (full.sections.sop_reference ?? "").trim();
    const email = (full.sections.client_email ?? "").trim();
    if (sop) sops.push({ caseId: m.id, slug: caseSlug(m.id), caseTitle: m.title, text: sop });
    if (email)
      templates.push({ caseId: m.id, slug: caseSlug(m.id), caseTitle: m.title, text: email });
  }

  // V1.12.2 Checklist 索引：课程 Admin Checklist 操作清单条目
  const checklists: SearchChecklist[] = orderedAllLessons.flatMap((l) =>
    (l.checklist ?? []).map((text) => ({
      lessonId: l.id,
      lessonSlug: l.slug,
      lessonTitle: l.title,
      text,
    }))
  );

  return (
    <SearchClient
      data={{
        lessons,
        cases,
        terms,
        sops,
        templates,
        checklists,
        counts: {
          terms: GLOSSARY_TERMS.length,
          skills: SKILL_DEFS.length,
          lessonsRequired: lessons.filter((l) => !l.id.startsWith("E")).length,
          lessonsTotal: lessons.length,
          cases: caseMetas.length,
          casesReady: caseMetas.filter((c) => c.ready).length,
        },
      }}
    />
  );
}
