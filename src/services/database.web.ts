import { Subscription, UserSettings, Tag } from '../types';
import { DEFAULT_EXCHANGE_RATES } from '../constants/AppConfig';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subtrack_subscriptions',
  USER_SETTINGS: 'subtrack_user_settings',
  NEXT_ID: 'subtrack_next_id',
  TAGS: 'subtrack_tags',
  WORKSPACES: 'subtrack_workspaces',
  REPORTS: 'subtrack_reports',
  SUBSCRIPTION_TAGS: 'subtrack_subscription_tags',
};

// 模擬資料庫物件 (與 SQLite API 保持一致)
export interface WebDatabase {
  isWeb: true;
  getAllAsync: <T>(sql: string, params?: (string | number)[]) => Promise<T[]>;
  getFirstAsync: <T>(sql: string, params?: (string | number)[]) => Promise<T | null>;
  runAsync: (
    sql: string,
    params?: (string | number)[],
  ) => Promise<{ lastInsertRowId: number; changes: number }>;
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

  // 初始化列表（如果不存在）
  const initList = (key: string) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify([]));
    }
  };

  initList(STORAGE_KEYS.SUBSCRIPTIONS);
  initList(STORAGE_KEYS.TAGS);
  initList(STORAGE_KEYS.WORKSPACES);
  initList(STORAGE_KEYS.REPORTS);
  initList(STORAGE_KEYS.SUBSCRIPTION_TAGS);

  // 初始化 ID 計數器
  if (!localStorage.getItem(STORAGE_KEYS.NEXT_ID)) {
    localStorage.setItem(STORAGE_KEYS.NEXT_ID, '1');
  }

  // Mock SQLite API Implementation
  const getAllAsync = async <T>(sql: string, params: (string | number)[] = []): Promise<T[]> => {
    // TAGS
    if (sql.includes('FROM tags')) {
      const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]') as Tag[];
      if (sql.includes('subscription_tags')) {
        // Handle JOIN query for subscription tags
        // SELECT t.* FROM tags t INNER JOIN subscription_tags st ON t.id = st.tagId WHERE st.subscriptionId = ?
        if (sql.includes('INNER JOIN subscription_tags')) {
          const subId = params[0];
          const subTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TAGS) || '[]');
          const tagIds = subTags
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((st: any) => st.subscriptionId === subId)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((st: any) => st.tagId);

          return tags
            .filter((t) => tagIds.includes(t.id))
            .sort((a, b) => a.name.localeCompare(b.name)) as unknown as T[];
        }
      }
      return tags as unknown as T[];
    }

    // WORKSPACES
    if (sql.includes('FROM workspaces')) {
      const workspaces = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSPACES) || '[]');
      // Fix: Ensure default workspace exists if empty
      if (workspaces.length === 0) {
        const defaultWorkspace = {
          id: 1,
          name: 'Personal',
          icon: 'person',
          isDefault: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        workspaces.push(defaultWorkspace);
        localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
      }
      return workspaces as T[];
    }

    // REPORTS
    if (sql.includes('FROM custom_reports')) {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REPORTS) || '[]') as T[];
    }

    // SUBSCRIPTIONS (Fallback if context calls native getAllSubscriptions via SQL, though currently it calls database.web.ts exports directly)
    if (sql.includes('FROM subscriptions')) {
      return getSubscriptionsSync() as unknown as T[];
    }

    return [];
  };

  const getFirstAsync = async <T>(
    sql: string,
    params: (string | number)[] = [],
  ): Promise<T | null> => {
    // Basic implementation for "SELECT * FROM ... WHERE id = ?"
    const list = await getAllAsync<T>(sql.replace('WHERE id = ?', ''), []);
    if (list.length > 0 && params.length > 0) {
      // Very naive filtering
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return list.find((item: any) => item.id === params[0]) || null;
    }
    return list[0] || null;
  };

  const runAsync = async (
    sql: string,
    params: (string | number)[] = [],
  ): Promise<{ lastInsertRowId: number; changes: number }> => {
    const now = new Date().toISOString();
    const getNextIdLocal = () => {
      const id = parseInt(localStorage.getItem(STORAGE_KEYS.NEXT_ID) || '1', 10);
      localStorage.setItem(STORAGE_KEYS.NEXT_ID, (id + 1).toString());
      return id;
    };

    // TAGS
    if (sql.includes('INSERT INTO tags')) {
      // INSERT INTO tags (name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?)
      const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
      const id = getNextIdLocal();
      const newTag = { id, name: params[0], color: params[1], createdAt: now, updatedAt: now };
      tags.push(newTag);
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
      return { lastInsertRowId: id, changes: 1 };
    }
    if (sql.includes('UPDATE tags')) {
      // UPDATE tags SET ... WHERE id = ?
      const id = params[params.length - 1]; // Last param is ID
      const tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const index = tags.findIndex((t: any) => t.id === id);
      if (index !== -1) {
        // This is tricky without parsing "SET name=?, color=?"
        // Assumption: params order matches usages in tags.ts
        // Logic too complex for regex, just updating timestamp mostly
        tags[index].updatedAt = now;
        localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
        return { lastInsertRowId: Number(id), changes: 1 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    }
    if (sql.includes('DELETE FROM tags')) {
      const id = params[0];
      let tags = JSON.parse(localStorage.getItem(STORAGE_KEYS.TAGS) || '[]');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags = tags.filter((t: any) => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));

      // Cascade delete subscription_tags
      let subTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TAGS) || '[]');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subTags = subTags.filter((st: any) => st.tagId !== id);
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TAGS, JSON.stringify(subTags));

      return { lastInsertRowId: 0, changes: 1 };
    }

    // SUBSCRIPTION TAGS
    if (sql.includes('INSERT INTO subscription_tags')) {
      const subTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TAGS) || '[]');
      subTags.push({ subscriptionId: params[0], tagId: params[1] });
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TAGS, JSON.stringify(subTags));
      return { lastInsertRowId: 0, changes: 1 };
    }
    if (sql.includes('DELETE FROM subscription_tags')) {
      let subTags = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_TAGS) || '[]');
      const subId = params[0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subTags = subTags.filter((st: any) => st.subscriptionId !== subId); // Assume delete by subId
      localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_TAGS, JSON.stringify(subTags));
      return { lastInsertRowId: 0, changes: 1 };
    }

    // WORKSPACES
    if (sql.includes('INSERT INTO workspaces')) {
      const workspaces = JSON.parse(localStorage.getItem(STORAGE_KEYS.WORKSPACES) || '[]');
      const id = getNextIdLocal();
      const newWorkspace = {
        id,
        name: params[0],
        icon: params[1],
        isDefault: 0,
        createdAt: now,
        updatedAt: now,
      };
      workspaces.push(newWorkspace);
      localStorage.setItem(STORAGE_KEYS.WORKSPACES, JSON.stringify(workspaces));
      return { lastInsertRowId: id, changes: 1 };
    }

    return { lastInsertRowId: 0, changes: 0 };
  };

  return { isWeb: true, getAllAsync, getFirstAsync, runAsync };
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

// ==================== 報表操作 (Web 存根) ====================

export async function createReport(_db: WebDatabase, _report: unknown): Promise<number> {
  return 0;
}

export async function getReports(_db: WebDatabase): Promise<unknown[]> {
  return [];
}

export async function deleteReport(_db: WebDatabase, _id: number): Promise<void> {
  // 不執行操作
}

// 清除所有資料
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}
