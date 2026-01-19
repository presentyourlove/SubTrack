import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SplitBillModal from '../SplitBillModal';
import { ThemeProvider } from '../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('SplitBillModal', () => {
  const mockSubscription = {
    id: '1',
    name: 'Netflix',
    price: 390,
    currency: 'TWD',
    memberCount: 4,
  } as any;

  const mockOnClose = jest.fn();

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(
      <SplitBillModal visible={true} subscription={mockSubscription} onClose={mockOnClose} />,
    );
    // Check for calculated values
    // 390 / 4 = 97.5
    expect(getByText('97.5')).toBeTruthy();
  });
});
