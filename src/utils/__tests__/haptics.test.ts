/**
 * Haptics Utility Tests
 */

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Import after mock setup
import { hapticFeedback } from '../haptics';

describe('hapticFeedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('on native platform', () => {
    beforeAll(() => {
      (Platform as unknown as { OS: string }).OS = 'ios';
    });

    it('light() should call impactAsync with Light style', async () => {
      await hapticFeedback.light();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('medium() should call impactAsync with Medium style', async () => {
      await hapticFeedback.medium();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('heavy() should call impactAsync with Heavy style', async () => {
      await hapticFeedback.heavy();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('success() should call notificationAsync with Success type', async () => {
      await hapticFeedback.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('error() should call notificationAsync with Error type', async () => {
      await hapticFeedback.error();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });

    it('selection() should call selectionAsync', async () => {
      await hapticFeedback.selection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle errors gracefully when haptics fail', async () => {
      (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptics unavailable'));

      // Should not throw
      await expect(hapticFeedback.light()).resolves.not.toThrow();
    });

    it('should handle notification haptics errors gracefully', async () => {
      (Haptics.notificationAsync as jest.Mock).mockRejectedValueOnce(
        new Error('Haptics unavailable'),
      );

      await expect(hapticFeedback.success()).resolves.not.toThrow();
    });

    it('should handle selection haptics errors gracefully', async () => {
      (Haptics.selectionAsync as jest.Mock).mockRejectedValueOnce(new Error('Haptics unavailable'));

      await expect(hapticFeedback.selection()).resolves.not.toThrow();
    });
  });
});
