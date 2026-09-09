#!/usr/bin/env node
/**
 * V1.13.1 一次性标注脚本：为 content/cases/Case-*.md frontmatter 注入分类字段
 *   jurisdiction: string[]  属地（适用规则来源；可多属地，如 BVI+Cayman 对照案）
 *   businessArea: string    业务场景
 *   entityType:  string     实体类型
 *   topics:      string[]   知识主题
 *   tags:        保留原中文 tags + 追加英文检索标签
 * 正文 body 完全不动。执行后可 npm run gen:cases 重生成 index.json。
 *
 * 判断口径：
 *   ready 案例依正文「场景背景/ICS SOP依据」判断规则来源；
 *   骨架案例按标题 + skills 推断初稿（正文导入后需复核，属 P3 待校正）。
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const DIR = "content/cases";

/** 每案标注表：id → { j, ba, et, top, addTags } */
const ANNOTATION = {
  "Case-001": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Identity Verification"], addTags: ["Hong Kong ID", "HKPR", "Passport"] },
  "Case-002": { j: ["Hong Kong"], ba: "Investor Onboarding", et: "Individual", top: ["Address Proof"], addTags: ["Mobile Bill", "Utility Bill"] },
  "Case-003": { j: ["BVI"], ba: "Investor Onboarding", et: "Individual", top: ["Identity Verification"], addTags: ["Certification", "Uncertified Copy"] },
  "Case-004": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Address Proof"], addTags: ["Reference Letter"] },
  "Case-005": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Identity Verification"], addTags: ["Singapore IC", "Blue IC", "NRIC"] },
  "Case-006": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["BVI Company", "Corporate Chart"] },
  "Case-007": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["SPV", "Multi-layer Structure"] },
  "Case-008": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["Listed Company", "Stock Exchange"] },
  "Case-009": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["SOE", "State-owned Enterprise"] },
  "Case-010": { j: ["Cayman"], ba: "Investor Onboarding", et: "Trust", top: ["Trust", "UBO"], addTags: ["Complex Trust", "Discretionary Trust"] },
  "Case-011": { j: ["BVI"], ba: "Investor Onboarding", et: "Fund", top: ["UBO"], addTags: ["AML Letter", "Licensed Manager"] },
  "Case-012": { j: ["BVI"], ba: "Investor Onboarding", et: "Fund", top: ["UBO"], addTags: ["AML Letter", "Fund Administrator", "VCC"] },
  "Case-013": { j: ["BVI"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["Discretionary Account", "Licensed AM", "SFC"] },
  "Case-014": { j: ["Other"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["AML Letter", "Validity", "Existing Client"] },
  "Case-015": { j: ["BVI"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["AML Letter", "Missing Covenant"] },
  "Case-016": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Identity Verification", "SOF"], addTags: ["Individual Investor", "Subscription"] },
  "Case-017": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["Corporate Investor", "Company"] },
  "Case-018": { j: ["BVI"], ba: "Investor Onboarding", et: "Trust", top: ["Trust"], addTags: ["Trustee", "Trust Structure"] },
  "Case-019": { j: ["Cayman"], ba: "Investor Onboarding", et: "Fund", top: ["UBO"], addTags: ["Fund Investor", "Regulated Fund"] },
  "Case-020": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["SOF"], addTags: ["Additional Subscription", "Top-up"] },
  "Case-021": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["Identity Verification"], addTags: ["Closing", "KYC"] },
  "Case-022": { j: ["Cayman"], ba: "Investor Onboarding", et: "Corporate", top: ["UBO"], addTags: ["UBO Disclosure", "Refusal"] },
  "Case-023": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["PEP"], addTags: ["PEP", "Politically Exposed"] },
  "Case-024": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Adverse Media"], addTags: ["Adverse Media", "Negative News"] },
  "Case-025": { j: ["Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Sanctions"], addTags: ["High-risk Country", "FATF"] },
  "Case-026": { j: ["BVI", "Cayman"], ba: "Investor Onboarding", et: "Individual", top: ["Identity Verification"], addTags: ["Taiwan ID", "National ID"] },
};

const files = fs.readdirSync(DIR).filter((f) => /^Case-\d{3,}\.md$/i.test(f));
let updated = 0;
for (const file of files.sort()) {
  const fp = path.join(DIR, file);
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  const ann = ANNOTATION[data.id];
  if (!ann) {
    console.log(`SKIP ${file} (no annotation)`);
    continue;
  }
  data.jurisdiction = ann.j;
  data.businessArea = ann.ba;
  data.entityType = ann.et;
  data.topics = ann.top;
  // 合并原 tags（保留）+ 追加英文检索标签（去重）
  const orig = Array.isArray(data.tags) ? data.tags.map((t) => String(t).trim()).filter(Boolean) : [];
  data.tags = Array.from(new Set([...orig, ...ann.addTags]));
  const out = matter.stringify(content, data);
  fs.writeFileSync(fp, out, "utf8");
  updated++;
  console.log(`UPD ${file} → j=${ann.j.join("+")} ba=${ann.ba} et=${ann.et} top=${ann.top.join("+")}`);
}
console.log(`\n[annotate] ${updated}/${files.length} cases annotated`);
