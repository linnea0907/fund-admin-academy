/**
 * 全站站点配置（版本单一来源）
 *
 * 版本号 / 站点名 / 内测声明统一在此维护；页面升级版本时只改本文件。
 */
export const siteConfig = {
  /** 产品名 */
  name: "Fund Admin Academy",
  /** 中文副题（品牌区） */
  nameZh: "境外私募基金学习中心",
  /** 当前版本（首页 Badge / Footer / 设置页统一读取） */
  version: "v1.9 Beta",
  /** 版本阶段标签 */
  releaseStage: "Internal Beta",
  /** 内测状态卡文案 */
  statusCard: {
    icon: "🚧",
    title: "Internal Testing",
    line: "Learning Platform for Fund Administration Professionals",
  },
  /** 全站页脚免责声明 */
  footerDisclaimer: "For Learning & Testing Purposes Only",
  /** 侧栏/localStorage 提示 */
  storageKey: "fund-admin-academy-v1",
} as const;

export type SiteConfig = typeof siteConfig;
