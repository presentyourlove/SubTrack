# SubTrack - 智慧訂閱管理助手 📱💰

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-Traditional_Chinese-red.svg)](src/i18n)

**SubTrack** 是一款專為現代人設計的跨平台訂閱管理應用程式。幫助您輕鬆追蹤 Netflix, Spotify, AWS 等各式週期性支出，掌握財務狀況，拒絕不明扣款！

---

## ✨ 專案亮點 (Highlights)

- **跨平台支援**：單一程式碼庫同時支援 iOS、Android 與 Web。
- **離線優先 (Offline-First)**：主要資料儲存於本地 (Op-SQLite / LocalStorage)，無網路也能順暢使用。
- **雲端同步 (Cloud Sync)**：整合 Firebase，支援多裝置間資料即時同步。
- **隱私專注**：您的資料您作主，支援隱私模式與生物辨識鎖定。
- **極致效能**：導入 JSI、FlashList 與 New Architecture，打造 60 FPS 流暢體驗。

---

## 🚀 功能特色 (Features)

- **📊 視覺化儀表板**：直觀的圖表分析每月/每年支出趨勢與分類佔比。
- **🔔 智慧提醒**：透過本地推播通知 (Local Notifications) 在扣款前提醒您，不再錯過繳費日。
- **🌍 多幣別支援**：支援 TWD, USD, JPY, EUR 等多種貨幣，自動換算匯率。
- **🌓 深色/淺色模式**：自動跟隨系統或手動切換主題，保護您的眼睛。
- **📅 日曆整合**：雙向同步 Google Calendar，隨時掌握與管理扣款排程。
- **🔐 安全驗證**：支援生物辨識 (FaceID/TouchID) 與隱私模式，隱藏敏感金額。
- **🏷️ 標籤與群組**：支援多重標籤過濾與家庭方案分帳成員管理。
- **🔍 搜尋與報表**：內建服務目錄快速訂閱、全局搜尋查找，以及自訂報表分析。
- **⚡ 捷徑操作**：支援 iOS/Android 主畫面 Quick Actions 長按捷徑。
- **📂 資料匯出入**：完整支援 CSV/PDF 匯出與 Excel 資料匯入 (背景多執行緒處理)。

---

## 💎 程式碼品質 (Code Quality)

本專案嚴格遵循業界標準與 `.agent` 規範，確保高可維護性與穩定性：

- **TypeScript Strict Mode**：全面啟用嚴格型別檢查 (no implicit any)，減少運行時錯誤。
- **ESLint + Prettier**：自動化代碼風格檢查與格式化 (LF Line Endings)，保持代碼整潔一致。
- **i18n 國際化**：所有 UI 字串提取至資源檔 (`src/i18n`)，無 Hardcoded 字串。
- **Architecture**：採用 Feature-First 分層架構，服務層 (Service) 與 UI 層分離。
- **Performance**：
  - **JSI Binding**：資料庫直接調用 C++ 層，避開 JS Bridge。
  - **FlashList**：列表渲染效能優化。
  - **Hermes Static**：啟用靜態分析優化啟動速度。

---

## 🏁 快速開始 (Quick Start)

### 前置需求 (Prerequisites)

- Node.js (LTS version recommended)
- npm or yarn

### 安裝依賴 (Installation)

```bash
git clone https://github.com/Presentyourlove/SubTrack.git
cd SubTrack
npm install
```

### 啟動開發伺服器 (Development)

```bash
# 啟動 Expo Go (通用)
npm start

# 啟動 Web 版
npm run web

# 啟動 Android 模擬器 (需安裝 Android Studio)
npm run android

# 啟動 iOS 模擬器 (需安裝 Xcode, Mac Only)
npm run ios
```

---

## 📱 支援平台 (Supported Platforms)

| 平台        | 版本需求        | 支援狀態 | 備註                                     |
| :---------- | :-------------- | :------: | :--------------------------------------- |
| **Android** | Android 6.0+    |    ✅    | 完整支援 (APK)                           |
| **iOS**     | iOS 13.0+       |    ✅    | 完整支援 (IPA / SideStore)               |
| **Web**     | Modern Browsers |    ✅    | PWA 支援 (部分原生功能如 Haptics 會降級) |

---

## 🛠️ 技術堆疊 (Tech Stack)

### Client Side

