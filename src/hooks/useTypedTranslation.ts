import { useCallback } from 'react';
import i18n from '../i18n';
import { TranslationKeys } from '../i18n/types';

/**
 * A hook that provides a typed translation function based on the default English locale.
 * Ensures that all translation keys exist at compile time.
 */
export function useTypedTranslation() {
  const t = useCallback(
    (key: TranslationKeys, options?: Record<string, string | number | undefined>) => {
      return i18n.t(key, options);
    },
    [],
  );

  return { t, i18n };
}
