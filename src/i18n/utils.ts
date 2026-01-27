import i18n from './index';
import { TranslationKeys } from './types';

/**
 * Typed translation helper for use outside of React components/hooks.
 */
export const t = (key: TranslationKeys, options?: Record<string, any>) => i18n.t(key, options);
