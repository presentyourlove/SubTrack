import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { DatabaseProvider, useDatabase } from '../DatabaseContext';
import * as databaseHelper from '../../services/database';
import { AuthProvider } from '../AuthContext';

jest.mock('../../services/database');
jest.mock('../AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'user1' } }),
  AuthProvider: ({ children }: any) => children,
}));

const TestComponent = () => {
  const { loading } = useDatabase();
  return <Text>{loading ? 'Loading' : 'Ready'}</Text>;
};

import { Text } from 'react-native';

describe('DatabaseContext', () => {
  it('initializes database on mount', async () => {
    (databaseHelper.initDatabase as jest.Mock).mockResolvedValue({});
    (databaseHelper.getAllSubscriptions as jest.Mock).mockResolvedValue([]);
    (databaseHelper.getUserSettings as jest.Mock).mockResolvedValue({});
    (databaseHelper.getWorkspaces as jest.Mock).mockResolvedValue([]);

    const { getByText } = render(
      <DatabaseProvider>
        <TestComponent />
      </DatabaseProvider>,
    );

    await waitFor(() => expect(getByText('Ready')).toBeTruthy());
    expect(databaseHelper.initDatabase).toHaveBeenCalled();
  });
});
