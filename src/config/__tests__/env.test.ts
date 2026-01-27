import { z } from 'zod';

describe('Env Validation', () => {
  const originalEnv = process.env || {};

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('validates correct environment variables', () => {
    process.env.EXPO_PUBLIC_SENTRY_DSN = 'https://example.com/sentry';
    process.env.EXPO_PUBLIC_API_URL = 'https://api.example.com';
    process.env.NODE_ENV = 'test';

    const { env } = require('../env');
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBe('https://example.com/sentry');
    expect(env.NODE_ENV).toBe('test');
  });

  it('allows optional variables to be missing', () => {
    // Verify process.env exists before modification
    const originalDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

    try {
      // Use defineProperty to bypass strict mode limitations if any
      Object.defineProperty(process.env, 'EXPO_PUBLIC_SENTRY_DSN', {
        value: undefined,
        writable: true,
      });
    } catch (e) {
      // Fallback
      delete process.env.EXPO_PUBLIC_SENTRY_DSN;
    }

    // Should not throw
    const { env } = require('../env');
    expect(env.EXPO_PUBLIC_SENTRY_DSN).toBeUndefined();
  });

  it('throws on invalid url', () => {
    process.env.EXPO_PUBLIC_API_URL = 'not-a-url';

    expect(() => {
      require('../env');
    }).toThrow(z.ZodError);
  });
});
