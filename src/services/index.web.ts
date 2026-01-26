import * as WebDB from './database.web';

export const database = WebDB;
export type Database = WebDB.WebDatabase;

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
