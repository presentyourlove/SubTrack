import { DB, Scalar } from '@op-engineering/op-sqlite';

/**
 * 適配層介面，繼承自 op-sqlite 的 DB 型別並增加 expo-sqlite 相容方法
 */
export interface SQLiteDatabaseCompat extends DB {
  getAllAsync<T>(query: string, params?: Scalar[]): Promise<T[]>;
  runAsync(query: string, params?: Scalar[]): Promise<{ lastInsertRowId: number; changes: number }>;
  execAsync(queries: string): Promise<void>;
  getFirstAsync<T>(query: string, params?: Scalar[]): Promise<T | null>;
}

/**
 * 將 op-sqlite 的 DB 實例封裝為相容 expo-sqlite API 的物件
 */
export function wrapDatabase(db: DB): SQLiteDatabaseCompat {
  const compat = db as unknown as SQLiteDatabaseCompat;

  // 封裝 getAllAsync
  compat.getAllAsync = async <T>(query: string, params: Scalar[] = []) => {
    // 使用 executeSync 達成 JSI 同步效能，但包裝在 Promise 中以相容現有介面
    const result = db.executeSync(query, params);
    return (result.rows || []) as T[];
  };

  // 封裝 runAsync
  compat.runAsync = async (query: string, params: Scalar[] = []) => {
    const result = db.executeSync(query, params);
    return {
      lastInsertRowId: result.insertId || 0,
      changes: result.rowsAffected || 0,
    };
  };

  // 封裝 execAsync
  compat.execAsync = async (queries: string) => {
    // 使用 executeSync 執行多行查詢
    db.executeSync(queries);
  };

  // 封裝 getFirstAsync
  compat.getFirstAsync = async <T>(query: string, params: Scalar[] = []) => {
    const result = db.executeSync(query, params);
    const rows = result.rows || [];
    return rows.length > 0 ? (rows[0] as unknown as T) : null;
  };

  return compat;
}
