import type { Lesson } from "@/types";

/**
 * Fund Admin Academy — 课程数据（单文件，后续内容迭代只替换本文件）
 *
 * 课程目录为既有学习中心的 6 讲结构，勿重排：
 * 01 一只境外基金如何运转 · 02 基金结构全景 · 03 Cayman 基金核心框架
 * 04 AML 与投资者尽调 · 05 FATCA 与 CRS · 06 BVI 基金与管理人
 */
export const lessons: Lesson[] = [
  {
    id: "01",
    slug: "fund-lifecycle",
    title: "一只境外基金如何运转",
    subtitle: "从设立到清算：离岸私募基金的全生命周期运作地图",
    goal: [
      "理解一只境外基金从发起、架构、募集到投资运营、退出的完整生命周期",
      "分清基金运作中各方角色：GP、LP、行政管理人、托管人、审计师、律师",
      "掌握资金流向：认购、投资、分配、费用发生的环节与顺序",
      "建立“基金不是注册完就结束，而是持续运营与合规”的全局观",
    ],
    modules: [
      {
        id: "m1",
        title: "1.1 一只基金的生命周期总览",
        body: [
          "境外私募基金（以开曼 Cayman、BVI 为代表的离岸基金最为常见）通常经历五个阶段：发起设立 → 架构搭建 → 募集 → 投资与投后管理 → 分配与退出。理解每个阶段的参与方、文件与资金动作，是看懂一切基金文件的基础。",
          "多数离岸基金采用 GP/LP 结构：普通合伙人（GP）负责管理执行，有限合伙人（LP）出资并承担有限责任。GP 通常由基金管理人（Investment Manager）担任或关联担任，二者在开曼经济实质、注册与税务申报中角色不同，需分开理解。",
        ],
        points: [
          "设立阶段：选定法域（Cayman/BVI）与载体（豁免公司/ELP），任命注册代理、注册办事处、首任董事",
          "运营文件：LPA/公司章程、PPM/IM、认购文件、行政管理协议、托管协议",
          "生命线：基金靠募集-投资-回报运转，行政管理人记录 NAV 是价值核算核心",
        ],
      },
      {
        id: "m2",
        title: "1.2 募集阶段：钱从哪里来",
        body: [
          "募集即向合格投资者出售基金权益。离岸基金面向的通常是专业/合格投资者（如机构、家族办公室、高净值个人），因此多数可豁免公开募集监管，但仍需满足各法域的投资者适当性要求（如 Cayman 的 Sophisticated/Institutional 认定）。",
          "投资者通过认购协议（Subscription Agreement）出资，并提交 KYC/AML 资料与税务自我证明（CRS/FATCA 相关）。认购款在基金开立、投资者批准（GP 有权拒绝）后进入基金账户。",
        ],
        points: [
          "募集前必备：PPM（Private Placement Memorandum）——基金的“说明书”",
          "投资者适当性与 AML/KYC 是募集环节的两条硬性审查线",
          "首关/后续关（Initial/Final Closing）决定份额净值与费用起算",
        ],
      },
      {
        id: "m3",
        title: "1.3 投资与运营：钱如何被管理",
        body: [
          "基金管理人按投资策略（PE/VC/对冲/信贷/房地产等）寻找标的、投出资金。在私募股权基金中，投资者承诺（Commitment）分批缴款（Capital Call），管理人按项目需求向 LP 发出缴款通知。",
          "日常运营由行政管理员（Fund Administrator）负责净值计算（NAV）、份额登记（Transfer Agency）、账务与投资者报表；托管人（Custodian）或主经纪商（Prime Broker，对冲基金常见）保管资产；审计师每年出具经审计财务报表。",
        ],
        points: [
          "资本承诺制（Drawdown/Capital Call）是私募股权基金区别于对冲基金的核心机制",
          "NAV 计算错误会引发赎回与费用争议，行政管理员职责重大",
          "运营合规贯穿全年：AEOI 申报、审计、投资者年度报告、备案更新",
        ],
      },
      {
        id: "m4",
        title: "1.4 分配、退出与清算",
        body: [
          "基金投资组合逐步退出（IPO、并购转让、分红等），收益按 LPA 约定瀑布（Waterfall）分配：先返还本金，再支付优先回报（Preferred Return），管理人按 80/20（或约定比例）获得附带权益（Carried Interest）。",
          "基金到期后进入清算：出售剩余资产、清偿负债、向 LP 做终期分配，随后向注册地完成注销（Strike Off / Voluntary Liquidation）。实务中基金常设 2+4+1 等延长期安排。",
        ],
        points: [
          "瀑布分配顺序写死在 LPA，谈判重点在优先回报率与回拨（Clawback）条款",
          "附带权益的管理人税务结构（如透过 GP/合伙实体）影响实际税负",
          "清算与注销需满足经济实质与归档要求，避免遗留合规风险",
        ],
      },
    ],
    risks: [
      {
        title: "把“注册完成”误当“万事大吉”",
        detail:
          "基金是持续运营主体：年度审计、AEOI 申报、CIMA/FSC 备案续费、经济实质申报缺一不可。断缴政府年费会导致被除名（Struck Off），处理成本远高于年费。",
      },
      {
        title: "募集环节 KYC 疏漏",
        detail:
          "对投资者尽调不充分（制裁名单、PEP、受益所有人不清）会直接违反 AML 法规，监管处罚之外还牵连托管银行、审计师的持续合作意愿。",
      },
      {
        title: "NAV 计算与信息披露偏差",
        detail:
          "净值核算错误或估值政策不透明，会引发 LP 赎回争议与声誉损失。离岸基金条例普遍要求披露估值原则与相关方交易。",
      },
      {
        title: "资本调用与流动性错配",
        detail:
          "Capital Call 发晚了错过项目交割、发早了违反 LPA 上限，都可能构成违约；需有清晰的缴款与违约处理机制（Default Provision）。",
      },
    ],
    mindmap: {
      label: "一只境外基金如何运转",
      note: "全生命周期五阶段",
      children: [
        { label: "发起设立", children: [{ label: "选法域" }, { label: "载体 GP/LP" }, { label: "注册代理" }] },
        { label: "架构搭建", children: [{ label: "LPA / 章程" }, { label: "PPM" }, { label: "行政管理人" }] },
        { label: "募集", children: [{ label: "认购文件" }, { label: "KYC/AML" }, { label: "资本承诺" }] },
        { label: "投资运营", children: [{ label: "Capital Call" }, { label: "投后管理" }, { label: "NAV 核算" }] },
        { label: "退出分配", children: [{ label: "Waterfall" }, { label: "附带权益" }, { label: "清算注销" }] },
        { label: "持续合规", children: [{ label: "审计" }, { label: "AEOI" }, { label: "年费续牌" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "离岸私募股权基金中，投资者（LP）的资金通常如何进入基金？",
        options: [
          "一次性全额缴付",
          "按基金管理人发出的 Capital Call 分批缴付",
          "通过公开市场买入份额",
          "向托管人直接借贷",
        ],
        answer: 1,
        explanation:
          "私募股权基金普遍采用承诺资本制（Commitment），投资者认购承诺额，管理人按项目需要分批发出缴款通知（Capital Call）。",
      },
      {
        id: "q2",
        question: "基金净值（NAV）核算通常由哪一方负责？",
        options: ["普通合伙人 GP", "行政管理员 Fund Administrator", "审计师", "托管银行"],
        answer: 1,
        explanation:
          "行政管理员（Fund Administrator）负责 NAV 计算、份额登记与投资者报表；审计师负责年度审计，托管人保管资产。",
      },
      {
        id: "q3",
        question: "瀑布分配（Waterfall）中，管理人取得附带权益（Carried Interest）通常发生在哪个环节之后？",
        options: [
          "基金注册完成后立即取得",
          "LP 收回本金并获得约定的优先回报之后",
          "首次对外投资交割时",
          "基金存续期过半时",
        ],
        answer: 1,
        explanation:
          "瀑布先向 LP 返还本金并支付优先回报，剩余超额收益再按约定比例（如 80/20）在 LP 与管理人之间分配。",
      },
      {
        id: "q4",
        question: "关于基金生命周期中的各方角色，以下说法错误的是？",
        options: [
          "GP 负责基金的管理执行与投资决策",
          "LP 以出资额为限承担有限责任",
          "行政管理员兼任基金审计职能",
          "托管人负责资产保管与安全",
        ],
        answer: 2,
        explanation:
          "行政管理人不兼任审计：审计须由独立审计师完成，以保证财务报表的公信力与监管要求。",
      },
    ],
    minutes: 20,
  },
  {
    id: "02",
    slug: "fund-structure",
    title: "基金结构全景",
    subtitle: "GP/LP、主基金与分支基金：一张图看懂常见境外基金架构",
    goal: [
      "掌握最常用的离岸基金载体及其法律形态（Cayman 豁免公司 / ELP，BVI 等）",
      "理解 GP、基金管理人（Manager/Advisor）、投资顾问的职责边界与典型安排",
      "看懂主基金—联接基金（Master-Feeder）、平行基金、独立投资组合（Segregated Portfolio）等结构及其用途",
      "能根据 LP 的税务与监管诉求，解释为什么需要某种具体结构",
    ],
    modules: [
      {
        id: "m1",
        title: "2.1 载体选择：公司、合伙还是单元信托",
        body: [
          "开曼基金最常见载体为豁免公司（Exempted Company，可设独立投资组合 SPC）与豁免有限合伙（ELP）；BVI 为 BVI 商业公司与有限合伙。美国税基投资者常偏好 Delaware 载体或通过 Blocker 结构投资。",
          "载体的选择由目标投资者、税务地位、监管环境共同决定：公司制便于发行多类股份（如管理费豁免股份、绩效股），合伙制便于灵活分配并常用于 PE 的 GP 层。",
        ],
        points: [
          "Cayman Exempted Company：股东责任有限，可设多类别股份（SPC 下设 segregated portfolio）",
          "Cayman ELP：GP/LP 结构，PE 主基金首选之一",
          "BVI：成本敏感型基金的常见替代选择",
        ],
      },
      {
        id: "m2",
        title: "2.2 管理人架构：GP、Manager 与 Advisor",
        body: [
          "典型安排是 GP + Investment Manager/Advisor 双实体：GP 持有基金普通合伙权益并签署基金文件；投资管理人（常注册在香港、新加坡或受监管地区）实际执行投资决策并收取管理费与附带权益。",
          "分离 GP 与管理人的原因：隔离责任、税务筹划（附带权益落在管理人实体）、以及满足开曼/其他法域对注册管理人（如 CIMA 注册、或金融监管持牌）的合规预期。",
        ],
        points: [
          "谁收管理费：通常为 Investment Manager（按承诺额或净值的一定比例，如 1%-2%）",
          "谁决策：投资委员会（IC）往往设在管理人或 GP 层面",
          "监管关注：管理人或顾问是否需要持牌（如香港 9 号牌、新加坡 RFMC/LFMC、美国 RIA）",
        ],
      },
      {
        id: "m3",
        title: "2.3 多基金结构：Master-Feeder 与平行基金",
        body: [
          "当 LP 来自不同税收辖区时，常搭建主基金-联接基金（Master-Feeder）：美国应税投资者进入国内 Feeder（如 Delaware），非美国投资者进入离岸 Feeder，资金汇聚到 Cayman/BVI 的 Master 统一投资，实现投资组合一致与税务最优。",
          "平行基金（Parallel Fund）用于部分投资者（如主权基金）希望与主基金同股同权但独立账户的需求；基金同策略并行投资、按比例分单。",
        ],
        points: [
          "Master-Feeder 解决“同策略、多税区 LP”问题",
          "SPC（Segregated Portfolio Company）把多策略/多产品装进一个法律实体，资产隔离",
          "平行基金常用于跟投结构或特定 LP 的合规隔离",
        ],
      },
      {
        id: "m4",
        title: "2.4 特殊目的主体（SPV）与基金投资",
        body: [
          "基金对外投资常通过 SPV 完成：SPV 用于银行融资（杠杆收购需贷款主体）、多 LP 合投、目标公司所在国监管/税务安排（如中国外商投资准入、VIE 或直接持股）、以及隔离单一项目风险。",
          "SPV 的设立地、董事安排与经济实质同样会被银行与税务当局审视；基金文件通常会披露通过 SPV 投资的安排与相关费用。",
        ],
        points: [
          "常见 SPV 地：开曼、BVI、卢森堡、香港、目标国本地",
          "杠杆并购中 SPV 承担借款与担保功能",
          "SPV 也用于 Grouping（若干基金共同持有同一标的）",
        ],
      },
    ],
    risks: [
      {
        title: "结构“看起来对”但税务上踩雷",
        detail:
          "盲目照搬 Master-Feeder 而不分析 LP 的税收居民身份，可能造成美国 LP 或非美国 LP 的 PFIC、被动收入等问题。结构设计必须与税务顾问按投资者画像逐层验证。",
      },
      {
        title: "GP 与管理人混同带来的责任与牌照风险",
        detail:
          "若 GP 与投资管理人职能不清，可能出现“未注册从事资产管理”的监管认定（尤其涉及香港、新加坡、美国连接点），或导致管理费归属纠纷。",
      },
      {
        title: "SPC/SPV 层级叠加合规与成本",
        detail:
          "每层实体都有注册费、年费、审计与簿记义务。层级越多，经济实质与 AEOI 申报越复杂，需在税务效率与合规成本间平衡。",
      },
    ],
    mindmap: {
      label: "基金结构全景",
      note: "载体 × 管理人 × 多基金结构",
      children: [
        {
          label: "法律载体",
          children: [
            { label: "Cayman 豁免公司" },
            { label: "Cayman ELP" },
            { label: "BVI 商业公司/合伙" },
            { label: "SPC 独立组合" },
          ],
        },
        {
          label: "管理人层",
          children: [
            { label: "GP 普通合伙人" },
            { label: "Investment Manager" },
            { label: "Advisor / IC" },
            { label: "持牌与注册" },
          ],
        },
        {
          label: "多基金结构",
          children: [
            { label: "Master-Feeder" },
            { label: "平行基金" },
            { label: "SPV 投资主体" },
          ],
        },
        {
          label: "选择驱动因素",
          children: [
            { label: "投资者税务" },
            { label: "策略与资产类型" },
            { label: "监管连接点" },
            { label: "成本与运营" },
          ],
        },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "主基金—联接基金（Master-Feeder）结构主要解决什么问题？",
        options: [
          "降低审计费用",
          "同时容纳不同税收辖区投资者的需求且共享同一投资组合",
          "规避所有监管备案",
          "让管理人获得更多管理费",
        ],
        answer: 1,
        explanation:
          "Master-Feeder 让不同税务地位的投资者经由各自的 Feeder 汇入同一 Master 组合，保持策略一致的同时优化税务。",
      },
      {
        id: "q2",
        question: "SPC（Segregated Portfolio Company）的核心价值是？",
        options: [
          "免除年审义务",
          "在单一法律实体下实现不同组合的资产隔离",
          "自动豁免 CRS 申报",
          "允许公开向公众募资",
        ],
        answer: 1,
        explanation:
          "SPC 的一个法律实体下可分设多个隔离组合（Segregated Portfolios），各自资产负债互相隔离，常用于多策略或多产品基金。",
      },
      {
        id: "q3",
        question: "GP 与 Investment Manager 分离的常见原因不包括？",
        options: [
          "隔离责任",
          "附带权益的税务筹划",
          "让基金获得上市资格",
          "满足管理人对持牌与注册的合规预期",
        ],
        answer: 2,
        explanation:
          "GP/Manager 分离与基金上市无关，主要驱动是责任隔离、税务与监管合规。",
      },
    ],
    minutes: 18,
  },
  {
    id: "03",
    slug: "cayman-framework",
    title: "Cayman 基金核心框架",
    subtitle: "CIMA 注册、私募基金法与豁免主体：开曼基金监管的骨架",
    goal: [
      "理解开曼两类基金的监管分界：共同基金（Mutual Funds Law）与私募基金（Private Funds Law）",
      "掌握开曼基金在 CIMA 的注册/备案义务与豁免路径",
      "了解豁免公司、ELP 的治理要素：注册代理、注册办事处、董事、审计师与行政管理员",
      "认识经济实质（Economic Substance）、受益所有人登记等横向合规要求",
    ],
    modules: [
      {
        id: "m1",
        title: "3.1 开曼监管双轨：Mutual Funds Law 与 Private Funds Law",
        body: [
          "《共同基金法》（Mutual Funds Law）监管向公众募集的开放式基金（传统对冲基金为主），须向 CIMA 注册并任命审计师、行政管理员与托管人（或说明豁免理由）。",
          "《私募基金法》（Private Funds Law, 2021 生效）把私募股权、私募信贷等封闭式基金纳入 CIMA 监管：须在 CIMA 注册为 Private Fund，除非符合豁免（投资者少于 15 人且无公开募集等）。两类基金的合规义务高度趋同：审计、估值、资产保管、现金监控。",
        ],
        points: [
          "开放式/允许随时赎回 → Mutual Funds Law 注册",
          "封闭式/无日常赎回 → Private Funds Law 注册（不满足豁免时）",
          "豁免判断不能想当然：需基于事实与法律意见逐项核对",
        ],
      },
      {
        id: "m2",
        title: "3.2 治理与任命：四根支柱",
        body: [
          "开曼基金须任命：注册代理（Registered Office/Corporate Services Provider）、审计师（Approved Auditor）、行政管理员（Fund Administrator），并保留至少一名董事。上述服务商均需在开曼有实体或被认可，GP 等实体另需注册办事处。",
          "董事的适格性（Fit & Proper）日益被 CIMA 关注：董事背景、经验、时间投入与冲突披露是 CIMA 问询的高频点，实务上常需补充反洗钱负责人/合规官角色。",
        ],
        points: [
          "所有基金的董事/高管需满足适当人选要求",
          "审计报告须在法定期限内提交 CIMA（通常为财政年度末后 6 个月内）",
          "服务商任命变更需向 CIMA 备案",
        ],
      },
      {
        id: "m3",
        title: "3.3 经济实质（Economic Substance）与受益所有人登记",
        body: [
          "开曼按欧盟要求实施经济实质法：从事“相关活动”（含基金管理、总部、融资租赁等）的实体须在开曼具备经济实质——核心是“相关收入”在开曼产生并在此决策与管理。纯持股实体（Pure Equity Holding）只需满足简化申报。",
          "同时，CIMA/注册官要求维护受益所有人（BO）登记册并提交给指定平台（近年要求向政府执法机关披露）；最终受益所有人信息直接影响 AML 尽职调查与基金备案。",
        ],
        points: [
          "经济实质申报每年一次：ES Return 需说明活动类型与实质程度",
          "基金通常自证为投资主体（非相关活动）或由 GP 承担基金管理实质",
          "BO 信息也是 CIMA 对基金发起人/管理人审查的输入项",
        ],
      },
      {
        id: "m4",
        title: "3.4 年度合规日历与常见备案",
        body: [
          "开曼基金年度合规事项高度模板化：CIMA 注册续费（按 AUM 分级）、审计报告提交、AEOI（CRS/FATCA）申报、经济实质申报、政府年费（Annual Return & Fees）缴纳。",
          "错过截止日会触发滞纳金与除名风险。基金行政管理人或注册代理通常提供“合规日历”服务，把上述节点串成清单管理。",
        ],
        points: [
          "每年 1 月前后：CIMA 年费与注册信息更新",
          "财年末后 6 个月内：审计报告提交",
          "4 月前后：AEOI 信息申报（与托管人/行政管理人联动）",
        ],
      },
    ],
    risks: [
      {
        title: "私募基金法豁免判断错误",
        detail:
          "以为“反正不公开募集”就可不注册，但 Private Funds Law 豁免条件严格（如 15 人限制）。错误豁免会导致未注册运营，CIMA 可处以罚款并要求补注册。",
      },
      {
        title: "审计报告逾期提交",
        detail:
          "CIMA 对逾期提交审计报告零容忍，会发函质询甚至暂停注册状态，影响基金正常运营与银行关系。",
      },
      {
        title: "董事不适格或服务商任命不合规",
        detail:
          "CIMA 加强对董事背景与任职的审查；使用无牌/影子服务商（如未注册的“行政管理员”）会被认定为治理缺陷。",
      },
    ],
    mindmap: {
      label: "Cayman 基金核心框架",
      note: "监管 + 治理 + 横向合规",
      children: [
        { label: "监管双轨", children: [{ label: "Mutual Funds Law" }, { label: "Private Funds Law" }, { label: "豁免路径" }] },
        { label: "CIMA 注册", children: [{ label: "注册代理" }, { label: "审计师" }, { label: "行政管理人" }, { label: "董事" }] },
        { label: "横向合规", children: [{ label: "经济实质 ES" }, { label: "受益所有人 BO" }, { label: "AML/CFT" }] },
        { label: "年度节点", children: [{ label: "CIMA 年费" }, { label: "审计提交" }, { label: "AEOI" }, { label: "ES Return" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "开曼《私募基金法》（Private Funds Law）主要监管哪类基金？",
        options: [
          "所有在开曼设立的公司",
          "封闭式为主的私募基金（PE、私募信贷等）",
          "仅在开曼有股东的基金",
          "政府基金",
        ],
        answer: 1,
        explanation:
          "Private Funds Law（2021）把封闭式私募基金纳入 CIMA 监管，除非满足豁免条件（如投资者不超过 15 人且无公开募集）。",
      },
      {
        id: "q2",
        question: "以下哪项不属于开曼基金必须任命/聘请的常规服务方？",
        options: ["审计师", "注册代理", "行政管理员", "主经纪商 Prime Broker"],
        answer: 3,
        explanation:
          "主经纪商是对冲基金按需使用的杠杆与结算服务商，不是开曼基金的法定强制任命对象；审计师、注册代理、行政管理员是常规强制/必备方。",
      },
      {
        id: "q3",
        question: "开曼经济实质（Economic Substance）申报的核心目的是？",
        options: [
          "向投资者披露业绩",
          "证明从事相关活动的实体在开曼具备实质经营与决策管理，避免被认定为空壳",
          "替代审计义务",
          "用于计算管理费",
        ],
        answer: 1,
        explanation:
          "经济实质要求源于欧盟税务透明要求：从事相关活动的实体须在开曼具备实际经营实质，纯持股等情形作简化处理。",
      },
      {
        id: "q4",
        question: "开曼基金审计报告通常须在财政年度结束后多久内提交 CIMA？",
        options: ["3 个月", "6 个月", "12 个月", "无需提交"],
        answer: 1,
        explanation:
          "开曼基金一般须在财政年度结束后 6 个月内向 CIMA 提交经审计的财务报表，逾期将面临质询与处罚。",
      },
    ],
    minutes: 22,
  },
  {
    id: "04",
    slug: "aml-kyc",
    title: "AML 与投资者尽调",
    subtitle: "反洗钱制度与 CDD：把好投资者入口这道门",
    goal: [
      "理解离岸基金 AML/CFT 的制度框架（CIMA AML 指引、Proliferation Financing 等）",
      "掌握客户尽职调查（CDD）的分层逻辑：标准、简化（SDD）与强化（EDD）",
      "识别高风险信号：PEP、制裁、异常资金来源、受益所有人不透明",
      "知道记录保存、可疑交易报告（STR）与 AMLCO 的职责分工",
    ],
    modules: [
      {
        id: "m1",
        title: "4.1 AML 制度框架与适用主体",
        body: [
          "开曼 AML 体系以《犯罪收益法》（POCA）、《反洗钱条例》（AMLR）与 CIMA《AML 指引》为核心，采用与 FATF 建议一致的“风险为本”（Risk-Based Approach）。基金及其服务商（行政管理员、注册代理）均属“相关金融业务”主体，须建立 AML 体系。",
          "实务中由基金管理人或其委托的行政管理员执行投资者 KYC；基金层面任命 AMLCO（反洗钱合规官）、DMLRO（报告官）与 AML 培训制度，并通过外部审计或 CIMA 检查验证有效性。",
        ],
        points: [
          "体系要素：风险评估、政策程序、CDD、持续监控、记录保存、可疑交易报告",
          "BVI 另有《反洗钱条例》（AMLR 2008）与 FSC 指引，结构相似",
          "制裁合规（UN/OFAC/EU 等）需独立于 CDD 流程执行筛查",
        ],
      },
      {
        id: "m2",
        title: "4.2 CDD 分层：SDD / Standard CDD / EDD",
        body: [
          "标准 CDD：核实投资者身份（个人：证件+地址；机构：注册文件+董事/股东结构+受益所有人），并了解其资金来源与业务性质。",
          "简化 CDD（SDD）适用于低风险情形（如受监管金融机构、上市公司）；强化 CDD（EDD）适用于高风险：PEP、来自高风险司法辖区、复杂不透明结构、异常大额或来源不明资金。EDD 通常需取得额外证明文件并上报高级管理层批准。",
        ],
        points: [
          "受益所有人认定：穿透至最终自然人（通常大于 25% 或实际控制人）",
          "机构投资者需取得：章程、注册证明、董事名册、股权结构直至 BO",
          "所有 CDD 结论须留痕并有记录保存期限（通常至少 5 年）",
        ],
      },
      {
        id: "m3",
        title: "4.3 高风险信号与制裁筛查",
        body: [
          "投资者尽调并非“收齐证件就结束”：需结合公开信息与负面新闻筛查（Adverse Media），对来源资金路径做合理性判断。典型红旗：资金来源为敏感行业现金、多层壳公司无法解释、PEP 身份未披露、拒不配合 KYC。",
          "制裁筛查应覆盖投资者及其受益所有人、董事，并持续更新名单（OFAC SDN、EU、UN 等）。筛查命中或近似命中（Fuzzy Match）须评估并记录处置结论。",
        ],
        points: [
          "PEP 认定含其家庭成员与密切关联人，非仅本人",
          "筛查工具返回近似匹配时不能简单放行，需人工复核",
          "拒绝/中止交易后注意“不泄露风声”（Tipping-off）合规",
        ],
      },
      {
        id: "m4",
        title: "4.4 记录保存与可疑交易报告",
        body: [
          "CIMA 要求保存 CDD 记录与交易记录至少 5 年（自业务关系结束后）。记录包括认购文件、KYC 资料、筛查结果、通信与决策依据。",
          "发现可疑活动时，内部上报 DMLRO/AMLCO，由其判断是否向金融情报部门（开曼 FRA、BVI FIU）提交可疑活动/交易报告（SAR/STR）。基金虽少遇直接洗钱，但“替客户隐瞒身份”的间接风险常见于架构复杂的高净值客户。",
        ],
        points: [
          "保持“了解你的客户（KYC）”与“了解你的业务（KYB）”双重视角",
          "持续监控：定期重检既有投资者（Refresh/Periodic Review）",
          "离任投资者档案按留存期归档，不可提前销毁",
        ],
      },
    ],
    risks: [
      {
        title: "只用身份证件应付 KYC",
        detail:
          "CIMA 检查常见发现：机构投资者未穿透受益所有人、缺董事/股东名册、PEP 筛查缺失。基金作为相关主体违规可被罚款、警告甚至影响注册状态。",
      },
      {
        title: "制裁名单只查“准确命中”",
        detail:
          "真正风险在近似匹配与名下有代持/关联实体。只做精确匹配等于没做筛查，且名单必须保持更新。",
      },
      {
        title: "记录保存不足五年",
        detail:
          "CIMA 明确记录保存期（业务结束后至少 5 年）。行政管理员更换或基金清盘时，KYC 档案必须妥善移交与归档。",
      },
    ],
    mindmap: {
      label: "AML 与投资者尽调",
      note: "风险为本 · 全流程",
      children: [
        { label: "制度框架", children: [{ label: "POCA/AMLR" }, { label: "CIMA 指引" }, { label: "FATF 标准" }] },
        { label: "CDD 分层", children: [{ label: "SDD 简化" }, { label: "标准 CDD" }, { label: "EDD 强化" }] },
        { label: "尽调要素", children: [{ label: "身份核实" }, { label: "受益所有人" }, { label: "资金来源" }, { label: "制裁筛查" }] },
        { label: "治理与记录", children: [{ label: "AMLCO/DMLRO" }, { label: "持续监控" }, { label: "SAR/STR" }, { label: "保存≥5年" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "对机构投资者做标准 CDD 时，以下哪项是必须完成的？",
        options: [
          "仅核对其营业执照复印件",
          "核实受益所有人（BO）并取得股权/控制结构文件",
          "要求投资者提供纳税申报表",
          "安排现场访谈",
        ],
        answer: 1,
        explanation:
          "机构投资者须穿透核实至最终受益自然人/实际控制人，并留存注册文件与股权结构（ownership structure）证据。",
      },
      {
        id: "q2",
        question: "政治公众人物（PEP）通常适用的尽调要求是？",
        options: ["简化尽调 SDD", "强化尽调 EDD", "免除尽调", "仅做地址核实"],
        answer: 1,
        explanation:
          "PEP 属高风险客户，适用强化尽调（EDD），包括取得财富与资金来源证明并上报高级管理层批准。",
      },
      {
        id: "q3",
        question: "关于可疑交易报告（STR/SAR）的说法正确的是？",
        options: [
          "由基金前台员工直接向监管提交",
          "内部上报 DMLRO/AMLCO 后由其判断是否向金融情报机构报告",
          "确认可疑后必须立即通知客户",
          "只有现金交易才需要报告",
        ],
        answer: 1,
        explanation:
          "发现可疑由内部上报指定报告官（DMLRO/AMLCO）评估，由其决定是否提交 STR；同时注意不得向客户通风报信（Tipping-off）。",
      },
    ],
    minutes: 20,
  },
  {
    id: "05",
    slug: "fatca-crs",
    title: "FATCA 与 CRS",
    subtitle: "税务信息自动交换：基金与投资者的 AEOI 义务",
    goal: [
      "区分 FATCA（美）与 CRS（全球多边）两套自动信息交换机制的触发逻辑",
      "理解基金作为“金融机构”（FFI/FI）的注册与申报义务（GIIN、CRS 自我分类）",
      "掌握投资者税务自我证明（W-8/W-9、CRS 自我证明表）在开户流程中的作用",
      "知道不申报或申报错误的后果：罚则、账户冻结与声誉风险",
    ],
    modules: [
      {
        id: "m1",
        title: "5.1 两套机制：FATCA 与 CRS 的分工",
        body: [
          "FATCA 是美国《海外账户税收合规法》：要求外国金融机构（FFI）识别美国账户持有人并向 IRS 报告，否则对源自美国的付款征收 30% 预提税。开曼基金通常通过向 IRS 注册获得 GIIN 并签署 FFI 协议（或适用 IGA 简化路径）。",
          "CRS（共同申报准则）是 OECD 主导的多边机制：开曼、BVI、香港、新加坡等上百辖区互相交换税收居民金融账户信息。基金按居住地归集账户信息并申报给本地税务机关，由其在辖区间自动交换。",
        ],
        points: [
          "FATCA 的抓手是美国预提税，CRS 的抓手是辖区间信息互换",
          "两者都以税收居民身份而非国籍/护照为准",
          "开曼 CRS 依据《税务信息局（国际合作）法》（TIA），须每年在 CIMA AEOI 门户申报",
        ],
      },
      {
        id: "m2",
        title: "5.2 基金作为金融机构的分类与注册",
        body: [
          "开曼基金通常被归类为“投资实体”（Investment Entity），属金融机构（FI），须在 CIMA AEOI 门户注册 CRS/FATCA 分类并取得 GIIN（FATCA 若适用）。部分纯持股/非金融主体（NFFE）走另一套申报逻辑。",
          "每只基金须指定申报负责人（通常为行政管理员）完成年度申报；注册信息变化（如法律实体变更、关闭）需及时更新。",
        ],
        points: [
          "Investment Entity 的判定：是否主要从事金融资产投资/管理、收入主要来源于金融活动",
          "Active/Passive NFFE 身份影响信息是否需向基金披露",
          "分类错误 → 申报错漏 → 被认定为非合作的风险",
        ],
      },
      {
        id: "m3",
        title: "5.3 投资者自我证明：从开户第一份表开始",
        body: [
          "投资者认购时须提交税务自我证明：美国人通常提交 W-9 或 W-8BEN（非美个人）/W-8BEN-E（非美机构）；CRS 体系用 CRS 自我证明表（含税收居民国、TIN、出生地/出生日期）。",
          "自我证明有合理性审查义务：表格信息与已有 KYC 资料矛盾时（如美国电话/地址却声明非美税务居民），基金须跟进澄清，必要时更新账户信息或向税务机关报告。",
        ],
        points: [
          "TIN（税号）缺失/格式异常是 CRS 申报被退回的高频原因",
          "地址、电话、出生地都是美国指标（US Indicia）触发点",
          "投资者信息变更（改税籍）须更新自我证明并保留记录",
        ],
      },
      {
        id: "m4",
        title: "5.4 年度申报流程与罚则",
        body: [
          "开曼基金年度 AEOI 流程：确认自我分类 → 收集/复核账户信息（含消极 NFFE 的 Controlling Persons 信息）→ 在 CIMA AEOI 门户完成 CRS 与 FATCA 申报 → 记录留存。截止日通常为每年 4 月底前后，由 CIMA 通知。",
          "未申报或虚假申报面临罚款（按账户/实体计）与合规质询；长期不合作将导致名单公布与跨境信息交换受限，进而影响基金开户与投资者信心。",
        ],
        points: [
          "申报前做数据质量校验：缺 TIN、缺出生日期的账户逐一处理",
          "开曼、BVI 均实行零容忍式截止管理，逾期罚款逐笔累加",
          "行政管理员提供的 AEOI 服务含名单监控与年度申报代办",
        ],
      },
    ],
    risks: [
      {
        title: "把“国籍”当成“税收居民身份”",
        detail:
          "FATCA/CRS 以税收居民身份为准。持美国绿卡或长期居留美国的中国投资者也是美国人；反之有美籍但早已放弃者需提供证明。误分类导致申报主体错误。",
      },
      {
        title: "自我证明信息与 KYC 冲突未处理",
        detail:
          "表格显示非美税务居民，但 KYC 里有美国电话/常住地址（US Indicia）。不澄清就申报，等于主动埋雷，被抽查将面临罚款。",
      },
      {
        title: "错过 AEOI 年度申报截止",
        detail:
          "开曼/BVI 对逾期申报的罚则是按实体按日/按账户计罚，且无法豁免。合规日历必须包含 AEOI 节点并留出行政管理员复核时间。",
      },
    ],
    mindmap: {
      label: "FATCA 与 CRS",
      note: "AEOI 自动信息交换",
      children: [
        { label: "两套机制", children: [{ label: "FATCA 美国" }, { label: "CRS 多边" }, { label: "IGA 路径" }] },
        { label: "基金义务", children: [{ label: "FI 分类" }, { label: "GIIN 注册" }, { label: "CIMA AEOI 申报" }] },
        { label: "投资者端", children: [{ label: "W-9/W-8" }, { label: "CRS 自我证明" }, { label: "TIN 与 US Indicia" }] },
        { label: "合规流程", children: [{ label: "年度申报" }, { label: "数据质量校验" }, { label: "罚则" }, { label: "记录留存" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "FATCA 要求外国金融机构（FFI）识别并向 IRS 报告的对象是？",
        options: [
          "所有非美国客户",
          "美国税收居民账户持有人",
          "仅持有现金的客户",
          "所有公司客户",
        ],
        answer: 1,
        explanation:
          "FATCA 针对的是美国税收居民（含公民、绿卡持有人及满足实质居留测试者）在海外金融机构的账户信息。",
      },
      {
        id: "q2",
        question: "CRS 申报中判断账户持有人信息归属的关键依据是？",
        options: ["护照签发国", "开户地", "税收居民身份", "资金币种"],
        answer: 2,
        explanation:
          "CRS 按“税收居民身份”归集并交换信息，与国籍、护照或开户地不完全等同。",
      },
      {
        id: "q3",
        question: "投资者声明非美国税务居民，但 KYC 显示美国电话与常住地址，基金应？",
        options: [
          "直接按非美国处理并申报",
          "视为 US Indicia，启动澄清与文件收集流程",
          "注销该投资者账户",
          "无需处理，由投资者自行负责",
        ],
        answer: 1,
        explanation:
          "出现美国指标（US Indicia）且自我证明存在矛盾时，基金须开展澄清流程，必要时更新账户信息或按美国人处理。",
      },
      {
        id: "q4",
        question: "开曼基金一般被归类为哪类实体履行 AEOI 义务？",
        options: ["Active NFFE", "投资实体（Investment Entity / FI）", "政府实体", "豁免申报实体"],
        answer: 1,
        explanation:
          "主要从事金融资产投资与管理的开曼基金通常属于投资实体（金融机构），须完成 CRS/FATCA 注册与年度申报。",
      },
    ],
    minutes: 20,
  },
  {
    id: "06",
    slug: "bvi-fund-manager",
    title: "BVI 基金与管理人",
    subtitle: "FSC 监管下的私募基金与获批管理人：BVI 的另一套打法",
    goal: [
      "理解 BVI 基金监管三轨：获认可基金、私募基金（PIF Act）与专业基金",
      "掌握 BVI FSC 的注册要求与 PIF 申报义务",
      "认识 BVI 被授权代表（Approved Representative）与 AML 合规服务的角色",
      "对比 BVI 与开曼在基金、经济实质与申报上的异同",
    ],
    modules: [
      {
        id: "m1",
        title: "6.1 BVI 基金监管地图",
        body: [
          "BVI 基金监管分三类：向公众募集的获认可基金（Recognized Fund）需 FSC 审批；封闭式私募基金受《私募投资基金法》（Private Investment Funds Act 2019, PIF Act）监管，须在 FSC 注册（除非豁免）；专业基金（Professional Fund）面向资深投资者的开放式基金，适用简化注册。",
          "PIF Act 的监管内核与开曼 Private Funds Law 相似：年度审计、估值、资产保管/监控、现金流监控与披露义务，服务商同样须为 BVI 持牌/被认可主体。",
        ],
        points: [
          "2020 年起 PIF 与受监管基金须指定 FSC 认可的被授权代表（Approved Representative）",
          "基金注册状态与年费挂钩，年度申报含审计报告与声明",
          "BVI 基金不可向公众/零售投资者募集（区别于开曼可设零售共同基金）",
        ],
      },
      {
        id: "m2",
        title: "6.2 PIF 注册要求与豁免",
        body: [
          "PIF 注册须提交：基金章程/合伙文件、募集文件、注册代理与注册办事处信息、被授权代表信息、以及 AML/CFT 安排说明。豁免情形包括投资者人数与专业属性限制（与开曼的 15 人豁免逻辑相近）。",
          "注册后基金管理轻监管、重自证：以年度审计与备案为主，但 FSC 保留随时检查权。基金须保存投资者名册、股东/合伙人记录与财务账册。",
        ],
        points: [
          "PIF 注册须在开始经营（首次募集/投资）前完成",
          "FSC 对基金名称（不得误导、不得含“银行”等受限词）有核准要求",
          "变更（新服务商、增发份额类别）需向 FSC 备案",
        ],
      },
      {
        id: "m3",
        title: "6.3 被授权代表（Approved Representative）",
        body: [
          "PIF Act 引入被授权代表制度：代表基金与 FSC 沟通、确保基金持续满足注册条件与申报义务（审计提交、费用缴纳、信息更新）。被授权代表须由 FSC 认可的服务商（如注册代理）担任。",
          "实际运营中，被授权代表常与注册代理、AML 服务商打包，是 BVI 基金日常合规守门人；其离职/撤换须同步报告 FSC。",
        ],
        points: [
          "被授权代表 ≠ 基金经理：不承担投资决策",
          "基金应确保被授权代表能获取全部合规所需文件",
          "撤换被授权代表是 FSC 备案事件，须及时办理",
        ],
      },
      {
        id: "m4",
        title: "6.4 BVI vs Cayman：怎么选",
        body: [
          "开曼与 BVI 是离岸基金两大主流：开曼金融基础设施与判例更厚、适合大型 PE/对冲基金与复杂结构；BVI 费用与注册速度占优、且其商业公司（BC）体系成熟，适合中小规模基金、单项目 SPV 与以 BVI 公司做投资载体的结构。",
          "合规要求上二者趋同（审计、AML、AEOI、经济实质），但 BVI 基金不可公开募集，而开曼允许受监管的共同基金面向零售。选择需结合 LP 画像、投资标的、银行开户与税务顾问建议综合判断。",
        ],
        points: [
          "税务角度：Cayman/BVI 均无本地所得税，主要看下层投资地税务",
          "银行开户：Cayman 基金更易被国际大行接受，BVI 需更强服务商背书",
          "AEOI/经济实质申报两法域均有，BVI 亦要求年度 ES 申报",
        ],
      },
    ],
    risks: [
      {
        title: "PIF 注册前即开始募集",
        detail:
          "PIF Act 要求注册完成前不得开始经营（募集/投资）。先募后注会被 FSC 视为违规，可能罚款并要求重组。",
      },
      {
        title: "被授权代表形同虚设",
        detail:
          "若基金不让被授权代表接触审计与申报材料，代表无法履行守门职责，FSC 会追究基金与被授权代表双方责任。",
      },
      {
        title: "按开曼模板套 BVI 文件",
        detail:
          "两法域基金文件与监管口径有实质差异（如 BVI 无零售共同基金、Approved Representative 制度），直接套模板会埋下合规错配。",
      },
    ],
    mindmap: {
      label: "BVI 基金与管理人",
      note: "FSC 监管三角",
      children: [
        { label: "基金类型", children: [{ label: "获认可基金" }, { label: "PIF 私募基金" }, { label: "专业基金" }] },
        { label: "注册与治理", children: [{ label: "FSC 注册" }, { label: "被授权代表" }, { label: "注册代理" }, { label: "审计" }] },
        { label: "横向合规", children: [{ label: "AML/CFT" }, { label: "AEOI" }, { label: "经济实质" }, { label: "BO 登记" }] },
        { label: "比较维度", children: [{ label: "Cayman" }, { label: "BVI" }, { label: "选择因素" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "BVI 封闭式私募基金主要受哪部法律监管？",
        options: [
          "《公司法》",
          "《私募投资基金法》（PIF Act 2019）",
          "《证券法》",
          "《信托法》",
        ],
        answer: 1,
        explanation:
          "BVI 私募股权/封闭式基金适用《私募投资基金法》（PIF Act 2019），须向 FSC 注册（除非符合豁免）。",
      },
      {
        id: "q2",
        question: "BVI PIF 的被授权代表（Approved Representative）的职责是？",
        options: [
          "代替基金经理做投资决策",
          "作为基金与 FSC 的合规联络人，确保持续满足注册与申报义务",
          "负责基金的营销推广",
          "担任基金的托管人",
        ],
        answer: 1,
        explanation:
          "被授权代表代表基金与 FSC 沟通并监督持续合规（审计提交、年费、信息更新），不承担投资决策职能。",
      },
      {
        id: "q3",
        question: "与开曼相比，BVI 基金的一个显著特点是？",
        options: [
          "可公开向零售投资者募集",
          "不可向公众募集，主要面向专业/资深投资者",
          "无需年度审计",
          "无需注册代理",
        ],
        answer: 1,
        explanation:
          "BVI 基金（含 PIF、专业基金）不可公开募集，面向专业/资深投资者；审计、注册代理等义务与开曼趋同。",
      },
      {
        id: "q4",
        question: "BVI PIF 应在何时完成 FSC 注册？",
        options: [
          "开始经营（首次募集或投资）之前",
          "首次投资退出后 90 天内",
          "收到第一笔管理费后",
          "任意时间均可补办",
        ],
        answer: 0,
        explanation:
          "PIF 须在开始经营前完成注册，先运营后补注册属于违规行为。",
      },
    ],
    minutes: 20,
  },
];

/** 便捷索引 */
export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

export function getLessonById(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export const totalLessons = lessons.length;
