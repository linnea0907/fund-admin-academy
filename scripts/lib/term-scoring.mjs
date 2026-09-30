/**
 * term-scoring.mjs — 术语价值评分 + 监管系统识别（V1.20.11 / V1.20.12）
 *
 * 背景（Lu 2026-09-28 定稿）：
 *   术语库建设已从「数量扩张」转向「质量治理」。扫描器此前偏向词频，导致
 *   普通金融概念（Money Laundering / Mutual Fund）与高价值实务术语（REEFS /
 *   VIRRGIN / BOSS）被一视同仁。本模块给候选词加两层领域知识：
 *
 *   ① 价值评分（V1.20.11）——按类别词典打分，正向加分 / 负向扣分，
 *     产出 `valueScore`（-20 ~ +25）与 `valueReasons`（逐条说明）。
 *   ② 监管系统识别（V1.20.12）——维护按法域分组的监管系统/平台名称词典，
 *     专项识别，产出独立「监管系统发现报告」。
 *
 * ⚠️ 本模块只做「评分与识别」，不参与「是否创建」的最终决策：
 *   - 评分结果写入 candidates.json 供审核页展示；
 *   - 是否低于阈值放弃创建，由调用方（scan 脚本 / 采纳流程）决定。
 *   - 全自动模式（Lu 定稿）：系统发现 → 系统评分 → 系统按阈值取舍，无人审核步骤。
 *
 * 依赖：Node ≥ 22.18（本模块为纯数据 + 纯函数，无 Node 内置依赖，可被 TS loader 直载）。
 */

/* ================================================================
 * 一、价值评分词典（V1.20.11）
 * ================================================================ */

/**
 * 正向加分词典：按类别分组，命中即加对应分值。
 * 匹配口径：候选词的归一 key（小写）或原文本，做「包含」或「精确」两种匹配。
 *   - exact：候选词等于词典项（缩略词、系统名，精确匹配防误伤）
 *   - contains：候选词包含词典片段（短语类，如 "Investment Entity" 含 "Investment"）
 */
const POSITIVE_CATEGORIES = {
  /** 监管术语 +5 */
  regulatory: {
    score: 5,
    label: "监管术语",
    exact: [
      "fic", "fatf", "finma", "fca", "mas", "sec", "cima", "sfc", "fsc",
      "finra", "fincen", "cftc", "nfa", "esma", "eiopa", "eba", "pra", "fca",
    ],
    contains: [
      "regulator", "regulatory", "licence", "license", "licensing", "authorisation",
      "authorization", "approval", "approved", "registered", "registration",
      "supervision", "supervisory", "notification", "filing", "disclosure",
      "compliance", "sanction", "enforcement",
    ],
  },

  /** 基金实务术语 +5 */
  "fund-practice": {
    score: 5,
    label: "基金实务",
    exact: [],
    contains: [
      "fund", "subscription", "redemption", "drawdown", "distribution",
      "waterfall", "commitment", "carried", "management fee", "performance fee",
      "capital account", "capital call", "side letter", "side pocket",
      "nav", "valuation", "closing", "custody", "transfer agent", "prime broker",
      "feeder", "master fund", "umbrella", "segregated portfolio",
    ],
  },

  /** KYC/CDD 术语 +5 */
  "kyc-cdd": {
    score: 5,
    label: "KYC/CDD",
    exact: ["kyc", "cdd", "edd", "ubo", "pep", "sdd", "aml"],
    contains: [
      "know your customer", "customer due diligence", "enhanced due diligence",
      "beneficial owner", "ultimate beneficial", "source of funds", "source of wealth",
      "identity verification", "identity document", "address proof", "self-certification",
      "politically exposed", "onboarding", "periodic review", "ongoing monitoring",
      "remediation", "reverification",
    ],
  },

  /** AML 术语 +5 */
  aml: {
    score: 5,
    label: "AML",
    exact: ["aml", "str", "sar", "ctr", "mlro", "dmlro", "amlco", "fatf", "ofac", "msb", "ctf"],
    contains: [
      "anti-money laundering", "money laundering", "terrorist financing",
      "suspicious activity", "suspicious transaction", "suspicious activity report",
      "suspicious transaction report", "transaction monitoring", "sanctions screening",
      "tipping off", "trade-based money laundering", "cash-intensive",
      "fictitious transaction", "overpayment", "crypto mixer", "privacy coin",
      "nested account", "correspondent banking", "risk-based approach",
    ],
  },

  /** AEOI/FATCA/CRS 术语 +5 */
  aeoi: {
    score: 5,
    label: "AEOI/FATCA/CRS",
    exact: ["aeoi", "fatca", "crs", "giin", "tin", "ffi", "nfe", "nffe", "iga", "w8", "w9"],
    contains: [
      "common reporting standard", "automatic exchange", "reportable account",
      "reportable jurisdiction", "financial institution", "investment entity",
      "participating jurisdiction", "account holder", "self-certification",
      "withholding", "us person", "us indicia", "intergovernmental agreement",
      "sponsoring entity", "model 1", "model 2",
    ],
  },

  /** 基金架构术语 +5 */
  "fund-structure": {
    score: 5,
    label: "基金架构",
    exact: ["spc", "spv", "pcc", "llc", "lp", "gp", "elp", "lpf", "ofc", "vcc", "pif", "aiv"],
    contains: [
      "limited partnership", "limited liability", "exempted company", "unit trust",
      "segregated portfolio", "portfolio company", "blocker", "tax transparent",
      "fund of funds", "master-feeder", "standalone fund", "registered fund",
      "professional fund", "private fund", "mutual fund", "open-ended", "closed-ended",
    ],
  },

  /** 运营流程术语 +5 */
  operations: {
    score: 5,
    label: "运营流程",
    exact: ["sla", "isae", "soc", "ima", "lpa", "ppm", "nav"],
    contains: [
      "operating", "operation", "workflow", "reconciliation", "settlement",
      "payment", "instruction", "signatory", "authorized signatory",
      "service level", "reporting", "accounting", "audit", "valuation",
      "deal board", "investor register", "register of members",
    ],
  },

  /** 监管系统/实务平台 +10（最高价值：本领域专有系统名） */
  "regulatory-system": {
    score: 10,
    label: "监管系统",
    exact: [],
    // 由 REGULATORY_SYSTEMS 词典补充（见第二节）
    contains: ["portal", "platform", "connect", "registry", "gateway", "system"],
  },
};

