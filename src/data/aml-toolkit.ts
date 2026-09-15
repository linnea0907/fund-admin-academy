/**
 * Fund Admin Academy — AML 实务工具包 · 内容（V1.15.0）
 *
 * 来源：ICS 2026 Cayman 投资基金 AML/CFT/CPF 与制裁合规培训（董事与基金运营人员）。
 *
 * 收录原则：
 *   ✅ 收录 —— 可复用的清单、处置顺序、角色/流程对比
 *   ❌ 不收录 —— 法规时间线、生效日期、罚款金额、个别执法案例数字（时效性强，维护成本高）
 */
import type { AmlToolkitItem } from "@/types/aml-toolkit";

export const AML_TOOLKIT: AmlToolkitItem[] = [
  /* ============================================================
   * 1. Checklist · 董事会 AML 监督清单
   * ============================================================ */
  {
    id: "board-aml-oversight",
    kind: "checklist",
    title: "Board AML Oversight Checklist",
    zh: "董事会 AML 监督清单",
    summary: "董事会每期监督会议逐条过一遍的七个问题，用来把「监督」落到可检查的证据上。",
    purpose:
      "董事会保留 AML 最终责任，委任 AMLCO / MLRO 不等于责任转移。清单用于把监督动作转化为可留痕的议题、决定与理由，避免停留在「已审阅」的口头表述。",
    source: "ICS 2026 Cayman AML Training",
    tags: ["董事会", "治理", "监督证据", "AML", "Cayman"],
    relatedTerms: ["governing-body", "amlco", "residual-risk", "fund-level-evidence"],
    relatedCases: ["Case-028"],
    sections: [
      {
        title: "Seven questions for every oversight cycle",
        zh: "每期监督会议必问的七项",
        items: [
          "本期风险画像有何变化？（风险画像变化？）",
          "是否存在逾期的 CDD / EDD 或定期复审？",
          "是否发生制裁命中（含潜在命中）？如何排除？",
          "异常交易或内部可疑活动报告是否出现新的趋势？",
          "AMLCO 的资源与独立性是否充足？（是否有足够的合格人员、系统与预算？）",
          "AML Audit 是否覆盖到本基金？（本基金是否取得充分适当的基金层面证据？）",
          "是否存在逾期整改项目？（责任人、期限、状态、验证是否明确？）",
        ],
      },
      {
        title: "Evidence to put on the record",
        zh: "应进入会议记录的证据",
        items: [
          "合规官 / 报告官指标、异常事项与逾期清单",
          "议题、决定与理由（不是只有结论）",
          "基金及业务风险、残余风险与触发更新的判断",
          "筛查、监控、抽样与质量检查结果",
          "资源配置判断（能力、独立性、系统与预算）",
          "整改台账（责任人、期限、状态、验证）",
        ],
      },
      {
        title: "Records the AMLCO must maintain",
        zh: "AMLCO 须维护的记录类别",
        items: [
          "被拒绝的业务（declined business）",
          "政治风险人物（含家属及密切关系人）",
          "主管机关请求（competent authority requests）",
          "可疑活动报告（SAR / STR）",
          "交易预警（transaction alerts）",
          "制裁命中（sanctions hits）",
        ],
      },
    ],
    pitfalls: [
      "只批准政策，不追踪整改是否闭环",
      "会议记录只有结论，没有决定理由",
      "把「已委任服务商」当作已履行监督",
    ],
  },

  /* ============================================================
   * 2. Checklist · Outsourcing Oversight Checklist
   * ============================================================ */
  {
    id: "outsourcing-oversight",
    kind: "checklist",
    title: "Outsourcing Oversight Checklist",
    zh: "外包监督清单",
    summary: "四个部分：风险评估、能力评估、合同权利、持续监督。执行可委托，责任与可见性不能委托。",
    purpose:
      "基金普遍把 CDD、筛查与监控外包给行政管理人等主体。本清单用于把「外包监督」从一句声明，变成可测试的控制：既看委托前的评估，也看委托后的持续可见性。",
    source: "ICS 2026 Cayman AML Training",
    tags: ["外包", "服务商", "Administrator", "监督", "CIMA access"],
    relatedTerms: ["governing-body", "effective-compliance-programme", "fund-level-evidence", "amlco"],
    relatedCases: ["Case-028"],
    sections: [
      {
        title: "1. Risk Assessment",
        zh: "一、风险评估",
        items: [
          "该职能被外包后，剩余风险如何评估？",
          "服务地点与国家风险是否纳入判断？",
          "是否涉及高风险或受制裁地区的执行团队？",
          "是否属于重大合规外包（按规则要求须通知 CIMA）？",
        ],
      },
      {
        title: "2. Capability Assessment",
        zh: "二、能力评估",
        items: [
          "资质：是否持有必要牌照与专业人员？",
          "资源：人员配置与工作量是否匹配？",
          "系统：筛查、监控与档案系统是否满足本基金需要？",
          "过往表现：历史检查发现、整改记录与事故情况？",
        ],
      },
      {
        title: "3. Contract Rights",
        zh: "三、合同权利",
        items: [
          "信息权：能否按本基金维度取得数据与档案？",
          "审计权：能否审计或要求提供审计证据？",
          "升级权：重大问题是否有明确的升级路径与时限？",
          "终止权：违约或监管要求时能否终止并顺利移交？",
          "CIMA access：安排是否妨碍 CIMA 获取信息？（不得妨碍）",
        ],
      },
      {
        title: "4. Ongoing Oversight",
        zh: "四、持续监督",
        items: [
          "KPI：是否设定了可测量的服务水平指标？",
          "例外：例外事项是否定期上报并解释？",
          "抽样：是否对本基金档案做质量抽样复核？",
          "事件：是否建立事件报告与根因分析？",
          "整改：整改项是否有责任人、期限与验证？",
        ],
      },
    ],
    pitfalls: [
      "只确认服务商「有系统」，不测试系统在本基金是否运行",
      "合同里没有本基金维度的信息与审计权",
      "重大合规外包未按规则通知 CIMA",
      "安排实质上妨碍了 CIMA 获取信息",
    ],
  },

  /* ============================================================
   * 3. SOP · Sanctions Hit SOP
   * ============================================================ */
  {
    id: "sanctions-hit-sop",
    kind: "sop",
    title: "Sanctions Hit SOP",
    zh: "制裁命中处置标准流程",
    summary: "潜在命中 → 核验 → 升级 → 冻结 / 限制 → 报告 → 记录。时间压力不能改变顺序。",
    purpose:
      "名单更新后可能出现潜在命中（Potential Match）。本 SOP 规定从识别到归档的动作顺序、责任归属与禁止事项，避免「先放款、后核验」这类不可逆错误。",
    source: "ICS 2026 Cayman AML Training",
    tags: ["制裁", "Sanctions", "Screening", "冻结", "零容忍", "Potential Match"],
    relatedTerms: ["financial-sanctions", "tfs", "sanctions", "tipping-off", "mlro", "dmlro"],
    relatedCases: ["Case-027"],
    steps: [
      {
        title: "Potential Match",
        zh: "潜在命中",
        detail:
          "名单更新后对全部客户及关联人员立即重筛，系统给出命中或命中评分超阈值。低风险、SDD 或封闭式基金均不构成豁免。",
        note: "筛查范围不限于投资者本人：还须覆盖 UBO、董事与授权人、付款人 / 收款人 / 银行等服务商及其他相关方。",
      },
      {
        title: "Verify",
        zh: "核验",
        detail:
          "由合规（MLRO / DMLRO）静默核验全部身份要素：姓名全称与拼写变体、出生日期、国籍与居住地、证件号码、注册地或营业地址等。",
        note: "核验期间暂缓一切相关动作（含赎回、汇款、转账），不得先放行后核验。",
        warning:
          "⚠ Do not contact the investor if doing so may constitute tipping off. Potential matches should be verified using existing records and independent reliable information. —— 不得向投资者核实身份，以免构成通风报信（tipping off）；潜在命中只能通过既有记录与独立可靠信息核验。",
      },
      {
        title: "Escalate",
        zh: "内部升级",
        detail:
          "立即内部升级至 MLRO / DMLRO，由合规作出判断并留存结论与理由。一线人员不得自行排除命中。",
        note: "严禁联系被命中对象询问是否重名 —— 属于 tipping off 风险。",
      },
      {
        title: "Freeze / Restrict",
        zh: "冻结 / 限制",
        detail:
          "确认真实命中后，立即、无事先通知地冻结资产，不得再交易或提供资产 / 服务。冻结不是没收，不得处置或动用被冻结的资金与经济资源。",
      },
      {
        title: "Report",
        zh: "报告",
        detail:
          "向 FRA 提交 CRF（资产冻结报告），披露被冻结资产及未遂交易；若同时达到可疑门槛，另行提交可疑活动报告（SAR），两者不可相互替代。",
        note: "解冻依 FRA 指引办理；许可须向总督申请，并按指定表格抄送 FRA。",
      },
      {
        title: "Record",
        zh: "记录",
        detail:
          "记录完整时间线、命中项、核验要素、判断依据、审批人、对外沟通与后续动作，确保整个过程可复现。",
      },
    ],
    outcomes: [
      {
        title: "False Positive",
        zh: "误报",
        detail:
          "记录命中项、核验要素、排除理由、核验人与审批人及时间；保存系统截图与核定结论；将该名单条目标记已排除，避免下轮重复命中。无需向投资者披露筛查过程。「排除」不是「删除」——核验痕迹是应对检查的核心证据。",
      },
      {
        title: "True Match",
        zh: "真实命中",
        detail:
          "立即（无事先通知）冻结 → 提交 CRF → 达到门槛时另行提交 SAR → 完整记录。不得处置被冻结资产；解冻须依 FRA 指引并取得许可。",
      },
    ],
    pitfalls: [
      "因出生年份不同就自动排除命中",
      "先放行赎回或汇款，计划「之后再做核验」",
      "直接联系投资者询问是否重名（tipping off）",
      "认为老客户 / 低风险投资者可适用简化流程",
      "把冻结当作没收，动手处置被冻结资产",
      "误报只在系统点「排除」，不保存核验理由与审批",
      "名单更新后只筛新增客户，不对存量客户重筛",
    ],
  },

  /* ============================================================
   * 4. Comparison · AMLCO / MLRO / DMLRO
   * ============================================================ */
  {
    id: "aml-roles-comparison",
    kind: "comparison",
    title: "AMLCO / MLRO / DMLRO",
    zh: "AMLCO · MLRO · DMLRO 职责对比",
    summary: "三个角色分别管什么、能不能兼任、独立性要求，以及最常见的混淆点。",
    purpose:
      "三个角色名称相似、在实际机构里常由少数人分担，容易混同。本对照表用于厘清职责边界与报告线，避免出现「自己运行控制又自己审计」。",
    source: "ICS 2026 Cayman AML Training",
    tags: ["AMLCO", "MLRO", "DMLRO", "独立性", "兼任", "REEFS"],
    relatedTerms: ["amlco", "mlro", "dmlro", "governing-body", "str", "tipping-off"],
    relatedCases: ["Case-027", "Case-028"],
    comparison: {
      columns: ["AMLCO", "MLRO", "DMLRO"],
      rows: [
        {
          label: "核心定位 / Focus",
          cells: [
            "监督整体合规框架（Framework Oversight）",
            "接收与评估内部报告（Internal SAR Review）",
            "MLRO 不可用时代为履职（MLRO Backup）",
          ],
        },
        {
          label: "主要产出 / Key output",
          cells: [
            "框架有效性评估 + 年度报告（Annual Reporting）",
            "是否对外报告的判断与理由（External Reporting Decision）",
            "在 MLRO 缺席期间维持上报通道不中断",
          ],
        },
        {
          label: "报告线 / Reporting line",
          cells: ["直达董事会，至少每年报告一次", "向治理机构报告可疑事项与对外报告情况", "与 MLRO 同一报告线"],
        },
        {
          label: "独立性要求 / Independence",
          cells: [
            "独立、具备相应资历、可直达董事会",
            "独立判断，不因业务压力改变结论",
            "能力与权限须足以保证连续性",
          ],
        },
        {
          label: "常见误区 / Common mistake",
          cells: [
            "把 AMLCO 当一线执行岗，忽略独立性与报告线",
            "由一线人员自行判断「不报」，绕过 MLRO 流程",
            "只挂名不作授权，MLRO 缺席时实际无人可决",
          ],
        },
      ],
      reminders: [
        "角色可以兼任 —— 但冲突、能力、时间与独立性必须能够解释清楚。",
        "AMLCO / MLRO / DMLRO 的委任及任何变更，均须通过 REEFS 系统向 CIMA 报备。",
        "不得由运行相关控制的 AMLCO / MLRO / DMLRO 自我审计（这是审计独立性要求的落点）。",
        "委任合规官 ≠ 转移治理机构的责任。",
      ],
    },
    pitfalls: [
      "把三个角色当成同一件事，忽略报告线与独立性差异",
      "AMLCO 与 MLRO 由同一人兼任且无冲突说明",
      "AMLCO 亲自对自己的控制做独立审计",
      "委任与变更未通过 REEFS 报备 CIMA",
    ],
  },

  /* ============================================================
   * 5. Comparison · CDD / EDD / SDD
   * ============================================================ */
  {
    id: "cdd-edd-sdd-comparison",
    kind: "comparison",
    title: "CDD / EDD / SDD",
    zh: "CDD · EDD · SDD 对比",
    summary: "三种尽调强度的适用场景、必要要求与常见误区；制裁筛查对三者一律适用。",
    purpose:
      "SDD 与 EDD 最容易被误读：前者被当成「可以不做尽调」，后者被当成「多收一份证件」。本对照表用于统一判断口径。",
    source: "ICS 2026 Cayman AML Training",
    tags: ["CDD", "EDD", "SDD", "尽职调查", "制裁筛查", "SOF/SOW"],
    relatedTerms: ["cdd", "edd", "customer-risk-rating", "risk-based-approach", "sanctions", "sof", "sow"],
    relatedCases: ["Case-029"],
    comparison: {
      columns: ["CDD 客户尽职调查", "EDD 增强尽职调查", "SDD 简化尽职调查"],
      rows: [
        {
          label: "适用场景 / When",
          cells: [
            "所有客户的默认基线；包括单笔或多笔关联的一次性交易金额超过 CI$10,000",
            "高风险客户与高风险因素（PEP、高风险属地、复杂架构、非面对面、第三方付款等）",
            "仅在经评估确认的低风险情形下，且须记录适用理由",
          ],
        },
        {
          label: "必要要求 / Requirements",
          cells: [
            "客户、UBO、代表人及其授权文件（必要时取得认证副本）",
            "财富与资金来源（SOW / SOF）、交易目的、加强审批与加强监控",
            "仍须完成基线识别与核验，并持续重估是否仍属低风险",
          ],
        },
        {
          label: "监控强度 / Monitoring",
          cells: [
            "CDD 未完成前须加强监控",
            "在 EDD 完成前不得建立业务关系或执行交易",
            "降低频率不等于免除监控；触发事件时立即回到 CDD / EDD",
          ],
        },
        {
          label: "常见误区 / Common mistake",
          cells: [
            "资料真实性存疑时未重新识别",
            "把 EDD 理解为「多收一份身份证明」",
            "把 SDD 理解为「可以不做尽调」",
          ],
        },
        {
          label: "制裁筛查 / Sanctions screening",
          cells: ["✅ 始终适用", "✅ 始终适用", "✅ 始终适用（不能豁免）"],
        },
      ],
      reminders: [
        "SDD ≠ 不做尽调。低风险只是降低**强度**，不是取消**义务**。",
        "EDD ≠ 多收一份身份证。EDD 的核心是财富与资金来源、交易目的、加强审批与加强监控。",
        "制裁筛查始终适用 —— 无论采用 CDD / EDD / SDD，无论风险等级，名单更新后一律立即重筛。",
        "存在可疑情形或高风险因素时，不得适用 SDD。",
        "无法完成 CDD / EDD 时：不得进行交易、须终止关系，并考虑提交可疑活动报告。",
      ],
    },
    pitfalls: [
      "认为低风险客户可以省掉 CDD 基线核对",
      "用「加一份护照复印件」充当 EDD",
      "在存在可疑情形时仍坚持适用 SDD",
      "认为 SDD / 低风险可以豁免制裁筛查",
    ],
  },
];

/** 按 kind 分组（保持 TOOLKIT_KINDS 的顺序） */
export function toolkitByKind(): { kind: string; items: AmlToolkitItem[] }[] {
  const order = ["checklist", "sop", "comparison"];
  return order
    .map((kind) => ({ kind, items: AML_TOOLKIT.filter((t) => t.kind === kind) }))
    .filter((g) => g.items.length > 0);
}

export function getToolkitItem(id: string): AmlToolkitItem | null {
  return AML_TOOLKIT.find((t) => t.id === id) ?? null;
}
