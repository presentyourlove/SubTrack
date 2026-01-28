import React from 'react';
import { render } from '@testing-library/react-native';
import BudgetChart from '../visualizations/BudgetChart';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      subtleText: '#666666',
      accent: '#007AFF',
    },
  }),
}));

jest.mock('../../utils/chartHelper', () => ({
  getStatsByCategory: jest
    .fn()
    .mockReturnValue([{ label: 'Entertainment', value: 100, color: '#ff0000' }]),
  getExpenseStatistics: jest.fn().mockReturnValue([{ label: 'Jan', value: 200, color: '#00ff00' }]),
}));

jest.mock('../visualizations/charts/SkiaPieChart', () => ({
  SkiaPieChart: () => null,
}));

jest.mock('../visualizations/charts/SkiaBarChart', () => ({
  SkiaBarChart: () => null,
}));

describe('BudgetChart', () => {
  const defaultProps = {
    subscriptions: [],
    currency: 'USD',
    exchangeRates: { USD: 1 },
  };

  it('renders category pie chart correctly', () => {
    const { getByText } = render(<BudgetChart {...defaultProps} chartType="category" />);
    expect(getByText('chart.categoryTitle')).toBeTruthy();
    expect(getByText('Entertainment')).toBeTruthy();
  });

  it('renders expense bar chart correctly', () => {
    const { getByText } = render(<BudgetChart {...defaultProps} chartType="timeline" />);
    expect(getByText('chart.expenseTitle')).toBeTruthy();
  });
});
