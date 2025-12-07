import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function SubscriptionsScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>訂閱管理</Text>
                <Text style={[styles.subtitle, { color: colors.subtleText }]}>
                    追蹤您的所有訂閱服務
                </Text>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        即將推出
                    </Text>
                    <Text style={[styles.cardText, { color: colors.subtleText }]}>
                        • 訂閱列表顯示{'\n'}
                        • 新增/編輯/刪除訂閱{'\n'}
                        • 分類篩選{'\n'}
                        • 到期提醒
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
    content: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 24,
    },
    card: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    cardText: {
        fontSize: 14,
        lineHeight: 24,
    },
});
