import { Subscription, UserSettings } from '../types';
import { DEFAULT_EXCHANGE_RATES } from '../constants/AppConfig';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack_subscriptions',
  USER_SETTINGS: 'subtrack_user_settings',
  NEXT_ID: 'subtrack_next_id',
};

// 模擬資料庫物件 (與 SQLite API 保持一致)
export interface WebDatabase {
  isWeb: true;
}

// 初始化 localStorage 資料庫
export async function initDatabase(): Promise<WebDatabase> {
  // 檢查是否需要初始化
  const settings = getUserSettingsSync();

  if (!settings) {
    // 建立預設使用者設定
    const now = new Date().toISOString();
    const defaultSettings: UserSettings = {
      id: 1,
      mainCurrency: 'TWD',
      exchangeRates: JSON.stringify(DEFAULT_EXCHANGE_RATES),
      theme: 'dark',
      createdAt: now,
      updatedAt: now,
    };
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(defaultSettings));
  }

  // 初始化訂閱列表（如果不存在）
  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  }

  // 初始化 ID 計數器
  if (!localStorage.getItem(STORAGE_KEYS.NEXT_ID)) {
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, '1');
  }

  return { isWeb: true };
}

// ==================== 輔助函式 ====================

function getSubscriptionsSync(): Subscription[] {
  const data = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS);
  return data ? JSON.parse(data) : [];
}

function saveSubscriptionsSync(subscriptions: Subscription[]): void {
  localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify(subscriptions));
}

function getUserSettingsSync(): UserSettings | null {
  const data = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
  return data ? JSON.parse(data) : null;
}

function saveUserSettingsSync(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings));
}

function getNextId(): number {
  const id = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_ID) || '1', 10);
  localStorage.setItem(STORAGE_KEYS.NEXT_ID, (id + 1).toString());
  return id;
}

// ==================== 訂閱 CRUD 操作 ====================

// 取得所有訂閱
export async function getAllSubscriptions(_db: WebDatabase): Promise<Subscription[]> {
  const subscriptions = getSubscriptionsSync();
  // 按下次扣款日期排序
  return subscriptions.sort(
    (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime(),
  );
}

// 根據分類取得訂閱
export async function getSubscriptionsByCategory(
  _db: WebDatabase,
  category: string,
): Promise<Subscription[]> {
  const subscriptions = getSubscriptionsSync();
  return subscriptions
    .filter((sub) => sub.category === category)
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
}

// 新增訂閱
export async function addSubscription(
  _db: WebDatabase,
  subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const subscriptions = getSubscriptionsSync();
  const now = new Date().toISOString();
  const id = getNextId();

  const newSubscription: Subscription = {
    ...subscription,
    id,
    createdAt: now,
    updatedAt: now,
  };

  subscriptions.push(newSubscription);
  saveSubscriptionsSync(subscriptions);

  return id;
}

// 更新訂閱
export async function updateSubscription(
  _db: WebDatabase,
  id: number,
  updates: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const subscriptions = getSubscriptionsSync();
  const index = subscriptions.findIndex((sub) => sub.id === id);

  if (index === -1) {
    throw new Error(`Subscription with id ${id} not found`);
  }

  const now = new Date().toISOString();
  subscriptions[index] = {
    ...subscriptions[index],
    ...updates,
    updatedAt: now,
  };

  saveSubscriptionsSync(subscriptions);
}

// 刪除訂閱
export async function deleteSubscription(_db: WebDatabase, id: number): Promise<void> {
  const subscriptions = getSubscriptionsSync();
  const filtered = subscriptions.filter((sub) => sub.id !== id);

  if (filtered.length === subscriptions.length) {
    throw new Error(`Subscription with id ${id} not found`);
  }

  saveSubscriptionsSync(filtered);
}

// ==================== 使用者設定 CRUD 操作 ====================

// 取得使用者設定
export async function getUserSettings(_db: WebDatabase): Promise<UserSettings | null> {
  return getUserSettingsSync();
}

// 更新使用者設定
export async function updateUserSettings(
  _db: WebDatabase,
  updates: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const settings = getUserSettingsSync();

  if (!settings) {
    throw new Error('User settings not found');
  }

  const now = new Date().toISOString();
  const updatedSettings: UserSettings = {
    ...settings,
    ...updates,
    updatedAt: now,
  };

  // 如果 exchangeRates 是物件，轉換為字串
  if (updates.exchangeRates && typeof updates.exchangeRates === 'object') {
    updatedSettings.exchangeRates = JSON.stringify(updates.exchangeRates);
  }

  saveUserSettingsSync(updatedSettings);
}

// ==================== 統計查詢 ====================

// 計算總月支出
export async function getMonthlyTotal(_db: WebDatabase, currency: string = 'TWD'): Promise<number> {
  const subscriptions = getSubscriptionsSync();

  const total = subscriptions
    .filter((sub) => sub.currency === currency)
    .reduce((sum, sub) => {
      const monthlyAmount = sub.billingCycle === 'monthly' ? sub.price : sub.price / 12;
      return sum + monthlyAmount;
    }, 0);

  return total;
}

// 計算總年支出
export async function getYearlyTotal(_db: WebDatabase, currency: string = 'TWD'): Promise<number> {
  const subscriptions = getSubscriptionsSync();

  const total = subscriptions
    .filter((sub) => sub.currency === currency)
    .reduce((sum, sub) => {
      const yearlyAmount = sub.billingCycle === 'monthly' ? sub.price * 12 : sub.price;
      return sum + yearlyAmount;
    }, 0);

  return total;
}

// 取得即將到期的訂閱 (N天內)
export async function getUpcomingSubscriptions(
  _db: WebDatabase,
  days: number = 7,
): Promise<Subscription[]> {
  const subscriptions = getSubscriptionsSync();
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return subscriptions
    .filter((sub) => {
      const billingDate = new Date(sub.nextBillingDate);
      return billingDate >= now && billingDate <= futureDate;
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
}

// ==================== 資料匯出/匯入 (額外功能) ====================

// 匯出所有資料
export function exportAllData(): {
  subscriptions: Subscription[];
  settings: UserSettings | null;
} {
  return {
    subscriptions: getSubscriptionsSync(),
    settings: getUserSettingsSync(),
  };
}

// 匯入資料
export function importAllData(data: {
  subscriptions: Subscription[];
  settings: UserSettings;
}): void {
  saveSubscriptionsSync(data.subscriptions);
  saveUserSettingsSync(data.settings);

  // 更新 ID 計數器
  if (data.subscriptions.length > 0) {
    const maxId = Math.max(...data.subscriptions.map((sub) => sub.id));
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, (maxId + 1).toString());
  }
}

// 清除所有資料
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SUBSCRIPTIONS);
  localStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.NEXT_ID);
}
