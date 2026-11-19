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
  /** 条款级中英对照分组 */
  groups: CaymanLawProvisionGroup[];
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
      "Rule on Effective Compliance Programme for the Prevention and Detection of ML/TF/PF (2026)",
    nameZh: "AML 有效合规计划规则（2026）",
    kind: "Rule 规则",
    year: 2026,
    highlight: "反洗钱",
    summary:
      "CIMA 2026-09-18 生效，将原先非约束性的 AML 指引升级为约束性规则，强制 FSP 建立五大要素的合规计划。",
    faNote:
      "Fund Admin 须评估自身合规计划是否满足五要素（尤其独立审计职能与 AMLCO 独立性）；外包合规职能须尽调并通知 CIMA。",
    url: "https://www.cima.ky/upimages/priorconsultation/EffectiveComplianceProgramme-AmalgamatedFeedbackStatement_1783954838.pdf",
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
