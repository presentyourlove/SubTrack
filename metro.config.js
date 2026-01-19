/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// 🏎️ 啟用 Hermes 靜態優化 (Static Hermes) 與位元組碼優化
// 雖然 Expo 目前在 SDK 54 中透過 newArchEnabled 控制許多行為，
// 但在 metro-config 中明確配置實驗性旗標能確保編譯時的效能優化最大化。
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true, // 啟用 Inline Requires 減少啟動壓力
    },
  }),
};

// 配置解決方案以過濾重型依賴
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
};

module.exports = config;
