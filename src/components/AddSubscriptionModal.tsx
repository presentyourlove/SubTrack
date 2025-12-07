import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
    FlatList,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../context/ThemeContext';
import { SubscriptionCategory, BillingCycle, DEFAULT_EXCHANGE_RATES, Subscription } from '../types';

type AddSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    initialData?: Subscription | null;
    onSubmit: (data: {
        name: string;
        icon: string;
        category: SubscriptionCategory;
        price: number;
        currency: string;
        billingCycle: BillingCycle;
        startDate: string;
        reminderEnabled: boolean;
        reminderTime?: string;
        reminderDays?: number;
    }) => void;
};

export default function AddSubscriptionModal({
    visible,
    onClose,
    initialData,
    onSubmit,
}: AddSubscriptionModalProps) {
    const { colors } = useTheme();

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📱');
    const [category, setCategory] = useState<SubscriptionCategory>('entertainment');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('TWD');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [reminderDays, setReminderDays] = useState(0);

    // Initialize/Reset form when modal opens or initialData changes
    useEffect(() => {
        if (visible) {
            if (initialData) {
                // Editing existing subscription
                setName(initialData.name);
                setIcon(initialData.icon);
                setCategory(initialData.category);
                setPrice(initialData.price.toString());
                setCurrency(initialData.currency);
                setBillingCycle(initialData.billingCycle);
                setStartDate(initialData.startDate);
                setReminderEnabled(initialData.reminderEnabled);

                if (initialData.reminderTime) {
                    const [hours, minutes] = initialData.reminderTime.split(':');
                    const timeDate = new Date();
                    timeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                    setReminderTime(timeDate);
                } else {
                    setReminderTime(new Date());
                }

                setReminderDays(initialData.reminderDays || 0);
            } else {
                // Adding new subscription
                setName('');
                setIcon('📱');
                setCategory('entertainment');
                setPrice('');
                setCurrency('TWD');
                setBillingCycle('monthly');
                setStartDate(new Date().toISOString().split('T')[0]);
                setReminderEnabled(false);
                setReminderTime(new Date());
                setReminderDays(0);
            }
        }
    }, [visible, initialData]);

    // UI State
    const [currencyModalVisible, setCurrencyModalVisible] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showDaysPicker, setShowDaysPicker] = useState(false);

    const SUPPORTED_CURRENCIES = Object.keys(DEFAULT_EXCHANGE_RATES);
    const REMINDER_DAYS_OPTIONS = Array.from({ length: 15 }, (_, i) => i); // 0-14 days

    const handleSubmit = () => {
        if (!name || !price || !startDate) {
            alert('請填寫所有必填欄位');
            return;
        }

        const formattedTime = reminderTime.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit'
        });

        onSubmit({
            name,
            icon,
            category,
            price: parseFloat(price),
            currency,
            billingCycle,
            startDate,
            reminderEnabled,
            reminderTime: reminderEnabled ? formattedTime : undefined,
            reminderDays: reminderEnabled ? reminderDays : undefined,
        });

        // Reset form
        setName('');
        setIcon('📱');
        setCategory('entertainment');
        setPrice('');
        setCurrency('TWD');
        setBillingCycle('monthly');
        setStartDate(new Date().toISOString().split('T')[0]);
        setReminderEnabled(false);
        setReminderDays(0);
    };

    const onTimeChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || reminderTime;
        setShowTimePicker(Platform.OS === 'ios');
        setReminderTime(currentDate);
    };

    const commonIcons = ['📱', '🎬', '🎵', '📺', '💼', '📚', '🏋️', '🍔', '☁️', '🎮'];
    const categories: { value: SubscriptionCategory; label: string }[] = [
        { value: 'entertainment', label: '娛樂' },
        { value: 'productivity', label: '生產力' },
        { value: 'lifestyle', label: '生活' },
        { value: 'other', label: '其他' },
    ];

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {initialData ? '編輯訂閱' : '新增訂閱'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content}>
                        {/* 訂閱名稱 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>訂閱名稱 *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={name}
                                onChangeText={setName}
                                placeholder="例: Netflix Premium"
                                placeholderTextColor={colors.subtleText}
                            />
                        </View>

                        {/* 圖示選擇 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>圖示</Text>
                            <View style={styles.iconGrid}>
                                {commonIcons.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        style={[
                                            styles.iconButton,
                                            { backgroundColor: colors.inputBackground },
                                            icon === emoji && { backgroundColor: colors.accent },
                                        ]}
                                        onPress={() => setIcon(emoji)}
                                    >
                                        <Text style={styles.iconEmoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 分類 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>分類 *</Text>
                            <View style={styles.categoryButtons}>
                                {categories.map((cat) => (
                                    <TouchableOpacity
                                        key={cat.value}
                                        style={[
                                            styles.categoryButton,
                                            { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                                            category === cat.value && { backgroundColor: colors.accent, borderColor: colors.accent },
                                        ]}
                                        onPress={() => setCategory(cat.value)}
                                    >
                                        <Text
                                            style={[
                                                styles.categoryText,
                                                { color: colors.text },
                                                category === cat.value && { color: '#ffffff' },
                                            ]}
                                        >
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* 價格 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>價格 *</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, styles.priceInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={price}
                                    onChangeText={setPrice}
                                    placeholder="390"
                                    placeholderTextColor={colors.subtleText}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    style={[styles.currencyButton, { backgroundColor: colors.inputBackground }]}
                                    onPress={() => setCurrencyModalVisible(true)}
                                >
                                    <Text style={[styles.currencyText, { color: colors.text }]}>{currency}</Text>
                                    <Ionicons name="chevron-down" size={16} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 扣款週期 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>扣款週期 *</Text>
                            <View style={styles.cycleContainer}>
                                <TouchableOpacity
                                    style={[
                                        styles.cycleButton,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                                        billingCycle === 'monthly' && { backgroundColor: colors.accent, borderColor: colors.accent },
                                    ]}
                                    onPress={() => setBillingCycle('monthly')}
                                >
                                    <Text
                                        style={[
                                            styles.cycleText,
                                            { color: colors.text },
                                            billingCycle === 'monthly' && { color: '#ffffff' },
                                        ]}
                                    >
                                        每月
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.cycleButton,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                                        billingCycle === 'quarterly' && { backgroundColor: colors.accent, borderColor: colors.accent },
                                    ]}
                                    onPress={() => setBillingCycle('quarterly')}
                                >
                                    <Text
                                        style={[
                                            styles.cycleText,
                                            { color: colors.text },
                                            billingCycle === 'quarterly' && { color: '#ffffff' },
                                        ]}
                                    >
                                        每季
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.cycleButton,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                                        billingCycle === 'yearly' && { backgroundColor: colors.accent, borderColor: colors.accent },
                                    ]}
                                    onPress={() => setBillingCycle('yearly')}
                                >
                                    <Text
                                        style={[
                                            styles.cycleText,
                                            { color: colors.text },
                                            billingCycle === 'yearly' && { color: '#ffffff' },
                                        ]}
                                    >
                                        每年
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.cycleButton,
                                        { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
                                        billingCycle === 'weekly' && { backgroundColor: colors.accent, borderColor: colors.accent },
                                    ]}
                                    onPress={() => setBillingCycle('weekly')}
                                >
                                    <Text
                                        style={[
                                            styles.cycleText,
                                            { color: colors.text },
                                            billingCycle === 'weekly' && { color: '#ffffff' },
                                        ]}
                                    >
                                        每週
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 訂閱開始日期 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>訂閱開始日期 *</Text>
                            {Platform.OS === 'web' ? (
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{
                                        height: 50,
                                        borderRadius: 12,
                                        paddingLeft: 16,
                                        paddingRight: 16,
                                        fontSize: 16,
                                        backgroundColor: colors.inputBackground,
                                        color: colors.text,
                                        border: 'none',
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        fontFamily: 'system-ui'
                                    }}
                                />
                            ) : (
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={startDate}
                                    onChangeText={setStartDate}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor={colors.subtleText}
                                />
                            )}
                        </View>

                        {/* 通知設定 */}
                        <View style={styles.field}>
                            <View style={styles.switchContainer}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>啟用通知</Text>
                                <Switch
                                    value={reminderEnabled}
                                    onValueChange={setReminderEnabled}
                                    trackColor={{ false: colors.borderColor, true: colors.accent }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>

                            {reminderEnabled && (
                                <View style={styles.reminderContainer}>
                                    <View style={styles.row}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.subLabel, { color: colors.subtleText }]}>通知時間</Text>
                                            {Platform.OS === 'web' ? (
                                                <input
                                                    type="time"
                                                    value={reminderTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                    onChange={(e) => {
                                                        const [hours, minutes] = e.target.value.split(':');
                                                        const newDate = new Date(reminderTime);
                                                        newDate.setHours(parseInt(hours, 10));
                                                        newDate.setMinutes(parseInt(minutes, 10));
                                                        setReminderTime(newDate);
                                                    }}
                                                    style={{
                                                        height: 50,
                                                        borderRadius: 12,
                                                        paddingLeft: 16,
                                                        paddingRight: 16,
                                                        fontSize: 16,
                                                        backgroundColor: colors.inputBackground,
                                                        color: colors.text,
                                                        border: 'none',
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        fontFamily: 'system-ui'
                                                    }}
                                                />
                                            ) : (
                                                <TouchableOpacity
                                                    style={[styles.input, { backgroundColor: colors.inputBackground }]}
                                                    onPress={() => setShowTimePicker(true)}
                                                >
                                                    <Text style={{ color: colors.text }}>
                                                        {reminderTime.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.subLabel, { color: colors.subtleText }]}>提前提醒 (天)</Text>
                                            <TouchableOpacity
                                                style={[styles.input, { backgroundColor: colors.inputBackground }]}
                                                onPress={() => setShowDaysPicker(true)}
                                            >
                                                <Text style={{ color: colors.text }}>{reminderDays} 天</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            )}
                        </View>

                        {Platform.OS !== 'web' && showTimePicker && (
                            <DateTimePicker
                                testID="dateTimePicker"
                                value={reminderTime}
                                mode="time"
                                is24Hour={true}
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[styles.footer, { borderTopColor: colors.borderColor }]}>
                        <TouchableOpacity
                            style={[
                                styles.button,
                                styles.cancelButton,
                                { backgroundColor: '#FF3B30', borderColor: '#FF3B30' }
                            ]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: '#ffffff' }]}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, { backgroundColor: colors.accent }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: '#ffffff' }]}>
                                {initialData ? '更新' : '新增'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Currency Modal */}
            <Modal
                visible={currencyModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setCurrencyModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setCurrencyModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>選擇幣別</Text>
                        <FlatList
                            data={SUPPORTED_CURRENCIES}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.currencyOption,
                                        item === currency && { backgroundColor: colors.inputBackground }
                                    ]}
                                    onPress={() => {
                                        setCurrency(item);
                                        setCurrencyModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.currencyOptionText,
                                            { color: colors.text },
                                            item === currency && { color: colors.accent, fontWeight: 'bold' }
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                    {item === currency && (
                                        <Ionicons name="checkmark" size={20} color={colors.accent} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Days Picker Modal */}
            <Modal
                visible={showDaysPicker}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowDaysPicker(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowDaysPicker(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>選擇提前天數</Text>
                        <FlatList
                            data={REMINDER_DAYS_OPTIONS}
                            keyExtractor={(item) => item.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.currencyOption, // Reusing similar style
                                        item === reminderDays && { backgroundColor: colors.inputBackground }
                                    ]}
                                    onPress={() => {
                                        setReminderDays(item);
                                        setShowDaysPicker(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.currencyOptionText,
                                            { color: colors.text },
                                            item === reminderDays && { color: colors.accent, fontWeight: 'bold' }
                                        ]}
                                    >
                                        {item} 天前
                                    </Text>
                                    {item === reminderDays && (
                                        <Ionicons name="checkmark" size={20} color={colors.accent} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        height: '90%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        justifyContent: 'center',
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconEmoji: {
        fontSize: 24,
    },
    categoryButtons: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: 14,
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    priceInput: {
        flex: 1,
    },
    currencyButton: {
        width: 100,
        height: 50,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    currencyText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cycleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    cycleButton: {
        flex: 1,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
    },
    cycleText: {
        fontSize: 14,
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 20,
        borderTopWidth: 1,
    },
    button: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    submitButton: {
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        maxHeight: '60%',
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    currencyOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ccc',
    },
    currencyOptionText: {
        fontSize: 16,
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    reminderContainer: {
        gap: 12,
    },
    subLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
});
