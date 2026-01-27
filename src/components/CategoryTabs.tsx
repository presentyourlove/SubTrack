import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SubscriptionCategory } from '../types';
import i18n from '../i18n';
import { hapticFeedback } from '../utils/haptics';

type CategoryTabsProps = {
  selectedCategory: 'all' | SubscriptionCategory;
  onSelectCategory: (category: 'all' | SubscriptionCategory) => void;
};

export default function CategoryTabs({ selectedCategory, onSelectCategory }: CategoryTabsProps) {
  const { colors } = useTheme();

  const categories: { value: 'all' | SubscriptionCategory; label: string }[] = [
    { value: 'all', label: i18n.t('categories.all') },
    { value: 'entertainment', label: i18n.t('categories.entertainment') },
    { value: 'productivity', label: i18n.t('categories.productivity') },
    { value: 'lifestyle', label: i18n.t('categories.lifestyle') },
    { value: 'other', label: i18n.t('categories.other') },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.value}
          style={[
            styles.tab,
            { backgroundColor: colors.card, borderColor: colors.borderColor },
            selectedCategory === cat.value && {
              backgroundColor: colors.accent,
              borderColor: colors.accent,
            },
          ]}
          onPress={() => {
            hapticFeedback.selection();
            onSelectCategory(cat.value);
          }}
          accessibilityRole="button"
          accessibilityLabel={cat.label}
          accessibilityState={{ selected: selectedCategory === cat.value }}
        >
          <Text
            style={[
              styles.tabText,
              { color: colors.text },
              selectedCategory === cat.value && { color: '#ffffff' },
            ]}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    paddingHorizontal: 4,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
