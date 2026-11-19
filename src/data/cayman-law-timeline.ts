/**
 * 开曼群岛基金 / 公司监管法规历史沿革（数据层）
 *
 * 来源：CIMA（cima.ky）官方公报、legislation.gov.ky 官方文本、
 *      开曼群岛议会（parliament.ky）、开曼政府（gov.ky）立法公告。
 * 字段口径：
 *  - year：生效 / 修订年份（用于时间轴排序）
 *  - law：英文正式名称
 *  - zh：中文名
 *  - kind：法规形态（主法 / 修订 / 合并修订版）
 *  - highlight：高亮主题（反洗钱 / 基金），用于醒目标记，null 为普通法规
 *  - summary：一句话概括（节点折叠态即显示）
 *  - details：结构化具体内容（展开态展示）
 *  - url：官方超链接（优先 legislation.gov.ky，其次 cima.ky / gov.ky）
 *  - tags：主题标签（用于顶部按主题筛选）
 */
export interface CaymanLawMilestone {
  id: string;
  year: number;
  law: string;
  zh: string;
  kind: "主法" | "修订" | "合并修订版";
  highlight: "反洗钱" | "基金" | null;
  summary: string;
  details: {
    /** 监管要点：这部法规到底管什么、怎么管 */
    points: string[];
    /** 对 Fund Admin（基金行政 / 运营）的实务影响 */
    impact: string;
    /** 关键条款 / 制度 */
    keyItems?: string[];
  };
  url: string;
  tags: string[];
}

