// 訂閱類別
export type SubscriptionCategory = 'entertainment' | 'productivity' | 'lifestyle' | 'other';

// 計費週期
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// 標籤
export interface Tag {
  id: number;
  name: string; // 標籤名稱 (不含 #)
  color: string; // HEX 顏色碼
  createdAt: string;
  updatedAt: string;
}

// 預設標籤顏色
export const TAG_COLORS = [
  '#007AFF', // 藍色
  '#34C759', // 綠色
  '#FF9500', // 橘色
  '#AF52DE', // 紫色
  '#FF3B30', // 紅色
  '#8E8E93', // 灰色
] as const;

// 訂閱資料
export interface Subscription {
  id: number;
  name: string; // 訂閱名稱
  icon: string; // emoji 或圖示代碼
  category: SubscriptionCategory;
  price: number; // 價格
  currency: string; // 幣種 (TWD, USD, JPY...)
  billingCycle: BillingCycle;
  startDate: string; // 訂閱開始日 (YYYY-MM-DD)
  reminderEnabled: boolean; // 是否啟用通知
  reminderTime?: string; // 通知時間 (HH:mm)
  reminderDays?: number; // 提前天數 (0-14)
  nextBillingDate: string; // ISO 日期字串 (計算得出或手動)
  calendarEventId?: string; // 日曆事件 ID (可選)
  tags?: Tag[]; // 標籤 (透過 JOIN 查詢填充)
  createdAt: string;
  updatedAt: string;
}

// 使用者設定
export interface UserSettings {
  id: number;
  mainCurrency: string; // 主要幣種
  exchangeRates: string; // JSON 字串儲存的匯率設定
  theme: 'light' | 'dark';
  notificationsEnabled?: boolean; // 新增：是否啟用通知
  createdAt: string;
  updatedAt: string;
}
