// 訂閱類別
export type SubscriptionCategory = 'entertainment' | 'productivity' | 'lifestyle' | 'other';

// 計費週期
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// 訂閱資料
export interface Subscription {
    id: number;
    name: string;              // 訂閱名稱
    icon: string;              // emoji 或圖示代碼
    category: SubscriptionCategory;
    price: number;             // 價格
    currency: string;          // 幣種 (TWD, USD, JPY...)
    billingCycle: BillingCycle;
    startDate: string;         // 訂閱開始日 (YYYY-MM-DD)
    reminderEnabled: boolean;  // 是否啟用通知
    reminderTime?: string;     // 通知時間 (HH:mm)
    reminderDays?: number;     // 提前天數 (0-14)
    nextBillingDate: string;   // ISO 日期字串 (計算得出或手動)
    calendarEventId?: string;  // 日曆事件 ID (可選)
    createdAt: string;
    updatedAt: string;
}

// 使用者設定
export interface UserSettings {
    id: number;
    mainCurrency: string;      // 主要幣種
    exchangeRates: string;     // JSON 字串儲存的匯率設定
    theme: 'light' | 'dark';
    notificationsEnabled?: boolean; // 新增：是否啟用通知
    createdAt: string;
    updatedAt: string;
}

// 預設匯率設定
export const DEFAULT_EXCHANGE_RATES = {
    'TWD': 1,           // 新台幣
    'USD': 0.031856,    // 美金
    'JPY': 4.975311,    // 日圓
    'CNY': 0.225357,    // 人民幣
    'HKD': 0.24801,     // 港幣
    'MOP': 0.255819,    // 澳門幣
    'GBP': 0.024070,    // 英鎊
    'KRW': 46.75543,    // 韓元
    'TRY': 1.36131,     // 土耳其里拉
    'PKR': 8.97426,     // 巴基斯坦盧比
    'IDR': 534.25365,   // 印尼盾
    'NGN': 46.41891     // 奈及利亞奈拉
};
