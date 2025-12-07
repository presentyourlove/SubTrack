import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../src/context/ThemeContext';

export default function BudgetScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>預算追蹤</Text>
                <Text style={[styles.subtitle, { color: colors.subtleText }]}>
                    分析您的訂閱支出趨勢
                </Text>

                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
                        即將推出
                    </Text>
                    <Text style={[styles.cardText, { color: colors.subtleText }]}>
                        • 週/月/年支出統計{'\n'}
                        • 長條圖趨勢分析{'\n'}
                        • 圓餅圖分類占比{'\n'}
                        • 按分類/應用程式顯示明細
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
