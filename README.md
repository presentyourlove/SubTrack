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
* **🏷️ 標籤與群組**：支援多重標籤、多工作區隔離與家庭方案分帳管理。
* **🔍 搜尋與報表**：內建服務目錄快速訂閱、全局搜尋查找，以及自訂報表分析。
* **☕ 價值換算**：將支出換算為「工時」或「星巴克」，讓花費更有感。
* **📂 資料匯出入**：完整支援 CSV/PDF 匯出與 Excel 資料匯入。

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

## 🔄 Recent Updates (2025-01-23)

* **Maintenance**: Comprehensive update to fix linting errors, resolve type safety issues, and correct logic bugs in Reports and Search.
* **Haptic Feedback**: Integrated tactile responses for a better user experience.
* **Privacy & Localization**: Added Privacy Mode and Traditional Chinese support.

## 🔮 後繼優化建議 (Future Roadmap)

我們持續規劃讓 SubTrack 更強大，以下是未來的開發藍圖，涵蓋功能、體驗、安全與極致的技術追求：

* [x] **📳 觸覺回饋 (Haptic Feedback)**：在互動操作（如滑動、開關）加入 `expo-haptics` 細微震動，提升精緻感。

* [x] **️ 隱私模式 (Privacy Mode)**：一鍵隱藏主畫面金額顯示，在公共場合也能安全查看。
* [x] **🌐 多國語言 (Localization)**：新增英文介面支援，推向國際市場。

* [ ] **🧩 桌面小工具 (Widgets)** (V3)：在 iOS/Android 主畫面直接查看即將扣款項目。

### �️ 安全與隱私 (Security & Privacy)

* [ ] **🔐 生物辨識解鎖 (Biometric Security)**：整合 FaceID / TouchID，保護敏感的訂閱財務資訊。
* [ ] **🛡️ 暗網監測 (Dark Web Monitoring)**：檢查訂閱帳號密碼是否在外洩資料庫中 (整合 HaveIBeenPwned API)。
* [ ] **� 量子抗性加密 (Post-Quantum Cryptography)**：採用與 NIST 標準相容的加密演算法，抵禦未來量子電腦夠算力破解的風險。

### 🛠️ 工程與架構 (Engineering & DevOps)

* [ ] **⚡ 離線圖片快取 (Offline Image Caching)**：使用 `expo-image` 優化網路圖片載入體驗。
* [ ] **🧪 E2E 自動化測試 (End-to-End Testing)**：引入 Maestro 進行完整的使用者流程自動化測試。
* [ ] **� 錯誤監控 (Error Monitoring)**：整合 Sentry 即時捕捉線上 Crash 與錯誤。
* [ ] **� 捷徑與整合 (Shortcuts & App Actions)**：支援 iOS/Android 主畫面長按捷徑 (Quick Actions)。
* [ ] **☁️ Google Calendar 雙向同步**：除了寫入，也支援從日曆讀取既有訂閱事件。
* [ ] **🐳 自架後端支援 (Self-Hosted/Docker)**：提供 Docker Image，讓用戶將資料庫從 Firebase 遷移至自家的 NAS 或 VPS。

### 🚀 極致效能優化 (Performance Mastery)

我們致力於挑戰移動運算的極限，以下技術將確保 SubTrack 成為市面上最流暢的應用：

* **基礎優化**
  * [ ] **⚡ FlashList 遷移**：導入 Shopify FlashList，維持千筆資料 60 FPS 捲動。
  * [ ] **🔥 JSI 直接綁定**：使用 C++ 直接呼叫 SQLite，提升資料庫讀寫 10x。
  * [ ] **🏗️ New Architecture**：全面啟用 Fabric (UI) 與 TurboModules。
  * [ ] **📦 智慧分包 (Bundle Splitting)**：大幅縮減 App 首屏載入體積。
  * [ ] **🏎️ Hermes 靜態優化**：啟用 Static Hermes 達成接近原生的啟動速度。
  * [ ] **🖼️ 圖片客戶端壓縮**：上傳前進行 WebP 壓縮，減少傳輸流量。
  * [ ] **� SQLite WAL 模式**：大幅提升資料庫並發讀寫能力。

* **進階技術**
  * [ ] **� 多執行緒運算**：將數據處理移至 Worker Threads，釋放 UI 執行緒。
  * [ ] **🎨 Skia 繪圖引擎**：引入 GPU 加速的 120Hz 絲滑圖表動畫。
  * [ ] **🚀 HTTP/3 (QUIC)**：在弱網環境下減少 30% 連線延遲。
  * [ ] **⚡ MMKV 全面替代**：以 mmap 技術實現 100x 存儲讀寫加速。
  * [ ] **🔢 Protobuf 傳輸**：縮減 API Payload 體積並提升 5x 解析速度。
  * [ ] **♻️ 自定義物件池**：減少 Garbage Collection 觸發頻率。
  * [ ] **🔮 預測性網路預載**：AI 預判動作提前請求，達成零延遲體感。

* **前沿研究 (Research-Grade)**
  * [ ] **🧬 CRDTs 自動衝突解決**：達成多裝置離線編輯的完美合併。
  * [ ] **🌊 Bytecode Streaming**：下載同時解析 JS，消除等待時間。
  * [ ] **🌋 Vulkan/Metal 直接渲染**：繞過中間層榨乾 GPU 效能。
  * [ ] **📏 Zero-Copy (FlatBuffers)**：無需解碼的極速數據存取。
  * [ ] **🧊 ASTC 紋理壓縮**：減少 VRAM 佔用並提升渲染頻寬。
  * [ ] **🔥 CPU 時脈預先排程**：微秒級拉升頻率消除操作延遲。
  * [ ] **⚡ 預編譯著色器**：根除首次執行的動畫卡頓。
  * [ ] **🕺 完全離線主執行緒**：UI 邏輯與 JS 徹底分離，保障 120Hz 響應。
  * [ ] **🧮 形式化驗證 (Formal Verification)**：數學證明演算法正確性，移除 Runtime Check。
  * [ ] **🧠 數據導向設計 (ECS)**：優化 CPU Cache 命中率。
  * [ ] **🧊 晶片級指令特化 (NPU)**：硬體加速神經網路運算。

---

**Author**: SubTrack Team
**Copyright**: © 2026 SubTrack. All rights reserved.
