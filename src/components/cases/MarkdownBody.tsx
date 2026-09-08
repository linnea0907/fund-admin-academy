"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

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
    <p className="my-2 text-[15px] leading-relaxed text-slate-600">{children}</p>
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
  li: ({ children }) => <li>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-amber-300 bg-amber-50/70 px-4 py-2 text-[15px] leading-relaxed text-amber-900">
      {children}
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
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-slate-100 px-3 py-2 text-slate-600">{children}</td>
  ),
  hr: () => <hr className="my-4 border-slate-200" />,
};

/** Markdown 渲染（案例正文等使用） */
export default function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
