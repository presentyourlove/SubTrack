import React from 'react';
import { render } from '@testing-library/react-native';
import BudgetChart from '../BudgetChart';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      accent: '#007AFF',
      subtleText: '#666',
    },
  }),
}));

jest.mock('../../i18n', () => ({
  t: (key: string) => key,
}));

// Mock chart components
jest.mock('../charts/SkiaPieChart', () => ({
  SkiaPieChart: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: 'mock-pie-chart' },
      React.createElement(Text, null, 'MockPieChart'),
    );
  },
}));

jest.mock('../charts/SkiaBarChart', () => ({
  SkiaBarChart: () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      { testID: 'mock-bar-chart' },
      React.createElement(Text, null, 'MockBarChart'),
    );
  },
}));

// Mock chartHelper
jest.mock('../../utils/chartHelper', () => ({
  getStatsByCategory: jest.fn(() => [
    { label: 'Entertainment', value: 300, color: '#f00' },
    { label: 'Productivity', value: 200, color: '#0f0' },
  ]),
  getExpenseStatistics: jest.fn(() => [{ label: 'Jan', value: 500, color: '#00f', breakdown: [] }]),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSubscriptions: any[] = [{ id: '1', name: 'Netflix', price: 300, currency: 'TWD' }];

describe('BudgetChart', () => {
  it('renders category pie chart correctly', () => {
    const { getByTestId, getByText } = render(
      <BudgetChart
        subscriptions={mockSubscriptions}
        chartType="category"
        currency="TWD"
        exchangeRates={{ TWD: 1 }}
      />,
    );

    expect(getByTestId('mock-pie-chart')).toBeTruthy();
    expect(getByText('chart.categoryTitle')).toBeTruthy();
    // Check legend items
    expect(getByText('Entertainment')).toBeTruthy();
    expect(getByText('60.0%')).toBeTruthy(); // 300 / 500 = 60%
    expect(getByText('Productivity')).toBeTruthy();
    expect(getByText('40.0%')).toBeTruthy();
  });

  it('renders box chart (timeline) correctly', () => {
    const { getByTestId, getByText } = render(
      <BudgetChart
        subscriptions={mockSubscriptions}
        chartType="timeline"
        currency="TWD"
        exchangeRates={{ TWD: 1 }}
      />,
    );

    expect(getByTestId('mock-bar-chart')).toBeTruthy();
    expect(getByText('chart.expenseTitle')).toBeTruthy();
  });
});
