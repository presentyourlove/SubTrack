import * as SQLite from 'expo-sqlite';
import { Subscription, UserSettings, DEFAULT_EXCHANGE_RATES } from '../types';

const DB_NAME = 'subtrack.db';

// 初始化資料庫
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
      nextBillingDate TEXT NOT NULL,
      calendarEventId TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

    // 建立使用者設定表
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      mainCurrency TEXT NOT NULL DEFAULT 'TWD',
      exchangeRates TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT 'dark',
      notificationsEnabled INTEGER NOT NULL DEFAULT 1,
      defaultReminderTime TEXT NOT NULL DEFAULT '09:00',
      defaultReminderDays INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

    // 檢查是否需要初始化預設設定
    const settings = await db.getFirstAsync<UserSettings>(
        'SELECT * FROM user_settings WHERE id = 1'
    );

    if (!settings) {
        const now = new Date().toISOString();
        await db.runAsync(
            `INSERT INTO user_settings (id, mainCurrency, exchangeRates, theme, notificationsEnabled, defaultReminderTime, defaultReminderDays, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [1, 'TWD', JSON.stringify(DEFAULT_EXCHANGE_RATES), 'dark', 1, '09:00', 1, now, now]
        );
    } else {
        // 遷移邏輯:檢查是否需要添加新欄位
        try {
            await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN notificationsEnabled INTEGER NOT NULL DEFAULT 1;
            `);
        } catch (e) {
            // 欄位已存在,忽略錯誤
        }
        try {
            await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN defaultReminderTime TEXT NOT NULL DEFAULT '09:00';
            `);
        } catch (e) {
            // 欄位已存在,忽略錯誤
        }
        try {
            await db.execAsync(`
                ALTER TABLE user_settings ADD COLUMN defaultReminderDays INTEGER NOT NULL DEFAULT 1;
            `);
        } catch (e) {
            // 欄位已存在,忽略錯誤
        }
    }

    // 遷移邏輯:為 subscriptions 表添加 calendarEventId 欄位
    try {
        await db.execAsync(`
            ALTER TABLE subscriptions ADD COLUMN calendarEventId TEXT;
        `);
    } catch (e) {
        // 欄位已存在,忽略錯誤
    }

    return db;
}

// ==================== 訂閱 CRUD 操作 ====================

// 取得所有訂閱
export async function getAllSubscriptions(db: SQLite.SQLiteDatabase): Promise<Subscription[]> {
    const subscriptions = await db.getAllAsync<Subscription>(
        'SELECT * FROM subscriptions ORDER BY nextBillingDate ASC'
    );
    return subscriptions;
}

// 根據分類取得訂閱
export async function getSubscriptionsByCategory(
    db: SQLite.SQLiteDatabase,
    category: string
): Promise<Subscription[]> {
    const subscriptions = await db.getAllAsync<Subscription>(
        'SELECT * FROM subscriptions WHERE category = ? ORDER BY nextBillingDate ASC',
        [category]
    );
    return subscriptions;
}

// 新增訂閱
export async function addSubscription(
    db: SQLite.SQLiteDatabase,
    subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>
): Promise<number> {
    const now = new Date().toISOString();
    const result = await db.runAsync(
        `INSERT INTO subscriptions (name, icon, category, price, currency, billingCycle, nextBillingDate, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            subscription.name,
            subscription.icon,
            subscription.category,
            subscription.price,
            subscription.currency,
            subscription.billingCycle,
            subscription.nextBillingDate,
            now,
            now
        ]
    );
    return result.lastInsertRowId;
}

// 更新訂閱
export async function updateSubscription(
    db: SQLite.SQLiteDatabase,
    id: number,
    subscription: Partial<Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(subscription).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
    });

    fields.push('updatedAt = ?');
    values.push(now, id);

    await db.runAsync(
        `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = ?`,
        values
    );
}

// 刪除訂閱
export async function deleteSubscription(
    db: SQLite.SQLiteDatabase,
    id: number
): Promise<void> {
    await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}

// ==================== 使用者設定 CRUD 操作 ====================

// 取得使用者設定
export async function getUserSettings(db: SQLite.SQLiteDatabase): Promise<UserSettings | null> {
    const settings = await db.getFirstAsync<UserSettings>(
        'SELECT * FROM user_settings WHERE id = 1'
    );
    return settings;
}

// 更新使用者設定
export async function updateUserSettings(
    db: SQLite.SQLiteDatabase,
    settings: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(settings).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(typeof value === 'object' ? JSON.stringify(value) : value);
    });

    fields.push('updatedAt = ?');
    values.push(now);

    await db.runAsync(
        `UPDATE user_settings SET ${fields.join(', ')} WHERE id = 1`,
        values
    );
}

// ==================== 統計查詢 ====================

// 計算總月支出
export async function getMonthlyTotal(
    db: SQLite.SQLiteDatabase,
    currency: string = 'TWD'
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
        [currency]
    );
    return result?.total || 0;
}

// 計算總年支出
export async function getYearlyTotal(
    db: SQLite.SQLiteDatabase,
    currency: string = 'TWD'
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
        [currency]
    );
    return result?.total || 0;
}

// 取得即將到期的訂閱 (N天內)
export async function getUpcomingSubscriptions(
    db: SQLite.SQLiteDatabase,
    days: number = 7
): Promise<Subscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const subscriptions = await db.getAllAsync<Subscription>(
        `SELECT * FROM subscriptions 
     WHERE nextBillingDate <= ? 
     ORDER BY nextBillingDate ASC`,
        [futureDate.toISOString()]
    );
    return subscriptions;
}
