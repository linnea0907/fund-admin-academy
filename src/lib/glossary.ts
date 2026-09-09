/**
 * Fund Admin Academy — 术语库（Glossary）单一数据源（V1.9）
 *
 * - 全部术语定义只维护本文件一份：课程页 / 案例页自动引用、/glossary 列表、
 *   /glossary/[id] 详情、Tooltip 与右侧 Drawer 均从此读取。
 * - 纯数据 + 纯函数模块（无 fs / process 依赖），client / server 均可安全 import。
 * - 自动识别规则：`en` 与 `aliases`（仅英文/缩写，避免中文子串误链）参与文本匹配；
 *   zh / brief / definition / commonMistakes 供 Tooltip、Drawer、详情页与搜索展示。
 * - 内容口径：Fund Admin 实务视角（KYC/AML/Fund Structure/Fund Documents/Operations），
 *   与课程正文及案例库（ICS SOP）对齐；法规时点信息以现行官方规则为准。
 */

export type GlossaryCategory = "kyc" | "aml" | "structure" | "documents" | "operations";

export interface GlossaryCategoryDef {
  id: GlossaryCategory;
  /** 英文短名（chips/搜索） */
  label: string;
  /** 中文说明 */
  zh: string;
}

export const GLOSSARY_CATEGORIES: GlossaryCategoryDef[] = [
  { id: "kyc", label: "KYC", zh: "客户尽调与身份核验" },
  { id: "aml", label: "AML", zh: "反洗钱合规" },
  { id: "structure", label: "Fund Structure", zh: "基金结构与治理" },
  { id: "documents", label: "Fund Documents", zh: "基金文件与单据" },
  { id: "operations", label: "Operations", zh: "基金运营与资金" },
];

export function getGlossaryCategory(id: GlossaryCategory): GlossaryCategoryDef {
  return GLOSSARY_CATEGORIES.find((c) => c.id === id) ?? GLOSSARY_CATEGORIES[0];
}

