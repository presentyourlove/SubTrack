import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ServiceCard } from '../cards/ServiceCard';

// Mock dependencies
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  default: jest.fn(() => 'light'),
}));

describe('ServiceCard', () => {
  const mockService = {
    name: 'Netflix',
    icon: '📺',
    category: 'entertainment',
    defaultPrice: 15.99,
    currency: 'USD',
    billingCycle: 'monthly',
  } as any;

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders service name', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    expect(getByText('Netflix')).toBeTruthy();
  });

  it('renders service icon', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    expect(getByText('📺')).toBeTruthy();
  });

  it('renders category label', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    expect(getByText('影音娛樂')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    fireEvent.press(getByText('Netflix'));

    expect(mockOnPress).toHaveBeenCalledWith(mockService);
  });

  it('renders productivity category', () => {
    const productivityService = { ...mockService, category: 'productivity' };
    const { getByText } = render(
      <ServiceCard service={productivityService} onPress={mockOnPress} />,
    );

    expect(getByText('生產力')).toBeTruthy();
  });

  it('renders lifestyle category', () => {
    const lifestyleService = { ...mockService, category: 'lifestyle' };
    const { getByText } = render(<ServiceCard service={lifestyleService} onPress={mockOnPress} />);

    expect(getByText('生活')).toBeTruthy();
  });

  it('renders other category', () => {
    const otherService = { ...mockService, category: 'other' };
    const { getByText } = render(<ServiceCard service={otherService} onPress={mockOnPress} />);

    expect(getByText('其他')).toBeTruthy();
  });

  it('has accessibility label', () => {
    const { getByLabelText } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    expect(getByLabelText('serviceCatalog.select Netflix')).toBeTruthy();
  });

  it('renders in dark mode', () => {
    const useColorScheme = require('react-native/Libraries/Utilities/useColorScheme').default;
    useColorScheme.mockReturnValue('dark');

    const { toJSON } = render(<ServiceCard service={mockService} onPress={mockOnPress} />);

    expect(toJSON()).toBeTruthy();
  });
});
