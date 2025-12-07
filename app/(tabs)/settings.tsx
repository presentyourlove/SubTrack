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

type ModalType = 'sync' | 'currency' | 'theme' | 'exchangeRate' | 'auth' | null;

export default function SettingsScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { settings, updateSettings, syncToCloud, syncFromCloud } = useDatabase();

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [editingRates, setEditingRates] = useState<{ [key: string]: string }>({});

    // 處理登入
    const handleLogin = async () => {
        try {
            await login(email, password);
            Alert.alert('成功', '登入成功！');
            setEmail('');
            setPassword('');
            setActiveModal(null);
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
            setActiveModal(null);
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

        const ratesAsStrings: { [key: string]: string } = {};
        Object.keys(currentRates).forEach(key => {
            ratesAsStrings[key] = currentRates[key].toString();
        });

        setEditingRates(ratesAsStrings);
        setActiveModal('exchangeRate');
    };

    // 儲存匯率
    const handleSaveExchangeRates = async () => {
        try {
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

            setActiveModal(null);
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
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={styles.scrollView}>
                {/* 設定列表 */}
                <View style={styles.settingsList}>
                    {/* 主題管理 */}
                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                        onPress={() => setActiveModal('theme')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name={theme === 'dark' ? 'moon' : 'sunny'} size={24} color={colors.accent} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>主題管理</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
                                {theme === 'dark' ? '深色模式' : '淺色模式'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                    </TouchableOpacity>

                    {/* 幣別管理 */}
                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                        onPress={() => setActiveModal('currency')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="cash" size={24} color={colors.accent} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>幣別管理</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
                                主要幣別: {settings?.mainCurrency || 'TWD'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                    </TouchableOpacity>

                    {/* 同步管理 */}
                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                        onPress={() => setActiveModal('sync')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="cloud" size={24} color={colors.accent} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>同步管理</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
                                {isAuthenticated ? `已登入: ${user?.email}` : '登入以啟用雲端同步'}
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.subtleText} />
                    </TouchableOpacity>
                </View>

                {/* 關於 */}
                <View style={styles.aboutSection}>
                    <Text style={[styles.aboutTitle, { color: colors.subtleText }]}>關於</Text>
                    <Text style={[styles.aboutText, { color: colors.subtleText }]}>SubTrack v1.0.0</Text>
                    <Text style={[styles.aboutText, { color: colors.subtleText }]}>訂閱管理應用程式</Text>
                </View>
            </ScrollView>

            {/* 同步管理 Modal */}
            <Modal
                visible={activeModal === 'sync'}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>同步管理</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {!isAuthenticated ? (
                                <View>
                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>登入或註冊</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderColor }]}
                                        placeholder="Email"
                                        placeholderTextColor={colors.subtleText}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderColor }]}
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
                                </View>
                            ) : (
                                <View>
                                    <Text style={[styles.userInfo, { color: colors.text }]}>
                                        已登入: {user?.email}
                                    </Text>

                                    <Text style={[styles.modalSectionTitle, { color: colors.text }]}>雲端同步</Text>
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

                                    <TouchableOpacity
                                        style={[styles.button, styles.logoutButton, { backgroundColor: colors.expense }]}
                                        onPress={handleLogout}
                                    >
                                        <Text style={styles.buttonText}>登出</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* 幣別管理 Modal */}
            <Modal
                visible={activeModal === 'currency'}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>幣別管理</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>主要幣別</Text>
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

                            <TouchableOpacity
                                style={[styles.exchangeRateButton, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                                onPress={handleOpenExchangeRateEditor}
                            >
                                <Ionicons name="swap-horizontal" size={20} color={colors.accent} />
                                <Text style={[styles.exchangeRateButtonText, { color: colors.text }]}>
                                    編輯匯率
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* 主題管理 Modal */}
            <Modal
                visible={activeModal === 'theme'}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>主題管理</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalContent}>
                            <TouchableOpacity
                                style={[styles.themeOption, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                                onPress={() => {
                                    if (theme === 'dark') toggleTheme();
                                    setActiveModal(null);
                                }}
                            >
                                <Ionicons name="sunny" size={24} color={theme === 'light' ? colors.accent : colors.subtleText} />
                                <Text style={[styles.themeOptionText, { color: colors.text }]}>淺色模式</Text>
                                {theme === 'light' && <Ionicons name="checkmark" size={24} color={colors.accent} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.themeOption, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                                onPress={() => {
                                    if (theme === 'light') toggleTheme();
                                    setActiveModal(null);
                                }}
                            >
                                <Ionicons name="moon" size={24} color={theme === 'dark' ? colors.accent : colors.subtleText} />
                                <Text style={[styles.themeOptionText, { color: colors.text }]}>深色模式</Text>
                                {theme === 'dark' && <Ionicons name="checkmark" size={24} color={colors.accent} />}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 匯率編輯 Modal */}
            <Modal
                visible={activeModal === 'exchangeRate'}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>編輯匯率</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
        padding: 16,
    },
    settingsList: {
        gap: 12,
        marginBottom: 32,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingSubtitle: {
        fontSize: 13,
    },
    aboutSection: {
        padding: 16,
        alignItems: 'center',
    },
    aboutTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    aboutText: {
        fontSize: 13,
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
    modalSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 12,
        marginTop: 8,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        borderWidth: 1,
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
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
    logoutButton: {
        marginTop: 12,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    userInfo: {
        fontSize: 14,
        marginBottom: 16,
    },
    currencyGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 16,
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
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        gap: 12,
    },
    themeOptionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
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