export interface GlossaryTerm {
  /** 术语 id（URL 用，如 "capital-call"） */
  id: string;
  /** 英文名（展示 + 参与文本匹配） */
  en: string;
  /** 中文名 */
  zh: string;
  /** 类别 */
  category: GlossaryCategory;
  /** 一句话定义（Tooltip / 列表行） */
  brief: string;
  /** 较完整定义（Drawer / 详情页） */
  definition: string;
  /** 常见误区（1~3 条） */
  commonMistakes: string[];
  /** 关联术语 id */
  related: string[];
  /** 英文别名/缩写（参与文本匹配与搜索；不要放中文，避免中文子串误链） */
  aliases?: string[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  /* ============================== KYC ============================== */
  {
    id: "kyc",
    en: "KYC",
    zh: "了解你的客户",
    category: "kyc",
    brief: "接纳投资人前核实其身份与背景的基础流程。",
    definition:
      "KYC（Know Your Customer）指基金行政管理人在受理认购前，收集并核实投资人身份、地址、受益所有人等信息，以识别并降低洗钱、制裁与欺诈风险的基础流程，是 CDD 的组成部分。KYC 并非一次性动作，信息变化或定期复核时需重核。",
    commonMistakes: [
      "认为 KYC 做完一次即永久有效（需按风险与时间复核）",
      "只收证件不核受益所有人（UBO）与资金背景",
    ],
    related: ["cdd", "ubo", "identity-document", "address-proof", "certified-copy"],
    aliases: ["Know Your Customer"],
  },
  {
    id: "cdd",
    en: "CDD",
    zh: "客户尽职调查",
    category: "kyc",
    brief: "根据风险高低对投资人开展的分层尽职调查。",
    definition:
      "CDD（Client Due Diligence）指在建立业务关系前对客户身份、受益所有人及业务背景进行的尽职调查，通常包含身份核验、UBO 穿透、PEP/制裁筛查与风险评级。风险较高或复杂结构客户需升级为 EDD。",
    commonMistakes: ["所有客户套用同一尽调模板（应以风险为本分层）"],
    related: ["kyc", "edd", "ubo", "pep", "aml"],
    aliases: ["Client Due Diligence"],
  },
  {
    id: "edd",
    en: "EDD",
    zh: "强化尽职调查",
    category: "kyc",
    brief: "对高风险客户采取的加强核验措施。",
    definition:
      "EDD（Enhanced Due Diligence）适用于 PEP、制裁/负面媒体报道相关、复杂所有权结构或大额异常交易等高风险情形：需额外核实财富与资金来源、取得管理层审批，必要时引入 AML Letter 或外部核实。",
    commonMistakes: ["高风险客户仍按标准 KYC 处理，未升级审批与证据要求"],
    related: ["cdd", "pep", "ubo", "sof", "aml-letter"],
    aliases: ["Enhanced Due Diligence"],
  },
  {
    id: "identity-document",
    en: "Identity Document",
    zh: "身份证明文件",
    category: "kyc",
    brief: "用于核实自然人身份的官方证件（护照/身份证等）。",
    definition:
      "身份证明文件用于核实投资人真实身份，常见为护照、政府签发身份证等。不同司法辖区对证件要求不同：例如 BVI 基金通常可接受长期有效的身份证件；Cayman 基金因反洗钱指引对证件有效期等有更严要求，往往需补充有效护照。",
    commonMistakes: [
      "不核对证件是否体现有效期（Cayman 侧易被退回）",
      "认为政府签发证件在所有基金属地均可直接接受",
    ],
    related: ["kyc", "address-proof", "certified-copy", "ubo"],
  },
  {
    id: "address-proof",
    en: "Address Proof",
    zh: "地址证明",
    category: "kyc",
    brief: "核实投资人居住或注册地址的文件。",
    definition:
      "地址证明用于佐证投资人的居住地或注册地址，常见为三个月内的银行对账单、水电费账单等。对机构投资人，注册地址通常以注册证书或良好存续证明体现，无需另行提交个人地址证明。",
    commonMistakes: ["接受过期文件（须留意出具日期要求）"],
    related: ["kyc", "identity-document", "certified-copy"],
  },
  {
    id: "ubo",
    en: "UBO",
    zh: "实际拥有人 / 受益所有人",
    category: "kyc",
    brief: "最终拥有或控制某一法律主体的自然人。",
    definition:
      "UBO（Ultimate Beneficial Owner）指通过持股、表决或其他控制方式最终拥有或控制某法律主体的自然人。穿透规则通常以 25% 持股为常见阈值，需沿公司/合伙/信托链条向上穿透，识别结果一般纳入 KYC 档案与相关申报（如 CRS/FATCA 的控权人识别）。",
    commonMistakes: [
      "穿透到中间控股公司即止步，未继续追至自然人",
      "忽略一致行动、代持等非持股控制情形",
    ],
    related: ["cdd", "edd", "pep", "sof", "spv", "trustee"],
    aliases: ["Ultimate Beneficial Owner"],
  },
  {
    id: "sof",
    en: "SOF",
    zh: "资金来源",
    category: "kyc",
    brief: "本次认购资金的具体来源渠道。",
    definition:
      "SOF（Source of Funds）指投资人用于本次认购的资金具体来自何处，例如工资积蓄、出售资产所得、投资收益或借贷等。与 SOW（财富来源）不同，SOF 关注单笔资金的直接来源，是识别洗钱风险的重要线索。",
    commonMistakes: ["把 SOF 与 SOW 混为一谈，未落实到单笔认购资金"],
    related: ["sow", "cdd", "ubo", "aml"],
    aliases: ["Source of Funds"],
  },
  {
    id: "sow",
    en: "SOW",
    zh: "财富来源",
    category: "kyc",
    brief: "投资人整体财富的积累来源。",
    definition:
      "SOW（Source of Wealth）指投资人整体财富如何积累形成，如经营企业、职业收入、继承等。SOF 回答“这笔钱从哪来”，SOW 回答“这些钱怎么积累的”；高风险客户常需两者一并说明。",
    commonMistakes: ["仅提供 SOW 即认为已覆盖 SOF（两者需同时核）"],
    related: ["sof", "cdd", "aml"],
    aliases: ["Source of Wealth"],
  },
  {
    id: "certified-copy",
    en: "Certified Copy",
    zh: "经核证副本",
    category: "kyc",
    brief: "由律师/公证人等核验与原件一致的副本。",
    definition:
      "Certified Copy（核证副本）指由律师、会计师、公证人或在职专业人士见证核验、确认与原件一致的证件或文件副本，常见于不便提供原件的跨境开户/认购场景。核证须注明见证人身份、日期并签名。",
    commonMistakes: ["把普通扫描件当作 Certified Copy 提交"],
    related: ["identity-document", "address-proof", "cdd"],
    aliases: ["Certified Document"],
  },
  {
    id: "fatca",
    en: "FATCA",
    zh: "美国海外账户税收合规法案",
    category: "kyc",
    brief: "美国要求境外金融机构报送美国纳税人账户信息的法案。",
    definition:
      "FATCA（Foreign Account Tax Compliance Act）要求境外金融机构识别美国纳税人（US Person）账户并向美国 IRS 申报，否则面临 30% 预扣税。基金开户时须收集 W-8/W-9 表格与自证声明完成 GIIN/FFI 合规。",
    commonMistakes: ["未区分 US Person 与税务居民概念，表格收集错漏"],
    related: ["crs", "w8ben", "tax-residency"],
    aliases: ["Foreign Account Tax Compliance Act"],
  },
  {
    id: "crs",
    en: "CRS",
    zh: "共同申报准则",
    category: "kyc",
    brief: "辖区间自动交换金融账户税务信息的全球标准。",
    definition:
      "CRS（Common Reporting Standard）由 OECD 制定，要求金融机构识别账户持有人的税务居民身份并报送，由辖区间自动交换。基金通常通过自我声明表格收集税务居民信息，并据此完成申报义务。",
    commonMistakes: [
      "把税务居民身份与国籍混同（居民身份依各辖区规则判定）",
      "仅做 KYC 不做 CRS 自证收集",
    ],
    related: ["fatca", "tax-residency", "w8ben"],
    aliases: ["Common Reporting Standard"],
  },
  {
    id: "w8ben",
    en: "W-8BEN",
    zh: "美国预扣税声明表（个人受益所有人）",
    category: "kyc",
    brief: "非美国个人用于主张税收协定待遇的 W-8 表格。",
    definition:
      "W-8BEN 由非美国个人受益所有人填写，用于证明其非美国纳税人身份及主张协定预扣税率；机构实体对应使用 W-8BEN-E。Fund Admin 在开户/认购时据此完成 FATCA 身份分类。",
    commonMistakes: ["个人与实体表格用错（BEN 与 BEN-E 混用）"],
    related: ["fatca", "crs", "tax-residency"],
  },
  {
    id: "tax-residency",
    en: "Tax Residency",
    zh: "税务居民身份",
    category: "kyc",
    brief: "决定申报与扣税义务归属的居民辖区身份。",
    definition:
      "税务居民身份依各辖区国内法（居住天数、永久性住所、重要利益中心等）判定，与国籍、护照签发地并不等同。基金通过自我声明表格收集，用于 CRS/FATCA 申报与预扣税判定。",
    commonMistakes: ["以国籍代替税务居民身份作答"],
    related: ["fatca", "crs", "w8ben"],
  },

  /* ============================== AML ============================== */
  {
    id: "aml",
    en: "AML",
    zh: "反洗钱",
    category: "aml",
    brief: "防范与打击洗钱及相关违法行为的合规体系。",
    definition:
      "AML（Anti-Money Laundering）指为防范洗钱、恐怖融资及制裁违规而建立的制度与流程，包括客户尽调、受益所有人识别、PEP/制裁筛查、可疑交易识别与报告等。基金及其行政管理人须依属地和投资人来源适用相应 AML 框架。",
    commonMistakes: ["把 AML 理解为一次性文件收集，忽略持续监控与报告义务"],
    related: ["cdd", "str", "mlro", "pep", "sanctions"],
    aliases: ["Anti-Money Laundering"],
  },
  {
    id: "aml-letter",
    en: "AML Letter",
    zh: "AML 确认函（无 AML 问题确认信）",
    category: "aml",
    brief: "律师或机构出具、确认相关主体无 AML 不利情形的信函。",
    definition:
      "AML Letter 通常由持牌律师或合资格机构出具，确认某法律主体及其控制链条不存在 AML 相关不利情形。当投资人为信托、基金之基金等复杂/受托结构、难以提供底层完整 KYC 包时，常以 AML Letter 覆盖底层，配合受托人/管理人的 KYC 使用。",
    commonMistakes: [
      "收到 AML Letter 即完全免除底层 UBO 识别（仍须按风险判断）",
      "未核对签署人身份与出具机构资质",
    ],
    related: ["ubo", "pep", "adverse-media", "trustee", "cdd"],
  },
  {
    id: "str",
    en: "STR",
    zh: "可疑交易报告",
    category: "aml",
    brief: "就疑似洗钱交易向主管机关提交的报告。",
    definition:
      "STR（Suspicious Transaction Report）指发现可疑交易或行为后，由 MLRO 依属地规则向金融情报机构/主管机关提交的报告。是否上报由 MLRO 独立判断，严禁向客户通风报信（tipping-off）。",
    commonMistakes: ["向客户透露已提交 STR（构成 tipping-off）"],
    related: ["aml", "mlro", "edd"],
    aliases: ["Suspicious Transaction Report"],
  },
  {
    id: "pep",
    en: "PEP",
    zh: "政治公众人物",
    category: "aml",
    brief: "担任重要公职或与之有密切关系的高风险自然人。",
    definition:
      "PEP（Politically Exposed Person）指现任或曾任重要公职的人员及其家庭成员、密切关联人，因职权易涉腐败与洗钱风险。PEP 通常触发 EDD、管理层审批与持续监控。",
    commonMistakes: ["卸任多年即视为非 PEP（通常仍有风险期）"],
    related: ["edd", "sanctions", "adverse-media", "aml"],
    aliases: ["Politically Exposed Person"],
  },
  {
    id: "sanctions",
    en: "Sanctions Screening",
    zh: "制裁名单筛查",
    category: "aml",
    brief: "将客户与制裁/黑名单比对以拦截违规交易。",
    definition:
      "制裁筛查指将投资人及其受益所有人、关联方与联合国、OFAC、EU、属地等制裁名单比对，识别被制裁主体或禁运情形；命中结果通常需升级合规复核并冻结/拒绝相关操作。",
    commonMistakes: ["只筛查自然人主证件，漏掉机构或 UBO 层"],
    related: ["aml", "pep", "adverse-media"],
  },
  {
    id: "adverse-media",
    en: "Adverse Media",
    zh: "负面媒体报道审查",
    category: "aml",
    brief: "检索公开报道中与客户相关的负面信息。",
    definition:
      "Adverse Media 指通过权威媒体与公开信息源检索客户是否存在涉洗钱、欺诈、制裁、腐败等负面报道，作为风险评级与 EDD 触发的参考依据；命中信息应核实关联度并留档。",
    commonMistakes: ["仅凭同名误报即拒绝客户，未核实主体同一性"],
    related: ["aml", "pep", "sanctions"],
  },
  {
    id: "mlro",
    en: "MLRO",
    zh: "洗钱申报官（Money Laundering Reporting Officer）",
    category: "aml",
    brief: "负责接收与上报可疑交易报告的高管。",
    definition:
      "MLRO 是机构指定的反洗钱负责人，负责接收内部可疑交易线索、独立评估并决定是否向主管机关提交 STR，同时维护反洗钱制度与培训。发现可疑事项应及时通知 MLRO，不得擅自处理。",
    commonMistakes: ["一线人员自行判断不报，绕过 MLRO 流程"],
    related: ["aml", "str", "edd"],
    aliases: ["Money Laundering Reporting Officer"],
  },
  {
    id: "risk-based-approach",
    en: "Risk-Based Approach",
    zh: "风险为本方法",
    category: "aml",
    brief: "按客户风险高低配置尽调强度的原则。",
    definition:
      "RBA（Risk-Based Approach）要求机构先评估客户、地域、产品与渠道风险，再对高风险客户投入更多尽调与监控资源、对低风险客户避免过度负担，是 AML/CDD 制度设计的核心原则。",
    commonMistakes: ["低风险客户也做全套 EDD，资源错配"],
    related: ["cdd", "edd", "aml"],
    aliases: ["Risk Based Approach"],
  },

  /* ============================== Fund Structure ============================== */
  {
    id: "gp",
    en: "GP",
    zh: "普通合伙人",
    category: "structure",
    brief: "有限合伙中执行管理、承担无限责任的合伙人。",
    definition:
      "GP（General Partner）是有限合伙基金中的执行角色：负责基金运营与投资管理，对外代表合伙，承担无限责任；常为管理人控制的实体。与承担有限责任、不参与日常经营的 LP 相对。",
    commonMistakes: ["把 GP 与 Investment Manager 混为一谈（角色与文件依据不同）"],
    related: ["lp", "limited-partnership", "investment-manager"],
    aliases: ["General Partner"],
  },
  {
    id: "lp",
    en: "LP",
    zh: "有限合伙人",
    category: "structure",
    brief: "有限合伙中出资并承担有限责任的投资人。",
    definition:
      "LP（Limited Partner）是有限合伙基金的主要出资人：以其承诺出资额为限承担责任，一般不参与日常管理，享有收益分配与信息权。多数境外私募基金的投资人均以 LP 身份入伙。",
    commonMistakes: ["LP 参与日常管理导致责任穿透（有限责任失效风险）"],
    related: ["gp", "limited-partnership", "commitment"],
    aliases: ["Limited Partner"],
  },
  {
    id: "limited-partnership",
    en: "Limited Partnership",
    zh: "有限合伙",
    category: "structure",
    brief: "由 GP 与 LP 组成的合伙法律载体。",
    definition:
      "Limited Partnership 是私募基金常用的法律载体（如 Cayman ELP、BVI LP）：GP 执行管理并承担无限责任，LP 出资并承担有限责任。基金文件与名册以合伙协议（LPA）与有限合伙登记为准。",
    commonMistakes: ["按公司思维套用股东/董事会概念处理合伙治理"],
    related: ["gp", "lp", "lpa"],
  },
  {
    id: "master-fund",
    en: "Master Fund",
    zh: "主基金（投资层）",
    category: "structure",
    brief: "Master-Feeder 结构中实际持有资产的投资主体。",
    definition:
      "Master Fund 是 Master-Feeder 结构中的上层投资主体：Feeder 基金将募集资金投入 Master，由 Master 统一进行投资，便于多个 Feeder 共享同一投资组合、摊薄成本并满足不同辖区投资人的税务与准入需求。",
    commonMistakes: ["把 Feeder 投资人直接登记为 Master 投资人（名册层级混淆）"],
    related: ["feeder-fund", "spv", "fund-administrator"],
  },
  {
    id: "feeder-fund",
    en: "Feeder Fund",
    zh: "联接基金（募集层）",
    category: "structure",
    brief: "向投资人募集并把资金投入主基金的载体。",
    definition:
      "Feeder Fund 是 Master-Feeder 结构中的募集主体：面向特定辖区或特定投资人（如美国税务敏感投资人）募集资金，再以 LP/股东身份投资 Master Fund。投资人 KYC 与名册通常登记于 Feeder 层。",
    commonMistakes: ["Feeder 层完成募集后遗漏向 Master 层的转账时效与名册同步"],
    related: ["master-fund", "subscription", "investor-register"],
  },
  {
    id: "spv",
    en: "SPV",
    zh: "特殊目的载体",
    category: "structure",
    brief: "为持有资产或隔离风险设立的专门载体。",
    definition:
      "SPV（Special Purpose Vehicle）是为特定目的（如持有某项资产、隔离风险、便利共同投资）设立的法律实体。基金结构中的 SPV 常由基金全资持有，其股东/受益人链条仍须穿透至最终 UBO。",
    commonMistakes: ["以 SPV 为名义主体规避 UBO 穿透披露"],
    related: ["ubo", "master-fund", "feeder-fund"],
    aliases: ["Special Purpose Vehicle"],
  },
  {
    id: "investment-manager",
    en: "Investment Manager",
    zh: "投资管理人",
    category: "structure",
    brief: "依投资管理协议负责基金投资决策的主体。",
    definition:
      "Investment Manager 依据投资管理协议（IMA）及授权范围对基金资产行使投资裁量权，向基金收取管理费。在合伙结构中其角色与 GP 可分离：GP 负责治理与对外责任，Manager 专注投资运营。",
    commonMistakes: ["把 GP / Manager / Fund Administrator 视为同一主体"],
    related: ["gp", "fund-administrator", "limited-partnership"],
  },
  {
    id: "fund-administrator",
    en: "Fund Administrator",
    zh: "基金行政管理人",
    category: "structure",
    brief: "提供基金行政与运营支持的服务机构（Fund Admin）。",
    definition:
      "Fund Administrator 依服务协议为基金提供运营支持：投资人接纳与 KYC/AML、认购与赎回处理、投资人名册维护、NAV 复核/计算支持、费用核算与报表等。Fund Admin 视角下，签署认购、AML/KYC、接纳、收款与名册更新各环节不当然等同。",
    commonMistakes: [
      "把 Fund Admin 当作投资决策方（其职责为行政执行与把关）",
      "认购环节只收文件不校验签署主体与资金路径一致性",
    ],
    related: ["investment-manager", "nav", "investor-register", "kyc"],
    aliases: ["Fund Admin", "Administrator"],
  },
  {
    id: "unit-trust",
    en: "Unit Trust",
    zh: "单位信托",
    category: "structure",
    brief: "由受托人持有资产、投资人持有单位的信托载体。",
    definition:
      "Unit Trust 是基金常用载体之一：受托人（Trustee）持有基金资产，投资人通过持有“单位”享有权益，管理人负责投资运作。治理与称谓（受托人/管理人/单位持有人）与公司型、合伙型基金不同。",
    commonMistakes: ["沿用公司型基金的名册/称谓处理单位信托"],
    related: ["trustee", "fund-administrator"],
  },
  {
    id: "trustee",
    en: "Trustee",
    zh: "受托人（信托结构的受托人）",
    category: "structure",
    brief: "为受益人持有与管理信托财产的主体。",
    definition:
      "Trustee 依信托契约为受益人持有并管理信托财产。当 Trustee 代表信托认购基金时，认购主体通常体现为“受托人 as trustee for 某信托”；Fund Admin 需据此判断真正的认购与投资主体，并以 AML Letter 等覆盖底层信托。",
    commonMistakes: [
      "只认 Trust 名称而不看 SA 签署方与资金账户归属",
      "把受托人架构下的 KYC 直接等同于 Trust 本身 KYC",
    ],
    related: ["unit-trust", "aml-letter", "ubo"],
  },

  /* ============================== Fund Documents ============================== */
  {
    id: "ppm",
    en: "PPM",
    zh: "私募配售备忘录",
    category: "documents",
    brief: "向潜在投资人披露基金条款与风险的发售文件。",
    definition:
      "PPM（Private Placement Memorandum，或 Offering Memorandum）是私募基金发售的核心披露文件：载明投资策略、费用、风险因素、赎回限制与基金条款。认购文件须与 PPM 条款一致，变更需按约定程序处理。",
    commonMistakes: ["PPM 条款与 LPA/SA 不一致时未按文件优先级处理"],
    related: ["subscription-agreement", "lpa", "constitutional-documents"],
    aliases: ["Offering Memorandum"],
  },
  {
    id: "subscription-agreement",
    en: "Subscription Agreement",
    zh: "认购协议",
    category: "documents",
    brief: "投资人申请认购并承诺遵守基金条款的协议。",
    definition:
      "Subscription Agreement（SA）是投资人申请认购基金份额/权益的文件，通常含认购金额、投资人陈述与保证、AML 声明等。Fund Admin 审阅 SA 时应确认签署主体与汇款主体一致，并据以识别真正的法律投资人。",
    commonMistakes: [
      "不看 SA 签署方，仅凭底层 Trust/公司名称登记投资人",
      "签署主体与汇款账户不一致时未要求澄清或修改",
    ],
    related: ["ppm", "application-form", "investor-register", "kyc"],
    aliases: ["SA"],
  },
  {
    id: "lpa",
    en: "LPA",
    zh: "有限合伙协议",
    category: "documents",
    brief: "规范有限合伙内部权利义务的核心协议。",
    definition:
      "LPA（Limited Partnership Agreement）约定 GP 与 LP 的权利义务、出资与分配、转让与赎回、治理与解散等事项，是有限合伙型基金最核心的文件之一。LPA 与 PPM/SA 条款冲突时的适用顺序应按文件约定判断。",
    commonMistakes: ["LP 权益转让不核对 LPA 的转让限制与 GP 同意要求"],
    related: ["limited-partnership", "ppm", "gp", "transfer"],
    aliases: ["Limited Partnership Agreement"],
  },
  {
    id: "side-letter",
    en: "Side Letter",
    zh: "补充函",
    category: "documents",
    brief: "基金与个别投资人单独约定的特殊条款文件。",
    definition:
      "Side Letter 是基金（通常经 GP/管理人）与特定投资人单独签署的补充文件，授予费率优惠、报告安排或最惠国待遇等差异化条款。Fund Admin 需登记并跟踪其影响，避免与其他投资人条款冲突。",
    commonMistakes: ["收到 Side Letter 未登记跟踪，后续执行/披露遗漏"],
    related: ["ppm", "subscription-agreement", "lpa"],
  },
  {
    id: "application-form",
    en: "Application Form",
    zh: "申购/认购申请表",
    category: "documents",
    brief: "载明投资人认购意向与基本信息的表单。",
    definition:
      "Application Form 是投资人表达认购意向并填写基本信息的表单，通常与 SA 一并使用，作为 KYC 启动与投资人信息采集的入口。Fund Admin 据此建立档案并核对 AML 声明与税务身份信息。",
    commonMistakes: ["把 Application Form 视为已完成 KYC 的证据"],
    related: ["subscription-agreement", "subscription", "kyc"],
  },
  {
    id: "redemption-request",
    en: "Redemption Request",
    zh: "赎回申请",
    category: "documents",
    brief: "投资人申请赎回其基金权益的文件/指令。",
    definition:
      "Redemption Request 是投资人按基金条款提交的赎回指令，须核对提交时限、签名/认证要求、锁定期与赎回价格计算基准（常以赎回日 NAV 为准）。逾期或不合规申请应按 PPM 约定处理并留存记录。",
    commonMistakes: ["未校验赎回截止时间与授权签署，导致误接受逾期指令"],
    related: ["redemption", "nav", "subscription-agreement"],
    aliases: ["Redemption Form"],
  },
  {
    id: "closing-checklist",
    en: "Closing Checklist",
    zh: "交割核对清单",
    category: "documents",
    brief: "新投资人入伙/交割前逐项核对的清单。",
    definition:
      "Closing Checklist 用于首次交割或新增投资人入伙前逐项确认：KYC/AML 完成、SA 签署、资金到账、董事会/GP 接纳决议、名册更新与税务表格齐备等，确保接纳动作有据可依、不留尾巴。",
    commonMistakes: ["资金到账即登记名册，跳过接纳决议与 KYC 闭环"],
    related: ["subscription-agreement", "kyc", "investor-register"],
    aliases: ["Closing Documents"],
  },
  {
    id: "constitutional-documents",
    en: "Constitutional Documents",
    zh: "章程性文件",
    category: "documents",
    brief: "规定法律载体内部治理的根本文件。",
    definition:
      "Constitutional Documents 指规定基金载体组织与治理的文件：公司型为章程（Memorandum & Articles）、合伙型为 LPA、信托型为信托契据。接纳投资人、授权签署等动作均须与其及董事会/GP 决议一致。",
    commonMistakes: ["仅看协议不看章程性文件的授权与决议要求"],
    related: ["ppm", "lpa"],
    aliases: ["Governing Documents"],
  },

  /* ============================== Operations ============================== */
  {
    id: "commitment",
    en: "Commitment",
    zh: "承诺出资额",
    category: "operations",
    brief: "LP 承诺向基金提供的最大出资总额。",
    definition:
      "Commitment 是 LP 在认购时承诺出资的总额上限，构成后续 Capital Call 的依据。随着出资被催缴并缴付，Unfunded Commitment 相应减少；承诺额与分配/回报计算（如收益分成门槛）密切相关。",
    commonMistakes: ["把已实缴出资与承诺出资混记（名册与会计口径错误）"],
    related: ["capital-call", "unfunded-commitment", "distribution", "lp"],
  },
  {
    id: "capital-call",
    en: "Capital Call",
    zh: "资本催缴通知",
    category: "operations",
    brief: "管理人按需向 LP 发出的缴付出资通知。",
    definition:
      "Capital Call（出资催缴）由 GP/管理人依基金协议向 LP 发出，要求其在约定期限内缴付通知载明的出资款项，用于投资、费用与储备。Fund Admin 负责核对通知要素、收款与投资人账目更新。",
    commonMistakes: [
      "未核对 Capital Call 是否在承诺额与协议期限内",
      "收款后未及时同步名册/账务，出现 Shortfall",
    ],
    related: ["commitment", "contribution", "unfunded-commitment"],
    aliases: ["Drawdown Notice"],
  },
  {
    id: "contribution",
    en: "Contribution",
    zh: "出资缴付",
    category: "operations",
    brief: "LP 依 Capital Call 实际缴付的出资款项。",
    definition:
      "Contribution 指 LP 根据 Capital Call 实际缴付的资金（实缴资本）。基金收款后需核对到账主体、金额与通知一致，更新投资人实缴记录并据以计算分配与费用基数。",
    commonMistakes: ["缴付方与 LP 名称不一致时未要求澄清（第三方代付风险）"],
    related: ["capital-call", "commitment", "unfunded-commitment"],
  },
  {
    id: "unfunded-commitment",
    en: "Unfunded Commitment",
    zh: "未催缴承诺额",
    category: "operations",
    brief: "承诺出资额中尚未被催缴的部分。",
    definition:
      "Unfunded Commitment 是 LP 承诺额扣除已催缴部分的余额，代表未来可能被催缴的出资义务，是基金流动性管理、投资人报告与风险披露的关键数字。",
    commonMistakes: ["计算时遗漏已催缴未到账部分，余额口径偏差"],
    related: ["commitment", "capital-call", "contribution"],
  },
  {
    id: "distribution",
    en: "Distribution",
    zh: "收益分配",
    category: "operations",
    brief: "基金向投资人进行的现金或实物分配。",
    definition:
      "Distribution 是基金将投资收益、退出所得或可分配现金按协议（含 waterfall/收益分成规则）向投资人分配的动作。Fund Admin 依序核对分配计算、代扣与通知，确保金额与记录一致。",
    commonMistakes: ["不按 waterfall 次序与费用核算直接分配"],
    related: ["commitment", "nav", "redemption"],
  },
  {
    id: "nav",
    en: "NAV",
    zh: "资产净值",
    category: "operations",
    brief: "基金资产减负债后的净值（每单位价格基准）。",
    definition:
      "NAV（Net Asset Value）是基金资产总值扣除负债后的净值，除以发行在外份额即得每单位 NAV，是认购、赎回、分配与估值报告的基准。行政管理人通常独立复核或计算 NAV，确保与投资经理口径一致。",
    commonMistakes: ["混淆总资产与净资产，或未扣未实现费用/负债"],
    related: ["fund-administrator", "distribution", "capital-call", "valuation"],
    aliases: ["Net Asset Value"],
  },
  {
    id: "investor-register",
    en: "Investor Register",
    zh: "投资人名册",
    category: "operations",
    brief: "记录投资人及其份额/权益变动的官方名册。",
    definition:
      "Investor Register（成员/有限合伙人/单位持有人名册）是基金权益归属的权威记录，登记投资人身份、认购/实缴/赎回与转让信息。Fund Admin 须在接纳、转让、赎回后及时更新名册，并据此出具投资人记录与报告。",
    commonMistakes: [
      "名册更新滞后于资金与协议事实",
      "转让未核对受让方 KYC 即改册",
    ],
    related: ["subscription", "transfer", "fund-administrator", "ubo"],
    aliases: ["Register of Members"],
  },
  {
    id: "subscription",
    en: "Subscription",
    zh: "认购",
    category: "operations",
    brief: "投资人申请并获得基金权益的过程。",
    definition:
      "Subscription 指投资人依 SA 申请认购基金权益并被接纳的过程，涵盖文件签署、KYC/AML 完成、资金缴付与名册登记。Fund Admin 通常以接纳为节点，串起法律、合规与资金三条线。",
    commonMistakes: ["把资金到账当作认购完成（遗漏接纳决议与名册）"],
    related: ["subscription-agreement", "redemption", "commitment"],
  },
  {
    id: "redemption",
    en: "Redemption",
    zh: "赎回",
    category: "operations",
    brief: "投资人按条款退出并收回权益对价的过程。",
    definition:
      "Redemption 指投资人按基金文件（频率、提前通知期、锁定期与门槛）申请赎回全部或部分权益，基金以赎回日 NAV 计算对价并支付。逾期或超限赎回须按 PPM/LPA 规则处理。",
    commonMistakes: ["赎回估值日与支付日错配，或忽略 Gate/锁定期限制"],
    related: ["subscription", "redemption-request", "nav"],
  },
  {
    id: "transfer",
    en: "Transfer",
    zh: "基金权益转让",
    category: "operations",
    brief: "投资人将其基金权益转让给第三方的行为。",
    definition:
      "Transfer 指投资人依基金文件转让其权益/份额。Fund Admin 需核对转让是否符合协议限制（GP/LP 同意、优先受让权）、受让方 KYC/AML 是否完成，并及时更新名册与 CRS/FATCA 记录。",
    commonMistakes: ["未完成受让方 KYC 即办理名册变更"],
    related: ["investor-register", "ubo", "subscription", "lpa"],
  },
  {
    id: "custody",
    en: "Custody",
    zh: "资产托管",
    category: "operations",
    brief: "独立托管人持有并保管基金资产的安排。",
    definition:
      "Custody 指基金资产由独立托管人（或主经纪商等）持有保管，以隔离风险并提供资产安全网。资产净值核算须以托管/经纪对账为基础，Fund Admin 关注对账差异与资产隔离安排。",
    commonMistakes: ["净值核算不依赖托管/经纪对账，出现差异未追踪"],
    related: ["fund-administrator", "nav", "contribution"],
  },
  {
    id: "valuation",
    en: "Valuation",
    zh: "估值",
    category: "operations",
    brief: "对基金资产与负债进行定价核算的过程。",
    definition:
      "Valuation 指按基金文件与估值政策对持仓资产定价并核算 NAV 的过程，涉及流动性不足资产、另类资产的估值方法与第三方定价源。估值结果直接影响认购/赎回价格与费用。",
    commonMistakes: ["对无活跃市场的资产采用单一不可靠价格且无交叉验证"],
    related: ["nav", "fund-administrator", "distribution"],
  },
];

/** 术语 id → 定义 */
export function getTerm(id: string): GlossaryTerm | undefined {
  return GLOSSARY_TERMS.find((t) => t.id === id);
}

/* ================================================================
 * 自动识别（client/server 通用，纯函数）
 * ================================================================ */

export interface TermMatchPattern {
  termId: string;
  /** 参与匹配的文本（含别名，按长度降序，长的先命中） */
  patterns: string[];
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 每个术语的可匹配文本（en + aliases，去重） */
export const GLOSSARY_MATCHABLES: TermMatchPattern[] = GLOSSARY_TERMS.map((t) => {
  const set = new Set<string>([t.en, ...(t.aliases ?? [])].filter((s) => s && s.trim().length > 0));
  return {
    termId: t.id,
    patterns: [...set].sort((a, b) => b.length - a.length),
  };
});

/** 术语 → 匹配文本 查找（命中文本反查术语 id，冲突时取词表靠前者） */
const MATCH_TEXT_TO_ID: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const entry of GLOSSARY_MATCHABLES) {
    for (const p of entry.patterns) {
      if (!m.has(p.toLowerCase())) m.set(p.toLowerCase(), entry.termId);
    }
  }
  return m;
})();

