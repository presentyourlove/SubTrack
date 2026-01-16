import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SubscriptionCard from '../SubscriptionCard';
import { useTheme } from '../../context/ThemeContext';

// Mock ThemeContext
jest.mock('../../context/ThemeContext', () => ({
  useTheme: jest.fn(),
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
    expect(getByText('NT$100 / 月')).toBeTruthy(); // Assuming i18n returns default string
  });

  it('calls onEdit when edit button pressed', () => {
    const onEdit = jest.fn();
    const { getByText } = render(
      <SubscriptionCard subscription={mockSubscription} onEdit={onEdit} />,
    );

    fireEvent.press(getByText('編輯'));
    expect(onEdit).toHaveBeenCalled();
  });
});
