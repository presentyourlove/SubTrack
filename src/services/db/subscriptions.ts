import { SQLiteDatabase } from '../database';
import { Subscription } from '../../types';

/**
 * 取得所有訂閱資料
 */
export async function getAllSubscriptions(
  db: SQLiteDatabase,
  workspaceId?: number,
): Promise<Subscription[]> {
  const query = workspaceId
    ? 'SELECT * FROM subscriptions WHERE workspaceId = ? ORDER BY nextBillingDate ASC'
    : 'SELECT * FROM subscriptions ORDER BY nextBillingDate ASC';
  const params = workspaceId ? [workspaceId] : [];

  const subscriptions = await db.getAllAsync<Subscription>(query, params);
  return subscriptions;
}

/**
 * 根據分類取得訂閱資料
 */
export async function getSubscriptionsByCategory(
  db: SQLiteDatabase,
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
 */
export async function addSubscription(
  db: SQLiteDatabase,
  subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO subscriptions (name, icon, category, price, currency, billingCycle, startDate, nextBillingDate, reminderEnabled, reminderTime, reminderDays, isFamilyPlan, memberCount, workspaceId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      subscription.isFamilyPlan ? 1 : 0,
      subscription.memberCount ?? null,
      subscription.workspaceId,
      now,
      now,
    ],
  );
  return result.lastInsertRowId;
}

/**
 * 更新訂閱資料
 */
export async function updateSubscription(
  db: SQLiteDatabase,
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
 */
export async function deleteSubscription(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}
