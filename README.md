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
* [ ] **🧩 瀏覽器擴充套件 (Web Extension)**：在 Chrome/Edge 瀏覽網頁時自動偵測訂閱扣款行為並同步至 App。
* [ ] **🤝 拼團媒合 (P2P Sharing Matcher)**：協助尋找合法的 Family Plan 分享夥伴（如 Office 365 家用版），降低每人平均成本。
* [ ] **💼 多重工作區 (Multi-Workspace)**：將「個人」、「公司」、「家庭」的訂閱完全隔離管理的帳務系統。
* [ ] **📡 區域網路同步 (Local P2P Sync)**：不經過雲端伺服器，直接在同一 WiFi 下的裝置間同步資料，極致隱私保護。
* [ ] **👓 空間運算支援 (Spatial Computing)**：支援 Apple Vision Pro，以 3D 瀑布流展示訂閱項目。
* [ ] **🧠 消費心理分析 (Psychological Analysis)**：偵測「報復性訂閱」行為並給予友善提醒。
* [ ] **🏢 企業級 SSO 登入 (Enterprise SSO)**：支援公司統編發票管理與 SAML/OIDC 登入。
* [ ] **🔗 Web3 支付整合 (Crypto Payments)**：追蹤透過 ETH/Solana 支付的鏈上訂閱服務。
* [ ] **⚖️ 法律權益助手 (Legal Guardian)**：自動產生取消訂閱存證信函範本，協助用戶主張 GDPR/CCPA 資料刪除權。
* [ ] **🏆 節省排行榜 (Savings Leaderboard)**：(匿名) 比較同類別用戶的平均支出，激勵減少不必要開銷。
* [ ] **🌡️ 訂閱疲勞偵測 (Fatigue Detector)**：偵測過多影音服務導致的「選擇困難症」，主動建議暫停部分訂閱。
* [ ] **🔄 帳號無縫移轉 (Account Transfer)**：協助將訂閱帳號權限安全、無縫地移轉給他人（如離職交接、分手分產）。
* [ ] **� 智慧家庭連動 (Smart Home Integration)**：當月支出超支時，連動 Philips Hue 燈光變紅警示。
* [ ] **🔐 量子抗性加密 (Post-Quantum Cryptography)**：採用與 NIST 標準相容的加密演算法，抵禦未來量子電腦夠算力破解的風險。
* [ ] **🆔 去中心化身分 (DID Login)**：支援 ENS / Unstoppable Domains 登入，完全掌握自己的身分數據，不依賴 Google/Apple。
* [ ] **🛒 訂閱市集 (Subscription Marketplace)**：直接在 App 內購買或轉讓（合規前提下）剩餘的訂閱會籍期間。
* [ ] **🐳 自架後端支援 (Self-Hosted/Docker)**：提供 Docker Image，讓用戶將資料庫從 Firebase 遷移至自家的 NAS 或 VPS (Supabase/PostgreSQL)。
* [ ] **💳 信用卡回饋最佳化 (Reward Optimizer)**：與信用卡資訊整合，自動建議「刷哪張卡」訂閱 Netflix 可獲得最高回饋 (如 5% 現金回饋)。
* [ ] **💻 終端機介面 (CLI Tool)**：提供 `subtrack-cli`，讓黑客能透過指令列 `subtrack add --name="AWS" --price=50` 快速記帳。
* [ ] **🚗 車載系統整合 (CarPlay / Android Auto)**：在車用螢幕上快速查看「加油訂閱」或「洗車訂閱」狀態。
* [ ] **🤖 訂閱談判機器人 (Negotiator Bot)**：(實驗性) 授權 AI 代理人自動與客服線上交涉，嘗試爭取續約折扣或取消服務。
* [ ] **📦 實體訂閱追蹤 (Physical Goods)**：擴展管理範疇至「羊奶」、「雜誌」、「有機蔬菜箱」等實體配送訂閱。
* [ ] **☕ 價值換算器 (Value Converter)**：將訂閱費用換算為「幾杯星巴克」或「需工作幾小時」，讓支出更有感。
* [ ] **🛑 衝動消費攔截器 (Impulse Buy Blocker)**：瀏覽器擴充功能，強制對新訂閱設定 24 小時冷靜期倒數。
* [ ] **🏥 健康數據連動 (Health Data Integration)**：讀取 Apple Health 步數，若偵測到一個月未去健身房，主動詢問是否取消 Gym 訂閱。
* [ ] **⚖️ 道德評分系統 (Ethical Scoring)**：顯示訂閱企業的 ESG 分數與碳排放，協助用戶選擇符合價值觀的服務。
* [ ] **📺 跨平台內容聚合 (Content Aggregator)**：整合 Netflix/Disney+/Prime Video 片單，一鍵搜尋「想看的片在哪個平台」，避免重複訂閱。
* [ ] **💰 訂閱轉投資 (Sub-to-Invest)**：與券商 API 串接，將每月取消訂閱省下的金額，自動轉入 ETF 定期定額投資。
* [ ] **🖨️ 實體訂閱卡 (Printable Membership Card)**：生成 Apple Wallet / Google Pay 票卡，整合所有實體會員條碼 (如 Costco, 健身房)。
* [ ] **📊 信用評分小幫手 (Credit Score Booster)**：(實驗性) 主動將準時繳費紀錄回報給聯徵中心，協助累積個人信用分數。
* [ ] **🧾 稅務抵扣偵測 (Tax Deduction Hunter)**：為自由工作者標記可能可用於報稅的生產力訂閱 (如 Adobe, AWS)，並匯出會計報表。
* [ ] **📅 影劇內容行事曆 (Content Release Calendar)**：整合訂閱平台的上映清單，避免為了「這個月沒片看」的平台付費。
* [ ] **🛡️ 訂閱停損保險 (Renewal Protection)**：提供微型保險服務，若忘記取消試用期導致被扣款，可申請理賠。
* [ ] **🌍 碳中和訂閱 (Carbon Neutral Sub)**：一鍵購買碳權，抵銷串流媒體運算產生的碳足跡，達成個人淨零排放。

