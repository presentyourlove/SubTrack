import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImportPreviewModal } from '../ImportPreviewModal';

describe('ImportPreviewModal', () => {
  const defaultProps = {
    visible: true,
    data: [
      {
        name: 'Netflix',
        icon: '🎬',
        price: 15.99,
        currency: 'USD',
        category: 'entertainment',
        billingCycle: 'monthly',
      },
    ],
    errors: [],
    onConfirm: jest.fn(),
    onCancel: jest.fn(),
  };

  it('renders correctly with data', () => {
    const { getByText } = render(<ImportPreviewModal {...defaultProps} />);
    expect(getByText('import.previewTitle')).toBeTruthy();
    expect(getByText('Netflix')).toBeTruthy();
  });

  it('renders errors when present', () => {
    const props = {
      ...defaultProps,
      errors: ['Invalid date format in row 1'],
    };
    const { getByText } = render(<ImportPreviewModal {...props} />);
    expect(getByText('import.errorTitle')).toBeTruthy();
    expect(getByText('• Invalid date format in row 1')).toBeTruthy();
  });

  it('calls onConfirm when confirm button is pressed', () => {
    const { getByLabelText } = render(<ImportPreviewModal {...defaultProps} />);
    fireEvent.press(getByLabelText('import.confirm'));
    expect(defaultProps.onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button is pressed', () => {
    const { getByLabelText } = render(<ImportPreviewModal {...defaultProps} />);
    fireEvent.press(getByLabelText('common.cancel'));
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });
});
