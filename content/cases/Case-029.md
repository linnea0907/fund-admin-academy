---
id: Case-029
title: 赎回前临时更改收款账户至第三方关联公司
level: 高级
module: 5
tags:
  - Redemption
  - EDD
  - Third Party Payment
  - SOF/SOW
  - Sanctions
  - Cayman
skills:
  - Transaction Review
  - EDD Review
  - Compliance Escalation
  - Client Communication
estimatedTime: 12
jurisdiction:
  - Cayman
businessArea: Redemption
entityType: Individual
topics:
  - EDD
  - Third Party Payment
  - Sanctions
---

# 场景背景

一名被评级为**高风险**的投资者提交了赎回申请，金额约 US$2.4M。

赎回日**前一天**，客户经理转来投资者邮件：

> "因商业安排调整，请将本次赎回收款汇至以下新账户：
>
> 收款人：ABC Holding Ltd（我方关联公司）
> 开户行：某境外银行（与基金及投资者均不在同一司法辖区）
> 账号：****8821
>
> 原账户暂不可用，情况紧急，请务必明日汇出。"

该投资者：

- 认购已满两年，历史付款均从其本人同名账户汇入
- 未提供本次变更的授权文件
- 未说明 ABC Holding Ltd 与其本人的股权关系

客户经理补充：

> "客户是老客户，金额也不算特别大，改个收款账户而已。
> 我们做个名称制裁筛查没问题就可以放款了吧？"

# 你的判断

## Q1

应当如何处理这笔第三方付款请求？

A. 有董事邮件批准就付款

B. 核验授权、所有权、原因、资金来源与去向，并升级处理

C. 只做名称制裁筛查即可放款

D. 拆分付款以降低风险

## Q2

为什么"只做名称制裁筛查"不够？

## Q3

需要核验哪些内容？

## Q4

什么情况下必须暂停处理？

## Q5

如果无法合理解释或验证，后续动作是什么？

# 标准答案

## Q1

**B。核验授权、所有权、原因、资金来源与去向，并升级处理。**

该情形同时触发多个高风险因素，必须升级合规审查（EDD + 交易审查），不得由客户经理自行判断放款。

**不建议 A**：董事邮件不是 EDD 的替代。第三方付款的授权与账户所有权必须独立核验。

**不建议 C**：名称筛查只覆盖"主体是否在制裁名单上"，无法回答"这笔钱是不是该汇给这个账户"。筛查通过 ≠ 交易合规。

**不建议 D**：拆分付款本身即是典型的**规避控制**行为（structuring）。主动拆分会被视为红旗，而不是降险手段。

## Q2

因为制裁筛查与交易尽调解决的是**两个不同问题**：

| 检查 | 回答的问题 |
|---|---|
| 名称制裁筛查 | 收款主体是否在制裁 / 禁运名单上？ |
| 交易审查与 EDD | 这笔款项为何汇给这一第三方？授权是否有效？账户是否确属该第三方？资金来源与去向是否合理？ |

即便收款方名字干净：

- 仍可能存在**第三方付款**的固有风险（欺诈、代持、规避、洗钱分层）
- 仍需判断付款路径是否与**地域风险 / 制裁暴露**相关
- 仍需确认账户所有权与授权

制裁规则要求的筛查范围本身就**不限于投资者名单**，而是覆盖**申请人 / 客户 / UBO、关联人（董事、授权人）、交易对手（付款人、收款人、银行）以及其他相关方**。

## Q3

需核验：

**授权（Authorisation）**

- 谁有权指令变更收款账户？依据是什么（认购文件、账户授权书、董事会决议）？
- 变更指令的签署人是否与登记授权人一致？
- 是否需要原件 / 认证副本？

**所有权（Ownership）**

- ABC Holding Ltd 与该投资者的股权 / 控制关系
- 是否为同一 UBO 控制的实体
- 该实体是否已进入 KYC / CDD 范围
- 该实体是否已在制裁筛查范围内

**原因（Rationale）**

- 为什么原账户"暂不可用"？
- 为什么必须由第三方收取？
- 商业原因是否具体、可验证？"情况紧急"不是原因，是压力

**资金来源与去向（SOF / SOW）**

- 赎回款的原始资金来源
- 收款账户的开立地与银行
- 收款地与投资者的居住地 / 国籍关系
- 是否涉及其他的高制裁风险司法辖区

**交易本身**

- 金额与投资者历史交易模式是否一致
- 时间点是否异常（赎回前一天临时变更）
- 是否与其他投资者的类似模式重合

