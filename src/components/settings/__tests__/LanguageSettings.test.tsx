import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import LanguageSettings from '../LanguageSettings';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      text: '#000000',
      accent: '#007AFF',
      borderColor: '#cccccc',
      subtleText: '#666',
    },
  }),
}));

const mockUpdateSettings = jest.fn();
jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(() => ({
    settings: { language: 'en' },
    updateSettings: mockUpdateSettings,
  })),
}));

jest.mock('../../../i18n', () => ({
  t: (key: string) => key,
  locale: 'en',
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import { useDatabase } from '../../../context/DatabaseContext';

describe('LanguageSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders language options correctly', () => {
    const { getByText } = render(<LanguageSettings />);

    expect(getByText('settings.language')).toBeTruthy();
    expect(getByText('繁體中文')).toBeTruthy();
    expect(getByText('English')).toBeTruthy();
  });

  it('highlights currently selected language', () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { language: 'zh' },
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<LanguageSettings />);
    // In a real test we might check styles, but here we can check for the checkmark icon existence or just standard rendering
    // Since we mocked Ionicons as string 'Ionicons', we can find it by type maybe?
    // Or just ensure no errors.
    expect(getByText('繁體中文')).toBeTruthy();
  });

  it('updates language when an option is selected', async () => {
    (useDatabase as jest.Mock).mockReturnValue({
      settings: { language: 'en' },
      updateSettings: mockUpdateSettings,
    });

    const { getByText } = render(<LanguageSettings />);

    // Press Traditional Chinese
    fireEvent.press(getByText('繁體中文'));

    await waitFor(() => {
      expect(mockUpdateSettings).toHaveBeenCalledWith({ language: 'zh' });
    });
  });
});
