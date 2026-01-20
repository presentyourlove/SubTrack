import * as LocalAuthentication from 'expo-local-authentication';
import { isBiometricSupported, authenticateBiometric } from '../securityService';

// Mock expo-local-authentication
jest.mock('expo-local-authentication');

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

describe('securityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBiometricSupported', () => {
    it('returns true when hardware exists and is enrolled', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await isBiometricSupported();

      expect(result).toBe(true);
      expect(mockLocalAuth.hasHardwareAsync).toHaveBeenCalled();
      expect(mockLocalAuth.isEnrolledAsync).toHaveBeenCalled();
    });

    it('returns false when hardware does not exist', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);

      const result = await isBiometricSupported();

      expect(result).toBe(false);
    });

    it('returns false when not enrolled', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await isBiometricSupported();

      expect(result).toBe(false);
    });

    it('returns false when neither hardware nor enrollment', async () => {
      mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
      mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);

      const result = await isBiometricSupported();

      expect(result).toBe(false);
    });
  });

  describe('authenticateBiometric', () => {
    it('returns true on successful authentication', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: undefined,
      });

      const result = await authenticateBiometric();

      expect(result).toBe(true);
      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: '請進行身份驗證以解鎖 SubTrack',
        fallbackLabel: '使用密碼',
        disableDeviceFallback: false,
        cancelLabel: '取消',
      });
    });

    it('returns false on failed authentication', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: false,
        error: 'user_cancel',
      });

      const result = await authenticateBiometric();

      expect(result).toBe(false);
    });

    it('uses custom reason message', async () => {
      mockLocalAuth.authenticateAsync.mockResolvedValue({
        success: true,
        error: undefined,
      });

      await authenticateBiometric('Custom prompt message');

      expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
        promptMessage: 'Custom prompt message',
        fallbackLabel: '使用密碼',
        disableDeviceFallback: false,
        cancelLabel: '取消',
      });
    });

    it('returns false and logs error on exception', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalAuth.authenticateAsync.mockRejectedValue(new Error('Auth failed'));

      const result = await authenticateBiometric();

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('Biometric authentication error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
