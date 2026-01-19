import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const hapticFeedback = {
  light: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignore web or unsupported
    }
  },
  medium: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Ignore
    }
  },
  heavy: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch {
      // Ignore
    }
  },
  success: async () => {
    if (isWeb) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Ignore
    }
  },
  error: async () => {
    if (isWeb) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch {
      // Ignore
    }
  },
  selection: async () => {
    if (isWeb) return;
    try {
      await Haptics.selectionAsync();
    } catch {
      // Ignore
    }
  },
};
