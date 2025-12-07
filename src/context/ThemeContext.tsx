import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ColorScheme, ThemeColors } from '../constants/Colors';

type ThemeContextType = {
    theme: ColorScheme;
    colors: ThemeColors;
    setTheme: (theme: ColorScheme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [theme, setThemeState] = useState<ColorScheme>(systemColorScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        // 可以在這裡從 AsyncStorage 載入使用者偏好的主題
        // 目前先使用系統主題
        if (systemColorScheme) {
            setThemeState(systemColorScheme);
        }
    }, [systemColorScheme]);

    const setTheme = (newTheme: ColorScheme) => {
        setThemeState(newTheme);
        // 可以在這裡儲存到 AsyncStorage
    };

    const colors = Colors[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
