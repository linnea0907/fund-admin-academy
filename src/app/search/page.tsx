import type { Metadata } from "next";
import { orderedAllLessons } from "@/lib/ordering";
import { caseSlug, listCaseMetas } from "@/lib/cases";
import { getCaseModule } from "@/lib/case-modules";
import { GLOSSARY_TERMS, getGlossaryCategory } from "@/lib/glossary";
import SearchClient, {
  type SearchCase,
  type SearchLesson,
  type SearchTerm,
} from "@/components/search/SearchClient";

export const metadata: Metadata = {
  title: "搜索",
  description:
    "一次搜索同时命中术语库（/glossary）、课程与模块、案例库（/cases）：术语定义全站共用单一数据源。",
};

export default function SearchPage() {
  // 课程（服务端装配，客户端零搜索开销）
  const lessons: SearchLesson[] = orderedAllLessons.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    subtitle: l.subtitle,
    modules: l.modules.map((m) => ({ id: m.id, title: m.title })),
  }));

  // 案例（标题 / 模块 / 标签 / 技能）
  const cases: SearchCase[] = listCaseMetas().map((c) => ({
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

  return <SearchClient data={{ lessons, cases, terms }} />;
}
