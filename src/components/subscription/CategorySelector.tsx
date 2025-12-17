import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SubscriptionCategory } from '../../types';
import i18n from '../../i18n';

type CategorySelectorProps = {
  category: SubscriptionCategory;
  setCategory: (category: SubscriptionCategory) => void;
};

export default function CategorySelector({ category, setCategory }: CategorySelectorProps) {
  const { colors } = useTheme();

  const categories: { value: SubscriptionCategory; label: string }[] = [
    { value: 'entertainment', label: i18n.t('categories.entertainment') },
    { value: 'productivity', label: i18n.t('categories.productivity') },
    { value: 'lifestyle', label: i18n.t('categories.lifestyle') },
    { value: 'other', label: i18n.t('categories.other') },
  ];

  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.text }]}>
        {i18n.t('subscription.category')} *
      </Text>
      <View style={styles.categoryButtons}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[
              styles.categoryButton,
              { backgroundColor: colors.inputBackground, borderColor: colors.borderColor },
              category === cat.value && {
                backgroundColor: colors.accent,
                borderColor: colors.accent,
              },
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
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
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
});
