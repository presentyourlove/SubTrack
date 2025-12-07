# SubTrack 訂閱管理應用程式 - 實作計畫

## 專案概述

根據設計草圖,建立一個跨平台的訂閱管理應用程式,協助使用者追蹤和管理各種訂閱服務。

**平台支援**:

- 📱 iOS (原生 App)
- 🤖 Android (原生 App)
- 🌐 Web (網頁版)

**核心功能**:

- 📋 訂閱管理 (主頁面)
- 📊 預算追蹤 (新增頁面)
- 💱 幣別選擇 (使用者偏好)

**技術選擇**: React Native + Expo (與 AIFinanceApp 相同架構)

---

## 功能需求分析

### 1. 首頁總覽區塊

**每月總支出費用卡片** (深色背景)

- 顯示當月總支出金額 (例: $3,468 / 月)
- 顯示活躍訂閱數量 (例: 4)
- 顯示預估年支出 (例: $41,616)

**即將扣款提醒卡片** (淺色背景)

- 警告圖示
- 顯示即將扣款的訂閱數量 (例: 有 2 筆款項將在 3 天內到期)
- 提示使用者確認戶頭餘額

### 2. 訂閱列表

**分類標籤**

- 全部
- 娛樂
- 生產力
- 生活/其他

**訂閱卡片資訊**

- 服務圖示 (emoji 或圖片)
- 服務名稱 (例: Netflix Premium)
- 分類標籤 (例: 娛樂)
- 價格 (例: 390 NTD / 月)
- 下次扣款日期 (例: 2025年12月9日)
- 到期提醒標籤 (例: 剩餘 2 天、剩餘 5 天、剩餘 15 天)
  - 不同顏色區分緊急程度:
    - 紅色: 1-3 天
    - 橘色: 4-7 天
    - 綠色: 8+ 天

**卡片操作按鈕**

- 📅 加到日曆
- ✏️ 編輯
- 🗑️ 刪除

### 3. 新增訂閱功能

**必填欄位**

- 訂閱名稱
- 圖示選擇 (emoji)
- 價格
- 幣別 (NTD / USD / JPY 等)
- 扣款週期 (月 / 年)
- 下次扣款日期
- 分類 (娛樂 / 生產力 / 生活/其他)

### 4. 預算追蹤頁面 (新增)

**時間範圍選擇**

- 週 (本週支出)
- 月 (本月支出)
- 年 (全年支出)

**視覺化圖表**

- 長條圖: 顯示每週/月/年的趨勢
- 圓餅圖: 顯示分類占比

**資料分類顯示**

- 按分類顯示: 娛樂、生產力、生活/其他
  - 每個分類的總金額
  - 占總預算百分比
- 按應用程式顯示: 列出所有訂閱服務
  - 服務名稱 + 圖示
  - 個別費用
  - 占比

### 5. 幣別設定

**使用者偏好設定**

- 主要幣別選擇 (NTD, USD, JPY, CNY, HKD, EUR, GBP 等)
- 所有金額顯示自動轉換為主要幣別
- 匯率設定 (可手動輸入或 API 自動更新)

---

## UI/UX 設計規範

### 配色方案

**深色主題** (預設)

