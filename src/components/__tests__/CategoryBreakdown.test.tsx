import React from 'react';
import { render } from '@testing-library/react-native';
import CategoryBreakdown from '../CategoryBreakdown';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      accent: '#007AFF',
      borderColor: '#cccccc',
      subtleText: '#666',
    },
  }),
}));

const mockGetStatsByApp = jest.fn();
jest.mock('../../utils/chartHelper', () => ({
  getStatsByApp: (subs: any, curr: any, rates: any) => mockGetStatsByApp(subs, curr, rates),
}));

jest.mock('../../utils/currencyHelper', () => ({
  formatCurrency: (amount: number, currency: string) => `${currency}${amount}`,
}));

jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));

describe('CategoryBreakdown', () => {
  const mockSubscriptions = [
    { id: 1, name: 'Netflix', price: 100, currency: 'TWD', category: 'Entertainment' },
  ];
  const mockExchangeRates = { TWD: 1, USD: 30 };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no stats', () => {
    mockGetStatsByApp.mockReturnValue([]);
    const { getByText } = render(
      <CategoryBreakdown subscriptions={[]} currency="TWD" exchangeRates={mockExchangeRates} />,
    );

    expect(getByText('breakdown.empty')).toBeTruthy();
  });

  it('renders breakdown list correctly', () => {
    mockGetStatsByApp.mockReturnValue([
      {
        name: 'Netflix',
        category: 'Entertainment',
        icon: 'N',
        monthlyAmount: 300,
        yearlyAmount: 3600,
        percentage: 50,
      },
      {
        name: 'Spotify',
        category: 'Music',
        icon: 'S',
        monthlyAmount: 150,
        yearlyAmount: 1800,
        percentage: 25,
      },
    ]);

    const { getByText } = render(
      <CategoryBreakdown
        subscriptions={mockSubscriptions}
        currency="TWD"
        exchangeRates={mockExchangeRates}
      />,
    );

    expect(getByText('Netflix')).toBeTruthy();
    expect(getByText('Entertainment')).toBeTruthy();
    expect(getByText('TWD300')).toBeTruthy(); // formatCurrency mock
    expect(getByText('50.0%')).toBeTruthy();

    expect(getByText('Spotify')).toBeTruthy();
    expect(getByText('Music')).toBeTruthy();
    expect(getByText('25.0%')).toBeTruthy();
  });
});
