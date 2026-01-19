import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { isBiometricSupported, authenticateBiometric } from '../services/securityService';

const BIOMETRIC_ENABLED_KEY = '@subtrack_biometric_enabled';

type SecurityContextType = {
  isBiometricEnabled: boolean;
  setBiometricEnabled: (enabled: boolean) => Promise<boolean>;
  isLocked: boolean;
  unlock: () => Promise<boolean>;
  checkSecurity: () => Promise<void>;
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider = ({ children }: { children: ReactNode }) => {
  const [isBiometricEnabled, setBiometricEnabledState] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // 初始化載入設定
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const value = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        const enabled = value === 'true';
        setBiometricEnabledState(enabled);

        // 如果啟用了生物辨識，啟動時設為鎖定
        if (enabled) {
          setIsLocked(true);
        }
      } catch (e) {
        console.error('Failed to load biometric settings', e);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  // 監聽 App 狀態變化
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isBiometricEnabled) {
        // 從背景回來時，如果啟用了生物辨識，則鎖定
        setIsLocked(true);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isBiometricEnabled]);

  const setBiometricEnabled = async (enabled: boolean): Promise<boolean> => {
    if (enabled) {
      // 啟用前先測試一次驗證
      const success = await authenticateBiometric('確認啟用生物辨識');
      if (!success) return false;
    }

    try {
      await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
      setBiometricEnabledState(enabled);
      return true;
    } catch (e) {
      console.error('Failed to save biometric settings', e);
      return false;
    }
  };

  const unlock = async (): Promise<boolean> => {
    if (!isBiometricEnabled) {
      setIsLocked(false);
      return true;
    }

    const success = await authenticateBiometric();
    if (success) {
      setIsLocked(false);
    }
    return success;
  };

  const checkSecurity = async () => {
    if (isBiometricEnabled) {
      setIsLocked(true);
    }
  };

  const value = {
    isBiometricEnabled,
    setBiometricEnabled,
    isLocked,
    unlock,
    checkSecurity,
  };

  // 在初始化載入完成前不渲染子組件（或顯示 Loading）
  if (loading) return null;

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
