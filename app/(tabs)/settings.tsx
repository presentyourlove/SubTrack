import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/context/ThemeContext';
import ThemeSettings from '../../src/components/settings/ThemeSettings';
import CurrencySettings from '../../src/components/settings/CurrencySettings';
import NotificationSettings from '../../src/components/settings/NotificationSettings';
import SyncSettings from '../../src/components/settings/SyncSettings';
import AboutSection from '../../src/components/settings/AboutSection';

export default function SettingsScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.settingsList}>
          <ThemeSettings />
          <CurrencySettings />
          <NotificationSettings />
          <SyncSettings />
        </View>
        <AboutSection />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  settingsList: {
    gap: 12,
    marginBottom: 32,
  },
});
