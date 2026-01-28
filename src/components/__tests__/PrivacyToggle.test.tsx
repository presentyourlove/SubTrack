import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PrivacyToggle from '../ui/PrivacyToggle';

// Mock dependencies
const mockUpdateSettings = jest.fn();
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    settings: { privacyMode: false },
    updateSettings: mockUpdateSettings,
  }),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: { text: '#000000' },
  }),
}));

jest.mock('../../utils/haptics', () => ({
  hapticFeedback: {
    selection: jest.fn(),
  },
}));

describe('PrivacyToggle', () => {
  it('renders eye icon when privacy mode is off', () => {
    const { getByLabelText } = render(<PrivacyToggle />);
    expect(getByLabelText('Hide amounts')).toBeTruthy();
  });

  it('calls updateSettings when pressed', async () => {
    const { getByLabelText } = render(<PrivacyToggle />);
    fireEvent.press(getByLabelText('Hide amounts'));

    const { waitFor } = require('@testing-library/react-native');
    await waitFor(() => expect(mockUpdateSettings).toHaveBeenCalledWith({ privacyMode: true }));
  });
});