/** 全局识别正则（词边界：左右不为字母/数字，避免长词内误链） */
export const GLOSSARY_PATTERN: RegExp = (() => {
  const alts: string[] = [];
  for (const entry of GLOSSARY_MATCHABLES) alts.push(...entry.patterns);
  const sorted = [...alts].sort((a, b) => b.length - a.length);
  return new RegExp(`(?<![A-Za-z0-9])(?:${sorted.map(escapeRegExp).join("|")})(?![A-Za-z0-9])`, "gi");
})();

export interface TermSegment {
  text: string;
  termId?: string;
}

/** 把一段文本切成 普通文本 + 术语 片段（术语按词表最长优先匹配） */
export function annotateSegments(text: string): TermSegment[] {
  if (!text) return [{ text: "" }];
  const out: TermSegment[] = [];
  GLOSSARY_PATTERN.lastIndex = 0;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = GLOSSARY_PATTERN.exec(text)) !== null) {
    const start = m.index;
    const matched = m[0];
    if (start > cursor) out.push({ text: text.slice(cursor, start) });
    const termId = MATCH_TEXT_TO_ID.get(matched.toLowerCase());
    out.push({ text: matched, termId });
    cursor = start + matched.length;
    if (matched.length === 0) GLOSSARY_PATTERN.lastIndex += 1; // 防御空匹配
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}

