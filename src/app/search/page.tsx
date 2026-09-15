import type { Metadata } from "next";
import { orderedAllLessons } from "@/lib/ordering";
import { caseSlug, listCaseMetas, readCase } from "@/lib/cases";
import { getCaseModule } from "@/lib/case-modules";
import { GLOSSARY_TERMS, GLOSSARY_BUILTIN_COUNT } from "@/lib/glossary";
import { buildTermRelations } from "@/lib/glossary-usage";
import { SKILL_DEFS } from "@/lib/skill-defs";
import SearchClient, {
  type SearchCase,
  type SearchChecklist,
  type SearchLesson,
  type SearchSop,
  type SearchTemplate,
  type SearchTermRelations,
  type SearchToolkit,
} from "@/components/search/SearchClient";
import { AML_TOOLKIT } from "@/data/aml-toolkit";
import { getToolkitKind } from "@/types/aml-toolkit";

export const metadata: Metadata = {
  title: "知识检索",
  description:
    "Fund Admin Wiki 知识检索：Terms（术语）· AML 实务工具包（清单 / SOP / 对比）· Knowledge Notes（SOP 依据 / Checklist / 邮件模板）· Cases（案例）· Courses（课程）统一检索，一次搜索直达术语、工具、关联案例与关联课程。",
};

/** Fund Admin Wiki · 知识检索（统一结果页：Terms / Knowledge Notes / Cases / Courses） */
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

  // 案例（标题 / 模块 / 标签 / 技能 / V1.13.1 分类字段）
  const cases: SearchCase[] = caseMetas.map((c) => ({
    id: c.id,
    slug: caseSlug(c.id),
    title: c.title,
    module: getCaseModule(c.module)?.zh ?? `Module ${c.module}`,
    tags: c.tags,
    skills: c.skills,
    ready: c.ready,
    jurisdiction: c.jurisdiction,
    businessArea: c.businessArea,
    entityType: c.entityType,
    topics: c.topics,
  }));

  // 术语（单一数据源，含导入层）→ 客户端可直接复用同一评分函数
  const terms = GLOSSARY_TERMS;

  // 术语 → 关联课程 / 关联案例（自动扫描 ∪ 人工指定）
  const relations = buildTermRelations();
  const termRelations: Record<string, SearchTermRelations> = {};
  for (const t of GLOSSARY_TERMS) {
    const r = relations[t.id];
    if (!r) continue;
    termRelations[t.id] = {
      courses: r.lessons.map((l) => ({ id: l.id, slug: l.slug, title: l.title })),
      cases: r.cases.map((c) => ({ id: c.id, slug: c.slug, title: c.title })),
    };
  }

  // SOP / 邮件模板 索引：已导入案例的「ICS SOP 依据」与「客户沟通示例」小节
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

  // Checklist 索引：课程 Admin Checklist 操作清单条目
  const checklists: SearchChecklist[] = orderedAllLessons.flatMap((l) =>
    (l.checklist ?? []).map((text) => ({
      lessonId: l.id,
      lessonSlug: l.slug,
      lessonTitle: l.title,
      text,
    }))
  );

  // AML 实务工具包（V1.15.0 一级分类）：全文展平进检索文本
  const toolkits: SearchToolkit[] = AML_TOOLKIT.map((t) => {
    const parts: string[] = [t.title, t.zh, t.summary, t.purpose];
    for (const s of t.sections ?? []) parts.push(s.zh, s.title, ...s.items);
    for (const s of t.steps ?? []) parts.push(s.zh, s.title, s.detail, s.note ?? "");
    for (const o of t.outcomes ?? []) parts.push(o.zh, o.title, o.detail);
    if (t.comparison) {
      parts.push(...t.comparison.columns);
      for (const r of t.comparison.rows) parts.push(r.label, ...r.cells);
      parts.push(...(t.comparison.reminders ?? []));
    }
    parts.push(...(t.pitfalls ?? []), ...t.tags, ...(t.relatedTerms ?? []));
    return {
      id: t.id,
      kind: t.kind,
      kindLabel: getToolkitKind(t.kind).label,
      title: t.title,
      zh: t.zh,
      summary: t.summary,
      text: parts.filter(Boolean).join("\n"),
    };
  });

  return (
    <SearchClient
      data={{
        lessons,
        cases,
        terms,
        termRelations,
        sops,
        templates,
        checklists,
        toolkits,
        counts: {
          terms: GLOSSARY_TERMS.length,
          termsBuiltin: GLOSSARY_BUILTIN_COUNT,
          termsUsed: Object.values(termRelations).filter(
            (r) => r.courses.length > 0 || r.cases.length > 0
          ).length,
          skills: SKILL_DEFS.length,
          lessonsRequired: lessons.filter((l) => !l.id.startsWith("E")).length,
          lessonsTotal: lessons.length,
          cases: caseMetas.length,
          casesReady: caseMetas.filter((c) => c.ready).length,
          sops: sops.length,
          templates: templates.length,
          checklists: checklists.length,
          toolkits: toolkits.length,
        },
      }}
    />
  );
}
