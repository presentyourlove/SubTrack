import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useDatabase } from '../../src/context/DatabaseContext';
import { SubscriptionCategory } from '../../src/types';
import {
    SummaryCard,
    AlertCard,
    SubscriptionCard,
    AddSubscriptionModal,
    CategoryTabs,
} from '../../src/components';

export default function SubscriptionsScreen() {
    const { colors } = useTheme();
    const { subscriptions, addSubscription, updateSubscription, deleteSubscription, refreshData, loading } = useDatabase();

    const [selectedCategory, setSelectedCategory] = useState<'all' | SubscriptionCategory>('all');
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<number | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // 篩選訂閱
    const filteredSubscriptions = selectedCategory === 'all'
        ? subscriptions
        : subscriptions.filter(sub => sub.category === selectedCategory);

    // 處理新增訂閱
    const handleAddSubscription = async (data: any) => {
        try {
            await addSubscription(data);
            setModalVisible(false);
        } catch (error) {
            console.error('Failed to add subscription:', error);
            alert('新增訂閱失敗，請稍後再試');
        }
    };

    // 處理編輯訂閱
    const handleEditSubscription = (id: number) => {
        setEditingSubscription(id);
        // TODO: 實作編輯功能
        alert('編輯功能即將推出');
    };

    // 處理刪除訂閱
    const handleDeleteSubscription = async (id: number) => {
        try {
            await deleteSubscription(id);
        } catch (error) {
            console.error('Failed to delete subscription:', error);
            alert('刪除訂閱失敗，請稍後再試');
        }
    };

    // 下拉重新整理
    const onRefresh = async () => {
        setRefreshing(true);
        await refreshData();
        setRefreshing(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.background }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>訂閱管理</Text>
                <TouchableOpacity
                    style={[styles.addButton, { backgroundColor: colors.accent }]}
                    onPress={() => setModalVisible(true)}
                >
                    <Ionicons name="add" size={24} color="#ffffff" />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* 總覽卡片 */}
                <SummaryCard />

                {/* 提醒卡片 */}
                <AlertCard />

                {/* 分類篩選 */}
                <CategoryTabs
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                />

                {/* 訂閱列表 */}
                {filteredSubscriptions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="file-tray-outline" size={64} color={colors.subtleText} />
                        <Text style={[styles.emptyText, { color: colors.subtleText }]}>
                            {selectedCategory === 'all' ? '尚無訂閱' : '此分類尚無訂閱'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: colors.accent }]}
                            onPress={() => setModalVisible(true)}
                        >
                            <Text style={styles.emptyButtonText}>新增第一筆訂閱</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.list}>
                        {filteredSubscriptions.map((subscription) => (
                            <SubscriptionCard
                                key={subscription.id}
                                subscription={subscription}
                                onEdit={() => handleEditSubscription(subscription.id)}
                                onDelete={() => handleDeleteSubscription(subscription.id)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* 新增訂閱彈窗 */}
            <AddSubscriptionModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleAddSubscription}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    list: {
        paddingBottom: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
        marginBottom: 24,
    },
    emptyButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    emptyButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
