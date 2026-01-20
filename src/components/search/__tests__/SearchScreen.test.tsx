import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SearchScreen from '../SearchScreen';
import { ThemeProvider } from '../../../context/ThemeContext';
import { DatabaseProvider } from '../../../context/DatabaseContext';

// Mocks
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: jest.fn() }),
}));

jest.mock('../../../utils/haptics', () => ({
  hapticFeedback: { selection: jest.fn() },
}));

// Mock OptimizedList as it might be complex
jest.mock('../../common/OptimizedList', () => ({
  OptimizedList: ({ data, renderItem, ListEmptyComponent }: any) => (
    <>
      {ListEmptyComponent && data.length === 0 ? ListEmptyComponent : null}
      {data.map((item: any) => renderItem({ item }))}
    </>
  ),
}));

jest.mock('../../SubscriptionCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Text, TouchableOpacity } = require('react-native');
  return ({ subscription, onEdit, onDelete }: any) => (
    <TouchableOpacity testID={`sub-${subscription.id}`} onPress={onEdit}>
      <Text>{subscription.name}</Text>
      <TouchableOpacity onPress={onDelete} testID={`delete-${subscription.id}`}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

jest.mock('../../AddSubscriptionModal', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return ({ visible }: any) => (visible ? <View testID="add-modal" /> : null);
});

// Mock Contexts
const mockSubscriptions = [
  { id: '1', name: 'Netflix', category: 'entertainment', description: 'Movies' },
  { id: '2', name: 'Spotify', category: 'music', description: 'Music' },
];

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: mockSubscriptions,
    updateSubscription: jest.fn(),
    deleteSubscription: jest.fn(),
  }),
  DatabaseProvider: ({ children }: any) => children,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      <DatabaseProvider>{component}</DatabaseProvider>
    </ThemeProvider>,
  );
};

describe('SearchScreen', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = renderWithProviders(<SearchScreen />);
    expect(getByPlaceholderText('search.placeholder')).toBeTruthy();
  });

  it('filters subscriptions', () => {
    const { getByPlaceholderText, getByText, queryByText } = renderWithProviders(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'Net');

    expect(getByText('Netflix')).toBeTruthy();
    expect(queryByText('Spotify')).toBeNull();
  });

  it('shows empty state when no results', () => {
    const { getByPlaceholderText, getByText } = renderWithProviders(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'XYZ');

    expect(getByText('search.noResults')).toBeTruthy();
  });
});
