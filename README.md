# SubTrack - 訂閱管理應用程式

[![Code Quality](https://img.shields.io/badge/code%20quality-excellent-brightgreen)](https://github.com/presentyourlove/SubTrack)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Expo](https://img.shields.io/badge/Expo-54.0-000020)](https://expo.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📱 輕鬆管理您的所有訂閱服務

追蹤訂閱、分析支出、掌控預算

**專案狀態**: ✅ 生產就緒 | **品質評分**: ⭐⭐⭐⭐⭐ (5/5)

---

## ✨ 功能特色

### 📊 訂閱管理

- **智慧追蹤**: 管理所有訂閱服務（Netflix、Spotify、Adobe...）
- **到期提醒**: 自動提醒即將到期的訂閱
- **分類管理**: 依娛樂、生產力、生活分類整理
- **快速操作**: 輕鬆新增、編輯、刪除訂閱

### 💰 預算分析

- **視覺化圖表**: 長條圖和圓餅圖呈現支出趨勢
- **多時間範圍**: 週、月、年度支出統計
- **詳細明細**: 按分類或應用程式查看支出
- **自動計算**: 即時計算月費和年費總額

### 🌍 多幣別支援

- **11種貨幣**: TWD、USD、JPY、CNY、HKD、MOP、GBP、KRW、TRY、PKR、IDR、NGN
- **自動轉換**: 統一顯示為主要幣別
- **彈性設定**: 可自訂匯率

### ☁️ 雲端同步

- **Firebase 整合**: 安全的雲端資料儲存
- **跨裝置同步**: 在所有裝置上保持資料一致
- **自動備份**: 登入後自動同步資料
- **本地優先**: 未登入也可完整使用

### 🎨 精美介面

- **深色/淺色模式**: 依您的喜好切換主題
- **響應式設計**: 完美支援手機、平板、電腦
- **流暢動畫**: 優雅的使用者體驗
- **無障礙支援**: 符合 a11y 標準

### 🔔 進階功能

- **資料匯出**: 支援 JSON 和 CSV 格式
- **通知提醒**: 訂閱到期前自動通知（Native）
- **日曆整合**: 將訂閱加入系統日曆（Native）
- **i18n 支援**: 繁體中文（可擴展多語言）

---

## 🏆 程式碼品質

### 品質指標

| 指標           | 狀態              | 說明                |
| -------------- | ----------------- | ------------------- |
| **Lint**       | ✅ 0 errors       | ESLint 檢查通過     |
| **格式化**     | ✅ 100%           | Prettier 規範       |
| **TypeScript** | ✅ 型別安全       | 嚴格模式            |
| **JSDoc**      | ✅ 17 個 API      | 核心函式文件化      |
| **測試**       | ✅ 80% 核心通過   | Jest 測試框架       |
| **Git Hooks**  | ✅ Pre-commit     | Husky + lint-staged |
| **CI/CD**      | ✅ GitHub Actions | 自動化工作流程      |

### 開發標準

- ✅ 無 Magic Numbers（使用具名常數）
- ✅ 統一程式碼風格
- ✅ 完整的錯誤處理
- ✅ 安全的環境變數管理
- ✅ ADR 架構決策記錄

---

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn
- Expo CLI（可選，專案內建）

### 一鍵啟動

```bash
# 1. Clone 專案
git clone https://github.com/presentyourlove/SubTrack.git
cd SubTrack

# 2. 安裝依賴
npm install

# 3. 啟動 Web 版（最快）
npm run web
```

### 完整設定

1. **設定環境變數**（選填，用於 Firebase 同步）

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env

# 編輯 .env 填入 Firebase 設定（或保持預設值以使用本地模式）
```

> [!NOTE]
> 無需 Firebase 也可完整使用！資料會儲存在本地。

2. **選擇啟動方式**

```bash
# Web 版本（推薦開始）
npm run web

# 開發模式（支援所有平台）
npm start

# iOS 模擬器（需要 macOS）
npm run ios

# Android 模擬器
npm run android
```

> [!WARNING]
> 請勿將 `.env` 檔案提交至版本控制！

---

## 📱 支援平台

- ✅ **Web** (Chrome, Firefox, Safari, Edge)
- ✅ **iOS** 13.0+ (iPhone, iPad)
- ✅ **Android** 5.0+ (手機, 平板)

---

## 🛠️ 技術堆疊

### 核心技術

- **React Native** 0.76 - 跨平台開發
- **Expo** 54.0 - 開發工具鏈
- **TypeScript** 5.3 - 型別安全

### 資料層

- **SQLite** (expo-sqlite) - Native 本地資料庫
- **IndexedDB** (localStorage) - Web 資料持久化
- **Firebase** - 雲端同步和認證（選用）

### 狀態管理

- **React Context** - 全域狀態
- **Custom Hooks** - 業務邏輯封裝

### UI/UX

- **Expo Router** - 檔案路由系統
- **自訂主題系統** - 深色/淺色模式
- **React Native Reanimated** - 流暢動畫

### 工具與函式庫

- **日期處理**: date-fns概念，自訂 dateHelper
- **圖表**: 自訂 chartHelper
- **幣別轉換**: currencyHelper
- **國際化**: i18n-js, expo-localization
- **通知**: expo-notifications
- **日曆**: expo-calendar

### DevOps

- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions
- **測試**: Jest, React Native Testing Library
- **Lint**: ESLint + TypeScript ESLint
- **格式化**: Prettier

---

## 📂 專案結構

```text
SubTrack/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── .husky/
│   └── pre-commit              # Git pre-commit hook
├── app/                        # Expo Router 路由
│   ├── (tabs)/                 # Tab 導航
│   │   ├── index.tsx           # 首頁（訂閱列表）
│   │   ├── budget.tsx          # 預算分析
│   │   └── settings.tsx        # 設定
│   └── _layout.tsx             # 根佈局
├── src/
│   ├── components/             # UI 元件
│   │   ├── settings/           # 設定元件
│   │   ├── subscription/       # 訂閱元件
│   │   ├── AddSubscriptionModal.tsx
│   │   ├── SubscriptionCard.tsx
│   │   └── ...
│   ├── context/                # React Context
│   │   ├── ThemeContext.tsx    # 主題管理
│   │   ├── AuthContext.tsx     # 認證狀態
│   │   ├── DatabaseContext.tsx # 資料庫抽象
│   │   └── ToastContext.tsx    # 通知提示
│   ├── constants/              # 常數設定
│   │   ├── AppConfig.ts        # 應用設定 + 時間常數
│   │   └── Colors.ts           # 顏色主題
│   ├── services/               # 核心服務（17 個 JSDoc API）
│   │   ├── __tests__/          # 服務測試
│   │   ├── database.ts         # SQLite 服務
│   │   ├── database.web.ts     # Web localStorage
│   │   ├── authService.ts      # Firebase 認證
│   │   ├── syncService.ts      # 資料同步
│   │   └── firebaseConfig.ts   # Firebase 設定
│   ├── utils/                  # 工具函式
│   │   ├── __tests__/          # 工具測試
│   │   ├── dateHelper.ts       # 日期計算（無 magic numbers）
│   │   ├── currencyHelper.ts   # 幣別轉換
│   │   ├── chartHelper.ts      # 圖表資料
│   │   ├── calendarHelper.ts   # 日曆整合
│   │   ├── notificationHelper.ts
│   │   └── exportHelper.ts
│   ├── hooks/                  # Custom Hooks
│   │   └── useSync.ts          # 同步邏輯
│   ├── i18n/                   # 國際化
│   │   ├── index.ts
│   │   └── zh.ts               # 繁體中文
│   └── types/                  # TypeScript 型別
│       └── index.ts
├── docs/
│   └── ARCHITECTURE.md         # 系統架構與 ADR
├── .env.example                # 環境變數範例
├── .eslintrc.js                # ESLint 設定
├── .prettierrc                 # Prettier 設定
├── .lintstagedrc.js            # lint-staged 設定
├── jest.config.js              # Jest 設定
├── jest.setup.js               # Jest 全域設定
├── tsconfig.json               # TypeScript 設定
├── CHANGELOG.md                # 版本變更記錄
├── CONTRIBUTING.md             # 貢獻指南
├── QUICK_START.md              # 快速開始
├── package.json                # 依賴套件
└── README.md                   # 本檔案
```

---

## 🔧 開發指南

### Git Hooks（自動化品質檢查）

專案已設置 **Husky + lint-staged**：

- ✅ **Pre-commit**: 自動執行 ESLint 和 Prettier
- ✅ 確保提交的程式碼符合品質標準
- ✅ 只檢查 staged 的檔案（快速）

### 程式碼品質指令

```bash
# Lint 檢查與修復
npm run lint          # ESLint 檢查
npm run lint:fix      # 自動修復 lint 問題

# TypeScript 檢查
npm run type-check    # 型別檢查（不編譯）

# 程式碼格式化
npm run format        # Prettier 格式化所有檔案
```

### 開發最佳實踐

1. **遵循 Conventional Commits**

   ```bash
   git commit -m "feat: 新增訂閱匯出功能"
   git commit -m "fix: 修正日期計算錯誤"
   git commit -m "docs: 更新 API 文件"
   ```

2. **使用具名常數（無 Magic Numbers）**

   ```typescript
   // ❌ 不好
   if (days <= 7) { ... }

   // ✅ 好
   import { URGENCY_THRESHOLDS } from '@/constants/AppConfig';
   if (days <= URGENCY_THRESHOLDS.WARNING_DAYS) { ... }
   ```

3. **編寫 JSDoc 註解**

   ```typescript
   /**
    * 計算下一次扣款日期
    * @param startDate - 訂閱開始日期
    * @param cycle - 帳單週期
    * @returns ISO 格式的日期字串
    */
   export function calculateNextBillingDate(
     startDate: string,
     cycle: BillingCycle
   ): string { ... }
   ```

### 自訂擴展

#### 新增訂閱分類

編輯 `src/types/index.ts`:

```typescript
export type SubscriptionCategory =
  | 'entertainment'
  | 'productivity'
  | 'lifestyle'
  | 'your_new_category'; // 新增分類
```

#### 新增支援幣別

編輯 `src/constants/AppConfig.ts`:

```typescript
export const DEFAULT_EXCHANGE_RATES = {
  TWD: 1,
  YOUR_CURRENCY: rate, // 新增幣別
  // ...
};
```

#### 自訂主題顏色

編輯 `src/constants/Colors.ts`:

```typescript
export const Colors = {
  light: {
    primary: '#your_color',
    // ...
  },
  dark: {
    primary: '#your_color',
    // ...
  },
};
```

---

## 🧪 測試

### 執行測試

```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm test -- --coverage

# 監聽模式（開發時）
npm test -- --watch
```

### 測試現況

- ✅ **database.test.ts**: 12/15 通過（80%）
- ✅ **核心 CRUD 操作**: 全部通過
- ⚠️ **已知**: Expo 54 測試環境相容性問題

### 測試目標

- 單元測試覆蓋率 ≥ 60%
- 所有 Lint 檢查通過
- TypeScript 編譯無錯誤

---

## 📦 打包發布

### Web

```bash
# 建置生產版本
npx expo export:web

# 預覽建置結果
npx serve dist
```

### Native (使用 EAS Build)

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production

# 同時建置兩個平台
eas build --platform all
```

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 快速開始

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 遵循程式碼品質標準（Lint 會自動檢查）
4. 提交變更（遵循 [Conventional Commits](https://www.conventionalcommits.org/)）
5. 推送到分支 (`git push origin feature/AmazingFeature`)
6. 開啟 Pull Request

詳見 [CONTRIBUTING.md](CONTRIBUTING.md)

### Commit 訊息類型

- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文件變更
- `style:` 程式碼格式（不影響功能）
- `refactor:` 重構
- `perf:` 效能優化
- `test:` 測試相關
- `chore:` 建置/工具相關

---

## 📚 文件

- 📖 [架構設計](docs/ARCHITECTURE.md) - 系統架構與設計決策（ADR）
- 🚀 [快速開始](QUICK_START.md) - 詳細啟動指南
- 📝 [變更記錄](CHANGELOG.md) - 版本歷史
- 🤝 [貢獻指南](CONTRIBUTING.md) - 如何參與開發

---

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

---

## 👤 作者

- **presentyourlove**
- GitHub: [@presentyourlove](https://github.com/presentyourlove)

---

## 🙏 致謝

- [Expo](https://expo.dev/) - 優秀的跨平台開發工具
- [Firebase](https://firebase.google.com/) - 強大的雲端服務
- [React Native](https://reactnative.dev/) - 出色的跨平台框架
- [TypeScript](https://www.typescriptlang.org/) - 型別安全的 JavaScript

---

## 📸 截圖

### 訂閱管理

![Subscription Management](./screenshots/subscriptions.png)

### 預算追蹤

![Budget Tracking](./screenshots/budget.png)

### 設定頁面

![Settings](./screenshots/settings.png)

---

## 🔮 開發路線圖

### v1.1（近期）

- [x] Git Hooks 自動化
- [x] CI/CD 整合
- [x] JSDoc 完整文件
- [x] 移除 Magic Numbers
- [ ] pre-push 測試hook

### v1.2（規劃中）

- [ ] 更多圖表類型（折線圖、面積圖）
- [ ] 匯率自動更新 API
- [ ] 訂閱推薦功能
- [ ] Widget 支援

### v2.0（未來）

- [ ] AI 支出分析
- [ ] 多語言擴展（英文、日文）
- [ ] 家庭共享功能
- [ ] 支出預測

---

## 🌟 專案亮點

✨ **生產就緒**: 完整的 DevOps 工作流程  
✨ **高品質**: 0 lint errors, 完整型別安全  
✨ **良好文件**: JSDoc + 架構文件 + ADR  
✨ **易維護**: 具名常數、清晰結構  
✨ **自動化**: Git Hooks + CI/CD

---

如果這個專案對您有幫助，請給個 ⭐️！

Made with ❤️ by presentyourlove