/** 一段文本命中的去重术语 id 列表（使用索引扫描用） */
export function findTermMatches(text: string): string[] {
  const ids = new Set<string>();
  for (const seg of annotateSegments(text)) {
    if (seg.termId) ids.add(seg.termId);
  }
  return [...ids];
}

/** 全部术语命中数统计辅助（供 /glossary 列表头部） */
export const GLOSSARY_COUNT = GLOSSARY_TERMS.length;

export function glossaryCategoryCounts(): Record<GlossaryCategory, number> {
  const counts = { kyc: 0, aml: 0, structure: 0, documents: 0, operations: 0 };
  for (const t of GLOSSARY_TERMS) counts[t.category] += 1;
  return counts;
}

/* ================================================================
 * 使用索引类型（纯数据，client / server 通用）
 * glossary-usage.ts（server）负责扫描计算；Drawer / 详情页消费此结构。
 * ================================================================ */

/** 一个术语在一门课里命中的模块（用于带锚点跳转） */
export interface TermLessonModuleRef {
  id: string;
  title: string;
}

export interface TermLessonRef {
  id: string;
  slug: string;
  title: string;
  modules: TermLessonModuleRef[];
}

export interface TermCaseRef {
  id: string;
  slug: string;
  title: string;
}

export interface TermUsage {
  lessons: TermLessonRef[];
  cases: TermCaseRef[];
}

export type GlossaryUsageMap = Record<string, TermUsage>;
