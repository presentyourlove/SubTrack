import React from 'react';
import { render } from '@testing-library/react-native';
import AlertCard from '../AlertCard';

// Mock dependencies
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: jest.fn(),
}));

jest.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({
    colors: {
      text: '#000000',
    },
  }),
}));

jest.mock('../../utils/dateHelper', () => ({
  getDaysUntil: jest.fn(),
}));

jest.mock('../../i18n', () => ({
  t: (key: string, params?: { count?: number }) => {
    if (params?.count !== undefined) {
      return `${key} count:${params.count}`;
    }
    return key;
  },
}));

// Import mocked modules to change implementations
// Import mocked modules to change implementations
import { useDatabase } from '../../context/DatabaseContext';
import { getDaysUntil } from '../../utils/dateHelper';

describe('AlertCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "everything good" state when no subscriptions are expiring soon', () => {
    (useDatabase as jest.Mock).mockReturnValue({
      subscriptions: [{ id: '1', nextBillingDate: '2024-02-10' }],
    });
    (getDaysUntil as jest.Mock).mockReturnValue(10); // Not within 3 days

    const { getByText } = render(<AlertCard />);

    expect(getByText('alert.statusTitle')).toBeTruthy();
    expect(getByText('alert.upcomingMessage count:0')).toBeTruthy();
  });

  it('renders warning state when subscriptions are expiring soon', () => {
    (useDatabase as jest.Mock).mockReturnValue({
      subscriptions: [
        { id: '1', nextBillingDate: '2024-02-02' }, // 1 day away
        { id: '2', nextBillingDate: '2024-02-10' },
      ],
    });

    // getDaysUntil implementation for different calls
    (getDaysUntil as jest.Mock).mockImplementation((date: string) => {
      if (date === '2024-02-02') return 1;
      return 10;
    });

    const { getByText } = render(<AlertCard />);

    expect(getByText('alert.upcomingTitle')).toBeTruthy();
    expect(getByText('alert.upcomingMessage count:1')).toBeTruthy();
    expect(getByText('alert.balanceHint')).toBeTruthy();
  });
});
