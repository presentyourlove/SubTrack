import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../../src/context/DatabaseContext';
import { useTheme } from '../../src/context/ThemeContext';
import { Subscription, SubscriptionCategory } from '../../src/types';
import SummaryCard from '../../src/components/SummaryCard';
import SubscriptionCard from '../../src/components/SubscriptionCard';
import AddSubscriptionModal from '../../src/components/AddSubscriptionModal';
import CategoryTabs from '../../src/components/CategoryTabs';
import AlertCard from '../../src/components/AlertCard';
import WorkspaceSwitcher from '../../src/components/WorkspaceSwitcher';
import { PrivacyToggle } from '../../src/components';
import i18n from '../../src/i18n';
import TagChip from '../../src/components/TagChip';
import { hapticFeedback } from '../../src/utils/haptics';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    subscriptions,
    tags,
    refreshData,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    setTagsForSubscription,
  } = useDatabase();

  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | SubscriptionCategory>('all');
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // 當 App 回到前台時重新整理資料
  useEffect(() => {
    refreshData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const onRefresh = async () => {
    hapticFeedback.medium();
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const filteredSubscriptions = useMemo(() => {
    return subscriptions
      .filter((sub) => {
        if (selectedCategory === 'all') return true;
        return sub.category === selectedCategory;
      })
      .filter((sub) => {
        if (selectedTagId === null) return true;
        return sub.tags?.some((tag) => tag.id === selectedTagId);
      })
      .sort((a, b) => {
        // Sort by next billing date
        const dateA = new Date(a.nextBillingDate).getTime();
        const dateB = new Date(b.nextBillingDate).getTime();
        return dateA - dateB;
      });
  }, [subscriptions, selectedCategory, selectedTagId]);

  const activeSubscription = useMemo(
    () => (editingId ? subscriptions.find((s) => s.id === editingId) : undefined),
    [editingId, subscriptions],
  );

  const handleAddPress = () => {
    hapticFeedback.light();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditSubscription = (id: number) => {
    setEditingId(id);
    setModalVisible(true);
  };

  const handleDeleteSubscription = async (id: number) => {
    await deleteSubscription(id);
  };

  const handleSubmitSubscription = async (data: Partial<Subscription>, tagIds: number[]) => {
    try {
      if (editingId) {
        await updateSubscription(editingId, data);
        await setTagsForSubscription(editingId, tagIds);
      } else {
        await addSubscription(data as any, tagIds);
      }
      setModalVisible(false);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save subscription:', error);
      alert(i18n.t('common.error'));
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>SubTrack</Text>
            <WorkspaceSwitcher />
          </View>
        </View>
        <View style={styles.headerRight}>
          <PrivacyToggle />
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.accent }]}
            onPress={handleAddPress}
          >
            <Ionicons name="add" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <SummaryCard />
        <AlertCard />
        <CategoryTabs selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />

        {tags.length > 0 && (
          <View style={styles.tagFilterContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagFilterContent}
            >
              <TouchableOpacity
                style={[
                  styles.tagFilterChip,
                  { borderColor: colors.borderColor },
                  selectedTagId === null && { backgroundColor: colors.accent },
                ]}
                onPress={() => {
                  hapticFeedback.selection();
                  setSelectedTagId(null);
                }}
              >
                <Text
                  style={[
                    styles.tagFilterText,
                    { color: selectedTagId === null ? '#ffffff' : colors.text },
                  ]}
                >
                  {i18n.t('tags.allTags')}
                </Text>
              </TouchableOpacity>
              {tags.map((tag) => (
                <TagChip
                  key={tag.id}
                  tag={tag}
                  selected={selectedTagId === tag.id}
                  onPress={() => {
                    hapticFeedback.selection();
                    setSelectedTagId(selectedTagId === tag.id ? null : tag.id);
                  }}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {filteredSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="file-tray-outline" size={64} color={colors.subtleText} />
            <Text style={[styles.emptyText, { color: colors.subtleText }]}>
              {selectedCategory === 'all'
                ? i18n.t('subscription.emptyList')
                : i18n.t('subscription.emptyCategory')}
            </Text>
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: colors.accent }]}
              onPress={handleAddPress}
            >
              <Text style={styles.emptyButtonText}>{i18n.t('subscription.addFirst')}</Text>
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
                onSyncToCalendar={() => refreshData()}
                onUpdateCalendarId={async (eventId) => {
                  await updateSubscription(subscription.id, {
                    calendarEventId: eventId || undefined,
                  });
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <AddSubscriptionModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingId(null);
        }}
        onSubmit={handleSubmitSubscription}
        initialData={activeSubscription}
      />
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 20,
    gap: 16,
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
  tagFilterContainer: {
    marginBottom: 16,
  },
  tagFilterContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  tagFilterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  tagFilterText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
