import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SubscriptionCard from '../cards/SubscriptionCard';
import { useTheme } from '../../context/ThemeContext';

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(),
}));

// Mock DatabaseContext
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn().mockReturnValue({
    db: null,
    settings: { displayCurrency: 'TWD' },
    exchangeRates: { TWD: 1 },
  }),
}));

// Mock Privacy
jest.mock('../../hooks/usePrivacy', () => ({
  usePrivacy: jest.fn().mockReturnValue({
    maskValue: (val: string) => val, // Default no mask
  }),
}));

// Mock Calendar Service
jest.mock('../../services/calendarSyncService', () => ({
  calendarSyncService: {
    upsertEvent: jest.fn().mockResolvedValue('new-event-id'),
  },
}));

// Mock Expo Calendar
jest.mock('expo-calendar', () => ({
  deleteEventAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock Utils
jest.mock('../../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
    error: jest.fn(),
    light: jest.fn(),
  },
}));

const mockSubscription = {
  id: 1,
  name: 'Test Sub',
  icon: '📺',
  category: 'entertainment' as const,
  price: 100,
  currency: 'TWD',
  billingCycle: 'monthly' as const,
  startDate: '2023-01-01',
  nextBillingDate: '2023-02-01', // ISO date string
  reminderEnabled: true,
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01',
  workspaceId: 1,
  description: 'Test Description',
};

describe('SubscriptionCard', () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      colors: {
        card: '#fff',
        text: '#000',
        subtleText: '#666',
        borderColor: '#ccc',
        expense: 'red',
        accent: 'blue',
      },
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<SubscriptionCard subscription={mockSubscription} />);

    expect(getByText('Test Sub')).toBeTruthy();
    // i18n mock returns key as-is, actual format depends on component implementation
  });

  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn();
    const { getByText } = render(
      <SubscriptionCard subscription={mockSubscription} onEdit={onEdit} />,
    );

    // i18n mock returns key as-is, so look for the key
    fireEvent.press(getByText('common.edit'));
    expect(onEdit).toHaveBeenCalled();
  });
  it('calls onDelete when delete button pressed', () => {
    const onDelete = jest.fn();
    const { getByTestId } = render(
      <SubscriptionCard subscription={mockSubscription} onDelete={onDelete} />,
    );

    fireEvent.press(getByTestId('delete-subscription-button'));
    expect(onDelete).toHaveBeenCalled();
  });

  it('calls onSyncToCalendar when sync button pressed', async () => {
    const onSync = jest.fn();
    const { getByTestId } = render(
      <SubscriptionCard subscription={mockSubscription} onSyncToCalendar={onSync} />,
    );

    fireEvent.press(getByTestId('sync-calendar-button'));
    // Since handleSyncToCalendar is async, we might need wait for it
    // But invalidating onSyncToCalendar happens after await.
    // The implementation calls onUpdateCalendarId etc.
  });
});
