import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AddSubscriptionModal from '../AddSubscriptionModal';
// import { ThemeProvider } from '../../context/ThemeContext'; // Assuming you have this or need to mock useTheme

// Mock dependencies
jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      text: '#000000',
      primary: '#blue',
      card: '#f0f0f0',
      border: '#cccccc',
    },
    isDark: false,
  }),
}));

// Mock utils that might use i18n or complex logic
jest.mock('../../utils/dateHelper', () => ({
  formatTime: jest.fn(() => '09:00'),
  parseTime: jest.fn(() => new Date()),
  getDefaultReminderTime: jest.fn(() => new Date()),
}));

describe('AddSubscriptionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when visible', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddSubscriptionModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    expect(getByText('新增訂閱')).toBeTruthy();
    expect(getByPlaceholderText('例: Netflix Premium')).toBeTruthy();
  });

  it('validates required fields on submit', () => {
    const { getByText } = render(
      <AddSubscriptionModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    const submitButton = getByText('儲存'); // Assuming 'save' maps to '儲存' in mock/default
    fireEvent.press(submitButton);

    // Should not call onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
    // In real app, it calls alert(). We mocked alert? No.
    // Ideally we should mock global.alert or window.alert
  });

  it('submits form with valid data', async () => {
    const { getByText, getByPlaceholderText } = render(
      <AddSubscriptionModal visible={true} onClose={mockOnClose} onSubmit={mockOnSubmit} />,
    );

    fireEvent.changeText(getByPlaceholderText('例: Netflix Premium'), 'Test Sub');
    fireEvent.changeText(getByPlaceholderText('390'), '100');

    // Select category? It defaults to 'entertainment'.

    // Submit
    const submitButton = getByText('儲存');
    fireEvent.press(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Sub',
        price: 100,
        category: 'entertainment',
      }),
    );
  });
});
