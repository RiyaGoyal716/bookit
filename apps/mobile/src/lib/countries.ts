import { getCountryCallingCode, type CountryCode } from 'libphonenumber-js';

/**
 * A curated country entry for the international phone picker.
 *
 * `dialCode` and `flag` are derived so the dataset stays small and correct:
 * the dial code comes from libphonenumber-js and the flag emoji is computed
 * from the ISO country code's regional-indicator letters.
 */
export interface Country {
  /** ISO 3166-1 alpha-2 code, e.g. "GB". */
  code: CountryCode;
  /** Display name, e.g. "United Kingdom". */
  name: string;
  /** Example national-number length in digits (also used as input max). */
  nationalLength: number;
}

/** Curated list — GB, IN, US first, then ~30 common countries alphabetically. */
const RAW: Country[] = [
  { code: 'GB', name: 'United Kingdom', nationalLength: 10 },
  { code: 'IN', name: 'India', nationalLength: 10 },
  { code: 'US', name: 'United States', nationalLength: 10 },
  { code: 'AE', name: 'United Arab Emirates', nationalLength: 9 },
  { code: 'AR', name: 'Argentina', nationalLength: 10 },
  { code: 'AU', name: 'Australia', nationalLength: 9 },
  { code: 'BD', name: 'Bangladesh', nationalLength: 10 },
  { code: 'BE', name: 'Belgium', nationalLength: 9 },
  { code: 'BR', name: 'Brazil', nationalLength: 11 },
  { code: 'CA', name: 'Canada', nationalLength: 10 },
  { code: 'CH', name: 'Switzerland', nationalLength: 9 },
  { code: 'CN', name: 'China', nationalLength: 11 },
  { code: 'DE', name: 'Germany', nationalLength: 11 },
  { code: 'DK', name: 'Denmark', nationalLength: 8 },
  { code: 'ES', name: 'Spain', nationalLength: 9 },
  { code: 'FR', name: 'France', nationalLength: 9 },
  { code: 'IE', name: 'Ireland', nationalLength: 9 },
  { code: 'IT', name: 'Italy', nationalLength: 10 },
  { code: 'JP', name: 'Japan', nationalLength: 10 },
  { code: 'KE', name: 'Kenya', nationalLength: 9 },
  { code: 'KR', name: 'South Korea', nationalLength: 10 },
  { code: 'MX', name: 'Mexico', nationalLength: 10 },
  { code: 'MY', name: 'Malaysia', nationalLength: 9 },
  { code: 'NG', name: 'Nigeria', nationalLength: 10 },
  { code: 'NL', name: 'Netherlands', nationalLength: 9 },
  { code: 'NO', name: 'Norway', nationalLength: 8 },
  { code: 'NZ', name: 'New Zealand', nationalLength: 9 },
  { code: 'PK', name: 'Pakistan', nationalLength: 10 },
  { code: 'PL', name: 'Poland', nationalLength: 9 },
  { code: 'PT', name: 'Portugal', nationalLength: 9 },
  { code: 'SA', name: 'Saudi Arabia', nationalLength: 9 },
  { code: 'SE', name: 'Sweden', nationalLength: 9 },
  { code: 'SG', name: 'Singapore', nationalLength: 8 },
  { code: 'TH', name: 'Thailand', nationalLength: 9 },
  { code: 'ZA', name: 'South Africa', nationalLength: 9 },
];

/** Compute a flag emoji from a 2-letter ISO country code. */
export function flagEmoji(code: string): string {
  const base = 0x1f1e6;
  const chars = code
    .toUpperCase()
    .split('')
    .map((ch) => base + (ch.charCodeAt(0) - 65));
  return String.fromCodePoint(...chars);
}

/** The dial code (without "+") for an ISO country code, e.g. "44". */
export function dialCodeFor(code: CountryCode): string {
  try {
    return getCountryCallingCode(code);
  } catch {
    return '';
  }
}

export const COUNTRIES: Country[] = RAW;

export function findCountry(code: string | undefined | null): Country | undefined {
  if (!code) return undefined;
  const upper = code.toUpperCase();
  return COUNTRIES.find((c) => c.code === upper);
}

/** Resolve a device region code to a supported country, falling back to GB. */
export function resolveDefaultCountry(regionCode: string | undefined | null): Country {
  return findCountry(regionCode) ?? findCountry('GB')!;
}