## Q4

出现以下任一情形，必须**暂停处理**：

- 无法取得**有效授权**（无授权文件，或签署人资格不符）
- 无法确认**账户所有权**与投资者的关系
- 无法合理解释**第三方收款**的商业理由
- 资金来源或去向无法解释
- 收款方或其关联人出现制裁 / 负面媒体命中
- 投资者拒绝配合补充资料
- 出现规避控制的迹象（如主动提出拆分付款）

注意：**CDD / EDD 无法完成时，不得进行交易**，并须考虑终止关系。

## Q5

1. **暂停**该笔赎回处理，不汇出款项
2. **升级**至 MLRO / DMLRO 评估
3. 内部**记录**：请求内容、核验过程、缺失资料、判断理由、审批人、时间线
4. 若达到可疑门槛，提交**内部可疑活动报告（internal SAR）**，由 MLRO 决定是否对外报告
5. 与投资者沟通时使用**中性措辞**，不得提示已启动报告程序（避免 tipping off）
6. 必要时**终止关系**，并评估是否影响其他关联账户

# 理由分析

本案是"**时间压力 + 第三方付款 + 高风险投资者**"三者叠加的典型结构。

```text
赎回前临时变更收款账户
   ↓
第三方（关联公司）收款 + 境外账户 + 跨界辖区
   ↓
触发红旗 → EDD + 交易审查
   ↓
┌─ 授权 / 所有权 / 原因 / 资金流向均可核验 → 内部审批后处理
└─ 无法解释或验证 → 暂停 → 升级 → 内部 SAR → 留存记录
```

三个容易误解的点：

**① SDD ≠ 不做尽调。** 低风险不代表可以省掉核查；本案投资者本就是高风险，更不存在简化空间。

**② EDD ≠ 多收一份身份证。** EDD 的核心是财富与资金来源、目的、加强审批与监控 —— 收一份护照复印件不构成 EDD。

**③ 制裁筛查始终适用。** 无论采用 CDD / EDD / SDD，无论风险等级，制裁筛查**一律适用**，且名单更新后须立即重筛。

**付款路径是最容易被忽视的筛查对象。** 大多数机构的筛查范围只覆盖投资者本人，而规则要求覆盖交易对手方（付款人、收款人、银行）。

# 常见错误

❌ 只做名称制裁筛查就放款

❌ 认为"老客户 + 金额不大"可以降低审查强度

❌ 用客户经理或董事的邮件批准替代 EDD

❌ 接受"情况紧急""商业原因"这类无实质内容的解释

❌ 建议拆分付款"降低风险"——这本身是规避控制

❌ 变更收款账户后未更新 KYC 档案与筛查范围

❌ 未将收款方纳入制裁筛查对象

❌ 在沟通过程中暗示已启动可疑报告流程

❌ 认为高风险投资者只是"多加一份文件"

# 客户沟通示例

> Dear Investor,
>
> Thank you for your redemption instruction and for advising us of the change in settlement account.
>
> As the proceeds are to be remitted to an account held by a third party, our standard procedures require us to complete enhanced verification before the payment can be released. To proceed, please provide:
>
> 1. A signed change-of-settlement-instruction form, together with evidence of the authority of the signatory;
> 2. Documentation evidencing the ownership and control relationship between you and ABC Holding Ltd (e.g. shareholding structure or register extract);
> 3. Documentary evidence of the destination account ownership (e.g. bank confirmation letter or account statement);
> 4. The reason why the original account is no longer available, and why settlement must be made through a third party.
>
> Please note that we are unable to release the payment until this verification is completed. We are also unable to provide further details on our review process at this stage.
>
> Kind regards,
> Fund Administration Team

**不得**使用以下表述：疑似洗钱 / 我们已上报 / 该账户可能被制裁 / 你为何要第三方收款（质问语气）。

# ICS SOP依据

Third Party Payment

1. 第三方付款一律触发 EDD 与交易审查，不得由客户经理自行放款
2. 核验四要素：授权、所有权、原因、资金来源与去向
3. 收款方及银行须纳入制裁筛查范围
4. 无法合理解释或验证时暂停处理，并考虑内部可疑活动报告
5. 不得接受拆分付款作为风险缓释手段
6. KYC 档案与筛查范围须随账户变更同步更新
7. 沟通措辞由合规审核，严禁 tipping off

# Takeaway

**名字干净 ≠ 交易干净。**

高风险投资者 + 临时变更收款账户 + 第三方收款，是资金外流风险最高的组合。

先核验授权与所有权，再谈放款。
