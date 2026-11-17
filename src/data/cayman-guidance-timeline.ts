/**
 * 开曼群岛 CIMA 监管指引 & 细则历史沿革（数据层）
 *
 * 与「法规（Law）历史沿革」互补：本板块聚焦 CIMA 发布的
 * Rules（约束性规则）/ Regulations（实施细则）/ Guidance Notes（指引说明）/
 * Statement of Guidance（指引声明）等监管文件。
 *
 * 来源：CIMA（cima.ky）官方文件库、legislation.gov.ky、gov.ky。
 */
export interface CaymanGuidanceMilestone {
  id: string;
  year: number;
  name: string;
  zh: string;
  type: "Rule 规则" | "Regulation 细则" | "Guidance Notes 指引" | "Statement of Guidance 指引声明";
  highlight: "反洗钱" | "基金" | null;
  summary: string;
  details: {
    points: string[];
    impact: string;
    keyItems?: string[];
  };
  url: string;
  tags: string[];
}

export const CAYMAN_GUIDANCE_TIMELINE: CaymanGuidanceMilestone[] = [
  {
    id: "aml-regulations-2023",
    year: 2023,
    name: "Anti-Money Laundering Regulations (2023 Revision)",
    zh: "反洗钱条例（2023 修订）",
    type: "Regulation 细则",
    highlight: "反洗钱",
    summary:
      "开曼反洗钱 / 反恐怖融资 / 反扩散融资（AML/CFT/CPF）的核心法源，落实 FATF 40 项建议，适用于所有受监管实体。",
    details: {
      points: [
        "落实 FATF 40 项建议，覆盖客户尽调（CDD）、政治公众人物（PEP）、可疑交易报告（STR）等",
        "定义「相关金融业务」（Relevant Financial Business），圈定适用主体",
        "确立 AMLCO / MLRO / Deputy MLRO 等反洗钱岗位与职责",
      ],
      impact:
        "Fund Admin 在客户准入、持续监测、可疑交易上报等环节的直接法源；AMLRs 是 KYC/EDD/SDD 义务的最终依据，违规可被 CIMA 处以最高 CI$100 万行政罚款。",
      keyItems: ["AMLCO / MLRO 岗位", "CDD / EDD / SDD", "STR 可疑交易报告"],
    },
    url: "https://www.cima.ky/upimages/lawsregulations/Anti-MoneyLaunderingRegulations2023Revision_1673895715.PDF",
    tags: ["反洗钱", "AML", "CIMA"],
  },
  {
    id: "aml-guidance-notes-2023",
    year: 2023,
    name: "Guidance Notes on the Prevention and Detection of ML/TF/PF (August 2023)",
    zh: "反洗钱 / 反恐融资 / 反扩散融资指引说明（2023-08）",
    type: "Guidance Notes 指引",
    highlight: "反洗钱",
    summary:
      "CIMA 依据《货币管理局法》第 34 条发布的 AML/CFT/CPF 指引，将 AMLRs 的要求细化为可操作的最低标准与最佳实践。",
    details: {
      points: [
        "细化合规计划、风险评估（风险为本方法）、客户尽调、持续监测等环节的操作要求",
        "覆盖制裁合规、反扩散融资、电汇身份识别、代理行等专项",
        "2023-08 版整合 e-KYC 与远程 CDD 条款，明确数字身份技术的应用",
      ],
      impact:
        "Fund Admin 搭建 AML 内控制度、编写反洗钱手册、设计风险评级模型的「操作手册」；CIMA 现场检查与执法时以此作为合规基准。",
      keyItems: ["风险为本方法", "e-KYC / 远程 CDD", "制裁合规"],
    },
    url: "https://www.cima.ky/upimages/commonfiles/GuidanceNotesonPreventionandDetectionofML-TF-PF-August2023_1693586227.pdf",
    tags: ["反洗钱", "AML", "指引"],
  },
  {
    id: "corp-governance-rule-2023",
    year: 2023,
    name: "Rule on Corporate Governance + Statement of Guidance for Mutual Funds and Private Funds",
    zh: "公司治理规则 + 共同/私募基金公司治理指引声明（2023）",
    type: "Rule 规则",
    highlight: "基金",
    summary:
      "CIMA 2023 年发布，要求所有受监管实体（含共同基金、私募基金）建立并维持公司治理框架，为基金治理机构设定最低标准。",
    details: {
      points: [
        "要求治理机构建立、实施并维持公司治理框架（含目标战略、风险内控、利益冲突、薪酬、报告等）",
        "首次将「私募基金」纳入公司治理规则的适用范围（此前仅覆盖部分实体）",
        "配套 SOF 指引声明，帮助共同/私募基金理解并落地规则",
      ],
      impact:
        "Fund Admin 需协助基金客户起草《公司治理手册》、利益冲突政策、董事会会议记录等；治理框架缺失可被 CIMA 直接执法（最高 US$122 万/违规）。",
      keyItems: ["公司治理手册", "利益冲突政策", "董事会集体责任"],
    },
    url: "https://www.cima.ky/upimages/priorconsultation/App.2SOG-CorporateGovernanceforMutualFundsandPrivateFunds_1660944453_1672931992.pdf",
    tags: ["公司治理", "基金", "Rule"],
  },
  {
    id: "private-funds-regulations-2020",
    year: 2020,
    name: "Private Funds Regulations, 2020",
    zh: "私募基金细则（2020）",
    type: "Regulation 细则",
    highlight: "基金",
    summary:
      "《私募基金法 2020》的配套实施细则，规定私募基金的注册、年度审计、估值、现金监管、记录保存等具体义务。",
    details: {
      points: [
        "规定私募基金的注册申请、费用、年度申报与审计要求",
        "要求基金资产估值、现金监管由独立第三方履行（或独立于投资管理并披露冲突）",
        "持续持有证券的基金须保存 ISIN 等证券识别码记录",
      ],
      impact:
        "Fund Admin 为私募基金办理 CIMA 注册、年度审计、NAV 计算、资产托管安排时的操作依据；估值与现金监管的独立性要求直接影响基金运营架构设计。",
      keyItems: ["年度审计", "NAV 估值独立性", "现金监管"],
    },
    url: "https://www.cima.ky/upimages/commonfiles/PrivateFundsRegulations2020_1581526299.PDF",
    tags: ["私募基金", "细则", "CIMA"],
  },
  {
    id: "mutual-funds-regulations-2020",
    year: 2020,
    name: "Mutual Funds (Amendment) Regulations, 2020",
    zh: "共同基金（修正）细则（2020）",
    type: "Regulation 细则",
    highlight: "基金",
    summary:
      "配套《共同基金法 2020 修订》，规定原 Section 4(4) 基金（Limited Investor Funds）的注册与合规细则。",
    details: {
      points: [
        "落实 Section 4(4) 基金（≤15 名投资者）的注册义务与过渡安排",
        "规定注册申请材料、年费、年度审计与周年申报要求",
        "明确审计账目须按 IFRS 或美/日/瑞士等认可会计准则编制",
      ],
      impact:
        "Fund Admin 排查存量「少数投资者」共同基金是否落入新注册义务，并在过渡期内完成注册、审计与年费缴纳。",
      keyItems: ["Limited Investor Funds", "年度审计 + 周年申报", "认可会计准则"],
    },
    url: "https://www.cima.ky/upimages/commonfiles/MutualFundsLaw2020Revision_1579812846.pdf",
    tags: ["共同基金", "细则", "CIMA"],
  },
  {
    id: "aml-compliance-rule-2026",
    year: 2026,
    name: "Rule on Effective Compliance Programme for the Prevention and Detection of ML/TF/PF",
    zh: "AML 有效合规计划规则（2026）",
    type: "Rule 规则",
    highlight: "反洗钱",
    summary:
      "CIMA 2026-09-18 生效，将原先非约束性的 AML 指引升级为约束性规则，强制 FSP 建立五大要素的合规计划。",
    details: {
      points: [
        "强制合规计划包含五要素：AMLCO 任命、书面政策程序、风险为本框架、持续培训、独立审计有效性评估",
        "要求 CDD、记录保存（至少 5 年）、外包尽调与报备",
        "违反规则可被执法，AMLCO 可能承担个人责任",
      ],
      impact:
        "Fund Admin 须评估自身合规计划是否满足五要素，尤其独立审计职能与 AMLCO 独立性；外包合规职能须尽调并通知 CIMA。",
      keyItems: ["合规计划五要素", "独立审计职能", "外包报备"],
    },
    url: "https://www.cima.ky/upimages/priorconsultation/EffectiveComplianceProgramme-AmalgamatedFeedbackStatement_1783954838.pdf",
    tags: ["反洗钱", "AML", "Rule"],
  },
  {
    id: "sanctions-rule-2026",
    year: 2026,
    name: "Rule on Compliance with Financial Sanctions and Targeted Financial Sanctions",
    zh: "金融制裁合规规则（2026）",
    type: "Rule 规则",
    highlight: "反洗钱",
    summary:
      "CIMA 2026-09-18 生效，将制裁合规要求升级为约束性规则，强制 FSP 建立制裁筛查与定向金融制裁合规机制。",
    details: {
      points: [
        "强制 FSP 建立金融制裁与定向金融制裁（TFS）的筛查、冻结、报告机制",
        "与 AML Compliance Rule 同日生效，共同构成反金融犯罪合规支柱",
        "违规可被执法，需结合 AML 合规计划一体化实施",
      ],
      impact:
        "Fund Admin 须将制裁名单筛查（联合国/OFAC/UK 等）嵌入开户与持续监测流程，并建立冻结资产与向 CIMA 报告的制度。",
      keyItems: ["制裁筛查", "资产冻结", "TFS 定向金融制裁"],
    },
    url: "https://www.cima.ky/upimages/priorconsultation/EffectiveComplianceProgramme-AmalgamatedFeedbackStatement_1783954838.pdf",
    tags: ["制裁", "反洗钱", "Rule"],
  },
  {
    id: "outsourcing-sog-2023",
    year: 2023,
    name: "Statement of Guidance on Outsourcing (2023)",
    zh: "外包指引声明（2023）",
    type: "Statement of Guidance 指引声明",
    highlight: "基金",
    summary:
      "CIMA 对受监管基金将实质性职能（含 AML 合规）外包给服务商（如基金行政管理人）的治理要求。",
    details: {
      points: [
        "明确外包实质性职能（含 AML 合规、NAV、会计）须尽调服务商并签订书面协议",
        "要求外包安排可被 CIMA 审查，基金最终责任不因外包而免除",
        "2023 版更新，纳入对服务商持续监督与退出安排",
      ],
      impact:
        "Fund Admin 作为被委托的行政服务商，须配合基金客户满足 SOG 的外包治理要求——协议条款、可审计性、CIMA 可查性是承接业务的关键。",
      keyItems: ["外包尽调", "书面协议", "基金最终责任"],
    },
    url: "https://www.cima.ky/upimages/commonfiles/GuidanceNotesonPreventionandDetectionofML-TF-PF-August2023_1693586227.pdf",
    tags: ["外包", "基金", "指引"],
  },
];

export const CAYMAN_GUIDANCE_TAGS: string[] = [
  ...new Set(CAYMAN_GUIDANCE_TIMELINE.flatMap((m) => m.tags)),
];
