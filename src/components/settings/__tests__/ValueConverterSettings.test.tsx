import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ValueConverterSettings from '../ValueConverterSettings';
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
      inputBackground: '#eeeeee',
    },
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(),
}));

jest.mock('../../../i18n', () => ({
  t: (key: string) => key,
}));

describe('ValueConverterSettings', () => {
  const mockUpdateSettings = jest.fn();
  const mockSettings = {
    conversionEnabled: false,
    salaryType: 'hourly',
    salaryAmount: 0,
    workDaysPerMonth: 22,
    workHoursPerDay: 8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDatabase as jest.Mock).mockReturnValue({
      settings: mockSettings,
      updateSettings: mockUpdateSettings,
    });
  });

  it('renders title and switch', () => {
    const { getByText } = render(<ValueConverterSettings />);
    expect(getByText('settings.valueConverter.title')).toBeTruthy();
  });

  it('toggles conversion enabled', async () => {
    const { getByRole } = render(<ValueConverterSettings />);
    const switchElement = getByRole('switch');

    fireEvent(switchElement, 'valueChange', true);

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({ conversionEnabled: true });
    });
  });

  it('shows inputs when enabled', () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, conversionEnabled: true },
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<ValueConverterSettings />);
    expect(getByText('settings.valueConverter.hourly')).toBeTruthy();
    expect(getByText('settings.valueConverter.monthly')).toBeTruthy();
  });

  it('updates salary amount', async () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, conversionEnabled: true },
      updateSettings: mockUpdateSettings,
    });

    const { getByPlaceholderText } = render(<ValueConverterSettings />);
    const input = getByPlaceholderText('0');

    fireEvent.changeText(input, '1000');

    expect(mockUpdateSettings).toHaveBeenCalledWith({ salaryAmount: 1000 });
  });

  it('switches salary type', async () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, conversionEnabled: true, salaryType: 'hourly' },
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<ValueConverterSettings />);

    fireEvent.press(getByText('settings.valueConverter.monthly'));

    expect(mockUpdateSettings).toHaveBeenCalledWith({ salaryType: 'monthly' });
  });

  it('updates monthly days and hours', async () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, conversionEnabled: true, salaryType: 'monthly' },
      updateSettings: mockUpdateSettings,
    });

    const { getAllByDisplayValue } = render(<ValueConverterSettings />);
    // Assuming default values 22 and 8 are rendered
    // But implementation uses `value` prop controlled by local state initialized from settings.

    const inputs = getAllByDisplayValue('22');
    // There might be ambiguity if not specific.
    // Let's use internal logic knowledge: 22 is workDaysPerMonth

    fireEvent.changeText(inputs[0], '20');
    expect(mockUpdateSettings).toHaveBeenCalledWith({ workDaysPerMonth: 20 });
  });
});
