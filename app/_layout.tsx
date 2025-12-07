import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { DatabaseProvider } from '../src/context/DatabaseContext';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DatabaseProvider>
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="(tabs)" />
                    </Stack>
                </DatabaseProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
