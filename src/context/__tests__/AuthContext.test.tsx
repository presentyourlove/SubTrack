import React, { useContext } from 'react';
import { render, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authService from '../../services/authService';
import { Text } from 'react-native';

jest.mock('../../services/authService');

const TestComponent = () => {
  const { user, loading } = useAuth();
  if (loading) return <Text>Loading</Text>;
  return <Text>{user ? user.uid : 'No User'}</Text>;
};

describe('AuthContext', () => {
  it('provides user when authenticated', async () => {
    (authService.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback({ uid: 'user1' });
      return jest.fn(); // unsubscribe
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText('user1')).toBeTruthy());
  });

  it('provides null when not authenticated', async () => {
    (authService.onAuthStateChanged as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return jest.fn();
    });

    const { getByText } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => expect(getByText('No User')).toBeTruthy());
  });
});
