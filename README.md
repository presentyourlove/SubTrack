# SubTrack - 訂閱管理應用程式

## 📱 輕鬆管理您的所有訂閱服務

追蹤訂閱、分析支出、掌控預算

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

- **8種貨幣**: TWD、USD、JPY、CNY、HKD、MOP、GBP、KRW
- **自動轉換**: 統一顯示為主要幣別
- **彈性設定**: 可自訂匯率

### ☁️ 雲端同步

- **Firebase 整合**: 安全的雲端資料儲存
- **跨裝置同步**: 在所有裝置上保持資料一致
- **自動備份**: 登入後自動同步資料

### 🎨 精美介面

- **深色/淺色模式**: 依您的喜好切換主題
- **響應式設計**: 完美支援手機、平板、電腦
- **流暢動畫**: 優雅的使用者體驗

### 🔔 進階功能

- **資料匯出**: 支援 JSON 和 CSV 格式
- **通知提醒**: 訂閱到期前自動通知（Native）
- **日曆整合**: 將訂閱加入系統日曆（Native）

---

## 🚀 快速開始

### 前置需求

- Node.js 18+
- npm 或 yarn
- Expo CLI

### 安裝步驟

1. **Clone 專案**

```bash
git clone https://github.com/presentyourlove/SubTrack.git
cd SubTrack
```

1. **安裝依賴**

```bash
npm install --legacy-peer-deps
```

1. **設定環境變數**

複製 `.env.example` 並填入您的 Firebase 設定：

```bash
cp .env.example .env
# 編輯 .env 檔案，填入真實的 Firebase 金鑰
```

> [!WARNING]
> 請勿將 `.env` 檔案提交至版本控制！此檔案已在 `.gitignore` 中排除。

1. **啟動應用程式**

```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

---

## 📱 支援平台

- ✅ **Web** (Chrome, Firefox, Safari)
- ✅ **iOS** (iPhone, iPad)
- ✅ **Android** (手機, 平板)

---

## 🛠️ 技術堆疊

### 前端框架

- **React Native** - 跨平台開發
- **Expo** - 開發工具鏈
- **TypeScript** - 型別安全

### 資料層

- **SQLite** - Native 平台本地資料庫
- **localStorage** - Web 平台資料持久化
- **Firebase** - 雲端同步和認證

### UI/UX

- **Expo Router** - 檔案路由系統
- **React Context** - 狀態管理
- **自訂主題系統** - 深色/淺色模式

### 工具函式

- 日期計算和格式化
- 幣別轉換
- 圖表資料處理

### 其他

- **國際化**: i18n-js, expo-localization
- **測試**: Jest, React Native Testing Library (建置中)

---

## 📂 專案結構

```text
SubTrack/
├── app/                    # Expo Router 路由
│   ├── (tabs)/            # Tab 導航頁面
│   │   ├── index.tsx      # 訂閱管理
│   │   ├── budget.tsx     # 預算追蹤
│   │   └── settings.tsx   # 設定
│   └── _layout.tsx        # 根佈局
├── src/
│   ├── components/        # UI 元件
│   │   ├── settings/      # 設定頁面元件
│   │   ├── subscription/  # 訂閱功能元件
│   │   ├── AddSubscriptionModal.tsx
│   │   ├── SubscriptionCard.tsx
│   │   ├── SummaryCard.tsx
│   │   └── ...
│   ├── context/           # React Context
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── DatabaseContext.tsx
│   ├── constants/         # 常數設定 (AppConfig)
│   ├── services/          # 資料服務
│   │   ├── database.ts          # SQLite
│   │   ├── database.web.ts      # localStorage
│   │   ├── firebaseConfig.ts    # Firebase 設定
│   │   ├── authService.ts       # 認證服務
│   │   └── syncService.ts       # 同步服務
│   ├── utils/             # 工具函式
│   │   ├── dateHelper.ts
│   │   ├── currencyHelper.ts
│   │   ├── chartHelper.ts
│   │   ├── exportHelper.ts
│   │   ├── notificationHelper.ts
│   │   └── calendarHelper.ts
│   ├── i18n/              # 國際化資源
│   │   ├── index.ts
│   │   └── zh.ts
│   ├── types/             # TypeScript 型別
│   │   └── index.ts
│   └── constants/         # 常數
│       └── Colors.ts
├── .env                   # 環境變數
├── app.json              # Expo 設定
├── package.json          # 依賴套件
└── README.md             # 本檔案
```

---

## 🔧 開發指南

### Git Hooks

專案已設置 Husky + lint-staged:

- **Pre-commit**: 自動執行 ESLint 和 Prettier
- 確保提交的程式碼符合品質標準

### 程式碼品質檢查

```bash
npm run lint       # ESLint 檢查
npm run lint:fix   # 自動修正 Lint 錯誤
npm run type-check # TypeScript 型別檢查
npm run format     # Prettier 格式化
```

### 新增訂閱分類

編輯 `src/types/index.ts`:

```typescript
export type SubscriptionCategory =
  | 'entertainment'
  | 'productivity'
  | 'lifestyle'
  | 'your_new_category';
```

### 新增支援幣別

編輯 `src/constants/AppConfig.ts`:

```typescript
export const DEFAULT_EXCHANGE_RATES = {
  TWD: 1,
  YOUR_CURRENCY: rate,
  // ...
};
```

### 自訂主題顏色

編輯 `src/constants/Colors.ts`:

```typescript
export const Colors = {
  light: {
    // 自訂淺色主題
  },
  dark: {
    // 自訂深色主題
  },
};
```

---

## 🧪 測試

```bash
# 執行所有測試
npm test

# 執行測試並生成覆蓋率報告
npm test -- --coverage

# 程式碼品質檢查
npm run lint        # ESLint
npm run type-check  # TypeScript
npm run format      # Prettier
```

### 測試目標

- ✅ 單元測試覆蓋率 ≥ 60%
- ✅ 所有 Lint 檢查通過
- ✅ TypeScript 編譯無錯誤

> ⚠️ 注意：Expo 52 (Beta) 環境可能有相容性問題

---

## 📦 打包發布

### Web

```bash
npx expo export:web
```

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！詳見 [CONTRIBUTING.md](CONTRIBUTING.md)

### 快速開始

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (遵循 [Conventional Commits](https://www.conventionalcommits.org/))
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

### Commit 訊息規範

- `feat:` 新功能
- `fix:` 錯誤修復
- `docs:` 文件變更
- `style:` 程式碼格式
- `refactor:` 重構
- `test:` 測試相關
- `chore:` 建置/工具相關

---

## 📄 授權

本專案採用 MIT 授權 - 詳見 [LICENSE](LICENSE) 檔案

---

## 👤 作者

- **Your Name**

- GitHub: [@presentyourlove](https://github.com/presentyourlove)

---

## 🙏 致謝

- [Expo](https://expo.dev/) - 優秀的開發平台
- [Firebase](https://firebase.google.com/) - 雲端服務
- [React Native](https://reactnative.dev/) - 跨平台框架

---

## 📸 截圖

### 訂閱管理

![Subscription Management](./screenshots/subscriptions.png)

### 預算追蹤

![Budget Tracking](./screenshots/budget.png)

### 設定頁面

![Settings](./screenshots/settings.png)

---

## 🔮 未來計劃

- [ ] 更多圖表類型
- [ ] 匯率自動更新
- [ ] 訂閱推薦功能
- [x] 多語言支援 (繁體中文)
- [ ] Widget 支援

---

如果這個專案對您有幫助，請給個 ⭐️！

Made with ❤️ by presentyourlove
