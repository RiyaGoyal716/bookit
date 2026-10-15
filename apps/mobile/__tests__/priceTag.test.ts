import { formatPrice } from '../src/components/ui/price';

describe('formatPrice', () => {
  it('formats minor units with two decimals and a symbol', () => {
    expect(formatPrice(6500)).toBe('£65.00');
    expect(formatPrice(999)).toBe('£9.99');
  });

  it('groups thousands', () => {
    expect(formatPrice(123456789)).toBe('£1,234,567.89');
  });

  it('handles zero and negatives', () => {
    expect(formatPrice(0)).toBe('£0.00');
    expect(formatPrice(-2500)).toBe('-£25.00');
  });

  it('respects a custom symbol and fraction digits', () => {
    expect(formatPrice(5000, { symbol: '$', fractionDigits: 0 })).toBe('$50');
    expect(formatPrice(150000, { symbol: '₹' })).toBe('₹1,500.00');
  });
});
