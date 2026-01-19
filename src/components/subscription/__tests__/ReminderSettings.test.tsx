import React from 'react';
import { render } from '@testing-library/react-native';
import ReminderSettings from '../ReminderSettings';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ReminderSettings', () => {
  const mockData = {
    reminderEnabled: true,
    reminderTime: '09:00',
  } as any;
  const mockOnChange = jest.fn();

  it('renders switch', () => {
    const { getByTestId } = renderWithProviders(
      <ReminderSettings data={mockData} onChange={mockOnChange} />,
    );
    // Check switch or text
  });
});
