import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDatabase } from '../context/DatabaseContext';
import { useTheme } from '../context/ThemeContext';
import { hapticFeedback } from '../utils/haptics';

export default function PrivacyToggle() {
  const { settings, updateSettings } = useDatabase();
  const { colors } = useTheme();

  const isPrivacyMode = settings?.privacyMode || false;

  const handleToggle = async () => {
    await hapticFeedback.selection();
    await updateSettings({ privacyMode: !isPrivacyMode });
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={isPrivacyMode ? 'Show amounts' : 'Hide amounts'}
    >
      <Ionicons name={isPrivacyMode ? 'eye-off' : 'eye'} size={24} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
