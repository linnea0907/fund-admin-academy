import { buildGlossaryUsage } from "@/lib/glossary-usage";

/**
 * 术语 → 使用位置索引（课程模块 / 案例）。
 * Drawer 打开时惰性拉取一次；构建期 /glossary 与详情页直接调用同源函数 SSG 烘焙。
 */
export async function GET() {
  const usage = buildGlossaryUsage();
  return Response.json(usage);
}
