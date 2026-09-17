import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonBySlug, allLessons } from "@/data/lessons";
import { lessonNeighbors } from "@/lib/ordering";
import { displayLabel } from "@/lib/lesson-number";
import { getLessonTerms } from "@/lib/glossary-usage";
import LessonViewer from "@/components/LessonViewer";
import LessonReader from "@/components/LessonReader";
import { MobileToc } from "@/components/LessonToc";

type Params = Promise<{ slug: string }>;

function allLessonSlugs() {
  return allLessons.map((l) => ({ slug: l.slug }));
}

export function generateStaticParams() {
  return allLessonSlugs();
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = findLessonBySlug(slug);
  if (!lesson) return { title: "课程不存在" };
  return {
    title: `${displayLabel(lesson)} · ${lesson.title}`,
    description: lesson.subtitle,
  };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lesson = findLessonBySlug(slug);
  if (!lesson) notFound();

  const { prev, next } = lessonNeighbors(lesson);
  // V1.18.0：课程 → 术语 反向索引（术语库自动命中 ∪ 人工指定 courses，构建期烘焙）
  const terms = getLessonTerms(lesson.id);

  return (
    <div>
      {/* 移动端目录 chips */}
      <MobileToc lesson={lesson} />
      {/* 桌面：左侧 sticky 目录（可折叠）+ 正文 */}
      <LessonReader lesson={lesson}>
        <LessonViewer lesson={lesson} prev={prev} next={next} terms={terms} />
      </LessonReader>
    </div>
  );
}
