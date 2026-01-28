import React from 'react';
import { render } from '@testing-library/react-native';
import AlertCard from '../cards/AlertCard';

// Mock dependencies
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: [
      { nextBillingDate: new Date().toISOString() }, // Due today
    ],
  }),
}));

jest.mock('../../utils/dateHelper', () => ({
  getDaysUntil: () => 1, // Mock 1 day until
}));

describe('AlertCard', () => {
  it('renders upcoming message when subscriptions are near', () => {
    const { getByText } = render(<AlertCard />);
    expect(getByText('alert.upcomingTitle')).toBeTruthy();
  });
});
