import React from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurity } from '../../context/SecurityContext';
import { useTheme } from '../../context/ThemeContext';
import i18n from '../../i18n';

export default function BiometricSettings() {
  const { isBiometricEnabled, setBiometricEnabled } = useSecurity();
  const { colors } = useTheme();

  const handleToggle = async (value: boolean) => {
    const success = await setBiometricEnabled(value);
    if (!success && value) {
      Alert.alert(i18n.t('common.error'), i18n.t('settings.security.setupFailed'));
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        <Ionicons name="finger-print" size={24} color={colors.primary} style={styles.icon} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {i18n.t('settings.security.biometricTitle')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {i18n.t('settings.security.biometricDesc')}
          </Text>
        </View>
        <Switch
          value={isBiometricEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isBiometricEnabled ? '#f4f3f4' : '#f4f3f4'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
  },
});
