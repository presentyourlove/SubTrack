import { Platform } from 'react-native';
import * as SQLiteDB from './database';
import * as WebDB from './database.web';

// 根據平台選擇正確的資料庫實作
export const database = Platform.OS === 'web' ? WebDB : SQLiteDB;

// 匯出型別
export type Database = SQLiteDB.SQLiteDatabase | WebDB.WebDatabase;

// 統一的資料庫初始化函式
export async function initializeDatabase(): Promise<Database> {
  return await database.initDatabase();
}

// 匯出所有資料庫操作
export const {
  getAllSubscriptions,
  getSubscriptionsByCategory,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getUserSettings,
  updateUserSettings,
  getMonthlyTotal,
  getYearlyTotal,
  getMonthlyTotal,
  getYearlyTotal,
  getUpcomingSubscriptions,
  createReport,
  getReports,
  deleteReport,
} = database;
