# SubTrack 系統架構文件

## 概述

SubTrack 是一個跨平台的訂閱管理應用程式，支援 Web、iOS 和 Android 平台。

## 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                   Client Layer                          │
├─────────────────────────────────────────────────────────┤
│  Web (Browser)  │  iOS (Native)  │  Android (Native)   │
└────────┬──────────────────┬────────────────┬───────────┘
         │                  │                │
         └──────────────────┴────────────────┘
                           │
         ┌─────────────────▼─────────────────┐
         │      React Native / Expo          │
         │    (Expo Router + Context)        │
         └─────────────────┬─────────────────┘
                           │
         ┌─────────────────▼─────────────────┐
         │        Service Layer              │
         ├───────────────────────────────────┤
         │  • Database Service               │
         │  • Auth Service                   │
         │  • Sync Service                   │
         └───┬──────────────────┬────────────┘
             │                  │
    ┌────────▼────────┐  ┌─────▼──────────┐
    │  Local Storage  │  │  Firebase      │
    ├─────────────────┤  ├────────────────┤
    │ • SQLite (App)  │  │ • Auth         │
    │ • localStorage  │  │ • Firestore    │
    │   (Web)         │  │ • Cloud Sync   │
    └─────────────────┘  └────────────────┘
```

## 技術堆疊

### 前端框架

- **React Native**: 跨平台 UI 框架
- **Expo**: 開發工具鏈與平台 API
- **TypeScript**: 型別安全的 JavaScript

### 路由與狀態管理

- **Expo Router**: 檔案系統路由
- **React Context API**: 全局狀態管理
  - `ThemeContext`: 主題切換
  - `AuthContext`: 使用者認證狀態
  - `DatabaseContext`: 資料庫連接

### 資料層

- **SQLite (Native)**: 本地資料持久化
- **localStorage (Web)**: Web 平台資料儲存
- **Firebase**:
  - Authentication: 使用者認證
  - Firestore: 雲端資料同步

### UI/UX

- **自訂主題系統**: 深色/淺色模式切換
- **響應式設計**: 手機、平板、桌機適配

## 資料流向

### 1. 本地操作流程

```
User Action → Component → Context → Service Layer → Local DB → State Update → UI Refresh
```

### 2. 雲端同步流程

```
Local DB Change → Sync Service → Firebase Firestore → Other Devices
```

### 3. 使用者認證流程

```
Login/Register → Auth Service → Firebase Auth → AuthContext → App State
```

## 專案結構

```
SubTrack/
├── app/                      # Expo Router 路由檔案
│   ├── (tabs)/              # Tab 導航頁面
│   │   ├── index.tsx        # 訂閱管理頁面
│   │   ├── budget.tsx       # 預算追蹤頁面
│   │   └── settings.tsx     # 設定頁面
│   └── _layout.tsx          # 根佈局
│
├── src/
│   ├── components/          # UI 元件
│   │   ├── settings/        # 設定相關元件
│   │   ├── subscription/    # 訂閱功能元件
│   │   └── ...             # 共用元件
│   │
│   ├── context/            # React Context
│   │   ├── ThemeContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── DatabaseContext.tsx
│   │
│   ├── services/           # 資料服務層
│   │   ├── database.ts          # SQLite (Native)
│   │   ├── database.web.ts      # localStorage (Web)
│   │   ├── authService.ts       # 認證服務
│   │   ├── syncService.ts       # 同步服務
│   │   └── firebaseConfig.ts    # Firebase 設定
│   │
│   ├── utils/              # 工具函式
│   │   ├── dateHelper.ts        # 日期處理
│   │   ├── currencyHelper.ts    # 貨幣轉換
│   │   ├── chartHelper.ts       # 圖表資料處理
│   │   └── ...
│   │
│   ├── types/              # TypeScript 型別定義
│   ├── constants/          # 常數與設定
│   └── i18n/              # 國際化資源
│
└── assets/                 # 靜態資源
```

## 核心模組說明

### 1. Database Service

**職責**: 管理本地資料的 CRUD 操作

**平台差異**:

- **Native (iOS/Android)**: 使用 `expo-sqlite`
- **Web**: 使用 `localStorage` + JSON 序列化

**API 設計**:

```typescript
// 初始化資料庫
initDatabase(): Promise<Database>

