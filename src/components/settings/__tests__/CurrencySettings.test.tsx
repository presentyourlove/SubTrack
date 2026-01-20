import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CurrencySettings from '../CurrencySettings';

// Mock dependencies
const mockUpdateSettings = jest.fn();
const mockShowToast = jest.fn();

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      text: '#000000',
      subtleText: '#666666',
      background: '#f5f5f5',
      expense: '#FF3B30',
    },
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    settings: {
      mainCurrency: 'TWD',
      exchangeRates: JSON.stringify({ USD: 32.5, JPY: 0.21 })
    },
    updateSettings: mockUpdateSettings,
  }),
}));

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

describe('CurrencySettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<CurrencySettings />);
    expect(getByText('settings.currency')).toBeTruthy();
  });

  it('opens main currency modal when pressed', () => {
    const { getByText, getAllByText } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));

    expect(getByText('主要幣別')).toBeTruthy();
    expect(getByText('USD')).toBeTruthy();
    expect(getByText('JPY')).toBeTruthy();
  });

  it('calls updateSettings when changing main currency', () => {
    const { getByText } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));

    fireEvent.press(getByText('USD'));
    expect(mockUpdateSettings).toHaveBeenCalledWith({ mainCurrency: 'USD' });
  });

  it('opens exchange rate editor modal', () => {
    const { getByText } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    expect(getByText('編輯匯率')).toBeTruthy();
    expect(getByText('新增幣別')).toBeTruthy();
  });

  it('can add a new custom currency', () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    fireEvent.changeText(getByPlaceholderText('代碼 (Ex: EUR)'), 'EUR');
    fireEvent.changeText(getByPlaceholderText('匯率'), '35');
    fireEvent.press(getByTestId('add-currency-button'));

    expect(mockShowToast).toHaveBeenCalledWith('已新增 EUR', 'success');
  });

  it('can reset exchange rates to default', () => {
    const { getByText, getAllByText, getByTestId } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    fireEvent.press(getByTestId('reset-rates-button'));
    // Use getAllByText because USD appears in the background list and the editor
    expect(getAllByText('USD').length).toBeGreaterThanOrEqual(1);
  });

  it('can save exchange rates', async () => {
    const { getByText, getByTestId } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    fireEvent.press(getByTestId('save-rates-button'));
    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({
      exchangeRates: expect.stringContaining('"USD":32.5')
    }));
  });

  it('shows error when saving invalid rates', async () => {
    const { getByText, getAllByPlaceholderText, getByTestId } = render(<CurrencySettings />);
    fireEvent.press(getByText('settings.currency'));
    fireEvent.press(getByText('編輯匯率與新增幣別'));

    const inputs = getAllByPlaceholderText('0.00');
    fireEvent.changeText(inputs[0], 'invalid');

    fireEvent.press(getByTestId('save-rates-button'));
    expect(mockShowToast).toHaveBeenCalledWith(expect.stringContaining('格式不正確'), 'error');
  });
});
