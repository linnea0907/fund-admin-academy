# 术语自动发现（Term Auto-Discovery）— 链路规范

> 版本：**V1.20.5**　｜　入口：**术语库 `/glossary` → 「术语审核」页签**
> 定位：把「语料里已经出现、但术语库还没收录」的专业术语自动找出来，形成待审核队列，
> 由人工逐条裁决后落库。**不新增独立导航模块。**

---

## 1. 为什么是「恢复 + 换落点」而不是从零做

同一逻辑在 V1.14.0 做过一版（`src/lib/missing-terms.ts`，「待补充术语池扫描」），
随「知识工坊」于 V1.15.2 随导航重构下线。**但数据层与导入链路当时被刻意保留**：

```
content/glossary/imported.json  →  npm run gen:glossary  →  src/data/glossary/imported.ts
                                                            →  GLOSSARY_TERMS（列表 / 详情 / 正文标注 / 检索）
```

V1.20.5 的做法是**恢复被删的扫描逻辑 + 把落点从独立模块搬到术语库页签 + 补「已发布 / 待审核」双列表**。

---

## 2. 数据链路

```
                ┌──────────────────────────────────────────────────┐
                │ 语料（唯一真相源）                                │
                │  · 课程  src/data/lessons.ts / electives-*.ts     │
                │         / lessons-cams.ts                         │
                │  · 案例  content/cases/*.md                       │
                └───────────────────────┬──────────────────────────┘
                                        │ 构建期（prebuild）
                                        ▼
   scripts/scan-term-candidates.mjs ── 经 scripts/lib/ts-loader.mjs 直载项目 TS 源码
                                        │  · 用 annotateSegments() 挖空已识别术语
                                        │  · 只在未识别区间抽取候选（三档置信度）
                                        │  · 与既有产物合并，保留 firstSeenAt
                                        ▼
                    content/glossary/candidates.json   ← 提交进仓库的产物
                                        │ 服务端读取（node:fs）
                                        ▼
   src/app/glossary/page.tsx ──▶ GlossaryTabs ──▶ TermReviewPanel（"use client"）
                                                      │ 忽略 / 采纳
                                                      ▼
                                        localStorage（只存归一 key）
                                                      │ 采纳后导出
                                                      ▼
                                        「术语补全包」→ Copilot 补全 14 字段
                                                      ▼
                                        content/glossary/imported.json → 全站生效
```

---

## 3. 三档置信度（扫描器按此顺序排序）

| 档 | 判定 | 实测表现 |
|---|---|---|
| `declared` 正文声明 | 正文自带「中文名（缩写）」或「缩写（英文全称）」 | 精度最高 |
| `acronym` 缩写 | 中文语境中的 2~6 位全大写缩写 | 精度高 |
| `phrase` 词组 | 中文语境中的首字母大写词组（1~3 词） | 含人名 / 通用词误报，需人工判断 |

### 关键过滤规则

1. **已识别片段挖空** —— 用与页面标注**完全相同**的术语引擎 `annotateSegments()`，
   所以术语库里已有的词不会重新冒出来（口径不可能漂移）。
2. **「中文语境」规则（最有效的一条）** —— 候选词 ±30 字符窗口内必须出现 CJK 字符。
   中文夹英文才叫术语；整段英文（客户邮件、英文 SOP 引用、双语段落）里的 `Kindly` /
   `Verify` / `Please` 由此被整类滤掉。
3. **占位符** —— 连续字母串（`ABC` / `DEF` / `ABCD`）、重复字母（`AA`）、`XYZ`。
4. **地名 / 货币缩写** —— `HK` / `US` / `EU` / `USD` / `HKD` …
5. **公司后缀** —— 以 `…Ltd` / `…Limited` / `…Pte` 结尾的判为案例虚构主体。
6. **停用词与项目噪声** —— 模板词、通用动作词、邮件用语，以及本项目专有噪声
   （`PROJECT_NOISE`，如机构名缩写）。新增噪声词直接改这两处数组。

> ⚠️ **边界：只发现英文与缩写，中文术语不做自动发现。**
> 中文专业词没有词典兜底，靠形态规则抽取误报率不可控，宁可漏也不脏。

---

## 4. 文件职责

| 文件 | 角色 | 备注 |
|---|---|---|
| `scripts/scan-term-candidates.mjs` | 扫描器（prebuild） | 非阻断：失败只告警，保留上一次产物 |
| `scripts/lib/ts-loader.mjs` | 让 Node 直载项目 TS 源码 | 依赖 Node ≥ 22.18 的类型剥离；**不用正则解析 TS**，避免口径漂移 |
| `content/glossary/candidates.json` | **构建产物（提交进仓库）** | 同 `content/cases/index.json` 模式 |
| `src/types/term-candidates.ts` | 类型 + 置信度枚举 | 零依赖，客户端可安全 import |
| `src/lib/term-candidates.ts` | 候选池读取 | ⚠️ **服务端专用（node:fs），禁止客户端 import** |
| `src/lib/term-review-store.ts` | 本机审核状态 + 补全包拼装 | 独立 key `fund-admin-academy-term-review-v1` |
| `src/components/glossary/TermReviewPanel.tsx` | 审核面板 | 仅在点开页签后挂载 |

---

## 5. 维护动作

| 动作 | 语义 |
|---|---|
| **导入术语库** | 采纳该候选 → 进入「已采纳」清单。**不会立刻进术语库**（静态站浏览器写不了源码） |
| **生成术语补全包** | 把已采纳术语连同「出现位置 + 上下文摘录 + 14 字段骨架」拼成提示词，交给 Copilot 补全 → 落到 `content/glossary/imported.json` |
| **忽略** | 本机记录归一 key，移出待审核列表；可在「已忽略」视图随时恢复 |
| **看上下文** | 展开该术语在语料中的原文摘录（可点进来源课程 / 案例） |

---

## 6. 硬约束

- **幂等写盘**：候选内容签名未变时复用 `firstSeenAt` / `lastSeenAt` / `generatedAt`，
  `candidates.json` 逐字节稳定 —— 跑多少次构建都不会污染 git 工作区（有验证）。
- **非阻断**：TS loader 注册失败（Node < 22.18）/ 源码加载失败 / 扫描抛错 → 只告警 + 保留旧产物，**绝不拦构建**。
- **首帧安全**：审核面板只在用户点开页签后挂载，故可惰性读 localStorage。
  ⚠️ 若日后把它改成**默认页签**，必须改成「首帧恒默认态 + 挂载后回读」，否则会引发 React #418。
- **本机状态只存 key**，不存候选正文 —— 候选池重扫后内容自动更新，不会留旧副本造成前后不一致。
- **不收录时效性内容**（生效日期 / 罚款 / 执法数字）；标准答案类内容必须依据 ICS SOP。

---

## 7. 已知边界（后续可议）

1. **`check-glossary.mjs` 不校验 `imported.ts`**（脚本里显式 `f !== "imported.ts"`）。
   因此导入条目**没有走向内建的 14 字段闸门**。缓解措施：`build-glossary-import.mjs`
   自查必填内容，缺项**跳过该条并告警**（V1.20.5 起），保证一份不完整的 `imported.json`
   不会把构建弄红；`level` 缺失也有兜底（默认 `advanced`）+ 告警。
2. **「已发布术语」视图与「术语列表」页签、健康度 Dashboard 存在信息重叠**，
   属刻意的审核视角（多了关联课程 / 案例计数）。若判定价值不足，按 Subtraction First 应删。
3. 词组档精度约六成，尚无更好的收紧手段（收紧会误杀只出现一次的真术语）。
