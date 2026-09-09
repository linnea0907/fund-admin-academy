import type { Metadata } from "next";
import BacklogApp from "@/components/backlog/BacklogApp";

export const metadata: Metadata = {
  title: "案例工坊",
  description:
    "案例工坊 · 案例种子库（用于积累真实案例并批量生成标准案例）：30 秒记录案例种子（标题 + 一句话 + 来源），支持按状态/来源筛选、多选与批量改状态；攒批后一键「生成案例包」复制给 Copilot 批量生成标准案例（V1.0）",
};

/** Case Backlog V1.0：纯前端（localStorage），无后台 / 无权限 / 无富文本 */
export default function BacklogPage() {
  return <BacklogApp />;
}
