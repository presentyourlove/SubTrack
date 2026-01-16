import * as SQLite from 'expo-sqlite';
import { UserSettings } from '../../types';

/**
 * 取得使用者設定
 */
export async function getUserSettings(db: SQLite.SQLiteDatabase): Promise<UserSettings | null> {
  const settings = await db.getFirstAsync<UserSettings>('SELECT * FROM user_settings WHERE id = 1');
  return settings;
}

/**
 * 更新使用者設定
 */
export async function updateUserSettings(
  db: SQLite.SQLiteDatabase,
  settings: Partial<Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  const now = new Date().toISOString();
  const fields: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const values: any[] = [];

  Object.entries(settings).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    // 處理不同類型的值
    if (typeof value === 'boolean') {
      // boolean 轉換為 INTEGER (0 或 1)
      values.push(value ? 1 : 0);
    } else if (typeof value === 'object') {
      // 物件轉換為 JSON 字串
      values.push(JSON.stringify(value));
    } else {
      values.push(value);
    }
  });

  fields.push('updatedAt = ?');
  values.push(now);

  await db.runAsync(`UPDATE user_settings SET ${fields.join(', ')} WHERE id = 1`, values);
}