- **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 54)
- **Architecture**: New Architecture enabled (Fabric & TurboModules)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v3)
- **State Management**: React Context API & Hooks
- **Styling**: StyleSheet (Native)

### Backend & Service

- **Auth**: Firebase Authentication
- **Database (Cloud)**: Cloud Firestore
- **Database (Local)**:
  - Mobile: `@op-engineering/op-sqlite` (JSI/WAL Mode Enabled)
  - Web: `localStorage` (Adapter Pattern)
- **Sync**: Custom Bi-directional Sync Logic

### Tools

- **2026-01-20**: Comprehensive linting and type error fixes across test suite (29 files).
- **2026-01-20**: Achieved **79.22% Test Coverage**, implementing Database Migration & Web Platform consistency tests.
- **Linting**: ESLint, Prettier
- **Build**: EAS (Expo Application Services)

---

## 📂 專案結構 (Project Structure)

```text
SubTrack/
├── app/                      # Expo Router 頁面路由 (File-based Routing)
│   ├── (tabs)/               # 底部導航頁面 (Home, Reports, Settings)
│   └── _layout.tsx           # 根導航配置與 Provider 注入
├── src/
│   ├── components/           # UI 元件庫
│   │   ├── common/           # 通用原子元件 (OptimizedList, CachedImage)
│   │   ├── settings/         # 設定頁面組件
│   │   └── subscription/     # 訂閱卡片與表單
│   ├── context/              # 全域狀態 (Theme, Auth, Database, Security)
│   ├── services/             # 業務邏輯層
│   │   ├── db/               # JSI SQLite 資料庫操作 (DAO)
│   │   ├── workerService.ts  # 多執行緒處理
│   │   └── ...
│   ├── hooks/                # Custom Hooks (useSync, useBiometrics)
│   ├── types/                # TypeScript 型別定義
│   ├── utils/                # 工具函式 (Date, Currency, Haptics)
│   └── i18n/                 # 語言資源檔 (zh.ts, en.ts)
├── .maestro/                 # E2E 測試流程腳本
├── scripts/                  # 自動化工具
└── docs/                     # 專案文件
```

---

## 🤝 開發指南 (Development Guide)

1. **提交規範 (Commits)**: 請嚴格遵循 Conventional Commits：
   - `feat`: 新增功能
   - `fix`: 修復錯誤
   - `docs`: 文件變更
   - `perf`: 效能優化
   - `chore`: 建構工具或依賴更新

2. **分支策略 (Branching)**:
   - `main`: 穩定發布分支
   - `develop`: 主要開發分支
   - `feature/name`: 功能開發分支

3. **代碼檢查**: 提交前請確保通過 `npm run lint` 與 `npm run type-check`。

---

## 🧪 測試 (Testing)

### 1. 單元與整合測試 (Unit & Integration)

使用 Jest 進行邏輯測試，目前全專案覆蓋率已達 >80%：

```bash
# 執行所有測試
npm test
# 生成覆蓋率報告
npm test -- --coverage

# 監聽模式
npm test -- --watch
```

### 2. E2E 自動化測試 (End-to-End)

使用 Maestro 進行完整流程驗證：

```bash
# 安裝 Maestro CLI (macOS/Linux)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows 使用者需先安裝 WSL
# wsl --install (需系統管理員權限並重啟)
# 然後在 WSL 中執行上述 curl 指令

# 執行所有 E2E 測試
maestro test .maestro/flows/

# 執行單一測試流程
maestro test .maestro/flows/add_subscription.yaml

# 持續監控模式 (開發用)
maestro test --continuous .maestro/flows/
```

**可用測試流程：**

| 流程                    | 說明               |
| ----------------------- | ------------------ |
| `init.yaml`             | App 初始化與載入   |
| `home.yaml`             | 首頁導航與頁面切換 |
| `add_subscription.yaml` | 新增訂閱完整流程   |
| `search.yaml`           | 搜尋功能與結果驗證 |
| `settings.yaml`         | 設定頁面與主題切換 |

### 3. 各平台測試指南 (Cross-Platform Testing Guide)

> [!IMPORTANT]
> 本專案使用 **`op-sqlite`** (Native JSI Module)，**不支援** App Store / Play Store 下載的標準版 **Expo Go**。
> 您必須使用 **Development Build (開發版用戶端)** 才能掃瞄 QR Code 進行實機測試。

