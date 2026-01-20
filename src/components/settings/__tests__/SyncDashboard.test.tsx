import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SyncDashboard from '../SyncDashboard';

// Mock dependencies
const mockUpdateSubscription = jest.fn();
const mockFetchSubTrackEvents = jest.fn();
const mockExtractSubscriptionId = jest.fn();

jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      card: '#ffffff',
      borderColor: '#e0e0e0',
      accent: '#007AFF',
      text: '#000000',
      subtleText: '#666666',
    },
  }),
}));

jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: [{ id: 'sub-1', name: 'Netflix', nextBillingDate: '2026-02-01' }],
    updateSubscription: mockUpdateSubscription,
  }),
}));

jest.mock('../../../services/calendarSyncService', () => ({
  calendarSyncService: {
    fetchSubTrackEvents: () => mockFetchSubTrackEvents(),
    extractSubscriptionId: (notes: string) => mockExtractSubscriptionId(notes),
  },
}));

jest.mock('../../../utils/haptics', () => ({
  hapticFeedback: {
    medium: jest.fn(),
  },
}));

// Mock global alert
global.alert = jest.fn();

describe('SyncDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchSubTrackEvents.mockResolvedValue([]);
  });

  it('renders sync dashboard with title and description', () => {
    const { getByText } = render(<SyncDashboard />);

    expect(getByText('calendar.sync')).toBeTruthy();
    expect(getByText('calendar.direction')).toBeTruthy();
  });

  it('renders sync button', () => {
    const { getByText } = render(<SyncDashboard />);

    expect(getByText('calendar.syncNow')).toBeTruthy();
  });

  it('triggers sync when button is pressed', async () => {
    mockFetchSubTrackEvents.mockResolvedValue([]);

    const { getByText } = render(<SyncDashboard />);

    const syncButton = getByText('calendar.syncNow');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(mockFetchSubTrackEvents).toHaveBeenCalled();
    });
  });

  it('shows success alert after sync', async () => {
    mockFetchSubTrackEvents.mockResolvedValue([]);

    const { getByText } = render(<SyncDashboard />);

    const syncButton = getByText('calendar.syncNow');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith(expect.stringContaining('calendar.syncSuccess'));
    });
  });

  it('handles sync error gracefully', async () => {
    mockFetchSubTrackEvents.mockRejectedValue(new Error('Sync failed'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { getByText } = render(<SyncDashboard />);

    const syncButton = getByText('calendar.syncNow');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('calendar.syncError');
    });

    consoleSpy.mockRestore();
  });

  it('updates subscription when calendar date differs', async () => {
    mockFetchSubTrackEvents.mockResolvedValue([
      {
        id: 'event-1',
        startDate: '2026-03-01T00:00:00.000Z',
        notes: 'SubTrack ID: sub-1',
      },
    ]);
    mockExtractSubscriptionId.mockReturnValue('sub-1');
    mockUpdateSubscription.mockResolvedValue(undefined);

    const { getByText } = render(<SyncDashboard />);

    const syncButton = getByText('calendar.syncNow');
    fireEvent.press(syncButton);

    await waitFor(() => {
      expect(mockUpdateSubscription).toHaveBeenCalledWith('sub-1', {
        nextBillingDate: '2026-03-01',
      });
    });
  });
});
