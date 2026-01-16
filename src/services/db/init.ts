import * as SQLite from 'expo-sqlite';
import { UserSettings } from '../../types';
import { DB_NAME, DEFAULT_SETTINGS, DEFAULT_EXCHANGE_RATES } from '../../constants/AppConfig';

export type SQLiteDatabase = SQLite.SQLiteDatabase;

/**
 * 初始化資料庫並建立必要的資料表
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
    // 遷移邏輯
    const migrations = [
      `ALTER TABLE user_settings ADD COLUMN notificationsEnabled INTEGER NOT NULL DEFAULT ${DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED}`,
      `ALTER TABLE user_settings ADD COLUMN defaultReminderTime TEXT NOT NULL DEFAULT '09:00'`,
      `ALTER TABLE user_settings ADD COLUMN defaultReminderDays INTEGER NOT NULL DEFAULT 1`,
      `ALTER TABLE subscriptions ADD COLUMN calendarEventId TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN startDate TEXT NOT NULL DEFAULT '2024-01-01'`,
      `ALTER TABLE subscriptions ADD COLUMN reminderEnabled INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE subscriptions ADD COLUMN reminderTime TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN reminderDays INTEGER`,
    ];

    for (const sql of migrations) {
      try {
        await db.execAsync(sql);
      } catch {
        // 欄位已存在,忽略錯誤
      }
    }
  }

  return db;
}
