"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import { renderSegments } from "@/components/glossary/TermText";

/**
 * 递归标注 react-markdown 解析出的子节点：
 * - 字符串叶子 → 按术语词表切段，命中处渲染为 <TermLink>（虚线下划线）
 * - 仅深入纯 HTML 标签元素（strong/em/del…），跳过 code / pre / a（避免破坏代码与超链接）
 * - 函数组件（react-markdown 自定义 components）不深入——它们各自负责自身标注
 */
function annotateChildren(node: ReactNode, keyPrefix: string): ReactNode {
  if (typeof node === "string") {
    const segs = renderSegments(node, keyPrefix);
    if (segs.length === 1) return segs[0];
    return <>{segs}</>;
  }
  if (Array.isArray(node)) {
    return node.map((n, i) => annotateChildren(n, `${keyPrefix}-${i}`));
  }
  if (isValidElement<{ children?: ReactNode }>(node) && typeof node.type === "string") {
    const tag = node.type;
    if (tag === "code" || tag === "pre" || tag === "a") return node;
    return cloneElement(
      node,
      { key: node.key ?? keyPrefix },
      annotateChildren(node.props.children ?? "", `${keyPrefix}-c`)
    );
  }
  return node;
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="mt-5 mb-2 border-b border-slate-200 pb-1 text-lg font-bold text-slate-800 first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-5 mb-2 text-base font-bold text-slate-800 first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-4 mb-1.5 text-[15px] font-bold text-slate-700 first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="my-2 text-[15px] leading-relaxed text-slate-600">
      {annotateChildren(children, "p")}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="my-2 space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-600 [&>li]:list-disc">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-2 list-decimal space-y-1.5 pl-5 text-[15px] leading-relaxed text-slate-600 [&>li]:pl-1">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{annotateChildren(children, "li")}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-amber-300 bg-amber-50/70 px-4 py-2 text-[15px] leading-relaxed text-amber-900">
      {annotateChildren(children, "bq")}
    </blockquote>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-slate-800">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[13px] text-[#0e2a5e]">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="my-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-[13px] leading-relaxed text-slate-100">
      {children}
    </pre>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="font-medium text-[#0e2a5e] underline decoration-blue-200 underline-offset-2 hover:decoration-[#0e2a5e]"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 text-left">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="border-b border-slate-200 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {annotateChildren(children, "th")}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
      {annotateChildren(children, "td")}
    </td>
  ),
  hr: () => <hr className="my-4 border-slate-200" />,
};

/** Markdown 渲染（案例正文等使用；术语词表自动标注为虚线下划线热词） */
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
