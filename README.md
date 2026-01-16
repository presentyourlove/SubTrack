# SubTrack - 智慧訂閱管理助手 📱💰

[![React Native](https://img.shields.io/badge/React_Native-Expo-blue.svg)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-007ACC.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![i18n](https://img.shields.io/badge/i18n-Traditional_Chinese-red.svg)](src/i18n)

**SubTrack** 是一款專為現代人設計的跨平台訂閱管理應用程式。幫助您輕鬆追蹤 Netflix, Spotify, AWS 等各式週期性支出，掌握財務狀況，拒絕不明扣款！

---

## ✨ 專案亮點 (Highlights)

* **跨平台支援**：單一程式碼庫同時支援 iOS、Android 與 Web。
* **離線優先 (Offline-First)**：主要資料儲存於本地 (SQLite/LocalStorage)，無網路也能順暢使用。
* **雲端同步 (Cloud Sync)**：整合 Firebase，支援多裝置間資料即時同步。
* **隱私專注**：您的資料您作主，僅在您登入後才進行加密雲端備份。
* **極致效能**：針對移動裝置優化的輕量級架構，啟動速度快。

## 🚀 功能特色 (Features)

* **📊 視覺化儀表板**：直觀的圖表分析每月/每年支出趨勢與分類佔比。
* **🔔 智慧提醒**：透過本地推播通知 (Local Notifications) 在扣款前提醒您，不再錯過繳費日。
* **🌍 多幣別支援**：支援 TWD, USD, JPY, EUR 等多種貨幣，自動換算匯率。
* **🌓 深色/淺色模式**：自動跟隨系統或手動切換主題，保護您的眼睛。
* **📅 日曆整合**：一鍵將扣款日同步至您的手機行事曆。
* **🔐 安全驗證**：支援 Email 註冊/登入，保障資料安全。

## 💎 程式碼品質 (Code Quality)

本專案嚴格遵循業界標準與 `.agent` 規範：

* **TypeScript Strict Mode**：全面啟用嚴格型別檢查，減少運行時錯誤。
* **ESLint + Prettier**：自動化代碼風格檢查與格式化，保持代碼整潔一致。
* **i18n 國際化**：所有 UI 字串提取至資源檔，無 Hardcoded 字串 (目前支援繁體中文)。
* **Component Atomization**：元件細粒度拆分，提升重用性與可維護性。
* **Accessibility (A11y)**：遵循無障礙設計規範，支援螢幕閱讀器。
* **File Size Limits**：單一檔案不超過 300 行，函式保持單一職責。

## 🛠️ 技術堆疊 (Tech Stack)

### Client Side

* **Framework**: [React Native](https://reactnative.dev/) / [Expo](https://expo.dev/) (SDK 50+)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (v3)
* **Styling**: StyleSheet (Native) / CSS Modules (Web)
* **State Management**: React Context API & Hooks

### Backend & Service

* **Auth**: Firebase Authentication
* **Database (Cloud)**: Cloud Firestore
* **Database (Local)**: `expo-sqlite` (Native) / `localStorage` (Web)

### Tools

* **Testing**: Jest, React Native Testing Library
* **Linting**: ESLint, Prettier
* **Build**: EAS (Expo Application Services)

## 📂 專案結構 (Project Structure)

```text
SubTrack/
├── app/                      # Expo Router 頁面路由
│   ├── (tabs)/              # 底部導航頁面 (Home, Budget, Settings)
│   └── _layout.tsx          # 根導航配置
├── src/
│   ├── components/          # 可重用 UI 元件
│   │   ├── settings/        # 設定頁面專用元件
│   │   ├── subscription/    # 訂閱卡片與表單元件
│   │   └── ...
│   ├── context/            # 全域狀態 (Theme, Auth, Database)
│   ├── services/           # 業務邏輯層 (API, DB, Sync)
│   │   ├── db/             # 資料庫操作模組
│   │   └── ...
│   ├── hooks/              # Custom Hooks (useSync, etc.)
│   ├── types/              # TypeScript 型別定義
│   ├── utils/              # 工具函式庫 (Date, Currency)
│   └── i18n/              # 語言檔 (zh.ts)
├── scripts/                # 自動化工具腳本 (Compliance Scan)
└── docs/                   # 專案文件
```

## 🏁 快速開始 (Quick Start)

### 前置需求

* Node.js (LTS version recommended)
* npm or yarn

### 安裝依賴

```bash
git clone https://github.com/your-repo/SubTrack.git
cd SubTrack
npm install
```

### 啟動開發伺服器

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

## 📦 打包與發布 (Build & Release)

本專案使用 **EAS Build** 進行雲端打包，這是 Expo 推薦的最佳實踐。

### 1. Android APK

產生適用於測試的 APK 檔案：

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

### 2. iOS IPA (AltStore/Ad-hoc)

產生適用於 AltStore 或 Ad-hoc 部署的 IPA 檔案 (需 Apple Developer Account 或適當配置)：

```bash
eas build -p ios --profile preview
```

### 3. Web App (PWA)

輸出靜態網站檔案至 `dist/` 目錄，可直接部署至 Vercel/Netlify：

```bash
npx expo export -p web
```

## 🧪 測試 (Testing)

我們使用 Jest 進行單元測試與快照測試。

```bash
# 執行所有測試
npm test

# 監聽模式 (開發用)
npm test -- --watch

# 產生測試覆蓋率報告
npm test -- --coverage
```

## 📚 API 文件 (Internal Services)

由於本專案主要使用 Serverless 架構，"API" 指的是內部的 Service Layer 介面：

### `AuthService`

* `registerUser(email, password)`: 註冊新帳號
* `loginUser(email, password)`: 登入
* `syncToCloud()`: 觸發資料同步

### `DatabaseService`

* `getSubscriptions()`: 取得所有訂閱
* `addSubscription(data)`: 新增訂閱
* `getMonthlyTotal()`: 計算月支出

詳細介面定義請參閱 `src/services/` 目錄下的 `.ts` 檔案。

## 🤝 開發指南 (Development Guide)

1. **提交規範**: 請遵循 Conventional Commits (e.g., `feat: add new chart`, `fix: login bug`)。
2. **分支策略**: `main` 為穩定分支，開發請開 `feature/xxx` 分支。
3. **合規檢查**: 提交前請執行 `node scripts/scan-compliance.js` 確保無違規 (如 UTF-8 BOM, Hardcoded Strings)。

## 📝 致謝 (Acknowledgments)

* 感謝 [Expo](https://expo.dev) 提供強大的開發工具。
* 圖示來源：[Ionicons](https://ionic.io/ionicons)。

## 🔮 後繼優化建議 (Future Roadmap)

我們持續規劃讓 SubTrack 更強大，以下是未來的開發藍圖：

### 📱 功能增強 (Feature Enhancements)

* [ ] **🔐 生物辨識解鎖 (Biometric Security)**：整合 FaceID / TouchID，保護敏感的訂閱財務資訊。
* [ ] **📂 資料匯出/匯入 (Data Export/Import)**：支援 CSV/PDF 報表匯出，與 Excel 格式資料匯入。
* [ ] **🏷️ 標籤系統 (Tagging System)**：支援 `#work`, `#family` 等多重標籤，提供比單一分類更靈活的篩選。
* [ ] **📈 價格歷史追蹤 (Price History)**：記錄訂閱服務的漲價歷程，分析長期支出變化。
* [ ] **🔍 訂閱服務資料庫 (Service Catalog)**：內建 Netflix, Spotify 等熱門服務圖示與方案，一鍵快速新增。
* [ ] **📷 帳單 OCR 掃描**：拍照自動辨識帳單金額與日期，快速建立訂閱 (需整合 Vision API)。
* [ ] **👨‍👩‍👧‍👦 家庭共享 (Family Plan Support)**：針對 Spotify Family, Netflix Premium 等共享方案，計算每人應分攤金額。

### 🛠️ 技術工程優化 (Engineering)

* [ ] **⚡ 離線圖片快取 (Offline Image Caching)**：使用 `expo-image` 優化網路圖片載入體驗。
* [ ] **🧪 E2E 自動化測試 (End-to-End Testing)**：引入 Maestro 進行完整的使用者流程自動化測試。
* [ ] **🐞 錯誤監控 (Error Monitoring)**：整合 Sentry 即時捕捉線上 Crash 與錯誤。
* [ ] **📲 捷徑與整合 (Shortcuts & App Actions)**：支援 iOS/Android 主畫面長按捷徑 (Quick Actions)。
* [ ] **☁️ Google Calendar 雙向同步**：除了寫入，也支援從日曆讀取既有訂閱事件。

### 🎨 使用者體驗 (UX/UI)

* [ ] **📳 觸覺回饋 (Haptic Feedback)**：在互動操作（如滑動、開關）加入 `expo-haptics` 細微震動，提升精緻感。
* [ ] **AI 智能建議**：分析消費習慣，推薦更划算的訂閱方案（例如：提示「此訂閱使用率低，建議取消」）。
* [ ] **桌面小工具 (Widgets)**：在 iOS/Android 主畫面直接查看即將扣款項目。
* [ ] **🔍 全局搜尋 (Global Search)**：快速查找特定訂閱或歷史紀錄。
* [ ] **⌚ 穿戴裝置整合 (WatchOS/WearOS)**：在手錶上接收扣款通知與查看簡易統計。
* [ ] **📧 信件解析 (Email Parsing)**：轉寄訂閱收據至指定信箱，自動建立或更新訂閱紀錄。
* [ ] **🕶️ 隱私模式 (Privacy Mode)**：一鍵隱藏主畫面金額顯示，在公共場合也能安全查看。
* [ ] **👯‍♂️ 分帳功能 (Split Bill)**：針對共享訂閱（如 Netflix Family），自動計算並追蹤每位成員的欠款狀態。
* [ ] **🛡️ 暗網監測 (Dark Web Monitoring)**：檢查訂閱帳號密碼是否在外洩資料庫中 (整合 HaveIBeenPwned API)。
* [ ] **🗣️ 語音控制 (Voice Control)**：支援 Siri / Google Assistant 指令查詢特定訂閱或下期帳單。
* [ ] **🎫 優惠券社群 (Coupon Community)**：匿名共享可用的訂閱折扣碼或試用連結。
* [ ] **📦 訂閱組合建議 (Bundle Recommendations)**：自動偵測分散訂閱（如 iCloud + Apple Music），建議更划算的 Apple One 等組合包。
* [ ] **📊 自訂報表產生器 (Custom Report Builder)**：拖拉式介面，讓使用者定義專屬的財務分析維度。
* [ ] **🎮 遊戲化成就 (Gamification)**：達成「預算不超支」、「刪除殭屍訂閱」等目標可獲得徽章。
* [ ] **📉 使用量追蹤 (Usage Tracker)**：手動或自動 (Android) 記錄 App 開啟頻率，揪出少用的浪費項目。
* [ ] **🔌 外部整合 (Integrations)**：支援匯入/匯出至 Notion, YNAB, Excel 等生產力工具。
* [ ] **🌐 多國語言 (Localization)**：新增英文、日文、韓文介面支援，推向國際市場。
* [ ] **🤖 AI 財務助理 (AI Finance Assistant)**：內建 LLM 對話介面，直接詢問「我去年花多少錢在影音娛樂？」、「預測下個月支出」。
* [ ] **💳 虛擬卡整合 (Virtual Cards)**：整合 Privacy.com 等服務，為每個訂閱產生專屬虛擬卡，設定扣款上限以防超收。
* [ ] **🔔 漲價社群預警 (Community Pricing Alerts)**：群眾外包的價格監測，當 Netflix 或 Spotify 宣布漲價時第一時間通知。
* [ ] **🌱 數位碳足跡 (Digital Carbon Footprint)**：估算訂閱服務的數位碳排放量，推廣環境永續意識。
* [ ] **🔌 開發者 API (Public API)**：提供 REST/GraphQL API，讓進階使用者將訂閱資料整合至自己的自動化工作流 (如 Home Assistant)。

---

**Author**: SubTrack Team
**Copyright**: © 2026 SubTrack. All rights reserved.