// 訂閱 CRUD
getAllSubscriptions(): Promise<Subscription[]>
addSubscription(data): Promise<number>
updateSubscription(id, data): Promise<void>
deleteSubscription(id): Promise<void>

// 統計查詢
getMonthlyTotal(): Promise<number>
getYearlyTotal(): Promise<number>
getUpcomingSubscriptions(days): Promise<Subscription[]>
```

### 2. Auth Service

**職責**: 處理使用者認證與授權

**功能**:

- 註冊新使用者
- 登入/登出
- 監聽認證狀態變化
- 錯誤處理與本地化

**API 設計**:

```typescript
registerUser(email, password, displayName?): Promise<User>
loginUser(email, password): Promise<User>
logoutUser(): Promise<void>
onAuthStateChange(callback): Unsubscribe
getCurrentUser(): User | null
```

### 3. Sync Service

**職責**: 本地資料與 Firebase 的同步

**策略**:

- 登入時：下載雲端資料並合併本地資料
- 變更時：即時上傳至 Firestore
- 衝突解決：以最新時間戳為準

## 重要設計決策 (ADR)

### ADR-001: 選擇 Expo 而非 React Native CLI

**決策**: 使用 Expo 作為開發框架

**原因**:

1. 快速開發：內建豐富的 API 和工具
2. OTA 更新：無需重新發布即可更新
3. 跨平台一致性：減少平台特定程式碼
4. 社群支援：活躍的社群和文件

**權衡**:

- 優點：開發速度快、維護成本低
- 缺點：APK 體積較大、部分 Native 功能受限

### ADR-002: 使用 Context API 而非 Redux

**決策**: 採用 React Context API 進行狀態管理

**原因**:

1. 應用程式狀態相對簡單
2. 減少依賴和學習成本
3. 與 React Hooks 緊密整合
4. 效能足夠應付需求

**權衡**:

- 優點：簡單、輕量、易維護
- 缺點：複雜場景下可能需要重構

### ADR-003: 雙層資料儲存 (Local + Cloud)

**決策**: 本地優先 + Firebase 雲端同步

**原因**:

1. 離線可用：無網路時仍可正常使用
2. 效能優化：本地讀寫速度快
3. 跨裝置同步：滿足多裝置需求
4. 資料備份：防止資料遺失

**實作策略**:

- 所有操作先寫入本地
- 認證使用者自動同步至雲端
- 使用時間戳解決衝突

### ADR-004: TypeScript 嚴格模式

**決策**: 啟用 TypeScript 嚴格模式

**原因**:

1. 提早發現型別錯誤
2. 更好的 IDE 支援和自動完成
3. 提升程式碼可維護性
4. 減少執行時錯誤

## 效能優化策略

1. **React.memo**: 避免不必要的元件重渲染
2. **useCallback/useMemo**: 減少函式和物件重建
3. **Virtual List**: 長列表使用 FlatList 虛擬化
4. **Image Optimization**: 適當的圖片尺寸和快取
5. **Lazy Loading**: 按需載入元件和資料

## 安全性考量

1. **環境變數**: 敏感資訊透過 `.env` 管理
2. **Firebase Rules**: Firestore 規則限制資料存取
3. **輸入驗證**: 所有使用者輸入進行驗證
4. **錯誤處理**: 適當的錯誤捕獲和使用者提示

## 部署策略

### Web

- 建置: `npx expo export:web`
- 部署: 靜態檔案託管 (Vercel, Netlify)

### Native (iOS/Android)

- 建置: EAS Build
- 發布: App Store / Google Play
- OTA 更新: Expo Updates

## 未來改進方向

1. **狀態管理**: 考慮引入 Zustand 或 Jotai
2. **測試覆蓋率**: 提升至 80%+
3. **i18n**: 支援更多語言
4. **Widget**: 桌面/主畫面 Widget
5. **AI 建議**: 訂閱推薦與支出優化
