import { buildTermRelations } from "@/lib/glossary-usage";

/**
 * 术语 → 关联位置索引（课程 / 案例）。
 * 与术语详情页、/glossary 列表、健康度 Dashboard 同源（buildTermRelations）：
 * 自动扫描（课程 + 案例正文）∪ 人工指定（术语数据的 courses / cases 字段）。
 * Drawer 打开时惰性拉取一次；构建期页面对应函数直接 SSG 烘焙。
 */
export async function GET() {
  return Response.json(buildTermRelations());
}