/**
 * 负向扣分词典。
 */
const NEGATIVE_CATEGORIES = {
  /** 通用英文词 -10 */
  generic: {
    score: -10,
    label: "通用英文词",
    exact: [
      "the", "and", "for", "with", "from", "this", "that", "which", "have", "has",
      "been", "are", "was", "were", "will", "would", "should", "could", "about",
      "into", "over", "under", "between", "within", "without", "through", "against",
      "only", "same", "each", "every", "some", "most", "many", "much", "more",
      "less", "least", "however", "therefore", "moreover", "furthermore", "otherwise",
      "meanwhile", "based", "using", "used", "use", "make", "made", "take", "given",
      "keep", "kept", "please", "thank", "thanks", "dear", "sir", "madam", "regards",
      "best", "kind", "kindly", "team", "group", "member", "members", "attached",
      // V1.20.11 补充：扫描实测暴露的通用词（此前被正向 contains 误加分）
      "compliance", "audit", "fund manager", "advisor", "monitoring", "evidence",
      "freeze", "certification", "requirements", "framework", "program", "technology",
      "ownership", "rationale", "restrict", "alert", "call", "active", "passive",
      "private", "mutual", "foundations", "common", "key", "focus", "independence",
      "letter", "line", "reg", "certified true copy", "discretionary account",
      "signature page", "subscriber", "reference letter",
    ],
    contains: [],
  },

  /** 普通金融概念 -5 */
  "generic-finance": {
    score: -5,
    label: "普通金融概念",
    exact: ["etf", "esg", "sri"],
    contains: [
      "interest rate", "exchange rate", "stock", "bond", "equity", "debt",
      "dividend", "portfolio", "diversification", "liquidity", "volatility",
      "market risk", "credit risk", "investment", "asset", "capital", "return",
    ],
  },

  /** 课程主题词 -5（已是课程主题，建词条价值低） */
  "course-topic": {
    score: -5,
    label: "课程主题词",
    exact: ["aml", "kyc", "fatca", "crs", "cdd"],
    contains: [
      "money laundering", "terrorist financing", "mutual fund", "cayman fund",
      "bvi fund", "fund administration", "fund operations", "fund structure",
    ],
  },

  /** 非专业场景词 -10 */
  "non-professional": {
    score: -10,
    label: "非专业场景词",
    exact: [],
    contains: [
      "dear investor", "existing client", "new client", "reference letter",
      "standard answer", "reasoning", "takeaway", "scenario", "example",
      "question", "answer", "checklist", "template",
    ],
  },

  /** 页面标题类词汇 -10 */
  "page-title": {
    score: -10,
    label: "页面标题类",
    exact: [],
    contains: [
      "fund administration team", "investor onboarding", "client communication",
      "regulatory filing", "fund setup", "fund governance", "fund operations",
      "periodic review", "case study", "practical guide", "admin checklist",
    ],
  },
};

