import * as SQLite from 'expo-sqlite';
import { Subscription } from '../../types';

/**
 * 取得所有訂閱資料
 */
export async function getAllSubscriptions(db: SQLite.SQLiteDatabase): Promise<Subscription[]> {
    const subscriptions = await db.getAllAsync<Subscription>(
        'SELECT * FROM subscriptions ORDER BY nextBillingDate ASC',
    );
    return subscriptions;
}

/**
 * 根據分類取得訂閱資料
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
 */
export async function deleteSubscription(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
    await db.runAsync('DELETE FROM subscriptions WHERE id = ?', [id]);
}
