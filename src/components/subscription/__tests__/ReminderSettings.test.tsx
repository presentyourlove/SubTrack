import React from 'react';
import { render } from '@testing-library/react-native';
import ReminderSettings from '../ReminderSettings';
import { ThemeProvider } from '../../../context/ThemeContext';

describe('ReminderSettings', () => {
  const mockSetReminderEnabled = jest.fn();
  const mockSetReminderTime = jest.fn();
  const mockSetReminderDays = jest.fn();

  it('renders correctly', () => {
    const { getByText } = render(
      <ThemeProvider>
        <ReminderSettings
          reminderEnabled={true}
          setReminderEnabled={mockSetReminderEnabled}
          reminderTime={new Date('2024-01-01T09:00:00')}
          setReminderTime={mockSetReminderTime}
          reminderDays={1}
          setReminderDays={mockSetReminderDays}
        />
      </ThemeProvider>,
    );
    expect(getByText('subscription.enableNotification')).toBeTruthy();
  });
});
