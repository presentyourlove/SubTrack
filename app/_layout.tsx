import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { DatabaseProvider } from '../src/context/DatabaseContext';
import { ToastProvider } from '../src/context/ToastContext';

export default function RootLayout() {
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
