import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddSubscriptionModal from '../modals/AddSubscriptionModal';

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      text: '#000000',
      primary: '#blue',
      card: '#f0f0f0',
      border: '#cccccc',
      subtleText: '#666',
      borderColor: '#ccc',
      accent: '#007AFF',
    },
    isDark: false,
  }),
}));

jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn().mockReturnValue({
    db: null,
    settings: { displayCurrency: 'TWD' },
    exchangeRates: { TWD: 1 },
  }),
}));

// Mock utils that might use i18n or complex logic
jest.mock('../../utils/dateHelper', () => ({
  formatTime: jest.fn(() => '09:00'),
  parseTime: jest.fn(() => new Date()),
  getDefaultReminderTime: jest.fn(() => new Date()),
}));

// Mock imageService to avoid native module errors
jest.mock('../../services/imageService', () => ({
  saveCustomIcon: jest.fn().mockResolvedValue('file:///mock-icon.jpg'),
  loadCustomIcon: jest.fn().mockResolvedValue(null),
  deleteCustomIcon: jest.fn().mockResolvedValue(undefined),
}));

// Mock TagSelector
jest.mock('../ui/TagSelector', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    __esModule: true,
    TagSelector: () =>
      React.createElement(View, null, React.createElement(Text, null, 'MockTagSelector')),
  };
});

// Mock sub-components
jest.mock('../subscription/BasicInfo', () => 'BasicInfo');
jest.mock('../subscription/CategorySelector', () => 'CategorySelector');
jest.mock('../subscription/PaymentInfo', () => 'PaymentInfo');
jest.mock('../subscription/ReminderSettings', () => 'ReminderSettings');

describe('AddSubscriptionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText } = render(
      <AddSubscriptionModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    // i18n mock returns key as-is
    expect(getByText('subscription.addTitle')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <AddSubscriptionModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    // Find and press cancel button (i18n key)
    fireEvent.press(getByText('common.cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
