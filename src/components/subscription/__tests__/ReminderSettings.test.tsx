import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReminderSettings from '../ReminderSettings';

// Mock dependencies
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
      subtleText: '#666666',
      inputBackground: '#f5f5f5',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      background: '#ffffff',
    },
  }),
}));

// Mock DateTimePicker
jest.mock('@react-native-community/datetimepicker', () => {
  const { View: MockView } = jest.requireActual('react-native');
  const MockDateTimePicker = (props: any) => <MockView testID="dateTimePicker" {...props} />;
  MockDateTimePicker.displayName = 'DateTimePicker';
  return MockDateTimePicker;
});

describe('ReminderSettings', () => {
  const defaultProps = {
    reminderEnabled: true,
    setReminderEnabled: jest.fn(),
    reminderTime: new Date('2026-01-01T09:00:00'),
    setReminderTime: jest.fn(),
    reminderDays: 1,
    setReminderDays: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders enable notification switch', () => {
    const { getByText } = render(<ReminderSettings {...defaultProps} />);
    expect(getByText('subscription.enableNotification')).toBeTruthy();
  });

  it('calls setReminderEnabled when switch is toggled', () => {
    const { UNSAFE_getAllByType } = render(<ReminderSettings {...defaultProps} />);
    const { Switch: MockSwitch } = jest.requireActual('react-native');
    const switches = UNSAFE_getAllByType(MockSwitch);
    fireEvent(switches[0], 'valueChange', false);
    expect(defaultProps.setReminderEnabled).toHaveBeenCalledWith(false);
  });

  it('shows reminder options when enabled', () => {
    const { getByText } = render(<ReminderSettings {...defaultProps} />);
    expect(getByText('subscription.notificationTime')).toBeTruthy();
    expect(getByText('subscription.reminderDays')).toBeTruthy();
  });

  it('hides reminder options when disabled', () => {
    const { queryByText } = render(<ReminderSettings {...defaultProps} reminderEnabled={false} />);
    expect(queryByText('subscription.notificationTime')).toBeNull();
  });

  it('displays formatted reminder time', () => {
    const { getByText } = render(<ReminderSettings {...defaultProps} />);
    expect(getByText('09:00')).toBeTruthy();
  });

  it('displays reminder days with text', () => {
    const { getByText } = render(<ReminderSettings {...defaultProps} />);
    expect(getByText('1 common.days')).toBeTruthy();
  });

  it('opens days picker when days button is pressed', () => {
    const { getByText, getAllByText } = render(<ReminderSettings {...defaultProps} />);

    // Open picker
    fireEvent.press(getByText('1 common.days'));

    // Check modal visibility/content
    const titles = getAllByText('subscription.reminderDays');
    expect(titles.length).toBeGreaterThanOrEqual(2);
  });

  it('opens time picker on press (native)', () => {
    const { getByText, getByTestId } = render(<ReminderSettings {...defaultProps} />);

    // Press time display
    fireEvent.press(getByText('09:00'));

    expect(getByTestId('dateTimePicker')).toBeTruthy();
  });

  it('updates time when picker changes (native)', () => {
    const { getByText, getByTestId } = render(<ReminderSettings {...defaultProps} />);
    fireEvent.press(getByText('09:00'));

    const picker = getByTestId('dateTimePicker');

    const newDate = new Date('2026-01-01T10:30:00');
    fireEvent(picker, 'onChange', { type: 'set' }, newDate);

    expect(defaultProps.setReminderTime).toHaveBeenCalledWith(newDate);
  });

  it('handles invalid date gracefully', () => {
    const { getByText } = render(
      <ReminderSettings {...defaultProps} reminderTime={new Date('invalid')} />,
    );
    expect(getByText('09:00')).toBeTruthy();
  });
});
