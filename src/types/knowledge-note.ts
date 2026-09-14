/**
 * Fund Admin Wiki — Knowledge Notes（知识卡）数据结构预留 · V1.14.1（P2）
 *
 * ── 为什么需要这一层 ──────────────────────────────────────────────
 * 现有知识检索只有两种形态：**术语（Terms）** 与 **案例（Cases）**。
 * 但实务中大量沉淀下来的知识既不是术语、也不是单个案例，而是一类
 * 「判断规则 / 接受标准 / 穿透逻辑」，例如：
 *
 *   · 台湾地址证明接受标准（何种文件 + 是否需公证 + 时效）
 *   · AML Letter 接受条件（哪些来源可接受、须载明哪些要素）
 *   · Trust 穿透逻辑（信托架构下 UBO 如何认定到自然人）
 *   · DMA 判断逻辑（何时算 DMA、与 SMA 的边界）
 *   · 美国 W-8BEN 填写要点（Claim of Treaty Benefits 的常见错填）
 *
 * 这类内容目前散落在课程正文与案例 SOP 依据里，无法被独立检索、引用与复用。
 *
 * ── 本版本范围（V1.14.1）────────────────────────────────────────
 * 仅**预留数据结构**，不开发完整功能（无页面、无 CRUD、导入/检索未接入）。
 * 下一阶段（V1.15.0）据此模型落地：
 *   /wiki/notes 列表与详情 → 知识检索结果页新增 Notes 分组 → 与术语/案例互链
 *
 * ── 与术语的关系 ────────────────────────────────────────────────
 * 术语 = 「一个概念是什么」（定义 / 重要性 / 别名）
 * 知识卡 = 「一类场景怎么判断 / 怎么处理」（条件 / 标准 / 边界）
 * 两者通过 relatedTerms 双向挂接，共同构成 AI 知识图谱的节点与边。
 */

import type { GlossaryCategory, TermJurisdiction, TermSourceId } from "./glossary";

/** 知识卡状态（草稿 → 复核 → 发布；沿用「人工把关」原则） */
export type KnowledgeNoteStatus = "draft" | "review" | "published";

export interface KnowledgeNote {
  /** 知识卡 id（URL 用，如 "tw-address-proof-standard"） */
  id: string;
  /** 标题（中文为主，可含英文专有名词） */
  title: string;
  /** 英文标题（可选） */
  titleEn?: string;
  /** 归类（复用术语 8 大分类，便于统一筛选） */
  category: GlossaryCategory;
  /** 属地（规则来源地，可多个；Global = 通用） */
  jurisdiction: TermJurisdiction[];
  /** 一句话结论（列表与检索结果展示） */
  summary: string;
  /** 正文（Markdown；通常包含 判断条件 / 步骤 / 例外 / 反例） */
  body: string;
  /** 关联术语 id（双向挂接） */
  relatedTerms: string[];
  /** 关联案例 id（Case-001） */
  relatedCases: string[];
  /** 关联课程 id（"01" / "E01"） */
  relatedCourses: string[];
  /** 来源（与术语同一套受控枚举） */
  source: TermSourceId[];
  /** 自由标签 */
  tags: string[];
  /** 状态 */
  status: KnowledgeNoteStatus;
  /** 最近更新（ISO 日期） */
  updatedAt: string;
}

/**
 * 知识卡数据集（V1.14.1 为空 —— 仅预留结构）。
 * 数据落地后同样走「构建期单一数据源」：content/notes/*.md → gen 脚本烘焙。
 */
export const KNOWLEDGE_NOTES: KnowledgeNote[] = [];

export const KNOWLEDGE_NOTE_COUNT = KNOWLEDGE_NOTES.length;

/** 待建设知识卡候选（来自 V1.14.1 spec，供 V1.15.0 排期参考） */
export const KNOWLEDGE_NOTE_BACKLOG: string[] = [
  "台湾地址证明接受标准",
  "AML Letter 接受条件",
  "Trust 穿透逻辑（UBO 认定到自然人）",
  "DMA 判断逻辑（与 SMA 的边界）",
  "美国 W-8BEN 填写要点（Claim of Treaty Benefits）",
];
