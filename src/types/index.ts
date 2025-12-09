// è¨‚é–±?†é?
export type SubscriptionCategory = 'entertainment' | 'productivity' | 'lifestyle' | 'other';

// ??¬¾?±æ?
export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// è¨‚é–±è³‡æ?
export interface Subscription {
    id: number;
    name: string;              // è¨‚é–±?ç¨±
    icon: string;              // emoji ?–å??‡è·¯å¾?
    category: SubscriptionCategory;
    price: number;             // ?¹æ ¼
    currency: string;          // å¹?ˆ¥ (TWD, USD, JPY...)
    billingCycle: BillingCycle;
    startDate: string;         // è¨‚é–±?‹å??¥æ? (YYYY-MM-DD)
    reminderEnabled: boolean;  // ?¯å¦?Ÿç”¨?šçŸ¥
    reminderTime?: string;     // ?šçŸ¥?‚é? (HH:mm)
    reminderDays?: number;     // ?å?å¤©æ•¸ (0-14)
    nextBillingDate: string;   // ISO ?¥æ??¼å? (ä¿ç??ºè?ç®—æ?ä½?
    createdAt: string;
    updatedAt: string;
}

// ä½¿ç”¨?…è¨­å®?
export interface UserSettings {
    id: number;
    mainCurrency: string;      // ä¸»è?å¹?ˆ¥
    exchangeRates: string;     // JSON å­—ä¸²?¼å??„åŒ¯?‡è¨­å®?
    theme: 'light' | 'dark';
    createdAt: string;
    updatedAt: string;
}

// ?è¨­å¹?ˆ¥è¨­å?
export const DEFAULT_EXCHANGE_RATES = {
    'TWD': 1,           // ?°å°å¹?
    'USD': 0.031856,    // ç¾é?
    'JPY': 4.975311,    // ?¥å?
    'CNY': 0.225357,    // äººæ?å¹?
    'HKD': 0.24801,     // æ¸¯å¹£
    'MOP': 0.255819,    // æ¾³é?å¹?
    'GBP': 0.024070,    // ?±é?
    'KRW': 46.75543,    // ?“å?
    'TRY': 1.36131,     // ?Ÿè€³å…¶?Œæ?
    'PKR': 8.97426,     // å·´åŸº?¯å¦?§æ?
    'IDR': 534.25365,   // ?°å°¼??
    'NGN': 46.41891     // å¥ˆå??©ä?å¥ˆæ?
};

