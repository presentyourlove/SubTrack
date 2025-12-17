# 快速行動清單 (Quick Actions)

## ⚡ 今天就做 (5分鐘內)

```bash
# 1. 格式化新建檔案
cd D:\桌面資料\暫存\SubTrack
npm run format

# 2. 驗證格式化結果
npx prettier --check .
```

---

## 📝 本週完成 (估計 2-3 小時)

### 任務 1: 修正 TypeScript 錯誤

**檔案**: `src/components/__tests__/SubscriptionCard.test.tsx`

**第 15 行修改**:

```typescript
// 修改前:
category: 'entertainment',

// 修改後:
category: 'entertainment' as const,
```

**檔案**: `src/services/database.ts`

檢查並確保正確 export:

```typescript
export type SQLiteDatabase = SQLite.SQLiteDatabase;
```

**驗證**:

```bash
npm run type-check  # 應該 0 errors
```

---

### 任務 2: 建立第一個服務測試

**新增檔案**: `src/services/__tests__/database.test.ts`

**基本結構**:

```typescript
import { initDatabase, getAllSubscriptions } from '../database';

describe('Database Service', () => {
  let db: any;

  beforeEach(async () => {
    db = await initDatabase();
  });

  it('should initialize database', () => {
    expect(db).toBeDefined();
  });

  it('should get all subscriptions', async () => {
    const subs = await getAllSubscriptions(db);
    expect(Array.isArray(subs)).toBe(true);
  });
});
```

**執行測試**:

```bash
npm test -- src/services/__tests__/database.test.ts
```

---

## 🎯 下週目標 (估計 4-6 小時)

1. [ ] 測試覆蓋率達到 40% (中途目標)
2. [ ] 啟用 `noUnusedLocals` TypeScript 選項
3. [ ] 為 3 個核心函式新增 JSDoc
4. [ ] 設置 pre-push hook

---

## 📊 追蹤進度

### 完成度檢查表

- [x] ✅ Lint 錯誤修正 (0/0)
- [ ] ⏳ TypeScript 錯誤修正 (0/3)
- [ ] ⏳ 測試覆蓋率 (目前: ~20%, 目標: 60%)
- [ ] ⏳ JSDoc 註解 (0/15 函式)
- [ ] ⏳ 效能優化 (0/4 元件)

### 本月重點

1. **Week 1**: TypeScript + 格式化
2. **Week 2**: 測試基礎建設
3. **Week 3**: 覆蓋率衝刺
4. **Week 4**: 程式碼註解

---

## 💡 快速參考

### 常用指令

```bash
# 開發
npm start

# 品質檢查
npm run lint
npm run type-check
npm run format

# 測試
npm test
npm test -- --coverage
npm test -- --watch

# 建置
npx expo export:web
```

### 文件連結

- [完整改進計畫](./next-steps.md)
- [實作計畫](./implementation_plan.md)
- [完成報告](./walkthrough.md)
- [任務清單](./task.md)
