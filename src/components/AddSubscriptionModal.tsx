import { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SubscriptionCategory, BillingCycle } from '../types';

type AddSubscriptionModalProps = {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        icon: string;
        category: SubscriptionCategory;
        price: number;
        currency: string;
        billingCycle: BillingCycle;
        nextBillingDate: string;
    }) => void;
};

export default function AddSubscriptionModal({
    visible,
    onClose,
    onSubmit,
}: AddSubscriptionModalProps) {
    const { colors } = useTheme();

    const [name, setName] = useState('');
    const [icon, setIcon] = useState('📱');
    const [category, setCategory] = useState<SubscriptionCategory>('entertainment');
    const [price, setPrice] = useState('');
    const [currency, setCurrency] = useState('TWD');
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [nextBillingDate, setNextBillingDate] = useState('');

    const handleSubmit = () => {
        if (!name || !price || !nextBillingDate) {
            alert('請填寫所有必填欄位');
            return;
        }

        onSubmit({
            name,
            icon,
            category,
            price: parseFloat(price),
            currency,
            billingCycle,
            nextBillingDate,
        });

        // 重置表單
        setName('');
        setIcon('📱');
        setCategory('entertainment');
        setPrice('');
        setCurrency('TWD');
        setBillingCycle('monthly');
        setNextBillingDate('');
    };

    const commonIcons = ['📱', '🎬', '🎵', '📺', '💼', '📚', '🏋️', '🍔', '☁️', '🎮'];
    const categories: { value: SubscriptionCategory; label: string }[] = [
        { value: 'entertainment', label: '娛樂' },
        { value: 'productivity', label: '生產力' },
        { value: 'lifestyle', label: '生活/其他' },
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
                        <Text style={[styles.title, { color: colors.text }]}>新增訂閱</Text>
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
                                <TextInput
                                    style={[styles.input, styles.currencyInput, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                    value={currency}
                                    onChangeText={setCurrency}
                                    placeholder="TWD"
                                    placeholderTextColor={colors.subtleText}
                                />
                            </View>
                        </View>

                        {/* 扣款週期 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>扣款週期 *</Text>
                            <View style={styles.row}>
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
                            </View>
                        </View>

                        {/* 下次扣款日期 */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>下次扣款日期 *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.text }]}
                                value={nextBillingDate}
                                onChangeText={setNextBillingDate}
                                placeholder="2025-12-15"
                                placeholderTextColor={colors.subtleText}
                            />
                            <Text style={[styles.hint, { color: colors.subtleText }]}>
                                格式: YYYY-MM-DD
                            </Text>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton, { borderColor: colors.borderColor }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.text }]}>取消</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton, { backgroundColor: colors.accent }]}
                            onPress={handleSubmit}
                        >
                            <Text style={[styles.buttonText, { color: '#ffffff' }]}>新增</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
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
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    field: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    iconGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconEmoji: {
        fontSize: 24,
    },
    categoryButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    categoryButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    categoryText: {
        fontSize: 14,
        fontWeight: '500',
    },
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    priceInput: {
        flex: 2,
    },
    currencyInput: {
        flex: 1,
    },
    cycleButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
    },
    cycleText: {
        fontSize: 14,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        borderWidth: 1,
    },
    submitButton: {},
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
