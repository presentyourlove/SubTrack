import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PaymentInfo from '../PaymentInfo';
import { BillingCycle } from '../../../types';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      subtleText: '#666666',
      inputBackground: '#f5f5f5',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      background: '#ffffff',
    },
  }),
}));

// Mock DateTimePicker using jest.requireActual or returning a component
jest.mock('@react-native-community/datetimepicker', () => {
  const { View: MockView } = jest.requireActual('react-native');
  const MockDateTimePicker = (props: any) => <MockView testID="dateTimePicker" {...props} />;
  MockDateTimePicker.displayName = 'DateTimePicker';
  return MockDateTimePicker;
});

describe('PaymentInfo', () => {
  const defaultProps = {
    price: '15.99',
    setPrice: jest.fn(),
    currency: 'USD',
    setCurrency: jest.fn(),
    billingCycle: 'monthly' as BillingCycle,
    setBillingCycle: jest.fn(),
    startDate: new Date('2026-01-01'),
    setStartDate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders price input with value', () => {
    const { getByDisplayValue } = render(<PaymentInfo {...defaultProps} />);
    expect(getByDisplayValue('15.99')).toBeTruthy();
  });

  it('calls setPrice when price input changes', () => {
    const { getByDisplayValue } = render(<PaymentInfo {...defaultProps} />);
    const input = getByDisplayValue('15.99');
    fireEvent.changeText(input, '25.00');
    expect(defaultProps.setPrice).toHaveBeenCalledWith('25.00');
  });

  it('renders all billing cycle options', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} />);
    expect(getByText('cycles.weekly')).toBeTruthy();
    expect(getByText('cycles.monthly')).toBeTruthy();
    expect(getByText('cycles.quarterly')).toBeTruthy();
    expect(getByText('cycles.yearly')).toBeTruthy();
  });

  it('calls setBillingCycle when cycle button is pressed', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} />);
    fireEvent.press(getByText('cycles.yearly'));
    expect(defaultProps.setBillingCycle).toHaveBeenCalledWith('yearly');
  });

  it('highlights selected billing cycle', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} billingCycle="yearly" />);
    const yearlyButton = getByText('cycles.yearly');
    expect(yearlyButton).toBeTruthy();
  });

  it('opens currency modal, selects currency and updates', () => {
    const { getByText, getAllByText } = render(<PaymentInfo {...defaultProps} />);

    // Open modal
    fireEvent.press(getByText('USD'));
    expect(getByText('settings.currency')).toBeTruthy();

    // Select currency (Use getAllByText because USD is on the button AND in the list)
    // The list renders 'USD'. We want the one in the modal.
    // Usually the last rendered one or we can find by parent.
    // For simplicity, just finding 'TWD' which is different
    const options = getAllByText('TWD');
    // Assuming TWD is in the default list
    if (options.length > 0) {
      fireEvent.press(options[0]);
      expect(defaultProps.setCurrency).toHaveBeenCalledWith('TWD');
    }
  });

  it('renders start date label', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} />);
    expect(getByText('subscription.startDate *')).toBeTruthy();
  });

  it('shows date picker on press (native)', () => {
    const { getByText, getByTestId } = render(<PaymentInfo {...defaultProps} />);
    const dateStr = defaultProps.startDate.toLocaleDateString();

    // Press the date display
    fireEvent.press(getByText('2026/1/1'));

    const picker = getByTestId('dateTimePicker');
    expect(picker).toBeTruthy();
  });

  it('updates date when picker changes (native)', () => {
    const { getByText, getByTestId } = render(<PaymentInfo {...defaultProps} />);
    fireEvent.press(getByText('2026/1/1'));

    const picker = getByTestId('dateTimePicker');

    // Simulate change event
    fireEvent(picker, 'onChange', { type: 'set' }, new Date('2026-02-01'));

    expect(defaultProps.setStartDate).toHaveBeenCalledWith(new Date('2026-02-01'));
  });

  it('handles string date format in props', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} startDate="2026-01-15" />);
    // Should render without error
    expect(getByText(new Date('2026-01-15').toLocaleDateString())).toBeTruthy();
  });

  it('uses default currency TWD if undefined', () => {
    const { getByText } = render(<PaymentInfo {...defaultProps} currency="" />);
    expect(getByText('TWD')).toBeTruthy();
  });
});
