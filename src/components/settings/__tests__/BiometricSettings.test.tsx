import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import BiometricSettings from '../BiometricSettings';

// Mock dependencies
const mockSetBiometricEnabled = jest.fn();

jest.mock('../../../context/SecurityContext', () => ({
  useSecurity: () => ({
    isBiometricEnabled: false,
    setBiometricEnabled: mockSetBiometricEnabled,
  }),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      borderColor: '#e0e0e0',
      primary: '#007AFF',
      text: '#000000',
      textSecondary: '#666666',
    },
  }),
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

describe('BiometricSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders biometric settings with title and description', () => {
    const { getByText } = render(<BiometricSettings />);

    expect(getByText('settings.security.biometricTitle')).toBeTruthy();
    expect(getByText('settings.security.biometricDesc')).toBeTruthy();
  });

  it('renders switch with correct initial value', () => {
    const { UNSAFE_getByType } = render(<BiometricSettings />);
    const { Switch } = require('react-native');

    const switchComponent = UNSAFE_getByType(Switch);
    expect(switchComponent.props.value).toBe(false);
  });

  it('calls setBiometricEnabled when switch is toggled', async () => {
    mockSetBiometricEnabled.mockResolvedValue(true);

    const { UNSAFE_getByType } = render(<BiometricSettings />);
    const { Switch } = require('react-native');

    const switchComponent = UNSAFE_getByType(Switch);
    fireEvent(switchComponent, 'valueChange', true);

    await waitFor(() => {
      expect(mockSetBiometricEnabled).toHaveBeenCalledWith(true);
    });
  });

  it('shows error alert when biometric setup fails', async () => {
    mockSetBiometricEnabled.mockResolvedValue(false);

    const { UNSAFE_getByType } = render(<BiometricSettings />);
    const { Switch } = require('react-native');

    const switchComponent = UNSAFE_getByType(Switch);
    fireEvent(switchComponent, 'valueChange', true);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('common.error', 'settings.security.setupFailed');
    });
  });

  it('does not show error when disabling biometric', async () => {
    mockSetBiometricEnabled.mockResolvedValue(false);

    const { UNSAFE_getByType } = render(<BiometricSettings />);
    const { Switch } = require('react-native');

    const switchComponent = UNSAFE_getByType(Switch);
    // Toggle to false (disabling)
    fireEvent(switchComponent, 'valueChange', false);

    await waitFor(() => {
      expect(mockSetBiometricEnabled).toHaveBeenCalledWith(false);
    });

    // Alert should not be called when disabling
    expect(Alert.alert).not.toHaveBeenCalled();
  });
});
