import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useQuickActionCallback } from 'expo-quick-actions/hooks';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { DatabaseProvider } from '../src/context/DatabaseContext';
import { SecurityProvider } from '../src/context/SecurityContext';
import { ToastProvider } from '../src/context/ToastContext';
import { LockScreen } from '../src/components/LockScreen';
import { requestNotificationPermissions } from '../src/utils/notificationHelper';

const queryClient = new QueryClient();

export default function RootLayout() {
  const router = useRouter();

  // 處理快速操作 (Quick Actions)
  useQuickActionCallback((action) => {
    if (action.id === 'shortcut_add') {
      // 導向首頁並開啟新增 Modal (由首頁邏輯處理或直接導向特定的 Add 頁面)
      router.push('/(tabs)');
    } else if (action.id === 'shortcut_search') {
      router.push('/search');
    } else if (action.id === 'shortcut_summary') {
      router.push('/(tabs)/reports');
    }
  });

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DatabaseProvider>
            <SecurityProvider>
              <ToastProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                </Stack>
                <LockScreen />
              </ToastProvider>
            </SecurityProvider>
          </DatabaseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
