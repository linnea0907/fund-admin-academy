import type { Metadata } from "next";
import CamsExam from "@/components/cams/CamsExam";

export const metadata: Metadata = {
  title: "CAMS 模拟考试",
  description:
    "按官方蓝图 Domain A/B/C/D 组卷的 120 题全真模拟考试：3.5 小时自动计时、自动评分、错题回顾。",
};

export default function CamsExamPage() {
  return <CamsExam />;
}
