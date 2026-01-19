// 顏色常數定義
export const Colors = {
  light: {
    text: '#1F2937', // 深灰文字，比純黑柔和
    subtleText: '#6B7280', // 次要文字
    background: '#F3F4F6', // 淺灰背景，更有層次感
    card: '#FFFFFF', // 純白卡片
    accent: '#6366F1', // 主要強調色 (Indigo)
    borderColor: '#E5E7EB', // 邊框顏色
    notification: '#EF4444', // 通知紅點
    expense: '#F87171', // 支出/警告 (柔和紅)
    income: '#34D399', // 收入/成功 (柔和綠)
    tabIconDefault: '#9CA3AF',
    tabIconSelected: '#6366F1',
    inputBackground: '#F9FAFB', // 輸入框背景
    primary: '#6366F1', // Primary color (alias for accent)
    textSecondary: '#6B7280', // Alias for subtleText
  },
  dark: {
    background: '#1a1a1a',
    card: '#2d2d2d',
    text: '#ffffff',
    subtleText: '#a0a0a0',
    borderColor: '#404040',
    inputBackground: '#3a3a3a',
    accent: '#6366f1',
    tint: '#818cf8',
    expense: '#f87171',
    income: '#34d399',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#818cf8',
    notification: '#ef4444',
    primary: '#6366f1', // Primary color (alias for accent)
    textSecondary: '#a0a0a0', // Alias for subtleText
  },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
