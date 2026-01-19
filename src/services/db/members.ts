import { SQLiteDatabase } from '../database';
import { Member } from '../../types';

/**
 * 取得訂閱的所有成員
 */
export async function getMembers(db: SQLiteDatabase, subscriptionId: number): Promise<Member[]> {
  return await db.getAllAsync<Member>(
    'SELECT * FROM subscription_members WHERE subscriptionId = ? ORDER BY id ASC',
    [subscriptionId],
  );
}

/**
 * 新增成員
 */
export async function addMember(
  db: SQLiteDatabase,
  subscriptionId: number,
  name: string,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO subscription_members (subscriptionId, name, status, createdAt, updatedAt)
     VALUES (?, ?, 'unpaid', ?, ?)`,
    [subscriptionId, name, now, now],
  );
  return result.lastInsertRowId;
}

/**
 * 更新成員狀態
 */
export async function updateMemberStatus(
  db: SQLiteDatabase,
  memberId: number,
  status: 'paid' | 'unpaid',
): Promise<void> {
  const now = new Date().toISOString();
  const lastPaymentDate = status === 'paid' ? now.split('T')[0] : null;

  await db.runAsync(
    `UPDATE subscription_members 
     SET status = ?, lastPaymentDate = ?, updatedAt = ? 
     WHERE id = ?`,
    [status, lastPaymentDate, now, memberId],
  );
}

/**
 * 刪除成員
 */
export async function deleteMember(db: SQLite.SQLiteDatabase, memberId: number): Promise<void> {
  await db.runAsync('DELETE FROM subscription_members WHERE id = ?', [memberId]);
}

/**
 * 確保成員數量符合 user 設定 (同步用)
 * 如果 DB 成員少於 memberCount, 自動補 "Member N"
 * 如果 DB 成員多於 memberCount, 自動刪除多餘的 (從後面刪)
 */
export async function syncMemberCount(
  db: SQLiteDatabase,
  subscriptionId: number,
  targetCount: number,
): Promise<void> {
  const members = await getMembers(db, subscriptionId);
  const currentCount = members.length;

  // 扣掉自己 (假設 User 永遠是預設的，但這邊我們只管額外成員或是全部成員)
  // 修正邏輯：subscription.memberCount 通常包含使用者自己。
  // 我們可以假設 subscription_members 表只存「其他成員」?
  // 或者存「所有成員」。
  // 根據 README "計算每人應分攤金額"，通常包含自己。
  // 為了方便分帳，建議存「所有要分擔的人」。
  // 如果 User 也要被追蹤 (例如自己先墊付，然後自己不用付給自己，但要算在分母)，
  // 簡單起見，我們存所有成員。

  // 調整：如果目前 DB 內沒有成員，初始化時自動建立 (targetCount) 個。

  if (currentCount < targetCount) {
    const needed = targetCount - currentCount;
    for (let i = 0; i < needed; i++) {
      await addMember(db, subscriptionId, `成員 ${currentCount + i + 1}`);
    }
  } else if (currentCount > targetCount) {
    // 刪除多餘的
    const toDelete = members.slice(targetCount);
    for (const member of toDelete) {
      await deleteMember(db, member.id);
    }
  }
}
