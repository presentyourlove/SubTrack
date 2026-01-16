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
      isFamilyPlan INTEGER NOT NULL DEFAULT 0,
      memberCount INTEGER,
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
      privacyMode INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 建立標籤表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#007AFF',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 建立訂閱-標籤關聯表 (多對多)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscription_tags (
      subscriptionId INTEGER NOT NULL,
      tagId INTEGER NOT NULL,
      PRIMARY KEY (subscriptionId, tagId),
      FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE CASCADE,
      FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);

  // 建立訂閱成員表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS subscription_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subscriptionId INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      lastPaymentDate TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (subscriptionId) REFERENCES subscriptions(id) ON DELETE CASCADE
    );
  `);

  // 建立工作區表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      isDefault INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 建立自訂報表表
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS custom_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      chartType TEXT NOT NULL,
      dimension TEXT NOT NULL,
      metric TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  // 檢查並初始化預設工作區
  const defaultWorkspace = await db.getFirstAsync('SELECT * FROM workspaces WHERE id = 1');
  if (!defaultWorkspace) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO workspaces (id, name, icon, isDefault, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [1, 'Personal', '👤', 1, now, now],
    );
  }

  // 檢查是否需要初始化預設設定
  const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');

  if (!settings) {
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO user_settings (id, mainCurrency, exchangeRates, theme, notificationsEnabled, defaultReminderTime, defaultReminderDays, currentWorkspaceId, privacyMode, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        1,
        DEFAULT_SETTINGS.MAIN_CURRENCY,
        JSON.stringify(DEFAULT_EXCHANGE_RATES),
        DEFAULT_SETTINGS.THEME,
        DEFAULT_SETTINGS.NOTIFICATIONS_ENABLED,
        DEFAULT_SETTINGS.REMINDER_TIME,
        DEFAULT_SETTINGS.REMINDER_DAYS,
        1,
        0, // privacyMode
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
      `ALTER TABLE user_settings ADD COLUMN currentWorkspaceId INTEGER DEFAULT 1`,
      `ALTER TABLE subscriptions ADD COLUMN calendarEventId TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN startDate TEXT NOT NULL DEFAULT '2024-01-01'`,
      `ALTER TABLE subscriptions ADD COLUMN reminderEnabled INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE subscriptions ADD COLUMN reminderTime TEXT`,
      `ALTER TABLE subscriptions ADD COLUMN reminderDays INTEGER`,
      `ALTER TABLE subscriptions ADD COLUMN isFamilyPlan INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE subscriptions ADD COLUMN memberCount INTEGER`,
      `ALTER TABLE subscriptions ADD COLUMN workspaceId INTEGER REFERENCES workspaces(id) ON DELETE CASCADE DEFAULT 1`,
      `ALTER TABLE user_settings ADD COLUMN conversionEnabled INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE user_settings ADD COLUMN salaryType TEXT NOT NULL DEFAULT 'hourly'`,
      `ALTER TABLE user_settings ADD COLUMN salaryAmount REAL DEFAULT 0`,
      `ALTER TABLE user_settings ADD COLUMN workDaysPerMonth INTEGER DEFAULT 22`,
      `ALTER TABLE user_settings ADD COLUMN workHoursPerDay INTEGER DEFAULT 8`,
      `ALTER TABLE user_settings ADD COLUMN privacyMode INTEGER NOT NULL DEFAULT 0`,
      `ALTER TABLE user_settings ADD COLUMN language TEXT`,
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
