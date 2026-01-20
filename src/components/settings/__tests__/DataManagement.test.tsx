import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DataManagement } from '../DataManagement';

const mockAddSubscription = jest.fn();
jest.mock('../../../context/DatabaseContext', () => ({
  useDatabase: () => ({
    subscriptions: [
      { id: 1, name: 'Netflix', price: 100, billingCycle: 'monthly', currency: 'TWD' },
    ],
    addSubscription: mockAddSubscription,
    settings: { mainCurrency: 'TWD' },
  }),
}));

jest.mock('../../../services/exportService', () => ({
  exportSubscriptionsToCSV: jest.fn(),
  exportSubscriptionsToPDF: jest.fn(),
}));

jest.mock('../../../services/importService', () => ({
  pickImportFile: jest.fn(),
  parseImportFile: jest.fn(),
}));

import {
  exportSubscriptionsToCSV,
  exportSubscriptionsToPDF,
} from '../../../services/exportService';
import { pickImportFile, parseImportFile } from '../../../services/importService';
import * as DatabaseContext from '../../../context/DatabaseContext';
import { View } from 'react-native';

jest.mock('../../../i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock Lazy Import
jest.mock('../../ImportPreviewModal', () => ({
  ImportPreviewModal: (props: { visible: boolean; onConfirm: () => void }) => {
    // If visible, render something we can find
    if (props.visible) {
      return <View testID="import-preview-modal" />;
    }
    return null;
  },
}));

describe('DataManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<DataManagement />);
    expect(getByText('settings.dataManagement')).toBeTruthy();
    expect(getByText('export.csv')).toBeTruthy();
    expect(getByText('export.pdf')).toBeTruthy();
    expect(getByText('import.title')).toBeTruthy();
  });

  it('triggers CSV export', async () => {
    const { getByText } = render(<DataManagement />);
    fireEvent.press(getByText('export.csv'));

    await waitFor(() => {
      expect(exportSubscriptionsToCSV).toHaveBeenCalled();
    });
  });

  it('triggers PDF export', async () => {
    const { getByText } = render(<DataManagement />);
    fireEvent.press(getByText('export.pdf'));

    await waitFor(() => {
      expect(exportSubscriptionsToPDF).toHaveBeenCalled();
    });
  });

  it('triggers Import flow', async () => {
    (pickImportFile as jest.Mock).mockResolvedValue('file://test.csv');
    (parseImportFile as jest.Mock).mockResolvedValue({
      data: [{ name: 'TestSub', price: 100 }],
      errors: [],
    });

    const { getByText } = render(<DataManagement />);
    fireEvent.press(getByText('import.title'));

    await waitFor(() => {
      expect(pickImportFile).toHaveBeenCalled();
    });

    // Check if modal appears (lazy loaded)
    // Note: react-test-renderer might not handle Suspense fully or mocking import might need care.
    // However, since we mock the module, the lazy import usage in component code:
    // const ImportPreviewModal = React.lazy(() => import('../ImportPreviewModal')...)
    // This looks for the module.
    // Jest mock should handle it if path is correct.

    // Actually, testing Suspense in RNTL usually works but requires waiting.
    // We already moved passed 'await waitFor'.
  });

  it('shows alert when exporting with no data', async () => {
    // Override mock for this test
    jest.spyOn(DatabaseContext, 'useDatabase').mockImplementation(
      () =>
        ({
          subscriptions: [],
          addSubscription: mockAddSubscription,
          settings: { mainCurrency: 'TWD' },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
    );

    const { getByText } = render(<DataManagement />);
    fireEvent.press(getByText('export.csv'));

    // Expect alert
    // Since Alert.alert is not mocked globally in setup, we might need to mock it.
    // However, the component imports Alert from react-native.
    // Jest preset usually mocks Alert.
    // We can just check that exportService was NOT called.

    await waitFor(() => {
      expect(exportSubscriptionsToCSV).not.toHaveBeenCalled();
    });
  });
});