- **Android (APK)**
  - **模擬器**: 執行 `npm run android`。
  - **實機 (Development Build)**:
    1. 打包開發版: `eas build --profile development --platform android`
    2. 安裝 .apk 到手機。
    3. 執行 `npx expo start --dev-client` 產生 QR Code。
    4. 開發版 App 開啟後，掃描終端機的 QR Code 連線。

- **iOS (SideStore IPA)**
  - **實機 (Development Build)**:
    1. 打包開發版: `eas build --profile development --platform ios`
    2. 透過 SideStore / AltStore 安裝 .ipa。
    3. 執行 `npx expo start --dev-client` 產生 QR Code。
    4. 開發版 App 開啟後，掃描或選擇連線。
  - **模擬器 (Mac Only)**: 執行 `npm run ios`。

- **Web (PWA)**
  - 執行 `npm run web` (Op-SQLite 自動降級為 LocalStorage)。

---

## 📦 打包與發布 (Build & Release)

本專案使用 **EAS Build** 進行雲端打包。

### 1. Android APK (Release)

適用於直接安裝或上架 Play Store：

```bash
eas build -p android --profile preview
```

### 2. SideStore / AltStore IPA (iOS)

適用於側載 (Sideloading) 的 IPA 檔案：

```bash
eas build -p ios --profile preview
```

### 3. Web App (Production)

輸出靜態網站檔案至 `dist/` 目錄：

```bash
npx expo export -p web
```

---

## 📚 API 文件 (Internal Services)

由於採用 Serverless 架構，主要的服務介面位於 `src/services/`：

- **AuthService**: 處理 Firebase 登入/註冊/登出。
- **DatabaseService (Adapters)**:
  - Mobile: 透過 `src/services/db/*.ts` 封裝 SQL 指令。
  - Web: 透過 `src/services/database.web.ts` 模擬 SQL 操作。
- **SyncService**: 處理 Local SQLite 與 Firestore 的差異比對與同步。
- **WorkerService**: 在背景線程處理大型 Excel 匯入。

---

## 👤 作者 (Author)

Presentyourlove

---

## 📝 致謝 (Acknowledgments)

- 感謝 [Expo](https://expo.dev) 生態系統。
- 圖示來源：[Ionicons](https://ionic.io/ionicons)。
- 資料庫引擎：[op-sqlite](https://github.com/OP-Engineering/op-sqlite)。

---

## 🔮 後繼優化建議 (Future Roadmap)

### 🤖 V3.0 智慧化與創新 (AI & Smart Features)

- [ ] **🧩 桌面小工具 (Widgets)**: 在 iOS/Android 主畫面直接查看即將扣款項目 (基於 Expo Widget API)。

### 🔧 具體優化工程 (Engineering Improvements)

- [ ] **🚀 真・懶加載 (True Lazy Loading)**: 將 `xlsx` 與 `firebase` 改為動態導入 (`await import`)，優化啟動速度。
- [ ] **⚡ MMKV 儲存層**: 替換 `AsyncStorage`，大幅提升讀寫效能。
- [ ] **🛡️ 強型別 i18n (Typed i18n)**: 建立翻譯 Key 的型別檢查機制。
- [ ] **♿ 無障礙優化 (A11y)**: 引入自動化檢測與改善螢幕閱讀器體驗。
- [ ] **🔄 React Query**: 引入資料快取與同步管理庫。
- [ ] **🐞 錯誤監控 (Sentry Integration)**: 整合 Sentry SDK 以追蹤生產環境的 Crash 與效能問題 (目前缺席)。
- [ ] **🏎️ Context 渲染優化**: 為 `DatabaseContext` 與 `AuthContext` 的 `value` 物件加上 `useMemo`，防止非必要的 Re-renders。
- [ ] **🛡️ 環境變數驗證 (Env Validation)**: 引入 `zod` 在啟動時驗證 `process.env`，防止缺少 Config 導致的 Runtime Error。
- [ ] **📱 平台差異化拆分 (Platform Resolution)**: 重構 `src/services/index.ts`，利用 `.native.ts` 與 `.web.ts` 後綴機制取代 Runtime Check，縮減 Bundle Size 並避免 Web 端載入 Native 模組。

---

**Copyright © 2026 SubTrack. All rights reserved.**
