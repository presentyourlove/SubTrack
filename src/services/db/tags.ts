/**
 * Tags Database Service
 * 標籤相關資料庫操作
 */

import { SQLiteDatabase } from '../database';
import { Tag } from '../../types';

/**
 * 取得所有標籤
 */
export async function getAllTags(db: SQLite.SQLiteDatabase): Promise<Tag[]> {
  const tags = await db.getAllAsync<Tag>('SELECT * FROM tags ORDER BY name ASC');
  return tags;
}

/**
 * 根據 ID 取得標籤
 */
export async function getTagById(db: SQLite.SQLiteDatabase, id: number): Promise<Tag | null> {
  const tag = await db.getFirstAsync<Tag>('SELECT * FROM tags WHERE id = ?', [id]);
  return tag || null;
}

/**
 * 建立新標籤
 */
export async function createTag(db: SQLiteDatabase, name: string, color: string): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO tags (name, color, createdAt, updatedAt) VALUES (?, ?, ?, ?)',
    [name, color, now, now],
  );
  return result.lastInsertRowId;
}

/**
 * 更新標籤
 */
export async function updateTag(
  db: SQLiteDatabase,
  id: number,
  updates: Partial<Pick<Tag, 'name' | 'color'>>,
): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.color !== undefined) {
    fields.push('color = ?');
    values.push(updates.color);
  }

  if (fields.length === 0) return;

  fields.push('updatedAt = ?');
  values.push(now, id);

  await db.runAsync(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, values);
}

/**
 * 刪除標籤
 */
export async function deleteTag(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  // 關聯表會因 ON DELETE CASCADE 自動清除
  await db.runAsync('DELETE FROM tags WHERE id = ?', [id]);
}

/**
 * 取得訂閱的所有標籤
 */
export async function getTagsForSubscription(
  db: SQLiteDatabase,
  subscriptionId: number,
): Promise<Tag[]> {
  const tags = await db.getAllAsync<Tag>(
    `SELECT t.* FROM tags t
     INNER JOIN subscription_tags st ON t.id = st.tagId
     WHERE st.subscriptionId = ?
     ORDER BY t.name ASC`,
    [subscriptionId],
  );
  return tags;
}

/**
 * 設定訂閱的標籤 (覆蓋現有標籤)
 */
export async function setTagsForSubscription(
  db: SQLiteDatabase,
  subscriptionId: number,
  tagIds: number[],
): Promise<void> {
  // 先移除所有現有標籤
  await db.runAsync('DELETE FROM subscription_tags WHERE subscriptionId = ?', [subscriptionId]);

  // 新增新標籤
  for (const tagId of tagIds) {
    await db.runAsync('INSERT INTO subscription_tags (subscriptionId, tagId) VALUES (?, ?)', [
      subscriptionId,
      tagId,
    ]);
  }
}

/**
 * 新增單一標籤到訂閱
 */
export async function addTagToSubscription(
  db: SQLiteDatabase,
  subscriptionId: number,
  tagId: number,
): Promise<void> {
  try {
    await db.runAsync(
      'INSERT OR IGNORE INTO subscription_tags (subscriptionId, tagId) VALUES (?, ?)',
      [subscriptionId, tagId],
    );
  } catch {
    // 已存在則忽略
  }
}

/**
 * 從訂閱移除單一標籤
 */
export async function removeTagFromSubscription(
  db: SQLiteDatabase,
  subscriptionId: number,
  tagId: number,
): Promise<void> {
  await db.runAsync('DELETE FROM subscription_tags WHERE subscriptionId = ? AND tagId = ?', [
    subscriptionId,
    tagId,
  ]);
}

/**
 * 根據標籤取得訂閱 ID 列表
 */
export async function getSubscriptionIdsByTag(
  db: SQLiteDatabase,
  tagId: number,
): Promise<number[]> {
  const results = await db.getAllAsync<{ subscriptionId: number }>(
    'SELECT subscriptionId FROM subscription_tags WHERE tagId = ?',
    [tagId],
  );
  return results.map((r) => r.subscriptionId);
}

/**
 * 根據多個標籤取得訂閱 ID 列表 (AND 邏輯)
 */
export async function getSubscriptionIdsByTags(
  db: SQLiteDatabase,
  tagIds: number[],
): Promise<number[]> {
  if (tagIds.length === 0) return [];

  const placeholders = tagIds.map(() => '?').join(',');
  const results = await db.getAllAsync<{ subscriptionId: number }>(
    `SELECT subscriptionId FROM subscription_tags
     WHERE tagId IN (${placeholders})
     GROUP BY subscriptionId
     HAVING COUNT(DISTINCT tagId) = ?`,
    [...tagIds, tagIds.length],
  );
  return results.map((r) => r.subscriptionId);
}
