import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SkiaBarChart, SkiaBarDataPoint } from '../SkiaBarChart';

// Mock ThemeContext
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      accent: '#007AFF',
      subtleText: '#666666',
      text: '#000000',
      background: '#ffffff',
    },
  }),
}));

describe('SkiaBarChart', () => {
  describe('Empty data handling', () => {
    it('renders empty View when data is empty array', () => {
      // When data is empty, component returns a simple View with just height
      const { toJSON } = render(<SkiaBarChart data={[]} height={200} />);
      const tree = toJSON();
      // Should render a View element
      expect(tree).toBeTruthy();
      expect(tree?.type).toBe('View');
    });
  });

  describe('Basic rendering with valid data', () => {
    const sampleData: SkiaBarDataPoint[] = [
      { label: 'Jan', value: 100 },
      { label: 'Feb', value: 200 },
      { label: 'Mar', value: 150 },
    ];

    it('renders container with correct height', () => {
      const { getByTestId } = render(<SkiaBarChart data={sampleData} height={250} />);

      const container = getByTestId('bar-chart-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          height: 250,
        }),
      );
    });

    it('renders with default height when not specified', () => {
      const { getByTestId } = render(<SkiaBarChart data={sampleData} />);

      const container = getByTestId('bar-chart-container');
      expect(container.props.style).toEqual(
        expect.objectContaining({
          height: 200,
        }),
      );
    });

    it('triggers onLayout handler', () => {
      const { getByTestId } = render(<SkiaBarChart data={sampleData} />);

      const container = getByTestId('bar-chart-container');
      // Simulate layout event to trigger canvas width calculation
      fireEvent(container, 'layout', {
        nativeEvent: { layout: { width: 300, height: 200 } },
      });

      // After layout, component should still be rendered
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });
  });

  describe('Data calculations', () => {
    it('handles all zero values without crashing', () => {
      const zeroData: SkiaBarDataPoint[] = [
        { label: 'A', value: 0 },
        { label: 'B', value: 0 },
        { label: 'C', value: 0 },
      ];

      const { getByTestId } = render(<SkiaBarChart data={zeroData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('handles single data point', () => {
      const singleData: SkiaBarDataPoint[] = [{ label: 'Only', value: 100 }];

      const { getByTestId } = render(<SkiaBarChart data={singleData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('handles negative values gracefully', () => {
      const negativeData: SkiaBarDataPoint[] = [
        { label: 'Neg', value: -50 },
        { label: 'Pos', value: 100 },
      ];

      const { getByTestId } = render(<SkiaBarChart data={negativeData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('handles very large values', () => {
      const largeData: SkiaBarDataPoint[] = [
        { label: 'Big', value: 1000000000 },
        { label: 'Small', value: 1 },
      ];

      const { getByTestId } = render(<SkiaBarChart data={largeData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });
  });

  describe('Custom colors', () => {
    it('accepts custom bar colors', () => {
      const coloredData: SkiaBarDataPoint[] = [
        { label: 'Red', value: 100, color: '#FF0000' },
        { label: 'Blue', value: 200, color: '#0000FF' },
      ];

      const { getByTestId } = render(<SkiaBarChart data={coloredData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });
  });

  describe('Stacked bars with breakdown', () => {
    it('renders stacked bars when breakdown is provided', () => {
      const stackedData: SkiaBarDataPoint[] = [
        {
          label: 'Q1',
          value: 300,
          breakdown: [
            { color: '#FF0000', value: 100 },
            { color: '#00FF00', value: 100 },
            { color: '#0000FF', value: 100 },
          ],
        },
      ];

      const { getByTestId } = render(<SkiaBarChart data={stackedData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('handles empty breakdown array', () => {
      const emptyBreakdownData: SkiaBarDataPoint[] = [
        { label: 'Empty', value: 100, breakdown: [] },
      ];

      const { getByTestId } = render(<SkiaBarChart data={emptyBreakdownData} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });
  });

  describe('Props validation', () => {
    it('accepts custom barBorderRadius', () => {
      const data: SkiaBarDataPoint[] = [{ label: 'Test', value: 100 }];

      const { getByTestId } = render(<SkiaBarChart data={data} barBorderRadius={8} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('accepts showLabels prop', () => {
      const data: SkiaBarDataPoint[] = [{ label: 'Test', value: 100 }];

      const { getByTestId } = render(<SkiaBarChart data={data} showLabels={false} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });

    it('accepts showLabels true', () => {
      const data: SkiaBarDataPoint[] = [{ label: 'Test', value: 100 }];

      const { getByTestId } = render(<SkiaBarChart data={data} showLabels={true} />);
      expect(getByTestId('bar-chart-container')).toBeTruthy();
    });
  });
});
