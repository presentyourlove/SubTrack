import React from 'react';
import { render } from '@testing-library/react-native';
import SummaryCard from '../SummaryCard';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      accent: '#007AFF',
      background: '#ffffff',
    },
  }),
}));

const mockSubscriptions = [
  {
    id: '1',
    name: 'Netflix',
    price: 390,
    currency: 'TWD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-01',
  },
  {
    id: '2',
    name: 'Spotify',
    price: 149,
    currency: 'TWD',
    billingCycle: 'monthly',
    nextBillingDate: '2024-02-05',
  },
];

const mockSettings = {
  mainCurrency: 'TWD',
  exchangeRates: JSON.stringify({ TWD: 1, USD: 30 }),
};

jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(() => ({
    subscriptions: mockSubscriptions,
    settings: mockSettings,
  })),
}));

// Mock hook defaults
jest.mock('../../hooks/usePrivacy', () => ({
  usePrivacy: () => ({
    maskValue: (val: string) => val,
  }),
}));

// Mock i18n
jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));

describe('SummaryCard', () => {
  it('renders correctly with subscriptions', () => {
    const { getByText } = render(<SummaryCard />);

    // Total = 390 + 149 = 539
    // TWD uses NT$ prefix in currencyHelper
    expect(getByText('NT$539')).toBeTruthy();
    // Active count = 2
    expect(getByText('2')).toBeTruthy();
  });

  it('calculates yearly total correctly', () => {
    const { getByText } = render(<SummaryCard />);
    // Yearly = 539 * 12 = 6468
    expect(getByText('NT$6,468')).toBeTruthy();
  });
});
