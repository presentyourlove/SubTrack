# SubTrack Firebase 設定指南

## 📋 前置準備

1. Google 帳號
2. 瀏覽器 (Chrome/Edge/Firefox)
3. SubTrack 專案已在本地

---

## 步驟 1: 建立 Firebase 專案

### 1.1 前往 Firebase Console

1. 開啟瀏覽器，前往：<https://console.firebase.google.com/>
2. 使用您的 Google 帳號登入

### 1.2 建立新專案

1. 點擊 **「新增專案」** 或 **「Add project」**
2. 輸入專案名稱：`SubTrack`
3. 點擊 **「繼續」**

### 1.3 Google Analytics (可選)

1. 選擇是否啟用 Google Analytics
   - **建議**: 先關閉，之後可以再開啟
   - 取消勾選 "Enable Google Analytics for this project"
2. 點擊 **「建立專案」**
3. 等待專案建立完成 (約 30 秒)
4. 點擊 **「繼續」**

---

## 步驟 2: 設定 Authentication (使用者認證)

### 2.1 啟用 Authentication

1. 在左側選單中，點擊 **「Authentication」**
2. 點擊 **「開始使用」** 或 **「Get started」**

### 2.2 設定登入方式

我們將啟用 **Email/Password** 和 **Google** 登入：

#### Email/Password 登入

1. 在「Sign-in method」標籤中
2. 點擊 **「Email/Password」**
3. 啟用 **「Email/Password」** (第一個開關)
4. **不要** 啟用 "Email link (passwordless sign-in)"
5. 點擊 **「儲存」**

#### Google 登入

1. 點擊 **「Google」**
2. 啟用開關
3. 選擇專案支援電子郵件
   - 輸入您的 Email (例如: <your-email@gmail.com>)
4. 點擊 **「儲存」**

---

## 步驟 3: 設定 Firestore Database (資料庫)

### 3.1 建立 Firestore 資料庫

1. 在左側選單中，點擊 **「Firestore Database」**
2. 點擊 **「建立資料庫」** 或 **「Create database」**

### 3.2 選擇安全規則模式

1. 選擇 **「以測試模式啟動」** (Start in test mode)
   - ⚠️ 注意：測試模式 30 天後會過期，之後需要更新規則
2. 點擊 **「下一步」**

### 3.3 選擇資料庫位置

1. 選擇 Cloud Firestore 位置
   - **建議**: `asia-east1` (台灣) 或 `asia-northeast1` (日本)
   - 這會影響資料讀寫速度
2. 點擊 **「啟用」**
3. 等待資料庫建立完成

### 3.4 設定安全規則 (重要！)

資料庫建立後，我們需要設定適當的安全規則：

1. 點擊 **「規則」** 標籤
2. 將以下規則貼上：

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能存取自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // 使用者的訂閱資料
      match /subscriptions/{subscriptionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // 使用者的設定
      match /settings/{settingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

3. 點擊 **「發布」**

---

## 步驟 4: 註冊應用程式

### 4.1 新增 Web App

1. 回到專案總覽 (點擊左上角的「專案總覽」)
2. 點擊 **「</> Web」** 圖示 (網頁應用程式)
3. 輸入應用程式暱稱：`SubTrack Web`
4. **勾選** "Also set up Firebase Hosting for this app"
5. 點擊 **「註冊應用程式」**

### 4.2 複製 Firebase 設定

您會看到類似以下的設定程式碼：

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "subtrack-xxxxx.firebaseapp.com",
  projectId: "subtrack-xxxxx",
  storageBucket: "subtrack-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

**重要**: 請複製這些資訊，我們稍後會用到！

### 4.3 新增 iOS App (可選)

1. 點擊 **「新增應用程式」** → **iOS**
2. 輸入 iOS Bundle ID: `com.subtrack.app`
3. 輸入應用程式暱稱: `SubTrack iOS`
4. 點擊 **「註冊應用程式」**
5. 下載 `GoogleService-Info.plist` (稍後會用到)

### 4.4 新增 Android App (可選)

1. 點擊 **「新增應用程式」** → **Android**
2. 輸入 Android Package Name: `com.subtrack.app`
3. 輸入應用程式暱稱: `SubTrack Android`
4. 點擊 **「註冊應用程式」**
5. 下載 `google-services.json` (稍後會用到)

---

## 步驟 5: 設定 Firebase Hosting (Web 部署)

### 5.1 初始化 Hosting

1. 在左側選單中，點擊 **「Hosting」**
2. 點擊 **「開始使用」**
3. 按照指示操作 (我們稍後會在本地設定)

---

## 步驟 6: 在本地專案中設定 Firebase

### 6.1 安裝 Firebase SDK

在 SubTrack 專案目錄中執行：

```powershell
cd F:\project\SubTrack
npm install firebase
```

### 6.2 建立環境變數檔案

建立 `.env` 檔案：

```bash
# Firebase 設定
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=subtrack-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=subtrack-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=subtrack-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**重要**: 將上面的值替換為步驟 4.2 中複製的實際值！

### 6.3 更新 .gitignore

確保 `.env` 已在 `.gitignore` 中：

```gitignore
# Environment
.env
.env*.local
```

---

## 步驟 7: 建立 Firebase 設定檔

建立 `src/services/firebaseConfig.ts`：

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);

// 初始化服務
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
```

---

## ✅ 檢查清單

完成以下項目後，Firebase 設定就完成了：

- [ ] Firebase 專案已建立
- [ ] Authentication 已啟用 (Email/Password + Google)
- [ ] Firestore Database 已建立
- [ ] 安全規則已設定
- [ ] Web App 已註冊
- [ ] Firebase 設定已複製
- [ ] `.env` 檔案已建立並填入正確的值
- [ ] `firebaseConfig.ts` 已建立
- [ ] Firebase SDK 已安裝

---

## 🚀 下一步

完成 Firebase 設定後，我們可以繼續：

1. 實作 Firebase Authentication (登入/註冊)
2. 實作 Firestore 資料同步
3. 建立雲端同步邏輯

---

## 📞 需要協助？

如果在設定過程中遇到問題，請告訴我：

- 在哪個步驟遇到問題
- 錯誤訊息是什麼
- 截圖 (如果可能)

我會協助您解決！
