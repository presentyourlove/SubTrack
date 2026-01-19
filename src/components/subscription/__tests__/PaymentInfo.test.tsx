import React from 'react';
import { render } from '@testing-library/react-native';
import PaymentInfo from '../PaymentInfo';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('PaymentInfo', () => {
  const mockData = {
    billingCycle: 'monthly',
    startDate: new Date(),
    nextBillingDate: new Date(),
  } as any;
  const mockOnChange = jest.fn();

  it('renders billing cycle selector', () => {
    const { getByText } = renderWithProviders(
      <PaymentInfo data={mockData} onChange={mockOnChange} />,
    );
    // Check for elements
  });
});
