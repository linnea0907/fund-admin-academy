/**
 * UI 界面偏好（V1.15.3）—— 与学习数据（StoredState）分离的**纯界面状态**
 *
 * 设计取舍：
 * - 不复用 `fund-admin-academy-v1`：那是学习进度/收藏的导出对象，掺入「侧栏是否收起」
 *   会污染导出 JSON、也会让「清空学习数据」把界面偏好一起清掉；
 * - 独立 Key + 独立读写，损坏/缺失时静默回退默认值（默认全部展开）；
 * - 只在客户端调用（读写都做 `typeof window` 判空），供 useUiPref 使用。
 */

/** 界面偏好独立存储 Key（与学习数据 Key 分离，勿混用） */
export const UI_PREFS_KEY = "fund-admin-academy-ui-v1";

export interface UiPrefs {
  /** 左侧总目录是否收起为窄图标栏 */
  navCollapsed: boolean;
  /** 课程页「本讲目录」是否折叠 */
  tocCollapsed: boolean;
}

/** 默认值：全部展开（与 SSG 输出一致，保证首屏无闪动） */
export const DEFAULT_UI_PREFS: UiPrefs = {
  navCollapsed: false,
  tocCollapsed: false,
};

/** 读取全部界面偏好（脏数据/异常一律回退默认值） */
export function readUiPrefs(): UiPrefs {
  if (typeof window === "undefined") return { ...DEFAULT_UI_PREFS };
  try {
    const raw = window.localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return { ...DEFAULT_UI_PREFS };
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_UI_PREFS };
    return {
      navCollapsed: parsed.navCollapsed === true,
      tocCollapsed: parsed.tocCollapsed === true,
    };
  } catch {
    return { ...DEFAULT_UI_PREFS };
  }
}

/** 写入单项界面偏好（保留其它项；存储不可用则静默降级） */
export function writeUiPref<K extends keyof UiPrefs>(
  key: K,
  value: UiPrefs[K]
): void {
  if (typeof window === "undefined") return;
  try {
    const next = { ...readUiPrefs(), [key]: value };
    window.localStorage.setItem(UI_PREFS_KEY, JSON.stringify(next));
  } catch (err) {
    // 隐私模式 / 配额满：不影响使用，仅本次不记忆
    console.error("[fund-admin-academy] ui pref save failed:", err);
  }
}

export function clearUiPrefs(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(UI_PREFS_KEY);
}
