/**
 * 开曼核心法规 · 条款级中英对照（数据层）
 *
 * 与「法规沿革时间轴」（cayman-law-timeline.ts / cayman-guidance-timeline.ts）互补：
 * 时间轴负责「演变脉络」，本文件负责「现行文本精读」——对 Fund Admin 日常实务
 * 最重要的几部核心法规，提供条款级英文原文 + 中文译注 + 关联术语，实现
 * 「法规原文 ↔ 术语库」双向知识关联。
 *
 * ⚠️ 内容口径：
 *  - 英文原文取自 CIMA / legislation.gov.ky / ciregistry.ky 官方文本；
 *  - 中文为**学习译注**（非官方翻译），以帮助理解为主，不可作为法律意见；
 *  - `terms` 关联的是 `src/data/glossary/*.ts` 中的术语 id（由 check-glossary 校验断链）。
 */

export type CaymanLawProvision = {
  /** 条款引用，如 "s. 5(1)" */
  ref: string;
  /** 条款英文原文（节选，保留关键语义） */
  en: string;
  /** 中文译注 */
  zh: string;
  /** 关联术语 id（点开查看解释） */
  terms?: string[];
};

export type CaymanLawProvisionGroup = {
  /** 分组标题（英文） */
  titleEn: string;
  /** 分组标题（中文） */
  titleZh: string;
  provisions: CaymanLawProvision[];
};

export type CaymanLawDetail = {
  /** 详情 id（URL 用，与时间轴里程碑 id 对应或独立） */
  id: string;
  /** 所属时间轴里程碑 id（用于回链） */
  milestoneId: string;
  /** 法规英文正式名称 */
  nameEn: string;
  /** 法规中文名 */
  nameZh: string;
  /** 法规形态（与时间轴口径一致） */
  kind: "主法" | "修订" | "合并修订版" | "Rule 规则" | "Regulation 细则";
  /** 生效 / 最近修订年份 */
  year: number;
  /** 高亮主题 */
  highlight: "反洗钱" | "基金" | null;
  /** 一句话简介 */
  summary: string;
  /** 对 Fund Admin 的一句话提示 */
  faNote: string;
  /** 官方文本链接 */
  url: string;
  /** 法规关联术语（整部法规层面的核心术语 id） */
  relatedTerms: string[];
  /** 条款级中英对照分组（完整对照版，逐条英文原文 + 中文译注） */
  groups: CaymanLawProvisionGroup[];
  /**
   * 简化版分组（可选）：速览口径的归纳条目，与 `groups` 完整版并存。
   * 详情页据此渲染「简化版 / 完整对照版」切换。
   */
  summaryGroups?: CaymanLawProvisionGroup[];
};

