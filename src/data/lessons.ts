import type { Lesson } from "@/types";

/**
 * Fund Admin Academy — 课程数据（v2 内容升级版）
 *
 * - 内容框架：2024 年 7 月版《境外私募基金募集与运营法律实务指南》+ Fund Admin 实务整理
 * - 结构约定：课程目录为既定 6 讲；模块 id m1-mN 保持稳定，进度/收藏 key 依赖它
 * - 合规约定：法规版本、费用、期限、表格、门槛、牌照类别、申报流程等均为时点性信息，
 *   正文不写死，需办理时按现行官方规则复核（见各讲 meta.timeSensitive）
 */
export const lessons: Lesson[] = [
  {
    id: "01",
    slug: "fund-lifecycle",
    title: "一只境外基金如何运转",
    subtitle: "投资者、治理主体、Manager 与 Fund Admin",
    goal: [
      "能按载体类型区分角色称谓：GP/LP 主要用于有限合伙基金；公司型基金与单位信托使用不同称谓",
      "掌握一条判断链：法律载体 → 治理主体 → 投资管理 → 行政服务 → 授权文件 → 实际履职",
      "理解 Manager 依投资管理协议与授权范围履职，Fund Admin 依服务协议提供操作与行政支持",
      "掌握 Commitment、Capital Call、Contribution、Unfunded Commitment 与 Distribution 的资金环节",
      "建立 Fund Admin 视角：签署认购、AML/KYC、接纳、收款与名册更新各环节不当然等同",
    ],
    modules: [
      {
        id: "m1",
        title: "1.1 先分清载体与角色称谓",
        body: [
          "有限合伙基金采用 GP/LP 结构：普通合伙人（GP）执行管理，有限合伙人（LP）出资并承担有限责任，这是 Cayman ELP、BVI LP 等合伙载体的通行表述。公司型基金则称股东/董事会/基金经理，单位信托称受托人/管理人/单位持有人。不同法律载体没有一套放之四海而皆准的角色名词。",
          "把 LP、GP 机械套用到公司型或信托型基金，是实务中常见的表述错误。判断角色应先确认基金的法律载体，再对照基金文件（LPA、公司章程、信托契据）中的定义。",
        ],
        points: [
          "有限合伙：GP 管理执行、LP 出资（有限责任公司特征依具体法域规则）",
          "公司型：股东持有份额、董事会治理、投资经理受任管理",
          "单位信托：受托人持有资产、单位持有人受益、管理人或投资顾问受托投资",
          "结论依据是基金文件与适用法，不是行业俗称",
        ],
      },
      {
        id: "m2",
        title: "1.2 判断链：从载体到实际履职",
        body: [
          "看懂一只基金建议按链条逐层核查：①法律载体（合伙/公司/信托）→ ②治理主体（GP/董事会/受托人）→ ③投资管理（Manager/Investment Manager/Advisor）→ ④行政服务（Fund Admin/行政管理人）→ ⑤授权文件（LPA、投资管理协议 IMA、服务协议 SA、认购文件）→ ⑥实际履职（谁有权投资、谁算净值、谁接纳投资者、谁对外申报）。",
          "Manager 依据投资管理协议和授权范围履职：投资决策、投后管理、交易执行等，以 IMA 约定与实际授权为准。Fund Admin 依据服务协议提供行政与运营支持——份额登记、投资者沟通、会计与 NAV 协助、报表、AEOI 操作等，其义务边界来自服务范围条款，不当然承担投资、AML 终局判断、估值或监管责任。",
        ],
        points: [
          "授权文件是责任边界的起点：没写在 IMA/SA 里的，就不是该方的默示义务",
          "Fund Admin 承担的是协议内的操作责任，最终决策主体仍是基金治理方",
          "实际履职与纸面角色不一致时，应回到文件并提示缺口",
        ],
      },
      {
        id: "m3",
        title: "1.3 资金环节：Commitment 到 Distribution",
        body: [
          "私募基金的资金运作围绕投资者承诺展开：投资者认购时作出 Commitment（承诺出资额）；基金按项目资金需求向 LP 发出 Capital Call（缴款通知）；投资者实际缴付的金额为 Contribution；已承诺未缴付的部分称为 Unfunded Commitment；投资退出后按基金文件约定的瀑布顺序向投资者分配（Distribution）。",
          "Fund Admin 日常处理的缴款、分配计算、未缴承诺台账、违约投资者处理等，全部围绕上述概念展开。准确维护 Commitment 与 Unfunded Commitment 台账，直接影响资本调用上限与分配计算的正确性。",
        ],
        points: [
          "Commitment：承诺出资额，是台账与各项百分比的分母",
          "Capital Call / Drawdown：按需发出的缴款通知，须符合基金文件的频率与金额限制",
          "Unfunded Commitment：已承诺未缴部分，影响后续 Capital Call 空间",
          "Distribution：分配须按瀑布与份额类别计算，基金文件为准",
        ],
      },
      {
        id: "m4",
        title: "1.4 从签署到接纳：五个环节不当然等同",
        body: [
          "Fund Admin 的投资者生命周期管理中，五个事件必须分开记录、分开审批：签署认购文件 → AML/KYC 完成 → 正式接纳（GP/董事会/管理人的接纳决议）→ 收到资金 → 名册更新。签署了认购文件不等于已被接纳；材料齐全不等于 AML 完成；收到款不等于名册已更新。",
          "每一环节都应有对应文档与系统状态，交接时逐项核对。接纳权通常属于基金治理方（GP/董事会）或其授权主体，Fund Admin 执行验证与记录，不自行决定接纳。",
        ],
        points: [
          "接纳动作：以基金文件的接纳条款与治理方决议为准",
          "资金到账与名册更新之间可能有交割窗口，须在基金文件中核对份额定价日",
          "基金资产可由基金直接持有，也可通过 SPV、托管人、受托人或其他合法安排持有——所有权链不同，估值与披露的口径随之不同",
        ],
      },
    ],
    risks: [
      {
        title: "把“签署认购文件”当作“已被接纳”",
        detail:
          "接纳以治理方批准与基金文件接纳条款为准。过早向投资者确认份额或开放赎回，可能造成名册错误与交割纠纷。",
      },
      {
        title: "Fund Admin 准备 NAV 被误认为承担最终估值责任",
        detail:
          "Admin 按协议与估值政策准备或协助计算 NAV，最终估值责任与审批通常属于基金治理方/管理人及其委任的估值主体。协议未覆盖的事项不要默示承接。",
      },
      {
        title: "角色称谓跨载体混用",
        detail:
          "把 GP/LP 表述套用于公司型或信托型基金，会在基金文件、对外函件与监管沟通中造成歧义。",
      },
      {
        title: "资产持有结构未在文档中体现",
        detail:
          "通过 SPV、托管人或受托人持有时，未同步更新簿记与披露口径，会导致资产归属、估值与报告不一致。",
      },
    ],
    mindmap: {
      label: "一只境外基金如何运转",
      note: "Fund Admin 视角 · 全流程",
      children: [
        { label: "载体与角色", children: [{ label: "有限合伙 GP/LP" }, { label: "公司型/单位信托" }, { label: "称谓随载体" }] },
        { label: "判断链", children: [{ label: "载体→治理→投资管理" }, { label: "行政服务" }, { label: "授权文件" }, { label: "实际履职" }] },
        { label: "Manager", children: [{ label: "IMA 授权范围" }, { label: "投资决策" }, { label: "投后管理" }] },
        { label: "Fund Admin", children: [{ label: "服务协议 SA" }, { label: "份额/会计/报表" }, { label: "责任边界" }] },
        { label: "资金环节", children: [{ label: "Commitment" }, { label: "Capital Call" }, { label: "Contribution" }, { label: "Distribution" }] },
        { label: "投资者流程", children: [{ label: "认购≠接纳" }, { label: "AML/KYC" }, { label: "收款" }, { label: "名册更新" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "关于角色称谓，以下说法正确的是？",
        options: [
          "所有境外基金都必须使用 GP/LP 称谓",
          "GP/LP 是有限合伙载体的常见表述，公司型与单位信托使用不同称谓",
          "单位信托中也存在 LP",
          "公司型基金一定有 GP",
        ],
        answer: 1,
        explanation:
          "GP/LP 对应有限合伙载体。公司型基金称股东/董事会/基金经理，单位信托称受托人/单位持有人，称谓须随法律载体走。",
      },
      {
        id: "q2",
        question: "Fund Admin 承担职责的边界主要来自？",
        options: [
          "行业惯例的默示义务",
          "监管机构随时指定的工作",
          "服务协议（SA）与适用基金文件中的约定",
          "投资者口头要求",
        ],
        answer: 2,
        explanation:
          "Fund Admin 依服务协议与基金文件约定提供操作与行政支持；未经协议覆盖的事项不应默示承接。",
      },
      {
        id: "q3",
        question: "私募股权基金中，投资者已承诺但尚未缴付的部分称为？",
        options: ["Capital Call", "Contribution", "Unfunded Commitment", "Distribution"],
        answer: 2,
        explanation:
          "Unfunded Commitment 是承诺而未缴的余额；Capital Call 是缴款通知，Contribution 是实际缴付金额。",
      },
      {
        id: "q4",
        question: "投资者已签署认购文件，是否等于已被基金正式接纳？",
        options: [
          "等于，签署即完成接纳",
          "不等于，接纳以基金文件约定的条件与治理方（GP/董事会/管理人）的接纳决议为准",
          "等于，只要 AML/KYC 资料收齐",
          "等于，只要资金到账",
        ],
        answer: 1,
        explanation:
          "签署认购文件不等于正式接纳；接纳以基金文件的接纳条款与治理方决议为准，AML/KYC、到账与名册更新均为独立环节。",
      },
      {
        id: "q5",
        question: "Fund Admin 准备了一份 NAV 草稿，下列说法最恰当的是？",
        options: [
          "Admin 因此承担最终估值责任",
          "NAV 是否构成最终估值，取决于服务协议、估值政策与治理方/估值主体的批准安排",
          "只要 Admin 准备了 NAV，就自动替代审计师",
          "Admin 必须对估值结果负无限责任",
        ],
        answer: 1,
        explanation:
          "Admin 依协议与估值政策准备或协助计算 NAV；最终估值责任与批准通常属于治理方/管理人及其委任的估值主体，责任边界以文件为准。",
      },
      {
        id: "q6",
        question: "关于基金资产持有的说法正确的是？",
        options: [
          "基金资产必须由基金直接持有",
          "只能通过托管人持有",
          "可由基金直接持有，也可通过 SPV、托管人、受托人或其他合法安排持有",
          "只能由 GP 个人持有",
        ],
        answer: 2,
        explanation:
          "资产持有方式依基金文件与交易安排而定，直接持有或通过 SPV/托管人/受托人等安排均可能出现，簿记与披露口径随之不同。",
      },
    ],
    minutes: 22,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "各载体（合伙/公司/信托）的具体治理要求随法域与现行法律变化",
        "接纳权、份额定价与交割窗口以基金文件现行为准",
        "估值责任安排以现行服务协议与估值政策为准",
      ],
      documentsToCheck: [
        "LPA / 公司章程 / 信托契据（角色与接纳条款）",
        "投资管理协议 IMA 与服务协议 SA",
        "认购文件、PPM、估值政策",
      ],
      escalationTriggers: [
        "发现签署、AML、接纳、收款、名册状态不一致时",
        "协议未覆盖的工作被要求承接时",
        "资产持有结构与簿记/披露口径不一致时",
      ],
    },
  },
  {
    id: "02",
    slug: "fund-structure",
    title: "基金结构全景",
    subtitle: "按组织形式、隔离结构、运作方式与监管分类四维拆解",
    goal: [
      "从四个独立维度分析基金：组织形式、伞形/隔离结构、运作方式、监管分类，避免混层比较",
      "区分有限合伙、公司、LLC 与单位信托的组织形式差异",
      "认识 SPC/SP、Umbrella VCC/Sub-fund、Umbrella OFC/Sub-fund 等隔离结构的法律与治理差异",
      "掌握开放式与封闭式在赎回、估值与监管框架上的含义",
      "明白组织形式、监管分类、税务分类与 AEOI 分类必须分别判断",
    ],
    modules: [
      {
        id: "m1",
        title: "2.1 维度一：组织形式",
        body: [
          "组织形式回答“基金是什么法律主体、谁拥有、谁管理”：有限合伙（GP/LP）、公司（董事会治理、股东持有股份）、LLC（成员与经理）、单位信托（受托人持有资产、单位持有人受益）。每种形式的治理规则、责任结构与文件体系不同。",
          "例如 Cayman 的 ELP 是有限合伙、豁免公司是公司；BVI 亦有有限合伙与商业公司。不要把 LP、SPC、VCC、OFC 与“开放式/封闭式”放进同一个分类层级——它们回答的是不同维度的问题。",
        ],
        points: [
          "有限合伙：GP 管理、LP 出资（是否具有法律人格依法域，如 BVI LP 可作选择）",
          "公司：独立法人、董事与股东、多类别股份能力强",
          "LLC：成员制、灵活分配，常见于美国连接结构",
          "单位信托：契约型，受托人法律持有，广泛用于零售与部分香港结构",
        ],
      },
      {
        id: "m2",
        title: "2.2 维度二：伞形与隔离结构",
        body: [
          "伞形/隔离结构把多个子组合装进一个法律外壳：开曼 SPC（独立投资组合公司，下设 Segregated Portfolio/SP）、新加坡 VCC（可设 Sub-fund）、香港 OFC（可设 Sub-fund）。这些结构名称相似，但法律制度、治理、管理人与监管要求并不相同。",
          "关键提醒：SP 通常没有独立法律人格，其资产隔离来自特定法域立法对 SP 资产负债相互隔离的规则；SPC 与 VCC/OFC 分属不同法域的立法体系，不能因为都叫“伞形”就视为同一类结构。",
        ],
        points: [
          "SPC：开曼立法下的隔离组合机制，SP 无独立法人资格",
          "VCC：新加坡可变资本公司，Sub-fund 间按 VCC 法隔离，管理安排须符合新加坡框架",
          "OFC：香港开放式基金型公司，保留独立法人、可单体或伞形设立、子基金隔离",
          "治理与管理人要求随各法域现行规定而异，办理时复核",
        ],
      },
      {
        id: "m3",
        title: "2.3 维度三：运作方式（开放与封闭）",
        body: [
          "运作方式回答“投资者能否、何时按净值赎回”：开放式基金通常允许定期/按约定赎回，份额随申购赎回增减，对应连续估值与赎回款处理；封闭式基金一般不允许日常赎回，资金以承诺制投入，退出依赖项目退出与清算分配。",
          "运作方式直接影响监管框架的选择（许多法域按开放/封闭区分共同基金与私募基金制度）、净值与流动性管理（如侧袋、赎回门槛、暂停赎回条款）以及 Fund Admin 的运营流程。",
        ],
        points: [
          "开放式：份额申赎、连续/定期定价，关注赎回流程与流动性条款",
          "封闭式：承诺-缴款-分配，关注 Capital Call 与 Unfunded Commitment 台账",
          "同一基金文件内可能出现类别化赎回安排，以基金文件为准",
        ],
      },
      {
        id: "m4",
        title: "2.4 维度四：监管分类与税务/AEOI 分层判断",
        body: [
          "监管分类由各司法辖区的正式制度定义（如开曼的 Mutual Fund/Private Fund、BVI 的相关基金类别、新加坡的持牌/注册基金框架等），其分类依据、注册义务与豁免条件需按各法域现行法律判断。",
          "组织形式、监管分类、税务分类与 AEOI 分类是四套不同的判断维度：一个 Cayman ELP（组织形式）可能是 Private Fund（监管分类）、税务透明主体（税务分类）与投资实体 FI（AEOI 分类）。不能用一个标签覆盖其余维度。",
        ],
        points: [
          "监管分类 → 决定注册/备案义务与持续合规要求",
          "税务分类 → 决定所得归属与申报主体（实体/穿透）",
          "AEOI 分类 → 决定 FATCA/CRS 下的申报身份与义务",
          "三类判断互相独立，须分别读取各自依据",
        ],
      },
    ],
    risks: [
      {
        title: "跨维度混层比较",
        detail:
          "把 LP、SPC、VCC、OFC 与开放/封闭式并列表述，会在分析中造成错误推论。先定维度，再逐层展开。",
      },
      {
        title: "默认隔离结构等同独立法人",
        detail:
          "SP 通常没有独立法律人格；SPC/VCC/OFC 的隔离机制与治理要求各异，不能一概而论。",
      },
      {
        title: "用一张图套用所有法域",
        detail:
          "新加坡 VCC 的基金管理安排、香港 OFC 的载体要求各成体系。涉及具体法域时须以该法域现行法律与服务商指引复核。",
      },
      {
        title: "一个标签覆盖监管、税务与 AEOI 三层",
        detail:
          "组织形式与监管/税务/AEOI 分类是不同判断，合并会导致申报主体与义务识别错误。",
      },
    ],
    mindmap: {
      label: "基金结构全景",
      note: "四个独立维度",
      children: [
        { label: "组织形式", children: [{ label: "有限合伙" }, { label: "公司" }, { label: "LLC" }, { label: "单位信托" }] },
        { label: "隔离结构", children: [{ label: "SPC / SP" }, { label: "VCC / Sub-fund" }, { label: "OFC / Sub-fund" }] },
        { label: "运作方式", children: [{ label: "开放式" }, { label: "封闭式" }] },
        { label: "分类分层", children: [{ label: "监管分类" }, { label: "税务分类" }, { label: "AEOI 分类" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "下列哪组选项最适合同层对比？",
        options: [
          "SPC 与开放式基金",
          "LP 与单位信托（同为组织形式）",
          "VCC 与封闭式",
          "监管分类与 Capital Call",
        ],
        answer: 1,
        explanation:
          "LP 与单位信托都属于组织形式维度；SPC/VCC/OFC 属隔离结构维度，开放/封闭属运作方式维度，不应混层比较。",
      },
      {
        id: "q2",
        question: "关于 SPC 下设的 SP（Segregated Portfolio），正确的是？",
        options: [
          "SP 是具有独立法律人格的法人",
          "SP 通常没有独立法律人格，隔离来自特定法域立法",
          "SP 可以自行对外签约而无需 SPC 介入",
          "SP 与 SPC 在同一法域法律地位完全相同",
        ],
        answer: 1,
        explanation:
          "SP 通常没有独立法人资格，其资产负债隔离依赖设立地立法对 SP 机制的专门规则。",
      },
      {
        id: "q3",
        question: "在分析一只基金时应如何处理税务与 AEOI 分类？",
        options: [
          "沿用其监管分类即可",
          "按组织形式推断",
          "作为独立维度，分别按其各自规则判断",
          "税务分类等同于 AEOI 分类",
        ],
        answer: 2,
        explanation:
          "组织形式、监管、税务与 AEOI 各按各自依据独立判断，不能互相替代。",
      },
      {
        id: "q4",
        question: "涉及新加坡 VCC 时，对基金管理人表述较稳妥的是？",
        options: [
          "任何公司都可担任 VCC 管理人",
          "沿用 RFMC 作为当前可申请类别的说法",
          "按现行框架使用审慎表述并复核持牌/登记要求（如 permissible fund manager 类安排）",
          "VCC 不需要管理人",
        ],
        answer: 2,
        explanation:
          "基金牌照类别与登记要求属时点性信息，应避免沿用已变化的类别表述，须按现行规定复核。",
      },
    ],
    minutes: 22,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "各法域（Cayman/BVI/新加坡/香港等）对 SPC/VCC/OFC 的治理与管理人要求",
        "新加坡基金管理牌照类别（如 RFMC/LFMC/permissible fund manager 表述）",
        "香港 OFC 的注册与运作细则",
        "各辖区正式基金类别与豁免条件",
      ],
      documentsToCheck: [
        "相关法域现行基金法例与监管指引",
        "基金组织文件与募集文件",
        "特定法域（如 VCC/OFC）官方登记与申报指引",
      ],
      escalationTriggers: [
        "需要就某法域监管分类作结论而现行规定不确定时",
        "结构同时牵涉多法域监管与税务分类时",
        "客户要求以单一标签概括多层分类时",
      ],
    },
  },
  {
    id: "14",
    slug: "cayman-framework",
    title: "Cayman 基金核心框架",
    subtitle: "从集合投资安排到注册与持续合规：一条判断链走完开曼基金",
    goal: [
      "掌握开曼基金判断链：集合投资安排 → 排除情形 → 可否按投资者意愿赎回 → Private Fund / Mutual Fund 框架 → 分主体判断 → 注册及持续合规",
      "理解 CIMA 注册、治理与持续合规模块及其边界",
      "明白单一资产不当然排除 Private Fund 属性、基金注册证书不是 Manager 牌照",
      "对 Fund、GP、Manager、AIV、平行基金、共同投资载体与 SPV 分别判断",
    ],
    modules: [
      {
        id: "m1",
        title: "3.1 判断链起点：它是不是集合投资安排",
        body: [
          "开曼基金分析通常从“是否构成集合投资安排”开始：投资者汇集资金、利益来自投资组合、投资者不参与日常管理。若属 non-fund arrangement（如单纯的持股公司、集团内部安排、联合投资工具等）或适用其他排除情形，可能不落入基金监管框架。",
          "是否可按投资者意愿赎回，是把安排导向开放/封闭框架的关键分叉；封闭式集合投资安排通常进入 Private Fund 分析，允许赎回的共同基金安排进入 Mutual Fund 分析。该判断以实际安排与现行法律为准。",
        ],
        points: [
          "第一步：集合投资安排（Collective Investment Arrangement）与否",
          "第二步：non-fund arrangement 或其他排除情形",
          "第三步：按投资者意愿可赎回与否 → 决定分析框架",
          "判断须基于事实与适用法律，非仅基于名称",
        ],
      },
      {
        id: "m2",
        title: "3.2 Private Fund / Mutual Fund 与分主体核查",
        body: [
          "开曼现行框架下，封闭式私募基金多进入 Private Fund（私募基金法体系）分析，面向公众的共同基金进入 Mutual Fund（共同基金法体系）分析；各自有注册与豁免路径，条件与门槛须按现行法规复核。单一资产基金不当然因“只有一个资产”而排除 Private Fund 属性——是否构成取决于集合、投资利益与安排特征。",
          "注册后应分主体核查：Fund 本身、GP（若合伙）、Manager/投资经理、以及 AIV、平行基金、共同投资载体、SPV 等关联主体——各自是否需要在开曼注册、备案或任命服务商，结论互不相同。基金注册证书本身不是 Manager 牌照。",
        ],
        points: [
          "Private Fund 与 Mutual Fund 依据与条件不同，按现行法律核对",
          "“一个资产”不是 Private Fund 的自动排除理由",
          "CIMA 注册证书证明的是基金的注册状态，不授予管理/持牌职能",
          "Fund、GP、Manager、AIV、平行基金、Co-Invest 载体、SPV 分别判断",
        ],
      },
      {
        id: "m3",
        title: "3.3 治理与服务商：董事、注册代理与运营者结构",
        body: [
          "开曼基金的日常治理依赖董事、注册代理/注册办事处与行政管理员等安排。所谓 Four Eyes（双人审批）等机制，应结合基金法律形式与运营者结构核查是否适用，而非简单表述为所有基金统一适用的固定规则。",
          "注册代理/企业服务商负责维护注册办事处与法定记录；行政管理员依服务协议提供份额登记、会计与报表支持。服务商是否“被认可”及任命变更是否需备案，按 CIMA 现行规则办理。",
        ],
        points: [
          "Four Eyes 等治理机制是否适用：取决于法律形式与运营者结构",
          "注册代理与注册办事处是开曼实体常规要求",
          "服务商任命与变更按 CIMA 现行要求备案",
        ],
      },
      {
        id: "m4",
        title: "3.4 持续合规：一张年度清单",
        body: [
          "基金获准注册后进入持续合规周期，覆盖范围通常包括：审计与财务报表、年度申报与费用、估值安排、资产保管或所有权验证、现金监控、证券识别、治理、AML/CFT、AEOI（CRS/FATCA）、数据保护、经济实质以及实益所有权登记。各事项的启动时点、申报窗口与表格按 CIMA 现行指引执行。",
          "注册时序、期限、表格与程序均属时点性内容，不建议在通用课程中写死；Fund Admin 应依托服务商的合规日历逐项跟踪并留痕。",
        ],
        points: [
          "审计：经认可的审计师出具报告并按现行要求提交",
          "估值与资产监控：按基金文件与监管要求执行所有权验证/保管安排",
          "AML/AEOI/经济实质/实益所有权：各自独立申报口径",
          "数据保护：涉及投资者个人信息处理时须评估适用规则",
        ],
      },
    ],
    risks: [
      {
        title: "把 Four Eyes 写成放之四海皆准的规则",
        detail:
          "治理机制是否适用取决于基金法律形式与运营者结构。笼统断言会造成治理安排与实际不符。",
      },
      {
        title: "注册证书当牌照用",
        detail:
          "基金的 CIMA 注册证书不代表其 Manager 或其他主体持有牌照；牌照/注册义务按主体分别核查。",
      },
      {
        title: "单一资产自动豁免思维",
        detail:
          "“只投一个项目”不等于当然豁免 Private Fund 注册判断，须按集合投资安排与基金定义逐项核对。",
      },
      {
        title: "把时点性流程写死进通用材料",
        detail:
          "注册时序、期限、表格、费用会变化。写入培训材料时须附“办理时复核”，否则会迅速过时。",
      },
    ],
    mindmap: {
      label: "Cayman 基金核心框架",
      note: "判断链：从安排到持续合规",
      children: [
        { label: "第一步 集合投资安排", children: [{ label: "是否 non-fund" }, { label: "排除情形" }] },
        { label: "第二步 赎回与否", children: [{ label: "可赎回" }, { label: "不可赎回" }] },
        { label: "第三步 框架", children: [{ label: "Mutual Fund" }, { label: "Private Fund" }] },
        { label: "分主体", children: [{ label: "Fund/GP/Manager" }, { label: "AIV/平行/SPV" }] },
        { label: "注册与持续合规", children: [{ label: "审计" }, { label: "AEOI" }, { label: "AML" }, { label: "经济实质" }, { label: "BO" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "开曼基金判断链中，“按投资者意愿是否可赎回”的作用是？",
        options: [
          "决定基金的估值频率",
          "帮助把安排导向封闭式（Private Fund）或开放式（Mutual Fund）分析框架",
          "决定是否需要注册代理",
          "决定审计师人选",
        ],
        answer: 1,
        explanation:
          "可赎回性是把集合投资安排导向 Private Fund 或 Mutual Fund 分析框架的关键分叉（仍需按现行法律核对注册/豁免）。",
      },
      {
        id: "q2",
        question: "一只仅投资单一资产的封闭式基金，正确的是？",
        options: [
          "当然不构成 Private Fund",
          "必然豁免全部注册义务",
          "是否落入 Private Fund 框架取决于集合投资安排特征与现行法律，单一资产本身不当然排除",
          "属于 Mutual Fund 管辖",
        ],
        answer: 2,
        explanation:
          "单一资产不当然排除 Private Fund 属性，判断依据是安排特征与适用法律。",
      },
      {
        id: "q3",
        question: "关于 CIMA 基金注册证书的说法正确的是？",
        options: [
          "等同于基金管理牌照",
          "证明基金已注册，但不等同于 Manager 或其他主体的牌照/许可",
          "自动豁免 AML 义务",
          "替代审计义务",
        ],
        answer: 1,
        explanation:
          "注册证书仅反映基金本体的注册状态；Manager、服务商等的牌照与义务须单独核查。",
      },
      {
        id: "q4",
        question: "Four Eyes（双人审批等治理机制）的正确理解是？",
        options: [
          "开曼所有基金统一适用的强制规则",
          "应结合基金法律形式与运营者结构核查是否适用",
          "仅适用于 SPC",
          "属于 AEOI 申报要求",
        ],
        answer: 1,
        explanation:
          "此类治理机制是否适用取决于基金的法律形式与运营者结构，不能作为普适固定规则。",
      },
    ],
    minutes: 24,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "Private Fund / Mutual Fund 的注册与豁免门槛、表格与费用",
        "注册时序、期限与申报程序",
        "CIMA 对审计提交、AEOI、经济实质、实益所有权申报的现行要求",
        "服务商认可与备案要求",
      ],
      documentsToCheck: [
        "CIMA 现行注册与申报指引",
        "开曼基金法律文本（Private Funds Law / Mutual Funds Law 现行版本）",
        "经济实质指引与受益所有人登记要求",
      ],
      escalationTriggers: [
        "需要判断某安排是否落入基金监管框架而边界模糊时",
        "基金注册状态与服务商任命存在缺口时",
        "把注册证书误解为牌照的表述需要纠正时",
      ],
    },
  },
  {
    id: "10",
    slug: "aml-kyc",
    title: "AML 与投资者尽调",
    subtitle: "六步 CDD 框架：Identify / Verify / Understand / Screen / Risk-rate / Monitor",
    goal: [
      "掌握六步 CDD 框架并能按序执行投资者尽调",
      "区分个人与机构投资者的尽调要素（UBO、控制人、监管/上市状态等）",
      "建立 Trust/PTC 结构的基本判断：Settlor、Trustee、Protector、Beneficiary 与其他行使最终有效控制的人",
      "区分 AMLCO、MLRO 与 DMLRO 的职责，理解 Admin 在 CDD 中的角色边界",
      "理解文件齐全不等于 CDD 充分、认购完成不等于 AML 完成",
    ],
    modules: [
      {
        id: "m1",
        title: "4.1 六步框架总览",
        body: [
          "把 CDD 拆成六个可执行步骤便于质量控制与留痕：①Identify 识别客户与结构 → ②Verify 核实身份与文件 → ③Understand 了解业务性质、投资目的与资金来源 → ④Screen 筛查制裁、PEP 与负面信息 → ⑤Risk-rate 风险评级并决定是否需强化尽调 → ⑥Monitor 持续监控与定期复核。",
          "六步不是一次性动作：投资者存续期内信息变化（股权变更、新增董事、税务居民变化）会触发复核。把每一步的结论与依据记录在案，是 AML 检查与审计回应的基础。",
        ],
        points: [
          "Identify/Verify/Understand/Screen/Risk-rate/Monitor 六步依次闭环",
          "证据链留痕：每一结论都有文件或检索记录支撑",
          "持续监控触发点：所有权变化、制裁名单更新、负面新闻、异常交易",
        ],
      },
      {
        id: "m2",
        title: "4.2 个人与机构投资者：要素清单",
        body: [
          "个人投资者通常覆盖：身份与地址、税收居民身份、职业/雇主、投资目的、资金来源（SOF）与财富来源（SOW）、授权代理人、PEP 身份、制裁与负面信息。机构投资者则覆盖：成立与存续状态、组织文件、董事、授权签字人、所有权链、UBO（最终受益所有人）、控制人、监管或上市状态、SOF、投资目的，以及复杂结构的商业合理性说明。",
          "机构文件的“齐全”不等于 CDD“充分”：文件齐了但未理解结构与资金来源，或存在明显矛盾未澄清，仍是尽调不足。同样，认购完成不等于 AML 完成——AML 结论须在接纳前后独立形成并留痕。",
        ],
        points: [
          "UBO 穿透：沿所有权链至最终自然人（门槛与规则按现行 AML 要求）",
          "控制人：可能包含通过其他方式行使控制的人，不限于持股",
          "文件复核重点：矛盾信息、失效文件、复印件来源",
          "CTC（受信任的第三方/证书）并非所有情形下唯一核验方式",
        ],
      },
      {
        id: "m3",
        title: "4.3 Trust / PTC：先判断角色再要文件",
        body: [
          "面对信托或私人信托公司（PTC）投资者，先做角色判断：Settlor（设立人）、Trustee（受托人）、Protector（保护人）、Beneficiary（受益人）或受益人类别，以及其他行使最终有效控制的人（如安排发起人）。不同角色在尽调中的意义不同。",
          "不要机械地“向所有 Trust 角色索取同一套文件”。应先识别哪些角色对资金与投资决策行使最终有效控制，再决定需要验证与了解的对象；同时核对信托契据与相关决议以确认权力归属。",
        ],
        points: [
          "Trustee：通常持有资产并决策，是核心核查对象之一",
          "Protector：其权力范围以契据为准，可能构成有效控制",
          "PTC：先判断其董事与股东结构，再判断是否需要穿透",
          "文件需求因人而异：依据角色与控制关系定制，而非一套文件通吃",
        ],
      },
      {
        id: "m4",
        title: "4.4 治理角色、Admin 边界与可疑活动",
        body: [
          "AML 治理常见三职：AMLCO（合规官，统筹体系与政策）、MLRO（洗钱报告官，接收内部可疑报告并对外提交）、DMLRO（副报告官，替补与分担）。各法域角色与备案要求不同，但“政策-执行-报告”职能分离是通用思路。",
          "Fund Admin 可依服务协议提供 CDD 操作支持（收集文件、执行筛查、记录归档），但通常不当然是最终客户接纳决定者或可疑活动报告决定者。发现可疑活动时应注意保密并禁止向客户通风报信（Tipping-off），由指定角色按流程处理。EDD 必须针对具体风险，而不是套模板堆文件。",
        ],
        points: [
          "Admin 做操作、治理方/AMLCO 体系、MLRO/DMLRO 决定报告——边界写进服务协议",
          "EDD 措施应针对已识别的具体风险场景",
          "可疑活动处理：记录、升级、保密、禁止 Tipping-off",
        ],
      },
    ],
    risks: [
      {
        title: "文件齐全即算尽调完成",
        detail:
          "CDD 的实质在于理解与判断：文件收齐但来源、结构或矛盾未澄清，仍是尽调缺口。",
      },
      {
        title: "Trust 尽调一刀切",
        detail:
          "对所有信托角色索取同一套文件，会遗漏真正行使控制的人，或对无关角色过度收集信息。",
      },
      {
        title: "Admin 越权决定接纳或报告",
        detail:
          "Admin 提供操作支持；最终客户接纳与可疑活动报告由基金治理方/指定角色（MLRO/DMLRO）依规决定。",
      },
      {
        title: "EDD 流于形式",
        detail:
          "不针对具体风险的模板化 EDD 无法满足监管预期，也可能遗漏真正的风险点。",
      },
    ],
    mindmap: {
      label: "AML 与投资者尽调",
      note: "六步 CDD 框架",
      children: [
        { label: "① Identify", children: [{ label: "客户与结构识别" }, { label: "角色判断" }] },
        { label: "② Verify", children: [{ label: "身份与文件核实" }, { label: "UBO/控制人" }] },
        { label: "③ Understand", children: [{ label: "业务性质" }, { label: "SOF/SOW" }, { label: "投资目的" }] },
        { label: "④ Screen", children: [{ label: "制裁" }, { label: "PEP" }, { label: "负面信息" }] },
        { label: "⑤ Risk-rate", children: [{ label: "风险评级" }, { label: "EDD 针对具体风险" }] },
        { label: "⑥ Monitor", children: [{ label: "持续监控" }, { label: "定期复核" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "六步 CDD 框架的正确顺序是？",
        options: [
          "Verify → Screen → Identify → Monitor",
          "Identify → Verify → Understand → Screen → Risk-rate → Monitor",
          "Screen → Identify → Monitor → Verify",
          "Risk-rate → Identify → Verify → Screen",
        ],
        answer: 1,
        explanation:
          "六步框架：Identify → Verify → Understand → Screen → Risk-rate → Monitor。",
      },
      {
        id: "q2",
        question: "对 Trust 投资者进行尽调时，较合适的做法是？",
        options: [
          "向 Settlor、Trustee、Protector、Beneficiary 一律索取同一套文件",
          "先判断各角色与最终有效控制关系，再定制化收集与验证",
          "只验证 Trustee 身份即可",
          "信托投资者无需尽调",
        ],
        answer: 1,
        explanation:
          "应先识别行使最终有效控制的人与角色权力，再按需收集文件，避免机械一刀切。",
      },
      {
        id: "q3",
        question: "关于 Fund Admin 在 AML 流程中的角色，正确的是？",
        options: [
          "Admin 是可疑活动报告的最终决定者",
          "Admin 可依协议提供 CDD 操作支持，但接纳与报告决定通常属于基金治理方/指定角色",
          "Admin 自动承担全部 AML 合规责任",
          "Admin 与 AML 无关",
        ],
        answer: 1,
        explanation:
          "Admin 依服务协议提供操作支持；最终客户接纳与可疑活动报告由治理方/MLRO、DMLRO 等指定角色决定。",
      },
      {
        id: "q4",
        question: "“认购文件已签署但 AML 未完成”时，正确的判断是？",
        options: [
          "可以直接接纳投资者",
          "认购完成即视为 AML 完成",
          "认购与接纳、AML 是不同环节，应在 AML/CDD 完成并留痕后再行接纳",
          "AML 可以事后补做",
        ],
        answer: 2,
        explanation:
          "认购、AML/CDD、正式接纳是独立环节；文件齐全不等于 CDD 充分，AML 结论应在接纳前后独立形成。",
      },
    ],
    minutes: 24,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "UBO 认定门槛与规则随各法域 AML 立法变化",
        "制裁名单与 PEP 认定口径",
        "AMLCO/MLRO/DMLRO 的备案与任职要求",
        "CTC/依赖第三方安排的现行条件",
      ],
      documentsToCheck: [
        "适用法域现行 AML/CFT 法律与监管指引",
        "基金 AML 手册与 CDD 政策",
        "制裁/PEP 筛查名单与工具说明",
      ],
      escalationTriggers: [
        "KYC 资料与自我声明存在矛盾时",
        "复杂信托/公司结构无法确认最终有效控制时",
        "潜在可疑活动需按流程上报 MLRO/DMLRO 时",
      ],
    },
  },
  {
    id: "12",
    slug: "fatca-crs",
    title: "FATCA 与 CRS",
    subtitle: "四层框架：基金分类 → 注册与角色 → 投资者尽调 → 申报与工作底稿",
    goal: [
      "用四层框架分析 FATCA/CRS：基金自身分类、注册及角色、投资者尽调、申报确认与工作底稿",
      "区分 FATCA 与 CRS 两套机制的触发逻辑与互换局限",
      "理解 Self-Certification 的签署、日期、TIN、税收居民地及合理性检查",
      "掌握 KYC 与自我证明矛盾、情况变更（change in circumstances）的处理",
      "明确 GIIN 不是金融牌照；UBO 与 Controlling Person 不能无条件等同；零申报不等于零工作",
    ],
    modules: [
      {
        id: "m1",
        title: "5.1 第一层：基金自身分类",
        body: [
          "AEOI 分析从基金自身分类开始：是否属于 Financial Institution（金融机构）及其下的 Investment Entity（投资实体），是否可归入 Non-Reporting FI，或属于 NFE（非金融实体）及 Active/Passive 类别。分类决定后续注册与申报义务。",
          "同一基金在不同法域口径（FATCA 美国规则 vs CRS 多边规则）下可能有不同处理，必须分别读取适用文本，不能以“基金”二字直接下结论。",
        ],
        points: [
          "Investment Entity 判断：以金融资产投资/管理为主业等测试为准",
          "Non-Reporting FI 与 NFE 各有限定条件",
          "FATCA 分类与 CRS 分类各自独立判断",
        ],
      },
      {
        id: "m2",
        title: "5.2 第二层：注册与角色安排",
        body: [
          "若基金属于需注册的主体：FATCA 下可能涉及向 IRS 注册取得 GIIN（依 IGA 或 FFI 协议路径）；CRS 下在本地税务机关/门户（如开曼的 TIA 门户）完成注册与分类申报，并指定联络角色（如 PPOC/Principal Point of Contact、Authorising Person）及申报授权安排。",
          "注册角色（如 PPOC 与 Authorising Person）的资格、独立性及兼任规则须按办理时官方要求复核，课程不宜写死。GIIN 只是 FATCA 注册标识，不是金融牌照，也不能独立证明完整的 FATCA/CRS 合规状态。",
        ],
        points: [
          "GIIN：FATCA 注册标识；不代表持牌或整体合规证明",
          "CRS 注册与申报门户、角色设置按现行官方要求",
          "角色兼任与授权变更需保持记录并可追溯",
        ],
      },
      {
        id: "m3",
        title: "5.3 第三层：投资者尽调与 Self-Certification",
        body: [
          "投资者层面：收集并检查税务自我证明（Self-Certification），逐项核验签署、日期、TIN、税收居民地等要素的完整性与合理性；CRS 下还需结合账户信息（地址、电话、出生地等“指标”）判断是否存在矛盾信号。",
          "当 KYC 资料与 Self-Certification 存在矛盾时，不得直接接受，应取得解释与支持文件，必要时更新账户信息或重新定性。投资者情况发生变更（如迁居、改变税收居民身份）属于 change in circumstances，应触发更新自我证明与账户记录。",
        ],
        points: [
          "自我证明检查清单：签署、日期、TIN、税收居民地、合理性",
          "矛盾处理：先澄清取证，再决定是否接受或更新",
          "情况变更：主动跟进并留痕",
          "AML 的 UBO 与 CRS 的 Controlling Person 概念口径不同，不能无条件视为完全相同",
        ],
      },
      {
        id: "m4",
        title: "5.4 第四层：申报、确认与工作底稿",
        body: [
          "年度申报前做数据质量校验：TIN 缺失、出生日期缺失、账户归属不清的账户逐一处理；零申报（无可报告账户）不等于没有年度合规工作——分类复核、数据校验、申报提交与记录留存都须完成。",
          "申报期限与可报告地区名单按报告年度复核，不沿用旧表。工作底稿（分类依据、自我证明、复核记录、申报回执）按本地留存要求归档，作为监管质询与审计的回应基础。",
        ],
        points: [
          "零申报也需要完整的年度流程与记录",
          "FATCA 与 CRS 不能完全互换：机制、对手方与判定规则不同",
          "申报期限与辖区名单以当年官方发布为准",
          "底稿留痕：从分类到申报的全链路证据",
        ],
      },
    ],
    risks: [
      {
        title: "FATCA 与 CRS 混为一谈",
        detail:
          "两套机制触发逻辑、申报对象与适用文本不同，不能用一套结论覆盖另一套。",
      },
      {
        title: "矛盾自我证明直接放行",
        detail:
          "KYC 与自我证明不一致时直接接受，会在抽查中暴露为尽调缺陷并招致罚款。",
      },
      {
        title: "零申报即零工作",
        detail:
          "零申报只是结果，分类、校验、提交与留痕的年度流程仍需完整执行。",
      },
      {
        title: "UBO 与 Controlling Person 混用",
        detail:
          "AML 的受益所有人概念与 CRS 的 Controlling Person 判定口径不同，不能无条件等同。",
      },
    ],
    mindmap: {
      label: "FATCA 与 CRS",
      note: "四层判断框架",
      children: [
        { label: "① 基金分类", children: [{ label: "FI / Investment Entity" }, { label: "Non-Reporting FI" }, { label: "NFE" }] },
        { label: "② 注册与角色", children: [{ label: "GIIN" }, { label: "TIA 门户" }, { label: "PPOC/Authorising Person" }] },
        { label: "③ 投资者尽调", children: [{ label: "Self-Certification" }, { label: "合理性检查" }, { label: "矛盾处理" }, { label: "变更跟进" }] },
        { label: "④ 申报与底稿", children: [{ label: "年度申报" }, { label: "数据质量" }, { label: "零申报≠零工作" }, { label: "留痕归档" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "FATCA 与 CRS 的关系，正确的是？",
        options: [
          "两者完全相同，可互换使用",
          "机制、申报对象与判定规则不同，不能无条件互换",
          "CRS 是 FATCA 的替代名称",
          "FATCA 只适用于基金",
        ],
        answer: 1,
        explanation:
          "FATCA 与 CRS 是不同机制，须分别按各自适用文本判断与申报。",
      },
      {
        id: "q2",
        question: "收到投资者 Self-Certification 后，发现其与 KYC 资料矛盾，应？",
        options: [
          "直接按自我证明申报",
          "先取得解释与支持文件，核对后再决定是否接受或更新",
          "立即注销账户",
          "忽略矛盾",
        ],
        answer: 1,
        explanation:
          "矛盾不得直接接受；应先澄清取证，必要时更新账户信息或重新定性。",
      },
      {
        id: "q3",
        question: "关于 GIIN 的说法正确的是？",
        options: [
          "GIIN 是金融牌照",
          "GIIN 是 FATCA 注册标识，不代表持牌，也不能独立证明完整 AEOI 合规",
          "有 GIIN 即免除 CRS 申报",
          "GIIN 替代审计",
        ],
        answer: 1,
        explanation:
          "GIIN 仅是 FATCA 注册标识；合规状态还需结合分类、尽调与申报流程整体判断。",
      },
      {
        id: "q4",
        question: "某基金年度“零申报”，下列说法正确的是？",
        options: [
          "意味着没有任何年度合规工作",
          "分类复核、数据校验、申报提交与记录留存等流程仍须完成",
          "可以跳过自我证明收集",
          "无需保留任何记录",
        ],
        answer: 1,
        explanation:
          "零申报只是申报结果；完整的年度合规流程与记录留存仍然必要。",
      },
    ],
    minutes: 24,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "申报期限与可报告地区名单（按报告年度）",
        "PPOC/Authorising Person 的资格、独立性与兼任规则",
        "CRS 门户（如开曼 TIA）的注册与申报界面要求",
        "IGA 与 FFI 协议路径的现行安排",
      ],
      documentsToCheck: [
        "适用辖区 AEOI 官方门户与年度申报指引",
        "IRS/FATCA 注册信息与 GIIN 状态",
        "CRS 自我证明表模板与 TIN 规则",
      ],
      escalationTriggers: [
        "KYC 与自我证明矛盾无法澄清时",
        "情况变更影响税收居民身份判断时",
        "申报截止前数据质量缺口较大时",
      ],
    },
  },
  {
    id: "15",
    slug: "bvi-fund-manager",
    title: "BVI 基金与管理人",
    subtitle: "区分基金类别、Approved Manager 与 BVI 独特治理：不按名称下判断",
    goal: [
      "区分 BVI Private Fund、Professional Fund 与 Private Investment Fund 等概念及其适用",
      "理解开放式安排进入 BVI 共同基金（Mutual Fund）体系分析，封闭式集合投资安排重点看 Private Investment Fund 制度",
      "掌握 Private Investment Fund 模块：FSC 认可、投资者限制、授权代表、董事与指定人士、估值、管理、保管、利益冲突、审计与变更通知",
      "理解 Approved Manager 是简化监管制度而非“无监管”；区分投资基金、基金管理与持股业务的经济实质分析",
      "明白 BVI 有限合伙可依法选择是否具有法律人格，不能直接套用 Cayman ELP 规则",
    ],
    modules: [
      {
        id: "m1",
        title: "6.1 先分清名称：Private Fund vs Private Investment Fund",
        body: [
          "BVI 语境里容易出现名称混淆：Private Fund（私人基金）是 BVI 共同基金体系（Mutual Funds Act）下面向专业投资者的类别；Private Investment Fund（私募投资基金）是《私募投资基金法》（PIF Act）下的封闭式基金制度；Professional Fund 则指向专业投资者并可适用简化安排。不要仅凭客户或文件中的“private fund”字样直接判断监管分类。",
          "开放式的集合投资安排通常进入 BVI 共同基金（Mutual Fund）体系分析；封闭式集合投资安排则重点分析 Private Investment Fund 制度。分类须结合运作方式、投资者属性与现行法律。",
        ],
        points: [
          "名称≠分类：先看运作方式、投资者限制与适用法律",
          "开放式 → Mutual Fund 体系分析",
          "封闭式 → Private Investment Fund（PIF Act 体系）",
          "各制度注册与豁免条件按 FSC 现行要求复核",
        ],
      },
      {
        id: "m2",
        title: "6.2 Private Investment Fund：模块化拆解",
        body: [
          "Private Investment Fund（PIF）制度通常覆盖以下模块：FSC 认可/注册、组织文件中体现的投资者限制、授权代表（Approved Representative）、董事与指定人士或相应职能、估值安排、资产管理、资产保管、利益冲突管理、审计，以及变更通知义务。各模块的具体触发与执行按 PIF Act 与 FSC 指引办理。",
          "基金应持续保存投资者名册、组织文件与财务记录，服务商（注册代理、授权代表、审计师）的任命与变更按规定通知 FSC。",
        ],
        points: [
          "组织文件中的投资者限制：是否面向合格/专业投资者",
          "估值、保管与利益冲突安排须有书面政策与执行记录",
          "重大变更（服务商、基金文件）按 FSC 现行要求通知",
        ],
      },
      {
        id: "m3",
        title: "6.3 Approved Manager：简化监管不是无监管",
        body: [
          "BVI 获批管理人（Approved Manager）是面向 BVI 基金提供管理服务的简化监管制度：适用基金范围（通常限定于 BVI 的特定基金类别）、业务规模限制、董事要求、授权代表、财务报表、年度申报与重大事项通知等构成其合规义务。它比全面持牌更轻，但仍是受监管安排。",
          "Approved Manager 不是注册代理牌照，也不替代基金的 AML、AEOI 与其他合规义务。获批管理人的基金覆盖面与限制条件可能变化，须按 FSC 现行规则复核。",
        ],
        points: [
          "适用基金范围与业务规模限制：现行规则复核",
          "董事、授权代表、财务报表、年度申报与重大事项通知为持续义务",
          "获批管理人不替代基金自身的 AML/AEOI/其他合规",
        ],
      },
      {
        id: "m4",
        title: "6.4 法律人格、经济实质与三类业务",
        body: [
          "BVI 有限合伙可依据 BVI 法律选择是否具有法律人格，这一点与 Cayman ELP 的规则并不相同，不能直接套用开曼经验。基金文件的合伙协议须明确该选择。",
          "经济实质应按主体分别分析：Fund、Manager、GP、持股 SPV 与其他实体各自主营业务与相关活动归属不同。业务层面应区分：投资基金业务（fund investment business）、基金管理业务（fund management business）与持股业务（holding business），其相关活动分类与经济实质测试不同。",
        ],
        points: [
          "BVI LP 法律人格可选择：以 BVI 现行法与合伙协议为准",
          "ES 分析按 Fund/Manager/GP/SPV 分层进行",
          "基金投资、基金管理与持股业务在 ES 口径下分别判断",
        ],
      },
    ],
    risks: [
      {
        title: "凭“private fund”字样定分类",
        detail:
          "BVI 名称易混：Private Fund、Professional Fund、Private Investment Fund 分属不同制度，判断须基于运作方式、投资者属性与现行法律。",
      },
      {
        title: "把 Approved Manager 当无监管",
        detail:
          "Approved Manager 是简化监管制度，仍有范围限制、规模限制、董事与年度申报等持续义务，并非无监管。",
      },
      {
        title: "用 Cayman ELP 逻辑套 BVI LP",
        detail:
          "BVI 有限合伙可依法选择是否具法律人格，与 Cayman ELP 规则不同，不能直接移植经验。",
      },
      {
        title: "经济实质一锅端",
        detail:
          "Fund、Manager、GP、持股 SPV 的主营业务不同，投资基金/基金管理/持股业务的 ES 口径分别判断。",
      },
    ],
    mindmap: {
      label: "BVI 基金与管理人",
      note: "先定分类，再分主体",
      children: [
        { label: "分类先行", children: [{ label: "Private Fund" }, { label: "Professional Fund" }, { label: "Private Investment Fund" }] },
        { label: "制度归属", children: [{ label: "开放式 → Mutual Fund 体系" }, { label: "封闭式 → PIF 制度" }] },
        { label: "PIF 模块", children: [{ label: "FSC 认可" }, { label: "投资者限制" }, { label: "授权代表" }, { label: "估值/保管/审计" }, { label: "变更通知" }] },
        { label: "Approved Manager", children: [{ label: "简化监管" }, { label: "规模限制" }, { label: "持续义务" }] },
        { label: "ES 分主体", children: [{ label: "Fund/Manager/GP" }, { label: "持股 SPV" }, { label: "三类业务" }] },
      ],
    },
    quiz: [
      {
        id: "q1",
        question: "收到一只标注为“Private Fund”的 BVI 封闭式安排，恰当做法是？",
        options: [
          "直接认定为 Private Investment Fund",
          "按名称归类即可",
          "结合运作方式、投资者属性与现行法律判断其监管分类",
          "视作无需任何注册",
        ],
        answer: 2,
        explanation:
          "BVI 各基金类别名称相近，分类判断须依据运作方式、投资者限制与适用法律，而非名称本身。",
      },
      {
        id: "q2",
        question: "关于 BVI Approved Manager 的说法正确的是？",
        options: [
          "是完全没有监管要求的安排",
          "是简化监管制度，仍有适用范围、规模限制与年度申报等持续义务",
          "自动获得注册代理牌照",
          "替代基金的全部 AML 义务",
        ],
        answer: 1,
        explanation:
          "Approved Manager 属简化监管制度，仍有范围与规模限制及董事、授权代表、报表、申报等义务，且不替代基金自身的 AML/AEOI 合规。",
      },
      {
        id: "q3",
        question: "BVI 有限合伙与 Cayman ELP 的关系，正确的是？",
        options: [
          "两者规则完全相同",
          "BVI 有限合伙可依 BVI 法律选择是否具有法律人格，不能直接套用 Cayman ELP 规则",
          "Cayman ELP 也无法律人格可选",
          "所有英属离岸合伙都适用同一规则",
        ],
        answer: 1,
        explanation:
          "BVI LP 的法律人格可选是 BVI 特有的规则安排，应基于 BVI 现行法与合伙协议判断，不能照搬开曼经验。",
      },
      {
        id: "q4",
        question: "BVI 经济实质分析的正确起点是？",
        options: [
          "对整个集团做一个统一判断",
          "按主体（Fund/Manager/GP/持股 SPV）区分主营与相关活动，并区分基金投资、基金管理与持股业务",
          "只看基金注册证书",
          "无需申报",
        ],
        answer: 1,
        explanation:
          "ES 按主体与业务类别分别判断：Fund、Manager、GP、持股 SPV 与三类业务口径不同。",
      },
    ],
    minutes: 24,
    meta: {
      sourceBasis:
        "《境外私募基金募集与运营法律实务指南》(2024-07) 知识框架 + Fund Admin 实务整理",
      contentVersion: "2.0",
      reviewedAt: "2026-09-08",
      timeSensitive: [
        "PIF 注册、豁免与变更通知的条件与表格",
        "Approved Manager 的适用基金范围、规模限制与申报要求",
        "BVI LP 法律人格选择的现行规则",
        "经济实质申报的业务口径与门槛",
      ],
      documentsToCheck: [
        "FSC 现行指引与申请表格",
        "PIF Act / Mutual Funds Act 现行版本",
        "BVI LP 法例与合伙协议",
        "经济实质申报指引",
      ],
      escalationTriggers: [
        "客户/文件中基金名称与制度归属存在歧义时",
        "Approved Manager 业务接近或可能超过规模限制时",
        "BVI LP 法律人格选择与文件不一致时",
      ],
    },
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
