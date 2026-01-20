import React from 'react';
import { render, fireEvent, renderHook } from '@testing-library/react-native';
import { ToastProvider, useToast } from '../ToastContext';
import { Text, Button } from 'react-native';

// Mock Toast component to avoid testing UI details and animations
jest.mock('../../components/Toast', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, Text } = require('react-native');
  const MockToast = ({
    visible,
    message,
    type,
  }: {
    visible: boolean;
    message: string;
    type: string;
  }) => {
    if (!visible) return null;
    return (
      <View testID="mock-toast">
        <Text>{message}</Text>
        <Text>{type}</Text>
      </View>
    );
  };
  MockToast.displayName = 'MockToast';
  return MockToast;
});

describe('ToastContext', () => {
  it('renders children', () => {
    const { getByText } = render(
      <ToastProvider>
        <Text>Child Content</Text>
      </ToastProvider>,
    );
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('showToast makes Toast visible with correct props', async () => {
    const TestComponent = () => {
      const { showToast } = useToast();
      return (
        <Button title="Show Toast" onPress={() => showToast('Hello World', 'success', 2000)} />
      );
    };

    const { getByText, getByTestId, queryByTestId } = render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>,
    );

    // Initially toast should be hidden (null)
    expect(queryByTestId('mock-toast')).toBeNull();

    // Trigger toast
    fireEvent.press(getByText('Show Toast'));

    // Toast should be visible
    expect(getByTestId('mock-toast')).toBeTruthy();
    expect(getByText('Hello World')).toBeTruthy();
    expect(getByText('success')).toBeTruthy();
  });

  it('throws error if useToast used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within a ToastProvider');

    spy.mockRestore();
  });
});
