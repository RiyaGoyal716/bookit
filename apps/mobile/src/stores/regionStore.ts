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

/** App defaults to English everywhere; language is chosen separately in Settings. */
const DEFAULT_LANGUAGE: LocaleCode = 'en';

interface RegionState {
  /** Selected region (country) code, e.g. "GB". Drives currency + dial code. */
  regionCode: CountryCode;
  region: Region;
  currency: CurrencyCode;
  /** Dial code without "+" for the region, e.g. "44". */
  dialCode: string;
  /**
   * Active UI language — INDEPENDENT of the region. Defaults to English for
   * every region (like Uber / Urban Company); users opt into Hindi/Arabic in
   * Settings. This also drives text direction (Arabic → RTL).
   */
  language: LocaleCode;
  /** Alias of `language`, kept so existing i18n consumers keep working. */
  locale: LocaleCode;
  direction: Direction;
  /** Whether the user has explicitly chosen a region yet. */
  chosen: boolean;
  setRegion: (code: string) => void;
  setLanguage: (lang: LocaleCode) => void;
}

function dialFor(code: CountryCode): string {
  try {
    return getCountryCallingCode(code);
  } catch {
    return '';
  }
}

/** Only Arabic is right-to-left. Direction follows the LANGUAGE, not the region. */
function directionFor(lang: LocaleCode): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr';
}

/** Region-derived fields only — currency + dial code. Language is untouched. */
function regionFields(region: Region) {
  return {
    regionCode: region.code,
    region,
    currency: region.currency,
    dialCode: dialFor(region.code),
  };
}

/**
 * Region / language store (session-only).
 * - Setting the REGION updates currency + phone dial code app-wide.
 * - Setting the LANGUAGE updates translations + text direction app-wide.
 * The two are independent: choosing India keeps the UI in English until the
 * user picks Hindi in Settings. Dark-mode / theme preference lives in themeStore.
 */
export const useRegionStore = create<RegionState>((set) => {
  setI18nLocale(DEFAULT_LANGUAGE);
  return {
    ...regionFields(DEFAULT_REGION),
    language: DEFAULT_LANGUAGE,
    locale: DEFAULT_LANGUAGE,
    direction: directionFor(DEFAULT_LANGUAGE),
    chosen: false,
    setRegion: (code) => {
      const region = findRegion(code) ?? DEFAULT_REGION;
      set({ ...regionFields(region), chosen: true });
    },
    setLanguage: (lang) => {
      setI18nLocale(lang);
      set({ language: lang, locale: lang, direction: directionFor(lang) });
    },
  };
});
