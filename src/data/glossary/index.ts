/**
 * Fund Admin Wiki — 术语聚合入口（V1.14.0）
 *
 * 数组顺序 = 正文标注的匹配优先级（同文本冲突时取靠前者）。
 * `imported.ts` 由 `npm run gen:glossary`（prebuild 自动执行）从
 * `content/glossary/imported.json` 烘焙生成——批量导入的落点。
 */
import type { GlossaryTerm } from "@/types/glossary";
import { FUND_STRUCTURE_TERMS } from "./structure";
import { LEGAL_ENTITY_TERMS } from "./legal-entity";
import { GOVERNANCE_TERMS } from "./governance";
import { AML_KYC_TERMS } from "./aml-kyc";
import { AEOI_TERMS } from "./aeoi";
import { TAX_TERMS } from "./tax";
import { REGULATORY_TERMS } from "./regulatory";
import { FUND_OPERATIONS_TERMS } from "./operations";
import { IMPORTED_TERMS } from "./imported";

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  ...FUND_STRUCTURE_TERMS,
  ...LEGAL_ENTITY_TERMS,
  ...GOVERNANCE_TERMS,
  ...AML_KYC_TERMS,
  ...AEOI_TERMS,
  ...TAX_TERMS,
  ...REGULATORY_TERMS,
  ...FUND_OPERATIONS_TERMS,
  ...IMPORTED_TERMS,
];

/** 内置（手写）术语数量 */
export const GLOSSARY_BUILTIN_COUNT =
  FUND_STRUCTURE_TERMS.length +
  LEGAL_ENTITY_TERMS.length +
  GOVERNANCE_TERMS.length +
  AML_KYC_TERMS.length +
  AEOI_TERMS.length +
  TAX_TERMS.length +
  REGULATORY_TERMS.length +
  FUND_OPERATIONS_TERMS.length;

export { IMPORTED_TERMS };
