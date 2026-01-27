import { z } from 'zod';

const envSchema = z.object({
  // Add environment variables here
  EXPO_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  EXPO_PUBLIC_API_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
});

/**
 * Validates the environment variables against the schema.
 * Throws an error if validation fails, preventing the app from starting with invalid config.
 */
export const env = envSchema.parse(process.env);
