import React from 'react';
import { render } from '@testing-library/react-native';
import SummaryCard from '../SummaryCard';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock navigation
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('SummaryCard', () => {
  it('renders correctly', () => {
    const { getByText } = renderWithProviders(
      <SummaryCard totalExpenses={1000} subscriptionCount={5} bgImage={null} />,
    );

    expect(getByText('home.monthlyExpenses')).toBeTruthy();
    expect(getByText('$1,000.00')).toBeTruthy();
    expect(getByText('home.activeSubscriptions')).toBeTruthy();
  });

  it('renders with background image', () => {
    const { getByTestId } = renderWithProviders(
      <SummaryCard totalExpenses={1000} subscriptionCount={5} bgImage="file://test.jpg" />,
    );
    // Assuming SummaryCard handles bgImage, though internal implementation details might verify this better via snapshot
  });
});
