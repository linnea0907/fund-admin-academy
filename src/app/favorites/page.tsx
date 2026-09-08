"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { lessons } from "@/data/lessons";
import { useAcademy } from "@/hooks/use-academy";
import type { Favorite } from "@/types";

export default function FavoritesPage() {
  const { state, toggleFavorite } = useAcademy();
  const lessonFavs = state.favorites.filter(
    (f): f is Extract<Favorite, { type: "lesson" }> => f.type === "lesson"
  );
  const moduleFavs = state.favorites.filter(
    (f): f is Extract<Favorite, { type: "module" }> => f.type === "module"
  );
  const total = state.favorites.length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">收藏夹</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          共 {total} 项收藏 · 支持课程与模块两个层级
        </p>
      </header>

      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
          <p className="text-3xl">☆</p>
          <p className="mt-2 text-sm font-medium text-slate-600">收藏夹还是空的</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
            在课程详情页点击「收藏本课」或模块右上角的星标，就能把重点内容收进来，随时回来复习。
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-[#0e2a5e] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
          >
            去课程中心
          </Link>
        </div>
      ) : (
        <>
          {lessonFavs.length > 0 && (
            <Section title={`收藏的课程（${lessonFavs.length}）`}>
              {lessonFavs.map((fav) => {
                const lesson = lessons.find((l) => l.id === fav.lessonId);
                if (!lesson) return null;
                return (
                  <FavRow
                    key={`lesson:${fav.lessonId}`}
                    href={`/courses/${lesson.slug}`}
                    tag={`第 ${lesson.id} 讲`}
                    title={lesson.title}
                    subtitle={lesson.subtitle}
                    onRemove={() => toggleFavorite({ type: "lesson", lessonId: lesson.id })}
                  />
                );
              })}
            </Section>
          )}

          {moduleFavs.length > 0 && (
            <Section title={`收藏的模块（${moduleFavs.length}）`}>
              {moduleFavs.map((fav) => {
                const lesson = lessons.find((l) => l.id === fav.lessonId);
                const lessonModule = lesson?.modules.find((m) => m.id === fav.moduleId);
                if (!lesson || !lessonModule) return null;
                return (
                  <FavRow
                    key={`module:${fav.lessonId}:${fav.moduleId}`}
                    href={`/courses/${lesson.slug}#${fav.moduleId}`}
                    tag={`${lesson.title} · ${lessonModule.title}`}
                    title={lessonModule.title}
                    subtitle={(lessonModule.body[0] ?? "").slice(0, 80) + "…"}
                    onRemove={() =>
                      toggleFavorite({
                        type: "module",
                        lessonId: lesson.id,
                        moduleId: lessonModule.id,
                      })
                    }
                  />
                );
              })}
            </Section>
          )}
        </>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-bold text-slate-800">{title}</h2>
      <ul className="mt-3 divide-y divide-slate-100">{children}</ul>
    </section>
  );
}

function FavRow({
  href,
  tag,
  title,
  subtitle,
  onRemove,
}: {
  href: string;
  tag: string;
  title: string;
  subtitle: string;
  onRemove: () => void;
}) {
  return (
    <li className="group flex items-center gap-4 py-3">
      <Link href={href} className="min-w-0 flex-1">
        <p className="text-xs text-[#0e2a5e]/70">{tag}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-700 group-hover:text-[#0e2a5e]">
          {title}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-400">{subtitle}</p>
      </Link>
      <button
        type="button"
        onClick={onRemove}
        title="取消收藏"
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
      >
        取消收藏
      </button>
    </li>
  );
}
