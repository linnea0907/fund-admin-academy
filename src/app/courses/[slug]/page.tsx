import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLessonBySlug } from "@/data/lessons";
import { orderedIndex, orderedLessons } from "@/lib/ordering";
import LessonViewer from "@/components/LessonViewer";
import { DesktopToc, MobileToc } from "@/components/LessonToc";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return orderedLessons.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) return { title: "课程不存在" };
  return {
    title: `第 ${lesson.id} 讲 · ${lesson.title}`,
    description: lesson.subtitle,
  };
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug } = await params;
  const lesson = getLessonBySlug(slug);
  if (!lesson) notFound();

  const idx = orderedIndex(lesson.id);
  const prev = idx > 0 ? orderedLessons[idx - 1] : null;
  const next = idx < orderedLessons.length - 1 ? orderedLessons[idx + 1] : null;

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
