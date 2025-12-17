# 貢獻指南 (Contributing Guide)

感謝您考慮為 SubTrack 專案做出貢獻！

## 分支策略 (Branching Strategy)

我們採用 **Git Flow** 工作流程：

- `main` - 正式發布分支
- `develop` - 開發整合分支
- `feature/*` - 功能開發分支
- `fix/*` - 錯誤修復分支
- `hotfix/*` - 緊急修復分支

## 開發流程 (Development Workflow)

1. **Fork 專案**

   ```bash
   git clone https://github.com/presentyourlove/SubTrack.git
   cd SubTrack
   ```

2. **建立功能分支**

   ```bash
   git checkout -b feature/your-feature-name develop
   ```

3. **設置開發環境**

   ```bash
   npm install --legacy-peer-deps
   cp .env.example .env
   # 編輯 .env 檔案,填入您的 Firebase 設定
   ```

4. **進行開發**
   - 遵循專案的程式碼風格
   - 編寫清晰的註解
   - 為新功能撰寫測試

5. **執行檢查**

   ```bash
   npm run lint        # ESLint 檢查
   npm run type-check  # TypeScript 型別檢查
   npm test            # 執行測試
   npm run format      # 格式化程式碼
   ```

6. **提交變更**

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

   我們使用 **Conventional Commits** 規範：
   - `feat:` - 新功能
   - `fix:` - 錯誤修復
   - `docs:` - 文件變更
   - `style:` - 程式碼格式(不影響功能)
   - `refactor:` - 重構
   - `test:` - 測試相關
   - `chore:` - 建置/工具相關

7. **推送分支**

   ```bash
   git push origin feature/your-feature-name
   ```

8. **建立 Pull Request**
   - 前往 GitHub 建立 PR
   - 將 PR 目標設為 `develop` 分支
   - 填寫 PR 模板並描述變更內容
   - 等待 Code Review

## Code Review 流程

- 所有 PR 需要至少一位審查者核准
- CI/CD 檢查必須全部通過
- 確保沒有衝突
- 維護者會盡快回覆

## 測試要求

- 新功能必須包含單元測試
- 測試覆蓋率不得降低
- 確保所有測試通過

## 程式碼風格

- 遵循 ESLint 和 Prettier 規範
- 使用 TypeScript 嚴格模式
- 函式保持簡潔(建議不超過 30 行)
- 避免深層巢狀結構
- 使用有意義的變數和函式命名

## Git Hooks

專案已設置 Husky + lint-staged：

- Pre-commit: 自動執行 Lint 和格式化
- 確保提交的程式碼符合品質標準

## 問題回報

如果發現 Bug 或有功能建議，請：

1. 檢查是否已有相同的 Issue
2. 建立新的 Issue 並提供詳細描述
3. 包含重現步驟(如果是 Bug)

## 授權

提交貢獻即表示您同意將程式碼以 MIT 授權釋出。

## 聯絡方式

如有任何問題，請透過以下方式聯絡：

- GitHub Issues
- GitHub Discussions