export const CAYMAN_LAW_TIMELINE: CaymanLawMilestone[] = [
  {
    id: "companies-act-1960",
    year: 1960,
    law: "Companies Act (1960 Revision)",
    zh: "公司法",
    kind: "主法",
    highlight: null,
    summary:
      "开曼公司法的奠基版本，确立「豁免公司（Exempted Company）」制度，成为后续所有开曼基金载体的法律母体。",
    details: {
      points: [
        "确立「豁免公司」制度：境外业务主体可豁免本地税负与外汇管制",
        "确立公司注册、章程、股本、董事等基础公司治理框架",
        "为后续基金载体（豁免公司、ELP、LLC）提供法律母体",
      ],
      impact:
        "Fund Admin 经办的所有开曼基金载体（SPC、ELP、LLC 等）其设立与存续的根本依据都溯源至公司法；了解公司法基本盘是理解后续监管演变的前提。",
      keyItems: ["Exempted Company 豁免公司", "公司章程（Memorandum & Articles）", "注册处（Registrar）"],
    },
    url: "https://gov.ky/documents/35692/0/Companies+Act+(2026+Revision),.pdf",
    tags: ["公司法", "基金载体"],
  },
  {
    id: "mutual-funds-law-1993",
    year: 1993,
    law: "Mutual Funds Law (Law 13 of 1993)",
    zh: "共同基金法",
    kind: "主法",
    highlight: "基金",
    summary:
      "开曼首次为「共同基金」单独立法，把开放式基金纳入监管，并授权设立开曼金融管理局（CIMA）。",
    details: {
      points: [
        "首次定义「共同基金（Mutual Fund）」，把开放式基金纳入法定监管",
        "授权设立开曼金融管理局（CIMA）作为统一监管机构",
        "建立受监管共同基金的持牌 / 注册、年度审计、年费义务",
      ],
      impact:
        "这是开曼基金监管的「元年」——基金行政服务（NAV 计算、份额登记、合规报备）的法律基础自此确立；CIMA 的设立使 Fund Admin 有了明确的监管报送对象。",
      keyItems: ["Regulated Mutual Funds", "CIMA 设立", "年度审计 + 年费"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/1993/1993-0013/MutualFundsAct_2020%20Revision.pdf",
    tags: ["共同基金", "CIMA", "监管起点"],
  },
  {
    id: "mfl-revision-2003",
    year: 2003,
    law: "Mutual Funds Law (2003 Revision)",
    zh: "共同基金法（2003 修订）",
    kind: "合并修订版",
    highlight: "基金",
    summary:
      "引入「注册基金」概念雏形，简化小型 / 少数投资者基金准入，并强化基金行政管理人的持牌与资本要求。",
    details: {
      points: [
        "引入注册（registration）通道的雏形，简化小型 / 少数投资者基金的准入",
        "强化基金行政管理人（Mutual Fund Administrator）的持牌与资本要求",
        "为后续 Section 4(4) 豁免与「注册基金」制度奠定基础",
      ],
      impact:
        "Fund Admin（基金行政管理人）作为独立持牌主体的地位被正式强化——资本要求、董事人数、审计义务都有明确门槛，直接关系到行政服务商的合规运营。",
      keyItems: ["Mutual Fund Administrator 持牌", "Section 4(4) 豁免雏形", "资本要求"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/1993/1993-0013/MutualFundsAct_2020%20Revision.pdf",
    tags: ["共同基金", "注册基金"],
  },
  {
    id: "elp-law-2013",
    year: 2013,
    law: "Exempted Limited Partnership Law (2013 Revision)",
    zh: "豁免有限合伙法",
    kind: "合并修订版",
    highlight: "基金",
    summary:
      "确立豁免有限合伙（ELP）作为私募基金最主流载体之一的法律框架：GP 管理、LP 以出资为限担责。",
    details: {
      points: [
        "确立 ELP 法律框架：普通合伙人（GP）承担管理、有限合伙人（LP）以出资为限担责",
        "合伙协议可自由约定分配、治理与 GP/LP 权责",
        "明确 ELP 的注册、变更、解散与外国有限合伙登记",
      ],
      impact:
        "ELP 是私募股权 / 房地产 / 基础设施基金最主流载体——Fund Admin 需为 ELP 基金提供出资催缴（capital call）、分配（distribution）、LP 份额登记等服务，须熟悉 GP/LP 结构下的权利义务。",
      keyItems: ["GP / LP 权责", "LPA 合伙协议自由约定", "出资与分配"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/2001/2001-0005/2001-0005_2021%20Revision.pdf",
    tags: ["ELP", "基金载体", "合伙"],
  },
  {
    id: "mfl-amendment-2016",
    year: 2016,
    law: "Mutual Funds (Amendment) Law, 2016",
    zh: "共同基金法（2016 修订）",
    kind: "修订",
    highlight: "基金",
    summary:
      "正式引入「注册基金（Registered Fund）」制度：符合条件的基金可在 CIMA 注册而非持牌。",
    details: {
      points: [
        "正式确立「注册基金（Registered Fund）」制度，替代部分豁免安排",
        "符合条件的基金可在 CIMA 注册而非申请牌照，程序更简便",
        "保留持续合规义务：年度审计、年费、重大变更报备",
      ],
      impact:
        "「注册」与「持牌」双轨制成形——Fund Admin 需判断客户基金走哪条通道，并持续履行注册基金的年度审计报备与年费缴纳义务；注册基金也须接受 CIMA 持续监管。",
      keyItems: ["Registered Fund 注册基金", "注册 vs 持牌双轨", "持续合规义务"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/1993/1993-0013/MutualFundsAct_2020%20Revision.pdf",
    tags: ["共同基金", "注册基金", "CIMA"],
  },
  {
    id: "companies-act-2019",
    year: 2019,
    law: "Companies Act (2019 Revision) · Companies (Amendment) Law, 2019",
    zh: "公司法（2019 修订）",
    kind: "修订",
    highlight: "反洗钱",
    summary:
      "为响应 CFATF 第四轮互评估，强化公司治理与登记，为受益所有权登记（Part XVIIA）奠定基础。",
    details: {
      points: [
        "响应加勒比 FATF（CFATF）第四轮互评估，强化反洗钱立法框架",
        "强化公司治理与登记制度，堵住壳公司风险",
        "为受益所有权登记（Part XVIIA）奠定立法基础",
      ],
      impact:
        "Fund Admin 在客户准入（onboarding）阶段须配合更严格的受益所有权与治理审查；AML/KYC 义务从「选择性」走向「结构性」，是 2019 年后所有基金行政工作的底色。",
      keyItems: ["CFATF 第四轮互评估", "Part XVIIA 受益所有权", "治理强化"],
    },
    url: "https://gov.ky/documents/35692/0/Companies+Act+(2026+Revision),.pdf",
    tags: ["公司法", "反洗钱", "受益所有权"],
  },
  {
    id: "private-funds-law-2020",
    year: 2020,
    law: "Private Funds Law, 2020",
    zh: "私募基金法（2020）",
    kind: "主法",
    highlight: "基金",
    summary:
      "里程碑式立法：首次把「封闭式基金」（私募股权、房地产、基础设施等）纳入 CIMA 强制注册与监管。",
    details: {
      points: [
        "首次将「封闭式基金」（private funds）纳入 CIMA 强制注册与监管",
        "定义私募基金：以投资为目的聚合投资者资金、分散风险并分享收益",
        "要求注册、年度审计（CIMA 认可审计师）、持续报备，过渡期至 2020-08-07",
        "排除单一投资者基金（该豁免预期后续将被收紧）",
      ],
      impact:
        "这是 Fund Admin 业务的重大拐点——大量此前不受监管的 PE / 房地产 / 基础设施基金第一次进入监管视野，须在过渡期内完成注册、建立年度审计与报备机制。",
      keyItems: ["封闭式基金定义", "注册 + 年度审计", "2020-08-07 过渡期"],
    },
    url: "https://www.cima.ky/upimages/commonfiles/PrivateFundsLaw2020_1581524961.PDF",
    tags: ["私募基金", "封闭式基金", "CIMA", "监管里程碑"],
  },
  {
    id: "mfl-amendment-2020",
    year: 2020,
    law: "Mutual Funds (Amendment) Law, 2020",
    zh: "共同基金法（2020 修订）",
    kind: "修订",
    highlight: "基金",
    summary:
      "取消原 Section 4(4)（≤15 名投资者）基金的注册豁免，此类「Limited Investor Funds」现须注册。",
    details: {
      points: [
        "取消原 Section 4(4)（≤15 名投资者）基金的注册豁免",
        "此类基金现称为「Limited Investor Funds」，须向 CIMA 注册",
        "须提交申请表、支持文件并缴纳注册费与年费，接受年度审计",
      ],
      impact:
        "Fund Admin 需排查存量「少数投资者」基金是否落入新的注册义务；原以为可豁免的 4(4) 基金也须在过渡期内完成注册与审计，合规清单显著扩容。",
      keyItems: ["Section 4(4) 豁免取消", "Limited Investor Funds", "CI$300 注册费 / CI$3,500 年费"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/1993/1993-0013/MutualFundsAct_2020%20Revision.pdf",
    tags: ["共同基金", "注册基金", "CIMA"],
  },
  {
    id: "vasp-act-2020",
    year: 2020,
    law: "Virtual Asset (Service Providers) Act, 2020",
    zh: "虚拟资产服务提供者法（2020）",
    kind: "主法",
    highlight: "反洗钱",
    summary:
      "对虚拟资产交易、托管、发行等服务实体（VASP）建立注册/许可，并施加 FATF 旅行规则与 AML/CFT 义务。",
    details: {
      points: [
        "对提供虚拟资产交易、托管、发行等服务的实体（VASP）建立注册 / 许可制度",
        "要求遵守 FATF「旅行规则」（Travel Rule）与 AML/CFT 义务",
        "使开曼数字资产基金及相关服务商进入监管视野",
      ],
      impact:
        "涉虚拟资产的基金及服务商须新增 VASP 注册与 AML 合规动作；Fund Admin 若服务数字资产基金，须评估自身是否落入 VASP 定义，并落实旅行规则下的交易对手信息传递。",
      keyItems: ["VASP 注册 / 许可", "Travel Rule 旅行规则", "AML/CFT 义务"],
    },
    url: "https://www.cima.ky/upimages/lawsregulations/VirtualAssetServiceProvidersLaw,2020_1594210684_1599485320.PDF",
    tags: ["虚拟资产", "VASP", "反洗钱", "FATF"],
  },
  {
    id: "companies-act-2021",
    year: 2021,
    law: "Companies Act (2021 Revision) · ELP Act (2021 Revision)",
    zh: "公司法 / 豁免有限合伙法（2021 合并修订版）",
    kind: "合并修订版",
    highlight: null,
    summary:
      "对公司法与豁免有限合伙法作合并修订，强化公司、LLC、ELP 的受益所有人（BO）申报义务。",
    details: {
      points: [
        "对《公司法》与《豁免有限合伙法》作合并修订，纳入此前多项修正",
        "配套《受益所有权登记细则》，强化 BO 申报义务",
        "覆盖公司、LLC、ELP 等多类载体的受益所有人申报",
      ],
      impact:
        "Fund Admin 须协助客户完成受益所有人（BO）信息的准确申报与持续更新；载体类型（公司 / LLC / ELP）不同，申报口径与豁免情形也不同，是日常合规的高频动作。",
      keyItems: ["BO 申报义务", "公司 / LLC / ELP 覆盖", "受益所有权登记细则"],
    },
    url: "https://legislation.gov.ky/cms/images/LEGISLATION/PRINCIPAL/2001/2001-0005/2001-0005_2021%20Revision.pdf",
    tags: ["公司法", "ELP", "受益所有权"],
  },
  {
    id: "bot-act-2023",
    year: 2023,
    law: "Beneficial Ownership Transparency Act, 2023",
    zh: "受益所有权透明度法（2023）",
    kind: "主法",
    highlight: "反洗钱",
    summary:
      "将受益所有人（BO）登记升级为可依规向公众 / 特定主体披露的透明度框架，替代 Part XVIIA。",
    details: {
      points: [
        "将 BO 登记从「仅主管部门可查」升级为可依规披露的透明度框架",
        "替代《公司法》Part XVIIA，强化对空壳公司与隐匿所有权的治理",
        "呼应全球透明化与反洗钱标准（FATF 建议 24/25）",
      ],
      impact:
        "Fund Admin 须更审慎地识别并核验最终受益所有人（UBO），因为 BO 信息可能向公众 / 特定主体披露；客户准入时的「穿透识别」从形式审查走向实质审查。",
      keyItems: ["BO 公开披露框架", "替代 Part XVIIA", "UBO 穿透识别"],
    },
    url: "https://www.cima.ky/upimages/lawsregulations/BeneficialOwnershipTransparencyAct,2023_1705419742.pdf",
    tags: ["受益所有权", "反洗钱", "透明度"],
  },
  {
    id: "companies-amendment-2024",
    year: 2024,
    law: "Companies (Amendment) Act, 2024",
    zh: "公司法（修正）法（2024）",
    kind: "修订",
    highlight: null,
    summary:
      "商业便利化改革：简化减资程序；允许 LLC / 基金会公司转换为豁免公司；允许豁免公司再注册为普通公司。",
    details: {
      points: [
        "新增简化减资程序，降低公司成本与耗时",
        "允许 LLC 与基金会公司转换为豁免公司",
        "允许豁免公司再注册为普通（本地）公司",
      ],
      impact:
        "提升了开曼基金载体的结构灵活性——Fund Admin 在处理基金重组、迁移、转换时有了更多路径选择，减资程序简化也有助于基金清算与资本返还的高效执行。",
      keyItems: ["简化减资程序", "LLC / 基金会 → 豁免公司", "豁免公司 → 普通公司"],
    },
    url: "https://gov.ky/w/the-2024-companies-act-the-merchant-shipping-act",
    tags: ["公司法", "基金载体"],
  },
];

/** 全部主题标签（去重，供筛选条使用） */
export const CAYMAN_LAW_TAGS: string[] = [
  ...new Set(CAYMAN_LAW_TIMELINE.flatMap((m) => m.tags)),
];

/** 高亮主题（用于图例） */
export const CAYMAN_LAW_HIGHLIGHTS: { key: "反洗钱" | "基金"; label: string; desc: string }[] = [
  { key: "反洗钱", label: "反洗钱", desc: "AML/CFT · 受益所有权 · 透明度" },
  { key: "基金", label: "基金", desc: "共同基金 · 私募基金 · 载体" },
];
