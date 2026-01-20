import React from 'react';
import { render } from '@testing-library/react-native';
import CategoryBreakdown from '../CategoryBreakdown';
import { ThemeProvider } from '../../context/ThemeContext';
import { Subscription } from '../../types';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('CategoryBreakdown', () => {
  const mockSubscriptions: Subscription[] = [
    {
      id: 1,
      name: 'Netflix',
      price: 500,
      currency: 'TWD',
      billingCycle: 'monthly',
      category: 'entertainment',
      icon: '🎬',
      startDate: '2023-01-01',
      nextBillingDate: '2024-01-01',
      reminderEnabled: false,
      workspaceId: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    },
    {
      id: 2,
      name: 'Spotify',
      price: 200,
      currency: 'TWD',
      billingCycle: 'monthly',
      category: 'entertainment',
      icon: '🎵',
      startDate: '2023-01-01',
      nextBillingDate: '2024-01-01',
      reminderEnabled: false,
      workspaceId: 1,
      createdAt: '2023-01-01',
      updatedAt: '2023-01-01',
    },
  ];

  const mockExchangeRates = { TWD: 1, USD: 30 };

  it('renders correctly with subscriptions', () => {
    const { getByText } = renderWithProviders(
      <CategoryBreakdown
        subscriptions={mockSubscriptions}
        currency="TWD"
        exchangeRates={mockExchangeRates}
      />,
    );

    expect(getByText('breakdown.title')).toBeTruthy();
  });

  it('handles empty subscriptions', () => {
    const { getByText } = renderWithProviders(
      <CategoryBreakdown subscriptions={[]} currency="TWD" exchangeRates={mockExchangeRates} />,
    );

    expect(getByText('breakdown.empty')).toBeTruthy();
  });
});
