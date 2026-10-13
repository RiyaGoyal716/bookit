import { formatMoney, findRegion, REGIONS } from '../src/i18n/regions';
import { useRegionStore } from '../src/stores/regionStore';

describe('formatMoney', () => {
  it('formats GBP with no conversion', () => {
    expect(formatMoney(18, 'GBP', { convert: false })).toBe('£18');
  });

  it('groups thousands with a comma', () => {
    expect(formatMoney(1234, 'USD', { convert: false })).toBe('$1,234');
    expect(formatMoney(1234567, 'GBP', { convert: false })).toBe('£1,234,567');
  });

  it('uses the correct symbol per currency', () => {
    expect(formatMoney(10, 'GBP', { convert: false })).toBe('£10');
    expect(formatMoney(10, 'USD', { convert: false })).toBe('$10');
    expect(formatMoney(10, 'AUD', { convert: false })).toBe('A$10');
    expect(formatMoney(10, 'INR', { convert: false })).toBe('₹10');
    expect(formatMoney(10, 'AED', { convert: false })).toBe('د.إ10');
  });

  it('converts a GBP base amount into the regional currency', () => {
    // 100 GBP -> INR at 105 = 10,500
    expect(formatMoney(100, 'INR')).toBe('₹10,500');
    // 100 GBP -> USD at 1.27 = 127
    expect(formatMoney(100, 'USD')).toBe('$127');
  });

  it('supports decimal places when requested', () => {
    expect(formatMoney(9.5, 'GBP', { convert: false, decimals: 2 })).toBe('£9.50');
  });
});

describe('region store', () => {
  beforeEach(() => {
    useRegionStore.setState({ chosen: false });
    useRegionStore.getState().setRegion('GB');
    useRegionStore.getState().setLanguage('en');
  });

  it('defaults to a known region', () => {
    expect(findRegion(useRegionStore.getState().regionCode)).toBeDefined();
  });

  it('switching region sets currency + dial code but keeps the language English', () => {
    useRegionStore.getState().setRegion('IN');
    const s = useRegionStore.getState();
    expect(s.currency).toBe('INR');
    expect(s.dialCode).toBe('91');
    // Language is independent of region — India still defaults to English.
    expect(s.locale).toBe('en');
    expect(s.direction).toBe('ltr');
    expect(s.chosen).toBe(true);
  });

  it('UAE sets AED but does not force Arabic (language stays English/LTR)', () => {
    useRegionStore.getState().setRegion('AE');
    const s = useRegionStore.getState();
    expect(s.currency).toBe('AED');
    expect(s.dialCode).toBe('971');
    expect(s.locale).toBe('en');
    expect(s.direction).toBe('ltr');
  });

  it('setLanguage changes locale + direction independently of the region', () => {
    useRegionStore.getState().setRegion('IN');
    useRegionStore.getState().setLanguage('hi');
    let s = useRegionStore.getState();
    expect(s.locale).toBe('hi');
    expect(s.currency).toBe('INR'); // region/currency unchanged by language

    useRegionStore.getState().setLanguage('ar');
    s = useRegionStore.getState();
    expect(s.locale).toBe('ar');
    expect(s.direction).toBe('rtl');

    useRegionStore.getState().setLanguage('en');
    s = useRegionStore.getState();
    expect(s.locale).toBe('en');
    expect(s.direction).toBe('ltr');
  });

  it('every region resolves a dial code', () => {
    for (const r of REGIONS) {
      useRegionStore.getState().setRegion(r.code);
      expect(useRegionStore.getState().dialCode.length).toBeGreaterThan(0);
    }
  });
});
