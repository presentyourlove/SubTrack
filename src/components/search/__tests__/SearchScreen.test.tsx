import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import SearchScreen from '../SearchScreen';
import { Subscription } from '../../../types';

// Mock dependencies
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
  }),
}));

const mockUpdateSubscription = jest.fn();
const mockDeleteSubscription = jest.fn();

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: [
      {
        id: 1,
        name: 'Netflix',
        price: 15.99,
        currency: 'USD',
        category: 'entertainment',
        description: 'Movie streaming',
      },
      {
        id: 2,
        name: 'Spotify',
        price: 9.99,
        currency: 'USD',
        category: 'entertainment',
        tags: [{ name: 'Music' }],
      },
      {
        id: 3,
        name: 'Gym',
        price: 50,
        currency: 'USD',
        category: 'lifestyle',
      },
    ],
    updateSubscription: mockUpdateSubscription,
    deleteSubscription: mockDeleteSubscription,
  }),
}));

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      card: '#f0f0f0',
      text: '#000000',
      subtleText: '#666666',
      inputBackground: '#e0e0e0',
      borderColor: '#cccccc',
    },
  }),
}));

// Mock SubscriptionCard
jest.mock('../../cards/SubscriptionCard', () => {
  const {
    View: MockView,
    Text: MockText,
    TouchableOpacity: MockTouchableOpacity,
  } = jest.requireActual('react-native');
  const MockSubscriptionCard = ({
    subscription,
    onEdit,
    onDelete,
  }: {
    subscription: Subscription;
    onEdit: () => void;
    onDelete: () => void;
  }) => (
    <MockView testID={`subscription-card-${subscription.id}`}>
      <MockText>{subscription.name}</MockText>
      <MockTouchableOpacity onPress={onEdit} testID={`edit-btn-${subscription.id}`}>
        <MockText>Edit</MockText>
      </MockTouchableOpacity>
      <MockTouchableOpacity onPress={onDelete} testID={`delete-btn-${subscription.id}`}>
        <MockText>Delete</MockText>
      </MockTouchableOpacity>
    </MockView>
  );
  MockSubscriptionCard.displayName = 'SubscriptionCard';
  return MockSubscriptionCard;
});

// Mock AddSubscriptionModal
jest.mock('../../modals/AddSubscriptionModal', () => {
  const { View: MockView } = jest.requireActual('react-native');
  const MockAddSubscriptionModal = ({ visible }: { visible: boolean }) => {
    if (!visible) return null;
    return <MockView testID="add-subscription-modal" />;
  };
  MockAddSubscriptionModal.displayName = 'AddSubscriptionModal';
  return MockAddSubscriptionModal;
});

// Mock OptimizedList
jest.mock('../../common/OptimizedList', () => {
  const { FlatList: MockFlatList } = jest.requireActual('react-native');
  return {
    OptimizedList: (props: any) => <MockFlatList {...props} />,
  };
});

jest.mock('../../../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

describe('SearchScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search input', () => {
    const { getByPlaceholderText } = render(<SearchScreen />);
    expect(getByPlaceholderText('search.placeholder')).toBeTruthy();
  });

  it('filters subscriptions by name', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'Net');

    expect(getByText('Netflix')).toBeTruthy();
    expect(queryByText('Spotify')).toBeNull();
  });

  it('filters subscriptions by description', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'Movie');

    expect(getByText('Netflix')).toBeTruthy(); // Description is 'Movie streaming'
    expect(queryByText('Spotify')).toBeNull();
  });

  it('filters subscriptions by tag', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'Music');

    expect(getByText('Spotify')).toBeTruthy(); // Tag is 'Music'
    expect(queryByText('Netflix')).toBeNull();
  });

  it('shows no results message when query matches nothing', () => {
    const { getByPlaceholderText, getByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'NonExistent');

    expect(getByText('search.noResults')).toBeTruthy();
  });

  it('clears search when clear button is pressed', () => {
    const { getByPlaceholderText, getByTestId, queryByText } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');

    fireEvent.changeText(input, 'Net');
    expect(getByTestId('clear-search-button')).toBeTruthy();

    fireEvent.press(getByTestId('clear-search-button'));

    expect(input.props.value).toBe('');
    expect(queryByText('Netflix')).toBeNull();
  });

  it('navigates back when back button pressed', () => {
    const { UNSAFE_getAllByType } = render(<SearchScreen />);
    const touchables = UNSAFE_getAllByType(TouchableOpacity);

    // The first one should be the back button based on layout order
    fireEvent.press(touchables[0]);
    expect(mockBack).toHaveBeenCalled();
  });

  it('opens edit modal when item is clicked (edit logic in mocked card)', () => {
    const { getByPlaceholderText, getByTestId } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');
    fireEvent.changeText(input, 'Net');

    fireEvent.press(getByTestId('edit-btn-1'));

    expect(getByTestId('add-subscription-modal')).toBeTruthy();
  });

  it('calls delete when item delete is clicked', async () => {
    const { getByPlaceholderText, getByTestId } = render(<SearchScreen />);
    const input = getByPlaceholderText('search.placeholder');
    fireEvent.changeText(input, 'Net');

    fireEvent.press(getByTestId('delete-btn-1'));

    await waitFor(() => expect(mockDeleteSubscription).toHaveBeenCalledWith(1));
  });
});
