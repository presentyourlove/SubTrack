import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

describe('haptics', () => {
  let hapticFeedback: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  const loadHaptics = () => {
    return require('../haptics').hapticFeedback;
  };

  describe('on native', () => {
    beforeEach(() => {
      Platform.OS = 'ios';
      hapticFeedback = loadHaptics();
    });

    it('light calls impactAsync with Light', async () => {
      await hapticFeedback.light();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
    });

    it('medium calls impactAsync with Medium', async () => {
      await hapticFeedback.medium();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Medium);
    });

    it('heavy calls impactAsync with Heavy', async () => {
      await hapticFeedback.heavy();
      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Heavy);
    });

    it('success calls notificationAsync with Success', async () => {
      await hapticFeedback.success();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Success,
      );
    });

    it('error calls notificationAsync with Error', async () => {
      await hapticFeedback.error();
      expect(Haptics.notificationAsync).toHaveBeenCalledWith(
        Haptics.NotificationFeedbackType.Error,
      );
    });

    it('selection calls selectionAsync', async () => {
      await hapticFeedback.selection();
      expect(Haptics.selectionAsync).toHaveBeenCalled();
    });
  });

  describe('on web', () => {
    beforeEach(() => {
      Platform.OS = 'web';
      hapticFeedback = loadHaptics();
    });

    it('does nothing on web', async () => {
      await hapticFeedback.light();
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });
  });
});
