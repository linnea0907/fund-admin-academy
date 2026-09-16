# Fund Admin Academy · Backlog（待排期需求池）

> 用法：Copilot / Lu 提出的**非本次交付范围**的增量需求登记在此，避免口头需求丢失。
> 每条注明：来源、目标、验收口径、涉及文件。排期时再决定归入哪个版本。

---

## V1.15.4 已交付（来源：V1.15.3 冒烟期发现的**既有**缺陷）

> 登记时间：2026-09-16　｜　状态：**已在 V1.15.4 修复并上线**
> 定性：**不是 V1.15.3 引入的回归** —— 线上 v1.15.2 完全同样复现，属全局状态层的既有设计问题。

### ~~P2~~ → P1 首页 hydration mismatch（React error #418）【已修复】

**复现步骤**：任意打开一讲课程（如 `/courses/aml-kyc`）→ 回到首页 `/`。
控制台报 `Minified React error #418`（Hydration failed because the server rendered HTML didn't match the client）。

**根因**（已确认）：`src/hooks/use-academy.tsx` 用 `useState(() => loadState())` —— 客户端**首帧**就按 localStorage 求值。
首页 `src/app/page.tsx` 据此渲染「最近学习 / 学习进度 / 收藏统计」，
而 SSG 出的 HTML 里这些是空态 → 客户端首帧带数据 → 两边 DOM 不一致 → React 放弃 hydration 并整树重渲染。

**实际修法（V1.15.4 落地）**：
1. Provider 首帧恒为 `defaultState()`（不再在 `useState` 初始化时读 localStorage）；
2. 布局副作用（浏览器绘制前）恢复一次，`isLoaded` 写保护 —— 恢复完成前 `saveState` 直接 return；
3. **额外堵住一个计划外竞态**：`LessonViewer` / `CaseViewer` 在挂载副作用里调
   `recordView` / `markCaseStarted`，而副作用是「子先父后」执行 —— 若恢复时直接
   `setState(loadState())`，会把刚记录的浏览/学习状态整体覆盖掉（表现为「最近学习」不再更新）。
   故写入统一走 `update()`：恢复完成前入队，恢复时以 localStorage 为基线顺序重放。
4. 文案口径：「hydrate 前的过渡态」最终选择**接受一帧默认态但用布局副作用消除可见闪动**
   （不新增骨架屏，符合「不加新功能」的 Bug Fix 定位）。

**涉及文件**：`src/hooks/use-academy.tsx`（唯一源码改动点，全部消费方自动受益）。

---

## V1.16.0 Backlog（来源：V1.15.1 Copilot 验收意见附带的新增需求）

> 登记时间：2026-09-15　｜　状态：**未开工**（V1.15.1 只交付内容修正，不含本组）
> 定性：属于「案例内容增强」，不涉及新路由 / 新功能页。

### P1 案例内容补充：SPC / FATCA / CRS（来源：V1.15.3 案例库搜索验证）

**触发**：V1.15.3 案例库搜索栏验收时，用需求方给出的示例词实测，**SPC = 0 例、FATCA = 0 例**。
经全文 grep 复核：29 篇案例的标题 / 标签 / 受控主题词 / 正文里**确实不存在**这两个词，
属**案例内容缺口，不是搜索功能故障**（UBO / AML Letter / VCC / PEP 均有正常命中）。

**目标**：补齐以下 5 个高价值主题的案例（暂定编号 Case-030 起）：

| # | 主题 | 说明 |
|---|---|---|
| 1 | SPC 基础案例 | Special Purpose Company 在基金架构中的设立与角色 |
| 2 | SPC 穿透案例 | SPC 与隔离单元（Segregated Portfolio）的穿透识别 / UBO 判定 |
| 3 | FATCA Self-Certification | 自证表收集时点、有效性、缺失处理 |
| 4 | CRS Classification | 实体分类（FI / NFE / Active NFE）判定 |
| 5 | US Investor FATCA | 美国投资者识别与预扣（Withholding）场景 |

**验收口径**：新增案例在 `/cases` 搜索 SPC / FATCA 能命中；标签归属到现有受控主题词
（若需新增主题词，`src/lib/case-categories.ts` 的 `CASE_TOPICS` 与
`scripts/build-case-index.mjs` 的 `TOPICS` **两处同步改**）。

**边界**：仍遵守「不收录时效性内容」原则 —— 不写生效日期 / 罚款金额 / 个别执法案例数字。

### P1 新增 Red Flags Framework（风险识别模块）

案例模板**统一新增** `🚩 Red Flags` 模块（覆盖全部案例）。

示例（Case-029）：

```text
🚩 Last-minute account change
🚩 Third-party payment
🚩 Different jurisdiction
🚩 Unclear ownership
🚩 Weak commercial rationale
🚩 Pressure to bypass normal process
```

**目标**：把案例从「案例问答」升级为「风险识别训练」——让读者先自己识别红旗，再看标准答案。

**待定口径（排期时确认）**：
- 是否 29 个案例全量补齐，还是先覆盖 AML / 制裁相关案例？
- Red Flags 与现有 `topics` 受控主题词是否需要映射关系？
- 是否需要受控词表（避免自由文本膨胀）？

**涉及文件**：`content/cases/Case-*.md`（新增 `# 🚩 Red Flags` 小节）、
`scripts/build-case-index.mjs`（若需纳入 `SECTIONS`）、`src/components/cases/MarkdownBody.tsx`（如需专属样式）。

### P2 新增 Regulatory Focus（监管关注点模块）

案例模板**统一新增** `Regulatory Focus / 监管关注点` 模块。

示例（Case-028）：

```text
• Fund-level Evidence
• Outsourcing Oversight
• Independent AML Audit
• Board Accountability
```

**目标**：帮助用户理解**为什么监管会关注这个案例**，而不是只记答案。

**待定口径（排期时确认）**：
- 是否复用术语库 id 做链接（如 `fund-level-evidence` / `outsourcing-oversight`）？
- 与 `/toolkit` 相关条目的交叉引用方式。

**涉及文件**：同上方 P1（Red Flags）。

### P2 案例库中文全文检索

当前案例库检索基于英文/拉丁词元（`searchText` 由 `build-case-index.mjs` 预生成，V1.15.3）。
需求：支持中文关键词直检 —— 实益拥有人、资金来源、最终受益人、授权签字人、税务居民、受托人。

**说明**：英文术语检索已满足日常需求，中文全文检索涉及分词与索引体积，
需单独评估（是否引入分词库 / 是否只做「中文别名 → 英文词元」映射表）。
注意索引体积：29 案拉丁词元已约 12KB，加中文词元需关注 SSG 页面体积。

**涉及文件**：`scripts/build-case-index.mjs`、`src/lib/cases.ts`、`src/components/cases/CaseLibrary.tsx`。
