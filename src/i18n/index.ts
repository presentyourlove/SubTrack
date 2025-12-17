import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import zh from './zh';

// 定義翻譯檔
const translations = {
  zh,
  'zh-TW': zh,
};

// 初始化 i18n
const i18n = new I18n(translations);

// 設定預設語系
// 如果裝置語系是繁體中文 (zh-TW, zh-HK 等)，使用 zh，否則預設使用 zh
// 目前只實作中文，所以強制 fallback 到 zh
i18n.enableFallback = true;
i18n.defaultLocale = 'zh';

// 偵測裝置語系
const locale = getLocales()[0]?.languageCode ?? 'zh';
i18n.locale = locale;

export default i18n;
