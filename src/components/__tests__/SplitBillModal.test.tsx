import React from 'react';
import { render } from '@testing-library/react-native';
import SplitBillModal from '../SplitBillModal';
import { ThemeProvider } from '../../context/ThemeContext';
import { Subscription } from '../../types';

// Mock DatabaseContext
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    database: null,
  }),
}));

// Mock MemberService
jest.mock('../../services/db/members', () => ({
  getMembers: jest.fn().mockResolvedValue([]),
  syncMemberCount: jest.fn().mockResolvedValue(undefined),
  updateMemberStatus: jest.fn().mockResolvedValue(undefined),
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('SplitBillModal', () => {
  const mockSubscription: Subscription = {
    id: 1,
    name: 'Netflix',
    price: 390,
    currency: 'TWD',
    billingCycle: 'monthly',
    category: 'entertainment',
    icon: '🎬',
    startDate: '2023-01-01',
    nextBillingDate: '2024-01-01',
    reminderEnabled: false,
    memberCount: 4,
    workspaceId: 1,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockOnClose = jest.fn();

  it('renders modal correctly when visible', () => {
    const { getByText } = renderWithProviders(
      <SplitBillModal visible={true} subscription={mockSubscription} onClose={mockOnClose} />,
    );

    expect(getByText('Split Bill')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const { queryByText } = renderWithProviders(
      <SplitBillModal visible={false} subscription={mockSubscription} onClose={mockOnClose} />,
    );

    // Modal content should not be visible
    expect(queryByText('splitBill.title')).toBeNull();
  });
});
