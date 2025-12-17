/**
 * Application Configuration and Constants
 * Centralized location for all default values and configuration settings.
 */

// Database Settings
export const DB_NAME = 'subtrack.db';

// Default User Settings
export const DEFAULT_SETTINGS = {
  MAIN_CURRENCY: 'TWD',
  THEME: 'dark',
  NOTIFICATIONS_ENABLED: 1, // 1 for true, 0 for false in SQLite
  REMINDER_TIME: '09:00',
  REMINDER_DAYS: 1,
};

// Default Exchange Rates
export const DEFAULT_EXCHANGE_RATES: Record<string, number> = {
  TWD: 1, // 新台幣
  USD: 0.031856, // 美金
  JPY: 4.975311, // 日圓
  CNY: 0.225357, // 人民幣
  HKD: 0.24801, // 港幣
  MOP: 0.255819, // 澳門幣
  GBP: 0.02407, // 英鎊
  KRW: 46.75543, // 韓元
  TRY: 1.36131, // 土耳其里拉
  PKR: 8.97426, // 巴基斯坦盧比
  IDR: 534.25365, // 印尼盾
  NGN: 46.41891, // 奈及利亞奈拉
};

// ==================== 時間常數 (Time Constants) ====================

/**
 * 時間單位換算常數
 * 統一定義以避免 magic numbers 並確保計算一致性
 */
export const TIME_CONSTANTS = {
  /** 一天的毫秒數 */
  ONE_DAY_MS: 1000 * 60 * 60 * 24,
  /** 一小時的分鐘數 */
  MINUTES_PER_HOUR: 60,
  /** 一天的小時數 */
  HOURS_PER_DAY: 24,
  /** 一週的天數 */
  DAYS_PER_WEEK: 7,
  /** 一個月的平均天數（用於估算）*/
  DAYS_PER_MONTH: 30,
  /** 一年的月份數 */
  MONTHS_PER_YEAR: 12,
  /** 一季的月份數 */
  MONTHS_PER_QUARTER: 3,
} as const;

/**
 * 提醒與通知時間設定
 */
export const REMINDER_CONSTANTS = {
  /** 預設提醒時間（小時，24小時制）*/
  DEFAULT_REMINDER_HOUR: 9,
  /** 預設提醒時間（分鐘）*/
  DEFAULT_REMINDER_MINUTE: 0,
  /** 最小提醒提前天數 */
  MIN_REMINDER_DAYS: 0,
  /** 最大提醒提前天數 */
  MAX_REMINDER_DAYS: 14,
} as const;

/**
 * 緊急程度閾值（用於 UI 顏色標示）
 */
export const URGENCY_THRESHOLDS = {
  /** 緊急（紅色）: 剩餘天數 */
  URGENT_DAYS: 3,
  /** 警告（橘色）: 剩餘天數 */
  WARNING_DAYS: 7,
  // 安全（綠色）: > WARNING_DAYS
} as const;
