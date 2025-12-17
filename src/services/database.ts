import * as SQLite from 'expo-sqlite';
import { Subscription, UserSettings } from '../types';
import { DB_NAME, DEFAULT_SETTINGS, DEFAULT_EXCHANGE_RATES } from '../constants/AppConfig';

// 匯出型別供其他模組使用
export type SQLiteDatabase = SQLite.SQLiteDatabase;

/**
 * 初始化資料庫並建立必要的資料表
 *
 * 此函式會建立 subscriptions 和 user_settings 兩個資料表，
 * 並初始化預設的使用者設定。如果資料表已存在，則會嘗試遷移（新增缺少的欄位）。
 *
 * @returns {Promise<SQLite.SQLiteDatabase>} 資料庫實例
 * @throws {Error} 資料庫開啟或建立失敗時
 *
 * @example
 * const db = await initDatabase();
 * console.log('資料庫初始化完成');
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  // 建立訂閱表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      currency TEXT NOT NULL,
      billingCycle TEXT NOT NULL,
      startDate TEXT NOT NULL,
      nextBillingDate TEXT NOT NULL,
      reminderEnabled INTEGER NOT NULL DEFAULT 0,
      reminderTime TEXT,
      reminderDays INTEGER,
      calendarEventId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 建立使用者設定表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      mainCurrency TEXT NOT NULL DEFAULT '${DEFAULT_SETTINGS.MAIN_CURRENCY}',
      exchangeRates TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT '${DEFAULT_SETTINGS.THEME}',
      notificationsEnabled INTEGER NOT NULL DEFAULT ${DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED},
      defaultReminderTime TEXT NOT NULL DEFAULT '${DEFAULT_SETTINGS.REMINDER_TIME}',
      defaultReminderDays INTEGER NOT NULL DEFAULT ${DEFAULT_SETTINGS.REMINDER_DAYS},
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 檢查是否需要初始化預設設定
  const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');

  if (!settings) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO user_settings (id, mainCurrency, exchangeRates, theme, notificationsEnabled, defaultReminderTime, defaultReminderDays, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        DEFAULT_SETTINGS.MAIN_CURRENCY,
        JSON.stringify(DEFAULT_EXCHANGE_RATES),
        DEFAULT_SETTINGS.THEME,
        DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED,
        DEFAULT_SETTINGS.REMINDER_TIME,
        DEFAULT_SETTINGS.REMINDER_DAYS,
        now,
        now,
      ],
    );
  } else {
    // 遷移邏輯:檢查是否需要添加新欄位
    try {
      await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN notificationsEnabled INTEGER NOT NULL DEFAULT ${DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED};
            `);
    } catch {
      // 欄位已存在,忽略錯誤
    }
    try {
      await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN defaultReminderTime TEXT NOT NULL DEFAULT '09:00';
            `);
    } catch {
      // 欄位已存在,忽略錯誤
    }
    try {
      await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN defaultReminderDays INTEGER NOT NULL DEFAULT 1;
            `);
    } catch {
      // 欄位已存在,忽略錯誤
    }
  }

  // 遷移邏輯:為 subscriptions 表添加缺少的欄位
  try {
    await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN calendarEventId TEXT;
        `);
  } catch {
    // 欄位已存在,忽略錯誤
  }

  try {
    await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN startDate TEXT NOT NULL DEFAULT '2024-01-01';
        `);
  } catch {
    // 欄位已存在,忽略錯誤
  }

  try {
    await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN reminderEnabled INTEGER NOT NULL DEFAULT 0;
        `);
  } catch {
    // 欄位已存在,忽略錯誤
  }

  try {
    await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN reminderTime TEXT;
        `);
  } catch {
    // 欄位已存在,忽略錯誤
  }

  try {
    await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN reminderDays INTEGER;
        `);
  } catch {
    // 欄位已存在,忽略錯誤
  }

  return db;
}

// ==================== 訂閱 CRUD 操作 ====================

/**
 * 取得所有訂閱資料
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @returns {Promise<Subscription[]>} 所有訂閱資料，依下次付款日期升序排列
 *
 * @example
 * const subscriptions = await getAllSubscriptions(db);
 * console.log(`共有 ${subscriptions.length} 個訂閱`);
 */
export async function getAllSubscriptions(db: SQLite.SQLiteDatabase): Promise<Subscription[]> {
  const subscriptions = await db.getAllAsync<Subscription>(
    'SELECT * FROM subscriptions ORDER BY nextBillingDate ASC',
  );
  return subscriptions;
}

/**
 * 根據分類取得訂閱資料
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {string} category - 訂閱分類 ('entertainment' | 'productivity' | 'lifestyle')
 * @returns {Promise<Subscription[]>} 該分類的所有訂閱，依下次付款日期升序排列
 *
 * @example
 * const entertainment = await getSubscriptionsByCategory(db, 'entertainment');
 */
export async function getSubscriptionsByCategory(
  db: SQLite.SQLiteDatabase,
  category: string,
): Promise<Subscription[]> {
  const subscriptions = await db.getAllAsync<Subscription>(
    'SELECT * FROM subscriptions WHERE category = ? ORDER BY nextBillingDate ASC',
    [category],
  );
  return subscriptions;
}

/**
 * 新增訂閱
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>} subscription - 訂閱資料（不含 id、createdAt、updatedAt）
 * @returns {Promise<number>} 新增訂閱的 ID
 * @throws {Error} 資料插入失敗時
 *
 * @example
 * const id = await addSubscription(db, {
 *   name: 'Netflix',
 *   icon: '📺',
 *   category: 'entertainment',
 *   price: 390,
 *   currency: 'TWD',
 *   billingCycle: 'monthly',
 *   startDate: '2024-01-01',
 *   nextBillingDate: '2024-02-01',
 *   reminderEnabled: true,
 * });
 */
