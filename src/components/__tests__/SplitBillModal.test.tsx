import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SplitBillModal from '../SplitBillModal';
import { ThemeProvider } from '../../context/ThemeContext';
import { Subscription } from '../../types';
import * as MemberService from '../../services/db/members';

// Mock DatabaseContext
jest.mock('../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    database: { transaction: jest.fn() }, // Mock DB object
  }),
}));

// Mock MemberService
jest.mock('../../services/db/members', () => ({
  getMembers: jest.fn(),
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
    memberCount: 2,
    workspaceId: 1,
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
  };

  const mockMembers = [
    { id: 1, name: 'Alice', status: 'paid', subscriptionId: 1 },
    { id: 2, name: 'Bob', status: 'unpaid', subscriptionId: 1 },
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (MemberService.getMembers as jest.Mock).mockResolvedValue(mockMembers);
  });

  it('renders modal correctly when visible', async () => {
    const { getByText } = renderWithProviders(
      <SplitBillModal visible={true} subscription={mockSubscription} onClose={mockOnClose} />,
    );

    expect(getByText('Split Bill')).toBeTruthy();

    // Wait for members to load
    await waitFor(() => {
      expect(getByText('Alice')).toBeTruthy();
      expect(getByText('Bob')).toBeTruthy();
    });
  });

  it('toggles member status when pressed', async () => {
    const { getByText } = renderWithProviders(
      <SplitBillModal visible={true} subscription={mockSubscription} onClose={mockOnClose} />,
    );

    // Wait for load
    await waitFor(() => expect(getByText('Alice')).toBeTruthy());

    // Press Alice (currently paid)
    fireEvent.press(getByText('Alice'));

    await waitFor(() => {
      expect(MemberService.updateMemberStatus).toHaveBeenCalledWith(expect.anything(), 1, 'unpaid');
    });
  });
});
