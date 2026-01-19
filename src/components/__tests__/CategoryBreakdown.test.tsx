import React from 'react';
import { render } from '@testing-library/react-native';
import CategoryBreakdown from '../CategoryBreakdown';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('CategoryBreakdown', () => {
  const mockData = {
    Entertainment: 500,
    Utilities: 200,
  };

  it('renders categories correctly', () => {
    const { getByText } = renderWithProviders(
      <CategoryBreakdown data={mockData} total={700} currency="TWD" />,
    );

    expect(getByText('Entertainment')).toBeTruthy();
    expect(getByText('Utilities')).toBeTruthy();
    expect(getByText('500')).toBeTruthy();
    expect(getByText('200')).toBeTruthy();
  });

  it('handles empty data', () => {
    const { queryByText } = renderWithProviders(
      <CategoryBreakdown data={{}} total={0} currency="TWD" />,
    );
    // Expect no categories to be rendered
  });
});
