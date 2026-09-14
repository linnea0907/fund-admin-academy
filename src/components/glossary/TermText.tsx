"use client";

import { Fragment, type ReactNode } from "react";
import { annotateSegments } from "@/lib/glossary";
import TermLink from "./TermLink";

/**
 * 把一段纯文本按术语词表切段：
 *   - 普通片段 → 原样文本
 *   - 命中术语 → <TermLink>（虚线下划线，hover 提示 / click Drawer）
 * 同一套切分逻辑用于：
 *   - 课程正文纯文本（LessonViewer / 目标 / 要点 / 风险）
 *   - 案例 markdown 文本叶子（MarkdownBody 递归调用 renderSegments）
 *
 * V1.14.1：默认开启**段落级去重**（unique）——同一段落内同一术语只标注首次出现，
 * 后续出现为普通文本，避免 Trust / Distribution 这类高频词在正文里反复高亮。
 */

export function renderSegments(
  text: string,
  keyPrefix = "t",
  unique = true,
  seen?: Set<string>
): ReactNode[] {
  const segs = annotateSegments(text, { unique, seen });
  return segs.map((s, i) =>
    s.termId ? (
      <TermLink key={`${keyPrefix}-${i}`} termId={s.termId}>
        {s.text}
      </TermLink>
    ) : s.text === "" ? null : (
      <Fragment key={`${keyPrefix}-${i}`}>{s.text}</Fragment>
    )
  );
}

/** 独立文本块：直接渲染为行内片段（供课程正文段落/列表项使用）
 *  外层 <span class="break-words"> 提供 wrap 上下文——避免父 flex/grid 容器
 *  在 Tablet 档被英文长术语（如 Unfunded Commitment）撑爆导致横向溢出。
 *  break-words = overflow-wrap:break-word，仅在单词无法整体放下时才断字。
 *  一个 <TermText> 即一个「段落级」去重单元。 */
export default function TermText({ text, unique = true }: { text: string; unique?: boolean }) {
  return <span className="break-words">{renderSegments(text, "t", unique)}</span>;
}
