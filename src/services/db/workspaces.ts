import * as SQLite from 'expo-sqlite';
import { Workspace } from '../../types';

/**
 * 取得所有工作區
 */
export async function getWorkspaces(db: SQLite.SQLiteDatabase): Promise<Workspace[]> {
  return await db.getAllAsync<Workspace>('SELECT * FROM workspaces ORDER BY createdAt ASC');
}

/**
 * 建立新工作區
 */
export async function createWorkspace(
  db: SQLite.SQLiteDatabase,
  name: string,
  icon: string,
): Promise<number> {
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO workspaces (name, icon, isDefault, createdAt, updatedAt)
     VALUES (?, ?, 0, ?, ?)`,
    [name, icon, now, now],
  );
  return result.lastInsertRowId;
}

/**
 * 更新工作區
 */
export async function updateWorkspace(
  db: SQLite.SQLiteDatabase,
  id: number,
  name: string,
  icon: string,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(`UPDATE workspaces SET name = ?, icon = ?, updatedAt = ? WHERE id = ?`, [
    name,
    icon,
    now,
    id,
  ]);
}

/**
 * 刪除工作區 (會連帶刪除底下的訂閱，因設定了 ON DELETE CASCADE)
 * 預設工作區 (id=1) 不可刪除
 */
export async function deleteWorkspace(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  if (id === 1) {
    throw new Error('Cannot delete default workspace');
  }
  await db.runAsync('DELETE FROM workspaces WHERE id = ?', [id]);
}

/**
 * 切換當前工作區 (更新 UserSettings)
 */
export async function switchWorkspace(
  db: SQLite.SQLiteDatabase,
  workspaceId: number,
): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(`UPDATE user_settings SET currentWorkspaceId = ?, updatedAt = ? WHERE id = 1`, [
    workspaceId,
    now,
  ]);
}
