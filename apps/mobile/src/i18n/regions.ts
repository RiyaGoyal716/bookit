import type { CountryCode } from 'libphonenumber-js';

import { flagEmoji } from '../lib/countries';

export type LocaleCode = 'en' | 'hi' | 'ar';
export type Direction = 'ltr' | 'rtl';
export type CurrencyCode = 'GBP' | 'INR' | 'AED' | 'USD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  /** Symbol placed before the amount (true) or after (false). */
  symbolBefore: boolean;
  /** Approximate FX rate from the GBP base the mock prices are stored in. */
  rateFromGBP: number;
  /** Whole-currency rounding step (e.g. round AED/INR to nearest 1). */
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  GBP: { code: 'GBP', symbol: '£', symbolBefore: true, rateFromGBP: 1 },
  USD: { code: 'USD', symbol: '$', symbolBefore: true, rateFromGBP: 1.27 },
  AUD: { code: 'AUD', symbol: 'A$', symbolBefore: true, rateFromGBP: 1.92 },
  INR: { code: 'INR', symbol: '₹', symbolBefore: true, rateFromGBP: 105 },
  AED: { code: 'AED', symbol: 'د.إ', symbolBefore: true, rateFromGBP: 4.66 },
};

export interface Region {
  /** ISO 3166-1 alpha-2 code — also the phone dial country. */
  code: CountryCode;
  name: string;
  currency: CurrencyCode;
  locale: LocaleCode;
  direction: Direction;
  /** Intl-style date format label shown in settings. */
  dateFormat: string;
}

/** Fully-localised regions the picker offers (searchable). */
export const REGIONS: Region[] = [
  {
    code: 'GB',
    name: 'United Kingdom',
    currency: 'GBP',
    locale: 'en',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    code: 'US',
    name: 'United States',
    currency: 'USD',
    locale: 'en',
    direction: 'ltr',
    dateFormat: 'MM/DD/YYYY',
  },
  {
    code: 'AU',
    name: 'Australia',
    currency: 'AUD',
    locale: 'en',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    code: 'IN',
    name: 'India',
    currency: 'INR',
    locale: 'hi',
    direction: 'ltr',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    currency: 'AED',
    locale: 'ar',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
  },
  {
    code: 'SA',
    name: 'Saudi Arabia',
    currency: 'AED',
    locale: 'ar',
    direction: 'rtl',
    dateFormat: 'DD/MM/YYYY',
  },
];

export const DEFAULT_REGION: Region = REGIONS[0];

export function regionFlag(code: string): string {
  return flagEmoji(code);
}

export function findRegion(code: string | undefined | null): Region | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return REGIONS.find((r) => r.code === upper);
}

/**
 * Format a GBP-base amount into the given currency: converts with the region
 * rate, rounds to a whole unit, groups thousands, and places the symbol. Pure
 * and side-effect free so it is unit-testable per region.
 */
export function formatMoney(
  amountGBP: number,
  currency: CurrencyCode,
  opts: { convert?: boolean; decimals?: number } = {},
): string {
  const { convert = true, decimals = 0 } = opts;
  const cfg = CURRENCIES[currency];
  const value = convert ? amountGBP * cfg.rateFromGBP : amountGBP;
  const fixed = value.toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const number = frac ? `${grouped}.${frac}` : grouped;
  return cfg.symbolBefore ? `${cfg.symbol}${number}` : `${number}${cfg.symbol}`;
}
