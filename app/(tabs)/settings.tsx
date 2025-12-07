import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { loginUser, registerUser, logoutUser } from '../../src/services/authService';
import { getSupportedCurrencies } from '../../src/utils/currencyHelper';

export default function SettingsScreen() {
    const { colors, toggleTheme, isDark } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { settings, updateSettings, syncToCloud, syncFromCloud } = useDatabase();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const currencies = getSupportedCurrencies();
    const mainCurrency = settings?.mainCurrency || 'TWD';

    // 處理登入/註冊
    const handleAuth = async () => {
        try {
            if (isLogin) {
                await loginUser(email, password);
            } else {
                await registerUser(email, password);
            }
            setEmail('');
            setPassword('');
        } catch (error: any) {
            alert(error.message);
        }
    };

    // 處理登出
    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch (error: any) {
            alert(error.message);
        }
    };

    // 處理同步
    const handleSync = async (direction: 'upload' | 'download') => {
        setSyncing(true);
        try {
            if (direction === 'upload') {
                await syncToCloud();
                alert('資料已上傳到雲端');
            } else {
                await syncFromCloud();
                alert('資料已從雲端下載');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setSyncing(false);
        }
    };

    // 更新主要幣別
    const handleCurrencyChange = async (currency: string) => {
        try {
            await updateSettings({ mainCurrency: currency });
        } catch (error) {
            alert('更新幣別失敗');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>設定</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* 帳號設定 */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>帳號設定</Text>

                    {isAuthenticated ? (
                        <View>
                            <Text style={[styles.userEmail, { color: colors.text }]}>
                                {user?.email}
                            </Text>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.expense }]}
                                onPress={handleLogout}
                            >
                                <Text style={styles.buttonText}>登出</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholder="Email"
                                placeholderTextColor={colors.subtleText}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                placeholder="密碼"
                                placeholderTextColor={colors.subtleText}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.accent }]}
                                onPress={handleAuth}
                            >
                                <Text style={styles.buttonText}>
                                    {isLogin ? '登入' : '註冊'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
                                <Text style={[styles.switchText, { color: colors.accent }]}>
                                    {isLogin ? '還沒有帳號？註冊' : '已有帳號？登入'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* 雲端同步 */}
                {isAuthenticated && (
                    <View style={[styles.section, { backgroundColor: colors.card }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>雲端同步</Text>
                        <View style={styles.syncButtons}>
                            <TouchableOpacity
                                style={[styles.syncButton, { backgroundColor: colors.accent }]}
                                onPress={() => handleSync('upload')}
                                disabled={syncing}
                            >
                                <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                                <Text style={styles.syncButtonText}>上傳到雲端</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.syncButton, { backgroundColor: colors.accent }]}
                                onPress={() => handleSync('download')}
                                disabled={syncing}
                            >
                                <Ionicons name="cloud-download" size={20} color="#ffffff" />
                                <Text style={styles.syncButtonText}>從雲端下載</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* 幣別設定 */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>主要幣別</Text>
                    <View style={styles.currencyList}>
                        {currencies.map((currency) => (
                            <TouchableOpacity
                                key={currency.code}
                                style={[
                                    styles.currencyItem,
                                    { borderColor: colors.borderColor },
                                    mainCurrency === currency.code && { backgroundColor: colors.accent },
                                ]}
                                onPress={() => handleCurrencyChange(currency.code)}
                            >
                                <Text
                                    style={[
                                        styles.currencyCode,
                                        { color: colors.text },
                                        mainCurrency === currency.code && { color: '#ffffff' },
                                    ]}
                                >
                                    {currency.symbol} {currency.code}
                                </Text>
                                <Text
                                    style={[
                                        styles.currencyName,
                                        { color: colors.subtleText },
                                        mainCurrency === currency.code && { color: 'rgba(255,255,255,0.8)' },
                                    ]}
                                >
                                    {currency.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 外觀設定 */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>外觀</Text>
                    <View style={styles.themeRow}>
                        <Text style={[styles.themeLabel, { color: colors.text }]}>深色模式</Text>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#d1d5db', true: colors.accent }}
                            thumbColor="#ffffff"
                        />
                    </View>
                </View>

                {/* 關於 */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>關於</Text>
                    <Text style={[styles.aboutText, { color: colors.subtleText }]}>
                        SubTrack v1.0.0
                    </Text>
                    <Text style={[styles.aboutText, { color: colors.subtleText }]}>
                        訂閱管理應用程式
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    button: {
        borderRadius: 8,
        padding: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    switchText: {
        textAlign: 'center',
        fontSize: 14,
    },
    userEmail: {
        fontSize: 16,
        marginBottom: 16,
    },
    syncButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    syncButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    syncButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
    currencyList: {
        gap: 8,
    },
    currencyItem: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    currencyName: {
        fontSize: 12,
    },
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    themeLabel: {
        fontSize: 16,
    },
    aboutText: {
        fontSize: 14,
        marginBottom: 4,
    },
});
