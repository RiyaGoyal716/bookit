import {
  parsePhoneNumberFromString,
  AsYouType,
  type CountryCode,
  type NumberType,
} from 'libphonenumber-js';

/** Number types we accept as "a mobile number". */
const MOBILE_TYPES: ReadonlySet<NumberType> = new Set<NumberType>([
  'MOBILE',
  'FIXED_LINE_OR_MOBILE',
]);

export interface PhoneValidation {
  /** True only for a valid, mobile-capable number. */
  valid: boolean;
  /** E.164 form (e.g. "+447700900123") when valid. */
  e164?: string;
  /** Resolved number type, when parseable. */
  type?: NumberType;
}

/**
 * Validate a national number for the given country as a MOBILE number.
 *
 * Uses libphonenumber-js: the number must parse, be valid for the country,
 * and have a mobile-capable type (MOBILE or FIXED_LINE_OR_MOBILE). Returns the
 * canonical E.164 string when valid.
 */
export function validateMobile(input: string, country: CountryCode): PhoneValidation {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) return { valid: false };

  const parsed = parsePhoneNumberFromString(digits, country);
  if (!parsed || !parsed.isValid()) return { valid: false };

  // Reject only KNOWN non-mobile types (e.g. a landline). Some countries —
  // India among them — don't report a type for valid mobiles, so an undefined
  // type is treated as mobile-capable rather than rejected.
  const type = parsed.getType();
  if (type && !MOBILE_TYPES.has(type)) {
    return { valid: false, type };
  }
  return { valid: true, e164: parsed.number, type };
}

/** Convenience boolean wrapper around {@link validateMobile}. */
export function isValidMobile(input: string, country: CountryCode): boolean {
  return validateMobile(input, country).valid;
}

/** Format a partial national number as the user types, for the given country. */
export function formatAsYouType(input: string, country: CountryCode): string {
  return new AsYouType(country).input(input);
}

/** Strip everything but digits — handy for enforcing max length. */
export function digitsOnly(input: string): string {
  return input.replace(/\D/g, '');
}
