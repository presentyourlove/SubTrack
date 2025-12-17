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
