import type { CamsDomain } from "@/types/cams";
import { camsDomainMeta } from "@/types/cams";

/**
 * CAMS 标签（V1.16.0）。
 *
 * 展示课程所覆盖的 CAMS Domain（如「CAMS-A」），用于课程卡片、课程详情页
 * 与课程筛选。这是「课程 ↔ 认证域」的映射标签，不是第二套课程体系。
 *
 * 无 CAMS 标注的课程不渲染任何标签。
 */
export default function CamsTag({
  domain,
  size = "sm",
}: {
  domain: CamsDomain;
  size?: "sm" | "md";
}) {
  const meta = camsDomainMeta(domain);
  if (!meta) return null;

  if (size === "md") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide ring-1 ${meta.tint}`}
        title={meta.title}
      >
        CAMS-{meta.id}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1 ${meta.tint}`}
      title={meta.title}
    >
      CAMS-{meta.id}
    </span>
  );
}

/** 一组 CAMS 标签（一个课程可覆盖多个域） */
export function CamsTags({
  domains,
  size = "sm",
}: {
  domains?: CamsDomain[];
  size?: "sm" | "md";
}) {
  if (!domains || domains.length === 0) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {domains.map((d) => (
        <CamsTag key={d} domain={d} size={size} />
      ))}
    </span>
  );
}
