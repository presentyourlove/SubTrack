# SubTrack - 跨平台訂閱管理系統

> 您的終極訂閱追蹤助手，掌握每一分支出，讓財務管理變得輕鬆、智慧且優雅。

SubTrack 是一款基於 React Native (Expo) 開發的現代化訂閱管理應用程式。它不僅協助您追蹤週期性支出，更透過直觀的圖表與數據分析，幫助您優化財務健康。支援 Web、iOS 與 Android 三大平台，採用離線優先策略，並可透過 Firebase 進行雲端同步。

## ✨ 專案亮點 (Project Highlights)

- **跨平台體驗**：一套程式碼，完美運行於 Web、iOS 與 Android。
- **優雅的 UI/UX**：採用現代化設計語言，支援深色模式 (Dark Mode) 與流暢的微互動動畫。
- **離線優先 (Offline First)**：無網路也能完整使用，資料存於本地 SQLite/LocalStorage，連線後自動同步。
- **高性能圖表**：整合 Skia 圖形引擎，呈現絲滑流暢的數據視覺化報表。
- **隱私至上**：支援隱私模式 (數值遮罩) 與生物辨識鎖定 (FaceID/TouchID)。

## 🚀 功能特色 (Features)

- **訂閱管理**：輕鬆新增、編輯、刪除訂閱項目，支援自訂週期與類別。
- **視覺化報表**：
  - **預算分析**：圓餅圖查看各類別支出佔比。
  - **趨勢追蹤**：長條圖分析每月/每季支出變化。
- **多幣別支援**：即時匯率轉換，統一結算不同幣別的訂閱費用。
- **智慧通知**：自訂續訂提醒，再也不會錯過取消試用期。
- **雲端同步**：透過 Firebase 帳號登入，在多個裝置間無縫同步資料。
- **個人化設定**：自訂主題色、預設幣別、排序偏好等。

## 🛡️ 程式碼品質 (Code Quality)

本專案嚴格遵循業界標準與最佳實踐：

- **TypeScript**: 全面啟用嚴格模式 (Strict Mode)，確保型別安全。
- **Linting & Formatting**: 整合 ESLint 與 Prettier，統一程式碼風格。
- **Clean Architecture**: 採用分層架構 (Components, Services, Utils, Context)，職責分離清晰。
- **Unit Testing**: 使用 Jest 進行單元測試，確保核心邏輯穩定性。
- **CI/CD Friendly**: 包含自動化部署腳本，並支援 Conventional Commits 規範。

## 📱 支援平台 (Supported Platforms)

| 平台        | 支援版本        | 技術實現                         |
| :---------- | :-------------- | :------------------------------- |
| **Android** | Android 8.0+    | React Native (Hermes Engine)     |
| **iOS**     | iOS 13.0+       | React Native (Hermes Engine)     |
| **Web**     | Modern Browsers | React Native for Web (React DOM) |

## 🛠️ 技術堆疊 (Tech Stack)

- **核心框架**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/) (SDK 50+)
- **語言**: [TypeScript](https://www.typescriptlang.org/)
- **路由**: [Expo Router](https://docs.expo.dev/router/introduction/) (基於檔案系統的路由)
- **狀態管理**: React Context API, [TanStack Query](https://tanstack.com/query/latest) (非同步狀態)
- **UI 元件庫**: React Native Paper (部分), 自訂元件系統
- **圖形引擎**: [React Native Skia](https://shopify.github.io/react-native-skia/)
- **資料庫**:
  - App: `expo-sqlite` (SQLite)
  - Web: `localStorage` (JSON)
- **後端服務**: [Firebase](https://firebase.google.com/) (Auth, Firestore)

## 📂 專案結構 (Project Structure)

```text
SubTrack/
├── app/                      # 應用程式路由 (Expo Router)
│   ├── (tabs)/              # 主分頁 (首頁, 預算, 設定)
│   └── _layout.tsx          # 應用程式根佈局
├── src/
│   ├── components/          # UI 元件 (Atomic Design)
│   │   ├── cards/           # 卡片元件
│   │   ├── visualizations/  # 圖表元件
│   │   └── ui/              # 基礎 UI 元件
│   ├── context/             # 全域狀態 (Theme, Auth, Database)
│   ├── hooks/               # 自訂 React Hooks
│   ├── services/            # 商業邏輯與 API 服務
│   ├── utils/               # 工具函式庫
│   └── types/               # TypeScript 型別定義
├── scripts/                  # 自動化腳本
└── docs/                     # 專案文件
```

## 📖 開發指南 (Development Guide)

### 環境需求

- Node.js (LTS 版本)
- npm 或 yarn
- Expo Go App (用於實機測試)

### 安裝依賴

```bash
npm install
```

### 啟動開發伺服器

```bash
npm start
```

按 `a` 啟動 Android 模擬器，按 `i` 啟動 iOS 模擬器，或按 `w` 啟動 Web 預覽。

### 執行測試

```bash
npm test
```

## 📦 打包發布 (Build & Deploy)

### Android (APK)

適用於 Android 裝置安裝。

1. **安裝 EAS CLI**: `npm install -g eas-cli`
2. **登入 Expo**: `eas login`
3. **建置 APK**:

   ```bash
   eas build -p android --profile preview
   ```

4. 下載生成的 `.apk` 檔案安裝至手機。

### iOS (IPA)

適用於 AltStore / SideStore 自簽安裝。

> **注意**：此步驟必須在 **macOS** 環境下執行，並已安裝 Xcode。

1. **準備環境**:
   - 確保 Mac 已安裝 [Xcode](https://developer.apple.com/xcode/)。
   - 登入 Expo 帳號:

     ```bash
     eas login
     ```

2. **執行本地建置**:
   使用 `--local` 參數讓 EAS 在這台 Mac 上進行編譯，而非上傳至雲端。

   ```bash
   eas build -p ios --profile preview --local
   ```

3. **取得 IPA**:
   建置完成後，終端機將顯示 IPA 檔案的路徑，您可以使用 AirDrop 或傳輸線將其安裝至 iPhone。

### Web App (GitHub Pages)

適用於瀏覽器存取。

本專案包含自動化部署腳本，解決了 SPA 路由 (404) 與 Skia WASM 載入問題。

1. **執行部署指令**:

   ```bash
   npm run deploy
   ```

2. 腳本會自動執行：
   - 建置 Web 版本 (`expo export`)
   - 修復 `canvaskit.wasm` 路徑
   - 生成 `404.html` (SPA 路由支援)
   - 推送至 `gh-pages` 分支

## 📚 API 文件與測試

### API 架構

由於本專案主要採用 **Local-First** 架構，主要的資料操作發生在客戶端：

- **DatabaseService**: 封裝了 SQLite/LocalStorage 的 CRUD 操作。
- **AuthService**: 封裝了 Firebase Authentication 流程。
- **SyncService**: 負責將本地變更同步至 Firebase Firestore。

詳細介面定義請參考 `src/services/` 目錄下的 `.ts` 檔案。

### 測試策略

- 專案使用 **Jest** 進行單元測試。
- 涵蓋範圍：Utility Functions, Hooks, 以及關鍵 UI Components。
- 執行 `npm run coverage` 可查看測試覆蓋率報告。

## 👥 作者 (Author)

- **SubTrack Team**
- GitHub: [Presentyourlove](https://github.com/Presentyourlove)

## 🙏 致謝 (Acknowledgements)

感謝以下開源專案的貢獻：

- Expo
- React Native Community
- Shopify (React Native Skia)
- TanStack Query

## 📄 授權 (License)

本專案採用 MIT License 授權。
