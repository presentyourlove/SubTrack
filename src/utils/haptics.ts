import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

export const hapticFeedback = {
  light: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      // Ignore web or unsupported
    }
  },
  medium: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      // Ignore
    }
  },
  heavy: async () => {
    if (isWeb) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      // Ignore
    }
  },
  success: async () => {
    if (isWeb) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      // Ignore
    }
  },
  error: async () => {
    if (isWeb) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (e) {
      // Ignore
    }
  },
  selection: async () => {
    if (isWeb) return;
    try {
      await Haptics.selectionAsync();
    } catch (e) {
      // Ignore
    }
  },
};
