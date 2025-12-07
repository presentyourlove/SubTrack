import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { login, register, logout } from '../../src/services/authService';
import { DEFAULT_EXCHANGE_RATES } from '../../src/types';

export default function SettingsScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { settings, updateSettings, syncToCloud, syncFromCloud } = useDatabase();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
    const [editingRates, setEditingRates] = useState<{ [key: string]: string }>({});

    // 處理登入
    const handleLogin = async () => {
        try {
            await login(email, password);
            Alert.alert('成功', '登入成功！');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    // 處理註冊
    const handleRegister = async () => {
        try {
            await register(email, password);
            Alert.alert('成功', '註冊成功！');
            setEmail('');
            setPassword('');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    // 處理登出
    const handleLogout = async () => {
        try {
            await logout();
            Alert.alert('成功', '已登出');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    // 處理雲端同步
    const handleSyncToCloud = async () => {
        try {
            await syncToCloud();
            Alert.alert('成功', '資料已上傳到雲端');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    const handleSyncFromCloud = async () => {
        try {
            await syncFromCloud();
            Alert.alert('成功', '資料已從雲端下載');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    // 處理幣別變更
    const handleCurrencyChange = async (currency: string) => {
        await updateSettings({ mainCurrency: currency });
    };

    // 開啟匯率編輯器
    const handleOpenExchangeRateEditor = () => {
        const currentRates = settings?.exchangeRates
            ? JSON.parse(settings.exchangeRates)
            : DEFAULT_EXCHANGE_RATES;

        // 轉換為字串格式以便編輯
        const ratesAsStrings: { [key: string]: string } = {};
        Object.keys(currentRates).forEach(key => {
            ratesAsStrings[key] = currentRates[key].toString();
        });

        setEditingRates(ratesAsStrings);
        setShowExchangeRateModal(true);
    };

    // 儲存匯率
    const handleSaveExchangeRates = async () => {
        try {
            // 轉換回數字格式
            const ratesAsNumbers: { [key: string]: number } = {};
            Object.keys(editingRates).forEach(key => {
                const value = parseFloat(editingRates[key]);
                if (isNaN(value) || value <= 0) {
                    throw new Error(`${key} 的匯率格式不正確`);
                }
                ratesAsNumbers[key] = value;
            });

            await updateSettings({
                exchangeRates: JSON.stringify(ratesAsNumbers)
            });

            setShowExchangeRateModal(false);
            Alert.alert('成功', '匯率已更新');
        } catch (error: any) {
            Alert.alert('錯誤', error.message);
        }
    };

    // 重置為預設匯率
    const handleResetExchangeRates = () => {
        const ratesAsStrings: { [key: string]: string } = {};
        Object.keys(DEFAULT_EXCHANGE_RATES).forEach(key => {
            ratesAsStrings[key] = DEFAULT_EXCHANGE_RATES[key].toString();
        });
        setEditingRates(ratesAsStrings);
    };

    const currencies = [
        { code: 'TWD', name: '新台幣' },
        { code: 'USD', name: '美金' },
        { code: 'JPY', name: '日圓' },
        { code: 'CNY', name: '人民幣' },
        { code: 'HKD', name: '港幣' },
        { code: 'MOP', name: '澳門幣' },
        { code: 'GBP', name: '英鎊' },
        { code: 'KRW', name: '韓元' },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* 帳號管理 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>帳號管理</Text>

                {!isAuthenticated ? (
                    <>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder="Email"
                            placeholderTextColor={colors.subtleText}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                            placeholder="密碼"
                            placeholderTextColor={colors.subtleText}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.accent }]}
                                onPress={handleLogin}
                            >
                                <Text style={styles.buttonText}>登入</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, { backgroundColor: colors.accent }]}
                                onPress={handleRegister}
                            >
                                <Text style={styles.buttonText}>註冊</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <>
                        <Text style={[styles.userInfo, { color: colors.text }]}>
                            已登入: {user?.email}
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.expense }]}
                            onPress={handleLogout}
                        >
                            <Text style={styles.buttonText}>登出</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* 雲端同步 */}
            {isAuthenticated && (
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>雲端同步</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.accent }]}
                            onPress={handleSyncToCloud}
                        >
                            <Ionicons name="cloud-upload" size={20} color="#fff" />
                            <Text style={styles.buttonText}>上傳</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: colors.accent }]}
                            onPress={handleSyncFromCloud}
                        >
                            <Ionicons name="cloud-download" size={20} color="#fff" />
                            <Text style={styles.buttonText}>下載</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* 幣別設定 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>主要幣別</Text>
                <View style={styles.currencyGrid}>
                    {currencies.map((currency) => (
                        <TouchableOpacity
                            key={currency.code}
                            style={[
                                styles.currencyButton,
                                { backgroundColor: colors.card, borderColor: colors.borderColor },
                                settings?.mainCurrency === currency.code && {
                                    backgroundColor: colors.accent,
                                    borderColor: colors.accent,
                                },
                            ]}
                            onPress={() => handleCurrencyChange(currency.code)}
                        >
                            <Text
                                style={[
                                    styles.currencyCode,
                                    { color: colors.text },
                                    settings?.mainCurrency === currency.code && { color: '#ffffff' },
                                ]}
                            >
                                {currency.code}
                            </Text>
                            <Text
                                style={[
                                    styles.currencyName,
                                    { color: colors.subtleText },
                                    settings?.mainCurrency === currency.code && { color: 'rgba(255,255,255,0.8)' },
                                ]}
                            >
                                {currency.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 匯率編輯按鈕 */}
                <TouchableOpacity
                    style={[styles.exchangeRateButton, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                    onPress={handleOpenExchangeRateEditor}
                >
                    <Ionicons name="swap-horizontal" size={20} color={colors.accent} />
                    <Text style={[styles.exchangeRateButtonText, { color: colors.text }]}>
                        編輯匯率
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 主題設定 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>主題</Text>
                <TouchableOpacity
                    style={[styles.themeButton, { backgroundColor: colors.card }]}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={theme === 'dark' ? 'moon' : 'sunny'}
                        size={20}
                        color={colors.accent}
                    />
                    <Text style={[styles.themeButtonText, { color: colors.text }]}>
                        {theme === 'dark' ? '深色模式' : '淺色模式'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* 應用程式資訊 */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>關於</Text>
                <Text style={[styles.infoText, { color: colors.subtleText }]}>
                    SubTrack v1.0.0
                </Text>
                <Text style={[styles.infoText, { color: colors.subtleText }]}>
                    訂閱管理應用程式
                </Text>
            </View>

            {/* 匯率編輯 Modal */}
            <Modal
                visible={showExchangeRateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowExchangeRateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>編輯匯率</Text>
                            <TouchableOpacity onPress={() => setShowExchangeRateModal(false)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={[styles.modalHint, { color: colors.subtleText }]}>
                                匯率相對於 TWD (新台幣 = 1)
                            </Text>

                            {currencies.map((currency) => (
                                <View key={currency.code} style={styles.rateRow}>
                                    <View style={styles.rateLabel}>
                                        <Text style={[styles.rateCurrency, { color: colors.text }]}>
                                            {currency.code}
                                        </Text>
                                        <Text style={[styles.rateName, { color: colors.subtleText }]}>
                                            {currency.name}
                                        </Text>
                                    </View>
                                    <TextInput
                                        style={[styles.rateInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderColor }]}
                                        value={editingRates[currency.code] || ''}
                                        onChangeText={(text) => setEditingRates({
                                            ...editingRates,
                                            [currency.code]: text,
                                        })}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        placeholderTextColor={colors.subtleText}
                                    />
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalButton, { borderColor: colors.borderColor }]}
                                onPress={handleResetExchangeRates}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                                    重置為預設
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.accent }]}
                                onPress={handleSaveExchangeRates}
                            >
                                <Text style={[styles.modalButtonText, { color: '#ffffff' }]}>
                                    儲存
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    userInfo: {
        fontSize: 14,
        marginBottom: 12,
    },
    currencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    currencyButton: {
        width: '48%',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    currencyCode: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    currencyName: {
        fontSize: 12,
    },
    exchangeRateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        gap: 8,
    },
    exchangeRateButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    themeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 12,
    },
    themeButtonText: {
        fontSize: 16,
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        padding: 20,
    },
    modalHint: {
        fontSize: 14,
        marginBottom: 16,
        fontStyle: 'italic',
    },
    rateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    rateLabel: {
        flex: 1,
    },
    rateCurrency: {
        fontSize: 16,
        fontWeight: '600',
    },
    rateName: {
        fontSize: 12,
    },
    rateInput: {
        width: 120,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        fontSize: 16,
        textAlign: 'right',
    },
    modalFooter: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
    },
    saveButton: {
        borderWidth: 0,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
