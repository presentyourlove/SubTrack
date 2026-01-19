import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import SubscriptionCard from '../SubscriptionCard';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../../i18n';
import { useRouter } from 'expo-router';
import { Subscription } from '../../types';
import AddSubscriptionModal from '../AddSubscriptionModal';
import { hapticFeedback } from '../../utils/haptics';
import { OptimizedList } from '../common/OptimizedList';

export default function SearchScreen() {
  const { colors } = useTheme();
  const { subscriptions, updateSubscription, deleteSubscription } = useDatabase();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  const filteredSubscriptions = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase();
    return subscriptions.filter(
      (sub) =>
        sub.name.toLowerCase().includes(lowerQuery) ||
        sub.description?.toLowerCase().includes(lowerQuery) ||
        i18n.t(`categories.${sub.category}`).toLowerCase().includes(lowerQuery) ||
        sub.tags?.some((tag) => tag.name.toLowerCase().includes(lowerQuery)),
    );
  }, [query, subscriptions]);

  const handleUpdate = async (data: Partial<Subscription>, tagIds: number[]) => {
    if (editingSubscription) {
      await updateSubscription(editingSubscription.id, { ...data }, tagIds);
      setEditingSubscription(null);
    }
  };

  const handleDelete = async (subscription: Subscription) => {
    await deleteSubscription(subscription.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header / Search Bar */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.borderColor,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.searchContainer, { backgroundColor: colors.inputBackground }]}>
          <Ionicons name="search" size={20} color={colors.subtleText} style={styles.searchIcon} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={i18n.t('search.placeholder')}
            placeholderTextColor={colors.subtleText}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                hapticFeedback.selection();
                setQuery('');
              }}
            >
              <Ionicons name="close-circle" size={20} color={colors.subtleText} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Results */}
      <OptimizedList<Subscription>
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id.toString()}
        estimatedItemSize={150}
        renderItem={({ item }: { item: Subscription }) => (
          <SubscriptionCard
            subscription={item}
            onEdit={() => setEditingSubscription(item)}
            onDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          query.trim().length > 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ color: colors.subtleText }}>{i18n.t('search.noResults')}</Text>
            </View>
          ) : null
        }
      />

      <AddSubscriptionModal
        visible={!!editingSubscription}
        onClose={() => setEditingSubscription(null)}
        initialData={editingSubscription || undefined}
        onSubmit={handleUpdate}
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
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  listContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
});
