import * as LocalAuthentication from 'expo-local-authentication';
import { isBiometricSupported, authenticateBiometric } from '../securityService';

jest.mock('expo-local-authentication');

describe('securityService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isBiometricSupported', () => {
    it('should return true if hardware exists and is enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await isBiometricSupported();
      expect(result).toBe(true);
    });

    it('should return false if hardware missing', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(false);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(true);

      const result = await isBiometricSupported();
      expect(result).toBe(false);
    });

    it('should return false if not enrolled', async () => {
      (LocalAuthentication.hasHardwareAsync as jest.Mock).mockResolvedValue(true);
      (LocalAuthentication.isEnrolledAsync as jest.Mock).mockResolvedValue(false);

      const result = await isBiometricSupported();
      expect(result).toBe(false);
    });
  });

  describe('authenticateBiometric', () => {
    it('should return true on successful authentication', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true });

      const result = await authenticateBiometric();
      expect(result).toBe(true);
    });

    it('should return false on failed authentication', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false });

      const result = await authenticateBiometric();
      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(
        new Error('Auth failed'),
      );

      const result = await authenticateBiometric();
      expect(result).toBe(false);
    });
  });
});