- 背景: 深灰/黑色 (#1a1a1a)
- 卡片: 深灰 (#2d2d2d)
- 主要文字: 白色 (#ffffff)
- 次要文字: 淺灰 (#a0a0a0)
- 強調色: 藍紫色 (#6366f1)

**卡片顏色**

- 淺黃色: 即將到期 (1-3天)
- 淺橘色: 近期到期 (4-7天)
- 淺綠色: 安全期 (8+天)
- 淺灰色: 其他

### 元件設計

**訂閱卡片**

- 圓角設計 (12px)
- 陰影效果
- 左側圖示區域
- 右上角到期標籤
- 底部操作按鈕列

**按鈕樣式**

- 主要按鈕: 藍紫色背景 + 白色文字
- 次要按鈕: 透明背景 + 邊框
- 圖示按鈕: 灰色圖示 + hover 效果

---

## 技術架構

### 前端框架

- **React Native** + **Expo** (v52)
- **TypeScript**
- **Expo Router** (檔案路由)

### 資料儲存

- **Native**: SQLite (本地資料庫)
- **Web**: localStorage (瀏覽器儲存)
- **雲端同步**: Firebase Firestore
  - 使用者認證 (Firebase Authentication)
  - 跨裝置資料同步
  - 即時資料更新

### 專案結構

```
SubTrack/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # 主頁面 (訂閱列表)
│   │   ├── budget.tsx         # 預算追蹤頁面
│   │   └── settings.tsx       # 設定頁面 (幣別選擇)
│   ├── _layout.tsx            # 根佈局
│   └── index.tsx              # 入口重定向
├── src/
│   ├── components/
│   │   ├── SubscriptionCard.tsx    # 訂閱卡片
│   │   ├── SummaryCard.tsx         # 總覽卡片
│   │   ├── AlertCard.tsx           # 提醒卡片
│   │   ├── BudgetChart.tsx         # 預算圖表
│   │   ├── CategoryBreakdown.tsx   # 分類明細
│   │   └── AddSubscriptionModal.tsx # 新增訂閱彈窗
│   ├── services/
│   │   ├── database.ts        # SQLite (Native)
│   │   ├── database.web.ts    # localStorage (Web)
│   │   ├── firebaseConfig.ts  # Firebase 設定
│   │   └── sync.ts            # 雲端同步邏輯
│   ├── utils/
│   │   ├── dateHelper.ts      # 日期計算
│   │   ├── currencyHelper.ts  # 幣別轉換
│   │   └── chartHelper.ts     # 圖表資料處理
│   ├── context/
│   │   ├── ThemeContext.tsx   # 主題管理
│   │   └── CurrencyContext.tsx # 幣別管理
│   └── types.ts               # TypeScript 型別
└── assets/
    └── images/                # 圖示資源
```

---

## 資料模型

### Subscription 型別

```typescript
interface Subscription {
  id: number;
  name: string;              // 訂閱名稱
  icon: string;              // emoji 或圖片路徑
  category: 'entertainment' | 'productivity' | 'lifestyle';
  price: number;             // 價格
  currency: string;          // 幣別 (NTD, USD, JPY...)
  billingCycle: 'monthly' | 'yearly';
  nextBillingDate: string;   // ISO 日期格式
  createdAt: string;
  updatedAt: string;
}

interface UserSettings {
  id: number;
  mainCurrency: string;      // 主要幣別
  exchangeRates: {           // 匯率設定
    [currency: string]: number;
  };
  theme: 'light' | 'dark';
}

// 預設幣別設定 (以台幣為基準)
const DEFAULT_CURRENCY_SETTINGS: UserSettings = {
  id: 1,
  mainCurrency: 'TWD',
  exchangeRates: {
    'TWD': 1,           // 新台幣
    'USD': 0.031856,    // 美金
    'JPY': 4.975311,    // 日圓
    'CNY': 0.225357,    // 人民幣
    'HKD': 0.24801,     // 港幣
    'MOP': 0.255819,    // 澳門幣
    'GBP': 0.024070,    // 英鎊
    'KRW': 46.75543     // 韓元
  },
  theme: 'dark'
};
```

---

## 實作階段

### Phase 1: 專案初始化

- [x] 建立 Expo 專案
- [x] 設定 TypeScript
- [x] 建立 GitHub Repository
- [x] 設定 .gitignore (忽略 node_modules, .expo, dist 等)
- [x] 首次 commit 並 push 至 GitHub
- [x] 建立基本路由結構
- [x] 設定主題系統

### Phase 2: 資料層 ✅

- [x] 建立 SQLite 資料庫 (Native)
- [x] 建立 localStorage 實作 (Web)
- [x] 設定 Firebase (Authentication + Firestore)
- [x] 實作 CRUD 操作
- [x] 建立雲端同步邏輯
- [x] 建立日期計算工具
- [x] 建立幣別轉換工具
- [x] 建立圖表資料處理工具

### Phase 3: UI 元件 ✅

- [x] SummaryCard (總覽卡片)
- [x] AlertCard (提醒卡片)
- [x] SubscriptionCard (訂閱卡片)
- [x] AddSubscriptionModal (新增彈窗)
- [x] 分類標籤列
- [x] BudgetChart (預算圖表元件)
- [x] CategoryBreakdown (分類明細元件)

### Phase 4: 核心功能 ✅

(所有功能已整合至三個 Tab 頁面)

**訂閱管理**

- [x] 訂閱列表顯示
- [x] 新增訂閱
- [x] 編輯訂閱
- [x] 刪除訂閱
- [x] 分類篩選
- [x] 總金額計算
- [x] 到期提醒邏輯

**預算追蹤頁面**

- [x] 週/月/年時間範圍切換
- [x] 長條圖趨勢圖表
- [x] 圓餅圖分類占比
- [x] 按分類顯示明細
- [x] 按應用程式顯示明細

**幣別管理**

- [x] 主要幣別選擇
- [x] 匯率設定
- [x] 自動幣別轉換顯示

### Phase 5: 進階功能 ✅

- [x] 主題切換
- [x] 匯出資料
- [x] 通知提醒
- [x] 加到日曆

### Phase 6: 測試與優化 ✅

- [x] 功能測試
- [x] 同步測試 (多裝置)
- [x] 圖表效能測試
- [x] 響應式設計調整
- [x] 效能優化
- [x] 打包發布
- [x] 更新 GitHub README

---

## 🎉 專案完成 (100%)

所有 6 個階段已完成，SubTrack 已準備好發布！

### Phase 5: 雲端同步功能

- [ ] Firebase 使用者登入/註冊
- [ ] 自動同步至雲端
- [ ] 跨裝置資料同步
- [ ] 衝突解決機制

### Phase 6: 進階功能

- [ ] 加到日曆 (iOS/Android Calendar API)
- [ ] 通知提醒 (Expo Notifications)
- [ ] 匯出資料 (CSV)
- [ ] 深色/淺色主題切換

### Phase 7: 測試與優化

- [ ] 功能測試
- [ ] 同步測試 (多裝置)
- [ ] 響應式設計調整
- [ ] 效能優化
- [ ] 打包發布

---

## 預估時程

- **Phase 1-2**: 1-2 天 (專案架構 + 資料層)
- **Phase 3**: 3-4 天 (UI 元件開發)
- **Phase 4**: 3-4 天 (核心功能 + 預算追蹤)
- **Phase 5**: 2-3 天 (雲端同步)
- **Phase 6**: 1-2 天 (進階功能)
- **Phase 7**: 1 天 (測試優化)

**總計**: 約 11-16 天

---

## 注意事項

> [!IMPORTANT]
>
> 1. 使用與 AIFinanceApp 相同的技術架構,可重用 Firebase 同步程式碼
> 2. Firebase 同步為核心功能,確保跨裝置資料一致性
> 3. 本地資料庫作為快取,雲端為主要資料來源
> 4. 需要設定 Firebase 專案並配置環境變數
> 5. **GitHub 版本控制**: 專案將上傳至 GitHub,方便雲端存取和協作開發

---

## GitHub 版本控制設定

### Repository 設定

1. **建立 GitHub Repository**

   ```bash
   # 在 GitHub 上建立新的 repository: SubTrack
   # 本地初始化
   cd F:\project\SubTrack
   git init
   git add .
   git commit -m "Initial commit: SubTrack project setup"
   git branch -M main
   git remote add origin https://github.com/[username]/SubTrack.git
   git push -u origin main
   ```

2. **建議的 .gitignore**

   ```gitignore
   # dependencies
   node_modules/
   
   # Expo
   .expo/
   dist/
   web-build/
   .firebase/
   
   # Native
   *.orig.*
   *.jks
   *.p8
   *.p12
   *.key
   *.mobileprovision
   
   # Environment
   .env
   .env*.local
   
   # Debug
   npm-debug.*
   yarn-debug.*
   
   # OS
   .DS_Store
   Thumbs.db
   ```

3. **分支策略**
   - `main` - 穩定版本
   - `develop` - 開發分支
   - `feature/*` - 功能分支

### 優勢

- ☁️ **雲端備份**: 程式碼安全儲存於 GitHub
- 💻 **隨時隨地編輯**: 任何裝置都可 clone 並繼續開發
- 🔄 **版本控制**: 追蹤每次修改,可回溯歷史版本
- 🤝 **協作開發**: 支援多人協作開發

> [!TIP]
> 建議先完成 Phase 1-4,建立 MVP (最小可行產品),再根據使用回饋決定是否實作 Phase 5 的進階功能。
