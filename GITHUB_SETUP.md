# SubTrack GitHub Repository 設定指南

## 步驟 1: 在 GitHub 上建立新 Repository

1. 前往 [GitHub](https://github.com)
2. 點擊右上角的 **+** → **New repository**
3. 填寫以下資訊:
   - **Repository name**: `SubTrack`
   - **Description**: `訂閱管理應用程式 - 跨平台支援 iOS/Android/Web`
   - **Visibility**: Public 或 Private (依您的需求)
   - **不要** 勾選 "Initialize this repository with a README"
4. 點擊 **Create repository**

## 步驟 2: 本地 Git 初始化

在 PowerShell 或終端機中執行以下指令:

```powershell
# 切換到專案目錄
cd F:\project\SubTrack

# 初始化 Git repository
git init

# 建立 .gitignore 檔案
New-Item -ItemType File -Path ".gitignore" -Force
```

## 步驟 3: 建立 .gitignore

將以下內容加入 `.gitignore`:

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

# TypeScript
*.tsbuildinfo

# OS
.DS_Store
Thumbs.db
```

## 步驟 4: 建立 README.md

```powershell
# 建立 README 檔案
New-Item -ItemType File -Path "README.md" -Force
```

將以下內容加入 `README.md`:

```markdown
# SubTrack - 訂閱管理應用程式

跨平台訂閱管理應用程式，協助使用者追蹤和管理各種訂閱服務。

## 平台支援
- 📱 iOS (原生 App)
- 🤖 Android (原生 App)  
- 🌐 Web (網頁版)

## 核心功能
- 📋 訂閱管理 - 追蹤所有訂閱服務
- 📊 預算追蹤 - 週/月/年支出分析
- 💱 幣別管理 - 支援8種貨幣轉換
- ☁️ 雲端同步 - Firebase 跨裝置同步

## 技術堆疊
- React Native + Expo (v52)
- TypeScript
- Firebase (Authentication + Firestore)
- SQLite (Native) / localStorage (Web)

## 開始使用

### 環境需求
- Node.js 20+
- npm 或 yarn

### 安裝
\`\`\`bash
npm install
\`\`\`

### 執行
\`\`\`bash
# 開發模式
npx expo start

# Web 版本
npx expo start --web

# Android
npx expo start --android

# iOS
npx expo start --ios
\`\`\`

## 專案文件
- [實作計畫](./implementation_plan.md)
- [任務清單](./task.md)

## 授權
MIT License
```

## 步驟 5: 首次 Commit 並推送

```powershell
# 加入所有檔案
git add .

# 建立首次 commit
git commit -m "Initial commit: SubTrack project setup

- 新增專案文件 (implementation_plan.md, task.md)
- 新增 README.md
- 設定 .gitignore"

# 設定主分支名稱
git branch -M main

# 連結遠端 repository (請替換 [username] 為您的 GitHub 使用者名稱)
git remote add origin https://github.com/[username]/SubTrack.git

# 推送至 GitHub
git push -u origin main
```

## 步驟 6: 驗證

1. 重新整理 GitHub repository 頁面
2. 確認檔案已成功上傳:
   - README.md
   - implementation_plan.md
   - task.md
   - .gitignore

## 後續開發流程

### 建立新功能分支

```powershell
git checkout -b feature/subscription-list
```

### 提交變更

```powershell
git add .
git commit -m "feat: 實作訂閱列表功能"
git push origin feature/subscription-list
```

### 合併回主分支

在 GitHub 上建立 Pull Request，審查後合併至 main 分支。

---

## 注意事項

> [!IMPORTANT]
>
> - 請確保 `.env` 檔案已加入 `.gitignore`，避免洩漏敏感資訊
> - Firebase 設定檔應使用環境變數，不要直接提交到 Git
> - 定期推送變更至 GitHub，確保程式碼備份

## 需要協助？

如果在設定過程中遇到問題，請參考:

- [GitHub 官方文件](https://docs.github.com)
- [Git 基礎教學](https://git-scm.com/book/zh-tw/v2)
