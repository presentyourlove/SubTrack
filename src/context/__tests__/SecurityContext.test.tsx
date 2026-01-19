import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { SecurityProvider, useSecurity } from '../SecurityContext';
import * as securityService from '../../services/securityService';
import { Text } from 'react-native';

jest.mock('../../services/securityService');

const TestComponent = () => {
  const { isBiometricSupported } = useSecurity();
  return <Text>{isBiometricSupported ? 'Supported' : 'Not Supported'}</Text>;
};

describe('SecurityContext', () => {
  it('checks biometric support on mount', async () => {
    (securityService.isBiometricSupported as jest.Mock).mockResolvedValue(true);

    const { getByText } = render(
      <SecurityProvider>
        <TestComponent />
      </SecurityProvider>,
    );

    await waitFor(() => expect(getByText('Supported')).toBeTruthy());
  });
});
