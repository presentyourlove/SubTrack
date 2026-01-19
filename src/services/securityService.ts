import * as LocalAuthentication from 'expo-local-authentication';

export const isBiometricSupported = async (): Promise<boolean> => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const getSupportedTypes =
  async (): Promise<LocalAuthentication.AuthenticationSecurityLevel> => {
    return await LocalAuthentication.getSecurityLevelAsync();
  };

export const authenticateBiometric = async (
  reason: string = '請進行身份驗證以解鎖 SubTrack',
): Promise<boolean> => {
  try {
    const results = await LocalAuthentication.authenticateAsync({
      promptMessage: reason,
      fallbackLabel: '使用密碼',
      disableDeviceFallback: false,
      cancelLabel: '取消',
    });

    return results.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
};
