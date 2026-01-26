import React from 'react';
import { render } from '@testing-library/react-native';
import GenericChart from '../GenericChart';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      subtleText: '#666666',
      accent: '#007AFF',
    },
  }),
}));

// Mock Skia charts
jest.mock('../SkiaPieChart', () => ({
  SkiaPieChart: () => null,
}));

jest.mock('../SkiaBarChart', () => ({
  SkiaBarChart: () => null,
}));

describe('GenericChart', () => {
  describe('Empty data handling', () => {
    it('renders "No data available" when data is empty', () => {
      const { getByText } = render(<GenericChart data={[]} type="pie" />);

      expect(getByText('No data available')).toBeTruthy();
    });

    it('renders "No data available" when data is undefined', () => {
      // @ts-expect-error - Testing undefined case
      const { getByText } = render(<GenericChart data={undefined} type="bar" />);

      expect(getByText('No data available')).toBeTruthy();
    });

    it('renders title with empty data', () => {
      const { getByText } = render(<GenericChart data={[]} type="pie" title="Test Chart" />);

      expect(getByText('Test Chart')).toBeTruthy();
      expect(getByText('No data available')).toBeTruthy();
    });
  });

  describe('Pie chart rendering', () => {
    const pieData = [
      { label: 'Category A', value: 100, color: '#FF0000' },
      { label: 'Category B', value: 200, color: '#00FF00' },
    ];

    it('renders pie chart with data', () => {
      const { getByText } = render(<GenericChart data={pieData} type="pie" title="Pie Chart" />);

      expect(getByText('Pie Chart')).toBeTruthy();
    });

    it('displays legend items with percentages', () => {
      const { getByText } = render(<GenericChart data={pieData} type="pie" />);

      expect(getByText('Category A')).toBeTruthy();
      expect(getByText('Category B')).toBeTruthy();
      expect(getByText('33.3%')).toBeTruthy();
      expect(getByText('66.7%')).toBeTruthy();
    });
  });

  describe('Bar chart rendering', () => {
    const barData = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 200 },
      { label: 'Mar', value: 150 },
    ];

    it('renders bar chart with title', () => {
      const { getByText } = render(
        <GenericChart
          data={barData.map((d) => ({ ...d, color: 'blue' }))}
          type="bar"
          title="Bar Chart"
        />,
      );

      expect(getByText('Bar Chart')).toBeTruthy();
    });

    it('renders bar chart with custom height', () => {
      const { toJSON } = render(
        <GenericChart
          data={barData.map((d) => ({ ...d, color: 'blue' }))}
          type="bar"
          height={300}
        />,
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Props handling', () => {
    it('uses default height when not specified', () => {
      const { toJSON } = render(
        <GenericChart data={[{ label: 'Test', value: 100, color: 'blue' }]} type="bar" />,
      );

      expect(toJSON()).toBeTruthy();
    });

    it('renders without title when not provided', () => {
      const { queryByText } = render(
        <GenericChart data={[{ label: 'Test', value: 100, color: 'blue' }]} type="pie" />,
      );

      // No title should be rendered, but legend should exist
      expect(queryByText('Test')).toBeTruthy();
    });
  });
});
