// 顏色常數定義
export const Colors = {
    light: {
        background: '#ffffff',
        card: '#f5f5f5',
        text: '#000000',
        subtleText: '#666666',
        borderColor: '#e0e0e0',
        inputBackground: '#f9f9f9',
        accent: '#6366f1',
        tint: '#6366f1',
        expense: '#ef4444',
        income: '#10b981',
        tabIconDefault: '#9ca3af',
        tabIconSelected: '#6366f1',
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
    },
};

export type ColorScheme = keyof typeof Colors;
export type ThemeColors = typeof Colors.light;