export const CAYMAN_LAW_DETAILS: CaymanLawDetail[] = [
  /* ================================================================
   * 1. Anti-Money Laundering Regulations (2023 Revision)
   * ================================================================ */
  {
    id: "amlr-2023",
    milestoneId: "aml-regulations-2023",
    nameEn: "Anti-Money Laundering Regulations (2023 Revision)",
    nameZh: "反洗钱条例（2023 修订）",
    kind: "Regulation 细则",
    year: 2023,
    highlight: "反洗钱",
    summary:
      "开曼反洗钱 / 反恐怖融资 / 反扩散融资的核心法源，落实 FATF 40 项建议，适用于所有从事「相关金融业务」的受监管实体。",
    faNote:
      "Fund Admin 客户准入（CDD/EDD/SDD）、持续监测与可疑交易报告的直接法源；违规可被 CIMA 处以最高 CI$100 万行政罚款。",
    url: "https://www.cima.ky/upimages/lawsregulations/Anti-MoneyLaunderingRegulations2023Revision_1673895715.PDF",
    relatedTerms: [
      "aml",
      "aml-cft",
      "cdd",
      "edd",
      "pep",
      "mlro",
      "amlco",
      "str",
      "risk-based-approach",
      "financial-sanctions",
      "sanctions",
    ],
    groups: [
      {
        titleEn: "Application & Relevant Financial Business",
        titleZh: "适用范围与「相关金融业务」",
        provisions: [
          {
            ref: "reg. 3(1)",
            en: "These Regulations apply to a person carrying on relevant financial business in or from the Islands.",
            zh: "本条例适用于在开曼群岛内或从开曼群岛从事「相关金融业务（Relevant Financial Business）」的主体。",
            terms: ["aml"],
          },
          {
            ref: "reg. 5",
            en: "A person carrying on relevant financial business must apply customer due diligence measures in specified circumstances, including when establishing a business relationship.",
            zh: "从事相关金融业务的主体须在特定情形下（包括建立业务关系时）采取客户尽职调查（CDD）措施。",
            terms: ["cdd"],
          },
        ],
      },
      {
        titleEn: "Customer Due Diligence (CDD)",
        titleZh: "客户尽职调查",
        provisions: [
          {
            ref: "reg. 12(1)",
            en: "The verification of a customer's identity must be carried out using reliable, independent source documents, data or information.",
            zh: "客户身份核验须基于「可靠、独立的来源文件、数据或信息」完成。",
            terms: ["cdd", "identity-document"],
          },
          {
            ref: "reg. 12(1)(a)",
            en: "Customer due diligence measures apply when establishing a business relationship; carrying out an occasional transaction; or where there is a suspicion of ML/TF/PF.",
            zh: "CDD 措施适用于：建立业务关系、开展一次性交易，或存在洗钱 / 恐怖融资 / 扩散融资嫌疑的情形。",
            terms: ["cdd", "trigger-event"],
          },
          {
            ref: "reg. 13–15",
            en: "Regulations provide for simplified due diligence (SDD) in lower-risk situations and enhanced due diligence (EDD) in higher-risk situations, including PEPs and non-face-to-face relationships.",
            zh: "条例对低风险情形规定了简化尽调（SDD），对高风险情形（含政治公众人物 PEP、非面对面业务关系）规定了强化尽调（EDD）。",
            terms: ["edd", "pep", "risk-based-approach"],
          },
        ],
      },
      {
        titleEn: "Risk-Based Approach & Country Risk",
        titleZh: "风险为本方法与国别风险",
        provisions: [
          {
            ref: "reg. 8",
            en: "A person must assess the risk of ML/TF/PF considering, among other things, the countries or geographic areas in which customers reside or operate, products and services, and delivery channels.",
            zh: "主体须评估洗钱 / 恐怖融资 / 扩散融资风险，评估维度包括客户居住或经营的国别 / 地区、产品与服务、交付渠道等。",
            terms: ["risk-based-approach", "customer-risk-rating"],
          },
          {
            ref: "reg. 8(2)",
            en: "The Anti-Money Laundering Steering Group list of equivalent jurisdictions may no longer be relied upon by default; persons must conduct their own country risk assessment.",
            zh: "不再默认依赖「等效司法辖区名单」；主体须自行开展国别风险评估（不能仅凭名单直接适用简化尽调）。",
            terms: ["risk-based-approach"],
          },
        ],
      },
      {
        titleEn: "PEPs & Reporting",
        titleZh: "政治公众人物与上报",
        provisions: [
          {
            ref: "reg. 29",
            en: "Enhanced measures apply in relation to politically exposed persons, including establishing the source of wealth and source of funds.",
            zh: "对政治公众人物（PEP）须采取强化措施，包括确认财富来源（Source of Wealth）与资金来源（Source of Funds）。",
            terms: ["pep", "sof", "sow"],
          },
          {
            ref: "reg. 35",
            en: "Where a person knows or suspects that funds are the proceeds of criminal conduct, a suspicious activity report (SAR) must be filed with the Financial Reporting Authority.",
            zh: "主体知晓或怀疑资金为犯罪所得时，须向金融报告局（FRA）提交可疑交易报告（SAR）。",
            terms: ["str", "mlro", "tipping-off"],
          },
        ],
      },
      {
        titleEn: "AML Officers & Internal Controls",
        titleZh: "反洗钱岗位与内控",
        provisions: [
          {
            ref: "reg. 4",
            en: "A person must appoint an Anti-Money Laundering Compliance Officer (AMLCO), a Money Laundering Reporting Officer (MLRO) and a Deputy MLRO (DMLRO), who are natural persons at no lower than management level.",
            zh: "主体须任命反洗钱合规官（AMLCO）、洗钱申报官（MLRO）与副洗钱申报官（DMLRO），且均须为不低于管理层的自然人。",
            terms: ["amlco", "mlro", "dmlro"],
          },
          {
            ref: "reg. 4(5)",
            en: "The AMLCO and MLRO may be the same person, but the MLRO and DMLRO must be different individuals.",
            zh: "AMLCO 与 MLRO 可由同一人担任，但 MLRO 与 DMLRO 必须为不同人员。",
            terms: ["amlco", "mlro", "dmlro"],
          },
          {
            ref: "reg. 39",
            en: "Records obtained for customer due diligence must be retained for at least five years after the end of the business relationship.",
            zh: "客户尽调取得的记录须在业务关系终止后至少保存五年。",
            terms: ["cdd"],
          },
        ],
      },
    ],
  },

  /* ================================================================
   * 2. Private Funds Law, 2020
   * ================================================================ */
  {
    id: "private-funds-law-2020",
    milestoneId: "private-funds-law-2020",
    nameEn: "Private Funds Law, 2020 (Law 1 of 2020)",
    nameZh: "私募基金法（2020）",
    kind: "主法",
    year: 2020,
    highlight: "基金",
    summary:
      "里程碑式立法：首次将封闭式基金（私募股权、房地产、基础设施等）纳入 CIMA 强制注册与持续监管。",
    faNote:
      "Fund Admin 业务的重大拐点——大量此前不受监管的 PE / 房地产基金首次进入监管视野，须在过渡期内完成注册、建立年度审计与报备机制。",
    url: "https://www.cima.ky/upimages/commonfiles/PrivateFundsLaw2020_1581524961.PDF",
    relatedTerms: [
      "private-fund",
      "registered-fund",
      "cima",
      "closed-ended-fund",
      "valuation",
      "custody",
      "auditor",
      "regulatory-reporting",
      "nav",
    ],
    groups: [
      {
        titleEn: "Definition & Registration",
        titleZh: "定义与注册",
        provisions: [
          {
            ref: "s. 2",
            en: "A 'private fund' means a company, unit trust or partnership that offers or issues its investment interests, the purpose or effect of which is the pooling of investor funds to spread investment risks and enable investors to receive profits or gains from the acquisition, holding, management or disposal of investments.",
            zh: "「私募基金」指发行投资权益的公司、单位信托或合伙，其目的或效果是聚合投资者资金、分散投资风险，使投资者从投资的取得、持有、管理或处置中获得利润或收益。",
            terms: ["private-fund", "closed-ended-fund"],
          },
          {
            ref: "s. 5(1)",
            en: "A private fund must not carry on business in or from the Islands unless it has submitted an application for registration to the Authority within twenty-one days after accepting capital commitments from investors.",
            zh: "私募基金除非在接纳投资者资本承诺后 21 日内向管理局提交注册申请，否则不得在开曼开展业务。",
            terms: ["registered-fund", "cima", "commitment"],
          },
          {
            ref: "s. 2",
            en: "Investors must not have day-to-day control over the acquisition, holding, management or disposal of the investments; and the investments must be managed as a whole by or on behalf of the operator.",
            zh: "投资者对投资不具有日常控制权，且投资须由运营方（operator）或其代表整体管理。",
            terms: ["private-fund"],
          },
        ],
      },
      {
        titleEn: "Annual Audit & Annual Return",
        titleZh: "年度审计与年度申报",
        provisions: [
          {
            ref: "s. 13(1)",
            en: "A private fund must have its accounts audited annually by an auditor approved by CIMA, and submit its audited accounts to the Authority within six months of the end of each financial year.",
            zh: "私募基金须由 CIMA 认可的审计师每年审计其账目，并在每个财政年度结束后六个月内向管理局提交经审计账目。",
            terms: ["auditor", "cima", "regulatory-reporting"],
          },
          {
            ref: "s. 14",
            en: "A private fund must submit an annual return in the prescribed form (the Fund Annual Return, FAR) in respect of each financial year.",
            zh: "私募基金须按规定的格式（基金年度申报表 FAR）就每个财政年度提交年度申报。",
            terms: ["regulatory-reporting"],
          },
        ],
      },
      {
        titleEn: "Valuation, Safekeeping & Cash Monitoring",
        titleZh: "估值、资产保管与现金监管",
        provisions: [
          {
            ref: "s. 16",
            en: "A private fund must have appropriate and consistent procedures for the proper valuation of its assets, carried out at least annually and in accordance with the fund's valuation policy.",
            zh: "私募基金须建立适当且一致的资产估值程序，至少每年估值一次，并依基金估值政策执行。",
            terms: ["valuation", "nav"],
          },
          {
            ref: "s. 17",
            en: "Fund assets must be held by a custodian, except where it is neither practical nor proportionate given the nature of the fund and the type of assets; the custodian must verify title and maintain records.",
            zh: "基金资产须由托管人保管（除非鉴于基金性质与资产类型既不切实也不相称）；托管人须核验所有权并保存记录。",
            terms: ["custody"],
          },
          {
            ref: "s. 18",
            en: "A private fund must appoint an administrator, custodian or other independent third party to monitor its cash flows and ensure cash is booked in accounts opened in the fund's name.",
            zh: "私募基金须委任行政管理人、托管人或其他独立第三方监控现金流，确保现金记录于以基金名义开立的账户中。",
            terms: ["fund-administrator", "custody"],
          },
        ],
      },
      {
        titleEn: "Operating Conditions & Transitions",
        titleZh: "运营条件与过渡安排",
        provisions: [
          {
            ref: "s. 10",
            en: "A private fund must pay a prescribed annual registration fee to the Authority by the prescribed date each year.",
            zh: "私募基金须每年在指定日期前向管理局缴纳规定的年度注册费。",
            terms: ["registered-fund", "cima"],
          },
          {
            ref: "s. 11",
            en: "A private fund must inform the Authority of any change that materially affects information previously submitted, within twenty-one days of the change.",
            zh: "私募基金须在变更发生后 21 日内，将实质性影响已提交信息的任何变更通知管理局。",
            terms: ["regulatory-reporting"],
          },
          {
            ref: "s. 15",
            en: "A private fund must keep such records as may be required for at least five years.",
            zh: "私募基金须按规定保存记录，保存期至少五年。",
            terms: ["regulatory-reporting"],
          },
        ],
      },
    ],
  },

  /* ================================================================
   * 3. Beneficial Ownership Transparency Act, 2023
   * ================================================================ */
  {
    id: "bot-act-2023",
    milestoneId: "bot-act-2023",
    nameEn: "Beneficial Ownership Transparency Act, 2023 (Act 13 of 2023)",
    nameZh: "受益所有权透明度法（2023）",
    kind: "主法",
    year: 2023,
    highlight: "反洗钱",
    summary:
      "将受益所有人（BO）登记升级为可依「合法利益」向特定主体披露的透明度框架，替代《公司法》Part XVIIA。",
    faNote:
      "Fund Admin 须更审慎地穿透识别最终受益所有人（UBO），BO 信息可能向公众 / 特定主体披露——客户准入的「穿透识别」从形式审查走向实质审查。",
    url: "https://www.cima.ky/upimages/lawsregulations/BeneficialOwnershipTransparencyAct,2023_1705419742.pdf",
    relatedTerms: [
      "ubo",
      "cdd",
      "corporate-services-provider",
      "registered-agent",
      "certificate-of-good-standing",
      "cima",
    ],
    groups: [
      {
        titleEn: "Meaning of Beneficial Owner",
        titleZh: "受益所有人的定义",
        provisions: [
          {
            ref: "s. 4(1)",
            en: "A 'beneficial owner' means an individual who: (a) ultimately owns or controls, whether directly or indirectly, 25% or more of the shares, voting rights or partnership interests in the legal person; (b) otherwise exercises ultimate effective control over the management of the legal person; or (c) is identified as exercising control of the legal person through other means.",
            zh: "「受益所有人」指符合下列任一条件的自然人：(a) 直接或间接最终拥有或控制法人 25% 或以上的股份、表决权或合伙权益；(b) 以其他方式对法人的管理行使最终有效控制；或 (c) 被认定为通过其他方式（如可任免多数董事、重大否决权）对法人行使控制。",
            terms: ["ubo"],
          },
        ],
      },
      {
        titleEn: "Duties of Legal Persons",
        titleZh: "法人的义务",
        provisions: [
          {
            ref: "s. 6",
            en: "A legal person must take reasonable steps to identify its registrable beneficial owners and give notice to them to supply the required particulars.",
            zh: "法人须采取合理步骤识别其「须登记受益所有人」，并通知其提供规定的信息。",
            terms: ["ubo", "cdd"],
          },
          {
            ref: "s. 13(1)",
            en: "A legal person must establish and maintain a beneficial ownership register containing the required particulars.",
            zh: "法人须建立并维护受益所有权登记册，载明规定的信息。",
            terms: ["ubo"],
          },
          {
            ref: "s. 14",
            en: "A legal person must keep the register current and notify the competent authority of relevant changes within the prescribed period.",
            zh: "法人须保持登记册为最新状态，并在规定期限内将相关变更通知主管当局。",
            terms: ["ubo"],
          },
        ],
      },
      {
        titleEn: "Corporate Services Provider Review",
        titleZh: "公司服务提供商的审查",
        provisions: [
          {
            ref: "s. 11",
            en: "A corporate services provider must review the particulars of beneficial owners and provide written confirmation where required.",
            zh: "公司服务提供商须审查受益所有人的信息，并在要求时提供书面确认。",
            terms: ["corporate-services-provider", "registered-agent"],
          },
        ],
      },
      {
        titleEn: "Access to Information",
        titleZh: "信息查阅",
        provisions: [
          {
            ref: "s. 22",
            en: "Access to beneficial ownership information is available to specified authorities and, under the Legitimate Interest Access Regulations 2024, to members of the public who meet a legitimate interest test — namely persons (a) engaged in journalism or bona fide academic research; (b) acting on behalf of a civil society organisation combating money laundering or terrorist financing; or (c) seeking the information in the context of a potential or actual business relationship with the legal person.",
            zh: "受益所有权信息可供指定主管机关查阅；依《合法利益查阅细则（2024）》，满足「合法利益」标准的公众亦可申请查阅——包括：(a) 从事新闻或真实学术研究的人；(b) 代表打击洗钱或恐怖融资的民间组织行事的人；或 (c) 因与该法人存在潜在或实际业务关系而查询信息的人。",
            terms: ["ubo"],
          },
        ],
      },
      {
        titleEn: "Restrictions & Enforcement",
        titleZh: "限制通知与执法",
        provisions: [
          {
            ref: "s. 18–20",
            en: "Where a legal person fails to disclose beneficial ownership, a restrictions notice may be issued, and administrative fines or criminal penalties may apply.",
            zh: "法人未披露受益所有权时，可发出「限制通知」，并可处以行政罚款或刑事处罚。",
            terms: ["ubo", "certificate-of-good-standing"],
          },
        ],
      },
    ],
  },

  /* ================================================================
   * 4. Rule on Effective Compliance Programme (AML Compliance Rule, 2026)
   * ================================================================ */
  {
    id: "aml-compliance-rule-2026",
    milestoneId: "aml-compliance-rule-2026",
    nameEn:
      "Rule on Effective Compliance Programme for the Prevention and Detection of Money Laundering, Terrorist Financing and Proliferation Financing for Financial Services Providers (2026)",
    nameZh: "AML 有效合规计划规则（2026）",
    kind: "Rule 规则",
    year: 2026,
    highlight: "反洗钱",
    summary:
      "CIMA 2026-09-18 生效，将原先非约束性的 AML 指引升级为约束性规则，强制 FSP 建立并维护覆盖五大要素的有效合规计划。",
    faNote:
      "Fund Admin 须评估自身合规计划是否满足五要素（尤其独立审计职能与 AMLCO 独立性）；外包合规职能须尽调并通知 CIMA。",
    url: "https://www.cima.ky/upimages/regulatorymeasures/Rule-EffectiveComplianceProgrammeforMLTFPF_1784900645.pdf",
    relatedTerms: [
      "effective-compliance-programme",
      "amlco",
      "mlro",
      "dmlro",
      "risk-based-approach",
      "financial-sanctions",
      "tfs",
      "cdd",
      "ongoing-monitoring",
    ],
    groups: [
      {
        titleEn: "s.3 Statement of Objectives",
        titleZh: "目标声明",
        provisions: [
          {
            ref: "s. 3(1)",
            en: "The objective of this Rule is to prescribe the minimum standards for an effective compliance programme that a financial services provider must establish and maintain to prevent and detect money laundering, terrorist financing and proliferation financing.",
            zh: "本规则的目标是规定「有效合规计划」的最低标准——金融服务提供商（FSP）必须建立并维护该合规计划，以防范和发现洗钱、恐怖融资及扩散融资。",
            terms: ["effective-compliance-programme", "aml-cft"],
          },
          {
            ref: "s. 3(2)",
            en: "A compliance programme is a set of internal policies, procedures and controls designed to ensure compliance with the AML/CFT/PF obligations under the Proceeds of Crime Act, the Anti-Money Laundering Regulations and this Rule.",
            zh: "合规计划是一套内部政策、程序与控制措施，旨在确保履行《犯罪收益法》、反洗钱条例及本规则项下的反洗钱 / 反恐怖融资 / 反扩散融资义务。",
            terms: ["effective-compliance-programme", "aml", "aml-cft"],
          },
        ],
      },
      {
        titleEn: "s.4 Statutory Authority",
        titleZh: "法定授权",
        provisions: [
          {
            ref: "s. 4(1)",
            en: "This Rule is issued by the Authority (CIMA) pursuant to section 34(1) of the Monetary Authority Act (2020 Revision), which empowers CIMA to issue rules, statements of principle and guidance.",
            zh: "本规则由管理局（CIMA）依《货币管理局法（2020 修订）》第 34(1) 条发布，该条授权 CIMA 发布规则、原则声明与指引。",
            terms: ["cima"],
          },
          {
            ref: "s. 4(2)",
            en: "This Rule is supplemental to, and must be read together with, the Anti-Money Laundering Regulations (2023 Revision) and the associated Guidance Notes; it does not replace or derogate from those instruments.",
            zh: "本规则是对反洗钱条例（2023 修订）及其配套指引的补充，须与之一并解读；本规则并不取代或减损上述文件的效力。",
            terms: ["aml"],
          },
        ],
      },
      {
        titleEn: "s.5 Scope of Application",
        titleZh: "适用范围",
        provisions: [
          {
            ref: "s. 5(1)",
            en: "This Rule applies to every person carrying on relevant financial business in or from the Cayman Islands, including a fund, a fund administrator and other financial services providers.",
            zh: "本规则适用于在开曼群岛内或从开曼群岛从事「相关金融业务」的每一主体，包括基金、基金行政管理人及其他金融服务提供商。",
            terms: ["aml", "fund-administrator"],
          },
          {
            ref: "s. 5(2)",
            en: "Where an FSP operates through branches or subsidiaries, or is a member of a group, the compliance programme must take into account the AML/CFT/PF risks of those branches, subsidiaries and group members, unless local law prohibits it.",
            zh: "主体通过分支机构或子公司运营、或属于某一集团成员时，其合规计划必须考虑该等分支机构、子公司与集团成员的洗钱 / 恐怖融资 / 扩散融资风险（除非当地法律禁止）。",
            terms: ["aml-cft", "risk-based-approach"],
          },
          {
            ref: "s. 5(3)",
            en: "Where compliance functions are delegated to a third party or service provider, the FSP retains ultimate responsibility for compliance with this Rule.",
            zh: "即便合规职能被委托给第三方或服务商，主体仍对遵守本规则承担最终责任。",
            terms: ["amlco"],
          },
        ],
      },
      {
        titleEn: "s.6 Definitions",
        titleZh: "定义",
        provisions: [
          {
            ref: "s. 6",
            en: "Key defined terms include: 'AMLCO' (Anti-Money Laundering Compliance Officer); 'Beneficial Owner'; 'Business Relationship'; 'Compliance Programme'; 'Financial Services Provider' (FSP); and 'Governing Body', among others.",
            zh: "关键定义包括：「反洗钱合规官 AMLCO」、「受益所有人」、「业务关系」、「合规计划」、「金融服务提供商（FSP）」、「治理机构」等。",
            terms: ["amlco", "ubo", "governing-body"],
          },
          {
            ref: "s. 6",
            en: "'Governing Body' means the board of directors, general partner, trustee or other equivalent body with ultimate responsibility for the FSP and its compliance with the AML/CFT/PF obligations.",
            zh: "「治理机构」指董事会、普通合伙人、受托人或其他对主体及其反洗钱 / 反恐怖融资 / 反扩散融资义务承担最终责任的同等机构。",
            terms: ["governing-body"],
          },
        ],
      },
      {
        titleEn: "s.7 Governance & Overview of the Compliance Programme",
        titleZh: "治理与合规计划概览",
        provisions: [
          {
            ref: "s. 7(1)",
            en: "The governing body has overall responsibility for establishing, implementing and maintaining an effective compliance programme, and for ensuring that adequate resources are allocated to it.",
            zh: "治理机构对建立、实施并维护有效的合规计划负有总体责任，并须确保为其配置充足资源。",
            terms: ["governing-body", "effective-compliance-programme"],
          },
          {
            ref: "s. 7(3)",
            en: "The compliance programme must comprise five core components: (i) designation of an AMLCO; (ii) documented written policies and procedures; (iii) a risk management framework applying a risk-based approach; (iv) an ongoing compliance training programme; and (v) ongoing evaluations of effectiveness through independent audit.",
            zh: "合规计划须包含五要素：（一）任命反洗钱合规官（AMLCO）；（二）书面政策与程序；（三）基于风险为本方法的风险管理框架；（四）持续合规培训计划；（五）通过独立审计持续评估有效性。",
            terms: ["effective-compliance-programme", "amlco", "risk-based-approach"],
          },
          {
            ref: "s. 7(4)",
            en: "The governing body must approve the compliance programme, review it at least annually, and document its approval and review.",
            zh: "治理机构须批准合规计划、至少每年复核一次，并将批准与复核情况书面化。",
            terms: ["governing-body"],
          },
        ],
      },
      {
        titleEn: "s.8 Designation of the AMLCO, MLRO & DMLRO",
        titleZh: "反洗钱官的任命",
        provisions: [
          {
            ref: "s. 8(1)",
            en: "An FSP must designate an AMLCO who is a natural person at no lower than management level, with the requisite skills, knowledge and experience, and who has sufficient seniority and authority.",
            zh: "主体须任命一名反洗钱合规官（AMLCO），须为不低于管理层的自然人，具备所需的技能、知识与经验，并拥有充分的资历与权限。",
            terms: ["amlco"],
          },
          {
            ref: "s. 8(2)",
            en: "The AMLCO must perform the compliance function independently and objectively, separate from business and operational functions, and must report directly to the governing body at least annually.",
            zh: "AMLCO 须独立、客观地履行合规职能（与业务及运营职能相分离），并至少每年直接向治理机构报告。",
            terms: ["amlco", "governing-body"],
          },
          {
            ref: "s. 8(3)",
            en: "The AMLCO may not also be a director of the fund or of its general partner; where this is unavoidable for smaller entities, the conflict must be documented and mitigating measures put in place.",
            zh: "AMLCO 不得同时担任基金或其普通合伙人的董事；对于较小实体确属无法避免的，须书面记录该利益冲突并落实缓释措施。",
            terms: ["amlco"],
          },
          {
            ref: "s. 8(4)",
            en: "An FSP must also appoint an MLRO and a DMLRO, who must be different individuals; the AMLCO may also serve as the MLRO.",
            zh: "主体还须任命洗钱申报官（MLRO）与副洗钱申报官（DMLRO），二者须为不同人员；AMLCO 可同时兼任 MLRO。",
            terms: ["mlro", "dmlro", "amlco"],
          },
          {
            ref: "s. 8(5)",
            en: "The MLRO is responsible for receiving and evaluating internal reports of suspicious activity and, where appropriate, filing suspicious activity reports (SARs) with the Financial Reporting Authority.",
            zh: "MLRO 负责接收并评估内部可疑交易报告，并视情况向金融报告局（FRA）提交可疑交易报告（SAR）。",
            terms: ["mlro", "str", "tipping-off"],
          },
          {
            ref: "s. 8(6)",
            en: "The DMLRO acts in the MLRO's absence and must have the same level of authority, access to information and seniority as the MLRO.",
            zh: "DMLRO 在 MLRO 缺席时代行其职，并须拥有与 MLRO 同等的权限、信息访问与资历。",
            terms: ["dmlro", "mlro"],
          },
        ],
      },
      {
        titleEn: "s.9 Development & Documentation of a Risk-Based Approach",
        titleZh: "风险为本方法的制定与文档化",
        provisions: [
          {
            ref: "s. 9(1)",
            en: "An FSP must identify, assess and understand its ML/TF/PF risks, taking into account its customers, countries or geographic areas, products, services, transactions and delivery channels.",
            zh: "主体须识别、评估并理解其洗钱 / 恐怖融资 / 扩散融资风险，评估维度包括客户、国别 / 地区、产品、服务、交易及交付渠道。",
            terms: ["risk-based-approach", "customer-risk-rating"],
          },
          {
            ref: "s. 9(2)",
            en: "The risk assessment must take into account the Cayman Islands National Risk Assessment and any relevant findings, and must be documented in writing.",
            zh: "风险评估须参照开曼群岛国家风险评估及相关结论，并以书面形式记录。",
            terms: ["risk-based-approach"],
          },
          {
            ref: "s. 9(3)",
            en: "An FSP must design and implement policies, procedures and controls to manage and mitigate the risks identified, commensurate with the nature and size of its business.",
            zh: "主体须设计并实施政策、程序与控制，以管理并缓释所识别的风险，且须与其业务性质与规模相称。",
            terms: ["risk-based-approach", "inherent-risk", "residual-risk"],
          },
          {
            ref: "s. 9(4)",
            en: "The risk assessment must be kept up to date and reviewed at least annually, and must be updated without delay upon any material trigger event, such as a change in business model, new products, or a significant change in customer base.",
            zh: "风险评估须保持最新并至少每年复核一次，并在任何重大触发事件（如商业模式变更、推出新产品、客户群重大变化）发生时及时更新。",
            terms: ["risk-based-approach", "trigger-event"],
          },
        ],
      },
      {
        titleEn: "s.10 Detailed Policies, Procedures & Controls",
        titleZh: "详细政策、程序与控制",
        provisions: [
          {
            ref: "s. 10(2)",
            en: "The compliance programme must include documented policies and procedures covering customer due diligence (CDD), enhanced due diligence (EDD) for higher-risk situations, and simplified due diligence where permitted.",
            zh: "合规计划须包含书面政策与程序，涵盖客户尽职调查（CDD）、高风险情形下的强化尽调（EDD），以及在允许情况下的简化尽调。",
            terms: ["cdd", "edd"],
          },
          {
            ref: "s. 10(3)",
            en: "Policies and procedures must address the identification and verification of customers and beneficial owners, including electronic identification (e-KYC) where used, and must be approved by the governing body or senior management.",
            zh: "政策与程序须涵盖客户与受益所有人的识别与核验（包括所使用的电子身份核验 e-KYC），并须经治理机构或高级管理层批准。",
            terms: ["cdd", "ubo", "kyc"],
          },
          {
            ref: "s. 10(4)",
            en: "An FSP must apply CDD measures before or during the establishment of a business relationship, and must complete verification before or shortly after the relationship is established.",
            zh: "主体须在建立业务关系时或过程中采取 CDD 措施，并在关系建立前或其后不久完成核验。",
            terms: ["cdd", "trigger-event"],
          },
          {
            ref: "s. 10(5)",
            en: "Records obtained for CDD, together with transaction records, must be retained for at least five years after the end of the business relationship or the completion of the transaction.",
            zh: "CDD 取得的记录及交易记录须在业务关系终止或交易完成后至少保存五年。",
            terms: ["cdd"],
          },
          {
            ref: "s. 10(7)",
            en: "Where CDD or compliance functions are outsourced, the FSP must assess the risks, conduct due diligence on the service provider, document the arrangement, and notify CIMA of material outsourced functions; ultimate responsibility remains with the FSP.",
            zh: "外包 CDD 或合规职能时，主体须评估风险、对服务商开展尽调、书面化安排，并就重大外包职能通知 CIMA；最终责任仍由主体承担。",
            terms: ["amlco", "cima", "cdd"],
          },
        ],
      },
      {
        titleEn: "s.11 Delivery of Ongoing Compliance Training & Employee Screening",
        titleZh: "持续合规培训的开展与员工筛查",
        provisions: [
          {
            ref: "s. 11(1)",
            en: "An FSP must implement an ongoing training programme to ensure that all relevant employees are aware of their AML/CFT/PF obligations and of the procedures for reporting suspicious activity.",
            zh: "主体须实施持续培训计划，确保所有相关员工了解其反洗钱 / 反恐怖融资 / 反扩散融资义务及可疑交易报告程序。",
            terms: ["aml-cft", "str"],
          },
          {
            ref: "s. 11(2)",
            en: "Training must be provided at least annually and must be commensurate with the employee's role and the risks faced by the FSP.",
            zh: "培训须至少每年提供一次，并须与员工职责及主体所面临的风险相称。",
            terms: ["risk-based-approach"],
          },
          {
            ref: "s. 11(3)",
            en: "Records of training delivered must be retained to evidence compliance with the training obligation.",
            zh: "须保存已开展培训的记录，以证明履行了培训义务。",
            terms: ["aml-cft"],
          },
          {
            ref: "s. 11(4)",
            en: "An FSP must implement screening procedures, including at the time of hiring, to ensure the fitness and propriety of employees, and must screen employees in accordance with the FSP's risk-based approach.",
            zh: "主体须实施员工筛查程序（含入职时），以确保员工的适格性与适当性，并依风险为本方法对员工进行筛查。",
            terms: ["risk-based-approach"],
          },
        ],
      },
      {
        titleEn: "s.12 Demonstration of the Effectiveness",
        titleZh: "有效性的证明",
        provisions: [
          {
            ref: "s. 12(1)",
            en: "An FSP must carry out an independent audit to evaluate the adequacy and effectiveness of its compliance programme and its implementation.",
            zh: "主体须开展独立审计，以评估其合规计划及其执行的充分性与有效性。",
            terms: ["effective-compliance-programme", "auditor"],
          },
          {
            ref: "s. 12(2)",
            en: "The frequency and scope of the independent audit must be commensurate with the FSP's size, complexity and risk profile; an internal independent audit may be undertaken for no more than two consecutive cycles, after which an external audit is required.",
            zh: "独立审计的频率与范围须与主体规模、复杂度及风险状况相称；内部独立审计连续开展不得超过两个周期，其后须进行外部审计。",
            terms: ["effective-compliance-programme", "auditor"],
          },
          {
            ref: "s. 12(3)",
            en: "The independent audit must be carried out by suitably qualified persons who are independent and separate from those involved in the design, implementation or operation of the policies, procedures, systems and controls under audit, and who are free from any conflict of interest.",
            zh: "独立审计须由具备相应资质、且独立于（并区别于）所审计政策、程序、系统与控制的设计、实施或运营人员的人士执行，且不得存在任何可能损害其客观判断的利益冲突。",
            terms: ["auditor", "governing-body"],
          },
        ],
      },
      {
        titleEn: "s.13 Enforcement",
        titleZh: "执法",
        provisions: [
          {
            ref: "s. 13",
            en: "Failure to comply with this Rule is a contravention for which CIMA may exercise its enforcement powers, including the imposition of administrative fines, and the AMLCO may be personally liable where a compliance failure amounts to a breach of the AMLRs attributable to the officer's conduct.",
            zh: "违反本规则构成违规，CIMA 可行使执法权，包括处以行政罚款；若合规失败构成归因于该反洗钱官行为的、对反洗钱条例的违反，AMLCO 可能承担个人责任。",
            terms: ["cima", "amlco", "aml"],
          },
        ],
      },
      {
        titleEn: "s.14 Effective Date",
        titleZh: "生效日期",
        provisions: [
          {
            ref: "s. 14",
            en: "This Rule comes into force on 18 September 2026.",
            zh: "本规则自 2026 年 9 月 18 日起生效。",
          },
        ],
      },
    ],
    /* 简化版（速览口径）：归纳为 7 个核心要点，与上方完整对照版并存 */
    summaryGroups: [
      {
        titleEn: "Five Core Components",
        titleZh: "合规计划五要素",
        provisions: [
          {
            ref: "Rule 1",
            en: "An FSP's Compliance Programme must comprise five core components: (i) designation of an AMLCO; (ii) documented written policies and procedures; (iii) a risk management framework applying a risk-based approach; (iv) an ongoing compliance training programme; and (v) ongoing evaluations of effectiveness through independent audit.",
            zh: "合规计划须包含五要素：（一）任命反洗钱合规官（AMLCO）；（二）书面政策与程序；（三）基于风险为本方法的风险管理框架；（四）持续合规培训计划；（五）通过独立审计持续评估有效性。",
            terms: ["effective-compliance-programme", "amlco", "risk-based-approach"],
          },
        ],
      },
      {
        titleEn: "AMLCO Independence & Suitability",
        titleZh: "AMLCO 独立性与适格性",
        provisions: [
          {
            ref: "Rule 2",
            en: "The AMLCO must perform the compliance function independently and objectively from business and operational functions and must report to the governing body at least annually.",
            zh: "AMLCO 须独立、客观地履行合规职能（与业务及运营职能相分离），并至少每年向治理机构报告一次。",
            terms: ["amlco", "governing-body"],
          },
          {
            ref: "Rule 3",
            en: "The AML officers may not also be directors of the fund or its general partner; the MLRO and DMLRO must be different individuals.",
            zh: "反洗钱官不得同时担任基金或其普通合伙人的董事；MLRO 与 DMLRO 须为不同人员。",
            terms: ["amlco", "mlro", "dmlro"],
          },
        ],
      },
      {
        titleEn: "Risk-Based Approach & Trigger Events",
        titleZh: "风险为本方法与触发事件",
        provisions: [
          {
            ref: "Rule 4",
            en: "FSPs must identify, assess, manage and mitigate ML/TF/PF risks, taking into account the Cayman Islands National Risk Assessment, and update risk assessments without delay upon material trigger events.",
            zh: "主体须识别、评估、管理并缓释洗钱 / 恐怖融资 / 扩散融资风险（参照开曼国家风险评估），并在重大触发事件发生时及时更新风险评估。",
            terms: ["risk-based-approach", "trigger-event", "inherent-risk", "residual-risk"],
          },
        ],
      },
      {
        titleEn: "CDD, Records & Outsourcing",
        titleZh: "客户尽调、记录与外包",
        provisions: [
          {
            ref: "Rule 5",
            en: "FSPs must verify customers and beneficial owners before or shortly after establishing a business relationship, and retain transaction and CDD records for at least five years.",
            zh: "主体须在建立业务关系时或其后尽快核验客户与受益所有人，并保存交易与 CDD 记录至少五年。",
            terms: ["cdd", "ubo"],
          },
          {
            ref: "Rule 6",
            en: "Where compliance functions are outsourced, the FSP must assess risks, conduct due diligence on the service provider, document the arrangement, and notify CIMA of material outsourced compliance functions; ultimate responsibility remains with the FSP.",
            zh: "外包合规职能时，主体须评估风险、对服务商开展尽调、书面化安排，并就重大外包合规职能通知 CIMA；最终责任仍由主体承担。",
            terms: ["amlco", "cima"],
          },
        ],
      },
      {
        titleEn: "Independent Audit",
        titleZh: "独立审计",
        provisions: [
          {
            ref: "Rule 7",
            en: "The frequency and scope of independent audits must be commensurate with the FSP's size, complexity and risk profile; internal independent audits may be undertaken for no more than two consecutive cycles before an external audit is required.",
            zh: "独立审计的频率与范围须与主体规模、复杂度及风险状况相称；内部独立审计连续开展不得超过两个周期，其后须引入外部审计。",
            terms: ["effective-compliance-programme", "auditor"],
          },
        ],
      },
    ],
  },
];

/** 按 id 取法规详情 */
export function getCaymanLawDetail(id: string): CaymanLawDetail | undefined {
  return CAYMAN_LAW_DETAILS.find((d) => d.id === id);
}

/** 按里程碑 id 取法规详情（时间轴节点 → 详情页回链用） */
export function getCaymanLawDetailByMilestone(
  milestoneId: string
): CaymanLawDetail | undefined {
  return CAYMAN_LAW_DETAILS.find((d) => d.milestoneId === milestoneId);
}

/** 反向索引：术语 id → 关联的法规详情 id 列表（术语详情页「相关法规」用） */
export function getLawsByTerm(termId: string): CaymanLawDetail[] {
  return CAYMAN_LAW_DETAILS.filter((d) => d.relatedTerms.includes(termId));
}
