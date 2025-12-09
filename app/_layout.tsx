import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { DatabaseProvider } from '../src/context/DatabaseContext';
import { ToastProvider } from '../src/context/ToastContext';
import { requestNotificationPermissions } from '../src/utils/notificationHelper';

export default function RootLayout() {
    // 在應用程式啟動時請求通知權限
    useEffect(() => {
        const setupNotifications = async () => {
            try {
                const granted = await requestNotificationPermissions();
                if (granted) {
                    console.log('通知權限已授予');
                } else {
                    console.log('通知權限被拒絕');
                }
            } catch (error) {
                console.error('請求通知權限時發生錯誤:', error);
            }
        };

        setupNotifications();
    }, []);

    return (
        <ThemeProvider>
            <AuthProvider>
                <DatabaseProvider>
                    <ToastProvider>
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="(tabs)" />
                        </Stack>
                    </ToastProvider>
                </DatabaseProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
