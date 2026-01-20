/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
  OptimizedList: ({
    data,
    renderItem,
    ListEmptyComponent,
  }: {
    data: any[];
    renderItem: any;
    ListEmptyComponent: any;
  }) => (
    <>
      {ListEmptyComponent && data.length === 0 ? ListEmptyComponent : null}
      {data.map((item: any) => renderItem({ item }))}
    </>
  ),
}));

jest.mock('../../SubscriptionCard', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Text, TouchableOpacity } = require('react-native');
  const MockSubscriptionCard = ({
    subscription,
    onEdit,
    onDelete,
  }: {
    subscription: any;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <TouchableOpacity testID={`sub-${subscription.id}`} onPress={onEdit}>
      <Text>{subscription.name}</Text>
      <TouchableOpacity onPress={onDelete} testID={`delete-${subscription.id}`}>
        <Text>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
  MockSubscriptionCard.displayName = 'MockSubscriptionCard';
  return MockSubscriptionCard;
});

jest.mock('../../AddSubscriptionModal', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockAddSubscriptionModal = ({ visible }: { visible: boolean }) =>
    visible ? <View testID="add-modal" /> : null;
  MockAddSubscriptionModal.displayName = 'MockAddSubscriptionModal';
  return MockAddSubscriptionModal;
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
  DatabaseProvider: ({ children }: { children: React.ReactNode }) => children,
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
