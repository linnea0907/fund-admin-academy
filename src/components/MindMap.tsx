import type { MindMapNode } from "@/types";

/** 将思维导图树渲染为可读的分支布局（纯 CSS，无第三方依赖） */
export default function MindMap({ root }: { root: MindMapNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        思维导图
      </p>
      <div className="flex flex-col gap-3">
        <MindRoot label={root.label} note={root.note} />
        {root.children?.map((child, i) => (
          <MindBranch key={i} node={child} index={i} />
        ))}
      </div>
    </div>
  );
}

function MindRoot({ label, note }: { label: string; note?: string }) {
  return (
    <div className="rounded-lg bg-[#0e2a5e] px-4 py-3 text-center">
      <div className="text-sm font-semibold text-white sm:text-base">{label}</div>
      {note && <div className="mt-0.5 text-xs text-blue-200">{note}</div>}
    </div>
  );
}

function MindBranch({ node, index }: { node: MindMapNode; index: number }) {
  const palette = [
    "border-blue-200 bg-blue-50",
    "border-indigo-200 bg-indigo-50",
    "border-sky-200 bg-sky-50",
    "border-cyan-200 bg-cyan-50",
  ];
  const tone = palette[index % palette.length];
  return (
    <div className={`rounded-lg border ${tone} px-4 py-3`}>
      <div className="flex items-start gap-2">
        <span className="mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded bg-white px-1 text-[11px] font-bold text-[#0e2a5e] shadow-sm">
          {index + 1}
        </span>
        <span className="text-sm font-semibold text-slate-800">{node.label}</span>
      </div>
      {node.children && node.children.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 pl-7">
          {node.children.map((leaf, j) => (
            <span
              key={j}
              className="rounded-full bg-white/80 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-slate-200"
            >
              {leaf.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
