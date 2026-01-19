import { SQLiteDatabase } from '../database';
import { Subscription } from '../../types';

/**
 * 計算總月支出
 */
export async function getMonthlyTotal(
  db: SQLiteDatabase,
  currency: string = 'TWD',
  workspaceId?: number,
): Promise<number> {
  const query = workspaceId
    ? `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price
        WHEN billingCycle = 'yearly' THEN price / 12
      END
    ) as total
    FROM subscriptions
    WHERE currency = ? AND workspaceId = ?`
    : `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price
        WHEN billingCycle = 'yearly' THEN price / 12
      END
    ) as total
    FROM subscriptions
    WHERE currency = ?`;

  const params = workspaceId ? [currency, workspaceId] : [currency];

  const result = await db.getFirstAsync<{ total: number }>(query, params);
  return result?.total || 0;
}

/**
 * 計算總年支出
 */
export async function getYearlyTotal(
  db: SQLiteDatabase,
  currency: string = 'TWD',
  workspaceId?: number,
): Promise<number> {
  const query = workspaceId
    ? `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price * 12
        WHEN billingCycle = 'yearly' THEN price
      END
    ) as total
    FROM subscriptions
    WHERE currency = ? AND workspaceId = ?`
    : `SELECT SUM(
      CASE 
        WHEN billingCycle = 'monthly' THEN price * 12
        WHEN billingCycle = 'yearly' THEN price
      END
    ) as total
    FROM subscriptions
    WHERE currency = ?`;

  const params = workspaceId ? [currency, workspaceId] : [currency];

  const result = await db.getFirstAsync<{ total: number }>(query, params);
  return result?.total || 0;
}

/**
 * 取得即將到期的訂閱
 */
export async function getUpcomingSubscriptions(
  db: SQLiteDatabase,
  days: number = 7,
  workspaceId?: number,
): Promise<Subscription[]> {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  const query = workspaceId
    ? `SELECT * FROM subscriptions 
       WHERE nextBillingDate <= ? AND workspaceId = ?
       ORDER BY nextBillingDate ASC`
    : `SELECT * FROM subscriptions 
       WHERE nextBillingDate <= ? 
       ORDER BY nextBillingDate ASC`;

  const params = workspaceId ? [futureDate.toISOString(), workspaceId] : [futureDate.toISOString()];

  const subscriptions = await db.getAllAsync<Subscription>(query, params);
  return subscriptions;
}
