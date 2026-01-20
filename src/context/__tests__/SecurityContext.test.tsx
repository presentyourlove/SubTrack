import React from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import { View, Text, Button, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SecurityProvider, useSecurity } from '../SecurityContext';
import * as SecurityService from '../../services/securityService';

// Mock SecurityService
jest.mock('../../services/securityService', () => ({
  authenticateBiometric: jest.fn(),
}));

const TestComponent = () => {
  const { isLocked, isBiometricEnabled, setBiometricEnabled, unlock, checkSecurity } =
    useSecurity();

  return (
    <View>
      <Text>{isLocked ? 'Locked' : 'Unlocked'}</Text>
      <Text>{isBiometricEnabled ? 'Biometric Enabled' : 'Biometric Disabled'}</Text>
      <Button title="Enable Biometric" onPress={() => setBiometricEnabled(true)} />
      <Button title="Disable Biometric" onPress={() => setBiometricEnabled(false)} />
      <Button title="Unlock" onPress={() => unlock()} />
      <Button title="Check Security" onPress={() => checkSecurity()} />
    </View>
  );
};

describe('SecurityContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state when no settings stored', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => {
      expect(getByText('Unlocked')).toBeTruthy();
      expect(getByText('Biometric Disabled')).toBeTruthy();
    });
  });

  it('initializes as locked if biometric is enabled in storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('true');

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => {
      expect(getByText('Locked')).toBeTruthy();
      expect(getByText('Biometric Enabled')).toBeTruthy();
    });
  });

  it('enables biometric updates state and storage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (SecurityService.authenticateBiometric as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => expect(getByText('Biometric Disabled')).toBeTruthy());

    fireEvent.press(getByText('Enable Biometric'));

    await waitFor(() => {
      expect(SecurityService.authenticateBiometric).toHaveBeenCalled();
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('@subtrack_biometric_enabled', 'true');
      expect(getByText('Biometric Enabled')).toBeTruthy();
    });
  });

  it('fails to enable biometric if authentication fails', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (SecurityService.authenticateBiometric as jest.Mock).mockResolvedValue(false);

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => expect(getByText('Biometric Disabled')).toBeTruthy());

    fireEvent.press(getByText('Enable Biometric'));

    await waitFor(() => {
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
      expect(getByText('Biometric Disabled')).toBeTruthy();
    });
  });

  it('unlocks effectively', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('true'); // Start locked
    (SecurityService.authenticateBiometric as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => expect(getByText('Locked')).toBeTruthy());

    fireEvent.press(getByText('Unlock'));

    await waitFor(() => {
      expect(getByText('Unlocked')).toBeTruthy();
    });
  });
});
