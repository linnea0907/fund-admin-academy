import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findLessonBySlug, lessons, electiveLessons, lessonLabel } from "@/data/lessons";
import { lessonNeighbors } from "@/lib/ordering";
import LessonViewer from "@/components/LessonViewer";
import { DesktopToc, MobileToc } from "@/components/LessonToc";

type Params = Promise<{ slug: string }>;

function allLessonSlugs() {
  return [...lessons, ...electiveLessons].map((l) => ({ slug: l.slug }));
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
      <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* 桌面 sticky 目录 */}
        <DesktopToc lesson={lesson} />
        <LessonViewer lesson={lesson} prev={prev} next={next} />
      </div>
    </div>
  );
}
