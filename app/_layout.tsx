import '../src/config/env'; // Validate environment variables on startup
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { useQuickActionCallback } from 'expo-quick-actions/hooks';
import { ActivityIndicator, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { DatabaseProvider } from '../src/context/DatabaseContext';
import { SecurityProvider } from '../src/context/SecurityContext';
import { ToastProvider } from '../src/context/ToastContext';
import { LockScreen } from '../src/components/LockScreen';
import { requestNotificationPermissions } from '../src/utils/notificationHelper';
import { initSentry } from '../src/services/sentry';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
// Initialize Sentry
initSentry();

const queryClient = new QueryClient();

import { useSkiaWeb } from '../src/hooks/useSkiaWeb';

function RootLayout() {
  const router = useRouter();
  const { ready: skiaReady, error: skiaError } = useSkiaWeb();

  // Load fonts
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, error] = useFonts({
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (error) console.error('Font loading error:', error);
  }, [error]);

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

  // Web fallback for icon fonts
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    if (!document.getElementById('expo-font-fallback')) {
      style.id = 'expo-font-fallback';
      style.textContent = `
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf') format('truetype');
          }
          @font-face {
            font-family: 'Ionicons';
            src: url('https://unpkg.com/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf') format('truetype');
          }
        `;
      document.head.appendChild(style);
    }
  }

  if (!skiaReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (skiaError) {
    console.warn('Skia Web init failed, running in degraded mode:', skiaError);
    // 可選擇是否要顯示錯誤給使用者，目前選擇 Log 後繼續執行，避免白畫面完全卡死
  }

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

export default Sentry.wrap(RootLayout);
