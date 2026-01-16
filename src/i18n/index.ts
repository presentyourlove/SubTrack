import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';
import zh from './zh';
import en from './en';

// 定義翻譯檔
const translations = {
  zh,
  'zh-TW': zh,
  'zh-HK': zh,
  en,
  'en-US': en,
};

// 初始化 i18n
const i18n = new I18n(translations);

// 設定預設語系
i18n.enableFallback = true;
i18n.defaultLocale = 'en'; // Default fallback to English if unknown

// 偵測裝置語系
const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
i18n.locale = deviceLocale;

export default i18n;