/* ================================================================
 * 二、监管系统 / 实务平台名称词典（V1.20.12）
 * ================================================================ */

/**
 * 按法域分组的监管系统/平台名称。
 * 这些是基金实务中高频出现、但普通词频扫描难以识别的专有系统名。
 * 匹配口径：`name`（展示名）与 `aliases`（变体/缩写）做归一后精确匹配。
 */
const REGULATORY_SYSTEMS = {
  Cayman: [
    { name: "REEFS", aliases: ["REEFS Portal", "Regulatory Enhanced Electronic Forms Submission"], note: "开曼 CIMA 监管申报系统" },
    { name: "CIMA Connect", aliases: ["CIMA Connect Portal"], note: "开曼 CIMA 线上服务平台" },
    { name: "DITC Portal", aliases: ["DITC", "Department for International Tax Cooperation Portal"], note: "开曼税务信息交换门户" },
    { name: "AML Survey", aliases: ["CIMA AML Survey"], note: "开曼 CIMA 年度反洗钱调查" },
  ],
  BVI: [
    { name: "VIRRGIN", aliases: ["VIRRGIN Portal", "Virgin Islands Regulatory Reporting"], note: "BVI 公司注册与申报系统" },
    { name: "BOSS", aliases: ["BOSS System", "BVI Online System"], note: "BVI 商业公司在线系统" },
    { name: "BVIFARS", aliases: ["BVI Financial Account Reporting System"], note: "BVI 金融账户申报系统（FATCA/CRS）" },
    { name: "FSC Portal", aliases: ["BVI FSC Portal"], note: "BVI 金融服务委员会门户" },
  ],
  "Hong Kong": [
    { name: "FINI", aliases: ["FINI Platform", "Fast Interface for New Issuance"], note: "香港交易所新股结算平台" },
    { name: "CORE", aliases: ["CORE System", "Company Registry Online"], note: "香港公司注册处综合系统" },
    { name: "WISE", aliases: ["WISE Portal"], note: "香港证券及期货事务监察委员会电子服务平台" },
    { name: "eMPF", aliases: ["eMPF Platform"], note: "香港强积金电子平台" },
  ],
  "International Tax": [
    { name: "FATCA Portal", aliases: ["IRS FATCA Portal", "FATCA Registration System"], note: "美国 FATCA 登记与申报门户" },
    { name: "CRS Portal", aliases: ["CRS Reporting Portal"], note: "CRS 共同申报标准报告门户" },
    { name: "IRS Filing Platform", aliases: ["IRS E-File"], note: "美国国税局电子申报平台" },
  ],
};

/* ================================================================
 * 三、评分引擎
 * ================================================================ */

