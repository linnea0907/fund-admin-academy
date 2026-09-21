/**
 * Fund Admin Wiki — 批量导入层（自动生成，请勿手改）
 *
 * 由 `scripts/build-glossary-import.mjs` 从 `content/glossary/imported.json` 生成。
 * 导入术语请把 JSON 落到 content/glossary/imported.json，再运行 `npm run gen:glossary`（或直接 build）。
 * 维护入口：术语库 → 「术语审核」页签 → 采纳候选 → 导出术语补全包（V1.20.5）。
 *
 * 本次烘焙：29 条导入术语
 * 源文件：content/glossary/imported.json
 */
import type { GlossaryTerm } from "@/types/glossary";

export const IMPORTED_TERMS: GlossaryTerm[] = [
  {
    "id": "ofc",
    "term": "OFC",
    "fullName": "Open-ended Fund Company",
    "zh": "开放式基金型公司",
    "category": "fund-structure",
    "level": "advanced",
    "jurisdiction": [
      "Hong Kong"
    ],
    "definition": "香港《证券及期货条例》下的公司型开放式基金载体：以公司形式设立、可增减股本以配合投资人申购与赎回，分「私人 OFC」与「公众 OFC」两类，须向证监会注册并委任保管人。",
    "whyImportant": "香港此前只有单位信托可做开放式基金，公司型载体无法灵活增减股本；OFC 补上了这一空缺，使香港具备本地注册的公司型开放式基金选项。属地选择（香港 OFC / 开曼 SPC / 新加坡 VCC）会直接影响注册路径、保管安排与税务处理。",
    "scenario": [
      "Fund Setup",
      "Regulatory Filing"
    ],
    "aliases": [
      "Open-ended Fund Company",
      "Open Ended Fund Company",
      "开放式基金型公司"
    ],
    "related": [
      "open-ended-fund",
      "spc",
      "vcc",
      "sfc",
      "custody"
    ],
    "source": [
      "blue-book",
      "sfc"
    ],
    "tags": [
      "香港",
      "基金载体",
      "开放式",
      "证监会"
    ],
    "brief": "香港的公司型开放式基金载体，须向证监会注册并委任保管人。",
    "commonMistakes": [
      "把 OFC 与开曼 SPC、新加坡 VCC 混为一谈（三者注册地、监管机构与股本规则均不同）",
      "默认 OFC 只能公募，忽略私人 OFC 同样存在"
    ]
  },
  {
    "id": "lpf",
    "term": "LPF",
    "fullName": "Limited Partnership Fund",
    "zh": "有限合伙基金（香港）",
    "category": "fund-structure",
    "level": "advanced",
    "jurisdiction": [
      "Hong Kong"
    ],
    "definition": "香港《有限合伙基金条例》设立的基金载体：以有限合伙形式运作，须有至少一名普通合伙人与一名有限合伙人、设有香港注册地址，并委任投资管理人；主要面向私募股权与创投基金。",
    "whyImportant": "LPF 是香港对标开曼豁免有限合伙（ELP）的本土方案，其注册地要求与申报口径与离岸有限合伙不同，直接影响设立地选择与后续合规成本。",
    "scenario": [
      "Fund Setup",
      "Regulatory Filing"
    ],
    "aliases": [
      "Limited Partnership Fund",
      "香港有限合伙基金"
    ],
    "related": [
      "limited-partnership",
      "elp",
      "bvi-lp",
      "gp",
      "lp",
      "lpa",
      "fund-administrator"
    ],
    "source": [
      "blue-book",
      "sfc"
    ],
    "tags": [
      "香港",
      "私募股权",
      "有限合伙",
      "基金载体"
    ],
    "brief": "香港的有限合伙基金制度，主要面向私募股权与创投基金。",
    "commonMistakes": [
      "把 LPF 与开曼 ELP、BVI LP 的注册地与申报义务等同",
      "忽略 LPF 强制委任投资管理人与香港注册地址的要求"
    ]
  },
  {
    "id": "pif",
    "term": "PIF",
    "fullName": "Private Investment Fund",
    "zh": "私人投资基金（BVI）",
    "category": "regulatory",
    "level": "advanced",
    "jurisdiction": [
      "BVI"
    ],
    "definition": "BVI《证券与投资业务法》下的基金类别，专门覆盖封闭式基金（依《Private Investment Funds Regulations》）：以「集合投资并分散投资组合风险」为目的、发行按资产净值比例计算权益的载体，常见于私募股权、创投、不动产与私人信贷基金。",
    "whyImportant": "该类别把 BVI 的封闭式基金纳入监管：判断一只 BVI PE/VC 基金是否需要向 FSC 注册，关键看是否落入 PIF 定义。仅投资单一标的的封闭式基金通常不符合「分散风险」要件，可不受监管——这条区分常被误判。",
    "scenario": [
      "Fund Setup",
      "Regulatory Filing"
    ],
    "aliases": [
      "Private Investment Fund",
      "私人投资基金",
      "BVI PIF"
    ],
    "related": [
      "private-fund",
      "professional-fund",
      "fsc",
      "exempted-company",
      "bvi-lp",
      "closed-ended-fund",
      "spc"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "BVI",
      "封闭式基金",
      "私募股权",
      "FS 注册"
    ],
    "brief": "BVI 覆盖封闭式基金的监管类别，常见于 PE/VC 基金。",
    "commonMistakes": [
      "把 BVI 的 Private Investment Fund（封闭式）与 SIBA 下的 Private Fund / Professional Fund（开放式）当作同一类别",
      "未评估是否满足「分散投资组合风险」要件，就断定单一资产基金可豁免注册"
    ]
  },
  {
    "id": "aiv",
    "term": "AIV",
    "fullName": "Alternative Investment Vehicle",
    "zh": "另类投资载体",
    "category": "fund-structure",
    "level": "advanced",
    "jurisdiction": [
      "Global",
      "USA"
    ],
    "definition": "主基金为特定投资机会或特定投资者群体另行设立的平行投资载体：与主基金投资策略一致，但单独设置投资人资格、费用或税务安排，常见于私募股权、创投与不动产基金。",
    "whyImportant": "关系到「同一策略、多个载体」下的出资、估值与分配如何处理：受 ERISA、税务居民身份或单笔投资上限约束的投资人常要求通过 AIV 参与，Fund Admin 需在资本账户、费用分摊与 NAV 层面分开核算，避免与主基金串账。",
    "scenario": [
      "Fund Setup",
      "Fund Operations",
      "Investor Onboarding"
    ],
    "aliases": [
      "Alternative Investment Vehicle",
      "另类投资载体",
      "平行投资载体"
    ],
    "related": [
      "spv",
      "feeder-fund",
      "master-fund",
      "co-investment",
      "capital-account",
      "erisa"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "平行载体",
      "私募股权",
      "税务安排",
      "分户核算"
    ],
    "brief": "与主基金策略一致的平行载体，用于特定投资人参与。",
    "commonMistakes": [
      "把 AIV 与 SPV 混用：AIV 是平行基金载体，SPV 通常只承接单一投资标的",
      "AIV 与主基金未分别核算资本账户，导致费用分摊与分配口径串账"
    ]
  },
  {
    "id": "rfmc",
    "term": "RFMC",
    "fullName": "Registered Fund Management Company",
    "zh": "注册基金管理公司（新加坡）",
    "category": "regulatory",
    "level": "expert",
    "jurisdiction": [
      "Singapore"
    ],
    "definition": "新加坡金管局曾设的轻监管基金管理人注册类别：可管理不超过 30 名合格投资人、且管理规模设有上限。该制度已于 2024 年 8 月 1 日被 MAS 废止，不再接受新注册；存量机构须转为持牌基金管理公司（A/I LFMC 或 Retail LFMC）。",
    "whyImportant": "判断一家新加坡管理人是否持牌、可服务哪类投资人，前提是知道 RFMC 已不存在。遇到旧架构文件、旧认购文件或旧合规备忘录里写 RFMC 的，应核查该管理人是否已完成转换。",
    "scenario": [
      "Fund Setup",
      "Regulatory Filing"
    ],
    "aliases": [
      "Registered Fund Management Company",
      "注册基金管理公司",
      "新加坡 RFMC"
    ],
    "related": [
      "mas",
      "licensing",
      "aifmd",
      "investment-manager"
    ],
    "source": [
      "mas"
    ],
    "tags": [
      "新加坡",
      "牌照",
      "已废止",
      "基金管理人"
    ],
    "brief": "新加坡已废止的轻监管基金管理人注册类别。",
    "commonMistakes": [
      "沿用旧资料把 RFMC 当作现行可选牌照向客户推荐",
      "未核查客户架构中声明的 RFMC 是否已转为 A/I LFMC"
    ]
  },
  {
    "id": "nfe",
    "term": "NFE",
    "fullName": "Non-Financial Entity",
    "zh": "非金融实体",
    "category": "aeoi",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "CRS 下的实体分类：凡不属于「金融机构（FI）」的实体即为 NFE，按收入与资产构成分为主动型 NFE 与被动型 NFE。被动型 NFE 须穿透识别其控权人并纳入申报。",
    "whyImportant": "尽调中判断账户持有人是 FI 还是 NFE，直接决定是否需要做控权人穿透；把 CRS 的 NFE 与 FATCA 的 NFFE 混用，会导致自我证明表选错分类、后续申报口径错误。",
    "scenario": [
      "Investor Onboarding",
      "AEOI / CRS / FATCA",
      "Periodic Review"
    ],
    "aliases": [
      "Non-Financial Entity",
      "Non Financial Entity",
      "非金融实体"
    ],
    "related": [
      "nffe",
      "active-nfe",
      "passive-nfe",
      "ffi",
      "controlling-person",
      "self-certification",
      "crs"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "CRS",
      "实体分类",
      "控权人",
      "自我证明"
    ],
    "brief": "CRS 下不属于金融机构的实体，被动型须穿透控权人。",
    "commonMistakes": [
      "把 CRS 的 NFE 与 FATCA 的 NFFE 当作同一概念：两套体系的最外层分类名不可互换——CRS 用 NFE（Non-Financial Entity），FATCA 用 NFFE（Non-Financial Foreign Entity），分类逻辑接近但适用法规与判断标准不同",
      "在 CRS 自我证明表里填 NFFE、或在 FATCA 表格（如 W-8BEN-E）里填 NFE，导致分类与表格体系不匹配",
      "对被动型 NFE 未穿透识别控权人即完成尽调"
    ]
  },
  {
    "id": "ppoc",
    "term": "PPOC",
    "fullName": "Principal Point of Contact",
    "zh": "主要联系人",
    "category": "aeoi",
    "level": "expert",
    "jurisdiction": [
      "Cayman"
    ],
    "definition": "开曼税务信息主管当局（DITC）Portal 上的必备角色，与「授权人（Authorising Person）」配对：PPOC 持有 Portal 上的申报权限，负责提交与修改 FATCA/CRS 申报、管理次级用户等操作。两者不得由同一人担任，但由 CIMA 持牌实体担任时可例外；现行规则并已引入 PPOC 须为开曼居民的属地要求，存量机构设有过渡期。",
    "whyImportant": "开曼基金的 FATCA/CRS 申报权限绑定在 PPOC 上：更换基金行政管理人、开户服务商或合规负责人时，必须同步在 Portal 上变更 PPOC 与授权人角色，否则申报无法提交，进而产生逾期申报风险。",
    "scenario": [
      "AEOI / CRS / FATCA",
      "Regulatory Filing",
      "Client Communication"
    ],
    "aliases": [
      "Principal Point of Contact",
      "主要联系人"
    ],
    "related": [
      "ditc-portal",
      "authorising-person",
      "crs-reporting",
      "fatca-reporting",
      "giin",
      "cima",
      "aeoi",
      "account-holder"
    ],
    "source": [
      "cima"
    ],
    "tags": [
      "开曼",
      "AEOI",
      "Portal",
      "申报权限"
    ],
    "brief": "开曼 DITC Portal 上持有申报权限的角色，与授权人配对。",
    "commonMistakes": [
      "更换行政管理人后只交接台账，忘记在 Portal 上变更 PPOC 与授权人",
      "把 PPOC 与授权人安排给同一个自然人（除 CIMA 持牌实体外不被允许）"
    ]
  },
  {
    "id": "ofac",
    "term": "OFAC",
    "fullName": "Office of Foreign Assets Control",
    "zh": "美国财政部外国资产控制办公室",
    "category": "regulatory",
    "level": "advanced",
    "jurisdiction": [
      "USA",
      "Global"
    ],
    "definition": "美国财政部下属机构，负责制定并执行针对特定国家、实体与个人的经济与贸易制裁清单（最广为引用的是 SDN 名单）。凡涉及美元清算、美国人参与或美国境内资产的交易，均可能落入其管辖。",
    "whyImportant": "OFAC 是「金融制裁」与「定向金融制裁」规则的主要来源之一。基金只要涉及美元汇款、美国投资人、美国银行或美国服务提供商，就须做 OFAC 筛查；命中时资金可能被冻结、交易被拒绝，且事后补救空间有限。",
    "scenario": [
      "Investor Onboarding",
      "Periodic Review",
      "Fund Operations"
    ],
    "aliases": [
      "Office of Foreign Assets Control",
      "美国财政部外国资产控制办公室"
    ],
    "related": [
      "sanctions",
      "financial-sanctions",
      "tfs",
      "aml",
      "transaction-monitoring",
      "sec"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "美国",
      "制裁",
      "SDN",
      "美元清算"
    ],
    "brief": "美国财政部制裁执行机构，美元相关交易须筛查其清单。",
    "commonMistakes": [
      "只做名单筛查，不评估交易是否受美国管辖（美元清算 / 美国人参与）",
      "把 OFAC 筛查与 AML 名单筛查合并成一次，漏掉制裁清单的独立口径"
    ]
  },
  {
    "id": "erisa",
    "term": "ERISA",
    "fullName": "Employee Retirement Income Security Act",
    "zh": "美国雇员退休收入保障法",
    "category": "regulatory",
    "level": "expert",
    "jurisdiction": [
      "USA"
    ],
    "definition": "美国规范雇员福利计划（含退休计划）的联邦法律。当基金投资人中包含 ERISA 计划时，基金管理人可能被视为该计划的受托人，从而受 ERISA 的受托责任与禁止交易规则约束，并须关注「计划资产」的认定。",
    "whyImportant": "决定基金是否需要设置 ERISA 计划投资人比例上限：一旦突破法定阈值，基金全部资产会被视为计划资产，连带触发受托责任、禁止交易与信息披露等额外义务。这也是设置 AIV 让养老金单独参与的常见动因。",
    "scenario": [
      "Investor Onboarding",
      "Fund Governance",
      "Fund Setup"
    ],
    "aliases": [
      "Employee Retirement Income Security Act",
      "美国雇员退休收入保障法",
      "ERISA 计划"
    ],
    "related": [
      "aiv",
      "fiduciary-duty",
      "us-person",
      "conflicts-of-interest",
      "sma"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "美国",
      "养老金",
      "受托责任",
      "计划资产"
    ],
    "brief": "美国养老金计划法，投资人含 ERISA 计划时触发计划资产规则。",
    "commonMistakes": [
      "不跟踪 ERISA 计划投资人占比，触发计划资产规则而不自知",
      "在认购文件中未约定 ERISA 投资人上限与转让限制"
    ]
  },
  {
    "id": "cfius",
    "term": "CFIUS",
    "fullName": "Committee on Foreign Investment in the United States",
    "zh": "美国外国投资委员会",
    "category": "regulatory",
    "level": "expert",
    "jurisdiction": [
      "USA"
    ],
    "definition": "美国跨部门委员会，负责审查外国主体对美国企业的投资是否影响国家安全，可要求采取缓解措施，或建议总统阻止交易；特定敏感领域的交易须强制申报。",
    "whyImportant": "涉及美国目标资产或美国业务的私募股权、创投交易，须在交割前评估是否触发 CFIUS 申报：未申报可能被要求撤回交易或附加条件，直接影响交割时间表。Fund Admin 在资金调度与交割条件核对时应确认该环节已完成。",
    "scenario": [
      "Fund Operations",
      "Fund Setup",
      "Regulatory Filing"
    ],
    "aliases": [
      "Committee on Foreign Investment in the United States",
      "美国外国投资委员会"
    ],
    "related": [
      "regulatory-reporting",
      "spv",
      "co-investment",
      "permanent-establishment",
      "sec"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "美国",
      "国家安全审查",
      "跨境投资",
      "交割条件"
    ],
    "brief": "美国外资安全审查机构，跨境并购可能需强制申报。",
    "commonMistakes": [
      "把 CFIUS 当作交割后的可选披露事项，未设为交割前置条件",
      "仅看目标公司注册地，忽略其实际业务是否构成「美国业务」"
    ]
  },
  {
    "id": "pfic",
    "term": "PFIC",
    "fullName": "Passive Foreign Investment Company",
    "zh": "被动外国投资公司",
    "category": "tax",
    "level": "expert",
    "jurisdiction": [
      "USA"
    ],
    "definition": "美国税法下的公司分类：非美国公司若其收入的 75% 以上为被动收入，或其资产平均 50% 以上产生被动收入，即构成 PFIC。美国投资人持有 PFIC 股权须适用特殊税务处理（如合格选择基金或按市值计价选择），否则面临惩罚性税负。",
    "whyImportant": "直接决定美国投资人在基金中的税务成本与信息取得义务：基金一旦被认定为 PFIC，管理人通常须向美国投资人提供年度信息声明，以支持其完成申报；信息缺失会把税务风险转嫁给投资人。",
    "scenario": [
      "AEOI / CRS / FATCA",
      "Investor Onboarding",
      "Fund Governance"
    ],
    "aliases": [
      "Passive Foreign Investment Company",
      "被动外国投资公司"
    ],
    "related": [
      "cfc",
      "tax-transparent-entity",
      "us-person",
      "eci",
      "ubti",
      "w9",
      "tin"
    ],
    "source": [
      "blue-book"
    ],
    "tags": [
      "美国税务",
      "被动收入",
      "美国投资人",
      "信息申报"
    ],
    "brief": "美国税法下以被动收入为主的外国公司，美国投资人税负显著上升。",
    "commonMistakes": [
      "在认购阶段未识别美国投资人，导致后续 PFIC 信息义务无法履行",
      "把 PFIC 与 CFC 当作同一分类（判定标准与后果均不同）"
    ]
  },
  {
    "id": "ditc-portal",
    "term": "DITC Portal",
    "fullName": "Department for International Tax Cooperation Portal",
    "zh": "DITC 门户",
    "category": "aeoi",
    "level": "advanced",
    "jurisdiction": [
      "Cayman"
    ],
    "definition": "开曼税务信息主管当局（TIA）通过国际税务合作部（DITC）运营的线上申报门户，是开曼金融机构履行 AEOI 义务的唯一线上通道：机构注册（Notification）、FATCA 与 CRS 年度申报、合规表（Compliance Form）与申报声明、PPOC 与授权人的变更，均须经该门户提交。",
    "whyImportant": "开曼的 AEOI 义务是「门户化」的：未完成 Notification 注册即无从申报，而门户权限绑定在登记用户账号上——行政管理人可以维护台账，但只有门户上的登记用户才能完成提交。DITC 隶税务信息主管当局，与 CIMA 分属两套体系，CIMA 牌照不能替代门户注册。",
    "scenario": [
      "AEOI / CRS / FATCA",
      "Regulatory Filing",
      "Fund Setup"
    ],
    "aliases": [
      "DITC Portal",
      "TIA 门户",
      "TIA Portal",
      "Cayman AEOI Portal"
    ],
    "related": [
      "ppoc",
      "authorising-person",
      "crs-reporting",
      "fatca-reporting",
      "cima",
      "aeoi"
    ],
    "source": [
      "cima"
    ],
    "tags": [
      "开曼",
      "AEOI",
      "申报通道",
      "门户权限"
    ],
    "brief": "开曼 AEOI 申报的唯一线上通道，申报权限绑定登记用户账号。",
    "commonMistakes": [
      "把 DITC 门户当作 CIMA 的系统：DITC 隶税务信息主管当局（TIA），与 CIMA 分属两套体系，牌照与门户注册互不替代",
      "更换行政管理人或合规负责人后只做内部交接，未在门户上同步变更 PPOC 与授权人，导致申报无人有权提交"
    ]
  },
  {
    "id": "authorising-person",
    "term": "Authorising Person",
    "fullName": "Authorising Person",
    "zh": "授权人（开曼）",
    "category": "aeoi",
    "level": "expert",
    "jurisdiction": [
      "Cayman"
    ],
    "definition": "开曼 DITC 门户上与主要联系人（PPOC）配对任命的角色：授权人有权就 PPOC 的身份变更向税务信息主管当局发出变更通知，据此在 PPOC 离任或失联时保证申报权限可以交接。其权限范围小于 PPOC（PPOC 掌握申报提交权，授权人掌握 PPOC 变更权），两者须分别任命，除由 CIMA 持牌实体担任等特定情形外不得为同一人。",
    "whyImportant": "授权人是基金 AEOI 权限的「备用钥匙」：PPOC 一旦离任、失联或拒不配合，只有授权人能发起 PPOC 变更；若门户上只登记了 PPOC 而未登记授权人，基金将无人有权更换 PPOC，申报随即中断。任命须有董事、受托人或普通合伙人签署的授权函作为依据。",
    "scenario": [
      "AEOI / CRS / FATCA",
      "Regulatory Filing",
      "Client Communication"
    ],
    "aliases": [
      "Authorising Person",
      "Authorizing Person"
    ],
    "related": [
      "ppoc",
      "ditc-portal",
      "crs-reporting",
      "fatca-reporting",
      "cima"
    ],
    "source": [
      "cima"
    ],
    "tags": [
      "开曼",
      "AEOI",
      "门户权限",
      "角色分离"
    ],
    "brief": "开曼门户上负责发起 PPOC 变更的角色，与 PPOC 配对且原则上不得同一人。",
    "commonMistakes": [
      "安排同一人同时担任 PPOC 与授权人，使角色分离失效（除由 CIMA 持牌实体担任等特定情形外不被允许）",
      "只登记 PPOC 而漏登记授权人：门户上两个角色须同时齐备，否则 PPOC 变更无从发起",
      "把授权人当成 PPOC 的「副手」或代理人，误以为其也能提交申报（授权人权限仅及于 PPOC 的身份变更）"
    ]
  },
  {
    "id": "cash-intensive-business",
    "term": "Cash Intensive Business",
    "fullName": "Cash Intensive Business",
    "zh": "现金密集行业",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "经营活动中大量以现金结算、难以追踪资金来源的行业，典型如餐饮、零售、娱乐、博彩、加油站、便利店与典当行。犯罪分子利用这类行业「现金进、账面出」的特征，把犯罪所得混入合法营收，构成洗钱放置阶段（placement）的常见入口。",
    "whyImportant": "现金密集行业是洗钱放置阶段的高风险地带：Fund Admin 若投资人或其资金来源涉及此类行业，应提高受益所有人穿透与资金来源核验的标准，现金交易无法留痕决定了尽调只能依赖更强的经营实质审查。",
    "scenario": [
      "Investor Onboarding",
      "Periodic Review"
    ],
    "aliases": [
      "Cash Intensive Business",
      "Cash-Intensive Business",
      "现金密集型行业"
    ],
    "related": [
      "aml",
      "mlro",
      "str",
      "ubo",
      "sof",
      "transaction-monitoring",
      "private-banking",
      "third-party-payment-channel"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "洗钱放置",
      "现金",
      "高风险行业",
      "资金来源"
    ],
    "brief": "以现金结算为主、资金难留痕的行业，是洗钱放置阶段的常见入口。",
    "commonMistakes": [
      "把现金密集行业一律判定为高风险，忽略其经营规模与合规成熟度的差异"
    ]
  },
  {
    "id": "nested-account",
    "term": "Nested Account",
    "fullName": "Nested Account",
    "zh": "嵌套账户",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "境外银行通过其在另一家银行开立的代理账户，向自己的下游客户「转租」银行服务所形成的多层级账户结构。下游客户的身份与交易对代理行不可见，资金可跨越多层离岸账户流转，制造追查断点。",
    "whyImportant": "嵌套账户是代理行业务的高风险形态：中间机构层层转手后，真正客户与资金用途完全脱离代理行的尽调视野。Fund Admin 在核查境外收款路径或代理行链路时，须警惕多层嵌套导致的受益所有人不明。",
    "scenario": [
      "Investor Onboarding",
      "Fund Operations",
      "Periodic Review"
    ],
    "aliases": [
      "Nested Account",
      "嵌套账户",
      "转租账户"
    ],
    "related": [
      "correspondent-banking",
      "aml",
      "cdd",
      "ubo",
      "transaction-monitoring"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "代理行",
      "离析",
      "受益所有人",
      "账户层级"
    ],
    "brief": "代理账户被中间机构层层转租形成的多层账户结构，客户与资金对代理行不可见。",
    "commonMistakes": [
      "只尽调直接客户，忽略其通过嵌套账户向下游客户转租服务的风险"
    ]
  },
  {
    "id": "correspondent-banking",
    "term": "Correspondent Banking",
    "fullName": "Correspondent Banking",
    "zh": "代理行",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "一家银行（代理行，correspondent bank）为另一家银行（委托行，respondent bank）提供账户与清算服务，使其客户得以在自身未设网点或清算渠道的辖区完成收付。代理行通常不直接接触委托行的客户，依赖委托行自行完成客户尽调。",
    "whyImportant": "代理行业务是跨境资金流转的基础设施，也是 FATF 点名的高风险领域：代理行对委托行客户「看不见」，若委托行尽调缺失，犯罪资金即可借道进入国际清算体系。Fund Admin 处理跨境收款时，应识别路径中是否涉及代理行及其尽调充分性。",
    "scenario": [
      "Fund Operations",
      "Investor Onboarding"
    ],
    "aliases": [
      "Correspondent Banking",
      "代理行业务",
      "通汇业务"
    ],
    "related": [
      "nested-account",
      "aml",
      "cdd",
      "transaction-monitoring",
      "fatf"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "跨境清算",
      "代理行",
      "FATF",
      "银行"
    ],
    "brief": "银行间互为代理提供清算服务的业务，代理行对委托行客户尽调不可见。",
    "commonMistakes": [
      "把代理行与委托行客户尽调责任混同，误以为代理行应直接尽调终端客户"
    ]
  },
  {
    "id": "private-banking",
    "term": "Private Banking",
    "fullName": "Private Banking",
    "zh": "私人银行",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "面向高净值个人提供定制化财富管理、投资、信托与跨境资产配置等服务的银行业务。因客户关系高度个性化、客户与银行家（relationship manager）之间信任深、交易金额大且跨境频繁，长期被列为洗钱与逃税的高风险通道。",
    "whyImportant": "私人银行的「信任 + 定制 + 跨境」组合是 AML 的典型薄弱点：关系经理可能协助客户隐匿资产或规避审查。Fund Admin 在对接私人银行账户或高净值投资人时，须特别核验资金来源与实益所有人，防止被用作离析或整合环节。",
    "scenario": [
      "Investor Onboarding",
      "Periodic Review"
    ],
    "aliases": [
      "Private Banking",
      "私人银行",
      "财富管理"
    ],
    "related": [
      "aml",
      "pep",
      "ubo",
      "sof",
      "sow",
      "edd",
      "cash-intensive-business",
      "correspondent-banking"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "高净值",
      "财富管理",
      "跨境",
      "高风险"
    ],
    "brief": "面向高净值个人的定制化银行业务，跨境与信任关系构成高风险。",
    "commonMistakes": [
      "把私人银行客户默认视为低风险，忽略关系经理与客户的深度绑定带来的审查盲区"
    ]
  },
  {
    "id": "insider-trading",
    "term": "Insider Trading",
    "fullName": "Insider Trading",
    "zh": "内幕交易",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global",
      "Hong Kong",
      "USA"
    ],
    "definition": "掌握未公开、足以影响证券价格的内幕信息的人，在该信息公开前买卖相关证券或泄露该信息供他人交易的行为。内幕信息通常源于公司重大事件（并购、业绩、重大合同）或掌握信息的中介机构。",
    "whyImportant": "内幕交易是证券市场的典型金融犯罪，也是资金进入基金体系的常见来源之一：证券资管行业尤其暴露。Fund Admin 在核查投资人资金来源与交易行为时，若发现异常时点交易或内幕信息关联，应升级审查。",
    "scenario": [
      "Investor Onboarding",
      "Periodic Review",
      "Fund Operations"
    ],
    "aliases": [
      "Insider Trading",
      "内幕交易",
      "内幕买卖"
    ],
    "related": [
      "market-manipulation",
      "sec",
      "aml",
      "regulatory-reporting",
      "sof"
    ],
    "source": [
      "blue-book",
      "sfc"
    ],
    "tags": [
      "证券",
      "内幕信息",
      "市场失当",
      "犯罪所得"
    ],
    "brief": "利用未公开内幕信息买卖证券的行为，是证券市场典型金融犯罪。",
    "commonMistakes": [
      "只关注上市公司内部人，忽略中介机构、关联方等「临时内幕人」同样可构成内幕交易"
    ]
  },
  {
    "id": "market-manipulation",
    "term": "Market Manipulation",
    "fullName": "Market Manipulation",
    "zh": "市场操纵",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global",
      "Hong Kong",
      "USA"
    ],
    "definition": "通过虚假交易、误导性报价、散布不实信息或其他手段，人为扭曲证券价格或交易量、制造虚假市场活跃假象的行为。常见手法包括对倒（wash trading）、拉抬出货（pump and dump）、虚假申报等。",
    "whyImportant": "市场操纵制造虚假价格信号，直接损害市场完整性；操纵所得同样是犯罪所得，可借基金与资管产品进入体系。Fund Admin 对异常交易模式与可疑资金进出应保持警觉，必要时触发可疑交易报告。",
    "scenario": [
      "Investor Onboarding",
      "Fund Operations",
      "Periodic Review"
    ],
    "aliases": [
      "Market Manipulation",
      "市场操纵",
      "操纵市场"
    ],
    "related": [
      "insider-trading",
      "sec",
      "aml",
      "str",
      "transaction-monitoring"
    ],
    "source": [
      "blue-book",
      "sfc"
    ],
    "tags": [
      "证券",
      "价格扭曲",
      "市场失当",
      "可疑交易"
    ],
    "brief": "人为扭曲证券价格或交易量的行为，制造虚假市场假象。",
    "commonMistakes": [
      "把市场操纵等同于内幕交易，二者行为要件与证据重点不同"
    ]
  },
  {
    "id": "third-party-payment-channel",
    "term": "Third Party Payment Channel",
    "fullName": "Third Party Payment Channel",
    "zh": "第三方通道",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "资金经由与交易无关的第三方账户或支付渠道完成划转，使名义付款人与实际资金受益人脱钩。MSB 与支付机构场景中，犯罪分子常把大额资金分拆到多个第三方通道划转，规避单一账户的额度与尽调触发点。",
    "whyImportant": "第三方通道分拆资金是规避交易监控的典型手法：Fund Admin 收款时若发现缴付主体与认购人名称不一致、多笔小额经不同第三方汇入，须澄清资金真实来源后再入账，否则可能承接来历不明资金。",
    "scenario": [
      "Fund Operations",
      "Investor Onboarding",
      "Periodic Review"
    ],
    "aliases": [
      "Third Party Payment Channel",
      "Third Party Payment",
      "第三方通道",
      "第三方支付通道",
      "第三方代付"
    ],
    "related": [
      "aml",
      "sof",
      "transaction-monitoring",
      "str",
      "ubo",
      "fictitious-transaction",
      "overpayment-scheme"
    ],
    "source": [
      "blue-book",
      "ics"
    ],
    "tags": [
      "分拆资金",
      "第三方",
      "支付通道",
      "MSB"
    ],
    "brief": "资金经无关第三方账户划转使名义付款人与实际受益人脱钩的通道。",
    "commonMistakes": [
      "把第三方通道一律当作技术问题处理，忽略其背后的资金分拆与受益人不明风险"
    ]
  },
  {
    "id": "fictitious-transaction",
    "term": "Fictitious Transaction",
    "fullName": "Fictitious Transaction",
    "zh": "虚构交易",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "并无真实商业实质、仅为资金划转制造表面理由的交易。MSB 与支付场景中，犯罪分子以虚构的商品或服务交易为名，把非法资金包装成看似合法的收付，实现资金性质转换。",
    "whyImportant": "虚构交易是离析阶段「制造合法假象」的核心手段：没有真实货物或服务，资金进出就只是账面游戏。Fund Admin 在核查投资人业务背景与资金往来时，须关注交易对手、单据与资金流是否自洽，识别无商业实质的资金流转。",
    "scenario": [
      "Fund Operations",
      "Investor Onboarding",
      "Periodic Review"
    ],
    "aliases": [
      "Fictitious Transaction",
      "虚拟交易",
      "虚构交易",
      "虚假交易"
    ],
    "related": [
      "aml",
      "transaction-monitoring",
      "sof",
      "str",
      "mlro",
      "trade-mispricing",
      "third-party-payment-channel"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "离析",
      "虚假交易",
      "商业实质",
      "MSB"
    ],
    "brief": "无真实商业实质、仅为资金划转制造理由的交易。",
    "commonMistakes": [
      "仅核对单据表面完整性，未验证交易背后的真实商业实质与资金流自洽性"
    ]
  },
  {
    "id": "overpayment-scheme",
    "term": "Overpayment Scheme",
    "fullName": "Overpayment Scheme",
    "zh": "超额缴费",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "以明显超出应缴金额的方式缴纳保费或款项，随后要求将超出部分退还至第三方账户或退款至与原始付款人无关的账户。保险场景中常表现为「趸缴大额保费后迅速退保」，把一笔资金从名义付款人转移到实际受益人。",
    "whyImportant": "超额缴费后退款至第三方，本质是把非法资金「洗白再分流」：缴费建立表面合法来源，退款完成受益转移。Fund Admin 对投资人超额缴款并指示退款至第三方的行为应高度警惕，须澄清退款对象与原始缴款人的关系。",
    "scenario": [
      "Fund Operations",
      "Investor Onboarding"
    ],
    "aliases": [
      "Overpayment Scheme",
      "超额缴费",
      "超额缴款",
      "退保退款"
    ],
    "related": [
      "aml",
      "sof",
      "transaction-monitoring",
      "str",
      "ubo",
      "third-party-payment-channel",
      "fictitious-transaction"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "保险",
      "退款",
      "资金分流",
      "超额"
    ],
    "brief": "超额缴费后要求退款至第三方，实现资金洗白与受益转移的手法。",
    "commonMistakes": [
      "把超额缴款当作普通操作差错退款处理，未识别其退款对象与原始付款人脱钩的风险"
    ]
  },
  {
    "id": "crypto-mixer",
    "term": "Crypto Mixer",
    "fullName": "Crypto Mixer",
    "zh": "混币",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "把多笔来源不同的虚拟资产汇集、打乱并重新分配，从而切断交易输入与输出之间可追踪关联的服务（又称混币服务，mixing / tumbling）。犯罪分子借此隐藏虚拟资产流向，规避链上分析与追踪。",
    "whyImportant": "混币器是虚拟资产领域离析阶段的核心工具：一旦资金经混币处理，链上追踪断点难以复原。Fund Admin 在受理虚拟资产出资或核查涉及虚拟资产的资金来源时，应识别是否经混币器流转，必要时拒绝或升级审查。",
    "scenario": [
      "Investor Onboarding",
      "Fund Operations",
      "Periodic Review"
    ],
    "aliases": [
      "Crypto Mixer",
      "Mixer",
      "混币器",
      "混币服务"
    ],
    "related": [
      "aml",
      "privacy-coin",
      "transaction-monitoring",
      "str",
      "travel-rule"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "虚拟资产",
      "离析",
      "链上追踪",
      "匿名"
    ],
    "brief": "汇集并打乱多笔虚拟资产以切断交易关联的服务，隐藏资金流向。",
    "commonMistakes": [
      "把混币器当作普通的隐私工具，忽略其切断交易追踪、掩盖资金来源的洗钱功能"
    ]
  },
  {
    "id": "privacy-coin",
    "term": "Privacy Coin",
    "fullName": "Privacy Coin",
    "zh": "隐私币",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "在协议层默认隐藏交易金额、发送方与接收方等链上信息的虚拟资产（典型如 Monero、Zcash 的遮蔽地址）。与比特币「伪匿名」不同，隐私币的链上交易信息对第三方不可见，追溯难度显著更高。",
    "whyImportant": "隐私币把虚拟资产从「伪匿名」推向「真匿名」：交易双方与金额均不可见，传统链上分析手段基本失效。Fund Admin 在涉及虚拟资产的尽调中，应识别是否使用隐私币并相应提高审查强度，多家监管机构已对隐私币交易采取限制。",
    "scenario": [
      "Investor Onboarding",
      "Fund Operations",
      "Periodic Review"
    ],
    "aliases": [
      "Privacy Coin",
      "隐私币",
      "匿名币"
    ],
    "related": [
      "aml",
      "crypto-mixer",
      "transaction-monitoring",
      "travel-rule",
      "str"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "虚拟资产",
      "匿名",
      "链上不可见",
      "高风险"
    ],
    "brief": "协议层默认隐藏交易信息的虚拟资产，链上追溯难度显著更高。",
    "commonMistakes": [
      "把隐私币与比特币等伪匿名币等同，低估其链上信息完全不可见带来的追溯失效"
    ]
  },
  {
    "id": "travel-rule",
    "term": "Travel Rule",
    "fullName": "Travel Rule",
    "zh": "旅行规则",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global",
      "USA"
    ],
    "definition": "金融行动特别工作组（FATF）Recommendation 16 确立的规则：金融机构与虚拟资产服务提供商在办理资金划转时，须随交易传递并取得「发起人」与「受益人」的指定身份信息，使资金流转全程可追溯。",
    "whyImportant": "旅行规则是虚拟资产领域「让交易可追踪」的关键义务：传统电汇已有成熟报文体系，而虚拟资产转账的发起人与受益人信息传递长期缺失，构成匿名洗钱漏洞。Fund Admin 处理虚拟资产收付时应关注服务商是否履行旅行规则义务。",
    "scenario": [
      "Fund Operations",
      "Investor Onboarding",
      "Regulatory Filing"
    ],
    "aliases": [
      "Travel Rule",
      "旅行规则",
      "FATF 旅行规则"
    ],
    "related": [
      "fatf",
      "aml",
      "transaction-monitoring",
      "crypto-mixer",
      "privacy-coin"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "FATF",
      "虚拟资产",
      "信息传递",
      "可追溯"
    ],
    "brief": "FATF 确立的资金划转须随附发起人与受益人身份信息的规则。",
    "commonMistakes": [
      "把旅行规则仅理解为传统电汇义务，忽略其对虚拟资产转账的同等适用"
    ]
  },
  {
    "id": "trade-mispricing",
    "term": "Trade Mispricing",
    "fullName": "Trade Mispricing",
    "zh": "价量失真",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "在跨境贸易中人为高报或低报商品价格、数量或价值（over/under-invoicing），使实际资金流与真实货值脱节，实现资金跨境转移或隐藏利润。是贸易洗钱（Trade-based Money Laundering，TBML）的核心手段之一。",
    "whyImportant": "价量失真把资金转移隐藏在看似正常的贸易单据背后：发票金额与真实货值不符，资金差额即为被转移的非法资金。Fund Admin 在涉及贸易背景的投资人或资金往来中，应关注单据与货值是否自洽，识别 TBML 风险。",
    "scenario": [
      "Investor Onboarding",
      "Fund Operations",
      "Periodic Review"
    ],
    "aliases": [
      "Trade Mispricing",
      "价量失真",
      "贸易价量失真",
      "高报低报"
    ],
    "related": [
      "aml",
      "sof",
      "transaction-monitoring",
      "str",
      "mlro",
      "fictitious-transaction",
      "shell-company"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "贸易洗钱",
      "TBML",
      "跨境贸易",
      "单据"
    ],
    "brief": "跨境贸易中高报或低报价格数量使资金流与货值脱节，实现资金转移。",
    "commonMistakes": [
      "只核对贸易单据形式完整性，未交叉验证发票金额与实际货值的合理性"
    ]
  },
  {
    "id": "gatekeeper",
    "term": "Gatekeeper",
    "fullName": "Gatekeeper",
    "zh": "守门人",
    "category": "aml-kyc",
    "level": "advanced",
    "jurisdiction": [
      "Global"
    ],
    "definition": "掌握金融体系「入口」、其专业服务被犯罪分子利用来设立架构或掩饰资金的职业群体，典型如律师、会计师、公司服务提供商（TCSP）、信托与不动产中介。守门人可能被用于批量设立空壳公司、代名董事或不保存实益所有权。",
    "whyImportant": "守门人是 FATF 重点关注的「被利用节点」：他们掌握架构入口与专业声誉，一旦被渗透，可为犯罪资金提供规模化、专业化的清洗通道。Fund Admin 尽调时应关注客户架构是否经由守门人批量设立、是否配合穿透实益所有人。",
    "scenario": [
      "Investor Onboarding",
      "Fund Setup",
      "Periodic Review"
    ],
    "aliases": [
      "Gatekeeper",
      "守门人",
      "门卫人",
      "专业守门人"
    ],
    "related": [
      "tcsp",
      "corporate-services-provider",
      "shell-company",
      "ubo",
      "mlro",
      "str"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "守门人",
      "律师",
      "会计师",
      "TCSP",
      "FATF"
    ],
    "brief": "掌握金融体系入口、可能被利用来设立架构或掩饰资金的职业群体。",
    "commonMistakes": [
      "把守门人当作普通服务商对待，忽略其批量设立空壳公司、代名董事等被利用风险"
    ]
  },
  {
    "id": "tcsp",
    "term": "TCSP",
    "fullName": "Trust or Company Service Provider",
    "zh": "信托或公司服务提供商",
    "category": "legal-entity",
    "level": "advanced",
    "jurisdiction": [
      "Hong Kong",
      "BVI",
      "Cayman",
      "Global"
    ],
    "definition": "为他人提供信托设立、公司注册、注册地址、代名董事/股东、公司秘书等服务的专业机构（Trust or Company Service Provider）。TCSP 因能批量创设离岸架构，被多法域列为须持牌或注册并承担 AML 义务的主体。",
    "whyImportant": "TCSP 是「架构入口」的集大成者：一个 TCSP 可批量设立大量空壳公司与信托，成为守门人风险最集中的环节。Fund Admin 接触的基金架构若由 TCSP 搭建，须核验其牌照/注册与尽调质量，并穿透最终实益所有人。",
    "scenario": [
      "Fund Setup",
      "Investor Onboarding",
      "Regulatory Filing"
    ],
    "aliases": [
      "TCSP",
      "Trust or Company Service Provider",
      "信托或公司服务提供商",
      "信托与公司服务商"
    ],
    "related": [
      "corporate-services-provider",
      "gatekeeper",
      "shell-company",
      "nominee",
      "registered-agent",
      "ubo"
    ],
    "source": [
      "blue-book",
      "sfc",
      "cima"
    ],
    "tags": [
      "TCSP",
      "牌照",
      "架构入口",
      "代名"
    ],
    "brief": "为他人提供信托设立与公司注册等服务的专业机构，多法域须持牌或注册。",
    "commonMistakes": [
      "把 TCSP 与 Fund Administrator 混同，忽略其批量创设架构带来的守门人风险"
    ]
  },
  {
    "id": "shell-company",
    "term": "Shell Company",
    "fullName": "Shell Company",
    "zh": "空壳公司",
    "category": "legal-entity",
    "level": "advanced",
    "jurisdiction": [
      "Global",
      "BVI",
      "Cayman",
      "Hong Kong"
    ],
    "definition": "不开展实际经营、无实质雇员或营业场所、仅作为持有资产或资金划转「外壳」而设立的法律实体。空壳公司本身合法，但常被用于隐匿实益所有人、规避审查或离析资金，成为守门人批量设立架构的常见载体。",
    "whyImportant": "空壳公司是受益所有人穿透的最大障碍之一：层层空壳叠加后，真实控制人深藏其后。Fund Admin 尽调时不能止步于空壳公司本身，须沿架构链向上穿透，识别最终实益所有人并评估其设立真实目的。",
    "scenario": [
      "Investor Onboarding",
      "Fund Setup",
      "Periodic Review"
    ],
    "aliases": [
      "Shell Company",
      "空壳公司",
      "壳公司"
    ],
    "related": [
      "ubo",
      "nominee",
      "nominee-director",
      "gatekeeper",
      "tcsp",
      "corporate-services-provider"
    ],
    "source": [
      "blue-book",
      "cima"
    ],
    "tags": [
      "空壳",
      "穿透",
      "受益所有人",
      "架构"
    ],
    "brief": "无实际经营、仅作资产持有或资金划转外壳而设立的法律实体。",
    "commonMistakes": [
      "把空壳公司一律视为违法，或反之止步于空壳公司而不向上穿透实益所有人"
    ]
  },
];
