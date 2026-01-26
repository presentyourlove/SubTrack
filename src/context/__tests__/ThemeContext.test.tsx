import React from 'react';
import { render, act, renderHook } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeContext';
import { Colors } from '../../constants/Colors';
import { Text, useColorScheme } from 'react-native';

// Mock react-native
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  return {
    ...actual,
    useColorScheme: jest.fn(),
  };
});

describe('ThemeContext', () => {
  beforeEach(() => {
    (useColorScheme as jest.Mock).mockReturnValue('light');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <ThemeProvider>
        <Text>Test Child</Text>
      </ThemeProvider>,
    );
    expect(getByText('Test Child')).toBeTruthy();
  });

  it('provides default light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.theme).toBe('light');
    expect(result.current.colors).toEqual(Colors.light);
  });

  it('initializes with dark theme if system scheme is dark', () => {
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.theme).toBe('dark');
    expect(result.current.colors).toEqual(Colors.dark);
  });

  it('toggleTheme switches theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
  });

  it('setTheme sets specific theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(result.current.theme).toBe('dark');
  });

  it('updates when system color scheme changes', () => {
    // Initial render
    (useColorScheme as jest.Mock).mockReturnValue('light');
    const { result, rerender } = renderHook(() => useTheme(), { wrapper: ThemeProvider });
    expect(result.current.theme).toBe('light');

    // Change mock and re-render
    (useColorScheme as jest.Mock).mockReturnValue('dark');
    rerender({});

    expect(result.current.theme).toBe('dark');
  });

  it('throws error if useTheme used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useTheme());
    }).toThrow('useTheme must be used within a ThemeProvider');

    spy.mockRestore();
  });
});
