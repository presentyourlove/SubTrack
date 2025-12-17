import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../i18n';

export default function AboutSection() {
  const { colors } = useTheme();

  return (
    <View style={styles.aboutSection}>
      <Text style={[styles.aboutTitle, { color: colors.subtleText }]}>
        {i18n.t('settings.about')}
      </Text>
      <Text style={[styles.aboutText, { color: colors.subtleText }]}>SubTrack v1.0.0</Text>
      <Text style={[styles.aboutText, { color: colors.subtleText }]}>訂閱管理應用程式</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutSection: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 32,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    marginBottom: 4,
  },
});
