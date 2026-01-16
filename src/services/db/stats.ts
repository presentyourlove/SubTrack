import * as SQLite from 'expo-sqlite';
import { Subscription } from '../../types';

/**
 * 計算總月支出
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
