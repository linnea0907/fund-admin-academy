import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonBySlug, allLessons, lessonLabel } from "@/data/lessons";
import { lessonNeighbors } from "@/lib/ordering";
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
    title: `${lessonLabel(lesson)} · ${lesson.title}`,
    description: lesson.subtitle,
  };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lesson = findLessonBySlug(slug);
  if (!lesson) notFound();

  const { prev, next } = lessonNeighbors(lesson);

  return (
    <div>
      {/* 移动端目录 chips */}
      <MobileToc lesson={lesson} />
      {/* 桌面：左侧 sticky 目录（可折叠）+ 正文 */}
      <LessonReader lesson={lesson}>
        <LessonViewer lesson={lesson} prev={prev} next={next} />
      </LessonReader>
    </div>
  );
}
