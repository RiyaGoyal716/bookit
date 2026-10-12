import { I18n } from 'i18n-js';

import en from './en.json';
import hi from './hi.json';
import ar from './ar.json';
import type { LocaleCode } from './regions';

/**
 * Shared i18n-js instance. Strings live in en/hi/ar JSON. `enableFallback`
 * means any missing key falls back to English so the UI never shows a key.
 */
export const i18n = new I18n({ en, hi, ar }, { defaultLocale: 'en', enableFallback: true });
i18n.locale = 'en';

/** Set the active locale. Callers (the region store) trigger re-render. */
export function setI18nLocale(locale: LocaleCode): void {
  i18n.locale = locale;
}

/** Raw translate — prefer the `useT()` hook in components so it re-renders. */
export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
