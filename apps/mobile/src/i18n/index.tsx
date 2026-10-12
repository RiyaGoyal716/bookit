import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';

import { useRegionStore } from '../stores/regionStore';
import { i18n } from './i18n';
import { formatMoney, type Direction } from './regions';

export { i18n, t } from './i18n';
export {
  REGIONS,
  CURRENCIES,
  DEFAULT_REGION,
  findRegion,
  regionFlag,
  formatMoney,
} from './regions';
export type { Region, CurrencyCode, CurrencyConfig, LocaleCode, Direction } from './regions';

/**
 * Translate hook. Subscribes to the active locale so components re-render when
 * the region (and therefore language) changes. Use everywhere instead of the
 * raw `t()` import.
 */
export function useT(): (key: string, options?: Record<string, unknown>) => string {
  // Subscribe to the active locale so the component re-renders on change. The
  // region store keeps `i18n.locale` in sync (via setI18nLocale), so we only
  // read the value here to track it, then translate against the live instance.
  const locale = useRegionStore((s) => s.locale);
  return useMemo(
    () =>
      function translate(key: string, options?: Record<string, unknown>) {
        void locale;
        return i18n.t(key, options);
      },
    [locale],
  );
}

/**
 * Currency formatter hook bound to the active region. Every price in the app
 * goes through this, so changing region changes the symbol/amount app-wide.
 */
export function useMoney(): (
  amountGBP: number,
  opts?: { convert?: boolean; decimals?: number },
) => string {
  const currency = useRegionStore((s) => s.currency);
  return useMemo(
    () => (amountGBP: number, opts?: { convert?: boolean; decimals?: number }) =>
      formatMoney(amountGBP, currency, opts),
    [currency],
  );
}

const DirectionContext = createContext<Direction | null>(null);

/**
 * Provides the active writing direction from the region store. Expo Go can't
 * reliably use I18nManager.forceRTL, so direction is handled at the component
 * level: consumers call `useDirection()` and flip flexDirection / textAlign /
 * horizontal padding themselves.
 */
export function DirectionProvider({ children }: PropsWithChildren) {
  const direction = useRegionStore((s) => s.direction);
  return <DirectionContext.Provider value={direction}>{children}</DirectionContext.Provider>;
}

/** Active direction ('ltr' | 'rtl'). Falls back to the store without a provider. */
export function useDirection(): Direction {
  const ctx = useContext(DirectionContext);
  const fromStore = useRegionStore((s) => s.direction);
  return ctx ?? fromStore;
}

/** True when the active direction is right-to-left (Arabic). */
export function useIsRTL(): boolean {
  return useDirection() === 'rtl';
}

/**
 * Direction-aware style helpers. Flip a row and text alignment to match the
 * active writing direction without touching I18nManager.
 */
export function useDirectionalStyles() {
  const rtl = useIsRTL();
  return useMemo(
    () => ({
      rtl,
      row: { flexDirection: rtl ? ('row-reverse' as const) : ('row' as const) },
      textAlign: { textAlign: rtl ? ('right' as const) : ('left' as const) },
      writingDirection: rtl ? ('rtl' as const) : ('ltr' as const),
      /** Mirror a horizontal value (e.g. a leading icon offset). */
      start: (value: number) => (rtl ? { right: value } : { left: value }),
      end: (value: number) => (rtl ? { left: value } : { right: value }),
    }),
    [rtl],
  );
}
