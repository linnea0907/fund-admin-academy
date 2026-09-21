/**
 * Fund Admin Wiki — 批量导入层（自动生成，请勿手改）
 *
 * 由 `scripts/build-glossary-import.mjs` 从 `content/glossary/imported.json` 生成。
 * 导入术语请把 JSON 落到 content/glossary/imported.json，再运行 `npm run gen:glossary`（或直接 build）。
 * 维护入口：术语库 → 「术语审核」页签 → 采纳候选 → 导出术语补全包（V1.20.5）。
 *
 * 本次烘焙：13 条导入术语
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
];
