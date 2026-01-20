import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CurrencySettings from '../CurrencySettings';
import { useDatabase } from '../../../context/DatabaseContext';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      background: '#ffffff',
      text: '#000000',
      subtleText: '#666666',
      card: '#f0f0f0',
      border: '#cccccc',
      accent: '#007AFF',
      borderColor: '#cccccc',
      expense: '#FF3B30',
    },
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(),
}));

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: jest.fn(),
  }),
}));

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

describe('CurrencySettings', () => {
  const mockUpdateSettings = jest.fn();
  const mockSettings = {
    mainCurrency: 'TWD',
    exchangeRates: JSON.stringify({ TWD: 1, USD: 0.032 }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDatabase as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings,
    });
  });

  it('renders correctly', () => {
    const { getByText } = render(<CurrencySettings />);
    expect(getByText('settings.currency')).toBeTruthy();
    expect(getByText('settings.mainCurrency')).toBeTruthy(); // Checks if i18n key is present or used
  });

  it('opens modal on press', () => {
    const { getByText } = render(<CurrencySettings />);

    // Find the touchable by text or other means.
    // Since the structure is Touchable -> View -> Text('settings.currency')
    fireEvent.press(getByText('settings.currency'));

    expect(getByText('主要幣別')).toBeTruthy();
  });

  it('updates currency when selected', async () => {
    const { getByText } = render(<CurrencySettings />);

    // Open modal
    fireEvent.press(getByText('settings.currency'));

    // Select USD
    fireEvent.press(getByText('USD'));

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({ mainCurrency: 'USD' });
    });
  });

  it('opens exchange rate editor', () => {
    const { getByText } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    expect(getByText('編輯匯率')).toBeTruthy();
    expect(getByText('匯率相對於 TWD (新台幣 = 1)')).toBeTruthy();
  });
});
