import React from 'react';
import { render, renderHook, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../AuthContext';
import { onAuthStateChange } from '../../services/authService';
import { Text } from 'react-native';

// Mock auth service
jest.mock('../../services/authService', () => ({
  onAuthStateChange: jest.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('provides initial loading state', () => {
    (onAuthStateChange as jest.Mock).mockImplementation(() => () => {});

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    // Initial state might be loading=true until effect runs
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('updates state when user changes', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    (onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      callback(mockUser);
      return () => {};
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('updates state when user logs out', async () => {
    (onAuthStateChange as jest.Mock).mockImplementation((callback) => {
      callback(null);
      return () => {};
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper: Wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this specific test as React will log an error for the thrown exception
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    spy.mockRestore();
  });
});
