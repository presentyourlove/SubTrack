import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useDatabase } from '../../context/DatabaseContext';
import i18n from '../../i18n';
import { Ionicons } from '@expo/vector-icons';

export default function LanguageSettings() {
  const { colors } = useTheme();
  const { settings, updateSettings } = useDatabase();

  // 取得語言 (優先使用設定，否則使用 i18n 初始值)
  const currentLanguage = settings?.language || (i18n.locale.startsWith('zh') ? 'zh' : 'en');

  const languages = [
    { code: 'zh', label: '繁體中文', icon: '文' },
    { code: 'en', label: 'English', icon: 'A' },
  ] as const;

  const handleLanguageChange = async (lang: 'zh' | 'en') => {
    try {
      await updateSettings({ language: lang });
      // i18n locale update is handled by DatabaseContext effect
    } catch (error) {
      console.error('Failed to update language:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="language" size={20} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>{i18n.t('settings.language')}</Text>
        </View>
      </View>

      <View style={styles.options}>
        {languages.map((lang) => (
          <TouchableOpacity
            accessibilityRole="button"
            key={lang.code}
            style={[
              styles.option,
              {
                borderColor: currentLanguage === lang.code ? colors.accent : colors.borderColor,
                backgroundColor:
                  currentLanguage === lang.code ? colors.accent + '10' : 'transparent',
              },
            ]}
            onPress={() => handleLanguageChange(lang.code)}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: currentLanguage === lang.code ? colors.accent : colors.subtleText,
                  fontWeight: currentLanguage === lang.code ? '600' : '400',
                },
              ]}
            >
              {lang.label}
            </Text>
            {currentLanguage === lang.code && (
              <Ionicons name="checkmark-circle" size={18} color={colors.accent} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  optionText: {
    fontSize: 14,
  },
});