/** 归一化：小写、去首尾空白、压缩连续空白 */
function norm(s) {
  return String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * 给候选词打分。
 * @param raw 候选词原文本（如 "REEFS" / "Investment Entity" / "Compliance"）
 * @returns { score, reasons, categories, isRegulatorySystem }
 */
export function scoreTerm(raw) {
  const key = norm(raw);
  const reasons = [];
  const categories = [];

  // ① 监管系统（最高优先级）：命中即 +10，直接返回，不被其他词典干扰
  const sysHit = findRegulatorySystem(raw);
  if (sysHit) {
    return {
      score: 10,
      reasons: [`+10 监管系统（${sysHit.jurisdiction} · ${sysHit.name}）`],
      categories: ["监管系统"],
      isRegulatorySystem: true,
      regulatorySystem: sysHit,
    };
  }

  // ② 负向 exact（强信号）：通用词 / 课程主题词 / 页面标题，命中即扣分，
  //    且**抑制**后续正向 contains 的加分（避免「Compliance 既是监管词又是通用词」的自相矛盾）
  let negativeExactHit = false;
  for (const cat of Object.values(NEGATIVE_CATEGORIES)) {
    const exactHit = cat.exact.some((e) => key === norm(e));
    if (exactHit) {
      negativeExactHit = true;
      reasons.push(`${cat.score} ${cat.label}（精确命中）`);
      categories.push(cat.label);
    }
  }

  // ③ 正向 exact（强正向）：精确命中领域词典（缩略词、系统名等）
  for (const [catId, cat] of Object.entries(POSITIVE_CATEGORIES)) {
    if (catId === "regulatory-system") continue; // 监管系统由 ① 处理
    const exactHit = cat.exact.some((e) => key === norm(e));
    if (exactHit) {
      reasons.push(`+${cat.score} ${cat.label}（精确命中）`);
      categories.push(cat.label);
    }
  }

  // ④ 正向 contains（宽松加分）：仅当未被负向 exact 命中时生效
  if (!negativeExactHit) {
    for (const [catId, cat] of Object.entries(POSITIVE_CATEGORIES)) {
      if (catId === "regulatory-system") continue;
      const containsHit = cat.contains.some((c) => key.includes(norm(c)));
      if (containsHit) {
        reasons.push(`+${cat.score} ${cat.label}（含关键词）`);
        categories.push(cat.label);
      }
    }
  }

  // ⑤ 负向 contains（宽松扣分）
  for (const cat of Object.values(NEGATIVE_CATEGORIES)) {
    const containsHit = cat.contains.some((c) => key.includes(norm(c)));
    if (containsHit) {
      reasons.push(`${cat.score} ${cat.label}（含关键词）`);
      categories.push(cat.label);
    }
  }

  // 汇总分数：从 reasons 反推（保持单一数据源，避免 score 与 reasons 不一致）
  let score = 0;
  for (const r of reasons) {
    const m = /^([+-]\d+)/.exec(r);
    if (m) score += Number(m[1]);
  }

  return {
    score,
    reasons,
    categories: [...new Set(categories)],
    isRegulatorySystem: false,
    regulatorySystem: null,
  };
}

/* ================================================================
 * 四、监管系统识别（V1.20.12）
 * ================================================================ */

/** 在监管系统词典中查找匹配项（归一化精确匹配 name 或 alias） */
function findRegulatorySystem(raw) {
  const key = norm(raw);
  for (const [jurisdiction, systems] of Object.entries(REGULATORY_SYSTEMS)) {
    for (const sys of systems) {
      const names = [sys.name, ...(sys.aliases ?? [])].map(norm);
      if (names.includes(key)) {
        return { jurisdiction, name: sys.name, note: sys.note };
      }
    }
  }
  return null;
}

/**
 * 扫描一段文本，返回命中的监管系统（供 scan 脚本做专项识别）。
 * @returns 命中列表 [{ jurisdiction, name, note, matched }]
 */
export function scanRegulatorySystems(text) {
  const lower = String(text ?? "").toLowerCase();
  const hits = [];
  const seen = new Set();
  for (const [jurisdiction, systems] of Object.entries(REGULATORY_SYSTEMS)) {
    for (const sys of systems) {
      const names = [sys.name, ...(sys.aliases ?? [])];
      for (const n of names) {
        if (lower.includes(norm(n))) {
          if (seen.has(sys.name)) continue;
          seen.add(sys.name);
          hits.push({ jurisdiction, name: sys.name, note: sys.note, matched: n });
          break;
        }
      }
    }
  }
  return hits;
}

/** 导出监管系统全量词典（供「发现报告」统计已存在/遗漏） */
export function listRegulatorySystems() {
  const out = [];
  for (const [jurisdiction, systems] of Object.entries(REGULATORY_SYSTEMS)) {
    for (const sys of systems) {
      out.push({ jurisdiction, name: sys.name, aliases: sys.aliases ?? [], note: sys.note });
    }
  }
  return out;
}

/** 导出评分词典（供报告/文档展示） */
export const SCORING = { POSITIVE_CATEGORIES, NEGATIVE_CATEGORIES };
