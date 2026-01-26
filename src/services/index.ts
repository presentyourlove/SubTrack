import * as SQLiteDB from './database';

export const database = SQLiteDB;
export type Database = SQLiteDB.SQLiteDatabase;

// Export default implementation for Type Check (matches native interface)
export async function initializeDatabase(): Promise<Database> {
  return await database.initDatabase();
}

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
  getUpcomingSubscriptions,
  createReport,
  getReports,
  deleteReport,
} = database;