export async function addSubscription(
  db: SQLite.SQLiteDatabase,
  subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO subscriptions (name, icon, category, price, currency, billingCycle, startDate, nextBillingDate, reminderEnabled, reminderTime, reminderDays, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      subscription.name,
      subscription.icon,
      subscription.category,
      subscription.price,
      subscription.currency,
      subscription.billingCycle,
      subscription.startDate,
      subscription.nextBillingDate,
      subscription.reminderEnabled ? 1 : 0,
      subscription.reminderTime || null,
      subscription.reminderDays ?? null,
      now,
      now,
    ],
  );
  return result.lastInsertRowId;
}

/**
 * 更新訂閱資料
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {number} id - 訂閱 ID
 * @param {Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>} subscription - 要更新的欄位
 * @returns {Promise<void>}
 * @throws {Error} 更新失敗時
 *
 * @example
 * await updateSubscription(db, 1, {
 *   price: 490,
 *   nextBillingDate: '2024-03-01',
 * });
 */
export async function updateSubscription(
  db: SQLite.SQLiteDatabase,
  id: number,
  subscription: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  Object.entries(subscription).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });

  fields.push('updatedAt = ?');
  values.push(now, id);

  await db.runAsync(`UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`, values);
}

/**
 * 刪除訂閱
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {number} id - 要刪除的訂閱 ID
 * @returns {Promise<void>}
 * @throws {Error} 刪除失敗時
 *
 * @example
 * await deleteSubscription(db, 1);
 */
export async function deleteSubscription(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}

// ==================== 使用者設定 CRUD 操作 ====================

/**
 * 取得使用者設定
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @returns {Promise<UserSettings | null>} 使用者設定，若不存在則回傳 null
 *
 * @example
 * const settings = await getUserSettings(db);
 * if (settings) {
 *   console.log(`主要幣別: ${settings.mainCurrency}`);
 * }
 */
export async function getUserSettings(db: SQLite.SQLiteDatabase): Promise<UserSettings | null> {
  const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
  return settings;
}

/**
 * 更新使用者設定
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>} settings - 要更新的設定欄位
 * @returns {Promise<void>}
 * @throws {Error} 更新失敗時
 *
 * @example
 * await updateUserSettings(db, {
 *   mainCurrency: 'USD',
 *   theme: 'dark',
 *   notificationsEnabled: true,
 * });
 */
export async function updateUserSettings(
  db: SQLite.SQLiteDatabase,
  settings: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  Object.entries(settings).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    // 處理不同類型的值
    if (typeof value === 'boolean') {
      // boolean 轉換為 INTEGER (0 或 1)
      values.push(value ? 1 : 0);
    } else if (typeof value === 'object') {
      // 物件轉換為 JSON 字串
      values.push(JSON.stringify(value));
    } else {
      values.push(value);
    }
  });

  fields.push('updatedAt = ?');
  values.push(now);

  await db.runAsync(`UPDATE user_settings SET ${fields.join(', ')} WHERE id = 1`, values);
}

// ==================== 統計查詢 ====================

/**
 * 計算總月支出
 *
 * 自動將年繳訂閱除以 12 換算成月費
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {string} [currency='TWD'] - 貨幣代碼
 * @returns {Promise<number>} 總月支出金額
 *
 * @example
 * const monthlyTotal = await getMonthlyTotal(db, 'TWD');
 * console.log(`每月總支出: NT$${monthlyTotal}`);
 */
export async function getMonthlyTotal(
  db: SQLite.SQLiteDatabase,
  currency: string = 'TWD',
): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price
        WHEN billingCycle = 'yearly' THEN price / 12
      END
    ) as total
    FROM subscriptions
    WHERE currency = ?`,
    [currency],
  );
  return result?.total || 0;
}

/**
 * 計算總年支出
 *
 * 自動將月繳訂閱乘以 12 換算成年費
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {string} [currency='TWD'] - 貨幣代碼
 * @returns {Promise<number>} 總年支出金額
 *
 * @example
 * const yearlyTotal = await getYearlyTotal(db, 'TWD');
 * console.log(`每年總支出: NT$${yearlyTotal}`);
 */
export async function getYearlyTotal(
  db: SQLite.SQLiteDatabase,
  currency: string = 'TWD',
): Promise<number> {
  const result = await db.getFirstAsync<{ total: number }>(
    `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price * 12
        WHEN billingCycle = 'yearly' THEN price
      END
    ) as total
    FROM subscriptions
    WHERE currency = ?`,
    [currency],
  );
  return result?.total || 0;
}

/**
 * 取得即將到期的訂閱
 *
 * @param {SQLite.SQLiteDatabase} db - 資料庫實例
 * @param {number} [days=7] - 天數範圍（預設 7 天）
 * @returns {Promise<Subscription[]>} 即將到期的訂閱，依付款日期升序排列
 *
 * @example
 * // 取得未來 3 天內到期的訂閱
 * const upcoming = await getUpcomingSubscriptions(db, 3);
 * upcoming.forEach(sub => {
 *   console.log(`${sub.name} 將於 ${sub.nextBillingDate} 付款`);
 * });
 */
export async function getUpcomingSubscriptions(
  db: SQLite.SQLiteDatabase,
  days: number = 7,
): Promise<Subscription[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const subscriptions = await db.getAllAsync<Subscription>(
    `SELECT * FROM subscriptions 
     WHERE nextBillingDate <= ? 
     ORDER BY nextBillingDate ASC`,
    [futureDate.toISOString()],
  );
  return subscriptions;
}
