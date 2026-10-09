import { validateMobile, isValidMobile, formatAsYouType, digitsOnly } from '../src/lib/phone';

describe('validateMobile', () => {
  it('accepts valid GB mobile numbers and returns E.164', () => {
    const r = validateMobile('7400123456', 'GB');
    expect(r.valid).toBe(true);
    expect(r.e164).toBe('+447400123456');
  });

  it('accepts valid IN mobile numbers (undefined type treated as mobile)', () => {
    const r = validateMobile('9876543210', 'IN');
    expect(r.valid).toBe(true);
    expect(r.e164).toBe('+919876543210');
  });

  it('accepts valid US mobile numbers and returns E.164', () => {
    const r = validateMobile('2025550123', 'US');
    expect(r.valid).toBe(true);
    expect(r.e164).toBe('+12025550123');
  });

  it('rejects too-short numbers for GB / IN / US', () => {
    expect(validateMobile('12345', 'GB').valid).toBe(false);
    expect(validateMobile('12345', 'IN').valid).toBe(false);
    expect(validateMobile('12345', 'US').valid).toBe(false);
  });

  it('rejects an empty input', () => {
    expect(validateMobile('', 'GB').valid).toBe(false);
  });

  it('rejects a known GB landline (non-mobile type)', () => {
    const r = validateMobile('2079460958', 'GB');
    expect(r.valid).toBe(false);
  });

  it('enforces the 10-digit length for GB/IN/US (11 digits is invalid)', () => {
    expect(isValidMobile('74001234567', 'GB')).toBe(false);
    expect(isValidMobile('98765432101', 'IN')).toBe(false);
    expect(isValidMobile('20255501234', 'US')).toBe(false);
  });
});

describe('formatAsYouType', () => {
  it('preserves digits while formatting for the selected country', () => {
    const formatted = formatAsYouType('2025550123', 'US');
    expect(digitsOnly(formatted)).toBe('2025550123');
    // US formatting groups into an area code.
    expect(formatted).toContain('(202)');
  });
});

describe('digitsOnly', () => {
  it('strips non-digit characters', () => {
    expect(digitsOnly('+44 7400 123-456')).toBe('447400123456');
  });
});
