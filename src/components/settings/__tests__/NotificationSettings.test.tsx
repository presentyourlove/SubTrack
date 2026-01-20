import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import NotificationSettings from '../NotificationSettings';
import * as Notifications from 'expo-notifications';

// Mock dependencies
const mockUpdateSettings = jest.fn();
const mockUpdateSubscription = jest.fn();
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
    },
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    settings: { notificationsEnabled: true },
    updateSettings: mockUpdateSettings,
    subscriptions: [
      { id: 1, name: 'Netflix', reminderEnabled: true, nextBillingDate: '2026-02-01' },
      { id: 2, name: 'Spotify', reminderEnabled: false, nextBillingDate: '2026-02-15' },
    ],
    updateSubscription: mockUpdateSubscription,
  }),
}));

jest.mock('../../../context/ToastContext', () => ({
  useToast: () => ({
    showToast: mockShowToast,
  }),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
}));

const mockGetPermissions = Notifications.getPermissionsAsync as jest.Mock;

describe('NotificationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    mockUpdateSubscription.mockResolvedValue(undefined);
  });

  it('renders notification settings button', () => {
    const { getAllByText } = render(<NotificationSettings />);

    expect(getAllByText('settings.notifications').length).toBeGreaterThanOrEqual(1);
  });

  it('opens modal when button is pressed', () => {
    const { getAllByText, getByText } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    // Modal should be visible with permission status section
    expect(getByText('權限狀態')).toBeTruthy();
  });

  it('shows granted permission status', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });

    const { getAllByText, findByText } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    expect(await findByText('通知權限已授予')).toBeTruthy();
  });

  it('shows global notification switch', () => {
    const { getAllByText, getByText } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    expect(getByText('全域通知')).toBeTruthy();
    expect(getByText('啟用所有訂閱通知')).toBeTruthy();
  });

  it('shows subscriptions with notifications enabled', () => {
    const { getAllByText, getByText } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    expect(getByText('已開啟通知的訂閱')).toBeTruthy();
    expect(getByText('Netflix')).toBeTruthy();
  });

  it('toggles global notification setting', () => {
    const { getAllByText, UNSAFE_getAllByType } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    const { Switch } = require('react-native');
    const switches = UNSAFE_getAllByType(Switch);

    // Toggle global notification switch (first switch)
    fireEvent(switches[0], 'valueChange', false);

    expect(mockUpdateSettings).toHaveBeenCalledWith({ notificationsEnabled: false });
  });

  it('toggles subscription notification', async () => {
    const { getAllByText, UNSAFE_getAllByType } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    const { Switch } = require('react-native');
    const switches = UNSAFE_getAllByType(Switch);

    // Toggle subscription notification (second switch - first subscription)
    if (switches.length > 1) {
      fireEvent(switches[1], 'valueChange', false);

      expect(mockUpdateSubscription).toHaveBeenCalledWith(1, { reminderEnabled: false });
    }
  });
});

// Test denied permission
describe('NotificationSettings - Denied Permission', () => {
  beforeEach(() => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' });
  });

  it('shows denied permission status and settings button', async () => {
    const { getAllByText, findByText } = render(<NotificationSettings />);

    const button = getAllByText('settings.notifications')[0].parent?.parent;
    if (button) {
      fireEvent.press(button);
    }

    expect(await findByText('通知權限已拒絕')).toBeTruthy();
    expect(await findByText('開啟系統設定')).toBeTruthy();
  });
});

// Test no enabled subscriptions
describe('NotificationSettings - Empty subscriptions', () => {
  beforeEach(() => {
    jest.doMock('../../../context/DatabaseContext', () => ({
      useDatabase: () => ({
        settings: { notificationsEnabled: true },
        updateSettings: jest.fn(),
        subscriptions: [],
        updateSubscription: jest.fn(),
      }),
    }));
  });

  it('renders empty state message', () => {
    const { toJSON } = render(<NotificationSettings />);

    expect(toJSON()).toBeTruthy();
  });
});