### 🚀 極致效能優化 (Performance Mastery)

* [ ] **⚡ FlashList 遷移**：全面導入 Shopify FlashList，在數千筆訂閱資料下維持 60 FPS 捲動流暢度。
* [ ] **🔥 JSI 直接綁定 (JSI Bindings)**：繞過 React Native Bridge，使用 C++ 直接呼叫 SQLite，提升資料庫讀寫效能 10x。
* [ ] **🏗️ 新架構啟用 (New Architecture)**：全面啟用 Fabric (UI) 與 TurboModules，實現同步 Layout 計算與 Native 模組按需載入。
* [ ] **🕸️ WebAssembly (WASM)**：將複雜的加密與統計運算邏輯遷移至 Rust/WASM，優化 Web 版執行效率。
* [ ] **📦 智慧分包 (Bundle Splitting)**：實作 Route-based splitting，大幅縮減 App 首屏載入的 JS Bundle 體積。
* [ ] **🏎️ Hermes 靜態優化**：啟用 Static Hermes，將部分 JS 編譯為 Native Code，達成接近原生的啟動速度。
* [ ] **🧵 多執行緒運算 (Multithreading)**：將數據處理移至 React Native New Architecture 的 Worker Threads，釋放 UI 執行緒。
* [ ] **📉 記憶體流失監控 (Memory Leak Detection)**：整合 LeakCanary 與 Instruments 自動化檢測，確保長時運行不崩潰。
* [ ] **🖼️ 圖片客戶端壓縮 (Client-side Compression)**：上傳收據前先進行高效失真壓縮 (WebP)，減少 70% 流量與雲端儲存成本。
* [ ] **📡 網路請求聚合 (Request Batching)**：實作 GraphQL 式的查詢聚合層，將多個 API 呼叫合併為單一請求，降低延遲。
* [ ] **🧊 原生模組重寫 (Native Rewrite)**：針對加密與日期計算等熱點邏輯，直接以 C++ 重寫並透過 JSI 呼叫。
* [ ] **🎨 Skia 繪圖引擎 (Skia Rendering)**：引入 `@shopify/react-native-skia` 替換 SVG 圖表，利用 GPU 加速達成 120Hz 絲滑動畫。
* [ ] **🚀 HTTP/3 (QUIC) 支援**：升級網路層支援 QUIC 協定，在弱網環境下減少 30% 連線延遲。
* [ ] **💾 SQLite WAL 模式 (Write-Ahead Logging)**：啟用 WAL 模式並優化 Checkpoint 策略，大幅提升資料庫並發讀寫能力。
* [ ] **⚡ 延遲載入 (Inline Requires)**：實作 Metro 的 Inline Requires 配置，將模組解析推遲至執行期，進一步削減啟動時間。
* [ ] **🔧 PGO 編譯優化 (Profile-Guided Optimization)**：收集真實用戶的執行路徑數據，重新編譯 Android SO 檔，提升熱點代碼執行效率。
* [ ] **⚡ MMKV 全面替代 (MMKV Storage)**：以騰訊開源的 MMKV 替換 AsyncStorage，利用 mmap 記憶體映射技術實現 100x 讀寫加速。
* [ ] **🔢 Protobuf 二進制傳輸 (Protocol Buffers)**：將 API Payload 從 JSON 升級為 Protobuf，縮減體積並提升 5x 解析速度。
* [ ] **♻️ 自定義物件池 (Object Pooling)**：針對高頻建立的元件 (如清單項目) 實作物件回收機制，大幅降低 Garbage Collection 觸發頻率。
* [ ] **🎯 視圖層級扁平化 (View Flattening)**：利用 Yoga 引擎特性手動優化 Layout 結構，減少過度繪製 (Overdraw) 與各層級 View 合成開銷。
* [ ] **🔮 預測性網路預載 (Predictive Prefetching)**：基於使用者行為模型 AI，預判下一個動作提前發出 API 請求，達成「零延遲」體感。
* [ ] **🧬 CRDTs 自動衝突解決 (Conflict-free Replicated Data Types)**：實作 Yjs 或 Automerge 演算法，達成多裝置離線編輯後的完美自動合併。
* [ ] **🖌️ C++ 樣式引擎 (Unistyles / NativeWind)**：將 Stylesheet 解析邏輯下沉至 C++ 層，讓動態樣式切換不再佔用 JS 執行與 Bridge 頻寬。
* [ ] **🎮 GPU 運算加速 (Compute Shaders)**：利用 WebGPU / Metal 進行客戶端大數據分析 (如年度支出熱點圖)，釋放 CPU 負載。
* [ ] **📉 差異化 OTA 更新 (Differential Updates)**：優化 EAS Update 機制，僅下載變更的 JS Chunk，將熱更新耗時從 5秒降至 0.5秒。
* [ ] **🔬 啟動時序迴歸測試 (Startup Time Regression)**：在 CI/CD 流水線整合 Systrace，任何導致啟動慢於 200ms 的 Commit 自動退回。
* [ ] **⚡ React Server Components (RSC for Mobile)**：實驗性引入 RSC 架構，將 90% 的業務邏輯留存於伺服器，達成「零 Bundle」的極致輕量化。
* [ ] **🧮 SIMD 指令集優化 (Neon/AVX)**：在 C++ 層針對 ARM NEON 指令集進行手動向量化編碼，加速加密與雜湊運算 400%。
* [ ] **🧠 自定義記憶體配置器 (Custom Allocator)**：替換預設 malloc 為 jemalloc 或 mimalloc，針對 React Native 的短期物件分配模式進行特化調優。
* [ ] **🌊 Bytecode Streaming**：實作串流式腳本載入，在網路下載 JS Bundle 的同時即刻開始解析與執行，消除等待時間。
* [ ] **🌋 Vulkan/Metal 直接渲染**：繞過所有中間層，針對圖表繪製直接呼叫底層 Graphics API，榨乾硬體最後一滴效能。
* [ ] **📏 Zero-Copy 反序列化 (FlatBuffers)**：引入 FlatBuffers 替換 Protobuf，存取數據時無需任何記憶體複製與解碼步驟，達成真正的零開銷。
* [ ] **🧊 ASTC 紋理壓縮 (Adaptive Scalable Texture Compression)**：將所有 UI 圖標與資源轉為 GPU 硬體支援的 ASTC 格式，減少 60% VRAM 佔用並提升渲染頻寬。
* [ ] **🔥 CPU 時脈預先排程 (Performance Hints)**：利用 Android Performance Hint API 在繁重任務前微秒級預先拉升 CPU 頻率，消除頻率爬升延遲。
* [ ] **⚡ 預編譯著色器 (Pre-compiled Shaders)**：在安裝階段即完成 Skia/OpenGL Shader 編譯，徹底根除應用程式首次執行的動畫卡頓 (Jank)。
* [ ] **🕺 完全離線主執行緒 (Off-Main-Thread Architecture)**：將所有動畫、手勢與渲染邏輯徹底剝離 JS Thread，即便 JS 滿載卡死，介面依然保持 120Hz 響應。
* [ ] **🧮 形式化驗證 (Formal Verification)**：使用 Coq 證明核心演算法正確性，移除所有 Runtime 邊界檢查 (Bounds Checks)，極致縮減指令數。
* [ ] **🧠 數據導向設計 (Data-Oriented Design)**：捨棄 OOP 物件參照，改用 ECS (Entity Component System) 架構，最大化 CPU L1/L2 Cache 命中率。
* [ ] **⚡ 手寫組合語言 (Hand-written Assembly)**：針對 ARM64 架構手寫關鍵熱點代碼 (Critical Hotspots)，繞過編譯器優化限制。
* [ ] **🌐 自訂傳輸協定 (Custom UDP Protocol)**：基於 UDP 實作類似遊戲的不可靠傳輸層 (Reliable UDP)，消除 TCP 握手與壅塞控制延遲。
* [ ] **🧊 晶片級指令特化 (ASIC/NPU Optimization)**：直接呼叫手機 NPU 進行本地神經網路推論，將功耗降低 90%。

---

**Author**: SubTrack Team
**Copyright**: © 2026 SubTrack. All rights reserved.
