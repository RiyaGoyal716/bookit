import { create } from 'zustand';
import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

import {
  DEFAULT_REGION,
  findRegion,
  type CurrencyCode,
  type Direction,
  type LocaleCode,
  type Region,
} from '../i18n/regions';
import { setI18nLocale } from '../i18n/i18n';

interface RegionState {
  /** Selected region (country) code, e.g. "GB". */
  regionCode: CountryCode;
  region: Region;
  currency: CurrencyCode;
  locale: LocaleCode;
  direction: Direction;
  /** Dial code without "+" for the region, e.g. "44". */
  dialCode: string;
  /** Whether the user has explicitly chosen a region yet. */
  chosen: boolean;
  setRegion: (code: string) => void;
}

function dialFor(code: CountryCode): string {
  try {
    return getCountryCallingCode(code);
  } catch {
    return '';
  }
}

function derive(region: Region) {
  setI18nLocale(region.locale);
  return {
    regionCode: region.code,
    region,
    currency: region.currency,
    locale: region.locale,
    direction: region.direction,
    dialCode: dialFor(region.code),
  };
}

/**
 * Region / locale store (session-only). Setting the region updates the active
 * currency, locale (which drives i18n and translations), text direction and
 * phone dial code app-wide. Dark-mode / theme preference lives in themeStore.
 */
export const useRegionStore = create<RegionState>((set) => ({
  ...derive(DEFAULT_REGION),
  chosen: false,
  setRegion: (code) => {
    const region = findRegion(code) ?? DEFAULT_REGION;
    set({ ...derive(region), chosen: true });
  },
}));
