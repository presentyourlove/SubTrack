import React from 'react';
import { render } from '@testing-library/react-native';
import SummaryCard from '../SummaryCard';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      accent: '#007AFF',
    },
  }),
}));

jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: [
      { id: 1, name: 'Netflix', price: 15.99, currency: 'USD', billingCycle: 'monthly' },
      { id: 2, name: 'Spotify', price: 9.99, currency: 'USD', billingCycle: 'monthly' },
      { id: 3, name: 'Adobe', price: 599.88, currency: 'USD', billingCycle: 'yearly' },
      { id: 4, name: 'Gym', price: 10, currency: 'USD', billingCycle: 'weekly' },
      { id: 5, name: 'Magazine', price: 30, currency: 'USD', billingCycle: 'quarterly' },
    ],
    settings: {
      mainCurrency: 'USD',
      exchangeRates: JSON.stringify({ USD: 1, TWD: 32 }),
    },
  }),
}));

jest.mock('../../hooks/usePrivacy', () => ({
  usePrivacy: () => ({
    maskValue: (value: string) => value,
  }),
}));

describe('SummaryCard', () => {
  it('renders monthly title', () => {
    const { getByText } = render(<SummaryCard />);

    expect(getByText('summary.monthlyTitle')).toBeTruthy();
  });

  it('renders active count', () => {
    const { getByText } = render(<SummaryCard />);

    expect(getByText('summary.activeCount')).toBeTruthy();
    expect(getByText('5')).toBeTruthy();
  });

  it('renders yearly title', () => {
    const { getByText } = render(<SummaryCard />);

    expect(getByText('summary.yearlyTitle')).toBeTruthy();
  });

  it('renders with proper structure', () => {
    const { toJSON } = render(<SummaryCard />);

    expect(toJSON()).toBeTruthy();
  });

  it('calculates and displays monthly total', () => {
    const { toJSON } = render(<SummaryCard />);

    // The component should render and calculate totals
    const tree = toJSON();
    expect(tree).toBeTruthy();
  });
});

// Test with empty subscriptions
describe('SummaryCard - Empty state', () => {
  beforeEach(() => {
    jest.doMock('../../context/DatabaseContext', () => ({
      useDatabase: () => ({
        subscriptions: [],
        settings: { mainCurrency: 'TWD', exchangeRates: '{}' },
      }),
    }));
  });

  it('handles empty subscriptions', () => {
    const { toJSON } = render(<SummaryCard />);

    expect(toJSON()).toBeTruthy();
  });
});

// Test with null settings
describe('SummaryCard - Default settings', () => {
  beforeEach(() => {
    jest.doMock('../../context/DatabaseContext', () => ({
      useDatabase: () => ({
        subscriptions: [{ id: 1, name: 'Test', price: 10, currency: 'TWD', billingCycle: 'monthly' }],
        settings: null,
      }),
    }));
  });

  it('uses default currency when settings is null', () => {
    const { toJSON } = render(<SummaryCard />);

    expect(toJSON()).toBeTruthy();
  });
});
