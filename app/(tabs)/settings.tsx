import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Switch,
    Linking,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { loginUser as login, registerUser as register, logoutUser as logout } from '../../src/services/authService';
import { DEFAULT_EXCHANGE_RATES } from '../../src/types';
import { useToast } from '../../src/context/ToastContext';
import { sendTestNotification } from '../../src/utils/notificationHelper';

type ModalType = 'sync' | 'currency' | 'theme' | 'exchangeRate' | 'auth' | 'notification' | null;

export default function SettingsScreen() {
    const { colors, theme, toggleTheme } = useTheme();
    const { user, isAuthenticated } = useAuth();
    const { settings, updateSettings, syncToCloud, syncFromCloud } = useDatabase();
    const { showToast } = useToast();

    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [editingRates, setEditingRates] = useState<{ [key: string]: string }>({});
    const [newCurrencyCode, setNewCurrencyCode] = useState('');
    const [newCurrencyRate, setNewCurrencyRate] = useState('');
    const [notificationPermission, setNotificationPermission] = useState<string>('undetermined');

    // 檢查通知權限
    useEffect(() => {
        checkNotificationPermission();
    }, []);

    const checkNotificationPermission = async () => {
        if (Platform.OS === 'web') {
            setNotificationPermission('unsupported');
            return;
        }
        const { status } = await Notifications.getPermissionsAsync();
        setNotificationPermission(status);
    };

    // 開啟系統設定
    const openSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
        } else if (Platform.OS === 'android') {
            Linking.openSettings();
        }
    };

    // 發送測試通知
    const handleSendTestNotification = async () => {
        try {
            await sendTestNotification();
            showToast('測試通知已發送！', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 處理登入
    const handleLogin = async () => {
        try {
            await login(email, password);
            showToast('登入成功！', 'success');
            setEmail('');
            setPassword('');
            setActiveModal(null);
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 處理註冊
    const handleRegister = async () => {
        try {
            await register(email, password);
            showToast('註冊成功！', 'success');
            setEmail('');
            setPassword('');
            setActiveModal(null);
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 處理登出
    const handleLogout = async () => {
        try {
            await logout();
            showToast('已登出', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 處理雲端同步
    const handleSyncToCloud = async () => {
        try {
            await syncToCloud();
            showToast('資料已上傳到雲端', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleSyncFromCloud = async () => {
        try {
            await syncFromCloud();
            showToast('資料已從雲端下載', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 處理幣別變更
    const handleCurrencyChange = async (currency: string) => {
        await updateSettings({ mainCurrency: currency });
    };

    // 開啟匯率編輯器
    const handleOpenExchangeRateEditor = () => {
        const storedRates = settings?.exchangeRates
            ? JSON.parse(settings.exchangeRates)
            : {};

        // 合併預設匯率與儲存的匯率
        const mergedRates = { ...DEFAULT_EXCHANGE_RATES, ...storedRates };

        const ratesAsStrings: { [key: string]: string } = {};
        Object.keys(mergedRates).forEach(key => {
            ratesAsStrings[key] = (mergedRates as any)[key].toString();
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
            showToast('匯率已更新', 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    // 重置為預設匯率
    const handleResetExchangeRates = () => {
        const ratesAsStrings: { [key: string]: string } = {};
        Object.keys(DEFAULT_EXCHANGE_RATES).forEach(key => {
            ratesAsStrings[key] = (DEFAULT_EXCHANGE_RATES as any)[key].toString();
        });
        setEditingRates(ratesAsStrings);
    };

    // 新增自訂幣別
    const handleAddCurrency = () => {
        if (!newCurrencyCode || !newCurrencyRate) {
            showToast('請輸入幣別代碼與匯率', 'error');
            return;
        }

        const code = newCurrencyCode.toUpperCase();
        if (editingRates[code]) {
            showToast('此幣別已存在', 'error');
            return;
        }

        setEditingRates(prev => ({
            ...prev,
            [code]: newCurrencyRate
        }));
        setNewCurrencyCode('');
        setNewCurrencyRate('');
        showToast(`已新增 ${code}`, 'success');
    };

    // 刪除幣別
    const handleDeleteCurrency = (code: string) => {
        // 不允許刪除預設幣別
        if (DEFAULT_EXCHANGE_RATES.hasOwnProperty(code)) {
            showToast('無法刪除預設幣別', 'error');
            return;
        }

        const newRates = { ...editingRates };
        delete newRates[code];
        setEditingRates(newRates);
        showToast(`已刪除 ${code}`, 'success');
    };

    // 取得所有可用幣別列表 (包含自訂)
    const getAvailableCurrencies = () => {
        const storedRates = settings?.exchangeRates
            ? JSON.parse(settings.exchangeRates)
            : {};

        // 合併預設匯率與儲存的匯率，確保新加入的預設幣別也會顯示
        const mergedRates = { ...DEFAULT_EXCHANGE_RATES, ...storedRates };

        return Object.keys(mergedRates).sort();
    };

    const availableCurrencies = getAvailableCurrencies();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
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

                    {/* 通知設定 */}
                    <TouchableOpacity
                        style={[styles.settingItem, { backgroundColor: colors.card, borderColor: colors.borderColor }]}
                        onPress={() => setActiveModal('notification')}
                    >
                        <View style={styles.settingIcon}>
                            <Ionicons name="notifications" size={24} color={colors.accent} />
                        </View>
                        <View style={styles.settingContent}>
                            <Text style={[styles.settingTitle, { color: colors.text }]}>通知設定</Text>
                            <Text style={[styles.settingSubtitle, { color: colors.subtleText }]}>
                                管理訂閱提醒與通知
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
                                    <View style={{ gap: 16, marginTop: 8 }}>
                                        <TouchableOpacity
                                            style={[
                                                styles.button,
                                                {
                                                    backgroundColor: colors.accent,
                                                    width: '100%',
                                                    // Flat style for all platforms
                                                }
                                            ]}
                                            onPress={handleLogin}
                                        >
                                            <Text style={styles.buttonText}>登入</Text>
                                        </TouchableOpacity>

                                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                                            <Text style={{ color: colors.subtleText, fontSize: 14 }}>還沒有帳號？ </Text>
                                            <TouchableOpacity onPress={handleRegister}>
                                                <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: 14 }}>立即註冊</Text>
                                            </TouchableOpacity>
                                        </View>
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
                                {availableCurrencies.map((code) => (
                                    <TouchableOpacity
                                        key={code}
                                        style={[
                                            styles.currencyButton,
                                            { backgroundColor: colors.card, borderColor: colors.borderColor },
                                            settings?.mainCurrency === code && {
                                                backgroundColor: colors.accent,
                                                borderColor: colors.accent,
                                            },
                                        ]}
                                        onPress={() => handleCurrencyChange(code)}
                                    >
                                        <Text
                                            style={[
                                                styles.currencyCode,
                                                { color: colors.text },
                                                settings?.mainCurrency === code && { color: '#ffffff' },
                                            ]}
                                        >
                                            {code}
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
                                    編輯匯率與新增幣別
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal >

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

                            {/* 新增幣別區塊 */}
                            <View style={[styles.addCurrencySection, { borderColor: colors.borderColor, backgroundColor: colors.card }]}>
                                <Text style={[styles.sectionSubtitle, { color: colors.text }]}>新增幣別</Text>
                                <View style={styles.addCurrencyRow}>
                                    <TextInput
                                        style={[styles.smallInput, { color: colors.text, borderColor: colors.borderColor }]}
                                        placeholder="代碼 (Ex: EUR)"
                                        placeholderTextColor={colors.subtleText}
                                        value={newCurrencyCode}
                                        onChangeText={setNewCurrencyCode}
                                        autoCapitalize="characters"
                                        maxLength={3}
                                    />
                                    <TextInput
                                        style={[styles.smallInput, { color: colors.text, borderColor: colors.borderColor }]}
                                        placeholder="匯率"
                                        placeholderTextColor={colors.subtleText}
                                        value={newCurrencyRate}
                                        onChangeText={setNewCurrencyRate}
                                        keyboardType="decimal-pad"
                                    />
                                    <TouchableOpacity
                                        style={[styles.addButton, { backgroundColor: colors.accent }]}
                                        onPress={handleAddCurrency}
                                    >
                                        <Ionicons name="add" size={24} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Text style={[styles.sectionSubtitle, { color: colors.text, marginTop: 16, marginBottom: 8 }]}>現有匯率</Text>
                            {Object.keys(editingRates).sort().map((code) => (
                                <View key={code} style={styles.rateRow}>
                                    <View style={styles.rateLabel}>
                                        <Text style={[styles.rateCurrency, { color: colors.text }]}>
                                            {code}
                                        </Text>
                                        {!DEFAULT_EXCHANGE_RATES.hasOwnProperty(code) && (
                                            <Text style={[styles.customBadge, { color: colors.accent }]}>
                                                自訂
                                            </Text>
                                        )}
                                    </View>
                                    <TextInput
                                        style={[styles.rateInput, { backgroundColor: colors.card, color: colors.text, borderColor: colors.borderColor }]}
                                        value={editingRates[code] || ''}
                                        onChangeText={(text) => setEditingRates({
                                            ...editingRates,
                                            [code]: text,
                                        })}
                                        keyboardType="decimal-pad"
                                        placeholder="0.00"
                                        placeholderTextColor={colors.subtleText}
                                    />
                                    {!DEFAULT_EXCHANGE_RATES.hasOwnProperty(code) && (
                                        <TouchableOpacity
                                            style={[styles.deleteButton, { backgroundColor: colors.expense }]}
                                            onPress={() => handleDeleteCurrency(code)}
                                        >
                                            <Ionicons name="trash-outline" size={18} color="#ffffff" />
                                        </TouchableOpacity>
                                    )}
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

            {/* 通知設定 Modal */}
            <Modal
                visible={activeModal === 'notification'}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setActiveModal(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>通知設定</Text>
                            <TouchableOpacity onPress={() => setActiveModal(null)}>
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalContent}>
                            {/* 權限狀態 */}
                            <Text style={[styles.modalSectionTitle, { color: colors.text }]}>權限狀態</Text>
                            <View style={[styles.permissionCard, { backgroundColor: colors.card, borderColor: colors.borderColor }]}>
                                {notificationPermission === 'granted' ? (
                                    <>
                                        <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                                        <Text style={[styles.permissionText, { color: colors.text }]}>通知權限已授予</Text>
                                    </>
                                ) : notificationPermission === 'denied' ? (
                                    <>
                                        <Ionicons name="close-circle" size={32} color="#ef4444" />
                                        <Text style={[styles.permissionText, { color: colors.text }]}>通知權限被拒絕</Text>
                                        <TouchableOpacity
                                            style={[styles.button, { backgroundColor: colors.accent, marginTop: 12 }]}
                                            onPress={openSettings}
                                        >
                                            <Text style={styles.buttonText}>開啟系統設定</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <Ionicons name="alert-circle" size={32} color={colors.subtleText} />
                                        <Text style={[styles.permissionText, { color: colors.text }]}>尚未請求權限</Text>
                                    </>
                                )}
                            </View>

                            {/* 全域通知開關 */}
                            <Text style={[styles.modalSectionTitle, { color: colors.text, marginTop: 24 }]}>全域通知</Text>
                            <View style={[styles.switchRow, { backgroundColor: colors.card, borderColor: colors.borderColor }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.switchLabel, { color: colors.text }]}>啟用所有訂閱通知</Text>
                                    <Text style={[styles.switchHint, { color: colors.subtleText }]}>關閉後將不會收到任何訂閱提醒</Text>
                                </View>
                                <Switch
                                    value={settings?.notificationsEnabled !== false}
                                    onValueChange={(value) => updateSettings({ notificationsEnabled: value })}
                                    trackColor={{ false: colors.borderColor, true: colors.accent }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
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
        borderRadius: 8,
        minHeight: 48,
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
        padding: 14,
        borderRadius: 12,
        gap: 8,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        marginTop: 12,
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
    addCurrencySection: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
    },
    addCurrencyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 8,
    },
    smallInput: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 14,
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 8,
    },
    customBadge: {
        fontSize: 10,
        fontWeight: '600',
        marginLeft: 6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
    },
    permissionCard: {
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        gap: 8,
    },
    permissionText: {
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    switchHint: {
        fontSize: 12,
        marginTop: 4,
    },
});
