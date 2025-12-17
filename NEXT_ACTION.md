# 下一步行動指南

## ✅ 已完成

- 程式碼格式化 (Prettier) - 所有檔案已格式化

## 🎯 下一步：修正 TypeScript 錯誤

根據剛才的 type-check，有以下錯誤需要修正：

### 1️⃣ 修正測試檔案型別錯誤

**檔案**: `src/components/__tests__/SubscriptionCard.test.tsx`

**位置**: 第 15 行

**修改**:

```typescript
// 修改前:
category: 'entertainment',

// 修改後:
category: 'entertainment' as const,
```

**檔案**: `src/components/__tests__/AddSubscriptionModal.test.tsx`

檢查是否有類似問題並一併修正。

---

### 2️⃣ 修正 services/index.ts 型別匯出

**檔案**: `src/services/index.ts`

**問題**: `SQLiteDatabase` 型別未正確匯出

**檢查**: `src/services/database.ts` 是否有 export type

---

## 📋 修正步驟

```bash
# 1. 打開檔案修正
# 編輯 src/components/__tests__/SubscriptionCard.test.tsx
# 編輯 src/services/database.ts (如需要)

# 2. 驗證修正
npm run type-check

# 3. 確認無錯誤
# 應該看到: Found 0 errors
```

---

## 🚀 修正完成後

執行完整驗證:

```bash
npm run lint
npm run type-check
npm test
```

全部通過後，您就完成了「立即修正」階段！

---

## 📅 接下來的計畫 (選擇性)

### 本週可以做 (2-3小時)

1. 建立第一個服務測試 `src/services/__tests__/database.test.ts`
2. 執行測試確保覆蓋率提升

### 下週目標 (4-6小時)

1. 測試覆蓋率達到 40%
2. 啟用第一個 TypeScript 嚴格選項
3. 為核心函式新增 JSDoc

詳見 [next-steps.md](file:///C:/Users/USER/.gemini/antigravity/brain/e875921d-fd61-4ba0-a9fa-3df757673d8e/next-steps.md) 和 [QUICK_START.md](file:///D:/桌面資料/暫存/SubTrack/QUICK_START.md)
